# WorkOffline/gemma-4-26B-A4B-it-qat-UD-GGUF

## Resumen

Este repositorio no contiene un modelo original, sino un espejo (mirror) de los pesos GGUF de Gemma 4 26B-A4B en su variante instructiva con cuantización consciente del entrenamiento (QAT), publicados originalmente por Google DeepMind y convertidos a GGUF por Unsloth. El autor, WorkOffline, mantiene una copia byte a byte de dos ficheros: el modelo principal en cuantización dinámica UD-Q4_K_XL (14.249.047.104 bytes) y el proyector multimodal `mmproj` en F16 (1.193.058.784 bytes), ambos fijados a la revisión `7b92b5b28818151e8669af2e45e88d6086f490dd` del repositorio de Unsloth y verificables mediante SHA-256.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con 25.233.142.046 parámetros totales y 4B de parámetros activos por token, según la nomenclatura A4B del nombre. Está pensado para inferencia conversacional local: la cuantización QAT reduce la pérdida de calidad respecto a una cuantización post-entrenamiento equivalente, y el formato GGUF permite ejecutarlo en CPU, GPU híbrida o GPU completa con llama.cpp y derivados.

La relevancia de este repositorio es operativa más que técnica: ofrece una descarga reproducible y verificable de pesos que de otro modo dependen de la disponibilidad de los repositorios de Google y Unsloth, con nombres de fichero normalizados y sumas de comprobación publicadas, lo que facilita su integración en aplicaciones que necesitan fijar una revisión exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), segun la nomenclatura A4B del nombre; detalles de capas y atencion no disponibles |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 4B (inferido de la nomenclatura A4B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (modelo principal); F16 (proyector multimodal mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector multimodal separado en GGUF F16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de mezcla de expertos con 25,2B parametros totales y una designacion A4B que sugiere 4B parametros activos por token. No se especifican el numero de capas, la dimension del modelo, el numero de expertos, la estrategia de enrutamiento ni el tipo de atencion empleado.

Respecto al entrenamiento, el repositorio base de Google es `gemma-4-26B-A4B-it-qat-q4_0-unquantized`, lo que indica que el modelo paso por un proceso de cuantizacion consciente del entrenamiento (QAT) a 4 bits antes de ser convertido a GGUF. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas especificas. La conversion a GGUF y la cuantizacion dinamica UD-Q4_K_XL corresponden a Unsloth, no a Google.

## Capacidades

- Generacion de texto conversacional en modo instructivo (sufijo `-it`), orientada a dialogos multi-turno.
- Capacidades multimodales: el repositorio incluye un proyector `mmproj` en F16, lo que habilita entrada de imagenes junto con texto en llama.cpp y clientes compatibles.
- Mezcla de expertos con 4B parametros activos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano total.
- Cuantizacion QAT: los pesos de origen ya fueron entrenados teniendo en cuenta la cuantizacion a 4 bits, lo que en principio preserva mas calidad que una cuantizacion post-entrenamiento equivalente.
- Soporte de tool calling, function calling, razonamiento multi-paso o modo thinking: no disponible en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local con entrada de imagenes: el par de ficheros GGUF (modelo UD-Q4_K_XL mas `mmproj` F16) permite desplegar un asistente multimodal en llama.cpp sin dependencia de servicios en la nube, con un peso total de unos 15,4 GB en disco.
- Distribucion reproducible en aplicaciones de escritorio: al fijar una revision concreta y publicar SHA-256 de cada fichero, el repositorio sirve como origen de descarga verificable para una app que necesite garantizar que el binario de pesos no ha sido alterado.
- Inferencia en estaciones de trabajo con una sola GPU de 24 GB: la cuantizacion Q4_K_XL de un MoE de 25,2B totales con 4B activos encaja en el presupuesto de VRAM de tarjetas consumer de gama alta, con velocidad de generacion limitada por los 4B activos y no por los 25,2B totales.
- Despliegue en CPU o configuracion hibrida CPU-GPU: el formato GGUF y el reparto por capas de llama.cpp permiten ejecutar el modelo en equipos sin GPU dedicada, a costa de menor throughput.
- Procesamiento por lotes de documentos con componente visual: el proyector multimodal permite extraer informacion de capturas, diagramas o formularios escaneados combinando texto e imagen en una misma peticion.
- Base para evaluacion comparativa de cuantizaciones: al ser una copia exacta de los pesos de Unsloth, sirve para medir la degradacion de calidad de Q4_K_XL frente a los pesos QAT sin cuantizar de Google en tareas concretas del dominio propio.
- Integracion en pipelines de agentes con cliente compatible con la API de endpoints: la etiqueta `endpoints_compatible` del repositorio indica que los pesos pueden servirse detras de una interfaz compatible con la API de Hugging Face, lo que simplifica sustituir un proveedor remoto por una instancia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero principal ocupa 14.249.047.104 bytes (unos 13,3 GiB) y el proyector multimodal 1.193.058.784 bytes (unos 1,1 GiB). Con contexto y cache KV, un despliegue en GPU requiere aproximadamente 15-17 GiB de VRAM en funcion de la longitud de contexto configurada.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB), A100 (40/80 GB) y H100 (80 GB) para servir con contexto amplio o varios usuarios concurrentes.
- Cabe en GPU consumer de 24 GB con la cuantizacion UD-Q4_K_XL; en tarjetas de 16 GB requeriria offload parcial de capas a CPU o una cuantizacion mas agresiva no incluida en este repositorio.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, Ollama), asi como cualquier runtime que consuma GGUF y soporte el proyector `mmproj` para entrada multimodal. vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con 4B parametros activos, el coste por token deberia aproximarse al de un modelo denso de 4B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma 4 26B-A4B it QAT (este repositorio, UD-Q4_K_XL) | 25,2B | 4B (segun nomenclatura) | no disponible | GGUF | Apache 2.0 | Espejo verificado de Unsloth |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,2B | 4B (segun nomenclatura) | no disponible | Safetensors (QAT) | Apache 2.0 | Repositorio oficial de Google |
| unsloth/gemma-4-26B-A4B-it-qat-GGUF | 25,2B | 4B (segun nomenclatura) | no disponible | GGUF (varias cuantizaciones) | Apache 2.0 | Repositorio original de la conversion |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo original: es una copia de los GGUF de Unsloth. Cualquier correccion, actualizacion o cambio de licencia en el origen debe replicarse manualmente aqui; el espejo esta fijado a la revision `7b92b5b28818151e8669af2e45e88d6086f490dd` y no se actualiza automaticamente.
- La model card indica que el modelo original declara Apache 2.0 pero no incluye fichero de licencia; el `LICENSE` de este repositorio es el texto estandar de Apache 2.0. Conviene verificar los terminos vigentes en la documentacion oficial de Gemma antes de un uso comercial.
- No hay informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni comportamiento en dominios sensibles. La evaluacion previa a produccion es responsabilidad del integrador.
- La cuantizacion UD-Q4_K_XL introduce una perdida de calidad no cuantificada respecto a los pesos QAT sin cuantizar; no se publican metricas de degradacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion ni de validacion independiente de los ficheros mas alla de los SHA-256 publicados.
- Los detalles de arquitectura, contexto maximo y capacidades de tool calling no estan documentados en la informacion disponible; no deben asumirse sin comprobacion empirica.
- El uso del proyector multimodal requiere un runtime que soporte `mmproj`; sin el, el modelo funciona solo con texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WorkOffline/gemma-4-26B-A4B-it-qat-UD-GGUF
- Modelo base (Google): https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
