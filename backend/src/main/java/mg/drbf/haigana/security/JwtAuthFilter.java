package mg.drbf.haigana.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CompteUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
    
        // PAS DE TOKEN
    

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        try {

            //// EXTRACTION IMMATRICULE
            // =================================================

            String immatricule =
                    jwtService.extractUsername(jwt);

            if (immatricule == null ||
                    immatricule.isBlank()) {


                SecurityContextHolder.clearContext();

                filterChain.doFilter(request, response);
                return;
            }

            //// SI DEJA AUTHENTIFIE
            // =================================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() != null) {

                System.out.println(
                        " Déjà authentifié : "
                        + SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getAuthorities()
                );

                filterChain.doFilter(request, response);
                return;
            }

            //// CHARGEMENT COMPTE
            // =================================================

            UserDetails userDetails =
                    userDetailsService
                            .loadUserByUsername(immatricule);

            //// VALIDATION JWT
            // =================================================

            boolean tokenValide =
                    jwtService.isTokenValid(
                            jwt,
                            userDetails
                    );


            if (!tokenValide) {


                SecurityContextHolder.clearContext();

                filterChain.doFilter(request, response);
                return;
            }

            //// CREATION AUTHENTIFICATION

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authToken.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authToken);

        } catch (Exception e) {



            e.printStackTrace();

            SecurityContextHolder.clearContext();
        }


        filterChain.doFilter(request, response);
    }
}