# vskadandale/speechllm_fama_meusli_villanova_bilingual_asr_v1

## Resumen

El modelo `speechllm_fama_meusli_villanova_bilingual_asr_v1` es un sistema de reconocimiento automático del habla (ASR) bilingüe italiano-inglés desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK). Se construye sobre el framework SLAM-LLM y combina tres componentes: el codificador de voz FAMA-medium-asr (congelado), un proyector lineal inicializado a partir del proyector MEUSLI v2 para Villanova-2B, y el modelo de lenguaje Villanova-2B (congelado) adaptado mediante LoRA. El repositorio contiene únicamente los 14,16 millones de parámetros entrenados (9,44 M del proyector y 4,72 M de los adaptadores LoRA); el codificador y el LLM se descargan por separado.

La propuesta resuelve el problema de disponer de un único modelo ASR que cubra dos idiomas sin duplicar infraestructura, aprovechando un LLM congelado de 2B parámetros y un codificador acústico ya entrenado. El entrenamiento se realizó sobre un conjunto balanceado de 463.992 enunciados de entrenamiento (Common Voice 17.0, FLEURS, MLS italiano y LibriSpeech-960), con 33.576 de validación y 34.128 de test, repartidos entre italiano e inglés.

Es relevante porque demuestra que es posible adaptar un speechLLM bilingüe entrenando solo 14,16 M de parámetros sobre componentes congelados, con un WER del 8,45 % en italiano y del 11,94 % en inglés en su conjunto de test, y un 7,09 % en Common Voice 17.0 italiano. La ventana de contexto del LLM es de 4096 tokens y la licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLLM: codificador FAMA (frozen) + proyector lineal + LLM Villanova-2B (frozen) con adaptadores LoRA |
| Parametros totales | 14,16 M entrenados en este repositorio (proyector 9,44 M + LoRA 4,72 M); el LLM base Villanova-2B y el codificador FAMA se descargan aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (context_length del LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.pt` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón de un speechLLM: el codificador acústico FAMA-medium-asr procesa características de filterbank de 80 dimensiones con CMVN y produce representaciones de dimensión 1024; un proyector lineal (Linear 2048→2048, ReLU, Linear 2048→2560, con `encoder_projector_ds_rate=2`) las alinea con la dimensión del LLM (2560); y el LLM Villanova-2B genera la transcripción. El proyector se inicializa desde MEUSLI_projector_v2_Villanova_2B, entrenado originalmente con Whisper large-v3-turbo; como la primera capa no coincide con la salida de FAMA, esa capa se reinicializa y el resto se carga. El codificador y el LLM permanecen congelados; solo se entrenan el proyector y los adaptadores LoRA (r=32, alpha=32, dropout 0,05, módulos `q_proj` y `v_proj`).

El entrenamiento se ejecutó con `torchrun` en una única GPU NVIDIA A100 de 64 GB (partición Booster de CINECA Leonardo) usando el fork Villanova-Speech-LLM de SLAM-LLM. Se usaron 4 épocas, learning rate 1e-4 con warmup lineal de 1000 pasos y decaimiento lineal hasta `total_steps=1.000.000`, optimizador AdamW (weight_decay 0), batch de 4, fp16 activado y DDP. Los datos de entrenamiento son un conjunto balanceado italiano-inglés (`large (en-it)`) con 463.992 enunciados de entrenamiento, 33.576 de validación y 34.128 de test, procedentes de Common Voice 17.0, FLEURS, MLS italiano y LibriSpeech-960. Las transcripciones objetivo están en minúsculas y el prompt fijo usado en entrenamiento e inferencia es `"Transcribe speech to text."`. La decodificación emplea búsqueda por haces con 4 haces y un máximo de 200 tokens nuevos.

## Capacidades

- Reconocimiento automático del habla bilingüe italiano-inglés en un único modelo.
- Transcripción de audio con prompt fijo `"Transcribe speech to text."`.
- Manejo de audio con características filterbank de 80 dimensiones y CMVN.
- Decodificación por beam search (4 haces) con hasta 200 tokens nuevos por transcripción.
- Adaptación eficiente mediante LoRA sobre un LLM congelado de 2B parámetros.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.
- No se documentan capacidades multilingües más allá del par italiano-inglés.

## Casos de uso

- Transcripción bilingüe de reuniones y llamadas en entornos italo-inglés: el modelo cubre ambos idiomas en un solo checkpoint, lo que evita mantener dos pipelines ASR separados y simplifica el enrutamiento por idioma.
- Subtitulado automático de contenido audiovisual: con un WER del 7,09 % en Common Voice 17.0 italiano y del 10,12 % en VoxPopuli inglés, es adecuado para generar subtítulos en bruto que luego se revisan o se alinean con herramientas de post-proceso.
- Atención al cliente con transcripción de voz: la ventana de contexto de 4096 tokens del LLM permite procesar segmentos de audio transcritos y encadenarlos en un pipeline de análisis posterior (resumen, extracción de entidades) sin cambiar de modelo.
- Generación de actas y notas en centros de documentación bilingües: el modelo transcribe audio italiano o inglés y el LLM subyacente puede reutilizarse para tareas de post-proceso, aunque el checkpoint solo está entrenado para ASR.
- Investigación en speechLLMs: al publicar solo los 14,16 M de parámetros entrenados (proyector + LoRA) con scripts de entrenamiento en el repositorio Villanova-Speech-LLM, sirve como base reproducible para estudiar adaptación eficiente de codificadores acústicos sobre LLMs congelados.
- Filtrado y moderación de contenido en audio: la transcripción permite aplicar clasificadores de texto posteriores sobre conversaciones en italiano e inglés, aprovechando que el modelo es ligero en parámetros entrenables y desplegable sobre una sola GPU.
- Evaluación comparativa de codificadores acústicos: con resultados publicados en Common Voice 17.0 italiano, VoxPopuli inglés y el test bilingüe propio, permite comparar FAMA frente a otros codificadores en configuraciones speechLLM.

## Benchmarks y rendimiento

| Test set | Métrica | Resultado |
|---|---|---|
| large (en-it) test, parte italiana | WER % | 8,45 |
| large (en-it) test, parte inglesa | WER % | 11,94 |
| large (en-it) test, conjunto agrupado | WER % | 10,08 |
| Common Voice 17.0 italiano (test) | WER % | 7,09 |
| VoxPopuli inglés (test; no en entrenamiento) | WER % | 10,12 |

El WER se calcula tras eliminar puntuación y aplicar `EnglishTextNormalizer` de Whisper para inglés y `BasicTextNormalizer` para italiano, con beam search de tamaño 4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El entrenamiento se realizó en una A100 de 64 GB, pero el checkpoint publicado solo contiene 14,16 M de parámetros; el consumo real depende de si se cargan el codificador FAMA y el LLM Villanova-2B completos (2B parámetros) junto con el proyector y los adaptadores LoRA.
- GPU recomendadas: NVIDIA A100 de 64 GB es la configuración documentada para entrenamiento. Para inferencia, el requisito depende del LLM base Villanova-2B; no se documentan cifras concretas.
- ¿Cabe en GPU de consumo? No disponible. Con el LLM de 2B en fp16 serían necesarios al menos ~4 GB solo para los pesos del LLM, más el codificador y el proyector, pero no hay medición publicada.
- Opciones de despliegue: los scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM) con `torchrun`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Resultado ASR |
|---|---|---|---|---|---|
| speechllm_fama_meusli_villanova_bilingual_asr_v1 (este) | 14,16 M entrenados sobre LLM de 2B | 4096 tokens | it, en | CC BY 4.0 | WER 8,45 % (it), 11,94 % (en) en test propio |
| FBK-MT/fama-medium-asr | no disponible | no disponible | no disponible | no disponible | no disponible |
| VillanovaAI/Villanova-2B-2603 | 2B (LLM base) | 4096 tokens | no disponible | no disponible | no aplica (LLM, no ASR) |
| Whisper large-v3-turbo (usado para entrenar MEUSLI) | no disponible | no disponible | multilingüe | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- La decodificación no incorpora guarda de repetición: algunos enunciados por conjunto de test pueden entrar en bucle hasta el límite de 200 tokens, y en datos fuera de dominio afecta a más enunciados. Se recomienda añadir `no_repeat_ngram_size`, una `repetition_penalty` moderada o un límite de longitud ligado al audio.
- Una sola ejecución de entrenamiento por configuración; las diferencias inferiores a aproximadamente 0,5 WER/BLEU no se consideran significativas.
- Solo cubre italiano e inglés; no se documenta soporte para otros idiomas.
- El prompt de entrenamiento e inferencia es fijo (`"Transcribe speech to text."`); no se documenta comportamiento con otros prompts.
- El repositorio contiene únicamente el proyector y los adaptadores LoRA; es necesario descargar FAMA, Villanova-2B y el checkpoint MEUSLI por separado, lo que añade complejidad de despliegue.
- No se documentan sesgos conocidos ni tasas de alucinación específicas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar las licencias de los componentes base (FAMA, Villanova-2B, MEUSLI) antes de producción.
- El WER en VoxPopuli inglés (10,12 %) corresponde a datos fuera del conjunto de entrenamiento, lo que sugiere cierta degradación en dominios no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vskadandale/speechllm_fama_meusli_villanova_bilingual_asr_v1
- Codificador FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- LLM Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI v2 para Villanova-2B: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Repositorio de código Villanova-Speech-LLM: https://github.com/vskadandale/Villanova-Speech-LLM
