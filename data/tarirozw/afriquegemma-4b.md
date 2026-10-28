# tarirozw/AfriqueGemma-4B

## Resumen

AfriqueGemma-4B es un modelo de lenguaje causal de tipo base (pre-entrenado, sin ajuste por instrucciones) de 4.300.079.472 parámetros, desarrollado por el equipo McGill-NLP dentro de la suite AfriqueLLM. Se construye mediante continued pre-training (CPT) sobre google/gemma-3-4b-pt con el objetivo de mejorar el rendimiento en 20 lenguas africanas sin degradar las lenguas de altos recursos. El corpus de adaptación asciende a unos 26.000 millones de tokens.

El problema que aborda es la baja cobertura de las lenguas africanas en los modelos abiertos: Gemma 3 4B obtiene un 40,31 de media en el conjunto de evaluación multilingüe de la suite, mientras que esta variante alcanza 47,88 (+7,6 puntos, +18,8 %). La mejora es especialmente marcada en traducción (FLORES eng->xxx pasa de 35,36 a 54,95) y en tareas de comprensión (Belebele de 45,79 a 50,52; INJONG de 55,52 a 69,28).

Es relevante ahora porque demuestra que un presupuesto de cómputo moderado (hasta 64 H100) y un modelo de 4B pueden cerrar buena parte de la brecha lingüística, y porque publica la receta completa (datos, hiperparámetros, infraestructura) bajo licencia cc-by-4.0. Conviene tener en cuenta que el repositorio indexado es tarirozw/AfriqueGemma-4B, mientras que la model card y los enlaces de despliegue apuntan a McGill-NLP/AfriqueGemma-4B; se trata de una réplica del checkpoint original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), modelo causal de lenguaje de tipo base |
| Parámetros totales | 4.300.079.472 (4,3B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens nativos según la model card; el entrenamiento se realizó con 16.384 tokens |
| Tipos de cuantización | no se publican pesos cuantizados en el repositorio; al ser safetensors/BF16 se puede cuantizar a FP8, INT8 e INT4 (GGUF/AWQ/GPTQ) con herramientas externas |
| Idiomas soportados | 20 lenguas africanas (af, am, ar, ha, ig, mg, ny, om, rw, sn, so, st, sw, ti, tn, xh, yo, zu y variedades de árabe) más en, fr, pt como lenguas de altos recursos; 21 códigos ISO en la metadata |
| Licencia | cc-by-4.0 (modelo derivado de Gemma 3, sujeto además a los Gemma Terms of Use de Google) |
| Formato de pesos | safetensors (repositorio de 10,0 GB); no hay GGUF oficial |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 4B: un transformer decoder-only con atención agrupada por consultas y RoPE, del que se reutilizan íntegramente los pesos como punto de partida. No se modifica la topología ni el tokenizador; el trabajo consiste en continued pre-training sobre un corpus multilingüe fuertemente sesgado hacia lenguas africanas, con el objetivo explícito de mitigar el olvido catastrófico en inglés, francés, portugués y árabe.

La composición del corpus es: aproximadamente 22.800 millones de tokens de datos monolingües africanos procedentes de FineWeb2, WURA y MADLAD-400; 1.000 millones de tokens de código (CornStack-Python) para sostener el razonamiento; 1.000 millones de tokens de matemáticas (FineMath-4+) y 324 millones de tokens sintéticos generados traduciendo contenido específico de 10 dominios con GPT-4.1. El muestreo usa UniMax, con un tope de aproximadamente 1.000 millones de tokens por lengua de altos recursos y sobremuestreo de las lenguas de bajos recursos hasta cinco épocas. El entrenamiento empleó LLaMA-Factory sobre hasta 64 NVIDIA H100, con DeepSpeed ZeRO-1/ZeRO-2, Flash Attention 3, sequence packing y optimizaciones de Liger Kernel, learning rate de 5e-5 con warmup y decaimiento coseno, optimizador AdamW y precisión mixta BF16.

## Capacidades

- Generación de texto y modelado de lenguaje en 20 lenguas africanas, con especial énfasis en las familias bantú, semítica, cushítica y volta-niger.
- Traducción automática, especialmente en la dirección inglés->lengua objetivo (FLORES eng->xxx: 54,95 frente a 35,36 del modelo base).
- Comprensión lectora multilingüe y respuesta a preguntas (Belebele 50,52; AfriMMLU 36,73).
- Razonamiento matemático de nivel básico-intermedio, reforzado con FineMath-4+ (AfriMGSM 14,86).
- Generación de código Python, gracias al 1B de tokens de CornStack-Python incluido en el corpus.
- Inferencia de relaciones textuales (AfriXNLI 39,62) y clasificación temática (SIB-200 69,21).
- Capacidad multilingüe cruzada: al conservar los datos de altos recursos, mantiene utilidad en inglés, francés, portugués y árabe.
- Tool calling / function calling: no disponible; el modelo es base y no ha recibido ajuste por instrucciones ni entrenamiento de agentes.
- Modo thinking, audio o agentes multi-paso: no disponible.
- Visión: el modelo base Gemma 3 4B es multimodal y las etiquetas del repositorio incluyen image-text-to-text, pero la model card describe el checkpoint como causal LM, el ejemplo de carga usa AutoModelForCausalLM y no se publican evaluaciones de imagen. No confirmado.

## Casos de uso

- Traducción inglés->lengua africana en producción editorial: con 54,95 en FLORES eng->xxx, el modelo es adecuado como primer motor de traducción para suajili, yoruba, hausa, zulú o amárico, con revisión humana posterior en textos sensibles.
- Atención al cliente en lenguas locales: permite mantener conversaciones multi-turno con 8.192 tokens de contexto en suajili, somalí o kinyarwanda, aunque al no estar ajustado por instrucciones requiere un prompt de few-shot o un fine-tuning posterior sobre instrucciones.
- Generación y autocompletado de texto en medios locales: redacción asistida de noticias y boletines en lenguas de bajos recursos donde los modelos generalistas producen texto incoherente.
- Etiquetado y clasificación de corpus: clasificación temática y análisis de sentimiento sobre datasets en lenguas africanas, aprovechando SIB-200 (69,21) y AfriXNLI (39,62) como referencia de partida.
- Construcción de datasets sintéticos: generación de texto en lenguas africanas para aumentar corpus de entrenamiento de otros modelos, un uso habitual de los modelos base multilingües.
- Investigación en lingüística computacional: evaluación de transferencia entre lenguas emparentadas (por ejemplo, bantú: zulú, xhosa, shona, suajili, nyanja) y estudio del olvido catastrófico bajo distintos regímenes de muestreo.
- Asistencia a la programación en contextos multilingües: generación de Python con comentarios o explicaciones en lengua local, gracias al 1B de tokens de código del corpus.
- Base para fine-tuning supervisado (SFT) por dominio: al ser un checkpoint base, es un punto de partida razonable para ajustar un asistente instruccional en una lengua concreta con un dataset pequeño.

## Benchmarks y rendimiento

Resultados publicados en la model card. FLORES se reporta solo en la dirección inglés->lengua objetivo.

| Modelo | AfriMGSM | AfriMMLU | AfriXNLI | Belebele | FLORES (eng->xxx) | INJONG | SIB-200 | Media |
|---|---|---|---|---|---|---|---|---|
| Gemma 3 4B (base) | 10,24 | 33,89 | 37,76 | 45,79 | 35,36 | 55,52 | 63,59 | 40,31 |
| AfriqueGemma-4B | 14,86 | 36,73 | 39,62 | 50,52 | 54,95 | 69,28 | 69,21 | 47,88 |
| Qwen3-4B (base) | 8,26 | 33,84 | 37,12 | 41,50 | 20,16 | 21,69 | 57,88 | 31,49 |
| AfriqueQwen-4B | 33,09 | 43,04 | 44,88 | 63,62 | 59,82 | 65,34 | 74,77 | 54,94 |
| Qwen3.5-4B (base) | 20,79 | 38,63 | 40,36 | 55,82 | 32,06 | 59,43 | 74,96 | 46,01 |
| AfriqueQwen3.5-4B | 30,47 | 43,66 | 41,05 | 66,01 | 63,55 | 75,46 | 79,66 | 57,12 |
| Gemma 3 12B (base) | 25,21 | 48,76 | 44,01 | 68,84 | 44,09 | 73,53 | 79,17 | 54,80 |
| AfriqueGemma-12B | 32,14 | 49,47 | 44,60 | 68,65 | 65,04 | 76,79 | 75,08 | 58,82 |

Delta de AfriqueGemma-4B frente a Gemma 3 4B: +7,57 puntos de media (+18,8 %). El mayor salto relativo se da en FLORES (+19,59 puntos) e INJONG (+13,76). No se han publicado resultados en benchmarks de propósito general (MMLU, HumanEval, GSM8K en inglés) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): BF16 ≈ 8,6 GB; FP8/INT8 ≈ 4,3 GB; INT4 ≈ 2,2-2,6 GB. Con caché KV para 8.192 tokens y overhead de runtime, prever un 20-40 % adicional.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S permiten BF16 con lotes grandes y contexto completo. El entrenamiento se hizo con hasta 64 H100.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en BF16 con margen; en RTX 4080/4070 Ti (16 GB) en BF16 justo o en INT8; en RTX 3060 12 GB y RTX 4060 Ti 16 GB es viable en INT8 o INT4. En GPUs de 8 GB solo con cuantización INT4 agresiva y contexto reducido.
- Despliegue: vLLM y SGLang están documentados por el autor para exponer una API compatible con OpenAI; también es compatible con transformers, TGI (etiqueta text-generation-inference) y con llama.cpp/Ollama previa conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media multilingüe (suite) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriqueGemma-4B | 4,3B | 8.192 | 47,88 | cc-by-4.0 (+ Gemma Terms) | HuggingFace, 0 descargas en el repositorio indexado |
| Gemma 3 4B PT | 4,3B | 128K según Google | 40,31 | Gemma Terms of Use | HuggingFace, ampliamente utilizado |
| AfriqueQwen-4B | ~4B | no disponible en la información | 54,94 | no disponible en la información | HuggingFace (McGill-NLP) |
| Qwen3-4B Base | ~4B | 32.768 | 31,49 | Apache 2.0 | HuggingFace, muy extendido |
| AfriqueGemma-12B | ~12B | no disponible en la información | 58,82 | no disponible en la información | HuggingFace (McGill-NLP) |

La comparativa interna de la suite sitúa a AfriqueQwen-4B (54,94) y AfriqueQwen3.5-4B (57,12) por delante de AfriqueGemma-4B (47,88) en la media de las siete tareas, mientras que este último supera a Qwen3.5-4B sin adaptar (46,01). El contexto nativo de 8.192 tokens es la limitación comparativa más clara frente a Qwen3-4B (32K) y frente a las 128K que anuncia Google para Gemma 3.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones ni por preferencias humanas (sin RLHF/DPO). No responde de forma fiable a formato conversacional ni a instrucciones directas sin few-shot o fine-tuning adicional.
- Riesgo elevado de alucinación y de continuaciones incoherentes en modo zero-shot, especialmente en las lenguas con menos datos (por ejemplo, tigriña, oromo o malgache).
- Cobertura desigual: el corpus limita las lenguas de altos recursos a ~1.000 millones de tokens y sobremuestrea las de bajos recursos hasta cinco épocas, lo que puede producir sobreajuste en las lenguas con menos datos originales.
- El contexto efectivo es de 8.192 tokens según la model card, aunque el entrenamiento usó 16.384. No hay evaluación publicada del rendimiento más allá de 8K.
- La licencia declarada es cc-by-4.0, pero al derivar de Gemma 3 se heredan los Gemma Terms of Use de Google, que imponen restricciones de uso (incluida la prohibición de ciertos usos y obligaciones de atribución). Conviene revisar ambas licencias antes de un despliegue comercial.
- Visión no verificada: el repositorio etiqueta el modelo como image-text-to-text, pero no se publican pesos de visión evaluados ni ejemplos de uso multimodal. No asumir capacidades de imagen en producción.
- Discrepancia de identidad: el repositorio indexado es tarirozw/AfriqueGemma-4B, mientras que la model card, el código de ejemplo y los enlaces de despliegue apuntan a McGill-NLP/AfriqueGemma-4B. Verificar la procedencia del checkpoint antes de usarlo.
- Adopción prácticamente nula en el repositorio indexado (0 descargas, 0 likes en la fecha de creación), sin informes externos de validación independiente.
- No hay pesos cuantizados publicados; cualquier despliegue en GGUF, AWQ o GPTQ requiere conversión y validación propias.
- No dispone de soporte documentado de tool calling, agentes ni modo de razonamiento extendido.

## Enlaces

- Repositorio indexado: https://huggingface.co/tarirozw/AfriqueGemma-4B
- Repositorio original de la suite: https://huggingface.co/McGill-NLP/AfriqueGemma-4B
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Modelo hermano de mayor tamaño: https://huggingface.co/McGill-NLP/AfriqueGemma-12B
- Modelo comparable de la suite: https://huggingface.co/McGill-NLP/AfriqueQwen-4B
- Artículo de referencia: https://arxiv.org/abs/2601.06395
- Proveedor de inferencia gestionada: https://featherless.ai/models/McGill-NLP/AfriqueGemma-4B
- Ficha de catálogo: https://genaihub.net/agents/hf-model-mcgill-nlp-afriquegemma-4b
