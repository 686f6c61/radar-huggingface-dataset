# Superstar111/pour_clean_1cmd_b64

## Resumen

`Superstar111/pour_clean_1cmd_b64` es un modelo de visión-lenguaje-acción (VLA) derivado de π0.5, desarrollado por el usuario Superstar111 y entrenado con el framework openpi de Physical Intelligence. Se trata de una política robótica de imitación que aprende una única tarea episódica compuesta por tres habilidades encadenadas: coger una cuchara de su soporte, recoger garbanzos y verterlos en una olla. El modelo está diseñado para un brazo YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones.

El modelo se presenta explícitamente como una línea base ("baseline") que ilustra qué aprende una política a partir de trayectorias generadas por un agente de programación, en contraposición a datos de teleoperación humana. Se entrenó únicamente en simulación y no se ha ejecutado sobre el robot real. El autor advierte que no es apto para el montaje de laboratorio bajo su regla de agarre, ya que falla la prueba de agarre de potencia en las 300 trayectorias registradas.

El repositorio ocupa 12,4 GB e incluye un checkpoint de openpi. La ficha técnica disponible no detalla arquitectura interna, número de parámetros ni longitud de contexto, por lo que varios campos de especificaciones se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5, fine-tune completo desde la base pi0.5 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (comando en inglés: "pick up the spoon, scoop the beans and pour them into the pot") |
| Licencia | no disponible |
| Formato de pesos | checkpoint de openpi (directorio `checkpoint/`) |
| Framework de entrenamiento | openpi (commit eca022d), config `pi05_maggie_2skill_hcw_nojit` |
| Hardware de entrenamiento | 2 NVIDIA H200 (data parallel, 32 por GPU) |
| Tamaño del repositorio | 12,4 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de la base π0.5 dentro del ecosistema openpi, configurado con tres vistas de cámara (head, wrist, cam1) y sin aumento de imagen. La política recibe una única instrucción en lenguaje natural para todo el episodio y produce objetivos articulares (joint targets) para el brazo y la mano. No se detalla en la información disponible la arquitectura interna (transformer, mezcla de expertos, mecanismo de atención) ni el número de parámetros.

El entrenamiento se realizó sobre 300 trayectorias procedentes de `Superstar111/stir_clean_1cmd`, recortadas al final del vertido (antes de la fase de remover). Se conservaron 99.623 de 379.874 pasos (26,2 %), con 304/339/339 pasos por episodio (mínimo/mediana/máximo). La receta usa batch 64 y 3.200 pasos con schedule coseno, pico de learning rate de 5e-5 a 5e-6, warmup de 320, EMA 0,999 y semilla 43; se usan los pesos EMA del paso 3199. La pérdida pasó de 0,4970 en el primer paso registrado a 0,0017 en el último. El número de pasos sigue la regla de aproximadamente 2,05 pasadas sobre los datos (2,06 en este caso), frente a las 5,56 que daría la receta original de batch 32 y 17.300 pasos. No se conservó ningún checkpoint intermedio.

## Capacidades

- Ejecución de una política VLA de imitación para una tarea episódica compuesta: coger la cuchara, recoger garbanzos y verterlos en la olla.
- Control de un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones mediante objetivos articulares.
- Seguimiento de una instrucción en lenguaje natural única para todo el episodio.
- Procesamiento de tres vistas de cámara (head, wrist, cam1) como entrada visual.
- Generación de chunks de acción de 10 pasos, con relleno del último objetivo marcado como `action_valid = false` cuando la consulta se acerca al final del episodio.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento general: es una política motora, no un modelo de lenguaje conversacional.
- Capacidades multilingües: no disponibles; el único comando documentado está en inglés.

## Casos de uso

- Investigación en imitación desde datos generados por agentes: sirve como referencia para estudiar qué calidad de política se obtiene al entrenar con trayectorias producidas por un agente de programación en lugar de teleoperación humana.
- Estudio de recorte de episodios: el modelo ilustra cómo recortar trayectorias al final de una habilidad (el vertido) y entrenar solo la parte relevante, con verificación mediante un juez automático que confirma la llegada de garbanzos a la olla en 300 de 300 episodios.
- Comparación de recetas de entrenamiento: al compartir receta con `pour_videoprior_1cmd_b64` (batch 64), permite aislar el efecto del número de pasos y del tamaño de batch sobre el aprendizaje.
- Validación de pipelines de servicio: el autor verificó que un servidor nuevo responde a 12 consultas registradas dentro de 0,002545 rad de las respuestas del clúster de entrenamiento (tolerancia 0,005 rad), útil para probar rutas de inferencia openpi.
- Benchmark de agarre en simulación: aunque falla la prueba de agarre de potencia del laboratorio, puede usarse para analizar modos de fallo de agarre en políticas entrenadas solo en simulación.
- Docencia y reproducción: como línea base documentada con receta, datos y checks, facilita la reproducción de experimentos de VLA en entornos académicos con acceso a H200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado, ni en simulación ni en robot real. La única verificación reportada es de infraestructura: 12 consultas registradas respondidas dentro de 0,002545 rad de las respuestas del clúster de entrenamiento tras verificar los sha256 del bundle y del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del checkpoint es de 12,4 GB, lo que da una cota inferior orientativa, pero no se especifica la cuantización ni el consumo real).
- GPU de entrenamiento documentadas: 2 NVIDIA H200 con 32 muestras por GPU.
- GPU recomendadas para inferencia: no disponibles; por el tamaño del checkpoint, se requeriría al menos una GPU con memoria suficiente para cargar los pesos completos, sin datos confirmados.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del repositorio (12,4 GB) sugiere que podría no caber en GPUs de consumo con menos de 16 GB de VRAM, pero no hay datos de cuantización que lo confirmen.
- Opciones de despliegue: servidor de openpi (el autor verificó la ruta de servicio con un servidor nuevo); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Pasos / batch | Evaluado | Licencia |
|---|---|---|---|---|---|
| `Superstar111/pour_clean_1cmd_b64` | π0.5 VLA, fine-tune | 300 trayectorias recortadas al vertido (99.623 pasos) | 3.200 / 64 | No | no disponible |
| `Superstar111/stir_clean_1cmd` | π0.5 VLA, fine-tune | 300 trayectorias completas con remover | 17.300 / 32 | No disponible en la información | no disponible |
| `Superstar111/pour_v1_1cmd` | π0.5 VLA, fine-tune | Trayectorias de vertido | no disponible | No disponible en la información | no disponible |
| `Superstar111/pour_v2_1cmd` | π0.5 VLA, fine-tune | Trayectorias de vertido | no disponible | No disponible en la información | no disponible |

La comparación se limita a los modelos de la misma familia y pipeline citados en la model card; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- No evaluado: el autor declara que no se ha ejecutado ninguna evaluación, ni en simulación ni en robot real.
- Solo simulación: entrenado exclusivamente con datos simulados; no se ha probado sobre el robot físico.
- Agarre no válido para el montaje del laboratorio: falla la prueba de agarre de potencia (pulgar cerrado sobre el mango: falso en 300 de 300 episodios y en 300 de 300 repeticiones físicas).
- Montaje de mano y articulación 6: entrenado con el montaje de mano girado; no se debe aplicar la conversión de la articulación 6 de los cinco checkpoints anteriores. No verificado en el robot.
- Cámara de muñeca: su pose en entrenamiento es geométrica (según el montaje), no calibrada y no verificada en el robot.
- Requiere una persona en la parada de emergencia durante cualquier ejecución.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles: solo se documenta un comando en inglés.
- Riesgo de alucinación motora: al ser una política de imitación sin evaluación, puede generar trayectorias fuera de distribución; no hay datos sobre sesgos.
- Sin checkpoint intermedio: no se conservó ningún estado intermedio del entrenamiento, lo que limita el análisis de la curva de aprendizaje.
- El chunk de acción de 10 pasos se rellena con el último objetivo (`action_valid = false`) cerca del final del episodio, lo que puede producir retenciones no deseadas en consultas tardías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pour_clean_1cmd_b64
- Modelo de referencia con remover: https://huggingface.co/Superstar111/stir_clean_1cmd
- Modelo de vertido v1: https://huggingface.co/Superstar111/pour_v1_1cmd
- Modelo de vertido v2: https://huggingface.co/Superstar111/pour_v2_1cmd
- Framework openpi: https://github.com/Physical-Intelligence/openpi
