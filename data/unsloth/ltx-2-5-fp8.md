# unsloth/LTX-2.5-FP8

## Resumen

LTX-2.5-FP8 es una versión cuantizada del transformer de difusión (DiT) de vídeo destilado que forma parte de LTX-2.5, el modelo de generación de vídeo con audio de Lightricks. La publica el equipo de Unsloth, conocido por su trabajo en cuantización y entrenamiento eficiente de modelos abiertos, y sustituye el transformer en bf16 de 38,0 GB del repositorio original `Lightricks/LTX-2.5-Diffusers` por pesos de 19,1 a 25,1 GB según el esquema de cuantización empleado. El resto de componentes (text encoder, conectores, VAE, vocoder y upsampler latente) se mantienen sin cambios y provienen del repositorio de Diffusers.

El modelo resuelve el problema del coste de memoria y almacenamiento para desplegar generación de vídeo de alta calidad en hardware más modesto: el transformer cuantizado en FP8 ocupa 19,06 GB, frente a los 38,0 GB en bf16, lo que reduce a la mitad la huella del componente principal. Está pensado para los pipelines `text-to-video` e `image-to-video` de la librería `diffusers` y se distribuye en formato safetensors con el layout de torchao.

La relevancia de esta ficha radica en que ofrece tres recetas de cuantización distintas (FP8 e4m3, INT8 W8A8 y INT8 con rotación Hadamard) con métricas objetivas de fidelidad frente al modelo bf16 (LPIPS y PSNR), lo que permite elegir el compromiso entre tamaño y calidad. El modelo base tiene 18.987.859.200 parámetros en el transformer y está entrenado exclusivamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) de vídeo destilado, con stream de audio y atención cruzada audio-vídeo |
| Parámetros totales | 18.987.859.200 (transformer) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 e4m3 (per-row scales), INT8 W8A8 (group-256 Hadamard rotation), INT8 W8A8 (sin rotación) |
| Idiomas soportados | Inglés (en) |
| Licencia | ltx-2.x-community-license-agreement |
| Formato de pesos | safetensors (layout de torchao) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) de vídeo destilado, con un stream de audio independiente y atención cruzada entre audio y vídeo. La versión cuantizada conserva la arquitectura original: en el caso de INT8 se mantienen en bf16 el stream de audio, la atención cruzada audio-vídeo, las proyecciones adaLN y de timestep, y las normas; solo se cuantizan las capas lineales de vídeo. En FP8 se cuantiza cada capa lineal con al menos 512 características. La variante INT8-ConvRot aplica una rotación Hadamard por bloques (grupo 256) a las entradas de las 480 capas lineales de vídeo cuantizadas antes de cuantizar, y la rotación se aplica a las activaciones en tiempo de ejecución.

El modelo base es una destilación, y el sampler destilado inyecta ruido en cada paso, de modo que pequeños errores en los pesos afectan más al movimiento que al aspecto del fotograma. Los pesos cuantizados se generaron a partir de la revisión `da0b690960026eab794b8ceaf841233cf7064478` del transformer de `Lightricks/LTX-2.5-Diffusers`, idéntica tensor a tensor a `ltx-2.5-22b-distilled-transformer-bf16.safetensors` de `Lightricks/LTX-2.5`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución de referencia 1280x704, 121 fotogramas y 24 fps.
- Generación de vídeo a partir de una imagen (image-to-video).
- Generación conjunta de vídeo y audio gracias al stream de audio y la atención cruzada audio-vídeo del modelo base.
- Control fino mediante los ajustes de muestreo destilado (8 + 3 pasos en dos etapas, CFG 1).
- Cuantización intercambiable: tres archivos con distintos compromisos de tamaño y fidelidad.
- Carga estricta con la clase estándar `LTX2VideoTransformer3DModel` de diffusers, sin ejecución de código pickled.
- No se ha documentado soporte de tool calling, function calling, agentes ni multi-step reasoning en la información disponible.

## Casos de uso

- Generación de vídeo publicitario y de producto: el modelo produce clips de 121 fotogramas a 24 fps con resolución 1280x704, adecuados para piezas cortas de marketing, y la variante FP8 de 19,06 GB permite desplegarlo en una sola GPU de 24 GB.
- Prototipado rápido de storyboards: con image-to-video se puede animar un fotograma clave o un boceto y evaluar el movimiento antes de comprometer un render completo en bf16.
- Generación de vídeo con audio sincronizado: el stream de audio del modelo base permite producir clips con pista sonora en una sola pasada, útil para demos y contenido para redes.
- Investigación en cuantización de modelos de difusión: los tres archivos con métricas LPIPS y PSNR frente a bf16 permiten estudiar el impacto de FP8 frente a INT8 y de la rotación Hadamard en la calidad del vídeo generado.
- Despliegue en infraestructura con VRAM limitada: al reducir el transformer de 38,0 GB a 19,06 GB en FP8, se puede ejecutar en GPUs consumer de gama alta donde el bf16 no cabría junto con el text encoder y los VAE.
- Evaluación comparativa de pipelines de vídeo: sirve como referencia cuantizada para comparar latencia y calidad frente al modelo bf16 en entornos de CI o benchmarks internos.
- Fine-tuning o destilación posterior sobre una base más ligera: al cargarse estrictamente con diffusers, se integra en flujos de entrenamiento que parten de pesos cuantizados o los desagregan con `unflatten_tensor_state_dict`.

## Benchmarks y rendimiento

Métricas de fidelidad frente al DiT en bf16, con las mismas semillas (42 y 7), ajustes destilados de referencia (1280x704, 121 fotogramas, 24 fps, 8 + 3 pasos en dos etapas, CFG 1) y el mismo text encoder bf16 en todas las ejecuciones. LPIPS se promedia sobre los 121 fotogramas de 4 clips; un render bf16 repetido da LPIPS 0,000.

| Archivo | Tamaño | Esquema | LPIPS medio / peor fotograma | PSNR medio / peor fotograma |
|---|---|---|---|---|
| `LTX-2.5-INT8-ConvRot.safetensors` | 25,11 GB | INT8 W8A8, rotación Hadamard grupo 256 | 0,265 / 0,449 | 20,2 / 16,8 dB |
| `LTX-2.5-FP8.safetensors` | 19,06 GB | FP8 e4m3, escalas por fila | 0,366 / 0,518 | 17,6 / 11,6 dB |
| `LTX-2.5-INT8.safetensors` | 25,11 GB | INT8 W8A8, sin rotación | 0,385 / 0,632 | 17,4 / 13,9 dB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de generación de vídeo y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para el transformer: 19,06 GB en FP8 y 25,11 GB en INT8 (INT8-ConvRot o INT8 sin rotación); a ello hay que sumar el text encoder, los VAE, el vocoder y el upsampler latente del repositorio de Diffusers.
- El transformer en bf16 ocupa 38,0 GB, por lo que la versión FP8 reduce a la mitad la huella del componente principal.
- GPU recomendadas: A100 (40/80 GB) o H100 para el pipeline completo en bf16; para FP8, GPUs de 24 GB o más que soporten FP8 e4m3, como RTX 4090, L40S o A100.
- Cabe en GPU consumer de gama alta (RTX 4090 de 24 GB) con la variante FP8, siempre que el resto de componentes quepan junto a ella; las variantes INT8 de 25,11 GB no caben íntegras en 24 GB sin offloading.
- Opciones de despliegue: la librería `diffusers` con la clase `LTX2VideoTransformer3DModel` y el pipeline `LTX2Pipeline`; la carga requiere torch 2.13 y torchao 0.18, y se desagrega con `torchao.prototype.safetensors.safetensors_support.unflatten_tensor_state_dict`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Tamaño de pesos | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-FP8 (esta ficha) | 18.987.859.200 | 19,06 GB (FP8) | 1280x704, 121 fotogramas, 24 fps | ltx-2.x-community-license-agreement | Hugging Face (unsloth) |
| LTX-2.5-Diffusers (bf16) | 18.987.859.200 | 38,0 GB | 1280x704, 121 fotogramas, 24 fps | ltx-2.x-community-license-agreement | Hugging Face (Lightricks) |
| LTX-2.5-INT8-ConvRot | 18.987.859.200 | 25,11 GB | 1280x704, 121 fotogramas, 24 fps | ltx-2.x-community-license-agreement | Hugging Face (unsloth) |

No se dispone de datos sobre otros modelos de vídeo comparables (por ejemplo, de otros autores) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha documentado capacidad multilingüe.
- El sampler destilado inyecta ruido en cada paso, por lo que errores pequeños en los pesos desplazan el movimiento más que la apariencia del fotograma; la cuantización puede alterar la dinámica del vídeo aunque se conserven sujeto, escena y prompt.
- La variante FP8 presenta mayor degradación que INT8-ConvRot (LPIPS 0,366 frente a 0,265), por lo que se recomienda INT8-ConvRot cuando la VRAM lo permita.
- Las variantes INT8 (25,11 GB) no caben íntegras en GPUs de 24 GB sin offloading.
- La licencia `ltx-2.x-community-license-agreement` es distinta de las licencias open source habituales; es necesario revisar sus términos antes de un uso comercial.
- El repositorio ocupa 153,4 GB, lo que implica un coste de almacenamiento y descarga considerable.
- Riesgo de alucinación visual y de artefactos en el movimiento, inherente a los modelos de difusión de vídeo; no se han documentado sesgos específicos en la información disponible.
- La carga requiere versiones concretas de torch (2.13) y torchao (0.18); versiones distintas pueden no reconstruir el layout de safetensors correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unsloth/LTX-2.5-FP8
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5-Diffusers
- Repositorio del modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Unsloth: https://docs.unsloth.ai/
- Discord de Unsloth: https://discord.gg/unsloth
- Artículo de referencia: arxiv:2601.03233
