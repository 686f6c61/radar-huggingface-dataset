# Taykhoom/Evo1-1-7B-8K

## Resumen

Evo1-1-7B-8K es un port minimalista para HuggingFace de la variante 1-7B-8K del modelo Evo 1, un modelo fundacional de ADN de ~7.000 millones de parámetros desarrollado originalmente por Together Computer. El port, realizado por Taykhoom, corrige cuatro deficiencias de la implementación original con `trust_remote_code`: expone el backbone sin cabeza LM, permite `output_hidden_states` y `output_attentions`, posibilita cambiar el backend de atención en tiempo de carga y elimina la dependencia obligatoria de `flash_attn`. La paridad numérica con el checkpoint de referencia se ha verificado como bit-exacta.

El modelo emplea una arquitectura StripedHyena, un diseño híbrido que combina 29 bloques basados en el operador Hyena (filtros IIR de ganancia no acotada) con 3 bloques de atención multi-cabeza causal, distribuidos en los índices de capa 8, 16 y 24. Se entrenó con un objetivo de predicción del siguiente token a nivel de byte sobre aproximadamente 300.000 millones de tokens del dataset OpenGenome, compuesto por genomas completos de procariotas, con una ventana de contexto de 8.192 tokens. Su relevancia actual radica en que permite a la comunidad investigadora usar un modelo genómico de última generación sin parchear código, con soporte para generación de secuencias, extracción de embeddings y scoring de log-probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StripedHyena (29 bloques Hyena + 3 bloques MHA causales) |
| Parametros totales | 6.452.781.056 (~7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (solo pesos bf16 en safetensors) |
| Idiomas soportados | No disponible (modelo de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, con `trust_remote_code`) |

## Arquitectura y entrenamiento

Evo1-1-7B-8K utiliza la arquitectura StripedHyena, un diseño híbrido que intercala capas de atención con capas basadas en el operador Hyena. De las 32 capas totales, 3 son de atención multi-cabeza causal (con 32 cabezas, dimensión de embedding 4096 y RoPE con base 10000) y las 29 restantes son bloques Hyena con un tamaño de estado de 8. La dimensión oculta de la FFN es 10.928 con activación GELU con compuerta, y la normalización es RMSNorm con épsilon 1e-6. El vocabulario es de 512 entradas, donde los bytes UTF-8 crudos (IDs 0-255) se rellenan hasta 512; el byte 0 actúa como EOD/EOS y el byte 1 como PAD.

El entrenamiento se realizó con un objetivo de predicción del siguiente token a nivel de byte sobre el dataset OpenGenome, que contiene aproximadamente 300.000 millones de tokens de genomas completos de procariotas. El checkpoint de partida es `togethercomputer/evo-1-8k-base@1.1_fix`. El modelo se entrenó en bfloat16, aunque los parámetros de los filtros Hyena en forma modal (`poles` y `residues`) y las frecuencias rotatorias (`inv_freq`) se mantienen en fp32 por estabilidad numérica. El port incluye código remoto que restaura automáticamente estos invariantes tras la carga y tras llamadas a `.to()`, `.half()` o `.bfloat16()`.

Una innovación destacable del port es la verificación de paridad bit-exacta con la implementación de referencia: con `attn_implementation="flash_attention_2"` en bf16, el error máximo absoluto es 0.000e+00 en todos los niveles de representación. Con los backends `sdpa` o `eager`, las diferencias numéricas se amplifican debido a la ganancia no acotada de los filtros Hyena, llegando a un error relativo de aproximadamente el 1% en el flujo residual intermedio, aunque la salida final tras RMSNorm permanece acotada.

## Capacidades

- Generacion de secuencias de ADN a nivel de byte: el modelo predice el siguiente token (byte) en una secuencia genomica, permitiendo generar fragmentos de ADN procariota con coherencia estadistica.
- Extraccion de embeddings de secuencias: el port expone el backbone sin cabeza LM mediante `AutoModel.from_pretrained`, lo que permite obtener representaciones vectoriales de secuencias de ADN para tareas downstream.
- Scoring de secuencias: al ser un modelo autorregresivo, puede calcular log-probabilidades de secuencias dadas, util para evaluar la plausibilidad de variantes o elementos genomicos.
- Modelado de contexto largo: con 8.192 tokens de contexto, puede procesar fragmentos genomicos de aproximadamente 8 kilobases de una sola vez.
- Soporte de multiples backends de atencion: funciona con `flash_attention_2` (bit-exacto con la referencia), `sdpa` (por defecto, sin dependencias extra) y `eager`.
- Sin capacidades de lenguaje natural: no soporta tool calling, agentes, razonamiento ni generacion de texto en idiomas humanos; su unico dominio es la genomica.

## Casos de uso

- Analisis de secuencias genomicas procariotas: el modelo puede puntuar la probabilidad de secuencias de ADN, lo que permite identificar regiones conservadas o anomalias en genomas bacterianos. Se usaria cargando el modelo con `Evo1ForCausalLM` y calculando la log-verosimilitud de fragmentos de interes.
- Generacion de ADN sintetico para biologia sintetica: investigadores pueden muestrear secuencias nuevas condicionadas a un contexto dado, explorando el espacio de secuencias plausibles para disenar promotores, genes o elementos reguladores. La generacion se realiza con decodificacion autorregresiva a nivel de byte.
- Extraccion de embeddings para clasificacion de elementos genomicos: usando el backbone expuesto, se pueden obtener representaciones de secuencias y alimentar clasificadores supervisados para tareas como prediccion de promotores, sitios de union de factores de transcripcion o anotacion funcional de genes.
- Deteccion de variantes y estudios de fitness: al comparar las probabilidades de secuencias mutadas frente a la secuencia de referencia, se puede estimar el efecto de mutaciones puntuales en la aptitud del organismo, una tarea para la que Evo 1 fue disenado originalmente.
- Compresion y modelado de genomas completos: con su contexto de 8K, el modelo puede procesar genomas procariotas completos (tipicamente de 1-10 Mbp) en fragmentos, permitiendo estudios de estructura genomica a gran escala.
- Investigacion en evolucion molecular: las probabilidades condicionales del modelo pueden usarse para estudiar tasas de sustitucion, presion selectiva y coevolucion de sitios en genomas bacterianos, sin necesidad de alineamientos multiples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ya que el modelo no esta disenado para tareas de lenguaje natural. La unica verificacion reportada es la paridad bit-exacta con el checkpoint de referencia de Together Computer, con un error maximo absoluto de 0.000e+00 en todos los niveles de representacion y concordancia top-1 en 128 de 128 posiciones de logits.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 12,9 GB en disco (pesos safetensors). En inferencia, con overhead de activaciones y estado del filtro Hyena, se recomienda al menos 16 GB de VRAM para generacion con contexto completo de 8.192 tokens.
- GPU recomendadas: se verifico en H100 con PyTorch 2.7.1 y CUDA 12.9. Una RTX 4090 (24 GB) o A100 (40/80 GB) son adecuadas. GPUs con menos de 16 GB de VRAM pueden requerir cuantizacion, que no esta disponible oficialmente.
- Si cabe en consumer GPU: si, en una RTX 4090 o RTX 3090 (24 GB) cabe sin cuantizacion para inferencia de secuencias de longitud moderada.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via principal. No se ha confirmado soporte en vLLM, llama.cpp, Ollama o TGI; dado que la arquitectura StripedHyena no es un transformer estandar, es probable que estos motores no la soporten sin modificaciones.
- Latencia y throughput: no disponible. La generacion autorregresiva a nivel de byte es inherentemente lenta para secuencias largas; se recomienda usar `flash_attention_2` para maximizar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taykhoom/Evo1-1-7B-8K | ~7B | 8.192 | StripedHyena | Apache 2.0 | HuggingFace |
| Taykhoom/Evo1-1-7B-131K | ~7B | 131.072 | StripedHyena (RoPE escalada linealmente) | Apache 2.0 | HuggingFace |
| Taykhoom/Evo1-1.5-7B-8K | ~7B | 8.192 | StripedHyena (entrenado con ~50% mas tokens) | Apache 2.0 | HuggingFace |
| togethercomputer/evo-1-8k-base | ~7B | 8.192 | StripedHyena (original) | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparativa se limita a caracteristicas arquitectonicas y de entrenamiento. Otros modelos genomicos como Evo 2 (de Arc Institute) o Nucleotide Transformer no estan cubiertos por los datos disponibles.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con genomas de procariotas; su capacidad de generalizacion a eucariotas (incluido el genoma humano) es limitada y no ha sido evaluada en la informacion disponible.
- No es un modelo de lenguaje natural: no genera texto, no entiende instrucciones y no soporta tool calling ni razonamiento simbolico. Intentar usarlo para tareas de NLP dara resultados sin sentido.
- Riesgo de alucinacion en secuencias generadas: las secuencias de ADN sintetico producidas por el modelo son estadisticamente plausibles pero no tienen garantia de funcionalidad biologica. Cualquier uso en biologia sintetica requiere validacion experimental.
- Diferencias numericas entre backends de atencion: si se usa `sdpa` o `eager` en lugar de `flash_attention_2`, las activaciones intermedias pueden diferir hasta un 1% en el flujo residual, aunque la salida final esta acotada. Para reproduccion exacta de resultados, es obligatorio usar `flash_attention_2`.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo remoto del autor del port. Se recomienda auditar el codigo antes de usarlo en entornos de produccion.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ). Reducir la precision puede degradar la estabilidad numerica de los filtros Hyena, que ya son sensibles a pequenos cambios.
- El contexto de 8.192 tokens es corto para genomas completos de procariotas (que suelen superar 1 Mbp). Para secuencias largas, se recomienda usar la variante de 131K del mismo autor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantias de exactitud biologica ni de seguridad en aplicaciones clinicas o de ingenieria genetica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/Evo1-1-7B-8K
- Coleccion Evo1 de Taykhoom: https://huggingface.co/collections/Taykhoom/evo1
- Modelo original de Together Computer: https://huggingface.co/togethercomputer/evo-1-8k-base
- Dataset OpenGenome: https://huggingface.co/datasets/LongSafari/open-genome
- Ficha de Evo 1.5 8k Base en biolm.ai: https://biolm.ai/models/evo-15-8k-base/
