# vskadandale/speechllm_fama_meusli_villanova_st_en2it_v1

## Resumen

FAMA × MEUSLI × Villanova es un modelo de traducción de voz (speech translation, ST) inglés→italiano desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK). Se construye sobre el framework SLAM-LLM combinando tres componentes: el codificador de voz FAMA-medium-asr (congelado), un proyector lineal inicializado a partir del proyector MEUSLI para Villanova-2B, y el modelo de lenguaje Villanova-2B (congelado y adaptado con LoRA). El repositorio contiene únicamente los 14,16 M de parámetros entrenados (9,44 M del proyector y 4,72 M de los adaptadores LoRA); el codificador y el LLM se descargan por separado.

El modelo resuelve el problema de traducir directamente audio en inglés a texto en italiano sin pasar por una transcripción intermedia explícita, siguiendo el paradigma speechLLM. Es relevante por su enfoque modular y ligero: al congelar encoder y LLM y entrenar solo proyector y LoRA, el coste de adaptación se reduce drásticamente, y el checkpoint publicado ocupa apenas 0,1 GB.

La arquitectura emplea una ventana de contexto de 4096 tokens, entrada de filterbank mel de 80 dimensiones con CMVN, y un LLM de dimensión 2560. Está pensado exclusivamente para el par de idiomas inglés→italiano y se distribuye bajo licencia CC BY 4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechLLM: encoder de voz FAMA (congelado) + proyector lineal + LLM Villanova-2B (congelado, LoRA) |
| Parámetros totales | 14,16 M entrenados (9,44 M proyector + 4,72 M LoRA); encoder y LLM descargados aparte |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible (entrenamiento en fp16) |
| Idiomas soportados | inglés (entrada), italiano (salida) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma speechLLM del framework SLAM-LLM. El codificador FAMA-medium-asr recibe características de filterbank mel de 80 dimensiones con normalización CMVN y produce representaciones de dimensión 1024. Un proyector lineal (Linear 2048→2048, ReLU, Linear 2048→2560) con tasa de submuestreo 2 mapea esas representaciones al espacio del LLM Villanova-2B, de dimensión 2560. El proyector se inicializa desde el checkpoint MEUSLI v2 para Villanova-2B; dado que MEUSLI se entrenó con Whisper large-v3-turbo y su primera capa no coincide con el tamaño de salida de FAMA, esa primera capa se reinicializa y el resto se carga.

Durante el entrenamiento se congelan tanto el encoder como el LLM; solo se entrenan el proyector y los adaptadores LoRA (r=32, alpha=32, dropout=0,05, aplicados a `q_proj` y `v_proj`). Los datos de entrenamiento son audio en inglés de VoxPopuli, con objetivos en italiano generados traduciendo las transcripciones inglesas mediante EuroLLM-1.7B-Instruct (no traducciones humanas). El entrenamiento se ejecutó con `torchrun` en una única GPU NVIDIA A100 de 64 GB de la partición Leonardo Booster de CINECA, con 4 épocas, AdamW (weight_decay 0), learning rate 1e-4 con warmup lineal de 1000 pasos, batch de 2 con acumulación de gradiente de 2, y fp16. Los objetivos de entrenamiento están en minúsculas. El prompt fijo de entrenamiento e inferencia es `"Translate English speech to Italian text. "` (el espacio final forma parte del prompt).

## Capacidades

- Traducción directa de voz inglés→italiano a texto (speech translation monolingüe).
- Procesamiento de audio mediante características filterbank mel de 80 dimensiones con CMVN.
- Generación de texto con decodificación por beam search (4 haces, máximo 200 tokens nuevos).
- Adaptación eficiente mediante LoRA sobre un LLM congelado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al par inglés→italiano.

## Casos de uso

- Traducción de reuniones y conferencias en inglés a subtítulos en italiano: el modelo convierte directamente el audio en texto italiano, adecuado para generar subtítulos en directo o diferidos de charlas técnicas.
- Localización de contenido audiovisual: traducción de pódcast, entrevistas o vídeos en inglés a transcripciones italianas para doblaje o subtitulado, aprovechando que el checkpoint es ligero y desplegable junto a sus componentes base.
- Investigación en speechLLM: base reproducible para experimentar con proyectores y LoRA en traducción de voz, dado que el repositorio incluye scripts de entrenamiento y decodificación.
- Prototipado de asistentes de traducción en atención al cliente: integración en un pipeline que reciba audio del cliente en inglés y devuelva texto en italiano para agentes o sistemas de ticketing.
- Evaluación comparativa de arquitecturas modulares: referencia para estudiar el impacto de inicializar el proyector desde MEUSLI frente a entrenarlo desde cero.
- Generación de corpus traducidos para entrenamiento: uso del modelo para producir traducciones automáticas inglés→italiano a partir de audio, con revisión humana posterior.
- Docencia y demos de traducción de voz: despliegue en entornos académicos con recursos limitados gracias al reducido tamaño del checkpoint entrenado.

## Benchmarks y rendimiento

| Conjunto de test | Métrica | Resultado |
|---|---|---|
| VoxPopuli inglés→italiano (test) | BLEU | 57,75 |

La métrica BLEU se calcula sobre texto normalizado con decodificación por beam search de tamaño 4. Las referencias (tanto de entrenamiento como de test) fueron generadas con EuroLLM-1.7B-Instruct, por lo que el BLEU mide la concordancia con esas referencias y no con traducciones humanas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint entrenado ocupa 0,1 GB, pero requiere cargar además el encoder FAMA y el LLM Villanova-2B, cuyo consumo conjunto no se detalla.
- GPU de entrenamiento documentada: una NVIDIA A100 de 64 GB (CINECA Leonardo Booster).
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño de Villanova-2B y del encoder FAMA, no especificados en la información.
- Opciones de despliegue: scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM) mediante `torchrun`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FAMA × MEUSLI × Villanova (este) | 14,16 M entrenados (proyector + LoRA) | 4096 | ST en→it | CC BY 4.0 | Hugging Face |
| Whisper large-v3-turbo | no disponible | no disponible | ASR/ST multilingüe | no disponible | no disponible |
| EuroLLM-1.7B-Instruct | 1,7 B | no disponible | traducción de texto | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de estos modelos en la información proporcionada; la comparación se limita a los componentes citados en la model card.

## Limitaciones y advertencias

- La decodificación no incluye protección contra repeticiones, por lo que algunas locuciones pueden entrar en bucle hasta el límite de 200 tokens; en datos fuera de dominio afecta a más locuciones. Se recomienda añadir `no_repeat_ngram_size`, una `repetition_penalty` moderada o un límite de longitud ligado al audio.
- Las referencias de traducción (entrenamiento y test) fueron generadas con EuroLLM-1.7B-Instruct y no por traductores humanos, por lo que el BLEU mide concordancia con esas referencias automáticas.
- Se realizó una única ejecución de entrenamiento por configuración; diferencias inferiores a 0,5 WER/BLEU están dentro de la variación entre ejecuciones.
- El modelo solo cubre inglés→italiano; no se documenta soporte para otras direcciones ni otros idiomas.
- El prompt debe incluir el espacio final exacto (`"Translate English speech to Italian text. "`); un cambio puede degradar el comportamiento.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar las licencias de los componentes base (FAMA, Villanova-2B, MEUSLI) antes de un despliegue en producción.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vskadandale/speechllm_fama_meusli_villanova_st_en2it_v1
- Código (Villanova-Speech-LLM): https://github.com/vskadandale/Villanova-Speech-LLM
- Encoder FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- LLM Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
