import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
 const { address, phoneNumber, paymentMethod, productIds } = await req.json();

  if (!address || !phoneNumber || !paymentMethod || !productIds || productIds.length === 0) {
    return new NextResponse("Incomplete or invalid data", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds
      }
    }
  });


const order = await prismadb.order.create({
      data: {
        storeId: params.storeId,
        address,
        phone: phoneNumber,
        isPaid: false,
        orderItems: {
          create: productIds.map((productId: string) => ({
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
};
