# tensor-tailor/zils-mini-body-25

## Resumen

zils-mini-body-25 es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) desarrollado por el usuario tensor-tailor, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tune mediante LoRA sobre un "body" construido por media ponderada uniforme de cuatro modelos del pool de la subred 127 de Bittensor (denominada `d3-mini`). El modelo parte de la arquitectura Qwen3.5-4B, con tensores de lenguaje y visión en bf16, y está especializado en tareas de tipo examen con énfasis en Lenguaje y Artes.

El modelo resuelve el problema de construir un "decision body" competitivo dentro del ecosistema Zils, un pool de modelos donde distintos participantes aportan ingredientes que se combinan. El autor parte de una mezcla uniforme de cuatro modelos públicos (vllm-sr/d3-mini, perplexity-ai/pplx-decider-flash-v1.2, torchcast-ai/torchcast-decision-4b y Maincode/Matilda-Decision-v1-Mini) y aplica un fine-tune LoRA con una función de pérdida compuesta que combina entropía cruzada, Brier score y una divergencia KL contra los pesos de partida para evitar el olvido catastrófico.

Su relevancia es acotada: se trata de un modelo experimental de nicho, sin descargas ni likes en el momento de la consulta, orientado a un benchmark específico (las 15 familias de examen del ecosistema Zils) y no a un uso generalista. La información pública sobre capacidades, idiomas y rendimiento es muy limitada, y el propio autor restringe el alcance a un conjunto de datos de 985 filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B (chasis d3-mini), con capas de atención, Gated-DeltaNet y MLP; tensores de lenguaje y visión en bf16 |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5 B) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible (entrenamiento con máximo 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` y tag `qwen3_5`) |

## Arquitectura y entrenamiento

El modelo emplea el chasis d3-mini, que según la model card corresponde a la disposición de Qwen3.5-4B con tensores de lenguaje y visión en bf16. La arquitectura incluye proyecciones de atención, capas Gated-DeltaNet y proyecciones MLP (gate, up, down) en todas las capas de lenguaje. El punto de partida es una media ponderada uniforme de cuatro ingredientes públicos del pool, construida con la herramienta oficial `zils.soup.build`, con digest del body inicial `be40457ed0725abfe6a66d0e3cdb29bff6c206a71440d54382bbdca89c01a2fc` (hash de soup `20c02cae`).

El entrenamiento consistió en un LoRA de rango 32, alpha 64 y dropout 0,05 aplicado sobre las proyecciones de atención, Gated-DeltaNet y MLP de todas las capas de lenguaje. Se usó learning rate 5e-5, AdamW con weight decay 1,0 solo sobre los pesos LoRA, batch 8 sin acumulación, warm-up de 50 pasos seguido de coseno, 2 épocas, máximo 2.048 tokens y semilla 4359. La función de pérdida por fila combina entropía cruzada sobre la etiqueta, 1,0 × Brier score y 0,1 × divergencia KL entre el modelo de partida y el modelo actual (calculada en vivo con el adaptador desactivado), lo que ancla el modelo a su estado inicial. El adaptador se fusionó en bf16.

Los datos de entrenamiento son 985 filas (sha256 `41c69ab2496cf0576b362288a27f854df6f3032a1b1a8fb243a59d50cdb015e8`) de tipo examen en 15 familias conocidas: 13,1 % Razonamiento, 44,0 % Lenguaje, 15,2 % Recuperación, 15,2 % Herramientas y 12,5 % Artes. Las filas se seleccionaron de un conjunto congelado de 2.990 filas mediante `ft_swap_lscore.py`, exigiendo que el modelo de partida asignara entre 0,30 y 0,80 de probabilidad a la respuesta correcta. Las fuentes incluyen SST-5, MultiNLI, RTE, 20 Newsgroups y Schema-Guided Dialogue (DSTC8), con 150 filas sujetas a CC BY-SA 4.0 y 50 a SNLI también CC BY-SA 4.0. El 25,0 % de las filas provienen de generadores propios del autor.

## Capacidades

- Clasificación y decisión sobre preguntas de tipo examen en cinco categorías: razonamiento, lenguaje, recuperación, herramientas y artes.
- Formato de respuesta con etiquetas de elección múltiple, sí/no y puntuación (score), según la tabla de categorías de la model card.
- Razonamiento de tipo entailment (RTE, MultiNLI) y clasificación de sentimiento de 5 clases (SST-5).
- Clasificación de temas (20 Newsgroups).
- Tareas de diálogo orientado a esquemas y relleno de argumentos requeridos (Schema-Guided Dialogue / DSTC8).
- Capacidades de visión heredadas del chasis Qwen3.5-4B (tensores de visión presentes), si bien no se documenta su uso ni su calidad tras el fine-tune.
- Soporte de tool calling / function calling: no documentado explícitamente; la categoría "herramientas" del dataset sugiere entrenamiento en tareas de selección de funciones, pero no se detalla el mecanismo.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación de modelos en el pool Zils (Bittensor subnet 127): el modelo está diseñado como "body" de decisión para participar en el examen de 15 familias del ecosistema; se usaría como candidato a evaluar con el harness oficial del subnet.
- Clasificación de sentimiento de 5 clases en textos cortos: entrenado con 66 filas de SST-5, puede emplearse para etiquetar reseñas o comentarios con cinco niveles de polaridad, aunque el volumen de entrenamiento es reducido.
- Detección de entailment y contradicción en pares de frases: las 58 filas de RTE y las 91 de MultiNLI (en formatos de 3 vías y sí/no) permiten usarlo en pipelines de verificación de afirmaciones o deduplicación semántica.
- Clasificación temática de documentos: con 50 filas de 20 Newsgroups, puede asignar textos a categorías temáticas en tareas de enrutamiento o etiquetado automático.
- Relleno de argumentos en diálogos orientados a esquemas: las 88 filas de DSTC8 permiten usarlo para extraer slots requeridos de una conversación y validar llamadas a funciones con esquemas.
- Selección de funciones en asistentes conversacionales: la categoría de herramientas (150 filas) sugiere uso en la elección de la función correcta entre opciones hermanas, con validación de esquema.
- Investigación sobre fine-tune con anclaje KL: el modelo sirve como caso de estudio reproducible de la técnica de pérdida compuesta (CE + Brier + KL contra el estado inicial) para evitar el olvido catastrófico en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4,54 B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB de VRAM para contexto corto.
- En cuantización de 8 bits: aproximadamente 4,5-5 GB de pesos; en 4 bits: aproximadamente 2,3-2,5 GB, si bien el autor no publica versiones cuantizadas y habría que generarlas.
- GPU recomendadas: A100, H100 o L40S para bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para bf16 en contexto moderado; RTX 4070 Ti / 4080 (12-16 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en bf16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: al requerir `custom_code` y el tag `qwen3_5`, es necesario usar `trust_remote_code=True` en Transformers; vLLM y TGI podrían requerir adaptaciones por el código personalizado; llama.cpp/Ollama requerirían conversión a GGUF y verificación de compatibilidad con Gated-DeltaNet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-25 | 4,54 B | no disponible (entrenado a 2.048) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune LoRA especializado en examen Zils |
| Qwen3.5-4B (base del chasis) | ~4 B | no disponible en la información | no disponible en la información | Público | Modelo generalista del que hereda arquitectura y visión |
| Maincode/Matilda-Decision-v1-Mini | no disponible | no disponible | no disponible | Hugging Face | Uno de los cuatro ingredientes de la mezcla inicial |
| torchcast-ai/torchcast-decision-4b | ~4 B (por nombre) | no disponible | no disponible | Hugging Face | Ingrediente de la mezcla inicial |

## Limitaciones y advertencias

- Modelo de nicho: diseñado exclusivamente para el examen del pool Zils (Bittensor subnet 127); su rendimiento fuera de ese dominio no está validado.
- Entrenamiento con solo 985 filas y 2 épocas (aproximadamente 246 pasos de optimizador), lo que limita la generalización y aumenta el riesgo de sobreajuste a las familias del examen.
- Las etiquetas de 22 filas provienen de modelos abiertos locales, lo que introduce posible ruido o sesgo del generador.
- 150 filas derivan de Schema-Guided Dialogue y 50 de SNLI bajo CC BY-SA 4.0; aunque el repositorio solo contiene pesos, el autor advierte de revisar los términos de esos datasets antes de reutilizar el modelo.
- SST-5, RTE y 20 Newsgroups no tienen licencia abierta explícita; el autor las usa bajo los términos originales, lo que puede condicionar el uso comercial.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo de decisión sobre opciones, el riesgo se manifiesta como selección errónea de la opción o del argumento.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto efectiva no documentada; el entrenamiento se limita a 2.048 tokens.
- Requiere `trust_remote_code=True` por el uso de código personalizado (`qwen3_5`), lo que implica ejecutar código del autor.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad ni de validación externa.
- El modelo es un fine-tune de una mezcla de pesos de otros autores; los créditos de los pesos iniciales pertenecen a los autores originales según el NOTICE.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-25
- Modelo base vllm-sr/d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Modelo base perplexity-ai/pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo base torchcast-ai/torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo base Maincode/Matilda-Decision-v1-Mini: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Schema-Guided Dialogue (DSTC8): https://github.com/google-research-datasets/dstc8-schema-guided-dialogue
- SST-5 (Stanford Sentiment Treebank): https://nlp.stanford.edu/sentiment/
- MultiNLI: https://cims.nyu.edu/~sbowman/multinli/
- RTE (GLUE): https://gluebenchmark.com/
- 20 Newsgroups: http://qwone.com/~jason/20Newsgroups/
