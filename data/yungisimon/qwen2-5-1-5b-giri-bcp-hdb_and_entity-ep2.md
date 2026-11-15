# yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep2

## Resumen

Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep2 es un ajuste fino completo (full fine-tuning) del modelo instructivo Qwen2.5-1.5B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model" sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus, un conjunto orientado a tareas de recuperacion y consolidacion de memoria a partir de documentos. El checkpoint corresponde a la epoca 2 de 3 del entrenamiento.

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso de 1.543.714.304 parametros (aproximadamente 1,54 mil millones), con licencia Apache 2.0 y pesos en safetensors bf16 compatibles con `transformers`. El ajuste no modifica la arquitectura, solo los pesos, mediante FSDP sobre 8 aceleradores AMD Instinct MI325X.

Su relevancia es acotada pero especifica: explora el uso de modelos pequenos como memoria externa estructurada en pipelines de agentes, aplicando clustering HDBSCAN combinado con agrupacion por entidades para construir los ejemplos de entrenamiento. No es un modelo de proposito general ni compite en benchmarks abiertos; es un artefacto de investigacion reproducible con receta de entrenamiento documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (entrenado con max sequence length 8096) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con cuantizacion estandar de transformers/llama.cpp, no verificada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion causal estandar y RoPE, sin mezcla de expertos ni mecanismos hibridos. El ajuste fino es completo: los 1.543.714.304 parametros son entrenables (100,00%), sin LoRA ni adaptadores. El entrenamiento se realizo con FSDP en 8 GPU AMD Instinct MI325X, con batch efectivo de 1024 (128 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate constante de 2e-05 con warmup del 5%, weight decay 0.01, max grad norm 1.0, precision bf16, gradient checkpointing y calculo de perdida solo sobre los tokens del asistente. La longitud maxima de secuencia fue de 8096 tokens y el entrenamiento completo de 3 epocas tardo 2,35 horas (18,8 GPU-hora).

Los datos de entrenamiento son pares sinteticos de QA derivados de BrowseComp-Plus, agrupados mediante el metodo `hdb_and_entity`: clustering HDBSCAN con tamano minimo de cluster 2 combinado con agrupacion por entidades con frecuencia documental maxima 3. El fichero de datos referenciado contiene 3.671.014 ejemplos (`bcp_subset300_numsamplingepochs1_hdbscan_mcs2_and_entity_maxdf3_crossdoc_entity_combination_v3.json`). No se documenta el uso de RLHF, DPO ni preferencias humanas; el objetivo es aprendizaje supervisado sobre la tarea de memoria.

## Capacidades

- Generacion de texto conversacional heredada de Qwen2.5-1.5B-Instruct, con plantilla de chat Qwen.
- Funcion como "memory model": consolidacion y recuperacion de informacion a partir de pares QA construidos por clustering y agrupacion de entidades.
- Razonamiento sobre documentos agrupados por entidad, orientado a tareas de agregacion cross-documento.
- Soporte de tool calling y function calling: no documentado especificamente en este checkpoint; heredado potencialmente del modelo base, sin verificacion.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Memoria estructurada en agentes: el modelo puede almacenar y recuperar hechos consolidados por entidad generados en pipelines de agentes, aprovechando el entrenamiento sobre clusters HDBSCAN y agrupaciones por entidad.
- Resumen de conjuntos documentales: util para condensar informacion de multiples documentos relacionados en una respuesta unica, dado el entrenamiento sobre combinaciones cross-documento.
- Experimentacion academica en memoria de modelos: sirve como checkpoint reproducible para estudiar como un modelo de 1,5B se comporta como almacen de memoria frente a recuperacion clasica (RAG).
- Prototipado de QA sobre corpus sinteticos: adecuado para validar pipelines de generacion de datos y evaluacion antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: con 1,54B parametros en bf16 (unos 3,1 GB de pesos) cabe en GPU de consumo, lo que permite iterar rapidamente en pruebas de concepto.
- Base para nuevos ajustes finos: al ser un full fine-tune con licencia Apache 2.0, puede reutilizarse como punto de partida para tareas de memoria especificas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en bf16 solo para pesos; en la practica, entre 4 y 6 GB con cache KV para contextos moderados. En cuantizacion de 8 bits, en torno a 1,6 GB; en 4 bits, en torno a 0,8-1 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100 o MI325X para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM y llama.cpp/Ollama previa conversion a GGUF (no verificada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep2 | 1,54B | no disponible (entrenado a 8096) | Apache 2.0 | Full fine-tune como memory model; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun documentacion de Qwen2.5) | Apache 2.0 | Modelo base instructivo de proposito general |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens (segun documentacion de Qwen2.5) | Apache 2.0 | Modelo base preentrenado, sin ajuste instructivo |
| Meta Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamano similar con licencia mas restrictiva |

La comparacion de rendimiento con benchmarks no esta disponible para el modelo ajustado; el modelo base Qwen2.5-1.5B-Instruct publica resultados propios en la model card oficial de Qwen, no reproducidos aqui.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; hereda los sesgos del modelo base Qwen2.5-1.5B-Instruct y de los datos sinteticos de BrowseComp-Plus.
- Riesgo de alucinacion: elevado en un modelo de 1,5B, especialmente en tareas de memoria y recuperacion factual; el entrenamiento sobre datos sinteticos puede amplificar errores sistematicos.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados; el entrenamiento uso secuencias de hasta 8096 tokens, por lo que contextos mayores no estan garantizados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base y de los datos derivados de BrowseComp-Plus.
- Caveats para produccion: checkpoint intermedio (epoca 2 de 3), sin evaluacion publicada, sin model card detallada de comportamiento, con 0 descargas y 0 likes; no recomendado para produccion sin validacion propia.
- El nombre del modelo incluye un termino despectivo en castellano ("giri") que puede resultar ofensivo; se recomienda no reutilizarlo en contextos profesionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- BrowseComp-Plus: no disponible en la informacion proporcionada
- HDBSCAN: https://hdbscan.readthedocs.io/
