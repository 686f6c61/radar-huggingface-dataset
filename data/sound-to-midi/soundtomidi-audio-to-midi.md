# Sound-To-MIDI/soundtomidi-audio-to-midi

## Resumen

SoundToMIDI es una aplicación web de transcripción musical que convierte una grabación de audio en un archivo MIDI editable. El repositorio de Hugging Face bajo el identificador `Sound-To-MIDI/soundtomidi-audio-to-midi` es únicamente documentación: no contiene pesos, checkpoints ni código de inferencia. Según la model card, la aplicación ejecuta localmente en el navegador el modelo Basic Pitch de Spotify, de modo que la inferencia ocurre en el dispositivo del usuario.

El modelo subyacente, Basic Pitch, es un sistema de transcripción automática de audio a MIDI desarrollado por Spotify que estima las notas (altura y tiempo de inicio) de una interpretación monofónica o con acordes sencillos y genera un archivo MIDI que puede abrirse en un DAW o instrumento virtual. Esta ficha documenta el repositorio tal como está publicado y, cuando procede, describe el modelo que realmente realiza la inferencia, indicando explícitamente qué datos no están disponibles.

La relevancia actual del proyecto es práctica: permite a músicos, productores y desarrolladores obtener una transcripción MIDI inicial sin depender de servicios en la nube, con procesamiento local y exportación gratuita del MIDI sin corregir. No obstante, la información publicada sobre el repositorio es muy limitada (sin licencia declarada, sin pipeline asignado, sin benchmarks propios y sin pesos), lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en el repositorio (la model card indica que la app ejecuta el modelo Basic Pitch de Spotify; la arquitectura concreta de Basic Pitch no se detalla en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio a MIDI; no se especifica ventana de audio máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (según etiquetas del repositorio) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos ni checkpoints) |

## Arquitectura y entrenamiento

El repositorio `Sound-To-MIDI/soundtomidi-audio-to-midi` no incluye información sobre arquitectura ni sobre el proceso de entrenamiento. La model card aclara que se trata de documentación de una aplicación web y que el modelo que realiza la inferencia es Basic Pitch, publicado por Spotify en su repositorio de GitHub. No se proporcionan en la información disponible detalles sobre el tipo de red (por ejemplo, CNN sobre espectrogramas), el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO.

Tampoco se documentan innovaciones técnicas propias del repositorio. El único detalle técnico verificable es el flujo de la aplicación: procesamiento local en el navegador, aceptación de MP3, WAV y M4A (y MP4/WebM con pista de audio decodificable), límite de archivo de 100 MB y exportación de MIDI sin corregir de forma gratuita, con un paquete de pago que añade MIDI editado, PDF de partitura y MusicXML.

## Capacidades

- Transcripción de audio a MIDI: estima las notas interpretadas en una grabación y genera un archivo MIDI con altura y tiempo de inicio.
- Procesamiento local en el navegador: la inferencia se ejecuta en el dispositivo del usuario, sin envío del audio a un servidor según la model card.
- Soporte de formatos de audio comunes: MP3, WAV y M4A; MP4 y WebM si el navegador puede decodificar su pista de audio.
- Modos orientados a la fuente: "Capture a hummed melody" para línea vocal solista y "Keep my chords" para partes de piano.
- Exportación gratuita del MIDI sin corregir y exportación de pago con MIDI editado, PDF de partitura y MusicXML.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multietapa, visión ni audio de entrada más allá de la transcripción musical.

## Casos de uso

- Transcripción de una melodía tarareada o cantada: el usuario graba una frase vocal seca, selecciona 15–30 segundos y usa el modo "Capture a hummed melody" para obtener las notas y asignarlas a un instrumento virtual en su DAW.
- Extracción de una parte de piano para reorquestación: con el modo "Keep my chords", se convierte una pista de piano aislada y se abre el MIDI en una pista de instrumento para probar otro sonido (sampler, sintetizador).
- Creación de bocetos de partitura: el paquete de pago incluye PDF de partitura y MusicXML, útil para revisar y editar la transcripción en software de notación antes de imprimirla.
- Edición asistida de interpretaciones: el flujo descrito permite comparar la grabación original con el MIDI, localizar notas espurias (por ejemplo, un D5 añadido sobre un D4 sostenido) y borrarlas individualmente en el editor.
- Trabajo con material propio sin subir audio a terceros: al ejecutarse localmente, encaja en flujos donde la privacidad del material musical es un requisito.
- Prototipado rápido para desarrolladores: quien necesite integrar la transcripción en Python puede usar el repositorio de Basic Pitch de Spotify, ya que este repositorio de Hugging Face no ofrece pesos ni código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe una prueba cualitativa con un WAV sintetizado de ocho segundos y ocho notas: las ocho tuvieron correspondencia en el MIDI generado (que contenía diez notas en total), contando como coincidencia una altura igual y un inicio dentro de 150 milisegundos del evento original. No se aportan métricas agregadas como precisión, recall o F1 sobre un conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible (no se publican pesos ni requisitos del modelo en este repositorio).
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible como dato del repositorio; la aplicación web está pensada para ejecutarse en el navegador del usuario.
- Opciones de despliegue: la vía documentada es la aplicación web de SoundToMIDI; para inferencia programática, la model card remite al repositorio de Basic Pitch de Spotify. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos en el repositorio | Licencia declarada | Contexto / ventana | Notas |
|---|---|---|---|---|---|
| Sound-To-MIDI/soundtomidi-audio-to-midi | Documentación de app de audio a MIDI | No | no disponible | no aplica | Ejecuta Basic Pitch en el navegador según la model card |
| Basic Pitch (Spotify) | Modelo de transcripción audio a MIDI | Disponible en su repositorio de GitHub (no verificado aquí) | no disponible en la información proporcionada | no disponible | Modelo subyacente citado por la model card |
| Otras alternativas de transcripción audio a MIDI | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene pesos, checkpoint ni código de inferencia: no puede desplegarse como modelo a partir de Hugging Face.
- Licencia no declarada: no hay base publicada para confirmar el uso comercial del repositorio ni de la aplicación.
- Sin pipeline asignado y con 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- La model card reconoce errores de transcripción: en su prueba de ocho notas se generaron diez, con notas espurias (D5 añadidas sobre D4).
- La evaluación publicada es cualitativa y de alcance muy reducido (un WAV sintetizado de ocho segundos, criterio de coincidencia de 150 ms), sin métricas agregadas.
- La separación de instrumentos de una mezcla completa queda fuera del alcance: la propia documentación indica que recuperar instrumentos individuales de una mezcla es otra tarea.
- Notas sostenidas y dinámicas no se validan en la prueba descrita; los finales de nota y la intensidad quedan a juicio del oyente.
- El límite de archivo es de 100 MB y depende de que el navegador pueda decodificar el audio en formatos MP4 y WebM.
- La exportación gratuita entrega el MIDI sin corregir; las correcciones realizadas en el navegador solo se obtienen con el paquete de pago.
- Riesgo de alucinación en el sentido de notas inexistentes añadidas a la transcripción, documentado en el propio ejemplo del autor.
- No se documentan sesgos demográficos ni limitaciones idiomáticas más allá de la etiqueta de idioma `en`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sound-To-MIDI/soundtomidi-audio-to-midi
- Aplicación web: https://soundtomidi.com/
- Ejemplo interactivo con melodía de ocho notas: https://soundtomidi.com/?example=isolated-melody#tool
- Página de ejemplos de conversión: https://soundtomidi.com/blog/audio-to-midi-conversion-examples/
- Repositorio de Basic Pitch de Spotify: https://github.com/spotify/basic-pitch
