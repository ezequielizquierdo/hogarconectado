import React, { lazy, Suspense } from "react";

import CatalogRouteSkeleton from "@/components/product/CatalogRouteSkeleton";

const ProductosScreen = lazy(() => import("@/components/screens/ProductosScreen"));

export default function ProductosRoute() {
  return (
    <Suspense fallback={<CatalogRouteSkeleton />}>
      <ProductosScreen />
    </Suspense>
  );
}
