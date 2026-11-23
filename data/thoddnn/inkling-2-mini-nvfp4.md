# thoddnn/Inkling-2-Mini-nvfp4

## Resumen

Inkling-2-Mini-nvfp4 es una conversión a MLX del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario thoddnn (organización nativ-community en el runtime asociado). Se trata de un modelo de arquitectura MoE (mixture of experts) con capacidad image-text-to-text, es decir, acepta entradas de texto e imagen y genera texto. El checkpoint conserva la precisión mixta nativa del modelo original: las primeras 20 capas MoE mantienen pesos de expertos en NVFP4 y las cuatro últimas en MXFP8, mientras el resto de parámetros permanecen en BF16/FP32.

La relevancia de esta ficha es doble. Por un lado, documenta una conversión de cuantización para el ecosistema MLX (Apple Silicon), con un runtime parcheado específico que añade soporte para el bucle de tres pasadas (`inkling2_loop`) del modelo base. Por otro, es un ejemplo de despliegue de un modelo de 26.388.641.280 parámetros totales (unos 26,4 mil millones) en un formato de 19,53 GB para pesos objetivo más 0,64 GB de draft especulativo, lo que permite ejecutarlo en equipos Apple con 32 GB o más de memoria unificada.

El modelo base está desarrollado por thinkingmachines y esta conversión no aporta entrenamiento nuevo: reproduce fielmente los tensores del checkpoint original. La licencia es Apache 2.0. La información disponible sobre arquitectura, entrenamiento y benchmarks del modelo base es limitada en esta ficha, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con bucle de tres pasadas (`inkling2_loop`); 24 capas físicas de decoder que ejecutan 48 visitas de capa |
| Parametros totales | 26.388.641.280 (26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens anunciados por el modelo base; no ejercitados en las comprobaciones de la conversión |
| Tipos de cuantizacion | NVFP4 (primeras 20 capas MoE), MXFP8 (últimas 4 capas MoE), BF16/FP32 en el resto de parámetros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4 shards; draft especulativo en `mtp.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con un diseño de bucle: 24 capas físicas de decoder que se ejecutan en 48 visitas de capa mediante un bucle central de tres pasadas. El checkpoint conserva la precisión mixta nativa del modelo original, con expertos en NVFP4 en las primeras 20 capas MoE y en MXFP8 en las cuatro últimas; el resto de parámetros mantiene BF16/FP32. Incluye un draft especulativo DSpark empaquetado como `mtp.safetensors` (0,64 GB), lo que habilita decodificación especulativa.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión no reentrena ni recuantiza los expertos del modelo fuente: se limita a transformar el checkpoint original (revisión `6e7c8248f75265bdd4fbab5273304243b5d8c2cb`) al formato MLX. La validación reporta que los 1.271 tensores objetivo son exactamente iguales a los tensores fuente saneados, incluyendo pesos empaquetados, escalas y parámetros en coma flotante, y que las puertas de mensaje del bucle y la atención de mensaje se compararon con la implementación de Transformers en tensores FP32 pequeños con error absoluto máximo inferior a 4e-7.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen y texto con salida de texto (pipeline image-text-to-text): descripción de imágenes y respuesta a preguntas sobre contenido visual.
- Modo de razonamiento configurable mediante `reasoning_effort` (por ejemplo, `"none"`), aunque el modelo puede emitir razonamiento incluso con ese valor; los tokens de mensaje distinguen el razonamiento de la respuesta final.
- Decodificación especulativa con el draft DSpark empaquetado, que acelera la generación manteniendo la misma salida codiciosa en las pruebas realizadas.
- Razonamiento aritmético básico verificado en las comprobaciones de humo sobre Apple M3 Ultra.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo puede gestionar diálogos multi-turno en un Mac con 32 GB o más de memoria unificada, aprovechando el formato MLX y el draft especulativo para reducir la latencia de generación.
- Descripción y análisis de imágenes en local: con el pipeline image-text-to-text se pueden procesar capturas, diagramas o fotografías y generar descripciones o respuestas a preguntas sobre ellas sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Prototipado de aplicaciones multimodales en macOS: el runtime MLX-VLM parcheado permite integrar el modelo en scripts Python para validar flujos de imagen y texto antes de migrar a infraestructura de producción.
- Evaluación de cuantización de precisión mixta: investigadores pueden comparar el comportamiento de NVFP4 y MXFP8 en capas MoE frente al checkpoint BF16 original, usando los tests de paridad incluidos como referencia.
- Generación asistida con decodificación especulativa: el draft DSpark empaquetado permite medir el impacto del speculative decoding en throughput y latencia sobre hardware Apple, con la garantía de que la salida codiciosa coincide con la del modelo sin draft en las pruebas realizadas.
- Experimentación con contextos largos: el modelo base anuncia una ventana de 1M tokens, lo que permite probar tareas de resumen o recuperación sobre documentos extensos, aunque la conversión no ha ejercitado ese límite y requerirá memoria adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta comprobaciones de integridad de la conversión (1.271 tensores idénticos, 67 tests superados, error máximo inferior a 4e-7 en comparaciones FP32) y pruebas de humo cualitativas (aritmética, explicación de la flotación del hielo y reconocimiento de un círculo rojo), sin métricas de precisión tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Memoria: el modelo base recomienda Apple Silicon con 32 GB o más de memoria unificada; contextos más largos requieren memoria adicional.
- Tamaño en disco: 19,53 GB de pesos objetivo en cuatro shards más 0,64 GB de draft especulativo.
- GPU: orientado a Apple Silicon (MLX); no se documenta soporte para GPU NVIDIA o AMD en esta conversión.
- Cabe en GPU de consumo: no aplica en el sentido habitual; en Apple Silicon, un equipo con 32 GB de memoria unificada es el mínimo recomendado.
- Despliegue: MLX-VLM con el wheel parcheado `mlx_vlm-0.8.0+inkling2mini-py3-none-any.whl`, basado en el commit 392052b4439c de MLX-VLM. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; solo se indica que la generación con draft estándar y empaquetado produjo los mismos 45 tokens codiciosos en la prueba de aritmética.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La conversión no establece paridad numérica completa con el runtime original: MLX-VLM usa activaciones en coma flotante en lugar de la cuantización de activaciones del runtime de referencia.
- La ventana de contexto de 1M tokens anunciada no se ejercitó en las comprobaciones de la conversión; su comportamiento real a esa longitud es desconocido.
- El modelo puede emitir razonamiento incluso con `reasoning_effort="none"`; eliminar todos los tokens especiales concatena las secciones de razonamiento y respuesta final, lo que puede confundir a consumidores que no parseen los tokens de mensaje.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable como en cualquier modelo generativo.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: los idiomas soportados no están documentados.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución y los avisos correspondientes; el wheel del runtime conserva la licencia de MLX-VLM y sus avisos upstream.
- Dependencia de un runtime parcheado no oficial: la revisión base upstream no soportaba `inkling2_loop`, por lo que se requiere el wheel específico incluido en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thoddnn/Inkling-2-Mini-nvfp4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión del modelo base usada en la conversión: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/6e7c8248f75265bdd4fbab5273304243b5d8c2cb
- Runtime parcheado (wheel): https://huggingface.co/nativ-community/Inkling-2-Mini-nvfp4/resolve/main/runtime/mlx_vlm-0.8.0+inkling2mini-py3-none-any.whl
- Parche de código del runtime: runtime/inkling2-mini.patch (dentro del repositorio del modelo)
- MLX-VLM commit base: https://github.com/Blaizzy/mlx-vlm/tree/392052b4439cf027ab42674d9977f62bb3dfa056
- Metadatos de conversión: conversion.json (dentro del repositorio del modelo)
- Validación: validation.json (dentro del repositorio del modelo)
- Model card upstream: UPSTREAM_README.md (dentro del repositorio del modelo)
