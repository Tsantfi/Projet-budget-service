package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "observation")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Observation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bon_commande_id", nullable = false)
    // Sécurise la sérialisation JSON pour éviter l'erreur 500
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BonCommande bonCommande;

    private String descriptionObservation;
    private LocalDate dateObservation;
}
