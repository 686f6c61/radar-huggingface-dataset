# TheSauceman/microduck-sprint-2m-stride06

## Resumen

microduck-sprint-2m-stride06 es una politica de locomocion para el robot cuadrupedo microduck de Pollen Robotics, publicada por el usuario TheSauceman en HuggingFace. No se trata de un modelo de lenguaje, sino de un controlador neuronal entrenado con aprendizaje por refuerzo que produce una marcha en linea recta y se ejecuta de forma continua (perpetua) hasta que se le indique lo contrario, cargandose en una ranura de politica del demonio `robotctl` del robot.

La politica trabaja con un vector de observacion de 61 dimensiones y emite 14 acciones a 50 Hz, es decir, un bucle de control con un presupuesto de 20 ms por paso. Se distribuye como un unico fichero `policy.onnx` con el normalizador de observaciones integrado (se le deben entregar observaciones en crudo) acompanado de un `manifest.json` conforme al esquema 2 del manifiesto de politicas de microduck.

Su interes es acotado pero claro: es una variante concreta de la familia de politicas de sprint de 2 metros para microduck, con ajustes de recompensa orientados a zancadas mas largas (piernas espejadas, penalizacion de rumbo, suavizado mas gentle, eliminacion del tiempo parado y articulaciones de cadera y rodilla mas sueltas a alta velocidad). El repositorio es de tamano practicamente nulo (0,0 GB redondeado), sin descargas ni valoraciones relevantes en el momento de la consulta, y sin licencia declarada, lo que limita su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada con aprendizaje por refuerzo; topologia concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; consume un vector de observacion de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible (se distribuye un unico ONNX sin variantes cuantizadas declaradas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` segun esquema 2 |
| Espacio de observacion | 61 dimensiones |
| Espacio de acciones | 14 acciones |
| Frecuencia de control | 50 Hz |
| Tarea | `Mjlab-Sprint2m-MicroDuck` |
| Framework de entrenamiento | mjlab-microduck 0.1.0 (commit base 8d0dbc94c) |
| Checkpoint / semilla | 2750 / 1 |
| Tamano del repositorio | 0,0 GB (redondeado) |

## Arquitectura y entrenamiento

La model card no describe la topologia de la red (numero de capas, anchura, tipo de capa o funcion de activacion), por lo que este dato debe considerarse no disponible. Lo que si se documenta es el procedimiento de entrenamiento: la politica se obtuvo con el framework mjlab aplicado al modelo microduck, en la tarea `Mjlab-Sprint2m-MicroDuck`, ejecutando 4096 entornos en paralelo durante un maximo de 3000 iteraciones del agente, con semilla 1 y registro en TensorBoard bajo el nombre de ejecucion `stride06`. El checkpoint final publicado corresponde al paso 2750.

El diseno de la recompensa es el rasgo diferencial de esta variante respecto a otras de la misma familia: piernas espejadas para una marcha simetrica, penalizacion de rumbo para mantener la trayectoria recta, un suavizado mas gentle de las acciones, un termino que desincentiva permanecer parado y una rigidez reducida en caderas y rodillas a alta velocidad para permitir zancadas mas largas. El normalizador de observaciones esta incrustado en el propio fichero ONNX, de modo que la politica espera observaciones sin normalizar. El autor advierte explicitamente de que el entrenamiento no es reproducible bit a bit entre maquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una politica comparable, no los mismos pesos.

## Capacidades

- Generacion de una marcha cuadrupeda en linea recta a partir de observaciones propioceptivas y de comando de 61 dimensiones.
- Ejecucion perpetua: la politica no termina por si misma, camina hasta que el demonio la descargue o la sustituya en su ranura.
- Control a 50 Hz con 14 grados de actuacion, adecuado para el bucle de control en tiempo real del robot.
- Acepta observaciones en crudo, ya que integra el normalizador en el ONNX.
- Carga e integracion directa mediante `robotctl policy load <slot> <repo>`, sin pipeline de conversion adicional.
- Suavizado de acciones mas agresivo que otras variantes, orientado a reducir oscilaciones en la marcha.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, capacidades de agente ni soporte multilingue: es exclusivamente una politica de control motor.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para locomocion: sirve como politica de referencia para estudiar el efecto del diseno de recompensa (piernas espejadas, penalizacion de rumbo, rigidez articular variable) sobre la longitud de zancada y la estabilidad.
- Comparativas y ablaciones dentro de la familia de politicas de sprint de 2 metros de microduck: al compartir tarea y framework con otras variantes publicadas, permite aislar el impacto de cambios concretos en el reward shaping.
- Experimentos de transferencia simulacion a realidad: la politica se ha entrenado en simulacion con 4096 entornos y se despliega directamente en hardware mediante el demonio del robot, lo que la hace util para medir la brecha sim-a-real en un cuadrupedo de bajo coste.
- Docencia y talleres de robotica: el comando de carga en una ranura es inmediato, lo que facilita demostraciones de politicas entrenadas con RL sin requerir reentrenamiento ni GPU en el aula.
- Punto de partida para nuevos entrenamientos: el repositorio de retos documenta el comando exacto de reproduccion, de modo que un equipo puede partir de esta configuracion y modificar los terminos de recompensa o el numero de entornos.
- Pruebas de despliegue de inferencia ONNX en computo embebido: al ser un fichero ONNX unico y pequeno, es un banco de pruebas comodo para validar tiempos de inferencia dentro de un presupuesto de 20 ms por ciclo.
- Evaluacion de la marcha como linea base en pruebas de velocidad o distancia recorrida sobre terreno plano, dado que el objetivo de la tarea es cubrir 2 metros en sprint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa final, velocidad alcanzada, longitud de zancada, consumo energetico ni resultados de evaluacion en hardware real. Como referencia documental del entrenamiento, y sin que constituya un benchmark, se incluyen los metadatos de la ejecucion:

| Parametro de entrenamiento | Valor |
|---|---|
| Tarea | Mjlab-Sprint2m-MicroDuck |
| Entornos en paralelo | 4096 |
| Iteraciones maximas | 3000 |
| Checkpoint publicado | 2750 |
| Semilla | 1 |
| Repositorio | github.com/SteveTarter/microduck-challenges |
| Commit | 5dcec24a5 |
| Base | mjlab-microduck 0.1.0 @ 8d0dbc94c |
| Inicio del entrenamiento | 2026-10-14T20:56:43Z |
| Reproducibilidad exacta | no (RL en GPU no es reproducible bit a bit) |

## Requisitos de hardware

- VRAM para inferencia: no aplica en la practica; una politica ONNX de 61 entradas y 14 salidas se ejecuta en CPU sin necesidad de GPU dedicada. No se publica el numero de parametros ni el tamano exacto del fichero.
- GPU recomendadas para uso: ninguna en particular; cualquier CPU moderna del propio robot deberia ser suficiente, aunque no se documenta el hardware del microduck en la informacion disponible.
- GPU para reentrenamiento: no especificadas. El comando de reproduccion lanza 4096 entornos en paralelo via mjlab, lo que en la practica exige una GPU de gama alta (clase A100, H100 o RTX 4090 o superior); el autor no indica cual se utilizo.
- Encaje en GPU de consumo: la inferencia no requiere GPU. Para entrenar, no hay datos publicados sobre el encaje en tarjetas de consumo.
- Opciones de despliegue: el metodo documentado es `robotctl policy load <slot> TheSauceman/microduck-sprint-2m-stride06` sobre el demonio de microduck. Al ser ONNX, tambien es desplegable con ONNX Runtime en cualquier integracion propia. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. El unico limite conocido es el derivado del bucle de control a 50 Hz, que impone un presupuesto de 20 ms por paso.

## Comparativa con modelos similares

| Modelo | Autor | Tarea | Observacion / acciones | Licencia | Estado |
|---|---|---|---|---|---|
| microduck-sprint-2m-stride06 | TheSauceman | Sprint 2 m, marcha en linea recta | 61 / 14 a 50 Hz | no disponible | 4 descargas, 0 likes |
| microduck-sprint-2m-ar04-stand02 | TheSauceman | Sprint 2 m con componente de mantenerse de pie | no disponible | no disponible | no disponible |
| microduck-sprint-2m-reference | pollen-robotics | Sprint 2 m (referencia oficial) | no disponible | no disponible | repositorio oficial de la organizacion |

Los tres modelos pertenecen a la misma familia de politicas de locomocion para microduck y comparten espacio de observacion y accion segun el formato de manifiesto de politicas del demonio. No se dispone de datos publicos de rendimiento, licencia ni numero de parametros para ninguno de ellos, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de integrarla en un producto.
- Ausencia de validacion externa: 4 descargas y 0 likes en el momento de la consulta, sin evidencia de uso por terceros.
- Sin benchmarks ni metricas: no hay datos de velocidad, estabilidad, consumo ni tasa de exito en hardware real.
- Alcance funcional muy restringido: es una politica de marcha en linea recta; no realiza giros, no gestiona terrenos irregulares declarados y no incorpora ninguna capacidad cognitiva.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo de texto. El riesgo equivalente es la perdida de estabilidad o la caida del robot ante observaciones fuera de la distribucion de entrenamiento.
- Reproducibilidad limitada: el propio autor advierte de que el entrenamiento no es reproducible bit a bit, por lo que una futura reproduccion dara pesos distintos.
- Dependencia del preprocesado correcto: el normalizador esta incrustado en el ONNX; alimentar observaciones ya normalizadas produce acciones incorrectas.
- Restriccion temporal dura: a 50 Hz, cualquier fallo de inferencia o sobrecarga de CPU del robot degrada el control de forma inmediata.
- Idiomas y contexto: no aplica en ningun caso, ya que no procesa texto ni mantiene una ventana de contexto conversacional.

## Enlaces

- HuggingFace: https://huggingface.co/TheSauceman/microduck-sprint-2m-stride06
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/SteveTarter/microduck-challenges
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio de microduck (ruta citada en la model card, sin URL completa disponible)
- Politica de referencia oficial: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Variante comparable del mismo autor: https://huggingface.co/TheSauceman/microduck-sprint-2m-ar04-stand02
