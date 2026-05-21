// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
    try {
        console.log('🔍 Verificando autenticação...');
        console.log('📄 Headers:', req.headers);
        
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('❌ Sem header Authorization');
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        const parts = authHeader.split(' ');
        
        if (parts.length !== 2) {
            console.log('❌ Formato do token inválido');
            return res.status(401).json({ message: 'Formato do token inválido' });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            console.log('❌ Scheme do token inválido');
            return res.status(401).json({ message: 'Token mal formatado' });
        }

        if (!token) {
            console.log('❌ Token não fornecido');
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        console.log('🔑 Token recebido:', token.substring(0, 20) + '...');
        
        // Verificar o token
        jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta', (err, decoded) => {
            if (err) {
                console.log('❌ Token inválido:', err.message);
                return res.status(401).json({ message: 'Token inválido' });
            }
            
            console.log('✅ Token válido para usuário:', decoded.email);
            req.userId = decoded.id;
            req.userEmail = decoded.email;
            next();
        });
    } catch (error) {
        console.error('❌ Erro no middleware de autenticação:', error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    }
}