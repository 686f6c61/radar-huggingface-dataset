# Thengbeo/titi-vision

## Resumen

TiTi Vision es un repositorio independiente que aloja el modulo de vision del ecosistema TiTi, desarrollado por el usuario Thengbeo. Segun la model card, se trata de un componente de tipo ViT-B (Vision Transformer, variante base) con 85,65 millones de parametros, entrenado con el paradigma MAE (Masked Autoencoder) y con funcionalidad adicional de captioning (generacion de descripciones de imagenes). El repositorio se presenta explicitamente como un desgaje del modelo de lenguaje Thengbeo/titi-genesis, del que constituiria el "ojo" o modulo visual.

El interes tecnico del artefacto es limitado pero concreto: se publica como un paquete reproducible que incluye un script de entrenamiento (`vision/train_vision.py`) pensado para ejecutarse en Google Colab, con modos de entrenamiento por lotes y guardado periodico de checkpoints en el propio repositorio de Hugging Face. El tamano del repositorio es de 2,1 GB, coherente con pesos de un ViT-B mas datos de entrenamiento empaquetados.

La informacion publica es muy escasa: no se declara licencia, no se listan idiomas, no hay pipeline asignado, el modelo no registra descargas ni interacciones y la model card esta redactada en vietnamita. No se han publicado resultados de benchmarks ni una descripcion detallada del dataset de entrenamiento. Todo lo que sigue se basa exclusivamente en los datos disponibles en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer variante base (ViT-B) con entrenamiento MAE (Masked Autoencoder) y cabecera de captioning |
| Parametros totales | 85,65 millones (85.65M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision; no se especifica resolucion ni numero de parches) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en vietnamita; el captioning podria estar orientado a vietnamita, sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 2,1 GB; el script de entrenamiento sugiere checkpoints propios, formato no declarado) |

## Arquitectura y entrenamiento

El modelo se describe como un ViT-B, es decir, un transformer aplicado a parches de imagen con 85,65 millones de parametros, lo que coincide con el tamano tipico de la variante base de Vision Transformer. El paradigma de entrenamiento indicado es MAE (Masked Autoencoder), en el que se enmascara una fraccion alta de parches de la imagen y la red aprende a reconstruirlos, lo que produce representaciones visuales utiles para tareas posteriores. Sobre esa base se anade un modo "caption", segun el comando de entrenamiento documentado (`--mode caption`), lo que sugiere una cabecera de generacion de texto descriptivo a partir de la imagen.

El entrenamiento se plantea mediante un script incluido en el repositorio (`vision/train_vision.py`) que admite seleccion de variante de ViT (`--vit b`), apuntado a un dataset alojado en el propio Hub (`hf:Thengbeo/titi-vision/vision_data`), con ciclos de guardado de checkpoints cada cierto numero de minutos y publicacion en el repositorio remoto. No se especifica el numero de tokens o imagenes de entrenamiento, la composicion del dataset, la resolucion de entrada ni si hubo etapas de ajuste fino supervisado o preferencias. No hay informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, destilacion, etc.).

## Capacidades

- Extraccion de caracteristicas visuales mediante un ViT-B entrenado con MAE, util como encoder para tareas de vision posteriores.
- Reconstruccion de imagenes enmascaradas, capacidad implicita del objetivo MAE.
- Generacion de descripciones de imagenes (captioning), segun el modo de entrenamiento documentado; el idioma de salida no esta confirmado.
- Integracion como modulo visual de un sistema multimodal mayor (el ecosistema TiTi, con el modelo de lenguaje titi-genesis como "cerebro").
- Entrenamiento reproducible en Google Colab mediante el script incluido.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision avanzada, audio: no disponible.

## Casos de uso

- Preentrenamiento y ajuste de un encoder visual propio: el repositorio incluye el script `train_vision.py` con opciones de variante ViT y guardado periodico de checkpoints, lo que permite reentrenar o continuar el entrenamiento del MAE sobre un dataset propio alojado en el Hub.
- Generacion de descripciones automaticas de imagenes: el modo `caption` apunta a producir texto a partir de imagenes, aplicable a catalogacion de fotos, alt-text accesible o metadatos de archivos multimedia.
- Modulo visual de un pipeline multimodal: al estar disenado como "ojo" del ecosistema TiTi, encaja como encoder de imagen que alimente a un modelo de lenguaje (titi-genesis) para tareas de pregunta-respuesta sobre imagenes.
- Extraccion de embeddings para busqueda visual: un ViT-B MAE produce representaciones utiles para indexar y recuperar imagenes por similitud en un motor de busqueda interno.
- Clasificacion de imagenes con ajuste ligero: partiendo de los pesos MAE, se puede anadir una cabeza lineal y ajustar con pocas etiquetas para tareas de clasificacion especificas (control de calidad, moderacion de contenido).
- Reproduccion de experimentos en entornos con recursos limitados: el flujo documentado esta pensado para Colab, lo que facilita la validacion del entrenamiento en GPU consumer sin infraestructura dedicada.
- Prototipado educativo de arquitecturas ViT y MAE: el repositorio sirve como ejemplo practico de entrenamiento por lotes con checkpoints versionados en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un ViT-B de 85,65M parametros en precision FP32 ocupa aproximadamente 0,34 GB solo en pesos, y en FP16 alrededor de 0,17 GB; el consumo real depende de la resolucion de entrada y del tamano de lote, que no se especifican.
- GPU recomendadas: no disponible. El flujo de entrenamiento documentado esta pensado para Google Colab, lo que sugiere GPUs consumer tipo T4 o similares para el entrenamiento por lotes.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo, aunque no hay confirmacion oficial ni requisitos publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no directamente aplicables a un encoder visual). El propio repositorio incluye el script de entrenamiento en Python.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TiTi Vision | 85,65M | ViT-B MAE + captioning | no disponible | no disponible | Hugging Face (Thengbeo/titi-vision) |
| ViT-B/16 (Google) | 86M | ViT supervisado | 224x224 parches 16x16 | Apache 2.0 | Ampliamente disponible |
| MAE ViT-B (Meta) | 86M | ViT-B con MAE | 224x224 | CC BY-NC 4.0 (segun variante) | Disponible en repositorios de investigacion |
| CLIP ViT-B/32 (OpenAI) | 88M (vision) | ViT + texto contrastivo | 224x224 | MIT (variantes abiertas) | Ampliamente disponible |

La comparativa se ofrece como referencia de categoria (encoders visuales de ~85-90M parametros); no se dispone de datos de rendimiento de TiTi Vision que permitan una comparacion cuantitativa. Los datos de los modelos alternativos corresponden a sus especificaciones publicas habituales y deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Informacion extremadamente escasa: no hay licencia declarada, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier uso en produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en captioning, reconstruccion o extraccion de caracteristicas.
- Sin declaracion de idiomas: se desconoce en que lengua genera los captions y si soporta castellano.
- Sin documentacion del dataset de entrenamiento: se desconocen la composicion, el origen de las imagenes y los posibles sesgos demograficos, culturales o geograficos.
- Riesgo de alucinacion en captioning: como cualquier modelo generativo de descripciones, puede inventar objetos, atributos o relaciones no presentes en la imagen; no se ha medido su tasa de error.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Model card en vietnamita y sin pipeline asignado en el Hub, lo que dificulta el descubrimiento y la integracion automatica.
- Repositorio de 2,1 GB que incluye datos de entrenamiento ademas de pesos, con implicaciones de almacenamiento y de gestion de versiones.
- Sin garantias de mantenimiento: la fecha de actualizacion es muy reciente y no hay historial de versiones estables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Thengbeo/titi-vision
- Modelo de lenguaje asociado del ecosistema: https://huggingface.co/Thengbeo/titi-genesis
- Dataset de vision referenciado en el comando de entrenamiento: https://huggingface.co/Thengbeo/titi-vision/vision_data
- Script de entrenamiento incluido en el repositorio: vision/train_vision.py (ruta interna del repo)
- Paper original de Vision Transformer (referencia de arquitectura): https://arxiv.org/abs/2010.11929
- Paper original de Masked Autoencoders (referencia del paradigma de entrenamiento): https://arxiv.org/abs/2111.06377
