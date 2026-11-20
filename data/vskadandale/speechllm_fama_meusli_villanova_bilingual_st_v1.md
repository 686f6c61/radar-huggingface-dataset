# vskadandale/speechllm_fama_meusli_villanova_bilingual_st_v1

## Resumen

SpeechLLM FAMA × MEUSLI × Villanova es un modelo de traducción de voz (speech-to-text translation) bidireccional italiano-inglés desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK). Combina tres piezas: el codificador de voz FAMA (FBK-MT/fama-medium-asr, congelado), un proyector lineal inicializado desde el proyector MEUSLI para Villanova-2B, y el modelo de lenguaje Villanova-2B (congelado y adaptado con LoRA). El repositorio publicado contiene únicamente los 14,16 millones de parámetros entrenados (proyector de 9,44 M y adaptadores LoRA de 4,72 M); el codificador y el LLM se descargan por separado.

El modelo resuelve la traducción directa de audio a texto en ambos sentidos (italiano→inglés e inglés→italiano) con un único checkpoint, seleccionando la dirección mediante un prompt textual fijo. Está construido sobre el framework SLAM-LLM con un fork propio (Villanova-Speech-LLM) y se entrenó sobre 463.992 enunciados de Common Voice 17.0, FLEURS, MLS y LibriSpeech, con objetivos generados por traducción automática mediante EuroLLM-1.7B-Instruct.

Es relevante como ejemplo de adaptación eficiente de parámetros (PEFT) en el dominio del habla: con solo 14 M de parámetros entrenables sobre componentes congelados alcanza 49,25 BLEU en italiano→inglés y 41,26 BLEU en inglés→italiano sobre el conjunto de test interno. La licencia CC BY 4.0 facilita su reutilización, aunque el estado del repositorio (sin descargas ni validación externa) aconseja evaluarlo con cautela antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLLM: codificador de voz FAMA (congelado) + proyector lineal + LLM Villanova-2B (congelado, adaptado con LoRA) |
| Parametros totales | 14,16 M entrenados en el repositorio (proyector 9,44 M + LoRA 4,72 M); el total efectivo incluye FAMA y Villanova-2B, no disponibles en este repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (context_length del LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it) e inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`); el codificador y el LLM se descargan por separado desde sus repositorios |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón estándar de un speechLLM: FAMA procesa características de filterbank de 80 dimensiones con CMVN y produce representaciones de dimensión 1024; un proyector lineal (Linear 2048→2048, ReLU, Linear 2048→2560, con factor de submuestreo 2) las alinea con el espacio de embeddings de Villanova-2B, cuyo `llm_dim` es 2560. El proyector se inicializa desde el checkpoint MEUSLI v2 para Villanova-2B, entrenado originalmente con Whisper large-v3-turbo; como la primera capa de MEUSLI no coincide con el tamaño de salida de FAMA, esa capa se reinicializa y el resto se carga. El codificador y el LLM permanecen congelados; solo se entrenan el proyector y adaptadores LoRA (r=32, alpha=32, dropout=0,05) sobre `q_proj` y `v_proj`.

El entrenamiento se realizó con `torchrun` en una única GPU NVIDIA A100 de 64 GB (partición Booster de CINECA Leonardo), con precisión fp16, AdamW (weight_decay 0), batch de 2 con acumulación de gradiente de 2, 4 épocas, warmup lineal de 1000 pasos y un total declarado de 1.000.000 de pasos con lr 1e-4. Los datos son la versión de traducción del conjunto bilingüe ASR: 463.992 enunciados de entrenamiento (Common Voice 17.0: 169.771; FLEURS: 2.602; MLS italiano y LibriSpeech-960: 59.623), con objetivos en minúsculas generados traduciendo cada transcripción con EuroLLM-1.7B-Instruct. La dirección de traducción se controla mediante dos prompts fijos con espacio final incluido: `"Translate Italian speech to English text. "` y `"Translate English speech to Italian text. "`. La decodificación emplea búsqueda por haces con 4 haces y un máximo de 200 tokens nuevos.

## Capacidades

- Traducción de voz a texto bidireccional italiano→inglés e inglés→italiano con un único checkpoint.
- Procesamiento de audio en bruto mediante características de filterbank de 80 dimensiones (no requiere transcripción previa).
- Selección de dirección de traducción mediante prompt textual fijo.
- Generación de texto condicionada a audio a través del LLM Villanova-2B subyacente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a italiano e inglés.
- Capacidades especiales (modo thinking, visión, audio de salida): no disponible.

## Casos de uso

- Subtitulado automático italiano-inglés en directo o en diferido: el modelo traduce directamente el audio sin pasar por una transcripción intermedia, lo que reduce la latencia acumulada en pipelines de subtitulado.
- Localización de contenido audiovisual: traducción de pódcast, entrevistas y vídeos formativos entre italiano e inglés con un solo modelo para ambas direcciones, simplificando el despliegue.
- Atención al cliente bilingüe: integración en un sistema de voz que reciba audio del usuario en italiano o inglés y genere la traducción textual para agentes o para un TTS posterior.
- Generación de subtítulos para reuniones corporativas entre equipos italianos e ingleses, aprovechando el contexto de 4096 tokens del LLM para frases largas.
- Investigación en speechLLM: el repositorio publica solo los parámetros entrenados (proyector + LoRA), lo que lo convierte en un punto de partida ligero para experimentos de adaptación PEFT sobre codificadores y LLM congelados.
- Evaluación comparativa de proyectores: al inicializarse desde MEUSLI, sirve como referencia para estudiar la transferencia de proyectores entre codificadores de voz distintos (Whisper frente a FAMA).
- Fine-tuning posterior sobre dominios específicos (médico, legal, técnico) gracias a los scripts de entrenamiento publicados en el repositorio Villanova-Speech-LLM.

## Benchmarks y rendimiento

| Conjunto de test | Metrica | Resultado |
|---|---|---|
| large (en-it) test, italiano→inglés | BLEU | 49,25 |
| large (en-it) test, inglés→italiano | BLEU | 41,26 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas con otros modelos de traducción de voz. El BLEU se calcula sobre texto normalizado con decodificación por haces de tamaño 4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio solo contiene 14,16 M de parámetros (0,1 GB), pero la inferencia requiere cargar FAMA y Villanova-2B completos, cuyos requisitos no se detallan en la información disponible.
- GPU de entrenamiento documentada: una NVIDIA A100 de 64 GB (CINECA Leonardo Booster) con fp16.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño real de FAMA y Villanova-2B, no especificado.
- Opciones de despliegue: scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de traducción de voz (por ejemplo, SeamlessM4T, Whisper con traducción o sistemas cascada), ni datos de parámetros totales de FAMA y Villanova-2B que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La decodificación no incorpora protección contra repeticiones: algunos enunciados pueden entrar en bucle hasta el límite de 200 tokens, y en datos fuera de dominio afecta a más casos. Se recomienda añadir `no_repeat_ngram_size`, un `repetition_penalty` suave o un límite de longitud ligado a la duración del audio.
- Solo cubre italiano e inglés; no hay soporte para otras lenguas.
- El repositorio contiene únicamente proyector y adaptadores LoRA; es imprescindible descargar FAMA y Villanova-2B por separado y cargar MEUSLI antes del checkpoint, lo que añade complejidad de despliegue.
- Los objetivos de entrenamiento se generaron por traducción automática con EuroLLM-1.7B-Instruct, por lo que el modelo puede heredar errores y sesgos de ese sistema.
- Riesgo de alucinación inherente al LLM subyacente, no cuantificado en la información disponible.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar las licencias de los componentes base (FAMA y Villanova-2B) antes de producción.
- Repositorio sin descargas ni validación externa en el momento de la consulta; los resultados de BLEU proceden únicamente del autor.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vskadandale/speechllm_fama_meusli_villanova_bilingual_st_v1
- Codificador FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- Modelo de lenguaje Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI v2 para Villanova-2B: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Repositorio de código Villanova-Speech-LLM: https://github.com/vskadandale/Villanova-Speech-LLM
