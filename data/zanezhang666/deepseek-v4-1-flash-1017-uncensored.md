# zanezhang666/DeepSeek-V4.1-Flash-1017-uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-uncensored es una variante del checkpoint DeepSeek-V4.1-Flash-1017 (release 1017) publicada por el usuario zanezhang666 en Hugging Face. Se trata de una edicion de pesos en forma cerrada (closed-form weight edit), sin fine-tuning ni entrenamiento por gradiente, aplicada directamente sobre el checkpoint nativo en FP8. El objetivo declarado es eliminar el comportamiento de rechazo (refusal) manteniendo practicamente intactas las capacidades de conocimiento, razonamiento y matematicas del modelo base.

El modelo conserva la arquitectura del base: un transformer de tipo Mixture-of-Experts (MoE) con pesos en FP8, 763.205.315.794 parametros totales segun los safetensors del repositorio (510,3 GB) y 384 expertos enrutados que, segun la model card, quedan intactos tras la edicion. No se especifican en la informacion disponible el numero de parametros activos por token ni la longitud de contexto nativa del checkpoint.

La relevancia de esta publicacion es doble. Por un lado, demuestra que es posible alterar el comportamiento de rechazo de un modelo de gran escala mediante una edicion de pesos sin reentrenamiento, lo que tiene implicaciones directas para la investigacion en seguridad y red-teaming. Por otro, su model card advierte explicitamente de que el modelo es deliberadamente no censurado y responde a peticiones daninas, por lo que su uso esta restringido a investigacion autorizada en seguridad y a despliegues privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), segun tags del repo; detalles de capas y atencion no disponibles |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible (el modelo base declara 384 expertos enrutados, sin cifra de activos por token) |
| Longitud de contexto | no disponible en la informacion del checkpoint; la plataforma Zro que lo sirve anuncia 1M tokens de contexto y hasta 64K de salida |
| Tipos de cuantizacion | Pesos nativos en FP8 (8-bit); no se listan otras variantes publicadas |
| Idiomas soportados | no disponible |
| Licencia | MIT (el modelo base tiene su propia licencia, que aplica segun la model card) |
| Formato de pesos | safetensors (FP8), libreria transformers |

## Arquitectura y entrenamiento

El modelo es una edicion del checkpoint DeepSeek-V4.1-Flash-1017, que emplea una arquitectura MoE con 384 expertos enrutados y pesos en FP8. La intervencion realizada por el autor no es un fine-tuning: se describe como una edicion de pesos en forma cerrada (closed-form weight edit) fusionada en el checkpoint FP8 nativo, sin entrenamiento por gradiente. Segun la model card, los 384 expertos enrutados se dejan intactos, de modo que la capacidad y el conocimiento del modelo no se alteran, y el checkpoint resultante se carga y sirve exactamente igual que el base.

No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni las etapas de RLHF/DPO. Tampoco se detalla la innovacion tecnica concreta de la edicion de pesos (que direccion o subespacio de pesos modifica), mas alla de que elimina el comportamiento de rechazo sin tocar los expertos. El checkpoint se sirve con SGLang con soporte para DeepSeek-V4.1, usando tensor parallelism y expert parallelism (tp-size 4, ep-size 4) y parsers especificos de razonamiento y tool calling (`deepseek-v41` y `deepseekv41`).

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta disenado para razonamiento con modo "thinking" (reasoning enabled), segun los benchmarks de la model card (MMLU-Pro reasoning, GPQA-Diamond).
- Conocimiento general y matematicas: MMLU completo (14.042 preguntas) y GSM8K step-by-step, con rendimiento proximo al base.
- Tool calling / function calling: el servidor SGLang se lanza con `--tool-call-parser deepseekv41`, lo que indica soporte de llamadas a herramientas.
- Razonamiento multi-paso con presupuesto de generacion amplio: la model card recomienda al menos 16k tokens de generacion o un esfuerzo de razonamiento moderado para evitar truncamientos.
- Comportamiento deliberadamente no censurado: elimina rechazos en peticiones daninas (1,8% de rechazo frente a 87,3% del base) y reduce el exceso de rechazo en peticiones benignas (0,0% frente a 6,3%).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad y red-teaming: el modelo esta pensado para evaluar la robustez de sistemas frente a peticiones daninas en entornos autorizados y privados, ya que su tasa de cumplimiento en HarmBench-320 alcanza 0,95 segun la model card.
- Evaluacion de clasificadores de rechazo: sirve como generador de respuestas daninas controladas para medir la precision de filtros y clasificadores de seguridad propios, con conjuntos como StrongREJECT (313 prompts) y HarmBench.
- Pruebas de explotacion de vulnerabilidades en laboratorio: la model card reporta cumplimiento del 100% en 30 prompts de exploits CVE reales, util para validar pipelines de deteccion en entornos aislados.
- Analisis de sesgos y alineacion: al comparar el base y esta variante con el mismo harness y los mismos prompts, permite estudiar que comportamientos dependen de la edicion de pesos y cuales del entrenamiento original.
- Serving privado de un modelo de gran escala en FP8: al ser un checkpoint drop-in compatible con SGLang (tp-size 4, ep-size 4), se puede desplegar en infraestructura propia para experimentos internos con la misma pila que el base.
- Integracion via API compatible con OpenAI y Anthropic: la plataforma Zro expone estos pesos como modelo `abyss1`, lo que permite probar el modelo desde clientes y harnesses existentes sin montar GPU propia.
- Generacion de codigo y razonamiento asistido en pipelines internos: el soporte de tool calling y el modo de razonamiento permiten usarlo en flujos de analisis tecnico, siempre en entornos privados y con las salvaguardas adecuadas.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el modelo base y esta variante con el mismo harness y prompts emparejados:

| Benchmark | Base | Este modelo |
|---|---:|---:|
| MMLU (14.042, test completo) | 88,22% | 87,91% |
| MMLU-Pro (4.000) | 69,90% | 69,42% |
| MMLU-Pro (300, reasoning) | 85,7% | 84,7% |
| GPQA-Diamond (198, reasoning) | 81,3% | 84,8% |
| GSM8K (step-by-step, greedy) | 93,5% | 96,0% |
| Rechazo en prompts daninos (n=1410) | 87,3% | 1,8% |
| Exceso de rechazo en prompts benignos (n=350) | 6,3% | 0,0% |
| HarmBench-320 (StrongREJECT, 0-1) | 0,38 | 0,95 |
| StrongREJECT (313 prompts, 0-1) | 0,02 | 0,99 |
| Prompts de exploit CVE reales (30, 0-1) | 0,12 | 1,00 |

Notas de la model card: en GPQA-Diamond, parte de los items mas dificiles agotan el presupuesto de generacion de 24k tokens (24 en el base, 15 en esta variante); puntuando solo respuestas completas, el base obtiene 92,5% y esta variante 91,8%, y en las 174 preguntas que ambos completan aciertan exactamente las mismas (161). Las tasas de rechazo juzgadas por LLM caen de 60,9% a 0,6% en HarmBench, de 98,1% a 0% en StrongREJECT y de 86,7% a 0% en el conjunto CVE.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 510,3 GB en FP8; la inferencia requiere agregar memoria para KV cache y activaciones, por lo que se necesita un nodo multi-GPU de gran capacidad.
- GPU recomendadas: el ejemplo oficial de serving usa SGLang con `--tp-size 4 --ep-size 4`, lo que implica al menos 4 GPUs de clase datacenter (H100/H200 o A100 de 80 GB) para repartir los 510 GB de pesos.
- GPU de consumo: no cabe en GPUs consumer (RTX 4090 de 24 GB, etc.) por el tamano del checkpoint en FP8.
- Opciones de despliegue: SGLang con soporte DeepSeek-V4.1 (metodo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card solo advierte de que con esfuerzo de razonamiento maximo el modelo genera respuestas muy largas y conviene darle al menos 16k tokens de presupuesto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-uncensored | 763,2 B (MoE, FP8) | no disponible en el checkpoint | MIT (aplica tambien la del base) | Edicion de pesos sin fine-tuning; rechazo 1,8% en prompts daninos |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763,2 B (MoE, FP8) | no disponible | la del modelo base | Rechazo 87,3% en prompts daninos; MMLU 88,22% |
| Abyss 1 (servicio Zro de estos pesos) | misma base | 1M tokens (segun Zro) | servicio comercial | API compatible OpenAI/Anthropic; 0,30 USD/1M input y 1,10 USD/1M output |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada; la comparativa se limita al modelo base y a su despliegue gestionado.

## Limitaciones y advertencias

- Modelo deliberadamente no censurado: cumple peticiones daninas (StrongREJECT 0,99; CVE 1,00) y su model card exige uso privado y exclusivamente para investigacion autorizada en seguridad; no debe desplegarse ni servirse publicamente.
- Responsabilidad legal y etica: el autor declara que el usuario es responsable de todo uso; la licencia MIT no exime de las obligaciones legales aplicables al contenido generado.
- Alucinacion: no se publican metricas especificas de alucinacion; como todo modelo generativo de gran escala, puede producir contenido falso con apariencia de veracidad.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Idiomas: no se especifican los idiomas soportados ni su calidad relativa.
- Contexto: la longitud de contexto del checkpoint no esta disponible; la cifra de 1M tokens corresponde a la plataforma Zro, no al checkpoint publicado.
- Rendimiento: las diferencias frente al base son pequenas y de signo mixto (MMLU -0,3 puntos, MMLU-Pro -0,5, GSM8K +2,5, GPQA +3,5), pero el rechazo residual en conjuntos adversarios es bajo, no nulo.
- Serving: con esfuerzo de razonamiento maximo las respuestas pueden truncarse si no se asigna un presupuesto de generacion suficiente (≥16k tokens).
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card menciona un identificador de despliegue (`MoonMath-ai/...`) distinto del ID del repositorio, lo que conviene verificar antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zanezhang666/DeepSeek-V4.1-Flash-1017-uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Abyss 1 en Zro: https://zro.moonmath.ai/abyss1
- Precios de Zro: https://zro.moonmath.ai/pricing
- Documentacion del CLI de Zro: https://zro.moonmath.ai/docs/cli
- Referencia de la API de Zro: https://zro.moonmath.ai/v1/chat/completions
