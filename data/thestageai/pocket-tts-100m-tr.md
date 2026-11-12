# TheStageAI/pocket-tts-100m-tr

## Resumen

pocket-tts-100m-tr es un modelo de síntesis de voz (text-to-speech) en turco de 100 millones de parámetros, publicado por TheStageAI como conjunto de motores Core ML optimizados para el Neural Engine (ANE) de Apple. No se trata de un modelo entrenado desde cero por TheStageAI, sino de una conversión y empaquetado del fine-tune turco `wite-tech/pocket-tts-turkish`, que a su vez deriva del modelo base `kyutai/pocket-tts` de Kyutai. El resultado se distribuye dentro del SDK de TheStage para macOS e iOS bajo el identificador `model_type: pocket-tts` y el idioma de bundle `tr`.

La relevancia del artefacto es de ingeniería de despliegue más que de investigación: empaqueta un modelo TTS pequeño en un motor cifrado (QLPA) que aprovecha la aceleración del ANE para inferencia local en dispositivos Apple, con un decodificador Mimi en fp32 ejecutado en CPU. El repositorio ocupa 0,8 GB y el bundle de motores `subscription/macos_ios/engines.zip` pesa 151 MB, lo que refleja la compresión aplicada al transformer del flow LM mediante cuantización palettizada de 6 bits.

La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face. No hay información sobre el dataset de entrenamiento del fine-tune turco, métricas de calidad (MOS, WER), latencia medida ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow LM tipo transformer (6 capas, dimensión 1024) con cabeza flow LSD, más decodificador Mimi; empaquetado como motores Core ML para ANE (flow LM) y CPU (Mimi) |
| Parametros totales | 100M (según el nombre del modelo y la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Flow LM en fp16 con capas transformer palettizadas de 6 bits (g8); decodificador Mimi en fp32 |
| Idiomas soportados | Turco (tr); incluye referencias de voz en inglés (azelma, alba, charles, cosette, javert, marius) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Motores Core ML dentro de `engines.zip` (151 MB), cifrados con QLPA; no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Pocket TTS de Kyutai: un flow LM transformer de 6 capas con dimensión 1024 y una cabeza flow LSD que genera los tokens acústicos, seguido del decodificador neuronal Mimi que convierte dichos tokens en waveform de audio. TheStageAI no describe cambios arquitectónicos propios; su aportación es la conversión a Core ML, la cuantización selectiva (fp16 en el flow LM con capas transformer palettizadas a 6 bits y decodificador Mimi en fp32) y el cifrado QLPA de los motores.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las técnicas de alineación empleadas, ni en el modelo base de Kyutai ni en el fine-tune turco de wite-tech. La model card solo indica que el fine-tune turco incluye seis voces sintéticas creadas por el autor del modelo base. Tampoco se documentan innovaciones de decodificación (especulativa, attention linear u otras) más allá de la propia arquitectura Pocket TTS.

## Capacidades

- Síntesis de voz (text-to-speech) en turco a partir de texto de entrada.
- Seis voces turcas predefinidas: female_1 (voz de referencia por defecto), female_2, female_3, male_1, male_2 y male_3.
- Referencias de voz adicionales en inglés: azelma, alba, charles, cosette, javert y marius.
- Ejecución local en dispositivos Apple mediante Core ML, con el flow LM en el Neural Engine y el decodificador Mimi en CPU.
- Integración en el SDK de TheStage para macOS e iOS bajo `model_type: pocket-tts` y bundle de idioma `tr`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es un modelo estrictamente TTS.
- No se documentan capacidades multilingües más allá del turco y las referencias de voz en inglés.

## Casos de uso

- Lectura por voz de contenido en turco en aplicaciones iOS y macOS: el modelo se integra a través del SDK de TheStage y ejecuta la síntesis en el propio dispositivo, sin depender de servicios en la nube.
- Asistentes de voz locales para usuarios turcoparlantes: al correr sobre el ANE, permite respuestas habladas con baja dependencia de red y sin enviar texto del usuario a servidores externos.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de apoyo a personas con discapacidad visual en turco, con varias voces masculinas y femeninas para personalización.
- Audiolibros y podcasts generados: el tamaño reducido del modelo (100M parámetros, bundle de 151 MB) facilita su inclusión en apps de lectura que sintetizan capítulos bajo demanda en el dispositivo.
- Aprendizaje de idiomas: reproducción de frases y vocabulario en turco con distintas voces para practicar comprensión auditiva, aprovechando las seis voces disponibles.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten un motor TTS turco dentro de una app Apple pueden validar flujos de voz sin integrar infraestructura de inferencia propia.
- Sistemas de navegación o avisos hablados en turco: anuncios cortos generados localmente con latencia predecible al ejecutarse en hardware dedicado (ANE).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Diseñado para ejecutarse en dispositivos Apple con Neural Engine: iPhone, iPad y Mac con chip de la serie M o A compatible con Core ML.
- El flow LM se ejecuta en el ANE; el decodificador Mimi en fp32 se ejecuta en CPU.
- El bundle de motores ocupa 151 MB, por lo que el modelo cabe holgadamente en la memoria de cualquier dispositivo Apple moderno.
- No se documentan requisitos de VRAM para GPU discretas (NVIDIA, AMD) ni opciones de despliegue en vLLM, llama.cpp, Ollama o TGI; el artefacto está empaquetado exclusivamente como motores Core ML cifrados con QLPA.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| pocket-tts-100m-tr (TheStageAI) | 100M | no disponible | tr (+ referencias en inglés) | CC-BY-4.0 | Core ML / ANE, cifrado QLPA |
| wite-tech/pocket-tts-turkish | 100M (fine-tune del anterior) | no disponible | tr | CC-BY-4.0 | Pesos originales del fine-tune (formato no detallado en la información disponible) |
| kyutai/pocket-tts | 100M (modelo base) | no disponible | no disponible | no disponible en la información proporcionada | Pesos originales de Kyutai (formato no detallado) |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes ni con otros modelos TTS de tamaño similar.

## Limitaciones y advertencias

- Solo se documenta turco como idioma de síntesis; las voces en inglés son referencias de voz, no una garantía de síntesis correcta en inglés.
- No hay métricas de calidad (MOS, WER, similitud de hablante) publicadas, por lo que la calidad percibida no puede evaluarse a priori.
- Las seis voces turcas son sintéticas y creadas por el autor del modelo base; pueden presentar sesgos de prosodia o de registro limitados al material con el que se generaron.
- El cifrado QLPA de los motores implica dependencia del SDK de TheStage para su uso; no es un artefacto directamente cargable con herramientas estándar de inferencia.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero debe verificarse la cadena de licencias del modelo base de Kyutai, cuya licencia no se detalla en la información disponible.
- El modelo está atado al ecosistema Apple (Core ML / ANE); no hay ruta de despliegue documentada para Linux, Windows o GPUs NVIDIA.
- Riesgo de alucinación acústica y errores de pronunciación en texto con números, siglas o préstamos léxicos no representados en el entrenamiento, habitual en modelos TTS pequeños.
- No se documentan limitaciones de longitud de contexto ni de duración máxima de audio generado.

## Enlaces

- Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-100m-tr
- Modelo base del fine-tune: https://huggingface.co/wite-tech/pocket-tts-turkish
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
