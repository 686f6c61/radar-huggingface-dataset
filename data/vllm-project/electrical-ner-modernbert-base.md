# vllm-project/electrical-ner-ModernBERT-base

## Resumen

electrical-ner-ModernBERT-base es un modelo de clasificación de tokens (Named Entity Recognition) especializado en el dominio de la ingeniería eléctrica. Lo desarrolla el usuario disham993 y el repositorio de HuggingFace que nos ocupa es una copia mantenida por la organización vllm-project para su uso en integración continua, con el objetivo de reducir el riesgo en la cadena de suministro. El modelo parte de answerdotai/ModernBERT-base, un encoder transformer de 149,6 millones de parámetros, y se ha afinado para extraer entidades como componentes, materiales, normativas y parámetros de diseño de textos técnicos.

La relevancia del modelo está en su especialización: frente a un NER genérico, está entrenado sobre un corpus sintético del dominio eléctrico (disham993/ElectricalNER, generado con GPT-4o-mini) que cubre diseño de circuitos, pruebas, mantenimiento, instalación, diagnóstico de averías e investigación. Con un F1 de 0,9177 en evaluación, ofrece una precisión y cobertura altas para una tarea de extracción estructurada, lo que lo convierte en una pieza útil para pipelines de documentación técnica, indexación semántica o extracción de datos de manuales y fichas de producto.

Se distribuye con licencia MIT, únicamente en inglés, y en formato safetensors. No es un modelo generativo: no produce texto libre ni razona de forma multi-paso, sino que etiqueta secuencias de entrada. Su tamaño (0,6 GB de repositorio) y su naturaleza de encoder lo hacen desplegable en hardware modesto, incluida GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder transformer) |
| Parametros totales | 149.619.475 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ModernBERT-base soporta hasta 8192 tokens, segun el modelo base) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repositorio; admite cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de answerdotai/ModernBERT-base para token-classification. ModernBERT es una familia de encoders transformer que moderniza la arquitectura BERT clásica con mejoras como atención con RoPE, alternancia de capas de atención global y local, y un contexto ampliado respecto a BERT original. Sobre esa base, este checkpoint añade una cabeza de clasificación de tokens para resolver NER con etiquetas BIO/BIOES del dominio eléctrico.

El entrenamiento se realizó sobre el dataset disham993/ElectricalNER, un corpus sintético generado con GPT-4o-mini y curado para el dominio de la ingeniería eléctrica, con contextos de diseño de circuitos, pruebas, mantenimiento, instalación, diagnóstico y research. Los hiperparámetros documentados son: learning rate 1e-5, batch size 64 en entrenamiento y evaluación, 5 épocas, weight decay 0,01 y evaluación por época. No se documentan el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un encoder de NER). La innovación técnica destacable es la propia especialización de dominio sobre un encoder moderno, no una modificación arquitectónica propia.

## Capacidades

- Extracción de entidades nombradas (NER) en textos técnicos de ingeniería eléctrica: componentes, materiales, normativas y parámetros de diseño.
- Etiquetado a nivel de token con agrupación de entidades mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Procesamiento de contextos técnicos variados: diseño de circuitos, pruebas, mantenimiento, instalación, diagnóstico de averías e investigación.
- Salida con puntuaciones de confianza por entidad, lo que permite filtrar por umbral (el ejemplo del autor usa `min_score=0.40`).
- Capacidad monolingüe: solo inglés.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio. Es un modelo discriminativo de etiquetado.

## Casos de uso

- Extracción estructurada de documentación técnica: procesar manuales de instalación y fichas de componentes para poblar una base de datos de referencias (modelos de FPGA, suites de desarrollo, materiales). El modelo devuelve entidades con offsets de caracteres, lo que facilita el mapeo a campos de un esquema.
- Indexación y búsqueda semántica en repositorios de ingeniería: etiquetar automáticamente documentos con las entidades que contienen para mejorar filtros y recuperación; su F1 de 0,9177 reduce el ruido en los índices.
- Normalización de catálogos de componentes: detectar menciones de componentes y materiales en descripciones libres de producto para consolidar variantes de nomenclatura en un catálogo maestro.
- Control de calidad documental: verificar que los parámetros de diseño y las normativas citadas en un documento están correctamente identificados antes de publicarlo, usando el umbral de confianza para marcar revisiones manuales.
- Alimentación de pipelines RAG en soporte técnico: enriquecer los fragmentos recuperados con metadatos de entidades para que el generador posterior reciba contexto más preciso sobre componentes y estándares.
- Análisis de tickets de mantenimiento y diagnóstico: extraer de informes de averías los componentes y materiales implicados para clasificar incidencias y alimentar dashboards de fiabilidad.
- Preprocesado para tareas downstream: servir como primer paso en extracción de relaciones o construcción de grafos de conocimiento del dominio eléctrico, aprovechando su velocidad (711 muestras por segundo en evaluación).

## Benchmarks y rendimiento

Resultados de evaluación publicados por el autor en la model card:

| Metrica | Valor |
|---|---|
| Epoca | 5.0 |
| Precision | 0.9108 |
| Recall | 0.9248 |
| F1 | 0.9177 |
| Accuracy | 0.9664 |
| Tiempo de evaluacion | 2.121 s |
| Muestras por segundo | 711.447 |
| Pasos por segundo | 11.315 |

No se han publicado resultados comparativos con otros modelos de NER en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 0,6 GB de pesos, con overhead adicional de activaciones y tokenizer; en la práctica, menos de 2 GB para batches pequeños.
- En fp16/bf16: alrededor de 0,3 GB de pesos, holgado en cualquier GPU consumer.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU para cargas moderadas.
- Despliegue: pipeline de transformers (`AutoModelForTokenClassification` + `pipeline("ner")`), y opciones estándar para encoders como vLLM (el repositorio lo mantiene vllm-project para CI), TGI o inferencia en CPU con ONNX. No se documentan configuraciones específicas de llama.cpp u Ollama para este checkpoint.
- Throughput: 711 muestras por segundo y 11,3 pasos por segundo en la evaluación del autor, sobre hardware no especificado en la información disponible.
- Latencia: el runtime de evaluación completo fue de 2,121 segundos para el conjunto de evaluación; la latencia por petición no está documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| electrical-ner-ModernBERT-base | 149,6 M | no disponible (base ModernBERT hasta 8192) | NER dominio eléctrico | MIT | HuggingFace (copia vllm-project) |
| answerdotai/ModernBERT-base | no disponible en la informacion | hasta 8192 (segun modelo base) | Encoder general (base) | no disponible en la informacion | HuggingFace |
| BERT-base NER generico | ~110 M | 512 | NER general | no disponible en la informacion | HuggingFace |

La comparación cuantitativa de rendimiento frente a alternativas no está disponible: el autor solo publica métricas propias sobre el dataset ElectricalNER.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés; no cubre textos técnicos en castellano ni en otros idiomas.
- Dominio restringido: rendimiento fuera de la ingeniería eléctrica no está validado y probablemente degrade.
- Dataset sintético: el corpus de entrenamiento fue generado con GPT-4o-mini, lo que puede introducir sesgos y artefactos propios del generador, además de limitar la diversidad respecto a texto técnico real.
- Riesgo de alucinación de entidades: como todo NER, puede etiquetar falsos positivos; el autor recomienda filtrar por umbral de confianza (0,40 en su ejemplo) y revisar entidades de baja puntuación.
- Métricas de evaluación sobre el mismo dominio sintético: el F1 de 0,9177 no garantiza el mismo rendimiento en documentos reales de empresa.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base y del dataset.
- Es una copia de un checkpoint en cuenta personal: el repositorio de vllm-project existe para reducir riesgo de cadena de suministro; para producción conviene fijar el commit concreto.
- No es generativo: no debe usarse para responder preguntas ni para tareas de razonamiento; su función es exclusivamente el etiquetado de tokens.

## Enlaces

- Modelo en HuggingFace (copia vllm-project): https://huggingface.co/vllm-project/electrical-ner-ModernBERT-base
- Modelo original: https://huggingface.co/disham993/electrical-ner-ModernBERT-base
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/disham993/ElectricalNER
- Paper de ModernBERT (arXiv:2412.13663): https://arxiv.org/abs/2412.13663
