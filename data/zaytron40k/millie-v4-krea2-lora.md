# Zaytron40k/millie-v4-krea2-lora

## Resumen

millie-v4-krea2-lora es un adaptador LoRA de personaje para generación de imágenes texto-a-imagen, desarrollado por el usuario Zaytron40k y publicado en HuggingFace. Se entrena sobre krea/Krea-2-Raw (un DiT de 12B parámetros, sin destilar) y está pensado para inferencia sobre krea/Krea-2-Turbo, la variante destilada de 8 pasos. Aprende la identidad de un personaje femenino al que se accede mediante la palabra de clase `woman`, usada como trigger, y no mediante un token dedicado.

El adaptador tiene rango/dim 24 y alpha 24, y se aplica a todas las capas Linear del DiT. El pipeline completo combina el VAE de Qwen-Image, el codificador de texto Qwen3-VL-4B y el entrenador Musubi Tuner (kohya-ss). El repositorio ocupa 1,4 GB y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, sin validación externa conocida.

Su relevancia es acotada y práctica: permite reproducir una identidad concreta con control en lenguaje natural sobre ropa, pose, expresión, encuadre y fondo, y está diseñado para apilarse sobre un LoRA de estilo. Como contrapartida, el entrenamiento seguía en curso (paso 1104 de 1584) cuando se documentó, no se especifica licencia y no hay benchmarks objetivos publicados, por lo que su uso en producción requiere evaluación manual previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer DiT (diffusion transformer); rango/dim 24, alpha 24, aplicado a todas las capas Linear del DiT |
| Parámetros totales | No disponible para el adaptador; el modelo base Krea-2-Raw declara 12B parámetros en el DiT. Tamaño del repositorio: 1,4 GB |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; el condicionamiento de texto lo aporta el codificador Qwen3-VL-4B) |
| Tipos de cuantización | No disponible; el entrenamiento se realizó en bf16 y no se documentan variantes cuantizadas del adaptador |
| Idiomas soportados | No disponible; las descripciones del dataset y los ejemplos de prompt están en inglés |
| Licencia | No disponible (la model card no la especifica) |
| Formato de pesos | safetensors (checkpoints del LoRA `-000002`, `-000004`, `-000006`, `-000008`). El base usa `raw.safetensors`, el destino de inferencia `turbo.safetensors`, el VAE `qwen_image_vae.safetensors` y el text encoder `qwen3vl_4b_bf16.safetensors` |
| Pipeline | text-to-image |
| Modelo base (entrenamiento) | krea/Krea-2-Raw (`raw.safetensors`, 12B DiT, sin destilar) |
| Modelo objetivo de inferencia | krea/Krea-2-Turbo (destilado, 8 pasos) — esquema RAW-train / Turbo-infer |
| Trigger | `woman` (palabra de clase, sin token de trigger dedicado) |
| Entrenador | Musubi Tuner (kohya-ss), `networks.lora_krea2` |
| Optimizador y precisión | adamw8bit, lr 1e-4; bf16 con gradient checkpointing y SDPA |
| Muestreo de timesteps | krea2_shift (consciente de la resolución), weighting_scheme none |
| Dataset | 66 imágenes seedream-v5-pro a 2k más algunas imágenes gpt-image de estilo animación occidental (retrato y plano medio), con captions pareados en lenguaje natural; mujer joven, sin trigger dedicado. batch 1, buckets multirresolución de 1024, num_repeats 2 |
| Plan de entrenamiento | 12 épocas = 1584 pasos, guardado cada 2 épocas, semilla 42 |
| Hardware de entrenamiento | 1x NVIDIA H100 80GB (RunPod, EU-NL-1, volumen Musubi) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 15-09-2026 / 15-09-2026 |

## Arquitectura y entrenamiento

El adaptador se inyecta en un DiT de flujo (flow matching), el mismo esquema que declara el autor al registrar `avr_loss` como pérdida de flow matching. El LoRA cubre todas las capas Linear del DiT con rango 24 y alpha 24, y se entrena sobre la variante RAW (no destilada) de 12B parámetros mientras la inferencia se dirige a la variante Turbo de 8 pasos. El stack de difusión se completa con el VAE de Qwen-Image y el codificador de texto Qwen3-VL-4B en bf16.

El entrenamiento se ejecutó con adamw8bit a lr 1e-4, precisión bf16, gradient checkpointing y atención SDPA, con muestreo de timesteps krea2_shift consciente de la resolución y sin esquema de ponderación. El dataset son 66 imágenes sintéticas generadas con seedream-v5-pro a 2k, más un conjunto reducido de imágenes de gpt-image de estilo animación occidental, todas con captions en lenguaje natural que describen ropa, pose, expresión, encuadre y fondo. La identidad se aprende a partir del conjunto sin token dedicado: el trigger es la palabra de clase `woman`. El autor advierte que la pérdida de flow matching es casi plana (mínimo 0,0448; valor final 0,0512) y recomienda elegir el checkpoint por inspección visual, no por la métrica.

## Capacidades

- Generación de imágenes texto-a-imagen con identidad de personaje consistente, activada por la palabra de clase `woman`.
- Retratos en primer plano y planos medios, con encuadres descritos explícitamente en el prompt (por ejemplo, plano medio de pie, brazos relajados).
- Control mediante lenguaje natural de la indumentaria (tipo de prenda, escote, manga, falda, aberturas), la pose, la expresión facial, el encuadre y el fondo.
- Apilado con un LoRA de estilo: el autor recomienda explícitamente superponerlo sobre el LoRA de estilo de la casa.
- Inferencia sobre Krea 2 Turbo en 8 pasos con `guidance_scale` 1 y `mu` 1.15, a 1024x1280 en los ejemplos documentados.
- No es un modelo de lenguaje: no ofrece tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada ni capacidades de audio. Tampoco es un modelo multimodal de texto.

## Casos de uso

- Retratos de personaje consistentes para campañas de marca: el LoRA mantiene la misma identidad a lo largo de varias generaciones, y los captions de entrenamiento cubren variaciones de ropa y fondo, lo que permite producir una serie coherente de piezas con una única palabra de activación.
- Ilustración de personajes para cómic, webtoon o fanzine: la capacidad de describir encuadre y expresión en lenguaje natural facilita generar viñetas de primer plano y plano medio con continuidad de personaje entre páginas.
- Previsualización de vestuario o lookbook: el modelo responde a descripciones detalladas de prendas (tipo, escote, manga, complementos) sobre fondo neutro, útil para iterar propuestas antes de una sesión fotográfica real.
- Creación de assets para videojuegos o narrativa interactiva: retratos y avatares de personaje con control de pose y expresión. Requiere verificar antes la licencia, que no está especificada.
- Contenido para redes sociales y avatares de comunidad: con 8 pasos de muestreo en Krea 2 Turbo, el coste por imagen es bajo, lo que encaja en flujos de publicación frecuente.
- Iteración creativa en pipelines con Musubi Tuner: el adaptador se integra mediante `krea2_generate_image.py` y admite `lora_multiplier`, de modo que se puede modular la intensidad del personaje o combinarlo con otros LoRA durante la generación.
- Investigación sobre entrenamiento de LoRA de personaje: el repositorio documenta configuración completa (rank, alpha, optimizador, muestreo de timesteps, plan de épocas, pérdidas por checkpoint), lo que lo convierte en una referencia reproducible para estudiar cómo se comporta la pérdida de flow matching en adaptadores de identidad.
- Generación de material de referencia interno: producción de bocetos de personaje a partir de descripciones textuales para equipos de dirección de arte, siempre que la licencia se resuelva previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas de calidad de imagen tipo FID, CLIP score o similitud de identidad). El autor solo publica la pérdida de entrenamiento por checkpoint, que él mismo califica de poco informativa porque la pérdida de flow matching es casi plana.

| Checkpoint | Época | Paso | avr_loss |
|---|---|---|---|
| `-000002` | 2 | 264 | 0,0543 |
| `-000004` | 4 | 528 | 0,0492 |
| `-000006` | 6 | 792 | 0,0465 |
| `-000008` | 8 | 1056 | 0,0480 |

Mínimo de `avr_loss`: 0,0448. Valor final: 0,0512. Métrica de entrenamiento, no benchmark de calidad.

## Requisitos de hardware

- Entrenamiento documentado: 1x NVIDIA H100 80GB (RunPod, EU-NL-1), bf16, gradient checkpointing, SDPA, batch 1, buckets multirresolución de 1024, 1584 pasos previstos.
- VRAM estimada para inferencia: no disponible. La model card no indica consumo de memoria, GPU utilizada ni tiempo por imagen.
- GPU recomendadas para inferencia: no disponible. El autor solo documenta el hardware de entrenamiento.
- Compatibilidad con GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: Musubi Tuner (kohya-ss) mediante el script `src/musubi_tuner/krea2_generate_image.py`, con `--dit turbo.safetensors`, `--vae qwen_image_vae.safetensors`, `--text_encoder qwen3vl_4b_bf16.safetensors`, `--steps 8`, `--guidance_scale 1`, `--mu 1.15`, `--attn_mode torch` y `--lora_weight <checkpoint>.safetensors`. No se documentan otros backends (diffusers, ComfyUI, TGI, vLLM) para este adaptador.
- Latencia y throughput: no disponible. Solo se conoce el número de pasos de muestreo (8) en Krea 2 Turbo.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRA de personaje para Krea 2 en la documentación aportada, por lo que la comparativa se limita a las tres piezas del propio stack del autor.

| Modelo | Tipo | Parámetros | Contexto de inferencia | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| millie-v4-krea2-lora | LoRA de personaje sobre DiT | Adaptador rango 24; base de 12B | 8 pasos, 1024x1280, `mu` 1.15 | Solo `avr_loss` de entrenamiento (mín. 0,0448); sin benchmarks | No disponible | HuggingFace, 0 descargas, 0 likes |
| krea/Krea-2-Raw | DiT sin destilar (base de entrenamiento) | 12B | No documentado | No disponible | No disponible en la información aportada | Usado como `raw.safetensors` |
| krea/Krea-2-Turbo | DiT destilado (objetivo de inferencia) | No disponible | 8 pasos | No disponible | No disponible en la información aportada | Referenciado como `turbo.safetensors` |
| Otros LoRA de personaje para Krea 2 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenamiento inacabado: la model card indica "training in progress" en el paso 1104 de 1584 y solo publica checkpoints hasta la época 8 (paso 1056). Los pesos disponibles no corresponden al modelo final previsto.
- Licencia no especificada: sin licencia declarada no se puede determinar si el uso comercial está permitido ni bajo qué condiciones. Es un bloqueo para producción.
- Sin benchmarks ni validación externa: 0 descargas y 0 likes en el repositorio; no hay evaluaciones independientes de calidad, fidelidad de identidad ni estabilidad.
- Selección de checkpoint subjetiva: el propio autor descarta `avr_loss` como criterio fiable (pérdida casi plana) y recomienda elegir por inspección visual, lo que impide reproducir objetivamente la elección.
- Riesgo de sobreajuste y de rigidez: 66 imágenes base más un conjunto adicional reducido, con `num_repeats` 2 y 12 épocas, un volumen bajo que puede limitar la variabilidad de pose, iluminación y contexto del personaje.
- Sesgo de estilo y de sujeto: el dataset se compone de retratos y planos medios de una mujer joven, con imágenes de estilo animación occidental y descritas como "seductive", más generaciones sintéticas de seedream-v5-pro y gpt-image. Esto sesga la estética y reduce la diversidad de apariencia.
- Trigger por palabra de clase: al no haber token dedicado, la palabra `woman` activa la identidad en cualquier prompt, con riesgo de contaminar generaciones no relacionadas con el personaje.
- Procedencia de los datos: el entrenamiento se apoya en imágenes sintéticas de terceros (seedream-v5-pro, gpt-image), cuyas condiciones de uso condicionan la distribución del adaptador.
- Idiomas no documentados: las descripciones del dataset y los ejemplos de prompt están en inglés; no hay evidencia sobre el comportamiento con prompts en castellano.
- Sin datos de cuantización ni de inferencia: no se documenta VRAM, GPU mínima, latencia ni compatibilidad con GPU de consumo, lo que dificulta planificar el despliegue.
- Dependencia estricta del stack: la ruta de inferencia documentada requiere Krea 2 Turbo, el VAE de Qwen-Image, el text encoder Qwen3-VL-4B y Musubi Tuner; no se confirma funcionamiento en otros backends.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Zaytron40k/millie-v4-krea2-lora
- Modelo base declarado (krea/Krea-2-Raw): https://huggingface.co/krea/Krea-2-Raw
- Modelo objetivo de inferencia: krea/Krea-2-Turbo (identificador citado en la model card; no se aporta enlace verificado)
- Entrenador: Musubi Tuner (kohya-ss), citado en la model card sin enlace
- Búsqueda web: los resultados devueltos (centros de ayuda de YouTube y YouTube TV, y páginas de Zhihu) no guardan relación con el modelo y no aportan información técnica aprovechable.
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
