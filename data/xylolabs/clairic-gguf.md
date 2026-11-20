# Xylolabs/clairic-GGUF

## Resumen

Clairic GGUF es la distribucion cuantizada en formato GGUF del modelo Cloudflare/clairic, un modelo multimodal de 27B de parametros disenado especificamente para extraccion estructurada de informacion a partir de texto e imagenes. Lo desarrolla Xylolabs (la cuantizacion) sobre el modelo base de Cloudflare, que a su vez es un fine-tune de Qwen/Qwen3.8-27B. El modelo resuelve el problema de convertir un estado (texto o imagen) y un esquema de campos tipados en respuestas estructuradas, con soporte nativo de salida guiada por JSON Schema.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 27B con capacidad multimodal y contexto de 262.144 tokens en llama.cpp sobre CUDA, Metal o CPU, sin necesidad de infraestructura propietaria. La arquitectura combina capas de atencion lineal Gated DeltaNet con capas de atencion completa, lo que reduce el coste computacional en contextos largos. El repositorio incluye nueve niveles de cuantizacion (desde Q8_0 hasta Q2_K), el proyector de vision en BF16 y la matriz de importancia empleada para generar los cuants.

Cabe senalar que estos archivos contienen unicamente el modelo de lenguaje y el codificador de vision; la cabeza de extraccion tipada de Cloudflare (`clair_head.safetensors`) y su runtime en Python no estan incluidos y requieren los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con 48 capas de atencion lineal Gated DeltaNet y 16 capas de atencion completa (64 capas totales) |
| Parametros totales | 26.895.998.464 (26,90B en el modelo de lenguaje) + 0,46B en el codificador de vision |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q2_K |
| Idiomas soportados | no disponibles (la matriz de importancia se construyo con datos en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision `mmproj-clairic-BF16.gguf` en BF16 |

Otros datos tecnicos: 24 cabezas de consulta y 4 cabezas KV de dimension 256, hidden size 5.120, vocabulario de 248.320 tokens, tamano del repositorio 156,3 GB.

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que alterna 48 capas de atencion lineal Gated DeltaNet con 16 capas de atencion completa, una eleccion que reduce el coste de atencion en secuencias largas manteniendo capacidad de recuperacion exacta en las capas full-attention. El checkpoint original de Cloudflare incluye un bloque de prediccion multi-token (MTP) que la conversion a GGUF omite (`--no-mtp`), coherente con la configuracion del modelo base que lo desactiva. El codificador de vision se convierte por separado como proyector multimodal en BF16.

La cuantizacion se realizo con `llama-quantize` y una matriz de importancia generada con `llama-imatrix` sobre 300 fragmentos de 4.096 tokens, compuestos por databricks-dolly-15k (ingles), KoAlpaca-v1.1a (coreano), python_code_instructions_18k_alpaca (codigo), gsm8k (matematicas), MasterControlAIML/JSON-Unstructured-Structured (JSON guiado por esquema) y paraloq/json_data_extraction (prompts de extraccion de campos). Cada matriz de pesos recibe la mezcla propia de llama.cpp para su tipo; la proyeccion beta/alpha de Gated DeltaNet se mantiene en F16 y las normas, `ssm_a`, `ssm_dt` y los kernels conv1d en F32. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Extraccion estructurada de informacion: convierte un estado y un esquema de campos tipados en respuestas estructuradas.
- Salida guiada por JSON Schema: llama.cpp transforma el esquema en una gramatica, garantizando JSON valido conforme al `response_format` o `--json-schema`.
- Entrada multimodal de texto e imagen mediante el proyector de vision `mmproj-clairic-BF16.gguf`.
- Procesamiento de documentos e imagenes para extraccion de campos (pipeline `image-text-to-text`).
- Modo thinking desactivable: el runtime de Cloudflare opera con `enable_thinking` en false, y la plantilla de chat lo permite configurar.
- Capacidades multilingues: no disponibles de forma explicita; la matriz de importancia incluye ingles y coreano.
- Soporte de conversacion multi-turno mediante la plantilla de chat incluida en cada archivo GGUF.
- No se documenta soporte de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Extraccion de campos de facturas y albaranes: se envia la imagen del documento junto con un JSON Schema de los campos esperados (importe, fecha, CIF, lineas de detalle) y el modelo devuelve JSON valido mediante la gramatica generada por llama.cpp.
- Procesamiento de formularios escaneados en papel: el codificador de vision permite pasar la imagen directamente y obtener los campos tipados sin OCR intermedio, con contexto de 262.144 tokens para lotes de documentos en una misma sesion.
- Enriquecimiento de tickets de soporte: a partir del texto libre de un ticket y un esquema de categorias, prioridad y producto, el modelo genera la estructura para ingesta en bases de datos o sistemas de ticketing.
- Extraccion de datos de curriculos: se define un esquema con formacion, experiencia y habilidades y el modelo devuelve el JSON normalizado, ejecutable en local sobre CPU o GPU de consumo con Q4_K_M.
- Normalizacion de datos cientificos o financieros: dado un esquema de campos y un estado en texto, el modelo produce registros consistentes para pipelines ETL, con la garantia de JSON valido que ofrece la gramatica.
- Despliegue en entornos con requisitos de soberania del dato: al ejecutarse con llama.cpp en hardware propio (CUDA, Metal o CPU), permite procesar documentos sensibles sin enviarlos a APIs externas.
- Prototipado rapido de pipelines de extraccion: el conjunto de cuantizaciones desde Q2_K (11,10 GB) hasta Q8_0 (28,62 GB) permite ajustar el equilibrio entre calidad y memoria segun el hardware disponible.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Si se publican metricas de calidad de cuantizacion frente a la referencia f32 (perplejidad, divergencia KL y coincidencia top-1 sobre 24.564 tokens de evaluacion):

| Cuant | Tamano | PPL | KL media vs f32 | Top-1 vs f32 |
|---|---|---|---|---|
| Q8_0 | 28,62 GB | 10,6799 | 0,0100 | 98,25 % |
| Q6_K | 22,11 GB | 10,6967 | 0,0161 | 97,35 % |
| Q5_K_M | 19,36 GB | 10,5752 | 0,0237 | 95,97 % |
| Q4_K_M | 16,78 GB | 10,9329 | 0,0518 | 93,93 % |
| Q4_K_S | 15,63 GB | 10,7987 | 0,0566 | 93,55 % |
| IQ4_XS | 15,35 GB | 10,6431 | 0,0611 | 92,42 % |
| Q3_K_M | 13,55 GB | 11,8992 | 0,1333 | 89,36 % |
| IQ3_M | 12,82 GB | 11,1300 | 0,1393 | 88,59 % |
| Q2_K | 11,10 GB | 11,6782 | 0,2348 | 84,86 % |

La referencia f32 (pesos BF16 de Cloudflare en transformers con computo f32) obtiene PPL 10,5470. La evaluacion usa 12 fragmentos de 4.096 tokens puntuando los ultimos 2.047 de cada uno: 9 de chat en ingles, coreano, codigo, matematicas, extraccion JSON guiada por esquema y prompts propios de Clairic, y 3 de wikitext-2.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,1 GB para Q2_K, 16,8 GB para Q4_K_M, 22,1 GB para Q6_K y 28,6 GB para Q8_0, a los que se suma el proyector de vision en BF16.
- GPU recomendadas: A100 o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 o RTX 4080 para Q3_K_M e inferiores.
- Cabe en GPU de consumo: si, desde Q2_K (11,1 GB) hasta Q5_K_M (19,4 GB) en tarjetas de 16-24 GB; Q6_K y Q8_0 requieren 24 GB o mas.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`), con soporte CUDA, Metal y CPU. El modelo base es compatible con endpoints, pero la informacion disponible no detalla integraciones con vLLM o TGI para estos archivos GGUF.
- Ejemplo de arranque: `llama-server -m clairic-Q4_K_M.gguf --mmproj mmproj-clairic-BF16.gguf --jinja -ngl 99 -c 32768 --chat-template-kwargs '{"enable_thinking":false}'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Clairic GGUF (Xylolabs) | 26,90B + 0,46B vision | 262.144 | Texto e imagen | Apache-2.0 | Si (9 cuants) |
| Cloudflare/clairic (base) | 26,90B + 0,46B vision | 262.144 | Texto e imagen | Apache-2.0 | No (safetensors) |
| Qwen/Qwen3.8-27B (base del fine-tune) | 27B (aproximado) | no disponible | Texto | no disponible | no disponible |

La informacion disponible no incluye datos de rendimiento comparativo con otros modelos de extraccion estructurada, por lo que la comparativa se limita a parametros, contexto, modalidad y licencia.

## Limitaciones y advertencias

- La cabeza de extraccion tipada (`clair_head.safetensors`) y el runtime Python de Cloudflare no estan incluidos; sin ellos, la funcionalidad de extraccion estructurada depende de la salida guiada por JSON Schema de llama.cpp, no del mecanismo nativo del modelo.
- El bloque de prediccion multi-token (MTP) se omite en la conversion, por lo que no se dispone de decodificacion especulativa en estos archivos.
- La cuantizacion introduce degradacion medible: Q2_K baja al 84,86 % de coincidencia top-1 y Q3_K_M al 89,36 %; para produccion se recomienda Q4_K_M o superior.
- El modelo debe ejecutarse con thinking desactivado, tal como hace el runtime de Cloudflare; no se documenta el comportamiento con thinking activo.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en campos no presentes en el estado de entrada; la gramatica garantiza JSON valido pero no veracidad de los valores.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas: no se declara una lista oficial; la matriz de importancia cubre ingles y coreano, por lo que el rendimiento en otros idiomas no esta validado.
- Licencia Apache-2.0 permite uso comercial, pero Xylolabs no esta afiliado ni respaldado por Cloudflare; el aviso `NOTICE` identifica el modelo fuente y sus titulares de derechos.
- El repositorio ocupa 156,3 GB, lo que exige espacio de almacenamiento considerable si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/clairic-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Modelo Qwen base del fine-tune: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo de llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/clairic-GGUF/blob/main/LICENSE
