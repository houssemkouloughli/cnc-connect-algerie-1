/**
 * Template email pour notifier un client d'une nouvelle offre
 */
export function newBidEmailTemplate({
    clientName,
    partName,
    partnerName,
    bidAmount,
    bidLink,
}: {
    clientName: string;
    partName: string;
    partnerName: string;
    bidAmount: number;
    bidLink: string;
}) {
    return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .highlight-box {
            background: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .highlight-box h3 {
            margin: 0 0 10px 0;
            color: #1e40af;
          }
          .highlight-box ul {
            margin: 0;
            padding-left: 20px;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: #1d4ed8;
          }
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Nouvelle Offre Reçue !</h1>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${clientName}</strong>,</p>
            
            <p>Excellente nouvelle ! Vous avez reçu une nouvelle offre pour votre demande de devis <strong>"${partName}"</strong>.</p>
            
            <div class="highlight-box">
              <h3>Détails de l'offre</h3>
              <ul>
                <li><strong>Atelier :</strong> ${partnerName}</li>
                <li><strong>Montant total :</strong> ${bidAmount.toLocaleString('fr-DZ')} DZD</li>
              </ul>
            </div>
            
            <p>Connectez-vous à votre tableau de bord pour consulter tous les détails de cette offre et décider de l'accepter ou non.</p>
            
            <center>
              <a href="${bidLink}" class="button">
                Voir l'offre complète →
              </a>
            </center>
            
            <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
              💡 <em>Astuce : Comparez plusieurs offres avant de prendre votre décision pour obtenir le meilleur rapport qualité-prix.</em>
            </p>
          </div>
          
          <div class="footer">
            <p>Cordialement,<br/><strong>L'équipe CNC Connect Algérie</strong></p>
            <p style="font-size: 12px; margin-top: 10px;">
              Connectez l'industrie algérienne
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Template email pour notifier un partenaire qu'une offre a été acceptée
 */
export function bidAcceptedEmailTemplate({
    partnerName,
    partName,
    clientName,
    orderAmount,
    orderLink,
}: {
    partnerName: string;
    partName: string;
    clientName: string;
    orderAmount: number;
    orderLink: string;
}) {
    return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .success-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .success-box h3 {
            margin: 0 0 10px 0;
            color: #047857;
          }
          .success-box ul {
            margin: 0;
            padding-left: 20px;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Félicitations ! Offre Acceptée</h1>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${partnerName}</strong>,</p>
            
            <p>Excellente nouvelle ! Votre offre a été acceptée et une nouvelle commande a été créée.</p>
            
            <div class="success-box">
              <h3>Détails de la commande</h3>
              <ul>
                <li><strong>Pièce :</strong> ${partName}</li>
                <li><strong>Client :</strong> ${clientName}</li>
                <li><strong>Montant :</strong> ${orderAmount.toLocaleString('fr-DZ')} DZD</li>
              </ul>
            </div>
            
            <p>Vous pouvez dès maintenant gérer cette commande depuis votre tableau de bord partenaire et mettre à jour son statut au fur et à mesure de l'avancement.</p>
            
            <center>
              <a href="${orderLink}" class="button">
                Gérer la commande →
              </a>
            </center>
            
            <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
              💼 <em>N'oubliez pas de mettre à jour régulièrement le statut de la commande pour tenir le client informé.</em>
            </p>
          </div>
          
          <div class="footer">
            <p>Cordialement,<br/><strong>L'équipe CNC Connect Algérie</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Template email pour notifier un client d'un changement de statut de commande
 */
export function orderStatusEmailTemplate({
    clientName,
    partName,
    newStatus,
    statusLabel,
    orderLink,
}: {
    clientName: string;
    partName: string;
    newStatus: string;
    statusLabel: string;
    orderLink: string;
}) {
    const statusColors: Record<string, string> = {
        confirmed: '#2563eb',
        in_production: '#9333ea',
        shipped: '#0ea5e9',
        delivered: '#10b981',
    };

    const statusEmojis: Record<string, string> = {
        confirmed: '✅',
        in_production: '🏭',
        shipped: '🚚',
        delivered: '📦',
    };

    const color = statusColors[newStatus] || '#2563eb';
    const emoji = statusEmojis[newStatus] || '📢';

    return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: ${color}22;
            color: ${color};
            border-radius: 20px;
            font-weight: 600;
            margin: 10px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: ${color};
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} Mise à jour de commande</h1>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${clientName}</strong>,</p>
            
            <p>Le statut de votre commande <strong>"${partName}"</strong> a été mis à jour :</p>
            
            <center>
              <span class="status-badge">${statusLabel}</span>
            </center>
            
            <p>Vous pouvez consulter tous les détails de votre commande et suivre sa progression en temps réel depuis votre tableau de bord.</p>
            
            <center>
              <a href="${orderLink}" class="button">
                Voir ma commande →
              </a>
            </center>
          </div>
          
          <div class="footer">
            <p>Cordialement,<br/><strong>L'équipe CNC Connect Algérie</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
}
