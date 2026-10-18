-- CreateTable
CREATE TABLE "Repository" (
    "id" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepoFile" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "repositoryId" INTEGER NOT NULL,

    CONSTRAINT "RepoFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_owner_name_key" ON "Repository"("owner", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RepoFile_repositoryId_path_key" ON "RepoFile"("repositoryId", "path");

-- AddForeignKey
ALTER TABLE "RepoFile" ADD CONSTRAINT "RepoFile_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
