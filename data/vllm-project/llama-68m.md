# vllm-project/llama-68m

## Resumen

llama-68m es un modelo de lenguaje de tipo LLaMA con 68 millones de parámetros, entrenado sobre Wikipedia y partes de los conjuntos C4-en y C4-realnewslike. Fue desarrollado originalmente por JackFram y esta copia concreta la mantiene el proyecto vLLM en su organizacion de HuggingFace para uso interno en sus pipelines de integracion continua. No es un modelo pensado para produccion ni para tareas generativas generales, sino un *base model* de proposito especifico.

Su relevancia tecnica radica en su papel como modelo borrador (*Small Speculative Model*) en SpecInfer, una tecnica de inferencia especulativa que acelera el servicio de LLMs grandes mediante la generacion de candidatos con un modelo pequeno y su verificacion con un modelo grande. Con solo 68M de parametros, su huella de memoria es minima (el repositorio ocupa 0,8 GB), lo que lo hace idoneo para experimentacion con decodificacion especulativa, pruebas de infraestructura y validacion de pipelines de servido.

Es importante subrayar que el autor original indica explicitamente que no se ha realizado una evaluacion formal exhaustiva, y que debe usarse con precaucion. Las metricas disponibles (MMLU 22,96%, HellaSwag 29,04%, perplejidad en WikiText-2 de 306,79) confirman que su calidad generativa es muy limitada, coherente con su tamano y su condicion de modelo base sin ajuste fino por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (decoder-only) |
| Parametros totales | 68 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (pytorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaMA original: un transformer decoder-only con las modificaciones tipicas de esta familia (normalizacion RMSNorm, activacion SwiGLU, RoPE para posiciones relativas). Al tratarse de un modelo de 68M de parametros, su profundidad y dimensiones ocultas son reducidas, aunque la model card no detalla la configuracion exacta de capas, cabezas de atencion ni dimension de embedding.

El entrenamiento se realizo sobre Wikipedia y subconjuntos de C4-en y C4-realnewslike. No se especifica el numero total de tokens procesados ni si hubo fases de ajuste fino supervisado, RLHF o DPO. El modelo es, por tanto, un *base model* sin alineamiento instruccional. Su proposito declarado es servir como modelo borrador en SpecInfer, donde genera multiples tokens candidatos que un modelo mayor verifica en paralelo mediante verificacion de arbol de tokens (*token tree verification*), reduciendo la latencia de servido sin degradar la calidad de salida del modelo grande.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, sin ajuste por instrucciones.
- Modelado de lenguaje y calculo de perplejidad, util para validacion de pipelines.
- Generacion de tokens candidatos para decodificacion especulativa (SpecInfer).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito (*thinking mode*).
- Multilingue: limitado a ingles; no se reporta soporte de otros idiomas.

## Casos de uso

- Decodificacion especulativa en produccion: se usa como modelo borrador que propone secuencias de tokens rapidamente, verificadas despues por un modelo grande (por ejemplo, Llama-2-70B en el paper original). Su reducido tamano permite generacion de candidatos con latencia minima.
- Pruebas de integracion continua de vLLM: el proyecto vLLM mantiene esta copia para validar el correcto funcionamiento del motor de inferencia y de las rutas de carga de checkpoints en sus tests automatizados.
- Benchmarking de infraestructura: sirve para medir throughput, latencia y consumo de memoria de frameworks de servido (vLLM, TGI, llama.cpp) con un modelo que cabe holgadamente en cualquier GPU.
- Validacion de pipelines de tokenizacion y preprocesado: al ser un modelo LLaMA estandar, permite comprobar el correcto manejo de tokenizadores, plantillas y formatos de pesos.
- Experimentacion academica en inferencia especulativa: investigadores pueden reproducir y extender resultados de SpecInfer sin necesidad de recursos de GPU significativos.
- Desarrollo y depuracion de sistemas de evaluacion: su rapida ejecucion (la bateria de benchmarks reportada tardo 44,74 minutos) lo hace util para probar arneses de evaluacion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Categoria | Benchmark | Metrica | Resultado |
|---|---|---|---|
| Linguistica y gramatica | BLiMP | Accuracy | 70,57% |
| Sentido comun y razonamiento | PIQA | Normalized Accuracy | 59,25% |
| | BoolQ | Accuracy | 57,71% |
| | COPA | Accuracy | 53,00% |
| | WinoGrande | Accuracy | 50,59% |
| | HellaSwag | Normalized Accuracy | 29,04% |
| | RACE | Accuracy | 25,36% |
| | CommonsenseQA | Accuracy | 19,82% |
| Academico y conocimiento | SciQ | Normalized Accuracy | 57,80% |
| | ARC-Easy | Normalized Accuracy | 35,98% |
| | OpenBookQA | Normalized Accuracy | 25,60% |
| | MMLU | Accuracy | 22,96% |
| | ARC-Challenge | Normalized Accuracy | 22,87% |
| Modelado de lenguaje | LAMBADA | Accuracy | 13,24% |
| | C4-Perplexity | Word Perplexity | 205,79 |
| | WikiText-2 | Word Perplexity | 306,79 |

Las tareas de Aritmetica y SocialIQA fallaron durante la ejecucion por incompatibilidades del pipeline, sin puntuacion reportada. No se proporcionan comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en precision FP16 (68M parametros x 2 bytes), y alrededor de 0,15 GB en cuantizacion de 4 bits. El repositorio completo ocupa 0,8 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe incluso en GPUs integradas o en CPU.
- Cabe en cualquier GPU de consumo: RTX 4090, RTX 3090, RTX 3060, e incluso en tarjetas con 2 GB de VRAM.
- Opciones de despliegue: vLLM (uso principal, dado el origen del repositorio), llama.cpp, Ollama, TGI, HuggingFace Transformers.
- Latencia y throughput: no se reportan datos especificos. Por su tamano, se espera una latencia muy baja y un throughput alto en hardware moderno, pero no hay cifras oficiales disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| vllm-project/llama-68m | 68M | no disponible | Apache 2.0 | Modelo borrador para inferencia especulativa |
| JackFram/llama-68m | 68M | no disponible | Apache 2.0 | Original del que deriva esta copia |
| JackFram/llama-160m | 160M | no disponible | Apache 2.0 | Modelo borrador de mayor tamano de la misma familia |
| JackFram/llama-68m (variantes ajustadas) | 68M | no disponible | Apache 2.0 | Versiones con ajuste instruccional derivadas |

La comparativa se limita a la familia de modelos borrador de JackFram, ya que no se dispone de datos de rendimiento de alternativas en la informacion proporcionada. No se dispone de comparaciones con modelos generativos de proposito general, dado que la categoria de uso es distinta.

## Limitaciones y advertencias

- Calidad generativa muy baja: MMLU del 22,96% y perplejidad en WikiText-2 de 306,79 indican un modelado de lenguaje pobre, esperable por su tamano.
- No es un modelo ajustado por instrucciones: no sigue ordenes ni mantiene conversaciones coherentes de forma fiable.
- Alto riesgo de alucinacion y de texto incoherente en generacion libre.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia.
- No apto para produccion en tareas de atencion al cliente, generacion de codigo o razonamiento.
- La model card original advierte explicitamente que no se ha realizado una evaluacion formal y que debe usarse con precaucion.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso comercial directo salvo como componente auxiliar en inferencia especulativa.
- Esta copia concreta existe para reducir riesgo de cadena de suministro en CI de vLLM; no se garantiza su mantenimiento a largo plazo mas alla de las necesidades del proyecto.

## Enlaces

- HuggingFace (copia vLLM): https://huggingface.co/vllm-project/llama-68m
- HuggingFace (original): https://huggingface.co/JackFram/llama-68m
- Paper SpecInfer: https://arxiv.org/abs/2305.09781
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio SpecInfer: https://github.com/flexflow/FlexFlow
