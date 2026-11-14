# voiceforever/Qwen3-TTS-12Hz-1.7B-Base-bf16

## Resumen

Qwen3-TTS-12Hz-1.7B-Base-bf16 es una conversión al formato MLX del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. Se trata de un modelo text-to-speech de aproximadamente 1.930 millones de parámetros (1.928.677.440 según los pesos safetensors) que incorpora capacidades de clonación de voz, y que ha sido adaptado para ejecutarse de forma nativa en hardware Apple Silicon mediante la librería mlx-audio. La conversión la firma el usuario voiceforever, no el equipo original de Qwen.

El modelo resulta relevante porque permite desplegar un sistema TTS de tamaño medio con clonación de voz sobre Macs con chip Apple, sin depender de CUDA ni de GPUs dedicadas. La nomenclatura "12Hz" hace referencia a la frecuencia de tokens de audio del códec subyacente, un dato que condiciona el rendimiento y la longitud de las secuencias generadas. La licencia Apache 2.0 facilita su uso comercial, aunque la model card disponible es muy escueta y remite a la ficha del modelo original para detalles técnicos.

La información pública de este repositorio es limitada: la model card solo documenta el proceso de conversión y el uso mediante mlx-audio, sin detallar arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Por tanto, muchos campos de esta ficha se marcan como "no disponible" y se apoyan en lo que se puede inferir de los metadatos y de la naturaleza del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en transformer; códec de audio a 12 Hz según nomenclatura) |
| Parametros totales | 1.928.677.440 (~1,93 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta conversión); otras cuantizaciones no disponibles en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX); repo de 4,5 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Por los metadatos se sabe que es un modelo de text-to-speech con soporte de clonación de voz, convertido desde el checkpoint original Qwen/Qwen3-TTS-12Hz-1.7B-Base mediante mlx-audio 0.3.0. La etiqueta "12Hz" sugiere un códec de audio que opera a 12 tokens por segundo, lo que reduce la longitud de las secuencias acústicas frente a códecs de mayor frecuencia y facilita la generación en tiempo real.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La conversión a MLX no altera los pesos en precisión (bf16), sino que los adapta al formato y a las capas optimizadas de MLX para Apple Silicon. Para detalles sobre el entrenamiento original es necesario consultar la model card del modelo base de Qwen, que no forma parte de la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz mediante audio de referencia (`ref_audio` en la API de mlx-audio).
- Generación de audio con prefijo de fichero configurable para integración en pipelines.
- Ejecución nativa en Apple Silicon a través de MLX.
- Idiomas soportados: no disponible.
- Soporte de tool calling, agentes o razonamiento multi-paso: no aplica (modelo TTS).
- Capacidades multimodales adicionales (visión, audio de entrada más allá de la referencia de voz): no disponible.

## Casos de uso

- Clonación de voz para locuciones personalizadas: usando un clip de referencia (`ref_audio`), el modelo genera nuevas locuciones con el timbre del hablante de referencia, útil para audiolibros o doblaje sobre Macs.
- Generación de narración para podcasts y vídeos: el modelo convierte guiones de texto en audio de forma local, sin enviar contenido a servicios en la nube, lo que ayuda a cumplir requisitos de privacidad.
- Prototipado de asistentes de voz en macOS: al ejecutarse con mlx-audio sobre Apple Silicon, permite iterar rápidamente en el desarrollo de interfaces conversacionales en local.
- Accesibilidad: conversión de documentos de texto a voz para lectores de pantalla o aplicaciones de apoyo a personas con discapacidad visual, con la ventaja de funcionar offline.
- Pruebas A/B de voces sintéticas: la clonación permite generar múltiples variantes de una misma locución con distintas referencias para evaluar preferencias de usuarios.
- Investigación en TTS: al ser un checkpoint base en bf16 con licencia Apache 2.0, sirve como punto de partida para fine-tuning o para estudiar el comportamiento del códec de 12 Hz en entornos MLX.
- Integración en aplicaciones de escritorio para Mac: mediante la CLI `python -m mlx_audio.tts.generate` se puede automatizar la generación de audio en scripts y flujos de trabajo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al estar en bf16, los pesos ocupan aproximadamente 3,9 GB (1,93 B parámetros × 2 bytes); el repo completo pesa 4,5 GB. La memoria unificada necesaria en Apple Silicon debe sumar el overhead de activaciones y del códec, por lo que se recomienda al menos 8 GB de memoria unificada y, con margen, 16 GB.
- GPU recomendadas: al ser una conversión MLX, está pensada para chips Apple (series M1, M2, M3, M4 y superiores). No está orientada a GPUs NVIDIA.
- Cabe en hardware de consumo: sí, en Macs con memoria unificada de 8 GB o superior; el rendimiento depende del chip y del número de núcleos GPU.
- Opciones de despliegue: mlx-audio (CLI y API Python). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo TTS en formato MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base-bf16 (esta ficha) | ~1,93 B | no disponible | Apache 2.0 | safetensors (MLX) | Conversión comunitaria para Apple Silicon con clonación de voz |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ~1,93 B | no disponible | Apache 2.0 | safetensors (original) | Modelo original de Qwen, orientado a GPUs convencionales |
| Alternativas TTS open source de tamaño similar | no disponible | no disponible | varía | varía | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos TTS.

## Limitaciones y advertencias

- La model card es mínima y remite al modelo original; no hay documentación sobre sesgos, calidad lingüística ni idiomas cubiertos.
- Riesgo de alucinación y artefactos acústicos: como todo modelo TTS generativo, puede producir pronunciaciones incorrectas, ruidos o inestabilidades en textos largos o fuera de dominio; no se han publicado evaluaciones al respecto.
- Clonación de voz: implica riesgos de suplantación de identidad y uso fraudulento; es responsabilidad del usuario obtener consentimiento y cumplir la normativa aplicable (por ejemplo, sobre deepfakes y protección de datos).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo original de Qwen por si impone condiciones adicionales no reflejadas aquí.
- Soporte limitado a Apple Silicon: al ser una conversión MLX, no es directamente utilizable en GPUs NVIDIA ni en entornos de servidor tradicionales sin reconversión.
- Repositorio comunitario con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de mantenimiento continuo.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voiceforever/Qwen3-TTS-12Hz-1.7B-Base-bf16
- Modelo original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Librería mlx-audio: no disponible (no se proporciona URL en la información)
- Paper, blog o demo oficial: no disponible
