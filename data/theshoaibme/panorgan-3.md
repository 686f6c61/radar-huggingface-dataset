# theshoaibme/PanOrgan-3

## Resumen

PanOrgan 3 es un modelo fundacional multimodal para imagen médica desarrollado por MD. Shoaib Khan y Asmita Rahman en el Departamento de Ciencia de la Computación e Ingeniería de la Daffodil International University (Bangladesh), como proyecto de fin de grado (CSE499 FYDP, primavera de 2026) supervisado por el Dr. Md. Ali Hossain. El modelo, denominado internamente PanOrganNetV2, aborda dos tareas simultáneas sobre cuatro modalidades de imagen médica (MRI, CT, ecografía y radiografía de tórax): clasificación diagnóstica con calibración de probabilidades y segmentación de estructuras anatómicas.

La propuesta técnica se apoya en un pipeline de entrenamiento en tres etapas: preentrenamiento auto-supervisado (SSL) en etapa 1, entrenamiento conjunto multimodal en etapa 2a y calibración con escalado de temperatura en etapa 2b. Además, incorpora predicción conformal multiclase (MC2) con un nivel de cobertura objetivo del 90 % (alpha = 0,10) y una evaluación de robustez frente a datos faltantes bajo el supuesto MNAR (*missing not at random*), lo que resulta relevante en entornos clínicos reales donde no siempre se dispone de todas las modalidades.

El modelo se distribuye como un checkpoint de PyTorch (`best.pt`) de aproximadamente 0,3 GB junto con el código de definición del modelo, la configuración y un informe de evaluación (`thesis_report.json`). Es relevante ahora porque ejemplifica la tendencia hacia modelos fundacionales médicos que unifican modalidades y cohortes heterogéneas, incorporan garantías estadísticas de calibración y cuantifican la incertidumbre mediante conformal prediction, aspectos poco habituales en publicaciones académicas de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PanOrganNetV2 (definida en `modeling_panorgan.py`); tipo exacto de bloque no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de imagen médica); no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`) |
| Modalidades de entrada | MRI, CT, ecografía (US), radiografía de tórax (CXR) |
| Cohortes de entrenamiento | 5: `pulmonary_cxr`, `busi_breast_us`, `kidney_ct_mri`, `ultrasound_nerve`, `prostatex_mri` |
| Tareas | Clasificación, segmentación, calibración, conformal prediction |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es PanOrganNetV2, un modelo multimodal que procesa cuatro modalidades de imagen médica y produce salidas de clasificación y segmentación. La model card no detalla el número de parámetros, la profundidad de la red ni los bloques concretos (transformer, CNN o híbrido); esa información solo está disponible en el archivo `modeling_panorgan.py` incluido en el repositorio. Tampoco se especifica el número de tokens de entrenamiento ni la composición exacta de los datasets más allá de las cinco cohortes nombradas (pulmonary_cxr, busi_breast_us, kidney_ct_mri, ultrasound_nerve y prostatex_mri).

El entrenamiento se organiza en tres etapas: (1) aprendizaje auto-supervisado (SSL) sobre las cohortes, (2) entrenamiento conjunto multimodal (etapa 2a) y (3) calibración mediante escalado de temperatura (etapa 2b), con una temperatura óptima ajustada de T = 0,9390. Adicionalmente se realiza una evaluación de estrés bajo missingness MNAR para medir la degradación del modelo cuando faltan modalidades. La innovación destacable es la integración de predicción conformal multiclase (MC2) con alpha = 0,10, que proporciona conjuntos de predicción con cobertura marginal garantizada y una tasa de abstención explícita, algo poco común en modelos fundacionales médicos de este alcance.

## Capacidades

- Clasificación diagnóstica multimodal sobre MRI, CT, ecografía y radiografía de tórax.
- Segmentación anatómica (métricas Dice, IoU y HD95 reportadas por cohorte, aunque los valores numéricos no están disponibles en la información proporcionada).
- Calibración de probabilidades mediante temperature scaling, con reducción del ECE de 0,0792 a 0,0598.
- Predicción conformal multiclase (MC2) con cobertura objetivo del 90 % y tasa de abstención, útil para derivar casos inciertos a revisión humana.
- Robustez evaluada frente a datos faltantes bajo supuesto MNAR.
- Entrenamiento conjunto sobre cinco cohortes heterogéneas, lo que sugiere cierta generalización entre dominios anatómicos.
- No se documentan capacidades de texto, tool calling, agentes ni generación de lenguaje; es un modelo exclusivamente de imagen médica.

## Casos de uso

- **Triaje radiológico automatizado:** el modelo puede clasificar estudios de tórax, mama, riñón, nervio y próstata en una única pasada, lo que permite priorizar casos sospechosos en servicios de radiología con alta carga asistencial.
- **Segunda lectura con abstención controlada:** gracias a la predicción conformal MC2, el sistema puede abstenerse cuando el conjunto de predicción es demasiado grande y derivar el caso a un radiólogo, reduciendo el riesgo de errores silenciosos en producción.
- **Segmentación de estructuras en pipelines de planificación:** las salidas de segmentación (Dice, IoU, HD95) permiten su uso en tareas de delimitación de órganos y lesiones para planificación quirúrgica o radioterapia, siempre que se valide por cohorte.
- **Screening multimodal con datos incompletos:** la evaluación MNAR indica que el modelo está diseñado para escenarios donde no todas las modalidades están disponibles (por ejemplo, un paciente con CT pero sin MRI), algo frecuente en hospitales con recursos limitados.
- **Investigación en modelos fundacionales médicos:** el repositorio incluye el código de definición (`modeling_panorgan.py`), la configuración y el informe de evaluación, lo que facilita la reproducción y la extensión a nuevas cohortes.
- **Auditoría de calibración en entornos clínicos:** el informe `thesis_report.json` y las figuras de calibración permiten a equipos de calidad verificar que las probabilidades emitidas son fiables antes de integrar el modelo en un sistema de apoyo a la decisión.
- **Prototipado académico y docencia:** al ser un checkpoint PyTorch de 0,3 GB con licencia MIT, es adecuado para prácticas de investigación en universidades sin infraestructura de GPU de gran escala.

## Benchmarks y rendimiento

Resultados de clasificación y calibración sobre el conjunto de test reservado, según `thesis_report.json`:

| Métrica | Sin calibrar | Calibrado |
|---|---:|---:|
| `macro_f1` | 0,8905 | 0,8905 |
| `accuracy` | 0,8793 | 0,8793 |
| `ece` | 0,0792 | 0,0598 |
| `brier` | 0,2105 | 0,2077 |

Temperatura óptima de calibración: T = 0,9390.

Resultados de segmentación (Dice, IoU, HD95) por cohorte: no disponibles en la información proporcionada (la tabla de la model card aparece con valores `None`).

Cobertura de predicción conformal MC2 (alpha = 0,10): no disponible en la información proporcionada (la tabla aparece con valores `None`).

No se han publicado comparaciones con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estándar) en la información disponible, dado que se trata de un modelo de imagen médica y no de lenguaje.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible. El checkpoint pesa aproximadamente 0,3 GB, lo que sugiere que en FP32 cabría en GPUs consumer de 8 GB o menos, pero el número exacto de parámetros no está documentado.
- **GPU recomendadas:** no disponibles. Por el tamaño del checkpoint, una RTX 3060/4060 o superior sería suficiente para inferencia en FP32; para entrenamiento o fine-tuning se recomendaría al menos una A100 o H100, aunque esto es una estimación basada en el tamaño del archivo, no un dato del autor.
- **Compatibilidad con GPU consumer:** probablemente sí, dada la huella de 0,3 GB, pero no confirmado por el autor.
- **Opciones de despliegue:** el modelo se distribuye como checkpoint PyTorch (`best.pt`) con código de definición propio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje). El despliegue requeriría cargar el estado con `torch.load` e instanciar `PanOrganNetV2`.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos fundacionales médicos (por ejemplo, BiomedCLIP, MedSAM, UNI o RadImageNet), ni el autor publica métricas frente a alternativas. Cualquier comparación requeriría datos que no están en la model card.

## Limitaciones y advertencias

- **Modelo académico sin validación clínica:** es un proyecto de fin de grado; no consta validación regulatoria (CE, FDA) ni estudios prospectivos, por lo que no debe usarse para diagnóstico clínico directo.
- **Resultados de segmentación y conformal no disponibles:** las tablas de Dice/IoU/HD95 y de cobertura conformal aparecen con valores `None` en la model card, lo que impide verificar el rendimiento real en esas tareas.
- **Cohortes limitadas y posible sesgo demográfico:** las cinco cohortes (pulmonary_cxr, busi_breast_us, kidney_ct_mri, ultrasound_nerve, prostatex_mri) son datasets públicos de origen y tamaño diversos; no se documenta la distribución demográfica ni la representatividad, lo que puede introducir sesgos.
- **Riesgo de alucinación/clasificación errónea:** como todo modelo de clasificación médica, puede emitir predicciones seguras pero incorrectas; la calibración reduce pero no elimina este riesgo (ECE calibrado de 0,0598).
- **Dependencia de la modalidad de entrada:** el rendimiento bajo MNAR se evalúa, pero no se publican los números, por lo que se desconoce la degradación real cuando faltan modalidades.
- **Licencia MIT:** permite uso comercial y modificación, pero al ser un modelo médico sin garantías, el usuario asume toda la responsabilidad legal y ética.
- **Documentación incompleta:** no se especifican parámetros, arquitectura detallada, datos de entrenamiento ni requisitos de hardware, lo que dificulta la reproducibilidad y la evaluación independiente.
- **Sin soporte de texto ni instrucciones:** no es un modelo conversacional; no admite prompts en lenguaje natural ni tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/theshoaibme/PanOrgan-3
- Repositorio de código: no disponible
- Paper: no disponible
- Blog o demo: no disponible
- Figuras de evaluación: incluidas en el repositorio bajo `figures/` (v3_calibration_comparison.png, v3_conformal_coverage.png, v3_confusion_matrix.png, v3_mnar_stress.png, v3_precision_recall_metrics.png, v3_segmentation_dice.png, v3_train_loss.png, v3_val_accuracy_f1.png)
- Informe de evaluación: `thesis_report.json` dentro del repositorio
