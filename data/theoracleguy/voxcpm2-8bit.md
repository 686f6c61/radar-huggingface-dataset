# theoracleguy/VoxCPM2-8bit

## Resumen

VoxCPM2-8bit es una conversión cuantizada a 8 bits del modelo de síntesis de voz openbmb/VoxCPM2, un TTS multilingüe de 2.000 millones de parámetros con salida a 48 kHz, clonación de voz y diseño de voz a partir de una descripción textual. La conversión la publica el usuario theoracleguy y está pensada exclusivamente para MLX, el framework de Apple para sus chips de la serie M, empaquetada para la librería mlx-audio.

El interés de esta variante es práctico: al cuantizar solo las capas del modelo de lenguaje (el VAE y el DiT se mantienen a precisión completa), el peso del repositorio baja a unos 3 GB frente a los 4,96 GB de la versión bf16, y el autor reporta un factor de tiempo real de 0,85x frente a 0,48x en bf16, es decir, cerca del doble de velocidad. Es, por tanto, la opción intermedia de la familia: más rápida y ligera que bf16, con menos degradación que la variante de 4 bits.

Se trata de un modelo de voz, no de un LLM conversacional: no procesa texto libre como un chat ni admite tool calling. Su relevancia está en poder ejecutar TTS de calidad studio (48 kHz) con clonación y diseño de voz en un portátil o Mac mini con memoria unificada, sin GPU dedicada. La licencia Apache 2.0 del modelo base facilita el uso comercial, aunque a fecha de creación del repositorio (25 de octubre de 2026) no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autorregresivo para TTS con decodificador VAE y DiT (las capas LM se cuantizan; VAE y DiT quedan a precisión completa), portado a MLX |
| Parámetros totales | 2B (según la model card del modelo base) |
| Parámetros activos | No aplica: no es un modelo MoE (no se indica en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits (este repositorio); el autor referencia también variantes bf16 y 4 bits |
| Idiomas soportados | 30 idiomas según la model card; los tags del repo listan en, zh, id, ja, ko y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 3,0 GB) |
| Pipeline | text-to-speech |
| Frecuencia de muestreo de salida | 48 kHz |
| Runtime | mlx-audio (MLX, Apple Silicon) |
| Modos de generación | zero-shot, continuación, clonación por referencia y combinado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la mención explícita a tres componentes: capas de modelo de lenguaje (las únicas cuantizadas en esta conversión), un VAE y un DiT encargados de la síntesis de audio. Esta combinación es coherente con los sistemas TTS neuronales modernos que modelan tokens acústicos con un LM autorregresivo y reconstruyen la forma de onda con un decodificador generativo; el autor no publica el número de capas, dimensiones ocultas ni la configuración del VAE/DiT.

Tampoco se documentan en la información proporcionada el volumen de datos de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Lo que sí se explicita es la estrategia de cuantización: cuantización de 8 bits limitada al LM, manteniendo VAE y DiT a precisión completa, una decisión habitual para preservar la calidad del audio (la parte que más degrada con cuantización agresiva) reduciendo el coste del componente más pesado. La inferencia expone dos parámetros de control: `inference_timesteps` (7 en los ejemplos del autor) y `cfg_value` (2.0 en los ejemplos), es decir, un esquema de generación con pasos de difusión/flow y classifier-free guidance.

## Capacidades

- Síntesis de voz multilingüe en 30 idiomas, con etiquetas explícitas para inglés, chino, indonesio, japonés y coreano.
- Salida de audio a 48 kHz, orientada a calidad de estudio frente a los 16-24 kHz habituales en TTS open source.
- Clonación de voz zero-shot a partir de un audio de referencia corto y su transcripción (`--ref_audio` y `--ref_text`).
- Diseño de voz (voice design): generar una voz nueva a partir de una descripción textual (`--instruct "A young woman, gentle and sweet voice"`), sin necesidad de audio de referencia.
- Cuatro modos de generación: zero-shot, continuación de audio, clonación por referencia y modo combinado.
- Control fino de la inferencia mediante pasos de muestreo y escala de guidance.
- API Python (`mlx_audio.tts.load_model`) que devuelve resultados con la duración del audio generado, apta para integración en scripts.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de voz, no un LLM de propósito general.

## Casos de uso

- Audiolibros y narración automatizada: la salida a 48 kHz evita el sonido metálico típico de TTS a 24 kHz, y el modo de continuación permite mantener el timbre y el ritmo entre fragmentos largos de un mismo capítulo.
- Doblaje y localización de vídeo: con 30 idiomas y clonación de voz se puede generar una pista de audio en otro idioma conservando el timbre del hablante original, a partir de una referencia corta y su transcripción.
- Prototipado de asistentes de voz en local: al ejecutarse en memoria unificada de un Mac (unos 3 GB de pesos en 8 bits) se puede iterar sobre guiones y voces sin depender de APIs externas ni enviar texto a terceros.
- Diseño de voces para personajes de videojuegos o podcasts: el modo voice design genera voces originales a partir de una descripción, lo que evita problemas de derechos sobre voces de referencia reales.
- Generación de locuciones para contenidos formativos y materiales de e-learning: el script de ejemplo del autor permite automatizar la producción de pistas de audio a partir de texto plano en pipelines de CI.
- Accesibilidad: conversión de documentación o artículos a audio de alta calidad para lectura asistida, con voces consistentes mediante clonación de un único registro de referencia.
- Pruebas de concepto de clonación de voz para investigación en síntesis del habla: la variante de 8 bits reduce a la mitad el tiempo de generación frente a bf16, lo que acelera la evaluación de muchas referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo proporciona medidas de velocidad de inferencia en Apple Silicon, sin indicar el chip concreto ni la longitud de los textos evaluados:

| Variante | Tamaño | RTF (7 pasos) |
|---|---|---|
| bf16 | 4,96 GB | 0,48x |
| 8 bits (este repo) | 3,23 GB | 0,85x |
| 4 bits | 2,30 GB | 0,90x |

El autor define RTF como factor de tiempo real, con valores superiores a 1,0 indicando generación más rápida que el tiempo real. Conviene subrayarlo: según esa definición, tanto la variante de 8 bits (0,85x) como la de 4 bits (0,90x) quedan por debajo de 1,0, es decir, generarían audio más despacio que el tiempo real en el hardware probado; la mejora de 8 bits respecto a bf16 es de aproximadamente 1,8 veces. No hay datos de WER, SIM (similitud de hablante), MOS ni comparaciones con otros TTS.

## Requisitos de hardware

- Hardware soportado: exclusivamente Apple Silicon (MLX). No hay soporte CUDA en este repositorio, por lo que no se puede desplegar en A100, H100 ni RTX 4090 sin recurrir a otra conversión o al modelo base.
- Memoria unificada estimada: unos 3,5-4 GB para la variante de 8 bits, 5,5-6 GB para bf16 y 2,5-3 GB para 4 bits, contando pesos más margen de activaciones y buffers de audio.
- Cabe en cualquier Mac con 8 GB de memoria unificada en la variante de 8 bits; 16 GB dan holgura para trabajar con otras aplicaciones abiertas.
- Despliegue: CLI de mlx-audio (`python -m mlx_audio.tts.generate`) y API Python. No aplican vLLM, llama.cpp, Ollama ni TGI a este repositorio, al ser pesos en formato MLX.
- Throughput: RTF de 0,85x con 7 pasos de inferencia según el autor (sin especificar el chip). Valores por encima de 1,0 requerirían reducir pasos o usar la variante de 4 bits en hardware más rápido.
- Dependencias: `pip install mlx-audio`, que arrastra MLX y las utilidades de audio del proyecto.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento general sobre esos proyectos y no de la información proporcionada, por lo que deben verificarse antes de usarlos en una decisión técnica.

| Modelo | Parámetros | Idiomas | Licencia | Clonación de voz | Runtime |
|---|---|---|---|---|---|
| VoxCPM2-8bit (este repo) | 2B | 30 (según model card) | Apache 2.0 | Sí, zero-shot | MLX (Apple Silicon) |
| Coqui XTTS-v2 | ~467M | 17 | CPML (no comercial) | Sí, zero-shot | PyTorch (CPU/GPU) |
| Kokoro-82M | 82M | Principalmente inglés, ampliaciones posteriores | Apache 2.0 | No | PyTorch/ONNX |
| F5-TTS | ~336M | Inglés y chino | MIT | Sí, zero-shot | PyTorch |
| Chatterbox (Resemble AI) | ~0,5B | 23 | MIT | Sí | PyTorch |

Frente a estas alternativas, VoxCPM2 destaca por tamaño (2B), muestreo de salida a 48 kHz y una licencia Apache 2.0 permisiva, pero su única implementación práctica en este repositorio es MLX; quien necesite GPU NVIDIA deberá acudir al modelo base openbmb/VoxCPM2. No hay datos públicos que permitan comparar calidad (MOS) o robustez entre ellos en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks objetivos: no hay MOS, WER, SIM ni evaluaciones de inteligibilidad publicadas, ni en esta conversión ni referenciadas del modelo base.
- Conversión comunitaria sin validación: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente de la calidad del audio frente a bf16.
- Degradación por cuantización: el autor solo cuantiza el LM, pero no documenta cuánto se aleja la calidad subjetiva respecto a la versión bf16.
- Restricción de plataforma: MLX solo funciona en Apple Silicon; no hay soporte para CUDA, ROCm ni CPU genérica en este repositorio.
- Discrepancia en el identificador: los ejemplos de la model card invocan `mlx-community/VoxCPM2-8bit`, mientras que el repositorio es `theoracleguy/VoxCPM2-8bit`. Hay que sustituir la ruta en los comandos o los ejemplos fallarán.
- Idiomas: los tags solo declaran cinco lenguas más multilingüe, mientras la model card afirma 30; no se detalla la lista completa ni la cobertura real por idioma.
- Sin información sobre longitud de contexto ni sobre el límite de duración del audio de referencia para clonación.
- Riesgo de suplantación: la clonación de voz permite imitar a personas reales. Es imprescindible obtener consentimiento explícito, etiquetar el audio sintético y cumplir la normativa aplicable (por ejemplo, el Reglamento europeo de IA y las obligaciones de transparencia sobre contenido sintético).
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero no incluye garantías; el usuario asume la responsabilidad sobre el contenido generado y sobre los derechos de las voces clonadas.
- No es un modelo conversacional: no mantiene diálogo multi-turno ni ejecuta instrucciones complejas; la calidad depende del texto de entrada y de la referencia proporcionada.
- Latencia: con RTF de 0,85x en el hardware probado, no es adecuada para aplicaciones de voz interactiva en tiempo real sin reducir pasos o usar hardware más rápido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/theoracleguy/VoxCPM2-8bit
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Proyecto mlx-audio (herramienta de conversión): https://github.com/Blaizzy/mlx-audio
- La búsqueda web realizada no devolvió resultados relevantes: únicamente enlaces a sitios para adultos y a una agencia de casting, sin relación alguna con el modelo. No se incluyen. No se han localizado papers, blogs ni demos adicionales en la información proporcionada.
