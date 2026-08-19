# thekman17/mcvo

## Resumen

MCVO (Image-only self-supervised visual odometry) es un transformer desarrollado como trabajo de seguimiento de una tesis de máster de la Universidad Técnica de Múnich (cátedra de Visión por Computador, Prof. Cremers). Predice la pose relativa de una cámara (rotación y traslación) entre pares de fotogramas consecutivos utilizando únicamente imágenes RGB, sin necesidad de datos etiquetados ni de sensores de profundidad en inferencia. El entrenamiento es completamente auto-supervisado: redes preentrenadas de profundidad (UniDepth) y flujo óptico (UniMatch) actúan como profesores durante el entrenamiento, supervisando una pérdida de reproyección de flujo, pero se eliminan en tiempo de inferencia, lo que reduce drásticamente el coste computacional.

El modelo combina un backbone DINOv2-base congelado (86M parámetros) con 10 bloques de atención temporal y espacial alternados, más un token de cámara por fotograma. En total tiene 154M parámetros, de los cuales 67M son entrenables. Se entrenó sobre aproximadamente 80.000 fotogramas de vídeo sin etiquetar procedentes de RealEstate10K, YouTube-VOS, EpicKitchens y WalkingTours, procesados con el pipeline de AnyCam. La relevancia actual radica en que ofrece una alternativa ligera y auto-supervisada a los métodos de odometría visual supervisados, con un rendimiento competitivo en rotación y una mejora notable en traslación en escenarios de conducción (KITTI) sin haber visto datos de conducción durante el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone DINOv2-base congelado + 10 bloques de atención temporal/espacial |
| Parametros totales | 154M (86M backbone congelado + 67M entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | N frames de entrada (típicamente 8 en entrenamiento), cada uno de 336×336 píxeles |
| Tipos de cuantizacion | No disponible (solo pesos en formato .pt) |
| Idiomas soportados | No aplica (entrada visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch .pt (state_dict + args) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de atención espacio-temporal similar al de FVO (Yugay et al., 2025), pero entrenado de forma auto-supervisada en lugar de con poses de ground truth. El backbone DINOv2-base (86M) está congelado y extrae características por fotograma. Sobre estas características, 10 bloques alternan atención temporal (entre fotogramas) y espacial (dentro de cada fotograma), con un token de cámara por fotograma de dimensión 640 y 8 cabezas de atención. La salida es una pose relativa por par de fotogramas adyacentes (cam_i → cam_{i+1}) y un mapa de incertidumbre por píxel.

El entrenamiento se realizó durante 6 épocas con clips de 8 fotogramas, batch de 4, learning rate 1.5e-4 y una pérdida de reproyección de flujo ponderada por incertidumbre, siguiendo el enfoque de AnyCam (CVPR 2025). Se usó una GPU de clase A40/H100 en el clúster SLURM de la TUM. La innovación clave es que las redes de profundidad y flujo óptico solo intervienen durante el entrenamiento; en inferencia el modelo es autónomo y no requiere ningún módulo auxiliar.

## Capacidades

- Predicción de pose relativa de cámara (rotación y traslación) entre fotogramas consecutivos a partir de imágenes RGB.
- Generación de mapas de incertidumbre por píxel, útiles para filtrar regiones poco fiables o para integrarse en esquemas de fusión probabilística.
- Inferencia sin necesidad de redes de profundidad ni flujo óptico, lo que reduce la latencia y los requisitos de memoria.
- Entrenamiento auto-supervisado: no requiere poses anotadas ni datos de profundidad, solo vídeo sin etiquetar.
- Capacidad de generalización a nuevos dominios, demostrada con zero-shot en KITTI (sin datos de conducción en el entrenamiento).
- Arquitectura ligera (154M parámetros) que permite despliegue en GPUs de consumo.

## Casos de uso

- Odometría visual para robótica móvil: el modelo puede estimar el movimiento de una cámara montada en un robot o dron a partir de imágenes, permitiendo navegación sin GPS ni sensores inerciales. Su tamaño reducido lo hace adecuado para sistemas embebidos con GPU.
- Navegación autónoma de vehículos: aunque no se entrenó con datos de conducción, el rendimiento zero-shot en KITTI (error de rotación 0.19° y error de dirección de traslación 7.0°) sugiere que puede servir como componente de odometría en entornos urbanos, complementando a otros sensores.
- Realidad aumentada y seguimiento de cámara: la estimación de pose relativa permite anclar objetos virtuales al mundo real en aplicaciones móviles o de visores AR, sin necesidad de marcadores ni calibración previa.
- Análisis de vídeo y estructuración de secuencias: la pose relativa entre fotogramas puede usarse para alinear secuencias, estabilizar vídeo o segmentar escenas en función del movimiento de la cámara.
- Sistemas de asistencia a la conducción (ADAS): la estimación de movimiento de cámara puede integrarse en sistemas de alerta de colisión o de detección de trayectoria, aunque debería combinarse con otros sensores para garantizar la seguridad.
- Investigación en auto-supervisión: el modelo sirve como referencia para estudiar los límites de la supervisión por reproyección de flujo y para desarrollar nuevas arquitecturas de odometría auto-supervisada.

## Benchmarks y rendimiento

La model card proporciona resultados con un protocolo de ventana honesta (4 fotogramas por ventana, 16 ventanas por secuencia). Se comparan el error de rotación y el error de dirección de traslación (mediana) con AnyCam (CVPR 2025) y con modelos supervisados de gran tamaño.

| Dataset | Modelo | Error de rotación (mediana) | Error de dirección de traslación (mediana) |
|---|---|---|---|
| Sintel | MCVO (este modelo) | **0.46°** | 80.8° |
| Sintel | AnyCam | 0.50° | 49.1° |
| TUM-RGBD dinámico | MCVO | 0.89° | 89.7° |
| TUM-RGBD dinámico | AnyCam | **0.74°** | 49.6° |
| KITTI odometry (zero-shot) | MCVO | **0.19°** | **7.0°** |
| KITTI odometry (zero-shot) | AnyCam | 0.20° | 28.6° |
| KITTI | VGGT (supervisado, ~1B params) | 0.12° | 4.6° |
| KITTI | π³ (supervisado) | 0.11° | 2.2° |
| KITTI | Depth Anything 3 (supervisado) | 0.09° | 1.3° |

En rotación, MCVO es competitivo con AnyCam e incluso mejor en Sintel y KITTI. En traslación, supera claramente a AnyCam en KITTI (7.0° frente a 28.6°), pero queda por detrás de los modelos supervisados de gran tamaño. En escenarios indoor de pequeño baseline (Sintel, TUM-RGBD), la dirección de traslación es casi aleatoria (80-90°), lo que se reconoce como una limitación estructural.

## Requisitos de hardware

- El modelo tiene 154M parámetros en total. En precisión fp32, los pesos ocupan aproximadamente 616 MB, por lo que la VRAM necesaria para inferencia es inferior a 1 GB, más los activaciones (depende del número de fotogramas de entrada).
- Se puede ejecutar en GPUs de consumo como RTX 3060, RTX 4060 o superiores sin problemas. Para secuencias largas o lotes grandes, se recomienda al menos 4 GB de VRAM.
- El entrenamiento se realizó en GPUs de clase A40/H100 (48-80 GB), pero no se requiere ese nivel para inferencia.
- No hay datos publicados de latencia ni throughput. La model card menciona que se está añadiendo una comparación de latencia controlada en el repositorio de GitHub (`honest_benchmarks/latency.json`), pero aún no está disponible.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con vLLM, TGI o cualquier framework que soporte transformers, aunque al no ser un modelo de lenguaje, la integración requiere un pipeline personalizado. También puede exportarse a ONNX o TensorRT para optimización en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Supervisión | Contexto | Error rotación KITTI | Error traslación KITTI | Licencia |
|---|---|---|---|---|---|---|
| MCVO (este) | 154M | Auto-supervisado | N frames | 0.19° | 7.0° | Apache-2.0 |
| AnyCam (CVPR 2025) | No disponible | Auto-supervisado | N frames | 0.20° | 28.6° | No especificada |
| VGGT | ~1B | Supervisado | N frames | 0.12° | 4.6° | No especificada |
| π³ | ~1B | Supervisado | N frames | 0.11° | 2.2° | No especificada |
| Depth Anything 3 | ~1B | Supervisado | N frames | 0.09° | 1.3° | No especificada |

MCVO se posiciona como una alternativa ligera y auto-supervisada frente a modelos supervisados mucho más grandes. Supera a AnyCam en traslación en KITTI y es comparable en rotación, aunque en interiores con pequeño baseline su traslación es deficiente. Los modelos supervisados de ~1B parámetros siguen siendo superiores, pero requieren datos etiquetados y mucho más cómputo.

## Limitaciones y advertencias

- La dirección de traslación es casi aleatoria en vídeo indoor de pequeño baseline (Sintel, TUM-RGBD), con errores de 80-90°. El autor lo atribuye a un límite estructural de la supervisión por reproyección de flujo cuando la paralaje es mínima.
- El error de trayectoria (ATE) es inferior al de AnyCam en inferencia de contexto largo (Sintel 0.18 frente a 0.10), lo que indica que la acumulación de errores puede ser mayor.
- No incluye un cabezal de intrínsecos de cámara. Para aplicaciones que requieran la focal o la matriz de calibración, debe combinarse con un modelo de calibración como `thekman17/anycam-mct`.
- El modelo se entrenó con fotogramas de 336×336 píxeles; el uso de resoluciones muy diferentes puede degradar el rendimiento.
- No se han publicado resultados en otros benchmarks (por ejemplo, EuRoC, TartanAir), por lo que la generalización a otros entornos no está validada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías. Es responsabilidad del usuario validar su comportamiento en el dominio de aplicación.
- No hay información sobre sesgos, pero al ser un modelo visual entrenado con vídeo web, podría heredar sesgos de los datos de entrenamiento (por ejemplo, dominancia de entornos urbanos o interiores).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thekman17/mcvo
- Repositorio de código, benchmark y reproducción: https://github.com/kalman17/anycam-extension (directorio `mcvo/`)
- Modelo de calibración complementario: https://huggingface.co/thekman17/anycam-mct
