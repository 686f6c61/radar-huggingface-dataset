# yetanotherion/euskarazko-uneak-models

## Resumen

Euskarazko Uneak models es un repositorio de modelos ONNX de inferencia en navegador publicado por el usuario yetanotherion para la aplicación web Euskarazko Uneaks. No se trata de un modelo de lenguaje generativo, sino de un conjunto de tres artefactos especializados que se descargan desde el navegador y se fijan a un commit concreto del repositorio: un identificador de idioma (euskera, francés, español y otros), un export ONNX del encoder en int8 de NVIDIA Nemotron-3-Diarization para diarización de hablantes y un export de embeddings de NVIDIA NeMo TitaNet-small para verificación de hablantes.

El paquete resuelve un problema muy concreto: ejecutar identificación de idioma y diarización de hablantes en el cliente, sin backend, en un contexto bilingüe euskera-francés-español. El repositorio pesa 0,2 GB y no incluye pesos en formato safetensors ni GGUF, sino binarios ONNX más ficheros auxiliares de mel-spectrogramas y etiquetas. La licencia es mixta: el detector de idioma es CC-BY-NC-4.0 (solo uso no comercial, con licencias comerciales aparte) y los componentes derivados de NVIDIA usan OpenMDW-1.1 y Apache-2.0.

Es relevante ahora por dos motivos: la creciente demanda de procesamiento de audio local y privado en el navegador, y la escasez de herramientas de identificación de idioma que cubran el euskera junto con las lenguas románicas vecinas. No obstante, el repositorio no publica métricas de rendimiento, tamaño de los modelos individuales ni detalles del entrenamiento del detector de idioma propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el detector de idioma; Nemotron-3-Diarization y TitaNet-small (NVIDIA NeMo) en los componentes derivados |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelos de audio, no de texto) |
| Tipos de cuantizacion | Encoder de diarización exportado en int8; resto de componentes sin cuantización declarada |
| Idiomas soportados | Euskera, francés, español y "otros" (solo en identificación de idioma) |
| Licencia | Mixta: CC-BY-NC-4.0 (detector de idioma), OpenMDW-1.1 (Nemotron), Apache-2.0 (TitaNet) |
| Formato de pesos | ONNX (`.onnx`), más ficheros binarios auxiliares (`.bin`), JSON de etiquetas y `.txt` de parámetros |

## Arquitectura y entrenamiento

El repositorio agrupa tres componentes de naturaleza distinta. El detector de idioma (`lang_detect_mobile.onnx` con su `.labels.json`) es un modelo propio de los autores de Euskarazko Uneak, pensado para clasificar fragmentos de audio en euskera, francés, español u otra lengua; la model card no especifica su arquitectura, el volumen de datos de entrenamiento ni el proceso de anotación. El componente de diarización es un export ONNX con encoder cuantizado a int8 de NVIDIA Nemotron-3-Diarization, acompañado de un extractor de embeddings, ficheros de mel-spectrogramas (`mel.bin`), un fichero de silencio (`silence.bin`) y parámetros de configuración (`params.txt`). El tercer componente es un export solo de embeddings de TitaNet-small, el modelo de verificación de hablantes de NeMo, con su propio fichero de mel de 80 bandas (`mel80.bin`).

No hay información sobre el número de tokens ni horas de audio empleadas en el entrenamiento, ni sobre si hubo ajuste fino, destilación o técnicas de aumento de datos. La innovación técnica principal es el propio empaquetado: conversión a ONNX con encoder int8 para que los modelos quepan y se ejecuten en el navegador mediante runtime web, con los artefactos fijados a un commit para garantizar reproducibilidad. NVIDIA no respalda este repositorio y la propiedad intelectual de los modelos derivados sigue siendo de NVIDIA Corporation.

## Capacidades

- Identificación de idioma de audio entre euskera, francés, español y una clase residual "otros".
- Diarización de hablantes ("quién habla y cuándo") mediante el encoder int8 exportado de Nemotron-3-Diarization.
- Extracción de embeddings de hablante para verificación e identificación biométrica de voz con TitaNet-small.
- Ejecución en el navegador del cliente mediante ONNX Runtime web, sin necesidad de backend.
- Extracción de características de audio integrada: mel-spectrogramas precalculados o empaquetados (`mel.bin`, `mel80.bin`) y detección de silencio (`silence.bin`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.

## Casos de uso

- Identificación de idioma en aplicaciones de transcripción multilingüe del País Vasco: el detector permite enrutar cada segmento de audio al modelo de reconocimiento de voz adecuado (euskera, francés o español) antes de transcribir.
- Diarización de reuniones y entrevistas en el navegador: el encoder int8 de Nemotron-3-Diarization permite segmentar una grabación por hablante sin subir el audio a un servidor, lo que resulta adecuado para entornos con requisitos de privacidad.
- Verificación de hablante en autenticación ligera: los embeddings de TitaNet-small permiten comparar la voz de un usuario con una plantilla almacenada, con un coste computacional bajo al ejecutarse en cliente.
- Subtitulado automático de contenido audiovisual en euskera: la combinación de identificación de idioma y diarización facilita etiquetar quién dice qué y en qué lengua en vídeos o pódcast.
- Investigación lingüística y corpus orales: el paquete permite preprocesar grabaciones de campo etiquetando idioma y hablantes de forma automática y local, sin depender de servicios en la nube.
- Aplicaciones educativas de aprendizaje de euskera: detección del idioma hablado por el alumno y separación de turnos de conversación en ejercicios de práctica oral dentro del navegador.
- Análisis de llamadas o atención al cliente en entornos bilingües: segmentación por hablante y detección de cambio de lengua para generar estadísticas de uso lingüístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precisión del detector de idioma, tasas de error de diarización (DER) ni métricas de verificación de hablante (EER), y tampoco se documentan latencias o throughput del runtime ONNX en navegador.

## Requisitos de hardware

- Inferencia en CPU del navegador mediante ONNX Runtime web; el repositorio completo ocupa 0,2 GB, por lo que la descarga inicial es ligera en comparación con modelos de lenguaje.
- VRAM dedicada: no disponible; al ejecutarse en navegador, el consumo relevante es memoria RAM del proceso del navegador, no cuantificada en la model card.
- GPU recomendadas: no disponibles; el diseño apunta a ejecución en cliente con aceleración WebGPU o WASM según el runtime, pero no se especifican modelos de GPU ni requisitos mínimos.
- Compatibilidad con GPU de consumo: no documentada; el encoder int8 sugiere que el objetivo es hardware modesto, incluidos portátiles sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime web en el navegador; también podría usarse ONNX Runtime nativo en servidor, aunque no es el caso de uso declarado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Euskarazko Uneak models (este repositorio) | Identificación de idioma y diarización | No disponible | No aplica | Mixta (CC-BY-NC-4.0, OpenMDW-1.1, Apache-2.0) | ONNX en Hugging Face |
| NVIDIA Nemotron-3-Diarization | Diarización de hablantes | No disponible en la información proporcionada | No aplica | OpenMDW-1.1 | Pesos originales de NVIDIA |
| NVIDIA NeMo TitaNet-small | Verificación de hablantes | No disponible en la información proporcionada | No aplica | Apache-2.0 | Pesos originales de NVIDIA |
| Whisper (detección de idioma integrada) | Identificación de idioma y transcripción | Varía según variante | No aplica | MIT | Diversos formatos |

La comparación directa es limitada: este repositorio no aporta un modelo nuevo de diarización ni de verificación, sino exports ONNX de modelos de NVIDIA, por lo que su valor diferencial está en el empaquetado para navegador y en el detector de idioma propio con cobertura de euskera. Frente a Whisper, que incluye detección de idioma pero está orientado a transcripción y es mucho más pesado, este paquete es más ligero pero no transcribe.

## Limitaciones y advertencias

- El detector de idioma tiene licencia CC-BY-NC-4.0: queda prohibido el uso comercial sin adquirir una licencia separada de los autores.
- La licencia del repositorio es mixta y cada componente tiene condiciones distintas; es necesario revisar los ficheros `LICENSE`, `nemotron/LICENSE.OpenMDW-1.1` y `nemotron/LICENSE.TitaNet-Apache-2.0` antes de redistribuir.
- Los componentes de diarización y verificación son conversiones no oficiales: NVIDIA no respalda el repositorio y no hay garantía de equivalencia numérica con los pesos originales, especialmente tras la cuantización int8 del encoder.
- No se publican métricas de precisión, por lo que el rendimiento real en euskera, francés y español es desconocido; la clase "otros" del detector puede absorber lenguas cercanas con errores no documentados.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No hay información sobre sesgos por variedad dialectal del euskera ni sobre el comportamiento con acentos no nativos.
- La fijación de los artefactos a un commit concreto implica que actualizaciones del repositorio pueden romper la aplicación consumidora si no se gestiona la versión.
- El tamaño de 0,2 GB corresponde al repositorio completo; no se detalla el peso individual de cada fichero, lo que dificulta planificar la descarga selectiva en el navegador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yetanotherion/euskarazko-uneaks-models
- NVIDIA Nemotron-3-Diarization: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Licencia OpenMDW-1.1 (referenciada en el repositorio): https://openmdw.ai/
- Licencia CC-BY-NC-4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- ONNX Runtime: https://onnxruntime.ai/
