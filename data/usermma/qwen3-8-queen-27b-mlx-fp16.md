# usermma/Qwen3.8-Queen-27B-mlx-fp16

## Resumen

El modelo `usermma/Qwen3.8-Queen-27B-mlx-fp16` es una conversión al formato MLX (Apple Silicon) del modelo `aifeifei798/Qwen3.8-Queen-27B`, un fine-tune de la familia Qwen3.8 orientado a roleplay, escritura creativa y narración de historias. El autor de la conversión, `usermma`, ha publicado este checkpoint en fp16 para que pueda ejecutarse de forma nativa en hardware Apple mediante la librería `mlx-lm`.

El modelo base incorpora etiquetas como `character-card` y `sillytavern`, lo que indica que está diseñado para integrarse con frontends de roleplay como SillyTavern y para trabajar con tarjetas de personaje. Aunque el pipeline declarado es `image-text-to-text`, no se dispone de información pública que confirme capacidades multimodales reales en esta conversión. Con aproximadamente 26.900 millones de parámetros, se sitúa en el rango de los modelos grandes de Qwen y resulta relevante para quienes buscan un generador de texto conversacional especializado en ficción y personajes, ahora accesible en equipos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (probablemente similar a Qwen3, no confirmado) |
| Parametros totales | 26.895.993.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `aifeifei798/Qwen3.8-Queen-27B`. Por el nombre y la familia, se asume que sigue el diseño de los modelos Qwen3, que emplean una arquitectura transformer con atención por ventanas y posibles optimizaciones propias de la serie. El proceso de entrenamiento del fine-tune no está documentado en la información proporcionada; solo se sabe que la conversión a MLX se realizó con `mlx-lm` versión 0.31.2, sin modificaciones en los pesos.

La ausencia de detalles sobre el dataset, el número de tokens de entrenamiento o el uso de técnicas como RLHF o DPO impide realizar afirmaciones al respecto. Se recomienda consultar la model card del modelo original para obtener más información.

## Capacidades

- Generación de texto conversacional especializada en roleplay y narración de historias, según las etiquetas declaradas (`roleplay`, `creative-writing`, `storytelling`).
- Soporte de tarjetas de personaje (`character-card`) y compatibilidad declarada con SillyTavern, lo que permite su uso en entornos de chat con personajes definidos.
- Pipeline declarado como `image-text-to-text`, aunque no se ha verificado si el modelo acepta realmente imágenes en esta conversión.
- Integración con `mlx-lm` para ejecución en Apple Silicon, con carga mediante `load()` y generación con `generate()`.
- Aplicación de plantillas de chat mediante `apply_chat_template` si el tokenizador las incluye.

## Casos de uso

- Roleplay interactivo en SillyTavern: el modelo puede actuar como un personaje con personalidad definida mediante tarjetas, manteniendo conversaciones coherentes y creativas en entornos de juego de rol.
- Escritura creativa asistida: generación de diálogos, descripciones y tramas para relatos, novelas o guiones, aprovechando su especialización en narrativa.
- Chatbots con personajes para aplicaciones de entretenimiento: creación de asistentes conversacionales con estilos de habla y trasfondos específicos.
- Prototipado de juegos de texto: desarrollo de aventuras conversacionales donde el modelo interpreta a múltiples personajes no jugadores.
- Generación de contenido para redes sociales o blogs de ficción: producción de historias cortas o microrelatos con un tono consistente.
- Experimentación con fine-tunes de Qwen en hardware Apple: sirve como punto de partida para evaluar el rendimiento de la familia Qwen3.8 en tareas creativas sin necesidad de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo en formato MLX, está pensado para Macs con Apple Silicon (M1, M2, M3 o superiores).
- El tamaño del repositorio es de 53.8 GB, por lo que se recomienda un Mac con al menos 64 GB de memoria unificada para cargar el modelo en fp16 sin cuantización adicional.
- Con cuantizaciones inferiores (por ejemplo, 8-bit o 4-bit) podría ejecutarse en equipos con 32 GB de memoria unificada, aunque no se proporcionan archivos cuantizados en este repo.
- La inferencia se realiza mediante `mlx-lm`; no es compatible con CUDA ni con librerías como vLLM o llama.cpp en su forma actual.
- No se dispone de datos de latencia o throughput; dependerán de la generación del chip (M1 Pro, M2 Max, M3 Ultra, etc.) y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva con otros modelos de la misma categoría. El modelo base es un fine-tune de Qwen3.8, pero se desconocen sus métricas frente a alternativas como Qwen3-27B original, Llama-3.1-8B o Mistral-7B. Se recomienda consultar benchmarks públicos de Qwen3 para una referencia general.

## Limitaciones y advertencias

- No hay información sobre el proceso de fine-tune, por lo que se desconocen los sesgos o alucinaciones específicos del modelo.
- La conversión MLX es un trabajo de la comunidad, no oficial de Qwen; puede haber diferencias de comportamiento respecto al checkpoint original en otros formatos.
- El pipeline `image-text-to-text` no está confirmado; es posible que el modelo no procese imágenes en esta versión.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar el modelo base original por si tuviera restricciones adicionales.
- No se especifican idiomas soportados; aunque Qwen suele ser multilingüe, la especialización en roleplay podría estar sesgada hacia el inglés.
- El tamaño del modelo (26.9B parámetros) requiere hardware con suficiente memoria; no es adecuado para equipos con menos de 32 GB de RAM unificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usermma/Qwen3.8-Queen-27B-mlx-fp16
- Modelo base (fine-tune): https://huggingface.co/aifeifei798/Qwen3.8-Queen-27B
- Librería `mlx-lm`: https://github.com/ml-explore/mlx-lm
