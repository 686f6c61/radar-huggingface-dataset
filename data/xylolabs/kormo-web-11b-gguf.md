# Xylolabs/KORMo-Web-11B-GGUF

## Resumen
KORMo-Web-11B-GGUF es la distribucion cuantizada en formato GGUF del modelo vision-lenguaje KORMo-Web-11B, desarrollado originalmente por KORMo-VL y empaquetado por Xylolabs para su ejecucion en llama.cpp sobre CUDA, Metal o CPU. El modelo esta especializado en tareas de agente web y GUI: interpretar capturas de pantalla de interfaces, describir paginas y asistir en flujos de automatizacion de navegador. Con 10.756.624.384 parametros (aproximadamente 10,76 mil millones) y una pipeline image-text-to-text, cubre el nicho de agentes visuales que necesitan comprender la interfaz grafica ademas del texto.

La relevancia de esta publicacion radica en que traslada un modelo multimodal de 11B al ecosistema GGUF con ocho niveles de cuantizacion (desde Q8_0 de 11,44 GB hasta IQ3_M de 4,98 GB) y con metricas de divergencia KL y top-1 frente a BF16 publicadas por el autor, lo que permite elegir el compromiso tamano-calidad con datos objetivos. Incluye ademas proyectores de vision separados (F16 y Q8_0) y un imatrix para las cuantizaciones de tipo IQ.

El modelo base esta entrenado para razonar por defecto (thinking mode) y admite desactivar ese comportamiento mediante parametros de plantilla de chat. Su licencia Apache 2.0 y su soporte de contexto de hasta 128K tokens segun la tabla de hardware del autor lo hacen adecuado para despliegues en produccion con requisitos de privacidad, al poder ejecutarse en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje); proyector de vision compatible con llava-onevision |
| Parametros totales | 10.756.624.384 (~10,76B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 128K tokens (segun tabla de hardware del autor); 32K en 24 GB, 64K en 32 GB |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M (texto); proyectores F16 y Q8_0 |
| Idiomas soportados | coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), mas parche `llava-onevision.patch` para el proyector de vision |

## Arquitectura y entrenamiento
El modelo base KORMo-Web-11B es un transformer multimodal de tipo vision-lenguaje orientado a la comprension de interfaces web y de escritorio. La distribucion GGUF separa el modelo de texto (en un unico archivo que incluye tokenizer y plantilla de chat) del proyector de vision, que se entrega como archivo `mmproj` independiente en F16 (871,52 MB) o Q8_0 (592,85 MB). El proyector sigue la arquitectura llava-onevision, lo que exige aplicar el parche `llava-onevision.patch` sobre el commit `e4b620af19f02960dea7a3a81de7c5805aa3a333` de llama.cpp para que la parte visual funcione; el modelo de texto, en cambio, se ejecuta con llama.cpp estandar.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es el proceso de cuantizacion: Xylolabs genero un imatrix (`KORMo-Web-11B.imatrix.gguf`, 13,23 MB) para las cuantizaciones IQ y publico metricas de divergencia KL y precision top-1 frente a BF16 sobre tres conjuntos (WikiText-2, Chat y held-out), lo que documenta la perdida de calidad de cada nivel. El modelo conserva el modo de razonamiento (thinking) activado por defecto, desactivable con `--chat-template-kwargs '{"enable_thinking":false}'`.

## Capacidades
- Generacion de texto y razonamiento conversacional multi-turno con plantilla de chat integrada.
- Comprension de imagenes (image-text-to-text): descripcion de paginas web, capturas de pantalla e interfaces graficas.
- Agente web y GUI: interpretacion de elementos de interfaz para tareas de automatizacion de navegador.
- Modo de razonamiento (thinking) activado por defecto y desactivable por parametro.
- Capacidades multilingues limitadas a coreano e ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: orientado a flujos de agente web, aunque el detalle de orquestacion no se especifica.
- Capacidades de audio o vision avanzada mas alla de imagen: no disponible.

## Casos de uso
- Automatizacion de navegador: el modelo interpreta capturas de la pagina y describe o razona sobre los elementos visibles, lo que permite construir agentes que deciden la siguiente accion sobre la GUI con contexto de hasta 32K-128K tokens.
- Testing de interfaces web: dado un screenshot, el modelo puede describir el estado de la pagina y detectar discrepancias visuales en pipelines de QA, ejecutandose en local con llama.cpp.
- Asistencia a usuarios en coreano e ingles: conversaciones multi-turno sobre contenido de paginas web o documentos visuales, con la ventaja de poder desplegarse en hardware de consumo.
- Extraccion de informacion de capturas: transcripcion y descripcion estructurada de paginas para alimentar sistemas de scraping o RAG que necesitan entender el layout, no solo el HTML.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp (CUDA, Metal o CPU), permite procesar capturas de pantalla sensibles sin enviarlas a servicios externos.
- Prototipado de agentes GUI en estaciones de trabajo: con la cuantizacion Q4_K_M (6,56 GB) cabe en GPUs de consumo de 8-12 GB y permite iterar rapidamente sobre el comportamiento del agente.
- Investigacion en agentes multimodales: las metricas KL y top-1 publicadas por cuantizacion permiten estudiar el impacto de la compresion en tareas de comprension visual.
- Generacion de descripciones accesibles: a partir de una imagen de una pagina, el modelo puede producir texto alternativo o resumenes para lectores de pantalla en ingles o coreano.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica metricas de fidelidad de la cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 11,44 GB | 0,001357 | 98,30% | 0,004699 | 98,40% | 0,000973 | 98,52% |
| Q6_K | 8,83 GB | 0,002771 | 97,58% | 0,006418 | 97,77% | 0,002077 | 97,82% |
| Q5_K_M | 7,66 GB | 0,006964 | 95,99% | 0,010319 | 96,52% | 0,004865 | 96,88% |
| Q4_K_M | 6,56 GB | 0,016915 | 94,06% | 0,028158 | 94,45% | 0,013323 | 94,48% |
| Q4_K_S | 6,23 GB | 0,022264 | 93,11% | 0,034518 | 93,80% | 0,017122 | 93,84% |
| IQ4_XS | 5,90 GB | 0,027927 | 92,33% | 0,042670 | 92,99% | 0,021583 | 92,86% |
| Q3_K_M | 5,31 GB | 0,051346 | 89,69% | 0,070909 | 90,91% | 0,038036 | 90,66% |
| IQ3_M | 4,98 GB | 0,085897 | 87,25% | 0,127902 | 87,67% | 0,067227 | 88,11% |

## Requisitos de hardware
- VRAM estimada para inferencia: desde 4,98 GB (IQ3_M) hasta 11,44 GB (Q8_0) para los pesos de texto; el proyector de vision anade 592,85 MB (Q8_0) o 871,52 MB (F16). La KV cache en f16 condiciona el contexto maximo.
- GPU recomendadas segun el autor: RTX 4090 / RTX 3090 (24 GB) para Q8_0 con 32K de contexto; RTX 5090 (32 GB) para Q8_0 con 64K; RTX 6000 Ada o 2 x 24 GB (48 GB) para Q8_0 con 128K; H100 (80 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB) para Q8_0 con 128K.
- Cabe en GPU de consumo: si. Q4_K_M (6,56 GB) e IQ4_XS (5,90 GB) son adecuados para GPUs de 8-12 GB; IQ3_M (4,98 GB) para GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp (obligatorio para el modo vision, con el parche `llava-onevision.patch`), `llama-server` y `llama-mtmd-cli`; tambien sobre Metal (Mac Studio M5 Max/Ultra) y CPU. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks del modelo base que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria. A continuacion se comparan caracteristicas objetivas con modelos vision-lenguaje de tamano similar:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KORMo-Web-11B-GGUF | ~10,76B | hasta 128K | ko, en | Apache 2.0 | GGUF |
| Qwen2.5-VL-7B | ~7B | 128K (segun documentacion del autor) | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-11B-Vision | ~11B | 128K (segun documentacion del autor) | en (principalmente) | Llama 3.2 Community License | safetensors, GGUF |
| MiniCPM-V 2.6 | ~8B | no disponible | multilingue | Apache 2.0 (con condiciones) | safetensors, GGUF |

Las cifras de contexto de los modelos alternativos corresponden a su documentacion publica y no se han verificado en esta ficha; el rendimiento comparativo no esta disponible.

## Limitaciones y advertencias
- Idiomas: solo coreano e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo generativo, puede describir elementos de interfaz inexistentes o malinterpretar capturas; requiere validacion en flujos de agente.
- Dependencia de parche: el modo vision exige aplicar `llava-onevision.patch` sobre un commit concreto de llama.cpp (`e4b620af...`); actualizar llama.cpp puede romper la compatibilidad.
- Cuantizaciones agresivas: IQ3_M pierde aproximadamente un 12% de top-1 frente a BF16 (87,25% en WikiText-2), lo que puede degradar tareas de agente que dependen de precision en la lectura de la interfaz.
- Contexto: los 128K tokens solo son alcanzables con 48 GB o mas de memoria; en GPUs de 24 GB el limite practico es 32K.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo base ni sobre el comportamiento en produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Thinking mode por defecto: incrementa el consumo de tokens y la latencia; debe desactivarse explicitamente para respuestas directas.

## Enlaces
- Modelo GGUF en Hugging Face: https://huggingface.co/Xylolabs/KORMo-Web-11B-GGUF
- Modelo base: https://huggingface.co/KORMo-VL/KORMo-Web-11B
- Repositorio de llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Repositorio de Xylolabs (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
