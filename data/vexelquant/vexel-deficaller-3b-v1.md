# VexelQuant/Vexel-DeFiCaller-3B-v1

## Resumen

Vexel-DeFiCaller-3B-v1 es un modelo de lenguaje de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) desarrollado por VexelQuant Research, un proyecto que se presenta como un laboratorio de investigación cuantitativa aplicada a criptoactivos y finanzas descentralizadas (DeFi). El modelo parte de la familia Qwen2 (según los tags del repositorio) y ha sido ajustado mediante SFT y GRPO (Group Relative Policy Optimization) con la librería Unsloth, con el objetivo declarado de convertir intenciones de trading en lenguaje natural o webhooks en parámetros de ejecución atómicos para exchanges descentralizados, emitiendo exclusivamente JSON válido y sin Markdown.

El problema que aborda es la latencia y la falta de determinismo en la capa de traducción entre una intención de negocio y una llamada on-chain: los LLM genéricos producen Markdown, texto explicativo o JSON malformado, lo que rompe pipelines de ejecución automatizada. El modelo se posiciona como un componente especializado de "router" de transacciones, con temperatura recomendada de 0,1 y un máximo de 128 tokens nuevos por generación, lo que sugiere un uso como función de transformación más que como asistente conversacional.

Es relevante ahora porque ejemplifica una tendencia de modelos pequeños y altamente especializados (3B) que se ajustan con RL para tareas de formato estricto y se despliegan en infraestructura propia (vLLM, llama.cpp) en lugar de depender de APIs en la nube. No obstante, el repositorio es muy reciente (creado el 3 de noviembre de 2026), no tiene descargas ni likes, y la model card contiene métricas internas que no están respaldadas por benchmarks públicos ni por detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (según tags del repositorio) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M en la model card); safetensors en precisión completa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen2, según los tags del repositorio (`qwen2`). El ajuste se realizó con Unsloth SFT seguido de GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo que compara grupos de respuestas generadas para una misma entrada y refuerza las que maximizan una recompensa definida. En este caso, la recompensa parece orientada a la conformidad estricta con JSON y a la ausencia de Markdown, dado que la model card reporta 100,0 % de conformidad JSON estricta y 0,0 % de alucinaciones de Markdown en su propia evaluación.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el tamaño del corpus de instrucciones de trading, ni los detalles del reward model o de las funciones de recompensa usadas en GRPO. Tampoco se documenta si hubo una fase de DPO adicional, ni si se aplicaron técnicas de decodificación especulativa o atención lineal. La única innovación declarada es el alineamiento para salida determinista y sin Markdown en un dominio muy acotado (parámetros de ejecución en DEX).

## Capacidades

- Generación de texto orientada a la conversión de intenciones de trading (lenguaje natural o webhooks) en parámetros de ejecución atómicos para exchanges descentralizados.
- Salida en JSON estricto como formato principal, con la model card afirmando 100,0 % de conformidad estricta en su evaluación interna.
- Supresión de Markdown y de texto explicativo (0,0 % de alucinaciones de Markdown reportadas por el autor).
- Ajuste por refuerzo (GRPO) para favorecer respuestas deterministas con temperatura baja (0,1 recomendada).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere despliegue como endpoint de inferencia.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, modo thinking ni multilingüismo. Los idiomas soportados figuran como no disponibles.

## Casos de uso

- Enrutamiento de órdenes en DEX: el modelo recibe una intención en lenguaje natural ("compra 2 ETH de USDC con 0,3 % de slippage en Uniswap v3") y devuelve un JSON con los parámetros de la transacción, adecuado para un pipeline que firma y envía la operación on-chain.
- Procesamiento de webhooks de trading: integrado como paso de normalización entre un sistema de señales y un ejecutor, convierte payloads heterogéneos en un esquema JSON fijo y validable, reduciendo la lógica ad-hoc en el código del ejecutor.
- Validación previa a la firma: al producir JSON estricto sin Markdown, la salida puede pasarse directamente a un validador de esquema (JSON Schema) antes de construir la transacción, lo que simplifica el control de errores.
- Backtesting y simulación: generar parámetros de ejecución estructurados a partir de descripciones históricas de operaciones para reconstruir escenarios y comparar estrategias sin intervención manual.
- Automatización de tesorería DeFi: traducir instrucciones operativas ("mueve el excedente de USDC al pool de mayor APY con riesgo bajo") a llamadas parametrizadas, siempre con revisión humana y límites de riesgo.
- Despliegue en infraestructura propia de baja latencia: al ser un modelo de 3B con variante GGUF Q4_K_M, puede ejecutarse en una GPU de consumo o incluso en CPU con llama.cpp, lo que encaja en entornos donde no se quiere depender de APIs externas por motivos de latencia o confidencialidad de la estrategia.

## Benchmarks y rendimiento

La model card incluye una tabla de métricas operativas internas, no benchmarks académicos estándar (MMLU, HumanEval, GSM8K). Se reproducen tal cual, advirtiendo que no hay metodología pública ni comparación verificable:

| Metrica | VexelQuant Aligned | Generic Base Model | Cloud LLM API |
|---|---|---|---|
| p50 Latency | 10727,81 ms | 115,0 ms | 920,0 ms |
| p95 Latency | 11159,45 ms | 185,0 ms | 1.450,0 ms |
| Strict JSON Compliance | 100,0 % | 74,2 % | 91,5 % |
| Markdown Hallucinations | 0,0 % | 22,8 % | 8,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras de latencia de la tabla son llamativas: el modelo alineado reporta un p50 de 10,7 segundos, muy superior al modelo base genérico (115 ms) y a la API en la nube (920 ms), lo que contradice la afirmación de "sub-20ms" del texto de la model card y sugiere que las mediciones no son comparables o que el entorno de evaluación difiere. No deben tomarse como indicativas de rendimiento en producción sin una reproducción independiente.

## Requisitos de hardware

- VRAM estimada: para 3,09 B parámetros, en FP16 se requieren aproximadamente 6,2 GB solo de pesos, más overhead de activaciones y KV cache; en Q4_K_M, alrededor de 2 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para cuantización Q4_K_M basta con 4-6 GB (RTX 3050, GTX 1660 Super, incluso iGPU con suficiente memoria compartida).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB o más, especialmente con cuantización GGUF.
- Opciones de despliegue: vLLM (ejemplo incluido en la model card), llama.cpp (ejemplo con `llama-cli` y Q4_K_M), y potencialmente Ollama o TGI mediante conversión, aunque no se documentan explícitamente.
- Latencia y throughput: la model card reporta p50 de 10,7 s y p95 de 11,2 s en su propia medición, cifras que no son coherentes con el objetivo declarado de "sub-20ms" ni con el tamaño del modelo; no se dispone de mediciones independientes de throughput (tokens/s).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para enrutamiento DeFi con salida JSON estricta. Como referencia de la misma categoría de tamaño (3B, licencia permisiva), se pueden considerar los Qwen2.5-3B y Llama-3.2-3B, aunque sus datos de rendimiento en esta tarea concreta no están disponibles en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Vexel-DeFiCaller-3B-v1 | 3,09 B | no disponible | Apache 2.0 | Enrutamiento DeFi, JSON estricto |
| Qwen2.5-3B | ~3 B | no disponible en esta ficha | Apache 2.0 (variantes) | Propósito general |
| Llama-3.2-3B | ~3 B | no disponible en esta ficha | Llama 3.2 Community License | Propósito general |

La comparación de rendimiento no está disponible: no hay benchmarks públicos del modelo de VexelQuant ni evaluaciones cruzadas con las alternativas en la tarea de generación de parámetros de ejecución DEX.

## Limitaciones y advertencias

- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026; no hay evidencia independiente de su calidad ni de la reproducibilidad de sus métricas.
- Las cifras de latencia de la model card (p50 de 10,7 s) contradicen la afirmación de "sub-20ms" y el propósito declarado de alta frecuencia; es imprescindible medir en el entorno propio antes de usarlo en producción.
- El modelo está altamente especializado en un dominio (parámetros de ejecución DeFi); su utilidad fuera de ese ámbito es previsiblemente muy limitada y no se documentan capacidades generales.
- No se especifican los idiomas soportados; la model card está en inglés y los prompts de ejemplo usan el formato ChatML de Qwen, pero no hay garantía de comportamiento multilingüe.
- Riesgo de alucinación en parámetros críticos: aunque el autor reporta 0,0 % de alucinaciones de Markdown, no hay datos sobre errores semánticos en direcciones, cantidades, tokens o slippage, que en un contexto financiero pueden tener consecuencias económicas directas.
- No se documenta el dataset de entrenamiento ni el proceso de anotación, por lo que no se puede evaluar sesgos de dominio (por ejemplo, sesgo hacia ciertos DEX, pares o cadenas).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor ofrece "licencias Foundry" y pesos a medida, lo que sugiere que las versiones personalizadas pueden tener términos distintos; conviene verificar con el autor antes de un despliegue comercial.
- Para producción financiera se recomienda validación de esquema, límites de riesgo, simulación previa y supervisión humana; el modelo no debe ser el único componente que autoriza transacciones.

## Enlaces

- HuggingFace: https://huggingface.co/VexelQuant/Vexel-DeFiCaller-3B-v1
- Sitio del autor: https://vexelquant.me
- GitHub del autor: https://github.com/VexelQuant
- Contacto comercial: founder@vexelquant.me
