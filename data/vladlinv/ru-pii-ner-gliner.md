# vladlinv/ru-pii-ner-gliner

## Resumen

El modelo `vladlinv/ru-pii-ner-gliner` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de información personal identificable (PII) en textos en ruso. Está desarrollado por el autor vladlinv y forma parte de una colección más amplia de modelos orientados al procesamiento de datos personales en ruso. Se basa en la arquitectura GLiNER, un framework ligero de NER con capacidades zero-shot que permite extraer cualquier tipo de entidad definida por el usuario sin necesidad de entrenamiento específico para cada categoría.

La relevancia de este modelo radica en su enfoque práctico para la protección de datos: permite identificar nombres, direcciones, números de teléfono, correos electrónicos y otros datos sensibles en documentos rusos, lo que resulta útil para tareas de anonimización, cumplimiento normativo y auditoría de seguridad. Al estar basado en GLiNER, se espera que sea eficiente en CPU y en hardware de consumo, aunque no se dispone de especificaciones concretas sobre el tamaño o el contexto de este modelo en particular.

La ficha se elabora a partir de la información pública disponible en HuggingFace y en la documentación general de GLiNER. Dado que la model card del autor solo incluye la licencia, muchos parámetros técnicos específicos de este modelo no están disponibles y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (bidirectional transformer encoder) - no confirmado para este modelo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (inferido por el nombre, no confirmado) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

GLiNER es un modelo de NER basado en un encoder transformer bidireccional que procesa la secuencia de texto y las etiquetas de entidad en paralelo, lo que permite extraer múltiples entidades de una sola pasada. A diferencia de los LLM autogenerativos, GLiNER no genera tokens secuencialmente, sino que clasifica cada token o span como perteneciente o no a una entidad dada, lo que lo hace más rápido y ligero. El framework está diseñado para ser entrenado con pocos datos y para funcionar en CPU.

En cuanto a este modelo específico, no se ha publicado información sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica la licencia, por lo que no es posible detallar estos aspectos. Se asume que sigue la metodología estándar de GLiNER, pero no hay confirmación.

## Capacidades

- Detección de entidades de PII en texto ruso: nombres de personas, direcciones, números de teléfono, correos electrónicos, documentos de identidad, etc. (las categorías exactas no están documentadas).
- NER zero-shot: al estar basado en GLiNER, puede extraer tipos de entidades definidos dinámicamente por el usuario sin reentrenamiento.
- Inferencia eficiente en CPU y hardware de consumo, gracias al diseño ligero de GLiNER.
- Procesamiento paralelo de entidades: extrae todas las entidades de una secuencia en una sola pasada, a diferencia de los LLM autogenerativos.
- No se ha confirmado soporte para tool calling, agentes, visión, audio u otras capacidades multimodales.

## Casos de uso

- Anonimización de documentos legales y administrativos en ruso: el modelo puede identificar y marcar datos personales en contratos, actas o expedientes para su posterior enmascaramiento o eliminación, cumpliendo con la legislación rusa de protección de datos (Ley Federal 152-FZ).
- Auditoría de bases de datos y logs: permite escanear registros de servidores o aplicaciones para detectar fugas de información personal antes de que se almacenen o compartan.
- Cumplimiento normativo en empresas que operan en Rusia: ayuda a verificar que los datos personales de clientes y empleados no se exponen en documentos internos o comunicaciones.
- Preprocesamiento de datos para entrenamiento de modelos: se puede usar para limpiar datasets que contengan PII antes de utilizarlos en tareas de NLP, evitando problemas de privacidad.
- Filtrado de contenido en plataformas de mensajería o foros: detección automática de números de teléfono o direcciones publicadas sin consentimiento, para moderación.
- Integración en pipelines de extracción de información: combinado con otras herramientas, puede servir como componente de un sistema más amplio de procesamiento de documentos en ruso, por ejemplo, para clasificar correos electrónicos o formularios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de NER (como F1) para este modelo. Tampoco se dispone de comparaciones con otros modelos de detección de PII en ruso.

## Requisitos de hardware

- No se dispone de información específica sobre VRAM o requisitos de memoria para este modelo.
- Dado que GLiNER está diseñado para ejecutarse en CPU y hardware de consumo, es probable que este modelo funcione en equipos sin GPU dedicada, pero no hay confirmación.
- No se han indicado GPUs recomendadas ni opciones de despliegue concretas (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se conocen datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de detección de PII en ruso. Existen alternativas como Presidio (que utiliza GLiNER como backend) o modelos de NER tradicionales como spaCy, pero no hay datos públicos que permitan comparar parámetros, rendimiento o licencias con este modelo concreto.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos de alucinación o limitaciones de contexto. Al ser un modelo pequeño basado en GLiNER, es probable que tenga menor precisión que LLM grandes en textos complejos o con jerga específica.
- No se ha confirmado el alcance exacto de las entidades PII que reconoce; puede no cubrir todos los tipos de datos personales definidos por la ley rusa.
- La licencia apache-2.0 permite uso comercial, pero no se especifican restricciones adicionales ni atribuciones requeridas.
- Al no haber benchmarks publicados, no se puede evaluar su rendimiento real en tareas de producción.
- El modelo está orientado al ruso; su uso en otros idiomas no está documentado y probablemente no funcione correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vladlinv/ru-pii-ner-gliner
- Colección RU PII Models: https://huggingface.co/collections/vladlinv/ru-pii-models
- Repositorio de GLiNER: https://github.com/urchade/GLiNER
- Paper de GLiNER: https://arxiv.org/abs/2311.08526
- Repositorio de GLiNER2: https://github.com/fastino-ai/GLiNER2
