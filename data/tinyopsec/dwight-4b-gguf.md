# tinyopsec/dwight-4b-GGUF

## Resumen

Dwight-4b (GGUF) es una colección de cuantizaciones en formato GGUF del modelo `zime-ai/dwight-4b`, un modelo de 4.000 millones de parámetros especializado en el análisis y la toma de decisiones sobre llamadas de ventas (sales-call decisions and insights). El modelo base es Qwen3-4B-Instruct-2507, de Alibaba, un transformer instruido de la familia Qwen3, y las cuantizaciones han sido producidas con llama.cpp por el usuario tinyopsec.

El problema que resuelve es la automatización de tareas de conversation intelligence: clasificar y extraer conclusiones accionables de transcripciones o conversaciones comerciales, un dominio donde los modelos generales suelen necesitar ajuste fino específico. Al tratarse de un modelo de 4B con cuantizaciones desde 2 hasta 16 bits, es ejecutable en hardware de consumo, lo que lo hace atractivo para despliegues locales y análisis con requisitos de privacidad (las llamadas no necesitan salir de la infraestructura propia).

Su relevancia actual radica en la tendencia de crear modelos verticales pequeños y especializados a partir de bases abiertas como Qwen3, combinada con la licencia Apache 2.0, que permite uso comercial sin restricciones. La longitud de contexto exacta no está indicada en la model card, aunque la familia Qwen3-4B-Instruct-2507 soporta de forma nativa contextos largos (256K según la documentación oficial de Qwen, dato no confirmado en la model card de este repo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3), no disponible detalle completo |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la base Qwen3-4B-Instruct-2507 soporta 262.144 tokens según documentación de Qwen; no confirmado en la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (la base Qwen3 soporta multilingüe, incluido castellano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder denso de la generación Qwen3 de Alibaba, con la variante instruida publicada en 2025. No es una arquitectura MoE: los 4,02 mil millones de parámetros están activos en cada pasada. Sobre esta base, `zime-ai/dwight-4b` ha sido especializado para decisiones e insights en llamadas de ventas, presumiblemente mediante ajuste fino en datos del dominio de conversation intelligence, aunque la model card no detalla el método de entrenamiento, el número de tokens ni la composición del dataset.

Las cuantizaciones de este repositorio han sido generadas con llama.cpp, cubriendo el rango completo desde Q2_K (máxima compresión, ~1,5 GB aproximados) hasta F16 (precisión completa, ~8 GB). La model card recomienda explícitamente la variante Q4_K_M como punto de equilibrio entre calidad y tamaño. No se menciona el uso de técnicas como decodificación especulativa o attention lineal.

## Capacidades

- Análisis de llamadas de ventas: clasificación y extracción de insights sobre conversaciones comerciales (tags: sales, call-analysis, conversation-intelligence, classification).
- Toma de decisiones sobre llamadas: generación de veredictos o recomendaciones a partir de transcripciones de ventas.
- Generación de texto conversacional: heredada del modelo base Qwen3-4B-Instruct-2507, con pipeline etiquetado como text-generation y conversational.
- Clasificación de texto: etiquetado específico de classification en el repositorio.
- Capacidades generales de Qwen3 (razonamiento, código, matemáticas, multilingüe): presentes en la base, pero pueden haberse degradado o no estar garantizadas tras el ajuste fino vertical.
- No hay mención de tool calling, agentes, visión ni audio en la model card; no disponible.

## Casos de uso

- Puntuación automática de llamadas de ventas: procesar transcripciones de un CRM para clasificar cada llamada (resultado, objeciones, sentimiento) sin enviar datos a APIs externas, adecuado por su especialización en call-analysis.
- Cumplimiento normativo en contact centers: detectar si el agente realizó las disclosures obligatorias en cada llamada, ejecutando el modelo on-premise por privacidad de las conversaciones.
- Coaching de equipos comerciales: generar resúmenes e insights accionables de cada llamada para retroalimentación individual de los vendedores.
- Filtrado en tiempo real de leads: clasificar llamadas entrantes para enrutar las prometedoras a closers humanos y descartar las de bajo interés.
- Análisis masivo de histórico de llamadas: gracias a su tamaño de 4B y cuantizaciones de 4 bits, puede procesarse un gran volumen de grabaciones transcritas en GPUs de consumo o incluso CPU.
- Integración en pipelines ETL de conversation intelligence: formato GGUF compatible con llama.cpp, Ollama y LM Studio facilita su inclusión en flujos batch o en aplicaciones locales de escritorio.
- Prototipado de productos verticales de ventas: base Apache 2.0 sin restricciones comerciales para construir SaaS de análisis conversacional sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio de ventas, y remite únicamente a "evaluar antes de uso".

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización):
  - F16: ~8 GB
  - Q8_0: ~4,5 GB
  - Q6_K: ~3,5 GB
  - Q5_K_M / Q5_K_S / Q5_0: ~3 GB
  - Q4_K_M / Q4_K_S / Q4_0: ~2,5 GB (Q4_K_M recomendada)
  - Q3_K_L / Q3_K_M / Q3_K_S: ~2-2,5 GB
  - Q2_K: ~1,8-2 GB
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM para cuantizaciones medias (RTX 3060, RTX 4060); para contexto largo o F16, RTX 4090 o superiores. También viable en CPU puro dada la cuantización Q4.
- Cabe en GPUs de consumo: sí, incluso en portátiles con GPU de 4 GB usando Q4_K_M; ejecutable también en Apple Silicon vía llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, ejemplo incluido en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 4B cuantizado a 4 bits, es esperable una generación fluida en tiempo real en GPUs de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| dwight-4b (este) | 4,02 B | Llamadas de ventas / conversation intelligence | Apache 2.0 | GGUF |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | General, instruido | Apache 2.0 | Safetensors |
| zime-ai/dwight-4b (original) | 4,02 B | Llamadas de ventas | Apache 2.0 | Safetensors (presumible) |

Alternativas generales de tamaño similar (Llama 3.2 3B, Gemma 3 4B, Phi-4-mini) podrían cubrir el mismo dominio sin especialización, pero no hay datos publicados que permitan comparar rendimiento en tareas de ventas; no disponible.

## Limitaciones y advertencias

- La propia model card incluye un disclaimer: es un modelo de análisis de llamadas de ventas y debe evaluarse antes de su uso en producción.
- No hay benchmarks publicados: la calidad real en el dominio de ventas y la degradación de las capacidades generales de Qwen3 tras el ajuste fino son desconocidas.
- Riesgo de alucinación: como todo LLM de 4B, puede inventar detalles sobre las llamadas analizadas; crítico si se usa para decisiones de negocio o cumplimiento.
- Idiomas soportados no documentados: el ajuste fino pudo centrarse en inglés, lo que degradaría el rendimiento en castellano; verificar antes de uso.
- Las cuantizaciones agresivas (Q3, Q2_K) pueden degradar sensiblemente la precisión en tareas de clasificación fina.
- Licencia Apache 2.0 sin restricciones comerciales conocidas, pero conviene revisar también los términos del modelo base Qwen3.
- Contexto máximo no confirmado en la model card; si se procesan transcripciones largas, validar el límite efectivo del runtime elegido.
- Repositorio de un tercero (tinyopsec) que redistribuye cuantizaciones de un modelo de otro autor (zime-ai): verificar la procedencia e integridad de los pesos antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/dwight-4b-GGUF
- Modelo original: https://huggingface.co/zime-ai/dwight-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Organización Qwen: https://huggingface.co/Qwen
- Paper, blog o demo: no disponible
