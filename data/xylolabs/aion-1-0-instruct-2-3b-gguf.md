# Xylolabs/Aion-1.0-Instruct-2.3B-GGUF

## Resumen

Aion-1.0-Instruct-2.3B-GGUF es la distribucion cuantizada en formato GGUF del modelo instructivo Aion 1.0 Instruct 2.3B desarrollado por Microsoft. La publica Xylolabs, que convierte los pesos originales a GGUF para su uso con llama.cpp y anade un parche de compatibilidad, ya que la version estandar de llama.cpp no reconoce la arquitectura `aion`. El modelo resuelve el problema de ejecutar un modelo instructivo de 2.288 millones de parametros en hardware modesto, con cuantizaciones que van desde 1,01 GB (Q2_K) hasta 4,59 GB (F16).

Se trata de un modelo de generacion de texto orientado a conversacion, con una ventana de contexto de 32.768 tokens segun los ejemplos de ejecucion de la model card, y soporte para ocho idiomas: ingles, aleman, espanol, portugues, italiano, frances, chino y japones. La licencia es MIT, lo que facilita su uso comercial y su integracion en productos derivados.

Su relevancia actual radica en que ofrece una alternativa compacta y permisiva para despliegues en local, con un conjunto de cuantizaciones bien documentado y curvas de divergencia KL y acuerdo top-1 frente a una referencia en f32, lo que permite elegir el equilibrio entre tamano y fidelidad con datos concretos en lugar de estimaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | aion (arquitectura propia no estandar; requiere parche en llama.cpp) |
| Parametros totales | 2.288.831.488 (2,29 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (segun ejemplos de ejecucion con `-c 32768`) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M, Q2_K |
| Idiomas soportados | en, de, es, pt, it, fr, zh, ja |
| Licencia | MIT (texto de Microsoft, "Copyright (c) Microsoft Corporation") |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que llama.cpp la identifica como `aion` y que la version estandar no la reconoce, por lo que la distribucion incluye el parche `aion-llama.cpp.patch` para compilar contra un commit concreto de llama.cpp. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion.

La innovacion tecnica destacable de esta ficha es el proceso de cuantizacion: Xylolabs publica una matriz de importancia (`Aion-1.0-Instruct-2.3B.imatrix.gguf`) y documenta la fidelidad de cada cuantizacion mediante divergencia KL media y acuerdo top-1 frente a una referencia en transformers f32 sobre pesos BF16, evaluando en WikiText-2, un conjunto de chat y un conjunto held-out. La plantilla de chat embebida escribe el preambulo de sistema con la fecha, y por ello se requiere el flag `--jinja` al ejecutar.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a chat instructivo.
- Razonamiento y respuesta a instrucciones en ocho idiomas (en, de, es, pt, it, fr, zh, ja).
- Soporte de plantilla de chat integrada con preambulo de sistema que incluye la fecha.
- Compatibilidad con el ecosistema llama.cpp mediante el parche incluido.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional en local para estaciones de trabajo: con la cuantizacion Q4_K_M (1,57 GB) el modelo cabe en GPUs de consumo de 8 GB o menos y permite mantener conversaciones multi-turno con hasta 32K tokens de contexto, util para prototipos sin dependencia de la nube.
- Despliegue en dispositivos con memoria unificada: en un Mac Studio o en un DGX Spark, la version F16 (4,59 GB) se ejecuta con contexto completo de 32K, adecuada para entornos de desarrollo donde se prioriza la fidelidad sobre el tamano.
- Generacion de texto en aplicaciones embebidas o de borde: las cuantizaciones IQ3_M (1,18 GB) y Q2_K (1,01 GB) permiten integrar el modelo en dispositivos con recursos limitados, aceptando la perdida de fidelidad documentada (acuerdo top-1 del 89,40% y 79,48% respectivamente en WikiText-2).
- Traduccion y asistencia multilingue: al cubrir ocho idiomas, puede emplearse para tareas de traduccion o redaccion asistida entre pares como espanol-aleman o ingles-japones, aunque sin datos de benchmarks especificos por idioma.
- Servicio de chat autohospedado con llama-server: el comando documentado levanta un endpoint compatible con clientes HTTP, lo que permite montar una API interna de conversacion con control total sobre los datos.
- Evaluacion y experimentacion academica: la publicacion de curvas de divergencia KL y acuerdo top-1 por cuantizacion facilita estudios sobre el impacto de la compresion en modelos pequenos, usando el modelo como caso de referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card unicamente proporciona metricas de fidelidad de cuantizacion frente a la referencia f32:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| F16 | 4,59 GB | 0,00027 | 98,92% | 0,00019 | 99,25% | 0,00025 | 98,96% |
| Q8_0 | 2,44 GB | 0,00212 | 97,61% | 0,00180 | 98,12% | 0,00238 | 97,25% |
| Q6_K | 2,03 GB | 0,00272 | 97,17% | 0,00292 | 97,65% | 0,00320 | 96,97% |
| Q5_K_M | 1,77 GB | 0,00404 | 96,34% | 0,00388 | 97,30% | 0,00454 | 96,43% |
| Q4_K_M | 1,57 GB | 0,00716 | 95,24% | 0,00656 | 96,46% | 0,00787 | 95,31% |
| Q4_K_S | 1,40 GB | 0,01446 | 93,84% | 0,01298 | 95,16% | 0,01687 | 93,16% |
| IQ4_XS | 1,28 GB | 0,02268 | 92,24% | 0,02136 | 93,87% | 0,02575 | 91,43% |
| IQ3_M | 1,18 GB | 0,04580 | 89,40% | 0,04892 | 90,67% | 0,05419 | 87,92% |
| Q2_K | 1,01 GB | 0,17564 | 79,48% | 0,17004 | 83,64% | 0,20950 | 77,38% |

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 1 GB con Q2_K hasta 4,6 GB con F16, mas la cache KV en f16 para el contexto elegido y unos 2 GB adicionales para el runtime, segun la regla de la model card (el archivo debe caber en el 90% de la memoria disponible).
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) ejecutan F16 con 32K de contexto; RTX 5090 (32 GB), RTX 6000 Ada (48 GB), H100 (80 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB) tambien soportan F16 a contexto completo.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos unos 4-6 GB libres usando cuantizaciones Q4 o inferiores; en GPUs de 24 GB o mas se puede usar F16 con contexto de 32K.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y M5 Ultra (256 GB y 512 GB) ejecutan la version F16 con contexto completo.
- Opciones de despliegue: llama.cpp (llama-server y llama-cli) compilado con el parche `aion-llama.cpp.patch` sobre el commit `e4b620af19f02960dea7a3a81de7c5805aa3a333`; se requiere `--jinja` por la plantilla de chat embebida. No se documentan otras opciones de despliegue (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de benchmarks ni de especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, el modelo base es `microsoft/Aion-1.0-Instruct-2.3B`, del que esta distribucion es una conversion cuantizada; cualquier comparacion con otros modelos de ~2-3 mil millones de parametros requeriria datos que no se han facilitado.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-GGUF (Xylolabs) | 2,29 mil M | 32.768 | MIT | GGUF | Requiere parche de llama.cpp |
| microsoft/Aion-1.0-Instruct-2.3B | 2,29 mil M | no disponible | MIT | safetensors | Modelo base sin cuantizar |
| Alternativas de ~2-3 mil M | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- La arquitectura `aion` no es reconocida por llama.cpp estandar: es obligatorio aplicar el parche incluido y compilar contra el commit indicado, lo que complica el mantenimiento y la actualizacion.
- El flag `--jinja` es imprescindible porque la plantilla de chat escribe el preambulo de sistema con la fecha; omitirlo puede degradar la calidad de las respuestas.
- La cuantizacion Q2_K presenta una fidelidad notablemente inferior (acuerdo top-1 del 79,48% en WikiText-2 y 77,38% en held-out), por lo que no es recomendable para tareas sensibles a la precision.
- No se documentan en la informacion disponible sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- El soporte multilingue se declara para ocho idiomas, pero no se aportan metricas por idioma que permitan verificar la calidad relativa en espanol u otros.
- La licencia MIT permite uso comercial, pero la model card aclara que Xylolabs no esta afiliada ni respaldada por Microsoft; el aviso `NOTICE` atribuye la titularidad a Microsoft.
- El tamano del repositorio (17,3 GB) incluye todas las cuantizaciones e imagenes, no solo un archivo; conviene descargar unicamente el GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Parche de compatibilidad: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF/resolve/main/aion-llama.cpp.patch
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
