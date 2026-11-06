# sprakbanken-se/bert-base-german_CEFR-classification

## Resumen

`sprakbanken-se/bert-base-german_CEFR-classification` es un modelo de clasificación de texto en alemán desarrollado por el grupo Computational SLA de Språkbanken Text (Universidad de Gotemburgo). Su tarea es asignar a redacciones escritas por aprendices de alemán como segunda lengua uno de los niveles del Marco Común Europeo de Referencia (CEFR), desde A1 hasta C2. Se trata de un fine-tuning del modelo `google-bert/bert-base-german-cased`, por lo que hereda la arquitectura BERT base con encoder de 12 capas y atención bidireccional.

El modelo resuelve un problema concreto en el ámbito de la lingüística computacional aplicada a la adquisición de segundas lenguas (SLA): la evaluación automática de la competencia escrita. Se entrenó siguiendo el procedimiento descrito en el artículo publicado en NLP4CALL 2024, utilizando la versión UniversalCEFR del split alemán del corpus Merlin. Con 109.085.958 parámetros, es un modelo compacto pensado para integrarse en herramientas educativas y demos, no para evaluación de alto riesgo.

Su relevancia actual radica en su carácter abierto y reproducible dentro de un ecosistema de investigación (Språkbanken Text) y en que ejemplifica el uso de modelos encoder pequeños para tareas de clasificación lingüística especializada, donde modelos generativos grandes no aportarían ventajas y sí mayores costes de inferencia. La model card advierte explícitamente de que las predicciones son ilustrativas y no autoritativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder bidireccional, 12 capas) |
| Parametros totales | 109.085.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas estándar, no documentada) |
| Idiomas soportados | alemán (de) |
| Licencia | GPL-3.0 (según model card; el campo de licencia en Hugging Face figura como no disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google-bert/bert-base-german-cased`, un transformer encoder de 12 capas con atención bidireccional completa, diseñado originalmente para modelado de lenguaje enmascarado y adaptable a clasificación mediante una cabeza de secuencia. La tarea de clasificación asigna una etiqueta CEFR a cada redacción completa. No se documentan en la información disponible innovaciones arquitectónicas adicionales (no hay decodificación especulativa, atención lineal ni componentes MoE).

El entrenamiento sigue el procedimiento del artículo de NLP4CALL 2024 y emplea el dataset `UniversalCEFR/merlin_de`, que contiene redacciones de aprendices de alemán anotadas con niveles CEFR. La model card está incompleta en las secciones de detalles de entrenamiento: los apartados de datos de entrenamiento, preprocesamiento, hiperparámetros, evaluación y resultados figuran como pendientes (TODO) en el README. Por tanto, no se dispone de información sobre número de tokens, composición exacta del dataset, uso de RLHF/DPO (improbable en un encoder de clasificación) ni métricas de evaluación publicadas.

## Capacidades

- Clasificación de texto: asigna un nivel CEFR (A1-C2) a redacciones en alemán escritas por aprendices.
- Procesamiento de texto en alemán con distinción de mayúsculas (modelo cased).
- Inferencia rápida y ligera al ser un encoder de 109M de parámetros.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face según los tags del repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades de generación de texto, código, matemáticas, visión ni audio.
- Capacidad multilingüe: no, únicamente alemán.

## Casos de uso

- Herramientas educativas de autoaprendizaje: integrado en una aplicación web, el modelo puede estimar el nivel CEFR de una redacción enviada por un estudiante para ofrecer retroalimentación orientativa sobre su progreso, con la advertencia de que la predicción es ilustrativa.
- Investigación en adquisición de segundas lenguas: los investigadores pueden usar el modelo para etiquetar automáticamente grandes corpus de redacciones y estudiar la distribución de niveles o la evolución de la competencia escrita a lo largo del tiempo.
- Filtrado y organización de corpus: clasificar textos de aprendices por nivel para construir subconjuntos equilibrados en experimentos de NLP educativo.
- Demos interactivas en entornos académicos: el tamaño reducido (0,9 GB de repo) permite desplegarlo en un endpoint de Hugging Face o en un servidor modesto para demostraciones en congresos y clases.
- Análisis de sesgos por lengua materna: como parte de la línea de investigación del grupo, el modelo puede emplearse para medir si las predicciones varían según la L1 del autor, tal como se menciona en la model card.
- Prototipado de pipelines de evaluación formativa: servir como componente de clasificación en un sistema mayor que combine análisis de errores gramaticales y estimación de nivel, siempre en contextos de bajo riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye las secciones de evaluación y resultados marcadas como pendientes (TODO), y no se aportan métricas de exactitud, F1 ni comparaciones con otros sistemas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en FP32 (109M de parámetros), y menos de 0,5 GB en FP16 o int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura. También es viable en CPU.
- Cabe en cualquier GPU consumer actual e incluso en dispositivos de gama baja; el cuello de botella no será la memoria sino el throughput de peticiones.
- Opciones de despliegue: `transformers` con PyTorch, `text-embeddings-inference` (según tags), endpoints de Hugging Face, ONNX Runtime y potencialmente llama.cpp si se convierte a GGUF (no documentado).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sprakbanken-se/bert-base-german_CEFR-classification | 109M | no disponible | Clasificación CEFR (alemán) | GPL-3.0 | Hugging Face |
| google-bert/bert-base-german-cased | 110M aprox. | 512 tokens (BERT base) | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| Otros clasificadores CEFR del grupo Computational SLA | no disponible | no disponible | Clasificación CEFR | no disponible | no disponible |

La comparación con alternativas específicas de clasificación CEFR en alemán no está disponible en la información proporcionada. El modelo base `bert-base-german-cased` sirve como referencia arquitectónica, pero no es un clasificador CEFR directo.

## Limitaciones y advertencias

- Las predicciones son ilustrativas y no autoritativas; el autor advierte explícitamente contra su uso en evaluación lingüística real o en decisiones de migración, trabajo o educación.
- El rendimiento es relativamente bajo para contextos de alto riesgo, según reconoce la propia model card.
- Sesgos potenciales derivados de un dataset heterogéneo de redacciones: pueden existir sesgos de tema y formato.
- Se está estudiando el impacto de la lengua materna del autor en las predicciones; los resultados aún no están publicados, lo que constituye un riesgo conocido pero no cuantificado.
- Licencia GPL-3.0: implica obligaciones de copyleft para obras derivadas distribuidas; conviene revisar su compatibilidad antes de uso comercial o integración en productos propietarios.
- Modelo monolingüe (alemán); no apto para otros idiomas.
- La model card está incompleta: faltan detalles de entrenamiento, evaluación y resultados, lo que dificulta la reproducibilidad y la evaluación independiente.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos atípicos o fuera de la distribución del corpus Merlin.

## Enlaces

- Hugging Face: https://huggingface.co/sprakbanken-se/bert-base-german_CEFR-classification
- Modelo base: https://huggingface.co/google-bert/bert-base-german-cased
- Dataset: https://huggingface.co/datasets/UniversalCEFR/merlin_de
- Artículo de referencia (NLP4CALL 2024): https://aclanthology.org/2024.nlp4call-1.11/
- Proyecto Computational SLA: https://spraakbanken.gu.se/en/projects/computational-sla
- Språkbanken Text: https://spraakbanken.gu.se/en
- Perfil del autor: https://huggingface.co/rimusa
- Contacto: ricardo.munoz.sanchez@gu.se, elena.volodina@gu.se
