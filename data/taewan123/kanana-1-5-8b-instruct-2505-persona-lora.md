# Taewan123/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

La ficha corresponde a `Taewan123/kanana-1.5-8b-instruct-2505-Persona-LORA`, un adaptador LoRA publicado por el usuario Taewan123 sobre el modelo base `kakaocorp/kanana-1.5-8b-instruct-2505` de Kakao Corp. Se trata, por tanto, de un ajuste fino de tipo "persona" (orientado a dotar al modelo de un estilo o rol conversacional concreto) y no de un modelo completo entrenado desde cero. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que contiene unicamente los pesos del adaptador y no los pesos completos del modelo base de 8.000 millones de parametros.

El modelo base pertenece a la familia Kanana 1.5, una revision de la familia Kanana que, segun las referencias disponibles, introduce mejoras sustanciales en generacion de codigo, matematicas y function calling respecto a la version anterior. El adaptador se entrena con la libreria Unsloth, un framework de ajuste fino optimizado que reduce el tiempo de entrenamiento y el consumo de memoria, y se distribuye con licencia Apache 2.0.

La relevancia de esta publicacion es limitada y muy especializada: cuenta con cero descargas y cero "me gusta" en el momento de la consulta, no incluye model card detallada (solo una plantilla con el aviso de Unsloth) y no aporta informacion sobre el dataset de persona utilizado, hiperparametros de entrenamiento ni evaluaciones. Resulta util unicamente como ejemplo de ajuste LoRA sobre Kanana 1.5 o como punto de partida para quien quiera reproducir un flujo de trabajo similar con Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (heredada del modelo base Kanana 1.5 8B); el adaptador es LoRA |
| Parametros totales | 8 000 millones (modelo base); el adaptador LoRA no declara parametros propios. Repo de 0,1 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 000 tokens segun fuente secundaria (llm-explorer, referida a la variante fusionada); no confirmado en la model card |
| Tipos de cuantizacion | no disponible en el repositorio (solo se listan safetensors; el modelo base admite las cuantizaciones habituales de 8 y 4 bits) |
| Idiomas soportados | ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); libreria `transformers` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `kakaocorp/kanana-1.5-8b-instruct-2505`, un transformer decoder-only de 8.000 millones de parametros de la familia Kanana 1.5 de Kakao Corp. La model card del adaptador no describe la arquitectura interna del modelo base, por lo que no se dispone de detalles sobre el numero de capas, dimension del modelo, mecanismo de atencion ni tokenizador. La informacion disponible sobre el modelo base indica mejoras en codigo, matematicas y llamada a funciones respecto a Kanana 1.0, pero no se aportan cifras de tokens de entrenamiento ni composicion del dataset.

En cuanto al entrenamiento del adaptador, la unica informacion es que se realizo con Unsloth y que la libreria asociada es `trl` (Transformers Reinforcement Learning), lo que sugiere un ajuste supervisado o un entrenamiento con preferencias sobre un dataset de "persona". No se especifica el numero de pasos, el rango LoRA, los modulos objetivo, la tasa de aprendizaje, el volumen de datos ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) atribuible al propio adaptador.

## Capacidades

- Generacion de texto conversacional en ingles, con un estilo o "persona" ajustado por el adaptador.
- Hereda las capacidades del modelo base Kanana 1.5 8B Instruct: generacion de codigo, resolucion de problemas matematicos y function calling, segun la documentacion del modelo base.
- Soporte de tool calling / function calling, segun las mejoras anunciadas para Kanana 1.5.
- Compatibilidad con `text-generation-inference` (etiqueta `endpoints_compatible`) y con el ecosistema `transformers`.
- Capacidades multilingues: unicamente ingles declarado; el soporte de otros idiomas (por ejemplo coreano) del modelo base no esta confirmado en esta ficha.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito ("thinking").

## Casos de uso

- Prototipado de asistentes con personalidad fija: el adaptador permite experimentar con respuestas de estilo consistente en ingles sin reentrenar el modelo base, cargando el adaptador sobre Kanana 1.5 8B mediante PEFT.
- Generacion de dialogos sinteticos con un rol concreto: util para crear datos de entrenamiento o evaluacion en los que se necesita un tono uniforme.
- Chatbots de nicho para demos internas: al ser un adaptador pequeno (0,1 GB), se puede versionar y distribuir con facilidad junto al modelo base.
- Investigacion sobre ajuste fino eficiente: sirve como referencia reproducible de un flujo Unsloth + TRL sobre un modelo de 8B.
- Evaluacion comparativa de variantes de persona: al existir otras publicaciones similares (por ejemplo, las de `kmj0614` o `atomimpnsc`), permite contrastar estilos sobre la misma base.
- Integracion en pipelines de generacion de texto en ingles: mediante `transformers` o TGI, para tareas de redaccion o respuesta breve donde el estilo importa mas que el rendimiento bruto.
- Base para fusionar el adaptador en los pesos completos (merge) y desplegar un unico artefacto, como hace la variante "Persona Merged".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye metricas, el repositorio no adjunta evaluaciones y las busquedas web solo aportan descripciones cualitativas del modelo base (mejoras en codigo, matematicas y function calling) sin cifras verificables.

## Requisitos de hardware

- Inferencia con el modelo base en FP16/BF16: aproximadamente 16 GB de VRAM, en linea con el dato de 16 GB indicado por llm-explorer para la variante fusionada de 8B.
- Cuantizacion de 8 bits: en torno a 9-10 GB de VRAM estimados.
- Cuantizacion de 4 bits: en torno a 5-6 GB de VRAM estimados.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en servidor; RTX 4090 (24 GB) suficiente para FP16 y cuantizaciones; RTX 3090 (24 GB) y, con cuantizacion de 4 bits, GPUs consumer de 8-12 GB.
- Si cabe en GPU consumer: si, con cuantizacion de 4 bits en tarjetas de 8-12 GB y sin cuantizar en tarjetas de 24 GB.
- Opciones de despliegue: vLLM, TGI (etiqueta `text-generation-inference`), llama.cpp / GGUF, Ollama (previa conversion del modelo base), y carga del adaptador mediante PEFT/Unsloth sobre `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Taewan123/kanana-1.5-8b-instruct-2505-Persona-LORA | 8B (base) + adaptador LoRA | no confirmado (32K segun fuente secundaria) | Apache 2.0 | HuggingFace, 0 descargas | Adaptador de persona; sin benchmarks |
| kakaocorp/kanana-1.5-8b-instruct-2505 (modelo base) | 8B | no disponible en la informacion | Apache 2.0 | HuggingFace | Mejoras en codigo, matematicas y function calling |
| Variantes Persona similares (kmj0614, atomimpnsc) | 8B (base) + adaptador | no disponible | Apache 2.0 | HuggingFace | Adaptadores equivalentes sobre la misma base |
| Alternativas generalistas de ~7-8B (por ejemplo, Llama 3.1 8B o Qwen2.5 7B) | 7-8B | mayor en algunos casos | licencias propias | HuggingFace y Ollama | No se dispone de comparativa de rendimiento verificable en esta ficha |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste de persona, puede amplificar estereotipos presentes en los datos de ajuste, que no se describen.
- Riesgo de alucinacion: inherente a los modelos de 8B; no se han publicado evaluaciones de fidelidad para este adaptador.
- Limitaciones de idioma: la etiqueta declara unicamente ingles; el comportamiento en castellano no esta garantizado y probablemente degrade.
- Limitaciones de contexto: la longitud de contexto no se confirma en la model card; el dato de 32K procede de una fuente secundaria sobre una variante fusionada distinta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de ajuste, no documentados.
- Caveats para produccion: repositorio sin descargas ni validacion comunitaria, model card minima, ausencia de benchmarks, de hiperparametros y de descripcion del dataset; no se especifica si el adaptador es compatible con todas las variantes de tokenizador o chat template del modelo base.
- El adaptador no es un modelo autonomo: requiere cargar `kakaocorp/kanana-1.5-8b-instruct-2505` para poder ejecutarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taewan123/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Variante Persona-LORA alternativa (kmj0614): https://huggingface.co/kmj0614/kanana-1.5-8b-instruct-2505-Persona-LORA
- Variante Persona-LORA alternativa (atomimpnsc): https://huggingface.co/atomimpnsc/kanana-1.5-8b-instruct-2505-Persona-LORA
- Ficha de la variante fusionada en LLM Explorer: https://llm-explorer.com/model/kangkys%2Fkanana-1.5-8b-instruct-2505-Persona-Merged,4rSjS8qYNSnJw6fUrD2etZ
- Ficha del modelo base en Inferix: https://inferix.co/models/kakaocorp/kanana-1.5-8b-instruct-2505
- Ficha del modelo base en ModelHub: https://dev.modelhub.org.cn/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
