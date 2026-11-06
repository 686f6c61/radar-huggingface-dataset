# TechnoBaptist/phonon-refiner-1.7b

## Resumen

Phonon refiner 1.7B es un modelo de corrección de transcripciones de voz (speech-to-text post-processing) desarrollado por TechnoBaptist. Se trata de un fine-tune de LiquidAI/LFM3-1.7B, un transformer denso de 1.728.801.536 parámetros, que actúa como la etapa de refinado dentro de Phonon, una aplicación local de dictado por voz para Macs con Apple Silicon. El modelo recibe la transcripción cruda generada por Parakeet TDT 0.6B v2 y la reescribe en el texto que el hablante pretendía teclear: corrige palabras mal reconocidas y términos técnicos, elimina muletillas y arranques en falso, conserva solo la versión final cuando el hablante se autocorrige y da formato al texto según la aplicación de destino.

La relevancia del modelo radica en su enfoque de despliegue local y especializado: no aspira a ser un asistente general, sino un componente estrecho y afinado para una tarea concreta dentro de un pipeline de dictado. Incorpora cuatro modos de escritura (minimal, casual, formal y prompt) que se seleccionan mediante una línea del system prompt, lo que permite adaptar el registro y el formato al contexto de destino sin cambiar de modelo.

El modelo se distribuye con pesos en formato GGUF (Q4_K_S) para un motor nativo en Metal, pesos MLX con cuantización de 4, 6 y 8 bits como alternativa, y un drafter especulativo DFlash2. La licencia es LFM Open License v1.0, etiquetada como "other", y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_S; MLX 4/6/8-bit |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (MLX), GGUF (Q4_K_S y drafter DFlash2) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer denso LiquidAI/LFM3-1.7B, sin cambios arquitectónicos documentados respecto al modelo base. La innovación principal no está en la arquitectura sino en el entrenamiento orientado a la tarea: el conjunto de datos total asciende a 76.960 filas, dividido en dos bloques de 38.480 filas cada uno. El primer bloque corresponde a filas con línea de modo de escritura, con objetivos generados por DeepSeek-V4.1-Flash-1017 (licencia MIT) a partir de una especificación escrita del texto pretendido; las entradas son transcripciones de Parakeet TDT 0.6B v2 de tres fuentes: 3.000 fragmentos de audio técnico público (11.467 filas), 3.000 fragmentos de retransmisiones de programación (11.428 filas) y 4.199 dictados sintéticos (15.585 filas), aproximadamente la mitad con autocorrección o reinicio. El segundo bloque son las filas del refiner 0.2.3 sin línea de modo, etiquetadas por el mismo modelo ejecutado localmente, que incluyen charlas técnicas de YouTube, filas de reparación de términos (con una línea de vocabulario que contiene el término correcto) y negativos duros con vocabulario no relacionado que no deben modificarse.

Todos los objetivos pasaron por una compuerta de edición que deshace las sustituciones de palabras que la transcripción no puede respaldar. El modelo incorpora además un drafter especulativo DFlash2 (214.803.168 bytes) para decodificación especulativa en el motor nativo de Metal, y la configuración de generación se distribuye sin penalización por repetición.

## Capacidades

- Corrección de transcripciones ASR: repara palabras mal reconocidas y términos técnicos usando como evidencia la línea de vocabulario o el contexto inequívoco.
- Eliminación de muletillas: hesitaciones, tartamudeos, repeticiones, "like", "you know", "I mean" sin significado, tag questions y conectores de apertura de frase.
- Resolución de autocorrecciones: conserva únicamente la versión final del hablante cuando este se corrige o reinicia una frase, sin las palabras de corrección.
- Formato numérico y simbólico: escribe dígitos y símbolos como lo haría un ingeniero.
- Cuatro modos de escritura seleccionables mediante una línea del system prompt: minimal (notas y documentos), casual (chat personal, minúsculas salvo nombres, acrónimos y "I", sin punto final), formal (correo y chat de trabajo, frases completas, saludo y despedida en líneas propias) y prompt (instrucciones a asistentes de IA, pasos separados como lista numerada, sin responder ni extender la petición).
- Comportamiento por defecto sin línea de modo equivalente al refiner 0.2.3, ya que la mitad de las filas de entrenamiento son de ese modelo sin línea.
- Generación de texto conversacional (pipeline text-generation) heredada del modelo base.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Dictado en aplicaciones de notas y documentos: con el modo minimal, el modelo limpia la transcripción de Parakeet y produce texto listo para pegar en un editor, eliminando muletillas y reparando términos técnicos mediante la línea de vocabulario.
- Mensajería personal: con el modo casual, convierte el dictado en mensajes de chat con minúsculas, sin punto final y conservando el registro informal del hablante, adecuado para Discord, Messages, WhatsApp, Telegram o X.
- Correo electrónico y chat de trabajo: con el modo formal, genera frases completas, corrige deslices gramaticales sin reformular y coloca saludo y despedida en líneas separadas, para Mail, Outlook, Gmail, Superhuman, Slack, Teams o Google Chat.
- Instrucciones a asistentes de IA: con el modo prompt, reescribe una petición dictada a ChatGPT, Claude, Gemini o Codex en su versión final, convierte pasos separados en lista numerada y evita responder o ampliar la petición.
- Dictado para programadores: el entrenamiento incluye retransmisiones de programación y filas de reparación de términos técnicos, por lo que el modelo corrige nombres de funciones, APIs y términos de ingeniería en terminales y editores de código.
- Integración en un pipeline local de voz a texto en Macs Apple Silicon: el modelo se carga en el motor nativo de Metal con el GGUF Q4_K_S y el drafter DFlash2, o mediante los pesos MLX como alternativa cuando el motor no puede ejecutarse, sin enviar audio ni texto a servicios externos.
- Reescritura de actas o apuntes de charlas técnicas: las filas de entrenamiento provienen de charlas, tutoriales y cursos públicos de YouTube, lo que lo hace adecuado para limpiar transcripciones de contenido técnico hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el archivo `phonon_refiner.json` contiene números de evaluación, pero no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_S ocupa 988.453.696 bytes (aproximadamente 0,99 GB); los pesos MLX con cuantización de 4/6/8 bits ocupan 1.133.072.561 bytes (aproximadamente 1,13 GB). El drafter especulativo DFlash2 añade 214.803.168 bytes (aproximadamente 0,21 GB).
- GPU recomendadas: el motor nativo está diseñado para Apple Silicon (Metal); no se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: por tamaño, sí; el despliegue previsto es local en Macs con Apple Silicon.
- Opciones de despliegue: motor nativo de Phonon sobre Metal (GGUF Q4_K_S más drafter DFlash2, según `phonon_engine.json`) y pesos MLX como alternativa. No se documenta soporte para vLLM, llama.cpp genérico, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phonon refiner 1.7B | 1.728.801.536 | No disponible | Corrección de transcripciones ASR y formato por modo de escritura | LFM Open License v1.0 | Hugging Face, pesos GGUF y MLX |
| LiquidAI/LFM3-1.7B (modelo base) | 1.7B (aproximado) | No disponible | Generación de texto general | No disponible en la información | Hugging Face |
| Refiner 0.2.3 de Phonon (commit `74ea4b6`) | No disponible | No disponible | Corrección de transcripciones sin modos de escritura | No disponible | Mismo repositorio |

No se dispone de datos de benchmarks ni de otros modelos de corrección ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo soporta inglés; no se documenta cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar el procesamiento de transcripciones largas.
- Riesgo de alucinación: el modelo está entrenado para no inventar palabras ni perder significado, y los objetivos pasaron por una compuerta de edición, pero no se publican métricas de tasa de error en la información disponible.
- Sesgos: no se documentan sesgos conocidos; el entrenamiento usa audio técnico público, retransmisiones de programación y dictados sintéticos, lo que puede infrarrepresentar dominios ajenos al técnico.
- Licencia: LFM Open License v1.0, etiquetada como "other"; deben revisarse las restricciones de uso comercial en el archivo LICENSE antes de integrarlo en producción.
- Dependencia de la línea de vocabulario: la reparación de términos técnicos depende de que se proporcione evidencia en la línea de vocabulario o en el contexto; sin ella, el modelo no debe sustituir palabras.
- Sin línea de modo, el comportamiento degrada al refiner 0.2.3, sin las reglas específicas de cada modo de escritura.
- Despliegue limitado: las opciones documentadas son el motor nativo de Phonon en Metal y los pesos MLX; no se garantiza funcionamiento en otras pilas de inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/phonon-refiner-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio de Phonon: https://github.com/Infatoshi/phonon
