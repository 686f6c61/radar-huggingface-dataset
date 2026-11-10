# tahamajs/qwen-2.5-0.5b-fusion-attn-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-fusion-attn-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario tahamajs. Se trata de un transplante arquitectónico sobre el modelo base Qwen2.5-0.5B, en el que la atención original del transformer se sustituye por un mecanismo denominado `fusion_attn`, registrado en un `ATTENTION_REGISTRY` del framework NeuralOps. El resultado se ha destilado sobre el dataset WikiText-2 para recuperar parte de la calidad perdida tras la cirugía.

El modelo no es un lanzamiento de producción ni un modelo entrenado desde cero: es una prueba de concepto que demuestra que es posible intercambiar el bloque de atención de un LLM preentrenado y reajustar los pesos mediante destilación de conocimiento en una sola GPU consumer (RTX 3090) en unos 180 segundos. La perplexity causal pasó de 176.122,80 antes de la destilación a 6.215,12 después, lo que ilustra tanto el daño inicial de la cirugía como la recuperación parcial lograda con un ajuste muy breve.

Por su naturaleza, el modelo tiene interés para investigadores que estudian arquitecturas de atención alternativas, técnicas de model surgery y pipelines de destilación rápida, pero no está pensado para uso en producción: la perplexity final sigue siendo muy elevada para un modelo de 0,5B y la model card no documenta licencia, idiomas ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion sustituida por `fusion_attn` (NeuralOps), patron de cirugia `hybrid_3_1` |
| Parametros totales | 535.963.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B, no documentada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso de aproximadamente 536 millones de parametros. Sobre esa base se aplica una "cirugia" arquitectonica que reemplaza el mecanismo de atencion por `fusion_attn`, un modulo registrado en el `ATTENTION_REGISTRY` del proyecto NeuralOps. El patron de sustitucion se denomina `hybrid_3_1`, lo que sugiere una combinacion de capas con atencion fusionada y capas con atencion original en una proporcion 3:1, aunque la model card no detalla la implementacion interna de `fusion_attn` ni el criterio exacto de asignacion por capa.

Tras el transplante, el modelo se ajusta mediante destilacion de conocimiento (KD) sobre el split `wikitext-2-raw-v1` de WikiText-2. El entrenamiento es muy breve: 180,1 segundos en una NVIDIA RTX 3090. No se documentan el numero de tokens vistos, la funcion de perdida exacta, el profesor utilizado para la destilacion ni si hubo etapas de RLHF o DPO. La unica metrica reportada es la perplexity causal: 176.122,80 antes de la destilacion y 6.215,12 despues, con un delta de -169.907,68. No se mencionan innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto autoregresiva basica, heredada estructuralmente de Qwen2.5-0.5B, aunque degradada por la cirugia y la destilacion limitada.
- Razonamiento y codigo: no verificados tras el transplante; la model card no reporta evaluaciones en estas areas.
- Tool calling / function calling: no documentado; no se puede asumir que se conserve el soporte del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas del modelo base no se confirman para este derivado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Uso previsto: experimentacion con arquitecturas de atencion alternativas y pipelines de model surgery, no inferencia de produccion.

## Casos de uso

- Investigacion en model surgery: servir como referencia reproducible de como sustituir el bloque de atencion de un transformer preentrenado y medir el impacto en perplexity antes y despues de la destilacion.
- Estudio de mecanismos de atencion alternativos: comparar `fusion_attn` con la atencion estandar de Qwen2.5 en tareas controladas de modelado de lenguaje sobre WikiText-2.
- Validacion de pipelines de destilacion rapida: el ajuste de 180 segundos en una RTX 3090 permite iterar sobre hiperparametros de KD sin acceso a clusters grandes.
- Docencia y divulgacion: ejemplo practico de transplante de modulos en LLMs y de como la perplexity refleja el coste de una cirugia arquitectonica agresiva.
- Benchmarking de frameworks: usar el modelo como caso de prueba para el `ATTENTION_REGISTRY` de NeuralOps y para verificar la compatibilidad de pesos safetensors con herramientas de carga.
- Analisis de robustez post-cirugia: evaluar la degradacion de capacidades (generacion, coherencia, seguimiento de instrucciones) en un modelo deliberadamente intervenido, como linea base negativa en estudios de calidad.

## Benchmarks y rendimiento

| Metrica | Antes de KD | Despues de KD | Delta |
|---|---|---|---|
| Perplexity causal (WikiText-2) | 176.122,80 | 6.215,12 | -169.907,68 |
| Tiempo de destilacion | no disponible | 180,1 s (RTX 3090) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,1 GB solo para pesos (536 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,6-0,8 GB para pesos; en 4 bits, alrededor de 0,3-0,4 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor uso una RTX 3090 para la destilacion, y para inferencia basta con una RTX 3060, RTX 4060 o superior.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para pruebas lentas.
- Opciones de despliegue: carga directa con `transformers` (pesos safetensors); compatibilidad con vLLM, llama.cpp, Ollama o TGI no verificada, ya que la atencion `fusion_attn` requiere el codigo de NeuralOps y no es un transformer Qwen2 estandar.
- Latencia y throughput: no disponibles; dependen de la implementacion de `fusion_attn` y de si el kernel esta optimizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-fusion-attn-wikitext2 | 536 M | no disponible | no disponible | Experimental, 0 descargas |
| Qwen2.5-0.5B (base) | 494 M aprox. | 32.768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 | Produccion, ampliamente usado |
| Qwen2.5-1.5B | 1.540 M aprox. | 32.768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 | Produccion |
| SmolLM2-360M | 360 M | 8.192 tokens (segun documentacion oficial) | Apache 2.0 | Produccion |

La comparativa directa es limitada: el modelo derivado no documenta contexto, licencia ni rendimiento en benchmarks, y su perplexity en WikiText-2 (6.215,12) esta ordenes de magnitud por encima de lo esperable en un modelo de 0,5B bien ajustado. Los datos del modelo base y de las alternativas provienen de su documentacion publica, no de la model card analizada.

## Limitaciones y advertencias

- Perplexity muy elevada: 6.215,12 en WikiText-2 tras la destilacion indica una calidad de modelado del lenguaje muy por debajo de la del Qwen2.5-0.5B original.
- Entrenamiento extremadamente corto (180 s) y sobre un unico dataset pequeno (WikiText-2), lo que limita la generalizacion y favorece el sobreajuste al dominio.
- Riesgo elevado de alucinacion y de generacion incoherente, especialmente fuera del dominio de WikiText-2.
- Licencia no disponible: no se puede asumir uso comercial; la licencia del modelo base (Qwen2.5-0.5B, Apache 2.0) no se traslada automaticamente a este derivado sin confirmacion del autor.
- Idiomas no documentados: no se garantiza el soporte multilingue del modelo base.
- Dependencia de codigo externo: `fusion_attn` y `ATTENTION_REGISTRY` pertenecen a NeuralOps; sin ese codigo, los pesos no se pueden cargar en un transformer Qwen2 estandar.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- No apto para produccion: es un artefacto de investigacion sin evaluaciones de seguridad, sesgo ni robustez.
- Sesgos: no evaluados; se heredan potencialmente los del modelo base y los del corpus WikiText-2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-fusion-attn-wikitext2
- Modelo base Qwen2.5-0.5B (referencia): https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- NeuralOps / `ATTENTION_REGISTRY`: no disponible (no se proporciona enlace en la informacion disponible)
- Paper o blog del autor: no disponible
