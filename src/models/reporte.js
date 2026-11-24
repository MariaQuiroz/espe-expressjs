const mongoose = require("mongoose");

const GRAVEDADES = ["leve", "moderada", "grave"];

const reporteSchema = new mongoose.Schema(
  {
    ventaId: {
      type: Number,
      required: [true, "La venta es obligatoria"],
      min: [1, "ventaId debe ser mayor a 0"],
    },
    userId: {
      type: Number,
      required: [true, "El usuario es obligatorio"],
    },
    medicamento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicamento",
      required: [true, "El medicamento es obligatorio"],
    },
    clienteNombre: {
      type: String,
      required: [true, "El nombre del cliente es obligatorio"],
    },
    gravedad: {
      type: String,
      required: [true, "La gravedad es obligatoria"],
      enum: {
        values: GRAVEDADES,
        message: `La gravedad {VALUE} no es válida. Use: ${GRAVEDADES.join(", ")}`,
      },
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      minlength: [10, "La descripción debe tener al menos 10 caracteres"],
      maxlength: [500, "La descripción no puede superar 500 caracteres"],
    },
    sintomas: {
      type: [String],
      validate: {
        validator: (lista) => lista.length > 0,
        message: "Debe indicar al menos un síntoma",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

reporteSchema.index({ ventaId: 1 }, { unique: true });
reporteSchema.index({ medicamento: 1, gravedad: 1 });

module.exports = mongoose.model("Reporte", reporteSchema);
