package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "entree")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // INFORMATIONS DE L'ENTREE
    // ==========================================

    private String reference;

    private LocalDate dateEntree;

    @Enumerated(EnumType.STRING)
    private TypePriseEnCharge type;

    // ==========================================
    // PERSONNE QUI FAIT L'ORDRE DE SORTIE
    // ==========================================

    private String nomPersonneSortie;

    private String cinPersonneSortie;

    private String serviceSortie;

    // PERSONNE QUI FAIT L'ORDRE D'ENTREE

    private String nomPersonneEntree;

    private String cinPersonneEntree;

    private String serviceEntree;

    // VEHICULE

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "vehicule_id",
            nullable = false
    )
    private Vehicule vehicule;

    // PIECE JUSTIFICATIVE GENERALE

    @Column(name = "piece_justificative_url")
    private String pieceJustificativeUrl;

    // PIECES DE LA PRISE EN CHARGE

    // ORDRE D'ENTREE
    @Column(name = "ordre_entree")
    private String ordreEntree;

    // FACTURE
    @Column(name = "facture")
    private String facture;

    // PV D'EVALUATION
    @Column(name = "pv_evaluation")
    private String pvEvaluation;
}