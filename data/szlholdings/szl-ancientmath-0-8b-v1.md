# SZLHOLDINGS/SZL-AncientMath-0.8B-v1

## Resumen

SZL-AncientMath-0.8B-v1 es un modelo de lenguaje de 873 millones de parametros publicado por SZLHOLDINGS, derivado mediante ajuste fino supervisado (SFT) del modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez pertenece a la familia Qwen 3.5. El modelo esta especializado en lo que el autor denomina "computacion matematica antigua certificada": razonamiento sobre procedimientos matematicos de siete tradiciones historicas (china, india, egipcia, babilonica, griega, andina y moderna), con enfasis en que toda solucion debe acompanarse de una cota de error explicita.

Su relevancia es mas experimental que practica. El propio autor reconoce que el entrenamiento se realizo sobre un conjunto de solo 24 ejemplos y que la evaluacion esta pendiente de una ablacion de tres condiciones. En la linea base reportada, tanto el modelo base como el modelo entrenado en razonamiento obtienen 0.0 en exactitud sobre 48 puzles certificados, lo que sugiere que la escala de 0.8B es insuficiente para resolverlos de forma exacta. Se trata, por tanto, de una pieza de investigacion sobre metodologia de entrenamiento y doctrina de uso honesto, no de un modelo listo para produccion.

El modelo se distribuye con licencia Apache 2.0, soporta exclusivamente ingles y esta orientado a generacion de texto conversacional con capacidad de razonamiento. Su interes principal reside en la filosofia de "salida no confiable": el autor insiste en que cualquier resultado del modelo debe tratarse como una propuesta a verificar, nunca como conocimiento certificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, segun tag `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de 16 bits tras el merge) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (merge en 16 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen 3.5, con 873 millones de parametros. El modelo se obtuvo mediante QLoRA SFT con Unsloth y TRL sobre una NVIDIA A6000, seguido de un merge en 16 bits para la publicacion. El modelo base es SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, un ajuste previo del mismo autor orientado a agentes de recibos, lo que implica que este modelo hereda dos capas de especializacion superpuestas.

El conjunto de entrenamiento, SZLHOLDINGS/ancient-math-reasoning-sft-v1, contiene 24 ejemplos que cubren siete tradiciones matematicas. La innovacion metodologica declarada no es arquitectonica sino epistemologica: cada ejemplo ensena que "un resultado sin su cota de error no es conocimiento", citando explicitamente a Liu Hui, Madhava, Arquimedes y los escribas babilonios, ademas de los guardianes de quipus andinos como inventores de registros a prueba de manipulacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico guiado por procedimientos historicos de siete tradiciones.
- Formulacion de cotas de error junto a los resultados, segun la doctrina de entrenamiento.
- Modo de razonamiento (tag `reasoning` en la model card).
- Soporte declarado de `text-generation-inference` y despliegue con transformers.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidad multimodal declarada en los tags (`image-text-to-text`), aunque no se documenta en la model card.
- No se documenta soporte de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Investigacion sobre metodologia de SFT: el modelo sirve como punto de datos en la ablacion de tres condiciones que el autor esta ejecutando sobre el mismo modelo base, util para estudiar como influye un dataset minusculo y muy especializado en el comportamiento de un modelo de 0.8B.
- Docencia de historia de las matematicas: puede generar explicaciones de procedimientos de Liu Hui, Madhava o los escribas babilonios, siempre que el docente verifique las cifras y las cotas de error aportadas.
- Prototipado de asistentes con doctrina de salida no confiable: util como banco de pruebas para disenar interfaces que presenten la salida del modelo como propuesta a validar, con indicacion explicita de incertidumbre.
- Experimentos de calibracion y cotas de error: el enfasis del entrenamiento en acompanar resultados con bounds permite estudiar si un modelo pequeno aprende a expresar incertidumbre, aunque la evidencia publicada es todavia preliminar.
- Base para futuros ajustes especializados: al ser un modelo pequeno con licencia Apache 2.0, puede servir como punto de partida para fine-tunes de dominio en entornos con recursos limitados.
- Evaluacion comparativa de tecnicas de merge QLoRA: el flujo Unsloth + TRL + merge 16-bit documentado permite reproducir y comparar pipelines de ajuste en una sola GPU A6000.
- Demostraciones educativas sobre limites de los modelos pequenos: el resultado de 0.0 en exactitud sobre 48 puzles certificados es un caso ilustrativo de que la escala importa en razonamiento exacto.

## Benchmarks y rendimiento

| Evaluacion | Modelo base | Modelo con razonamiento (este) | Metrica |
|---|---|---|---|
| 48 puzles certificados | 0.0 exacto | 0.0 exacto | exactitud exacta |

El autor indica que la evaluacion esta en estado `THREE_CONDITION_ABLATION_PENDING` y que este modelo constituye el tercer punto de datos de la ablacion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 1.8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0.5 GB.
- GPU recomendadas para entrenamiento: NVIDIA A6000 (la usada por el autor); cualquier GPU con 24 GB o mas permite reproducir el flujo QLoRA.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta su publicacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SZL-AncientMath-0.8B-v1 | 873 M | no disponible | Apache 2.0 | Matematicas historicas certificadas | Hugging Face |
| Qwen 3.5 0.8B (familia base) | ~0.8 B | no disponible | segun variante | Proposito general | Hugging Face |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 | ~0.8 B | no disponible | no disponible | Agente de recibos | Hugging Face |

No se dispone de datos de rendimiento comparativo con alternativas, por lo que la comparacion se limita a parametros, licencia y enfoque. Cualquier modelo de ~0.8B de proposito general de la misma familia resulta un punto de referencia natural, pero no se han publicado metricas que permitan situar a este fine-tune por encima o por debajo.

## Limitaciones y advertencias

- El propio autor califica la salida del modelo como "propuesta no confiable" (untrusted proposal); no debe usarse como fuente de verdad matematica.
- Exactitud de 0.0 sobre 48 puzles certificados: la escala de 0.8B es insuficiente para soluciones exactas segun el autor.
- Entrenamiento con solo 24 ejemplos, lo que implica un riesgo alto de sobreajuste y de generalizacion muy limitada.
- Evaluacion incompleta: la ablacion de tres condiciones esta pendiente.
- Soporte exclusivo de ingles; no se documenta multilinguismo.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en conversaciones largas.
- Riesgo elevado de alucinacion en cifras, procedimientos historicos y cotas de error, precisamente el ambito que el modelo pretende ensenar.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la calidad y fiabilidad del modelo no lo hacen apto para produccion sin validacion humana exhaustiva.
- No se documenta soporte de tool calling ni de agentes, pese a heredar de un modelo orientado a agentes de recibos.
- El tag `image-text-to-text` sugiere capacidades multimodales no confirmadas en la model card; conviene verificarlas antes de asumirlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-AncientMath-0.8B-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/ancient-math-reasoning-sft-v1
- Registros de la ola de entrenamiento: https://huggingface.co/SZLHOLDINGS/wave-logs
