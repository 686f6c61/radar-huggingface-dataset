# Zenseact/j3pa-large

## Resumen

J3PA-Large es un codificador (*encoder*) auto-supervisado de nubes de puntos LiDAR desarrollado por Zenseact, la empresa sueca de software para conducción autónoma. Forma parte de la familia J3PA, que incluye versiones Tiny (9,8 M de parámetros), Small (42,4 M), Large (134,6 M) y 1B (1,01 B). J3PA-Large se ha destilado a partir de J3PA-1B y genera características genéricas por punto para tareas posteriores como segmentación semántica, segmentación panóptica y detección de objetos 3D, pudiendo usarse congelado o con *fine-tuning*.

La relevancia del modelo radica en su enfoque auto-supervisado: no requiere anotaciones humanas para preentrenarse, lo que reduce costes en un dominio donde etiquetar nubes de puntos LiDAR es especialmente caro. Además, una de sus innovaciones destacables es que acepta el tamaño de vóxel como entrada (de 4 a 20 cm), de modo que un único modelo sirve para distintos compromisos entre rendimiento y velocidad de procesamiento.

Técnicamente es un codificador que voxeliza la nube de puntos y la procesa en cinco etapas con resoluciones progresivamente más gruesas (cada etapa duplica el tamaño de vóxel). La salida por defecto concatena características de las cinco etapas, produciendo 2112 canales por punto de entrada. El modelo tiene 134,6 millones de parámetros, licencia Apache 2.0 y requiere `trust_remote_code=True` porque incluye *kernels* CUDA personalizados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de nubes de puntos LiDAR con voxelizacion multi-etapa (5 etapas) y atencion agrupada por curvas de relleno espacial; no es un transformer de texto |
| Parametros totales | 134.623.453 (134,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de puntos de tamano variable; no aplica contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo no linguistico; procesa datos LiDAR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

J3PA es una familia de codificadores auto-supervisados de nubes de puntos LiDAR. La arquitectura voxeliza la nube de entrada y la procesa en cinco etapas, donde los vóxeles de la etapa *s* tienen un tamaño de 2^s veces el tamaño de vóxel base. La atención se organiza en grupos definidos mediante curvas de relleno espacial (*space-filling curves*), cuyo orden se aleatoriza durante el entrenamiento en modo *train*. El modelo acepta un parámetro `voxel_size` (por defecto 0,05 m) que puede ser un flotante para todas las nubes o un tensor con un valor por nube, permitiendo operar en el rango de 4 a 20 cm. Vóxeles más grandes aumentan el rendimiento con solo una pérdida menor en las tareas posteriores.

El entrenamiento es auto-supervisado, sin necesidad de etiquetas. J3PA-Large se ha obtenido por destilación a partir de J3PA-1B. No se especifica en la información disponible el número de tokens ni la composición exacta del dataset de preentrenamiento, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). La entrada es un tensor CUDA float32 de forma (N, 5) con columnas `age` (segundos desde el barrido del punto hasta el barrido más reciente), `x`, `y`, `z` (metros; x adelante, y izquierda, z arriba) e `intensity` (0 a 255). La salida incluye `point_features()` (2112 canales por punto por defecto: 1024 + 512 + 256 + 192 + 128), `voxel_features()` y, por etapa, `features[s]`, `positions[s]`, `batch_indices[s]` y `up_indices[s]`.

## Capacidades

- Extraccion de caracteristicas por punto de nubes de puntos LiDAR para tareas posteriores (*feature extraction*).
- Segmentacion semantica y panoptica de nubes de puntos.
- Deteccion de objetos 3D.
- Uso congelado (lineal probing) o con *fine-tuning* completo como cualquier modulo de PyTorch.
- Soporte de multiples tamanos de voxel (4 a 20 cm) en un unico modelo, con control por nube mediante tensor.
- Procesamiento por lotes: acepta una lista de nubes y separa las caracteristicas por nube.
- Manejo de barridos multiples mediante la columna `age` (apilado de barridos en una sola nube).
- Salidas multi-etapa seleccionables (`point_features(stages=...)`, `voxel_features(stages=...)`).
- No dispone de generacion de texto, tool calling, capacidades de agente ni capacidades multilingues.

## Casos de uso

- Segmentacion semantica de escenas urbanas: usar `voxel_features()` o `point_features()` como entrada a una cabeza de segmentacion ligera; el modelo congelado ya proporciona caracteristicas discriminativas, lo que abarata el etiquetado necesario.
- Deteccion de objetos 3D en vehiculos autonomos: extraer caracteristicas por punto y alimentar un detector 3D; el soporte de multiples barridos via `age` permite agregar informacion temporal sin cambiar de modelo.
- Preentrenamiento y *fine-tuning* en dominios propios: al ser auto-supervisado y Apache 2.0, se puede ajustar con datos de un sensor o flota concreta para adaptar las caracteristicas.
- Procesamiento en tiempo real con compromiso velocidad/precision: seleccionar `voxel_size=0.1` o `0.2` para aumentar el rendimiento en *pipelines* embarcados con perdida menor de calidad.
- Etiquetado asistido y auto-etiquetado: generar caracteristicas o predicciones preliminares para acelerar la anotacion de grandes volumentes de nubes de puntos.
- Investigacion en representaciones 3D: usar las caracteristicas multi-etapa (128 a 1024 canales) para estudiar *linear probing* o comparar representaciones entre modelos.
- Segmentacion panoptica: combinar las caracteristicas por punto con cabezas de instancia para separar objetos y clases en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe un articulo (arXiv) y un repositorio de codigo, pero ambos aparecen como "coming soon" y no se incluyen cifras numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 134,6 M de parametros y el repositorio ocupa 0,5 GB; en fp32 los pesos ocupan aproximadamente 0,54 GB, mas el consumo de los *kernels* CUDA personalizados y las activaciones, que dependen del numero de puntos por nube.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el ejemplo oficial usa `.cuda()`. Para lotes grandes de nubes densas se recomiendan A100 o H100; para desarrollo y pruebas, RTX 4090 o superiores.
- Cabe en GPU de consumo: si, dado el reducido tamano del modelo; el limite practico sera el numero de puntos por nube y el tamano de lote.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; requiere los *kernels* GPU incluidos en el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles de forma numerica; la model card indica que tamanos de voxel mayores aumentan el rendimiento con una perdida menor en las tareas posteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| J3PA-Large | 134,6 M | Nubes LiDAR, voxel 4-20 cm, 5 etapas | Apache 2.0 | Hugging Face |
| J3PA-1B | 1,01 B | Nubes LiDAR, voxel configurable | Apache 2.0 | Hugging Face |
| J3PA-Small | 42,4 M | Nubes LiDAR, voxel configurable | Apache 2.0 | Hugging Face |
| J3PA-Tiny | 9,8 M | Nubes LiDAR, voxel configurable | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, salvo la indicacion cualitativa de que J3PA-Large se destila de J3PA-1B. No se han identificado en la informacion disponible otros codificadores LiDAR auto-supervisados comparables de otros autores.

## Limitaciones y advertencias

- Modelo especializado en nubes de puntos LiDAR: no procesa texto, imagenes ni audio, y no tiene capacidades generativas ni de agente.
- Requiere `trust_remote_code=True` y ejecucion en GPU CUDA con los *kernels* personalizados del repositorio; no funciona en CPU de forma documentada.
- La entrada debe respetar el formato exacto (N, 5) con `age`, `x`, `y`, `z` e `intensity` en el rango 0-255; intensidades en 0-1 deben multiplicarse por 255.
- El rendimiento depende del tamano de voxel elegido; tamanos mayores reducen la calidad en las tareas posteriores.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con datos de conduccion, puede generalizar peor en escenarios fuera de dominio (interiores, otros sensores, otras densidades).
- Riesgo de alucinacion no aplicable en el sentido generativo, pero las predicciones aguas abajo pueden ser erroneas en escenas no representadas en el preentrenamiento.
- No se especifican los datos de entrenamiento ni su procedencia, lo que limita la evaluacion de sesgos y cobertura.
- Licencia Apache 2.0 permite uso comercial, pero el articulo y el codigo oficial aun no estan publicados ("coming soon"), lo que puede afectar a la reproducibilidad.
- No se documentan cuantizaciones ni formatos alternativos a safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zenseact/j3pa-large
- J3PA-1B: https://huggingface.co/Zenseact/j3pa-1b
- J3PA-Small: https://huggingface.co/Zenseact/j3pa-small
- J3PA-Tiny: https://huggingface.co/Zenseact/j3pa-tiny
- Articulo (arXiv): pendiente de publicacion ("coming soon")
- Codigo (GitHub): pendiente de publicacion ("coming soon")
- Licencia: archivo LICENSE en el repositorio de Hugging Face
