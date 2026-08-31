# theoracleguy/Qwen3-TTS-12Hz-1.7B-Base-8bit

## Resumen

Qwen3-TTS-12Hz-1.7B-Base-8bit es una conversión al formato MLX del modelo original Qwen3-TTS-12Hz-1.7B-Base, desarrollado por Alibaba Qwen. Se trata de un modelo de texto a voz (TTS) de extremo a extremo que emplea una arquitectura de modelo de lenguaje discreto con múltiples codebooks, capaz de realizar clonación de voz a partir de tan solo 3 segundos de audio de referencia. El modelo soporta síntesis de voz en 10 idiomas y está diseñado para generar habla natural con alta fidelidad, evitando los cuellos de botella de información típicos de los sistemas TTS tradicionales basados en espectrogramas.

Esta versión en 8 bits ha sido convertida por el usuario theoracleguy mediante la librería mlx-audio 0.3.0, lo que permite su ejecución eficiente en hardware Apple Silicon (MLX). El modelo base original tiene 1.7 mil millones de parámetros, aunque el archivo safetensors de esta conversión pesa 824 MB debido a la cuantización de 8 bits. Su licencia Apache 2.0 facilita su uso tanto en investigación como en aplicaciones comerciales, y su tamaño moderado lo hace accesible para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje discreto multi-codebook (Qwen3-TTS) |
| Parametros totales | 1.7B (según nombre del modelo; archivo safetensors de 824 MB por cuantización 8-bit) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (según datos de la variante 4-bit) |
| Tipos de cuantizacion | 8-bit (esta versión), también disponible en 4-bit |
| Idiomas soportados | 10 idiomas (no se especifican cuáles en la información disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo Qwen3-TTS-12Hz-1.7B-Base utiliza una arquitectura de modelo de lenguaje discreto con múltiples codebooks, acompañada de un tokenizador personalizado denominado Qwen3-TTS-Tokenizer-12Hz. Este tokenizador opera a una frecuencia de 12 Hz, lo que permite una representación temporal eficiente del audio. El sistema modela el habla de forma completamente end-to-end, sin depender de representaciones intermedias como espectrogramas, lo que reduce la pérdida de información y mejora la naturalidad de la voz generada.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Sin embargo, el modelo original fue desarrollado por el equipo Qwen de Alibaba, conocido por sus modelos de lenguaje de gran escala. La conversión a MLX no modifica la arquitectura subyacente, solo adapta los pesos al formato optimizado para Apple Silicon.

## Capacidades

- Generación de voz natural a partir de texto en 10 idiomas.
- Clonación de voz rápida: puede replicar una voz a partir de una muestra de audio de 3 segundos.
- Síntesis de voz con control fino sobre características acústicas (mediante la variante VoiceDesign, que acepta descripciones en lenguaje natural).
- Modelado de audio discreto con múltiples codebooks, lo que permite una representación rica y detallada del habla.
- Compatible con la librería mlx-audio para integración en proyectos Python y CLI.
- Soporte para generación de audio en tiempo real o por lotes, dependiendo del hardware.

## Casos de uso

- Asistentes de voz personalizados: el modelo puede generar respuestas habladas con una voz clonada a partir de una muestra breve, ideal para aplicaciones de asistencia virtual en dispositivos móviles o embebidos.
- Narración de audiolibros y podcasts: permite convertir texto largo en audio natural, con la posibilidad de elegir diferentes voces mediante clonación o diseño de voz.
- Doblaje automático de vídeos: al soportar 10 idiomas, puede utilizarse para generar pistas de audio en varios idiomas a partir de un guion, manteniendo la coherencia de la voz.
- Accesibilidad: ayuda a personas con discapacidad visual o dificultades de lectura a consumir contenido escrito mediante síntesis de voz de alta calidad.
- Sistemas de respuesta de voz interactiva (IVR): integrable en centralitas telefónicas para proporcionar respuestas automáticas con voces naturales y personalizables.
- Creación de contenido para redes sociales: generación de voces para vídeos cortos, anuncios o memes de audio, con la posibilidad de imitar voces específicas (siempre con permiso).
- Prototipado rápido de productos de audio: los desarrolladores pueden probar diferentes voces y estilos de habla sin necesidad de grabar audio real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de Qwen no incluye métricas comparativas en la documentación accesible, y la conversión a MLX no añade datos de rendimiento adicionales. Se recomienda consultar el repositorio oficial de Qwen3-TTS para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1.7B cuantizado a 8 bits, el tamaño de los pesos es de aproximadamente 824 MB. Con overhead de activaciones y buffers, se estima un consumo de entre 2 y 4 GB de VRAM, dependiendo de la longitud del audio generado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). En Apple Silicon, funciona nativamente con MLX y puede ejecutarse en Macs con 8 GB de RAM unificada o más.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja, lo que lo hace accesible para desarrolladores individuales.
- Opciones de despliegue: mlx-audio (para Apple Silicon), también se puede convertir a otros formatos como GGUF o usar con librerías como Transformers si se adapta, aunque la versión actual está optimizada para MLX.
- Latencia y throughput: no se dispone de datos concretos. En Apple Silicon (M1/M2/M3), la generación de audio de unos pocos segundos debería completarse en tiempo real o casi real, pero depende de la implementación y la longitud del texto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos TTS de características similares (como VITS, Tacotron 2, o los modelos TTS de Microsoft). La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos. Se recomienda consultar benchmarks independientes o el repositorio oficial de Qwen para obtener comparaciones.

## Limitaciones y advertencias

- La información sobre los 10 idiomas soportados no especifica cuáles son; se debe consultar la documentación original de Qwen para conocer la lista exacta.
- La clonación de voz puede plantear riesgos éticos y legales si se utiliza sin consentimiento de la persona cuya voz se replica. Es responsabilidad del usuario asegurarse de cumplir con las normativas aplicables.
- El modelo puede presentar alucinaciones o errores de pronunciación en textos complejos, especialmente con nombres propios o términos técnicos.
- Al ser una conversión a MLX, el rendimiento en hardware no-Apple puede ser limitado; se recomienda usar el formato original de Qwen (PyTorch) para GPUs NVIDIA si se requiere máxima compatibilidad.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo original no tenga restricciones adicionales (aunque en este caso la licencia es la misma).
- No se han publicado evaluaciones de sesgos o comportamientos adversos; se recomienda realizar pruebas específicas antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face (esta conversión): https://huggingface.co/theoracleguy/Qwen3-TTS-12Hz-1.7B-Base-8bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio oficial de Qwen3-TTS en GitHub: https://github.com/QwenLM/Qwen3-TTS
- Variante VoiceDesign en 4-bit (también de theoracleguy): https://huggingface.co/theoracleguy/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit
