# zinahghulam/ehr-timeline-forecast

## Resumen

El modelo `ehr-timeline-forecast` es un Transformer decoder-only desarrollado por Zinah Ghulam para predecir condiciones médicas futuras a partir de historiales clínicos longitudinales tokenizados. Está preentrenado con un objetivo de predicción del siguiente evento sobre timelines de pacientes generados sintéticamente con Synthea, y posteriormente afinado para una tarea de clasificación multi-etiqueta de 40 condiciones que se diagnostican de nuevo en una ventana de 5 años tras una fecha ancla. El modelo emplea pooling por atención y una arquitectura compacta de 6 capas, 8 cabezas y dimensión de embedding 256, con una longitud máxima de secuencia de 1024 tokens.

Su relevancia radica en abordar la modelización de datos de salud electrónicos (EHR) con un enfoque de aprendizaje autosupervisado sobre eventos clínicos, evitando fugas de distribución al derivar el vocabulario y los bins de laboratorio exclusivamente del conjunto de entrenamiento. Aunque está pensado para investigación y educación, demuestra que los transformadores causales pueden capturar dependencias temporales en historiales de pacientes y predecir resultados clínicos futuros con una macro-AUROC de 0.7288 en validación. El repositorio incluye el código completo, la configuración y los artefactos necesarios para reproducir el pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch .pt) |
| Idiomas soportados | no disponible (los datos son códigos clínicos, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt), además de vocab.json, lab_bins.json, target_codes.json, config.yaml |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con 6 capas, 8 cabezas de atención y dimensión de embedding 256. La entrada consiste en timelines de pacientes tokenizados, donde cada evento clínico (diagnóstico, medicación, procedimiento, laboratorio) se convierte en un token. El preentrenamiento utiliza un objetivo autorregresivo de predicción del siguiente evento, similar al modelado de lenguaje, pero aplicado a secuencias de eventos clínicos. Tras el preentrenamiento, se realiza un fine-tuning supervisado para clasificación multi-etiqueta de 40 condiciones, empleando un pooling por atención para agregar la representación de la secuencia y una cabeza de clasificación.

Los datos provienen de Synthea, un generador de datos de pacientes sintéticos, lo que permite un pipeline sin fugas: el vocabulario de tokens y los límites de cuantiles para los valores de laboratorio se ajustan únicamente con el split de entrenamiento. El entrenamiento se registró en Weights & Biases, y la selección del mejor checkpoint se basó en la macro-AUROC de validación. No se especifica el número total de parámetros ni la cantidad de tokens de entrenamiento, pero la arquitectura compacta sugiere un modelo ligero.

## Capacidades

- Clasificación multi-etiqueta de 40 condiciones médicas que se diagnostican de nuevo en una ventana de 5 años tras una fecha ancla.
- Modelado de secuencias de eventos clínicos (diagnósticos, medicaciones, procedimientos, laboratorios) mediante preentrenamiento autorregresivo.
- Representación de historiales longitudinales de pacientes con atención pooling para tareas de predicción.
- Manejo de secuencias de hasta 1024 tokens, suficiente para historiales clínicos extensos.
- Reproducibilidad garantizada mediante la inclusión de vocabulario, bins de laboratorio y configuración en el repositorio.
- No se reportan capacidades de generación de texto, tool calling, agentes, visión ni audio; el modelo está especializado en datos clínicos estructurados.

## Casos de uso

- Investigación en salud predictiva: el modelo puede utilizarse para estudiar la progresión de enfermedades y la aparición de comorbilidades a partir de historiales clínicos, facilitando análisis epidemiológicos en cohortes sintéticas.
- Desarrollo de pipelines de ML en EHR: sirve como referencia para implementar transformadores causales sobre datos clínicos tokenizados, con un pipeline sin fugas que puede adaptarse a otros conjuntos de datos.
- Evaluación de modelos de predicción clínica: al proporcionar métricas de validación (macro-AUROC 0.7288, mAP 0.2000), permite comparar enfoques alternativos en la misma tarea.
- Formación y educación: es un ejemplo didáctico de cómo aplicar preentrenamiento generativo a datos no lingüísticos, útil en cursos de aprendizaje automático aplicado a salud.
- Generación de hipótesis clínicas: los resultados pueden orientar qué condiciones tienden a co-ocurrir en el tiempo, aunque con cautela por tratarse de datos sintéticos.
- Benchmarking de métodos de pooling y atención: la arquitectura con atención pooling puede compararse con otras estrategias de agregación de secuencias en tareas de clasificación de EHR.

## Benchmarks y rendimiento

Los resultados reportados corresponden a la cohorte de validación, ya que los resultados del conjunto de test están retenidos. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Macro-AUROC | 0.7288 |
| mAP | 0.2000 |

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- Dado el tamaño reducido del modelo (6 capas, 256 dimensiones de embedding, 1024 tokens de contexto), es razonable estimar que puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, e incluso en CPU para inferencia, aunque no hay mediciones confirmadas.
- El checkpoint se proporciona en formato PyTorch (.pt), por lo que puede cargarse con PyTorch estándar. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Para despliegue en producción, se requeriría convertir los pesos a un formato optimizado (por ejemplo, ONNX o TensorRT) y validar la latencia, pero no hay datos al respecto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (predicción de condiciones futuras en EHR con transformadores). No se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- El modelo está destinado exclusivamente a fines de investigación y educación; no debe utilizarse para diagnóstico clínico ni decisiones de tratamiento.
- Los datos de entrenamiento son sintéticos (Synthea), por lo que el rendimiento en datos reales de EHR puede diferir significativamente.
- Las métricas se reportan sobre validación, no sobre test, y pueden variar especialmente para condiciones raras.
- No se especifica la licencia, lo que limita su uso comercial sin autorización explícita del autor.
- No se han documentado sesgos específicos, pero al entrenarse con datos sintéticos, es probable que no capture la variabilidad real de la población.
- El modelo no soporta generación de texto libre ni interacción conversacional; su salida es una clasificación multi-etiqueta.
- La ausencia de cuantizaciones y formatos estándar (GGUF, safetensors) dificulta su integración en herramientas comunes de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zinahghulam/ehr-timeline-forecast
- Repositorio GitHub: https://github.com/zinahghul/ehr-timeline-forecast
- Dataset relacionado (m31-patient-timelines): https://huggingface.co/zinahghulam/m31-patient-timelines
- Dashboard de Weights & Biases: https://wandb.ai/zinahghulam-personal/ehr-timeline-forecast?nw=nwuserzinahghulam
