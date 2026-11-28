# unsloth/Inkling-2-Mini-unsloth-bnb-4bit

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones conversacionales, asistentes de código, sistemas agénticos con uso de herramientas y pipelines de generación aumentada por recuperación (RAG). Su arquitectura es de tipo Mixture of Experts (MoE), con 26.388.641.280 parámetros totales según los safetensors del repositorio.

El repositorio analizado aquí no es el checkpoint original, sino una cuantización de 4 bits en formato bitsandbytes NF4 con doble cuantización, publicada por Unsloth para facilitar el fine-tuning con su framework. El checkpoint original se distribuye en precisiones mixtas NVFP4 y MXFP8, con un tamaño aproximado de 20 GB; esta versión reduce la descarga a unos 15,6 GB al almacenar los pesos ya cuantizados, evitando la desquantización y recuantización en cada carga que exigiría el checkpoint original.

La relevancia de esta ficha radica en que permite ejecutar y ajustar un modelo multimodal MoE de 26B en hardware relativamente modesto: una NVIDIA DGX Spark o un equipo Apple Silicon con 32 GB de memoria unificada, según indica el autor del modelo. La cuantización preserva en 16 bits los componentes sensibles —embeddings, cabeza de salida, torre de visión, routers MoE y normas—, mientras que solo los expertos enrutados y las proyecciones de atención se almacenan en 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con bucle de iteración (`inkling2_loop`), atención con proyecciones de posición relativa y sumidero, y cabezas de predicción multi-token (MTP) en el checkpoint original |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 de 4 bits con doble cuantización (bitsandbytes); checkpoint original en NVFP4 y MXFP8 mixtos |
| Idiomas soportados | Inglés y soporte multilingüe general; lenguajes de programación múltiples |
| Licencia | Apache 2.0 (con Model Acceptable Use Policy adicional) |
| Formato de pesos | safetensors (transformers); requiere transformers 5.24 o superior |

## Arquitectura y entrenamiento

El modelo es un transformer MoE multimodal con 24 capas y 128 expertos por capa en las proyecciones `mlp.experts.gate_up_proj` y `mlp.experts.down_proj`. Incorpora un mecanismo de bucle (`inkling2_loop`) con compuertas de mensaje (`{q,k,v,mlp}_message_gate`) y consultas de mensaje, así como proyecciones de posición relativa y de sumidero en la atención. Dispone de una torre de visión con su módulo de fusión (merger) para el procesamiento de imágenes. El checkpoint original incluye además una cabeza de predicción multi-token (`mtp.safetensors`), que no se incluye en esta versión cuantizada porque transformers no la carga; está disponible en `unsloth/Inkling-2-Mini`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor indica que el modelo está pensado para uso en inglés y otros idiomas, y en múltiples lenguajes de programación, pero no detalla el proceso de alineación. La innovación técnica destacable de esta versión concreta es la cuantización selectiva: los expertos enrutados (12,62 GB) y las proyecciones de atención (0,33 GB) se almacenan en NF4, mientras que embeddings (0,93 GB), cabeza de salida (0,93 GB), torre de visión (0,64 GB), compuertas de mensaje (0,09 GB), routers MoE (0,03 GB) y normas (0,01 GB) permanecen en 16 bits. En GPUs bfloat16 (Ampere y posteriores) los pesos son idénticos bit a bit a los que Unsloth genera desde el checkpoint original con `load_in_4bit = True`, y el entrenamiento LoRA produce las mismas pérdidas. En GPUs solo float16, como la T4, la cuantización en carga parte de float16 y las pérdidas difieren ligeramente (primeros tres pasos con 2×T4: 0,477 / 0,957 / 0,817 desde este repositorio frente a 0,479 / 0,975 / 0,820 cuantizando en carga).

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones.
- Procesamiento de imágenes como entrada (pipeline `image-text-to-text`) mediante torre de visión dedicada.
- Razonamiento y tareas de lenguaje natural de propósito general.
- Generación de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y uso de herramientas (tool-use), según la descripción del autor.
- Integración en pipelines de generación aumentada por recuperación (RAG).
- Soporte multilingüe general, con inglés como idioma principal.
- Fine-tuning con LoRA mediante Unsloth sobre esta versión cuantizada.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistentes de código en producción: el modelo genera código en varios lenguajes y puede integrarse en asistentes de desarrollo o pipelines de CI/CD para sugerencias, revisión y generación de parches, aprovechando su soporte de tool-use.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con instrucciones y contexto conversacional; su naturaleza multimodal permite adjuntar capturas o documentos escaneados como imagen.
- Sistemas agénticos con herramientas: al estar diseñado para tool-use, puede orquestar llamadas a APIs y ejecutar razonamiento multi-paso en flujos de automatización.
- RAG sobre documentación técnica: combina recuperación de fragmentos con generación; la entrada de imagen permite procesar diagramas o páginas escaneadas junto al texto recuperado.
- Análisis de documentos e imágenes: extracción de información de capturas, gráficos o formularios mediante la torre de visión, con salida textual estructurada.
- Fine-tuning especializado en dominio: esta versión NF4 permite ajustar LoRA sobre el modelo con Unsloth en una sola GPU, por ejemplo para adaptar el asistente a un corpus interno o a un lenguaje de programación concreto.
- Prototipado en hardware de consumo: ejecución local en DGX Spark o Apple Silicon con 32 GB para pruebas de concepto sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Descarga del repositorio: aproximadamente 15,6 GB (frente a los 20,2 GB del checkpoint original).
- Inferencia oficial soportada por el autor del modelo: 1× NVIDIA DGX Spark y dispositivos Apple Silicon con 32 GB de memoria unificada.
- GPUs bfloat16 (Ampere y posteriores) recomendadas para que la cuantización coincida bit a bit con la generación en carga; GPUs solo float16 como la T4 funcionan pero con pérdidas ligeramente distintas en entrenamiento.
- Entrenamiento LoRA verificado por Unsloth en configuraciones de 2×T4 (float16) y GPUs bfloat16.
- Despliegue: transformers 5.24 o superior; carga mediante `FastModel.from_pretrained` de Unsloth con `load_in_4bit = True`.
- No se dispone de datos de latencia ni throughput.
- El checkpoint original en NVFP4/MXFP8 está pensado para ejecutarse en local; esta versión cuantizada reduce el espacio en disco y el tiempo de carga al evitar la recuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini (esta versión, NF4 4-bit) | 26,39B | no disponible | Texto + imagen | Apache 2.0 | Hugging Face (unsloth) |
| Inkling 2 Mini (original, NVFP4/MXFP8) | 26,39B | no disponible | Texto + imagen | Apache 2.0 | Hugging Face (thinkingmachines) |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- El soporte multilingüe se describe como "general", con inglés como idioma principal; el rendimiento en castellano no está documentado.
- La longitud de contexto no está especificada, lo que impide planificar cargas de contexto largo con precisión.
- La licencia Apache 2.0 permite uso comercial, pero el autor añade una Model Acceptable Use Policy que debe revisarse antes de desplegar en producción.
- Esta versión cuantizada no incluye la cabeza de predicción multi-token (`mtp.safetensors`); si se necesita, debe tomarse del repositorio `unsloth/Inkling-2-Mini`.
- En GPUs solo float16 (p. ej. T4) las pérdidas de entrenamiento difieren ligeramente respecto a la cuantización en carga desde bfloat16.
- El repositorio tiene 2.124 descargas y 5 likes en el momento de la consulta; es una cuantización de terceros (Unsloth), no el checkpoint oficial.
- Requiere transformers 5.24 o superior; versiones anteriores no cargarán el modelo.

## Enlaces

- Repositorio de esta versión: https://huggingface.co/unsloth/Inkling-2-Mini-unsloth-bnb-4bit
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Espejo del modelo base en Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini
- Guía de fine-tuning de Inkling 2 Mini: https://unsloth.ai/docs/models/inkling-2-mini/finetuning-inkling-2-mini
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
