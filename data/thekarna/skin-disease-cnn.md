# TheKarna/skin-disease-cnn

## Resumen

El modelo `TheKarna/skin-disease-cnn` es un clasificador de imágenes basado en redes neuronales convolucionales (CNN) subido a Hugging Face por el usuario TheKarna. Está diseñado para la detección y clasificación de enfermedades de la piel a partir de imágenes dermatológicas, un campo con aplicaciones potenciales en diagnóstico asistido por ordenador. El repositorio tiene un tamaño de 0,1 GB y se distribuye mediante la librería Keras, lo que permite su uso con backends de JAX, TensorFlow o PyTorch.

La información pública disponible es extremadamente limitada: la model card es genérica y no incluye detalles sobre arquitectura, datos de entrenamiento, rendimiento o licencia. No se han publicado métricas de evaluación ni especificaciones técnicas concretas. A pesar de ello, el modelo se enmarca en una línea de investigación activa sobre IA diagnóstica en dermatología, como reflejan los artículos recientes en Nature y otros repositorios similares. Su relevancia radica en la posible utilidad como herramienta de apoyo en entornos clínicos, aunque su validación y documentación son insuficientes para un uso profesional sin un análisis adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) - detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería Keras, posiblemente .h5 o .keras) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional (CNN), como indica el nombre del modelo y la etiqueta asociada. Las CNN son el estándar de facto para clasificación de imágenes, y en el dominio dermatológico se utilizan para extraer características visuales de lesiones cutáneas y asignarlas a categorías de enfermedad. Sin embargo, no se dispone de información sobre el número de capas, el tipo de bloques (residuales, densos, etc.), la función de activación, la estrategia de regularización ni el tamaño de entrada esperado.

En cuanto al entrenamiento, no se han publicado datos sobre el conjunto de datos utilizado, el número de épocas, la función de pérdida, el optimizador o si se aplicaron técnicas de aumento de datos o transferencia de aprendizaje. Tampoco se menciona ningún proceso de alineación como RLHF o DPO, que no son habituales en modelos de visión. La model card indica que el modelo se subió con Keras y puede ejecutarse con JAX, TensorFlow o PyTorch, pero no aporta más detalles técnicos.

## Capacidades

- Clasificación de imágenes de enfermedades de la piel: el modelo está diseñado para identificar condiciones dermatológicas a partir de fotografías, aunque no se especifican las clases concretas (p. ej., melanoma, acné, eczema).
- Procesamiento de imágenes: al ser una CNN, acepta tensores de imagen como entrada y produce una distribución de probabilidad sobre las clases.
- Integración con frameworks populares: al usar Keras, puede cargarse en entornos TensorFlow, JAX o PyTorch, lo que facilita su integración en pipelines existentes.
- No se han documentado capacidades adicionales como generación de texto, tool calling, razonamiento multi-paso o soporte de agentes, ya que es un modelo puramente visual.

## Casos de uso

- Asistencia al diagnóstico dermatológico: el modelo podría utilizarse como herramienta de apoyo para que los profesionales sanitarios obtengan una segunda opinión sobre imágenes de lesiones cutáneas, aunque se requiere una validación clínica rigurosa antes de cualquier uso real.
- Triaje de pacientes en telemedicina: en plataformas de consulta remota, el modelo podría preclasificar imágenes enviadas por pacientes para priorizar casos sospechosos, reduciendo la carga de trabajo de los especialistas.
- Educación médica: como material didáctico para estudiantes de medicina, permitiendo practicar la identificación de enfermedades de piel con ejemplos etiquetados.
- Investigación en IA aplicada a dermatología: servir como punto de partida para experimentos de transferencia de aprendizaje o comparación de arquitecturas en el dominio de imágenes médicas.
- Desarrollo de aplicaciones móviles de salud: integrarse en apps de escaneo de piel para ofrecer una evaluación preliminar, siempre con avisos de que no sustituye a un diagnóstico profesional.
- Automatización de análisis de imágenes en estudios epidemiológicos: procesar grandes volúmenes de fotografías para estimar la prevalencia de ciertas afecciones cutáneas en poblaciones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de exactitud, sensibilidad, especificidad o AUC sobre conjuntos de datos estándar como ISIC, HAM10000 o similares. Tampoco se han comparado los resultados con otros modelos de clasificación de enfermedades de piel. Por tanto, no es posible evaluar su rendimiento real.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del repositorio (0,1 GB), es probable que el modelo sea pequeño y quepa en GPUs con 4 GB o menos, pero no se puede confirmar sin conocer el número de parámetros.
- GPU recomendadas: no disponible. Cualquier GPU moderna con soporte CUDA podría ejecutarlo, pero no hay datos específicos.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido, pero no confirmado.
- Opciones de despliegue: al ser un modelo Keras, puede servirse con TensorFlow Serving, o convertirse a ONNX para usar en runtime de ONNX. También podría ejecutarse en CPU para inferencia por lotes, pero no hay guías oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Existen otros modelos de clasificación de enfermedades de piel en la literatura (p. ej., los revisados en el artículo de Nature "Deep learning models across the range of skin disease"), pero no se conocen sus parámetros exactos ni sus resultados en los mismos conjuntos de datos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no proporciona información sobre el entrenamiento, los datos, la arquitectura o la licencia, lo que impide evaluar su idoneidad para uso profesional.
- Riesgo de sesgo: sin conocer el conjunto de datos de entrenamiento, es probable que el modelo presente sesgos hacia ciertos tipos de piel, iluminación o condiciones demográficas, lo que podría dar lugar a diagnósticos erróneos en poblaciones subrepresentadas.
- Alucinación y errores de clasificación: como cualquier modelo de visión, puede producir falsos positivos o negativos, con consecuencias graves en el ámbito médico.
- Sin validación clínica: no hay evidencia de que el modelo haya sido evaluado en entornos clínicos reales ni aprobado por organismos reguladores.
- Licencia no especificada: el uso comercial o la redistribución pueden estar restringidos, pero al no indicarse la licencia, existe incertidumbre legal.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni mantiene conversaciones, por lo que su uso se limita a la clasificación de imágenes.

## Enlaces

- [Hugging Face - TheKarna/skin-disease-cnn](https://huggingface.co/TheKarna/skin-disease-cnn)
- [Artículo de Nature sobre modelos de deep learning en enfermedades de piel](https://www.nature.com/articles/s41746-024-01033-8)
- [Repositorio GitHub similar: Skin-disease-detection-using-CNN](https://github.com/hraiharan/Skin-disease-detection-using-CNN)
- [Repositorio GitHub similar: skin-disease-detection-cnn](https://github.com/anshtaralekar/skin-disease-detection-cnn)
