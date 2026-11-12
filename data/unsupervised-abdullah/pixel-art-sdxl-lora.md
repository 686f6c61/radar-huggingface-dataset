# unsupervised-abdullah/pixel-art-sdxl-lora

## Resumen

Pixel Art SDXL LoRA es un adaptador LoRA de rango 32 para el UNet de Stable Diffusion XL, desarrollado por el usuario unsupervised-abdullah. Su propósito es transformar la salida de SDXL, que por defecto genera ilustraciones con "estética pixel" pero con celdas irregulares, bordes suaves y múltiples objetos, en sprites de juego limpios de un único objeto centrado, construidos con celdas cuadradas planas que emulan un sprite de 16x16 ampliado a 1024x1024. El modelo base permanece congelado; solo se entrenan los pesos del adaptador.

El adaptador se entrenó sobre 1000 sprites muestreados del dataset CC0 Pixel Art Atlas (1.4M sprites sintéticos de 16x16 con captions), uno por sujeto, para que aprenda el estilo y no objetos concretos. Está pensado para combinarse con LCM-LoRA y reducir la generación a 6 pasos de muestreo en lugar de 30, y para postprocesarse con un paso de ajuste a rejilla que produce sprites exactos de 16x16 con fondo transparente listos para usar como assets de videojuego.

Es relevante para equipos de desarrollo de videojuegos indie y artistas de pixel art que necesitan generar prototipos de assets rápidamente, así como para quienes investigan adaptadores de bajo rango sobre modelos de difusión. Su alcance es deliberadamente estrecho: objetos simples, criaturas sencillas y plantas, no personajes, escenas ni tilesets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre el UNet de Stable Diffusion XL (difusión latente texto-a-imagen) |
| Parametros totales | No disponible (el adaptador pesa aproximadamente 186 MB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusión; condicionado por prompt de texto) |
| Tipos de cuantizacion | fp16 (entrenamiento e inferencia documentados); no se detallan otras cuantizaciones |
| Idiomas soportados | Inglés (prompts); no disponible para otros idiomas |
| Licencia | CreativeML Open RAIL++-M (heredada de SDXL base) |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`), compatible con diffusers |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado únicamente al UNet de Stable Diffusion XL; los text encoders permanecen congelados. Se entrenó con el script oficial de diffusers para LoRA texto-a-imagen de SDXL, en precisión mixta fp16, durante 3000 pasos con batch size 1 (tres pasadas sobre los datos), learning rate constante de 1e-4 sin warm-up, optimizador 8-bit AdamW, ponderación de pérdida Min-SNR con gamma 5.0, noise offset de 0.05 y resolución de 1024x1024 con semilla 0. El entrenamiento completo requirió aproximadamente 2 horas en una única NVIDIA T4, a unos 2,35 s por paso.

Los datos de entrenamiento consisten en 1000 sprites muestreados del dataset Pixel Art Atlas (1.4M sprites sintéticos de 16x16 con captions, licencia CC0), tomando un sprite por sujeto. Cada sprite transparente de 16x16 se pegó sobre fondo blanco y se amplió a 1024x1024 con interpolación nearest-neighbour, de modo que cada píxel del sprite se convierte en un bloque nítido de 64x64. Los captions se reescribieron con el formato `pxlsprite, pixel art sprite of <caption>, white background`. No se documenta uso de RLHF ni DPO, al tratarse de un modelo de difusión.

## Capacidades

- Generación de imágenes texto-a-imagen de sprites de objeto único centrados, con estética de rejilla de píxeles plana.
- Especialización en items, criaturas simples y plantas (manzana, cofre del tesoro, poción, llave, slime, árbol, etc.).
- Compatibilidad con LCM-LoRA para generación en 6 pasos de muestreo con guidance scale 1.0.
- Modo de muestreo estándar a 30 pasos con guidance scale 7.
- Postprocesado con paso de ajuste a rejilla (snap-to-grid) del repositorio de GitHub para obtener sprites exactos de 16x16 con fondo transparente.
- Condicionamiento por prompt de texto en inglés con el formato de instancia `pxlsprite, pixel art sprite of <subject>, white background`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo de difusión, no un LLM).
- No dispone de capacidades de visión, audio ni thinking mode.

## Casos de uso

- Prototipado rápido de assets para videojuegos indie: generar sprites de items (pociones, llaves, cofres) por prompt y aplicar el snap-to-grid para obtener PNG de 16x16 con transparencia, listos para importar en el motor.
- Generación de iconos de inventario: producir un set coherente de iconos de objetos con el mismo estilo visual usando el formato de prompt entrenado y seleccionando la mejor semilla por sujeto.
- Creación de sprites de criaturas simples: generar slimes, plantas y enemigos básicos como punto de partida para que un artista los retoque, aprovechando la estética de rejilla uniforme.
- Iteración de dirección artística: comparar variantes de un mismo sujeto con distintas semillas para elegir paleta y silueta antes de encargar el asset final.
- Generación rápida en producción con LCM-LoRA: integrar el pipeline de 6 pasos en una herramienta interna de generación de assets, reduciendo el coste por imagen frente a los 30 pasos estándar.
- Docencia y experimentación con LoRA: usar el adaptador como ejemplo reproducible de fine-tuning de bajo rango sobre SDXL, con hiperparámetros y script documentados, para cursos o investigación sobre adaptadores de difusión.
- Generación de placeholders para pruebas de jugabilidad: poblar escenas de test con sprites generados automáticamente antes de disponer de arte definitivo.

## Benchmarks y rendimiento

La model card describe una evaluación sobre nueve generaciones a 1024x1024 a partir de ocho prompts cortos de objeto (manzana, cofre del tesoro, poción, llave, slime, espada, pino y donut; el prompt de slime con dos semillas), con semillas fijas compartidas entre configuraciones y cuatro configuraciones que cambian un solo factor: SDXL base a 30 pasos, LoRA a 30 pasos, LoRA con LCM y una cuarta configuración cuyo detalle queda truncado en la información disponible. Los prompts no provienen de los captions de entrenamiento. Los resultados numéricos de esa evaluación no se han publicado en la información disponible, y el propio autor advierte que la evaluación usa un conjunto pequeño de prompts, por lo que las puntuaciones son indicativas y no precisas.

| Benchmark | Resultado |
|---|---|
| Evaluación cualitativa sobre 9 generaciones (8 prompts) | Resultados numéricos no disponibles en la información proporcionada |
| MMLU, HumanEval, GSM8K u otros benchmarks de LLM | No aplica (modelo de difusión) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutarse sobre SDXL base en fp16 a 1024x1024, se sitúa en el rango habitual de SDXL (aproximadamente 8-12 GB según configuración y optimizaciones).
- GPU recomendadas: el autor entrenó en una NVIDIA T4; para inferencia son adecuadas GPUs con al menos 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas con VRAM suficiente para SDXL en fp16; el adaptador añade solo unos 186 MB de pesos.
- Opciones de despliegue: diffusers (pipeline `StableDiffusionXLPipeline` con `load_lora_weights`), con soporte de LCM-LoRA y del VAE `madebyollin/sdxl-vae-fp16-fix`; el repositorio incluye una app Gradio (`app.py`). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a difusión).
- Latencia y throughput: no disponibles de forma directa; el autor reporta unos 2,35 s por paso de entrenamiento en una T4, y la generación con LCM-LoRA reduce de 30 a 6 pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pixel Art SDXL LoRA (este) | LoRA rango 32 sobre UNet SDXL | No disponible (~186 MB de pesos) | No aplica | CreativeML Open RAIL++-M | Hugging Face, repo GitHub y demo Gradio |
| SDXL base (stabilityai/stable-diffusion-xl-base-1.0) | Difusión latente texto-a-imagen | No disponible en la información | No aplica | CreativeML Open RAIL++-M | Hugging Face |
| LCM-LoRA SDXL (latent-consistency/lcm-lora-sdxl) | LoRA de consistencia latente sobre SDXL | No disponible en la información | No aplica | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los fondos no siempre salen blancos: algunos resultan grises, azules o rosados.
- Algunos sujetos se generan con calidad débil, como espadas y donuts.
- Las salidas en bruto se aproximan a la rejilla de píxeles pero no caen exactamente sobre ella; es necesario el paso de snap-to-grid para obtener assets exactos de 16x16.
- Fuera de alcance: personajes, escenas, tilesets, fotogramas de animación y sprites mayores de 16x16; el dataset de entrenamiento solo contiene sprites pequeños de objeto único.
- No apto para generación fotorrealista ni de propósito general.
- Los sprites de entrenamiento son sintéticos (generados por IA) y sus captions no fueron revisados, por lo que el LoRA hereda errores y hábitos estilísticos del dataset.
- Hereda los sesgos y limitaciones del modelo base SDXL.
- La evaluación se basa en un conjunto pequeño de prompts, por lo que las métricas son indicativas y no sustituyen la revisión visual.
- Restricciones de licencia: CreativeML Open RAIL++-M impone restricciones de uso heredadas de SDXL; deben consultarse antes de un uso comercial. Cualquier uso prohibido por la licencia del modelo base queda también prohibido para este adaptador.
- Recomendaciones del autor: usar el formato de prompt entrenado, generar varias semillas por sujeto y quedarse con la mejor, aplicar el snap-to-grid antes de usar la salida como asset y revisar los resultados a ojo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unsupervised-abdullah/pixel-art-sdxl-lora
- Repositorio GitHub: https://github.com/ABDULAH-ab/Pixel-Art
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- LCM-LoRA SDXL: https://huggingface.co/latent-consistency/lcm-lora-sdxl
- Dataset Pixel Art Atlas: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- VAE fp16 fix: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Imagen de muestra: https://raw.githubusercontent.com/ABDULAH-ab/Pixel-Art/main/assets/showcase.png
