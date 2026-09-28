# ytung/starvla-qwenoft-pipette-realaug-0927

## Resumen

`ytung/starvla-qwenoft-pipette-realaug-0927` es un checkpoint de politica robótica de tipo vision-language-action (VLA) publicado en HuggingFace por el usuario `ytung`. Se trata de un ajuste fino de `Qwen3-VL-4B-Instruct` realizado con el framework starVLA, en su variante QwenOFT, y orientado a una tarea concreta de manipulación con pipeta sobre un robot Unitree G1 (así lo indican las etiquetas `unitree-g1`, `robotics` y `vision-language-action`). El modelo recibe texto de tarea, tres vistas de cámara y 35 valores de estado, y produce 30 objetivos XYZ relativos al chunk a 60 Hz.

El interés del artefacto es doble. Por un lado, documenta una receta de entrenamiento poco habitual en modelos abiertos: mezcla 50/50 de demostraciones reales (HIL293) y aumentación simulada del 27 de septiembre, con 249 episodios reales y 532 simulados de entrenamiento, 20 100 updates, batch efectivo de 256 y 4 GPU NVIDIA B200. Por otro, publica métricas intermedias de evaluación en bucle abierto (MSE normalizado de 0,06303 en el paso 19 500, equivalente a 0,646 veces la línea base de mantener posición, con RMSE XYZ de aproximadamente 1,50 / 1,09 / 1,02 mm).

Ahora bien, conviene ser explícito sobre su alcance: no es un modelo de propósito general ni un modelo Transformers autónomo. Es un checkpoint de PyTorch que depende de la implementación starVLA QwenOFT, de un preprocesado de cámara concreto, de estadísticas de normalización y de una convención FK/IK específicas. No declara licencia, no aporta pesos en safetensors ni GGUF, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que debe considerarse material de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformer multimodal; VLM Qwen3-VL-4B-Instruct con cabeza de acción (action head) añadida mediante el framework starVLA QwenOFT |
| Parametros totales | No disponible en la ficha; el modelo base declarado es Qwen3-VL-4B-Instruct (aproximadamente 4 000 millones de parametros), sin que se especifique el recuento del checkpoint final tras anadir la cabeza de acción |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publica un checkpoint de PyTorch; no hay versiones GGUF, AWQ, GPTQ ni cuantizadas) |
| Idiomas soportados | Ingles (`en`, segun la model card) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint de PyTorch (no es un modelo Transformers autonomo; requiere starVLA QwenOFT) |
| Entradas | Texto de tarea, tres vistas de camara, 35 valores de estado |
| Salidas | 30 objetivos XYZ relativos al chunk a 60 Hz (no predice orientacion de muneca ni comandos de dedos) |
| Tamano del repositorio | 9,1 GB |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura parte de un VLM preentrenado, Qwen3-VL-4B-Instruct, que actua como columna vertebral multimodal, y le acopla una cabeza de acción entrenada específicamente para la tarea. El framework starVLA en su variante QwenOFT es el responsable de esta composición: la model card indica que se trata de un ajuste fino de Qwen3-VL-4B-Instruct con dicha receta, y que el resultado no es un modelo Transformers autónomo, sino un checkpoint que necesita la implementación starVLA correspondiente, el preprocesado de cámara, las estadísticas de normalización y la convención FK/IK para funcionar.

El entrenamiento combina datos reales y simulados con muestreo 50/50. La fuente real son demostraciones HIL293 y la simulada es una aumentación fechada el 27 de septiembre. El conjunto de entrenamiento consta de 249 episodios reales y 532 simulados; la evaluación se separa por «parent» de origen, con 44 episodios reales y 93 simulados. Se realizaron 20 100 updates sobre 4 GPU NVIDIA B200 con batch efectivo de 256 y optimizador AdamW, usando tasas de aprendizaje diferenciadas: 1e-5 para el VLM y 1e-4 para la cabeza de acción. Las etiquetas simuladas, muestreadas a 25 Hz, se interpolan a la línea temporal de salida, que corre a 60 Hz. Otra decisión de diseño destacable es la restricción del espacio de acción: solo se predicen objetivos XYZ, dejando fuera la orientación de muñeca y los comandos de dedos, lo que reduce la dimensionalidad del problema a costa de necesitar otro mecanismo para el agarre.

## Capacidades

- Generacion de acciones de manipulacion: produce chunks de 30 objetivos XYZ relativos a 60 Hz, equivalentes a 0,5 segundos de trayectoria cartesiana por inferencia.
- Condicionamiento multimodal: integra instruccion textual de tarea, tres vistas de camara y un vector de 35 valores de estado como contexto de decision.
- Ejecucion de una tarea especifica de pipeta sobre Unitree G1, segun las etiquetas del repositorio.
- Mezcla de dominio real y simulado: el modelo ha sido entrenado explicitamente con datos de ambas fuentes al 50 %, lo que en principio favorece la robustez ante variaciones de entorno.
- Razonamiento visuo-linguistico heredado del VLM base Qwen3-VL-4B-Instruct (comprension de imagen y texto), aunque reorientado al control motor.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional, es una politica de control.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM de proposito general; la unica «planificacion» es la prediccion de un chunk de trayectoria.
- Capacidades multilingues: no disponibles; la unica lengua declarada es el ingles.
- Capacidad especial: control de robot a 60 Hz con ventana de accion de 0,5 s por chunk; sin modo «thinking», sin vision generativa, sin audio.
- No predice orientacion de muneca ni comandos de dedos, por lo que no cubre el ciclo completo de agarre.

## Casos de uso

- Manipulacion con pipeta en laboratorio automatizado: el modelo traduce una instruccion textual y tres vistas de camara en trayectorias XYZ a 60 Hz, lo que permite ejecutar la tarea de pipeteo sobre un Unitree G1 siempre que la orientacion y el agarre se resuelvan con una politica auxiliar.
- Investigacion en aprendizaje por imitacion con mezcla real-sim: sirve como caso de estudio reproducible de una receta 50/50 (249 episodios reales frente a 532 simulados) para estudiar como la aumentacion sintetica afecta al error de posicion en bucle abierto.
- Punto de partida para ajuste fino en tareas de pick-and-place: al ser un checkpoint derivado de Qwen3-VL-4B-Instruct y entrenado con starVLA QwenOFT, puede reutilizarse como inicializacion en tareas que compartan espacio de accion XYZ.
- Banco de pruebas del framework starVLA: permite validar el pipeline completo (preprocesado de camara, estadisticas de normalizacion, convencion FK/IK) en una tarea concreta antes de escalar a otras.
- Recoleccion de datos por teleoperacion o HIL: la model card menciona demostraciones HIL293, de modo que el modelo es util como politica de referencia para comparar nuevas rondas de datos human-in-the-loop.
- Generacion de trayectorias simuladas a 60 Hz: dado que las etiquetas de simulacion llegan a 25 Hz y se interpolan a la linea temporal de salida, el modelo puede emplearse para estudiar la sensibilidad del control a la frecuencia de las etiquetas.
- Evaluacion de bucle abierto frente a una linea base trivial: con un MSE normalizado de 0,646 veces la linea base de mantener posicion, es un candidato razonable como referencia en experimentos comparativos de politicas VLA de 4B.
- Prototipado en robotica de investigacion: su tamano (repo de 9,1 GB) permite desplegarlo en una GPU de gama alta para experimentos de laboratorio, no para produccion.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares), dado que no es un modelo de lenguaje general. Los unicos datos de rendimiento disponibles son las metricas intermedias de evaluacion de la propia tarea, obtenidas en el paso 19 500 y en bucle abierto:

| Metrica | Valor |
|---|---|
| MSE normalizado (held-out mixto) | 0,06303 |
| Ratio frente a la linea base de mantener posicion | 0,646 x (aproximadamente un 35 % de reduccion del MSE) |
| RMSE XYZ | Aproximadamente 1,50 / 1,09 / 1,02 mm |
| Paso de entrenamiento evaluado | 19 500 (de un total de 20 100 updates) |
| Tipo de evaluacion | Bucle abierto, intermedia; no es el checkpoint final ni una medida de exito de tarea en el mundo real |
| Episodios de evaluacion | 44 reales y 93 simulados, separados por parent de origen |

No se han publicado resultados de benchmarks comparativos con otros modelos VLA en la informacion disponible.

## Requisitos de hardware

- Entrenamiento declarado: 4 GPU NVIDIA B200, batch efectivo de 256 con AdamW y 20 100 updates.
- VRAM de inferencia: no disponible de forma explicita. Como estimacion orientativa a partir del modelo base de aproximadamente 4B parametros, los pesos en bf16 ocuparian en torno a 8-9 GB, a los que hay que sumar el codificador visual, las tres vistas de camara, la cabeza de accion y las activaciones; un rango realista de trabajo seria de 12 a 20 GB segun lote y resolucion de imagen. Estas cifras son una estimacion, no un dato publicado.
- GPU recomendadas: para entrenamiento o ajuste fino, B200 (declaradas por el autor) o alternativas de clase A100/H100 con memoria suficiente; para inferencia, una GPU con 24 GB o mas.
- Cabe en GPU de consumo: probablemente si en una RTX 4090 (24 GB) en bf16 y con lote pequeno; en tarjetas de 16 GB como la RTX 4080 el margen seria muy ajustado, especialmente con tres flujos de camara. No se ha verificado experimentalmente.
- Opciones de despliegue: limitadas al ecosistema starVLA/QwenOFT, porque es un checkpoint de PyTorch con cabeza de accion y no un modelo Transformers estandar. No hay soporte declarado en vLLM, Ollama, llama.cpp ni TGI, y tampoco existen pesos GGUF.
- Latencia y throughput: no disponibles. Como referencia derivada del diseno, cada inferencia cubre 30 objetivos a 60 Hz, es decir 0,5 segundos de trayectoria, por lo que el control en bucle cerrado exigiria sostener al menos 2 inferencias por segundo para no dejar huecos en la ejecucion.

## Comparativa con modelos similares

No se dispone de datos verificados de comparacion en la informacion proporcionada. A continuacion se enumeran alternativas de la misma categoria (politicas VLA para manipulacion robotica) sin cifras comparativas, ya que no estan confirmadas por las fuentes consultadas:

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starvla-qwenoft-pipette-realaug-0927 | VLA sobre Qwen3-VL-4B-Instruct | No disponible (base de aproximadamente 4B) | No disponible | No disponible | Checkpoint PyTorch en HuggingFace, requiere starVLA |
| OpenVLA y OpenVLA-OFT | VLA sobre VLM de 7B | No disponible en las fuentes consultadas | No disponible | No disponible | No disponible en las fuentes consultadas |
| pi-zero (Physical Intelligence) | VLA con flujo de difusion | No disponible en las fuentes consultadas | No disponible | No disponible | No disponible en las fuentes consultadas |
| GR00T N1 (NVIDIA) | Modelo fundacional para robotica humanoide | No disponible en las fuentes consultadas | No disponible | No disponible | No disponible en las fuentes consultadas |

La comparacion relevante, en cualquier caso, es de dificil traslado: este checkpoint esta especializado en una unica tarea de pipeta sobre Unitree G1, mientras que las alternativas citadas se presentan como modelos fundacionales multi-tarea. Comparar sus cifras sin un protocolo comun (mismo robot, mismas metricas, mismo conjunto de evaluacion) no seria metodologicamente valido.

## Limitaciones y advertencias

- Modelo de tarea unica: esta ajustado para pipeta sobre Unitree G1; no es un modelo generalista y su transferencia a otras tareas o robots no esta demostrada.
- Espacio de accion incompleto: solo predice objetivos XYZ. No predice orientacion de muneca ni comandos de dedos, por lo que no puede cerrar por si solo el ciclo de agarre.
- Metricas de bucle abierto: el MSE de 0,06303 y los RMSE en milimetros no miden exito de tarea en el mundo real. La propia model card advierte que son resultados intermedios del paso 19 500, no del checkpoint final.
- Sin licencia declarada: no se especifica ninguna licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, debe tratarse como no autorizado para produccion hasta que el autor lo aclare.
- Dependencia estricta del entorno de ejecucion: requiere la implementacion starVLA QwenOFT, el preprocesado de camara exacto, las estadisticas de normalizacion y la convencion FK/IK. Sin ellos, el checkpoint no es utilizable.
- Formato no portable: al no existir safetensors ni GGUF y no ser un modelo Transformers autonomo, no se puede cargar con herramientas estandar como vLLM, Ollama o llama.cpp.
- Cero validacion externa: 0 descargas y 0 likes en el momento de la consulta, ademas de un unico autor responsable; no hay replicaciones independientes.
- Idioma unico declarado (ingles), lo que limita el uso de instrucciones de tarea en castellano o en otras lenguas.
- Riesgo de sobreajuste al dominio de recogida de datos: mezcla 50/50 de datos reales (249 episodios) y simulados (532 episodios); con ese volumen, la generalizacion a condiciones de iluminacion, camara o laboratorio distintas es incierta.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto falso, pero si existe riesgo de predicciones de trayectoria fisicamente invalidas cuando la escena se aleja de la distribucion de entrenamiento, algo que exige limites de seguridad en el controlador del robot.
- Sin informacion sobre sesgos: no se documentan sesgos de representacion ni evaluaciones de seguridad, algo relevante porque el modelo controla hardware fisico.
- Fecha de publicacion inusualmente futura (2026-09-28) y ventana de actualizacion de menos de dos horas el mismo dia, lo que sugiere un artefacto experimental en curso.

## Enlaces

- HuggingFace: https://huggingface.co/ytung/starvla-qwenoft-pipette-realaug-0927
- Modelo base declarado: Qwen3-VL-4B-Instruct (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- Framework starVLA / QwenOFT: mencionado en la model card; no se proporciona URL verificada en la informacion disponible
- Paper, blog, repositorio o demo: no disponible
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun enlace relevante sobre este modelo, su framework o su tarea; los resultados obtenidos eran contenido no relacionado y se han descartado.
