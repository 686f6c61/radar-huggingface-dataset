# Yak9Ce3teeh/skate-bfm

## Resumen

Skate-BFM es un repositorio de checkpoints de entrenamiento de un sistema de control por aprendizaje por refuerzo (RL) para un robot humanoide HUSKY que aprende a realizar trucos de skateboard. El modelo se basa en el marco BFM0 (Behavior Foundation Model) y utiliza la biblioteca de movimiento MotionLib para generar secuencias de movimiento segmentadas en fases. El desarrollador, identificado como Yak9Ce3teeh, publica este artefacto como parte de un experimento de investigación en robótica y control de movimiento.

El checkpoint principal, `m2.6-phase-100k-seed4728`, se inicializa desde el checkpoint oficial BFM0 y se entrena con una mezcla de secuencias expertas (50% Base/LAFAN y 50% Phase Skate) durante 100.000 transiciones en línea. Sin embargo, el propio autor advierte que se trata de un artefacto de entrenamiento diagnóstico, no de una política validada: la evaluación congelada produce caídas tempranas y es menos estable que el BFM0 oficial. Por tanto, su relevancia actual es principalmente como material de estudio para continuar la investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de RL, sin especificacion de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | other (sin especificar) |
| Formato de pesos | checkpoint de entrenamiento (incluye pesos, estado del optimizador, buffer de replay y configuracion) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de red neuronal, capas, etc.). Se sabe que se basa en el marco BFM0, que es un modelo de comportamiento fundacional para robots humanoides, y que utiliza MotionLib para la generacion de secuencias de movimiento. El entrenamiento se realiza mediante aprendizaje por refuerzo en el simulador HUSKY, con un total de 100.000 transiciones en linea y 9.900 actualizaciones nativas. La mezcla de expertos combina un 50% de secuencias Base/LAFAN y un 50% de secuencias Phase Skate. No se menciona el uso de RLHF ni DPO, al tratarse de un modelo de control fisico.

## Capacidades

- Control de movimiento de un robot humanoide HUSKY en un simulador de skateboard.
- Generacion de secuencias de movimiento segmentadas en fases (Phase Skate) para trucos de skate.
- Integracion con el marco BFM0 para inicializacion y continuacion de entrenamiento.
- Capacidad de reanudar el entrenamiento desde el checkpoint (incluye estado del optimizador y buffer de replay).
- Evaluacion mediante un script de evaluacion con horizonte de 1024 pasos y visualizador.
- No soporta generacion de texto, codigo, vision ni tool calling.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para control de robots humanoides: el checkpoint permite estudiar el efecto de la mezcla de expertos y la inicializacion desde BFM0 en la estabilidad del entrenamiento.
- Desarrollo de politicas de skateboard para robots: aunque el checkpoint actual no es estable, sirve como punto de partida para continuar el entrenamiento o ajustar hiperparametros.
- Comparacion de metodos de segmentacion de movimiento (Phase vs. Continuous) en el contexto de MotionLib.
- Analisis de la transferencia de habilidades desde secuencias expertas (LAFAN) a un robot fisico simulado.
- Reproduccion de experimentos: el repositorio incluye configuracion y datos de entrenamiento para reproducir los resultados.
- Educacion en robotica: como ejemplo de un pipeline completo de RL con simulador, dataset y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluacion congelada produce caidas tempranas y es menos estable que el BFM0 oficial, pero no proporciona metricas cuantitativas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la informacion disponible.
- El entrenamiento se realiza en un simulador (HUSKY) que probablemente requiera una GPU para acelerar el calculo, pero no se detalla.
- El checkpoint ocupa aproximadamente 7.8 GB en el repositorio, lo que sugiere que la inferencia o la continuacion del entrenamiento necesitan una GPU con al menos 8-12 GB de VRAM, aunque no se confirma.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Tipo | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|
| Skate-BFM (este) | Checkpoint de RL para skateboard | Diagnostico, no validado | other | Hugging Face |
| BFM0 (oficial) | Modelo de comportamiento fundacional | Validado | no disponible | no disponible |
| Otros modelos de RL para robotica (p.ej. Isaac Gym) | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para una comparativa detallada con alternativas de la misma categoria.

## Limitaciones y advertencias

- El checkpoint es un artefacto de entrenamiento diagnostico, no una politica validada: la evaluacion congelada produce caidas tempranas y es menos estable que el BFM0 oficial.
- No se ha demostrado una locomocion zero-shot que combine velocidad positiva del skateboard con contacto sostenido pie-tabla.
- La licencia es "other" sin especificar, lo que puede limitar el uso comercial o la redistribucion.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto, al no ser un modelo de lenguaje.
- El modelo depende del simulador HUSKY y del marco BFM0, por lo que su uso fuera de ese entorno requiere adaptaciones no documentadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yak9Ce3teeh/skate-bfm
- Dataset asociado: https://huggingface.co/datasets/Yak9Ce3teeh/skate-sim-dataset
- Pagina del dataset en Claru: https://claru.ai/datasets/yak9ce3teeh-skate-sim-dataset
- Repositorio GitHub: https://github.com/AnonChongqing/Skate-bfm
- README del repositorio GitHub: https://github.com/AnonChongqing/Skate-bfm/blob/main/README.md
