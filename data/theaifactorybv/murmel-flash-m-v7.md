# theaifactorybv/murmel-flash-m-v7

## Resumen

Murmel Flash M v7 es un modelo de reconocimiento automático del habla (ASR) desarrollado por The AI Factory BV, publicado bajo el identificador `theaifactorybv/murmel-flash-m-v7`. Está construido sobre una arquitectura FastConformer con cabecera CTC y está especializado en la transcripción de audio en neerlandés (nl) e inglés (en), con soporte para puntuación automática y marcas de tiempo. El modelo cuenta con aproximadamente 128 millones de parámetros, lo que lo sitúa en el segmento de tamaño medio dentro de los sistemas ASR modernos, y se distribuye en formato safetensors con un repositorio de 1,6 GB.

La relevancia de este modelo radica en su enfoque específico hacia el neerlandés, un idioma con menor representación en los grandes sistemas ASR multilingües, combinado con una licencia comercial propia (`murmel-commercial`) y un acceso restringido que requiere aceptar condiciones en Hugging Face. El modelo emplea una librería propia (`murmel-flash`) y no sigue los pipelines estándar de Transformers, lo que condiciona su integración en producción.

La información pública disponible es limitada: no se han publicado resultados de benchmarks, detalles del dataset de entrenamiento ni especificaciones completas de contexto o cuantización en la ficha de Hugging Face. Esta ficha recoge exclusivamente los datos verificables y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabecera CTC (según tags del modelo) |
| Parametros totales | 127.936.002 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Neerlandés (nl), inglés (en) |
| Licencia | murmel-commercial (licencia propia, acceso restringido) |
| Formato de pesos | safetensors |
| Librería | murmel-flash |
| Tarea | automatic-speech-recognition (ASR) |
| Tamaño del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer, una variante eficiente del Conformer que reduce el coste computacional mediante subsampling convolucional y atención por bloques, y que se ha consolidado como referencia en ASR de NVIDIA NeMo. La cabecera es CTC (Connectionist Temporal Classification), lo que permite decodificación sin alineamiento explícito y facilita la generación de marcas de tiempo a nivel de carácter o token. Los tags indican soporte de puntuación automática y timestamps como capacidades integradas del modelo.

No se ha publicado información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de técnicas de aumento de datos, ni si se aplicaron procesos de ajuste fino supervisado o destilación. Tampoco se detalla si el modelo incorpora decodificación especulativa, atención lineal u otras optimizaciones de inferencia. La librería `murmel-flash` sugiere un stack propietario de inferencia, distinto de los ecosistemas estándar como `transformers` o `NeMo`.

## Capacidades

- Reconocimiento automático del habla en neerlandés e inglés.
- Transcripción con puntuación automática.
- Generación de marcas de tiempo (timestamps) alineadas con el audio.
- Decodificación CTC, adecuada para streaming y procesamiento por lotes.
- Manejo de audio de entrada en formato estándar (la ficha no detalla el sample rate ni el preprocesado exacto).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.
- No se documenta modo "thinking" ni salidas estructuradas.

## Casos de uso

- Transcripción de reuniones corporativas en neerlandés: el modelo genera texto con puntuación y timestamps, lo que permite indexar actas y buscar fragmentos por minuto dentro de una grabación.
- Subtitulado automático de vídeo para medios neerlandeses: los timestamps facilitan la sincronización de subtítulos con el audio sin necesidad de un alineador externo.
- Atención al cliente con análisis de llamadas: transcripción por lotes de grabaciones para extraer métricas, detección de temas y control de calidad en centros de contacto bilingües nl/en.
- Documentación clínica dictada: transcripción de notas de voz en entornos sanitarios neerlandeses, con la ventaja de un modelo de 128 M de parámetros que puede desplegarse en infraestructura modesta.
- Sistemas de búsqueda y recuperación sobre archivos de audio: indexación de podcasts y archivos sonoros mediante transcripciones con marcas temporales.
- Asistentes de voz embebidos: al ser un modelo compacto, es candidato para despliegue en servidores con GPU de gama media o incluso CPU para cargas moderadas, en aplicaciones de dictado y comandos en neerlandés.
- Localización de contenido: transcripción en inglés para pipelines de traducción y publicación de contenido audiovisual en mercados internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 127,9 M de parámetros en precisión FP32 el modelo ocupa aproximadamente 0,5 GB en memoria, y en FP16 alrededor de 0,25 GB, a lo que hay que sumar el coste del decodificador CTC y del preprocesado de audio.
- GPU recomendadas: al no publicarse requisitos oficiales, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para el modelo en precisión completa; tarjetas como RTX 3060, RTX 4090, A10, L4, A100 o H100 son opciones razonables.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con 4 GB o más de VRAM, dado el reducido tamaño del modelo.
- Opciones de despliegue: la librería propietaria `murmel-flash` es la vía indicada por el autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con el pipeline `automatic-speech-recognition` de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Arquitectura | Licencia | Acceso |
|---|---|---|---|---|---|
| murmel-flash-m-v7 | 127,9 M | nl, en | FastConformer + CTC | murmel-commercial | Restringido (gated) |
| Whisper small | ~244 M | Multilingüe (99 idiomas) | Transformer encoder-decoder | MIT | Abierto |
| Whisper medium | ~769 M | Multilingüe (99 idiomas) | Transformer encoder-decoder | MIT | Abierto |
| NVIDIA Parakeet CTC | ~120 M (aprox.) | Principalmente inglés | FastConformer + CTC | CC-BY-4.0 (según variante) | Abierto |

La comparación con Whisper small y medium es la más directa por tamaño y propósito general de ASR, aunque Whisper cubre muchos más idiomas y emplea una arquitectura encoder-decoder con decodificación autorregresiva. Frente a Parakeet CTC de NVIDIA, la arquitectura es muy similar, pero Murmel Flash se diferencia por su cobertura específica del neerlandés y por una licencia comercial propia con acceso restringido. No se dispone de métricas comparativas de WER publicadas para Murmel Flash M v7.

## Limitaciones y advertencias

- Solo cubre neerlandés e inglés; no se documenta soporte de otros idiomas ni code-switching.
- No se han publicado métricas de WER, sesgos ni evaluaciones de robustez, lo que impide valorar su calidad frente a alternativas.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes, habitual en modelos CTC de este tamaño; no hay datos públicos que lo cuantifiquen.
- Licencia `murmel-commercial` con acceso restringido: es imprescindible revisar los términos antes de cualquier uso comercial, y el modelo no puede descargarse sin aceptar condiciones en Hugging Face.
- Dependencia de la librería propietaria `murmel-flash`: la integración en stacks estándar (Transformers, NeMo, ONNX) no está garantizada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni casos de uso reportados.
- No se detalla el sample rate de entrada, el formato de audio admitido ni el preprocesado requerido, lo que exige consultar la documentación del autor antes de desplegar.
- Fecha de creación en 2026 y actualización un día después: el modelo es muy reciente y su mantenimiento futuro es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/theaifactorybv/murmel-flash-m-v7
- Perfil del autor: https://huggingface.co/theaifactorybv
- Documentación de FastConformer (referencia arquitectónica): https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html
- Paper de FastConformer: https://arxiv.org/abs/2305.05084
