# zSaiko/Gemma-4-26B-A4B-ThinkingCap-StyleTune-V2-GGUF

## Resumen

Gemma-4-26B-A4B-ThinkingCap-StyleTune-V2-GGUF es una cuantización GGUF de un modelo resultante de un merge experimental entre dos derivados de Gemma 4 26B-A4B: ThinkingCap-gemma-4-26B-A4B-it (de bottlecapai) y Gemma-4-26B-A4B-StyleTune-V2 (de Gryphe). El autor, zSaiko, combina los pesos de ThinkingCap con la cabeza de salida (lm_head) de StyleTune V2, manteniendo el resto sin cambios. El objetivo declarado es obtener el razonamiento más conciso de ThinkingCap junto con la prosa de StyleTune V2.

El modelo es de tipo texto únicamente (sin proyector de visión) y emplea el tokenizador y la plantilla de chat de ThinkingCap. Con aproximadamente 25.970 millones de parámetros totales y una arquitectura Gemma 4 con mezcla de expertos (A4B indica alrededor de 4.000 millones de parámetros activos), está orientado a roleplay y escritura creativa, aunque conserva las capacidades generales del modelo base.

Es relevante por su enfoque práctico: el autor publica tanto el GGUF Q5_K_S listo para usar (19,46 GB) como el BF16 completo en dos partes (~52 GB) para quien quiera generar sus propias cuantizaciones, junto con una matriz de importancia (imatrix) calibrada específicamente sobre datos de roleplay. La licencia Apache-2.0 facilita su uso comercial, aunque el propio autor lo describe como experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Gemma 4 con mezcla de expertos (A4B) |
| Parámetros totales | 25.971.339.550 (~26B) |
| Parámetros activos | ~4B (según la nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q5_K_S (UD-style + imatrix de RP); BF16 completo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q5_K_S y BF16 en 2 partes) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. Se toman los pesos de ThinkingCap-gemma-4-26B-A4B-it y se sustituye únicamente la cabeza de salida (lm_head) por la de Gryphe/Gemma-4-26B-A4B-StyleTune-V2. El resto de la red permanece idéntico. La arquitectura subyacente es Gemma 4 con mezcla de expertos, con unos 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token.

La cuantización Q5_K_S sigue el esquema de Unsloth UD-Q5_K_S: embeddings y pesos no expertos en Q8_0, gate/up de expertos en Q5_K, down de expertos en Q5_1 (Q8_0 en la capa 29) y cabeza de salida en Q6_K. Se construyó con llama.cpp b12192. La imatrix es propia del autor, calibrada con un 70% de datos de roleplay de HiWaifu y un 30% del conjunto de calibración de Unsloth. No se dispone de información sobre el volumen de tokens de entrenamiento de los modelos base ni sobre etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y creativo, con especial énfasis en roleplay y escritura de prosa.
- Razonamiento con modo de pensamiento más conciso, heredado de ThinkingCap.
- Estilo de escritura pulido, heredado de la cabeza de salida de StyleTune V2.
- Conversación multi-turno mediante la plantilla de chat integrada de Gemma 4.
- Compatible con endpoints (tag `endpoints_compatible`).
- Solo texto: no incluye proyector de visión.
- Soporte de tool calling, agentes o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Roleplay conversacional: el modelo está afinado específicamente para diálogos de personaje; su imatrix calibrada sobre datos de roleplay de HiWaifu y su cabeza de salida orientada a prosa lo hacen adecuado para bots de personajes con turnos largos.
- Escritura creativa asistida: generación de narrativa y ficción con estilo cuidado, aprovechando la combinación de razonamiento breve y prosa de StyleTune V2.
- Prototipado de chatbots de entretenimiento: al ser GGUF Q5 de 19,46 GB, puede desplegarse en estaciones de trabajo con una sola GPU de 24 GB para pruebas de concepto.
- Generación de datos sintéticos conversacionales: útil para producir diálogos de entrenamiento o evaluación en dominios de ficción y roleplay.
- Experimentación con merges de modelos: el BF16 en dos partes permite generar cuantizaciones propias y reproducir el pipeline de mezcla de pesos.
- Inferencia local en llama.cpp: integrable en aplicaciones de escritorio o servidores ligeros mediante llama.cpp u Ollama, con la plantilla de chat de Gemma 4 y los parámetros de muestreo sugeridos (temp 1.0, min-p 0.1, DRY activado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica una evaluación de fidelidad de la cuantización frente al BF16, medida sobre 120 chats de roleplay generados por el propio modelo (formato chat, 50 fragmentos de 512 tokens):

| Métrica | Q5 (imatrix propia) | Q5 (imatrix de bartowski) | Q8_0 (referencia) |
|---|---|---|---|
| KLD medio | 0,067 | 0,070 | 0,047 |
| KLD percentil 99 | 1,26 | 1,28 | no disponible |
| KLD percentil 99,9 | 6,29 | 7,51 | no disponible |
| Mismo token superior | 93,0% | 93,1% | 94,5% |

## Requisitos de hardware

- VRAM estimada para el Q5_K_S: en torno a 20-22 GB incluyendo overhead de contexto, dado que el archivo pesa 19,46 GB.
- BF16 completo: ~52 GB de pesos, por lo que requiere al menos 64 GB de VRAM para inferencia cómoda o uso de offloading a CPU/RAM.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para el Q5; A100 80 GB o H100 para BF16.
- Cabe en GPU de consumo: sí, el Q5 en una RTX 4090 o 3090; en GPUs de 16 GB requeriría offloading parcial.
- Opciones de despliegue: llama.cpp (versión b12192 o posterior), Ollama u otros runners compatibles con GGUF; llama.cpp carga directamente los archivos BF16 divididos apuntando a la primera parte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zSaiko/Gemma-4-26B-A4B-ThinkingCap-StyleTune-V2-GGUF | ~26B totales, ~4B activos | no disponible | Apache-2.0 | GGUF, BF16 | Merge experimental con imatrix de roleplay |
| bottlecapai/ThinkingCap-gemma-4-26B-A4B-it | ~26B totales, ~4B activos | no disponible | Apache-2.0 | safetensors | Base del razonamiento conciso |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | ~26B totales, ~4B activos | no disponible | Apache-2.0 | safetensors | Base del estilo de prosa |
| Gemma 4 26B-A4B-it (Google) | ~26B totales, ~4B activos | no disponible | Apache-2.0 | safetensors | Modelo original de Google |

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo califica como tal y señala que es su segunda incursión en cuantizaciones y modificaciones de LLM.
- Al ser un merge de pesos sin entrenamiento adicional, pueden aparecer incoherencias entre el razonamiento de ThinkingCap y el estilo de la cabeza de salida de StyleTune V2.
- Solo texto: no dispone de proyector de visión.
- Idiomas soportados no documentados; el rendimiento fuera del inglés y del castellano no está verificado.
- Riesgo de alucinación inherente a los modelos generativos, sin evaluación publicada al respecto.
- Sesgos: no documentados en la información disponible.
- Longitud de contexto no especificada; conviene verificar la configuración del modelo base antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza experimental del merge desaconseja su uso en producción sin evaluación propia.
- El hash SHA256 del Q5 está publicado; verificar la integridad de la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/zSaiko/Gemma-4-26B-A4B-ThinkingCap-StyleTune-V2-GGUF
- Modelo base ThinkingCap: https://huggingface.co/bottlecapai/ThinkingCap-gemma-4-26B-A4B-it
- Modelo base StyleTune V2: https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Modelo original: Gemma 4 26B-A4B-it de Google (no se proporciona enlace directo en la información disponible)
