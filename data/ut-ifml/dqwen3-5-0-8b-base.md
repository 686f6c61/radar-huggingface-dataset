# UT-IFML/dQwen3.5-0.8B-Base

## Resumen

dQwen3.5-0.8B-Base es un modelo de lenguaje de difusión enmascarada (masked diffusion language model) desarrollado por UT-IFML, un grupo de investigacion vinculado a la Universidad de Texas. Se obtiene adaptando el modelo autorregresivo Qwen3.5-0.8B a un paradigma de difusion: en lugar de generar tokens de izquierda a derecha, el modelo decodifica todo un lienzo de texto de forma paralela, comprometiendo posiciones cuando la confianza supera un umbral. La innovacion principal reside en su backbone hibrido: solo las capas de atencion se convierten en bidireccionales, mientras que las capas Gated DeltaNet permanecen causales.

Con 752 millones de parametros totales y un tamano de repositorio de 3,0 GB, es el miembro mas pequeno de la familia dQwen3.5, que incluye variantes de 2B, 4B y 9B, ademas de un control dQwen3-1.7B con atencion completa. Es un modelo base sin ajuste por instrucciones, pensado para investigacion sobre decodificacion no autorregresiva y para servir como punto de partida de experimentos de difusion sobre arquitecturas hibridas.

Su relevancia actual radica en que demuestra que es posible convertir un transformer hibrido moderno (atencion + capas de estado recurrente lineal) en un modelo de difusion sin reentrenar desde cero, manteniendo la licencia Apache 2.0 y la compatibilidad con el ecosistema transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con difusion enmascarada: capas de atencion bidireccionales y capas Gated DeltaNet causales |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y `transformers>=5.13`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y sustituye el objetivo autorregresivo por un objetivo de difusion enmascarada. El backbone es hibrido: las capas de atencion pasan a ser bidireccionales para permitir que cada posicion del lienzo vea el contexto completo, mientras que las capas Gated DeltaNet (un mecanismo de estado recurrente lineal) se mantienen causales. Esta asimetria es la contribucion central del paper "dQwen3.5: Hybrid-Attention Diffusion Language Models" (arXiv:2609.20751). El checkpoint publicado corresponde a un entrenamiento de 50.000 pasos sobre 50.000 millones de tokens, disponible bajo la revision `step25000-swa` (con promedio de pesos tipo SWA).

La decodificacion es no autorregresiva: la funcion `generate` decodifica el lienzo completo a la vez y compromete las posiciones cuya confianza supera `conf_threshold=0.9` (el parametro tau del paper). La confianza se calcula por defecto como la probabilidad top-1 de cada posicion (`conf_source="top1"`); alternativamente puede usarse la probabilidad del token muestreado (`conf_source="sampled"`), opcion que solo difiere cuando se muestrea con temperatura mayor que cero. Tambien admite decodificacion por bloques de izquierda a derecha (`block_length=32`) o un presupuesto fijo de pasos por bloque (`steps_per_block=k`). El modelo es un base model: no ha pasado por RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto mediante decodificacion por difusion enmascarada, con decodificacion paralela del lienzo completo.
- Generacion de codigo: la model card incluye un ejemplo de continuacion de funciones Python (`def fibonacci(n):`), lo que sugiere entrenamiento sobre corpus de codigo.
- Extraccion de caracteristicas (tag `feature-extraction` en el repositorio), gracias a las representaciones bidireccionales de las capas de atencion.
- Decodificacion configurable: modo paralelo con umbral de confianza, modo por bloques y modo con presupuesto fijo de pasos.
- Soporte de `stop_strings` para controlar la finalizacion de la generacion.
- No dispone de ajuste por instrucciones, tool calling, modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en modelos de difusion para texto: el modelo sirve como banco de pruebas a escala 0,75B para comparar decodificacion paralela frente a autorregresiva con el mismo backbone, ya que la familia incluye el control dQwen3-1.7B con atencion completa.
- Generacion de codigo en lote: con `block_length=32` o decodificacion por bloques se pueden rellenar plantillas de funciones o completar fragmentos de codigo en pipelines offline donde el throughput importa mas que la latencia interactiva.
- Relleno de texto (infilling) y tareas de denoising: el objetivo de difusion enmascarada es natural para reconstruir pasajes con huecos, util en preprocesado de corpus y aumento de datos.
- Extraccion de embeddings para clasificacion o clustering: las capas de atencion bidireccionales producen representaciones contextuales completas, aprovechables en tareas de recuperacion o etiquetado sobre dominios especializados.
- Fine-tuning como base para tareas downstream: al ser un base model con licencia Apache 2.0, se puede ajustar con SFT o LoRA para tareas concretas sin restricciones de uso comercial.
- Experimentos de eficiencia computacional: comparar el coste de decodificar N tokens con difusion paralela frente a generacion autorregresiva token a token en el mismo hardware, para estudiar el compromiso entre calidad y latencia.
- Educacion y divulgacion: ejemplo reproducible de como convertir un transformer hibrido en un modelo de difusion, con codigo abierto en GitHub y paper asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,5 GB solo para pesos (752M parametros x 2 bytes), mas overhead de activaciones y del lienzo de decodificacion; en la practica, entre 2 y 4 GB segun longitud del lienzo y tamano de bloque.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4-8 GB de VRAM. El autor indica que requiere GPU CUDA y ha probado con `torch 2.7.1+cu128` y `flash-linear-attention 0.5.1`.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090. Tambien en GPUs de 8 GB con margen suficiente para lienzos moderados.
- Opciones de despliegue: la model card solo documenta `transformers>=5.13` con `trust_remote_code=True` y `AutoModel`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el codigo personalizado y la decodificacion por difusion hacen poco probable un soporte directo en estos motores sin adaptaciones.
- Latencia y throughput: no disponibles. La decodificacion paralela del lienzo completo puede reducir el numero de pasos frente a la generacion autorregresiva, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dQwen3.5-0.8B-Base | 0,75B | no disponible | Difusion enmascarada, backbone hibrido | Apache 2.0 | Hugging Face (UT-IFML) |
| dQwen3.5-2B-Base | 1,88B | no disponible | Difusion enmascarada, backbone hibrido | Apache 2.0 | Hugging Face (UT-IFML) |
| dQwen3-1.7B-Base | 1,72B | no disponible | Difusion enmascarada, atencion completa (control) | Apache 2.0 | Hugging Face (UT-IFML) |
| Qwen3.5-0.8B (modelo base original) | no disponible en la informacion | no disponible | Autorregresivo | no disponible en la informacion | Hugging Face (Qwen) |

La comparacion mas directa es con el control dQwen3-1.7B-Base, que permite aislar el efecto del backbone hibrido frente a la atencion completa dentro del mismo paradigma de difusion. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable y no debe usarse directamente en produccion como asistente conversacional.
- Riesgo de alucinacion: al ser un modelo de 0,75B entrenado sobre 50.000 millones de tokens, su conocimiento factual es limitado y puede generar contenido incorrecto con alta confianza.
- La decodificacion por difusion puede producir texto incoherente si el umbral de confianza o el tamano de bloque no se ajustan a la tarea; el autor recomienda validar los parametros `conf_threshold`, `block_length` y `steps_per_block`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor del repositorio; conviene auditar el codigo antes de desplegarlo en entornos sensibles.
- Dependencia de versiones concretas de librerias (`transformers>=5.13`, `flash-linear-attention 0.5.1`, CUDA); la compatibilidad con versiones futuras no esta garantizada.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del ingles ni de los idiomas presentes en el corpus de entrenamiento de Qwen3.5-0.8B.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero heredables del corpus del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye como material de investigacion sin garantias de idoneidad para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/UT-IFML/dQwen3.5-0.8B-Base
- Paper: https://arxiv.org/abs/2609.20751
- Codigo: https://github.com/AntonXue/dQwen
- Modelo hermano dQwen3.5-2B-Base: https://huggingface.co/UT-IFML/dQwen3.5-2B-Base
- Modelo hermano dQwen3.5-4B-Base: https://huggingface.co/UT-IFML/dQwen3.5-4B-Base
- Modelo hermano dQwen3.5-9B-Base: https://huggingface.co/UT-IFML/dQwen3.5-9B-Base
- Modelo control dQwen3-1.7B-Base: https://huggingface.co/UT-IFML/dQwen3-1.7B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
