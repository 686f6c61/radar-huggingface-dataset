# zhangjfnb/sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23

## Resumen

El modelo `sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23` es un sistema de reconocimiento automático de voz (ASR) en streaming, diseñado para transcribir audio en chino en tiempo real. Fue desarrollado por el usuario `zhangjfbn`, que lo convirtió a formato ONNX a partir del modelo original de `csukuangfj`. Con 14 millones de parámetros y arquitectura Zipformer, está orientado a aplicaciones de baja latencia y bajo coste computacional, como asistentes de voz, subtitulado en vivo o transcripción de llamadas. Su licencia Apache-2.0 permite el uso comercial. No se dispone de información sobre la longitud de contexto ni sobre el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (según nombre del modelo) |
| Parametros totales | 14 millones (según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino (según código "zh" en el nombre) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura Zipformer es una variante eficiente del Conformer, diseñada para reducir la complejidad computacional manteniendo un buen rendimiento en reconocimiento de voz. Este modelo es una conversión a ONNX de un modelo previo de sherpa-onnx, por lo que está pensado para ser ejecutado en tiempo real mediante el framework sherpa-onnx. No se ha publicado información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni sobre técnicas de alineación como RLHF o DPO, que no aplican a un modelo de ASR.

## Capacidades

- Transcripción de voz en chino en tiempo real, gracias a su diseño de streaming.
- Ejecución en formato ONNX, compatible con sherpa-onnx y ONNX Runtime.
- Procesamiento de audio de forma incremental, adecuado para aplicaciones con requisitos de baja latencia.
- No soporta generación de texto, tool calling, agentes ni razonamiento; es un modelo de reconocimiento de voz.
- Capacidades multilingües no disponibles; el nombre del modelo indica que está orientado al chino.

## Casos de uso

- Subtitulado en vivo de reuniones y eventos: el modelo transcribe el audio en chino de forma continua, lo que permite generar subtítulos en tiempo real en videoconferencias o retransmisiones.
- Asistente de voz para dispositivos domésticos: integrado en un pipeline de ASR, convierte comandos de voz en texto para su posterior procesamiento por un asistente.
- Transcripción de llamadas de atención al cliente: su capacidad de streaming permite convertir el audio de llamadas en texto de forma inmediata, facilitando el análisis posterior.
- Dictado por voz en aplicaciones de productividad: permite dictar texto en chino en tiempo real en procesadores de texto o editores de código.
- Accesibilidad para personas con discapacidad auditiva: genera subtítulos en tiempo real de contenido hablado en chino, mejorando la accesibilidad en medios y educación.
- Transcripción de clases magistrales o conferencias: transforma el audio de ponencias en apuntes de texto, gracias a su bajo coste computacional y tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo tiene 14 millones de parámetros, por lo que se espera un consumo de memoria muy bajo.
- GPU recomendadas: no disponible. Dado su tamaño, no se prevé la necesidad de una GPU dedicada.
- Compatibilidad con GPU de consumo: no disponible. No se ha especificado.
- Opciones de despliegue: sherpa-onnx y ONNX Runtime, según indica el nombre del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: en modelos ASR, los errores de transcripción pueden producirse con ruido, acentos o habla superpuesta; no se han documentado específicamente para este modelo.
- Limitaciones de idioma: el modelo parece estar diseñado exclusivamente para chino; no se ha verificado soporte para otros idiomas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveat: al tratarse de una conversión a ONNX, se recomienda verificar el funcionamiento con sherpa-onnx y el script de exportación antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhangjfnb/sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23
- Modelo original (csukuangfj): https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23
- Script de exportación: mencionado en el README del repositorio, disponible en el árbol de archivos del modelo.
