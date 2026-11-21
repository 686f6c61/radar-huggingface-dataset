# Valen-Team/Valen-Decision-1.5-2B-GGUF

## Resumen

Valen-Decision-1.5-2B es un modelo multimodal de toma de decisiones (decision-making) desarrollado por Valen-Team, construido a partir de Qwen/Qwen3.5-2B. A diferencia de un modelo conversacional generativo convencional, su función es clasificar y puntuar entradas de texto e imagen: devuelve probabilidades sobre opciones predefinidas (`choice`), puntuaciones (`score`), etiquetas de predicado (`noul`) y cajas delimitadoras (`bbox`) en una sola pasada hacia delante. Está pensado para tareas como clasificar mensajes de clientes, verificar si una imagen cumple requisitos o identificar acciones en vídeo.

El modelo cuenta con 1.888.668.781 parámetros en pesos nativos (safetensors) y se distribuye aquí en formato GGUF para un runtime propio de llama.cpp (versión 0.2.0), con ficheros de texto F32 y Q8_0 más un fichero de visión separado. Incorpora dos innovaciones técnicas respecto a un transformer causal estándar: atención bidireccional por bloques (block-bidirectional attention) y una cabeza de grounding para cajas delimitadoras, lo que permite resolver todas las preguntas de una petición en un único forward pass.

La relevancia actual del modelo radica en su enfoque de "decisión estructurada" frente a la generación libre: al devolver distribuciones de probabilidad sobre criterios definidos por el usuario, facilita la integración en pipelines deterministas (routing de tickets, screening de imágenes, etiquetado de vídeo) y permite aplicar políticas de incertidumbre. La licencia Apache 2.0 y la disponibilidad de código de entrenamiento facilitan su adopción y ajuste fino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-2B, con atención bidireccional por bloques y cabeza de grounding bbox; runtime GGUF propio (Valen llama.cpp 0.2.0) |
| Parámetros totales | 1.888.668.781 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de servido usa `-c 4096`) |
| Tipos de cuantización | F32 y Q8_0 (texto); F32 para visión (`vision-native-limits-F32.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (runtime propio); pesos nativos safetensors disponibles en el repo base Valen-Decision-1.5-2B; también ONNX en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal, y le añade dos modificaciones descritas por el autor: atención bidireccional por bloques (block-bidirectional attention) y una cabeza de grounding para cajas delimitadoras. El resultado es que una única pasada hacia delante devuelve, simultáneamente, probabilidades para preguntas de tipo predicado, `choice` y `score`, y una caja para cada pregunta `bbox`. El modelo se sirve mediante un runtime propio basado en llama.cpp (versión 0.2.0) que expone los endpoints `/v1/systemone` y `/v1/decisions`, con soporte de texto e imagen.

Los datos de entrenamiento de Valen-Decision-1.5 no son públicos, según indica el autor. No se especifican el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras. El autor publica el código de entrenamiento en GitHub para permitir el ajuste fino sobre datos propios. La familia completa incluye cinco tamaños (0.8B, 2B, 4B, 9B y 27B), cada uno en tres formatos: pesos nativos para Transformers, ONNX y GGUF.

## Capacidades

- Clasificación de texto con salida probabilística sobre opciones definidas por el usuario (`choice`).
- Puntuación (`score`) de entradas según criterios configurables.
- Etiquetado de predicados (`noul`) para identificar acciones o atributos.
- Grounding visual: devuelve cajas delimitadoras (`bbox`) para objetos o regiones de una imagen, con confianza asociada.
- Entrada imagen-texto: procesa texto e imágenes de forma conjunta (pipeline `image-text-to-text`).
- Evaluación de múltiples preguntas en una sola pasada hacia delante, con probabilidades candidatas por pregunta.
- Salida estructurada tipada (`image-text-to-typed-output`, `structured-output`), adecuada para consumo programático.
- Soporte de estado compartido (`shared-state`) entre preguntas de una misma petición.
- Identificación de acciones en vídeo (según la descripción del autor, mediante procesamiento de fotogramas).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito (thinking).

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica el mensaje del cliente con preguntas `choice` (por ejemplo, categoría y urgencia) y devuelve probabilidades que permiten decidir el enrutado automático frente a la revisión humana según un umbral de confianza. El cookbook oficial incluye un tutorial específico de ticket routing.
- Triaje de sentimiento y feedback: con una pregunta `choice` de sentimiento (positivo/negativo) y una `score` de intensidad, se puede priorizar la cola de atención al cliente sin necesidad de generar texto.
- Screening de imágenes de producto: mediante preguntas `bbox` y `choice`, se verifica si una imagen cumple requisitos (presencia de producto, encuadre, elementos prohibidos) y se localizan las regiones relevantes con cajas delimitadoras.
- Etiquetado de vídeo: identificación de acciones en fotogramas para indexado o moderación de contenido, según el tutorial de video tagging del cookbook.
- Moderación de contenido estructurada: evaluación de mensajes o imágenes contra criterios definidos por política, con salida probabilística auditable en lugar de texto libre.
- Extracción de atributos para enriquecimiento de catálogo: uso de preguntas `noul` y `score` para asignar predicados (color, categoría, estado) a partir de texto e imagen en una sola petición.
- Despliegue en CPU sin GPU: el runtime 0.2.0 está disponible para Linux x86-64 con AVX2/FMA/F16C/BMI2, lo que permite servir el modelo Q8_0 (1,90 GiB) en infraestructura sin acelerador, útil para entornos de borde o pruebas.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se documenta una comparación de fidelidad entre el runtime GGUF 0.2.0 y la inferencia nativa `model.predict` en FP32, sobre seis peticiones (texto, imagen y cuatro `bbox`), con recuento de tokens idéntico en todas ellas. El umbral de aceptación de la release es una diferencia de probabilidad máxima de 0,08.

| Fichero | Diferencia máx. probabilidad | Diferencia máx. caja | Diferencia máx. confianza bbox |
|---|---:|---:|---:|
| F32 | 0,00262 | 0,1011 | 0,0863 |
| Q8_0 | 0,01092 | 0,0992 | 0,0856 |

El autor menciona un "Decision Index" como métrica de evaluación, con puntuaciones crecientes según el tamaño (0.8B < 2B < 4B < 9B < 27B), pero no se proporcionan los valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero de texto Q8_0 ocupa 1,90 GiB y el F32 7,05 GiB; el fichero de visión F32 ocupa 1,23 GiB. Para texto e imagen se necesitan ambos ficheros.
- GPU: el runtime documentado en esta ficha es de CPU (Linux x86-64, AVX2/FMA/F16C/BMI2, glibc 2.35+). No se documentan requisitos ni soporte de GPU en la información disponible.
- GPU de consumo: no disponible; el servido descrito usa `-ngl 0` (sin capas en GPU).
- Despliegue: runtime propio Valen llama.cpp 0.2.0 (`./serve`), con endpoints `/v1/systemone` y `/v1/decisions`. También hay pesos nativos para Transformers y ONNX. No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp estándar.
- Latencia y throughput: no disponibles. El ejemplo de servido usa `-t 4 --parallel 1`, `-c 4096 -b 4096 -ub 4096`.
- Alternativa sin instalación: API HTTP gratuita y demo web del autor, que sirven los tamaños 0.8B, 2B y 4B.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación más directa es con el resto de la familia Valen-Decision-1.5, que comparte arquitectura y licencia y se diferencia por tamaño y puntuación en el Decision Index.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Valen-Decision-1.5-0.8B | no disponible | no disponible | Apache 2.0 | nativo, ONNX, GGUF | Menor coste, menor Decision Index |
| Valen-Decision-1.5-2B | 1.888.668.781 | no disponible | Apache 2.0 | nativo, ONNX, GGUF | Este modelo |
| Valen-Decision-1.5-4B | no disponible | no disponible | Apache 2.0 | nativo, ONNX, GGUF | Mayor Decision Index que 2B |
| Valen-Decision-1.5-9B | no disponible | no disponible | Apache 2.0 | nativo, ONNX, GGUF | Mayor Decision Index que 4B |
| Valen-Decision-1.5-27B | no disponible | no disponible | Apache 2.0 | nativo, ONNX, GGUF | Tamaño máximo de la familia |

Comparación con modelos de propósito general (Qwen3.5-2B como base, u otros modelos de 2B): no disponible, al no existir benchmarks publicados que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El modelo no es generativo: devuelve probabilidades y cajas sobre preguntas definidas por el usuario; no produce texto libre ni respuestas conversacionales.
- Los datos de entrenamiento no son públicos, lo que limita la evaluación de sesgos y de la composición del corpus.
- No se documentan los idiomas soportados; el ejemplo de la model card está en inglés y no hay garantía de rendimiento en castellano u otros idiomas.
- La longitud de contexto no está especificada; el ejemplo de servido emplea 4096 tokens, y el autor indica que hay que aumentar `-c`, `-b` y `-ub` conjuntamente para peticiones mayores.
- El runtime GGUF es propio (Valen llama.cpp 0.2.0) y no se declara compatible con llama.cpp estándar, Ollama, vLLM ni TGI; esto condiciona el despliegue y la portabilidad.
- La comparación GGUF frente a nativo muestra diferencias de hasta 0,1011 en coordenadas de caja y 0,0863 en confianza bbox, por encima del umbral de 0,08 en el caso de la caja; conviene validar el comportamiento en el dominio concreto antes de producción.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente de las probabilidades en dominios alejados de los datos de entrenamiento; se recomienda definir políticas de incertidumbre y umbrales de revisión humana.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-2B y de los ficheros de visión.
- El modelo se actualizó por última vez el 2026-11-12 y cuenta con 847 descargas y 0 likes en el momento de la consulta; el ecosistema es joven y la documentación puede cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B-GGUF
- Pesos nativos (Transformers): https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Versión ONNX: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B-ONNX
- Repositorio GitHub y código de entrenamiento: https://github.com/Valen-Team/Valen
- Release del runtime GGUF 0.2.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.2.0
- Guía del runtime GGUF: https://valen-team.github.io/docs/valen/gguf/
- Web y API gratuita: https://valen-team.github.io/
- Space de playground: https://huggingface.co/spaces/Valen-Team/Valen-API
- Cookbook (API, inferencia local, ticket routing, screening de producto, video tagging): https://valen-team.github.io/cookbook/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
