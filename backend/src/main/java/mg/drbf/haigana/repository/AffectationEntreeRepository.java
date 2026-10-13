package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.AffectationEntree;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AffectationEntreeRepository
        extends JpaRepository<AffectationEntree, Long> {

    List<AffectationEntree> findByEntree_Id(Long entreeId);

    @EntityGraph(attributePaths = {
        "entree",
        "entree.vehicule",
        "entree.vehicule.etat",
        "entree.vehicule.genre",
        "entree.vehicule.marque",
        "entree.vehicule.type",
        "entree.vehicule.carburant"
    })
    @Query("""
        SELECT a
        FROM AffectationEntree a
        WHERE a.id = :id
    """)
    Optional<AffectationEntree> findByIdWithVehicule(Long id);

    @EntityGraph(attributePaths = {
        "entree",
        "entree.vehicule",
        "entree.vehicule.etat",
        "entree.vehicule.genre",
        "entree.vehicule.marque",
        "entree.vehicule.type",
        "entree.vehicule.carburant"
    })
    @Query("""
        SELECT a
        FROM AffectationEntree a
    """)
    List<AffectationEntree> findAllWithVehicule();
    void deleteByEntree_Id(Long entreeId);
}