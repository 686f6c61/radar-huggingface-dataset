# TheDrummer/Orion-26B-A4B-v1

## Resumen

Orion 26B A4B v1 es un ajuste fino (finetune) del modelo google/gemma-4-31B-it, desarrollado por TheDrummer, un ingeniero de software conocido en la comunidad por sus modelos orientados a creatividad, escritura y entretenimiento. El modelo parte de una arquitectura Gemma 4 con 25.805.936.206 parámetros totales (aproximadamente 25,8 mil millones) y un tamaño de repositorio de 51,6 GB en formato safetensors. La nomenclatura "A4B" sugiere un diseño de mezcla de expertos con aproximadamente 4 mil millones de parámetros activos, aunque la información disponible no confirma explícitamente esta arquitectura.

El modelo está diseñado para usos creativos y de entretenimiento, priorizando cualidades como la calidad de escritura, el dinamismo narrativo, la imaginación y un comportamiento menos alineado que los modelos fundacionales. Según el autor, el objetivo no es maximizar la inteligencia o la corrección, sino ofrecer una experiencia más libre para escritura creativa, roleplay y generación de contenido sin las restricciones típicas de los modelos comerciales.

Es relevante en el ecosistema open source porque ofrece una alternativa de ajuste fino sobre Gemma 4 con soporte para modos de razonamiento ("thinking") flexibles, incluyendo bloques personalizados como `<thinking>`, `<think>` o `<evil_think>`, y porque está disponible tanto en formato safetensors como en GGUF (a través de repositorios separados y de terceros como bartowski), lo que facilita su despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer, posiblemente MoE según nomenclatura A4B; no confirmado) |
| Parametros totales | 25.805.936.206 (≈25,8 B) |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4 B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la información proporcionada; existen versiones GGUF en repositorios separados |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo principal); GGUF en repositorios separados |

## Arquitectura y entrenamiento

El modelo se basa en google/gemma-4-31B-it, un modelo de la familia Gemma 4 de Google con 31 mil millones de parámetros nominales según el nombre del modelo base, aunque el recuento real de safetensors es de 25,8 mil millones. La nomenclatura "A4B" es característica de los modelos de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parámetros activos, pero la información proporcionada no detalla la arquitectura interna ni confirma esta estructura. El ajuste fino se realizó sobre el modelo instructivo de Gemma 4, presumiblemente mediante técnicas de fine-tuning supervisado y posiblemente preferencias, aunque no se especifican los detalles del dataset, el número de tokens de entrenamiento ni la composición de los datos.

La innovación técnica destacable es el soporte flexible para modos de razonamiento: el modelo puede operar con la plantilla estándar de Gemma 4 en modo thinking o non-thinking, y también acepta bloques de pensamiento personalizados como `<thinking></thinking>`, `<think></think>` o incluso `<evil_think></evil_think>`, que pueden describirse en el system prompt. Esta flexibilidad permite al usuario controlar el estilo y la profundidad del razonamiento sin necesidad de cambiar de plantilla. No se dispone de información sobre el uso de RLHF, DPO u otras técnicas de alineación, aunque el autor declara explícitamente que sus modelos priorizan la creatividad sobre la alineación.

## Capacidades

- Generación de texto creativo: escritura narrativa, ficción, diálogo y roleplay con énfasis en calidad literaria y dinamismo.
- Razonamiento configurable: soporte de modo thinking estándar de Gemma 4 y modos personalizados mediante bloques `<thinking>`, `<think>` o etiquetas definidas por el usuario.
- Instrucciones flexibles: capacidad de seguir system prompts que definen estilos de pensamiento y personalidad.
- Formateo adaptable: el autor destaca la capacidad del modelo para crear formatos novedosos y efectivos en las respuestas.
- Conocimiento del mundo: conocimiento tanto ficticio como no ficticio, según los criterios de evaluación del autor.
- Percepción de matices: manejo de complejidad, lógica y temas difíciles o ambiguos.
- Menor alineación corporativa: el modelo está diseñado para evitar rechazos innecesarios y sesgos de positividad forzada, lo que facilita temas adultos o controvertidos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa y narrativa: el modelo puede generar relatos, novelas cortas y guiones con un estilo literario cuidado, gracias a su entrenamiento orientado a la calidad de escritura y dinamismo narrativo. Es adecuado para autores que buscan un asistente con menos restricciones creativas.
- Roleplay y juegos de rol conversacionales: su capacidad para mantener personalidades definidas en el system prompt y su menor alineación lo hacen idóneo para personajes complejos, incluidos antagonistas o tramas oscuras, sin rechazos automáticos.
- Generación de contenido para entretenimiento: guiones para vídeos, podcasts o videojuegos, donde la imaginación y la capacidad de explorar múltiples posibilidades narrativas son prioritarias sobre la corrección factual.
- Asistente de escritura con razonamiento configurable: el usuario puede activar modos de pensamiento personalizados (`<evil_think>`, etc.) para generar borradores con distintos enfoques estilísticos o morales, útil en ejercicios de escritura experimental.
- Prototipado de personajes y diálogos para chatbots de ficción: integrable en aplicaciones de ocio o comunidades de rol, donde se requiere un modelo que no imponga una moral corporativa y que mantenga coherencia en conversaciones multi-turno (siempre que el contexto lo permita).
- Investigación sobre alineación y comportamiento: al ser un modelo deliberadamente menos alineado, puede servir para estudiar cómo los ajustes finos afectan a los rechazos, la moralidad expresada y la percepción del usuario, en entornos controlados de investigación.
- Despliegue local con GGUF: gracias a las versiones GGUF (repositorio propio y de bartowski), puede ejecutarse en hardware de consumo para experimentación creativa sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (25,8 B parámetros), en FP16 requeriría aproximadamente 51,6 GB de VRAM; en cuantizaciones de 8 bits, alrededor de 26 GB; en 4 bits, aproximadamente 13-15 GB. Estas cifras son estimaciones generales y no están confirmadas por el autor.
- GPU recomendadas: para FP16, GPU profesionales como A100 80 GB o H100; para cuantizaciones de 8 bits, A100 40 GB o RTX 6000 Ada; para 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían ser suficientes.
- ¿Cabe en consumer GPU? Probablemente en cuantización de 4 bits en GPUs con 24 GB (RTX 3090/4090), aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp y Ollama a través de los GGUF disponibles; vLLM o TGI para safetensors si se confirma compatibilidad con la arquitectura Gemma 4. No se dispone de datos de latencia ni throughput.
- El autor indica que ya no sube GGUFs a su repositorio principal por limitaciones de almacenamiento, pero mantiene un repositorio GGUF separado y recomienda la versión iMatrix de bartowski.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orion 26B A4B v1 | 25,8 B (¿~4 B activos?) | no disponible | no disponible | safetensors, GGUF | Finetune creativo de Gemma 4 31B, menos alineado |
| google/gemma-4-31B-it | 31 B (nominal) | no disponible | Gemma license (no confirmada en la info) | safetensors | Modelo base instructivo, alineado para uso general |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

No se dispone de datos de rendimiento comparativo ni de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el autor declara explícitamente que el modelo está menos alineado y puede expresar opiniones o actitudes no corporativas; esto puede incluir sesgos de todo tipo presentes en los datos de entrenamiento y en el ajuste fino.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas factuales; el autor prioriza creatividad sobre corrección.
- Limitaciones de contexto e idioma: no se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados; se desconoce si el ajuste fino degrada el rendimiento multilingüe del modelo base.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; es imprescindible verificar la licencia del modelo base (Gemma) y la del propio ajuste antes de cualquier uso comercial.
- Caveat para producción: el modelo está orientado a creatividad y entretenimiento, no a tareas de alta precisión; no se recomienda para aplicaciones que requieran corrección factual, seguridad estricta o alineación corporativa.
- El autor no garantiza soporte de tool calling ni capacidades multimodales; no hay información sobre su comportamiento en agentes multi-paso.
- El repositorio principal no incluye GGUFs; para despliegue local hay que acudir a repositorios separados, lo que puede implicar dependencia de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1
- GGUF del autor: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1-GGUF
- GGUF iMatrix recomendado (bartowski): https://huggingface.co/bartowski/TheDrummer_Orion-26B-A4B-v1-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Discord del autor: https://discord.gg/BeaverAI
- Patreon: https://www.patreon.com/TheDrummer
- Enlaces del autor: https://linktr.ee/thelocaldrummer
- API serverless (Kitani): https://kitani.ai/
- Hoja de samplers colaborativa: https://docs.google.com/spreadsheets/d/1wil6YEHTnQP3DO9EF35ImQMY3lbmRt5_ns-LJavUqwQ
- Formulario para compartir samplers: https://docs.google.com/forms/d/e/1FAIpQLSfeiOeLbNt-xc8tr0BopJ4KawMm3YrLGD5mYLjZqg8ehl35BQ/viewform
