# torch-pointcloud/3detr-m.sunrgbd.fair

## Resumen

3detr-m.sunrgbd.fair es un modelo de detección de objetos 3D basado en 3DETR (DEtection TRansformer para nubes de puntos), un detector transformer end-to-end con predicción de conjuntos que elimina la necesidad de anclas, propuestas o supresión de no máximos (NMS). Lo publica el usuario torch-pointcloud como conversión del repositorio original facebookresearch/3detr, empaquetado para la librería pytorch-pointcloud. Está entrenado específicamente sobre el dataset SUN RGB-D para 10 clases de objetos de interior.

El modelo es deliberadamente compacto: 7,4 millones de parámetros y 256 canales de característica, lo que lo convierte en una pieza ligera y desplegable en entornos con recursos limitados, muy alejada de los grandes modelos multimodales actuales. Resuelve el problema de localizar y clasificar objetos 3D (cajas orientadas) a partir de nubes de puntos con información de color, un paso fundamental en robótica, realidad aumentada y análisis de escenas interiores.

Su relevancia ahora es de tipo práctico: ofrece un punto de partida reproducible y con licencia Apache-2.0 para tareas de detección 3D en interiores, con métricas declaradas sobre el benchmark SUN RGB-D y una API de carga en una línea mediante `torch_pointcloud.create_model`. No es un modelo generativo ni conversacional: es un componente de visión 3D para pipelines de percepción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3DETR: transformer end-to-end de predicción de conjuntos para nubes de puntos |
| Parametros totales | 7.451.113 (7,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería torch-pointcloud) |
| Canales de caracteristica | 256 |
| Clases detectadas | 10 |
| Dataset de entrenamiento | SUN RGB-D |
| Tamano del repositorio | 0,0 GB (pesos ligeros) |

## Arquitectura y entrenamiento

3DETR es un transformer encoder-decoder que procesa nubes de puntos mediante un backbone de atención sobre puntos (point transformer) y un decoder que genera un conjunto fijo de predicciones de cajas 3D, cada una con su clase y parámetros geométricos (centro, dimensiones y orientación). Al formular la detección como predicción de conjuntos, evita componentes heurísticos clásicos como anchors, proposal generation y NMS, lo que simplifica el pipeline y reduce la ingeniería manual. El modelo emplea 256 canales de característica y está dimensionado en 7,4 M de parámetros, una escala pequeña en comparación con detectores 3D basados en voxels o pillars.

El entrenamiento se realizó sobre SUN RGB-D, un benchmark de comprensión de escenas RGB-D de interiores con anotaciones de cajas 3D orientadas en 10 clases. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de refinamiento adicionales más allá del entrenamiento supervisado estándar del paper original (ICCV 2021). La conversión desde facebookresearch/3detr a pytorch-pointcloud preserva la arquitectura y los pesos, y añade utilidades de transformación y collate para integrar el modelo en pipelines de PyTorch.

## Capacidades

- Detección de objetos 3D en nubes de puntos: devuelve cajas 3D orientadas con clase y parámetros geométricos para 10 categorías de interiores de SUN RGB-D.
- Entrada multimodal a nivel de punto: acepta coordenadas (`pos`) y color (`color`) por punto, con transformaciones integradas para normalizar la muestra.
- Extracción de características: `forward_features` produce un vector de 256 canales por punto o por instancia, reutilizable para tareas downstream como segmentación, clustering o recuperación.
- Procesamiento por lotes: soporta collate de múltiples nubes de puntos con índices de batch, apto para inferencia en producción.
- Predicción de conjuntos sin NMS: la salida ya está desduplicada por diseño, lo que simplifica el postprocesado.
- No soporta tool calling, agentes, razonamiento multi-step, generación de texto, visión 2D genérica ni capacidades multilingües.

## Casos de uso

- Robótica de interiores: un robot móvil equipado con cámara de profundidad puede usar el modelo para localizar sillas, mesas y otros objetos de SUN RGB-D y planificar la navegación o la manipulación; los 7,4 M de parámetros permiten ejecución en tiempo real en hardware embebido con GPU modesta.
- Realidad aumentada: superponer etiquetas y cajas 3D sobre objetos físicos en una escena capturada por el móvil; el modelo es lo bastante ligero para ejecutarse en el dispositivo o en el borde.
- Análisis de escenas de interior para inmobiliaria o arquitectura: inventariar automáticamente el mobiliario de una habitación a partir de un escaneo RGB-D y generar planos o listados de activos.
- Preprocesado para manipulación robótica: usar `forward_features` como extractor de características 3D para alimentar políticas de agarre o módulos de segmentación de instancias.
- Benchmarking y reproducción académica: servir como línea base reproducible con licencia Apache-2.0 para comparar nuevos detectores 3D sobre SUN RGB-D sin tener que reentrenar desde cero.
- Sistemas de accesibilidad: describir la disposición espacial de objetos en una habitación a partir de una captura de profundidad para usuarios con discapacidad visual, combinando la salida de cajas con un módulo de locución.
- Control de calidad en logística de interiores: detectar y contar objetos en estanterías o almacenes mediante escaneos 3D, aprovechando el bajo coste computacional del modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre SUN RGB-D (no verificados de forma independiente, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP@0.25 | SUN RGB-D | 59,7 |
| mAP@0.5 | SUN RGB-D | 31,29 |

No se han publicado en la información disponible otros resultados de benchmarks (por ejemplo, comparativas con VoteNet, GroupFree3D o detectores basados en voxels) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 7,4 M de parámetros en FP32; holgadamente por debajo de 500 MB en FP16. La memoria dominante proviene de la nube de puntos de entrada (por ejemplo, 8192 puntos × 6 canales) y de las activaciones intermedias, no de los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en GPUs integradas o en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en placas embebidas tipo Jetson.
- Opciones de despliegue: la vía oficial es la librería `torch-pointcloud` (`pip install torch-pointcloud`) con `tp.create_model`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La exportación a ONNX o TensorRT no está documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño reducido sugiere latencias de milisegundos en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP@0.25 | mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 3detr-m.sunrgbd.fair | 7,4 M | SUN RGB-D | 59,7 | 31,29 | Apache-2.0 | HuggingFace (torch-pointcloud) |
| 3DETR original (facebookresearch) | ~7,4 M (variante M) | SUN RGB-D | no disponible en esta ficha | no disponible en esta ficha | Apache-2.0 | GitHub |
| VoteNet | no disponible | SUN RGB-D | no disponible | no disponible | MIT (repo original) | GitHub |
| GroupFree3D | no disponible | SUN RGB-D | no disponible | no disponible | no disponible | GitHub |

La comparación cuantitativa con alternativas no puede completarse con la información disponible: solo se dispone de las métricas declaradas para esta conversión concreta. La ventaja diferencial de esta ficha frente al repositorio original es la integración directa con `torch-pointcloud` y la distribución en safetensors vía HuggingFace.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en SUN RGB-D, con 10 clases de interiores; el rendimiento fuera de ese dominio (exteriores, industria, escenas a gran escala) no está garantizado y probablemente se degrade.
- Métricas no verificadas: los valores de mAP proceden de la model card y están marcados como `verified: false`; conviene reproducirlos antes de usarlos como referencia en producción.
- Sin información sobre sesgos: la model card no documenta sesgos de clase, desequilibrios del dataset ni disparidades geográficas o culturales en las escenas de entrenamiento.
- Riesgo de alucinación en sentido amplio: como todo detector, puede generar cajas falsas positivas en escenas ambiguas u oclusiones severas; no hay calibración de confianza documentada.
- Dependencia de la nube de puntos: requiere capturas RGB-D o nubes de puntos de calidad; con sensores ruidosos o densidades muy distintas a las de entrenamiento, el rendimiento puede caer.
- Sin soporte multimodal ni de lenguaje: no puede usarse para tareas de texto, VQA o agentes; es un componente puramente geométrico.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; aun así, el usuario debe verificar las licencias del dataset SUN RGB-D y de los pesos originales de facebookresearch/3detr para su caso concreto.
- Madurez: 20 descargas y 0 likes en el momento de la consulta; ecosistema pequeño y poca validación comunitaria, lo que aconseja pruebas propias antes de adoptarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/3detr-m.sunrgbd.fair
- Paper 3DETR: https://arxiv.org/abs/2109.08141
- Repositorio original: https://github.com/facebookresearch/3detr
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de pytorch-pointcloud: https://doi.org/10.5281/zenodo.22159632
- Dataset SUN RGB-D (paper CVPR 2015): https://arxiv.org/abs/1501.05616
