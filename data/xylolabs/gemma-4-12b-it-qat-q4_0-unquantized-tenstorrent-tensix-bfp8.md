# Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8

## Resumen

Gemma 4 12B IT QAT para Tenstorrent Tensix es una exportación cuantizada del modelo `google/gemma-4-12B-it-qat-q4_0-unquantized`, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent con arquitectura Tensix. El checkpoint conserva la tokenizer y la plantilla de chat originales, pero reemplaza las 328 proyecciones declaradas del decodificador por matrices en formato block-floating-point `bfloat8_b` (8,5 bits por peso) generadas mediante GPTQ, mientras que el resto de tensores —incluidas las copias del embedding y de la cabeza atada— permanecen en BF16.

El modelo resuelve un problema muy concreto: permitir desplegar un LLM instruct de ~13 000 millones de parámetros sobre hardware Tenstorrent (tt-metal / TT-NN) con un consumo de memoria de pesos de aproximadamente 15,71 GB, frente a los ~26 GB del repositorio en BF16. No es un modelo nuevo ni un fine-tune: es un artefacto de despliegue orientado a inferencia en dispositivo, con validación explícita del empaquetado de las matrices contra el simulador Blackhole y TT-NN 0.81.1.

Es relevante ahora porque la cuantización QAT del modelo base de Google ya venía preparada para baja precisión, y esta exportación la adapta al formato nativo de Tensix (`bfloat8_b`), lo que abre la puerta a servir un modelo instruct de 12B en aceleradores de inferencia alternativos a las GPU NVIDIA, con una pérdida de calidad medida (KL media de 0,001488625 frente a 0 en el BF16 original).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), con proyecciones cuantizadas en block-floating-point |
| Parametros totales | 12.966.363.184 (12,97B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, 8,5 bits/peso) en 328 proyecciones del decodificador via GPTQ; BF16 en embedding, cabeza atada y 350 tensores adicionales |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (indexado con `model.safetensors.index.json`), mas `quant4.json` con el formato por proyeccion |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 4 en variante instruct, con un total de 12,97 mil millones de parámetros. El checkpoint original de Google es un modelo QAT (quantization-aware training) con cuantización q4_0 declarada como "unquantized", es decir, pesos almacenados en mayor precisión pero entrenados para tolerar cuantización agresiva. Xylolabs parte de ese checkpoint y aplica GPTQ con damping 0,1 sobre 65 536 tokens de WikiText-2 y Wikipedia en coreano para obtener las 328 proyecciones del decodificador en `bfloat8_b`.

La innovación técnica no está en el entrenamiento sino en el empaquetado: cada matriz se almacena en BF16 sobre su rejilla block-floating, de modo que al cargarla en TT-NN con `ttnn.bfloat8_b` y `TILE_LAYOUT` la conversión es exacta (el script de verificación comprueba `torch.equal` tras el round-trip por DRAM). El autor reporta que las 328 matrices pasan las comprobaciones de rejilla y de empaquetado nativo de TT-NN, y que el ejemplo de ejecución funciona en el simulador Blackhole con TT-NN 0.81.1. No se documentan detalles sobre la composición completa del dataset de entrenamiento original, ni sobre fases de RLHF/DPO, ni sobre innovaciones de decodificación (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en modo instruct, con plantilla de chat original de Gemma 4.
- Razonamiento y respuesta a preguntas en inglés y coreano (únicos idiomas declarados).
- Ejecución de inferencia sobre hardware Tenstorrent Tensix mediante TT-NN, con empaquetado nativo en `bfloat8_b`.
- Compatibilidad con `transformers` 5.23.0 y PyTorch para ejecución en GPU/CPU convencional con `dtype="bfloat16"`.
- La model card menciona que la ejecución de imagen y audio "no está cualificada aquí", pese a que el pipeline tag del repo incluye `image-text-to-text`; no se garantiza soporte multimodal en esta exportación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: el benchmark de evaluación incluye una columna "Thinking right / 7", lo que sugiere que el modelo base conserva capacidad de razonamiento extendido, aunque no se detalla su funcionamiento.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: servir un modelo instruct de 12,97B en hardware Tensix usando TT-NN, con ~15,71 GB de memoria de dispositivo para pesos y margen para KV cache y buffers. Adecuado cuando se quiere evitar dependencia de GPU NVIDIA en el centro de datos.
- Inferencia de bajo consumo en borde o servidores con presupuesto de memoria ajustado: el empaquetado BFP8 reduce el peso de 26 GB a 15,71 GB, lo que permite alojar el modelo en nodos con menos DRAM que los necesarios para el BF16.
- Asistentes conversacionales en inglés y coreano: la plantilla de chat original y la tokenizer se conservan, por lo que se puede usar directamente con `apply_chat_template` para diálogos multi-turno en esos dos idiomas.
- Validación de pipelines de cuantización: el repo incluye `pack_tensix.py` y `verify_grid.py`, útiles para equipos que quieran comprobar que sus propias exportaciones BFP8 son bit-exactas tras el round-trip por DRAM.
- Investigación en cuantización block-floating-point: sirve como referencia reproducible de GPTQ con damping 0,1 sobre 65 536 tokens y métrica KL frente al BF16 original, para estudiar el impacto de 8,5 bits/peso en proyecciones del decodificador.
- Prototipado en GPU con `transformers`: aunque el destino sea Tensix, el checkpoint se puede cargar en PyTorch con `device_map="auto"` y `dtype="bfloat16"` para comparar salidas antes de portar la inferencia al acelerador.
- Base para evaluación de calidad post-cuantización: los datos de KL sobre 8 048 posiciones en textos de chat inglés/coreano permiten montar tests de regresión de calidad al cambiar de formato de empaquetado.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fidelidad de la cuantización, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.).

| Perfil | KL media | Normal correctas / 33 | Thinking correctas / 7 | Perdidas normales contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 33 | 7 | — |
| Esta exportacion (BFP8) | 0,001488625 | 33 | 7 | 0 |
| Q4_0 equivalente | 0,032543125 | 33 | 7 | 0 |

La KL se calcula sobre 8 048 posiciones puntuadas en los mismos textos de chat inglés/coreano guardados (cuatro fragmentos de cada uno). El suelo de referencia de llama.cpp en BF16 para el texto seleccionado es 0,000184375. El criterio relativo de la regla 7 se cumple: 0,045743 veces la KL de referencia, dentro del límite de 1,5 veces, sin más de una pérdida contada adicional. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo para pesos: ~15,71 GB en el formato empaquetado (incluye ambas copias BF16 del embedding y la cabeza atada); compartiendo la cabeza atada una sola vez, ~13,70 GB (9,165 bits por peso único).
- Memoria adicional necesaria para KV cache y buffers, no cuantificada en la información disponible.
- Hardware objetivo: aceleradores Tenstorrent con arquitectura Tensix (validado en simulador Blackhole con TT-NN 0.81.1); no se especifican modelos concretos de tarjeta.
- GPU consumer: el repo ocupa 26 GB y el modelo en BF16 requiere del orden de 26 GB, por lo que no cabe en GPU consumer de 24 GB sin cuantización adicional; no se proporcionan estimaciones para RTX 4090 u otras.
- Despliegue en GPU/CPU: `transformers` 5.23.0 con PyTorch (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`).
- Despliegue en Tensix: TT-NN con `ttnn.as_tensor(..., dtype=ttnn.bfloat8_b, layout=ttnn.TILE_LAYOUT)`; scripts `pack_tensix.py` y `verify_grid.py` incluidos en el repo.
- vLLM, llama.cpp, Ollama, TGI: no disponible en la información proporcionada; el autor indica que tt-transformers y tt-forge no fueron comprobados con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este export (Xylolabs, BFP8 Tensix) | 12,97B | no disponible | BFP8 8,5 bits/peso + BF16 | Apache-2.0 | Hugging Face, 29 descargas |
| google/gemma-4-12B-it-qat-q4_0-unquantized (base) | 12,97B | no disponible | q4_0 QAT, pesos sin cuantizar | Apache-2.0 (segun este repo) | Hugging Face |
| Q4_0 equivalente (referencia de evaluacion) | 12,97B | no disponible | 4 bits | no disponible | no disponible |

La comparación relevante es frente al modelo base y a la variante Q4_0: la exportación BFP8 logra una KL media de 0,001488625, muy inferior a la del Q4_0 (0,032543125) y con las mismas 33/33 y 7/7 respuestas correctas en las comprobaciones de pesos exactos. No se dispone de comparación con otros modelos de 12-13B de la competencia en la información proporcionada.

## Limitaciones y advertencias

- Solo se declaran los idiomas inglés y coreano; el rendimiento en castellano no está validado.
- La model card advierte que la ejecución de imagen y audio "no está cualificada aquí", pese al tag `image-text-to-text`; no asumir capacidades multimodales en producción.
- Los scripts de verificación son comprobaciones de representación: tt-transformers y tt-forge no fueron comprobados con este checkpoint.
- La evaluación de calidad se limita a KL sobre 8 048 posiciones de textos de chat inglés/coreano; no hay benchmarks de tareas que confirmen el rendimiento en código, matemáticas o razonamiento.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; heredados del modelo base de Google.
- La licencia es Apache-2.0 según el repo, pero conviene verificar las condiciones de uso del modelo base de Google antes de un despliegue comercial.
- El checkpoint requiere `transformers` 5.23.0 y TT-NN 0.81.1 para reproducir los resultados; versiones distintas pueden romper la compatibilidad del empaquetado.
- El repositorio incluye dos copias BF16 byte-idénticas del embedding y la cabeza atada, lo que infla el tamaño en disco a 26 GB frente a los ~13,70 GB de pesos únicos.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
