# V4ldeLund/gemma-3-1b-pt-icelandic-experiment6

## Resumen

Este modelo es un fine-tune experimental del modelo base `google/gemma-3-1b-pt`, desarrollado por el usuario V4ldeLund. El nombre del repositorio indica que se trata de un ajuste orientado al islandés (experimento 6), aunque la ficha oficial no especifica los idiomas soportados ni la licencia. Se entrenó mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face, partiendo de los pesos del modelo Gemma 3 de 1B parámetros en su variante *pretrained* (no instructiva).

El modelo conserva la arquitectura original de Gemma 3, un transformer decoder-only con aproximadamente 1.000 millones de parámetros (999.885.952 según los pesos safetensors). Al ser un experimento, no se han publicado métricas de rendimiento ni se ha documentado el dataset de entrenamiento, pero el enlace a Weights & Biases sugiere que el proceso de ajuste fue monitorizado. Su relevancia radica en explorar la adaptación de un modelo multilingüe a una lengua de bajos recursos como el islandés, un caso de uso habitual en la investigación de adaptación lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) |
| Parametros totales | 999.885.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma 3 soporta hasta 128K tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | No disponible (el nombre sugiere islandés, no confirmado) |
| Licencia | No disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-pt`, la variante *pretrained* de Gemma 3 de 1B parámetros. Gemma 3, desarrollada por Google DeepMind, introduce mejoras sobre Gemma 2 para reducir el uso de memoria de la KV-cache en contextos largos, manteniendo una arquitectura transformer estándar con atención causal. El fine-tune se realizó con SFT mediante la librería TRL (versión 1.11.0), con Transformers 5.16.1 y PyTorch 2.13.0. No se especifica la composición del dataset de entrenamiento, pero el nombre del repositorio y el enlace al proyecto W&B (etiquetado como "faroese-icelandic-sft") indican que se utilizaron datos en islandés (y posiblemente feroés). Al ser un experimento, no se documentan innovaciones técnicas adicionales más allá del ajuste supervisado.

## Capacidades

- Generacion de texto: al ser un fine-tune de un modelo *pretrained*, genera texto libre en el idioma objetivo (presumiblemente islandés), pero no está alineado para seguir instrucciones de forma nativa.
- Conversacion: el tag "conversational" sugiere que el SFT pudo haber adaptado el modelo para diálogo, aunque no hay evidencia en la documentación.
- Multilingue: hereda las capacidades multilingües del modelo base Gemma 3, que cubre más de 140 idiomas, pero el fine-tune puede haber alterado el balance hacia el islandés.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso documentado.
- Sin capacidades de vision ni audio: el modelo base es la variante de solo texto (`gemma3_text`).

## Casos de uso

- Generacion de texto en islandés: el modelo puede emplearse para redactar contenido escrito en islandés, como artículos, resúmenes o textos creativos, aprovechando el ajuste específico sobre esta lengua.
- Traduccion automatica asistida: aunque no está entrenado explícitamente para traducción, podría usarse como componente en un pipeline de traducción islandés-inglés, generando borradores que luego se revisan.
- Investigacion en adaptacion linguistica: sirve como punto de partida para estudiar cómo el fine-tune SFT afecta a lenguas de bajos recursos, comparando su comportamiento con el modelo base sin ajustar.
- Prototipado de asistentes conversacionales en islandés: si el SFT incluyó datos conversacionales, podría integrarse en un chatbot básico para pruebas de concepto, aunque sin garantías de calidad.
- Aumento de datos para otros modelos: puede generar texto sintético en islandés para entrenar o evaluar otros sistemas de PLN.
- Analisis de sesgos y calidad: al ser un experimento, es útil para auditar qué errores comete un modelo pequeño ajustado a un idioma específico, informando futuros entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada: con 1B parámetros en FP16, la inferencia requiere aproximadamente 2 GB de VRAM; con cuantización de 8 bits baja a ~1 GB, y con 4 bits a ~0.6 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1660, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tune adicional, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4070, etc.).
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: compatible con Transformers (pipeline de Hugging Face), vLLM, TGI (text-generation-inference) y llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles, pero al ser un modelo de 1B, se espera una generación rápida en GPU moderna (del orden de 50-100 tokens/s en una RTX 4090, estimación orientativa).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| V4ldeLund/gemma-3-1b-pt-icelandic-experiment6 | 1B | No disponible | No disponible | Fine-tune SFT para islandés |
| google/gemma-3-1b-pt | 1B | 128K | Gemma Terms of Use | Modelo base pretrained, multilingüe |
| V4ldeLund/gemma-3-1b-it-icelandic-full-experiment3 | 1B | No disponible | No disponible | Otro fine-tune del mismo autor, variante instruct |

La comparativa se limita a modelos de la misma familia y tamaño. No hay datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo base, puede heredar sesgos de los datos originales de Gemma 3, y el dataset de ajuste (no documentado) podría introducir sesgos adicionales específicos del islandés.
- Riesgo de alucinacion: alto, especialmente en un modelo de 1B sin alineación instructiva; puede generar contenido falso o inconsistente.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, no se ha verificado que el fine-tune mantenga esa longitud; se recomienda probar con contextos cortos.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin aclaración legal. El modelo base Gemma 3 tiene sus propios términos de uso que pueden aplicar.
- Caveat para produccion: es un experimento (descargas 0, sin documentación de dataset ni evaluación). No es adecuado para entornos productivos sin una validación exhaustiva.
- Idioma: el nombre sugiere islandés, pero no hay confirmación oficial; el rendimiento en otros idiomas es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/V4ldeLund/gemma-3-1b-pt-icelandic-experiment6
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt
- Otro fine-tune del autor (variante instruct): https://huggingface.co/V4ldeLund/gemma-3-1b-it-icelandic-full-experiment3
- Pagina oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Technical report de Gemma 3 (arXiv): https://arxiv.org/html/2503.19786v1
- Repositorio de Gemma en GitHub: https://github.com/google-deepmind/gemma
- Proyecto de entrenamiento en Weights & Biases: https://wandb.ai/v4lde-danmarks-tekniske-universitet-dtu/faroese-icelandic-sft/runs/rlxaj61z
