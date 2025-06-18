import { prisma } from '@/prisma';
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('Webhook POST handler triggered'); // Ensure this shows
  try {
    const evt = await verifyWebhook(req)

    console.log(evt);

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type

    if(!id || !eventType) {
      return new Response('Error: Failed to create user', { status: 400 })
    }

    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    if(eventType === 'user.created') {
      try {
        await prisma.user.create({
          data: {
            id,
            username: evt.data.username!,
            email: evt.data.email_addresses?.[0]?.email_address,
            img: evt.data.image_url || null
          }
        });

        return new Response("User created", { status: 200 });
      } catch (error) {
        return new Response('Error: Failed to create user', { status: 500 })
      }
    }

    if(eventType === 'user.deleted') {
      try {
        await prisma.user.delete({
          where: {
            id
          }
        });

        return new Response("User deleted", { status: 200 });
      } catch (error) {
        return new Response('Error: Failed to delete user', { status: 500 })
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}