# vosldtgbj/project-llm-rlvr-dynamic-v2-step-25

## Resumen

El modelo `vosldtgbj/project-llm-rlvr-dynamic-v2-step-25` es un checkpoint intermedio de la fase de aprendizaje por refuerzo con recompensa verificable (RLVR) del Proyecto LLM del autor `vosldtgbj`. Se trata de un ajuste de tipo full-weights derivado de `google/gemma-4-12B-it`, un transformer decoder-only multimodal con unos 12.500 millones de parametros, del cual aqui se publican los pesos completos en BF16 resultantes de un entrenamiento puramente textual. El repositorio corresponde al step local 25 de la fase RLVR v2 (step acumulado 150 sobre la trayectoria completa), entrenado con GRPO sincrono y Dynamic Sampling activado.

El interes de esta publicacion es de tipo experimental e investigador: forma parte de una trayectoria continua de parameters donde cada savepoint se separa del anterior por 25 updates de optimizador (con un ultimo salto de 24 entre los steps 125 y 149). La model card advierte explicitamente de que estos checkpoints no disponen de una puntuacion de validacion independiente que permita rankearlos entre si, por lo que solo son comparables si se ejecuta la misma evaluacion congelada sobre los 11 savepoints publicados.

Se distribuye bajo licencia Gemma 4, con soporte declarado de japones e ingles, y esta pensado para inferencia, evaluacion unificada y como inicializacion de nuevos entrenamientos, no para continuar de forma bit-exacta el entrenamiento original (los estados de optimizador, scheduler y RNG no se archivan).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (`Gemma4UnifiedForConditionalGeneration`, `model_type` = `gemma4_unified`); 48 capas de texto, hidden size 3.840, vocab size 262.144 |
| Parametros totales | 11.959.730.224 segun los safetensors publicados; la model card del autor declara 12.484.280.320. Discrepancia no resuelta en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (durante RLVR se usan 8.192 tokens de entrada, 2.048 de generacion y 10.240 totales) |
| Tipos de cuantizacion | No disponible (solo se publican pesos BF16; no hay GGUF ni cuantizaciones de menor precision) |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | Gemma 4 (`license: gemma`), enlace https://ai.google.dev/gemma/docs/gemma_4_license |
| Formato de pesos | Safetensors BF16 en 5 shards + `model.safetensors.index.json`; ~23,92 GB decimales (~22,3 GiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `google/gemma-4-12B-it`, un transformer decoder-only con torre de vision, torre de audio y proyecciones multimodales, expuesto en transformers como `Gemma4UnifiedForConditionalGeneration`. Segun la model card, el entrenamiento de este proyecto se ha realizado exclusivamente sobre texto: las torres de vision y audio y los proyectores multimodales permanecen congelados, y las variaciones de parametros se concentran en el modelo de lenguaje textual. El pipeline declarado en HuggingFace es `any-to-any` y `image-text-to-text`, pero las capacidades multimodales no han sido ajustadas en esta fase.

La receta completa recorre varias etapas. Se parte de la base original y se aplica un continued pre-training (CPT) con dos rondas de experimentos; despues, un SFT v3 con una vista congelada `official_90_10` que contiene 67.195 registros y 4.083.167 tokens de supervision (packing efficiency 0,9240, packs de 8.192 tokens). Ese SFT cubre nueve familias de tareas del dominio del proyecto (QA mono y multi-documento, conflictos temporales y de version, trayectorias de herramientas normales y con fallo, abstención y aclaracion, salida estructurada, inyeccion y limites de permisos, y anclas de capacidad general). Sobre ese punto de partida arranca el RLVR v1 (learning rate 1e-6) y despues el RLVR v2, que reutiliza los parametros del v1 step 125 pero no su estado de optimizador, con learning rate 5e-7, nuevo warmup y una vista de datos distinta.

La fase RLVR v2 usa GRPO sincrono con Dynamic Sampling, 30 prompt groups efectivos por update y 16 rollouts por prompt (480 rollouts por update), temperatura 0,7 y top-p 1,0. La recompensa proviene de verificadores deterministas y, en algunos contratos, de un juez Nemotron 3 Ultra. El conjunto de entrenamiento es SF-RLVR-Unified-v2 (37.500 tareas: 30.000 de dominio y 7.500 generales, en 15 familias verificables), con un maximo de 5 rondas de interaccion. El entrenamiento se ejecuto en 16 H100 SXM con rollout servido por vLLM (tensor parallel size 2).

## Capacidades

- Generacion de texto y razonamiento de multiples pasos en japones e ingles, con RLVR entrenado sobre tareas verificables (matematicas, aritmetica, MCQA, coding competitivo, instrucciones).
- Respuesta con fundamento documental: QA sobre un unico documento, razonamiento sobre varios documentos y resolucion de conflictos temporales y de version.
- Manejo de abstención y aclaracion: contestar "no lo se" o pedir aclaraciones cuando la informacion no aparece o entra en conflicto.
- Tool calling y trayectorias de agente: el dataset incluye familias de trayectorias normales de herramientas, recuperacion tras fallos de herramientas y limites de inyeccion/permisos.
- Salida estructurada: generacion conforme a esquemas, con verificadores deterministas de schema durante el entrenamiento.
- Razonamiento con multiples rondas de interaccion (hasta 5 pasos configurados en el entorno RLVR).
- Capacidad multilingue centrada en japones e ingles (el split de SFT reserva aproximadamente el 10% de tokens supervisados a datos multilingues y generales).
- Capacidades multimodales (vision, audio, any-to-any): presentes en la arquitectura del modelo base, pero no ajustadas en esta fase y, por tanto, no garantizadas como capacidades entrenadas.
- Modo "thinking" o decodificacion especulativa: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente con base documental: el modelo puede resolver preguntas sobre manuales y bases de conocimiento en japones, manejando las rondas de aclaracion necesarias hasta 5 turnos, segun la receta RLVR configurada.
- Asistentes RAG sobre corpus internos: util para responder sobre colecciones de documentos con deteccion de conflictos entre versiones, gracias a las familias de tareas de single/multi-document y source conflict del entrenamiento.
- Generacion de codigo y tareas de programacion competitiva: el dataset incluye coding competitivo y verifica las respuestas con verificadores deterministas, lo que lo hace util en pipelines donde la correccion es comprobable.
- Automatizacion de agentes con herramientas: las familias de tool trajectory y tool failure recovery permiten desplegarlo en flujos que llaman a APIs y deben recuperarse de fallos.
- Extraccion y validacion de datos estructurados: genera JSON u otros formatos conforme a esquema, apropiado para tareas de parsing y transformacion en ETL.
- Moderacion e inyeccion de prompt: entrena especificamente tareas de prompt injection y limites de permisos, util para endurecer asistentes expuestos a entradas no confiables.
- Evaluacion comparativa de trayectorias de RL: investigacion sobre el impacto de GRPO, Dynamic Sampling y learning rates bajos comparando los 11 savepoints con una misma eval congelada.
- Filtrado y respuesta con abstención: casos donde el coste de un falso positivo es alto (legal, medico, compliance), aprovechando la familia de QA abstention.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que este checkpoint no tiene una puntuacion de validacion independiente asociada, y que los rewards de rollout que figuran en los logs de entrenamiento reflejan senales online dependientes de la dificultad del problema, del Dynamic Sampling y de la propia policy, por lo que no deben usarse para rankear checkpoints. La comparacion valida requiere ejecutar la misma evaluacion congelada sobre los 11 savepoints con los mismos parametros de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 24 GB de pesos (22,3 GiB) mas overhead de activaciones y KV cache; con contexto largo y batch, conviene reservar del orden de 40-48 GB.
- GPU recomendadas: A100 40 GB / 80 GB, H100 80 GB, L40S 48 GB. Un A100 80 GB o un H100 permiten batch y contexto comodos.
- Consumer GPU: cabe teoricamente en RTX 4090 / 5090 (24-32 GB) en BF16 con contexto corto y batch 1, aunque el margen es muy estrecho. No se publican cuantizaciones GGUF/INT, por lo que no hay una ruta estandar de reduccion de peso para GPUs de 12-16 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado como backend de rollout en el entrenamiento, con tensor parallel size 2) y cualquier stack compatible con safetensors BF16 (TGI, SGLang). No se documentan soportes para llama.cpp, Ollama ni MLX.
- Latencia y throughput: no disponible. La model card no publica metricas de inferencia, solo las condiciones de entrenamiento (16 H100 SXM, vLLM con TP=2 durante el rollout).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de otros modelos comparables documentados en la informacion proporcionada. Solo se puede comparar con su linaje directo, todos ellos publicados por el mismo autor bajo la misma licencia Gemma 4:

| Modelo | Relacion | Parametros | Notas |
|---|---|---|---|
| `vosldtgbj/project-llm-rlvr-dynamic-v2-step-25` | Este modelo | 11.959.730.224 (safetensors) / 12.484.280.320 (card) | RLVR v2, step local 25 / acumulado 150, BF16 full-weights |
| `vosldtgbj/project-llm-rlvr-v1-step-125` | Modelo padre directo | No disponible | Punto de partida del RLVR v2, learning rate 1e-6 |
| `vosldtgbj/project-llm-rlvr-dynamic-v2-step-50` | Savepoint siguiente en la trayectoria | No disponible | Misma receta pero 25 updates mas |
| `google/gemma-4-12B-it` | Base original | No disponible | Sin las fases CPT, SFT v3 ni RLVR del proyecto |

Comparacion con alternativas externas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Sin evaluacion independiente publicada: el autor advierte que los rewards online no permiten rankear checkpoints; no hay validacion congelada asociada a este step.
- Riesgo de alucinacion: aunque las familias de QA, abstención y source conflict estan en el dataset, no se ha publicado una tasa de alucinacion medida. Los checkpoints intermedios de RL pueden degradar formatos si se evaluan fuera del entorno de entrenamiento.
- Multimodalidad no entrenada: pese a la pipeline `any-to-any` y la etiqueta `image-text-to-text`, las torres de vision y audio y los proyectores permanecen congelados; no debe asumirse calidad en tareas de imagen o audio.
- Cobertura de idiomas limitada a japones e ingles: no hay soporte declarado de castellano ni de otros idiomas.
- Longitud de contexto no especificada: aunque la receta de RLVR usa 10.240 tokens totales, no se confirma la ventana nativa del modelo empaquetado.
- Licencia Gemma 4: impone condiciones de uso (terminos de uso de Gemma, aviso de uso prohibido y obligaciones de atribucion); conviene revisar la licencia antes de cualquier despliegue comercial.
- No es reanudable de forma bit-exacta: no se archivan optimizer, scheduler, RNG, dataloader cursor ni shards de FSDP/DTensor, por lo que solo sirve para inferencia, evaluacion o inicializacion de nuevos entrenamientos.
- Sesgos conocidos: no disponibles en la informacion proporcionada. El corpus de entrenamiento esta dominado por 104 libros blancos (hakusho) japoneses publicos y por datos generales multilingues, lo que puede introducir un sesgo tematico hacia contenidos administrativos y de politica publica japonesa.
- Estado experimental: 0 descargas y 0 likes en el momento de consulta, sin reportes externos de comportamiento ni reproducibilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-25
- Modelo padre directo (RLVR v1 step 125): https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-125
- Savepoint siguiente (RLVR dynamic v2 step 50): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-50
- Dataset SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR unificado v2: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset RLVR de dominio v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
