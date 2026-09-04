# ubermensch1218/vibevoice7b-schift-quanted-mixed

## Resumen

`vibevoice7b-schift-quanted-mixed` es un artefacto experimental publicado por `ubermensch1218` que contiene una cuantización GGUF de precisión mixta del decodificador de texto aislado del modelo `microsoft/VibeVoice-ASR-Streaming-7B`. No es un modelo de reconocimiento de voz autónomo: se trata únicamente de la mitad del decodificador (el `language_model` y el `lm_head`, que corresponden a un `Qwen2ForCausalLM` de 7B), extraído y verificado contra el checkpoint oficial con 0 claves faltantes o inesperadas.

El objetivo del proyecto es reducir los requisitos de memoria del decodificador del pipeline VibeVoice, pasando de aproximadamente 15 GB en bf16 a 6.02 GB en GGUF, manteniendo el rendimiento de transcripción. La cuantización se realizó con `llama.cpp` usando una precisión mixta por tipo de tensor, calibrada con un imatrix coreano generado a partir del esquema JSON de transcripción del propio modelo. La relevancia de este artefacto radica en que demuestra que una cuantización agresiva puede preservar la calidad de reconocimiento en un modelo de voz de frontera, al tiempo que abre la puerta a ejecutar el pipeline VibeVoice en hardware más asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder Qwen2 (`Qwen2ForCausalLM`) extraído de `VibeVoice-ASR-Streaming-7B` |
| Parametros totales | 7B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF de precisión mixta: `ffn_gate`/`ffn_up` en Q8_0, `attn_k`/`attn_q` en Q4_K, `attn_v`/`attn_output`/`ffn_down` en IQ3_XXS, embedding y salida en Q8_0 |
| Idiomas soportados | Coreano, inglés, chino, japonés (ko, en, zh, ja) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El artefacto consiste en el decodificador de texto del modelo `VibeVoice-ASR-Streaming-7B`, que fue extraído y verificado para coincidir exactamente con un `Qwen2ForCausalLM` estándar. El modelo original de Microsoft integra tokenizers de voz continuos (acústico y semántico) que operan a una frecuencia ultrabaja de 7.5 Hz, pero estos componentes de audio no se incluyen en este archivo GGUF. Para ejecutar reconocimiento de voz real, es necesario reensamblar este decodificador en el pipeline original de VibeVoice, como se documenta en el `README`.

La cuantización se llevó a cabo con `llama.cpp`, aplicando una precisión mixta por tipo de tensor, guiada por un imatrix coreano construido a partir del esquema JSON de transcripción del modelo. La configuración final (`ffn_gate`/`ffn_up` en Q8_0, `attn_k`/`attn_q` en Q4_K, `attn_v`/`attn_output`/`ffn_down` en IQ3_XXS, y embedding/salida en Q8_0) fue la que mejor rendimiento ofreció; otras variantes como Q4_K_M o IQ2_XXS resultaron peores y se descartaron. No se realizó un entrenamiento adicional: el proceso es puramente de compresión y calibración.

## Capacidades

- Decodificación de texto para ASR cuando se integra en el pipeline VibeVoice original, utilizando el script `gguf_to_qwen2model.py` para de cuantizar el GGUF de vuelta a un `Qwen2Model` y reemplazar el decodificador original.
- Transcripción de audio en coreano, inglés, chino y japonés, heredada del modelo base.
- Soporte de diarización de hablantes (heredado del modelo base), aunque con limitaciones significativas en la precisión del número de hablantes.
- No soporta tool calling, función de llamada, visión ni audio de forma autónoma, ya que es solo el decodificador de texto.
- No incluye capacidades de agente ni razonamiento multi-paso más allá de lo que ofrece el propio `Qwen2ForCausalLM`.

## Casos de uso

- Transcripción de audio coreano multi-hablante: el modelo, reensamblado en el pipeline VibeVoice, puede transcribir conversaciones con múltiples hablantes. La cuantización reduce los requisitos de memoria frente al checkpoint bf16, permitiendo su ejecución en GPUs con menos VRAM sin degradar el CER (19.27% frente a 19.39% en una validación con 20 muestras de AIHub).

- Despliegue en GPU de consumo para ASR: con un tamaño de 6.02 GB, el decodificador cuantizado cabe en GPUs como la RTX 3060 de 12 GB, lo que hace viable ejecutar el pipeline VibeVoice en hardware de gama media para prototipado o entornos de baja capacidad.

- Investigación en cuantización de modelos de voz: este artefacto sirve como referencia para estudiar el impacto de la cuantización de precisión mixta en modelos de ASR. Los resultados de perplejidad (318.3 vs 318.6) y CER muestran que la compresión no daña la calidad, lo que puede orientar futuros experimentos de compresión en modelos de voz.

- Reemplazo del decodificador en pipelines existentes: los desarrolladores que ya usan `VibeVoice-ASR-Streaming-7B` pueden intercambiar el decodificador original por este GGUF mediante el script de conversión, reduciendo el footprint de memoria sin modificar los componentes de audio.

- Evaluación de diarización en conversaciones: el modelo puede emplearse en experimentos de diarización usando la métrica cpCER (concatenated minimum-permutation CER), especialmente en coreano. Aunque la diarización del modelo base es imperfecta, este artefacto permite evaluar el comportamiento de la cuantización en esa tarea.

- Aplicaciones de transcripción multilingüe: al soportar coreano, inglés, chino y japonés, el modelo puede integrarse en sistemas de transcripción que manejen estos idiomas, siempre que se reensamble con los componentes de audio originales.

## Benchmarks y rendimiento

Los datos de rendimiento proceden de la validación del autor, realizada reensamblando el decodificador GGUF en el pipeline VibeVoice original y ejecutando `model.streaming_generate()` sobre 20 utterances reales de un panel de discusión coreano (AIHub, multi-hablante, contexto conversacional continuo).

| Métrica | Original bf16 | Este GGUF (6.02 GB) |
|---|---|---|
| Tamaño | ~15 GB | 6.02 GB |
| Perplejidad (set de calibración) | 318.6 | 318.3 |
| CER (20 utterances coreanos, etiquetas de hablante eliminadas) | 19.39% | 19.27% |
| cpCER (diarización + transcripción) | 37.14% | 34.41% |
| Desajustes en el número de hablantes | 10/20 | 10/20 |

La diferencia en CER es de 0.12 puntos porcentuales, dentro del ruido muestral para n=20. La cpCER mejora ligeramente con el GGUF, aunque la varianza es alta. El autor señala que la diarización del modelo base es imperfecta independientemente de la cuantización: en 10 de 20 muestras se fusiona o divide el número real de hablantes, lo que eleva el cpCER hasta 28-137% en las muestras con error.

## Requisitos de hardware

- VRAM estimada para el decodificador GGUF: aproximadamente 6 GB (más overhead de ejecución). Para el pipeline VibeVoice completo, se necesita VRAM adicional para los componentes de audio del checkpoint original, cuyo consumo no está especificado.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el decodificador. Para el pipeline completo, se recomienda una GPU con más memoria, como una RTX 4090 o una A100, dependiendo de la longitud del audio.
- Compatibilidad con GPU de consumo: sí, el decodificador GGUF cabe en una RTX 3060 de 12 GB o similar.
- Opciones de despliegue: `llama.cpp` para la carga del GGUF. El uso real requiere el pipeline VibeVoice con el script `gguf_to_qwen2model.py`. No se han probado vLLM, Ollama ni TGI con este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La alternativa más directa es el modelo base `microsoft/VibeVoice-ASR-Streaming-7B` en su formato original bf16. No se han publicado otras cuantizaciones del mismo decodificador que puedan compararse directamente.

| Modelo | Tamaño | Precisión | CER | cpCER | Licencia |
|---|---|---|---|---|---|
| VibeVoice-ASR-Streaming-7B (original) | ~15 GB | bf16 | 19.39% | 37.14% | MIT |
| `vibevoice7b-schift-quanted-mixed` | 6.02 GB | GGUF mixto | 19.27% | 34.41% | MIT |

No se dispone de información sobre otros modelos de la misma categoría (cuantización de decodificador ASR) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR autónomo: requiere los componentes de audio del checkpoint original `VibeVoice-ASR-Streaming-7B` para funcionar como sistema de reconocimiento de voz.
- No está soportado oficialmente por Microsoft: es un experimento independiente compartido tal cual, sin garantías de mantenimiento ni soporte.
- La diarización del modelo base es imperfecta: en 10 de 20 muestras de la validación se fusiona o divide el número real de hablantes, lo que provoca cpCER elevados (28-137%) en esos casos. Esta característica se hereda sin cambios.
- La validación se realizó únicamente con 20 muestras de audio coreano, por lo que los resultados no son estadísticamente robustos y no garantizan el mismo comportamiento en otros idiomas o dominios.
- No se han publicado más variantes de cuantización: las alternativas probadas (Q4_K_M, IQ2_XXS) fueron peores y se descartaron.
- El script de conversión `gguf_to_qwen2model.py` depende de la librería `gguf-py` incluida en `llama.cpp`, lo que añade una dependencia externa.
- La licencia MIT es permisiva, pero el uso comercial debe verificar la licencia del modelo base y la de los datos de entrenamiento utilizados por Microsoft.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/ubermensch1218/vibevoice7b-schift-quanted-mixed
- Modelo base en HuggingFace: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-7B
- Repositorio oficial de VibeVoice en GitHub: https://github.com/microsoft/VibeVoice
- Archivo comunitario del repositorio de VibeVoice: https://github.com/shijincai/VibeVoice
