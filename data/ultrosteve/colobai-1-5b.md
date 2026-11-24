# UltroSteve/ColobAI-1.5B

## Resumen

ColobAI-1.5B es un ajuste fino (finetune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario UltroSteve en Hugging Face. Se trata de un modelo de generacion de texto de tipo decoder-only basado en la arquitectura Qwen2, con 1.543.714.304 parametros totales y un enfoque conversacional. El modelo parte de la version cuantizada a 4 bits del instructivo original de Qwen (unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit) y fue entrenado con la libreria Unsloth junto con TRL de Hugging Face.

La relevancia de este modelo es limitada dentro del ecosistema: se trata de un finetune comunitario sin documentacion tecnica sobre el dataset de entrenamiento, sin resultados de benchmarks publicados y sin casos de uso descritos por el autor. Su interes principal radica en ser un ejemplo de flujo de trabajo de ajuste fino rapido con Unsloth sobre un modelo base pequeno, adecuado para experimentacion en entornos con recursos limitados.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y esta etiquetado unicamente para el idioma ingles. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el proceso de alineacion aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado para este finetune) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba cuantizado a 4 bits con bitsandbytes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar, mecanismos de attention con RoPE y capas de normalizacion RMSNorm. Con 1.500 millones de parametros, se situa en la categoria de modelos pequenos orientados a inferencia en hardware de consumo. El modelo base es la version instructiva de Qwen2.5-1.5B, que incorpora tecnicas de alineacion del modelo original de Qwen, aunque este finetune no documenta que proceso de alineacion adicional se haya aplicado.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la model card. El autor afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth, pero no se especifica el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni la configuracion de hiperparametros. Tampoco se detalla si se aplicaron tecnicas como LoRA, QLoRA u otro tipo de adaptacion. La falta de esta informacion impide evaluar la calidad y el alcance del ajuste.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, condicionado por el finetune aplicado.
- Generacion de codigo y matematicas a nivel de modelo pequeno, sin datos especificos publicados para este finetune.
- Soporte de tool calling y function calling: no confirmado para este finetune (el modelo base Qwen2.5 lo soporta, pero no hay evidencia de que se haya preservado).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la etiqueta del modelo.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion con ajuste fino: el modelo sirve como referencia para reproducir flujos de trabajo con Unsloth y TRL sobre modelos pequenos, comparando el comportamiento antes y despues del finetune.
- Prototipado de chatbots en ingles: por su tamano de 1.500 millones de parametros, puede ejecutarse en GPU de consumo para validar interfaces conversacionales antes de migrar a modelos mayores.
- Generacion de texto en entornos con recursos limitados: adecuado para tareas de resumen o redaccion simple donde no se requiere alta precision y se dispone de poca VRAM.
- Educacion e investigacion: util como caso de estudio de finetunes comunitarios sin documentacion, para analizar riesgos de calidad y sesgos en modelos pequenos.
- Pruebas de despliegue con TGI o transformers: el modelo incluye tags de text-generation-inference y endpoints_compatible, lo que facilita su integracion en pipelines de prueba.
- Base para nuevos finetunes: al estar bajo Apache 2.0 y ser de tamano reducido, puede servir como punto de partida para ajustes especificos de dominio en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para los pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 4-6 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion a 8 bits: alrededor de 1,6 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion a 4 bits: alrededor de 0,9-1 GB para pesos, con overhead adicional.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor volumen.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas de VRAM en fp16, y en GPUs de 4 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp (previa conversion a GGUF), Ollama (previa conversion), vLLM.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ColobAI-1.5B | 1.543.714.304 | no disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.500 millones (aprox.) | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | Hugging Face |
| Llama 3.2 1B Instruct | 1.200 millones (aprox.) | 128.000 tokens (segun documentacion de Meta) | Llama 3.2 Community License | Hugging Face |
| SmolLM2-1.7B-Instruct | 1.700 millones (aprox.) | 8.192 tokens (segun documentacion de Hugging Face) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para ColobAI-1.5B, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos, calidad y posibles comportamientos indeseados.
- Riesgo elevado de alucinacion, inherente a modelos pequenos y agravado por la falta de validacion publicada del finetune.
- Capacidades limitadas al ingles segun la etiqueta del modelo; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto no confirmada para este finetune; podria diferir de la del modelo base.
- Sin benchmarks publicados: no hay evidencia objetiva de mejora respecto al modelo base.
- El modelo base de partida estaba cuantizado a 4 bits, lo que puede introducir perdida de calidad adicional en el finetune.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de garantias y documentacion desaconseja su uso en produccion sin una evaluacion exhaustiva previa.
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/UltroSteve/ColobAI-1.5B
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
