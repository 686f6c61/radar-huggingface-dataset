# ya9919/YN-421m-rlcd-200k

## Resumen

YN-421m-rlcd-200k es un checkpoint de investigación desarrollado por el usuario ya9919 en el marco del proyecto S²-MAS, un entorno de simulación multiagente a escala de sociedad para estudiar decisiones financieras de hogares. El modelo parte de ya9919/YN-421m-sft-200k y aplica una continuación RLCD (Reinforcement Learning from Contrastive Decisions) sobre 200.000 filas de un conjunto de entrenamiento de decisión financiera, con el objetivo de afinar la política de decisión sobre menús de opciones candidatas. No es un modelo generativo de texto libre: es un encoder con una cabeza de decisión que puntúa opciones completas dado un estado del hogar y una pregunta.

Con 421.293.830 parámetros, el modelo se construye sobre el encoder answerdotai/ModernBERT-large y conserva la cabeza de decisión Laya de dos capas del proyecto original. Su función es responder preguntas de tipo encuesta sobre productos financieros (tarjetas de crédito, cuentas de depósito, cuentas de valores, depósitos a plazo) seleccionando la opción correcta de un menú candidato. La relevancia actual radica en que forma parte de un benchmark comparativo de doce sistemas agrupados en seis rutas de decisión, y en que documenta ganancias marginales pero estadísticamente significativas frente a su modelo padre SFT200.

El modelo se distribuye con licencia S²-MAS Controlled Model Research License v1.2, que restringe el uso a investigación científica no comercial, prohíbe la redistribución y veta la ingeniería inversa, extracción o destilación no autorizadas. El repositorio ocupa 0,8 GB y está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (answerdotai/ModernBERT-large) con cabeza de decisión Laya de dos capas |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (inferencia reportada en BF16 nativo) |
| Idiomas soportados | Inglés (en) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (uso científico no comercial, sin redistribución) |
| Formato de pesos | safetensors |
| Libreria | laya |
| Tamano del repositorio | 0,8 GB |
| Modelo base | ya9919/YN-421m-sft-200k |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large al que se le añade la cabeza de decisión Laya original de dos capas. La inferencia puntúa conjuntamente el estado completo del hogar, la pregunta y el menú completo de opciones candidatas, y produce una decisión sobre ese menú. No genera texto: clasifica opciones dentro de una ruta de "encoder option scoring", una de las seis rutas de decisión que el paper S²-MAS compara.

El entrenamiento consiste en una continuación RLCD desde el checkpoint SFT200 emparejado. Se procesan las mismas 200.000 filas distintas del conjunto de entrenamiento de decisión-QA durante una pasada adicional, alcanzando 400.000 exposiciones acumuladas de filas (200.000 distintas). El método RLCD nativo combina entropía cruzada con un término de gradiente de política basado en proper scoring sobre los logits ruidosos de las opciones. Un conjunto de desarrollo fijo de 20.000 ejemplos selecciona el checkpoint final. El aprendizaje de decisión se apoya en datos de encuestas reales, según indica la model card.

## Capacidades

- Puntuación y selección de opciones en menús candidatos para preguntas de decisión financiera de hogares.
- Clasificación binaria y multiclase dentro de menús definidos (por ejemplo, sí/no sobre uso de tarjetas de crédito, tenencia de cuentas de depósito, cuentas de valores o depósitos a plazo).
- Procesamiento de estado del hogar más pregunta más menú completo de candidatos en una sola pasada de inferencia.
- No soporta generación de texto libre, tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.
- Cero decisiones inválidas reportadas en el conjunto de test común.

## Casos de uso

- Simulación de decisiones financieras de hogares: el modelo puede integrarse en el motor GENESE/MAS para puntuar opciones de productos financieros dado un estado sintético de hogar, alimentando la evaluación de 12 millones de agentes sintéticos bajo condiciones emparejadas.
- Investigación comparativa de rutas de decisión: sirve como checkpoint de referencia en la ruta de encoder option scoring dentro del benchmark de seis rutas, permitiendo comparar RLCD frente a continuación CE y frente a otras rutas.
- Encuestas financieras sintéticas: dado un estado de hogar y una pregunta con menú de opciones, el modelo produce una respuesta clasificada que puede usarse para generar datos sintéticos de encuesta con control de distribución.
- Evaluación de políticas de decisión bajo presupuesto fijo: al ser una adaptación de presupuesto fijo (200.000 filas), permite estudiar cuánto se gana con una pasada adicional de RLCD frente a SFT puro en entornos con datos limitados.
- Análisis de sensibilidad de decisiones de consumo: el modelo puede puntuar menús alternativos para un mismo estado de hogar, lo que permite estudiar cómo cambia la decisión al variar las opciones presentadas.
- Reproducción de experimentos académicos: investigadores que trabajen sobre el paper S²-MAS pueden cargar este checkpoint con la interfaz nativa Laya para replicar las cifras de accuracy y F1 macro por pregunta reportadas.

## Benchmarks y rendimiento

Conjunto de test común retenido: 240.458 registros QA, 119 versiones de pregunta y 8.275 grupos de encuestado/hogar. Inferencia en BF16 nativo.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| Este checkpoint (YN-421m-rlcd-200k) | 73,9268 | 36,0503 | 0 |
| Padre SFT200 | 73,8753 | 35,9949 | 0 |
| Laya nativo original, referencia BF16 emparejada | 60,1972 | 29,5995 | 0 |

Frente a su padre SFT200, el paper reporta +0,0516 puntos de accuracy (IC 95 %: 0,0029–0,1020) y +0,0554 puntos de F1 macro por pregunta (IC 95 %: −0,0380–0,1654). Las diferencias emparejadas usan las predicciones subyacentes antes del redondeo mostrado. La accuracy pondera cada registro por igual y las decisiones inválidas cuentan como incorrectas; el F1 macro por pregunta promedia sobre cada clase candidata definida dentro de cada versión de pregunta y luego pondera las 119 versiones por igual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 421 millones de parámetros en BF16, el peso de los pesos ronda los 0,84 GB, pero la VRAM total depende del tokenizador, la configuración del encoder y el tamaño de lote, datos no publicados.
- GPU recomendadas: no disponible. El modelo se reporta con inferencia en PyTorch BF16 nativo, ejecutable en cualquier GPU compatible con BF16.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: interfaz nativa Laya con la configuración de encoder, tokenizador y cabeza de decisión suministrados. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy test común (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YN-421m-rlcd-200k | 421,3 M | No disponible | 73,9268 | S²-MAS Controlled Research v1.2 | Hugging Face |
| ya9919/YN-421m-sft-200k (padre) | 421,3 M | No disponible | 73,8753 | No disponible | Hugging Face |
| Laya nativo original (referencia BF16 emparejada) | No disponible | No disponible | 60,1972 | No disponible | No disponible |

El benchmark S²-MAS agrupa doce sistemas en seis rutas de decisión, con 17 entradas de repositorio que incluyen diez variantes entrenadas a presupuesto fijo (cinco nativas Laya y cinco Qwen), seis entradas de checkpoint/runtime y un alias de compatibilidad. No se dispone de las cifras individuales del resto de rutas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni admite instrucciones en lenguaje natural fuera del formato de estado, pregunta y menú de opciones.
- Solo inglés; no se reporta soporte multilingüe.
- Entrenado sobre datos de encuestas reales de hogares, con el riesgo de sesgo que ello implica en las decisiones aprendidas; la model card no documenta análisis de sesgo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de decisiones incorrectas o mal calibradas fuera de la distribución de los menús de entrenamiento.
- La ganancia frente al padre SFT200 es marginal (+0,0516 puntos de accuracy) y el intervalo de confianza del F1 macro por pregunta incluye el cero (−0,0380–0,1654), por lo que la mejora en esa métrica no es concluyente.
- Licencia restrictiva: uso científico no comercial, sin redistribución y sin ingeniería inversa, extracción o destilación no autorizadas. No apta para uso comercial sin autorización expresa.
- El motor GENESE/MAS permanece privado, lo que limita la reproducibilidad completa del entorno de simulación.
- Longitud de contexto no publicada; el rendimiento con estados de hogar o menús de opciones muy largos no está documentado.
- El checkpoint se seleccionó sobre un conjunto de desarrollo de 20.000 ejemplos antes del test, sin ajuste posterior sobre el test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-421m-rlcd-200k
- Modelo base SFT200: https://huggingface.co/ya9919/YN-421m-sft-200k
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Licencia: https://huggingface.co/ya9919/YN-421m-rlcd-200k/blob/main/LICENSE
- Ejemplos QA en JSON: https://huggingface.co/ya9919/YN-421m-rlcd-200k/blob/main/qa_examples.json
- Encoder base: https://huggingface.co/answerdotai/ModernBERT-large
