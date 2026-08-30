# Urdatorn/KainoBERT-sphragis

## Resumen

KainoBERT-sphragis es un modelo de lenguaje enmascarado (masked language model) basado en la arquitectura ModernBERT-base, entrenado desde cero para griego antiguo (grc). Lo desarrolla Urdatorn como parte del proyecto Sphragis, orientado a la atribución de autoría en textos clásicos. El modelo no hereda los pesos de `answerdotai/ModernBERT-base`; solo reproduce su arquitectura y entrena un vocabulario BPE byte-level propio de 32.768 tokens sobre un corpus de griego antiguo normalizado.

Con 136 millones de parámetros y una ventana de contexto de 1.024 tokens, el modelo está diseñado para tareas de fill-mask y representaciones contextuales de alta calidad en griego antiguo, incluyendo diacríticos politónicos. Su relevancia radica en que ofrece una alternativa especializada para investigación filológica y procesamiento de textos clásicos, con un entrenamiento cuidadoso que excluye solapamiento exacto con los benchmarks de atribución de autoría Sphragis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT base (22 capas, hidden size 768, 12 cabezas de atencion) |
| Parametros totales | 136.120.832 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (usada en pretraining) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (no especificada; el corpus fuente es de licencia mixta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura ModernBERT-base: 22 capas transformer con hidden size 768 y 12 cabezas de atención, sin capas de tipo MoE. Se entrenó desde inicialización aleatoria, sin transferencia de pesos desde el modelo original en inglés/código. El vocabulario es un BPE byte-level de 32.768 tokens entrenado específicamente sobre el corpus de griego antiguo.

El corpus de entrenamiento es `Urdatorn/AncientGreek-no-sphragis` (revisión `e021a174ba6526c90736b528e51114734eff976c`), del que se eliminaron las líneas normalizadas exactas presentes en los benchmarks Sphragis y Sphragis-Metre. Todo el texto se pasa a minúsculas y se elimina la puntuación. El 80% de los registros conserva los diacríticos politónicos; el 20% restante se transforma con `grc_utils.only_bases` preservando los límites de palabra, para hacer las representaciones menos sensibles a la pérdida de acentos.

El entrenamiento usó el objetivo de modelado de lenguaje enmascarado con un 30% de máscaras dinámicas, optimizador AdamW fusionado y batch efectivo de 512 secuencias. Se realizó en dos fases: una inicial de 3.750 pasos (3,99 épocas) con learning rate pico de 3e-4 que decae a 3e-5, y una continuación de 14.500 pasos (15,43 épocas) con learning rate 3e-5 y decaimiento coseno. En total se presentaron 9.568.256.000 tokens a los pesos. La mejor pérdida de validación fue 2,187660 (perplejidad 8,9143), con criterio de parada por seis comprobaciones consecutivas sin mejora superior a 0,002.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) en griego antiguo, con soporte de diacríticos politónicos.
- Representaciones contextuales densas de 768 dimensiones, aptas para fine-tuning en tareas posteriores.
- Vocabulario BPE byte-level específico para griego antiguo, que cubre morfología flexiva y variantes ortográficas.
- Robustez relativa a la ausencia de acentos: el 20% de los datos de entrenamiento sin diacríticos permite que el modelo funcione con texto simplificado.
- No incluye capacidades de generación de texto libre, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo encoder para representaciones y MLM.

## Casos de uso

- Restauración de lagunas en papiros y manuscritos: dado un fragmento con huecos, el modelo puede predecir tokens enmascarados basándose en el contexto sintáctico y semántico del griego clásico.
- Análisis filológico asistido: investigadores pueden usar las representaciones contextuales para estudiar similitudes estilísticas entre autores o detectar interpolaciones.
- Post-procesado de OCR: corrección de errores de reconocimiento óptico en textos griegos digitalizados, enmascarando caracteres o palabras dudosas y validando con las predicciones del modelo.
- Atribución de autoría: como parte del proyecto Sphragis, el modelo sirve para calcular perplejidad de autor y contribuir a estudios de autoría en textos antiguos.
- Enriquecimiento de corpus: generación de anotaciones automáticas (lematización, etiquetado morfosintáctico) mediante fine-tuning sobre las representaciones del modelo.
- Educación y herramientas de aprendizaje: integración en aplicaciones de lectura de griego antiguo que ofrezcan sugerencias de restauración o completado de pasajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) en la información disponible. El único dato de rendimiento reportado es la perplejidad de validación de 8,9143 durante el entrenamiento, que no es comparable directamente con otros modelos sin un protocolo común.

## Requisitos de hardware

- El modelo tiene 136 millones de parámetros; en FP32 ocupa aproximadamente 545 MB, en FP16 unos 273 MB.
- Es viable en GPUs de consumo como RTX 3060 (12 GB) o superiores, e incluso en CPU con suficiente RAM (se recomiendan al menos 4 GB libres).
- Para inferencia en producción, puede servirse con librerías estándar de transformers (PyTorch) o mediante ONNX Runtime si se exporta.
- No se dispone de datos de latencia o throughput medidos; al ser un modelo pequeño, se espera una inferencia rápida incluso en CPU para secuencias de hasta 1.024 tokens.
- No requiere hardware especializado; una GPU con 4-6 GB de VRAM es suficiente para fine-tuning con batch pequeño.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para griego antiguo con arquitectura ModernBERT. Existen otros modelos para lenguas clásicas (p. ej., Latin BERT o modelos multilingües como XLM-R), pero no se han encontrado datos de comparación directa en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo cubre griego antiguo; no soporta otros idiomas ni tareas generativas.
- La exclusión de solapamiento exacto con los benchmarks Sphragis no garantiza ausencia de solapamiento con ediciones relacionadas, paráfrasis o frases cortas compartidas.
- El corpus fuente tiene licencia mixta; es necesario consultar el campo `license` de cada registro antes de redistribuir o usar el modelo en aplicaciones comerciales.
- La licencia del modelo se indica como `other`, sin términos claros; se recomienda contactar con el autor antes de un uso comercial.
- Al ser un modelo encoder pequeño, su capacidad de representación es limitada frente a modelos más grandes; puede no capturar matices muy sutiles de estilo en textos extensos.
- No se han evaluado sesgos específicos; como todo modelo entrenado con datos históricos, puede reflejar sesgos de los textos fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/KainoBERT-sphragis
- Dataset de entrenamiento: https://huggingface.co/datasets/Urdatorn/AncientGreek-no-sphragis
- Código de entrenamiento (repo Sphragis models): https://github.com/Urdatorn/sphragis_models/tree/be2e32deb9fdbf180a7eebe51e3b8eeec7e1929e
- Perfil del autor en GitHub: https://github.com/Urdatorn/Urdatorn
