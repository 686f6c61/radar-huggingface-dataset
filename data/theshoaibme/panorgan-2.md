# theshoaibme/PanOrgan-2

## Resumen

PanOrgan-2 es un modelo fundacional de imagen médica desarrollado por MD. Shoaib Khan y Asmita Rahman en el Departamento de Ciencia de la Computación e Ingeniería de la Daffodil International University (Bangladesh), como proyecto de fin de grado (CSE499 FYDP, primavera de 2026) bajo la supervisión de Dr. Md. Ali Hossain. Se presenta como el primer release unificado multicohorte de la familia PanOrganNetV2, un modelo que aborda conjuntamente segmentación y clasificación sobre tres modalidades de imagen médica: resonancia magnética (MRI), tomografía computarizada (CT) y ecografía (US).

El modelo se distribuye como un checkpoint de PyTorch (`best.pt`) acompañado de la definición arquitectónica en `modeling_panorgan.py` y un informe de evaluación (`thesis_report.json`). Según la model card, se entrenó en hardware Apple M4 mediante MPS con un esquema de preentrenamiento autosupervisado denominado MA-UGM, calibración de temperatura y predicción conformal MC2 con abstención. Las cohortes de entrenamiento declaradas son `prostatex_mri`, `kidney_ct_mri` y `ultrasound_nerve`.

La relevancia del release es limitada pero concreta: propone un enfoque unificado para segmentación y clasificación multimodal en imagen médica con cuantificación de incertidumbre (conformal prediction) integrada, un aspecto poco frecuente en modelos fundacionales médicos publicados en Hugging Face. No obstante, los resultados cuantitativos publicados son parciales y la información sobre arquitectura, tamaño y datos de entrenamiento es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PanOrganNetV2 (definida en `modeling_panorgan.py`; no se detalla en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multimodal de imagen médica, sin capacidades de texto declaradas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`); tamano del repo 0.8 GB |

## Arquitectura y entrenamiento

La model card identifica el backbone como `PanOrganNetV2`, definido en el fichero `modeling_panorgan.py` incluido en el repositorio, pero no especifica el tipo de arquitectura (transformer, CNN, híbrida), el número de parámetros ni la composición detallada de las capas. El entrenamiento se realizó sobre Apple M4 con el backend MPS, lo que sugiere un modelo de escala moderada compatible con memoria unificada de un equipo de consumo.

El esquema de entrenamiento combina tres elementos declarados: preentrenamiento autosupervisado MA-UGM (sin más detalle en la información disponible), calibración de temperatura sobre las salidas de clasificación y predicción conformal MC2 con tasa de abstención. Las cohortes de entrenamiento son tres (`prostatex_mri`, `kidney_ct_mri`, `ultrasound_nerve`), mientras que la evaluación de segmentación se reporta sobre `busi` y `tcga_lgg`, que no aparecen como cohortes de entrenamiento. No se indica el número de tokens, imágenes ni el volumen del dataset, ni si hubo ajuste por RLHF o DPO (poco probable en un modelo de imagen médica).

## Capacidades

- Segmentación de estructuras anatómicas en MRI, CT y ecografía.
- Clasificación diagnóstica multiclase sobre las mismas modalidades.
- Predicción conformal (MC2) con cobertura calibrada y tasa de abstención, orientada a cuantificar incertidumbre.
- Calibración de probabilidades mediante temperature scaling.
- Procesamiento conjunto de tres modalidades de imagen médica en un único modelo.
- Robustez evaluada frente a missingness MNAR (figura `v2_mnar_stress.png`).
- No se declaran capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Segmentación asistida en radiología: el modelo puede delimitar órganos y lesiones en estudios de próstata (MRI), riñón (CT/MRI) y nervios periféricos (ecografía), sirviendo como preprocesado para pipelines de planificación quirúrgica o radioterapia.
- Triaje con abstención: gracias a la predicción conformal MC2, el sistema puede derivar casos de baja confianza a revisión humana, lo que resulta adecuado en entornos clínicos donde un falso negativo tiene coste elevado.
- Investigación en imagen médica multimodal: al unificar tres modalidades en un solo checkpoint, facilita experimentos de transferencia entre cohortes y comparación de calibración entre dominios.
- Docencia y reproducción académica: el repositorio incluye la definición del modelo y el informe de evaluación, lo que permite reproducir los experimentos del TFG en un entorno controlado.
- Prototipado de sistemas de cribado: como base para construir clasificadores con umbrales de abstención ajustables según la prevalencia de cada cohorte.
- Evaluación de robustez ante datos faltantes: la figura de estrés MNAR permite estudiar el comportamiento del modelo en escenarios de missingness no aleatoria, relevante en datos clínicos reales.
- Benchmarking de calibración: útil como referencia para comparar técnicas de calibración y conformal prediction en modelos de imagen médica.

## Benchmarks y rendimiento

Resultados de clasificación y calibración publicados en la model card (procedentes de `thesis_report.json`):

| Metrica | Sin calibrar | Calibrado |
|---|---:|---:|
| macro_f1 | 0.6011 | 0.6011 |
| accuracy | 0.6982 | 0.6982 |
| ece | 0.1296 | 0.1609 |
| brier | 0.4304 | 0.4208 |

Resultados de segmentación (held-out test): las filas para `busi`, `tcga_lgg` y `overall` aparecen con valores `None` (sin datos). La cobertura conformal MC2 (alpha = 0.10) para `per_group` también aparece sin valores. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de referencia en imagen médica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0.8 GB) sugiere un checkpoint del orden de cientos de millones de parámetros como máximo, pero no se confirma.
- GPU recomendadas: no disponibles. El entrenamiento se realizó en Apple M4 vía MPS, lo que indica compatibilidad con memoria unificada de un equipo de consumo.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del checkpoint, aunque no se confirma en la documentación.
- Opciones de despliegue: PyTorch nativo (carga mediante `torch.load` y `hf_hub_download`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos fundacionales de imagen médica (por ejemplo, MONAI, MedSAM o modelos de segmentación panorgánica), ya que la model card no incluye comparaciones ni especifica parámetros, contexto o rendimiento en benchmarks estándar. Se indica "no disponible".

## Limitaciones y advertencias

- Resultados de segmentación no publicados: las métricas Dice, IoU y HD95 aparecen como `None` en el informe, por lo que no es posible verificar la calidad de la segmentación.
- Cobertura conformal no reportada: la tabla MC2 no contiene valores, lo que impide validar la calibración empírica del mecanismo de abstención.
- Calibración cuestionable: el ECE empeora tras la calibración (0.1296 → 0.1609), lo que sugiere que el temperature scaling no está bien ajustado o que el conjunto de calibración no es representativo.
- Rendimiento de clasificación moderado: accuracy de 0.6982 y macro F1 de 0.6011, con Brier score de 0.4304, indican un modelo con margen de mejora sustancial antes de uso clínico.
- Arquitectura y tamaño no documentados: la ausencia de detalles sobre parámetros, capas y datos de entrenamiento dificulta la reproducibilidad y la evaluación independiente.
- Cohorte de evaluación distinta de la de entrenamiento: la segmentación se evalúa en `busi` y `tcga_lgg`, no incluidas entre las cohortes de entrenamiento, sin que se explique el protocolo de transferencia.
- Riesgo de alucinación y sesgo: no evaluado en la documentación; en imagen médica, los sesgos por cohorte (edad, etnia, equipo de adquisición) son un riesgo relevante no cuantificado aquí.
- Licencia MIT: permite uso comercial, pero al tratarse de un modelo médico sin validación regulatoria, no debe emplearse en decisiones clínicas sin supervisión facultativa.
- Modelo de nicho con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/theshoaibme/PanOrgan-2
- Repositorio de pesos: `best.pt` (incluido en el repo de Hugging Face)
- Definición del modelo: `modeling_panorgan.py` (incluido en el repo)
- Informe de evaluación: `thesis_report.json` (incluido en el repo)
- Figuras de evaluación: carpeta `figures/` (7 PNG) en el repo de Hugging Face
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web.
