# xbill9/gemma-4-12B-it-qat-w8a8-int8

## Resumen

`xbill9/gemma-4-12B-it-qat-w8a8-int8` es una conversion no oficial del checkpoint con entrenamiento consciente de cuantizacion (QAT) de Google, `google/gemma-4-12B-it-qat-q4_0-unquantized`, a un esquema de cuantizacion int8 W8A8 compatible con vLLM. El autor, identificado como `xbill9`, no pertenece a Google DeepMind: se trata de un reempaquetado de los pesos QAT originales, redondeados a int8 por canal, cuyo objetivo es ofrecer una version de 8 bits que aproveche los kernels de cuantizacion de vLLM en lugar del formato Q4_0 de origen.

El modelo conserva los 11.907.350.320 parametros (unos 11,9 mil millones) del Gemma 4 12B-it, pero elimina las torres de vision y audio, por lo que es un modelo exclusivamente de texto. Los pesos se almacenan en int8 con una escala bf16 por canal de salida, mientras que las activaciones se cuantizan a int8 por token en tiempo de ejecucion (formato `int-quantized` de compressed-tensors); embeddings y capas de normalizacion permanecen en bf16. El checkpoint ocupa 12,03 GiB, lo que lo hace viable en GPU de consumo con 24 GB de VRAM.

Su relevancia es practica: Gemma 4 se distribuye con variantes QAT oficiales en W4A16 para los tamanos E2B, E4B, 12B y 31B, pero este repositorio explora una ruta alternativa (W8A8 int8) para quienes buscan mayor fidelidad numerica respecto al maestro QAT a cambio de un mayor consumo de memoria. Al no tener descargas ni likes registrados en el momento de la consulta, debe considerarse un artefacto experimental sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, tag `gemma4_unified`; detalles de arquitectura no especificados en la informacion proporcionada) |
| Parametros totales | 11.907.350.320 (aproximadamente 11,9 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8 (pesos int8 con una escala bf16 por canal de salida; activaciones int8 por token en tiempo de ejecucion); modelo base sobre rejilla Q4_0 de QAT |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de licencia de Google) |
| Formato de pesos | safetensors con compressed-tensors, formato `int-quantized` (libreria declarada: vLLM) |

Datos adicionales: tamano del repositorio 13,0 GB; checkpoint 12,03 GiB; embeddings y capas de normalizacion en bf16; torres de vision y audio eliminadas.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en la documentacion proporcionada. El modelo deriva de `google/gemma-4-12B-it-qat-q4_0-unquantized`, es decir, de los pesos de instruccion de Gemma 4 12B sometidos previamente a entrenamiento consciente de cuantizacion (QAT) por parte de Google y publicados ya sobre la rejilla de cuantizacion Q4_0. El autor toma esos pesos y los redondea a int8 por canal, sin un nuevo proceso de entrenamiento ni de calibracion con datos: se trata por tanto de una recuantizacion post-hoc del maestro QAT, no de un entrenamiento adicional.

El esquema resultante es W8A8: pesos en int8 con una escala bf16 por canal de salida y activaciones cuantizadas a int8 por token en tiempo de ejecucion, equivalente a una exportacion W8A8 de llm-compressor. La fidelidad de la conversion respecto a los pesos QAT originales se documenta con el error relativo por tipo de capa:

| Capa | Tensores | Error relativo frente a QAT |
|---|---:|---|
| `mlp.down_proj` | 48 | 0,78–1,36 % (media 1,03 %) |
| `mlp.gate_proj` | 48 | 0,80–1,20 % (media 0,85 %) |
| `mlp.up_proj` | 48 | 0,78–1,13 % (media 0,85 %) |
| `self_attn.k_proj` | 48 | 0,83–1,59 % (media 0,94 %) |
| `self_attn.o_proj` | 48 | 0,79–1,45 % (media 0,91 %) |
| `self_attn.q_proj` | 48 | 0,78–1,22 % (media 0,89 %) |
| `self_attn.v_proj` | 40 | 0,79–1,32 % (media 0,89 %) |

El proceso de conversion se realizo con el script `w8a8_from_qat.py`, publicado en el repositorio `xbill9/gemma4-dev`. Existe una variante gemela de menor tamano, `xbill9/gemma-4-E2B-it-qat-w8a8-int8`. En el ecosistema oficial, Gemma 4 ofrece QAT en W4A16 para E2B, E4B, 12B y 31B; cuando se usa decodificacion especulativa con un modelo asistente junto a un modelo objetivo QAT, el asistente debe ser tambien un checkpoint QAT con la misma precision.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo Gemma 4 12B-it original (el repositorio no detalla capacidades adicionales).
- Capacidad multimodal eliminada: las torres de vision y audio se han descartado, por lo que el modelo es exclusivamente de texto.
- Razonamiento, flujos de trabajo agenticos y codigo: la familia Gemma 4 esta descrita por Google y Ollama como adecuada para razonamiento, agentic workflows, coding y comprension multimodal, si bien en este checkpoint concreto la parte multimodal no esta presente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como dato especifico de este checkpoint.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking mode), audio o vision: no disponible en este checkpoint (vision y audio explicitamente eliminados).

## Casos de uso

- Despliegue de inferencia de texto en vLLM: el repositorio esta empaquetado especificamente para vLLM con kernels de cuantizacion int8 (compressed-tensors), por lo que es directamente utilizable como backend de servidor con API compatible con OpenAI para aplicaciones de chat y generacion de texto.
- Servicio en GPU de consumo con 24 GB: al ocupar el checkpoint 12,03 GiB, permite servir un modelo de 11,9 mil millones de parametros en tarjetas como la RTX 4090 o RTX 3090 sin recurrir a cuantizaciones de 4 bits, manteniendo mayor fidelidad respecto al maestro QAT.
- Evaluacion comparativa de esquemas de cuantizacion: sirve como referencia para medir el impacto de W8A8 int8 frente a las variantes oficiales W4A16 en tareas de texto, dado que el autor publica el error relativo por capa frente a los pesos QAT.
- Generacion de codigo asistida por IA en entornos de desarrollo: el modelo base esta orientado a coding segun la documentacion de la familia Gemma 4, y el formato vLLM facilita su integracion en servidores de autocompletado o revision de codigo, siempre que se valide la calidad tras la recuantizacion.
- Prototipado de agentes de texto en investigacion: al ser un checkpoint int8 sin torres multimodales, reduce el consumo de memoria frente a la version completa, lo que simplifica experimentos de razonamiento multi-paso y planificacion sobre texto.
- Aplicaciones sensibles a la latencia en una unica GPU: la cuantizacion int8 con kernels dedicados de vLLM busca mayor throughput que una carga en bf16, adecuada para servicios de resumen, clasificacion o extraccion de informacion con volumen moderado.
- Base para comparaciones de licencia abierta en entornos empresariales: al estar bajo licencia Gemma, puede integrarse en productos comerciales sujetos a los terminos de uso de Google, con la advertencia de que es un artefacto no oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo de rendimiento publicado es la tabla de error relativo de la cuantizacion frente a los pesos QAT (entre 0,78 % y 1,59 % segun la capa), incluida en la seccion de arquitectura y entrenamiento. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos: 12,03 GiB (checkpoint int8). Con overhead de runtime, cache KV y activaciones, se recomienda un margen adicional; una estimacion prudente es de 14 a 18 GB en funcion de la longitud de contexto y del tamano de lote, aunque la cifra exacta no esta publicada.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). Cualquier GPU con al menos 16-24 GB de VRAM es un punto de partida razonable.
- GPU de consumo: si cabe en tarjetas de 24 GB; no cabe en GPUs de 8 o 12 GB sin recurrir a otro esquema de cuantizacion o a offloading.
- Opciones de despliegue: vLLM es la libreria declarada y el formato compressed-tensors `int-quantized` esta pensado para sus kernels de cuantizacion. No se indica compatibilidad con llama.cpp, Ollama o TGI, y no se publica ningun GGUF en este repositorio. La variante oficial `gemma4:12b-it-qat` si esta disponible en Ollama, pero es un artefacto distinto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `xbill9/gemma-4-12B-it-qat-w8a8-int8` | 11,9 B | int8 W8A8 (compressed-tensors) | no disponible | Gemma | HuggingFace, no oficial, 0 descargas | Solo texto; vision y audio eliminados |
| `google/gemma-4-12B-it-qat-w4a16-ct` | no disponible (familia 12B) | W4A16 | no disponible | Gemma | HuggingFace, oficial de Google | Variante QAT oficial en 4 bits de pesos |
| `google/gemma-4-12B` | no disponible (familia 12B) | no disponible | no disponible | Gemma | HuggingFace, oficial de Google | Modelo base de la familia, sin QAT |
| `xbill9/gemma-4-E2B-it-qat-w8a8-int8` | no disponible (variante E2B) | int8 W8A8 | no disponible | Gemma | HuggingFace, no oficial | Gemelo de menor tamano del mismo autor |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la comparacion se limita a formato, licencia y origen.

## Limitaciones y advertencias

- Modelo no oficial: no lo ha publicado Google DeepMind. El autor indica explicitamente que los problemas deben reportarse en el repositorio del modelo, no a Google.
- Solo texto: las torres de vision y audio han sido eliminadas, por lo que cualquier caso de uso multimodal del Gemma 4 original no es aplicable.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de pruebas independientes de calidad o estabilidad.
- Perdida de fidelidad por recuantizacion: el paso de la rejilla Q4_0 a int8 introduce un error relativo del 0,78 % al 1,59 % por capa respecto al maestro QAT; no se ha publicado una evaluacion de como se traduce ese error en tareas concretas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de lenguaje de esta familia.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide planificar aplicaciones multilingues o con contexto largo sin una evaluacion previa.
- Restricciones de licencia: se aplica la licencia Gemma de Google, con sus terminos de uso y politicas de uso prohibido; es responsabilidad del integrador revisar dichos terminos antes de un uso comercial.
- Compatibilidad de decodificacion especulativa: si se emplea un modelo asistente junto a un objetivo QAT, la documentacion oficial de Gemma 4 exige que el asistente sea tambien un checkpoint QAT con la misma precision.
- Despliegue: el formato compressed-tensors esta orientado a vLLM; no hay garantia de funcionamiento en otros runtimes y no se proporciona GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-12B-it-qat-w8a8-int8
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Variante gemela E2B del mismo autor: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-w8a8-int8
- Script de conversion: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/w8a8_from_qat.py
- Gemma 4 12B oficial de Google: https://huggingface.co/google/gemma-4-12B
- Variante oficial QAT W4A16: https://huggingface.co/google/gemma-4-12B-it-qat-w4a16-ct
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Anuncio de Gemma 4 12B en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Gemma 4 12B-it-qat en Ollama: https://ollama.com/library/gemma4:12b-it-qat
