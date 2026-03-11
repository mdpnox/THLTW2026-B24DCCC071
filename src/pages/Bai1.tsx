import React, { useState } from 'react';


type Choice = 'Kéo' | 'Búa' | 'Bao';
type Result = 'Thắng' | 'Thua' | 'Hòa';

interface HistoryItem {
  round: number;
  playerChoice: Choice;
  computerChoice: Choice;
  result: Result;
}

const choices: Choice[] = ['Kéo', 'Búa', 'Bao'];

export default function Bai1() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [round, setRound] = useState(1);


  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return 'Hòa';
    if (
      (player === 'Kéo' && computer === 'Bao') ||
      (player === 'Búa' && computer === 'Kéo') ||
      (player === 'Bao' && computer === 'Búa')
    ) {
      return 'Thắng';
    }
    return 'Thua';
  };


  const playGame = (playerChoice: Choice) => {

    const randomIndex = Math.floor(Math.random() * choices.length);
    const computerChoice = choices[randomIndex];
    

    const result = determineWinner(playerChoice, computerChoice);


    const newHistoryItem: HistoryItem = {
      round,
      playerChoice,
      computerChoice,
      result,
    };


    setHistory([newHistoryItem, ...history]);
    setRound(round + 1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Bài 1: Trò chơi Oẳn Tù Tì</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Lượt của bạn. Hãy chọn:</p>
        {choices.map((choice) => (
          <button 
            key={choice} 
            onClick={() => playGame(choice)}
            style={{ 
              margin: '0 10px', 
              padding: '10px 25px', 
              fontSize: '16px',
              cursor: 'pointer',
              borderRadius: '5px',
              border: '1px solid #ccc',
              backgroundColor: '#f0f0f0'
            }}
          >
            {choice}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div style={{ 
            backgroundColor: '#e6f7ff', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #91d5ff'
          }}>
          <h3 style={{ marginTop: 0 }}>Kết quả ván {history[0].round}:</h3>
          <p>Bạn chọn: <strong>{history[0].playerChoice}</strong></p>
          <p>Máy chọn: <strong>{history[0].computerChoice}</strong></p>
          <p>
            Kết quả: <strong style={{ 
              color: history[0].result === 'Thắng' ? 'green' : history[0].result === 'Thua' ? 'red' : '#d4b106' 
            }}>
              {history[0].result}
            </strong>
          </p>
        </div>
      )}


      <h3>Lịch sử đấu:</h3>
      {history.length === 0 ? (
        <p>Chưa có ván đấu nào.</p>
      ) : (
        <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ backgroundColor: '#fafafa' }}>
            <tr>
              <th>Ván</th>
              <th>Bạn chọn</th>
              <th>Máy chọn</th>
              <th>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.round} style={{ textAlign: 'center' }}>
                <td>{item.round}</td>
                <td>{item.playerChoice}</td>
                <td>{item.computerChoice}</td>
                <td style={{ 
                  fontWeight: 'bold', 
                  color: item.result === 'Thắng' ? 'green' : item.result === 'Thua' ? 'red' : '#d4b106' 
                }}>
                  {item.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}