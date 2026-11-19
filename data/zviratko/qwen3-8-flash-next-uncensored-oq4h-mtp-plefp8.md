# zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp-plefp8

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp-plefp8 es una cuantizacion de 4 bits en formato MLX del modelo zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp, un derivado sin censura (uncensored) de la familia Qwen, presumiblemente basada en la arquitectura Qwen3. El autor, zviratko, aplica una cuantizacion de precision mixta mediante la herramienta oQ (oMLX v0.8.0) e incorpora una innovacion poco habitual: el transplante de una tabla de embeddings n-gram en FP8 (denominada PLE, probablemente "Per-Layer Embedding" o similar), que constituye el grueso del peso del modelo.

El modelo combina varias piezas: un modelo de lenguaje de 22.852B parametros, una tabla de embeddings n-gram de 51.200B parametros, un encoder de vision de 0.449B y una cabeza MTP (Multi-Token Prediction) de 2.607B. En total, 77.109B parametros logicos que ocupan 126.765 GB en disco. Esta pensado para ejecucion en Apple Silicon mediante la libreria MLX, lo que lo hace relevante para desarrolladores que quieren correr modelos de gran tamano en hardware de Apple con memoria unificada.

La relevancia actual radica en su caracter experimental: combina cuantizacion de 4 bits, decodificacion especulativa via cabeza MTP, vision y una tabla n-gram FP8 en un unico artefacto optimizado para MLX. No obstante, la informacion publicada es muy escasa (0 descargas, 0 likes, sin licencia ni idiomas declarados), por lo que debe tratarse como un modelo de investigacion y no como una opcion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, variante "Qwen3.8-Flash-Next") con cabeza MTP y tabla de embeddings n-gram PLE; encoder de vision |
| Parametros totales | 77.108.737.939 (77.109B) |
| Parametros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits con precision mixta (oQ / oMLX v0.8.0); tabla PLE en FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento declarado por el autor:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 22.852B | 73.154 GB / 68.130 GiB |
| Embedding n-gram | 51.200B | 51.200 GB / 47.684 GiB |
| Vision | 0.449B | 0.898 GB / 0.836 GiB |
| Cabeza MTP | 2.607B | 1.513 GB / 1.409 GiB |
| **Total** | **77.109B** | **126.765 GB / 118.059 GiB** |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de lo que se deduce de los tags y del desglose de pesos. Se trata de un transformer de la familia Qwen (el tag `qwen4_exp` sugiere un linaje experimental Qwen4) con cuatro componentes diferenciados: un modelo de lenguaje principal de 22.852B parametros, una tabla de embeddings n-gram de 51.200B parametros almacenada en FP8 (el "PLE FP8 transplant" que da nombre al modelo), un encoder de vision de 0.449B y una cabeza MTP de 2.607B para prediccion multi-token.

La innovacion tecnica mas destacable es la tabla PLE (n-gram embedding) en FP8, que con 51.200B parametros supone el 66% de los parametros totales pero solo el 40% del almacenamiento gracias a su cuantizacion a 8 bits. La cabeza MTP habilita decodificacion especulativa (prediccion de varios tokens por paso), lo que puede mejorar el throughput. La cuantizacion se realizo con oQ (oMLX v0.8.0) en modo de precision mixta a 4 bits. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni si hubo RLHF/DPO. El calificativo "Uncensored" indica que el modelo base fue sometido a un proceso de eliminacion de alineamiento de seguridad, pero no se documenta el metodo.

## Capacidades

- Generacion de texto y razonamiento: modelo de lenguaje de 22.852B parametros con capacidad de generacion autoregresiva.
- Codigo y matematicas: presumiblemente heredadas del modelo base Qwen, aunque no se documentan explicitamente.
- Vision: incluye un encoder de vision de 0.449B parametros, lo que sugiere soporte de entrada de imagenes (multimodal).
- Decodificacion especulativa: la cabeza MTP de 2.607B permite prediccion multi-token y aceleracion de inferencia.
- Embeddings n-gram: la tabla PLE de 51.200B parametros actua como memoria asociativa de n-gramas, potencialmente mejorando la coherencia local y la recuperacion de patrones.
- Sin censura: el modelo base ha sido modificado para eliminar restricciones de seguridad, lo que amplia el rango de respuestas pero incrementa el riesgo de contenido inapropiado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre cuantizacion extrema: el modelo sirve como banco de pruebas para estudiar el impacto de la cuantizacion mixta a 4 bits y del transplante de tablas FP8 en la calidad de generacion, comparando con el modelo base sin cuantizar.
- Ejecucion local en Apple Silicon: con 126.765 GB de almacenamiento y formato MLX, esta disenado para correr en Macs con memoria unificada de gran capacidad (por ejemplo, Mac Studio con 192 GB o superiores), permitiendo inferencia local sin GPU dedicada.
- Experimentacion con decodificacion especulativa: la cabeza MTP permite medir la ganancia de throughput de la prediccion multi-token en MLX frente a decodificacion autoregresiva clasica.
- Analisis de modelos sin censura: util para estudiar el comportamiento de modelos "uncensored" en tareas de evaluacion de sesgos, seguridad y alineamiento, siempre en entornos controlados.
- Prototipado multimodal: el encoder de vision permite experimentar con tareas imagen-texto en local, aunque sin datos publicados sobre su calidad.
- Benchmarking de herramientas MLX: sirve para evaluar el rendimiento de oMLX v0.8.0 y del formato oQ frente a otras rutas de cuantizacion (GGUF, AWQ, GPTQ) en hardware Apple.
- Estudio de tablas n-gram como memoria: la PLE de 51.200B parametros permite investigar si las tablas de n-gramas mejoran la perplejidad en dominios especificos frente a modelos puramente neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 126.765 GB (118.059 GiB) en disco; la inferencia requiere cargar los pesos en memoria unificada, por lo que se necesita un equipo con al menos ~128 GB de memoria disponible (y margen adicional para el contexto y los estados intermedios).
- GPU recomendadas: al ser formato MLX, esta orientado a Apple Silicon (M-series). No se documenta soporte para CUDA (A100, H100, RTX 4090).
- Consumer GPU: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) por el tamano del modelo. Requiere Apple Silicon con memoria unificada de 128 GB o superior (Mac Studio M2/M3 Ultra con 192 GB, por ejemplo).
- Opciones de despliegue: libreria MLX (mlx-lm); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato y la tabla PLE personalizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp-plefp8 (este) | 77.109B (22.852B LM + 51.200B PLE) | No disponible | safetensors MLX 4-bit | No disponible | Cuantizacion oQ con PLE FP8 y MTP |
| zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp (base) | No disponible | No disponible | safetensors MLX | No disponible | Modelo base del que deriva; sin transplante PLE FP8 |
| Familia Qwen3 (modelos oficiales) | No disponible | No disponible | safetensors, GGUF | Apache 2.0 (tipicamente) | Modelos originales alineados; referencia de calidad |
| Llama 3.1 70B (referencia de tamano similar) | 70B | 128K | safetensors, GGUF | Llama 3.1 Community License | Alternativa densa de tamano comparable, con benchmarks publicados |

La comparativa es limitada porque no se dispone de datos de rendimiento del modelo ni de su base. Los modelos oficiales Qwen y Llama 3.1 70B se incluyen como referencias de categoria, no como equivalentes funcionales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de calidad multimodal, por lo que no se puede evaluar su rendimiento real.
- Modelo "uncensored": el alineamiento de seguridad ha sido eliminado, lo que implica riesgo elevado de generar contenido toxico, ilegal o danino. No apto para aplicaciones de cara al publico sin filtros adicionales.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido. No usar en produccion sin aclarar este punto.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que limita el diseno de aplicaciones que dependan de ventanas largas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, agravado por la falta de evaluacion publicada y por la cuantizacion a 4 bits, que puede degradar la fidelidad.
- Requisitos de hardware muy altos: 126.765 GB de almacenamiento y ~128 GB de memoria unificada lo excluyen de la mayoria de equipos; solo viable en Apple Silicon de gama alta.
- Ecosistema limitado: formato MLX y tabla PLE personalizada reducen la portabilidad a otras herramientas (vLLM, llama.cpp, TGI).
- Sin soporte comunitario: 0 descargas y 0 likes indican que no ha sido validado por terceros; posible presencia de errores no detectados.
- Fecha de creacion futura (2026-11-18): inconsistente con el calendario actual; conviene verificar la procedencia y autenticidad del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp-plefp8
- Modelo base: https://huggingface.co/zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen
