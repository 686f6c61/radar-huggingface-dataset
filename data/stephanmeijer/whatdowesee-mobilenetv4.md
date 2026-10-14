# StephanMeijer/WhatDoWeSee-MobileNetV4

## Resumen

WhatDoWeSee-MobileNetV4 es un clasificador de imagenes multi-etiqueta desarrollado por StephanMeijer que asigna a una imagen cualquiera de 20 atributos visuales de presencia (personas, animales, plantas, paisaje, edificios, vehiculos, comida, texto, escritura a mano, graficos, diagramas, tablas, mapas, logos, formulas, interfaces de pantalla, obras de arte, instrumentos musicales, mobiliario y vistas aereas). El modelo no genera descripciones ni bounding boxes: solo devuelve, para cada atributo, una probabilidad independiente y un umbral calibrado por etiqueta.

La relevancia practica del modelo esta en su relacion tamano/velocidad: el artefacto ONNX ocupa 34 MB, la entrada es de 256x256 pixeles y el autor reporta unos 18 ms por imagen en un unico hilo de CPU. Esto lo hace apto para catalogar y ordenar grandes colecciones de imagenes en entornos sin GPU, o como etapa de triaje barata antes de modelos mas costosos.

Se trata de la version v0.2 (fechada el 2026-10-14), entrenada con 20.551 imagenes etiquetadas por una sonda SigLIP 2 mas 444 etiquetas manuales. La evaluacion publicada se realiza sobre 95 imagenes anotadas a mano, con una media de precision media (mAP) de 0,82 y un F1 macro de 0,74 en los umbrales ajustados. El modelo se distribuye bajo licencia Apache-2.0 y su arquitectura es MobileNetV4, una red convolucional disenada para eficiencia en movil y CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 (red neuronal convolucional para clasificacion de imagenes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico artefacto ONNX de 34 MB) |
| Idiomas soportados | no aplica (clasificacion de imagenes; la salida son 20 etiquetas en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`); configuracion en `config.json` |

Datos adicionales de entrada y salida segun la model card:

| Parametro | Valor |
|---|---|
| Entrada | RGB, redimensionado a 256x256 (bilineal con antialiasing, sin recorte, sin mantener la relacion de aspecto), escala [0, 1], normalizacion ImageNet (media y desviacion tipica), formato NCHW float32 |
| Nombre del tensor de entrada | `pixel_values` |
| Salida | 20 probabilidades independientes (sigmoide), una por atributo |
| Umbrales | Un umbral por etiqueta, almacenado en `config.json` y ajustado sobre un split de validacion |
| Etiquetas | `people`, `animals`, `nature`, `landscape`, `buildings`, `vehicles`, `food`, `text`, `handwriting`, `chart`, `diagram`, `table`, `map`, `logo-icon`, `formula`, `screen`, `artwork`, `instruments`, `furniture`, `aerial` |
| Tamano del repositorio | 0,0 GB segun la ficha de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un clasificador convolutional MobileNetV4 con cabeza multi-etiqueta y activacion sigmoide, exportado a ONNX. MobileNetV4 es una familia de redes convolucionales orientada a latencia baja en CPU y aceleradores moviles; en este caso el resultado es un artefacto de 34 MB que procesa entradas de 256x256 y produce 20 logits independientes. Al ser multi-etiqueta, no hay softmax ni clases mutuamente excluyentes: cada atributo se decide por separado contra su propio umbral.

Los datos de entrenamiento de la v0.2 son 20.551 imagenes etiquetadas por una sonda SigLIP 2 mas 444 etiquetas anotadas a mano, segun la model card. No se especifican en la informacion disponible el numero de pasos de entrenamiento, la composicion detallada del dataset, la resolucion original de las imagenes ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables en un clasificador de vision de este tipo). Tampoco se detalla la funcion de perdida mas alla del esquema multi-etiqueta. El uso de pseudo-etiquetas generadas por una sonda SigLIP 2 implica que el modelo destila, al menos parcialmente, los criterios y los sesgos de ese etiquetador.

## Capacidades

- Clasificacion multi-etiqueta: una imagen puede activar varias de las 20 etiquetas simultaneamente.
- Deteccion de presencia de personas, animales, plantas, paisajes, edificios, vehiculos, comida y mobiliario.
- Deteccion de contenido documental y tecnico: texto corrido, escritura a mano, graficos de datos, diagramas, tablas, formulas y mapas.
- Deteccion de elementos de interfaz y de identidad visual: capturas de pantalla o interfaces de aplicaciones (`screen`) y logotipos o iconos (`logo-icon`).
- Deteccion de imagenes artisticas (pinturas, ilustraciones, caricaturas, esculturas) frente a dibujos explicativos, que se etiquetan como `diagram`.
- Deteccion de vistas aereas o de satelite con suelo visible (`aerial`); las nubes sin suelo no cuentan y un mapa dibujado se etiqueta como `map`.
- Inferencia en CPU: unos 18 ms por imagen en un unico hilo de CPU, segun el autor.
- Ejecucion en navegador: existe un Space de demostracion en HuggingFace.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, vision-lenguaje ni audio: la salida es exclusivamente un vector de 20 probabilidades.
- Capacidades multilingues: no aplica; las etiquetas de salida estan en ingles y el modelo no procesa texto de entrada.

## Casos de uso

- Catalogacion de fototecas y archivos digitales: el modelo permite etiquetar automaticamente grandes volumenes de imagenes con atributos tematicos (personas, paisaje, edificios, comida) para habilitar busquedas y filtros por contenido sin intervencion manual. Su coste de 18 ms por imagen en un hilo de CPU hace viable procesar colecciones de decenas de miles de imagenes en un servidor modesto.
- Triaje previo en pipelines de extraccion documental: filtrar y enrutar imagenes que contienen `table`, `formula`, `chart`, `diagram` o `handwriting` hacia modulos especializados de OCR, reconocimiento de tablas o conversion de formulas, evitando ejecutar esos modulos costosos sobre imagenes que no los necesitan.
- Indexacion de documentacion tecnica y literatura cientifica: detectar figuras, diagramas, tablas y formulas dentro de articulos o manuales para construir indices de figuras o para enlazar cada elemento con su contexto textual.
- Gestion de activos digitales (DAM) y busqueda por atributos: enriquecer los metadatos de una biblioteca de recursos graficos con etiquetas como `logo-icon`, `screen` o `aerial`, de modo que los equipos de diseno puedan localizar recursos por tipo de contenido.
- Moderacion y clasificacion de contenido generado por usuarios: uso como primera etapa para marcar imagenes con presencia de personas, texto o interfaces, y decidir despues que politicas o revisiones adicionales aplicar.
- Digitalizacion y clasificacion de documentos escaneados: separar paginas con escritura a mano, tablas o formulas del resto de un lote escaneado, y asignar cada pagina a la cola de procesamiento adecuada.
- Aplicaciones en el borde o sin GPU: al ser un ONNX de 34 MB y ejecutarse en CPU, puede desplegarse en portatiles, contenedores ligeros o entornos de borde donde no hay acelerador disponible.
- Organizacion de vuelos fotograficos y material geoespacial: la etiqueta `aerial` permite separar capturas de dron o satelite del resto de un repositorio antes de pasarlas a herramientas de fotogrametria o SIG.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre 95 imagenes etiquetadas a mano y reservadas para test:

| Metrica | Valor |
|---|---|
| Mean average precision (mAP) | 0,82 |
| F1 macro (en los umbrales ajustados) | 0,74 |
| F1 macro (con umbral fijo 0,5) | 0,75 |

Resultados por etiqueta (numero de positivos, average precision y F1 en los umbrales ajustados):

| Etiqueta | Nombre | Positivos | AP | F1 |
|---|---|---:|---:|---:|
| `people` | People | 11 | 0,78 | 0,74 |
| `animals` | Animals | 5 | 0,82 | 0,89 |
| `nature` | Plants | 4 | 0,26 | 0,00 |
| `landscape` | Landscape | 3 | 0,59 | 0,50 |
| `buildings` | Buildings / structures | 9 | 0,58 | 0,56 |
| `vehicles` | Vehicles | 4 | 1,00 | 1,00 |
| `food` | Food | 5 | 1,00 | 1,00 |
| `text` | Text | 22 | 0,99 | 0,96 |
| `handwriting` | Handwriting | 5 | 1,00 | 0,75 |
| `chart` | Chart | 7 | 0,98 | 0,92 |
| `diagram` | Diagram | 8 | 0,82 | 0,80 |
| `table` | Table | 6 | 0,78 | 0,53 |
| `map` | Map | 5 | 1,00 | 0,89 |
| `logo-icon` | Logo / icon | 6 | 1,00 | 0,86 |
| `formula` | Formula | 6 | 0,93 | 0,91 |
| `screen` | Screen / UI | 6 | 0,82 | 0,67 |
| `artwork` | Artwork | 7 | 0,76 | 0,73 |
| `instruments` | Instruments | 7 | 0,76 | 0,67 |
| `furniture` | Furniture | 5 | 0,90 | 0,75 |
| `aerial` | Aerial | 11 | 0,67 | 0,70 |

El propio autor advierte que el conjunto de test es pequeno (95 imagenes) y que las puntuaciones por etiqueta son solo indicativas. No se han publicado en la informacion disponible resultados en benchmarks estandar tipo MMLU, HumanEval o GSM8K, que no aplican a un clasificador de vision.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explicita. Como referencia, el artefacto pesa 34 MB, por lo que la huella del modelo es minima; el consumo real dependera del runtime de ONNX Runtime y del tamano de lote. En CPU la inferencia esta pensada para ejecutarse en memoria principal, sin GPU.
- GPU recomendadas: no disponibles. Al ser un modelo ONNX, puede ejecutarse sobre proveedores de ejecucion CUDA o TensorRT de ONNX Runtime en GPUs como A100, H100 o RTX 4090, pero no hay datos publicados de rendimiento en GPU.
- GPU de consumo: el modelo cabe con enorme holgura en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en dispositivos sin GPU dedicada, dado su tamano de 34 MB y su entrada de 256x256.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), ONNX Runtime Web o cualquier runtime compatible con ONNX. El autor publica un Space en HuggingFace que permite probarlo en el navegador. Frameworks como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia: aproximadamente 18 ms por imagen en un unico hilo de CPU, segun la model card. Esto equivale, de forma derivada, a unas 55 imagenes por segundo por hilo, sin contar el preprocesado de imagen. No se publican datos de throughput en GPU ni con procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Arquitectura | mAP | F1 macro (umbrales ajustados) | F1 macro (umbral 0,5) | Licencia | Notas |
|---|---|---:|---:|---:|---|---|
| WhatDoWeSee-MobileNetV4 v0.2 | MobileNetV4, ONNX 34 MB | 0,82 | 0,74 | 0,75 | Apache-2.0 | 18 ms por imagen en un hilo de CPU; mejor en decisiones si/no |
| WhatDoWeSee-EfficientNet-B0 v0.2 | EfficientNet-B0 | 0,84 | 0,68 | 0,71 | no disponible | Mismo dataset y mismas imagenes de test |
| Otras alternativas de clasificacion multi-etiqueta | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

Diferencias reportadas por el autor frente a WhatDoWeSee-EfficientNet-B0 v0.2 (mismos datos y mismas imagenes de test): MobileNetV4 obtiene mejores decisiones si/no (F1 macro 0,74 frente a 0,68 con umbrales ajustados, y 0,75 frente a 0,71 con umbral 0,5), mientras que EfficientNet-B0 logra una mAP ligeramente superior (0,84 frente a 0,82). Por etiqueta, MobileNetV4 es mejor en Landscape (AP 0,59 frente a 0,42), Food (1,00 frente a 0,83) y Vehicles (1,00 frente a 0,88), ademas de en Logo / icon. La informacion proporcionada se interrumpe en ese punto de la comparativa.

## Limitaciones y advertencias

- Conjunto de evaluacion muy reducido: 95 imagenes anotadas a mano. Las metricas por etiqueta tienen intervalos de confianza amplios y no deben tomarse como estimaciones estables de rendimiento en produccion.
- Rendimiento desigual por etiqueta: la etiqueta `nature` (Plants) obtiene AP 0,26 y F1 0,00; `buildings` se queda en AP 0,58 y F1 0,56; `landscape` en 0,59 y 0,50; y `table` en F1 0,53 pese a una AP de 0,78. Estas etiquetas no son fiables con los umbrales actuales.
- Ruido de etiquetado: el entrenamiento se basa mayoritariamente en pseudo-etiquetas generadas por una sonda SigLIP 2 (20.551 imagenes) frente a solo 444 etiquetas manuales. Los errores y sesgos sistematicos de esa sonda se transfieren al modelo.
- Esquema de etiquetas cerrado y no extensible sin reentrenamiento: son exactamente 20 atributos con definiciones muy matizadas (por ejemplo, la distincion entre `diagram` y `artwork`, o entre `map` y `aerial`). Las discrepancias con la definicion del autor producen falsos positivos y negativos.
- No localiza objetos: devuelve etiquetas a nivel de imagen, sin bounding boxes ni segmentacion. No sirve para contar objetos ni para saber cuantos elementos de cada tipo hay.
- Preprocesado con deformacion: la imagen se redimensiona a 256x256 sin mantener la relacion de aspecto, lo que puede degradar la deteccion en imagenes muy panoramicas o muy verticales.
- Umbrales dependientes de la distribucion de validacion: cada etiqueta tiene su propio umbral ajustado; cambiar de dominio (por ejemplo, de fotografia general a imagenes medicas o industriales) puede requerir recalibrar los umbrales.
- Riesgo de alucinacion en el sentido de falsos positivos: al ser multi-etiqueta con sigmoide, etiquetas con umbrales bajos pueden activarse en imagenes sin el atributo correspondiente, especialmente en el caso de `nature` o `landscape`.
- Idioma: no procesa ni genera texto; las etiquetas de salida estan en ingles.
- Licencia Apache-2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia; conviene revisar el texto completo de la licencia antes de redistribuir el modelo.
- Versionado: la model card recomienda descargar una revision fija (por ejemplo, `revision="v0.2"`) para que una version posterior no altere los resultados. El repositorio aparece con 0 descargas y 0 likes, y un tamano reportado de 0,0 GB, por lo que conviene verificar los artefactos antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StephanMeijer/WhatDoWeSee-MobileNetV4
- Demo en el navegador (Space): https://huggingface.co/spaces/StephanMeijer/WhatDoWeSee
- WhatDoWeSee-EfficientNet-B0 v0.2: referenciado en la model card, sin URL proporcionada en la informacion disponible
- Sonda SigLIP 2 utilizada para el etiquetado: mencionada en la model card, sin URL proporcionada en la informacion disponible
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo: no disponible
