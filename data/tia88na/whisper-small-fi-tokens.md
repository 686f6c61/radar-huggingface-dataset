# tia88na/whisper-small-fi-tokens

## Resumen

`tia88na/whisper-small-fi-tokens` es un checkpoint de la familia Whisper de OpenAI, en su variante "small", publicado en Hugging Face por el usuario `tia88na`. El nombre del repositorio sugiere un ajuste fino orientado a finlandés ("fi") y a la predicción de tokens, pero la model card está generada automáticamente y no contiene ninguna confirmación sobre el proceso de entrenamiento, los datos utilizados ni el idioma objetivo real. El pipeline declarado en el Hub es `automatic-speech-recognition`.

El modelo cuenta con 241.734.912 parámetros en formato safetensors y un tamaño de repositorio de 0,5 GB, coherente con la arquitectura Whisper small original (aproximadamente 244 millones de parámetros). La etiqueta `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre el cálculo del impacto ambiental, no a un paper propio del modelo, lo que refuerza la impresión de que se trata de un checkpoint derivado sin documentación técnica asociada.

Su relevancia actual es limitada: se trata de un modelo con cero descargas y cero "likes" en el momento de la consulta, sin licencia declarada ni idiomas especificados, y con una model card que no aporta información sobre el ajuste realizado. Resulta útil únicamente como punto de partida para experimentación con ASR en finlandés, siempre que el usuario valide empíricamente su comportamiento antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) según la familia base; detalles del ajuste no disponibles |
| Parámetros totales | 241.734.912 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small base: 1.500 posiciones de audio, equivalente a 30 s por ventana) |
| Tipos de cuantización | no disponible (compatible con cuantizaciones estándar de transformers/GGUF, no confirmado por el autor) |
| Idiomas soportados | no disponible (el sufijo "fi" sugiere finlandés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper, un transformer encoder-decoder entrenado para transcripción de audio a texto con ventanas de 30 segundos y 1.500 posiciones de contexto. El modelo base Whisper small emplea 12 capas de encoder y 12 de decoder, con atención multi-cabeza estándar y embeddings de posición absolutos. El checkpoint aquí descrito conserva el recuento de parámetros de esa variante, por lo que no se ha producido un cambio estructural reseñable.

No hay información pública sobre el dataset de ajuste fino, el número de tokens de audio procesados, la composición lingüística del corpus ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. El sufijo "tokens" en el nombre del repositorio podría indicar un ajuste sobre representaciones tokenizadas o una variante de decodificación, pero la model card no lo aclara. Tampoco se documentan hiperparámetros, régimen de precisión mixta ni infraestructura de cómputo empleada.

## Capacidades

- Transcripción de audio a texto (ASR) mediante el pipeline `automatic-speech-recognition` de transformers.
- Reconocimiento de voz en ventanas de hasta 30 segundos por inferencia, con la posibilidad de encadenar ventanas para audios más largos.
- Capacidad multilingüe heredada de Whisper base, aunque el ajuste podría haber reducido el rendimiento en idiomas distintos del objetivo; no confirmado.
- Soporte de marcas de tiempo a nivel de segmento si el tokenizer y la configuración del checkpoint lo permiten (no verificado).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; Whisper no es un modelo de instrucciones generales.
- No se documenta modo "thinking", visión, audio de salida ni otras capacidades especiales más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en finlandés: el modelo puede procesar audio dividido en segmentos de 30 segundos y concatenar las salidas, aprovechando el ajuste específico si este se confirma. Requiere validación previa con muestras reales.
- Subtitulado automático de vídeos cortos: adecuado por el bajo coste computacional de un modelo de 241 M de parámetros, que permite generar subtítulos en tiempo casi real en una GPU consumer.
- Prototipado de asistentes de voz en finlandés: sirve como componente ASR en un pipeline mayor (ASR + LLM + TTS) para demos y pruebas de concepto, dado su reducido tamaño.
- Investigación sobre ajuste fino de Whisper: el checkpoint puede emplearse como referencia para comparar estrategias de fine-tuning en idiomas de bajos recursos, siempre que se documente su procedencia.
- Transcripción de notas de voz en aplicaciones móviles o de escritorio: el tamaño de 0,5 GB permite empaquetarlo en aplicaciones locales con cuantización, aunque la licencia no declarada es un riesgo.
- Generación de datasets de audio etiquetados: útil para pre-anotar corpus en finlandés y revisar manualmente después, reduciendo el coste de anotación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,5 GB de pesos más overhead de activaciones, en torno a 1-2 GB en total.
- VRAM estimada en int8: alrededor de 0,3 GB de pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas RTX 3050, RTX 4060, RTX 4090, A100 o H100; el modelo no requiere aceleradores de gama alta.
- Cabe holgadamente en GPU consumer, incluso en iGPU con suficiente memoria compartida si se usa cuantización.
- Opciones de despliegue: `transformers` con pipeline de ASR, `faster-whisper` si el checkpoint es compatible con CTranslate2 (no confirmado), `whisper.cpp` previa conversión a GGML (no confirmado), y servidores tipo TGI o vLLM si se adapta el formato.
- Latencia y throughput estimados: no disponibles; para un modelo de este tamaño se espera un throughput de decenas de segmentos por segundo en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tia88na/whisper-small-fi-tokens` | 241,7 M | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| `openai/whisper-small` | 244 M | 1.500 posiciones (30 s) | 99 idiomas | MIT | Hugging Face, ampliamente usado |
| `openai/whisper-base` | 74 M | 1.500 posiciones (30 s) | 99 idiomas | MIT | Hugging Face |
| `openai/whisper-medium` | 769 M | 1.500 posiciones (30 s) | 99 idiomas | MIT | Hugging Face |

La comparación directa con `openai/whisper-small` es la más relevante: mismo orden de parámetros, pero el checkpoint de `tia88na` carece de licencia, idiomas declarados y benchmarks, lo que lo sitúa en desventaja para cualquier uso serio frente al original de OpenAI.

## Limitaciones y advertencias

- La model card está generada automáticamente y no contiene información verificable sobre el ajuste, los datos o los idiomas.
- Licencia no declarada: no se puede asumir uso comercial permitido; en ausencia de licencia, los derechos quedan reservados por defecto.
- Idiomas soportados no confirmados: el sufijo "fi" sugiere finlandés, pero no hay evidencia en la documentación.
- Riesgo de alucinación inherente a Whisper, especialmente en segmentos con ruido, silencios largos o audio musical.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no se pueden evaluar sesgos de acento, género o dialecto.
- Sin benchmarks publicados: imposible comparar su calidad con el Whisper small original sin evaluación propia.
- Cero descargas y cero "likes": no hay evidencia de uso comunitario ni de validación por terceros.
- El tag `arxiv:1910.09700` corresponde a un artículo sobre impacto ambiental, no a un paper del modelo; no debe interpretarse como referencia técnica.
- Para producción, se recomienda usar `openai/whisper-small` o `openai/whisper-medium` con licencia MIT y evaluación documentada, salvo que se valide empíricamente este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/tia88na/whisper-small-fi-tokens
- Paper de Whisper (referencia de la arquitectura base): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Modelo base `openai/whisper-small`: https://huggingface.co/openai/whisper-small
- Artículo citado en los tags (impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
