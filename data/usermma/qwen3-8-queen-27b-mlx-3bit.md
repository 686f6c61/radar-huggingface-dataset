# usermma/Qwen3.8-Queen-27B-mlx-3Bit

## Resumen

El modelo `usermma/Qwen3.8-Queen-27B-mlx-3Bit` es una conversión al formato MLX (Apple Silicon) del modelo `aifeifei798/Qwen3.8-Queen-27B`, un modelo de lenguaje orientado a roleplay, escritura creativa y narración de historias. La conversión fue realizada con `mlx-lm` versión 0.31.2 y aplica una cuantización de 3 bits, lo que reduce significativamente el tamaño del modelo (11.8 GB en el repositorio) para permitir su ejecución eficiente en equipos con Apple Silicon.

A pesar del nombre "27B", los pesos reales en safetensors suman 3.364.314.624 parámetros (aproximadamente 3.36 mil millones), por lo que se trata de un modelo de tamaño medio-bajo. Está diseñado para su uso con tarjetas de personaje y herramientas como SillyTavern, lo que lo hace especialmente adecuado para chatbots conversacionales con personalidad y generación de narrativa interactiva.

La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. No se dispone de información detallada sobre la arquitectura interna, el entrenamiento o los benchmarks del modelo original, por lo que esta ficha se basa únicamente en los datos publicados en la conversión MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, sin confirmar) |
| Parametros totales | 3.364.314.624 (~3.36 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base `aifeifei798/Qwen3.8-Queen-27B`. El nombre sugiere una relación con la familia Qwen, pero no se confirma si se trata de un transformer estándar, una variante con atención lineal u otra innovación. Tampoco se conocen los datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La única transformación documentada es la conversión a MLX con cuantización de 3 bits, realizada con `mlx-lm` 0.31.2, que no altera la arquitectura subyacente sino solo la representación de los pesos.

## Capacidades

- Generación de texto libre, especialmente optimizado para roleplay y narración creativa.
- Soporte de tarjetas de personaje (character cards), lo que permite definir personalidades, historias y estilos de respuesta.
- Integración con SillyTavern, una interfaz popular para juegos de rol y chats con personajes.
- Conversación multi-turno (no se especifica límite de contexto).
- Sin información sobre tool calling, razonamiento avanzado, visión u otras capacidades multimodales, a pesar de que el pipeline se etiqueta como `image-text-to-text`.

## Casos de uso

- Chatbots de roleplay en SillyTavern: el modelo está específicamente diseñado para interpretar personajes con tarjetas de personaje, manteniendo coherencia narrativa en conversaciones largas.
- Escritura creativa asistida: generación de cuentos, diálogos y escenas para autores que necesitan un asistente con estilo narrativo.
- Juegos de rol de mesa online: el modelo puede actuar como director de juego o como personaje no jugador (PNJ) en partidas de rol.
- Prototipado de asistentes conversacionales con personalidad: para desarrolladores que quieren probar interacciones con distintos arquetipos de personaje.
- Generación de contenido para videojuegos: diálogos y narrativas ramificadas para misiones o eventos.
- Experimentación con cuantización 3-bit en Apple Silicon: sirve como caso de estudio para evaluar el impacto de la cuantización agresiva en tareas creativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su base.

## Requisitos de hardware

- Al ser un modelo MLX de ~3.36 B parámetros en 3 bits, el tamaño en memoria es aproximadamente 3.36 B × 3 bits / 8 ≈ 1.26 GB, más overhead del tokenizador y buffers, lo que lo hace ejecutable en Mac con al menos 8 GB de RAM unificada.
- Diseñado para Apple Silicon (M1, M2, M3, M4) mediante `mlx-lm`.
- No se recomienda para GPUs NVIDIA sin conversión adicional (aunque los safetensors podrían usarse con transformers, el formato MLX es específico para Apple).
- Despliegue típico con `mlx-lm` en Python, con opciones de generación configurables (temperatura, top-p, etc.).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. En términos de tamaño, se acerca a modelos como Llama 3.2 3B o Gemma 3 4B, pero sin benchmarks no es posible establecer una comparación objetiva. La cuantización 3-bit probablemente degrade la calidad frente a versiones de 4 u 8 bits, pero no hay mediciones publicadas.

## Limitaciones y advertencias

- La cuantización a 3 bits puede producir una pérdida notable de calidad en tareas complejas (razonamiento, matemáticas, código) y aumentar la tasa de alucinaciones.
- No se dispone de información sobre sesgos, toxicidad o riesgos específicos del modelo base.
- El pipeline etiquetado como `image-text-to-text` no está respaldado por documentación; probablemente sea un error de etiquetado, ya que el modelo parece ser solo de texto.
- El nombre del modelo ("27B") no coincide con el número real de parámetros (3.36 B), lo que puede causar confusión.
- No hay garantía de soporte para tool calling, funciones de agente o razonamiento multi-paso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener restricciones adicionales no documentadas en esta conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/usermma/Qwen3.8-Queen-27B-mlx-3Bit
- Modelo base: https://huggingface.co/aifeifei798/Qwen3.8-Queen-27B
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
