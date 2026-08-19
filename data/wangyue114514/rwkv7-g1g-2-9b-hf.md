# wangyue114514/rwkv7-g1g-2.9b-hf

## Resumen

RWKV-7 G1G 2.9B es un modelo de lenguaje causal recurrente de la familia RWKV-7 "Goose", convertido al ecosistema Hugging Face Transformers por el usuario wangyue114514. El checkpoint original procede del repositorio oficial de BlinkDL y representa una de las variantes de tamaño medio (2.947.735.040 parámetros) de la colección G1, que abarca modelos desde 0.1B hasta 13.3B. Su relevancia radica en que combina las ventajas de las RNN (inferencia en tiempo lineal y espacio constante, sin caché KV) con la paralelización propia de los Transformers durante el entrenamiento.

La arquitectura RWKV-7 elimina por completo el mecanismo de atención, lo que permite longitudes de contexto teóricamente infinitas con un coste computacional constante por token generado. Este modelo concreto se entrenó con una ventana de contexto de 8.192 tokens, aunque la arquitectura subyacente soporta extrapolación a secuencias más largas. Se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en aplicaciones de producción.

La conversión a Transformers utiliza un diseño de repositorio "fino" (thin layout): los pesos, la configuración y los assets del tokenizador se almacenan directamente, mientras que la implementación del modelo y los operadores optimizados se instalan desde el paquete Python `rwkv7-hf`. Este enfoque evita duplicar código en cada repositorio de modelos y garantiza que todas las variantes de la colección compartan una implementación mantenida de forma centralizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 recurrente causal (sin atención) |
| Parametros totales | 2.947.735.040 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenamiento); extensible por diseño |
| Tipos de cuantizacion | No especificados; pesos almacenados en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (13 shards + index) |

## Arquitectura y entrenamiento

RWKV-7 G1G 2.9B pertenece a la séptima generación de la familia RWKV, un modelo puramente recurrente que prescinde por completo del mecanismo de atención. En lugar de ello, utiliza un mecanismo de mezcla lineal con estados ocultos recurrentes, lo que proporciona complejidad temporal lineal durante la generación y uso de memoria constante, independientemente de la longitud de la secuencia. Esta arquitectura permite entrenamiento paralelo similar al de los Transformers, combinando lo mejor de ambos paradigmas.

El checkpoint `rwkv7-g1g-2.9b-20260526-ctx8192.pth` se entrenó con una ventana de contexto de 8.192 tokens. La configuración del modelo incluye 32 capas, tamaño oculto de 2.560 y vocabulario de 65.536 tokens. Los detalles específicos sobre el dataset de entrenamiento, el número total de tokens procesados y las técnicas de alineación (RLHF, DPO, etc.) no se han publicado en la información disponible. El modelo se describe como parte de los "reasoning models" de RWKV-7 "Goose", lo que sugiere capacidades mejoradas de razonamiento, aunque no se especifica el método de entrenamiento empleado para ello.

La conversión a Hugging Face utiliza un adaptador remoto (`rwkv7_hf_adapter`) que se carga mediante `trust_remote_code=True`. La implementación real proviene del paquete `rwkv7-hf==0.7.0`, instalado desde PyPI, que incluye los operadores optimizados necesarios para una ejecución eficiente.

## Capacidades

- Generación de texto causal con inferencia recurrente en tiempo lineal y memoria constante.
- Razonamiento multi-step, dado que el checkpoint pertenece a la familia "Goose" de modelos de razonamiento.
- Capacidad de procesar secuencias largas sin caché KV, lo que reduce drásticamente el consumo de memoria en generación prolongada.
- Soporte nativo para Hugging Face Transformers mediante el adaptador `rwkv7-hf`, incluyendo `AutoModelForCausalLM` y `AutoTokenizer`.
- Tokenizador con vocabulario de 65.536 entradas, compatible con el ecosistema Transformers.
- Arquitectura 100% libre de atención, lo que elimina los cuellos de botella de memoria asociados a las matrices de atención en secuencias largas.
- No se ha confirmado soporte para tool calling, function calling ni capacidades multimodales en la información disponible.

## Casos de uso

- Despliegue en entornos con recursos limitados: gracias a su memoria constante durante la generación, este modelo puede ejecutarse en GPUs de gama media o incluso en CPU para tareas de generación de texto de longitud moderada, sin degradación por crecimiento de la caché KV.
- Generación de texto de larga duración: en aplicaciones como escritura asistida, resúmenes extensos o diálogos multi-turno, la ausencia de caché KV permite mantener una huella de memoria estable durante toda la conversación.
- Aplicaciones edge y embebidas: la arquitectura recurrente es especialmente adecuada para dispositivos con memoria limitada, donde un Transformer equivalente consumiría mucha más VRAM en secuencias largas.
- Investigación en arquitecturas recurrentes: como implementación de referencia de RWKV-7 en Hugging Face, sirve para estudiar el comportamiento de modelos sin atención y comparar su rendimiento con Transformers tradicionales.
- Fine-tuning y adaptación a dominios específicos: al ser Apache-2.0 y estar disponible en formato Transformers, puede ajustarse con datasets propios para tareas como clasificación de texto, extracción de información o generación estructurada.
- Prototipado rápido con Transformers: los desarrolladores pueden integrarlo en pipelines existentes usando `AutoModelForCausalLM`, sin necesidad de código específico de RWKV, gracias al adaptador remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint concreto. La ausencia de métricas publicadas impide realizar una comparación cuantitativa con modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo almacena los pesos en FP16, lo que supone aproximadamente 5,9 GB solo para los pesos. Con activaciones y overhead del runtime, se recomienda al menos 8-10 GB de VRAM para inferencia cómoda.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 (cualquier GPU con 10 GB o más de VRAM). Para CPU, es viable con 16 GB de RAM, aunque la velocidad será significativamente menor.
- Consumer GPU: sí, cabe en GPUs de consumo como RTX 3080/3090/4090 con cuantización FP16. No se han documentado cuantizaciones de menor precisión (INT8, INT4) para este checkpoint.
- Opciones de despliegue: Hugging Face Transformers con el adaptador `rwkv7-hf` es la vía principal. Dado que es un modelo recurrente sin atención, las opciones de despliegue específicas para Transformers (vLLM, TGI) pueden no ser directamente aplicables sin adaptación. La inferencia en CPU es viable gracias a la arquitectura recurrente.
- Latencia y throughput: no se han publicado datos concretos. La arquitectura recurrente ofrece latencia constante por token, independientemente de la longitud de la secuencia, lo que supone una ventaja frente a Transformers en generación larga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RWKV-7 G1G 2.9B | 2,95B | 8.192 | Recurrente sin atención | Apache-2.0 | Hugging Face |
| Qwen2.5-3B | 3,09B | 32.768 | Transformer con atención | Apache-2.0 | Hugging Face |
| Gemma-2-2.6B | 2,6B | 8.192 | Transformer con atención | Gemma license | Hugging Face |
| Phi-3-mini | 3,8B | 4.096 | Transformer con atención | MIT | Hugging Face |

La comparativa se centra en modelos de tamaño similar (2,5-3,8B). La diferencia fundamental de RWKV-7 es su arquitectura recurrente, que ofrece memoria constante durante la generación, mientras que los Transformers requieren una caché KV que crece linealmente con la longitud de la secuencia. Esto hace que RWKV-7 sea más eficiente en memoria para generación larga, aunque los Transformers suelen ofrecer mejor rendimiento por parámetro en tareas estándar. No se dispone de benchmarks comparativos publicados para verificar esta hipótesis en este checkpoint concreto.

## Limitaciones y advertencias

- La ventana de contexto de entrenamiento es de 8.192 tokens, inferior a la de muchos modelos modernos (32K o más). Aunque la arquitectura RWKV soporta extrapolación, no se garantiza un rendimiento óptimo más allá de la longitud de entrenamiento.
- La implementación depende del paquete Python `rwkv7-hf==0.7.0`, que debe instalarse por separado. Esto añade una dependencia externa que debe gestionarse en entornos de producción.
- No se han publicado resultados de benchmarks, lo que impide evaluar objetivamente su rendimiento frente a alternativas de tamaño similar.
- Los idiomas soportados no están documentados, lo que supone una incertidumbre para aplicaciones multilingües.
- El modelo es una conversión de un checkpoint original; no se han publicado detalles sobre el dataset de entrenamiento, lo que limita la evaluación de sesgos y alucinaciones potenciales.
- Al ser un modelo de razonamiento ("Goose"), puede generar respuestas más largas y elaboradas, lo que podría aumentar la latencia percibida en aplicaciones interactivas.
- La cuantización de menor precisión (INT8, INT4) no está documentada, lo que limita las opciones de despliegue en hardware muy restringido.
- El autor del repositorio Hugging Face (wangyue114514) no es el desarrollador original del modelo (BlinkDL); se recomienda verificar la procedencia de los pesos antes de usarlo en entornos sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wangyue114514/rwkv7-g1g-2.9b-hf
- Colección RWKV7-G1 Transformers: https://huggingface.co/collections/wangyue114514/rwkv7-g1-transformers-6a85b04191034d4c2d1896f1
- Checkpoint original: https://huggingface.co/BlinkDL/rwkv7-g1/blob/41251fab280e3fba70a3fc49e843f3a034d49d33/rwkv7-g1g-2.9b-20260526-ctx8192.pth
- Repositorio original del modelo: https://huggingface.co/BlinkDL/rwkv7-g1
- Paquete PyPI: https://pypi.org/project/rwkv7-hf/0.7.0/
- Adaptador GitHub: https://github.com/rwkv-rs/hf-adapter
- Repositorio RWKV-LM: https://github.com/BlinkDL/RWKV-LM
- Sitio web oficial RWKV: https://www.rwkv.com/
