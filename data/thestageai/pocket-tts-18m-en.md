# TheStageAI/pocket-tts-18m-en

## Resumen

pocket-tts-18m-en es un motor de síntesis de voz (text-to-speech) publicado por TheStageAI, derivado del modelo `kyutai/pocket-tts` (variante `english_18m_2026-10`, desarrollada por Kyutai). El modelo original cuenta con 18 millones de parámetros y está especializado en la generación de voz en inglés. Esta versión concreta no es un modelo nuevo entrenado desde cero, sino una conversión de los pesos originales a formatos Core ML optimizados para la Neural Engine (ANE) de los chips Apple, empaquetados para su uso con el SDK de TheStage para plataformas Apple.

La relevancia de esta ficha radica en que permite ejecutar un modelo TTS compacto (18M de parámetros) de forma local en dispositivos Apple, aprovechando la aceleración por hardware de la Neural Engine en lugar de depender de servicios en la nube. El tamaño del repositorio (0,6 GB) es coherente con un modelo pequeño más los artefactos de conversión a Core ML. La licencia CC-BY-4.0 facilita su uso comercial con atribución.

No se dispone de información detallada sobre la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks en la información proporcionada; esta ficha se limita a lo que puede verificarse a partir de los metadatos y la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; conversión a Core ML / ANE) |
| Parámetros totales | 18M (según nombre del modelo y model card) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato Core ML; cuantización específica no documentada) |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML / ANE engines (SDK TheStage); pesos originales de Kyutai no disponibles en este repo |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo original de Kyutai ni del proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se puede afirmar es que esta publicación es una conversión del modelo `kyutai/pocket-tts` (variante `english_18m_2026-10`) a motores Core ML optimizados para la Neural Engine de Apple, integrados en el SDK de TheStage bajo el tipo de modelo `pocket-tts`.

La innovación técnica destacable de esta versión no está en el entrenamiento sino en el despliegue: la conversión a Core ML y la orientación a ANE permiten inferencia local acelerada por hardware en dispositivos Apple. No se dispone de detalles sobre técnicas de decodificación, atención lineal u otras innovaciones del modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto de entrada.
- Ejecución local en hardware Apple mediante Core ML y la Neural Engine (ANE).
- Integración con el SDK de TheStage para plataformas Apple (`model_type: pocket-tts`).
- Modelo compacto (18M de parámetros) adecuado para despliegue en dispositivos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; el pipeline declarado es exclusivamente text-to-speech.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Lectura por voz en aplicaciones iOS/macOS: el modelo puede integrarse mediante el SDK de TheStage para convertir texto en audio localmente, sin enviar datos a servidores externos, lo que reduce latencia y mejora la privacidad.
- Accesibilidad: narración de contenido textual (noticias, documentos, interfaces) para usuarios con discapacidad visual, aprovechando la inferencia en el dispositivo y el tamaño reducido del modelo.
- Asistentes de voz offline: integración en apps que necesitan respuestas habladas sin conexión a internet, gracias a la ejecución local en ANE.
- Audiolibros y contenido bajo demanda: generación de voz para textos largos en aplicaciones de lectura, con la ventaja de que el modelo de 18M cabe holgadamente en dispositivos móviles.
- Prototipado rápido de interfaces de voz: desarrolladores que quieran validar flujos de TTS en entornos Apple sin depender de APIs en la nube ni de infraestructura GPU.
- Automatización de avisos y notificaciones habladas: generación de mensajes de voz dinámicos en apps de productividad o domótica, donde la baja huella del modelo permite ejecutarlo junto a otras tareas del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo se ejecuta en la Neural Engine de Apple. El repositorio ocupa 0,6 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no aplica (orientado a ANE de chips Apple). No se documentan requisitos para GPU NVIDIA u otras.
- Compatibilidad con GPU de consumo: el modelo está pensado para hardware Apple con Neural Engine; no se indica compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: SDK de TheStage para Apple (Core ML / ANE). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| pocket-tts-18m-en (TheStageAI) | 18M | no disponible | en | CC-BY-4.0 | Core ML / ANE (SDK TheStage) |
| kyutai/pocket-tts (original) | 18M (variante english_18m_2026-10) | no disponible | en | CC-BY-4.0 | Pesos originales de Kyutai (formato no detallado) |
| Alternativas TTS de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documentan otros idiomas.
- No se dispone de información sobre sesgos del modelo base ni sobre riesgos específicos de alucinación en la síntesis de voz (por ejemplo, pronunciación incorrecta de nombres propios o términos técnicos).
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero es necesario verificar las condiciones de atribución tanto de TheStageAI como de Kyutai como autor original.
- Esta publicación es una conversión a Core ML/ANE; su uso está ligado al SDK de TheStage y a hardware Apple, lo que limita la portabilidad a otras plataformas.
- No se documentan límites de longitud de texto de entrada ni de contexto; conviene validar el comportamiento con entradas largas antes de usarlo en producción.
- El número de descargas es 0 y el modelo es reciente (creado en octubre de 2026), por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-18m-en
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
