# ya9919/laya-finance-matched-sft-50k

## Resumen

laya-finance-matched-sft-50k es un checkpoint de ajuste supervisado (SFT) sobre el modelo base convaiinnovations/laya, publicado por el usuario ya9919 en el marco del proyecto S²-MAS, un framework de simulación multiagente a escala social orientado a estudiar decisiones de consumo, reservas de efectivo y pagos en hogares sintéticos. El modelo no es un generador de texto conversacional: es un encoder con una cabeza de decisión (decision head) de dos capas que puntúa opciones candidatas de un menú de respuestas financieras a partir de un estado de hogar y una pregunta, siguiendo la ruta de "encoder option scoring" descrita en el paper del proyecto.

El checkpoint se entrena sobre 50.000 filas distintas de un conjunto de QA financiero de decisión, partiendo del checkpoint oficial de Laya, y se selecciona con un conjunto de desarrollo fijo de 20.000 ejemplos. Su relevancia es metodológica: sirve como referencia de adaptación con presupuesto fijo (50k) dentro de una comparativa más amplia de rutas de modelado de decisión, y reporta una mejora medible frente al Laya nativo en el test común de 240.458 registros de QA.

Con 421.293.830 parámetros y un repo de 0,8 GB, es un modelo pequeño y ligero en comparación con LLM generativos, pero su licencia es de investigación controlada, no comercial y sin redistribución, lo que restringe fuertemente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large (answerdotai/ModernBERT-large) con cabeza de decisión Laya de dos capas (option scoring) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (inferencia reportada en BF16 nativo) |
| Idiomas soportados | Inglés (en) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (s2-mas-controlled-research-v1.2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya, que a su vez se construye sobre el encoder ModernBERT-large y conserva la cabeza de decisión original de dos capas de Laya. La inferencia puntúa conjuntamente el estado completo del hogar, la pregunta y el menú completo de candidatos, produciendo una puntuación por opción en lugar de generar texto libre. El checkpoint incluye el encoder ajustado completo y la cabeza de decisión nativa.

El entrenamiento es SFT supervisado sobre 50.000 filas distintas de la partición de entrenamiento de decision-QA, con 50.000 exposiciones totales y 50.000 exposiciones acumuladas de filas distintas en la etapa seleccionada. La selección del checkpoint se realiza con un conjunto de desarrollo fijo de 20.000 ejemplos antes de evaluar en el test común. Según la model card, el aprendizaje de decisiones utiliza datos de encuestas reales, aunque los registros de entrenamiento y evaluación no se distribuyen. No se documentan en la información disponible detalles sobre composición exacta del dataset, uso de RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- Puntuación de opciones en menús de respuesta de elección múltiple para preguntas financieras de hogar (por ejemplo, uso de tarjetas de crédito, cuentas de depósito a la vista, cuentas de valores, depósitos a plazo no vencidos).
- Clasificación de decisiones a partir de un estado de hogar y una pregunta, con menú completo de candidatos.
- Salida determinista por opción con recuento de decisiones inválidas controlado (0 en el test reportado).
- Soporte multilingüe limitado al inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- No es un modelo generativo de texto libre: su interfaz es la puntuación de opciones, no la generación de respuestas abiertas.

## Casos de uso

- Evaluación comparativa de rutas de modelado de decisión: el checkpoint sirve como referencia de adaptación SFT con presupuesto de 50k dentro del benchmark de S²-MAS, permitiendo comparar la ruta de encoder option scoring frente a LLM con cabezas de decisión, SFT de siguiente token, clasificación de esquema dinámico, encoders multimodales e interfaces de proveedor.
- Investigación sobre simulación de hogares sintéticos: se puede emplear para puntuar decisiones de consumo y pagos en agentes de hogar sintéticos dentro del motor de transición de estados del proyecto, siempre que se disponga del estado del hogar como entrada.
- Estudio de robustez ante versiones de pregunta: con 119 versiones de pregunta en el test común, el modelo permite analizar cómo varía la decisión ante reformulaciones de la misma cuestión financiera.
- Análisis de sesgo y calibración en encuestas financieras: al puntuar opciones sobre datos de encuesta real, permite estudiar discrepancias entre decisiones simuladas y respuestas registradas por grupo de encuestado/hogar.
- Prototipado de encuestas automatizadas en investigación académica: para generar decisiones sintéticas de hogares en estudios de demanda de productos financieros, con la limitación de licencia no comercial.
- Reproducción de resultados del paper: permite reproducir la comparación de adaptación con presupuesto fijo reportada en S²-MAS, incluyendo la selección de checkpoint con el conjunto de desarrollo de 20.000 ejemplos.

## Benchmarks y rendimiento

Test común de 240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de encuestado/hogar, con inferencia en BF16 nativo:

| Checkpoint / referencia | Accuracy (%) | Question-macro F1 (%) | Decisiones inválidas |
|---|---:|---:|---:|
| Este checkpoint | 72,6942 | 34,8511 | 0 |
| Laya nativo original, referencia BF16 emparejada | 60,1972 | 29,5995 | 0 |

El paper reporta una mejora relativa al Laya nativo de +12,4970 puntos de accuracy (IC 95 %: 12,2933–12,7005) y +5,2516 puntos de question-macro F1 (IC 95 %: 4,8365–5,7448). La accuracy pondera cada registro por igual y cuenta las decisiones inválidas como incorrectas; el question-macro F1 promedia sobre cada clase candidata definida dentro de cada versión de pregunta y pondera las 119 versiones por igual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421 millones de parámetros en BF16, el peso de los parámetros ronda los 0,84 GB, por lo que la huella es muy reducida y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, por el tamaño del modelo; no se documentan requisitos oficiales.
- Opciones de despliegue: se indica el uso de la interfaz de inferencia nativa de Laya con la configuración de encoder, tokenizer y cabeza de decisión suministrados. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La model card sitúa este checkpoint dentro de un benchmark de doce sistemas agrupados en seis rutas de modelado de decisión, con 17 entradas de repositorio que incluyen 10 variantes entrenadas con presupuesto fijo (cinco nativas de Laya y cinco de Qwen), seis entradas de checkpoint/runtime y un alias de compatibilidad. No se proporcionan en la información disponible los resultados individuales de esas variantes, por lo que la comparativa numérica con alternativas concretas no está disponible.

| Modelo | Parámetros | Contexto | Accuracy test común | Licencia |
|---|---|---|---|---|
| laya-finance-matched-sft-50k | 421.293.830 | No disponible | 72,6942 % | S²-MAS v1.2 (no comercial) |
| Laya nativo (convaiinnovations/laya) | No disponible | No disponible | 60,1972 % | No disponible |
| Variantes Qwen del benchmark (5) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia S²-MAS Controlled Model Research License v1.2: uso científico no comercial, sin redistribución y sin ingeniería inversa, extracción o destilación no autorizadas. El uso comercial está restringido.
- Los registros de entrenamiento y evaluación no se distribuyen; el acceso a los datos de origen requiere autorización del proveedor.
- El modelo solo soporta inglés, lo que limita su aplicación en entornos en castellano u otros idiomas sin adaptación.
- Es un modelo de puntuación de opciones, no un generador de texto: no puede usarse como chatbot ni para respuesta abierta.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de decisiones incorrectas o mal calibradas en estados de hogar fuera de la distribución de entrenamiento.
- La selección de checkpoint se hizo con un conjunto de desarrollo de 20.000 ejemplos; el rendimiento en dominios financieros distintos al de encuesta de hogar no está documentado.
- No se documentan sesgos conocidos ni análisis de subgrupos en la información disponible.
- La implementación del motor GENESE/MAS permanece privada, lo que limita la reproducibilidad completa del entorno de simulación.
- El modelo tiene 53 descargas y 0 likes en el momento de la ficha, con lo que la validación comunitaria es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/laya-finance-matched-sft-50k
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Licencia: https://huggingface.co/ya9919/laya-finance-matched-sft-50k/blob/main/LICENSE
- Ejemplos de QA: https://huggingface.co/ya9919/laya-finance-matched-sft-50k/blob/main/qa_examples.json
- Encoder base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
