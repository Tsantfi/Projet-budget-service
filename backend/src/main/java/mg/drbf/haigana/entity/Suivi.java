package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "suivi")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Suivi {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id", nullable = false)
    // Sécurise la sérialisation JSON pour éviter l'erreur 500
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Vehicule vehicule;

    private String description;
    private LocalDate dateSuivi;

    @Column(name = "piece_justificative_url")
    private String pieceJustificativeUrl;
}
