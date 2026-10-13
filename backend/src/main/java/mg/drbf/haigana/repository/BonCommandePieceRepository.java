package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.BonCommandePiece;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BonCommandePieceRepository extends JpaRepository<BonCommandePiece, Long> {

    // Récupère toutes les lignes d'un Bon de Commande avec ses pièces chargées immédiatement
    @Query("SELECT bcp FROM BonCommandePiece bcp JOIN FETCH bcp.bonCommande JOIN FETCH bcp.piece WHERE bcp.bonCommande.id = :bonCommandeId")
    List<BonCommandePiece> findByBonCommande_Id(@Param("bonCommandeId") Long bonCommandeId);

    // Récupère toutes les lignes associées à une Pièce spécifique (Utile pour des statistiques ou vérifications)
    @Query("SELECT bcp FROM BonCommandePiece bcp JOIN FETCH bcp.bonCommande JOIN FETCH bcp.piece WHERE bcp.piece.id = :pieceId")
    List<BonCommandePiece> findByPiece_Id(@Param("pieceId") Long pieceId);
}
