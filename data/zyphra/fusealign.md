# Zyphra/fusealign

## Resumen

FuseAlign multilingual (fine-tune CJK, paso 2.500) es un alineador forzado de palabras desarrollado por Zyphra. Dado un audio y su transcripcion, el modelo predice el inicio y el final de cada palabra sobre una rejilla de 1 ms, junto con una probabilidad de presencia de cada palabra en el audio. Se trata de una reproduccion del trabajo FuseAlign (Vaidya et al., 2026), en su variante multilingue entrenada durante 100.000 pasos y posteriormente ajustada 2.500 pasos sobre etiquetas corregidas en las uniones de palabras CJK.

El modelo resuelve un problema clasico de los pipelines de voz: la sincronizacion fina entre audio y texto, necesaria para subtitulado, analisis fonetico, evaluacion de pronunciacion o segmentacion de corpus. Frente a alineadores clasicos basados en HMM como el Montreal Forced Aligner, FuseAlign es un modelo neuronal que incorpora un codificador de texto preentrenado (Dia) y un detector de actividad de voz (Silero VAD) en la variante GGUF.

La relevancia actual radica en su tamano contenido (462 millones de parametros, 1,34 GB en fp32) y en que supera al alineador Qwen3-ForcedAligner-0.6B en varios corpus de referencia, con resultados especialmente buenos en mandarin con etiquetas manuales y en coreano, aunque pierde frente a este en japones, espanol y ruso sobre las referencias de FLEURS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de alineamiento forzado con codificador de texto Dia (transformer) y VAD Silero en la variante GGUF; detalles internos no disponibles |
| Parametros totales | 462.270.850 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32 (safetensors y GGUF), Q8_0 (GGUF) |
| Idiomas soportados | Multilingue; evaluado en ingles, mandarin, japones, coreano, espanol, portugues, frances, aleman y ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) y GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo es una reproduccion de FuseAlign, un alineador forzado neuronal que combina un codificador de texto (los pesos del text encoder de Dia-1.6B-0626, en bf16) con un modulo acustico que produce, para cada palabra de la transcripcion, un intervalo de inicio y fin sobre una rejilla temporal de 1 ms y una probabilidad de presencia. La variante GGUF anade ademas Silero VAD en F32 para la deteccion de actividad de voz. La model card no detalla la topologia interna exacta ni el numero de capas o dimensiones ocultas.

El entrenamiento consta de dos fases segun la model card: un modelo multilingue base entrenado durante 100.000 pasos y un ajuste fino posterior de 2.500 pasos sobre etiquetas CJK con las uniones de palabras corregidas. No se especifica el volumen de datos de entrenamiento, la composicion del corpus ni si se emplearon tecnicas de RLHF o DPO, algo poco habitual en una tarea discriminativa de alineamiento. La innovacion principal es el enfoque de alineamiento "in the wild" del articulo de referencia, que busca robustez en audio no controlado.

## Capacidades

- Alineamiento forzado a nivel de palabra: devuelve inicio, fin y probabilidad de presencia para cada palabra de la transcripcion.
- Resolucion temporal de 1 ms en las marcas de inicio y fin.
- Deteccion de palabras ausentes o no pronunciadas mediante la probabilidad de presencia y el indicador `placed`.
- Procesamiento multilingue, con cobertura evaluada en nueve idiomas.
- Manejo de audio de formato largo (long-form alignment) segun la documentacion del repositorio de GitHub.
- Integracion con PyTorch mediante `torch.hub` y con el ecosistema ggml mediante CLI en C++.
- Deteccion de actividad de voz integrada en la variante GGUF gracias a Silero VAD.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni modo de pensamiento: es un modelo especializado de una sola tarea.

## Casos de uso

- Subtitulado y sincronizacion de transcripciones: el modelo alinea cada palabra del guion con su posicion exacta en el audio, lo que permite generar subtitulos con marcas temporales a nivel de palabra para plataformas de video o accesibilidad.
- Evaluacion de pronunciacion en aprendizaje de idiomas: comparar las marcas predichas con las esperadas permite detectar omisiones, titubeos o palabras mal pronunciadas gracias a la probabilidad de presencia.
- Segmentacion de corpus de voz para entrenamiento de modelos ASR o TTS: el alineamiento fino permite cortar audios largos en fragmentos por palabra o frase con precision de milisegundos.
- Analisis fonetico y prosodico en investigacion: la rejilla de 1 ms facilita estudios de duracion vocalica, pausas y ritmo del habla sobre corpus como TIMIT o Buckeye.
- Verificacion de transcripciones en pipelines de ASR: al comprobar que palabras del texto aparecen realmente en el audio, se pueden detectar alucinaciones o segmentos mal transcritos.
- Procesamiento de contenido multilingue en produccion: con soporte evaluado en ingles, mandarin, japones, coreano y varias lenguas europeas, sirve para normalizar y sincronizar archivos de audio de distintos mercados.
- Despliegue en entornos con recursos limitados: la variante Q8_0 de 0,51 GB permite ejecutar el alineador en CPU o GPU de gama baja mediante el CLI ggml.

## Benchmarks y rendimiento

Porcentaje de fronteras de palabra con error superior a 50 ms (metrica asimetrica del articulo); menor es mejor. Comparacion con Qwen3-ForcedAligner-0.6B (qwen-asr 0.0.6, bf16, clips completos) sobre los mismos clips, transcripciones y referencias.

| Corpus | FuseAlign | Qwen3-FA |
|---|---:|---:|
| TIMIT | 16,55 | 20,17 |
| Buckeye | 24,58 | 24,60 |
| AMI-silver | 49,38 | 58,22 |
| TIMIT-long | 17,25 | 20,04 |
| BZNSYP Mandarin (gold) | 15,94 | 28,04 |
| FLEURS Mandarin | 17,95 | 11,06 |
| FLEURS Japanese | 14,02 | 8,38 |
| FLEURS Korean | 8,39 | 11,53 |
| FLEURS Spanish | 19,66 | 11,71 |
| FLEURS Portuguese | 9,30 | 10,24 |
| FLEURS French | 13,15 | 12,35 |
| FLEURS German | 13,29 | 13,91 |
| FLEURS Russian | 12,74 | 11,18 |

Las referencias de FLEURS proceden del Montreal Forced Aligner, no de etiquetas manuales; las de BZNSYP si estan etiquetadas a mano.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en fp32 (pesos de 1,34 GB mas activaciones y el codificador de texto en bf16); en torno a 1 GB o menos con la variante Q8_0 de 0,51 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; para Q8_0 basta con CPU o GPU integrada.
- Cabe en GPU de consumo: si, en practicamente cualquier modelo moderno (GTX 1650, RTX 3060, RTX 4090, etc.), e incluso en CPU mediante el CLI ggml.
- Opciones de despliegue: `torch.hub` con el paquete PyTorch, y CLI en C++/ggml para los ficheros GGUF. No se documenta soporte para vLLM, TGI o Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FuseAlign multilingual (CJK ft) | 462 M | No disponible | Apache-2.0 | Hugging Face, PyTorch y GGUF | Alineador forzado; mejor en TIMIT, AMI, BZNSYP y coreano |
| Qwen3-ForcedAligner-0.6B | 0,6 B | No disponible | No disponible | Hugging Face | Alineador forzado; mejor en FLEURS japones, espanol y ruso |
| Montreal Forced Aligner (MFA) | No disponible (HMM/GMM clasico) | No aplica | No disponible | Software open source | Referencia clasica; sus salidas se usan como referencia en FLEURS |

## Limitaciones y advertencias

- El modelo solo realiza alineamiento forzado: requiere una transcripcion previa y no transcribe audio por si mismo.
- Riesgo de error en fronteras de palabra: incluso en los mejores corpus, entre el 8 % y el 17 % de las fronteras superan los 50 ms de desviacion; en AMI-silver alcanza el 49,38 %.
- Rendimiento desigual por idioma: es claramente peor que Qwen3-FA en japones (14,02 frente a 8,38), espanol (19,66 frente a 11,71) y ruso (12,74 frente a 11,18) sobre FLEURS.
- Las referencias de FLEURS no son etiquetas manuales, sino salidas del Montreal Forced Aligner, lo que introduce incertidumbre en la comparacion.
- No se documentan sesgos especificos ni el comportamiento con acentos, ruido o solapamiento de hablantes; el corpus AMI-silver sugiere dificultades en audio conversacional real.
- La model card no detalla la longitud maxima de audio ni la ventana de contexto; el alineamiento de audio largo se remite a la documentacion de GitHub.
- Licencia Apache-2.0, permisiva para uso comercial, pero el checkpoint incorpora pesos del text encoder de Dia-1.6B-0626 (Apache-2.0) y los GGUF incluyen Silero VAD (MIT); conviene conservar los avisos de atribucion correspondientes.
- Modelo muy reciente y con pocas descargas (11) y likes (3) en el momento de la consulta: ecosistema y validacion externa limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyphra/fusealign
- Repositorio de codigo y CLI: https://github.com/Zyphra/fusealign-multilingual
- Articulo de referencia: https://arxiv.org/abs/2609.33650
- Modelo comparable Qwen3-ForcedAligner-0.6B: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Pesos del text encoder Dia-1.6B-0626: https://huggingface.co/nari-labs/Dia-1.6B-0626
- Silero VAD: https://github.com/snakers4/silero-vad
