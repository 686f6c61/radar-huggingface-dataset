# weecology/everglades-bird-airplane

## Resumen

Everglades bird airplane es un detector de objetos de una sola clase (`Bird`) basado en RetinaNet, desarrollado por el laboratorio Weecology (Universidad de Florida) y publicado en Hugging Face bajo la librería DeepForest. El modelo detecta aves zancudas en fotografías oblicuas y nadirales tomadas desde una avioneta de ala fija sobre colonias de nidificación de los Everglades, con una cámara Nikon DSLR que produce imágenes de 8256 × 5504 píxeles. Es un ajuste fino ligero del checkpoint `weecology/deepforest-bird`, especializado para esta cámara y altitud concretas.

El modelo resuelve un problema de ecología cuantitativa: contar aves en imágenes aéreas de alta resolución de forma automática, sustituyendo el conteo manual en Photoshop. Con 32,25 millones de parámetros totales y un cuerpo ResNet-50 congelado, es un modelo pequeño y ligero (repo de 0,1 GB) pensado para inferencia por teselas de 800 px. Su relevancia es acotada: no es un modelo de propósito general, sino una herramienta de nicho para un pipeline ecológico concreto, con cobertura de una sola temporada y una sola cámara.

La arquitectura es un detector RetinaNet con backbone ResNet-50 y FPN, donde solo se entrenan el FPN y las cabezas de detección (8,7 M de 32,1 M de parámetros). El modelo se distribuye con licencia MIT y pesos en formato safetensors, y su evaluación se limita a una única foto retenida con 115 aves, por lo que sus métricas deben interpretarse como una comprobación aproximada y no como un benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet con backbone ResNet-50 y FPN |
| Parametros totales | 32.254.189 |
| Parametros activos | no disponible (no es MoE); 8,7 M entrenables (FPN y cabezas) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un detector RetinaNet de una sola clase (`Bird`) con backbone ResNet-50 congelado y una FPN más cabezas de detección entrenables (8,7 M de 32,1 M de parámetros). Parte del checkpoint `weecology/deepforest-bird` (refs/pr/5), previamente ajustado con imágenes de dron de los Everglades. El entrenamiento usó SGD con momentum 0,9, learning rate 1e-4 con decaimiento coseno hasta 1e-6 durante 30 épocas y batch size 8, con aumentación de datos basada en volteos horizontal y vertical y rotación de ±15°. Se conservó el checkpoint de la época 15, el de mejor mAP@50 en validación.

Los datos de entrenamiento son 13 fotografías aéreas de 11 colonias tomadas entre marzo y abril de 2022, con 2003 aves contadas manualmente en Photoshop. Cada punto de conteo se convirtió en una caja cuadrada de 50 o 60 px (tamaño fijado por foto), y las imágenes se cortaron en teselas de 800 px con 10 % de solapamiento, conservando las teselas vacías. El conjunto de entrenamiento quedó en 12 fotos y 1152 teselas (370 con aves, 2408 cajas), y la validación en una foto retenida (DSC_2226, 3B Boat Ramp, 115 aves). Las especies se colapsaron en una única clase `Bird`: garceta grande, garceta nivosa, cigüeña americana, ibis blanco, garza azulada, garceta blanca pequeña, garceta azul, anhinga y espátula rosada.

## Capacidades

- Detección de objetos de una sola clase (`Bird`) en imágenes aéreas de alta resolución (8256 × 5504 px) tomadas desde avioneta.
- Inferencia por teselas mediante `predict_tile` con `patch_size=800` y `patch_overlap=0.1`, que es el modo de uso previsto.
- Ajuste de umbral de confianza (`score_thresh` ≈ 0,1) y de IoU (`iou_threshold` ≈ 0,15) para controlar la sensibilidad de la detección.
- Integración con la librería DeepForest (`deepforest.main.deepforest`), que carga el modelo directamente desde Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la detección de aves en este dominio concreto.

## Casos de uso

- **Conteo automatizado de aves en colonias de nidificación:** el modelo detecta aves en fotografías aéreas de los Everglades y permite sustituir el conteo manual en Photoshop por un recuento automático sobre teselas de 800 px, reduciendo el esfuerzo humano en campañas de monitorización.
- **Monitorización ecológica de poblaciones de aves zancudas:** integrado en un pipeline de DeepForest, permite procesar lotes de fotografías de una campaña (marzo-abril) y estimar abundancias relativas por colonia para estudios de dinámica poblacional.
- **Procesamiento por teselas de imágenes de muy alta resolución:** con `predict_tile` y `patch_size=800`, el modelo gestiona imágenes de 8256 × 5504 px que no caben en memoria de una sola pasada, lo que lo hace adecuado para pipelines de teledetección con imágenes de gran formato.
- **Investigación en ecología cuantitativa:** sirve como punto de partida para ajustes finos sobre nuevas cámaras, altitudes o especies, ya que el cuerpo ResNet-50 está congelado y solo se reentrenan FPN y cabezas, lo que reduce el coste de adaptación.
- **Validación cruzada de conteos manuales:** al comparar las detecciones con anotaciones humanas en una foto retenida, el modelo puede usarse como segunda opinión para detectar errores u omisiones en los conteos manuales de una campaña.
- **Prototipado rápido en proyectos de conservación:** su tamaño reducido (0,1 GB de repo, 32 M de parámetros) y la licencia MIT permiten desplegarlo en entornos de investigación con recursos limitados y sin restricciones de uso comercial.
- **Docencia y experimentación con detectores en imágenes aéreas:** por su simplicidad y su model card detallada, es útil como ejemplo práctico de ajuste fino de RetinaNet en un dominio de teledetección con anotaciones sintéticas.

## Benchmarks y rendimiento

Evaluación sobre la foto retenida DSC_2226 (8256 × 5504 px, 115 aves), con `predict_tile` (teselas de 800 px, 10 % de solapamiento) y umbral de mejor F1 de 0,1 para ambos modelos:

| Modelo | IoU | Precision | Recall | F1 | Predichas / reales |
|---|---|---|---|---|---|
| Checkpoint inicial | 0,3 | 0,35 | 0,27 | 0,31 | 88 / 115 |
| **Este modelo** | 0,3 | **0,64** | **0,58** | **0,61** | 104 / 115 |
| Checkpoint inicial | 0,4 | 0,23 | 0,17 | 0,20 | 88 / 115 |
| **Este modelo** | 0,4 | **0,47** | **0,43** | **0,45** | 104 / 115 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un detector de objetos.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma explícita; con 32,25 M de parámetros y backbone ResNet-50, la inferencia en fp32 requiere del orden de cientos de MB, aunque no se especifica una cifra oficial.
- **GPU recomendadas:** no disponible; por tamaño, cualquier GPU con suficiente memoria para procesar teselas de 800 px debería ser suficiente, pero el autor no indica modelos concretos.
- **Consumer GPU:** no disponible de forma explícita; el tamaño del modelo (0,1 GB de repo) sugiere que cabe en GPUs de consumo, pero no se confirma en la información proporcionada.
- **Opciones de despliegue:** librería DeepForest (`deepforest.main.deepforest` con `load_model("weecology/everglades-bird-airplane")`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de visión.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **everglades-bird-airplane** (este modelo) | 32,25 M | no aplica | F1 0,61 (IoU 0,3) en una foto retenida | MIT | Hugging Face |
| weecology/deepforest-bird (checkpoint inicial) | no disponible | no aplica | F1 0,31 (IoU 0,3) en la misma foto | no disponible | Hugging Face |
| Otros detectores de aves en imágenes aéreas | no disponible | no aplica | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el checkpoint inicial del que deriva, ya que no se han identificado en la información proporcionada otros modelos comparables de la misma categoría con datos públicos.

## Limitaciones y advertencias

- **Evaluación muy limitada:** las métricas provienen de una sola foto con 115 aves, mayoritariamente garcetas grandes; deben tratarse como una comprobación aproximada, no como un benchmark.
- **Cajas de entrenamiento sintéticas:** las anotaciones son cuadrados de tamaño fijo alrededor de puntos de conteo, a menudo 10-20 px desviados del ave; las cajas predichas tienden a centrarse en el ave, por lo que las métricas basadas en IoU subestiman el rendimiento y los bordes de las cajas no aportan información de tamaño.
- **Puntuaciones de confianza bajas:** el máximo en la foto retenida es aproximadamente 0,22; es necesario usar `score_thresh` ≈ 0,1, ya que con los valores por defecto de DeepForest se devuelven pocas o ninguna ave.
- **Cobertura estrecha:** el entrenamiento cubre una sola cámara, una sola temporada (2022) y 12 fotos; se esperan resultados peores en otras altitudes, ángulos o condiciones de iluminación.
- **Modelo infraintrenado:** es el primer ajuste fino, deliberadamente suave, y el autor advierte que revisiones posteriores podrían reemplazarlo.
- **Sesgos conocidos:** no se documentan sesgos específicos más allá de la sobrerrepresentación de garcetas grandes en la evaluación y la limitación de especies a una única clase `Bird`.
- **Riesgo de alucinación:** no aplica en el sentido de generación de texto, pero existe riesgo de falsos positivos y negativos en la detección, especialmente fuera del dominio de entrenamiento.
- **Licencia:** MIT, sin restricciones conocidas para uso comercial; no obstante, conviene verificar la licencia del checkpoint base `weecology/deepforest-bird`, que no se detalla en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weecology/everglades-bird-airplane
- Modelo base: https://huggingface.co/weecology/deepforest-bird
- Librería DeepForest: no disponible en la información proporcionada
- Paper de referencia: Weinstein, B.G. et al. (2022). A general deep learning model for bird detection in high-resolution airborne imagery. *Ecological Applications*, 32(8), e2694. DOI no disponible en la información proporcionada.
