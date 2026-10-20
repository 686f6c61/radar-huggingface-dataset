# sunnyJane/data266-lab2-naruto-run2-lora-r32

## Resumen

sunnyJane/data266-lab2-naruto-run2-lora-r32 es un adaptador LoRA de rango 32 para Stable Diffusion 1.5, entrenado por el usuario sunnyJane en el contexto de la práctica DATA 266 Lab 2. No es un modelo de difusión completo: contiene 6.377.472 parámetros entrenables que se acoplan al U-Net de SD 1.5 para especializarlo en la generación de imágenes con personajes y estética de Naruto. El repositorio documenta la configuración de entrenamiento y una evaluación sobre 20 prompts fijos.

Su interés práctico reside en el bajo coste de adaptación: 2.000 pasos, batch 4, learning rate 1e-4, scheduler coseno, fp16 y Adam de 8 bits, con 0,963 GPU-horas en una Tesla T4 y un pico de 4,39 GB de VRAM. Es un ejemplo reproducible de fine-tuning paramétricamente eficiente sobre un dataset pequeño de 1.098 imágenes de 512x512 procedente de lambdalabs/naruto-blip-captions.

Ahora bien, la licencia y los metadatos exigen cautela. Aunque la etiqueta es CreativeML OpenRAIL-M, la model card restringe el uso a investigación no comercial por los derechos de autor de Naruto; además, el tamaño del repositorio figura como 0.0 GB y la sección de limitaciones está marcada como TODO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el U-Net de Stable Diffusion 1.5; modelo de difusión latente texto-imagen |
| Parámetros totales | 6.377.472 parámetros entrenables en el adaptador; el modelo base SD 1.5 ronda los 1.000 M en total (U-Net ~860 M, text encoder CLIP ~123 M, VAE ~83 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; el prompt se tokeniza con CLIP, con límite habitual de 77 tokens en SD 1.5 |
| Tipos de cuantización | No disponible; el adaptador se entrenó en fp16 con Adam de 8 bits. El modelo base admite fp16 y fp32 |
| Idiomas soportados | No disponible; las captions del dataset BLIP y los prompts de evaluación están en inglés |
| Licencia | CreativeML OpenRAIL-M, con restricción adicional de la model card a investigación no comercial por copyright de Naruto |
| Formato de pesos | No disponible; el repositorio figura con 0.0 GB en HuggingFace. Librería declarada: diffusers |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 |
| Rango LoRA | 32 |
| Resolución de entrenamiento | 512 x 512 |
| Dataset | lambdalabs/naruto-blip-captions, split 90/10 con semilla 266; 1.098 imágenes de entrenamiento |
| Entrenamiento | 2.000 pasos, batch 4, learning rate 1e-4, scheduler coseno, fp16, Adam de 8 bits |
| Coste de entrenamiento | 0,963 GPU-horas en una Tesla T4; pico de 4,39 GB de VRAM |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Stable Diffusion 1.5, un modelo de difusión latente compuesto por un U-Net denoising, un VAE y un text encoder CLIP. La técnica LoRA introduce matrices de baja秩 en capas lineales del U-Net, de modo que solo se optimizan 6.377.472 parámetros mientras el resto del modelo permanece congelado. Con rango 32, el adaptador busca capturar la estética y los personajes del dominio Naruto sin modificar los pesos base.

El entrenamiento utilizó el dataset lambdalabs/naruto-blip-captions, con 1.098 imágenes de 512x512 y captions generadas por BLIP, divididas en un split 90/10 con semilla 266. Se realizaron 2.000 pasos con batch 4, learning rate 1e-4, scheduler coseno, precisión fp16 y Adam de 8 bits, alcanzando un pico de 4,39 GB de VRAM en una Tesla T4. No se documenta RLHF, DPO ni etapas de alineación; tampoco se detalla la composición exacta del dataset más allá de su origen y tamaño.

## Capacidades

- Generación texto-imagen de personajes y escenas con estética Naruto sobre el modelo base SD 1.5.
- Adaptación de estilo y concepto mediante un adaptador de bajo rango, composable con el U-Net original.
- Uso en pipelines de diffusers, ComfyUI, Automatic1111, SD.Next e InvokeAI compatibles con LoRA de SD 1.5.
- Soporte de prompt negativo y parámetros habituales de muestreo (CFG scale, steps, scheduler, seed).
- Posible uso en img2img e inpainting a través de los pipelines de SD 1.5, aunque no fue entrenado específicamente para esas tareas.
- Reproducibilidad del entrenamiento y de la evaluación: hiperparámetros, semilla y protocolo de 20 prompts fijos documentados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; no es un modelo de lenguaje.

## Casos de uso

- Prototipado conceptual de personajes: generar variaciones de personajes y escenas de estilo Naruto para explorar direcciones visuales en investigación o docencia, usando el adaptador sobre SD 1.5 con seeds controladas.
- Docencia de fine-tuning eficiente: reproducir el entrenamiento LoRA con 2.000 pasos y 0,963 GPU-horas en una T4 como ejemplo práctico de ajuste paramétricamente eficiente en un curso de visión por computador.
- Aumento de datos sintéticos para experimentos académicos: generar imágenes etiquetadas de un dominio acotado para estudiar sesgos, estilos o robustez de clasificadores, siempre en ámbito no comercial.
- Investigación sobre composición de LoRAs: combinar este adaptador con otros LoRA de SD 1.5 para analizar interferencias, olvido catastrófico y control de estilo en pipelines de ComfyUI.
- Evaluación de técnicas de optimización de inferencia: medir latencia, VRAM y calidad percibida al aplicar fp16, attention slicing o xformers sobre un adaptador pequeño y un modelo base conocido.
- Generación de material para estudios de derechos de autor y licencias: analizar cómo un adaptador especializado en una franquicia protegida interactúa con licencias OpenRAIL y restricciones de uso comercial.
- Pruebas de reproducibilidad en difusión: replicar los valores de KID, CLIP y LPIPS publicados con los 20 prompts fijos y las seeds 0 y 1 para validar protocolos de evaluación.

## Benchmarks y rendimiento

| Métrica | Resultado | Protocolo | Interpretación |
|---|---|---|---|
| KID (in-domain frente a test) | 0,0507 | 20 prompts fijos, seeds 0 y 1 | Menor es mejor; mide la similitud distribucional con el conjunto de test |
| CLIP score | 30,42 | 20 prompts fijos, seeds 0 y 1 | Mayor es mejor; mide la alineación entre imagen y prompt |
| LPIPS diversity | 0,8203 | 20 prompts fijos, seeds 0 y 1 | Mayor es mejor; indica diversidad entre imágenes generadas |
| Parámetros entrenables | 6.377.472 | Configuración de entrenamiento | Adaptador LoRA de rango 32 |
| Coste de entrenamiento | 0,963 GPU-horas | Una Tesla T4, pico 4,39 GB | Eficiencia del ajuste |

No se han publicado comparaciones directas con otros adaptadores o con el modelo base en la información disponible. Los valores de KID, CLIP y LPIPS no son directamente comparables con los de otros modelos si cambian los prompts, las seeds o el conjunto de referencia.

## Requisitos de hardware

- El adaptador pesa aproximadamente 12,8 MB en fp16 (6.377.472 parámetros x 2 bytes) y unos 25,5 MB en fp32, aunque el repositorio figura con 0.0 GB.
- La inferencia requiere cargar el modelo base SD 1.5 completo: alrededor de 2 GB en fp16 para U-Net, VAE y text encoder, más overhead del pipeline.
- VRAM estimada: 4 GB como mínimo con fp16 y optimizaciones de atención a 512x512; 6-8 GB recomendados para trabajar con comodidad.
- GPU de entrenamiento documentada: Tesla T4 de 16 GB, con pico de 4,39 GB.
- GPU consumer compatibles: GTX 1660 de 6 GB, RTX 3050 de 8 GB, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4090 de 24 GB. En tarjetas de 4 GB puede requerir fp16, attention slicing y resolución reducida.
- GPU de centro de datos: A100, H100 y L40S son válidas para servir el modelo base, aunque el adaptador es demasiado pequeño para aprovechar su capacidad por sí solo.
- Despliegue: diffusers, ComfyUI, Automatic1111, SD.Next e InvokeAI. No aplica vLLM, llama.cpp ni TGI, que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponibles. El único dato de rendimiento es el coste de entrenamiento de 0,963 GPU-horas en una T4.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador | LoRA sobre SD 1.5 | 6,4 M entrenables + ~1.000 M del base | 512 x 512 | 77 tokens CLIP | CreativeML OpenRAIL-M con restricción no comercial | Repositorio de 0.0 GB; pesos no confirmados |
| Stable Diffusion 1.5 base | Difusión latente completa | ~1.000 M | 512 x 512 | 77 tokens CLIP | CreativeML OpenRAIL-M | Público y ampliamente desplegado |
| LoRA genérico sobre SDXL | LoRA sobre SDXL | ~2.600 M en el U-Net base + adaptador | 1.024 x 1.024 | 77 tokens CLIP | CreativeML OpenRAIL++-M | Público |
| DreamBooth completo sobre SD 1.5 | Fine-tuning completo | ~860 M entrenables | 512 x 512 | 77 tokens CLIP | CreativeML OpenRAIL-M | Pesos completos del orden de GB |

No hay datos de rendimiento comparativos publicados en la información disponible. La comparación debe limitarse a arquitectura, tamaño, resolución y licencia; este adaptador solo es relevante junto con SD 1.5 y no sustituye al modelo base.

## Limitaciones y advertencias

- Los personajes de Naruto están protegidos por derechos de autor; la model card restringe explícitamente el uso a investigación no comercial, aunque la etiqueta sea CreativeML OpenRAIL-M. En producción comercial prevalece la restricción del autor.
- El repositorio figura con 0.0 GB en HuggingFace, por lo que no se confirma que los pesos
