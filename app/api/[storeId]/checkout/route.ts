import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  const { address, phoneNumber, paymentMethod, productIds } = await req.json();

  if (!address || !phoneNumber || !paymentMethod || !productIds || productIds.length === 0) {
    return new NextResponse("Incomplete or invalid data", { status: 400 });
  }

  const line_items = [];
  
  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds
      }
    }
  });

  products.forEach((product) => {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: 'COP',
        product_data: {
          name: product.name,
        },
        unit_amount: product.price.toNumber() * 100
      }
    });
  });


  try {
    // Guarda los datos del formulario en tu base de datos
    const order = await prismadb.order.create({
      data: {
        address,
        phone: phoneNumber,
        isPaid: false,
        orderItems: {
          create: productIds.map((productId) => ({
            product: {
              connect: {
                id: productId,
              },
            },
          })),
        },
      },
    });

    return NextResponse.json(
      { orderId: order.id, message: "Datos de pago guardados exitosamente" },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Error al guardar datos de pago en la base de datos:', error);
    return new NextResponse("Error al guardar datos en la base de datos", { status: 500 });
  }
}
