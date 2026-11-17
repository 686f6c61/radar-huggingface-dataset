# Xylolabs/Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP4

## Resumen

Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP4 es una versión cuantizada del modelo meta-llama/Llama-3.2-3B-Instruct, publicada por Xylolabs y optimizada específicamente para aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo conserva la arquitectura transformer decoder-only del original de Meta, con 3.212.749.824 parámetros, y sustituye las proyecciones de atención y MLP por matrices en formato `bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque. La cabeza LM, los embeddings y las normas permanecen en bf16, resultando en una media de 5,91 bits por peso.

El problema que resuelve es la falta de pesos empaquetados de forma nativa para el stack TT-NN de Tenstorrent: los ficheros del repositorio almacenan los valores cuantizados como bf16 sobre la rejilla del formato, de modo que TT-NN los empaqueta sin alterar ningún valor. El tamaño empaquetado para Tensix es de 2,374 GB frente a los 6,42 GB en bf16. La calibración se realizó sobre 262.144 tokens de WikiText-2 y Wikipedia en coreano, con un 45 % de contenido en inglés.

Es relevante porque ofrece una alternativa de despliegue de bajo coste en hardware Tenstorrent para un modelo instructivo de 3B con licencia Llama 3.2, y porque publica una evaluación de precisión frente a bf16 y frente a la cuantización Q4_K_M de llama.cpp, con métricas de divergencia KL y verificación de respuestas. El modelo está pensado para generación de texto conversacional en inglés y coreano, y su uso principal es la inferencia sobre NPUs Tensix mediante el runner y los kernels publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), 28 capas, atención y MLP cuantizados a BFP4 |
| Parámetros totales | 3.212.749.824 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantización | BFP4 (`bfloat4_b`, 4,5 bits por peso) en proyecciones de atención y MLP; bf16 en LM head, embedding y normas; media de 5,91 bits por peso |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Llama 3.2 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla BFP4; empaquetado nativo para Tensix mediante TT-NN) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-3B-Instruct: un transformer decoder-only denso de 28 capas con atención multi-cabeza y bloques MLP con activación SwiGLU, en el que la cabeza LM está atada al embedding. Sobre esta base, Xylolabs aplica cuantización post-entrenamiento con GPTQ a las proyecciones q, k, v, o, gate, up y down de las 28 capas, usando el formato `bfloat4_b` de Tenstorrent, que emplea un exponente compartido por bloque y una mantisa de 4 bits. La búsqueda del exponente por bloque es la innovación técnica principal del proceso: ajusta el rango dinámico de cada bloque para minimizar el error de cuantización.

La calibración se realizó sobre 262.144 tokens compuestos por WikiText-2 y Wikipedia en coreano, con un 45 % de contenido en inglés. No se realizó entrenamiento adicional ni ajuste fino: el modelo es una conversión de pesos del original, y las capacidades conversacionales provienen del Instruct de Meta (que sí incluyó ajuste supervisado y preferencias en su entrenamiento original). El repositorio incluye `quant4.json`, que documenta el formato asignado a cada proyección, y las herramientas `tools/pack_tensix.py` y `tools/verify_grid.py` del proyecto tensix-bfp-gptq v0.1.0, que verifican que el empaquetado en TT-NN no altera ningún valor. Las verificaciones se ejecutaron sobre ttsim con ttnn 0.81.1.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo de Llama-3.2-3B-Instruct.
- Razonamiento y respuesta a instrucciones en inglés y coreano.
- Generación de código y resolución de problemas matemáticos básicos, conforme al modelo base.
- Soporte de plantilla de chat (`apply_chat_template`) para diálogos con roles system, user y assistant.
- Modo "thinking" mencionado en la evaluación del autor: 7 de las 40 pruebas se formularon con razonamiento activado, lo que indica compatibilidad con prompts de razonamiento extendido del modelo base.
- Inferencia sobre NPUs Tenstorrent Tensix (Wormhole y Blackhole) mediante TT-NN, con kernels y runner propios del autor.
- Inferencia estándar en PyTorch/Transformers en bf16 (carga con `dtype="bfloat16"`), aunque sin las ventajas de empaquetado del hardware Tensix.
- Tool calling y function calling: no documentado explícitamente en la información proporcionada; el modelo base Llama 3.2 Instruct lo soporta, pero la cuantización no lo verifica.
- Capacidades multimodales, de audio o visión: no disponibles (modelo solo de texto).

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El modelo se empaqueta con TT-NN para Wormhole o Blackhole y se ejecuta con tensix-runner v0.1.0, aprovechando el formato BFP4 nativo para reducir el uso de DRAM a 2,374 GB por instancia.
- Asistentes conversacionales en inglés y coreano: la calibración bilingüe (45 % inglés, resto coreano) hace que el modelo sea adecuado para chatbots de atención al cliente en mercados coreanos, con calidad de cuantización verificada frente a bf16.
- Prototipado de pipelines de inferencia en hardware no-GPU: útil en entornos donde se quiere evaluar Tenstorrent como alternativa a GPU, ya que el repositorio incluye verificación de precisión y herramientas de empaquetado reproducibles.
- Generación de texto de bajo consumo en el borde: con 2,374 GB empaquetados, el modelo cabe en memorias de aceleradores de gama baja y permite generar respuestas cortas en aplicaciones embebidas.
- Evaluación comparativa de cuantizaciones: el repositorio publica métricas de KL y aciertos frente a Q4_K_M, lo que lo convierte en un punto de referencia para estudiar el impacto de BFP4 frente a cuantizaciones de llama.cpp.
- Fine-tuning ligero sobre la versión bf16: los pesos se pueden cargar en Transformers como bf16 para adaptaciones con LoRA, aunque el resultado habría que recuantizarlo con tensix-bfp-gptq para volver a Tensix.
- Investigación sobre formatos de bloque flotante: útil para estudiar el comportamiento de `bfloat4_b` con exponente por bloque en modelos de 3B, comparando la divergencia KL con otros esquemas de 4-5 bits.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Todas las cifras son evaluaciones en host de los pesos, no mediciones en dispositivo; no se reporta velocidad.

| Pesos | Bits por peso | Tamaño (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas | Chequeo de precisión |
|---|---:|---:|---:|---:|---:|---:|---|
| bf16 (original) | 16,00 | 6,42 | 0 | 100 | 24/33 | - | - |
| BFP8 (referencia del autor) | 9,42 | 3,783 | 0,0008 | 98,47 | 25/33 | 0 | pasado (0,03× KL; 0 perdidas) |
| BFP4 (este modelo) | 5,91 | 2,374 | 0,0442 | 88,81 | 26/33 | 1 | pasado (1,40× KL; 1 perdida) |
| Q4_K_M (llama.cpp) | 5,01 | 2,019 | 0,0315 | 90,02 | 25/33 | 0 | referencia |

La evaluación de respuestas usa 33 prompts fijos con respuesta conocida más 7 formulados con razonamiento activado (40 en total). La KL media se calcula sobre distribuciones de siguiente token en textos fijos en inglés y coreano. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM para inferencia: 2,374 GB empaquetados en formato BFP4 para Tensix; 6,42 GB si se carga en bf16 con Transformers.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (NPU Tensix), con TT-NN y ttnn 0.81.1 para las verificaciones publicadas.
- GPU convencionales: no es el objetivo del modelo; puede cargarse en bf16 en GPUs con al menos 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4090) mediante Transformers, pero sin las ventajas del empaquetado BFP4.
- Despliegue: tensix-runner v0.1.0 y tensix-kernels v0.1.0 para Tensix; Transformers para carga en bf16; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | KL media a bf16 | Licencia | Disponibilidad |
|---|---|---:|---|---:|---:|---|---|
| Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP4 (este) | 3,21B | No disponible | BFP4 (5,91 bits/peso) | 2,374 GB | 0,0442 | Llama 3.2 | Hugging Face |
| Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP8 | 3,21B | No disponible | BFP8 (9,42 bits/peso) | 3,783 GB | 0,0008 | Llama 3.2 | Hugging Face |
| Llama-3.2-3B-Instruct (Q4_K_M, llama.cpp) | 3,21B | No disponible | Q4_K_M (5,01 bits/peso) | 2,019 GB | 0,0315 | Llama 3.2 | Hugging Face / llama.cpp |
| meta-llama/Llama-3.2-3B-Instruct (bf16) | 3,21B | No disponible | bf16 (16 bits/peso) | 6,42 GB | 0 | Llama 3.2 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base porque la información proporcionada no incluye datos de benchmarks frente a otros modelos de 3B. El modelo BFP4 presenta una KL media 1,40 veces superior a Q4_K_M y un 11,19 % menos de coincidencia top-1, pero obtiene 26/33 respuestas correctas frente a 25/33 de Q4_K_M, con una pérdida adicional.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una divergencia KL media de 0,0442 frente a bf16, superior a la de Q4_K_M (0,0315); en tareas sensibles a la precisión de la distribución de tokens puede degradarse más que una cuantización de 4 bits convencional.
- La calibración se realizó con 262.144 tokens de WikiText-2 y Wikipedia en coreano, con solo un 45 % de inglés; el rendimiento en otros idiomas o dominios (código, matemáticas, textos técnicos) no está verificado y puede ser peor.
- Los idiomas declarados son inglés y coreano; el modelo base soporta más idiomas, pero la cuantización no garantiza su calidad.
- Riesgo de alucinación inherente al modelo base Llama-3.2-3B-Instruct, agravado por la pérdida de precisión de la cuantización.
- El modelo está diseñado para Tensix; fuera de ese hardware se pierde la ventaja de tamaño y no se ha validado el rendimiento en GPU.
- No se han publicado mediciones de velocidad, latencia ni throughput en dispositivo; las cifras de evaluación son de host.
- La licencia Llama 3.2 impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); es necesario revisar los términos de la licencia de Meta antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- El tamaño del repositorio (6,4 GB) es mayor que el empaquetado final (2,374 GB) porque los valores se almacenan como bf16; hay que contar con ese espacio en disco al descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Variante BFP8 del mismo autor: https://huggingface.co/Xylolabs/Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP8
- Licencia Llama 3.2: https://huggingface.co/Xylolabs/Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
- Código de cuantización y verificación (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release de tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels para Tensix (tensix-kernels v0.1.0): https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner para Tensix (tensix-runner v0.1.0): https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
