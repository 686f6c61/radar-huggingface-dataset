# Virtudant-AI/Qwen3-30B-A3B

## Resumen

Qwen3-30B-A3B es un modelo de lenguaje causal de tipo mezcla de expertos (MoE) desarrollado por el equipo Qwen de Alibaba. Esta ficha corresponde a la reproducción publicada por el usuario Virtudant-AI en Hugging Face, que replica los pesos del modelo base oficial `Qwen/Qwen3-30B-A3B-Base` bajo licencia Apache 2.0. El modelo cuenta con 30.500 millones de parametros totales, de los cuales solo 3.300 millones se activan por token, lo que permite un equilibrio entre capacidad y coste de inferencia.

La arquitectura emplea 128 expertos con 8 activos por token, 48 capas y atencion con Grouped Query Attention (32 cabezas para consultas y 4 para claves/valores). Su rasgo diferencial es la capacidad de alternar entre modo de razonamiento (thinking) y modo directo (non-thinking) dentro del mismo modelo, lo que lo hace versatil tanto para tareas de razonamiento complejo como para dialogo general.

Es relevante porque combina un contexto nativo de 32.768 tokens (extensible a 131.072 con YaRN), soporte para mas de 100 idiomas y capacidades de agente, todo ello con un coste computacional por token muy inferior al de un modelo denso de 30B. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE) |
| Parametros totales | 30.500 millones (30,5B) |
| Parametros activos | 3.300 millones (3,3B) por token |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | no disponible (no especificado en la informacion proporcionada) |
| Idiomas soportados | mas de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via transformers); GGUF y otros formatos disponibles en el ecosistema Qwen3 |

## Arquitectura y entrenamiento

El modelo es un transformer causal con 48 capas y una capa MoE que contiene 128 expertos, de los cuales se activan 8 por token. La atencion utiliza Grouped Query Attention con 32 cabezas para consultas y 4 para claves/valores, lo que reduce el coste de memoria KV. Los parametros no pertenecientes a embeddings suman 29.900 millones. El modelo base fue preentrenado y posteriormente sometido a post-entrenamiento (instruccion y alineacion), segun la model card del modelo original Qwen3.

La innovacion principal es el soporte nativo de dos modos de operacion en un unico modelo: thinking mode, que genera contenido de razonamiento envuelto en etiquetas `<think>...</think>` antes de la respuesta final, y non-thinking mode, orientado a dialogo eficiente. El cambio se controla mediante el parametro `enable_thinking` en `apply_chat_template`. No se detalla en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto y dialogo multi-turno con alineacion a preferencias humanas.
- Razonamiento logico, matematico y de sentido comun, especialmente en thinking mode.
- Generacion de codigo y tareas de programacion.
- Cambio dinamico entre thinking mode y non-thinking mode en el mismo modelo.
- Soporte de tool calling y function calling para integracion con herramientas externas.
- Capacidades de agente y razonamiento multi-paso.
- Multilingue: mas de 100 idiomas y dialectos, con instrucciones y traduccion.
- Escritura creativa, role-play y seguimiento de instrucciones complejas.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32.768 tokens nativos, recordando el historial completo de la interaccion sin truncamientos agresivos.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, y alternar a non-thinking mode para respuestas rapidas en IDE.
- Agentes autonomos: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que consulten APIs, bases de datos o servicios externos y encadenen acciones.
- Analisis de documentos largos: con la extension YaRN a 131.072 tokens, puede procesar contratos, informes o articulos extensos y extraer conclusiones o resumenes estructurados.
- Traduccion y localizacion multilingue: el soporte de mas de 100 idiomas lo hace adecuado para pipelines de traduccion automatica y adaptacion de contenido.
- Asistente de investigacion matematica: en thinking mode puede resolver problemas paso a paso y explicar el razonamiento, util en entornos educativos o de analisis.
- Generacion de contenido creativo: escritura de guiones, role-play y dialogos gracias a su alineacion con preferencias humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa, un modelo MoE de 30,5B parametros totales requiere almacenar todos los pesos; en precision bf16 serian aproximadamente 61 GB, y en cuantizacion de 4 bits en torno a 15-18 GB, aunque estos calculos no estan confirmados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabria esperar GPUs de clase A100 (40/80 GB) o H100 para bf16; en cuantizacion podria ejecutarse en RTX 4090 (24 GB) o similares, pero no hay datos oficiales.
- Opciones de despliegue documentadas: SGLang (>=0.4.6.post1), vLLM (>=0.8.5), Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B (Virtudant-AI) | 30,5B | 3,3B | 32.768 nativo / 131.072 YaRN | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B (oficial Qwen) | 30,5B | 3,3B | 32.768 nativo / 131.072 YaRN | Apache 2.0 | Hugging Face |
| QwQ-32B | 32B (denso) | 32B | no disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-32B-Instruct | 32B (denso) | 32B | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la familia Qwen por falta de datos verificados de otras alternativas MoE equivalentes en la informacion proporcionada. El modelo de Virtudant-AI es una replica del oficial, por lo que sus prestaciones deberian ser equivalentes a las del original.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como todo modelo entrenado con datos web, puede reflejar sesgos de genero, culturales o idiomaticos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en thinking mode el razonamiento puede contener pasos plausibles pero incorrectos.
- Limitaciones de contexto: el contexto nativo es de 32.768 tokens; la extension a 131.072 requiere configuracion YaRN y puede degradar la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original y los terminos de la replica.
- Caveat de produccion: esta publicacion es una replica de un tercero (Virtudant-AI) con 0 descargas y sin validacion externa; para produccion se recomienda usar los pesos oficiales de Qwen.
- Requiere `transformers>=4.51.0` para cargar la arquitectura `qwen3_moe`; versiones anteriores lanzan `KeyError: 'qwen3_moe'`.

## Enlaces

- Hugging Face (replica Virtudant-AI): https://huggingface.co/Virtudant-AI/Qwen3-30B-A3B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Modelo oficial Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Blog Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion Qwen: https://qwen.readthedocs.io/en/latest/
- Chat Qwen: https://chat.qwen.ai/
- Licencia Apache 2.0: https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE
- Paper referenciado (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
