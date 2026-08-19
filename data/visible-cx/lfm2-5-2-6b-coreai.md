# visible-cx/LFM2.5-2.6B-CoreAI

## Resumen

LFM2.5-2.6B-CoreAI es una conversión del modelo LFM2.5-2.6B de Liquid AI al formato `.aimodel` de Core AI, realizada por el proyecto Visible (visible.cx). El objetivo es ejecutar este modelo de forma nativa en chips Apple silicon a través del runtime Core AI, sin depender de PyTorch, GGUF ni MLX. Se trata de un artefacto derivado: los pesos son de Liquid AI, reexpresados como un grafo Core AI con cuantización int8 simétrica por bloques de 32 y dos puntos de entrada (decodificación y prefill fragmentado de 64 tokens).

El modelo base, LFM2.5-2.6B, es un modelo denso de 2.600 millones de parámetros diseñado por Liquid AI para cargas de trabajo agénticas en dispositivos, con una ventana de contexto de 128.000 tokens y soporte nativo de tool calling. La conversión de Visible mantiene la arquitectura híbrida LFM2 y añade un parche sobre la plantilla de chat que cierra el bloque de pensamiento (`thinking`), evitando el consumo de entre 684 y 919 tokens de razonamiento por cada generación. Según el autor, es el modelo de mayor calidad de su catálogo para tareas de enriquecimiento de datos, y el que la aplicación Visible selecciona como su nivel de calidad superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (densa, con atención lineal y estado convolucional) |
| Parametros totales | 2.600 millones (2.6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; manifiestos Core AI a 4.096, 8.192 y 16.384 |
| Tipos de cuantizacion | int8 simétrica por bloques de 32 (per-K-block-32), cabeza simétrica |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 |
| Formato de pesos | `.aimodel` (Core AI), int8; no compatible con PyTorch, GGUF ni MLX |

## Arquitectura y entrenamiento

LFM2.5-2.6B pertenece a la familia LFM2.5 de Liquid AI, construida sobre la arquitectura LFM2 optimizada para despliegue en dispositivos. Es un modelo denso de 2.6B con arquitectura híbrida: combina componentes de atención lineal con un estado convolucional fijo (`convState` de dimensiones 22 × 1 × 2048 × 2 en fp16) y una caché KV dinámica (`keyCache`/`valueCache` de dimensiones 8 × 1 × 8 × ? × 64 en fp16). La dimensión de secuencia es dinámica, por lo que el runtime resuelve una `GrowingKVCache` con capacidad inicial de 256 tokens que se duplica, en lugar de reservar el máximo del manifiesto. Según Liquid AI, la familia LFM2.5 se entrenó con preentrenamiento extendido y aprendizaje por refuerzo sobre la base de LFM2; no se han publicado detalles del número de tokens ni de la composición del dataset en la información disponible.

La conversión de Visible aplica cuantización int8 simétrica por bloques de 32 con cabeza simétrica, y expone dos puntos de entrada: `main` para decodificación con secuencia de longitud 1 y `prefill` para prefill fragmentado de 64 tokens, con pesos deduplicados entre ambos. El vocabulario es de 128.000 tokens. El contrato del motor es de dos entradas (`input_ids` y `position_ids`) que producen logits, sin máscaras estáticas por paso, lo que habilita la decodificación restringida por gramática en el motor secuencial. El parche sobre `chat_template.jinja` cierra el bloque de pensamiento (cambia `<|im_start|>assistant\n thinking` por `<|im_start|>assistant\n thinking response`), una corrección que se aplica post-exportación y no está incluida en el exportador original.

## Capacidades

- Generación de texto autorregresiva con prefill fragmentado de 64 tokens y decodificación paso a paso.
- Razonamiento agéntico multi-paso: el modelo está entrenado para planificar, llamar a herramientas y ejecutar tareas secuenciales en el dispositivo.
- Tool calling nativo: soporte integrado de llamada a funciones en el modelo base, sin necesidad de adaptadores externos.
- Modo "thinking" siempre activo: el modelo razona antes de emitir la respuesta final; la plantilla parcheada cierra el bloque de pensamiento para evitar tokens de razonamiento innecesarios.
- Decodificación restringida por gramática: el contrato de dos entradas permite generar salidas JSON estructuradas mediante el motor secuencial con soporte de logits; verificado con 10/10 aciertos en el esquema `app_litert` de la aplicación Visible.
- Ejecución íntegra en dispositivo: sin dependencia de servidores externos, con un pico de RSS de 4,43 GB en un Mac de 16 GB.

## Casos de uso

- Enriquecimiento de datos en dispositivos Apple: el modelo está seleccionado por el proyecto Visible como su nivel de calidad superior para enriquecer publicaciones y comentarios, generando respuestas JSON estructuradas según esquema con una tasa de parseo guiado de 10/10.
- Agentes locales en macOS: al ejecutarse íntegramente en el dispositivo, permite desplegar agentes que planifican y llaman a herramientas sin conexión a servidores, con una huella de memoria de 4,43 GB.
- Asistencia de redacción con razonamiento visible: el modo thinking siempre activo permite generar respuestas razonadas antes del texto final, útil para resúmenes, análisis de contenido y redacción asistida en entornos sin conexión.
- Extracción de información estructurada: la decodificación guiada por gramática permite extraer campos concretos de textos libres en formato JSON, como entidades, sentimientos o metadatos, con validación de esquema en tiempo de generación.
- Automatización de respuestas en foros y comentarios: con latencias de 3,04 a 3,62 segundos por fila de hasta 128 tokens en un M2 Pro, puede procesar colas de comentarios y generar respuestas contextualizadas de forma autónoma.
- Prototipado de agentes agénticos en local: la ventana de contexto declarada de hasta 16.384 tokens en el manifiesto Core AI permite mantener conversaciones multi-turno con historial sin salir del dispositivo, adecuado para pruebas de concepto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento medidos son los siguientes:

| Metrica | Valor |
|---|---|
| Decodificacion (modelo base, M5 Max) | 220 tokens/s |
| Decodificacion (modelo base, Ryzen AI Max+ 395) | 113 tokens/s |
| Carga en frio (M2 Pro 16 GB, Core AI) | 39,5 s |
| Tiempo por fila POST (M2 Pro 16 GB, Core AI) | 3,62 s |
| Tiempo por fila COMMENT (M2 Pro 16 GB, Core AI) | 3,04 s |
| Pico de RSS (M2 Pro 16 GB, Core AI) | 4,43 GB |
| Parseo JSON guiado | 10/10 |
| Token de parada | `<\|im_end\|>`, auto-parada limpia en todas las filas |

La conversión Core AI es aproximadamente 2× más lenta que la variante de 1.2B del mismo catálogo (1,77/1,30 s por fila), lo que coincide con la relación de parámetros
