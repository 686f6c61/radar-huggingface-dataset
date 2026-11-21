# XingChen-AGI/Xing4.0-29B-A4B-GGUF

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. (sucesor de la familia TeleChat), distribuido bajo la organizacion XingChen-AGI en Hugging Face. Cuenta con 29B parametros totales y solo 4B activos por token (aproximadamente un 13,8% de activacion), lo que lo situa en la categoria de modelos eficientes en inferencia con calidad cercana a modelos densos de mayor tamano. Soporta de forma nativa una longitud de contexto de 256K tokens, extensible hasta 512K.

Este repositorio concreto contiene los pesos cuantizados en formato GGUF, con un rango de 2 a 8 bits e imatrix de cuantizacion, pensados para ejecucion local en llama.cpp. Los ficheros van de 11 a 34 GB, de modo que el modelo puede correr en una unica GPU de consumo. El soporte nativo esta integrado en la rama principal de llama.cpp desde la build b12174 (PR #31589), por lo que no se requiere compilar un parche.

El modelo esta orientado a tareas de ingenieria complejas: planificacion con contexto largo, razonamiento multi-paso, tool calling y salida estructurada. La licencia Apache 2.0 y la integracion en el ecosistema abierto (ms-swift, LLaMA-Factory, SGLang, vLLM, llama.cpp) lo convierten en una opcion practica para despliegues de agentes en produccion y para experimentacion en hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC + MLA + MTP |
| Parametros totales | 29B (31.215.031.088 segun safetensors) |
| Parametros activos | 4B por token (~13,8% de activacion) |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | GGUF de 2 a 8 bits con imatrix de cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien disponibles BF16, FP8 y W8A8 en repos separados) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de tipo Mixture of Experts construida sobre los componentes mHC (multi-head compression o variante propietaria de atencion multi-cabeza con compresion), MLA (Multi-head Latent Attention) y MTP (Multi-Token Prediction). La combinacion de MLA con un esquema MoE de activacion dispersa permite mantener un coste de inferencia bajo (4B parametros activos) mientras se conserva la capacidad representacional de un modelo de 29B. El componente MTP habilita la prediccion de multiples tokens por paso, lo que puede acelerar la decodificacion.

El entrenamiento se realizo de extremo a extremo sobre una pila completamente interna, desde el silicio hasta el software, adaptada a clusters de NPU domesticos. El equipo reporta una mejora de throughput de entrenamiento de aproximadamente el 96% sobre el rendimiento out-of-the-box, gracias a optimizacion de comunicacion MoE de grano fino, recomputacion selectiva, fusion automatica de grafos y operadores, y kernels mHC fusionados ajustados manualmente. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso con cadenas de razonamiento complejas.
- Planificacion en contexto largo, aprovechando la ventana nativa de 256K tokens (extensible a 512K).
- Tool calling y function calling, con formato alineado con frameworks de agentes como OpenCo.
- Ejecucion de agentes y razonamiento multi-step con coherencia bajo contextos extensos.
- Salida estructurada, adecuada para pipelines que requieren JSON u otros formatos estrictos.
- Tareas de ingenieria de software: generacion y edicion de codigo en flujos agenticos.
- Capacidades multilingues: no disponible (no se detallan idiomas en la informacion proporcionada).
- Fine-tuning soportado mediante ms-swift y LLaMA-Factory (integraciones fusionadas upstream).

## Casos de uso

- Agentes de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para revisar, generar y refactorizar codigo, apoyandose en tool calling y en la ventana de 256K tokens para mantener el contexto de repositorios grandes.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con historial extenso gracias a su contexto de 256K tokens, manteniendo coherencia en sesiones largas sin truncar informacion relevante.
- Automatizacion de tareas de ingenieria: planificacion y ejecucion de flujos multi-paso (lectura de documentacion, llamadas a APIs, verificacion de resultados) con salida estructurada para encadenar herramientas.
- Analisis de documentos extensos: resumen y extraccion de informacion de contratos, informes tecnicos o bases de codigo que superan la ventana de modelos convencionales, aprovechando la extension a 512K.
- Despliegue local en estaciones de trabajo: con cuantizaciones GGUF de 11 a 34 GB, puede ejecutarse en una unica GPU de consumo mediante llama.cpp, lo que facilita prototipado y entornos con requisitos de privacidad.
- Asistentes de desarrollo integrados en IDE: inferencia local con baja latencia gracias a los 4B parametros activos, permitiendo autocompletado y explicacion de codigo sin depender de la nube.
- Fine-tuning especializado: adaptacion a dominios concretos (legal, sanitario, industrial) mediante ms-swift o LLaMA-Factory sobre la version BF16, con licencia Apache 2.0 que permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 y 34 GB segun la cuantizacion GGUF elegida (2 a 8 bits).
- GPU recomendadas: una unica GPU de consumo de gama alta es suficiente para las cuantizaciones bajas; para las variantes de 8 bits se recomienda al menos 34 GB de VRAM (por ejemplo, A100 40GB, H100, o RTX 4090 24GB solo para cuantizaciones de 4 bits o inferiores).
- Cabe en GPU de consumo: si, en modelos como RTX 4090 (24 GB) con cuantizaciones de 4 bits o menores (11-16 GB aproximadamente); las variantes de 8 bits requieren GPU profesional.
- Opciones de despliegue: llama.cpp b12174+ (soporte nativo en mainline), SGLang (PR #39793), plugin oficial de vLLM, ms-swift y LLaMA-Factory para fine-tuning.
- Latencia y throughput: no disponibles; la activacion de solo 4B parametros por token reduce el coste computacional frente a un modelo denso de 29B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 29B | 4B | 256K (512K ext.) | Apache 2.0 | GGUF, BF16, FP8, W8A8 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se aportan datos de rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; cabe esperar sesgos presentes en los datos de entrenamiento, no documentados.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan medidas especificas de mitigacion.
- Limitaciones de contexto o idioma: el contexto maximo nativo es de 256K tokens (512K extendido); no se detallan los idiomas soportados ni su calidad relativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se documentan restricciones adicionales.
- Caveats para produccion: las cuantizaciones GGUF de baja precision (2-3 bits) pueden degradar la calidad; se recomienda validar la variante elegida en las tareas objetivo. El soporte en llama.cpp requiere build b12174 o superior.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Modelo base BF16: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Version FP8: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Version W8A8: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-w8a8
- Organizacion en Hugging Face: https://huggingface.co/XingChen-AGI
- GitHub del proyecto: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Guia de ejecucion local en llama.cpp: https://github.com/XingChen-AGI/Xing4.0-29B-A4B/blob/main/tutorial/llama.cpp/README_EN.md
- Repositorio en ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Repositorio en Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31589
- PR de soporte en SGLang: https://github.com/sgl-project/sglang/pull/39793
- PR de integracion en ms-swift: https://github.com/modelscope/ms-swift/pull/10275
- PR de integracion en LLaMA-Factory: https://github.com/hiyouga/LlamaFactory/pull/10754
- Paper de referencia (arXiv 2611.22115): https://arxiv.org/abs/2611.22115
- Paper de referencia (arXiv 2512.24157): https://arxiv.org/abs/2512.24157
- Paper de referencia (arXiv 2507.18013): https://arxiv.org/abs/2507.18013
