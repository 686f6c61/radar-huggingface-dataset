# yamahei21/huihui-qwen3.5-4b-int4-rht-rtn

## Resumen

Huihui Qwen3.5-4B INT4 (RHT + Group32 RTN) es un checkpoint experimental publicado por el usuario yamahei21 en Hugging Face. Se trata de una cuantizacion a INT4 del modelo base `huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated`, un derivado "abliterated" (con los mecanismos de rechazo atenuados) de la familia Qwen3.5 de 4B parametros. El checkpoint emplea la herramienta uzu/lalamo para aplicar cuantizacion de tipo round-to-nearest (RTN) combinada con una transformada de Hadamard aleatoria (RHT) sobre bloques de 32 elementos.

El modelo resuelve un problema concreto: permitir la ejecucion de un transformer de aproximadamente 4B parametros en hardware de consumo con un peso de solo ~2,44 GB en `model.safetensors`. Segun las mediciones del autor en un Apple M3 con 16 GB de memoria unificada, alcanza 14,0 t/s de generacion en ingles y 18,6 t/s en japones, con un TTFT de 0,19 s y 0,15 s respectivamente. Esto lo situa en el rango de viabilidad para inferencia local en portatiles y equipos sin GPU dedicada de gran VRAM.

Es relevante ahora porque combina tres tendencias del ecosistema open source: la cuantizacion agresiva a 4 bits con tecnicas de rotacion (RHT), los modelos derivados "abliterated" que eliminan capas de rechazo, y la experimentacion con formatos propietarios (uzu/lalamo) alternativos a GGUF o safetensors estandar. No obstante, el propio autor lo marca como experimental, sin instruction tuning posterior a la cuantizacion y sin las tecnicas YAQA/QAD aplicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5), 32 capas, hidden 2560, tied embedding |
| Parametros totales | 2.302.180.352 (~2,3B segun safetensors; el autor lo denomina 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrico grupo 32 + RHT (Hadamard bloque 32, input_output); embedding/readout INT4 tied con RHT output-only; norm en BF16/F32 |
| Idiomas soportados | no disponible oficialmente; el autor reporta pruebas en ingles (EN) y japones (JA) |
| Licencia | no disponible en la model card; el autor indica que sigue la licencia del modelo base y los terminos de Qwen3.5 |
| Formato de pesos | safetensors (layout output_input), ~2,44 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso con 32 capas, dimension oculta de 2560 y embeddings atados (tied embedding), segun los datos declarados en la model card. No se especifica el numero de cabezas de atencion, la dimension de la MLP ni el vocabulario. El checkpoint deriva de `huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated`, un modelo abliterated (con intervenciones para reducir rechazos) sobre la base Qwen3.5-4B, aunque no se detalla el proceso de abliteration ni los datos de entrenamiento originales.

La innovacion tecnica principal es la cuantizacion: se aplica una transformada de Hadamard aleatoria (RHT) por bloques de 32 elementos antes de la cuantizacion INT4 asimetrica con grupo de tamano 32, en layout `output_input`. Los embeddings y la capa de readout se cuantizan a INT4 con RHT solo en la salida (tied). Las capas de normalizacion se mantienen en BF16/F32. No se aplicaron tecnicas de cuantizacion consciente del entrenamiento como YAQA o QAD, ni instruction tuning posterior a la cuantizacion. El autor referencia los commits de lalamo (`e401e177...`) y uzu (`fa0aa23d`) usados en el pipeline.

## Capacidades

- Generacion de texto autoregresiva en ingles y japones, segun las pruebas del autor.
- Razonamiento y respuesta a instrucciones heredados del modelo base, aunque sin instruction tuning posterior a la cuantizacion.
- Capacidad multilingue no documentada oficialmente; solo se verifican EN y JA.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta vision, audio ni modo "thinking".
- Al ser un modelo abliterated, se espera una menor tendencia al rechazo de peticiones, aunque esto no se cuantifica en la model card.

## Casos de uso

- Inferencia local en portatiles Apple Silicon: con 2,44 GB de pesos y 14-18 t/s de generacion en M3 16 GB, es viable para asistentes de escritorio sin GPU dedicada.
- Prototipado de chatbots en ingles o japones: permite iterar rapidamente en local con un TTFT inferior a 0,2 s.
- Pruebas de cuantizacion e investigacion de formatos: sirve como banco de pruebas para comparar RHT+RTN frente a otros esquemas (GPTQ, AWQ, GGUF Q4) sobre la misma base.
- Evaluacion de modelos abliterated: util para estudiar el efecto de la abliteration combinada con cuantizacion agresiva en la calidad de salida.
- Despliegue en entornos con memoria muy limitada (Raspberry Pi 5 con 8-16 GB, mini-PC): el peso de 2,44 GB permite cargar el modelo en sistemas con poca RAM.
- Generacion de texto offline en aplicaciones de escritorio o CLI mediante el runtime uzu, sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas de inferencia medidas en un Apple M3 con 16 GB:

| Metrica | Ingles (EN) | Japones (JA) |
|---|---|---|
| TTFT | 0,19 s | 0,15 s |
| Prefill | 92,5 t/s | 114,3 t/s |
| Generacion | 14,0 t/s | 18,6 t/s |
| Memoria | 2,40 GB | 2,40 GB |

## Requisitos de hardware

- VRAM/RAM estimada: ~2,40 GB para los pesos en INT4, mas overhead del runtime (estimado 3-4 GB en total).
- Cabe en GPU consumer: si, en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Cabe en Apple Silicon: verificado en M3 16 GB; previsiblemente tambien en M1/M2 con 8 GB o mas.
- GPU recomendadas para mayor throughput: RTX 4090, A100, H100 (no medidas por el autor).
- Opciones de despliegue: runtime uzu (unico documentado por el autor); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato propietario de cuantizacion.
- Latencia y throughput: TTFT 0,15-0,19 s y 14-18,6 t/s de generacion en M3 16 GB; sin datos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yamahei21/huihui-qwen3.5-4b-int4-rht-rtn | ~2,3B (safetensors) | no disponible | INT4 RHT+RTN (uzu/lalamo) | no disponible (sigue base) | Hugging Face, 0 descargas |
| huihui-ai/Huihui-Qwen3-4B-abliterated-v2 | 4B | no disponible | BF16 original | no disponible en la info | Hugging Face |
| huihui-ai/Qwen3-4B-abliterated | 4B | no disponible | BF16 original | no disponible en la info | Hugging Face |

La comparativa directa con el modelo base `huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated` no esta disponible en la informacion proporcionada. Frente a las versiones abliterated de Qwen3-4B, este checkpoint ofrece un peso mucho menor (2,44 GB frente a ~8 GB en BF16) a costa de una perdida de calidad no cuantificada y de un formato de runtime menos estandar.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no apto para produccion sin evaluacion previa.
- No ha recibido instruction tuning despues de la cuantizacion, por lo que la calidad de seguimiento de instrucciones puede degradarse.
- No se han aplicado tecnicas YAQA/QAD, lo que puede implicar mayor perdida de precision frente a esquemas de cuantizacion consciente.
- El autor reporta errores factuales en japones atribuibles al modelo base, no necesariamente a la cuantizacion.
- Al ser un modelo abliterated, puede generar contenido que otros modelos rechazarian; requiere moderacion externa en aplicaciones publicas.
- Licencia no declarada explicitamente en la model card; el autor remite a la licencia del modelo base y a los terminos de Qwen3.5, lo que introduce incertidumbre para uso comercial.
- Formato de cuantizacion propietario (uzu/lalamo) con compatibilidad limitada fuera de ese runtime.
- Longitud de contexto no documentada; no se puede garantizar soporte de contextos largos.
- Riesgo de alucinacion no evaluado; sin benchmarks de calidad publicados.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/yamahei21/huihui-qwen3.5-4b-int4-rht-rtn
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated
- Referencia abliterated Qwen3-4B v2: https://huggingface.co/huihui-ai/Huihui-Qwen3-4B-abliterated-v2
- Referencia abliterated Qwen3-4B: https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
