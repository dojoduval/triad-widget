import React, { useMemo, useState, useEffect } from "react";

export type Card = {
  id: string;
  name: string;
  values: [number, number, number, number]; // top, right, bottom, left
};

export type Player = "HUMAN" | "AI";

const SAMPLE_DECK_A: Card[] = [
  { id: "a1", name: "Wolf", values: [3, 6, 2, 5] },
  { id: "a2", name: "Golem", values: [7, 2, 7, 1] },
  { id: "a3", name: "Sylph", values: [5, 5, 3, 2] },
  { id: "a4", name: "Drake", values: [6, 4, 5, 3] },
  { id: "a5", name: "Imp", values: [2, 7, 4, 4] },
];

const SAMPLE_DECK_B: Card[] = [
  { id: "b1", name: "Sprite", values: [4, 4, 5, 3] },
  { id: "b2", name: "Knight", values: [7, 3, 2, 6] },
  { id: "b3", name: "Ooze", values: [3, 6, 3, 4] },
  { id: "b4", name: "Myrmidon", values: [5, 5, 6, 2] },
  { id: "b5", name: "Mandragora", values: [2, 6, 5, 5] },
];

const DIRS = [
  { di: -1, dj: 0, sidePlaced: 0, sideNeighbor: 2 }, // up
  { di: 0, dj: 1, sidePlaced: 1, sideNeighbor: 3 },  // right
  { di: 1, dj: 0, sidePlaced: 2, sideNeighbor: 0 },  // down
  { di: 0, dj: -1, sidePlaced: 3, sideNeighbor: 1 }, // left
] as const;

export default function TripleTriadLite() {
  const [board, setBoard] = useState<(null | { owner: Player; card: Card })[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>("HUMAN");
  const [humanHand, setHumanHand] = useState<Card[]>(() => SAMPLE_DECK_A.slice(0, 5));
  const [aiHand, setAiHand] = useState<Card[]>(() => SAMPLE_DECK_B.slice(0, 5));
  const [dragCard, setDragCard] = useState<Card | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const score = useMemo(() => {
    let h = 0, a = 0;
    for (const cell of board) {
      if (!cell) continue;
      if (cell.owner === "HUMAN") h++; else a++;
    }
    return { h, a };
  }, [board]);

  function placeCard(index: number, card: Card, owner: Player) {
    if (gameOver || board[index]) return;
    const newBoard = board.slice();
    newBoard[index] = { owner, card };

    const i = Math.floor(index / 3);
    const j = index % 3;

    for (const { di, dj, sidePlaced, sideNeighbor } of DIRS) {
      const ni = i + di;
      const nj = j + dj;
      if (ni < 0 || ni > 2 || nj < 0 || nj > 2) continue;
      const nIndex = ni * 3 + nj;
      const neighbor = newBoard[nIndex];
      if (!neighbor || neighbor.owner === owner) continue;
      const placedVal = newBoard[index]!.card.values[sidePlaced];
      const neighborVal = neighbor.card.values[sideNeighbor];
      if (placedVal > neighborVal) newBoard[nIndex] = { owner, card: neighbor.card };
    }

    setBoard(newBoard);
    const filled = newBoard.filter(Boolean).length;
    if (filled === 9) { setGameOver(true); return; }
    setTurn(owner === "HUMAN" ? "AI" : "HUMAN");
  }

  function simulateGain(boardState: (null | { owner: Player; card: Card })[], index: number, card: Card, owner: Player) {
    if (boardState[index]) return -Infinity;
    const i = Math.floor(index / 3);
    const j = index % 3;
    let flips = 0;
    for (const { di, dj, sidePlaced, sideNeighbor } of DIRS) {
      const ni = i + di;
      const nj = j + dj;
      if (ni < 0 || ni > 2 || nj < 0 || nj > 2) continue;
      const nIndex = ni * 3 + nj;
      const neighbor = boardState[nIndex];
      if (!neighbor || neighbor.owner === owner) continue;
      const placedVal = card.values[sidePlaced];
      const neighborVal = neighbor.card.values[sideNeighbor];
      if (placedVal > neighborVal) flips++;
    }
    return flips;
  }

  // Simple greedy AI
  useEffect(() => {
    if (turn !== "AI" || gameOver) return;
    const t = setTimeout(() => {
      let bestIdx: number | null = null;
      let bestCardIdx: number | null = null;
      let bestGain = -1;
      const empties: number[] = [];
      for (let k = 0; k < 9; k++) if (!board[k]) empties.push(k);
      for (let c = 0; c < aiHand.length; c++) {
        const card = aiHand[c];
        for (const idx of empties) {
          const g = simulateGain(board, idx, card, "AI");
          if (g > bestGain) { bestGain = g; bestIdx = idx; bestCardIdx = c; }
        }
      }
      if (bestIdx === null || bestCardIdx === null) return;
      const card = aiHand[bestCardIdx];
      const newAi = aiHand.slice(); newAi.splice(bestCardIdx, 1); setAiHand(newAi);
      placeCard(bestIdx, card, "AI");
    }, 250);
    return () => clearTimeout(t);
  }, [turn, gameOver, board, aiHand]);

  function reset() {
    setBoard(Array(9).fill(null));
    setTurn("HUMAN");
    setHumanHand(SAMPLE_DECK_A.slice(0,5));
    setAiHand(SAMPLE_DECK_B.slice(0,5));
    setGameOver(false);
  }

  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"16px", alignItems:"start", height:"100%"}}>
      <Hand title="Your Hand" cards={humanHand} onPick={(c)=>setDragCard(c)} draggable />
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"12px"}}>
        <HUD status={gameOver ? (score.h===score.a ? "Draw" : score.h>score.a ? "You win" : "AI wins") : (turn==="HUMAN" ? "Your turn" : "AI thinking…")} score={score} onReset={reset} />
        <BoardUI board={board} onDropCell={(idx)=>{
          if (turn!=="HUMAN" || !dragCard || gameOver) return;
          const card = dragCard;
          const newHand = humanHand.filter(h=>h.id!==card.id);
          setHumanHand(newHand);
          setDragCard(null);
          placeCard(idx, card, "HUMAN");
        }} />
        <div style={{fontSize:"12px", color:"#aaa"}}>Drag a card onto the grid. Higher side beats lower adjacent side; most cards wins.</div>
      </div>
      <Hand title="Opponent" cards={aiHand} />
    </div>
  );
}

function HUD({status, score, onReset}:{status:string;score:{h:number;a:number};onReset:()=>void}){
  return (
    <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
      <span style={{color:"#bbb"}}>Status:</span>
      <strong>{status}</strong>
      <span style={{width:1, height:16, background:"#333", margin:"0 8px"}}></span>
      <span style={{color:"#bbb"}}>Score:</span>
      <strong>You {score.h} : {score.a} AI</strong>
      <button onClick={onReset} style={{marginLeft:8, padding:"6px 10px", borderRadius:8, background:"#222", color:"#fff", border:"1px solid #333", cursor:"pointer"}}>Restart</button>
    </div>
  );
}

function BoardUI({board, onDropCell}:{board:(null|{owner:Player;card:Card})[]; onDropCell:(idx:number)=>void}){
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(3, 120px)", gap:"8px", padding:"12px", background:"#0f0f0f", border:"1px solid #2a2a2a", borderRadius:16}}>
      {Array.from({length:9}).map((_, idx)=>{
        const cell = board[idx];
        return (
          <div key={idx}
               onDragOver={(e)=>{e.preventDefault();}}
               onDrop={(e)=>{e.preventDefault(); onDropCell(idx);}}
               style={{width:120, height:120, borderRadius:12, background: cell? (cell.owner==="HUMAN"?"#133019":"#2b1022") : "#1a1a1a",
                       border:"1px solid #333", display:"flex", alignItems:"center", justifyContent:"center", position:"relative"}}>
            {cell ? (
              <PlacedCard owner={cell.owner} card={cell.card}/>
            ) : (
              <span style={{color:"#333", fontSize:12}}>{Math.floor(idx/3)},{idx%3}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlacedCard({owner, card}:{owner:Player; card:Card}){
  return (
    <div style={{position:"absolute", inset:10, background: owner==="HUMAN" ? "linear-gradient(135deg,#2ecc71,#3498db)" : "linear-gradient(135deg,#e056fd,#ff7979)", opacity:0.25, borderRadius:10}}>
      <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, letterSpacing:1}}>{card.name}</div>
    </div>
  );
}

function Hand({title, cards, onPick, draggable=false}:{title:string; cards:Card[]; onPick?:(c:Card)=>void; draggable?:boolean}){
  return (
    <div>
      <div style={{fontSize:12, color:"#bbb", marginBottom:8}}>{title}</div>
      <div style={{display:"grid", gridTemplateColumns:"1fr", gap:"8px"}}>
        {cards.map(c=> <HandCard key={c.id} card={c} onPick={onPick} draggable={draggable}/>)}
      </div>
    </div>
  );
}

function HandCard({card, onPick, draggable}:{card:Card; onPick?: (c:Card)=>void; draggable:boolean}){
  return (
    <div draggable={draggable}
         onDragStart={()=>onPick && onPick(card)}
         style={{width:200, height:80, borderRadius:12, background:"#151515", border:"1px solid #2a2a2a", padding:10, color:"#eee"}}>
      <div style={{fontSize:12, opacity:0.9, marginBottom:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{card.name}</div>
      <div style={{display:"flex", gap:12, fontWeight:700}}>
        <span>T:{card.values[0]}</span>
        <span>R:{card.values[1]}</span>
        <span>B:{card.values[2]}</span>
        <span>L:{card.values[3]}</span>
      </div>
      {!draggable && <div style={{position:"absolute", right:10, bottom:10, fontSize:11, color:"#aaa"}}>Hidden</div>}
    </div>
  );
}