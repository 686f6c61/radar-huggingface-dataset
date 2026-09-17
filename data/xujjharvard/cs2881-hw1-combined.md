# XujjHarvard/cs2881-hw1-combined

## Resumen

cs2881-hw1-combined es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct, publicado por el usuario XujjHarvard como parte de la asignatura CS2881 (etiqueta `cs2881-hw1`). Se trata de un ejercicio académico de alineamiento, no de un modelo de propósito general listo para producción: el autor describe explícitamente un entrenamiento combinado de RLAIF (reinforcement learning from AI feedback) y RLVR (reinforcement learning with verifiable rewards), con GRPO sobre una mezcla 50/50 dentro del mismo lote (within-batch) de un juez de persona (persona judge) y un verificador de OpenBookQA, con recompensa normalizada por tipo.

El modelo tiene 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) según los pesos en safetensors, y el repositorio ocupa 6,4 GB, lo que incluye tanto el modelo fusionado en la raíz como el adaptador LoRA en el subdirectorio `adapter/`. Hereda del modelo base la arquitectura decoder-only de Qwen2.5 y la licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque con las salvedades propias de un checkpoint de investigación.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo reproducible de cómo combinar señales de recompensa aprendidas (juez de estilo) con señales de recompensa verificables (exactitud en OpenBookQA) en un mismo paso de optimización, y de cómo se comportan ambas dimensiones cuando se optimizan conjuntamente. Los únicos datos de rendimiento publicados son incrementos relativos reportados por el autor, no puntuaciones absolutas de benchmarks estándar. El repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (segun pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la informacion disponible; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se incluyen pesos GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado en la raiz del repo + adaptador LoRA en `adapter/`) |

Otros datos: modelo base `Qwen/Qwen2.5-3B-Instruct`, etiqueta de region `us`, tamano del repositorio 6,4 GB, creado el 2026-09-17 y actualizado el mismo dia. Descargas: 0. Likes: 0. Pipeline: no disponible.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B-Instruct: un transformer decoder-only con atención por consultas agrupadas (GQA) y codificación posicional rotatoria (RoPE). El autor no documenta ninguna modificación estructural propia; el trabajo se realiza exclusivamente a nivel de ajuste de pesos mediante LoRA, cuyo adaptador se publica por separado y cuyo resultado se ha fusionado (merged) en el modelo de la raíz del repositorio.

En cuanto al entrenamiento, la model card describe un proceso de dos ejes combinados bajo el epígrafe "Combined RLAIF+RLVR — Setting B continued". El algoritmo de optimización es GRPO (group relative policy optimization). La señal de recompensa se construye mezclando, dentro del mismo lote y en proporción 50/50, dos fuentes: un juez de persona (persona judge, señal de tipo RLAIF, presumiblemente orientada al estilo y al registro del texto) y un verificador de OpenBookQA (señal de tipo RLVR, verificable por exactitud de respuesta). La recompensa se normaliza por tipo antes de agregarse, un detalle relevante porque evita que una de las dos escalas de recompensa domine el gradiente. Según el autor, ambas dimensiones mejoran simultáneamente: OpenBookQA +0,024, `clf_style` +0,257 y `register` +1,105. Se desconoce el número de tokens de entrenamiento, la composición exacta del dataset de prompts, la configuración de hiperparámetros y si hubo etapas previas de SFT o DPO más allá del ajuste instruct del modelo base.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Qwen2.5-3B-Instruct.
- Respuesta a preguntas de conocimiento factual, con un ajuste específico orientado a mejorar el desempeño en OpenBookQA según la métrica del autor.
- Control de estilo y registro: los incrementos reportados en `clf_style` (+0,257) y `register` (+1,105) indican que el modelo fue optimizado para adoptar un estilo o registro concretos definidos por el juez de persona.
- Consistencia de persona: al entrenarse con una señal RLAIF basada en un juez de persona, el modelo tiende a mantener un perfil de respuesta estable dentro de una misma conversación.
- Razonamiento multietapa y uso de herramientas: presumiblemente heredados del modelo base Qwen2.5-3B-Instruct, pero no verificados ni documentados en la model card de este checkpoint.
- Capacidades multilingües: no disponibles. No se documenta qué idiomas conserva tras el ajuste; el ajuste con juez de estilo y verificador en inglés sugiere un sesgo hacia el inglés.
- Capacidades especiales (modo thinking explícito, visión, audio): no disponibles; no se mencionan en la información proporcionada.

## Casos de uso

- Experimentación en alineamiento con recompensas híbridas: el checkpoint sirve como referencia reproducible para investigar cómo interactúan una recompensa aprendida (juez de persona) y una recompensa verificable (OpenBookQA) en GRPO, comparando el modelo fusionado con el adaptador LoRA publicado en `adapter/`.
- Generación con control de registro: al haber sido optimizado para subir `register` en más de un punto, es adecuado para prototipos donde se necesita adaptar el tono (formal, cercano, técnico) sin reentrenar desde cero, usando el adaptador sobre Qwen2.5-3B-Instruct.
- Asistentes conversacionales con persona fija: el uso de un juez de persona durante el entrenamiento lo hace útil para probar personajes consistentes en chatbots de demostración, siempre que el comportamiento se valide manualmente antes de cualquier despliegue.
- Evaluación educativa automatizada: el ajuste con OpenBookQA permite usarlo como banco de pruebas para medir si el ajuste de estilo degrada o no la exactitud en preguntas de conocimiento, comparando antes y después del entrenamiento.
- Investigación sobre olvido catastrófico: al ser un ajuste LoRA sobre un modelo instruct de 3B, es un caso práctico para medir qué capacidades del modelo base se pierden al optimizar dos recompensas específicas.
- Inferencia local en hardware de consumo: con ~3,09 mil millones de parámetros, puede ejecutarse en una GPU de gama media-alta o incluso en CPU con cuantización, lo que lo hace apto para pruebas offline de pipeline de RL sin clúster.
- Docencia y trabajos de curso: sirve como plantilla para asignaturas que cubran RLAIF, RLVR, GRPO y fusión de adaptadores LoRA, dado que publica tanto el adaptador como el modelo fusionado.
- Generación de datos sintéticos con estilo controlado: puede emplearse para producir pares prompt-respuesta con un registro determinado que después se usen para destilar o ajustar otros modelos.

## Benchmarks y rendimiento

Los únicos datos publicados son incrementos relativos reportados por el autor, no puntuaciones absolutas. Se reproducen tal cual:

| Metrica | Cambio reportado |
|---|---|
| OpenBookQA | +0,024 |
| clf_style | +0,257 |
| register | +1,105 |

No se especifica la línea base exacta (si es el modelo base, un checkpoint previo del mismo ajuste o la fase anterior de "Setting B"), ni el tamaño del conjunto de evaluación, ni el intervalo de confianza de estas diferencias. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 6,2 GB solo para pesos, más caché KV y activaciones; con contexto largo, entre 8 y 12 GB.
- VRAM estimada en int8: aproximadamente 3,5-5 GB.
- VRAM estimada en 4 bits (si se convierte a GGUF o AWQ/GPTQ, no publicado): aproximadamente 2-3 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En 4 bits podría caber en GPUs de 6-8 GB e incluso en equipos con memoria unificada.
- GPU de centro de datos: A100, H100, L40S o similares, aunque están sobredimensionadas para 3B de parámetros salvo que se desplieguen muchas réplicas concurrentes.
- Opciones de despliegue: los pesos son safetensors compatibles con transformers, por lo que funcionan con vLLM y TGI. No hay pesos GGUF publicados, de modo que para llama.cpp u Ollama habría que convertir previamente el modelo a GGUF (por ejemplo con las herramientas de llama.cpp).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Rendimiento |
|---|---|---|---|---|---|
| cs2881-hw1-combined | 3,09 B | No especificado (base: 32.768) | Apache 2.0 | safetensors + LoRA | Solo incrementos relativos: OpenBookQA +0,024, clf_style +0,257, register +1,105 |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF (comunidad) | Ampliamente evaluado en la model card original; no comparable directamente con este checkpoint |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Benchmarks publicados por Meta; no comparable con este checkpoint |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | safetensors, GGUF | Benchmarks publicados por Microsoft; no comparable con este checkpoint |

La comparación relevante es con el propio modelo base: este checkpoint parte de Qwen2.5-3B-Instruct, comparte licencia Apache 2.0 y añade un ajuste específico de estilo y exactitud en OpenBookQA a cambio de un posible olvido en otras capacidades no medidas. No hay datos públicos que permitan situarlo frente a alternativas de 3B en benchmarks generales.

## Limitaciones y advertencias

- Es un artefacto académico de una asignatura (`cs2881-hw1`), sin pipeline declarado, sin descargas y sin validación externa; no debe desplegarse en producción sin una evaluación propia.
- Riesgo de alucinación: heredado de un modelo base de 3B parámetros, que es relativamente propenso a inventar hechos cuando no dispone de contexto suficiente. El ajuste no documenta ninguna mejora en calibración.
- Sesgos conocidos: no documentados por el autor. El juez de persona usado para RLAIF puede introducir sesgos de estilo propios (por ejemplo, preferencia por un registro muy concreto), y el verificador de OpenBookQA puede sesgar las respuestas hacia el formato de preguntas de opción múltiple.
- Riesgo de sobreajuste al benchmark: al entrenar con una recompensa verificable derivada de OpenBookQA, es plausible que la mejora de +0,024 no generalice a otras tareas de conocimiento. No hay datos que confirmen o descarten este punto.
- Idiomas: no se declara ninguno. El entrenamiento descrito (juez de estilo y OpenBookQA) es en inglés, por lo que no hay garantía de que el comportamiento multilingüe del modelo base se conserve intacto.
- Degradación de capacidades: no se publican evaluaciones de capacidades generales después del ajuste, por lo que no se puede descartar olvido catastrófico en matemáticas, código o instrucciones largas.
- Longitud de contexto: no verificada para este checkpoint; se asume la del modelo base, pero el ajuste LoRA y la fusión podrían alterar el comportamiento en contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 se recomienda revisar los términos de Qwen para confirmar que no se añade ninguna restricción adicional.
- Reproducibilidad: la model card no incluye hiperparámetros, número de pasos, composición del dataset ni código de entrenamiento, lo que dificulta reproducir los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XujjHarvard/cs2881-hw1-combined
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Adaptador LoRA: incluido en el repositorio, subdirectorio `adapter/` (https://huggingface.co/XujjHarvard/cs2881-hw1-combined/tree/main/adapter)
- Paper, blog o repositorio del autor: no disponibles en la informacion proporcionada.
- La busqueda web no ha devuelto ningun enlace relevante sobre este modelo; el unico resultado obtenido no guarda relacion con el contenido de la ficha.
