"use client";

import React from "react";
import { menuIntegrations } from "@/menu";
import { notFound } from "next/navigation";
import { descriptions } from "@/descriptions";
import { MDXRenderer } from "@/utils/mdx-utils";

interface IntegrationPageProps {
  params: Promise<{
    integrationId: string;
  }>;
}

export default function IntegrationPage({ params }: IntegrationPageProps) {
  const { integrationId } = React.use(params);

  // Find the integration by ID
  const integration = menuIntegrations.find((integration) => integration.id === integrationId);

  // If integration not found, show 404
  if (!integration) {
    notFound();
  }

  const description = descriptions[integrationId as keyof typeof descriptions];

  if (!description) {
    return (
      <div className="flex-1 h-screen w-full flex flex-col items-center justify-start pt-16 px-8">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-bold text-center">{integration.name}</h1>
          <p className="text-muted-foreground mt-4 text-center">Integration ID: {integration.id}</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex-1 h-screen w-full flex flex-col items-center justify-start pt-24 px-8">
        <div className="w-full max-w-4xl">
          <MDXRenderer content={description} />
        </div>
      </div>
    );
  }
}
