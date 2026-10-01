# Yujana/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-learning tabular sobre el entorno Taxi-v3 de Gymnasium. No es un modelo de lenguaje: se trata de un artefacto de aprendizaje por refuerzo clásico publicado en HuggingFace por el usuario Yujana como entrega de la Unidad 2 del curso Deep Reinforcement Learning de Hugging Face. El repositorio contiene una tabla Q serializada en formato pickle (q-table.pkl), con un tamano de repositorio declarado de 0.0 GB.

El modelo resuelve la tarea de recogida y entrega de pasajeros de Taxi-v3, un entorno discreto y de estado finito ampliamente utilizado como ejemplo introductorio de control secuencial. Su relevancia es exclusivamente didactica y de referencia: sirve como linea base verificable para comparar implementaciones de Q-learning y para validar flujos de evaluacion de agentes en el ecosistema de HuggingFace.

Los resultados declarados por el autor son un retorno medio de 8.5 con desviacion tipica de 1.2, lo que arroja un criterio de evaluacion de 7.3 (media menos desviacion) frente al umbral minimo de 4.0 exigido por el curso. La evaluacion se marca como superada, aunque las metricas no estan verificadas de forma independiente por la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q estado-accion; sin red neuronal) |
| Parametros totales | Tabla Q con una entrada por par estado-accion del entorno Taxi-v3 (la especificacion estandar del entorno tiene 500 estados y 6 acciones, es decir 3000 valores); el autor no publica el numero exacto de entradas |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el estado es una observacion discreta del entorno) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen como tabla Q en pickle, sin cuantizacion) |
| Idiomas soportados | No disponible (el modelo no procesa texto ni voz; opera sobre observaciones discretas) |
| Licencia | No disponible |
| Formato de pesos | Pickle (fichero q-table.pkl) |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular, un metodo de aprendizaje por refuerzo sin aproximacion funcional. El agente mantiene una tabla Q que asigna un valor de accion a cada estado discreto del entorno Taxi-v3 y actualiza dichos valores mediante la regla de diferencias temporales de Q-learning (bootstrapping con la recompensa inmediata y el maximo valor de la siguiente accion). No hay red neuronal, ni capas, ni tokenizador, ni mecanismo de atencion. La politica resultante es greedy respecto de la tabla Q.

No se dispone de informacion sobre el numero de episodios de entrenamiento, la politica de exploracion (epsilon-greedy u otra), los valores de tasa de aprendizaje y factor de descuento empleados, ni sobre el uso de tecnicas adicionales como experience replay, Double Q-learning o decodificacion especulativa (esta ultima no aplica a este tipo de modelos). Tampoco se documenta la composicion del dataset, ya que el entrenamiento se realiza interactuando con el simulador del entorno y no con un corpus de datos. El autor indica unicamente que el agente corresponde a la Unidad 2 del curso Deep Reinforcement Learning de HuggingFace.

## Capacidades

- Seleccion de acciones sobre el entorno Taxi-v3: dado un estado discreto, devuelve la accion de mayor valor de la tabla Q (argmax).
- Control secuencial de horizonte corto dentro del bucle episodico del entorno: recogida de pasajero y entrega en el destino correcto, con gestion del nivel de combustible mediante la accion de repostaje.
- Inferencia determinista y de coste constante por consulta (O(1) sobre la tabla).
- No soporta generacion de texto, razonamiento en lenguaje natural, codigo ni matematicas.
- No soporta vision, audio ni ningun otro modalidad de entrada.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle de interaccion definido por el entorno Taxi-v3.
- No tiene capacidades multilingues, ya que no procesa texto.
- No dispone de modo de razonamiento explicito (thinking mode) ni de trazas de cadena de pensamiento.

## Casos de uso

- Docencia de Q-learning tabular: el artefacto permite ilustrar de forma reproducible el ciclo completo de entrenamiento y evaluacion de un agente de RL discreto, cargando la tabla Q y ejecutando la politica greedy en el entorno.
- Linea base de comparacion: cualquier implementacion nueva de Q-learning o de deep Q-networks sobre Taxi-v3 puede contrastarse contra el retorno medio de 8.5 declarado por este agente.
- Validacion de pipelines de evaluacion en integracion continua: el criterio del curso (media menos desviacion estandar mayor o igual a 4.0) permite comprobar que un script de evaluacion calcula correctamente las metricas de retorno sobre episodios multiples.
- Depuracion de entornos y wrappers de Gymnasium: al ser un agente con politica estable y ya entrenada, sirve para verificar que los wrappers de observacion o recompensa no alteran el comportamiento esperado del entorno.
- Demostraciones y visualizacion de politicas: la tabla Q puede volcarse a una visualizacion de la politica por estado para explicar el concepto de funcion de valor en charlas o material docente.
- Experimentos de ajuste de hiperparametros: la tabla puede emplearse como punto de partida o como referencia para estudiar el efecto de la tasa de aprendizaje, el factor de descuento y la politica de exploracion en el retorno final.
- Pruebas de infraestructura del Hub: el repositorio es un caso minimo para validar la descarga de artefactos pickle mediante hf_hub_download y la carga de objetos con pickle en distintos entornos de ejecucion.
- Prototipos educativos de decision secuencial: la formulacion de recogida y entrega con restricciones de combustible sirve como analogia simplificada en talleres sobre planificacion discreta, siempre con caracter formativo y no productivo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card. No estan verificados de forma independiente.

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Aprendizaje por refuerzo | Taxi-v3 | mean_reward | 8.5 +/- 1.2 | No |
| Evaluacion del curso (media menos desviacion) | Taxi-v3 | Resultado | 7.3 (umbral minimo exigido: 4.0) | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. A modo de contexto del entorno, la especificacion estandar de Taxi-v3 fija un retorno maximo de 15 por episodio, por lo que un retorno medio de 8.5 corresponde a una politica funcional pero no optima.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el modelo no requiere GPU y se ejecuta en CPU.
- GPU recomendadas: ninguna. El agente es una tabla de consulta indexada y no se beneficia de aceleracion por hardware.
- Compatibilidad con GPU de consumo: irrelevante, ya que no necesita GPU. Cabe en cualquier equipo, incluidos dispositivos de bajisima capacidad como una Raspberry Pi.
- Memoria necesaria: el tamano del repositorio declarado en el Hub es de 0.0 GB; la tabla Q en pickle ocupa del orden de kilobytes.
- Opciones de despliegue: carga directa con pickle y huggingface_hub segun el ejemplo del autor. No es compatible con vLLM, llama.cpp, Ollama, TGI ni con servidores de inferencia para modelos de lenguaje, ya que no expone una interfaz de generacion de texto.
- Latencia y throughput: la consulta de la accion greedy es una operacion de coste constante sobre la tabla, del orden de microsegundos por paso en CPU. No se publican medidas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Retorno declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| q-Taxi-v3 (Yujana) | Q-learning tabular | Taxi-v3 | Tabla Q estado-accion (tamano exacto no publicado) | No aplica | 8.5 +/- 1.2 | No disponible | HuggingFace |
| Otros agentes de la Unidad 2 del curso Deep RL | No disponible | Taxi-v3 | No disponible | No aplica | No disponible | No disponible | No disponible |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos publicados de otros agentes comparables en la informacion proporcionada, mas alla del umbral minimo del curso (4.0 en media menos desviacion estandar).

## Limitaciones y advertencias

- Alcance muy restringido: el agente solo es valido para el entorno Taxi-v3 con la misma definicion de estados y acciones. No generaliza a otros entornos ni a variaciones del problema.
- Sin capacidades de lenguaje: no procesa ni genera texto, por lo que no puede emplearse en tareas de NLP, atencion al cliente, generacion de codigo ni similares.
- Metricas no verificadas: los resultados de 8.5 +/- 1.2 estan declarados por el autor y marcados como no verificados en el model-index; no se documenta el numero de episodios, la semilla ni el protocolo de evaluacion.
- Informacion de entrenamiento ausente: no se publican hiperparametros, numero de episodios, politica de exploracion ni criterio de parada, lo que dificulta la reproducibilidad exacta.
- Riesgo de sobreajuste a la politica greedy: al tratarse de una tabla Q estatica, no hay exploracion en inferencia; en estados poco visitados durante el entrenamiento los valores pueden ser poco fiables.
- Sesgos: no se han documentado sesgos especificos, pero el comportamiento del agente depende por completo de la distribucion de episodios de entrenamiento, que no se describe.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier uso fuera del ambito del curso.
- Formato de pesos no seguro por diseno: la carga mediante pickle implica ejecucion de codigo durante la deserializacion, por lo que solo deberia cargarse el fichero desde una fuente de confianza.
- Idoneidad de produccion: el modelo es un ejercicio academico de la Unidad 2 del curso, no un componente validado para sistemas en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yujana/q-Taxi-v3
- Curso Deep Reinforcement Learning de Hugging Face (Unidad 2): https://huggingface.co/learn/deep-rl-course
- No se han encontrado en la informacion disponible otros enlaces a papers, repositorios, blogs o demos asociados a este modelo.
