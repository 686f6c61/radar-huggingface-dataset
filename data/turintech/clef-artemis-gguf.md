# turintech/Clef-Artemis-GGUF

## Resumen

Clef Artemis GGUF es una conversión cuantizada del modelo de decisión Cloudflare/clef, publicada por TurinTech (turintech) mediante su plataforma de optimización de código Artemis. No es un modelo generativo al uso: recibe texto y, opcionalmente, imágenes junto con un conjunto de preguntas tipadas y devuelve, en una sola pasada, una probabilidad para cada respuesta permitida (sí/no, elegir una opción, una puntuación). Es decir, sustituye la generación autoregresiva por una clasificación estructurada de decisiones.

El modelo original tiene 27.024.054.788 parámetros (27B) y ocupa 54,1 GB en BF16, lo que exige 49,9 GiB de memoria de GPU, es decir, una tarjeta de centro de datos de 80 GB. El trabajo de TurinTech consiste en comprimirlo a GGUF para llama.cpp: el archivo por defecto pesa 14,82 GB (un 73% menos) y requiere unos 15,0 GiB, por lo que cabe en una GPU de 16 GB, manteniendo la misma respuesta que el original en el 95,6% de 2.000 decisiones de prueba y una precisión de 72,0% frente al 72,1% del original.

Es relevante porque permite ejecutar un modelo de decisión multimodal de 27B en hardware de consumo o de gama media con llama.cpp estándar, sin builds personalizados ni servidores propietarios, y porque publica una metodología de validación explícita (acuerdo con el original, cambio de precisión y recuento de respuestas seguras alteradas) para cada nivel de cuantización. La licencia es Apache 2.0 y el pipeline declarado en HuggingFace es text-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo multimodal de decisión (texto e imagen) compatible con llama.cpp y con proyector de visión externo (mmproj). El modelo base es Cloudflare/clef |
| Parametros totales | 27.024.054.788 (27B) |
| Parametros activos | No aplica / no se indica que sea MoE |
| Longitud de contexto | No disponible. Los ejemplos de despliegue usan -c 16384 (8192 de batch para imágenes), y se advierte de que el valor por defecto de 512 tokens hace que /v1/systemone rechace entradas más largas |
| Tipos de cuantizacion | GGUF propietarios de TurinTech: 14,82 GB, 14,31 GB, 12,72 GB, 11,53 GB y 10,49 GB (no se publican los nombres de los esquemas de cuantización) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). El original Cloudflare/clef se distribuye en BF16 |
| Tamano del repositorio | 63,9 GB |
| Modelo base | Cloudflare/clef (relación: quantized) |
| Fecha de publicacion | 2026-10-12 (actualizado 2026-10-12) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se proporciona en la información disponible la arquitectura interna del modelo base Cloudflare/clef (número de capas, tipo de atención, composición del dataset de entrenamiento ni si hubo RLHF/DPO). Lo que sí se documenta es su comportamiento funcional: es un modelo de decisión que, dado un estado (texto y opcionalmente imágenes) y un conjunto de preguntas tipadas en formato Jev/SystemOne, devuelve una distribución de probabilidad sobre las respuestas permitidas en una única pasada, en lugar de generar texto token a token. El soporte de imágenes se implementa acoplando un proyector de visión (mmproj) de ggml-org/Clef-GGUF, lo que implica un codificador visual conectado al modelo principal.

La innovación del artefacto publicado por TurinTech no está en el entrenamiento sino en la compresión: conversión de pesos a GGUF y cuantización mediante técnicas desarrolladas por Artemis, su plataforma de optimización de código. Cada archivo se valida contra el original BF16 en 2.000 decisiones tipadas del split de test de LocalLLaMA/typed-decisions, 1.000 decisiones adicionales del split de train no usadas durante la compresión, una muestra estratificada de 300 elementos de benchmarks públicos (MMLU, MMLU-Pro, ARC, WinoGrande, HellaSwag, ANLI, BANKING77, CLINC150, When2Call) y 330 preguntas con imagen. Los pesos solo cambian de formato y precisión respecto al original; el autor indica que es una conversión independiente no afiliada ni respaldada por Cloudflare.

## Capacidades

- Clasificación de decisiones tipadas: devuelve una probabilidad por cada respuesta permitida, con tipos como sí/no (noul), elección única y puntuación, en una sola pasada.
- Procesamiento conjunto de texto e imagen mediante el proyector de visión mmproj-Clef-BF16.gguf; las imágenes se envían como data URLs en un array `images` de nivel superior de la petición /v1/systemone.
- Manejo de entradas largas: con `-ub 4096 -b 4096` acepta inputs de más de 512 tokens; para varias imágenes grandes se recomienda `-ub 8192 -b 8192`.
- API compatible con el endpoint /v1/systemone en llama-server, con formato de petición y respuesta Jev/SystemOne.
- Capacidad multilingüe: no disponible; la model card no declara idiomas.
- Tool calling, function calling y razonamiento multi-paso en formato agente: no disponible; el modelo no genera texto ni llamadas a herramientas, emite probabilidades sobre respuestas cerradas.
- Modo thinking: no disponible.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como `state` y preguntas tipadas sobre urgencia, categoría y sentimiento; el modelo devuelve la probabilidad de cada opción en una sola llamada, lo que permite enrutar y priorizar colas sin postprocesar texto generado.
- Clasificación de intención en asistentes conversacionales: los benchmarks incluidos en la validación (CLINC150, BANKING77, When2Call) apuntan a este escenario; el modelo asigna probabilidad a un conjunto cerrado de intenciones por turno, útil en enrutadores de diálogo.
- Enrutamiento de alertas de seguridad y monitorización: dado un evento o log, preguntas tipadas como "¿es un falso positivo?" o "¿requiere escalado inmediato?" con salida probabilística que se puede umbralizar en el sistema de alertas.
- Moderación de contenido combinando texto e imagen: gracias al proyector de visión, se puede evaluar una publicación con su imagen asociada y preguntar de forma tipada si infringe una política concreta.
- Análisis de encuestas y NPS: convertir respuestas abiertas en decisiones tipadas (polaridad, tema, intención de recompra) con una puntuación por categoría, agregable directamente en analítica.
- Procesamiento de formularios y documentos escaneados: con el mmproj cargado y batch de 8192, clasificar documentos con imagen (facturas, partes, solicitudes) según preguntas tipadas definidas por el negocio.
- Despliegue on-premise o en el borde con GPU de 12-16 GB: el archivo de 14,82 GB necesita unos 15,0 GiB y el de 10,49 GB picos de 11,3 GiB para texto, lo que permite clasificación de decisiones de un modelo de 27B sin tarjetas de centro de datos.
- Evaluación de textos en pipelines de CI/CD o herramientas internas: al ser un clasificador determinista sobre respuestas cerradas, encaja mejor que un modelo generativo en comprobaciones automáticas donde se necesita una etiqueta o una probabilidad calibrada.
- Sustitución de llamadas a APIs propietarias de clasificación: al ejecutarse en llama.cpp estándar y con licencia Apache 2.0, puede desplegarse en infraestructura propia sin dependencia de proveedor.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan cada archivo con el original BF16 y con cuantizaciones públicas, en las mismas condiciones de llama.cpp sobre 2.000 decisiones tipadas del split de test de LocalLLaMA/typed-decisions.

| Archivo | Tamano | Reduccion frente al original | Misma respuesta que el original | Cambio de precision | Respuestas seguras alteradas |
|---|---|---|---|---|---|
| Original BF16 (Cloudflare/clef) | 54,1 GB | referencia | referencia | referencia (72,1%) | referencia |
| Clef-Artemis-14.8GB.gguf | 14,82 GB | 73% | 95,6% | -0,1 (72,0%) | 0 |
| Clef-Artemis-14.3GB.gguf | 14,31 GB | 74% | 95,9% | +0,7 | 0 |
| Clef-Artemis-12.7GB.gguf | 12,72 GB | 76% | 93,4% | +0,3 | 0 |
| Clef-Artemis-11.5GB.gguf | 11,53 GB | 79% | 91,0% | +1,1 | 2 |
| Clef-Artemis-10.5GB.gguf | 10,49 GB | 81% | 89,5% | +0,9 | 4 (+1 con imagen) |

Comparación con cuantizaciones públicas en las mismas pruebas:

| Archivo publico | Tamano | Misma respuesta que el original |
|---|---|---|
| Q8_0 (ggml-org) | 28,7 GB | 98,8% |
| Q4_K_M (ggml-org) | 19,2 GB | 96,9% |
| IQ3_M (bartowski) | 13,78 GB | 87,6% |

El autor indica que ninguna de las cuantizaciones públicas cambió una respuesta segura (más del 80% de confianza en el original), mientras que en las dos variantes más pequeñas de Artemis sí ocurrió (2 y 4 casos de aproximadamente 2.000). El texto proporcionado de la model card está truncado en la descripción de la muestra de benchmarks del Decision Index, por lo que no se dispone de los resultados numéricos de MMLU, MMLU-Pro, ARC, WinoGrande, HellaSwag, ANLI, BANKING77, CLINC150 y When2Call.

## Requisitos de hardware

- VRAM estimada para el archivo por defecto (14,82 GB): 15,0 GiB, medido en una NVIDIA A100; cabe en una GPU de 16 GB para texto.
- VRAM estimada para el archivo más pequeño (10,49 GB): pico de 11,3 GiB para texto, por lo que debería caber en una GPU de 12 GB.
- Original BF16: 49,9 GiB de memoria de GPU, lo que requiere una tarjeta de centro de datos de 80 GB.
- GPU recomendadas: A100 (usada para las mediciones), H100 para el original BF16; RTX 4090 (24 GB) y tarjetas de 16 GB para las variantes Artemis; tarjetas de 12 GB para el archivo de 10,49 GB.
- Cabe en GPU de consumo: sí, en las variantes de 14,82 GB y menores, siempre que se ajuste `-c 16384` para no reservar memoria para todo el contexto de entrenamiento.
- Despliegue: llama.cpp (llama-server) en versión del 9 de octubre de 2026 o posterior; probado en el commit `1e6f04a` y en la release `b11572` (12 de octubre de 2026). No se mencionan vLLM, Ollama ni TGI.
- Comando de referencia: `llama-server -m Clef-Artemis-14.8GB.gguf --port 8080 -c 16384 -ub 4096 -b 4096`. Es obligatorio mantener `-ub 4096 -b 4096`, porque con el valor por defecto de 512 el endpoint /v1/systemone rechaza entradas de más de 512 tokens.
- Para imágenes: `llama-server -m Clef-Artemis-14.8GB.gguf --port 8080 --mmproj mmproj-Clef-BF16.gguf -c 16384 -ub 8192 -b 8192`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Formato | Memoria necesaria | Licencia | Notas |
|---|---|---|---|---|---|---|
| turintech/Clef-Artemis-GGUF (14,8 GB) | 27B | 14,82 GB | GGUF | ~15,0 GiB | Apache 2.0 | Conversión de TurinTech; mismo resultado que el original en el 95,6% de 2.000 decisiones; cabe en GPU de 16 GB |
| Cloudflare/clef (original BF16) | 27B | 54,1 GB | BF16 | 49,9 GiB | Apache 2.0 | Referencia de precisión (72,1%); requiere GPU de 80 GB |
| ggml-org/Clef-GGUF Q8_0 | 27B | 28,7 GB | GGUF | No disponible en la informacion | Apache 2.0 (heredada del base) | 98,8% de coincidencia con el original; ninguna respuesta segura alterada |
| ggml-org/Clef-GGUF Q4_K_M | 27B | 19,2 GB | GGUF | No disponible en la informacion | Apache 2.0 (heredada del base) | 96,9% de coincidencia con el original |
| bartowski IQ3_M | 27B | 13,78 GB | GGUF | No disponible en la informacion | Apache 2.0 (heredada del base) | 87,6% de coincidencia; ninguna respuesta segura alterada |

No se dispone de comparación con modelos de decisión de otros fabricantes ni con clasificadores de tamaño similar ajenos a la familia Clef.

## Limitaciones y advertencias

- Es una conversión independiente de TurinTech, no afiliada ni respaldada por Cloudflare; los cambios respecto al original se limitan a la conversión a GGUF y la cuantización.
- Es un modelo de decisión, no generativo: no produce texto libre ni soporta tool calling, agentes o modo de razonamiento explícito. Solo responde a preguntas tipadas con respuestas cerradas.
- Las cuantizaciones más agresivas degradan el acuerdo con el original: 91,0% en el archivo de 11,53 GB y 89,5% en el de 10,49 GB. En estas dos variantes se alteraron respuestas en las que el original tenía más del 80% de confianza (2 y 4 casos de unos 2.000, más 1 caso con imagen).
- El archivo de 10,49 GB no ha sido validado con el proyector de visión Q8_0 de ggml-org; los resultados con imagen corresponden al proyector BF16.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingüe sin validación propia.
- Sesgos conocidos: no disponibles. Al tratarse de un modelo de decisión que devuelve probabilidades, la calibración de esas probabilidades y el posible sesgo por categoría deben evaluarse en el dominio de despliegue antes de producción.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea; el uso de umbrales de probabilidad es recomendable cuando la decisión tenga consecuencias.
- La ventana de contexto real no se documenta; con la configuración por defecto de llama.cpp (512 tokens de batch) el endpoint rechaza entradas más largas, un fallo que afecta a todos los GGUF de Clef, incluidos los públicos.
- Requiere llama.cpp del 9 de octubre de 2026 o posterior; versiones anteriores pueden no ser compatibles con el endpoint /v1/systemone o con el formato de petición Jev/SystemOne.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Cloudflare/clef y los términos de los datasets de validación citados antes de redistribuir derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/Clef-Artemis-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef
- GGUF públicos de referencia y proyector de visión: https://huggingface.co/ggml-org/Clef-GGUF
- Dataset de validación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- TurinTech (autor de la conversión): https://turintech.ai
- Reserva de demo de TurinTech: https://www.turintech.ai/book-a-demo
- Búsqueda web: no se han encontrado resultados relevantes sobre el modelo; los resultados devueltos no guardan relación con la ficha.
