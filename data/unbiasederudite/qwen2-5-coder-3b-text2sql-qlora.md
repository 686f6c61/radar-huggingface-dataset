# unbiasederudite/qwen2.5-coder-3b-text2sql-qlora

## Resumen

`unbiasederudite/qwen2.5-coder-3b-text2sql-qlora` es un adaptador LoRA (formato PEFT) entrenado mediante QLoRA sobre el modelo base `Qwen/Qwen2.5-Coder-3B-Instruct`, especializado en la traducción de preguntas en lenguaje natural a consultas SQL (text-to-SQL). Lo desarrolla el usuario de HuggingFace `unbiasederudite`, y su propósito es acotar el comportamiento del modelo base hacia una única tarea: generar SQL ejecutable a partir de esquemas de bases de datos relacionales.

El adaptador no contiene pesos completos, sino únicamente las matrices de bajo rango del fine-tuning, por lo que el repositorio ocupa 0,1 GB y requiere cargar el modelo base de 3.000 millones de parámetros para funcionar. El entrenamiento se hizo con SFT (supervised fine-tuning) sobre la combinación `train_spider` + `train_others` del conjunto de datos Spider, tras eliminar preguntas duplicadas y ejemplos cuya consulta de referencia no se ejecutaba correctamente, quedando 8.647 muestras y descartando 82 que superaban los 2.048 tokens.

Su relevancia es acotada pero práctica: es un ejemplo reproducible de cómo un modelo de código de 3B puede especializarse en text-to-SQL con recursos de consumo, y el repositorio de GitHub adjunto publica el pipeline completo (datos, prompts, entrenamiento, generación y evaluación). No obstante, la model card es prácticamente una plantilla autogenerada por TRL: no declara licencia, idiomas, hiperparámetros de LoRA ni resultados de evaluación numéricos, lo que limita seriamente su uso directo en producción sin trabajo adicional de validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura del modelo base Qwen2.5-Coder (no detallada en la model card) |
| Parámetros totales | 3.000 millones en el modelo base; el adaptador añade un subconjunto de bajo rango (rango y alpha no disponibles) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base según la documentación de Qwen; no verificado ni declarado en la model card del adaptador |
| Tipos de cuantización | Entrenado con QLoRA (base en 4 bits); el adaptador se distribuye en safetensors. No se declaran cuantizaciones GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | no disponible (el modelo base es multilingüe; el adaptador se entrenó sobre Spider, mayoritariamente en inglés) |
| Licencia | no disponible (la model card incluye un marcador `licence: license` sin contenido; consultar la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `Qwen/Qwen2.5-Coder-3B-Instruct` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-3B-Instruct, un modelo decoder-only de la familia Qwen2.5-Coder (sucesora de CodeQwen), que en su informe técnico se describe como un transformer con atención causal, codificación posicional RoPE, activación SwiGLU, normalización RMSNorm y atención con consultas agrupadas (GQA), además de un vocabulario propio de Qwen2.5 ampliado con tokens especiales para código. La model card del adaptador no detalla hiperparámetros concretos del base (número de capas, dimensión oculta, cabezas de atención), por lo que esos datos deben consultarse en la ficha del modelo original.

El entrenamiento se realizó con SFT usando TRL (versión 1.16.0) sobre PEFT 0.21.2, Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. El conjunto de datos procede de Spider: se combinaron `train_spider` y `train_others`, se eliminaron preguntas repetidas y aquellas cuyo *gold query* fallaba al ejecutarse, resultando 8.647 ejemplos; se descartaron 82 muestras de más de 2.048 tokens, lo que fija la longitud máxima de secuencia efectiva del entrenamiento. Asumiendo esa cota de 2.048 tokens por muestra, el volumen total de tokens de entrenamiento no supera los ~17,7 millones. No se especifican rango de LoRA, alpha, tasa de aprendizaje, número de épocas ni si hubo una fase posterior de preferencias (DPO/RLHF); tampoco se documenta ninguna innovación técnica más allá del propio fine-tuning.

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural y de un esquema de base de datos (tarea principal del adaptador, orientada a SQL de estilo SQLite según Spider).
- Razonamiento sobre esquemas relacionales: interpretación de tablas, columnas y relaciones foráneas incluidas en el prompt.
- Generación de texto y conversación multi-turno heredadas del modelo base Instruct (formato chat con roles).
- Capacidad de código general heredada de Qwen2.5-Coder-3B-Instruct (generación y explicación de código en múltiples lenguajes), aunque el fine-tuning puede haberla degradado al concentrar el entrenamiento en text-to-SQL.
- Soporte de tool calling / function calling: no documentado para el adaptador; el modelo base lo soporta, pero no hay evidencia de que se conserve tras el SFT.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- **Generación de SQL en herramientas internas de análisis**: el adaptador recibe el `CREATE TABLE` del esquema y la pregunta del analista, y devuelve una consulta ejecutable; es adecuado porque el fine-tuning se hizo exactamente sobre ese formato de prompt y sobre bases de datos diversas de Spider.
- **Prototipado rápido de asistentes de datos sobre SQLite/PostgreSQL**: al ser un adaptador de 0,1 GB sobre un base de 3B, permite montar un entorno de demostración en una GPU de consumo y sustituir el adaptador según el dominio.
- **Benchmark base para investigación en text-to-SQL**: el repositorio incluye scripts de generación y *scoring* sobre Spider, por lo que sirve como línea base reproducible para comparar técnicas de prompting, esquemas y decodificación restringida.
- **Generación de borradores de consultas para revisión humana**: en lugar de ejecutar directamente, el modelo produce candidatos que un revisor o un validador sintáctico (parser SQL, EXPLAIN en seco) acepta o descarta; útil cuando el coste de un error en producción es alto.
- **Aumento de datos para entrenar otros modelos**: las consultas generadas pueden filtrarse por ejecución correcta y reutilizarse como datos sintéticos etiquetados para ajustar modelos mayores.
- **Enseñanza y documentación de text-to-SQL**: permite ilustrar en un curso o tutorial el ciclo completo QLoRA + Spider con un coste de cómputo bajo y código abierto disponible.
- **Preprocesado en pipelines de BI**: traducir preguntas de usuarios a SQL para lanzarlas contra un catálogo de vistas, con validación posterior y *fallback* a búsqueda semántica si la consulta no compila.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de GitHub menciona un pipeline de generación y *scoring* con métricas de ejecución sobre Spider (execution accuracy), pero no se incluyen cifras en la documentación accesible; del mismo modo, la model card no reporta ninguna evaluación. Cualquier número de MMLU, HumanEval, GSM8K o execution accuracy para este adaptador sería una invención y no debe asumirse.

## Requisitos de hardware

- **VRAM en fp16/bf16**: el modelo base de 3B ocupa aproximadamente 6,2 GB en pesos de 16 bits; con caché KV para 2.048–8.192 tokens, el consumo realista se sitúa en torno a 7–10 GB.
- **VRAM en 4 bits (bitsandbytes / GPTQ / AWQ)**: en torno a 2,2–3 GB de pesos, más caché KV; manejable en GPUs de 8 GB.
- **GPU recomendadas**: para servicio con concurrencia, A100 40 GB, H100 o L40S (sobredimensionadas para 3B, pero necesarias para lotes grandes); para desarrollo, RTX 4090, RTX 4080, RTX 3090.
- **Cabe en GPU de consumo**: sí. RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en fp16; GTX 1660 / RTX 3050 8 GB solo con cuantización de 4 bits y contexto reducido.
- **Opciones de despliegue**: `transformers` + PEFT (carga del adaptador y `merge_and_unload` para fusionarlo), vLLM (requiere fusionar el adaptador o usar `--enable-lora`), TGI, llama.cpp/Ollama (previo convertido a GGUF tras fusionar), y servidores compatibles con OpenAI como SGLang.
- **Latencia y throughput**: no se han publicado mediciones para este adaptador. Como orientación por clase de tamaño (no medida), un 3B en fp16 sobre RTX 4090 suele generar por encima de 100 tokens/s con lote 1 y decenas de miles de tokens/s con lotes grandes en vLLM; verificar siempre en el entorno propio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unbiasederudite/qwen2.5-coder-3b-text2sql-qlora | 3B (base) + adaptador LoRA | 32.768 tokens (base, según Qwen) | Text-to-SQL (Spider) | no disponible en la model card | Adaptador PEFT en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | 32.768 tokens (según Qwen) | Código general e instrucciones | consultar ficha del modelo base | Pesos completos en HuggingFace |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens (según Qwen) | Código general e instrucciones | consultar ficha del modelo base | Pesos completos; requiere ~15 GB en fp16 |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens (según Qwen) | Código general; alternativa ligera | consultar ficha del modelo base | Pesos completos; cabe en 4–6 GB en fp16 |

No se han localizado en la búsqueda adaptadores text-to-SQL comparables publicados con métricas verificables; la comparación con los modelos de la propia familia Qwen2.5-Coder se ofrece únicamente por tamaño y contexto, no por rendimiento en text-to-SQL.

## Limitaciones y advertencias

- **Sin métricas publicadas**: no hay execution accuracy ni comparación con líneas base, por lo que no puede afirmarse que el fine-tuning mejore al modelo base en Spider.
- **Licencia indeterminada**: la model card no declara licencia (marcador `licence: license` sin valor). El uso comercial exige verificar la licencia del modelo base y la del conjunto Spider, y en la práctica el adaptador no puede considerarse apto para producción hasta aclararlo.
- **Riesgo de alucinación de esquema**: como cualquier modelo generativo de SQL, puede inventar tablas o columnas inexistentes; es imprescindible validar contra el catálogo real y ejecutar en modo seco antes de lanzar la consulta.
- **Sesgo de dominio**: entrenado solo con Spider (consultas mayoritariamente en inglés, SQL de estilo SQLite y esquemas académicos), lo que reduce su rendimiento ante dialectos como T-SQL, PL/pgSQL o esquemas con convenciones muy distintas.
- **Ventana efectiva de entrenamiento de 2.048 tokens**: aunque el base soporte 32K, el adaptador nunca vio ejemplos tan largos; con esquemas grandes el comportamiento es impredecible.
- **Riesgo de olvido catastrófico**: el SFT sobre una única tarea puede degradar las capacidades generales de código e instrucciones del modelo base; conviene comparar antes y después.
- **Sin declaración de idiomas**: la model card no especifica idiomas; el soporte de preguntas en castellano no está verificado.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de mantenimiento.
- **Advertencia sobre la model card**: el ejemplo de `quick start` de la propia ficha está roto (usa `model="None"` y una pregunta genérica de viaje en el tiempo), señal de que es una plantilla autogenerada sin revisión.

## Enlaces

- [Ficha del adaptador en HuggingFace](https://huggingface.co/unbiasederudite/qwen2.5-coder-3b-text2sql-qlora)
- [Repositorio GitHub del proyecto (QLoRA text2sql)](https://github.com/unbiasederudite/qwen2.5-coder-text2sql-qlora)
- [Pipeline text2sql: datos, prompts, fine-tuning y scoring](https://github.com/unbiasederudite/qwen2.5-coder-text2sql-qlora/blob/main/src/text2sql/README.md)
- [Modelo base Qwen/Qwen2.5-Coder-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct)
- [Qwen/Qwen2.5-Coder-3B (pesos base)](https://huggingface.co/Qwen/Qwen2.5-Coder-3B)
- [Mirror comunitario EasierAI/Qwen-2.5-Coder-3B](https://huggingface.co/EasierAI/Qwen-2.5-Coder-3B)
- [Qwen2.5-Coder Technical Report (arXiv:2409.12186)](https://arxiv.org/html/2409.12186v2)
- [TRL: Transformers Reinforcement Learning (framework de entrenamiento)](https://github.com/huggingface/trl)
