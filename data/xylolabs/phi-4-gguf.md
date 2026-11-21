# Xylolabs/phi-4-GGUF

## Resumen

phi-4-GGUF es una colección de cuantizaciones en formato GGUF del modelo microsoft/phi-4, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base phi-4 es un transformer denso de 14.659.507.200 parámetros desarrollado por Microsoft, orientado a generación de texto y razonamiento, con especial énfasis en matemáticas y código. Esta versión no introduce cambios arquitectónicos: es una conversión de pesos y una cuantización del modelo original, e incluye la plantilla de chat y el tokenizador originales en cada fichero.

La relevancia de este repositorio es práctica: permite ejecutar un modelo de casi 15.000 millones de parámetros en hardware de consumo mediante cuantizaciones de 4 y 5 bits, con métricas de degradación publicadas frente a BF16 (KL medio y porcentaje de coincidencia en top-1). El autor ofrece cuatro variantes (Q5_K_M, Q4_K_M, IQ4_XS e IQ4_XS con importance matrix) y documenta explícitamente el commit de llama.cpp necesario para su uso.

La licencia declarada es MIT, heredada del modelo base, y los idiomas indicados en la model card son inglés y coreano. El repositorio tiene 36,0 GB y registra 865 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base microsoft/phi-4); esta publicación es una cuantización GGUF |
| Parametros totales | 14.659.507.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantizacion | Q5_K_M (10,50 GB), Q4_K_M (9,06 GB), IQ4_XS (8,26 GB), IQ4_XS-imat (8,19 GB) |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (un fichero por cuantización, con tokenizador y plantilla de chat incluidos) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 14.660 millones de parámetros. Esta publicación no entrena ni modifica la arquitectura: convierte los pesos de microsoft/phi-4 a GGUF y los cuantiza con llama.cpp en el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior. Cada fichero contiene el modelo completo, el tokenizador original y la plantilla de chat, de modo que puede ejecutarse con `--jinja` sin artefactos adicionales.

La model card no documenta la composición del dataset de entrenamiento, el número de tokens, ni las fases de alineación (RLHF/DPO) del modelo original; esa información corresponde a la ficha de microsoft/phi-4. La innovación técnica destacable de esta publicación es la evaluación de la cuantización: se publican el KL medio y el porcentaje de coincidencia en top-1 frente a una pasada de referencia en BF16 con transformers, calculados sobre 16.280 posiciones de texto en inglés y coreano. La variante IQ4_XS-imat incorpora una importance matrix que mejora ligeramente el KL (0,0197 frente a 0,0206) y el top-1 (93,03 % frente a 92,62 %) respecto a IQ4_XS sin imatrix, con un tamaño ligeramente menor.

## Capacidades

- Generación de texto conversacional y de un solo turno, con plantilla de chat incluida en el fichero GGUF.
- Razonamiento y matemáticas, capacidades heredadas del modelo base phi-4 (no verificadas con benchmarks en esta publicación).
- Generación de código, también heredada del modelo base; la model card no aporta evaluaciones propias.
- Soporte multilingüe limitado a inglés y coreano según los metadatos declarados.
- Inferencia en CPU, CUDA y Metal mediante llama.cpp.
- Compatible con `llama-cli` y `llama-server`, lo que permite exponer el modelo como servidor HTTP.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente conversacional local: con Q4_K_M (9,06 GB) el modelo cabe en GPUs de consumo de 12 GB o más y permite desplegar un chat privado sin conexión a servicios externos, usando `llama-server` con la plantilla Jinja incluida.
- Razonamiento matemático y resolución de problemas paso a paso: phi-4 está orientado a tareas de matemáticas y razonamiento; la variante Q5_K_M conserva el 95,96 % de coincidencia top-1 frente a BF16, lo que la hace adecuada cuando la fidelidad importa más que el tamaño.
- Generación y revisión de código en entornos con GPU limitada: al ejecutarse en llama.cpp sobre CUDA o Metal, puede integrarse en scripts de desarrollo locales o en un servidor interno sin depender de APIs externas.
- Procesamiento de documentos en inglés y coreano: los idiomas declarados y la evaluación de cuantización sobre texto en ambos idiomas respaldan su uso en tareas de resumen o extracción sobre corpus bilingües en, ko.
- Despliegue en CPU para entornos sin GPU: las cuantizaciones IQ4_XS (8,19-8,26 GB) permiten inferencia en servidores sin acelerador, con throughput menor que en GPU pero sin requisitos de VRAM.
- Prototipado e investigación de cuantización: las métricas KL y top-1 publicadas por variante permiten comparar el impacto de la cuantización con importance matrix frente a la cuantización estándar en un caso real.
- Evaluación comparativa de modelos de ~15B: sirve como referencia para medir calidad frente a BF16 en pipelines de investigación que necesitan un modelo denso de tamaño medio ejecutable en hardware asequible.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí publica métricas de fidelidad de la cuantización frente a BF16, calculadas sobre 16.280 posiciones de texto en inglés y coreano:

| Cuantizacion | Tamano | KL medio vs BF16 | Coincidencia top-1 vs BF16 |
|---|---|---|---|
| Q5_K_M | 10,50 GB | 0,0055 | 95,96 % |
| Q4_K_M | 9,06 GB | 0,0180 | 93,65 % |
| IQ4_XS | 8,26 GB | 0,0206 | 92,62 % |
| IQ4_XS-imat | 8,19 GB | 0,0197 | 93,03 % |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más el contexto y el overhead de llama.cpp. Orientativamente, Q5_K_M requiere ~10,5 GB de VRAM o más, Q4_K_M ~9,1 GB, e IQ4_XS / IQ4_XS-imat ~8,2 GB.
- GPU recomendadas: H100, A100 o RTX 4090 (24 GB) para las variantes de mayor calidad con contexto amplio; RTX 4080/4070 Ti (12-16 GB) para Q4_K_M o IQ4_XS.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más con Q4_K_M o IQ4_XS; Q5_K_M requiere 12-16 GB según la longitud de contexto.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) en el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior, con compilación CUDA (`-DGGML_CUDA=ON`) o Metal. La model card no menciona otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/phi-4-GGUF | 14.659.507.200 | No disponible | GGUF (Q5_K_M, Q4_K_M, IQ4_XS, IQ4_XS-imat) | MIT | Hugging Face, 865 descargas |
| microsoft/phi-4 | 14.659.507.200 | No disponible en la información proporcionada | Safetensors (modelo original) | MIT | Hugging Face |
| Otras cuantizaciones GGUF de phi-4 | 14.659.507.200 | No disponible | GGUF | MIT (heredada) | No verificado en la información disponible |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento de esta cuantización con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; deben consultarse en la ficha de microsoft/phi-4.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas en esta publicación.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está verificado ni soportado oficialmente.
- La cuantización introduce degradación medible: incluso Q5_K_M pierde un 4,04 % de coincidencia top-1 frente a BF16, y Q4_K_M un 6,35 %. Para tareas sensibles a la fidelidad, considerar variantes de mayor precisión.
- La licencia MIT se hereda del modelo base, pero Xylolabs declara no estar afiliada ni respaldada por los autores originales; el fichero `NOTICE` identifica el modelo fuente y su titular de derechos.
- Requiere un commit concreto de llama.cpp (`cd959bae99ff4bed22bef2604f45241c09bbb8c8`) o posterior; versiones anteriores pueden no cargar correctamente los ficheros.
- El contexto máximo no se especifica en la model card; el ejemplo usa `-c 8192`, por lo que no debe asumirse una ventana mayor sin verificarlo con el modelo base.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse en producción sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/phi-4-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-4
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/phi-4-GGUF/blob/main/LICENSE
