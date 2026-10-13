package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Controle;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

@Repository
public interface ControleRepository
        extends JpaRepository<Controle, Long> {

    // CONTROLES D'UN VEHICULE
    // CHARGER :
    // Controle

    @EntityGraph(
        attributePaths = {
            "deplacements",
            "deplacements.deplacement"
        }
    )
    List<Controle> findByVehicule_Id(
            Long vehiculeId
    );

    // CONTROLES D'UN VEHICULE
    // TRIES PAR DATE

    @EntityGraph(
        attributePaths = {
            "deplacements",
            "deplacements.deplacement"
        }
    )
    List<Controle> findByVehicule_IdOrderByDateControleDesc(
            Long vehiculeId
    );

    // UN CONTROLE
    // AVEC SES DEPLACEMENTS

    @EntityGraph(
        attributePaths = {
            "deplacements",
            "deplacements.deplacement"
        }
    )
    Optional<Controle> findWithDeplacementsById(
            Long id
    );
    
    @Query("""
    SELECT c
    FROM Controle c
    WHERE c.vehicule.id = :vehiculeId
    """)
    List<Controle> findForDeletion(
            @Param("vehiculeId") Long vehiculeId
    );
    
}