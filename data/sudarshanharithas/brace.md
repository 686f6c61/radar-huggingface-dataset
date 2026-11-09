# sudarshanharithas/BRACE

## Resumen

BRACE (Adapting Whole-Body References for Force and Terrain Aware Humanoid Motion Tracking) es un conjunto de politicas de control para el robot humanoide Unitree G1, desarrollado por Sudarshan Harithas y publicado bajo licencia Apache 2.0. No es un modelo de lenguaje: es un sistema de aprendizaje por refuerzo e imitacion que adapta referencias de movimiento de cuerpo completo a comandos de fuerza y momento aplicados en las manos, y a las condiciones del terreno. Resuelve el problema de que un humanoide teleoperado o dirigido por referencias cinematicas no responda correctamente cuando debe empujar, cargar o resistir perturbaciones externas sobre superficies irregulares.

La arquitectura sigue un esquema de destilacion profesor-alumno: dos profesores privilegiados (uno de exertion, otro de compensation) entrenados en simulacion con observaciones ricas (mapas de terreno, wrenches medidos) transfieren su comportamiento a un unico estudiante que solo dispone de propiocepcion e historial de comandos de referencia. El estudiante se exporta a ONNX y se ejecuta en el robot real sin necesidad de mapas de terreno ni de medicion directa de fuerzas en las manos.

El repositorio incluye los tres checkpoints entrenados, sus configuraciones congeladas, pesos en SafeTensors, la exportacion ONNX del estudiante y una instantanea del codigo fuente. Es relevante ahora porque aborda el control fisico de humanoides de bajo coste (Unitree G1) con despliegue sim2real documentado y una interfaz de teleoperacion con PICO, un area con muy pocas implementaciones publicas y reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control (actor-critic / destilacion profesor-alumno) sobre simulacion fisica; estudiante tipo flow con historial de 25 frames; profesores con historial de 8 frames y encoders privilegiados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; historial de observacion de 25 frames (estudiante) y 8 frames (profesores) |
| Tipos de cuantizacion | no disponible; exportacion ONNX para despliegue |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`), checkpoint PyTorch (`last.ckpt`), ONNX (`unified_pipeline.onnx`) |

## Arquitectura y entrenamiento

El sistema se compone de tres redes. Los dos profesores se entrenan con aprendizaje por refuerzo en simulacion usando observaciones privilegiadas: el profesor de exertion recibe un encoder de terreno, raiz y pendiente junto con comandos de fuerza y momento; el profesor de compensation recibe un encoder privilegiado de terreno y wrench externo, y se entrena frente a perturbaciones de fuerza y momento. Ambos operan con historiales de 8 frames. El estudiante unifica ambos comportamientos mediante destilacion, utiliza un historial de 25 frames de propiocepcion y acciones, y produce 29 objetivos articulares para el Unitree G1. La model card describe al estudiante como "flow student", lo que sugiere un modelo generativo de flujo para la politica.

El estudiante funciona unicamente con propiocepcion y comandos de referencia, sin mapas de terreno ni wrenches medidos en las manos, lo que es la clave para el despliegue real. El repositorio incluye scripts de entrenamiento de profesores (`scripts/train_exert_teacher.sh`, `scripts/train_comp_teacher.sh`) y de destilacion (`scripts/distill_student.sh`). No se especifican en la informacion disponible el numero de tokens, la composicion del dataset de movimiento ni si se empleo RLHF; el movimiento se suministra por separado como una MotionLib empaquetada compatible con G1.

## Capacidades

- Seguimiento de movimiento de cuerpo completo para el humanoide Unitree G1 con 29 objetivos articulares.
- Aplicacion controlada de fuerzas y momentos en las manos (exertion) siguiendo comandos de fuerza y par.
- Compensacion de perturbaciones externas (fuerza y momento) sobre el robot.
- Adaptacion a terreno irregular sin disponer de mapa de terreno en tiempo de ejecucion.
- Teleoperacion mediante interfaz PICO y GMR (pose source `vr`).
- Ejecucion del estudiante desde propiocepcion e historial de referencia, sin observaciones privilegiadas.
- Exportacion ONNX para despliegue en el robot real.
- No soporta tool calling, agentes, vision, audio ni capacidades linguisticas; no es un modelo de lenguaje.

## Casos de uso

- Teleoperacion de cuerpo completo de un Unitree G1: el estudiante consume poses de un dispositivo PICO a traves de la interfaz GMR y genera objetivos articulares en tiempo real, permitiendo operar el robot sin mapas de entorno.
- Tareas de empuje y manipulacion con fuerza controlada: con `--mode exert` y comandos de fuerza/par (por ejemplo `--force 3 0 0 --torque 0.1 0 0`), el robot aplica fuerzas consistentes en las manos, util para empujar objetos o abrir puertas.
- Resistencia a perturbaciones en entornos reales: el modo `comp` permite que el robot mantenga el seguimiento de referencia ante empujones o cargas externas, adecuado para entornos compartidos con personas.
- Navegacion sobre terreno irregular: al no requerir mapa de terreno, el estudiante puede operar en superficies con pendientes o irregularidades donde un controlador cinematico fallaria.
- Investigacion en sim2real para humanoides: el paquete incluye simulacion (`brace_repro sim2sim`), runtime de despliegue (`brace_deploy`) y guias `docs/sim2real.md` y `docs/pico.md`, lo que facilita reproducir y extender el metodo.
- Entrenamiento y ajuste fino de nuevas politicas: los scripts de profesores y destilacion permiten reentrenar con nuevos comandos de fuerza o terrenos usando los checkpoints publicados como inicializacion.
- Validacion previa sin robot: `python -m brace_deploy --check` permite comprobar la configuracion ONNX y la fuente de poses sin abrir un driver de robot, util en pipelines de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia del estudiante: red pequena exportada a ONNX; cabe en CPU para preflight y en GPU consumer para simulacion. No se especifica VRAM exacta en la informacion disponible.
- Simulacion: requiere dependencias `[sim,export,deploy]` con Python 3.11; en Ubuntu headless se necesitan `libosmesa6`, `libgl1` y `libegl1` con `MUJOCO_GL=osmesa` y `PYOPENGL_PLATFORM=osmesa`.
- Despliegue en robot: runtime `brace_deploy` con ONNX; no se detallan GPU recomendadas (A100, H100, RTX 4090) en la informacion disponible.
- Opciones de despliegue: ONNX Runtime mediante `brace_deploy`; simulacion mediante `brace_repro`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Tamano del repositorio: 0.8 GB, incluyendo tres checkpoints, ONNX y codigo fuente.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de control de humanoides comparables con datos de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Especifico del hardware: disenado para el Unitree G1 con 29 articulaciones; no es transferible directamente a otros humanoides sin reentrenamiento.
- Dependencia de datos externos: requiere una MotionLib empaquetada compatible con G1 que se distribuye por separado; sin ella no se puede ejecutar la simulacion.
- El estudiante no reproduce BRACE por si solo: la referencia adaptada por wrench en linea y el historial correctamente sincronizado forman parte del controlador; ejecutar solo la red neuronal no basta.
- Los profesores requieren observaciones privilegiadas y solo funcionan en simulacion.
- En modo compensacion, el runtime real recibe comandos de exertion a cero, mientras que en sim2sim los argumentos de fuerza/par fijan perturbaciones fisicas; confundir ambos modos produce resultados incorrectos.
- El repositorio de desarrollo interno (`multiplylabs/brace-internal`) es privado; solo la instantanea publica esta disponible.
- No hay datos publicados de benchmarks, latencia ni robustez fuera de las demostraciones del proyecto.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan garantias ni soporte; verificar los terminos de los datos de movimiento distribuidos por separado.
- Riesgo de fallo en sim2real por diferencias de friccion, latencia y calibracion; las guias `docs/sim2real.md` y `docs/pico.md` son necesarias antes del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudarshanharithas/BRACE
- Paper: https://arxiv.org/abs/2610.07052
- Pagina del proyecto: https://multiplylabs.github.io/brace/
- Demo interactiva: https://multiplylabs.github.io/robogym-online/
- Video: https://www.youtube.com/watch?v=jASGzq4K5m0
- Repositorio GitHub: https://github.com/multiplylabs/brace
- Repositorio interno (acceso restringido): https://github.com/multiplylabs/brace-internal
