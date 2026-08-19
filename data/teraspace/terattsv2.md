# TeraSpace/TeraTTSv2

## Resumen

TeraTTSv2 es un modelo de síntesis de voz (text-to-speech) desarrollado por TeraSpace, distribuido como un paquete autónomo de ONNX Runtime. Está diseñado para generar audio de alta calidad en ruso e inglés, con características como marcado automático de acentos en ruso, diez estilos de voz predefinidos y salida de audio en streaming. El modelo se basa en una arquitectura de difusión con un "teacher" de 25 segundos y un "student" destilado de ocho pasos con CFG-3, lo que permite una síntesis rápida y de buena calidad. Está disponible en Hugging Face con un tamaño de repositorio de 1,7 GB y se integra con la librería transformers mediante código remoto.

Es relevante porque ofrece una solución TTS autocontenida en ONNX, lo que facilita su despliegue en entornos de producción sin dependencias pesadas. Su soporte para ruso con acentuación automática es especialmente útil para aplicaciones en ese idioma, y su capacidad de streaming lo hace adecuado para sistemas de conversación en tiempo real. Aunque la licencia no está especificada, el modelo está disponible públicamente en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión TTS (teacher-student) sobre ONNX Runtime |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (síntesis de voz, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso, inglés (según la model card) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

TeraTTSv2 emplea una arquitectura de difusión para síntesis de voz, con dos variantes: un modelo "teacher" de 25 segundos y un "student" destilado de ocho pasos con CFG-3 (classifier-free guidance). El student está optimizado para velocidad, mientras que el teacher permite ajustar el guidance. El modelo se ejecuta sobre ONNX Runtime y se integra con transformers mediante código remoto. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de entrenamiento (RLHF, DPO, etc.) en la información disponible.

## Capacidades

- Generación de voz en ruso e inglés con etiquetas de idioma obligatorias (`<en>…</en>` y `<ru>…</ru>`).
- Marcado automático de acentos en ruso mediante un sistema derivado de RUAccent, con soporte para marcadores manuales explícitos (`+`).
- Diez estilos de voz predefinidos (`ru_f1`, `ru_m5`, `ru_f2`, `ru_m1`, `eng_f3`, `eng_f4_whisper`, `eng_f5`, `eng_m2_whisper`, `eng_m3`, `eng_m4`).
- Control de duración mediante `duration_scale` (valores positivos, default 1).
- Selección de modelo de difusión: `distilled` (rápido, CFG-3 integrado) o `teacher` (ajustable con `guidance`).
- Modo de acentuación rusa: `full` (redes neuronales RUAccent + diccionarios) o `dictionary` (solo diccionarios, menor memoria).
- Expansión de números a palabras en el idioma correspondiente.
- Salida de audio en streaming mediante `generate_speech_stream`.
- Normalización de texto (expansión de números, marcado de acentos, normalización Unicode) con `normalize_text`.
- Generación de audio mono `float32` a 44,100 Hz.

## Casos de uso

- Atención al cliente automatizada en ruso e inglés: el modelo puede generar respuestas de voz naturales con acentuación rusa correcta, integrándose en sistemas IVR o chatbots de voz.
- Lectura de textos largos en ruso: gracias al marcado automático de acentos, es adecuado para audiolibros o lectores de pantalla, reduciendo errores de pronunciación.
- Asistentes de voz multilingües: al soportar ruso e inglés con etiquetas de idioma, permite crear asistentes que cambian de idioma en una misma conversación.
- Generación de contenido multimedia: producción de locuciones para vídeos, podcasts o anuncios, con control de duración y estilo de voz.
- Sistemas de traducción de voz a voz: combinado con un motor de traducción, puede sintetizar la salida en el idioma de destino con voces naturales.
- Prototipado rápido de aplicaciones TTS: al ser autocontenido en ONNX y ejecutable en CPU, permite pruebas locales sin GPU, ideal para desarrollo y validación.
- Streaming de audio en tiempo real: para aplicaciones de radio en línea o juegos que requieren generación de voz continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo se puede ejecutar en CPU (`CPUExecutionProvider`) según la documentación, con soporte para múltiples hilos (`threads=6` en el ejemplo).
- El tamaño del repositorio es de 1,7 GB, lo que indica que los gráficos ONNX ocupan aproximadamente ese espacio.
- No se especifican requisitos de VRAM ni GPU recomendadas; al ser ONNX, puede ejecutarse en CPU, aunque una GPU aceleraría la inferencia.
- Opciones de despliegue: se integra con transformers mediante `trust_remote_code=True`, y también se puede usar directamente con ONNX Runtime.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Requiere etiquetas de idioma obligatorias (`<en>…</en>` o `<ru>…</ru>`); el runtime rechaza texto sin etiquetar o desequilibrado.
- El marcado automático de acentos en ruso puede fallar en palabras desconocidas o homógrafos en modo diccionario; en modo `full`, las redes neuronales de RUAccent mejoran la precisión pero consumen más memoria.
- Caracteres fuera del vocabulario del modelo se omiten con una advertencia en tiempo de ejecución.
- El uso de `trust_remote_code=True` implica ejecutar código remoto; se recomienda fijar un commit específico del Hub por seguridad.
- La licencia no está especificada, lo que puede limitar el uso comercial o la redistribución.
- Solo soporta ruso e inglés; no hay soporte para otros idiomas.
- El modelo está pensado para síntesis de voz; no es un modelo de lenguaje general.

## Enlaces

- Hugging Face: https://huggingface.co/TeraSpace/TeraTTSv2
- RUAccent (adaptado): https://github.com/Den4ikAI/ruaccent
