# torch-pointcloud/pointnet2.scanobjectnn-hardest.openpoints

## Resumen

PointNet++ aplicado a clasificación de nubes de puntos 3D, distribuido por el proyecto `torch-pointcloud` de Arthur Dujardin. El modelo implementa la arquitectura de abstracción jerárquica de conjuntos (*set abstraction*) descrita en el artículo original de Qi et al. (NeurIPS 2017) y está entrenado sobre la variante más difícil del benchmark ScanObjectNN (`PB_T50_RS`), que introduce perturbaciones y oclusiones para acercar los datos sintéticos a escaneos reales.

Con 1,47 millones de parámetros y una cabeza de clasificación de 15 clases, es un modelo deliberadamente pequeño y ligero: su interés no está en competir con los transformers 3D de gran escala, sino en ofrecer una línea base reproducible, con pesos en `safetensors` y API de carga en una línea mediante `torch_pointcloud.create_model`. Es relevante para quien necesite un clasificador de objetos 3D rápido, desplegable en CPU o en GPUs modestas, y como referencia para comparar arquitecturas más modernas sobre el mismo split.

El checkpoint procede de la implementación de PointNeXt (MIT) y se ha reconvertido al formato de la librería `torch-pointcloud`. Declara un 86,16 % de *overall accuracy* y un 84,36 % de *mean accuracy* en ScanObjectNN, cifras no verificadas de forma independiente por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ (hierarchical set abstraction, capas de agrupacion y muestreo FPS) |
| Parametros totales | 1.476.175 (1,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de nube de puntos, ejemplo con 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en precision nativa PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `torch-pointcloud`) |

Otros datos declarados: 4 canales de entrada, 15 clases de salida, vector de características de 1024 dimensiones.

## Arquitectura y entrenamiento

PointNet++ es una red jerárquica que aplica de forma recursiva capas de *set abstraction*: muestreo por puntos más lejanos (FPS), agrupación por bola de radio en el espacio métrico y una mini-PointNet sobre cada grupo local. Esta composición permite capturar estructura local a varias escalas, algo que la PointNet original no hacía. La variante aquí publicada usa 4 canales de entrada (coordenadas XYZ más una característica adicional, habitual en las configuraciones de PointNeXt), clasifica en 15 categorías y produce un embedding global de 1024 dimensiones.

El entrenamiento se realiza sobre ScanObjectNN en su split `PB_T50_RS`, la configuración más exigente del benchmark: objetos reales escaneados, con perturbaciones de traslación y rotación, y un 50 % de puntos eliminados. La model card no detalla el número de épocas, el optimizador, el esquema de aumento de datos ni si hubo ajuste fino adicional; tampoco indica uso de RLHF/DPO, algo que no aplica a una tarea de clasificación. El checkpoint se convierte desde el repositorio PointNeXt, por lo que hereda su receta de entrenamiento original.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objetos (tarea `point-cloud-classification`).
- Extracción de características: `forward_features` devuelve un vector de 1024 dimensiones por muestra, útil como descriptor para tareas posteriores.
- Reutilización como *backbone*: `reset_classifier(num_classes=0)` permite sustituir la cabeza de clasificación y adaptar el modelo a otro número de clases.
- Entrada variable en número de puntos (el ejemplo de la model card usa 8192), con agregación por *batch* mediante la utilidad `collate`.
- Inferencia en CPU o GPU con PyTorch estándar, sin dependencias de kernels CUDA personalizados.
- No soporta tool calling, agentes, razonamiento multi-paso, visión 2D, audio ni generación de texto: es un clasificador puro.

## Casos de uso

- Clasificación de objetos en escaneos LiDAR o de profundidad: el modelo recibe la nube de puntos de un objeto segmentado y devuelve una de las 15 categorías; su tamaño de 1,5 M de parámetros permite ejecutarlo por objeto en tiempo real dentro de un pipeline de percepción.
- Preprocesado en robótica de manipulación: identificar la clase del objeto antes de decidir la pinza o la trayectoria, usando el embedding de 1024 dimensiones como entrada a un planificador o a un clasificador auxiliar.
- Etiquetado semiautomático de datasets 3D: aplicar el modelo a nubes no etiquetadas para preanotar y reducir el coste de revisión manual, con umbral de confianza para derivar casos dudosos a anotadores.
- Recuperación de objetos 3D por similitud: extraer embeddings con `forward_features` y construir un índice vectorial para búsqueda de formas similares en catálogos de escaneos o activos CAD.
- Línea base en investigación: comparar nuevas arquitecturas (PointNeXt, Point Transformer, PVCNN) contra este checkpoint sobre el split `PB_T50_RS`, con métricas OA y mAcc reproducibles.
- Despliegue en dispositivos de borde: al no requerir GPU dedicada, puede ejecutarse en CPU en sistemas embebidos o en un Jetson para clasificación local sin enviar datos a la nube.
- Filtrado previo en pipelines de reconstrucción: descartar o etiquetar fragmentos de escaneo antes de un procesamiento más costoso, aprovechando el bajo coste computacional del modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| ScanObjectNN (PB_T50_RS) | OA (overall accuracy) | 86,16 |
| ScanObjectNN (PB_T50_RS) | mAcc (mean accuracy) | 84,36 |

No se han publicado en la informacion disponible resultados comparativos adicionales ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precisión FP32 para lotes pequeños; el modelo ocupa unos 6 MB en pesos (1,47 M de parámetros × 4 bytes), por lo que el grueso del consumo proviene de las activaciones y del número de puntos de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; funciona sin problemas en RTX 3060, RTX 4090, A100 y H100, aunque estas últimas están sobredimensionadas para la carga.
- Cabe holgadamente en GPU de consumo e incluso en CPU: con 8192 puntos por muestra, la inferencia en CPU es viable para lotes moderados.
- Opciones de despliegue: PyTorch nativo a través de `torch-pointcloud`; no se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dataset | OA declarada | Licencia |
|---|---|---|---|---|---|
| pointnet2.scanobjectnn-hardest.openpoints | 1,5 M | Nube de puntos, 4 canales | ScanObjectNN PB_T50_RS | 86,16 | MIT |
| PointNet++ original (Qi et al., 2017) | ~1,5 M (config. clasificacion) | Nube de puntos, 3 canales | ModelNet40 / ScanObjectNN | no disponible en esta ficha | MIT (implementacion de referencia) |
| PointNeXt (guochengqian) | variable segun configuracion (desde ~0,8 M) | Nube de puntos | ScanObjectNN PB_T50_RS | no disponible en esta ficha | MIT |

La comparación cuantitativa con PointNeXt y con otras arquitecturas 3D no puede completarse porque la información proporcionada no incluye sus resultados en el mismo split. El checkpoint aquí descrito deriva directamente de PointNeXt, por lo que sus cifras deberían coincidir con la configuración equivalente de ese repositorio.

## Limitaciones y advertencias

- Modelo de clasificación cerrada: solo reconoce las 15 clases de ScanObjectNN; cualquier objeto fuera de ese conjunto se asignará a una de ellas sin señal explícita de rechazo.
- Métricas autodeclaradas y marcadas como `verified: false`; conviene reproducirlas antes de usarlas como referencia en publicaciones.
- Entrenado en escaneos reales con perturbaciones (`PB_T50_RS`); el rendimiento puede degradarse con nubes sintéticas limpias, densidades muy distintas o sensores con características diferentes a las del dataset.
- Sin información sobre sesgos de clase, balance del dataset ni análisis de errores por categoría.
- No es un modelo generativo, por lo que el riesgo de alucinación de texto no aplica; el riesgo equivalente es la sobreconfianza en clases incorrectas ante entradas fuera de distribución.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el usuario debe verificar las licencias de los datos de entrenamiento (ScanObjectNN) y del código de origen (PointNeXt) si redistribuye derivados.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.
- La model card no especifica la versión exacta de `torch-pointcloud` compatible ni el hash del checkpoint de origen en PointNeXt, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointnet2.scanobjectnn-hardest.openpoints
- Paper PointNet++: https://arxiv.org/abs/1706.02413
- Repositorio PointNeXt (origen de los pesos): https://github.com/guochengqian/PointNeXt
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria: https://doi.org/10.5281/zenodo.22159632
- Paper ScanObjectNN (ICCV 2019): no disponible como enlace en la informacion proporcionada
