# vanch007/mlx-pocket-tts

## Resumen

El modelo `vanch007/mlx-pocket-tts` es una conversión a MLX (Machine Learning eXchange) de Pocket TTS, un sistema de texto a voz (TTS) desarrollado originalmente por Kyutai. Esta adaptación, creada por vanch007, está optimizada para ejecutarse en Apple Silicon, permitiendo síntesis de voz de alta calidad directamente en CPU y GPU integrada de Macs. El modelo combina un backbone FlowLM (Flow-based Language Model) con un codec Mimi, y se distribuye con cuantización dinámica de 8 bits en el generador, manteniendo el codec a precisión original.

El modelo resuelve el problema de ejecutar TTS eficiente en hardware de consumo, sin necesidad de GPUs dedicadas, y añade capacidades de clonación de voz mediante audio de referencia. Con 45,3 millones de parámetros y un peso total de 0,3 GB, es una opción ligera para integraciones en aplicaciones de escritorio, asistentes de voz y prototipos. Su relevancia actual radica en la creciente demanda de modelos de TTS open source que funcionen en entornos locales con privacidad y baja latencia.

La conversión incluye 26 voces predefinidas, soporte para streaming y una API HTTP, lo que facilita su uso tanto en scripts como en servicios web. La licencia CC BY 4.0 para los pesos y MIT para la implementación permite su uso comercial con atribución, aunque la clonación de voz está sujeta a restricciones éticas y legales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlowLM (flow-based language model) + Mimi codec |
| Parametros totales | 45.309.698 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es TTS) |
| Tipos de cuantizacion | 8-bit dinámico (grupo 64) en FlowLM; Mimi sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY 4.0 (pesos, tokenizador y voces); MIT (implementación MLX) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Pocket TTS combina un modelo de lenguaje basado en flujos (FlowLM) con un codec neuronal Mimi. El FlowLM genera representaciones latentes que luego son decodificadas por Mimi para producir audio de 24 kHz. En esta conversión MLX, el FlowLM se cuantiza dinámicamente a 8 bits con un tamaño de grupo de 64, lo que reduce el uso de memoria sin degradar significativamente la calidad, mientras que Mimi se mantiene a precisión original para preservar la fidelidad del audio.

No se dispone de información detallada sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación). La conversión se basa en los pesos preentrenados de `kyutai/pocket-tts` (revisión `492522650173a0653b7575cdc25ae09810e5d741`) y no implica un reentrenamiento, sino una adaptación de pesos y cuantización para el ecosistema MLX. La implementación incluye soporte para generación incremental (streaming) y clonación de voz mediante audio de referencia, lo que amplía las capacidades del modelo original.

## Capacidades

- Generación de voz a partir de texto en inglés, con salida de audio a 24 kHz.
- Clonación de voz mediante audio de referencia (voice cloning) usando el argumento `--ref-audio`.
- 26 voces predefinidas incluidas en el artefacto (`embeddings/*.safetensors`).
- Generación incremental (streaming) para reducir la latencia percibida.
- API HTTP y Web UI integradas mediante el comando `serve`.
- Bajo uso de memoria: pico de 0,355 GB en verificación local.
- Factor de tiempo real (RTF) de 0,338, es decir, genera audio más rápido que en tiempo real en un M3 Max.
- Compatibilidad con Python 3.10+ y Apple Silicon.

## Casos de uso

- Asistentes de voz en macOS: el modelo puede integrarse en aplicaciones nativas de Apple Silicon para generar respuestas habladas con baja latencia, aprovechando su RTF de 0,338 y su pequeño footprint de memoria.
- Audiolibros y narración de contenidos: con 26 voces predefinidas, es adecuado para convertir artículos o libros en audio, seleccionando la voz más apropiada para cada narración.
- Accesibilidad: permite a personas con discapacidad visual o dificultades de lectura escuchar contenido textual en tiempo real, sin depender de servicios en la nube.
- Prototipado rápido de productos TTS: los desarrolladores pueden probar diferentes voces y estilos de síntesis localmente antes de desplegar en producción, gracias a la CLI y la API HTTP.
- Clonación de voz con consentimiento: con un audio de referencia, se puede generar una voz personalizada para asistentes virtuales o personajes de videojuegos, siempre que se cuente con la autorización explícita del hablante.
- Integración en pipelines de generación de contenido: el modelo puede usarse en scripts de automatización para producir locuciones para vídeos, podcasts o presentaciones, sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque se trata de un modelo de TTS, no de lenguaje general. La verificación local realizada por el autor en un M3 Max reporta los siguientes datos:

| Métrica | Resultado |
|---|---|
| Auditoría estricta de pesos | pass: 316 grupos de parámetros, sin tensores faltantes o extra |
| Audio generado | finito, 24 kHz, duración 3,52 segundos |
| Factor de tiempo real (RTF) | 0,338 |
| Pico de memoria | 0,355 GB |
| Replay con Whisper (WER) | 0,0 |

Estos valores son mediciones de una sola máquina y no constituyen una garantía universal de calidad. No se dispone de comparaciones con otros modelos TTS en la información proporcionada.

## Requisitos de hardware

- Apple Silicon (probado en M3 Max; se espera compatibilidad con M1, M2 y posteriores).
- Memoria RAM: pico de uso de 0,355 GB durante la generación, por lo que cualquier Mac con 8 GB o más es suficiente.
- GPU: integrada en el chip Apple Silicon; no requiere GPU dedicada.
- Almacenamiento: 0,3 GB para el repositorio del modelo.
- Despliegue: mediante CLI (`mlx-pocket-tts generate`), servidor HTTP (`mlx-pocket-tts serve`) o API Python documentada en el repositorio GitHub.
- Latencia: RTF de 0,338 en M3 Max, lo que implica que un audio de 3,52 segundos se genera en aproximadamente 1,19 segundos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos TTS en la documentación proporcionada. El modelo base `kyutai/pocket-tts` es el referente directo, pero no se incluyen datos de rendimiento relativo frente a alternativas como Piper, Coqui TTS o Breeze TTS. Se recomienda consultar los benchmarks publicados por Kyutai para el modelo original.

## Limitaciones y advertencias

- Solo soporta inglés; no se menciona soporte multilingüe.
- La clonación de voz debe usarse únicamente con la autorización explícita del hablante. Está prohibido su uso para suplantación, fraude, acoso o cualquier actividad ilícita.
- La licencia CC BY 4.0 exige atribución a Kyutai y al proyecto Pocket TTS al redistribuir pesos o publicar resultados derivados.
- El modelo está optimizado para Apple Silicon; no se garantiza su funcionamiento en otras arquitecturas (x86, ARM de otras marcas).
- No se han documentado sesgos específicos, pero al ser un modelo de TTS entrenado con datos en inglés, puede presentar acentos o pronunciaciones limitadas para hablantes no nativos.
- La cuantización de 8 bits puede introducir ligeras pérdidas de calidad en comparación con el modelo original, aunque la verificación local reporta WER 0,0.
- No se proporcionan garantías de rendimiento en hardware distinto al M3 Max; los valores de RTF y memoria pueden variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanch007/mlx-pocket-tts
- Repositorio GitHub de la conversión MLX: https://github.com/vanch007/mlx-pocket-tts
- Repositorio upstream de Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- Pesos originales de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Voces predefinidas de Kyutai: https://huggingface.co/kyutai/tts-voices
- Documentación de arquitectura en DeepWiki: https://deepwiki.com/Blaizzy/mlx-audio/3.7-pockettts-model
