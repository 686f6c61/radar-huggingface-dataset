# theoracleguy/MOSS-TTS-Nano-100M

## Resumen

MOSS-TTS-Nano-100M es un modelo de síntesis de voz (text-to-speech) multilingüe de código abierto desarrollado por MOSI.AI y el equipo OpenMOSS. Con aproximadamente 142 millones de parámetros (0,1B), está diseñado para generación de voz en tiempo real con una huella mínima, capaz de ejecutarse directamente en CPU sin necesidad de GPU. Su arquitectura combina un audio tokenizer neuronal con un modelo de lenguaje autoregresivo, produciendo audio nativo a 48 kHz en estéreo.

La versión aquí descrita, publicada por el usuario theoracleguy, es una conversión a formato MLX del modelo original, preparada para su uso con la librería mlx-audio y la aplicación local OpenVox. Esto permite ejecutar el modelo en dispositivos Apple Silicon con aceleración Metal, manteniendo la misma funcionalidad que el modelo base. Su relevancia actual radica en cubrir un hueco en el ecosistema de TTS ligeros: soporta 20 idiomas, incluyendo lenguas menos habituales como persa, hebreo o griego, y ofrece clonación de voz a partir de una breve referencia de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Tokenizer + LLM autoregresivo |
| Parametros totales | 142.477.056 (0,14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 20: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea un pipeline puramente autoregresivo compuesto por un audio tokenizer neuronal y un modelo de lenguaje (LLM). El audio tokenizer convierte la señal de audio en tokens discretos, que el LLM procesa de forma secuencial para generar la salida de voz. Esta arquitectura permite inferencia en streaming con baja latencia y un primer audio rápido, además de soportar texto largo mediante división automática en fragmentos con clonación de voz por chunks.

No se dispone de información detallada sobre el entrenamiento: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo original fue liberado en abril de 2026 y la versión MLX se generó con mlx-audio 0.4.0, lo que sugiere una conversión directa de los pesos sin reentrenamiento.

## Capacidades

- Generación de voz multilingüe en 20 idiomas, con salida nativa de 48 kHz y 2 canales (estéreo).
- Clonación de voz a partir de una referencia de audio corta (modo voice clone), recomendado como flujo principal de uso.
- Inferencia en streaming con baja latencia, apta para aplicaciones de tiempo real.
- Ejecución en CPU con solo 4 núcleos, sin necesidad de GPU.
- Soporte de texto largo mediante división automática en fragmentos, manteniendo la coherencia de la voz clonada.
- Integración con mlx-audio y OpenVox para despliegue local en dispositivos Apple Silicon.
- Interfaz de línea de comandos (CLI) con comandos `generate` y `serve`, además de scripts Python (`infer.py` y `app.py`).

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en asistentes personales que requieran síntesis de voz en tiempo real sin depender de servicios en la nube, gracias a su baja latencia y ejecución en CPU.
- Audiolibros y narración: su soporte de texto largo con chunking automático permite generar audiolibros completos a partir de texto extenso, manteniendo una voz consistente mediante clonación.
- Doblaje y traducción de contenido: al cubrir 20 idiomas, puede utilizarse para doblar vídeos o podcasts, generando voz en el idioma de destino a partir de una referencia de la voz original.
- Accesibilidad y lectura de pantalla: su tamaño reducido y capacidad de ejecución en CPU lo hacen adecuado para aplicaciones de lectura de texto en dispositivos de bajo consumo, como lectores de pantalla para personas con discapacidad visual.
- Atención al cliente automatizada: puede generar respuestas de voz en sistemas IVR o chatbots telefónicos, con clonación de voz para personalizar la experiencia del usuario.
- Generación de contenido para marketing: creación de anuncios de audio, cuñas publicitarias o vídeos promocionales en múltiples idiomas, con voces personalizadas a partir de referencias cortas.
- Educación y e-learning: generación de material de audio para cursos, ejercicios de pronunciación o contenido multilingüe, con la posibilidad de clonar la voz del instructor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos objetivos sobre calidad de voz, MOS (Mean Opinion Score) o comparaciones cuantitativas con otros modelos TTS.

## Requisitos de hardware

- CPU: funciona en un procesador de 4 núcleos sin GPU, lo que lo hace apto para portátiles y equipos de escritorio convencionales.
- GPU: no es necesaria; en caso de usarse, no se especifican requisitos de VRAM ni modelos concretos de GPU.
- Memoria: el repositorio ocupa 0,3 GB, por lo que el modelo cabe en RAM de cualquier equipo moderno.
- Despliegue: compatible con mlx-audio (para Apple Silicon), OpenVox, scripts Python (`infer.py`, `app.py`) y CLI (`moss-tts-nano generate` y `moss-tts-nano serve`).
- Latencia: diseñado para tiempo real en CPU, aunque no se proporcionan cifras exactas de throughput o latencia.

## Comparativa con modelos similares

No se dispone de datos de comparación cuantitativa con otros modelos. Según The AI Bench, MOSS-TTS-Nano cubre un hueco multilingüe que Kokoro no aborda, con 20 idiomas y clonación de voz, pero no se ofrecen métricas comparativas. Alternativas en la misma categoría de TTS ligero incluyen Kokoro (también de ~100M parámetros) y Piper, aunque no se dispone de información suficiente para una comparación rigurosa.

## Limitaciones y advertencias

- Al ser un modelo de solo 0,1B parámetros, la calidad de voz puede ser inferior a la de modelos más grandes, especialmente en idiomas con pocos datos de entrenamiento.
- No se documentan sesgos específicos, pero es probable que existan variaciones de calidad entre los 20 idiomas soportados.
- Riesgo de alucinación en audio: el modelo puede generar pronunciaciones incorrectas o artefactos en textos ambiguos o con nombres propios poco comunes.
- La versión MLX es una conversión del modelo original; puede haber ligeras diferencias de comportamiento respecto a la versión PyTorch.
- No se especifica la longitud máxima de contexto, por lo que textos muy largos pueden requerir el chunking automático, que podría afectar a la coherencia en algunos casos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la atribución requerida.

## Enlaces

- Modelo MLX en Hugging Face: https://huggingface.co/theoracleguy/MOSS-TTS-Nano-100M
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Demo en línea: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Página de OpenMOSS: https://openmoss.ai/MOSS-TTS-Nano-Demo/
- Ficha en The AI Bench: https://theaibench.ai/models/moss-tts-nano/
- mlx-audio: https://github.com/Blaizzy/mlx-audio
- OpenVox: https://openvoxai.com/
