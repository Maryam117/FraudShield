package com.fraudshield.service;

import com.fraudshield.dto.UserRequest;
import com.fraudshield.entity.Role;
import com.fraudshield.entity.User;
import com.fraudshield.entity.UserStatus;
import com.fraudshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private AuditService auditService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found"));
    }

    @Transactional
    public User createUser(UserRequest request, String performedBy) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new RuntimeException("Error: Password is required for new user!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(encoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_USER)
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        auditService.logAction(
                "USER_CREATE",
                performedBy,
                "User:" + savedUser.getUsername(),
                "Admin created a new user with role " + savedUser.getRole(),
                "127.0.0.1"
        );

        return savedUser;
    }

    @Transactional
    public User updateUser(Long id, UserRequest request, String performedBy) {
        User user = getUserById(id);

        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(encoder.encode(request.getPassword()));
        }

        User updatedUser = userRepository.save(user);

        auditService.logAction(
                "USER_UPDATE",
                performedBy,
                "User:" + updatedUser.getUsername(),
                "Admin updated user details/status",
                "127.0.0.1"
        );

        return updatedUser;
    }

    @Transactional
    public User updateUserProfile(Long userId, com.fraudshield.dto.ProfileUpdateRequest request) {
        User user = getUserById(userId);

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            if (request.getCurrentPassword() == null || !encoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Error: Incorrect current password");
            }
            user.setPassword(encoder.encode(request.getNewPassword()));
        }

        User updated = userRepository.save(user);

        auditService.logAction(
                "PROFILE_UPDATE",
                user.getUsername(),
                "User:" + user.getUsername(),
                "User updated profile details / password",
                "127.0.0.1"
        );

        return updated;
    }

    @Transactional
    public void deleteUser(Long id, String performedBy) {
        User user = getUserById(id);

        // Optional: Ensure admin doesn't delete themselves
        if (user.getUsername().equals(performedBy)) {
            throw new RuntimeException("Error: Cannot delete your own account");
        }

        userRepository.delete(user);

        auditService.logAction(
                "USER_DELETE",
                performedBy,
                "User:" + user.getUsername(),
                "Admin deleted the user",
                "127.0.0.1"
        );
    }
}
