package mg.drbf.haigana.config;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.security.CompteUserDetailsService;
import mg.drbf.haigana.security.JwtAuthFilter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CompteUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Value("${haigana.cors.allowed-origins}")
    private String allowedOrigins;

    // PASSWORD ENCODER

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AUTHENTICATION PROVIDER

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    // AUTHENTICATION MANAGER

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {

        return config.getAuthenticationManager();
    }

    // SECURITY FILTER CHAIN

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
            throws Exception {
        http
            // CSRF
            .csrf(csrf -> csrf.disable())

            // CORS

            .cors(cors ->
                    cors.configurationSource(corsConfigurationSource())
            )

            // SESSION

            .sessionManagement(sm ->
                    sm.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            // AUTORISATIONS

            .authorizeHttpRequests(auth -> auth

                // AUTHENTIFICATION

                .requestMatchers("/api/auth/**")
                .permitAll()

                // REFERENCES PUBLIQUES

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/reference/**"
                )
                .permitAll()

                // CONSULTATION
                // ADMIN + MODIFICATEUR + CONSULTANT

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/**"
                )
                .hasAnyRole(
                        "ADMINISTRATEUR",
                        "MODIFICATEUR",
                        "CONSULTANT"
                )

                // CONTROLES
                // Création : ADMIN uniquement

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/controles/**"
                )
                .hasRole("ADMINISTRATEUR")

                // CONSTATATIONS
                // Création : ADMIN uniquement

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/constatations/**"
                )
                .hasRole("ADMINISTRATEUR")

                // PROCES-VERBAUX
                // Création : ADMIN uniquement

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/proces-verbaux/**"
                )
                .hasRole("ADMINISTRATEUR")

                // BONS DE COMMANDE
                // Création : ADMIN uniquement

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/bons-commande/**"
                )
                .hasRole("ADMINISTRATEUR")

                // CREATION GENERALE
                // ADMIN + MODIFICATEUR

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/**"
                )
                .hasAnyRole(
                        "ADMINISTRATEUR",
                        "MODIFICATEUR"
                )

                // MODIFICATION
                // ADMIN + MODIFICATEUR

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/**"
                )
                .hasAnyRole(
                        "ADMINISTRATEUR",
                        "MODIFICATEUR"
                )

                .requestMatchers(
                        HttpMethod.PATCH,
                        "/api/**"
                )
                .hasAnyRole(
                        "ADMINISTRATEUR",
                        "MODIFICATEUR"
                )

                // SUPPRESSION
                // ADMIN UNIQUEMENT

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/**"
                )
                .hasRole("ADMINISTRATEUR")

                // TOUT LE RESTE
                // TOUJOURS EN DERNIER

                .anyRequest()
                .authenticated()
            )
            // AUTHENTICATION PROVIDER

            .authenticationProvider(authenticationProvider())
            // JWT FILTER
            .addFilterBefore(
                    jwtAuthFilter,
                    UsernamePasswordAuthenticationFilter.class
            );
        return http.build();
    }
    // CORS CONFIGURATION
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(allowedOrigins.split(","))
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS",
                        "PATCH"
                )
        );
        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}