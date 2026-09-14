# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-DYNAMIC-pr3118-validation

## Resumen

Este repositorio no es un modelo nuevo entrenado desde cero, sino un artefacto de validación: una cuantización en FP8 con escalado dinámico (FP8Dyn) del modelo denso Qwen/Qwen3.8-27B, junto con su módulo MTP (multi-token prediction) cuantizado con un esquema sin datos. Lo publica el usuario soyrsoyr y su propósito declarado es demostrar que el checkpoint carga y genera en H100 obteniendo métricas reales de tokens borrador (draft tokens) en decodificación especulativa. El autor indica explícitamente que esto no constituye un benchmark de calidad ni de rendimiento.

El modelo ocupa 27.320.697.856 parámetros (dato real de safetensors, aproximadamente 27,3 mil millones) y el repositorio pesa 35,5 GB. Se distribuye en safetensors para la librería transformers, con licencia apache-2.0 heredada del modelo base, y está etiquetado como compatible con endpoints (endpoints_compatible) y como image-text-to-text, además de text-generation. La cuantización se generó con una implementación concreta de llm-compressor (PR 3118, commit 87347881 del fork soyr-redhat) y formato compressed-tensors.

Su relevancia es práctica y muy acotada: sirve a quien quiera desplegar Qwen3.8-27B en FP8 con vLLM activando decodificación especulativa MTP, y a quien necesite reproducir o auditar el pipeline de cuantización del PR 3118. No aporta pesos nuevos, ni datos de entrenamiento, ni evaluación de calidad: aporta un entorno validado (vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0) y un script de verificación (verify_mtp.py).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El repositorio etiqueta la arquitectura como qwen3_5 y hereda la de Qwen/Qwen3.8-27B; la model card no describe capas ni tipo de atención |
| Parametros totales | 27.320.697.856 (≈27,3 mil millones, dato real de safetensors) |
| Parametros activos | No disponible; el repositorio no declara una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible. La validación se ejecutó con --max-model-len 1024, un límite de prueba, no la ventana nativa del modelo |
| Tipos de cuantizacion | FP8 dinámico (esquema del nombre del repo). La model card menciona además, en el contexto del PR 3118, NVFP4A16 (FP4 solo en pesos con activaciones de 16 bits, sin calibrar, no equivale a NVFP4 W4A4) y MXFP4 (con cuantización dinámica de activaciones) |
| Idiomas soportados | No disponible; el repositorio no declara idiomas |
| Licencia | apache-2.0 (la licencia de origen sigue siendo aplicable; esta validación no añade concesión de licencia alguna) |
| Formato de pesos | safetensors (librería transformers, formato compressed-tensors). Tamaño del repositorio: 35,5 GB |
| Modelo base | Qwen/Qwen3.8-27B, revisión 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |
| Modalidades de entrada | Etiquetado como image-text-to-text; la orden de servicio validada desactiva imagen y vídeo (--limit-mm-per-prompt '{"image":0,"video":0}') |
| Decodificacion especulativa | MTP (multi-token prediction), con num_speculative_tokens = 1 en la prueba validada |
| Runtime validado | vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0, sobre H100 |

## Arquitectura y entrenamiento

No hay entrenamiento en este repositorio. Se trata de un artefacto de cuantización con preservación de estructura: se parte del checkpoint Qwen/Qwen3.8-27B en una revisión fijada y se aplica un esquema de cuantización FP8 dinámico, sin datos de calibración, tanto al backbone como al módulo MTP. La model card señala que los formatos del backbone y del MTP son independientes entre sí, y remite a config.json, recipe.yaml (cuando está presente) y pr3118-validation.json para inspeccionar los detalles reales del formato. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO, porque no las hay: son pesos derivados.

La innovación técnica relevante es doble. Por un lado, el soporte de cuantización de un módulo MTP procedente de una fuente densa bajo un esquema sin datos, implementado en llm-compressor PR 3118 (commit 87347881 del fork soyr-redhat). Por otro, la verificación de que la decodificación especulativa MTP produce métricas positivas de tokens borrador con pesos cuantizados: el autor insiste en que una carga correcta del modelo no cuenta como aprobado, y que verify_mtp.py exige métricas positivas de draft tokens sobre dos prompts. La validación se realizó con --enforce-eager y --gpu-memory-utilization 0.85.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y las etiquetas incluyen conversational, con endpoints_compatible para servicio tipo API.
- Decodificación especulativa MTP: el checkpoint incluye un módulo MTP funcional que acelera la generación mediante tokens borrador; es la capacidad validada de forma explícita.
- Compatibilidad con compressed-tensors: los pesos se empaquetan en ese formato, lo que permite su carga por runtimes que lo soporten.
- Entrada multimodal (imagen, y vídeo según los límites configurables del runtime): el repositorio está etiquetado como image-text-to-text. Advertencia: la orden de servicio validada desactiva imagen y vídeo, por lo que esta capacidad no está verificada en este artefacto.
- Soporte de tool calling / function calling: no disponible; la información proporcionada no lo documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; la información proporcionada no lo documenta.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible; no se documentan.

## Casos de uso

- Despliegue en producción de Qwen3.8-27B sobre H100 en FP8: el artefacto está validado con una orden concreta de vLLM (--dtype bfloat16, --max-model-len 1024, --enforce-eager, --gpu-memory-utilization 0.85) y decodificación especulativa MTP, por lo que sirve como punto de partida reproducible para servir el modelo cuantizado.
- Reducción de coste por token mediante decodificación especulativa: activar --speculative-config '{"method":"mtp","num_speculative_tokens":1}' permite usar el módulo MTP como modelo borrador, lo que en teoría reduce el número de pasos de decodificación del backbone; conviene medir la ganancia real, ya que el autor no publica cifras de throughput.
- Auditoría y reproducción de pipelines de cuantización: al estar vinculado a llm-compressor PR 3118 y al commit 87347881, permite a un ingeniero de MLOps reproducir el esquema data-free y comparar configuraciones frente a NVFP4A16 o MXFP4 sobre el mismo backbone.
- Verificación automatizada en CI: verify_mtp.py exige métricas positivas de tokens borrador sobre dos prompts, por lo que encaja como test de regresión de humo en una tubería que actualice el runtime de vLLM o los pesos cuantizados.
- Servicio conversacional multi-turno en infraestructura propia: con licencia apache-2.0 y compatibilidad de endpoints, es desplegable en un clúster on-premise con H100 para asistentes internos, siempre que se valide antes la longitud de contexto real que se necesita.
- Comparación de esquemas de cuantización en investigación: el repositorio distingue explícitamente los formatos del backbone y del MTP, lo que facilita experimentos controlados sobre el impacto del formato en la aceptación de tokens especulativos.
- Base para validar multimodalidad: el etiquetado image-text-to-text sugiere entradas de imagen y vídeo, pero como la validación las desactiva, el caso de uso realista es precisamente comprobar si esa capacidad sobrevive a la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único resultado comunicado es cualitativo y de ejecución: la carga y la generación en H100 pasaron con métricas reales de tokens borrador MTP. El propio autor aclara que no es un benchmark de calidad ni de rendimiento, y no se aportan cifras de MMLU, HumanEval, GSM8K, latencia ni throughput. Tampoco se indica qué esquema MXFP4 requiere una validación en B200 que aún no está establecida.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 27,3 GB solo para los pesos FP8 (aproximadamente 1 byte por parámetro, cálculo estimado, no confirmado por el autor), más el módulo MTP y el espacio de trabajo del runtime.
- Tamaño en disco: 35,5 GB de repositorio, superior a los pesos estrictos porque incluye el MTP y ficheros auxiliares.
- GPU validada: H100, con --gpu-memory-utilization 0.85 y --enforce-eager. Es la única configuración confirmada.
- GPU recomendadas: H100 (validada); A100 de 80 GB y H200 como alternativas razonables por capacidad, aunque no están validadas. Para MXFP4 se menciona B200 como entorno pendiente de establecer compatibilidad en tiempo de ejecución.
- Cabe en GPU de consumo: no validado. Con ~27,3 GB de pesos FP8 más caché KV, una RTX 4090 de 24 GB no debería bastar; harían falta al menos 40-48 GB agregados en multi-GPU, o una cuantización adicional a 4 bits que este repositorio no ofrece.
- Opciones de despliegue: vLLM 0.29.1rc1.dev79+g767d1c4d4 es el runtime validado. No se mencionan llama.cpp, Ollama, TGI ni otras alternativas, y el formato compressed-tensors con FP8 dinámico limita los runtimes compatibles.
- Restricción práctica de memoria: los 1024 tokens de --max-model-len usados en la validación reducen mucho el consumo de caché KV; subir la ventana incrementará la VRAM necesaria de forma proporcional al número de secuencias concurrentes.
- Latencia y throughput: no disponibles. No se publican tokens por segundo, TTFT ni tasa de aceptación de tokens especulativos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de ninguno de los modelos de la tabla, por lo que la comparación es estructural y de disponibilidad, no de rendimiento.

| Modelo | Parametros | Cuantizacion | Contexto | MTP | Licencia | Notas |
|---|---|---|---|---|---|---|
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-DYNAMIC-pr3118-validation | 27,3 mil millones | FP8 dinámico, data-free | No disponible | Sí, cuantizado y validado en H100 | apache-2.0 | Artefacto de validación; 0 descargas y 0 likes; requiere runtime concreto |
| Qwen/Qwen3.8-27B (upstream) | No disponible en la información proporcionada | BF16 u otros según el repositorio original | No disponible | MTP de origen denso | apache-2.0 | Modelo base del que deriva este artefacto; sin datos de arquitectura en esta ficha |
| Alternativas comparables de terceros | No disponible | No disponible | No disponible | No disponible | No disponible | La búsqueda web no aportó resultados relacionados con el modelo |

## Limitaciones y advertencias

- No es un benchmark de calidad: el autor declara explícitamente que la prueba pasa si hay métricas positivas de tokens borrador, no si la calidad de las respuestas es buena. No hay ninguna evaluación de precisión, razonamiento o código.
- Cuantización sin calibración: al ser un esquema data-free, no hay garantía de que la distribución de activaciones esté bien ajustada; la degradación respecto al modelo en BF16 no está medida ni cuantificada.
- Entorno frágil: la validación depende de una versión concreta de vLLM (0.29.1rc1.dev79+g767d1c4d4), Transformers 5.17.0, CUDA 13.0 y una implementación de llm-compressor en un fork (PR 3118). Actualizar cualquiera de esas piezas invalida la reproducibilidad.
- Contexto corto en la prueba: --max-model-len 1024 no es una ventana de contexto utilizable en producción; se desconoce la longitud máxima real soportada tras la cuantización.
- Multimodalidad no verificada: pese a la etiqueta image-text-to-text, la ejecución validada desactiva imagen y vídeo, así que no hay evidencia de que esas entradas funcionen con estos pesos.
- Compatibilidad MXFP4 pendiente: la model card indica que MXFP4 requiere ejecutar en B200 para establecer compatibilidad, lo que implica que ese camino no está probado.
- Advertencia sobre NVFP4A16: no es NVFP4 W4A4 calibrado; es FP4 solo en pesos con activaciones de 16 bits. Confundir ambos formatos lleva a expectativas erróneas de ahorro de memoria.
- Riesgo de alucinación y sesgos: no disponibles; no hay evaluación publicada para este artefacto ni documentación de sesgos en la información proporcionada.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización el mismo día (14 de septiembre de 2026). No hay evidencia de uso en producción por terceros.
- Licencia: apache-2.0 se hereda del modelo base y esta validación no añade ninguna concesión adicional; conviene revisar la model card de Qwen/Qwen3.8-27B para las condiciones de uso comercial aplicables al modelo de origen.
- Idiomas no documentados: no se puede asumir cobertura multilingüe de ningún idioma concreto.
- Herramientas y agentes sin documentar: no hay constancia de soporte de tool calling, function calling ni flujos de agente.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-DYNAMIC-pr3118-validation
- Modelo base Qwen/Qwen3.8-27B (revisión fijada en la model card): https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Implementación de cuantización (llm-compressor, commit 87347881 del fork soyr-redhat): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos eran páginas de Zhihu sin relación con el modelo (juegos de mesa sobre educación financiera, teoría del flow en música, definición de Zhihu y auriculares Meizu), por lo que se descartan. No se dispone de paper, blog técnico, demo ni repositorio adicional verificable.
