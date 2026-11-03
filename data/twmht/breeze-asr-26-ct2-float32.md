# twmht/Breeze-ASR-26-ct2-float32

## Resumen

Breeze-ASR-26-ct2-float32 es una conversion no oficial a CTranslate2 del modelo MediaTek-Research/Breeze-ASR-26, un Whisper-large-v2 ajustado (fine-tuned) para reconocimiento automatico del habla en hokkien taiwanes (taigi). El modelo original lo desarrolla MediaTek Research y esta publicado bajo licencia Apache-2.0; esta version la mantiene el usuario twmht y no esta respaldada ni publicada por MediaTek Research. Su proposito es permitir la inferencia del modelo con faster-whisper y otros runtimes basados en CTranslate2, que ofrecen un rendimiento superior al pipeline estandar de transformers en produccion.

La particularidad mas relevante es que el modelo transcribe audio en taigi pero devuelve **caracteres chinos mandarin**, no ortografia Tâi-lô ni taigi. Esto lo hace util para integrarse en flujos de trabajo en chino escrito, pero limita su uso si se necesita la transcripcion en ortografia romanizada. El modelo conserva la arquitectura Whisper-large-v2 (transformer encoder-decoder) con un vocabulario de 51.865 entradas.

La conversion mantiene los pesos originales sin cambios y la licencia Apache-2.0. El repositorio ocupa 6,2 GB en float32 y esta pensado para cargarse con `compute_type="float16"` o `"int8_float16"` para reducir el consumo de memoria. Es relevante ahora porque el taigi es una lengua de bajos recursos con pocos modelos ASR disponibles, y esta conversion facilita su despliegue en infraestructura de produccion basada en CTranslate2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2) |
| Parametros totales | no disponible (arquitectura Whisper large-v2, aproximadamente 1.550 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | float32 (pesos publicados); float16 e int8_float16 disponibles en carga via CTranslate2 |
| Idiomas soportados | nan (hokkien taiwanes, audio); zh (salida en caracteres mandarin) |
| Licencia | apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), con `preprocessor_config.json` y `tokenizer.json` generado |

## Arquitectura y entrenamiento

El modelo base es Whisper-large-v2, un transformer encoder-decoder con atencion completa, disenado originalmente por OpenAI para ASR multilingue. MediaTek Research lo ajusto para taigi, segun el paper asociado (arXiv:2603.19259, "Breeze Taigi: Benchmarks and Models for Taiwanese Hokkien Speech Recognition and Synthesis"). El modelo card de esta conversion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO; esa informacion debe consultarse en el repositorio original de MediaTek-Research/Breeze-ASR-26.

La conversion a CTranslate2 se realizo con `ct2-transformers-converter` (ctranslate2 4.8.5, transformers 5.20.2) y cuantizacion float32. Dado que el repositorio original no incluia `tokenizer.json`, este se genero a partir del tokenizer original mediante `backend_tokenizer.save("tokenizer.json")`, manteniendo el vocabulario de 51.865 entradas de Whisper large-v2. No se introdujo ninguna innovacion arquitectonica adicional: los pesos son identicos a los del modelo original.

## Capacidades

- Transcripcion de voz en hokkien taiwanes (taigi) a caracteres chinos mandarin.
- Reconocimiento automatico del habla (ASR) con marcas de tiempo por segmento.
- Soporte de decodificacion con beam search y parametros de control de repeticion (`no_repeat_ngram_size`).
- Compatibilidad con faster-whisper y otros runtimes CTranslate2.
- Capacidad multilingue limitada: el audio de entrada es taigi, pero la salida es en chino mandarin; no se documenta soporte para otras lenguas.
- No se documenta tool calling, function calling, modo agente, vision ni audio mas alla del ASR.

## Casos de uso

- **Transcripcion de contenido audiovisual en taigi**: el modelo convierte audio de programas, entrevistas o videos en hokkien taiwanes a texto en caracteres mandarin, util para subtitulado y archivo de contenido en esta lengua.
- **Generacion de subtitulos para medios de comunicacion**: con marcas de tiempo por segmento, se puede integrar en pipelines de subtitulado automatico para television o plataformas de video que emiten en taigi.
- **Documentacion de patrimonio linguistico**: transcripcion de grabaciones de hablantes nativos para corpus linguisticos, con la salvedad de que la salida es en mandarin y requeriria un paso posterior de conversion a ortografia taigi si se necesita.
- **Atencion al ciudadano en administraciones publicas**: el modelo card menciona anuncios de servicio publico del Executive Yuan (Taiwan) con audio en taigi y guion oficial en mandarin, lo que sugiere su uso para transcribir y verificar locuciones institucionales.
- **Investigacion en ASR de bajos recursos**: como punto de partida para experimentos con hokkien taiwanes, comparando el pipeline de transformers con faster-whisper y ajustando parametros de decodificacion.
- **Integracion en aplicaciones de transcripcion en tiempo casi real**: gracias a faster-whisper y CTranslate2, se puede desplegar en servidores con GPU para transcripcion por lotes o en streaming con latencia controlada.
- **Evaluacion comparativa de runtimes**: util para equipos que necesitan medir la diferencia de calidad entre el pipeline de Hugging Face transformers y faster-whisper sobre el mismo modelo, como documenta el autor de la conversion.

## Benchmarks y rendimiento

El model card de esta conversion no publica benchmarks propios del modelo CTranslate2. Los datos disponibles son mediciones del autor sobre el modelo original con el pipeline de transformers (float16, beam 5), no con esta conversion:

| Prueba | Configuracion | Resultado |
|---|---|---|
| 100 clips cortos de Common Voice Taigi | sin `no_repeat_ngram_size` | 4 clips con bucles de repeticion |
| 100 clips cortos de Common Voice Taigi | `no_repeat_ngram_size` = 3, 4, 5, 6 u 8 | 0 clips con bucles |
| 18 anuncios de ~30 s (audio taigi, guion mandarin) | sin ajuste | CER medio 0,392 |
| 18 anuncios de ~30 s | `no_repeat_ngram_size` = 4 | CER medio 0,377 |
| 18 anuncios de ~30 s | `no_repeat_ngram_size` = 8 | CER medio 0,316 |
| 18 anuncios, versiones mandarin | `no_repeat_ngram_size` = 4 | CER medio 0,117 a 0,192 (perdida de palabras) |
| 18 anuncios, versiones mandarin | `no_repeat_ngram_size` = 8 | CER medio 0,097 |
| 18 anuncios (audio taigi), faster-whisper float32 | `no_repeat_ngram_size` = 8 | CER medio 0,377 |
| 36 clips, decodificacion greedy | comparacion transformers vs faster-whisper | similitud media de caracteres 0,92 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- **VRAM estimada**: en float32, el `model.bin` ocupa unos 6,2 GB, por lo que se necesita al menos 7-8 GB de VRAM para cargarlo. Con `compute_type="float16"` el consumo se reduce aproximadamente a la mitad (unos 3,1 GB) y con `int8_float16` a alrededor de 1,6-2 GB.
- **GPU recomendadas**: NVIDIA A100, H100 o L40S para despliegues de produccion con alto throughput; RTX 4090, RTX 3090 o RTX A6000 para desarrollo y cargas medias.
- **GPU de consumo**: cabe en tarjetas consumer con 8 GB o mas en float16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante). En float32 requiere 8 GB o mas.
- **Opciones de despliegue**: faster-whisper (recomendado por el autor), otros runtimes CTranslate2, y servidores propios basados en la API de CTranslate2. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- **Latencia y throughput**: no disponible. El autor no publica mediciones de latencia ni de throughput para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Breeze-ASR-26-ct2-float32 (esta ficha) | ~1.550 M (Whisper large-v2) | 30 s por segmento | nan (audio), zh (salida) | Apache-2.0 | Hugging Face, CTranslate2 |
| MediaTek-Research/Breeze-ASR-26 | ~1.550 M (Whisper large-v2) | 30 s por segmento | nan (audio), zh (salida) | Apache-2.0 | Hugging Face, transformers |
| Whisper large-v2 (OpenAI) | ~1.550 M | 30 s por segmento | multilingue (99 idiomas) | MIT | Hugging Face, multiples runtimes |
| Whisper large-v3 (OpenAI) | ~1.550 M | 30 s por segmento | multilingue (99 idiomas) | MIT | Hugging Face, multiples runtimes |

La comparativa con Whisper large-v2 y large-v3 es relevante porque comparten arquitectura y tamano; la diferencia principal es que Breeze-ASR-26 esta especializado en taigi, mientras que los Whisper genericos no estan optimizados para esa lengua. No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- **Conversion no oficial**: esta version no esta publicada ni respaldada por MediaTek Research; cualquier problema debe contrastarse con el modelo original.
- **Salida en mandarin, no en taigi**: el modelo no genera ortografia Tâi-lô ni taigi, lo que puede no ser adecuado para proyectos de preservacion linguistica que requieran la forma romanizada.
- **Sin token de idioma taigi**: es necesario usar `language="zh"` en faster-whisper, ya que el modelo no dispone de token propio para taigi.
- **Bucles de repeticion**: en clips cortos el modelo puede repetir una frase muchas veces (hasta unas 50 en una prueba); se recomienda `no_repeat_ngram_size=8`, aunque el autor advierte que no se ajusto especificamente para esta conversion.
- **Diferencias entre runtimes**: la salida de faster-whisper no es identica a la del pipeline de transformers (CER medio 0,377 frente a 0,316 en los 18 anuncios), y algunos clips terminan antes; conviene validar sobre datos propios.
- **Riesgo de alucinacion**: como todo modelo ASR, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencio.
- **Idiomas limitados**: solo se documenta taigi como entrada y chino mandarin como salida; no se garantiza un rendimiento adecuado en otras lenguas.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe citar el trabajo original y conservar los avisos de licencia.
- **Datos de entrenamiento no disponibles**: no se detalla la composicion del dataset ni posibles sesgos, por lo que se recomienda evaluar el modelo en el dominio concreto de uso antes de producción.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/twmht/Breeze-ASR-26-ct2-float32
- Modelo original: https://huggingface.co/MediaTek-Research/Breeze-ASR-26
- Paper: https://arxiv.org/abs/2603.19259
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
