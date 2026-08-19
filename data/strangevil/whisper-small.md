# strangevil/whisper-small

## Resumen

El modelo `strangevil/whisper-small` es una implementación del reconocedor de voz automático Whisper en su variante "small", desarrollada por el usuario strangevil y publicada en HuggingFace. Está basado en la arquitectura transformer encoder-decoder propuesta por OpenAI en el paper arXiv:2212.04356, y cuenta con 241.734.912 parámetros. Su propósito principal es la transcripción de audio a texto en un amplio conjunto de idiomas (99 lenguas listadas), lo que lo hace útil para aplicaciones de subtitulado, asistentes de voz y accesibilidad.

El modelo se distribuye bajo licencia Apache-2.0 y está disponible en formatos safetensors, PyTorch, TensorFlow y JAX. El acceso al repositorio es restringido (gated), por lo que es necesario aceptar las condiciones de uso en HuggingFace antes de descargarlo. Aunque no se especifican detalles sobre el entrenamiento o el contexto de audio, los benchmarks declarados por el autor muestran resultados aceptables en inglés (LibriSpeech) pero valores de WER muy elevados en idiomas como hindi y divehi, lo que sugiere un rendimiento desigual según la lengua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien pytorch, tf, jax) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI, un transformer encoder-decoder diseñado para el reconocimiento automático de voz y la traducción de audio. La variante "small" tiene 241,7 millones de parámetros, lo que la sitúa en un punto intermedio entre las versiones base y medium en cuanto a capacidad y requisitos computacionales. No se dispone de información específica sobre el proceso de entrenamiento de esta versión concreta (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), aunque el paper asociado (arXiv:2212.04356) describe el enfoque general de Whisper: entrenamiento supervisado a gran escala con datos multilingües y multitarea.

Al tratarse de un modelo de ASR, no incorpora mecanismos como decodificación especulativa ni atención lineal; su diseño es el de un transformer estándar con atención completa sobre la secuencia de audio codificada. La ausencia de detalles sobre el dataset de entrenamiento o posibles fine-tunes impide valorar innovaciones técnicas adicionales.

## Capacidades

- Reconocimiento automático de voz (ASR) en 99 idiomas, con soporte para transcripción de audio a texto.
- Procesamiento de audio en formato de onda o mel-spectrograma, típico de los modelos Whisper.
- Capacidad multilingüe amplia, que cubre lenguas mayoritarias (inglés, español, francés, alemán, chino, etc.) y minoritarias (hawaiano, letón, cingalés, etc.).
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso, ya que es un modelo exclusivamente de transcripción.
- No se indica soporte para traducción de audio a texto en otros idiomas, aunque Whisper original sí la incluye; en esta ficha no hay datos al respecto.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto, facilitando la generación de actas y búsquedas posteriores. Su soporte multilingüe permite procesar conversaciones en varios idiomas sin necesidad de cambiar de modelo.
- Subtitulado automático de vídeos: ideal para generar subtítulos en tiempo real o de forma diferida en plataformas de contenido, gracias a su capacidad para manejar audio de diversa procedencia.
- Asistentes de voz y comandos por voz: puede integrarse en sistemas embebidos o aplicaciones de escritorio para convertir órdenes habladas en texto, aunque su latencia dependerá del hardware disponible.
- Accesibilidad para personas con discapacidad auditiva: al transcribir audio a texto, permite que contenido hablado sea accesible en formato escrito, mejorando la inclusión en entornos educativos y laborales.
- Análisis de llamadas y atención al cliente: las empresas pueden procesar grabaciones de llamadas para extraer información relevante, detectar palabras clave o evaluar la calidad del servicio.
- Archivado y documentación de contenido audiovisual: bibliotecas y medios pueden indexar automáticamente archivos de audio y vídeo, facilitando su búsqueda y catalogación mediante texto transcrito.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card (no verificados de forma independiente):

| Dataset | Config | Split | Idioma | Metrica | Valor |
|---|---|---|---|---|---|
| LibriSpeech | clean | test | en | WER | 3,43 |
| LibriSpeech | other | test | en | WER | 7,63 |
| Common Voice 11.0 | hi | test | hi | WER | 87,30 |
| Common Voice 13.0 | dv | test | dv | WER | 125,70 |

Los valores de WER superiores a 100 en divehi (dv) son anómalos y probablemente indican un error de medición o un fallo en la transcripción de ese idioma. En inglés, el rendimiento es competitivo para un modelo de tamaño pequeño, pero en lenguas como hindi el error es muy alto, lo que limita su uso práctico en esos contextos.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación del modelo. Sin embargo, por su tamaño (241,7 millones de parámetros), es razonable estimar que puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM si se utiliza una cuantización adecuada (por ejemplo, int8 o int4). Para inferencia en tiempo real, se recomienda una GPU dedicada como una RTX 3060 o superior. Las opciones de despliegue habituales para modelos Whisper incluyen `transformers` de HuggingFace, `whisper.cpp` para CPU, o servidores de inferencia como vLLM (aunque vLLM no está optimizado para ASR). No se han publicado datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación del modelo. Al ser una variante de Whisper, se podría comparar con `openai/whisper-base` (244M parámetros) y `openai/whisper-medium` (769M parámetros), pero no se tienen datos de rendimiento de esos modelos en este contexto. La comparativa queda pendiente de datos verificables.

## Limitaciones y advertencias

- El acceso al repositorio es restringido (gated), lo que puede dificultar su uso en entornos automatizados o de CI/CD.
- Los benchmarks muestran un rendimiento muy pobre en idiomas como hindi (WER 87,3) y divehi (WER 125,7), lo que indica una cobertura lingüística desigual y posibles sesgos en el entrenamiento.
- No se han publicado resultados verificados de forma independiente; los valores declarados por el autor deben tomarse con cautela.
- El modelo es exclusivamente de reconocimiento de voz; no ofrece capacidades de razonamiento, generación de texto libre ni tool calling.
- No se especifica la longitud de contexto de audio, aunque los modelos Whisper suelen manejar ventanas de 30 segundos; esta limitación no está confirmada en la documentación.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo gated, es necesario cumplir las condiciones de acceso de HuggingFace.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/strangevil/whisper-small
- Paper de Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
