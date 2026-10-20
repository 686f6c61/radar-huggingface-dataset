# VAST-AI/EdenLive

## Resumen

EdenLive es un modelo de renderizado generativo en tiempo real desarrollado por VAST (Project Eden / VAST-AI-Research). Toma como entrada un flujo de vídeo de referencia o *proxy* (procedente de escenas 2D/3D, de un motor gráfico existente o de una grabación), un primer fotograma objetivo y un *prompt* de texto, y produce vídeo refinado o estilizado que mantiene la estructura y el movimiento de la referencia. El problema que resuelve es el de la renderización neural interactiva: en lugar de generar vídeo desde cero, el modelo actúa como un renderizador condicionado que respeta el estado de interacción que mantiene el código de la aplicación.

Técnicamente es un *diffusion transformer* (DiT) con control inyectado mediante un codificador visual DINOv3 post-entrenado: cada fotograma del *proxy* se embebe y esas características condicionan al transformer de difusión. Se distribuyen dos familias de pesos, 14B y 5B, cada una en variante bidireccional (offline) y en variante *few-step* con muestreo chunk-autorregresivo (4 pasos por chunk), pensada para el servicio en tiempo real. El modelo de 5B está declarado como desplegable en una sola GPU a 720P.

Su relevancia ahora es que acerca la generación de vídeo por difusión al régimen interactivo: la *project page* declara más de 24 FPS, generación a escala de minutos y salidas en 480P y 720P. El repositorio de pesos ocupa 290,4 GB (unos 210 GB tras la descarga del árbol `models/EdenLive`) y el paquete incluye text encoder UMT5, VAE de Wan2.1/Wan2.2, decoders TAEHV para el modo en tiempo real y un árbol Diffusers de FLUX con una LoRA `c2f` para el primer fotograma del *workbench*.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con control visual por vision encoder DINOv3 post-entrenado; variantes bidireccional y few-step con muestreo chunk-autorregresivo |
| Parametros totales | 14B (`dit-14b`, `dit-14b-bidir`) y 5B (`dit-5b`, `dit-5b-bidir`); el repositorio incluye ambas familias |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens; la generación opera por chunks con 4 pasos por chunk en modo few-step y admite secuencias a escala de minutos |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors/.pth sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (el text encoder es UMT5, pero la model card no lista idiomas) |
| Licencia | `edenlive-mixed`, con licencia distinta por componente (ver limitaciones) |
| Formato de pesos | safetensors (DiT, `projection.safetensors`), `.pth` (VAE Wan2.1/Wan2.2, decoders TAEHV LightTAE), árbol Diffusers para `flux-c2f` |
| Resolucion de salida | 480P y 720P (según perfil de inferencia) |
| Frecuencia declarada | más de 24 FPS en el servicio en tiempo real (dato de la project page, no verificado de forma independiente) |
| Tarea / pipeline | image-to-video (`diffusers:EdenLivePipeline`), en la práctica vídeo-a-vídeo condicionado por proxy + primer fotograma + texto |
| Tamano del repositorio | 290,4 GB en el Hub; ~210 GB el árbol `models/EdenLive` |

## Arquitectura y entrenamiento

EdenLive se construye sobre los modelos base Wan2.1 (I2V-14B) y Wan2.2 (TI2V-5B) y conserva su pila de difusión: VAE de Wan (`Wan2.1_VAE.pth` para 14B, `Wan2.2_VAE.pth` para 5B), text encoder UMT5 con su tokenizador y, solo en el caso 14B de image-to-video, un codificador CLIP (ViT-H/14 de LAION entrenado con OpenCLIP). La innovación central es el mecanismo de control: un encoder DINOv3 post-entrenado embebe cada fotograma del flujo *proxy* y las características resultantes se proyectan (`vision-encoder/projection.safetensors`) para condicionar al DiT, de modo que el modelo hereda la geometría, la cámara y el movimiento de la referencia en lugar de inventarlos.

Cada tamaño existe en dos variantes de inferencia. La bidireccional (`dit-*-bidir/`) usa el scheduler incluido en `scheduler-*/` y está pensada para generación offline de calidad. La variante *few-step* (`dit-14b/`, `dit-5b/`) aplica muestreo chunk-autorregresivo con 4 pasos por chunk, lo que permite el servicio en streaming; para la decodificación en tiempo real se sustituye el VAE por decoders TAEHV de LightTAE (`lighttaew2_1.pth` para 14B, `lighttaew2_2.pth` para 5B). El árbol `flux-c2f/` (FLUX.2 [klein] de Black Forest Labs más `c2f_lora.safetensors`) solo se usa en el *workbench* de primer fotograma del modo tiempo real.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF/DPO; para un modelo de difusión de vídeo estos datos no se publican en la model card. Tampoco se especifica el coste de entrenamiento ni el régimen de datos utilizado para el post-entrenamiento del encoder DINOv3.

## Capacidades

- Renderizado generativo condicionado: transforma un flujo de vídeo *proxy* (motor 3D, escena 2D, captura de cámara) en vídeo refinado o estilizado preservando estructura y movimiento.
- Control por primer fotograma objetivo más *prompt* de texto, lo que permite fijar la identidad visual y el estilo de la secuencia.
- Generación en tiempo real declarada por encima de 24 FPS, con soporte de secuencias de duración de minutos.
- Salidas en 480P y 720P según el perfil de inferencia elegido.
- Dos regímenes de calidad: inferencia bidireccional para offline y *few-step* chunk-autorregresivo para streaming interactivo.
- Integración con Diffusers mediante `EdenLivePipeline`, además de scripts de inferencia propios (`edenlive.scripts.infer`).
- Paralelismo de secuencia para el modelo 14B (`runtime.sequence_parallel.size`), lo que permite repartir la generación entre varias GPU.
- Servicio de tiempo real con configuración de despliegue propia (`realtime/deploy.conf`, variable `MODEL_ROOT`).
- No se documentan en la información disponible capacidades de *tool calling*, agentes, audio o razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- **Previsualización interactiva de escenas 3D en producción de animación**: el pipeline de render envía el *proxy* de baja fidelidad del DCC o del motor en tiempo real y EdenLive devuelve una versión estilizada a 720P por encima de 24 FPS, lo que permite validar iluminación y arte final sin esperar un render completo.
- **Estilización de vídeo de videojuegos en directo**: el motor mantiene el estado de interacción y entrega el búfer de color; el modelo aplica un estilo pictórico coherente entre fotogramas gracias al condicionamiento por DINOv3 sobre el flujo *proxy*, evitando el parpadeo típico de la estilización por imagen.
- **Remasterización y retoque de material de archivo**: se usa la grabación original como referencia y un primer fotograma restaurado como objetivo, de modo que el modelo rellena detalle y corrige color manteniendo la interpretación y el encuadre originales.
- **Generación de datos sintéticos para visión por computador y robótica**: a partir de un *proxy* renderizado con parámetros conocidos (cámara, profundidad, segmentación) se generan vídeos fotorrealistas con anotaciones geométricas exactas, útiles para aumentar datasets de entrenamiento.
- **Telepresencia y avatares volumétricos**: una captura de baja tasa o baja resolución se emplea como referencia y el modelo sintetiza un flujo continuo a 720P con apariencia estable, reduciendo el ancho de banda necesario en la transmisión.
- **Prototipado rápido de *looks* en publicidad y videoclip**: se prueban distintos estilos sobre el mismo *proxy* cambiando solo el *prompt* y el primer fotograma, sin rehacer el rodaje ni el render.
- **Doblaje y adaptación de plano a plano**: al conservar el movimiento de la referencia, el modelo permite regenerar un plano con otra estética o otro actor digital manteniendo la continuidad de acción con los planos vecinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card y la *project page* únicamente declaran prestaciones cualitativas: más de 24 FPS, generación a escala de minutos y salidas en 480P y 720P, además del despliegue en una sola GPU a 720P para el modelo de 5B. No hay tablas comparativas con métricas objetivas (FVD, VBench, CLIP-score, SSIM frente a la referencia) en el material proporcionado.

## Requisitos de hardware

- **Peso en disco**: ~210 GB para el árbol completo `models/EdenLive`; el repositorio del Hub ocupa 290,4 GB. Es necesario descargarlo previamente porque en ejecución no se accede al Hub.
- **VRAM estimada (cálculo a partir del número de parámetros, no dato oficial)**: el DiT de 5B en bf16/fp16 requiere del orden de 10 GB solo para pesos; el de 14B, del orden de 28 GB. A ello hay que sumar el text encoder UMT5, el VAE o el decoder TAEHV y las activaciones de vídeo, por lo que las cifras reales son superiores y no están publicadas.
- **Modelo 5B**: la model card indica explícitamente que soporta despliegue en una sola GPU a 720P. La inferencia *few-step* se lanza con un único proceso (`python -m edenlive.scripts.infer`), sin paralelismo.
- **Modelo 14B**: el ejemplo oficial de inferencia *few-step* a 480P usa dos procesos con `torchrun --nproc_per_node=2` y `runtime.sequence_parallel.size=2`. No se especifica una GPU mínima concreta; por tamaño de pesos, una GPU de 80 GB (A100/H100) o varias de 40-48 GB con paralelismo de secuencia son el escenario razonable.
- **GPU de consumo**: no hay confirmación oficial de que quepa en tarjetas de 24 GB (RTX 4090) o 16 GB. Por el tamaño del DiT de 5B más el resto de componentes, el modo 720P en una 4090 es plausible solo con estrategias de *offload* o cuantización, y el proyecto no publica pesos cuantizados. El 14B no cabe en una GPU de consumo.
- **Opciones de despliegue**: scripts propios `edenlive.scripts.infer` con ficheros de configuración (`wan21_14b_480p_bidir.yaml`, `wan21_14b_480p_few_step.yaml`, `wan22_5b_720p_bidir.yaml`, `wan22_5b_720p_few_step.yaml`), servicio de tiempo real con `realtime/deploy.conf` y `MODEL_ROOT`, e integración con Diffusers vía `EdenLivePipeline`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: el único dato disponible es la declaración de más de 24 FPS en el servicio en tiempo real; no hay cifras de latencia por chunk ni de throughput en offline, ni mediciones independientes del hardware empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdenLive (VAST) | 14B y 5B | Chunks few-step de 4 pasos; escala de minutos declarada | Difusión vídeo-a-vídeo con control DINOv3 sobre proxy y primer fotograma | `edenlive-mixed` (por componente) | Pesos en HuggingFace + código en GitHub |
| Wan2.1-I2V-14B (Alibaba) | 14B | no disponible en la informacion | Difusión image-to-video; base sobre la que se construye `dit-14b` | Apache 2.0 | Pesos públicos |
| Wan2.2-TI2V-5B (Alibaba) | 5B | no disponible en la informacion | Difusión texto+imagen a vídeo; base sobre la que se construye `dit-5b` | Apache 2.0 | Pesos públicos |
| FLUX.2 [klein] (Black Forest Labs) | no disponible | no disponible | Difusión de imagen, usada solo para el primer fotograma del workbench | no disponible en la informacion | Pesos públicos |

Frente a los modelos base de Wan, la diferencia no está en el tamaño sino en la capa de control: EdenLive añade el encoder de *proxy* y las variantes *few-step* que habilitan el uso interactivo. Conviene señalar que, al derivar de Wan2.1/Wan2.2, los pesos de `dit-*`, `vae-*`, `umt5/` y `scheduler-*` quedan bajo Apache 2.0, mientras que el resto de componentes del paquete tiene condiciones propias. La información disponible no permite comparar rendimiento numérico con alternativas de vídeo generativo en tiempo real.

## Limitaciones y advertencias

- **Licencia mixta y fragmentada**: el paquete se distribuye como `edenlive-mixed`. `dit-*`, `vae-*`, `umt5/` y `scheduler-*` son Apache 2.0 por derivación de Wan2.1/Wan2.2, y `decoder-*` es Apache 2.0 (LightTAE de lightx2v). Las condiciones de `clip/`, `vision-encoder/` y `flux-c2f/` no aparecen completas en la información disponible, por lo que es obligatorio revisar el fichero `LICENSE` antes de cualquier uso comercial.
- **Dependencia del *proxy***: el modelo no genera movimiento libre; hereda la estructura de la referencia. Si el *proxy* tiene oclusiones, errores de geometría o mala cobertura de cámara, esos defectos se propagan al resultado.
- **Coherencia temporal en secuencias largas**: el modo *few-step* es autorregresivo por chunks de 4 pasos, de modo que puede acumular *drift* de apariencia o color a lo largo de minutos; el modo bidireccional mitiga esto a costa de no ser interactivo.
- **Riesgo de alucinación visual**: al ser un modelo generativo, puede inventar detalles finos (texto, caras, manos, reflejos) inconsistentes con la referencia, especialmente en zonas de baja resolución o movimiento rápido.
- **Idiomas no documentados**: la model card no especifica qué lenguas entiende el text encoder UMT5 en este ajuste concreto, por lo que el comportamiento con *prompts* en castellano no está garantizado.
- **Sesgos**: no hay información sobre la composición del dataset ni sobre evaluaciones de sesgo; los modelos derivados de Wan pueden reproducir estereotipos presentes en datos web a gran escala.
- **Coste de despliegue elevado**: 210 GB de pesos y la necesidad de GPU de datacenter para el 14B limitan su uso a entornos con infraestructura dedicada; no hay pesos cuantizados publicados que abaraten el despliegue.
- **Madurez**: 119 descargas y 13 *likes* en el momento de la consulta, con repositorio creado en octubre de 2026 y última actualización ocho días después. El código de inferencia y el servicio en tiempo real viven en un repositorio separado, por lo que la API puede cambiar sin aviso.
- **Ausencia de benchmarks**: no se han publicado métricas objetivas que permitan validar las cifras de FPS y calidad declaradas de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VAST-AI/EdenLive
- Project page: https://vast-eden.ai/?p=edenlive
- Repositorio de código (inferencia y servicio en tiempo real): https://github.com/VAST-AI-Research/EdenLive
- Configuración de despliegue en tiempo real: https://github.com/VAST-AI-Research/EdenLive/blob/main/realtime/deploy.conf
- Organización VAST en HuggingFace: https://huggingface.co/VAST-AI
- VAST / Tripo: https://www.tripo3d.ai/
- Project Eden: https://vast-eden.ai/
- Wan2.1 / Wan2.2 (modelos base): https://github.com/Wan-Video
- Diffusers: https://github.com/huggingface/diffusers
- DINOv3: https://github.com/facebookresearch/dinov3
- FLUX.2 [klein] de Black Forest Labs: https://bfl.ai/models/flux-2-klein
- Decoders LightTAE (LightX2V): https://huggingface.co/lightx2v/Autoencoders
- CLIP ViT-H/14 de LAION: https://huggingface.co/laion/CLIP-ViT-H-14-laion2B-s32B-b79K
- OpenCLIP: https://github.com/mlfoundations/open_clip

Nota: la búsqueda web realizada no devolvió resultados pertinentes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
