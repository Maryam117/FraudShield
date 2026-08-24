package com.fraudshield.config;

import com.fraudshield.entity.FraudRule;
import com.fraudshield.entity.Role;
import com.fraudshield.entity.User;
import com.fraudshield.entity.UserStatus;
import com.fraudshield.repository.FraudRuleRepository;
import com.fraudshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FraudRuleRepository ruleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedRules();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@fraudshield.io")
                    .fullName("System Administrator")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("user1")) {
            User user1 = User.builder()
                    .username("user1")
                    .email("john.doe@example.com")
                    .fullName("John Doe")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ROLE_USER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(user1);
        }

        if (!userRepository.existsByUsername("user2")) {
            User user2 = User.builder()
                    .username("user2")
                    .email("sarah.connor@example.com")
                    .fullName("Sarah Connor")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ROLE_USER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(user2);
        }
    }

    private void seedRules() {
        if (ruleRepository.count() == 0) {
            ruleRepository.save(FraudRule.builder()
                    .ruleCode("HIGH_AMOUNT")
                    .ruleName("High Transaction Amount Rule")
                    .description("Flags transactions exceeding high value threshold ($10,000)")
                    .thresholdValue(new BigDecimal("10000.00"))
                    .riskPoints(45)
                    .isActive(true)
                    .build());

            ruleRepository.save(FraudRule.builder()
                    .ruleCode("VELOCITY_SPIKE")
                    .ruleName("High Frequency Velocity Rule")
                    .description("Detects rapid repeated transfers from same account in short window (>3 in 1 min)")
                    .thresholdValue(new BigDecimal("3.00"))
                    .riskPoints(35)
                    .isActive(true)
                    .build());

            ruleRepository.save(FraudRule.builder()
                    .ruleCode("GEO_ANOMALY")
                    .ruleName("Geographic & IP Blacklist Anomaly")
                    .description("Detects logins or payments originating from high-risk IP ranges or flagged regions")
                    .thresholdValue(new BigDecimal("1.00"))
                    .riskPoints(30)
                    .isActive(true)
                    .build());

            ruleRepository.save(FraudRule.builder()
                    .ruleCode("HIGH_RISK_MERCHANT")
                    .ruleName("High Risk Merchant Category Code")
                    .description("Flags purchases involving high-risk categories (Crypto, Gambling, Offshore Wire)")
                    .thresholdValue(new BigDecimal("1.00"))
                    .riskPoints(25)
                    .isActive(true)
                    .build());
        }
    }
}
