# willwade/byt5-g2p-multilingual-tiny

## Resumen

El modelo `willwade/byt5-g2p-multilingual-tiny` es un sistema de conversión de grafema a fonema (G2P) multilingüe basado en la arquitectura ByT5 de Google, adaptado para operar a nivel de bytes. Desarrollado por willwade, este modelo de 17,9 millones de parámetros (frente a los 300M del ByT5-small original) está diseñado para generar transcripciones fonéticas en Alfabeto Fonético Internacional (IPA) a partir de texto ortográfico, cubriendo 136 variedades lingüísticas con distinciones dialectales (por ejemplo, inglés de EE. UU. frente a Reino Unido, español de España frente a Latinoamérica, o múltiples divisiones del chino sinítico). Su propósito principal es servir como capa neural de respaldo (OOV tier) en sistemas de síntesis de voz, complementando lexicones basados en FST y WFST.

El modelo se entrenó sobre un corpus de 3,02 millones de pares grafema-fonema procedentes de WikiPron (licencia CC BY-SA) y gruut (MIT), con muestreo balanceado por idioma para evitar el sesgo hacia lenguas dominantes. A pesar de su tamaño reducido, los resultados publicados indican que iguala al modelo pequeño (300M) dentro del margen de ruido en la tarea G2P, con una tasa de error por token del 13,9%. Esto lo convierte en una opción atractiva para despliegues ligeros en entornos de producción, especialmente en sistemas de texto a voz (TTS) donde la latencia y el consumo de recursos son críticos.

La relevancia actual de este modelo radica en su enfoque byte-level, que elimina la necesidad de tokenización previa y simplifica el pipeline de preprocesado, y en su licencia CC BY-SA 4.0, que permite uso comercial siempre que las obras derivadas se compartan bajo la misma licencia. Está disponible en formato Hugging Face (safetensors) y ONNX, lo que facilita su integración en múltiples runtimes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (seq2seq, transformer encoder-decoder, operación a nivel de bytes) |
| Parametros totales | 17.934.080 (17,9M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la implementación; ByT5 procesa secuencias de bytes, típicamente hasta 512 o 1024 en configuraciones estándar) |
| Tipos de cuantizacion | No disponible (se proporcionan pesos en fp32/fp16; no se documentan cuantizaciones específicas) |
| Idiomas soportados | 136 variedades lingüísticas (multilingüe, con sufijos de variedad como eng-US, eng-UK, por-BR, por-PT, spa-ES, spa-LatAm, etc.) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (raíz) y ONNX (carpeta `onnx/`) |

## Arquitectura y entrenamiento

El modelo se basa en ByT5-small, una variante de T5 que opera directamente sobre bytes UTF-8 en lugar de subpalabras. Esto elimina la necesidad de un tokenizador y permite manejar cualquier idioma o símbolo sin vocabulario fijo. La arquitectura es un transformer encoder-decoder estándar, con atención completa y sin mecanismos de atención lineal ni decodificación especulativa. El modelo fue inicializado desde los pesos de `google/byt5-small` (licencia Apache-2.0) y posteriormente ajustado (fine-tuning) para la tarea G2P.

El entrenamiento se realizó sobre un corpus de 3,02 millones de pares grafema-fonema, combinando datos de WikiPron (CUNY-CL, licencia CC BY-SA) y gruut (rhasspy, licencia MIT). Se preservaron las divisiones dialectales originales y se aplicó un muestreo balanceado por idioma para garantizar una representación equitativa de las 136 variedades. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el ajuste es supervisado directamente sobre los pares de entrenamiento. El formato de entrada es `<lang>: word` (por ejemplo, `<eng-US>: hello`), y la salida es una secuencia de fonemas IPA separados por espacios (por ejemplo, `h ɛ l ˈoʊ`), siguiendo las convenciones de gruut/WikiPron, que son directamente consumibles por voces de la familia Piper.

## Capacidades

- Conversión grafema a fonema (G2P) multilingüe: genera transcripciones IPA a partir de texto ortográfico en 136 variedades lingüísticas, incluyendo distinciones dialectales finas.
- Soporte de entrada a nivel de bytes: al operar sobre UTF-8, puede procesar cualquier escritura sin necesidad de tokenizador, incluyendo caracteres poco comunes o inventados.
- Salida compatible con sistemas TTS: las transcripciones siguen las convenciones de gruut/WikiPron, listas para ser usadas por voces de Piper y otros sintetizadores.
- Manejo de palabras fuera de vocabulario (OOV): diseñado específicamente como capa neural de respaldo para lexicones basados en FST y WFST, cubriendo palabras no presentes en diccionarios.
- Multilingüismo con variedades: soporta sufijos de variedad (por ejemplo, `eng-US` vs `eng-UK`, `spa-ES` vs `spa-LatAm`), permitiendo pronunciaciones regionales específicas.
- Inferencia ligera: con solo 17,9M de parámetros, es adecuado para ejecución en CPU o GPU de baja gama, con latencia reducida.
- Exportación a ONNX: se proporcionan pesos ONNX validados, lo que permite despliegue en runtimes optimizados como ONNX Runtime o TensorRT.

## Casos de uso

- Síntesis de voz (TTS) en producción: el modelo puede integrarse como capa de pronunciación para palabras desconocidas en sistemas de texto a voz, garantizando que cualquier término (nombres propios, tecnicismos, neologismos) se pronuncie correctamente sin necesidad de lexicones manuales. Su salida en formato gruut/IPA se alimenta directamente a voces Piper.
- Asistentes de voz multilingües: en aplicaciones que requieren soporte para múltiples idiomas y dialectos, el modelo permite generar pronunciaciones correctas para cada variedad, mejorando la naturalidad y precisión en entornos como España, Latinoamérica, EE. UU. o Reino Unido.
- Accesibilidad y lectura en voz alta: herramientas de accesibilidad (lectores de pantalla, audiolibros) pueden usar el modelo para pronunciar correctamente palabras en cualquier idioma, incluyendo términos técnicos o extranjeros, sin depender de diccionarios precompilados.
- Normalización de texto para ASR: en pipelines de reconocimiento de voz, el modelo puede ayudar a generar variantes fonéticas para entrenar o adaptar modelos acústicos, especialmente en idiomas con ortografía irregular.
- Sistemas de subtitulado y doblaje: para generar guiones fonéticos que asistan a actores de doblaje o para sincronizar labios en animación, el modelo proporciona transcripciones IPA precisas en múltiples variedades.
- Investigación lingüística y lexicografía: el modelo puede usarse para generar pronunciaciones automáticas de palabras en corpus lingüísticos, facilitando estudios fonológicos comparativos entre dialectos o la creación de diccionarios fonéticos.
- Chatbots y asistentes con pronunciación explícita: en aplicaciones donde el usuario necesita escuchar la pronunciación de una palabra (por ejemplo, aplicaciones de aprendizaje de idiomas), el modelo puede generar la transcripción IPA y sintetizarla en tiempo real.

## Benchmarks y rendimiento

Según la model card, se evaluó el modelo en una muestra de test estratificada de 4.000 ejemplos. Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| Exactitud micro (exact match) | 0,729 |
| Exactitud macro (exact match) | 0,654 |
| Tasa de error por token (TER) | 0,139 |

Además, se indica que el modelo tiny (17M) iguala al modelo small (300M) dentro del ruido estadístico en esta tarea, a 1/18 del tamaño. No se proporcionan comparaciones con otros modelos en la misma tabla, pero el repositorio hermano `willwade/byt5-g2p-multilingual` (no tiny) reporta una exactitud micro de 0,764 en 122 lenguas, con resultados por idioma como español 1,0, portugués 0,99 y alemán 0,98. No se dispone de datos de benchmarks adicionales (MMLU, HumanEval, etc.) porque el modelo está especializado en G2P y no en tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada: con 17,9M de parámetros, el modelo ocupa aproximadamente 70 MB en fp32 (o ~35 MB en fp16). La inferencia puede ejecutarse en CPU con menos de 1 GB de RAM, y en GPU con cualquier tarjeta que tenga al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1050, RTX 2060, RTX 4090, o incluso GPUs integradas. Para despliegues masivos, una A10 o T4 es más que suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual, incluso en sistemas sin GPU dedicada (solo CPU).
- Opciones de despliegue: se puede servir mediante Hugging Face Transformers (Python), ONNX Runtime (gracias a los pesos ONNX), o mediante servidores de inferencia compatibles con TGI (text-generation-inference) según los tags del repositorio. También es posible usar llama.cpp si se convierte a GGUF, aunque no se proporciona ese formato.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño reducido, se espera una latencia de milisegundos por palabra en CPU y de sub-milisegundos en GPU. El throughput dependerá del runtime y del batching.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Exactitud micro | Licencia | Formato |
|---|---|---|---|---|---|
| willwade/byt5-g2p-multilingual-tiny | 17,9M | 136 variedades | 0,729 | CC BY-SA 4.0 | safetensors, ONNX |
| willwade/byt5-g2p-multilingual (hermano) | 300M (aprox.) | 122 lenguas | 0,764 | CC BY-SA 4.0 | safetensors, ONNX |
| CharsiuG2P (lingjzhu) | ~300M (ByT5-base) | 100 lenguas | No disponible | Apache-2.0 (modelo) | PyTorch |
| google/byt5-small (base) | 300M | Multilingüe (no G2P) | No aplica | Apache-2.0 | safetensors |

El modelo tiny ofrece una relación tamaño-rendimiento muy favorable: con 1/18 de los parámetros del modelo hermano, alcanza una exactitud solo 3,5 puntos porcentuales inferior. CharsiuG2P es una alternativa académica con cobertura de 100 lenguas, pero no está optimizado para variedades dialectales finas ni para integración con Piper. El modelo base ByT5-small no está especializado en G2P y requiere ajuste adicional.

## Limitaciones y advertencias

- Licencia CC BY-SA 4.0: cualquier obra derivada (por ejemplo, un sistema TTS que integre este modelo) debe distribuirse bajo la misma licencia, lo que puede ser restrictivo para productos comerciales propietarios.
- Cobertura limitada a 136 variedades: aunque amplia, no cubre todos los idiomas del mundo. Lenguas sin representación en WikiPron o gruut no serán procesadas correctamente.
- Riesgo de alucinación fonética: en palabras muy raras o inventadas, el modelo puede generar transcripciones incorrectas o inconsistentes, especialmente en idiomas con ortografía irregular.
- Dependencia de la calidad de los datos de entrenamiento: los errores en WikiPron o gruut pueden propagarse al modelo. No se ha documentado un proceso de limpieza exhaustivo.
- Sin soporte para contexto largo: al ser un modelo seq2seq de tamaño pequeño, la longitud máxima de entrada está limitada (típicamente 512 bytes), lo que impide procesar palabras muy largas o frases completas de una sola vez.
- Sin capacidades de razonamiento o generación de texto: el modelo está especializado exclusivamente en G2P; no puede usarse para otras tareas de NLP.
- Sin cuantizaciones oficiales: no se proporcionan versiones cuantizadas (GGUF, int8, int4), por lo que el despliegue en entornos con restricciones de memoria requiere conversión manual.
- Fecha de creación futura (2026-08-29): el modelo fue publicado con fecha posterior a la actual, lo que sugiere que puede ser un artefacto experimental o de un proyecto en desarrollo; se recomienda verificar su estabilidad antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/willwade/byt5-g2p-multilingual-tiny
- Repositorio hermano (no tiny): https://huggingface.co/willwade/byt5-g2p-multilingual
- Código de entrenamiento: https://github.com/AACTools/voicegarden-lexicons/tree/main/scripts/train_byt5
- Script de referencia ONNX: https://github.com/AACTools/voicegarden-lexicons/blob/main/scripts/train_byt5/onnx_reference.py
- Proyecto floravox (integración): https://github.com/AACTools/floravox
- ByT5 (Google Research): https://github.com/google-research/byt5
- CharsiuG2P (alternativa): https://github.com/lingjzhu/CharsiuG2P
- Paper de CharsiuG2P (Interspeech 2022): https://arxiv.org/abs/2204.03067
