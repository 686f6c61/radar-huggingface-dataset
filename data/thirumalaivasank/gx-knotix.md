# thirumalaivasank/gx-knotix

## Resumen

GXKNOTIX es un proyecto de automatizacion robotica publicado en Hugging Face por el desarrollador indio Thirumalaivasan K (usuario `thirumalaivasank`) bajo el pipeline `robotics`. No es un modelo de lenguaje ni un modelo generativo al uso: es una celula de trabajo (workcell) de fisica aplicada que combina NVIDIA Omniverse, Isaac Lab 3.0, el motor Newton Physics y NVIDIA TensorRT para automatizar el anudado de flores (tecnica de jazmin en direccion opuesta) y el ensartado de guirnaldas. El repositorio incluye el entorno de simulacion multiphysica, el entorno de aprendizaje por refuerzo, los scripts de exportacion a ONNX/TensorRT y el runner de bucle cerrado para hardware real.

El sistema resuelve un problema concreto de manipulacion de objetos deformables: el hilo y los tallos no son cuerpos rigidos, de modo que el proyecto modela el hilo como una barra de Cosserat dentro de Newton Physics, aplica aleatorizacion de dominio sobre elasticidad y friccion del hilo, y entrena una politica que se exporta a un motor TensorRT en FP16 para ejecutarse a 60 Hz en hardware de borde (Jetson Orin o GPU RTX). La propuesta de valor es el pipeline completo sim-to-real, no un checkpoint aislado.

Su relevancia ahora es limitada pero ilustrativa: el repositorio tiene 0 descargas y 0 likes, fue creado el 24 de octubre de 2026 y ocupa 0.0 GB, por lo que no parece alojar pesos reales. Funciona mas como referencia de arquitectura de un stack de Physical AI que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control entrenada por aprendizaje por refuerzo (topologia de red no publicada); pipeline Isaac Lab 3.0 + Newton Physics para simulacion y TensorRT para inferencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la politica consume observaciones por paso de control) |
| Tipos de cuantizacion | FP16 (motor TensorRT generado con `trtexec --fp16`); export intermedio a ONNX |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`gxknotix_policy.onnx`) y motor TensorRT (`gxknotix_policy.engine`, FP16) |

## Arquitectura y entrenamiento

El sistema se organiza en tres etapas. La primera es simulacion y entrenamiento: un entorno Isaac Lab 3.0 con brazos Franka y un hilo modelado como barra de Cosserat de Newton Physics, con aleatorizacion de dominio sobre elasticidad y friccion del hilo; el MDP se define en `simulation/gxknotix_knotting_rl_env.py`. La segunda es exportacion y compilacion: `simulation/export_policy_tensorrt.py` convierte la politica PyTorch entrenada a ONNX y despues a un motor TensorRT FP16. La tercera es ejecucion en el mundo real mediante `deployment/nvidia_physical_ai_runner.py` a 60 Hz en bucle cerrado y `deployment/hardware_interface.py` como bus de hardware.

La tarea modelada es el anudado canonico en 14 pasos: tension del hilo de 2 a 3 N entre tensor e indexador, recogida de capullos Kundumalli con pinzas izquierda y derecha, anidado en direccion opuesta (capullo A con la punta hacia +Y, capullo B invertido 180 grados hacia -Y, tallos en contacto sin holgura), enrollado del hilo con el rotor del spinner, formacion del lazo con mecanismo billhook, tiro y apriete, y avance del indexador de paso en +9 mm por ciclo para acumular la guirnalda de doble cara. El autor no publica el numero de tokens ni de muestras de entrenamiento, la composicion del dataset, ni si se emplearon RLHF/DPO (tecnicas no aplicables a este dominio). Tampoco detalla hiperparametros de RL, funcion de recompensa ni dimensiones del espacio de observacion y accion.

## Capacidades

- Control de manipulacion en bucle cerrado a 60 Hz para una tarea de anudado de flores y ensartado de guirnaldas.
- Coordinacion bimanual (brazos Franka con pinzas izquierda y derecha) junto con actuadores especificos: tensor de hilo, rotor del spinner, billhook e indexador de paso.
- Simulacion multiphysica de objetos deformables mediante barras de Cosserat para el hilo, con aleatorizacion de elasticidad y friccion.
- Transferencia sim-to-real mediante exportacion ONNX y compilacion TensorRT FP16 para despliegue en el borde.
- Inferencia de baja latencia: el autor declara ejecucion por debajo de 2 ms por paso de politica.
- Gemelo digital interactivo en Omniverse Kit (`--viz kit`) y modo headless de verificacion (`--num_steps 100`).
- No soporta generacion de texto, razonamiento linguistico, codigo, matematicas, vision general, tool calling, function calling, agentes multi-paso ni capacidades multilingues.

## Casos de uso

- Automatizacion de floristeria industrial: la politica ejecuta el ciclo completo de anudado y ensartado, sustituyendo la operacion manual repetitiva de guirnaldas de jazmin con una cadencia dictada por el bucle de 60 Hz y el avance de 9 mm por pieza.
- Referencia de pipeline sim-to-real para objetos deformables: los scripts de Isaac Lab, exportacion ONNX y compilacion TensorRT sirven como plantilla para proyectos que necesiten pasar de simulacion multiphysica a control real de hilo, cable o tejido.
- Despliegue en robotica de borde: el runner de TensorRT esta pensado para Jetson Orin o GPU RTX de borde, lo que permite integrar la inferencia en el propio bastidor de la celula sin depender de un servidor externo.
- Validacion de gemelo digital antes de tocar hardware: el modo `--viz kit` permite inspeccionar visualmente la secuencia de 14 pasos y el modo headless permite ejecutar verificaciones automaticas de la cinematica antes de comisionar la maquina.
- Estudio de robustez frente a variabilidad de material: la aleatorizacion de elasticidad y friccion del hilo es directamente reutilizable para analizar como degrada la politica ante lotes de hilo con propiedades distintas.
- Docencia e investigacion en RL aplicado: el repositorio separa entorno MDP, exportacion y despliegue, lo que facilita usar el entorno de anudado como banco de pruebas para algoritmos de RL en manipulacion fina.
- Presupuesto de latencia en lazos de control: el objetivo declarado de menos de 2 ms por inferencia sobre un presupuesto de 16,6 ms a 60 Hz sirve como caso de estudio de optimizacion con TensorRT en sistemas ciberfisicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente declara una latencia de inferencia inferior a 2 ms con el motor TensorRT FP16 y una frecuencia de operacion de 60 Hz en bucle cerrado; no se aportan tasas de exito de anudado, ni curvas de aprendizaje, ni comparaciones sim-to-real.

| Metrica declarada | Valor | Estado |
|---|---|---|
| Latencia de inferencia (TensorRT FP16) | < 2 ms | declarada por el autor, no verificada |
| Frecuencia del bucle de control | 60 Hz | declarada por el autor |
| Tasa de exito de la tarea | no disponible | no publicada |
| Rendimiento sim-to-real | no disponible | no publicado |

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica el tamano de la politica; al tratarse de una red de control exportada a TensorRT FP16, la huella es con toda probabilidad muy inferior a la de un modelo de lenguaje, pero no hay dato confirmado.
- GPU recomendadas por el autor: Jetson Orin o GPU RTX de borde para el motor TensorRT; GPU de escritorio con soporte Omniverse para la simulacion con Isaac Lab y Omniverse Kit.
- GPU de consumo: no confirmado. Cualquier GPU NVIDIA con soporte TensorRT deberia poder ejecutar el motor de inferencia; la simulacion requiere el stack Omniverse e Isaac Lab.
- Opciones de despliegue: TensorRT (`trtexec` para compilar el motor, runner propio de Python), ONNX Runtime como alternativa al motor compilado, y integracion con ROS mencionada en el diagrama de arquitectura (sin detalle de implementacion en la informacion disponible).
- Latencia y throughput: menos de 2 ms por inferencia y 60 Hz de bucle cerrado segun el autor; throughput maximo no disponible.
- Notas de plataforma: los scripts de arranque documentados (`start.bat`, `stop.bat`) y las rutas de ejemplo apuntan a Windows con PowerShell, incluyendo rutas absolutas del tipo `C:\Users\thiru\gx-workspace\gx-knotix\IsaacLab`.

## Comparativa con modelos similares

La comparacion es cualitativa porque GXKNOTIX no publica benchmarks ni especificaciones de red. Se incluyen alternativas de la misma categoria (politicas de manipulacion robotica con transferencia sim-to-real), con datos tomados del conocimiento general del sector y no de la informacion proporcionada; los campos no confirmados se marcan como no disponibles.

| Modelo | Enfoque | Parametros | Formato de despliegue | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| GXKNOTIX | Politica RL para anudado de flores, pipeline Isaac Lab + Newton + TensorRT | no disponible | ONNX, motor TensorRT FP16 | MIT | repositorio de 0.0 GB, pesos no confirmados |
| Diffusion Policy (Chi et al.) | Politica de difusion para manipulacion visomotora | no disponible | PyTorch | no disponible en la informacion | publica |
| ACT / ALOHA (Zhao et al.) | Transformer de imitacion para manipulacion bimanual de precision | no disponible | PyTorch | no disponible en la informacion | publica |
| OpenVLA | Modelo vision-language-action de proposito general | aproximadamente 7 000 M (dato publico, fuera de la informacion proporcionada) | PyTorch | condiciones de los pesos a verificar | publica |

Las diferencias clave: GXKNOTIX esta especializado en una unica tarea de manipulacion de deformables, mientras que OpenVLA y ACT apuntan a generalizacion o a tareas bimanuales mas amplias; ninguno de los comparables ofrece un pipeline TensorRT de borde documentado de punta a punta.

## Limitaciones y advertencias

- No se han publicado pesos verificables: el repositorio ocupa 0.0 GB y el autor referencia archivos (`gxknotix_policy.onnx`, `policy.engine`) que no se confirman como alojados en el Hub.
- Ausencia total de benchmarks, tasas de exito y metricas de sim-to-real; no es posible evaluar la calidad de la politica.
- No se documentan hiperparametros de entrenamiento, funcion de recompensa, espacio de observacion ni de accion, lo que impide reproducir el entrenamiento.
- Rutas absolutas codificadas en la documentacion (`C:\Users\thiru\...`) y dependencia de scripts por lotes de Windows, lo que complica el uso fuera de ese entorno.
- La interfaz de hardware (`deployment/hardware_interface.py`) es especifica de la celula descrita; no hay protocolo documentado para adaptarla a otros actuadores.
- Politica de tarea unica: no hay evidencia de generalizacion a otros tipos de nudo, otras flores u otras geometrias de celula.
- Riesgo fisico: un fallo silencioso de la politica en un lazo de 60 Hz puede danar el material o el utillaje; se requiere parada de emergencia y limites de par independientes del modelo.
- Sesgos: no aplicables en el sentido de sesgos linguisticos, pero si existe un sesgo de dominio fuerte hacia los parametros fisicos del hilo y los capullos simulados.
- Licencia MIT para el codigo del repositorio, pero las dependencias del stack NVIDIA (Omniverse, Isaac Lab, TensorRT, Newton Physics) tienen sus propias condiciones que deben revisarse antes de un uso comercial.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo y repositorio de politica en Hugging Face: https://huggingface.co/thirumalaivasank/gx-knotix
- Demo interactiva en Hugging Face Spaces: https://huggingface.co/spaces/thirumalaivasank/gx-knotix-demo
- Repositorio en GitHub: https://github.com/thirumalaivasan-k/gx-knotix
- Perfil de GitHub del autor: https://github.com/thirumalaivasan-k
- Perfil profesional del autor en LinkedIn: https://in.linkedin.com/in/thirumalaivasank
