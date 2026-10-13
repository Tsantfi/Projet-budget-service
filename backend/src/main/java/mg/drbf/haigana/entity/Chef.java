package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chef")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Chef {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomChef;

    @Column(unique = true)
    private String immatriculeChef;
}
