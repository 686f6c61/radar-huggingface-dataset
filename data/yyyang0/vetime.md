# yyyang0/VETime

## Resumen

VETime es un framework de deteccion de anomalias en series temporales en regimen zero-shot que combina representaciones temporales y visuales. Lo desarrolla yyyang0 (con vinculacion al laboratorio THU-SAL) y se distribuye bajo licencia Apache 2.0. El trabajo fue aceptado en NeurIPS 2026 y cuenta con un articulo en arXiv (2602.16681). El repositorio de Hugging Face distribuye codigo fuente y utilidades de evaluacion; los pesos preentrenados se alojan por separado en `yyyang0/VETime-checkpoints`.

El problema que aborda es el compromiso clasico en deteccion de anomalias: los metodos centrados en localizacion temporal fina pierden comprension global de patrones, mientras que los enfoques globales sacrifican precision en la localizacion. VETime convierte la serie temporal en una imagen trazable que preserva la correspondencia temporal, alinea los parches visuales con la linea temporal original y fusiona de forma adaptativa ambas modalidades para localizar anomalias puntuales y anomalias contextuales de largo alcance.

Es relevante porque propone un paradigma multimodal (tiempo + vision) para una tarea tradicionalmente unimodal, con evaluacion estandarizada sobre el benchmark TSB-AD (variantes univariante TSB-AD-U y multivariante TSB-AD-M). No se dispone de datos publicos sobre numero de parametros, longitud de contexto ni volumen de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework multimodal con encoder visual (MAE, pesos `mae_visualize_base.pth`) y encoder de series temporales, con modulo de alineamiento y fusion visual-temporal (VTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pth` de PyTorch) |
| Idiomas soportados | no disponible (tarea no linguistica: series temporales numericas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (checkpoint PyTorch); el repositorio principal contiene codigo fuente |

## Arquitectura y entrenamiento

VETime es un framework multimodal compuesto por cuatro bloques: (1) conversion trazable de series temporales a imagen, que preserva la correspondencia temporal; (2) alineamiento a nivel de parche entre las representaciones visuales y la linea temporal original; (3) aprendizaje contrastivo por ventanas de anomalia, que separa ventanas normales de anomalas; y (4) fusion multimodal adaptativa a la tarea, que combina caracteristicas temporales y visuales para la localizacion de anomalias. El codigo incluye modulos separados para el encoder visual (`model/Vision_encoder/`) y el encoder temporal (`model/TS_encoder/`), ademas del modulo de alineamiento y fusion (`model/VTS_module.py`).

El modelo se entrena con perdidas definidas en `loss/` y se evalua en regimen zero-shot sobre TSB-AD. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de preentrenamiento, ni si se emplearon tecnicas de RLHF/DPO (poco probables en una tarea de deteccion de anomalias). El checkpoint principal es `VETime.pth` y el encoder visual se inicializa desde `mae_visualize_base.pth`. La implementacion requiere Python 3.8+ (probado en 3.11), PyTorch 2.3.0+ y CUDA 12.1 recomendado.

## Capacidades

- Deteccion de anomalias puntuales y anomalias contextuales de largo alcance en series temporales.
- Evaluacion zero-shot: no requiere reentrenamiento sobre el dominio objetivo para inferencia.
- Soporte de series univariantes (TSB-AD-U) y multivariantes (TSB-AD-M).
- Conversion trazable de series temporales a representaciones visuales con correspondencia temporal preservada.
- Alineamiento parche-tiempo para localizacion fina de anomalias.
- Fusion adaptativa de modalidades temporal y visual.
- Aprendizaje contrastivo de ventanas para mejorar la separacion normal/anomalo.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes, vision general, audio ni multilingueismo; el modelo es especifico de deteccion de anomalias en series temporales.

## Casos de uso

- Monitorizacion de infraestructura IT: deteccion de picos y desviaciones contextuales en metricas de CPU, memoria, latencia o trafico de red, aprovechando la capacidad de identificar tanto anomalias puntuales como cambios graduales de regimen.
- Mantenimiento predictivo industrial: analisis de sensores de maquinaria (vibracion, temperatura, presion) para detectar fallos incipientes sin necesidad de reentrenar por cada equipo, gracias al regimen zero-shot.
- Deteccion de fraude en transacciones: identificacion de patrones anomalos en secuencias de operaciones financieras, con soporte para series multivariantes que combinan importe, frecuencia y ubicacion.
- Monitorizacion de salud con wearables: deteccion de episodios anomalos en senales fisiologicas (ritmo cardiaco, actividad, sueno) sobre series univariantes, sin etiquetado especifico por paciente.
- Observabilidad de sistemas distribuidos: analisis de metricas multivariantes de microservicios para localizar degradaciones y picos de error en ventanas temporales concretas.
- Investigacion en deteccion de anomalias: uso como baseline zero-shot sobre TSB-AD para comparar con metodos unimodales y evaluar el aporte de la fusion visual-temporal.
- Analitica de consumo energetico: deteccion de consumos atipicos en series de contadores inteligentes para alertar de fugas o usos fraudulentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la actualizacion no incluye nuevas puntuaciones de benchmark ni afirmaciones de reproduccion del articulo, y que el Space online es una demo ligera que no ejecuta el pipeline completo de TSB-AD. El repositorio incluye el codigo de evaluacion (`Test_TSB.py`, `evaluation/`) para reproducir resultados sobre TSB-AD-U y TSB-AD-M.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del tamano del encoder visual (basado en MAE-Base) y del encoder temporal, cuyos parametros no se detallan.
- GPU recomendadas: no especificadas; la documentacion recomienda un entorno con CUDA 12.1 y `--device cuda:0`.
- Compatibilidad con GPU de consumo: no confirmada; el uso de un encoder tipo MAE-Base sugiere que podria ejecutarse en GPUs consumer con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: ejecucion directa con PyTorch (`Test_TSB.py`, `train.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas de deteccion de anomalias zero-shot sobre TSB-AD.

## Limitaciones y advertencias

- El repositorio de Hugging Face distribuye codigo y utilidades, no los pesos; es necesario descargar `VETime.pth` y `mae_visualize_base.pth` desde `yyyang0/VETime-checkpoints`.
- El Space online es una demo ligera alojada en un host personal y no ejecuta el benchmark completo de TSB-AD; no debe usarse para validar rendimiento.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre TSB-AD, su comportamiento fuera de la distribucion de ese benchmark puede degradarse.
- Riesgo de falsos positivos y negativos en regimen zero-shot: la deteccion sin ajuste al dominio puede no alcanzar la precision de metodos supervisados especificos.
- No se detalla el volumen ni la composicion de los datos de entrenamiento, lo que limita la evaluacion de su cobertura de dominios.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los datasets TSB-AD y del encoder visual MAE subyacente.
- Requiere entorno CUDA para el pipeline de evaluacion completo; el rendimiento en CPU no esta documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yyyang0/VETime
- Checkpoints: https://huggingface.co/yyyang0/VETime-checkpoints
- Demo interactiva: https://huggingface.co/spaces/thu-sail-lab/VETime
- Codigo fuente: https://github.com/yyyangcoder/VETime
- Articulo arXiv: https://arxiv.org/abs/2602.16681
- Dataset TSB-AD-U: https://www.thedatum.org/datasets/TSB-AD-U.zip
- Dataset TSB-AD-M: https://www.thedatum.org/datasets/TSB-AD-M.zip
