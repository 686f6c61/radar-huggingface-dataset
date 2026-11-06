# TeamIDE/Qwen3.6-35B-A3B-Pantheon-TT

## Resumen

TeamIDE/Qwen3.6-35B-A3B-Pantheon-TT es una distribucion de pesos derivada de Qwen/Qwen3.6-35B-A3B, el modelo Mixture-of-Experts de la familia Qwen 3.6 desarrollado por el equipo Qwen de Alibaba Cloud. El repositorio no contiene el modelo original en formato estandar, sino una conversion al formato de tiles de tarjeta de Tenstorrent (`.fttw`), pensada exclusivamente para ser instalada por Pantheon Local en equipos con una tarjeta Tenstorrent Blackhole p150. El autor de la conversion es TeamIDE.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto de despliegue para hardware de aceleracion no-GPU. La model card es explicita al senalar que los ficheros `.fttw` no son GGUF y que solo sirven para Pantheon. Quien busque pesos utilizables en vLLM, llama.cpp u Ollama debe acudir al modelo base o a las cuantizaciones GGUF de bartowski, de las que esta conversion deriva.

El repositorio ocupa 29,6 GB e incluye tres ficheros: un GGUF de metadatos (tokenizer, config, tensores pequenos), un fichero con todos los pesos de matmul y el embedding en formato tile (Bfp8 para tiles generales, Bfp6 para expertos enrutados, fp32 para routers) y un tercer fichero con la capa MTP para decodificacion especulativa. La licencia declarada es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (heredada de Qwen3.6-35B-A3B); conversion a tiles Tenstorrent |
| Parametros totales | 35B nominales segun el nombre del modelo base; el campo safetensors del repo indica 1.254.528 (no representativo del modelo completo) |
| Parametros activos | no disponible (el modelo base es A3B, es decir, aproximadamente 3B activos, pero no se detalla en la informacion proporcionada) |
| Longitud de contexto | 36.864 tokens como limite configurado en Pantheon (cap medido); el contexto nativo del modelo base no se especifica |
| Tipos de cuantizacion | Origen Q8_0 (GGUF de bartowski); conversion a Bfp8 (matmuls), Bfp6 (expertos enrutados), fp32 (routers de expertos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.fttw` (formato tile de Pantheon/Foundry para Tenstorrent) y `.meta.gguf` (solo claves y tensores pequenos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.6-35B-A3B, un transformer con capas Mixture-of-Experts segun indica el sufijo A3B del nombre (aproximadamente 3B parametros activos sobre 35B totales). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO) del modelo original; esos datos corresponden a la model card de Qwen, no a este repositorio.

La innovacion tecnica de este artefacto es la conversion de formato. Los pesos de matmul y el embedding se reorganizan en tiles Bfp8, los expertos enrutados se cuantizan a Bfp6 (un paso con perdida adicional respecto al Q8_0 de origen) y los routers de expertos se mantienen en fp32 para preservar la precision del enrutamiento. El repositorio incluye ademas una capa MTP (multi-token prediction) convertida del mismo modo, que Pantheon emplea para decodificacion especulativa. El fichero de metadatos conserva tokenizer, config, normas y taps de convolucion, pero omite deliberadamente los pesos grandes.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio y la estructura del modelo base apuntan a uso de chat multi-turno.
- Razonamiento y conocimiento general: heredados del modelo Qwen3.6-35B-A3B original; no se documentan en este repositorio.
- Capacidad MoE con enrutamiento por token: los routers se conservan en fp32, lo que sugiere que la seleccion de expertos se mantiene fiable tras la conversion.
- Decodificacion especulativa: la capa MTP incluida permite acelerar la generacion en Pantheon (18,2 tok/s en prompts cortos segun la model card).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica integracion con la infraestructura de endpoints de Hugging Face.
- Capacidades multimodales, de codigo o tool calling: no disponibles en la informacion proporcionada para este artefacto concreto.

## Casos de uso

- Despliegue en hardware Tenstorrent Blackhole p150: el caso de uso principal y practicamente unico. Un equipo con una tarjeta p150 puede instalar estos ficheros mediante Pantheon Local y servir el modelo sin GPU convencional, lo que resulta util en entornos con aceleradores Tenstorrent ya desplegados.
- Inferencia de chat con contexto medio en local: con un limite de 36.864 tokens y un rendimiento medido de 12,2 tok/s a 8k de contexto, es adecuado para asistentes conversacionales de un solo usuario en la propia maquina.
- Evaluacion de la cadena de conversion GGUF a tiles: util para ingenieros que quieran medir la perdida de calidad de Bfp6 en expertos frente al Q8_0 original, comparando salidas entre ambas versiones.
- Pruebas de decodificacion especulativa con MTP: la capa MTP incluida permite experimentar con speculative decoding en Pantheon y medir la ganancia (18,2 frente a 12,2 tok/s en prompts cortos).
- Prototipado de pipelines de agentes con contexto largo: el cap de 32k con 9,8 tok/s permite sostener conversaciones con documentos extensos, aunque el tiempo hasta el primer token (192 s para un prompt de 8.147 tokens) limita la interactividad.
- Validacion de compatibilidad de Pantheon con modelos MoE de gran tamano: sirve como caso de prueba para el equipo de Pantheon al verificar la carga de un modelo de 35B en una sola tarjeta.

## Benchmarks y rendimiento

La model card proporciona mediciones de inferencia en Pantheon con una p150, contexto maximo de 36.864 tokens, un solo usuario, decodificacion greedy y sin especulacion salvo donde se indica:

| Metrica | Valor |
|---|---|
| Decodificacion a 8k de contexto | 12,2 tok/s |
| Decodificacion a 14k de contexto | 11,4 tok/s |
| Decodificacion a 32k de contexto | 9,8 tok/s |
| Tiempo hasta el primer token (prompt de 8.147 tokens) | 192 s |
| Decodificacion con MTP en prompts cortos | 18,2 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible para este artefacto. Las cifras anteriores son de rendimiento de inferencia, no de capacidad.

## Requisitos de hardware

- Hardware objetivo: una tarjeta Tenstorrent Blackhole p150. La model card indica explicitamente "one card".
- VRAM: no aplica en el sentido convencional; el modelo reside en la memoria de la tarjeta Tenstorrent. El fichero de pesos principal ocupa 28,84 GB, mas 0,70 GB de la capa MTP y 16 MB de metadatos.
- GPU convencionales (A100, H100, RTX 4090): no soportadas por estos ficheros. El formato `.fttw` no es cargable por vLLM, llama.cpp, TGI ni Ollama.
- Opciones de despliegue: exclusivamente Pantheon Local (repositorio en git.teamide.dev/David/Pantheon).
- Latencia y throughput: 12,2 tok/s a 8k, 11,4 a 14k y 9,8 a 32k; 18,2 tok/s con MTP en prompts cortos. El tiempo hasta el primer token de 192 s para un prompt de 8.147 tokens es un cuello de botella relevante para uso interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| TeamIDE/Qwen3.6-35B-A3B-Pantheon-TT | 35B (A3B, MoE) | 36.864 (cap en Pantheon) | `.fttw` + meta GGUF | Apache 2.0 | Tenstorrent Blackhole p150 |
| Qwen/Qwen3.6-35B-A3B (base) | 35B (A3B, MoE) | no disponible | safetensors | Apache 2.0 | GPU convencionales |
| bartowski/Qwen_Qwen3.6-35B-A3B-GGUF | 35B (A3B, MoE) | no disponible | GGUF (Q8_0 y otras) | Apache 2.0 | CPU/GPU con llama.cpp y derivados |
| TeamIDE/Qwen3.6-35B-A3B-Pantheon-K80 | 35B (A3B, MoE) | no disponible | formato Pantheon para K80 | Apache 2.0 | GPUs K80 |

La comparativa relevante es de formato y hardware, no de calidad: los tres primeros comparten pesos de origen y solo difieren en el empaquetado. La version Pantheon-K80 del mismo autor cubre el caso de GPUs Kepler antiguas.

## Limitaciones y advertencias

- Uso restringido al ecosistema Pantheon: los ficheros `.fttw` no son GGUF ni safetensors y no se pueden cargar con herramientas estandar. La model card lo advierte de forma explicita.
- Perdida de calidad por cuantizacion: los expertos enrutados pasan de Q8_0 a Bfp6, un paso con perdida que la propia model card califica como tal. No se documenta la degradacion resultante en tareas de calidad.
- Contexto limitado a 36.864 tokens en la configuracion medida, inferior a lo que el modelo base podria soportar.
- Tiempo hasta el primer token muy alto (192 s para 8.147 tokens), lo que desaconseja su uso en aplicaciones interactivas con prompts largos.
- Throughput bajo en terminos absolutos (9,8 a 12,2 tok/s), adecuado para un unico usuario pero no para servicio concurrente.
- Idiomas soportados no documentados en este repositorio; hay que remitirse a la model card del modelo base.
- Sesgos y riesgo de alucinacion: no documentados especificamente para este artefacto; se heredan los del modelo Qwen3.6-35B-A3B.
- Licencia Apache 2.0 permite uso comercial, pero al ser pesos modificados conviene conservar los avisos de atribucion al equipo Qwen y a bartowski por la cuantizacion Q8_0.
- El campo de parametros del repo (1.254.528) no refleja el tamano real del modelo y puede confundir a herramientas automaticas de catalogacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TeamIDE/Qwen3.6-35B-A3B-Pantheon-TT
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- GGUF de origen (bartowski): https://huggingface.co/bartowski/Qwen_Qwen3.6-35B-A3B-GGUF
- Repositorio de Pantheon: https://git.teamidev.dev/David/Pantheon
- Variante para GPUs K80 del mismo autor: https://huggingface.co/TeamIDE/Qwen3.6-35B-A3B-Pantheon-K80
