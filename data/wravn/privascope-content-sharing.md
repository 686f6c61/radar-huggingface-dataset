# Wravn/PrivaScope-content-sharing

## Resumen

PrivaScope-content-sharing es un modelo de clasificacion de texto derivado de FacebookAI/roberta-base, publicado por el usuario Wravn en Hugging Face. Se trata de un ajuste fino (fine-tuning) de la arquitectura RoBERTa base orientado a la clasificacion de contenido, presumiblemente en el ambito de privacidad y comparticion de contenido, a juzgar por el nombre del repositorio. El modelo cuenta con 124.650.246 parametros, lo que coincide con la configuracion estandar de RoBERTa base, y se distribuye tanto en formato safetensors como en ONNX.

El modelo resuelve una tarea acotada de clasificacion de texto en ingles, no de generacion. Su relevancia practica es limitada por el momento: no cuenta con descargas ni interacciones en Hugging Face, la model card publica es practicamente vacia (solo metadatos YAML) y no se documentan datos de entrenamiento, hiperparametros ni resultados de evaluacion mas alla de declarar la metrica F1. Esto lo convierte en un artefacto de investigacion o experimento personal mas que en un modelo listo para produccion.

La arquitectura subyacente es RoBERTa base, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, preentrenado sobre corpus en ingles. El ajuste fino anade una cabeza de clasificacion sobre la representacion del token especial `<s>`. La longitud de contexto tipica de RoBERTa es de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa base) con cabeza de clasificacion de secuencia |
| Parametros totales | 124.650.246 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (valor estandar de RoBERTa base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (existe variante ONNX; no se detallan niveles de cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en FacebookAI/roberta-base, un transformer encoder-only de 12 capas con 768 dimensiones ocultas y 12 cabezas de atencion, preentrenado de forma auto-supervisada mediante masked language modeling sobre un corpus en ingles de gran escala. Sobre esta base se ha anadido una cabeza de clasificacion (pooler seguido de capa lineal) y se ha ajustado de forma supervisada para la tarea de clasificacion de texto declarada en el pipeline tag.

No se dispone de informacion sobre el dataset de ajuste fino, el numero de ejemplos, la composicion de las clases, la funcion de perdida, los hiperparametros de entrenamiento ni si se aplicaron tecnicas como RLHF, DPO o aumentacion de datos. La model card no documenta ninguna innovacion tecnica especifica. La metrica declarada es F1, pero no se aportan valores numericos ni conjunto de evaluacion.

## Capacidades

- Clasificacion de texto en ingles: asigna una etiqueta a una secuencia de entrada, presumiblemente relacionada con la comparticion de contenido y privacidad.
- Procesamiento de documentos de hasta 512 tokens (limite estandar de RoBERTa base).
- Inferencia eficiente en CPU y GPU gracias al tamano reducido (124,6 M de parametros).
- Exportacion a ONNX para despliegue en entornos con runtime ONNX Runtime.
- No soporta generacion de texto, razonamiento multi-paso, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Moderacion de contenido en ingles: clasificar textos enviados por usuarios en categorias relacionadas con privacidad o comparticion de informacion, usando la salida del clasificador como filtro previo a revision humana.
- Clasificacion de documentos en pipelines de ingestion: etiquetar documentos antes de almacenarlos o indexarlos, aprovechando el bajo coste de inferencia de un encoder de 124 M de parametros.
- Filtrado de datos en investigacion sobre privacidad: separar muestras de texto segun criterios de comparticion de contenido para construir datasets de analisis.
- Servicio de clasificacion de baja latencia en CPU: desplegar el modelo en ONNX Runtime para clasificar peticiones en entornos sin GPU, dado el tamano reducido del artefacto (0,6 GB de repo).
- Preetiquetado para anotacion humana: generar etiquetas preliminares que los anotadores revisan, reduciendo el coste de etiquetado manual en proyectos de NLP en ingles.
- Componente de un clasificador en cascada: usar el modelo como primera etapa rapida y derivar los casos de baja confianza a un modelo mayor o a revision humana.
- Experimentacion academica: servir como baseline RoBERTa ajustado para comparar contra otros clasificadores en tareas de privacidad y comparticion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la metrica F1 en los metadatos, pero no se aportan valores numericos, conjunto de evaluacion ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124,6 M de parametros), alrededor de 0,25 GB en fp16 y menos de 0,15 GB en cuantizacion int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas GPU.
- Cabe en cualquier GPU consumer e incluso en CPU; el cuello de botella es la latencia de red, no el computo.
- Opciones de despliegue: ONNX Runtime (variante ONNX incluida), Transformers con PyTorch, Text Embeddings Inference (TGI no es adecuado porque el modelo no es generativo), y servidores de inferencia genericos compatibles con safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por secuencia corta en GPU y decenas de milisegundos en CPU, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wravn/PrivaScope-content-sharing | 124,6 M | 512 (estandar RoBERTa) | Clasificacion de texto (en) | no disponible | Hugging Face, safetensors y ONNX |
| FacebookAI/roberta-base | 124,6 M | 512 | Masked LM (base) | MIT (segun el modelo original) | Hugging Face |
| distilbert-base-uncased | 66 M | 512 | Masked LM (destilado) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 | Masked LM (base) | Apache 2.0 | Hugging Face |

La comparativa con roberta-base es directa: PrivaScope es un ajuste fino del primero para clasificacion. Frente a distilbert-base-uncased, PrivaScope tiene aproximadamente el doble de parametros pero menor eficiencia de inferencia. No hay datos de rendimiento que permitan comparar calidad en la tarea objetivo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de roberta-base, hereda los sesgos del corpus de preentrenamiento en ingles, que no se detalla.
- Riesgo de alucinacion: no aplica en sentido estricto porque el modelo no genera texto, pero puede producir clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- Limitacion de contexto: 512 tokens como maximo, valor estandar de RoBERTa base y no confirmado explicitamente en la model card.
- Limitacion de idioma: solo ingles; el rendimiento en otros idiomas no esta documentado y probablemente es deficiente.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia antes de cualquier despliegue en produccion.
- Model card practicamente vacia: no se documentan datos de entrenamiento, clases, metricas ni limitaciones, lo que impide evaluar la calidad y la idoneidad del modelo.
- Ausencia de traccion: cero descargas y cero likes en Hugging Face, sin evidencia de uso o validacion por terceros.
- Fecha de creacion futura (2026-11-23) en los metadatos, lo que sugiere que el repositorio puede haber sido creado con metadatos inconsistentes; conviene verificar la integridad del artefacto antes de usarlo.
- No apto para tareas generativas, de razonamiento, codigo o vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wravn/PrivaScope-content-sharing
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Repositorio de RoBERTa en GitHub: https://github.com/facebookresearch/fairseq/tree/main/examples/roberta
