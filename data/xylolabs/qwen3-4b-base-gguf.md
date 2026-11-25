# Xylolabs/Qwen3-4B-Base-GGUF

## Resumen

Xylolabs/Qwen3-4B-Base-GGUF es una cuantización en formato GGUF del modelo base Qwen3-4B-Base, publicado por el equipo Qwen de Alibaba. El repositorio lo mantiene Xylolabs, que ha convertido los pesos originales en safetensors a GGUF y los ha cuantizado con llama.cpp. Se distribuye un único archivo, `Qwen3-4B-Base-Q4_K_M.gguf`, de 2,497 GB, pensado para inferencia con llama.cpp en hardware de consumo.

El modelo subyacente es un transformer denso de 4.022.468.096 parámetros (aproximadamente 4B) y es un modelo *base*, es decir, sin ajuste por instrucciones ni RLHF: está entrenado para continuar texto, no para seguir instrucciones. Esto lo hace adecuado para *prompting* por continuación, *fine-tuning* posterior y tareas de generación de texto en bruto, pero no para uso conversacional directo sin adaptación.

Su relevancia práctica está en el tamaño: 2,5 GB en Q4_K_M permite ejecutarlo en GPU de consumo con 24 GB o incluso menos, y el autor publica una tabla de precisión frente a BF16 (KL divergence y top-1) que permite evaluar la pérdida introducida por la cuantización. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (según tabla de hardware del autor) |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Base, un transformer denso de la familia Qwen3 descrita en el informe técnico arXiv:2505.09388. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo *base*, lo habitual es que no incluya ajuste por preferencias, pero este dato no se confirma en la ficha.

La contribución de este repositorio es exclusivamente la conversión y cuantización: los pesos originales en safetensors se transforman a GGUF y se cuantizan a Q4_K_M con llama.cpp (build cd959bae). El autor documenta la pérdida de precisión frente a BF16 medida con llama.cpp: para Q4_K_M, KL de 0,040775 en WikiText-2 y 0,036195 en un conjunto held-out, con top-1 del 90,588 % y 90,882 % respectivamente. Para comparar, Q8_0 alcanza top-1 del 97,863 % y Q3_K_M cae al 81,848 %, lo que sitúa a Q4_K_M en un punto intermedio razonable de la curva tamaño/precisión.

## Capacidades

- Generación de texto por continuación de *prompt* (modelo base, sin plantilla de instrucciones).
- Razonamiento y conocimiento general heredados del entrenamiento de Qwen3-4B-Base.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos del repositorio.
- No incluye *tool calling* ni *function calling* de serie: al ser un modelo base, no hay ajuste para seguir formatos de herramientas.
- No incluye modo *thinking* ni capacidades de agente multi-paso entrenadas; requeriría *fine-tuning* o *prompting* específico.
- No soporta visión ni audio.
- Adecuado como punto de partida para *fine-tuning* supervisado sobre tareas concretas.

## Casos de uso

- *Fine-tuning* supervisado sobre dominio propio: al ser un modelo base de 4B con licencia Apache 2.0, se puede adaptar con SFT a tareas de clasificación, extracción o generación en un dominio vertical sin coste de licencia.
- Generación de texto en local con llama.cpp: el archivo Q4_K_M de 2,5 GB cabe en GPU de consumo y permite continuar texto en *pipelines* offline o en entornos sin conexión.
- Prototipado rápido de aplicaciones de texto: la baja huella de memoria (2,5 GB de pesos) permite iterar en un portátil con GPU modesta antes de escalar a un modelo mayor.
- *Data augmentation* y generación de corpus sintéticos: la continuación de texto controlada por *prompt* sirve para producir variaciones de texto a partir de semillas.
- Evaluación de cuantizaciones: el repositorio incluye métricas de KL y top-1 frente a BF16, útil para comparar el impacto de Q4_K_M en tareas de lenguaje antes de adoptar el formato en producción.
- Base para experimentos de investigación: modelo pequeño, licencia permisiva y pesos en GGUF facilitan reproducir experimentos de *scaling* o de *prompting* sin infraestructura grande.
- Despliegue en *edge* o dispositivos con memoria unificada: la tabla del autor cubre desde RTX 4090 hasta Mac Studio y DGX Spark, lo que permite ejecutarlo en estaciones de trabajo y equipos compactos.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí publica métricas de fidelidad de la cuantización frente a BF16 medidas con llama.cpp:

| Cuantización | Tamaño | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 4,280 GB | 0,001474 | 97,863 % | 0,001120 | 97,941 % |
| Q6_K | 3,306 GB | 0,005868 | 95,662 % | 0,004784 | 96,206 % |
| Q5_K_M | 2,890 GB | 0,011391 | 94,338 % | 0,011788 | 94,451 % |
| Q4_K_M | 2,497 GB | 0,040775 | 90,588 % | 0,036195 | 90,882 % |
| Q3_K_M | 2,076 GB | 0,146550 | 81,848 % | 0,144953 | 82,245 % |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,5 GB de pesos en Q4_K_M; el autor calcula que el archivo cabe cuando su tamaño más la caché KV en f16 a esa longitud de contexto más 2 GB de runtime queda por debajo del 90 % de la memoria disponible.
- GPU recomendadas: RTX 4090 y RTX 3090 (24 GB) con contexto de 32K; RTX 5090 (32 GB); RTX 6000 Ada o 2 x 24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); H200 (141 GB); B200 (192 GB); B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con 24 GB a 32K de contexto; también en equipos con memoria unificada como Mac Studio M5 Max/Ultra y DGX Spark (128 GB).
- Opciones de despliegue: llama.cpp (build cd959bae o posterior), con el binario `llama-completion`; al ser GGUF, también es compatible con el ecosistema llama.cpp en general (Ollama, servidores compatibles con la API de llama.cpp). No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Xylolabs/Qwen3-4B-Base-GGUF (este) | 4,02B | 32K | GGUF Q4_K_M | Apache 2.0 | Hugging Face, 430 descargas |
| Qwen/Qwen3-4B-Base | 4,02B | 32K | safetensors (BF16) | Apache 2.0 | Hugging Face (modelo original) |
| Cuantizaciones oficiales de llama.cpp de Qwen3-4B-Base | 4,02B | 32K | GGUF (Q3_K_M a Q8_0) | Apache 2.0 | Hugging Face / llama.cpp |

La comparación principal es contra el modelo original en BF16 (mayor precisión, mayor huella de memoria) y contra las cuantizaciones de referencia de llama.cpp, cuyos valores de KL y top-1 se incluyen en la tabla de precisión del autor. No se dispone de comparación con otros modelos de 4B en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo *base*: no sigue instrucciones ni mantiene formato conversacional sin *fine-tuning* o *prompting* específico; el uso directo en un chat producirá continuaciones, no respuestas.
- Riesgo de alucinación y de generar contenido sesgado o incorrecto inherente a un modelo de lenguaje sin ajuste por preferencias.
- Idiomas declarados: inglés y coreano; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La cuantización Q4_K_M introduce pérdida medible: top-1 del 90,6 % en WikiText-2 frente a BF16, con KL de 0,040775; para tareas sensibles a la precisión conviene valorar Q5_K_M o Q6_K (no publicados en este repositorio).
- Solo se publica un archivo (Q4_K_M); no hay variantes Q8_0, Q6_K ni Q5_K_M en este repositorio, aunque el autor las usa como referencia en su tabla.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre los pesos convertidos; conviene citar el informe técnico original de Qwen3.
- El repositorio tiene 0 *likes* y 430 descargas, por lo que la validación comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Base-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B-Base
- Informe técnico Qwen3: https://arxiv.org/abs/2505.09388
- Build de llama.cpp usado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de la herramienta de conversión del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
