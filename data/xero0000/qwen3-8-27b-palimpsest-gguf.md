# xero0000/Qwen3.8-27B-Palimpsest-GGUF

## Resumen

Qwen3.8-27B-Palimpsest-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.8-27B-Palimpsest, un fine-tune experimental de Qwen3.8-27B orientado a prosa literaria, continuidad narrativa, uso estructurado de herramientas y comportamiento de contexto largo consciente de la posición. Desarrollado por xero0000, este modelo busca ofrecer una alternativa eficiente para tareas de generación de texto con ventanas de contexto muy amplias (hasta 262.144 tokens nativos, ampliables mediante YaRN). La versión GGUF permite su ejecución en hardware de consumo mediante llama.cpp y ecosistemas compatibles.

El modelo se distribuye en varias cuantizaciones, siendo la principal MIX-IQ3KT, un archivo mixto calibrado por importancia que ocupa 11,7 GB y se mantiene por debajo del objetivo de 12 GB del proyecto. Incluye también cuantizaciones convencionales K-quant (Q4_K_M, Q5_K_M, Q6_K) como controles y para mayor compatibilidad. El fine-tune combina dos etapas LoRA: una de comportamiento/prosa/herramientas y otra de contexto largo estilo PoSE con posiciones virtuales hasta 1M. El modelo está en fase de evaluación, con resultados preliminares locales que muestran paridad con el modelo base en pruebas de recuperación y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (ampliable hasta 1.048.576 con YaRN) |
| Tipos de cuantizacion | MIX-IQ3KT (3,424 BPW efectivo), Q4_K_M (4,826 BPW), Q5_K_M (5,670 BPW), Q6_K (BPW pendiente) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.320 millones de parámetros, aunque no se proporcionan detalles adicionales sobre su arquitectura interna (número de capas, cabezas de atención, etc.). El fine-tune Palimpsest fusiona dos etapas LoRA sobre los pesos BF16 originales: la primera, una mezcla de 1.152 ejemplos de comportamiento, prosa y herramientas, seleccionada en el paso 64; la segunda, una etapa de contexto largo estilo PoSE de 80 pasos que actualiza únicamente los módulos LoRA Q/K en las 16 capas de atención completa, con posiciones virtuales hasta 1M. Esta combinación busca mejorar la continuidad narrativa, el uso de herramientas y el comportamiento en contextos largos sin degradar el rendimiento en contextos cortos.

El modelo se distribuye en formato GGUF, cuantizado directamente desde el GGUF BF16 fusionado, sin recuantización desde archivos con pérdida. El archivo mixto MIX-IQ3KT contiene 866 tensores con una combinación de tipos de cuantización (F32, Q5_K, IQ4_NL, IQ3_S, IQ3_KT, IQ4_KT, IQ3_KS) y una matriz de importancia calibrada con 433 entradas de 256 fragmentos (65.536 tokens) equilibrados entre uso de herramientas, prosa, texto general y ejemplos de posición virtual. El modelo soporta MTP (multi-token prediction) y requiere una compilación reciente de llama.cpp con soporte para la arquitectura Qwen3.8.

## Capacidades

- Generación de texto: prosa literaria, continuidad narrativa y escritura creativa, según el objetivo del fine-tune.
- Uso de herramientas (tool use): soporte para llamadas a funciones estructuradas, validado en la prueba local PACT-Q con 8/8 casos de recuperación/herramientas.
- Contexto largo: ventana nativa de 262.144 tokens, ampliable hasta 1.048.576 mediante YaRN estático, con comportamiento consciente de la posición gracias a la etapa PoSE.
- Razonamiento: resultados en subconjunto de GPQA-Diamond de 5/8, similar al modelo base.
- MTP (multi-token prediction): soporte indicado en los tags, aunque su equivalencia aún está en evaluación.
- Multilingüe: solo inglés declarado en la model card.

## Casos de uso

- Escritura creativa y literaria: el modelo está específicamente afinado para prosa y continuidad, por lo que puede usarse para redactar novelas, cuentos o guiones con coherencia a lo largo de capítulos extensos, aprovechando su ventana de 262K tokens para mantener el hilo narrativo.
- Asistentes de conversación con contexto largo: su capacidad de contexto nativo permite mantener conversaciones multi-turno muy largas sin perder información, ideal para chatbots de atención al cliente o asistentes personales que necesitan recordar interacciones previas.
- Agentes con uso de herramientas: el soporte de tool calling y la validación en PACT-Q lo hacen adecuado para integrarse en pipelines de automatización donde el modelo debe decidir y ejecutar llamadas a APIs o funciones.
- Análisis y resumen de documentos extensos: con 262K tokens de contexto, puede procesar libros completos, informes largos o código fuente extenso para generar resúmenes o extraer información relevante.
- Generación de código con contexto amplio: aunque no está específicamente afinado para código, su capacidad de contexto largo y tool use permite mantener el estado de un proyecto y generar fragmentos coherentes en repositorios grandes.
- Prototipado de aplicaciones de IA generativa: al ser un modelo de 27B en GGUF, puede ejecutarse en GPUs de consumo (con cuantización) para pruebas locales de generación de texto, reduciendo costes frente a APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una pantalla de calidad local determinista (8+8 casos) que no es una reproducción de los benchmarks públicos de Qwen:

| Variante | PACT-Q retrieval/tool cases | GPQA-Diamond subset | Errores |
|---|---|---|---|
| Control local upstream Q6_K | 8/8 | 5/8 | 0 |
| Palimpsest MIX-IQ3KT | 8/8 | 5/8 | 0 |

Los tres fallos de GPQA en ambas variantes alcanzaron el límite de salida sin la respuesta final requerida; no fueron errores de servidor. Ejecuciones de benchmarks públicos más grandes siguen pendientes.

También se reportan mediciones de velocidad controlada (con 3 GPUs: RTX 3060 Ti 8 GB + RTX 2080 SUPER 8 GB + RTX 3080 10 GB, 66 capas en GPU, división 8/8/10, 24 hilos, flash attention, batch 512, micro-batch 256, caché Q4_0 K/V):

| Quant | PP512 tok/s | PP4096 tok/s | TG128 tok/s |
|---|---|---|---|
| MIX-IQ3KT | 607,49 ± 71,79 | 642,81 ± 1,34 | 24,48 ± 0,26 |
| Q4_K_M | 617,21 ± 50,22 | 630,04 ± 5,53 | 26,95 ± 0,07 |

Q4_K_M es 4,79 GB más grande
