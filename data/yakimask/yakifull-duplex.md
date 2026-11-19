# Yakimask/yakifull-duplex

## Resumen

Yakimask/yakifull-duplex es un repositorio de Hugging Face que distribuye una aplicación Android experimental (APK) para conversación por voz completamente local. No se trata de un modelo de lenguaje en sentido estricto, sino de un paquete que integra varios componentes: reconocimiento de voz en japonés, detección de fin de turno y generación de respuestas mediante un LLM local en formato GGUF, además de síntesis de voz opcional mediante VOICEVOX CORE.

El proyecto está etiquetado como `android`, `speech` y `local-inference`, y está orientado exclusivamente al idioma japonés. La aplicación transcribe voz a texto, determina cuándo el usuario ha terminado de hablar y genera una respuesta con un modelo de conversación que el usuario debe aportar por separado en formato GGUF. La arquitectura interna del LLM no está especificada en la model card, ya que el repositorio no incluye pesos de un modelo propio.

Es relevante como ejemplo de pipeline de voz full-duplex en dispositivo (on-device), sin dependencia de servicios en la nube, aunque se trata de un prototipo de versión 0.1 con cero descargas y sin licencia declarada. El tamaño del repositorio es de 0,1 GB y contiene principalmente el APK y las licencias de los componentes de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el LLM de conversación lo aporta el usuario en GGUF; el paquete integra ASR ONNX, detección de turno y TTS opcional) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (depende del GGUF que seleccione el usuario) |
| Idiomas soportados | Japonés (`ja`) |
| Licencia | No disponible (las licencias de los componentes incluidos están en la carpeta `licenses` del repo) |
| Formato de pesos | APK Android (`duplex-android-arm64.apk`); modelos GGUF aportados por el usuario; ASR en ONNX |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica un modelo base propio. Lo que distribuye es una aplicación Android que orquesta varios componentes: reconocimiento de voz mediante `kikimimi-hiragana-9m v2` de Yakimask, convertido a ONNX para ARM64 y con licencia CC BY 4.0 del modelo original; detección de fin de turno mediante Pipecat Smart Turn v3.2 (BSD 2-Clause); inferencia del LLM mediante llama.cpp; ejecución de ONNX Runtime para el ASR; captura de audio con Oboe; y síntesis de voz opcional con VOICEVOX CORE, que requiere bibliotecas nativas `libvoicevox_core.so` y `libvoicevox_onnxruntime.so`, un modelo `.vvm` y el diccionario de Open JTalk.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO, porque el proyecto no entrena un LLM. La innovación principal es la integración de un pipeline de voz full-duplex en un dispositivo Android ARM64 (Android 10 o superior), con detección de fin de turno para gestionar la conversación de forma natural. En esta versión 0.1 se ha eliminado la función de respuestas de acompañamiento (相づち).

## Capacidades

- Transcripción de voz en japonés a texto mediante ASR ONNX en el dispositivo.
- Detección de fin de turno para decidir cuándo el usuario ha terminado de hablar.
- Generación de respuestas de conversación con un LLM local en GGUF seleccionado por el usuario.
- Salida de respuestas en texto por defecto.
- Síntesis de voz opcional mediante VOICEVOX CORE, previa importación manual de bibliotecas, modelo `.vvm` y diccionario Open JTalk.
- Ejecución completamente local, sin llamadas a servicios en la nube.
- Soporte exclusivo de japonés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del micrófono.

## Casos de uso

- Conversación por voz sin conexión en Android: la aplicación transcribe la voz del usuario, detecta el fin de turno y genera una respuesta con el GGUF elegido, útil en entornos sin red o con requisitos de privacidad.
- Asistente personal en japonés en dispositivo: al ejecutarse localmente, los datos de voz no salen del terminal, lo que encaja en escenarios de privacidad sensible.
- Pruebas de pipelines full-duplex: sirve como banco de pruebas para evaluar ASR, detección de turno y LLM en un solo flujo sobre hardware móvil.
- Evaluación de modelos GGUF en ARM64: permite comparar latencia y calidad de distintos modelos de conversación en japonés sobre un mismo dispositivo.
- Demostraciones de TTS local: con VOICEVOX CORE importado, se pueden generar respuestas habladas para prototipos de interfaz por voz.
- Investigación en interacción hablada: la detección de fin de turno con Smart Turn v3.2 permite estudiar el comportamiento conversacional sin infraestructura de servidor.
- Prototipos de accesibilidad: interfaz de voz para usuarios que prefieren entrada y salida hablada en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo Android 10 o superior con arquitectura ARM64.
- Almacenamiento suficiente para el APK, el modelo GGUF de conversación, el modelo `.vvm` de VOICEVOX y el diccionario Open JTalk (el repo ocupa 0,1 GB, pero los modelos adicionales no están incluidos).
- VRAM/RAM: no disponible; depende del tamaño y cuantización del GGUF que seleccione el usuario.
- GPU recomendadas: no disponible; la inferencia se ejecuta en el propio dispositivo Android mediante llama.cpp y ONNX Runtime.
- No aplica el despliegue en servidores con vLLM, TGI ni Ollama; el despliegue es una APK instalada en el terminal.
- Latencia y throughput: no disponibles.
- Verificación del APK: SHA-256 `1308a7b19ba8356fc6c76f00c7a19dad2fb54badc441e120e1ee1f7bb3b7e998`, package ID `jp.duplex.app`.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (aplicaciones Android de conversación por voz local en japonés con ASR, detección de turno y LLM GGUF integrados).

## Limitaciones y advertencias

- Proyecto en fase de prototipo (versión 0.1), con cero descargas y cero likes en el momento de la consulta.
- Licencia no declarada en Hugging Face; es imprescindible revisar la carpeta `licenses` del repositorio y las condiciones de GGUF y VOICEVOX antes de cualquier uso.
- Solo soporta japonés; no hay capacidades multilingües documentadas.
- Requiere que el usuario aporte manualmente un modelo GGUF de conversación; el repositorio no incluye pesos del LLM.
- La función de síntesis de voz requiere importar bibliotecas nativas, un modelo `.vvm` y el diccionario Open JTalk, y reiniciar la aplicación.
- La versión distribuida omite la función de respuestas de acompañamiento (相づち).
- La firma del APK difiere de la de versiones de depuración anteriores; puede ser necesario desinstalar la versión previa.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible, al depender del LLM GGUF que elija el usuario.
- No se documentan límites de contexto ni restricciones de uso comercial más allá de las licencias de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Yakimask/yakifull-duplex
- Pipecat Smart Turn v3.2: https://huggingface.co/pipecat-ai/smart-turn-v3
- VOICEVOX CORE: https://github.com/VOICEVOX/voicevox_core
