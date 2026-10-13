package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "controle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Controle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // VEHICULE

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "vehicule_id",
        nullable = false
    )
    @JsonIgnore
    private Vehicule vehicule;

    // DESCRIPTION

    private String description;

    // DATE DU CONTROLE

    @Column(
        name = "date_controle",
        nullable = false
    )
    private LocalDate dateControle;

    // PV DU CONTROLE

    @Column(
        name = "piece_justificative_url"
    )
    private String pieceJustificativeUrl;

    // DEPLACEMENTS DU CONTROLE

    @OneToMany(
        mappedBy = "controle",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<ControleDeplacement> deplacements = new ArrayList<>();
}