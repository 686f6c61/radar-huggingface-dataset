# TalkMate/rumble-2-flash-gguf

## Resumen

Rumble 2 Flash es un modelo de reconocimiento automático del habla (ASR) desarrollado por Reson8. La variante aquí descrita, `TalkMate/rumble-2-flash-gguf`, es una conversión a formato GGUF realizada por TalkMate para su uso con el motor de inferencia transcribe.cpp. El modelo base, `Reson8/Rumble-2-Flash`, emplea una arquitectura derivada de Qwen3-ASR, según se desprende de la nomenclatura de tensores mencionada en la model card. Con 508.657.680 parámetros (aproximadamente 509 millones), se sitúa en la gama de modelos ASR ligeros, adecuados para despliegue en entornos con recursos limitados.

La relevancia de esta ficha radica en dos aspectos. Primero, la cuantización Q8_0 reduce el peso del modelo a unos 0,6 GB, lo que permite ejecutarlo en hardware modesto, incluyendo CPU. Segundo, la conversión incluye un parche específico de TalkMate que corrige una omisión del conversor original de transcribe.cpp: el modelo espera una secuencia de control `<digits><nofiller><verbatim>` al inicio del mensaje de sistema, y sin ella el rendimiento en inglés con acento se degrada (13,1 % WER con la secuencia frente a 14,3 % sin ella, según la model card). El modelo soporta 31 idiomas y se distribuye bajo licencia Apache 2.0.

La información pública disponible sobre Rumble 2 Flash es muy limitada: no se detallan la composición del dataset de entrenamiento, el número de tokens utilizados ni los resultados de benchmarks estándar. Esta ficha refleja esa escasez de datos de forma explícita, marcando como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3-ASR (según nomenclatura de tensores en la model card) |
| Parametros totales | 508.657.680 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (pesos 2-D en Q8_0, resto en F32) |
| Idiomas soportados | 31: en, zh, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0,6 GB |
| Pipeline | automatic-speech-recognition |
| Modelo base | Reson8/Rumble-2-Flash |
| Motor de inferencia | transcribe.cpp (handy-computer) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. La model card indica que los tensores fueron renombrados desde el layout de transformers Qwen3-ASR al layout original que lee el conversor de transcribe.cpp, lo que sugiere que Rumble 2 Flash comparte la estructura de un modelo Qwen3-ASR. Se trata, por tanto, de un transformer orientado a ASR, no de un modelo MoE ni de una arquitectura híbrida SSM. Con 509 millones de parámetros, es un modelo compacto diseñado para transcripción eficiente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona un detalle operativo relevante: el modelo espera la secuencia `<digits><nofiller><verbatim>` al inicio del mensaje de sistema, y el conversor original de transcribe.cpp no la incluye. El parche de TalkMate la envía, lo que mejora el WER en inglés con acento del 14,3 % al 13,1 % sobre el conjunto EdAcc (300 clips). Este dato sugiere que el modelo fue entrenado con instrucciones de control explícitas para el formato de salida (dígitos, sin muletillas, transcripción literal).

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 31 idiomas, incluyendo inglés, chino mandarín, cantonés, árabe, alemán, francés, español, portugués, indonesio, italiano, coreano, ruso, tailandés, vietnamita, japonés, turco, hindi, malayo, neerlandés, sueco, danés, finés, polaco, checo, filipino, persa, griego, rumano, húngaro y macedonio.
- Control del formato de salida mediante la secuencia de sistema `<digits><nofiller><verbatim>`, que instruye al modelo a producir dígitos, evitar muletillas y transcribir de forma literal.
- Conversión a GGUF optimizada para transcribe.cpp, lo que permite inferencia en CPU y GPU sin necesidad de frameworks de deep learning pesados.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y llamadas: el modelo puede convertir audio de reuniones en texto en cualquiera de los 31 idiomas soportados. Su tamaño compacto (0,6 GB en Q8_0) permite ejecutarlo en el mismo servidor que gestiona la llamada, sin depender de APIs externas.
- Subtitulado automático de vídeo: integrado en un pipeline de procesamiento de vídeo, el modelo genera subtítulos en múltiples idiomas. La secuencia `<verbatim>` ayuda a mantener fidelidad literal en la transcripción, útil para subtítulos que deben reflejar el habla exacta.
- Atención al cliente con transcripción en tiempo real: en un centro de contacto, el modelo transcribe las llamadas para su análisis posterior o para alimentar sistemas de búsqueda y cumplimiento normativo, con la ventaja de que el despliegue local evita enviar audio de clientes a servicios en la nube.
- Dictado y accesibilidad: aplicaciones de dictado por voz o de accesibilidad para personas con discapacidad auditiva pueden usar el modelo en dispositivos de gama media gracias a su reducido tamaño y a la inferencia vía transcribe.cpp en CPU.
- Investigación lingüística y análisis de corpus orales: el soporte de 31 idiomas, incluyendo lenguas menos frecuentes como el cantonés, el filipino o el macedonio, permite transcribir corpus multilingües para estudios fonéticos o sociolingüísticos.
- Procesamiento por lotes de archivos de audio: en un entorno de servidor, el modelo puede transcribir grandes volúmenes de grabaciones (podcasts, entrevistas, archivos históricos) de forma automatizada, con la licencia Apache 2.0 permitiendo uso comercial sin restricciones de atribución adicionales.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es el WER sobre el conjunto EdAcc (300 clips de inglés con acento):

| Conjunto | Condición | WER |
|---|---|---|
| EdAcc (300 clips, inglés con acento) | Con secuencia `<digits><nofiller><verbatim>` | 13,1 % |
| EdAcc (300 clips, inglés con acento) | Sin secuencia de control | 14,3 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice, etc.) en la información disponible. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 509 millones de parámetros en Q8_0 (aproximadamente 0,6 GB de pesos), la VRAM necesaria es inferior a 1 GB, más el espacio para el estado de activaciones y el búfer de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarían sin problema, aunque el modelo está claramente sobredimensionado para estas GPU y su cuello de botella será el procesamiento de audio, no la GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650, RTX 3050, etc.) e incluso en CPU.
- Opciones de despliegue: transcribe.cpp (motor para el que está convertido), y potencialmente otros motores compatibles con GGUF si soportan la arquitectura Qwen3-ASR; no se dispone de confirmación de soporte en llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparativas con otros modelos ASR. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Rumble 2 Flash (GGUF) | 509 M | No disponible | 31 | Apache 2.0 | GGUF |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La información pública sobre el modelo base es muy escasa: no se documentan sesgos conocidos, composición del dataset ni metodología de entrenamiento, lo que dificulta evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones plausibles pero incorrectas en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes. No se dispone de datos sobre su comportamiento en estas condiciones.
- La secuencia de control `<digits><nofiller><verbatim>` es necesaria para un rendimiento óptimo; omitirla degrada el WER (14,3 % frente a 13,1 % en EdAcc). Los usuarios de transcribe.cpp sin el parche de TalkMate deben añadirla manualmente.
- La longitud de contexto no está documentada, lo que limita la planificación de transcripciones de audio largo sin segmentación previa.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks estándar y de documentación sobre el entrenamiento implica que cualquier despliegue en producción debería validarse con datos propios antes de confiar en el modelo.
- El modelo está convertido específicamente para transcribe.cpp; su compatibilidad con otros motores GGUF no está confirmada.

## Enlaces

- Hugging Face: https://huggingface.co/TalkMate/rumble-2-flash-gguf
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- transcribe.cpp (handy-computer): https://github.com/handy-computer/transcribe.cpp
- TalkMate (sitio de la app): https://www.talkmateapp.in/
- TalkMate (traducción de voz): https://talkmate.online/
- TalkMate (app de chat con IA): https://talkmate.amedya.com/
- Talkmate (aprendizaje de idiomas): https://www.talkmate.com/
