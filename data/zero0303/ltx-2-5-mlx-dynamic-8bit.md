# zero0303/ltx-2.5-mlx-dynamic-8bit

## Resumen

LTX-2.5 MLX dynamic 8-bit es un port no oficial del modelo de generación de vídeo LTX-2.5 de Lightricks, adaptado para ejecutarse en Apple Silicon mediante el framework MLX. El modelo original es un sistema text-to-video e image-to-video con un transformer audio-vídeo de 48 bloques, un encoder de texto Gemma 4 de 12B y un pipeline destilado de dos etapas. Este port elimina la dependencia de PyTorch y CUDA, permitiendo inferencia local en Macs con chip M-series.

La aportación principal del port es la cuantización dinámica a 8 bits: de las 1.771 matrices de pesos grandes, las más sensibles (48 en el transformer y 48 en Gemma) se mantienen en 16 bits, mientras que el resto se cuantiza a 8 bits con grupo de 32. Esto reduce el tamaño de 66 GB a 45.8 GB manteniendo una precisión dentro del 5% del error propio del modelo oficial en 16 bits, y con la misma velocidad que este.

El modelo es relevante para desarrolladores que quieran experimentar con generación de vídeo de alta calidad en hardware de consumo Apple sin acceso a GPUs NVIDIA. El pipeline completo cabe en 24 GB de memoria unificada, con un pico de 9.3 GB durante la generación de un clip de 5 segundos a 1024x576.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer audio-video de 48 bloques (difusion) + encoder de texto Gemma 4 12B + VAE convolucional + upscaler latente x2 |
| Parametros totales | No disponible (el transformer destilado se denomina "22b" en el nombre del archivo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa prompts de texto; stage 1 con 2.304 tokens, stage 2 con 9.216 tokens latentes) |
| Tipos de cuantizacion | 8 bits dinamico (grupo 32) con tensores sensibles en 16 bits; VAE y upscaler en bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | LTX-2.x Community License Agreement |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 de Lightricks emplea un transformer de difusión audio-vídeo de 48 bloques que opera sobre latentes de vídeo, junto con un encoder de texto Gemma 4 de 12B, un extractor de características y conectores, un VAE convolucional con decodificación por tiles y un upscaler latente espacial x2. El pipeline es destilado en dos etapas: la etapa 1 genera a 512x288 con 8 pasos y la etapa 2 refina a 1024x576 con 3 pasos, usando un sampler ancestral con orden de ruido específico. Para image-to-video, el modelo fija el primer fotograma en ambas etapas y aplica timesteps por token.

Este port MLX replica línea por línea el código oficial (v1.5.0, commit e98f6d9) y fue validado contra el modelo original: en fp32 todas las partes coinciden con la salida fp32 oficial (Gemma ≤ 4.4e-6, transformer ≤ 2.2e-5, VAE 1.6e-5); en bf16 cada parte es tan precisa como el bf16 oficial (ratios 0.98-1.00); y la cadena de muestreo completa reproduce la ejecución oficial bit a bit. La cuantización dinámica se diseñó midiendo el efecto de cada una de las 1.771 matrices grandes sobre estados reales de denoising en fp32, comparando recetas completas sobre datos reservados contra el error de redondeo del modelo oficial en 16 bits. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable en múltiplos de 64 (por defecto 1024x576).
- Generación de vídeo a partir de una imagen inicial (image-to-video), con control de intensidad de la imagen (`--image-strength`).
- Generación de audio sincronizado con el vídeo (el transformer es audio-vídeo y el pipeline procesa ambas modalidades).
- Control de duración mediante número de fotogramas (por defecto 121 fotogramas = 5.04 s a 24 fps).
- Control de semilla para reproducibilidad (`--seed`).
- Salida en MP4 H.264 (BT.709, crf 19), sin sonido en el archivo de salida según la documentación del port.
- Soporte de prompts en inglés.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Generación de clips de vídeo para prototipado creativo: un desarrollador puede generar un clip de 5 segundos a 1024x576 desde un prompt de texto en unos 7 minutos en un M5 con 24 GB, útil para iterar rápidamente sobre conceptos visuales sin infraestructura cloud.
- Animación de imágenes fijas (image-to-video): partiendo de una fotografía o ilustración, el modelo genera movimiento coherente fijando el primer fotograma, adecuado para crear teasers o contenido para redes sociales a partir de material estático.
- Previsualización de storyboards: estudios pequeños pueden generar secuencias de vídeo aproximadas para validar guiones o planos antes de producir con herramientas profesionales.
- Investigación en generación de vídeo en Apple Silicon: el port permite estudiar el comportamiento de un modelo de difusión audio-vídeo de gran escala en hardware de consumo, sin GPUs NVIDIA, gracias a la carga por bloques que mantiene el pico en 9.3 GB.
- Creación de contenido educativo o demostraciones técnicas: clips cortos con audio generado para presentaciones o material divulgativo, con control de semilla para reproducir resultados.
- Evaluación de técnicas de cuantización: el repositorio incluye la receta `quant.json` y documenta el método de cuantización dinámica, lo que lo convierte en un caso de estudio para investigadores interesados en cuantización selectiva de modelos de difusión.
- Integración en pipelines locales de postproducción: la salida MP4 H.264 con BT.709 y crf 19 es directamente compatible con editores de vídeo, permitiendo incorporar clips generados a flujos de edición existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al tratarse de un modelo de generación de vídeo. La model card proporciona métricas de precisión de la cuantización y de velocidad:

| Metrica | Stage 1 (2.304 tokens) | Stage 2 (9.216 tokens) |
|---|---|---|
| 16-bit (precision oficial) | 1.00 | 1.00 |
| Dynamic 8-bit (video) | 1.05 | 1.06 |
| Dynamic 8-bit (audio) | 1.04 | 1.07 |

Error de una llamada de denoising contra el modelo fp32 exacto, como múltiplo del error propio del runtime oficial en 16 bits.

| Metrica | Resultado |
|---|---|
| Tokenizer | 16/16 prompts idénticos al oficial |
| Cada parte en fp32 | Gemma ≤ 4.4e-6, transformer ≤ 2.2e-5, VAE 1.6e-5 |
| Cada parte en bf16 | Ratios 0.98-1.00 frente al bf16 oficial |
| Cadena de muestreo | Reproduce bit a bit la ejecución oficial |
| Cuantización sola (fp32) | +0.4 del error de redondeo 16-bit en transformer; +0.48-0.61 en text encoder |
| 8-bit plano (todas las matrices) | +0.72-1.48 en text encoder, superando en ocasiones al propio 16-bit |

| Rendimiento en M5, 24 GB | Valor |
|---|---|
| Clip de 5 s a 1024x576 (121 frames) | 440 s (7.3 min) |
| Codificación del prompt | 17 s |
| Stage 1 (8 pasos a 512x288) | 16 s por paso |
| Stage 2 (3 pasos a 1024x576) | 72 s por paso |
| Decodificación | 70 s |
| Pico de memoria del proceso | 9.3 GB (MLX 7.6 GB) |

## Requisitos de hardware

- VRAM/memoria unificada: pico de 9.3 GB para el proceso completo en un clip de 5 s; se recomienda al menos 24 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon M-series; probado en un M5 con 24 GB.
- No compatible con GPUs NVIDIA ni CUDA (el port es específico de MLX).
- Almacenamiento: 46 GB de disco para los pesos.
- Software: Python 3.14, `mlx==0.32.2`, `numpy==2.4.6`, `tokenizers==0.23.3`, `av==19.0.2`, `pillow==13.0.0`, ffmpeg en el PATH.
- Despliegue: script `generate.py` (CLI) o API Python mediante `ltx25.pipeline.generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 440 s por clip de 5 s en M5 (aproximadamente 0.011 clips/s); la velocidad es equivalente a la del modelo en 16 bits.
- Los pesos se cargan por bloques (un bloque del transformer o una capa de Gemma a la vez), lo que reduce el pico de memoria a costa de streaming desde disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LTX-2.5 MLX dynamic 8-bit (este) | Transformer "22b" + Gemma 4 12B | 1024x576, 121 frames | LTX-2.x Community | Hugging Face, MLX | Port no oficial, solo Apple Silicon |
| LTX-2.5 (oficial, Lightricks) | Transformer "22b" + Gemma 4 12B | 1024x576, 121 frames | LTX-2.x Community | Hugging Face, PyTorch/CUDA | 66 GB en 16 bits, requiere GPU NVIDIA |
| Otros modelos text-to-video | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre benchmarks comparativos con otros modelos de generación de vídeo en la documentación proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo base y este port están documentados únicamente para prompts en inglés.
- Solo Apple Silicon: no funciona en GPUs NVIDIA, AMD ni en CPU x86; requiere MLX y macOS.
- Port no oficial: no es un lanzamiento de Lightricks; el autor lo declara como port independiente (ver `NOTICE.md`).
- Licencia restrictiva: LTX-2.x Community License Agreement; es responsabilidad del usuario revisar las condiciones para uso comercial.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir contenido incoherente, artefactos o movimientos no realistas, especialmente con prompts ambiguos.
- Resolución y duración limitadas: 1024x576 por defecto, 121 fotogramas (5.04 s a 24 fps); no se documentan modos de mayor duración.
- El archivo de salida no incluye sonido según la documentación del port, pese a que el transformer procesa audio.
- Precisión de cuantización: aunque el error está dentro del 5% del error propio del modelo 16-bit, existe una degradación medible frente al original.
- Sin benchmarks estándar publicados: no hay datos comparativos con otros modelos de vídeo que permitan evaluar calidad objetiva.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.
- Los scripts de paridad y cuantización no están incluidos en el repositorio, por lo que la reproducibilidad de las comprobaciones queda limitada a lo documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zero0303/ltx-2.5-mlx-dynamic-8bit
- Modelo base oficial: https://huggingface.co/Lightricks/LTX-2.5
- Repositorio oficial de código: https://github.com/Lightricks/LTX-2
- Licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
