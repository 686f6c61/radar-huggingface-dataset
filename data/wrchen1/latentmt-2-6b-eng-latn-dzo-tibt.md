# wrchen1/LatentMT-2.6B-eng-latn-dzo-tibt

## Resumen

LatentMT-2.6B-eng-latn-dzo-tibt es un adaptador LoRA para el modelo base ByteDance/Ouro-2.6B-Thinking, desarrollado por el equipo de LatentMT (Wei-Rui Chen et al.) para la traducción automática del par inglés (escritura latina) a dzongkha (escritura tibetana). El adaptador implementa el enfoque de razonamiento latente descrito en el paper "LatentMT: Machine Translation with Latent Reasoning" (arXiv:2607.18618), donde los pasos recurrentes adicionales se ejecutan dentro de los estados ocultos en lugar de generar tokens de cadena de pensamiento explícitos. Esto permite mejorar la calidad de traducción sin aumentar el coste de decodificación visible.

El modelo base Ouro-2.6B-Thinking es un modelo de 2.6 mil millones de parámetros con capacidades de razonamiento, publicado por ByteDance bajo licencia Apache 2.0. El adaptador, con una profundidad recurrente de 4 pasos, se entrena de forma ligera y consigue resultados comparables a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción, según el paper. Este repositorio en concreto solo contiene los pesos del adaptador (0.1 GB), no el modelo completo, y está pensado para investigación en traducción automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base Ouro-2.6B-Thinking) con adaptador LoRA y pasos recurrentes latentes (total_ut_steps=4) |
| Parametros totales | 2.6B (modelo base) + adaptador LoRA (tamano no especificado, repo de 0.1 GB) |
| Parametros activos | no disponible (el adaptador LoRA activa una fraccion de los parametros del base) |
| Longitud de contexto | no disponible (depende del modelo base Ouro-2.6B-Thinking) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base puede cargarse con torch_dtype="auto") |
| Idiomas soportados | ingles (eng_Latn) como origen, dzongkha (dzo_Tibt) como destino |
| Licencia | Apache 2.0 (tanto el adaptador como el modelo base) |
| Formato de pesos | safetensors (adaptador) y bin (alternativa); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo causal Ouro-2.6B-Thinking, un transformer de 2.6B parametros con capacidad de razonamiento. La innovacion principal de LatentMT es el uso de "razonamiento latente": en lugar de generar tokens de razonamiento visibles, el modelo ejecuta pasos recurrentes adicionales dentro de los estados ocultos (configurados mediante `total_ut_steps = 4`). Esto permite dedicar mas computacion interna a la traduccion sin aumentar la longitud de la secuencia generada, lo que reduce el coste de inferencia en comparacion con cadenas de pensamiento explicitas.

El entrenamiento se realiza mediante un adaptador LoRA (metodo PEFT) sobre el modelo base congelado. No se especifican en la informacion disponible el tamano del dataset, la composicion de los datos de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. El paper menciona que el entrenamiento es "ligero" y que el modelo se evalua en 32 direcciones de traduccion que cubren idiomas de alto, medio y bajo recurso. El adaptador se distribuye con los ficheros `adapter_config.json` y `adapter_model.safetensors`, y requiere las librerias `torch==2.7.1`, `transformers==4.56.2`, `peft>=0.10.0` y `bitsandbytes>=0.41.0`.

## Capacidades

- Traduccion automatica del ingles (escritura latina) al dzongkha (escritura tibetana), un par de idiomas de bajo recurso.
- Razonamiento latente: realiza pasos recurrentes internos (profundidad 4) que mejoran la calidad de traduccion sin generar tokens de razonamiento visibles.
- Integracion con el ecosistema Hugging Face Transformers y PEFT, permitiendo cargar el adaptador sobre el modelo base con pocas lineas de codigo.
- Compatible con generacion de texto estandar (pipeline `text-generation`), aunque su uso previsto es la traduccion.
- No se han documentado capacidades adicionales como tool calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Traduccion de documentos oficiales y legales entre ingles y dzongkha: el modelo puede procesar textos largos con contexto limitado (la longitud de contexto no esta especificada, pero el modelo base de 2.6B suele manejar ventanas de 4K-8K tokens) y producir traducciones fluidas en un idioma de bajo recurso donde los sistemas comerciales suelen fallar.
- Localizacion de contenido digital para Butan: organizaciones que necesiten traducir sitios web, aplicaciones o material educativo del ingles al dzongkha pueden usar este adaptador como base para un pipeline de traduccion automatica, aprovechando su licencia Apache 2.0 para integracion comercial.
- Investigacion en traduccion de idiomas de bajo recurso: el adaptador sirve como punto de partida para experimentos con tecnicas de razonamiento latente, permitiendo comparar la calidad frente a modelos de mayor tamano sin necesidad de entrenar desde cero.
- Generacion de datos sinteticos para entrenar otros modelos: las traducciones producidas por LatentMT pueden usarse para aumentar datasets de entrenamiento en dzongkha, especialmente en dominios donde los datos paralelos son escasos.
- Evaluacion comparativa de metodos de traduccion eficientes: investigadores pueden reproducir los resultados del paper y comparar el rendimiento de LatentMT con modelos densos de 7B-13B parametros en el mismo par de idiomas, midiendo calidad y coste computacional.
- Prototipado rapido de sistemas de traduccion en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 2.6B, puede ejecutarse en GPUs consumer (p. ej., RTX 3090) con cuantizacion, lo que facilita su uso en laboratorios o pequenas empresas sin infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el par eng_Latn-dzo_Tibt en la informacion disponible. El paper LatentMT afirma que, en 32 direcciones de traduccion, el modelo alcanza un rendimiento comparable a modelos de 3 a 5 veces mas grandes, pero no se proporcionan metricas numericas concretas (BLEU, chrF, etc.) en la model card ni en los resultados de busqueda. Por tanto, no se incluye tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Ouro-2.6B-Thinking en FP16 requiere aproximadamente 5.2 GB de VRAM, mas el adaptador LoRA (muy pequeno, ~0.1 GB). Con cuantizacion de 8 bits (bitsandbytes) puede reducirse a ~2.6 GB, y en 4 bits a ~1.5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (p. ej., RTX 2060, RTX 3060, RTX 4060). Para mayor velocidad, una RTX 3090 o RTX 4090 permite inferencia comoda con contexto largo.
- Si cabe en consumer GPU: si, en GPUs de gama media y alta. Con cuantizacion 4 bits puede ejecutarse incluso en GPUs con 4 GB de VRAM, aunque con menor velocidad.
- Opciones de despliegue: el adaptador se carga con Transformers y PEFT, por lo que puede usarse con vLLM, TGI o llama.cpp (si se convierte el modelo base a GGUF y se fusiona el adaptador). Tambien es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantizacion y la longitud de la secuencia. En una RTX 4090, un modelo de 2.6B en FP16 suele generar entre 50 y 100 tokens por segundo, pero no hay datos especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas especificas. Como referencia cualitativa, los modelos de traduccion mas comunes para idiomas de bajo recurso son NLLB-200 (Meta, 600M-54B parametros) y M2M100 (Facebook, 418M-12B parametros), ambos con licencia CC-BY-NC (no comercial). LatentMT se diferencia por su enfoque de razonamiento latente y su licencia Apache 2.0, que permite uso comercial. Sin embargo, no se han publicado comparaciones directas con estos modelos en el par eng-dzo en la informacion disponible.

## Limitaciones y advertencias

- El adaptador solo cubre el par ingles-dzongkha; no es un modelo multilingue general. Para otros pares de idiomas hay que buscar otros adaptadores de la familia LatentMT.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos web y paralelos, puede reflejar sesgos presentes en los corpus de origen (p. ej., dominios religiosos o administrativos en dzongkha).
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede producir traducciones incorrectas o inventar contenido, especialmente en contextos largos o con terminologia especializada. Se recomienda validacion humana para usos criticos.
- La longitud de contexto no esta especificada; si el modelo base tiene una ventana corta (p. ej., 4K tokens), documentos largos deberan dividirse en segmentos.
- El adaptador depende de la version exacta del modelo base (ByteDance/Ouro-2.6B-Thinking). Si el modelo base se actualiza o elimina, el adaptador podria dejar de funcionar.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar que el modelo base no tenga restricciones adicionales (en este caso, tambien es Apache 2.0, por lo que no hay impedimento).
- No se proporcionan garantias de rendimiento en produccion; el modelo esta pensado para investigacion, como indica su seccion "Intended Use".

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-dzo-tibt
- Paper LatentMT (arXiv): https://arxiv.org/pdf/2607.18618
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Repositorio alternativo del mismo adaptador (organizacion LatentMT): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-dzo-tibt
- Ejemplo de otro adaptador de la familia (eng-ltg): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-ltg-latn
