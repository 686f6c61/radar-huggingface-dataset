# vmarcelo/DaisyRose-27B-QSA-UD-IQ3_S-mtp

## Resumen

DaisyRose-27B-QSA-UD-IQ3_S-mtp es una cuantización GGUF del modelo RadixArk/DaisyRose-27B, un fine-tuning de Qwen/Qwen3.8-27B con 27.373.132.800 parámetros (aproximadamente 27,4 mil millones). La publica el usuario vmarcelo y combina tres piezas: la receta de cuantización UD-IQ3_S de Unsloth, el indexador QSA (Qwen Sparse Attention) procedente de higa2515/Qwen3.8-27B-QSA-BF16 y la cabeza MTP (Multi-Token Prediction) conservada para decodificación especulativa. El resultado es un fichero de 12,25 GB pensado para servir contexto muy largo en hardware de consumo.

La relevancia de esta ficha no está en el modelo base sino en el artefacto de despliegue: añade atención dispersa sobre un transformer denso ya entrenado, sin reentrenar el modelo, y lo empaqueta en un GGUF de 3 bits que cabe en una GPU de 16 GB. Con streaming de caché K/V hacia RAM del sistema, el autor reporta 262.144 tokens de contexto en una RX 9070 XT.

Es un artefacto experimental y de nicho. No funciona con llama.cpp estándar ni con las aplicaciones construidas sobre él (LM Studio, Ollama), requiere forks específicos, y el propio autor advierte que no ha medido calidad frente a atención densa ni tareas generales. Los datos de rendimiento proceden de una única tarjeta y, en parte, de otro modelo QSA del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con indexador QSA v2 de atención dispersa añadido a posteriori y cabeza MTP |
| Parametros totales | 27.373.132.800 (27,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 262.144 tokens en la configuración de referencia del autor; 131.072 con menor necesidad de streaming |
| Tipos de cuantizacion | UD-IQ3_S (receta Unsloth, 866 de 866 tensores con el mismo tipo que Qwen3.8-27B-UD-IQ3_S); caché K/V en q8_0/q4_0 en la config probada |
| Idiomas soportados | No disponible (la model card no los declara; hereda los del modelo base Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero único de 12,25 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,4 B parámetros. Sobre él se injertan dos componentes sin reentrenamiento del modelo principal. Primero, el indexador QSA v2: 80 tensores en FP32 extraídos de higa2515/Qwen3.8-27B-QSA-BF16, destilados originalmente sobre Qwen3.8-27B y añadidos aquí sin cambios mediante `deploy/qsa27b-24gb/gguf_qsa_graft.py`. QSA implementa atención dispersa por bloques, de modo que en inferencia solo se puntúan y materializan los bloques seleccionados por el indexador, lo que reduce el coste de atención en contextos largos. Segundo, la cabeza MTP se conserva intacta para decodificación especulativa con hasta 2 borradores por paso.

La cuantización usa la receta UD-IQ3_S de Unsloth con su imatrix `imatrix_unsloth.gguf`. Conviene subrayar un detalle que el autor explicita: esa imatrix se calculó sobre Qwen3.8-27B base, no sobre DaisyRose, por lo que la asignación de bits por tensor no está optimizada para los pesos del fine-tuning. Salvo los 80 tensores del indexador, todos los demás son idénticos byte a byte al GGUF UD-IQ3_S plano. No hay información sobre el dataset de fine-tuning de DaisyRose ni sobre si RadixArk aplicó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en formato chat; la etiqueta `conversational` figura en los metadatos del repo.
- Razonamiento de contexto largo: recuperación de información en documentos de hasta 262K tokens gracias al indexador QSA y al streaming de caché K/V.
- Decodificación especulativa con cabeza MTP, con 2 borradores por paso en la configuración probada.
- Tool calling y function calling: presumiblemente heredados del modelo base Qwen3.8-27B, aunque la model card no lo confirma explícitamente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Solo texto: no se incluye `mmproj`, por lo que no hay soporte de visión ni audio.
- Modo thinking: el autor menciona haber ejecutado la prueba de recall con "thinking off", lo que sugiere que el modelo base expone un modo de razonamiento, pero no se documenta su comportamiento en esta cuantización.

## Casos de uso

- Análisis de repositorios y bases de código completas: con 262K tokens de contexto se puede cargar un árbol de ficheros extenso y hacer preguntas cruzadas sobre él, usando el indexador QSA para mantener latencia aceptable en lugar de atención densa cuadrática.
- Recuperación sobre corpus documentales largos: contratos, expedientes o manuales de cientos de páginas en un solo prompt, con streaming de caché K/V a RAM para no agotar la VRAM.
- Servicio de chat local en GPU de consumo: un único usuario concurrente (`-np 1`) en una GPU de 16 GB, adecuado para asistente personal o prototipado, no para serving multiusuario.
- Evaluación de investigación sobre atención dispersa: el artefacto permite comparar QSA frente a atención densa en el mismo modelo base y con los mismos pesos cuantizados, útil para estudiar degradación de calidad en contexto largo.
- Procesado por lotes de documentos largos en estaciones de trabajo con una sola GPU: prefill de aproximadamente 800-860 tok/s a 200K tokens hace viables tareas de resumen o extracción sobre volúmenes moderados.
- Pruebas de decodificación especulativa: la cabeza MTP incluida permite medir la ganancia de throughput del drafting en hardware Vulkan sin necesidad de un modelo draft separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor lo indica explícitamente: "This is not a benchmark". Los únicos datos medidos son los siguientes, obtenidos en una RX 9070 XT de 16 GB con Vulkan, K=2048, caché K/V en Q8_0/Q4_0 y MTP con 2 borradores:

| Prueba | Resultado | Condiciones |
|---|---|---|
| Recall en contexto largo | 29/30 aciertos | 30 pares clave→valor con señuelo a un carácter de distancia, documento de 199.901 tokens, thinking off, decodificación greedy, una sola ejecución |
| Prefill | 859 tok/s | A 200K tokens de contexto |
| Decode | ~55 tok/s | Prompt corto |
| Prefill (otro modelo QSA IQ3_S, misma config) | ~800 tok/s | 250K tokens rellenados, 15,2 GiB de VRAM |
| Decode (otro modelo QSA IQ3_S, misma config) | 54-68 tok/s | 250K tokens rellenados, 15,2 GiB de VRAM |

El error del 1/30 consistió en seleccionar el señuelo. La prueba se ejecutó una sola vez, sin repetición ni intervalos de confianza.

## Requisitos de hardware

- VRAM: el fichero pesa 12,25 GB; con caché K/V cuantizada y streaming, la configuración de referencia ocupa unos 15,2 GiB en una GPU de 16 GB a 250K tokens de contexto.
- RAM del sistema: aproximadamente 6,4 GiB en memoria fijada (pinned) para las celdas K/V antiguas a 262K de contexto, con `LLAMA_KV_STREAM_CELLS=16384`, `LLAMA_KV_STREAM_RING=8192` y `LLAMA_KV_STREAM_SLOTS=14336`.
- GPU validadas: RX 9070 XT de 16 GB con backend Vulkan. No hay datos publicados para CUDA, A100, H100 ni RTX 4090; el fork recomendado incluye kernels Vulkan y el kernel CUDA original de `ggml-cuda/qsa-attn.cu` sirve de base al port.
- Cabe en GPU de consumo de 16 GB, pero solo con el fork modificado y con streaming de caché K/V activado. Reducir a `-c 131072` disminuye la presión de streaming.
- Despliegue: exclusivamente `llama-server` de Vmarcelo49/Qwen-QSA-llama.cpp (recomendado, commit `108ecc8`) o pentaCoxian/Qwen-QSA-llama.cpp. llama.cpp upstream, LM Studio y Ollama no pueden cargar el fichero.
- Compilación: `cmake -B build -DGGML_VULKAN=ON && cmake --build build --target llama-server -j`.
- Throughput estimado: 859 tok/s de prefill a 200K y ~55 tok/s de decode en la RX 9070 XT; `-ub 256` ahorra unos 250 MiB de VRAM a costa de prefill más lento.
- La ruta QSA se confirma en el log con la línea `QSA27B route: sparse text`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| DaisyRose-27B-QSA-UD-IQ3_S-mtp | 27,4 B | 262K (config. autor) | GGUF, Apache-2.0 | QSA + MTP, requiere fork de llama.cpp |
| RadixArk/DaisyRose-27B | 27,4 B | No disponible | Pesos completos, Apache-2.0 | Modelo base sin QSA ni cuantizar; atención densa |
| higa2515/Qwen3.8-27B-QSA-BF16 | ~27 B | No disponible | BF16 | Origen del indexador QSA; sin fine-tuning DaisyRose |
| unsloth/Qwen3.8-27B-GGUF (UD-IQ3_S) | ~27 B | No disponible | GGUF, Apache-2.0 | Misma receta de cuantización e imatrix; sin QSA ni MTP |
| Qwen/Qwen3.8-27B | ~27 B | No disponible | Pesos completos | Modelo original de Qwen sobre el que se construye toda la cadena |

No hay datos de benchmarks comparativos publicados que permitan contrastar calidad entre estas variantes.

## Limitaciones y advertencias

- Incompatible con llama.cpp upstream, LM Studio y Ollama. Solo funciona con los forks indicados; cualquier actualización de esos forks puede romper la compatibilidad.
- El indexador QSA se destiló sobre Qwen3.8-27B base y se injertó sin reentrenar sobre DaisyRose. No hay evidencia publicada de que la selección de bloques sea correcta para los pesos del fine-tuning.
- La imatrix de Unsloth se calculó sobre Qwen3.8-27B, no sobre DaisyRose, por lo que la asignación de bits por tensor puede no ser óptima para este modelo.
- Calidad frente a atención densa no medida. El autor declara explícitamente que no se han evaluado tareas generales ni la degradación introducida por la atención dispersa.
- El resultado de recall (29/30) proviene de una única ejecución con decodificación greedy y thinking desactivado; no es estadísticamente robusto.
- Sin soporte multimodal: no se incluye `mmproj`.
- Idiomas soportados no declarados en la model card; deben inferirse del modelo base.
- Riesgo de alucinación y sesgos: no documentados para este artefacto; hereda los del fine-tuning DaisyRose y, en última instancia, de Qwen3.8-27B.
- Licencia Apache-2.0 permite uso comercial, pero las dependencias de ejecución (forks de llama.cpp) deben verificarse por separado.
- Cero descargas y cero likes en el momento de la ficha: sin validación por parte de la comunidad.
- Un solo usuario concurrente en la configuración probada (`-np 1`); no apto para serving multiusuario sin redimensionar.

## Enlaces

- Hugging Face: https://huggingface.co/vmarcelo/DaisyRose-27B-QSA-UD-IQ3_S-mtp
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Indexador QSA en BF16: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Fork recomendado de llama.cpp: https://github.com/Vmarcelo49/Qwen-QSA-llama.cpp
- Fork upstream QSA: https://github.com/pentaCoxian/Qwen-QSA-llama.cpp
- Pull requests del fork recomendado: [#1](https://github.com/pentaCoxian/Qwen-QSA-llama.cpp/pull/1), [#2](https://github.com/pentaCoxian/Qwen-QSA-llama.cpp/pull/2), [#3](https://github.com/pentaCoxian/Qwen-QSA-llama.cpp/pull/3)
- Entrenamiento del indexador: https://github.com/kuraneko1/qsa-indexer-forge
- Paper de QSA: https://arxiv.org/abs/2608.30320
