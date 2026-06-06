-- Reflejar la realidad del álbum físico: entre el Grupo F (TUN) y el
-- Grupo G (BEL) hay 2 páginas de publicidad (56-57).
-- Grupos A-F se quedan igual (MEX 8-9 ... TUN 54-55).
-- Grupos G-L se desplazan +2: BEL 56→58, ..., PAN 102-103 → 104-105.

UPDATE stickers
SET page = page + 2
WHERE group_code IN ('G', 'H', 'I', 'J', 'K', 'L');
