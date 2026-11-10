# tahamajs/qwen-2.5-0.5b-goldfinch-ahn-wikitext2

## Resumen

Qwen-2.5-0.5B con atención NeuralOps `goldfinch_ahn` es un experimento de cirugía arquitectónica sobre el modelo base Qwen2.5-0.5B, publicado por el usuario tahamajs en Hugging Face. El autor sustituye el mecanismo de atención original del transformer por una implementación denominada `goldfinch_ahn`, registrada en un `ATTENTION_REGISTRY`, y aplica un patrón de sustitución híbrido `hybrid_3_1` sobre las capas del modelo. El checkpoint resultante se ha destilado posteriormente sobre el conjunto de datos WikiText-2 (`wikitext-2-raw-v1`) para recuperar la coherencia del lenguaje tras la intervención.

El interés del artefacto es fundamentalmente metodológico: documenta el impacto de reemplazar la atención estándar por un módulo alternativo en un modelo pequeño (564 millones de parámetros según los pesos en safetensors) y cuantifica la recuperación mediante perplejidad causal. Antes de la destilación, la perplejidad se dispara a 121.396,70; tras 180,2 segundos de destilación en una RTX 3090, baja a 316,25. Estos valores siguen siendo muy superiores a los de un Qwen2.5-0.5B intacto en WikiText-2, por lo que el modelo no debe interpretarse como un sustituto listo para producción del original.

No hay información publicada sobre licencia, idiomas soportados, pipeline de uso ni composición del dataset de entrenamiento más allá de WikiText-2. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su model card se limita a los metadatos del experimento de cirugía y destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención sustituida por `goldfinch_ahn` (patrón `hybrid_3_1`) |
| Parametros totales | 564.314.020 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,4 GB |
| Modelo base | Qwen2.5-0.5B |
| Dataset de destilación | WikiText-2 (`wikitext-2-raw-v1`) |
| Perplejidad causal pre-destilación | 121.396,70 |
| Perplejidad causal post-destilación | 316,25 |
| Tiempo de destilación | 180,2 s en NVIDIA RTX 3090 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar, y aplica una cirugía que reemplaza el módulo de atención por `goldfinch_ahn`, una implementación registrada en el `ATTENTION_REGISTRY` del framework NeuralOps. El patrón `hybrid_3_1` indica que la sustitución no es uniforme en todas las capas, sino que sigue una distribución híbrida (presumiblemente tres capas con atención original por cada capa con atención `goldfinch_ahn`, aunque la model card no detalla la asignación exacta). No se especifica si `goldfinch_ahn` es una atención lineal, una atención con sesgo posicional alternativo o una variante de atención dispersa.

El entrenamiento documentado es exclusivamente una fase de destilación de conocimiento sobre WikiText-2, ejecutada en 180,2 segundos en una RTX 3090. No se indica el número de tokens vistos, la temperatura de destilación, la función de pérdida exacta ni si hubo fases adicionales de ajuste fino, RLHF o DPO. La perplejidad causal pasa de 121.396,70 a 316,25, una reducción de 121.080,45 puntos, lo que confirma que la destilación recupera parte de la fluidez perdida tras la cirugía, pero el valor final sigue siendo muy alto para un modelo de 0,5B en WikiText-2 (un Qwen2.5-0.5B sin modificar suele situarse en el entorno de decenas de puntos de perplejidad en ese corpus, aunque no se aporta la cifra de referencia en la información disponible).

## Capacidades

- Generación de texto autoregresiva: hereda la capacidad del Qwen2.5-0.5B base, aunque degradada por la cirugía y la destilación parcial.
- Razonamiento básico y respuesta a instrucciones: no hay evidencia publicada de que el ajuste por instrucciones del base se haya preservado tras la sustitución de atención y la destilación en WikiText-2.
- Código y matemáticas: no disponible; no se han publicado evaluaciones específicas.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; la model card no declara idiomas.
- Modo thinking, visión o audio: no disponible; el modelo es solo texto.
- Capacidad especial: servir como banco de pruebas para evaluar el impacto de módulos de atención alternativos (`goldfinch_ahn`) en modelos pequeños.

## Casos de uso

- Investigación en cirugía de atención: el modelo permite reproducir el experimento de sustituir la atención de Qwen2.5-0.5B por `goldfinch_ahn` con patrón `hybrid_3_1` y medir la perplejidad antes y después de la destilación, usando la RTX 3090 como referencia de coste (180,2 s).
- Estudio de recuperación por destilación: sirve para analizar cuánto conocimiento se recupera al destilar sobre WikiText-2 tras una intervención arquitectónica agresiva, comparando la curva de perplejidad 121.396,70 → 316,25.
- Benchmark de módulos de atención alternativos: puede integrarse en pipelines de evaluación de variantes de atención dentro del `ATTENTION_REGISTRY` de NeuralOps, midiendo perplejidad causal como métrica primaria.
- Docencia y divulgación técnica: ejemplo didáctico de cómo una modificación en el mecanismo de atención degrada la fluidez y cómo la destilación la recupera parcialmente, con cifras concretas y reproducibles.
- Pruebas de infraestructura de inferencia: al ser un checkpoint de 1,4 GB en safetensors, es útil para validar pipelines de carga, tokenización y generación con modelos pequeños antes de escalar a variantes mayores.
- Análisis de robustez de tokenizadores y posiciones: permite estudiar cómo interactúa el tokenizador de Qwen2.5 con una atención modificada en secuencias de WikiText-2, aunque sin garantías de calidad lingüística.
- No recomendado para: atención al cliente, generación de código en producción, agentes autónomos o cualquier tarea que exija coherencia lingüística alta, dado el nivel de perplejidad reportado.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad causal pre-destilación | 121.396,70 | Tras la cirugía, antes de destilar |
| Perplejidad causal post-destilación | 316,25 | Tras 180,2 s de destilación en RTX 3090 |
| Delta de perplejidad | -121.080,45 | Mejora absoluta |
| Tiempo de destilación | 180,2 s | NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 1,1-1,2 GB solo para pesos (564 M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 2-3 GB son suficientes para secuencias cortas.
- Cuantización: no se publican versiones GGUF ni cuantizadas; sería necesario generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo; el autor usó una RTX 3090 para la destilación.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (requiere el código o registro de `goldfinch_ahn` para reconstruir la arquitectura); vLLM, TGI o llama.cpp solo si se exporta a un formato compatible, lo cual no está documentado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-goldfinch-ahn-wikitext2 | 564.314.020 | no disponible | no disponible | Experimental, perplejidad 316,25 en WikiText-2 |
| Qwen2.5-0.5B (base original) | 0,49 B aprox. | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Producción, perplejidad muy inferior en WikiText-2 |
| Qwen2.5-1.5B | 1,5 B aprox. | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Producción, mayor calidad que el 0.5B |
| SmolLM2-360M | 0,36 B | 8.192 tokens (según documentación pública) | Apache 2.0 (según documentación pública) | Producción, alternativa pequeña para edge |

La comparación directa con el Qwen2.5-0.5B original no es posible con cifras de perplejidad porque la información proporcionada no incluye la referencia del base en WikiText-2; los datos de contexto y licencia de los modelos comparados provienen de documentación pública general y no de la model card de este repositorio.

## Limitaciones y advertencias

- Perplejidad causal de 316,25 en WikiText-2 tras la destilación: muy superior a la de un modelo intacto, lo que indica degradación severa de la fluidez y coherencia.
- La cirugía `hybrid_3_1` con `goldfinch_ahn` no está documentada en detalle; se desconoce qué capas usan atención original y cuáles la modificada.
- No se ha publicado licencia: no se puede garantizar el uso comercial ni la redistribución.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- No hay evaluación de sesgos, alucinación ni seguridad.
- No se documenta si el ajuste por instrucciones del Qwen2.5-0.5B base se preserva tras la sustitución y la destilación en WikiText-2.
- El repositorio tiene 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por terceros.
- Requiere código personalizado (`ATTENTION_REGISTRY` de NeuralOps) para cargar la arquitectura; no es un checkpoint estándar de `transformers`.
- Fecha de creación y actualización en 2026: verificar la vigencia y el estado del framework NeuralOps antes de depender de él.
- No apto para tareas de producción que exijan calidad lingüística, tool calling o razonamiento fiable.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-goldfinch-ahn-wikitext2
- Modelo base referenciado en la model card: `/dev/shm/Qwen2.5-0.5B` (ruta local, no enlace público)
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Qwen2.5-0.5B (modelo base público): https://huggingface.co/Qwen/Qwen2.5-0.5B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
