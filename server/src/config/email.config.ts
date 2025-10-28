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

// ✅ FUNCIÓN COMPLETA: Enviar historial médico por email
export const enviarHistorialMedico = async (
	pacienteEmail: string,
	pacienteNombre: string,
	medicoNombre: string,
	especialidad: string,
	historial: any,
	recetas: any[]
): Promise<boolean> => {
	try {
		// ✅ URL de tu logo en Imgur
		const LOGO_URL = 'https://i.imgur.com/py2jfvb.png'; // Mantener el mismo logo

		// Formatear fecha de la consulta
		const fecha = new Date(historial.fecha_consulta).toLocaleDateString('es-MX', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		// ----------------------------------------------------------------------
		// 1. Generar HTML de recetas (Recetario con diseño limpio y tabular)
		// ----------------------------------------------------------------------
		let recetasHTML = '';
		if (recetas && recetas.length > 0) {
			recetasHTML = recetas.map((receta, index) => `
				<!-- Receta Item ${index + 1} -->
				<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
					<tr>
						<td style="padding: 15px 20px; background-color: #F7F9FC; border-bottom: 1px solid #E5E7EB;">
							<h4 style="margin: 0; font-size: 17px; color: #1F2937; font-weight: 600;">
								${index + 1}. ${receta.medicamento_nombre}
							</h4>
							${receta.medicamento_generico ? `<p style="margin: 4px 0 0 0; color: #6B7280; font-size: 13px;">${receta.medicamento_generico}</p>` : ''}
						</td>
					</tr>
					<tr>
						<td style="padding: 15px 20px 5px 20px; background-color: #ffffff;">
							<!-- Detalles de la Receta (Usando tabla para layout) -->
							<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size: 14px; color: #374151;">
								<tr>
									<td style="padding: 5px 0; width: 50%;"><strong style="color: #3B82F6;">Dosis:</strong> ${receta.dosis}</td>
									<td style="padding: 5px 0; width: 50%;"><strong style="color: #3B82F6;">Frecuencia:</strong> ${receta.frecuencia}</td>
								</tr>
								<tr>
									<td style="padding: 5px 0;"><strong style="color: #3B82F6;">Duración:</strong> ${receta.duracion}</td>
									${receta.via_administracion ? `<td style="padding: 5px 0;"><strong style="color: #3B82F6;">Vía:</strong> ${receta.via_administracion}</td>` : '<td></td>'}
								</tr>
							</table>
						</td>
					</tr>
					${receta.indicaciones ? `
					<tr>
						<td style="padding: 15px 20px; background-color: #EFF6FF; border-top: 1px solid #E5E7EB;">
							<strong style="color: #1E40AF; font-size: 13px;">Indicaciones:</strong> ${receta.indicaciones}
						</td>
					</tr>
					` : ''}
				</table>
			`).join('');
		} else {
			recetasHTML = `
				<div style="text-align: center; padding: 30px 20px; background: #F9FAFB; border-radius: 12px; border: 1px solid #E5E7EB;">
					<p style="margin: 0; color: #6B7280; font-size: 15px;">No se registraron medicamentos recetados en esta consulta.</p>
				</div>
			`;
		}
		
		// ----------------------------------------------------------------------
		// 2. Generar HTML de Signos Vitales (Grid de 2 columnas con tabla)
		// ----------------------------------------------------------------------
		let signosHTML = '';
		if (historial.presion_arterial || historial.temperatura || historial.peso || historial.altura) {
			const signos = [];
			// Usamos tablas para la disposición de 2 columnas para compatibilidad en email
			if (historial.presion_arterial) signos.push(`
				<td width="50%" style="padding-right: 6px;">
					<div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #D1D5DB;">
						<p style="margin: 0; color: #6B7280; font-size: 12px; margin-bottom: 4px;">Presión Arterial</p>
						<p style="margin: 0; color: #1F2937; font-size: 18px; font-weight: 700;">${historial.presion_arterial}</p>
					</div>
				</td>
			`);
			if (historial.temperatura) signos.push(`
				<td width="50%" style="padding-left: 6px;">
					<div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #D1D5DB;">
						<p style="margin: 0; color: #6B7280; font-size: 12px; margin-bottom: 4px;">Temperatura</p>
						<p style="margin: 0; color: #1F2937; font-size: 18px; font-weight: 700;">${historial.temperatura}°C</p>
					</div>
				</td>
			`);
			if (historial.peso) signos.push(`
				<td width="50%" style="padding-right: 6px;">
					<div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #D1D5DB;">
						<p style="margin: 0; color: #6B7280; font-size: 12px; margin-bottom: 4px;">Peso</p>
						<p style="margin: 0; color: #1F2937; font-size: 18px; font-weight: 700;">${historial.peso} kg</p>
					</div>
				</td>
			`);
			if (historial.altura) signos.push(`
				<td width="50%" style="padding-left: 6px;">
					<div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #D1D5DB;">
						<p style="margin: 0; color: #6B7280; font-size: 12px; margin-bottom: 4px;">Altura</p>
						<p style="margin: 0; color: #1F2937; font-size: 18px; font-weight: 700;">${historial.altura} m</p>
					</div>
				</td>
			`);

			// Agrupar los signos en filas de 2
			let signRows = [];
			for (let i = 0; i < signos.length; i += 2) {
				let row = `
					<tr>
						${signos[i]}
						${signos[i + 1] || `<td width="50%" style="padding-left: 6px;">&nbsp;</td>`}
					</tr>
				`;
				signRows.push(row);
			}

			signosHTML = `
				<div style="margin-top: 25px; margin-bottom: 25px;">
					<h3 style="margin: 0 0 15px 0; color: #1F2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
						<span style="color: #3B82F6;">📊</span> Signos Vitales
					</h3>
					<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: separate; border-spacing: 0 12px;">
						${signRows.join('')}
					</table>
				</div>
			`;
		}

		// ----------------------------------------------------------------------
		// 3. Template HTML Principal (Estructura de Email con tablas)
		// ----------------------------------------------------------------------
		const htmlTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>Resumen de Consulta Médica - DocStop</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0F4F8;">
	
	<!-- Contenedor Exterior -->
	<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F0F4F8; padding: 40px 20px;">
		<tr>
			<td align="center">
				
				<!-- Contenedor Principal de Contenido -->
				<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 680px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
					
					<!-- Header con Logo -->
					<tr>
						<td style="background-color: #1E3A8A; padding: 35px 30px; text-align: center;">
							<img src="${LOGO_URL}" alt="DocStop Logo" style="height: 100px; margin-bottom: 25px;">
							<h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">
								RESUMEN DE CONSULTA MÉDICA
							</h1>
							<p style="margin: 8px 0 0 0; color: #BFDBFE; font-size: 14px; font-weight: 400;">
								Documento Oficial de Historial Médico
							</p>
						</td>
					</tr>

					<!-- Contenido Principal -->
					<tr>
						<td style="padding: 40px 30px 20px 30px;">
							
							<!-- Saludo y Fecha -->
							<div style="margin-bottom: 30px;">
								<p style="margin: 0 0 4px 0; font-size: 15px; color: #6B7280;">Estimado(a):</p>
								<h2 style="margin: 0; color: #1F2937; font-size: 22px; font-weight: 700;">${pacienteNombre}</h2>
								<p style="margin: 10px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
									A continuación, encontrará el resumen oficial de su consulta realizada el: <strong style="color: #1F2937;">${fecha}</strong>.
								</p>
							</div>

							<!-- Información del Médico -->
							<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px; border: 1px solid #BFDBFE; border-radius: 8px;">
								<tr>
									<td style="background-color: #EFF6FF; padding: 20px; border-radius: 8px;">
										<p style="margin: 0 0 4px 0; font-size: 13px; color: #3B82F6; text-transform: uppercase; font-weight: 600;">
											Atendido por
										</p>
										<p style="margin: 0 0 4px 0; color: #1E40AF; font-size: 18px; font-weight: 700;">
											Dr(a). ${medicoNombre}
										</p>
										<p style="margin: 0; color: #3B82F6; font-size: 14px;">
											${especialidad}
										</p>
									</td>
								</tr>
							</table>

							<!-- Diagnóstico -->
							<div style="margin-bottom: 30px;">
								<h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
									<span style="color: #3B82F6;">🩺</span> Diagnóstico Clínico
								</h3>
								<div style="background: #F9FAFB; padding: 20px; border-radius: 10px; border-left: 4px solid #3B82F6;">
									<p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7;">
										${historial.diagnostico}
									</p>
								</div>
							</div>

							<!-- Síntomas -->
							${historial.sintomas ? `
								<div style="margin-bottom: 30px;">
									<h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
										<span style="color: #6B7280;">📝</span> Síntomas Reportados
									</h3>
									<div style="background: #F9FAFB; padding: 20px; border-radius: 10px;">
										<p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7;">
											${historial.sintomas}
										</p>
									</div>
								</div>
							` : ''}

							<!-- Signos Vitales -->
							${signosHTML}

							<!-- Medicamentos Recetados -->
							<div style="margin-bottom: 30px;">
								<h3 style="margin: 0 0 15px 0; color: #1F2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
									<span style="color: #10B981;">💊</span> Medicamentos Recetados
								</h3>
								${recetasHTML}
							</div>

							<!-- Plan de Tratamiento -->
							${historial.plan_tratamiento ? `
								<div style="margin-bottom: 30px;">
									<h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
										<span style="color: #10B981;">📋</span> Plan de Tratamiento
									</h3>
									<div style="background: #ECFDF5; padding: 20px; border-radius: 10px; border-left: 4px solid #10B981;">
										<p style="margin: 0; color: #065F46; font-size: 15px; line-height: 1.7;">
											${historial.plan_tratamiento}
										</p>
									</div>
								</div>
							` : ''}

							<!-- Observaciones -->
							${historial.observaciones ? `
								<div style="margin-bottom: 30px;">
									<h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
										<span style="color: #F59E0B;">📝</span> Observaciones Adicionales
									</h3>
									<div style="background: #FFFBEB; padding: 20px; border-radius: 10px;">
										<p style="margin: 0; color: #92400E; font-size: 15px; line-height: 1.7;">
											${historial.observaciones}
										</p>
									</div>
								</div>
							` : ''}

							<!-- Próxima Consulta -->
							${historial.fecha_seguimiento ? `
								<div style="background-color: #EFF6FF; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; border: 1px solid #BFDBFE;">
									<p style="font-size: 12px; color: #3B82F6; margin: 0 0 4px 0; font-weight: 600; text-transform: uppercase;">Próximo Seguimiento Programado</p>
									<p style="margin: 0; font-size: 20px; color: #1E40AF; font-weight: 700;">
										${new Date(historial.fecha_seguimiento).toLocaleDateString('es-MX', { 
											weekday: 'long',
											year: 'numeric', 
											month: 'long', 
											day: 'numeric' 
										})}
									</p>
								</div>
							` : ''}

							<!-- Nota Legal/Importante -->
							<div style="background: #FEF2F2; padding: 20px; border-radius: 10px; border-left: 4px solid #EF4444;">
								<p style="margin: 0 0 8px 0; color: #991B1B; font-size: 14px; font-weight: 600;">⚠️ Nota Importante</p>
								<p style="margin: 0; color: #7F1D1D; font-size: 13px; line-height: 1.6;">
									Este resumen es informativo. Si presenta síntomas nuevos, efectos adversos, o tiene dudas sobre su tratamiento, contacte inmediatamente a un profesional médico.
								</p>
							</div>

						</td>
					</tr>

					<!-- Footer -->
					<tr>
						<td style="background-color: #F9FAFB; padding: 25px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
							<p style="margin: 0 0 6px 0; color: #6B7280; font-size: 12px;">
								Este documento fue generado automáticamente por DocStop
							</p>
							<p style="margin: 0; color: #9CA3AF; font-size: 11px;">
								© ${new Date().getFullYear()} DocStop | Plataforma de Gestión Médica
							</p>
						</td>
					</tr>

				</table>

			</td>
		</tr>
	</table>

</body>
</html>
		`;

		await transporter.sendMail({
			from: `"DocStop - Sistema Médico" <${process.env.EMAIL_USER}>`,
			to: pacienteEmail,
			subject: `📋 Resumen Oficial de Consulta Médica - ${new Date(historial.fecha_consulta).toLocaleDateString('es-MX')}`,
			html: htmlTemplate
		});

		console.log('✅ Email de historial médico enviado a:', pacienteEmail);
		return true;
	} catch (error) {
		console.error('❌ Error al enviar email de historial:', error);
		return false;
	}
};
