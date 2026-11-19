# VorbaVine/parakeet-ctc-110m-vv-ro

## Resumen

parakeet-ctc-110m-vv-ro es un ajuste fino en rumano del modelo híbrido TDT-CTC `nvidia/parakeet-tdt_ctc-110m` de NVIDIA, publicado por VorbaVine. El modelo resuelve el reconocimiento automático de voz (ASR) en rumano y se distribuye con un tokenizador SentencePiece BPE propio de 1024 tokens y modelos de lenguaje KenLM opcionales (3, 4 y 5-gram) para decodificación con haz. Su relevancia radica en que ofrece una alternativa ligera (110 M de parámetros) y abierta para una lengua con pocos recursos ASR de calidad, con resultados competitivos en conjuntos de evaluación estándar.

El checkpoint conserva la arquitectura híbrida original, pero solo se ha ajustado y evaluado la cabeza CTC; el decodificador TDT por defecto produce salidas inutilizables según el autor. El entrenamiento se realizó sobre aproximadamente 143,77 horas de audio (121,78 h de entrenamiento), de las cuales unas 73,5 h son sintéticas y el resto proviene de Common Voice, FLEURS, VoxPopuli, grabaciones propias y otras fuentes de habla real.

La licencia CC-BY-4.0 permite uso comercial con atribución, tanto al modelo base de NVIDIA como a este ajuste. El repositorio ocupa 0,8 GB e incluye los pesos en formato `.nemo`, el tokenizador y los modelos KenLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida TDT-CTC (FastConformer), ajustada y evaluada solo con cabeza CTC |
| Parámetros totales | 110 M (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la información) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | rumano (ro) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (NeMo), más `tokenizer.model`/`tokenizer.vocab` y KenLM `.arpa`/`.bin` |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/parakeet-tdt_ctc-110m`, una arquitectura híbrida que combina decodificación TDT (Token-and-Duration Transducer) y CTC sobre un encoder FastConformer. VorbaVine reemplazó el tokenizador original por uno SentencePiece BPE de 1024 tokens entrenado sobre sus transcripciones y ajustó únicamente la cabeza CTC con pérdida CTC de peso 0,3. El entrenamiento usó AdamW con NoamAnnealing (1000 pasos de calentamiento), batch efectivo de 512, precisión bf16 y weight decay 1e-3, durante 50 épocas; se retuvo la época final, con un WER de validación de 7,47 % alcanzado en la época 48.

Los datos cubren 86.920 clips y 143,77 h en total: 121,78 h de entrenamiento (73.174 clips), 10,91 h de validación (6.814 clips) y 11,08 h de test (6.932 clips). Por fuente: 8,4 h de grabaciones propias, 21,5 h de Common Voice, 5,9 h de FLEURS, 34,4 h de otro habla real y 73,5 h de habla sintética. El mismo split fijo se usó para entrenamiento, selección de modelo y test. La innovación práctica es la integración de KenLM para decodificación con haz (pyctcdecode), que reduce el WER de forma consistente.

## Capacidades

- Reconocimiento automático de voz en rumano a partir de audio.
- Decodificación CTC greedy o con haz asistido por KenLM (3, 4 o 5-gram); el benchmark usa el 4-gram con beam 16 y alpha 0,3.
- Tokenizador SentencePiece BPE propio de 1024 tokens adaptado al rumano.
- Integración con el ecosistema NeMo (`nemo.collections.asr`).
- No soporta tool calling, agentes, visión ni audio más allá de ASR.
- Capacidad multilingüe limitada al rumano.

## Casos de uso

- Transcripción de reuniones y entrevistas en rumano: el modelo procesa audio y genera texto con un WER de 4,21 % en el test propio usando el 4-gram, adecuado para actas y resúmenes posteriores.
- Subtitulado automático de vídeo en rumano: su tamaño de 110 M permite inferencia rápida en CPU/GPU modesta para generar subtítulos en lotes.
- Atención al cliente con análisis de llamadas: transcripción de grabaciones telefónicas para extraer métricas y búsqueda sobre conversaciones.
- Archivado y búsqueda de audio: indexación de grandes volúmenes de grabaciones rumanas mediante transcripción por lotes con NeMo.
- Investigación en ASR de bajos recursos: punto de partida para ajustes en otras lenguas o dominios, dado su tamaño reducido y licencia permisiva.
- Prototipado en dispositivos con recursos limitados: los 110 M de parámetros y la decodificación CTC permiten despliegues ligeros frente a modelos ASR grandes.
- Evaluación comparativa de decodificadores: uso del par CTC greedy frente a CTC+KenLM para medir el impacto del modelo de lenguaje.

## Benchmarks y rendimiento

Resultados de WER (%) publicados por el autor; menor es mejor.

| Test set | CTC greedy | CTC + 4-gram LM |
|---|---|---|
| VorbaVine test | 4,98 | 4,21 |
| Mozilla (no visto) | 3,80 | 2,68 |
| FLEURS (no visto) | 11,02 | 9,67 |
| VoxPopuli (no visto) | 6,79 | 5,67 |

Puntuado sobre referencias curadas tras normalización. WER de validación del modelo retenido: 7,47 %.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 110 M de parámetros el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el ejemplo del autor usa `.cuda()`. No se especifican modelos concretos (A100, H100, RTX 4090).
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño, aunque no se aportan cifras oficiales.
- Despliegue: NeMo (`nemo.collections.asr`), con `pyctcdecode` y `kenlm` para decodificación con haz. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR NeMo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| VorbaVine/parakeet-ctc-110m-vv-ro | 110 M | Rumano | CC-BY-4.0 | Ajuste CTC con KenLM; WER 4,21 % en test propio |
| nvidia/parakeet-tdt_ctc-110m | 110 M | Inglés (base) | CC-BY-4.0 | Modelo base; no ajustado a rumano |
| Otros ASR rumanos | no disponible | Rumano | no disponible | No se dispone de datos comparativos en la información |

## Limitaciones y advertencias

- Solo funciona correctamente con el decodificador CTC (`m.cur_decoder = "ctc"`); el decodificador TDT por defecto produce salidas inutilizables.
- El uso de KenLM requiere `pyctcdecode` y `kenlm`, y añadir manualmente el token blank al vocabulario de 1024 tokens.
- El rendimiento en FLEURS es notablemente peor (9,67 % con 4-gram), lo que indica degradación en dominios o acentos alejados del entrenamiento.
- El 51 % de las horas de entrenamiento son sintéticas (73,5 h de 143,77 h), lo que puede introducir sesgos hacia las características del TTS usado.
- El split de evaluación es fijo y propio; los resultados "no vistos" no equivalen a una evaluación externa independiente.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o vocabulario especializado.
- Licencia CC-BY-4.0: permite uso comercial con atribución a NVIDIA y a VorbaVine; no se especifican restricciones adicionales.
- Sin datos publicados de cuantización, latencia ni throughput para planificación en producción.

## Enlaces

- Hugging Face: https://huggingface.co/VorbaVine/parakeet-ctc-110m-vv-ro
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
