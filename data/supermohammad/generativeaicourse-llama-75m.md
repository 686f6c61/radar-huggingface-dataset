# superMohammad/GenerativeAICourse-llama-75m

## Resumen

GenerativeAICourse-llama-75m es un modelo de lenguaje de 75 millones de parámetros entrenado desde cero con arquitectura tipo Llama (`LlamaForCausalLM`) sobre el conjunto de datos TinyStories. Lo desarrollaron Mohammad Almalke y Abdullrahman Almuharib como laboratorio de un curso de IA generativa centrado en leyes de escala. El modelo escribe cuentos infantiles cortos y simples en inglés, y su interés es fundamentalmente didáctico: permite reproducir de principio a fin el ciclo de entrenamiento de un transformer causal con un coste de cómputo mínimo.

La arquitectura sigue el diseño Llama con 24 capas, dimensión oculta de 512 y atención con GQA (8 cabezas de consulta y 4 de clave-valor, dimensión de cabeza 64). El vocabulario es de 8.192 tokens con BPE a nivel de byte entrenado sobre el split de entrenamiento, y el contexto máximo es de 512 tokens. Los embeddings de entrada y salida están atados.

El entrenamiento consumió 524,288 millones de tokens (aproximadamente el 35 % del presupuesto estilo Chinchilla de 20 tokens por parámetro), lo que da una idea clara de sus límites: no tiene conocimiento general, no sigue instrucciones y solo genera texto coherente dentro del dominio de cuentos infantiles sintéticos. Es relevante ahora como referencia educativa reproducible y como base mínima para experimentos de escalado y ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 74.998.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors en precisión original) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas | 24 |
| Dimension oculta | 512 |
| Tamano MLP | 1.408 (SiLU) |
| Cabezas de atencion | 8 query / 4 key-value (GQA), dim de cabeza 64 |
| Vocabulario | 8.192 (BPE a nivel de byte) |
| Embeddings | atados entrada/salida |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la estructura estándar de Llama: normalización RMSNorm (implícita en la implementación de `LlamaForCausalLM`), activación SiLU en el MLP y atención con grouped-query attention para reducir el coste de las cabezas clave-valor. Con 24 capas y dimensión oculta de 512, el modelo es deliberadamente pequeño para poder entrenarse en una única GPU con precisión mixta FP16.

El entrenamiento usó 300.000 documentos de TinyStories divididos en 270k/15k/15k (train/val/test), con un total de 524.288.000 tokens vistos (1.000 actualizaciones × 32 secuencias × 32 de acumulación × 512 tokens). El optimizador fue AdamW con β = (0,9; 0,95), weight decay 0,1, recorte de gradiente 1,0, learning rate 3e-4 con 100 pasos de warmup y decaimiento coseno hasta cero, semilla 42. No se documenta RLHF, DPO ni ajuste por instrucciones; el entrenamiento es puramente de modelado de lenguaje autorregresivo. El run empleó aproximadamente el 35 % del presupuesto estilo Chinchilla de 20 tokens por parámetro (≈1,5B tokens), lo que explica en parte sus limitaciones de generalización.

## Capacidades

- Generación de texto autorregresiva en inglés dentro del dominio de cuentos infantiles simples.
- Continuación de prompts narrativos cortos con coherencia local (personajes, objetos y acciones sencillas).
- Generación determinista mediante decodificación greedy (`do_sample=False`), tal como muestra la model card.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- Multilingüismo: solo inglés; no se documenta soporte de otros idiomas.
- No sigue instrucciones ni mantiene conversaciones multi-turno.

## Casos de uso

- Docencia y laboratorios de leyes de escala: el modelo sirve para reproducir el efecto del número de tokens de entrenamiento sobre la pérdida y la perplejidad, con curvas de pérdida incluidas en el repo (`loss_curve.png`, `experiment.json`).
- Generación de cuentos infantiles sintéticos: útil para crear corpus de texto simple y controlado destinado a experimentos de tokenización o de modelado de lenguaje.
- Pruebas de infraestructura de inferencia: con 75M de parámetros y 0,3 GB de pesos, permite validar pipelines de `transformers`, `text-generation-inference` o endpoints compatibles sin coste de GPU significativo.
- Ajuste fino educativo: base pequeña para enseñar LoRA, SFT o DPO sobre un dominio acotado sin necesidad de hardware de gama alta.
- Investigación en tokenizadores: su vocabulario de 8.192 tokens entrenado sobre el propio corpus permite estudiar el impacto del tamaño de vocabulario en modelos pequeños.
- Generación de datos sintéticos para pruebas de pipelines de NLP: cuentos cortos en inglés para validar sistemas de análisis morfosintáctico o de resumen extractivo en un dominio controlado.

## Benchmarks y rendimiento

| Split | Loss | Perplejidad |
|---|---|---|
| Validación (antes de entrenar) | 9,033 | 8.374 |
| Validación | 1,901 | 6,69 |
| Test | 1,899 | 6,68 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP16 (pesos), con overhead adicional de activaciones y caché KV muy reducido por el contexto de 512 tokens; en la práctica cabe en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1-2 GB de VRAM; también en Apple Silicon y en CPU.
- Opciones de despliegue: `transformers` (referencia de la model card), `text-generation-inference` (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; no se documenta soporte explícito de llama.cpp, Ollama o vLLM, aunque al ser safetensors estándar puede convertirse a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Dominio |
|---|---|---|---|---|
| GenerativeAICourse-llama-75m | 75M | 512 | no disponible | Cuentos infantiles (TinyStories) |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Texto general |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Texto general |
| GPT-2 small | 124M | 1.024 | MIT | Texto general |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado únicamente con cuentos infantiles sintéticos: carece de conocimiento general y no puede seguir instrucciones.
- Tiende a repetirse y a perder la pista de los personajes en generaciones largas.
- Solo inglés y con contexto de 512 tokens, insuficiente para documentos o conversaciones extensas.
- Riesgo alto de alucinación fuera del dominio narrativo simple; no es apto para producción en tareas de conocimiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Sesgos: no documentados, pero al entrenarse solo con TinyStories puede reproducir estereotipos presentes en cuentos infantiles sintéticos.
- El entrenamiento usó solo el 35 % del presupuesto Chinchilla, por lo que está infraentrenado respecto a su tamaño.

## Enlaces

- Hugging Face: https://huggingface.co/superMohammad/GenerativeAICourse-llama-75m
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
