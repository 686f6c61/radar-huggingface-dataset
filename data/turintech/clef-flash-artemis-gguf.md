# turintech/Clef-Flash-Artemis-GGUF

## Resumen
Clef-Flash-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo Cloudflare/clef-flash, publicada por TurinTech bajo el pipeline de clasificación de texto. No es un modelo conversacional al uso: se trata de un "decision model" que responde a preguntas tipadas (sí/no, elección única, puntuación) sobre texto o imágenes, devolviendo una probabilidad por cada respuesta en una sola pasada a través del endpoint `/v1/systemone` de llama-server. El modelo base tiene 9.075.566.084 parámetros (aproximadamente 9,1 mil millones) y esta versión comprimida con Artemis reduce el peso de 4,94 GB y la VRAM necesaria a unos 5,5 GiB, frente a los 16,5 GiB del original.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de decisión en hardware de consumo, algo poco habitual en modelos de casi 9B con capacidades de visión. TurinTech aplica su técnica de compresión Artemis sobre el modelo de Cloudflare, manteniendo un 95,0% de coincidencia con las respuestas del original según sus propias mediciones. Está pensado para integrarse en pipelines de clasificación y enrutamiento donde se necesita una decisión estructurada y probabilística, no una respuesta en lenguaje natural.

La licencia Apache 2.0 y el soporte para llama.cpp, Ollama y LM Studio lo hacen desplegable en entornos locales y de producción sin dependencias de API externas. La longitud de contexto de entrenamiento no se detalla en la información disponible, aunque los ejemplos de uso recomiendan `-c 16384` para evitar reservar memoria de más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cloudflare/clef-flash; pesos en GGUF para llama.cpp) |
| Parametros totales | 9.075.566.084 (aprox. 9,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos usan `-c 16384`; el contexto de entrenamiento no se detalla) |
| Tipos de cuantizacion | GGUF cuantizado con Artemis; se mencionan IQ4_XS, IQ3_XXS y Q4_K_M (referencia ggml-org) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base Cloudflare/clef-flash más allá de que es un transformer multimodal capaz de procesar texto e imágenes y emitir decisiones tipadas. El pipeline declarado es `text-classification`, pero el modelo no genera texto libre: recibe un estado (texto o imagen) y un conjunto de preguntas con tipos definidos (`noul`, elección única, puntuación), y devuelve una distribución de probabilidad sobre las respuestas posibles en una única pasada. El formato de petición y respuesta sigue el esquema Jev/SystemOne descrito en la model card original de Cloudflare.

Sobre el entrenamiento no se proporcionan datos de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es el proceso de compresión: TurinTech aplica su técnica Artemis para reducir el modelo a cuantizaciones GGUF (IQ4_XS, IQ3_XXS, entre otras) que caben en menos de 6 GiB de VRAM. La model card reporta que los ficheros IQ4_XS e IQ3_XXS dieron respuestas idénticas en una comprobación de 100 decisiones entre las builds b11540 y b11572 de llama.cpp, lo que sugiere estabilidad de la cuantización. Para imágenes se requiere el proyector de visión de ggml-org en BF16; el proyector Q8_0 del mismo repositorio no fue probado con estos ficheros.

## Capacidades
- Clasificación y decisión tipada sobre texto: responde preguntas de tipo sí/no, elección única y puntuación con probabilidad por respuesta.
- Procesamiento multimodal: acepta imágenes además de texto, usando el proyector de visión de ggml-org.
- Salida probabilística en una sola pasada, sin generación autoregresiva de texto.
- Integración con el endpoint `/v1/systemone` de llama-server (formato Jev/SystemOne).
- Compatibilidad con llama.cpp (build del 9 de octubre de 2026 o posterior; probado en b11540 y b11572), Ollama y LM Studio.
- Ejecución en GPU de consumo gracias a la compresión Artemis (5,5 GiB de VRAM).
- Soporte de múltiples slots en llama-server (`--parallel`) para servir peticiones concurrentes.
- No soporta chat conversacional ni tool calling según la información disponible.

## Casos de uso
- Enrutamiento y triaje de tickets de soporte: el modelo puede clasificar la urgencia de un mensaje (por ejemplo, "¿expresa urgencia?") con una probabilidad asociada, como muestra el ejemplo de la model card con una incidencia de Stripe. Es adecuado porque devuelve decisiones estructuradas directamente consumibles por un sistema de colas.
- Moderación de contenido: preguntas tipadas del tipo "¿es este texto ofensivo?" o "¿qué categoría de riesgo aplica?" permiten obtener una etiqueta con score de confianza en una sola inferencia, sin coste de generación.
- Clasificación de imágenes en pipelines de visión: con el proyector de visión cargado, puede responder preguntas sobre el contenido de una imagen (categoría, presencia de objetos) y devolver la probabilidad de cada opción.
- Extracción de señales en formularios o correos: decidir si un mensaje contiene una solicitud de reembolso, una queja o una consulta comercial, alimentando un CRM o un sistema de automatización.
- Despliegue en local para privacidad de datos: al caber en 5,5 GiB de VRAM y funcionar con llama.cpp u Ollama, permite clasificar datos sensibles sin enviarlos a una API externa.
- Evaluación y anotación asistida de datasets: generar etiquetas probabilísticas sobre grandes volúmenes de texto o imágenes para preanotar y priorizar la revisión humana.
- Servicio de decisiones de baja latencia: al ser una pasada única sin decodificación autoregresiva, es apto para endpoints que necesitan respuesta rápida con concurrencia moderada mediante `--parallel`.

## Benchmarks y rendimiento
Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Agreement with the original | LocalLLaMA/typed-decisions (Test decisions) | Same answer (%) | 95,0 |
| Agreement with the original | LocalLLaMA/typed-decisions (Test decisions) | Confident changes | 0 |
| Typed decisions | LocalLLaMA/typed-decisions (Test decisions) | Accuracy (%) | 70,4 |

La model card añade que la cuantización Q4_K_M de ggml-org alcanza un 96,5% de coincidencia con el original, ligeramente por encima del 95,0% reportado para esta versión Artemis.

## Requisitos de hardware
- VRAM estimada: 5,5 GiB para la versión Artemis IQ4_XS (frente a 16,5 GiB del modelo original en BF16), medida con dos slots (`--parallel 2`).
- Tamaño de descarga: 4,94 GB para el fichero principal; el repositorio completo ocupa 17,2 GB.
- GPU recomendadas: no se especifican modelos concretos; la model card valida el funcionamiento en Apple M3 Max (36 GB) con la build Metal de llama.cpp (b11617). Por el perfil de memoria, cabe en GPUs de consumo con 8 GB o más de VRAM.
- Cabe en GPU de consumo: sí, con al menos 6 GiB de VRAM libres para la cuantización IQ4_XS.
- Opciones de despliegue: llama-server (llama.cpp build del 9 de octubre de 2026 o posterior), Ollama (`turintech/clef-flash-artemis`) y LM Studio (`turintech/clef-flash-artemis`).
- Parámetros de servidor recomendados: `-c 16384 -ub 4096 -b 4096`; con el valor por defecto de 512, el endpoint `/v1/systemone` rechaza entradas de más de 512 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Clef-Flash-Artemis-GGUF (este) | 9,1B | no disponible | GGUF, llama.cpp / Ollama / LM Studio | Apache 2.0 | Decisión tipada multimodal, 5,5 GiB VRAM, 95,0% de coincidencia con el original |
| Cloudflare/clef-flash (original) | 9,1B | no disponible | safetensors | no disponible en la información | Modelo base sin comprimir, 16,5 GiB de VRAM en BF16 |
| Cuantización Q4_K_M de ggml-org | 9,1B | no disponible | GGUF | Apache 2.0 (heredada) | 96,5% de coincidencia con el original según la model card |

No se dispone de datos de benchmarks comparativos con otros modelos de clasificación de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo conversacional: no genera texto libre ni mantiene diálogos multi-turno; solo responde a preguntas tipadas sobre un estado.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- La precisión en decisiones tipadas es del 70,4%, lo que implica un margen de error considerable para aplicaciones críticas.
- El endpoint `/v1/systemone` rechaza entradas de más de 512 tokens si no se ajusta `-ub 4096 -b 4096` en llama-server.
- El proyector de visión Q8_0 no fue probado con estos ficheros; solo se validó el proyector BF16.
- No se detallan los idiomas soportados ni los sesgos conocidos del modelo base.
- La longitud de contexto de entrenamiento no está documentada; los 16.384 tokens de los ejemplos son una configuración de servidor, no una especificación del modelo.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Cloudflare/clef-flash antes de un uso comercial.
- Riesgo de alucinación en las decisiones: al devolver probabilidades, un score alto no garantiza corrección; se recomienda umbral de confianza y validación humana en flujos sensibles.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/turintech/Clef-Flash-Artemis-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Página de resultados: https://huggingface.co/turintech/Clef-Flash-Artemis-GGUF/blob/main/RESULTS.md
- Ollama: https://ollama.com/turintech/clef-flash-artemis
- LM Studio: https://lmstudio.ai/turintech/clef-flash-artemis
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
