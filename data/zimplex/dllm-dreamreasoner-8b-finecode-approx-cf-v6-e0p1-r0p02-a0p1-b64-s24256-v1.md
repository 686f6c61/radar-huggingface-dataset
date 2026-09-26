# zimplex/dllm-dreamreasoner-8b-finecode-approx-cf-v6-e0p1-r0p02-a0p1-b64-s24256-v1

## Resumen

Este repositorio contiene el checkpoint final en formato Hugging Face del entrenamiento continuado (continued pretraining) del modelo `Dream-org/DreamReasoner-8B` sobre el dataset sellado FineCode B64, con el grafo de dependencias approximate-CF-v6. Lo publica el usuario zimplex como un checkpoint de investigacion, no como un modelo listo para despliegue en produccion. Se trata de un modelo de lenguaje de difusion (diffusion-language-model) de la familia Dream, con codigo de modelado personalizado, que se carga mediante `trust_remote_code=True`.

El modelo tiene 8.190.735.360 parametros (unos 8,19 mil millones), se distribuye en safetensors con pesos BF16 y ocupa 16,4 GB en el repositorio. La licencia es Apache 2.0. El entrenamiento continuado se realizo con una longitud de contexto de 2.048 tokens, un batch global de 64 secuencias y 24.256 pasos de optimizador, sobre 16 nodos con 4 GPU GB300 cada uno.

Su relevancia es fundamentalmente de investigacion: explora el ajuste de un modelo de difusion de lenguaje sobre codigo mediante un objetivo de supervision derivado de un grafo de dependencias (approximate-CF-v6, top-k 8), un enfoque distinto del entrenamiento autorregresivo convencional. La model card reporta resultados en HumanEval (89,63 % pass@1), MBPP sanitized (81,71 %) y LiveCodeBench Pro (15,44 %). El checkpoint no ha recibido una evaluacion de seguridad o despliegue independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de difusion (diffusion-language-model) de la familia Dream, con codigo de modelado personalizado (`custom_code`) |
| Parametros totales | 8.190.735.360 (~8,19 mil millones, dato real de safetensors) |
| Parametros activos | No aplica; no se describe una arquitectura MoE |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento declarado) |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos BF16 en safetensors y no documenta GGUF ni cuantizaciones INT |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Dream-org/DreamReasoner-8B (revision `ed62b1d2c82ccd234b05ed2463b4c0ee640f2068`) |
| Tamano del repositorio | 16,4 GB |
| Pipeline declarado | text-generation (tambien etiquetado como feature-extraction) |
| Carga | Requiere `trust_remote_code=True` por el codigo de modelado personalizado |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje de difusion, no un transformer autorregresivo convencional. La generacion se realiza mediante un proceso iterativo de desruido, lo que se refleja en la evaluacion reportada: decodificacion greedy B64/S64 por confianza con umbral 0,95 y semilla 17. El checkpoint se construye sobre el modelo post-entrenado `Dream-org/DreamReasoner-8B` y anade entrenamiento continuado sobre el dataset sellado FineCode B64 (identificador del dataset: `zimplex/dllm-dreamreasoner-finecode-b64-v1`).

El entrenamiento uso 24.256 pasos de optimizador, batch global de 64 secuencias (microbatch 1, acumulacion de gradiente 1), precision BF16 con FSDP full shard y 16 nodos con 4 GPU GB300 cada uno. El objetivo declarado es `projected_eq73_v1`, con grafo approximate CF v6 y top-k 8. Los hiperparametros del profesor son epsilon=0,1, rollin_epsilon=0,02 y action_epsilon=0,1. La tasa de aprendizaje sigue un decaimiento coseno de 5e-7 a 5e-8 con warmup ratio 0,05 y weight decay 0,1. Se activo supervision Terminal-EOS. La configuracion resuelta se incluye en el repositorio como `resolved_config.yaml` y la dependencia del grafo procede del artefacto `zimplex/dllm-effect-parents-dreamreasoner-finecode-d1marginal-approx-w128-tau2-b64-v6`.

## Capacidades

- Generacion de texto y de codigo en un modelo de difusion de lenguaje, con decodificacion iterativa por umbral de confianza.
- Generacion de codigo evaluada en HumanEval, MBPP sanitized y LiveCodeBench Pro, con un rendimiento claramente inferior en el benchmark mas dificil (LiveCodeBench Pro).
- Entrenamiento con supervision basada en grafo de dependencias (dependency-graph, approximate CF v6, top-k 8), orientado a capturar relaciones estructurales entre fragmentos de codigo.
- Etiquetado como conversacional y de generacion de texto en Hugging Face.
- Capacidades de extraccion de caracteristicas declaradas mediante el tag `feature-extraction`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades multimodales (vision, audio): no documentadas.
- Modo de razonamiento o "thinking" explicito: no disponible.

## Casos de uso

- Generacion de codigo asistida en entornos de desarrollo: el modelo puede producir fragmentos de codigo a partir de una descripcion o un contexto, con un rendimiento medido de 89,63 % pass@1 en HumanEval y 81,71 % en MBPP sanitized, adecuado para prototipado y sugerencias dentro de un IDE.
- Analisis de dependencias entre ficheros y modulos: al haberse entrenado con supervision de grafo de dependencias, es util en tareas de investigacion sobre resolucion de referencias, ordenacion topologica de dependencias o deteccion de acoplamientos entre componentes.
- Generacion de pruebas unitarias: puede producir esqueletos de tests a partir de funciones existentes, aprovechando su capacidad de generar codigo estructurado, siempre con revision humana y con las limitaciones de contexto de 2.048 tokens.
- Refactorizacion y reescritura de fragmentos de codigo: su decodificacion iterativa por desruido puede emplearse para tareas de reescritura acotada de bloques de codigo, especialmente en el ambito del dataset FineCode.
- Revision automatizada de parches en pipelines de CI/CD: como generador de candidatos de codigo que se validan despues con tests y linters, sin exponerlo a decisiones de merge automaticas.
- Investigacion sobre modelos de difusion de lenguaje: es un artefacto de estudio para comparar el entrenamiento continuado con supervision de grafo frente a objetivos autorregresivos, gracias a los manifiestos de integridad y a la configuracion resuelta publicada.
- Formacion y explicacion de codigo: puede generar ejemplos comentados o explicaciones de fragmentos cortos, util en entornos didacticos controlados.

## Benchmarks y rendimiento

Evaluacion reportada por el autor: decodificacion greedy B64/S64 por confianza con umbral 0,95 y semilla 17, con un limite de generacion de 4.096 tokens.

| Benchmark | Limite de generacion | Pass@1 |
|---|---:|---:|
| HumanEval | 4.096 | 147/164 (89,63 %) |
| MBPP sanitized | 4.096 | 210/257 (81,71 %) |
| LiveCodeBench Pro | 4.096 | 109/706 (15,44 %) |

No se han publicado en la informacion disponible resultados de benchmarks comparativos frente a otros modelos, ni datos de MMLU, GSM8K u otros conjuntos generales.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 8,19 mil millones de parametros, sin contar overhead de activaciones ni cache de atencion): aproximadamente 16,4 GB en BF16/FP16, unos 8,2 GB en INT8 y unos 4,1 GB en INT4.
- Con contexto de 2.048 tokens, el coste de cache es reducido en comparacion con modelos de contexto largo, de modo que el grueso de la VRAM lo ocupan los pesos.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o similar. Cabe en GPU de consumo con 24 GB (RTX 3090, RTX 4090) en BF16 si el overhead de runtime es contenido.
- Para cuantizaciones INT8 o INT4 encajaria en GPU de 8-12 GB, siempre que el runtime soporte cuantizacion del codigo de modelado personalizado, algo que no esta documentado.
- Entrenamiento declarado por el autor: 16 nodos con 4 GPU GB300 cada uno, BF16 y FSDP full shard. No es un perfil de hardware de consumo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. El modelo requiere `trust_remote_code=True` y usa codigo de modelado propio de la familia Dream, por lo que el soporte en estos runtimes no esta confirmado en la informacion proporcionada.
- Latencia y throughput estimados: no disponible. La decodificacion por desruido iterativo de los modelos de difusion implica varios pasos por generacion, por lo que el coste por token no equivale al de un modelo autorregresivo equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks de codigo |
|---|---|---|---|---|---|
| Este checkpoint (dllm-dreamreasoner-8b-finecode-approx-cf-v6) | 8,19B | 2.048 | Apache 2.0 | safetensors | HumanEval 89,63 %; MBPP sanitized 81,71 %; LiveCodeBench Pro 15,44 % |
| Dream-org/DreamReasoner-8B (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas autorregresivas de ~7-8B para codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento, contexto o licencia de modelos comparables que permitan una comparacion cuantitativa. La comparacion directa mas relevante es con su modelo base `Dream-org/DreamReasoner-8B`, del que este checkpoint es un ajuste por entrenamiento continuado, pero la model card no incluye sus metricas originales.

## Limitaciones y advertencias

- Es un checkpoint de investigacion; el autor indica explicitamente que no ha recibido una evaluacion de seguridad o despliegue independiente.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion.
- Contexto limitado a 2.048 tokens, muy inferior al de modelos de codigo actuales, lo que restringe tareas sobre ficheros o repositorios grandes.
- Idiomas soportados no declarados, por lo que el comportamiento multilingue es incierto.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo.
- Rendimiento desigual entre benchmarks: 89,63 % en HumanEval frente a 15,44 % en LiveCodeBench Pro, lo que sugiere poca robustez en problemas de programacion competitiva complejos.
- Requiere `trust_remote_code=True` para cargar codigo de modelado personalizado, lo que implica ejecutar codigo no auditado por el usuario final; conviene revisarlo antes de usarlo.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base `Dream-org/DreamReasoner-8B` conviene verificar la licencia y las condiciones del modelo original.
- Adopcion nula en el momento de la ficha (0 descargas, 0 "me gusta"), lo que reduce la validacion externa y el soporte de la comunidad.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni soporte confirmado en runtimes de inferencia habituales, lo que complica el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zimplex/dllm-dreamreasoner-8b-finecode-approx-cf-v6-e0p1-r0p02-a0p1-b64-s24256-v1
- Modelo base: https://huggingface.co/Dream-org/DreamReasoner-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/zimplex/dllm-dreamreasoner-finecode-b64-v1
- Dependencia del grafo: https://huggingface.co/zimplex/dllm-effect-parents-dreamreasoner-finecode-d1marginal-approx-w128-tau2-b64-v6
- No se han encontrado en la informacion proporcionada papers, blogs o demos adicionales.
