# Xylolabs/Mistral-7B-Instruct-v0.3-GGUF

## Resumen

Xylolabs/Mistral-7B-Instruct-v0.3-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo mistralai/Mistral-7B-Instruct-v0.3, publicada por Xylolabs. No se trata de un modelo nuevo, sino de una conversion y cuantizacion del modelo instruct original de Mistral AI, pensada para su ejecucion con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer decoder-only de 7.248.023.552 parametros, con licencia Apache 2.0 y capacidades conversacionales e instruct.

La relevancia de esta publicacion reside en el trabajo de cuantizacion: ofrece cuatro variantes (Q5_K_M, Q4_K_M, IQ4_XS e IQ4_XS-imat) con metricas de divergencia respecto al paso de referencia en BF16 sobre transformers, medidas sobre 16.288 posiciones de texto en ingles y coreano. La variante IQ4_XS-imat incorpora una importance matrix, lo que reduce la perdida de calidad frente a IQ4_XS estandar a un coste de tamano minimo (3,91 GB frente a 3,95 GB).

El modelo hereda del original la ventana de contexto extendida de Mistral 7B Instruct v0.3 y su plantilla de chat, e incluye el tokenizador y el chat template originales en cada archivo GGUF. Los idiomas declarados en la model card son ingles y coreano, coherentes con el conjunto de evaluacion usado para medir la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral 7B Instruct v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (segun el ejemplo de ejecucion de la model card con `-c 8192`) |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, IQ4_XS, IQ4_XS-imat |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral 7B Instruct v0.3, un transformer decoder-only con atencion por ventanas deslizantes y atencion completa combinadas, disenado por Mistral AI para generacion de texto e instrucciones. Esta publicacion no entrena ningun modelo: convierte los pesos originales a GGUF y aplica cuantizacion de bloques k-quant e i-quant. Cada archivo GGUF contiene el modelo de lenguaje completo, el tokenizador original y la plantilla de chat.

El detalle tecnico diferencial es la evaluacion de la cuantizacion. La model card reporta divergencia KL media y porcentaje de coincidencia top-1 frente a una pasada de referencia en BF16 ejecutada en transformers, sobre 16.288 posiciones de texto en ingles y coreano. Los resultados son: Q5_K_M con KL 0,0079 y 95,84% de coincidencia top-1; Q4_K_M con KL 0,0224 y 93,39%; IQ4_XS con KL 0,0291 y 92,14%; e IQ4_XS-imat con KL 0,0226 y 93,22%. La version con importance matrix mejora claramente a IQ4_XS estandar con un incremento de tamano de solo 0,04 GB. Se recomienda llama.cpp en el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida en el GGUF.
- Seguimiento de instrucciones, heredado del ajuste instruct del modelo base.
- Razonamiento basico y respuesta a preguntas en ingles y coreano.
- Generacion de codigo y texto tecnico, limitada por el tamano de 7B del modelo base.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para esta version cuantizada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: las variantes IQ4_XS (3,95 GB) e IQ4_XS-imat (3,91 GB) permiten ejecutar el modelo en CPU con llama.cpp manteniendo una coincidencia top-1 superior al 92% frente a BF16, adecuado para prototipos y entornos de desarrollo.
- Asistentes conversacionales en ingles o coreano: el modelo conserva la plantilla de chat original y puede gestionar dialogos multi-turno dentro de la ventana de 8.192 tokens configurada en los ejemplos de la model card.
- Inferencia en GPUs de consumo: con Q4_K_M (4,37 GB) el modelo cabe en GPUs con 8 GB de VRAM o mas, lo que permite ejecutar un asistente instruct local en equipos de gama media.
- Servicio HTTP ligero con `llama-server`: la model card documenta el uso de `llama-server` con los mismos flags que `llama-cli`, lo que facilita exponer el modelo como endpoint compatible con clientes HTTP en despliegues pequenos.
- Evaluacion de tecnicas de cuantizacion: las metricas KL y top-1 publicadas convierten este repositorio en una referencia util para comparar k-quants frente a i-quants con y sin importance matrix en un modelo de 7B.
- Procesamiento de texto en coreano: al haberse medido la divergencia sobre texto coreano ademas de ingles, la variante IQ4_XS-imat es una opcion razonable para tareas de generacion de texto en ese idioma en entornos con recursos limitados.
- Fine-tuning o destilacion sobre pesos cuantizados: no recomendado directamente; para ajuste fino conviene partir del modelo base en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo reporta metricas de fidelidad de cuantizacion frente a BF16:

| Quant | Tamano | KL media vs BF16 | Coincidencia top-1 vs BF16 |
|---|---|---|---|
| Q5_K_M | 5,14 GB | 0,0079 | 95,84% |
| Q4_K_M | 4,37 GB | 0,0224 | 93,39% |
| IQ4_XS | 3,95 GB | 0,0291 | 92,14% |
| IQ4_XS-imat | 3,91 GB | 0,0226 | 93,22% |

Las metricas cubren 16.288 posiciones de texto en ingles y coreano, con referencia en una pasada BF16 en transformers.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo mas el contexto y buffers de llama.cpp. Q5_K_M requiere unos 5,14 GB de pesos; Q4_K_M unos 4,37 GB; IQ4_XS unos 3,95 GB; IQ4_XS-imat unos 3,91 GB. Con contexto de 8.192 tokens hay que anadir el espacio de la cache KV.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y VRAM suficiente (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100, H100). En Apple Silicon se puede usar Metal; tambien es posible ejecutar en CPU.
- Cabe en GPU de consumo: si, con Q4_K_M o inferiores en GPUs de 8 GB o mas; Q5_K_M encaja comodamente en 8-12 GB.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) en el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior, con `--jinja` para la plantilla de chat y `-ngl 99` para descargar todas las capas en GPU. No se documentan otras opciones en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Mistral-7B-Instruct-v0.3-GGUF | 7,25 B | 8.192 tokens (ejemplo de la model card) | GGUF | Apache 2.0 | Cuantizaciones con metricas KL y top-1 publicadas |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | no disponible en la informacion proporcionada | safetensors (modelo original) | Apache 2.0 | Modelo base sin cuantizar; referencia BF16 |
| Otras cuantizaciones GGUF de Mistral 7B Instruct v0.3 | 7,25 B | no disponible | GGUF | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de tareas para establecer comparaciones de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo hereda los sesgos y riesgos de alucinacion del Mistral 7B Instruct v0.3 original; no se documentan evaluaciones de sesgo en esta publicacion.
- La cuantizacion introduce perdida de fidelidad respecto a BF16, cuantificada en las metricas KL y top-1 de la tabla anterior; Q4_K_M e IQ4_XS-imat son las opciones con mejor compromiso tamano/calidad.
- Los idiomas declarados son ingles y coreano; el rendimiento en castellano no esta evaluado en la informacion disponible.
- La ventana de contexto practica depende de la configuracion de llama.cpp; el ejemplo de la model card usa 8.192 tokens.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones de atribucion correspondientes; el archivo NOTICE del repositorio identifica el modelo fuente y su titular de derechos.
- Xylolabs declara no estar afiliada ni respaldada por los autores del modelo original.
- Para ajuste fino no se recomienda partir de estos pesos cuantizados; conviene usar el modelo base en precision completa.
- El repositorio tiene un volumen de descargas bajo (492) y ningun like en el momento de la consulta, lo que reduce la validacion comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-GGUF/blob/main/LICENSE
- llama.cpp (commit recomendado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs referenciado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
