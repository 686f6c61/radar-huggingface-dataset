# thelamapi/neuvoice2

## Resumen

NeuVoice 2 es un modelo de síntesis de voz (text-to-speech) con capacidades de clonación de voz y diseño de voz por descripción textual, desarrollado por el usuario thelamapi. Se trata de un fine-tuning del modelo openbmb/VoxCPM2, sobre el que el autor ha aplicado entrenamiento adicional con voz en turco. El modelo genera audio a 48 kHz y está empaquetado en la librería Python `neuvoice`, lo que permite integrarlo con pocas líneas de código.

La propuesta diferencial es el "diseño de voz": el usuario escribe una descripción entre paréntesis al inicio del texto (por ejemplo, "una voz regia, con diversión contenida") y el modelo sintetiza la locución con ese carácter. Además, admite clonación a partir de una grabación de referencia, modo de continuación (pasando audio y su transcripción) y combinación de ambos, de modo que una grabación fija "quién" habla y la descripción fija "cómo" lo dice.

El modelo tiene 2.290.004.544 parámetros (~2,29 mil millones) en formato safetensors, un repositorio de 4,6 GB y licencia Apache 2.0. Los idiomas declarados son inglés, turco, alemán y español. Es relevante ahora porque ofrece control expresivo y multilingüe sobre TTS open source con una licencia permisiva, aunque el proyecto es muy reciente (creado en noviembre de 2026) y sin métricas publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de openbmb/VoxCPM2) |
| Parámetros totales | 2.290.004.544 (~2,29 mil millones) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), turco (tr), alemán (de), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es un fine-tuning de openbmb/VoxCPM2 (`base_model_relation: finetune`) y que el autor lo entrenó adicionalmente con habla en turco. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineación.

El modelo produce audio a 48 kHz y expone tres modos de condicionamiento por audio: referencia de voz (`reference_wav_path`), continuación (`prompt_wav_path` + `prompt_text`) y combinado. El control expresivo se realiza mediante descripciones en lenguaje natural entre paréntesis al inicio del texto. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de voz a partir de texto con salida de audio a 48 kHz.
- Diseño de voz por descripción textual: carácter, emoción, ritmo y tono indicados entre paréntesis.
- Clonación de voz a partir de una grabación de referencia (`reference_wav_path`).
- Modo de continuación: dado un audio y su transcripción, continúa hablando en la misma voz.
- Modo combinado: referencia de voz más descripción de estilo simultáneamente.
- Síntesis multilingüe en inglés, turco, alemán y español, con detección automática del idioma a partir del texto.
- Capacidad de mezclar idiomas en un mismo pasaje (probado turco-inglés) y de usar una referencia en un idioma para hablar en otro.
- Expresividad: risas, susurros y tonos íntimos solicitados mediante la descripción (con resultados inconsistentes en el caso de la risa).
- No se documenta soporte de tool calling, agentes ni otras modalidades (visión, audio de entrada más allá de la referencia).

## Casos de uso

- Audiolibros y narración multicarácter: describir cada personaje entre paréntesis y sintetizar sus diálogos con voces distintas sin contratar actores, usando el modo de diseño de voz.
- Doblaje y localización de contenido: clonar la voz de un locutor a partir de una grabación y generar la misma línea en inglés, alemán, español o turco, manteniendo la identidad vocal.
- Asistentes de voz y atención al cliente: generar respuestas habladas con un timbre corporativo fijo mediante referencia de voz y ajustar el tono (formal, cercano) con descripciones.
- Producción de pódcast y radio: crear sintonías, cuñas y personajes ficticios (por ejemplo, un presentador nocturno) con estilo consistente usando el modo combinado.
- Accesibilidad y lectura de textos: convertir documentos o artículos en audio con una voz clonada del propio usuario para lectura personal.
- Prototipado de videojuegos y animación: generar voces de personajes con descripciones rápidas antes de contar con actores, gracias a la licencia Apache 2.0 y a la integración en Python.
- Investigación en TTS expresivo: usar el modelo como base para estudiar control por lenguaje natural de prosodia y emoción en cuatro idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~2,29 mil millones de parámetros, en FP16 el peso ronda los 4,6 GB, por lo que se necesita al menos esa cantidad más memoria para activaciones y buffers de audio; en cuantizaciones de 8 bits o 4 bits el requisito bajaría, aunque no se documentan formatos cuantizados.
- GPU recomendadas: no disponible. Por tamaño, una GPU consumer con 8-12 GB de VRAM debería poder alojar el modelo en FP16, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? Probablemente sí en tarjetas de gama media-alta (RTX 3060 12 GB, RTX 4070, RTX 4090), si bien no se aportan datos verificados.
- Opciones de despliegue: la vía documentada es la librería Python `neuvoice`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son el entorno habitual para TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Diseño por descripción | Licencia |
|---|---|---|---|---|---|
| NeuVoice 2 | ~2,29 mil millones | en, tr, de, es | Sí | Sí | Apache 2.0 |
| openbmb/VoxCPM2 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (parámetros, contexto, rendimiento o disponibilidad). El único punto de referencia documentado es el modelo base openbmb/VoxCPM2, del que no se detallan especificaciones en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks objetivos; la calidad se evalúa únicamente por muestras de audio subjetivas de la model card.
- La risa es inconsistente: a veces genera una carcajada natural y a veces lee "ha ha" como texto literal.
- El parecido de la clonación depende de la grabación de referencia, del texto y de cierta variabilidad entre generaciones; no está garantizado.
- Cada generación produce resultados ligeramente distintos, lo que complica la reproducibilidad en producción.
- El fine-tuning se centró en turco; el rendimiento en alemán y español se validó "de oído", sin métricas.
- No se documentan sesgos conocidos, pero al ser un modelo de voz entrenado con datos no especificados, pueden aparecer sesgos de acento, género o prosodia.
- Riesgo de alucinación prosódica: entonación o énfasis incorrectos en textos ambiguos o descripciones poco claras.
- Uso comercial permitido por la licencia Apache 2.0, pero la clonación de voces plantea riesgos éticos y legales (suplantación de identidad) que el autor no aborda.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento no verificables.
- No se documentan límites de longitud de texto ni de duración de audio de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/neuvoice2
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
