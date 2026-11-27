# Xylolabs/Qwen3-8B-GGUF

## Resumen

Xylolabs/Qwen3-8B-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo Qwen/Qwen3-8B, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. No se trata de un modelo nuevo, sino de una conversion y cuantizacion del checkpoint original de Qwen, con el objetivo de facilitar el despliegue en hardware de consumo y estaciones de trabajo sin GPU de datacenter. El modelo base cuenta con 8.190.735.360 parametros totales y una licencia Apache 2.0 heredada del original.

La relevancia de esta publicacion reside en la tabla de precision comparativa que acompaña a los ficheros: el autor mide la divergencia KL y la coincidencia top-1 frente a BF16 para sus propias cuantizaciones y para las de Unsloth y llama.cpp, lo que permite elegir el fichero con un compromiso controlado entre tamano y fidelidad. El repositorio incluye tres variantes (Q5_K_M, IQ4_XS e IQ4_XS-imat) con tamanos de 5,851 GB, 4,593 GB y 4,562 GB respectivamente.

La model card esta orientada a la ejecucion practica: indica el commit exacto de llama.cpp verificado, los flags recomendados y una tabla de asignacion de fichero segun memoria disponible, desde una RTX 4090 de 24 GB hasta una B300 de 288 GB. El contexto indicado en esa tabla es de 32K tokens para todos los perfiles de hardware listados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3-8B; la model card de la cuantizacion no detalla la arquitectura) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32K (segun la tabla de asignacion por hardware de la model card) |
| Tipos de cuantizacion | Q5_K_M, IQ4_XS, IQ4_XS-imat (imatrix) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: es una conversion a GGUF y cuantizacion de Qwen/Qwen3-8B, tal como declara el campo `base_model_relation: quantized`. La model card remite al repositorio original de Qwen3-8B para el informe tecnico y la citacion, por lo que los detalles de arquitectura, composicion del dataset de entrenamiento, numero de tokens y fases de alineacion (RLHF/DPO) no se recogen en la informacion disponible de esta ficha.

La innovacion tecnica aportada por Xylolabs es la evaluacion de fidelidad de las cuantizaciones. Se comparan las variantes propias con las de Unsloth y las nativas de llama.cpp midiendo divergencia KL y coincidencia top-1 frente a BF16 sobre WikiText-2 y sobre un conjunto held-out. La variante IQ4_XS-imat emplea una matriz de importancia (imatrix) para guiar la cuantizacion, y obtiene 0,035033 de KL en WikiText-2 y 92,353 % de top-1, frente a 0,051816 y 90,618 % de la IQ4_XS sin imatrix, con un tamano ligeramente inferior (4,562 GB frente a 4,593 GB).

## Capacidades

- Generacion de texto conversacional y de proposito general, segun el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3-8B, aunque la model card de la cuantizacion no las detalla ni las evalua de forma especifica.
- Soporte multilingue limitado a ingles y coreano segun los metadatos del repositorio (en, ko).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que permite servirlo mediante infraestructura compatible.
- Ejecucion con llama.cpp en CUDA, Metal y CPU, incluyendo `llama-cli` y `llama-server` con el flag `--jinja` para plantillas de chat.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling explicito ni modo de razonamiento extendido (thinking mode) para esta distribucion concreta.

## Casos de uso

- Despliegue local en estacion de trabajo con RTX 4090 o RTX 3090: con 24 GB de VRAM se puede cargar `Qwen3-8B-Q5_K_M.gguf` (5,9 GB) y operar con 32K de contexto, dejando margen para el resto del sistema y para el cache KV.
- Servicio de inferencia en CPU o Apple Silicon: las variantes IQ4_XS de 4,6 GB permiten ejecutar el modelo en equipos sin GPU dedicada mediante llama.cpp, con `-ngl` ajustado al hardware disponible.
- Asistente conversacional de contexto largo: la ventana de 32K tokens indicada en la tabla de hardware permite mantener conversaciones multi-turno con historial extenso o procesar documentos de entrada de decenas de miles de tokens.
- Prototipado y evaluacion de pipelines: el formato GGUF y la compatibilidad con `llama-server` facilitan levantar un endpoint HTTP local para pruebas de integracion antes de migrar a un despliegue mayor.
- Entornos con memoria unificada (DGX Spark, Mac Studio M5 Max/Ultra): la model card lista explicitamente estos equipos con 128 GB o mas, lo que permite cargar el fichero Q5_K_M con contexto completo sin fragmentar el modelo.
- Seleccion guiada por fidelidad: la tabla de precision permite elegir la cuantizacion segun el presupuesto de error aceptable; por ejemplo, IQ4_XS-imat ofrece 92,353 % de top-1 con 4,562 GB, mientras que Q5_K_M sube a 94,941 % con 5,851 GB.
- Uso en coreano e ingles: el modelo declara soporte para ambos idiomas, adecuado para aplicaciones bilingues en esos dos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente proporciona metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| Unsloth UD-Q8_K_XL | 10,824 GB | 0,000681 | 98,956 % | 0,000712 | 99,029 % |
| Unsloth / llama.cpp Q8_0 | 8,710 GB | 0,001479 | 98,289 % | 0,001268 | 98,422 % |
| Unsloth UD-Q6_K_XL | 7,491 GB | 0,002700 | 97,667 % | 0,002557 | 97,892 % |
| Unsloth Q5_K_M | 5,851 GB | 0,009306 | 95,902 % | 0,007977 | 96,500 % |
| Q5_K_M (Xylolabs) | 5,851 GB | 0,014643 | 94,941 % | 0,012691 | 95,471 % |
| Unsloth Q4_K_M | 5,028 GB | 0,025806 | 93,500 % | 0,022993 | 93,627 % |
| Unsloth IQ4_XS | 4,581 GB | 0,034084 | 92,426 % | 0,033473 | 92,569 % |
| IQ4_XS (Xylolabs) | 4,593 GB | 0,051816 | 90,618 % | 0,048253 | 91,157 % |
| IQ4_XS-imat (Xylolabs) | 4,562 GB | 0,035033 | 92,353 % | 0,032134 | 92,863 % |
| Unsloth UD-IQ2_XXS | 2,605 GB | 0,642090 | 68,446 % | 0,737738 | 66,333 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB para IQ4_XS e IQ4_XS-imat y 5,9 GB para Q5_K_M, sin contar el cache KV, que crece con la longitud de contexto.
- GPU recomendadas segun la model card: RTX 4090 y RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o dos GPU de 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256 GB y 512 GB unificada) y B300 (288 GB).
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas de VRAM libre para la variante Q5_K_M, y en torno a 5 GB para las variantes IQ4_XS.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) con el commit verificado `cd959bae99ff4bed22bef2604f45241c09bbb8c8`; compilacion con `-DGGML_CUDA=ON` para NVIDIA. La model card no menciona otros runners como Ollama, vLLM o TGI para estos ficheros.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-GGUF | 8,19 B | 32K | GGUF | apache-2.0 | Tres cuantizaciones; tabla de fidelidad frente a BF16 |
| Unsloth Qwen3-8B GGUF | 8,19 B (base) | no disponible | GGUF | apache-2.0 (heredada) | Dynamic quants (UD-Q8_K_XL, UD-Q4_K_XL, etc.) con mejor KL que las de Xylolabs a igual tamano |
| llama.cpp Qwen3-8B GGUF | 8,19 B (base) | no disponible | GGUF | apache-2.0 (heredada) | Cuantizaciones estandar (Q8_0, Q6_K, Q4_K_M, Q3_K_M) |
| Qwen/Qwen3-8B (original) | 8,19 B | no disponible en esta ficha | safetensors | apache-2.0 | Checkpoint BF16 de referencia |

## Limitaciones y advertencias

- Alucinacion: no se documentan evaluaciones de fiabilidad factual en la informacion disponible; como modelo generativo de 8B, presenta riesgo de alucinacion en dominios especializados.
- Sesgos: no se publican analisis de sesgo en la model card de esta cuantizacion.
- Idiomas: los metadatos solo declaran ingles y coreano; el rendimiento en castellano no esta verificado ni declarado.
- Fidelidad de cuantizacion: las variantes de Xylolabs muestran mayor divergencia KL que las equivalentes de Unsloth a igual tamano (por ejemplo, Q5_K_M: 0,014643 frente a 0,009306 en WikiText-2), lo que conviene tener en cuenta si se prioriza maxima fidelidad.
- Contexto: la model card fija 32K en su tabla de hardware, por debajo de la ventana nativa del modelo base segun la documentacion de Qwen; no se detalla el impacto en calidad al operar con contextos muy largos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre los pesos convertidos; conviene revisar el fichero LICENSE incluido en el repositorio.
- Compatibilidad: la ejecucion esta verificada con un commit concreto de llama.cpp; versiones distintas pueden requerir ajustes de plantilla o de flags (`--jinja`).
- Repositorio con 0 likes y actualizacion reciente (25 de noviembre de 2026): la tabla de precision se amplio en esa fecha con los ficheros de Unsloth y llama.cpp, por lo que las cifras comparativas pueden cambiar en futuras revisiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia incluida en el repo: https://huggingface.co/Xylolabs/Qwen3-8B-GGUF/blob/main/LICENSE
- llama.cpp (commit verificado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs referenciado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- Grafica de KL media por tamano: https://huggingface.co/Xylolabs/Qwen3-8B-GGUF/resolve/main/accuracy-mean-kl.png
- Grafica de coincidencia top-1 por tamano: https://huggingface.co/Xylolabs/Qwen3-8B-GGUF/resolve/main/accuracy-top1.png
