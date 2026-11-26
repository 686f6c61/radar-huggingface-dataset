# vnhellboy/kokoro-german-coreml

## Resumen

Kokoro-german-coreml es una conversión a Core ML del modelo de síntesis de voz Kokoro-82M, en concreto de los fine-tunes alemanes publicados por el proyecto kikiri-tts. El autor, vnhellboy, empaqueta dos voces completas (martin, masculina, y victoria, femenina) como cadenas de siete etapas Core ML pensadas para ejecutarse en el Neural Engine de Apple a través del gestor `KokoroAneManager` de FluidAudio. El resultado es un motor TTS autocontenido por voz: cada carpeta incluye pesos, vocabulario, voice pack y un manifiesto con tamaños y hashes SHA-256.

El modelo resuelve un problema muy concreto: llevar un TTS alemán de 82 millones de parámetros a producción en dispositivos Apple (macOS, iOS, iPadOS) sin depender de PyTorch ni de un servidor. La conversión mezcla precisión fp16 e int8 palettized para las etapas principales y fp32 para prosodia, ruido y cola, lo que reduce el peso del repositorio a unos 0,2 GB. La entrada no es texto libre, sino fonemas generados con `EspeakG2P(language="de")` de misaki 0.9.4, tal y como se entrenaron las voces originales.

Es relevante para desarrolladores que necesiten TTS neuronal offline en el ecosistema Apple con licencia Apache 2.0, y como ejemplo de pipeline de conversión Core ML multi-etapa con validación frente al modelo PyTorch original. El repositorio no incluye la model card del modelo base ni datos de entrenamiento propios; toda la información técnica procede de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (TTS neuronal) convertido a cadena Core ML de 7 etapas |
| Parametros totales | 82 M (modelo base Kokoro-82M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por fonemas; sin ventana de contexto definida) |
| Tipos de cuantizacion | fp16 + int8 palettized en etapas principales; fp32 en prosodia, ruido y cola |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc`/`.mlpackage` dentro de `kokoro-82m-coreml/ANE/`), `vocab.json`, voice pack `.bin`, `manifest.json` |
| Voces incluidas | `dm_martin` (masculina), `df_victoria` (femenina) |
| Entrada requerida | fonemas de misaki 0.9.4 `EspeakG2P(language="de")` (eSpeak NG) |
| Tamano del repositorio | 0,2 GB |
| Runtime objetivo | Neural Engine de Apple via FluidAudio `KokoroAneManager` |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M, un TTS neuronal de 82 millones de parámetros. Sobre él, kikiri-tts publicó fine-tunes alemanes para las voces martin y victoria, entrenados con fonemas de eSpeak NG en alemán. Este repositorio no entrena nada: convierte esos fine-tunes a una cadena Core ML de siete etapas que FluidAudio ejecuta en el Neural Engine. Cada etapa se validó contra el modelo PyTorch original mediante correlación y comparación del espectro de salida, según indica el autor.

La innovación técnica está en el empaquetado: separación de etapas con precisión mixta (fp16 e int8 palettized para las partes pesadas, fp32 para prosodia, ruido y cola), un voice pack por carpeta que convierte cada directorio en un motor completo, y un `manifest.json` con tamaño y SHA-256 de cada fichero para verificación de integridad. Se incluye además una copia del voice pack como `af_heart.bin` únicamente porque la comprobación de ficheros de FluidAudio espera ese nombre. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en los fine-tunes originales.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán a partir de fonemas eSpeak NG.
- Dos voces: `dm_martin` (masculina) y `df_victoria` (femenina), cada una con su propio conjunto de pesos.
- Inferencia en el Neural Engine de Apple mediante la cadena Core ML de siete etapas.
- Ejecución local/offline: no requiere servicio remoto ni PyTorch en tiempo de inferencia.
- Verificación de integridad de artefactos mediante hashes SHA-256 en `manifest.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No incluye capacidades de visión, audio de entrada ni modo thinking.
- Multilingüismo limitado al alemán; no se declaran otras lenguas.

## Casos de uso

- Lectura por voz en apps iOS y macOS: integrar la cadena Core ML en una aplicación nativa para narrar contenido con las voces martin o victoria, aprovechando el Neural Engine y sin conexión a red.
- Accesibilidad: convertir texto de interfaces, noticias o documentos en audio alemán para usuarios con discapacidad visual, con latencia local y sin enviar datos a terceros.
- Asistentes de voz offline: usar el modelo como etapa TTS de un asistente que ya dispone de ASR y NLU locales, manteniendo toda la conversación en el dispositivo.
- Audiolibros y podcasts generados: sintetizar borradores de narración en alemán para revisión editorial antes de una locución humana, con dos timbres disponibles.
- Sistemas de navegación y avisos: generar indicaciones habladas en alemán en tiempo real dentro de una app de地图 o automoción, donde el coste de una llamada a la nube es inaceptable.
- Pruebas de calidad de TTS en pipelines CI: validar la conversión Core ML frente al modelo PyTorch con las comprobaciones de correlación y espectro que el autor aplicó, como referencia para otras conversiones.
- Prototipado de productos de voz en el ecosistema Apple: disponer de un motor TTS alemán Apache 2.0 listo para embeber en una app antes de decidir si se escala a infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona validaciones de fidelidad de la conversión (correlación y comparación de espectro frente al modelo PyTorch), sin cifras publicadas.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para el Neural Engine de Apple, no para GPU NVIDIA.
- GPU recomendadas: no aplica. El runtime objetivo es el ANE (Apple Neural Engine) de chips Apple Silicon (serie M) y A-series compatibles.
- Cabe en hardware de consumo: sí, en equipos Apple con Neural Engine; el repositorio completo ocupa 0,2 GB.
- Opciones de despliegue: FluidAudio `KokoroAneManager` sobre Core ML; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un TTS Core ML).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kokoro-german-coreml (este) | 82 M | de | Core ML (ANE) | Apache 2.0 | Conversión de fine-tunes kikiri-tts, 2 voces, solo Apple |
| Kokoro-82M original | 82 M | en (principal) | PyTorch/safetensors, ONNX, GGUF en la comunidad | Apache 2.0 | Referencia upstream; no incluye alemán nativo |
| kikiri-german-martin / victoria | 82 M | de | PyTorch/safetensors | no disponible en la información | Fine-tunes originales en alemán; requieren PyTorch |
| Piper (voces alemanas) | variable (modelos pequeños) | de entre otros | ONNX | MIT en el código; licencias de voces variables | Alternativa TTS ligera multiplataforma, no específica de ANE |

## Limitaciones y advertencias

- Solo alemán: no se declaran otras lenguas y la entrada debe ser fonemas de `EspeakG2P(language="de")` de misaki 0.9.4; texto libre requiere un paso G2P previo.
- Dependencia fuerte de FluidAudio y del Neural Engine: no es portable a GPU NVIDIA ni a servidores Linux sin rehacer la conversión.
- El nombre `af_heart.bin` es un artefacto de compatibilidad con la comprobación de ficheros de FluidAudio; no debe interpretarse como una voz inglesa disponible.
- Sin benchmarks publicados de calidad (MOS, WER) ni de latencia; la validación declarada es solo de fidelidad frente a PyTorch.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser TTS, el riesgo se traslada a pronunciación incorrecta de nombres propios, siglas y extranjerismos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y procedencia de los fine-tunes kikiri-tts originales, no detallada aquí.
- Sin garantías de mantenimiento: creado y actualizado el mismo día (26 de noviembre de 2026), sin historial posterior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vnhellboy/kokoro-german-coreml
- Fine-tune voz masculina: https://huggingface.co/kikiri-tts/kikiri-german-martin
- Fine-tune voz femenina: https://huggingface.co/kikiri-tts/kikiri-german-victoria
- Organización kikiri-tts: https://huggingface.co/kikiri-tts
- FluidAudio (runtime `KokoroAneManager`): no disponible en la información proporcionada
- misaki 0.9.4 (G2P): no disponible en la información proporcionada
