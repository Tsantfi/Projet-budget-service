package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "recensement_logement",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_recensement_logement_soa_annee",
        columnNames = {
            "soa_id",
            "annee"
        }
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecensementLogement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soa_id", nullable = false)
    private SoaCode soa;

    @Column(name = "annee", nullable = false)
    private Integer annee;

    // INFORMATIONS GENERALES

    @Column(name = "ministere", length = 255)
    private String ministere;

    @Column(name = "niveau", length = 100)
    private String niveau;

    @Column(name = "direction_service", length = 255)
    private String directionService;

    @Column(name = "objet", length = 500)
    private String objet;

    @Column(name = "nom", length = 100)
    private String nom;

    @Column(name = "prenom", length = 100)
    private String prenom;

    @Column(name = "fonction", length = 255)
    private String fonction;

    @Column(name = "telephone", length = 50)
    private String telephone;

    @Column(name = "email", length = 255)
    private String email;

    // SUIVI

    @Column(name = "date_recensement")
    private LocalDate dateRecensement;

    @Column(name = "valide", nullable = false)
    @Builder.Default
    private Boolean valide = false;

    // LIGNES

    @OneToMany(
        mappedBy = "recensement",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<RecensementLogementLigne> logements =
            new ArrayList<>();
    
    @Column(name = "objet_titre_foncier", length = 500)
    private String objetTitreFoncier;

}