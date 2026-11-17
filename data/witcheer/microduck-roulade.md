# witcheer/microduck-roulade

## Resumen

Microduck-roulade es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto Microduck, desarrollado por Pollen Robotics. El modelo, publicado por el usuario witcheer bajo licencia Apache-2.0, implementa una voltereta hacia delante (forward roll) desde posición de pie, ejecutada como episodio de 2,0 segundos que devuelve al robot a una postura estable. Se distribuye en formato ONNX con la normalización de observaciones integrada en el propio grafo, de modo que la política consume observaciones en crudo.

El interés técnico reside en su carácter *sim-first*: la política se entrenó exclusivamente en simulación con mjlab sobre MuJoCo Warp, con 10.000 iteraciones y 4.096 entornos paralelos en una única RTX 5090 durante 173 minutos. El autor declara explícitamente que no se ha probado en hardware real, lo que la convierte en un artefacto de investigación reproducible más que en un componente listo para producción. Forma parte de un árbol de habilidades por niveles (del 1 al 6) para el mismo robot.

La relevancia actual es doble: por un lado, demuestra un flujo completo de entrenamiento RL → exportación ONNX → despliegue en robot mediante el comando `robotctl`; por otro, documenta con métricas concretas (vector de gravedad en marco del cuerpo, altura del tronco) el comportamiento de la política en simulación, incluyendo la comparación con el control de la iteración 0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; no se detalla la topología de red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política episódica de 2,0 s a 50 Hz; 61-D de observación, 14 acciones) |
| Tipos de cuantización | no disponible (se distribuye ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

No se especifica la topología interna de la red neuronal en la información disponible. Lo que sí se documenta es el pipeline: la política se entrena con mjlab sobre MuJoCo Warp en la tarea `Mjlab-Roulade-Flat-MicroDuck`, del repositorio `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`). La configuración es de 10.000 iteraciones con 4.096 entornos paralelos, completadas en 173 minutos (1,04 s por iteración) en una RTX 5090. La política es episódica: dura 2,0 s a 50 Hz, ejecuta la voltereta y vuelve a una pose de pie; mantener pulsado el botón encadena otro episodio.

Un detalle relevante para el despliegue es que el normalizador de observaciones está embebido dentro de `policy.onnx`, por lo que la política acepta observaciones sin preprocesar. El autor reporta que la recompensa media se estabilizó en torno a la iteración 2.000 (35,0) y solo subió a 36,4 en la iteración 10.000, lo que sugiere que un entrenamiento de 3.000 iteraciones habría producido una política equivalente. Las pruebas de validación se hicieron con `mjlab play` (1 entorno, aparición de pie, episodio de 12 s), midiendo el vector de gravedad en marco del cuerpo y la altura del tronco en lugar de evaluar el vídeo.

## Capacidades

- Ejecución de una voltereta hacia delante completa desde posición de pie, con retorno autónomo a postura erguida.
- Control de las 14 articulaciones del Microduck a 50 Hz a partir de observaciones de 61 dimensiones.
- Ejecución episódica determinista de 2,0 s con encadenamiento de episodios al mantener pulsado el botón.
- Consumo de observaciones en crudo gracias al normalizador integrado en el grafo ONNX.
- Integración con el daemon del robot mediante el manifiesto de políticas (esquema 2) y el comando `robotctl`.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio: es una política motora, no un modelo de lenguaje.

## Casos de uso

- Demostración de voltereta en robot Microduck: despliegue directo con `robotctl policy add roulade witcheer/microduck-roulade` seguido de `robotctl robot do roulade`, útil para exhibiciones y validación del stack de control.
- Reproducción de experimentos de RL en robótica: el par repositorio/commit y la configuración de entrenamiento permiten replicar el resultado en mjlab/MuJoCo Warp y comparar curvas de recompensa.
- Base para transferencia sim-a-real: sirve como punto de partida para estudiar la brecha entre simulación y hardware real en un cuadrúpedo de bajo coste, midiendo altura del tronco y orientación en el robot físico.
- Construcción de un árbol de habilidades: encadenado con las políticas de niveles 1 a 5 (caminar, levantarse, sentarse, terreno irregular, caminar con recuperación) para secuencias de comportamiento más largas.
- Docencia y prototipado en cursos de RL: ejemplo compacto y reproducible de un pipeline completo entrenamiento → exportación ONNX → despliegue en robot, con métricas de validación explícitas.
- Pruebas de integración del daemon `robotctl`: validación del esquema 2 de manifiestos de políticas y del flujo de instalación de políticas desde Hugging Face en un robot real o simulado.

## Benchmarks y rendimiento

Los únicos datos publicados son de validación en simulación, no benchmarks estandarizados de ML.

| Métrica | Resultado |
|---|---|
| Tareas de prueba completadas (mjlab `play`, 1 entorno, 12 s) | 3 de 3 |
| Altura del tronco a 0 s (de pie) | 115 mm |
| Altura del tronco a 0,3 s (cabeza en el suelo) | no disponible |
| Altura del tronco a 0,6 s (invertido) | 147 mm |
| Altura del tronco a 0,8 s (sobre la espalda) | 42 mm |
| Altura del tronco a 1,0 s (de pie) | no disponible |
| Altura del tronco desde 1,2 s hasta el final | 115 mm, mantenida |
| Recompensa media, iteración 2.000 | 35,0 |
| Recompensa media, iteración 10.000 | 36,4 |
| Control de referencia (iteración 0) | vuelca hacia delante y cae de bruces a 0,8 s |
| Tiempo de entrenamiento | 173 min en una RTX 5090 (1,04 s/iteración) |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otras políticas de voltereta.

## Requisitos de hardware

- Entrenamiento: una única RTX 5090, 173 minutos para 10.000 iteraciones con 4.096 entornos paralelos en mjlab/MuJoCo Warp.
- Inferencia: el tamaño del repositorio es de 0,0 GB (redondeado), lo que indica un modelo muy pequeño; no se publica el número de parámetros ni la VRAM exacta necesaria.
- Al ser una política de 61 entradas y 14 salidas ejecutada a 50 Hz, es razonable esperar que quepa en cualquier GPU consumer e incluso en CPU, aunque no se documentan cifras de latencia ni throughput.
- Despliegue en robot: mediante el daemon de Microduck y el comando `robotctl`; el runtime consume `policy.onnx` directamente.
- Despliegue en simulación: `mjlab play` con MuJoCo Warp.
- No se documentan opciones de servido tipo vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables (otras volteretas para Microduck u otros cuadrúpedos) en la documentación proporcionada. Las políticas hermanas del mismo autor (`witcheer/microduck-*`, niveles 1 a 5) no se detallan en esta ficha.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-roulade | no disponible | no aplica | 3/3 volteretas en simulación | Apache-2.0 | Hugging Face |
| Políticas microduck nivel 1-5 | no disponible | no aplica | no disponible | no disponible | no disponible |
| Otras políticas de voltereta | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No probado en un Microduck real: todo el comportamiento descrito procede de simulación; los servos y el suelo reales pueden alterar el resultado de forma impredecible.
- Solo se registraron volteretas iniciadas desde posición de pie; no se probaron las apariciones a mitad de voltereta que define la tarea.
- Entrenamiento limitado a terreno plano (`Flat`); no hay evidencia de robustez ante irregularidades, pendientes o fricción variable.
- La recompensa se estanca a partir de la iteración 2.000, lo que sugiere un margen de mejora limitado con la configuración actual.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero sí un riesgo claro de sobreajuste a las condiciones exactas de simulación (sim-to-real gap).
- Licencia Apache-2.0, permisiva para uso comercial; debe conservarse el aviso de licencia y atribución correspondiente.
- El tamaño real del artefacto, el número de parámetros y los requisitos de VRAM no están publicados, lo que dificulta planificar el despliegue.
- El modelo depende del ecosistema microduck (`robotctl`, manifiesto de políticas esquema 2); no es reutilizable directamente en otras plataformas robóticas sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/witcheer/microduck-roulade
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Clip de comparación (iteración 0 vs 10.000, media velocidad): https://x.com/witcheer/status/2102076057411031472
