export default function Footer() {
  return (
    <footer style={{ 
      padding: '40px 20px', 
      textAlign: 'center', 
      background: '#0a0406', 
      borderTop: '1px solid #2a1b22',
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '12px'
    }}>
      <p>&copy; {new Date().getFullYear()} Romi Paiva Estética. Todos los derechos reservados.</p>
    </footer>
  );
}
