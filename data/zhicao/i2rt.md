# zhicao/i2rt

## Resumen

`zhicao/i2rt` no es un modelo de inteligencia artificial: es un repositorio de código que empaqueta la librería cliente en Python de I2RT, una empresa de robótica cuyo catálogo incluye brazos manipuladores YAM, pinzas motorizadas y la base móvil Flow Base. El repositorio contiene código fuente, ejemplos y utilidades de configuración, con un tamaño declarado de 0.0 GB, cero descargas y cero likes en HuggingFace, y sin pesos, tokenizador ni pipeline de inferencia asociado. La ficha se redacta, por tanto, como evaluación de una librería de control robótico y no de un modelo generativo.

El problema que resuelve es la capa de integración hardware-software: expone una API Python de tipo plug-and-play para leer posiciones articulares, comandar consignas, controlar la fuerza de la pinza, calibrar motores DM series por bus CAN a 1 Mbit/s y ejecutar teleoperación bimanual líder-seguidor, además de ofrecer modelos URDF/MJCF y compensación de gravedad en MuJoCo para simulación y visualización.

Su relevancia potencial está en el contexto de la robótica basada en aprendizaje: el autor lo presenta como "policy-deployment ready", es decir, como infraestructura para grabar trayectorias, construir datasets de imitación y desplegar políticas entrenadas con pipelines estándar. No obstante, al no incluir ningún modelo entrenado ni resultados de evaluación, su valor debe juzgarse como herramienta de ingeniería, no como componente de IA. La búsqueda web realizada no devolvió ningún resultado relacionado con el proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable: no es un modelo de IA, es una libreria cliente en Python para control de hardware robotico |
| Parametros totales | no aplicable: el repositorio no contiene pesos de modelo |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable: no hay pesos que cuantizar |
| Idiomas soportados | no disponibles en la metadata de HuggingFace; la documentacion y la API estan en ingles |
| Licencia | MIT segun el README del repositorio; la metadata de HuggingFace no declara licencia |
| Formato de pesos | no aplicable: codigo fuente Python; no hay safetensors, GGUF ni ONNX |
| Version de Python requerida | 3.11 (entorno creado con `uv venv --python 3.11`) |
| Sistema operativo | Linux (instalacion de `build-essential`, `python3-dev` y `linux-headers-$(uname -r)`) |
| Interface de comunicacion | bus CAN a 1 Mbit/s (por ejemplo `can0`), motores DM series |
| Hardware soportado | brazos YAM, pinzas `crank_4310`, `linear_3507`, `linear_4310`, mango de ensenanza `yam_teaching_handle`, base movil Flow Base |
| Simulacion | MuJoCo (compensacion de gravedad, modelos URDF/MJCF y visualizador) |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que describir. El repositorio es una librería de software con tres capas identificables: una capa de transporte (CAN bus a 1 Mbit/s con motores DM3507 y DM4310), una capa de abstracción de robot (`get_yam_robot`, `get_joint_pos`, `command_joint_pos`, `GripperType`) y una capa de simulación basada en MuJoCo para compensación de gravedad, visualización y control en bucle con el simulador. La API de Flow Base se expone mediante un cliente de red (`FlowBaseClient`) que recibe consignas de velocidad con especificación de marco de referencia (`frame="local"`).

Entre las decisiones técnicas destacables están el modo de gravedad cero para movimiento manual del brazo, la teleoperación líder-seguidor con ganancia bilateral configurable (`--bilateral-kp`, con 0.1–0.2 recomendado) que regula la resistencia percibida en el mango de enseñanza, el Grabado y reproducción de trayectorias, y un mecanismo de seguridad por defecto consistente en un timeout de 400 ms tras el cual los motores entran en modo damping si no reciben consignas. El autor reconoce como inspiraciones el diseño de teleoperación de GELLO y el hardware y control de la base móvil de TidyBot++. No se documenta composición de dataset, número de tokens, RLHF ni DPO porque no aplica.

## Capacidades

- Lectura y escritura de posiciones articulares en radianes sobre un brazo YAM de 6 grados de libertad (`q = robot.get_joint_pos()`, forma `(6,)`).
- Control de pinza con cuatro variantes de hardware, incluyendo control de fuerza y calibración automática en las pinzas lineales.
- Teleoperación líder-seguidor bimanual con activación y desactivación mediante botón superior y ganancia bilateral ajustable.
- Grabación y reproducción de trayectorias para generación de datos de demostración.
- Compensación de gravedad en MuJoCo, simulación y carga de modelos URDF/MJCF.
- Control de bajo nivel de motor único mediante lazo PD (ejemplo `single_motor_position_pd_control`).
- Configuración de motores: ajuste del timeout de seguridad y puesta a cero de offsets por ID de motor (1–6 en un YAM estándar).
- Control de la base móvil Flow Base mediante consignas de velocidad en marco local o global, con demo de joystick.
- Integración declarada con pipelines estándar de aprendizaje robótico para despliegue de políticas; no se incluye ninguna política ni checkpoint en el repositorio.
- No ofrece generación de texto, visión, tool calling, razonamiento multi-paso ni ninguna capacidad cognitiva: esas funciones corresponderían a un modelo externo que la librería no incorpora.

## Casos de uso

- Teleoperación bimanual para recogida de demostraciones: dos brazos YAM configurados como líder y seguidor generan episodios de manipulación que después se etiquetan como datos de imitación; la ganancia bilateral de 0.1–0.2 permite al operador sentir la interacción sin perder precisión.
- Construcción de datasets para aprendizaje por imitación: el ejemplo `record_replay_trajectory` permite grabar secuencias articulares y reproducirlas de forma determinista, lo que sirve como base para entrenar políticas con frameworks externos y para validar que la repetición en hardware es fiel.
- Despliegue de políticas entrenadas: la API `command_joint_pos` acepta consignas de posición a frecuencia de control, de modo que un bucle externo puede traducir las salidas de un modelo de aprendizaje (por ejemplo, un transformer de imitación) en comandos articulares; la librería actúa como capa de ejecución, no como modelo.
- Validación en simulación antes de tocar hardware: el visualizador MuJoCo y el ejemplo `control_with_mujoco` permiten comprobar límites, trayectorias y compensación de gravedad en un gemelo digital antes de ejecutar la misma secuencia en el brazo físico.
- Automatización de tareas repetitivas de pick-and-place: con la pinza `linear_4310` y control de fuerza se pueden programar rutinas de agarre sobre objetos de geometría conocida, usando las posiciones articulares como interfaz estable y el timeout de 400 ms como red de seguridad.
- Navegación de una base móvil Flow Base: el `FlowBaseClient` acepta consignas de velocidad en marco local, lo que permite integrar la base en un bucle de navegación propio (por ejemplo, con planificación externa) sin depender del joystick de demostración.
- Mantenimiento y puesta a punto de un laboratorio robótico: los scripts `set_zero.py` y `set_timeout.py` automatizan la calibración de offsets y la política de seguridad de los motores DM, tareas que de otro modo requieren herramienta propietaria.
- Docencia e investigación en control: el ejemplo de control PD de motor único y el modo de gravedad cero sirven para ilustrar lazos de control y compensación de gravedad sobre hardware real a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de éxito en tareas, tasas de precisión de agarre, latencias medidas ni comparaciones con otras plataformas. Tampoco se aportan métricas de throughput del bus CAN ni de frecuencia de control alcanzable. Cualquier cifra de rendimiento en robótica dependera del hardware concreto (modelo de brazo, pinza, adaptador CAN, carga útil) y no puede derivarse de la informacion suministrada.

## Requisitos de hardware

- VRAM para inferencia: no aplicable. La librería no ejecuta ningún modelo neuronal; el consumo de memoria es el de un proceso Python con NumPy y MuJoCo.
- GPU: no se requiere GPU para control, teleoperación ni visualización en MuJoCo. Solo sería necesaria si el usuario conecta externamente una política de aprendizaje que la requiera, caso no cubierto por el repositorio.
- Hardware físico imprescindible para uso real: brazo(s) YAM con motores DM3507/DM4310, pinza compatible, adaptador CAN configurado a 1 Mbit/s (interfaz `can0` o equivalente) y mango de enseñanza para el modo líder.
- Entorno de sistema: Linux con cabeceras del kernel, `build-essential` y `python3-dev`; Python 3.11 gestionado con `uv`.
- Despliegue de software: instalación en modo editable (`uv pip install -e .`), ejecución directa de scripts (`i2rt/robots/motor_chain_robot.py`, `i2rt/flow_base/flow_base_controller.py`) y ejemplos en `examples/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de software.
- Latencia y throughput: no disponibles. El único parámetro temporal documentado es el timeout de seguridad de 400 ms de fábrica, que actúa como cota superior del intervalo entre consignas antes de que los motores pasen a modo damping.

## Comparativa con modelos similares

La comparación se establece con librerías y plataformas de control robótico, no con modelos de lenguaje.

| Proyecto | Enfoque | Hardware objetivo | Licencia | Relación con i2rt |
|---|---|---|---|---|
| i2rt (este repositorio) | API Python de control, teleoperación y simulación MuJoCo | Brazos YAM, pinzas DM, Flow Base | MIT segun README; no declarada en HuggingFace | — |
| GELLO (`wuphilipp/gello_software`) | Interfaz de teleoperación de bajo coste | Brazos con motores Dynamixel y similares | no disponible en la informacion proporcionada | Citado por el autor como inspiración del diseño de teleoperación |
| TidyBot++ (`jimmyyhwu/tidybot2`) | Plataforma de manipulación móvil | Base móvil con brazo | no disponible en la informacion proporcionada | Citado por el autor como inspiración del hardware y control de Flow Base |
| LeRobot (HuggingFace) | Librería de aprendizaje robótico de extremo a extremo | Múltiples robots y datasets | no disponible en la informacion proporcionada | Alternativa de ecosistema para la parte de aprendizaje; i2rt solo declara compatibilidad con pipelines estándar |

No se dispone de datos de rendimiento comparativo entre estas opciones. La diferencia funcional principal es que i2rt se centra en la capa de hardware y teleoperación de su propio catálogo (YAM y Flow Base), mientras que las alternativas citadas son plataformas o ecosistemas más amplios.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa imágenes ni audio y no incorpora pesos, tokenizador ni pipeline. Cualquier expectativa de inferencia sobre este repositorio es un error de categoría.
- El repositorio declara 0.0 GB, 0 descargas y 0 likes, sin validación comunitaria ni evidencia pública de uso en producción.
- El README advierte de que desactivar el timeout de 400 ms puede provocar un par descontrolado si falla el bucle de compensación de gravedad; en ese caso exige inicializar con `zero_gravity_mode=False` y una consigna PD. Es un riesgo físico real sobre hardware.
- Las pinzas lineales requieren calibración porque el recorrido del motor supera 2π radianes; arrancar con la pinza cerrada o ejecutar la rutina de calibración es obligatorio para un control correcto.
- Dependencia fuerte de Linux, de adaptadores CAN compatibles y de la instalación de cabeceras del kernel; no se documenta soporte para Windows ni macOS.
- La licencia no está declarada en la metadata de HuggingFace y solo aparece como MIT en el README, lo que conviene verificar en el fichero `LICENSE` antes de un uso comercial.
- La documentación está únicamente en inglés y no se especifican versiones mínimas de dependencias ni matrices de compatibilidad de hardware.
- No hay información sobre sesgos, alucinación o limitaciones lingüísticas porque no hay modelo generativo; en su lugar, el riesgo principal es de seguridad física y de degradación silenciosa del control si el bus CAN pierde paquetes.
- La búsqueda web asociada a este identificador no devolvió resultados relacionados con el proyecto, por lo que no existe corroboración externa de las afirmaciones del README.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zhicao/i2rt
- Sitio del fabricante: https://i2rt.com/
- Repositorio de código citado en el README: https://github.com/i2rt-robotics/i2rt
- Inspiración en hardware y control de base móvil (TidyBot++): https://github.com/jimmyyhwu/tidybot2
- Inspiración en diseño de teleoperación (GELLO): https://github.com/wuphilipp/gello_software
- Soporte técnico declarado: support@i2rt.com
- Contacto comercial declarado: sales@i2rt.com
