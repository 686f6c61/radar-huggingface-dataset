# SpeechTek/speechllm_fama_meusli_villanova_bilingual_st_v1

## Resumen

SpeechLLM FAMA × MEUSLI × Villanova es un modelo de traducción de voz bidireccional italiano-inglés desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK). Se trata de un sistema speech-to-text translation que combina tres componentes: el codificador de voz FAMA (FBK-MT/fama-medium-asr), un proyector lineal inicializado a partir del proyector MEUSLI para Villanova-2B, y el modelo de lenguaje Villanova-2B adaptado mediante LoRA. El resultado es un único modelo capaz de traducir voz en ambas direcciones (italiano→inglés e inglés→italiano) sin necesidad de dos sistemas separados.

El repositorio publicado contiene únicamente los 14,16 millones de parámetros entrenados (9,44M del proyector y 4,72M de los adaptadores LoRA); el codificador y el LLM permanecen congelados y deben descargarse por separado. El modelo se construyó sobre el framework SLAM-LLM (con el fork Villanova-Speech-LLM) y está pensado para investigación y evaluación en traducción de voz, no como un producto listo para producción.

Su relevancia radica en la eficiencia del enfoque: al congelar encoder y LLM y entrenar solo proyector y LoRA, se obtiene un sistema bilingüe de traducción de voz con un coste de entrenamiento muy reducido (una sola GPU A100 de 64 GB) y un checkpoint de apenas 0,1 GB. La licencia CC BY 4.0 facilita su reutilización con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLLM (encoder de voz FAMA + proyector lineal + LLM Villanova-2B con LoRA) |
| Parametros totales | No disponible (solo se publican 14,16M entrenados: 9,44M proyector + 4,72M LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (context_length del LLM) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Italiano (it) e inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) |
| Entrada de audio | Filterbank de 80 dimensiones con CMVN |
| Dimension del encoder | 1024 |
| Dimension del LLM | 2560 |
| Proyector | Linear 2048→2048, ReLU, Linear 2048→2560; ds_rate 2 |
| LoRA (r / alpha / dropout) | 32 / 32 / 0,05; modulos q_proj, v_proj |
| Decodificacion | Beam search, 4 haces, max 200 tokens nuevos, repetition_penalty 1,0 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura speechLLM modular de tres etapas. El audio se procesa como filterbank de 80 dimensiones con normalización CMVN y entra en el codificador FAMA (FBK-MT/fama-medium-asr, congelado), que produce representaciones de dimensión 1024. Un proyector lineal (Linear 2048→2048 con ReLU, seguido de Linear 2048→2560, con tasa de submuestreo 2) mapea esas representaciones al espacio del modelo de lenguaje. El proyector se inicializa desde SpeechTek/MEUSLI_projector_v2_Villanova_2B; dado que MEUSLI se entrenó con Whisper large-v3-turbo y su primera capa no coincide con la salida de FAMA, esa capa se reinicializa y el resto se carga. Finalmente, el LLM Villanova-2B (VillanovaAI/Villanova-2B-2603, congelado) recibe las representaciones proyectadas y genera la traducción, con adaptadores LoRA entrenados en q_proj y v_proj.

El entrenamiento se realizó con torchrun en una única GPU NVIDIA A100 de 64 GB (partición Booster de CINECA Leonardo), usando el fork Villanova-Speech-LLM de SLAM-LLM. Se entrenaron todos los parámetros del proyector y de los adaptadores LoRA, manteniendo congelados encoder y LLM. Los datos son la versión de traducción de voz del conjunto bilingüe de ASR: el mismo audio con objetivos generados traduciendo cada transcripción con EuroLLM-1.7B-Instruct. Los totales son 463.992 utterances de entrenamiento, 33.576 de validación y 34.128 de test, sumando ambos idiomas, procedentes de Common Voice 17.0, FLEURS, MLS italiano y LibriSpeech-960. Hiperparámetros clave: 4 épocas, lr 1e-4 con warmup lineal de 1.000 pasos, AdamW sin weight decay, batch 2 con acumulación de gradiente 2, fp16, beam search de 4 haces en decodificación. Los objetivos de entrenamiento están en minúsculas y el prompt se selecciona según la dirección de traducción de cada ejemplo.

## Capacidades

- Traducción de voz bidireccional italiano→inglés e inglés→italiano con un único modelo.
- Transcripción y comprensión de audio en italiano e inglés mediante el codificador FAMA.
- Generación de texto en el idioma destino condicionada por un prompt explícito de dirección de traducción.
- Soporte de prompts de instrucción fijos: `"Translate Italian speech to English text. "` y `"Translate English speech to Italian text. "` (con espacio final).
- Capacidad de ajuste fino adicional mediante los scripts del repositorio Villanova-Speech-LLM.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de salida ni modo thinking.

## Casos de uso

- Traducción de reuniones bilingües italiano-inglés: el modelo puede transcribir y traducir intervenciones en ambos sentidos usando el prompt adecuado por turno, aprovechando el contexto de 4096 tokens del LLM para mantener coherencia en segmentos largos.
- Subtitulado automático de contenido audiovisual: integrado en un pipeline que segmenta el audio y llama al modelo con el prompt de dirección correcto, genera subtítulos traducidos para vídeo en italiano o inglés.
- Atención al cliente multilingüe: permite transcribir y traducir llamadas de usuarios italófonos o anglófonos hacia el idioma del operador, reduciendo la dependencia de traductores humanos en primer nivel.
- Investigación en traducción de voz (ST): sirve como baseline reproducible y ligero para experimentos académicos, al publicar solo proyector y LoRA y permitir reproducir el entrenamiento con los scripts de SLAM-LLM.
- Evaluación de arquitecturas speechLLM: al combinar un encoder ASR con un LLM congelado, es útil para estudiar el efecto de distintas inicializaciones de proyector y configuraciones LoRA en tareas de traducción.
- Prototipado de asistentes de voz bilingües: el checkpoint de 0,1 GB y la posibilidad de ejecutarlo con el LLM de 2B permiten desplegar prototipos en entornos con recursos limitados, siempre que se gestione la decodificación con límites de longitud.
- Generación de datos sintéticos de traducción: el modelo puede producir traducciones de referencia para aumentar datasets de ST en dominios concretos, con revisión humana posterior.

## Benchmarks y rendimiento

| Conjunto de test | Metrica | Resultado |
|---|---|---|
| large (en-it) test, italiano→inglés | BLEU | 49,25 |
| large (en-it) test, inglés→italiano | BLEU | 41,26 |

BLEU calculado sobre texto normalizado, con beam search de tamaño 4. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una A100 de 64 GB, pero la inferencia con encoder FAMA + LLM de 2B en fp16 debería requerir sustancialmente menos.
- GPU recomendadas: NVIDIA A100 (validada para entrenamiento); para inferencia se puede considerar H100, A100 o GPUs consumer de gama alta con suficiente VRAM, aunque no se documentan pruebas.
- Cabe en GPU consumer: no confirmado; depende del tamaño del encoder FAMA y del LLM Villanova-2B, no especificados en la ficha.
- Opciones de despliegue: scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de traducción de voz (por ejemplo, SeamlessM4T, Whisper-based ST o sistemas cascada), ni datos de parámetros totales que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sin guarda de repetición en decodificación: algunas utterances del test pueden entrar en bucle hasta el límite de 200 tokens; en datos fuera de dominio afecta a más utterances. Se recomienda añadir `no_repeat_ngram_size`, un `repetition_penalty` suave o un límite de longitud ligado al audio.
- Solo soporta italiano e inglés; no se documentan otros idiomas.
- El modelo está entrenado con objetivos en minúsculas y prompts fijos con espacio final; desviarse de ese formato puede degradar el rendimiento.
- Riesgo de alucinación inherente a los LLM: el LLM Villanova-2B está congelado y adaptado solo con LoRA, por lo que puede generar contenido no fiel al audio en condiciones ruidosas o fuera de dominio.
- Sesgos: no se documentan análisis de sesgo; al entrenarse con Common Voice, FLEURS, MLS y LibriSpeech, puede heredar sesgos demográficos y de dominio de esos corpus.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el modelo base Villanova-2B y el encoder FAMA tienen sus propias licencias que deben verificarse por separado.
- El repositorio solo contiene proyector y LoRA (0,1 GB); es imprescindible descargar FAMA, Villanova-2B y el checkpoint MEUSLI para poder ejecutarlo.
- Sin datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de latencia/throughput, lo que limita la evaluación comparativa.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de uso muy limitado y poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/SpeechTek/speechllm_fama_meusli_villanova_bilingual_st_v1
- Codigo (Villanova-Speech-LLM): https://github.com/vskadandale/Villanova-Speech-LLM
- Encoder FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- LLM Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
