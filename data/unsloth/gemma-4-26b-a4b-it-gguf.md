# unsloth/gemma-4-26B-A4B-it-GGUF

## Resumen

Gemma 4 26B A4B es un modelo de lenguaje multimodal de código abierto desarrollado por Google DeepMind y publicado bajo licencia Apache 2.0. Este repositorio concreto, mantenido por Unsloth, ofrece la versión cuantizada en formato GGUF del modelo instruido `google/gemma-4-26B-A4B-it`, pensada para ejecución local eficiente con llama.cpp, Ollama y otros motores compatibles. El modelo combina una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos, lo que permite un rendimiento elevado con un coste computacional reducido en inferencia.

La relevancia de este modelo radica en su versatilidad: admite entrada de texto e imagen, ofrece una ventana de contexto de hasta 256.000 tokens, soporta más de 140 idiomas e incorpora capacidades nativas de razonamiento configurable, function calling y uso como agente autónomo. Su licencia Apache 2.0 lo hace especialmente atractivo para uso comercial y despliegue en producción. La versión GGUF de Unsloth incluye cuantizaciones optimizadas con imatrix y soporte para MTP (multi-token prediction), lo que facilita su ejecución en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atencion hibrida (sliding window + global) |
| Parametros totales | 26.000 millones (26B) |
| Parametros activos | 4.000 millones (4B) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | Multiples cuantizaciones GGUF (consultar repositorio; incluye versiones con imatrix) |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` emplea una arquitectura MoE con 26B parametros totales y 4B activos por token. La atencion es hibrida: intercala capas con ventana deslizante local (sliding window) con capas de atencion global, garantizando que la ultima capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales comparten claves y valores unificados (unified Keys and Values) y aplican RoPE proporcional (p-RoPE). El modelo incluye un encoder de vision de aproximadamente 550 millones de parametros para procesamiento de imagenes con resolucion y relacion de aspecto variables. No incorpora encoder de audio en este tamano (solo los modelos E2B y E4B lo incluyen).

El modelo esta disponible en variantes preentrenada e instruida; esta ultima (sufijo `-it`) ha sido afinada para seguir instrucciones y soporta un modo de pensamiento configurable. No se han publicado en la informacion disponible datos especificos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el metodo de alineacion (RLHF, DPO, etc.). El repositorio de Unsloth anade cuantizacion GGUF con imatrix y soporte para MTP, que mejora la velocidad de decodificacion.

## Capacidades

- Generacion de texto y razonamiento: disenado como un razonador de alto nivel con modo de pensamiento configurable (thinking mode).
- Comprension de imagenes: entrada multimodal de texto e imagen con soporte de resolucion variable y relacion de aspecto ajustable.
- Function calling nativo: soporte integrado para llamadas a funciones, habilitando integraciones con APIs y herramientas externas.
- Capacidades de agente: apto para flujos de trabajo autonomos multi-paso gracias a su razonamiento y soporte de herramientas.
- Multilingue: mas de 140 idiomas soportados.
- Contexto largo: ventana de 256.000 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Soporte nativo del rol `system` en la plantilla de chat, permitiendo conversaciones mas estructuradas.
- Compatible con MTP (multi-token prediction) para acelerar la generacion.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (256K tokens) y acceso a historiales completos, integrando function calling para consultar bases de datos de pedidos o sistemas CRM.
- Analisis de documentos tecnicos con imagenes: al aceptar entrada de imagen, permite procesar manuales, diagramas o capturas de pantalla junto con texto, extrayendo informacion relevante para resumir o responder preguntas.
- Generacion y revision de codigo en produccion: con soporte de function calling y razonamiento, puede integrarse en pipelines de CI/CD para generar tests, revisar parches o autocompletar implementaciones.
- Asistentes de investigacion multilingue: su soporte de 140+ idiomas y contexto largo lo hace util para sintetizar articulos cientificos o informes en varios idiomas, manteniendo coherencia global.
- Agentes autonomos de automatizacion de tareas: puede actuar como agente que planifica y ejecuta pasos (buscar informacion, llamar APIs, generar informes) usando su modo de razonamiento y function calling.
- Despliegue local en entornos con recursos limitados: gracias a su arquitectura MoE con solo 4B activos y las cuantizaciones GGUF, puede ejecutarse en una GPU de consumo (16-24 GB VRAM) para prototipado rapido o aplicaciones offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras en benchmarks de codificacion y capacidades agénticas, pero no proporciona cifras concretas. Se recomienda consultar la documentacion oficial de Google DeepMind para datos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion GGUF Q4_K_M, los pesos ocupan aproximadamente 14-15 GB (26B parametros a ~4.5 bits). Anadiendo cache KV y activaciones, se recomienda al menos 16-20 GB de VRAM para contexto moderado. Con contexto de 256K, la memoria de cache KV crece significativamente.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs de 16 GB (RTX 4080, RTX 3080 Ti) puede ejecutarse con cuantizaciones mas agresivas (Q3_K_M) y contexto reducido.
- En CPU: puede ejecutarse con llama.cpp usando cuantizaciones Q4_K_M o inferiores, aunque la velocidad sera limitada (depende de RAM y ancho de banda).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-inference (TGI) y Unsloth Studio.
- Latencia y throughput: no disponibles. La arquitectura MoE con 4B activos reduce el coste por token frente a un modelo denso de 26B, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (este) | 26B | 4B | 256K | Apache 2.0 | Texto + imagen |
| Qwen2.5-32B-A3B | 32B | 3B | 128K | Apache 2.0 | Texto |
| Gemma 3 27B | 27B (denso) | 27B | 128K | Apache 2.0 | Texto + imagen |
| Mixtral 8x7B | 47B | 12B | 32K | Apache 2.0 | Texto |

El modelo de Gemma 4 destaca por su contexto de 256K (el doble que Qwen2.5-32B-A3B) y su naturaleza multimodal, mientras que Mixtral 8x7B tiene mas parametros activos y contexto mucho menor. No se dispone de benchmarks comparativos publicados en la informacion recopilada.

## Limitaciones y advertencias

- No se han publicado en la informacion disponible evaluaciones detalladas de sesgos o riesgos de alucinacion. Como modelo generativo, puede producir contenido inexacto o inventado, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- La ventana de contexto de 256K es teorica; en la practica, el rendimiento puede degradarse en los extremos del contexto y el coste de memoria de la cache KV es elevado.
- Este tamano (26B A4B) no soporta entrada de audio ni video (solo los modelos E2B y E4B los incluyen). La entrada se limita a texto e imagen.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos adicionales de la licencia de Gemma 4 de Google (enlace en la model card) para asegurar conformidad.
- Las cuantizaciones GGUF pueden introducir perdida de precision en tareas de razonamiento o generacion de codigo. Se recomienda probar varias cuantizaciones para validar la calidad en el caso de uso concreto.
- Al ser un modelo MoE, el uso de memoria en inferencia depende de los parametros totales (26B), no de los activos, por lo que el espacio en disco y RAM/VRAM para los pesos es similar al de un modelo denso de 26B.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Coleccion de Gemma 4 de Unsloth: https://huggingface.co/collections/unsloth/gemma-4
- Guia de Unsloth para ejecutar Gemma 4: https://unsloth.ai/docs/models/gemma-4
- Guia de Unsloth para fine-tuning de Gemma 4: https://unsloth.ai/docs/models/gemma-4/train
- Blog de lanzamiento de Google: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
