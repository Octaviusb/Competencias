let nodemailer;
try {
  nodemailer = await import('nodemailer');
} catch (e) {
  console.warn('Nodemailer not available - notifications disabled');
}

class NotificationService {
  constructor() {
    if (!nodemailer) {
      this.transporter = null;
      return;
    }
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter) {
      console.log('Email would be sent:', { to, subject });
      return { success: true, mock: true };
    }
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@competencias.com',
        to,
        subject,
        html,
        text
      });
      return { success: true };
    } catch (error) {
      console.error('Email error:', error);
      return { success: false, error: error.message };
    }
  }

  async notifyObservationCreated(observation, employee, observer) {
    const subject = 'Nueva Observación Registrada';
    const html = `
      <h2>Nueva Observación</h2>
      <p><strong>Empleado:</strong> ${employee.firstName} ${employee.lastName}</p>
      <p><strong>Observador:</strong> ${observer.firstName} ${observer.lastName}</p>
      <p><strong>Tipo:</strong> ${observation.type}</p>
      <p><strong>Fecha:</strong> ${new Date(observation.date).toLocaleDateString()}</p>
    `;
    
    return this.sendEmail({
      to: employee.user?.email,
      subject,
      html
    });
  }

  async notifyInterviewScheduled(interview, employee, interviewer) {
    const subject = 'Entrevista Programada';
    const html = `
      <h2>Entrevista Programada</h2>
      <p><strong>Empleado:</strong> ${employee.firstName} ${employee.lastName}</p>
      <p><strong>Entrevistador:</strong> ${interviewer.firstName} ${interviewer.lastName}</p>
      <p><strong>Fecha:</strong> ${new Date(interview.scheduledDate).toLocaleString()}</p>
      <p><strong>Tipo:</strong> ${interview.type}</p>
    `;
    
    return this.sendEmail({
      to: employee.user?.email,
      subject,
      html
    });
  }
}

export default new NotificationService();