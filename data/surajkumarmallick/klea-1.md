# surajkumarmallick/Klea-1

## Resumen

Klea-1 es un modelo de lenguaje de tipo decoder-only orientado al razonamiento, desarrollado por Suraj Kumar Mallick y publicado en Hugging Face bajo licencia Apache 2.0. Su propuesta principal es ofrecer razonamiento explicito por pasos (con traza de pensamiento delimitada por etiquetas `<think>` y respuesta final en `<answer>`) en un tamano muy reducido: aproximadamente 540 millones de parametros totales y unos 430 millones activos, lo que lo situa en la categoria de modelos ligeros ejecutables en hardware de consumo.

El modelo declara una ventana de contexto de 256K tokens, un dato especialmente ambicioso para su escala, y un corte de conocimiento en septiembre de 2026. Se distribuye en formato safetensors con pesos en bfloat16 y es compatible con la libreria transformers mediante `AutoModelForCausalLM`, con arquitectura declarada `hunyuan_v1_dense`. Esta pensado para tareas de razonamiento paso a paso, asistencia en codigo, flujos agenticos de terminal y comprension de documentos largos.

Su relevancia actual radica en la combinacion de contexto extendido, modo de pensamiento explicito y un footprint de memoria muy bajo, lo que permite desplegarlo en GPUs consumer e incluso en entornos con recursos limitados. No obstante, el repositorio registra cero descargas y cero interacciones en el momento de la consulta, y parte de las cifras de benchmarks publicadas resultan dificiles de conciliar con el tamano del modelo, por lo que conviene tratarlas con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only, `hunyuan_v1_dense` (transformer denso) |
| Parametros totales | 539.010.048 (~540M) segun safetensors; la model card indica 543.456.768 |
| Parametros activos | ~430M (declarado en la model card) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bfloat16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Klea-1 emplea una arquitectura transformer densa de tipo decoder-only, identificada en los metadatos como `hunyuan_v1_dense`. No se especifican en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el mecanismo exacto de atencion utilizado para alcanzar los 256K tokens de contexto (si se trata de atencion completa, ventanas deslizantes, atencion lineal o una combinacion). Tampoco se detalla la estrategia de tokenizacion ni el vocabulario.

El entrenamiento se describe en cuatro etapas: (1) preentrenamiento primario sobre texto web a gran escala; (2) preentrenamiento secundario sobre datos curados y especializados; (3) ajuste fino en datos de razonamiento e instrucciones; y (4) alineacion de preferencias mediante RLHF. No se proporcionan el numero de tokens de entrenamiento, la composicion del dataset, ni detalles sobre el algoritmo de RLHF (por ejemplo, PPO o DPO). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion eficiente.

## Capacidades

- Generacion de texto con razonamiento explicito paso a paso, con traza de pensamiento en `<think>...</think>` y respuesta final en `<answer>...</answer>`.
- Modo de pensamiento conmutable: `enable_thinking=True` (lento, por defecto) o `enable_thinking=False` (rapido), tambien mediante prefijos `/think` y `/no_think` en el prompt.
- Razonamiento matematico y logico, segun los benchmarks declarados (GSM8K, AGIEval, C-Eval).
- Generacion y asistencia de codigo (HumanEval Pass@1 declarado).
- Comprension de documentos largos y conversaciones extendidas hasta 256K tokens.
- Flujos agenticos y de terminal, segun los resultados declarados en Terminal-Bench y CyberGym.
- Ajuste a instrucciones y alineacion de preferencias mediante RLHF.
- Soporte de plantilla de chat (`apply_chat_template`) con roles de sistema y usuario.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de varios pasos mostrando la traza de pensamiento, lo que facilita la verificacion por parte del usuario; adecuado para tutoria y generacion de explicaciones didacticas.
- Asistencia de codigo en local: con ~540M de parametros y pesos en bfloat16 (repo de 1,1 GB), puede ejecutarse en GPUs consumer para autocompletado, explicacion de fragmentos y generacion de tests, sin depender de servicios externos.
- Analisis de documentos largos: su ventana de 256K tokens permite resumir o responder preguntas sobre contratos, informes o bases de codigo extensas en una sola pasada, evitando estrategias de chunking complejas.
- Flujos agenticos de terminal: los resultados declarados en Terminal-Bench sugieren su uso en tareas de automatizacion de shell, diagnostico de errores y ejecucion de comandos guiada por el modelo, con la cautela propia de validar cualquier accion destructiva.
- Chatbot de atencion al cliente en ingles: puede mantener conversaciones multi-turno con contexto largo gracias a la ventana de 256K tokens, aunque su conocimiento esta limitado al corte de septiembre de 2026 y a un unico idioma.
- Prototipado e investigacion de tecnicas de razonamiento: su tamano reducido y su licencia Apache 2.0 lo hacen util para experimentar con modos de pensamiento, RLHF y evaluacion de trazas de razonamiento en entornos academicos con recursos limitados.
- Despliegue en edge o entornos con VRAM restringida: al caber en GPUs de gama media y potencialmente en CPU con cuantizacion (aunque no se publican pesos cuantizados), sirve para demos y pruebas de concepto offline.

## Benchmarks y rendimiento

Resultados declarados en la model card del autor:

| Benchmark | Configuracion | Puntuacion |
|---|---|---|
| GPQA Diamond | no especificada | 89,4 |
| HLE | no especificada | 53,5 |
| AGIEval (EM) | 3-5-shot | 83,5 |
| C-Eval (EM) | 5-shot | 92,1 |
| HellaSwag (EM) | 0-shot | 85,0 |
| SimpleQA-Verified (EM) | 25-shot | 0,1 |
| GSM8K | 8-shot | 93,5 |
| HumanEval (Pass@1) | 0-shot | 62,0 |
| Terminal-Bench 2.1 | no especificada | 76,5 |
| Terminal-Bench 3.0 | no especificada | 44,0 |
| Terminal-Bench 4.0 | no especificada | 58,6 |
| CyberGym | no especificada | 65,5 |
| LongBench-V2 (EM) | 1-shot | 44,7 |

Advertencia: estas cifras proceden exclusivamente de la model card y no se han verificado de forma independiente. Varias de ellas (GPQA Diamond 89,4, HLE 53,5, C-Eval 92,1 en un modelo de ~540M) son notablemente superiores a lo habitual para ese rango de parametros, mientras que SimpleQA-Verified (0,1) es coherente con un modelo pequeno. Se recomienda tratar la tabla como datos no validados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,1-1,3 GB solo para pesos, mas la memoria de activaciones y cache KV, que crece con la longitud de contexto; con 256K tokens la cache KV puede dominar el consumo y exigir tecnicas de atencion eficiente no documentadas.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para contextos cortos (RTX 3060, RTX 4060, RTX 4090); para contextos muy largos se recomienda A100 o H100 por memoria y ancho de banda.
- Cabe en GPU consumer: si, en modelos como RTX 3060/4060/4090 con contextos moderados; en CPU es viable mediante cuantizacion, aunque no se publican pesos GGUF oficiales.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `accelerate` (soporte documentado); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible, aunque la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Klea-1 | ~540M totales / ~430M activos | 256K | Apache 2.0 | Razonamiento explicito con `<think>`; solo ingles; benchmarks no verificados |
| Qwen2.5-0.5B | ~0,5B | 32K (128K con RoPE scaling) | Apache 2.0 | Multilingue, ampliamente desplegado, ecosistema maduro (GGUF, vLLM) |
| SmolLM2-360M | ~360M | 8K | Apache 2.0 | Enfocado en eficiencia y despliegue en edge; datos de entrenamiento publicados |
| Llama-3.2-1B | ~1,2B | 128K | Llama 3.2 Community License | Multilingue, requiere aceptacion de licencia; mayor footprint |

La comparacion se basa en caracteristicas publicas de esos modelos; no se dispone de evaluaciones cruzadas con Klea-1 en las mismas condiciones.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- Riesgo elevado de alucinacion en conocimiento factual: SimpleQA-Verified con 0,1 EM indica un rendimiento practicamente nulo en preguntas factuales verificadas.
- Las cifras de benchmarks de la model card no estan verificadas de forma independiente y algunas resultan inconsistentes con el tamano del modelo; no deben usarse para decisiones de produccion sin replicacion.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en CPU y en GPUs de baja VRAM.
- No se documentan detalles de la arquitectura de atencion para 256K tokens ni el consumo real de memoria en contextos largos.
- Tool calling y function calling no estan confirmados; los flujos agenticos dependen de integraciones externas.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de validacion independiente y el riesgo de alucinacion desaconsejan su uso en produccion sin evaluacion propia.
- Corte de conocimiento en septiembre de 2026: puede carecer de informacion posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/surajkumarmallick/Klea-1
- Perfil del autor: https://huggingface.co/surajkumarmallick
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
