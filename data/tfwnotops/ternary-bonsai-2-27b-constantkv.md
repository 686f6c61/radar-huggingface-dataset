# tfwnotops/Ternary-Bonsai-2-27B-ConstantKV

## Resumen

Ternary-Bonsai-2-27B-ConstantKV es un modelo de lenguaje de 27.359.638.768 parametros derivado de Qwen3.8-27B, un transformer hibrido con atencion causal, publicado por el usuario tfwnotops sobre los pesos ternarios del pack de Prism ML. Su rasgo diferencial no es el entrenamiento, sino el estado de atencion: las 16 capas de atencion completa mantienen una huella de memoria constante de 75,75 MiB por capa (1,18 GiB en total) independientemente de la longitud del contexto, frente a los 3,2 GB a 32k, 6,3 GB a 64k y 12,4 GB a 128k tokens que ocupa la cache KV nativa de los mismos pesos.

El modelo resuelve el problema del coste creciente de la cache KV en contextos largos mediante un esquema denominado ConstantKV: una banda exacta con los ultimos 1.024 tokens, un carrier cristalizado sobre todos los tokens lejanos y un almacen exacto de 8.192 claves y valores por cabeza key-value, admitidos segun el pico de atencion que cada token recibe mientras permanece en la banda. Segun la model card, el coste adicional de este estado es de +0,0084 nat por token sobre ocho libros no vistos a 32k tokens, y recupera 40 de 40 claves de paso en pruebas de 10 profundidades entre 4k y 32k.

Es relevante ahora porque demuestra inferencia de contexto largo en hardware de consumo: el modelo completo corre a 32k tokens en un Mac mini M4 con 16 GB de memoria unificada, con un pico de 12,2 GB y una latencia de 155-157 ms por token estable entre 4k, 16k y 32k tokens. Los pesos y las cabezas cristalizadas son byte-identicos a Ternary-Bonsai-2-27B-Crystal; lo que cambia es exclusivamente la gestion del estado de atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion causal (derivado de Qwen3.8-27B), pesos ternarios y atencion ConstantKV |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 262.000 tokens (262K) segun la documentacion de Prism ML para la familia Bonsai 2 27B; la model card de este repositorio valida 32k en pruebas |
| Tipos de cuantizacion | Pesos ternarios {-1, 0, +1} en base rotada fija con escala FP16 por grupo de 128 pesos; formato de empaquetado de Prism ML |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer hibrido de atencion causal, con la arquitectura sin cambios respecto al original. Todos los pesos del modelo de lenguaje son ternarios: cada peso toma valores en {-1, 0, +1} dentro de una base rotada fija, acompanado de una escala FP16 por cada grupo de 128 pesos. El repositorio incluye 2.519 bindings de tensores sobre el grafo `.causal`. Los pesos proceden del pack de Prism ML y las cabezas cristalizadas son byte-identicas a las de Ternary-Bonsai-2-27B-Crystal, por lo que este modelo no introduce un reentrenamiento nuevo, sino un cambio en la representacion del estado de atencion.

La innovacion tecnica es el esquema ConstantKV, descrito en el paper "Scarcity as Method — Attention, Replaced: Exact Forms, Constant State, and Reusable Inference". Cada una de las 16 capas de atencion completa mantiene desde el primer token 75,75 MiB compuestos por tres elementos: una banda exacta de los ultimos 1.024 tokens (16,0 MiB por capa), un carrier cristalizado que representa todos los tokens lejanos y un almacen exacto de 8.192 claves y valores por cabeza key-value, admitidos segun el pico de atencion que cada token recibe mientras aun esta en la banda. El resultado es un estado de atencion que no crece con el contexto. Dos implementaciones independientes del almacen (PyTorch y el runtime MLX de este repositorio) coinciden con una tolerancia de ±0,0004 nat en todos los libros evaluados. El modelo tambien permite leer de un mapa respuestas ya dadas anteriormente en 0,04-0,06 ms, en lugar de recomputarlas.

## Capacidades

- Generacion de texto conversacional y continuacion de texto con contexto largo (validado a 32k tokens; la familia declara hasta 262K).
- Procesamiento de imagenes ademas de texto, segun la documentacion de Prism ML para la familia Bonsai 2 27B.
- Tool calling y function calling, segun la documentacion de Prism ML.
- Razonamiento multi-paso y uso como agente, derivado de las capacidades de la familia base.
- Recuperacion exacta de informacion en contextos largos: 40 de 40 claves de paso recuperadas en pruebas de 10 profundidades entre 4k y 32k tokens.
- Completado de codigo a nivel de proyecto: 0,442 lineas exactas en 40 items a 32k tokens.
- Replay de respuestas ya calculadas mediante lectura del mapa en 0,04-0,06 ms.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de documentos largos en hardware de consumo: con 1,18 GiB de estado de atencion constante, un Mac mini M4 de 16 GB puede procesar libros completos o expedientes de 32k tokens con un pico de 12,2 GB, sin degradacion de memoria al crecer el contexto.
- Procesamiento por lotes de corpus extensos: al no crecer la cache KV, se pueden encadenar peticiones de 32k, 64k o 128k tokens con la misma huella de memoria (1,18 GiB), lo que simplifica el dimensionado de servidores y evita el reajuste de memoria por peticion.
- Asistentes conversacionales de sesion larga: la banda exacta de los ultimos 1.024 tokens preserva el contexto inmediato con precision, mientras el carrier y el almacen cubren el historial lejano, adecuado para dialogos multi-turno prolongados.
- Completado de codigo a nivel de proyecto: con 0,442 lineas exactas en 40 items a 32k tokens, es utilizable en entornos de edicion que necesitan referenciar archivos completos del repositorio.
- Recuperacion de claves en documentos extensos: la capacidad de recuperar 40 de 40 claves de paso a profundidades de 4k a 32k lo hace apto para tareas de extraccion de datos concretos en contratos, informes o articulos largos.
- Cache de respuestas en produccion: el mecanismo de lectura del mapa en 0,04-0,06 ms permite servir respuestas ya calculadas sin recomputar, util en sistemas con consultas repetidas.
- Inferencia local en Apple Silicon: la integracion con MLX y la latencia estable de 155-157 ms por token entre 4k y 32k lo hacen viable para prototipos y despliegues locales en equipos de 16 GB.

## Benchmarks y rendimiento

Los datos publicados en la model card son medidas de coste en nat por token y de recuperacion, no benchmarks estandar de MMLU o HumanEval.

| Metrica | Original (cache KV nativa) | Crystal (indice) | ConstantKV (almacen exacto) |
|---|---:|---:|---:|
| Memoria de atencion a 32k tokens | 3,2 GB | 2,0 GB | 1,18 GiB |
| Memoria de atencion a 64k tokens | 6,3 GB | 3,5 GB | 1,18 GiB |
| Memoria de atencion a 128k tokens | 12,4 GB | crece | 1,18 GiB |
| Coste en ocho libros no vistos, 32k (nat/token) | referencia | +0,0045 | +0,0084 |
| Claves de paso recuperadas (10 profundidades, 4k-32k) | 40/40 | 40/40 | 40/40 |
| Lineas exactas en completado de codigo (40 items, 32k) | 0,473 | 0,474 | 0,442 |
| Mac mini M4 16 GB a 32k tokens | no ejecuta | no ejecuta | ejecuta, pico 12,2 GB, 157 ms/token |

Coste por libro no visto a 32k tokens (nat/token), comparando las dos implementaciones del almacen:

| Libro | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| PyTorch | +0,0069 | +0,0097 | +0,0145 | +0,0091 | +0,0063 | +0,0077 | +0,0065 | +0,0064 |
| Runtime MLX | +0,0067 | +0,0099 | +0,0146 | +0,0093 | +0,0059 | +0,0080 | +0,0064 | +0,0063 |

Los pesos ternarios suponen un coste de 0,28 nat por token frente a bf16 Qwen3.8-27B; el estado constante anade un treinta y tresavo de esa cifra. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el modelo completo corre con un pico de 12,2 GB en un Mac mini M4 de 16 GB a 32k tokens.
- Estado de atencion: 1,18 GiB constantes para las 16 capas de atencion completa, a cualquier longitud de contexto.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB de memoria unificada; no hay datos publicados para GPUs NVIDIA de consumo.
- GPU recomendadas: no disponible para CUDA; el runtime publicado es MLX (Apple Silicon).
- Opciones de despliegue: runtime MLX de este repositorio; el proyecto mrail (github.com/DT-Foss/mrail). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia: 155-157 ms por token, estable a 4k, 16k y 32k tokens en Mac mini M4 de 16 GB.
- Throughput: no disponible.
- Replay de respuestas cacheadas: 0,04-0,06 ms por lectura del mapa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria de atencion a 32k | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Ternary-Bonsai-2-27B-ConstantKV | 27,36B | 262K declarado; 32k validado | 1,18 GiB constante | Apache 2.0 | Hugging Face, runtime MLX |
| Ternary-Bonsai-2-27B-Crystal | 27,36B (byte-identicos) | 262K declarado | 2,0 GB | Apache 2.0 | Hugging Face |
| Ternary Bonsai 2 27B (original) | 27,36B (mismos pesos) | 262K | 3,2 GB | Apache 2.0 | Hugging Face, docs.prismml.com |

La comparacion con modelos de otra familia no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El coste de +0,0084 nat por token sobre libros no vistos a 32k tokens implica una degradacion medible frente a la cache KV nativa (referencia) y frente a Crystal (+0,0045), aunque recupera las 40 de 40 claves de paso.
- En completado de codigo a nivel de proyecto, las lineas exactas bajan a 0,442 frente a 0,473 del original y 0,474 de Crystal, lo que supone una perdida de precision en esa tarea.
- La validacion publicada se limita a 32k tokens; el soporte declarado de 262K no aparece verificado con mediciones en la model card.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones multilingues; los idiomas soportados figuran como no disponibles.
- El runtime publicado es MLX para Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp u otros motores, lo que limita el despliegue en infraestructura NVIDIA.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.8-27B y de los pesos de Prism ML; conviene verificar las condiciones de esos componentes antes de un despliegue en produccion.
- El repositorio ocupa 8,7 GB y esta empaquetado en safetensors con pesos ternarios, lo que exige un runtime compatible con el formato de Prism ML.
- El autor es un usuario individual (tfwnotops) y el modelo se apoya en papers con DOI de ResearchGate; no hay evidencia de validacion independiente mas alla de la comparacion interna entre las implementaciones PyTorch y MLX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tfwnotops/Ternary-Bonsai-2-27B-ConstantKV
- Modelo predecesor (Crystal): https://huggingface.co/tfwnotops/Ternary-Bonsai-2-27B-Crystal
- Paper "Scarcity as Method — Attention, Replaced: Exact Forms, Constant State, and Reusable Inference": https://doi.org/10.13140/RG.2.2.34347.40489
- Paper "Crystallized Attention": https://doi.org/10.13140/RG.2.2.21299.18725
- Paper "Compute Once": https://doi.org/10.13140/RG.2.2.18140.35202
- Repositorio mrail: https://github.com/DT-Foss/mrail
- Documentacion de Prism ML para Bonsai 2 27B: https://docs.prismml.com/models/bonsai-2-27b
