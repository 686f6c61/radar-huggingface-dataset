# trevdatastreams/typed-decider-qwen3.5-4b-base-nf4

## Resumen

`trevdatastreams/typed-decider-qwen3.5-4b-base-nf4` es una copia cuantizada en 4 bits (NF4 con doble cuantización de bitsandbytes) del modelo post-entrenado Qwen3.5-4B de Alibaba Qwen, publicada por el usuario trevdatastreams. No se trata de un modelo nuevo ni de un fine-tuning: es únicamente el artefacto base cuantizado, pensado para ser utilizado como cimiento (`base=`) del paquete separado `trevdatastreams/typed-decider-qwen3.5-4b`, que añade un adaptador RLCD y una cabeza de decisión. El repositorio contiene 4.539.265.536 parámetros en safetensors y ocupa 3,3 GB.

La relevancia de esta publicación es acotada y muy específica: sirve para reproducir el entorno de inferencia del proyecto typed-decider sin tener que cuantizar el modelo en cada carga. La model card indica que la verificación de desarrollo registró igualdad exacta con la carga NF4 al vuelo. No obstante, advierte de que la calidad de decisión cuantizada difiere de la de BF16 y remite al informe de evaluación del repositorio del adaptador.

El pipeline declarado es `image-text-to-text`, lo que sugiere que el Qwen3.5-4B subyacente es multimodal (entrada de imagen y texto). La licencia es Apache 2.0, heredada del modelo original, y el autor incluye la licencia original de Qwen en el repositorio. No se realizó entrenamiento adicional para esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 con doble cuantizacion (bitsandbytes, 4-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion bitsandbytes NF4) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B en su variante post-entrenada, identificada con la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. La arquitectura concreta (número de capas, cabezas, tipo de atención, mecanismos multimodales) no se detalla en la información disponible; solo se confirma la familia Qwen3.5 y el pipeline image-text-to-text. El tamaño de 4.539 millones de parámetros es coherente con un modelo denso de ~4B con vocabulario y embeddings multimodales añadidos.

Esta publicación no implica entrenamiento nuevo: es una conversión de pesos a NF4 de 4 bits con doble cuantización mediante bitsandbytes. La model card afirma que la verificación de desarrollo encontró igualdad exacta frente a la carga NF4 al vuelo, es decir, que el artefacto empaquetado reproduce el mismo resultado numérico que cuantizar en tiempo de carga. No se documentan datos de entrenamiento, composición del dataset, ni fases de RLHF/DPO en esta ficha; esa información correspondería a la model card original de Qwen3.5-4B, no incluida aquí.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-4B post-entrenado.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), según el pipeline declarado.
- Integración con `transformers` y bitsandbytes para carga en 4 bits.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidad de servir como base cuantizada para el adaptador RLCD y la cabeza de decisión del paquete `typed-decider-qwen3.5-4b`.
- No se documentan en la información disponible capacidades de tool calling, agentes, thinking mode, audio ni otros modos especiales.

## Casos de uso

- Reproducción del entorno typed-decider: descargar este repositorio en local y pasarlo como `base=` al paquete `trevdatastreams/typed-decider-qwen3.5-4b`, evitando recuantizar en cada arranque y garantizando la igualdad numérica con la carga NF4 al vuelo.
- Despliegue con memoria reducida: al ocupar 3,3 GB en safetensors NF4, permite cargar el modelo base de 4B en GPUs con menos VRAM que la versión BF16, útil para prototipado en estaciones de trabajo modestas.
- Evaluación comparativa de cuantización: sirve como referencia fija para medir la degradación de calidad del adaptador typed-decider frente a BF16, tal como indica la model card al remitir al informe de evaluación del adaptador.
- Pipeline de imagen-texto en investigación: al declarar `image-text-to-text`, puede emplearse para experimentos de comprensión de imágenes con texto en entornos con presupuesto de memoria ajustado.
- Base para fine-tuning con QLoRA: el formato NF4 de bitsandbytes es el estándar para adaptadores de bajo rango sobre modelos cuantizados, aunque el autor no lo documenta explícitamente.
- Servicio de inferencia ligero: integrable mediante `transformers` en un servidor con una sola GPU consumer, siempre que se acepte la pérdida de calidad asociada a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que la calidad de decisión cuantizada difiere de BF16 y remite al informe de evaluación del repositorio del adaptador, sin cifras en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 3,3 GB en NF4; en ejecución hay que sumar activaciones, caché KV y overhead de bitsandbytes, por lo que se estima un consumo en torno a 5-8 GB de VRAM para contextos moderados (estimación propia, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3090, RTX 4090, L4, A10G o A100 son opciones razonables; el modelo debería caber en GPUs consumer con 8 GB o más.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, sujeto a la longitud de contexto efectiva.
- Opciones de despliegue: `transformers` con bitsandbytes (soporte declarado); no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es NF4 de bitsandbytes, no GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| typed-decider-qwen3.5-4b-base-nf4 | 4.539 M | no disponible | NF4 4-bit | Apache 2.0 | Base cuantizada para el paquete typed-decider |
| Qwen/Qwen3.5-4B (original) | ~4B | no disponible | BF16 | Apache 2.0 (segun herencia) | Modelo post-entrenado completo, sin cuantizar |
| typed-decider-qwen3.5-4b | no disponible | no disponible | no disponible | no disponible | Incluye adaptador RLCD y cabeza de decisión |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: carece del adaptador RLCD y de la cabeza de decisión; usarlo solo no reproduce el comportamiento del sistema typed-decider.
- La cuantización NF4 degrada la calidad respecto a BF16; el autor lo advierte explícitamente y remite al informe de evaluación del adaptador.
- Idiomas soportados no documentados en esta ficha; la cobertura multilingüe dependerá del modelo base Qwen3.5-4B.
- Longitud de contexto no disponible; no se puede planificar el uso en tareas de contexto largo sin consultar la model card original.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B, no mitigado por esta cuantización.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia original de Qwen incluido en el repositorio.
- Fecha de creación registrada como 2026-10-27; verificar la vigencia del artefacto antes de usarlo en producción.
- Solo 28 descargas y 0 likes: ecosistema de validación muy limitado, sin evidencia comunitaria de robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trevdatastreams/typed-decider-qwen3.5-4b-base-nf4
- Paquete del adaptador: https://huggingface.co/trevdatastreams/typed-decider-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
