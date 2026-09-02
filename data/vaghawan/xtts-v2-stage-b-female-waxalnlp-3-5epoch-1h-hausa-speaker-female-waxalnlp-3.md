# vaghawan/xtts-v2-stage-b-female-waxalnlp-3-5epoch-1h-hausa-speaker-female-waxalnlp-3

## Resumen

El modelo `vaghawan/xtts-v2-stage-b-female-waxalnlp-3-5epoch-1h-hausa-speaker-female-waxalnlp-3` es un ajuste fino (fine-tuning) del modelo de síntesis de voz XTTS-v2 de Coqui, especializado en la generación de voz femenina en hausa (código `ha`). El autor, vaghawan, ha entrenado el modelo durante 5 épocas sobre un subconjunto del dataset `hausa-tts-24khz-waxalnlp-3-clean`, utilizando como inicialización un checkpoint previo (Stage A) y fijando un único hablante femenino (`hausa-speaker-female-waxalnlp-3`). El resultado es un modelo de texto a voz (TTS) capaz de sintetizar audio en hausa con una voz concreta y reproducible.

Este modelo es relevante porque amplía el soporte de XTTS-v2 a un idioma africano de baja representación en los sistemas TTS comerciales, y lo hace mediante un proceso de afinamiento abierto y documentado. Aunque el modelo base XTTS-v2 ya soporta múltiples idiomas, este ajuste se centra exclusivamente en hausa, lo que permite obtener una calidad de pronunciación y naturalidad superior en dicho idioma sin necesidad de depender de voces genéricas. El repositorio incluye los artefactos necesarios para la inferencia, así como parches de ejecución específicos para hausa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XTTS-v2 (basada en Tortoise, con decoder tipo GPT y encoder de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hausa (`ha`) |
| Licencia | Coqui Public Model License (etiquetada como `other` en HuggingFace) |
| Formato de pesos | PyTorch (`.pth`), incluye `config.json` y `vocab.json` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Coqui XTTS-v2, que a su vez se basa en la arquitectura Tortoise. XTTS-v2 combina un codificador de voz (speaker encoder) que extrae embeddings de la voz de referencia, un módulo GPT-like que genera secuencias de tokens de voz condicionadas al texto y al hablante, y un vocoder (WaveNet o similar) que convierte dichos tokens en forma de onda. Este fine-tuning sustituye los pesos del modelo base por los entrenados específicamente para hausa, manteniendo la estructura general.

El entrenamiento se realizó sobre el dataset `hausa-tts-24khz-waxalnlp-3-clean`, con una sola voz femenina (identificada como `waxalnlp-3`). Se emplearon 5 épocas, partiendo de un checkpoint de una etapa previa (Stage A), lo que sugiere un proceso de afinamiento progresivo. El repositorio incluye un parche de ejecución (`xtts_hausa_patch.py`) que adapta el modelo base para manejar correctamente el vocabulario y la fonética hausa. No se detallan el número de tokens de entrenamiento ni técnicas de alineación como RLHF o DPO; el proceso es puramente de supervisión sobre datos de habla.

## Capacidades

- Síntesis de voz en hausa con una voz femenina específica (`hausa-speaker-female-waxalnlp-3`).
- Generación de habla a partir de texto arbitrario, manteniendo la entonación y el timbre de la voz de referencia.
- Clonación de voz limitada al hablante predefinido (no permite cambiar de voz en inferencia).
- Reproducibilidad del hablante gracias al archivo de referencia incluido (`references/hausa-speaker-female-waxalnlp-3.wav`).
- Inferencia local mediante el script `infer.py` proporcionado, que acepta texto y genera un archivo WAV.
- Compatibilidad con el ecosistema Coqui TTS (biblioteca `coqui-tts`), lo que facilita su integración en aplicaciones existentes.

## Casos de uso

- Audiolibros en hausa: el modelo permite convertir textos literarios o educativos en hausa a audio con una voz femenina natural, aprovechando la ventaja de que el hablante es fijo y consistente.
- Asistentes de voz locales: integración en aplicaciones de asistencia por voz para hablantes de hausa, por ejemplo en sistemas de información agrícola o sanitaria en regiones del Sahel.
- Contenido educativo y e-learning: generación de lecciones o materiales de aprendizaje en hausa, con una locución clara y estable, útil para plataformas de alfabetización.
- Accesibilidad para personas con discapacidad visual: conversión de texto en hausa (noticias, documentos) a audio, mediante un pipeline que combine OCR o lectura de pantalla con este modelo.
- Pruebas de sistemas TTS multilingües: como modelo de referencia para evaluar la calidad de síntesis en hausa frente a otros sistemas o para investigar técnicas de adaptación a idiomas de bajos recursos.
- Creación de contenido multimedia: doblaje o narración de vídeos, podcasts o anuncios en hausa, siempre que se requiera una voz femenina concreta y no haya restricciones de licencia para el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas objetivas de calidad de voz (como MOS) ni comparaciones con otros modelos TTS para hausa.

## Requisitos de hardware

No se especifican requisitos exactos en la documentación del modelo. Dado que el repositorio ocupa 5,6 GB y el formato es `.pth` (PyTorch), se puede inferir que el modelo completo requiere una GPU con al menos 4-6 GB de VRAM para inferencia en tiempo real, similar a las necesidades del XTTS-v2 base. Sin embargo, no hay datos confirmados.

- GPU recomendada: tarjetas con 8 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4070, A10) para ejecución fluida.
- Alternativa CPU: posible inferencia en CPU con mayor latencia, aunque no se documenta.
- Opciones de despliegue: el modelo se puede ejecutar mediante el script `infer.py` incluido, o integrarse en aplicaciones usando la biblioteca `coqui-tts`. No se mencionan compatibilidades con vLLM, llama.cpp u otros motores de inferencia optimizados, ya que es un modelo de TTS, no de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto | Comentarios |
|--------|------|---------|----------|----------|-------------|
| `vaghawan/xtts-v2-stage-b-female-waxalnlp-3...` (este) | Fine-tune de XTTS-v2 | solo hausa | Coqui Public Model License | no disponible | Voz fija femenina, especializado en hausa |
| `coqui/XTTS-v2` (base) | TTS multilingüe | 17 idiomas (incluido hausa) | Coqui Public Model License | no disponible | Permite clonación de voz con 6 segundos de audio, pero calidad en hausa puede ser inferior al fine-tune |
| Modelos TTS comerciales (Google Cloud TTS, Amazon Polly) | TTS propietario | múltiples | propietaria | no aplicable | No ofrecen hausa de forma nativa en muchos casos, y si lo hacen, no permiten personalización de voz |

La comparativa se limita al modelo base XTTS-v2, ya que no hay información sobre otros fine-tunes específicos para hausa. Este modelo destaca por su enfoque en un solo hablante y un idioma concreto, lo que puede ofrecer mejor naturalidad que el modelo base para ese caso particular, a costa de perder la versatilidad multilingüe.

## Limitaciones y advertencias

- El modelo está limitado a un único hablante femenino predefinido; no se puede cambiar la voz en inferencia sin reentrenar.
- Solo soporta hausa; aunque XTTS-v2 base es multilingüe, este ajuste fino no conserva esa capacidad (al menos no está documentado).
- La licencia es la Coqui Public Model License, que puede imponer restricciones de uso comercial y redistribución; es necesario revisar sus términos antes de desplegar el modelo en producción.
- El entrenamiento se basa en aproximadamente 1 hora de audio (según el nombre del repositorio), lo que podría provocar sobreajuste a la voz concreta y limitar la generalización a otros acentos o estilos de habla dentro del hausa.
- No se han publicado evaluaciones de calidad ni estudios de sesgos; se desconoce si el modelo presenta problemas de alucinación (generación de habla ininteligible) en ciertos textos o contextos.
- El repositorio incluye parches específicos (`xtts_hausa_patch.py`) que deben aplicarse correctamente para evitar errores en la inferencia; su documentación es escasa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/vaghawan/xtts-v2-stage-b-female-waxalnlp-3-5epoch-1h-hausa-speaker-female-waxalnlp-3)
- [Modelo base Coqui XTTS-v2](https://huggingface.co/coqui/XTTS-v2)
- [Documentación de XTTS en coqui-tts](https://coqui-tts.readthedocs.io/en/latest/models/xtts.html)
- [Repositorio de referencia para XTTS-v2 en GitHub](https://github.com/Jaden-J/Coqui-TTS-XTTS-v2-)
