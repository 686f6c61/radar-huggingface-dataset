# WaveCut/MiniMax-H3-Image-Pruned-OrbitQuant-W4A8

## Resumen

MiniMax-H3-Image-Pruned-OrbitQuant-W4A8 es una versión cuantizada a 4 bits (W4A8) del checkpoint podado MiniMax-H3-Image-Pruned, publicado por el usuario WaveCut. MiniMax-H3-Image es el modelo de generación de imágenes a partir de texto y edición de imágenes de MiniMax, capaz de producir imágenes de hasta 16 megapíxeles en 6 pasos de muestreo. Este release aplica la receta de cuantización OrbitQuant sobre el transformer de difusión y sobre el codificador de texto Qwen3-VL, manteniendo activaciones en 8 bits sobre pesos de 4 bits.

La relevancia práctica del modelo es la reducción drástica de requisitos de memoria y almacenamiento: la descarga ocupa 27,5 GB frente a los 95,1 GB del checkpoint podado en BF16 y los 135,4 GB del modelo original. Según la model card, en una RTX PRO 6000 una imagen de 4096×4096 tarda 13,6 s con un pico de 29,9 GiB, y una de 2048×2048 tarda 2,5 s; con offload de modelos funciona en 23,4 GiB de memoria libre de dispositivo.

El modelo conserva el transformer estándar de Diffusers `MiniMaxH3ImageTransformer2DModel` del checkpoint podado, calculando la modulación AdaLN con el forward pass original (código one-hot de timestep y proyecciones de 8 columnas en BF16), por lo que no requiere tabla de modulación. Se distribuye con licencia comunitaria propia de MiniMax-H3-Image y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (MiniMaxH3ImageTransformer2DModel) con codificador de texto Qwen3-VL |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits), GPTQ rounding; atención INT8 opcional |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint podado MiniMax-H3-Image-Pruned, que a su vez elimina del MiniMax-H3-Image original los pesos que su inferencia nunca lee. La arquitectura subyacente es un diffusion transformer para generación y edición de imágenes, acompañado de un codificador de texto Qwen3-VL. Ambos componentes (transformer y text encoder) se ejecutan con activaciones de 8 bits sobre pesos de 4 bits.

La cuantización utiliza OrbitQuant 0.18.0 con redondeo GPTQ, calibrado con prompts que no forman parte del conjunto de evaluación. El transformer mantiene el forward pass estándar de Diffusers para la modulación AdaLN, con el código one-hot de timestep y las proyecciones de 8 columnas en BF16, evitando la tabla de modulación que sí emplea el primer release de OrbitQuant sobre el checkpoint original. El runtime es la pipeline modular de MiniMax-H3-Image de Diffusers (commit `875373ac`, 2026-11-10) con kernels fusionados de OrbitQuant, más los nodos de ComfyUI-OrbitQuant. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset original.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resoluciones de hasta 16 megapíxeles (por ejemplo, 4096×4096 o 4736×3552).
- Generación en 6 pasos de muestreo.
- Edición de imágenes: acepta una o varias imágenes de referencia mediante `image=` en la pipeline, referenciadas como `<Picture 1>`, `<Picture 2>`, etc. en el prompt.
- Comprensión de prompts en inglés (único idioma declarado).
- Renderizado de texto dentro de la imagen, según los ejemplos de la model card (menú en pizarra, cartel en cirílico, póster infográfico).
- Composición de escenas complejas (cómic de cuatro viñetas, póster de viaje Art Deco, editorial de moda).
- Integración con ComfyUI mediante los nodos ComfyUI-OrbitQuant.
- Atención INT8 opcional para reducir aún más el consumo de memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes ni audio.

## Casos de uso

- Generación de imágenes de alta resolución para impresión: el modelo produce imágenes de hasta 16 MP en 6 pasos, adecuado para pósteres, infografías y material editorial que requieren detalle fino a resolución completa.
- Edición de imágenes asistida por referencia: con soporte de una o varias imágenes de referencia en el prompt, se puede usar para retoques, sustitución de elementos o transferencia de estilo en flujos de diseño gráfico.
- Prototipado rápido en estaciones de trabajo con GPU de 24 GB: con offload de modelos funciona en 23,4 GiB de memoria libre, lo que permite iterar en tarjetas consumer de gama alta sin recurrir a servidores.
- Integración en ComfyUI para pipelines de producción creativa: los nodos ComfyUI-OrbitQuant permiten encadenar el modelo con otros nodos de posprocesado y automatizar lotes de imágenes.
- Generación de material gráfico con texto legible: los ejemplos de la model card incluyen menús, carteles y pósteres con texto, útil para mockups publicitarios y señalética.
- Creación de cómics y narrativa visual: la capacidad demostrada de componer páginas de cuatro viñetas permite generar borradores de storyboards y páginas de cómic.
- Despliegue en servidores con VRAM limitada: la cuantización W4A8 reduce el pico a 29,9 GiB en una RTX PRO 6000, lo que facilita servir el modelo en infraestructura más modesta que la requerida por el BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al tratarse de un modelo de generación de imágenes. La model card sí reporta métricas de latencia, memoria y similitud perceptual frente al BF16 podado:

| Metrica | BF16 podado | OrbitQuant W4A8 (este release) |
|---|---|---|
| Descarga | 95,1 GB | 27,5 GB |
| Imagen 4096×4096 en RTX PRO 6000 | 27,6 s (pico 92,8 GiB) | 13,6 s (pico 29,9 GiB) |
| Imagen 2048×2048 en RTX PRO 6000 | 5,8 s | 2,5 s |
| Memoria libre de dispositivo con offload | no disponible | 23,4 GiB (tarjeta simulada de 24 GB) |

LPIPS frente a la imagen BF16 (menor es más cercano), por ejemplo de la model card: retrato 2048×2048 (0,074), póster Art Deco 1792×2368 (0,247), menú en pizarra 2048×2048 (0,223), calle de Moscú 2368×1792 (0,222), editorial de moda 1792×2368 (0,246), póster infográfico 2368×1792 (0,203), página de cómic 2048×2048 (0,215), edición 2048×2048 (0,015), rana a 4096×4096 (0,226) y ejemplo original a 4736×3552 (0,163).

## Requisitos de hardware

- VRAM estimada: pico de 29,9 GiB en una RTX PRO 6000 para 4096×4096; con offload de modelos funciona en 23,4 GiB de memoria libre de dispositivo.
- GPU recomendadas: RTX PRO 6000 Blackwell (probada); cualquier GPU NVIDIA con suficiente VRAM para el modo sin offload.
- Cabe en GPU consumer: sí, con offload en tarjetas de 24 GB (según la simulación reportada); sin offload requiere más de 29,9 GiB.
- Entorno probado: Linux, Python 3.12, Torch 2.12.1 con CUDA 13.0.
- Opciones de despliegue: pipeline modular de Diffusers (commit `875373ac`) con OrbitQuant 0.18.0, script `run_minimax_h3_image.py` incluido en el repo, y nodos ComfyUI-OrbitQuant. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo en la información disponible).
- Latencia: 13,6 s para 4096×4096 y 2,5 s para 2048×2048 en RTX PRO 6000; el BF16 podado tarda 27,6 s y 5,8 s respectivamente.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion maxima | Licencia | Tamano de descarga |
|---|---|---|---|---|---|
| MiniMax-H3-Image-Pruned-OrbitQuant-W4A8 (este) | no disponible | no disponible | 16 MP (hasta 4736×3552 en ejemplos) | minimax-h3-image-community-license-agreement | 27,5 GB |
| MiniMax-H3-Image-Pruned (BF16) | no disponible | no disponible | 16 MP | minimax-h3-image-community-license-agreement | 95,1 GB |
| MiniMax-H3-Image (original) | no disponible | no disponible | 16 MP | minimax-h3-image-community-license-agreement | 135,4 GB |
| MiniMax-H3-Image-OrbitQuant-W4A8 (primer release) | no disponible | no disponible | 16 MP | minimax-h3-image-community-license-agreement | mismo tamano que este release |

No se dispone de datos de benchmarks comparativos con otros modelos de generación de imágenes en la información proporcionada. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Solo declara soporte para inglés; el rendimiento en otros idiomas no está documentado.
- La cuantización a 4 bits introduce degradación perceptual medible: los valores LPIPS frente al BF16 oscilan entre 0,015 (edición) y 0,247 (póster Art Deco), lo que puede ser apreciable en detalles finos o texto pequeño.
- Los pesos están podados respecto al modelo original; no se documenta qué partes se eliminaron ni si ello afecta a capacidades específicas.
- Licencia comunitaria propia (minimax-h3-image-community-license-agreement): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que no es una licencia open source estándar.
- Requiere una versión de Diffusers no publicada en PyPI (commit concreto) y OrbitQuant 0.18.0, lo que complica la reproducibilidad y el mantenimiento a largo plazo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Riesgo de alucinación visual y de errores en la representación de texto dentro de la imagen, habitual en modelos de difusión; los ejemplos de la model card muestran casos con texto, pero no se cuantifica su precisión.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El calibrado GPTQ se realizó con prompts fuera del conjunto de evaluación, pero no se detalla su composición ni representatividad.
- Entorno probado muy específico (Torch 2.12.1, CUDA 13.0, RTX PRO 6000 Blackwell); el comportamiento en otras GPU no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/MiniMax-H3-Image-Pruned-OrbitQuant-W4A8
- Modelo base podado: https://huggingface.co/WaveCut/MiniMax-H3-Image-Pruned
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Primer release OrbitQuant sobre el original: https://huggingface.co/WaveCut/MiniMax-H3-Image-OrbitQuant-W4A8
- Repositorio OrbitQuant: https://github.com/iamwavecut/OrbitQuant
- Nodos ComfyUI-OrbitQuant: https://github.com/iamwavecut/ComfyUI-OrbitQuant
- Diffusers: https://github.com/huggingface/diffusers
