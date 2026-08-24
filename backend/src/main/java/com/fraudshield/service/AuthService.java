package com.fraudshield.service;

import com.fraudshield.dto.JwtResponse;
import com.fraudshield.dto.LoginRequest;
import com.fraudshield.dto.SignupRequest;
import com.fraudshield.entity.Role;
import com.fraudshield.entity.User;
import com.fraudshield.entity.UserStatus;
import com.fraudshield.repository.UserRepository;
import com.fraudshield.security.JwtUtils;
import com.fraudshield.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditService auditService;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found with username " + loginRequest.getUsername()));

        if (!encoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Error: Invalid credentials");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("ROLE_USER");

        auditService.logAction("USER_LOGIN", userDetails.getUsername(), "User:" + userDetails.getUsername(), "Successful login", "127.0.0.1");

        return JwtResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .fullName(userDetails.getFullName())
                .role(role)
                .build();
    }

    public User registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        Role userRole = Role.ROLE_USER;
        if (signUpRequest.getRole() != null && signUpRequest.getRole().equalsIgnoreCase("ROLE_ADMIN")) {
            userRole = Role.ROLE_ADMIN;
        }

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .fullName(signUpRequest.getFullName())
                .role(userRole)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        auditService.logAction("USER_REGISTER", savedUser.getUsername(), "User:" + savedUser.getUsername(), "New account registered", "127.0.0.1");
        return savedUser;
    }
}
