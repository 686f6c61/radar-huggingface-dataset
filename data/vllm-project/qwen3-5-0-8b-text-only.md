# vllm-project/Qwen3.5-0.8B-text-only

## Resumen

Qwen3.5-0.8B-text-only es una extraccion de los pesos del backbone de lenguaje del modelo multimodal Qwen/Qwen3.5-0.8B, publicada por el equipo de vLLM (vllm-project) como copia de seguridad del repositorio original de codecho. El objetivo es doble: por un lado, expone un checkpoint con arquitectura `Qwen3_5ForCausalLM` y `model_type: qwen3_5_text`, compatible directamente con la implementacion de vLLM para esta familia; por otro, elimina el codificador visual y los pesos MTP del modelo original, dejando unicamente el modelo de lenguaje causal.

El modelo conserva la arquitectura hibrida de Qwen3.5, que combina 24 capas de GatedDeltaNet (atencion lineal con estado recurrente) con 8 capas de atencion completa, sumando aproximadamente 0,8 mil millones de parametros en bfloat16. Los pesos estan reindexados al formato estandar de causal LM (`model.layers.*`), sin el prefijo `language_model.` que usan los checkpoints multimodales, lo que simplifica su carga en herramientas de inferencia que no esperan un envoltorio de generacion condicional.

Su relevancia es practica: sirve como checkpoint de referencia para las pruebas de integracion continua de vLLM sobre la arquitectura Qwen3.5 en su variante solo texto, y como punto de partida para desarrolladores que quieran desplegar la rama de lenguaje de Qwen3.5 en entornos donde la vision no es necesaria. La licencia Apache 2.0 y el formato safetensors facilitan su reutilizacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 24 capas GatedDeltaNet (atencion lineal) + 8 capas de atencion completa; transformer causal con `Qwen3_5ForCausalLM` |
| Parametros totales | 752.393.024 (~0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es una variante hibrida dentro de la familia Qwen3.5: 24 capas emplean GatedDeltaNet, un mecanismo de atencion lineal con estado recurrente que reduce el coste computacional y de memoria frente a la atencion cuadratica clasica, mientras que 8 capas mantienen atencion completa para preservar la capacidad de recuperacion exacta sobre el contexto. El checkpoint resultante tiene unos 752 millones de parametros y se distribuye en bfloat16, con un tamano de repositorio de 1,5 GB.

Este repositorio no entrena ningun modelo nuevo: es una conversion estructural del checkpoint original Qwen/Qwen3.5-0.8B. Se han eliminado el codificador visual y los pesos MTP (multi-token prediction), y las claves de pesos se han reescrito de `model.language_model.*` a `model.layers.*` para que encajen con la arquitectura `Qwen3_5ForCausalLM`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) aplicadas al modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto causal en la rama de lenguaje de Qwen3.5, sin componente visual.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.5-0.8B (no verificados de forma independiente en este checkpoint).
- Compatibilidad nativa con vLLM mediante la arquitectura `Qwen3_5ForCausalLM` y `model_type: qwen3_5_text`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): la vision se ha eliminado explicitamente en esta extraccion; el resto no esta documentado.

## Casos de uso

- Pruebas de integracion continua de vLLM: el repositorio existe precisamente para que el CI de vLLM valide la ruta de codigo de `Qwen3_5ForCausalLM` con un checkpoint estable y bajo control del propio proyecto, reduciendo el riesgo de cadena de suministro frente a depender de una cuenta personal.
- Despliegue de solo texto en entornos con recursos limitados: al eliminar el codificador visual, el checkpoint ocupa 1,5 GB y puede servirse en GPUs de gama media o incluso en CPU con cuantizacion posterior, para tareas de generacion de texto sin necesidad de imagenes.
- Prototipado rapido de aplicaciones de chat: la carga directa con `LLM(model=..., trust_remote_code=True)` permite levantar un servidor de inferencia en pocas lineas y evaluar el comportamiento de la familia Qwen3.5 antes de invertir en variantes mayores.
- Evaluacion comparativa de arquitecturas hibridas: investigadores que estudien el equilibrio entre GatedDeltaNet y atencion completa pueden usar este checkpoint como referencia a escala 0,8B, con una proporcion conocida de 24 capas lineales frente a 8 completas.
- Base para fine-tuning de tareas concretas: al ser un modelo pequeno con licencia Apache 2.0 y pesos safetensors estandar, es adecuado para ajuste supervisado en dominios especificos (clasificacion de texto, extraccion de entidades, resumen) con un solo acelerador.
- Referencia para pipelines de conversion de VLM a LLM: el repositorio documenta el proceso de reindexado de pesos y eliminacion de modulos, y sirve como plantilla para extraer la rama de lenguaje de otros modelos multimodales de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,5 GB solo para pesos, mas overhead de cache KV y activaciones; en la practica, menos de 4 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,8-1 GB de pesos; en 4 bits, alrededor de 0,4-0,5 GB (estimaciones teoricas, no verificadas con este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para bfloat16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y quedan sobradamente dimensionadas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna con 6 GB o mas para bfloat16.
- Opciones de despliegue: vLLM es la via documentada oficialmente (`Qwen3_5ForCausalLM`); llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vllm-project/Qwen3.5-0.8B-text-only | ~0,75B | no disponible | Hibrida (GatedDeltaNet + atencion completa), solo texto | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible | no disponible | Hibrida multimodal (VLM) | no disponible en la informacion | HuggingFace |
| codecho/Qwen3.5-0.8B-text-only (original) | ~0,75B | no disponible | Hibrida, solo texto | Apache 2.0 | HuggingFace (cuenta personal) |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de otros fabricantes; la comparativa se limita a las variantes directas del mismo modelo base.

## Limitaciones y advertencias

- No es un modelo entrenado de forma independiente: es una conversion estructural del checkpoint Qwen3.5-0.8B, por lo que hereda sus sesgos y tasas de alucinacion sin que se hayan documentado en esta ficha.
- La eliminacion del codificador visual implica perdida total de capacidades multimodales; no debe usarse en tareas que requieran imagenes.
- No se documentan los idiomas soportados ni el tamano de contexto, lo que impide garantizar un comportamiento multilingue o contextos largos sin validacion previa.
- Con ~0,75B de parametros, la capacidad de razonamiento y la fiabilidad factual son limitadas en comparacion con modelos de mayor escala; conviene validar las salidas en produccion.
- El repositorio se describe como copia de un checkpoint de una cuenta personal para uso del CI de vLLM; no hay garantia explicita de mantenimiento a largo plazo ni de soporte oficial por parte de Qwen.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificarse tambien contra las condiciones del modelo base original.
- Requiere `trust_remote_code=True` en vLLM, lo que implica ejecutar codigo remoto del repositorio; conviene auditar la revision concreta antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vllm-project/Qwen3.5-0.8B-text-only
- Repositorio original: https://huggingface.co/codecho/Qwen3.5-0.8B-text-only
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Proyecto vLLM: https://github.com/vllm-project/vllm
