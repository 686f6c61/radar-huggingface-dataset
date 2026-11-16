# speakleash/Bielik-4.5B-v3.0-Instruct-MLX-4bit

## Resumen

Bielik-4.5B-v3.0-Instruct-MLX-4bit es una versión cuantizada a 4 bits del modelo instructivo Bielik-4.5B-v3.0-Instruct, desarrollado por el proyecto SpeakLeash, una comunidad polaca centrada en la creación de recursos lingüísticos y modelos de lenguaje de código abierto para el idioma polaco. El modelo original parte de una arquitectura transformer tipo Llama con 4.757.260.288 parámetros totales (aproximadamente 4,76 mil millones), y esta variante está específicamente empaquetada en formato MLX para su ejecución eficiente en hardware Apple Silicon.

El problema que resuelve esta versión es doble: por un lado, ofrece un modelo instructivo especializado en polaco, un idioma con menor representación en los grandes modelos multilingües; por otro, reduce los requisitos de memoria mediante cuantización AWQ a 4 bits, lo que permite desplegar el modelo en equipos con recursos limitados, en particular Macs con chip M-series. El repositorio ocupa 3,2 GB, lo que refleja el ahorro frente a los pesos BF16 originales.

La relevancia actual radica en la combinación de un modelo afinado para instrucciones en polaco con un formato de cuantización calibrado (AWQ W4A16_ASYM con grupo de 32) y repackado a INT4 afín nativo de MLX. No obstante, la propia model card advierte de que no todas las pruebas de calidad superaron la comparación contra la versión BF16, lo que debe tenerse en cuenta en despliegues sensibles a la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama` y estructura de pesos) |
| Parametros totales | 4.757.260.288 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16_ASYM, group size 32, repackado a MLX affine INT4; escalas y sesgos afines en BF16; embeddings y lm_head en BF16 |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer tipo Llama, tal como indica el tag del repositorio y la estructura de proyecciones lineales descrita en la model card (siete proyecciones lineales por bloque transformer). El modelo base es Bielik-4.5B-v3.0-Instruct, del que esta variante hereda el tokenizador BF16 original y la plantilla de chat, preservados sin cambios durante la cuantización.

El proceso de cuantización aplicado es AWQ (Activation-aware Weight Quantization) en configuración W4A16_ASYM, con tamaño de grupo 32, posteriormente repackado a formato INT4 afín nativo de MLX. Las siete proyecciones lineales de cada bloque transformer se cuantizan a INT4, mientras que los embeddings, el lm_head y otros tensores no cuantizados por AWQ conservan precisión BF16. Las escalas y sesgos afines se almacenan en BF16, y se verifica que el error de redondeo de sesgos sea como máximo 1/16 de un paso de cuantización. La revisión del modelo fuente utilizada es `4b1220a9d745bdd874c44347075ef25484ef322b`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto en polaco con formato instructivo, heredado del modelo base Bielik-4.5B-v3.0-Instruct.
- Conversación multi-turno mediante la plantilla de chat original, preservada en la cuantización.
- Ejecución local en hardware Apple Silicon gracias al formato MLX 4-bit.
- Razonamiento y respuesta a instrucciones en el dominio del polaco (capacidad inferida del modelo instructivo base; no se detallan capacidades específicas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al polaco según el campo `language: pl`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistencia conversacional en polaco: el modelo puede gestionar diálogos multi-turno usando la plantilla de chat original; su tamaño de 4,76 mil millones de parámetros y su cuantización a 4 bits lo hacen viable en un Mac con memoria unificada moderada.
- Generación de texto en aplicaciones locales para Mac: al estar en formato MLX, se integra en flujos de trabajo nativos de Apple Silicon sin necesidad de GPUs dedicadas, lo que resulta útil para prototipos y herramientas de escritorio.
- Procesamiento de documentos en polaco: resumen, reescritura o extracción de información de textos en polaco en entornos con requisitos de privacidad, ejecutando el modelo en local.
- Educación y aprendizaje de polaco: generación de explicaciones, ejemplos y ejercicios en polaco para estudiantes, aprovechando el ajuste instructivo del modelo base.
- Investigación en PLN (procesamiento de lenguaje natural) para polaco: evaluación de técnicas de cuantización AWQ/MLX sobre modelos instructivos de tamaño medio, comparando la calidad frente a la versión BF16.
- Desarrollo de asistentes especializados de nicho: fine-tuning o adaptación posterior sobre la base cuantizada para dominios concretos (legal, administrativo) en polaco, con la ventaja de un despliegue ligero en hardware de consumo.
- Pruebas de regresión de calidad tras cuantización: la model card menciona un perfil de validación (`legacy-v3-geo`) con etiquetas congeladas de capitales internacionales y ocho casos geográficos preregistrados, útil como caso de uso para validar la degradación introducida por la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que "no todas las pruebas de calidad superaron la comparación contra BF16" y menciona un perfil de validación denominado `legacy-v3-geo` con etiquetas congeladas de capitales internacionales y ocho casos geográficos preregistrados, pero no se proporcionan métricas numéricas concretas.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el repositorio ocupa 3,2 GB en pesos MLX 4-bit; se recomienda al menos 5-6 GB de memoria unificada disponible para cargar el modelo y gestionar el contexto.
- GPU recomendadas: hardware Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) con soporte MLX; no está pensado para GPUs NVIDIA ni AMD en este formato.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada de 8 GB o superior; en el ecosistema NVIDIA requeriría conversión previa a otro formato (GGUF, safetensors estándar), no incluida en este repositorio.
- Opciones de despliegue: MLX (librería `mlx` y `mlx-lm`) es el entorno nativo; para otros entornos sería necesaria una reconversión del formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-4.5B-v3.0-Instruct-MLX-4bit (este) | 4,76 B | no disponible | pl | Apache 2.0 | MLX 4-bit safetensors |
| Bielik-4.5B-v3.0-Instruct (base BF16) | 4,76 B | no disponible | pl | Apache 2.0 | safetensors BF16 |
| Alternativas de ~4-5B para polaco | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (tamaño similar y especialización en polaco) en la documentación proporcionada. La comparación más directa es con el modelo base BF16 del que deriva, que ofrece mayor precisión a costa de mayor uso de memoria.

## Limitaciones y advertencias

- La model card advierte explícitamente de que no todas las pruebas de calidad superaron la comparación contra la versión BF16, por lo que puede haber degradación en tareas sensibles a la precisión numérica.
- El modelo está especializado exclusivamente en polaco (`language: pl`); su uso en castellano u otros idiomas no está soportado ni documentado.
- Riesgo de alucinación inherente a modelos de 4,76 mil millones de parámetros; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente; conviene revisar las condiciones del modelo base original.
- El formato MLX limita el despliegue a hardware Apple Silicon; para otros entornos es necesaria una reconversión.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar aplicaciones con ventanas largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
- Organización SpeakLeash: https://huggingface.co/speakleash
- Revisión del modelo fuente: `4b1220a9d745bdd874c44347075ef25484ef322b`
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
