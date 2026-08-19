# thewh1teagle/kokoro-hebrew-nc

## Resumen

El modelo `thewh1teagle/kokoro-hebrew-nc` es una exportación en formato ONNX del sistema de síntesis de voz (text-to-speech) Kokoro, adaptado específicamente para el idioma hebreo. Fue creado por el desarrollador thewh1teagle a partir del modelo gated no comercial `avris/kokoro-hebrew-saspeech`, y se distribuye bajo una licencia que restringe su uso a fines no comerciales. El repositorio incluye el archivo del modelo (`kokoro.onnx`), un archivo de voces compatible con la librería `kokoro-onnx` (con la voz `he_shaul`) y un `config.json` para la tokenización fonética del hebreo.

Este modelo resulta relevante porque amplía el ecosistema Kokoro a un idioma con escasa representación en soluciones TTS de código abierto, y al estar en formato ONNX puede ejecutarse con el runtime de ONNX en múltiples plataformas sin depender de frameworks pesados. Su tamaño de repositorio es de aproximadamente 0,7 GB (el archivo del modelo pesa unos 344 MB), lo que lo hace viable para despliegues en entornos con recursos moderados. No se dispone de información pública sobre la arquitectura interna, el número de parámetros o la longitud de contexto, ya que la model card no los detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de la familia Kokoro, sin detalle de capas o bloques) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | hebreo (he) |
| Licencia | other (no comercial, sujeta a los términos del modelo original y del dataset) |
| Formato de pesos | ONNX (archivo `kokoro.onnx`), archivo de voces `voices-hebrew.bin` |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna de este modelo. Se sabe que es una conversión a ONNX del modelo `avris/kokoro-hebrew-saspeech`, que a su vez pertenece a la familia Kokoro de sistemas TTS. Kokoro, en su versión general, emplea una arquitectura basada en transformers con codificación fonética y un decodificador de audio, pero no se confirma si esta variante hebrea introduce modificaciones específicas. Tampoco se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de alineamiento como RLHF o DPO. La única innovación destacable es la propia conversión a ONNX, que facilita la inferencia con el runtime de ONNX y la integración en aplicaciones multiplataforma.

## Capacidades

- Síntesis de voz en hebreo a partir de texto, con una voz disponible (`he_shaul`).
- Compatibilidad con la librería `kokoro-onnx`, que permite cargar el modelo y el archivo de voces para generar audio.
- Formato ONNX, lo que posibilita su ejecución en CPU, GPU y dispositivos edge mediante ONNX Runtime.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o procesamiento de visión/audio más allá de la propia síntesis de voz.

## Casos de uso

- Audiolibros en hebreo: el modelo puede convertir texto literario o técnico en audio narrado, aprovechando la voz `he_shaul` para una lectura natural. Su formato ONNX permite integrarlo en pipelines de generación de audiolibros sin necesidad de GPUs potentes.
- Accesibilidad para personas con discapacidad visual: aplicaciones de lectura de pantalla en hebreo pueden usar este TTS para vocalizar contenido web, documentos o interfaces, con la ventaja de ejecutarse localmente y respetar la privacidad del usuario.
- Asistentes de voz en hebreo: integración en asistentes virtuales o chatbots que necesiten respuesta hablada en hebreo, combinando el modelo con un sistema de reconocimiento de voz y un motor de diálogo.
- Contenido educativo y e-learning: generación de narraciones para cursos, tutoriales o materiales didácticos en hebreo, permitiendo crear lecciones en audio de forma automatizada.
- Sistemas de navegación y avisos en hebreo: uso en aplicaciones de GPS, transporte público o sistemas de megafonía que requieran locuciones en hebreo, con despliegue en dispositivos embebidos gracias a ONNX.
- Pruebas y desarrollo de aplicaciones TTS: los desarrolladores pueden utilizar este modelo como referencia para evaluar la calidad de síntesis en hebreo o para crear prototipos de productos de voz, siempre respetando la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de calidad de voz (MOS), velocidad de inferencia o comparaciones con otros modelos TTS en hebreo.

## Requisitos de hardware

- No se dispone de requisitos oficiales de VRAM o GPU para este modelo.
- Al ser un archivo ONNX de aproximadamente 344 MB, es plausible que pueda ejecutarse en CPU con un uso de memoria moderado (inferior a 1 GB), aunque no hay datos confirmados.
- Para GPU, cualquier tarjeta con soporte CUDA y al menos 2 GB de VRAM podría ser suficiente, pero no está verificado.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), y la librería `kokoro-onnx` que facilita la carga y generación de audio.
- No se conocen cifras de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos TTS en hebreo. No se han encontrado datos sobre alternativas como `avris/kokoro-hebrew-saspeech` (el modelo original) u otros sistemas TTS hebreos de código abierto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia no comercial: el uso en productos o servicios con fines lucrativos está prohibido, según los términos del modelo original y del dataset. Cualquier despliegue comercial requiere una licencia alternativa.
- Idioma limitado: solo soporta hebreo, sin capacidad multilingüe.
- Una única voz (`he_shaul`), lo que limita la variedad de locutores.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un dataset concreto, puede presentar sesgos en la pronunciación de ciertos acentos o registros del hebreo.
- Riesgo de alucinación o errores de pronunciación en nombres propios, palabras extranjeras o texto con diacríticos, aunque no hay datos que lo confirmen.
- Al ser una conversión de un modelo gated, la trazabilidad del entrenamiento es limitada y no se garantiza la reproducibilidad.
- Para producción, se recomienda validar la calidad de audio en el caso de uso concreto, ya que no hay benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thewh1teagle/kokoro-hebrew-nc
- Repositorio de la librería kokoro-onnx: https://github.com/thewh1teagle/kokoro-onnx
- Modelo original (gated): https://huggingface.co/avris/kokoro-hebrew-saspeech
