# VinayYadav2004/deepfake-detector

## Resumen

Deepfake Video Detector es un clasificador binario de vídeo desarrollado por VinayYadav2004 que distingue entre clips reales y manipulados. Combina un extractor de características visuales ResNeXt-50 32×4d, inicializado con pesos ImageNet-1K V2 y ajustado finamente, con una capa LSTM de 2.048 unidades ocultas que modela la evolución temporal de los fotogramas. La salida es una decisión binaria (`Real` o `Fake`) a partir de un tensor de entrada de forma `(batch, 150, 3, 112, 112)`.

El modelo se entrenó sobre un subconjunto equilibrado de 1.200 clips (600 reales y 600 falsos) procedente del DeepFake Detection Cropped Dataset de Kaggle, derivado del Deepfake Detection Challenge (DFDC). El checkpoint se distribuye como un state dictionary de PyTorch (`deepfake_detector_best.pth`) y se acompaña de una demo en Streamlit publicada en el repositorio del autor.

Es relevante como referencia académica y educativa: el autor publicó un artículo en la conferencia ICSIT 2025 describiendo el enfoque CNN-LSTM, y el modelo alcanza un 83,33% de accuracy y un ROC AUC del 90,34% sobre su split de validación. No obstante, se trata de un artefacto de investigación con un conjunto de evaluación reducido (240 vídeos) y sin validación externa, por lo que no debe emplearse como prueba de autenticidad en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNeXt-50 32×4d + LSTM de 1 capa (híbrido convolucional-recurrente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 150 fotogramas por clip (secuencia fija) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dictionary (`.pth`) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido CNN-LSTM. Cada fotograma del clip se redimensiona a 112×112, se convierte de BGR a RGB y se escala al rango `[0, 1]`. El ResNeXt-50 32×4d, preentrenado en ImageNet-1K V2, genera un vector de 2.048 dimensiones por fotograma. La secuencia ordenada de vectores alimenta una LSTM de una capa con tamaño oculto 2.048, seguida de average pooling temporal, dropout de 0,4, activación LeakyReLU y una capa lineal de dos clases que produce los logits `Real` y `Fake`.

El entrenamiento se realizó durante 10 épocas en Google Colab sobre una GPU Tesla T4, con pérdida de entropía cruzada, optimizador Adam (learning rate `1e-5`, weight decay `1e-3`) y batch size 2. Se conservó el checkpoint con mayor accuracy de validación. El conjunto de datos es un subconjunto aleatorio equilibrado de 1.200 clips del DFDC Cropped Dataset, con semilla 42 y partición estratificada 80/20: 960 clips de entrenamiento (480 reales, 480 falsos) y 240 de validación (120 reales, 120 falsos). No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos más allá del preprocesado descrito. Los vídeos de entrenamiento contienen caras recortadas; la demo no detecta ni recorta rostros en material arbitrario.

## Capacidades

- Clasificación binaria de vídeo en las categorías `Real` y `Fake`.
- Procesamiento de secuencias de hasta 150 fotogramas; en clips más cortos se repite el último fotograma hasta completar la secuencia.
- Extracción de características visuales por fotograma mediante ResNeXt-50 y modelado de dependencias temporales mediante LSTM.
- Generación de puntuaciones softmax relativas por clase (no calibradas como probabilidades).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingües (modelo puramente visual, sin entrada de texto).
- No incorpora modo de razonamiento explícito, visión multimodal, audio ni otras modalidades adicionales.

## Casos de uso

- Investigación académica en detección de deepfakes: el modelo sirve como línea base reproducible para comparar arquitecturas CNN-LSTM sobre el dataset DFDC, dado que el autor publica el checkpoint, la definición del modelo y el cuaderno de entrenamiento.
- Docencia y demostraciones: la demo en Streamlit permite ilustrar en clase cómo un pipeline de visión por computador combina características espaciales y temporales para clasificar vídeo.
- Prototipado de sistemas de moderación de contenido: puede integrarse como primer filtro en un pipeline que marque clips sospechosos para revisión humana, siempre con la advertencia de que la predicción no constituye prueba de manipulación.
- Evaluación comparativa de preprocesados: al fijar la entrada en 150 fotogramas de 112×112, permite estudiar el impacto del recorte de caras, la compresión o la iluminación sobre el rendimiento de un detector CNN-LSTM.
- Experimentación con ajuste fino: el checkpoint puede servir de inicialización para reentrenar sobre dominios específicos (por ejemplo, un tipo concreto de manipulación facial) con conjuntos de datos propios.
- Análisis forense asistido en entornos controlados: como herramienta de apoyo en investigaciones donde un analista revisa manualmente los clips señalados por el modelo, nunca como decisión automatizada.
- Desarrollo de aplicaciones de verificación de identidad en vídeo: como componente de un sistema más amplio que combine detección de deepfakes con otras señales (metadatos, análisis de audio, coherencia temporal) antes de emitir un juicio.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de validación de 240 vídeos (120 reales, 120 falsos):

| Metrica | Resultado |
|---|---:|
| Accuracy | 83,33% |
| ROC AUC | 90,34% |
| Precision (Fake) | 82,26% |
| Recall (Fake) | 85,00% |
| F1-score (Fake) | 83,61% |

Matriz de confusión (filas: etiqueta real; columnas: predicción):

| Real \ Predicho | Real | Fake |
|---|---:|---:|
| Real | 98 | 22 |
| Fake | 18 | 102 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas sobre el split de validación interno. El propio autor advierte que el split se usó para seleccionar el checkpoint, por lo que estos valores no constituyen una estimación independiente del rendimiento en otros datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se ejecutó en una Tesla T4 (16 GB) con batch size 2, lo que sugiere que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más, aunque no se documenta una medición directa.
- GPU recomendadas: Tesla T4 (entorno de entrenamiento documentado), así como cualquier GPU con al menos 8 GB de VRAM para inferencia en FP32; no se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: previsiblemente sí en modelos como RTX 3060, 3070, 4060 o superiores, dado el tamaño del ResNeXt-50 y la LSTM de 2.048 unidades; no confirmado por el autor.
- Opciones de despliegue: PyTorch nativo y Streamlit (demo oficial del repositorio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VinayYadav2004/deepfake-detector | ResNeXt-50 + LSTM | 150 fotogramas × 112×112 | 83,33% accuracy, 90,34% ROC AUC (validación propia) | MIT | Hugging Face, pesos `.pth` |
| Alternativas de detección de deepfakes en vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo se evaluó sobre un único split de un único dataset derivado del DFDC; su rendimiento en otros conjuntos, en métodos de manipulación más recientes, en vídeo sin recorte de caras o en material real no ha sido establecido.
- El split de validación se empleó para seleccionar el checkpoint, por lo que las métricas reportadas están sesgadas al alza y no deben interpretarse como una estimación independiente.
- La demo no detecta ni recorta rostros: espera vídeos con caras ya recortadas, como los del dataset de entrenamiento. Sobre material arbitrario el rendimiento puede degradarse notablemente.
- Las puntuaciones softmax son relativas y no están calibradas como probabilidades; no deben usarse como umbrales de confianza en producción.
- La compresión de vídeo, la iluminación, la pose y la calidad de imagen pueden alterar las predicciones.
- Riesgo de sesgo: el subconjunto de entrenamiento es pequeño (960 clips) y puede no representar la diversidad demográfica, étnica o de condiciones de grabación del mundo real.
- Riesgo de alucinación en sentido amplio: el modelo puede clasificar erróneamente clips auténticos como falsos (22 falsos positivos sobre 120 reales en validación) y viceversa (18 falsos negativos sobre 120 falsos).
- La licencia MIT permite uso comercial, pero el autor restringe explícitamente el uso previsto a investigación, educación y demostración, y prohíbe emplear la predicción como prueba de autenticidad o manipulación.
- No se incluyen los vídeos de origen con el checkpoint, lo que dificulta la reproducción exacta del entrenamiento.
- El modelo no procesa audio ni texto y no ofrece explicabilidad sobre qué regiones o fotogramas motivan la decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VinayYadav2004/deepfake-detector
- Repositorio del proyecto (demo Streamlit y definición del modelo): https://github.com/Vinay04yadav/Deepfake_Detection
- Dataset de entrenamiento (DeepFake Detection Cropped Dataset, Kaggle): https://www.kaggle.com/datasets/ucimachinelearning/deep-fake-detection-cropped-dataset
- Artículo: "Deepfake Video Detection Using a Combined CNN-LSTM Approach", ICSIT 2025: https://doi.org/10.1109/ICSIT65336.2025.11294356
