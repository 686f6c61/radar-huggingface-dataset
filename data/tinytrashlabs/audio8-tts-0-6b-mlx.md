# tinytrashlabs/Audio8-TTS-0.6B-MLX

## Resumen

Audio8-TTS-0.6B-MLX es un reempaquetado del modelo de síntesis de voz Edge0/Audio8-TTS-Realistic-0.6b, publicado por tinytrashlabs. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de Edge0, sin alterar ni cuantizar, reorganizados para que el loader Fish DualAR de la librería TinyTrashLabs/mlx-audio-swift (PR #20) pueda cargarlos. El resultado es un modelo de text-to-speech de 601 millones de parámetros en formato MLX, orientado a inferencia en hardware Apple Silicon.

El modelo resuelve el problema de ejecutar TTS con clonación de voz en el ecosistema MLX, donde los checkpoints originales en formato PyTorch no son directamente utilizables. La conversión afecta a la estructura de los tensores (transformadores slow y fast bajo el prefijo `model.*` en `model.safetensors`), al codec (de `codec.pth` a `codec.safetensors`) y al `config.json`, que se reescribe con el layout `fish_qwen3_omni`. La licencia Apache 2.0 se hereda del modelo fuente.

La relevancia es acotada pero clara: es una pieza de infraestructura para quien quiera usar Audio8 en Swift/MLX sin pasar por PyTorch. Con 37 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho, no un modelo de referencia. La información pública sobre arquitectura interna, datos de entrenamiento y benchmarks es mínima, y esta ficha lo refleja explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fish DualAR (transformador dual slow/fast) con codec de audio; layout de config `fish_qwen3_omni` |
| Parametros totales | 601.159.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos no están cuantizados en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `codec.safetensors`), formato MLX |

## Arquitectura y entrenamiento

La arquitectura es la del modelo fuente Edge0/Audio8-TTS-Realistic-0.6b, descrita en los tags del repo como `fish_qwen3_omni`. El loader de destino es el Fish DualAR, lo que implica una estructura de dos transformadores: uno lento y otro rápido, junto con un codec de audio que convierte entre formas de onda y tokens discretos. El reempaquetado separa los tensores de ambos transformadores bajo `model.*` en `model.safetensors` y convierte el codec a `codec.safetensors`. El `config.json` sigue el layout Fish con `scale_codebook_embeddings: false` y dos claves específicas de Audio8: `max_frames_per_text_token: 12.0` y `reference_budget_scale: 1.95`.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El autor del reempaquetado declara explícitamente que no ha alterado ni cuantizado los pesos, por lo que cualquier innovación técnica en el entrenamiento corresponde a Edge0 y no se documenta en esta ficha. La única modificación técnica es de formato: reescritura de config y conversión del codec de `.pth` a `.safetensors`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto.
- Clonación de voz, según los tags del repositorio (`voice-cloning`).
- Inferencia nativa en MLX, pensada para hardware Apple Silicon.
- Carga mediante el loader Fish DualAR de TinyTrashLabs/mlx-audio-swift.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es específico de TTS).
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (visión, audio de entrada, modo thinking): no disponible.

## Casos de uso

- Síntesis de voz en aplicaciones macOS/iOS: el formato MLX permite ejecutar el modelo en el propio dispositivo Apple sin depender de PyTorch, integrándolo en apps Swift mediante mlx-audio-swift.
- Clonación de voz para locuciones personalizadas: los tags indican soporte de voice cloning, útil para generar audiolibros o narraciones con una voz de referencia concreta.
- Prototipado rápido de TTS en entornos Apple: al no requerir CUDA, un Mac con Apple Silicon sirve como banco de pruebas para pipelines de voz antes de escalar a producción.
- Generación de audio para asistentes conversacionales: el modelo produce voz a partir de texto y puede alimentar la capa de salida de un asistente que ya gestione el diálogo por su cuenta.
- Investigación en TTS comparativo: al ser un reempaquetado fiel de Audio8, permite reproducir los resultados del modelo original en MLX y comparar el rendimiento entre backends.
- Integración en herramientas de accesibilidad: lectura en voz alta de contenido con voces clonadas para usuarios que necesiten una voz familiar o concreta.
- Evaluación de la librería mlx-audio-swift: sirve como caso de prueba real del loader Fish DualAR y del PR #20, útil para quien contribuya a esa librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 601 M de parámetros en safetensors sin cuantizar y un repo de 2,6 GB, el peso en memoria ronda los 2,4-2,6 GB en fp32/bf16, más el codec y los buffers de inferencia.
- GPU recomendadas: no se declaran. El formato MLX apunta a Apple Silicon (series M1, M2, M3, M4); no hay soporte CUDA documentado en este repo.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en cualquier Mac con Apple Silicon con memoria unificada suficiente (8 GB o más como referencia orientativa). En GPU NVIDIA de consumo no está soportado por este reempaquetado.
- Opciones de despliegue: mlx-audio-swift (loader Fish DualAR, PR #20). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-0.6B-MLX (este) | 601 M | no disponible | MLX safetensors | Apache 2.0 | Reempaquetado para Apple Silicon |
| Edge0/Audio8-TTS-Realistic-0.6b | no disponible | no disponible | PyTorch (original) | Apache 2.0 | Modelo fuente; mismos pesos |
| Alternativas TTS de ~0,5-1 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparativa con otros modelos TTS de tamaño similar no puede completarse con datos verificables a partir de la información disponible. La única comparación sólida es con el modelo fuente, del que este repo es una conversión de formato sin cambios en los pesos.

## Limitaciones y advertencias

- No es un modelo original: todos los méritos corresponden a Edge0; este repo solo reorganiza pesos y config.
- La model card no documenta sesgos, idiomas ni comportamiento en dominios concretos; cualquier evaluación de calidad debe hacerse empíricamente.
- Riesgo de alucinación no evaluado: en TTS se traduce en prosodia incorrecta, artefactos o pronunciación errónea, pero no hay datos publicados al respecto.
- Sin información sobre longitud de contexto ni límites de texto de entrada; `max_frames_per_text_token: 12.0` sugiere una relación frames/token fija que conviene validar.
- Dependencia de una librería externa concreta (mlx-audio-swift, PR #20): si ese PR no se fusiona o cambia, la carga puede romperse.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repo fuente por si hay atribuciones adicionales.
- Advertencia de seguridad: la clonación de voz puede usarse para suplantación; no hay salvaguardas documentadas en este repo.
- Madurez baja: 37 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública conocida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinytrashlabs/Audio8-TTS-0.6B-MLX
- Modelo fuente: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Librería de carga (MLX/Swift): https://github.com/TinyTrashLabs/mlx-audio-swift
- PR del loader Fish DualAR: PR #20 del repositorio anterior (no se dispone de URL directa en la información proporcionada)
