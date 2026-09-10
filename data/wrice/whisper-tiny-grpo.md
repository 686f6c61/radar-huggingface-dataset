# wrice/whisper-tiny-grpo

## Resumen

wrice/whisper-tiny-grpo es un ajuste fino de openai/whisper-tiny, el modelo de reconocimiento automático del habla (ASR) de 37,7 millones de parámetros publicado por OpenAI. Lo desarrolla el usuario wrice y se distribuye con licencia MIT a través de HuggingFace. El checkpoint mantiene la arquitectura Whisper intacta (transformer encoder-decoder con preprocesado de espectrograma mel) y solo modifica los pesos mediante un proceso de aprendizaje por refuerzo, etiquetado en el repositorio como GRPO (Group Relative Policy Optimization).

La innovación declarada no está en la arquitectura, sino en el procedimiento de ajuste: en lugar del fine-tuning supervisado clásico con cross-entropy sobre transcripciones de referencia, el autor aplica GRPO sobre el dataset mozilla-foundation/common_voice_26_0. GRPO es la técnica de optimización de política relativa por grupos popularizada por DeepSeekMath y DeepSeek-R1, y su aplicación a ASR es poco habitual, lo que convierte a este checkpoint en un artefacto fundamentalmente de investigación más que en un modelo listo para producción.

El modelo conserva la cobertura multilingüe de Whisper-tiny, con 79 idiomas declarados en las etiquetas del repositorio, y un tamaño de repositorio de 0,2 GB en formato safetensors. Los resultados publicados son modestos: un WER global del 62,26 % y un CER del 27,89 % sobre el split de test de Common Voice 26.0, con valores marcadamente peores en idiomas de bajos recursos (90,59 % de WER en amárico, 88,96 % en afrikáans). Todos los resultados figuran como no verificados en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (base: openai/whisper-tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura Whisper procesa ventanas de audio de 30 segundos (1500 frames de espectrograma mel) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se documentan cuantizaciones GGUF, int8 ni fp16 empaquetadas |
| Idiomas soportados | 79 idiomas declarados: af, am, ar, as, az, ba, be, bg, bn, br, ca, cs, cy, da, de, el, en, es, et, eu, fa, fi, fr, gl, ha, he, hi, ht, hu, hy, id, is, it, ja, ka, kk, km, ko, lo, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, nn, oc, pa, pl, ps, pt, ro, ru, sd, sk, sl, sq, sr, sv, sw, ta, te, tg, th, tk, tr, tt, uk, ur, uz, vi, yi, yo, yue, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño de repositorio: 0,2 GB) |
| Libreria declarada | transformers |
| Pipeline | automatic-speech-recognition |
| Dataset de ajuste | mozilla-foundation/common_voice_26_0 |
| Modelo base | openai/whisper-tiny |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-tiny sin cambios estructurales: un transformer encoder-decoder con atención completa. El encoder consume una representación log-Mel de 80 canales calculada sobre ventanas de 30 segundos (1500 posiciones temporales) y el decoder genera tokens de texto de forma autorregresiva, con un vocabulario multilingüe compartido que incluye tokens de control de idioma y de tarea (transcripción o traducción). El conteo de parámetros del checkpoint (37.760.640) coincide con la variante multilingüe de whisper-tiny.

El entrenamiento se describe únicamente mediante la etiqueta GRPO y el dataset Common Voice 26.0. No se documentan en la model card el número de tokens de audio procesados, la composición exacta del dataset, la función de recompensa utilizada (habitualmente una combinación de WER/CER u otra métrica de similitud en GRPO aplicado a ASR), el tamaño de grupo, la tasa de aprendizaje, el número de pasos ni si hubo una fase previa de fine-tuning supervisado. Tampoco se especifica si el ajuste cubrió los 79 idiomas por igual o solo un subconjunto. Esta ausencia de detalle impide reproducir el entrenamiento a partir de la información publicada.

La innovación destacable es, por tanto, metodológica: aplicar optimización de política con recompensa basada en métricas de error de transcripción en lugar de minimización directa de cross-entropy. Es un enfoque alineado con la línea de trabajo que DeepSeek popularizó para razonamiento, trasladado aquí a un dominio de salida secuencial fuertemente condicionada por la señal acústica.

## Capacidades

- Reconocimiento automático del habla multilingüe en 79 idiomas, con un único checkpoint.
- Transcripción de audio de hasta 30 segundos por ventana; para audios más largos es necesario aplicar segmentación externa.
- Tarea de traducción de voz a texto en inglés, heredada del diseño original de Whisper (los tokens de tarea `transcribe` y `translate` forman parte de la arquitectura base).
- Funcionamiento sin conexión y con huella de memoria mínima, apto para despliegue en dispositivos con recursos limitados.
- No se declara soporte de tool calling, function calling ni uso como agente.
- No se declara modo de razonamiento extendido (thinking mode).
- No hay capacidades de visión, audio-vision ni procesamiento de vídeo.
- No se declaran marcas de tiempo a nivel de palabra ni diarización de hablantes; requerirían herramientas externas como WhisperX.
- Detección de idioma implícita mediante el token de idioma del decoder, no documentada de forma explícita por el autor.

## Casos de uso

- Transcripción en el borde (edge computing): con 37,7 millones de parámetros y un peso en fp32 de aproximadamente 151 MB, el modelo cabe en dispositivos móviles, Raspberry Pi o sistemas embebidos, lo que permite dictado y notas de voz sin enviar audio a la nube.
- Preetiquetado de corpus de audio a gran escala: dado su bajo coste computacional, sirve como anotador inicial de grandes volúmenes de audio que después se revisan o se filtran con un modelo mayor, reduciendo el coste de anotación humana.
- Prototipado e investigación en RL para ASR: es un banco de pruebas barato para experimentar con GRPO, funciones de recompensa basadas en WER/CER y comparativas frente a fine-tuning supervisado, sin necesidad de clústeres de GPU.
- Indexación y búsqueda sobre archivos de audio: transcribir grabaciones, podcasts o reuniones para construir índices de texto consultables, aceptando una calidad de transcripción limitada dado el WER declarado.
- Subtitulado automático de vídeo en múltiples idiomas: generar subtítulos preliminares en 79 idiomas que después se corrigen manualmente o se pasan por un modelo mayor para refinado.
- Accesibilidad y transcripción en entornos offline: sistemas de ayuda a personas con discapacidad auditiva en kioscos, aulas o salas de reunión sin conectividad, donde la latencia baja y la ausencia de dependencia de red priman sobre la precisión absoluta.
- Filtrado y control de calidad de datasets: usar la salida del modelo sobre un corpus y comparar con transcripciones humanas para detectar muestras ruidosas o mal alineadas antes de entrenar modelos de mayor tamaño.
- Módulo ASR dentro de un pipeline de voz conversacional: como primer eslabón de un sistema VAD → ASR → LLM → TTS, en escenarios donde el reconocimiento exacto importa menos que la detección de intención.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, evaluados sobre el split de test de Common Voice 26.0. Todos figuran con `verified: false`, es decir, no han sido comprobados de forma independiente. La información disponible solo incluye los siguientes configuraciones; el model-index del repositorio está truncado y no se han proporcionado el resto de idiomas.

| Configuracion | WER | CER |
|---|---|---|
| overall | 0,6226 | 0,2789 |
| af (afrikáans) | 0,8896 | 0,4220 |
| am (amárico) | 0,9059 | 0,6430 |
| ar (árabe) | 0,9494 | 0,3204 |
| as (asamés) | 0,5186 | 0,2943 |
| az (azerí) | 0,8996 | 0,6863 |
| ba (baskir) | 0,6061 | 0,2066 |
| be (bielorruso) | 0,6098 | 0,1651 |
| bg (búlgaro) | 0,6054 | 0,2055 |
| bn (bengalí) | 0,5108 | 0,3422 |
| br (bretón) | 0,6957 | 0,3180 |
| ca (catalán) | 0,4281 | 0,1578 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, dado que el modelo es exclusivamente de reconocimiento de habla. Tampoco se ofrecen comparaciones directas contra el checkpoint base openai/whisper-tiny en el mismo split, por lo que no es posible cuantificar la mejora atribuible al ajuste con GRPO.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,15 GB en fp32 y 0,08 GB en fp16 solo para los pesos; el consumo real depende del framework y del tamaño de lote. Son estimaciones derivadas del conteo de parámetros, no mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU moderna es suficiente. Para lotes grandes en servidor, una NVIDIA T4, L4, A10, RTX 3090/4090 o A100/H100 ofrecen margen de sobra. No se requiere memoria unificada ni aceleradores especiales.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de los últimos diez años, incluidas GTX 1060, RTX 2060, RTX 3060 y superiores. También funciona en CPU.
- CPU: la inferencia en CPU es viable y rápida en comparación con modelos Whisper mayores; es una de las ventajas prácticas de esta variante.
- Opciones de despliegue: pipeline ASR de HuggingFace Transformers, faster-whisper (CTranslate2, requiere conversión), WhisperX (requiere conversión y añade alineación y diarización), whisper.cpp (requiere conversión a formato GGML, no incluida en el repositorio) y servidores compatibles con Transformers. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp para este checkpoint concreto.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia, RTF (real-time factor) ni tokens por segundo para este checkpoint.
- Almacenamiento: 0,2 GB de repositorio, trivial para cualquier entorno.

## Comparativa con modelos similares

La siguiente tabla recoge especificaciones públicas de los modelos de la misma familia. Los datos de WER corresponden a este checkpoint; para las alternativas no se dispone de resultados comparables en el mismo split dentro de la información proporcionada.

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | WER en Common Voice 26.0 (overall) |
|---|---|---|---|---|---|
| wrice/whisper-tiny-grpo | 37,76 M | 30 s por ventana | 79 declarados | MIT | 0,6226 (declarado, no verificado) |
| openai/whisper-tiny | 39 M (aprox.) | 30 s por ventana | 99 (modelo original) | MIT | no disponible en esta comparativa |
| openai/whisper-base | 74 M (aprox.) | 30 s por ventana | 99 (modelo original) | MIT | no disponible en esta comparativa |
| openai/whisper-small | 244 M (aprox.) | 30 s por ventana | 99 (modelo original) | MIT | no disponible en esta comparativa |

No se han identificado en la búsqueda web alternativas específicas de ajuste con GRPO sobre Whisper-tiny con las que comparar de forma directa.

## Limitaciones y advertencias

- Calidad de transcripción limitada: un WER global del 62,26 % sobre Common Voice 26.0 sitúa al modelo muy por debajo de lo aceptable para producción sin revisión humana. Como referencia interna, en varios idiomas el WER supera el 88 %.
- Resultados no verificados: los valores de WER y CER proceden del propio autor y están marcados como `verified: false`. No hay evaluación independiente.
- Idiomas de bajos recursos especialmente débiles: afrikáans (0,8896), amárico (0,9059) y azerí (0,8996) presentan tasas de error que hacen inviable su uso directo.
- Alucinaciones: los modelos Whisper son propensos a generar texto plausible en tramos de silencio, ruido o audio musical, y a caer en bucles de repetición. El ajuste con GRPO no incorpora, según la información disponible, ningún mecanismo específico para mitigarlo.
- Confusión y cambio de idioma: Whisper puede producir texto en un idioma distinto al hablado, especialmente en audios cortos o ruidosos, y puede traducir en lugar de transcribir si el token de tarea no se fija correctamente.
- Sin documentación del entrenamiento: no se especifican tokens, hiperparámetros, función de recompensa, pasos ni cobertura real de idiomas. Esto impide reproducibilidad y dificulta evaluar la validez metodológica del resultado.
- Sesgos de datos: Common Voice tiene una distribución demográfica, acústica y dialectal concreta, y los sesgos de acento, edad, género y origen del corpus se trasladan al modelo.
- Sin validación comunitaria: el repositorio registra cero descargas y cero "me gusta", sin issues ni discusiones públicas, por lo que no existe evidencia externa de su comportamiento.
- Ventana de 30 segundos: los audios largos requieren segmentación externa, con riesgo de errores en los límites y pérdida de contexto entre fragmentos.
- Sin marcas de tiempo ni diarización: para subtitulado o transcripción de reuniones se necesitan herramientas adicionales como WhisperX.
- Licencia: MIT, que permite uso comercial, modificación y redistribución, siempre manteniendo el aviso de copyright. La licencia del modelo base openai/whisper-tiny es también MIT, por lo que no hay conflicto.
- Fechas del repositorio: creado y actualizado el 10 de septiembre de 2026, sin historial posterior de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wrice/whisper-tiny-grpo
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/mozilla-foundation/common_voice_26_0
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Los resultados de la búsqueda web disponible no contienen enlaces relacionados con este modelo; todas las referencias encontradas corresponden a páginas de ayuda de YouTube y no se han utilizado.
