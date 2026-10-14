# StephanMeijer/WhatDoWeSee-EfficientNet-B0

## Resumen

WhatDoWeSee-EfficientNet-B0 es un clasificador de imagenes multi-etiqueta desarrollado por StephanMeijer que detecta que elementos son visibles en una imagen entre 20 atributos posibles (personas, animales, plantas, paisaje, edificios, vehiculos, comida, texto, escritura a mano, graficos, diagramas, tablas, mapas, logos, formulas, pantallas, obras de arte, instrumentos, muebles y vistas aereas). A diferencia de un clasificador de clase unica, asigna a cada imagen todas las etiquetas que sean claramente reconocibles, incluso si aparecen desenfocadas o en segundo plano, con un umbral independiente por etiqueta.

El modelo se basa en la arquitectura EfficientNet-B0 y se distribuye como un unico fichero ONNX de 16 MB, con unas 10 ms por imagen en un solo hilo de CPU. Esta pensado para ordenar y describir grandes colecciones de imagenes sin necesidad de GPU.

La version actual es la v0.2 (14 de octubre de 2026) y se entreno sobre 20.551 imagenes etiquetadas mediante una sonda SigLIP 2 mas 444 imagenes etiquetadas a mano. En la evaluacion sobre 95 imagenes de prueba etiquetadas manualmente alcanza una precision media (mean AP) de 0,84 y un F1 macro de 0,67 con los umbrales ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes) |
| Tipos de cuantizacion | no disponible (se publica un unico modelo ONNX en float32) |
| Idiomas soportados | no aplica (modelo de vision; las etiquetas estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model.onnx) mas config.json |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura EfficientNet-B0, una red convolucional de la familia EfficientNet. La entrada es una imagen RGB redimensionada a 224x224 (interpolacion bilineal con antialiasing, sin recorte y sin mantener la relacion de aspecto), escalada a [0, 1] y normalizada con la media y la desviacion tipica de ImageNet, en formato NCHW float32. La salida es un vector de 20 probabilidades sobre el que se aplica una sigmoide, una por atributo, con umbrales independientes por etiqueta definidos en config.json. El preprocesado no usa crop, lo que implica deformacion de la relacion de aspecto en imagenes no cuadradas.

La v0.2 se entreno sobre 20.551 imagenes etiquetadas por una sonda SigLIP 2 mas 444 imagenes etiquetadas a mano. No se especifica en la informacion disponible el numero de tokens ni de pasos, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a una tarea de clasificacion supervisada). La etiquetacion parte de un modelo de vision-lenguaje (SigLIP 2) que actua como anotador, complementado con anotacion humana.

## Capacidades

- Clasificacion multi-etiqueta de imagenes en 20 atributos simultaneos, con umbral independiente por etiqueta.
- Deteccion de contenido documental y de oficina: texto, escritura a mano, graficos, diagramas, tablas, mapas y formulas.
- Deteccion de contenido natural y urbano: personas, animales, plantas, paisaje, edificios, vehiculos, comida.
- Deteccion de contenido digital y de diseno: logos e iconos, pantallas e interfaces, obras de arte, instrumentos musicales, muebles.
- Deteccion de vistas aereas o de satelite.
- Inferencia sobre CPU con latencia baja (aproximadamente 10 ms por imagen en un solo hilo).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un clasificador puro).
- Capacidades multilingues: no aplica; las etiquetas de salida estan en ingles.

## Casos de uso

- Organizacion de fototecas y archivos: etiquetar automaticamente grandes colecciones de imagenes por atributo para permitir busquedas y filtros por contenido (por ejemplo, aislar todas las imagenes con texto o con vistas aereas), aprovechando el bajo coste por imagen.
- Moderacion y triaje previo en pipelines de subida: descartar o marcar imagenes con contenido documental (tablas, formulas, pantallas) antes de enviarlas a un OCR o a un modelo de vision mas costoso.
- Preprocesado para OCR: identificar las imagenes que contienen texto o escritura a mano para dirigirlas a un motor de reconocimiento de texto, reduciendo el volumen procesado por modelos pesados.
- Enriquecimiento de metadatos en gestores de activos digitales (DAM): anadir etiquetas descriptivas de forma masiva para mejorar la indexacion y la recuperacion.
- Clasificacion de documentos escaneados: distinguir paginas con tablas, diagramas, mapas o formulas para enrutarlas a flujos de extraccion especificos.
- Automatizacion editorial: catalogar ilustraciones, obras de arte o iconos en bibliotecas de diseno y bancos de imagenes.
- Analisis de imagenes de satelite o dron a pequena escala: marcar vistas aereas para su posterior analisis geoespacial.
- Filtrado de contenido en investigacion: construir subconjuntos equilibrados por atributo (personas, animales, paisaje) para estudios o entrenamiento de otros modelos.

## Benchmarks y rendimiento

Evaluacion sobre 95 imagenes de prueba etiquetadas a mano (conjunto pequeno; las puntuaciones por etiqueta son orientativas). Precision media global (mean AP): 0,84. F1 macro con umbrales ajustados: 0,67. F1 macro con umbral fijo de 0,5: 0,71.

| Etiqueta | Nombre | Positivos | AP | F1 |
|---|---|---:|---:|---:|
| people | People | 11 | 0,87 | 0,69 |
| animals | Animals | 5 | 0,85 | 0,73 |
| nature | Plants | 4 | 0,69 | 0,33 |
| landscape | Landscape | 3 | 0,42 | 0,50 |
| buildings | Buildings / structures | 9 | 0,50 | 0,44 |
| vehicles | Vehicles | 4 | 0,88 | 0,55 |
| food | Food | 5 | 0,83 | 0,62 |
| text | Text | 22 | 1,00 | 0,98 |
| handwriting | Handwriting | 5 | 0,94 | 0,80 |
| chart | Chart | 7 | 0,98 | 0,83 |
| diagram | Diagram | 8 | 1,00 | 0,67 |
| table | Table | 6 | 0,90 | 0,67 |
| map | Map | 5 | 0,93 | 0,89 |
| logo-icon | Logo / icon | 6 | 0,87 | 0,80 |
| formula | Formula | 6 | 0,92 | 0,91 |
| screen | Screen / UI | 6 | 0,80 | 0,55 |
| artwork | Artwork | 7 | 0,79 | 0,44 |
| instruments | Instruments | 7 | 0,77 | 0,44 |
| furniture | Furniture | 5 | 0,97 | 0,89 |
| aerial | Aerial | 11 | 0,86 | 0,77 |

Comparacion con la version anterior (v0.1): mejor media (mean AP 0,84 frente a 0,80; F1 macro con umbral fijo de 0,5: 0,71 frente a 0,67) y mejora clara en documentos y pantallas: Table (AP 0,42 a 0,90), Screen / UI (0,38 a 0,80), Handwriting (0,58 a 0,94), Aerial (0,65 a 0,86) y Map (0,78 a 0,93). La informacion disponible sobre la comparacion se corta en el punto en que se mencionan los atributos donde la nueva version es mas debil, sin detallarlos.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo ONNX ocupa 16 MB y la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no aplica, aunque puede ejecutarse en GPU mediante onnxruntime con proveedores CUDA o TensorRT si se dispone de una.
- Compatibilidad con GPU de consumo: si, irrelevante en la practica porque cabe y funciona en CPU; tambien en GPU integrada o de gama baja.
- Opciones de despliegue: onnxruntime (documentado en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagenes). Existe un Space de demostracion en HuggingFace.
- Latencia y throughput: aproximadamente 10 ms por imagen en un solo hilo de CPU (dato del autor). No se proporcionan cifras de throughput agregado ni de latencia en GPU.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con otros modelos de la misma categoria. Como referencia conceptual, la anotacion automatica que genero el dataset de entrenamiento se baso en una sonda SigLIP 2, de modo que un clasificador zero-shot tipo SigLIP 2 o CLIP seria la alternativa natural, pero no se aportan numeros comparativos. Los datos disponibles solo permiten comparar la v0.2 con la v0.1 del mismo modelo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhatDoWeSee-EfficientNet-B0 v0.2 | no disponible | no aplica | mean AP 0,84; F1 macro 0,67 | apache-2.0 | HuggingFace (ONNX) |
| WhatDoWeSee-EfficientNet-B0 v0.1 | no disponible | no aplica | mean AP 0,80; F1 macro 0,67 | apache-2.0 | HuggingFace |
| Alternativas (SigLIP 2 / CLIP zero-shot) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El conjunto de evaluacion tiene solo 95 imagenes; las puntuaciones por etiqueta son orientativas y algunas clases tienen muy pocos positivos (por ejemplo, Landscape con 3, Plants con 4, Vehicles con 4).
- Rendimiento bajo en algunas etiquetas: Landscape (AP 0,42), Buildings (AP 0,50), Plants (AP 0,69) y F1 bajo en Plants (0,33), Artwork (0,44), Instruments (0,44) y Buildings (0,44).
- Las definiciones de cada atributo son estrictas y con exclusiones explicitas (por ejemplo, el cesped no cuenta como Plants, una tabla de datos no cuenta como Furniture, un mapa dibujado cuenta como Map y no como Aerial); un uso incorrecto de las etiquetas puede degradar los resultados.
- Riesgo de alucinacion y de falsos positivos derivado de umbrales por etiqueta ajustados sobre un split de validacion pequeno; conviene calibrar los umbrales sobre datos propios.
- Entrenamiento con etiquetas generadas por una sonda automatica (SigLIP 2) mas una pequena porcion de etiquetas manuales; puede heredar sesgos del anotador automatico.
- No se documentan sesgos demograficos ni geograficos especificos, pero tampoco se han publicado analisis al respecto.
- Licencia apache-2.0: permite uso comercial con atribucion y sin garantia; conviene revisar la version concreta (revision v0.2) para evitar cambios si se publica una version posterior.
- El preprocesado redimensiona a 224x224 sin mantener la relacion de aspecto, lo que puede afectar a imagenes muy alargadas.
- Las etiquetas de salida estan en ingles; no hay soporte multilingue en la salida.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; proyecto reciente y con poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StephanMeijer/WhatDoWeSee-EfficientNet-B0
- Demo (Space): https://huggingface.co/spaces/StephanMeijer/WhatDoWeSee
- No se han encontrado papers, blogs ni repos adicionales en la informacion proporcionada.
