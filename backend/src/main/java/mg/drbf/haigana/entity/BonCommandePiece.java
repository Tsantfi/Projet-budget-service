package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

// Table de jointure : COMPOSER_PIECE (un bon de commande compose de plusieurs pieces)
@Entity
@Table(name = "bon_commande_piece")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class BonCommandePiece {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bon_commande_id", nullable = false)
    // Sécurise la sérialisation de l'objet bonCommande
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BonCommande bonCommande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "piece_id", nullable = false)
    // Sécurise la sérialisation de l'objet piece
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Piece piece;

    private Integer quantite;
}
