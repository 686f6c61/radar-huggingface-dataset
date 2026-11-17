# zeroweight-ai/ZeroTTS

## Resumen

ZeroTTS es un sistema de síntesis de voz (text-to-speech) zero-shot desarrollado por zeroweight-ai, especializado en vietnamita y optimizado para inferencia en CPU. El modelo resuelve dos problemas clásicos de los sistemas TTS abiertos: la necesidad de entrenamiento por hablante y el coste computacional de los modelos neuronales de gran tamaño. Con ZeroTTS, basta con entre 3 y 30 segundos de audio de referencia para clonar una voz, sin ajuste fino ni entrenamiento adicional.

El modelo se distribuye en formato ONNX y se ejecuta sobre ONNX Runtime, lo que permite desplegarlo en portátiles sin GPU. Según el autor, alcanza un factor de tiempo real (RTF) de aproximadamente 0,5x, es decir, genera audio unas dos veces más rápido que tiempo real, con un primer fragmento de audio disponible en torno a 70 ms. El repositorio ocupa 1,7 GB y acumula cerca de 8.000 descargas y 55 me gusta en Hugging Face.

La relevancia actual del modelo radica en su enfoque: un TTS abierto, con licencia MIT, centrado en un idioma con poca cobertura en el ecosistema (vietnamita), con soporte de code-switching vietnamita-inglés y con normalización implícita de fechas, acrónimos y números sin necesidad de un normalizador de texto externo. Está pensado para aplicaciones de producción con requisitos de latencia baja y sin infraestructura GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS zero-shot; pesos en ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de referencia de 3 a 30 s) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (vi); soporte de code-switching vietnamita-inglés y prompts de voz cross-lingual |
| Licencia | MIT |
| Formato de pesos | ONNX (librería `onnx`, runtime `onnxruntime`) |
| Frecuencia de muestreo de salida | 48 kHz |
| Tamaño del repositorio | 1,7 GB |
| Dependencia de GPU | no (inferencia en CPU) |
| RTF declarado | ~0,5x (≈2x más rápido que tiempo real) |
| Latencia del primer fragmento | ~70 ms |
| Referencia de voz | 3–30 s de audio |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (tipo de encoder de texto, decoder acústico, vocoder o esquema de representación latente de voz). Lo que sí se documenta es el paradigma de funcionamiento: un sistema TTS zero-shot en el que la voz se representa como un array latente de pequeño tamaño que se inyecta en el modelo en tiempo de inferencia. Esto elimina la necesidad de fine-tuning por hablante y permite clonar voces a partir de una referencia corta.

El modelo se distribuye exclusivamente como grafo ONNX, lo que condiciona su despliegue a ONNX Runtime y explica su viabilidad en CPU. El autor declara soporte de streaming, con generación incremental de audio y un primer fragmento en torno a 70 ms. No se han publicado en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se emplearon técnicas de RLHF, DPO u otros ajustes por preferencias. Tampoco se especifica si el modelo incorpora un normalizador de texto explícito; la model card afirma que lee fechas como `31/12/2025` y acrónimos como `ZeroTTS` sin normalizador.

## Capacidades

- Síntesis de voz en vietnamita con prosodia y tonos propios del idioma.
- Clonación de voz zero-shot a partir de 3 a 30 segundos de audio de referencia, sin entrenamiento adicional.
- Representación de voces como arrays latentes reutilizables e intercambiables.
- Streaming de audio con generación incremental y baja latencia inicial (~70 ms).
- Inferencia en CPU con RTF de aproximadamente 0,5x.
- Code-switching vietnamita-inglés dentro de una misma locución.
- Prompts de voz cross-lingual: referencia en vietnamita para generar salida en otro idioma (el ejemplo de la model card genera inglés a partir de una referencia vietnamita).
- Manejo implícito de fechas, números y acrónimos sin normalizador de texto externo.
- Salida de audio a 48 kHz en formato float32.
- API de Python (`zerotts`) con métodos `synthesize`, `synthesize_stream` y `save_audio`.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá del prompt de voz.

## Casos de uso

- **Atención al cliente por voz en vietnamita**: el modelo puede generar respuestas habladas en tiempo real sobre CPU, lo que permite desplegar agentes telefónicos o chatbots de voz sin GPU y con latencia de primer audio de ~70 ms, adecuada para conversaciones interactivas.
- **Audiolibros y narración de contenido largo**: con RTF de 0,5x y soporte de streaming, se puede narrar texto extenso de forma progresiva, manteniendo una voz clonada consistente a lo largo de capítulos completos a partir de una única referencia de pocos segundos.
- **Locución personalizada para vídeo y pódcast**: la clonación zero-shot permite generar locuciones con la voz del creador a partir de una muestra corta, sin necesidad de sesiones de grabación adicionales ni de entrenamiento por hablante.
- **Sistemas de accesibilidad**: lectura en voz alta de contenido web, documentos o interfaces para usuarios vietnamitas con discapacidad visual, ejecutable en hardware modesto y sin dependencia de servicios en la nube.
- **Aprendizaje de idiomas**: generación de material de escucha en vietnamita con distintas voces y velocidad controlada, útil para prácticas de pronunciación y comprensión auditiva, incluyendo fragmentos con términos en inglés (code-switching).
- **Integración en pipelines de CI/CD para pruebas de voz**: al ser un paquete ONNX con API de Python, se puede incorporar en tests automatizados que verifiquen la síntesis de textos concretos (fechas, acrónimos, números) sin depender de infraestructura externa.
- **Prototipado rápido de asistentes de voz**: la instalación vía `pip install zerotts` y la carga desde Hugging Face permiten tener un TTS funcional en minutos, lo que facilita validar productos de voz antes de invertir en infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). El conjunto de evaluación es ZeroBench-TTS, split de test.

| Tarea / configuración | Métrica | Valor |
|---|---|---|
| Zero-shot TTS (global) | WER (%) — texto crudo | 1,03 |
| Zero-shot TTS (global) | UTMOSv2 (naturalidad MOS) | 2,91 |
| Zero-shot TTS (global) | Similitud de hablante (coseno WavLM-SV) | 0,936 |
| Zero-shot TTS (global) | Silencio excesivo (s) | 0,029 |
| Monolingüe vietnamita | WER (%) — texto crudo | 0,16 |
| Code-switching vietnamita/inglés | WER (%) — texto crudo | 0,97 |
| Prompt de voz cross-lingual | WER (%) — texto crudo | 1,42 |
| Acrónimos, fechas y números | WER (%) — texto crudo | 1,75 |

El autor afirma que ZeroTTS presenta «4 veces menos errores de palabra que el siguiente mejor modelo» y que su UTMOS está «por encima de cualquier otro sistema abierto de vietnamita», pero no se incluyen en la información disponible las cifras de los modelos comparados ni la tabla comparativa completa.

## Requisitos de hardware

- **VRAM**: no aplica; el modelo está diseñado para inferencia en CPU mediante ONNX Runtime. No se especifica el consumo de memoria RAM, aunque el repositorio de 1,7 GB da una cota inferior orientativa.
- **GPU**: no requiere GPU. No se documentan requisitos ni rendimiento en A100, H100 o RTX 4090.
- **Consumer GPU**: no es necesario; el caso de uso declarado es un portátil convencional con CPU.
- **Opciones de despliegue**: ONNX Runtime a través del paquete `zerotts`; el autor publica además una demo en navegador en el repositorio de GitHub. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables directamente a este TTS).
- **Latencia y throughput**: RTF de ~0,5x (unas 2 veces más rápido que tiempo real) y primer fragmento de audio en ~70 ms, según el autor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de TTS abierto en vietnamita (parámetros, contexto, licencia o benchmarks). La model card menciona de forma genérica que supera a «cualquier otro sistema abierto de vietnamita» y que tiene «4 veces menos errores de palabra que el siguiente mejor modelo», pero no identifica esos sistemas ni aporta sus métricas.

| Modelo | Parámetros | Contexto | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroTTS | no disponible | audio de referencia 3–30 s | 1,03 % (global, ZeroBench-TTS) | MIT | Hugging Face, ONNX |
| Alternativas de TTS abierto en vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Idioma principal**: el modelo está entrenado y optimizado para vietnamita; el soporte de otros idiomas se limita a la generación cross-lingual a partir de un prompt de voz y al code-switching con inglés, sin garantías de calidad general en otras lenguas.
- **Benchmarks no verificados**: todos los resultados de la model card figuran con `verified: false`; proceden del propio autor y del conjunto ZeroBench-TTS, por lo que conviene tratarlos con cautela y validarlos en el dominio de producción.
- **Riesgo de alucinación y errores de pronunciación**: como todo TTS, puede producir lecturas incorrectas de textos ambiguos, nombres propios o secuencias no vistas; el WER de 1,75 % en la configuración de acrónimos, fechas y números indica que ese es el escenario más frágil.
- **Sesgos**: no se documentan análisis de sesgos por género, acento o dialecto dentro del vietnamita; la calidad de clonación puede variar según la duración y calidad del audio de referencia.
- **Uso indebido de clonación de voz**: la clonación zero-shot facilita suplantaciones de identidad; aunque la licencia MIT no impone restricciones de uso, es responsabilidad del desplegador obtener consentimiento y aplicar salvaguardas.
- **Dependencia de ONNX Runtime**: el despliegue está atado al ecosistema ONNX; no hay pesos en safetensors ni GGUF, lo que limita la integración con stacks de inferencia alternativos.
- **Licencia MIT**: permite uso comercial sin restricciones, pero sin garantías; conviene revisar las licencias de los datos de evaluación y de cualquier voz de referencia utilizada.
- **Información técnica incompleta**: no se publican número de parámetros, arquitectura detallada, composición del dataset de entrenamiento ni consumo de memoria, lo que dificulta estimar el rendimiento en hardware específico antes de probarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeroweight-ai/ZeroTTS
- Repositorio de código, ejemplos y demo en navegador: https://github.com/zeroweight-ai/ZeroTTS
- Dataset de evaluación ZeroBench-TTS: https://huggingface.co/datasets/zeroweight-ai/ZeroBench-TTS
- Blog del autor: https://zeroweight.ai/blog/zero-tts
- Paper referenciado en los tags (arXiv:2602.10934): https://arxiv.org/abs/2602.10934
