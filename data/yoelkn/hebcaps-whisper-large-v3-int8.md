# yoelkn/hebcaps-whisper-large-v3-int8

## Resumen

El modelo `hebcaps-whisper-large-v3-int8`, publicado por el usuario yoelkn en Hugging Face, es una versión cuantizada a INT8 del conocido modelo de reconocimiento automático del habla (ASR) Whisper large-v3 de OpenAI. El nombre sugiere una especialización o adaptación orientada a hebreo (por el prefijo "hebcaps"), aunque la model card publicada no aporta ninguna descripción, documentación técnica ni detalles sobre el proceso de cuantización o el dataset de ajuste empleado. El repositorio tiene un tamaño de 1,6 GB, coherente con una conversión a 8 bits del modelo original de aproximadamente 1.550 millones de parámetros.

La relevancia de este artefacto radica en que Whisper large-v3 es uno de los sistemas ASR multilingües de referencia, y las variantes cuantizadas permiten desplegarlo en hardware con menos VRAM manteniendo una precisión cercana al modelo en fp16. Sin embargo, la ausencia total de documentación, de métricas de evaluación y de información sobre el proceso de conversión hace que su uso en producción requiera una validación empírica previa por parte del equipo que lo adopte.

Se trata, por tanto, de un modelo con muy poca tracción (26 descargas, 0 likes en el momento de redactar esta ficha) y cuya calidad no puede verificarse a partir de la información publicada. Cualquier evaluación debe realizarse contra el checkpoint original de Whisper large-v3 como línea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), cuantizado a INT8 |
| Parametros totales | Aproximadamente 1.550 millones (heredados de Whisper large-v3; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (característica de Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | INT8 (según el nombre del repositorio; método de cuantización no especificado) |
| Idiomas soportados | No disponible (la model card no lo declara; el nombre sugiere hebreo, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el tamaño de 1,6 GB sugiere pesos cuantizados, pero no se indica el formato exacto) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI sobre 680.000 horas de audio débilmente supervisado, con 1.550 millones de parámetros y una ventana de entrada de 30 segundos de audio muestreado a 16 kHz convertido en espectrograma mel de 128 canales. Whisper large-v3 incorpora 128 mel bins (frente a 80 en versiones anteriores) y amplía el conjunto de idiomas a 99.

La model card de este repositorio no documenta ningún proceso de entrenamiento adicional, ajuste fino, destilación ni evaluación. Tampoco se especifica la herramienta de cuantización empleada (podría ser bitsandbytes, GPTQ, ONNX Runtime, CTranslate2 u otra), lo que impide conocer si la cuantización es de solo pesos o también de activaciones, ni qué calibración se usó. El prefijo "hebcaps" sugiere una posible adaptación a hebreo, pero no hay evidencia publicada que lo confirme ni que describa el corpus utilizado.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), heredado de Whisper large-v3.
- Traducción de voz a texto hacia inglés, capacidad nativa de Whisper.
- Detección de idioma y transcripción multilingüe (99 idiomas en el modelo base; no verificado en esta variante).
- Segmentación temporal con marcas de tiempo a nivel de segmento.
- Procesamiento de audio en ventanas de 30 segundos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- No se documentan capacidades de visión ni de audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio de hasta 30 segundos por segmento en texto, encadenando segmentos para reuniones largas; la cuantización INT8 reduce la VRAM necesaria frente al checkpoint fp16.
- Subtitulado automático de vídeo: genera transcripciones con marcas de tiempo que pueden postprocesarse a formato SRT o VTT, útil en pipelines de publicación de contenido.
- Indexación y búsqueda de archivos de audio: transcribir un archivo de audio permite alimentar un índice de texto (por ejemplo, Elasticsearch) para búsqueda semántica sobre grabaciones.
- Atención al cliente con análisis de llamadas: transcripción de grabaciones de call center para extraer métricas de calidad y temas recurrentes, aprovechando el menor coste de inferencia de la variante INT8.
- Accesibilidad: generación de subtítulos en directo o diferidos para contenido audiovisual, con la salvedad de que la latencia y la calidad deben validarse en el hardware objetivo.
- Preprocesado en pipelines de datos: conversión masiva de corpus de audio a texto para entrenamiento de otros modelos o para anotación asistida, donde el ahorro de memoria de INT8 permite mayor paralelismo por GPU.
- Transcripción en hebreo (si la especialización sugerida por el nombre se confirma): uso en aplicaciones de dictado o análisis de audio en hebreo, previa validación de la calidad frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER (word error rate), comparaciones con el modelo original ni evaluaciones por idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,6 GB, lo que sugiere que los pesos INT8 caben en aproximadamente 2 GB de VRAM; el consumo real depende del runtime y del tamaño de batch.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para batch pequeño; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son opciones válidas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más, aunque no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: no se especifica el formato de pesos, por lo que no puede confirmarse la compatibilidad con vLLM, llama.cpp, Ollama, TGI o faster-whisper/CTranslate2. Es necesario inspeccionar los archivos del repositorio para determinar el runtime adecuado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hebcaps-whisper-large-v3-int8 | ~1.550 M (INT8) | 30 s por segmento | Apache 2.0 | Hugging Face (26 descargas) | Sin documentación ni benchmarks |
| openai/whisper-large-v3 | ~1.550 M (fp16) | 30 s por segmento | Apache 2.0 | Hugging Face (oficial) | Modelo de referencia, ampliamente evaluado |
| faster-whisper (CTranslate2) | ~1.550 M (INT8/FP16) | 30 s por segmento | Apache 2.0 | Repositorio de Systran | Implementación optimizada con cuantización documentada |
| whisper-large-v3-turbo | ~809 M | 30 s por segmento | Apache 2.0 | Hugging Face (oficial) | Variante destilada, menor latencia |

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifica el método de cuantización, el dataset de calibración, el formato de pesos ni las métricas de calidad; esto impide garantizar que la precisión se mantenga respecto al modelo original.
- Riesgo de degradación por cuantización: la conversión a INT8 puede aumentar el WER, especialmente en idiomas de bajos recursos o audio con ruido; debe medirse contra el checkpoint fp16 antes de usarlo en producción.
- Especialización no confirmada: el prefijo "hebcaps" sugiere hebreo, pero la model card no lo declara; no debe asumirse un rendimiento superior en hebreo sin evaluación.
- Sesgos heredados: Whisper large-v3 presenta sesgos conocidos en la transcripción de determinados dialectos y acentos, y puede alucinar texto en pasajes de silencio o ruido.
- Riesgo de alucinación: los modelos Whisper pueden generar frases plausibles que no corresponden al audio, especialmente en segmentos ambiguos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- Tracción mínima: 26 descargas y 0 likes indican que el artefacto no ha sido validado por la comunidad; conviene tratar el repositorio con cautela y verificar la integridad de los archivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yoelkn/hebcaps-whisper-large-v3-int8
- Modelo base Whisper large-v3 (OpenAI): https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
