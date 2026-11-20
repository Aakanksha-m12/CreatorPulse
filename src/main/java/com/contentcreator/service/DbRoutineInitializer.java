package com.contentcreator.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Creates MySQL stored procedures, functions and triggers for the
 * 6-module semester submission. Runs idempotently on every boot.
 *
 * Procedures : sp_record_analysis, sp_user_recent_activity, sp_activate_subscription
 * Functions  : fn_growth_percent, fn_is_premium
 * Triggers   : trg_analysis_clamp_score (score clamp only; subscription
 *              expiry lives in app code - MySQL 1442 forbids self-updates)
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class DbRoutineInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) {
        try {
            dropIfExists("PROCEDURE", "sp_record_analysis");
            jdbc.execute("""
                CREATE PROCEDURE sp_record_analysis(
                    IN p_user_id BIGINT, IN p_type VARCHAR(20),
                    IN p_summary TEXT, IN p_score INT, IN p_details MEDIUMTEXT)
                BEGIN
                    INSERT INTO analysis_record(user_id, type, input_summary, score, details, created_at)
                    VALUES (p_user_id, p_type, p_summary,
                        GREATEST(0, LEAST(100, COALESCE(p_score, 0))),
                        p_details, NOW());
                    SELECT LAST_INSERT_ID() AS id;
                END""");

            dropIfExists("PROCEDURE", "sp_user_recent_activity");
            jdbc.execute("""
                CREATE PROCEDURE sp_user_recent_activity(IN p_user_id BIGINT, IN p_limit INT)
                BEGIN
                    (SELECT a.id AS ref_id, a.type AS kind, a.input_summary AS title,
                        a.score AS score, a.created_at AS created_on, 'analysis' AS source
                     FROM analysis_record a WHERE a.user_id = p_user_id)
                    UNION ALL
                    (SELECT c.id AS ref_id, 'UPLOAD' AS kind, c.original_filename AS title,
                        NULL AS score, c.created_at AS created_on, 'upload' AS source
                     FROM content_upload c WHERE c.user_id = p_user_id)
                    ORDER BY created_on DESC LIMIT p_limit;
                END""");

            dropIfExists("PROCEDURE", "sp_activate_subscription");
            jdbc.execute("""
                CREATE PROCEDURE sp_activate_subscription(
                    IN p_user_id BIGINT, IN p_plan VARCHAR(20),
                    IN p_payment_id VARCHAR(100), IN p_order_id VARCHAR(100),
                    IN p_months INT)
                BEGIN
                    DECLARE v_exists BIGINT DEFAULT 0;
                    SELECT COUNT(*) INTO v_exists FROM subscription
                        WHERE razorpay_payment_id = p_payment_id AND p_payment_id IS NOT NULL AND p_payment_id <> '';
                    IF v_exists = 0 THEN
                        UPDATE subscription SET status = 'EXPIRED'
                            WHERE user_id = p_user_id AND status = 'ACTIVE';
                        INSERT INTO subscription(user_id, plan, status, razorpay_order_id,
                                razorpay_payment_id, current_period_end, created_at, updated_at)
                            VALUES (p_user_id, p_plan, 'ACTIVE', p_order_id, p_payment_id,
                                DATE_ADD(NOW(), INTERVAL p_months MONTH), NOW(), NOW())
                            ON DUPLICATE KEY UPDATE plan = VALUES(plan), status = 'ACTIVE',
                                razorpay_order_id = VALUES(razorpay_order_id),
                                razorpay_payment_id = VALUES(razorpay_payment_id),
                                current_period_end = VALUES(current_period_end), updated_at = NOW();
                    END IF;
                    SELECT * FROM subscription WHERE user_id = p_user_id;
                END""");

            dropIfExists("FUNCTION", "fn_growth_percent");
            jdbc.execute("""
                CREATE FUNCTION fn_growth_percent(p_old DOUBLE, p_new DOUBLE)
                RETURNS DOUBLE DETERMINISTIC
                BEGIN
                    IF p_old IS NULL OR p_old = 0 THEN
                        IF p_new IS NULL OR p_new = 0 THEN RETURN 0; ELSE RETURN 100; END IF;
                    END IF;
                    RETURN ROUND(((p_new - p_old) / ABS(p_old)) * 100, 2);
                END""");

            dropIfExists("FUNCTION", "fn_is_premium");
            jdbc.execute("""
                CREATE FUNCTION fn_is_premium(p_user_id BIGINT)
                RETURNS TINYINT(1) DETERMINISTIC
                BEGIN
                    DECLARE v_count INT DEFAULT 0;
                    SELECT COUNT(*) INTO v_count FROM subscription
                        WHERE user_id = p_user_id AND status = 'ACTIVE'
                        AND current_period_end IS NOT NULL AND current_period_end > NOW();
                    RETURN v_count > 0;
                END""");

            createTrigger("trg_analysis_clamp_score",
                "BEFORE INSERT ON analysis_record FOR EACH ROW " +
                "BEGIN SET NEW.score = GREATEST(0, LEAST(100, COALESCE(NEW.score, 0))); " +
                "IF NEW.created_at IS NULL THEN SET NEW.created_at = NOW(); END IF; END");

            // REMOVED trg_subscription_expire_old: MySQL error 1442 forbids a
            // trigger from modifying its own table. Expiry of old ACTIVE rows
            // is handled in SubscriptionService + sp_activate_subscription.
            try { jdbc.execute("DROP TRIGGER IF EXISTS trg_subscription_expire_old"); }
            catch (Exception ignored) {}

            log.info("DB routines (procedures/functions/triggers) initialised");
        } catch (Exception ex) {
            log.warn("DB routine init skipped/partial (MySQL may restrict): {}", ex.getMessage());
        }
    }

    private void dropIfExists(String kind, String name) {
        try { jdbc.execute("DROP " + kind + " IF EXISTS " + name); }
        catch (Exception ignored) {}
    }

    private void createTrigger(String name, String body) {
        try { jdbc.execute("DROP TRIGGER IF EXISTS " + name); } catch (Exception ignored) {}
        try { jdbc.execute("CREATE TRIGGER " + name + " " + body); }
        catch (Exception ex) { log.warn("Trigger {} not created: {}", name, ex.getMessage()); }
    }
}
