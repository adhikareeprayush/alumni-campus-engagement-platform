-- Destroys ALL app data and migration history in the current database.
-- Use on Aiven (or any MySQL) after a failed partial migrate, before:
--   npx prisma migrate deploy
--
-- Run in Aiven "Queries" or: mysql ... < prisma/drop-all-for-fresh-migrate.sql

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `FacultyManagedProgram`;
DROP TABLE IF EXISTS `JobApplication`;
DROP TABLE IF EXISTS `JobPosting`;
DROP TABLE IF EXISTS `EventRsvp`;
DROP TABLE IF EXISTS `Event`;
DROP TABLE IF EXISTS `Announcement`;
DROP TABLE IF EXISTS `AuditLog`;
DROP TABLE IF EXISTS `Session`;
DROP TABLE IF EXISTS `Account`;
DROP TABLE IF EXISTS `AlumniSkill`;
DROP TABLE IF EXISTS `Education`;
DROP TABLE IF EXISTS `JobHistory`;
DROP TABLE IF EXISTS `AlumniProfile`;
DROP TABLE IF EXISTS `StudentProfile`;
DROP TABLE IF EXISTS `Skill`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `VerificationToken`;
DROP TABLE IF EXISTS `_prisma_migrations`;

SET FOREIGN_KEY_CHECKS = 1;
