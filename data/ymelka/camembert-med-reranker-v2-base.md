# ymelka/camembert-med-reranker-v2-base

## Resumen

El modelo `ymelka/camembert-med-reranker-v2-base` es un cross-encoder de reranking especializado en el dominio médico en francés, desarrollado por ymelka. Se basa en el modelo `antoinelouis/crossencoder-camembert-base-mmarcoFR`, que a su vez parte de CamemBERT, un transformer tipo RoBERTa entrenado sobre texto francés. Con 110 millones de parámetros, este modelo está diseñado para puntuar pares de consulta-documento y reordenar resultados de búsqueda en contextos clínicos y biomédicos.

La versión v2 incorpora un fine-tuning adicional sobre un dataset denominado E2, compuesto por 36.5k grupos y 196k pares de entrenamiento, con una distribución de 62% de ejemplos tipo A, 13% tipo B y 25% tipo C. El modelo reporta una mejora significativa en la métrica médica P@1 (0.4773) frente a su versión anterior (0.4678) y al modelo padre (0.3445), lo que indica una mayor precisión en la recuperación de información relevante para consultas médicas en francés.

Su relevancia actual radica en la creciente demanda de sistemas de búsqueda semántica especializados en salud, donde los modelos genéricos multilingües suelen fallar por la jerga técnica y la especificidad del dominio. Al estar licenciado bajo Apache-2.0 y tener un tamaño compacto, resulta accesible para integración en pipelines de recuperación aumentada (RAG) y sistemas de asistencia clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en CamemBERT (RoBERTa francés) |
| Parametros totales | 110.622.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fr (frances) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder, lo que significa que procesa simultáneamente el par consulta-documento como una única secuencia de entrada y produce una puntuación de relevancia. La arquitectura subyacente es CamemBERT, un transformer encoder-only basado en RoBERTa, preentrenado sobre el corpus OSCAR en francés. El modelo base `antoinelouis/crossencoder-camembert-base-mmarcoFR` ya había sido fine-tuneado para reranking multilingüe, y esta versión v2 se ajusta adicionalmente sobre un dataset médico específico.

El entrenamiento de la v2 utiliza el dataset E2, que combina el dataset-v1 original con datos adicionales: gold-extra, replay de 10k ejemplos y MedInjection Native con 5.6k pares. La distribución de los datos (62% A, 13% B, 25% C) sugiere una mezcla de tipos de pares con distintos niveles de dificultad. No se especifica si se emplearon técnicas de RLHF o DPO; el proceso parece ser un fine-tuning supervisado estándar sobre pares etiquetados. Tampoco se detalla el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuación de relevancia a cada par, permitiendo reordenar listas de resultados de búsqueda.
- Búsqueda semántica en dominio médico: optimizado para terminología clínica, farmacológica y biomédica en francés.
- Integración en pipelines RAG: puede usarse como etapa de reranking tras una recuperación inicial con modelos bi-encoders.
- Procesamiento de texto en francés: aprovecha el conocimiento lingüístico de CamemBERT para manejar morfología y sintaxis del francés.
- No es un modelo generativo: no produce texto, solo puntúa pares.
- No soporta tool calling ni razonamiento multi-paso: su función es exclusivamente de clasificación de relevancia.

## Casos de uso

- Búsqueda de literatura médica en francés: un sistema de recuperación de artículos científicos puede usar este reranker para reordenar resultados de PubMed o bases de datos clínicas, priorizando los documentos más relevantes para una consulta específica.
- Asistencia a profesionales de la salud: integrado en un chatbot o sistema de ayuda al diagnóstico, puede filtrar y ordenar pasajes de guías clínicas o fichas farmacológicas antes de presentarlos al médico.
- Recuperación aumentada (RAG) para preguntas médicas: en un pipeline RAG, tras recuperar candidatos con un bi-encoder, este cross-encoder refina la selección final, mejorando la precisión de las respuestas generadas.
- Indexación y búsqueda en historiales clínicos: permite buscar en notas médicas electrónicas (en francés) por relevancia semántica, facilitando la localización de casos similares o tratamientos previos.
- Filtrado de contenido para portales de salud pública: reordenar artículos divulgativos o preguntas frecuentes según su adecuación a la consulta del usuario.
- Evaluación de pares en sistemas de recomendación de documentos: puntuar la relevancia de pares consulta-documento para entrenar o evaluar otros modelos de búsqueda.

## Benchmarks y rendimiento

La model card reporta la métrica médica P@1 (precisión en la primera posición) comparando la v2 con la v1 y el modelo padre:

| Modelo | P@1 médico |
|---|---|
| ymelka/camembert-med-reranker-v2-base | 0.4773 |
| ymelka/camembert-med-reranker-base (v1) | 0.4678 |
| antoinelouis/crossencoder-camembert-base-mmarcoFR (padre) | 0.3445 |

No se han publicado resultados adicionales en benchmarks estándar como MMLU, HumanEval o GSM8K, dado que se trata de un modelo de reranking y no de generación. Tampoco se especifica el rendimiento en mMARCO, aunque la model card menciona que se espera un valor de "forgetting" alrededor de 0.97, similar a otras versiones E1/E2.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 110M parámetros, la inferencia en precisión fp32 requiere aproximadamente 0.44 GB de memoria. Con cuantización a int8 o int4, el consumo se reduce aún más, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas consumer como GTX 1060, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable latencia para tareas de reranking por lotes.
- Despliegue: compatible con librerías de transformers de HuggingFace, sentence-transformers (para CrossEncoder) y puede integrarse en servidores de inferencia como vLLM o TGI, aunque al ser un cross-encoder, su uso típico es en lote o en línea con baja concurrencia.
- Latencia y throughput: no se dispone de mediciones oficiales. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos por par en GPU moderna, y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| ymelka/camembert-med-reranker-v2-base | 110M | no disponible | Médico francés | Apache-2.0 |
| antoinelouis/crossencoder-camembert-base-mmarcoFR | 110M | no disponible | Multilingüe (incluye francés) | Apache-2.0 |
| tomaarsen/reranker-camembertv2-base-fr-lambda | 110M | no disponible | Francés general | Apache-2.0 |

El modelo v2 se distingue por su fine-tuning específico en dominio médico, lo que le otorga una ventaja en P@1 frente al padre y a alternativas de propósito general. La comparativa con `tomaarsen/reranker-camembertv2-base-fr-lambda` no incluye métricas directas, pero este último está orientado a francés general, no a terminología médica.

## Limitaciones y advertencias

- Es un modelo de reranking, no generativo: no puede producir respuestas ni razonar de forma autónoma; solo puntúa pares de texto.
- Dominio limitado al francés: no soporta otros idiomas, lo que restringe su uso a entornos francófonos.
- Especialización médica: aunque mejora la precisión en terminología clínica, puede presentar sesgos derivados de los datos de entrenamiento, que no se detallan en la model card.
- Riesgo de alucinación no aplica directamente, pero la puntuación puede ser errónea en consultas ambiguas o fuera del dominio médico.
- No se especifican cuantizaciones oficiales ni compatibilidad con formatos como GGUF, lo que puede limitar su despliegue en entornos con restricciones de memoria.
- La métrica P@1 reportada proviene de un dataset propio; no hay validación externa en benchmarks públicos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento para evitar problemas de propiedad intelectual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ymelka/camembert-med-reranker-v2-base
- Modelo base: https://huggingface.co/antoinelouis/crossencoder-camembert-base-mmarcoFR
- Documentación de CamemBERT: https://huggingface.co/docs/transformers/model_doc/camembert
- Reranker alternativo en francés: https://huggingface.co/tomaarsen/reranker-camembertv2-base-fr-lambda
