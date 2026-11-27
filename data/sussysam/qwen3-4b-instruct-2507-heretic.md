# Sussysam/Qwen3-4B-Instruct-2507-heretic

## Resumen

Qwen3-4B-Instruct-2507-heretic es una variante "decensored" del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario Sussysam. Se ha generado aplicando la herramienta Heretic v2.1.0, que realiza una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 5 a 27 del transformer original para eliminar el comportamiento de rechazo (refusals) aprendido durante el alineamiento. El resultado es un modelo de 4.022 millones de parámetros que conserva la arquitectura y capacidades del original pero responde a peticiones que el modelo base rechazaría.

El modelo hereda las características del Qwen3-4B-Instruct-2507: transformer causal con 36 capas, atención GQA (32 cabezas de consulta, 8 de clave-valor) y una ventana de contexto nativa de 262.144 tokens. Es un modelo solo de modo "non-thinking", es decir, no genera bloques `` y está optimizado para respuestas directas en tareas de instrucción, razonamiento, código, matemáticas y uso de herramientas.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un caso de modificación de alineamiento mediante técnicas de ablación de pesos, un área de creciente interés en la investigación sobre seguridad y control de modelos; por otro, permite evaluar si la eliminación de rechazos degrada las capacidades del modelo original, dado que el autor reporta una divergencia KL de 1,5593 respecto al base, lo que indica un cambio distribucional no trivial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3), 36 capas, GQA con 32 cabezas Q y 8 KV |
| Parametros totales | 4.022.468.096 (4,0B); 3,6B sin embeddings |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato safetensors en FP/BF16; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | No disponible de forma explicita; el modelo base declara mejoras en conocimiento multilingue de cola larga |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer causal decoder-only de 36 capas con atención de consultas agrupadas (GQA), 32 cabezas de consulta y 8 de clave-valor, y 4,0B de parámetros totales (3,6B excluyendo embeddings). El modelo base fue entrenado por Alibaba Qwen en dos fases, preentrenamiento y post-entrenamiento, y la versión 2507 incorpora mejoras en seguimiento de instrucciones, razonamiento lógico, comprensión de texto, matemáticas, ciencia, código y uso de herramientas, además de una ventana de contexto nativa de 262.144 tokens y mejor alineamiento con preferencias subjetivas.

La modificación heretic aplica una ablación de rangos arbitrarios (ARA) sobre las capas 5 a 27. Los parámetros reportados por el autor son: `start_layer_index=5`, `end_layer_index=27`, `preserve_good_behavior_weight=0.8322`, `steer_bad_behavior_weight=0.1434`, `overcorrect_relative_weight=0.7955` y `neighbor_count=11`. Esta técnica proyecta las activaciones asociadas al comportamiento de rechazo fuera de una dirección calculada, preservando en gran medida el comportamiento deseado. El autor reporta una reducción de rechazos de 100/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de 1,5593 respecto al base. No se especifica el volumen de datos ni la composición del dataset de calibración usado por Heretic.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento lógico y matemático (el modelo base reporta mejoras sustanciales en AIME25, HMMT25 y ZebraLogic).
- Generación y comprensión de código en múltiples lenguajes (LiveCodeBench, MultiPL-E).
- Uso de herramientas y function calling (BFCL-v3, TAU1/TAU2).
- Capacidades de agente y razonamiento multi-paso.
- Conocimiento multilingüe de cola larga (MultiIF, MMLU-ProX, INCLUDE, PolyMATH en el base).
- Modo non-thinking exclusivamente: no genera bloques ``.
- Respuestas a peticiones que el modelo base rechazaría (comportamiento decensored), con 3/100 rechazos reportados frente a 100/100 del original.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como caso de estudio para medir el impacto de la ablación de pesos en el comportamiento de rechazo y en la degradación de capacidades, comparando su divergencia KL (1,5593) con el base.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles que el modelo original rechazaría, aprovechando el contexto largo para mantener coherencia en obras extensas.
- Evaluación de robustez de filtros: uso en pipelines de red teaming para probar clasificadores de contenido y sistemas de moderación frente a un modelo con rechazos reducidos.
- Asistente conversacional de dominio acotado: despliegue en entornos controlados donde se requiere respuesta directa sin negativas, con la ventana de 262K tokens para gestionar historiales largos.
- Generación de código en producción: integración en pipelines de CI/CD mediante tool calling y function calling, con la salvedad de que el modelo base reporta un rendimiento inferior en Aider-Polyglot (12,9) frente a otras variantes.
- Procesamiento de documentos extensos: análisis y resumen de contratos, informes o bases de código que superen los 100K tokens gracias al contexto nativo de 262.144 tokens.
- Experimentación académica con técnicas de ablación: reproducción y comparación de los parámetros ARA reportados (pesos de preservación 0,8322, de direccionamiento 0,1434 y de sobrecorrección 0,7955) sobre otras capas o modelos.

## Benchmarks y rendimiento

Los benchmarks disponibles corresponden al modelo base Qwen3-4B-Instruct-2507, no a la variante heretic. No se han publicado resultados de benchmarks de la variante decensored en la información disponible, salvo las métricas de rechazos y divergencia KL.

| Benchmark | Qwen3-4B-Instruct-2507 (base) | GPT-4.1-nano-2025-04-14 | Qwen3-4B Non-Thinking |
|---|---|---|---|
| MMLU-Pro | 69,6 | 62,8 | 58,0 |
| MMLU-Redux | 84,2 | 80,2 | 77,3 |
| GPQA | 62,0 | 50,3 | 41,7 |
| SuperGPQA | 42,8 | 32,2 | 32,0 |
| AIME25 | 47,4 | 22,7 | 19,1 |
| HMMT25 | 31,0 | 9,7 | 12,1 |
| ZebraLogic | 80,2 | 14,8 | 35,2 |
| LiveBench 20241125 | 63,0 | 41,5 | 48,4 |
| LiveCodeBench v6 | 35,1 | 31,5 | 26,4 |
| MultiPL-E | 76,8 | 76,3 | 66,6 |
| Aider-Polyglot | 12,9 | 9,8 | 13,8 |
| IFEval | 83,4 | 74,5 | 81,2 |
| Arena-Hard v2 | 43,4 | 15,9 | 9,5 |
| Creative Writing v3 | 83,5 | 72,7 | 53,6 |
| WritingBench | 83,4 | 66,9 | 68,5 |
| BFCL-v3 | 61,9 | 53,0 | 57,6 |
| TAU1-Retail | 48,7 | 23,5 | 24,3 |
| TAU1-Airline | 32,0 | 14,0 | 16,0 |
| TAU2-Retail | 40,4 | - | 28,1 |
| TAU2-Airline | 24,0 | - | 12,0 |
| TAU2-Telecom | 13,2 | - | 17,5 |
| MultiIF | 69,0 | 60,7 | 61,3 |
| MMLU-ProX | 61,6 | 56,2 | 49,6 |
| INCLUDE | 60,1 | 58,6 | 53,8 |
| PolyMATH | 31,1 | 15,6 | 16,6 |

Métricas específicas de la variante heretic:

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 1,5593 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8 GB solo para pesos (4,0B parámetros), más overhead de activaciones y caché KV; en la práctica se recomiendan 10-12 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se listan cuantizaciones oficiales en la información disponible.
- GPU recomendadas: A100, H100 o L40S para despliegue con contexto completo de 262.144 tokens; RTX 4090, RTX 3090 o RTX 4080 para inferencia en BF16 con contextos reducidos.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con holgura en BF16 para contextos moderados; en GPUs de 8-12 GB requiere cuantización.
- Opciones de despliegue: transformers (>=4.51.0), vLLM (>=0.8.5), SGLang (>=0.4.6.post1), TGI (etiqueta `text-generation-inference` presente), llama.cpp/Ollama si se generan cuantizaciones GGUF (no listadas).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-heretic | 4,0B | 262.144 | Apache 2.0 | Variante decensored con ablación ARA; 3/100 rechazos |
| Qwen3-4B-Instruct-2507 (base) | 4,0B | 262.144 | Apache 2.0 | Modelo original alineado; 100/100 rechazos; benchmarks de referencia superiores en la mayoría de tareas |
| Qwen3-4B Non-Thinking | 4,0B | No disponible | Apache 2.0 | Versión previa; rendimiento inferior en MMLU-Pro (58,0 vs 69,6) y AIME25 (19,1 vs 47,4) |
| GPT-4.1-nano-2025-04-14 | No disponible | No disponible | Propietaria | Referencia comercial; inferior en MMLU-Pro (62,8), GPQA (50,3) y AIME25 (22,7) |

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ofensivo o ilegal según el contexto; no es apto para despliegue público sin moderación externa.
- La divergencia KL de 1,5593 respecto al modelo base indica una alteración distribucional significativa; no se han publicado benchmarks de capacidades para esta variante, por lo que se desconoce el grado de degradación en tareas de razonamiento, código o matemáticas.
- Riesgo elevado de alucinación y de respuestas confiadas sobre temas sensibles, dado que se ha reducido la tendencia a declinar peticiones.
- No se especifican los idiomas soportados de forma explícita; las capacidades multilingües se heredan del base pero no están garantizadas tras la ablación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; el uso comercial de un modelo decensored conlleva riesgos legales y reputacionales.
- El modelo solo opera en modo non-thinking; no admite razonamiento extendido con bloques `
