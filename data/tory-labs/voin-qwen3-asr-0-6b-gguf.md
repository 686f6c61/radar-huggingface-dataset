# tory-labs/voin-qwen3-asr-0.6b-gguf

## Resumen

Este repositorio no contiene un modelo nuevo, sino un espejo (mirror) del fichero `Qwen3-ASR-0.6B-Q8_0.gguf`, la versión cuantizada a 8 bits del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B desarrollado por Alibaba Qwen. La publicación corre a cargo de tory-labs y existe únicamente para que la aplicación voin descargue el modelo desde una ubicación estable; el autor declara explícitamente que el fichero es una copia sin modificar.

El interés práctico está en el formato: un único fichero GGUF de 850.423.456 bytes (aproximadamente 0,85 GB) con 782.452.240 parámetros reales según los safetensors del modelo base, lo que permite ejecutar un sistema ASR en local, sobre CPU o GPU de gama baja, sin depender de servicios en la nube. La licencia Apache 2.0 del modelo original facilita su integración en productos comerciales.

La limitación principal es documental: al ser una redistribución, la model card no aporta información sobre arquitectura interna, datos de entrenamiento, idiomas soportados ni resultados de benchmarks. Cualquier evaluación seria debe remitirse al repositorio original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento automático del habla de la familia Qwen3-ASR; el repositorio no documenta encoder/decoder) |
| Parametros totales | 782.452.240 (dato real de los safetensors del modelo base) |
| Parametros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único fichero publicado); no se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (heredada del modelo original) |
| Formato de pesos | GGUF (fichero `Qwen3-ASR-0.6B-Q8_0.gguf`, 850.423.456 bytes, SHA-256 `f081b2d5e23bd669d92cc331d722a8a0681943b8e6f34b48996fd5c319b5acd8`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card del espejo se limita a identificar el modelo de origen (Qwen/Qwen3-ASR-0.6B, de Alibaba Qwen), la conversión GGUF utilizada (handy-computer/Qwen3-ASR-0.6B-gguf, commit `28c66fba077f`) y el fichero exacto redistribuido. No se indica si emplea un encoder de audio seguido de un decoder transformer, ni la composición del dataset, el número de tokens de entrenamiento o si hubo etapas de ajuste fino supervisado o preferencias.

La única innovación técnica verificable en este repositorio es el propio proceso de cuantización a Q8_0 sobre el formato GGUF, que reduce el peso a unos 0,85 GB y habilita inferencia en CPU con herramientas compatibles con llama.cpp. Cualquier detalle adicional sobre el entrenamiento debe consultarse en la documentación del modelo original, no incluida aquí.

## Capacidades

- Reconocimiento automático del habla: conversión de audio a texto, que es la función declarada del modelo base Qwen3-ASR-0.6B.
- Etiquetado como `conversational` en los metadatos de HuggingFace, lo que sugiere uso previsto en interacción por voz, aunque el repositorio no lo detalla.
- Ejecución local mediante el formato GGUF, sin necesidad de conexión a servicios externos.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas; el modelo es de ASR, no un LLM conversacional de propósito general.
- Modo thinking, visión o audio de entrada adicional: no disponible.

## Casos de uso

- Transcripción local de notas de voz y reuniones: un fichero GGUF de 0,85 GB puede cargarse con llama.cpp o bindings equivalentes en un portátil sin GPU dedicada, procesando el audio sin enviar datos a terceros.
- Dictado en aplicaciones de escritorio: es precisamente el escenario para el que existe este espejo, ya que la app voin descarga este fichero como motor de reconocimiento.
- Subtitulado de vídeo en pipelines automatizados: al ser Apache 2.0, puede integrarse en herramientas de generación de subtítulos sin restricciones de uso comercial.
- Análisis de llamadas en atención al cliente: transcripción por lotes de grabaciones en un servidor con CPU, con el audio permaneciendo en la infraestructura propia.
- Prototipado rápido de interfaces de voz: al ser un modelo pequeño, permite iterar sobre el pipeline ASR (VAD, segmentación, postproceso) sin coste por minuto de API.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos con hardware modesto.
- Verificación de integridad en despliegues: el SHA-256 publicado permite validar que el binario descargado por una aplicación cliente es exactamente el esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del espejo ni los metadatos del repositorio incluyen cifras de WER, comparativas con Whisper u otros sistemas ASR, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,9-1,3 GB con la cuantización Q8_0 publicada (0,85 GB de pesos más overhead de contexto y buffers de audio); una conversión hipotética a FP16 rondaría los 1,6 GB, pero no está disponible en este repositorio.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente en la práctica; una RTX 3060, RTX 4060 o superiores ofrecen margen de sobra. Para despliegues en servidor, A100 o H100 están sobredimensionadas para este tamaño y solo se justifican por agregación de muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta dedicada de los últimos años, e incluso en iGPU con memoria compartida.
- Despliegue: llama.cpp y sus envoltorios (Ollama, servidores compatibles con la API de llama.cpp) son la vía natural para GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo, por lo que requerirían convertir los pesos a safetensors.
- Latencia y throughput: no disponibles. Al no publicarse métricas, conviene medirlas en el hardware objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de audio | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (este espejo, Q8_0) | 782 M | no disponible | Apache 2.0 | GGUF | no disponible |
| OpenAI Whisper small | 244 M | ventanas de 30 s | MIT | safetensors, GGML/GGUF via terceros | multilingue (documentado por OpenAI) |
| OpenAI Whisper medium | 769 M | ventanas de 30 s | MIT | safetensors, GGML/GGUF via terceros | multilingue (documentado por OpenAI) |
| OpenAI Whisper large-v3 | 1550 M | ventanas de 30 s | MIT | safetensors, GGML/GGUF via terceros | multilingue (documentado por OpenAI) |

La comparación se limita a parámetros, licencia y disponibilidad, porque no existen resultados públicos de benchmarks de Qwen3-ASR-0.6B en la información consultada que permitan contrastar calidad de transcripción (WER) frente a Whisper. Whisper medium es el competidor más directo por tamaño; Whisper small es la alternativa si el presupuesto de memoria es muy ajustado.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no lo mantiene Alibaba Qwen y no hay garantía de que se actualice si el modelo original cambia.
- La model card no documenta arquitectura, datos de entrenamiento ni idiomas, lo que impide evaluar sesgos o cobertura lingüística sin pruebas propias.
- Riesgo de alucinación típico de los sistemas ASR: en segmentos con silencio, ruido de fondo o solapamiento de voces, el modelo puede generar texto que no se corresponde con el audio.
- Solo se publica la cuantización Q8_0; no hay variantes Q4 o Q5 que reduzcan aún más el consumo, ni pesos en safetensors dentro de este repositorio.
- No se documentan capacidades de puntuación, diarización de hablantes ni marcas de tiempo, funciones habituales en pipelines de subtitulado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y no concede garantías; los derechos del modelo pertenecen a sus autores originales.
- Los resultados de búsqueda web asociados a este repositorio no contienen información técnica relevante (devuelven resultados sobre la marca Tory Burch y el Partido Conservador británico), por lo que no se han podido contrastar datos adicionales.
- Uso en producción: conviene fijar la versión por SHA-256 y validar el WER en el dominio concreto (acento, ruido, jerga) antes de desplegar.

## Enlaces

- Repositorio del espejo en HuggingFace: https://huggingface.co/tory-labs/voin-qwen3-asr-0.6b-gguf
- Modelo original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Conversión GGUF de referencia (commit `28c66fba077f`): https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf/tree/28c66fba077f1359a42b52c55b618a24cdb6e0e7
- Aplicación voin: https://github.com/su-record/voin
- Licencia del modelo: https://huggingface.co/tory-labs/voin-qwen3-asr-0.6b-gguf/blob/main/LICENSE
