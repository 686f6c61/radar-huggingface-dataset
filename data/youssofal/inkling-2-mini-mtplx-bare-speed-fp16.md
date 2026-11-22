# Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed-FP16

## Resumen

Inkling-2-Mini-MTPLX-Bare-Speed-FP16 es una cuantizacion y empaquetado del modelo base thinkingmachines/Inkling-2-Mini, publicado por el usuario Youssofal para su ejecucion local en Macs con Apple Silicon mediante la herramienta MTPLX (version 2.13 o superior). El modelo base es un transformer de tipo MoE (mixture of experts) desarrollado por Thinking Machines Lab, orientado a generacion de codigo, agentes e imagenes, con 26.437.722.672 parametros totales y 3.400 millones de parametros activos por token, segun la model card del autor.

Este empaquetado concreto esta pensado para Macs con chip M1 o M2, que carecen de soporte nativo de bfloat16. Por ello, todos los tensores de 16 bits (torre de vision y cabecera de borrador incluidas) se almacenan como float16, mientras que los codigos de 4 y 8 bits se mantienen identicos al empaquetado padre. El pack incluye la torre de vision completa y una cabecera de prediccion multi-token que permite decodificacion especulativa, manteniendo la distribucion original del modelo.

La relevancia de este pack radica en que permite ejecutar un modelo de 26.400 millones de parametros con ventana de contexto de hasta 1.048.576 tokens en hardware de consumo Apple Silicon con 32 GB o mas de memoria unificada, algo que en GPUs convencionales requeriria varios aceleradores de gama alta. El repositorio ocupa 16.0 GB y la licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), 24 capas, con torre de vision y cabecera de prediccion multi-token |
| Parametros totales | 26.437.722.672 |
| Parametros activos | 3.400 millones por token (8 de 128 expertos por token) |
| Longitud de contexto | Hasta 1.048.576 tokens (segun model card del base); en este pack: 163.840 tokens con 32 GB, 749.568 con 64 GB, 1.048.576 con 96-192 GB |
| Tipos de cuantizacion | Expertos en NVFP4; proyecciones de atencion, cabeza de salida y embeddings en 4-bit con grupos de 64; torre de vision y cabecera de borrador en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con politica de uso aceptable de Thinking Machines) |
| Formato de pesos | safetensors, libreria mtplx |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 24 capas, 128 expertos por capa y 8 expertos activados por token, lo que da 3.400 millones de parametros activos sobre un total de 26.437.722.672. Incluye una torre de vision completa (pipeline image-text-to-text) y una cabecera de prediccion multi-token (draft head) que actua como modelo borrador para decodificacion especulativa. En este empaquetado, los expertos se almacenan en NVFP4 (13,76 GB), las proyecciones de atencion en 4-bit con grupos de 64 (0,37 GB), la cabeza de salida en 4-bit (0,26 GB), los embeddings en 4-bit (0,26 GB), y la torre de vision y la cabecera de borrador en FP16 (0,64 GB cada una). Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

La innovacion tecnica principal del empaquetado es la decodificacion especulativa nativa: la cabecera de borrador propone varios tokens por adelantado y el modelo completo los verifica en una sola pasada, aceptando cada token mediante la regla de razon de probabilidades. Esto preserva la distribucion original del modelo a cualquier temperatura (configuracion de muestreo: temperatura 1.0, top-p 1.0, sin top-k) y reduce la latencia. El empaquetado FP16 es especifico para M1 y M2 porque estos chips no tienen bfloat16 nativo; MTPLX selecciona automaticamente esta build en dichos chips y las builds padre en M3, M4 y M5.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo, con soporte declarado para flujos de agentes (integracion con Pi, OpenCode y Hermes).
- Comprension de imagenes: entrada image-text-to-text con torre de vision completa que lee capturas de pantalla, diagramas y fotografias.
- Decodificacion especulativa con prediccion multi-token, que acelera la generacion manteniendo la distribucion del modelo.
- Capacidades de agente y razonamiento multi-paso (segun los tags del modelo y su orientacion a coding y agentes).
- Capacidades multilingues: no disponible (los idiomas no estan listados).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo local en Mac: el modelo puede integrarse con OpenCode, Pi o Hermes mediante `mtplx start`, gestionando conversaciones largas de refactorizacion gracias a una ventana de contexto de hasta 163.840 tokens en un Mac de 32 GB.
- Analisis de capturas de pantalla y diagramas: la torre de vision FP16 completa permite enviar imagenes de interfaces, esquemas de arquitectura o fotografias y obtener descripciones o codigo derivado, todo en local sin enviar datos a la nube.
- Agentes autonomos multi-paso: con 3.400 millones de parametros activos por token, el coste computacional por paso es bajo, lo que lo hace adecuado para bucles de agente con muchas iteraciones sobre un Mac Studio de 96-192 GB y contexto de 1.048.576 tokens.
- Procesamiento de repositorios completos: la ventana de contexto larga permite cargar varios ficheros de codigo simultaneamente para tareas de revision, busqueda de bugs o generacion de tests en un unico prompt.
- Desarrollo offline en entornos sin conectividad: al ejecutarse integramente en Apple Silicon con MTPLX, es util para trabajo en aviones, entornos air-gapped o con requisitos de privacidad estrictos.
- Servicio local compatible con APIs OpenAI y Anthropic: `mtplx serve` expone el modelo en `127.0.0.1:8000`, lo que permite conectar herramientas existentes que hablan esos protocolos sin modificar el codigo cliente.
- Prototipado de pipelines multimodales: la combinacion de vision y contexto largo permite experimentar con tareas de document understanding (PDF renderizados como imagenes, tablas, graficos) en hardware de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento aportado es de memoria: pico de 18,3 GiB sirviendo un prompt de 4.142 tokens en la ruta de codigo que usan los Macs M1 y M2, medido en un M5 Max.

## Requisitos de hardware

- Memoria unificada minima: 32 GB en M1 o M2 (contexto de 163.840 tokens). Con 16-24 GB en M1/M2 no cabe; MTPLX recomienda Qwen 3.5 9B Optimized Speed FP16.
- Memoria unificada recomendada: 64 GB (contexto de 749.568 tokens) o 96-192 GB (contexto completo de 1.048.576 tokens).
- Chips compatibles: Apple M1 y M2 exclusivamente (build FP16). En M3, M4 y M5 se deben usar las builds padre (Bare Speed, Optimized Speed, Optimized Quality).
- Equipos: desde MacBook Pro hasta Mac Studio, siempre con 32 GB o mas.
- Tamano de descarga: 16,0 GB.
- Pico de memoria medido: 18,3 GiB con prompt de 4.142 tokens (ruta M1/M2, medido en M5 Max).
- Despliegue: MTPLX 2.13 o superior (app de Mac o CLI). Instalacion via `brew install youssofal/mtplx/mtplx` o `python3 -m pip install mtplx`. No carga en MTPLX 2.12.
- Servidor de APIs: `mtplx serve` expone APIs compatibles con OpenAI y Anthropic en `127.0.0.1:8000`.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este empaquetado, que depende de la libreria mtplx.
- Latencia y throughput: no disponibles mas alla del dato de memoria pico.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| Inkling-2-Mini-MTPLX-Bare-Speed-FP16 | 26,4 B | 3,4 B | Hasta 1.048.576 tokens | Apache 2.0 | Apple Silicon M1/M2 via MTPLX |
| Inkling-2-Mini-MTPLX-Bare-Speed (padre) | 26,4 B | 3,4 B | Hasta 1.048.576 tokens | Apache 2.0 | Apple Silicon M3/M4/M5 via MTPLX |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 B | 3,4 B | Hasta 1.048.576 tokens | Apache 2.0 | Multiples (segun model card del base) |
| Qwen 3.5 9B Optimized Speed FP16 (recomendado por MTPLX para M1/M2 de 16-24 GB) | no disponible | no disponible | no disponible | no disponible | Apple Silicon via MTPLX |

Los datos de rendimiento comparado (benchmarks) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de MTPLX 2.13 o superior: el pack no carga en MTPLX 2.12, lo que obliga a actualizar la herramienta.
- Exclusivo de Apple Silicon M1 y M2: no funciona en M3, M4 ni M5 (para esos chips hay que usar las builds padre) ni en GPUs NVIDIA, AMD o CPU x86.
- Requiere al menos 32 GB de memoria unificada; en equipos de 16-24 GB no cabe.
- El contexto maximo real depende de la memoria disponible: 163.840 tokens con 32 GB frente a 1.048.576 con 96-192 GB.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplica el riesgo habitual de los modelos generativos.
- Idiomas soportados: no disponibles, por lo que no se puede garantizar un rendimiento adecuado fuera del ingles (u otros idiomas no declarados).
- Soporte de tool calling y modo thinking: no confirmado en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base esta sujeto a la politica de uso aceptable de Thinking Machines, que puede imponer restricciones adicionales.
- El pack solo cambia la precision respecto al padre; cualquier limitacion del modelo base se hereda integramente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- La fecha de creacion del repositorio (2026-11-22) es posterior a la fecha actual, lo que sugiere que los metadatos pueden ser inconsistentes o que el modelo es muy reciente; conviene verificar antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed-FP16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build padre (M3/M4/M5): https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed
- Build hermana Optimized Speed FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed-FP16
- Build hermana Optimized Quality FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16
- Build padre Optimized Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed
- Build padre Optimized Quality: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality
- MTPLX: https://mtplx.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Politica de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
