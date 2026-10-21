# yayaiu6/Verto-Arabic-ASR

## Resumen

Verto Arabic ASR es un modelo de reconocimiento automático del habla (ASR) especializado en árabe egipcio y en habla con alternancia de código árabe-inglés, publicado por el usuario yayaiu6 en HuggingFace. No se trata de un modelo entrenado desde cero: es una conversión a ONNX INT8 del modelo Metro-ASR-Small (mohammedaly22), empaquetada junto con el preprocesado de audio y el decodificador necesarios para ejecutarse íntegramente en el navegador. El autor aporta la cuantización y la integración web, y mantiene la licencia MIT y la atribución original.

La arquitectura subyacente es un Conformer con cabeza CTC y decodificación greedy, sin KenLM ni marcas de tiempo. El artefacto ONNX ocupa 69,46 MB y el paquete completo con tokenizador y assets de audio llega a 69,93 MB (MB decimales), lo que lo sitúa en la franja de modelos pequeños aptos para inferencia en CPU mediante WebAssembly, con WebGPU opcional y fallback a CPU.

Su relevancia actual está en el nicho de ASR privado y de baja latencia en el cliente: el audio se procesa en el dispositivo, sin enviar muestras a un servidor, algo crítico para datos personales y para aplicaciones web sin backend de GPU. La contrapartida es que el modelo está en estado de preview: el autor declara que la evaluación de WER/CER con referencias humanas sigue pendiente y que la precisión varía con el ruido, el dialecto y el vocabulario no habitual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer con cabeza CTC (modelo base Metro-ASR-Small, convertido a ONNX) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; la aplicación admite clips de audio de 0,5 a 60 segundos |
| Tipos de cuantización | INT8 weight-only (solo pesos) con activaciones FP32; algunos pesos permanecen en FP32 |
| Idiomas soportados | Árabe (egipcio) e inglés, con alternancia de código árabe-inglés |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` INT8), más `tokenizer.json`, `preprocessor.json` y `mel_filters.json` como assets de la aplicación |
| Tamaño del artefacto | 69,46 MB ONNX; 69,93 MB con tokenizador y preprocesado de audio; repositorio de 0,1 GB |
| Entrada del modelo | `features` float32 `[1, T, 80]` (log-Mel de 80 bins, audio mono a 16 kHz) y `feature_lengths` int64 `[1]` |
| Salida del modelo | `log_probs` float32 `[1, T_out, V]` y `output_lengths` int64 `[1]` |
| Decodificación | CTC greedy, sin KenLM y sin marcas de tiempo |
| Runtime | ONNX Runtime Web (WASM por defecto, WebGPU opcional con fallback a CPU); no es un pipeline drop-in de Transformers.js |
| Descargas / likes | 24 descargas, 1 like |
| Fecha de creación / actualización | 2026-10-19 / 2026-10-20 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Conformer, es decir, un codificador que combina bloques convolucionales y auto-atención, acoplado a una cabeza de clasificación CTC. La decodificación es CTC greedy sobre las probabilidades logarítmicas de salida, sin modelo de lenguaje externo (KenLM) ni alineamientos temporales, lo que simplifica el despliegue pero renuncia a la corrección léxica que aporta un LM y a la posibilidad de emitir timestamps por palabra.

No hay entrenamiento original por parte de este autor: la model card indica explícitamente que Verto aporta la conversión a INT8 y la integración en navegador, no un modelo nuevo. Los pesos de origen corresponden a Metro-ASR-Small, revisión del Space `525644dc782b6627f1eb1f0a589407fcacbfc152`, y se desconoce en la información disponible el volumen de tokens de audio, la composición del dataset, el uso de técnicas de aumento de datos o cualquier etapa de ajuste fino con RLHF/DPO. La innovación técnica del artefacto es de ingeniería de despliegue: cuantización weight-only INT8 con activaciones en FP32, preprocesado log-Mel implementado en el cliente y un pipeline propio de audio y texto que sustituye al de Transformers.js.

## Capacidades

- Transcripción de voz a texto en árabe egipcio y en inglés, incluyendo utterances con alternancia de código entre ambos idiomas.
- Ejecución local en el navegador: el audio no se envía a ningún servidor, el procesamiento ocurre en el dispositivo del usuario.
- Inferencia en CPU mediante WebAssembly y, opcionalmente, aceleración con WebGPU con retroceso automático a CPU si no está disponible.
- Aceptación de clips de audio de 0,5 a 60 segundos por petición en la aplicación de referencia.
- API JavaScript (`VertoASR`) con métodos `load`, `transcribe` y `close` para integrar la transcripción en una aplicación web.
- Uso directo del grafo ONNX desde otros runtimes, alimentando log-Mel de 80 bins a 16 kHz y leyendo `log_probs` para decodificar por CTC.
- Despliegue autocontenido vía Docker sin necesidad de Node ni npm en el servidor.
- No dispone de marcas de tiempo, diarización de hablantes, puntuación automática documentada ni modo de razonamiento o tool calling: es un modelo puramente ASR.

## Casos de uso

- Dictado por voz en aplicaciones web: integrar `VertoASR` en un editor o formulario para transcribir directamente en el navegador, sin backend, manteniendo el audio del usuario en su dispositivo.
- Subtitulado de clips cortos: procesar fragmentos de hasta 60 segundos (por ejemplo, stories, reels o notas de voz) y generar el texto para subtítulos en árabe egipcio o en inglés.
- Herramientas de accesibilidad: convertir voz a texto en tiempo real para personas con limitaciones motoras en entornos where la privacidad del audio es requisito, al no existir transmisión externa.
- Transcripción de atención al cliente en árabe dialectal: analizar notas de voz de clientes egipcios, incluyendo mezclas de árabe e inglés típicas en contextos técnicos o comerciales, antes de pasarlas a un motor de análisis.
- Investigación sociolingüística y de code-switching: recoger y transcribir corpus de habla egipcia con inserción de términos ingleses, aprovechando que el modelo está entrenado sobre ese fenómeno.
- Preprocesado en pipelines de ASR en servidor: usar el ONNX INT8 con ONNX Runtime nativo para abaratar coste de CPU en transcripciones masivas de baja criticidad, reservando modelos mayores para casos donde se requiera máxima precisión.
- Aplicaciones offline o con conectividad intermitente: al distribuirse como assets estáticos y ejecutarse con WASM, puede cachearse y funcionar sin acceso a servicios de inferencia remotos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación de WER/CER con referencias humanas está pendiente y que solo se han comparado cualitativamente las salidas INT8 en navegador y en nativo sobre clips de la demo. El autor no reclama que la precisión se mantenga intacta respecto al modelo original.

| Aspecto | Estado |
|---|---|
| WER / CER con referencia humana | Pendiente de publicación |
| Comparación cualitativa INT8 navegador vs. nativo | Realizada sobre clips de demo (sin métricas publicadas) |
| Comparación frente al modelo base FP32 | No disponible |
| Throughput y latencia medidos | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el grafo INT8 ocupa 69,46 MB y el conjunto de assets 69,93 MB, por lo que el consumo de memoria es del orden de decenas a pocos cientos de MB incluyendo activaciones y buffers de audio.
- GPU recomendadas: no aplica en el escenario objetivo (navegador). Para uso nativo con GPU se puede emplear cualquier GPU compatible con ONNX Runtime (por ejemplo, series RTX o datacenter), pero no hay recomendaciones ni cifras publicadas por el autor.
- Cabe en GPU de consumo: sí, con enorme margen; de hecho el caso de uso principal es CPU. También cabe en dispositivos móviles y equipos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime Web (WASM por defecto, WebGPU opcional) para navegador; ONNX Runtime nativo para servidor; imagen Docker publicada en el repositorio de GitHub sin dependencias de Node ni npm. No es compatible como pipeline de Transformers.js.
- Latencia y throughput estimados: no disponibles. Dependen del dispositivo, del backend (WASM frente a WebGPU) y de la duración del clip, limitada a 60 segundos por petición en la aplicación de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Formato / despliegue | Rendimiento |
|---|---|---|---|---|---|---|
| Verto Arabic-ASR | No disponible | Clips de 0,5 a 60 s | Árabe egipcio, inglés (code-switching) | MIT | ONNX INT8, navegador y nativo | WER/CER pendientes de publicación |
| Metro-ASR-Small (modelo base) | No disponible | No disponible | Árabe, inglés (según model card del base) | MIT (preservada) | Pesos originales, presumiblemente FP32 | No disponible en la información proporcionada |
| Otros ASR pequeños para navegador | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información suministrada solo permite comparar con el modelo de origen, del que se conocen la licencia y la relación de cuantización, pero no los parámetros, el contexto ni métricas. No se dispone de datos verificables de alternativas comparables en el material consultado.

## Limitaciones y advertencias

- Estado de preview: la evaluación de WER/CER con referencias humanas está pendiente y el autor no garantiza que la precisión se mantenga respecto al modelo original tras la cuantización INT8.
- La precisión varía con el ruido de fondo, el dialecto y el vocabulario poco frecuente; el ámbito declarado es el árabe egipcio, por lo que el rendimiento en otros dialectos árabes no está caracterizado.
- Decodificación CTC greedy sin KenLM: mayor propensión a errores ortográficos y a palabras mal segmentadas que con un modelo de lenguaje de rescoring.
- Sin marcas de tiempo ni puntuación documentada, lo que limita su uso en subtitulado con sincronización o en análisis temporal fino.
- Límite de 60 segundos por clip en la aplicación de referencia; no está documentado el comportamiento con audios más largos sin segmentar.
- Riesgo de alucinación o inserciones en pasajes de silencio o ruido, habitual en modelos CTC entrenados con datos ruidosos; no hay evaluación publicada al respecto.
- Sesgos: al desconocerse la composición del dataset del modelo base, no se pueden evaluar sesgos de género, acento, edad o clase social en las transcripciones.
- El `tokenizer.json` incluido es la tabla de piezas de la aplicación, no el formato de Hugging Face Tokenizers, y el modelo no es un pipeline drop-in de Transformers.js; la integración requiere el cliente propio del repositorio.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución original, tal como se preserva en el fichero `LICENSE` del repositorio.
- Los resultados de la búsqueda web realizada no contenían documentación técnica ni referencias relevantes al modelo; toda la información procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yayaiu6/Verto-Arabic-ASR
- Demo: https://verto-arabic-asr.yahya-mahroof.site/
- Código y despliegue: https://github.com/yayaiu6/Verto-Arabic-ASR
- Modelo base: https://huggingface.co/mohammedaly22/Metro-ASR-Small
