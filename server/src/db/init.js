import fs from "fs";
import { pool } from "../config/db.js";

async function initializeDatabase() {
    const connection = await pool.getConnection();
    
    try {
        console.log("📦 Reading SQL schema file...");
        const schema = fs.readFileSync(new URL("./init.sql", import.meta.url), "utf-8");
        
        // Remove comments and split by semicolons more intelligently
        const cleanedSchema = schema
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n')
            .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
        
        // Split by semicolon but be smarter about it
        const statements = [];
        let currentStatement = '';
        let inDelimiter = false;
        
        for (const line of cleanedSchema.split('\n')) {
            const trimmedLine = line.trim();
            
            // Handle DELIMITER statements
            if (trimmedLine.startsWith('DELIMITER')) {
                inDelimiter = trimmedLine.includes('$');
                continue;
            }
            
            currentStatement += line + '\n';
            
            // Check if statement is complete
            if (!inDelimiter && trimmedLine.endsWith(';')) {
                const stmt = currentStatement.trim();
                if (stmt.length > 0) {
                    statements.push(stmt);
                }
                currentStatement = '';
            } else if (inDelimiter && trimmedLine.endsWith('$')) {
                const stmt = currentStatement.trim();
                if (stmt.length > 0) {
                    statements.push(stmt.replace(/\$$/g, ';'));
                }
                currentStatement = '';
            }
        }
        
        console.log(`📝 Found ${statements.length} SQL statements to execute...\n`);
        
        let successCount = 0;
        let skipCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip views and procedures for now (they may have dependencies)
            if (statement.includes('CREATE OR REPLACE VIEW') || 
                statement.includes('CREATE PROCEDURE')) {
                skipCount++;
                continue;
            }
            
            try {
                await connection.query(statement);
                successCount++;
                
                // Log progress for table creation
                if (statement.includes('CREATE TABLE')) {
                    const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
                    if (tableName) {
                        console.log(`✅ Created table: ${tableName}`);
                    }
                } else if (statement.includes('CREATE INDEX')) {
                    const indexName = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/)?.[1];
                    if (indexName) {
                        console.log(`📊 Created index: ${indexName}`);
                    }
                }
            } catch (err) {
                // Ignore "already exists" errors
                if (!err.message.includes('Duplicate key name') && 
                    !err.message.includes('already exists')) {
                    console.warn(`⚠️  Warning:`, err.message.substring(0, 150));
                }
            }
        }
        
        console.log(`\n✅ Database initialization complete!`);
        console.log(`   - Successfully executed: ${successCount} statements`);
        console.log(`   - Skipped: ${skipCount} statements (views/procedures)`);
        
        connection.release();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error initializing database:", err.message);
        connection.release();
        process.exit(1);
    }
}

initializeDatabase();
