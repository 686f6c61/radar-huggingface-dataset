# ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ

## Resumen

ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ es una cuantizacion NVFP4 (4 bits en pesos y activaciones) del modelo Mixture-of-Experts Qwen/Qwen3-30B-A3B, producida con la libreria llm-compressor de NVIDIA mediante un ajuste GPTQ de un solo paso sobre 1.024 muestras de calibracion. El resultado reduce el peso del checkpoint de 56,89 GB (bf16) a 18,11 GB, una compresion de 3,14 veces, manteniendo un rendimiento en MMLU estadisticamente indistinguible del modelo original en bf16 (-0,36 puntos porcentuales, z = -0,8).

La relevancia de este modelo radica en que demuestra, con mediciones propias del autor, que la receta GPTQ sobre NVFP4 compra aproximadamente 1 punto de MMLU frente a la alternativa RTN del mismo ancho de bits, a costa de un tiempo de cuantizacion 4,5 veces mayor (23.730 segundos frente a 5.271). El autor publica deliberadamente ambas versiones (GPTQ y RTN) para que la comunidad pueda evaluar si el coste computacional extra merece la pena. Ademas, la model card incluye una verificacion del backend de kernel usado en inferencia, algo poco habitual en tarjetas de modelos cuantizados.

El modelo esta pensado para despliegue en GPUs Blackwell (SM100) con vLLM, donde el backend NVFP4 nativo ofrece un rendimiento superior al de la emulacion Marlin que se produce en hardware Hopper. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (Mixture of Experts) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3B (modelo base Qwen3-30B-A3B) |
| Longitud de contexto | No especificada en la model card; el modelo base soporta hasta 256K tokens segun el technical report de Qwen3 |
| Tipos de cuantizacion | NVFP4 (4-bit pesos y activaciones), GPTQ oneshot |
| Idiomas soportados | No disponibles en la model card; el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quantize_meta.json` incluido) |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer MoE con 30.532 millones de parametros totales y 3.000 millones activos por token, disenado por Alibaba. Incorpora dos modos de operacion (thinking y non-thinking) seleccionables mediante un token especial, y fue entrenado con una combinacion de datos masiva que incluye razonamiento, codigo y contenido multilingue. La cuantizacion NVFP4 aplicada aqui no modifica la arquitectura original: los pesos y las activaciones se representan en formato de punto flotante de 4 bits (NVFP4) en lugar de bf16.

El proceso de cuantizacion fue realizado por ThakiCloud con llm-compressor de NVIDIA, usando una receta GPTQ de un solo paso (oneshot) sobre 1.024 muestras de calibracion. El autor reporta que el proceso tardo 23.730 segundos en una GPU B200. La model card incluye el archivo `quantize_meta.json` con las metricas de tiempo para verificacion independiente. No se aplico ningun ajuste fino posterior a la cuantizacion; se trata de una compresion puramente post-entrenamiento.

Una innovacion destacable de esta tarjeta es la verificacion explicita del backend de kernel: el autor confirma que en B200 (SM100) vLLM 0.27.1 utiliza el backend `FLASHINFER_TRTLLM` para NVFP4 MoE, sin warnings de soporte nativo. En hardware Hopper (SM90) vLLM cae a emulacion Marlin con pesos solos, que se mide aproximadamente a 0,85x del rendimiento bf16, por lo que el autor desaconseja NVFP4 en esa generacion.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3-30B-A3B, incluyendo razonamiento paso a paso y modo thinking/no-thinking.
- Soporte de tool calling y function calling: disponible en el modelo base, aunque no ha sido evaluado especificamente en esta version cuantizada.
- Capacidades de agente y multi-step reasoning: presentes en el modelo base, no verificadas en esta cuantizacion.
- Soporte multilingue: el modelo base cubre mas de 100 idiomas; esta version no incluye evaluaciones propias al respecto.
- Capacidades especiales: modo thinking activable mediante token, segun el technical report de Qwen3. No se ha evaluado en esta cuantizacion.
- Limitacion importante: la model card declara explicitamente que no se han evaluado codigo, comportamiento multilingue ni contexto largo en esta version cuantizada.

## Casos de uso

- Inferencia eficiente en GPUs Blackwell: el modelo esta optimizado para B200 y GPUs SM100, donde el backend NVFP4 nativo ofrece un rendimiento superior al de emulacion. Adecuado para entornos de produccion que ya dispongan de esta generacion de hardware.
- Reduccion de costes de memoria en despliegue: con 18,11 GB de pesos, cabe en GPUs con 24 GB de VRAM o mas, permitiendo servir un modelo de 30B MoE en hardware mas modesto que el necesario para bf16 (56,89 GB).
- Evaluacion comparativa de recetas de cuantizacion: al publicarse junto con la version RTN, permite a investigadores medir la diferencia real entre GPTQ y RTN sobre NVFP4 en las mismas condiciones (misma GPU, mismo harness, mismo conjunto de evaluacion).
- Servicio de chat conversacional con vLLM: el comando de despliegue `vllm serve ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ --max-model-len 8192` permite montar un endpoint OpenAI-compatible en minutos.
- Analisis de consumo energetico: la model card reporta 46,8 tok/J en B200 frente a 27,4 tok/J en bf16, lo que lo hace interesante para cargas de trabajo donde el coste electrico es un factor relevante.
- Validacion de pipelines de cuantizacion: el archivo `quantize_meta.json` incluido en el repo permite auditar los tiempos de cuantizacion y reproducir el proceso, util para equipos que necesiten generar sus propias versiones cuantizadas.

## Benchmarks y rendimiento

La model card incluye mediciones propias realizadas con vLLM 0.27.1 y lm-eval 0.4.12 en una unica GPU B200, con conjuntos completos (MMLU n=14.042, GSM8K-CoT n=1.319, 8-shot). Los resultados son comparables entre si porque todas las filas se ejecutaron en el mismo entorno.

| build | receta | tamano | MMLU | GSM8K (strict) |
|---|---|---|---|---|
| Qwen/Qwen3-30B-A3B (bf16) | — | 56,89 GB | 0,7779 | 0,8741 |
| **ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ** | llm-compressor, GPTQ | 18,11 GB | 0,7743 (-0,36pp) | 0,8878 |
| ThakiCloud/Qwen3-30B-A3B-NVFP4-RTN | llm-compressor, RTN | 18,11 GB | 0,7676 (-1,03pp) | 0,8999 |
| RedHatAI/Qwen3-30B-A3B-NVFP4 | RTN | 16,88 GB | 0,7675 (-1,04pp) | 0,8939 |

El autor senala que la diferencia en MMLU entre GPTQ y bf16 es estadisticamente indistinguible (z = -0,8), mientras que RTN pierde alrededor de un punto completo (z = -2,2). En GSM8K, todos los builds de 4 bits muestran valores superiores al bf16, pero el autor advierte que esa diferencia no es separable del ruido de muestreo (z entre 1,1 y 2,1) y no reclama que la cuantizacion mejore las matematicas. La afirmacion defendible es que no hay degradacion medible en GSM8K.

## Requisitos de hardware

- GPU recomendada: NVIDIA B200 (SM100) o GPUs Blackwell equivalentes. El backend NVFP4 nativo solo esta disponible en esta generacion.
- VRAM estimada: los pesos ocupan 18,11 GB; con overhead de inferencia (KV cache, activaciones) se recomienda al menos 24 GB de VRAM. En B200 con 192 GB no hay problema.
- GPUs consumer: no se recomienda su uso en GPUs consumer actuales (RTX 4090, 3090) porque no soportan NVFP4 nativo y vLLM caeria a emulacion Marlin, que es mas lenta que bf16.
- Opciones de despliegue: vLLM 0.27.1 o superior (verificado). Tambien puede usarse con cualquier framework que soporte safetensors y NVFP4, aunque el autor solo ha validado vLLM.
- Latencia y throughput: no se reportan cifras de throughput saturado en la model card. El autor retira cualquier reclamacion de throughput basada en su ejecucion no saturada (utilizacion de GPU entre 54% y 85%). Solo se cita el consumo energetico: 46,8 tok/J frente a 27,4 tok/J en bf16.
- En Hopper (H100/H200): el rendimiento cae a aproximadamente 0,85x de bf16, por lo que no se recomienda NVFP4 en esa generacion; el autor sugiere FP8 como alternativa.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | MMLU | GSM8K | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen/Qwen3-30B-A3B (bf16) | 56,89 GB | bf16 | 0,7779 | 0,8741 | Apache 2.0 | Referencia original |
| **ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ** | 18,11 GB | NVFP4 GPTQ | 0,7743 | 0,8878 | Apache 2.0 | Este modelo |
| ThakiCloud/Qwen3-30B-A3B-NVFP4-RTN | 18,11 GB | NVFP4 RTN | 0,7676 | 0,8999 | Apache 2.0 | Misma familia, receta RTN |
| RedHatAI/Qwen3-30B-A3B-NVFP4 | 16,88 GB | NVFP4 RTN | 0,7675 | 0,8939 | Apache 2.0 | Version RTN de Red Hat |

La comparativa muestra que la receta GPTQ gana aproximadamente 1 punto de MMLU frente a las versiones RTN, con un coste de tiempo de cuantizacion 4,5 veces mayor. En GSM8K las diferencias no son significativas. El autor tambien reproduce el modelo de RedHatAI con su propio build RTN y obtiene una diferencia menor a 0,01pp, lo que confirma que la version de Red Hat usa RTN y no GPTQ.

## Limitaciones y advertencias

- Hardware restringido: el backend NVFP4 nativo solo funciona en GPUs Blackwell (SM100). En Hopper o GPUs consumer, vLLM usa emulacion Marlin que es mas lenta que bf16, anulando la ventaja de rendimiento.
- Evaluacion limitada: la model card solo mide MMLU y GSM8K. No se han evaluado capacidades de codigo, comportamiento multilingue ni rendimiento en contexto largo. No se deben asumir resultados en esas areas.
- Riesgo de alucinacion: no se ha evaluado especificamente, pero es un riesgo inherente a los modelos de lenguaje. La cuantizacion de 4 bits puede amplificar errores en tareas de razonamiento complejo.
- Sesgos: no se reportan estudios de sesgo para esta version cuantizada. El modelo base puede heredar sesgos de sus datos de entrenamiento.
- Rendimiento en GSM8K: aunque los valores son ligeramente superiores al bf16, el autor advierte que no son estadisticamente significativos y no deben interpretarse como una mejora real.
- Compatibilidad de framework: solo se ha verificado con vLLM 0.27.1. Otros servidores de inferencia pueden no soportar NVFP4 correctamente.
- Tiempo de cuantizacion: la receta GPTQ tarda 23.730 segundos (unas 6,6 horas) en una B200, frente a 5.271 segundos (1,5 horas) para RTN. Para equipos que necesiten cuantizar rapidamente, RTN puede ser mas practico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Version RTN del mismo autor: https://huggingface.co/ThakiCloud/Qwen3-30B-A3B-NVFP4-RTN (referenciada en la model card)
- Modelo RedHatAI NVFP4: https://huggingface.co/RedHatAI/Qwen3-30B-A3B-NVFP4 (referenciado en la model card)
- Technical report de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Modelo en ModelScope: https://www.modelscope.cn/models/nv-community/Qwen3-30B-A3B-NVFP4 (version de NVIDIA, no esta version GPTQ)
