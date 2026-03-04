import React, { useState, useEffect } from 'react';
import { Card, Input, Button, message, Typography, Space } from 'antd';

const Bai1: React.FC = () => {
  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const startNewGame = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setAttempts(0);
    setIsGameOver(false);
    setGuess('');
  };

  useEffect(() => { startNewGame(); }, []);

  const handleCheck = () => {
    const num = parseInt(guess);
    if (isNaN(num)) return message.warning('Vui lòng nhập một số!');

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (num === target) {
      message.success('Chúc mừng! Bạn đã đoán đúng!');
      setIsGameOver(true);
    } else if (newAttempts >= 10) {
      message.error(`Bạn đã hết lượt! Số đúng là ${target}.`);
      setIsGameOver(true);
    } else {
      if (num < target) message.info('Bạn đoán quá thấp!');
      else message.info('Bạn đoán quá cao!');
    }
    setGuess('');
  };

  return (
    <Card title="Bài 1: Trò chơi đoán số" style={{ maxWidth: 500, margin: '20px auto' }}>
      <Typography.Paragraph>Hệ thống đã chọn một số từ 1 đến 100. Bạn có 10 lượt đoán.</Typography.Paragraph>
      <Typography.Text strong>Lượt đoán hiện tại: {attempts}/10</Typography.Text>
      <div style={{ marginTop: 20 }}>
        <Space>
          <Input 
            type="number" 
            value={guess} 
            onChange={e => setGuess(e.target.value)} 
            disabled={isGameOver}
            onPressEnter={handleCheck}
            placeholder="Nhập số dự đoán..."
          />
          <Button type="primary" onClick={handleCheck} disabled={isGameOver}>Đoán</Button>
          <Button onClick={startNewGame}>Chơi lại</Button>
        </Space>
      </div>
    </Card>
  );
};
export default Bai1;