# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924

## Resumen

Este repositorio contiene un checkpoint de política robótica denominado pi-0.5, entrenado para una tarea bimanual de manipulación diestra sobre un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1. La tarea consiste en sostener una mochila abierta con la mano izquierda y depositar una taza en su interior con la derecha. Los datos se recogieron por teleoperación con guante Meta (sin exoesqueleto) y seguimiento de muñeca mediante Vive.

El checkpoint tiene 3.616.769.814 parámetros (unos 3,62 mil millones) en formato safetensors, ocupa 14,5 GB en el repositorio y se distribuye bajo licencia Gemma. Forma parte de una serie de experimentos comparativos del mismo autor sobre esta misma tarea, en la que también se han publicado variantes basadas en GR00T, ACT, Diffusion Policy y T-Rex, con y sin entrada táctil.

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo fundacional generalista, sino un artefacto de investigación y reproducibilidad de una única tarea de manipulación. En el momento de la consulta acumula 0 descargas y 0 likes, y los resultados publicados corresponden a error de seguimiento en bucle abierto, no a éxito de tarea ejecutada en hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el nombre pi-0.5 y la licencia Gemma apuntan a una política derivada de la familia pi-0, sin confirmación en la información disponible) |
| Parámetros totales | 3.616.769.814 (~3,62 mil millones) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible; la política consume la observación real cada 16 pasos y predice un chunk de acciones, del que conserva las 16 primeras |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; 14,5 GB para 3,62 mil millones de parámetros equivale a precisión fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Gemma (campo `license: gemma`) |
| Formato de pesos | safetensors |
| Entradas | 4 cámaras RGB a 640x360 y 30 fps, más estado de articulaciones |
| Salida | vector de acciones de 38 dimensiones en posiciones articulares |
| Dimensionalidad de estado/acción | 38-D: `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 14,5 GB |
| Fecha de creación | 2026-09-24 (según metadatos de HuggingFace) |
| Fecha de actualización | 2026-09-24 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo: no se indican el tipo de backbone, el mecanismo de atención, la presencia de un experto de acciones, ni si se trata de un transformer, un modelo de difusión o una política híbrida. Lo único verificable es el recuento de parámetros (3,62 mil millones) y que el artefacto se publica en safetensors, coherente con una política multimodal con codificador visual y cabeza de acciones. Cualquier afirmación sobre su diseño interno sería una inferencia no respaldada por la información disponible.

En cuanto al entrenamiento, se trata de aprendizaje por imitación sobre 31 episodios de teleoperación, de los cuales 27 se usaron para entrenamiento y 4 se reservaron (uno de cada diez). La recogida se hizo con 4 cámaras RGB a 640x360 y 30 fps, con estado y acción definidos como posiciones articulares de 38 dimensiones. El entrenamiento fue de 10.000 pasos con semilla 1000. No se menciona ningún tipo de RLHF, DPO ni ajuste por preferencias, lo cual es esperable en una política de imitación. El detalle técnico destacable es el esquema de chunking: la política observa el estado real cada 16 pasos, predice un bloque de acciones y ejecuta solo las 16 primeras, un patrón de control por bloques con reobservación periódica.

## Capacidades

- Ejecución de una tarea bimanual específica: sostener una mochila abierta con la mano izquierda e introducir una taza con la derecha.
- Control coordinado de dos brazos de 7 grados de libertad cada uno, más dos manos diestras de 12 grados de libertad cada una (38 dimensiones en total).
- Fusión de cuatro vistas RGB simultáneas a 640x360 y 30 fps para la toma de decisiones.
- Generación de acciones por bloques (action chunking) con reobservación cada 16 pasos, lo que permite control continuo con latencia de política amortiguada.
- Aprendizaje por imitación a partir de demostraciones de teleoperación con guante Meta y seguimiento de muñeca Vive.
- No se documenta soporte de tool calling, function calling, uso como agente, capacidades multilingües ni modos de razonamiento explícito.
- Existe una variante con entrada táctil publicada por el mismo autor (`pi05tactile260924`); según la model card, la entrada táctil no produjo diferencias consistentes en esta tarea.

## Casos de uso

- Investigación en manipulación bimanual diestra: el checkpoint sirve como punto de comparación reproducible frente a otras familias (GR00T, ACT, Diffusion Policy, T-Rex) sobre exactamente la misma tarea, los mismos episodios y la misma métrica de error en bucle abierto.
- Reproducción de experimentos de imitación: al publicarse los 27 episodios de entrenamiento como base y la semilla (1000) y el número de pasos (10.000), permite replicar el entrenamiento y medir la variabilidad entre ejecuciones.
- Prototipado de políticas con múltiples cámaras: su entrada de 4 vistas RGB a 640x360 es útil para estudiar cómo influye la cobertura visual en el error de seguimiento de trayectoria en tareas de colocación.
- Estudio de control por bloques de acciones: el esquema de observación cada 16 pasos y ejecución del primer bloque de acciones es un banco de pruebas para analizar el compromiso entre reactividad y estabilidad en políticas de imitación.
- Evaluación comparativa con y sin modalidad táctil: la serie de checkpoints del autor incluye pares con y sin tacto, lo que permite medir el impacto de esa señal en el error de seguimiento.
- Punto de partida para fine-tuning en tareas de inserción o colocación de objetos: la dimensionalidad de estado/acción (38-D) y la configuración de hardware son reutilizables para tareas relacionadas con el mismo robot y las mismas manos.
- Docencia y divulgación en robótica: como ejemplo completo de extremo a extremo de teleoperación, entrenamiento por imitación y evaluación en bucle abierto con métricas publicadas.

## Benchmarks y rendimiento

La model card publica únicamente error de seguimiento en bucle abierto sobre 4 episodios reservados, calculado como la media del valor absoluto de la diferencia entre la acción predicha y la registrada, en radianes, con ± SEM y n=4.

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| pi-0.5 (este modelo) | 0,0341 ± 0,0021 | 0,0228 ± 0,0030 | 0,0471 ± 0,0029 | 0,0329 ± 0,0033 |
| Baseline hold-first-frame | 0,2132 | 0,3383 | 0,2756 | 0,1755 |

Advertencias sobre estos datos, tal como los presenta el autor: la métrica mide seguimiento de trayectoria, no éxito de tarea, y no se ejecutó nada en hardware. Además, la model card indica que en esta tarea GR00T obtuvo el error más bajo entre las familias ya finalizadas, entre 3 y 4 veces por debajo de pi-0.5 y ACT, aunque no se proporcionan los valores numéricos de GR00T. Los entrenamientos de Diffusion Policy y T-Rex para esta tarea seguían en curso en el momento de publicar la ficha. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir del recuento de parámetros (estimación propia, no publicada por el autor): unos 14,5 GB en fp32 (el formato efectivamente publicado, coherente con el tamaño del repositorio), unos 7,2 GB en bf16/fp16, unos 3,6 GB en int8 y unos 1,8 GB en int4.
- A esas cifras hay que sumar el coste del codificador visual de 4 cámaras a 640x360 y 30 fps, la caché de activaciones y el bucle de control; la model card no publica cifras de VRAM ni de cómputo.
- GPU recomendadas: no hay recomendación oficial. Por tamaño, una RTX 4090 (24 GB) puede alojar los pesos en fp32, pero el margen para activaciones y procesamiento de cuatro flujos de vídeo es reducido; para inferencia sostenida a 30 Hz con cuatro cámaras son preferibles A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU de consumo: sí, en términos de pesos, en tarjetas con 16 GB o más si se usa bf16, y en tarjetas con 8-12 GB si se cuantiza a int4. El cuello de botella probable no es el peso del modelo, sino el procesamiento visual multicámara.
- Opciones de despliegue: no disponibles en la información publicada. Al tratarse de una política robótica con entrada multimodal (4 cámaras) y salida de acciones continuas de 38 dimensiones, no es directamente servible con vLLM, llama.cpp, Ollama o TGI, orientados a modelos de lenguaje; requeriría un bucle de inferencia propio sobre el robot.
- Latencia y throughput: no disponibles. La única referencia temporal es la frecuencia de captura de los datos de entrenamiento (30 fps) y el horizonte de chunking de 16 pasos.

## Comparativa con modelos similares

Los modelos comparables son los checkpoints hermanos del mismo autor para la misma tarea, mencionados en la model card.

| Modelo | Parámetros | Contexto / entradas | Error bucle abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi-0.5 (este modelo) | 3,62 mil millones | 4 cámaras RGB, estado 38-D | L-arm 0,0341 / L-hand 0,0228 / R-arm 0,0471 / R-hand 0,0329 | Gemma | Pública en HuggingFace |
| GR00T 3B (variante del autor) | ~3 mil millones (según el nombre del checkpoint) | misma tarea y entradas | el más bajo de las familias finalizadas, 3-4x por debajo de pi-0.5 y ACT (valores no publicados) | no disponible | Pública en HuggingFace |
| GR00T 3B con tacto | ~3 mil millones (según el nombre) | misma tarea, con entrada táctil | sin diferencia consistente respecto a la variante sin tacto | no disponible | Pública en HuggingFace |
| ACT | no disponible | misma tarea | superior al de pi-0.5 según la model card | no disponible | Pública en HuggingFace |
| Diffusion Policy | no disponible | misma tarea | entrenamiento en curso al publicar la ficha | no disponible | Pública en HuggingFace |
| T-Rex | no disponible | misma tarea | entrenamiento en curso al publicar la ficha | no disponible | Pública en HuggingFace |

No se dispone de comparación con políticas de propósito general de otros autores (por ejemplo, modelos fundacionales de manipulación) dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo de una sola tarea y un solo embodiment: no es un modelo generalista y no se documenta su transferencia a otras tareas, objetos, robots o manos.
- No hay validación en hardware: la model card indica explícitamente que nada de lo publicado se ejecutó sobre el robot real, por lo que no existe ninguna medida de éxito de tarea.
- La métrica publicada es error de seguimiento en bucle abierto sobre solo 4 episodios (n=4) y con un único baseline; la varianza de la estimación es alta y no permite extrapolar a rendimiento en producción.
- Sesgo de los datos: 31 episodios de teleoperación de una sola persona con guante Meta y seguimiento Vive, en una configuración concreta de cámaras; no se documenta diversidad de operadores, iluminación, posiciones iniciales ni condiciones ambientales.
- Riesgo de alucinación en sentido robótico: como política de imitación, puede generar acciones plausibles pero incorrectas fuera de la distribución de los datos de demostración, con riesgo de colisión o de daño al objeto y al robot.
- Idiomas: no aplica, no es un modelo de lenguaje; no se documentan capacidades lingüísticas ni de instrucciones en lenguaje natural.
- Licencia Gemma: conviene revisar los términos de uso antes de cualquier explotación, ya que esta licencia incluye una política de usos prohibidos y obligaciones de atribución y aviso que afectan a la redistribución y al uso comercial.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin revisión por terceros ni resultados replicados de forma independiente.
- No se documentan procedimientos de cuantización probados, por lo que cualquier despliegue cuantizado implica una validación adicional por parte de quien lo use.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
- Variante GR00T 3B de la misma tarea: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
- Variante GR00T 3B con entrada táctil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
- Variante pi-0.5 con entrada táctil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
- Variante ACT con entrada táctil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
- Página del autor: https://tarzanagh.github.io/
- Listado de modelos con la etiqueta dexmate-vega: https://huggingface.co/models?other=dexmate-vega
