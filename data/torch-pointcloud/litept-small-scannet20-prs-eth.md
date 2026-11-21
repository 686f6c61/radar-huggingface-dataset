# torch-pointcloud/litept-small.scannet20.prs-eth

## Resumen

litept-small.scannet20.prs-eth es un modelo de segmentación semántica de nubes de puntos 3D desarrollado por el grupo de investigación prs-eth (ETH Zúrich) y convertido al ecosistema torch-pointcloud por Arthur Dujardin. Implementa la arquitectura LitePT, presentada en el artículo "LitePT: Lighter Yet Stronger Point Transformer" (CVPR 2026), que combina convoluciones en las etapas iniciales de la red con atención con embedding rotacional 3D en las etapas finales. El modelo está entrenado sobre el conjunto de datos ScanNet con 20 clases semánticas de interiores.

Con solo 12,7 millones de parámetros, el modelo logra un mIoU de 76,55 y una precisión global (OA) de 91,42 sobre ScanNet-20, lo que lo sitúa como una alternativa muy ligera frente a transformers de puntos de mayor tamaño. Su relevancia actual radica en que demuestra que es posible obtener un rendimiento competitivo en segmentación 3D con un coste computacional reducido, lo que facilita el despliegue en entornos con recursos limitados.

El checkpoint se distribuye en formato safetensors (0,1 GB) bajo licencia MIT y está pensado para su uso con la librería torch-pointcloud, que requiere kernels GPU específicos (spconv y flash-attn). No es un modelo de lenguaje: es un modelo puramente de visión 3D para segmentación por punto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LitePT (convoluciones en etapas tempranas + atención con embedding rotacional 3D en etapas tardías) |
| Parámetros totales | 12.718.592 (12,7 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa nubes de puntos, no secuencias de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posición, color y normal) |
| Clases de salida | 20 (ScanNet-20) |
| Dimensión de features | 72 |
| Librería | torch-pointcloud |

## Arquitectura y entrenamiento

LitePT es un transformer de puntos híbrido: las primeras etapas emplean convoluciones (implementadas con spconv sobre representaciones dispersas) para extraer características locales de forma eficiente, mientras que las etapas finales usan mecanismos de atención con embedding rotacional 3D (3D rotary embedding), lo que aporta capacidad de modelado global con un coste menor que un transformer puro. El modelo acepta 6 canales de entrada (coordenadas xyz, color RGB y normales) y produce logits por punto para 20 clases semánticas. La dimensión interna de características es de 72.

El entrenamiento se realiza sobre ScanNet (20 clases), el conocido conjunto de reconstrucciones 3D de interiores anotado densamente. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables en este dominio) ni aumentos de datos específicos; esos datos figuran como no disponibles. La innovación principal del trabajo es la propia arquitectura LitePT, que busca reducir el número de parámetros y el coste de cómputo manteniendo la precisión de transformers de puntos más pesados.

## Capacidades

- Segmentación semántica de nubes de puntos 3D por punto (20 clases de interiores de ScanNet).
- Procesamiento de nubes de puntos con información de posición, color y normales (6 canales de entrada).
- Extracción de características (features) de 72 dimensiones por punto mediante `forward_features` o reseteando el clasificador.
- Inferencia sobre lotes de nubes de puntos con collate y transformaciones integradas en torch-pointcloud.
- Ejecución exclusiva en GPU (kernels GPU-only: spconv y flash-attn).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión 2D, audio o thinking mode: es un modelo especializado de visión 3D.

## Casos de uso

- Segmentación de escenas de interior para robótica móvil: el modelo etiqueta cada punto de una nube captada por LiDAR o RGB-D en clases como suelo, pared, mesa o silla, lo que permite a un robot doméstico construir mapas semánticos con solo 12,7 M de parámetros y desplegarse en plataformas embebidas con GPU.
- Reconstrucción 3D y modelado BIM: a partir de escaneos de interiores se pueden separar elementos estructurales y mobiliario, facilitando la generación automática de planos o modelos de información de edificios.
- Realidad aumentada y virtual: segmentar la escena en tiempo real para ocluir objetos virtuales detrás de geometría real o para aplicar efectos por categoría (por ejemplo, recolorear paredes o sustituir muebles).
- Anotación asistida de datasets 3D: el modelo puede preetiquetar nubes de puntos antes de la revisión humana, reduciendo el coste de anotación en proyectos de percepción 3D.
- Navegación autónoma de drones o vehículos en interiores: la segmentación por punto permite identificar superficies transitables y obstáculos en entornos como almacenes o plantas industriales.
- Extracción de features para tareas downstream: gracias a `forward_features`, se pueden obtener embeddings de 72 dimensiones por punto para entrenar clasificadores ligeros, detectores o modelos de completado de nubes de puntos.
- Control de calidad en escaneos 3D: detectar regiones mal etiquetadas o anomalías geométricas comparando la predicción semántica con la geometría esperada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| ScanNet (20 clases) | mIoU | 76,55 |
| ScanNet (20 clases) | OA (accuracy) | 91,42 |

No se han publicado en la información disponible resultados comparativos adicionales (por ejemplo, frente a PointNet++, Point Transformer o MinkowskiNet) ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 12,7 M de parámetros (aproximadamente 50 MB en fp32) y nubes de hasta decenas de miles de puntos, el consumo debería ser moderado, pero depende del tamaño del lote y del número de puntos por muestra.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA y con soporte para spconv y flash-attn; se recomienda una GPU moderna (por ejemplo, RTX 3090/4090, A100, H100) para compilar y ejecutar los kernels de forma estable.
- ¿Cabe en GPU de consumo? Sí, por tamaño de modelo; el límite práctico lo imponen los requisitos de compilación de spconv y flash-attn y la memoria necesaria para nubes de puntos grandes.
- Opciones de despliegue: torch-pointcloud (librería oficial del checkpoint); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisitos adicionales: `pip install torch-pointcloud` más `spconv` y `flash-attn` compilados para la versión de torch y CUDA del entorno; el modelo es GPU-only.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litept-small.scannet20.prs-eth | 12,7 M | Nube de puntos, 6 canales | mIoU 76,55 / OA 91,42 en ScanNet-20 | MIT | Hugging Face (torch-pointcloud) |
| Point Transformer (v1/v2/v3) | no disponible en la información | Nube de puntos | no disponible en la información | no disponible | Repositorios públicos |
| MinkowskiNet | no disponible en la información | Nube de puntos (vóxeles) | no disponible en la información | no disponible | Repositorios públicos |
| PointNet++ | no disponible en la información | Nube de puntos | no disponible en la información | no disponible | Repositorios públicos |

No se dispone en la información proporcionada de cifras comparativas verificadas de estos modelos sobre ScanNet-20, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado únicamente en ScanNet (interiores domésticos y de oficina) con 20 clases; el rendimiento puede degradarse en escenas exteriores, industriales o con objetos fuera de esas categorías.
- No es un modelo generativo ni lingüístico: no admite prompts de texto, tool calling ni razonamiento; cualquier expectativa de ese tipo es incorrecta.
- Requiere GPU y kernels compilados: spconv y flash-attn deben coincidir con la versión de torch y CUDA, lo que complica el despliegue y la reproducibilidad en entornos heterogéneos.
- Métricas no verificadas: los valores de mIoU y OA proceden de la model-index del autor y no han sido validados de forma independiente.
- Riesgo de sesgo hacia las distribuciones de ScanNet: clases poco representadas o geometrías atípicas pueden segmentarse de forma errónea.
- Sin información sobre cuantización: no se documentan variantes en fp16, int8 o GGUF, lo que limita opciones de optimización.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las licencias de las dependencias (spconv, flash-attn) y del dataset ScanNet, que tiene sus propios términos de uso.
- No se documentan limitaciones específicas de idioma porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/litept-small.scannet20.prs-eth
- Paper LitePT (arXiv): https://arxiv.org/abs/2512.13689
- Repositorio original LitePT (prs-eth): https://github.com/prs-eth/LitePT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanNet: https://github.com/ScanNet/ScanNet
