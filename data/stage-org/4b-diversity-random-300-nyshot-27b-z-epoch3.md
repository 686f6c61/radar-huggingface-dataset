# Stage-org/4b-diversity-random-300-nyshot-27b-z-epoch3

## Resumen

`Stage-org/4b-diversity-random-300-nyshot-27b-z-epoch3` es un checkpoint de investigación publicado por la organización Stage-org. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-4B`, con 4.539.265.536 parámetros totales y pesos almacenados en formato `safetensors` (el repositorio ocupa 9,1 GB, lo que es coherente con pesos en 16 bits). El nombre del repositorio indica que corresponde a la época 3 (`epoch3`) de un experimento denominado `4b-diversity-random-300-nyshot-27b-z`, cuyo significado exacto no se documenta.

El modelo no dispone de model card descriptiva más allá de un bloque autogenerado de procedencia de entrenamiento, en el que se detallan el comando y la configuración usados. Según esa configuración, el entrenamiento empleó el método `rl` con el framework `prime_rl`, un algoritmo con máscara tipo DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0`, `kl_tau = 0.001`), optimizador AdamW con `lr = 1e-06`, `batch_size = 128`, `group_size = 8` y 10.000 pasos de aprendizaje a lo largo de 3 épocas. La generación durante el RL se realizó con `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`, y la evaluación de recompensa se delegó en un juez externo servido por API (`gpt-5.6-luna`) con `reasoning_effort = medium`.

Su relevancia es limitada y de carácter experimental: se trata de un artefacto intermedio de un pipeline de RL, con cero descargas y cero valoraciones en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados. Resulta de interés únicamente para quienes investigan pipelines de RL sobre modelos pequeños, decodificación con modo de razonamiento o el uso de jueces automáticos como señal de recompensa, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (etiqueta `qwen3_5`); modelo base declarado: `Qwen/Qwen3.5-4B`. Detalle de capas, cabezas y tipo de atención: no disponible |
| Parámetros totales | 4.539.265.536 (4,54 mil millones) |
| Parámetros activos | No aplica (no se declara arquitectura MoE; todos los parámetros son densos) |
| Longitud de contexto | 65.536 tokens en la configuración de inferencia de vLLM del entrenamiento (`max_model_len = 65536`). La configuración del aprendiz declara `seq_len = 300000`, valor contradictorio y no confirmado por el autor |
| Tipos de cuantización | No disponible (el repositorio solo contiene `safetensors` en 16 bits; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` |
| Tamaño del repositorio | 9,1 GB |
| Fecha de creación | 2026-09-20 |
| Fecha de actualización | 2026-09-20 |

## Arquitectura y entrenamiento

No se publica información arquitectónica propia en la model card. La única evidencia disponible es la etiqueta `qwen3_5` del repositorio y el campo `"model" = "Qwen/Qwen3.5-4B"` de la configuración de entrenamiento, lo que sitúa el modelo como un derivado del transformer denso Qwen3.5-4B de Alibaba. El recuento real de parámetros del checkpoint (4.539.265.536) es ligeramente superior al del modelo base de 4B, diferencia atribuible a la tokenización/embeddings o a la propia definición del modelo base, no a un cambio estructural documentado.

El entrenamiento es un proceso de RL completo, no un simple ajuste supervisado. La configuración registra: `learner_steps = 10000`, `learner_epoch = 3`, `batch_size = 128`, optimizador AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `betas = (0.9, 0.99)` y `max_norm = 1.0`. El bucle de RL usa `group_size = 8`, `max_inflight_rollouts = 256` y `max_off_policy_steps = 8`, con una pérdida configurada como `default` más los umbrales de máscara DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 0.001`. La inferencia para generar rollouts se sirvió con vLLM (`gpu_memory_utilization = 0.9`, `max_model_len = 65536`, `language_model_only = true`), con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`, y el entrenamiento se ejecutó con `attn = "flash_attention_2"`. El reparto de hardware declarado es de 2 GPU por nodo: 1 GPU para inferencia y 1 GPU para entrenamiento, con transmisión de pesos por sistema de ficheros.

Como innovación destacable, el pipeline emplea un juez automático servido por API para puntuar las generaciones (`open_ended_judge` con `max_retries = 3`, `max_in_flight = 32` y `mean_score = false`), lo que desplaza la señal de recompensa a un modelo externo en lugar de a un reward model local. El dataset de entrenamiento es `Stage-org/4b-diversity-random-300-nyshot-27b-z`, sin más detalle sobre composición, número de tokens, idiomas ni proceso de filtrado. No se documenta ningún uso de RLHF con anotadores humanos ni de DPO; el método declarado es RL con generación puntuada por juez.

## Capacidades

- Generación de texto y razonamiento en modo `thinking`: la configuración de generación activa explícitamente `enable_thinking = true` y el parser de razonamiento configurado es `qwen3`, lo que implica que el checkpoint conserva el formato de bloques de razonamiento de la familia Qwen3.
- Llamada a herramientas y funciones: el servidor de inferencia del entrenamiento declara `tool_call_parser = "qwen3_coder"`, de modo que el modelo se sirve con soporte de tool calling en el formato de Qwen3-Coder.
- Razonamiento en varios pasos: el entrenamiento con RL sobre rollouts de hasta 4.096 tokens de generación y `group_size = 8` está orientado a tareas de razonamiento multi-paso, aunque no se publican evaluaciones que lo confirmen.
- Generación de código: no se declara de forma explícita, pero el parser de tool calling empleado es el de la familia Coder, lo que sugiere entrenamiento o al menos compatibilidad con flujos de código.
- Capacidades multilingües: no disponibles (el autor no declara idiomas).
- Capacidades de visión o audio: no disponibles; la configuración fija `language_model_only = true`, por lo que no hay evidencia de multimodalidad.
- Conformidad con OpenAI API: el orquestador apunta a un endpoint `http://localhost:7000/v1`, de modo que el artefacto se ha servido a través de vLLM con API compatible con OpenAI.

## Casos de uso

- Investigación en pipelines de RL: el repositorio documenta el comando completo, la configuración TOML, el framework (`prime_rl`), los hiperparámetros y el dataset empleado, por lo que sirve como caso reproducible para estudiar cómo se comporta un `Qwen3.5-4B` tras 3 épocas de RL con recompensa de juez externo.
- Estudio de jueces automáticos como señal de recompensa: permite analizar si un juez servido por API (`gpt-5.6-luna`, `reasoning_effort = medium`) induce comportamientos de explotación de la recompensa en un modelo de 4,5B, comparando las épocas 1 a 3 del mismo experimento.
- Evaluación de la degradación por RL sobre modelos pequeños: al ser un checkpoint de época 3 de un modelo de 4,5B, es un candidato directo para medir pérdida de capacidades base (olvido catastrófico) frente al `Qwen3.5-4B` original.
- Asistente conversacional con contexto largo: con 65.536 tokens de ventana en la configuración de vLLM, puede gestionar conversaciones multi-turno extensas o resumir hilos completos, siempre que se acepte su estado experimental y la ausencia de licencia.
- Procesamiento de documentos largos: análisis, extracción y pregunta-respuesta sobre informes técnicos o contractuales de decenas de miles de tokens, usando el modo de razonamiento para descomponer la consulta.
- Integración en agentes con herramientas: gracias al parser `qwen3_coder` puede conectarse a funciones externas (búsqueda, cálculo, APIs corporativas) en bucles de varios pasos, aunque la fiabilidad en producción no está validada por el autor.
- Generación y revisión de código en flujos internos: autocompletado, generación de tests unitarios o explicación de fragmentos, aprovechando el formato de razonamiento previo a la respuesta.
- Base para ajuste adicional: al ser un checkpoint de 4,5B, puede servir como punto de partida para SFT o DPO específicos de dominio en una sola GPU de 24 GB, dado su reducido tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se proporcionan curvas de recompensa, evaluaciones del juez ni comparaciones contra el modelo base `Qwen/Qwen3.5-4B`. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM para inferencia en 16 bits (formato del repositorio): los pesos ocupan aproximadamente 9,1 GB; con activaciones y caché KV conviene reservar entre 12 y 16 GB según la longitud de contexto.
- VRAM estimada en 8 bits: en torno a 5 GB de pesos, manejable en GPUs de 8-12 GB.
- VRAM estimada en 4 bits: en torno a 2,7-3 GB de pesos, lo que permite ejecución en GPUs de 6-8 GB e incluso en CPU con llama.cpp.
- Consumo de caché KV: no disponible (no se documentan número de capas, cabezas ni uso de GQA). Con la ventana declarada de 65.536 tokens, la caché KV puede ser el factor dominante de memoria frente a los propios pesos.
- GPU recomendadas: para 16 bits, RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100; para mayor comodidad en contexto largo, A100 o H100. Para 4 bits, RTX 3060 12 GB, RTX 4060 Ti, RTX 4070.
- ¿Cabe en GPU de consumo? Sí. En 16 bits cabe en RTX 4090, 3090, 4080 (16 GB) y similares; en cuantización de 4 bits cabe en tarjetas de 8 GB.
- Opciones de despliegue: vLLM (es el servidor empleado durante el entrenamiento, con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`), SGLang, TGI y Transformers con `flash_attention_2`. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, ya que el repositorio no incluye ese formato.
- Nota sobre el hardware de entrenamiento: la configuración declara 2 GPU por nodo (1 para inferencia, 1 para entrenamiento), lo que indica que el pipeline se diseñó para ejecutarse en un único nodo pequeño.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa con el modelo base no puede completarse porque no se dispone de las especificaciones publicadas de `Qwen/Qwen3.5-4B` en la información proporcionada. Las cifras de los modelos alternativos proceden de sus respectivas model cards públicas y se incluyen como referencia de categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Stage-org/4b-diversity-random-300-nyshot-27b-z-epoch3` | 4,54B | 65.536 tokens (config. de inferencia; `seq_len = 300000` sin confirmar) | No disponible | Safetensors en HF, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base) | No disponible | No disponible | No disponible | No disponible en la información consultada |
| `Qwen/Qwen3-4B` | 4,02B | 32.768 nativos, extensible a 131.072 con YaRN | Apache 2.0 | Safetensors, GGUF, AWQ, ampliamente desplegado |
| `meta-llama/Llama-3.2-3B` | 3,21B | 128.000 | Llama 3.2 Community License | Safetensors, GGUF, ecosistema maduro |
| `google/gemma-3-4b-it` | ~4B | 128.000 | Gemma Terms of Use | Safetensors, GGUF, cuantizaciones comunitarias |

Diferencias clave: el modelo evaluado no declara licencia, no publica idiomas, no ofrece cuantizaciones y no presenta resultados de evaluación, mientras que las alternativas de la misma franja (3-4B) cuentan con licencias explícitas, ventanas comparables o superiores y ecosistemas de despliegue consolidados. El único punto diferencial del checkpoint es su procedencia: un ajuste por RL con juez externo, aspecto que las alternativas generalistas no documentan.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial. Debe tratarse como material de investigación y no desplegarse en producción sin aclarar previamente los términos con el autor.
- Ausencia total de evaluación: no hay benchmarks, ni curvas de entrenamiento, ni comparaciones contra el modelo base. No hay ninguna evidencia publicada de que el RL haya mejorado las capacidades del `Qwen3.5-4B`; es igualmente posible que las haya degradado.
- Riesgo de explotación de la recompensa (reward hacking): la señal de RL proviene de un juez servido por API, no de anotaciones humanas. Los modelos pequeños ajustados con jueces automáticos tienden a adoptar patrones superficiales que maximizan la puntuación sin mejorar la corrección real.
- Riesgo de alucinación: al tratarse de un modelo de 4,5B con modo de razonamiento, puede generar cadenas de razonamiento plausibles pero incorrectas, y datos factuales inventados. No hay datos de calibración ni de tasas de error.
- Idiomas desconocidos: el autor no declara idiomas soportados. No hay garantía de un rendimiento aceptable en castellano ni en ninguna otra lengua distinta del inglés.
- Ventana de contexto ambigua: la configuración de entrenamiento declara `seq_len = 300000` mientras que la de inferencia fija `max_model_len = 65536`. Esta discrepancia no está aclarada y sugiere que el valor alto podría ser un error de configuración o un ajuste no materializado en el checkpoint.
- Discrepancia en el recuento de parámetros: el checkpoint tiene 4.539.265.536 parámetros frente a la denominación "4B" del modelo base; conviene verificar la correspondencia exacta antes de asumir equivalencia estructural.
- Artefacto efímero: cero descargas, cero valoraciones y una ventana de publicación de un minuto entre creación y actualización. Se trata de un checkpoint de experimento, no de una release mantenida.
- Sin cuantizaciones oficiales: cualquier conversión a GGUF, AWQ o GPTQ debe realizarla el usuario, con el consiguiente riesgo de degradación no medida.
- Sin garantías de soporte: no se documentan issues, roadmap ni mantenimiento por parte de la organización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-diversity-random-300-nyshot-27b-z-epoch3
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Stage-org/4b-diversity-random-300-nyshot-27b-z
- Modelo base declarado en la configuración: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de la organización: https://huggingface.co/Stage-org
- Paper, blog o demo oficiales: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a portales de ofertas de prácticas sin relación con el artefacto.
