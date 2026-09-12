# ukisai/Swift-Qwen3.8-27b

## Resumen

Swift-Qwen3.8-27b es un derivado de Qwen/Qwen3.8-27B publicado por UkisAI que optimiza el coste de razonamiento del modelo base. Su propuesta es reducir la verbosidad de las trazas de pensamiento: segun la model card, emplea un 58,3% menos de tokens de pensamiento (mediana) manteniendo una perdida de rendimiento inferior al 1%, lo que se traduce en una aceleracion de hasta x1,95 en varias tareas. El modelo se distribuye bajo una licencia propia (swift-open-license-1.0), con acceso restringido (gated) y un repositorio de 55,6 GB en formato safetensors.

Tecnicamente es un ajuste fino sobre el modelo base de Qwen, no un modelo entrenado desde cero. El pipeline declarado en HuggingFace es image-text-to-text, lo que apunta a capacidad multimodal de entrada (imagenes y texto), aunque la model card no detalla la arquitectura interna ni la longitud de contexto. El recuento real de parametros en los ficheros safetensors es de 27.781.427.952 (unos 27,78 mil millones), coherente con los ~55,6 GB del repositorio en precision BF16.

Su relevancia actual es economica: en cargas de trabajo con modo de razonamiento, la mayor parte del coste de inferencia procede de los tokens generados, no de los de entrada. Un modelo que recorta entre un 41% y un 58% de tokens intermedios con una degradacion marginal de precision reduce directamente el coste por consulta y la latencia percibida, a cambio de una perdida acusada en tareas de matematicas competitivas como AIME 2026 (98,67% a 94,00%). Con 59 descargas y 16 likes en el momento de la consulta, es un modelo de nicho, con adopcion todavia temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.8-27B; los tags incluyen qwen3_8 y qwen3_5) |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos publicados estan en safetensors (55,6 GB, consistente con BF16) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other), acceso restringido (gated: true) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3.8-27B (relacion: finetune) |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion / actualizacion | 2026-09-08 / 2026-09-11 |

## Arquitectura y entrenamiento

Swift-Qwen3.8-27b no introduce una arquitectura nueva: es un ajuste fino sobre Qwen/Qwen3.8-27B, con el tag `lora` presente en el repositorio, lo que sugiere que el ajuste se realizo mediante adaptadores de bajo rango y posteriormente se fusiono o se publico junto a los pesos base. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion declarada esta en el objetivo de entrenamiento. UkisAI identifico tokens marcadores de razonamiento que, segun su analisis, disparan el "overthinking" en los rollouts del modelo base, y ajusto el modelo penalizando el uso de esos tokens durante el razonamiento. El resultado son trazas de pensamiento mas cortas y, segun el autor, tambien menos errores por sobreanalisis. El modelo incorpora ademas un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B, de BottleCap AI. No se detalla la metodologia de seleccion de tokens, el volumen de datos de ajuste ni los hiperparametros.

## Capacidades

- Razonamiento general: evaluado en GPQA-Diamond (88,28%) y MMLU-Pro (84,95%), con rendimiento practicamente identico al base.
- Conocimiento en chino: la evaluacion C-Eval es la unica en la que Swift supera al base (90,62% frente a 90,00%), lo que indica que el ajuste no degrada el conocimiento en ese idioma.
- Matematicas: AIME 2026 con 94,00% frente al 98,67% del base; sigue siendo un rendimiento alto, pero con una caida de 4,67 puntos.
- Seguimiento de instrucciones: IFBench con 71,80% frente a 73,53% del base.
- Razonamiento eficiente en tokens: modo de pensamiento con trazas mas cortas; reduccion de mediana de tokens del 58,3% en GPQA-Diamond, 50,5% en IFBench, 28,3% en MMLU-Pro y 19,3% en C-Eval.
- Entrada multimodal: el pipeline declarado es image-text-to-text, lo que indica soporte de imagenes ademas de texto, aunque la model card no detalla las capacidades de vision.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modelo conserva el modo de razonamiento del base.
- Capacidades multilingues: no disponible; solo se documenta evaluacion en C-Eval (chino).
- Otras capacidades especiales: no disponible.

## Casos de uso

- Atencion al cliente automatizada con razonamiento: en flujos donde el modelo debe razonar antes de responder, la reduccion del 42-46% de tokens intermedios abarata cada interaccion sin degradar de forma apreciable la calidad de la respuesta.
- Asistentes de codigo en produccion: el modelo mantiene el rendimiento general del base y responde igual en IFBench, por lo que puede integrarse en asistentes de autocompletado y revision donde el coste por token generado es el factor limitante. La demo publicada por el autor usa un prompt de LiveCodeBench v6.
- Procesamiento por lotes de documentacion tecnica: para tareas de extraccion, resumen y clasificacion sobre volumenes grandes, la menor generacion de tokens de pensamiento reduce el tiempo total de lote y el coste de GPU.
- Analisis de imagenes con razonamiento asociado: gracias al pipeline image-text-to-text, puede emplearse en revision de capturas, diagramas o documentos escaneados donde se requiera explicar el razonamiento, por ejemplo en soporte tecnico o inspeccion de calidad.
- Investigacion academica en eficiencia de razonamiento: es un caso de estudio util para medir el efecto de penalizar tokens de sobreanalisis sobre la precision, con la advertencia de la caida en AIME 2026.
- Despliegue en entornos con presupuesto de latencia ajustado: la aceleracion declarada de x1,95 en varias tareas permite cumplir objetivos de tiempo de respuesta que el modelo base no alcanzaria en el mismo hardware.
- Evaluacion comparativa de proveedores: util como referencia en pruebas A/B internas frente al modelo base para decidir si la perdida de precision en matematicas es aceptable en cada dominio.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando Qwen3.8-27B en BF16 con el mismo modelo mas el adaptador Swift. La tabla original esta truncada en la informacion disponible; se reproducen las filas completas.

| Benchmark | Score base | Score Swift | Tokens medios base | Tokens medios Swift | Reduccion media | Reduccion mediana |
|---|---|---|---|---|---|---|
| GPQA-Diamond | 88,38% | 88,28% | 15.014 | 8.855 | 41,0% | 58,3% |
| MMLU-Pro | 85,47% | 84,95% | 2.980 | 1.603 | 46,2% | 28,3% |
| C-Eval | 90,00% | 90,62% | 1.492 | 804 | 46,1% | 19,3% |
| IFBench | 73,53% | 71,80% | 8.052 | 4.657 | 42,2% | 50,5% |
| AIME 2026 | 98,67% | 94,00% | 22.014 | 16.143 | no disponible (dato truncado) | no disponible (dato truncado) |

No se han publicado en la informacion disponible resultados de otros benchmarks (HumanEval, MATH, SWE-bench, LiveCodeBench cuantificado, etc.), ni curvas de latencia o throughput absolutas.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parametros (27,78 mil millones) y no proceden de la model card; deben verificarse en el despliegue real.

- Inferencia en BF16/FP16: aproximadamente 55,6 GB solo de pesos, mas cache KV. Requiere GPU de 80 GB o reparto en varias GPU.
- Inferencia en FP8 o INT8: aproximadamente 28-30 GB de pesos, mas cache KV; viable en A100 40 GB con contexto corto o en A6000 48 GB.
- Inferencia en INT4 (GPTQ, AWQ u otras): aproximadamente 14-16 GB de pesos, mas overhead; cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado.
- GPU recomendadas: H100 80 GB y A100 80 GB para precision completa y lotes grandes; A6000 48 GB o L40S 48 GB para cuantizacion de 8 bits; RTX 4090, RTX 3090 o RTX 5090 para cuantizacion de 4 bits.
- Viabilidad en GPU de consumo: si, en cuantizacion de 4 bits y con ventanas de contexto moderadas. En 24 GB no es viable en BF16.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servicio en GPU; llama.cpp u Ollama solo si el autor publica pesos GGUF, algo que no se indica en la informacion disponible. El tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no hay cifras absolutas publicadas. El autor declara una aceleracion de x1,95 en varias tareas atribuible a la menor generacion de tokens, y una reduccion de mediana de tokens de hasta el 58,3%.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento (GPQA-Diamond) | Matematicas (AIME 2026) | Tokens de pensamiento | Licencia |
|---|---|---|---|---|---|---|
| Swift-Qwen3.8-27b | 27,78 mil millones | no disponible | 88,28% | 94,00% | Reduccion de hasta 58,3% en mediana | swift-open-license-1.0 (other, gated) |
| Qwen/Qwen3.8-27B (base) | no disponible en la informacion proporcionada | no disponible | 88,38% | 98,67% | Referencia | no disponible |
| ThinkingCap-Qwen3.6-27B (BottleCap AI) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos frente al modelo base, que es el punto de referencia logico al tratarse de un derivado. No hay informacion suficiente para comparar con alternativas de otros proveedores del mismo segmento de tamano.

## Limitaciones y advertencias

- Perdida de precision en matematicas: AIME 2026 cae del 98,67% al 94,00%, una degradacion de 4,67 puntos. Es la limitacion mas relevante documentada y desaconseja el modelo para competicion matematica o calculo de alta exigencia sin validacion previa.
- Degradacion en seguimiento de instrucciones: IFBench baja del 73,53% al 71,80%; conviene reevaluar en el dominio concreto antes de sustituir al modelo base.
- Ganancia no uniforme: la reduccion de tokens de pensamiento depende del benchmark (58,3% de mediana en GPQA-Diamond frente a 19,3% en C-Eval), por lo que el ahorro esperado varia segun el tipo de tarea.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En tareas de razonamiento, acortar las trazas de pensamiento puede reducir la autoverificacion; se recomienda validacion en dominios de alto riesgo.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Idioma: no se especifican los idiomas soportados. La unica evaluacion multilingue documentada es C-Eval, en chino; no hay datos para castellano.
- Longitud de contexto: no disponible, un dato critico para dimensionar el despliegue y la cache KV.
- Licencia: es una licencia personalizada (`license: other`) con nombre propio, swift-open-license-1.0, y el repositorio esta marcado como `gated`. Hay que revisar los terminos completos antes de cualquier uso comercial; la model card menciona una via de licencia enterprise, lo que sugiere restricciones para uso comercial no autorizado.
- Acceso restringido: al ser un modelo gated, es necesario aceptar las condiciones en HuggingFace para descargar los pesos, lo que anade friccion a pipelines automatizados.
- Madurez: 59 descargas y 16 likes, con una unica fuente de evaluacion (el propio autor). No hay validacion independiente de los resultados.
- Datos de entrenamiento no publicados: se desconoce el volumen y la composicion del dataset de ajuste, lo que limita la evaluacion de riesgos de contaminacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Anuncio en el blog de UkisAI: https://ukisai.com/news/introducing-swift
- Sitio web de UkisAI: https://ukisai.com
- Pagina de producto Swift: https://ukisai.com/products/swift
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo del que procede el componente de transferencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Demo en video (alojada en el repositorio del modelo): https://huggingface.co/ukisai/Swift-Qwen3.8-27b/resolve/main/swift-speed-demo.mp4
