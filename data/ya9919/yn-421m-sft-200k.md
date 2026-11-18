# ya9919/YN-421m-sft-200k

## Resumen

YN-421m-sft-200k es un checkpoint de investigación publicado por el usuario ya9919 en Hugging Face, derivado del modelo base convaiinnovations/laya mediante ajuste supervisado (SFT) sobre 200.000 filas de un conjunto de decisión financiera. No es un modelo generativo de propósito general: se trata de un encoder con una cabeza de decisión (decision head) de dos capas que puntúa opciones candidatas ante una pregunta de finanzas domésticas, recibiendo como entrada el estado del hogar, la pregunta y el menú completo de respuestas posibles. Forma parte del marco S²-MAS, una infraestructura de simulación multiagente a escala social para estudiar decisiones de consumo, reservas de efectivo y pagos de 12 millones de hogares sintéticos.

El modelo tiene 421.293.830 parámetros y un repositorio de 0,8 GB en safetensors, con pesos en BF16 nativo. Su encoder subyacente es answerdotai/ModernBERT-large, sobre el que se conserva la cabeza de decisión original de Laya. La relevancia actual del checkpoint es metodológica: sirve como referencia de la ruta "encoder option scoring" dentro de un benchmark que compara seis rutas de decisión distintas, y actúa como padre común de las comparaciones emparejadas RLCD200 y CE-continuation del paper.

La licencia es restrictiva (S²-MAS Controlled Model Research License v1.2): solo uso científico no comercial, sin redistribución ni extracción. El modelo está entrenado y evaluado únicamente en inglés, aunque las preguntas del conjunto de test proceden de encuestas reales sobre finanzas domésticas en China (cuentas en renminbi), lo que introduce una disociación entre idioma de entrenamiento y dominio cultural de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) con cabeza de decisión de dos capas |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia reportada en BF16 nativo PyTorch) |
| Idiomas soportados | en (inglés) |
| Licencia | s2-mas-controlled-research-v1.2 (uso científico no comercial, sin redistribución) |
| Formato de pesos | safetensors |
| Modelo base | convaiinnovations/laya |
| Encoder subyacente | answerdotai/ModernBERT-large |
| Libreria | laya |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT-large con una cabeza de decisión de dos capas heredada de Laya. A diferencia de un modelo de lenguaje causal, el modelo no genera texto: recibe el estado completo del hogar, la pregunta y el menú íntegro de candidatos, y produce una puntuación por opción. La inferencia se realiza con la interfaz nativa de Laya usando la configuración de encoder, el tokenizador y la cabeza de decisión suministrados.

El entrenamiento consistió en SFT sobre 200.000 filas distintas de la partición de entrenamiento de decisión-QA, inicializando desde el checkpoint oficial convaiinnovations/laya ya entrenado en la tarea. El checkpoint se seleccionó con un conjunto de desarrollo fijo de 20.000 ejemplos, sin exposición adicional a filas más allá de las 200.000. No se reporta uso de RLHF ni DPO en esta etapa; el paper menciona comparaciones emparejadas con RLCD200 y CE-continuation, pero este checkpoint concreto es la referencia SFT pura. El aprendizaje de decisiones se apoya en datos de encuestas reales, aunque los registros de entrenamiento y evaluación no se distribuyen.

## Capacidades

- Puntuación de opciones en preguntas de elección financiera doméstica (sí/no y menús de candidatos múltiples).
- Clasificación de decisiones a partir de estado del hogar más pregunta más menú completo de respuestas.
- Manejo de 119 versiones de pregunta distintas dentro del conjunto de test común.
- Inferencia determinista con cero decisiones inválidas reportadas en el test común.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo puntúa opciones, no ejecuta planes).
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: cabecera de decisión entrenada específicamente para el benchmark S²-MAS; no dispone de modo thinking, visión ni audio.

## Casos de uso

- Simulación de decisiones de hogares a escala: el modelo puntúa opciones de consumo, tenencia de cuentas y pagos para agentes sintéticos dentro del motor GENESE/MAS, alimentando la evaluación de 12 millones de hogares emparejados del paper.
- Benchmark de rutas de decisión: sirve como referencia fija de la ruta "encoder option scoring" frente a modelos con cabeza de decisión aprendida, SFT de siguiente token, clasificación de esquema dinámico y decisiones multimodales.
- Investigación sobre brecha de adaptación con presupuesto fijo: al ser el padre común de RLCD200 y CE-continuation, permite aislar el efecto de métodos posteriores sobre las mismas 200.000 filas.
- Evaluación de encuestas financieras asistidas: dado un estado de hogar y una pregunta tipo encuesta (titularidad de tarjeta de crédito, cuenta a la vista, cuenta de valores, depósitos a plazo), el modelo devuelve la opción más probable.
- Estudio de robustez entre versiones de pregunta: sus 119 versiones de pregunta en test permiten medir la sensibilidad del modelo a reformulaciones sin cambiar el dominio.
- Línea base académica para modelos de decisión financiera: cualquier método nuevo puede compararse contra este checkpoint con la misma partición de test de 240.458 registros y las mismas métricas de accuracy y F1 macro por pregunta.
- Análisis de calibración en decisiones binarias: con cero decisiones inválidas, es útil como referencia limpia para estudiar la distribución de puntuaciones por clase.

## Benchmarks y rendimiento

Conjunto de test común: 240.458 registros QA, 119 versiones de pregunta, 8.275 grupos de hogar/encuestado. Inferencia en BF16 nativo.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones invalidas |
|---|---:|---:|---:|
| Este checkpoint | 73,8753 | 35,9949 | 0 |
| Laya nativo original, referencia BF16 emparejada | 60,1972 | 29,5995 | 0 |

Mejora relativa reportada en el paper frente a la referencia nativa: +13,6781 puntos de accuracy (IC 95 %: 13,4662–13,8857) y +6,3953 puntos de F1 macro por pregunta (IC 95 %: 5,9603–6,9003). La accuracy pondera por igual cada registro; las decisiones inválidas cuentan como incorrectas. El F1 macro promedia sobre cada clase candidata definida dentro de cada versión de pregunta y luego pondera las 119 versiones por igual.

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 0,85 GB solo para pesos (421 M de parámetros × 2 bytes), más activaciones y el estado del encoder; en la práctica, menos de 2 GB en BF16 para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para evaluación a gran escala sobre 240.458 registros conviene una A100 o H100 por throughput de lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: interfaz nativa de Laya con la configuración de encoder, tokenizador y cabeza de decisión suministrados. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo causal, estos motores no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Accuracy test común | Licencia |
|---|---|---:|---|---:|---|
| YN-421m-sft-200k (este) | 421 M | no disponible | Puntuación de opciones financieras | 73,88 % | S²-MAS v1.2 (no comercial) |
| Laya nativo (convaiinnovations/laya) | no disponible | no disponible | Puntuación de opciones financieras | 60,20 % | no disponible |
| Variantes Qwen del benchmark S²-MAS | no disponible | no disponible | Decisión financiera (5 variantes) | no disponible | no disponible |
| RLCD200 / CE-continuation (derivados de este) | 421 M | no disponible | Puntuación de opciones financieras | no disponible en esta ficha | S²-MAS v1.2 |

La comparación principal disponible es contra el Laya nativo, con una mejora de +13,68 puntos de accuracy. Las variantes Qwen y los derivados RLCD200 y CE-continuation forman parte del mismo benchmark de 17 entradas, pero sus resultados numéricos no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena sobre datos de encuestas reales de hogares, por lo que hereda los sesgos de representatividad de esas encuestas; no se documenta un análisis de sesgo específico.
- Riesgo de alucinación: bajo en el sentido generativo (no produce texto libre), pero puede asignar alta probabilidad a opciones incorrectas en estados de hogar atípicos; el F1 macro por pregunta de 35,99 % indica un rendimiento desigual entre versiones de pregunta.
- Limitaciones de contexto e idioma: solo inglés, sin longitud de contexto documentada; las preguntas del test proceden de encuestas con cuentas en renminbi, lo que puede generar desajuste cultural si se aplica a otros mercados.
- Restricciones de licencia: uso exclusivamente científico no comercial; prohibida la redistribución, la ingeniería inversa no autorizada, la extracción y la destilación. Los registros de entrenamiento y evaluación no se distribuyen y el acceso a datos fuente requiere autorización del proveedor.
- Caveats para producción: no es un modelo de lenguaje; requiere la interfaz nativa de Laya y el estado del hogar como entrada. No se documentan cuantizaciones ni soporte en motores de inferencia estándar, lo que complica su despliegue fuera del stack de investigación.
- El motor GENESE/MAS es privado, por lo que la reproducibilidad completa del pipeline de simulación no está garantizada.
- Fecha de creación del repositorio: 2026-10-19; última actualización: 2026-11-18. Solo 52 descargas y 0 likes, lo que indica escasa validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-421m-sft-200k
- Licencia: https://huggingface.co/ya9919/YN-421m-sft-200k/blob/main/LICENSE
- Ejemplos QA en JSON: https://huggingface.co/ya9919/YN-421m-sft-200k/blob/main/qa_examples.json
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Encoder subyacente ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Contacto para permisos: yli9919@hku.hk
