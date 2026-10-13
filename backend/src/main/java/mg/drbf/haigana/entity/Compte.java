package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "compte")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Compte {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String immatricule;

    @Column(name = "mot_passe", nullable = false)
    // Sécurité : permet de recevoir le mot de passe mais ne l'affiche jamais dans le JSON retourné
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String motPasse;

    private String nom;
    private String prenom;
    private String email;
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    private boolean actif = true;
}
