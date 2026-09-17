import { QuoteHistoryScreen } from "@/components/quote/QuoteHistoryScreen";
import { useAuth } from "@/contexts/AuthContext";
import ProductosScreen from "./productos";

export default function HomeScreen() {
  const { state, user } = useAuth();

  // La portada pública es el catálogo. No montamos Cotizaciones mientras se
  // restaura la sesión porque eso dispara peticiones privadas y reemplaza toda
  // la interfaz unos instantes después. Admin y vendedor conservan su bandeja
  // como inicio una vez que su sesión fue confirmada.
  if (state !== "authenticated" || !["admin", "vendedor"].includes(user?.rol || "")) {
    return <ProductosScreen />;
  }

  return <QuoteHistoryScreen />;
}
