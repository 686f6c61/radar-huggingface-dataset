# witcheer/microduck-walk-rough

## Resumen

`witcheer/microduck-walk-rough` es una política de control para el robot cuadrúpedo de código abierto Microduck de Pollen Robotics, entrenada mediante aprendizaje por refuerzo en simulación. No es un modelo de lenguaje: es una política de locomoción que ocupa el slot `walk` del daemon del robot y genera comandos de articulación a 50 Hz a partir de observaciones de 61 dimensiones (14 acciones). Se distribuye como `policy.onnx` con el normalizador de observaciones integrado, de modo que el consumidor alimenta observaciones en crudo.

La versión 2 es un ajuste fino de la v1 sobre el terreno rugoso del simulador con juego de engranajes simulado (+-1 grado de holgura en cada servo) y filas de terreno ordenadas de fácil a difícil. El entrenamiento parte de la iteración 8.000 de v1 y añade 3.000 iteraciones con 4.096 entornos en una única RTX 5090 (147 minutos, unos 2,9 s por iteración). El autor reporta que en la fila de terreno más difícil y con holgura activa, la v2 se mantuvo en pie 8 de 9 tomas de 20 segundos frente a 4 de 9 de la v1.

Su relevancia es acotada pero concreta: es una de las piezas de una escalera de habilidades (`witcheer/microduck-*`) para un robot de bajo coste, con licencia Apache-2.0 y un formato de despliegue estandarizado (`robotctl policy load`). El propio autor advierte que no se ha probado en un Microduck real y que las muestras son pequeñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (entrenada con RL en simulación; topología interna no detallada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control reactiva; observación de 61 dimensiones, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (exportación en ONNX; no se documentan niveles de cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La política mapea una observación de 61 dimensiones a 14 acciones a 50 Hz, con comportamiento perpetuo: ejecuta la marcha hasta recibir una orden de parada. El normalizador de observaciones está embebido en el ONNX, por lo que la interfaz de entrada es la observación cruda del robot. El manifiesto sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`, exportado desde un checkout con cambios sin confirmar). La tarea de simulación es `Mjlab-Velocity-Rough-Backlash-MicroDuck`, una variante del terreno rugoso del fabricante con +-1 grado de juego de engranajes en cada servo y filas de terreno ordenadas por dificultad (parche local de currículo; la v1 usó una rejilla aleatoria de 5x5). La v2 arranca en caliente desde la iteración 8.000 de la v1 y entrena hasta la 11.000: 3.000 iteraciones, 4.096 entornos, 147 minutos en una RTX 5090. La curva de recompensa media se mantiene plana alrededor de 104 entre las iteraciones 8.500 y 10.900, con nivel medio de terreno de 5,9 sobre 9 en la última ventana. La recompensa no es comparable con la de v1 por el distinto mix de terreno.

## Capacidades

- Locomoción cuadrúpeda perpetua sobre terreno rugoso: escaleras, pendientes y rejillas de bloques, con tolerancia a holgura mecánica de +-1 grado por servo.
- Ejecución de una marcha continua hasta recibir orden de parada (política perpetua, sin horizonte fijo).
- Despliegue directo en el robot mediante `sudo robotctl policy load walk witcheer/microduck-walk-rough`.
- Integración estandarizada vía manifiesto de política (esquema 2) y exportación ONNX autocontenida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor.

## Casos de uso

- Demostración de locomoción en terreno irregular: cargar la política en el slot `walk` y dejar que el Microduck recorra escaleras, rampas y rejillas de bloques en un entorno controlado, aprovechando el entrenamiento específico con holgura de engranajes.
- Investigación en simulación a realidad: usar la política como punto de partida para estudiar la brecha sim-to-real en un cuadrúpedo de bajo coste, dado que el autor documenta explícitamente que no se ha probado en hardware real.
- Banco de pruebas de robustez mecánica: evaluar cómo afecta el juego de engranajes real (backlash) a una marcha entrenada con +-1 grado simulado, comparando con la v1 sin holgura.
- Base para ajuste fino con RL: al estar entrenada contra `microduck_rl` y publicarse el linaje (v1 en la iteración 8.000, v2 hasta la 11.000), sirve como inicialización para nuevas tareas o terrenos.
- Docencia y divulgación en robótica: ejemplo reproducible de un pipeline completo de RL en simulación (Mjlab, 4.096 entornos, exportación ONNX, manifiesto de política) con coste de cómputo de una sola GPU.
- Integración en pipelines de evaluación automatizada: cargar la política vía `robotctl` y medir métricas de estabilidad (inclinación del tronco, reinicios por caída) sobre tomas de 20 segundos en filas de terreno seleccionadas.

## Benchmarks y rendimiento

Resultados en simulación reportados por el autor (tomas de 20 s, una sola pata simulada forzada a una fila y tipo de terreno, sin empujes aleatorios, muestreadas cada 0,1 s; una toma cuenta como mantenida si el tronco no supera 60 grados de inclinación y la simulación no reinicia por caída):

| Escenario | v2 (con holgura) | v1 (con holgura) |
|---|---|---|
| Fila más difícil, 9 tomas (3 por tipo) | 8 de 9 mantenidas, 2 caídas | 4 de 9 mantenidas, 6 caídas |
| Escaleras, fila más difícil | 2 de 3 | 1 de 3 |
| Rejilla de bloques, fila más difícil | 3 de 3 | 1 de 3 |
| Pendiente, fila más difícil | 3 de 3 | 2 de 3 |
| Fila 6, una toma por tipo | 3 de 3 | 3 de 3 |
| Fila más difícil sin holgura (una toma por tipo) | 2 de 3 (una caída en escaleras a los 2,5 s) | 3 de 3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en robot: la política es un ONNX de observación 61 y acción 14 a 50 Hz, por lo que la carga computacional en el Microduck es mínima; el autor no publica cifras de latencia ni de memoria en el dispositivo.
- Entrenamiento: una única RTX 5090 para la v2 (3.000 iteraciones, 4.096 entornos, 147 minutos, ~2,9 s/iteración) y para la v1 (8.000 iteraciones, 4.096 entornos, 324 minutos).
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible para inferencia; para reentrenamiento, RTX 5090 según la model card.
- Despliegue: daemon de microduck con `robotctl` y runtime ONNX; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Holgura de engranajes | Terreno | Licencia | Estado |
|---|---|---|---|---|---|---|
| `witcheer/microduck-walk-rough` v2 | Política de marcha (ONNX) | 11.000 iteraciones, 4.096 entornos, RTX 5090 | Sí (+-1 grado) | Rugoso ordenado por dificultad | Apache-2.0 | Simulación, no probado en hardware real |
| `witcheer/microduck-walk-rough` v1 | Política de marcha (ONNX) | 8.000 iteraciones, 4.096 entornos, RTX 5090 | No | Rugoso, rejilla aleatoria 5x5 | Apache-2.0 | Simulación |
| Políticas del fabricante (`pollen-robotics/microduck_rl`) | Políticas de referencia | No disponible | No disponible | No disponible | Apache-2.0 | No disponible |

No se dispone de datos de rendimiento de las políticas del fabricante en la información proporcionada, por lo que la comparación cuantitativa se limita a las dos versiones del propio autor.

## Limitaciones y advertencias

- Solo simulación: el autor afirma explícitamente que no se ha probado en un Microduck real.
- Muestras pequeñas: 9 tomas por política en la fila más difícil; el autor califica la evidencia de limitada.
- Confusión de variables: la v2 cambia dos cosas a la vez (holgura de engranajes y filas de terreno ordenadas), por lo que la mejora no puede atribuirse solo a la holgura.
- Sin probar: empujes en terreno rugoso, cargas útiles y perturbaciones externas.
- Regresión en el simulador original: sin holgura, en la fila más difícil, la v2 mantuvo 2 de 3 tomas frente a 3 de 3 de la v1 (una caída en escaleras a los 2,5 s).
- Reproducibilidad parcial: exportada desde un checkout con cambios sin confirmar del repositorio `microduck_rl`.
- Sin capacidades de lenguaje, visión ni razonamiento; no debe evaluarse con métricas de LLM.
- Licencia Apache-2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y aviso de cambios; no se documentan restricciones adicionales.
- Riesgo de alucinación no aplica; el riesgo relevante es de transferencia sim-to-real y de caída en hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/witcheer/microduck-walk-rough
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl
- Dataset con registros y curvas: https://huggingface.co/datasets/witcheer/microduck-skill-tree (carpeta `level-04b-walk-rough-gear-play`)
- Otras políticas de la escalera de habilidades: https://huggingface.co/witcheer
