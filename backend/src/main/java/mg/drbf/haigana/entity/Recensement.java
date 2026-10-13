package mg.drbf.haigana.entity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "recensement",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_recensement_annee_soa",
                        columnNames = {"annee", "soa_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recensement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer annee;

    @Column(nullable = false)
    private String ministere;

    @Column(nullable = false)
    private String niveau;

    @Column(nullable = false)
    private String directionService;
    
    @Column(nullable = true)
    private String directionServiceRecensement;

    @Column(nullable = false)
    private String nomPrenomResponsable;

    @Column(nullable = false)
    private String fonctionResponsable;

    @Column(nullable = false)
    private String telephoneResponsable;

    @Column(nullable = false)
    private String emailResponsable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soa_id", nullable = false)
    private SoaCode soa;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean valide = false;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String objet;

    @Column(nullable = false)
    private String detenteurEffectif;

    @Builder.Default
    @OneToMany(
            mappedBy = "recensement",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    
    private List<RecensementVehicule> vehicules =
            new ArrayList<>();
}
