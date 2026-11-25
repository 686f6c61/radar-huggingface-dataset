# taylor-geospatial/geo-eval-harness-models

## Resumen

`taylor-geospatial/geo-eval-harness-models` no es un modelo individual, sino un repositorio espejo (mirror) en Hugging Face que agrupa siete checkpoints de modelos fundacionales geoespaciales con licencias permisivas (MIT y Apache-2.0), destinados a la evaluacion reproducible dentro de la herramienta `geo-eval-harness`. El problema que resuelve es de disponibilidad: los pesos oficiales de estos modelos se distribuian originalmente en Google Drive o OneDrive, lo que dificulta la automatizacion, la verificacion de integridad y la reproducibilidad de experimentos. Este repositorio centraliza los checkpoints en un unico lugar con sumas SHA-256 verificadas y los ficheros de licencia originales.

Los modelos incluidos cubren varias familias de vision por computador aplicada a teledeteccion: GFM (Swin-B con preentrenamiento SimMIM sobre GeoPile), DINO-MC (ViT-S/8 y WRN-50-2 con aprendizaje contrastivo auto-supervisado sobre SeCo-100K), RVSA (ViTAE-B con MAE sobre MillionAID) y SenPa-MAE (tres variantes de un MAE sensible a parametros de sensor para preentrenamiento multi-satelite). Son todos modelos de vision (no generativos de texto) orientados a extraccion de representaciones y ajuste fino en tareas de observacion de la Tierra.

La relevancia actual radica en la consolidacion de la evaluacion de modelos fundacionales geoespaciales: al ofrecer checkpoints verificables y con licencia clara, facilita la comparacion justa entre arquitecturas y el uso en produccion sin depender de enlaces manuales. El repositorio ocupa 8,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiple: Swin-B (GFM), ViT-S/8 y WRN-50-2 (DINO-MC), ViTAE-B (RVSA), MAE base (SenPa-MAE) |
| Parametros totales | No disponible de forma agregada; por checkpoint: GFM ~1,44 GB de pesos, DINO-MC ViT-S/8 ~704 MB, DINO-MC WRN-50-2 ~1,48 GB, RVSA ViTAE-B ~459 MB, SenPa-MAE entre ~1,29 y ~1,52 GB |
| Parametros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | No aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible (checkpoints PyTorch en precision original) |
| Idiomas soportados | No disponible (modelos de vision; sin capacidades linguisticas) |
| Licencia | Mixta: Apache-2.0 (GFM) y MIT (DINO-MC, RVSA, SenPa-MAE); la ficha del repo indica `other` |
| Formato de pesos | PyTorch (`.pth`, `.pt`, `.bin`) |

## Arquitectura y entrenamiento

El repositorio aglutina arquitecturas dispares. GFM emplea un backbone Swin-B preentrenado con el objetivo SimMIM (enmascaramiento de imagenes) sobre el dataset GeoPile, mediante preentrenamiento continuo. DINO-MC aplica aprendizaje contrastivo auto-supervisado con recortes locales de multiples tamanos sobre SeCo-100K, en dos variantes: un ViT-S/8 y una red convolucional WRN-50-2. RVSA utiliza un ViTAE-B con preentrenamiento MAE sobre MillionAID, incorporando el mecanismo de atencion rotada (rotated varied-size attention) para manejar objetos de distinto tamano y orientacion. SenPa-MAE es un autoencoder enmascarado que incorpora parametros de sensor (embedding simple o doble) para el preentrenamiento multi-satelite.

No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada de los datasets ni sobre fases de RLHF o DPO (no aplicables a modelos de vision auto-supervisados). La innovacion tecnica principal del repositorio no esta en los modelos en si, sino en la infraestructura de evaluacion: checkpoints verificados con SHA-256 y licencias adjuntas para garantizar reproducibilidad.

## Capacidades

- Extraccion de representaciones visuales para imagenes de teledeteccion y observacion de la Tierra.
- Aprendizaje auto-supervisado y ajuste fino para tareas de clasificacion, segmentacion y deteccion sobre imagenes satelitales.
- Modelado de objetos de distinto tamano y orientacion (RVSA, atencion rotada).
- Incorporacion de metadatos de sensor en el preentrenamiento (SenPa-MAE, embeddings de parametros de sensor).
- Aprendizaje contrastivo multi-escala (DINO-MC, recortes de multiples tamanos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no son modelos de lenguaje).
- No dispone de capacidades multilingues ni de generacion de texto.
- No dispone de modo de razonamiento (thinking mode), vision-language ni audio.

## Casos de uso

- Evaluacion reproducible de modelos fundacionales geoespaciales: usar los checkpoints verificados con SHA-256 para comparar GFM, DINO-MC, RVSA y SenPa-MAE en un mismo benchmark sin depender de descargas manuales desde Google Drive u OneDrive.
- Clasificacion de cobertura del suelo: ajustar fino un backbone como GFM o RVSA sobre datasets etiquetados de uso del suelo para producir mapas tematicos a partir de imagenes satelitales.
- Segmentacion semantica de imagenes de observacion de la Tierra: emplear las representaciones de ViTAE-B (RVSA) o SenPa-MAE como extractor congelado y entrenar una cabeza de segmentacion ligera.
- Deteccion de cambios y objetos en escenas aereas: aprovechar la atencion rotada de RVSA para objetos con orientacion arbitraria en imagenes de alta resolucion.
- Preentrenamiento multi-satelite: usar SenPa-MAE con embeddings de parametros de sensor para adaptar el modelo a distintos sensores (Sentinel, Landsat, etc.) y reducir el coste de ajuste por sensor.
- Investigacion en auto-supervision: emplear DINO-MC (ViT-S/8 y WRN-50-2) como linea base contrastiva para experimentos de aprendizaje auto-supervisado en teledeteccion con SeCo-100K.
- Integracion en pipelines de CI/CD de evaluacion: automatizar la descarga y verificacion de integridad de checkpoints dentro de `geo-eval-harness` para tests de regresion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia, los checkpoints oscilan entre ~459 MB (RVSA ViTAE-B) y ~1,52 GB (SenPa-MAE doble embedding), lo que sugiere requisitos moderados de memoria, aunque el consumo real depende del tamano de entrada y del batch.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano de pesos, GPUs de consumo como RTX 3090 o RTX 4090 deberian poder alojar cualquiera de los checkpoints individuales en memoria.
- Cabe en GPU de consumo: probablemente si para cada checkpoint individual, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: no se especifican; al ser checkpoints PyTorch (`.pth`, `.pt`, `.bin`), el despliegue se realizaria mediante PyTorch nativo o frameworks de vision, no mediante vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros / tamano de pesos | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| GFM (Swin-B) | ~1,44 GB de pesos | Imagenes (teledeteccion) | Apache-2.0 | Mirror en este repo; original en torchgeo/gfm |
| DINO-MC (ViT-S/8) | ~704 MB | Imagenes (teledeteccion) | MIT | Mirror en este repo; original en Google Drive |
| RVSA (ViTAE-B) | ~459 MB | Imagenes (teledeteccion) | MIT | Mirror en este repo; original en MVRL/rvsa_vitae_b |
| SenPa-MAE (BaseMAE) | ~1,29 GB | Imagenes multi-satelite | MIT | Mirror en este repo; original en Google Drive |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo de terceros, no el desarrollo original; la responsabilidad de mantenimiento y actualizacion recae en el autor del mirror.
- La licencia del repositorio figura como `other` a nivel de ficha, aunque cada checkpoint conserva su licencia original (MIT o Apache-2.0); es imprescindible revisar el fichero `LICENSE` de cada directorio antes de uso comercial.
- No son modelos de lenguaje: no generan texto, no soportan tool calling ni razonamiento multi-paso.
- No se documentan sesgos conocidos ni tasas de alucinacion (no aplicable a modelos de vision, pero si existen sesgos en los datos de entrenamiento geoespacial que no se detallan).
- No se especifican los idiomas ni la cobertura geografica de los datasets de entrenamiento (GeoPile, SeCo-100K, MillionAID), lo que limita la evaluacion de sesgos regionales.
- El checkpoint ViT-B de RVSA no esta incluido: el enlace original de OneDrive devolvio HTTP 403 y no se espejo.
- No se proporcionan resultados de benchmarks, por lo que no es posible verificar el rendimiento de forma independiente a partir de esta informacion.
- Algunos checkpoints se rehostearon desde mirrors intermedios (torchgeo/gfm, MVRL/rvsa_vitae_b), lo que anade una capa de procedencia a verificar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taylor-geospatial/geo-eval-harness-models
- GFM (upstream): https://github.com/mmendiet/GFM
- GFM (mirror en HF): https://huggingface.co/torchgeo/gfm
- DINO-MC (upstream): https://github.com/WennyXY/DINO-MC
- DINO-MC (paper arXiv): https://arxiv.org/abs/2303.06670
- RVSA (upstream): https://github.com/ViTAE-Transformer/Remote-Sensing-RVSA
- RVSA (mirror en HF): https://huggingface.co/MVRL/rvsa_vitae_b
- SenPa-MAE (upstream): https://github.com/JonathanPrexl/SenPa-MAE
- SenPa-MAE (paper arXiv): https://arxiv.org/abs/2408.11000
