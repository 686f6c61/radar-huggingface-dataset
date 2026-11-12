# swaynehales/Emberon-2-mlx-fp16

## Resumen

Emberon-2 MLX fp16 es una conversión nativa al formato MLX del modelo Emberon-2 de Promethic Labs, un ajuste fino de 354 millones de parámetros especializado en limpieza de texto dictado. El modelo parte de Liquid AI LFM2.5-350M y ha sido entrenado específicamente para una única tarea: tomar transcripciones de voz en bruto y devolverlas como texto limpio y bien puntuado, sin responder a preguntas ni ejecutar comandos que aparezcan en el dictado. Esta conversión concreta, publicada por el usuario swaynehales, preserva los pesos del archivo GGUF F16 original y los adapta al ecosistema MLX de Apple Silicon.

La relevancia de esta ficha radica en que se trata de una distribución de formato y precisión, no de un modelo nuevo: los pesos provienen íntegramente de `Emberon-2-F16.gguf` y solo la configuración y los activos del tokenizador se toman del repositorio base de MLX. El modelo está pensado para ejecutarse localmente en hardware Apple Silicon mediante `mlx-lm`, con decodificación greedy y un system prompt fijo, lo que lo convierte en una pieza de infraestructura para pipelines de postprocesado de voz más que en un asistente conversacional.

Con 354.483.968 parámetros reales según los safetensors y un tamaño de repositorio de 0,7 GB, el modelo es deliberadamente pequeño y cabe con holgura en memoria unificada de equipos de consumo. Su licencia LFM Open License v1.0 se hereda de LFM2.5-350M, y el modelo solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid AI LFM2.5), transformer; detalles internos no disponibles |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128k configurados, según la model card; no validado en la conversión |
| Tipos de cuantización | FP16 en esta distribución; el modelo base upstream ofrece GGUF F16 y Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de Liquid AI LFM2.5-350M |
| Formato de pesos | safetensors (MLX), convertidos desde GGUF F16 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM2 de Liquid AI, concretamente en LFM2.5-350M, un transformer de 354 millones de parámetros. Promethic Labs realizó un ajuste fino sobre esta base para especializarlo en limpieza de dictado, una tarea de transformación de texto donde la entrada es una transcripción oral con muletillas, repeticiones y falta de puntuación, y la salida es el mismo contenido en texto limpio. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La conversión a MLX fue realizada por swaynehales a partir del archivo `Emberon-2-F16.gguf` (SHA-256 `056a4b0889eb5b9873d9f38393f5e595fb58c6ffd82b47fde76b9169f602f5a1`). Todos los pesos ajustados provienen de ese archivo; solo la configuración y los activos del tokenizador se tomaron del repositorio base MLX original. Se preservan las 65.536 filas de embeddings, los 64.402 IDs de token reales, las fusiones BPE y la plantilla de chat. No se requiere código remoto del modelo. La validación local cubrió recarga nativa, integridad de tensores y configuración, paridad de tokens de prompt y 11 entradas sintéticas de dictado, con coincidencia exacta de texto respecto al GGUF fuente en 11/11 entradas, incluida una entrada de estrés repetitiva que también se trunca en el GGUF original. El autor advierte que este conjunto reducido no establece equivalencia amplia de precisión ni valida el límite de contexto de 128k.

## Capacidades

- Limpieza de texto dictado: convierte transcripciones orales en texto escrito con puntuación y mayúsculas correctas.
- Eliminación de muletillas, repeticiones y errores típicos del habla espontánea.
- Normalización de preguntas y comandos presentes en el dictado: los devuelve como texto limpio sin responderlos ni ejecutarlos.
- Generación de texto conversacional básica según el pipeline declarado (`text-generation`).
- Soporte de plantilla de chat con roles system y user.
- Capacidad multilingüe: no disponible; solo declara inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está explícitamente diseñado para no actuar como asistente general.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Postprocesado de dictado por voz en aplicaciones de productividad: el modelo recibe la transcripción bruta de un motor ASR y devuelve texto limpio y puntuado, integrándose como paso final del pipeline antes de insertar el texto en un editor.
- Limpieza de notas de reuniones transcritas: se puede procesar cada intervención dictada para eliminar muletillas y repeticiones, manteniendo el contenido literal sin que el modelo responda a las preguntas planteadas en la reunión.
- Preprocesado de entradas para asistentes conversacionales: limpiar el dictado del usuario antes de enviarlo a un LLM mayor evita que las muletillas y la falta de puntuación degraden la calidad de la respuesta del modelo principal.
- Automatización de correos y mensajes dictados: el modelo normaliza el texto dictado para que pueda enviarse directamente, con un system prompt fijo y decodificación greedy que garantizan reproducibilidad.
- Herramientas de accesibilidad: usuarios con movilidad reducida que dependen del dictado pueden obtener texto escrito de calidad sin revisión manual exhaustiva, ejecutando el modelo localmente en un Mac.
- Pipelines de subtitulado y transcripción: limpieza de subtítulos generados automáticamente para mejorar legibilidad antes de su publicación, con la precaución de conservar la transcripción original como fallback si la salida se trunca.
- Prototipado local en Apple Silicon: servir como componente de prueba en flujos de postprocesado de voz sin depender de APIs externas, gracias a su tamaño de 0,7 GB y su ejecución mediante `mlx-lm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una validación de conversión con 11 entradas sintéticas de dictado y coincidencia exacta de texto con el GGUF fuente en 11/11 casos, lo que no constituye una evaluación de calidad amplia ni equivale a los benchmarks publicados del GGUF upstream.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7 GB para los pesos, más overhead de activaciones y KV cache; en la práctica, menos de 2 GB de memoria unificada para contextos cortos.
- Hardware objetivo: Apple Silicon (la librería es MLX); probado con Python 3.13, `mlx-lm==0.31.3` y `mlx==0.32.4`.
- Cabe en cualquier Mac con Apple Silicon; el tamaño reducido lo hace apto para equipos de consumo con memoria unificada de 8 GB o superior.
- GPU NVIDIA: esta distribución MLX no está pensada para CUDA; para esas plataformas habría que usar el GGUF original con llama.cpp.
- Opciones de despliegue: `mlx-lm` con `load` y `stream_generate`; para el modelo upstream, llama.cpp con los GGUF F16 o Q4_K_M.
- Latencia y throughput: no disponibles. La decodificación greedy con `temp=0` y un límite de tokens calculado como longitud del input más 64 es la configuración recomendada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Emberon-2 MLX fp16 (esta ficha) | 354M | 128k configurados, no validados | en | LFM Open License v1.0 | safetensors MLX |
| Emberon-2 (Promethic Labs) | 354M | 128k configurados | en | LFM Open License v1.0 | GGUF F16, Q4_K_M |
| Liquid AI LFM2.5-350M | 350M | no disponible | no disponible | LFM Open License v1.0 | no disponible |

La comparación con alternativas de la misma categoría (modelos especializados en limpieza de dictado de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un asistente general: preguntas y comandos en la transcripción deben devolverse como texto limpio, nunca responderse ni ejecutarse.
- Dictados largos o repetitivos pueden perder contenido o repetirse; el autor recomienda conservar la transcripción original como fallback si la generación alcanza el límite de tokens.
- La validación de la conversión es limitada: 11 entradas sintéticas no demuestran equivalencia amplia de precisión ni validan el contexto de 128k.
- Se reportó una discrepancia de tokenización en 8 de 57 entradas sintéticas (incluidas entradas con palabras no inglesas) frente a la tokenización de llama.cpp del GGUF Q4_K_M con vocabulario recortado; no se ha establecido qué partición coincide con el entrenamiento upstream ni si afecta a la calidad.
- Solo soporta inglés; no hay datos sobre sesgos, alucinación o comportamiento fuera de la tarea para la que fue ajustado.
- Licencia LFM Open License v1.0: es necesario revisar los términos originales y conservar LICENSE y NOTICE al redistribuir; las restricciones concretas de uso comercial no se detallan en la información disponible.
- Es una distribución modificada de formato y precisión; los nombres no implican respaldo por parte de Liquid AI ni de Promethic Labs.
- Requiere `mlx-lm==0.31.3` y `mlx==0.32.4` según las pruebas del autor; otras versiones pueden no ser compatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swaynehales/Emberon-2-mlx-fp16
- Modelo base (Promethic Labs): https://huggingface.co/PromethicLabs/Emberon-2
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Sitio de Promethic Labs: https://www.promethic.xyz
- Archivos de procedencia y modificaciones: CONVERSION.json y MODIFICATIONS.md en el repositorio del modelo
- Licencia: LICENSE y NOTICE incluidos en el repositorio del modelo
