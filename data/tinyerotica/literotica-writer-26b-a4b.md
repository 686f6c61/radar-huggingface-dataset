# TinyErotica/Literotica-Writer-26B-A4B

## Resumen

Literotica-Writer-26B-A4B es un ajuste fino mediante LoRA del modelo base TrevorJS/gemma-4-26B-A4B-it-uncensored, una variante abliterated de Gemma 4 26B-A4B con arquitectura Mixture of Experts (128 expertos, 8 activos). Lo desarrolla el usuario TinyErotica y está especializado en la generación de ficción erótica de formato largo en inglés, a partir de una cabecera estructurada que describe título, categoría, etiquetas, longitud y premisa.

El modelo resuelve un problema muy concreto: producir relatos eróticos completos de entre 1.000 y 5.000 palabras que terminen por sí solos, algo que los modelos generalistas suelen hacer mal por rechazo, por respuestas truncadas o por derivar hacia formato conversacional. Se entrenó sobre 9.315 relatos y fragmentos del dataset detain/literotica-stories, cubriendo 25 categorías de Literotica.

Es relevante ahora por su eficiencia: con aproximadamente 25.230 millones de parámetros totales y unos 4.000 millones activos, la cuantización i1-Q4_K_M (16,8 GB) permite ejecutarlo en llama.cpp con una GPU de 8 GB si los expertos se alojan en RAM del sistema. No es un modelo conversacional: está entrenado para completar texto plano, no para seguir instrucciones ni turnos de chat.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 128 expertos, 8 activos |
| Parámetros totales | 25.233.142.046 (~25,2B) |
| Parámetros activos | ~4B (según model card: 26B-A4B) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento empaquetado) |
| Tipos de cuantización | i1-Q4_K_M (imatrix), Q8_0; LoRA en PEFT; imatrix.gguf incluido para generar cuantizaciones propias |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (i1-Q4_K_M, Q8_0), safetensors (LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B-A4B, un transformer con capas de mezcla de expertos: 128 expertos por capa con 8 activos por token, lo que da unos 4B parámetros efectivos por paso de inferencia sobre un total de 25,2B. La variante de partida (TrevorJS/gemma-4-26B-A4B-it-uncensored) está abliterated, es decir, se le han eliminado las direcciones de rechazo del espacio de activaciones para reducir las negativas a contenido sensible.

El ajuste fino se realizó con LoRA de rango 64 y alpha 64 aplicado sobre las capas de atención y sobre los 128 expertos, usando Unsloth. Los datos son 9.315 relatos y fragmentos de detain/literotica-stories, con 25 categorías y 3.003 piezas procedentes de los relatos mejor valorados. El entrenamiento duró 2 épocas, 668 pasos, batch efectivo de 16, contexto empaquetado de 8.192 tokens, learning rate 2e-4 con decaimiento coseno, sobre una H100 durante unas 4,7 horas. La pérdida final fue de 2,36 en entrenamiento y 2,32 en validación. El formato de entrenamiento es texto plano: cabecera, línea `STORY:` y relato, sin plantilla de chat.

## Capacidades

- Generación de ficción erótica de formato largo en inglés, con relatos completos de 1.000 a 5.000 palabras que terminan por sí solos (EOS).
- Generación por partes: aperturas, continuaciones y capítulos de series largas mediante valores de `Type:` como `opening of a longer story (part 1 of 3)` o `continuation of a longer story (part 2 of 3)`.
- Continuidad narrativa mediante bloque `Previously:` con los últimos ~1.500 caracteres de la parte anterior.
- Control de categoría y temática mediante el campo `Category` (25 categorías de Literotica: Romance, BDSM, Sci-Fi & Fantasy, Erotic Horror, First Time, etc.).
- Control aproximado de longitud mediante el campo `Length` en palabras.
- Etiquetado temático mediante `Tags` (hasta ~10 etiquetas separadas por comas).
- Completado de texto plano, no conversacional: no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo thinking.
- Multilingüe: no, solo inglés.

## Casos de uso

- Generación de relatos eróticos completos para plataformas de ficción para adultos: se envía una cabecera con título, categoría, longitud y premisa, y el modelo produce un relato cerrado de la extensión solicitada. Adecuado por su entrenamiento específico en este formato y por terminar por sí solo.
- Creación de series por entregas: usando `Type: opening of a longer story (part 1 of 3)` y luego `continuation`/`final part` con el bloque `Previously:`, se puede construir una serie coherente de varios capítulos sin reentrenar.
- Prototipado editorial y borradores: escritores que necesitan un primer borrador de 3.000 palabras sobre una premisa concreta pueden obtenerlo en local y editarlo después, con control de categoría y etiquetas.
- Generación local en hardware modesto: la cuantización i1-Q4_K_M (16,8 GB) con expertos en RAM permite ejecutarlo en una GPU de 8 GB vía llama.cpp, útil para entornos sin acceso a la nube o con requisitos de privacidad.
- Investigación sobre contenido NSFW y alineación: sirve como caso de estudio de modelos abliterated y ajustes LoRA sobre MoE para contenido para adultos, comparando comportamiento con y sin cuantización.
- Pruebas de calidad de cuantización: el repo incluye `imatrix.gguf` y documenta la tasa de palabras corruptas (1 por ~9.000 con i1-Q4_K_M frente a 1 por ~900 con Q4_K_M plano), lo que lo hace útil para evaluar el impacto de la cuantización con importance matrix en modelos MoE.
- Integración en front-ends de completado: SillyTavern en modo Text Completion con plantilla vacía, KoboldCpp en modo historia o cualquier cliente que use el endpoint `/completion` de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento (loss de train 2,36 y de validación 2,32) y una tasa de palabras corruptas por cuantización: aproximadamente 1 por cada 900 palabras con Q4_K_M plano, 1 por cada 9.000 con i1-Q4_K_M y 1 por cada 6.000 o más en el modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: i1-Q4_K_M ocupa 16,8 GB en disco y cabe en una GPU de 8 GB si los expertos se descargan a RAM del sistema; Q8_0 ocupa 26,9 GB y requiere más memoria.
- GPU recomendadas: H100 (usada para el entrenamiento), A100; para inferencia local, cualquier GPU con 8 GB o más si se usa la cuantización i1-Q4_K_M con offload de expertos.
- Cabe en GPU de consumo: sí, con i1-Q4_K_M y offload de expertos a RAM; el rendimiento dependerá del ancho de banda de memoria del sistema.
- Opciones de despliegue: llama.cpp (recomendado, endpoint `/completion`), llama-server sin `--jinja` ni `--chat-template`; KoboldCpp en modo historia; SillyTavern en modo Text Completion. No usar endpoints de chat (`/v1/chat/completions`), LM Studio u Ollama en modo chat ni SillyTavern en modo chat-completion.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Literotica-Writer-26B-A4B | 25,2B totales / ~4B activos | 8.192 tokens | Apache 2.0 | Ficción erótica de formato largo, completado de texto |
| TrevorJS/gemma-4-26B-A4B-it-uncensored (base) | 25,2B totales / ~4B activos | no disponible | no disponible | Gemma 4 abliterated, uso general |
| Gemma 4 26B-A4B (original) | 25,2B totales / ~4B activos | no disponible | no disponible | Modelo generalista de Google |

No se dispone de datos de benchmarks ni de otros modelos especializados en ficción erótica de formato largo en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Contenido exclusivamente para adultos (18+): el modelo genera ficción sexual explícita y está etiquetado como `not-for-all-audiences` y `nsfw`.
- No es un modelo conversacional: usarlo con plantillas de chat, endpoints de chat o front-ends de rol produce respuestas de estilo asistente o relatos débiles.
- Solo inglés: no soporta otros idiomas.
- Contexto limitado a 8.192 tokens de entrenamiento; los relatos muy largos deben generarse por partes con el bloque `Previously:`.
- Riesgo de alucinación y de inconsistencias narrativas en relatos largos, especialmente al encadenar continuaciones.
- La cuantización Q4_K_M plana corrompe palabras con frecuencia (1 por ~900); se recomienda i1-Q4_K_M o Q8_0.
- El modelo base es abliterated, lo que reduce los rechazos pero también puede aumentar la probabilidad de contenido no deseado fuera del dominio previsto.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado está sujeto a las políticas de la plataforma de destino y a la legislación aplicable sobre contenido para adultos.
- No afiliado ni respaldado por Literotica; el nombre puede inducir a confusión.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso, lo que limita su integración en pipelines automatizados más allá de la generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TinyErotica/Literotica-Writer-26B-A4B
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/detain/literotica-stories
- Literotica: https://www.literotica.com
- Unsloth (herramienta de entrenamiento): no disponible enlace directo en la información proporcionada
- llama.cpp (runtime recomendado): no disponible enlace directo en la información proporcionada
