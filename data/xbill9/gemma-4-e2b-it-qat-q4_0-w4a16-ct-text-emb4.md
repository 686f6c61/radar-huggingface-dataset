# xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4

## Resumen

Este repositorio es un reempaquetado no oficial del modelo cuantizado `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text`, que a su vez deriva de los pesos QAT de Google (`google/gemma-4-E2B-it-qat-q4_0-unquantized`). Lo publica el usuario xbill9, sin afiliación con Google, y su aportación concreta es empaquetar también las tres tablas de embedding (`embed_tokens_per_layer`, `embed_tokens` y `lm_head`) en int4, de forma que todos los tensores grandes del modelo quedan en 4 bits. El checkpoint pasa de 6,11 GiB a 2,64 GiB y la carga en VRAM en una Tesla T4 con vLLM 0.29.0 baja de 6,33 GiB a 2,86 GiB.

El modelo pertenece a la familia Gemma 4 de Google DeepMind y, en esta variante, es estrictamente text-only: no acepta entradas de imagen ni audio. El recuento de safetensors es de 5.031.222.563 parámetros, aunque una parte muy grande corresponde a tablas de embedding (la PLE sola, de 262.144 x 8.960, suma unos 2,35B), coherente con la nomenclatura E2B de la familia. Se distribuye bajo licencia Apache 2.0, con el enlace a la licencia específica de Gemma 4.

La relevancia práctica del repack es de ingeniería de despliegue: como *lm_head* queda desacoplado y vLLM lo ejecuta como una linear int4 Marlin, la decodificación medida en una T4 sube de 81,6 a 109,7 tok/s (un 34% más rápida) y el espacio liberado permite un KV cache de 1.099.362 tokens frente a 711.539 del build `-text`. Todo ello requiere vLLM 0.29 o superior, que añadió soporte de embeddings int4 de compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (variante text-only); incluye tabla de embeddings por capa (PLE) y `lm_head` desacoplado |
| Parametros totales | 5.031.222.563 (~5,03B) segun safetensors; ~2,35B en la tabla PLE (262.144 x 8.960) y ~403M en `embed_tokens` (262.144 x 1.536) |
| Parametros activos | No aplica: variante densa, no MoE |
| Longitud de contexto | 16.384 tokens configurados en el servicio de referencia (`--max-model-len 16384`); longitud nativa no disponible |
| Tipos de cuantizacion | QAT int4: pesos w4a16 en formato compressed-tensors `pack-quantized`, simetrico int4 con grupo 32 y escalas fp16; las tres tablas de embedding tambien en int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con metadatos compressed-tensors (2,9 GB de repo) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de la familia Gemma 4 en su variante E2B, con atención y capas lineales en la ruta `w4a16` (pesos de 4 bits, activaciones de 16 bits). La particularidad estructural que documenta la model card es la presencia de una tabla de embeddings por capa (PLE) de dimensiones 262.144 x 8.960, además de `embed_tokens` (262.144 x 1.536) y de una `lm_head`. En el checkpoint original `lm_head` está atada a `embed_tokens`; aquí se desacopla y se escribe como una segunda copia de los mismos niveles y escalas, porque vLLM ata la capa de salida copiando `.weight`, que un embedding empaquetado no tiene. El modelo se entrenó con pesos atados, así que ambas copias contienen los valores entrenados.

No hay entrenamiento nuevo en este repositorio: el trabajo es de reempaquetado. Según la card, el QAT de Google ya situaba las tablas de embedding en la misma rejilla de 4 bits que las capas lineales (dentro de cada grupo de 32 valores a lo largo de una fila, cada valor es `step × level` con `level` de −8 a 7). La comprobación que aporta el autor es que sobre `google/gemma-4-E2B-it-qat-q4_0-unquantized`, 0 de 73.400.320 grupos de la tabla PLE y 0 grupos de `embed_tokens` quedan fuera de esa rejilla, mientras que en el modelo bf16 `google/gemma-4-E2B-it` ningún grupo está en ella. El repack recupera el `step` de cada grupo y almacena los niveles; no elige niveles nuevos.

En cuanto a fidelidad de la reconstrucción, el 74,3% de los valores de la PLE y el 74,0% de `embed_tokens` se reconstruyen de forma bit-idéntica. El resto difiere como máximo en 1,25 ulps bf16 del valor de origen (el 99,9% dentro de una), porque los valores de origen son a su vez redondeos bf16 de `step × level`. El resto de tensores del checkpoint se conserva byte a byte. A nivel de familia, la documentación de Google cita soporte nativo del rol de sistema y, para todos los modelos Gemma 4 (E2B, E4B, 12B, 31B y 26B A4B), un modelo borrador dedicado a decodificación especulativa; esta variante text-only no documenta si dicho borrador está incluido.

## Capacidades

- Generación de texto y conversación: pipeline declarado `text-generation`, con etiqueta `conversational` y variante instruct (`-it`) en el modelo base.
- Operación text-only: las entradas de imagen y audio no están soportadas en este build, según las limitaciones declaradas por el autor.
- Soporte del rol de sistema: heredado de Gemma 4, que introduce soporte nativo de *system prompt* para conversaciones más estructuradas.
- Compatibilidad con vLLM 0.29 o superior, que añadió `CompressedTensorsEmbeddingWNA16Int`; versiones anteriores rechazan la configuración.
- Decodificación con *lm_head* int4 Marlin: el desacoplamiento de la capa de salida es lo que habilita la ganancia de velocidad medida en decodificación.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas del repositorio está vacío.
- Modo *thinking* explícito: no documentado en la información disponible.

## Casos de uso

- Servicio de inferencia en GPUs Turing (Tesla T4): el checkpoint carga en 2,86 GiB en fp16 con vLLM 0.29.0, frente a 6,33 GiB del build `-text`, lo que permite mantener el modelo y un KV cache amplio en una tarjeta de 16 GB. Requiere el parche de atención Triton para el límite de memoria compartida en Turing.
- Chat multi-turno con contexto largo: con `--gpu-memory-utilization 0.90` y `--max-model-len 16384`, la T4 aloja un KV cache de 1.099.362 tokens, suficiente para muchas conversaciones concurrentes con historiales largos sobre una sola GPU.
- Procesamiento por lotes de texto (resumen, extracción, clasificación): 109,7 tok/s en decodificación de un solo flujo sobre T4 permite servir cargas moderadas sin clúster; útil para pipelines de enriquecimiento de documentos on-premise.
- Entornos con licencia Apache 2.0 y despliegue on-premise o air-gapped: al redistribuirse bajo la misma licencia que Gemma 4, encaja en organizaciones que necesitan ejecutar inferencia sin dependencia de APIs externas.
- Backend de prototipos y entornos de investigación con memoria limitada: 2,64 GiB de checkpoint facilitan versionar, copiar y desplegar el modelo en nodos pequeños o en varias instancias por máquina.
- Comparación de pipelines de cuantización: sirve como referencia para medir el efecto de empaquetar embeddings en int4 frente a mantenerlos en bf16, usando el mismo launcher y configuración de vLLM documentados en el repositorio de servicio.
- Evaluación de fidelidad post-cuantización: los scripts de repack y la carpeta de evidencias permiten reproducir la comprobación de rejilla QAT y las comparaciones greedies sobre prompts concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card aporta únicamente mediciones de servicio en una Tesla T4 (vLLM 0.29.0, `--dtype float16 --gpu-memory-utilization 0.90 --max-model-len 16384 --max-num-seqs 8`, caché de compilación caliente) y una comprobación de equivalencia greedy:

| Metrica | `-text` (base) | Este repack |
|---|---:|---:|
| Carga del modelo | 6,33 GiB | 2,86 GiB |
| KV cache disponible | 711.539 tokens | 1.099.362 tokens |
| Decodificacion, un flujo, 256 tokens | 81,6 tok/s | 109,7 tok/s |
| Salida greedy, 8 prompts x 160 tokens | referencia | 8 de 8 identicas token a token |
| Tamano del checkpoint | 6,11 GiB | 2,64 GiB |

El propio autor advierte que la prueba de 8 prompts es una comprobación puntual y no una suite de benchmarks. Las evidencias se publican en el directorio `evidence/` del repositorio de servicio.

## Requisitos de hardware

- VRAM de carga: 2,86 GiB en Tesla T4 con fp16 y vLLM 0.29.0. El build `-text` necesita 6,33 GiB; el ahorro es de 3,47 GiB.
- Memoria para KV cache: 1.099.362 tokens con `--gpu-memory-utilization 0.90` y `--max-model-len 16384` en la T4 (980.210 tokens si se cuentan las reservas de compilación en el primer arranque).
- GPU probada: una única Tesla T4 (arquitectura Turing, fp16). No se han publicado pruebas en otras GPU.
- GPU con bf16: vLLM convierte las escalas fp16 a bf16, lo que según el autor no es peor que almacenarlas ya en bf16.
- GPU consumer: la carga de 2,86 GiB es compatible con tarjetas de gama media, pero no hay mediciones publicadas en GPU consumer concretas; el KV cache para 16.384 tokens de contexto consume VRAM adicional.
- Despliegue: vLLM 0.29 o superior, obligatoriamente. Otros runtimes pueden no cargar embeddings int4; no hay soporte documentado en llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: 109,7 tok/s de decodificación en un flujo sobre T4. No se publica tiempo hasta el primer token ni rendimiento con lotes grandes.
- Notas operativas: es necesario reiniciar el servicio una vez tras el primer arranque, porque vLLM dimensiona el KV cache contando la memoria del compilador como activación y cachea ese cálculo con la clave del identificador del modelo (se repite si cambia el nombre o la ruta). En Turing hace falta además el parche `patch_triton_turing.py` para el límite de memoria compartida de la atención Triton.

## Comparativa con modelos similares

| Modelo | Parametros | Embeddings | Checkpoint | Carga en T4 | Decode (T4) | Licencia |
|---|---|---|---:|---:|---:|---|
| Este repack (`...-ct-text-emb4`) | 5,03B | int4 | 2,64 GiB | 2,86 GiB | 109,7 tok/s | Apache 2.0 |
| `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text` (base del repack) | 5,03B | bf16 | 6,11 GiB | 6,33 GiB | 81,6 tok/s | Apache 2.0 |
| `google/gemma-4-E2B-it-qat-q4_0-unquantized` | no disponible | no disponible | no disponible | no disponible | no disponible | Gemma 4 |
| `google/gemma-4-E2B-it-qat-w4a16-ct` | no disponible | no disponible | no disponible | no disponible | no disponible | Gemma 4 |
| `google/gemma-4-E2B-it` (bf16) | no disponible | bf16 | no disponible | no disponible | no disponible | Gemma 4 |

Solo se dispone de cifras comparativas entre el repack y el build `-text` del mismo autor. Para el resto de variantes de la familia Gemma 4 E2B, la información pública consultada no incluye especificaciones ni rendimiento, por lo que se marcan como no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones específicas para este repack; es un riesgo inherente al modelo base y no se documenta ninguna mitigación.
- Text-only: no admite entradas de imagen ni audio, a diferencia de la implementación vision-language de la familia que cita el material de Google.
- Compatibilidad de runtime muy restringida: necesita vLLM 0.29 o superior. Versiones anteriores rechazan la configuración y otros runtimes pueden no cargar embeddings int4.
- Validación limitada a un único entorno: probado únicamente en una T4 en fp16 con vLLM 0.29.0. No hay datos en A100, H100, RTX ni en GPUs con bf16 nativo.
- Pérdida de fidelidad en la cuantización de embeddings: el 74,3% de los valores de la PLE y el 74,0% de `embed_tokens` se reconstruyen bit a bit; el resto difiere hasta 1,25 ulps bf16 (99,9% dentro de una).
- Comprobación de calidad insuficiente: la equivalencia de salida se verificó con 8 prompts de 160 tokens, un spot check y no una suite de evaluación.
- Rareza operativa en el KV cache: el primer arranque dimensiona el cache por debajo de su capacidad real (980.210 frente a 1.099.362 tokens) y requiere reinicio; el problema reaparece si cambia el identificador o la ruta del modelo.
- Parche necesario en Turing: sin el ajuste del límite de memoria compartida en la atención Triton, el despliegue en T4 no es funcional según el autor.
- Licencia: Apache 2.0, la misma que la licencia Gemma 4 de Google, por lo que se heredan las condiciones de dicha licencia para uso comercial; conviene revisar el enlace oficial antes de desplegar.
- Soporte y mantenimiento: es un repack no oficial, sin respaldo de Google; los problemas deben reportarse al autor del repositorio, no a Google.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4
- Modelo base del repack (`-text`): https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text
- Repositorio de servicio y herramientas: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16
- Evidencias: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16/tree/main/evidence
- Script de reempaquetado de embeddings: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16/blob/main/repack/embed_int4.py
- Copia mantenida en GitHub: https://github.com/xbill9/gemma4-dev/tree/main/gpu-vllm-t4-2b-w4a16
- Checkpoint QAT de referencia: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Build oficial compressed-tensors: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Coleccion Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Vision general de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core
- Blog de Google sobre QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
