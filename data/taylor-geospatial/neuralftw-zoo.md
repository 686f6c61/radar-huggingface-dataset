# taylor-geospatial/neuralftw-zoo

## Resumen

NeuralFTW Model Zoo es un repositorio de 26 codificadores de localizacion geografica (location encoders) republicados por taylor-geospatial para su uso directo con la libreria NeuralFTW. Un location encoder es una red neuronal que transforma un par de coordenadas (longitud, latitud) en un vector denso de embedding que captura las caracteristicas ambientales, climaticas y de uso del suelo asociadas a ese punto del planeta. Estos embeddings se usan como entrada en modelos de observacion de la Tierra, modelado de biodiversidad, interpolacion climatica y tareas de aprendizaje automatico geoespacial.

El repositorio no contiene un modelo unico, sino una coleccion curada de arquitecturas heterogeneas: SatCLIP (en variantes ViT16, ResNet18 y ResNet50), GeoCLIP, SINR, CLIMPLICIT y GAIR, entre otras. Cada entrada se distribuye como pesos `safetensors` que contienen exclusivamente el codificador de localizacion, con todos los componentes auxiliares (codificadores de satelite, audio, texto, cabezas de clasificacion de especies y decodificadores de tarea) eliminados. Esto reduce el peso por modelo a entre 1,7 MiB y 54 MiB, frente a los cientos de megabytes o gigabytes de los repositorios originales.

La relevancia actual del proyecto reside en la estandarizacion de interfaces: todas las entradas aceptan coordenadas WGS84 en orden GeoJSON `(lon, lat)` como tensor float32 de forma `(batch, 2)` y devuelven embeddings de dimension configurable segun el modelo. Ademas, cada modelo se exporta a ONNX dinamico autocontenido y a variantes cuantizadas FP16, INT8 e INT4, lo que permite ejecucion en navegador y en entornos sin dependencias de PyTorch, `transformers`, `timm` ni `open_clip_torch`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: SatCLIP, GeoCLIP, SINR, CLIMPLICIT, GAIR, TTE (codificadores de localizacion) |
| Parametros totales | No disponible (no se declara recuento por modelo; el rango de pesos va de 1,70 MiB a 54,05 MiB en `safetensors`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija de coordenadas `(batch, 2)`) |
| Tipos de cuantizacion | FP32 (ONNX base), FP16 (hidden-only mixto), INT8 (`MatMulNBits`, `block_size=128`), INT4 (`MatMulNBits`, `block_size=32`) |
| Idiomas soportados | No disponible (modelo no linguistico) |
| Licencia | Mixta por modelo: MIT, Apache-2.0, CC-BY-4.0 y sin licencia (CSP) |
| Formato de pesos | `safetensors` y ONNX (opset 17 y 18) |

## Arquitectura y entrenamiento

Los modelos del zoo no comparten una arquitectura unica. SatCLIP emplea un codificador posicional seguido de un perceptron multicapa y se entrena con aprendizaje contrastivo entre ubicaciones y imagenes satelitales; sus variantes ViT16, ResNet18 y ResNet50 hacen referencia al codificador visual usado durante el preentrenamiento, pero en este repositorio solo se conserva la parte que mapea coordenadas a embeddings de dimension 256. GeoCLIP, en cambio, proyecta coordenadas mediante codificacion posicional esferica y produce embeddings de 512 dimensiones; sus variantes `sled-s1-s2-ls`, `sled-s2-ls` y `gair` elevan la dimension a 768. SINR usa una representacion implicita de la superficie terrestre con embeddings de 256 dimensiones, y CLIMPLICIT incorpora una dimension temporal opcional (mes 1-12) que, al omitirse, concatena los embeddings de los meses 3, 6, 9 y 12 para dar 1024 dimensiones.

El entrenamiento original de cada modelo es el de su repositorio de origen (indicado en la columna «Upstream Source» de la model card y en el campo `source_repo` de cada `config.json`). Este repositorio no reentrena ni ajusta los pesos: solo extrae el subgrafo del codificador de localizacion y lo reempaqueta. Las innovaciones tecnicas destacables son de ingenieria de despliegue: exportacion ONNX con lote dinamico verificada contra PyTorch para `B = 1, 7, 32`, cuantizacion post-entrenamiento con `MatMulNBits` para INT8 e INT4, y eliminacion total de dependencias de librerias de vision y texto. Los scripts `scripts/export_zoo.py` y `scripts/export_onnx.py` permiten reproducir tanto los pesos como los grafos.

## Capacidades

- Codificacion de coordenadas geograficas: transforma pares `(lon, lat)` en WGS84 a vectores densos de 256, 512, 768 o 1024 dimensiones segun el modelo.
- Entrada temporal opcional en CLIMPLICIT: acepta un mes (1-12) para producir embeddings estacionales de 256 dimensiones, o los concatena para 1024 dimensiones.
- Inferencia por lote dinamico: los grafos ONNX aceptan tamanos de lote arbitrarios (verificados con `B = 1, 7, 32`).
- Ejecucion sin dependencias pesadas: funciona en `onnxruntime` puro o en PyTorch con `safetensors`, sin `rshf`, `geoclip`, `transformers`, `timm` ni `open_clip_torch`.
- Compatibilidad con navegador: 24 de los 26 modelos tienen variantes ONNX aptas para entornos web.
- Normalizacion de orden de coordenadas: acepta `(lon, lat)` de forma universal y gestiona internamente el intercambio a `(lat, lon)` nativo de cada arquitectura.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un codificador de localizacion.

## Casos de uso

- Modelado de biodiversidad: usar el embedding de una coordenada como covariable ambiental en modelos de distribucion de especies (SDM), sustituyendo o complementando variables climaticas tabulares con un vector aprendido de 256 a 1024 dimensiones.
- Interpolacion climatica: CLIMPLICIT permite generar representaciones por mes y comparar estacionalidad entre puntos, util para reconstruir series climaticas en estaciones con datos incompletos.
- Enriquecimiento de datasets geoespaciales: añadir la columna de embedding a registros con latitud y longitud para alimentar modelos posteriores de prediccion (rendimiento agricola, riesgo de incendio, calidad del aire).
- Busqueda por similitud geografica: indexar embeddings de ubicaciones en una base vectorial para recuperar puntos con caracteristicas ambientales parecidas, util en recomendacion de rutas o analisis de corredores ecologicos.
- Aprendizaje contrastivo multimodal: usar el codificador como torre de localizacion en pipelines que alinean imagenes satelitales con coordenadas, ya que SatCLIP y GeoCLIP se entrenaron originalmente con ese objetivo.
- Despliegue en navegador o edge: las variantes ONNX INT8 e INT4 permiten calcular embeddings en el cliente sin backend, por ejemplo en visores de mapas que colorean regiones por similitud ambiental.
- Preprocesado en pipelines de teledeteccion: generar embeddings de localizacion para cada tesela de un mosaico satelital y usarlos como contexto posicional en tareas de segmentacion o clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todos los casos. Los pesos van de 1,70 MiB (`satclip-*-l10`) a 54,05 MiB (`sled-*`); las variantes INT4 de MIND ocupan 69,46 MiB y las INT8 112,49 MiB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo es tan pequeno que la latencia vendra dominada por el overhead de lanzamiento de kernels.
- Consumer GPU: cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- Despliegue: `onnxruntime` (CPU, CUDA, WebGPU/WASM), PyTorch con `safetensors`, y potencialmente `vLLM` o `TGI` no aplican porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano de los grafos, se espera que el cuello de botella sea el preprocesado de coordenadas y no el calculo.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Dimension de embedding | Entrada temporal | Licencia | Formato |
|---|---|---|---|---|---|
| `satclip-vit16-l40` (este zoo) | 4,63 MiB | 256 | No | MIT | safetensors, ONNX |
| `geoclip` (este zoo) | 36,05 MiB | 512 | No | MIT | safetensors, ONNX |
| `sled-s2-ls` (este zoo) | 54,05 MiB | 768 | No | Apache-2.0 | safetensors, ONNX |
| `climplicit` (este zoo) | 15,55 MiB | 1024 | Si (mes) | CC-BY-4.0 | safetensors, ONNX |
| MIND (`taylor-geospatial/MIND`) | 216,5 MiB fp16 | 3072 | No | MIT | safetensors, ONNX |

La comparativa interna muestra que el zoo cubre un rango amplio de dimensiones de embedding con un coste de almacenamiento muy bajo. Frente a MIND, el modelo de mayor dimension del ecosistema (3072), los codificadores del zoo son entre 4 y 30 veces mas pequenos, a costa de una representacion menos rica. No se dispone de datos de rendimiento comparativo entre estas arquitecturas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas ni soporta tool calling; cualquier uso conversacional es un error de categoria.
- Cobertura geografica desigual: al derivarse de预entrenamientos con imagenes satelitales, la calidad del embedding puede degradarse en zonas con poca cobertura (oceanos, polos, regiones con nubosidad persistente).
- Sin garantias de calibracion: los embeddings no estan normalizados de forma uniforme entre arquitecturas; no se deben comparar directamente vectores de modelos distintos sin una capa de alineacion.
- Licencias heterogeneas: cada modelo conserva la licencia de su origen (MIT, Apache-2.0, CC-BY-4.0). Los modelos CSP (`csp-inat`, `csp-fmow`) no tienen fichero de licencia en el repositorio upstream, lo que impide un uso comercial claro sin consultar al autor original.
- RANGE y RANGE+ estan excluidos deliberadamente por ser bases de datos de recuperacion y no codificadores independientes.
- Los pesos de MIND en precision completa siguen en su repositorio canonico; las variantes cuantizadas de este zoo pueden perder precision en la representacion de coordenadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.
- Fechas de creacion y actualizacion (2026) y algunos identificadores arXiv del listado de tags no son verificables en la informacion disponible; conviene contrastarlos antes de citarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/taylor-geospatial/neuralftw-zoo
- Repositorio MIND: https://huggingface.co/taylor-geospatial/MIND
- Libreria NeuralFTW: https://github.com/taylor-geospatial/neuralftw
- SatCLIP ViT16-L40: https://huggingface.co/microsoft/SatCLIP-ViT16-L40
- SatCLIP ViT16-L10: https://huggingface.co/microsoft/SatCLIP-ViT16-L10
- SatCLIP ResNet18-L40: https://huggingface.co/microsoft/SatCLIP-ResNet18-L40
- SatCLIP ResNet18-L10: https://huggingface.co/microsoft/SatCLIP-ResNet18-L10
- SatCLIP ResNet50-L40: https://huggingface.co/microsoft/SatCLIP-ResNet50-L40
- SatCLIP ResNet50-L10: https://huggingface.co/microsoft/SatCLIP-ResNet50-L10
- GeoCLIP location encoder: https://huggingface.co/MVRL/geoclip-location-encoder
- Ecogeo (TaxaBind): https://huggingface.co/MVRL/ecogeo
- SINR location encoder: https://huggingface.co/MVRL/sinr-location-encoder-1000-cls
- SLED S1-S2-LS: https://huggingface.co/geohai/sled-s1-s2-ls
- SLED S2-LS: https://huggingface.co/geohai/sled-s2-ls
- CLIMPLICIT: https://huggingface.co/Jobedo/climplicit
- GAIR: https://huggingface.co/PingL/GAIR
- CSP (upstream): https://github.com/gengchenmai/csp
