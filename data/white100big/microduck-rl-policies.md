# white100big/microduck-rl-policies

## Resumen

El modelo `white100big/microduck-rl-policies` es un conjunto de políticas de control de locomoción para el robot bípedo de pequeño tamaño **MicroDuck**, desarrollado por el usuario white100big (baekahm) y publicado en Hugging Face. Se trata de modelos entrenados mediante aprendizaje por refuerzo (reinforcement learning) en el simulador MuJoCo, con el objetivo de transferir el comportamiento al hardware real (sim2real). El repositorio incluye diez políticas ONNX distintas que cubren acciones como caminar, mantenerse de pie, sentarse y levantarse, recoger objetos del suelo, hacer una voltereta hacia delante, patear un balón con cada pie y patinar sobre ruedas.

La relevancia de este modelo radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas de control para robots bípedos de bajo coste, con una interfaz unificada de observación (vector de 61 dimensiones) y acción (vector de 14 dimensiones). El formato ONNX permite ejecutar la inferencia en tiempo real a 50 Hz en el propio robot o en simulación, sin depender de librerías de entrenamiento pesadas. Aunque no se especifican detalles de la arquitectura interna ni el número de parámetros, la naturaleza del problema (control de 14 articulaciones) sugiere redes de tipo perceptrón multicapa (MLP) de tamaño moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (tipo no especificado; probablemente MLP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de control sin contexto secuencial) |
| Tipos de cuantizacion | no disponible (modelo ONNX de precision float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx) |

El modelo no es un modelo de lenguaje ni de vision; es un conjunto de politicas de control para robotica. Por tanto, parametros como contexto o idiomas no son aplicables.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de las redes neuronales. Se sabe que las politicas se entrenaron con aprendizaje por refuerzo en el entorno MuJoCo, probablemente utilizando el framework `rsl_rl` (mencionado en el repositorio relacionado `mjlab`). El espacio de observacion es un vector de 61 componentes que incluye velocidad angular del IMU, gravedad proyectada, posiciones y velocidades de las 14 articulaciones, la accion anterior y un comando de 13 dimensiones (velocidad lineal y angular, orientacion de cabeza y postura corporal). El espacio de accion es un vector de 14 componentes que representa los offsets angulares objetivo para los actuadores Dynamixel XL330.

El bucle de control opera a 50 Hz, con un paso de simulacion fisica de 0,005 segundos y un factor de diezmado de 4. La posicion objetivo del motor se calcula como `posicion_por_defecto + accion * escala_de_accion`. No se indica si se utilizo RLHF, DPO u otras tecnicas de refinamiento; el entrenamiento es puramente de aprendizaje por refuerzo clasico (PPO, probablemente). Tampoco se especifica el numero de tokens o episodios de entrenamiento.

## Capacidades

- Control de locomocion bípeda: las politicas permiten caminar hacia delante, atras y girar, siguiendo comandos de velocidad lineal (vx, vy) y angular (vyaw).
- Mantenimiento del equilibrio y postura: la politica `alpha_stand.onnx` controla la posicion del cuerpo en seis grados de libertad (x, y, z, roll, pitch, yaw) y mantiene el robot erguido.
- Transiciones de estado: `alpha_sitstand.onnx` gestiona el paso de sentado a de pie y viceversa de forma suave.
- Manipulacion basica: `alpha_ground_pick.onnx` permite al robot agacharse y recoger objetos del suelo.
- Acrobacias: `roulade.onnx` ejecuta una voltereta hacia delante y se recupera automaticamente.
- Interaccion con objetos: `ball_kick_left.onnx` y `ball_kick_right.onnx` patean un balon situado al frente con cada pie.
- Locomocion especial: `roller.onnx` y `roller_crouch.onnx` permiten patinar sobre ruedas, con una postura agachada para bajar el centro de gravedad.
- Inferencia en tiempo real: al estar en formato ONNX, puede ejecutarse en CPU con latencia muy baja (control a 50 Hz).

## Casos de uso

- Robotica educativa: el modelo puede integrarse en cursos de robotica y control para demostrar conceptos de aprendizaje por refuerzo y sim2real en un robot fisico de bajo coste (399 dolares).
- Desarrollo de algoritmos de control: investigadores pueden utilizar las politicas como punto de partida para probar nuevas arquitecturas de RL o tecnicas de transferencia, comparando sus resultados con estas politicas de referencia.
- Demostraciones en ferias y eventos: el robot con estas politicas puede realizar exhibiciones de caminar, volteretas y patadas, atrayendo la atencion del publico en demostraciones tecnologicas.
- Prototipado rapido de comportamientos: los desarrolladores pueden cargar las politicas ONNX en el robot y verificar rapidamente si una conducta (p. ej., recoger objetos) funciona en el hardware real antes de optimizarla.
- Investigacion en sim2real: las politicas entrenadas en simulacion y exportadas a ONNX sirven como caso de estudio para analizar la brecha entre simulacion y realidad en robots bípedos pequenos.
- Integracion en sistemas de robotica asistencial: aunque el robot es pequeno, las politicas de equilibrio y transicion de postura podrian adaptarse a futuros robots de asistencia personal en entornos domesticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas como MMLU, HumanEval o GSM8K porque el modelo no es de lenguaje ni de razonamiento. Para evaluar el rendimiento seria necesario medir la velocidad de ejecucion, la estabilidad del equilibrio, el exito en las tareas (p. ej., porcentaje de exitos en caminar sin caerse) o el error de seguimiento de comandos, pero estos datos no se han proporcionado.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo ONNX pequeno (dimensiones de entrada 61 y salida 14), se puede ejecutar en cualquier CPU moderna sin GPU. El bucle de control a 50 Hz requiere una latencia de inferencia inferior a 20 ms, facilmente alcanzable.
- GPU: no necesaria. La inferencia se realiza tipicamente en el microcontrolador del robot (probablemente un procesador embebido) o en un ordenador de bajo consumo.
- RAM: menos de 100 MB para cargar todos los modelos.
- Despliegue: se puede usar `onnxruntime` en Python, C++ o en el firmware del robot (por ejemplo, con micro-ONNX). Tambien es compatible con entornos de simulacion MuJoCo.
- Latencia: no se proporcionan datos exactos, pero para un modelo de este tamano la inferencia en CPU es del orden de microsegundos a pocos milisegundos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de politicas de control para el mismo robot o robots similares en la informacion proporcionada. El repositorio `pollen-robotics/microduck_rl` (mencionado en la busqueda web) puede contener politicas de referencia, pero no se han detallado sus caracteristicas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Dependencia del hardware especifico: las politicas estan disenadas para el robot MicroDuck con 14 actuadores Dynamixel XL330 y una configuracion de articulaciones concreta. No funcionaran en otros robots sin adaptacion.
- Sesgos de simulacion: aunque se menciona sim2real, el rendimiento en el mundo real puede degradarse si las condiciones fisicas (friccion, peso, desgaste) difieren de las simuladas.
- Riesgo de fallos en tareas dinamicas: acciones como la voltereta o las patadas requieren condiciones de suelo y estado inicial adecuados; un mal uso podria danar el robot.
- Sin capacidad de aprendizaje continuo: las politicas son fijas; no se adaptan a cambios en el entorno o en el propio robot.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario es responsable de los riesgos asociados a la operacion del robot.
- Documentacion limitada: la model card no especifica la arquitectura interna, hiperparametros de entrenamiento ni datos de rendimiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/white100big/microduck-rl-policies
- Perfil del autor: https://huggingface.co/white100big
- Repositorio de entrenamiento (pollen-robotics/microduck_rl): https://github.com/pollen-robotics/microduck_rl
- Repositorio del robot MicroDuck (pollen-robotics/microduck): https://github.com/pollen-robotics/microduck
- Articulo sobre Microduck en Byteiota: https://byteiota.com/hugging-face-microduck-399-open-source-robot-with-full-rl-stack/
- Blog de Explainx sobre Microduck: https://www.explainx.ai/blog/microduck-hugging-face-399-open-source-rl-robot-august-2026
