# starrysproutkids/NAVA

## Resumen

NAVA (Native Audio-Visual Alignment for Generation) es un generador conjunto de audio y vídeo desarrollado por el equipo ERNIE de Baidu Inc., presentado en arXiv en 2026. El modelo sintetiza vídeo y audio sincronizados a partir de un único prompt de texto, incluyendo diálogo multi-hablante con control de timbre por referencia y continuaciones condicionadas por imagen. Su propuesta central es una arquitectura "Align-then-Fuse MMDiT" que establece primero un espacio de alineación audiovisual y después fusiona el contexto (texto, embeddings de hablante) mediante cross-attention.

El modelo parte del backbone Wan2.2-TI2V-5B y lo extiende hasta 6,3 mil millones de parámetros para cubrir la generación conjunta de audio y vídeo. Frente a alternativas de doble torre con alineación post-hoc o stacks tri-modales completamente unificados, NAVA reduce el presupuesto de parámetros entre 2 y 5 veces respecto a los baselines open source, manteniendo sincronización audiovisual de estado del arte según el autor.

Es relevante ahora porque aborda la generación nativa de audio y vídeo sincronizados en un único checkpoint de tamaño moderado, con soporte de audio estéreo de doble canal, control de cámara descrito en lenguaje natural y múltiples relaciones de aspecto desde el mismo modelo. La licencia Apache 2.0 facilita su adopción tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Align-then-Fuse MMDiT (backbone Wan2.2) |
| Parametros totales | 6,3 B (backbone conjunto audio-video) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (text_len = 512 tokens para el encoder de texto) |
| Tipos de cuantizacion | no disponible (entrenado e inferido en bf16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 46,7 GB; componentes en safetensors presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

NAVA instancia la alineación audiovisual nativa como un stack MMDiT dividido en dos fases. La primera consta de 10 bloques de doble flujo (hierarchical alignment layers): vídeo y audio mantienen proyecciones QKV y FFN separadas, pero comparten una self-attention conjunta sobre los tokens concatenados `[video_tokens; audio_tokens]`, además de cross-attention dedicada al texto. La segunda fase consta de 20 bloques de flujo único (unified fusion layers) donde vídeo y audio comparten QKV/FFN y una única atención conjunta trata todos los tokens como un solo flujo, con una sola ruta de cross-attention al texto. El backbone usa `dim=3072`, `ffn_dim=14336`, 24 cabezas de atención, 30 capas en total, `text_len=512` y patch size `(1, 2, 2)`, con RMSNorm sobre QK y ε = 1e-6. La codificación posicional combina RoPE 3D para vídeo (temporal, alto, ancho) y RoPE 1D para audio, aplicada conjuntamente en la ruta de atención conjunta.

El muestreo emplea flow matching con el scheduler UniPC y 50 pasos por defecto, en precisión bf16. La condición de timbre (Timbre-in-Context) se implementa inyectando embeddings de hablante de 192 dimensiones extraídos con ReDimNet desde WAV de referencia, ligados a tramos de habla delimitados por `<S>...<E>`. La sincronización se refuerza en inferencia con CFG cross-modal 3D, con escalas independientes para vídeo, audio y la dirección de alineación (`video_align_guidance_scale`, `audio_align_guidance_scale`). El modelo se acompaña de un VAE de vídeo causal 3D (compresión 16×16×4, 48 canales latentes, 2,7 GB), un VAE de audio LTX con vocoder integrado (128 canales latentes, 25 tokens/seg, 348 MB), el encoder de texto umt5-xxl (T5, embeddings de 4096 dimensiones, 11 GB) y ReDimNet (~50 MB). No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación conjunta de vídeo y audio sincronizados a partir de un prompt de texto.
- Generación de vídeo a 1280×704 (recomendado) y 960×960, con relaciones de aspecto horizontal, vertical y cuadrada desde el mismo checkpoint.
- Generación de clips de 37 frames a 24 fps (~6 s) y de 55–61 frames (~9–10 s).
- Audio estéreo de doble canal (escena y habla) denoised conjuntamente con el vídeo, sin alineación post-hoc de vocoder.
- Diálogo multi-hablante con control de timbre por referencia WAV ligada a tramos `<S>...<E>`.
- Control de cámara descrito en lenguaje natural (composición de plano, movimiento y ritmo).
- Continuaciones condicionadas por imagen (image-conditioned continuations).
- Generación rápida: vídeo y audio sincronizados a 720p en aproximadamente 1 minuto usando paralelismo de secuencia Ulysses con 8 GPUs.
- Soporte de paralelismo de secuencia Ulysses hasta 8 GPUs o inferencia en una sola GPU.
- Idiomas: inglés y chino.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Producción de vídeo publicitario con audio nativo: un único prompt genera clip y banda sonora sincronizados a 720p, eliminando el paso de alinear por separado vídeo y audio en postproducción.
- Doblaje y diálogo multi-hablante: el control de timbre por referencia WAV permite asignar voces distintas a cada hablante ligado a tramos `<S>...<E>`, útil para escenas con varios personajes.
- Previsualización de guiones (animatics): generar clips de 6 a 10 segundos con audio para validar ritmo, composición y diálogo antes de la producción final.
- Contenido para redes sociales en formato vertical y cuadrado: el mismo checkpoint cubre relaciones de aspecto portrait y square sin reentrenamiento.
- Continuación condicionada por imagen: extender un fotograma o imagen de referencia en un clip animado con audio, útil para storyboards o prototipado visual.
- Generación de escenas con audio ambiental y habla simultáneos: el audio estéreo de doble canal separa escena y voz, adecuado para demos de producto o escenas narrativas.
- Investigación en generación audiovisual conjunta: el diseño Align-then-Fuse y el CFG cross-modal 3D sirven como base para experimentos de sincronización AV con presupuesto de parámetros moderado.

## Benchmarks y rendimiento

El autor indica que en Verse-Bench NAVA alcanza estado del arte en Sync-C, Sync-D, calidad de vídeo y WER de audio, usando entre 2 y 5 veces menos parámetros que los baselines open source. Sin embargo, la información proporcionada no incluye los valores numéricos de estos benchmarks.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El backbone es de 6,3 B en bf16 (~12,6 GB solo pesos), pero el pipeline completo incluye el encoder de texto umt5-xxl (11 GB), el VAE de vídeo (2,7 GB) y el VAE de audio con vocoder (348 MB), por lo que el requisito agregado es sustancialmente mayor.
- GPU recomendadas: el autor documenta generación a 720p en ~1 minuto con paralelismo Ulysses en 8 GPUs; se soporta también inferencia en una sola GPU, aunque sin cifras de latencia para ese caso.
- Cabe en GPU consumer: no confirmado en la información disponible; el tamaño del repo (46,7 GB) y el encoder de texto de 11 GB sugieren que no es trivial en GPUs de 24 GB sin cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: librería `custom` del autor; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI (no aplicables a un generador audiovisual de este tipo).
- Latencia y throughput: ~1 minuto para 720p con 8 GPUs y paralelismo Ulysses; sin datos para configuraciones menores.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Control de hablante | Licencia |
|---|---|---|---|---|
| NAVA | 6,3 B | Align-then-Fuse MMDiT | Timbre por referencia WAV | Apache 2.0 |
| Baselines open source de doble torre | 10 B – 32 B (según autor) | Alineación post-hoc | Solo por caption | no disponible |
| Baselines tri-modales unificados | 10 B – 32 B (según autor) | Stack unificado | no disponible | no disponible |

El autor sitúa a NAVA frente a baselines open source de 10 a 32 mil millones de parámetros, con una reducción de 2 a 5 veces en parámetros y mejoras en Sync-C, Sync-D, calidad de vídeo y WER de audio en Verse-Bench. No se dispone de nombres ni cifras concretas de esos baselines en la información proporcionada, por lo que la comparación cuantitativa detallada no está disponible.

## Limitaciones y advertencias

- Solo se documentan inglés y chino como idiomas soportados; el rendimiento en otros idiomas no está caracterizado.
- La duración de audio está limitada a ≤ 10 segundos y los clips a 37 frames (~6 s) o 55–61 frames (~9–10 s), lo que restringe escenas largas.
- El número de pasos por defecto es 50 con UniPC; reducir pasos puede degradar la sincronización audiovisual.
- No se documentan tipos de cuantización, lo que limita el despliegue en hardware modesto.
- No se detallan sesgos conocidos, composición del dataset de entrenamiento ni tasas de alucinación o artefactos; el autor no los reporta en la información disponible.
- El modelo está alojado en el repositorio `starrysproutkids/NAVA` con 0 descargas y 0 likes, y la model card referencia enlaces a un repo GitHub y una página de proyecto del equipo ERNIE; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.
- Aunque la licencia es Apache 2.0, el uso comercial debe revisarse también respecto a las licencias de los componentes derivados (Wan2.2, umt5-xxl, ReDimNet, LTX Audio VAE), cuyos términos no se detallan en la información proporcionada.
- La fecha de creación del repo (2026-11-11) y la referencia arXiv 2605.30073 deben tratarse con cautela; no se dispone de validación independiente de los resultados declarados.

## Enlaces

- Hugging Face: https://huggingface.co/starrysproutkids/NAVA
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Paper (arXiv): https://arxiv.org/abs/2605.30073
- Repositorio GitHub: https://github.com/ernie-research/NAVA
- Página de proyecto: https://ernie-research.github.io/NAVA/
- README en chino (referenciado en la model card): https://huggingface.co/baidu/NAVA/blob/main/README_zh.md
