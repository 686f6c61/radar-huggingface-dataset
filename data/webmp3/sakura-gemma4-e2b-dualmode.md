# webmp3/Sakura-Gemma4-E2B-DualMode

## Resumen

Sakura Gemma 4 E2B DualMode es un ajuste fino experimental publicado por el usuario webmp3 que unifica generacion autoregresiva y recuperacion densa en un unico backbone Gemma 4. La idea central es evitar tener dos modelos residentes en memoria (un LLM generativo y un codificador de embeddings) mediante un modo `generate(...)` que usa la cabeza LM nativa y un modo `embed(...)` que produce embeddings densos de 768 dimensiones compatibles con Matryoshka (MRL), usando atencion bidireccional, una proyeccion lineal y un adaptador LoRA especifico.

El modelo parte de `google/gemma-4-E2B-it` como backbone compartido y de `google/embeddinggemma-2` como profesor de destilacion para el modo de recuperacion (el profesor no se fusiona en los pesos ni se necesita en tiempo de ejecucion). El sobrecoste de los adaptadores es de 1.703.936 parametros (3,25 MB en BF16), un +0,0755% respecto al backbone de texto denso, lo que en la practica elimina la necesidad de mantener un segundo backbone de embeddings.

El autor lo posiciona explicitamente como una prueba de concepto de investigacion (PoC) de viabilidad arquitectonica: no es un reemplazo directo de `embeddinggemma-2` en produccion, no es compatible 1:1 con indices generados por el profesor y no esta optimizado para despliegue movil. La cuantizacion y el preentrenamiento a gran escala quedan como trabajo futuro. El repositorio es muy reciente (creado el 6 de octubre de 2026) y practicamente sin traccion (0 descargas, 1 like).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4) de 35 capas con modo dual: atencion causal para generacion y atencion bidireccional para embeddings |
| Parametros totales | 5.123.178.979 (~5,12 B) en el checkpoint multimodal completo; 4.647.449.891 (~4,65 B) en la ruta de texto |
| Parametros activos | No es MoE. Clase de computo "E2B" (Effective 2B): 1.854.643.235 parametros en las 35 capas transformer + 402.653.184 de embeddings de tokens (2,257 B densos); los 2.390.151.936 de tablas PLE y las torres multimodales (475,73 M) no se activan en pasadas de solo texto |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica que la cuantizacion esta planificada como trabajo futuro) |
| Idiomas soportados | en, de |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (auditoria sobre el commit `3e22461f65e89153144f8adb70e3b8c2cc9845a7` de Gemma 4 E2B-it) |
| Adaptadores dual-mode | Cabeza lineal Linear(1536 → 768, sin bias) de 1.179.648 parametros + LoRA de solo embeddings de rango 8, alpha 16, aplicado a q, k, v y o en las capas 27–34, con 524.288 parametros |
| Pooling | Mean pooling sobre la capa 34, seguido de normalizacion L2 |
| Repositorio | 0,0 GB, 0 descargas, 1 like |

## Arquitectura y entrenamiento

El modelo reutiliza un unico backbone Gemma 4 E2B-it de 35 capas transformer (capas 0–34) con token embeddings atados a la `lm_head`. En modo generacion se comporta como un decoder causal estandar sobre la cabeza LM nativa. En modo embedding activa atencion bidireccional, un adaptador LoRA de rango 8 (alpha 16) restringido a las capas 27–34 en las proyecciones q, k, v y o, un mean pooling sobre la capa 34 y una proyeccion lineal de 1536 a 768 dimensiones con normalizacion L2 posterior. Los vectores resultantes son compatibles con Matryoshka Representation Learning, lo que permite truncar la dimensionalidad sin reentrenar.

El entrenamiento del modo de recuperacion es una destilacion cuyo profesor es `google/embeddinggemma-2`. El autor no detalla en la informacion disponible el volumen de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO especificas para este ajuste; tampoco se documenta el proceso de cuantizacion. La contribucion tecnica principal es el presupuesto de parametros: los 1,70 M de parametros adicionales suponen un +0,0919% frente a las capas transformer, un +0,0755% frente al backbone de texto denso (2,257 B), un +0,0367% frente a los parametros de texto almacenados (4,647 B) y un +0,0333% frente al checkpoint multimodal completo (5,123 B).

El desglose de parametros auditado es el siguiente: embeddings de tokens 402.653.184 (768,00 MB en BF16, compartidos con `lm_head`), capas transformer de texto 1.854.643.235 (3.537,45 MB), tablas de entradas por capa (PLE) 2.390.151.936 (4.558,85 MB), RMSNorm final 1.536, torre de vision y proyecciones 168.544.704 (321,47 MB) y torre de audio y proyecciones 307.184.384 (585,91 MB).

## Capacidades

- Generacion de texto autoregresiva mediante la cabeza LM nativa de Gemma 4 E2B-it.
- Extraccion de features y embeddings densos de 768 dimensiones a traves del modo `embed(...)`, con atencion bidireccional.
- Embeddings compatibles con MRL (Matryoshka), lo que permite truncar dimensiones para indexacion aproximada.
- Recuperacion densa (dense retrieval) para pipelines de RAG y busqueda semantica.
- Similitud entre frases (sentence similarity) y tareas de feature-extraction, que es la pipeline declarada del repositorio.
- Coexistencia de ambos modos sobre un unico modelo residente, sin cargar un segundo backbone de texto.
- Capacidad multimodal heredada del checkpoint base (torres de vision de 168,5 M de parametros y de audio de 307,2 M), si bien el autor no documenta modos de uso especificos para ellas en esta ficha.
- Soporte de tool calling, function calling, razonamiento multi-paso en modo agente o thinking mode explicito: no disponible en la informacion proporcionada.
- Idiomas: ingles y aleman declarados en los metadatos del modelo.

## Casos de uso

- RAG en dispositivos de borde: un unico backbone residente atiende tanto la generacion de respuestas como la codificacion de consultas y documentos, lo que evita cargar dos modelos en memoria. Es adecuado porque el sobrecoste de los adaptadores es de solo 3,25 MB en BF16 y el ahorro medido por el autor es de 516,30 MB de VRAM asignada y 1.305,66 MB de pico.
- Agentes de dispositivo con memoria semantica: el modelo puede generar la siguiente accion y, con el mismo backbone, vectorizar el historial o los artefactos recuperados para alimentar una memoria a largo plazo en un espacio de 768 dimensiones.
- Busqueda semantica sobre corpus locales en ingles y aleman: indexacion con `embed(...)` y normalizacion L2, con posibilidad de truncar dimensiones gracias a MRL para acelerar la busqueda en entornos con poca memoria.
- Cache semantico de prompts: usar los embeddings de 768 dimensiones para detectar consultas equivalentes o casi equivalentes y reutilizar respuestas generadas previamente, reduciendo el numero de invocaciones al modo generativo.
- Deduplicacion y agrupacion de documentos: clustering sobre los embeddings normalizados para detectar duplicados o contenido muy similar en repositorios documentales multilingues (en/de).
- Clarificacion de requisitos: el modelo puede generar respuestas y, simultaneamente, vectorizar cada turno para clasificar la intencion del usuario y enrutar la consulta a un recuperador especifico.
- Sistemas de recomendacion basados en similitud de texto: comparar embeddings de descripciones, resenas o articulos para construir similitudes item-item sin desplegar un encoder independiente.
- Investigacion sobre destilacion de embeddings: el repositorio sirve como banco de pruebas para medir la degradacion de un encoder destilado cuando comparte pesos con el LLM generador.

Advertencia transversal: todos estos casos deben tratarse como escenarios de prototipado, dado que el autor declara explicitamente que el modelo no es un reemplazo listo para produccion de `embeddinggemma-2`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MTEB u otros) en la informacion disponible.

El unico dato cuantitativo publicado es una medicion de memoria y runtime realizada en Windows 11 sobre graficos AMD Radeon 8060S UMA con PyTorch 2.12.0a0+rocm7.13.0a20260313, comparando subprocesos aislados. La tabla original esta truncada en la informacion recibida, por lo que no se pueden reproducir los valores de RSS por configuracion.

| Metrica de ahorro frente a la pila de dos modelos | Valor |
|---|---|
| VRAM/UMA asignada ahorrada | 516,30 MB |
| VRAM en pico ahorrada | 1.305,66 MB |
| RSS de proceso ahorrado | 250,79 MB |
| Hardware de medida | AMD Radeon 8060S UMA |
| Stack de medida | Windows 11, PyTorch 2.12.0a0+rocm7.13.0a20260313 |
| Post-load RSS por configuracion | no disponible (tabla truncada) |

## Requisitos de hardware

- Peso de los pesos en BF16 segun la auditoria del autor: 8.864,31 MB para toda la ruta de texto y 9.771,69 MB para el checkpoint completo con torres de vision y audio. Los adaptadores dual-mode anaden 3,25 MB.
- Estimacion de VRAM para inferencia en BF16: en torno a 10–11 GB solo para texto y en torno a 11–13 GB con el checkpoint multimodal completo, sumando cache KV y activaciones (estimacion aritmetica a partir de los tamanos de pesos publicados por el autor, no una medicion publicada).
- GPU con 24 GB (RTX 4090, L40S, A100 40 GB, H100) pueden alojar el modelo completo en BF16 con margen para contexto y lote. Tarjetas de 16 GB son viables para la ruta de solo texto en BF16. Tarjetas de 12 GB quedan al limite y dependen de la longitud de contexto, ya que no hay pesos cuantizados publicados.
- El autor midio el modelo sobre graficos integrados AMD Radeon 8060S con memoria unificada y ROCm, lo que indica viabilidad en hardware de clase consumer con UMA, aunque sin cifras de latencia ni throughput publicadas.
- Opciones de despliegue: no documentadas en la informacion disponible. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son aplicables sin una conversion previa; tampoco se confirma soporte de vLLM o TGI para este ajuste concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa natural es frente a la pila de dos modelos que este PoC pretende sustituir, y frente a los dos modelos base declarados.

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura Gemma 4 E2B DualMode | Generacion + embeddings 768d en un solo backbone | 5,123 B almacenados (2,257 B densos de texto) + 1,70 M de adaptadores | no disponible | gemma | HuggingFace, repo de 0,0 GB, 0 descargas |
| google/gemma-4-E2B-it | Backbone generativo de partida | 5,123 B almacenados (clase de computo E2B, 2,257 B densos) | no disponible | gemma | HuggingFace (modelo base declarado) |
| google/embeddinggemma-2 | Codificador denso, profesor de destilacion | no disponible | no disponible | no disponible | HuggingFace (modelo base declarado) |
| Pila separada Gemma 4 E2B-it + EmbeddingGemma 2 | Generacion y recuperacion con dos modelos residentes | Suma de ambos | no disponible | gemma | Requiere cargar dos backbones de texto |

El argumento diferencial del PoC es el ahorro de memoria (516,30 MB asignados, 1.305,66 MB en pico, 250,79 MB de RSS) a cambio de no ser compatible a nivel de indice con los vectores del profesor y de no alcanzar todavia calidad de produccion. No hay datos de benchmarks que permitan comparar calidad de recuperacion entre Sakura y EmbeddingGemma 2.

## Limitaciones y advertencias

- El propio autor lo clasifica como prueba de concepto de investigacion: no es un reemplazo directo de `google/embeddinggemma-2` en produccion.
- Los indices generados con el profesor `embeddinggemma-2` no son compatibles 1:1 con los embeddings de este modelo, por lo que cualquier base vectorial existente debe regenerarse.
- No esta optimizado para despliegue movil y no se han publicado pesos cuantizados; el autor indica que la cuantizacion es trabajo futuro.
- No hay resultados de benchmarks de calidad publicados, ni de recuperacion (MTEB u otros) ni de generacion (MMLU, GSM8K, HumanEval). Cualquier evaluacion de calidad en produccion requeriria validacion propia.
- El sobrecoste de parametros es minimo, pero tambien lo es la huella del repositorio (0,0 GB, 0 descargas, 1 like), lo que sugiere un artefacto experimental sin validacion externa.
- Idiomas declarados limitados a ingles y aleman; el rendimiento en otras lenguas no esta documentado.
- Longitud de contexto no especificada, lo que impide planificar escenarios de contexto largo.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google para la familia Gemma, que imponen obligaciones de uso aceptable y de atribucion; deben revisarse antes de cualquier despliegue comercial.
- Riesgo de alucinacion: inherente al backbone generativo Gemma 4 E2B-it, no mitigado de forma especifica en este ajuste.
- Sesgos: no documentados en la informacion disponible; al derivar de un modelo base entrenado mayoritariamente en ingles, es esperable un sesgo hacia ese idioma, pero no hay mediciones publicadas.
- La compatibilidad MRL permite truncar dimensiones, pero no se documenta la curva de degradacion de recuperacion por dimensionalidad.
- La tabla de benchmarks de memoria esta truncada en la informacion recibida, por lo que no se pueden replicar las mediciones por configuracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webmp3/Sakura-Gemma4-E2B-DualMode
- Modelo base generativo: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base profesor de embeddings: https://huggingface.co/google/embeddinggemma-2
- Papers, blogs tecnicos, repositorios de codigo o demos adicionales: no disponible en la informacion proporcionada.
