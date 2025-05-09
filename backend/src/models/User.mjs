const UserModel = (sequelize, DataTypes) => {
  return sequelize.define("t_utilisateur", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pseudo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: "Ce username est déjà pris." },
      validate: {
        notEmpty: {
          msg: "Le pseudo ne peut pas être vide.",
        },
        notNull: {
          msg: "Le pseudo est une propriété obligatoire.",
        },
      },
    },
    mdp: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Le mot de passe ne peut pas être vide.",
        },
        notNull: {
          msg: "Le mot de passe est une propriété obligatoire.",
        },
      },
    },
    date_entre: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: "La date d'entrée doit être une date valide.",
        },
      },
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
};

export { UserModel };
