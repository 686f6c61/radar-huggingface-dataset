# v47vansh/annapoorna-crop-disease-cnn

## Resumen

Annapoorna crop disease CNN es un modelo de clasificación de imágenes desarrollado por el usuario independiente V47VANSH como componente de detección de enfermedades del proyecto Annapoorna, una aplicación de agricultura. Se trata de una red neuronal convolucional (CNN) entrenada desde cero con Keras que predice la enfermedad de una planta a partir de una fotografía de hoja, cubriendo 42 clases distribuidas entre cinco cultivos: algodón, trigo, maíz, arroz y caña de azúcar.

El modelo resuelve un problema acotado y práctico: la identificación automática de patologías foliares en cultivos de interés agrícola, un caso de uso clásico de visión por computador aplicada al sector primario. No es un modelo de propósito general ni un modelo de lenguaje: es un clasificador de imagen de dominio específico, con entrada fija de 224x224 píxeles RGB y salida de 42 clases.

Su relevancia es limitada y muy específica. Con 0 descargas y 0 likes en Hugging Face, una precisión de validación del 71,7% y una pérdida de validación de 4,02 (que el propio autor señala como indicio de sobreconfianza), debe considerarse un modelo experimental o de demostración más que una herramienta lista para producción. Su interés principal radica en servir como referencia para quien quiera reproducir o mejorar un pipeline de clasificación de enfermedades de cultivos con Keras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) entrenada desde cero; topología no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | HDF5 de Keras (`.h5`), archivo `crop_disease_cnn_model.h5` |

## Arquitectura y entrenamiento

El modelo es una CNN entrenada desde cero (no se menciona fine-tuning de un backbone preentrenado) con la librería Keras. La entrada es una imagen RGB de 224x224 píxeles escalada al rango [0, 1]. La salida es una distribución de probabilidad sobre 42 clases de enfermedad de cultivo. La model card no detalla el número de capas, los filtros, la presencia de bloques residuales ni el uso de regularización como dropout o batch normalization, por lo que la topología exacta no está disponible.

El entrenamiento se realizó sobre el dataset público "20K Multi-Class Crop Disease Images" de Kaggle, con un split de 12.255 imágenes de entrenamiento y 3.081 de validación. Se usó el optimizador Adam con tasa de aprendizaje 1e-4 durante 25 épocas. No se documenta el uso de aumento de datos, RLHF, DPO ni ninguna técnica de ajuste posterior; tampoco se especifica el número de tokens (no aplica) ni la composición detallada del dataset más allá de las cinco familias de cultivo y las 42 clases. El autor advierte explícitamente que la pérdida de validación (4,02) es alta para la precisión alcanzada (71,7%), lo que indica calibración deficiente y sobreconfianza en las predicciones.

## Capacidades

- Clasificación de imágenes de hojas de cultivo en 42 clases de enfermedad.
- Cobertura de cinco cultivos: algodón, trigo, maíz, arroz y caña de azúcar.
- Entrada de imagen RGB de 224x224 píxeles normalizada a [0, 1].
- Salida de probabilidades por clase (vector de 42 valores).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras modalidades.
- No es un modelo generativo: no produce texto ni descripciones, solo etiquetas de clase.

## Casos de uso

- Diagnóstico asistido en campo: una aplicación móvil captura una foto de hoja y el modelo devuelve la clase de enfermedad más probable entre las 42 disponibles, útil como primera orientación para el agricultor antes de consultar a un técnico.
- Triaje en extensiones agrarias: procesamiento por lotes de fotografías recogidas en campo para priorizar qué parcelas requieren inspección presencial, filtrando las imágenes con mayor probabilidad de patología.
- Monitorización de cultivos con drones o cámaras fijas: integración del clasificador en un pipeline que recibe recortes de hoja a 224x224 y genera alertas cuando la clase predicha corresponde a una enfermedad de interés.
- Investigación y docencia en visión por computador aplicada: el modelo sirve como línea base reproducible (Keras, dataset público, hiperparámetros documentados) para comparar arquitecturas o técnicas de aumento de datos en clasificación de enfermedades de plantas.
- Componente de la aplicación Annapoorna: uso previsto por el autor dentro del backend del proyecto, tal como indica la model card, para la funcionalidad de detección de enfermedades.
- Filtrado previo en sistemas de recomendación de tratamiento: dado que cubre cinco cultivos y 42 clases, puede emplearse para enrutar la imagen hacia el módulo de tratamiento correspondiente al cultivo y patología detectados.
- Prototipado rápido en entornos con TensorFlow/Keras: al cargarse con `load_model` y un único archivo `.h5`, es sencillo de desplegar en un servicio de inferencia básico para pruebas de concepto.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de validación del propio autor:

| Metrica | Valor |
|---|---|
| Precision de validacion | 71,7% |
| Perdida de validacion | 4,02 |
| Imagenes de validacion | 3.081 |
| Epocas de entrenamiento | 25 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de una CNN de clasificación con entrada 224x224 y 42 clases, es previsible que quepa en GPUs de consumo, pero no se confirma en la model card.
- GPU recomendadas: no especificadas. Para inferencia en CPU también es viable dado el tamaño del modelo (repo de 0,3 GB, que incluye los pesos en `.h5`), aunque no se documentan latencias.
- Cabe en GPU de consumo: probablemente sí (gama RTX 30/40 o inferior), pero el dato no está confirmado en la información disponible.
- Opciones de despliegue: TensorFlow/Keras con `load_model` sobre el archivo `.h5`; también es posible exportar a TensorFlow Serving o TFLite para móvil, aunque no se documenta en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos de clasificación de enfermedades de cultivos en la información proporcionada. Como referencia cualitativa, existirían clasificadores basados en backbones preentrenados (por ejemplo, ResNet o EfficientNet ajustados sobre el mismo dataset), pero no se aportan métricas que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Annapoorna crop disease CNN | no disponible | Imagen 224x224 RGB | 71,7% val. accuracy; loss 4,02 | MIT | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión de validación moderada (71,7%) y pérdida de validación alta (4,02); el propio autor advierte de sobreconfianza en las predicciones, por lo que la confianza de salida no debe interpretarse como probabilidad calibrada.
- Riesgo de falsos negativos y positivos en enfermedades poco representadas o visualmente similares; no se documenta el balance de clases del dataset.
- Dominio muy restringido: solo cinco cultivos (algodón, trigo, maíz, arroz, caña de azúcar) y 42 clases; no generaliza a otros cultivos ni a condiciones de captura distintas de las del dataset de entrenamiento (iluminación, fondo, dispositivo).
- No se documentan sesgos específicos, pero al entrenarse sobre un dataset público de Kaggle puede heredar sesgos de recolección (geografía, variedades locales, condiciones de laboratorio frente a campo).
- Licencia MIT: permite uso comercial y modificación, con obligación de incluir el aviso de copyright y la licencia; conviene verificar la licencia del dataset de entrenamiento por separado.
- No apta como sustituto de diagnóstico fitosanitario profesional; debe usarse como herramienta de apoyo con validación humana.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte o correcciones.
- No se especifican requisitos de preprocesado más allá del redimensionado a 224x224 y la normalización a [0, 1]; un preprocesado distinto degradará el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/v47vansh/annapoorna-crop-disease-cnn
- Repositorio del proyecto Annapoorna: https://github.com/V47VANSH/Annapoorna
- Clases y script de predicción: https://github.com/V47VANSH/Annapoorna/blob/main/backend/predict.py
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/jawadali1045/20k-multi-class-crop-disease-images
