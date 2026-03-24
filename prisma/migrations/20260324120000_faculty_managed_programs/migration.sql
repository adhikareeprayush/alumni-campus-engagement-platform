-- CreateTable
CREATE TABLE `FacultyManagedProgram` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `program` ENUM('BCT', 'BEX', 'BIT', 'BCE', 'BME', 'BEE', 'BAG', 'BAM', 'OTHER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FacultyManagedProgram_userId_idx`(`userId`),
    UNIQUE INDEX `FacultyManagedProgram_userId_program_key`(`userId`, `program`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FacultyManagedProgram` ADD CONSTRAINT `FacultyManagedProgram_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
