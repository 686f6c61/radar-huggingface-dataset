# V-241176/HarveyLM

## Resumen

HarveyLM es un modelo de lenguaje causal especializado en dominio jurídico, desarrollado por el usuario V-241176 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un transformer decoder-only de 210 millones de parámetros (219M según la model card) preentrenado sobre corpus legales de la Corte Suprema y los Tribunales Superiores de la India. El modelo está diseñado para tareas de generación y comprensión de texto jurídico en inglés, un nicho donde los modelos generalistas suelen fallar por falta de terminología y estructuras procesales específicas.

Arquitectura compacta con 16 capas, dimensión oculta de 1024 y atención con Grouped Query Attention (16 cabezas de query, 4 de key/value). Incorpora ALiBi en lugar de embeddings posicionales aprendidos, SwiGLU en la FFN, atención y FFN en paralelo, embeddings atados y normalización QK-RMSNorm con Softmax Z-Loss para estabilidad numérica. La longitud máxima de secuencia es de 2048 tokens, suficiente para fragmentos de sentencias y contratos, pero limitada para documentos legales completos.

Su relevancia radica en ser un ejemplo de adaptación de dominio con un presupuesto de parámetros muy reducido (210M), lo que permite despliegue en hardware modesto, incluso CPU. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin benchmarks publicados, por lo que su calidad real no está validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con ALiBi, SwiGLU, GQA y atención/FFN en paralelo |
| Parametros totales | 210.013.216 (219M según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (repo solo contiene safetensors en fp32/bf16 presumiblemente; no se publican GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 16 capas, dimensión oculta de 1024 y una FFN con dimensión intermedia de 2752. La atención usa Grouped Query Attention con 16 cabezas de query y 4 de key/value, lo que reduce el coste de memoria del KV cache. Emplea ALiBi (Attention with Linear Biases) con pendientes \(2^{-8/H \cdot h}\) para extrapolación de longitud, SwiGLU como activación en la FFN, conexiones residuales con atención y FFN computadas en paralelo sobre la misma entrada normalizada, embeddings de entrada atados a la cabeza de salida y un vocabulario de 32.000 tokens. La estabilidad numérica se refuerza con QK-RMSNorm y Softmax Z-Loss.

El preentrenamiento se realizó sobre corpus legales de la Corte Suprema y Tribunales Superiores de la India, según la model card. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de instrucción, RLHF o DPO. Tampoco se documenta el tokenizador utilizado más allá del tamaño del vocabulario. La ausencia de estos datos impide evaluar la cobertura del dominio y el riesgo de sobreajuste.

## Capacidades

- Generación de texto causal en inglés con sesgo hacia el dominio jurídico indio.
- Comprensión y producción de terminología legal: citas de jurisprudencia, referencias a secciones de leyes, estructuras de sentencias.
- Modelo base (no instruido): no se documenta ajuste por instrucciones, por lo que su uso directo en chat o agentes requiere prompting few-shot o fine-tuning posterior.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; la ventana de 2048 tokens limita cadenas de razonamiento largas.
- Capacidades multilingües: solo inglés declarado; el corpus indio podría incluir transliteraciones, pero no se garantiza.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación y etiquetado de documentos legales: el modelo puede hacer fine-tuning para categorizar sentencias, escritos o contratos por materia (civil, penal, mercantil) aprovechando su vocabulario adaptado al dominio jurídico indio.
- Extracción de entidades legales: identificación de partes, jueces, tribunales, fechas y artículos citados en fragmentos de hasta 2048 tokens, útil para pipelines de digitalización de archivos judiciales.
- Generación asistida de borradores de cláusulas: con fine-tuning supervisado, puede redactar borradores de cláusulas contractuales estándar en inglés jurídico, revisables posteriormente por un profesional.
- Resumen de fragmentos de sentencias: condensar párrafos de resoluciones judiciales en resúmenes breves, dado que la ventana de 2048 tokens cubre secciones individuales pero no documentos completos.
- Búsqueda semántica en bases de jurisprudencia: generar embeddings o puntuaciones de relevancia para recuperar precedentes similares en un sistema RAG legal, siempre con un encoder o índice externo.
- Investigación académica en NLP jurídico: servir como baseline ligero (210M) para experimentos de adaptación de dominio y comparación con modelos legales de mayor tamaño, desplegable en una sola GPU consumer o incluso en CPU.
- Filtrado y preprocesado en pipelines de e-discovery: detección de pasajes relevantes en grandes volúmenes de texto legal antes de pasarlos a un modelo mayor, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,42 GB para los pesos (210M × 2 bytes), más KV cache y activaciones; en la práctica menos de 2 GB para secuencias de 2048 tokens.
- VRAM estimada en fp32: aproximadamente 0,84 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo es sobredimensionado para GPUs de datacenter; su hábitat natural es consumer o CPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más; también puede ejecutarse en CPU con llama.cpp si se convierte a GGUF (no se publican pesos GGUF oficiales).
- Opciones de despliegue: transformers (PyTorch) de forma nativa; conversión manual a GGUF para llama.cpp/Ollama; vLLM y TGI son compatibles en teoría con la arquitectura, pero no hay configuración publicada ni verificación.
- Latencia y throughput estimados: no disponibles; para un modelo de 210M en una RTX 4090 se esperaría un throughput alto (cientos de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HarveyLM | 210M | 2048 | Legal (India) | Apache 2.0 | Hugging Face, 0 descargas |
| LegalBERT | 110M | 512 | Legal (UK/EU) | Apache 2.0 | Hugging Face, ampliamente usado |
| SaulLM-7B | 7B | 4096 | Legal (general) | MIT | Hugging Face, con benchmarks publicados |
| TinyLlama-1.1B | 1,1B | 2048 | Generalista | Apache 2.0 | Hugging Face, con benchmarks publicados |

No se dispone de benchmarks de HarveyLM que permitan una comparación cuantitativa de rendimiento con estas alternativas. La comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para responder preguntas directas ni para uso conversacional sin fine-tuning.
- Ventana de contexto de 2048 tokens: insuficiente para documentos legales completos (sentencias, contratos extensos), lo que obliga a fragmentar y perder coherencia global.
- Solo inglés: no soporta castellano ni otras lenguas; el corpus indio puede introducir sesgos lingüísticos y terminología específica del sistema jurídico indio poco transferible a otras jurisdicciones.
- Riesgo de alucinación elevado: al ser un modelo pequeño y sin benchmarks, la generación de citas legales, artículos o jurisprudencia puede ser inventada; no debe usarse como fuente de verdad jurídica sin verificación humana.
- Sesgos potenciales: el corpus de la Corte Suprema y Tribunales Superiores de la India puede reflejar sesgos históricos, de género, de casta o de clase presentes en las resoluciones; no se documenta ningún proceso de mitigación.
- Sin validación comunitaria: cero descargas y cero likes, sin pipeline declarado, sin evaluación independiente; la calidad real del modelo es desconocida.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación sobre el dataset de entrenamiento implica riesgo de contaminación con material protegido o datos personales.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- Fecha de creación futura (2026-11-13) en los metadatos: posible inconsistencia o error de publicación que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/V-241176/HarveyLM
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
