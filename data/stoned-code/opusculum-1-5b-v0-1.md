# Stoned-Code/Opusculum-1.5B-V0.1

## Resumen

Opusculum-1.5B-V0.1 es un ajuste fino (fine-tune) completo del modelo Qwen2.5-1.5B, desarrollado por el usuario Stoned-Code y publicado en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-bnb-4bit`) y se entrena con los mismos conjuntos de datos empleados para entrenar `anthracite-org/magnum-v4-9b`, un modelo orientado a escritura creativa, rol y conversación sin restricciones. El objetivo declarado es reproducir a pequeña escala el comportamiento de un modelo de rol de 9B en un formato de 1.5B parámetros.

Se trata de un modelo de generación de texto con arquitectura transformer decoder-only Qwen2, 1.543.714.304 parámetros (aproximadamente 1.5B), entrenado con una longitud máxima de secuencia de 8192 tokens y licencia Apache 2.0. Su relevancia radica en que ofrece una alternativa ligera y de bajo coste computacional para tareas de escritura creativa y conversación, ejecutable en hardware de consumo, aunque con las limitaciones inherentes a su tamaño y a la naturaleza de sus datos de entrenamiento.

El modelo está pensado para un público muy específico: desarrolladores e investigadores que necesitan un modelo pequeño para prototipado de rol conversacional o generación de ficción, y que pueden asumir las limitaciones de un fine-tune de 1.5B entrenado con datos orientados a contenido sin filtros. No es un modelo de propósito general ni compite en razonamiento o código con modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (~1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de entrenamiento); contexto nativo de Qwen2.5 no especificado en la información |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el modelo base era bnb-4bit) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen2.5-1.5B. El autor lo describe como un "full finetune" (ajuste fino completo) sobre `unsloth/Qwen2.5-1.5B-bnb-4bit`, aunque la configuración YAML incluida en la model card especifica parámetros de LoRA (r=16, alpha=16, dropout=0, módulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj). Esta discrepancia entre la descripción ("full finetune") y la configuración de LoRA es un punto a tener en cuenta: no queda claro en la información proporcionada si el resultado final incorpora los adaptadores fusionados en los pesos completos o si se trata de un entrenamiento con LoRA.

El entrenamiento se realizó en una única GPU RTX 5060 Ti con 16 GB de VRAM, con `max_seq_length` de 8192, 3 épocas, learning rate de 2e-5, batch size de 2 con acumulación de gradientes de 4 pasos, `packing: true`, `train_on_completions: true`, gradient checkpointing de Unsloth, optimizador AdamW en 8 bits, scheduler coseno y semilla aleatoria 3407. Los datos de entrenamiento provienen de nueve conjuntos de datos, entre ellos `Stoned-Code/magnum-v4`, `Delta-Vector/Hydrus-Claude-Instruct-5K`, `anthracite-org/kalo-opus-instruct-22k-no-refusal`, `Epiculous/SynthRP-Gens-v1.1-Filtered-n-Cleaned`, `anthracite-org/nopm_claude_writing_fixed` y varios subconjuntos de `anthracite-org/kalo_opus_misc`. Estos datasets están orientados a instrucciones, escritura creativa y rol, varios de ellos explícitamente "no refusal". No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset final.

No se documenta el uso de RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado, ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo y rol.
- Escritura creativa y narrativa: ficción, descripciones, continuación de historias.
- Seguimiento de instrucciones en inglés, con énfasis en respuestas de estilo "Claude" (según los datasets de entrenamiento).
- Generación de texto sin restricciones de contenido (los datasets incluyen subconjuntos "no-refusal").
- Capacidad limitada de razonamiento y matemáticas, heredada de Qwen2.5-1.5B pero no reforzada por el ajuste.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; improbable dado el tamaño y los datos de entrenamiento.
- Capacidades multilingües: solo inglés declarado; no se garantiza soporte de otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo puede mantener diálogos multi-turno con contexto de hasta 8192 tokens, lo que permite sesiones de rol relativamente largas sin perder el hilo, adecuado para demos y pruebas de concepto de chatbots de personajes.
- Generación de ficción interactiva: útil para escribir borradores de narrativa, continuar historias o generar variantes de escenas, gracias a su entrenamiento con datasets de escritura creativa como `nopm_claude_writing_fixed`.
- Simulación de diálogos para investigación: investigadores que estudian modelos sin filtros de rechazo pueden usar este modelo como caso de estudio de bajo coste para analizar comportamientos de modelos ajustados con datos "no-refusal".
- Generación de datos sintéticos de rol: puede emplearse para producir conversaciones sintéticas destinadas a aumentar datasets de entrenamiento de modelos mayores, dado su bajo coste de inferencia.
- Despliegue en hardware de consumo: al ser un modelo de 1.5B, cabe en GPUs de gama media y permite experimentación local sin infraestructura de servidor.
- Evaluación comparativa de fine-tunes pequeños: sirve como referencia para comparar el efecto de distintos datasets de rol en modelos de 1.5B frente a versiones de 9B como magnum-v4-9b.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 (1.5B parámetros × 2 bytes + overhead), alrededor de 1-2 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4090 (24 GB) e incluso GPUs con 4-6 GB en cuantización 4-bit. El autor entrenó el modelo en una RTX 5060 Ti de 16 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers con Unsloth. Al publicarse en safetensors, requiere conversión a GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Opusculum-1.5B-V0.1 | 1.5B | 8192 (entrenamiento) | Apache 2.0 | Fine-tune de rol/escritura sobre Qwen2.5-1.5B |
| anthracite-org/magnum-v4-9b | ~9B | no disponible | no disponible | Modelo de referencia cuyos datasets se reutilizan aquí; mayor capacidad |
| Qwen2.5-1.5B (base) | 1.5B | 32K (nativo, según Qwen) | Apache 2.0 | Modelo generalista; mejor en razonamiento y código, peor en rol creativo |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K (nativo, según Qwen) | Apache 2.0 | Variante alineada para instrucciones; más segura pero con rechazos |

La comparación con magnum-v4-9b es la más directa en cuanto a propósito (rol y escritura sin restricciones), pero la diferencia de escala es de 6× en parámetros. Frente a Qwen2.5-1.5B base e Instruct, Opusculum sacrifica generalidad y alineación de seguridad a cambio de un estilo conversacional y creativo más marcado.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datasets de rol y escritura sin filtros, puede reproducir estereotipos, lenguaje explícito o contenido sesgado presente en esos datos.
- Riesgo de alucinación: elevado, como en cualquier modelo de 1.5B; no es fiable para tareas de recuperación de hechos o razonamiento factual.
- Limitaciones de contexto: la longitud máxima de entrenamiento es de 8192 tokens; no se garantiza un comportamiento correcto más allá de esa ventana, aunque el modelo base Qwen2.5 soporte contextos mayores.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está validado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado y los datasets de entrenamiento (algunos "no-refusal") pueden plantear riesgos legales o de política de contenido en producción.
- Caveat de producción: la discrepancia entre "full finetune" y la configuración LoRA en la model card genera incertidumbre sobre la naturaleza exacta de los pesos publicados; conviene verificar antes de desplegar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta la selección informada.
- Modelo con muy poca tracción (55 descargas, 1 like en el momento de la consulta): no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Stoned-Code/Opusculum-1.5B-V0.1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-bnb-4bit
- Modelo de referencia de datasets: https://huggingface.co/anthracite-org/magnum-v4-9b
- Dataset Stoned-Code/magnum-v4: https://huggingface.co/datasets/Stoned-Code/magnum-v4
- Dataset Delta-Vector/Hydrus-Claude-Instruct-5K: https://huggingface.co/datasets/Delta-Vector/Hydrus-Claude-Instruct-5K
- Dataset anthracite-org/kalo-opus-instruct-22k-no-refusal: https://huggingface.co/datasets/anthracite-org/kalo-opus-instruct-22k-no-refusal
- Dataset Epiculous/SynthRP-Gens-v1.1-Filtered-n-Cleaned: https://huggingface.co/datasets/Epiculous/SynthRP-Gens-v1.1-Filtered-n-Cleaned
- Dataset anthracite-org/nopm_claude_writing_fixed: https://huggingface.co/datasets/anthracite-org/nopm_claude_writing_fixed
- Dataset Epiculous/Synthstruct-Gens-v1.1-Filtered-n-Cleaned: https://huggingface.co/datasets/Epiculous/Synthstruct-Gens-v1.1-Filtered-n-Cleaned
- Dataset anthracite-org/kalo_opus_misc_240827: https://huggingface.co/datasets/anthracite-org/kalo_opus_misc_240827
- Dataset anthracite-org/kalo_misc_part2: https://huggingface.co/datasets/anthracite-org/kalo_misc_part2
