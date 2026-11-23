# TolyaGosuslugi/yui-image

## Resumen

yui-image es un modelo de generacion de imagenes publicado en Hugging Face por el usuario TolyaGosuslugi. Se distribuye como un pipeline de la libreria `diffusers` y esta entrenado desde cero sobre un dataset propio de imagenes denominado `yui_dataset`, a una resolucion de 256x256 pixeles. El modelo se compone de una UNet2D condicionada por un VAE ligero (TAESD) que comprime las imagenes a un espacio latente de 4 canales y 32x32, sobre el que se aplica un proceso de difusion DDPM con muestreo DDIM.

Se trata de un modelo de nicho y de escala muy reducida: la UNet declarada en el codigo de entrenamiento usa bloques de 64, 128, 256 y 256 canales con dos capas por bloque, lo que situa el numero de parametros en el orden de decenas de millones, muy por debajo de los modelos de difusion de proposito general. No dispone de text encoder ni de mecanismo de condicionamiento por prompt, por lo que genera imagenes incondicionalmente a partir de ruido, sin control textual.

Su relevancia es limitada y de caracter experimental: sirve como ejemplo didactico de un pipeline de difusion latente completo (entrenamiento, EMA, scheduler, decodificacion con TAESD) y como modelo especializado en un dominio visual concreto y acotado. No esta pensado para competicion con modelos como Stable Diffusion o Flux, sino para reproducir un estilo o conjunto de imagenes especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet2D de difusion latente (DDPM) con VAE TAESD |
| Parametros totales | no disponible (la UNet usa bloques 64/128/256/256 con 2 capas por bloque; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (generacion de imagen sin condicionamiento textual) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de difusion latente: un autoencoder TAESD (`madebyollin/taesd`) comprime imagenes RGB de 256x256 a latentes de 4x32x32, que se normalizan por media y desviacion tipica calculadas sobre el dataset. Sobre esos latentes se entrena una `UNet2DModel` con `sample_size=32`, `in_channels=4`, `out_channels=4`, `layers_per_block=2` y `block_out_channels=(64, 128, 256, 256)`, con bloques de atencion en las dos etapas intermedias. El scheduler de entrenamiento es un `DDPMScheduler` con 1000 pasos, `beta_start=0.00085`, `beta_end=0.012`, `beta_schedule="scaled_linear"` y recorte de muestras en el rango [-4, 4].

El entrenamiento usa AdamW con learning rate 2e-4, batch de 8, 1000 epocas y clipping de gradiente a 1.0, con un `EMAModel` de decay 0.999 y warmup. La perdida es MSE entre el ruido predicho y el ruido anadido. Para inferencia se emplea un `DDIMScheduler` con `timestep_spacing="trailing"` y 100 pasos por defecto en el codigo de ejemplo. No se documenta el tamano del dataset, el numero de imagenes, la composicion ni si hubo filtrado o aumento de datos. Tampoco se indica el uso de RLHF, DPO ni preferencias humanas, algo coherente con un modelo de difusion incondicional. La model card menciona que el codigo fue generado con asistencia de "Gemini 4 Hydrogen", un detalle que sugiere un desarrollo rapido y de caracter personal.

## Capacidades

- Generacion de imagenes incondicional a 256x256 pixeles, sin prompt de texto.
- Especializacion en un dominio visual concreto (el contenido de `yui_dataset`, no descrito por el autor).
- Muestreo rapido mediante DDIM con 100 pasos por defecto, ajustable.
- Integracion nativa con la libreria `diffusers` (UNet, scheduler y configuracion de latentes guardados por separado).
- No soporta tool calling, function calling ni agentes.
- No soporta razonamiento multi-paso ni modos de pensamiento.
- No tiene capacidades multilingues ni procesamiento de texto.
- No soporta vision de entrada ni audio; solo sintesis de imagen.

## Casos de uso

- Generacion de assets graficos de estilo fijo: el modelo produce variaciones de un dominio visual concreto, util para prototipado rapido de ilustraciones o sprites coherentes con el dataset de entrenamiento.
- Experimentacion docente con difusion latente: su codigo de entrenamiento completo y su tamano reducido permiten reproducir el pipeline en una sola GPU consumer para estudiar DDPM, EMA y decodificacion TAESD.
- Aumento de datos sinteticos: generar muestras adicionales del dominio para entrenar clasificadores o detectores cuando el dataset original es escaso.
- Pruebas de integracion con `diffusers`: validar pipelines de inferencia, schedulers y serializacion de latentes en entornos de CI antes de migrar a modelos mayores.
- Generacion de miniaturas o placeholders: por su resolucion de 256x256 y su bajo coste, encaja en la produccion de imagenes de relleno en interfaces y maquetas.
- Investigacion sobre sobreajuste y memorizacion: al entrenarse sobre un dataset pequeno y concreto, es un banco de pruebas para medir hasta que punto un modelo de difusion reproduce las imagenes de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para la UNet y el VAE TAESD, dado el reducido numero de canales y la resolucion latente de 32x32. No hay medicion oficial publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el codigo de entrenamiento usa `cuda` si esta disponible y funciona tambien en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `diffusers` con PyTorch es la via documentada; no se proporcionan pesos GGUF ni integracion con llama.cpp u Ollama (no aplica a difusion). vLLM y TGI no soportan este tipo de modelo.
- Latencia y throughput: no disponibles. Con 100 pasos DDIM y una UNet de decenas de millones de parametros, la generacion por imagen deberia ser del orden de segundos en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yui-image | no disponible (UNet 64/128/256/256) | 256x256 | ninguno (incondicional) | MIT | Hugging Face (diffusers) |
| Stable Diffusion 1.5 | ~860 M (UNet) | 512x512 | texto (CLIP) | CreativeML OpenRAIL-M | Hugging Face, amplio ecosistema |
| Tiny-SD / TAESD-based | ~1-10 M | 256-512 | texto o incondicional | segun variante | Hugging Face |
| DDPM CIFAR-10 (referencia) | ~35 M | 32x32 | clase | MIT/varias | Papers with code |

La comparacion es orientativa: yui-image no compite en calidad ni versatilidad con modelos condicionados por texto, y su interes es experimental y de dominio acotado. No se dispone de metricas FID, IS ni CLIP score para situarlo cuantitativamente frente a estas alternativas.

## Limitaciones y advertencias

- Modelo incondicional: no acepta prompts de texto, por lo que no se puede dirigir la generacion mas alla del sesgo del dataset de entrenamiento.
- Resolucion fija de 256x256; no esta entrenado para otras resoluciones y produciria artefactos fuera de ese rango.
- Dataset de entrenamiento no documentado: se desconoce su tamano, composicion, procedencia y posibles sesgos, lo que impide evaluar riesgos de memorizacion o de reproduccion de contenido protegido.
- Riesgo de sobreajuste alto dado el entrenamiento de 1000 epocas sobre un dataset presumiblemente pequeno; puede replicar imagenes de entrenamiento.
- Calidad esperable baja frente a modelos de difusion modernos: sin text encoder, sin classifier-free guidance y con una UNet de capacidad reducida.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre los derechos de las imagenes de entrenamiento ni sobre el contenido generado.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentacion adicional.
- La model card incluye una referencia a generacion asistida por IA ("vibe-coded"), lo que reduce la fiabilidad de la documentacion tecnica.
- No apto para produccion en casos que requieran control semantico, alta resolucion o diversidad de estilos.

## Enlaces

- Hugging Face: https://huggingface.co/TolyaGosuslugi/yui-image
- VAE TAESD utilizado: https://huggingface.co/madebyollin/taesd
- Libreria diffusers: https://github.com/huggingface/diffusers
- Imagen de preview: https://cdn-uploads.huggingface.co/production/uploads/6ad277c92462007fa6b1f5e0/-BiUfaBo6oyV1VJjLcJnr.png
