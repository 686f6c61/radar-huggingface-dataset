# zurichquants/inkling-UD-Q2_K_XL-layers

## Resumen

El repositorio `zurichquants/inkling-UD-Q2_K_XL-layers` no contiene el modelo Inkling original, sino un paquete de capas GGUF (layer-package) preparado por Mesh LLM para ejecutar inferencia distribuida del modelo cuantizado `inkling-UD-Q2_K_XL` sobre un clúster local de máquinas. El modelo base es `unsloth/inkling-GGUF`, que a su vez deriva de Inkling, la familia de modelos multimodales de Thinking Machines Labs (fundada por exinvestigadores de OpenAI). Inkling está disponible en dos tamaños: Inkling-Small de 276B parámetros (12B activos) y el modelo grande de 975B parámetros (41B activos). Este paquete corresponde a la variante grande, cuantizada con el esquema dinámico `UD-Q2_K_XL` de Unsloth, que reduce el peso a unos 296 GB.

El paquete está diseñado para usarse con Mesh LLM, un framework de inferencia distribuida que reparte las capas del modelo entre varias máquinas, permitiendo ejecutar modelos que no caben en una sola GPU. Incluye un proyector multimodal (`mmproj-BF16.gguf`) para entrada de imágenes, lo que confirma que el modelo conserva sus capacidades de visión. El repositorio es experimental: la propia model card advierte que la integridad de los artefactos puede estar validada, pero la corrección del reparto y la certificación multimodal están pendientes. No está disponible en el catálogo público de Mesh LLM hasta que se revise su PR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal (texto, imagen, audio) con salida de texto |
| Parametros totales | 975B (modelo base, segun documentacion de Unsloth) |
| Parametros activos | 41B (modelo base, segun documentacion de Unsloth) |
| Longitud de contexto | 1M tokens (segun documentacion de Unsloth) |
| Tipos de cuantizacion | UD-Q2_K_XL (cuantizacion dinamica de Unsloth) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (segun documentacion de Unsloth) |
| Formato de pesos | GGUF (layer-package para Mesh LLM) |

## Arquitectura y entrenamiento

El modelo base Inkling es un transformer de mezcla de expertos (MoE) con 66 capas y ancho de activacion de 6144, segun los metadatos del paquete. La variante grande tiene 975B parametros totales y 41B activos por token, lo que permite un coste de inferencia relativamente bajo para su tamano. El modelo es nativamente multimodal: acepta texto, imagen y audio como entrada, y genera texto como salida. El entrenamiento incluye datos de texto, vision y audio, aunque no se han publicado detalles especificos sobre la composicion del dataset ni sobre el uso de RLHF o DPO en la informacion disponible.

El paquete `inkling-UD-Q2_K_XL` aplica la cuantizacion dinamica de Unsloth (Dynamic 3.0), que selecciona el tipo de cuantizacion optimo para cada capa del modelo, en este caso con un objetivo de calidad Q2_K_XL. El resultado es un archivo GGUF de aproximadamente 296 GB, dividido en 8 fragmentos. Mesh LLM lo ha transformado en un layer-package: cada capa del transformer se almacena como un artefacto separado (`layers/layer-*.gguf`), junto con los embeddings, el output head y el proyector multimodal. Esto permite distribuir las capas entre multiples maquinas y ejecutar la inferencia de forma colaborativa.

## Capacidades

- Generacion de texto: el modelo produce texto coherente y contextualizado, con capacidad de razonamiento y respuesta a instrucciones complejas.
- Razonamiento y matematicas: al ser un modelo de 975B con 41B activos, se espera un rendimiento solido en tareas de logica, aritmetica y resolucion de problemas, aunque no se han publicado benchmarks especificos.
- Generacion de codigo: soporta la creacion de funciones y scripts en multiples lenguajes, como se muestra en el ejemplo de la model card (funcion hello-world en Rust).
- Multimodalidad: acepta imagenes y audio como entrada adicional al texto, gracias al proyector `mmproj-BF16.gguf` incluido en el paquete. Puede describir imagenes, responder preguntas visuales y procesar audio.
- Soporte de tool calling y function calling: no se menciona explicitamente en la informacion disponible, pero es una capacidad comun en modelos de esta generacion; no se puede confirmar.
- Soporte de agentes y multi-step reasoning: no se documenta en la informacion proporcionada; se requiere verificacion.
- Capacidades multilingues: no se especifican los idiomas soportados; se desconoce el alcance.
- Inferencia distribuida: gracias al layer-package de Mesh LLM, el modelo puede ejecutarse en un cluster de maquinas, repartiendo las capas entre nodos.

## Casos de uso

- Inferencia local privada: el paquete permite ejecutar un modelo de 975B en hardware propio sin enviar datos a la nube. Se usa con `mesh-llm serve --model "meshllm/inkling-UD-Q2_K_XL-layers" --split` en cada maquina que contribuya memoria y computacion.
- Servicio OpenAI-compatible en local: Mesh LLM expone una API `/v1/chat/completions` compatible con OpenAI, por lo que se puede integrar en aplicaciones existentes que ya usan la API de OpenAI, simplemente cambiando la URL base a `http://localhost:3131/v1`.
- Procesamiento de documentos con imagenes: gracias al proyector multimodal, el modelo puede analizar capturas de pantalla, diagramas o fotografias incluidas en prompts de texto, util para extraer informacion de documentos escaneados o interfaces de usuario.
- Asistente de codigo en entornos aislados: al ejecutarse localmente, se puede usar como asistente de programacion sin filtrar codigo propietario a servicios externos, generando funciones, explicando fragmentos o depurando errores.
- Investigacion academica: permite a grupos de investigacion con varios servidores ejecutar un modelo de gran tamano para experimentos de generacion de texto, razonamiento o evaluacion de capacidades, sin depender de APIs comerciales.
- Prototipado de aplicaciones multimodales: el modelo puede recibir audio e imagenes, por lo que sirve para prototipar asistentes que transcriban o describan contenido audiovisual, siempre que se gestione la entrada de audio adecuadamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete remite a la ficha del modelo base `unsloth/inkling-GGUF` para notas de evaluacion, pero no se incluyen datos concretos en este repositorio. No se dispone de cifras de MMLU, HumanEval, GSM8K ni otras pruebas estandar.

## Requisitos de hardware

- Tamano del paquete: 296.5 GB (el repositorio ocupa 318.4 GB). No cabe en una sola GPU de consumo; se necesita un cluster de maquinas o multiples GPUs de alta capacidad.
- VRAM estimada: con cuantizacion Q2, el modelo ocupa aproximadamente 296 GB en memoria. Para cargarlo completo en una sola maquina se necesitarian al menos 4 GPUs de 80 GB (por ejemplo, 4x A100/H100) o 8 GPUs de 40 GB.
- GPU recomendadas: A100 80GB, H100 80GB o similares. No es viable en GPUs de consumo como RTX 4090 (24 GB) de forma individual.
- Opciones de despliegue: Mesh LLM es el framework principal, con soporte para distribuir capas entre maquinas. Tambien se puede usar llama.cpp u otros motores que soporten GGUF, pero el formato layer-package esta pensado para Mesh LLM.
- Latencia y throughput: no se han publicado mediciones. Al ser un modelo MoE con 41B activos, la latencia por token dependera del hardware y del numero de nodos; se espera un throughput moderado en configuraciones distribuidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas en la informacion proporcionada. El modelo base Inkling compite con otros modelos MoE de gran tamano como Kimi K3 (2.8T parametros) o DeepSeek-V3, pero no hay cifras verificables en este repositorio. La comparativa se limita a las diferencias estructurales:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling (grande) | 975B | 41B | 1M | Apache 2.0 | GGUF (este paquete) |
| Inkling-Small | 276B | 12B | 1M | Apache 2.0 | GGUF (disponible en Unsloth) |
| Kimi K3 | 2.8T | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Paquete experimental: la model card advierte que la integridad de los artefactos puede estar validada, pero la correccion del reparto de capas y la certificacion multimodal estan pendientes. No se recomienda para produccion sin pruebas previas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento o hechos especificos.
- Sesgos: no se han documentado sesgos especificos, pero al ser un modelo entrenado con datos web, puede reflejar sesgos sociales y culturales presentes en esos datos.
- Limitaciones de idioma: no se especifican los idiomas soportados; el rendimiento en lenguas distintas del ingles puede ser inferior.
- Requisitos de hardware elevados: el modelo necesita un cluster de maquinas o multiples GPUs de gran tamano; no es adecuado para entornos con recursos limitados.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el paquete en si no declara una licencia explicita en su model card; se debe verificar la licencia del modelo base y de Mesh LLM antes de un uso comercial.
- Dependencia de Mesh LLM: el formato layer-package no es compatible con otros motores de inferencia sin conversion previa; limita la portabilidad.

## Enlaces

- Repositorio del paquete: https://huggingface.co/zurichquants/inkling-UD-Q2_K_XL-layers
- Modelo base GGUF: https://huggingface.co/unsloth/inkling-GGUF
- Documentacion de Unsloth sobre Inkling: https://unsloth.ai/docs/models/inkling
- Documentacion de Unsloth sobre GGUFs dinamicos: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Sitio web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Catalogo de paquetes de Mesh LLM: https://huggingface.co/datasets/meshllm/catalog
- Especificacion del formato layer-package: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Guia sobre Inkling de Thinking Machines: https://sanj.dev/post/inkling-model-guide-2026/
