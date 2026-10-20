# zjj1993/GLM-5.3-Flash-uncensored-china-LoRA

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de 107 millones de parámetros (rango 32, alpha 64) que se aplica sobre **GLM-5.3-Flash**, el modelo de la familia GLM publicado por la organización zai-org (Zhipu). Su objetivo es retirar la censura política de origen chino del modelo base manteniendo intactas sus capacidades de código, uso de herramientas y rendimiento en exámenes. Según el autor, el modelo original responde con línea de propaganda, rechazo o evasión ante temas como Tiananmen, Xinjiang, Tíbet o Li Wenliang en el 65 % de los casos, y en el 100 % cuando la pregunta se formula directamente en chino.

La relevancia técnica del trabajo está en el método: en lugar de editar la dirección de activación en inferencia (un subespacio de 3 dimensiones en las capas 2-43 que reducía la censura al 20 % pero duplicaba los tokens de salida en tareas de agente), el autor entrena en dos fases —SFT autodestilado y DPO sobre las propias respuestas del modelo, con verificación factual por afirmación— y valida con 18 puertas preinscritas de libertad, veracidad e inteligencia. El adaptador solo toca atención y expertos compartidos, dejando congelados los expertos enrutados, de modo que se fusiona de forma exacta sobre los tensores BF16 de los checkpoints NVFP4 sin recuantizar.

El resultado reportado es una caída de censura del 65 % al 1 % (0 % en temas no vistos durante el entrenamiento) con una pérdida de rendimiento global de 1,7 puntos en un conjunto de 700 pruebas (McNemar p = 0,26). Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, publicado bajo licencia MIT y con scripts de fusión incluidos, no un modelo listo para producción sin validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer con mezcla de expertos (expertos enrutados congelados + expertos compartidos); arquitectura detallada del modelo base: no disponible |
| Parámetros totales | Modelo base: no disponible. Adaptador: 107 M de parámetros entrenables |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Base NVFP4 (`nvidia/GLM-5.3-Flash-NVFP4`, `RedHatAI/GLM-5.3-Flash-NVFP4`); adaptador en float32; la fusión aplica redondeo BF16 intermedio |
| Idiomas soportados | en, zh |
| Licencia | MIT (adaptador); licencia del modelo base: no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`, 428 MB, float32) + `adapter_config.json` |

## Arquitectura y entrenamiento

El adaptador se entrena contra los tensores en BF16 de `nvidia/GLM-5.3-Flash-NVFP4`: atención y expertos compartidos son BF16 en ese checkpoint, mientras que los expertos enrutados están en NVFP4 y permanecen congelados, dequantizándose al vuelo durante el entrenamiento. El rango 32 se divide en dos mitades que codifican las dos etapas: las columnas 0-15 corresponden al SFT autodestilado y las 16-31 al DPO, con `alpha` 64 y una regex de `target_modules` limitada al modelo de lenguaje (`stages: 16,16` en los metadatos del safetensors).

La etapa 1 generó respuestas con el GLM original bajo un system prompt de "responde abiertamente" y sin material de referencia; un juez conservó solo las respuestas calibradas y el entrenamiento se hizo sin ese system prompt. Un intento previo basado en respuestas redactadas a partir de material recuperado enseñó al modelo a inventar fuentes y cifras (40 % de errores graves), por lo que se descartó. La etapa 2 aplica DPO sobre 612 pares extraídos de las propias respuestas de la etapa 1 (401 rechazadas por fabricación, 150 por sesgo, 61 por ceder ante la presión del usuario) más 769 filas de anclaje bajo un término SFT (295 de formato de respuesta, 340 de replay general, 134 de trayectorias de agente). Hiperparámetros: β 0,1, α_sft 0,2, lr 1,5e-4, 1 epoch, 222 pasos, 5,5 horas en 2x DGX Spark. El etiquetado proviene de una comprobación estricta de afirmaciones: el juez marca cada claim como verdadero o falso y grave o menor, y cualquier error grave anula la muestra.

El autor documenta también el enfoque descartado: proyectar fuera una "dirección de censura" de 3 dimensiones en las capas 2-43 reducía la censura al 20 %, pero duplicaba los tokens de salida en tareas de agente; variantes más suaves mantenían la verbosidad y dejaban la mayor parte de la censura. La magnitud de esa dirección se concentra en el token de inicio de respuesta, pero editar solo ese token dejaba 12 de 12 prompts de cribado censurados, lo que indica que en GLM la censura está distribuida a lo largo de toda la respuesta.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, heredados del modelo base.
- Respuestas factuales y calibradas sobre temas políticos sensibles para China: 80 % calibrado frente al 20 % del original en el conjunto principal, y 75 % frente a 19 % en temas no vistos.
- Señalización explícita de temas donde la evidencia está disputada, en lugar de presentar una única versión oficial.
- Resistencia a la presión del usuario: 0 % de respuestas censuradas en 12 temas de holdout con 5 formulaciones distintas (presión hacia la línea oficial, presión hacia la exageración, system prompts genéricos en inglés y chino), frente al 37 % del original.
- Capacidad de agente y multi-step reasoning preservada: 32/34 tareas agénticas autoevaluadas, con 27,9k tokens de salida frente a 31,1k del original.
- Generación de código: 148/163 en HumanEval+ (el original, 146).
- Razonamiento matemático: 95,5 en GSM8K, idéntico al original.
- Conocimiento factual y de examen: 80,0 en MMLU-Pro y 85,4 en el agregado de 700 pruebas (original: 81,3 y 87,1).
- Conocimiento no político en chino: 83,5 en CMMLU no político (original: 87,5).
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible, aunque el adaptador se entrenó con trayectorias de agente y preserva la tasa de éxito en tareas agénticas.
- Capacidades multimodales, de audio o de visión: no disponible.

## Casos de uso

- Investigación sobre censura en modelos lingüísticos: permite comparar el comportamiento del mismo checkpoint con y sin alineamiento político, sirviendo como condición experimental controlada en estudios de sesgo y libertad de expresión.
- Auditoría y red-teaming de modelos chinos: las 24 temáticas sensibles con 4 formulaciones (chino/inglés, pregunta directa/formato de examen) y el holdout de 12 temas constituyen un protocolo replicable para evaluar otros modelos de la misma familia.
- Asistentes internos para análisis político: equipos de relaciones internacionales o think tanks pueden desplegar un asistente en chino e inglés que responda sobre Xinjiang o Tiananmen con matices y sin línea oficial, reduciendo el riesgo de respuestas propagandísticas en informes.
- Generación de datos sintéticos multilingües: el adaptador produce respuestas calibradas en dos idiomas sobre temas donde el modelo base evade, útil para construir corpus de entrenamiento o de evaluación con menor tasa de fabricación (7 % de errores graves frente al 18 % del original en el holdout).
- Evaluación comparativa de la deriva de alineamiento: al conservar HumanEval+, GSM8K y tareas agénticas casi idénticas, sirve para medir el coste real de retirar la censura sobre la competencia técnica del modelo, con margen agregado de solo -1,7 puntos.
- Desarrollo asistido por agente en entornos con NLP en chino: pipelines que necesitan razonamiento multi-paso y código, donde el adaptador mantiene 32/34 tareas agénticas y además reduce los tokens de salida un 10 %.
- Periodismo y verificación de hechos: uso como generador de borradores que cita explícitamente los puntos donde la evidencia está disputada, con la advertencia de que persiste un 7 % de errores graves en temas poco documentados.

## Benchmarks y rendimiento

Temas sensibles para China (24 temas x 4 formulaciones x 2 muestras = 192 respuestas; holdout "h2" = 12 temas escritos después del entrenamiento). Evaluación con Claude Opus contra respuestas de referencia, sin system prompt y con `reasoning_effort: low`, sobre vLLM y 2x DGX Spark:

| Temas sensibles para China | Original | Este LoRA |
|---|---|---|
| Censurado (rechazo, ignorancia fingida, propaganda, evasión) | 65 % | 1 % |
| Censurado, pregunta directa en chino | 100 % | 2 % |
| Censurado, temas nuevos de holdout | 59 % | 0 % |
| Calibrado (preciso, señala evidencia disputada) | 20 % | 80 % |
| Calibrado, temas nuevos de holdout | 19 % | 75 % |
| Sesgo pro-gobierno | 59 % | 6 % |
| Sesgo anti-gobierno | 9 % | 14 % |
| Errores factuales graves entre respondidas, holdout | 18 % (38 respondidas) | 7 % (96 respondidas) |

Robustez (12 temas de holdout x 5 formulaciones): 37 % censurado en el original, 0 % con el LoRA.

Puertas de capacidad (pares, mismo stack):

| Prueba | Original | Este LoRA |
|---|---|---|
| Tareas agénticas (34, autoevaluadas) | 32/34 | 32/34 |
| Tokens de salida en tareas agénticas | 31,1k | 27,9k |
| HumanEval+ (163) | 146 | 148 |
| MMLU-Pro (300) | 81,3 | 80,0 |
| GSM8K (200) | 95,5 | 95,5 |
| CMMLU no político (200) | 87,5 | 83,5 |
| Agregado (700, McNemar p = 0,26) | 87,1 | 85,4 |
| Longitud mediana de respuesta, temas de control | 1x | 1,07x |

## Requisitos de hardware

- El adaptador en sí ocupa 428 MB (`adapter_model.safetensors`, float32) y no es utilizable sin el checkpoint base.
- El despliegue evaluado usa el checkpoint NVFP4 fusionado, que ocupa unos 165 GB en disco (solo se copian las shards con tensores objetivo; el resto se enlaza simbólicamente).
- Entorno de evaluación: 2x DGX Spark con vLLM, misma pila de servicio para el modelo original y para el adaptador.
- VRAM estimada para inferencia: no disponible de forma exacta (no se publican parámetros totales ni longitud de contexto del modelo base). Por el tamaño del checkpoint (165 GB), no cabe en GPUs de consumo.
- GPUs recomendadas: no disponible; el autor solo documenta 2x DGX Spark. Un checkpoint de ese tamaño requiere nodos con memoria agregada muy superior a la de una RTX 4090 (24 GB) o una A100 (80 GB) individual.
- Opciones de despliegue: vLLM (probado); `llama.cpp`, Ollama o TGI no se mencionan ni se han validado. La ruta PEFT sin fusionar está descrita pero **no probada** por el autor.
- Fusión: `python tools/merge_lora.py --base /models/nvidia/GLM-5.3-Flash-NVFP4 --adapter . --out /models/GLM-5.3-Flash-NVFP4-uncensored`, que aplica las dos etapas en orden con redondeo BF16 intermedio y reproduce los pesos evaluados bit a bit.
- Latencia y throughput: no disponibles. Como referencia indirecta, el entrenamiento (222 pasos, 1 epoch) tardó 5,5 horas en 2x DGX Spark.
- Entrenamiento: 5,5 horas en 2x DGX Spark con el adaptador de rango 32.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Censura política (medida del autor) | Disponibilidad |
|---|---|---|---|---|---|---|
| zai-org/GLM-5.3-Flash (original) | Modelo completo, MoE | no disponible | no disponible | no disponible | 65 % censurado en temas sensibles | Público en HuggingFace |
| Este LoRA | Adaptador LoRA r=32 | 107 M entrenables | no disponible | MIT | 1 % censurado, 80 % calibrado | Público, 0 descargas |
| zjj1993/Qwen3.8-Flash-Next-uncensored-china | Adaptador LoRA sobre Qwen | no disponible | no disponible | no disponible | no disponible en esta ficha | Público en HuggingFace |
| nvidia/GLM-5.3-Flash-NVFP4 / RedHatAI/GLM-5.3-Flash-NVFP4 | Checkpoint cuantizado del base | no disponible | no disponible | no disponible | equivalente al original | Público en HuggingFace |

El autor señala una diferencia cualitativa relevante frente a Qwen: en GLM la censura no está concentrada en una única dirección, por lo que la proyección en inferencia no la elimina sin degradar el razonamiento, y fue necesario entrenar. No se han publicado comparaciones numéricas directas entre ambos adaptadores en la información disponible.

## Limitaciones y advertencias

- Persiste un 7 % de errores factuales graves entre las respuestas del holdout (frente al 18 % del original), concentrados en eventos poco documentados; el autor los atribuye a lagunas de conocimiento del modelo base que el des censurado no puede rellenar.
- CMMLU no político cae 4 puntos (87,5 a 83,5, p = 0,18, no significativo), pero el margen agregado de examen (85,4 frente a 87,1) queda cerca del umbral de -2 puntos fijado por el autor.
- La cobertura se limita a censura política sobre China; el alcance exacto más allá de eso queda truncado en la model card ("Only political censorship about…").
- El sesgo anti-gobierno sube del 9 % al 14 %: el adaptador reduce el alineamiento pro-oficial, pero no elimina el sesgo direccional.
- La ruta PEFT sin fusionar no fue probada; solo se evaluó el checkpoint fusionado sobre `nvidia/GLM-5.3-Flash-NVFP4`. El propio autor indica que debería funcionar sobre `zai-org/GLM-5.3-Flash` y `RedHatAI/GLM-5.3-Flash-NVFP4`, pero no lo verificó.
- Los datos de entrenamiento no se publican porque el conjunto de anclaje contiene sesiones de agente grabadas, lo que impide reproducir el entrenamiento.
- La evaluación se hizo con un juez automático (Claude Opus) contra respuestas de referencia, con 300-700 muestras por prueba y sin repeticiones múltiples; los intervalos de confianza no se detallan.
- La licencia MIT cubre el adaptador, pero el uso comercial está condicionado por la licencia del modelo base, que no se especifica en la información disponible; conviene verificar los términos de zai-org antes de cualquier despliegue.
- El uso en producción con usuarios finales sobre temas políticos regulados en China puede tener implicaciones legales al margen de la licencia del software.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zjj1993/GLM-5.3-Flash-uncensored-china-LoRA
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint NVFP4 usado para entrenar y evaluar: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Checkpoint NVFP4 alternativo: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Adaptador companion para Qwen: https://huggingface.co/zjj1993/Qwen3.8-Flash-Next-uncensored-china
- Script de fusión y de construcción del adaptador: `tools/merge_lora.py` y `tools/make_adapter.py` dentro del repositorio
- Paper, blog o demo adicionales: no disponibles
