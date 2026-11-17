# zyh200727/PEARL-Qwen3-VL-8B-LoRA

## Resumen

PEARL-Qwen3-VL-8B-LoRA es un adaptador LoRA publicado por zyh200727 (Yuanhong Zheng y colaboradores) que forma parte del sistema PEARL (Personalized Streaming Video Understanding with Runtime-Defined Concepts). El adaptador se aplica sobre Qwen3-VL-8B-Instruct y ensena al modelo base a responder preguntas sobre conceptos que el usuario define en tiempo de ejecucion dentro de un video en streaming. Las preguntas de tipo Real-Time se refieren al clip actual, mientras que las de tipo Past-Time se responden a partir de clips recuperados de memoria.

El adaptador no funciona de forma autonoma: esta disenado para ejecutarse dentro del pipeline PEARL junto al retriever `PEARL-Retriever-Qwen3-VL-Embedding-2B-LoRA`. En ese pipeline, el adaptador se aplica unicamente a la llamada final de respuesta, mientras que la descripcion de conceptos y la reescritura de preguntas se ejecutan sobre el modelo base sin adaptador.

Es relevante para investigadores que trabajan en comprension de video en streaming, personalizacion en tiempo de ejecucion y sistemas de question answering multimodal con memoria. El adaptador tiene solo 15,3 millones de parametros entrenables (rango 16, alpha 32) y pesa 61,4 MB en FP32, lo que lo hace muy ligero frente a los 8 mil millones de parametros del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL-8B-Instruct (adaptador PEFT) |
| Parametros totales | 15,3 M entrenables en el adaptador (modelo base: 8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada maxima durante el entrenamiento (contexto del modelo base: no disponible) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en FP32; el modelo base admite las cuantizaciones de Qwen3-VL) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (sujeta ademas a la licencia del modelo base) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, FP32, 61,4 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a los modulos `q_proj`, `k_proj`, `v_proj` y `o_proj` de las 36 capas del modelo de lenguaje de Qwen3-VL-8B-Instruct. El codificador de vision permanece sin cambios. Se entrena mediante supervised fine-tuning sobre las respuestas, con AdamW (weight decay 0,01), learning rate 1e-4, gradient clipping 1,0, batch efectivo de 8, precision BF16, semilla 42 y 9.140 pasos (aproximadamente dos epocas sobre las cuatro rotaciones de opciones).

Los datos de entrenamiento provienen de PSVU-10K, un conjunto de 10.000 grupos de preguntas construido a partir de videos de YouTube de 155 obras fuente, dividido por obra en 9.000 grupos de entrenamiento y 1.000 de validacion. El adaptador se entrena sobre las 9.000 preguntas de entrenamiento (3.616 Real-Time y 5.384 Past-Time). Cada entrada usa el mismo formato de prompt que la evaluacion de PEARL e incluye la evidencia verificada junto con hasta dos clips negativos verificados; cada pregunta se presenta bajo cuatro rotaciones de opciones. El objetivo del adaptador es que el modelo base ancle los conceptos registrados en el clip actual y responda a partir de la evidencia recuperada.

## Capacidades

- Video question answering en streaming sobre conceptos definidos en tiempo de ejecucion por el usuario.
- Distincion entre preguntas Real-Time (clip actual) y Past-Time (clips recuperados de memoria).
- Grounding de conceptos registrados en el clip actual de video.
- Respuesta a partir de evidencia recuperada, incluyendo clips negativos verificados.
- Comprension multimodal (vision y lenguaje) heredada de Qwen3-VL-8B-Instruct.
- Integracion con vLLM mediante `LoRARequest` y con Transformers + PEFT.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para este adaptador.
- Soporte de agentes y multi-step reasoning: no documentado en la informacion disponible para este adaptador.
- Capacidades multilingues: solo ingles (`en`).

## Casos de uso

- Vigilancia con conceptos personalizados: el usuario registra en tiempo de ejecucion un objeto o entidad concreta y el adaptador responde preguntas sobre su presencia, ubicacion o relaciones en el clip actual del stream.
- Asistencia en directos y retransmisiones: responder preguntas sobre lo que acaba de ocurrir en el clip actual (Real-Time) sin necesidad de reentrenar el modelo para cada nuevo concepto.
- Recuperacion de eventos pasados en video: responder preguntas de tipo Past-Time usando clips recuperados de memoria por el retriever de PEARL, util en resumenes de sesiones largas.
- Analisis de contenido audiovisual para investigacion: evaluar comprension de video en streaming con PSVU-Bench y el pipeline PEARL completo.
- Prototipado de asistentes de video personalizados: desplegar el adaptador sobre Qwen3-VL-8B-Instruct con vLLM habilitando LoRA, aplicandolo solo a la llamada final de respuesta para minimizar el coste.
- Experimentacion academica en personalizacion en tiempo de ejecucion: comparar el rendimiento del adaptador frente al modelo base en las categorias de Presence, Behavior, Appearance, Location, Relation, Action, Event y Time.

## Benchmarks y rendimiento

Resultados de accuracy en PSVU-Bench (una pregunta se considera correcta solo si las cuatro rotaciones de opciones se responden correctamente). † denota entrenamiento sobre PSVU-10K con este adaptador y el retriever de PEARL.

| Metodo | Presence | Behavior | Appearance | Location | Relation | Action | Real-Time Avg | Event | Time | Past-Time Avg | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-VL-8B+PEARL | 63,67 | 50,00 | 55,43 | 52,99 | 53,21 | 48,47 | 53,96 | 52,85 | 48,76 | 50,80 | 52,38 |
| Qwen3-VL-8B+PEARL† | 68,49 | 62,50 | 62,50 | 65,67 | 64,22 | 52,37 | 62,62 | 62,18 | 58,21 | 60,19 | 61,41 |

El entrenamiento mejora todas las categorias. La accuracy de Action sube 3,90 puntos aunque PSVU-10K no contiene conceptos de accion.

## Requisitos de hardware

- El adaptador en si ocupa 61,4 MB en FP32; el requisito real lo determina el modelo base Qwen3-VL-8B-Instruct.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada (depende de la cuantizacion del modelo base de 8 B).
- GPU recomendadas: no especificadas en la informacion disponible; el modelo base de 8 B requiere GPUs con memoria suficiente para su cuantizacion.
- Cabe en GPU de consumo: no confirmado en la informacion disponible para este adaptador.
- Opciones de despliegue: vLLM con `enable_lora=True` y `max_lora_rank=16`; Transformers + PEFT con `Qwen3VLForConditionalGeneration` y `PeftModel`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la informacion disponible. La unica comparacion documentada es frente al mismo sistema sin entrenar el adaptador (Qwen3-VL-8B+PEARL), con los resultados de la tabla de benchmarks.

| Modelo | Parametros | Contexto | Overall PSVU-Bench | Licencia |
|---|---|---|---|---|
| Qwen3-VL-8B+PEARL (sin adaptador) | 8 B | no disponible | 52,38 | Apache-2.0 (base) |
| Qwen3-VL-8B+PEARL† (con adaptador) | 8 B + 15,3 M LoRA | 8.192 tokens de entrada en entrenamiento | 61,41 | Apache-2.0 |

## Limitaciones y advertencias

- El adaptador no es autonomo: requiere el pipeline PEARL y el retriever `PEARL-Retriever-Qwen3-VL-Embedding-2B-LoRA` para el caso de uso completo.
- Solo soporta ingles (`en`); no se documenta soporte multilingue.
- Entrenado exclusivamente sobre PSVU-10K, con conceptos de tipo entidad; el rendimiento en otros dominios o tipos de concepto no esta validado.
- No se han publicado datos sobre sesgos, riesgo de alucinacion ni robustez fuera del benchmark PSVU-Bench.
- La licencia Apache-2.0 aplica al adaptador; el uso del modelo base Qwen3-VL-8B-Instruct queda sujeto a su propia licencia.
- El adaptador debe aplicarse solo a la llamada final de respuesta; usarlo en las llamadas de descripcion de conceptos o reescritura de preguntas se sale del diseno documentado.
- No hay informacion sobre latencia, throughput ni requisitos de VRAM especificos para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/zyh200727/PEARL-Qwen3-VL-8B-LoRA
- Paper: https://arxiv.org/abs/2603.20422
- Codigo: https://github.com/Yuanhong-Zheng/PEARL
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset: https://huggingface.co/datasets/zyh200727/PSVU-10K
