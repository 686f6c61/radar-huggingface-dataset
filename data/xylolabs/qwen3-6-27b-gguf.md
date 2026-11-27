# Xylolabs/Qwen3.6-27B-GGUF

## Resumen

Xylolabs/Qwen3.6-27B-GGUF es una distribucion en formato GGUF del modelo de texto Qwen/Qwen3.6-27B, publicada por Xylolabs para su uso con llama.cpp. El repositorio incluye tres cuantizaciones del modelo (Q8_0, Q6_K y Q4_K_M) y dos proyectores de vision opcionales (mmproj en F16 y Q8_0), lo que permite habilitar entrada de imagenes en las cuantizaciones Q8_0 y Q6_K. El modelo base cuenta con 27.320.697.856 parametros (unos 27,3 mil millones) y esta publicado bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de ~27B en hardware de consumo y de centro de datos, con tablas de precision frente a BF16 (divergencia KL y acuerdo top-1) y recomendaciones explicitas de fichero segun memoria disponible. El repositorio ocupa 69,8 GB e incluye tanto las cuantizaciones propias como referencias comparativas a las de Unsloth y a las generadas por llama.cpp.

No se dispone de informacion sobre la longitud de contexto nativa del modelo base, la composicion del dataset de entrenamiento ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion proporcionada; la model card solo documenta precision de cuantizacion y compatibilidad de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.6-27B; el repo solo distribuye pesos GGUF) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como dato nativo; la model card menciona ventanas de 32K, 128K y 256K segun memoria disponible en la tabla de hardware |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (proyectores de vision en F16 y Q8_0) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo para el conteo de parametros del modelo base) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base Qwen/Qwen3.6-27B (tipo de transformer, atencion, posibles componentes MoE o hibridos), ni el volumen o composicion de los datos de entrenamiento, ni si se aplicaron fases de RLHF o DPO. El repositorio de Xylolabs es exclusivamente una conversion a GGUF y cuantizacion de los pesos originales, sin entrenamiento adicional.

La innovacion tecnica documentada por el autor es la evaluacion de precision de las cuantizaciones frente a BF16, con metricas de divergencia KL sobre WikiText-2 y sobre un conjunto held-out, ademas del acuerdo top-1. Los resultados muestran, por ejemplo, que Q8_0 (29,047 GB) alcanza un KL de 0,003514 y un top-1 del 98,667% en WikiText-2, mientras que Q4_K_M (16,811 GB) baja a un KL de 0,035809 y un top-1 del 93,412%. El repo incluye tambien proyectores de vision separados (mmproj) que se cargan con `--mmproj` en llama.cpp para entrada de imagenes con las cuantizaciones Q8_0 o Q6_K.

## Capacidades

- Generacion de texto conversacional en ingles y coreano (idiomas declarados en la model card).
- Entrada de vision opcional mediante los proyectores mmproj F16 (0,928 GB) o Q8_0 (0,629 GB), utilizables con las cuantizaciones Q8_0 y Q6_K.
- Compatibilidad con el flag `--jinja` de llama.cpp, lo que habilita el uso de plantillas de chat Jinja para formateo de conversaciones.
- Soporte de modo razonamiento controlable mediante `--reasoning off` en llama-cli, segun el ejemplo de ejecucion incluido.
- Inferencia local con llama.cpp en CPU, GPU y memoria unificada (Apple Silicon, DGX Spark).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso ni audio.

## Casos de uso

- Asistente conversacional local en ingles o coreano: el modelo puede desplegarse con llama-cli o llama-server en una RTX 4090 usando Q4_K_M (16,8 GB) con 32K de contexto, adecuado para prototipos y uso personal sin dependencia de la nube.
- Procesamiento de documentos con imagenes: combinando Q6_K o Q8_0 con el proyector mmproj, se pueden pasar capturas, diagramas o paginas escaneadas al modelo para descripcion o extraccion de informacion, todo en local.
- Despliegue en estaciones de trabajo con memoria unificada: en un Mac Studio M5 Max o DGX Spark (128 GB), el fichero Q8_0 permite operar con hasta 256K de contexto segun la tabla del autor, util para analisis de repositorios o transcripciones largas.
- Servicio de inferencia en un solo H100 o H200: con Q8_0 y 80-141 GB de VRAM se puede servir el modelo con contexto extendido para equipos que necesitan privacidad de datos y no quieren recurrir a APIs externas.
- Generacion de texto en pipelines por lotes: al ser GGUF y compatible con llama.cpp, se integra en scripts de procesamiento masivo (resumenes, clasificacion, reescritura) en CPU o GPU sin necesidad de frameworks adicionales.
- Evaluacion y comparacion de cuantizaciones: las tablas de KL y top-1 del repositorio permiten elegir el fichero con el mejor compromiso tamano/precision para un hardware concreto, algo util en laboratorios que miden degradacion por cuantizacion.
- Traduccion y asistencia bilingue ingles-coreano: los dos idiomas declarados cubren casos de soporte y localizacion en ese par linguistico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | KL WikiText-2 | Top-1 WikiText-2 | KL held-out | Top-1 held-out |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 29,047 GB | 0,003514 | 98,667% | 0,000964 | 98,784% |
| Q6_K | 22,431 GB | 0,005024 | 97,873% | 0,002893 | 97,833% |
| Q4_K_M | 16,811 GB | 0,035809 | 93,412% | 0,032999 | 93,588% |

Como referencia, la model card incluye tambien cuantizaciones de Unsloth y de llama.cpp en la misma tabla; por ejemplo, Unsloth UD-Q8_K_XL (35,325 GB) obtiene KL 0,003332 y top-1 98,279% en WikiText-2, y Unsloth Q4_K_M (16,817 GB) obtiene KL 0,018637 y top-1 94,922%.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere unos 16,8 GB de pesos; Q6_K unos 22,4 GB; Q8_0 unos 29,0 GB. A esto hay que sumar la memoria para KV cache segun contexto.
- GPU recomendadas segun la model card: RTX 4090 o RTX 3090 (24 GB) con Q4_K_M y 32K de contexto; RTX 5090 (32 GB) con Q6_K y 32K; RTX 6000 Ada o 2 x 24 GB (48 GB) con Q8_0 y 128K; H100 (80 GB) con Q8_0 y 256K.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M y en RTX 5090 con Q6_K. En configuraciones de memoria unificada como Mac Studio M5 Max/Ultra y DGX Spark (128-512 GB) se recomienda Q8_0 con hasta 256K de contexto.
- Opciones de despliegue: llama.cpp (build concreto enlazado en el repo, commit cd959bae99ff4bed22bef2604f45241c09bbb8c8), con llama-cli y presumiblemente llama-server; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI a traves de llama.cpp. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de benchmarks del modelo base que permitan una comparacion justa con alternativas de la misma categoria. La unica comparacion documentada es entre cuantizaciones del mismo modelo:

| Alternativa | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Xylolabs Qwen3.6-27B-GGUF (Q8_0) | 27,3B | hasta 256K segun hardware | Apache 2.0 | Hugging Face, GGUF |
| Unsloth UD-Q8_K_XL (mismo modelo base) | 27,3B | no disponible | Apache 2.0 | Hugging Face |
| llama.cpp Q6_K (mismo modelo base) | 27,3B | no disponible | Apache 2.0 | Hugging Face |

Comparativa con modelos de otros autores: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y coreano; el rendimiento en castellano no esta documentado y podria ser inferior.
- Precision degradada en cuantizaciones bajas: Q4_K_M pierde aproximadamente 5 puntos de acuerdo top-1 frente a BF16 en WikiText-2 (93,412% frente a ~98,7% de Q8_0), lo que puede afectar a tareas sensibles.
- Vision limitada a Q8_0 y Q6_K: la model card indica que para imagenes hay que usar estas cuantizaciones con el proyector mmproj; Q4_K_M no se menciona para vision.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas ni tasas de error.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0, permisiva para uso comercial, pero se recomienda revisar el aviso de licencia del modelo base Qwen/Qwen3.6-27B.
- El repositorio no incluye resultados de benchmarks de tareas (razonamiento, codigo, matematicas), por lo que la idoneidad para produccion en esas areas no puede verificarse con los datos aportados.
- La tabla de contexto por hardware es una recomendacion del autor; el contexto maximo nativo del modelo base no se especifica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Build de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia en el repo: https://huggingface.co/Xylolabs/Qwen3.6-27B-GGUF/blob/main/LICENSE
- Repositorio de Xylolabs (herramientas): https://github.com/XylolabsInc/tensix-bfp-gptq
