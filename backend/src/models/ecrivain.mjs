const EcrivainModel = (sequelize, DataTypes) => {
  return sequelize.define("t_ecrivain", {
    ecrivain_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Le nom ne peut pas être vide.",
        },
        notNull: {
          msg: "Le nom est une propriété obligatoire.",
        },
      },
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Le prénom ne peut pas être vide.",
        },
        notNull: {
          msg: "Le prénom est une propriété obligatoire.",
        },
      },
    },
  });
};

export { EcrivainModel };
