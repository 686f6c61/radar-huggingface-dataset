# yusufblbl/faster-whisper-large-v3-turbo-turkish-verasist

## Resumen

Faster Whisper Large-v3 Turbo Turkish Verasist es una conversión a CTranslate2 en FP16 del modelo de reconocimiento automático del habla (ASR) `yusufblbl/whisper-large-v3-turbo-turkish-verasist`, un ajuste fino en turco de Whisper Large-v3 Turbo de OpenAI. El autor, `yusufblbl`, parte del checkpoint `selimc/whisper-large-v3-turbo-turkish` y aplica cuatro rondas de entrenamiento LoRA, seleccionando la ronda 4 (paso 2000 del optimizador) según la WER de validación. Este repositorio distribuye únicamente los pesos convertidos con CTranslate2 4.5.0, listos para su uso con la librería `faster-whisper`.

El modelo resuelve el problema de transcripción de audio en turco con un compromiso entre precisión y velocidad: la variante Turbo de Whisper reduce el número de capas del decoder respecto a Large-v3, y el formato CTranslate2 con cuantización FP16 acelera la inferencia en GPU. El padre BF16 reporta una WER del 7,5895 % en una partición fija de validación de 1.884 registros del dataset `cubukcum/TurkishVoiceDataset`, frente al 11,9936 % de su línea base; estas cifras corresponden al checkpoint padre y no a una evaluación independiente de esta exportación CT2.

Es relevante para desarrolladores que necesiten ASR en turco desplegable en producción con latencia baja, ya que se integra con `faster-whisper` y servidores compatibles como Speaches. La licencia MIT y el tamaño del repositorio (1,6 GB) facilitan su adopción, aunque el propio autor advierte de que las etiquetas de entrenamiento son mayoritariamente no verificadas y de que la partición de test no se ha evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large-v3 Turbo), convertido a CTranslate2 |
| Parametros totales | no disponible (repo de 1,6 GB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; no especificada en la información) |
| Tipos de cuantizacion | float16 (FP16) en CTranslate2 |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin), con tokenizer.json y preprocessor_config.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper Large-v3 Turbo, un transformer encoder-decoder con atención estándar diseñado para ASR multilingüe; la variante Turbo reduce el decoder respecto a Large-v3 para disminuir la latencia. Sobre la base `selimc/whisper-large-v3-turbo-turkish` (derivada de OpenAI Whisper Turbo) se aplicaron cuatro rondas de ajuste fino con LoRA, seleccionando la ronda 4 en el paso 2000 del optimizador según la WER de validación. El entrenamiento usó 73.778 registros (74,86 horas) de `cubukcum/TurkishVoiceDataset`, con etiquetas mayoritariamente no verificadas.

La conversión a CTranslate2 4.5.0 se realizó con `--quantization float16 --copy_files tokenizer.json preprocessor_config.json`. No se especifican en la información disponible detalles sobre composición exacta del dataset, uso de RLHF/DPO ni innovaciones adicionales más allá de la propia conversión y el ajuste LoRA. Las grabaciones nuevas de Verasist no se usaron para entrenar esta versión ni se incluyen en el repositorio.

## Capacidades

- Reconocimiento automático del habla (ASR) en turco, con salida de texto por segmentos.
- Transcripción con detección de actividad de voz (VAD) mediante `vad_filter=True`.
- Decodificación con `beam_size` configurable (el ejemplo de la model card usa `beam_size=1`).
- Ejecución en GPU NVIDIA con `compute_type="float16"` a través de `faster-whisper`.
- Integración con servidores compatibles con el identificador de modelo de Speaches.
- No se documentan capacidades de traducción, diarización, timestamps por palabra ni tool calling en la información disponible.
- No es una arquitectura de streaming nativa: el servicio en tiempo real requiere buffering de audio, VAD y transcripción por fragmentos o enunciados.

## Casos de uso

- Transcripción de reuniones y llamadas en turco: el modelo convierte audio multi-hablante en texto por segmentos; conviene aplicar VAD para separar enunciados y gestionar la latencia según la duración del audio.
- Subtitulado de contenido audiovisual en turco: se puede procesar cada pista de audio y generar segmentos de texto alineados temporalmente, con revisión humana posterior dada la naturaleza no verificada de las etiquetas de entrenamiento.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones de soporte para alimentar sistemas de búsqueda o analítica; el autor indica que las grabaciones de Verasist no se usaron para entrenar esta versión, lo que evita filtración directa de ese dominio.
- Dictado y notas de voz: integración en aplicaciones de productividad que conviertan audio corto en texto mediante `faster-whisper` en GPU, con `beam_size=1` para minimizar latencia.
- Pipeline de datos para entrenamiento de modelos de lenguaje en turco: generación de transcripciones a gran escala de corpus de audio, con control de calidad posterior por la fiabilidad limitada de las etiquetas.
- Despliegue en servidores de inferencia ASR: uso del identificador de modelo en Speaches o en servicios propios basados en CTranslate2 para exponer una API de transcripción en turco.
- Investigación en ASR de bajo recurso: punto de partida para experimentos de ajuste fino con LoRA sobre Whisper Turbo en turco, comparando contra la línea base reportada.

## Benchmarks y rendimiento

| Modelo / checkpoint | Conjunto de evaluación | WER |
|---|---|---|
| Padre BF16 base+adapter (ronda 4, paso 2000) | 1.884 registros fijos de validación de `cubukcum/TurkishVoiceDataset` | 7,5895 % |
| Línea base del padre | Misma partición de validación | 11,9936 % |
| Esta exportación FP16 CT2 | No evaluada con WER completo | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR. La partición de test reservada no ha sido evaluada según la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,6 GB en FP16, por lo que la inferencia en GPU requiere al menos ese orden de magnitud más overhead de runtime.
- GPU recomendadas: NVIDIA con soporte de FP16; la model card solo documenta `device="cuda"` con `compute_type="float16"`, sin listar modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no se confirma en la información disponible; el tamaño FP16 de 1,6 GB sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegue: `faster-whisper` (CTranslate2), Speaches (identificador `yusufblbl/faster-whisper-large-v3-turbo-turkish-verasist`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card indica que la latencia extremo a extremo depende de la longitud del audio, los ajustes de VAD, la carga de la GPU y la red, y que Whisper no es streaming nativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| faster-whisper-large-v3-turbo-turkish-verasist (este) | no disponible (repo 1,6 GB FP16) | no disponible | WER 7,5895 % en validación del padre | MIT | HuggingFace, CTranslate2 |
| `selimc/whisper-large-v3-turbo-turkish` (base del ajuste) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `yusufblbl/whisper-large-v3-turbo-turkish-verasist` (padre BF16) | no disponible | no disponible | WER 7,5895 % en validación | MIT | HuggingFace |
| OpenAI Whisper Large-v3 Turbo (original) | no disponible | no disponible | no disponible en la información | MIT (upstream) | HuggingFace, OpenAI |

No se dispone de datos de benchmarks comparativos con otras alternativas ASR en turco en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son mayoritariamente no verificadas, lo que puede introducir errores sistemáticos en las transcripciones.
- La partición de test reservada no se ha evaluado; el rendimiento en datos no vistos es incierto.
- Esta exportación FP16 CT2 no ha pasado la evaluación completa de WER; las cifras reportadas describen el checkpoint padre, no esta conversión.
- El modelo está especializado únicamente en turco; no se documenta soporte multilingüe.
- Whisper no es streaming nativo: el servicio en tiempo real requiere buffering, VAD y transcripción por fragmentos, con latencia variable.
- Riesgo de alucinación en audio con ruido, silencios largos o habla solapada, inherente a los modelos Whisper.
- No se distribuyen audio ni transcripciones originales en el repositorio; el dataset fuente declara CC0-1.0.
- Licencia MIT con atribución a OpenAI y Selim Cavas; no se indican restricciones adicionales para uso comercial, pero conviene revisar la licencia upstream de Whisper.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/yusufblbl/faster-whisper-large-v3-turbo-turkish-verasist
- Modelo padre (BF16): https://huggingface.co/yusufblbl/whisper-large-v3-turbo-turkish-verasist
- Base del ajuste fino: https://huggingface.co/selimc/whisper-large-v3-turbo-turkish
- Dataset de entrenamiento: https://huggingface.co/datasets/cubukcum/TurkishVoiceDataset
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- OpenAI Whisper: https://github.com/openai/whisper
