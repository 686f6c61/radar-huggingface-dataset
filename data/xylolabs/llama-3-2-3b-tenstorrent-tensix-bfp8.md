# Xylolabs/Llama-3.2-3B-Tenstorrent-Tensix-BFP8

## Resumen

Llama-3.2-3B-Tenstorrent-Tensix-BFP8 es una versión cuantizada del modelo meta-llama/Llama-3.2-3B, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer decoder-only de Llama 3.2 con 3.212.749.824 parámetros, pero sustituye las proyecciones de atención y MLP por matrices en formato block-floating-point `bfloat8_b` (BFP8, 8,5 bits por peso) generadas mediante GPTQ. La cabeza LM, los embeddings y las normalizaciones permanecen en bf16, resultando en una media de 9,42 bits por peso.

El problema que resuelve es el despliegue eficiente de un LLM de 3B en hardware de aceleración no-GPU: TT-NN puede empaquetar los tensores cuantizados sin modificar sus valores, reduciendo el peso empaquetado de 6,42 GB (bf16) a 3,783 GB. La calibración se realizó sobre 262.144 tokens de WikiText-2 y Wikipedia en coreano (45 % en inglés), lo que explica el soporte declarado de inglés y coreano.

Es relevante ahora porque demuestra que la cuantización de bloques BFP8 con GPTQ puede acercarse mucho a la precisión bf16 (KL media de 0,0009 frente a 0,0327 de Q4_K_M de llama.cpp) manteniendo un tamaño competitivo, y porque abre la puerta a ejecutar modelos Llama en aceleradores Tensix con código abierto asociado (tensix-bfp-gptq, tensix-kernels, tensix-runner).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), cuantización block-floating-point BFP8 (`bfloat8_b`) en proyecciones de atención y MLP |
| Parámetros totales | 3.212.749.824 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Llama-3.2-3B; no se explicita en la model card) |
| Tipos de cuantización | BFP8 (`bfloat8_b`, 8,5 bits/peso) en q, k, v, o, gate, up, down de las 28 capas; bf16 en LM head, embedding y norms; media 9,42 bits/peso |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | Llama 3.2 (llama3.2) |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla del formato); empaquetado nativo para TT-NN en Tensix |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint base meta-llama/Llama-3.2-3B, un transformer decoder-only denso con 28 capas. No se ha reentrenado ni ajustado: se aplica GPTQ sobre las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 28 capas, convirtiéndolas a `bfloat8_b`. La cabeza LM (atada al embedding), el embedding y las normalizaciones se mantienen en bf16. La calibración usó 262.144 tokens de WikiText-2 y Wikipedia en coreano, con un 45 % de contenido en inglés. El fichero `quant4.json` del repositorio documenta el formato de cada proyección.

La innovación técnica principal es el uso del formato block-floating-point `bfloat8_b` propio de Tenstorrent, que TT-NN empaqueta sin alterar los valores almacenados, y la cadena de herramientas asociada: `tensix-bfp-gptq` v0.1.0 (cuantización y verificación de formato, con `tools/pack_tensix.py` y `tools/verify_grid.py`), `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0. Las verificaciones se ejecutaron sobre `ttsim` con `ttnn` 0.81.1 y pasan para todas las matrices. No se reportan datos de entrenamiento adicionales ni etapas de RLHF/DPO porque se trata de una cuantización del modelo base preentrenado.

## Capacidades

- Generación de texto autoregresiva: es el modelo preentrenado (no instruct), por lo que continúa texto y no dispone de plantilla de chat.
- Razonamiento y conocimiento general heredados del checkpoint Llama-3.2-3B base.
- Capacidades multilingües limitadas a inglés y coreano según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Ejecución optimizada en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado de pesos sin pérdida de valores.
- Compatible con `transformers` para inferencia en GPU/CPU (cargando los pesos cuantizados como bf16).

## Casos de uso

- Inferencia en aceleradores Tenstorrent: despliegue del modelo en NPU Wormhole o Blackhole usando `tensix-runner` y los kernels de `tensix-kernels`, aprovechando el empaquetado TT-NN de las matrices BFP8 para reducir la huella de memoria en DRAM del dispositivo.
- Prototipado de cuantización BFP8: uso del checkpoint como referencia para validar pipelines GPTQ con `tensix-bfp-gptq`, comparando la fidelidad frente a bf16 con `verify_grid.py` antes de cuantizar modelos mayores.
- Generación de texto en inglés y coreano: continuación de texto y tareas de lenguaje natural en ambos idiomas, con calidad cercana a bf16 (20/33 respuestas correctas frente a 20/33 del original en la evaluación del autor).
- Investigación en eficiencia de memoria: estudio de la relación entre bits por peso (9,42) y divergencia KL (0,0009) frente a alternativas como Q4_K_M (5,01 bits, KL 0,0327), útil para diseñar esquemas de cuantización en hardware con formatos de bloque.
- Base para fine-tuning o adaptación posterior: al conservar la estructura Llama-3.2-3B, puede servir como punto de partida para tareas específicas en entornos con restricciones de memoria, aunque requeriría de-cuantización o adaptación del formato.
- Evaluación comparativa de backends: banco de pruebas para comparar latencia y fidelidad entre TT-NN en Tensix y ejecución en GPU con `transformers`, dado que el autor no publica mediciones de velocidad en dispositivo.

## Benchmarks y rendimiento

Evaluación en host de los pesos (no mediciones en dispositivo), según la model card:

| Pesos | Formatos | Bits/peso | Tamaño (GB) | KL media vs bf16 | Top-1 (%) | Respuestas correctas | Perdidas | Chequeo de precisión |
|---|---|---:|---:|---:|---:|---:|---:|---|
| bf16 (original) | Todo bf16 | 16,00 | 6,42 | 0 | 100 | 20/33 | - | - |
| BFP8 (este modelo) | Lineales en `bfloat8_b` por GPTQ; head, embedding y norms bf16 | 9,42 | 3,783 | 0,0009 | 98,31 | 20/33 | 0 | Pasa (0,03× KL; 0 perdidas) |
| BFP4 | Lineales en `bfloat4_b` por GPTQ; head, embedding y norms bf16 | 5,91 | 2,374 | 0,0440 | 88,82 | 20/33 | 0 | Pasa (1,34× KL; 0 perdidas) |
| Q4_K_M (llama.cpp) | F32 58, Q4_K 168, Q6_K 29 | 5,01 | 2,019 | 0,0327 | 89,93 | 19/33 | 0 | Referencia |

La KL media se calcula sobre distribuciones de siguiente token promediadas en posiciones de textos fijos en inglés y coreano; top-1 mide la coincidencia de token elegido con bf16. El chequeo de respuestas usa 33 prompts con respuesta conocida más 7 con thinking activado (40 en total). No se publican resultados de MMLU, HumanEval, GSM8K ni mediciones de velocidad en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 6,42 GB en bf16 (los tensores cuantizados se almacenan como bf16 en el repositorio). En dispositivo Tensix, el peso empaquetado es de 3,783 GB.
- GPU recomendadas para ejecución vía `transformers`: cualquier GPU con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100). El modelo cabe holgadamente en consumer GPU de gama media-alta.
- Hardware objetivo principal: NPU Tensix de Tenstorrent (Wormhole, Blackhole), con empaquetado TT-NN mediante `pack_tensix.py`.
- Opciones de despliegue: `transformers` (con `device_map="auto"` y `dtype="bfloat16"`), TT-NN / `tensix-runner` para Tensix. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint específico.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no se reportan mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits/peso | Tamaño (GB) | KL media vs bf16 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Llama-3.2-3B-Tenstorrent-Tensix-BFP8 | 3,21 B | No disponible | 9,42 | 3,783 | 0,0009 | Llama 3.2 | Hugging Face |
| Llama-3.2-3B-Tenstorrent-Tensix-BFP4 | 3,21 B | No disponible | 5,91 | 2,374 | 0,0440 | Llama 3.2 | Hugging Face |
| Llama-3.2-3B (bf16 original) | 3,21 B | No disponible | 16,00 | 6,42 | 0 | Llama 3.2 | Hugging Face |
| Q4_K_M de llama.cpp (mismo modelo base) | 3,21 B | No disponible | 5,01 | 2,019 | 0,0327 | Llama 3.2 | llama.cpp |

## Limitaciones y advertencias

- Es un modelo preentrenado, no instruct: no incluye plantilla de chat ni alineamiento conversacional; el uso en diálogo requiere prompting cuidadoso o fine-tuning.
- Riesgo de alucinación inherente al modelo base Llama-3.2-3B; la cuantización BFP8 añade una divergencia mínima (KL 0,0009) pero no la elimina.
- Sesgos heredados del dataset de preentrenamiento de Llama 3.2, no evaluados en esta ficha.
- Cobertura lingüística declarada limitada a inglés y coreano; el rendimiento en castellano no está documentado.
- La licencia Llama 3.2 impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de producción.
- Los pesos están optimizados para Tensix; en GPU se cargan como bf16, por lo que se pierde la ventaja de tamaño del formato BFP8.
- No hay mediciones de velocidad ni de latencia en dispositivo; el rendimiento real en Wormhole/Blackhole no está cuantificado públicamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.
- El contexto máximo no se explicita en la model card; conviene verificar la configuración del modelo base antes de usarlo con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.2-3B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Versión BFP4: https://huggingface.co/Xylolabs/Llama-3.2-3B-Tenstorrent-Tensix-BFP4
- Licencia: https://huggingface.co/Xylolabs/Llama-3.2-3B-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
- Código de cuantización (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels para Tensix (tensix-kernels v0.1.0): https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner para Tensix (tensix-runner v0.1.0): https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
