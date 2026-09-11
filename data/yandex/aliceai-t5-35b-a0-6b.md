# yandex/AliceAI-T5-35B-A0.6B

## Resumen

AliceAI-T5-35B-A0.6B es un modelo base de lenguaje con arquitectura encoder-decoder y capas MoE (mixture of experts) dispersas, desarrollado por Yandex. Cuenta con 34.561.885.184 parametros totales repartidos en 512 expertos por capa MoE con enrutamiento top-8, y una fraccion activa por token que la nomenclatura del modelo situa en torno a 0,6 mil millones de parametros (A0.6B). El encoder tiene 16 capas y 12 cabezas de atencion; el decoder tiene 12 capas con 12 cabezas de consulta y 4 cabezas KV, con dimension de cabeza 128 y dimension oculta de 1536.

El modelo emplea un vocabulario de 135.040 tokens, embeddings compartidos entre encoder y decoder y atados a la LM head, activacion SiLU, normalizacion RMSNorm y representaciones posicionales RoPE con YaRN, lo que le permite manejar un contexto de hasta 128.000 tokens. Lleva la etiqueta UL2, lo que apunta a un objetivo de preentrenamiento tipo denoising unificado, y se publica como modelo base, no alineado con instrucciones.

Es relevante ahora porque combina una ventana de contexto muy larga con un coste de inferencia teoricamente bajo gracias a la activacion dispersa, y porque publica resultados competitivos en tareas de factualidad y contexto largo frente a modelos densos de tamano comparable o superior. El repositorio ocupa 69,1 GB y la model card esta redactada principalmente en ruso, con soporte de codigo personalizado que exige `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con capas MoE dispersas (top-8 de 512 expertos); objetivo UL2 |
| Parametros totales | 34.561.885.184 (34,56 mil millones) |
| Parametros activos | Aproximadamente 0,6 mil millones segun la nomenclatura del modelo (A0.6B); no confirmado de forma explicita en la model card |
| Longitud de contexto | 128.000 tokens (RoPE con YaRN) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; el ejemplo oficial usa bfloat16) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los benchmarks incluyen tareas en ruso) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers, con codigo de modelo personalizado) |
| Vocabulario | 135.040 tokens |
| Dimension oculta | 1536 |
| Encoder | 16 capas, 12 cabezas de atencion |
| Decoder | 12 capas, 12 cabezas de consulta, 4 cabezas KV |
| Dimension de cabeza | 128 |
| Expertos por capa MoE | 512, enrutamiento top-8 |
| Dimension intermedia del experto | 512 |
| Activacion / normalizacion | SiLU / RMSNorm |
| Embeddings | Compartidos entre encoder y decoder, atados a la LM head |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder con capas de mezcla de expertos dispersas. Cada capa MoE contiene 512 expertos con dimension intermedia de 512, de los cuales se seleccionan 8 por token mediante enrutamiento top-8. El encoder consta de 16 capas con 12 cabezas de atencion; el decoder consta de 12 capas con 12 cabezas de consulta y 4 cabezas KV, lo que implica atencion con consultas agrupadas (GQA) para reducir el coste de la cache KV. La activacion es SiLU y la normalizacion RMSNorm. Las representaciones posicionales son RoPE con extension YaRN, lo que sostiene la ventana de 128.000 tokens.

El modelo lleva la etiqueta `ul2`, asociada a un objetivo de preentrenamiento unificado de denoising con distintos modos de corrupcion, y expone tokens de control especificos (`[_S_]`, `<SPAN#0>`) en el tokenizador que se usan para marcar el modo de generacion y los spans, lo que refuerza la hipotesis de un preentrenamiento tipo UL2 con tareas de rellenado de spans. Los embeddings estan compartidos entre encoder y decoder y atados a la LM head. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; dado que se publica como modelo Base, lo mas probable es que no incluya alineacion por preferencias. Tampoco se detallan innovaciones de decodificacion especulativa ni mecanismos de atencion lineal. La model card remite al articulo de Yandex en Habr para mas detalle sobre el entrenamiento.

## Capacidades

- Generacion de texto en formato text2text (secuencia a secuencia), con encoder y decoder diferenciados.
- Razonamiento general: obtiene 78,5 en MMLU (5-shot) y 56,3 en MMLU Pro (CoT, 5-shot).
- Razonamiento cientifico: 41,3 en GPQA (5-shot).
- Matematicas: 84,7 en GSM8K (CoT, 8-shot) y 62,9 en MATH 500 (CoT, 4-shot).
- Generacion de codigo: 69,3 en HumanEval (5-shot) y 71,9 en MBPP (3-shot).
- Factualidad: 68,0 en CultCat (4-shot), 81,3 en WikiWebFacts (5-shot) y 60,5 en TriviaQA (5-shot).
- Contexto largo: 94,7 en Ruler 32K y 81,4 en Ruler 128K; 40,4 en YExtract (4-shot), orientado a extraccion.
- Uso como encoder independiente: la clase `AliceAIT5MoEEncoderModel` permite cargar solo el encoder y obtener representaciones (`last_hidden_state` de dimension 1536) para tareas de embedding o clasificacion.
- Ajuste fino eficiente: se proporciona `finetune_example.py` con PEFT LoRA sobre `tatsu-lab/alpaca`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el modelo es base y no incluye modo de pensamiento explicito.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: no declaradas en la model card; los benchmarks incluyen evaluaciones en ruso, lo que sugiere cobertura de ese idioma, pero no hay lista oficial.

## Casos de uso

- Procesamiento de documentos largos: con 128.000 tokens de contexto y un resultado de 81,4 en Ruler 128K, el modelo puede ingerir contratos, informes tecnicos o expedientes completos y generar resumenes o respuestas condicionadas sin trocear el texto.
- Extraccion de informacion estructurada: la tarea YExtract (40,4) y el uso de tokens de span (`<SPAN#0>`) apuntan a un uso directo para extraer campos concretos de texto no estructurado, con formato encoder-decoder que evita generar texto superfluo.
- Ajuste fino por dominio con LoRA: el repositorio incluye un ejemplo de entrenamiento con PEFT sobre alpaca, de modo que un equipo puede adaptar el modelo base a clasificacion, resumen o extraccion vertical sin reentrenar los 34,56 mil millones de parametros.
- Generacion asistida de codigo tras ajuste: con 69,3 en HumanEval y 71,9 en MBPP en su version base, es un punto de partida razonable para un modelo de autocompletado o generacion de funciones especializado en un lenguaje o framework concreto tras fine-tuning.
- Motor de representaciones (embedding) para busqueda semantica o reranking: al poder cargarse unicamente el encoder y devolver estados de dimension 1536, se puede usar en pipelines de recuperacion sobre corpus largos, con la ventaja de una ventana de 128K tokens por pasada.
- Respuesta a preguntas factuales sobre bases de conocimiento internas: los resultados en WikiWebFacts (81,3) y TriviaQA (60,5) lo situan como candidato para QA extractivo en dominios con documentacion de referencia.
- Preentrenamiento continuado o investigacion sobre MoE dispersas: al ser un modelo base con 512 expertos por capa, es util como banco de pruebas para estudiar enrutamiento, especializacion de expertos y tecnicas de compresion o poda.
- Resumen abstractivo de conversaciones o historiales largos: la combinacion de encoder-decoder y contexto extendido permite comprimir hilos de gran longitud en resumenes controlados por tokens de modo.

## Benchmarks y rendimiento

Resultados publicados en la model card, calculados en la infraestructura interna de Yandex sobre los modelos en version pretrain.

| Benchmark | T5 Gemma 2 4B-4B Base | Gemma 4 E4B Base | Qwen 3.5 2B Base | Qwen 3.5 4B Base | Qwen 3.5 35B-A3B Base | AliceAI-T5-35B-A0.6B Base |
|---|---|---|---|---|---|---|
| CultCat (4-shot, ruso) | 23,2 | 44,0 | 31,0 | 39,7 | 59,2 | **68,0** |
| WikiWebFacts (5-shot, ruso) | 33,6 | 47,2 | 23,6 | 42,1 | 62,4 | **81,3** |
| TriviaQA (5-shot) | 53,3 | 65,0 | 32,4 | 50,4 | **71,4** | 60,5 |
| MMLU (5-shot) | 54,5 | 71,7 | 65,4 | 77,0 | **84,4** | 78,5 |
| MMLU Pro (CoT, 5-shot) | 32,9 | 37,4 | 36,5 | 51,1 | **63,2** | 56,3 |
| GPQA (5-shot) | 30,0 | 34,0 | 31,6 | 38,8 | **47,1** | 41,3 |
| GSM8K (CoT, 8-shot) | 51,3 | 58,4 | 69,5 | 84,5 | **90,4** | 84,7 |
| MATH 500 (CoT, 4-shot) | 17,0 | 23,5 | 43,4 | 69,5 | **81,9** | 62,9 |
| HumanEval (5-shot) | 31,9 | 42,2 | 48,7 | 74,6 | **88,3** | 69,3 |
| MBPP (3-shot) | 52,4 | 54,4 | 42,6 | 61,1 | **75,4** | 71,9 |
| YExtract (4-shot, ruso) | 18,1 | 19,8 | 12,7 | 28,4 | **42,4** | 40,4 |
| Ruler 32K | 81,9 | 89,6 | 83,6 | 90,2 | 93,0 | **94,7** |
| Ruler 128K | 57,5 | 81,3 | 74,6 | 84,4 | **90,1** | 81,4 |

En la tabla original, la negrita marca el mejor resultado y el subrayado el segundo mejor. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los 34,56 mil millones de parametros ocupan aproximadamente 69 GB, en linea con el tamano del repositorio (69,1 GB). Se necesita al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) para cargar todos los pesos, mas el margen para cache KV de hasta 128K tokens.
- VRAM estimada en cuantizacion de 8 bits: en torno a 35 GB de pesos, lo que encaja en una A100 40 GB o repartido entre dos GPU de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 17-18 GB de pesos, por lo que podria caber en una RTX 4090 (24 GB) o una L40S, siempre con margen ajustado para activaciones y cache KV. Son estimaciones derivadas del recuento de parametros; el autor no publica cifras oficiales de VRAM.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090 24 GB para 4 bits con contextos moderados.
- El ejemplo oficial usa `device_map={"": "cuda:0"}`, es decir, una unica GPU, con `attn_implementation="eager"` y la alternativa comentada `flash_attention_2`.
- Opciones de despliegue: transformers con `AutoModelForSeq2SeqLM` y `trust_remote_code=True` es la via documentada. No hay confirmacion de soporte en vLLM, TGI, llama.cpp u Ollama, ni pesos GGUF publicados; dado que la arquitectura requiere codigo personalizado, el soporte en esos motores debe considerarse no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (5-shot) | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| AliceAI-T5-35B-A0.6B Base | 34,56B totales, ~0,6B activos | 128K | 78,5 | 84,7 | 69,3 | no disponible | HuggingFace, transformers con codigo propio |
| Qwen 3.5 35B-A3B Base | 35B totales (MoE) | no disponible | 84,4 | 90,4 | 88,3 | no disponible | HuggingFace |
| Qwen 3.5 4B Base | 4B densos | no disponible | 77,0 | 84,5 | 74,6 | no disponible | HuggingFace |
| T5 Gemma 2 4B-4B Base | 4B encoder + 4B decoder | no disponible | 54,5 | 51,3 | 31,9 | no disponible | HuggingFace |
| Gemma 4 E4B Base | no disponible | no disponible | 71,7 | 58,4 | 42,2 | no disponible | HuggingFace |

Frente a Qwen 3.5 35B-A3B, el modelo de Yandex queda por debajo en MMLU, matematicas y codigo, pero por delante en las tareas en ruso (CultCat, WikiWebFacts) y en Ruler 32K. Frente a los modelos densos de 4B (Qwen 3.5 4B, T5 Gemma 2 4B-4B, Gemma 4 E4B) presenta ventajas claras en contexto largo y factualidad, con un coste de activacion comparable gracias al enrutamiento disperso. Los datos de licencia y contexto de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones: no respondera de forma fiable a peticiones conversacionales sin un ajuste fino previo. La propia model card lo etiqueta como Base.
- La licencia no esta declarada en la informacion disponible, lo que impide determinar si se permite el uso comercial. Debe verificarse en el repositorio antes de cualquier despliegue en produccion.
- No se declara la lista de idiomas soportados. Los benchmarks incluyen tareas en ruso, pero no hay garantia de cobertura ni de calidad en castellano u otros idiomas.
- Rendimiento inferior al de Qwen 3.5 35B-A3B en MMLU Pro (56,3 frente a 63,2), MATH 500 (62,9 frente a 81,9) y HumanEval (69,3 frente a 88,3), con un coste de memoria similar por el numero de parametros totales, ya que todos los expertos deben residir en memoria.
- Requiere `trust_remote_code=True` y ejecuta codigo de modelo personalizado procedente del repositorio, lo que implica un riesgo de seguridad que debe evaluarse y auditarse antes de usarlo en entornos controlados.
- Riesgo de alucinacion inherente a un modelo base preentrenado sin alineacion por preferencias; los resultados de TriviaQA (60,5) y GPQA (41,3) indican margen de error apreciable en conocimiento factual y razonamiento cientifico.
- Ruler 128K baja a 81,4 frente a 94,7 en 32K, por lo que la calidad se degrada en el extremo superior de la ventana de contexto.
- Los benchmarks fueron calculados en infraestructura interna de Yandex sobre modelos en fase pretrain, sin detalle de la configuracion de evaluacion, por lo que su reproducibilidad externa no esta garantizada.
- No hay pesos GGUF ni soporte confirmado en motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp, Ollama), lo que limita las opciones de despliegue escalable.
- Tamano del repositorio de 69,1 GB: la descarga y el almacenamiento requieren planificacion de infraestructura.
- Cifras de parametros activos y de VRAM por cuantizacion son estimaciones derivadas, no datos publicados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Articulo tecnico de Yandex en Habr: https://habr.com/ru/companies/yandex/articles/1080654/
- Dataset usado en el ejemplo de ajuste fino: https://huggingface.co/datasets/tatsu-lab/alpaca
- Script de ajuste fino incluido en el repositorio: `finetune_example.py`
- No se han encontrado otros enlaces relevantes (papers, demos o repositorios adicionales) en la busqueda web realizada.
