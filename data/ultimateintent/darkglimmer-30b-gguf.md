# UltimateIntent/DarkGlimmer-30B-GGUF

## Resumen

DarkGlimmer-30B-GGUF es un ajuste fino (finetune) del modelo base Muse-Glimmer-30B, publicado por el usuario UltimateIntent en Hugging Face. Se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y está orientado a generación de texto creativo: escritura creativa, roleplay, narrativa y ficción para adultos (etiquetas nsfw, erp, mature-fiction). El modelo es de solo texto, monolingüe en inglés y no está pensado para todos los públicos.

El modelo cuenta con 27.854.794.240 parámetros totales (aproximadamente 27,9 mil millones), lo que lo sitúa en la categoría de modelos densos de ~30B. El repositorio ocupa 150,9 GB, coherente con la publicación de múltiples cuantizaciones GGUF. La licencia declarada es Apache 2.0, aunque el modelo base pertenece a un autor distinto (meta-models/Muse-Glimmer-30B), lo que conviene verificar antes de un uso comercial.

La relevancia de esta ficha es limitada y hay que interpretarla con cautela: el modelo tiene 43 descargas y 0 likes en el momento de la consulta, no incluye datos de benchmarks ni especificaciones técnicas detalladas en la model card, y esta se limita a estilos CSS y etiquetas. Toda la información técnica disponible procede de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Muse-Glimmer-30B; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 27.854.794.240 (~27,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas en la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (librería gguf, compatible con llama-cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la información proporcionada. El modelo base es meta-models/Muse-Glimmer-30B, del que no se detallan características arquitectónicas (tipo de transformer, atención, número de capas, dimensión oculta ni ventana de contexto). El tamaño de 27,9B parámetros sugiere un modelo denso de la familia de ~30B, pero no hay confirmación.

Respecto al entrenamiento, la model card indica que se trata de un finetune sobre Muse-Glimmer-30B e incluye la etiqueta "lora" y "heretic", lo que sugiere que el ajuste se realizó mediante LoRA y posiblemente con técnicas de "abliteration" o eliminación de rechazos (heretic) para reducir las restricciones de contenido. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto creativo: escritura de ficción, narrativa y relatos, según las etiquetas creative-writing y storytelling.
- Roleplay y conversación de personajes: etiquetas roleplay y conversational.
- Ficción para adultos: etiquetas mature-fiction, nsfw y erp (roleplay erótico), con un ajuste orientado a reducir rechazos (heretic).
- Generación de texto general: pipeline text-generation.
- Modelo de solo texto: no admite visión, audio ni otras modalidades.
- Monolingüe en inglés: no se declara soporte multilingüe.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de relatos, capítulos y diálogos en inglés, aprovechando su ajuste específico para narrativa y su etiqueta storytelling.
- Roleplay conversacional: adecuado para personajes interactivos y chatbots de rol, dado el ajuste en roleplay y conversational y la reducción de rechazos (heretic) para tramas adultas.
- Ficción para adultos: generación de narrativa mature/nsfw en entornos controlados y con las advertencias legales y de contenido correspondientes.
- Prototipado de juegos de texto: generación de descripciones, diálogos de NPC y ramificaciones narrativas en inglés, desplegado localmente con llama.cpp.
- Generación de contenido editorial de ficción: apoyo a autores para superar bloqueos creativos y producir variantes de escenas, siempre con revisión humana.
- Experimentación e investigación en ajuste fino: al ser un finetune LoRA sobre un base de ~30B en GGUF, sirve como referencia para estudiar técnicas de abliteration/heretic y su efecto en la calidad del texto.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, permite inferencia en CPU/GPU consumer mediante llama.cpp u Ollama, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~27,9B en GGUF: una cuantización Q4_K_M requeriría aproximadamente 16-18 GB de VRAM; Q8_0 rondaría los 30 GB; FP16 necesitaría unos 56 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en una RTX 4090 (24 GB) con cuantizaciones Q4/Q5, y en A100 40/80 GB o H100 para cuantizaciones altas o FP16.
- GPU consumer: sí, previsiblemente en RTX 3090/4090 (24 GB) con cuantizaciones de 4-5 bits; en GPUs de 12-16 GB solo con cuantizaciones muy agresivas o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, y servidores compatibles con endpoints (la etiqueta endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI). vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación rigurosa. Se indica a continuación lo que se conoce de cada alternativa, marcando los datos no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DarkGlimmer-30B-GGUF | ~27,9B | no disponible | Apache 2.0 | GGUF | Finetune para ficción/roleplay; sin benchmarks |
| Muse-Glimmer-30B (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva DarkGlimmer |
| Alternativas de ~30B para escritura creativa | no disponible | no disponible | no disponible | no disponible | No se identifican en la información proporcionada |

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como not-for-all-audiences, nsfw y erp; no debe desplegarse en entornos sin control de edad ni en productos dirigidos al público general.
- Riesgo de alucinación: no hay datos sobre su tasa de alucinación ni sobre evaluación de fidelidad; como modelo generativo de ficción, la veracidad factual no es su objetivo.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto; no debe asumirse una ventana larga para conversaciones multi-turno prolongadas.
- Licencia: se declara Apache 2.0, pero el modelo base es de un tercero (meta-models/Muse-Glimmer-30B); conviene verificar los términos del base antes de uso comercial.
- Sesgos: no documentados; los finetunes de roleplay/ficción para adultos pueden reproducir estereotipos de género o culturales sin que exista una evaluación publicada.
- Madurez y soporte: 43 descargas y 0 likes, sin documentación técnica ni benchmarks; es un modelo de nicho con escasa validación comunitaria.
- Técnica "heretic": la reducción de rechazos puede aumentar la probabilidad de generar contenido dañino o no deseado; requiere filtros y moderación en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UltimateIntent/DarkGlimmer-30B-GGUF
- Modelo base (referenciado): meta-models/Muse-Glimmer-30B (no se dispone de URL directa en la información proporcionada)
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
