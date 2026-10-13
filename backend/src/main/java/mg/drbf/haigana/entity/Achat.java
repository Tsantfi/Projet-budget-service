package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "achat")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Achat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateAchat;
    private Double sommePayer;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entree_id", nullable = false, unique = true)
    private Entree entree;
}
