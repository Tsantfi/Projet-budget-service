package mg.drbf.haigana.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.LoginRequest;
import mg.drbf.haigana.dto.LoginResponse;
import mg.drbf.haigana.entity.Compte;
import mg.drbf.haigana.repository.CompteRepository;
import mg.drbf.haigana.security.CompteUserDetails;
import mg.drbf.haigana.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CompteRepository compteRepository;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.immatricule(), request.motPasse())
        );

        Compte compte = compteRepository.findByImmatricule(request.immatricule())
                .orElseThrow(() -> new IllegalStateException("Compte introuvable"));

        String token = jwtService.generateToken(new CompteUserDetails(compte));

        return new LoginResponse(token, compte.getImmatricule(), compte.getNom(),
                compte.getPrenom(), compte.getRole().name());
    }

    @GetMapping("/me")
    public Compte me(@RequestParam String immatricule) {
        return compteRepository.findByImmatricule(immatricule)
                .orElseThrow(() -> new IllegalStateException("Compte introuvable"));
    }
}
