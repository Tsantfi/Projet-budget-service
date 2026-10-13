package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "logement_entree")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementEntree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // LOGEMENT

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "logement_id",
        nullable = false,
        unique = true
    )
    private Logement logement;

    // INFORMATIONS GENERALES

    @Column(name = "reference", length = 255)
    private String reference;

    @Column(name = "date_entree", nullable = false)
    private LocalDate dateEntree;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private TypePriseEnCharge type;

    @Column(name = "piece_justificative_url", length = 500)
    private String pieceJustificativeUrl;

    // ACHAT

    @Column(name = "ordre_entree", length = 255)
    private String ordreEntree;

    @Column(name = "facture", length = 255)
    private String facture;

    // DON

    @Column(name = "pv_evaluation", length = 255)
    private String pvEvaluation;

    // AFFECTATION - PERSONNE SORTIE

    @Column(name = "nom_personne_sortie", length = 255)
    private String nomPersonneSortie;

    @Column(name = "cin_personne_sortie", length = 100)
    private String cinPersonneSortie;

    @Column(name = "service_sortie", length = 255)
    private String serviceSortie;

    // AFFECTATION - PERSONNE ENTREE

    @Column(name = "nom_personne_entree", length = 255)
    private String nomPersonneEntree;

    @Column(name = "cin_personne_entree", length = 100)
    private String cinPersonneEntree;

    @Column(name = "service_entree", length = 255)
    private String serviceEntree;
}
