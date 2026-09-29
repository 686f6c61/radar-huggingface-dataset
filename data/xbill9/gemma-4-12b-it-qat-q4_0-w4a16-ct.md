# xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct

## Resumen

`xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct` es un reempaquetado no oficial de los pesos con entrenamiento consciente de cuantizacion (QAT) de Gemma 4 12B-it de Google DeepMind, convertidos al formato `compressed-tensors` W4A16 que carga vLLM. El autor, `xbill9`, parte de `google/gemma-4-12B-it-qat-q4_0-unquantized` y recupera, grupo a grupo, los valores de la rejilla de 4 bits ya presentes en ese export, escribiendolos como int4 empaquetado sin realizar una cuantizacion nueva.

El modelo tiene 11.959.730.224 parametros totales y ocupa 7,68 GiB en disco, frente a los 22,28 GiB del checkpoint bf16 de origen. Se cuantizan las capas lineales de atencion y MLP del modelo de lenguaje (48 capas), mientras que embeddings, normalizaciones y la torre de vision se mantienen en bf16 copiados byte a byte. La tarea declarada en HuggingFace es image-text-to-text, aunque el autor indica que la ruta prevista en TPU es solo texto.

Su relevancia es practica: ofrece una via para servir Gemma 4 12B-it en vLLM con kernels int4 sobre TPU (mediante `tpu-inference`) y, previsiblemente, sobre GPU NVIDIA con kernels Marlin, manteniendo los valores de la rejilla Q4_0 original en lugar de la rejilla propia del checkpoint W4A16 oficial de Google. Es un repositorio sin descargas ni likes en el momento de la consulta y con verificacion de repack documentada, pero sin evaluacion propia publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (`gemma4_unified`), transformer multimodal con torre de vision y modelo de lenguaje de 48 capas |
| Parametros totales | 11.959.730.224 (11,96 B) |
| Longitud de contexto | no disponible (el ejemplo de servicio del autor usa `--max-model-len 2048`, valor de despliegue, no contexto nativo declarado) |
| Tipos de cuantizacion | int4 simetrico, group size 32, escalas bf16, activaciones sin cuantizar (W4A16); formato `compressed-tensors` `pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (`compressed-tensors`, `pack-quantized`) |

Datos adicionales: tamano del repositorio 8,3 GB; pesos cuantizados 7,68 GiB; checkpoint de origen bf16 22,28 GiB; libreria declarada `vllm`; modelo base `google/gemma-4-12B-it-qat-q4_0-unquantized`; creado el 2026-09-28.

## Arquitectura y entrenamiento

Se trata de un transformer multimodal de la familia Gemma 4: un modelo de lenguaje de 48 capas cuyas capas lineales de atencion (q, k, v, o) y de MLP (gate, up, down) han sido cuantizadas a int4, mas una torre de vision que se conserva en bf16. El entrenamiento original, incluido el QAT, es de Google DeepMind; este repositorio no entrena ni cuantiza de nuevo, solo cambia el contenedor de los pesos. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica del repack esta en como se reconstruye la escala de cada grupo. El export `-qat-q4_0-unquantized` almacena valores bf16 que ya estan sobre una rejilla de 4 bits: dentro de cada grupo de 32 pesos a lo largo de la dimension de entrada, cada peso es `step × level` con `level` entre -8 y 7. El script `repack_q4_0.py` no aplica el paso teorico `max|w| / 8`, que seria incorrecto para grupos cuyo peso maximo no llega al nivel 8, sino que busca el paso `max|w| / m` (con m de 1 a 8) que reproduce los 32 valores, y despues lo refina por minimos cuadrados guardandolo en bf16. La verificacion recorre ambos checkpoints y comprueba todos los grupos: 340.623.360 grupos analizados, 0 niveles fuera de la rejilla de origen, 89,6% de valores bit a bit identicos (el resto difiere solo a traves de la escala bf16, con un maximo de 1,09e-2 de error relativo) y los 349 tensores no cuantizados byte a byte identicos.

## Capacidades

- Generacion de texto conversacional en el modelo de lenguaje de 12B, con ajuste de instrucciones (`-it`).
- Procesamiento de imagen y texto segun la etiqueta de pipeline `image-text-to-text`; la torre de vision esta presente, pero el autor indica que no ha sido probada y que la ruta prevista en TPU es solo texto.
- Inferencia cuantizada int4 W4A16 con activaciones en bf16, orientada a despliegue en vLLM.
- Compatibilidad declarada con decodificacion especulativa por prediccion multi-token (MTP) siempre que el modelo asistente sea tambien un checkpoint QAT de la misma precision (condicion indicada en la model card de Google, no especifica de este repack).
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Servicio de chat de texto en TPU: el autor documenta el arranque con `vllm serve <repo> --max-model-len 2048 --hf-overrides '{"architectures": ["Gemma4ForCausalLM"]}'` sobre el backend TPU de vLLM, apropiado para entornos Google Cloud con chips TPU v6e.
- Despliegue economico en GPU de gama alta para consumo: con 7,68 GiB de pesos int4, encaja en tarjetas de 16-24 GB, lo que permite servir un modelo de 12B en hardware de una sola GPU sin recurrir al bf16 de 22,28 GiB.
- Reproduccion y auditoria de cuantizacion: los ficheros `repack_report.json` y `verify_report.json` permiten auditar grupo a grupo que los valores int4 corresponden a la rejilla Q4_0 del export de Google, util en equipos que necesitan trazabilidad del proceso de cuantizacion.
- Banco de pruebas comparativo de formatos de cuantizacion: sirve para medir la diferencia practica entre servir la rejilla Q4_0 y la rejilla propia del W4A16 oficial de Google, partiendo de la suite publica de 3.880 registros citada por el autor.
- Integracion en pipelines vLLM existentes: al usar `compressed-tensors` `pack-quantized`, se puede cargar con los kernels int4 de vLLM sin conversiones adicionales en el backend correspondiente.
- Prototipado de asistentes con contexto corto: el ejemplo de servicio con 2.048 tokens resulta adecuado para tareas de respuesta corta, clasificacion por probabilidad de etiqueta o generacion de respuestas breves.
- Base para experimentos de decodificacion especulativa: combinable con un modelo asistente QAT de la misma precision para evaluar aceleracion por MTP en el mismo backend.
- Evaluacion multimodal exploratoria: la torre de vision esta incluida, por lo que puede probarse en tareas imagen-texto, asumiendo que el autor no la ha validado ni en TPU ni en el checkpoint completo.

## Benchmarks y rendimiento

El autor publica una comparativa de los checkpoints de origen (no de este repack) sobre una suite publica de 3.880 registros evaluada por probabilidad de etiqueta en un solo chip TPU v6e:

| Build de 12B | Suite (probabilidad de etiqueta) |
|---|---|
| `google/gemma-4-12B-it` bf16 | 76,0% |
| `google/gemma-4-12B-it-qat-q4_0-unquantized` (valores que almacena este repack, servidos en bf16) | 75,7% |
| `google/gemma-4-12B-it-qat-w4a16-ct` | 75,1% |

La diferencia entre las dos ultimas builds es de -0,7 puntos (rango del 95%: -1,3 a 0,0). El propio repack no ha sido servido ni puntuado todavia, por lo que no hay resultados medidos sobre este repositorio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: 7,68 GiB en int4. Con cache KV y overhead de runtime, un despliegue a contexto corto requiere del orden de 10-12 GB de memoria (estimacion a partir del tamano de pesos, no medida publicada).
- TPU: ruta confirmada por el autor en un chip TPU v6e, con el backend TPU de vLLM cargando capas lineales W4A16 mediante `tpu-inference` PR #3653.
- GPU NVIDIA: no probado con este checkpoint. El repack equivalente de 26B, hecho de la misma forma, carga sin parches en vLLM 0.30.0 con los kernels Marlin int4, lo que sugiere compatibilidad, pero no es una validacion de este repositorio.
- GPU de consumo: por tamano de pesos, cabe en tarjetas de 16 GB o mas (por ejemplo RTX 4080, RTX 4090, RTX 5090), siempre que el framework de servicio soporte el formato `compressed-tensors` W4A16.
- Opciones de despliegue: vLLM (backend TPU y, previsiblemente, GPU con Marlin); para el modelo base de Google existen exportaciones GGUF (`google/gemma-4-12B-it-qat-q4_0-gguf`) que abririan la puerta a llama.cpp u Ollama, pero este repositorio concreto no distribuye GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct` (este) | 11,96 B | safetensors, `compressed-tensors` W4A16 int4, group size 32 | no disponible | Apache 2.0 | Repack no oficial, 0 descargas |
| `google/gemma-4-12B-it-qat-w4a16-ct` | 12 B | `compressed-tensors` W4A16 int4 | no disponible | Apache 2.0 | Oficial de Google; su rejilla de 4 bits no coincide con la del export Q4_0 (6,67% de error relativo medido en el 31B) |
| `google/gemma-4-12B-it-qat-q4_0-unquantized` | 12 B | safetensors bf16 con valores sobre rejilla de 4 bits | no disponible | Apache 2.0 | Oficial de Google; 22,28 GiB, es el origen de este repack |
| `google/gemma-4-12B-it` (bf16) | 12 B | safetensors bf16 | no disponible | Apache 2.0 | Oficial de Google; referencia de maxima calidad, 22,28 GiB |
| `google/gemma-4-12B-it-qat-q4_0-gguf` | 12 B | GGUF | no disponible | Apache 2.0 | Oficial de Google, orientado a llama.cpp/Ollama |

En la suite de 3.880 registros del autor, la build bf16 obtiene 76,0%, el export Q4_0 servido en bf16 un 75,7% y el W4A16 oficial un 75,1%; este repack se situa, por construccion, en la rejilla del segundo.

## Limitaciones y advertencias

- Reempaquetado no oficial: no esta afiliado ni respaldado por Google; los problemas deben reportarse al autor del repositorio, no a Google.
- No ha sido servido ni evaluado: no hay ninguna medicion de calidad, latencia o throughput sobre este checkpoint; las cifras de la suite corresponden a los checkpoints de origen.
- Vision sin validar: la torre de vision se conserva en bf16, pero el autor indica que la ruta prevista en TPU es solo texto y que la parte visual no ha sido probada.
- Compatibilidad NVIDIA no verificada para este checkpoint; la evidencia procede de un repack analogo de 26B.
- Restricciones de contexto: el unico valor de contexto documentado es un parametro de servicio de 2.048 tokens; no se informa de la longitud de contexto nativa del modelo, lo que limita su uso en tareas de contexto largo sin verificacion previa.
- Idiomas soportados no informados, por lo que no puede garantizarse cobertura multilingue concreta.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; deben consultarse en la model card original de Google, incluida como `ORIGINAL_README.md` en el repositorio.
- Licencia: el repositorio se distribuye bajo Apache 2.0 con enlace a la licencia de Gemma 4. Antes de un uso comercial conviene verificar los terminos vigentes de dicha licencia, ya que el propio autor remite a ese enlace.
- Diferencia con la rejilla oficial: los valores int4 no son los del W4A16 oficial de Google; esto afecta a la reproducibilidad de resultados si se mezclan checkpoints o se comparan salidas entre ambos.
- Compatibilidad de decodificacion especulativa: si se usa MTP, el modelo asistente debe ser tambien QAT y de la misma precision.
- Advertencia de seguridad: como cualquier modelo de lenguaje, puede generar contenido incorrecto o inapropiado; no se documentan filtros adicionales en este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Checkpoint W4A16 oficial de Google: https://huggingface.co/google/gemma-4-12B-it-qat-w4a16-ct
- Export GGUF de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Script de repack y verificacion: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/repack_q4_0.py
- PR de soporte W4A16 en el backend TPU de vLLM: https://github.com/vllm-project/tpu-inference/pull/3653
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de despliegue en GCE con NVIDIA L4 y MCP: https://xbill999.medium.com/12b-gemma-4-qat-deployment-with-gce-nvidia-l4-mcp-and-antigravity-cli-7b9f67f4db83
- Decodificacion especulativa MTP en NVIDIA L4: https://xbill999.medium.com/mtp-speculative-decoding-with-the-12b-gemma-4-qat-model-on-nvidia-l4-cloud-run-mcp-and-ae6632ff66bd
