# Yi30/MiniMax-H3-FL2VA-SVD-MXFP4

## Resumen

MiniMax-H3-FL2VA-SVD-MXFP4 es un checkpoint cuantizado del modelo de generación de vídeo con audio MiniMax-H3, publicado por el usuario Yi30 como cuantización comunitaria no oficial. Concretamente contiene la variante FL2VA (first-last/first-frame latents to video+audio), en la que el transformer de difusión de 50 bloques se ha cuantizado con SVDQuant MXFP4 (W4A4) mientras que el codificador de texto, el tokenizer, el processor y los VAE de vídeo y audio se mantienen en BF16 a plena precisión. El objetivo es reducir el coste de memoria y de cómputo del transformer de difusión sin necesidad de mantener una referencia BF16 en inferencia.

La relevancia técnica del checkpoint está en que conserva los dos componentes críticos de SVDQuant (la corrección de bajo rango `proj_down`/`proj_up` y el residual cuantizado `qweight`/`wscales`, más el factor de suavizado), de modo que es autocontenido: 208 capas lineales SVD cuantizadas, 58 módulos en paso directo BF16 y 1.367 tensores en el transformer, con 34,58 GiB de pesos del transformer y 107,03 GiB para el repositorio FL2VA completo.

Es un modelo de difusión para medios generativos, no un LLM: no hay ventana de contexto conversacional ni razonamiento simbólico. La generación se controla por resolución, número de fotogramas, fps, pasos de inferencia y semilla; la validación publicada cubre 1344x768, 243 fotogramas, 24 fps, 10 segundos y 50 pasos sobre una NVIDIA B200. Advertencia importante desde el principio: la licencia heredada excluye la Unión Europea del territorio aplicable, por lo que su uso en España requiere el proceso de solicitud aparte del licenciante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) de 50 bloques para generación conjunta de vídeo y audio; codificador de texto y VAE de vídeo/audio separados |
| Parámetros totales | No disponible (no publicado; pesos del transformer cuantizado: 34,58 GiB; repositorio FL2VA completo: 107,03 GiB; repo en el Hub: 114,9 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de LLM; la generación se define por duración: 243 fotogramas a 24 fps (10 s) validados, resolución 1344x768 |
| Tipos de cuantización | SVDQuant MXFP4 en el transformer de difusión: W4A4 con `FlashInferMxFp4LinearKernel` y W4A16 de reserva con `MarlinMxFp4LinearKernel`; resto de componentes en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`), heredada del modelo base; territorio aplicable excluye UE, Reino Unido, República de Corea y Estados Unidos |
| Formato de pesos | safetensors (`qweight`, `wscales`, `proj_down`, `proj_up` y factor de suavizado en el transformer; BF16 en el resto) |

## Arquitectura y entrenamiento

El checkpoint no entrena nada nuevo: es una exportación de cuantización post-entrenamiento del transformer de difusión de MiniMax-H3, un DiT de 50 bloques que genera latentes de vídeo y de audio de forma conjunta. La cuantización se realizó con AutoRound en modo `iters=0` (residuales RTN) y suavizado unitario, y explícitamente no es un checkpoint ConvRot. El esquema SVDQuant descompone cada capa lineal en un camino de bajo rango (rango 32, con `proj_down`/`proj_up` en BF16) más un residual cuantizado en MXFP4 con `act_unsigned=false`, lo que da 208 capas lineales cuantizadas frente a 58 módulos que se dejan pasar en BF16 por sensibilidad numérica.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, la composición de datos ni las etapas de alineación o preferencias del modelo base; esta model card solo documenta el proceso de cuantización y su validación. La innovación destacable del artefacto es que el checkpoint es autocontenido (no requiere el transformer BF16 de referencia en inferencia) y que la selección del kernel es automática a partir de `quantization_config.json`, con degradación controlada a W4A16 si FlashInfer CuTe-DSL MXFP4 no está disponible.

Un requisito de runtime nada trivial: es obligatorio usar una build de vLLM-Omni que incluya el runtime SVDQuant MXFP4 y el arreglo de reordenación de QKV serializado de H3 (PR #13 del fork, commit `66e56e62f` o posterior). Sin ese arreglo, las filas QKV se cargan en orden incorrecto y el vídeo generado sale como ruido. El entorno validado es vLLM 0.32.0 con la rama `feat/svdquant-mxfp4`, backend de atención `TRTLLM_ATTN`, caché Cache-DiT y compilación regional perezosa con `torch.compile` que se dispara en la primera petición.

## Capacidades

- Generación texto→vídeo con audio sincronizado (`task: "t2va"`), con control de resolución, relación de aspecto, fps, duración, semilla, pasos y `flow_shift`.
- Generación imagen→vídeo con audio (`task: "fl2va"`) mediante condicionamiento por primer fotograma (`input_reference`), útil para animar storyboards o keyframes.
- Soporte de las modalidades declaradas en el pipeline: text-to-video, image-to-video, image-text-to-video, text-to-audio-video e image-to-audio-video.
- Audio generado de forma conjunta con el vídeo, con parámetro propio `audio_flow_shift` (3.0 en la validación) para modular la trayectoria de muestreo del audio.
- Salida validada de 1344x768 en 16:9, 243 fotogramas a 24 fps (10 s), 50 pasos de inferencia y `flow_shift=12`.
- Aceleración mediante Cache-DiT (configuración con `Fn_compute_blocks=1`, `residual_diff_threshold=0.04`, `max_warmup_steps=4`) y soporte de TaylorSeer como opción desactivable.
- API HTTP de servicio en vLLM-Omni (`/v1/videos/sync`), apta para integración programática por `curl` o clientes HTTP.
- No soporta tool calling ni function calling, no implementa razonamiento multi-paso ni comportamiento de agente, y no ofrece modo "thinking": no es un modelo de lenguaje.
- Cobertura multilingüe de prompts: no disponible en la información proporcionada; los prompts de validación están en inglés.

## Casos de uso

- Previsualización cinematográfica (previs): generar clips de 10 s a 1344x768 con audio de referencia para validar encuadres, ritmo y ambiente sonoro antes del rodaje, usando condicionamiento por primer fotograma para respetar el keyframe aprobado.
- Prototipado publicitario: producir versiones animadas de un spot a partir de una imagen de producto más un prompt descriptivo, con audio sincronizado, para presentar conceptos a cliente sin producción real.
- Animación de storyboards: tomar viñetas dibujadas como `input_reference` y convertirlas en planos con movimiento y sonido, manteniendo la composición original del tablero.
- Generación de material audiovisual para entornos simulados: clips sintéticos con audio para pruebas de pipelines de edición, transcodificación o sistemas de subtitulado automático.
- Investigación en generación conjunta de vídeo y audio: el par de kernels (W4A4 frente a W4A16) permite estudiar el impacto de la precisión numérica en la coherencia audiovisual con un mismo checkpoint.
- Evaluación de infraestructura de inferencia: banco de pruebas para medir tiempos de motor, efectos de Cache-DiT y comportamiento de `torch.compile` regional en GPUs Blackwell dentro de un stack vLLM-Omni.
- Creación de fondos y transiciones para vídeo corto: clips de 10 s reutilizables como material de archivo interno, siempre que el uso quede dentro del territorio permitido por la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K no aplican; tampoco VBench, FVD u otras métricas de vídeo) en la información disponible. Lo único que existe es una validación comparativa de los dos kernels de cuantización frente a la ruta BF16, con petición fija de 1344x768, 243 fotogramas, 24 fps, 10 s, 50 pasos, semilla 0 y Cache-DiT activado:

| Kernel del transformer | Tiempo de motor | Tamaño de salida | PSNR vs BF16 | SSIM vs BF16 |
|---|---:|---:|---:|---:|
| FlashInfer MXFP4 (W4A4) | 382,9 s | 12,29 MB | 10,85 dB | 0,386 |
| Marlin MXFP4 (W4A16) | 449,9 s | 10,57 MB | 11,12 dB | 0,376 |

El propio autor advierte que la generación es estocástica y que la ruta cuantizada altera la trayectoria de muestreo, por lo que esos PSNR/SSIM comparan ejecuciones completas y no representan una reconstrucción sin pérdidas. Es decir, no deben interpretarse como una medida de fidelidad del modelo cuantizado frente al original.

## Requisitos de hardware

- VRAM medida: aproximadamente 89,7 GiB de memoria de GPU tras cargar el modelo, con inferencia en una sola GPU.
- GPU validada: NVIDIA B200 (SM100, 183 GiB). Es el único objetivo declarado como validado; otras GPU y backends no se probaron para este checkpoint.
- GPU consumer: no es viable. Un transformer cuantizado de 34,58 GiB más codificador de texto y VAE en BF16 no cabe en 24 GB (RTX 4090) ni en 48 GB; no hay variante GGUF ni ruta llama.cpp/Ollama publicada.
- Despliegue: exclusivamente vLLM-Omni (vLLM 0.32.0 con la rama `feat/svdquant-mxfp4` y el commit `66e56e62f` o posterior), con `--task-type fl2va`, `--diffusion-attention-backend TRTLLM_ATTN` y `--cache-backend cache_dit`. No se debe pasar `--quantization`: el kernel se elige desde `quantization_config.json`.
- Requisito de compilación: build de CUDA con soporte FlashInfer MXFP4; si no está, se cae automáticamente a `MarlinMxFp4LinearKernel` (W4A16).
- Rendimiento observado: 382,9 s por clip de 10 s con W4A4 y 449,9 s con W4A16 en B200 (aproximadamente 6,4 y 7,5 minutos por clip), con caché Cache-DiT activada y sin contar la compilación perezosa de la primera petición.
- Almacenamiento: 114,9 GB de repositorio en el Hub; 107,03 GiB de directorio FL2VA completo si se sirve en local.

## Comparativa con modelos similares

| Modelo | Parámetros | Duración / resolución validada | Cuantización | VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMaxAI/MiniMax-H3 (FL2VA, base) | No disponible | Hasta 10 s, 1344x768 en la validación del derivado | BF16 | No disponible (referencia BF16 del transformer, mayor que 34,58 GiB) | MiniMax H3 Community License | HuggingFace, oficial |
| Yi30/MiniMax-H3-FL2VA-SVD-MXFP4 (W4A4) | No disponible (transformer 34,58 GiB) | 243 fotogramas, 1344x768, 24 fps | SVDQuant MXFP4 W4A4 | ~89,7 GiB tras carga | MiniMax H3 Community License (heredada) | HuggingFace, 0 descargas, 0 likes |
| Yi30/MiniMax-H3-FL2VA-SVD-MXFP4 (W4A16) | Ídem | Ídem | MXFP4 con kernel Marlin | Similar a W4A4, no medida | Ídem | Ídem |
| Otros generadores abiertos de vídeo con audio | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos verificables en la información proporcionada para comparar con alternativas de la misma categoría (por ejemplo, otros modelos abiertos de vídeo con audio); cualquier cifra al respecto sería inventada.

## Limitaciones y advertencias

- Licencia: la MiniMax H3 Community License Agreement define un territorio aplicable que excluye expresamente la Unión Europea, el Reino Unido, la República de Corea y Estados Unidos. Para uso en España es necesario pasar por el proceso de solicitud separado en `platform.minimax.io/h3-license`; revisar antes cualquier uso o redistribución.
- Cuantización no oficial: el autor declara que no está afiliado ni respaldado por MiniMax; es un derivado comunitario sin revisión del fabricante.
- Solo se cuantiza el transformer de difusión; el codificador de texto y los VAE se incluyen a plena precisión, de modo que el ahorro de memoria es parcial y el repositorio sigue siendo de ~115 GB.
- El checkpoint contiene únicamente FL2VA; no añade Ref2VA ni otras variantes del modelo base.
- No se incluye el sistema de preprocesado H3-Context-IR del modelo original: hay que seguir las guías de prompt de la model card del base, con la pérdida de control que eso implica.
- Las salidas cuantizadas difieren de las BF16 (10,85-11,12 dB de PSNR y ~0,38 de SSIM entre ejecuciones) y deben evaluarse para el caso de uso concreto antes de producción.
- Dependencia frágil de una build concreta: sin el arreglo de reordenación QKV de la PR #13, el vídeo sale como ruido, y el error no es evidente en los logs.
- Solo B200/SM100 está validado; no hay garantías de funcionamiento ni de calidad en otras GPU o backends, incluidos los que caen al kernel Marlin.
- Riesgo de artefactos e inconsistencia audiovisual inherente a la generación estocástica, agravado por la cuantización a 4 bits del residual; no se han publicado métricas de fidelidad perceptual ni de sincronización labial.
- Sesgos: no disponibles. No hay documentación sobre la composición del dataset del modelo base, por lo que no se pueden acotar sesgos de representación demográfica, cultural o de estilo.
- Idiomas: no disponible; no se documenta cobertura multilingüe de prompts.
- Trazabilidad baja: 0 descargas y 0 likes en el momento de la consulta, y actualización del repositorio el mismo día de su creación.
- Requisito de caché y compilación: la primera petición dispara compilación perezosa y no es representativa del throughput en régimen estable.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Yi30/MiniMax-H3-FL2VA-SVD-MXFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia en el repositorio: LICENSE (MiniMax H3 Community License Agreement)
- Proceso de solicitud de licencia para territorios excluidos: https://platform.minimax.io/h3-license
- PR con el runtime SVDQuant MXFP4 y el arreglo QKV de H3: https://github.com/yiliu30/vllm-omni-fork/pull/13
- Commit mínimo requerido: https://github.com/yiliu30/vllm-omni-fork/commit/66e56e62ffaff9351cc101b8ef5e54d8332c8507
- Vídeo de validación W4A4: assets/sample_t2va_768p_mxfp4_w4a4.mp4 (dentro del repositorio)
- Vídeo de validación W4A16: assets/sample_t2va_768p_mxfp4_w4a16.mp4 (dentro del repositorio)
- Fotogramas de validación W4A4: assets/preview_mxfp4_w4a4.png (dentro del repositorio)
