# velaia/Kolibri-1-MLX-4bit

## Resumen

Kolibri-1-MLX-4bit es una conversion no oficial a formato MLX del modelo Aleph-Alpha/Kolibri-1, desarrollado originalmente por Aleph Alpha GmbH. El autor de esta conversion es el usuario velaia, que no tiene vinculacion con Aleph Alpha. El modelo base es un transformer de tipo mixture of experts (MoE) orientado a razonamiento, y esta version lo adapta para su ejecucion en Apple Silicon mediante la libreria MLX, algo que el repositorio original no ofrece de forma nativa.

El problema que resuelve es la falta de soporte para Apple Silicon del modelo original, publicado en FP8 (e4m3 con escalado por bloques de 128x128). Esta conversion desquantiza esos pesos y los recuantiza a cuantizacion afin de MLX con tamano de grupo 64, reduciendo el peso total del repositorio a 44,3 GB y permitiendo su ejecucion en Macs de 64 GB o mas. El modelo cuenta con aproximadamente 78.100 millones de parametros totales.

La relevancia actual reside en que permite ejecutar un modelo MoE de razonamiento de gran tamano en hardware de consumo de gama alta (Apple Silicon), con una velocidad de generacion de unas 52 a 56 tokens por segundo en un M1 Max. El modelo soporta un parametro `reasoning_effort` con cuatro niveles y funciona en aleman e ingles. No se trata de un modelo nuevo, sino de una version cuantizada y portada del modelo original de Aleph Alpha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) tipo transformer, arquitectura `kolibri1` |
| Parametros totales | 78.103.055.360 (aproximadamente 78,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion afin de MLX, group size 64; precision mixta: expertos enrutados y attention/experto compartido en 4-bit, embeddings y LM head en 8-bit, router MoE sin cuantizar; 4,54 bits por peso; variantes de 3-bit (3,57 bpw) y 2-bit (2,61 bpw) |
| Idiomas soportados | aleman (de) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture of experts con expertos enrutados y un experto compartido, segun la arquitectura `kolibri1` portada desde el plugin vLLM de Aleph Alpha. Esta conversion concreta no ha reentrenado el modelo: parte de los pesos originales en FP8 (e4m3, con escalado por bloques de 128x128) del repositorio Aleph-Alpha/Kolibri-1 (commit `e52eb4627d11516b0c01de49210ab5a4e4061444`), los desquantiza y los recuantiza a cuantizacion afin de MLX con group size 64. El script de conversion (`convert.py`) aplica un predicado de precision mixta: los expertos enrutados usan el ancho de bits configurado (4 bits en este repositorio), attention y el experto compartido usan 4 bits, embeddings y LM head usan 8 bits, y el router MoE queda sin cuantizar.

Al tratarse de una recuantizacion, la calidad difiere de la del modelo original y la degradacion crece a medida que baja el numero de bits. El autor reporta un error cuadratico medio (RMSE) relativo de reconstruccion de pesos frente a los pesos FP8 desquantizados de aproximadamente 0,10 para los expertos enrutados en 4 bits (frente a 0,194 en 3 bits y 0,400 en 2 bits) y de 0,098 para attention y el experto compartido. La conversion se realizo con mlx 0.32.3 y mlx-lm 0.32.0 sobre un Apple M1 Max de 64 GB. El modelo incluye un modo de razonamiento controlado por el parametro `reasoning_effort` (`none`, `low`, `medium`, `high`); si no se especifica, la plantilla de chat usa `high` por defecto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Razonamiento explicito con nivel de esfuerzo configurable (`none`, `low`, `medium`, `high`), lo que permite ajustar la cantidad de "pensamiento" del modelo segun la tarea.
- Capacidad de razonamiento multi-paso inherente al modo de razonamiento extendido.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- Servidor compatible con la API de OpenAI (`/v1`) para integracion en aplicaciones existentes.
- Soporte de plantilla de chat con system prompt y `chat_template_kwargs` por peticion.
- No se ha documentado soporte de tool calling, function calling, vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Razonamiento asistido en local sobre hardware Apple: un desarrollador puede ejecutar un modelo de 78.000 millones de parametros en un Mac de 64 GB para tareas de analisis y resolución de problemas sin depender de la nube, gracias a la conversion MLX de 4 bits.
- Asistente conversacional en aleman e ingles: el modelo esta entrenado especificamente para estos dos idiomas, por lo que resulta adecuado para atencion al cliente o asistentes internos en organizaciones germanoparlantes.
- Generacion de documentacion tecnica bilingue: la combinacion de razonamiento configurable y soporte de aleman e ingles permite redactar y revisar documentacion tecnica en ambos idiomas.
- Servicio de inferencia local mediante API compatible con OpenAI: el script `run.py server` levanta un endpoint en `http://localhost:8080/v1`, lo que permite sustituir una API remota por un backend local en aplicaciones que ya usan el SDK de OpenAI.
- Experimentacion e investigacion en cuantizacion: el repositorio documenta RMSE de reconstruccion y perplejidad por variante, lo que lo convierte en un caso de estudio util para medir el impacto de la cuantizacion en modelos MoE grandes.
- Prototipado de agentes de razonamiento: el control de `reasoning_effort` permite equilibrar coste computacional y profundidad de razonamiento segun el paso del flujo de trabajo.
- Comparacion de variantes de precision: gracias a los modos 2-bit, 3-bit y 4-bit con `--temp 0`, se pueden realizar comparaciones deterministas entre niveles de cuantizacion en un mismo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si aporta datos de perplejidad sobre una muestra reducida (los primeros 4.096 tokens de los articulos de Wikipedia en aleman sobre "Kolibris" y en ingles sobre "Hummingbird"), que se recogen a continuacion de forma orientativa:

| Variante | Bits/peso | Tamano | Memoria pico (corta / prompt 4k) | Perplejidad DE / EN |
|---|---|---|---|---|
| 4-bit (este repositorio) | 4,54 | 41 GiB | 44 / 48 GB | 12,77 / 16,47 |
| 3-bit | 3,57 | 33 GiB | 35 / 39 GB | 13,17 / 16,31 |
| 2-bit | 2,61 | 24 GiB | 26 / 30 GB | 14,01 / 17,46 |

El autor advierte que la muestra es pequena y solo orientativa. La velocidad de generacion reportada es de aproximadamente 52 a 56 tokens por segundo en un M1 Max para las tres variantes. El RMSE relativo de reconstruccion de pesos frente a los pesos FP8 desquantizados es de 0,194 (3-bit), 0,400 (2-bit) y aproximadamente 0,10 (4-bit) para los expertos enrutados, y de 0,098 para attention y el experto compartido.

## Requisitos de hardware

- Variante 4-bit (este repositorio): 41 GiB de pesos; memoria pico de 44 GB en contextos cortos y 48 GB con un prompt de 4.096 tokens. Requiere Macs de 64 GB o mas.
- Variante 3-bit: 33 GiB de pesos; 35/39 GB de memoria pico. Requiere Macs de 48 GB o mas. En un Mac de 48 GB hay que elevar el limite de memoria de GPU con `sudo sysctl -w iogpu.wired_limit_mb=40960` (se reinicia al apagar).
- Variante 2-bit: 24 GiB de pesos; 26/30 GB de memoria pico. Requiere Macs de 36 GB o mas.
- Hardware de referencia: Apple M1 Max de 64 GB, con rendimiento de aproximadamente 52 a 56 tok/s en las tres variantes.
- Plataforma: exclusivamente Apple Silicon mediante MLX; no se ha documentado soporte para GPUs NVIDIA o AMD en esta conversion.
- Opciones de despliegue: mlx-lm (a traves del lanzador `run.py` con los subcomandos `generate`, `chat` y `server`), servidor compatible con OpenAI en `http://localhost:8080/v1`, y uso directo desde Python con `mlx_lm.load` y `generate`.
- No se deben cargar dos modelos grandes de forma simultanea.
- No se dispone de datos de latencia detallados mas alla del throughput reportado.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano de pesos | Memoria pico (4k) | Perplejidad DE / EN | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kolibri-1 MLX 4-bit | 78,1 mil millones | 41 GiB | 48 GB | 12,77 / 16,47 | Apache 2.0 | HuggingFace (velaia) |
| Kolibri-1 MLX 3-bit | 78,1 mil millones (mismo base) | 33 GiB | 39 GB | 13,17 / 16,31 | Apache 2.0 | HuggingFace (velaia) |
| Kolibri-1 MLX 2-bit | 78,1 mil millones (mismo base) | 24 GiB | 30 GB | 14,01 / 17,46 | Apache 2.0 | HuggingFace (velaia) |
| Aleph-Alpha/Kolibri-1 (original, FP8) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace (Aleph-Alpha) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion no oficial: no esta afiliada ni respaldada por Aleph Alpha, y puede diferir en calidad respecto al modelo original.
- La recuantizacion introduce degradacion. Segun el autor, la diferencia de calidad frente al original crece a medida que baja el numero de bits, y el RMSE de reconstruccion en 2 bits (0,400) es notablemente superior al de 4 bits (~0,10).
- Solo soporta aleman e ingles; no se ha documentado soporte de otros idiomas, incluido el castellano.
- Los datos de perplejidad se basan en una muestra muy pequena (4.096 tokens por idioma), por lo que no deben tomarse como una evaluacion robusta.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- El modo de razonamiento por defecto es `high`, lo que consume mas tokens y tiempo; en el subcomando `chat` no se puede cambiar el nivel de esfuerzo, solo en `generate` y en el servidor.
- La licencia Apache 2.0 se aplica unicamente a los pesos y ficheros de configuracion; Aleph Alpha conserva todos los derechos sobre su codigo, arquitectura y metodos de entrenamiento.
- Uso restringido segun la model card original: prohibido el uso ilicito, las practicas prohibidas por el articulo 5 del Reglamento europeo de IA y las aplicaciones militares o nucleares.
- Exclusivamente para Apple Silicon; no apto para GPUs NVIDIA o AMD en este formato.
- El autor advierte de que no se deben cargar dos modelos grandes simultaneamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/velaia/Kolibri-1-MLX-4bit
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Plugin vLLM de Aleph Alpha: https://github.com/Aleph-Alpha/aleph-alpha-inference
