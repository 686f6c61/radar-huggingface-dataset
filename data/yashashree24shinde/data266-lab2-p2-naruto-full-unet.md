# yashashree24shinde/data266-lab2-p2-naruto-full-unet

## Resumen

El modelo `data266-lab2-p2-naruto-full-unet` es un ajuste fino completo del UNet de Stable Diffusion 1.5 sobre el conjunto de datos `lambdalabs/naruto-blip-captions`, compuesto por 1.221 imagenes de personajes y escenas del anime Naruto con leyendas generadas por BLIP. Lo desarrolla el equipo Pair_Programming_Team_08 de la Universidad Estatal de San Jose (SJSU) como parte del laboratorio DATA 266, y su proposito es comparar el ajuste completo del UNet frente a un adaptador LoRA de rango 16 entrenado sobre los mismos datos.

Se trata de un modelo de difusion texto-a-imagen derivado de `runwayml/stable-diffusion-v1-5`, del que solo se reentrena el UNet (859.520.964 parametros); el VAE y el codificador de texto permanecen congelados en sus pesos originales. El entrenamiento se realizo a 512x512 durante 1.000 pasos con un learning rate de 1e-6 y batch size de 1, alcanzando un pico de 12,02 GB de VRAM y completandose en 4,49 minutos sobre una RTX 4090.

Su relevancia es fundamentalmente academica y metodologica: sirve como referencia reproducible de como un ajuste completo del UNet sobre un dataset pequeno y de dominio estrecho afecta a metricas como KID, CLIP score, diversidad entre semillas y tasa de reemplazo por el filtro de seguridad, frente a una alternativa LoRA mas ligera. No es un modelo de proposito general ni esta pensado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (Stable Diffusion 1.5), con VAE y text encoder CLIP congelados |
| Parametros totales | 859.520.964 (solo UNet entrenable; el pipeline completo incluye VAE y text encoder del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el text encoder CLIP de SD 1.5 admite hasta 77 tokens por prompt) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, ONNX ni fp8) |
| Idiomas soportados | no disponibles (los prompts de entrenamiento estan en ingles via BLIP) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5: un autoencoder variacional (VAE) que comprime imagenes a un espacio latente, un codificador de texto CLIP que proyecta el prompt a embeddings y un UNet que realiza la difusion denoising en el espacio latente. En este ajuste solo se entrena el UNet completo (859.520.964 parametros), manteniendo congelados el VAE y el text encoder del modelo base `runwayml/stable-diffusion-v1-5`.

El entrenamiento utilizo las 1.221 imagenes del dataset `lambdalabs/naruto-blip-captions`, sin invalidos ni duplicados eliminados, con un split 90/10 y semilla 266 (1.098 de entrenamiento y 123 de test), redimensionadas a 512x512. Se aplicaron 1.000 pasos con batch size de 1 y learning rate de 1e-6, con semilla 266. El pico de memoria GPU fue de 12,02 GB y el tiempo total de entrenamiento de 4,49 minutos en una RTX 4090. No se documenta el uso de RLHF, DPO ni tecnicas de preferencia; el ajuste es puramente supervisado sobre pares imagen-texto.

## Capacidades

- Generacion de imagenes texto-a-imagen en estilo anime Naruto a partir de prompts en ingles.
- Reproduccion del estilo visual del dataset de entrenamiento (personajes, escenas y paleta del anime).
- Control de la generacion mediante semilla, lo que permite explorar diversidad entre muestras.
- Integracion con el pipeline `StableDiffusionPipeline` de diffusers, sustituyendo el UNet base.
- Compatibilidad con el safety checker de Stable Diffusion (activado por defecto en el pipeline).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No soporta vision de entrada, audio ni otras modalidades.
- Capacidades multilingues no documentadas; los prompts de entrenamiento estan en ingles.

## Casos de uso

- Docencia y practicas de ajuste fino: el modelo sirve como ejemplo reproducible de un full fine-tune del UNet sobre un dataset pequeno, con hiperparametros y metricas documentados para comparar con una alternativa LoRA.
- Investigacion sobre eficiencia de adaptacion: permite medir el coste (12,02 GB de pico, 4,49 minutos) y el beneficio de reentrenar el UNet completo frente a un adaptador LoRA r16 en terminos de KID, CLIP score y diversidad.
- Generacion de ilustraciones de fan art con estilo Naruto para uso no comercial, introduciendo prompts descriptivos en ingles y semillas controladas.
- Experimentos de evaluacion de modelos generativos: el par full UNet / LoRA r16 con las mismas 20 prompts fijas y semillas 0 y 1 facilita replicar comparativas con KID, CLIP score, LPIPS y win rate humano ciego.
- Prototipado de pipelines de difusion personalizados: al ser un UNet compatible con `StableDiffusionPipeline`, se puede integrar en flujos de generacion por lotes o en estudios de sensibilidad a la semilla.
- Analisis del efecto del filtro de seguridad: con 1 de 40 imagenes reemplazadas por el safety checker, sirve para estudiar falsos positivos y comportamiento del filtro en dominios de anime.
- Demostraciones academicas de ajuste de dominio estrecho: util para ilustrar como un dataset de 1.221 imagenes condiciona fuertemente el estilo y limita la generalizacion fuera del dominio.

## Benchmarks y rendimiento

| Metrica | Full UNet | LoRA r16 (run 1) |
|---|---|---|
| KID vs imagenes de test (media +/- desv.) | 0,0556 +/- 0,0047 | 0,0595 +/- 0,0056 |
| CLIP score | 32,67 | 32,75 |
| LPIPS entre semillas (diversidad) | 0,773 | 0,751 |
| Win rate humano ciego (25 pares, 3 evaluadores) | 52% | 48% |
| Imagenes reemplazadas por el safety checker (de 40) | 1 | 0 |

La evaluacion se realizo con 20 prompts fijos y semillas 0 y 1. Todos los valores son los impresos por el notebook del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base SD 1.5 en fp16 requiere aproximadamente 4 GB de VRAM para generar a 512x512; el UNet ajustado tiene el mismo tamano que el original (859.520.964 parametros), por lo que el requisito es equivalente.
- Entrenamiento: pico de 12,02 GB de VRAM documentado con batch size de 1 y 512x512.
- GPU recomendadas: RTX 4090 (usada en el entrenamiento), A100 o H100 para mayor throughput; cualquier GPU consumer con 6-8 GB o mas deberia poder ejecutar inferencia en fp16.
- Cabe en GPU consumer: si, en tarjetas con al menos 6-8 GB de VRAM en fp16 (por ejemplo RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `UNet2DConditionModel` (metodo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (UNet) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-p2-naruto-full-unet | 859.520.964 | no disponible (CLIP 77 tokens) | KID 0,0556; CLIP 32,67 | creativeml-openrail-m | Hugging Face (0 descargas) |
| data266-lab2-p2-naruto-lora-r16 | no disponible (adaptador LoRA sobre SD 1.5) | no disponible (CLIP 77 tokens) | KID 0,0595; CLIP 32,75 | no disponible en la informacion | Hugging Face |
| runwayml/stable-diffusion-v1-5 (base) | 859.520.964 (UNet) | no disponible (CLIP 77 tokens) | no evaluado en este estudio | creativeml-openrail-m | Hugging Face (modelo ampliamente distribuido) |

## Limitaciones y advertencias

- Estilo muy estrecho: el modelo esta especializado en el dominio Naruto y no generaliza a otros estilos o tematicas.
- Dataset pequeno (1.221 imagenes) y de una unica fuente (Narutopedia), lo que limita la variedad y puede provocar sobreajuste.
- Las imagenes de entrenamiento muestran personajes con derechos de autor y la dataset card no otorga una licencia abierta; el autor recomienda uso exclusivamente no comercial, docente y de investigacion.
- La licencia creativeml-openrail-m impone restricciones adicionales al uso comercial que deben revisarse antes de cualquier despliegue productivo.
- Riesgo de alucinacion visual: al ser un modelo de difusion, puede generar anatomia incorrecta, artefactos y composiciones incoherentes, especialmente fuera del dominio de entrenamiento.
- El safety checker reemplazo 1 de 40 imagenes generadas; debe mantenerse activado segun la model card.
- No hay informacion sobre sesgos demograficos ni sobre el comportamiento multilingue; los prompts de entrenamiento estan en ingles.
- No se documentan cuantizaciones alternativas (GGUF, ONNX, fp8) ni benchmarks estandar como FID o evaluaciones en otros datasets.
- Modelo sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/yashashree24shinde/data266-lab2-p2-naruto-full-unet
- Modelo LoRA r16 (run 1): https://huggingface.co/yashashree24shinde/data266-lab2-p2-naruto-lora-r16
- Dataset de imagenes generadas: https://huggingface.co/datasets/yashashree24shinde/data266-lab2-p2-naruto-images
- Codigo y notebook: https://github.com/aneessaheba/data266-lab2-team08
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
