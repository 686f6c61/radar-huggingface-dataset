# tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_acttactile260920

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenada por imitación para una tarea bimanual de manipulación diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 retira una caja de pañuelos de un nivel de estantería, se la pasa de una mano a otra y la deposita en otro nivel. La política combina la arquitectura ACT (Action Chunking Transformer) con entrada táctil, de ahí el sufijo "acttactile" del identificador, y fue entrenada sobre 54 episodios de teleoperación con guante Meta y seguimiento de muñeca Vive, sin exoesqueleto.

El modelo tiene 51.764.902 parámetros (unos 51,8 M) y ocupa 0,2 GB en el repositorio. No es un modelo de lenguaje: es una política visomotora que consume 4 cámaras RGB a 640x360 y 30 fps junto con un vector de estado de 68 dimensiones (38-D de posiciones articulares más 30-D de fuerzas en las yemas) y produce acciones articulares de 38 dimensiones. Se entrenó durante 10.000 pasos con semilla 1000.

Su relevancia es acotada pero clara: forma parte de una familia de 24 ejecuciones del mismo experimento que compara cuatro familias de políticas (ACT, Diffusion Policy, GR00T y pi0) con y sin entrada táctil, y publica el error de seguimiento en bucle abierto sobre 6 episodios retenidos. El autor informa de que la entrada táctil no aportó diferencias más allá del ruido y que GR00T obtuvo el error más bajo en todas las tareas evaluadas. El checkpoint no se ha ejecutado sobre hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con entrada táctil; transformer con codificador de visión, CVAE y decodificador de acciones |
| Parámetros totales | 51.764.902 (≈ 51,8 M), dato real de los safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; horizonte de predicción (chunk) de 16 acciones por inferencia, con reobservación real cada 16 pasos |
| Tipos de cuantización | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible; no es un modelo de lenguaje, no procesa texto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | robotics |
| Tarea | traspaso bimanual y colocación de una caja de pañuelos entre dos niveles de estantería |
| Plataforma robótica | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Entrada | 4 cámaras RGB a 640x360 y 30 fps + estado de 68-D (38-D articulares + 30-D de fuerza táctil) |
| Salida | acciones de 38-D `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` en posiciones articulares |
| Datos de entrenamiento | 54 episodios (48 de entrenamiento, 6 retenidos, uno de cada 10) |
| Pasos de entrenamiento | 10.000, semilla 1000 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer de acción por chunks con componente CVAE que aprende a predecir secuencias cortas de acciones en lugar de acciones individuales, lo que reduce el error de composición y estabiliza el control. El modelo incorpora además una vía táctil: las fuerzas de 3 ejes de las 5 yemas de cada mano (30-D) se concatenan al estado articular (38-D), resultando en una observación de 68 dimensiones. La percepción visual llega por 4 cámaras RGB a 640x360 y 30 fps.

El entrenamiento se realizó por imitación supervisada sobre 54 episodios teleoperados con guante Meta (sin exoesqueleto) y seguimiento de muñeca con Vive, con 48 episodios para entrenamiento y 6 retenidos (uno de cada 10). Se ejecutaron 10.000 pasos con semilla 1000. No se documenta ningún uso de RLHF, DPO ni ajuste por refuerzo, lo cual es coherente con un pipeline de imitation learning puro.

El detalle metodológico más relevante para interpretar los resultados es el régimen de evaluación: la política observa el estado real cada 16 pasos, predice un chunk y solo se conservan las primeras 16 acciones. Esto mide seguimiento de trayectoria, no éxito de tarea, y el propio autor indica que no se ejecutó nada sobre hardware. En el barrido de cuatro familias por tres tareas, la entrada táctil no produjo diferencias más allá del ruido y GR00T registró el error más bajo en todas las tareas.

## Capacidades

- Generación de acciones de control bimanual: produce comandos conjuntos de 38-D que cubren ambos brazos (7 grados de libertad cada uno) y ambas manos (12 grados de libertad cada una).
- Manipulación diestra: la tarea objetivo es retirar una caja de pañuelos de una estantería, pasarla de una mano a la otra y colocarla en otro nivel.
- Percepción visual multi-cámara: consume simultáneamente 4 flujos RGB a 640x360 y 30 fps.
- Fusión de señal táctil: integra 30 valores de fuerza (5 dedos x 3 ejes por mano) en el vector de estado, aunque el autor reporta que su aportación medida es indistinguible del ruido.
- Predicción por chunks: emite bloques de 16 acciones, lo que permite control a mayor frecuencia efectiva que una política de acción única.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni expone interfaz de agentes.
- No soporta razonamiento multi-paso simbólico, código, matemáticas ni visión generalista fuera del dominio de la tarea.
- Capacidades multilingües: no aplica, el modelo no procesa ni genera texto.
- Capacidad especial: es un checkpoint de investigación comparable dentro de un barrido de 24 ejecuciones (ACT, Diffusion Policy, GR00T y pi0, con y sin táctil) sobre la misma tarea.

## Casos de uso

- Manipulación bimanual con traspaso de objetos: es exactamente la tarea entrenada, un robot que coge un objeto de un estante, lo transfiere entre manos y lo recoloca en otra altura, útil como demostrador de coordinación bimanual en laboratorio.
- Punto de partida para ajuste fino con datos propios: al ser un checkpoint ACT de 51,8 M parámetros con licencia Apache 2.0, se puede reentrenar con episodios teleoperados propios para tareas de recogida y colocación en estanterías similares.
- Estudio controlado del valor de la señal táctil: sirve como una de las dos condiciones (con táctil frente a sin táctil) del experimento del autor para medir si la fuerza en las yemas mejora el seguimiento de trayectoria en manipulación diestra.
- Evaluación en bucle abierto de políticas: el protocolo de error medio absoluto sobre 6 episodios retenidos permite comparar arquitecturas sin acceso al robot, útil en pipelines de selección de checkpoints.
- Reproducción de experimentos de teleoperación: la configuración con guante Meta y seguimiento Vive sin exoesqueleto es replicable con hardware de consumo, lo que facilita montar recogidas de datos equivalentes.
- Base para comparativas entre familias de políticas: el mismo autor publica las variantes ACT, Diffusion Policy, GR00T y pi0 de esta tarea, de modo que este checkpoint funciona como referencia ACT+táctil en una comparación cruzada.
- Prototipado de control bimanual a alta frecuencia en simulación: con 16 acciones por chunk y menos de 208 MB en fp32, se puede iterar rápido en un simulador antes de tocar hardware.

## Benchmarks y rendimiento

Error en bucle abierto sobre los 6 episodios retenidos, expresado como media de |predicción − acción registrada| en radianes (± error estándar de la media, n=6):

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (ACT + táctil) | 0,0635 ± 0,0051 | 0,0329 ± 0,0012 | 0,0580 ± 0,0059 | 0,0333 ± 0,0014 |
| Línea base "hold-first-frame" | 0,3538 | 0,2351 | 0,2926 | 0,2373 |

Observaciones declaradas por el autor: la política ve la observación real cada 16 pasos y conserva las primeras 16 acciones del chunk; esta métrica mide seguimiento de trayectoria y no éxito de la tarea; no se ejecutó nada sobre hardware real. En el barrido de cuatro familias por tres tareas, la entrada táctil no produjo diferencias más allá del ruido y GR00T obtuvo el error más bajo en todas las tareas. No se publican tasas de éxito ni métricas en bucle cerrado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 207 MB (51.764.902 x 4 bytes); en fp16/bf16, unos 104 MB. Con activaciones, buffers de 4 cámaras a 640x360 y el codificador visual, el consumo total se mantiene holgadamente por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM es suficiente para el modelo. No se requiere A100, H100 ni hardware de gama alta; una NVIDIA GTX 1650, RTX 3060 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en iGPU o ejecución en CPU con latencias mayores, aunque esto no está documentado por el autor.
- Opciones de despliegue: no especificadas en la model card. Se distribuye en safetensors y la arquitectura ACT se implementa habitualmente en PyTorch y en la librería LeRobot de HuggingFace; vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles. El autor no publica medidas de frecuencia de control ni de tiempo de inferencia.
- Almacenamiento: 0,2 GB de repositorio, trivial para cualquier equipo.

## Comparativa con modelos similares

Comparación con las variantes del mismo barrido publicadas por el autor para la misma tarea (traspaso bimanual en estantería con DexMate Vega-1 y XHand1):

| Modelo | Familia | Parámetros | Contexto / chunk | Error en bucle abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `acttactile260920` (este) | ACT + táctil | 51,8 M | chunk de 16 acciones | 0,0635 / 0,0329 / 0,0580 / 0,0333 (L-arm / L-hand / R-arm / R-hand) | Apache 2.0 | pública en HuggingFace |
| `act260920` | ACT sin táctil | no disponible | no disponible | no disponible | Apache 2.0 | pública en HuggingFace |
| `dp260920` / `dptactile260920` | Diffusion Policy, con y sin táctil | no disponible | no disponible | no disponible | Apache 2.0 | pública en HuggingFace |
| `gr00t3b260920` / `gr00t3btactile260920` | GR00T (nombre sugiere ~3 B) | no disponible (el nombre apunta a 3 B, sin confirmar) | no disponible | el más bajo en todas las tareas según la model card, cifras no publicadas | no disponible | pública en HuggingFace |
| `pi05260920` / `pi05tactile260920` | pi0 / pi0.5, con y sin táctil | no disponible | no disponible | no disponible | no disponible | pública en HuggingFace |

No se dispone de cifras de parámetros, contexto ni error para las variantes comparadas más allá de la indicación cualitativa de que GR00T fue la mejor en todas las tareas y de que la señal táctil no alteró los resultados de forma significativa.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo no se ha ejecutado sobre hardware real: no existen tasas de éxito ni validación en bucle cerrado, solo error de seguimiento en bucle abierto.
- El régimen de evaluación es artificial: la política recibe la observación real cada 16 pasos, algo que no ocurre en un despliegue continuo, donde los errores se acumulan.
- Entrenamiento muy reducido: 48 episodios y 10.000 pasos con una única semilla (1000), lo que implica riesgo alto de sobreajuste al escenario, a la iluminación, a la disposición de las cámaras y a la colocación concreta de la caja de pañuelos.
- Específico de un embodiment: solo es válido para un DexMate Vega-1 con dos manos RobotEra XHand1; no transfiere a otras cinemáticas sin reentrenamiento.
- Dependencia fuerte del montaje de percepción: 4 cámaras RGB fijas a 640x360 y 30 fps; cambios de calibración, oclusiones o cámaras distintas degradan la política.
- La entrada táctil no aportó mejora medible: el autor reporta que no hubo diferencia más allá del ruido en cuatro familias y tres tareas, así que no debe justificarse su uso por esta evidencia.
- Rendimiento inferior a GR00T en todas las tareas del barrido, según la propia model card.
- Sesgos conocidos: no evaluados ni documentados. Al tratarse de una política entrenada por imitación sobre demostraciones humanas, heredará los sesgos de la persona que teleoperó y del conjunto de posiciones cubierto.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la generación de acciones plausibles pero incorrectas fuera de la distribución de entrenamiento.
- Limitaciones de idioma y contexto: el modelo no procesa texto ni lenguaje natural, no tiene ventana de contexto lingüística ni capacidades multilingües.
- Licencia: Apache 2.0, permisiva para uso comercial del código y los pesos, pero el uso comercial está limitado de facto por la dependencia del hardware específico y por la ausencia de validación en hardware; conviene revisar las licencias de los conjuntos de datos y de los componentes de terceros no detallados en la model card.
- Sin garantías de producción: 0 descargas y 0 likes, sin mantenimiento documentado, sin métricas de latencia y sin instrucciones de inferencia publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_acttactile260920
- Variante ACT sin táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_act260920
- Variante Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920
- Variante Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dptactile260920
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920
- Variante GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920
- Variante pi0: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05260920
- Variante pi0 con táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05tactile260920
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
