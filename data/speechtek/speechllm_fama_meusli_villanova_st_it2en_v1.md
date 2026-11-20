# SpeechTek/speechllm_fama_meusli_villanova_st_it2en_v1

## Resumen

SpeechTek/speechllm_fama_meusli_villanova_st_it2en_v1 es un modelo de traducción de voz a texto (speech translation, ST) italiano-inglés desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK). No es un modelo monolítico: se trata de un conjunto de 14,16 millones de parámetros entrenados que consta de un proyector lineal (9,44 M) y adaptadores LoRA (4,72 M), que conectan un codificador de voz congelado (FAMA medium ASR) con un modelo de lenguaje también congelado (Villanova-2B), ensamblados mediante el framework SLAM-LLM.

La relevancia del modelo reside en su enfoque de eficiencia: al mantener congelados el codificador y el LLM, solo se entrenan 14,16 M de parámetros, lo que permite adaptar un sistema multimodal de voz a una tarea concreta con recursos de cómputo moderados (una única GPU A100 de 64 GB). El proyector se inicializa desde el checkpoint MEUSLI v2 para Villanova-2B, reutilizando representaciones ya aprendidas y re-inicializando únicamente la primera capa lineal por incompatibilidad de dimensiones con FAMA.

El modelo está pensado exclusivamente para la dirección italiano→inglés, con un prompt fijo de entrenamiento e inferencia (`"Translate Italian speech to English text. "`, con espacio final obligatorio). Su licencia CC BY 4.0 permite uso comercial con atribución, y el repo de pesos ocupa 0,1 GB al no incluir el codificador ni el LLM, que se descargan por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLLM: codificador de voz FAMA (congelado) + proyector lineal + LLM Villanova-2B (congelado, adaptado con LoRA) |
| Parametros totales | 14,16 M entrenados (9,44 M proyector + 4,72 M LoRA); el codificador y el LLM se descargan aparte |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (`context_length`) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye `model.pt` en precisión de entrenamiento; fp16 en entrenamiento) |
| Idiomas soportados | Italiano (entrada de voz) e inglés (salida de texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`); el codificador y el LLM base en sus formatos originales |

## Arquitectura y entrenamiento

El sistema sigue el patrón clásico de speechLLM: un codificador acústico FAMA medium ASR (dimensión de salida 1024) procesa características de filterbank de 80 dimensiones con CMVN, y su salida se proyecta mediante un proyector lineal compuesto por `Linear 2048→2048`, ReLU y `Linear 2048→2560`, con un factor de downsampling de 2 (`encoder_projector_ds_rate=2`). La salida proyectada (2560 dimensiones) se inyecta en el LLM Villanova-2B, cuya dimensión oculta es 2560. El proyector se inicializa desde MEUSLI v2; dado que MEUSLI se entrenó con Whisper large-v3-turbo, la primera capa lineal se re-inicializa por el desajuste de tamaño de salida con FAMA, y el resto de capas se cargan directamente.

El entrenamiento congela tanto el codificador como el LLM y entrena únicamente el proyector y adaptadores LoRA (r=32, alpha=32, dropout=0,05, módulos objetivo `q_proj` y `v_proj`). Se usaron 4 épocas sobre Common Voice 17.0 en italiano, con objetivos en inglés generados traduciendo las transcripciones italianas con EuroLLM-1.7B-Instruct. La optimización emplea AdamW con weight decay 0, learning rate 1e-4 con warmup lineal de 1000 pasos y decaimiento lineal hasta `total_steps` (1.000.000), batch de 4, acumulación de gradientes de 1, fp16 y DDP, sobre una sola GPU NVIDIA A100 de 64 GB del clúster CINECA Leonardo Booster. La decodificación usa búsqueda por haz con 4 haces y un máximo de 200 tokens nuevos.

## Capacidades

- Traducción de voz a texto italiano→inglés en una sola etapa, sin pipeline ASR+MT separado.
- Procesamiento de audio con características filterbank de 80 dimensiones y CMVN.
- Generación de texto en inglés en minúsculas (los objetivos de entrenamiento están normalizados a minúsculas).
- Soporte de decodificación por haz (beam search) configurable.
- Adaptación eficiente mediante LoRA y proyector entrenable, con posibilidad de fine-tuning posterior usando los scripts del repo.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento extendido.
- Capacidad multilingüe limitada estrictamente al par italiano-inglés.

## Casos de uso

- Subtitulado y traducción en directo de contenido audiovisual italiano: el modelo convierte audio italiano en texto inglés con una sola pasada, adecuado para streaming de subtítulos donde se requiere baja latencia y no se dispone de un pipeline ASR+MT separado.
- Localización de reuniones y webinars: integración en herramientas de transcripción para generar actas en inglés a partir de intervenciones en italiano, con contexto de hasta 4096 tokens para tramos largos.
- Atención al cliente en centros de contacto bilingües: traducción de llamadas de clientes italianos a texto inglés para agentes o sistemas de análisis posteriores, con la ventaja de que el LLM subyacente (Villanova-2B) puede generar respuestas coherentes en inglés.
- Generación de corpus paralelos: creación de datos de entrenamiento italiano-inglés a partir de grabaciones de voz, útil para proyectos de traducción automática que necesitan pares alineados.
- Investigación en speechLLM: el modelo sirve como referencia reproducible para estudiar el efecto de proyectores inicializados (MEUSLI) y LoRA en tareas de ST, con un coste de entrenamiento de solo 14,16 M de parámetros.
- Accesibilidad: transcripción y traducción de contenido hablado en italiano para audiencias angloparlantes, por ejemplo en museos, audioguías o materiales educativos.
- Evaluación de frameworks multimodales: banco de pruebas para SLAM-LLM y su fork Villanova-Speech-LLM en escenarios de traducción de voz de un solo par de idiomas.

## Benchmarks y rendimiento

| Test set | Métrica | Resultado |
|---|---|---|
| Common Voice 17.0 italiano→inglés (test) | BLEU | 55,66 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El BLEU se calcula sobre texto normalizado con beam search de tamaño 4, y las referencias fueron generadas por EuroLLM-1.7B-Instruct, no por traductores humanos.

## Requisitos de hardware

- VRAM estimada para inferencia: el sistema completo requiere cargar FAMA medium ASR, el proyector (9,44 M) y Villanova-2B (2B parámetros) más los adaptadores LoRA. En fp16, el LLM de 2B ocupa aproximadamente 4-5 GB, el codificador FAMA medium unos cientos de MB y el proyector es despreciable; el total estimado ronda los 6-8 GB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A100 de 64 GB (CINECA Leonardo Booster). Para inferencia, una GPU con 8-16 GB de VRAM es suficiente en teoría, aunque no se documentan pruebas en consumer.
- ¿Cabe en consumer GPU? Probablemente sí en tarjetas con 8 GB o más (RTX 3070/4060 Ti/4070 en adelante), siempre que se cargue el LLM en fp16 o cuantizado; no hay datos oficiales de despliegue en consumer.
- Opciones de despliegue: los scripts del repo Villanova-Speech-LLM usan PyTorch con `torchrun`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al ser un modelo multimodal con codificador de voz, estos runners no son directamente aplicables sin adaptación.
- Latencia y throughput: no disponibles. La decodificación por haz con 4 haces y hasta 200 tokens nuevos sugiere una latencia moderada, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpeechTek/speechllm_fama_meusli_villanova_st_it2en_v1 | 14,16 M entrenados (proyector + LoRA) sobre FAMA + Villanova-2B | 4096 | ST italiano→inglés | CC BY 4.0 | Hugging Face (repo de 0,1 GB) |
| Whisper large-v3 | 1550 M | 448 tokens de audio | ASR multilingüe (no traducción directa a inglés desde italiano en una sola etapa sin fine-tuning) | MIT | Hugging Face, ampliamente soportado |
| SeamlessM4T v2 | ~2300 M | no disponible | ST y ASR multilingüe | CC BY-NC 4.0 | Hugging Face (no comercial) |

La comparación es orientativa: no se dispone de benchmarks cruzados entre estos modelos en la información proporcionada, y las diferencias de licencia (CC BY 4.0 frente a CC BY-NC 4.0 de SeamlessM4T) son relevantes para uso comercial.

## Limitaciones y advertencias

- La decodificación no incluye guarda de repetición, por lo que algunas locuciones pueden entrar en bucle hasta el límite de 200 tokens; en datos fuera de dominio afecta a más utterances. Se recomienda añadir `no_repeat_ngram_size`, un `repetition_penalty` suave o un límite de longitud ligado al audio.
- Las referencias de entrenamiento y test fueron generadas con EuroLLM-1.7B-Instruct, no por traductores humanos; el BLEU mide la concordancia con esas referencias, no con traducción humana de referencia.
- Se realizó una sola ejecución de entrenamiento por configuración; diferencias inferiores a 0,5 WER/BLEU están dentro de la variación entre ejecuciones.
- El prompt es fijo y debe incluir el espacio final: `"Translate Italian speech to English text. "`. Un prompt distinto puede degradar el rendimiento.
- El modelo solo cubre italiano→inglés; no soporta otras direcciones ni otros pares de idiomas.
- Riesgo de alucinación inherente al LLM subyacente, especialmente en audio ruidoso o fuera de dominio.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el modelo base Villanova-2B y FAMA tienen sus propias licencias que deben verificarse por separado.
- El repo solo contiene `model.pt` (proyector + LoRA); es necesario descargar FAMA, Villanova-2B y el checkpoint MEUSLI por separado y respetar el orden de carga de los scripts.
- No se documentan sesgos específicos más allá de los heredados de Common Voice y del LLM base.

## Enlaces

- Hugging Face: https://huggingface.co/SpeechTek/speechllm_fama_meusli_villanova_st_it2en_v1
- Codificador FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- LLM Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Repositorio de código: https://github.com/vskadandale/Villanova-Speech-LLM
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
