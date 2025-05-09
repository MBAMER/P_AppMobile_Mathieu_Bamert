const OuvrageModel = (sequelize, DataTypes) => {
  return sequelize.define("t_ouvrage", {
    ouvrage_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Le titre ne peut pas être vide.",
        },
        notNull: {
          msg: "Le titre est une propriété obligatoire.",
        },
      },
    },
    nb_pages: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Le nombre de pages doit être un entier.",
        },
        notEmpty: {
          msg: "Le nombre de pages ne peut pas être vide.",
        },
        notNull: {
          msg: "Le nombre de pages est une propriété obligatoire.",
        },
      },
    },
    extrait: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categorie_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    resume: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    annee_edition: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: "L'année d'édition doit être une date valide.",
        },
        notNull: {
          msg: "L'année d'édition est une propriété obligatoire.",
        },
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nom_editeur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img_couverture: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    user_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ecrivain_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};

export { OuvrageModel };
