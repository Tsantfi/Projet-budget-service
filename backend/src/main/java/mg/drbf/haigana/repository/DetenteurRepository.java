package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Detenteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DetenteurRepository extends JpaRepository<Detenteur, Long> {

    // NOUVELLE MÉTHODE : Requise pour dissocier les détenteurs lors de la suppression du SOA
    List<Detenteur> findByService_Id(Long serviceId);

    // TOUS LES DETENTEURS (Invoquée par detenteurController.findAll)
    @Query("""
        SELECT DISTINCT d
        FROM Detenteur d
        LEFT JOIN FETCH d.service
        LEFT JOIN FETCH d.vehicules v
        LEFT JOIN FETCH v.marque
        LEFT JOIN FETCH v.genre
        ORDER BY d.nomDetenteur ASC
    """)
    List<Detenteur> findAllComplete();

    // RECHERCHE NOM / PRENOM (Invoquée par detenteurController.findAll)
    @Query("""
        SELECT DISTINCT d
        FROM Detenteur d
        LEFT JOIN FETCH d.service
        LEFT JOIN FETCH d.vehicules v
        LEFT JOIN FETCH v.marque
        LEFT JOIN FETCH v.genre
        WHERE LOWER(d.nomDetenteur) LIKE
              LOWER(CONCAT('%', :valeur, '%'))
           OR LOWER(d.prenomDetenteur) LIKE
              LOWER(CONCAT('%', :valeur, '%'))
        ORDER BY d.nomDetenteur ASC
    """)
    List<Detenteur> findByNomOrPrenomComplete(
            @Param("valeur") String valeur
    );
    
    // RECHERCHE PAR CIN COMPLET (Invoquée par detenteurController.findByCin)
    @Query("""
        SELECT DISTINCT d
        FROM Detenteur d
        LEFT JOIN FETCH d.service
        LEFT JOIN FETCH d.vehicules v
        LEFT JOIN FETCH v.marque
        WHERE LOWER(d.cinDetenteur) LIKE
              LOWER(CONCAT('%', :cin, '%'))
        ORDER BY d.nomDetenteur ASC
    """)
    List<Detenteur> findByCinComplete(
            @Param("cin") String cin
    );

    // RECHERCHE CIN STANDARD
    List<Detenteur> findByCinDetenteurContainingIgnoreCase(
            String cin
    );

    // EXISTENCE (Invoquées par detenteurController.create)
    boolean existsByCinDetenteur(String cin);

    boolean existsByImmatriculeDetenteur(
            String immatriculeDetenteur
    );
    
    Optional<Detenteur> findByImmatriculeDetenteur(
            String immatriculeDetenteur
    );
}
