# torch-pointcloud/pointnet2-msg.shapenetpart.mit-han-lab

## Resumen

PointNet2-MSG aplicado a segmentación de partes de nubes de puntos es un modelo de visión 3D que clasifica cada punto de una nube de puntos en una de 50 categorías de partes de objeto, condicionado por la categoría global del objeto. Lo desarrolla el ecosistema `torch-pointcloud` (Arthur Dujardin) como conversión del modelo original de `mit-han-lab/pvcnn`, que a su vez implementa la arquitectura PointNet++ descrita por Qi et al. en NeurIPS 2017. El checkpoint se distribuye en formato `safetensors` y pesa apenas 1,77 millones de parámetros, lo que lo convierte en un modelo muy ligero para inferencia en CPU o GPU de gama baja.

El problema que resuelve es la segmentación semántica a nivel de punto: dado un objeto 3D muestreado como conjunto desordenado de coordenadas, asignar a cada punto una etiqueta de parte (por ejemplo, ala, motor o cola en un avión, o patas y respaldo en una silla). La variante MSG (multi-scale grouping) agrupa puntos a varias escalas de radio para capturar tanto estructuras locales finas como contexto global, lo que mejora la robustez frente a densidades variables.

Es relevante ahora como referencia reproducible y ligera dentro del ecosistema `torch-pointcloud`: permite cargar el modelo con una sola llamada (`tp.create_model`), extraer características de 128 dimensiones y usarlo como componente en pipelines de segmentación 3D, aumentación de datos o preentrenamiento de modelos mayores. No es un modelo generativo ni conversacional; es un backbone de visión 3D especializado, entrenado exclusivamente sobre ShapeNetPart.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ (hierarchical set abstraction) con multi-scale grouping (MSG) |
| Parametros totales | 1.767.654 (1,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); entrada de nube de puntos, en el ejemplo 8192 puntos |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (coordenadas xyz; el ejemplo admite tambien normales) |
| Numero de clases de parte | 50 |
| Dimension de caracteristicas | 128 |
| Dataset de entrenamiento | ShapeNetPart |

## Arquitectura y entrenamiento

PointNet++ es una red jerárquica que aplica capas de *set abstraction* de forma recursiva: en cada nivel muestrea puntos (farthest point sampling), agrupa vecinos por bola de radio y aplica un mini-PointNet sobre cada grupo para extraer características locales. La variante MSG agrupa simultáneamente con varios radios y concatena las características resultantes, de modo que el modelo captura patrones a distintas escalas sin necesidad de elegir un único radio. La salida final es una predicción por punto que se condiciona con la categoría global del objeto (50 clases de parte), tal como indica la model card.

El entrenamiento se realizó sobre ShapeNetPart, el benchmark estándar de segmentación de partes con 16 categorías de objeto y 50 etiquetas de parte. La model card no detalla el número de tokens, la composición exacta del dataset, ni si hubo aumentación específica, RLHF/DPO (no aplica) u otras innovaciones de entrenamiento. Tampoco se documenta la estrategia de decodificación especulativa ni mecanismos de atención lineal: es una arquitectura puramente convolucional/MLP sobre grafos de puntos. El checkpoint se convirtió desde la implementación de `mit-han-lab/pvcnn` y se empaquetó para la librería `torch-pointcloud`.

## Capacidades

- Segmentación de partes a nivel de punto: asigna una de 50 etiquetas a cada punto de la nube, condicionada por la categoría del objeto.
- Extracción de características: `forward_features` devuelve un vector de 128 dimensiones por punto o por muestra, reutilizable como embedding para tareas posteriores.
- Clasificador configurable: `reset_classifier(num_classes=0)` permite usar el modelo como extractor puro sin cabeza de clasificación.
- Procesamiento de nubes de puntos desordenadas e invariante a permutaciones, gracias al diseño de PointNet++.
- Robustez multi-escala frente a densidades variables de muestreo (ventaja del MSG).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (modelo no lingüístico).
- Capacidades especiales: no dispone de modo *thinking*, visión 2D, audio ni generación de texto.

## Casos de uso

- Segmentación de partes en escaneos 3D de objetos: dado un escaneo de una silla o un avión, el modelo etiqueta cada punto como respaldo, patas, ala o motor, lo que permite separar componentes para modelado CAD o inspección.
- Preprocesamiento para pipelines de robótica de manipulación: segmentar la nube de puntos de un objeto en partes facilita la planificación de agarres y la selección de puntos de contacto.
- Aumentación y etiquetado asistido de datasets 3D: usar las predicciones del modelo como preetiquetas para acelerar el etiquetado manual de nuevas nubes de puntos, con revisión humana posterior.
- Extracción de embeddings para recuperación de formas 3D: los vectores de 128 dimensiones por punto o por muestra sirven para construir índices de similitud entre objetos o para entrenar clasificadores ligeros con pocos datos.
- Control de calidad en impresión 3D o escaneo industrial: detectar y aislar partes de una pieza escaneada para comparar con el modelo CAD de referencia y localizar desviaciones.
- Investigación y benchmarking: servir como baseline reproducible de PointNet++ MSG sobre ShapeNetPart para comparar nuevas arquitecturas de segmentación de partes con una implementación ligera y de licencia MIT.
- Prototipado en entornos con recursos limitados: con 1,8 M de parámetros, el modelo se ejecuta en CPU o en GPU consumer para demos interactivas de segmentación 3D en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| ShapeNetPart | ins_mIoU (IoU medio por instancia) | 85,24 |
| ShapeNetPart | cls_mIoU (IoU medio por clase) | 82,84 |

No se han publicado en la información disponible otros resultados de benchmarks (por ejemplo, latencia, throughput o comparaciones con arquitecturas más recientes) más allá de los dos valores anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,8 M de parámetros en fp32 el peso ronda los 7 MB, por lo que el modelo cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM, incluyendo GPUs integradas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU; no requiere A100 ni H100 para inferencia.
- Cabe en GPU consumer: sí, en todas las gamas, incluidas GTX 1650 o similares, y también en CPU.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`), que carga el checkpoint vía `tp.create_model`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño reducido, se espera una latencia de milisegundos por nube de 8192 puntos en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | ShapeNetPart ins_mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointnet2-msg.shapenetpart.mit-han-lab | 1,8 M | nube de puntos (ej. 8192 puntos) | 85,24 | MIT | Hugging Face (`torch-pointcloud`) |
| PointNet++ MSG original (Qi et al., 2017) | ~1,7 M (referencia) | nube de puntos | ~85,2 (reportado en paper) | MIT (implementacion de referencia) | GitHub |
| PointNet++ SSG (single-scale grouping) | ~1,5 M (referencia) | nube de puntos | ~84,7 (referencia) | MIT | GitHub |
| PVCNN (mit-han-lab) | no disponible | nube de puntos | no disponible en esta ficha | MIT | GitHub |

Nota: los valores de las alternativas son referencias de la literatura y no se han verificado en esta ficha; la comparación con PVCNN y otras arquitecturas más recientes (Point Transformer, PointNeXt) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de partes sobre ShapeNetPart: no generaliza necesariamente a categorías de objeto fuera de las 16 clases del dataset ni a dominios muy distintos (escaneos reales ruidosos, LiDAR, etc.).
- Requiere la categoría global del objeto como entrada auxiliar; sin ella, el rendimiento puede degradarse.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación en el sentido de predicciones erróneas de etiqueta por punto en regiones ambiguas o con oclusión; no hay estimación de incertidumbre documentada.
- Sesgos conocidos: no documentados en la model card; el dataset ShapeNetPart tiene una distribución de formas sintéticas que puede no reflejar escenas reales.
- Restricciones de licencia: MIT permite uso comercial, pero conviene revisar la licencia del dataset ShapeNetPart y de la implementación original de `mit-han-lab/pvcnn` para usos derivados.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`); no deben tomarse como cifras auditadas.
- No se documentan cuantizaciones ni formatos alternativos (GGUF, ONNX), lo que limita el despliegue fuera del ecosistema PyTorch/`torch-pointcloud`.
- El repositorio tiene muy pocas descargas (17) y ningún *like*, por lo que el soporte comunitario y la validación externa son escasos.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/pointnet2-msg.shapenetpart.mit-han-lab
- Paper PointNet++: https://arxiv.org/abs/1706.02413
- Repositorio `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- Repositorio original `mit-han-lab/pvcnn`: https://github.com/mit-han-lab/pvcnn
- DOI de `torch-pointcloud`: https://doi.org/10.5281/zenodo.22159632
- Dataset ShapeNetPart (paper de referencia): Yi et al., ACM Transactions on Graphics (TOG), 2016
