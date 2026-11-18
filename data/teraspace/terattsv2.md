# TeraSpace/TeraTTSv2

## Resumen

TeraTTSv2 es un sistema de síntesis de voz (text-to-speech) publicado por TeraSpace que se distribuye íntegramente en formato ONNX y se ejecuta mediante ONNX Runtime, sin depender de PyTorch en inferencia. El modelo está orientado a la síntesis bilingüe ruso/inglés, con especial énfasis en el ruso: incorpora marcado automático de acentos léxicos mediante componentes derivados de RUAccent, expansión de números a palabras y normalización Unicode antes de la codificación del texto. La versión publicada emplea un profesor limpio de 25 segundos en inglés y ruso junto con un estudiante destilado de ocho pasos con CFG fija de 3.

El modelo resuelve el problema de desplegar TTS de calidad en entornos sin GPU dedicada o con requisitos estrictos de portabilidad, ya que el runtime ONNX permite ejecución en CPU con un número configurable de hilos. Ofrece diez estilos de voz precalculados (cinco rusos y cinco ingleses, dos de ellos con etiqueta *whisper*), control de velocidad mediante `duration_scale` y salida de audio en streaming a 44,1 kHz en mono `float32`.

Es relevante ahora porque combina un esquema de destilación con sampler de difusión (profesor con CFG ajustable frente a estudiante de ocho pasos), lo que reduce la latencia en producción manteniendo la posibilidad de recurrir al profesor cuando se necesita más control de calidad. Su licencia Open RAIL-M con atribución comercial obligatoria lo hace utilizable en productos comerciales, con la condición de citar explícitamente el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con sampler de difusión (profesor y estudiante destilado), ejecutado sobre ONNX Runtime; codificador de texto con marcado de acentos y normalización |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye grafos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ruso e inglés (etiquetas `<ru>` y `<en>` obligatorias) |
| Licencia | terattsv2-openrail-m-commercial-attribution (Open RAIL-M con condición adicional de atribución comercial) |
| Formato de pesos | ONNX (grafos para ONNX Runtime), cargables vía `transformers` con `trust_remote_code=True` |

## Arquitectura y entrenamiento

TeraTTSv2 se estructura en torno a un esquema de difusión para la generación de audio, con dos variantes de sampler empaquetadas en el mismo repositorio. El sampler `teacher` permite ajustar el parámetro `guidance` (classifier-free guidance) en tiempo de generación, mientras que el sampler `distilled` es un estudiante de ocho pasos con CFG 3 fijada en el grafo, lo que elimina la necesidad de calcular dos pasadas por paso y reduce el coste computacional. El pipeline incluye un codificador de texto que aplica expansión de números al idioma correspondiente, inserción de espacios tras puntuación y entre número y palabra siguiente, marcado de acentos en ruso y normalización Unicode; los caracteres fuera del vocabulario se descartan con un aviso en tiempo de ejecución.

El entrenamiento se realizó sobre el dataset `langswap/dialogs-ru-emotional-conversations`, centrado en conversaciones emocionales en ruso. La model card menciona un "profesor limpio inglés/ruso de 25 segundos" y su estudiante destilado correspondiente, lo que sugiere una etapa de destilación desde un modelo profesor de mayor capacidad hacia el sampler rápido. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO. El marcado de acentos rusos se apoya en componentes RUAccent (grafos ONNX neuronales más diccionarios), con un modo `dictionary` que carga únicamente los diccionarios y prescinde de los grafos neuronales.

## Capacidades

- Síntesis de voz bilingüe ruso/inglés con etiquetado de idioma obligatorio por segmento (`<ru>…</ru>`, `<en>…</en>`); el runtime rechaza entradas sin etiquetar o con etiquetas desbalanceadas.
- Diez estilos de voz precalculados: `ru_f1`, `ru_m5`, `ru_f2`, `ru_m1`, `eng_f3`, `eng_f4_whisper`, `eng_f5`, `eng_m2_whisper`, `eng_m3`, `eng_m4`. Los prompts rusos recomendados son `ru_f1` y `ru_m5`.
- Marcado automático de acentos léxicos en ruso mediante RUAccent, con prioridad para marcadores explícitos `+` cuando el usuario los proporciona.
- Expansión automática de números a palabras en el idioma de la etiqueta correspondiente (por ejemplo, "21" se expande a palabras en ruso dentro de `<ru>` y a palabras en inglés dentro de `<en>`).
- Control de velocidad del habla mediante `duration_scale` (valores mayores producen habla más lenta y larga); se recomienda probar valores por debajo de 1 (por ejemplo, 0,8) cuando una voz inglesa sintetiza texto ruso.
- Selección de sampler en tiempo de carga: `distilled` (rápido, ocho pasos) o `teacher` (con `guidance` ajustable).
- Salida de audio en streaming, en formato mono `float32` a 44.100 Hz, con guardado a WAV PCM de 16 bits mediante `save_wav` sin dependencias adicionales de audio.
- Inspección del texto normalizado final (tras expansión de números, marcado de acentos y normalización Unicode) mediante `normalize_text`.
- Ejecución en CPU mediante `CPUExecutionProvider` con número de hilos configurable.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- **Locución automatizada de contenido en ruso para vídeo y pódcast**: el modelo permite generar narración con acentos léxicos correctos gracias al marcado automático de RUAccent, lo que evita errores de pronunciación frecuentes en palabras rusas con acento móvil. La selección entre `ru_f1` y `ru_m5` cubre voces femenina y masculina recomendadas.
- **Atención al cliente con respuestas de voz bilingües**: un backend puede sintetizar respuestas en ruso e inglés dentro de la misma sesión alternando etiquetas `<ru>` y `<en>`, con `duration_scale` ajustado para adaptar la velocidad al perfil del usuario.
- **Audiolibros y lectura asistida**: la salida WAV a 44,1 kHz y el control de velocidad permiten generar capítulos completos con un ritmo consistente; el modo `dictionary` de RUAccent reduce el coste de carga cuando no se necesita el marcado neuronal completo.
- **Sistemas de accesibilidad en aplicaciones de escritorio**: al ejecutarse sobre ONNX Runtime en CPU con hilos configurables, el modelo puede integrarse en aplicaciones locales sin GPU, incluyendo entornos de escritorio donde no se dispone de CUDA.
- **Prototipado rápido de interfaces de voz**: el estudiante destilado de ocho pasos con CFG 3 fija reduce la latencia por utterance, lo que facilita iteraciones de diseño de producto sin esperar síntesis lentas.
- **Generación de doblaje de demostración con voces inglesas sobre texto ruso**: la model card documenta explícitamente el uso de voces inglesas para hablar ruso ajustando `duration_scale` por debajo de 1, útil para pruebas de concepto de localización.
- **Evaluación comparativa de samplers en pipelines de investigación**: la posibilidad de cargar el profesor con `guidance` ajustable y el estudiante destilado permite medir el compromiso calidad/latencia en el mismo entorno de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El modelo está diseñado para ejecutarse en CPU mediante `CPUExecutionProvider`, por lo que la VRAM no es un requisito documentado.
- GPU recomendadas: no disponible. La documentación de carga hace referencia explícita a `CPUExecutionProvider` con `threads=6`, sin mencionar proveedores CUDA, ROCm o DirectML.
- Compatibilidad con GPU de consumo: no disponible; no se documenta el comportamiento en RTX 4090, RTX 3090 u otras GPU de consumo.
- Tamaño del repositorio: 1,7 GB, lo que incluye los grafos ONNX del profesor, del estudiante destilado y los componentes RUAccent.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y backend ONNX Runtime; el repositorio incluye `requirements.txt`. `sounddevice` es necesario únicamente para reproducción directa por altavoz, y en Linux requiere la librería de sistema PortAudio.
- Latencia y throughput estimados: no disponibles. La model card indica cualitativamente que el sampler destilado es "más rápido" que el profesor, pero no se aportan cifras de RTF ni de latencia por utterance.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de la misma categoría (TTS bilingüe ruso/inglés en ONNX) que permitan una comparación rigurosa de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- El etiquetado de idioma es obligatorio: el runtime rechaza texto sin etiquetas `<ru>`/`<en>` o con etiquetas desbalanceadas, lo que obliga a preprocesar cualquier entrada de usuario antes de la síntesis.
- Los caracteres fuera del vocabulario del modelo se descartan silenciosamente (con aviso en tiempo de ejecución), lo que puede producir omisiones en texto con símbolos, emojis o alfabetos no soportados.
- Solo se soportan ruso e inglés; no hay soporte documentado para otras lenguas, y el marcado de acentos está especializado en ruso.
- Riesgo de alucinación acústica y de pronunciación incorrecta en palabras rusas fuera del vocabulario de RUAccent o en neologismos; los marcadores explícitos `+` son el mecanismo de corrección disponible.
- En síntesis cruzada (voz inglesa sobre texto ruso) la calidad puede degradarse; la model card recomienda experimentar con `duration_scale` por debajo de 1, lo que indica que el comportamiento por defecto no está optimizado para ese caso.
- La licencia Open RAIL-M impone restricciones de uso basadas en el uso (use-based restrictions) heredadas de BigScience, además de la condición de atribución comercial: cualquier producto o servicio comercial debe mencionar explícitamente "TeraTTSv2 by TeraSpace" en su descripción pública y enlazar al modelo donde se admitan hipervínculos, incluyendo aplicaciones locales con backend.
- Al redistribuir el modelo o derivados (fine-tune, cuantización, conversión, destilación) deben incluirse ambos archivos de licencia, conservar la condición de atribución, preservar avisos upstream e identificar modificaciones.
- Los componentes RUAccent tienen licencia propia y separada, documentada en `RUACCENT_NOTICE.txt`; su uso está sujeto a términos adicionales.
- No se documentan sesgos demográficos, acústicos ni de género de las voces más allá de la nomenclatura de los prompts; no hay evaluación de sesgos publicada en la información disponible.
- No se dispone de cifras de latencia, throughput ni calidad subjetiva (MOS) que permitan estimar el comportamiento en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TeraSpace/TeraTTSv2
- Licencia del modelo: https://huggingface.co/TeraSpace/TeraTTSv2/blob/main/LICENSE
- Licencia Open RAIL-M de BigScience: https://huggingface.co/TeraSpace/TeraTTSv2/blob/main/LICENSE-OPENRAIL
- Aviso de componentes RUAccent: https://huggingface.co/TeraSpace/TeraTTSv2/blob/main/RUACCENT_NOTICE.txt
- Dataset de entrenamiento: https://huggingface.co/datasets/langswap/dialogs-ru-emotional-conversations
