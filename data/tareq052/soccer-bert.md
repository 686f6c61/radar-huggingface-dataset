# tareq052/soccer-bert

## Resumen

Soccer-BERT es un modelo de lenguaje específico de fútbol, multilingüe, desarrollado por tareq052 (Md Tareq Shah Alam) y publicado en Hugging Face con licencia MIT. Está diseñado para comprender y generar texto relacionado con el fútbol en seis idiomas: inglés, español, portugués, árabe, bengalí e hindi. El modelo se encuentra en una fase intermedia de entrenamiento (fase 2 de 3), con un dataset de 3,72 GB compuesto por textos de fútbol y Wikipedia.

A pesar de su nombre, la model card lo describe como un transformer decoder-only (arquitectura tipo GPT) con 159 millones de parámetros, 10 capas, 8 cabezas de atención y una dimensión de embedding de 512. Su longitud de contexto es de 512 tokens y utiliza un vocabulario de 250 002 tokens basado en XLM-RoBERTa. Es un modelo relativamente pequeño, pensado para tareas de generación de texto en el dominio futbolístico, aunque aún no ha completado la fase de ajuste supervisado (SFT) y no se han publicado benchmarks oficiales.

La relevancia de este modelo radica en su especialización vertical y su carácter multilingüe, algo poco común en modelos de este tamaño. Sin embargo, su estado inacabado y la falta de evaluación pública limitan su uso en producción. Es un proyecto en desarrollo que puede interesar a investigadores y desarrolladores que buscan modelos de nicho para el dominio deportivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 159 767 552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16) |
| Idiomas soportados | en, es, pt, ar, bn, hi |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only, similar a la familia GPT, aunque el nombre "BERT" sugiere una posible confusión en la denominación por parte del autor. La model card indica 10 capas, 8 cabezas de atención, dimensión de embedding de 512 y un vocabulario de 250 002 tokens basado en XLM-RoBERTa. Esta configuración es comparable a modelos como GPT-2 pequeño, pero con un vocabulario más amplio para soportar múltiples idiomas.

El entrenamiento se realiza desde cero (no es un fine-tuning de un modelo existente) sobre un dataset de 3,72 GB que combina textos de fútbol y Wikipedia. El proyecto está dividido en tres fases: actualmente se encuentra en la fase 2 de 3, lo que implica que aún no ha recibido ajuste supervisado (SFT). No se especifica el número total de tokens de entrenamiento ni si se han aplicado técnicas como RLHF o DPO. Tampoco se detalla la composición exacta del dataset ni el método de tokenización, aunque el uso del vocabulario de XLM-RoBERTa sugiere una tokenización subpalabra compatible con ese modelo.

## Capacidades

- Generación de texto en el dominio del fútbol: puede producir descripciones, resúmenes o comentarios relacionados con partidos, jugadores y tácticas, aunque su entrenamiento incompleto limita la calidad.
- Multilingüismo: soporta seis idiomas (inglés, español, portugués, árabe, bengalí e hindi), lo que permite su uso en contextos internacionales.
- Comprensión de vocabulario específico: al estar entrenado con datos de fútbol, reconoce terminología deportiva como nombres de clubes, posiciones, estadísticas y expresiones propias del deporte.
- Modelo generativo de propósito general limitado: al ser un decoder-only, puede realizar tareas de continuación de texto, aunque su especialización y su tamaño reducido lo hacen menos versátil que modelos generalistas.
- No dispone de tool calling, function calling, soporte para agentes, razonamiento multi-paso explícito, ni capacidades multimodales (visión, audio). Tampoco tiene un modo de "thinking" diferenciado.

## Casos de uso

- Análisis de noticias deportivas multilingüe: el modelo puede procesar y resumir artículos de fútbol en varios idiomas, facilitando la agregación de información para aficionados o medios. Su conocimiento específico del dominio mejora la precisión en la extracción de entidades como equipos y jugadores.
- Generación de resúmenes de partidos: dado un conjunto de estadísticas o una narración en un idioma, puede generar un resumen conciso en otro idioma, gracias a su entrenamiento multilingüe.
- Chatbot de preguntas frecuentes sobre fútbol: integrado en una aplicación de mensajería, puede responder consultas básicas sobre reglas, historial de clubes o resultados, siempre que se le proporcione contexto adicional para evitar alucinaciones.
- Etiquetado y clasificación de textos deportivos: aunque no está diseñado explícitamente para clasificación, su representación interna podría utilizarse como extractor de características para tareas de análisis de sentimiento o categorización de noticias, mediante fine-tuning adicional.
- Asistente de redacción para periodistas deportivos: puede ayudar a generar borradores de crónicas o reportajes, ofreciendo frases y estructuras típicas del lenguaje futbolístico en varios idiomas.
- Investigación académica sobre NLP deportivo: sirve como punto de partida para estudiar la especialización de modelos pequeños en dominios verticales y el comportamiento multilingüe en contextos de pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Dado que el entrenamiento está en una fase intermedia y no ha recibido SFT, es probable que su rendimiento en tareas estándar sea inferior al de modelos generalistas de tamaño similar. No se dispone de datos objetivos para evaluar su calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: con 159 millones de parámetros, en fp32 se requieren aproximadamente 640 MB de memoria, en fp16 unos 320 MB y en int8 unos 160 MB. Esto cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia en fp16. Para entrenamiento o fine-tuning, se recomienda al menos 8 GB de VRAM (RTX 3070, RTX 4070).
- Compatibilidad con consumer GPU: sí, es totalmente viable en hardware de gama media.
- Opciones de despliegue: al ser un modelo PyTorch con pesos en safetensors, puede desplegarse con frameworks como vLLM, Hugging Face Transformers, o convertirse a GGUF para usarse con llama.cpp u Ollama. Sin embargo, no se han publicado conversiones GGUF ni integraciones específicas.
- Latencia y throughput: no se han medido oficialmente. Dado su tamaño, en una GPU moderna se puede esperar una latencia de decenas de milisegundos por token y un throughput de varios cientos de tokens por segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Soccer-BERT | 159M | 512 | 6 | MIT | En entrenamiento (fase 2/3) |
| BERT-base (multilingüe) | 110M | 512 | 104 | Apache 2.0 | Finalizado |
| DistilBERT-base | 66M | 512 | 1 (en) | Apache 2.0 | Finalizado |
| GPT-2 small | 124M | 1024 | 1 (en) | MIT | Finalizado |

Soccer-BERT es comparable en tamaño a BERT-base y GPT-2 small, pero su especialización en fútbol y su soporte multilingüe (aunque limitado a seis idiomas) lo diferencian. BERT-base multilingüe cubre muchos más idiomas pero no está especializado en fútbol. GPT-2 small tiene un contexto más largo (1024) pero solo inglés. La principal desventaja de Soccer-BERT es su estado inacabado: carece de SFT y de evaluación pública, lo que impide una comparación justa en rendimiento.

## Limitaciones y advertencias

- Modelo en fase de entrenamiento: se encuentra en la fase 2 de 3, sin ajuste supervisado (SFT). Esto implica que su comportamiento puede ser errático, con respuestas incoherentes o de baja calidad en tareas que requieren seguir instrucciones.
- Riesgo de alucinación: al ser un modelo generativo sin SFT ni RLHF, es propenso a inventar hechos, nombres o estadísticas, especialmente en un dominio donde los datos son muy específicos.
- Contexto corto: la ventana de 512 tokens limita la capacidad de manejar documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística limitada: aunque es multilingüe, solo cubre seis idiomas, y es probable que el rendimiento varíe significativamente entre ellos, especialmente en árabe, bengalí e hindi, que suelen tener menos datos.
- Sesgos y calidad de los datos: el dataset combina fútbol y Wikipedia, lo que puede introducir sesgos geográficos o culturales. No se ha documentado ninguna mitigación de sesgos.
- Sin garantías de producción: al ser un proyecto personal con 66 descargas y 1 like, no hay soporte comunitario ni mantenimiento garantizado. No se recomienda su uso en entornos críticos.
- Posible discrepancia de arquitectura: el nombre "BERT" sugiere un encoder, pero la model card indica decoder-only. Esta confusión puede afectar a la hora de integrar el modelo en pipelines existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tareq052/soccer-bert
- Perfil del autor: https://huggingface.co/tareq052
- Otro modelo del autor (football-gpt-v1): https://huggingface.co/tareq052/football-gpt-v1

No se han encontrado papers, repositorios de código o demos adicionales asociados a este modelo.
