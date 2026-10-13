package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
name = "controle_deplacement",
uniqueConstraints = {
@UniqueConstraint(
name = "uk_controle_deplacement",
columnNames = {
"controle_id",
"deplacement_id"
}
)
}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ControleDeplacement {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// CONTROLE

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(
    name = "controle_id",
    nullable = false
)
@JsonIgnore
private Controle controle;


// DEPLACEMENT

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(
    name = "deplacement_id",
    nullable = false
)
private Deplacement deplacement;


// STATUT

@Enumerated(EnumType.STRING)
@Column(
    name = "statut",
    nullable = false
)
@Builder.Default
private StatutControle statut =
        StatutControle.NON_CONTROLE;

}
