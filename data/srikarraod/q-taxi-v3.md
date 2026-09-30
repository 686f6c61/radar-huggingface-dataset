# Srikarraod/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-learning tabular sobre el entorno Taxi-v3 de Gymnasium. Lo publica el usuario Srikarraod en Hugging Face como entrega de la Unidad 2 del curso Deep Reinforcement Learning de Hugging Face, cuyo objetivo es implementar un agente que aprenda una politica optima en un entorno discreto de logistica simplificada.

A diferencia de los modelos de lenguaje o de vision, no se trata de una red neuronal: el agente almacena una tabla Q que asocia cada estado discreto del entorno con un valor de accion. En la version canonica de Taxi-v3 el espacio de estados tiene 500 elementos (25 posiciones del taxi, 5 ubicaciones de pasajero y 4 destinos) y el espacio de acciones tiene 6 (moverse en las cuatro direcciones, recoger y dejar pasajero).

Su relevancia es exclusivamente docente y de referencia: sirve como linea base reproducible para comparar implementaciones de Q-learning, para verificar pipelines de RL y para practicar el ciclo de evaluacion, guardado y publicacion de agentes en el Hub. El autor declara una recompensa media de 8,50 +/- 0,50 en Taxi-v3, aunque la metrica figura como no verificada. No hay informacion sobre licencia, idiomas ni formato de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (metodo off-policy de diferencia temporal, sin red neuronal) |
| Parametros totales | No disponible. El agente es una tabla Q; en el entorno canonico Taxi-v3 equivale a 500 estados x 6 acciones = 3000 valores Q |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible. No es un modelo de lenguaje; el estado observable es discreto y finito (500 estados en Taxi-v3) |
| Tipos de cuantizacion | No aplica / no disponible |
| Idiomas soportados | No disponible. El agente no procesa lenguaje natural |
| Licencia | No disponible |
| Formato de pesos | No disponible. No se declaran ficheros de pesos (safetensors, GGUF ni equivalentes) en la informacion proporcionada |

## Arquitectura y entrenamiento

El agente emplea Q-learning, un algoritmo de control off-policy que aprende la funcion de valor-accion Q(s, a) mediante actualizaciones de diferencia temporal sobre transiciones (estado, accion, recompensa, estado siguiente). La representacion es tabular, es decir, una estructura de busqueda indexada por estado y accion, sin aproximacion funcional ni descenso de gradiente. No hay pesos neuronales, capas, atencion ni mecanismo de decodificacion.

Segun la model card, el entrenamiento se realizo con la libreria q-learning en el marco del curso Deep RL de Hugging Face (Unidad 2) y el entorno declarado es Taxi-v3. No se especifican en la informacion disponible el numero de episodios, la tasa de aprendizaje, el factor de descuento, la politica de exploracion (por ejemplo epsilon-greedy con su calendario de decaimiento), el tamano del lote ni la semilla aleatoria. Tampoco se documenta ningun proceso de ajuste fino, RLHF o DPO, que no aplican a este tipo de agente.

## Capacidades

- Control discreto en el entorno Taxi-v3: seleccionar una de las 6 acciones validas en cada uno de los 500 estados del entorno.
- Aprendizaje por refuerzo off-policy: la tabla Q puede mejorarse con nuevas interacciones sin necesidad de reentrenar un modelo neuronal.
- Politica greedy derivada de la tabla Q: en inferencia basta con consultar el valor maximo por estado.
- Reproducibilidad didactica: apto para comparar hiperparametros y variantes de Q-learning bajo el mismo entorno.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente multi-paso en el sentido de los LLM, ni de planificacion simbolica fuera del entorno Taxi-v3.
- No dispone de capacidades multilingues, de generacion de texto, de codigo, de matematicas ni de vision.
- No dispone de modo de razonamiento explicito (thinking mode), audio ni multimodalidad.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo resuelto de la Unidad 2 del curso Deep RL para ilustrar la diferencia entre Q-learning tabular y metodos con aproximacion funcional.
- Linea base en experimentos: comparar el rendimiento de algoritmos como DQN, SARSA o Double Q-learning contra esta tabla Q sobre el mismo entorno y la misma metrica de recompensa media.
- Verificacion de pipelines de RL: integrar el agente en pruebas automatizadas que comprueben que un entrenamiento converge a una recompensa media cercana a 8 en Taxi-v3.
- Extraccion de la politica optima: exportar la tabla Q y visualizar la accion greedy por estado para analizar rutas de recogida y entrega en el grid de 5x5.
- Ajuste de hiperparametros: barrido de tasa de aprendizaje, factor de descuento y calendario de epsilon usando este agente como referencia de convergencia.
- Simulacion logistica a escala reducida: emplear el entorno Taxi-v3 como banco de pruebas para validar logicas de asignacion y despacho antes de trasladarlas a simuladores mas complejos.
- Material de demostracion en cuadernos Jupyter: ejecutar episodios paso a paso y registrar la recompensa acumulada para explicar el compromiso entre exploracion y explotacion.
- Reutilizacion como componente de bajo coste: en aplicaciones embebidas o de CPU unica donde se necesite una politica discreta y determinista con consumo de memoria minimo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 8,50 +/- 0,50 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. Como referencia del entorno, en Taxi-v3 la recompensa se compone de -1 por paso, +20 por entrega correcta y -10 por recogida o entrega ilegal, de modo que una recompensa media de 8,50 se situa en el rango de una politica practicamente optima. Este dato contextual no procede de la model card y la metrica del agente figura como no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El agente es tabular y no requiere GPU.
- GPU recomendadas: ninguna. El entrenamiento y la inferencia se ejecutan en CPU.
- Compatibilidad con GPU de consumo: no aplica; funciona en cualquier CPU, incluidos portatiles y entornos sin acelerador.
- Opciones de despliegue: no se documentan en la informacion disponible. Al no haber pesos neuronales declarados, no aplican servidores de inferencia como vLLM, TGI, llama.cpp u Ollama.
- Almacenamiento: no disponible en la informacion proporcionada; una tabla Q de 500 x 6 valores en coma flotante de 64 bits ocupa del orden de decenas de kilobytes si se serializa en crudo.
- Latencia y throughput: no disponibles. Por la naturaleza del metodo, cada decision es una busqueda en tabla y se resuelve en microsegundos en una CPU convencional.

## Comparativa con modelos similares

Todos los comparables localizados son entregas del mismo curso con el mismo entorno y algoritmo; no se han encontrado metricas publicadas para ellos en la informacion disponible.

| Modelo | Entorno | Algoritmo declarado | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Srikarraod/q-Taxi-v3 | Taxi-v3 | q-learning | 8,50 +/- 0,50 (no verificado) | No disponible | Hugging Face, 0 descargas, 0 likes |
| srikumarrr/q-Taxi-v3 | Taxi-v3 | Q-learning | No disponible | No disponible | Hugging Face |
| kmirain/q-Taxi-v3 | Taxi-v3 | Q-learning | No disponible | No disponible | Hugging Face |
| dungtd2403/q-Taxi-v3 | Taxi-v3 | Q-learning | No disponible | No disponible | Hugging Face, indexado en BimAnt |

## Limitaciones y advertencias

- Ambito restringido: el agente solo opera en Taxi-v3; no generaliza a otros entornos ni a estados no vistos durante el entrenamiento.
- Sin transferencia: al ser tabular, no existe representacion aprendida reutilizable en otras tareas, a diferencia de un modelo con aproximacion funcional.
- Metrica no verificada: la recompensa de 8,50 +/- 0,50 la declara el autor y no ha sido validada de forma independiente.
- Trazabilidad incompleta: no se documentan hiperparametros, numero de episodios, semilla ni procedimiento de evaluacion, lo que dificulta reproducir el resultado.
- Licencia ausente: al no indicarse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso fuera del ambito formativo.
- Riesgo de alucinacion: no aplica, ya que el agente no genera lenguaje natural.
- Sesgos: no hay datos sobre sesgos en la informacion disponible; el unico sesgo relevante seria el derivado de la distribucion de episodios de entrenamiento y de la politica de exploracion empleada.
- Idiomas y contexto: no aplica soporte linguistico ni ventana de contexto; el estado es finito y discreto.
- Idoneidad para produccion: baja. Se trata de un artefacto docente, con 0 descargas y 0 likes, sin documentacion de despliegue ni garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Srikarraod/q-Taxi-v3
- Curso Deep Reinforcement Learning de Hugging Face: https://huggingface.co/learn/deep-rl-course/en/unit0/introduction
- Entrega equivalente de srikumarrr: https://huggingface.co/srikumarrr/q-Taxi-v3
- Entrega equivalente de kmirain: https://huggingface.co/kmirain/q-Taxi-v3
- Ficha indexada de dungtd2403/q-Taxi-v3 en BimAnt: https://zoo.bimant.com/model/119036
- Ficha indexada de q-Taxi-v3 en Essa Mamdani: https://essamamdani.com/ai-models/hf-teledocmedical-q-taxi-v3
- Cuaderno de Q-learning sobre Taxi-v3 en GitHub: https://github.com/fsiddiqui2/Taxi-v3-Route-Optimization
