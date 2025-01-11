import * as hasher from "../lib/hasher";
import { Claim } from "../types/claim";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import * as fs from "fs/promises";
import path from "path";

const defaultPassword = process.env.DEFAULT_PASSWORD ?? "admin";
const defaultUser = process.env.DEFAULT_USER ?? "admin";
const claims = Object.values(Claim);

const main = async () => {
  // Seed admin account
  const hashedPassword = await hasher.hash(defaultPassword);
  await prisma.user.upsert({
    where: {
      name: defaultUser,
    },
    create: {
      name: defaultUser,
      displayName: "Administrator",
      password: hashedPassword,
      claims: claims,
    },
    update: {
      name: defaultUser,
      displayName: "Administrator",
      claims: claims,
    },
  });

  // Seed components
  const componentDir = await fs.readdir("lib/workflow/components");

  const components: any[] = [];
  for (const file of componentDir) {
    const filePath = path.join(
      "../lib/workflow/components",
      file,
      "/register.ts"
    );
    const component = require(filePath);
    components.push(component);
    await prisma.workflowComponent.upsert({
      where: {
        code: component.code,
      },
      create: {
        code: component.code,
        name: component.name,
        type: component.type,
        moduleName: component.moduleName,
        limit: component.limit,
        parameters: JSON.stringify(component.parameters),
        requireCode: component.requireCode,
      },
      update: {
        code: component.code,
        name: component.name,
        type: component.type,
        moduleName: component.moduleName,
        limit: component.limit,
        parameters: JSON.stringify(component.parameters),
        requireCode: component.requireCode,
      },
    });
    console.log(`Added component: ${component.code}`);
  }

  // Seed templates
  const templates: any[] = [];
  const templateDir = await fs.readdir("lib/workflow/templates");
  for (const file of templateDir) {
    const filePath = path.join("../lib/workflow/templates", file);
    const template = require(filePath);
    templates.push(template);
    await prisma.workflowTemplate.upsert({
      where: {
        code: template.code,
      },
      create: {
        code: template.code,
        name: template.name,
        target: template.target,
        steps: {
          createMany: {
            data: template.steps,
          },
        },
      },
      update: {
        code: template.code,
        name: template.name,
        target: template.target,
        steps: {
          deleteMany: {},
          createMany: {
            data: template.steps,
          },
        },
      },
    });
    console.log(`Added template: ${template.code}`);
  }
};
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
