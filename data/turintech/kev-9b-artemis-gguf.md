# turintech/Kev-9B-Artemis-GGUF

## Resumen

Kev-9B-Artemis-GGUF es una conversión cuantizada en formato GGUF del modelo de decisión jaredpalmer/kev-9b, publicada por TurinTech (responsable de la plataforma de optimización Artemis) bajo licencia Apache-2.0. No se trata de un modelo generativo de texto, sino de un modelo de decisión de aproximadamente 9.000 millones de parámetros (8.955.900.928 exactos según safetensors): recibe un texto junto a un conjunto de preguntas tipadas y devuelve, en una sola pasada, una probabilidad para cada respuesta permitida (sí/no, elegir una opción o una puntuación). Está pensado para el endpoint `/v1/systemone` y corre sobre llama.cpp estándar.

El problema que resuelve es el de clasificación y decisión estructurada con ventana de contexto amplia en hardware de consumo. El modelo original en BF16 ocupa 17,9 GB y requiere 20,0 GiB de VRAM, lo que lo deja fuera de tarjetas de 16 GB. El archivo por defecto de esta conversión (`Kev-9B-Artemis-4.8GB.gguf`, 4,78 GB) es un 73% más pequeño que el original y necesita 9,1 GiB de memoria, por lo que cabe en una GPU de 12 GB, manteniendo la misma respuesta que el original en el 92,2% de 2.000 decisiones de prueba.

La relevancia actual radica en que permite desplegar un modelo de decisión de 9B en entornos con recursos limitados sin reentrenamiento, conservando la precisión dentro de aproximadamente un punto porcentual, y ejecutarlo íntegramente en local con llama.cpp sin compilaciones personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión de 9B; la información proporcionada no detalla la arquitectura interna) |
| Parametros totales | 8.955.900.928 (aprox. 8,96 B) |
| Parametros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible explícitamente; el ejemplo de despliegue usa `-c 16384` |
| Tipos de cuantizacion | GGUF cuantizado; archivos Artemis propios (4,8 GB, 4,9 GB, 4,5 GB, 4,1 GB) y referencias públicas Q8_0 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ejecutable en llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es jaredpalmer/kev-9b, un modelo de decisión de 9B perteneciente a la familia Kev de Jared Palmer (que incluye las variantes 0.8B, 4B, 9B y 27B). A diferencia de un modelo de lenguaje generativo, Kev recibe un texto de entrada y un conjunto de preguntas con tipos de respuesta fijos, y produce directamente una probabilidad para cada opción permitida en una única pasada, en lugar de generar texto token a token. La información proporcionada no describe la arquitectura interna (transformer, atención lineal, etc.), el número de tokens de entrenamiento ni la composición del dataset del modelo original.

Esta ficha corresponde a la conversión realizada por TurinTech con técnicas de su plataforma Artemis: los pesos originales se convierten a GGUF y se cuantizan para llama.cpp. No hay reentrenamiento ni ajuste fino; el trabajo consiste en compresión cuantizada verificada. Cada archivo se validó contra el original BF16 en 2.000 decisiones tipadas (procedentes del split de test del dataset LocalLLaMA/typed-decisions), 1.000 decisiones adicionales del split de train no usadas durante la creación de los archivos, y una muestra estratificada de 300 elementos de benchmarks públicos del Decision Index (MMLU, MMLU-Pro, ARC, WinoGrande, HellaSwag, ANLI, BANKING77, CLINC150, When2Call). Las mediciones se hicieron en llama.cpp en el commit `1e6f04a` sobre una NVIDIA A100 de 80 GB.

## Capacidades

- Clasificación y decisión estructurada: devuelve probabilidades para respuestas tipadas (sí/no, elección única, puntuación) en una sola pasada, sin generar texto libre.
- Respuesta a preguntas múltiples sobre un mismo texto: permite plantear varias preguntas tipadas simultáneamente sobre la misma entrada.
- Procesamiento de entradas largas: el ejemplo de servidor configura `-ub 4096 -b 4096` para aceptar entradas de más de 512 tokens, con `-c 16384`.
- Salida probabilística: cada respuesta va acompañada de una probabilidad, lo que facilita umbrales de confianza y lógica de decisión posterior.
- Modo texto únicamente ("Text only", según el autor): no procesa imágenes, audio ni otras modalidades.
- Integración con endpoint compatible OpenAI: se sirve a través de la ruta `/v1/systemone` de llama.cpp.
- Ejecución local con llama.cpp estándar, sin necesidad de compilación o servidor personalizado.
- No se documenta soporte de tool calling, function calling, agentes multietapa ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto de una incidencia con preguntas tipadas como "¿expresa urgencia?" o "¿qué categoría corresponde?" y usar las probabilidades devueltas para enrutar el ticket al equipo adecuado, aprovechando la ventana de 16.384 tokens configurada.
- Moderación de contenido: clasificar mensajes con preguntas de tipo sí/no (por ejemplo, si contienen lenguaje abusivo o spam) y aplicar umbrales sobre la probabilidad devuelta para decidir la acción.
- Enrutamiento de intenciones en asistentes: dado un mensaje de usuario, determinar la intención con una pregunta de elección única sobre un conjunto cerrado de opciones, integrándose con el endpoint `/v1/systemone`.
- Etiquetado de datos a escala: clasificar grandes volúmenes de texto con preguntas tipadas en lote, usando el archivo de 4,8 GB en GPU de 12 GB para reducir coste por inferencia.
- Análisis de encuestas y feedback: extraer decisiones estructuradas (puntuaciones, categorías) de respuestas abiertas de clientes de forma consistente y probabilística.
- Decisión de clasificación en pipelines ETL: integrar el modelo en un pipeline que envía texto y recibe probabilidades por opción, con lógica de umbral para descartar decisiones de baja confianza.
- Control de calidad con verificación de compresión: ejecutar el archivo Artemis en lugar del original BF16 cuando el presupuesto de memoria es de 9-12 GB, aceptando la pérdida de precisión documentada (aprox. 1,2 puntos en decisiones tipadas).

## Benchmarks y rendimiento

Los datos proceden de la verificación publicada por TurinTech. "Misma respuesta que BF16" mide la coincidencia con el original en 2.000 decisiones de test; "cambio de precisión" es la diferencia en puntos frente al original en los mismos casos.

| Check | BF16 (original) | Artemis 4.8GB | Artemis 4.9GB | Artemis 4.5GB | Artemis 4.1GB | Publico Q8_0 | Publico Q4_K_M |
|---|---|---|---|---|---|---|---|
| Precision en decisiones tipadas | 69,0 | 67,8 | 67,9 | 68,3 | 66,8 | 68,8 | 68,4 |
| Misma respuesta que BF16 | referencia | 92,2 | 91,6 | 88,8 | 87,1 | 98,7 | 93,2 |
| Precision en conjunto reservado | 69,3 | 69,5 | 67,9 | 68,9 | 65,8 | 69,9 | 69,9 |
| Reservado: misma respuesta que BF16 | referencia | 92,8 | 91,3 | 89,3 | 86,5 | 98,6 | 94,3 |
| Precision en muestra del Decision Index | 73,7 | 74,7 | 74,7 | 73,3 | 74,3 | no disponible | no disponible |

Datos adicionales de tamano y memoria: el original BF16 ocupa 17,9 GB y requiere 20,0 GiB de VRAM; el archivo Artemis 4.8GB ocupa 4,78 GB y requiere 9,1 GiB. Los archivos públicos Q8_0 (9,5 GB) y Q4_K_M (6,36 GB) son 1,5 a 2,3 GB más grandes y usan 1,4 a 2,0 GiB más de memoria que los Artemis. Los archivos Artemis no cambiaron ninguna respuesta de la que el original estuviera más del 80% seguro.

## Requisitos de hardware

- Archivo por defecto `Kev-9B-Artemis-4.8GB.gguf`: 9,1 GiB de GPU según la medición del autor en A100, por lo que debería caber en una GPU de 12 GB.
- Archivo `Kev-9B-Artemis-4.1GB.gguf`: opción para memoria ajustada, con precisión aproximadamente 2 a 3,5 puntos inferior.
- Modelo original BF16: 20,0 GiB de VRAM, fuera del alcance de tarjetas de 16 GB; requiere A100 80 GB o similar.
- GPU recomendadas: NVIDIA A100 (entorno de medición del autor); tarjetas de consumo a partir de 12 GB para el archivo 4,8GB.
- Despliegue: llama.cpp (versión del 9 de octubre de 2026 o posterior, probado en el commit `1e6f04a`) mediante `llama-server`. No requiere compilación personalizada.
- Comando de referencia: `llama-server -m Kev-9B-Artemis-4.8GB.gguf --port 8080 -c 16384 -ub 4096 -b 4096`. Mantener `-ub 4096 -b 4096`, ya que con el valor por defecto de 512, `/v1/systemone` rechaza entradas de más de 512 tokens.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparación natural es contra el propio modelo original y los builds públicos de GGUF de la misma base, ya que es una conversión cuantizada y no un modelo distinto.

| Modelo | Tamano | VRAM aprox. | Misma respuesta que BF16 | Cambio de precision (decisiones tipadas) | Licencia |
|---|---|---|---|---|---|
| jaredpalmer/kev-9b (BF16, original) | 17,9 GB | 20,0 GiB | referencia | referencia | Apache-2.0 |
| turintech/Kev-9B-Artemis-4.8GB | 4,78 GB | 9,1 GiB | 92,2% | -1,2 | Apache-2.0 |
| ggml-org Kev-9B-Q8_0 | 9,5 GB | mayor que Artemis | 98,7% | -0,2 | Apache-2.0 |
| ggml-org Kev-9B-Q4_K_M | 6,36 GB | mayor que Artemis | 93,2% | -0,6 | Apache-2.0 |

Otras variantes de la familia Kev disponibles según la búsqueda web: Kev-0.8B, Kev-4B y Kev-27B (publicadas el 20 de septiembre de 2026 bajo Apache-2.0). No se dispone de datos de rendimiento detallados de esas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo devuelve probabilidades para respuestas tipadas, no texto libre.
- Solo procesa texto: no admite visión ni audio.
- Pérdida de precisión frente al original: el archivo por defecto cae unos 1,2 puntos en decisiones tipadas y el 4.1GB hasta 2,2 puntos.
- La verificación del archivo 4.8GB se hizo parcialmente sobre el conjunto reservado, por lo que este actúa como validación y no como conjunto completamente virgen.
- Requiere llama.cpp del 9 de octubre de 2026 o posterior (probado en el commit `1e6f04a`); versiones anteriores pueden no soportar la ruta `/v1/systemone`.
- Configuración de llama.cpp crítica: con `-ub 512 -b 512` por defecto, las entradas de más de 512 tokens son rechazadas.
- Es una conversión independiente de TurinTech, no afiliada ni respaldada por los autores de Kev.
- Sesgos conocidos y riesgos de alucinación concretos: no disponibles en la información proporcionada, si bien cualquier sistema probabilístico de decisión puede producir clasificaciones erróneas con alta confianza.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo `NOTICE` del repositorio por posibles condiciones adicionales de la conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/turintech/Kev-9B-Artemis-GGUF
- Modelo base: https://huggingface.co/jaredpalmer/kev-9b
- Builds públicos GGUF de Kev-9B: https://huggingface.co/ggml-org/Kev-9B-GGUF
- Dataset de validación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- TurinTech: https://turintech.ai
- Artemis (producto de TurinTech): https://www.turintech.ai/product/overview
- TurinTech AI: https://turintech.org/
- Resumen de la familia Kev (0.8B-27B): https://ai-tldr.dev/models/kev/
- TurinTech Artemis en PC con Intel: https://www.intel.com/content/www/us/en/content-details/916043/faster-more-secure-ai-engineering-on-intel-powered-ai-pcs-with-turintech-artemis.html
