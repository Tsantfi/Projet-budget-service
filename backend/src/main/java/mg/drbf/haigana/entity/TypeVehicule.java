package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "type_vehicule")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TypeVehicule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_du_vehicule", nullable = false)
    private String typeDuVehicule;
}
