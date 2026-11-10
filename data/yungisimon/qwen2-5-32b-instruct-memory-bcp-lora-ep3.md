# yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep3

## Resumen

yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep3 es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "modelo de memoria" (memory model) sobre pares sinteticos de pregunta-respuesta generados a partir de BrowseComp-Plus, un conjunto de datos orientado a tareas de recuperacion y memorizacion de informacion. El checkpoint corresponde a la epoca 3 de 3 de un entrenamiento con LoRA que posteriormente se ha fusionado en los pesos base.

El modelo resuelve un problema concreto: dotar a un LLM de 32.000 millones de parametros de una capacidad reforzada para memorizar y recuperar informacion factual procedente de documentos, algo relevante en pipelines de recuperacion aumentada (RAG) y en agentes que necesitan retener contexto entre turnos. Al estar construido sobre Qwen2.5-32B-Instruct, hereda la arquitectura transformer densa, la ventana de contexto de 32.768 tokens y las capacidades de instruccion, tool calling y multilingueismo del modelo original.

Es relevante ahora porque los ajustes finos especializados en memoria sobre modelos abiertos de gran tamano permiten experimentar con tecnicas de memoria parametrica sin depender de APIs propietarias. No obstante, se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card extendida, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, con atencion causal |
| Parametros totales | 32.763.876.352 (32,8 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-32B-Instruct; el entrenamiento uso 8.096 tokens maximos) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ mediante herramientas estandar |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5-32B-Instruct soporta chino, ingles y otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), con adaptador LoRA sin fusionar en `lora_adapter/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only denso con atencion causal, RoPE, normalizacion RMSNorm y activacion SwiGLU, sin mezcla de expertos. El ajuste fino se realizo con LoRA de rango 32, alpha 64 y dropout 0,05 aplicado a las proyecciones q, k, v, o, gate, up y down, lo que supone 268.435.456 parametros entrenables (0,81% del total). El entrenamiento uso un batch efectivo de 1.024 (128 por dispositivo, 1 paso de acumulacion, 8 GPUs), learning rate constante de 0,0002 con warmup del 5%, weight decay 0,01, max grad norm 1,0, precision bf16, gradient checkpointing y calculo de perdida solo sobre tokens del asistente. La longitud maxima de secuencia durante el entrenamiento fue de 8.096 tokens.

El dataset de entrenamiento son pares sinteticos de QA derivados de BrowseComp-Plus (`bcp_subset300_numsamplingepochs1_crossdoc_entity_combination_v3.json`), con 2.968.214 ejemplos, orientados a combinacion de entidades entre documentos y a memorizacion de contenido. Se completaron 3 epocas en 19,20 horas de reloj (153,6 GPU-horas) sobre 8 AMD Instinct MI325X. El adaptador LoRA se fusiono en los pesos base y se conserva una copia sin fusionar en el subdirectorio `lora_adapter/`. No se documenta uso de RLHF, DPO ni otras fases de alineacion adicionales mas alla de las ya presentes en Qwen2.5-32B-Instruct.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct y reforzada en tareas de recuperacion de informacion memorizada.
- Memoria parametrica de contenido documental: el ajuste esta disenado para retener y recuperar entidades y hechos procedentes de documentos sinteticos de BrowseComp-Plus.
- Razonamiento y respuesta a preguntas factuales, incluyendo combinacion de entidades entre documentos distintos (cross-document entity combination).
- Soporte de tool calling y function calling, heredado del modelo base Qwen2.5.
- Capacidades de agente y razonamiento multi-paso, heredadas del modelo base.
- Capacidades multilingues del modelo base (chino, ingles y otros), aunque la model card no detalla el conjunto exacto ni garantiza el rendimiento tras el ajuste.
- No se documenta soporte de vision, audio ni modo "thinking" explicito en esta variante.

## Casos de uso

- Recuperacion aumentada con memoria parametrica: usar el modelo como capa de memorizacion de hechos extraidos de un corpus documental, de modo que responda a preguntas factuales sin recuperar el documento original en cada consulta. Es adecuado porque el entrenamiento se ha realizado especificamente sobre pares QA derivados de documentos.
- Atencion al cliente con base de conocimiento interna: el modelo puede gestionar conversaciones multi-turno y retener informacion de productos o politicas previamente memorizada durante el ajuste, reduciendo la dependencia de busquedas en tiempo real.
- Asistente de investigacion documental: combinacion de entidades entre documentos distintos, util para responder preguntas que requieren cruzar informacion de varias fuentes.
- Generacion de resumenes y extraccion de entidades: al haber sido entrenado sobre combinacion de entidades, puede emplearse para tareas de extraccion y consolidacion de informacion estructurada a partir de texto.
- Evaluacion de tecnicas de memoria parametrica: sirve como checkpoint de referencia para comparar estrategias de memorizacion en LLMs abiertos de 32B, con adaptador LoRA disponible para reproducir o modificar el ajuste.
- Integracion en pipelines de agentes con tool calling: el modelo hereda la capacidad de invocar funciones, por lo que puede encadenarse con herramientas de busqueda o calculo en flujos multi-paso.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia apache-2.0 permite uso comercial y modificacion, lo que facilita su adopcion en productos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 80 GB para secuencias largas.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 33-35 GB, apto para GPUs de 48 GB.
- VRAM estimada con cuantizacion de 4 bits: alrededor de 17-20 GB, apto para GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen limitado para contextos largos.
- GPUs recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, AMD MI300X/MI325X para bf16; RTX 4090 o RTX 3090 para cuantizacion 4 bits.
- Opciones de despliegue: transformers con `AutoModelForCausalLM.from_pretrained`, vLLM, TGI (el tag `text-generation-inference` esta presente), llama.cpp/Ollama tras conversion a GGUF, y AWQ/GPTQ para cuantizacion.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep3 | 32,8 B | 32.768 tokens (entrenamiento 8.096) | apache-2.0 | Ajuste fino especializado en memoria sobre BrowseComp-Plus; sin benchmarks publicados |
| Qwen/Qwen2.5-32B-Instruct | 32,8 B | 32.768 tokens | apache-2.0 | Modelo base oficial, con benchmarks publicados y mantenimiento activo |
| Qwen/Qwen2.5-14B-Instruct | 14,7 B | 32.768 tokens | apache-2.0 | Alternativa de menor tamano, menor coste de inferencia |
| meta-llama/Llama-3.1-8B-Instruct | 8,0 B | 131.072 tokens | Llama 3.1 Community License | Menor tamano, contexto mucho mayor, licencia con restricciones |

La comparativa con Qwen2.5-32B-Instruct es directa: esta variante parte de ella y anade un ajuste especifico en memoria, pero pierde la documentacion y los benchmarks del modelo original. Para tareas generales, el modelo base es la opcion de referencia; para experimentos de memoria parametrica, esta variante aporta valor.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- No se han publicado benchmarks, por lo que no es posible comparar su rendimiento con el modelo base ni con alternativas.
- El ajuste se ha realizado sobre un dataset sintetico y especifico (BrowseComp-Plus), lo que puede provocar sobreajuste a ese dominio y degradacion en tareas generales.
- La longitud de contexto usada en entrenamiento (8.096 tokens) es inferior a la ventana nativa del modelo base (32.768 tokens); el rendimiento con contextos largos no esta verificado.
- No se detalla el conjunto de idiomas soportados tras el ajuste; el multilingueismo heredado puede no mantenerse intacto.
- Riesgo de alucinacion inherente a los LLM, especialmente al recuperar informacion memorizada de forma parametrica sin verificacion contra fuentes.
- Posibles sesgos procedentes del dataset sintetico y del modelo base; no se documentan evaluaciones de sesgo.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el checkpoint antes de produccion.
- El repositorio ocupa 66,6 GB e incluye tanto los pesos fusionados como el adaptador LoRA sin fusionar, lo que duplica parcialmente el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep3
- Modelo base Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Documentacion de transformers: https://huggingface.co/docs/transformers
- vLLM: https://github.com/vllm-project/vllm
- llama.cpp: https://github.com/ggerganov/llama.cpp
