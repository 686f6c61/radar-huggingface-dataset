# zengyh29/g1-beatit-sysid-v0.6.1-onnx

## Resumen

Beat-It (heat-aware, SysID v0.6.1) en formato ONNX es un filtro de seguridad para el robot humanoide Unitree G1 de 29 grados de libertad. Lo desarrolla el autor zengyh29 y se publica como un artefacto de inferencia embebida basado en onnxruntime, sin dependencia de PyTorch ni de simulador. El filtro se interpone entre cualquier tracker de consignas articulares y el robot: cada 20 ms imagina el siguiente segundo de ejecucion y decide si deja pasar las consignas del tracker o cede el control a una politica de recuperacion (el "fallback"). Su objetivo es evitar dos fallos concretos: una caida y que un bobinado de motor alcance los 70 grados centigrados.

El modelo pertenece a la familia de tecnicas de reinforcement learning seguro con filtro de seguridad aprendido. Combina un modelo del mundo (world model) que predice la evolucion a un segundo vista, con un modelo termico de motor procedente del proceso de identificacion de sistemas (SysID) v0.6.1, y una politica de recuperacion entrenada. El repositorio incluye dos variantes: `teacher_200d`, con 200 entradas de estado y umbral de rechazo calibrado en 0.665, y `student_nofoot_188d`, con 188 entradas que prescinde de las 12 entradas de pie (altura, tiempo en aire, contacto y fuerzas de contacto), pero cuyo umbral aun no esta calibrado.

Su relevancia actual radica en que aborda un problema practico de despliegue en humanoides: la G1 no mide directamente todas las senales que el monitor necesita, por lo que parte de las entradas requieren estimadores. El propio autor advierte que el modelo solo esta validado en simulacion y no ha corrido sobre hardware, lo que lo convierte en una pieza de investigacion reproducible mas que en un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Filtro de seguridad aprendido: monitor con world model (rollout imaginado de 1 s) mas politica de recuperacion (fallback), exportados a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de prediccion de 1 s (50 pasos a 50 Hz) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX de precision original) |
| Idiomas soportados | no aplica (modelo de control robotico, sin capacidades linguisticas) |
| Licencia | other |
| Formato de pesos | ONNX (`beatit_fallback.onnx`, `beatit_monitor.onnx`) con metadatos en `spec.json` y grabacion de paridad en `parity.npz` |

## Arquitectura y entrenamiento

El sistema se compone de dos redes ONNX por variante. El monitor (`beatit_monitor.onnx`) recibe el estado del fallback (`fb_state [1,S]`), un contexto de 33 dimensiones (`context [1,33]`) y la propuesta del tracker (`proposal [1,29]`), y devuelve `margin_min [1]`, `survival [1]` y `tw_max_c [1,29]`. Internamente ejecuta un rollout imaginado de un segundo: aplica la propuesta durante un paso y el fallback durante los 49 restantes dentro de un world model aprendido que incorpora el modelo termico de motor SysID v0.6.1. La politica de recuperacion (`beatit_fallback.onnx`) mapea `fb_obs [1,127]` a `actions [1,29]`, con normalizador de entrada interno y salida recortada a mas-menos 3.

Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada, dado que se trata de un modelo de control y no de un modelo de lenguaje. La innovacion tecnica destacable es el acoplamiento de un world model con un modelo termico de bobinado dentro del bucle de decision a 50 Hz, junto con la regla de conmutacion: la propuesta se rechaza cuando `margin_min < threshold` o cuando es NaN, y tras un rechazo el fallback gobierna durante al menos 1 s antes de reevaluar la propuesta del tracker en cada paso. La variante student se entreno con un world model sin las 12 entradas de pie y presenta un error de cota del world model a 1 s del 95 por ciento de 0.290, frente a 0.808 del teacher.

## Capacidades

- Filtrado de seguridad en tiempo real a 50 Hz sobre consignas articulares de un humanoide de 29 grados de libertad.
- Prediccion de fallo por caida mediante supervivencia estimada (`survival`) y margen minimo (`margin_min`).
- Prediccion de sobrecalentamiento de motor: estima la temperatura maxima de bobinado (`tw_max_c`) por articulacion a un segundo vista.
- Conmutacion automatica entre tracker y politica de recuperacion con histéresis de 1 s.
- Modo sombra (shadow mode): registra decisiones sin actuar sobre el robot, util para validacion previa.
- Inferencia sin PyTorch ni simulador, solo numpy y onnxruntime (o onnxruntime-gpu).
- Verificacion de integridad y paridad mediante `check_onnx.py`, `parity.npz` y hashes sha256 en `spec.json`.
- No dispone de capacidades de generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Validacion en modo sombra sobre el Unitree G1: ejecutar `step()` y comparar `out["engaged"]` con lo que ocurre realmente, sin enviar las consignas del fallback, para calibrar el comportamiento antes de actuar.
- Capa de seguridad entre un tracker de consignas y el controlador de bajo nivel: el filtro convierte la consigna del tracker a unidades de accion de Beat-It, la evalua y decide si la deja pasar o cede el control al fallback.
- Proteccion termica de motores: usar `tw_max_c` para detectar propuestas que llevarian un bobinado a 70 grados centigrados en el horizonte de un segundo y rechazarlas antes de que ocurra.
- Investigacion en RL seguro: emplear el par monitor-fallback como referencia reproducible para comparar filtros de seguridad aprendidos en humanoides.
- Pruebas en gantry: el autor recomienda pasar de modo sombra a pruebas sobre bancada antes de cualquier despliegue, usando la grabacion de paridad para verificar la integracion.
- Desarrollo de estimadores de estado: la variante teacher exige senales que la G1 no mide directamente (velocidad lineal de base, temperaturas de carcasa y estructura, entradas de pie), lo que la convierte en banco de pruebas para pipelines de estimacion.
- Despliegue embebido con onnxruntime-gpu: el formato ONNX y el bucle de referencia en `runtime.py` permiten integrar el filtro en la computadora del robot sin arrastrar el stack de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos aportados son la cota de error del world model a 1 s al 95 por ciento (0.290 para `student_nofoot_188d`, 0.808 para `teacher_200d`), el umbral calibrado del teacher (0.665), la frecuencia de operacion (50 Hz, paso de 20 ms) y el tamano del repositorio (0.1 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.1 GB y las redes son de control, por lo que la huella deberia ser muy reducida, pero no se publica una cifra.
- GPU recomendadas: no disponible. El autor menciona `onnxruntime-gpu` para el robot, sin especificar modelos de GPU.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por el tamano del artefacto es plausible, pero no hay dato oficial.
- Opciones de despliegue: onnxruntime (CPU) y onnxruntime-gpu; bucle de referencia con numpy en `runtime.py`; verificacion con `check_onnx.py`.
- Latencia y throughput: el bucle objetivo es de 50 Hz (20 ms por paso); `check_onnx.py` permite medir tiempos en la maquina del usuario, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de filtros de seguridad aprendidos para humanoides ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Estado declarado por el autor: validado solo en simulacion; no ha corrido sobre hardware.
- Algunas entradas del monitor no las mide directamente la G1 y requieren estimadores (velocidad lineal de base, temperaturas de carcasa y estructura, y las entradas de pie en la variante teacher).
- La variante `student_nofoot_188d` no tiene umbral calibrado; debe usarse solo en modo sombra hasta que se publique uno.
- La variante teacher depende de 12 entradas de pie que la G1 no proporciona, lo que obliga a estimarlas o a usar la variante student.
- Riesgo de falsos positivos y negativos en la decision de rechazo, con el coste asociado de ceder el control al fallback durante al menos 1 s.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial queda sujeto a la licencia concreta del autor y debe verificarse antes de produccion.
- No hay informacion sobre sesgos, alucinacion o cobertura idiomatica porque el modelo no es linguistico; esas categorias no aplican.
- El filtro depende de la convencion de orden articular del SDK de la G1 (29 grados de libertad) y del marco de la IMU de pelvis; una integracion incorrecta de frames o unidades invalida las decisiones.

## Enlaces

- Repositorio ONNX: https://huggingface.co/zengyh29/g1-beatit-sysid-v0.6.1-onnx
- Checkpoint fuente en PyTorch (`teacher_200d`): https://huggingface.co/zengyh29/g1-beatit-sysid-v0.6.1
