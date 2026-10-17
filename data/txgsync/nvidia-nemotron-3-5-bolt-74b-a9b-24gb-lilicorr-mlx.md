# txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-MLX

## Resumen

Este repositorio es una conversión no oficial a MLX del modelo NVIDIA Nemotron 3.5 Bolt 74B-A9B 24GB, publicada por el usuario `txgsync`, que añade el drafter LiLiCorr de NVIDIA para decodificación especulativa sobre Apple Silicon. No se trata de un modelo nuevo: los pesos son byte a byte idénticos a los de `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB` y, en la carpeta `dflash/`, a los de `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr`. Lo que aporta el repositorio son los ficheros de modelo en formato MLX para poder ejecutar Bolt con visión y decodificación especulativa en un Mac con chip de Apple a través de oMLX.

El modelo subyacente es un Mixture-of-Experts híbrido Mamba-2 + Transformer (arquitectura LatentMoE) desarrollado por NVIDIA, derivado de Nemotron 3.5 Super VL mediante el método de compresión Star Elastic, con 74B de parámetros totales y aproximadamente 9B activados por token. Incluye codificador visual C-RADIO v4-H y está pensado para ejecutar tareas agénticas y de razonamiento multimodal en local sobre hardware de 24 GB de memoria, bien sea GPU RTX/DGX Spark (ruta CUDA original) o memoria unificada de Apple Silicon (esta conversión).

Su relevancia práctica es doble: por un lado demuestra que un MoE de 74B puede caber y ser útil en un equipo de sobremesa; por otro, este fork concreto mide aceleraciones de hasta 2,1x en generación de código gracias al drafter LiLiCorr (7 tokens propuestos por paso, verificados en una sola pasada). Es un modelo recién publicado (16 de octubre de 2026) sin descargas ni interacciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Transformer con LatentMoE (mixture of experts latente); codificador visual C-RADIO v4-H |
| Parametros totales | 74B según el nombre del modelo y la documentación de NVIDIA; 22.641.027.080 (~22,6B) según el recuento real de los tensores safetensors de este repositorio cuantizado |
| Parametros activos | ~9B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos MLX de 8 bits (tag `8-bit`); el drafter en `dflash/` se ejecuta desde tensores NVFP4; los tags del repositorio mencionan también iq2_xxs |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (etiquetada como `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors sobre MLX, con código Python personalizado (`custom_code`, `nemotron_bolt.py`, `dflash/lilicorr_draft.py`) |
| Tamano del repositorio | 25,1 GB |
| Modalidad de entrada | image-text-to-text (texto e imagen; sin audio) |
| Modelos base | nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB y nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr |
| Fecha de publicacion | 16 de octubre de 2026 |

Nota sobre el recuento de parámetros: el nombre del modelo indica 74B totales y ~9B activos, coherente con la ficha de NVIDIA, mientras que la suma de tensores del repositorio da 22,6B. La diferencia es atribuible al formato cuantizado del checkpoint de 24 GB (los pesos almacenados no equivalen a un parámetro por valor de 16 bits). Se recomienda tratar 74B/9B como la cifra arquitectónica de referencia.

## Arquitectura y entrenamiento

Nemotron 3.5 Bolt emplea una arquitectura híbrida que combina capas Mamba-2 (modelo de espacio de estados) con capas Transformer tradicionales, sobre un esquema LatentMoE: en lugar de enrutar cada token a expertos en el espacio de activaciones completo, el enrutamiento se hace en un espacio latente comprimido, lo que reduce el coste de memoria y de ancho de banda asociado al MoE. De los 74B de parámetros totales solo se activan ~9B por token, lo que explica que el checkpoint pueda caber en 24 GB. La parte visual corre a cargo de un codificador C-RADIO v4-H, lo que habilita el pipeline `image-text-to-text`. Según la documentación de NVIDIA, el modelo se obtuvo comprimiendo Nemotron 3.5 Super VL mediante Star Elastic.

El repositorio que nos ocupa no reentrena ni recalibra nada: es un envoltorio MLX. Los pesos principales son idénticos a los de NVIDIA y el drafter (`dflash/`) reproduce el mecanismo DFlash con reranker LiLiCorr desde sus tensores NVFP4. El drafter propone 7 tokens por paso y el modelo objetivo los verifica en una única pasada, conservando únicamente los correctos. El autor advierte de que los borradores no alteran qué token selecciona Bolt, pero la pasada de verificación redondea de forma distinta a la decodificación de un token, por lo que una salida greedy larga puede diferir ligeramente respecto a una ejecución sin drafter. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en los materiales proporcionados. Existe una referencia a un arXiv (`arxiv:2608.20530`) entre los tags del repositorio, cuyo contenido no se ha podido verificar aquí.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento explícito activable mediante `"chat_template_kwargs": {"enable_thinking": true}`; el razonamiento se devuelve en el campo `reasoning_content`.
- Comprensión visual: acepta imágenes en formato OpenAI (`image_url` como content parts) gracias al codificador C-RADIO v4-H.
- Flujos agénticos y de multi-step reasoning, según la ficha de NVIDIA el modelo objetivo está orientado a agentes autónomos locales.
- Recuperación aumentada (RAG) y chat multi-turno conversacional.
- Generación de código, con la mayor ganancia medida de decodificación especulativa (118 a 128 tokens/s frente a 59-60 sin drafter en M4 Max).
- Multilingüe en inglés, español, francés, alemán, italiano y japonés.
- Decodificación especulativa con DFlash + LiLiCorr, disponible únicamente a través de oMLX.
- Sin soporte de audio: el checkpoint no incluye codificador de sonido (`sound_config` es nulo).
- El repositorio en sí no documenta soporte explícito de tool calling o function calling; no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local para un desarrollador individual: con 118-128 tokens/s en generación de código sobre un M4 Max, el modelo es viable para autocompletado y reescritura de bloques en un IDE sin enviar código a la nube, algo relevante en entornos con requisitos de confidencialidad.
- Agente autónomo de escritorio: la combinación de razonamiento con `enable_thinking`, contexto conversacional y ejecución local sobre 24 GB encaja con agentes que encadenan varios pasos sobre ficheros o servicios internos sin depender de API externas.
- Análisis de documentación técnica con imágenes: al aceptar entradas `image_url`, puede extraer información de capturas de paneles, diagramas de arquitectura o esquemas y resumirlos junto al texto adjunto.
- RAG sobre base documental corporativa en inglés o español: el modelo soporta recuperación aumentada según NVIDIA, y su naturaleza local permite indexar documentación sensible sin salir de la infraestructura propia.
- Traducción y localización entre los seis idiomas soportados (en, es, fr, de, it, ja), con especial utilidad para equipos que trabajan con documentación multilingüe.
- Generación de documentación estructurada y listas: es el segundo escenario con mayor aceleración medida (89-104 tokens/s con drafter), lo que lo hace apto para producir changelogs, tablas y esquemas repetitivos a gran volumen.
- Prototipado e investigación sobre decodificación especulativa: el repositorio sirve como banco de pruebas reproducible para medir el efecto de un drafter DFlash+LiLiCorr sobre un MoE híbrido Mamba-Transformer en MLX.
- Servicio de chat en un equipo de trabajo pequeño: con 30,4 GB de memoria tras la carga y decodificación de una sola secuencia, es adecuado para uso personal o de baja concurrencia, no para servir a muchos usuarios simultáneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente incluye mediciones de velocidad de decodificación, no de calidad.

Rendimiento medido por el autor en un M4 Max (128 GB), oMLX 0.7.1rc1, MLX 0.32.4, temperatura 0, en caliente:

| Tipo de salida | Sin drafter (tokens/s) | Con drafter (tokens/s) |
|---|---|---|
| Codigo | 59 a 60 | 118 a 128 |
| Listas y texto estructurado | 59 a 60 | 89 a 104 |
| Prosa | 59 a 60 | 53 a 58 |

Memoria tras la carga: 30,4 GB (24,3 GB para Bolt y el resto para el drafter y sus búferes). El procesamiento de prompt es el mismo con y sin drafter. A temperatura superior a 0 la aceleración se reduce (unos 90 tokens/s en código).

## Requisitos de hardware

- Memoria unificada: 30,4 GB tras la carga del modelo, drafter y búferes; se recomienda un Mac con al menos 48 GB y, preferiblemente, 64 GB o más para dejar margen al sistema y al contexto.
- Hardware de referencia medido: Apple Silicon M4 Max con 128 GB de memoria unificada. No hay mediciones publicadas para otros chips en la información disponible.
- Este repositorio es exclusivamente MLX, por lo que requiere Apple Silicon; no es desplegable en GPU CUDA. La ruta CUDA del modelo original apunta a RTX y DGX Spark con 24 GB de VRAM.
- Opciones de despliegue: oMLX 0.7.1rc1 o posterior (con Trust Remote Code y DFlash habilitados, y el campo de modelo borrador vacío para que use `dflash/`); mlx-vlm funciona pero sin decodificación especulativa, para lo cual hay que usar el repositorio hermano sin drafter.
- Throughput estimado: 118-128 tokens/s en código, 89-104 en listas y texto estructurado, 53-58 en prosa, siempre en el M4 Max de referencia y a temperatura 0.
- Limitación de concurrencia: la decodificación especulativa de oMLX procesa una única secuencia a la vez.
- No se dispone de estimaciones de latencia de prefill ni de VRAM para cuantizaciones alternativas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Decodificacion especulativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-MLX (este) | 74B / ~9B | no disponible | Si, DFlash + LiLiCorr, solo en oMLX | OpenMDW-1.1 | Repositorio MLX de 25,1 GB, 0 descargas en el momento de la ficha |
| txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-MLX | 74B / ~9B | no disponible | No | OpenMDW-1.1 | MLX, mismo modelo sin drafter; compatible con mlx-vlm |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB | 74B / ~9B | no disponible | No (es el objetivo a verificar) | OpenMDW-1.1 | Checkpoint oficial de NVIDIA orientado a RTX/DGX Spark de 24 GB |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr | no aplica (solo drafter) | no disponible | Es el drafter | OpenMDW-1.1 | No es un modelo autónomo; propone borradores que el objetivo verifica |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B | 30B / ~3B | no disponible | no disponible | no disponible | Existen conversiones MLX de terceros; datos de rendimiento no disponibles |

No se han encontrado en la información proporcionada resultados de benchmarks comparativos entre estas variantes, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un repositorio no oficial: el autor indica explícitamente que no es de NVIDIA. Los pesos son idénticos a los originales, pero el código de carga y el empaquetado MLX son de terceros.
- Requiere activar Trust Remote Code; los ficheros del modelo se ejecutan dentro del proceso del servidor, lo que implica ejecutar código no auditado por NVIDIA. Es un riesgo de seguridad relevante en producción.
- La decodificación especulativa solo funciona en oMLX y procesa una única secuencia a la vez; no sirve para escenarios de alta concurrencia.
- En prosa no hay aceleración e incluso puede haber una ligera pérdida de velocidad (53-58 tokens/s frente a 59-60). El sistema deja de proponer borradores cuando la tasa de aceptación baja.
- A temperatura mayor que 0 la aceleración disminuye (aproximadamente 90 tokens/s en código), por lo que el beneficio se concentra en decodificación greedy.
- Las salidas greedy largas pueden diferir ligeramente de las de una ejecución sin drafter, porque la pasada de verificación redondea de forma distinta a la decodificación token a token.
- Sin soporte de audio: `sound_config` es nulo.
- Licencia OpenMDW-1.1, etiquetada como `other` en HuggingFace. Según NVIDIA, el modelo es apto para uso comercial y no comercial, pero conviene revisar los términos del texto completo antes de un despliegue productivo; el uso de los modelos se rige por la licencia de NVIDIA, no por el repositorio de terceros.
- Riesgo de alucinación: no disponible en la información proporcionada; al ser un modelo de razonamiento y uso agéntico, debe asumirse la necesidad de verificación de salidas en aplicaciones críticas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Longitud de contexto: no disponible; este dato es imprescindible antes de diseñar aplicaciones con ventanas largas.
- Idioma: aunque se declaran seis idiomas, no hay evaluación publicada de calidad relativa entre ellos; el inglés es presumiblemente el mejor soportado.
- Confusión posible en el recuento de parámetros (74B nominales frente a 22,6B en los safetensors del repositorio); conviene verificar el consumo real de memoria antes de planificar el despliegue.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-MLX
- Repositorio hermano sin drafter: https://huggingface.co/txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-MLX
- Modelo base oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Checkpoint del drafter LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Pagina de investigacion de NVIDIA: https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-24GB/
- Referencia arXiv incluida en los tags: https://arxiv.org/abs/2608.20530
- oMLX: https://github.com/jundot/omlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- DFlash: https://github.com/z-lab/dflash
- NVIDIA Model-Optimizer: https://github.com/NVIDIA/Model-Optimizer
- SpecForge: https://github.com/sgl-project/SpecForge
- Ficha en SourceForge: https://sourceforge.net/projects/nemotron-3-5-bolt-74b-a9b/
- Guia divulgativa de terceros: https://toolpilotpro.com/nvidia-nemotron-3-5-bolt-guide
- Conversion MLX de Nemotron 3.5 Lightning 30B-A3B: https://huggingface.co/txgsync/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-mtp
- Otra conversion de Nemotron 3.5 Lightning 30B-A3B en MLX: https://huggingface.co/user3892r4/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-mlx-oQ8e
