package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Sortie;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import mg.drbf.haigana.entity.TypeSortie;

import java.util.List;
import java.util.Optional;

@Repository
public interface SortieRepository extends JpaRepository<Sortie, Long> {

    @EntityGraph(attributePaths = {
            "vehicule",
            "vehicule.codeSoa",
            "vehicule.etat",
            "vehicule.genre",
            "vehicule.marque",
            "vehicule.type",
            "vehicule.carburant"
    })
    List<Sortie> findAll();

    @EntityGraph(attributePaths = {
            "vehicule",
            "vehicule.codeSoa",
            "vehicule.etat",
            "vehicule.genre",
            "vehicule.marque",
            "vehicule.type",
            "vehicule.carburant"
    })
    List<Sortie> findByVehicule_Id(Long vehiculeId);

    @EntityGraph(attributePaths = {
            "vehicule",
            "vehicule.codeSoa",
            "vehicule.etat",
            "vehicule.genre",
            "vehicule.marque",
            "vehicule.type",
            "vehicule.carburant"
    })
    java.util.Optional<Sortie> findById(Long id);
    Optional<Sortie> findTopByVehicule_IdAndTypeOrderByDateSortieDesc(Long vehiculeId, TypeSortie type);
}