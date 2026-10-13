package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.ConduiteChauffeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConduiteChauffeurRepository
        extends JpaRepository<ConduiteChauffeur, Long> {

  
    // TOUTES LES ATTRIBUTIONS
    // Charge :
  

    @Query("""
        SELECT DISTINCT cc
        FROM ConduiteChauffeur cc
        JOIN FETCH cc.chauffeur c
        JOIN FETCH cc.vehicule v
        LEFT JOIN FETCH v.marque m
        LEFT JOIN FETCH v.genre g
        ORDER BY cc.dateConduite DESC
    """)
    List<ConduiteChauffeur> findAllComplete();


  
    // UNE ATTRIBUTION PAR ID
  

    @Query("""
        SELECT DISTINCT cc
        FROM ConduiteChauffeur cc
        JOIN FETCH cc.chauffeur c
        JOIN FETCH cc.vehicule v
        LEFT JOIN FETCH v.marque m
        LEFT JOIN FETCH v.genre g
        WHERE cc.id = :id
    """)
    Optional<ConduiteChauffeur> findCompleteById(
            @Param("id") Long id
    );


  
    // ATTRIBUTIONS D'UN CHAUFFEUR
  

    @Query("""
        SELECT DISTINCT cc
        FROM ConduiteChauffeur cc
        JOIN FETCH cc.chauffeur c
        JOIN FETCH cc.vehicule v
        LEFT JOIN FETCH v.marque m
        LEFT JOIN FETCH v.genre g
        WHERE cc.chauffeur.id = :chauffeurId
        ORDER BY cc.dateConduite DESC
    """)
    List<ConduiteChauffeur> findByChauffeurId(
            @Param("chauffeurId") Long chauffeurId
    );


  
    // ATTRIBUTIONS D'UN VEHICULE
  

    @Query("""
        SELECT DISTINCT cc
        FROM ConduiteChauffeur cc
        JOIN FETCH cc.chauffeur c
        JOIN FETCH cc.vehicule v
        LEFT JOIN FETCH v.marque m
        LEFT JOIN FETCH v.genre g
        WHERE cc.vehicule.id = :vehiculeId
        ORDER BY cc.dateConduite DESC
    """)
    List<ConduiteChauffeur> findByVehiculeId(
            @Param("vehiculeId") Long vehiculeId
    );


  
    // VERSION DERIVED QUERY
    // Utilisée pour les suppressions
  

    List<ConduiteChauffeur> findByVehicule_Id(
            Long vehiculeId
    );


  
    // VERIFIER SI UNE ATTRIBUTION EXISTE
  

    boolean existsByChauffeur_IdAndVehicule_Id(
            Long chauffeurId,
            Long vehiculeId
    );


  
    // VERIFIER UN DOUBLON LORS D'UNE MODIFICATION
  

    boolean existsByChauffeur_IdAndVehicule_IdAndIdNot(
            Long chauffeurId,
            Long vehiculeId,
            Long id
    );


  
    // SUPPRIMER LES ATTRIBUTIONS D'UN CHAUFFEUR
  

    void deleteByChauffeur_Id(Long chauffeurId);


  
    // SUPPRIMER LES ATTRIBUTIONS D'UN VEHICULE
  

    void deleteByVehicule_Id(Long vehiculeId);
}