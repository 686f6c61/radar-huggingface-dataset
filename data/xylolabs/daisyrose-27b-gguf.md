# Xylolabs/DaisyRose-27B-GGUF

## Resumen

DaisyRose-27B-GGUF es la version cuantizada en formato GGUF del modelo RadixArk/DaisyRose-27B, un fine-tune de Qwen3.8-27B con capacidad de entrada imagen-texto. La publica Xylolabs, un tercero que no es el autor original del modelo base, y su funcion es permitir la ejecucion del modelo en llama.cpp sobre CUDA, Metal o CPU, incluyendo el proyector de vision necesario para el procesamiento de imagenes.

El modelo cuenta con 27.320.697.856 parametros totales (27,3 mil millones) y esta disenado para tareas conversacionales multimodales. Segun la model card del cuantizador, el modelo "piensa" por defecto, es decir, activa un modo de razonamiento interno que puede desactivarse mediante un parametro de la plantilla de chat. Los idiomas declarados son ingles y coreano.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 27B con vision en hardware de consumo, mediante cuantizaciones que van desde Q2_K (11,2 GB) hasta Q8_0 (29 GB), con datos de divergencia KL y acuerdo top-1 frente a BF16 publicados por el autor del cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecucion de la model card; no se confirma como maximo oficial) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, Q2_K (mas imatrix y proyectores de vision F16 y Q8_0) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base RadixArk/DaisyRose-27B en la informacion proporcionada. La model card del cuantizador indica que se trata de un fine-tune de Qwen3.8-27B, lo que situa la familia arquitectonica en la linea Qwen, pero no se confirman detalles como tipo de atencion, uso de MoE o composicion del dataset de entrenamiento. Tampoco se documentan procesos de RLHF, DPO ni el numero de tokens de entrenamiento.

La innovacion tecnica documentada en esta publicacion es el proceso de cuantizacion: se incluye un fichero imatrix (0,023 GB) que sugiere el uso de quantizacion con matriz de importancia, y se publican metricas de fidelidad frente a BF16 (divergencia KL media y acuerdo top-1) para cada nivel de cuantizacion, comparando con cuantizaciones de terceros como bartowski, RadixArk y angt. El modelo incorpora un proyector de vision (mmproj) en dos variantes, F16 y Q8_0, necesario para la entrada de imagenes.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada de imagenes (pipeline image-text-to-text) mediante el proyector de vision mmproj.
- Modo de razonamiento ("thinking") activado por defecto, desactivable con `enable_thinking: false` en la plantilla de chat.
- Soporte de plantilla de chat compatible con llama.cpp (`--jinja`).
- Capacidades multilingues limitadas a ingles y coreano segun los metadatos.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Descripcion y analisis de imagenes en local: usando `llama-mtmd-cli` con el fichero mmproj, se pueden procesar fotografias y generar descripciones o responder preguntas sobre su contenido sin conexion a servicios externos.
- Asistente conversacional multimodal en estaciones de trabajo: con la cuantizacion Q4_K_M (16,65 GB) cabe en GPUs de consumo de gama alta y permite conversaciones multi-turno con contexto de hasta 32K tokens.
- Procesamiento por lotes de documentos con imagenes: el modelo puede extraer informacion de capturas, diagramas o formularios escaneados en pipelines automatizados ejecutados sobre CPU o GPU.
- Despliegue en servidores con llama-server: la compatibilidad con endpoints permite exponer el modelo como API interna para aplicaciones que requieran entrada de imagen y texto.
- Prototipado de aplicaciones de vision-lenguaje en hardware limitado: la variante IQ3_M (12,97 GB) o Q2_K (11,22 GB) permite experimentar en GPUs con 12-16 GB de VRAM, aceptando la perdida de fidelidad documentada.
- Traduccion y asistencia bilingue ingles-coreano: el modelo declara soporte para ambos idiomas, adecuado para tareas de traduccion o atencion en esos mercados.
- Razonamiento con modo thinking para tareas que requieran pasos intermedios: activando el modo por defecto, el modelo genera cadenas de razonamiento antes de la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card publica unicamente metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | KL WikiText-2 | top-1 | KL Chat | top-1 |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 29,05 GB | 0,000878 | 98,64% | 0,002308 | 98,66% |
| Q6_K | 22,43 GB | 0,002243 | 97,81% | 0,004416 | 98,25% |
| Q5_K_M | 19,64 GB | 0,004663 | 96,89% | 0,008288 | 97,57% |
| Q4_K_M | 16,65 GB | 0,010676 | 95,28% | 0,017864 | 95,64% |
| IQ4_XS | 15,54 GB | 0,017650 | 94,11% | 0,023140 | 95,07% |
| IQ3_M | 12,97 GB | 0,061471 | 89,44% | 0,071393 | 91,83% |
| Q2_K | 11,22 GB | 0,145947 | 83,52% | 0,147133 | 87,59% |

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 11,2 GB (Q2_K) hasta 29 GB (Q8_0) solo para los pesos; hay que sumar el proyector de vision (0,629 GB en Q8_0 o 0,928 GB en F16) y la cache KV para el contexto.
- GPU recomendadas: A100 o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q6_K o Q5_K_M; RTX 4080/4070 Ti (16 GB) para Q4_K_M o IQ4_XS.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas para Q4_K_M e inferiores; Q2_K e IQ3_M pueden caber en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp (llama-server, llama-mtmd-cli) con release b12531 o posterior; compilacion con `-DGGML_CUDA=ON` para NVIDIA, con soporte para Metal y CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-GGUF (Xylolabs) | 27,3B | 32.768 (uso documentado) | Si (mmproj) | Apache-2.0 | GGUF en HF |
| RadixArk/DaisyRose-27B | no disponible | no disponible | Si | Apache-2.0 | Modelo base en HF |
| Cuantizaciones bartowski de DaisyRose-27B | 27,3B | no disponible | Si | Apache-2.0 | GGUF en HF |
| Cuantizaciones RadixArk de DaisyRose-27B | 27,3B | no disponible | Si | Apache-2.0 | GGUF en HF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de otras familias del mismo tamano.

## Limitaciones y advertencias

- Solo se declaran los idiomas ingles y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- Las cuantizaciones bajas (Q2_K, IQ3_M) muestran una perdida significativa de fidelidad: Q2_K baja a 83,52% de acuerdo top-1 en WikiText-2 y 87,59% en chat, lo que puede degradar tareas sensibles.
- El modo thinking activo por defecto incrementa la latencia y el consumo de tokens; debe desactivarse explicitamente cuando no se necesite.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de sesgo o factualidad en la informacion disponible.
- La model card no documenta el dataset de entrenamiento del modelo base, lo que limita la evaluacion de sesgos conocidos.
- La licencia Apache-2.0 permite uso comercial, pero el cuantizador indica que el texto de la licencia es el de RadixArk sin cambios; conviene revisar el fichero NOTICE y la licencia del modelo base.
- El modelo base es un fine-tune de Qwen3.8-27B; cualquier restriccion adicional del modelo original deberia verificarse en su repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/DaisyRose-27B-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Licencia: https://huggingface.co/Xylolabs/DaisyRose-27B-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio del cuantizador (Xylolabs): https://github.com/XylolabsInc/tensix-bfp-gptq
