# wq2012/ribline-scf-pass2-autocontext

## Resumen

`wq2012/ribline-scf-pass2-autocontext` es un conjunto de checkpoints de aprendizaje automatico clasico (no una red neuronal) publicado por Quan Wang (usuario `wq2012`) para **ribline** v0.3.0, una libreria de extraccion de lineas centrales de costillas en CT toracico 3D. El repositorio contiene dos random forests en cascada —una pass-1 de apariencia y una pass-2 de auto-contexto— junto con un atlas estadistico de 24 costillas y los informes de evaluacion completos. El problema que aborda es la segmentacion y el etiquetado automatico de las 24 costillas en volumenes de CT, una tarea con aplicaciones en planificacion quirurgica, traumatologia costal y analisis morfologico.

La relevancia de esta publicacion no es de rendimiento, sino de trazabilidad cientifica: se trata de la **linea base de ablacion** del articulo asociado, liberada para documentar dos hallazgos concretos. El primero es que el auto-contexto basado solo en apariencia funciona mal en CT toracico porque las 24 costillas comparten secciones corticales locales casi identicas y la mascara osea empleada admite vertebras, esternon, escapulas y claviculas, lo que produce una precision del 99,6 % pero una sensibilidad del 78,0 % y una distancia de localizacion (LCD) de 9,36 mm. El segundo es el impacto de la etapa 3 (etiquetado bilateral con programacion dinamica polar y `RibSnake`) sobre detectores ruidosos: sobre los mismos mapas de probabilidad, sustituir el ordenado vertical ingenuo (21,30 mm de LCD, 43,0 % de exactitud) por la etapa 3 reduce la LCD a 9,36 mm y eleva la exactitud 28,0 puntos porcentuales.

El repositorio ocupa 0,4 GB, se publica bajo licencia MIT y no registra descargas ni valoraciones. No es un modelo de lenguaje: no genera texto, no soporta tool calling ni tiene contexto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random forest por voxel en dos pasadas (Semantic Context Forest con auto-contexto). No es una red neuronal, transformer ni SSM; extiende el esquema de Wang et al., MICCAI MCV 2013, de segmentacion de cartilago en MRI de rodilla a lineas centrales de costillas en CT toracico 3D |
| Parametros totales | No aplicable (no hay pesos tensoriales). Pass-1: 120 arboles, 228 caracteristicas. Pass-2: 100 arboles, 306 caracteristicas. Numero de nodos y profundidad de los arboles: no disponible |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable en el sentido de los modelos de lenguaje. Alcance espacial de las caracteristicas: RSID de ±20 voxeles (±40 mm) en pass-1 y de ±40 voxeles (±80 mm) en pass-2, sobre volumenes de CT toracico 3D |
| Tipos de cuantizacion | No aplicable. Los artefactos se serializan como objetos joblib/pickle de scikit-learn, no como tensores cuantizables (GGUF, AWQ, GPTQ, FP8, etc.) |
| Idiomas soportados | No aplicable (la entrada es un volumen de CT, no texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (pickle de scikit-learn) para `rib_forest_pass1.joblib`, `rib_forest_pass2.joblib` y `rib_atlas.joblib`; JSON para `feature_config_pass1.json`, `feature_config_img.json` y `feature_config_ctx.json` |
| Modalidad de entrada | CT toracico 3D (intensidad cruda en unidades Hounsfield; la mascara osea usa `I_raw > 1150`, aproximadamente > 126 HU) |
| Libreria de carga | `ribline` v0.3.0 (API `RibCageStatisticalAtlas`, `RibForest`) |
| Tamano del repositorio | 0,4 GB |
| Metricas declaradas | `chamfer_distance`, `cldice`, `accuracy`; los informes publicados reportan LCD (mm) y exactitud de etiquetado (%) |

## Arquitectura y entrenamiento

El sistema es una cascada de dos clasificadores de bosque aleatorio que operan voxel a voxel. La **pass-1** (`rib_forest_pass1.joblib`) usa 120 arboles sobre 228 caracteristicas: intensidad cruda de CT, 27 derivadas gaussianas multiescala (sigma = 1, 2, 4 mm) y 200 pares de Random Shift Intensity Difference (RSID) con desplazamientos en `[-20, 20]` voxeles (±40 mm), todo ello restringido por una mascara osea empirica de alta intensidad. La **pass-2** (`rib_forest_pass2.joblib`) usa 100 arboles sobre 306 caracteristicas, que combinan las 228 anteriores con 28 caracteristicas diferenciales multiescala del mapa de probabilidad de la pass-1 y 50 diferencias de contexto de probabilidad de largo alcance en `[-40, 40]` voxeles (±80 mm). Es decir, la segunda pasada no aporta nueva apariencia, sino contexto espacial derivado de la propia prediccion previa.

El atlas `rib_atlas.joblib` aporta la tercera pieza: curvas canonicas medias de las 24 costillas, priors de descriptores de 5 dimensiones y priors de espaciado intercostal. El repositorio incluye ademas los informes de evaluacion por sujeto (`benchmark_val12_fixed_gt.json`, `benchmark_val12_original_gt.json`, `benchmark_train47.json`, `benchmark_cv5.json`) y los registros de auditoria del ground truth (`polar_stats_all59.json`, `gt_fix_log.json`), lo que permite reproducir la evaluacion sobre 47 escaneos de entrenamiento, 12 de prueba y 59 para validacion cruzada de 5 particiones. No hay entrenamiento por descenso de gradiente, ni RLHF ni DPO: son bosques entrenados de forma supervisada sobre caracteristicas hand-crafted a partir del ground truth auditado. La etapa 3 (`BilateralViterbiLabeler` mas `RibSnake`) no forma parte de este repositorio, sino de la libreria `ribline` v0.3.0 con la que se ejecutan los checkpoints; las cifras de la tabla de benchmarks corresponden a esa combinacion.

## Capacidades

- Prediccion por voxel de la probabilidad de pertenencia a linea central de costilla en CT toracico 3D.
- Refinamiento por auto-contexto: la pass-2 integra el mapa de probabilidad de la pass-1 como caracteristica de entrada.
- Aportacion de priors anatomicos de 24 costillas mediante el atlas estadistico (curvas canonicas, descriptores de 5 dimensiones, espaciado intercostal).
- Soporte de etiquetado de costillas cuando se combina con la etapa 3 de `ribline` (programacion dinamica polar bilateral y `RibSnake`), que es la configuracion evaluada en los benchmarks publicados.
- Ejecucion integra en CPU: no requiere GPU ni aceleradores.
- Reproducibilidad de la evaluacion: incluye informes completos por sujeto y registro de correcciones del ground truth.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues, de vision general, de audio ni de generacion de texto.
- No dispone de modo de razonamiento explicito (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Linea base de ablacion en publicaciones cientificas: permite cuantificar cuanto aporta el anclaje anatomico (coordenadas canonicas ancladas a pulmon y estandarizacion en HU) frente al auto-contexto puramente de apariencia, con la misma etapa 3 y los mismos mapas de probabilidad.
- Auditoria de ground truth en datasets de CT toracico: los ficheros `gt_fix_log.json` y `polar_stats_all59.json` documentan las correcciones aplicadas al ground truth y permiten revisar la calidad de las anotaciones antes de reutilizar el conjunto.
- Investigacion sobre auto-contexto en imagen medica: el par de bosques permite estudiar el efecto de las caracteristicas de contexto de largo alcance (±80 mm) sin necesidad de entrenar una red neuronal.
- Despliegue en entornos sin GPU: al ser bosques aleatorios, la inferencia se ejecuta en CPU, lo que encaja en infraestructura hospitalaria o de laboratorio con recursos limitados.
- Comparacion metodologica entre familias de detectores, usando `benchmark_val12_original_gt.json` y `benchmark_val12_fixed_gt.json` para medir la sensibilidad de los resultados al ground truth empleado.
- Docencia sobre segmentacion clasica frente a aprendizaje profundo: el caso ilustra por que las caracteristicas de apariencia local fallan cuando 24 estructuras comparten firma visual casi identica, y como los priors anatomicos corrigen esa ambiguedad.
- Verificacion de implementaciones propias de Etapa 3: al publicarse los mapas de probabilidad con sus resultados, un tercero puede reproducir el etiquetado y contrastar su propia implementacion de programacion dinamica polar.

## Benchmarks y rendimiento

Datos publicados en la model card del propio repositorio, sobre el conjunto de prueba de 12 escaneos y sobre validacion cruzada de 5 particiones (59 escaneos):

| Repositorio | Variante | LCD 12 escaneos (mm) | Exactitud 12 escaneos (%) | LCD CV 5 particiones (mm) | Exactitud CV 5 particiones (%) |
|---|---|---|---|---|---|
| `wq2012/ribline-3d-ct-centerline` | Hibrido SCF + 3D U-Net + etapa 3 | 2,05 ± 0,48 | 97,2 | 3,64 ± 3,90 | 91,8 |
| `wq2012/ribline-anatomical-scf` | SCF con anclaje anatomico + etapa 3 (solo CPU) | 2,88 ± 1,32 | 95,1 | 5,28 ± 4,62 | 86,9 |
| `wq2012/ribline-3d-unet` | 3D U-Net ligera + etapa 3 | 3,40 ± 1,99 | 92,0 | 7,44 ± 8,93 | 78,2 |
| `wq2012/ribline-scf-pass2-autocontext` | SCF de 2 pasadas con auto-contexto + etapa 3 (este repositorio) | 9,36 ± 10,57 | 71,0 | no publicada | no publicada |

Metricas adicionales reportadas para la pass-2 de este repositorio: precision del 99,6 % (un unico falso positivo) y sensibilidad del 78,0 %. Para la etapa 3, sobre los mismos mapas de probabilidad: el ordenado vertical ingenuo en Z da 21,30 mm de LCD y 43,0 % de exactitud, frente a 9,36 mm y 71,0 % con `BilateralViterbiLabeler` y `RibSnake`. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU. No se requiere GPU: los checkpoints son bosques aleatorios y la libreria `ribline` los evalua en el procesador.
- VRAM: no aplicable (0 GB de VRAM dedicada). El modelo no usa CUDA.
- GPU recomendadas: ninguna. Cualquier CPU x86-64 moderna es suficiente; la carga depende del numero de voxeles del volumen y del coste de extraer 228 y 306 caracteristicas por voxel.
- RAM estimada: no disponible de forma desglosada. El repositorio completo ocupa 0,4 GB, de modo que el espacio en disco necesario para los tres artefactos `joblib` y los ficheros JSON es de ese orden.
- Cabe en cualquier equipo de consumo: si, sin requisitos de GPU. El cuello de botella practico es el tiempo de inferencia por volumen, no la memoria.
- Opciones de despliegue: carga directa con la libreria `ribline` v0.3.0 (`RibForest.load(...)`, `RibCageStatisticalAtlas.load(...)`) en un entorno Python. vLLM, llama.cpp, Ollama y TGI no son aplicables, porque no manejan objetos joblib de scikit-learn ni modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos por volumen ni por escaneo.

## Comparativa con modelos similares

La comparacion natural es dentro de la propia coleccion `ribline`, ya que las cuatro variantes comparten tarea, conjunto de evaluacion y etapa 3:

| Variante | Enfoque | LCD 12 escaneos (mm) | Exactitud (%) | CV 5 particiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `wq2012/ribline-3d-ct-centerline` | Hibrido SCF + 3D U-Net + etapa 3 | 2,05 ± 0,48 | 97,2 | 3,64 ± 3,90 mm; 91,8 % | no disponible en la informacion proporcionada | HuggingFace |
| `wq2012/ribline-anatomical-scf` | SCF anclado anatomicamente + etapa 3, solo CPU | 2,88 ± 1,32 | 95,1 | 5,28 ± 4,62 mm; 86,9 % | no disponible en la informacion proporcionada | HuggingFace |
| `wq2012/ribline-3d-unet` | 3D U-Net ligera + etapa 3 | 3,40 ± 1,99 | 92,0 | 7,44 ± 8,93 mm; 78,2 % | no disponible en la informacion proporcionada | HuggingFace |
| `wq2012/ribline-scf-pass2-autocontext` (este) | SCF de 2 pasadas con auto-contexto + etapa 3 | 9,36 ± 10,57 | 71,0 | no publicada | MIT | HuggingFace |

Frente a alternativas fuera de la coleccion (por ejemplo, redes de segmentacion de costillas publicadas de forma independiente) no se dispone de datos comparativos en la informacion proporcionada, por lo que la comparacion no esta disponible.

## Limitaciones y advertencias

- Rendimiento bajo en terminos absolutos: 9,36 ± 10,57 mm de LCD y 71,0 % de exactitud en el conjunto de prueba de 12 escaneos, muy por debajo de las otras variantes de la coleccion (2,05 mm y 97,2 % en la mejor). No debe usarse como sistema de produccion, sino como referencia de ablacion.
- Sensibilidad del 78,0 %: la pass-2 erosiona los arcos costales finos. Es el motivo declarado del bajo recall pese a la precision del 99,6 %.
- Mascara osea no selectiva: el umbral `I_raw > 1150` (aproximadamente > 126 HU) admite vertebras, esternon, escapulas y claviculas, lo que introduce falsos positivos sistematicos.
- Ambiguedad estructural irreducible: las 24 costillas presentan secciones corticales locales practicamente identicas, de modo que la apariencia sola no permite distinguirlas sin priors anatomicos o contexto global.
- Sin validacion cruzada publicada para esta variante: las columnas de CV de 5 particiones aparecen como no disponibles en la model card.
- Generalizacion desconocida: no se documentan protocolos, fabricantes de escaner, grosores de corte ni rangos de dosis del conjunto de 59 escaneos, por lo que el comportamiento fuera de esa distribucion es incierto.
- Ground truth auditado: la existencia de `gt_fix_log.json` implica correcciones sobre las anotaciones originales; los resultados deben interpretarse junto con `benchmark_val12_fixed_gt.json` frente a `benchmark_val12_original_gt.json`.
- Riesgo de alucinacion: no aplicable en el sentido de los modelos generativos, pero si existe el riesgo equivalente de predicciones estructuralmente plausibles pero anatomicamente incorrectas (por ejemplo, etiquetar una costilla con el indice equivocado) sin senal de incertidumbre calibrada mas alla de la probabilidad del bosque.
- Uso clinico: no se declara validacion clinica, aprobacion regulatoria ni estudio prospectivo. No debe emplearse para decision clinica sin validacion independiente.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales declaradas. Conviene verificar las condiciones de los datos de entrenamiento, no detalladas en la informacion proporcionada.
- Adopcion nula: 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no hay validacion por parte de terceros.
- No es un modelo de lenguaje: no procesa texto, no soporta idiomas, tool calling, agentes ni generacion de contenido. Cualquier expectativa en ese sentido es un error de categoria.
- Requiere la version correcta de la libreria: los checkpoints estan asociados a `ribline` v0.3.0 y a ficheros de configuracion JSON concretos; cambios de version o desajustes entre `feature_config_*.json` y los artefactos `joblib` pueden invalidar la carga.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wq2012/ribline-scf-pass2-autocontext
- Coleccion ribline en HuggingFace: https://huggingface.co/collections/wq2012/ribline
- Repositorio de codigo ribline: https://github.com/wq2012/ribline
- Variante SCF con anclaje anatomico: https://huggingface.co/wq2012/ribline-anatomical-scf
- Variante hibrida SCF + 3D U-Net: https://huggingface.co/wq2012/ribline-3d-ct-centerline
- Variante 3D U-Net ligera: https://huggingface.co/wq2012/ribline-3d-unet
- Perfil de GitHub del autor: https://github.com/wq2012
- Trabajo previo del mismo autor sobre segmentacion de cartilago en MRI de rodilla (incluye un refinamiento de pass-2 con auto-contexto): https://huggingface.co/wq2012/knee_3d_mri_segmentation_SKI10
- Referencia bibliografica citada en la model card: Wang et al., MICCAI MCV 2013 (segmentacion de cartilago en MRI de rodilla). Enlace no disponible en la informacion proporcionada.
- Enlace arXiv encontrado en la busqueda web, cuya relacion concreta con este modelo no se ha podido verificar: https://arxiv.org/pdf/2311.16254
- Otros resultados de busqueda no relacionados con el modelo (blog sobre modelos de autocompletado de codigo, documentacion de AutoPipeline de diffusers): no relevantes.
