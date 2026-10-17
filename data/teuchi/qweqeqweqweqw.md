# teuchi/qweqeqweqweqw

## Resumen

El repositorio `teuchi/qweqeqweqweqw` no contiene un modelo de lenguaje, sino el paquete de una aplicacion Gradio para la generacion automatica de horarios academicos mediante una red neuronal DQN (Deep Q-Network) implementada en NumPy. El autor es el usuario `teuchi` y la model card esta redactada en ruso, bajo el titulo "Автоматическое расписание на основе DQN" (horario automatico basado en DQN). El sistema recibe grupos, aulas y carga docente y devuelve un horario sin conflictos.

El problema que resuelve es la asignacion de clases a franjas horarias y aulas respetando restricciones duras (conflictos de profesor, grupo y aula, capacidad y tipo de aula). La red no actua como generador libre: ordena candidatos (franja + aula) puntuandolos segun 14 caracteristicas y un algoritmo de busqueda con retroceso explora el espacio. Las restricciones duras se implementan como mascara de acciones permitidas, de modo que la red no puede violarlas, y el resultado se valida con una funcion `verify` independiente.

Es relevante como ejemplo de hibridacion entre aprendizaje por refuerzo y busqueda combinatoria, pero conviene subrayar que el repositorio aparece con 0 descargas, 0 likes y un tamano de 0.0 GB, sin licencia, idiomas ni pipeline declarados. La informacion publicada no permite caracterizarlo como modelo fundacional ni como LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal DQN (Deep Q-Network) implementada en NumPy; no es un transformer |
| Parametros totales | no disponible (pesos almacenados en `weights.npz`, sin recuento publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en `.npz` sin cuantizacion documentada) |
| Idiomas soportados | no disponible oficialmente; la documentacion y la interfaz estan en ruso |
| Licencia | no disponible |
| Formato de pesos | `weights.npz` (formato NumPy) |

## Arquitectura y entrenamiento

La arquitectura es una red DQN que evalua cada par candidato (franja horaria + aula) mediante 14 caracteristicas: ventanas horarias de grupo y de profesor, carga del dia, repeticion de asignatura en el mismo dia, deficit de aulas libres y presion de la carga restante, entre otras. Los pesos son independientes del tamano del problema, lo que permite aplicar la misma red a instancias de distinta dimension. Las restricciones duras no se aprenden: se aplican como mascara de acciones admisibles y el resultado final se comprueba con una rutina `verify` separada.

El entrenamiento se realiza localmente con `python train.py --episodes 4000`, generando el archivo `weights.npz` y metricas sobre tareas reservadas. La busqueda combina la ordenacion de candidatos por valor Q con retroceso (backtracking) ante callejones sin salida, y ejecuta varias tentativas con distinto orden de asignaturas para seleccionar la mejor. El script `benchmark.py` compara la red entrenada con una red sin entrenar y con una heuristica manual. No se documentan datos de entrenamiento (numero de instancias, composicion del dataset) ni tecnicas de RLHF/DPO, que no aplican a este tipo de sistema.

## Capacidades

- Generacion de horarios academicos sin conflictos a partir de grupos, aulas y carga docente.
- Aplicacion de restricciones duras: conflictos de profesor, de grupo y de aula, capacidad de aula y tipo de aula.
- Puntuacion de candidatos (franja + aula) segun 14 caracteristicas, con pesos independientes del tamano de la instancia.
- Busqueda con retroceso para recuperarse de callejones sin salida y multiples tentativas con distinto orden de asignaturas.
- Verificacion independiente del resultado mediante la funcion `verify`.
- Deteccion previa de infactibilidad con mensajes de error comprensibles (por ejemplo, horas de profesor o grupo superiores al numero de franjas disponibles, o ausencia de aulas compatibles).
- Interfaz web mediante Gradio (`app.py`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Planificacion docente en centros educativos: el sistema recibe la carga de cada profesor, los grupos y el inventario de aulas, y devuelve un horario que respeta la mascara de restricciones duras, util para departamentos que hoy resuelven la asignacion a mano.
- Validacion de borradores de horario existentes: la funcion `verify` y la deteccion de infactibilidad permiten comprobar si un horario propuesto viola conflictos de aula, capacidad o tipo de aula antes de publicarlo.
- Prototipado academico de metodos de RL para problemas combinatorios: `train.py` y `benchmark.py` permiten comparar una red entrenada frente a una red sin entrenar y frente a una heuristica manual con las mismas instancias.
- Integracion como servicio interno en una universidad: la aplicacion Gradio puede desplegarse en un servidor propio para que secretarias y jefes de estudio introduzcan datos y obtengan propuestas.
- Generacion de horarios para cursos intensivos o escuelas de verano: al tratarse de instancias de tamano moderado y con restricciones simples (una sesion por franja), el enfoque DQN mas backtracking resulta suficiente.
- Analisis de sensibilidad de restricciones: modificando grupos, aulas o carga docente se puede observar como cambia la factibilidad, util para decidir si conviene ampliar el numero de aulas o de franjas.
- Material docente para cursos de aprendizaje por refuerzo: el codigo separa entorno, red, entrenamiento, busqueda y verificacion, lo que facilita explicar el patron DQN mas mascara de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que `benchmark.py` compara la red con una version no entrenada y con una heuristica manual, pero no se proporcionan cifras (porcentaje de horarios factibles, tasa de exito, tiempo de resolucion ni comparacion con solvers exactos).

## Requisitos de hardware

- VRAM: no disponible. Al estar la red implementada en NumPy y distribuirse los pesos en un archivo `.npz` dentro de un repositorio de 0.0 GB, la inferencia se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica; no se documenta soporte CUDA ni aceleracion por GPU.
- Compatibilidad con GPU de consumo: no aplica, al no ser necesaria una GPU.
- Opciones de despliegue: aplicacion Gradio (`python app.py`) sobre HuggingFace Spaces o servidor propio; se instala con `pip install -r requirements.txt` y no depende de frameworks de inferencia como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El autor solo indica que `train.py` se ejecuta con 4000 episodios, sin tiempos de referencia.

## Comparativa con modelos similares

| Sistema | Tipo | Restricciones duras | Garantia de optimalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `teuchi/qweqeqweqweqw` (DQN) | RL mas busqueda con retroceso sobre 14 caracteristicas | Si, via mascara de acciones y `verify` | No, el autor remite a CP-SAT / ILP para horarios densos | no disponible | Repositorio de 0.0 GB, 0 descargas |
| CP-SAT (Google OR-Tools) | Programacion por restricciones | Si | Si, con criterio de optimalidad configurable | Apache 2.0 (segun el proyecto OR-Tools) | Ampliamente disponible |
| ILP (solvers genericos, por ejemplo CBC o GLPK) | Programacion lineal entera | Si | Si | Depende del solver | Ampliamente disponible |
| Heuristica manual | Reglas fijas | Depende de la implementacion | No | no disponible | Referencia usada en `benchmark.py` |

La propia model card reconoce que, para horarios densos con garantia de optimalidad, son preferibles las aproximaciones CP-SAT o ILP.

## Limitaciones y advertencias

- La unidad de carga es una pareja (una sesion por franja); no se modelan sesiones dobles.
- No admite preferencias de profesores ni franjas no disponibles.
- No soporta semanas alternas (pares e impares).
- No ofrece garantia de optimalidad; para instancias densas el autor recomienda CP-SAT o ILP.
- Los pesos estan ligados a la version del conjunto de caracteristicas: un archivo `weights.npz` de una version antigua no cargara y producira un error.
- La licencia no esta declarada, por lo que el uso comercial queda en situacion juridica indeterminada.
- Los idiomas soportados no estan declarados; toda la documentacion y los mensajes de la aplicacion estan en ruso.
- El repositorio registra 0 descargas y 0 likes, sin evidencia publica de validacion externa.
- El identificador del repositorio (`qweqeqweqweqw`) y el tamano de 0.0 GB sugieren un espacio de prueba mas que un artefacto mantenido; no debe tratarse como un modelo listo para produccion.
- No se publican sesgos ni evaluaciones de robustez, al no tratarse de un modelo de lenguaje y no existir datos de evaluacion.
- El aviso de la model card (contenido en ruso) debe tomarse como material de referencia del autor y no como instruccion operativa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/teuchi/qweqeqweqweqw
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
