# WhynotGPT/A100-Dinov3-H-SFT

## Resumen

A100-Dinov3-H-SFT es un modelo de estimación de pose de manos egocéntrica (egocentric hand pose estimation) desarrollado por WhynotGPT. Se trata de un fine-tuning supervisado (SFT) del backbone DINOv3 ViT-H/16+ de Meta (facebook/dinov3-vith16plus-pretrain-lvd1689m), adaptado a la predicción de joints, vértices y parámetros del modelo MANO para ambas manos en coordenadas de cámara, a partir de clips RGB y, opcionalmente, mapas de profundidad.

El modelo resuelve el problema de reconstrucción 3D de manos en vídeo egocéntrico (primera persona), una tarea crítica para realidad aumentada/virtual, robótica de manipulación, análisis de actividades de la vida diaria y teleoperación. A diferencia de los enfoques que requieren recortes de mano o detección previa, este modelo procesa el clip completo con un encoder de propósito general y cabezas específicas entrenadas desde cero sobre las características de DINOv3.

La relevancia actual viene de dos factores: por un lado, aprovecha DINOv3, un backbone de visión auto-supervisado de última generación; por otro, publica múltiples checkpoints intermedios (50K, 72.25K, 90K, 100K pasos) con métricas detalladas por dataset (H2O, ARCTIC, EgoRenderer) y paquetes de inferencia autocontenidos, lo que facilita la reproducibilidad y la comparación entre checkpoints. El repositorio ocupa 82.3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-H/16+ (DINOv3) como backbone congelado/solo encoder transferido + proyección, MoT, módulo temporal y cabezas específicas (joints, vértices, MANO, presence) inicializadas desde cero |
| Parametros totales | no disponible (el repo pesa 82.3 GB; cada paquete de inferencia ~3.53 GB, 900 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; ventana temporal T=8 frames (clips de N=1..8 imágenes) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, presumiblemente fp32/fp16; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de visión, sin entrada de texto) |
| Licencia | no disponible en la información proporcionada; se indica que aplican los términos de DINOv3 y MANO |
| Formato de pesos | PyTorch (checkpoints .pt/.pth; paquetes de inferencia con inference.py, configuración y calibración de presence) |

## Arquitectura y entrenamiento

El modelo parte del backbone DINOv3 ViT-H/16+ preentrenado por Meta. Durante el SFT solo se transfiere `encoder.backbone`; el resto de componentes (proyección, módulo MoT, capa temporal, cabezas de joints/vértices/MANO y cabeza de presence) se inicializan desde cero y se entrenan. La entrada se estandariza a una cámara pinhole de primera versión con resize/pad a 512×896 manteniendo relación de aspecto; cuando se desactivan las características de cámara, la K conocida se sigue usando para el decodificado geométrico. El procesamiento es bidireccional sobre T=8 frames y no realiza un segundo recorte de la mano (no hay crop de mano posterior).

El entrenamiento se realizó sobre el dataset WhynotGPT/SFT y se documentan checkpoints entre 5K y 100K pasos (con entrenamiento continuado hasta 120K). La evaluación se hizo sobre un panel fijo de 72 clips de desarrollo (24 por fuente: H2O, ARCTIC, EgoRenderer), con T=8. No se documenta el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de las tres fuentes de evaluación. No se menciona RLHF/DPO (no aplica a una tarea de regresión geométrica). Como innovaciones destacables: uso de un backbone DINOv3 de alta capacidad, decodificación geométrica con K, cabeza de presence calibrada por checkpoint y modalidad, y paquetes de inferencia verificados tensor a tensor (900 tensores) con replay de tres modalidades.

## Capacidades

- Estimación de pose de manos egocéntrica en 3D: predice joints en coordenadas de cámara en metros para mano izquierda y derecha.
- Reconstrucción de malla: salida de vértices MANO, rotaciones MANO, parámetros de forma (shape) y máscara de visualización.
- Entrada multimodal: RGB (uint8 [N,H,W,3]) y, opcionalmente, matriz intrínseca K pinhole y profundidad Z alineada al eje óptico (uint16 mm o float m). Solo H2O dispone de profundidad en evaluación.
- Procesamiento de clips: N entre 1 y 8 frames, ventana temporal bidireccional T=8.
- Detección de presencia de mano: cabeza de presence con umbral calibrado por checkpoint y modalidad.
- Sin dependencia de recortes de mano: procesa la imagen completa con resize/pad.
- No soporta tool calling, agentes, texto, audio ni razonamiento simbólico (es un modelo puramente viso-geométrico).
- Capacidades multilingües: no aplica.

## Casos de uso

- Análisis de actividades de la vida diaria (ADL) en vídeo egocéntrico: el modelo reconstruye la pose 3D de ambas manos frame a frame, permitiendo segmentar acciones de manipulación de objetos en datasets como H2O o ARCTIC.
- Teleoperación de robots con cámaras en primera persona: las salidas de joints y vértices en coordenadas de cámara en metros permiten mapear el movimiento humano a un efector robótico; la ventana T=8 suaviza la señal temporal.
- Realidad aumentada/virtual: superponer elementos virtuales anclados a las manos del usuario requiere pose 3D estable; el modelo entrega rotaciones MANO y shape para renderizado consistente.
- Rehabilitación y análisis clínico del movimiento de manos: la métrica PA-MPJPE (~8 mm) y la reconstrucción de vértices permiten cuantificar rangos de movimiento y temblor en grabaciones egocéntricas.
- Anotación automática de datasets: predecir joints/vértices MANO sobre clips nuevos para preetiquetar y acelerar la revisión humana, usando la cabeza de presence para filtrar frames sin mano.
- Investigación en estimación de pose egocéntrica: servir como baseline reproducible con checkpoints públicos (50K–100K) y métricas por dataset para comparar variantes de backbone, modalidad (RGB vs RGBD) y ventana temporal.
- Sistemas de captura de movimiento con una sola cámara: reconstrucción de manos sin marcadores en entornos no controlados, con salida métrica en metros.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un panel fijo de 72 clips de desarrollo (24 por fuente, T=8), en mm (menor es mejor). Media equitativa de tres datasets:

| Checkpoint | Abs MPJPE | Root MPJPE | PA-MPJPE | MPVPE |
|---|---:|---:|---:|---:|
| 72.25K | 26.215 | 16.771 | 7.991 | 25.989 |
| 100K | 27.567 | 16.725 | 7.967 | 27.333 |
| 90K | 26.844 | 16.668 | 7.990 | 26.624 |
| 50K | 26.269 | 17.207 | 8.074 | 26.059 |

Desglose del checkpoint 100K por dataset:

| Dataset | Abs MPJPE | Root MPJPE | PA-MPJPE | MPVPE |
|---|---:|---:|---:|---:|
| H2O | 18.872 | 12.373 | 5.291 | 18.729 |
| ARCTIC | 30.363 | 19.778 | 10.245 | 29.975 |
| EgoRenderer | 33.466 | 18.024 | 8.364 | 33.295 |

Notas metodológicas: Root MPJPE resta solo la muñeca correspondiente; PA-MPJPE ajusta por frame y mano traslación, rotación SO(3) y escala uniforme, sin reflexión. Los denominadores geométricos incluyen todas las manos GT válidas registradas (354 / 273 / 155 manos-frame para H2O / ARCTIC / EgoRenderer). La calibración de presence proviene del mismo panel de desarrollo, no de un test independiente. El autor advierte que estos resultados no constituyen un benchmark independiente completo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Cada paquete de inferencia pesa ~3.53 GB en disco; con backbone ViT-H/16+ y procesamiento de clips T=8, se requiere una GPU con memoria suficiente para cargar los pesos y activaciones (orientativo: 16–24 GB en fp16, aunque el autor no lo especifica).
- GPU recomendadas: no documentadas por el autor; el nombre del modelo ("A100") sugiere entrenamiento/inferencia en NVIDIA A100. Por tamaño, cabría esperar H100, A100 40/80 GB y RTX 4090 (24 GB) como candidatas, pero no hay confirmación.
- ¿Cabe en GPU de consumo? No confirmado. El repo es de 82.3 GB (incluye múltiples checkpoints); un solo paquete de inferencia (~3.53 GB) podría caber en GPUs de consumo con suficiente VRAM, pero no se aporta dato oficial.
- Despliegue: el autor proporciona `inference.py`, `smoke_test.py`, `requirements.txt` y `verification.json` por checkpoint; se usa PyTorch con build CUDA adecuado al driver y Python 3.11. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la información proporcionada. El autor solo compara entre sus propios checkpoints (50K, 72.25K, 90K, 100K) sobre el mismo panel de desarrollo. No hay datos frente a otros estimadores de pose de manos egocéntricos (por ejemplo, variantes de H2O/ARCTIC o métodos basados en MANO) en la información disponible.

| Modelo | Parametros | Contexto/ventana | PA-MPJPE (media 3 datasets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A100-Dinov3-H-SFT (100K) | no disponible | T=8 frames | 7.967 mm | no disponible | Hugging Face (repo 82.3 GB) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre H2O, ARCTIC y EgoRenderer, el rendimiento puede degradarse en dominios visuales distintos (iluminación, cámaras, entornos).
- Riesgo de alucinación: en un modelo de regresión geométrica, el equivalente es predecir manos inexistentes o poses plausibles pero incorrectas; la cabeza de presence mitiga parcialmente este riesgo, pero su calibración proviene del panel de desarrollo y no de un test independiente.
- Limitaciones de contexto/idioma: ventana temporal fija T=8; no hay evaluación de generalización a lentes de ojo de pez nativas (el autor lo indica explícitamente). Solo H2O incluye profundidad en evaluación.
- Restricciones de licencia: la licencia del modelo no está disponible en la información proporcionada. Se indica que siguen aplicando los términos de DINOv3 (Meta) y de MANO; es imprescindible revisarlos antes de uso comercial.
- Caveats para producción: los checkpoints de inferencia no permiten reanudar el entrenamiento AdamW (se omiten optimizer/RNG); los resultados son de un panel de desarrollo, no de un benchmark independiente; el entrenamiento continuaba hasta 120K en el momento de la publicación; los checkpoints 85K y 103K solo tienen logs de validación sin pesos guardados.
- Tamaño del repositorio: 82.3 GB, lo que complica la descarga y el almacenamiento; conviene usar `allow_patterns` para bajar solo el checkpoint deseado.
- Sin descargas ni likes registrados: modelo muy reciente y sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT
- Modelo base DINOv3: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Dataset de SFT: https://huggingface.co/datasets/WhynotGPT/SFT
- Checkpoint 72.25K: https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/tree/main/checkpoints/step_0072250
- Checkpoint 100K: https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/tree/main/checkpoints/step_0100000
- Checkpoint 90K: https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/tree/main/checkpoints/step_0090000
- Checkpoint 50K: https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/tree/main/checkpoints/step_0050000
- Métricas completas (CSV): https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/blob/main/evaluation/20261030/metrics.csv
- Resumen JSON: https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/blob/main/evaluation/20261030/summary.json
- Resumen en chino: https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/blob/main/evaluation/20261030/README_ZH.md
- Curvas (PNG): https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/blob/main/evaluation/20261030/trends.png
- Curvas (PDF): https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/blob/main/evaluation/20261030/trends.pdf
- Notas del checkpoint histórico 30K: https://huggingface.co/WhynotGPT/A100-Dinov3-H-SFT/blob/main/historical_30K.md
