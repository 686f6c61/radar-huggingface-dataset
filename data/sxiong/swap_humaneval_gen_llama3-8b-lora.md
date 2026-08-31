# sxiong/SWAP_HumanEval_Gen_Llama3-8B-LoRA

## Resumen

El modelo `sxiong/SWAP_HumanEval_Gen_Llama3-8B-LoRA` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Siheng Xiong y colaboradores como parte del framework SWAP (Structure-Aware Planning with an Accurate World Model). Este adaptador se entrena sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` y tiene como función específica la generación de soluciones de código para el benchmark HumanEval, un conjunto de problemas de programación creado por OpenAI para evaluar la capacidad de los modelos de lenguaje en la síntesis de programas a partir de docstrings.

El modelo se enmarca en la investigación sobre razonamiento deliberado en modelos de lenguaje, donde SWAP propone un enfoque de planificación estructurada con un modelo del mundo preciso. El adaptador actúa como componente generador dentro de este pipeline, produciendo candidatos de código que posteriormente se evalúan y refinan. Su relevancia radica en que demuestra cómo técnicas de adaptación ligera (LoRA) pueden especializar un modelo generalista de 8.000 millones de parámetros en tareas de razonamiento y generación de código sin necesidad de reentrenar todos los pesos.

El repositorio contiene únicamente los pesos del adaptador (0,2 GB) en formato safetensors, junto con la configuración PEFT necesaria para cargarlo sobre el modelo base. La licencia MIT permite su uso comercial sin restricciones, y el idioma soportado es exclusivamente inglés, coherente con el dominio de HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con adaptador LoRA sobre Llama-3-8B-Instruct |
| Parametros totales | no disponible (el adaptador LoRA añade un numero reducido de parametros sobre los 8.000 millones del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base, tipicamente 8.192 tokens en Llama-3-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bfloat16; el modelo base puede cuantizarse a 4/8 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 (alpha 16, bias `"none"`) aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del transformer Llama-3-8B-Instruct. Esta configuración permite ajustar el modelo base con un numero minimo de parametros entrenables, manteniendo los pesos originales congelados. El adaptador se entrena con el dataset `sxiong/SWAP`, un conjunto de datos diseñado para el framework SWAP, que combina problemas de HumanEval con el proceso de razonamiento estructurado que el metodo propone.

El entrenamiento se realiza mediante fine-tuning supervisado (SFT) sobre el modelo instruct, sin indicios de uso de RLHF o DPO en la informacion disponible. El framework SWAP, descrito en el paper "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (ACL 2025), introduce un mecanismo de planificacion que descompone el razonamiento en pasos estructurados, y este adaptador especifico se encarga de generar las soluciones de codigo candidatas. No se especifican el numero de tokens de entrenamiento ni la composicion exacta del dataset, aunque se infiere que esta centrado en problemas de programacion del estilo HumanEval.

## Capacidades

- Generacion de codigo: produce soluciones Python funcionales a partir de docstrings y firmas de funciones, siguiendo el formato de HumanEval.
- Razonamiento estructurado: integrado en el pipeline SWAP, el generador produce candidatos que luego se evaluan y refinan mediante un discriminador (no incluido en este repositorio).
- Conversacion y generacion de texto: al estar basado en Llama-3-8B-Instruct, conserva las capacidades generales de dialogo y generacion de texto del modelo base, aunque su especializacion principal es la tarea de codigo.
- Soporte de tool calling: no disponible (no se menciona en la informacion).
- Capacidades multilingues: no, solo ingles.
- Thinking mode: no disponible (el razonamiento estructurado se implementa a nivel del framework SWAP, no como un modo interno del modelo).

## Casos de uso

- Generacion de soluciones de programacion en entornos de evaluacion: el adaptador puede utilizarse para producir respuestas a problemas de HumanEval en pipelines de benchmarking, permitiendo comparar la calidad de generacion de codigo de distintos modelos o configuraciones.
- Componente de un sistema de razonamiento deliberado: dentro del framework SWAP, este generador se combina con un discriminador para iterar sobre soluciones candidatas, mejorando la precision en tareas de programacion competitiva o resolución de problemas algoritmicos.
- Fine-tuning rapido y ligero para dominios especificos: al ser un adaptador LoRA, sirve como ejemplo de como especializar un modelo grande con pocos recursos, util para equipos que necesitan adaptar Llama-3-8B-Instruct a tareas de codigo sin reentrenar todos los pesos.
- Asistente de programacion en ingles: aunque su entrenamiento esta orientado a HumanEval, puede emplearse como base para generar fragmentos de codigo Python a partir de descripciones en lenguaje natural, especialmente en contextos donde se requiera un comportamiento determinista y estructurado.
- Investigacion en metodos de adaptacion eficiente: el repositorio proporciona una implementacion de referencia para estudiar el impacto de LoRA en tareas de razonamiento y codigo, incluyendo la configuracion exacta de hiperparametros (r, alpha, target modules).
- Evaluacion de modelos de codigo: puede integrarse en suites de test como HumanEval para medir la capacidad de generacion de codigo de otros modelos, actuando como generador de referencia en comparativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta entrenado especificamente para HumanEval, pero no se proporcionan puntuaciones (pass@1, pass@10, etc.) ni comparaciones con otros modelos en la model card ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre Llama-3-8B-Instruct, la VRAM necesaria depende del modelo base. Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes), se puede ejecutar en GPUs con 8-10 GB de VRAM (como RTX 3080/4080). Sin cuantizacion, en bfloat16, se requieren aproximadamente 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB).
- GPU recomendadas: RTX 3090/4090 para uso local con cuantizacion; A100 o H100 para despliegue en produccion con mayor throughput.
- Compatibilidad con GPUs de consumo: si, con cuantizacion 4-bit cabe en GPUs de gama alta para consumidores (RTX 3080/4080 con 10-12 GB).
- Opciones de despliegue: el adaptador se carga mediante la libreria PEFT de HuggingFace, por lo que es compatible con transformers, vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF) y Ollama (mediante conversion). No se proporcionan datos de latencia o throughput.
- Nota: el adaptador en si es muy ligero (0,2 GB), por lo que el cuello de botella es el modelo base.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Parametros del adaptador | Licencia | Contexto |
|---|---|---|---|---|---|
| sxiong/SWAP_HumanEval_Gen_Llama3-8B-LoRA | Llama-3-8B-Instruct | Generacion HumanEval | LoRA r=16 | MIT | no disponible |
| sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA | Llama-3-8B-Instruct | Generacion GSM8K | LoRA (misma configuracion probable) | MIT | no disponible |
| sxiong/SWAP_v2_GSM8K_Disc_Llama3-8B-LoRA | Llama-3-8B-Instruct | Discriminador GSM8K | LoRA (version v2) | MIT | no disponible |

No se dispone de datos de rendimiento para comparar. Los tres adaptadores pertenecen al mismo framework SWAP y comparten base, pero se especializan en tareas distintas (HumanEval vs GSM8K) y roles (generador vs discriminador). No se han encontrado alternativas de terceros con la misma especializacion en HumanEval mediante LoRA.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre Llama-3-8B-Instruct, hereda los sesgos del modelo base, que pueden incluir preferencias culturales o linguisticas del corpus de entrenamiento original.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar codigo sintacticamente correcto pero semanticamente incorrecto, especialmente en problemas complejos o con especificaciones ambiguas.
- Limitaciones de contexto: la longitud de contexto no se especifica, pero se limita a la del modelo base (tipicamente 8.192 tokens), lo que restringe problemas de programacion muy largos o con multiples archivos.
- Limitaciones de idioma: solo soporta ingles, por lo que no es adecuado para generar codigo a partir de descripciones en otros idiomas.
- Especializacion estrecha: el adaptador esta disenado exclusivamente para HumanEval; su rendimiento en otros benchmarks de codigo (como MBPP o CodeContests) no esta garantizado y probablemente sea inferior.
- Dependencia del modelo base: requiere cargar Llama-3-8B-Instruct, cuyos pesos no se incluyen en este repositorio y estan sujetos a la licencia de Meta (Llama 3 Community License), que aunque permite uso comercial, tiene ciertas restricciones (por ejemplo, para usuarios con mas de 700 millones de usuarios mensuales).
- Sin garantias de produccion: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado en entornos reales. Se recomienda validar su comportamiento antes de usarlo en aplicaciones criticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sxiong/SWAP_HumanEval_Gen_Llama3-8B-LoRA
- Dataset SWAP: https://huggingface.co/datasets/sxiong/SWAP
- Repositorio GitHub de SWAP: https://github.com/xiongsiheng/SWAP
- Paper (ACL 2025): "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (referencia en la model card)
- Benchmark HumanEval (OpenAI): https://github.com/openai/human-eval
- Paper original de HumanEval: https://arxiv.org/pdf/2107.03374
- Adaptadores relacionados: https://huggingface.co/sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA y https://huggingface.co/sxiong/SWAP_v2_GSM8K_Disc_Llama3-8B-LoRA
