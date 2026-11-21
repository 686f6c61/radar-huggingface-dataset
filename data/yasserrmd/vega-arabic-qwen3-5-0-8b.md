# yasserrmd/vega-arabic-qwen3.5-0.8b

## Resumen

vega-arabic-qwen3.5-0.8b es un modelo de decisión tipada (decision model) construido sobre el lector congelado Qwen3.5-0.8B mediante el framework vegaml. No genera texto libre: responde tres preguntas estructuradas sobre un tuit en árabe en una sola pasada, devolviendo en cada caso una etiqueta o probabilidad calibrada. Las preguntas son sentimiento (positivo, negativo, neutro), sarcasmo (booleano con probabilidad) y dialecto (msa, egyptian, gulf, levantine). Lo desarrolla yasserrmd y se publica bajo licencia Apache-2.0.

El modelo combina un lector transformer de 0,8 mil millones de parámetros (Qwen3.5-0.8B, congelado) con un motor físico de decisión denominado vega-U, que agrega las representaciones del lector y resuelve la respuesta. Sobre esa base se aplicó un LoRA con compuerta de rango 32 que se fusionó en el checkpoint final (`engine.safetensors`), junto con la calibración térmica en `vega_config.json`. El resultado es un único artefacto sin carpeta de adaptadores separada.

Su relevancia práctica es doble: por un lado, demuestra un patrón de despliegue de clasificación multietiqueta con probabilidades calibradas (ECE en torno al 4-6 % en el split completo) sobre un modelo pequeño; por otro, expone con transparencia las limitaciones del etiquetado dialectal del corpus de origen, lo que resulta útil para quien evalúe su uso en producción sobre árabe dialectal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lector transformer Qwen3.5-0.8B congelado + motor de decisión vega-U (LoRA con compuerta fusionado) |
| Parametros totales | 0,8 mil millones en el lector; 835.937 parámetros entrenables en el LoRA y la red de compuerta |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe (ar), con dialectos msa, egyptian, gulf y levantine |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`engine.safetensors`, `port.safetensors`), `stats.npz`, `vega_config.json` |

## Arquitectura y entrenamiento

La arquitectura separa lectura y decisión. El lector es Qwen3.5-0.8B, cuyos pesos permanecen congelados y no se duplican en el repositorio: vegaml los descarga desde el repositorio original de Qwen en la primera carga. Sobre las proyecciones del motor vega-U se entrena un LoRA con compuerta de rango 32 (siete proyecciones más una red de compuerta, 835.937 parámetros entrenables), que después se fusiona como W + (alpha/rank)·B·A. La compuerta entrenada quedó completamente abierta en esta tarea (media 1.000), de modo que la fusión es exacta para estas preguntas. La calibración térmica y los umbrales conformales se ajustaron sobre el split de validación.

Los datos de entrenamiento proceden de ArSarcasm-v2 (MIT), 15.548 tuits, con un preprocesado específico: eliminación de URL, sustitución de menciones por `@user`, conversión de guiones bajos de hashtags en espacios, limitación de la elongación de letras a 3 y eliminación de tatweel, conservando emojis. Se descartaron 241 duplicados de entrenamiento con etiquetas en conflicto y 7 tuits que también aparecían en el test. El dialecto magrebí (43 tuits) no tiene etiqueta de dialecto, aunque sí entrena sentimiento y sarcasmo. A 47 tuits etiquetados como MSA que contenían dos o más marcadores de golfo, egipcio o levantino se les retiró la etiqueta de dialecto (sin reetiquetar). Se reservó un 10 % estratificado para validación, usado solo para calibración. Durante el entrenamiento se añadieron negativos de compuerta: enunciados ar-SA de MASSIVE y titulares ingleses de ag_news, cada uno con una pregunta no relacionada. El entrenamiento usó entropía cruzada con balanceo de clases (frecuencia inversa de raíz cuadrada), 6 épocas, AdamW con schedule one-cycle y lr 3e-4 sobre una sola A100.

## Capacidades

- Clasificación de sentimiento en árabe con tres clases: positive, negative, neutral.
- Detección de sarcasmo como probabilidad booleana calibrada, con umbral ajustable por el usuario.
- Identificación de dialecto entre msa, egyptian, gulf y levantine.
- Respuesta a las tres preguntas en una sola lectura del texto.
- Salida con probabilidad calibrada por respuesta (calibración térmica y umbrales conformales).
- No genera texto libre: es un modelo de decisión tipada, no un modelo generativo de uso general.
- Soporte de preguntas tipadas adicionales mediante `arabic_questions.json`; para tareas no relacionadas se recomienda el motor vega-U estándar.
- Sin soporte documentado de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Moderación y análisis de sentimiento en redes sociales árabes: el modelo clasifica tuits en positivo, negativo o neutro con probabilidad calibrada, lo que permite fijar umbrales de revisión humana según el coste del error.
- Monitorización de reputación de marca en dialecto del golfo: aunque la precisión dialectal es limitada, el sentimiento en la porción gulf alcanza 0,583 de accuracy y 0,543 de macro-F1, suficiente para señales de alerta temprana.
- Detección de sarcasmo en encuestas y opinión pública: la probabilidad de sarcasmo (accuracy 0,717 y macro-F1 0,680 en el split completo) permite filtrar reseñas o comentarios irónicos antes de un análisis de sentimiento más profundo.
- Enrutamiento por dialecto en atención al cliente: la etiqueta de dialecto puede usarse como señal débil para dirigir conversaciones a agentes o plantillas específicas, siempre con revisión humana dado el ruido del etiquetado de origen.
- Investigación en lingüística computacional árabe: el modelo sirve como línea base reproducible sobre ArSarcasm-v2 con métricas de calibración (ECE) publicadas, útil para comparar nuevas aproximaciones.
- Clasificación por lotes en pipelines de bajo coste: al apoyarse en un lector de 0,8 B y requerir solo inferencia de decisión, encaja en entornos con GPU modesta para procesar grandes volúmenes de tuits.
- Filtrado previo en sistemas de análisis de opinión: usar la salida de sarcasmo y dialecto como características de entrada para un clasificador posterior de mayor tamaño.

## Benchmarks y rendimiento

Split de test oficial de ArSarcasm-v2 (2.988 tuits). Base = motor vega-U zero-shot con el mismo lector y preguntas. ECE = error de calibración esperado (menor es mejor).

| Pregunta | n | Base acc | Base macro-F1 | Base ECE % | Fusionado acc | Fusionado macro-F1 | Fusionado ECE % |
|---|---|---|---|---|---|---|---|
| sentiment | 2988 | 0,309 | 0,281 | 33,31 | 0,648 | 0,585 | 4,34 |
| sarcasm | 2988 | 0,725 | 0,420 | 2,57 | 0,717 | 0,680 | 5,23 |
| dialect | 2986 | 0,771 | 0,221 | 19,09 | 0,583 | 0,334 | 5,59 |

Porción de dialecto del golfo del split de test (319 tuits):

| Pregunta | n | Base acc | Base macro-F1 | Base ECE % | Fusionado acc | Fusionado macro-F1 | Fusionado ECE % |
|---|---|---|---|---|---|---|---|
| sentiment | 319 | 0,370 | 0,280 | 28,86 | 0,583 | 0,543 | 5,36 |
| sarcasm | 319 | 0,821 | 0,451 | 11,31 | 0,762 | 0,688 | 5,89 |
| dialect | 319 | 0,006 | 0,006 | 56,06 | 0,191 | 0,080 | 30,62 |

La accuracy de dialecto puede caer por debajo de la base en el conjunto completo porque el motor base etiqueta casi todo como MSA (77 % del test), lo que infla la accuracy y hunde el macro-F1; el macro-F1 es la métrica más justa para dialecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un lector de 0,8 B y pesos en safetensors, la huella es reducida y cabe previsiblemente en GPU de consumo, aunque el dato no está publicado.
- GPU recomendadas: el entrenamiento se realizó en una única A100; para inferencia no se especifican modelos concretos.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: la librería vegaml (carga mediante `vega.load` y descarga del lector desde Hugging Face); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vega-arabic-qwen3.5-0.8b | 0,8 B (lector) + 835.937 entrenables | no disponible | Clasificación tipada árabe (sentimiento, sarcasmo, dialecto) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | Generación de texto general | no disponible | Hugging Face |
| nandakishorm/vega-U | no disponible | no disponible | Motor de decisión tipada genérico | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre tuits de SemEval, ASTD y DAICT: se espera menor precisión en documentos largos, cartas formales o texto que no sea de Twitter.
- Golfo y levantino representan cada uno en torno al 5 % de los datos de entrenamiento; el árabe emiratí no se separa de otras variedades del golfo.
- Las etiquetas de dialecto del corpus de origen son ruidosas: 60 etiquetas MSA del test parecen coloquiales según la regla aplicada, lo que limita la accuracy alcanzable. Tratar las puntuaciones de dialecto como cota inferior.
- El sarcasmo es difícil incluso para personas: conviene elegir un umbral propio sobre la probabilidad.
- No genera texto: no debe emplearse para tareas generativas, resumen ni diálogo.
- Para tareas de decisión no relacionadas debe usarse el motor vega-U estándar, ya que el ajuste fusionado se aplica a cualquier pregunta.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente fuera de la distribución de tuits de entrenamiento.
- Sesgos conocidos: no documentados explícitamente en la información disponible, más allá del sesgo hacia MSA del motor base y del desbalance de dialectos.
- Licencia Apache-2.0: permite uso comercial, pero debe respetarse la atribución a vegaml, vega-U, Qwen3.5-0.8B y ArSarcasm-v2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/vega-arabic-qwen3.5-0.8b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Motor vega-U estándar: https://huggingface.co/nandakishorm/vega-U
- Repositorio vegaml: https://github.com/NandhaKishorM/vegaml
- Dataset ArSarcasm-v2: https://github.com/iabufarha/ArSarcasm-v2
