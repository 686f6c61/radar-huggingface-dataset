# vennyvirtuoso/fixjson-0.5b

## Resumen

fixjson-0.5b es un ajuste fino (LoRA, empaquetado como adaptador PEFT) del modelo Qwen2.5-0.5B-Instruct, especializado en la reparación determinista de payloads JSON malformados, truncados o envueltos en texto conversacional, así como en la validación contra esquemas. Lo publica el usuario vennyvirtuoso bajo licencia Apache 2.0 y está pensado para integrarse en pipelines de agentes y function calling donde la salida estructurada debe ser siempre parseable.

El modelo resuelve un problema muy concreto en producción: los LLM generalistas fallan con frecuencia al emitir JSON válido (comillas simples, comas colgantes, booleanos en Python, preámbulos conversacionales). En lugar de recurrir a un modelo frontera para esta tarea mecánica, fixjson-0.5b ofrece una alternativa ligera de 494 millones de parámetros que cabe en hardware de gama baja y en el borde.

La relevancia actual viene de su orientación a agentes: el autor lo presenta como motor de reparación de latencia baja para pipelines MCP y tool-use. No obstante, la model card mezcla afirmaciones de rendimiento (latencia "sub-15 ms" en el texto destacado frente a 903,9 ms/repair en la tabla de benchmarks) que conviene tratar con cautela, y el repositorio no tiene descargas ni validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (la model card menciona entrenamiento en bfloat16/fp16, no cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; el autor indica que se puede fusionar con el base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con atención causal estándar y RoPE. Sobre esa base se aplica un ajuste fino con PEFT (LoRA) orientado a una única tarea: transformar texto con JSON roto o conversacional en JSON conforme a RFC 8259, sin preámbulos ni vallas de código Markdown. El repositorio pesa 1,0 GB y contiene los pesos del adaptador en safetensors.

El entrenamiento se realizó, según la model card, sobre el dataset "FixJSON Agentic Corrupted Corpus", descrito como 10.000 pares con esquema impuesto. No se detallan hiperparámetros, número de tokens, composición del corpus, ni si hubo etapas de RLHF o DPO. Tampoco se especifica la longitud de contexto efectiva usada en el ajuste ni la estrategia de enmascarado de pérdida. La model card afirma evaluación sobre particiones "group-disjoint" para evitar fuga de datos, pero no aporta detalles metodológicos verificables.

## Capacidades

- Reparación de JSON: corrige comillas simples, comas colgantes, claves sin comillas, booleanos y nulos en estilo Python (`True`, `False`, `None`), truncamientos y anidamientos incompletos.
- Extracción de JSON embebido: aísla el objeto o array relevante de texto conversacional circundante y descarta el preámbulo.
- Validación contra esquema: la model card incluye la etiqueta `schema-validation` y reporta una tasa de coincidencia exacta de esquema del 88 %.
- Salida determinista: el ejemplo de uso emplea decodificación greedy (`do_sample=False`), coherente con el objetivo de reproducibilidad.
- Integración en pipelines de agentes: etiquetado para `agentic-ai`, `function-calling` y `tool-use`, pensado para normalizar argumentos de herramientas antes de su ejecución.
- Compatibilidad con `transformers`, `peft` y `sentence-transformers` según el autor.
- No se documentan capacidades de visión, audio, razonamiento general ni modo "thinking".

## Casos de uso

- Normalización de argumentos en function calling: antes de invocar una herramienta, el modelo recibe la salida cruda del LLM planificador y devuelve un JSON parseable que el orquestador puede validar con `json.loads` y un esquema JSON Schema.
- Middleware de reparación en microservicios: se despliega como paso previo a un validador estricto; si el payload falla, se envía a fixjson-0.5b y se reintenta el parseo, evitando reintentos costosos contra el modelo grande.
- Pipelines de agentes MCP: el autor lo orienta explícitamente a la extracción de parámetros de herramientas en flujos multi-paso, donde un único JSON inválido rompe la cadena de ejecución.
- Automatización local y robótica: al ser un modelo de 0,5 B, puede ejecutarse en dispositivos con recursos limitados para interpretar comandos estructurados sin depender de APIs externas.
- Limpieza de datos y ETL: reparación por lotes de registros JSON corruptos procedentes de logs, colas de mensajes o exportaciones antes de cargarlos en un almacén.
- Enrutamiento de API: extracción de campos como `endpoint`, `method` o `params` a partir de texto libre para construir peticiones HTTP válidas.
- Post-procesado en CI/CD de prompts: validar que las respuestas de un LLM cumplen el contrato de esquema antes de desplegar una nueva versión del prompt.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, sin verificación externa:

| Metrica | Valor |
|---|---|
| Tasa de JSON valido (fine-tuned) | 100,00 % |
| Tasa de JSON valido del base zero-shot | 98,00 % |
| Ganancia | +2,00 % |
| Coincidencia exacta de esquema | 88,00 % |
| Latencia por reparacion | 903,9 ms/repair |
| Parametros | 490 M (aproximado por el autor) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La cifra de latencia de la tabla (903,9 ms) contradice la afirmación de "sub-15 ms" del encabezado de la model card; ninguna de las dos está respaldada por una descripción del hardware o del protocolo de medición.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 1 GB para los pesos (494 M × 2 bytes) más overhead de activaciones y caché KV; viable en GPUs con 4 GB o más.
- Cuantización: al no publicarse versiones GGUF ni AWQ/GPTQ, la inferencia práctica requiere cargar el adaptador PEFT junto al base o fusionarlos previamente.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100 para despliegues de alto throughput con batching.
- CPU: ejecutable en CPU mediante `transformers` en fp32/bf16, aunque con latencia mayor; no hay pesos GGUF oficiales para llama.cpp u Ollama.
- Despliegue: `transformers` + `peft` (según el ejemplo del autor), `sentence-transformers` y potencialmente vLLM tras fusionar el adaptador; el autor menciona vLLM como framework recomendado.
- Latencia y throughput: el único dato publicado es 903,9 ms por reparación, sin especificar hardware; no hay cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fixjson-0.5b | 494 M | no disponible | Reparacion de JSON y validacion de esquema | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 tokens (según ficha del base) | LLM generalista | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (según ficha del base) | LLM generalista | Apache 2.0 | Hugging Face |
| Librerias deterministas de reparacion JSON (p. ej. json-repair) | no aplica | no aplica | Reparacion heuristica sin modelo | variable | PyPI/GitHub |

La comparación con el base es la más directa: fixjson-0.5b solo aporta valor si la tasa de JSON válido del base (98 % según el autor) resulta insuficiente en el dominio objetivo. Frente a librerías deterministas de reparación, un modelo de 0,5 B añade coste de inferencia y no garantiza determinismo absoluto, aunque puede manejar casos semánticos (extracción de JSON embebido en prosa) que las heurísticas no cubren.

## Limitaciones y advertencias

- El modelo es un adaptador LoRA: requiere cargar el base Qwen2.5-0.5B-Instruct o fusionarlo; no es un checkpoint autónomo listo para servir sin pasos adicionales.
- Las métricas de la model card no son verificables: no se describe el conjunto de test, el protocolo de evaluación ni el hardware de las mediciones de latencia.
- Contradicción interna en latencia: "sub-15 ms" en el texto destacado frente a 903,9 ms/repair en la tabla.
- Repositorio sin descargas ni likes en el momento de la consulta; sin validación por parte de la comunidad.
- Al ser un ajuste de un modelo de 0,5 B, la capacidad de razonamiento general y de manejo de JSON muy complejo o de gran longitud es limitada; el contexto efectivo no está documentado.
- Riesgo de alucinación: puede inventar campos o valores al "reparar" payloads ambiguos o truncados; conviene validar siempre contra un JSON Schema estricto después de la reparación.
- Idiomas soportados no documentados; el comportamiento en textos no ingleses es incierto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de borde sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/fixjson-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset referenciado por el autor: https://huggingface.co/datasets/FixJSON
- Repositorio vLLM (framework recomendado por el autor): https://github.com/vllm-project/vllm
- Repositorio PEFT: https://github.com/huggingface/peft
