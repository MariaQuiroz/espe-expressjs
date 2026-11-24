const mongoose = require("mongoose");
const slugify = require("slugify");
const { escaparRegex } = require("../utils/query");

const FORMAS = ["tableta", "capsula", "jarabe", "inyectable", "crema", "gotas"];
const CATEGORIAS = [
  "analgesico",
  "antibiotico",
  "antiinflamatorio",
  "antihistaminico",
  "otro",
];

const presentacionSchema = new mongoose.Schema(
  {
    forma: {
      type: String,
      required: [true, "La forma farmacéutica es obligatoria"],
      enum: {
        values: FORMAS,
        message: `La forma {VALUE} no es válida. Use: ${FORMAS.join(", ")}`,
      },
    },
    concentracion: {
      type: String,
      required: [true, "La concentración es obligatoria"],
      trim: true,
      match: [
        /^\d+(\.\d+)?\s?(mg|g|mcg|ml|UI|%)(\/\d+(\.\d+)?\s?(ml|g))?$/i,
        "La concentración debe tener un formato como 500 mg o 120 mg/5 ml",
      ],
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0.01, "El precio debe ser mayor a 0"],
      max: [10000, "El precio no puede superar 10000"],
      validate: {
        validator: (valor) => Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-6,
        message: "El precio admite máximo 2 decimales",
      },
    },
  },
  {
    _id: false,
    toJSON: { virtuals: true, id: false },
    toObject: { virtuals: true, id: false },
  },
);

presentacionSchema.virtual("etiqueta").get(function () {
  return `${this.forma} ${this.concentracion}`;
});

const medicamentoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [80, "El nombre no puede superar 80 caracteres"],
      validate: {
        validator: async function (valor) {
          const existe = await this.constructor.exists({
            nombre: new RegExp(`^${escaparRegex(valor)}$`, "i"),
            _id: { $ne: this._id },
          });
          return !existe;
        },
        message: "Ya existe un medicamento con el nombre {VALUE}",
      },
    },
    slug: {
      type: String,
      required: [true, "El slug es obligatorio"],
    },
    codigo: {
      type: String,
      required: [true, "El código es obligatorio"],
      trim: true,
      uppercase: true,
      match: [/^MED-\d{4}$/, "El código debe tener el formato MED-0000"],
    },
    principioActivo: {
      type: String,
      required: [true, "El principio activo es obligatorio"],
      trim: true,
      minlength: [3, "El principio activo debe tener al menos 3 caracteres"],
    },
    categoria: {
      type: String,
      enum: {
        values: CATEGORIAS,
        message: `La categoría {VALUE} no es válida. Use: ${CATEGORIAS.join(", ")}`,
      },
      default: "otro",
    },
    requiereReceta: { type: Boolean, default: false },
    contraindicaciones: { type: [String], default: [] },
    presentaciones: {
      type: [presentacionSchema],
      validate: [
        {
          validator: (lista) => Array.isArray(lista) && lista.length > 0,
          message: "Debe registrar al menos una presentación",
        },
        {
          validator: (lista) =>
            new Set(lista.map((p) => `${p.forma}|${p.concentracion}`)).size ===
            lista.length,
          message: "No puede repetir la misma forma y concentración",
        },
      ],
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
);

medicamentoSchema.virtual("resumen").get(function () {
  if (!this.nombre) return undefined;
  const precios = (this.presentaciones || []).map((p) => p.precio);
  if (precios.length === 0) return this.nombre;
  return `${this.nombre}: ${precios.length} presentación(es) desde $${Math.min(...precios).toFixed(2)}`;
});

medicamentoSchema.pre("validate", function () {
  if (this.nombre) {
    this.slug = slugify(this.nombre, { lower: true, strict: true });
  }
});

medicamentoSchema.index({ nombre: 1 });
medicamentoSchema.index({ principioActivo: 1, categoria: 1 });

module.exports = mongoose.model("Medicamento", medicamentoSchema);
