# YashShevkar30/data266-lab2-naruto-lora_r8

## Resumen

`data266-lab2-naruto-lora_r8` es un adaptador LoRA de rango 8 entrenado sobre Stable Diffusion 1.5 para generar imagenes del universo Naruto. Lo desarrolla YashShevkar30 en el contexto de la practica "DATA 266 Lab 2, Part 2" (Pair_Programming_Team_03), por lo que se trata de un artefacto academico y no de un modelo de produccion. El objetivo es demostrar el ajuste fino parametrizado eficiente (PEFT) de un modelo de difusion mediante LoRA sobre un dataset de imagenes con leyendas automaticas.

El adaptador modifica las proyecciones de atencion (q, k, v, out) y las capas feed-forward del UNet de Stable Diffusion 1.5, con rango 8 y alpha 8, lo que resulta en 2.992.128 parametros entrenables, una fraccion minima del total del modelo base. El entrenamiento se realizo sobre 1099 imagenes de 512x512 procedentes del dataset `lambda/naruto-blip-captions`, durante 2000 pasos (7,28 epocas) en una NVIDIA RTX PRO 4500 Blackwell, con un coste de 0,27 GPU-horas.

Su relevancia es fundamentalmente didactica: ilustra un flujo completo de ajuste fino de difusion con evaluacion cuantitativa (KID, CLIP score, LPIPS, flags NSFW) y documenta limitaciones de forma transparente. No obstante, el modelo tiene descargas y likes nulos, no incluye pesos en el repositorio (0,0 GB) y su licencia y procedencia de datos presentan restricciones importantes para cualquier uso fuera del ambito docente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5 (difusion latente, transformer convolucional) |
| Parametros totales | 2.992.128 parametros entrenables (adaptador); modelo base no disponible en el repo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; el adaptador se distribuye en el formato nativo de LoRA) |
| Idiomas soportados | no disponibles (las leyendas del dataset son generadas por BLIP, presumiblemente en ingles; no se declara soporte multilingue) |
| Licencia | CreativeML OpenRAIL-M (modelo base); imagenes de entrenamiento sin licencia declarada y sujetas a copyright de Naruto |
| Formato de pesos | no disponible (repo de 0,0 GB; el autor indica carga via `pipe.load_lora_weights(...)`, compatible con el formato de LoRA de diffusers) |

## Arquitectura y entrenamiento

El adaptador se inyecta en el UNet de Stable Diffusion 1.5 mediante LoRA de rango 8 y alpha 8 sobre las proyecciones de atencion (q, k, v, out) y las capas feed-forward. El modelo base es un modelo de difusion latente con un autoencoder VAE, un UNet y un codificador de texto CLIP; el LoRA solo ajusta el UNet, dejando intactos el VAE y el text encoder. El entrenamiento empleo 1099 imagenes de 512x512 tras eliminar imagenes corruptas y duplicadas del dataset `lambda/naruto-blip-captions`, con un split 90/10 y semilla 266.

La configuracion de entrenamiento fue de 2000 pasos con batch 4 (7,28 epocas), optimizador AdamW con learning rate 1e-4, scheduler coseno, Min-SNR gamma 5 y precision mixta en bfloat16. El coste fue de 973 segundos (0,2703 GPU-horas) en una NVIDIA RTX PRO 4500 Blackwell, con un pico de memoria de 4,74 GB. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; las leyendas del dataset son genericas, generadas por BLIP, lo que limita la especificidad del condicionamiento textual.

## Capacidades

- Generacion de imagenes texto-a-imagen de personajes y escenas del universo Naruto, condicionada por prompts en lenguaje natural.
- Especializacion en primeros planos de estilo anime, el rango tematico dominante del dataset de entrenamiento.
- Composicion con el modelo base Stable Diffusion 1.5: el adaptador se carga sobre el pipeline estandar de diffusers y hereda sus capacidades (img2img, inpainting, controlnet, etc., segun el pipeline usado).
- Control de estilo mediante el peso del adaptador (`scale` en `load_lora_weights`), aunque el autor no documenta valores recomendados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagenes, no un LLM.
- No se declaran capacidades multilingues ni modos especiales (thinking, vision, audio).

## Casos de uso

- Docencia en ajuste fino de modelos de difusion: el adaptador sirve como ejemplo reproducible de un pipeline LoRA completo, con hiperparametros, coste GPU y metricas documentadas, adecuado para practicas de laboratorio.
- Generacion de arte fan no comercial: creacion de ilustraciones de personajes de Naruto para proyectos personales o portfolios, siempre que se respete la licencia OpenRAIL-M y se asuma el riesgo de copyright sobre los personajes.
- Experimentacion con PEFT en difusion: comparar el efecto del rango (r8 frente a otros valores) sobre la fidelidad al dominio y la diversidad de semillas, usando las metricas KID y LPIPS reportadas como linea base.
- Prototipado de pipelines de evaluacion: el conjunto de 20 prompts fijos con 2 semillas y las metricas KID/CLIP/LPIPS/NSFW constituyen una plantilla reutilizable para evaluar otros adaptadores de estilo.
- Generacion de variaciones de estilo anime: usar el adaptador como capa de estilo sobre el modelo base para explorar composiciones de personajes con estetica anime, aceptando la deriva hacia personajes de anime en prompts fuera de dominio.
- Investigacion sobre sesgos y seguridad en difusion: los 2/40 flags NSFW reportados permiten estudiar la eficacia de los filtros de seguridad en adaptadores de bajo rango entrenados con datos no curados.

## Benchmarks y rendimiento

Resultados reportados por el autor con 20 prompts fijos y 2 semillas, DPM-Solver++ a 30 pasos y guidance 7.5:

| Metrica | LoRA r8 | Base SD 1.5 |
|---|---|---|
| KID (in-domain vs test) | 0,0243 | 0,1393 |
| CLIP score | 30,68 | 31,91 |
| LPIPS (diversidad entre semillas) | 0,772 | 0,794 |
| Flags NSFW | 2/40 | no disponible |

El KID indica una mejora sustancial en la fidelidad al dominio Naruto respecto al modelo base, mientras que el CLIP score y la diversidad entre semillas son ligeramente inferiores, lo que sugiere un cierto sobreajuste al estilo y una perdida de alineacion con el prompt textual. El propio autor advierte que el KID calculado sobre 20 imagenes es ruidoso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento requirio un pico de 4,74 GB en bfloat16 con batch 4 a 512x512, por lo que la inferencia en precision completa cabe holgadamente en GPUs de 8 GB o mas.
- GPU recomendadas: NVIDIA RTX PRO 4500 Blackwell (usada en entrenamiento); cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) es suficiente para inferencia a 512x512.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas, dado el reducido tamano del adaptador y el tamano moderado del modelo base SD 1.5.
- Opciones de despliegue: diffusers (`pipe.load_lora_weights`), Automatic1111 WebUI, ComfyUI, InvokeAI y otros frontends compatibles con LoRA de SD 1.5; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles; el autor solo reporta el tiempo de entrenamiento (973 s, 0,2703 GPU-horas), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros entrenables | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| data266-lab2-naruto-lora_r8 | LoRA r8 | SD 1.5 | 2.992.128 | no aplica | CreativeML OpenRAIL-M | Repo de 0,0 GB, 0 descargas |
| LoRA de estilo anime generico sobre SD 1.5 | LoRA | SD 1.5 | variable (no disponible) | no aplica | CreativeML OpenRAIL-M | Amplia disponibilidad en HF |
| Stable Diffusion 1.5 (modelo base) | Difusion latente completa | - | ~860 M (UNet) | no aplica | CreativeML OpenRAIL-M | Amplia disponibilidad |
| Stable Diffusion XL | Difusion latente completa | - | ~2,6 B (UNet) | no aplica | CreativeML OpenRAIL++-M | Amplia disponibilidad |

La comparativa directa con otros LoRA de anime es limitada porque el autor no publica pesos en el repositorio y no existen datos de benchmarks comparables en la informacion disponible. Frente al modelo base, el adaptador mejora el KID en dominio a costa de un CLIP score ligeramente inferior; frente a SDXL, carece de la resolucion nativa de 1024x1024 y de la mayor calidad del modelo mas grande, pero su coste de entrenamiento e inferencia es mucho menor.

## Limitaciones y advertencias

- El repositorio tiene 0,0 GB: no contiene pesos descargables, por lo que el adaptador no puede utilizarse tal cual desde Hugging Face sin que el autor los suba.
- Las leyendas del dataset son genericas (BLIP), lo que limita el control fino mediante prompts y puede producir resultados poco alineados con instrucciones especificas.
- El rango tematico es estrecho (primeros planos de anime); los prompts fuera de dominio derivan hacia personajes de anime no deseados.
- El KID se calcula sobre solo 20 imagenes, por lo que es una estimacion ruidosa y no debe interpretarse como una medida robusta de calidad.
- Se reportan 2/40 flags NSFW, lo que indica que el filtro de seguridad no es completamente efectivo; se recomienda supervision en cualquier uso publico.
- Las imagenes de entrenamiento proceden de narutopedia.com via `lambda/naruto-blip-captions`, sin licencia declarada, y los personajes de Naruto estan sujetos a copyright; el autor restringe el uso a investigacion y docencia no comercial.
- La licencia CreativeML OpenRAIL-M del modelo base impone restricciones de uso (prohibicion de usos daninos y obligacion de propagar la licencia), pero no resuelve el problema de derechos sobre las imagenes de entrenamiento.
- No hay informacion sobre sesgos demograficos, de representacion ni de estilo mas alla de la advertencia de deriva hacia anime.
- No se documentan cuantizaciones ni formatos alternativos, lo que limita el despliegue en entornos con restricciones de memoria muy estrictas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YashShevkar30/data266-lab2-naruto-lora_r8
- Modelo base Stable Diffusion 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambda/naruto-blip-captions
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentacion de diffusers para LoRA: https://huggingface.co/docs/diffusers/training/lora
