# wesjos/Ling-3.0-tiny-CuteHuman-GGUF

## Resumen

Ling-3.0-tiny-CuteHuman-GGUF es una cuantización en formato GGUF del modelo ajustado `wesjos/Ling-3.0-tiny-CuteHuman-SFT`, construido sobre el modelo base `inclusionAI/Ling-3.0-tiny` de InclusionAI. Se trata de un modelo de lenguaje de arquitectura MoE (BailingMoeV3) con 7.893 millones de parámetros totales y aproximadamente 1.300 millones activos por token, derivado de la familia Ling 3.0. El ajuste fino "CuteHuman" introduce una persona conversacional específica, orientada a diálogo con un tono característico.

La relevancia de esta ficha reside en que empaqueta un modelo MoE de ~7,9B en un único archivo GGUF Q4_K_M de 4,5 GiB, pensado para inferencia local con llama.cpp. El autor reporta unas 220 tok/s de generación en una RTX 4090 con offload completo, lo que lo sitúa como una opción práctica para despliegue en consumer GPU con fines conversacionales en chino e inglés.

El modelo se publica bajo licencia MIT, con soporte declarado de chino (zh) e inglés (en), y está etiquetado como compatible con endpoints. No obstante, la información disponible es escasa en cuanto a datos de entrenamiento, benchmarks y evaluación sistemática, por lo que varias especificaciones se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (BailingMoeV3), transformer con mezcla de expertos |
| Parámetros totales | 7.893.392.800 (~7,9B) |
| Parámetros activos | ~1,3B (según model card del autor) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de llama-server con `-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | Q4_K_M (única publicada); Q8_0 y f16 convertibles localmente con `llama-quantize` |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | inclusionAI/Ling-3.0-tiny |
| Tamaño del repo | 4,8 GB |
| Archivo publicado | `ling3-cutehuman-v5-Q4_K_M.gguf` (4,5 GiB) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura BailingMoeV3 del modelo base Ling-3.0-tiny de InclusionAI: un transformer con mezcla de expertos (MoE) de 7,9B parámetros totales y aproximadamente 1,3B activos por token. Esta configuración busca mantener el coste computacional de inferencia cercano al de un modelo denso de ~1,3B mientras se preserva la capacidad representacional de un modelo de mayor tamaño. El contexto operativo empleado en los ejemplos de despliegue es de 32.768 tokens.

Sobre el modelo base se aplicó un ajuste fino supervisado (SFT) denominado "CuteHuman", orientado a dotar al modelo de una persona conversacional concreta. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla si el ajuste incluyó datos multilingües más allá del chino e inglés declarados. El paquete GGUF incluye la plantilla de chat oficial (`chat_template.jinja`) embebida, lo que permite usar `--jinja` en llama.cpp para aplicar el formato correcto de roles.

## Capacidades

- Generación de texto conversacional multi-turno con una persona definida ("CuteHuman").
- Razonamiento y diálogo en chino e inglés.
- Modo de pensamiento (`enable_thinking=True`) a través de la plantilla oficial de chat.
- Compatibilidad con llama.cpp y servidores compatibles con endpoints (`endpoints_compatible`).
- Soporte de plantilla de chat Jinja para formateo de roles.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes multi-paso en la información disponible.
- Capacidades de código y matemáticas no evaluadas ni documentadas.

## Casos de uso

- Asistente conversacional local con persona definida: el ajuste CuteHuman está pensado para diálogo con un tono concreto, desplegable en una RTX 4090 con llama-server y contexto de 32.768 tokens para conversaciones largas.
- Chatbot de escritorio o prototipado rápido: el archivo GGUF Q4_K_M de 4,5 GiB cabe en GPUs de consumo y se carga en unos 30 s, lo que facilita iterar sobre prompts y persona sin infraestructura de servidor.
- Evaluación de personas y estilos de respuesta: útil para investigadores que quieran comparar el efecto de un SFT de persona sobre un MoE de ~7,9B frente al modelo base.
- Servicio de bajo coste con endpoints compatibles: al estar etiquetado como `endpoints_compatible`, puede exponerse detrás de una API compatible con OpenAI para aplicaciones de chat en zh/en.
- Generación de diálogo sintético en chino e inglés: el throughput reportado (~220 tok/s en 4090) permite generar volúmenes moderados de conversaciones para datasets o pruebas.
- Despliegue en entornos con recursos limitados: el bajo número de parámetros activos (~1,3B) reduce el coste por token frente a modelos densos de tamaño similar, adecuado para demos y entornos de desarrollo.
- Experimentación con cuantización: el autor documenta cómo generar Q8_0 o f16 con `llama-quantize`, útil para comparar calidad frente a velocidad en pipelines de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

El único dato de rendimiento reportado por el autor es de inferencia local:

| Métrica | Valor | Entorno |
|---|---|---|
| Velocidad de generación | ~220 tok/s | RTX 4090 24 GB, Q4_K_M, `-ngl 99` |
| Velocidad con backend transformers | ~8 tok/s | Mismo equipo (referencia comparativa) |
| Tiempo de carga | ~30 s | 4,5 GiB en VRAM |
| Inferencia en CPU | 1-2 órdenes de magnitud más lenta | Según el autor |

## Requisitos de hardware

- VRAM estimada: ~4,5 GiB para Q4_K_M con offload completo; Q8_0 y f16 requieren más VRAM (no cuantificada en la información disponible, pero proporcionalmente mayor).
- GPU recomendadas: RTX 4090 24 GB (medición reportada); cualquier GPU consumer con ≥6 GB de VRAM debería poder alojar Q4_K_M, aunque no se han publicado mediciones.
- Cabe en GPU consumer: sí, al menos en el caso de Q4_K_M; el autor lo probó en una RTX 4090.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extensión entornos compatibles con GGUF como Ollama o servidores con endpoints compatibles. No se documenta soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: ~220 tok/s de generación en RTX 4090 con Q4_K_M y `-ngl 99`; ~30 s de carga. En CPU, el autor advierte de una penalización de uno a dos órdenes de magnitud.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable. La siguiente tabla recoge únicamente los datos estructurales conocidos frente al modelo base del que deriva.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-tiny-CuteHuman-GGUF (este) | ~7,9B | ~1,3B | 32.768 (config. de despliegue) | MIT | GGUF |
| inclusionAI/Ling-3.0-tiny (base) | ~7,9B | ~1,3B | no disponible | no disponible | safetensors (presumible) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables adicionales con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- EOS débil: según el autor, el modelo base tiene una prioridad baja de emitir `<|role_end|>` al terminar, por lo que puede continuar generando texto. Recomienda `repeat_penalty=1.05` obligatorio y, en servidor, `--repeat-last-n` o muestreo DRY.
- Solo se publica Q4_K_M: no hay Q8_0 ni f16 listos; hay que convertirlos localmente con `llama-quantize`, lo que añade un paso y posibles pérdidas de calidad si no se valida.
- Idiomas limitados: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Sin benchmarks: no hay evaluación publicada de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad real frente al modelo base o a alternativas es desconocida.
- Riesgo de alucinación: no cuantificado; al ser un modelo pequeño con ajuste de persona, es esperable en tareas factuales, aunque no hay datos que lo confirmen.
- Sesgos: no documentados por el autor; el ajuste de persona puede introducir sesgos de estilo o contenido no evaluados.
- Uso comercial: la licencia MIT lo permite, pero conviene verificar la licencia del modelo base `inclusionAI/Ling-3.0-tiny`, que no se detalla en la información disponible.
- Advertencia de despliegue: el ejemplo de llama-server usa `--alias qwen3.8-27b`, un alias engañoso que no refleja el modelo real; puede confundir a clientes o logs.
- Persona específica: el ajuste "CuteHuman" condiciona el tono; para usos profesionales puede requerir system prompts que lo moderen.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/wesjos/Ling-3.0-tiny-CuteHuman-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio del ajuste SFT referenciado en la model card: `wesjos/Ling-3.0-tiny-CuteHuman-SFT` (no se proporciona URL directa en la información disponible)
- llama.cpp: https://github.com/ggml-org/llama.cpp (referencia de despliegue; no enlazado explícitamente en la model card)
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
