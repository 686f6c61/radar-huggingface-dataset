# ViezeVingertjes/Literotica-Writer-26B-A4B

## Resumen

Literotica-Writer-26B-A4B es un ajuste fino mediante LoRA del modelo abliterado TrevorJS/gemma-4-26B-A4B-it-uncensored, publicado por el usuario ViezeVingertjes. El modelo está especializado en la generación de ficción erótica de formato largo en inglés, a partir de una cabecera estructurada (título, categoría, etiquetas, longitud y premisa) que el modelo continúa hasta cerrar la historia por sí mismo. No es un modelo conversacional: se entrenó exclusivamente para completado de texto plano y no ha visto turnos de chat ni instrucciones.

La base es Gemma 4 26B-A4B, una arquitectura de mezcla de expertos (MoE) con 128 expertos de los que 8 están activos, lo que da 25.233.142.046 parámetros totales y aproximadamente 4.000 millones activos. El ajuste se realizó con Unsloth sobre 9.315 historias y fragmentos del dataset detain/literotica-stories, cubriendo 25 categorías, con 2 épocas, 668 pasos y una ventana empaquetada de 8.192 tokens, en una única H100 durante unas 4,7 horas. La pérdida final fue de 2,36 en entrenamiento y 2,32 en validación.

Su relevancia práctica es doble: por un lado, demuestra que un MoE de 26B puede ejecutarse en una GPU de 8 GB de VRAM manteniendo los pesos de los expertos en RAM del sistema mediante `--n-cpu-moe` en llama.cpp; por otro, ejemplifica el ecosistema de ajustes finos sin censura orientados a nichos de contenido para adultos. La licencia declarada es Apache 2.0, aunque el modelo base y el contenido generado imponen restricciones adicionales de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4 26B-A4B), 128 expertos, 8 activos |
| Parámetros totales | 25.233.142.046 |
| Parámetros activos | ~4B (8 de 128 expertos) |
| Longitud de contexto | 8.192 tokens en entrenamiento; 16.384 recomendados en inferencia (`-c 16384`) |
| Tipos de cuantización | Q4_K_M (GGUF publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M, 16,8 GB) y safetensors (adaptador LoRA PEFT/Unsloth) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 4 26B-A4B de Google, un transformer con mezcla de expertos de 128 expertos y 8 activos por token, sobre el que se aplicó un proceso de abliteración por parte del autor del modelo base (TrevorJS) para eliminar los mecanismos de rechazo. Sobre esa base, ViezeVingertjes entrenó un adaptador LoRA con rango 64 y alpha 64 aplicado tanto a las capas de atención como a los 128 expertos, usando la librería Unsloth. El entrenamiento consistió en 2 épocas, 668 pasos, batch efectivo de 16, contexto empaquetado de 8.192 tokens y una tasa de aprendizaje de 2e-4 con decaimiento coseno, completado en aproximadamente 4,7 horas en una H100.

Los datos provienen del dataset detain/literotica-stories, con 9.315 historias y fragmentos repartidos en 25 categorías de Literotica, de las cuales 3.003 proceden de historias mejor valoradas. El formato de entrenamiento es texto plano: una cabecera fija con la línea `Erotic fiction. All characters are adults (18+).`, campos de título, categoría, etiquetas, tipo, longitud y premisa, seguida de la línea `STORY:` y el cuerpo de la historia. El modelo también se entrenó con valores de `Type` para aperturas, continuaciones y partes finales de historias largas, además de un bloque `Previously:` con los últimos ~1.500 caracteres de la parte anterior para mantener coherencia en series. No se aplicaron técnicas de RLHF ni DPO; el ajuste es puramente supervisado sobre texto.

## Capacidades

- Generación de ficción erótica de formato largo en inglés, con historias completas de 1.000 a 5.000 palabras que terminan por sí solas con EOS.
- Completado de texto plano a partir de una cabecera estructurada con título, categoría, etiquetas, tipo, longitud y premisa.
- Seguimiento aproximado de la longitud solicitada en el campo `Length` (redondeada a cientos o miles de palabras).
- Generación por partes: aperturas (`part 1 of 3`), continuaciones (`part 2 of 3`), partes finales y capítulos de series, con bloque `Previously:` para mantener continuidad.
- Cobertura de 25 categorías de Literotica, incluidas NonConsent/Reluctance, Incest/Taboo, Mind Control, Exhibitionist & Voyeur, Loving Wives, Fetish, BDSM, Erotic Couplings, Group Sex, Lesbian Sex, Gay Male, Romance, Sci-Fi & Fantasy, Erotic Horror, First Time y Mature.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo conversacional ni tiene modo thinking.
- Sin capacidades de visión ni audio.
- Multilingüismo limitado al inglés.

## Casos de uso

- Generación de historias eróticas completas para plataformas de ficción para adultos: se envía la cabecera con título, categoría, etiquetas y premisa, y el modelo produce una historia cerrada de la longitud solicitada, adecuada para publicación directa o revisión editorial.
- Creación de series por entregas: usando los tipos `opening of a longer story (part 1 of 3)`, `continuation` y `final part`, junto con el bloque `Previously:` con los últimos ~1.500 caracteres, se pueden encadenar capítulos coherentes sin reescribir el contexto completo.
- Prototipado rápido de premisas y categorías: un editor puede probar distintas combinaciones de categoría, etiquetas y premisa para evaluar qué variantes producen historias más sólidas antes de encargar una pieza a un autor humano.
- Generación local en hardware de consumo: con el GGUF Q4_K_M y `--n-cpu-moe 30` en llama.cpp, el modelo cabe en una GPU de 8 GB con los expertos en RAM del sistema, lo que permite ejecutarlo en un equipo doméstico sin depender de servicios en la nube.
- Integración en front-ends de completado de texto: SillyTavern en modo "Text Completion" con plantilla de instrucciones vacía, KoboldCpp en modo historia o cualquier cliente que llame al endpoint `/completion` de llama.cpp.
- Investigación sobre ajuste fino de MoE con LoRA: el adaptador publicado (rango 64 sobre atención y los 128 expertos) sirve como referencia reproducible para estudiar cómo se comporta un ajuste de nicho sobre un MoE abliterado de 26B con solo ~4B activos.
- Generación por lotes de borradores para revisión humana: con temperatura 0,9, min_p 0,05, top_p 1,0, top_k 0 y repeat_penalty 1,05, se pueden producir varios borradores por cabecera y seleccionar el mejor, aprovechando que el modelo cierra cada historia de forma autónoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento: pérdida de 2,36 en train y 2,32 en validación tras 2 épocas y 668 pasos. Tampoco se ofrecen comparaciones cuantitativas con otros modelos en tareas estándar (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa 16,8 GB en disco; con `--n-cpu-moe 30` los pesos de los expertos se mantienen en RAM del sistema y el modelo funciona en una GPU de 8 GB de VRAM. Bajar el valor de `--n-cpu-moe` (acercándose a llenar la VRAM) aumenta la velocidad.
- GPU recomendadas: cualquier GPU con 8 GB o más para el Q4_K_M con expertos en CPU; con 24 GB (RTX 3090/4090) se puede reducir `--n-cpu-moe` y acelerar la inferencia; A100 y H100 permiten mantener más expertos en VRAM y maximizar throughput.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB como la RTX 3060 Ti, 3070, 4060 o 4060 Ti, siempre con los expertos en RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-server` o `llama-cli`), KoboldCpp y cualquier cliente compatible con el endpoint `/completion`. Requiere una compilación reciente de llama.cpp con soporte para Gemma 4. No debe usarse con `--jinja` ni con plantilla de chat.
- Latencia y throughput: en una GPU de 8 GB, aproximadamente 15-30 tokens/s según la model card. El rendimiento mejora al reducir `--n-cpu-moe` hasta llenar la VRAM disponible.
- Parámetros de muestreo recomendados: temperatura 0,9, min_p 0,05, top_p 1,0, top_k 0, repeat_penalty 1,05, repeat_last_n 256, `n_predict` 6000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Literotica-Writer-26B-A4B | 25,2B totales / ~4B activos (MoE) | 8.192 en entrenamiento; 16.384 en inferencia | Apache 2.0 | Ficción erótica de formato largo, completado de texto | GGUF Q4_K_M y adaptador LoRA en Hugging Face |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | 25,2B totales / ~4B activos (MoE) | No disponible | No disponible | Base abliterada conversacional sin censura | Hugging Face |
| Gemma 4 26B-A4B (base original) | 25,2B totales / ~4B activos (MoE) | No disponible | No disponible | Modelo generalista con alineación | Hugging Face / Google |

La comparación con alternativas de la misma categoría (ajustes finos de ficción erótica de formato largo) no está disponible en la información proporcionada. El modelo base y el Gemma 4 original difieren en alineación y propósito, pero comparten arquitectura y tamaño.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado para generar ficción sexual explícita y lleva la etiqueta `not-for-all-audiences`. No debe usarse con menores ni en contextos donde ese contenido esté prohibido.
- No es un modelo conversacional: no fue entrenado con turnos de chat ni instrucciones. Usarlo con `/v1/chat/completions`, plantillas de chat de Gemma, LM Studio u Ollama en modo chat, o SillyTavern en modo chat-completion produce respuestas de estilo asistente o historias débiles. Tampoco debe arrancarse llama-server con `--jinja` ni `--chat-template`.
- Dependencia estricta del formato de prompt: la cabecera debe respetar exactamente la primera línea, el orden de campos, la línea vacía antes de `STORY:` y el salto de línea posterior. Desviaciones del formato degradan la calidad.
- Riesgo de alucinación y de desviación de la premisa: como todo modelo generativo, puede inventar detalles incoherentes o ignorar partes de la premisa, especialmente con longitudes muy altas o premisas poco concretas.
- Sesgos: al entrenarse sobre un corpus de ficción erótica de una plataforma concreta, puede reproducir estereotipos de género, roles y dinámicas de poder presentes en ese corpus, incluidas categorías como NonConsent/Reluctance o Mind Control.
- Idioma limitado al inglés: no se ha entrenado para otros idiomas y la calidad en castellano u otras lenguas no está garantizada.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el modelo base (TrevorJS/gemma-4-26B-A4B-it-uncensored) y el Gemma 4 original tienen sus propias condiciones de uso que deben verificarse antes de un despliegue comercial. El contenido generado puede estar sujeto a las políticas de la plataforma de destino.
- Sin benchmarks publicados: no hay evaluaciones cuantitativas que permitan comparar su calidad con alternativas; la única métrica disponible es la pérdida de validación (2,32).
- Requiere compilación reciente de llama.cpp con soporte para Gemma 4; versiones antiguas no cargarán el modelo.
- El modelo no está afiliado ni respaldado por Literotica; el uso del nombre de la plataforma es descriptivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViezeVingertjes/Literotica-Writer-26B-A4B
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/detain/literotica-stories
- Literotica (plataforma de origen del corpus): https://www.literotica.com
- Unsloth (librería de entrenamiento): no disponible en la información proporcionada
- llama.cpp (runtime recomendado): no disponible en la información proporcionada
