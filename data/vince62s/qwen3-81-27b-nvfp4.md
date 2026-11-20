# vince62s/Qwen3.81-27B-NVFP4

## Resumen

Qwen3.81-27B-NVFP4 es una compilación cuantizada en NVFP4 (W4A4) del modelo fusionado Qwen3.81-27B, un checkpoint de 27.356 millones de parámetros construido por el usuario vince62s mediante un promedio lineal de parámetros al 50/50 entre dos fine-tunes hermanos de la familia Qwen3.5: RadixArk/DaisyRose-27B y sabicap/sabi-noema. El resultado es un modelo multimodal (image-text-to-text) con arquitectura híbrida de atención lineal, orientado a razonamiento, uso de terminal y tareas agénticas.

La relevancia de esta ficha no reside solo en el modelo, sino en el proceso documentado: el autor realizó un análisis tensor a tensor de los deltas de cada fine-tune respecto a su base común en fp32, comprobó que ambos deltas son prácticamente ortogonales (coseno ≈ 0 en las 64 capas de texto) y justificó así que el promedio uniforme preserva la señal combinada de ambos fine-tunes sin cancelación destructiva. Posteriormente aplicó una receta de cuantización NVFP4 con llmcompressor 0.15.0 que reduce el peso a 19 GB, permitiendo inferencia nativa en 4 bits sobre GPUs Blackwell.

El modelo se publica bajo licencia Apache 2.0, con idiomas declarados inglés y francés, y está pensado para despliegue en vLLM ≥ 0.31 con el parser de razonamiento de Qwen3. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una publicación muy reciente (20 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer híbrido con atención lineal, multimodal) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens configurados en el ejemplo de vLLM; hasta ~49k según KV disponible (49k cabe en una RTX 5090 de 32 GB con utilización 0,88) |
| Tipos de cuantizacion | NVFP4 (W4A4), group size 16, estrategia tensor_group; escalas fp8 e4m3; lm_head y torre de visión en bf16 |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato nvfp4-pack-quantized (compressed-tensors); 19 GB, 1184 tensores |

## Arquitectura y entrenamiento

El modelo base Qwen3.81-27B es una fusión por promedio lineal de parámetros (model soup) al 50/50 entre dos fine-tunes de la misma base Qwen3.5: DaisyRose-27B (fine-tune A, orientado a agentes y terminal) y sabi-noema (fine-tune B, base de razonamiento con atención lineal híbrida y multimodal). La fusión se realizó con aritmética fp32 y salida en bf16, tensor a tensor en streaming, con el atajo de que la torre de visión es bit-idéntica entre ambos deltas (ΔD = ΔS = 0) y pasa sin cambios. El análisis previo verificó que los 1184 tensores comparten esqueleto idéntico (dtype y shape), que la similitud coseno entre deltas es |cos| < 0,003 en las 64 capas de texto (ortogonalidad), y que la magnitud de los deltas alcanza su pico en capas medias (|ΔS| ~0,51 en capas 24-33; |ΔD| ~0,37 en capas 16-26). Con deltas ortogonales, el promedio uniforme preserva ~100% de la señal combinada (norma ≈ 0,30 por capa), por lo que no se aplicó reponderación por capa.

La cuantización NVFP4 se ejecutó con llmcompressor 0.15.0 en modo oneshot: esquema NVFP4 W4A4 con group size 16, observador de pesos minmax sin memoria, escalas fp8 e4m3, cuantización de activaciones estática con escalas recogidas en calibración sobre 512 muestras × 2048 tokens de contexto a partir de una mezcla local de chat y código (~525 muestras). El pipeline es secuencial por capas con offload a CPU, de modo que nunca requiere los 52 GB del modelo bf16 completos en VRAM. Se mantienen en bf16 el lm_head y toda la torre visual (model.visual.*). El resultado es un checkpoint de 19 GB, unas 2,9 veces más pequeño que la fusión bf16, con matmul nativo en 4 bits sobre Blackwell. La verificación incluyó una prueba de humo de generación en vLLM con compuertas de loglikelihood y CoT antes de la subida.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) activado por defecto y esfuerzo de razonamiento «xhigh».
- Razonamiento encadenado (CoT) verificado en pruebas generativas sobre GPQA Diamond.
- Capacidades multimodales de imagen a texto: pipeline image-text-to-text, arquitectura Qwen3_5ForConditionalGeneration, image_token_id 248056.
- Capacidades agénticas y de terminal: evaluado con Terminal-Bench 2.1 usando harbor y terminus-2, con pass@1.
- Razonamiento de múltiples pasos y resolución de tareas con herramientas de línea de comandos.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada (el modelo base es de la familia Qwen3.5, pero no se documenta en esta ficha).
- Multilingüe limitado a inglés y francés según los metadatos del repositorio.
- Plantilla de chat compatible con el formato de pensamiento de Qwen3.5 y parser de razonamiento qwen3 en vLLM.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo fue evaluado específicamente en Terminal-Bench 2.1 con el agente terminus-2, por lo que encaja en flujos donde un agente ejecuta comandos, interpreta salidas y corrige errores en un entorno de shell con contexto de hasta 40k tokens de entrada y 8k de salida.
- Razonamiento científico y QA de alto valor: los resultados en GPQA Diamond (43,9% en loglikelihood, 9/10 en compuerta CoT) lo hacen adecuado para preguntas de nivel posgrado en física, química y biología donde se requiere cadena de razonamiento explícita.
- Asistente multimodal de documentación técnica: al aceptar entrada image-text-to-text, puede procesar capturas de pantalla, diagramas o figuras junto con texto para generar explicaciones o resúmenes técnicos.
- Despliegue en estaciones de trabajo con GPU Blackwell: con 19 GB en NVFP4 y matmul nativo en 4 bits, cabe en una RTX 5090 de 32 GB con contexto de hasta ~49k tokens, lo que permite inferencia local de un modelo de 27B sin servicios en la nube.
- Servicio de chat multi-turno bilingüe (inglés/francés): la plantilla de chat con modo thinking y los parámetros de muestreo definidos (temperature 1.0, top_p 0.95, top_k 20) permiten desplegar un asistente conversacional con razonamiento visible.
- Investigación sobre fusión de modelos: los scripts analyze_deltas.py, merge_models.py y quantize_nvfp4.py replican todo el proceso con solo torch, safetensors y llmcompressor, lo que lo convierte en un caso de estudio reproducible para estudiar model soups y cuantización NVFP4.
- Evaluación de agentes con contexto controlado: el autor documenta que Terminus-2 debe recibir el contexto real vía --ak model_info para evitar bucles de resumen; sirve como banco de pruebas para ajustar agentes a ventanas de contexto realistas.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GPQA Diamond (espejo, 198 preguntas) | lm-eval 0.4.13, loglikelihood | 43,9% |
| GPQA Diamond (compuerta CoT, 10 preguntas) | generativo, temperature 0.6 | 9/10 |
| GPQA Diamond (compuerta CoT, 10 preguntas) | generativo, temperature 1.0 (muestreo del servidor) | 8/10 |
| Terminal-Bench 2.1 (subconjunto, pass@1) | harbor + terminus-2, timeouts de tarea ×3 | ~8/10 en lotes iniciales; suite completa de 89 tareas en curso |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de Terminal-Bench son preliminares y el propio autor indica que la suite completa está en progreso.

## Requisitos de hardware

- VRAM estimada para inferencia: 19 GB de pesos en NVFP4; con contexto de 49k tokens el autor indica que cabe en una GPU de 32 GB con utilización 0,88.
- GPU recomendadas: GPUs Blackwell con soporte nativo de matmul FP4, como la RTX 5090 (32 GB). El autor menciona «Blackwell (RTX 5090 etc.)»; no se documentan pruebas en A100, H100 ni otras arquitecturas.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB según el autor. No se confirma compatibilidad con GPUs de generaciones anteriores (Ampere, Ada) en la información disponible.
- Opciones de despliegue: vLLM ≥ 0.31 con --reasoning-parser qwen3 y --max-model-len ajustable; el formato nvfp4-pack-quantized de compressed-tensors es específico de este stack. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. El autor solo reporta una prueba de humo de generación (loglikelihood + compuertas CoT) sin cifras de rendimiento.
- Requisito de contexto en agentes: para Terminal-Bench con terminus-2 hay que pasar --ak model_info con max_input_tokens 40000 y max_output_tokens 8192; de lo contrario el agente asume ~1M tokens, desborda el servidor de 49k y entra en un bucle de resumen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.81-27B-NVFP4 (este) | 27,36B | 32k configurado, ~49k segun KV | Apache 2.0 | safetensors NVFP4, 19 GB | Multimodal, requiere vLLM ≥ 0.31 y GPU Blackwell |
| Qwen3.81-27B (bf16) | 27,36B | no disponible | Apache 2.0 | safetensors bf16, 54,7 GB, 1184 tensores, 3 shards | Mismo modelo sin cuantizar; referencia de calidad |
| RadixArk/DaisyRose-27B | no disponible | no disponible | no disponible | no disponible | Fine-tune A de la fusión, orientado a agentes y terminal |
| sabicap/sabi-noema | no disponible | no disponible | no disponible | no disponible | Fine-tune B de la fusión, atención lineal híbrida y multimodal |

No se dispone de datos de benchmarks de los modelos base ni de alternativas de la misma categoría en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo derivado de una fusión por promedio de dos fine-tunes: no ha pasado por un entrenamiento adicional ni por un ajuste de alineación posterior a la fusión, por lo que puede heredar sesgos y comportamientos de ambas fuentes.
- Riesgo de alucinación inherente a los modelos de 27B con modo thinking activado; el autor no reporta evaluaciones de factualidad ni de tasa de alucinación.
- Idiomas limitados a inglés y francés según los metadatos; no se declara soporte de castellano ni de otros idiomas.
- La cuantización NVFP4 W4A4 puede degradar la calidad respecto al bf16 en tareas sensibles; el autor solo reporta una prueba de humo de generación y las compuertas CoT, no una comparación sistemática bf16 vs NVFP4.
- Dependencia de hardware Blackwell y de vLLM ≥ 0.31: el formato nvfp4-pack-quantized no es portable a stacks sin soporte de compressed-tensors ni a GPUs sin matmul FP4 nativo.
- El contexto máximo práctico depende de la VRAM; con 32 GB y utilización 0,88 el autor sitúa el límite en ~49k tokens, por debajo del contexto nativo de la familia Qwen3.5.
- Resultados de benchmarks preliminares: GPQA Diamond con solo 10 preguntas en las compuertas CoT y Terminal-Bench con lotes iniciales de una suite de 89 tareas; no deben tomarse como cifras definitivas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo fusionado y cuantizado conviene verificar las licencias de los modelos base (DaisyRose-27B y sabi-noema), que no se detallan en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/vince62s/Qwen3.81-27B-NVFP4
- Modelo fusionado en bf16: https://huggingface.co/vince62s/Qwen3.81-27B
- Fine-tune A: https://huggingface.co/RadixArk/DaisyRose-27B
- Fine-tune B: https://huggingface.co/sabicap/sabi-noema
- llmcompressor (herramienta de cuantización): https://github.com/vllm-project/llmcompressor
- vLLM (motor de inferencia): https://github.com/vllm-project/vllm
- Terminal-Bench: https://github.com/laude-institute/terminal-bench
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
