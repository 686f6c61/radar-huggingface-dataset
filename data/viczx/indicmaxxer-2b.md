# viczx/IndicMaxxer-2B

## Resumen

IndicMaxxer-2B es un modelo de lenguaje de 2.540.816.384 parámetros (aproximadamente 2,5B) desarrollado por el usuario viczx, derivado del modelo base sarvamai/sarvam-1 mediante ajuste fino con LoRA. Su propuesta central es reducir el "impuesto de tokens" que sufren las lenguas indias: una misma frase en kannada, hindi o en texto romanizado (kanglish, hinglish) consume muchos más tokens que en inglés, lo que encarece la inferencia y reduce el espacio útil de contexto. Para ello fusiona un tokenizador propio de 48K vocabulario con el tokenizador original de Sarvam-1, añadiendo 3.792 tokens de palabra completa.

El modelo está orientado a asistentes conversacionales locales, con especial énfasis en ejecución en hardware modesto: el autor indica que puede ejecutarse en una GPU de portátil con 4 GB de VRAM en cuantización de 4 bits. Soporta cinco estilos de escritura (kannada, hindi, inglés, kanglish e hinglish) y dos modos de respuesta: `/instruct` para respuestas directas y `/reasoning` para razonamiento paso a paso en el idioma del usuario.

Es relevante ahora porque aborda un problema poco tratado en modelos pequeños: la eficiencia del tokenizador para lenguas de bajos recursos y para texto code-mixed, que es como escribe realmente la mayoría de usuarios en India. El modelo se distribuye bajo los términos de licencia de Sarvam-1 y su repo ocupa 5,2 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de sarvamai/sarvam-1), ajuste fino con LoRA |
| Parametros totales | 2.540.816.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (nf4 con bitsandbytes); fp16 en el ejemplo de carga; no se documentan otras |
| Idiomas soportados | kn (kannada), hi (hindi), en (inglés), además de kanglish y hinglish (texto romanizado) |
| Licencia | other, con nombre de licencia "sarvam-1" (términos de Sarvam-1) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de sarvamai/sarvam-1 (2B) y aplica un ajuste fino con LoRA de rango 32 sobre todas las proyecciones de atención y MLP, manteniendo la base congelada en fp16 y entrenando en fp32 las filas de embedding correspondientes a los tokens nuevos. La innovación principal es la fusión de tokenizador: el vocabulario pasa de 68.096 a 71.892 tokens (+3.792 tokens de palabra completa). El procedimiento selecciona palabras frecuentes del corpus de cinco estilos que Sarvam-1 fragmenta en tres o más piezas y que el tokenizador propio de 48K resuelve con menos; cada token nuevo se inicializa como la media de los embeddings de las piezas que reemplaza, y solo se conserva si la ratio de tokens por palabra baja en texto de validación, de modo que nunca empeora el coste. El resultado reportado es una reducción del 25,0% en tokens por palabra para hinglish (de 2,65 a 1,99), del 20,5% para kanglish (de 4,07 a 3,23), del 4,3% para kannada (de 2,54 a 2,43) y del 1,2% para hindi (de 1,47 a 1,45); el inglés queda sin cambios (1,67).

El entrenamiento usó aproximadamente 20.000 conversaciones: mayoritariamente SmolTalk en inglés, conjuntos Aya e IndicAlign en kannada y hindi, sets de hinglish y kanglish, conversaciones escritas a mano por el autor, trazas de razonamiento en lengua nativa y filas de identidad. Se ejecutó en una única GPU T4 (nivel gratuito de Kaggle) durante 75 minutos, 703 pasos y 3,5 millones de tokens, lo que equivale a unas 0,6 épocas. El formato de chat es ChatML, con soporte de los modos `/instruct` y `/reasoning`.

## Capacidades

- Generación de texto conversacional en kannada, hindi, inglés, kanglish y hinglish, manteniendo el idioma y el alfabeto del usuario.
- Modo `/instruct`: respuesta directa, con bloque ``, con recomendación de muestreo k-pass y voto para autoconsistencia.
- Llamada a herramientas simples (tool calling), según la model card.
- Razonamiento en lengua nativa, con trazas incluidas en el entrenamiento.
- Identidad propia ("IndicMaxxer") y consistencia de estilo sin mezclar idiomas.
- Tokenizador optimizado para texto code-mixed romanizado.
- Ejecución en dispositivo local, incluida GPU de 4 GB en 4 bits.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Asistencia al cliente en India: el modelo gestiona conversaciones multi-turno en hindi, kannada o hinglish manteniendo el registro del usuario; la reducción de tokens por palabra en hinglish (25%) abarata cada turno y deja más espacio para historial en la ventana de contexto.
- Asistente de voz totalmente local: integrado en la aplicación del autor junto a Silero VAD, WavLM, Whisper y Mithi TTS, permite dictar y recibir respuestas habladas en kannada, hindi o inglés sin salir del portátil.
- Chatbot de soporte para pedidos y reembolsos: los ejemplos de la model card muestran respuestas adecuadas a consultas como el estado de un pedido o plazos de reembolso, un caso típico de atención postventa en comercio electrónico.
- Preparación de entrevistas y reuniones: con el modo `/instruct` genera consejos prácticos en hinglish o kanglish, útil para usuarios que escriben en texto romanizado.
- Procesamiento de documentos y búsqueda local: en la aplicación completa se combina con compresión de contexto (LLMLingua-2, 40-60% menos tokens) y enrutado de herramientas hacia Wikipedia en kn/hi/en, DuckDuckGo, OCR y lectura de PDF/DOCX.
- Prototipado e investigación sobre tokenizadores: sirve como banco de pruebas para medir el impacto de la fusión de vocabulario en la eficiencia de lenguas indias y code-mixed.
- Despliegue en hardware de gama baja: al cargar en 4 bits (~2 GB de VRAM) puede ejecutarse en portátiles con GPU modesta para demos y entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de eficiencia del tokenizador:

| Metrica | Sarvam-1 | IndicMaxxer-2B | Variacion |
|---|---|---|---|
| Vocabulario | 68.096 | 71.892 | +3.792 tokens |
| Tokens por palabra (hinglish) | 2,65 | 1,99 | −25,0% |
| Tokens por palabra (kanglish) | 4,07 | 3,23 | −20,5% |
| Tokens por palabra (kannada) | 2,54 | 2,43 | −4,3% |
| Tokens por palabra (hindi) | 1,47 | 1,45 | −1,2% |
| Tokens por palabra (inglés) | 1,67 | 1,67 | 0,0% |

## Requisitos de hardware

- VRAM estimada: aproximadamente 5 GB en fp16 para los 2,54B parámetros; unos 2 GB en cuantización de 4 bits (nf4), según el autor.
- GPU recomendadas: el autor valida ejecución en GPU de portátil con 4 GB; el entrenamiento se hizo en una T4. Para fp16 se recomienda al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí, en 4 bits cabe en tarjetas de 4 GB; en fp16 requiere modelos con 8 GB o más.
- Opciones de despliegue: transformers (con bitsandbytes para 4 bits); el repo incluye la etiqueta text-generation-inference y endpoints_compatible, por lo que es compatible con TGI. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| IndicMaxxer-2B | 2,54B | no disponible | kn, hi, en, kanglish, hinglish | other (sarvam-1) | Tokenizador fusionado, LoRA sobre Sarvam-1, 4 bits en 4 GB |
| sarvamai/sarvam-1 | 2B | no disponible | indias e inglés | sarvam-1 | Modelo base; mayor coste de tokens en code-mixed |
| Alternativas de 2-3B para lenguas indias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Entrenado menos de una época (0,6): hechos, nombres y respuestas largas pueden ser incorrectos, y las respuestas en inglés pueden divagar.
- El coste en tokens del inglés no mejora respecto a Sarvam-1, ya que las palabras inglesas no se fusionaron.
- La aritmética en modo `/reasoning` es poco fiable a este tamaño; el autor recomienda el voto k-pass.
- No está ajustado en seguridad más allá del modelo base; no debe usarse para decisiones médicas, legales o financieras.
- Contexto máximo no documentado: planificar el despliegue sin asumir una ventana concreta.
- Licencia derivada de Sarvam-1: es necesario revisar los términos del modelo base antes de uso comercial.
- Recomendación del autor de usar `no_repeat_ngram_size` en lugar de `repetition_penalty`, porque los sufijos de las lenguas indias se repiten legítimamente y la penalización rompe la gramática.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viczx/IndicMaxxer-2B
- Modelo base Sarvam-1: https://huggingface.co/sarvamai/sarvam-1
- Repositorio de la aplicación completa: https://github.com/viczx1/IndicMaxxer
