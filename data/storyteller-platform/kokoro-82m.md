# storyteller-platform/kokoro-82m

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech, TTS) de 82 millones de parámetros entrenado por hexgrad y publicado bajo licencia Apache-2.0. Este repositorio concreto (`storyteller-platform/kokoro-82m`) es un espejo de la versión 2.0.0 del modelo dentro del registro de modelos de Storyteller, una plataforma de narración que lo instala a través de su componente `ghost-story`. No se trata, por tanto, del repositorio canónico del modelo, sino de una réplica orientada al consumo por parte de una aplicación concreta.

El artefacto principal disponible aquí es una conversión a formato GGUF realizada por audio.cpp (repositorio `audio-cpp/audio.cpp-gguf`, revisión `7bf52723f5a9`), y de todas las cuantizaciones GGUF generadas solo se conserva `kokoro-82m-q8_0.gguf`. El tamaño del repositorio es de aproximadamente 0,2 GB, coherente con un modelo de 82M de parámetros en cuantización de 8 bits.

La relevancia de esta ficha radica en que permite evaluar rápidamente la disponibilidad del modelo en formato GGUF para despliegues locales. Conviene tener en cuenta que la model card de este espejo no documenta arquitectura, idiomas, datos de entrenamiento ni benchmarks; esa información debe consultarse en el repositorio original de hexgrad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada |
| Parametros totales | 82M (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q8_0 (unica cuantizacion conservada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`kokoro-82m-q8_0.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación de este repositorio. La model card se limita a indicar que el modelo fue entrenado por hexgrad y que la conversión a GGUF fue realizada por audio.cpp. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO.

El único detalle técnico verificable es el proceso de conversión: los archivos GGUF se mantienen sin modificar respecto a la conversión de audio.cpp en la revisión `7bf52723f5a9`, y de las distintas cuantizaciones generadas solo se conserva la de 8 bits (`q8_0`). Para obtener información sobre arquitectura y entrenamiento es necesario consultar el repositorio original `hexgrad/Kokoro-82M`.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech), deducida del propósito del modelo y de su uso por parte de la plataforma Storyteller para narración.
- Generación de audio en formato compatible con el ecosistema GGUF de audio.cpp.
- No se documentan en esta model card capacidades de clonación de voz, control de estilo, multilingüismo, tool calling ni razonamiento multi-paso.
- No se especifica soporte de SSML, control de prosodia ni marcas de énfasis.

## Casos de uso

- Narración de libros y documentos: Storyteller instala este modelo a través de `ghost-story` para convertir texto en audio narrado, lo que lo convierte en el caso de uso principal y documentado de este repositorio.
- Lectura de artículos en aplicaciones de accesibilidad: un modelo de 82M de parámetros en q8_0 ocupa del orden de 0,2 GB, lo que permite ejecutarlo en dispositivos con recursos limitados para leer texto en voz alta.
- Generación de audiolibros por lotes: al ser un modelo pequeño, puede procesar grandes volúmenes de texto en pipelines automatizados sin requerir GPU de gama alta.
- Integración en aplicaciones de escritorio o móviles: el formato GGUF y la cuantización q8_0 facilitan el despliegue local mediante runtimes compatibles con GGUF, sin depender de servicios en la nube.
- Previsualización de contenido en herramientas de publicación: permite generar borradores de audio para revisar la locución de un texto antes de producir una versión final.
- Automatización de avisos y locuciones en sistemas internos: la licencia Apache-2.0 permite integrar el modelo en productos comerciales sin obligación de liberar el código que lo acompaña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 82M de parámetros en q8_0 ocupa del orden de 0,2 GB en disco, por lo que la memoria necesaria para los pesos es reducida, aunque el consumo real depende del runtime y del buffer de audio.
- GPU recomendadas: no se especifican en la información proporcionada. Por el tamaño del modelo, es previsible que funcione en GPU de gama consumer, pero no hay datos oficiales que lo confirmen.
- Cabe en GPU consumer: no confirmado oficialmente; el tamaño de los pesos sugiere que sí, pero no se dispone de requisitos publicados.
- Opciones de despliegue: el formato GGUF apunta a runtimes compatibles con GGUF del ecosistema audio.cpp; no se documentan integraciones con vLLM, TGI, Ollama o llama.cpp en esta model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio es un espejo de la versión 2.0.0 del modelo dentro del registro de Storyteller, no el repositorio canónico; para la versión oficial debe consultarse `hexgrad/Kokoro-82M`.
- Solo se conserva la cuantización `q8_0`; no hay disponibles otras cuantizaciones GGUF en este repositorio, lo que limita el ajuste fino entre calidad y tamaño.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación o artefactos de audio en esta model card.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del repositorio original de hexgrad y de la conversión de audio.cpp antes de redistribuir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No hay información sobre latencia, calidad perceptual (MOS) ni pruebas de robustez en texto con caracteres especiales, números o siglas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/storyteller-platform/kokoro-82m
- Modelo original de hexgrad: https://huggingface.co/hexgrad/Kokoro-82M
- Conversión GGUF de audio.cpp: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Registro de modelos de Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/kokoro-82m
