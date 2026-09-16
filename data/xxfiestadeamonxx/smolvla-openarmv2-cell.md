# xXFiEsTaDeAmOnXx/smolvla-openarmv2-cell

## Resumen

SmolVLA OpenArm v2 Cell es un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base, un modelo de vision-lenguaje-accion (VLA) de aproximadamente 450 millones de parametros. Lo publica el usuario xXFiEsTaDeAmOnXx bajo licencia Apache-2.0 y esta especializado en una unica tarea de manipulacion bimanual: levantar un cubo con el robot OpenArm v2 Cell dentro del simulador MuJoCo. No es un modelo de lenguaje conversacional, sino una politica robotica que consume imagenes de camara e instrucciones textuales y emite acciones motoras.

El modelo parte de la familia SmolVLA de LeRobot (HuggingFace), disenada para entrenar politicas VLA en hardware de consumo, y se ha reentrenado sobre el dataset enactic/openarm-2-cell-pick_up_cube_mujoco-lerobot, compuesto por 30 episodios de demostracion en simulacion. Recibe tres flujos de imagen RGB (camara de techo, muneca derecha y cabeza izquierda) mas la instruccion "Pick up the cube.", y produce un vector de 16 posiciones articulares (primero el brazo derecho, despues el izquierdo) a 30 Hz.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para evaluar politicas bimanuales en el entorno gym_openarmv2 y como punto de partida para investigacion en sim-to-real. El repositorio no tiene descargas ni valoraciones y no publica resultados de benchmarks, por lo que debe tratarse como un artefacto de investigacion sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) heredada de lerobot/smolvla_base |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, INT8 o INT4 |
| Idiomas soportados | no disponible; la unica instruccion de tarea documentada esta en ingles ("Pick up the cube.") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Modalidad de entrada | 3 camaras RGB: observation.images.camera1 (ceiling), camera2 (wrist_right), camera3 (head_left) |
| Modalidad de salida | 16 dimensiones de posiciones articulares (brazo derecho y despues brazo izquierdo) |
| Frecuencia de accion | 30 Hz |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | enactic/openarm-2-cell-pick_up_cube_mujoco-lerobot |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de indicar que se trata de un fine-tune de lerobot/smolvla_base dentro del ecosistema LeRobot. Por tanto, la unica informacion verificable es la del modelo base: una politica VLA que combina un backbone de vision-lenguaje con un modulo generador de acciones, y que produce "chunks" de acciones en lugar de una accion unica por paso. El numero de parametros del fine-tune coincide con el del modelo base (~450 M), lo que sugiere que no se ha modificado el tamano de la red, solo los pesos.

Respecto al entrenamiento, la model card indica que se ha ajustado sobre demostraciones de tipo lift-only (unicamente levantar el cubo) con 30 episodios en MuJoCo. No se especifican el numero de tokens o pasos de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o RL; estos datos no estan disponibles. Tampoco se documentan innovaciones tecnicas anadidas sobre el modelo base (por ejemplo, decodificacion especulativa o atencion lineal). La unica adaptacion documentada es el mapeo de nombres de camaras del dataset (ceiling, wrist_right, head_left) a las entradas de la politica (camera1, camera2, camera3), que debe replicarse mediante --rename_map en la evaluacion.

## Capacidades

- Generacion de acciones motoras continuas: emite vectores de 16 posiciones articulares a 30 Hz para un robot bimanual (brazo derecho seguido del izquierdo).
- Condicionamiento por lenguaje natural: acepta una instruccion textual de tarea; la unica documentada es "Pick up the cube.".
- Fusion multisensorial visual: integra tres vistas RGB simultaneas (techo, muneca derecha, cabeza izquierda) como observacion.
- Manipulacion bimanual en simulacion: coordinacion de dos brazos para la fase de agarre y elevacion del cubo.
- Ejecucion de politicas por chunks: propia de la familia SmolVLA, predice secuencias de acciones en lugar de una sola.
- No soporta tool calling ni function calling: es una politica robotica, no un LLM con interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso en el sentido conversacional.
- No se documentan capacidades multilingues.
- No dispone de modo "thinking", vision general (VQA, captioning), audio ni generacion de texto libre.
- No cubre matematicas, codigo ni tareas de lenguaje; la componente de lenguaje se limita a interpretar la instruccion de la tarea.

## Casos de uso

- Baseline de evaluacion en simulacion: sirve como referencia cuantificable (tasa de exito en 10 episodios con lerobot-eval) para comparar nuevas politicas bimanuales en el entorno gym_openarmv2, gracias a que el protocolo de evaluacion esta documentado paso a paso.
- Depuracion de pipelines de manipulacion bimanual: al cubrir exclusivamente la fase de agarre y elevacion, permite aislar y validar la cadena percepcion-accion (tres camaras, 16 articulaciones, 30 Hz) antes de abordar tareas mas complejas.
- Generacion de trayectorias sinteticas en MuJoCo: las acciones generadas pueden registrarse como datos adicionales para entrenar otras politicas (por ejemplo, mediante imitacion iterativa o DAgger) dentro del mismo simulador.
- Investigacion en sim-to-real: es un punto de partida para estudiar la transferencia de una politica entrenada en MuJoCo al robot OpenArm fisico, cuantificando la degradacion de rendimiento entre ambos dominios.
- Estudio de eficiencia de datos en VLA pequenos: con solo 30 episodios de demostracion, el modelo permite analizar hasta que punto un backbone de ~450 M parametros puede especializarse en una tarea de una sola etapa.
- Pruebas de infraestructura de inferencia robotica: util para medir latencia, throughput y estabilidad a 30 Hz en GPUs de consumo, asi como el coste de mantener tres flujos de camara activos.
- Docencia y prototipado en robotica: adecuado para cursos o laboratorios que necesiten una politica VLA pequena, con licencia permisiva y dependencias estandar (LeRobot, PyTorch, MuJoCo).
- Comparativa de arquitecturas de politica: permite contrastar un VLA de ~450 M con alternativas como ACT o diffusion policy en la misma tarea y entorno, usando la misma metrica de exito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el procedimiento de evaluacion, sin cifras de rendimiento:

| Aspecto | Detalle |
|---|---|
| Entorno de evaluacion | gym_openarmv2 (env.type=openarmv2) |
| Herramienta | lerobot-eval (libreria lerobot) |
| Episodios documentados | 10 |
| Batch size | 1 |
| Dispositivo | cuda |
| Metrica | no disponible en la informacion proporcionada (no se publica tasa de exito) |

## Requisitos de hardware

- VRAM estimada para los pesos: ~1,8 GB en fp32, ~0,9 GB en bf16/fp16, ~0,45 GB en int8 y ~0,25 GB en int4, calculado a partir de los 450.046.176 parametros. Estas cifras son aritmeticas y no medidas publicadas por el autor.
- VRAM real de inferencia: superior a la de los pesos por las activaciones del backbone visual, los tres flujos de camara y el bucle de generacion de acciones. No hay mediciones publicadas; para un modelo de este tamano es razonable reservar entre 2 y 4 GB, pero es una estimacion, no un dato confirmado.
- GPU recomendadas: no hay recomendaciones del autor. Por tamano, cualquier GPU con 4-8 GB de VRAM es suficiente; se espera funcionamiento comodo en RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100.
- GPU de consumo: si, cabe en practicamente todas las GPU de consumo modernas con al menos 4 GB de VRAM, e incluso podria ejecutarse en CPU a costa de no sostener los 30 Hz.
- Opciones de despliegue: LeRobot mediante lerobot-eval (documentado en la model card) y PyTorch/CUDA como backend. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje con decodificacion autoregresiva de texto.
- Latencia y throughput: no disponibles. La frecuencia de control de la tarea es de 30 Hz, pero no se publica si el modelo alcanza esa tasa en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| smolvla-openarmv2-cell | ~450 M | VLA (fine-tune de SmolVLA) | no disponible | apache-2.0 | no disponible |
| lerobot/smolvla_base | ~450 M | VLA (modelo base) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| OpenVLA | ~7 B | VLA | no disponible en la informacion proporcionada | MIT (referencia publica) | no disponible en la informacion proporcionada |
| pi0 / pi0.5 (Physical Intelligence) | ~3 B (referencia publica) | VLA | no disponible en la informacion proporcionada | Apache-2.0 (repositorio openpi) | no disponible en la informacion proporcionada |

Nota: los datos de OpenVLA y pi0 se incluyen como referencia general de la categoria y no han sido verificados con la informacion proporcionada en esta busqueda. La comparativa estricta solo puede establecerse entre este modelo y su base, ya que ninguno de los dos publica cifras de rendimiento comparables.

## Limitaciones y advertencias

- Cobertura de tarea incompleta: el modelo se ha ajustado unicamente con demostraciones de elevacion del cubo (30 episodios). La fase de colocacion de la tarea de celda (depositar la pieza dentro de la bandeja negra) no esta cubierta por los datos de entrenamiento, por lo que no debe esperarse que la complete.
- Dominio exclusivamente simulado: todo el entrenamiento procede de MuJoCo. No hay evidencia publicada de funcionamiento en el robot OpenArm fisico ni de capacidad de transferencia sim-to-real.
- Dependencia estricta del mapeo de camaras: la politica espera las entradas camera1, camera2 y camera3. Si se evalua sin el --rename_map adecuado, las observaciones no coincidiran con las usadas en entrenamiento y el rendimiento se degradara.
- Instruccion unica y en ingles: solo se documenta "Pick up the cube."; no hay evidencia de generalizacion a otras ordenes ni de soporte multilingue.
- Riesgo de sobreajuste: con 30 episodios y una unica tarea, cabe esperar poca robustez ante cambios de iluminacion, posicion inicial del cubo, texturas o geometria del entorno.
- Alucinacion y errores de politica: aunque no genera texto, puede producir acciones fisicamente inconsistentes o colisiones, especialmente fuera de la distribucion de entrenamiento.
- Sin validacion comunitaria: el repositorio tiene 0 descargas y 0 valoraciones, sin resultados de benchmarks ni metricas de exito publicadas, por lo que su calidad real no esta contrastada.
- Licencia del modelo permisiva (Apache-2.0), pero la licencia del dataset de entrenamiento no se detalla en la informacion disponible; conviene verificarla antes de un uso comercial.
- Ausencia de datos de entrenamiento: no se publican hiperparametros, numero de pasos, composicion del dataset ni tecnicas de alineacion, lo que dificulta la reproducibilidad.
- Sesgos: no se documentan sesgos especificos, pero al heredar el backbone y los datos de un modelo base, puede arrastrar los sesgos visuales y de dominio de estos; no hay analisis disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xXFiEsTaDeAmOnXx/smolvla-openarmv2-cell
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/enactic/openarm-2-cell-pick_up_cube_mujoco-lerobot
- Entorno de evaluacion gym_openarmv2: https://github.com/xXFiEsTaDeAmOnXx/gym_openarmv2
- La busqueda web realizada no devolvio ningun enlace relacionado con el modelo: todos los resultados correspondian a la empresa Baxter (mobiliario y equipamiento medico) y no guardan relacion con esta ficha. No se han localizado papers, blogs ni demos adicionales en la informacion proporcionada.
