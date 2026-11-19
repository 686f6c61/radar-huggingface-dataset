# tencent/Hy-Memory-30B-A3B-GGUF

## Resumen

Hy-Memory-30B-A3B-GGUF es la distribucion en formato GGUF del modelo Hy-Memory-30B-A3B desarrollado por Tencent Hunyuan. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 30.064.725.888 parametros totales, disenado especificamente para tareas de memoria conversacional y gestion de contexto a largo plazo, como indica su nombre y su evaluacion sobre el benchmark Mem0 LoCoMo. Esta version GGUF esta pensada para inferencia local eficiente mediante llama.cpp.

El repositorio incluye seis cuantizaciones con una receta propia de Tencent Hunyuan que combina calibracion con importance matrix (imatrix) y precision mixta consciente de la estructura MoE: los expertos enrutados se comprimen de forma agresiva mientras que los expertos compartidos, las proyecciones de atencion y las capas de embedding/salida mantienen mayor precision. El resultado mas destacable es una build de aproximadamente 8 GB que conserva una puntuacion de 57,25% en LoCoMo, apenas 1,5 puntos por debajo de la mejor variante Q6_K (58,78%).

El modelo soporta ingles y chino, se distribuye bajo licencia Apache 2.0 y esta etiquetado como compatible con endpoints. Su relevancia actual radica en que demuestra que es posible ejecutar un modelo MoE de 30B en hardware de consumo con perdida de calidad muy contenida, gracias a una asignacion de bits no uniforme entre componentes del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer; detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | 30.064.725.888 (30B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K imatrix, Q8_0, Q3_K_M imatrix, Q4_K_M imatrix, Q8_0-expsIQ1_M, Q8_0-expsIQ2_XXS |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible confirma que Hy-Memory-30B-A3B es un modelo Mixture-of-Experts con 30B parametros totales y expertos enrutados y compartidos diferenciados. La receta de cuantizacion revela la estructura interna: cada archivo de precision mixta contiene 141 tensores de expertos enrutados, 338 tensores matriciales adicionales y 287 tensores mantenidos en F32 (router, normas y otros tensores pequenos de punto flotante). Esto indica la presencia de un router de seleccion de expertos, expertos compartidos y proyecciones de atencion separadas.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo esta orientado a tareas conversacionales y de memoria, y su evaluacion principal se realiza sobre el setup Mem0 LoCoMo, lo que sugiere un entrenamiento o ajuste especifico para gestion de memoria en dialogos multi-turno. Existe un informe tecnico en arXiv (2610.22196) que presumiblemente detalla la arquitectura y el entrenamiento, pero su contenido no se incluye en los datos facilitados.

La innovacion tecnica destacable de esta distribucion es la receta de cuantizacion: calibracion imatrix para controlar el error de cuantizacion y asignacion de precision mixta que trata de forma diferenciada los expertos enrutados (compresibles a IQ1_M o IQ2_XXS) frente al resto de componentes (mantenidos en Q8_0 o F32).

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Gestion de memoria a largo plazo en dialogos multi-turno, evaluada sobre el benchmark Mem0 LoCoMo.
- Razonamiento multi-paso orientado a tareas de memoria y recuperacion de informacion contextual.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Inferencia local eficiente mediante llama.cpp.
- No se confirma en la informacion proporcionada soporte de tool calling, function calling, vision, audio ni modo thinking explicito.

## Casos de uso

- Asistentes conversacionales con memoria persistente: el modelo esta disenado y evaluado para mantener y recuperar informacion a lo largo de conversaciones multi-turno, lo que lo hace adecuado para agentes de atencion al cliente que necesitan recordar el historial del usuario entre sesiones.
- Despliegue local en estaciones de trabajo: la build Q8_0-expsIQ1_M de ~8 GB permite ejecutar un modelo MoE de 30B en equipos con GPU de consumo, habilitando asistentes privados sin dependencia de la nube.
- Prototipado de sistemas de memoria para agentes: integrable en pipelines que usan Mem0 u otros frameworks de memoria, ya que el modelo ha sido validado sobre ese setup concreto.
- Aplicaciones multilingues ingles-chino: util para productos dirigidos a mercados angloparlantes y sinofonos que requieran un unico modelo para ambos idiomas.
- Investigacion en cuantizacion de MoE: el repositorio sirve como referencia reproducible de asignacion de precision mixta por tipo de tensor, con seis variantes evaluadas sobre el mismo benchmark.
- Servicios de inferencia con llama.cpp: la integracion con llama.cpp y la compatibilidad con endpoints permiten montar servidores de generacion de texto autoalojados con requisitos de VRAM ajustables segun la cuantizacion elegida.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible corresponden al benchmark Mem0 LoCoMo (juez automatico, 262 casos, ejecucion unica):

| Cuantizacion | Tamano | LoCoMo Judge |
|---|---:|---:|
| Q6_K imatrix | 24,71 GB | 58,78% (154/262) |
| Q8_0 | 31,99 GB | 57,63% (151/262) |
| Q3_K_M imatrix | 14,45 GB | 57,25% (150/262) |
| Q8_0-expsIQ1_M | 8,03 GB | 57,25% (150/262) |
| Q4_K_M imatrix | 18,24 GB | 56,49% (148/262) |
| Q8_0-expsIQ2_XXS | 9,14 GB | 55,73% (146/262) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. La build mas pequena (Q8_0-expsIQ1_M, 8,03 GB en disco) requiere aproximadamente 8 GB mas KV cache y overhead del framework; la Q6_K (24,71 GB) requiere del orden de 25-27 GB.
- GPU recomendadas: para las builds de ~8-9 GB, GPUs de consumo como RTX 3060 12 GB, RTX 4070 o superiores; para Q4_K_M y Q3_K_M, RTX 4090 (24 GB) o A100/H100; para Q6_K y Q8_0, A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, al menos las variantes Q8_0-expsIQ1_M (~8 GB) y Q8_0-expsIQ2_XXS (~9,14 GB) en tarjetas con 12 GB o mas.
- Opciones de despliegue: llama.cpp (formato nativo), servidores compatibles con endpoints; no se confirma soporte de vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo es MoE, por lo que el coste computacional por token deberia ser inferior al de un denso de 30B, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables de la misma categoria (MoE de ~30B orientados a memoria conversacional). La comparativa cuantitativa con alternativas como Mixtral, Qwen MoE u otros no puede realizarse sin inventar cifras.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy-Memory-30B-A3B | 30B (MoE) | no disponible | Apache 2.0 | Hugging Face (GGUF y safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan tasas de error medidas.
- Las puntuaciones de LoCoMo son de ejecucion unica y los propios autores advierten que no garantizan cuantizacion sin perdida ni que las variantes de menor bit superen siempre a las de mayor bit.
- Los archivos GGUF ultra-bajos de la comunidad (Q1/Q2) pueden cargar correctamente pero fallar en la escritura de memoria, produciendo texto corrupto, repeticiones infinitas o JSON invalido; no deben usarse en produccion sin validacion.
- El tamano en disco no equivale a la VRAM en tiempo de ejecucion: hay que sumar KV cache y overhead del framework.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del informe tecnico.
- No se confirma soporte de tool calling ni de agentes complejos, por lo que su uso en pipelines de automatizacion debe validarse empiricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tencent/Hy-Memory-30B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-Memory
- Informe tecnico (arXiv): https://arxiv.org/pdf/2610.22196
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de Tencent: https://www.tencent.com/
