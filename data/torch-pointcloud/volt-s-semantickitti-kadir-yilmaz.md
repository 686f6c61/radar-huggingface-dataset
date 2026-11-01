# torch-pointcloud/volt-s.semantickitti.kadir-yilmaz

## Resumen

Volt-s es un modelo de segmentación semántica de nubes de puntos LiDAR, concretamente la variante pequeña (S) de la familia Volt presentada en el artículo "Volume Transformer: Revisiting Vanilla Transformers for 3D Scene Understanding" (ECCV 2026) por Kadir Yilmaz, Adrian Kruse, Tristan Höfer, Daan de Geus y Bastian Leibe. Este checkpoint concreto ha sido convertido por el proyecto torch-pointcloud al formato de su librería y está entrenado sobre el dataset SemanticKITTI, con 19 clases de segmentación.

La propuesta técnica del modelo es deliberadamente conservadora: en lugar de recurrir a operadores especializados para nubes de puntos (como sparse convolutions o atención dispersa), aplica un transformer "vanilla" sobre tokens de parches volumétricos. Con solo 23,6 millones de parámetros, el modelo busca demostrar que una arquitectura transformer estándar, bien tokenizada, es competitiva en comprensión de escenas 3D.

Es relevante para desarrolladores e investigadores que trabajan en percepción LiDAR para conducción autónoma o robótica, porque ofrece un punto de partida ligero, con licencia MIT y métricas verificables sobre un benchmark estándar (SemanticKITTI), y porque su integración en la librería torch-pointcloud simplifica el despliegue con `create_model`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer plano sobre tokens de parches volumétricos (Volume Transformer) |
| Parámetros totales | 23.591.315 (23,6 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión 3D, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros datos técnicos declarados en la model card: 4 canales de entrada (x, y, z, intensidad), 19 clases de salida, 128 dimensiones de característica y un tamaño de repositorio de 0,1 GB.

## Arquitectura y entrenamiento

El modelo es un transformer "vanilla" que opera sobre tokens de parches volumétricos: la nube de puntos se divide en volúmenes regulares y cada parche se proyecta a un token, sobre el que se aplica atención estándar. La implementación depende de `flash-attn` y de kernels exclusivos de GPU, lo que condiciona el despliegue a hardware CUDA. La dimensión de características es de 128 y la cabeza de clasificación produce 19 clases, correspondientes a las categorías de SemanticKITTI.

El entrenamiento se realizó sobre SemanticKITTI, el benchmark de segmentación semántica de secuencias LiDAR. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de refinamiento posteriores (RLHF, DPO u otras), por lo que esos datos deben considerarse no disponibles. El checkpoint es una conversión del original publicado por Kadir Yilmaz bajo licencia MIT, adaptado al formato de la librería torch-pointcloud.

## Capacidades

- Segmentación semántica de nubes de puntos LiDAR en 19 clases (vehículos, peatones, vegetación, edificaciones, etc. según la taxonomía de SemanticKITTI).
- Procesamiento de nubes de puntos con 4 canales de entrada: coordenadas x, y, z e intensidad.
- Extracción de características: el método `forward_features` devuelve un vector de 128 dimensiones por punto, útil para tareas aguas abajo (detección, clustering, recuperación).
- Reconfiguración de la cabeza de clasificación mediante `reset_classifier(num_classes=0)` para uso como extractor puro.
- Inferencia por lotes con soporte de `collate` para múltiples muestras.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión 3D.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- **Percepción LiDAR en conducción autónoma**: el modelo segmenta cada punto de la nube en 19 clases, lo que permite a un vehículo autónomo distinguir carretera, vehículos, peatones y vegetación en tiempo real. Su tamaño de 23,6 M de parámetros lo hace viable en GPUs de a bordo con presupuesto de cómputo limitado.
- **Etiquetado semiautomático de datasets**: dado su mIoU de 69,42 en SemanticKITTI, puede usarse como preetiquetador para reducir el coste de anotación manual de nuevas secuencias LiDAR, con revisión humana posterior.
- **Robótica móvil y navegación**: un robot terrestre o aéreo puede emplear el modelo para construir mapas semánticos del entorno y planificar rutas evitando obstáculos clasificados como personas o vehículos.
- **Extracción de características para tareas aguas abajo**: mediante `forward_features` se obtienen embeddings de 128 dimensiones por punto que alimentan clasificadores de detección de objetos 3D, segmentación de instancias o agrupamiento no supervisado.
- **Investigación en arquitecturas 3D**: al ser un transformer "vanilla" sobre parches volumétricos, sirve como línea base reproducible para comparar frente a sparse convolutions y modelos con atención dispersa en SemanticKITTI.
- **Análisis de escenas urbanas y gemelos digitales**: segmentación de nubes de puntos capturadas con LiDAR terrestre o móvil para inventariar mobiliario urbano, señalización y estructura viaria en modelos digitales de ciudades.
- **Control de calidad en pipelines de datos 3D**: detección de anomalías o puntos mal etiquetados comparando la predicción del modelo con anotaciones existentes en un dataset.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| SemanticKITTI (validación, simple) | mIoU | 69,42 |
| SemanticKITTI (validación, simple) | OA (accuracy global) | 92,64 |

La model card indica además que los autores reportan 69,39 mIoU en una sola pasada y 70,30 mIoU con test-time augmentation de 10 vistas. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; con 23,6 M de parámetros en fp32 el peso ocupa unos 94 MB, por lo que la VRAM dominante proviene de las activaciones y del tamaño de la nube de puntos procesada (el ejemplo usa 8192 puntos).
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA compatible con `flash-attn`; se requiere GPU (los kernels son GPU-only, según la model card). Para entrenamiento o lotes grandes, A100 o H100; para inferencia, RTX 4090, RTX 3090 o superiores.
- **¿Cabe en GPU de consumo?**: sí, con margen amplio; el checkpoint es de 0,1 GB y el modelo tiene 23,6 M de parámetros, por lo que una RTX 3060 o superior debería ser suficiente para inferencia con lotes moderados.
- **Opciones de despliegue**: la vía oficial es la librería `torch-pointcloud` (`pip install torch-pointcloud`) con `tp.create_model(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos de lenguaje y no aplican aquí.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos de segmentación semántica de nubes de puntos (como Cylinder3D, SPVCNN, MinkowskiNet o RangeNet++) que permitan una comparación numérica fiable. Se indica a continuación la comparación cualitativa posible:

| Modelo | Parámetros | Contexto/entrada | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| volt-s.semantickitti.kadir-yilmaz | 23,6 M | nube de puntos (4 canales) | 69,42 (simple) / 70,30 (TTA 10 vistas) | MIT | HuggingFace, torch-pointcloud |
| Alternativas (Cylinder3D, SPVCNN, MinkowskiNet, RangeNet++) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos del dataset**: entrenado exclusivamente con SemanticKITTI, capturado en entornos urbanos y rurales de Alemania; puede generalizar mal a otras geografías, sensores LiDAR, densidades de puntos o condiciones meteorológicas.
- **Riesgo de error en clases raras**: con un mIoU de 69,42 y 19 clases, es esperable un rendimiento desigual entre clases frecuentes (carretera, vegetación) y minoritarias (motociclistas, personas), aunque el desglose por clase no está disponible.
- **Dependencia de hardware**: requiere GPU con CUDA y `flash-attn` compilado para la versión concreta de PyTorch y CUDA, lo que complica el despliegue en entornos con versiones fijas.
- **Sin cuantizaciones documentadas**: no se ofrecen pesos GGUF, ONNX ni versiones cuantizadas, lo que limita el despliegue en CPU o en dispositivos embebidos.
- **Idioma y modalidad**: no procesa texto ni imágenes 2D; cualquier caso de uso lingüístico está fuera de su alcance.
- **Licencia MIT**: permisiva para uso comercial, pero conviene revisar las licencias del dataset SemanticKITTI y de la implementación de `flash-attn` para producción.
- **Métricas no verificadas**: los resultados del model-index están marcados como `verified: false`; proceden del propio autor y no de un leaderboard independiente.
- **Conversión de terceros**: el checkpoint es una conversión de torch-pointcloud sobre el original de Kadir Yilmaz; pueden existir diferencias numéricas menores respecto al modelo de referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/volt-s.semantickitti.kadir-yilmaz
- Modelo original: https://huggingface.co/KadirYilmaz/Volt
- Paper: https://arxiv.org/abs/2604.19609
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/latest/installation/
- Dataset SemanticKITTI: http://semantic-kitti.org/
