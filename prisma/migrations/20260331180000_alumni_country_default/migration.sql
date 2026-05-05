-- Align default country with branded demo data (new rows only; existing rows unchanged).
ALTER TABLE `AlumniProfile` MODIFY `country` VARCHAR(191) NOT NULL DEFAULT 'United States';
