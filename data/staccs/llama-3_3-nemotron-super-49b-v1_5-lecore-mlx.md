# staccs/Llama-3_3-Nemotron-Super-49B-v1_5-lecore-mlx

## Resumen

Este repositorio es una cuantizacion mixta en formato MLX del modelo nvidia/Llama-3_3-Nemotron-Super-49B-v1_5, publicada por el usuario staccs. No se trata de un modelo entrenado desde cero, sino de una version comprimida del Nemotron Super 49B de NVIDIA, un transformer decoder-only denso de aproximadamente 49.867 millones de parametros (49,87B), derivado de Llama-3.3-70B-Instruct mediante tecnicas de busqueda de arquitectura (NAS) y post-entrenado para razonamiento, chat, RAG y tool calling, con una ventana de contexto de 128.000 tokens.

El problema que resuelve es el de ejecutar un modelo de ~50B en hardware de Apple Silicon con memoria unificada limitada: los pesos originales en bf16 ocuparian cerca de 100 GB, mientras que esta version los reduce a unos 19,49 GB mediante una receta de cuantizacion por tensor. La seleccion de bits por capa la realiza leCore Unicron `requantize`, que mide el dano (KL entre la distribucion fp16 y la cuantizada) de cada tensor lineal por separado y asigna bits de forma greedy para minimizar la perdida de calidad por byte ahorrado.

Su relevancia actual es doble: por un lado, demuestra una estrategia de cuantizacion mixta guiada por medicion (no una receta fija) aplicada a un modelo de razonamiento de gama alta; por otro, permite inferencia local en Macs de 36 GB o mas. El coste es una degradacion notable de perplejidad en texto general (de 13,02 a 37,35 en WikiText-2), que conviene valorar antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 3.3, con arquitectura optimizada via NAS (tag `nemotron-nas`) |
| Parametros totales | 49.867.145.216 (~49,87B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (segun el modelo base de NVIDIA) |
| Tipos de cuantizacion | MLX affine mixed-precision, group size 64; mezcla de 2/3/4/8 bits en tensores lineales (histograma: 149 capas a 2 bits, 226 a 3 bits, 59 a 4 bits, 2 a 8 bits); embeddings a 4 bits; lm_head a 6 bits; ~3,127 bpw |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License; adicionalmente aplica Llama 3.3 Community License Agreement (modelo derivado de Llama-3.3) |
| Formato de pesos | safetensors (MLX); requiere mlx-lm con soporte `nemotron-nas` |

## Arquitectura y entrenamiento

El modelo base, Llama-3_3-Nemotron-Super-49B-v1_5, es un transformer decoder-only denso de aproximadamente 49,87B de parametros. NVIDIA lo obtuvo a partir de Llama-3.3-70B-Instruct mediante busqueda de arquitectura neuronal (NAS), que poda y reorganiza el modelo original para reducir su tamano manteniendo la mayor parte de la capacidad, de ahi el tag `nemotron-nas`. Sobre esa base se aplico un post-entrenamiento orientado a razonamiento, preferencias de chat humano y tareas como RAG y tool calling. El modelo soporta una ventana de contexto de 128.000 tokens.

Este repositorio concreto no reentrena ni ajusta el modelo: solo cuantiza los pesos. El procedimiento de leCore Unicron `requantize` cuantiza cada tensor lineal del decoder de forma aislada (MLX affine, group size 64) a 2, 3 y 4 bits y mide el dano como KL(fp16 || cuantizado) sobre las distribuciones de siguiente token en una mezcla de calibracion (3066 tokens de train de WikiText-2, 1022 tokens de codigo Python y una sonda estructurada de prosa, codigo, SQL y markdown). A continuacion asigna bits de forma greedy: parte de 4 bits en todas las capas y aplica repetidamente la degradacion con menor dano medido por byte ahorrado hasta encajar en el presupuesto de tamano. La conversion final se hizo con `mlx_lm.convert` y un `quant_predicate` por capa.

## Capacidades

- Generacion de texto y razonamiento multi-paso, heredadas del post-entrenamiento del modelo base para tareas de razonamiento.
- Soporte de tool calling / function calling, segun las capacidades declaradas del modelo base de NVIDIA.
- Uso en pipelines de agentes y flujos multi-step, como parte del diseno del Nemotron Super.
- RAG (generacion aumentada por recuperacion) gracias a la ventana de 128.000 tokens del modelo base.
- Chat conversacional e instrucciones, con preferencias de chat humano en el post-entrenamiento.
- Generacion de codigo (el modelo base esta orientado tambien a tareas tecnicas), aunque la cuantizacion mixta de este repo preserva mejor el codigo Python que las recetas estandar (ver benchmarks).
- Modo de razonamiento (`thinking`): el modelo base Nemotron Super incluye un modo de razonamiento; este repo no lo elimina, pero conviene verificar su comportamiento tras la cuantizacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de razonamiento local en Mac: el modelo se ejecuta integramente en Apple Silicon mediante mlx-lm, sin conexion a servicios externos, lo que lo hace adecuado para entornos donde la privacidad de los datos es critica y no se quiere enviar informacion a la nube.
- RAG sobre documentacion extensa: la ventana de 128.000 tokens del modelo base permite inyectar grandes volumenes de contexto recuperado (manuales, bases de conocimiento, expedientes) y responder preguntas sobre ellos en un unico paso.
- Agentes con tool calling: al conservar la capacidad de function calling del modelo base, se puede integrar en un bucle de agente que consulte APIs, ejecute busquedas o modifique ficheros, siempre que el backend MLX soporte el formato de herramientas requerido.
- Generacion de codigo en local: la receta de cuantizacion mixta mantiene una perplejidad en codigo Python (7,82) muy inferior a la de las recetas estandar (30,73 en 3-bit y 14,15 en `mixed_2_6`), por lo que es una opcion razonable para autocompletado o refactorizacion asistida en un Mac de gama alta.
- Prototipado y evaluacion sin GPU dedicada: equipos que no disponen de A100/H100 pueden probar un modelo de ~50B en un Mac de 36 GB o mas antes de decidir un despliegue en servidor.
- Analisis de documentos largos y extraccion estructurada: resumen de informes, extraccion de campos o clasificacion de texto en lotes, aprovechando el contexto extendido y ejecutandose en local.
- Chat conversacional multi-turno: gestion de conversaciones con historial largo dentro del limite de KV cache configurado en mlx-lm.
- Base para pruebas de cuantizacion: util como referencia para comparar estrategias de cuantizacion mixta frente a recetas fijas en un mismo hardware.

## Benchmarks y rendimiento

Solo se han publicado mediciones de perplejidad por parte del autor (secuencia 512, pesos cuantizados desquantizados con `mx.dequantize` y ejecutados en bf16 sobre GPU). No se ejecutaron benchmarks de tareas downstream.

| Modelo | Tamano (GB, pesos) | bpw | Perplejidad WikiText-2 (32704 tok) | Perplejidad codigo Python (8176 tok) |
|---|---|---|---|---|
| Referencia bf16 | – | 16 | 13,0182 | 5,0725 |
| Este repo (mezcla leCore Unicron) | 19,49 | 3,127 | 37,3530 | 7,8224 |
| MLX 3-bit estandar, group 64 | 21,82 | 3,500 | 40,7840 | 30,7323 |
| Receta estandar MLX `mixed_2_6` | 19,72 | 3,164 | 95,8463 | 14,1513 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- Pesos del modelo: ~19,49 GB. La memoria adicional para KV cache depende de la longitud de contexto configurada (`--max-kv-size`).
- Plataforma: exclusivamente Apple Silicon, ya que el formato es MLX. No se puede ejecutar directamente en GPU NVIDIA o AMD con esta libreria.
- Memoria unificada recomendada: 36 GB como minimo practico; en un Mac de 36 GB el autor indica que puede ser necesario elevar el limite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=30000`. 64 GB o mas ofrece margen comodo para contextos largos.
- CPU/GPU: no aplica a modelos NVIDIA tipo A100, H100 o RTX 4090, al no ser ejecutable con MLX.
- Despliegue: `mlx-lm` (instalado con `pip install -U mlx-lm`), invocando `mlx_lm.generate --model staccs/Llama-3_3-Nemotron-Super-49B-v1_5-lecore-mlx --prompt "Hello" --max-tokens 256 --max-kv-size 8192`. Se requiere la version de mlx-lm con soporte `nemotron-nas`.
- Otras opciones (vLLM, llama.cpp, Ollama, TGI): no disponibles en la informacion proporcionada para esta cuantizacion concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este repo (leCore Unicron mix) | ~49,87B | 128K (modelo base) | MLX, mixed-precision ~3,127 bpw | 37,3530 | NVIDIA Open Model License + Llama 3.3 Community License |
| Receta estandar MLX 3-bit, group 64 | ~49,87B | 128K (modelo base) | MLX, 3-bit uniforme (3,500 bpw) | 40,7840 | NVIDIA Open Model License + Llama 3.3 Community License |
| Receta estandar MLX `mixed_2_6` | ~49,87B | 128K (modelo base) | MLX, mixta (3,164 bpw) | 95,8463 | NVIDIA Open Model License + Llama 3.3 Community License |
| nvidia/Llama-3_3-Nemotron-Super-49B-v1_5 (bf16) | ~49,87B | 128K | safetensors bf16 | 13,0182 | NVIDIA Open Model License + Llama 3.3 Community License |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion disponible no incluye datos de modelos alternativos de la misma categoria (por ejemplo, versiones GGUF o cuantizaciones de terceros del mismo Nemotron). No disponible para otros modelos comparables.

## Limitaciones y advertencias

- Perdida de calidad medible por cuantizacion: la perplejidad en WikiText-2 pasa de 13,0182 (bf16) a 37,3530, es decir, casi el triple. La degradacion en codigo Python es mas contenida (de 5,0725 a 7,8224), pero sigue siendo significativa.
- Sin benchmarks de tareas downstream: el autor solo reporta perplejidad a secuencia 512. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento, tool calling o RAG, por lo que no se puede garantizar el comportamiento en esos escenarios.
- La perplejidad de contexto corto no predice por si sola la calidad en contextos largos; conviene validar las salidas con casos reales.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido incorrecto con aparente seguridad; la cuantizacion agresiva puede acentuar este efecto.
- Dependencia de plataforma: el modelo solo funciona en Apple Silicon mediante mlx-lm. No es portable directamente a un servidor con GPU NVIDIA ni a despliegues estandar de vLLM, TGI o llama.cpp.
- Consumo de memoria en contextos largos: a pesar de que los pesos ocupan 19,49 GB, el KV cache para ventanas de hasta 128K puede agotar la memoria unificada de Macs de 36 GB; es necesario limitar `--max-kv-size`.
- Licencia: se acumulan dos licencias, la NVIDIA Open Model License y la Llama 3.3 Community License Agreement. Esta ultima impone condiciones de uso comercial (por ejemplo, umbral de usuarios activos mensuales) y obligaciones de atribucion ("Built with Llama"). Conviene revisar ambos textos antes de un uso comercial.
- Idiomas soportados: no declarados en el repositorio; el modelo base Llama 3.3 esta orientado principalmente al ingles y a un conjunto limitado de idiomas, por lo que el rendimiento en castellano no esta garantizado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta y creado en octubre de 2026, sin validacion de la comunidad ni mantenimiento conocido.
- El autor indica que solo se realizo cuantizacion, sin reentrenamiento, por lo que las capacidades dependen integramente del modelo base de NVIDIA.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/staccs/Llama-3_3-Nemotron-Super-49B-v1_5-lecore-mlx
- Modelo base: https://huggingface.co/nvidia/Llama-3_3-Nemotron-Super-49B-v1_5
- Version anterior del modelo base: https://huggingface.co/nvidia/Llama-3_3-Nemotron-Super-49B-v1
- NVIDIA NIM: https://build.nvidia.com/nvidia/llama-3_3-nemotron-super-49b-v1
- NVIDIA NGC (Nemotron Super 3.3 49B): https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/nemotron-super-3_3-49b
- NVIDIA NGC (contenedor v1.5): https://catalog.ngc.nvidia.com/orgs/nim/nvidia/containers/llama-3.3-nemotron-super-49b-v1.5/
- NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Llama 3.3 Community License Agreement: https://www.llama.com/llama3_3/license/
- Libreria de inferencia mlx-lm: https://github.com/ml-explore/mlx-lm
