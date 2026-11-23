# ViezeVingertjes/Literotica-Writer-26B-A4B

## Resumen

Literotica-Writer-26B-A4B es un ajuste fino (LoRA) del modelo abliterado TrevorJS/gemma-4-26B-A4B-it-uncensored, desarrollado por el usuario ViezeVingertjes. Está especializado en la generación de ficción erótica de formato largo en inglés: a partir de una cabecera breve (título, categoría, etiquetas, longitud y premisa) produce relatos completos de entre 1.000 y 5.000 palabras que terminan por sí solos con el token EOS. Es, por tanto, un modelo de completado de texto puro, no un modelo conversacional.

La base es un transformer de mezcla de expertos (MoE) de tipo Gemma 4 con 25.233.142.046 parámetros totales y aproximadamente 4.000 millones activos, distribuidos en 128 expertos de los que 8 se activan por token. El ajuste se realizó sobre 9.315 relatos y fragmentos del dataset detain/literotica-stories, cubriendo 25 categorías, con 2 épocas, 668 pasos y un contexto empaquetado de 8.192 tokens, empleando una única H100 durante unas 4,7 horas.

Su relevancia actual reside en dos factores. Primero, demuestra que un MoE de 26B puede ejecutarse en local en una GPU de 8 GB de VRAM manteniendo los expertos en RAM del sistema mediante llama.cpp, gracias a su reducido número de parámetros activos. Segundo, la publicación de cuantizaciones con matriz de importancia (imatrix) reduce drásticamente la degradación de palabras en Q4_K_M, un problema que el autor documenta y corrige en la revisión del 20 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4 26B-A4B), 128 expertos con 8 activos por token |
| Parametros totales | 25.233.142.046 |
| Parametros activos | ~4B |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento empaquetado); longitud máxima de inferencia no disponible |
| Tipos de cuantizacion | i1-Q4_K_M (imatrix), Q8_0; adaptador LoRA en precisión completa; imatrix.gguf para generar cuantizaciones propias |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors (adaptador LoRA PEFT/Unsloth) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 4 26B-A4B de su base: un transformer de mezcla de expertos con 128 expertos y 8 activos por token, lo que resulta en unos 4.000 millones de parámetros efectivos por paso de cómputo sobre un total de 25.233.142.046. La base TrevorJS/gemma-4-26B-A4B-it-uncensored es una versión abliterada (sin las capas de rechazo del modelo original), lo que permite generar contenido explícito sin filtros de seguridad.

El ajuste fino se aplicó como LoRA con rango 64 y alpha 64 sobre las capas de atención y sobre los 128 expertos, usando la herramienta Unsloth. Los datos de entrenamiento provienen del dataset detain/literotica-stories: 9.315 relatos y fragmentos, 25 categorías y 3.003 piezas procedentes de relatos mejor valorados. El entrenamiento consistió en 2 épocas, 668 pasos, batch efectivo de 16, contexto empaquetado de 8.192 tokens, learning rate 2e-4 con decaimiento coseno, durante aproximadamente 4,7 horas en una H100. La pérdida final fue de 2,36 en entrenamiento y 2,32 en validación. El formato de entrenamiento es completado de texto plano: una cabecera estructurada, la línea `STORY:` y el relato a continuación, sin turnos de chat ni instrucciones conversacionales.

## Capacidades

- Generación de ficción erótica de formato largo en inglés, con relatos completos de 1.000 a 5.000 palabras que terminan de forma autónoma.
- Completado de texto puro desde una cabecera estructurada con campos de título, categoría, etiquetas, tipo, longitud y premisa.
- Generación por partes: aperturas, continuaciones y capítulos finales de relatos largos mediante los valores de `Type:` entrenados, con bloque `Previously:` para mantener coherencia.
- Seguimiento aproximado de la longitud solicitada en palabras y de la categoría temática indicada.
- Escritura sin censura de contenido adulto explícito, incluyendo categorías como BDSM, incesto/tabú, control mental, exhibicionismo o ciencia ficción erótica.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Generación de relatos eróticos completos para plataformas de ficción para adultos: el modelo recibe una cabecera con título, categoría y premisa y devuelve un relato cerrado de la longitud pedida, sin necesidad de intervención posterior.
- Serialización de ficción larga por capítulos: usando `Type: opening of a longer story (part 1 of 3)` y las continuaciones correspondientes con bloque `Previously:`, se pueden encadenar partes coherentes de una misma historia.
- Creación de contenido para comunidades de escritura amateur: un autor puede generar borradores de 1.000 a 5.000 palabras como punto de partida y editarlos después, aprovechando que el modelo respeta categoría y etiquetas.
- Despliegue local en hardware de consumo: con el GGUF i1-Q4_K_M (16,8 GB) y los expertos en RAM del sistema, funciona en una GPU de 8 GB de VRAM mediante llama.cpp, lo que permite ejecutarlo en estaciones de trabajo modestas sin depender de servicios en la nube.
- Generación por lotes de bibliotecas de ficción: al ser un modelo de completado determinista en formato y terminación automática, se puede integrar en scripts que alimenten cabeceras desde una lista y recojan los relatos generados vía el endpoint `/completion` de llama.cpp.
- Prototipado de front-ends de escritura creativa: sirve como motor de pruebas para interfaces de completado de texto (SillyTavern en modo Text Completion, KoboldCpp en modo historia) que necesiten un modelo especializado en narrativa adulta.
- Investigación sobre ajuste fino con LoRA en MoE: el adaptador publicado y la imatrix permiten reproducir el proceso y estudiar el efecto de la cuantización con matriz de importancia en la calidad léxica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento (pérdida de entrenamiento 2,36 y de validación 2,32) y una evaluación cualitativa de palabras corruptas por cuantización: aproximadamente 1 cada 900 palabras en el Q4_K_M original, 1 cada 9.000 en el i1-Q4_K_M y 1 cada 6.000 o más en el modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el i1-Q4_K_M (16,8 GB) cabe en una GPU de 8 GB de VRAM si los expertos se mantienen en RAM del sistema; el Q8_0 (26,9 GB) requiere más espacio y no aporta ganancia medible de calidad según el autor.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para el i1-Q4_K_M con offload de expertos; H100 para entrenamiento (documentado); GPU de gama alta (A100, H100) para el Q8_0 completo en VRAM.
- Cabe en GPU de consumo: sí, el i1-Q4_K_M en tarjetas de 8 GB (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070) con los expertos en RAM del sistema.
- Opciones de despliegue: llama.cpp (recomendado, endpoint `/completion`), llama-server sin `--jinja` ni `--chat-template`, KoboldCpp en modo historia, SillyTavern en modo Text Completion con plantilla de instrucciones vacía. No debe usarse con endpoints de chat (`/v1/chat/completions`), LM Studio u Ollama en modo chat, ni SillyTavern en modo chat-completion.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Literotica-Writer-26B-A4B | 25,2B totales, ~4B activos | 8.192 tokens (entrenamiento) | Apache 2.0 | Ficción erótica de formato largo, completado de texto | GGUF y LoRA en Hugging Face |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | 25,2B totales, ~4B activos | no disponible | no disponible | Base abliterada conversacional | Hugging Face |
| Gemma 4 26B-A4B (original) | 25,2B totales, ~4B activos | no disponible | no disponible | Modelo generalista con alineación | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos especializados en ficción erótica de formato largo con los que establecer una comparación cuantitativa en la información proporcionada.

## Limitaciones y advertencias

- Contenido exclusivamente para adultos (18+): el modelo genera ficción sexual explícita y no debe usarse en entornos accesibles a menores.
- No es un modelo de chat: usarlo con plantillas de chat, endpoints conversacionales o front-ends de rol produce respuestas de estilo asistente o relatos débiles.
- El formato de la cabecera debe respetarse literalmente, incluida la primera línea fija, la línea en blanco antes de `STORY:` y el salto de línea posterior.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La cuantización Q4_K_M original corrompía palabras (aproximadamente 1 cada 900); debe usarse el i1-Q4_K_M o el Q8_0.
- Riesgo de alucinación y de incoherencias narrativas en relatos muy largos o en cadenas de continuaciones sin bloque `Previously:` adecuado.
- Sesgos conocidos: no documentados en la información disponible, aunque el modelo base abliterado y el corpus de Literotica pueden introducir sesgos temáticos y de representación.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado está sujeto a las normativas sobre material adulto de cada jurisdicción.
- No afiliado ni respaldado por Literotica; el uso del nombre de la plataforma en el modelo no implica relación alguna.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViezeVingertjes/Literotica-Writer-26B-A4B
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/detain/literotica-stories
- Literotica: https://www.literotica.com
- Unsloth: no disponible en la información proporcionada
- llama.cpp: no disponible en la información proporcionada
