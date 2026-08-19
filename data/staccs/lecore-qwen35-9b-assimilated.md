# staccs/lecore-qwen35-9b-assimilated

## Resumen
`lecore-qwen35-9b-assimilated` es un checkpoint derivado de `Qwen/Qwen3.5-9B` (Apache 2.0) que ha pasado por el "Unicron gate" del framework leCore, un sistema de asimilación y certificación de pesos desarrollado por el autor `staccs`. El objetivo declarado es preparar el modelo base para operar como superficie sobre memoria holográfica (HRR/FHRR) y programas holográficos (HoloMachine), sin retrenar ni modificar los pesos originales. Es un "prove run" (prueba de concepto), no un modelo con capacidades mejoradas respecto al base.

El modelo mantiene exactamente la arquitectura y los pesos de Qwen3.5-9B: la perplejidad muestral medida es idéntica (2.043 antes y después, delta +0.00%). Su relevancia radica en que ofrece una vía de integración con el ecosistema leCore para memoria externa tolerante a daños y operaciones compositivas, manteniendo la ventana de contexto nativa de 262.144 tokens del base (extensible a ~1M con YaRN). No se ha publicado ninguna mejora de rendimiento en tareas estándar; la propuesta de valor es la capa de memoria, no la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; ~1M con extension YaRN (upstream) |
| Tipos de cuantizacion | BF16 (pesos en repo); no se mencionan GGUF ni otras cuantizaciones en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo es una copia exacta de Qwen3.5-9B en cuanto a arquitectura y pesos. El proceso "Unicron assimilate" del framework leCore (versión 0.2.11) analiza cada matriz de pesos para clasificar su régimen de entrenamiento (cola pesada vs. bien entrenada) y, en este caso concreto, no filtra ni modifica ningún parámetro ("0 filtered, heavy-tail passthrough"). No hay entrenamiento adicional, RLHF ni DPO. La innovación técnica declarada reside en el sidecar de leCore: memoria holográfica basada en HRR (Holographic Reduced Representations) y FHRR (Fourier HRR), que permite operaciones de bind/unbind invertibles y programas HoloMachine sobre la misma álgebra. El checkpoint actúa como "drop-in" del base, manteniendo las mismas formas y comportamiento.

## Capacidades
- Generación de texto y razonamiento: idénticas a Qwen3.5-9B, ya que los pesos no se han alterado.
- Longitud de contexto amplia: 262.144 tokens nativos, suficiente para documentos largos, repositorios completos o conversaciones multi-turno extensas.
- Integración con memoria holográfica: a través del framework leCore 0.2.11, el modelo puede usar HRR para almacenar y recuperar hechos con tolerancia a daños (hasta 40% de slots corruptos mantienen 100% de recall en pruebas internas).
- Operaciones compositivas: bind/unbind con FHRR para asociar nombres, atributos y valores mediante álgebra invertible.
- HoloMachine: ejecución de secuencias de instrucciones holográficas deterministas e inspeccionables sobre la memoria.
- No se mencionan capacidades específicas de tool calling, agentes, visión ni audio más allá de las heredadas del base (el pipeline se etiqueta como image-text-to-text, pero no se detallan funcionalidades adicionales).

## Casos de uso
- Gestión de documentos largos: procesar un libro completo o un gran fragmento de código en una sola pasada gracias a los 262k tokens de contexto, sin perder el inicio de la conversación.
- Memoria persistente para asistentes conversacionales: usar la capa HRR como scratchpad externo que sobrevive a corrupción parcial de datos, útil en entornos distribuidos o con fallos intermitentes.
- Composición de hechos en sistemas de conocimiento: aplicar bind/unbind FHRR para asociar entidades y atributos de forma matemáticamente invertible, facilitando actualizaciones y consultas sin reentrenar.
- Prototipado de agentes con memoria externa: integrar HoloMachine para ejecutar programas deterministas sobre el estado holográfico, útil en pipelines de razonamiento multi-paso.
- Evaluación de la integridad de pesos: usar el gate Unicron como certificación de que un checkpoint no ha sido alterado significativamente (perplejidad constante).
- Investigación en memoria holográfica aplicada a LLMs: servir como base estable y bien documentada para experimentos con HRR sin necesidad de retrenar un modelo desde cero.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la diferencia de capacidad frente al Qwen3.5-9B original es del 0.00% (medida por perplejidad muestral y reproducida independientemente por "ratimics v6"). No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 18–24 GB en BF16 con KV cache, según la tabla de la model card.
- GPU recomendadas: tarjetas con al menos 24 GB de VRAM (RTX 3090/4090, A100 40GB, etc.) para ejecución cómoda en BF16.
- Compatibilidad con GPU de consumo: sí, en RTX 3090/4090 (24 GB) se puede ejecutar, aunque el margen para KV cache larga es limitado.
- Opciones de despliegue: compatible con transformers y `device_map="auto"`; no se mencionan integraciones específicas con vLLM, llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
La comparativa más directa es con el modelo base original y con alternativas de tamaño similar (8-10B). No se dispone de datos de rendimiento para otros modelos en la información proporcionada.

| Modelo | Parametros | Contexto nativo | Licencia | Notas |
|---|---|---|---|---|
| lecore-qwen35-9b-assimilated | 9.65B | 262k | Apache 2.0 | Pesos idénticos al base; añade capa HRR |
| Qwen/Qwen3.5-9B | 9.65B | 262k | Apache 2.0 | Modelo original, sin capa HRR |
| DeepSeek-V4-Flash (referencia en card) | no disponible | no disponible | MIT | Mencionado como objetivo futuro, no comparable en tamaño |

## Limitaciones y advertencias
- No ofrece ninguna mejora de precisión, velocidad ni capacidad frente al Qwen3.5-9B original: la asimilación es un proceso de certificación, no de entrenamiento. Cualquier expectativa de "modelo mejorado" es incorrecta.
- La capa HRR es un sidecar externo: requiere el framework leCore 0.2.11 para funcionar; sin él, el checkpoint se comporta exactamente como el base.
- La memoria holográfica tiene un límite de capacidad medido ("capacity cliff"); no es infinita ni sustituye al contexto del transformer.
- No se han publicado evaluaciones de sesgos, alucinación ni robustez en tareas reales; los datos de tolerancia a daños provienen de pruebas internas del autor.
- Los idiomas soportados no están documentados; se asumen los del base Qwen3.5-9B, pero no se confirma.
- El repo tiene solo 21 descargas y 0 likes; es un proyecto de autor individual con soporte comunitario limitado.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/staccs/lecore-qwen35-9b-assimilated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repo relacionado (DeepSeek-V4-Flash HRR): https://huggingface.co/staccs/lecore-deepseek-v4-flash-hrr
- Framework leCore: mencionado como versión 0.2.11, sin enlace directo en la información proporcionada
