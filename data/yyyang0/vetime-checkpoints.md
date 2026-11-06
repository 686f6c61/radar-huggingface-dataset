# yyyang0/VETime-checkpoints

## Resumen

VETime (Vision-Enhanced Zero-Shot Time Series Anomaly Detection) es un framework de deteccion de anomalias en series temporales desarrollado por Yingyuan Yang, Tian Lan, Yifei Gao, Yimeng Lu, Liming An, Wenjun He, Meng Wang, Chenghao Liu y Chen Zhang, presentado en arXiv (2602.16681) y aceptado en NeurIPS 2026. El repositorio `yyyang0/VETime-checkpoints` contiene los checkpoints oficiales en PyTorch del modelo, con un tamano total de 2,2 GB.

El problema que aborda es el compromiso clasico en deteccion de anomalias temporales: los metodos existentes suelen sacrificar la localizacion temporal de grano fino (anomalias puntuales) a cambio de la comprension de patrones globales (anomalias contextuales de largo alcance), o viceversa. VETime resuelve este trade-off alineando representaciones temporales y visuales y fusionandolas de forma dinamica, lo que permite detectar ambos tipos de anomalia en un unico marco.

La relevancia actual del modelo radica en su enfoque zero-shot: no requiere entrenamiento especifico sobre el dominio objetivo para evaluarse, lo que lo posiciona como candidato a foundation model para deteccion de anomalias. Se evalua sobre el benchmark TSB-AD (univariante y multivariante) y se distribuye con licencia Apache 2.0. No es un modelo de lenguaje: es un modelo multimodal (vision + series temporales) orientado exclusivamente a anomaly detection.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal vision + time-series (conversion a imagen trazable, alineamiento patch-nivel, contraste de ventanas, fusion adaptativa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de serie temporal configurada) |
| Tipos de cuantizacion | no disponible (checkpoints en precision completa PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoints `.pt`/`.pth`; no se distribuye GGUF ni safetensors) |

## Arquitectura y entrenamiento

VETime es un framework multimodal compuesto por cuatro modulos principales. El primero es una **conversion a imagen trazable** (Traceable Image Conversion) que transforma la serie temporal en una representacion visual preservando la correspondencia temporal. El segundo es un **alineamiento temporal a nivel de patch** (Patch-Level Temporal Alignment) que vincula cada patch visual con su posicion en la linea temporal original. El tercero es **aprendizaje contrastivo de ventanas anomalas** (Anomaly Window Contrastive Learning), que separa ventanas normales de anomalas en el espacio de representacion. El cuarto es una **fusion multimodal adaptativa a la tarea** (Task-Adaptive Multi-Modal Fusion) que combina caracteristicas temporales y visuales para localizar anomalias.

El modelo se entrena sobre el benchmark TSB-AD y se disena explicitamente para evaluacion zero-shot. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF/DPO (no aplicables a este dominio). El repositorio incluye scripts de entrenamiento (`config/run_vetime_train.sh`) y evaluacion (`config/run_vetime_test.sh`), asi como un pipeline de evaluacion de baselines. Los requisitos tecnicos son Python 3.8+ (probado con 3.11), PyTorch 2.3.0+ y CUDA 12.1 recomendado.

## Capacidades

- Deteccion de anomalias puntuales en series temporales univariantes (TSB-AD-U) y multivariantes (TSB-AD-M).
- Deteccion de anomalias contextuales de largo alcance mediante comprension de patrones globales.
- Evaluacion zero-shot sin reentrenamiento especifico de dominio.
- Conversion de series temporales a representaciones visuales con correspondencia temporal preservada.
- Alineamiento patch-nivel entre modalidad visual y linea temporal.
- Fusion adaptativa de caracteristicas temporales y visuales para localizacion de anomalias.
- Metricas de evaluacion integradas: VUS-PR, Affiliation metrics, F1-T y Standard-F1.
- Soporte de ejecucion en GPU (CUDA) mediante PyTorch.

## Casos de uso

- Monitorizacion de infraestructura IT: deteccion de picos y caidas anomalas en metricas de servidores (CPU, latencia, throughput) en modo zero-shot, sin necesidad de entrenar por cada servicio desplegado.
- Deteccion de fraude en transacciones: identificacion de patrones anomalos en series de transacciones financieras multivariantes, aprovechando la fusion temporal-visual para captar tanto picos puntuales como cambios de regimen prolongados.
- Mantenimiento predictivo industrial: analisis de series de sensores de maquinaria (vibracion, temperatura, presion) para detectar degradaciones graduales y fallos subitos, con localizacion temporal precisa gracias al alineamiento patch-nivel.
- Monitorizacion de salud con wearables: deteccion de anomalias en series fisiologicas (ritmo cardiaco, actividad, sueno) con capacidad zero-shot para adaptarse a nuevos pacientes sin reentrenamiento.
- Observabilidad de sistemas cloud: analisis de metricas de aplicaciones y contenedores para alertar sobre desviaciones de comportamiento, integrable en pipelines de monitorizacion existentes.
- Investigacion en series temporales: banco de pruebas reproducible sobre TSB-AD-U y TSB-AD-M con metricas estandar (VUS-PR, F1-T) para comparar metodos de anomaly detection.
- Deteccion de anomalias en datos IoT: procesamiento de flujos multivariantes de dispositivos edge, aprovechando la representacion visual compacta para reducir coste computacional frente a modelos puramente temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona que VETime se evalua sobre TSB-AD-U y TSB-AD-M con las metricas VUS-PR, Affiliation metrics, F1-T y Standard-F1, pero no incluye valores concretos ni comparaciones cuantitativas con baselines.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo pesa 2,2 GB, lo que sugiere que la inferencia cabe holgadamente en GPUs consumer con 8-12 GB, aunque no se confirma en la documentacion.
- GPU recomendadas: no especificadas por el autor; CUDA 12.1 recomendado. Cualquier GPU NVIDIA con soporte CUDA 12.1 es compatible.
- Cabe en GPU consumer: probablemente si, dado el tamano del repo (2,2 GB), pero no confirmado oficialmente.
- Opciones de despliegue: PyTorch nativo (scripts `config/run_vetime_train.sh`, `config/run_vetime_test.sh`, entrada directa `Test_TSB.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VETime | Multimodal vision + time-series | no disponible | no disponible | Zero-shot anomaly detection con fusion visual-temporal | Apache 2.0 | Hugging Face (checkpoints) + GitHub |
| Time-RCD | Foundation model time-series | no disponible | no disponible | Zero-shot anomaly detection con datos sinteticos y discrepancia de contexto relativo (ICML 2026) | no disponible | GitHub (referenciado por VETime) |
| TSB-AD baselines | Multiples metodos | variable | variable | Benchmark de anomaly detection (NeurIPS 2024) | variable | GitHub (TheDatumOrg/TSB-AD) |

No se dispone de datos cuantitativos de rendimiento para establecer una comparacion numerica con alternativas. Time-RCD se cita como referencia directa en la model card y comparte el objetivo zero-shot, pero no se aportan metricas comparativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no soporta generacion de texto, codigo, tool calling ni agentes. Su unico proposito es anomaly detection en series temporales.
- No se han publicado resultados numericos de benchmarks en la informacion disponible, lo que impide verificar cuantitativamente sus afirmaciones de rendimiento.
- El rendimiento zero-shot puede degradarse en dominios muy alejados de la distribucion de TSB-AD; no se documenta la robustez fuera de ese benchmark.
- La conversion a imagen introduce una dependencia de la resolucion y del esquema de visualizacion; no se detalla como afecta a series de muy alta frecuencia o muy largas.
- No se especifican sesgos conocidos ni riesgos de alucinacion (no aplica el concepto de alucinacion en el sentido de LLM, pero si el riesgo de falsos positivos/negativos en deteccion).
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como checkpoints de investigacion; no hay garantias de soporte ni mantenimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica baja validacion por parte de la comunidad.
- Requiere descarga separada de los datasets TSB-AD-U y TSB-AD-M desde thedatum.org para reproducir la evaluacion.

## Enlaces

- Hugging Face: https://huggingface.co/yyyang0/VETime-checkpoints
- arXiv: https://arxiv.org/abs/2602.16681
- GitHub: https://github.com/yyyangcoder/VETime
- Dataset TSB-AD-U: https://www.thedatum.org/datasets/TSB-AD-U.zip
- Dataset TSB-AD-M: https://www.thedatum.org/datasets/TSB-AD-M.zip
- Benchmark TSB-AD: https://github.com/TheDatumOrg/TSB-AD
- Time-RCD (referencia): https://github.com/thu-sail-lab/Time-RCD
