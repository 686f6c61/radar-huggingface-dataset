# tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921

## Resumen

El modelo `tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921` es un checkpoint de política de imitación para robótica bimanual, publicado por el usuario tarzanagh en Hugging Face. Se trata de un modelo ACT (Action Chunking with Transformers) con entrada táctil adicional, entrenado para una tarea concreta: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 que sujeta una caja de pañuelos con la mano izquierda y extrae un pañuelo con la derecha. La tarea se teleoperó con guante meta (sin exoesqueleto) y seguimiento de muñeca Vive.

El checkpoint tiene 51.764.902 parámetros (aproximadamente 51,8 millones) almacenados en safetensors, con un repositorio de 0,2 GB y licencia Apache 2.0. No es un modelo de lenguaje ni un modelo multimodal generativo: es una política de control que mapea observaciones (4 cámaras RGB, estado articular y fuerzas táctiles) a acciones articulares de 38 dimensiones, con predicción de chunks de 16 pasos.

Su relevancia es fundamentalmente experimental: forma parte de una familia de 24 ejecuciones del mismo dataset que compara cuatro familias de políticas (ACT, Diffusion Policy, GR00T y pi0.5), con y sin entrada táctil, sobre tres tareas. El propio autor advierte de que las métricas publicadas miden seguimiento de trayectoria en bucle abierto y que ninguna variante se ha ejecutado sobre hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con entrada táctil; detalles de capas no disponibles |
| Parametros totales | 51.764.902 (~51,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; horizonte de chunk de acción de 16 pasos (la política recibe la observación real cada 16 pasos) |
| Tipos de cuantizacion | No disponible (pesos publicados en precisión nativa, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No aplica (modelo de control robótico, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada | 4 cámaras RGB (640x360 a 30 fps) + estado de 68-D: 38-D de posiciones articulares `[L_arm 7 \| L_hand 12 \| R_arm 7 \| R_hand 12]` y 30-D de fuerza en punta de dedo (5 dedos x 3 ejes por mano) |
| Salida | Acciones de 38-D de posiciones articulares (chunks de 16 pasos, se conservan los 16 primeros) |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Entrenamiento | 10.000 pasos, semilla 1000; 120 episodios (108 entrenamiento / 12 reservados, cada décimo) |

## Arquitectura y entrenamiento

La política se basa en ACT (Action Chunking with Transformers), un esquema de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación fina. En esta variante concreta se añade una entrada táctil: además del estado articular de 38 dimensiones (7 de brazo y 12 de mano por cada lado), el modelo recibe 30 dimensiones de fuerza en la punta de los dedos (5 dedos x 3 ejes por mano), concatenadas hasta formar un vector de estado de 68 dimensiones. La model card no detalla el número de capas, el tipo de codificador visual ni la función de pérdida concreta, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó durante 10.000 pasos con semilla 1000 sobre 120 episodios de teleoperación, de los cuales 108 se usaron para entrenar y 12 quedaron reservados (uno de cada diez). La recogida de datos empleó teleoperación con guante meta y seguimiento de muñeca Vive, sin exoesqueleto, y cuatro cámaras RGB a 640x360 y 30 fps. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitación.

## Capacidades

- Control bimanual coordinado: genera acciones simultáneas para dos brazos y dos manos de 12 grados de libertad cada una, manteniendo la caja con el brazo izquierdo mientras el derecho ejecuta la extracción.
- Manipulación diestra con manos XHand1: produce comandos articulares de 12 dimensiones por mano, adecuados para manos con dedos independientes.
- Predicción de chunks de acción: emite bloques de 16 pasos por inferencia, lo que aporta consistencia temporal a la trayectoria.
- Integración de señal táctil: acepta 30 dimensiones de fuerza en punta de dedo, aunque el propio autor indica que, en el conjunto de experimentos, la entrada táctil no aportó diferencias más allá del ruido.
- Percepción visual multivista: consume cuatro flujos RGB, lo que permite cubrir el área de trabajo desde varios ángulos.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.
- No se documentan capacidades de generalización a otras tareas, objetos o morfologías distintas de la entrenada.

## Casos de uso

- Manipulación bimanual fina en laboratorio: el modelo está entrenado específicamente para sujetar un objeto con una mano y ejecutar una extracción con la otra, por lo que sirve como punto de partida para tareas que requieran coordinación entre extremidades con holgura limitada.
- Baseline en investigación de aprendizaje por imitación: al existir 24 ejecuciones hermanas sobre el mismo dataset (ACT, Diffusion Policy, GR00T, pi0.5, con y sin táctil), este checkpoint permite comparar familias de políticas bajo condiciones de datos idénticas.
- Estudio del aporte de la modalidad táctil: el modelo existe en versión con y sin entrada táctil y con el mismo resto de configuración, lo que permite aislar el efecto de las fuerzas de punta de dedo en el error de seguimiento.
- Fine-tuning sobre nuevas tareas de teleoperación con el mismo hardware: al estar publicado en safetensors con licencia Apache 2.0, puede reentrenarse sobre episodios adicionales recogidos con DexMate Vega-1 y manos XHand1.
- Evaluación offline de políticas en bucle abierto: el error medio `|pred − acción registrada|` sobre los 12 episodios reservados permite usar el checkpoint como referencia de regresión al iterar sobre arquitecturas o datasets.
- Prototipado de pipelines de datos robóticos: la combinación de 4 cámaras RGB, estado de 68-D y chunks de 16 acciones sirve como caso de prueba para herramientas de carga, normalización y serialización de datasets de manipulación.
- Docencia y divulgación técnica: por su tamaño reducido (51,8 M de parámetros y 0,2 GB de repositorio) es viable para reproducir experimentos de imitación en un equipo con una sola GPU de gama media, siempre que se disponga del hardware robótico o de los datos registrados.

## Benchmarks y rendimiento

La model card publica únicamente error de bucle abierto sobre los 12 episodios reservados, definido como la media de `|pred − acción registrada|` en radianes (± SEM):

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (ACT + táctil) | 0,0234 ± 0,0013 | 0,0232 ± 0,0027 | 0,0598 ± 0,0031 | 0,0365 ± 0,0021 |
| Baseline `hold-first-frame` | 0,1975 | 0,0514 | 0,2628 | 0,1440 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni métricas equivalentes en la información disponible, ni tampoco tasas de éxito de tarea. El autor especifica que estas cifras miden seguimiento de trayectoria y que ninguna ejecución se realizó sobre hardware físico. Además, señala que, en el conjunto de cuatro familias por tres tareas, la entrada táctil no supuso diferencia más allá del ruido y que GR00T obtuvo el error más bajo en todas las tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 51,8 M de parámetros, lo que equivale a unos 207 MB en fp32 y unos 104 MB en fp16. Sumando los codificadores visuales de las 4 cámaras y los búferes de activaciones, la inferencia cabe holgadamente por debajo de 2 GB en la mayoría de configuraciones; la cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en términos de memoria. Para entrenamiento o reentrenamiento, una RTX 3090, RTX 4090 o A100 acelera considerablemente el proceso, aunque el tamaño del modelo no lo exige.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4 GB o más (GTX 1650, RTX 3060, RTX 4060, RTX 4090). La limitación real no es la VRAM, sino el acceso al robot DexMate Vega-1 con manos XHand1 y a las cuatro cámaras para generar observaciones válidas.
- Opciones de despliegue: al ser un checkpoint en safetensors, el despliegue típico es mediante PyTorch en un nodo de control robótico. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas de control de este tipo.
- Latencia y throughput: no disponibles. La cadencia efectiva está condicionada por la frecuencia del bucle de control del robot y por el horizonte de 16 pasos entre observaciones reales.

## Comparativa con modelos similares

Los modelos comparables son las ejecuciones hermanas de la misma tarea, publicadas por el mismo autor sobre el mismo dataset de 120 episodios:

| Modelo | Familia | Parametros | Entrada tactil | Licencia | Error (referencia) |
|---|---|---|---|---|---|
| Este modelo (`acttactile260921`) | ACT | 51,8 M | Sí | Apache 2.0 | 0,0234 / 0,0232 / 0,0598 / 0,0365 rad |
| `act260921` | ACT | No disponible | No | No disponible en la informacion | No disponible |
| `dp260921` | Diffusion Policy | No disponible | No | No disponible en la informacion | No disponible |
| `dptactile260921` | Diffusion Policy | No disponible | Sí | No disponible en la informacion | No disponible |
| `gr00t3b260921` | GR00T | El nombre sugiere ~3 B, sin confirmar | No | No disponible en la informacion | El más bajo en todas las tareas según el autor |
| `gr00t3btactile260921` | GR00T | El nombre sugiere ~3 B, sin confirmar | Sí | No disponible en la informacion | No disponible |
| `pi05260921` | pi0.5 | No disponible | No | No disponible en la informacion | No disponible |
| `pi05tactile260921` | pi0.5 | No disponible | Sí | No disponible en la informacion | No disponible |

Frente a GR00T (~3 B según el nombre del repositorio) o pi0.5, este checkpoint es dos órdenes de magnitud más pequeño y, según los resultados publicados por el autor, con mayor error: GR00T obtuvo el error más bajo en todas las tareas evaluadas. No se dispone de cifras concretas del resto de variantes para establecer una comparación numérica completa.

## Limitaciones y advertencias

- Sobreajuste a una única tarea: el modelo se entrenó exclusivamente para extraer un pañuelo de una caja sujetada con la otra mano. No hay evidencia de generalización a otros objetos, texturas o secuencias.
- Dependencia del hardware: la política está ligada a la morfología DexMate Vega-1 con dos manos RobotEra XHand1 y a la disposición concreta de cuatro cámaras RGB. Cambiar cualquiera de estos elementos invalida las observaciones de entrada.
- Ausencia de validación en hardware: el propio autor indica explícitamente que no se ejecutó nada sobre el robot físico. Las cifras publicadas son de bucle abierto y miden seguimiento de trayectoria, no éxito de tarea.
- Aportación nula de la señal táctil en la evidencia disponible: según la model card, la entrada táctil no produjo diferencias más allá del ruido en cuatro familias de políticas y tres tareas, por lo que no debe asumirse una mejora por incluirla.
- Sesgos: no se documenta ningún análisis de sesgo. En el contexto robótico, el riesgo relevante es el sesgo de recogida de datos, ya que los 120 episodios provienen de una única persona teleoperando con guante meta y seguimiento Vive.
- Riesgo de alucinación fuera de dominio: como toda política de imitación, ante observaciones fuera de la distribución de entrenamiento puede generar acciones sin sentido, con riesgo físico para el robot y el entorno.
- Volumen de datos limitado: 108 episodios de entrenamiento son pocos para una tarea con dos manos de 12 grados de libertad cada una.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el modelo solo es funcional con el hardware propietario correspondiente, cuyas condiciones de uso son independientes de esta licencia.
- Idiomas: no aplica. No procesa ni genera texto.
- Advertencia de metadatos: el repositorio está fechado en 2026-09-24, posterior a la fecha habitual de publicación, algo a tener en cuenta al citarlo.
- Sin resultados de benchmarks estandarizados de robótica (por ejemplo, tasas de éxito por tarea) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921
- Ejecución sin entrada táctil (ACT): https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_act260921
- Ejecución con Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dp260921
- Ejecución con Diffusion Policy y táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dptactile260921
- Ejecución con GR00T (3 B): https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921
- Ejecución con GR00T (3 B) y táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3btactile260921
- Ejecución con pi0.5: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05260921
- Ejecución con pi0.5 y táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921
- Papers, blogs, repositorios o demos adicionales: no disponible. Los resultados de búsqueda web obtenidos no guardaban relación con el modelo.
