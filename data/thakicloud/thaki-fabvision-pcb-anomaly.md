# ThakiCloud/Thaki-FabVision-PCB-Anomaly

## Resumen

Thaki-FabVision-PCB-Anomaly es un modelo de detección de anomalías visuales no supervisada orientado a la inspección de placas de circuito impreso (PCB). Lo desarrolla ThakiCloud y se publica como vista previa de investigación (*research preview*). El modelo combina un backbone DINOv2-large congelado con cuatro cabezas de densidad basadas en flujos normalizadores (estilo FastFlow), una por cada categoría de PCB del conjunto de datos VisA (PCB1 a PCB4). Cada cabeza se entrena únicamente con imágenes normales y produce un mapa de anomalía de 256×256 junto con una puntuación global de imagen.

La relevancia del modelo radica en su enfoque: en lugar de un clasificador de defectos supervisado, aprende la distribución de apariencia de placas correctas y señala desviaciones. Sobre el split oficial de test 1cls de VisA alcanza un AUROC de imagen medio de 0,978 y un AUROC de píxel medio de 0,991, con una latencia de inferencia de unos 27 ms por imagen en una NVIDIA B200.

Es importante subrayar que todas las métricas provienen de fotografías de VisA, no de una línea de producción SMT real. El modelo no redistribuye el backbone (se descarga de `facebook/dinov2-large` en una revisión fijada) y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone DINOv2-large congelado + cabeza de flujo normalizador 2D (FastFlow-style, 8 bloques) |
| Parámetros totales | no disponible (4 cabezas de 126 MB cada una en safetensors; backbone aparte) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 672×672 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko (según metadatos de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`heads/pcb{1..4}.safetensors`) |

## Arquitectura y entrenamiento

El modelo usa `facebook/dinov2-large` como extractor de características congelado, con entrada de 672×672 píxeles redimensionada bicúbicamente. Las características se obtienen promediando los tokens de parche de los bloques 12 y 18, lo que da un vector de 1024 dimensiones sobre una rejilla de 48×48. Sobre esas características se aplica un adaptador de estandarización por canal, fijado a partir de las estadísticas de entrenamiento y almacenado en la cabeza.

Cada cabeza es un flujo normalizador 2D de 8 bloques con la estructura ActNorm → permutación fija → acoplamiento afín, alternando kernels de 3×3 y 1×1 con dimensión oculta de 512. La salida es una verosimilitud negativa (NLL) por posición, que se interpola bilinealmente a 256×256 y se suaviza con un desenfoque gaussiano de σ=4; la puntuación de imagen es el máximo del mapa. Cada cabeza se entrena solo con imágenes normales de su categoría. La selección de checkpoint se hizo por menor NLL media en un conjunto de validación normal, y el umbral se fijó en el percentil 95 de las puntuaciones sobre imágenes normales retenidas. No se usaron defectos ni máscaras de test para ninguna decisión de diseño ni de umbral.

## Capacidades

- Detección de anomalías visuales no supervisada en placas PCB (categorías PCB1 a PCB4 de VisA).
- Generación de mapa de anomalía por píxel (256×256) además de una puntuación global de imagen.
- Segmentación implícita de regiones anómalas mediante el mapa de NLL suavizado.
- Decisión binaria normal/anómalo mediante un umbral fijo almacenado en `config.json`.
- Inferencia por línea de comandos (`inference.py`) y por API Python (`inference.load` / `inference.score`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un clasificador de tipos de defecto: solo indica dónde la imagen difiere de las placas normales de entrenamiento.

## Casos de uso

- Control de calidad en inspección visual automática (AOI): usar la cabeza correspondiente al modelo de placa para puntuar cada imagen de cámara y marcar las que superen el umbral, integrando la salida en el sistema MES de la línea.
- Triaje previo a inspección humana: el mapa de anomalía de 256×256 permite dirigir la atención del operario a la región sospechosa, reduciendo el tiempo de revisión manual.
- Detección de deriva de proceso: monitorizar la distribución de puntuaciones de imágenes normales a lo largo del turno para detectar cambios de iluminación, enfoque o calibración de cámara antes de que generen falsos positivos.
- Validación de nuevas cámaras o ópticas: entrenar una cabeza nueva sobre imágenes normales de la nueva configuración y fijar su umbral con el percentil 95 de validación, siguiendo la metodología descrita por el autor.
- Prototipado rápido en investigación: servir como línea base reproducible (Apache-2.0, pesos safetensors, inferencia en PyTorch) para comparar métodos de detección de anomalías sobre las mismas características DINOv2.
- Filtrado de datasets de entrenamiento: puntuar grandes lotes de imágenes de placas para descartar o aislar ejemplares atípicos antes de usarlos en otros pipelines supervisados.
- Despliegue en estación de inspección con GPU única: con 1,67 GiB de memoria pico y ~27 ms por imagen en B200, es viable en modo batch 1 sobre una GPU de gama media-alta.

## Benchmarks y rendimiento

Resultados sobre el split oficial de test 1cls de VisA, evaluados una sola vez tras fijar modelo y umbral:

| Categoría | AUROC imagen | AP imagen | AUROC píxel | AUPRO (FPR≤0,3) | FPR normal @umbral | TPR defecto @umbral |
|---|---|---|---|---|---|---|
| pcb1 | 0,973 | 0,972 | 0,997 | 0,976 | 0,080 | 0,91 |
| pcb2 | 0,970 | 0,966 | 0,988 | 0,954 | 0,040 | 0,90 |
| pcb3 | 0,985 | 0,985 | 0,988 | 0,941 | 0,079 | 0,93 |
| pcb4 | 0,985 | 0,983 | 0,992 | 0,951 | 0,050 | 0,93 |
| **Media** | **0,978** | **0,976** | **0,991** | **0,956** | **0,062** | — |

Tamaños de test: 100 imágenes defectuosas y 100–101 normales por categoría.

Línea base con las mismas características (PatchCore con pooling 3×3, coreset voraz del 10 %, 1-NN): AUROC de imagen medio 0,871, AUROC de píxel 0,981, AUPRO 0,817. El autor advierte que no es el PatchCore habitual con WideResNet-50, por lo que la comparación solo indica que la cabeza de flujo aprovecha mejor estas características que el scoring por vecino más cercano.

Latencia: mediana de ~27 ms por imagen (batch 1, proceso nuevo, NVIDIA B200), memoria pico de inferencia 1,67 GiB. La recarga de los pesos publicados reproduce exactamente las puntuaciones de evaluación (error relativo máximo 0,0).

## Requisitos de hardware

- VRAM estimada: 1,67 GiB de memoria pico de inferencia en batch 1 (medido en B200, incluyendo backbone).
- GPU recomendadas: NVIDIA B200 (medición oficial); cualquier GPU con al menos ~2–4 GiB libres de VRAM debería poder ejecutar la inferencia en precisión nativa.
- Cabe en GPU de consumo: sí, con margen amplio (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, etc.), aunque no se han publicado mediciones en estas tarjetas.
- Opciones de despliegue: PyTorch nativo con `transformers>=4.45`, `safetensors`, `pillow` y `numpy`; el autor no menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ~27 ms por imagen en B200 batch 1; no se han publicado cifras de throughput agregado ni de latencia en otras GPU.
- Almacenamiento: repositorio de 0,5 GB (4 cabezas de 126 MB); el backbone se descarga aparte desde `facebook/dinov2-large`.

## Comparativa con modelos similares

| Modelo | Enfoque | Backbone | Contexto / entrada | Rendimiento VisA PCB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaki-FabVision-PCB-Anomaly | Flujo normalizador + DINOv2 congelado | DINOv2-large | 672×672 | AUROC imagen 0,978 (media PCB1–4) | Apache-2.0 | Hugging Face |
| PatchCore (mismas características, línea base del autor) | Memoria de vecinos más cercanos | DINOv2-large | 672×672 | AUROC imagen 0,871; píxel 0,981; AUPRO 0,817 | Apache-2.0 (implementación) | Código abierto |
| PatchCore estándar (WideResNet-50) | Memoria de vecinos más cercanos | WideResNet-50 | no disponible | no disponible en la información proporcionada | Apache-2.0 | Código abierto |
| Otros métodos de detección de anomalías VisA | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones con otros modelos publicados de detección de anomalías en PCB dentro de la información proporcionada.

## Limitaciones y advertencias

- **Alcance restringido a VisA**: solo cuatro tipos de placa y una única configuración de adquisición. Un tablero, cámara, lente, iluminación o resolución distintos requieren entrenar una cabeza nueva con imágenes normales de esa línea y recalibrar el umbral.
- **Fotos casi duplicadas en VisA**: el conjunto fotografía repetidamente el mismo diseño con la misma cámara, por lo que train y test son muy similares (miles de pares casi duplicados por hash perceptual por categoría, sin duplicados exactos). En una línea real con deriva, las puntuaciones probablemente serán inferiores.
- **Inestabilidad de entrenamiento**: la pérdida de validación de la cabeza pcb4 tuvo un salto tardío; la regla de selección eligió la época 30. No se repitieron entrenamientos con otras semillas.
- **Umbral con ~5 % de falsos positivos por diseño**: el punto de operación debe ajustarse al coste relativo de falsos negativos y falsos positivos de cada línea.
- **No es un clasificador de defectos**: indica dónde la imagen difiere de las placas normales, pero no nombra el tipo de defecto.
- **Riesgo de alucinación**: al ser un modelo de scoring por densidad, puede marcar como anómalas variaciones legítimas no vistas en entrenamiento (cambios de serigrafía, lotes de componentes distintos) y generar falsos positivos sistemáticos.
- **Sesgos de dominio**: el modelo hereda los sesgos del backbone DINOv2 y del conjunto VisA (predominantemente coreano/asiático en origen), lo que puede afectar a la generalización a otras poblaciones de placas.
- **Licencia**: Apache-2.0 permite uso comercial, pero el backbone DINOv2 se descarga por separado bajo su propia licencia Apache-2.0; conviene verificar la revisión fijada (`47b73eefe95e8d44ec3623f8890bd894b6ea2d6c`) en producción.
- **Vista previa de investigación**: sin garantías de soporte, mantenimiento ni validación en entornos industriales reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-FabVision-PCB-Anomaly
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-FabVision-PCB-Anomaly/blob/main/MODEL_CARD.ko.md
- Backbone DINOv2-large: https://huggingface.co/facebook/dinov2-large
- Conjunto de datos VisA (SPot-the-Difference): https://github.com/amazon-science/spot-diff
- Paper de VisA (Zou et al., ECCV 2022): https://arxiv.org/abs/2201.00470
- Paper de DINOv2 (Oquab et al., 2023): https://arxiv.org/abs/2304.07193
