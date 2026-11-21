# TeamUNIVA/qwen3_asr_1.7b_ko_beta

## Resumen

TeamUNIVA/qwen3_asr_1.7b_ko_beta es un modelo de reconocimiento automático del habla (ASR) para coreano, desarrollado por TeamUNIVA mediante ajuste fino del modelo base Qwen/Qwen3-ASR-1.7B. El modelo resuelve el problema de la transcripción de audio en coreano con tasas de error significativamente menores que el modelo base, manteniendo un rendimiento prácticamente idéntico en inglés. Con 2.349.217.408 parámetros reales en safetensors y un repositorio de 4,7 GB, se distribuye bajo licencia Apache 2.0.

El modelo es relevante porque demuestra que un ajuste fino específico sobre un ASR multilingüe de tamaño medio puede reducir el CER agregado en coreano de 0,0686 a 0,0537 (una mejora de 1,49 puntos porcentuales) sin sacrificar capacidades en otros idiomas. Está pensado para desarrolladores que necesitan transcripción de alta precisión en coreano en entornos de producción, con un consumo de recursos moderado.

El autor advierte en la model card que existe un sucesor recomendado, TeamUNIVA/qwen3_asr_1.7b_ko, inicializado a partir de este modelo y con menores tasas de error en los benchmarks coreanos. Este modelo beta debe considerarse, por tanto, una versión intermedia dentro de la línea de ajustes finos de TeamUNIVA sobre Qwen3-ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR-1.7B; arquitectura del transformer no detallada en la informacion proporcionada) |
| Parametros totales | 2.349.217.408 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | coreano (ko); capacidades del modelo base en otros idiomas, con validacion en ingles (LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3-ASR-1.7B sobre datos de habla en coreano para reconocimiento automático del habla. No se detalla en la informacion proporcionada la arquitectura interna del modelo base (tipo de transformer, mecanismos de atención o componentes específicos de audio), ni el volumen o la composición exacta del corpus de entrenamiento empleado en el ajuste fino. Tampoco se especifica si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación.

La innovación técnica destacable no reside en la arquitectura, sino en la metodología de evaluación: el autor construyó un conjunto de evaluación coreano revisado manualmente, con transcripciones duales TN/ITN (normalización de texto e inversa), filtrado de muestras de baja calidad y corrección de transcripciones erróneas. De los 8.489 registros originales se retuvieron 8.383 (106 excluidos), y cada enunciado se puntuó contra ambas transcripciones, tomando la mejor puntuación. Además, se empleó la métrica kocer (v0.1.5), que no penaliza diferencias de espaciado, puntuación, notación numérica ni grafía de acrónimos latinos. Esta rigurosidad metodológica hace que las cifras reportadas sean más fiables que una evaluación ASR convencional sin revisión.

## Capacidades

- Reconocimiento automático del habla (ASR) en coreano con transcripción de audio a texto.
- Rendimiento mejorado en coreano frente al modelo base en cinco benchmarks: clova_call, common_voice_ko, fleurs_ko, ksponspeech y zeroth.
- Mantenimiento de capacidades en inglés: WER de 0,0246 en LibriSpeech frente a 0,0250 del modelo base.
- Procesamiento por lotes: la API de ejemplo permite `max_inference_batch_size=32`.
- Control de la longitud de salida mediante `max_new_tokens` (256 en el ejemplo).
- Integración mediante el paquete `qwen-asr` con la clase `Qwen3ASRModel`.
- Soporte de inferencia en bfloat16 sobre GPU (`device_map="cuda:0"`).
- No se documentan en la informacion proporcionada capacidades de tool calling, agentes, visión, audio de entrada más allá del ASR ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo obtiene un CER de 0,0293 en clova_call, el benchmark de llamadas telefónicas, lo que lo hace adecuado para generar transcripciones y actas de conversaciones telefónicas en coreano con fines de calidad o análisis.
- Subtitulado y transcripción de contenido audiovisual: con CER de 0,0138 en fleurs_ko, es apto para generar subtítulos en coreano de audio leído y limpio, como pódcasts, cursos o vídeos divulgativos.
- Documentación clínica y legal dictada: el CER de 0,0628 en common_voice_ko sugiere un rendimiento razonable en habla espontánea de distintos hablantes, útil para borradores de transcripción que luego revisa un profesional.
- Procesamiento por lotes de archivos de audio a gran escala: la API permite lotes de hasta 32 elementos y el modelo cabe en una sola GPU, lo que facilita pipelines de transcripción masiva con `qwen-asr`.
- Análisis de conversaciones de contact center: la combinación de bajo CER en llamadas y la preservación del rendimiento en inglés permite procesar conversaciones mixtas coreano-inglés en entornos bilingües.
- Investigación en ASR coreano: el conjunto de evaluación revisado y publicado en TeamUNIVA/ko_asr_benchmarks, junto con la métrica kocer, ofrece una base reproducible para comparar nuevos modelos.
- Sistemas de voz a texto para accesibilidad: integración en aplicaciones que convierten dictado o audio en directo a texto para usuarios coreanohablantes, con la ventaja de una licencia Apache 2.0 que permite uso comercial.

## Benchmarks y rendimiento

Las puntuaciones coreanas se miden en CER (Character Error Rate) y la inglesa en WER (Word Error Rate); en ambos casos, menor es mejor.

| Dataset | Metrica | Qwen3-ASR-1.7B (base) | Este modelo | Cambio (%p) |
|---|---|---|---|---|
| clova_call | CER | 0,0448 | 0,0293 | -1,55 |
| common_voice_ko | CER | 0,0719 | 0,0628 | -0,91 |
| fleurs_ko | CER | 0,0142 | 0,0138 | -0,04 |
| ksponspeech | CER | 0,0865 | 0,0670 | -1,95 |
| zeroth | CER | 0,0264 | 0,0230 | -0,34 |
| Coreano total | CER | 0,0686 | 0,0537 | -1,49 |
| librispeech (ingles, referencia) | WER | 0,0250 | 0,0246 | -0,04 |

Evaluación adicional con kocer (v0.1.5):

| Dataset | Metrica | Qwen3-ASR-1.7B (base) | Este modelo | Cambio (%p) |
|---|---|---|---|---|
| clova_call | CER (kocer) | 0,0429 | 0,0280 | -1,49 |
| common_voice_ko | CER (kocer) | 0,0718 | 0,0628 | -0,90 |
| fleurs_ko | CER (kocer) | 0,0127 | 0,0125 | -0,02 |
| ksponspeech | CER (kocer) | 0,0860 | 0,0664 | -1,96 |
| zeroth | CER (kocer) | 0,0253 | 0,0202 | -0,51 |
| Coreano total | CER (kocer) | 0,0679 | 0,0528 | -1,51 |

Conjunto de evaluación tras revisión manual (8.383 de 8.489 registros retenidos):

| Dataset | Registros retenidos |
|---|---|
| clova_call | 1.083 |
| common_voice_ko | 564 |
| fleurs_ko | 382 |
| zeroth | 449 |
| kspon_eval_clean | 2.946 |
| kspon_eval_other | 2.959 |
| Total | 8.383 |

Según el autor, la puntuación kocer apenas depende de la transcripción de referencia usada: para este modelo, el total coreano es 0,0536 solo con transcripciones TN, 0,0548 solo con ITN y 0,0528 con la mejor de las dos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,7 GB solo para los pesos (2.349.217.408 parámetros × 2 bytes), más el espacio para activaciones y caché; en la práctica, entre 6 y 8 GB para audio de duración moderada.
- El modelo cabe en GPUs de consumo: una RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) son suficientes; incluso GPUs de 8 GB podrían funcionar en bfloat16 con lotes pequeños.
- GPUs profesionales recomendadas para producción con mayor paralelismo: A100 (40/80 GB), H100 (80 GB) o L40S, que permiten lotes de 32 elementos con holgura.
- Opciones de despliegue: el paquete oficial `qwen-asr` con `Qwen3ASRModel.from_pretrained`; no se documentan en la informacion proporcionada integraciones con vLLM, llama.cpp, Ollama o TGI, ni formatos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El ejemplo de la model card emplea `dtype=torch.bfloat16`, `device_map="cuda:0"`, `max_inference_batch_size=32` y `max_new_tokens=256`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER coreano total | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TeamUNIVA/qwen3_asr_1.7b_ko_beta | 2.349.217.408 | no disponible | 0,0537 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B (base) | no disponible (familia 1.7B) | no disponible | 0,0686 | no disponible en la informacion proporcionada | Hugging Face |
| TeamUNIVA/qwen3_asr_1.7b_ko (sucesor) | no disponible | no disponible | inferior a este modelo (segun el autor) | no disponible en la informacion proporcionada | Hugging Face |

No se dispone en la informacion proporcionada de datos de otros modelos ASR coreanos comparables (por ejemplo, Whisper u otros ajustes finos) para establecer una comparativa más amplia.

## Limitaciones y advertencias

- El modelo está ajustado específicamente para reconocimiento de habla en coreano; el rendimiento en otros idiomas puede ser similar al del modelo base o requerir validación independiente.
- Existe un sucesor recomendado por el propio autor, TeamUNIVA/qwen3_asr_1.7b_ko, con menores tasas de error en benchmarks coreanos; para nuevos desarrollos conviene evaluar ese modelo en lugar de esta versión beta.
- La evaluación se realizó sobre los benchmarks listados; en condiciones reales de producción (ruido, variabilidad de hablantes) los resultados pueden diferir.
- No se documentan en la informacion proporcionada sesgos conocidos, riesgos específicos de alucinación ni limitaciones de longitud de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datasets de evaluación originales: clova_call, kspon_eval_clean y kspon_eval_other no se publican por los términos de licencia de sus datasets de origen.
- No se dispone de información sobre cuantizaciones oficiales ni formatos GGUF, lo que puede limitar el despliegue en entornos sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko_beta
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Sucesor recomendado: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Conjuntos de evaluación publicados: https://huggingface.co/datasets/TeamUNIVA/ko_asr_benchmarks
- Repositorio de la métrica kocer: https://github.com/Choi-kwan-u/kocer
