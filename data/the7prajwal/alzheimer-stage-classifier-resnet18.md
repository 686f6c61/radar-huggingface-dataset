# the7prajwal/alzheimer-stage-classifier-resnet18

## Resumen

`the7prajwal/alzheimer-stage-classifier-resnet18` es un modelo de clasificación de imágenes médicas consistente en una ResNet18 preentrenada en ImageNet y afinada para clasificar cortes axiales de resonancia magnética cerebral en cuatro estadios de Alzheimer: NonDemented, VeryMildDemented, MildDemented y ModerateDemented. Lo desarrolla Prajwal Halakeri (usuario `the7prajwal`) en el marco del proyecto académico SDP_CISHA_05, correspondiente al séptimo semestre de un programa de ingeniería.

El modelo no es un modelo de lenguaje ni un sistema multimodal generativo: es un clasificador de imagen puro (pipeline `image-classification`) construido sobre transferencia de aprendizaje en dos fases. Su relevancia es fundamentalmente educativa y de investigación: demuestra un flujo completo de entrenamiento con desbalanceo de clases, aumento de datos, pérdida ponderada y explicabilidad mediante Grad-CAM, con un despliegue de demostración en Streamlit sobre Hugging Face Spaces.

Las métricas reportadas por el autor (exactitud de test de 0,9927 y macro-F1 de 0,9947) deben interpretarse con cautela: el propio autor advierte que el conjunto de datos de Kaggle empleado contiene imágenes casi duplicadas o aumentadas compartidas entre los splits de entrenamiento y test, por lo que esas cifras constituyen una cota superior específica del dataset y no una estimación de generalización clínica real. El modelo no está validado para uso diagnóstico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN residual, backbone preentrenado en ImageNet) con cabeza fully-connected adaptada a 4 clases |
| Parametros totales | no disponible (ResNet18 estándar ronda los 11,7 M, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos PyTorch; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase están en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint `.pth`/`.pt`; el repositorio figura con 0.0 GB, por lo que la disponibilidad efectiva de los pesos no está confirmada) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet18 con conexiones residuales, preentrenada en ImageNet y adaptada a clasificación de 4 clases. El ajuste fino se realizó en dos fases: primero un calentamiento con el backbone congelado y solo la cabeza entrenable, y después la descongelación de `layer4` y de la capa fully-connected (`fc`) para un ajuste más profundo. La entrada son cortes axiales de resonancia magnética cerebral.

El entrenamiento usó el Alzheimer's Dataset de Kaggle en su variante de 4 clases, con aproximadamente 6400 imágenes. Para mitigar el desbalanceo, se aplicó aumento de datos offline con factor 6 sobre la clase minoritaria ModerateDemented y se empleó CrossEntropyLoss ponderada por clase. El autor reporta un mejor macro-F1 de validación de 0,9775. No se documentan número de épocas, resolución de entrada, optimizador, learning rate ni composición detallada del dataset más allá de la fuente Kaggle. La innovación técnica destacable no está en la arquitectura (que es estándar) sino en el flujo de explicabilidad: se generan visualizaciones Grad-CAM que, según el autor, apuntan a regiones anatómicamente relevantes (ventrículos y córtex periventricular) en lugar de artefactos de escaneo.

## Capacidades

- Clasificación de imágenes de resonancia magnética cerebral en 4 clases discretas de estadio de Alzheimer.
- Trabajo sobre cortes axiales individuales; no modela volúmenes 3D ni series completas de un paciente.
- Explicabilidad mediante Grad-CAM: genera mapas de saliencia que indican las regiones de la imagen que más influyen en la predicción.
- Inferencia en PyTorch estándar, integrable en pipelines de visión con `torchvision`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta agentes ni uso conversacional.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras modalidades.

## Casos de uso

- Demostración docente de transferencia de aprendizaje: sirve como ejemplo completo de ajuste fino en dos fases de una CNN preentrenada sobre un dataset médico pequeño, útil en asignaturas de deep learning.
- Práctica de explicabilidad en imagen médica: el pipeline Grad-CAM permite ilustrar cómo auditar visualmente qué regiones activa un clasificador y discutir la diferencia entre atención anatómica y artefactos.
- Prototipo de interfaz de triaje educativo: el despliegue Streamlit en Hugging Face Spaces permite a estudiantes subir un corte y ver la predicción con su mapa de calor, sin ningún valor clínico.
- Estudio de técnicas frente al desbalanceo de clases: el uso de aumento offline 6x y pérdida ponderada documentado por el autor sirve como referencia reproducible para datasets médicos desbalanceados.
- Benchmark interno de pipelines de clasificación de MRI: puede usarse como línea base metodológica (no clínica) para comparar preprocesado, aumentos y estrategias de congelación de capas.
- Material de discusión sobre fuga de datos: el caso ilustra de forma explícita cómo duplicados entre splits inflan las métricas, un tema recurrente en la literatura de imagen médica.

## Benchmarks y rendimiento

Métricas reportadas por el autor sobre el conjunto de test del dataset de Kaggle (con la advertencia de fuga de datos indicada en la model card):

| Metrica | Valor |
|---|---|
| Mejor macro-F1 de validación | 0,9775 |
| Exactitud en test | 0,9927 |
| Macro-F1 en test | 0,9947 |

No se han publicado resultados de benchmarks en la información disponible para comparaciones con otros modelos en conjuntos independientes (MMLU, HumanEval, GSM8K u otros no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una ResNet18 en FP32 ocupa del orden de decenas de MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para entrenamiento, una RTX 3060/4090 o una T4/A100 acelera el ajuste fino, aunque el modelo es lo bastante pequeño para entrenarse en CPU con paciencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo, TorchServe, ONNX Runtime (previa exportación), FastAPI con `torchvision`, o Streamlit como en la demo del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Métricas reportadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| the7prajwal/alzheimer-stage-classifier-resnet18 | ResNet18 fine-tuned, 4 clases | no disponible | no aplica | Acc 0,9927 / macro-F1 0,9947 en test de Kaggle (con fuga de datos) | MIT | Hugging Face (repo de 0.0 GB) |
| Modelos ResNet18 con atención para Alzheimer (literatura, p. ej. Frontiers in Neuroinformatics 2024) | CNN con atención y transferencia | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Publicaciones académicas |
| Alternativas clínicas certificadas | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Fuga de datos documentada: el dataset de Kaggle contiene imágenes casi duplicadas o aumentadas compartidas entre train y test, por lo que las métricas de test son una cota superior específica del dataset y no reflejan generalización a escaneos clínicos independientes.
- No apto para uso clínico: el modelo no ha sido validado con datos clínicos independientes, ni revisado por profesionales médicos, ni aprobado para diagnóstico. No debe usarse para informar decisiones médicas reales.
- Sesgos potenciales: al entrenarse con una única fuente de datos (Kaggle), puede estar sesgado hacia la distribución demográfica, los equipos de imagen y los protocolos de adquisición de ese dataset.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos con alta confianza aparente por sobreajuste a la distribución de entrenamiento.
- Limitación de modalidad: solo clasifica cortes axiales individuales; no procesa volúmenes 3D, otras secuencias de MRI ni otras modalidades de imagen.
- Limitaciones de idioma: no aplica, pero las etiquetas de salida están únicamente en inglés.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero la advertencia del autor sobre la falta de validación clínica desaconseja cualquier uso en producción sanitaria.
- Disponibilidad: el repositorio figura con tamaño de 0.0 GB, por lo que no está confirmado que los pesos estén efectivamente publicados y descargables.
- Explicabilidad limitada: Grad-CAM aporta una señal cualitativa, no una garantía de que el modelo razone de forma causalmente correcta; el propio autor lo señala como complemento, no sustituto, de la validación clínica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the7prajwal/alzheimer-stage-classifier-resnet18
- Repositorio GitHub: https://github.com/the7prajwal/Alzheimer-stage-classifier
- README del repositorio: https://github.com/the7prajwal/Alzheimer-stage-classifier/blob/main/README.md
- Perfil del autor en Hugging Face: https://huggingface.co/the7prajwal
- Artículo relacionado en Frontiers in Neuroinformatics (ResNet18 con atención para Alzheimer): https://www.frontiersin.org/journals/neuroinformatics/articles/10.3389/fninf.2024.1507217/full
