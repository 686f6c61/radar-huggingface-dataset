# Thorsten-Voice/Piper-Thorsten-CC0

## Resumen

Piper-Thorsten-CC0 es una voz sintética para síntesis de texto a voz (TTS) en alemán, desarrollada por Thorsten-Voice y publicada bajo licencia CC0. Se trata de un modelo VITS de calidad "medium" entrenado con la librería piper1-gpl, pensado para integrarse en el motor Piper y en cualquier sistema que consuma modelos ONNX de TTS. Su rasgo distintivo es la trazabilidad completa de los datos: se ha entrenado exclusivamente con las grabaciones propias del autor, liberadas como CC0, sin ningún checkpoint de terceros (como lessac) en su historial.

El modelo resuelve un problema concreto de licenciamiento: la voz anterior del mismo autor, `de_DE-thorsten-medium`, se había afinado a partir del checkpoint `lessac`, lo que dejaba en una zona gris el uso comercial. Esta versión, al partir de un entrenamiento desde cero sobre datos propios y pasar por Piper-Scratch y Piper-Base, permite uso comercial sin atribución.

Es relevante ahora porque ofrece una voz masculina alemana limpia, con licencia permisiva total, para asistentes de voz, domótica (Home Assistant) y aplicaciones embebidas. El repositorio ocupa 1,8 GB e incluye el modelo ONNX listo para usar, checkpoints de entrenamiento y muestras de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS), calidad `medium`, framework piper1-gpl |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS por utterance; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (exportación ONNX; sin datos de cuantización publicados) |
| Idiomas soportados | alemán (de) |
| Licencia | CC0-1.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx.json`) y checkpoints PyTorch (`.ckpt`) |
| Frecuencia de muestreo | 22.05 kHz (remuestreo desde 44.1 kHz) |
| Speaker | único, masculino (Thorsten Müller) |
| Dataset de entrenamiento | Thorsten-Voice/TV-44kHz-Full (CC0), subconjunto 2022.10-Neutral |

## Arquitectura y entrenamiento

El modelo es un VITS de calidad `medium` entrenado con piper1-gpl, la implementación GPL del motor Piper. VITS combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial en un esquema de entrenamiento conjunto, lo que produce habla natural sin necesidad de un vocoder separado en inferencia. La exportación final a ONNX permite ejecución ligera en CPU.

El entrenamiento sigue una cadena de procedencia completamente CC0: primero Piper-Scratch, entrenado desde inicialización aleatoria sobre Thorsten-Voice 2022.10 (~10 h, 1800 épocas); después Piper-Base, con warmstart sobre Thorsten-Voice 2021.02 + 2022.10 (~32 h, 1000 épocas); y finalmente esta voz, afinada con warmstart desde la época 961 de Piper-Base sobre 2022.10-Neutral (12.233 utterances, ~9,7 h, 200 épocas). El checkpoint publicado corresponde a la época 133 (mejor `val_mel` = 0,3789).

El preprocesado de audio incluye recorte de silencios con padding de 0,15 s, normalización de sonoridad a −23 LUFS, limitación de picos a −1 dBFS y remuestreo de 44,1 kHz a 22,05 kHz con soxr VHQ. Se eliminaron clips con comentarios, duraciones fuera de 0,8–15 s, tasas de caracteres por segundo implausibles y clipping. No se documenta RLHF ni DPO, algo esperable en un modelo TTS.

## Capacidades

- Síntesis de voz en alemán para texto arbitrario, con un único hablante masculino.
- Control de velocidad mediante `length_scale` (aumentar para habla más lenta, reducir para más rápida).
- Control de expresividad y variabilidad mediante `noise_scale` (0,667 por defecto) y `noise_w` (0,8 por defecto).
- Inferencia en CPU y GPU a través de ONNX Runtime, con integración directa en Piper.
- Uso como voz personalizada en Home Assistant y otras integraciones Piper.
- Posibilidad de seguir afinando a partir de los checkpoints incluidos (generador y discriminador).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente TTS.
- Capacidad multilingüe limitada al alemán; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz en domótica: integrar el `.onnx` y su `.onnx.json` en el directorio de voces de Home Assistant para respuestas habladas en alemán con licencia CC0, sin preocupación por atribución.
- Lectura de notificaciones y alertas: generar avisos de voz dinámicos en alemán desde scripts, dado el bajo coste de inferencia en CPU de un modelo `medium`.
- Audiolibros y contenido accesible: sintetizar texto largo por utterance con control de velocidad mediante `length_scale`, útil para podcasts o lectura asistida.
- Sistemas embebidos y edge: el formato ONNX y el tamaño `medium` permiten ejecución en dispositivos sin GPU dedicada, con ONNX Runtime.
- Prototipado de interfaces conversacionales: cadena STT + LLM + esta voz para demos de asistentes en alemán, aprovechando la licencia permisiva para distribución.
- Productos comerciales de TTS: al ser CC0 sin atribución, puede embeberse en aplicaciones propietarias, a diferencia de la voz previa basada en lessac.
- Investigación en TTS: los checkpoints por época y los logs de TensorBoard permiten estudiar el efecto del preprocesado y del warmstart en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una comparación A/B informal, con un solo oyente (el autor), sobre 21 pares de frases: la pronunciación y el énfasis resultaron casi idénticos frente a `de_DE-thorsten-medium`, y la nueva voz se percibió como menos ruidosa y con menos reverberación en los 21 pares. No es un estudio formal de escucha.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras publicadas; un VITS `medium` en ONNX es ligero y habitualmente se ejecuta en CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia en CPU vía ONNX Runtime.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna, aunque no hay cifras oficiales de memoria.
- Opciones de despliegue: Piper (`piper-tts`, `piper1-gpl`), ONNX Runtime, Home Assistant y otras integraciones Piper.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: repositorio de 1,8 GB (incluye checkpoints y muestras); el par `.onnx` + `.onnx.json` es la parte necesaria para inferencia.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Piper-Thorsten-CC0 | Alemán | VITS medium (Piper) | CC0-1.0 | ONNX + ckpt | Entrenado solo con datos CC0 propios |
| de_DE-thorsten-medium | Alemán | VITS medium (Piper) | Situación comercial poco clara (fine-tune de lessac) | ONNX | Predecesor; el autor lo percibe como más ruidoso |
| Piper-Base (Thorsten-Voice) | Alemán | VITS medium (Piper) | CC0 (según procedencia) | ONNX + ckpt | Modelo base del que deriva esta voz, ~32 h de datos |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Un solo hablante masculino y un solo idioma (alemán); no sirve para otras lenguas ni para cambio de voz.
- Riesgo de alucinación acústica: como todo TTS, puede producir pronunciaciones erróneas en palabras extranjeras, siglas o nombres propios no vistos en entrenamiento.
- La comparación de calidad es una impresión subjetiva de un único oyente, no un estudio formal; conviene evaluar con las muestras incluidas.
- Sin datos publicados de parámetros, cuantización, latencia ni benchmarks objetivos.
- El modelo está exportado desde la época 133 (mejor validación), no desde la 199; el checkpoint final puede diferir en calidad.
- Licencia CC0-1.0: permite uso comercial sin atribución, pero conviene verificar la licencia del código piper1-gpl (GPL) si se redistribuye el software, ya que es independiente de la licencia de los pesos.
- No se documentan sesgos específicos más allá de los inherentes a un corpus de un único hablante y estudio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thorsten-Voice/Piper-Thorsten-CC0
- Modelo base: https://huggingface.co/Thorsten-Voice/Piper-Base
- Dataset: https://huggingface.co/datasets/Thorsten-Voice/TV-44kHz-Full
- Framework piper1-gpl: https://github.com/OHF-Voice/piper1-gpl
- Muestras de audio: https://huggingface.co/Thorsten-Voice/Piper-Thorsten-CC0/tree/main/samples
- Config del modelo: https://huggingface.co/Thorsten-Voice/Piper-Thorsten-CC0/blob/main/onnx/de_DE-thorsten_cc0-medium.onnx.json
