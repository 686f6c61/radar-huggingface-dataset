# Yusufhan/rl_course_vizdoom_health_gathering_supreme

## Resumen

Se trata de un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, distribuido por el usuario Yusufhan bajo la libreria Sample-Factory. No es un modelo de lenguaje: es una politica neuronal que procesa fotogramas renderizados del entorno y emite acciones discretas para maximizar la recompensa acumulada. El entorno consiste en recoger botiquines de salud mientras se evita la perdida de vida, en su variante de dificultad maxima.

El modelo se publica como artefacto reproducible de un curso de aprendizaje por refuerzo, con el objetivo de que otros estudiantes o investigadores puedan descargarlo, evaluarlo y reanudar el entrenamiento desde el punto de guardado. La relevancia practica es, por tanto, docente y de investigacion en RL, no de despliegue en produccion: sirve como referencia de resultados para el entorno citado y como punto de partida para experimentos de continuacion de entrenamiento.

El resultado declarado por el autor es una recompensa media de 14,07 con una desviacion tipica de 6,12, una cifra que debe interpretarse con cautela por su elevada varianza. No se especifican parametros, licencia ni idiomas, y el repositorio ocupa 0,1 GB, un tamano compatible con checkpoints de politica convolucional mas ficheros de TensorBoard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization) con encoder convolucional para observaciones visuales; implementado sobre Sample-Factory 2.0 |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; el agente opera sobre el historial de fotogramas apilados del entorno) |
| Tipos de cuantizacion | no aplicable (no se distribuyen pesos en formatos cuantizados para inferencia de texto) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | checkpoints de Sample-Factory cargados mediante `python -m sample_factory.huggingface.load_from_hub -r Yusufhan/rl_course_vizdoom_health_gathering_supreme` |
| Entorno de entrenamiento | ViZDoom `doom_health_gathering_supreme` |
| Algoritmo | APPO |
| Tamano del repositorio | 0,1 GB |
| Libreria | sample-factory |
| Fecha de creacion | 2026-09-12 |
| Fecha de ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

La politica sigue el diseno estandar de Sample-Factory: un encoder convolucional que procesa las observaciones visuales del entorno (fotogramas RGB del motor ViZDoom, habitualmente a baja resolucion y apilados en el eje de canales para aportar informacion temporal) y una cabeza de politica y otra de valor. El algoritmo APPO combina la formulacion de PPO con un muestreo asincrono de alta concurrencia, lo que permite desacoplar la generacion de experiencia de la actualizacion de gradientes y escalar el entrenamiento en un solo nodo con multiples workers. No se documenta el numero exacto de capas, filtros ni la dimension de la capa recurrente.

En cuanto a los datos, el agente no se entrena sobre un corpus: la "distribucion de entrenamiento" es la generacion de episodios muestreada por la propia politica contra el entorno, con recompensa por recoger botiquines y penalizacion por perder salud. La model card no indica el numero total de pasos de entorno consumidos, la composicion de hiperparametros ni si hubo fases adicionales de ajuste. Tampoco se detalla si el resultado de 14,07 +/- 6,12 corresponde a una sola semilla o a una media de varias, dato critico porque la desviacion tipica es casi la mitad de la media.

## Capacidades

- Control secuencial en tiempo discreto: selecciona acciones (movimiento y disparo) a partir de observaciones visuales del motor ViZDoom.
- Percepcion visual de baja resolucion: interpreta fotogramas renderizados sin preprocesado semantico externo.
- Aprendizaje por refuerzo online y asincrono: apto para reanudar entrenamiento con `--restart_behavior=resume`.
- Optimizacion de recompensa acumulada en el escenario `health_gathering_supreme`.
- Exportacion y carga desde el Hugging Face Hub mediante utilidades de Sample-Factory (`load_from_hub` y `--push_to_hub`).
- Integracion con TensorBoard para seguimiento de curvas de recompensa y metricas de entrenamiento durante la continuacion del experimento.
- No dispone de tool calling, function calling, capacidades de agente multi-paso en el sentido de los LLM, ni soporte multilingue.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como checkpoint de referencia para que el alumnado compare sus propias curvas de entrenamiento en `doom_health_gathering_supreme` contra un resultado ya publicado.
- Reproduccion de experimentos: al incluir los ficheros de TensorBoard, permite auditar la evolucion de la recompensa y detectar si las diferencias observadas se deben a hiperparametros o a varianza entre semillas.
- Continuacion de entrenamiento: cargando el checkpoint con `--restart_behavior=resume` y elevando `--train_for_env_steps`, se puede prolongar el entrenamiento para estudiar convergencia a largo plazo.
- Investigacion sobre estabilidad de APPO: la desviacion tipica de 6,12 sobre una media de 14,07 lo convierte en un caso de estudio util para analizar varianza entre episodios y semillas en entornos visuales.
- Pruebas de infraestructura de RL distribuido: sirve para validar pipelines de Sample-Factory con workers asincronos, almacenamiento compartido de checkpoints y monitorizacion con TensorBoard.
- Benchmark interno de algoritmos: puede emplearse como linea base APPO frente a otras configuraciones de Sample-Factory sobre el mismo entorno, siempre que se controle el numero de semillas.
- Material para cursos de RL visual: permite ilustrar como una CNN aprende a navegar un escenario 3D sin conocimiento previo del mapa.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (metrica no verificada por un tercero):

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 14,07 +/- 6,12 | no |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica de modelos de lenguaje, porque este artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, pero se desconoce el numero de parametros y, por tanto, el consumo real de memoria.
- GPU recomendadas: no disponible en la informacion proporcionada. Al ser una politica convolucional de baja resolucion, es plausible que quepa en GPUs de gama media, pero no hay confirmacion del autor.
- Ejecucion en GPU de consumo: no confirmado. Dado el tamano reducido del repositorio y la naturaleza del encoder, es esperable que quepa en tarjetas tipo RTX 3060 o superiores, pero se trata de una estimacion no verificada.
- Despliegue: el flujo oficial es Sample-Factory, descargando con `load_from_hub` y ejecutando el script `enjoy` del entorno correspondiente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un agente de RL.
- Latencia y throughput: no disponible.
- Entrenamiento: APPO esta disenado para escalar con multiples workers, por lo que el entrenamiento completo requiere CPU con varios nucleos y, preferiblemente, una GPU; el numero de pasos totales consumidos no se especifica.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada para modelos equivalentes (otras politicas APPO, PPO o IMPALA entrenadas sobre `doom_health_gathering_supreme`). La comparativa formal queda, por tanto, como no disponible. Como referencia cualitativa, el ecosistema Sample-Factory permite entrenar el mismo entorno con otros algoritmos y configuraciones, pero no se aportan cifras de recompensa para ellos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yusufhan/rl_course_vizdoom_health_gathering_supreme (APPO) | no disponible | no aplicable | 14,07 +/- 6,12 mean_reward | no disponible | Hugging Face Hub |
| Alternativas comparables | no disponible | no aplicable | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Varianza elevada: la desviacion tipica declarada (6,12) es de aproximadamente el 43 por ciento de la media (14,07), lo que indica un rendimiento inestable entre episodios o semillas y hace arriesgado tratar la cifra como un resultado solido.
- Metrica no verificada: el propio model-index marca el resultado como `verified: false`; no ha sido reproducido por un tercero.
- Ausencia de licencia: la model card no declara licencia, por lo que el uso comercial y la redistribucion quedan en una situacion juridica indeterminada.
- Sin informacion de entrenamiento: no se documentan pasos de entorno, hiperparametros, numero de semillas ni composicion del pipeline, lo que dificulta la reproducibilidad estricta.
- Especificidad de dominio: el agente solo es valido para el entorno `doom_health_gathering_supreme` y no generaliza a otras tareas sin reentrenamiento.
- Sin capacidades de lenguaje: no comprende ni genera texto, no soporta tool calling ni razonamiento multi-paso y no debe evaluarse con metricas de LLM.
- Riesgo de sobreajuste al escenario: el comportamiento aprendido depende del motor ViZDoom y de la configuracion concreta de observaciones; cambios en la resolucion o en el apilado de fotogramas pueden degradar el rendimiento.
- Alucinacion: concepto no aplicable a este tipo de modelo, aunque si existe el riesgo analogo de politicas que explotan atajos del entorno en lugar de aprender la tarea prevista.
- Sin garantias de produccion: es un artefacto de curso, no un componente validado para sistemas criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yusufhan/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
