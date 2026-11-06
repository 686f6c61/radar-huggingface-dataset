# Supreetpatil79/shoplifting-models

## Resumen

ShopLifting scam-message models es una colección de dos modelos de clasificación de texto publicada por el usuario Supreetpatil79 en Hugging Face, pensada para puntuar mensajes de SMS, WhatsApp y Telegram según su probabilidad de ser estafa. El repositorio contiene dos variantes: `teacher-best/`, un ajuste fino de `google/muril-large-cased` que actúa como modelo de servidor, y `student-best/`, un modelo más pequeño que se ejecuta en paralelo para comparación. Ambos se entrenaron exclusivamente con conjuntos de datos públicos de mensajes fraudulentos y legítimos, sin mensajes de usuarios reales.

El modelo se apoya en MuRIL-large-cased, un transformer encoder multilingüe de Google diseñado específicamente para inglés e idiomas de la India (incluidos hindi y kannada), lo que explica los tres idiomas declarados en la model card. La tarea es clasificación de texto binaria o de puntuación de riesgo, no generación: el modelo no produce texto libre ni razona de forma multi-paso.

La relevancia actual del proyecto es limitada y hay que enmarcarla con cautela: se trata de modelos provisionales, con cero descargas y cero likes en el momento de la consulta, cuya propia model card advierte que las puntuaciones describen datos públicos y no tráfico real indio. Es, por tanto, un artefacto de investigación o demo de un Space concreto (ShopLifting), no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tune de `google/muril-large-cased` para el modelo teacher; arquitectura del student no disponible) |
| Parametros totales | No disponible (MuRIL-large-cased tiene aproximadamente 560 M, pero el dato exacto de los fine-tunes no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en), hindi (hi), kannada (kn) |
| Licencia | Other (sin términos detallados en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo principal (`teacher-best/`) es un ajuste fino de `google/muril-large-cased`, un transformer encoder basado en BERT-large entrenado por Google con datos de 17 idiomas indios y transliteraciones, lo que le da cobertura nativa de hindi y kannada además del inglés. Al ser un encoder de clasificación, la salida es una puntuación de riesgo o una etiqueta por mensaje, no texto generado. El segundo modelo (`student-best/`) es una variante más pequeña, presumiblemente destilada del teacher, que se ejecuta en paralelo para comparar resultados; su arquitectura base concreta no se especifica.

El entrenamiento se realizó únicamente con conjuntos de datos públicos de mensajes fraudulentos y genuinos, sin datos de usuarios reales. No se documentan en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo RLHF, DPO u otras técnicas de alineación (poco habituales en clasificación). Los umbrales de decisión y los detalles de entrenamiento se encuentran en el archivo `scamguard.json` de cada carpeta. La carga se realiza mediante la función `scamguard.text_model.load_text_model(<folder>)`, lo que implica una dependencia de la librería `scamguard` del proyecto.

## Capacidades

- Clasificación de mensajes de texto (SMS, WhatsApp, Telegram) como fraudulentos o legítimos, o con una puntuación de riesgo asociada.
- Detección de estafas y scams en inglés, hindi y kannada, gracias a la base multilingüe MuRIL.
- Manejo de texto coloquial y transliterado propio de los idiomas indios, por la naturaleza del preentrenamiento de MuRIL.
- Ejecución de dos modelos en paralelo (teacher y student) para comparación de predicciones.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es un modelo generativo: no produce respuestas conversacionales ni resúmenes.

## Casos de uso

- Filtrado de SMS fraudulentos en una pasarela de mensajería: el modelo puntúa cada mensaje entrante y permite aplicar un umbral para bloquear o marcar como sospechoso antes de la entrega al usuario, aprovechando su entrenamiento específico en scams.
- Moderación de grupos de WhatsApp y Telegram: integrado como clasificador previo a la publicación, puede señalar mensajes con patrones de estafa (premios falsos, suplantación de entidades) en inglés, hindi y kannada.
- Demo interactiva en un Space de Hugging Face: es el uso original declarado, con los dos modelos ejecutándose en paralelo para mostrar al visitante la diferencia entre teacher y student.
- Investigación comparativa de destilación: el par teacher/student permite estudiar la pérdida de rendimiento al comprimir un clasificador multilingüe de fraude, siempre sobre datos públicos.
- Etiquetado asistido de corpus: como preanotador de datasets de mensajes para revisión humana posterior, reduciendo el esfuerzo manual en la construcción de nuevos conjuntos de entrenamiento.
- Análisis de campañas de phishing en canales de mensajería: agregando las puntuaciones por remitente o por ventana temporal para detectar picos de mensajes sospechosos en una comunidad concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, un encoder tipo BERT-large en fp16 ocupa alrededor de 1,1 GB de pesos; el repositorio completo pesa 2,8 GB, lo que sugiere que contiene ambos modelos con sus artefactos.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el teacher en fp16 o fp32.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque el autor no lo confirma.
- Opciones de despliegue: la model card solo documenta la carga mediante `scamguard.text_model.load_text_model(<folder>)`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder de clasificación no son las herramientas habituales para este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShopLifting teacher-best | No disponible (base MuRIL-large) | No disponible | en, hi, kn | Other | Hugging Face, 0 descargas |
| ShopLifting student-best | No disponible | No disponible | en, hi, kn | Other | Hugging Face, 0 descargas |
| `google/muril-large-cased` (base) | ~560 M | 512 tokens (valor habitual de BERT, no confirmado en la información) | 17 idiomas indios + en | Apache 2.0 (según la model card original de Google, no verificada aquí) | Ampliamente disponible |
| Clasificadores de spam genéricos (p. ej. fine-tunes de BERT/DistilBERT) | 60-110 M típicamente | 512 tokens típicamente | Principalmente en | Variables | Amplia |

La comparación cuantitativa de rendimiento no es posible porque el autor no publica métricas. Frente a la base MuRIL, la diferencia es el ajuste fino específico en detección de scams y la disponibilidad de un student más ligero; frente a clasificadores genéricos de spam, la ventaja declarada es la cobertura de hindi y kannada.

## Limitaciones y advertencias

- Modelos provisionales: la propia model card advierte que las puntuaciones describen datos públicos y no tráfico real indio, por lo que no deben interpretarse como una medida fiable de fraude en producción.
- Entrenados solo con datos públicos de scams y mensajes genuinos: probable sesgo hacia los patrones presentes en esos conjuntos y riesgo de falsos positivos o negativos en mensajes reales con vocabulario, jerga o formatos distintos.
- Sin métricas publicadas: no hay precisión, recall, F1 ni matrices de confusión, lo que impide evaluar su calidad objetivamente.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza, especialmente en mensajes ambiguos o en idiomas distintos de en, hi y kn.
- Licencia "other" sin términos detallados: no se puede confirmar si el uso comercial está permitido; hay que contactar con el autor o revisar los archivos del repositorio antes de cualquier despliegue comercial.
- Dependencia de la librería `scamguard` y de los umbrales definidos en `scamguard.json`: los resultados dependen de esa configuración, que no se documenta en la model card.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-10-30): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/Supreetpatil79/shoplifting-models
- Modelo base del teacher: https://huggingface.co/google/muril-large-cased
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales asociados a este modelo.
