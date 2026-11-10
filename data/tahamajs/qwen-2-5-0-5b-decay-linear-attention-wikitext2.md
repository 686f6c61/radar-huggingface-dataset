# tahamajs/qwen-2.5-0.5b-decay-linear-attention-wikitext2

## Resumen

Qwen-2.5-0.5B con atención lineal por decaimiento (decay_linear_attention) es un experimento de investigación publicado por el usuario tahamajs en Hugging Face. Se trata de una cirugía arquitectónica sobre el modelo base Qwen2.5-0.5B, en la que se sustituye el mecanismo de atención original por una variante de atención lineal con decaimiento, extraída del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El modelo resultante conserva el tokenizador y la estructura general de Qwen2.5, pero incorpora un patrón híbrido de atención (`hybrid_3_1`) que alterna capas con atención estándar y capas con atención lineal.

El modelo se ha destilado sobre el conjunto de datos WikiText-2 (`wikitext-2-raw-v1`) durante 180,4 segundos en una NVIDIA RTX 3090, partiendo de una perplejidad causal pre-destilación de 535.483,80 y alcanzando 374,42 tras el proceso. Estos valores indican que el modelo es un artefacto de experimentación, no un modelo listo para producción: la perplejidad final sigue siendo muy elevada en comparación con el modelo base original.

La relevancia de esta ficha es documental y técnica: muestra cómo se puede trasplantar un mecanismo de atención alternativo en un transformer preentrenado y qué coste en calidad tiene hacerlo con un presupuesto de destilación mínimo. No dispone de pipeline declarado, licencia explícita ni idiomas documentados, y no se han publicado benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida (patrón `hybrid_3_1`: capas de atención estándar y capas de atención lineal por decaimiento) |
| Parametros totales | 535.590.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de aproximadamente 535 millones de parámetros. Sobre esa base se aplica una "cirugía" que sustituye el mecanismo de atención en un subconjunto de capas por `decay_linear_attention`, una atención lineal con decaimiento implementada en el registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El patrón `hybrid_3_1` indica una alternancia de tres capas con atención estándar por cada capa con atención lineal, aunque la model card no detalla la distribución exacta ni qué capas se ven afectadas.

El entrenamiento consiste en una destilación de conocimiento (KD) sobre WikiText-2 durante 180,4 segundos en una RTX 3090. No se especifican hiperparámetros, número de tokens, composición del dataset más allá de WikiText-2, ni si hubo RLHF o DPO. La métrica reportada es la perplejidad causal: 535.483,80 antes de la destilación y 374,42 después, con un delta de -535.109,38. Esa perplejidad final es órdenes de magnitud superior a la de un modelo de 0,5B bien entrenado, lo que sugiere que la destilación es insuficiente para recuperar la calidad del modelo original.

## Capacidades

- Generación de texto autoregresiva básica, heredada de la arquitectura Qwen2.5.
- Razonamiento y conocimiento factual muy degradados: la perplejidad de 374,42 en WikiText-2 indica una modelización del lenguaje pobre.
- Soporte de tool calling / function calling: no documentado y poco probable que se conserve tras la cirugía.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el tokenizador de Qwen2.5 es multilingüe, pero el ajuste con WikiText-2 (inglés) no lo garantiza.
- Modo thinking, visión o audio: no disponible.
- Atención lineal con decaimiento: capacidad arquitectónica experimental, no una funcionalidad de usuario.

## Casos de uso

- Investigación sobre atención lineal: el modelo sirve como banco de pruebas para estudiar cómo afecta el trasplante de `decay_linear_attention` a la perplejidad y a la estabilidad del entrenamiento en un transformer preentrenado.
- Comparación de mecanismos de atención: permite medir el coste de sustituir atención estándar por atención lineal en un patrón híbrido `hybrid_3_1` frente al Qwen2.5-0.5B original.
- Reproducción de experimentos de destilación: la model card documenta tiempos (180,4 s) y hardware (RTX 3090), lo que facilita replicar el pipeline de KD sobre WikiText-2.
- Estudio de eficiencia computacional: la atención lineal reduce el coste cuadrático en secuencias largas; el modelo permite medir latencia y memoria frente a la atención estándar, aunque no se publican cifras.
- Docencia y divulgación: ejemplo didáctico de cirugía arquitectónica y de por qué la destilación breve no basta para preservar calidad.
- Base para fine-tuning posterior: podría usarse como punto de partida para experimentos que intenten recuperar calidad con más datos o más pasos de entrenamiento, siempre asumiendo el riesgo de degradación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada es la perplejidad causal en WikiText-2:

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-KD | 535.483,80 |
| Perplejidad causal post-KD | 374,42 |
| Delta de perplejidad | -535.109,38 |
| Tiempo de destilación | 180,4 s |
| Hardware de destilación | NVIDIA RTX 3090 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1 GB solo para pesos (535,6 M de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB para pesos; en 4 bits, alrededor de 0,3 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo en fp16; una RTX 3090 se usó para la destilación.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se gestione la memoria de activaciones.
- Opciones de despliegue: al ser safetensors con arquitectura Qwen2 modificada, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está garantizada; requeriría una implementación que soporte `decay_linear_attention` y el patrón híbrido. No se documenta ninguna.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-decay-linear-attention-wikitext2 | 535,6 M | no disponible | no disponible | Hugging Face, 0 descargas | Experimento de atención lineal, PPL 374,42 en WikiText-2 |
| Qwen2.5-0.5B (base) | ~494 M (0,5 B) | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Hugging Face, ampliamente usado | Modelo base original, calidad muy superior |
| Modelos de atención lineal comparables (p. ej. variantes Mamba o RWKV de tamaño similar) | variable | variable | variable | variable | No se dispone de datos concretos en la información proporcionada |

La comparación directa con el Qwen2.5-0.5B original es la más relevante: el experimento degrada la perplejidad de forma drástica, por lo que no es un sustituto funcional del base.

## Limitaciones y advertencias

- Calidad muy degradada: la perplejidad post-destilación de 374,42 en WikiText-2 es muy alta para un modelo de este tamaño, lo que implica generación de texto pobre y propensa a incoherencias.
- Riesgo elevado de alucinación y de errores factuales, derivado de la baja calidad de modelización del lenguaje.
- Sin licencia declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base Qwen2.5-0.5B (Apache 2.0 según su documentación pública) y verificar compatibilidad.
- Idiomas no documentados: el ajuste con WikiText-2 es en inglés; el comportamiento en castellano no está evaluado.
- Contexto no confirmado: aunque herede la configuración de Qwen2.5, la cirugía de atención puede alterar el comportamiento en secuencias largas; no hay datos.
- Compatibilidad de despliegue limitada: la arquitectura modificada probablemente no carga en frameworks estándar sin adaptaciones.
- Sin benchmarks ni evaluación de seguridad: no hay datos sobre sesgos, toxicidad o robustez.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la ficha; no hay comunidad ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-decay-linear-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio NeuralOps: no disponible en la información proporcionada
- Paper o blog del método `decay_linear_attention`: no disponible en la información proporcionada
