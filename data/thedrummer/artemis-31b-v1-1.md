# TheDrummer/Artemis-31B-v1.1

## Resumen

Artemis-31B-v1.1 es un modelo de lenguaje de 31 000 millones de parámetros desarrollado por TheDrummer, un ingeniero de software independiente especializado en ajuste fino de modelos con fines creativos y de entretenimiento. Se trata de un finetune del modelo base `google/gemma-4-31B-it`, orientado a mejorar la calidad literaria, la expresividad narrativa y la flexibilidad de estilo frente al modelo original, que según el autor está optimizado para usos no creativos y con un fuerte alineamiento corporativo.

El modelo destaca por su filosofía de "desalineación" controlada: busca reducir la rigidez moral y las respuestas excesivamente positivas o complacientes, permitiendo explorar temas ambiguos o controvertidos con mayor naturalidad. Incluye soporte para modos de pensamiento (thinking) personalizables, tanto mediante la plantilla estándar de Gemma como a través de bloques explícitos como `<thinking>` o `<think>`. La versión 1.1 corrige problemas de estabilidad detectados en la v1, como la tendencia a encadenar guiones largos ("dash spiraling"), manteniendo el carácter creativo original.

Publicado en agosto de 2026, el modelo ha recibido una acogida modesta pero positiva en la comunidad (344 descargas y 18 likes en el momento de redacción). Su licencia no está especificada, lo que supone una limitación importante para su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (finetune de google/gemma-4-31B-it) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | Safetensors en BF16 (repo oficial); GGUF disponible por terceros (bartowski) |
| Idiomas soportados | No disponible (no especificados por el autor) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (tambien GGUF en repos de terceros) |

## Arquitectura y entrenamiento

Artemis-31B-v1.1 es un ajuste fino (finetune) completo del modelo `google/gemma-4-31B-it`, que emplea una arquitectura Transformer densa con aproximadamente 31 300 millones de parámetros. El autor no ha publicado detalles sobre la arquitectura interna más allá de la herencia del modelo base, ni tampoco información sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO. Según la model card, el objetivo del entrenamiento fue potenciar las capacidades creativas y literarias del modelo, así como reducir el sesgo hacia respuestas excesivamente alineadas o moralizantes. La versión 1.1 incorpora ajustes adicionales para mejorar la estabilidad de generación, corrigiendo problemas observados en la v1 como la repetición excesiva de guiones largos y la necesidad de "handholding" (supervisión manual) por parte del usuario.

## Capacidades

- Generación de texto creativo: narrativa literaria, diálogos, descripciones evocadoras y estilos variados.
- Modo de pensamiento (thinking) configurable: admite la plantilla estándar de Gemma, bloques `<thinking>`, `<think>` o etiquetas personalizadas definidas en el system prompt.
- Flexibilidad de alineación: responde a temas ambiguos o controvertidos sin rechazos sistemáticos ni moralización forzada, aunque puede mantener un marco ético si se le solicita.
- Adaptación a formatos novedosos: capaz de generar estructuras de respuesta no convencionales si el prompt lo requiere.
- Multilingüismo: no especificado por el autor; se asume herencia del modelo base, pero sin confirmación.
- Tool calling, código, matemáticas o razonamiento lógico: no documentado en la model card; el autor prioriza la creatividad sobre la inteligencia académica.

## Casos de uso

- Escritura de ficción y novelas: el modelo puede generar capítulos completos, desarrollar personajes y mantener coherencia narrativa en tramas largas, gracias a su entrenamiento orientado a la calidad literaria.
- Roleplay y juegos de texto: su flexibilidad de estilo y su menor rigidez moral lo hacen adecuado para escenarios de rol interactivos, donde el usuario espera respuestas inmersivas y sin censura excesiva.
- Creación de guiones y diálogos: puede producir diálogos naturales y con subtexto, útil para guiones de teatro, cine o videojuegos.
- Asistencia a escritores: como herramienta de brainstorming, sugerencia de giros argumentales o reescritura de pasajes con un tono específico.
- Entretenimiento conversacional: chatbots con personalidad definida que evitan respuestas genéricas o excesivamente positivas, mejorando la sensación de autenticidad.
- Exploración de temas controvertidos en ficción: permite abordar dilemas éticos, violencia o sexualidad en contextos narrativos sin rechazos automáticos, siempre que el usuario lo solicite explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares. El autor declara explícitamente que la inteligencia y la corrección no son su prioridad, por lo que es probable que el rendimiento en tareas académicas sea inferior al del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos estándar para un modelo de ~31 B parámetros):
  - BF16 (pesos originales, 62,6 GB): se necesitan al menos 64 GB de VRAM, por lo que se requieren GPU profesionales como A100 80 GB o H100.
  - Cuantización 8-bit (GGUF Q8_0): aproximadamente 32 GB de VRAM, viable en GPU como RTX A6000 48 GB o dos RTX 4090 en paralelo.
  - Cuantización 4-bit (GGUF Q4_K_M): alrededor de 18-20 GB de VRAM, cabe en una RTX 4090 24 GB o RTX 3090 24 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, RTX 4090 24 GB (con cuantización), RTX 3090 24 GB (con cuantización).
- Opciones de despliegue: vLLM, llama.cpp, Ollama (mediante GGUF), TGI. El formato safetensors es compatible con transformers y vLLM.
- Latencia y throughput: no disponibles. Dependen de la cuantización y del hardware; un modelo de 31 B en 4-bit puede generar entre 20 y 40 tokens por segundo en una RTX 4090, según configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Artemis-31B-v1.1 | ~31 B | No disponible | No disponible | Creatividad, desalineación |
| google/gemma-4-31B-it | ~31 B | No disponible | Gemma Terms of Use (no confirmado) | Modelo base, alineado |
| Otros finetunes creativos de 30-35 B (p.ej. basados en Llama 3.1 32B) | ~32 B | Varía | Varía | Creatividad, roleplay |

No se dispone de datos de rendimiento comparativos. La comparación se limita a características generales. Artemis se distingue por su filosofía de desalineación y su enfoque en la calidad literaria, frente a modelos base más equilibrados o finetunes comerciales.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Sesgos y contenido inapropiado: al reducir el alineamiento, el modelo puede generar contenido ofensivo, violento o sexualmente explícito sin supervisión. No es adecuado para aplicaciones donde se requiera moderación automática.
- Rendimiento académico limitado: el autor prioriza la creatividad sobre la precisión factual o el razonamiento lógico, por lo que puede alucinar o cometer errores en tareas de conocimiento general.
- Estabilidad de generación: aunque la v1.1 corrige problemas de la v1, aún puede presentar repeticiones o "dash spiraling" en contextos largos si no se configuran adecuadamente los samplers.
- Documentación escasa: no hay información sobre el dataset de entrenamiento, el número de tokens ni las técnicas de ajuste, lo que dificulta la evaluación de sesgos específicos.
- Soporte limitado: el modelo es mantenido por una sola persona, sin garantías de actualizaciones o correcciones futuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- Versión anterior (v1): https://huggingface.co/TheDrummer/Artemis-31B-v1
- Cuantizaciones GGUF (por bartowski): https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.1-GGUF
- Página de LLM Explorer: https://llm-explorer.com/model/TheDrummer%2FArtemis-31B-v1.1,b3wENY6Rrv0fLlPFEOzKF
- Grafo de arquitectura (hfviewer): https://hfviewer.com/TheDrummer/Artemis-31B-v1.1
- Discord de la comunidad: https://discord.gg/BeaverAI
- Patreon del autor: https://www.patreon.com/TheDrummer
- Enlaces de contacto del autor: https://linktr.ee/thelocaldrummer
