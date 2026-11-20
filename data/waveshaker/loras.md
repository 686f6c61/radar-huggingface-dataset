# waveshaker/loras

## Resumen

`waveshaker/loras` es una coleccion de adaptadores LoRA para generacion de imagenes por texto (text-to-image), publicada por el usuario waveshaker en Hugging Face. No se trata de un modelo fundacional, sino de un repositorio agregado que empaqueta multiples LoRAs de personaje, cada una entrenada sobre un modelo base distinto: Krea-2-Raw, Krea-2-Turbo, Moss Image, Flux.1-dev, Pony y SD1.5, entre otros citados en las etiquetas y en los ejemplos de la model card.

El repositorio resuelve un problema practico muy concreto para ilustradores, estudios pequenos y equipos de generacion visual: centralizar y distribuir LoRAs de personaje ya entrenadas, con disparadores (trigger words) documentados y compatibilidad declarada con varios backbones. Frente a la dispersion habitual de LoRAs en Civitai u otros agregadores, aqui se ofrece un unico punto de descarga con licencia MIT y espacios de demostracion en Hugging Face Spaces.

La relevancia actual viene de la convivencia de varios ecosistemas (Diffusers, ComfyUI, formatos int8 y bfloat16) y de la documentacion comparativa de herramientas de entrenamiento (OneTrainer, Fizgig, Fizgig-Advanced) que incluye el autor. El tamano del repositorio, 72 GB, refleja que contiene muchos adaptadores y previsualizaciones, no un unico modelo. No se dispone de datos sobre numero de parametros del backbone ni sobre la longitud de contexto, ya que en difusion no aplica el concepto de contexto textual de los LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos de difusion text-to-image (Krea-2-Raw, Krea-2-Turbo, Moss Image, Flux.1-dev, Pony, SD1.5) |
| Parametros totales | no disponible (depende del backbone; los LoRA son adaptadores de rango bajo, tipicamente r=16 en los presets documentados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusion) |
| Tipos de cuantizacion | pesos en bfloat16 (formato Diffusers sharded) e int8 (formato single-file de ComfyUI), segun la model card |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Diffusers (sharded, bfloat16) y ComfyUI single-file (int8) |
| Modelos base | krea/Krea-2-Raw, krea/Krea-2-Turbo, Moss Image, Flux.1-dev, Pony, SD1.5 |
| Tamano del repositorio | 72,0 GB |
| Descargas | 1.727 |
| Likes | 1 |

## Arquitectura y entrenamiento

Cada LoRA es un adaptador de bajo rango insertado en las capas de atencion y proyeccion de un modelo de difusion base. El repositorio no entrena un transformer desde cero: reutiliza backbones como Krea-2-Raw y Krea-2-Turbo (citados como `base_model`), Moss Image, Flux.1-dev, Pony y SD1.5, y sobre ellos aplica el ajuste de bajo rango. La model card detalla dos bloques de configuracion, uno para Moss Image y otro para Krea2, con hiperparametros concretos.

Para Moss Image, el autor documenta tres herramientas: OneTrainer (fork de Koratahiu, rama moss-image), Fizgig y Fizgig-Advanced (fork de Murf-Code). El conjunto de datos tipico es de 50 imagenes o mas, con medias de 100+, etiquetado mixto (tags tipo Booru como prefijo combinados con lenguaje natural) y 50+ repeticiones por imagen. En OneTrainer se usa atencion `torch CuDNN` en lugar de SDPA, resolucion de entrenamiento 512, LR entre 1,5e-04 y 2,5e-04 y batch de 3 a 4. En Fizgig se emplea el preset `Moss-Image Fast (rank 16, 0.25MP)`, tamano de imagen 0,26 MP (aprox. 512), LR 1e-04 y acumulacion de gradiente 3. En Fizgig-Advanced, mismo preset y tamano, con LR 1,5e-04 a 2,5e-04 y batch 3-4. El benchmark de velocidad con 39 imagenes, 0,26 MP y r16 arroja: OneTrainer 910 pasos a 1,12 s/it con batch 3 y LR 0,0003 (unos 0,37 s/imagen, 17 min 43 s); Fizgig 2730 pasos a 1,25 it/s con acumulacion 3 y LR 0,0001 (unos 0,83 s/imagen, 36 min 17 s); Fizgig-Advanced 910 pasos a 2,07 s/it con batch 3 y LR 0,0003 (unos 0,69 s/imagen, 31 min 20 s). OneTrainer uso formato Diffusers sharded en bfloat16 y Fizgig formato single-file int8 de ComfyUI.

La model card incluye ademas una discusion tecnica sobre el escalado del learning rate en LoRA, citando tres papers: la regla de escalado lineal de *Accurate, Large Minibatch SGD* (2017), la regla de raiz cuadrada de *One weird trick for parallelizing CNNs* (2014) y *Beware of the Batch Size* (2026), que sostiene que en LoRA el tamano de batch es un parametro de diseno de primer orden y que el LoRA vanilla iguala a variantes mas sofisticadas cuando el batch se ajusta correctamente. No se documentan datos de RLHF ni DPO, algo esperable en difusion.

## Capacidades

- Generacion de imagenes por texto (text-to-image) mediante LoRAs de personaje, con disparadores como `AthenaPalomino`, `yi_youyou`, `CHRISTIE FROM DEAD OR ALIVE` o `JuNail`.
- Compatibilidad declarada con varios backbones: Krea-2-Raw, Krea-2-Turbo, Moss Image, Flux.1-dev, Pony y SD1.5.
- Retratos y composiciones de personaje con control de encuadre, iluminacion y estilo mediante prompt (por ejemplo, retrato nocturno cinematografico con luces de neon y poca profundidad de campo).
- Estilos diferenciados por backbone: ilustracion anime vibrante en Anima, retrato editorial en Flux.1-dev, retrato con luz natural suave en Moss Image.
- Integracion en flujos Diffusers y ComfyUI, con pesos en bfloat16 o int8.
- No se documenta soporte de tool calling, agentes, vision de entrada, audio ni modo de razonamiento; son capacidades ajenas al proposito del repositorio.
- Capacidades multilingues: no disponibles; los prompts de ejemplo estan en ingles.

## Casos de uso

- Ilustracion de personajes recurrentes: un estudio puede fijar la identidad visual de un personaje con un LoRA concreto y reutilizarlo en portadas, capitulos o merchandising, manteniendo coherencia entre ilustradores.
- Prototipado rapido de concept art: con Krea-2-Turbo y pesos int8 en ComfyUI se pueden generar variantes en segundos para explorar direcciones visuales antes de encargar arte final.
- Creacion de avatares y retratos para comunidad: los disparadores documentados permiten generar retratos consistentes para perfiles, foros o videojuegos, ajustando estilo con el prompt.
- Produccion de material editorial: el LoRA `JuNail` sobre Flux.1-dev esta pensado para retrato editorial con fondo de estudio limpio, util en revistas, catalogo de moda o campanas.
- Ilustracion anime para videojuego o webtoon: el LoRA `CHRISTIE FROM DEAD OR ALIVE` sobre Anima produce ilustracion anime vibrante con control de peinado y expresion, adecuado para fichas de personaje.
- Integracion en pipelines de generacion por lotes: los formatos Diffusers sharded y single-file int8 permiten desplegar el LoRA en servicios de inferencia o en scripts de automatizacion que producen cientos de imagenes con el mismo estilo.
- Investigacion sobre entrenamiento de LoRA: la model card documenta hiperparametros, benchmarks de velocidad y referencias a papers sobre escalado de LR y batch, lo que sirve como base reproducible para experimentos propios.

## Benchmarks y rendimiento

La model card no publica metricas de calidad tipo FID, CLIP score ni evaluaciones humanas. Solo incluye un benchmark de velocidad de entrenamiento para Moss Image con 39 imagenes, 0,26 MP y rango 16:

| Herramienta | Pasos | Velocidad | Configuracion | Tiempo total | s/imagen |
|---|---|---|---|---|---|
| OneTrainer | 910 | 1,12 s/it | Batch 3, LR 0,0003, bfloat16 Diffusers | 17 min 43 s | ~0,37 |
| Fizgig | 2730 | 1,25 it/s | Grad. accum. 3, LR 0,0001, int8 ComfyUI | 36 min 17 s | ~0,83 |
| Fizgig-Advanced | 910 | 2,07 s/it | Batch 3, LR 0,0003, int8 ComfyUI | 31 min 20 s | ~0,69 |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explicita; depende del backbone. Para SD1.5 y Pony, 6-8 GB suelen bastar en cuantizacion; para Flux.1-dev y Krea-2, el rango habitual es 12-24 GB segun precision y optimizaciones.
- GPU recomendadas: no especificadas por el autor. Por el tipo de cargas, una RTX 4090 (24 GB) cubre Flux.1-dev y Krea-2 en bfloat16 con optimizaciones; A100 o H100 son adecuadas para lotes grandes o servicio multiusuario.
- Compatibilidad con GPU de consumo: probable en SD1.5 y Pony (GTX 1660, RTX 3060 en adelante); en Flux.1-dev y Krea-2 requiere al menos 12-16 GB o cuantizacion agresiva.
- Despliegue: Diffusers (formato sharded bfloat16), ComfyUI (single-file int8) y, por extension del ecosistema, Automatic1111 o Forge para SD1.5 y Pony. No se documenta soporte nativo de vLLM, TGI, llama.cpp ni Ollama, que no aplican a difusion.
- Latencia y throughput: no disponibles. El unico dato de velocidad es de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Repositorio | Tipo | Backbones | Formatos | Licencia | Descargas |
|---|---|---|---|---|---|
| waveshaker/loras | Coleccion de LoRAs de personaje | Krea-2-Raw, Krea-2-Turbo, Moss Image, Flux.1-dev, Pony, SD1.5 | Diffusers bfloat16, ComfyUI int8 | MIT | 1.727 |
| Civitai (LoRAs individuales) | LoRAs sueltos de personaje | Muy variable | Safetensors, a veces int8 | Variable por autor | No comparable |
| Hugging Face LoRAs de terceros | Adaptadores sueltos | Normalmente un unico backbone | Safetensors | Variable | Variable |

La comparativa cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada, porque no se han facilitado repositorios comparables con parametros, contexto o benchmarks.

## Limitaciones y advertencias

- Al ser una coleccion de LoRAs de personaje, la calidad depende del backbone elegido; el autor no publica evaluaciones objetivas de fidelidad ni de variedad.
- Riesgo de sobreajuste al conjunto de entrenamiento: con 50-100 imagenes y 50+ repeticiones por imagen, es probable que el LoRA reproduzca poses, fondos o iluminacion del dataset original.
- Sesgos: los datasets de personajes suelen estar sesgados hacia ciertos fenotipos, edades y esteticas; no se documenta ninguna mitigacion.
- Riesgo de alucinacion visual: en difusion se traduce en anatomia incorrecta, manos deformes o texto ilegible, especialmente en backbones pequenos como SD1.5.
- Idiomas: los prompts de ejemplo estan en ingles y no se declara soporte multilingue; prompts en castellano pueden degradar el resultado.
- Licencia MIT permite uso comercial, pero el usuario debe verificar las licencias de los backbones subyacentes (Krea-2, Flux.1-dev, Pony, SD1.5), que pueden imponer restricciones adicionales.
- El repositorio pesa 72 GB y contiene muchos adaptadores; conviene descargar solo los ficheros necesarios para evitar consumo de disco y ancho de banda.
- La model card incluye enlaces a Civitai con dominios alternativos (civitai.red) y referencias a modelos de contenido adulto; revisar el contexto antes de desplegar en entornos corporativos.
- No hay garantia de mantenimiento: el repositorio tiene 1 like y se actualizo por ultima vez en noviembre de 2026, con lo que la actividad de la comunidad es baja.
- Los benchmarks de velocidad de entrenamiento son de una unica configuracion y no deben extrapolarse a otros datasets o GPUs.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/waveshaker/loras
- Galeria de LoRAs (Space): https://huggingface.co/spaces/waveshaker/loras_gallery
- Universal Model Character LoRA Studio (Space): https://huggingface.co/spaces/waveshaker/universal-lora-studio
- Dataset Collections: https://huggingface.co/datasets/waveshaker/dataset_collections
- Loras Tools: https://huggingface.co/waveshaker/loras_tools
- OneTrainer (fork moss-image): https://github.com/Koratahiu/OneTrainer/tree/moss-image
- OneTrainer original: https://github.com/nerogar/OneTrainer
- Fizgig: https://github.com/shootthesound/Fizgig
- Fizgig-Advanced: https://github.com/Murf-Code/Fizgig-Advanced
- Paper escalado lineal de LR: https://arxiv.org/abs/1706.02677
- Paper regla de raiz cuadrada: https://arxiv.org/abs/1404.5997
- Paper *Beware of the Batch Size*: https://arxiv.org/abs/2602.09492
- MOSS Image SFT (int8): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
