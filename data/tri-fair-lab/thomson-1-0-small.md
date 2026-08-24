# tri-fair-lab/Thomson-1.0-Small

## Resumen

Thomson-1.0-Small es un modelo de lenguaje de código abierto desarrollado por el laboratorio conjunto Thomson Reuters-Imperial Frontier AI Research Lab (tri-fair-lab). Forma parte de la familia Thomson-1.0 y se presenta como un modelo de frontera orientado a trabajo profesional de alto riesgo en los ámbitos legal, fiscal y periodístico. El modelo se construye a partir del checkpoint abierto Qwen3.6-35B-A3B, al que se aplica un pipeline de aprendizaje continuo (continual learning) que incluye re-alineación de valores mediante Constitutional DPO, pre-entrenamiento continuo con datos propietarios de Thomson Reuters y post-entrenamiento con DPO y refuerzo.

Con 35 mil millones de parámetros totales y 3 mil millones activos en arquitectura de mezcla de expertos (MoE), Thomson-1.0-Small ofrece una ventana de contexto nativa de 262 144 tokens. Su desarrollo consumió aproximadamente 1,63 × 10²³ FLOP en 35 207 horas de GPU B200, lo que demuestra que es posible obtener rendimiento de frontera con presupuestos de cómputo sustancialmente menores que los de los grandes laboratorios. El modelo se distribuye con licencia PolyForm Strict 1.0.0, que restringe el uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE (Qwen3.6-35B-A3B) |
| Parametros totales | 35 107 181 936 |
| Parametros activos | 3 000 000 000 (aprox.) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | No disponible (pesos BF16) |
| Idiomas soportados | No disponible |
| Licencia | Polyform Strict 1.0.0 |
| Formato de pesos | Safetensors (Transformers) |

## Arquitectura y entrenamiento

Thomson-1.0-Small es un modelo de lenguaje causal basado en la arquitectura Qwen3.6-35B-A3B, una mezcla de expertos (MoE) con 35B parámetros totales y 3B activos por token. El checkpoint base es Snowdon1.1-Small, que ya incorpora instrucción y ajuste fino. El desarrollo sigue un pipeline de tres módulos secuenciales:

1. **Re-alineación de valores**: se aplica Constitutional DPO para alinear el modelo con la Public AI Constitution, un documento de valores abierto y modificable. Esta etapa busca que el modelo maneje preguntas con narrativas divergentes de forma transparente y no propietaria.
2. **Foco en conocimiento**: pre-entrenamiento continuo (CPT) con 200B tokens seleccionados de un corpus de más de 19T tokens de datos públicos permisivos y propietarios. El corpus se divide aproximadamente en partes iguales entre documentos propietarios curados, reformulaciones sintéticas de esos documentos y datos de repetición de capacidades generales. Se aplica mezcla de modelos para proteger las capacidades generales.
3. **Foco en comportamiento, habilidad y agencia**: el post-entrenamiento combina optimización directa de preferencias (DPO) con aprendizaje por refuerzo. Los datos de preferencias se derivan de contenido experto, ontologías de dominio (p. ej., IRAC para jurisprudencia), consultas de uso real y datos agénticos del harness de Deep Research.

El entrenamiento completo consumió 1,63 × 10²³ FLOP en 35 207 horas de GPU B200. No se especifica el uso de RLHF convencional; se emplea DPO y RL con recompensa de conformidad constitucional.

## Capacidades

- Generación de texto y razonamiento avanzado en dominios profesionales: legal, fiscal y periodístico.
- Razonamiento riguroso y manejo de incertidumbre, adecuado para tareas con matices humanísticos y formales.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidades de agente para Deep Research, con recompensas que incentivan uso fiel de herramientas y citas precisas.
- Multilingüe (idiomas no especificados en la documentación disponible).
- Procesamiento de texto e imagen (pipeline image-text-to-text), aunque el foco declarado es lenguaje causal.
- Ventana de contexto larga (262 144 tokens) para análisis de documentos extensos.

## Casos de uso

- **Análisis de contratos y documentos legales**: el modelo puede procesar contratos completos de miles de páginas gracias a su contexto de 262144 tokens, identificando cláusulas de riesgo y generando resúmenes estructurados. Su entrenamiento con datos propietarios de Thomson Reuters le otorga conocimiento específico de terminología legal.
- **Asistencia en investigación jurisprudencial**: con entrenamiento en ontologías como IRAC, puede estructurar análisis de casos siguiendo el marco Issue-Rule-Analysis-Conclusion, ayudando a abogados a preparar argumentos con citas precisas.
- **Redacción y verificación periodística**: soporta generación de artículos con estilo editorial, verificación de datos y manejo de fuentes con citas, reduciendo riesgo de alucinación en contextos de noticias.
- **Cumplimiento fiscal y planificación tributaria**: puede analizar normativas fiscales, identificar obligaciones y proponer estructuras de planificación, basándose en su entrenamiento en documentos fiscales y regulaciones.
- **Deep Research agéntico**: con su harness de investigación, puede ejecutar búsquedas de múltiples pasos, consultar herramientas externas y producir informes con citas verificables, útil para consultoras y despachos.
- **Soporte a CoCounsel**: según el anuncio de Thomson Reuters, el modelo impulsará la plataforma CoCounsel para asistencia legal automatizada, gestionando consultas multi-turno y análisis de documentos con contexto largo.
- **Procesamiento de documentos mixtos (texto e imagen)**: al ser un modelo image-text-to-text, puede procesar contratos escaneados o documentos con tablas y figuras, integrando información visual en el razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la información disponible. La model card indica que el modelo muestra rendimiento competitivo con modelos de frontera como Claude Opus 4.8 y GPT-5, según el anuncio del blog de Thomson Reuters, pero no se incluyen las cifras concretas de MMLU, HumanEval, GSM8K ni otros estándares. Los datos de evaluación se presentan en el informe técnico *Thomson: Continual Learning of Frontier Models for SovereignAI*, al que se hace referencia pero cuyo contenido no está disponible en los materiales proporcionados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos BF16, el modelo requiere aproximadamente 70 GB de VRAM (35B × 2 bytes). Con cuantización de 8 bits, ~35 GB; con 4 bits, ~17,5 GB. Los pesos activos (3B) no reducen la memoria de manera significativa, ya que es necesario cargar todos los parámetros.
- **GPU recomendadas**: para BF16 completa, se necesitan GPUs con 80 GB (A100, H100, A800) o múltiples GPUs (p. ej., 2 × RTX 4090 con 24 GB cada una en modo paralelo). Con cuantización 4 bits, puede caber en una RTX 4090 (24 GB) o similar.
- **Consumer GPU**: es posible ejecutar el modelo en GPUs de consumo con cuantización (GGUF/llama.cpp), aunque la latencia será alta. No se dispone de datos de latencia específicos.
- **Opciones de despliegue**: compatible con el ecosistema Transformers de Hugging Face, vLLM para inferencia eficiente, TGI, y llama.cpp/Ollama si se convierten los pesos a GGUF.
- **Throughput**: no disponible; dependerá de la GPU y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Thomson-1.0-Small | 35B | 3B | 262144 | Polyform Strict 1.0.0 | Competitivo con frontera (según autor) |
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262144 | Apache 2.0 | Referencia de partida |
| Snowdon1.1-Small (base intermedia) | 35B | 3B | 262144 | Apache 2.0 | No disponible |

La comparativa con otros modelos MoE de 35B (como DeepSeek-V3-Lite o Mixtral 8x22B) no se puede realizar con datos disponibles, ya que no se aportan resultados de benchmarks. La principal diferencia frente a su base es el entrenamiento especializado en dominios profesionales y la re-alineación constitucional.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia Polyform Strict 1.0.0 permite uso no comercial y de investigación, pero prohíbe el uso comercial sin permiso explícito. Es una restricción importante para despliegues en producción.
- **Sesgos en dominios específicos**: al estar entrenado con datos de Thomson Reuters, puede presentar sesgos hacia el sistema legal y fiscal de ciertas jurisdicciones (no especificadas) y hacia la perspectiva editorial de la empresa.
- **Riesgo de alucinación**: a pesar del énfasis en citas y verificación, el modelo puede generar información falsa o inventada, especialmente en dominios fuera de sus datos de entrenamiento.
- **Idiomas no especificados**: no se indica qué idiomas soporta; se asume multilingüe por la arquitectura base, pero no hay garantías para idiomas de baja representación.
- **Contexto largo**: aunque el contexto es de 262144 tokens, el rendimiento en ventanas extremas puede degradarse sin técnicas de extrapolación adecuadas.
- **Falta de benchmarks públicos**: no se han publicado resultados de benchmarks estándar, lo que dificulta la evaluación objetiva y la comparación con otros modelos.
- **Coste de entrenamiento**: aunque es menor que el de los grandes laboratorios, el coste de 35 207 GPU-hours B200 es aún significativo para muchas instituciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tri-fair-lab/Thomson-1.0-Small)
- [Checkpoint base Snowdon1.1-Small](https://huggingface.co/tri-fair-lab/Snowdon1.1-Small)
- [Arquitectura base Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Organización tri-fair-lab](https://huggingface.co/tri-fair-lab)
- [Anuncio oficial de Thomson Reuters](https://www.thomsonreuters.com/en-us/posts/innovation/thomson-reuters-built-its-own-ai-model-that-now-ranks-among-the-worlds-best/)
- [Artículo en Artificial Lawyer](https://www.artificiallawyer.com/2026/03/24/thomson-is-coming-trs-own-legally-trained-llm/)
- [Análisis en LawNext](https://www.lawnext.com/2026/08/thomson-reuters-says-its-homegrown-ai-model-now-rivals-the-frontier-labs-i-take-a-closer-look-at-the-benchmarks.html)
