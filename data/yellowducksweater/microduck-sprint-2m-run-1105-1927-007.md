# YellowDuckSweater/microduck-sprint-2m-run-1105-1927-007

## Resumen
El modelo `microduck-sprint-2m-run-1105-1927-007` es una política de control para robots cuadrúpedos de la familia Microduck, publicada por el usuario YellowDuckSweater en Hugging Face. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo entrenada para ejecutar una marcha (gait) de sprint de 2 metros sobre el robot Microduck de Pollen Robotics. El modelo se distribuye en formato ONNX con el normalizador de observaciones integrado, de modo que el robot puede alimentarlo directamente con observaciones crudas.

La política opera a 50 Hz, recibe un vector de observación de 61 dimensiones y produce 14 acciones de control. Se ha entrenado con el framework `mjlab-microduck` (versión 0.1.0) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, en el repositorio de retos `StephenForte/microduck-challenges`, con 4096 entornos paralelos y un máximo de 3000 iteraciones. El checkpoint publicado corresponde a la iteración 1250, con semilla 1.

El interés de esta ficha es principalmente práctico para quienes trabajan con robótica de bajo coste y aprendizaje por refuerzo en simulación: muestra un pipeline reproducible (con `uv.lock` y commit fijado) para entrenar y desplegar políticas de locomoción en un robot real, y sirve como referencia para comparar ejecuciones dentro de la Microduck Arena.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (MLP) para control robótico; no es un transformer ni un modelo de lenguaje |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible; se distribuye en ONNX (probablemente FP32, no confirmado) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento
La política es una red de tipo MLP que mapea un vector de observación de 61 dimensiones a 14 acciones de control, ejecutándose a 50 Hz. El normalizador de observaciones está embebido en el propio `policy.onnx`, por lo que el consumidor debe pasar observaciones sin normalizar. El modelo se enmarca en el ecosistema microduck (Pollen Robotics) y sigue el esquema de manifiesto de políticas versión 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con `mjlab-microduck` 0.1.0 (commit base `1efd853be`) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, usando 4096 entornos paralelos, hasta 3000 iteraciones, semilla 1 y TensorBoard como logger. El checkpoint publicado es el 1250. El autor advierte explícitamente de que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock`, commit y semilla produce una política comparable, pero no idéntica. La política es perpetua: se ejecuta hasta que se le indique lo contrario, y se carga en una ranura (slot) de política del robot mediante `robotctl`.

## Capacidades
- Locomoción cuadrúpeda: ejecuta una marcha de sprint de 2 metros sobre el robot Microduck.
- Control en tiempo real a 50 Hz con observaciones crudas (normalizador integrado).
- Política perpetua: mantiene la marcha hasta que se detiene o se sustituye por otra política.
- Despliegue directo en hardware mediante `robotctl policy load <slot> ...`.
- Compatible con el runner de la Microduck Arena y con MuJoCo para evaluación en simulación (según los modelos comparables del ecosistema; no confirmado explícitamente para este checkpoint).
- No soporta tool calling, function calling, agentes, multilingüismo ni modalidades de texto, visión o audio: es exclusivamente un controlador motor.

## Casos de uso
- Investigación en locomoción con RL: servir como política base para comparar marchas de sprint dentro de la Microduck Arena, usando el mismo runner y las mismas condiciones de evaluación.
- Despliegue en robot real: cargar la política en una ranura del daemon con `robotctl policy load` para que el Microduck ejecute el sprint de 2 metros de forma autónoma.
- Reproducción de experimentos: clonar `microduck-challenges` en el commit `7b94efa2b`, sincronizar con `uv` y relanzar el entrenamiento con la misma semilla para obtener una política comparable y estudiar la variabilidad del entrenamiento.
- Benchmarking de pipelines de RL: usar el checkpoint 1250 como referencia intermedia para analizar la curva de aprendizaje frente a checkpoints posteriores.
- Educación y prototipado en robótica de bajo coste: ejemplo completo de flujo sim-a-real (entrenamiento en `mjlab`, exportación a ONNX, despliegue en hardware) para cursos y talleres.
- Integración en pruebas de CI de robótica: validar que el runner de la Arena y el runtime ONNX cargan correctamente la política antes de desplegarla en flota.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de recompensa, tiempo de sprint ni tasas de éxito, y los resultados de búsqueda solo mencionan otros checkpoints del ecosistema (por ejemplo, `jhp123/microduck-sprint-2m-1595ms-20261029`, con un tiempo de 1595 ms en el evento sprint-2m), sin datos atribuibles a este checkpoint concreto.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; una política MLP de 61 entradas y 14 salidas cabe holgadamente en cualquier GPU consumer e incluso en CPU. No se dispone del número exacto de parámetros.
- GPU recomendadas: no se requiere GPU para inferencia; el robot ejecuta la política a 50 Hz, lo que es viable en CPU. Para reentrenar, el autor usa 4096 entornos paralelos, lo que exige una GPU de datacenter (A100, H100 o similar); no se especifica el modelo exacto empleado.
- Cabe en cualquier GPU consumer para inferencia; para entrenamiento, no es viable en consumer por el número de entornos paralelos.
- Opciones de despliegue: ONNX Runtime (el ecosistema cita la versión 1.24.4 en modelos comparables), el daemon `robotctl` de microduck y MuJoCo 3.10.0 para simulación.
- Latencia y throughput: 50 Hz de frecuencia de control (20 ms por paso); no se publican cifras de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| YellowDuckSweater/microduck-sprint-2m-run-1105-1927-007 | Política RL (MLP) | 61 / 14 | 50 Hz | ONNX | no disponible | Checkpoint 1250, semilla 1, run 1105-1927-007 |
| jhp123/microduck-sprint-2m-1595ms-20261029 | Política RL (MLP) | 61 / 14 | 50 Hz | ONNX | no disponible | Tiempo de 1595 ms en sprint-2m; evaluación con Arena runner 5, MuJoCo 3.10.0 y ONNX Runtime 1.24.4 |
| Helldave/microduck-sprint-2m-run-1027-2224 | Política RL | no disponible | no disponible | no disponible | no disponible | Otra ejecución del mismo evento sprint-2m |

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no admite prompts; cualquier uso fuera del control del Microduck carece de sentido.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en producto.
- El entrenamiento no es bit-reproducible: mismos comandos y semilla producen pesos distintos, lo que complica la auditoría exacta de resultados.
- El modelo card lo describe como "first run" y no aporta métricas de rendimiento; se desconoce su robustez ante perturbaciones, terreno variable o desgaste del hardware.
- Política perpetua: sin un mecanismo externo de parada, el robot seguirá ejecutando la marcha; es responsabilidad del operador definir condiciones de seguridad.
- Solo se ha validado, según la información disponible, en el ecosistema microduck (daemon, `robotctl`, manifiesto schema 2); no hay garantías de compatibilidad con otras plataformas.
- No se documentan sesgos (no aplica en el sentido de lenguaje), pero sí riesgos físicos: una política de locomoción mal desplegada puede dañar el robot o su entorno.

## Enlaces
- Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1105-1927-007
- Repositorio de retos: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Modelo comparable (jhp123): https://huggingface.co/jhp123/microduck-sprint-2m-1595ms-20261029
- Modelo comparable (Helldave): https://huggingface.co/Helldave/microduck-sprint-2m-run-1027-2224
