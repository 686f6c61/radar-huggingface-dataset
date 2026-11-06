# theshoaibme/panorgan-nephrology-renal-ct-mri-classifier

## Resumen

PanOrganNet Nephrology es un clasificador de imágenes médicas desarrollado por el usuario theshoaibme dentro del paradigma Pan-Organ Diagnostic Paradigm (PanOrganNet). Se trata de un modelo de clasificación de imágenes basado en EfficientNetV2-S, adaptado para distinguir entre modalidades de imagen renal (TC y RM) en cohortes de pacientes con carcinoma renal de células claras (KIRC). El modelo se distribuye como pesos de PyTorch (pytorch_model.pt) con un archivo config.json que define las clases y los parámetros de normalización.

El modelo resuelve una tarea acotada: la clasificación de modalidad (TC frente a RM) sobre recortes de imagen renal, según se deduce del ejemplo de uso incluido en la model card, que imprime "Predicted Modality" con dos clases configuradas. No se documentan capacidades de segmentación, detección de lesiones ni generación de texto clínico; es un clasificador de imagen puro con pipeline image-classification.

Su relevancia es limitada y debe evaluarse con cautela: la model card declara métricas perfectas (100% de accuracy, F1 macro de 1.0000, AUC-ROC de 1.0000) sobre un conjunto de test no descrito, sin información sobre el tamaño del dataset, la partición train/test, el número de imágenes ni la metodología de evaluación. El repositorio ocupa 0,1 GB y acumula 70 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (backbone torchvision) con clasificador lineal de 2 clases |
| Parametros totales | no disponible (EfficientNetV2-S ronda los 21,5 M, pero no se confirma en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos PyTorch en punto flotante) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (.pt) más config.json |

## Arquitectura y entrenamiento

La arquitectura es un EfficientNetV2-S de torchvision al que se le sustituye la cabeza clasificadora por un bloque Sequential compuesto por Dropout(0.3) y una capa Linear con 2 salidas, según el código de ejemplo de la model card. La entrada se redimensiona a 224x224 píxeles y se normaliza con la media y desviación típica indicadas en config.json. El modelo se carga mediante load_state_dict sobre la instancia de torchvision, lo que implica que los pesos son compatibles con esa implementación concreta.

No se documenta el proceso de entrenamiento: no hay información sobre el número de imágenes, la composición del dataset theshoaibme/panorgan-tcga-kirc-renal-ct-mri, el régimen de aumentación de datos, la función de pérdida, el número de épocas, la estrategia de validación ni si hubo ajuste fino completo o solo de la cabeza. Tampoco se describe ninguna innovación técnica (atención lineal, decodificación especulativa, destilación, etc.). La model card se limita a declarar el alcance clínico y las métricas de test.

## Capacidades

- Clasificación de imágenes médicas renales en dos clases de modalidad (TC y RM), según la configuración de clases del config.json.
- Identificación de características tisulares en cohortes KIRC, según declara la model card, aunque no se especifica qué características ni con qué granularidad.
- Entrada de imagen RGB redimensionada a 224x224 con normalización configurable.
- Salida de logits y probabilidades softmax por clase.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni otras modalidades fuera de la imagen médica.

## Casos de uso

- Filtrado previo de estudios radiológicos: el clasificador puede etiquetar recortes renales como TC o RM antes de enrutarlos a pipelines de análisis específicos por modalidad, evitando mezclar estudios en procesos posteriores.
- Organización de cohortes de investigación: para estudios retrospectivos sobre KIRC, el modelo puede separar imágenes por modalidad y facilitar la estratificación del dataset antes del análisis estadístico.
- Control de calidad de datasets: detectar imágenes mal etiquetadas o de modalidad incorrecta dentro de un repositorio de imágenes renales, usando la confianza de la predicción como señal de revisión manual.
- Preprocesamiento en pipelines de visión médica: como primer paso de una cadena en la que modelos posteriores (segmentación de riñón, detección de lesiones) requieren conocer la modalidad de entrada.
- Docencia y demostración técnica: ejemplo de ajuste fino de EfficientNetV2-S sobre imágenes médicas, útil para mostrar el flujo completo de carga de pesos, transformación y clasificación con torchvision.
- Prototipado de herramientas de triaje: en entornos de investigación, como componente de un sistema que priorice la revisión de estudios según modalidad y confianza del modelo, siempre con supervisión de un radiólogo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, sobre un conjunto de test no descrito:

| Metrica | Valor declarado |
|---|---|
| Test Accuracy | 100,00% |
| Macro F1-Score | 1,0000 |
| Macro Precision | 1,0000 |
| Macro Recall (Sensitivity) | 100,00% |
| AUC-ROC | 1,0000 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de esta tabla. No se indica el tamaño del conjunto de test, el número de imágenes por clase, la procedencia de las muestras ni si hubo separación por paciente. Unas métricas perfectas en una tarea de clasificación de imágenes médicas son atípicas y deben interpretarse con escepticismo hasta que se publique una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 1 GB o menos para el modelo y el lote de una imagen a 224x224; el repositorio completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo (según el ejemplo de la model card), TorchServe, ONNX Runtime tras exportación, o integración como módulo dentro de un servicio FastAPI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, la latencia por imagen en GPU debería ser de pocos milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PanOrganNet Nephrology (este modelo) | EfficientNetV2-S + cabeza lineal | no disponible | imagen 224x224 | CC-BY-4.0 | Hugging Face, 70 descargas |
| EfficientNetV2-S original (torchvision) | EfficientNetV2-S | ~21,5 M | imagen 224x224 (configurable) | BSD-3-Clause (torchvision) | Ampliamente disponible |
| RadImageNet (modelos preentrenados) | ResNet50, DenseNet, InceptionV3 | variable | imagen 224x224 | no disponible en la información | Disponible vía repositorios académicos |
| MedMNIST baselines | CNN pequeños | variable | imagen 28x28 a 224x224 | variable | Disponible vía MedMNIST |

La comparación con RadImageNet y MedMNIST es orientativa: no se dispone de métricas comparables publicadas en la información proporcionada. El modelo aquí descrito es un ajuste fino de EfficientNetV2-S con una cabeza de 2 clases, por lo que su comparación más directa es con el backbone original y con clasificadores binarios similares entrenados sobre imágenes renales, para los que no hay datos disponibles.

## Limitaciones y advertencias

- Métricas declaradas perfectas (100% accuracy, AUC-ROC 1.0000) sin descripción del conjunto de test, tamaño muestral ni separación por paciente; riesgo alto de sobreajuste, fuga de datos o evaluación sobre un conjunto trivial.
- No se documenta el dataset de entrenamiento más allá del identificador theshoaibme/panorgan-tcga-kirc-renal-ct-mri; se desconoce su tamaño, composición y procedencia exacta.
- El alcance declarado es la clasificación de modalidad (TC frente a RM) en dos clases; no se documenta detección de lesiones, segmentación, estadificación ni diagnóstico clínico.
- No apto para uso clínico sin validación externa, revisión regulatoria y supervisión profesional; la model card no incluye advertencias médicas ni limitaciones de responsabilidad.
- No se han documentado sesgos demográficos, de equipo de adquisición ni de protocolo de imagen; en imágenes médicas estos sesgos son habituales y pueden degradar el rendimiento fuera del conjunto de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no exime de las obligaciones regulatorias aplicables a software sanitario.
- Sin información sobre idiomas ni texto: no aplica a tareas de NLP.
- Repositorio con 0 likes y 70 descargas: ecosistema de validación muy limitado, sin informes de terceros ni discusión pública.
- El código de ejemplo asume una estructura de config.json con claves "classes", "normalization" y "mean"/"std"; cualquier cambio en el repositorio puede romper la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theshoaibme/panorgan-nephrology-renal-ct-mri-classifier
- Dataset asociado: https://huggingface.co/datasets/theshoaibme/panorgan-tcga-kirc-renal-ct-mri
- Perfil del autor: https://huggingface.co/theshoaibme
- EfficientNetV2 (paper de referencia del backbone): https://arxiv.org/abs/2104.00298
- Documentación de torchvision para EfficientNetV2: https://pytorch.org/vision/stable/models/efficientnetv2.html
