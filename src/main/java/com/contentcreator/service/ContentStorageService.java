package com.contentcreator.service;

import com.contentcreator.entity.ContentUpload;
import com.contentcreator.entity.User;
import com.contentcreator.repository.ContentUploadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContentStorageService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private final ContentUploadRepository uploadRepository;

    public ContentUpload store(MultipartFile file, User user) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided. Attach a file in the 'file' form field.");
        }

        String originalName = Paths.get(file.getOriginalFilename()).getFileName().toString();
        String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");

        Path userDir = Paths.get(uploadDir).resolve(String.valueOf(user.getId())).toAbsolutePath().normalize();
        String storedName = UUID.randomUUID() + "-" + safeName;

        try {
            Files.createDirectories(userDir);
            Path target = userDir.resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            ContentUpload upload = ContentUpload.builder()
                    .user(user)
                    .originalFilename(safeName)
                    .storedPath(target.toString())
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .build();

            return uploadRepository.save(upload);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store uploaded file: " + ex.getMessage());
        }
    }

    public Resource loadAsResource(ContentUpload upload) {
        try {
            Path path = Paths.get(upload.getStoredPath());
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("Stored file not found on disk");
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Stored file path is invalid");
        }
    }

    @Transactional
    public void delete(ContentUpload upload) {
        try {
            Files.deleteIfExists(Paths.get(upload.getStoredPath()));
        } catch (IOException ignored) {
        }
        uploadRepository.delete(upload);
    }
}
