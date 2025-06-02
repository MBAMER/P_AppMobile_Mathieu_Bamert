-- Migration: Add 'epub' column to 't_livre' table
ALTER TABLE t_livre ADD COLUMN epub LONGBLOB; 