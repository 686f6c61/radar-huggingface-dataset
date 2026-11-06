# torch-pointcloud/pointgpt-l.shapenetpart.guangyan-chen

## Resumen

PointGPT-L es un modelo transformer de segmentación de nubes de puntos 3D, desarrollado originalmente por Guangyan Chen y colaboradores (Universidad de Pekín, BIT) y publicado en NeurIPS 2023. Esta ficha concreta, `pointgpt-l.shapenetpart.guangyan-chen`, es una conversión del checkpoint oficial al formato de la librería `torch-pointcloud` de Arthur Dujardin, y corresponde a la variante grande (L) afinada específicamente para la tarea de segmentación de partes sobre el dataset ShapeNetPart.

El modelo parte de un preentrenamiento generativo autorregresivo sobre nubes de puntos (`pointgpt-l.post-pretrain.guangyan-chen`) y se afina con supervisión para predecir, punto a punto, a qué parte de un objeto pertenece cada coordenada. Con 188,1 millones de parámetros y 50 clases de segmentación, resuelve un problema clásico en visión 3D: la comprensión fina de la geometría de objetos escaneados o sintéticos.

Es relevante para desarrolladores e investigadores que trabajan en pipelines de percepción 3D, robótica, realidad aumentada o gemelos digitales, porque ofrece un checkpoint listo para usar dentro del ecosistema PyTorch mediante `torch-pointcloud`, con licencia MIT y pesos en safetensors. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para nubes de puntos (PointGPT, preentrenamiento generativo autorregresivo) |
| Parametros totales | 188.152.114 (188,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; opera sobre muestras de 8192 puntos en el ejemplo de la model card |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,8 GB) |

## Arquitectura y entrenamiento

PointGPT es un transformer que trata la nube de puntos como una secuencia de "point patches" y aplica un objetivo de modelado generativo autorregresivo análogo al de los GPT de texto: predice el siguiente patch a partir de los anteriores. Esta variante L se inicializa desde el checkpoint post-pretrain del mismo autor y se afina de forma supervisada sobre ShapeNetPart, con 50 clases de partes y una cabeza de segmentación por punto que produce 8256 características por muestra en extracción de features.

La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de ShapeNetPart, ni si se aplicó RLHF/DPO (no aplica en este dominio). La innovación principal del trabajo original es trasladar el paradigma de preentrenamiento generativo de los LLM al dominio 3D, lo que permite aprender representaciones geométricas ricas antes del ajuste fino por tarea.

## Capacidades

- Segmentación de partes de objetos 3D: asigna una etiqueta de parte (50 clases) a cada punto de una nube de puntos.
- Extracción de características geométricas: `forward_features` devuelve un vector de 8256 dimensiones por muestra, reutilizable para tareas downstream.
- Clasificación por categoría de objeto: la entrada incluye la categoría, y el modelo condiciona la segmentación a ella.
- Procesamiento de nubes de puntos con posición y normales (claves `pos` y `normal` en el ejemplo de uso).
- No soporta tool calling, agentes, razonamiento multi-step, texto, visión 2D, audio ni capacidades multilingües: es un modelo puramente geométrico.

## Casos de uso

- Segmentación de partes en escaneos 3D: dado un objeto capturado con LiDAR o fotogrametría, el modelo etiqueta cada punto como parte del objeto (ala, fuselaje, rueda, etc.), útil en pipelines de reconstrucción y análisis.
- Preprocesado para robótica de manipulación: identificar partes de un objeto permite planificar puntos de agarre y descomponer la tarea de manipulación según la geometría.
- Gemelos digitales y CAD inverso: separar componentes de una malla o nube de puntos facilita la vectorización y el modelado paramétrico posterior.
- Anotación asistida de datasets 3D: usar el modelo como preetiquetador para acelerar el etiquetado manual de partes en nuevas colecciones de objetos.
- Extracción de embeddings para búsqueda y clustering: los vectores de 8256 dimensiones permiten agrupar objetos por similitud geométrica o alimentar clasificadores ligeros.
- Investigación en representación 3D: servir de baseline para comparar métodos de preentrenamiento autorregresivo frente a enfoques contrastivos o basados en difusión.
- Control de calidad en fabricación: detectar y segmentar partes de piezas escaneadas para verificar que la geometría coincide con el diseño previsto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| ShapeNetPart | Segmentación de partes | ins_mIoU | 86,8 |
| ShapeNetPart | Segmentación de partes | cls_mIoU | 84,36 |

No se han publicado en la información disponible resultados adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 188,1 M de parámetros en fp32, los pesos ocupan aproximadamente 0,75 GB; sumando activaciones para 8192 puntos, se estima un consumo de 2-4 GB en fp32 y menos de 2 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060 o superior es suficiente. Para lotes grandes, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe en GPU de consumo: sí, en RTX 3050/3060/4060 y superiores.
- Opciones de despliegue: la librería oficial es `torch-pointcloud` (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de nubes de puntos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | ShapeNetPart ins_mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-L (este) | 188,1 M | 8192 puntos | 86,8 (declarado) | MIT | Hugging Face vía torch-pointcloud |
| PointGPT-S/B | no disponible | no disponible | no disponible en la información | MIT | Repo oficial CGuangyan-BIT/PointGPT |
| PointNet++ | no disponible | no disponible | no disponible en la información | no disponible | Implementaciones públicas |
| Point Transformer | no disponible | no disponible | no disponible en la información | no disponible | Implementaciones públicas |

No se dispone de datos comparativos verificados de otros modelos en la información proporcionada; la comparativa se limita a señalar la existencia de alternativas del mismo dominio sin cifras contrastadas.

## Limitaciones y advertencias

- Modelo especializado: solo realiza segmentación de partes en nubes de puntos; no genera texto, código ni mantiene conversaciones.
- Dominio restringido: entrenado sobre ShapeNetPart (objetos sintéticos de 50 clases); el rendimiento puede degradarse en escaneos reales con ruido, oclusiones o categorías fuera del dataset.
- Métricas no verificadas: los valores de ins_mIoU y cls_mIoU los declara el autor y no han sido validados de forma independiente.
- Riesgo de alucinación geométrica: puede asignar partes plausibles pero incorrectas en objetos ambiguos o incompletos.
- Sesgos de dataset: ShapeNetPart tiene un sesgo hacia categorías y geometrías concretas; no se documentan análisis de sesgo.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los datasets y del código original (MIT) al redistribuir.
- Sin soporte multilingüe ni de texto: no aplica, pero conviene no confundirlo con un LLM por el nombre "GPT".
- Repo con 0 descargas y 0 likes: ecosistema incipiente; puede haber menos soporte comunitario que en modelos consolidados.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-l.shapenetpart.guangyan-chen
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-l.post-pretrain.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio oficial: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
