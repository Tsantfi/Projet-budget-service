package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "piece")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Piece {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reference;
    private String nomPiece;
    private Double prixPiece;
}
