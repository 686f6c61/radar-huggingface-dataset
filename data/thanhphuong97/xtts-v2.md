# thanhphuong97/XTTS-v2

## Resumen

XTTS-v2 es un modelo de síntesis de voz (text-to-speech) con capacidad de clonación de voz desarrollado originalmente por Coqui. A partir de un clip de audio de referencia de tan solo 6 segundos, el modelo replica la identidad vocal del hablante y genera habla en 17 idiomas distintos, incluyendo clonación cruzada entre idiomas (usar una referencia en un idioma para generar habla en otro). Esta ficha corresponde a la réplica `thanhphuong97/XTTS-v2` publicada en Hugging Face, un espejo del modelo original de Coqui bajo la librería `coqui` y la licencia Coqui Public Model License.

El modelo resuelve el problema de la generación de voz personalizada sin necesidad de entrenamiento por hablante: no requiere horas de audio ni fine-tuning para cada voz, sino únicamente una muestra corta como condicionamiento. Incorpora además transferencia de emoción y estilo a través de la clonación, y permite el uso de múltiples referencias de hablante con interpolación entre ellas. La frecuencia de muestreo de salida es de 24 kHz.

Respecto a XTTS-v1, la versión 2 añade húngaro y coreano, mejora el condicionamiento de hablante a nivel arquitectónico, habilita múltiples referencias e interpolación, e incorpora mejoras de estabilidad, prosodia y calidad de audio. El repositorio de esta réplica ocupa 2,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo generativo de voz de Coqui; detalles arquitectónicos no especificados en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento mediante clip de referencia de 6 segundos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 17: inglés (en), español (es), francés (fr), alemán (de), italiano (it), portugués (pt), polaco (pl), turco (tr), ruso (ru), neerlandés (nl), checo (cs), árabe (ar), chino (zh-cn), japonés (ja), húngaro (hu), coreano (ko), hindi (hi) |
| Licencia | Coqui Public Model License (CPML) |
| Formato de pesos | no disponible (repositorio de 2,1 GB; checkpoint cargable mediante `XttsConfig` y `Xtts.load_checkpoint`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza como modelo generativo de voz de la familia Coqui, accesible a través del toolkit 🐸TTS. La model card indica mejoras arquitectónicas en el condicionamiento de hablante respecto a v1 y la capacidad de emplear múltiples referencias de hablante con interpolación entre ellas. El modelo se carga mediante `Xtts.init_from_config` y `load_checkpoint`, y expone parámetros de síntesis como `gpt_cond_len` (longitud de condicionamiento, con valor de ejemplo 3) y `language`.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables de forma estándar a TTS). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. El modelo soporta inferencia y fine-tuning a través del repositorio de código de Coqui TTS.

## Capacidades

- Síntesis de voz multilingüe en 17 idiomas con una única instancia del modelo.
- Clonación de voz a partir de un clip de audio de referencia de 6 segundos.
- Clonación cruzada entre idiomas: referencia en un idioma, generación en otro.
- Transferencia de emoción y estilo mediante la clonación de la referencia.
- Uso de múltiples referencias de hablante e interpolación entre hablantes (novedad de v2).
- Salida de audio a 24 kHz.
- Integración con la API de 🐸TTS (`tts_to_file`), la línea de comandos (`tts`) y carga directa del modelo (`Xtts.synthesize`).
- Soporte de fine-tuning mediante el código de Coqui TTS.
- No se documentan en la información disponible capacidades de tool calling, agentes ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Doblaje y localización de contenido audiovisual: el modelo permite generar una misma voz en varios de los 17 idiomas soportados usando una referencia corta, lo que facilita adaptar vídeos o cursos a mercados distintos sin regrabar con actores de voz.
- Audiolibros y narración personalizada: con 6 segundos de audio de referencia se puede clonar la voz del autor o narrador y generar capítulos completos a 24 kHz, manteniendo coherencia de timbre en textos largos.
- Asistentes de voz y agentes conversacionales: la demo oficial de Coqui integra XTTS con Mistral 7B Instruct y Zephyr 7B Beta para chat de voz en streaming, lo que demuestra su uso como capa de salida de voz en pipelines LLM.
- Accesibilidad y comunicación aumentativa: clonación de la voz del propio usuario a partir de una muestra corta para preservar su identidad vocal en sistemas de lectura o comunicación asistida.
- Prototipado de videojuegos y personajes: generación de voces diferenciadas para NPC mediante múltiples referencias e interpolación entre hablantes, sin entrenamiento por personaje.
- Producción de pódcasts y contenido educativo: generación de locuciones en varios idiomas con un mismo estilo vocal, reduciendo costes de grabación y permitiendo iterar guiones rápidamente.
- Investigación en TTS y clonación de voz: base para experimentos de transferencia de estilo, evaluación de prosodia y fine-tuning sobre dominios específicos gracias al código abierto de Coqui TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada; el repositorio de pesos ocupa 2,1 GB, lo que orienta sobre el orden de magnitud de memoria necesaria para cargar el checkpoint en precisión original.
- GPU recomendadas: no disponibles. La API de 🐸TTS permite `gpu=True` y la CLI admite `--use_cuda true`, por lo que se recomienda una GPU con soporte CUDA.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño del checkpoint (2,1 GB) es plausible su ejecución en GPU de consumo, pero no se aporta confirmación ni modelo concreto.
- Opciones de despliegue: toolkit 🐸TTS (API Python, CLI y carga directa del modelo), con soporte de fine-tuning documentado en ReadTheDocs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia Coqui Public Model License (CPML) impone restricciones específicas para uso comercial; es necesario revisar sus términos antes de desplegar en producción.
- Riesgo de uso indebido en clonación de voz: la capacidad de replicar una voz con 6 segundos de audio exige consentimiento explícito del hablante y controles anti-suplantación.
- No se documentan sesgos específicos por idioma, género o acento en la información disponible; la calidad puede variar entre los 17 idiomas soportados.
- Riesgo de artefactos y degradación de prosodia en textos largos o fuera de dominio, habitual en modelos TTS; no se aportan métricas objetivas al respecto.
- La réplica `thanhphuong97/XTTS-v2` no registra descargas ni likes y no está verificada como publicación oficial; para producción conviene referenciar el modelo original de Coqui.
- No se especifican requisitos de memoria, latencia ni formatos de pesos alternativos (GGUF, ONNX), lo que limita la planificación de despliegue sin pruebas propias.
- El proyecto original de Coqui cesó su actividad empresarial; la disponibilidad de soporte y mantenimiento del ecosistema debe verificarse antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face (réplica): https://huggingface.co/thanhphuong97/XTTS-v2
- Repositorio de código Coqui TTS: https://github.com/coqui-ai/TTS
- Documentación (ReadTheDocs): https://tts.readthedocs.io/en/latest/
- Documentación de entrenamiento XTTS: https://tts.readthedocs.io/en/latest/models/xtts.html#training
- Licencia Coqui Public Model License: https://coqui.ai/cpml
- Blog sobre el origen de CPML: https://coqui.ai/blog/tts/cpml
- Demo Space XTTS: https://huggingface.co/spaces/coqui/xtts
- Demo Space de chat de voz con Mistral/Zephyr: https://huggingface.co/spaces/coqui/voice-chat-with-mistral
- Discusiones en GitHub: https://github.com/coqui-ai/TTS/discussions
- Discord de la comunidad: https://discord.gg/5eXr5seRrv
- Ficha en ttsmodels.com: https://ttsmodels.com/models/xtts-v2/
- Réplica en GitHub (elfathrelystate-ai): https://github.com/elfathrelystate-ai/XTTS-v2
