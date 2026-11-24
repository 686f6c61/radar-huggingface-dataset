# theshoaibme/PanOrgan-3.2

## Resumen

PanOrgan-3.2 es un modelo fundacional multimodal para imagen médica desarrollado por MD. Shoaib Khan y Asmita Rahman en el Departamento de Ciencia de la Computación e Ingeniería (CSE499 FYDP, primavera de 2026) de la Daffodil International University, bajo la supervisión de Dr. Md. Ali Hossain y Mayen Uddin Mojumder. El modelo aborda el cribado y diagnóstico multiórgano combinando cinco modalidades de imagen (MRI, CT, ecografía, radiografía de tórax y mamografía) en un único backbone denominado `PanOrganNetV2`.

La release integra 11 cohortes de entrenamiento (KiTS23, CMMD, CBIS-DDSM, VinDr-Mammo, ProstateX, TCGA-KIRC, entre otras) con 20.175 muestras y 9.381 pacientes únicos, sin fuga de datos a nivel de paciente. Además de tareas de clasificación y segmentación, incorpora calibración de temperatura y predicción conformal multiclase (MC2) con abstención, orientadas a un uso clínico prudente donde el modelo debe declarar incertidumbre.

El checkpoint se distribuye como `best.pt` (0,7 GB) junto con la definición del modelo en `modeling_panorgan.py`, un `config.json` y un `thesis_report.json` con métricas de test. Es relevante ahora por su enfoque en calibración y conformal prediction aplicadas a imagen médica multi-modal, un área donde la fiabilidad probabilística es tan crítica como la precisión bruta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `PanOrganNetV2` (definida en `modeling_panorgan.py`); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen médica) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

El backbone es `PanOrganNetV2`, cuya definición completa se incluye en el repositorio como `modeling_panorgan.py`. La model card no detalla la topología interna (número de capas, tipo de bloques, mecanismos de atención ni estrategia de fusión multimodal), por lo que la arquitectura concreta no está disponible en la información proporcionada. El modelo es multimodal en el sentido de que consume cinco modalidades de imagen médica (MRI, CT, US, CXR y MG) y produce salidas de clasificación y segmentación.

El entrenamiento se realizó sobre 11 cohortes: `pulmonary_cxr`, `cxr_multiclass`, `busi_breast_us`, `ultrasound_nerve`, `kidney_ct_mri`, `kits23_ct`, `tcga_kirc_ct`, `cbis_ddsm`, `vindr_mammo_mg`, `cmmd_mg` y `prostatex_mri`, sumando 20.175 muestras de 9.381 pacientes con ausencia declarada de fuga a nivel de paciente. Se reporta calibración post-hoc mediante temperature scaling con temperatura óptima T = 1,1851, además de un módulo de predicción conformal multiclase (MC2) con tasa de abstención. No se especifican el número de tokens/epochs, la composición exacta del dataset ni si se emplearon técnicas de aumento o regularización específicas.

## Capacidades

- Clasificación multimodal de imágenes médicas en cinco modalidades: MRI, CT, ecografía, radiografía de tórax y mamografía.
- Segmentación de estructuras anatómicas y lesiones (las métricas reportadas para segmentación aparecen como `None` en el JSON proporcionado).
- Calibración probabilística mediante temperature scaling (ECE reducido de 0,0845 a 0,0479 tras calibración).
- Predicción conformal multiclase (MC2) con cobertura marginal objetivo y capacidad de abstención ante casos inciertos.
- Manejo de cohortes heterogéneas multi-órgano y multi-modalidad en un único backbone.
- Soporte para escenarios de datos faltantes (se incluye una figura de estrés MNAR, aunque los valores numéricos no están disponibles).
- No se reporta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje.

## Casos de uso

- Cribado pulmonar en radiografía de tórax: el modelo clasifica imágenes CXR de las cohortes `pulmonary_cxr` y `cxr_multiclass`, útil como segunda lectura en programas de detección precoz donde se requiere priorizar casos sospechosos.
- Segmentación renal en CT y MRI: entrenado con KiTS23 y TCGA-KIRC, puede emplearse para delimitar riñón y lesiones en estudios de imagen abdominal, apoyando la volumetría y el seguimiento tumoral.
- Análisis de mamografía: con las cohortes CBIS-DDSM, VinDr-Mammo y CMMD, el modelo puede integrarse en flujos de triaje de mamografías para clasificación de hallazgos y apoyo al radiólogo.
- Ecografía mamaria y de nervios: las cohortes `busi_breast_us` y `ultrasound_nerve` permiten su uso en clasificación/segmentación de ecografías, por ejemplo en detección de lesiones mamarias o localización de nervios periféricos.
- Investigación en prostate MRI: la cohorte ProstateX habilita experimentos de clasificación de lesiones prostáticas en MRI, útil en estudios académicos de cáncer de próstata.
- Despliegue con abstención en entornos clínicos: gracias a la predicción conformal MC2 y a la calibración de temperatura, el modelo puede configurarse para derivar casos a revisión humana cuando la incertidumbre supera un umbral, reduciendo el riesgo de decisiones automáticas erróneas.
- Benchmarking multi-modalidad: como foundation model con 11 cohortes y partición sin fuga de paciente, sirve de línea base reproducible para investigaciones que comparen arquitecturas de imagen médica.

## Benchmarks y rendimiento

Clasificación y calibración (test held-out, según `thesis_report.json`):

| Métrica | Sin calibrar | Calibrado |
|---|---:|---:|
| macro_f1 | 0,8479 | 0,8479 |
| accuracy | 0,7897 | 0,7897 |
| ECE | 0,0845 | 0,0479 |
| Brier | 0,3331 | 0,3253 |

Temperatura óptima T = 1,1851.

Segmentación (test held-out): las filas para `busi`, `tcga_lgg`, `pulmonology_cxr`, `ultrasound_nerve`, `pulmonology_cxr_ext` y `overall` aparecen con valores `None` (Dice, IoU y HD95 no publicados en el JSON citado).

Cobertura conformal MC2 (alpha = 0,10): la fila `per_group` aparece con valores `None` (cobertura marginal, tamaño medio de conjunto y tasa de abstención no publicados).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint ocupa 0,7 GB en disco, lo que sugiere un modelo de tamaño moderado que probablemente quepa en GPUs de consumo (8-16 GB) en FP32/FP16, aunque no se confirma.
- GPU recomendadas: no disponible. Por tamaño del checkpoint, una RTX 3090/4090 o A100/H100 serían suficientes para inferencia y fine-tuning, pero el autor no lo especifica.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del checkpoint, aunque no hay confirmación oficial.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre `best.pt`) e importación de `PanOrganNetV2` desde `modeling_panorgan.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos fundacionales de imagen médica (por ejemplo, MedSAM, BiomedCLIP o RadImageNet), ni datos de rendimiento cruzado que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Métricas de segmentación y de cobertura conformal no publicadas (valores `None` en el JSON citado), lo que impide verificar el rendimiento en esas tareas.
- Ausencia de detalles arquitectónicos y de entrenamiento (número de parámetros, tokens, estrategia de fusión), lo que dificulta la reproducibilidad y la comparación.
- Riesgo de sesgo por cohortes: el conjunto combina datasets de origen geográfico y demográfico heterogéneo; el rendimiento puede degradarse en poblaciones no representadas.
- Riesgo de alucinación/clasificación errónea en casos fuera de distribución; la calibración mitiga pero no elimina este riesgo.
- El modelo no es un dispositivo médico: no se reporta validación regulatoria (CE, FDA) ni estudios clínicos prospectivos.
- Licencia MIT permite uso comercial, pero la responsabilidad clínica recae en el implementador; conviene revisar las licencias de los datasets de entrenamiento subyacentes.
- No hay información sobre idiomas, tool calling ni capacidades de lenguaje; no debe usarse como modelo conversacional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/theshoaibme/PanOrgan-3.2
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
