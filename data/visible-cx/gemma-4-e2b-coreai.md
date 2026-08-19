# visible-cx/gemma-4-E2B-CoreAI

## Resumen

El modelo `visible-cx/gemma-4-E2B-CoreAI` es una conversión del checkpoint oficial de Google `google/gemma-4-E2B-it-qat-q4_0-unquantized` al formato propietario Core AI (`.aimodel`) para ejecución en Apple Silicon. El proyecto Visible (visible.cx) ha tomado los pesos entrenados con cuantización consciente (QAT) por Google y los ha redondeado al grid int4 per-block-32 que el entrenamiento ya había fijado, reexpresándolos como un grafo Core AI. El resultado es un bundle de 2,1 GB que se ejecuta a 29 tokens por segundo en un Mac de 16 GB, con una ventana de contexto configurable entre 4096 y 16384 tokens según el manifiesto elegido.

Este modelo es relevante porque permite ejecutar un Gemma 4 E2B (2.100 millones de parámetros) completamente en local, sin conexión, en hardware de Apple. Su particularidad técnica es el uso de Per-Layer Embeddings (PLE), que obliga a incluir una tabla de gather estática de 2,8 GB como entrada adicional del grafo; sin ella, el bundle no carga. El autor lo presenta como la única conversión de su catálogo apta para salida estructurada, con una tasa de 10/10 en validación de esquema, aunque advierte que su coste por fila es cuatro veces superior al de un LFM2.5 1.2B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con Per-Layer Embeddings (PLE) |
| Parametros totales | 2.100 millones (2,1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096, 8192 o 16384 tokens según el bundle (el modelo base Gemma 4 soporta hasta 256K) |
| Tipos de cuantizacion | int4 per-block-32 (int4lin, simétrico con clipping); versión experimental w4a8 (int4 pesos, activaciones int8) |
| Idiomas soportados | No especificado en la conversión; el modelo base Gemma 4 soporta más de 140 idiomas |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | Core AI `.aimodel` (grafo MLIR) + tablas sidecar en i8/f32 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 2.100 millones de parámetros con una innovación estructural: Per-Layer Embeddings (PLE). En lugar de una única tabla de embeddings compartida, cada capa tiene su propia tabla de embeddings por capa, lo que reduce el coste de memoria en modelos pequeños pero complica la exportación. La conversión de Visible resuelve esto extrayendo la tabla de gather como una entrada estática del grafo, separada del peso principal.

El entrenamiento original de Google utilizó cuantización consciente (QAT) con un grid int4 q4_0 (el mismo que usa ggml). El checkpoint publicado como "QAT-unquantized" almacena los pesos en precisión completa, pero el redondeo al grid int4 ocurre en el momento de la exportación, sobre los valores que el entrenamiento ya había calibrado. La conversión se realizó con la toolchain `coreai-torch 0.4.1`, `coreai-core 1.0.0b2` y `coreai-opt 0.2.1`, usando recetas del repositorio `coreai-model-zoo`. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de alineación (RLHF/DPO) aplicado por Google.

## Capacidades

- Generación de texto y razonamiento: modelo de lenguaje generalista, capaz de mantener conversaciones multi-turno y seguir instrucciones.
- Generación de código y matemáticas: capacidades propias de la familia Gemma 4, aunque no se aportan benchmarks específicos de esta conversión.
- Soporte de system prompt: el modelo base Gemma 4 incorpora soporte nativo para el rol de sistema, lo que permite conversaciones más estructuradas y controlables.
- Multi-Token Prediction: el modelo base incluye un modelo draft para decodificación especulativa, lo que acelera la inferencia sin pérdida de calidad. Esta característica no está confirmada en la conversión Core AI.
- Salida estructurada: el autor reporta una tasa de 10/10 en validación de esquema (schema-clean) en el bundle principal, lo que lo hace apto para generar JSON u otros formatos estructurados.
- Multilingüe: el modelo base soporta más de 140 idiomas; la conversión no documenta restricciones idiomáticas.
- Inferencia on-device: diseñado para ejecutarse en Apple Silicon con el runtime Core AI, sin conexión a servidores.

## Casos de uso

- Generación de salida estructurada en aplicaciones macOS: el modelo es el único de la familia Core AI de Visible que consigue 10/10 en validación de esquema, por lo que es adecuado para rellenar formularios, generar JSON o extraer campos de texto en aplicaciones de escritorio.
- Asistente local de productividad: con 29 tok/s en un Mac de 16 GB, puede servir como asistente de redacción, resumen o traducción sin enviar datos a la nube, ideal para entornos con requisitos de privacidad.
- Prototipado de agentes conversacionales: el soporte de system prompt y la ventana de contexto de hasta 16K tokens permiten construir chatbots con instrucciones de sistema complejas y memoria de conversación de tamaño medio.
- Análisis de documentos en local: procesamiento de textos largos (hasta 16K tokens) para extracción de entidades, clasificación o generación de informes, todo en el dispositivo.
- Desarrollo de aplicaciones iOS/macOS con Core AI: al ser un bundle `.aimodel`, se integra directamente con el ecosistema Core AI de Apple, facilitando el despliegue en apps nativas.
- Entornos de baja latencia y sin conexión: al ejecutarse completamente en el dispositivo, elimina la latencia de red y permite funcionamiento offline, adecuado para herramientas de campo o entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) para esta conversión específica. El autor proporciona dos métricas empíricas:

- Velocidad de inferencia: 29 tokens por segundo en un Mac con 16 GB de RAM.
- Validación de esquema: 10/10 en pruebas de salida estructurada (schema-clean).

Estos datos provienen de la model card del autor y no han sido verificados de forma independiente. Para benchmarks del modelo base Gemma 4 E2B, se recomienda consultar la documentación oficial de Google.

## Requisitos de hardware

- Apple silicon Mac (M1 o posterior) con runtime Core AI instalado.
- Memoria unificada mínima recomendada: 16 GB (según el autor, que reporta 29 tok/s en esta configuración).
- Espacio en disco: el bundle principal ocupa 2,12 GB, y la tabla PLE sidecar 2,81 GB, totalizando unos 4,93 GB adicionales a los pesos.
- GPU: no se requiere GPU discreta; el modelo se ejecuta en la GPU integrada del chip Apple Silicon.
- Opciones de despliegue: exclusivamente a través del runtime Core AI de Apple. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Motores disponibles: el motor "pipelined" no soporta logits (no permite decoding guiado por gramática); el motor "sequential" sí los soporta y es el único que habilita la generación restringida por esquema.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Plataforma | Licencia |
|---|---|---|---|---|---|
| visible-cx/gemma-4-E2B-CoreAI | 2,1B | 4096-16384 | int4 | Apple Silicon (Core AI) | Gemma |
| LFM2.5 1.2B (mencionado por el autor) | 1,2B | no disponible | no disponible | no disponible | no disponible |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | 2,1B | hasta 256K | int4 QAT (pesos sin redondear) | Multiplataforma (transformers, GGUF) | Gemma |

El autor compara explícitamente con LFM2.5 1.2B: la conversión de Gemma cuesta 4 veces más por fila procesada y consume 3 veces más memoria pico, pero ofrece la ventaja de la salida estructurada fiable. Frente al checkpoint original de Google, esta conversión pierde la portabilidad multiplataforma y reduce drásticamente la ventana de contexto, pero gana en integración nativa con el ecosistema Apple.

## Limitaciones y advertencias

- La tabla PLE sidecar (2,8 GB) es obligatoria: sin ella, el bundle falla al cargar con un error de aridad que no menciona la causa. No es un archivo opcional.
- El motor "pipelined" no soporta logits, por lo que no se puede usar decoding guiado por gramática ni restricciones de formato en ese motor. Solo el motor "sequential" permite esta funcionalidad.
- La ventana de contexto máxima en los bundles es de 16384 tokens, muy inferior a los 256K del modelo base. Además, el autor advierte que los manifiestos de contexto son editables manualmente y que el cambio de contexto no modifica el grafo exportado.
- Solo funciona en Apple Silicon con el runtime Core AI; no hay soporte para Linux, Windows o GPUs NVIDIA.
- Licencia Gemma: incluye restricciones de uso comercial y términos específicos de Google que deben revisarse antes de desplegar en producción.
- No se dispone de información sobre sesgos, alucinaciones o comportamientos no deseados específicos de esta conversión. Al ser un modelo derivado, hereda las limitaciones del Gemma 4 E2B original.
- La versión w4a8 (experimental) no está validada y puede presentar problemas de estabilidad o calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/visible-cx/gemma-4-E2B-CoreAI
- Checkpoint base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Proyecto Visible: https://visible.cx
- Repositorio coreai-model-zoo: https://github.com/john-rocky/coreai-model-zoo
- Documentación de Gemma 4 de Google: https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
