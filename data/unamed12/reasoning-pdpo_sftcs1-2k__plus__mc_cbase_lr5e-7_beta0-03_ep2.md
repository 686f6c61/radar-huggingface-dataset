# unamed12/reasoning-pdpo_sftcs1.2k__plus__mc_cbase_lr5e-7_beta0.03_ep2

## Resumen

`unamed12/reasoning-pdpo_sftcs1.2k__plus__mc_cbase_lr5e-7_beta0.03_ep2` es un ajuste fino (fine-tune) completo del modelo base Qwen/Qwen3-8B, publicado por el usuario unamed12 en Hugging Face. Se trata de un experimento de entrenamiento orientado a razonamiento, cuyo nombre codifica la receta empleada: una combinacion de SFT sobre un conjunto de aproximadamente 1.2k ejemplos (`sftcs1.2k`) mas un componente adicional (`plus__mc`), con una tasa de aprendizaje de 5e-7, un coeficiente beta de 0.03 (habitual en metodos tipo DPO/PDO) y 2 epocas de entrenamiento.

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con aproximadamente 8 mil millones de parametros, y se distribuye en formato safetensors para su uso con la libreria transformers. El repositorio ocupa 131.1 GB, un tamano desproporcionado respecto a los ~16 GB que ocuparian los pesos en bf16 de un modelo de 8B, lo que sugiere la presencia de multiples checkpoints o artefactos de entrenamiento intermedios en el repositorio.

Su relevancia es limitada y de caracter experimental: cuenta con cero descargas y cero likes, el acceso esta restringido (gated) y la model card no aporta informacion sobre datos de entrenamiento, idiomas o evaluacion. No obstante, resulta interesante como ejemplo de pipeline de ajuste fino con llama-factory sobre Qwen3-8B para tareas de razonamiento, y como referencia para quienes exploren recetas de PDO/DPO combinadas con SFT en modelos de 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parametros totales | 308.224 (segun safetensors del repo; el modelo base Qwen3-8B tiene ~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de la familia Qwen3, y ha sido sometido a un ajuste fino completo (tag `full` en Hugging Face, no LoRA/QLoRA), segun indica la etiqueta `llama-factory` y `generated_from_trainer`. La nomenclatura del repositorio sugiere una receta que combina SFT sobre un conjunto de aproximadamente 1.2k ejemplos con un metodo de preferencia (DPO o PDO, dado el prefijo `pdpo` y el parametro `beta0.03`), entrenado durante 2 epocas con learning rate 5e-7.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF adicional ni detalles sobre innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). Todo lo relativo a la receta concreta debe considerarse inferido del nombre del repositorio y de las etiquetas, no confirmado por documentacion oficial.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-8B.
- Razonamiento multi-paso y modo "thinking", presumiblemente preservado del base Qwen3 (no verificado en la model card).
- Soporte de tool calling / function calling: no confirmado para este fine-tune concreto.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de codigo y matematicas: no verificadas para este fine-tune.
- Capacidades de agente: no confirmadas.

## Casos de uso

- Experimentacion en investigacion sobre recetas de razonamiento: el modelo sirve como punto de partida para reproducir o comparar combinaciones de SFT + DPO/PDO sobre Qwen3-8B, dado que el nombre del repositorio documenta hiperparametros concretos (lr 5e-7, beta 0.03, 2 epocas).
- Evaluacion de ajustes finos de bajo volumen de datos: con ~1.2k ejemplos de SFT, es util para estudiar como afecta un dataset pequeno al comportamiento de razonamiento de un modelo de 8B.
- Base para fine-tuning posterior: al ser un ajuste completo en safetensors, puede cargarse con transformers y servir como punto de partida para nuevos entrenamientos con llama-factory u otras herramientas.
- Comparativa de metodos de preferencia: permite contrastar el efecto del parametro beta y del numero de epocas frente a otros checkpoints del mismo autor (por ejemplo, `reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2` o `reasoning-pdpo_sftccs1.6k_cbase_lr7e-7_beta0.05`).
- Despliegue experimental con text-generation-inference: el tag `text-generation-inference` y `endpoints_compatible` indica compatibilidad con TGI para pruebas de inferencia.
- Analisis de robustez y alucinacion en modelos ajustados con datos escasos: util para estudiar el impacto de un SFT reducido en la fidelidad de las respuestas.

## Benchmarks y rendimiento

El model-index declarado por el autor no contiene resultados:

| Benchmark | Resultado |
|---|---|
| (ninguno declarado) | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~16 GB para los pesos de un modelo de 8B (el repo reporta 308.224 parametros en safetensors, dato inconsistente con el base Qwen3-8B; se asume el tamano del base).
- VRAM estimada en cuantizacion 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB (estimaciones estandar para un modelo de 8B, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 de un 8B.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en bf16 y en GPUs de 8-12 GB con cuantizacion (si se generan pesos GGUF, no publicados).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente). No hay GGUF ni soporte Ollama/llama.cpp publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (unamed12/reasoning-pdpo...) | ~8B (base Qwen3-8B) | no disponible | other (gated) | Restringida, 0 descargas |
| Qwen/Qwen3-8B | ~8B | no disponible en esta ficha | no disponible en esta ficha | Publico en Hugging Face |
| unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2 | 308k (reportado) | no disponible | no disponible | Publico, mismo autor |
| unamed12/reasoning-pdpo_sftccs1.6k_cbase_lr7e-7_beta0.05 | 308k (reportado) | no disponible | no disponible | Publico, mismo autor |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Licencia "other": no se especifican terminos de uso comercial; debe revisarse el acuerdo asociado antes de cualquier despliegue en produccion.
- Inconsistencia en el conteo de parametros: el repo declara 308.224 parametros en safetensors frente a los ~8B del base Qwen3-8B, lo que sugiere un error de metadatos o la presencia de artefactos no estandar.
- Repositorio de 131.1 GB: el tamano es muy superior al esperado para un 8B en bf16, probablemente por checkpoints intermedios; conviene revisar los archivos antes de descargar.
- Sin informacion sobre idiomas, sesgos, datos de entrenamiento ni evaluacion: riesgo elevado de alucinacion y comportamiento impredecible fuera del dominio de entrenamiento.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni validacion externa.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- Fine-tune experimental: no debe considerarse un modelo listo para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unamed12/reasoning-pdpo_sftcs1.2k__plus__mc_cbase_lr5e-7_beta0.03_ep2
- Perfil del autor: https://huggingface.co/unamed12
- Modelo relacionado (mismo autor): https://huggingface.co/unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2
- Modelo relacionado (mismo autor): https://huggingface.co/unamed12/reasoning-pdpo_sftccs1.6k_cbase_lr7e-7_beta0.05
