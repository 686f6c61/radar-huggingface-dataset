# tbtlr/livevoice-0.5b-GGUF

## Resumen

livevoice-0.5b-GGUF es una cuantizacion en formato GGUF del modelo de sintesis de voz (text-to-speech) microsoft/VibeVoice-Realtime-0.5B, publicada por el usuario tbtlr. El modelo base, desarrollado por Microsoft, esta orientado a la generacion de voz en streaming: comienza a emitir audio mientras el texto de entrada todavia se esta escribiendo, con una latencia de arranque de aproximadamente 70-120 ms tras las primeras palabras sobre un Apple M4 Max. Esta cuantizacion esta pensada para ejecutarse con livevoice.cpp, un runtime en C++/ggml especificamente adaptado para TTS en streaming.

El repositorio incluye cuatro variantes de cuantizacion (attn-q8, mixed, q4_k y q8_0), cada una autocontenida: pesos del modelo, tokenizer y un post-filtro DeepFilterNet3 que elimina el artefacto musical corto que el modelo a veces inserta al inicio de una respuesta. La salida es audio mono a 48 kHz. El modelo base declara 883.627.733 parametros totales y esta disponible bajo licencia MIT.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de voz en tiempo real en hardware modesto (incluso telefonos moviles con Metal) sin depender de infraestructura en la nube, gracias al formato GGUF y a un runtime optimizado para streaming. El modelo no dispone de encoder de audio: la voz se representa como un prompt precalculado (las caches K/V del modelo tras "escuchar" una voz de referencia), no como una grabacion de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para TTS, base VibeVoice-Realtime-0.5B; sin encoder de audio) |
| Parametros totales | 883.627.733 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4_0, q4_k, q6_k, q8_0, F16 (segun receta); ficheros: attn-q8, mixed, q4_k, q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (ggml); voces en GGUF; DeepFilterNet3 embebido en GGUF |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base mas alla de que se trata de un modelo de sintesis de voz en tiempo real con un cabezal de difusion (diffusion head) y sin encoder de audio. El pipeline declarado es text-to-speech y la libreria asociada es vibevoice. El modelo base es microsoft/VibeVoice-Realtime-0.5B, con 883.627.733 parametros.

El proceso de conversion documentado por el autor es el siguiente: se convierte el tokenizer desde Qwen2.5-0.5B, se convierte DeepFilterNet3 a GGUF y se genera el modelo F16 combinando pesos, tokenizer y post-filtro. Posteriormente se aplican recetas de cuantizacion (attn-q8, mixed, q4_k, q8_0) mediante la herramienta livevoice-quantize. Los prompts de voz en formato .pt (como los de microsoft/VibeVoice) se convierten con scripts/convert_voice.py. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Una innovacion destacable es el enfoque de streaming: el modelo empieza a hablar mientras el texto se sigue escribiendo, con una latencia de arranque de 70-120 ms en M4 Max. Los valores por defecto son 5 pasos de difusion y una escala de guiado (guidance scale) de 1.5. Ademas, el post-filtro DeepFilterNet3 embebido elimina artefactos musicales parasitos al inicio de las respuestas.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles con salida mono a 48 kHz.
- Generacion de audio en streaming: comienza a emitir audio antes de que el texto de entrada este completo.
- Integracion con un LLM: permite empujar texto a medida que el modelo de lenguaje lo produce y recibir fragmentos de audio conforme se generan (API en C con lv_stream_push).
- Seleccion de voz mediante prompts precalculados (voces en-Clarissa_female y en-Clarion_male incluidas).
- Post-procesado integrado con DeepFilterNet3 para limpiar artefactos musicales.
- No dispone de encoder de audio: no clona voces a partir de grabaciones de referencia, sino que usa prompts de voz precalculados.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo de generacion de voz.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede generar audio mientras el LLM produce texto, lo que reduce la latencia percibida en asistentes conversacionales; es adecuado por su arranque de 70-120 ms y su API de streaming.
- Lectura por voz de respuestas de un chatbot: se integra con un LLM que emite tokens y el modelo sintetiza el audio progresivamente, permitiendo respuestas habladas con baja latencia.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en aplicaciones de escritorio o moviles, con salida a 48 kHz y bajo consumo gracias a las cuantizaciones q4_k/attn-q8.
- Locucion automatizada de contenido dinamico: generacion de narracion para noticias, boletines o resumenes que se actualizan en tiempo real, aprovechando el modo streaming.
- Integracion en aplicaciones moviles: la cuantizacion q4_k (667 MB) y attn-q8 (757 MB) caben en memoria de telefonos modernos; en iPhone 18 Pro (Metal, 5 pasos, CFG 1.5) q4_k corre a 8.0x tiempo real y attn-q8 a 7.9x.
- Sistemas embebidos y edge computing con livevoice.cpp: el runtime en C++/ggml permite desplegar el modelo sin dependencias de Python ni de infraestructura en la nube, adecuado para dispositivos con recursos limitados.
- Prototipado de interfaces de voz en C/C++: la API en C (lv_model_load, lv_stream_begin, lv_stream_push, lv_stream_end) facilita la incorporacion de TTS en aplicaciones nativas.
- Generacion de audiolibros o contenido narrado por lotes: usando el modo no streaming y varias voces, aunque con la limitacion de que solo soporta ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de TTS. Sin embargo, la model card incluye datos de evaluacion especificos de sintesis de voz:

Tasa de acierto en palabras raras (24 frases con 35 huecos de palabras raras x 10 semillas, juzgado por un modelo ASR):

| Configuracion LM (attention / gate / up) | Huecos de palabras raras acertados |
|---|---:|
| q4_0 (fichero q4_k) | 73.7 % |
| q8_0 | 79.7 % |
| f16 | 78.3 % |

Con las reglas del tokenizer de livevoice.cpp para palabras raras (activadas por defecto), attn-q8 alcanza el 82.0 % de los huecos. Las tasas de error en palabras comunes son las mismas para los cuatro ficheros.

Rendimiento en iPhone 18 Pro (Metal, 5 pasos, CFG 1.5):

| Fichero | Velocidad |
|---|---:|
| q4_k | 8.0x tiempo real |
| attn-q8 | 7.9x tiempo real |
| q8_0 gate / up | 6.3x tiempo real |

Latencia de arranque: aproximadamente 70-120 ms tras las primeras palabras en un Apple M4 Max.

## Requisitos de hardware

- VRAM/memoria estimada segun fichero: q4_k 667 MB, attn-q8 757 MB (recomendado), mixed 862 MB, q8_0 1.1 GB. Hay que sumar el espacio de trabajo del runtime y el post-filtro DeepFilterNet3.
- GPU recomendadas: no se especifican GPU de escritorio en la informacion disponible; los datos de rendimiento proporcionados corresponden a Apple M4 Max y iPhone 18 Pro (Metal).
- Cabe en GPU de consumo: si, los ficheros de 667-862 MB caben en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante, e incluso integradas). El cuello de botella es el ancho de banda de memoria, ya que cada matriz del LM se lee una vez por fotograma de voz.
- Opciones de despliegue: livevoice.cpp (runtime C++/ggml especifico, con CLI livevoice-cli y API en C). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: arranque de 70-120 ms en M4 Max; en iPhone 18 Pro, 8.0x tiempo real con q4_k y 7.9x con attn-q8 (5 pasos, CFG 1.5). En telefonos, el ancho de banda de memoria de la GPU determina la velocidad.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos comparables de la misma categoria (TTS en streaming de ~0.5B parametros) que permitan una comparacion rigurosa. Se puede senalar que el modelo base es microsoft/VibeVoice-Realtime-0.5B, del cual esta publicacion es una cuantizacion GGUF, por lo que el rendimiento de calidad es equivalente al del modelo original; la diferencia esta en el formato, el tamano y el runtime de despliegue.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| tbtlr/livevoice-0.5b-GGUF | 883.627.733 | no disponible | MIT | GGUF | Hugging Face |
| microsoft/VibeVoice-Realtime-0.5B | no disponible (0.5B segun nombre) | no disponible | MIT | no disponible (formato original, .pt para voces) | Hugging Face |
| Alternativas de TTS en streaming | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles (language: en); no hay soporte multilingue documentado.
- No dispone de encoder de audio: no puede clonar voces a partir de grabaciones de referencia, solo usar prompts de voz precalculados (los dos incluidos o convertidos desde el formato .pt del repositorio microsoft/VibeVoice).
- Riesgo de artefactos: el modelo a veces inserta un artefacto musical corto al inicio de una respuesta; se mitiga con el post-filtro DeepFilterNet3 embebido, pero no se garantiza su eliminacion total.
- Las cuantizaciones agresivas degradan la pronunciacion de palabras raras: q4_0 baja al 73.7 % de acierto en huecos de palabras raras frente al 79.7 % de q8_0 y el 78.3 % de f16. Las palabras comunes no se ven afectadas.
- El rendimiento depende del ancho de banda de memoria de la GPU; en dispositivos moviles o GPUs con poca bandwidth la velocidad en tiempo real puede degradarse.
- No se documentan sesgos especificos, pero al ser un modelo entrenado principalmente en ingles, puede presentar sesgos linguisticos y culturales propios de ese dominio.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o entonaciones inesperadas, especialmente con texto fuera de distribucion.
- Licencia MIT: permite uso comercial, pero la model card remite a las condiciones de uso y limitaciones del modelo base (microsoft/VibeVoice-Realtime-0.5B), que aplican sin cambios. Los pesos de DeepFilterNet3 embebidos son MIT / Apache-2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria amplia de su funcionamiento en produccion.
- La fecha de creacion indicada (2026-11-09) es futura respecto a la fecha habitual de publicacion de fichas; conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/tbtlr/livevoice-0.5b-GGUF
- Modelo base: https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
- Repositorio livevoice.cpp: https://github.com/tbtlr/livevoice.cpp
- DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
- Repositorio microsoft/VibeVoice: https://github.com/microsoft/VibeVoice
