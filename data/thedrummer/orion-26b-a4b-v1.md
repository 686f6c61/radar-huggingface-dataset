# TheDrummer/Orion-26B-A4B-v1

## Resumen

Orion-26B-A4B-v1 es un ajuste fino (finetune) del modelo google/gemma-4-26B-A4B-it, desarrollado por TheDrummer, un ingeniero de software conocido en la comunidad de Hugging Face por sus modelos orientados a creatividad, escritura y entretenimiento. El modelo parte de una arquitectura Gemma 4 con 25.805.936.206 parámetros totales y un esquema de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos, tal como indica el sufijo "A4B" de su nombre. El repositorio ocupa 51,6 GB en formato safetensors.

El objetivo declarado del autor no es maximizar la inteligencia o la corrección factual, sino mejorar la experiencia en usos creativos y escenarios que requieren poca o ninguna alineación: escritura literaria, narración dinámica, exploración de temas complejos y control fino del formato de respuesta. Para ello, el modelo incorpora modos de razonamiento configurables (thinking y non-thinking) y permite definir estilos de pensamiento personalizados mediante el prompt de sistema.

El modelo resulta relevante para desarrolladores e investigadores interesados en modelos de gran contexto con activación dispersa, que ofrecen un coste de inferencia mucho menor que un modelo denso de tamaño equivalente, y que además permiten un control explícito sobre el comportamiento de razonamiento y el tono. Su disponibilidad a través de una API serverless de pago por uso (Kitani) facilita la evaluación sin infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basada en Gemma 4 |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4.000 millones (según nomenclatura A4B; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; cuantizaciones concretas no disponibles |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio principal); GGUF (repositorio secundario) |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-4-26B-A4B-it, un transformer con mezcla de expertos que activa una fracción reducida de sus parámetros por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso de 26.000 millones de parámetros. TheDrummer ha realizado un ajuste fino adicional sobre esta base, pero la información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card tampoco especifica innovaciones arquitectónicas propias más allá de la base Gemma 4.

La innovación más destacable del ajuste es el control del razonamiento: el modelo admite el template de Gemma 4 31B tanto en modo thinking como non-thinking, y permite activar bloques de pensamiento mediante etiquetas `<thinking></thinking>` o `<think></think>` sobre el template no-thinking. Además, el autor indica que se pueden definir estilos de pensamiento personalizados (por ejemplo, `<evil_think></evil_think>`) o describirlos en el prompt de sistema, lo que otorga un control poco habitual sobre el proceso de razonamiento.

## Capacidades

- Generación de texto creativo: escritura literaria, narrativa y estilos variados, con énfasis declarado en calidad de prosa y dinamismo.
- Razonamiento configurable: modos thinking y non-thinking, con soporte de etiquetas de pensamiento estándar y personalizadas.
- Control de formato: capacidad de adoptar formatos de respuesta novedosos y de mantener o romper convenciones según se indique.
- Instrucciones y adherencia al prompt: el autor incluye la adherencia como criterio de calidad, aunque no publica métricas.
- Conocimiento del mundo: heredado del modelo base Gemma 4, sin datos específicos sobre cobertura o actualización.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Escritura creativa y narrativa: el modelo está ajustado explícitamente para generar prosa literaria y dinámica, por lo que encaja en la generación de relatos, diálogos y descripciones con control de tono mediante el prompt de sistema.
- Roleplay y personajes: la posibilidad de definir estilos de pensamiento personalizados y de modular la alineación permite construir personajes coherentes con voces y motivaciones propias, algo útil en plataformas de entretenimiento conversacional.
- Generación de ficción interactiva: con un contexto amplio (no cuantificado en la información disponible) y modos de razonamiento, puede mantener tramas ramificadas y recordar decisiones previas del usuario en sesiones largas.
- Prototipado de asistentes con poca alineación: equipos que necesitan un modelo que no rechace temas incómodos para investigación creativa o análisis de guiones pueden usar este ajuste, con las cautelas legales y éticas correspondientes.
- Exploración de estilos de razonamiento: investigadores interesados en cómo distintas etiquetas de pensamiento afectan a la calidad de la respuesta pueden usar el modelo para experimentar con variantes de thinking sin reentrenar.
- Evaluación de modelos MoE en producción: gracias a sus aproximadamente 4.000 millones de parámetros activos, es un candidato para desplegar en entornos con presupuesto de GPU limitado y comparar su comportamiento frente a modelos densos de tamaño similar.
- Integración vía API: el acceso serverless de pago por uso en Kitani permite incorporar el modelo a aplicaciones sin gestionar infraestructura, útil para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en safetensors ocupan 51,6 GB, por lo que en precisión completa se requiere más de 52 GB de VRAM; las cuantizaciones GGUF reducen sustancialmente este requisito, pero no se detallan los tamaños concretos.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, un despliegue en precisión completa requeriría GPU de clase A100 80 GB o H100; las cuantizaciones podrían permitir GPUs de 24-48 GB.
- Compatibilidad con GPU de consumo: no confirmada. Con cuantizaciones GGUF agresivas podría caber en tarjetas de 24 GB, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: llama.cpp y Ollama mediante los GGUF publicados (incluida la variante iMatrix de bartowski); vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheDrummer/Orion-26B-A4B-v1 | 25,8 B | ~4 B (según nomenclatura) | No disponible | No disponible | HF (safetensors y GGUF) |
| google/gemma-4-26B-A4B-it | 25,8 B (base) | ~4 B (según nomenclatura) | No disponible | No disponible en esta ficha | HF |
| Modelos densos de ~27 B | ~27 B | ~27 B | No disponible | Variable | HF |

La comparación con alternativas concretas no está disponible en la información proporcionada; el único comparable directo identificable es el modelo base google/gemma-4-26B-A4B-it, del que Orion hereda arquitectura y tamaño.

## Limitaciones y advertencias

- El autor declara explícitamente que la inteligencia, la corrección y la resolución de problemas no son prioritarias; el modelo está orientado a creatividad y entretenimiento, no a tareas de alta precisión.
- El ajuste busca reducir la alineación y los rechazos, lo que puede producir contenido inapropiado, sesgado o controvertido; no es adecuado para aplicaciones orientadas al usuario sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; al ser un modelo creativo, la probabilidad de afirmaciones inventadas es relevante en usos informativos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado fuera del inglés sin evaluación previa.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin medirla empíricamente.
- El autor ha dejado de subir GGUFs a su cuenta principal por limitaciones de almacenamiento; las cuantizaciones dependen de repositorios de terceros (bartowski), lo que añade un punto de dependencia externa.
- El modelo se distribuye sin pipeline declarado ni idiomas declarados en Hugging Face, lo que dificulta la integración automática en herramientas que dependen de esos metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1
- GGUF del autor: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1-GGUF
- GGUF iMatrix (recomendado por el autor): https://huggingface.co/bartowski/TheDrummer_Orion-26B-A4B-v1-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- API serverless (Kitani): https://kitani.ai/
- Discord del autor (BeaverAI): https://discord.gg/BeaverAI
- Patreon del autor: https://www.patreon.com/TheDrummer
- Enlaces del autor: https://linktr.ee/thelocaldrummer
- Hoja de samplers de la comunidad: https://docs.google.com/spreadsheets/d/1wil6YEHTnQP3DO9EF35ImQMY3lbmRt5_ns-LJavUqwQ
- Formulario para compartir samplers: https://docs.google.com/forms/d/e/1FAIpQLSfeiOeLbNt-xc8tr0BopJ4KawMm3YrLGD5mYLjZqg8ehl35BQ/viewform
