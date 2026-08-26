# vumpt/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de tipo Mixture-of-Experts ultra disperso desarrollado por Qwen (Alibaba), construido sobre la arquitectura experimental Qwen4. Combina Gated DeltaNet (GDN) con Qwen Sparse Attention (QSA) en una configuracion hibrida: tres de cada cuatro capas usan GDN para comprimir el historial, mientras que la cuarta emplea QSA para recuperacion precisa de contexto largo. El modelo totaliza 125B parametros MoE con solo 6B activos por token, a los que se anaden una tabla de embedding n-gram "PLE" de 51B parametros y 4B de MTP, sumando aproximadamente 180B parametros en total.

Esta ficha cubre la conversion GGUF realizada por el usuario vumpt, que permite ejecutar el modelo mediante llama.cpp en la rama del PR #27742 (soporte de arquitectura `qwen4exp`). El archivo resultante pesa unos 120 GB en cuantizacion Q4_K_M. El modelo soporta una ventana de contexto de 262K tokens y admite entradas de imagen y texto, lo que lo posiciona como una opcion relevante para despliegue local en hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4 experimental (Gated DeltaNet + Qwen Sparse Attention + MoE de 512 expertos + tabla n-gram PLE) |
| Parametros totales | 176.943.899.520 (~177B; 125B MoE + 51B n-gram + 4B MTP) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Q4_K_M (con fallback por tensor a Q5_0/q8_0 cuando ncols no es divisible por 256; embedding y output en Q6_K; tabla n-gram en Q5_0) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (licencia "other" en HuggingFace) |
| Formato de pesos | GGUF (un unico archivo `qwen3.8-flash-next-Q4_K_M.gguf` de ~120 GB) |

## Arquitectura y entrenamiento

La arquitectura Qwen4 introduce cuatro innovaciones principales: atencion hibrida GDN + QSA, residual, embedding y optimizacion. En concreto, tres de cada cuatro capas utilizan Gated DeltaNet, un mecanismo de compresion de historial de estado lineal, mientras que la cuarta capa emplea Qwen Sparse Attention para recuperacion precisa de informacion en contextos muy largos. El componente MoE cuenta con 512 expertos de los cuales se activan 6B parametros por token, lo que reduce drasticamente el coste computacional respecto a un modelo denso de tamano equivalente.

Adicionalmente, el modelo incorpora una tabla de embedding n-gram (PLE) de 51B parametros que complementa la representacion token, y un modulo MTP (multi-token prediction) de 4B parametros. El modelo es multimodal (image-text-to-text), por lo que acepta tanto texto como imagenes como entrada. Los datos de entrenamiento, el numero de tokens procesados y las tecnicas de alineacion (RLHF, DPO, etc.) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento avanzado, con soporte de contexto largo de 262K tokens.
- Procesamiento multimodal: acepta entradas de imagen y texto simultaneamente (pipeline image-text-to-text).
- Razonamiento multi-paso y capacidades de agente gracias a la combinacion de atencion esparsa y compresion de historial.
- Eficiencia computacional notable: solo 6B parametros activos por token pese a los 125B totales del MoE.
- Recuperacion precisa de informacion en contextos extensos mediante Qwen Sparse Attention en una de cada cuatro capas.
- Compresion eficiente del historial conversacional mediante Gated DeltaNet en las capas restantes.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision detalladas (deteccion de objetos, OCR, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes: el modelo puede procesar documentos extensos de hasta 262K tokens que incluyan figuras, diagramas y tablas, extrayendo informacion relevante de forma conjunta. Su atencion esparsa permite localizar datos concretos en documentos muy largos sin perder el contexto global.
- RAG multimodal sobre corpus extensos: al combinar la ventana de 262K tokens con la capacidad de procesar imagenes, puede indexar y consultar bases de conocimiento que mezclan texto e imagenes, respondiendo preguntas que requieren cruzar informacion de ambas modalidades.
- Despliegue local en estaciones de trabajo con memoria unificada: segun la documentacion de unsloth, el modelo puede ejecutarse en equipos con 78 GB de RAM o memoria unificada sin necesidad de VRAM dedicada, lo que lo hace viable para investigacion y desarrollo en hardware de gama alta.
- Asistentes de investigacion cientifica: su contexto de 262K tokens permite cargar articulos completos, incluyendo figuras y tablas, y realizar tareas de resumen, comparacion y extraccion de resultados sin fragmentar el documento.
- Generacion de codigo asistida con contexto amplio: la ventana de 262K tokens permite incluir repositorios completos o multiples archivos de codigo en el prompt, facilitando tareas de refactorizacion, generacion de tests y revision de codigo con conocimiento integral del proyecto.
- Experimentacion con arquitecturas hibridas: al ser un modelo experimental de Qwen4, es util para investigadores que quieran evaluar el rendimiento de Gated DeltaNet combinado con atencion esparsa en tareas de razonamiento de largo alcance, comparandolo con arquitecturas transformer clasicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion encontrada (unsloth, explainx, vLLM recipes) menciona las capacidades del modelo pero no incluye cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- El archivo GGUF en Q4_K_M ocupa aproximadamente 120 GB en disco.
- Segun unsloth, el modelo puede ejecutarse localmente en dispositivos con 78 GB de RAM o memoria unificada sin requerir VRAM de GPU.
- Para inferencia en GPU, se necesitarian multiples GPUs de alta gama: con cuantizacion Q4_K_M, se estima un minimo de 120-130 GB de VRAM combinada, lo que implica al menos dos GPUs de 80 GB (como A100 o H100) o configuraciones con varias RTX 4090 (24 GB cada una, requiriendo 5-6 unidades).
- El despliegue se realiza exclusivamente con llama.cpp en la rama del PR #27742 (`qwen4exp`). La rama principal de llama.cpp no soporta esta arquitectura.
- No se dispone de datos de latencia o throughput estimados.
- Alternativas de despliegue como vLLM, Ollama o TGI: no disponibles para esta arquitectura experimental en el momento de redactar esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (este) | 125B + 51B n-gram + 4B MTP | 6B | 262K | qwen-community-1.0 | GGUF (Q4_K_M) |
| Qwen3.8-27B (denso) | 27B | 27B | No disponible | qwen-community-1.0 | No disponible |
| Qwen3-235B-A22B (MoE) | 235B | 22B | No disponible | qwen-community-1.0 | No disponible |

La comparativa se limita a modelos de la misma familia Qwen. No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. El modelo destaca por su ratio de parametros activos extremadamente bajo (6B sobre 125B), lo que lo hace computacionalmente eficiente, y por su ventana de contexto de 262K tokens, superior a la mayoria de modelos abiertos.

## Limitaciones y advertencias

- La arquitectura `qwen4exp` solo es compatible con la rama del PR #27742 de llama.cpp. La rama principal no puede cargar el archivo GGUF, lo que limita su uso a entornos de desarrollo con esa rama especifica.
- El modelo es experimental (Qwen4-exp), por lo que puede presentar inestabilidades o comportamientos inesperados en produccion.
- El tamano del archivo (~120 GB) y los requisitos de memoria (~78 GB minimo) lo excluyen de la mayoria de equipos de consumo.
- La licencia qwen-community-1.0 es una licencia "other" en HuggingFace; es necesario revisar sus terminos especificos para uso comercial antes de desplegar el modelo en produccion.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones idiomaticas especificas del modelo.
- La cuantizacion Q4_K_M aplica fallbacks por tensor (Q5_0/q8_0) debido a que varias formas de tensor no son divisibles por 256, lo que puede afectar ligeramente a la calidad de la inferencia en esas capas.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas estandar no esta verificado.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/vumpt/Qwen3.8-Flash-Next-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- GGUF oficial de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Articulo de explainx.ai sobre el lanzamiento: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
- PR #27742 de llama.cpp (soporte qwen4exp): https://github.com/ggml-org/llama.cpp/pull/27742
