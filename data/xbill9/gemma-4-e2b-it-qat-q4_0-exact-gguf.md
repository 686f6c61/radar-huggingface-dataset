# xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf

## Resumen

Este repositorio contiene una reconstruccion no oficial en GGUF del modelo Gemma 4 E2B-it con entrenamiento consciente de cuantizacion (QAT) de Google, publicada por el usuario `xbill9`. El objetivo es doble: reducir el tamano del archivo respecto al GGUF oficial y acercar los pesos cuantizados a los pesos QAT sin cuantizar. El resultado es un unico fichero de 2.640.154.592 bytes (2,64 GB) frente a los 3.349.516.256 bytes (3,35 GB) del GGUF oficial de Google, con una divergencia KL media de 0,001753 frente a 0,054303.

El modelo base declarado es `google/gemma-4-E2B-it-qat-q4_0-unquantized`, con 4.628.569.635 parametros totales. De ellos, 2.750 millones corresponden a las dos tablas de embeddings (`token_embd` y `per_layer_token_embd`), lo que es coherente con la nomenclatura "E2B" de la familia Gemma 4 (parametros efectivos en torno a 2.000 millones). Se distribuye exclusivamente en formato GGUF, con licencia declarada apache-2.0 y enlace a la licencia especifica de Gemma 4 de Google.

La relevancia de esta build es que aplica al GGUF la rejilla de 4 bits que la propia QAT impuso durante el entrenamiento: en lugar de usar el paso estandar de llama.cpp (magnitud maxima del bloque dividida por 8), recupera el paso entrenado de cada bloque. Ademas almacena las tablas de embeddings en Q4_0 en vez de Q6_K, lo que explica la mayor parte del ahorro de 0,66 GiB. Es un modelo solo texto, pensado para inferencia en CPU con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 4 con embeddings por capa (per_layer_token_embd); no se especifica mas detalle en la informacion disponible |
| Parametros totales | 4.628.569.635 (pesos safetensors del modelo base sin cuantizar) |
| Longitud de contexto | no disponible en la informacion proporcionada; la configuracion de prueba documentada usa 4.096 tokens (`-c 4096`) |
| Tipos de cuantizacion | Q4_0 (QAT) para las 275 matrices de capa y ambas tablas de embeddings; F16 para normas, vectores de escala y `per_layer_model_proj` |
| Idiomas soportados | no disponible; las mediciones de divergencia y perplejidad se hicieron sobre texto en ingles (Wikipedia) |
| Licencia | apache-2.0 declarada, con enlace a la licencia de Gemma 4 de Google (`https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo | 2.640.154.592 bytes (2,64 GB) |
| SHA-256 del fichero | 25f21f14a99d313fb3d017e3350ad7be11b1b17dd3ba591c333c23c09762a390 |
| Revision del modelo base | `6befbac` |
| Revision del GGUF de metadatos | `675cff4` |

## Arquitectura y entrenamiento

Se trata de un transformer de la familia Gemma 4 en su variante E2B, instruction-tuned, que en su version original es multimodal (texto e imagen, con audio en los modelos pequenos) segun la documentacion de Google DeepMind. Sin embargo, esta build contiene unicamente el modelo de lenguaje: las torres de vision y audio viven en el fichero aparte `gemma-4-E2B-it-mmproj.gguf` de Google, que no se incluye. El modelo incorpora dos tablas de embeddings (`token_embd` y `per_layer_token_embd`), caracteristica de la arquitectura con embeddings por capa.

No hubo reentrenamiento: los pesos se reconstruyeron a partir del checkpoint QAT sin cuantizar. El autor copia los metadatos byte a byte del GGUF oficial de Google (tokenizer, plantilla de chat, hiperparametros y orden de tensores) y reconstruye las 275 matrices de capa y las dos tablas de embeddings en Q4_0. La innovacion tecnica esta en el calculo del paso de bloque: la QAT entreno los pesos en una rejilla de 4 bits (bloques de 32 valores, escala de bloque multiplicada por un entero de -8 a 7), y la cuantizacion estandar de llama.cpp asume que el valor de mayor magnitud del bloque ocupa el nivel 8, lo que desplaza hasta un nivel completo los bloques cuyo maximo real esta en el nivel 6 o 7. Esta build recupera el paso entrenado de cada bloque (magnitud maxima dividida por 8, 7, ... 1, el que coloque todos los valores en niveles enteros, refinado por minimos cuadrados) y lo guarda como escala de bloque fp16. El script de reconstruccion aborta si algun bloque no cae en la rejilla de 4 bits; 96,8% de los valores reconstruidos son identicos bit a bit al origen tras el redondeo a bf16.

El analisis de la rejilla QAT del checkpoint fuente revela ademas que las matrices de atencion y feed-forward de la torre de audio se entrenaron a 2 bits (niveles -2 a 1), mientras que la torre de vision esta a precision completa. No se documentan en la informacion disponible los datos de entrenamiento originales (numero de tokens, composicion del dataset, si hubo RLHF o DPO): corresponden al modelo base de Google.

## Capacidades

- Generacion de texto conversacional en un unico turno, con plantilla de chat copiada del GGUF oficial de Google.
- Modo de razonamiento (thinking): `llama-server` lo activa por defecto y la respuesta se coloca en `reasoning_content`.
- Respuesta directa desactivando el modo thinking mediante `"chat_template_kwargs": {"enable_thinking": false}`, con resultados identicos a los del GGUF de Google y a la referencia bf16 en cinco prompts greedy.
- Capacidades multimodales del modelo base (vision y, en modelos pequenos, audio) no disponibles en este repositorio, al no incluirse el fichero `mmproj`.
- Soporte multilingue: no confirmado en la informacion disponible para esta build; las pruebas de calidad se limitan a texto en ingles.
- Tool calling y function calling: no documentado en la informacion proporcionada para esta build, aunque otras compilaciones de Gemma 4 E2B (por ejemplo, la de Qualcomm AI Hub) lo mencionan explicitamente.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para esta build.
- Inferencia en CPU: validada con exito en procesador x86 con AVX2 y 8 hilos.

## Casos de uso

- Despliegue en CPU sin GPU: con 2,64 GB de pesos y 14,83 tok/s de generacion en un portatil, es viable ejecutar asistentes de texto en maquinas sin acelerador. El ahorro de 0,66 GiB frente al GGUF oficial reduce presion de memoria y trafico de lectura de la capa de salida.
- Prototipado local en estaciones de trabajo de desarrollo: permite probar tecnicas de QAT e inspeccionar la fidelidad de una cuantizacion concreta comparando contra la referencia bf16 con `llama-perplexity`, algo util para equipos que investigan cuantizacion.
- Servicio de chat interno de baja concurrencia: `llama-server` con `--jinja` y `-c 4096` ofrece una API compatible con OpenAI para asistentes de texto en entornos con recursos limitados.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye `evidence/build_report.json`, `evidence/qat_grid.py` y `evidence/qat_lattice.py`, que permiten verificar si un checkpoint safetensors sigue la rejilla QAT. Util como banco de pruebas para investigadores.
- Extraccion y analisis de texto sobre corpus en ingles: dado que las metricas de divergencia se midieron sobre Wikipedia en ingles, el comportamiento esta mejor caracterizado en ese idioma que en otros.
- Generacion de texto con trazabilidad de calidad: gracias a que la divergencia media respecto a bf16 es de 0,001753 y el 98,06% de los tokens top coinciden, es adecuado como sustituto de la referencia bf16 cuando el presupuesto de memoria no permite precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos publicados son metricas de fidelidad de cuantizacion y de velocidad, medidas con `llama-perplexity` sobre wikitext-2 test (16 fragmentos de 512 tokens), contra un GGUF bf16 de los mismos pesos QAT y con metadatos identicos.

| Metrica | Google Q4_0 GGUF | Este GGUF |
|---|---|---|
| Tamano de fichero | 3.349.516.256 B | 2.640.154.592 B |
| Tablas de embeddings | Q6_K | Q4_0 |
| Divergencia KL media vs bf16 | 0,054303 ± 0,001385 | 0,001753 ± 0,000075 |
| Divergencia KL percentil 99 | 0,427642 | 0,016390 |
| Mismo token top que bf16 | 87,18 ± 0,52 % | 98,06 ± 0,22 % |
| Perplejidad relativa vs bf16 | 1,0892 ± 0,0095 | 1,0213 ± 0,0051 |
| Procesamiento de prompt, 512 tokens (CPU) | 75,02 ± 2,02 tok/s | 75,64 ± 4,44 tok/s |
| Generacion, 128 tokens (CPU) | 13,80 ± 0,44 tok/s | 14,83 ± 0,39 tok/s |

Error de reconstruccion por tensor (muestreo de 512 filas por tensor, contra los pesos QAT en bf16):

| Tensor | Error maximo de Google | Error maximo de esta build | RMS error / RMS peso (Google) | RMS error / RMS peso (esta build) |
|---|---|---|---|---|
| `blk.0.attn_q` | 1,000 paso | 0,039 paso | 4,98e-2 | 1,39e-3 |
| `blk.20.ffn_down` | 1,000 paso | 0,040 paso | 5,12e-2 | 1,38e-3 |
| `token_embd` | 0,282 paso | 0,039 paso | 1,38e-2 | 1,36e-3 |
| `per_layer_token_embd` | 0,180 paso | 0,040 paso | 1,36e-2 | 1,38e-3 |

## Requisitos de hardware

- VRAM de pesos: aproximadamente 2,5 GiB para el fichero de 2,64 GB. La cache KV y los buffers de llama.cpp anaden overhead; para 4.096 tokens de contexto, un presupuesto practico de 3,5 a 4 GB de memoria es razonable, aunque no hay medicion publicada de VRAM (estimacion).
- CPU: probado en un procesador de portatil con AVX2 y 8 hilos, con 75,64 tok/s de procesamiento de prompt y 14,83 tok/s de generacion (llama.cpp build `fc07d781e`, 11243).
- GPU: no se probo ningun backend de GPU en esta build. Por tamano de pesos, cabe en cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo RTX 3050, GTX 1650 4 GB, RTX 4060, RTX 4090); se trata de una estimacion por tamano, no de un resultado medido.
- Despliegue probado: `llama-server` de llama.cpp, en la imagen Docker `ghcr.io/ggml-org/llama.cpp:full`, con `llama-server -m gemma-4-E2B-it-q4_0-exact.gguf -t 8 -c 4096 --jinja`.
- Otros runtimes (Ollama, LM Studio, vLLM, TGI, backend CUDA de llama.cpp): compatibles a priori por ser GGUF Q4_0, pero no testeados por el autor.
- Latencia y throughput: solo se dispone de los numeros de CPU anteriores; no hay datos de GPU publicados.
- Reconstruccion del fichero: requiere solo `numpy` y unos 4 minutos en un portatil.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Divergencia KL media vs bf16 | Licencia | Notas |
|---|---|---|---|---|---|
| `xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf` | 4,63 B | GGUF Q4_0, 2,64 GB | 0,001753 | apache-2.0 declarada + licencia Gemma 4 | Solo texto, embeddings en Q4_0, inferencia CPU validada |
| `google/gemma-4-E2B-it-qat-q4_0-gguf` | 4,63 B | GGUF Q4_0, 3,35 GB | 0,054303 | licencia Gemma 4 | Build oficial; embeddings en Q6_K |
| `google/gemma-4-E2B-it-qat-q4_0-unquantized` | 4,63 B | safetensors bf16 (referencia) | 0 (referencia) | licencia Gemma 4 | Punto de partida de esta reconstruccion |
| `qualcomm-ai-hub-community/Gemma-4-E2B-it-Hi-Fi-fraQtl` | familia E2B | GGUF Q4_K_M con `imatrix` | no disponible | apache-2.0 | Orientado a edge (iPhone, on-device), con tool calling documentado |

Contexto de otras alternativas de la familia: LM Studio distribuye `google/gemma-4-e2b-qat` para uso local eficiente, y el modelo base Gemma 4 E2B aparece catalogado en Qualcomm AI Hub como modelo multimodal ligero de Google DeepMind. No se dispone de datos de benchmarks comparativos de rendimiento de tarea entre estas variantes.

## Limitaciones y advertencias

- Solo texto. No incluye las torres de vision ni de audio, que residen en el fichero `mmproj` separado de Google. Cualquier caso de uso multimodal queda fuera del alcance de este repositorio.
- Build no oficial, hecha y publicada al margen de Google. Los problemas deben reportarse al autor del repositorio, no a Google.
- Solo se probo en una CPU con llama.cpp. No hay validacion de backends de GPU ni de otros runtimes (Ollama, LM Studio, vLLM, TGI).
- Las cifras de divergencia y perplejidad cubren 8.192 tokens de texto de Wikipedia en ingles. No caracterizan el comportamiento en otros idiomas ni en dominios como codigo o matematicas.
- La licencia declarada es apache-2.0, pero el campo `license_link` apunta a la licencia de Gemma 4 de Google. Conviene verificar los terminos aplicables antes de un uso comercial, ya que el modelo base esta sujeto a las condiciones de Google.
- El modo thinking esta activado por defecto en `llama-server`: la respuesta se coloca en `reasoning_content` y un `max_tokens` corto puede dejar `content` vacio. Es necesario enviar `"chat_template_kwargs": {"enable_thinking": false}` para obtener respuesta directa.
- Riesgo de alucinacion: no evaluado en la informacion disponible para esta build; aplican los riesgos generales del modelo base Gemma 4 E2B-it.
- Sesgos: no documentados en la informacion proporcionada para esta build.
- Idiomas soportados: no declarados. El tag del repositorio incluye `text-only` y `conversational`, pero no una lista de idiomas.
- Madurez: repositorio creado el 2026-09-29 con 0 descargas y 0 likes en el momento de la consulta. Sin validacion de la comunidad.
- El fichero se genera de forma determinista y el script aborta si algun bloque no cae en la rejilla de 4 bits, pero la verificacion automatica no sustituye a una evaluacion funcional del modelo.
- Procedencia dudosa del contenido: parte de la model card original aparece truncada en la informacion disponible, por lo que puede haber secciones no incluidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf
- Modelo base sin cuantizar: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- GGUF oficial de Google: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 E2B-it en Qualcomm AI Hub: https://aihub.qualcomm.com/models/gemma_4_e2b_it
- Variante de Qualcomm AI Hub en HuggingFace: https://huggingface.co/qualcomm-ai-hub-community/Gemma-4-E2B-it-Hi-Fi-fraQtl
- Ficha de Gemma 4 E2B QAT en LM Studio: https://lmstudio.ai/models/google/gemma-4-e2b-qat
- Ficha de Gemma 4 E2B-it QAT en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-e2b-it-qat.html
