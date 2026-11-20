# SUSSYEATING/BAGEL-7B-MoT-Turbo

## Resumen

BAGEL-7B-MoT-Turbo es un checkpoint afinado a parámetros completos del modelo multimodal ByteDance-Seed/BAGEL-7B-MoT, publicado por el usuario SUSSYEATING. El modelo base es una arquitectura Mixture-of-Transformers (MoT) con 14B parámetros totales y 7B activos, diseñada para generación y edición de imágenes nativa a 1024x1024, además de comprensión visual. Este Turbo aplica destilación de pasos y de CFG sobre los 6.555B parámetros del experto de generación (402 tensores), manteniendo intacta la rama de comprensión del modelo original.

La innovación principal es la reducción del coste de inferencia: pasa de 50 pasos con CFG 4.0/2.0 a 8 pasos Euler con CFG 1.0 y `timestep_shift=3.0`, lo que se traduce en aceleraciones de hasta 13x en edición de imágenes y 8x en text-to-image, con una calidad visual preservada mediante anclaje L2-SP a las trayectorias del profesor. El checkpoint se distribuye como un único archivo `.safetensors` de 29.21 GB en BF16, con metadatos embebidos para carga nativa en ComfyUI mediante el nodo `ComfyUI-BAGEL`.

Es relevante ahora porque demuestra que es posible destilar modelos multimodales any-to-any de gran tamaño sin sacrificar capacidades auxiliares (razonamiento con `<think>`, edición, comprensión), manteniendo licencia Apache 2.0 y un formato de despliegue práctico para flujos de trabajo de difusión en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) multimodal con rectified flow para generación |
| Parámetros totales | 14B (modelo base); 6.555B en el experto de generación afinado (402 tensores) |
| Parámetros activos | 7B (MoE del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint publicado); INT8, INT6 e INT4 disponibles en el repo ConvRot asociado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, 29.21 GB, con metadatos `comfyui_bagel`) |

## Arquitectura y entrenamiento

El modelo base BAGEL-7B-MoT emplea una arquitectura Mixture-of-Transformers con 14B parámetros totales y 7B activos, combinando una rama de comprensión visual y una rama de generación basada en rectified flow. El checkpoint Turbo es un fine-tune a parámetros completos (no LoRA) de los 6.555B parámetros del experto de generación, entrenado a resolución nativa 1024x1024 mediante destilación de trayectoria online con profesor BF16 en modo DAgger, complementada con anclaje L2-SP para preservar la fidelidad visual, tipográfica y geométrica del modelo original.

La destilación elimina la necesidad de classifier-free guidance (CFG 1.0 en texto e imagen) y reduce el muestreo a 8 pasos Euler (`num_timesteps=9`, `timestep_shift=3.0`), manteniendo coherencia hasta 5-6 pasos. La rama de comprensión conserva los pesos BF16 originales sin modificar, de modo que las cuatro capacidades del modelo base (T2I, T2I con `<think>`, edición de imagen y comprensión) siguen operativas.

## Capacidades

- Generación de texto a imagen nativa a 1024x1024 en 8 pasos Euler con CFG 1.0.
- Generación texto a imagen con razonamiento en cadena (`<think>`) previo a la síntesis visual.
- Edición de imágenes (image-to-image) manteniendo coherencia estructural.
- Comprensión de imágenes (image understanding) con pesos BF16 originales intactos.
- Pipeline any-to-any: acepta y produce modalidades mixtas texto/imagen.
- Integración nativa con ComfyUI mediante el nodo `ComfyUI-BAGEL` y el VAE oficial FLUX (`ae.safetensors`).
- Compatibilidad con cuantizaciones INT8/INT6/INT4 en el repo ConvRot para GPUs de consumo.
- No se documenta soporte explícito de tool calling, function calling ni modo agente multi-paso.

## Casos de uso

- Generación rápida de ilustraciones en producción: con 3.98 s por imagen 1024x1024 en RTX PRO 6000 Blackwell (frente a 31.58 s del base), permite iterar prompts en pipelines creativos con latencias compatibles con interfaces interactivas.
- Edición fotográfica asistida: la aceleración de 13x (3.09 s por edición) hace viable la edición iterativa en herramientas de retoque, aplicando cambios de iluminación, estación o estilo sobre imágenes existentes con semillas de edición distintas a las de generación.
- Prototipado de assets para videojuegos y diseño gráfico: la preservación de fidelidad tipográfica y geométrica (gracias al anclaje L2-SP) permite generar rótulos, señales y elementos con texto legible a 1024x1024.
- Generación con planificación previa (`<think>`): útil en escenarios donde la composición requiere razonamiento explícito sobre objetos, relaciones espaciales y estilo antes de sintetizar, con un coste de 6.88 s frente a 34.72 s del base.
- Comprensión y anotación de imágenes: la rama de comprensión intacta permite describir, clasificar o responder preguntas sobre imágenes en 1.53 s, integrándose en pipelines de moderación o catalogación.
- Despliegue en GPUs de consumo: las variantes INT8 (16.2 GB), INT6 (13.7 GB) e INT4 (10.5 GB) del repo ConvRot permiten ejecutar el modelo en GPUs de 12-24 GB, habilitando estaciones de trabajo locales para artistas y desarrolladores.
- Automatización de flujos ComfyUI: el formato single-file con metadatos embebidos simplifica el despliegue en nodos personalizados y pipelines de generación por lotes sin gestión de múltiples shards.

## Benchmarks y rendimiento

Mediciones del autor en NVIDIA RTX PRO 6000 Blackwell (98 GB, PyTorch SDPA sin `flash-attn`), tarea a 1024x1024:

| Tarea | Base BF16 (50 pasos, CFG 4.0/2.0) | Turbo BF16 (9 timesteps, CFG 1.0) | Aceleración | VRAM pico |
|---|---:|---:|---:|---:|
| T2I Watch (`t2i_watch_s1337`) | 31.58 s | 3.98 s | 7.9x | 30.25 GB |
| T2I Cabin (`t2i_cabin_s42`, arranque en frío) | 35.81 s | 7.71 s | 4.6x | 30.08 GB |
| T2I + `<think>` (`t2i_think_s42`, 92 palabras) | 34.72 s | 6.88 s | 5.0x | 30.27 GB |
| Edición de imagen (`edit_cabin_winter_s102`) | 40.46 s | 3.09 s | 13.1x | 31.26 GB |
| Comprensión de imagen (`understand_cabin`) | 1.58 s | 1.53 s | 1.0x (salida idéntica) | 30.62 GB |

No se han publicado resultados en benchmarks académicos estándar (MMLU, HumanEval, GSM8K, GenEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: ~30-31.3 GB de pico según tarea (medido en RTX PRO 6000 Blackwell).
- Cuantizaciones ConvRot: INT8 ~16.2 GB, INT6 ~13.7 GB, INT4 ~10.5 GB, orientadas a GPUs de consumo de 12-24 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (medición oficial), A100 40/80 GB, H100, RTX 4090 24 GB (con cuantización INT8/INT6/INT4).
- Cabe en GPU de consumo: sí, únicamente con las variantes cuantizadas del repo ConvRot; el BF16 no cabe en GPUs de 24 GB.
- Opciones de despliegue: ComfyUI con el nodo `ComfyUI-BAGEL` (soporte nativo y documentado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: 3.98 s (T2I) y 3.09 s (edición) por imagen 1024x1024 en RTX PRO 6000 Blackwell; 6.88 s con `<think>`; 1.53 s en comprensión.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-7B-MoT-Turbo (este) | 14B totales / 7B activos | no disponible | Any-to-any multimodal, 8 pasos, CFG 1.0 | Apache 2.0 | HF (single-file ComfyUI) |
| ByteDance-Seed/BAGEL-7B-MoT (base) | 14B totales / 7B activos | no disponible | Any-to-any multimodal, 50 pasos, CFG 4.0/2.0 | Apache 2.0 | HF |
| FLUX.1 (referencia de VAE compatible) | no disponible en la información | no disponible | Text-to-image | no disponible en la información | no disponible en la información |
| SUSSYEATING/BAGEL-7B-MoT-Turbo-ConvRot | 14B totales / 7B activos | no disponible | Variante cuantizada INT8/INT6/INT4 del Turbo | Apache 2.0 | HF |

No se dispone de datos de benchmarks comparativos con otras familias (SD3, FLUX, Janus, etc.) en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint BF16 requiere ~30 GB de VRAM, por lo que no es desplegable en GPUs de consumo sin cuantización.
- La destilación se ha validado con `num_timesteps=9` y `timestep_shift=3.0`; otros valores pueden degradar la coherencia, aunque el autor indica funcionamiento aceptable en 6-7 timesteps.
- En edición de imágenes, reutilizar la misma semilla que generó la imagen fuente sesga la trayectoria hacia la imagen sin editar; se recomienda usar una semilla distinta.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; deben evaluarse empíricamente antes de uso en producción.
- No se documenta soporte de tool calling, function calling ni comportamiento agente; no debe asumirse.
- El modelo deriva de BAGEL-7B-MoT bajo Apache 2.0; es responsabilidad del usuario verificar el cumplimiento de la licencia del VAE FLUX (`ae.safetensors`), que se distribuye por separado y con sus propios términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente de los resultados reportados.
- Las mediciones de rendimiento provienen de una única GPU (RTX PRO 6000 Blackwell) sin `flash-attn`; el rendimiento en otros hardware puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SUSSYEATING/BAGEL-7B-MoT-Turbo
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Variante cuantizada ConvRot: https://huggingface.co/SUSSYEATING/BAGEL-7B-MoT-Turbo-ConvRot
- Variante cuantizada base ConvRot: https://huggingface.co/SUSSYEATING/BAGEL-7B-MoT-ConvRot
- Script de evaluación: `scripts/eval_bagel_turbo.py` (incluido en el repo)
- Logs de métricas: `metrics/` (incluido en el repo)
- Comparativas visuales: `comparisons/` (incluido en el repo)
