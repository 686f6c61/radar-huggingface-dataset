# Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8

## Resumen
Llama-3.1-8B-Instruct-Tensix-BFP8 es una versión cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs y optimizada específicamente para aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.248 parámetros, pero sustituye el formato de pesos de las proyecciones de atención y MLP por block-floating-point de 8 bits (bfloat8_b), manteniendo en bf16 el LM head, los embeddings y las capas de normalización.

La propuesta de valor es doble: por un lado, reduce el peso empaquetado a 9,517 GB frente a los 16,06 GB del modelo en bf16, lo que facilita su despliegue en NPUs con memoria limitada; por otro, la cuantización GPTQ sobre la rejilla bfloat8_b logra una fidelidad notablemente superior a la de llama.cpp Q4_K_M, con una KL media frente a bf16 de 0,0008 frente a 0,0323 del Q4_K_M (unas 0,03 veces). Es relevante ahora porque el ecosistema Tenstorrent (tt-metal, ttnn, tt-forge) empieza a ofrecer alternativas viables a GPU para inferencia de LLMs, y este checkpoint es una de las primeras publicaciones que empaqueta Llama 3.1 directamente para esa pila.

El modelo hereda el contexto de 128.000 tokens, el chat template y las capacidades multilingües de Llama 3.1, con soporte declarado para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés. La licencia es Llama 3.1, con las restricciones habituales de Meta para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos cuantizados en block-floating-point bfloat8_b (BFP8) en proyecciones de atención y MLP |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1-8B-Instruct) |
| Tipos de cuantizacion | BFP8 (bfloat8_b) en q, k, v, o, gate, up, down de las 32 capas; bf16 en LM head, embeddings y normas; existe variante BFP4 del mismo autor |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (empaquetado Tensix, 9,517 GB), compatible con transformers y con ttnn |
| Tamano del repo | 16,1 GB |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Herramientas asociadas | tensix-bfp-gptq, tensix-kernels, tensix-runner (v0.1.0) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Llama 3.1-8B-Instruct: un transformer decoder-only con 32 capas, atención con RoPE, GQA y FFN con activación SwiGLU. Xylolabs no reentrena el modelo; aplica cuantización GPTQ directamente sobre la rejilla bfloat8_b de Tensix, de modo que las matrices de proyección de atención (q, k, v, o) y de MLP (gate, up, down) quedan en BFP8, mientras que el LM head, los embeddings y todas las normas se mantienen en bf16 tal como en el modelo base. El fichero `quant4.json` documenta el formato de cada proyección.

El empaquetado se realiza con `tools/pack_tensix.py` y se verifica con `tools/verify_grid.py`, ambos incluidos en el repo y procedentes de tensix-bfp-gptq en el commit 5c52065. La verificación comprueba que cada matriz empaquetada, al descomprimirse con ttnn, coincide exactamente con la representación en torch, y opcionalmente realiza un round-trip por DRAM del dispositivo. El `config.json`, `generation_config.json`, tokenizer y `chat_template.jinja` provienen sin cambios de unsloth/Llama-3.1-8B-Instruct. No se documentan en la información disponible detalles sobre datos de entrenamiento, RLHF/DPO ni innovaciones de decodificación más allá de la propia cuantización.

## Capacidades
- Generación de texto conversacional multi-turno, con el chat template de Llama 3.1.
- Razonamiento y respuesta a instrucciones, heredados del modelo base Instruct.
- Generación de código y matemáticas, en la medida en que lo soporta Llama 3.1-8B-Instruct.
- Soporte multilingüe para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Compatibilidad con tool calling y function calling a través del formato de Llama 3.1 (no se documenta explícitamente en la model card, pero es una capacidad del modelo base).
- Ejecución en transformers estándar (con `dtype="bfloat16"` y `device_map="auto"`) y en la pila Tenstorrent (ttnn, tt-metal, tt-transformers, tt-forge).
- Integración con text-generation-inference según los tags del repo, y endpoints compatibles.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso
- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado para Wormhole y Blackhole y se ejecuta con tt-transformers sobre tt-metal v0.81.1, lo que permite servir Llama 3.1-8B en NPUs en lugar de GPU.
- Inferencia en entornos con memoria restringida: los 9,517 GB empaquetados frente a 16,06 GB en bf16 permiten cargar el modelo en dispositivos con menos DRAM, y existe una variante BFP4 para aún menos memoria.
- Atención al cliente automatizada: con 128.000 tokens de contexto y chat template nativo, puede gestionar conversaciones largas con historial extenso y documentación adjunta.
- Generación de código en pipelines internos: al conservar las capacidades del modelo Instruct, puede integrarse en asistentes de código y flujos de revisión, siempre que el backend sea compatible con el formato empaquetado.
- Procesamiento multilingüe: cubre ocho idiomas declarados, útil para soporte y moderación de contenido en mercados europeos, India y Tailandia.
- Investigación en cuantización: sirve como referencia para estudiar la fidelidad de BFP8 frente a bf16 y comparar con Q4_K_M u otros esquemas, gracias a las herramientas de verificación publicadas.
- Prototipado en simulación: la model card indica que se validó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole, lo que permite desarrollar kernels sin hardware físico.

## Benchmarks y rendimiento
La model card incluye una tabla de evaluación parcial (el contenido citado se corta tras la cabecera). Los datos disponibles son:

| Metrica | Valor |
|---|---|
| Tamano empaquetado Tensix | 9,517 GB (frente a 16,06 GB en bf16) |
| KL media frente a bf16 (este modelo) | 0,0008 |
| KL media frente a bf16 (llama.cpp Q4_K_M) | 0,0323 |
| Ratio de KL frente a Q4_K_M | 0,03 veces |
| Top-1 (%) | no disponible en la información proporcionada |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint.

## Requisitos de hardware
- VRAM/DRAM estimada: 9,517 GB para los pesos empaquetados en BFP8; el repo completo ocupa 16,1 GB, por lo que se necesita espacio en disco adicional para la descarga.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (NPUs Tensix). Validado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole).
- GPU: no se documenta soporte GPU específico; el modelo se puede cargar en transformers con `dtype="bfloat16"` y `device_map="auto"`, pero el formato BFP8 está pensado para Tensix.
- Consumer GPU: no hay datos publicados sobre ejecución en RTX 4090 u otras GPU de consumo; la cuantización BFP8 no es un formato estándar de llama.cpp ni de vLLM.
- Opciones de despliegue: tt-transformers sobre tt-metal v0.81.1 (con `--use_hf_rope`), ttnn, tensix-runner v0.1.0, tensix-kernels v0.1.0, y transformers para carga en bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-Tensix-BFP8 (este) | 8,03 B | 128.000 | BFP8 Tensix, 9,517 GB | llama3.1 | Hugging Face, orientado a NPU Tensix |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | bf16, 16,06 GB | llama3.1 | Hugging Face, GPU/CPU |
| llama.cpp Q4_K_M de Llama 3.1-8B | 8,03 B | 128.000 | GGUF Q4_K_M | llama3.1 | llama.cpp, CPU/GPU |
| Xylolabs Llama-3.1-8B-Instruct-Tensix-BFP4 | 8,03 B | 128.000 | BFP4 Tensix | llama3.1 | Hugging Face, Tensix con menos memoria |

La comparación de fidelidad disponible sitúa a este modelo con KL 0,0008 frente a bf16, mientras que Q4_K_M obtiene 0,0323. No hay datos de benchmarks de tarea que permitan comparar rendimiento cualitativo con las alternativas.

## Limitaciones y advertencias
- El formato BFP8 está diseñado para Tensix; no es un formato estándar de llama.cpp, vLLM u Ollama, por lo que la portabilidad a otros backends es limitada.
- La licencia llama3.1 impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos de Meta antes de producción.
- Al ser una cuantización, puede introducir degradaciones en tareas sensibles a precisión numérica, aunque la KL media frente a bf16 es muy baja (0,0008).
- Riesgo de alucinación inherente al modelo base Llama 3.1-8B-Instruct; no se documentan mitigaciones adicionales.
- Sesgos heredados del modelo base y de sus datos de entrenamiento; no se documenta ninguna evaluación de sesgos específica para este checkpoint.
- El soporte multilingüe se limita a los ocho idiomas declarados; el rendimiento en otros idiomas no está garantizado.
- La model card está incompleta en la sección de evaluación (la tabla se corta), por lo que faltan métricas de tarea como Top-1.
- El repo ocupa 16,1 GB aunque los pesos empaquetados sean 9,517 GB, lo que requiere planificar el espacio en disco.
- No se documentan garantías de latencia ni throughput en producción.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante BFP4: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4
- Repositorio tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Tokenizer y configuración de referencia: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct/tree/4699cc75b550f9c6f3173fb80f4703b62d946aa5
