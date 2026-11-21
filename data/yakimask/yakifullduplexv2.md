# Yakimask/yakifullduplexv2

## Resumen

YAKISFULL-DUPLEX V2 es un paquete de software de conversación por voz en japonés publicado por el desarrollador Yakimask bajo licencia MIT. No se trata de un modelo de lenguaje entrenado por el autor, sino de una aplicación empaquetada para Android (APK, ARM64) y Windows x64 que orquesta tres componentes independientes: reconocimiento de voz con Moonshine, generación de respuestas con un LLM local en formato GGUF (Qwen3 0.6B o Gemma 4 E2B IT, descargados aparte por el usuario) y síntesis de voz con VOICEVOX.

El problema que aborda es la conversación de baja latencia completamente local en japonés: el sistema detecta el final del turno del hablante mientras este aún está hablando (a partir de la hipótesis parcial de Moonshine), elimina las interjecciones iniciales del usuario y comienza a sintetizar la respuesta de VOICEVOX por bloques de texto confirmados, de modo que el primer audio empieza a reproducirse antes de que el LLM haya terminado de generar toda la respuesta.

Es relevante como referencia de ingeniería para pipelines de voz full-duplex en dispositivos: muestra cómo combinar ASR en streaming, un LLM pequeño cuantizado y TTS incremental con métricas de continuidad (cola de reproducción vacía, pausa máxima, silencio tras la confirmación de frase). El repositorio de Hugging Face ocupa 0,2 GB y contiene los binarios de la aplicación, no pesos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación orquestadora; LLM subyacente no especificado por el autor (Qwen3 0.6B o Gemma 4 E2B IT, a elección del usuario) |
| Parametros totales | No disponible (depende del GGUF elegido: 0,6B para Qwen3, E2B para Gemma 4) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (Qwen3 0.6B, ~640 MB) y Q4_K_M (Gemma 4 E2B IT, ~3,1 GB) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF para el LLM; APK (Android ARM64) y ZIP (Windows x64) para la aplicación |

## Arquitectura y entrenamiento

El autor no publica arquitectura de red ni proceso de entrenamiento: el repositorio distribuye una aplicación, no un modelo. La arquitectura efectiva es un pipeline de tres etapas ejecutadas en el dispositivo. Primero, Moonshine realiza ASR en streaming en japonés (incluido en el APK de Android; en Windows se descarga en el primer arranque). Segundo, un LLM en GGUF cargado por llama.cpp genera la respuesta; el autor recomienda Qwen3 0.6B Q8_0 o Gemma 4 E2B IT Q4_K_M, y soporta el modo Thinking en las familias Qwen 3 y Gemma 4. Tercero, VOICEVOX CORE 0.17.1 con ONNX Runtime 1.23.2 y el diccionario Open JTalk 1.11 sintetiza el audio con las voces de Zundamon y Shikoku Metan.

La innovación técnica declarada está en la gestión del turno y la síntesis incremental. El sistema toma la hipótesis parcial de Moonshine, descarta las interjecciones iniciales («うんうん、», «なるほど。」) y, si el resto supera los 5 caracteres durante 0,4 segundos, corta la intervención del usuario y lanza la respuesta; si la hipótesis vuelve a 4 caracteres o menos, reinicia el temporizador. Tras cargar el GGUF se procesa primero el system prompt, y durante la generación VOICEVOX sintetiza los segmentos ya cerrados para reproducir desde el primer bloque de audio. En Android, cuando la respuesta es hablada, se restringe la salida del LLM a caracteres japoneses (hiragana, katakana, kanji, dígitos y puntuación) para evitar respuestas en inglés que no se pueden vocalizar. La inferencia es por CPU por defecto; Android ofrece Vulkan experimental para el LLM y ambos permiten ajustar los hilos de CPU de VOICEVOX (requiere reinicio).

## Capacidades

- Conversación de voz full-duplex en japonés con detección de fin de turno anticipada basada en ASR parcial.
- Reconocimiento de voz en streaming mediante Moonshine, con modelo incluido en el APK de Android.
- Generación de respuestas con LLM local en GGUF; soporta Qwen3 0.6B y Gemma 4 E2B IT según la documentación.
- Modo Thinking conmutable (desactivado por defecto), aplicable a Qwen 3 y Gemma 4 en la siguiente respuesta.
- Síntesis de voz local con VOICEVOX (Zundamon, Shikoku Metan) y reproducción por bloques solapada con la generación.
- Interjecciones de acompañamiento («うん», «へー») configurables.
- Filtrado de interjecciones iniciales del usuario antes de enviar el texto al LLM y a la pantalla.
- Restricción de salida a caracteres japoneses en el modo de respuesta hablada (solo Android).
- Procesamiento de audio de llamada configurable y umbral de fin de conversación ajustable.
- Pantalla de métricas: número de vaciados de la cola de reproducción, pausa máxima y tiempos de silencio antes y después de la confirmación de frase.
- Entrada de texto («文字で試す») además de la entrada por micrófono.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Asistente de voz local sin conexión en Android: el APK incluye Moonshine y ejecuta el LLM en el dispositivo, de modo que la conversación no requiere enviar audio ni texto a servicios externos; adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Conversación por voz de baja latencia en Windows: el ZIP x64 con `YAKISFULL-DUPLEX.exe` permite montar un puesto de demostración o un quiosco con micrófono y VOICEVOX configurado con `voicevox_core.dll`, `voicevox_onnxruntime.dll`, `0.vvm` y el diccionario Open JTalk.
- Evaluación comparativa de LLM pequeños en japonés: al permitir cambiar entre Qwen3 0.6B Q8_0 y Gemma 4 E2B IT Q4_K_M con el mismo pipeline de ASR y TTS, sirve para medir latencia y calidad de respuesta hablada de cada modelo en un dispositivo concreto.
- Medición de latencia de extremo a extremo en pipelines de voz: la pantalla de métricas (cola de reproducción vacía, pausa máxima, silencio tras confirmación de frase) permite cuantificar el efecto de la síntesis incremental frente a la generación completa.
- Prototipado de interfaces conversacionales con turnos solapados: la lógica de corte a 5 caracteres durante 0,4 segundos y el reinicio con 4 caracteres o menos sirve como referencia para implementar detección de fin de turno con ASR parcial en otros idiomas.
- Personajes y aplicaciones de acompañamiento en japonés: la integración con VOICEVOX y las interjecciones configurables permiten construir un interlocutor con voz sintética y respuestas breves sobre hardware de gama media.
- Base para aplicaciones de accesibilidad por voz en Android 10 o superior con ARM64: entrada por micrófono y salida hablada local, con respaldo de salida por texto si VOICEVOX no está instalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (WER del ASR, MMLU, HumanEval, GSM8K ni evaluaciones de naturalidad del TTS); solo describe métricas de continuidad de reproducción que el usuario puede consultar en la pantalla de la aplicación.

## Requisitos de hardware

- Android 10 o superior con ARM64 (arm64-v8a). APK de aproximadamente 121 MB; el GGUF del LLM se descarga aparte (unos 640 MB para Qwen3 0.6B Q8_0 o unos 3,1 GB para Gemma 4 E2B IT Q4_K_M).
- Windows 10 (1903 o posterior) o Windows 11 en x64. ZIP de aproximadamente 69 MB; requiere Microsoft Visual C++ Redistributable x64 si faltan MSVCP140.dll o VCRUNTIME140.dll.
- VOICEVOX añade unos 100 MB adicionales entre CORE, ONNX Runtime, modelo de voz y diccionario.
- Inferencia por CPU por defecto en ambas plataformas; Android ofrece Vulkan experimental para el LLM. El autor no publica cifras de VRAM ni de memoria RAM recomendada.
- No se especifican GPU recomendadas (A100, H100, RTX 4090) ni latencia o throughput estimados. El ajuste de hilos de CPU de VOICEVOX es el único parámetro de rendimiento documentado.
- Opciones de despliegue: aplicación propia para Android y Windows; no se documenta integración con vLLM, llama.cpp standalone, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (aplicaciones de conversación por voz local en japonés) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Solo japonés: el ASR, el filtrado de interjecciones y la restricción de salida a caracteres japoneses están diseñados para `ja`; no se documenta soporte de otros idiomas.
- El repositorio no contiene pesos de modelo: el LLM debe descargarse por separado, y el autor no especifica context length, arquitectura interna ni datos de entrenamiento de los GGUF recomendados.
- La licencia MIT cubre el repositorio, pero los componentes de terceros tienen sus propias condiciones: VOICEVOX exige aceptar sus términos de uso y los modelos Qwen y Gemma se rigen por sus licencias respectivas, que el usuario debe verificar antes de un uso comercial.
- Riesgo de alucinación y de respuestas erróneas inherente a LLM de 0,6B a E2B ejecutados en cuantizaciones agresivas (Q4_K_M, Q8_0); no se publican evaluaciones de calidad.
- La detección de fin de turno por umbrales fijos (5 caracteres durante 0,4 s) puede cortar al usuario en pausas largas o retrasar la respuesta en habla entrecortada.
- La inferencia es por CPU por defecto; el soporte Vulkan en Android es experimental y puede introducir inestabilidad.
- La síntesis de voz depende de VOICEVOX: sin él, las respuestas se muestran solo como texto.
- El APK cambió de clave de firma respecto a versiones anteriores a 2.0.0, por lo que no se puede actualizar por encima; es necesario desinstalar primero.
- Sin descargas ni interacciones registradas en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yakimask/yakifullduplexv2
- VOICEVOX CORE 0.17.1 (Windows x64): https://github.com/VOICEVOX/voicevox_core/releases/download/0.17.1/voicevox_core-windows-x64-0.17.1.zip
- VOICEVOX CORE 0.17.1 (Android ARM64): https://github.com/VOICEVOX/voicevox_core/releases/download/0.17.1/voicevox_core-android-arm64-0.17.1.zip
- VOICEVOX ONNX Runtime 1.23.2 (Windows x64): https://github.com/VOICEVOX/onnxruntime-builder/releases/download/voicevox_onnxruntime-1.23.2/voicevox_onnxruntime-win-x64-1.23.2.tgz
- VOICEVOX ONNX Runtime 1.23.2 (Android ARM64): https://github.com/VOICEVOX/onnxruntime-builder/releases/download/voicevox_onnxruntime-1.23.2/voicevox_onnxruntime-android-arm64-1.23.2.tgz
- Modelo de voz VOICEVOX 0.vvm: https://github.com/VOICEVOX/voicevox_vvm/releases/download/0.17.1/0.vvm
- Diccionario Open JTalk 1.11: https://github.com/r9y9/open_jtalk/releases/download/v1.11.1/open_jtalk_dic_utf_8-1.11.tar.gz
- Qwen3 0.6B GGUF (Q8_0): https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- Gemma 4 E2B IT GGUF (Q4_K_M): https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Visual C++ Redistributable x64: https://aka.ms/vc14/vc_redist.x64.exe
- Guía de instalación de APK en Android: https://support.google.com/pixelphone/answer/7391672
