# xiaojingaishuij/Rocinante-XL-16B-v1-GGUF

## Resumen

Rocinante XL 16B v1 es un modelo de lenguaje conversacional derivado de Mistral-Nemo-Instruct-2407 mediante un proceso de ampliación (upscaling) de 12B a 16B parámetros y posterior ajuste fino. Lo desarrolla TheDrummer, un ingeniero de software conocido en la comunidad por sus finetunes orientados a creatividad, rol y escritura, y esta versión GGUF la publica el usuario xiaojingaishuij en Hugging Face. El modelo está pensado para generación de prosa, diálogo y roleplay, no para tareas de razonamiento o corrección estricta.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado sin model card propia más allá de la heredada del autor original. La información técnica disponible es escasa y procede casi por completo del modelo base (Mistral-Nemo) y de la model card de TheDrummer, por lo que muchos parámetros se marcan como no disponibles.

Arquitectura transformer densa (no MoE) con 16.064.742.400 parámetros totales según los safetensors del repositorio, empaquetada en formato GGUF y con un tamaño de repo de 65,5 GB, lo que sugiere múltiples cuantizaciones. El contexto heredado del modelo base es de 128.000 tokens, aunque el autor no lo confirma explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Nemo-Instruct-2407, upscaling de 12B a 16B) |
| Parametros totales | 16.064.742.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base Mistral-Nemo soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (el repo GGUF de 65,5 GB sugiere varias cuantizaciones, sin detallar) |
| Idiomas soportados | no disponible (el modelo base es multilingüe: ingles, frances, aleman, espanol, italiano, portugues, entre otros) |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Modelo base | mistralai/Mistral-Nemo-Instruct-2407 |
| Tamano del repo | 65,5 GB |
| Plantillas de prompt | Mistral v3 Tekken (sin `[SYSTEM_PROMPT]`) o Metharme |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Nemo-Instruct-2407, un transformer denso de 12B parámetros de Mistral AI y NVIDIA, y aplica un proceso de upscaling a 16B parámetros antes de un ajuste fino adicional. La model card no detalla la técnica exacta de expansión (por ejemplo, si se duplicaron capas, se expandieron dimensiones ocultas o se combinaron ambas), ni el volumen de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO. Tampoco se especifica la técnica de alineación empleada; el autor declara explícitamente que sus modelos priorizan creatividad y usabilidad sobre alineación y corrección.

Como innovaciones destacables, la model card menciona que la etiqueta `<thinking>` `</thinking>` funciona para activar razonamiento explícito y que también funciona sin ella. Se recomienda usar la plantilla Mistral v3 Tekken eliminando el bloque `[SYSTEM_PROMPT]`, o bien la plantilla Metharme. El autor incluye una hoja de cálculo colaborativa de samplers recomendados por la comunidad. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto creativo: prosa, narrativa y escritura literaria, según declara el autor como objetivo principal.
- Roleplay y diálogo multi-turno: la model card enfatiza "robust roleplaying" y "fun dialogue".
- Modo de razonamiento opcional mediante etiquetas `<thinking>` `</thinking>`, que puede activarse o desactivarse.
- Seguimiento de instrucciones y adherencia al prompt, dentro de las limitaciones de un finetune creativo.
- Capacidades multilingües heredadas del modelo base (no confirmadas explícitamente para este finetune).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Escritura creativa y narrativa: el modelo está ajustado para generar prosa con dinamismo e imaginación, adecuado para redactar relatos, capítulos o borradores literarios donde se prioriza el estilo sobre la exactitud factual.
- Roleplay conversacional: su entrenamiento orientado a diálogo y personajes permite mantener interacciones multi-turno con consistencia de tono, útil en plataformas de entretenimiento conversacional.
- Generación de diálogos para guiones o videojuegos: puede producir variantes de líneas de personaje y explorar registros distintos sin el sesgo de positividad forzada que el autor critica en modelos alineados.
- Prototipado de asistentes creativos: al funcionar en GGUF, se puede desplegar localmente con llama.cpp u Ollama para experimentar con samplers y plantillas sin coste de API.
- Exploración de estilos y formatos: la model card destaca la capacidad de crear formatos novedosos de respuesta, útil para experimentar con estructuras de salida no convencionales.
- Investigación sobre finetunes y desalineación: sirve como caso de estudio de upscaling de modelos y de ajuste fino orientado a creatividad, para quienes investigan el efecto de la alineación en la expresividad del modelo.
- Generación de contenido de ficción interactiva: con contexto potencialmente largo (heredado del base), puede sostener sesiones de escritura colaborativa o aventuras de texto extensas, aunque la longitud efectiva no está confirmada para este finetune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente testimonios cualitativos de usuarios (por ejemplo, que "con thinking rinde por encima de su peso, más como un modelo de 24B a 32B"), sin cifras verificables de MMLU, HumanEval, GSM8K ni otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (16B parámetros), en cuantización Q4_K_M se necesitan aproximadamente 10-11 GB de VRAM, en Q8_0 alrededor de 17-18 GB y en FP16 unos 32 GB; estas cifras son estimaciones por parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) podría ejecutar cuantizaciones Q4 y Q8; para FP16 se requeriría una A100 40 GB o H100.
- Cabe en GPU de consumo: probablemente sí en GPUs de 12 GB o más con cuantizaciones bajas (Q4), aunque no está confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no están confirmados para este repo GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rocinante XL 16B v1 | 16B (denso) | no confirmado (base: 128K) | Creatividad, rol, prosa | no disponible | GGUF en HF, 0 descargas |
| Mistral-Nemo-Instruct-2407 | 12B (denso) | 128K | Instrucciones generales | Apache 2.0 (modelo base) | Ampliamente disponible |
| Mistral Small 24B (referencia de categoría) | 24B (denso) | 128K | Instrucciones generales | Apache 2.0 | Ampliamente disponible |
| Finetunes creativos de la comunidad (p. ej. Cydonia) | 12B-24B | variable | Rol y escritura | variable | HF, comunidad |

La comparación con Mistral-Nemo es la más directa, ya que Rocinante XL deriva de él y lo amplía. Frente a modelos de instrucciones generales, Rocinante XL prioriza expresividad sobre corrección y alineación, lo que lo hace menos adecuado para tareas factuales o de código en producción. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Sesgos conocidos: el autor declara explícitamente que sus modelos no priorizan alineación ni seguridad, y que buscan evitar la "positividad forzada"; esto puede traducirse en respuestas con sesgos, lenguaje soez o contenido no filtrado.
- Riesgo de alucinación: alto en tareas factuales, dado que el ajuste fino está orientado a creatividad y no a exactitud; no debe usarse como fuente de verdad.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva de este finetune no está confirmada; el soporte multilingüe se hereda del base pero no se verifica en la model card.
- Restricciones de licencia: la licencia no está indicada en la información disponible, lo que impide confirmar si el uso comercial está permitido; debe consultarse antes de cualquier despliegue en producción.
- Madurez y soporte: el repositorio tiene cero descargas y cero likes, fue creado y actualizado el mismo día y no cuenta con pipeline declarado; es un artefacto de nicho sin validación comunitaria.
- Trazabilidad: la model card del repo GGUF reproduce la del autor original (TheDrummer) e incluye contenido promocional y enlaces externos (Discord, Patreon) que no aportan información técnica verificable.
- Plantilla de prompt: requiere configuración manual (Mistral v3 Tekken sin `[SYSTEM_PROMPT]` o Metharme); un uso incorrecto de la plantilla degrada la calidad de salida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xiaojingaishuij/Rocinante-XL-16B-v1-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Perfil del autor original: https://huggingface.co/TheDrummer
- Hoja de samplers colaborativa: https://docs.google.com/spreadsheets/d/1wil6YEHTnQP3DO9EF35ImQMY3lbmRt5_ns-LJavUqwQ
- Formulario para compartir samplers: https://docs.google.com/forms/d/e/1FAIpQLSfeiOeLbNt-xc8tr0BopJ4KawMm3YrLGD5mYLjZqg8ehl35BQ/viewform
- Discord de BeaverAI: https://discord.gg/BeaverAI
- Enlaces del autor: https://linktr.ee/thelocaldrummer
- Patreon del autor: https://www.patreon.com/TheDrummer
