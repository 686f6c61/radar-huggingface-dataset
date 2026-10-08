# vosldtgbj/project-llm-sft-v3-l2-h2p0-seed20261006

## Resumen

Project LLM SFT v3 (L2--h2p0--seed20261006) es un ajuste supervisado (SFT) publicado por el usuario vosldtgbj sobre el modelo base vosldtgbj/project-llm-cpt-1p0-top10-02-lora-15, que a su vez deriva de una fase de continued pre-training (CPT 1.0) sobre la arquitectura Gemma 4. Se trata, por tanto, de la tercera iteración de un pipeline experimental de ajuste, no de un modelo fundacional original. El repositorio contiene únicamente los pesos completos ya fusionados (la LoRA se ha mergeado), sin estados de optimizador ni checkpoints intermedios, y está pensado para reproducción de experimentos, evaluación offline e investigación posterior.

El modelo tiene 11.959.730.176 parámetros totales (unos 12 mil millones) y se distribuye en safetensors por shards, con un tamaño de repositorio de 24,0 GB, lo que es coherente con pesos en bf16/fp16. La arquitectura declarada es gemma4_unified, la misma que emplea la familia Gemma 4 de Google, y el pipeline es any-to-any, con etiquetas que apuntan a entrada image-text-to-text, es decir, capacidades multimodales (texto e imagen). No es un modelo MoE declarado.

La relevancia de esta ficha es limitada pero concreta: es un caso típico de modelo experimental derivado, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con información muy escasa más allá de los hiperparámetros de entrenamiento. Sirve como ejemplo de flujo CPT + SFT con RSLoRA sobre una base multimodal de la familia Gemma 4, y su licencia apache-2.0 convive con la licencia upstream de Gemma 4, que impone condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (familia Gemma 4, transformer multimodal) |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors en precision completa; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible con precision; etiquetado como japanese, model card redactada en chino, base Gemma 4 multilingue sin lista documentada |
| Licencia | apache-2.0, sujeta ademas a la licencia Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (sharded) |

## Arquitectura y entrenamiento

La arquitectura es gemma4_unified, una variante unificada multimodal de la familia Gemma 4 que procesa entradas de imagen y texto y genera texto (pipeline any-to-any, tag image-text-to-text). No se especifica en la informacion disponible si emplea atencion densa clasica, atencion lineal, SSM hibrida ni si incorpora mezcla de expertos; el dato no aparece en la model card ni en los tags. El modelo se carga con `AutoModelForMultimodalLM` y `AutoProcessor`, lo que confirma el caracter multimodal y la dependencia de una version de Transformers que soporte el identificador `gemma4_unified`.

El entrenamiento consta de dos etapas documentadas. Primero, un continued pre-training (CPT 1.0, una epoch) que produce el checkpoint cpt1-lora-15. Despues, una fase de SFT v3 con una mezcla de 90 % de datos de dominio y 10 % de datos generales, durante 2,0 epochs. El metodo es RSLoRA SFT con rango r=128, alpha=32, dropout=0,05 y learning rate 2e-5, tras lo cual la adaptacion se fusiona en los pesos completos. El nombre del checkpoint, L2--h2p0--seed20261006, sugiere una configuracion de nivel 2 con un hiperparametro h=2.0 y semilla fija, pero no se detalla su significado. No se documentan composicion del dataset, numero de tokens de entrenamiento, ni si hubo RLHF, DPO o preferencia humana.

## Capacidades

- Generacion de texto multimodal: acepta entradas de imagen y texto (pipeline any-to-any, tag image-text-to-text) y produce texto como salida.
- Capacidad declarada japonesa: el tag japanese indica ajuste o enfasis en ese idioma, aunque no se detalla el grado de cobertura.
- Ajuste supervisado sobre dominio: la mezcla 90 % dominio / 10 % general apunta a una especializacion en un dominio concreto que no se especifica en la model card.
- Conversacion multi-turno: al derivar de una base Gemma 4 con procesador asociado, se espera soporte de chat, aunque no se documenta plantilla ni formato.
- Tool calling / function calling: no disponible; no se declara soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se declara soporte.
- Modo thinking o razonamiento explicito: no disponible.
- Capacidades de audio: no disponible (no se declara entrada de audio).
- Vision: soportada por el tag image-text-to-text y el pipeline any-to-any.

## Casos de uso

- Reproduccion de experimentos de ajuste: el repositorio existe explicitamente para reproducir la configuracion RSLoRA SFT (r=128, alpha=32, dropout=0,05, LR=2e-5) sobre el checkpoint CPT cpt1-lora-15, lo que permite auditar la receta de entrenamiento.
- Evaluacion offline comparativa: al ser un checkpoint intermedio de una serie (v3), sirve para medir el impacto de las distintas rondas de SFT sobre el mismo modelo base antes de integrarlo en produccion.
- Investigacion academica sobre continued pre-training mas SFT: la secuencia CPT 1.0 + SFT v3 con datos de dominio es un caso de estudio para analizar como afecta el pre-entrenamiento continuado al rendimiento posterior.
- Prototipado multimodal en japones: dado el tag japanese y el soporte image-text-to-text, puede emplearse en experimentos internos de descripcion o consulta sobre imagenes en ese idioma, siempre que se valide la calidad real.
- Punto de partida para nuevos ajustes: al publicarse los pesos completos ya fusionados, puede actuar como base para posteriores LoRA o fine-tuning en un dominio distinto al original.
- Analisis de especializacion por dominio: la mezcla 90/10 permite estudiar como se comporta un modelo de ~12B cuando se prioriza un dominio concreto frente a datos generales.
- Despliegue interno en un servicio de inferencia: con 12B parametros cabe en una GPU de 24 GB en cuantizacion de 8 bits, lo que permite servirlo en entornos de laboratorio con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 24 GB solo para pesos, mas memoria para cache KV y activaciones; se recomienda al menos 40 GB para contexto amplio.
- VRAM estimada en int8: aproximadamente 12-13 GB para pesos, viable en GPUs de 24 GB con margen.
- VRAM estimada en int4: aproximadamente 7-8 GB para pesos, apto para GPUs de 12 GB, aunque con perdida de calidad no medida por falta de benchmarks.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, o dos RTX 4090 de 24 GB.
- GPU consumer: cabe en RTX 4090 y RTX 3090 (24 GB) en int8 o bf16 con offloading; en RTX 3060 12 GB o RTX 4070 Ti solo en cuantizacion int4.
- Opciones de despliegue: Transformers con `AutoModelForMultimodalLM` (requiere version que soporte `gemma4_unified`); vLLM para servido de alto rendimiento siempre que la arquitectura este soportada; TGI. llama.cpp y Ollama requeririan convertirlo a GGUF, formato que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible.
- Nota: al ser un modelo multimodal, el consumo de memoria puede aumentar por el codificador de vision y el procesamiento de imagenes.

## Comparativa con modelos similares

No hay datos de benchmarks del modelo que permitan una comparacion de rendimiento fiable. A continuacion se comparan unicamente atributos estructurales verificables; el resto se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| project-llm-sft-v3-l2-h2p0-seed20261006 | ~12B | no disponible | apache-2.0 + licencia Gemma 4 | HuggingFace, 0 descargas | no disponible |
| Gemma 2 9B (referencia de tamano similar) | 9B | 8K | Gemma license | ampliamente disponible | si (publicos) |
| Gemma 3 12B (referencia de tamano similar) | 12B | 128K | Gemma license | ampliamente disponible | si (publicos) |

La comparativa de rendimiento es no disponible porque este checkpoint no publica MMLU, HumanEval, GSM8K ni metricas multimodales, y no se ha podido verificar su arquitectura exacta frente a las variantes oficiales de Gemma.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no deberia usarse en produccion sin una evaluacion propia.
- Modelo experimental y sin traccion: 0 descargas y 0 likes; no hay validacion comunitaria ni issues conocidos.
- Sesgos: no disponible; no se documenta analisis de sesgos ni composicion del dataset de SFT.
- Riesgo de alucinacion: no medido. Al haberse ajustado con 90 % de datos de dominio y solo un 10 % de datos generales, es esperable una degradacion del conocimiento general fuera del dominio y una mayor propension a respuestas incorrectas en temas no cubiertos.
- Contexto e idioma: la longitud de contexto no se declara y la cobertura idiomatica no esta documentada; el unico idioma etiquetado es el japones.
- Licencia: aunque el repositorio indica apache-2.0, la propia model card remite a la licencia de Gemma 4, que impone restricciones de uso (incluidas limitaciones para uso comercial en determinados supuestos y obligaciones de atribucion). Debe revisarse antes de cualquier despliegue comercial.
- Dependencia de version de Transformers: requiere una version que soporte `gemma4_unified`; en versiones antiguas el modelo no cargara.
- Sin datos de cuantizacion: no se publican GGUF, AWQ o GPTQ, por lo que el despliegue en herramientas como llama.cpp u Ollama exige conversion previa y no verificada.
- Trazabilidad limitada: no se detalla el dataset, los tokens de entrenamiento ni el dominio concreto, lo que dificulta auditar el comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-sft-v3-l2-h2p0-seed20261006
- Modelo base: https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-02-lora-15
- Licencia Gemma 4 referenciada: https://ai.google.dev/gemma/docs/gemma_4_license
- vLLM (motor de inferencia recomendado): https://github.com/vllm-project/vllm
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Plantilla de referencia para SFT de LLM open source: https://github.com/vpoluyaktov/llm-sft-test
