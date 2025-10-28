import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'piter500monzon@gmail.com',
    pass: process.env.EMAIL_PASS || 'yltd aadr uagf bzut'
  }
});

// Plantilla de email para verificación
export const emailVerificacionTemplate = (nombre: string, codigo: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;  
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f9ff;
    }
    .header {
      background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .content h2 {
      color: #0d47a1;
      margin-top: 0;
    }
    .codigo {
      background: #e3f2fd;
      border: 2px dashed #1976d2;
      padding: 20px;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #0d47a1;
      margin: 20px 0;
      border-radius: 8px;
    }
    .expiracion {
      background: #fff3cd;
      border-left: 4px solid #ff9800;
      padding: 12px 15px;
      margin: 20px 0;
      border-radius: 4px;
      color: #856404;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #6c757d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏥 DocApp</h1>
    <p>Verificación de Cuenta</p>
  </div>
  <div class="content">
    <h2>¡Hola ${nombre}!</h2>
    <p>Gracias por registrarte en DocApp. Para completar tu registro, por favor verifica tu correo electrónico.</p>
    
    <p>Tu código de verificación es:</p>
    
    <div class="codigo">${codigo}</div>
    
    <p>Si no solicitaste este registro, puedes ignorar este mensaje.</p>
    
    <p>Saludos,<br><strong>El equipo de DocApp</strong></p>
  </div>
  <div class="footer">
    <p>Este es un email automático, por favor no responder.</p>
    <p>&copy; 2025 DocApp - Sistema de Gestión Médica</p>
  </div>
</body>
</html>

`;

// Función para enviar email de verificación
export const enviarEmailVerificacion = async (
  email: string, 
  nombre: string, 
  codigo: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"DocApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verifica tu cuenta de DocApp',
      html: emailVerificacionTemplate(nombre, codigo)
    });
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    return false;
  }
};