const EvaluationModel = (sequelize, DataTypes) => {
  return sequelize.define("t_evaluation", {
    evaluation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ouvrage_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "L'utilisateur associé est obligatoire.",
        },
        isInt: {
          msg: "L'utilisateur doit être un identifiant valide.",
        },
      },
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "La note est obligatoire.",
        },
        isInt: {
          msg: "La note doit être un entier entre 1 et 5.",
        },
        min: {
          args: [1],
          msg: "La note doit être au minimum 1.",
        },
        max: {
          args: [5],
          msg: "La note doit être au maximum 5.",
        },
      },
    },
  });
};

export { EvaluationModel };
