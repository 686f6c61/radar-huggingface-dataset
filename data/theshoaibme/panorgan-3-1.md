# theshoaibme/PanOrgan-3.1

## Resumen

PanOrgan 3.1 es un modelo fundacional multimodal para imagen médica desarrollado por el equipo de MD. Shoaib Khan y Asmita Rahman en el Departamento de Ingeniería Informática de la Daffodil International University (Bangladesh), bajo la supervisión de Dr. Md. Ali Hossain, como proyecto de fin de grado (CSE499 FYDP, primavera de 2026). El modelo aborda dos tareas simultáneas sobre cinco modalidades de imagen médica: clasificación diagnóstica y segmentación anatómica, añadiendo además calibración de probabilidades y predicción conformal para cuantificar la incertidumbre.

La versión 3.1 amplía las cohortes de entrenamiento a ocho conjuntos públicos (CXR pulmonar, ecografía mamaria BUSI, CT/MRI renal, ecografía de nervios, mamografía VinDr, CT de carcinoma renal TCGA-KIRC, CBIS-DDSM y MRI de próstata ProstateX), sumando 14.915 muestras de 8.213 pacientes únicos. La innovación declarada es la regularización MixUp entre modalidades, que mezcla muestras de distintas modalidades durante el entrenamiento para forzar representaciones compartidas.

El modelo se distribuye como checkpoint PyTorch (`best.pt`) junto con la definición del backbone `PanOrganNetV2` en `modeling_panorgan.py`. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que opera sobre tensores de imagen. Su relevancia radica en la combinación poco habitual de clasificación, segmentación y predicción conformal en un único backbone multimodal con licencia MIT, aunque la ausencia de métricas de segmentación y de cobertura conformal publicadas limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `PanOrganNetV2` (backbone multimodal definido en `modeling_panorgan.py`; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (solo checkpoint PyTorch `best.pt`; no se publican GGUF ni ONNX) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |
| Modalidades de entrada | MRI, CT, ecografia (US), radiografia de torax (CXR), mamografia (MG) |
| Tamano del repositorio | 0,7 GB |
| Tareas | Clasificacion, segmentacion, calibracion (temperature scaling), prediccion conformal MC2 |
| Cohorts de entrenamiento | 8 (`pulmonary_cxr`, `busi_breast_us`, `kidney_ct_mri`, `ultrasound_nerve`, `vindr_mammo_mg`, `tcga_kirc_ct`, `cbis_ddsm`, `prostatex_mri`) |
| Muestras / pacientes | 14.915 muestras / 8.213 pacientes unicos |

## Arquitectura y entrenamiento

El backbone `PanOrganNetV2` se define en el fichero `modeling_panorgan.py` incluido en el repositorio, pero la model card no describe su topologia interna: no se especifica si emplea un ViT, un CNN tipo ResNet/EfficientNet, un hibrido, ni el numero de capas, dimensiones de embedding o mecanismos de atencion. Tampoco se detalla el tokenizador de parches ni como se unifican las cinco modalidades (posiblemente mediante canales de entrada adaptados o proyecciones por modalidad), aunque la presencia de MixUp entre modalidades sugiere un espacio latente compartido.

El entrenamiento cubre ocho cohortes con 14.915 muestras de 8.213 pacientes. La innovacion declarada es la regularizacion MixUp cross-modal, que mezcla pares de imagenes de modalidades distintas (por ejemplo, CXR y MRI) para mejorar la generalizacion entre dominios. Se aplica calibracion post-hoc mediante temperature scaling con temperatura optima T = 1,0354. No se documenta el numero de tokens, la composicion exacta del dataset, el uso de RLHF/DPO (no aplicable a vision) ni tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion diagnostica multimodal sobre cinco modalidades de imagen medica (MRI, CT, US, CXR, MG) en un unico backbone.
- Segmentacion anatomica o lesional, aunque las metricas publicadas de Dice, IoU y HD95 aparecen como `None` en la tabla de la model card.
- Calibracion de probabilidades mediante temperature scaling (T = 1,0354), con ECE y Brier score reportados.
- Prediccion conformal MC2 con nivel alpha = 0,10, orientada a cuantificar incertidumbre y permitir abstención del modelo.
- Capacidad de abstención (abstention rate) como mecanismo de seguridad clinica, si bien el valor publicado es `None`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No se declaran capacidades de vision general (solo imagen medica).

## Casos de uso

- Triaje radiologico multimodal: el modelo puede clasificar estudios de CXR, CT y MRI en un mismo pipeline, lo que simplifica el despliegue en servicios de radiologia que manejan varias modalidades y evita mantener un modelo distinto por cada una.
- Segunda lectura en mamografia: entrenado con VinDr-Mammo y CBIS-DDSM, puede emplearse como sistema de apoyo a la decision para marcar estudios sospechosos antes de la revision del radiologo, aunque la ausencia de metricas de segmentacion publicadas exige validacion local previa.
- Segmentacion de organos en CT abdominal: la cohorte TCGA-KIRC (carcinoma renal) permite usar el modelo para delimitar rinon y lesiones en estudios CT, util en planificacion quirurgica y volumetria.
- Ecografia de nervios perifericos: la cohorte `ultrasound_nerve` habilita asistencia en bloqueos nerviosos guiados por ecografia, donde la identificacion precisa de estructuras es critica.
- Investigacion en calibracion e incertidumbre: la combinacion de temperature scaling y prediccion conformal MC2 lo hace adecuado como banco de pruebas para estudiar abstención selectiva en diagnostico asistido, un area activa en IA medica regulada.
- Prototipado academico y docencia: al distribuirse como checkpoint PyTorch con licencia MIT y scripts de modelado, sirve para experimentar con MixUp cross-modal y aprendizaje multi-dominio en cursos de imagen medica.
- Deteccion de cancer de prostata en MRI: la cohorte ProstateX permite explorar clasificacion de lesiones prostaticas, tipicamente como componente de un sistema CAD mas amplio.

## Benchmarks y rendimiento

Los unicos resultados publicados en la model card corresponden a clasificacion y calibracion sobre el conjunto de test reservado:

| Metrica | Sin calibrar | Calibrado |
|---|---:|---:|
| `macro_f1` | 0,8814 | 0,8814 |
| `accuracy` | 0,8557 | 0,8557 |
| `ece` | 0,0611 | 0,0784 |
| `brier` | 0,2483 | 0,2499 |

Resulta llamativo que la calibracion empeora tanto ECE (de 0,0611 a 0,0784) como Brier (de 0,2483 a 0,2499), lo que sugiere que el temperature scaling aplicado no aporta mejora sobre las probabilidades originales.

Las tablas de segmentacion (Dice, IoU, HD95) y de cobertura conformal (cobertura marginal, tamano medio de conjunto, tasa de abstención) aparecen con valores `None` para todas las cohortes, incluida la fila `overall`. No se han publicado resultados de segmentacion ni de cobertura conformal en la informacion disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,7 GB, lo que sugiere un checkpoint en el orden de cientos de millones de parametros en FP32, pero no se confirma el tamano exacto del modelo.
- GPU recomendadas: no especificadas por el autor. Por el tamano del repositorio, es probable que quepa en GPUs consumer (RTX 3060 12 GB, RTX 4090 24 GB) en FP16 o FP32, pero es una estimacion no verificada.
- Cabe en GPU consumer: probablemente si, dado el tamano del checkpoint; sin datos oficiales.
- Opciones de despliegue: solo se documenta carga via `torch.load` con `huggingface_hub`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo). Tampoco se publican exportaciones a ONNX o TorchScript.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modalidades | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PanOrgan 3.1 | Fundacional multimodal medico | MRI, CT, US, CXR, MG | no disponible | no aplica | MIT | Hugging Face (repo 0,7 GB) |
| BiomedCLIP | Vision-language medico | CXR, histologia, etc. | ~86 M (ViT-B/16) | 77 tokens de texto | MIT | Hugging Face |
| MedSAM | Segmentacion medica | Multiples | ~90 M (ViT-B) | no aplica | Apache 2.0 | Hugging Face |
| RadImageNet | Clasificacion radiologica | CT, MRI, US | ResNet-50/DenseNet | no aplica | Uso academico | Solicitud |

La comparacion es orientativa: PanOrgan 3.1 no publica parametros totales ni resultados de segmentacion, por lo que no puede contrastarse cuantitativamente con BiomedCLIP o MedSAM mas alla de la coincidencia de dominio. BiomedCLIP y MedSAM cuentan con evaluaciones publicadas y comunidad activa, mientras que PanOrgan 3.1 tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Las metricas de segmentacion (Dice, IoU, HD95) y de cobertura conformal estan ausentes (`None`) en la model card, lo que impide verificar las capacidades de segmentacion y de abstención declaradas.
- La calibracion empeora ECE y Brier respecto al modelo sin calibrar, lo que cuestiona el beneficio del temperature scaling aplicado.
- No se documenta la arquitectura interna de `PanOrganNetV2` ni el numero de parametros, lo que dificulta la reproducibilidad y la comparacion con alternativas.
- Es un modelo de investigacion academica sin validacion clinica externa, sin aprobacion regulatoria (CE, FDA) y sin evaluacion prospectiva; no debe usarse en decision clinica real.
- Sesgos potenciales derivados de las cohortes publicas utilizadas (predominantemente estadounidenses y europeas), con posible infrarepresentacion de poblaciones del sur de Asia y otras regiones.
- Riesgo de alucinacion en el sentido de falsos positivos o negativos con alta confianza; la calibracion deficiente agrava este riesgo.
- Solo procesa imagen medica; no soporta texto, tool calling ni agentes, por lo que no encaja en pipelines de lenguaje.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de incidencias reportadas.
- Licencia MIT permite uso comercial, pero la ausencia de garantias y de validacion clinica traslada toda la responsabilidad al integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theshoaibme/PanOrgan-3.1
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
