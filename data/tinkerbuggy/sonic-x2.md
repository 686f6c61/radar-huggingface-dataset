# tinkerbuggy/sonic-x2

## Resumen
SONIC X2 es un conjunto de modelos de control de cuerpo completo (whole-body control) para el robot humanoide AgiBot X2, que cuenta con 31 grados de libertad (DOF). El repositorio, publicado por el usuario tinkerbuggy, contiene los artefactos de despliegue necesarios para ejecutar una politica de seguimiento de movimiento (SONIC) y un planificador cinematico (motionbricks) en el robot real o en simulacion. Se presenta como un fork reducido del proyecto NVlabs/GR00T-WholeBodyControl, al que se anade la embodiment X2 con soporte para teleoperacion, gamepad y reproduccion de grabaciones pkl.

El modelo resuelve el problema de transferir politicas de control aprendidas por refuerzo (PPO) a un hardware especifico, proporcionando pesos en formato ONNX fusionado para inferencia en tiempo real mediante onnxruntime o TensorRT. La relevancia actual radica en que incluye verificacion de paridad sim-to-sim (ONNX frente a PyTorch) con una delta maxima de accion inferior a 1e-5, lo que lo convierte en una referencia util para equipos que trabajan con humanoides y buscan reducir la brecha entre simulacion y realidad. El repositorio ocupa 7,1 GB e incluye tanto los graficos de inferencia como los checkpoints de entrenamiento para continuar el fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SONIC (politica de seguimiento de movimiento con PPO) + motionbricks (planificador cinematico VQVAE + modelo de pose + modelo de raiz) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de 1670 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX estandar, sin especificar precision) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | pending-review (privada / todos los derechos reservados actualmente) |
| Formato de pesos | ONNX (.onnx), PyTorch (.pt, .ckpt) |

## Arquitectura y entrenamiento
El repositorio se divide en dos componentes principales. La politica SONIC es un modelo de seguimiento de movimiento basado en tokens universales, entrenado con PPO en IsaacLab sobre grandes corpus de movimiento humano y humanoide retargetizado. Posteriormente se realizo un fine-tuning especifico para la embodiment X2, centrado en la suavidad del aterrizaje (soft landing) y la dinamica de los brazos. El grafo de inferencia fusiona el encoder y el decoder en un unico archivo ONNX de 58 MB, que acepta una observacion de 1670 dimensiones (680 del tokenizador y 990 proprioceptivas) y produce una accion articular de 31 dimensiones en el orden de DOF de IsaacLab.

El segundo componente es el planificador cinematico motionbricks, un pipeline de tres etapas que incluye un tokenizador de movimiento (VQVAE), un modelo de pose autorregresivo y un modelo de raiz. Este pipeline se entrena sobre corpus de locomocion retargetizada y se exporta a un unico grafo ONNX fusionado (736 MB en modo template y 734 MB en modo velocity). Los checkpoints fuente en PyTorch (2,2 GB) se incluyen como punto de partida para fine-tuning. La verificacion de paridad se realizo en MuJoCo, comparando las salidas del ONNX con las del checkpoint .pt, obteniendo una delta maxima de accion inferior a 1e-5.

## Capacidades
- Control de cuerpo completo para humanoide de 31 DOF, generando acciones articulares directamente desde observaciones de alta dimension (1670-D).
- Seguimiento de movimiento (motion tracking) a partir de datos retargetizados de humanos y humanoides, con fine-tuning para dinamicas especificas del AgiBot X2.
- Planificacion cinematica en dos modos: template (condicionado por una libreria de plantillas de pose) y velocity (ruta de comandos legada).
- Inferencia en tiempo real en C++ mediante onnxruntime o TensorRT, con grafo ONNX fusionado para el policy y el planner.
- Soporte para teleoperacion, control con gamepad y reproduccion de grabaciones pkl en el stack de ejecucion.
- Kit de continuacion de entrenamiento: incluye checkpoints de PyTorch, configuraciones YAML de entrenamiento (incluido un drill de fine-tuning para dance, boxing y slowwalk) y un callback para programar la tasa de fine-tuning.
- No es un modelo de lenguaje ni de vision; no procesa texto, imagenes ni audio.

## Casos de uso
- Despliegue de politicas de control en el robot AgiBot X2: el archivo `x2_sonic_policy.onnx` se integra directamente en el nodo C++ de despliegue, permitiendo ejecutar el seguimiento de movimiento en el hardware real con latencia reducida gracias a la inferencia con onnxruntime o TensorRT.
- Investigacion en sim-to-real para humanoides: la verificacion de paridad sim-to-sim (delta < 1e-5) permite validar que los resultados obtenidos en MuJoCo se mantienen al exportar a ONNX, lo que facilita el estudio de la brecha de realismo antes de probar en el robot fisico.
- Teleoperacion y demostracion remota: el stack incluye runtimes de teleop y gamepad, por lo que el modelo puede utilizarse para ejecutar tareas demostradas por un operador humano en tiempo real, reproduciendo los movimientos en el robot.
- Generacion de movimientos de locomocion y manipulacion: el planificador cinematico en modo template permite generar secuencias de movimiento a partir de una libreria de plantillas de pose, util para tareas de caminata, baile o boxeo, como se refleja en los conjuntos de fine-tuning incluidos.
- Fine-tuning continuo de la politica: los checkpoints de entrenamiento (model_step_014000.pt) y las configuraciones YAML permiten a un equipo reanudar el entrenamiento con `+resume=true` para adaptar la politica a nuevas tareas o terrenos sin partir de cero.
- Desarrollo de planificadores de movimiento especificos: los checkpoints de motionbricks (VQVAE, pose y root) con sus sidecars (hparams, skeleton, stats) sirven como base para entrenar planificadores personalizados para otras embodiments o requisitos de locomocion.
- Benchmarking de control de cuerpo completo: al ser un fork de GR00T-WholeBodyControl, puede utilizarse como referencia para comparar el rendimiento de politicas de seguimiento de movimiento en entornos IsaacLab y MuJoCo, midiendo metricas como la delta de accion o la estabilidad del robot.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval o GSM8K) en la informacion disponible, ya que no se trata de un modelo de lenguaje o razonamiento general. El unico dato de rendimiento verificado es la paridad sim-to-sim en MuJoCo: la comparacion entre el grafo ONNX y el checkpoint PyTorch arroja una delta maxima de accion inferior a 1e-5, lo que confirma que la exportacion no introduce errores significativos en la salida de control.

## Requisitos de hardware
- Inferencia del policy SONIC: el archivo ONNX de 58 MB es ligero y puede ejecutarse en una GPU embebida o incluso en CPU para aplicaciones de control en tiempo real, siempre que se utilice onnxruntime o TensorRT. No se especifican requisitos minimos de VRAM.
- Inferencia del planificador cinematico: los archivos ONNX de 734-736 MB requieren una GPU con al menos 2-4 GB de VRAM para una ejecucion fluida, aunque no se proporcionan datos exactos de consumo.
- Entrenamiento y fine-tuning: los checkpoints de PyTorch (401 MB para el policy y 2,2 GB para el planner) requieren una GPU de estacion de trabajo, probablemente con 24 GB o mas de VRAM, aunque este dato no esta disponible en la documentacion.
- Opciones de despliegue: el stack esta disenado para ejecutarse en un nodo C++ con onnxruntime o TensorRT. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Se asume que la inferencia del policy es adecuada para control en bucle cerrado, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinkerbuggy/sonic-x2 | no disponible | 1670-D obs / 31-D action | pending-review (privada) | ONNX, PyTorch | Fork de GR00T con embodiment AgiBot X2 (31 DOF) |
| NVlabs/GR00T-WholeBodyControl | no disponible | no disponible | NVIDIA | PyTorch, ONNX | Proyecto upstream, soporta multiples embodiments, sin el stack X2 especifico |
| meetsitaram/GR00T-WholeBodyControl-X2 | no disponible | no disponible | no disponible | Codigo fuente | Fork intermedio que anade la embodiment X2, del cual este repositorio es el despliegue de modelos |

No se dispone de informacion sobre otros modelos comparables en la misma categoria (control de cuerpo completo para humanoides con 31 DOF) en la informacion proporcionada. La comparativa se limita al ecosistema GR00T, donde este repositorio se distingue por incluir los pesos ya exportados y verificados para el AgiBot X2.

## Limitaciones y advertencias
- Licencia restrictiva: los pesos estan bajo licencia "pending-review" y actualmente se consideran privados / todos los derechos reservados. No es seguro utilizarlos en proyectos comerciales sin autorizacion explicita del autor.
- Dependencia de componentes propietarios: la descripcion del robot y los SDK pertenecen a AgiBot y NVIDIA respectivamente, por lo que el despliegue requiere disponer de estos componentes y del stack de software del fork.
- Alcance limitado: no es un modelo de lenguaje ni de vision; su unica funcion es el control motor. No puede utilizarse para tareas de razonamiento, generacion de texto o procesamiento de imagenes.
- Riesgo de sesgos en el movimiento: al estar entrenado con datos retargetizados de humanos y humanoides, puede presentar limitaciones para generalizar a terrenos o condiciones de movimiento no representados en el corpus de entrenamiento.
- Proyecto experimental: el repositorio tiene 0 descargas y 0 likes, y fue creado en julio de 2026. Es un proyecto muy reciente y posiblemente sin validacion externa amplia, por lo que se recomienda precaucion antes de adoptarlo en entornos de produccion.
- Requisitos de integracion: el uso correcto exige seguir la estructura de directorios esperada (`~/x2_cloud_checkpoints/`) y las instrucciones del repositorio GitHub asociado, lo que anade complejidad de configuracion.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/tinkerbuggy/sonic-x2
- Repositorio GitHub del fork (GR00T-WholeBodyControl-X2): https://github.com/meetsitaram/GR00T-WholeBodyControl-X2
- Repositorio GitHub upstream (NVlabs/GR00T-WholeBodyControl): https://github.com/NVlabs/GR00T-WholeBodyControl
