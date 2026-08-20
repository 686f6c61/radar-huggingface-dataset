# sworge/poc-custom-arch

## Resumen

Este modelo es una prueba de concepto publicada por el usuario sworge bajo el identificador `poc-custom-arch`. Se basa en Qwen/Qwen2.5-0.5B, un modelo de lenguaje causal de 494 millones de parametros desarrollado originalmente por Alibaba Cloud, y se presenta como un fine-tune del modelo base. El repositorio sugiere por su nombre una arquitectura personalizada, pero la model card no documenta ninguna modificacion concreta: el README es una copia literal de la ficha de Qwen2.5-0.5B-Instruct, sin informacion adicional sobre cambios estructurales o de entrenamiento.

El modelo esta orientado a generacion de texto conversacional y hereda la arquitectura transformer de Qwen2.5 con RoPE, SwiGLU, RMSNorm y atencion GQA. Con 0,49B de parametros y una ventana de contexto declarada de 32.768 tokens, es un modelo ligero pensado para experimentacion y validacion de ideas, no para despliegues de produccion exigentes. Su relevancia reside en demostrar como se puede publicar un fine-tune de un modelo pequeno con licencia Apache 2.0, aunque la ausencia de documentacion tecnica limita su utilidad practica.

El repositorio no tiene descargas ni valoraciones, lo que indica que se trata de un experimento personal sin validacion comunitaria. No se han publicado benchmarks propios ni detalles sobre el proceso de fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal basado en Qwen2.5 (RoPE, SwiGLU, RMSNorm, GQA con 14 cabezas Q y 2 KV, embeddings atados) |
| Parametros totales | 494.032.768 (0,49B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-0.5B: un transformer causal con 24 capas, atencion GQA con 14 cabezas de consulta y 2 cabezas de clave/valor, normalizacion RMSNorm, activacion SwiGLU, embeddings atados y bias en las proyecciones QKV. Segun los metadatos de HuggingFace, es un fine-tune de Qwen/Qwen2.5-0.5B.

Sin embargo, la model card no documenta ninguna modificacion de arquitectura respecto al modelo base: es una copia literal del README de Qwen2.5-0.5B-Instruct. No se especifican los datos de entrenamiento del fine-tune, el numero de tokens utilizados, ni si se aplicaron tecnicas de post-entrenamiento como RLHF o DPO. El nombre del repositorio ("poc-custom-arch") sugiere una arquitectura personalizada, pero no hay informacion tecnica que la respalde. Los parametros no-embedding ascienden a 0,36B segun la ficha del modelo base.

## Capacidades

- Generacion de texto conversacional con plantilla de mensajes aplicable mediante `apply_chat_template` de `transformers`.
- Soporte de system prompts para configurar el comportamiento del asistente, heredado de Qwen2.5-Instruct.
- Razonamiento basico, generacion de codigo y matematicas a nivel de un modelo de 0,5B, con capacidades limitadas por el tamano.
- Generacion de texto estructurado (JSON) de forma limitada, dependiendo de la tarea.
- Capacidades multilingues reducidas: los metadatos indican solo ingles, aunque el modelo base Qwen2.5 soporta 29 idiomas.
- Compatible con `text-generation-inference` y endpoints de HuggingFace, segun los tags del repositorio.
- No se documenta soporte de tool calling, agentes, vision ni audio.

## Casos de uso

- Prototipado rapido de chatbots: el modelo permite validar flujos conversacionales basicos y la integracion con frameworks de inferencia antes de escalar a modelos mayores, gracias a su tamano reducido.
- Experimentacion academica: util para estudiar el comportamiento de fine-tunes sobre arquitecturas pequenas y comparar resultados con el modelo base Qwen2.5-0.5B-Instruct.
- Pruebas de pipeline de generacion: sirve para verificar integraciones con `transformers`, `text-generation-inference` o vLLM sin necesidad de hardware costoso.
- Evaluacion de tecnicas de cuantizacion: al ser un modelo de 0,49B, es adecuado para probar metodos de cuantizacion (INT8, INT4) y medir su impacto en calidad y velocidad.
- Benchmarking de frameworks de inferencia: permite comparar latencia y throughput entre llama.cpp, Ollama y vLLM con un modelo ligero y de facil despliegue.
- Generacion de texto asistida en aplicaciones de bajo coste: su tamano permite ejecutarlo en CPU o GPUs modestas para tareas simples de autocompletado o clasificacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion especifica para este repositorio; solo referencia el blog de Qwen2.5 para los resultados del modelo base, que no son aplicables directamente a este fine-tune.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en FP16 (calculado a partir de 494M parametros), ~500 MB en INT8 y ~250 MB en INT4.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 2060, etc.). Tambien ejecutable en CPU con 4 GB de RAM o mas.
- Compatible con GPUs de consumo: si, todas las de gama media y alta pueden ejecutarlo sin problemas.
- Opciones de despliegue: `transformers` (HuggingFace), `text-generation-inference`, vLLM, llama.cpp, Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sworge/poc-custom-arch | 0,49B | 32.768 | Apache 2.0 | Fine-tune de Qwen2.5-0.5B, arquitectura no documentada |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 | Apache 2.0 | Modelo instruct de referencia, bien documentado y evaluado |
| TinyLlama-1.1B-Chat | 1,1B | 4.096 | Apache 2.0 | Alternativa de tamano ligeramente superior, contexto mas corto |
| Microsoft/Phi-1.5 | 1,3B | 2.048 | MIT | Enfocado en razonamiento, contexto limitado |

## Limitaciones y advertencias

- La model card no documenta la arquitectura personalizada que sugiere el nombre del repositorio: es una copia literal de la ficha de Qwen2.5-0.5B-Instruct, por lo que no hay forma de saber que modificaciones se aplicaron.
- No hay informacion sobre los datos de entrenamiento del fine-tune, por lo que se desconoce su comportamiento real frente al modelo base.
- Con solo 0,49B de parametros, la capacidad de razonamiento, generacion de codigo y matematicas es muy limitada en comparacion con modelos de 7B o superiores.
- Riesgo de alucinacion elevado en tareas de conocimiento factual, comun en modelos pequenos.
- Los metadatos indican soporte solo para ingles; el fine-tune podria haber degradado las capacidades multilingues del modelo base.
- Sin benchmarks publicados, no es posible validar el rendimiento del modelo en tareas estandar.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal sin validacion comunitaria ni garantias de calidad.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentacion tecnica hace arriesgado su uso en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sworge/poc-custom-arch
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
