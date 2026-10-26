# turintech/d3-27B-Artemis-GGUF

## Resumen

d3-27B-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo de decisión d3 (vLLM-SR/d3, 26.896 millones de parámetros), publicada por TurinTech mediante su pipeline de compresión Artemis. No es un modelo conversacional al uso: responde preguntas tipadas sobre un texto o una imagen devolviendo una probabilidad para cada respuesta posible en una sola pasada, y se sirve a través del endpoint `/v1/systemone` de llama.cpp, no por `/v1/chat/completions`. Su relevancia práctica está en el consumo de memoria: el fichero por defecto (IQ4_XS, 14,95 GB de descarga) alcanza un pico de 16,4 GiB con texto y 19,0 GiB con imágenes en una RTX 5090, frente a los 54,6 GiB repartidos en dos GPU que necesita el modelo original.

El objetivo declarado del autor es habilitar decisiones tipadas —clasificación, enrutamiento, evaluación de condiciones— sobre texto o imágenes en GPU de 24 GB, manteniendo fidelidad respecto al modelo en BF16: un 97,1 % de respuestas idénticas sobre 2.000 decisiones de test, y ningún cambio en las respuestas que el modelo original daba con alta confianza. Frente a la cuantización Q4_K_M de ggml-org (19,40 GB, 98,4 % de coincidencia), esta versión sacrifica 1,3 puntos de acuerdo a cambio de unos 4,5 GB menos de descarga.

La ficha se basa exclusivamente en la model card del autor, los resultados declarados en su model-index y las páginas web enlazadas. La información sobre arquitectura interna, idiomas soportados y composición del dataset de entrenamiento no está publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información publicada (modelo base `vllm-sr/d3`; procesa texto e imágenes) |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en la configuración recomendada (`-c 16384`); el contexto de entrenamiento completo no se especifica |
| Tipos de cuantización | GGUF: IQ4_XS (14,95 GB, por defecto) y Q3_K_S (12,26 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector visual separado en BF16 (`mmproj-vllm-d3-BF16.gguf`) |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna del modelo base `vllm-sr/d3` en la información disponible: no se indica si es un transformer denso, un MoE o un híbrido, ni el número de capas, cabezas de atención o dimensión oculta. Lo que sí se describe es su interfaz funcional: se trata de un modelo de decisión que recibe un `state` (el texto o imagen a evaluar) y un conjunto de `questions` tipadas —el ejemplo de la model card usa el tipo `noul` para preguntas de sí/no— y devuelve una probabilidad por cada respuesta posible en una única pasada. El pipeline declarado en HuggingFace es `text-classification`, y el modelo admite entradas multimodales (texto e imágenes) mediante un proyector visual.

El proceso de entrenamiento original tampoco está detallado. La contribución documentada de esta ficha es la compresión: TurinTech aplica su sistema Artemis para producir cuantizaciones GGUF que preservan el comportamiento del BF16. La validación se hizo sobre 2.000 decisiones de test del dataset `LocalLLaMA/typed-decisions`, midiendo el porcentaje de respuestas idénticas al original y el número de respuestas confiadas que cambiaron de signo. El autor señala además una restricción de implementación relevante: d3 lee el prompt completo en un solo batch, de modo que una entrada más larga que el tamaño de batch configurado se rechaza.

## Capacidades

- Decisiones tipadas sobre texto: clasificación binaria (sí/no), elección entre opciones y evaluación de condiciones definidas por el usuario mediante instrucciones en lenguaje natural.
- Salida probabilística por respuesta en una sola pasada, apta para umbrales y enrutamiento ponderado.
- Entrada de imágenes a través del proyector visual de ggml-org, enviadas como data URLs en un array `images` de la petición a `/v1/systemone`.
- Enrutamiento semántico: el modelo base d3 procede del proyecto vLLM Semantic Router, orientado a decidir qué modelo o ruta atiende una consulta.
- Multilingüismo: no se documenta qué idiomas cubre; la model card no incluye lista de lenguas.
- No soporta tool calling, function calling ni razonamiento multi-paso con agentes en el sentido habitual: la interfaz es de decisión, no de generación de texto libre.
- No está pensado para chat: el autor indica explícitamente que la ventana de chat y `/v1/chat/completions` no lo ejecutan como modelo de decisión.

## Casos de uso

- Enrutamiento semántico en pasarelas de LLM: dada una consulta de usuario, evaluar preguntas del tipo «¿requiere razonamiento matemático?» o «¿es una petición de código?» y usar las probabilidades para decidir a qué modelo o proveedor derivarla. Es el caso de uso original del modelo base en vLLM Semantic Router.
- Triaje de tickets de soporte: clasificar urgencia, enfado del cliente o categoría de incidencia con una sola pasada y umbrales calibrados; la model card usa precisamente un mensaje sobre una integración de Stripe que falla como ejemplo de evaluación de urgencia.
- Moderación y guardrails: evaluar condiciones booleanas sobre entradas de usuario («¿contiene datos personales?», «¿es una petición legítima?») antes de enviarlas a un modelo generativo, con coste de inferencia bajo frente a un LLM generador.
- Clasificación de documentos escaneados o capturas: al aceptar imágenes, puede evaluar condiciones directamente sobre formularios, facturas o pantallazos sin un paso previo de OCR a texto.
- Control de calidad en pipelines de datos: etiquetar grandes lotes de registros con criterios tipados definidos en lenguaje natural, sustituyendo reglas heurísticas frágiles por un clasificador con probabilidad asociada.
- Detección de intención en asistentes y agentes: decidir si una intervención debe escalar a un humano, cerrar la conversación o activar una herramienta, usando la probabilidad como señal de confianza.
- Filtrado previo en sistemas RAG: decidir si una consulta es respondible con la base documental disponible antes de recuperar y generar.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos sobre 2.000 decisiones de test del dataset `LocalLLaMA/typed-decisions`, comparando cada cuantización con el modelo original en BF16:

| Métrica | d3-27B-Artemis IQ4_XS (14,95 GB) | d3-27B-Artemis Q3_K_S (12,26 GB) | ggml-org Q4_K_M (19,40 GB) |
|---|---|---|---|
| Misma respuesta que el original | 97,1 % | 95,7 % | 98,4 % |
| Respuestas confiadas alteradas | 0 | 0 | No disponible |
| Precisión relativa | No disponible | 0,30 puntos por debajo | No disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de LLM en la información disponible; el modelo está evaluado en términos de acuerdo con su propia salida de referencia, no de capacidades generativas. El autor indica que estas mismas decisiones se usaron para elegir el fichero publicado.

## Requisitos de hardware

- VRAM estimada: pico de 16,4 GiB con entrada de texto y 19,0 GiB con imágenes para IQ4_XS, medido en una NVIDIA RTX 5090.
- Fichero Q3_K_S: 14,1 GiB para texto, lo que el autor sitúa como opción para GPU de 16 GB.
- El modelo original en BF16 necesita 54,6 GiB repartidos en dos GPU; esta versión cabe en una sola GPU de 24 GB.
- GPU recomendadas: RTX 5090 (medición oficial), RTX 4090 o cualquier GPU consumer de 24 GB para IQ4_XS; GPU de 16 GB para el fichero Q3_K_S.
- Verificado también en Apple M3 Max de 36 GB con backend Metal de llama.cpp (build `b11617`): todos los ficheros del repo cargan y responden.
- Despliegue: llama.cpp build `b11572` (12 de octubre de 2026) o superior, que añadió soporte de d3; probado en el commit `fcac190`. Comando de referencia: `llama-server -hf turintech/d3-27B-Artemis-GGUF:IQ4_XS --port 8080 -c 16384 -ub 4096 -b 4096 -np 1`.
- Parámetros de servidor obligatorios: `-ub 4096 -b 4096` (d3 lee todo el prompt en un batch y rechaza entradas mayores), `-np 1` (con varios slots, llama.cpp puede alterar la respuesta si una petición más corta comparte batch, issue ggml-org/llama.cpp#30402 abierto a 14 de octubre de 2026) y `-c 16384` para no reservar memoria del contexto completo de entrenamiento.
- LM Studio: disponible en el Hub como `turintech/d3-27b-artemis`, probado con LM Studio 0.4.26 y motor llama.cpp CPU 2.64.0 en Linux x86-64; solo se validó entrada de texto.
- Ollama: el autor no proporciona ningún paquete verificado como compatible.
- Vision: requiere descargar el proyector `mmproj-vllm-d3-BF16.gguf` de `ggml-org/vllm-d3-GGUF` y subir el batch a 8192, ya que varias imágenes grandes pueden superar los 4.096 tokens.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño / memoria | Acuerdo con BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-27B-Artemis IQ4_XS (este) | 26,9 B | 16.384 config. | 14,95 GB / 16,4 GiB texto | 97,1 % | Apache 2.0 | HuggingFace, LM Studio Hub |
| d3-27B-Artemis Q3_K_S | 26,9 B | 16.384 config. | 12,26 GB / 14,1 GiB texto | 95,7 % | Apache 2.0 | HuggingFace, LM Studio Hub |
| ggml-org/vllm-d3-GGUF Q4_K_M | No disponible | No disponible | 19,40 GB | 98,4 % | No disponible en la información | HuggingFace (ggml-org) |
| d3 original (vllm-sr/d3, BF16) | 26,9 B | No disponible | 54,6 GiB en dos GPU | Referencia | No disponible en la información | HuggingFace (vllm-sr) |
| d3-flash (Artemis) | No disponible | No disponible | 4,9 GB | No disponible | No disponible en la información | TurinTech |

La comparación con modelos de clasificación convencionales (encoders tipo BERT o DeBERTa) no está cubierta por los datos publicados: no hay benchmarks comunes ni métricas de precisión sobre tareas estándar que permitan situar d3 frente a ellos.

## Limitaciones y advertencias

- No es un modelo de chat: solo responde a través de `/v1/systemone`. Enviarlo a `/v1/chat/completions` o a la ventana de chat de LM Studio no lo ejecuta como modelo de decisión.
- Requiere una versión muy reciente de llama.cpp (`b11572` o superior). Versiones anteriores no soportan d3.
- Restricción de batch: cualquier prompt más largo que `-ub`/`-b` se rechaza, no se trunca. Con imágenes grandes hay que subir el batch a 8192 o más.
- Concurrencia limitada: `-np 1` es obligatorio según el autor, porque con varios slots en el mismo batch la respuesta puede cambiar (issue #30402). Esto limita el throughput en producción a una petición por batch.
- Los resultados de fidelidad (97,1 %, 0 cambios confiados) son declaraciones del autor, no verificadas de forma independiente, y se midieron sobre un dataset propio de 2.000 decisiones; pueden no extrapolarse a otros dominios.
- Idiomas soportados no documentados: no hay garantía de comportamiento en castellano ni en otras lenguas distintas del inglés.
- Riesgo de alucinación bajo en el sentido generativo (no produce texto libre), pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; conviene validar umbrales con datos propios.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad.
- Visión: la integración con LM Studio solo se probó con texto; el soporte multimodal validado es el de llama-server con el proyector de ggml-org.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base `vllm-sr/d3` se referencia sin que la información disponible detalle su licencia original; conviene verificarla antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/d3-27B-Artemis-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3
- Página de modelos de TurinTech (Artemis Edge): https://www.turintech.ai/models
- Blog de TurinTech sobre la compresión de d3 y d3-flash: https://www.turintech.ai/blog/d3-and-d3-flash-compressed-with-artemis
- Sitio de TurinTech: https://turintech.org/
- Ficha en LM Studio Hub: https://lmstudio.ai/turintech/d3-27b-artemis
- Repositorio ggml-org con el proyector visual: https://huggingface.co/ggml-org/vllm-d3-GGUF
- Issue de llama.cpp sobre respuestas alteradas con varios slots: https://github.com/ggml-org/llama.cpp/issues/30402
- Hilo de feedback del autor: https://huggingface.co/spaces/turintech/README/discussions/1
- Ficha de terceros con metadatos del modelo: https://free2aitools.com/model/turintech/d3-27b-artemis-gguf
- Espejo de sumas SHA-256 del fichero de 14,9 GB: https://civarchive.com/sha256/4ae3fc00c3f7e7475796263a2b2c6311d2090f07f1dbcae9a175faa215366568
