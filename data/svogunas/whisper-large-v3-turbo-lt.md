# svogunas/whisper-large-v3-turbo-lt

## Resumen

`svogunas/whisper-large-v3-turbo-lt` es un fine-tune del modelo `openai/whisper-large-v3-turbo` especializado en reconocimiento automático de voz (ASR) para lituano. Desarrollado por el usuario svogunas y entrenado sobre el corpus LIEPA-3, este modelo reduce de forma drástica la tasa de error (WER) respecto al modelo base en conjuntos de test públicos: un 48 % menos en FLEURS-lt y un 71 % menos en Common Voice 17 lt. Está pensado para aplicaciones de transcripción de audio en lituano y destaca por su bajo CER (1,56 % en dominio), lo que refleja un buen manejo de la morfología altamente flexiva de esta lengua.

El modelo hereda la arquitectura del turbo de Whisper: un encoder-decoder transformer con el decoder podado a 4 capas (frente a las 32 del large-v3 original), lo que lo hace significativamente más rápido en inferencia. Cuenta con 808,88 millones de parámetros y se distribuye en formato safetensors bajo licencia CC-BY-4.0. Una limitación importante, documentada por el autor, es que no emite marcas de tiempo (timestamps) debido a un error en el código de entrenamiento, por lo que no es adecuado para subtitulado con sincronización temporal directa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer, decoder podado a 4 capas) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | Lituano (especializado); base multilingüe de Whisper |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo`, una versión optimizada de Whisper large-v3 que reduce las capas del decoder de 32 a 4, manteniendo el encoder completo. Esto permite una transcripción mucho más rápida con una degradación mínima en precisión. Sobre esta base, el autor realizó un fine-tune completo con el corpus LIEPA-3, un conjunto de datos de habla lituana. El entrenamiento duró 20 000 pasos, con una curva de WER que descendió desde 49,66 % (paso 0) hasta 6,64 % (paso 20 000) en un conjunto de validación in-domain.

Una particularidad técnica relevante es el bug detectado en el código de entrenamiento: el tokenizador utilizó por defecto el prefijo `<|notimestamps|>` en todas las secuencias objetivo, lo que provocó que el modelo aprendiera explícitamente a no predecir tokens de timestamp. Esto se documenta como una advertencia para otros desarrolladores que hagan fine-tune de Whisper, ya que es un error silencioso que elimina por completo la capacidad de sincronización temporal. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en lituano con alta precisión, especialmente en dominios similares al corpus de entrenamiento.
- Manejo de la morfología lituana (declinaciones, casos) gracias al bajo CER obtenido.
- Inferencia rápida al heredar la arquitectura turbo (decoder de 4 capas).
- Funciona con el pipeline `automatic-speech-recognition` de Transformers y es compatible con endpoints de inferencia (según tags de Hugging Face).
- No emite marcas de tiempo (timestamps) en absoluto, ni siquiera inexactas; cualquier solicitud de segmentos temporales devuelve vacío o un único segmento con `(0.0, None)`.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso; es un modelo puramente de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en lituano: el modelo puede procesar audio de forma directa y generar texto limpio, con un WER de ~9,5 % en Common Voice, suficiente para muchos flujos de documentación interna.
- Generación de subtítulos sin sincronización temporal: si el requisito es solo el texto (por ejemplo, para archivos de transcripción o búsqueda de contenido), el modelo funciona bien; no sirve para subtítulos con tiempos.
- Atención al cliente automatizada: integrable en pipelines de ASR para transcribir llamadas o mensajes de voz en lituano, siempre que no se necesiten marcas de tiempo para análisis posterior.
- Asistencia a personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o contenido audiovisual, aunque sin la capacidad de resaltar quién habla cuándo.
- Investigación lingüística: el bajo CER (1,56 % en dominio) lo hace útil para estudios de morfología y fonética lituana, donde la precisión a nivel de carácter es crítica.
- Archivado y búsqueda de audio: transcribir grandes volúmenes de grabaciones históricas o legales en lituano para hacerlas indexables y buscables por texto.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER normalizado con Whisper, minúsculas y sin puntuación, decoding greedy, `language="lt"`):

| Test set | `openai/whisper-large-v3-turbo` (base) | **Este fine-tune** | Reducción relativa |
|---|---|---|---|
| FLEURS-lt (test, n=986) | 25,50 % | **13,18 %** | −48 % |
| Common Voice 17 lt (test, n=4 753) | 32,93 % | **9,49 %** | −71 % |

Resultados in-domain (conjunto held-out de 400 clips excluidos del entrenamiento, mismo corpus LIEPA-3; optimistas para uso real):

| Modelo | WER | CER |
|---|---|---|
| `openai/whisper-large-v3-turbo` (base) | 49,66 % | — |
| **Este fine-tune** | **6,59 %** | **1,56 %** |

No se han publicado resultados en otros benchmarks (por ejemplo, Multilingual LibriSpeech o VoxPopuli) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 809 M parámetros, en fp16 ocupa ~1,6 GB; en int8 ~0,8 GB; en int4 ~0,4 GB. El repo en safetensors pesa 3,2 GB (probablemente fp32).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090) es suficiente para inferencia en fp16. Para lotes grandes o despliegue concurrente, se recomienda una A10, A100 o H100.
- Corre en GPUs de consumo: sí, con cuantización incluso en tarjetas de 2 GB.
- Opciones de despliegue: compatible con `transformers` (pipeline ASR), vLLM (aunque sin timestamps), TGI, y puede convertirse a GGUF para `whisper.cpp` o `llama.cpp` (con las limitaciones de timestamps).
- Latencia y throughput: no se han publicado mediciones específicas; al ser la variante turbo, se espera una velocidad sustancialmente mayor que whisper-large-v3, con una degradación mínima en precisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER en Common Voice lt | Timestamps | Licencia |
|---|---|---|---|---|---|
| `openai/whisper-large-v3-turbo` (base) | 809 M | 30 s | 32,93 % | Sí | MIT |
| **`svogunas/whisper-large-v3-turbo-lt`** | 809 M | 30 s | **9,49 %** | No | CC-BY-4.0 |
| `kristijonas/paprika-whisper-lt-v3` | no disponible | no disponible | no disponible | Sí | no disponible |

`paprika-whisper-lt-v3` es un fine-tune de este mismo modelo realizado por el equipo de kalamo.ai, reentrenado con etiquetas que incluyen timestamps. Según el autor, se verificó de forma independiente que este modelo sí emite marcas de tiempo, por lo que es la alternativa recomendada cuando se necesita sincronización temporal. No se dispone de sus métricas públicas en la información proporcionada.

## Limitaciones y advertencias

- **Sin timestamps**: el modelo no emite ningún token de timestamp, ni siquiera inexactos. Esto inhabilita subtitulado con tiempos, alineación palabra-a-palabra o búsqueda por tiempo. La causa es un bug en el código de entrenamiento (prefijo `<|notimestamps|>` en todas las secuencias), no una limitación del corpus.
- **Sesgo de dominio**: al estar entrenado en LIEPA-3, su rendimiento puede degradarse en dominios muy diferentes (acentos regionales, ruido, teléfono, etc.). Los benchmarks públicos muestran buen comportamiento, pero no hay garantía universal.
- **Riesgo de alucinación**: como todo modelo ASR, puede alucinar contenido en audio ambiguo o de baja calidad, especialmente en ausencia de habla clara.
- **Idioma**: aunque el modelo base es multilingüe, este fine-tune está especializado en lituano; su rendimiento en otros idiomas no está documentado y probablemente sea inferior al del base.
- **Licencia CC-BY-4.0**: permite uso comercial, pero requiere atribución. No es una licencia de código abierto estricta (no es OSI-approved), aunque es permisiva.
- **Compatibilidad**: la ausencia de timestamps puede romper integraciones que esperen segmentos temporales (por ejemplo, pipelines de subtitulado automático). Verificar antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/svogunas/whisper-large-v3-turbo-lt
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Despliegue en FriendliAI: https://friendli.ai/models/svogunas/whisper-large-v3-turbo-lt
- Modelo alternativo con timestamps: https://huggingface.co/kristijonas/paprika-whisper-lt-v3
