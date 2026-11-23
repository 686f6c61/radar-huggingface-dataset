# Synonymx/mandinka-tts-voice

## Resumen

Mandinka TTS Voice es una exportación a ONNX del modelo de síntesis de voz `facebook/mms-tts-mnk` de Meta, publicado por el usuario Synonymx. El modelo original forma parte de la familia MMS (Massively Multilingual Speech), un conjunto de modelos VITS entrenados para dar cobertura de voz a más de 1.100 idiomas, entre ellos el mandinka (código ISO `mnk`), una lengua mandé hablada principalmente en Gambia, Senegal y Guinea-Bisáu.

La aportación de este repositorio no es un entrenamiento nuevo, sino el empaquetado del modelo en un único fichero `model.onnx` de 109 MB en fp32, junto con `vocab.json` y `config.json`. El objetivo declarado es su integración en la aplicación SRT Dub de King Solomon / Gamvibez, que descarga los ficheros una sola vez por WiFi y después dobla subtítulos en mandinka completamente sin conexión.

Su relevancia es doble: por un lado, demuestra un patrón de despliegue de TTS de bajo coste en dispositivos sin GPU mediante ONNX Runtime; por otro, cubre un idioma de bajos recursos con muy poca presencia en herramientas de voz comerciales. La licencia CC-BY-NC 4.0 limita el uso a fines no comerciales, lo que condiciona cualquier adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (modelo original de Meta MMS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por enunciado, no modelo de contexto) |
| Tipos de cuantizacion | fp32 (única variante publicada); no se incluyen versiones int8 ni fp16 |
| Idiomas soportados | mandinka (`mnk`) |
| Licencia | CC-BY-NC 4.0 (uso personal, no comercial) |
| Formato de pesos | ONNX (`model.onnx`, 109 MB) + `vocab.json` + `config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es `facebook/mms-tts-mnk`, un sistema de síntesis de voz extremo a extremo basado en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech). VITS combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta, lo que permite generar波形 de audio de forma directa sin un vocoder separado en cascada. Los modelos MMS-TTS se entrenaron sobre datos de habla de los idiomas cubiertos por el proyecto MMS de Meta.

La información disponible no detalla el número de horas de audio de mandinka utilizadas, la composición del corpus, ni si hubo ajuste fino posterior. Tampoco se documenta el proceso de exportación a ONNX (versión de PyTorch, opset, herramientas empleadas) ni si se aplicaron optimizaciones como fusión de operadores. El repositorio solo indica que se trata de una exportación fp32 del modelo original.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en mandinka.
- Generación de audio en un único paso mediante el grafo ONNX, apta para inferencia en CPU.
- Funcionamiento completamente offline una vez descargados los ficheros, según la model card.
- Integración pensada para el doblaje de subtítulos en la aplicación SRT Dub.
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni cambios de hablante.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta multilingüismo: el vocabulario y el modelo están orientados a mandinka.

## Casos de uso

- Doblaje offline de subtítulos en mandinka: la aplicación SRT Dub descarga `model.onnx`, `vocab.json` y `config.json` una vez por WiFi y sintetiza cada línea de subtítulo localmente, sin depender de servicios en la nube. Es el caso de uso explícito del autor.
- Accesibilidad para hablantes de mandinka: conversión de texto escrito (noticias, avisos, documentación) en audio para personas con baja alfabetización o discapacidad visual, ejecutándose en un portátil o un dispositivo de bajo consumo.
- Localización de contenido educativo: generación de pistas de audio en mandinka para vídeos formativos o materiales de ONG que operan en Gambia, Senegal o Guinea-Bisáu, donde el acceso a internet puede ser intermitente.
- Preservación lingüística: creación de corpus de audio sintético para documentación y enseñanza del mandinka, siempre que se respete la cláusula no comercial de la licencia.
- Prototipado de asistentes de voz en lenguas de bajos recursos: uso del modelo como base para experimentar con pipelines de ASR + TTS en mandinka dentro de proyectos de investigación.
- Integración en aplicaciones móviles o de escritorio con ONNX Runtime: al ser un único fichero de 109 MB en fp32, cabe en el almacenamiento de un móvil de gama media y se ejecuta en CPU sin GPU dedicada.
- Generación de audiolibros o podcasts de nicho en mandinka para distribución gratuita, respetando la restricción de uso personal de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de síntesis (MOS, MCD, WER del texto sintetizado) ni comparaciones con otros sistemas TTS para mandinka.

## Requisitos de hardware

- VRAM estimada: no aplica en la variante publicada; el modelo está pensado para inferencia en CPU mediante ONNX Runtime.
- Tamaño en disco: 109 MB para `model.onnx` más los ficheros de vocabulario y configuración; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) podría acelerar la inferencia, pero no es un requisito.
- GPU de consumo: el modelo cabe holgadamente en cualquier GPU consumer, aunque su diseño apunta a ejecución en CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript), integración directa en la app SRT Dub; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles. Al ser VITS fp32 en CPU, la latencia dependerá del hardware y de la longitud del enunciado, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Synonymx/mandinka-tts-voice | VITS (MMS) exportado a ONNX | Mandinka | CC-BY-NC 4.0 | ONNX fp32 | Hugging Face |
| facebook/mms-tts-mnk | VITS (MMS) | Mandinka | CC-BY-NC 4.0 | PyTorch | Hugging Face |
| Otros MMS-TTS de Meta | VITS (MMS) | Más de 1.100 idiomas | CC-BY-NC 4.0 | PyTorch | Hugging Face |

La comparativa se limita al modelo original de Meta y a la familia MMS, ya que no se dispone de información sobre otros sistemas TTS específicos para mandinka en la documentación consultada. La diferencia principal frente a `facebook/mms-tts-mnk` es el formato: este repositorio ofrece un grafo ONNX listo para inferencia sin PyTorch, lo que simplifica el despliegue en aplicaciones nativas.

## Limitaciones y advertencias

- Licencia CC-BY-NC 4.0: prohíbe el uso comercial. Cualquier producto, servicio o integración empresarial requiere una licencia adicional del titular de los derechos (Meta, como autora del modelo original).
- El repositorio no documenta el proceso de exportación a ONNX ni incluye pruebas de paridad numérica frente al modelo PyTorch original; la calidad de la síntesis podría diferir de la del modelo de referencia.
- No se especifican los datos de entrenamiento ni el número de hablantes, por lo que se desconoce el sesgo de género, acento o variante dialectal del mandinka representado.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o en préstamos lingüísticos, habitual en modelos TTS de bajos recursos.
- Sin métricas de calidad publicadas (MOS, inteligibilidad), no es posible evaluar objetivamente la naturalidad del audio.
- El modelo está limitado a mandinka; no se documenta soporte de code-switching con inglés, francés o portugués, frecuente en contextos reales de Gambia y Senegal.
- No se documenta el tratamiento de números, siglas, abreviaturas ni puntuación; el preprocesado de texto corre a cargo del integrador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-22) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio; conviene verificarlo antes de confiar en ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Synonymx/mandinka-tts-voice
- Modelo original de Meta: https://huggingface.co/facebook/mms-tts-mnk
- Proyecto MMS de Meta: https://ai.meta.com/blog/multilingual-model-speech-recognition/
- Repositorio MMS en GitHub: https://github.com/facebookresearch/fairseq/tree/main/examples/mms
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
