# YuhaiW/prism-jepa-reacher

## Resumen

PRISM-Reacher es un paquete de pesos para PyTorch publicado por Yuhai Wang y colaboradores (Yuhai Wang, Jiawei Xia, Bowen Sun, Rongxuan Zhou, Xiao Hu, Yongliang Shi, Jing Du y Yang Ye) que reúne dos componentes: el modelo de mundo LeWM —un encoder y un predictor JEPA congelados, convertidos desde `quentinll/lewm-reacher`— y una cabecera prior MLP de 0,51 millones de parámetros entrenada sobre las características congeladas del encoder. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un modelo de dinámica latente para planificar acciones en la tarea Reacher de DeepMind Control, en la que un brazo de dos articulaciones debe alcanzar una configuración objetivo mediante acciones bidimensionales.

El problema que resuelve es concreto dentro de la planificación por muestreo: en lugar de puntuar las trayectorias candidatas únicamente con el coste del modelo de mundo (MPPI clásico), la cabecera prior estima una distribución sobre acciones y sesga la propuesta de trayectorias, lo que eleva la tasa de éxito. Según la model card, con un objetivo a 25 pasos del entorno y diez semillas de 50 episodios cada una, el éxito pasa del 43,8–48,2 % con MPPI estándar al 60,0–64,4 % con PRISM-MPPI.

Es relevante ahora porque acompaña al artículo PRISM (arXiv:2606.07974) y publica los pesos exactos que respaldan los resultados de Reacher de la Figura 5, algo poco frecuente en trabajos de planificación con modelos de mundo. Conviene tener presente su alcance: es un artefacto de investigación muy acotado, con 0 descargas y 0 likes en el momento de la consulta, un repositorio de 0,1 GB y una única tarea soportada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo JEPA (encoder + predictor congelados) más cabecera prior MLP de dos capas de 512 unidades con activación GELU |
| Parámetros totales | No disponible para el modelo de mundo LeWM; la cabecera prior tiene 0,51 M de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; horizonte de planificación H = 5 y objetivo a 25 pasos del entorno |
| Tipos de cuantización | No disponible (se distribuyen checkpoints PyTorch sin variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch: `lewm_object.ckpt` y `prior_head_reacher.pt` |
| Tarea | Reacher de DeepMind Control (brazo de dos articulaciones, acciones de 2 dimensiones) |
| Planners incluidos | MPPI estándar, MPPI con warm-start y PRISM-MPPI |
| Hiperparámetros de evaluación | K ∈ {32, 64, 128}, H = 5, B = 5, J = 30, K_elite = 30, escala del prior s = 1 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema JEPA (joint embedding predictive architecture) del modelo de mundo LeWM: un encoder que proyecta observaciones a un espacio latente y un predictor que modela la transición latente dado un par (representación, acción). Ambos están congelados en este paquete y se obtuvieron convirtiendo los pesos upstream de `quentinll/lewm-reacher` mediante el script `convert_hf_checkpoint.py`. Sobre esas características congeladas se entrena la cabecera prior, un MLP de dos capas de 512 unidades con GELU y 0,51 M de parámetros, que modela una distribución sobre acciones con pérdida β-NLL (β = 0,5) y un suelo de desviación típica σ = 0,05; el objetivo de cada episodio es el último fotograma del propio episodio.

El entrenamiento de la cabecera se realiza, por tanto, sobre características congeladas y no sobre píxeles, lo que reduce el coste y estabiliza el ajuste. El dataset indicado es `dmc/reacher_random.h5`, el replay de política aleatoria de Reacher distribuido con DeepMind Control; el número de transiciones, la composición exacta del dataset y el recuento de tokens o muestras no se detallan en la información disponible. No hay fases de RLHF ni DPO, ya que no es un modelo lingüístico. La innovación técnica del trabajo es el uso del prior para guiar el muestreo de trayectorias dentro de MPPI (PRISM-MPPI): el prior propone acciones y el coste del modelo de mundo selecciona las élites, combinando ambas señales en lugar de depender solo de la verosimilitud del modelo.

## Capacidades

- Predicción de dinámica latente: el modelo de mundo proyecta observaciones y acciones al espacio latente de JEPA y predice representaciones futuras sin reconstruir píxeles.
- Planificación por control predictivo: implementa MPPI sobre el modelo de mundo, con muestreo de K trayectorias de acción, B = 5 y J = 30 iteraciones, seleccionando K_elite = 30 élites.
- Muestreo guiado por prior: la cabecera prior estima una distribución sobre acciones que sesga la propuesta de trayectorias, lo que constituye la variante PRISM-MPPI.
- Comparación de planificadores: el repositorio permite ejecutar y contrastar MPPI estándar, MPPI con warm-start y PRISM-MPPI bajo la misma configuración.
- Control de horizonte corto: planificación con H = 5 sobre objetivos situados a 25 pasos del entorno.
- No soporta generación de texto, tool calling, razonamiento multi-paso simbólico, capacidades multilingües, visión general ni audio.

## Casos de uso

- Reproducción de los resultados del artículo: el paquete contiene los pesos exactos de la Figura 5, de modo que `scripts/test.sh reacher` permite replicar la tabla de tasas de éxito con diez semillas y 50 episodios por semilla.
- Evaluación comparada de planificadores: sirve como banco de pruebas controlado para medir cuánto aporta un prior aprendido frente a MPPI estándar y MPPI con warm-start en una tarea de bajo coste computacional.
- Investigación en muestreo guiado por priors: la cabecera `prior_head.py` es una plantilla reutilizable para experimentar con distribuciones previas sobre acciones en otros modelos de mundo JEPA.
- Prototipado de control predictivo con modelos aprendidos: útil para validar un pipeline completo (descarga de dataset, carga de checkpoints, planificación, evaluación) antes de escalar a entornos reales.
- Docencia y divulgación: la tarea Reacher, con acciones de 2 dimensiones y observaciones de baja dimensionalidad, permite explicar MPPI y los modelos de mundo latentes con requisitos de hardware mínimos.
- Verificación de artefactos científicos: al publicar los checkpoints junto a los hiperparámetros (H = 5, B = 5, J = 30, K_elite = 30, s = 1), facilita auditorías de reproducibilidad frente a resultados solo descritos en el paper.
- Integración en pipelines de evaluación automatizada: los scripts de descarga y test permiten encadenar ejecuciones con distintas K (32, 64, 128) y agregar media y desviación típica de forma desatendida.

## Benchmarks y rendimiento

Tasa de éxito (%) en Reacher, media ± desviación típica sobre diez semillas con 50 episodios por semilla. Objetivo a 25 pasos del entorno, H = 5, B = 5, J = 30, K_elite = 30, escala del prior s = 1.

| Planificador | K = 32 | K = 64 | K = 128 |
|---|---|---|---|
| MPPI estándar | 48,2 ± 7,0 | 48,2 ± 4,0 | 43,8 ± 8,1 |
| MPPI con warm-start | 46,2 ± 6,4 | 48,4 ± 4,5 | 46,8 ± 7,8 |
| PRISM-MPPI | 60,0 ± 6,9 | 60,4 ± 5,6 | 64,4 ± 5,0 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark lingüístico, ya que el modelo no es lingüístico. Tampoco se detallan métricas de coste computacional (latencia, número de evaluaciones del modelo de mundo por paso) más allá de los hiperparámetros del planificador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la información proporcionada no incluye el tamaño del encoder ni del predictor de LeWM. El repositorio completo ocupa 0,1 GB y la cabecera prior solo tiene 0,51 M de parámetros, por lo que el grueso del consumo depende del modelo de mundo, no de la cabecera.
- GPU recomendadas: no se especifican en la información disponible. Dado el tamaño del artefacto, es razonable esperar que quepa en GPU de consumo e incluso que funcione en CPU, pero el dato no está confirmado por el autor.
- Cabe en GPU de consumo: probable por tamaño de checkpoints (0,1 GB de repositorio), sin confirmación explícita en la model card.
- Opciones de despliegue: scripts propios del repositorio sobre PyTorch (`scripts/download.sh reacher` y `scripts/test.sh reacher`), con entorno `uv` y Python 3.10, variable `STABLEWM_HOME` y versiones fijadas en `requirements.txt`. No aplica vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste dominante es el muestreo del planificador, con K hasta 128 trayectorias, J = 30 iteraciones y K_elite = 30 élites por paso de planificación.
- Almacenamiento: el dataset `dmc/reacher_random.h5` se descarga aparte en `$STABLEWM_HOME/dmc/`, por lo que el espacio en disco requerido supera el tamaño del repositorio.

## Comparativa con modelos similares

| Modelo o planificador | Parámetros | Horizonte | Tasa de éxito (K = 32 / 64 / 128) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRISM-Reacher (PRISM-MPPI) | 0,51 M en la cabecera prior; modelo de mundo LeWM no disponible | H = 5 | 60,0 / 60,4 / 64,4 | MIT | Pesos en HuggingFace (este repositorio) |
| MPPI estándar sobre el mismo modelo de mundo | No aplica (planificador) | H = 5 | 48,2 / 48,2 / 43,8 | MIT | Implementado en `scripts/test.sh` |
| MPPI con warm-start sobre el mismo modelo de mundo | No aplica (planificador) | H = 5 | 46,2 / 48,4 / 46,8 | MIT | Implementado en `scripts/test.sh` |
| `quentinll/lewm-reacher` (modelo de mundo upstream) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Pesos en HuggingFace |

La comparación relevante es interna: los tres planificadores comparten exactamente el mismo modelo de mundo y el mismo dataset, de modo que la diferencia de éxito (entre 11,8 y 20,6 puntos porcentuales a favor de PRISM-MPPI) es atribuible al prior. No se dispone de datos de otros modelos de mundo comparables (por ejemplo, variantes tipo Dreamer) en la información proporcionada, por lo que no se ofrece una comparación cuantitativa con ellos.

## Limitaciones y advertencias

- Alcance muy restringido: solo Reacher de DeepMind Control, con acciones de 2 dimensiones; no es un modelo de propósito general ni transferible sin reentrenamiento de la cabecera prior.
- No procesa lenguaje: no admite instrucciones en texto, tool calling, agentes ni razonamiento multi-paso simbólico.
- El modelo de mundo está congelado y procede del repositorio upstream `quentinll/lewm-reacher`; cualquier limitación de ese checkpoint se hereda aquí.
- El objetivo se define como el último fotograma de cada episodio, de modo que el rendimiento fuera de esa distribución de objetivos no está caracterizado.
- La tasa de éxito se queda en el 60–64 %, con desviaciones típicas de 5–7 puntos: no es adecuado para aplicaciones de control que exijan fiabilidad alta.
- Sesgos conocidos: no se documentan sesgos demográficos ni sociales por no tratar datos humanos; el riesgo relevante es el sesgo del dataset de política aleatoria de Reacher, que puede no cubrir regiones del espacio de estados necesarias para otros objetivos.
- Riesgo de alucinación en sentido lingüístico: no aplica. El riesgo análogo es el error de predicción del modelo de mundo, que puede producir trayectorias plausibles en latente pero inviables en el entorno real.
- Dependencia de infraestructura: requiere Python 3.10, un entorno `uv`, la variable `STABLEWM_HOME` y la descarga del dataset `dmc/reacher_random.h5`; las versiones están fijadas en `requirements.txt` y no se documenta compatibilidad con otras.
- Licencia MIT: permite uso comercial y modificación, pero el modelo de mundo y su código provienen de LeWM, cuyos términos deben respetarse igualmente.
- Madurez: 0 descargas y 0 likes, publicados el 23 de octubre de 2026, sin validación independiente por parte de la comunidad.
- El repositorio no incluye información sobre el número de parámetros del encoder ni del predictor, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YuhaiW/prism-jepa-reacher
- Artículo (arXiv:2606.07974): https://arxiv.org/abs/2606.07974
- Página del proyecto: https://yuhaiw.github.io/PRISM_web/
- Código: https://github.com/YuhaiW/prism-jepa
- Pesos upstream del modelo de mundo: https://huggingface.co/quentinll/lewm-reacher
- Repositorio LeWM (modelo de mundo y código de origen): https://github.com/lucas-maes/le-wm
