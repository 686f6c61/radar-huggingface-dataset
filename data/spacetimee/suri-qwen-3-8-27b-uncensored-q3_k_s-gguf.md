# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q3_K_S-GGUF

## Resumen

SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q3_K_S-GGUF es una version cuantizada en formato GGUF del modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, un modelo de lenguaje de aproximadamente 26,9 mil millones de parametros. La conversion la ha realizado el propio autor SpaceTimee utilizando llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, un proceso automatico que no implica reentrenamiento ni ajuste adicional: unicamente transforma los pesos originales al formato GGUF y aplica la cuantizacion Q3_K_S.

El modelo se presenta como una variante "uncensored" (sin censura), lo que en la practica indica que ha sido sometido a algun proceso de eliminacion o atenuacion de los mecanismos de rechazo y filtrado de contenido respecto a su modelo de origen. El nombre comercial sugiere una base de la familia Qwen, aunque la informacion proporcionada no confirma la arquitectura subyacente ni el linaje exacto del entrenamiento.

Su relevancia practica radica en dos factores: el tamano del repositorio (12,1 GB) y la cuantizacion Q3_K_S, que permiten ejecutar un modelo de casi 27.000 millones de parametros en GPUs de consumo con 16-24 GB de VRAM mediante llama.cpp. El modelo no registra descargas ni likes en el momento de la consulta, y no se han publicado especificaciones de contexto, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Qwen; no confirmado) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_S (unico archivo publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

Datos adicionales verificables: tamano del repositorio 12,1 GB, libreria declarada transformers, pipeline no disponible, tags gguf y llama-cpp, fecha de creacion 2026-09-24 y ultima actualizacion 2026-09-24.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF, DPO u otras) del modelo base SpaceTimee/Suri-Qwen-3.8-27B-Uncensored. La model card de esta variante GGUF remite explicitamente a la model card del modelo original para obtener detalles, y unicamente documenta el proceso de conversion.

La informacion tecnica confirmada es exclusivamente la relativa al proceso de cuantizacion: los pesos originales fueron convertidos a GGUF mediante la herramienta GGUF-my-repo de ggml.ai, que emplea llama.cpp. La designacion Q3_K_S corresponde a una cuantizacion de tipo k-quant con 3 bits por peso aproximadamente y configuracion "small", lo que explica que un modelo de 26,9 B de parametros ocupe 12,1 GB. No se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, mecanismos hibridos SSM, etc.).

## Capacidades

- Generacion de texto en formato GGUF, ejecutable con llama.cpp y derivados.
- El sufijo "uncensored" indica un comportamiento con menor tendencia al rechazo de peticiones; no se detalla el metodo aplicado ni su alcance.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso explicito.
- No se confirma modo "thinking" ni capacidades de vision, audio o multimodalidad.
- Capacidades multilingues: no disponibles.
- Capacidades de codigo y matematicas: no confirmadas en la informacion proporcionada.

## Casos de uso

- Ejecucion local en hardware de consumo: con 12,1 GB de pesos, el modelo puede cargarse en GPUs de 16-24 GB mediante llama.cpp, lo que permite disponer de un modelo de ~27 B sin depender de servicios en la nube ni de conexion a internet.
- Procesamiento de datos sensibles on-premise: al ejecutarse de forma totalmente local, es adecuado para analisis de documentos internos, contratos o registros que no pueden salir de la infraestructura de la organizacion.
- Generacion de contenido creativo sin restricciones editoriales: la naturaleza "uncensored" lo hace util para ficcion, narrativa adulta y guiones donde los filtros de otros modelos suelen bloquear o reformular el texto. Requiere revision humana y cumplimiento normativo.
- Investigacion sobre alineacion y seguridad: permite estudiar empiricamente el comportamiento de un modelo con los mecanismos de rechazo atenuados, comparandolo con su version base o con modelos alineados.
- Prototipado offline y entornos sin conectividad: util en desarrollo de aplicaciones en redes aisladas, laboratorios o despliegues embarcados donde no hay acceso a APIs externas.
- Asistente conversacional personal: puede servir como base para un chatbot local con personalidad propia, integrado en aplicaciones de escritorio mediante llama-server con una ventana de contexto configurable (el ejemplo de la model card usa -c 2048).
- Experimentacion con pipelines GGUF: sirve como banco de pruebas para medir rendimiento de cuantizaciones Q3_K_S en distintas GPUs y comparar calidad frente a cuantizaciones mayores del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,1 GB solo para los pesos en Q3_K_S. Con cache KV y overhead del runtime, el consumo realista se situa en el entorno de 13-15 GB para contextos cortos.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) ejecutan el modelo con holgura y permiten contextos amplios. RTX 4080, 4070 Ti Super, 4060 Ti de 16 GB y A4000 (16 GB) pueden ejecutarlo con contextos reducidos. A100 y H100 son sobredimensionadas para esta cuantizacion, aunque utiles si se requiere mucho contexto o batching.
- GPU de consumo: si cabe en GPUs de 16 GB o mas. En tarjetas de 12 GB (RTX 3060 12 GB, 4070) es necesario descargar parcialmente capas a CPU (offloading), con la consiguiente perdida de velocidad.
- Memoria unificada: los equipos Apple Silicon con 16 GB o mas (M1 Pro/Max, M2/M3/M4 con suficiente RAM) pueden ejecutarlo integramente, dado que llama.cpp esta optimizado para Metal.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por compatibilidad de formato GGUF, tambien Ollama, LM Studio, koboldcpp y text-generation-webui. vLLM y TGI no son la via natural para GGUF, aunque vLLM dispone de soporte experimental parcial.
- Latencia y throughput: no disponibles. Dependeran fuertemente del hardware, del grado de offloading a CPU y de la longitud de contexto configurada.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Uncensored Q3_K_S (este) | 26,9 B | no disponible | GGUF Q3_K_S | no disponible | publicado |
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored (base) | 26,9 B | no disponible | safetensors | no disponible | publicado |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

Se recomienda consultar la model card del modelo base para obtener informacion adicional sobre el linaje y comparaciones, si estuvieran publicadas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican licencia, idiomas, contexto, arquitectura ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para produccion.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue.
- Naturaleza "uncensored": la atenuacion de los mecanismos de rechazo aumenta el riesgo de generar contenido inapropiado, ofensivo, ilegal o factualmente erroneo. Requiere filtros externos y supervision humana si se expone a usuarios finales.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano y, en principio, no mitigado por la cuantizacion. La falta de benchmarks impide cuantificarlo.
- Perdida de calidad por cuantizacion: Q3_K_S es una cuantizacion agresiva de 3 bits. Suele implicar degradacion de calidad respecto a los pesos originales en tareas de razonamiento, matematicas y codigo, aunque no se aportan mediciones concretas.
- Limitaciones de contexto e idioma: no disponibles. El ejemplo oficial de llama-server usa -c 2048, lo que sugiere que el autor no garantiza ventanas grandes en este formato.
- Conversion automatizada: al proceder de GGUF-my-repo, no hay garantia de validacion manual de la conversion ni de la integridad de los pesos cuantizados.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de defectos no detectados.
- Fecha de publicacion poco comun (2026-09-24) segun los metadatos proporcionados; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q3_K_S-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
