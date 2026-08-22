# tbhrc/whisper_base_ct2

## Resumen

Este repositorio contiene la conversión del modelo `openai/whisper-base` al formato CTranslate2, realizada por el usuario tbhrc. El modelo resultante es un sistema de reconocimiento automático del habla (ASR) multilingüe que puede usarse directamente con la biblioteca CTranslate2 o con proyectos basados en ella como `faster-whisper`. Al estar en formato CTranslate2, se beneficia de una inferencia optimizada para CPU y GPU, con un menor uso de memoria y una latencia reducida respecto al modelo original en PyTorch.

La relevancia de esta conversión radica en que facilita el despliegue de Whisper en entornos de producción donde la eficiencia es crítica. Al tratarse de la variante base de Whisper, ofrece un equilibrio entre precisión y consumo de recursos, lo que la hace adecuada para dispositivos con limitaciones de hardware, como Raspberry Pi o servidores con CPU sin GPU dedicada. El modelo hereda las capacidades multilingües y de robustez del original de OpenAI, pero con la ventaja de un formato de pesos más ligero y rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos guardados en FP16, configurable con `compute_type`) |
| Idiomas soportados | Multilingüe: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | MIT |
| Formato de pesos | CTranslate2 |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `openai/whisper-base` al formato CTranslate2, realizada con la herramienta `ct2-transformers-converter` usando cuantización FP16. No se ha realizado ningún entrenamiento adicional; los pesos son idénticos al modelo original. Whisper base es un modelo Transformer con arquitectura encoder-decoder, entrenado por OpenAI sobre un amplio conjunto de datos de audio débilmente supervisado (680 000 horas). Este entrenamiento le confiere una gran robustez frente a ruido, acentos y condiciones variadas, así como la capacidad de realizar tareas de reconocimiento de voz, traducción de voz y identificación de idioma en un solo modelo.

La conversión a CTranslate2 introduce una optimización de la ejecución mediante la compilación del grafo y la reducción de la precisión a FP16, lo que permite una inferencia más rápida y un menor consumo de memoria sin cambiar el comportamiento funcional del modelo.

## Capacidades

- Reconocimiento automático de voz (ASR) en 79 idiomas, con transcripción directa a texto.
- Traducción de voz (speech-to-text translation) a inglés, útil para subtitulado o traducción de contenido hablado.
- Identificación del idioma de la entrada de audio.
- Robustez frente a ruido de fondo, acentos y condiciones de grabación adversas (heredado del modelo original).
- Soporte de procesamiento por lotes (batch) para transcribir múltiples archivos de audio.
- Integración con `faster-whisper`, que ofrece decodificación en streaming y control de segmentos de tiempo.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede transcribir grabaciones de audio de larga duración, generando subtítulos o actas en tiempo real o diferido.
- Generación de subtítulos para vídeo: integrado en un pipeline de procesamiento de vídeo, permite crear subtítulos en varios idiomas de forma automática.
- Asistentes de voz en dispositivos con recursos limitados: al ser la variante base, cabe en dispositivos con poca memoria y puede ejecutarse en CPU, ideal para Raspberry Pi o routers.
- Traducción de contenido hablado en tiempo real: con la capacidad de traducción de voz a texto en inglés, se puede utilizar en sistemas de interpretación instantánea.
- Análisis de llamadas de atención al cliente: transcribir llamadas para su posterior análisis de calidad o detección de intenciones.
- Archivado de bibliotecas de audio: convertir colecciones de podcasts, entrevistas o discursos en texto buscable.
- Integración en aplicaciones de accesibilidad: para personas con discapacidad auditiva, transcribe en tiempo real conversaciones o eventos en directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los resultados del modelo original `whisper-base` se pueden consultar en la documentación de OpenAI, pero esta conversión no incluye datos de evaluación específicos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene un tamaño de 0.1 GB en FP16, lo que requiere aproximadamente 0.1 GB de VRAM en GPU, o memoria RAM equivalente en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo cómodamente, incluyendo GPUs integradas. En CPU, se ejecuta con un rendimiento aceptable para transcripciones no en tiempo real.
- Compatibilidad con consumer GPU: sí, puede ejecutarse en tarjetas como GTX 1060, RTX 2060, RTX 3060, etc.
- Opciones de despliegue: CTranslate2, `faster-whisper`, y también se puede usar con el framework CTranslate2 directamente o a través de la biblioteca `ctranslate2` en Python.
- Latencia y throughput: no disponible, pero al ser el modelo base, se espera una latencia de unos pocos segundos para audio de 30 segundos en CPU moderna.

## Comparativa con modelos similares

| Modelo | Tamaño (parámetros) | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `tbhrc/whisper_base_ct2` | no disponible | no disponible | MIT | CTranslate2 | HuggingFace |
| `openai/whisper-tiny` (original) | 39 M | 30 s audio | MIT | PyTorch | HuggingFace |
| `openai/whisper-base` (original) | 74 M | 30 s audio | MIT | PyTorch | HuggingFace |
| `openai/whisper-small` (original) | 244 M | 30 s audio | MIT | PyTorch | HuggingFace |

La ventaja de esta versión frente a los modelos originales es que está optimizada para CTranslate2, lo que reduce la latencia y el consumo de memoria, aunque no aporta mejoras en precisión.

## Limitaciones y advertencias

- No se han realizado pruebas de rendimiento en este repositorio; los resultados de precisión son los del modelo original, que pueden variar según el dominio del audio.
- El modelo base tiene una precisión inferior a las variantes `small`, `medium` y `large` de Whisper, especialmente en idiomas poco representados o con acentos fuertes.
- La lista de idiomas es amplia, pero la calidad de transcripción varía según el idioma; los idiomas con más representación en el entrenamiento (inglés, español, alemán, etc.) suelen tener mejor rendimiento.
- La licencia MIT permite uso comercial, pero debe cumplirse con los términos del modelo original de OpenAI, que también es MIT.
- El modelo no incluye funcionalidades de voz (speaker diarization) ni de eliminación de ruido; requiere audio ya limpio o preprocesado.
- La conversión a FP16 puede introducir pequeñas pérdidas de precisión en algunos escenarios, aunque normalmente es imperceptible.

## Enlaces

- Repositorio HuggingFace: [tbhrc/whisper_base_ct2](https://huggingface.co/tbhrc/whisper_base_ct2)
- Modelo original: [openai/whisper-base](https://huggingface.co/openai/whisper-base)
- Proyecto CTranslate2: [GitHub](https://github.com/OpenNMT/CTranslate2)
- Proyecto faster-whisper: [GitHub](https://github.com/systran/faster-whisper)
- Model card del original: [whisper model-card](https://github.com/openai/whisper/blob/main/model-card.md)
