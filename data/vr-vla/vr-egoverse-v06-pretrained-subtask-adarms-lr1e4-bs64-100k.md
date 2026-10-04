# VR-VLA/VR-egoverse-v06-pretrained-subtask-adarms-lr1e4-bs64-100k

## Resumen

VR-egoverse-v06-pretrained-subtask-adarms-lr1e4-bs64-100k es un checkpoint de preentrenamiento para un modelo de visión-lenguaje-acción (VLA) desarrollado por VR-VLA. Combina un backbone transformer congelado Qwen3.5-0.8B con adaptadores LoRA de rango 16 y una cabeza de acción de 24 bloques de cross-attention que emplea flow matching con condicionamiento temporal adaRMS. El resultado es un modelo capaz de predecir secuencias de movimiento humano bimanual a partir de vídeo egocéntrico narrado.

El checkpoint se entrena sobre EgoVerse v06, un conjunto de 35.000 clips egocéntricos que generan aproximadamente 1,16 millones de ventanas de entrenamiento, con fragmentos de acción de 16 pasos a 10 Hz. La particularidad de esta variante frente a los demás checkpoints de la misma colección es la fuente de narración: utiliza las anotaciones de subtarea de alto nivel del propio dataset (`subtask`) en lugar de las etiquetas atómicas por mano (`srt`). El entrenamiento cubre 100.000 pasos con un objetivo doble de lenguaje y de flow matching.

Es relevante porque ejemplifica una línea de trabajo concreta en robótica: separar el preentrenamiento de representación acción-lenguaje del ajuste fino sobre el espacio de acción de un robot concreto. No obstante, conviene subrayar que se trata de un checkpoint de preentrenamiento y no de una política desplegable: su espacio de acción son 153 dimensiones de movimiento humano a dos manos, sin semántica de pinza ni de manipulador, por lo que requiere un finetune sobre la embodied de destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone transformer congelado Qwen3.5-0.8B + LoRA r=16 + cabeza de accion de 24 bloques de cross-attention con flow matching y condicionamiento adaRMS |
| Parametros totales | 530 M en el checkpoint (938 tensores); backbone Qwen3.5-0.8B congelado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el entrenamiento uso autocast bf16 con pesos maestros en fp32 |
| Idiomas soportados | no disponible; los ejemplos de anotacion de la fuente `subtask` estan en ingles |
| Licencia | other (licencia declarada: egoverse-internal), derivada de EgoVerse y Qwen3.5-0.8B |
| Formato de pesos | checkpoint PyTorch (938 tensores); formato exacto de serializacion no especificado |
| Modelo base | Qwen/Qwen3.5-0.8B (backbone congelado) |
| Espacio de accion | 153 dimensiones por paso temporal (cabeza, mano izquierda, mano derecha) |
| Pasos de entrenamiento | 100.000 |
| Tamano del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

La arquitectura se compone de tres piezas. La primera es un backbone Qwen3.5-0.8B que permanece congelado durante todo el entrenamiento y al que se le añaden adaptadores LoRA de rango 16. La segunda es la cabeza de acción, formada por 24 bloques de cross-attention con dimensión oculta 1024, que genera movimiento mediante flow matching con integrador Euler de 10 pasos y condicionamiento de paso temporal adaRMS con dimensión de condicionamiento 256. La tercera es el objetivo de lenguaje, que supervisa la narración de subtareas y que el propio autor sugiere mantener congelado aguas abajo para que el modelo escriba narración de nivel de subtarea sobre la que condiciona la cabeza de acción.

El entrenamiento usa 35.000 clips egocéntricos de EgoVerse v06, que producen unas 1,16 millones de ventanas con fragmentos de acción de 16 pasos a 10 Hz. El espacio de acción tiene 153 dimensiones por paso: posición de cabeza (3), rotación de cabeza en representación 6d (6), y para cada mano, posición de muñeca en marco de cámara (3), rotación 6d (6) y 21 keypoints relativos a la muñeca (63). La cabeza es relativa a un ancla y las rotaciones usan la representación 6d de Zhou et al. La fuente de narración es `subtask`: el 81 % de los clips llevan estas anotaciones, con una mediana de 6 segmentos por clip que cubren el clip completo; las ventanas sin segmento solo aportan pérdida de acción. El prompt incorpora además un bloque `Recent:` con las tres subtareas precedentes.

La configuración de entrenamiento es de 100.000 pasos, tasa de aprendizaje 1e-4 con 100 pasos de warmup y decaimiento coseno hasta cero, batch efectivo 64 (16 x 4 de acumulación), optimizador AdamW con weight decay 0,01, precisión bf16 con pesos maestros fp32 y semilla 7. Se optimizan dos objetivos simultáneamente: lenguaje sobre la narración de subtarea y flow matching sobre los fragmentos de acción.

Pérdidas de entrenamiento registradas en el log del run (una sola batch en cada paso, no una media móvil):

| Paso | Total | Accion | Narracion |
|---|---|---|---|
| 20 | 1,534 | 1,397 | 1,371 |
| 20.000 | 0,082 | 0,048 | 0,347 |
| 40.000 | 0,065 | 0,053 | 0,117 |
| 60.000 | 0,053 | 0,044 | 0,088 |
| 80.000 | 0,042 | 0,040 | 0,018 |
| 100.000 | 0,046 | 0,044 | 0,022 |

## Capacidades

- Predicción de movimiento humano bimanual: genera fragmentos de acción de 16 pasos a 10 Hz en un espacio de 153 dimensiones que cubre cabeza, mano izquierda y mano derecha.
- Generación de movimiento mediante flow matching con integrador Euler de 10 pasos, condicionado por un vector temporal procesado con adaRMS.
- Narración de subtareas: el objetivo de lenguaje se entrena sobre las anotaciones `subtask` del dataset, e incluye el contexto de las tres subtareas anteriores en el prompt.
- Condicionamiento lenguaje-acción: la cabeza de acción se condiciona sobre la representación producida por el backbone y los adaptadores LoRA.
- Capacidad de inicialización para transferencia: la representación aprendida está pensada para reutilizarse sustituyendo las proyecciones del espacio de acción por las de la embodied de destino.
- No soporta tool calling ni function calling según la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe.
- La model card no detalla el codificador visual empleado, pese a la denominación VLA; no disponible.

## Casos de uso

- Inicialización para finetuning de políticas robóticas bimanuales: el checkpoint sirve como punto de partida donde se reemplazan las proyecciones del espacio de acción por las de la embodied de destino y se reutiliza la representación aprendida. Es el uso declarado por el autor.
- Transferencia a plataformas de dos brazos: el preentrenamiento sobre movimiento humano a dos manos proporciona una base de coordinación bimanual que puede adaptarse a un robot con dos manipuladores, siempre que se sustituya la cabeza de acción y se entrene con datos del robot.
- Generación de narración de subtareas en pipelines de anotación: manteniendo congelado el narrador LoRA, el modelo puede etiquetar secuencias de vídeo con subtareas de alto nivel, útiles para anotación automática o para condicionar otras políticas.
- Investigación en representaciones egocéntricas: el checkpoint permite estudiar qué estructuras de movimiento y lenguaje se capturan al entrenar sobre vídeo egocéntrico humano con supervisión de acción densa.
- Estudio comparativo de fuentes de narración: al compartir clips, ventanas y acciones con el checkpoint de 60.000 pasos basado en `srt`, permite aislar el efecto de la fuente de texto (subtarea de alto nivel frente a etiquetas atómicas por mano) sobre la representación aprendida.
- Predicción de movimiento humano para animación o simulación: la cabeza de acción modela poses de cabeza y manos en marco de cámara, lo que puede alimentar avatares o entornos simulados que consuman ese formato de 153 dimensiones.
- Base para modelos de world modeling en robótica: los fragmentos de acción de 16 pasos a 10 Hz y el condicionamiento por lenguaje permiten experimentar con predicción de consecuencias de acciones a corto plazo.
- Punto de partida para ablaciones de flow matching: el esquema de integrador Euler de 10 pasos y el condicionamiento adaRMS pueden compararse con alternativas de difusión o regresión directa partiendo de este entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no incluye evaluación sobre conjuntos retenidos del objetivo de preentrenamiento, que no caracteriza el rendimiento de transferencia aguas abajo y que ningún finetune partiendo de este checkpoint ha sido evaluado todavía.

## Requisitos de hardware

- La model card no documenta el hardware empleado en el entrenamiento ni cifras de latencia o throughput: no disponible.
- Estimación derivada del recuento de parámetros: los 530 M parámetros del checkpoint en bf16 ocupan aproximadamente 1,06 GB; sumando el backbone Qwen3.5-0.8B congelado en bf16 (unos 1,6 GB) el conjunto de pesos se sitúa alrededor de 2,7 GB. Es una estimación aritmética, no una medición publicada.
- Entrenamiento aguas abajo: con AdamW y pesos maestros en fp32, los estados del optimizador añaden copias adicionales de los parámetros entrenables, además de las activaciones de batch efectivo 64 con acumulación de 4. El consumo real no está documentado.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: por el tamaño derivado de pesos (del orden de 3 GB en bf16), cabría en GPUs de consumo con 8 GB o más en el caso de reutilizar la representación, pero no hay confirmación oficial y el finetuning completo puede requerir más memoria.
- Opciones de despliegue: no aplicable como modelo servible. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, y el propio autor advierte de que no es una política desplegable directamente.
- Latencia y throughput: no disponible. La generación de acción emplea un integrador Euler de 10 pasos, dato relevante para estimar coste, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Pasos de entrenamiento | Fuente de narracion | Clips y ventanas | Espacio de accion | Licencia |
|---|---|---|---|---|---|
| VR-egoverse-v06-pretrained-subtask-adarms-lr1e4-bs64-100k (este) | 100.000 | `subtask` (subtareas de alto nivel de `egoverse_annotation_v1`) | EgoVerse v06: 35.000 clips, ~1,16 M ventanas | 153 dims, movimiento humano a dos manos | egoverse-internal |
| VR-egoverse-v06-pretrained-lr1e4-bs64-60k (checkpoint hermano) | 60.000 | `srt` (etiquetas atomicas por mano, destiladas de un VLM) | Los mismos clips, ventanas y acciones | 153 dims, movimiento humano a dos manos | egoverse-internal |

El único punto de comparación documentado en la información disponible es el checkpoint hermano de la misma colección, que comparte clips, ventanas y acciones y difiere únicamente en la fuente de texto y en el número de pasos. No se dispone de datos verificados para comparar con otras familias de modelos VLA abiertos, como OpenVLA o π0: no disponible.

## Limitaciones y advertencias

- No es una política desplegable. Su espacio de acción son 153 dimensiones de movimiento humano a dos manos y no puede gobernar un robot directamente; exige un finetune sobre el espacio de acción de la embodied objetivo.
- Ausencia total de datos de robot en el entrenamiento: solo se usa una fuente egocéntrica humana.
- Sin semántica de pinza ni de manipulador: las manos se representan como poses de muñeca y 21 keypoints, no como acciones de agarre.
- El 19 % de los clips no tienen anotación de subtarea y no aportan supervisión de lenguaje, lo que deja parte del corpus sin objetivo lingüístico.
- Las pérdidas reportadas son de conjunto de entrenamiento, no hay evaluación sobre datos retenidos del objetivo de preentrenamiento.
- El rendimiento de transferencia aguas abajo no está caracterizado, y ningún finetune partiendo de este checkpoint ha sido evaluado todavía.
- Es obligatorio incluir `action_norm_egoverse.json`: todos los objetivos están en espacio normalizado y el checkpoint carece de sentido sin esas estadísticas.
- Licencia `other` con nombre `egoverse-internal`, derivada de EgoVerse y de Qwen3.5-0.8B. El usuario debe cumplir ambas condiciones, y el checkpoint no concede derechos adicionales. La denominación "internal" aconseja revisar los términos antes de cualquier uso comercial.
- Riesgo de alucinación en la parte de lenguaje: la narración de subtareas se aprende por imitación de anotaciones humanas y no se documenta ningún mecanismo de verificación.
- Sin datos sobre sesgos, cobertura idiomática ni comportamiento fuera de la distribución del vídeo egocéntrico de EgoVerse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VR-VLA/VR-egoverse-v06-pretrained-subtask-adarms-lr1e4-bs64-100k
- Dataset EgoVerse v06: https://huggingface.co/datasets/VR-VLA/VR-egoverse-annotation-curated-v6.0
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint hermano mencionado en la model card: https://huggingface.co/VR-VLA/VR-egoverse-v06-pretrained-lr1e4-bs64-60k
- Colección del autor en HuggingFace: https://huggingface.co/VR-VLA
- Paper, blog o repositorio adicionales: no disponible.
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces encontrados correspondían a comparativas de cascos de realidad virtual y no guardan relación con el checkpoint.
