# vietphamqq/doctruyen-voice-nano

## Resumen

doctruyen-voice-nano es un paquete de ficheros ONNX derivado de VieNeu-TTS v3 Nano, un modelo de síntesis de voz (text-to-speech) en vietnamita desarrollado originalmente por el usuario pnnbao-ump. El autor de este repositorio, vietphamqq, lo publica como los ficheros de voz que la aplicación DocTruyen.ai descarga en el primer arranque para ejecutar la síntesis de voz en el propio dispositivo. No se trata, por tanto, de un modelo entrenado desde cero, sino de una exportación a ONNX del modelo base junto con sus ajustes y sus voces predefinidas.

El repositorio tiene un tamaño de 0,3 GB y contiene cuatro componentes de red separados (codificador de texto, predictor de duración, estimador de vectores y decodificador de códec), además de un fichero de configuración `nano.json`, un directorio `voices/` con dos voces (Minh Quân y Mỹ Duyên) y un `manifest.json` que recoge el tamaño y el hash SHA-256 de cada fichero para verificar su integridad en la descarga.

Su relevancia es acotada pero concreta: ofrece un ejemplo práctico de despliegue de TTS en el dispositivo mediante ONNX Runtime, con verificación criptográfica de los artefactos y un modelo de tamaño reducido (la variante "Nano" del nombre), pensado para integrarse en una aplicación móvil o de escritorio que convierte texto en voz en vietnamita sin depender de servicios en la nube. La información pública disponible sobre arquitectura, parámetros y entrenamiento es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS con codificador de texto, predictor de duración, estimador de vectores y decodificador de códec) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se distribuyen en formato ONNX; el modelo base se denomina "Nano") |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`text_encoder.onnx`, `duration_predictor.onnx`, `vector_estimator.onnx`, `codec_decoder.onnx`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base VieNeu-TTS v3 Nano ni sus datos de entrenamiento. Lo que sí se puede afirmar es que el pipeline de inferencia se descompone en cuatro módulos ONNX: un codificador de texto que transforma la entrada lingüística en representaciones, un predictor de duración que estima la longitud temporal de cada unidad de habla, un estimador de vectores que genera las representaciones acústicas intermedias y un decodificador de códec que produce la forma de onda final. Esta separación en etapas es habitual en los sistemas TTS modernos basados en modelos de difusión o de flujo, aunque no se confirma qué familia concreta emplea.

El repositorio no incluye información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en TTS). Tampoco se documentan innovaciones técnicas específicas más allá de la exportación a ONNX y el mecanismo de verificación de integridad mediante `manifest.json` con tamaños y hashes SHA-256, que garantiza que la aplicación cliente descarga exactamente los artefactos esperados.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita a partir de texto de entrada.
- Dos voces predefinidas incluidas en el repositorio: Minh Quân y Mỹ Duyên.
- Ejecución en el dispositivo mediante ONNX Runtime, sin necesidad de conexión a un servicio remoto de inferencia.
- Verificación de integridad de los ficheros descargados mediante `manifest.json` (tamaño y SHA-256).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, capacidades ajenas al propósito del modelo.
- No se documentan capacidades multimodales adicionales (visión, audio de entrada, etc.) ni modos especiales como "thinking mode".
- El soporte multilingüe se limita al vietnamita según la etiqueta de idioma declarada.

## Casos de uso

- Lectura de textos largos en voz alta dentro de la aplicación DocTruyen.ai: el modelo convierte el contenido textual en audio en vietnamita directamente en el dispositivo, lo que permite escuchar novelas o documentos sin enviar el texto a un servidor externo.
- Aplicaciones móviles de audiolibros o lectura asistida: al distribuirse como ficheros ONNX de 0,3 GB y ejecutarse en local, encaja en apps que necesitan funcionar sin conexión y con requisitos de privacidad estrictos.
- Asistentes de accesibilidad para usuarios con discapacidad visual: la síntesis local permite leer pantallas o documentos en vietnamita sin depender de la latencia ni de la disponibilidad de una API en la nube.
- Integración en pipelines de generación de audio por lotes: los cuatro módulos ONNX pueden orquestarse con ONNX Runtime en servidores o estaciones de trabajo para producir narraciones de forma automatizada.
- Prototipado de interfaces conversacionales en vietnamita: las dos voces incluidas permiten alternar interlocutores en demos de diálogo o en pruebas de producto.
- Distribución de contenido educativo o informativo en formato audio: el modelo permite convertir artículos o material didáctico en vietnamita a voz para su consumo en movilidad.
- Verificación de integridad en despliegues de modelos: el patrón de `manifest.json` con SHA-256 sirve como referencia para equipos que necesitan asegurar que los artefactos descargados en producción no han sido alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,3 GB, lo que sugiere un modelo de tamaño reducido, pero no se especifica el consumo de memoria en ejecución.
- GPU recomendadas: no disponible. Al ejecutarse mediante ONNX Runtime, puede desplegarse tanto en CPU como en GPU compatibles con dicho runtime, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del repositorio (0,3 GB) es compatible con GPUs de consumo, pero no hay datos oficiales de VRAM ni de latencia.
- Opciones de despliegue: ONNX Runtime (formato nativo de los pesos). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no a este tipo de pipeline TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS en vietnamita que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita; no es adecuado para síntesis en otros idiomas.
- No se dispone de información sobre sesgos en las voces o en la pronunciación de determinados registros o dialectos.
- Riesgo de alucinación y de errores de pronunciación inherente a los sistemas TTS, especialmente en palabras poco frecuentes, nombres propios o texto con caracteres especiales; no se documenta su magnitud.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y el fichero `NOTICE` incluidos en el repositorio.
- Al ser una exportación de un modelo base de terceros, cualquier limitación del modelo original VieNeu-TTS v3 Nano se hereda en esta versión.
- El repositorio no incluye documentación sobre el proceso de exportación a ONNX ni sobre posibles diferencias de calidad respecto al modelo original.
- No hay métricas publicadas de calidad de síntesis (MOS, inteligibilidad, etc.) que permitan evaluar su idoneidad en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vietphamqq/doctruyen-voice-nano
- Modelo base: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Nano
