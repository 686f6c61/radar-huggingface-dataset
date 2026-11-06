# vineet88/hingbert-toxicity-finetuned

## Resumen

HingBERT-toxicity-finetuned es un modelo de clasificación de texto multietiqueta especializado en detección de toxicidad y moderación de contenido en entornos digitales indios. Lo desarrolla el usuario independiente vineet88 y se construye mediante fine-tuning supervisado sobre el checkpoint base `l3cube-pune/hing-roberta-mixed`, un modelo de la familia XLM-RoBERTa adaptado a hindi e hinglish (hindi romanizado). El problema que aborda es concreto: los sistemas genéricos de moderación fallan ante texto code-mixed, donde una misma frase mezcla inglés, hindi en devanagari y hinglish en caracteres latinos, y donde las clases tóxicas raras (amenazas, toxicidad severa) aparecen con frecuencias inferiores al 0,03%.

El modelo tiene 278.048.262 parámetros totales y se distribuye en formato safetensors con licencia MIT, lo que permite uso comercial sin restricciones adicionales. Se publica como pipeline `text-classification` dentro de la librería transformers y es compatible con text-embeddings-inference y endpoints de Hugging Face. Con 65 descargas y sin likes en el momento de la consulta, es un artefacto de nicho orientado a un caso de uso muy específico: pipelines de moderación para plataformas de chat, foros y comunidades con audiencia india.

Su relevancia actual radica en la combinación de tres decisiones de ingeniería documentadas por el autor: remuestreo estratificado multietiqueta para preservar muestras positivas raras, una función de pérdida focal multietiqueta ponderada con gamma=2.0 para combatir el ruido de negativos fáciles, y optimización dinámica de umbrales de decisión por clase basada en curvas precision-recall. El autor reporta 94,82% de ROC-AUC en validación y una mejora de +4,77% en Macro F1 gracias a la calibración de umbrales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa adaptado a hinglish, base `l3cube-pune/hing-roberta-mixed`) con cabeza de clasificación multietiqueta de 6 etiquetas |
| Parametros totales | 278.048.262 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones INT8/INT4) |
| Idiomas soportados | en, hi (incluye hindi en devanagari e hinglish romanizado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia RoBERTa/XLM-RoBERTa, inicializado desde `l3cube-pune/hing-roberta-mixed`, con una cabeza `AutoModelForSequenceClassification` configurada para 6 etiquetas de toxicidad en modo multietiqueta (una misma entrada puede activar varias etiquetas simultáneamente). El entrenamiento se realizó con precisión mixta FP16 y el autor indica un requisito de aproximadamente 6 GB de VRAM para el proceso de fine-tuning, lo que sitúa el entrenamiento en el rango de GPUs de consumo.

El dataset curado consta de 37.638 filas, con 30.110 muestras de entrenamiento, derivadas de fuentes como Jigsaw Toxic Comment y subconjuntos multilingües. La innovación principal está en el tratamiento del desbalanceo extremo: se aplicó `MultilabelStratifiedKFold` de la librería iterstrat junto con un algoritmo determinista de rescate de muestras positivas raras, garantizando que etiquetas como `threat` o `severe_toxic` (menos de 10 positivos en 30.000 filas, por debajo del 0,03%) aparezcan en los splits de train (80%), validación (10%) y test (10%). La función de pérdida es una `WeightedMultiLabelFocalLoss` personalizada con gamma=2.0 y pesos positivos por clase, que reduce la contribución de gradiente de los negativos fáciles en más del 99%. El entrenamiento se extendió 3 épocas, con descenso de pérdida de entrenamiento de 0,2485 a 0,1181 y ROC-AUC de validación de 0,9366 a 0,9482. Posteriormente se aplicó una optimización de umbrales por clase sobre curvas precision-recall, generando un incremento de +4,77% en Macro F1 sin reentrenar pesos.

## Capacidades

- Clasificación multietiqueta de toxicidad con 6 etiquetas simultáneas por entrada (el autor no detalla los nombres exactos de las 6 etiquetas en la información disponible).
- Detección de toxicidad en texto code-mixed inglés-hindi, incluyendo hinglish romanizado y hindi en devanagari.
- Moderación de contenido en streams de chat multilingües con mezcla de alfabetos en una misma conversación.
- Calibración por clase: umbrales de decisión independientes por etiqueta, optimizados sobre curvas precision-recall.
- Robustez ante desbalanceo extremo de clases raras (amenazas, toxicidad severa) gracias al rescate de positivos y a la pérdida focal.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face para despliegue como servicio.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo thinking: es un modelo exclusivamente discriminativo de clasificación.

## Casos de uso

- Moderación de chat en vivo para comunidades indias: el modelo clasifica cada mensaje entrante en inglés, devanagari o hinglish y activa las etiquetas de toxicidad correspondientes, permitiendo filtrado automático o revisión humana priorizada. Su entrenamiento específico en code-mixed lo hace adecuado donde los moderadores genéricos fallan por cambio de alfabeto.
- Filtrado de comentarios en foros y redes sociales: integrado como paso previo a la publicación, detecta amenazas y toxicidad severa antes de que el contenido sea visible, con umbrales calibrados por clase para reducir falsos negativos en las categorías más sensibles.
- Priorización de colas de revisión humana: las puntuaciones multietiqueta permiten ordenar la cola de moderadores por severidad y tipo de infracción, en lugar de un único score binario, optimizando el esfuerzo del equipo de confianza y seguridad.
- Monitorización de comunidades de gaming y streaming: el hinglish es predominante en chats de partidas y directos; el modelo puede procesar esos mensajes con la misma tubería que el texto en devanagari sin preprocesado de transliteración.
- Detección de acoso en plataformas educativas o de soporte: conversaciones multi-turno donde el usuario alterna inglés e hindi pueden clasificarse mensaje a mensaje para escalar casos de acoso o amenazas a un canal de revisión dedicado.
- Investigación sobre sesgos y toxicidad en code-mixed: el modelo sirve como baseline etiquetado para estudiar cómo se distribuye la toxicidad entre alfabetos y registros lingüísticos en corpus indios, gracias a su licencia MIT y a su naturaleza discriminativa reproducible.
- Enriquecimiento de datasets de moderación: uso como etiquetador automático para preanotar grandes volúmenes de chat y reducir el coste de anotación humana antes de un fine-tuning posterior.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (validación y test sobre el dataset curado):

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 (final) |
|---|---|---|---|
| Training loss | 0,2485 | 0,1550 | 0,1181 |
| Validation loss | 0,2055 | 0,1783 | 0,1992 |
| ROC-AUC | 0,9366 | 0,9470 | 0,9482 |

| Metrica adicional | Valor reportado |
|---|---|
| ROC-AUC global | superior al 94,8% |
| Precision en escenarios de benchmark del autor | 100% (según la model card) |
| Mejora de Macro F1 por optimización de umbrales | +4,77% sobre datos no vistos |
| Muestras de entrenamiento | 30.110 |
| Tamaño total del dataset curado | 37.638 filas |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni con modelos de moderación de terceros en la información disponible. Las cifras de precisión del 100% corresponden a escenarios de benchmark definidos por el propio autor y no deben interpretarse como rendimiento universal.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB para los pesos (278 M de parámetros a 2 bytes), con overhead adicional de activaciones y tokenizador; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM para fine-tuning: el autor indica aproximadamente 6 GB con FP16 y mixed precision.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Para inferencia en CPU es viable con latencias mayores.
- Cabe en GPU de consumo: sí, en toda la gama media y alta actual (RTX 3060 en adelante) e incluso en GPUs de portátil con 6 GB.
- Opciones de despliegue: transformers con pipeline de text-classification, text-embeddings-inference, endpoints de Hugging Face, y servidores de inferencia compatibles con safetensors. No se documentan artefactos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 278 M de parámetros, se espera un throughput alto en lote, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| vineet88/hingbert-toxicity-finetuned | 278 M | no disponible | en, hi (hinglish) | MIT | Clasificación multietiqueta de toxicidad code-mixed |
| l3cube-pune/hing-roberta-mixed | no disponible | no disponible | en, hi (hinglish) | no disponible | Modelo base encoder para hinglish, sin cabeza de toxicidad |
| Modelos de toxicidad basados en BERT inglés (p. ej. variantes de Jigsaw) | variable | 512 típicamente | en | variable | Clasificación de toxicidad monolingüe, sin soporte nativo de devanagari ni hinglish |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada. La ventaja diferencial del modelo frente a clasificadores monolingües es el soporte nativo de texto code-mixed indio; su limitación frente al modelo base es que solo sirve para la tarea de toxicidad y no para generación ni embeddings generales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente por el autor; al entrenarse sobre Jigsaw y subconjuntos multilingües, puede heredar sesgos de anotación de esas fuentes y sobrerrepresentar ciertos registros lingüísticos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, especialmente en sarcasmo, ironía y jerga emergente no presente en el entrenamiento.
- La cifra de 100% de precisión corresponde a escenarios de benchmark definidos por el autor y no debe extrapolarse a producción sin validación propia.
- Limitaciones de contexto: la longitud máxima de secuencia no está documentada en la información disponible; el modelo base XLM-RoBERTa suele limitarse a 512 tokens, pero no se confirma.
- Cobertura lingüística limitada a en, hi e hinglish; no se garantiza comportamiento en otras lenguas indias ni en code-mixing con alfabetos distintos.
- El modelo es exclusivamente discriminativo: no genera texto, no soporta tool calling ni agentes.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad por decisiones de moderación automatizadas.
- En producción, los umbrales calibrados por el autor deben revalidarse sobre la distribución real de cada plataforma; un umbral estático de 0,50 no es adecuado para clases raras.
- Con 65 descargas y sin likes, la comunidad de validación es mínima; conviene tratar el modelo como artefacto experimental antes de integrarlo en sistemas críticos.

## Enlaces

- Hugging Face: https://huggingface.co/vineet88/hingbert-toxicity-finetuned
- Modelo base: https://huggingface.co/l3cube-pune/hing-roberta-mixed
- Librería iterstrat (MultilabelStratifiedKFold): https://github.com/trent-b/iterative-stratification
- Dataset Jigsaw Toxic Comment (referencia citada por el autor): https://www.kaggle.com/c/jigsaw-toxic-comment-classification-challenge
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
