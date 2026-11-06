# Wh1teSpaces/OD-XL-v0.3-Illustrious-BooruDPO-LoRA-r32

## Resumen

OD-XL v0.3 Illustrious - Booru Tag DPO LoRA es un adaptador LoRA de rango 32 para el modelo base Wh1teSpaces/OrthogonalDiffusion-XL, entrenado mediante Diffusion-DPO (Direct Preference Optimization aplicado a modelos de difusion) con el objetivo de mejorar la calidad de los prompts estilo Booru en la generacion de imagenes anime. Lo desarrolla el usuario Wh1teSpaces y se publica bajo licencia CreativeML-OpenRAIL-M en Hugging Face. El adaptador no modifica el modelo base de forma permanente: se carga sobre un pipeline SDXL y actua como un ajuste de preferencias sobre la distribucion de prompts.

El problema que aborda es la sensibilidad del modelo base a prompts mal formados o degradados en el dominio de etiquetas Booru (el sistema de tagging usado en Danbooru y derivados). En lugar de entrenar con pares imagen-texto, el autor construye 2000 pares de prompts puramente textuales: una version bien formada (chosen) frente a una version degradada (rejected), y optimiza la politica para que asigne mayor probabilidad a la primera. Es relevante porque demuestra que es posible aplicar DPO a difusion sin ground truth visual, usando solo preferencias textuales y un banco de latentes sinteticos.

El adaptador tiene 85,11 M de parametros entrenables sobre un UNet de 2.567 B (3,32 %), con rango 32, y se entreno en 2x Tesla T4 con 420 pasos de optimizador. El checkpoint final presenta una accuracy de 0,6 en la clasificacion de pares y un margen de 0,003758, lo que indica una separacion muy debil entre elegidos y rechazados. El entrenamiento termino por NaN, un dato relevante para evaluar su robustez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de SDXL (adaptador de difusion) |
| Parametros totales | 85,11 M entrenables (3,32 % del UNet de 2.567 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de texto) |
| Tipos de cuantizacion | fp16 (base), LoRA en fp32 para master; no se documentan otras |
| Idiomas soportados | no disponible (prompts en ingles/Booru tags) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (pytorch_lora_weights.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 inyectado en el UNet del modelo base OrthogonalDiffusion-XL (variante SDXL, 2.567 B de parametros). El entrenamiento emplea un objetivo de Paired Conditional DPO con beta=500, donde el par chosen/rejected son dos prompts textuales (Booru bien formado vs. degradado) y el modelo de referencia se implementa como el mismo UNet con `set_scale(0.0)` en lugar de una copia separada o `disable_adapters()`, preservando la estructura del grafo. El banco de latentes es un "Tier-2 synthetic latent bank" de 64 latentes de 64x64 con `add_time_ids = 1024^2`, y los timesteps se restringen al rango [350, 999].

El entrenamiento se ejecuto en 2x Tesla T4 (SM 7.5, sin BF16 hardware) con DDP/NCCL a 2 rangos, precision FP16 con autocast y GradScaler, master de LoRA en FP32, optimizador bnb.AdamW8bit con lr constante 5e-06 y batch efectivo de 8 pares. Se realizaron 420 pasos de optimizador sobre 2000 pares text-only, con un pico de VRAM de 6,99 GB por GPU y un throughput de 1,192 s/par/GPU. El entrenamiento termino por NaN, lo que sugiere inestabilidad numerica en la fase final.

## Capacidades

- Generacion de imagenes texto-a-imagen estilo anime mediante el pipeline SDXL del modelo base.
- Mejora de la adherencia a prompts con etiquetas Booru bien formadas (orden, sintaxis, pesos).
- Penalizacion implicita de prompts degradados o mal estructurados en el dominio Booru.
- Compatibilidad con `clip_skip=2` y `prediction_type="epsilon"` segun indica el autor.
- Carga como adaptador LoRA sobre `StableDiffusionXLPipeline.from_single_file`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues: no documentadas; el dominio efectivo son tags en ingles/Booru.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion de ilustracion anime con prompts Booru: el adaptador refuerza la estructura correcta de tags (por ejemplo, orden canonico y pesos), lo que reduce la deriva cuando el usuario escribe prompts largos con muchas etiquetas.
- Normalizacion de prompts en pipelines de produccion: puede usarse como capa de preferencia para empujar la salida hacia prompts bien formados antes de la inferencia, en herramientas de generacion por lotes.
- Prototipado de interfaces de tagging: util para validar si un prompt cumple el formato Booru esperado comparando la respuesta del adaptador frente al base.
- Investigacion en Diffusion-DPO: sirve como referencia reproducible de un entrenamiento DPO text-only sobre SDXL con banco de latentes sintetico y receta de bajo VRAM (T4).
- Experimentos academicos de alineacion de preferencias sin pares imagen-texto: el diseno chosen/rejected puramente textual es un caso de estudio para metodologias de preference optimization en difusion.
- Ajuste fino de estilo sobre el checkpoint OrthogonalDiffusion-XL: al ser un LoRA de 0,3 GB, se puede cargar y descargar rapidamente en entornos con VRAM limitada para comparar variantes.

## Benchmarks y rendimiento

| Metrica | Inicial | Final |
|---|---|---|
| Loss | 0,693147 | 1,200877 |
| Margin | 0,0 | 0,003758 |
| Accuracy | 0,0 | 0,6 |
| Ratio_w | 1,0 | 0,899575 |
| Ratio_l | 1,0 | 0,964395 |

No se han publicado resultados de benchmarks estandar (FID, CLIP score, MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores son internas del entrenamiento DPO y no comparables con benchmarks de generacion de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador pesa 0,3 GB y se suma al UNet SDXL en fp16 (aproximadamente 6-7 GB solo el UNet, mas VAE y text encoders).
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM para SDXL en fp16; el autor entreno en 2x Tesla T4 (16 GB) con pico de 6,99 GB por GPU.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes con al menos 8 GB.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline.from_single_file` + `load_lora_weights`), ComfyUI, Automatic1111/Forge mediante carga de LoRA; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI (no aplica a difusion).
- Latencia y throughput: no disponible para inferencia; el throughput de entrenamiento reportado es 1,192 s/par/GPU en T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OD-XL v0.3 Illustrious Booru DPO LoRA r32 | 85,11 M entrenables (LoRA) | no aplica | accuracy DPO 0,6; margin 0,003758 | creativeml-openrail-m | Hugging Face |
| LoRA SDXL genericos (p. ej. estilos anime) | variable (tipicamente 10-200 M) | no aplica | no disponible | variable | Hugging Face |
| Adaptadores DPO para difusion publicados | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos publicados de modelos comparables directos en la informacion proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- El entrenamiento termino por NaN, lo que indica inestabilidad numerica y posibles artefactos en el checkpoint final.
- La loss final (1,200877) es superior a la inicial (0,693147) y el margen es muy bajo (0,003758), con accuracy de 0,6: la separacion entre prompts elegidos y rechazados es debil.
- El adaptador solo ha visto 2000 pares text-only; no hay validacion con imagenes generadas ni evaluacion cualitativa publicada.
- Sesgos conocidos: el dominio Booru/anime arrastra los sesgos de ese corpus de tags; no se documentan mitigaciones.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero el adaptador puede reforzar prompts que el base interprete de forma no deseada.
- Limitaciones de idioma: no se documentan idiomas soportados; el uso efectivo es con tags en ingles/Booru.
- Restricciones de licencia: CreativeML-OpenRAIL-M impone restricciones de uso (clausulas de uso aceptable); revisar antes de uso comercial.
- Requiere `clip_skip=2` y `prediction_type="epsilon"`; otros ajustes pueden degradar el resultado.
- El ID del autor en el codigo de ejemplo (`WhiteSpaces`) no coincide con el del repositorio (`Wh1teSpaces`); verificar la ruta al cargar el LoRA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Wh1teSpaces/OD-XL-v0.3-Illustrious-BooruDPO-LoRA-r32
- Modelo base: https://huggingface.co/Wh1teSpaces/OrthogonalDiffusion-XL
- Diffusers (libreria): https://github.com/huggingface/diffusers
- Documentacion de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Paper de Diffusion-DPO: no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
