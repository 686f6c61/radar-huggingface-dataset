# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924

## Resumen

`tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924` es un checkpoint de política robótica entrenado por el usuario tarzanagh para una tarea bimanual concreta: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 debe sujetar una mochila con la mano izquierda y depositar una taza en su interior con la derecha. El modelo combina una política de la familia pi-0.5 con entrada táctil (fuerzas en las puntas de los dedos), y se ha entrenado por imitación a partir de 31 episodios de teleoperación con guante Meta y seguimiento de muñeca Vive, sin exoesqueleto.

El checkpoint tiene 3.616.769.814 parámetros (unos 3,62 mil millones) y un repositorio de 14,5 GB en formato safetensors. La tarea se define sobre un espacio de estado/acción de 38 dimensiones de posiciones articulares (7 de brazo + 12 de mano por lado) más 30 dimensiones de fuerza táctil de tres ejes en cinco dedos por mano, lo que da una observación de 68 dimensiones. La percepción procede de cuatro cámaras RGB a 640x360 y 30 fps.

Se trata de un artefacto de investigación más que de un modelo listo para producción: no hay demostraciones en hardware, las métricas publicadas miden error de seguimiento en bucle abierto sobre 4 episodios reservados y el autor indica explícitamente que la entrada táctil no aportó una diferencia consistente en esta tarea. Su interés actual es como punto de comparación reproducible frente a otras familias de políticas (GR00T, ACT, Diffusion Policy, T-Rex) en un mismo conjunto de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de la familia pi-0.5, aparentemente visión-lenguaje-acción; la model card no detalla la arquitectura interna) |
| Parámetros totales | 3.616.769.814 (3,62 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible (no se documentan capacidades lingüísticas; es una política de control) |
| Licencia | Gemma (license:gemma) |
| Formato de pesos | safetensors |
| Entradas de percepción | 4 cámaras RGB, 640x360 a 30 fps |
| Espacio de estado/acción | 38-D de posiciones articulares ([L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]) + 30-D de fuerza táctil (5 dedos x 3 ejes por mano) = 68-D de entrada |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los identificadores disponibles permiten situarlo como un checkpoint de la familia pi-0.5 con entrada táctil añadida ("pi-0.5 + tactile"), y la licencia Gemma es coherente con un backbone derivado de Gemma, aunque este extremo no se confirma en la documentación publicada. El comportamiento declarado es el de una política que predice trozos de acción (action chunks): el modelo recibe una observación real cada 16 pasos y emite un bloque de acciones del que se conservan las 16 primeras.

En cuanto a entrenamiento, se usaron 31 episodios de teleoperación repartidos en 27 de entrenamiento y 4 reservados (se retuvo cada décimo episodio). La teleoperación se realizó con guante Meta, sin exoesqueleto, con seguimiento de muñeca mediante Vive. El entrenamiento se detuvo a los 10.000 pasos con semilla 1000. No se documentan en la información disponible ni el número de tokens, ni la composición del dataset más allá de los episodios, ni si hubo fases de RLHF o DPO. El modelo es multimodal en el sentido robótico (cuatro flujos de cámara más estado propioceptivo y táctil), no en el sentido de diálogo.

Como innovación reseñable, la inclusión de fuerza táctil de tres ejes en las puntas de los dedos como parte del vector de estado es el elemento diferencial respecto a los checkpoints sin táctil de la misma tarea. El propio autor reporta que ese aporte no produjo una mejora consistente.

## Capacidades

- Ejecución de una tarea bimanual específica: sostener una mochila abierta con la mano izquierda e introducir una taza con la derecha.
- Control coordinado de dos brazos de 7 grados de libertad y dos manos de 12 grados de libertad (38 dimensiones de acción en total).
- Predicción de trozos de acción de 16 pasos con reobservación periódica (política de tipo action chunking).
- Consumo de cuatro cámaras RGB simultáneas a 640x360 y 30 fps.
- Integración de señal táctil: 30 dimensiones de fuerza de 3 ejes en 5 dedos por mano, concatenadas al estado.
- Política entrenada por imitación a partir de demostraciones de teleoperación (guante Meta, seguimiento Vive).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni generación de texto: es un modelo de control motor, no un modelo de lenguaje conversacional.
- Capacidades multilingües: no aplicable / no disponibles.
- No se documentan modos especiales (thinking mode, audio, visión generalista fuera del control).

## Casos de uso

- Reproducción de referencia en investigación bimanual: sirve como línea base pi-0.5 para la tarea "mug in backpack" y permite comparar contra los checkpoints GR00T, ACT, Diffusion Policy y T-Rex del mismo autor sobre un protocolo idéntico.
- Ablación del aporte táctil: al existir el checkpoint gemelo sin táctil (`..._pi05260924`) y variantes con y sin táctil para GR00T y ACT, este modelo permite medir de forma controlada si la fuerza en los dedos mejora el seguimiento de trayectoria.
- Reentrenamiento o ajuste fino sobre nueva tarea de manipulación diestra: los 27 episodios de entrenamiento y el espacio de acción de 38 dimensiones sirven de plantilla para tareas de recogida y colocación con manos XHand1.
- Recolección de datos con teleoperación: el pipeline documentado (guante Meta, Vive, 4 cámaras a 30 fps) es reutilizable para generar nuevos conjuntos de episodios con la misma estructura de estado.
- Estudio de acción troceada (action chunking): el esquema de observar cada 16 pasos y ejecutar el primer bloque de 16 acciones es un banco de pruebas directo para analizar el compromiso entre frecuencia de inferencia y estabilidad de la trayectoria.
- Evaluación comparativa de familias de políticas en robótica: el conjunto de checkpoints publicados permite montar un benchmark homogéneo de imitación bimanual con métricas de error en bucle abierto.
- Docencia y divulgación técnica: como ejemplo de política VLA con entrada táctil y espacio de estado explícitamente documentado (68-D), es útil para explicar la construcción de observaciones en robótica de imitación.

## Benchmarks y rendimiento

El autor publica un único conjunto de métricas: error en bucle abierto sobre los 4 episodios reservados, definido como la media de |predicción − acción registrada| en radianes, con error estándar de la media.

| Métrica (rad, ± SEM, n=4) | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (pi-0.5 + táctil) | 0,0323 ± 0,0025 | 0,0230 ± 0,0028 | 0,0460 ± 0,0028 | 0,0362 ± 0,0036 |
| Línea base "hold-first-frame" | 0,2132 | 0,3383 | 0,2756 | 0,1755 |

Notas del autor sobre estos datos:

- La comparación con "hold-first-frame" establece una referencia trivial; el modelo mejora entre 5 y 15 veces ese valor según el grupo articular.
- El autor advierte que esta métrica mide seguimiento de trayectoria, no éxito de tarea, y que ninguna prueba se ejecutó sobre hardware real.
- En esta tarea, GR00T obtuvo el error más bajo de las familias ya terminadas, entre 3 y 4 veces por debajo de pi-0.5 y ACT; la entrada táctil no marcó una diferencia consistente.
- Los entrenamientos de Diffusion Policy y T-Rex para esta tarea seguían en curso en el momento de publicar la ficha.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) porque no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 7,2 GB solo de pesos (3,62 B x 2 bytes), más el codificador visual, las activaciones y los búferes de cuatro cámaras a 640x360. En la práctica se debe presupuestar del orden de 10 a 12 GB, aunque no hay mediciones publicadas (estimación, no dato confirmado).
- VRAM estimada en INT8: en torno a 3,6 GB de pesos; en INT4, en torno a 1,8-2 GB. No se publican checkpoints cuantizados, por lo que estos valores son estimaciones teóricas y requerirían cuantización propia.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberían alojar el modelo en BF16 con margen; A100 y H100 quedan sobredimensionadas para el cómputo, aunque pueden ser necesarias si se entrena de nuevo.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 12 GB o más en FP16, y en tarjetas de 8 GB solo con cuantización agresiva; no verificado por el autor.
- Opciones de despliegue: no documentadas. El repositorio no incluye instrucciones de inferencia, configuración de servidor ni integración con frameworks concretos (vLLM, llama.cpp, Ollama, TGI no son aplicables a una política de control).
- Latencia y throughput: no medidos. Como dato derivado del diseño, si el robot opera a los 30 fps de las cámaras y solo se infiere una vez cada 16 pasos, la frecuencia de inferencia efectiva sería de aproximadamente 1,875 Hz, con ejecución del trozo de acciones entre medias. Es una deducción a partir de la model card, no una medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi-0.5 + táctil) | 3,62 B | no disponible | Error en bucle abierto 0,023-0,046 rad según grupo articular | Gemma | Checkpoint público en HuggingFace |
| pi-0.5 sin táctil (`..._pi05260924`) | no disponible | no disponible | Entre 3 y 4 veces peor que GR00T según el autor | no disponible en la información | Checkpoint público en HuggingFace |
| GR00T 3B (`..._gr00t3b260924` y variante táctil) | no disponible (el identificador sugiere ~3 B; sin confirmar) | no disponible | El error más bajo de las familias terminadas en esta tarea | no disponible en la información | Checkpoint público en HuggingFace |
| ACT (`..._act260924` y variante táctil) | no disponible | no disponible | Peor que GR00T, en el mismo orden que pi-0.5 | no disponible en la información | Checkpoint público en HuggingFace |
| Diffusion Policy y T-Rex | no disponible | no disponible | Entrenamiento en curso al publicar la ficha | no disponible en la información | Sin resultados aún |

La comparación cuantitativa directa entre familias no es posible con los datos publicados: solo se ofrece la tabla de error de este checkpoint y una afirmación cualitativa sobre el orden relativo de GR00T, pi-0.5 y ACT.

## Limitaciones y advertencias

- Sobreajuste a una tarea única: el modelo está entrenado para una secuencia concreta (mochila + taza) sobre un hardware concreto (Vega-1 con dos XHand1); no es un modelo generalista de manipulación.
- Dataset muy reducido: 31 episodios en total, 27 de entrenamiento y 4 de validación. La varianza entre semillas y la robustez ante cambios de iluminación, posición u objetos no están caracterizadas.
- Sin validación en hardware: el autor indica explícitamente que nada se ejecutó sobre el robot físico; todas las cifras provienen de error en bucle abierto.
- Métrica limitada: el error de seguimiento de trayectoria no equivale a tasa de éxito de la tarea. Un error bajo en radianes puede convivir con fallos de agarre o de inserción.
- La entrada táctil no aportó mejoras consistentes en esta tarea según el propio autor, por lo que no debe asumirse que la señal de fuerza de 30 dimensiones sea la causa del rendimiento observado.
- Riesgo de alucinación: no aplicable en el sentido lingüístico, pero sí existe el riesgo análogo de generar acciones plausibles y no válidas fuera de la distribución de demostraciones, con consecuencias físicas.
- Idiomas y capacidades de texto: no disponibles / no aplicables.
- Licencia Gemma: impone condiciones de uso (incluidas cláusulas de uso aceptable y obligaciones de atribución) que deben revisarse antes de cualquier uso comercial. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentación de inferencia; el soporte y el mantenimiento no están garantizados.
- Fechas de creación y actualización registradas en septiembre de 2026, con el repositorio sin modificaciones posteriores.
- Los resultados de búsqueda web devueltos no contenían información relevante sobre el modelo (contenido no relacionado), por lo que no aportan datos verificables adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
- Checkpoint GR00T 3B de la misma tarea: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
- Checkpoint GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
- Checkpoint pi-0.5 sin táctil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
- Checkpoint ACT: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
- Checkpoint ACT con táctil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
