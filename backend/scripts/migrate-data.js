const { Client } = require('pg');
require('dotenv').config({ path: '.env.production' });

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    console.log('AWS RDS 연결 중...');
    await client.connect();
    console.log('연결 성공!');

    // 테이블 생성
    console.log('\n테이블 생성 중...');
    
    // Companies 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ companies 테이블 생성');

    // Employees 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        department VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ employees 테이블 생성');

    // Cards 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id),
        card_number VARCHAR(20) UNIQUE NOT NULL,
        card_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        limit_amount DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ cards 테이블 생성');

    // Budgets 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id),
        department VARCHAR(255),
        monthly_limit DECIMAL(10, 2),
        current_usage DECIMAL(10, 2) DEFAULT 0,
        period_start DATE,
        period_end DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ budgets 테이블 생성');

    // Card_transactions 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS card_transactions (
        id SERIAL PRIMARY KEY,
        card_id INTEGER REFERENCES cards(id),
        amount DECIMAL(10, 2) NOT NULL,
        merchant VARCHAR(255),
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ card_transactions 테이블 생성');

    // 샘플 데이터 삽입
    console.log('\n샘플 데이터 삽입 중...');
    
    // 회사 데이터
    const companyResult = await client.query(`
      INSERT INTO companies (name) 
      VALUES ('테스트 주식회사')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    const companyId = companyResult.rows[0]?.id || 1;
    console.log('✓ 회사 데이터 삽입');

    // 직원 데이터
    const employees = [
      { name: '김철수', email: 'kim@test.com', department: '개발팀' },
      { name: '이영희', email: 'lee@test.com', department: '마케팅팀' },
      { name: '박민수', email: 'park@test.com', department: '영업팀' }
    ];

    for (const emp of employees) {
      await client.query(`
        INSERT INTO employees (company_id, name, email, department)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `, [companyId, emp.name, emp.email, emp.department]);
    }
    console.log('✓ 직원 데이터 삽입');

    // 카드 데이터
    const employeeResults = await client.query('SELECT id, name FROM employees LIMIT 3');
    
    for (const emp of employeeResults.rows) {
      const cardNumber = `4242-****-****-${Math.floor(Math.random() * 9000) + 1000}`;
      await client.query(`
        INSERT INTO cards (employee_id, card_number, card_type, limit_amount)
        VALUES ($1, $2, 'VISA', 1000000)
        ON CONFLICT (card_number) DO NOTHING
      `, [emp.id, cardNumber]);
    }
    console.log('✓ 카드 데이터 삽입');

    // 예산 데이터
    const departments = ['개발팀', '마케팅팀', '영업팀'];
    for (const dept of departments) {
      await client.query(`
        INSERT INTO budgets (company_id, department, monthly_limit, period_start, period_end)
        VALUES ($1, $2, 5000000, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
        ON CONFLICT DO NOTHING
      `, [companyId, dept]);
    }
    console.log('✓ 예산 데이터 삽입');

    // 거래 데이터
    const cardResults = await client.query('SELECT id FROM cards LIMIT 3');
    const merchants = ['스타벅스', 'GS25', '쿠팡', '네이버페이', '카카오택시'];
    const categories = ['식음료', '편의점', '온라인쇼핑', '교통비', '기타'];
    
    for (const card of cardResults.rows) {
      for (let i = 0; i < 5; i++) {
        const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomAmount = Math.floor(Math.random() * 50000) + 5000;
        
        await client.query(`
          INSERT INTO card_transactions (card_id, amount, merchant, category, status)
          VALUES ($1, $2, $3, $4, 'completed')
        `, [card.id, randomAmount, randomMerchant, randomCategory]);
      }
    }
    console.log('✓ 거래 데이터 삽입');

    console.log('\n✅ 데이터 마이그레이션 완료!');
    
    // 데이터 확인
    const countResults = await Promise.all([
      client.query('SELECT COUNT(*) FROM companies'),
      client.query('SELECT COUNT(*) FROM employees'),
      client.query('SELECT COUNT(*) FROM cards'),
      client.query('SELECT COUNT(*) FROM budgets'),
      client.query('SELECT COUNT(*) FROM card_transactions')
    ]);

    console.log('\n📊 데이터 현황:');
    console.log(`- 회사: ${countResults[0].rows[0].count}개`);
    console.log(`- 직원: ${countResults[1].rows[0].count}명`);
    console.log(`- 카드: ${countResults[2].rows[0].count}개`);
    console.log(`- 예산: ${countResults[3].rows[0].count}개`);
    console.log(`- 거래: ${countResults[4].rows[0].count}건`);

  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();