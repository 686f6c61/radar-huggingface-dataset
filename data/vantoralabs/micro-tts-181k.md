# VantoraLabs/micro-tts-181k

## Resumen

MicroTTS 181K es un sistema completo de texto a voz (TTS) en inglés publicado por VantoraLabs en HuggingFace, con tan solo 181.189 parámetros repartidos en tres redes convolucionales diminutas (duration, acoustic y decoder) más un front-end de grafema a fonema (G2P) basado en diccionario. El modelo genera audio mono a 24 kHz y está diseñado para ejecutarse en CPU en tiempo real, sin GPU y sin dependencias pesadas: el G2P funciona solo con NumPy y no requiere espeak, torch ni acceso a red.

La relevancia del modelo está en su relación tamaño/prestaciones: con menos de 0,2 millones de parámetros logra un WER de 0,007 sobre un conjunto de evaluación con plantillas (119 de 128 frases exactas) y una velocidad de aproximadamente 97x tiempo real en CPU (RTF 0,010). Se entrenó por destilación desde un profesor TTS mayor, del que los tres estudiantes aprenden a reproducir representaciones intermedias (duraciones por fonema y espectrograma mel de 100 bandas).

La naturalidad, sin embargo, es baja según las propias métricas del autor: SCOREQ 1,03, UTMOS 1,33 y DNSMOS-OVRL 2,57 sobre un conjunto diverso de 24 frases. Es, por tanto, un modelo orientado a inteligibilidad y eficiencia extrema más que a calidad expresiva. La licencia es MIT para runtime y pesos, y Apache-2.0 para los datos G2P incluidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de tres redes convolucionales 1D (duration, acoustic y decoder ConvNeXt1D) más front-end G2P de diccionario con fallback neuronal |
| Parametros totales | 181.189 (duration 13.864 + acoustic 65.299 + decoder 102.026) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: procesa una frase por inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (único idioma declarado; diccionarios G2P de inglés) |
| Licencia | MIT (runtime y pesos); datos G2P incluidos bajo Apache-2.0 |
| Formato de pesos | PyTorch (.pt): duration.pt, acoustic.pt, decoder.pt; datos G2P en NumPy |
| Frecuencia de muestreo | 24 kHz mono |
| Representacion intermedia | Espectrograma mel de 100 bandas (n_fft 1024, hop 256) |
| Vocabulario fonetico | 62 simbolos IPA congelados, con `<bos>` y `<eos>` |
| Pipeline declarado | text-to-speech |
| Tamano del repositorio | 0,0 GB |
| Fecha de publicacion | 2026-09-13 |

## Arquitectura y entrenamiento

El sistema convierte texto en audio en cuatro etapas. Primero, un front-end G2P de tipo diccionario primero: cada palabra se busca en diccionarios de pronunciación incluidos (gold y silver) y, si no aparece, se resuelve con un pequeño modelo neuronal de respaldo; la salida es una cadena de fonemas IPA mapeada al vocabulario de 62 símbolos. Después, el estudiante de duración (3 capas convolucionales 1D con bloques residuales, características aprendidas de posición, longitud de secuencia y duración) predice cuántos frames mel ocupa cada fonema, con la log-duración exponenciada, redondeada y limitada a un mínimo de un frame por fonema. El estudiante acústico (el mayor de los tres) embebe los ids de fonemas, los refina con convoluciones de contexto, los expande a la rejilla de frames repitiendo cada fonema sus frames predichos y proyecta a 100 bandas mel. Por último, el decoder ConvNeXt1D (depthwise conv, LayerNorm, dos capas pointwise con GELU entre ellas y residual) mapea el mel a un espectro complejo de 513 bins que la iSTFT convierte en audio; la cabeza de magnitud es exponencial con el bin 0 y el de Nyquist anulados, y un filtro de bloqueo de continua elimina el offset restante. El decoder es *noise-fed*: recibe 4 canales de ruido proyectados que se suman al embedding del mel, aunque en inferencia el propio autor indica que el mejor resultado se obtiene con ruido cero.

El entrenamiento es íntegramente por destilación desde un profesor TTS mayor (el script `train/build_pack.py` usa Kokoro-82M): se renderiza un corpus de texto (miles de frases de estilo hablado y variado) y se almacenan ids de fonemas, audio, duraciones por fonema y mel del profesor, un `.npz` por línea. El estudiante de duración se entrena con smooth-L1 sobre log-duración más un término de longitud total (peso 0,35), AdamW con learning rate 2e-3, unas 4.000 iteraciones con batch 32 (~10 minutos); el autor señala que hidden size 20 es el punto óptimo y que los tamaños 14, 18 y 22 dieron peor habla extremo a extremo. El estudiante acústico usa L1 más convergencia espectral y, desde la iteración 1000, un crítico PatchGAN sobre el mel (hinge loss, peso 0,1) para evitar el mel excesivamente suavizado; el learning rate de 2e-3 se describe como el ajuste más crítico (a tasas menores el modelo infraajusta de forma no evidente en la loss). El decoder no se entrena desde cero: se inicializa recortando los primeros N canales del decoder de un vocoder neuronal preentrenado (`train/init_decoder.py` recorta Vocos: backbone de 512 dimensiones, 4 bloques ConvNeXt, pw 1536), se recupera con L1 de onda más pérdida espectral multiresolución y loudness matching (unas 20.000 iteraciones, batch 4, solo mels del profesor) y después se continúa con mezcla 50/50 de mels del profesor y del estudiante acústico (otras ~20.000 iteraciones), etapa descrita como determinante para la transferencia. No se documenta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida mono a 24 kHz.
- Conversión grafema-fonema mediante diccionario de pronunciación más fallback neuronal, sin espeak ni acceso a red.
- Predicción explícita de duraciones por fonema, lo que permite controlar la temporización a nivel de fonema.
- Inferencia en CPU en tiempo real (~97x tiempo real, RTF 0,010) y en GPU antigua de gama baja (~85x, RTF 0,010).
- Generación de variación mediante entrada de ruido de 4 canales en el decoder, aunque el autor recomienda ruido cero en inferencia por calidad.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades multilingües: solo inglés.
- No se documentan modos especiales (pensamiento, visión, audio de entrada, clonación de voz, control de emoción o de hablante).

## Casos de uso

- Lectura de notificaciones y avisos en aplicaciones de escritorio o servidores sin GPU: el modelo cabe en CPU y sintetiza a ~97x tiempo real, por lo que puede generar avisos cortos bajo demanda sin coste de acelerador.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla o de documentos en inglés con un componente de menos de 0,2 M de parámetros, integrable en aplicaciones ligeras donde un TTS de cientos de millones de parámetros sería inviable.
- Sistemas embebidos e IoT: asistentes de voz locales en dispositivos con CPU modesta (por ejemplo, placas tipo Raspberry Pi), ya que los pesos ocupan del orden de 0,7 MB en fp32 y el front-end G2P solo depende de NumPy.
- Prompts de voz para telefonía e IVR: mensajes fijos y plantillas en inglés donde prima la inteligibilidad (WER 0,007 en el conjunto con plantillas) y la latencia baja (RTF 0,010) sobre la naturalidad.
- Pre-generación por lotes de audio para documentación técnica, informes o resúmenes en inglés: la velocidad en CPU permite renderizar grandes volúmenes de texto en minutos sin ocupar GPU.
- Pruebas automatizadas en CI/CD: generar audio de referencia en cada build para verificar pipelines de audio, ya que la inferencia es rápida y determinista (ruido cero) y no requiere hardware especial.
- Investigación en destilación de modelos diminutos: la receta completa (pack de profesor, estudiante de duración, estudiante acústico, inicialización del decoder desde un vocoder y mezcla z-mix) está descrita paso a paso y es reproducible en minutos por etapa.
- Audiolibros o narración de contenido técnico en inglés donde el objetivo sea comprensión, no expresividad, y se quiera evitar coste de API por carácter.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| WER | 0,007 (119/128 frases exactas) | Conjunto de evaluación con plantillas |
| SCOREQ | 1,03 | Conjunto diverso de 24 frases |
| UTMOS | 1,33 | Conjunto diverso de 24 frases |
| DNSMOS-OVRL | 2,57 | Conjunto diverso de 24 frases |
| Velocidad en CPU | ~97x tiempo real (RTF 0,010) | No especificado |
| Velocidad en GPU | ~85x tiempo real en una GPU económica de 2014 | No especificado |

No se han publicado resultados de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni cifras comparativas frente a otros sistemas TTS más allá de las métricas propias del autor. Las cifras de naturalidad (SCOREQ 1,03, UTMOS 1,33, DNSMOS-OVRL 2,57) proceden de un conjunto de solo 24 frases y el WER de un conjunto con plantillas, por lo que no deben extrapolarse a texto libre.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman 181.189 parámetros, aproximadamente 0,72 MB en fp32 y 0,36 MB en fp16; la memoria real está dominada por los búferes intermedios (mel de 100 bandas, espectro de 513 bins y audio a 24 kHz). No se publican cifras de VRAM medidas.
- GPU recomendadas: no se especifican; el autor reporta ~85x tiempo real en una GPU económica de 2014 (RTF 0,010), por lo que cualquier GPU moderna es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e incluso sin GPU, ya que el rendimiento declarado de ~97x tiempo real es sobre CPU.
- Despliegue: runtime PyTorch (campo `library_name: pytorch`) con los checkpoints duration.pt, acoustic.pt y decoder.pt. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo TTS.
- Latencia y throughput: RTF 0,010 implica del orden de 10 ms de cómputo por segundo de audio generado, con un máximo aproximado de 97 segundos de audio por segundo de CPU.
- Dependencias de despliegue: el front-end G2P requiere únicamente NumPy; no necesita espeak, torch ni acceso a red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MicroTTS 181K | 181.189 | no aplica (una frase por inferencia) | WER 0,007 en conjunto con plantillas; UTMOS 1,33; ~97x tiempo real en CPU | MIT (pesos y runtime); G2P Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Kokoro-82M | 82 millones (según el nombre citado en la model card) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Vocos (decoder de vocoder) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

El único punto de comparación documentado es Kokoro-82M, usado como profesor en la destilación y por tanto con un número de parámetros aproximadamente 450 veces mayor; la model card no incluye cifras de rendimiento del profesor. Vocos aparece solo como fuente de inicialización del decoder (backbone de 512 dimensiones, 4 bloques ConvNeXt, pw 1536). No se dispone de datos de otros TTS pequeños comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: los diccionarios G2P y el vocabulario fonético están limitados al inglés; no se declara soporte de otros idiomas.
- Naturalidad baja: las métricas declaradas (SCOREQ 1,03, UTMOS 1,33, DNSMOS-OVRL 2,57) indican voz claramente sintética, adecuada para inteligibilidad pero no para aplicaciones que exijan realismo.
- Evaluación limitada: el WER de 0,007 se midió sobre un conjunto con plantillas (119/128 frases exactas) y la naturalidad sobre solo 24 frases diversas; no hay evaluación sobre texto libre, dominios abiertos ni voz conversacional.
- Riesgo de errores en palabras fuera de diccionario: el G2P depende de diccionarios incluidos y de un modelo de respaldo para las palabras no encontradas, lo que puede producir pronunciaciones incorrectas en nombres propios, siglas, términos técnicos o neologismos.
- Sin control de hablante ni de estilo documentado: no se describe selección de voz, clonación, emoción ni control prosódico más allá de las duraciones por fonema; la única fuente de variación declarada es la entrada de ruido del decoder, y el propio autor recomienda ruido cero en inferencia.
- Dependencia de la etapa de mezcla z-mix: un decoder entrenado solo con mels del profesor es frágil ante la salida más suave del estudiante acústico, lo que condiciona la reproducibilidad si se reentrena el pipeline.
- Sensibilidad a hiperparámetros: el autor indica que el learning rate de 2e-3 en el estudiante acústico y un hidden size de 20 en el de duración son críticos, y que desviaciones producen audio defectuoso sin que la loss lo refleje.
- Licencia permisiva pero con atribución parcial: los pesos y el runtime son MIT, mientras que los datos G2P incluidos son Apache-2.0, por lo que su redistribución debe mantener las condiciones correspondientes.
- Adopción nula verificable: el repositorio figura con 0 descargas, 0 likes y 0,0 GB de tamaño, y la model card está truncada en su última sección, por lo que no hay validación independiente de los resultados declarados.
- Sin datos sobre sesgos: no se documenta composición demográfica del corpus de entrenamiento ni análisis de sesgos acústicos o de acento; al derivarse de un corpus destilado de otro TTS, hereda los sesgos de pronunciación de ese profesor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VantoraLabs/micro-tts-181k
- Resultados de búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; las consultas devolvieron únicamente páginas de un medio de prensa italiano sin relación con el modelo.
- Referencias citadas dentro de la model card, sin URL proporcionada: Kokoro-82M (profesor TTS usado en `train/build_pack.py`) y Vocos (vocoder del que se recorta el decoder en `train/init_decoder.py`).
- Scripts internos mencionados en la model card, sin enlace directo disponible: `train/build_pack.py`, `train/init_decoder.py` y muestras de audio en `samples/`.
