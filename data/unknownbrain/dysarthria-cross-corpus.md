# unknownBrain/Dysarthria-Cross-Corpus

## Resumen

Dysarthria-Cross-Corpus es un repositorio de investigacion publicado en Hugging Face por el autor unknownBrain que acompana un preprint academico sobre deteccion automatica de disartria con generalizacion entre corpus. No se trata de un modelo generativo al uso, sino de un paquete reproducible que incluye codigo, resultados experimentales, figuras y el PDF del articulo "Evaluating Multimodal Fusion and Representation Disentanglement for Cross-Corpus Dysarthria Detection", firmado por Jainam Dedhia, Rujuta Salvi y Bhakti Sonawane (SAKEC, Mumbai) y enviado a *Biomedical Signal Processing and Control* en noviembre de 2026.

El trabajo aborda un problema clasico en el analisis de habla patologica: los detectores de disartria rinden bien dentro del corpus de origen (incluso con particiones speaker-independent LOSO) pero se degradan al aplicarse a cohortes de pacientes no vistas. La propuesta combina caracteristicas espectrales artesanales (MFCC y CQCC con derivadas) procesadas por ramas 1D-CNN, embeddings congelados de `facebook/wav2vec2-base`, y varias estrategias de fusion multimodal y desenredado de representaciones (concatenacion, gating, Gradient Reversal Layer y disentanglement por subespacios ortogonalizados).

La relevancia actual es metodologica: el repositorio documenta de forma transparente la brecha entre rendimiento intra-corpus y zero-shot, incluyendo diagnosticos de calibracion, deriva distribucional mediante distancia de Wasserstein y sondas de identidad de corpus. El tamano del repositorio es de 0.0 GB segun los metadatos, lo que sugiere que los pesos binarios no estan subidos y solo se distribuyen codigo y resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal: ramas 1D-CNN sobre MFCC (60-D + delta + delta-delta) y CQCC (40-D + delta) + encoder congelado `facebook/wav2vec2-base` con pooling medio; variantes de fusion por concatenacion, gating, GRL y disentanglement por subespacios |
| Parametros totales | no disponible (no se publican recuentos; el backbone wav2vec2-base congelado ronda los 95 M, pero el total del pipeline no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion por utterance, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (tag `en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no incluye pesos; solo codigo Python, CSVs, logs y figuras) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de clasificacion binaria de disartria con dos flujos de caracteristicas. El primero procesa representaciones espectrales artesanales (MFCC de 60 dimensiones con primeras y segundas derivadas, y CQCC de 40 dimensiones con primeras derivadas) mediante ramas 1D-CNN implementadas en `AcousticCNNEncoder` dentro de `src/q1_pipeline.py`. El segundo extrae embeddings de `facebook/wav2vec2-base` congelado, aplicando pooling medio sobre los frames validos no rellenados. Sobre estas representaciones se aplican cuatro variantes: fusion por concatenacion, fusion con gating, entrenamiento con Gradient Reversal Layer (lambda=0.2) para invariancia al hablante, y disentanglement por subespacios con regularizacion de ortogonalidad que separa una representacion de patologia (z_d) de una de hablante (z_s).

El entrenamiento se evalua sobre TORGO (15 hablantes, 15-fold LOSO con 3 semillas: 42, 43 y 44, totalizando 45 ejecuciones por condicion) y sobre Toronto NeuroFace en modo zero-shot (ALS y post-ictus). Los diagnosticos incluyen sondas lineales y MLP de identidad de hablante, monitoreo de calibracion de scores de prediccion, distancia de Wasserstein 1-D (`scipy.stats.wasserstein_distance`) para medir deriva de caracteristicas y sondas lineales de identificacion de corpus. No se especifica el numero de tokens ni la composicion exacta del dataset de entrenamiento mas alla de los corpus citados.

## Capacidades

- Clasificacion binaria de disartria a partir de audio de habla (utterance-level).
- Extraccion de caracteristicas espectrales artesanales: MFCC de 60 dimensiones con delta y delta-delta, CQCC de 40 dimensiones con delta.
- Extraccion de embeddings de habla auto-supervisados mediante `facebook/wav2vec2-base` congelado.
- Fusion multimodal de representaciones acusticas y SSL (concatenacion y gating).
- Entrenamiento con invariancia al hablante mediante Gradient Reversal Layer.
- Disentanglement de representaciones en subespacios de patologia y de hablante con regularizacion de ortogonalidad.
- Diagnostico de generalizacion cross-corpus: sondas de identidad de hablante (lineal y MLP), sondas de identificacion de corpus, calibracion de scores y deriva distribucional por Wasserstein.
- Evaluacion speaker-independent mediante LOSO (leave-one-speaker-out) multi-semilla.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo.
- Capacidad multilingue limitada al ingles segun el tag de idioma.

## Casos de uso

- Investigacion en deteccion de disartria: el pipeline sirve como linea base reproducible para comparar estrategias de fusion y desenredado en corpus como TORGO, con 45 ejecuciones por condicion y semillas fijas.
- Evaluacion de generalizacion cross-corpus: util para estudiar la caida de rendimiento zero-shot en Toronto NeuroFace (ALS y post-ictus) y cuantificarla con metricas de calibracion y Wasserstein.
- Analisis de invariancia al hablante: las sondas lineales y MLP de identidad de hablante permiten medir cuanto información de hablante retiene cada representacion, algo critico antes de desplegar un detector en cohortes nuevas.
- Estudio de calibracion en modelos clinicos: los logs de scores medios en TORGO frente a NeuroFace documentan el colapso de calibracion (por ejemplo, 0.983 en TORGO frente a 0.084 en NeuroFace para el cuello de botella de 16D), util para disenar umbrales robustos.
- Reproduccion de experimentos para publicaciones: el repositorio incluye `requirements.txt`, scripts (`q1_pipeline.py`, `grl_ablation_diagnostic.py`, `final_diagnostic.py`, `grl_diagnostic.py`, `plot_grl.py`), CSVs sin modificar y logs de ejecucion, lo que facilita la replicacion por parte de revisores o grupos de investigacion.
- Docencia en aprendizaje profundo aplicado a senales biomedicas: el codigo y las figuras (diagrama de arquitectura y proyeccion t-SNE de subespacios z_s frente a z_d) sirven como material didactico sobre fusion multimodal y disentanglement.
- Desarrollo de herramientas de cribado asistido: aunque no es un producto clinico, el pipeline puede adaptarse como prototipo de cribado de disartria en entornos de investigacion con datos en ingles.

## Benchmarks y rendimiento

Resultados multi-semilla en TORGO (15-fold LOSO, semillas 42/43/44) y zero-shot en Toronto NeuroFace:

| Condicion | TORGO Acc | TORGO Bal. Acc | TORGO ROC-AUC | NeuroFace ZS Acc | NeuroFace ZS AUC |
|---|---|---|---|---|---|
| `w2v2_only` | 0.632 ± 0.015 | 0.580 ± 0.012 | 0.620 ± 0.017 | **0.583 ± 0.005** | 0.510 ± 0.002 |
| `acoustic_only` | 0.626 ± 0.031 | 0.612 ± 0.018 | 0.662 ± 0.020 | 0.403 ± 0.005 | 0.567 ± 0.010 |
| `concat_fusion` | **0.670 ± 0.015** | **0.649 ± 0.005** | **0.719 ± 0.016** | 0.360 ± 0.009 | 0.551 ± 0.016 |
| `gated_baseline` | 0.628 ± 0.030 | 0.610 ± 0.020 | 0.639 ± 0.044 | 0.378 ± 0.031 | 0.559 ± 0.019 |
| `invariant` (GRL) | 0.651 ± 0.023 | 0.636 ± 0.025 | 0.676 ± 0.053 | 0.392 ± 0.011 | **0.576 ± 0.019** |
| `disentangled` | 0.649 ± 0.048 | 0.632 ± 0.036 | 0.677 ± 0.058 | 0.370 ± 0.025 | 0.544 ± 0.023 |

Ablaciones de cuello de botella de identidad de hablante (holdout F01, 15 epocas):

| Modelo | Dim | TORGO F01 Acc | Sonda lineal hablante | Sonda MLP hablante | NeuroFace ZS Acc |
|---|---|---|---|---|---|
| Wav2Vec2-only | 128D | 81.3% | 76.4% | 85.8% | **58.2%** |
| Acoustic-only | 128D | 100.0% | 83.7% | 82.2% | 42.9% |
| Concat Fusion | 256D | 100.0% | 91.1% | 90.9% | 38.8% |
| Gated Fusion | 128D | 98.5% | 85.9% | 82.4% | 45.9% |
| Cuello de botella 16D | 16D | 98.5% | **64.3%** | **65.1%** | 32.7% |

Deriva distribucional y colapso de calibracion (holdout F01, 15 epocas):

| Modelo | Dim | TORGO Acc | NeuroFace ZS Acc | Score medio TORGO | Score medio NeuroFace | Wasserstein 1-D medio | Sonda de corpus |
|---|---|---|---|---|---|---|---|
| Wav2Vec2-only | 128D | 79.9% | **61.2%** | 0.732 | **0.596** | **0.122** | 97.9% |
| Acoustic-only | 128D | 100.0% | 40.8% | 0.999 | 0.177 | 2.439 | 95.7% |
| Concat Fusion | 256D | 97.0% | 36.7% | 0.969 | 0.096 | 1.400 | 97.9% |
| Gated Fusion | 128D | 100.0% | 36.7% | 0.995 | 0.100 | 2.848 | 97.9% |
| Cuello de botella 16D | 16D | 98.5% | 35.7% | 0.983 | 0.084 | 13.162 | 93.6% |
| Asymmetric SSL | 128D | 99.3% | 37.8% | 0.992 | 0.167 | 1.007 | 100.0% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el backbone `facebook/wav2vec2-base` congelado (aproximadamente 95 M de parametros) cabe holgadamente en GPUs de consumo, pero el pipeline completo incluye ramas 1D-CNN cuyos requisitos exactos no se publican.
- GPU recomendadas: no se especifican en la documentacion; por el tamano del backbone, una RTX 3060 o superior seria suficiente para inferencia del encoder, aunque no hay confirmacion oficial.
- Cabe en GPU de consumo: previsiblemente si, dado que el backbone es wav2vec2-base congelado y las ramas adicionales son 1D-CNN ligeras, pero no se aporta medicion de VRAM.
- Opciones de despliegue: el repositorio es codigo Python de investigacion (PyTorch, segun `requirements.txt`), no un modelo servible con vLLM, llama.cpp, Ollama o TGI; el despliegue requeriria adaptar `src/q1_pipeline.py`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dysarthria-Cross-Corpus (este) | Pipeline de clasificacion de disartria | no disponible | no aplica | MIT | Codigo y resultados en HF; sin pesos |
| `facebook/wav2vec2-base` | Encoder SSL de habla | ~95 M | no aplica (encoder) | MIT (upstream) | Pesos publicos en HF |
| Modelos de deteccion de disartria basados en wav2vec2 fine-tuned | Clasificadores especificos | variable | no aplica | variable | Depende de cada publicacion |

No se dispone de datos comparativos de rendimiento frente a otros detectores de disartria en la informacion proporcionada; la comparativa se limita a la relacion con el backbone upstream.

## Limitaciones y advertencias

- El repositorio no incluye pesos entrenados; solo codigo, resultados, figuras y el PDF del preprint. No es un modelo listo para usar en produccion.
- El rendimiento zero-shot en Toronto NeuroFace cae drasticamente en la mayoria de variantes (por ejemplo, 0.360 en `concat_fusion` frente a 0.670 en TORGO), lo que evidencia un problema de generalizacion no resuelto.
- Colapso de calibracion documentado: los scores medios caen de valores cercanos a 1.0 en TORGO a valores por debajo de 0.2 en NeuroFace en varias condiciones, lo que invalida umbrales fijos entre corpus.
- Las sondas de identificacion de corpus alcanzan precisiones del 93.6%-100%, indicando que las representaciones retienen informacion del corpus de origen y no son invariantes al dominio.
- Solo se evalua en ingles (tag `en`), por lo que no hay evidencia de funcionamiento en otras lenguas.
- El corpus TORGO es pequeno (15 hablantes) y la evaluacion se limita a un holdout adicional (F01) en varias ablaciones, lo que reduce la robustez estadistica de esas tablas.
- Existe una discrepancia declarada por los autores (Disclosure D3) entre los valores de macro-F1 registrados en `results/q1_journal_results.csv` y los de la Tabla 1 del manuscrito, lo que exige cautela al citar esas cifras.
- El articulo es un preprint enviado a revision (noviembre de 2026) y no consta aceptacion; los resultados no han pasado revisión por pares en la informacion disponible.
- Uso clinico: no es una herramienta diagnostica validada; cualquier aplicacion medica requeriria validacion regulatoria adicional.
- La licencia MIT permite uso comercial del codigo, pero los datos de TORGO y Toronto NeuroFace tienen sus propias condiciones que deben respetarse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/unknownBrain/Dysarthria-Cross-Corpus
- PDF del preprint (dentro del repo): `paper/Evaluating_Multimodal_Fusion_and_Representation_Disentanglement_for_Cross_Corpus_Dysarthria_Detection.pdf`
- Backbone upstream: https://huggingface.co/facebook/wav2vec2-base
- No se han proporcionado enlaces adicionales a papers, blogs, repos o demos en la informacion disponible.
