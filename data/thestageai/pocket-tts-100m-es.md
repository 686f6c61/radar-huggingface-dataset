# TheStageAI/pocket-tts-100m-es

## Resumen

pocket-tts-100m-es es un paquete de motores Core ML / ANE publicado por TheStageAI a partir del modelo español de 100 millones de parámetros de kyutai/pocket-tts (variante `languages/spanish`), el sistema de síntesis de voz ligero desarrollado por el laboratorio francés Kyutai. No se trata de un modelo entrenado desde cero, sino de una conversión y empaquetado del checkpoint original de Kyutai para su uso dentro del SDK de Apple de TheStage (`model_type: pocket-tts`, bundle de idioma `es`), lo que permite ejecutar la inferencia sobre los frameworks nativos de Apple (Core ML y la Neural Engine) en lugar de depender de PyTorch.

El interés de esta ficha está en la combinación de tres factores: un tamaño muy reducido (en torno a 100 M de parámetros en su forma destilada de inferencia), una licencia permisiva CC-BY-4.0 y una orientación explícita a la ejecución local. Según las fuentes públicas sobre el modelo base, Pocket TTS es capaz de sintetizar voz a velocidad superior al tiempo real en CPU convencional (aproximadamente 6x tiempo real en un MacBook Air M4) y de realizar clonación de voz zero-shot a partir de unos 5 segundos de audio de referencia, sin GPU ni claves de API.

La relevancia para desarrolladores es doble: por un lado, abre la puerta a síntesis de voz en español totalmente on-device en el ecosistema Apple (iPhone, iPad, Mac), con las ventajas de privacidad, latencia y coste marginal cero que eso implica; por otro, al ser una conversión de motores (engines) y no un modelo nuevo, conviene tratarla como un artefacto de despliegue cuyo comportamiento y calidad heredan los del modelo original de Kyutai. El repositorio es muy pequeño (0,3 GB) y, en el momento de redactar esta ficha, no registra descargas ni valoraciones, por lo que no existe validación comunitaria independiente del paquete.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo neuronal de síntesis de voz; la model card no detalla la topología interna) |
| Parametros totales | ~100 M (heredados del modelo base kyutai/pocket-tts en su forma destilada de inferencia) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; limitado por la longitud del texto de entrada) |
| Tipos de cuantizacion | No disponible (se distribuye como motores Core ML / ANE; el formato de precisión interno no se especifica) |
| Idiomas soportados | Español (`es`), bundle de idioma único |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Motores Core ML / ANE (artefactos para el SDK de Apple de TheStage), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card de este repositorio es deliberadamente escueta: se limita a indicar que contiene los motores Core ML / ANE del modelo español de 100 M de parámetros de kyutai/pocket-tts, empaquetados para el SDK de Apple de TheStage bajo el tipo de modelo `pocket-tts` y el bundle de idioma `es`. No se publican detalles sobre la topología de red, la composición del dataset de entrenamiento, el número de tokens de audio procesados ni si hubo etapas de ajuste fino con preferencias humanas (RLHF/DPO) o destilación específica para la variante española. Cualquier afirmación sobre la arquitectura interna (transformer, difusión, VITS, etc.) sería especulativa y no está respaldada por la información disponible.

Lo que sí puede afirmarse es que el modelo base, kyutai/pocket-tts, se describe públicamente como un sistema de síntesis de voz orientado a ejecución en CPU con un tamaño en torno a los 100 M de parámetros y capacidad de clonación de voz zero-shot con aproximadamente 5 segundos de audio de referencia. Este repositorio no añade entrenamiento nuevo: es un artefacto de conversión y empaquetado cuyo valor técnico reside en la compilación a Core ML y en la explotación de la Neural Engine de Apple Silicon, lo que traslada la carga de cómputo desde la CPU/GPU genérica al acelerador neuronal del dispositivo. Las fuentes consultadas discrepan sobre la fecha de publicación del modelo original (septiembre de 2025 en una wiki, enero de 2026 en una reseña y en Grokipedia), por lo que ese dato debe tomarse con cautela.

## Capacidades

- Síntesis de voz (text-to-speech) en español a partir de texto plano, con salida de audio.
- Clonación de voz zero-shot heredada del modelo base, a partir de unos 5 segundos de audio de referencia (según las fuentes públicas del modelo original).
- Ejecución local en dispositivos Apple mediante Core ML y la Neural Engine (ANE), sin necesidad de GPU dedicada ni de conectividad.
- Inferencia en CPU a velocidad superior al tiempo real en hardware de consumo (referencia publicada: ~6x tiempo real en un MacBook Air M4 para el modelo base).
- Integración con el SDK de Apple de TheStage a través del tipo de modelo `pocket-tts` y el bundle de idioma `es`.
- Capacidad multilingüe: no disponible en este repositorio; el bundle está limitado a español.
- Tool calling / function calling: no disponible (no es una capacidad propia de un modelo TTS).
- Razonamiento multi-paso o modo "thinking": no disponible (fuera del alcance del modelo).
- Visión, audio de entrada distinto de la referencia de voz, o generación de texto: no disponible.

## Casos de uso

- Lectura de pantalla y accesibilidad en apps iOS/iPadOS/macOS: el modelo puede convertir el texto de la interfaz o de documentos en voz sintética en español directamente en el dispositivo, sin enviar contenido a servidores externos, lo que reduce el riesgo de exposición de datos personales.
- Audiolibros y contenido largo en español: al ejecutarse sobre la Neural Engine y no requerir GPU, permite generar capítulos completos en un Mac de forma desatendida, con coste marginal cero por carácter sintetizado.
- Asistentes de voz on-device para apps de productividad: integrado mediante el SDK de TheStage, el modelo puede dar respuestas habladas en español con latencia baja y funcionamiento offline, útil en entornos con conectividad intermitente (transporte, campo, aviación).
- Doblaje y localización de contenido con voz clonada: usando la clonación zero-shot de ~5 segundos, un equipo de producción puede generar locuciones en español con una voz de referencia consistente, siempre con consentimiento explícito del titular de la voz.
- E-learning y aprendizaje de idiomas: generación de material de escucha en español con distintas voces y ritmos, empaquetado dentro de una app iOS que no depende de servicios cloud ni de cuotas de API.
- Prototipado de videojuegos y experiencias interactivas: diálogos de personajes no jugadores sintetizados en tiempo de ejecución en un Mac de desarrollo o en un dispositivo Apple, lo que agiliza la iteración de guion y doblaje sin contratar sesiones de estudio.
- Sistemas de megafonía y avisos en kioscos o terminales: reproducción de mensajes dinámicos en español en hardware Apple sin conexión, con la ventaja de que el modelo cabe holgadamente en el almacenamiento del dispositivo (repo de 0,3 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas objetivas (MOS, WER, similitud de hablante, latencia medida) ni comparaciones con otros sistemas TTS. Las únicas cifras públicas provienen de fuentes secundarias que describen el modelo base de Kyutai (aproximadamente 6x tiempo real en un MacBook Air M4 y clonación a partir de ~5 segundos de audio), pero no existe una evaluación independiente del paquete Core ML de TheStageAI ni del comportamiento específico de la variante española.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para memoria unificada de Apple Silicon y para la Neural Engine. Con ~100 M de parámetros, el peso en precisión de 16 bits rondaría los 200 MB, y el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: no se especifican; el destino natural es el SoC de Apple (serie M) con aceleración ANE. Para el modelo base, las fuentes públicas indican ejecución en CPU sin GPU.
- ¿Cabe en hardware de consumo? Sí, por tamaño y por diseño: el modelo base se describe como ejecutable en CPU de portátiles convencionales, y esta conversión apunta a dispositivos Apple (iPhone, iPad, Mac con Apple Silicon).
- Opciones de despliegue: SDK de Apple de TheStage (motores Core ML / ANE); para el modelo original, el repositorio kyutai-labs/pocket-tts. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: no hay mediciones publicadas para este paquete. Como referencia del modelo base, una reseña independiente cita ~6x tiempo real en un MacBook Air M4; se desconoce si la conversión a Core ML mantiene, mejora o degrada esa cifra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| TheStageAI/pocket-tts-100m-es (este) | ~100 M | Texto; clonación con ~5 s de audio (según modelo base) | Español | CC-BY-4.0 | Core ML / ANE (SDK Apple de TheStage) |
| kyutai/pocket-tts (original) | ~100 M | Texto; clonación con ~5 s de audio | Multilingüe (incluye `languages/spanish`) | CC-BY-4.0 | Pesos del repo kyutai-labs/pocket-tts; ejecución en CPU |
| Kokoro-82M | ~82 M | Texto | No disponible en la información consultada | Apache-2.0 | No disponible en la información consultada |
| XTTS-v2 (Coqui) | No disponible en la información consultada | Texto; clonación de voz | Multilingüe | No disponible en la información consultada (habitualmente no comercial) | No disponible en la información consultada |

La comparación relevante es contra el modelo original de Kyutai: mismo tamaño y misma licencia, pero con distinto formato de distribución (motores Core ML frente a pesos estándar) y distinto alcance idiomático (bundle únicamente español frente a un paquete con múltiples idiomas). Frente a alternativas como Kokoro o XTTS-v2, la falta de datos públicos de benchmarks impide establecer una comparación de calidad objetiva; la ventaja diferencial de este paquete es la integración nativa con el acelerador neuronal de Apple.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no razona, no responde preguntas ni admite tool calling; solo convierte texto en audio.
- El bundle está restringido a español (`es`); no se documenta soporte de otros idiomas en este repositorio.
- La model card no aporta información sobre sesgos acústicos, cobertura de acentos (peninsulares, canarios, latinoamericanos) ni comportamiento ante nombres propios, siglas o código.
- Riesgo de errores de pronunciación, prosodia y entonación (el equivalente TTS de la alucinación): deben validarse con muestras representativas antes de usarlo en producción.
- La clonación de voz plantea riesgos éticos y legales: exige consentimiento explícito del hablante de referencia y cumplimiento de la normativa aplicable (RGPD, AI Act) cuando se genere voz de personas reales.
- La licencia CC-BY-4.0 permite uso comercial, pero obliga a atribuir la autoría (Kyutai para el modelo base y TheStageAI para los motores); conviene revisar los términos del SDK de TheStage, que no se detallan en la model card.
- Dependencia del ecosistema Apple: la conversión a Core ML / ANE limita el despliegue a dispositivos y toolchains de Apple; no hay artefactos para Linux, Android o Windows documentados.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni informes de terceros sobre este paquete concreto.
- Las fechas de publicación del modelo base difieren entre fuentes (septiembre de 2025 frente a enero de 2026), lo que introduce incertidumbre sobre el estado y la madurez del proyecto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/TheStageAI/pocket-tts-100m-es
- Modelo base en Hugging Face: https://huggingface.co/kyutai/pocket-tts
- Repositorio GitHub de Kyutai: https://github.com/kyutai-labs/pocket-tts
- Ficha en Learn AI: https://ai.miraheze.org/wiki/Pocket_TTS
- Reseña en ScriptByAI: https://www.scriptbyai.com/cpu-tts-voice-cloning-pocket/
- Entrada en Grokipedia: https://grokipedia.com/page/Pocket_TTS
- Reseña técnica de Andrew: https://andrew.ooo/posts/pocket-tts-kyutai-cpu-voice-cloning-review/
