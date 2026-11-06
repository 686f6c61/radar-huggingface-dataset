# tohoku-nlp/nanochat-jp-v4-d54-sft-hf

## Resumen

nanochat-jp-v4-d54-sft-hf es un modelo de lenguaje de tipo conversacional desarrollado por tohoku-nlp (Tohoku NLP), el grupo de procesamiento de lenguaje natural de la Universidad de Tohoku. Se trata de un checkpoint afinado mediante SFT (supervised fine-tuning) sobre la base nanochat-jp-v4, dentro de la familia nanochat-jp, una adaptación al japones del proyecto nanochat orientada a reproducir el pipeline completo de entrenamiento de un modelo tipo ChatGPT con recursos reducidos.

El modelo cuenta con aproximadamente 9.846 millones de parametros (9,8B) almacenados en safetensors, con un repositorio de 19,7 GB, lo que sugiere pesos en precision bf16/fp16. Esta especializado en japones y se distribuye con licencia Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar las condiciones en Hugging Face.

Su relevancia radica en que ofrece un modelo conversacional en japones de casi 10B de parametros con licencia permisiva, un nicho con relativamente pocas opciones abiertas comparado con el ecosistema ingles. Al estar construido sobre el marco nanochat, resulta util como referencia reproducible para investigacion en ajuste fino y evaluacion de modelos en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat_jp (transformer decoder-only, implementacion custom_code sobre transformers) |
| Parametros totales | 9.846.135.946 (~9,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo generativo de texto, implementado como arquitectura personalizada (`nanochat_jp`) que requiere `trust_remote_code` para cargarse con la libreria transformers. El sufijo "d54" del identificador sugiere una configuracion de profundidad de 54 capas dentro del esquema de escalado de nanochat, aunque este dato no se confirma en la informacion disponible. El checkpoint corresponde a una fase de SFT (supervised fine-tuning) sobre la base nanochat-jp-v4, es decir, un ajuste supervisado con datos de conversacion para alinear el modelo hacia el dialogo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO en esta version. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) en los metadatos proporcionados. La etiqueta "conversational" y el pipeline text-generation confirman su orientacion a la generacion de respuestas en formato de dialogo.

## Capacidades

- Generacion de texto en japones con orientacion conversacional (multi-turno).
- Ajuste supervisado (SFT) para respuestas de dialogo, no solo modelado de lenguaje base.
- Generacion autoregresiva estandar mediante la API de transformers.
- Capacidad de razonamiento y respuesta a instrucciones derivada del SFT, aunque sin datos publicos de evaluacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al japones segun la etiqueta de idioma; no se documenta soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Atencion al cliente en japones: el modelo puede gestionar conversaciones multi-turno en japones gracias a su ajuste SFT conversacional, adecuado para asistentes virtuales de empresas que operan en el mercado japones.
- Generacion de contenido en japones: redaccion de textos, resumenes y respuestas en japones con un modelo de casi 10B de parametros y licencia Apache 2.0, lo que facilita su integracion en productos comerciales.
- Investigacion en NLP japones: sirve como linea base reproducible para estudiar el efecto del SFT y comparar con otros modelos abiertos en japones.
- Prototipado de chatbots: al ser un modelo de tamano medio (9,8B), puede desplegarse en una sola GPU de gama alta para experimentacion rapida sin infraestructura masiva.
- Ajuste fino adicional (fine-tuning): con licencia permisiva y pesos safetensors, es apto para especializarse en dominios concretos (legal, sanitario, atencion publica) en japones.
- Evaluacion de pipelines nanochat: util para reproducir y auditar el proceso de entrenamiento y alineacion del proyecto nanochat-jp en entornos academicos.
- Traduccion asistida japones-ingles: aunque no se documenta oficialmente el multilingue, puede emplearse como componente en pipelines de traduccion con supervision adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~9,8B de parametros, en bf16/fp16 se requieren aproximadamente 20 GB de VRAM solo para los pesos; en cuantizacion de 8 bits, unos 10-11 GB; en 4 bits, unos 6-7 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia en precision completa; RTX 4090 (24 GB) suficiente para bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16; en GPUs de 12-16 GB seria necesario cuantizar (si se generan pesos GGUF, no disponibles en el repo).
- Opciones de despliegue: transformers (requiere `trust_remote_code` por la arquitectura custom). vLLM, llama.cpp, Ollama o TGI: no confirmado, dependera del soporte de la arquitectura nanochat_jp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| nanochat-jp-v4-d54-sft-hf | ~9,8B | no disponible | Apache 2.0 | ja | Gated en HF |
| Modelos japoneses abiertos de tamano similar (p. ej. variantes de ~7-13B) | 7-13B | variable | variable | ja/en | no disponible en la informacion |
| Modelos multilingues genericos de ~8-9B | ~8-9B | variable | variable | multi | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Especializado en japones: el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente sin datos de evaluacion publicos.
- Sesgos conocidos: no documentados por el autor; los sesgos dependeran de los datos de entrenamiento, no publicados.
- Longitud de contexto no documentada: limita la planificacion de aplicaciones con documentos largos.
- Arquitectura custom: requiere `trust_remote_code`, lo que implica ejecutar codigo del autor y complica la integracion con herramientas estandar (vLLM, TGI) sin adaptaciones.
- Sin benchmarks publicos: no hay evidencia cuantitativa de calidad frente a alternativas, lo que desaconseja su uso en produccion sin evaluacion propia.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated.

## Enlaces

- Hugging Face: https://huggingface.co/tohoku-nlp/nanochat-jp-v4-d54-sft-hf
- Repositorio del proyecto nanochat (referencia general): https://github.com/karpathy/nanochat (no confirmado en la informacion proporcionada)
- Grupo Tohoku NLP: no disponible en la informacion proporcionada.
