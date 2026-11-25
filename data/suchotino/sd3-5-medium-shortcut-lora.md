# suchotino/sd3.5-medium-shortcut-lora

## Resumen

SD3.5 Medium shortcut LoRA es un adaptador LoRA de destilación (rango 64) más un embedder de tamaño de paso, entrenado por el usuario suchotino sobre el transformer congelado de Stable Diffusion 3.5 Medium. El resultado es un modelo de texto a imagen que genera imágenes de 1024x1024 en 1, 2, 4 u 8 pasos con una única pasada hacia delante por paso, eliminando la necesidad de classifier-free guidance en inferencia porque esta se destila en los pesos. La técnica subyacente es la de los shortcut models descrita en el paper de Frans et al. (ICLR 2025), que permite muestrear en muy pocos pasos manteniendo coherencia con la trayectoria del modelo profesor.

El modelo no es un modelo base autónomo: requiere cargar el transformer de `stabilityai/stable-diffusion-3.5-medium` y aplicar los pesos del adaptador mediante código propio del repositorio del autor, ya que el embedder de tamaño de paso no forma parte de diffusers. El repo ocupa 0,3 GB y contiene tres ficheros: los pesos LoRA en formato PEFT fp16, el embedder de tamaño de paso y un JSON de configuración.

Su relevancia práctica está en la latencia: en una H800, el denoising por imagen baja de 5,89 s (SD3.5 Medium, 40 pasos, 80 pasadas) a 0,34 s con 4 pasos y 4 pasadas, con una puntuación CLIP de 21,42 frente a 23,06 del profesor y un PickScore de 20,88 frente a 21,04. Es una alternativa de pocos pasos orientada a entornos donde el coste por imagen o la latencia interactiva son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching) de SD3.5 Medium con adaptador LoRA de rango 64 y embedder de tamano de paso (shortcut model) |
| Parametros totales | No disponible (el adaptador LoRA es de rango 64; el transformer base SD3.5 Medium no se detalla en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de texto a imagen; no se especifica longitud de prompt maxima) |
| Tipos de cuantizacion | No disponible (pesos LoRA en fp16; el modelo base se usa en bfloat16 segun el ejemplo de codigo) |
| Idiomas soportados | No disponible |
| Licencia | Stability AI Community License (derivado de SD3.5 Medium) |
| Formato de pesos | safetensors (LoRA en formato PEFT fp16, embedder de tamano de paso, configuracion JSON) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion de shortcut models aplicada a un transformer de difusion con flow matching. Sobre el transformer congelado de SD3.5 Medium se entrena un adaptador LoRA de rango 64 y un embedder que codifica el tamano de paso `d`, de modo que el modelo aprende a dar saltos de distinto tamano a lo largo de la trayectoria de generacion. El entrenamiento combina flow matching contra la velocidad guiada del profesor en `d = 0` con consistencia propia de shortcut sobre una rejilla de 32 pasos. El profesor genera las muestras con 40 pasos y CFG 4.5.

Los datos de entrenamiento son 7.907 imagenes generadas por SD3.5 Medium a partir de prompts disjuntos de PartiPrompts. La optimizacion usa AdamW con learning rate 1e-4, batch de 8, EMA 0.999 y 18.000 pasos sobre una unica H800, aproximadamente 18 horas de GPU. La innovacion principal es que la guia libre de clasificador queda destilada en los pesos, de modo que en inferencia no se duplican las pasadas para CFG: cada paso es una sola pasada hacia delante.

## Capacidades

- Generacion de imagenes de texto a imagen a 1024x1024 en 1, 2, 4 u 8 pasos, con una pasada por paso.
- Muestreo sin classifier-free guidance en inferencia (CFG destilada en los pesos).
- Calidad configurable segun el numero de pasos: mas pasos mejoran CLIP score y fidelidad al profesor.
- Compatibilidad con el pipeline `StableDiffusion3Pipeline` de diffusers para codificacion de prompt y decodificacion VAE, sustituyendo el bucle de denoising por `shortcut_sample`.
- No se documentan capacidades de edicion de imagen, inpainting, control estructural, tool calling ni agentes; es exclusivamente texto a imagen.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado interactivo de imagenes: con 4 pasos y 0,34 s de denoising por imagen en H800, permite iterar prompts en tiempo casi real en un cuaderno o interfaz web, ajustando el numero de pasos segun la calidad requerida.
- Generacion masiva por lotes: para pipelines que producen miles de imagenes, el modo de 1 paso (0,09 s por imagen) reduce el coste de computo aproximadamente 65 veces frente al profesor con 40 pasos, a costa de menor CLIP score (20,06 frente a 23,06).
- Aplicaciones de baja latencia en produccion: servicios donde el tiempo de respuesta es critico y no se puede asumir el coste de CFG duplicado; al estar la guia destilada, cada paso es una sola pasada.
- Generacion de bocetos y variaciones rapidas: usar 1 o 2 pasos para explorar composiciones y luego regenerar las seleccionadas con 8 pasos o con el modelo profesor para calidad final.
- Evaluacion e investigacion en destilacion: el repositorio del autor incluye el codigo de entrenamiento y muestreo, util para reproducir o extender la tecnica de shortcut models a otros transformers de difusion.
- Despliegue en infraestructura limitada: al requerir solo el transformer base mas un adaptador de 0,3 GB y reducir el numero de pasadas, baja el coste de GPU por imagen en entornos con presupuesto acotado.

## Benchmarks y rendimiento

Primeras 100 imagenes de PartiPrompts a 1024x1024, mismo ruido para todos los metodos; latencia es el tiempo de denoising por imagen en una H800.

| Metodo | Pasos | Pasadas | CLIP score | PickScore | CLIP-I al profesor | Latencia (s) |
|---|---:|---:|---:|---:|---:|---:|
| SD3.5 Medium, CFG 4.5 | 40 | 80 | 23,06 | 21,04 | 1,000 | 5,89 |
| SD3.5 Medium, CFG 4.5 | 4 | 8 | 21,12 | 20,07 | 0,701 | 0,56 |
| Este modelo | 1 | 1 | 20,06 | 20,31 | 0,686 | 0,09 |
| Este modelo | 2 | 2 | 20,75 | 20,70 | 0,765 | 0,17 |
| Este modelo | 4 | 4 | 21,42 | 20,88 | 0,792 | 0,34 |
| Este modelo | 8 | 8 | 21,92 | 20,98 | 0,815 | 0,69 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el ejemplo de codigo carga el transformer de SD3.5 Medium en bfloat16 en CUDA, lo que implica requisitos propios del modelo base (no cuantificado en la informacion proporcionada).
- GPU recomendadas: el autor reporta entrenamiento e inferencia en una H800; no se documentan pruebas en otras GPU.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo en la informacion disponible; dependeria de la VRAM necesaria para el transformer base en bfloat16 mas el VAE y los text encoders.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion); el uso previsto es mediante el codigo del repositorio `shortcut_distillation_sd3.5` sobre diffusers.
- Latencia y throughput: 0,09 s (1 paso), 0,17 s (2 pasos), 0,34 s (4 pasos) y 0,69 s (8 pasos) de denoising por imagen en una H800.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos tipicos | CFG en inferencia | CLIP score (PartiPrompts) | Latencia denoising (H800) | Licencia |
|---|---|---:|---|---:|---:|---|
| SD3.5 Medium (profesor) | Difusion base | 40 | Si (4.5) | 23,06 | 5,89 s | Stability AI Community |
| Este modelo (shortcut LoRA) | Destilado pocos pasos | 1-8 | No (destilada) | 20,06-21,92 | 0,09-0,69 s | Stability AI Community |
| Otras tecnicas de destilacion pocos pasos (p. ej. LCM, Turbo) | Destilados pocos pasos | 1-8 | No | No disponible | No disponible | Variable |

No se dispone en la informacion proporcionada de datos de benchmarks de alternativas de pocos pasos comparables (LCM, SDXL-Turbo, SD3.5 Turbo) para una comparacion numerica directa.

## Limitaciones y advertencias

- El texto no siempre se escribe correctamente con 4 pasos, segun el propio autor.
- Las escenas complejas pueden fusionar objetos.
- La fidelidad al profesor (CLIP-I) baja a 0,686-0,815 frente a 1,000 del modelo base, por lo que la calidad no iguala al profesor a 40 pasos.
- Requiere codigo externo: el embedder de tamano de paso no esta en diffusers, asi que no se puede cargar con el pipeline estandar sin el repositorio del autor.
- El modelo base SD3.5 Medium esta restringido (gated): hay que aceptar su licencia en Hugging Face antes de usarlo.
- Licencia Stability AI Community: impone condiciones para uso comercial (no se detallan en la informacion proporcionada); conviene revisar el texto completo antes de produccion.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser un modelo de imagen, el riesgo es de fidelidad semantica y de renderizado de texto, no de alucinacion factual.
- Idiomas soportados no disponibles; el comportamiento multilingue de los prompts no esta verificado.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/suchotino/sd3.5-medium-shortcut-lora
- Repositorio de codigo y entrenamiento: https://github.com/Suchotin/shortcut_distillation_sd3.5
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Licencia del modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium/blob/main/LICENSE.md
- Paper de shortcut models: https://arxiv.org/abs/2410.12557
