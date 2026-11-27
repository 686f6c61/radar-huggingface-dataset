# Xylolabs/Llama-3.1-8B-Instruct-GGUF

## Resumen

Llama-3.1-8B-Instruct-GGUF es una redistribución en formato GGUF del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs. Se trata de una cuantización pensada para su uso con llama.cpp sobre CUDA, Metal o CPU, con tres variantes de pesos: Q5_K_M (5,733 GB), Q4_K_M (4,921 GB) e IQ4_XS-imat (4,448 GB). El modelo base es un transformer decoder-only de 8.030.261.312 parámetros desarrollado por Meta, ajustado con instrucciones y con una ventana de contexto nativa de 128.000 tokens.

El problema que resuelve esta publicación es el de ofrecer pesos cuantizados listos para ejecutar en hardware de consumo, con un estudio de precisión comparativo frente a BF16 que incluye la divergencia KL sobre WikiText-2 y la tasa de acuerdo top-1. El autor compara sus tres ficheros con cuantizaciones de llama.cpp y de Unsloth, lo que permite elegir el compromiso entre tamaño y fidelidad con datos medidos y no estimados.

Es relevante porque permite desplegar un modelo de 8B con contexto largo en una única GPU de 24 GB o incluso en CPU, manteniendo una calidad cercana al original en las cuantizaciones de 5 y 4 bits. La ficha se centra en el artefacto GGUF distribuido por Xylolabs; las capacidades descritas corresponden al modelo base de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (nativa del modelo base); el ejemplo de la model card usa `-c 8192` |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, IQ4_XS-imat |
| Idiomas soportados | en, ko (declarados en la model card) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.312 parámetros y atención con RoPE escalada para soportar 128.000 tokens de contexto. El ajuste de instrucciones y el entrenamiento original corresponden a Meta; esta publicación no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La referencia técnica del modelo base es el paper arXiv:2407.21783.

La aportación de Xylolabs es exclusivamente la cuantización. Emplea el formato GGUF de llama.cpp, verificado con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`, e incluye una variante IQ4_XS con calibración mediante imatrix. La model card publica métricas de fidelidad frente a BF16 (divergencia KL sobre WikiText-2 y acuerdo top-1), lo que permite cuantificar la pérdida de calidad de cada fichero. No se documentan innovaciones de decodificación especulativa ni cambios en la arquitectura.

## Capacidades

- Generación de texto conversacional y ajuste a instrucciones, heredado de Llama-3.1-8B-Instruct.
- Razonamiento de propósito general y resolución de problemas de complejidad media.
- Generación de código y tareas de matemáticas básicas e intermedias (capacidades del modelo base).
- Soporte de tool calling y function calling según el formato de plantilla de Llama 3.1 (el ejemplo de la model card usa `--jinja`).
- Conversaciones multi-turno con contexto largo, hasta 128.000 tokens en el modelo base.
- Capacidades multilingües limitadas: la model card declara únicamente inglés (en) y coreano (ko).
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional autoalojado: desplegado con `llama-server` en una RTX 4090 con el fichero Q5_K_M, permite gestionar diálogos multi-turno con contexto amplio sin depender de APIs externas.
- Procesamiento de documentos largos en local: con la ventana de 128.000 tokens del modelo base, se pueden resumir o extraer información de contratos, informes o expedientes en una sola pasada, usando Q4_K_M si la memoria es ajustada.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse en CPU o GPU local, el código fuente no sale de la infraestructura del equipo; encaja en tareas de autocompletado y revisión dentro de pipelines internos.
- Prototipado rápido en portátiles: la variante IQ4_XS-imat (4,448 GB) cabe en GPU de consumo con 8 GB o en memoria unificada de Apple Silicon, lo que permite validar flujos de agentes antes de escalar a hardware mayor.
- Atención al cliente en despliegues edge: el tamaño reducido de Q4_K_M permite ejecutar el modelo en servidores modestos o dispositivos con memoria unificada, gestionando conversaciones con contexto de varias interacciones.
- Extracción de información estructurada: con soporte de tool calling y plantilla Jinja, se puede integrar en flujos que conviertan texto libre en JSON validado mediante llamadas a funciones.
- Evaluación comparativa de cuantizaciones: los datos de KL y top-1 de la model card permiten seleccionar el fichero adecuado para un presupuesto de memoria concreto antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de fidelidad de cuantización frente a BF16 sobre WikiText-2 y un conjunto held-out:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| Unsloth UD-Q8_K_XL | 10,576 GB | 0,000343 | 99,103 % | 0,000368 | 99,010 % |
| llama.cpp Q8_0 | 8,541 GB | 0,000677 | 98,593 % | 0,000884 | 98,392 % |
| Unsloth UD-Q6_K_XL | 7,330 GB | 0,001657 | 98,142 % | 0,001810 | 97,912 % |
| llama.cpp Q6_K | 6,596 GB | 0,003599 | 97,054 % | 0,004545 | 96,392 % |
| Q5_K_M (Xylolabs) | 5,733 GB | 0,007551 | 95,980 % | 0,009984 | 94,912 % |
| Unsloth Q5_K_M | 5,733 GB | 0,006783 | 96,289 % | 0,008459 | 95,235 % |
| Q4_K_M (Xylolabs) | 4,921 GB | 0,023577 | 92,931 % | 0,029800 | 91,529 % |
| Unsloth Q4_K_M | 4,921 GB | 0,020621 | 93,431 % | 0,026132 | 92,186 % |
| IQ4_XS-imat (Xylolabs) | 4,448 GB | 0,026609 | 92,353 % | 0,034046 | 90,961 % |
| Unsloth IQ4_XS | 4,464 GB | 0,026396 | 92,397 % | 0,035175 | 90,618 % |
| Unsloth Q3_K_M | 4,019 GB | 0,065071 | 88,123 % | 0,087778 | 85,716 % |
| Unsloth Q2_K | 3,179 GB | 0,292532 | 75,779 % | 0,447675 | 70,716 % |

En Q5_K_M y Q4_K_M, las variantes de Unsloth obtienen una divergencia KL ligeramente inferior a las de Xylolabs con el mismo tamaño; en IQ4_XS, la versión con imatrix de Xylolabs mejora el held-out KL (0,034046 frente a 0,035175) y el top-1 held-out (90,961 % frente a 90,618 %) respecto a la de Unsloth.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5 GB para IQ4_XS-imat, 4,9 GB para Q4_K_M y 5,7 GB para Q5_K_M, solo para los pesos; hay que sumar la memoria de la caché KV, que crece con el contexto.
- GPU recomendadas según la model card: RTX 4090 o RTX 3090 (24 GB) con Q5_K_M y contexto de 64K; RTX 5090 (32 GB), RTX 6000 Ada, H100 (80 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB) con contexto de 128K.
- Cabe en GPU de consumo: sí, con 8 GB o más para IQ4_XS-imat o Q4_K_M; con 24 GB se puede usar Q5_K_M y contexto largo.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y M5 Ultra (256 GB y 512 GB) aparecen en la tabla del autor con Q5_K_M y contexto de 128K.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), compilado con `-DGGML_CUDA=ON` para NVIDIA; la model card solo verifica ese backend, aunque el formato GGUF es compatible con otros runners de llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Xylolabs Llama-3.1-8B-Instruct-GGUF | 8,03B | 128K (modelo base) | GGUF (Q5_K_M, Q4_K_M, IQ4_XS-imat) | llama3.1 | Tres cuantizaciones con métricas KL publicadas |
| Unsloth Llama-3.1-8B-Instruct (dynamic quants) | 8,03B | 128K (modelo base) | GGUF (UD-Q8_K_XL hasta UD-IQ2_XXS) | llama3.1 | Mayor catálogo de cuantizaciones; KL inferior en Q5_K_M y Q4_K_M |
| llama.cpp Q8_0 / Q6_K / Q3_K_M | 8,03B | 128K (modelo base) | GGUF | llama3.1 | Cuantizaciones de referencia del propio llama.cpp |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | safetensors (BF16) | llama3.1 | Modelo original sin cuantizar; referencia de calidad |

## Limitaciones y advertencias

- La model card declara solo inglés y coreano; el rendimiento en castellano no está documentado y puede degradarse respecto al inglés.
- Riesgo de alucinación inherente a un modelo de 8B: no debe usarse como fuente de verdad sin verificación externa.
- Las cuantizaciones de 4 bits pierden fidelidad de forma medible: Q4_K_M cae a 92,931 % de acuerdo top-1 en WikiText-2 frente a 99,103 % de UD-Q8_K_XL; IQ4_XS-imat queda en 92,353 %.
- Por debajo de 4 bits la degradación es severa: Q2_K baja a 75,779 % de top-1 en WikiText-2, por lo que no es recomendable para producción.
- La licencia llama3.1 impone condiciones de uso comercial, política de uso aceptable y obligaciones de atribución; hay que revisar el texto completo antes de desplegar en producto.
- El contexto efectivo depende de la memoria disponible para la caché KV; el ejemplo de la model card usa `-c 8192`, no los 128K nativos.
- La verificación del autor se limita al commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` de llama.cpp; otras versiones pueden comportarse de forma distinta.
- El repositorio tiene 0 likes y 1273 descargas, y las fechas de creación y actualización son posteriores a la ventana habitual de publicación de Llama 3.1; conviene validar la integridad de los ficheros antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-GGUF/blob/main/LICENSE
- Paper de Llama 3: https://arxiv.org/abs/2407.21783
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit verificado de llama.cpp: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
