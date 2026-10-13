package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Compte;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.CompteRepository;
import mg.drbf.haigana.security.CompteUserDetails;
import mg.drbf.haigana.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comptes")
@RequiredArgsConstructor
public class CompteController {

    private final CompteRepository compteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Reserve a l'administrateur (voir SecurityConfig : /api/admin/**)
    @GetMapping("/admin/liste")
    public List<Compte> findAll() {
        return compteRepository.findAll();
    }

    @PostMapping("/admin/creer")
    public Compte creer(@RequestBody Compte compte) {
        compte.setMotPasse(passwordEncoder.encode(compte.getMotPasse()));
        return compteRepository.save(compte);
    }

    // Mise a jour du profil de l'utilisateur connecte.
    // Le role n'est jamais modifiable ici. L'immatricule (identifiant de connexion)
    // peut etre change par l'utilisateur ; un nouveau token est alors renvoye
    // puisque l'ancien token (base sur l'ancien immatricule) devient invalide.
    @PutMapping("/profil/{immatricule}")
    public ProfilUpdateResponse updateProfil(@PathVariable String immatricule, @RequestBody Compte donnees) {
        Compte compte = compteRepository.findByImmatricule(immatricule)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable"));

        compte.setNom(donnees.getNom());
        compte.setPrenom(donnees.getPrenom());
        compte.setEmail(donnees.getEmail());
        compte.setTelephone(donnees.getTelephone());
        // compte.getRole() reste inchange volontairement.

        boolean immatriculeChange = donnees.getImmatricule() != null
                && !donnees.getImmatricule().isBlank()
                && !donnees.getImmatricule().equals(compte.getImmatricule());

        if (immatriculeChange) {
            if (compteRepository.existsByImmatricule(donnees.getImmatricule())) {
                throw new IllegalStateException("Cet immatricule est deja utilise par un autre compte");
            }
            compte.setImmatricule(donnees.getImmatricule());
        }

        if (donnees.getMotPasse() != null && !donnees.getMotPasse().isBlank()) {
            compte.setMotPasse(passwordEncoder.encode(donnees.getMotPasse()));
        }

        Compte saved = compteRepository.save(compte);

        // Nouveau token systematiquement renvoye : necessaire si l'immatricule a change,
        // et inoffensif sinon (le frontend remplace simplement l'ancien par le meme).
        String token = jwtService.generateToken(new CompteUserDetails(saved));

        return new ProfilUpdateResponse(
                token, saved.getImmatricule(), saved.getNom(), saved.getPrenom(),
                saved.getEmail(), saved.getTelephone(), saved.getRole().name());
    }

    public record ProfilUpdateResponse(
            String token, String immatricule, String nom, String prenom,
            String email, String telephone, String role) {}
}