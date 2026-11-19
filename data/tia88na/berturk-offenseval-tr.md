# tia88na/berturk-offenseval-tr

## Resumen

`tia88na/berturk-offenseval-tr` es un modelo de clasificación de texto en turco publicado en Hugging Face por el usuario tia88na. Por el identificador y las etiquetas del repositorio, se trata de un ajuste fino (fine-tuning) de BERTurk, el modelo BERT preentrenado para turco, sobre datos de la tarea OffensEval (detección de lenguaje ofensivo). El repositorio contiene únicamente pesos en formato safetensors (0,4 GB) y una model card autogenerada sin información sustantiva sobre datos de entrenamiento, hiperparámetros o evaluación.

El modelo tiene 110.618.882 parámetros, cifra coherente con la arquitectura BERT-base (embedding de vocabulario turco ampliado, 12 capas, 768 dimensiones ocultas). La librería declarada es `transformers` y el pipeline es `text-classification`, por lo que su uso previsto es la inferencia de clasificación sobre secuencias de texto en turco, presumiblemente con etiquetas binarias o multiclase relacionadas con ofensividad.

La relevancia de esta ficha es limitada pero concreta: cubre un hueco poco poblado, la moderación de contenido en turco, con un modelo pequeño que puede ejecutarse en CPU o en GPUs de gama baja. No obstante, la ausencia total de documentación, métricas y licencia explícita obliga a tratar el modelo como un artefacto experimental no apto para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, presumiblemente BERTurk base; no confirmado en la model card) |
| Parametros totales | 110.618.882 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (BERT base suele limitarse a 512 tokens; no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion a int8/fp16 con herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible (por el nombre del repositorio, turco; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura más allá de la etiqueta `bert` y del recuento de parámetros (110,6 M), compatible con un BERT-base. El identificador sugiere un ajuste fino de BERTurk sobre el corpus OffensEval en turco, pero ni la model card ni los metadatos del repositorio confirman el checkpoint base, el número de tokens de entrenamiento, la composición del dataset, el régimen de precisión ni si se aplicaron técnicas de regularización o búsqueda de hiperparámetros.

Tampoco hay constancia de innovaciones técnicas (atención lineal, decodificación especulativa, destilación, etc.). El modelo es, a todos los efectos documentales, una caja negra: solo se conocen el tamaño, el formato de pesos y la tarea declarada.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a etiquetar secuencias completas (probablemente ofensivo / no ofensivo, aunque el esquema exacto de etiquetas no está documentado).
- Procesamiento de turco: por el identificador del repositorio, el modelo está pensado para texto en turco; no hay confirmación de otros idiomas.
- Extracción de embeddings: al ser un encoder BERT, puede utilizarse para obtener representaciones vectoriales de frases, aunque el autor no lo documenta ni lo valida.
- Ajuste fino posterior: al ser un checkpoint `transformers` estándar, es reutilizable como base para otras tareas de clasificación en turco.
- Tool calling / function calling: no soportado (no es un modelo generativo).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no soportado.

## Casos de uso

- Moderación de comentarios en turco: usar el modelo como clasificador de primera línea para filtrar comentarios potencialmente ofensivos en foros o secciones de noticias, con revisión humana de los positivos. Es adecuado por su tamaño reducido y su coste de inferencia bajo, aunque requiere validación previa con datos propios.
- Preetiquetado de datasets de anotación: emplear el modelo para generar etiquetas preliminares sobre grandes volúmenes de texto turco y reducir el esfuerzo de anotación manual, con corrección posterior por anotadores.
- Filtrado en pipelines de ingestión de datos: descartar documentos ofensivos antes de alimentar un corpus de entrenamiento o un sistema de búsqueda, usando el clasificador como etapa de limpieza.
- Señal auxiliar en sistemas de recomendación: incorporar la probabilidad de ofensividad como característica para degradar o excluir contenido en un feed de redes sociales en turco.
- Investigación en NLP turco: servir como baseline reproducible para experimentos de detección de lenguaje ofensivo, comparando contra otros ajustes de BERTurk.
- Prototipado rápido en CPU: desplegar el modelo en un servicio ligero (por ejemplo, con `text-embeddings-inference` o un endpoint de Hugging Face) para validar una idea de producto de moderación antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (accuracy, F1, precisión/recall por clase), ni comparaciones con otros sistemas de OffensEval en turco.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32 (110,6 M de parámetros × 4 bytes) y unos 0,22 GB en fp16. Con la sobrecarga del runtime, un presupuesto de 1-2 GB es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; una NVIDIA T4, L4 o RTX 3060 es más que suficiente. También puede ejecutarse en CPU con latencias aceptables para volúmenes moderados.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `text-embeddings-inference` (etiqueta presente en el repositorio), endpoints de Hugging Face, ONNX Runtime o TorchScript tras conversión. `llama.cpp` y `Ollama` no aplican porque no es un modelo generativo.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor. En una GPU moderna se espera un throughput del orden de miles de secuencias cortas por segundo para un BERT-base, pero es una estimación genérica, no un dato del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tia88na/berturk-offenseval-tr` | 110,6 M | no disponible | Clasificación de ofensividad en turco | no disponible | Hugging Face |
| `dbmdz/bert-base-turkish-cased` (BERTurk) | ~110 M | 512 tokens | Modelo base de propósito general en turco | MIT (según el repositorio original de BERTurk) | Hugging Face |
| `savasy/bert-base-turkish-sentiment-cased` | ~110 M | 512 tokens | Análisis de sentimiento en turco | no verificada en esta ficha | Hugging Face |

La comparación con BERTurk es la más directa: este modelo es presumiblemente un ajuste fino de aquel, por lo que hereda su arquitectura y tamaño, pero añade una especialización en ofensividad a costa de perder generalidad. Frente a otros clasificadores turcos, la diferencia principal es la tarea, no la arquitectura. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla autogenerada de Hugging Face, sin información sobre datos, entrenamiento, etiquetas ni evaluación. No es posible verificar qué aprende el modelo.
- Licencia no declarada: no se puede asumir uso comercial permitido. Cualquier despliegue en producción requiere contactar con el autor o sustituir el modelo.
- Riesgo de sesgos: un clasificador de ofensividad entrenado sobre un corpus no documentado puede sobrerreaccionar ante variedades dialectales, jerga o lenguaje recuperado, y infrarrepresentar formas sutiles de agresividad.
- Alucinación en sentido estricto no aplica (no genera texto), pero sí falsos positivos y falsos negativos con consecuencias directas en moderación.
- Cobertura lingüística no confirmada: aunque el nombre indica turco, no hay validación de rendimiento fuera de ese idioma ni de variedades del turco.
- Sin métricas: imposible estimar la calidad real; debe evaluarse con un conjunto de validación propio antes de cualquier uso.
- Repositorio sin descargas ni likes en el momento de la consulta: indica un artefacto reciente o no validado por la comunidad, lo que refuerza la cautela.
- Fecha de creación futura en los metadatos (2026-11-18): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tia88na/berturk-offenseval-tr
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada: https://ml2co2.github.io/impact#compute
- Repositorio de BERTurk (modelo base presumible): https://huggingface.co/dbmdz/bert-base-turkish-cased
- Paper de BERT (referencia arquitectónica): https://arxiv.org/abs/1810.04805
