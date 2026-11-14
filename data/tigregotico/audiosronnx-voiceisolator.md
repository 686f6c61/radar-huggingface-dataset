# TigreGotico/audiosronnx-voiceisolator

## Resumen

`TigreGotico/audiosronnx-voiceisolator` es un paquete de grafos ONNX que implementa el aislador de voz de Scicom (Zolkepli, *The Voice on the Line*) para el motor `voiceisolator` de la librería `audiosronnx`. No es un modelo entrenado desde cero por TigreGotico: se trata de una reempaquetación y, en el caso de la variante grande, una exportación a ONNX de los pesos publicados por Scicom-intl. El objetivo es la extracción de hablante objetivo (*target-speaker extraction*): conservar una voz concreta y eliminar el resto de voces y el ruido de fondo.

El modelo trabaja a 16 kHz tanto en entrada como en salida, es causal y funciona en streaming con 10 ms de latencia de paso. Para decidir qué voz conservar utiliza un vector de hablante obtenido de un clip de enrolamiento o, en su defecto, de los 3 segundos más energéticos de la propia señal de entrada. La arquitectura subyacente combina procesado espectral con máscaras y, en la variante `large`, un codificador WavLM-Large convertido a causal.

La relevancia práctica está en su doble perfil: una versión CPU de 22 M de parámetros (grafo de paso de 85 MB, 25 MB en int8) apta para despliegue ligero, y una versión GPU de 555 M de parámetros (2,2 GB) con mejor calidad potencial. Incluye además un modelo "agente" que actúa como puerta de presencia para decidir si hay voz que aislar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Procesado espectral con mascaras (STFT + overlap-add) y encoder de hablante; variante `large` incorpora WavLM-Large causal |
| Parametros totales | 22 M (CPU) / 555 M (GPU `large`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de texto; anillos de atencion de 10 s en la variante `large`, paso fijo de 50 frames (0,5 s) |
| Tipos de cuantizacion | Float (grafos originales) e int8 |
| Idiomas soportados | No disponible (procesamiento de audio independiente del idioma) |
| Licencia | `other` / `scicom-voice-isolator` (upstream sin texto de licencia publicado) |
| Formato de pesos | ONNX (`step.onnx`, `enroll.onnx`, `step.onnx.data`), `config.json` |
| Frecuencia de muestreo | 16 kHz entrada y salida |
| Latencia de streaming | 10 ms por paso |
| Tamano del repo | 4,7 GB |

## Arquitectura y entrenamiento

El pipeline se organiza en dos grafos por carpeta: `step.onnx`, que representa un único paso de streaming, y `enroll.onnx`, el codificador de hablante que produce el vector de enrolamiento. El grafo de paso recibe la STFT de los frames nuevos junto con todo el estado del stream y devuelve el espectro enmascarado y el estado siguiente. El runtime mantiene en numpy la STFT, el overlap-add y los anillos de atención, de modo que el modelo solo aporta la parte neuronal del cómputo.

Las carpetas CPU son los grafos upstream sin modificar, en la revisión `1dfac59`. Las carpetas `large/` se exportaron desde la revisión upstream `d41d6d8` con el script `conversion/export_voiceisolator.py`; su grafo de paso incorpora WavLM-Large hecho causal y procesa 50 frames fijos (0,5 s) por paso. La model card reporta paridad numérica con la referencia: error absoluto máximo de 0.0 para los cuatro grafos CPU frente a `onnx_stream.py` upstream en una ejecución de 22 s, 7,5e-8 para `large/` frente al `stream_step` de PyTorch en float32 sobre 14 s, y 1,2e-7 para `large/agent/` con la puerta activada y desactivada. Las pruebas de 14 s superan el punto en que los anillos de atención de 10 s dan la vuelta. No se detallan en la información disponible los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF o DPO).

## Capacidades

- Aislamiento de voz objetivo: conserva un hablante y elimina otras voces y ruido.
- Extracción de hablante dirigida mediante vector de enrolamiento desde un clip externo.
- Enrolamiento automático a partir de los 3 segundos más energéticos de la señal de entrada.
- Procesamiento causal en streaming con 10 ms de latencia por paso.
- Entrada y salida a 16 kHz.
- Modelo "agente" de puerta de presencia para decidir si hay voz que aislar.
- Variantes cuantizadas int8 para despliegue con menos memoria.
- Procesamiento independiente del idioma (no dispone de metadatos de idiomas).
- No se documentan tool calling, agentes multi-paso, visión ni modo de razonamiento.

## Casos de uso

- Limpieza de llamadas telefónicas y grabaciones de contact center: el modo streaming con 10 ms de latencia permite filtrar voces de fondo y ruido en tiempo real antes de enviar el audio a un motor de ASR.
- Aislamiento de un participante en reuniones o podcasts: con un clip de enrolamiento del hablante se puede separar su voz del resto de intervinientes para transcripción o edición posterior.
- Preprocesado para pipelines de reconocimiento de voz: al reducir ruido y voces competing, se mejora la señal que consume el ASR sin necesidad de reentrenar el reconocedor.
- Vigilancia y análisis de audio con hablante conocido: el vector de enrolamiento permite rastrear una voz concreta en grabaciones largas, apoyándose en los anillos de atención de 10 s de la variante `large`.
- Despliegue en dispositivos sin GPU: la variante CPU de 22 M (25 MB en int8) cabe en entornos embebidos y permite aislamiento de voz en local.
- Filtrado previo en asistentes de voz y sistemas de dictado: la puerta de presencia (`agent`) evita procesar segmentos sin voz y ahorra cómputo.
- Archivado y postproducción de audio: la variante `large` de 555 M ofrece mayor capacidad para tareas de restauración donde la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de paridad numérica frente a las implementaciones de referencia:

| Grafos | Referencia | Error absoluto maximo |
|---|---|---|
| CPU, cuatro carpetas | `voice_isolator/onnx_stream.py`, 22 s | 0.0 |
| `large/` | PyTorch `stream_step`, 14 s, float32 | 7,5e-8 |
| `large/agent/`, puerta on/off | PyTorch `stream_step`, 14 s, float32 | 1,2e-7 |

## Requisitos de hardware

- VRAM estimada: la variante CPU no requiere GPU; la variante `large` carga un grafo de paso de 2,2 GB (`step.onnx.data`), por lo que conviene disponer de al menos 4 GB de VRAM o memoria unificada para trabajar con holgura.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, A100 o H100 son suficientes para la variante `large`.
- GPU de consumo: la variante CPU (22 M, 25 MB int8) funciona en CPU sin GPU; la variante `large` de 2,2 GB cabe en GPUs de consumo con 8 GB o más.
- Despliegue: runtime `audiosronnx` mediante `load_denoise("voiceisolator", ...)`; los grafos ONNX son portables a otros runtimes ONNX, aunque el mantenimiento de estado (STFT, overlap-add, anillos de atención) corre en numpy dentro de `audiosronnx`.
- Latencia y throughput: 10 ms por paso de streaming según el autor; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audiosronnx-voiceisolator (este) | 22 M / 555 M | Anillos de 10 s, paso de 10 ms | Aislamiento de voz objetivo en streaming | `other` (scicom-voice-isolator) | Hugging Face, ONNX |
| Scicom-intl/voice-isolator | 555 M | Igual (upstream) | Aislamiento de voz objetivo | `other` | Hugging Face |
| Scicom-intl/voice-isolator-cpu | 22 M | Igual (upstream) | Aislamiento de voz objetivo | `other` | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de separación de fuentes; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La licencia es `other` con nombre `scicom-voice-isolator` y el upstream no publica texto de licencia; los términos de los repositorios originales aplican a estos ficheros, lo que genera incertidumbre para uso comercial.
- El modelo está pensado para una única voz objetivo: si el enrolamiento es deficiente o la señal de referencia no corresponde al hablante, el aislamiento puede fallar.
- El enrolamiento automático usa los 3 segundos más energéticos, que pueden corresponder a otra voz o a ruido en grabaciones con varios hablantes.
- La variante `large` usa anillos de atención de 10 s; más allá de esa ventana el estado da la vuelta, lo que puede afectar a la coherencia en streams muy largos.
- Solo trabaja a 16 kHz; audio de mayor frecuencia debe remuestrearse.
- No hay información sobre sesgos, tasas de alucinación ni evaluación perceptual (PESQ, STOI u otras) en la documentación disponible.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Los grafos CPU son copias sin modificar del upstream en una revisión concreta (`1dfac59`); los `large/` dependen de la revisión `d41d6d8` y del script de exportación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigreGotico/audiosronnx-voiceisolator
- Repositorio `audiosronnx`: https://github.com/TigreGotico/audiosronnx
- Paper citado (Zolkepli, *The Voice on the Line*): https://arxiv.org/abs/2610.35272
- Upstream CPU: https://huggingface.co/Scicom-intl/voice-isolator-cpu
- Upstream GPU: https://huggingface.co/Scicom-intl/voice-isolator
- Licencia referenciada: https://huggingface.co/Scicom-intl/voice-isolator
