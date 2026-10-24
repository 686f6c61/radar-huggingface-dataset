# wherobots/olmoearth-v1_3-base-pt2

# OlmoEarth v1.3 base, checkpoint pt2 (Wherobots)

## Resumen

`wherobots/olmoearth-v1_3-base-pt2` es una republicacion del checkpoint base de OlmoEarth v1.3, un modelo fundacional multimodal y espaciotemporal para observacion de la Tierra desarrollado por Ai2 (Allen Institute for AI) y redistribuido aqui por Wherobots. No es un modelo de lenguaje: su funcion es convertir parches de imagenes de satelite en representaciones vectoriales (embeddings) reutilizables en tareas geoespaciales como clasificacion de cobertura del suelo, segmentacion, deteccion de cambios o busqueda por similitud.

El modelo trabaja sobre composites anuales de Sentinel-2 (`s2med_annual`) con doce bandas (B01, B02, B03, B04, B05, B06, B07, B08, B08A, B09, B11 y B12), procesa parches de 16 pixeles (`patch_size: 16`) y no aplica recorte temporal (`clip_size: 0`). La model card publicada por Wherobots es practicamente un volcado de configuracion: no incluye descripcion, datos de entrenamiento ni evaluaciones, y el repositorio ocupa 0,5 GB.

Su relevancia radica en que acerca a un publico amplio un modelo de embeddings SAT (state-of-the-art, segun Ai2) con pesos abiertos y datos globales precalculados, pensado para integrarse en flujos de teledeteccion existentes (rslearn, procesamiento distribuido con Wherobots/Apache Sedona) sin reentrenar desde cero: se congela el encoder y se ajusta una cabeza ligera para la tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal y espaciotemporal para observacion de la Tierra (detalle de capas no disponible) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica en el sentido de LLM; ventana espaciotemporal definida por el usuario, con parches de 16 px y `clip_size: 0` |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | `olmoearth-artifact-license` (campo `license: other`, con enlace a la licencia del repo de Ai2) |
| Formato de pesos | no disponible en la informacion (repositorio de 0,5 GB; no se confirma safetensors, `.pt` ni otro formato) |
| Modalidad de entrada | imagen satelital multiespectral, composite anual Sentinel-2 (`s2med_annual`) |
| Bandas de entrada | B01, B02, B03, B04, B05, B06, B07, B08, B08A, B09, B11, B12 |
| Tamano de parche | 16 (`patch_size: 16`) |
| Recorte temporal | 0 (`clip_size: 0`) |
| Dimension de salida | lista de etiquetas `dim_0` a `dim_563` (listado truncado en la model card; dimension final no confirmada) |
| Dispositivo declarado | `cuda` |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-10-24 |

## Arquitectura y entrenamiento

OlmoEarth se define en el paper de Ai2 como un modelo fundacional multimodal y espaciotemporal basado en un planteamiento de aprendizaje autosupervisado especifico para observacion de la Tierra: una formulacion de modelado latente estable, una estrategia de enmascarado y una funcion de perdida disenadas para datos que son espaciales como una imagen, secuenciales como un video y multimodales por naturaleza. El checkpoint aqui publicado responde a esa familia y expone la configuracion de inferencia: parches de 16 pixeles, sin agregacion temporal (`clip_size: 0`) y entrada limitada a las doce bandas de Sentinel-2 en composites anuales.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset, el numero de parametros ni si hubo etapas de ajuste fino supervisado o preferencias (RLHF/DPO, este ultimo poco aplicable a un encoder geoespacial). Tampoco se detalla si el backbone es un ViT estandar con atencion global o una variante con atencion lineal o factorization espacio-temporal; el paper de referencia (arXiv:2511.13655) es la fuente a consultar para esos detalles. Lo que si es verificable es el schema de entrada: cualquier uso productivo debe replicar exactamente las doce bandas y el tamano de parche 16, o el modelo recibira tensores incompatibles.

## Capacidades

- Generacion de embeddings densos por parche geoespacial, utilizables como features congeladas en tareas posteriores.
- Procesamiento de imagenes multiespectrales Sentinel-2 con doce bandas, incluidas las de infrarrojo cercano y SWIR (B08A, B11, B12).
- Modelado espaciotemporal: la ventana temporal la define el usuario en la herramienta de entrenamiento (rslearn), no el checkpoint, que se distribuye con `clip_size: 0`.
- Base para ajuste fino supervisado en clasificacion, segmentacion semantica, regresion y deteccion de cambios.
- Soporte de busqueda por similitud y agrupamiento sobre el espacio latente (la web de Ai2 incluye un Embeddings Explorer para explorar y mapear el planeta).
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso: no es un LLM.
- No procesa imagenes naturales RGB de proposito general, audio ni video convencional.
- No tiene capacidades multilingues ni modo "thinking"; el concepto de idioma no aplica.
- No se han publicado en la informacion disponible capacidades adicionales (deteccion de objetos, captioning, VQA geoespacial) para este checkpoint concreto.

## Casos de uso

- Cartografia de cobertura del suelo: se congela el encoder, se extraen embeddings de parches Sentinel-2 y se entrena un clasificador ligero con etiquetas locales (por ejemplo, CORINE o muestreo propio) para producir mapas tematicos a escala regional.
- Monitorizacion de deforestacion y cambios: comparando embeddings de la misma ventana espacial en dos anos distintos se obtiene una medida de disimilitud en espacio latente que sirve para priorizar zonas candidatas a verificacion manual.
- Agricultura de precision: los composites anuales con bandas SWIR y red-edge permiten separar tipos de cultivo y estimar vigor vegetal; el modelo aporta features listos para un cabeza de clasificacion por parcela.
- Analisis de expansion urbana: embeddings de areas construidas y periferias para cuantificar sellado de suelo y crecimiento de nucleos urbanos a lo largo de series anuales.
- Indice y busqueda geoespacial: generar un catalogo vectorial de parches de un pais o continente y resolver consultas de similitud ("muestrame zonas parecidas a este parche") mediante kNN sobre los embeddings.
- Riesgo climatico y seguros: caracterizar el entorno biofisico de una coordenada (vegetacion, agua, suelo desnudo) como vector de features para modelos de exposicion y tarificacion.
- Baseline rapido en investigacion: al ser un checkpoint base pequeno (repositorio de 0,5 GB), sirve como referencia congelada frente a la que medir variantes entrenadas desde cero.
- Integracion en pipelines de datos: uso dentro de rslearn para construir datasets espaciotemporales y dentro de plataformas de procesamiento distribuido (Wherobots/Sedona) para aplicar el encoder sobre mosaicos a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card de Wherobots no incluye metricas, y el blog de Ai2 afirma de forma cualitativa un rendimiento state-of-the-art en embeddings de satelite, sin cifras verificables en el material consultado. No se inventan numeros.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 0,5 GB, por lo que los pesos en precision de 32 bits rondarian ese orden y en 16 bits la mitad; el consumo real dependera del tamano de lote, del numero de parches por inferencia y de las activaciones.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8-12 GB es probablemente suficiente para inferencia por lotes moderados; para barridos masivos sobre mosaicos conviene una A100 o H100 por throughput.
- GPU de consumo: si, previsiblemente cabe en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; la inferencia en CPU es viable para volumenes pequenos, aunque mas lenta.
- Opciones de despliegue: PyTorch nativo y el ecosistema rslearn de Ai2 son la via documentada. vLLM, llama.cpp, Ollama y TGI no aplican, al no ser un modelo autorregresivo de texto.
- Latencia y throughput: no disponibles. Dependeran fuertemente de la resolucion del mosaico, del numero de parches de 16 px y del dispositivo; conviene medirlos en el hardware objetivo antes de dimensionar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| `wherobots/olmoearth-v1_3-base-pt2` | no disponible | parche 16 px, `clip_size: 0` | `olmoearth-artifact-license` (`other`) | HuggingFace, 0 descargas |
| `allenai/OlmoEarth-v1_3-Base` (upstream) | no disponible | misma configuracion de parche | `olmoearth-artifact-license` | HuggingFace, repo oficial de Ai2 |
| Otros modelos fundacionales de observacion de la Tierra (familia Prithvi, Clay, TerraMind) | no disponible en la informacion | no disponible | no disponible | no verificado en esta busqueda |

La comparacion relevante y verificable es con el repositorio upstream de Ai2: mismos pesos y misma licencia, con la diferencia de que el original incluye documentacion y es el punto de entrada canonico, mientras que esta copia de Wherobots aporta unicamente la configuracion. Para el resto de alternativas no se dispone de datos contrastados en la informacion proporcionada, por lo que deben consultarse sus model cards antes de cualquier comparacion numerica.

## Limitaciones y advertencias

- Model card practicamente vacia: sin descripcion, sin datos de entrenamiento, sin evaluaciones y sin pipeline declarado; no hay garantia documental del comportamiento del checkpoint.
- Licencia `other` (`olmoearth-artifact-license`): no es una licencia OSI y remite al fichero de Ai2. Es imprescindible leerla antes de cualquier uso comercial, redistribucion o servicio alojado; no se puede asumir equivalencia con Apache 2.0 o MIT.
- Cero descargas y cero likes: no existe validacion de la comunidad ni reportes independientes de fallos sobre esta copia concreta.
- Dependencia estricta del schema de entrada: doce bandas `s2med_annual` en un orden concreto y parches de 16 px. Cualquier desviacion (otro sensor, otra resolucion, otro orden de bandas) invalida los embeddings sin aviso explicito.
- Sesgos esperables por la fuente de datos: Sentinel-2 tiene resolucion de 10-20 m, cobertura nubosa desigual y mayor densidad de observaciones en latitudes medias; zonas polares, oceanicas o con nubosidad cronica estan peor representadas.
- Ausencia de datos SAR y de otras modalidades en este checkpoint, pese al caracter multimodal del proyecto: la entrada declarada es solo Sentinel-2.
- Riesgo de alucinacion no aplica en sentido linguistico, pero si de falsos positivos en las tareas aguas abajo (segmentacion o deteccion de cambio), que deben validarse con muestreo de campo.
- No apto para tareas de texto, codigo, matematicas ni dialogo: usarlo fuera del dominio geoespacial produce resultados sin sentido.
- Fecha de creacion adelantada (2026-10-24) y metadatos incompletos: conviene contrastar cualquier dato con el repositorio upstream antes de fijar una version en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wherobots/olmoearth-v1_3-base-pt2
- Repositorio upstream de Ai2: https://huggingface.co/allenai/OlmoEarth-v1_3-Base
- Licencia referenciada: https://huggingface.co/allenai/OlmoEarth-v1_3-Base/blob/9e9e918a369701c105dde7ef56789b0ff1d47f50/LICENSE.txt
- Blog de Ai2 sobre OlmoEarth v1.3: https://huggingface.co/blog/allenai/olmoearth-v1-3
- Sitio del proyecto: https://olmoearth.allenai.org/
- Pagina de modelos abiertos y rslearn: https://olmoearth.allenai.org/models
- Pagina institucional: https://allenai.org/olmoearth
- Paper: https://arxiv.org/abs/2511.13655
