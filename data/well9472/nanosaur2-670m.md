# well9472/Nanosaur2-670M

## Resumen

Nanosaur2-670M es un modelo de texto a imagen especializado en ilustración, desarrollado por el usuario well9472 y publicado bajo licencia MIT. Se trata de un Diffusion Transformer (DiT) de 670 millones de parámetros que genera imágenes de 1024 píxeles con aspect buckets, acompañado de un codificador de texto Gemma 3 270M congelado y un VAE semántico de 129 millones de parámetros derivado de DINOv2. La pila completa suma aproximadamente 1.070 millones de parámetros y 2,1 GB de pesos en safetensors.

Su interés principal no es la calidad absoluta, sino la eficiencia: el autor cifra el coste total de entrenamiento en unos 600 dólares, con 11 días de H100 para el modelo de difusión y 12 horas de una única H100 para el VAE. El modelo está pensado explícitamente para investigación y el propio autor advierte de que no compite con modelos totalmente entrenados como Anima en conocimiento de personajes ni en detalle fino.

Técnicamente incorpora varias innovaciones recientes: bloques intermedios dispersos de SPRINT, predicción en espacio x con rectified flow, adaLN-single, RoPE 2D, SwiGLU y QK-norm. El muestreo combina CFG alternado con path-drop guidance (PDG), y el modelo aprende esa pasada incondicional durante el entrenamiento. El autor busca financiación para seguir entrenándolo y lanzar una versión de 2B parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con adaLN-single, RoPE 2D, SwiGLU, QK-norm, bloques intermedios dispersos SPRINT y predicción x |
| Parámetros totales | 670M (modelo de difusión) + 270M (codificador de texto Gemma 3) + 129M (VAE) ≈ 1.070M en total |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen; resolución de entrenamiento 1024x con aspect buckets) |
| Tipos de cuantización | no disponible (los safetensors suman 2,1 GB, coherente con bf16 para el total de parámetros) |
| Idiomas soportados | no disponible (el codificador de texto es Gemma 3 270M; los prompts de ejemplo de la model card están en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (tres ficheros: `nanosaur2_diffusion_model.safetensors`, `nanosaur2_text_encoder.safetensors`, `nanosaur2_vae.safetensors`) |

## Arquitectura y entrenamiento

El componente principal es un DiT de 670M parámetros con normalización adaptativa adaLN-single, embeddings posicionales rotatorios 2D (RoPE), activación SwiGLU y QK-norm. Incorpora los bloques intermedios dispersos de SPRINT (Sparse-Dense Residual Fusion), que permiten saltar tokens en las capas centrales, y utiliza predicción en el espacio x en lugar del ruido. El objetivo de entrenamiento es rectified flow con x-prediction y pérdida v, timesteps logit-normal y un 10 % de caption dropout. Para que el modelo aprenda la pasada incondicional que usan las guías `alternate` y `path_drop`, las muestras sin texto saltan los bloques intermedios el 50 % de las veces y el resto de muestras solo el 5 %. El codificador de texto es Gemma 3 270M congelado, del que se toma la penúltima capa junto con la normalización final.

El VAE es un autoencoder de representación de 129M parámetros entrenado a partir de DINOv2-B: incluye DINOv2 congelado (32 canales), DINOv2 con patch embed descongelado según UniSpace, concatenación por canales de las últimas 6 capas (32 canales), decodificador convolucional y pérdidas VISReg (1e-3) sobre un cuello de botella latente de 64 dimensiones, más una pérdida MSE de embeddings DINO por capa con pesos iguales entre DINOv2-B y DINOv3-B congelados. No hay pérdidas de píxel, ni LPIPS, ni GAN. El calendario de entrenamiento fue: 50.000 pasos de VAE (12 horas en 1xH100), 11 días-H100 de entrenamiento base sobre un dataset de 4 millones de imágenes de ilustración con el optimizador Dion3 (lr 1e-3, scalar lr 1e-4, weight decay 0,01, schedule coseno), repartidos en 3 días a 256x256, 3 días a 512x512 y 5 días a 1024x1024 con aspect buckets, y finalmente 4 horas de ajuste estético sin token dropping de SPRINT (Dion3 1e-4, scalar 5e-5 con decaimiento coseno).

## Capacidades

- Generación de imágenes de ilustración a partir de texto, en resolución 1024x con aspect buckets.
- Acepta tanto etiquetas estilo booru como lenguaje natural; el autor recomienda prefijar el prompt positivo con "newest, masterpiece" y el negativo con "oldest, low quality".
- Ponderación de prompts personalizada mediante sintaxis tipo `(artist:4)`, que actúa sobre el sesgo de cross-attention y no sobre la magnitud del embedding.
- Muestreo con guiado dual: CFG alternado y PDG (path-drop guidance, procedente de SPRINT).
- Fine-tuning mediante LoRA con un script incluido que entrena sobre una carpeta de imágenes con ficheros `.txt` de caption del mismo nombre y escribe el resultado en `models/loras/<nombre de carpeta>.safetensors`.
- Integración con ComfyUI mediante el nodo personalizado `nanosaur2_support` y un workflow que viene embebido en el PNG de ejemplo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni generación de texto.

## Casos de uso

- Previsualización de conceptos artísticos: generar bocetos de personajes y escenas a 1024x con prompts de etiquetas para validar dirección de arte antes de encargar ilustración final. El modelo está entrenado sobre un dataset de ilustración, por lo que el registro estilístico encaja directamente.
- Assets para videojuegos independientes: retratos de personaje, iconos y elementos de interfaz generados en lotes, con ajuste fino LoRA por proyecto para fijar un estilo propio coherente.
- Entrenamiento de LoRA de estilo de estudio: el repositorio incluye `train_lora.py`, que entrena sobre una carpeta de imágenes con captions y genera un safetensors cargable con `LoraLoaderModelOnly`, sin necesidad de infraestructura adicional.
- Investigación sobre eficiencia de entrenamiento: es un caso de estudio reproducible de qué calidad se alcanza con 600 dólares y 11 días-H100, útil para comparar objetivos, optimizadores y schedules en condiciones de cómputo mínimo.
- Estudio de VAEs de representación: el VAE semántico de 129M basado en DINOv2-B y DINOv3-B, sin pérdidas de píxel ni GAN, es un objeto de análisis independiente para líneas de trabajo sobre latentes semánticos y convergencia más rápida.
- Docencia y experimentación en GPU de consumo: al ser un modelo de ~1.070M parámetros totales con pesos de 2,1 GB, cabe en tarjetas domésticas y permite impartir prácticas de difusión sin acceso a clúster.
- Generación de ilustraciones para blogs y documentación técnica: producción de imágenes de acompañamiento con prompts cortos en inglés, aceptando la variabilidad propia de un modelo de investigación.
- Exploración de guiado híbrido CFG + path-drop: el modelo permite experimentar con `alternate` y `path_drop` sin reentrenar, ya que aprende la pasada incondicional durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una imagen de muestra generada con el prompt de ejemplo y los parámetros de inferencia recomendados: muestreador Euler simple, 50 pasos, CFG 4, resolución 1024x con aspect buckets y shift 3 integrado en la inferencia.

## Requisitos de hardware

- Peso de los tres ficheros: 2,1 GB en total (670M del DiT + 270M del codificador de texto + 129M del VAE) en safetensors, presumiblemente bf16.
- VRAM estimada para inferencia a 1024x: del orden de 4-8 GB en bf16, sumando pesos, activaciones del DiT y decodificación del VAE. Es una estimación derivada del tamaño del modelo, no un dato publicado.
- Cabe en GPU de consumo: cualquier tarjeta con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) debería ser suficiente. No se requiere A100 ni H100 para inferencia; esas GPU se usaron únicamente para el entrenamiento.
- Opciones de despliegue: ComfyUI con el nodo personalizado `nanosaur2_support` es la vía documentada. No se mencionan vLLM, TGI, llama.cpp, Ollama ni Diffusers para este modelo, y la integración con pipelines estándar de difusión no está documentada.
- Latencia y throughput: no disponibles. La configuración recomendada son 50 pasos de Euler simple, un número relativamente alto que sugiere tiempos de generación no triviales en GPU de gama media, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Resolución nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanosaur2-670M | 670M DiT + 270M text encoder + 129M VAE | DiT con SPRINT, adaLN-single, RoPE 2D | 1024x aspect buckets | MIT | HuggingFace + nodo ComfyUI |
| PixArt-α | ~0,6B (DiT) | DiT con adaLN-single | 1024x | no disponible | HuggingFace |
| SDXL | ~3,5B (UNet + text encoders) | UNet | 1024x | no disponible | HuggingFace |
| SD 1.5 | ~0,86B (UNet) | UNet | 512x | no disponible | HuggingFace |
| Anima | no disponible | no disponible | no disponible | no disponible | mencionado por el autor como referencia de calidad superior |

El autor sitúa explícitamente a Anima por encima de Nanosaur2 en conocimiento de personajes y detalle fino, pero no aporta especificaciones de ese modelo. No se dispone de resultados de benchmarks comparativos para ninguna de estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo declarado "para propósitos de investigación" por el autor. Aunque la licencia MIT permite uso comercial, no hay garantías de calidad ni de robustez en producción.
- El propio autor advierte de que no compite con modelos totalmente entrenados como Anima en conocimiento de personajes ni en detalle fino.
- Entrenado sobre un dataset de 4 millones de imágenes de ilustración, por lo que hereda los sesgos estéticos, de composición y de representación de ese corpus. No hay documentación sobre filtrado, diversidad demográfica ni procedencia de los datos.
- Riesgo previsible de artefactos en anatomía (manos, extremidades), texto dentro de la imagen y coherencia en escenas complejas, habitual en modelos de este tamaño y presupuesto de entrenamiento.
- El VAE semántico se entrena sin pérdidas de píxel, sin LPIPS y sin GAN, basándose en pérdidas DINO. Esto es una decisión de diseño documentada y puede afectar a la fidelidad de reconstrucción a nivel de píxel.
- Cobertura multilingüe no documentada. Los prompts de ejemplo y las etiquetas de calidad recomendadas están en inglés.
- Requiere instalación manual de un nodo personalizado en ComfyUI y la colocación de tres ficheros en carpetas concretas. No es compatible directamente con cargadores estándar.
- La sintaxis de ponderación de prompts (`(artist:4)`) es personalizada y actúa sobre el sesgo de cross-attention, no sobre la magnitud del embedding, lo que rompe la expectativa de comportamiento de otras interfaces.
- Solo se distribuyen pesos en safetensors; no hay versiones cuantizadas ni GGUF documentadas.
- El repositorio registra 0 descargas y 33 likes en el momento de la consulta, con creación y última actualización en septiembre de 2026. Es un modelo reciente y con muy poca validación externa.
- No hay benchmarks publicados, por lo que cualquier decisión de adopción se basa únicamente en la muestra cualitativa de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/well9472/Nanosaur2-670M
- SPRINT: Sparse-Dense Residual Fusion for Efficient Diffusion Transformers (ICLR 2026): https://arxiv.org/abs/2510.21986
- Scalable Diffusion Models with Transformers (ICCV 2023): https://arxiv.org/abs/2212.09748
- PixArt-α: Fast Training of Diffusion Transformer for Photorealistic Text-to-Image Synthesis (ICLR 2024): https://arxiv.org/abs/2310.00426
- RoFormer: Enhanced Transformer with Rotary Position Embedding: https://arxiv.org/abs/2104.09864
- GLU Variants Improve Transformer: https://arxiv.org/abs/2002.05202
- Scaling Vision Transformers to 22 Billion Parameters (ICML 2023): https://arxiv.org/abs/2302.05442
- Back to Basics: Let Denoising Generative Models Denoise (CVPR 2026): https://arxiv.org/abs/2511.13720
- Gemma 3 Technical Report: https://arxiv.org/abs/2503.19786
- DINOv2: Learning Robust Visual Features without Supervision (TMLR 2024): https://arxiv.org/abs/2304.07193
- Diffusion Transformers with Representation Autoencoders: https://arxiv.org/abs/2510.11690
- Improved Baselines with Representation Autoencoders: https://arxiv.org/abs/2605.18324
- UniSpace: Unified Visual Representation and Scalable Multimodal Modeling: https://arxiv.org/abs/2608.08676
- VISReg: Variance-Invariance-Sketching Regularization for JEPA training: https://arxiv.org/abs/2606.02572
- DINOv3: https://arxiv.org/abs/2508.10104
- Dion3: Full-Stack Orthogonal Updates: https://arxiv.org/abs/2608.11612
