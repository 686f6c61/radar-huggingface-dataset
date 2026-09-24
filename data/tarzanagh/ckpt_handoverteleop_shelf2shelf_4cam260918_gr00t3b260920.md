# tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920

## Resumen

Este repositorio contiene un checkpoint de política visuomotora para robótica basado en la familia GR00T-N1.7-3B (etiqueta `Gr00tN1d7`), con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones). El modelo ha sido ajustado por el usuario `tarzanagh` para una tarea concreta de manipulación bimanual diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 recoge una caja de pañuelos de un nivel de estantería, se la pasa de una mano a otra y la coloca en otro nivel. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 12,6 GB.

Se trata de un modelo de imitación (imitation learning) entrenado a partir de teleoperación con guante háptico (meta-glove, sin exoesqueleto) y seguimiento de muñeca con Vive. El conjunto de datos consta de 54 episodios, de los cuales 48 se usaron para entrenamiento y 6 quedaron reservados (uno de cada diez). Las observaciones provienen de 4 cámaras RGB a 640x360 y 30 fps, y el espacio de estado/acción es un vector de 38 dimensiones compuesto por posiciones articulares `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]`.

Su relevancia es doble: por un lado, sirve como referencia reproducible de un pipeline de imitación bimanual sobre hardware específico; por otro, forma parte de un barrido comparativo de 24 ejecuciones (cuatro familias de políticas por tres tareas) en el que, según la model card, GR00T obtuvo el error más bajo en todas las tareas evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; la etiqueta `Gr00tN1d7` indica pertenencia a la familia GR00T N1.7 de modelos visuomotores para robótica |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; la política opera por chunks de acción con reobservación real cada 16 pasos |
| Tipos de cuantizacion | no disponibles (el repositorio distribuye únicamente safetensors) |
| Idiomas soportados | no disponible (modelo visuomotor, sin interfaz de lenguaje natural) |
| Licencia | other (consultar los términos exactos en el repositorio) |
| Formato de pesos | safetensors |
| Espacio de estado/accion | 38-D: `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` posiciones articulares |
| Entradas de vision | 4 camaras RGB, 640x360 a 30 fps |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Tamano del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta de familia `Gr00tN1d7`, que sitúa el modelo dentro de la línea GR00T N1.7. Lo que sí se documenta es la interfaz de política: el modelo recibe la observación real cada 16 pasos, predice un chunk de acciones y se conservan las 16 primeras acciones del chunk antes de volver a observar. Este esquema de control por chunks es típico de las políticas de imitación modernas y condiciona la frecuencia efectiva de razonamiento del modelo frente a la frecuencia del bucle de control.

El entrenamiento se realizó durante 10.000 pasos con semilla 1000, sobre 54 episodios teleoperados (48 de entrenamiento y 6 reservados, seleccionados tomando uno de cada diez). La recogida de datos se hizo con teleoperación mediante guante (meta-glove, sin exoesqueleto) y seguimiento de muñeca Vive. La model card indica explícitamente que la evaluación publicada mide seguimiento de trayectoria en bucle abierto, no éxito de tarea, y que no se ejecutó nada en hardware real. No se documentan en la información disponible detalles sobre RLHF, DPO ni sobre la composición exacta del dataset más allá del número de episodios y la configuración de cámaras.

## Capacidades

- Generación de acciones motoras bimanuales de 38 dimensiones para brazos y manos (7 grados de libertad por brazo y 12 por mano).
- Manipulación diestra: la tarea entrenada implica agarre, transferencia mano a mano y colocación precisa de un objeto en una estantería.
- Política condicionada por visión: consume 4 flujos RGB simultáneos a 640x360 y 30 fps.
- Predicción por chunks de acción con horizonte de 16 pasos y reobservación real cada 16 pasos.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensa explícita ni simulación.
- Capacidad de servir como punto de partida para ajuste fino en tareas bimanuales similares sobre el mismo hardware.
- No dispone de tool calling, function calling, agentes, capacidades multilingües ni modos de razonamiento textual: no es un modelo de lenguaje.

## Casos de uso

- Replicación de experimentos de imitación bimanual: el checkpoint permite reproducir exactamente la configuración descrita (54 episodios, semilla 1000, 10.000 pasos) y comparar contra las otras 23 ejecuciones del mismo barrido.
- Punto de partida para ajuste fino en tareas de estantería: al estar entrenado en transferencia mano a mano de un objeto entre niveles, es un candidato razonable para tareas análogas de pick-and-place bimanual sobre DexMate Vega-1 y manos XHand1.
- Evaluación de esquemas de control por chunks: sirve para estudiar el compromiso entre horizonte de predicción (16 pasos) y frecuencia de reobservación en políticas visuomotoras.
- Estudio comparativo entre familias de políticas: junto con los checkpoints ACT, Diffusion Policy y pi0.5 del mismo autor, permite analizar diferencias de error de seguimiento entre arquitecturas sobre idéntico dataset.
- Análisis del efecto de la entrada táctil: el modelo dispone de una variante con táctil (`gr00t3btactile260920`), lo que permite reproducir el hallazgo de que la señal táctil no aportó mejoras más allá del ruido en las cuatro familias evaluadas.
- Generación de trayectorias de referencia para simulación: las predicciones del modelo pueden usarse como acciones de referencia en un simulador antes de comprometer hardware, dado que la propia model card advierte de que no se ha validado en robot físico.
- Docencia y formación en robótica de manipulación: el par (dataset pequeño, checkpoint público, métrica de error open-loop) lo hace útil como ejemplo didáctico de pipeline completo de imitación.

## Benchmarks y rendimiento

La model card publica el error open-loop medio (media de |predicción − acción registrada|, en radianes, ± error estándar de la media, n=6 episodios reservados) frente a una línea base trivial que repite el primer frame (`hold-first-frame`):

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (GR00T-N1.7-3B) | 0,0230 ± 0,0004 | 0,0148 ± 0,0009 | 0,0223 ± 0,0009 | 0,0117 ± 0,0002 |
| hold-first-frame (referencia) | 0,3538 | 0,2351 | 0,2926 | 0,2373 |

Advertencias sobre estas cifras, tal como las formula el autor: miden seguimiento de trayectoria, no éxito de tarea, y ninguna de ellas se obtuvo ejecutando el modelo en hardware real. Además, la model card afirma que, a lo largo de cuatro familias de políticas y tres tareas, la entrada táctil no marcó diferencia más allá del ruido y que GR00T obtuvo el error más bajo en todas las tareas. No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 3,14 mil millones de parámetros): ~12,6 GB en FP32, ~6,3 GB en BF16/FP16, ~3,2 GB en cuantización de 8 bits y ~1,6 GB en 4 bits. Son estimaciones de peso de parámetros y no incluyen activaciones, buffers de imagen ni el resto del pipeline de control.
- El repositorio ocupa 12,6 GB, coherente con pesos en precisión completa (FP32).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP32 o BF16 con margen amplio. Para cuantizaciones de 8 y 4 bits, una RTX 3090 o RTX 4090 es suficiente.
- Cabe en GPU de consumo: sí, en cualquiera con 8 GB o más de VRAM si se cuantiza; en FP32 conviene disponer de al menos 16-24 GB.
- Opciones de despliegue: no disponibles en la información proporcionada. El checkpoint se entrega en safetensors y requiere cargarlo con PyTorch y construir el bucle de inferencia (4 cámaras RGB, vector de estado de 38 dimensiones, chunk de 16 acciones). No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, que además no son herramientas orientadas a políticas visuomotoras.
- Latencia y throughput: no disponibles como medición. Como referencia derivada de los datos de la model card, si el bucle de control se ejecuta a 30 Hz (la frecuencia de las cámaras), un chunk de 16 pasos equivale a aproximadamente 0,53 s entre reobservaciones reales; esta cifra es una deducción, no un dato publicado.

## Comparativa con modelos similares

La model card lista 24 ejecuciones de la misma tarea, agrupadas en cuatro familias. La comparación cuantitativa solo está publicada para este modelo y para la línea base trivial.

| Modelo | Familia | Parametros | Entrada tactil | Error open-loop publicado |
|---|---|---|---|---|
| Este modelo (`gr00t3b260920`) | GR00T N1.7-3B | 3,14 mil millones | No | Sí (0,0117-0,0230 rad) |
| `gr00t3btactile260920` | GR00T N1.7-3B | no disponible | Sí | no disponible |
| `act260920` / `acttactile260920` | ACT | no disponible | No / Sí | no disponible |
| `dp260920` / `dptactile260920` | Diffusion Policy | no disponible | No / Sí | no disponible |
| `pi05260920` / `pi05tactile260920` | pi0.5 | no disponible | No / Sí | no disponible |

Según la model card, GR00T obtuvo el error más bajo en las tres tareas evaluadas y la entrada táctil no aportó mejora significativa en ninguna de las cuatro familias. No se dispone de las cifras concretas de los modelos comparados.

## Limitaciones y advertencias

- Evaluación exclusivamente en bucle abierto: las métricas miden seguimiento de trayectoria, no éxito de la tarea de transferencia y colocación de la caja.
- El modelo nunca se ha ejecutado en hardware real, tal como advierte explícitamente la model card. No hay evidencia publicada de comportamiento en robot físico.
- Dataset muy reducido: 54 episodios, con solo 6 reservados para evaluación, lo que limita la significación estadística de las conclusiones.
- Riesgo de sobreajuste a la configuración concreta de cámaras (4 RGB a 640x360 y 30 fps), al montaje de la estantería y a la iluminación del entorno de recogida de datos.
- Entrenamiento de solo 10.000 pasos con una única semilla (1000): no se documenta variabilidad entre semillas ni robustez a cambios de seed.
- La política asume exactamente el espacio de acción de 38 dimensiones del DexMate Vega-1 con manos XHand1; no es trasladable directamente a otro robot sin reentrenamiento.
- Sin capacidades lingüísticas ni de tool calling: no puede integrarse en flujos de agente conversacional ni interpretar instrucciones en lenguaje natural.
- Licencia `other`: no se especifican en la información disponible los términos de uso comercial, por lo que es imprescindible revisar el texto de licencia del repositorio antes de cualquier despliegue productivo.
- Sesgos conocidos: no disponibles. En robótica de imitación, el sesgo procede habitualmente de la distribución de demostraciones, pero no hay análisis publicado en este caso.
- Idiomas soportados: no aplica, al no existir interfaz de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920
- Variante con entrada táctil (misma familia): https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920
- Ejecución con ACT: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_act260920
- Ejecución con ACT + táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_acttactile260920
- Ejecución con Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920
- Ejecución con Diffusion Policy + táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dptactile260920
- Ejecución con pi0.5: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05260920
- Ejecución con pi0.5 + táctil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05tactile260920
- Paper, blog o repositorio asociados: no disponibles en la información proporcionada.
