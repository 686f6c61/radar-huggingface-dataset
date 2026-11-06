# VisualInference/P-JiT-21K-MLX-8bit

## Resumen

P-JiT 21K MLX 8bit es una exportación del modelo de difusión texto-a-imagen P-JiT 21K desarrollado por Linum AI, adaptada para ejecutarse en Apple Silicon mediante el framework MLX. El modelo original es un Diffusion Transformer (DiT) de 2.180 millones de parámetros que opera directamente en espacio de píxeles, sin utilizar un VAE latente, y que incorpora un codificador de texto Qwen3.5-4B recortado a los 28 bloques que el modelo realmente consume. Esta conversión, publicada por VisualInference, mantiene la licencia Apache-2.0 del original y reduce el peso de la descarga de 18,0 GB (PyTorch) a 6,9 GB.

La relevancia de esta ficha reside en que demuestra una ruta práctica para ejecutar un DiT de escala media en hardware de consumo Apple: según la model card, una imagen de 1152×864 con 50 pasos tarda 79 segundos y consume 3,6 GB de memoria pico en un M4 Pro, frente a 139 segundos y 14,9 GB con PyTorch sobre MPS. Es, por tanto, una alternativa orientada a inferencia local en Mac más que a producción en GPU de datacenter.

La cuantización a 8 bits introduce una deriva medible respecto a bf16: la model card reporta que 14 de 15 pruebas de galería reproducen la misma imagen con el mismo seed, con PSNR mediano de 29,6 dB frente a los originales AVIF, y advierte de que prompts sensibles pueden ramificar hacia una imagen distinta de calidad equivalente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) en espacio de píxeles, con codificador de texto Qwen3.5-4B recortado a 28 bloques |
| Parámetros totales | 2,18 B (DiT); el codificador de texto Qwen3.5-4B se distribuye por separado dentro del repo |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (esta exportación); el modelo base dispone de tier bf16 y fp32 según la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos P-JiT 21K © Linum Inc.; Qwen3.5-4B © Alibaba Cloud; conversión y runner Apache-2.0) |
| Formato de pesos | safetensors (MLX), con tokenizer incluido en `text_encoder/` |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer que genera imágenes directamente en espacio de píxeles, prescindiendo de un autoencoder latente. Esta elección simplifica el pipeline (no hay VAE que decodificar) pero incrementa el coste computacional por paso al operar sobre resoluciones completas. El condicionamiento textual proviene de un codificador Qwen3.5-4B del que solo se conservan los bloques 0 a 27, es decir, la profundidad exacta que el DiT consulta; el resto de capas se descarta para reducir peso. La exportación incluye el embedding de tokens en bf16, leído fila a fila desde un memory map, y el tokenizer completo.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información correspondería a la card del modelo base `Linum-AI/pjit-21k`, no incluida en la información disponible. Sí se documenta con precisión el proceso de conversión: en fp32, el DiT y el codificador MLX coinciden con la referencia PyTorch con un error relativo de aproximadamente 3e-6; una ejecución completa de 50 pasos en fp32 reproduce el sampler de referencia en el 99,5 % de los píxeles, con el resto dentro de 1/255. En bf16, el modelo se sitúa en el propio ruido de redondeo de la referencia y reproduce las imágenes de la galería de Linum con PSNR mediano de 35 dB, gracias a replicar exactamente el muestreo de ruido del H100 SXM original. La versión de 8 bits desplaza algo más la primera predicción y acumula mayor deriva en detalle fino.

## Capacidades

- Generación de imágenes texto-a-imagen en espacio de píxeles, con resolución de trabajo de al menos 1152×864 según los ejemplos de la model card.
- Control de composición mediante prompts descriptivos densos, el formato para el que fue entrenado.
- Reproducibilidad determinista por seed: con el mismo prompt y seed se obtiene la misma imagen, lo que facilita iteración y comparación de variantes.
- Soporte de relación de aspecto configurable en el runner (`--aspect 4:3` en el ejemplo documentado).
- Generación por lotes de seeds en una sola invocación (`--seeds 4`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modalidades adicionales (audio, vídeo); es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Inferencia local en Mac para ilustración y prototipado: el tier de 8 bits permite generar imágenes de 1152×864 en 79 segundos con 3,6 GB de pico en un M4 Pro, lo que hace viable trabajar sin GPU dedicada ni conexión a servicios en la nube.
- Generación de retratos y figuras de medio cuerpo: los ejemplos de la galería se centran en retratos con iluminación y vestuario descritos con precisión, un régimen donde el modelo rinde según la card; útil para pruebas de concepto de personajes o avatares.
- Exploración de variantes controlada por seed: al ser determinista, permite fijar un seed y variar solo el prompt para estudiar el efecto de cambios léxicos concretos, útil en investigación sobre condicionamiento textual.
- Creación de material visual para documentación técnica o blogs: con prompts de 50-80 palabras se obtienen escenas descriptivas coherentes, adecuadas para ilustrar artículos donde no se requiere texto renderizado en la imagen.
- Integración en pipelines de CI para regresión visual: la coincidencia del 99,5 % de píxeles en fp32 con la referencia PyTorch y la reproducibilidad por seed permiten usar el modelo como base para tests automatizados de cambios en el pipeline de difusión.
- Evaluación comparativa de cuantizaciones: el repo documenta métricas de PSNR entre tiers (35 dB en bf16, 29,6 dB en 8 bits), lo que lo convierte en un banco de pruebas útil para estudiar el impacto de la cuantización en DiT de espacio de píxeles.
- Despliegue en Mac mini como servicio interno de generación de imágenes de baja concurrencia, aprovechando el consumo de memoria contenido del tier de 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo generativo de imágenes y no de lenguaje. La model card sí aporta métricas de fidelidad y de rendimiento de inferencia:

| Métrica | Resultado |
|---|---|
| Error relativo MLX fp32 vs. referencia PyTorch | ~3e-6 |
| Coincidencia de píxeles, 50 pasos fp32 vs. sampler de referencia | 99,5 % (resto dentro de 1/255) |
| PSNR mediano, tier bf16 vs. originales AVIF de la galería | 35 dB (15 de 15 imágenes idénticas) |
| PSNR mediano, tier 8 bits vs. originales AVIF de la galería | 29,6 dB (14 de 15 imágenes idénticas) |
| Tiempo por imagen 1152×864, 50 pasos, M4 Pro (este tier) | 79 s |
| Memoria pico, M4 Pro (este tier) | 3,6 GB |
| Tiempo por imagen 1152×864, 50 pasos, M4 Pro (PyTorch MPS) | 139 s |
| Memoria pico, M4 Pro (PyTorch MPS) | 14,9 GB |
| Tamaño de descarga (este tier / PyTorch) | 6,9 GB / 18,0 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,6 GB de pico en el tier de 8 bits según medición en M4 Pro; el tier bf16 y fp32 requieren más memoria (no cuantificada en la información disponible).
- GPU recomendadas: Apple Silicon (M4 Pro verificado en la model card; Mac mini mencionado como plataforma de renderizado). No se documenta soporte para CUDA en esta exportación, que es específica de MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos ~4 GB de memoria unificada disponible para el tier de 8 bits. No hay datos de ejecución en RTX 4090 u otras GPU NVIDIA para esta conversión.
- Opciones de despliegue: runner `pjit-mlx` (instalable vía `pip install git+https://github.com/felix-ab/pjit-mlx`), con flags `--tier 8bit`, `--seeds`, `--aspect`, `--prompt`, `--dit` y `--text-encoder`. Descarga de pesos vía `hf download`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 79 s por imagen de 1152×864 a 50 pasos en M4 Pro con el tier de 8 bits; no se proporcionan cifras de throughput por lotes ni de latencia en otros equipos.

## Comparativa con modelos similares

| Modelo | Parámetros | Espacio de generación | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P-JiT 21K MLX 8bit (esta ficha) | 2,18 B (DiT) + Qwen3.5-4B recortado | Píxeles | 1152×864 documentado | Apache-2.0 | Hugging Face, runner pjit-mlx |
| P-JiT 21K (Linum-AI/pjit-21k) | 2,18 B (DiT) + Qwen3.5-4B | Píxeles | 1152×864 documentado | Apache-2.0 | Hugging Face, pesos PyTorch |
| Alternativas de DiT texto-a-imagen de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos comparables (por ejemplo, familias DiT de parámetros similares) con los que establecer una comparación cuantitativa de rendimiento, contexto o licencia. La comparación más directa disponible es interna: el mismo modelo en formato PyTorch sobre MPS, con 139 s y 14,9 GB de pico frente a 79 s y 3,6 GB de esta exportación MLX.

## Limitaciones y advertencias

- Entrenado sobre captions densos de 50-80 palabras: los prompts muy cortos o muy largos pueden degradar la fidelidad respecto a la descripción solicitada.
- No puede renderizar texto legible dentro de la imagen, según la propia model card.
- Dificultades con figuras de cuerpo completo y multitudes, también declaradas por el autor.
- La cuantización a 8 bits introduce deriva en detalle fino (PSNR mediano 29,6 dB frente a 35 dB en bf16) y puede ramificar hacia una imagen distinta en prompts sensibles, aunque de calidad equivalente.
- No se documentan sesgos demográficos, culturales o de representación; al ser un modelo entrenado sobre datos no descritos en la información disponible, el riesgo de sesgo no puede evaluarse con los datos aportados.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir composiciones plausibles pero incorrectas respecto al prompt (por ejemplo, anatomía inconsistente en figuras humanas).
- Idiomas soportados no disponibles: el comportamiento multilingüe del codificador Qwen3.5-4B recortado no está documentado en esta card.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones de Linum Inc. (pesos) y Alibaba Cloud (Qwen3.5-4B); la conversión y el runner son también Apache-2.0.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (5 de noviembre de 2026): es una publicación reciente sin validación comunitaria.
- Dependencia del runner `pjit-mlx`, instalado desde GitHub, lo que añade un riesgo de cadena de suministro en producción.
- Sin soporte documentado para CUDA, vLLM, TGI u otros backends de servidor: no es adecuado para despliegues de alta concurrencia en GPU NVIDIA sin trabajo adicional de portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VisualInference/P-JiT-21K-MLX-8bit
- Modelo base: https://huggingface.co/Linum-AI/pjit-21k
- Runner pjit-mlx: https://github.com/felix-ab/pjit-mlx
- Sección de exactitud del runner: https://github.com/felix-ab/pjit-mlx#exactness
- Field notes de Linum sobre P-JiT 21K: https://www.linum.ai/field-notes/pjit-21k
