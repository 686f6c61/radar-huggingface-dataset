# vksbhandary/buddy-pronunciation-en

## Resumen

Buddy-pronunciation-en es una conversión a ONNX con cuantización int8 del modelo `nrshoudi/speech_ocean_wav2vec_mdd`, un wav2vec2 (XLSR-53, aproximadamente 300 millones de parámetros) con cabeza CTC que transcribe habla en inglés a fonemas ARPAbet. Lo publica el usuario vksbhandary como componente del motor de evaluación de pronunciación de la aplicación de escritorio Buddy, que puntúa cómo pronuncia el usuario sin enviar el audio a ningún servidor. El problema que resuelve es concreto: dado un audio de habla y una secuencia de fonemas esperada, producir las puntuaciones CTC necesarias para calcular métricas de calidad de pronunciación (goodness of pronunciation, GOP) y detectar errores fonéticos.

La relevancia del artefacto es fundamentalmente de despliegue: reduce el peso de 1,26 GB a unos 317 MB y permite inferencia en CPU a 0,045× tiempo real (4 segundos de audio en unos 0,2 segundos sobre cuatro hilos de un Apple M2 Max). No hay reentrenamiento ni ajuste fino: solo cambia el formato y la precisión numérica de los pesos. La licencia es Apache-2.0, heredada del modelo fuente, y el único idioma declarado es el inglés.

Es, por tanto, una pieza de infraestructura para evaluación de pronunciación en local, no un modelo de propósito general. Su valor depende enteramente de la calidad del modelo original y de la cadena de alineamiento forzado que el integrador construya alrededor de sus salidas CTC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (XLSR-53) con cabeza CTC; conversión a ONNX con cuantización int8 |
| Parametros totales | aproximadamente 300 M (modelo fuente wav2vec2-large-xlsr-53) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada de audio a 16 kHz mono float32, normalizada por enunciado |
| Tipos de cuantizacion | int8 (único artefacto publicado: `model.int8.onnx`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, unos 317 MB); vocabulario en `vocab.json` y configuración en `model_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer convolucional wav2vec2 de tipo XLSR-53 con cabecera CTC. La entrada es audio mono a 16 kHz en float32, normalizado por enunciado según `model_config.json`; la salida son puntuaciones CTC sobre 127 tokens por cada trama de 20 ms. El vocabulario sigue el esquema de anotación de speechocean762: fonemas ARPAbet con dígitos de acentuación, más los símbolos especiales `*` (fonema distorsionado) y `<DEL>` (fonema omitido), con el índice 124 reservado para el blank de CTC.

No se documenta el entrenamiento del modelo fuente: el autor de la conversión indica explícitamente que los datos de entrenamiento no están documentados y que, dado que el vocabulario sigue el esquema de speechocean762, es muy probable que se entrenara con ese corpus, posiblemente incluyendo su conjunto de test, lo que inflaría las métricas reportadas sobre ese mismo corpus. La conversión en sí no introduce reentrenamiento ni ajuste fino: exporta los pesos del commit `8b4e2c140f773d6dec403d8db1d2b3ca67203c3c` del modelo fuente (SHA-256 `d69cba83c6c1991a5562b56c7ce45c6b72c89c7b26acf805d0d72c69bd539cfa`) y los cuantiza a int8, con el script `convert.py` incluido para reproducir el proceso verificando los pesos de origen.

## Capacidades

- Reconocimiento de fonemas en inglés: transcripción de habla a secuencias ARPAbet con acentuación, más marcas de distorsión (`*`) y omisión (`<DEL>`).
- Evaluación de pronunciación: proporciona log-posteriores CTC por trama que, tras alineamiento forzado con los fonemas esperados, permiten calcular puntuaciones GOP por fonema.
- Detección de errores de pronunciación: con umbrales de GOP calibrados, identifica fonemas mal pronunciados (F1 de 0,509 en speechocean762 con umbral 1,5).
- Inferencia local en CPU: ejecutable con onnxruntime sin GPU, adecuado para aplicaciones de escritorio y entornos sin conectividad.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No es multilingüe: solo inglés.
- No dispone de modo thinking, visión ni audio más allá del reconocimiento fonético descrito.

## Casos de uso

- Evaluación de pronunciación en aplicaciones de escritorio: el modelo se integra en el motor local de Buddy para puntuar al usuario fonema a fonema mediante GOP, sin enviar audio a servidores externos; su tamaño de 317 MB y su velocidad en CPU lo hacen viable en un equipo de usuario final.
- Práctica de idiomas offline: una app de aprendizaje puede alinear la pronunciación esperada de una palabra o frase (por ejemplo, desde el CMU Pronouncing Dictionary) con la salida CTC y mostrar qué fonemas concretos fallan, con latencia de unas décimas de segundo por enunciado.
- Herramientas de logopedia y entrenamiento fonético: comparación de la producción del hablante con su propio historial de puntuaciones, aprovechando la recomendación del autor de comparar contra la evolución personal y no contra un ideal, para reducir falsos positivos por acento.
- Investigación en evaluación automática de pronunciación: reproducción de experimentos de GOP sobre speechocean762 con un artefacto ligero y determinista, útil para prototipado rápido en CPU antes de escalar a GPU.
- Filtrado y control de calidad de corpus de audio: detección de segmentos con fonemas distorsionados u omitidos en grabaciones en inglés para priorizar revisión manual.
- Integración en pipelines de CI para evaluación de sistemas TTS o de conversión de voz: verificación automática de inteligibilidad fonética de audios sintéticos comparando la salida del reconocedor con la secuencia fonética esperada.
- Prototipos embebidos o de borde: al ejecutarse con onnxruntime y cuantización int8, puede desplegarse en dispositivos con recursos limitados donde un modelo de 1,26 GB en fp32 no cabría.

## Benchmarks y rendimiento

Evaluación con puntuación GOP: los fonemas esperados se alinean forzosamente con la salida CTC y cada fonema se puntúa por su log-posterior frente al mejor fonema competidor en sus tramas.

speechocean762 (inglés no nativo, hablantes de mandarín como L1), 600 enunciados aleatorios de test, 11.668 fonemas, frente a las puntuaciones humanas de precisión por fonema:

| Metrica | Modelo completo | Este modelo int8 |
|---|---|---|
| Correlación de Pearson, nivel de fonema | 0,588 | 0,579 |
| F1 de detección de mala pronunciación (fonemas con puntuación inferior a 1,5) | 0,515 | 0,509 |
| Concordancia con las puntuaciones GOP del modelo completo (correlación, 60 enunciados) | no disponible | 0,934 |

Habla nativa (54 enunciados de LibriSpeech con fonemas esperados del CMU Pronouncing Dictionary), porcentaje de fonemas correctos marcados erróneamente, con el modelo completo:

| Umbral GOP | Marcas que son errores reales (speechocean762) | Errores reales detectados | Fonemas nativos marcados erróneamente |
|---|---|---|---|
| -1,8 | 52% | 51% | 9,3% |
| -4,0 | 60% | 36% | 5,8% |
| -6,0 | 72% | 21% | 2,4% |

Velocidad: 0,045× tiempo real sobre cuatro hilos de CPU de un Apple M2 Max (4 segundos de habla en aproximadamente 0,2 segundos).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el artefacto está pensado para CPU con onnxruntime. El fichero int8 ocupa unos 317 MB en disco y requiere del orden de esa cifra de memoria al cargarse.
- GPU recomendadas: no se especifican; el modelo se distribuye únicamente como ONNX int8 para `CPUExecutionProvider`. Cualquier GPU compatible con onnxruntime podría ejecutarlo, pero no hay datos de rendimiento publicados en GPU.
- ¿Cabe en GPU de consumo? Sí, por tamaño (menos de 1 GB en int8), aunque no se han publicado medidas de latencia o throughput en GPU.
- Opciones de despliegue: onnxruntime (probado con `CPUExecutionProvider`); el modelo fuente puede ejecutarse con las herramientas habituales de wav2vec2 (Transformers), pero este artefacto concreto es ONNX.
- Latencia y throughput: 0,045× tiempo real con cuatro hilos de CPU en un Apple M2 Max; es decir, 4 segundos de audio procesados en aproximadamente 0,2 segundos. No hay datos para otras CPU ni para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vksbhandary/buddy-pronunciation-en | ~300 M | audio 16 kHz, tramas de 20 ms, 127 tokens | en | Apache-2.0 | ONNX int8 (317 MB) | Conversión cuantizada; F1 de detección de errores 0,509 en speechocean762 |
| nrshoudi/speech_ocean_wav2vec_mdd | ~300 M | audio 16 kHz | en | Apache-2.0 | safetensors/PyTorch (1,26 GB) | Modelo fuente en fp32; correlación de Pearson 0,588 y F1 0,515 en speechocean762 |
| facebook/wav2vec2-large-xlsr-53 | ~300 M | audio 16 kHz | multilingüe (preentrenado en 53 idiomas) | Apache-2.0 | safetensors/PyTorch | Modelo base del anterior; no está ajustado para fonemas ARPAbet ni para evaluación de pronunciación, por lo que no es directamente comparable en GOP |

No se dispone de datos de benchmarks de otros modelos de reconocimiento fonético o evaluación de pronunciación en la información proporcionada, por lo que la comparación cuantitativa se limita a las tres variantes anteriores.

## Limitaciones y advertencias

- Los datos de entrenamiento del modelo fuente no están documentados; es muy probable que se entrenara con speechocean762, posiblemente incluyendo su test, lo que inflaría las métricas reportadas sobre ese corpus.
- El corpus de evaluación es de hablantes de mandarín como L1; otros acentos no se han evaluado y pueden presentar rasgos legítimos marcados como errores. El autor recomienda usar umbrales estrictos y comparar a cada hablante con sus propias puntuaciones pasadas.
- El habla natural y fluida reduce palabras cortas (por ejemplo, "and" pronunciado como "n"), mientras que las pronunciaciones de diccionario no lo hacen; esto causa la mayoría de falsos positivos en habla nativa (9,3% de fonemas nativos marcados erróneamente con umbral -1,8).
- El modelo puntúa contra los fonemas esperados y no infiere qué quiso decir el hablante: requiere una secuencia fonética de referencia externa y un alineamiento forzado correcto.
- Solo inglés; sin capacidades multilingües.
- Riesgo de alucinación en el sentido de transcripciones fonéticas plausibles pero incorrectas en audio ruidoso o fuera de dominio; no se han publicado evaluaciones de robustez frente a ruido.
- Licencia Apache-2.0, que permite uso comercial con atribución y conservación del aviso; el fichero `NOTICE` documenta los cambios realizados respecto al modelo fuente.
- El modelo es de noviembre de 2026 y no tiene descargas ni likes registrados; no hay evidencia de uso en producción por terceros.
- La cuantización int8 introduce una degradación pequeña pero medible (correlación de Pearson de 0,579 frente a 0,588; F1 de 0,509 frente a 0,515); para aplicaciones sensibles a la calibración de umbrales conviene revalidar los umbrales GOP sobre el artefacto int8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vksbhandary/buddy-pronunciation-en
- Modelo fuente: https://huggingface.co/nrshoudi/speech_ocean_wav2vec_mdd
- Modelo base original: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- ONNX: https://onnx.ai/
- Corpus speechocean762: https://www.openslr.org/101/
- Artículo de speechocean762 (Zhang et al., Interspeech 2021): no disponible como enlace directo en la información proporcionada
- CMU Pronouncing Dictionary: https://github.com/cmusphinx/cmudict
