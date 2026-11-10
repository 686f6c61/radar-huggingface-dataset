# tahamajs/qwen-2.5-0.5b-cross-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-cross-attention-wikitext2` es un experimento de investigacion publicado en Hugging Face por el usuario tahamajs. Consiste en una cirugia arquitectonica sobre el modelo base Qwen2.5-0.5B, en la que se sustituye el mecanismo de atencion original por una atencion denominada `cross_attention` procedente de un registro interno (`ATTENTION_REGISTRY`) del framework NeuralOps. El resultado se destila posteriormente sobre el dataset WikiText-2 para recuperar la coherencia del modelo tras la modificacion.

El modelo no es un lanzamiento de produccion ni una version oficial de Qwen: es una prueba tecnica de concepto que demuestra que es posible trasplantar mecanismos de atencion alternativos en un transformer preentrenado y recuperar la perplejidad mediante knowledge distillation. El dato mas llamativo es la evolucion de la perplejidad causal: pasa de 813.457,09 antes de la destilacion a 97,96 despues, con un tiempo de destilacion de 180 segundos sobre una NVIDIA RTX 3090.

Por su naturaleza experimental, la model card es extremadamente escueta: no se declaran licencia, idiomas, pipeline ni detalles de entrenamiento mas alla del patron de cirugia `hybrid_3_1` y el dataset utilizado. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen2.5-0.5B con atencion `cross_attention` trasplantada (patron `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados del modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,4 GB, compatible con safetensors por herencia del base, sin confirmar) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de 0,5 mil millones de parametros, y aplica una cirugia arquitectonica consistente en reemplazar el mecanismo de atencion por una implementacion `cross_attention` registrada en el `ATTENTION_REGISTRY` del framework NeuralOps. El patron de sustitucion se denomina `hybrid_3_1`, lo que sugiere una combinacion de capas con atencion original y capas con la atencion trasplantada en una proporcion 3:1, aunque la model card no detalla la distribucion exacta ni el funcionamiento interno de la atencion cruzada.

Tras la cirugia, el modelo queda severamente degradado: la perplejidad causal pre-destilacion alcanza 813.457,09, lo que indica que la sustitucion rompe el comportamiento aprendido. Para recuperarlo se aplica knowledge distillation sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus de Wikipedia en ingles de aproximadamente 2 millones de tokens, durante 180 segundos en una RTX 3090. La destilacion reduce la perplejidad a 97,96, una mejora de 813.359,13 puntos. No se especifican hiperparametros, funcion de perdida, numero de pasos ni si se uso el modelo original como profesor.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base Qwen2.5-0.5B, aunque condicionada por la cirugia de atencion y la destilacion sobre WikiText-2.
- Modelado de lenguaje y calculo de perplejidad sobre texto tipo Wikipedia en ingles (dominio del dataset de destilacion).
- No se declara soporte de tool calling, function calling ni agentes.
- No se declara soporte multilingue explicito; el unico idioma con evidencia empirica es el ingles de WikiText-2.
- No se declaran capacidades de vision, audio, thinking mode ni razonamiento multi-paso.
- Capacidad experimental para investigacion de mecanismos de atencion alternativos y tecnicas de recuperacion mediante destilacion.

## Casos de uso

- Investigacion sobre trasplante de mecanismos de atencion: el modelo sirve como referencia reproducible de como sustituir la atencion de un transformer preentrenado y medir el impacto en perplejidad antes y despues de la destilacion.
- Estudio de knowledge distillation como tecnica de reparacion: permite analizar cuanto puede recuperarse un modelo danado arquitectonicamente con solo 180 segundos de destilacion sobre un corpus pequeno.
- Benchmark de frameworks de cirugia de modelos: util para validar el `ATTENTION_REGISTRY` y el patron `hybrid_3_1` de NeuralOps frente a otras configuraciones.
- Experimentos academicos de perplejidad en dominio WikiText-2: el valor post-destilacion de 97,96 puede usarse como linea base para comparar variantes de atencion cruzada.
- Prototipado educativo: sirve para demostrar en clase o laboratorio el efecto de una modificacion arquitectonica agresiva en un modelo pequeno que cabe en una sola GPU consumer.
- Pruebas de pipelines de evaluacion de modelos: al ser un modelo de 0,5B con pesos ligeros (0,4 GB), es adecuado para validar herramientas de evaluacion automatica sin consumir recursos significativos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-destilacion | 813.457,09 |
| Perplejidad causal post-destilacion | 97,96 |
| Delta de perplejidad | -813.359,13 |
| Tiempo de destilacion | 180,0 s en NVIDIA RTX 3090 |
| Dataset de evaluacion | WikiText-2 (`wikitext-2-raw-v1`) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (0,5B parametros), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,5 GB de pesos; en 4 bits, alrededor de 0,25 GB (estimaciones teoricas, no verificadas en la model card).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor realizo la destilacion en una RTX 3090.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos anos e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no se especifican; al estar basado en Qwen2.5 es probable la compatibilidad con transformers, vLLM, llama.cpp u Ollama, pero la atencion `cross_attention` personalizada puede requerir codigo especifico del framework NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-cross-attention-wikitext2 | 0,5B | no disponible | no disponible | Experimental, 0 descargas |
| Qwen2.5-0.5B (oficial) | 0,5B | 32.768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 (segun documentacion oficial de Qwen) | Produccion, ampliamente usado |
| SmolLM2-360M (Hugging Face) | 0,36B | 8.192 tokens (segun documentacion oficial) | Apache 2.0 (segun documentacion oficial) | Produccion |
| Qwen2.5-1.5B (oficial) | 1,5B | 32.768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 (segun documentacion oficial) | Produccion |

La comparativa se limita al modelo base y a alternativas de tamano similar; los datos de los modelos oficiales provienen de su documentacion publica, no de la model card analizada.

## Limitaciones y advertencias

- Modelo experimental sin validacion en tareas reales: la unica metrica publicada es la perplejidad en WikiText-2.
- Perplejidad post-destilacion de 97,96, muy superior a la de un modelo de 0,5B bien entrenado en ingles (tipicamente por debajo de 20 en WikiText-2), lo que sugiere calidad de generacion limitada.
- La atencion `cross_attention` sustituye a la original, por lo que el comportamiento puede diferir del Qwen2.5-0.5B estandar y romper compatibilidad con herramientas que asumen la arquitectura Qwen2 original.
- Entrenado o destilado unicamente sobre WikiText-2, un corpus de Wikipedia en ingles; se desconoce el comportamiento en otros dominios o idiomas.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar la licencia del modelo base.
- Riesgo de alucinacion y degradacion en conversaciones multi-turno no evaluado.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de reportes de calidad.
- No se especifican limitaciones de sesgo; al derivar de Qwen2.5 y WikiText-2, hereda los sesgos de ambos, pero no han sido auditados en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-cross-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la informacion disponible.
