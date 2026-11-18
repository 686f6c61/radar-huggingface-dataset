# Udit013/brain-tumor-efficientnetb3

## Resumen

EfficientNetB3 Brain Tumor MRI Classifier es un modelo de clasificación de imágenes médicas desarrollado por Udit013. Se trata de una red convolucional basada en la arquitectura EfficientNetB3, entrenada para clasificar imágenes de resonancia magnética cerebral potenciadas en T1 en cuatro categorías: glioma, meningioma, ausencia de tumor y tumor hipofisario. El modelo se distribuye en formato Keras (pesos H5) y ONNX para servir en producción sin dependencia de TensorFlow.

El modelo parte de la receta del mejor modelo de un artículo de IEEE de 2024 (DOI: 10.1109/ICC-ROBINS60238.2024.10533941) y fue reentrenado en octubre de 2026 con un ajuste fino en dos etapas: primero la cabeza sobre características del backbone congelado y después los bloques 6 y 7 con incremento de datos de tipo ruido y desenfoque, manteniendo BatchNorm congelado. La entrada es de 256x256x3 píxeles RGB en rango [0,255], ya que EfficientNet reescala internamente.

Su relevancia es doble: por un lado, demuestra un flujo completo de clasificación médica con calibración de temperatura y evaluación de robustez frente a corrupciones; por otro, ofrece una exportación ONNX con Grad-CAM calculado en forma cerrada y verificada contra TensorFlow, lo que facilita el despliegue en plataformas de investigación. No obstante, el propio autor advierte que no es un dispositivo médico y que el conjunto de datos presenta fuga entre entrenamiento y prueba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetB3 (CNN con compound scaling) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | Keras H5 (EfficientNetB3_model_weights.h5) y ONNX (efficientnetb3.onnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura EfficientNetB3, una red convolucional que escala de forma compuesta la profundidad, anchura y resolución de la red. La entrada es una imagen RGB de 256x256 píxeles con valores de píxel en [0,255], que la propia arquitectura reescala de forma interna. La cabeza de clasificación produce cuatro clases: glioma, meningioma, notumor y pituitary.

El entrenamiento documentado corresponde a un ajuste fino en dos etapas: en primer lugar se entrena la cabeza de clasificación sobre características extraídas con el backbone congelado; después se descongelan y ajustan los bloques 6 y 7 con incremento de datos de tipo ruido y desenfoque, manteniendo las capas BatchNorm congeladas. La selección del modelo se realizó sobre una partición de validación que evita imágenes casi duplicadas entre entrenamiento y validación, y la temperatura de calibración se ajustó sobre esa misma partición. El modelo anterior, que reproducía exactamente la receta del artículo, quedó preservado en la etiqueta `parity-2024`.

## Capacidades

- Clasificación de imágenes de resonancia magnética cerebral T1 en cuatro clases: glioma, meningioma, notumor y pituitary.
- Inferencia en CPU y GPU mediante exportación ONNX, sin requerir TensorFlow en producción.
- Generación de mapas de calor Grad-CAM calculados en forma cerrada a partir del último mapa de características convolucionales, verificados contra TensorFlow (probabilidades con diferencia inferior a 5e-6 en las 1.600 imágenes de test).
- Calibración de probabilidades mediante temperatura (fichero `temperature.json`), lo que permite obtener puntuaciones mejor calibradas (ECE bruto de 0,022).
- Carga de pesos en la arquitectura EfficientNetB3 con `weights=None` para su uso con Grad-CAM.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imagen puro.

## Casos de uso

- Investigación en imagen médica: servir como línea base reproducible para comparar nuevas técnicas de clasificación de tumores cerebrales, dado que el autor documenta la receta de entrenamiento, la calibración y los datos de evaluación.
- Demostración educativa de flujos de clasificación médica: la plataforma NeuroClass y la API pública permiten a estudiantes probar inferencia y visualizar Grad-CAM sin montar TensorFlow.
- Prototipado de sistemas de triaje asistido: el modelo puede integrarse en un pipeline que marque imágenes candidatas para revisión por parte de radiólogos, usando la probabilidad calibrada como señal de prioridad.
- Evaluación de robustez: sus resultados frente a 30 tipos de corrupción de imagen (90,7% de precisión media) sirven para estudiar la degradación de clasificadores médicos bajo ruido o desenfoque.
- Despliegue ligero en entornos con ONNX Runtime: al exportarse a ONNX y ejecutarse en CPU, puede desplegarse en servidores sin GPU o en entornos edge para pruebas de concepto.
- Verificación de técnicas de explicabilidad: el Grad-CAM en forma cerrada y su comparación contra TensorFlow lo convierten en un caso de estudio para validar implementaciones de mapas de atención.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en test de Kaggle (1.600 imágenes, CPU) | 93,44% |
| Precisión en test sin casi duplicados en entrenamiento | 89,4% |
| Recall de glioma | 79,5% |
| ECE bruto | 0,022 |
| Precisión media en 30 corrupciones de imagen | 90,7% |
| Precisión en dataset externo (253 imágenes, tumor vs no tumor) | 72,7% |
| Precisión del modelo anterior (receta del paper, tag parity-2024) | 90,25% |

No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K por tratarse de un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño típico de EfficientNetB3 (unos 12 millones de parámetros) la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo se ha medido en CPU sobre 1.600 imágenes, lo que confirma viabilidad sin GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo con unos pocos GB de VRAM.
- Opciones de despliegue: ONNX Runtime (formato `efficientnetb3.onnx`) y TensorFlow/Keras (pesos H5 para Grad-CAM). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Licencia | Formato | Precisión reportada |
|---|---|---|---|---|---|
| Udit013/brain-tumor-efficientnetb3 | EfficientNetB3 | 4 | MIT | H5, ONNX | 93,44% en test de Kaggle |
| Versión parity-2024 del mismo autor | EfficientNetB3 | 4 | MIT | H5 | 90,25% en el mismo test |
| Otros clasificadores de tumores cerebrales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada; la única comparación posible es con la versión anterior del propio modelo.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor lo restringe explícitamente a investigación y educación.
- El conjunto de datos presenta fuga documentada entre entrenamiento y prueba, lo que puede inflar las métricas reportadas.
- Recall de glioma del 79,5%, lo que implica que aproximadamente una de cada cinco imágenes de glioma no se detecta correctamente.
- La precisión cae al 72,7% en el dataset externo de 253 imágenes, muy por debajo del 93,44% del test interno, lo que sugiere problemas de generalización.
- El modelo solo distingue cuatro clases en imágenes T1; no cubre otras modalidades, secuencias ni patologías.
- No se documentan sesgos demográficos ni evaluación por subgrupos de población.
- La licencia MIT permite uso comercial, pero las advertencias del autor y la ausencia de validación clínica desaconsejan cualquier aplicación en contexto sanitario real.
- No hay información sobre cuantizaciones ni sobre rendimiento en otros formatos distintos de ONNX y Keras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Udit013/brain-tumor-efficientnetb3
- Repositorio de código y evaluación: https://github.com/Udit013/Brain_Tumor_Classificatioin
- Plataforma NeuroClass: https://neuroclass-lab.vercel.app
- API del modelo: https://udit013-brain-tumor-mri-classifier.hf.space/api/docs
- Artículo de referencia IEEE 2024: DOI 10.1109/ICC-ROBINS60238.2024.10533941
