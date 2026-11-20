package com.contentcreator.controller;

import com.contentcreator.dto.ModuleStatus;
import com.contentcreator.service.ModuleRegistryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleRegistryController {

    private final ModuleRegistryService moduleRegistryService;

    @GetMapping
    public ResponseEntity<List<ModuleStatus>> listModules() {
        return ResponseEntity.ok(moduleRegistryService.status());
    }
}
