# wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-Core-K6

## Resumen

GLM-5.3-Flash-EXL3-K4-Core-K6 es una cuantizacion de tercera generacion (EXL3) del modelo multimodal GLM-5.3-Flash-BF16, publicado originalmente por zai-org. El trabajo lo firma el usuario wrldsuksgo2mars y combina dos anchos de bit distintos: K6 para las matrices densas del nucleo (atencion KDA, MLA, FFN compartidas y cabeza de salida) y K4 para los expertos enrutados del bloque MoE, incluido el modulo MTP nativo. El checkpoint conserva intactos en BF16/F32 la torre de vision, las compuertas y convoluciones KDA, los embeddings, los enrutadores, las normas y el estado mHC, de modo que la cuantizacion no degrada la ruta visual ni los componentes sensibles del modelo.

El modelo base emplea una arquitectura hibrida que combina atencion KDA (Kimi-style Delta Attention) con MLA (Multi-head Latent Attention), cuatro flujos mHC (multi-head cross-stream), un bloque MoE con decodificacion especulativa nativa mediante MTP (Multi-Token Prediction) y una torre de vision acoplada para tareas image-text-to-text. Con 82.810.550.366 parametros totales y un repositorio de 165,7 GB, la version EXL3 reduce el peso respecto al BF16 original manteniendo la fidelidad en las capas criticas.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de cuantizacion mixta K4/K6 sobre un modelo de gran escala con atencion hibrida y vision integrada; por otro, advierte de que el autor no ha realizado validacion de generacion completa, calidad en contexto largo ni rendimiento en servicio, por lo que su uso en produccion exige una evaluacion propia. La licencia MIT del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion KDA + MLA, MoE, cuatro flujos mHC y MTP nativo; torre de vision acoplada |
| Parametros totales | 82.810.550.366 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 MCG K6 (nucleo denso) y EXL3 MCG K4 (expertos enrutados y MTP); componentes retenidos en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (47 shards, 151.198 tensores) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash-BF16 presenta una arquitectura hibrida poco convencional. La atencion combina KDA (Delta Attention con compuertas y convoluciones) y MLA (Multi-head Latent Attention), organizada en cuatro flujos mHC que se propagan de forma entrelazada entre capas. El bloque MoE incluye expertos enrutados con FFN de compuerta/up/down, y el modelo incorpora MTP nativo para decodificacion especulativa. La torre de vision se mantiene acoplada al transformer de lenguaje para tareas image-text-to-text. El checkpoint cuantizado conserva el tokenizer, los assets de procesamiento de imagen y video, y la licencia original.

La cuantizacion se realizo con el algoritmo EXL3 en formato MCG, con multiplicador `0xCBAC1FED`, semilla 787, sigma 0.025 y escalas de salida automaticas, sin redondeo E4M3. Se aplico K6 a 316 matrices del nucleo (KDA q/k/v/o, MLA q_a/q_b/kv_a/o, FFN compartidas y densas, y cabeza) y K4 a 37.152 matrices de expertos enrutados mas 8 matrices MTP de atencion MLA/FFN compartida/eh_proj. Los 1.294 tensores restantes (vision, compuertas KDA, kv_b, indexer DSA, embeddings, mHC, enrutadores y normas) se retuvieron en BF16/F32. La calibracion uso el dataset `wrldsuksgo2mars/agentic-quant-panel-v1` con renderizado Flash nativo, thinking activado y esfuerzo de razonamiento maximo, en una unica pasada causal entrelazada que propaga estados reconstruidos antes de cada calibracion. El trabajo se ejecuto en una RTX PRO 6000 Blackwell Max-Q y cada tensor retenido se comparo byte a byte con la fuente BF16.

## Capacidades

- Generacion de texto y razonamiento multimodal image-text-to-text gracias a la torre de vision conservada en BF16.
- Procesamiento de imagen y video, con assets de preprocesamiento incluidos en el checkpoint.
- Razonamiento multi-paso con modo thinking nativo (la calibracion se realizo con thinking activado y esfuerzo maximo).
- Decodificacion especulativa mediante MTP nativo, que acelera la generacion autorregresiva.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Contexto largo: la arquitectura lo soporta, pero la longitud concreta no esta documentada.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede recibir capturas, diagramas o paginas escaneadas y generar descripciones o extracciones textuales, ya que la torre de vision se mantiene en BF16 sin cuantizar.
- Asistentes conversacionales multimodales: la combinacion de vision y lenguaje permite conversaciones multi-turno donde el usuario adjunta imagenes y pregunta sobre ellas.
- Procesamiento de video en pipelines de monitorizacion: los assets de procesamiento de video incluidos permiten alimentar frames al modelo para generar resumenes o alertas.
- Razonamiento asistido con thinking mode: tareas de analisis complejo donde conviene que el modelo explicite su cadena de razonamiento antes de responder.
- Generacion aumentada por recuperacion (RAG) sobre corpus visuales: indexacion de documentos con figuras y consulta en lenguaje natural sobre el contenido.
- Despliegue en infraestructura con VRAM limitada: la cuantizacion K4/K6 reduce el peso respecto al BF16, permitiendo servir el modelo en GPUs profesionales de 96 GB o en configuraciones multi-GPU.
- Experimentacion en investigacion: estudio de tecnicas de cuantizacion mixta sobre arquitecturas hibridas con atencion KDA/MLA y MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se han realizado pruebas de generacion completa, calidad en contexto largo ni rendimiento en servicio.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 165,7 GB en safetensors; la inferencia requiere al menos esa cantidad mas overhead de activaciones y cache KV. En la practica, se necesita un nodo multi-GPU o GPUs con 192 GB o mas de VRAM agregada.
- GPU recomendadas: RTX PRO 6000 Blackwell (usada para la cuantizacion), A100 80 GB en configuracion multi-GPU, H100 80 GB, H200.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en ninguna GPU de consumo actual.
- Opciones de despliegue: se requiere un runtime que soporte el formato EXL3 MCG mixto K4/K6 con componentes BF16 retenidos. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-K4-Core-K6 | 82,8 B | no disponible | MIT | safetensors EXL3 | Cuantizacion mixta K4/K6, vision en BF16 |
| zai-org/GLM-5.3-Flash-BF16 | no disponible | no disponible | MIT | safetensors BF16 | Modelo base sin cuantizar |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El autor no ha validado la generacion completa del modelo cuantizado; la calidad real de las respuestas puede diferir del BF16 original.
- No se han realizado pruebas de calidad en contexto largo ni de rendimiento en servicio.
- La cuantizacion K4 en los expertos enrutados puede introducir degradacion acumulada en tareas de razonamiento complejo; se recomienda evaluar con benchmarks propios antes de usar en produccion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado para esta version.
- Idiomas soportados: no disponibles; la cobertura multilingue no esta documentada.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no ofrece garantias sobre el checkpoint cuantizado.
- El runtime debe soportar el formato EXL3 MCG mixto K4/K6 y los componentes BF16 retenidos; no se garantiza compatibilidad con herramientas estandar.
- El checkpoint tiene solo 26 descargas y 0 likes, lo que indica ausencia de validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-Core-K6
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Dataset de calibracion: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
