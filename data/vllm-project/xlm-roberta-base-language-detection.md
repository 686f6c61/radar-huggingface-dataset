# vllm-project/xlm-roberta-base-language-detection

## Resumen

`vllm-project/xlm-roberta-base-language-detection` es una copia de seguridad (mirror) del checkpoint `papluca/xlm-roberta-base-language-detection`, publicada por el equipo de vLLM el 30 de octubre de 2026 en el commit `9865598`. El objetivo de esta réplica no es otro que reducir el riesgo de cadena de suministro en la infraestructura de integración continua de vLLM: el repositorio original vive en una cuenta personal y el proyecto lo necesita como dependencia estable para sus tests. Por tanto, se trata de un modelo de clasificación de secuencias, no de un modelo generativo.

Técnicamente es un fine-tuning de `FacebookAI/xlm-roberta-base`, un transformer encoder de 278.059.542 parámetros, sobre el dataset `papluca/language-identification`. La tarea que resuelve es la identificación de idioma a nivel de secuencia: recibe un texto y devuelve una de las 20 etiquetas de idioma soportadas (ar, bg, de, el, en, es, fr, hi, it, ja, nl, pl, pt, ru, sw, th, tr, ur, vi, zh). Sobre el encoder se añade una cabeza de clasificación lineal sobre el pooler output, con una capa `RobertaClassificationHead` estándar.

Su relevancia práctica es doble: por un lado, ofrece una precisión media del 99,6 % en el conjunto de test del dataset de referencia, superando el baseline de `langid.py` (98,5 %) con el mismo conjunto restringido de idiomas; por otro, su licencia MIT y su reducido tamaño lo convierten en una pieza barata y fiable para pipelines de enrutamiento multilingüe, filtrado previo a traducción o etiquetado de corpus. No debe confundirse con un LLM: no genera texto, no soporta tool calling y no tiene ventana de contexto en el sentido habitual, sino un límite de tokens de entrada heredado del tokenizer de XLM-R (512).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación lineal sobre el pooler output |
| Parametros totales | 278.059.542 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite del tokenizer XLM-R; no declarado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y compatibles con cuantización dinámica vía PyTorch/ONNX, pero no se documentan variantes oficiales) |
| Idiomas soportados | 20: ar, bg, de, el, en, es, fr, hi, it, ja, nl, pl, pt, ru, sw, th, tr, ur, vi, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (también `pytorch_model.bin` y TF en el repo original; este mirror expone safetensors y pytorch) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo XLM-RoBERTa base (12 capas, 768 de dimensión oculta, 12 cabezas de atención, ~278 M de parámetros), preentrenado de forma multilingüe con objetivos de masked language modeling sobre corpus en 100 idiomas. Sobre la representación del token `[CLS]` se aplica una cabeza de clasificación (`RobertaClassificationHead`) que proyecta a 20 logits, uno por idioma. La model card no detalla hiperparámetros de fine-tuning (learning rate, batch size, épocas), por lo que no es posible reproducir el entrenamiento a partir de la información disponible.

El fine-tuning se realizó sobre el dataset `papluca/language-identification`, compuesto por 70.000 muestras de entrenamiento y 10.000 de validación y test respectivamente, balanceado entre los 20 idiomas. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo discriminativo de clasificación. Tampoco se documentan innovaciones técnicas adicionales: es un fine-tuning estándar con `Trainer` de Hugging Face (`generated_from_trainer` en los tags). El valor técnico está en la calidad del etiquetado y en el equilibrio del dataset, no en la arquitectura.

## Capacidades

- Clasificación de idioma a nivel de secuencia entre 20 idiomas, devolviendo etiqueta y score de confianza.
- Manejo de texto multilingüe con escrituras latina, cirílica, arábiga, devanagari, griega, tailandesa, CJK (japonés y chino) y swahili.
- Inferencia por lotes (`pipeline(..., top_k=1, truncation=True)`) apta para procesar grandes volúmenes de documentos.
- Integración nativa con `transformers` (`AutoModelForSequenceClassification`, `AutoTokenizer`) y con el ecosistema de tests de vLLM.
- Capacidad de distinguir idiomas con alfabetos compartidos (p. ej. es/it/pt/fr, o ru/bg) gracias al preentrenamiento multilingüe de XLM-R.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- **Enrutamiento multilingüe en pipelines de NLP**: antes de enviar un texto a un modelo generativo o a un traductor, se clasifica el idioma para seleccionar el modelo, el prompt o el tokenizer adecuado. La latencia es de milisegundos por secuencia en CPU, lo que permite hacerlo en línea.
- **Etiquetado y curación de corpus**: procesar lotes de documentos scrapeados o de clientes para separar por idioma antes de entrenar o evaluar otros modelos. Con 70k muestras de entrenamiento y 99,6 % de accuracy, es adecuado para filtrar ruido lingüístico en datasets grandes.
- **Moderación y análisis de contenido**: detectar el idioma de comentarios o tickets para aplicar políticas de moderación específicas por región o para derivar a equipos humanos con el idioma correcto.
- **Preprocesado en sistemas de atención al cliente**: clasificar tickets entrantes y enrutarlos al agente o cola adecuada; su tamaño (278 M) permite desplegarlo en la misma instancia que el resto del stack sin GPU dedicada.
- **Control de calidad en localización**: verificar que las traducciones de una web o app están realmente en el idioma esperado, detectando segmentos mal traducidos o sin traducir en pipelines de CI.
- **Análisis de logs y telemetría multilingüe**: etiquetar mensajes de error o feedback de usuarios en 20 idiomas para agregar métricas por mercado sin depender de servicios externos.
- **Filtrado previo a búsqueda semántica**: en un índice multilingüe, restringir candidatos por idioma antes de calcular embeddings, reduciendo coste y mejorando la precisión del retrieval.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el test set de `papluca/language-identification` (500 muestras por idioma, 10.000 en total). El `model-index` del repo no contiene entradas, por lo que se reproducen los datos de la model card original.

| Idioma | Precision | Recall | F1 | Support |
|---|---:|---:|---:|---:|
| ar | 0,998 | 0,996 | 0,997 | 500 |
| bg | 0,998 | 0,964 | 0,981 | 500 |
| de | 0,998 | 0,996 | 0,997 | 500 |
| el | 0,996 | 1,000 | 0,998 | 500 |
| en | 1,000 | 1,000 | 1,000 | 500 |
| es | 0,967 | 1,000 | 0,983 | 500 |
| fr | 1,000 | 1,000 | 1,000 | 500 |
| hi | 0,994 | 0,992 | 0,993 | 500 |
| it | 1,000 | 0,992 | 0,996 | 500 |
| ja | 0,996 | 0,996 | 0,996 | 500 |
| nl | 1,000 | 1,000 | 1,000 | 500 |
| pl | 1,000 | 1,000 | 1,000 | 500 |
| pt | 0,988 | 1,000 | 0,994 | 500 |
| ru | 1,000 | 0,994 | 0,997 | 500 |
| sw | 1,000 | 1,000 | 1,000 | 500 |
| th | 1,000 | 0,998 | 0,999 | 500 |
| tr | 0,994 | 0,992 | 0,993 | 500 |
| ur | 1,000 | 1,000 | 1,000 | 500 |
| vi | 0,992 | 1,000 | 0,996 | 500 |
| zh | 1,000 | 1,000 | 1,000 | 500 |
| **Media** | — | — | **0,996** | 10.000 |

Comparación con `langid.py` restringido a los mismos 20 idiomas (baseline declarado por el autor): accuracy media del 98,5 %. El modelo supera al baseline en 1,1 puntos porcentuales y mejora especialmente en búlgaro (F1 0,981 frente a 0,981, empate), japonés (0,996 frente a 0,956) y turco (0,993 frente a 0,979).

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, algo esperable al tratarse de un clasificador y no de un LLM generativo.

## Requisitos de hardware

- **VRAM en fp32**: ~1,1 GB para los 278 M de parámetros, más activaciones. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- **VRAM en fp16/bf16**: ~560 MB de pesos; con batch pequeño, menos de 1,5 GB en total.
- **VRAM en int8**: ~280 MB; con cuantización dinámica de PyTorch es suficiente para ejecutarlo en GPUs integradas o incluso en CPU con buen throughput.
- **GPU recomendadas**: cualquier GPU moderna sirve; para producción de alto volumen se recomienda T4, L4, A10G o A100 para lotes grandes. En consumer, una RTX 3060 o superior es más que suficiente; una GTX 1650 también puede ejecutarlo en fp16.
- **CPU**: viable para volúmenes moderados; con `torch.set_num_threads` y batch de 32-64 se obtienen decenas de secuencias por segundo en un servidor moderno.
- **Opciones de despliegue**: `transformers` con `pipeline`, `TextClassificationPipeline`; exportación a ONNX Runtime para inferencia en CPU/GPU; TorchScript; integración con `vLLM` (el propio proyecto lo usa en CI); también es posible servirlo con `FastAPI` + `uvicorn` para un endpoint HTTP ligero.
- **Latencia y throughput**: no se publican cifras oficiales. Como referencia orientativa del orden de magnitud para un encoder de 278 M: decenas de milisegundos por secuencia en CPU y pocos milisegundos en GPU con batch; el throughput escala casi linealmente con el tamaño de lote hasta saturar memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Accuracy (test) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| `vllm-project/xlm-roberta-base-language-detection` (este) | 278 M | 512 tokens | 20 | 99,6 % | MIT | HuggingFace (mirror) |
| `papluca/xlm-roberta-base-language-detection` (original) | 278 M | 512 tokens | 20 | 99,6 % | MIT | HuggingFace (cuenta personal) |
| `langid.py` (baseline del autor) | no disponible (modelo Naive Bayes + n-gramas) | no aplica | 97 nativos; 20 restringidos en la comparación | 98,5 % | BSD | PyPI / GitHub |
| `FacebookAI/xlm-roberta-base` (modelo base) | 278 M | 512 tokens | 100 | no disponible (no es clasificador) | MIT | HuggingFace |

La diferencia clave frente al original es únicamente la ubicación del repositorio y la garantía de estabilidad de la organización `vllm-project`; los pesos son idénticos (commit `9865598`). Frente a `langid.py`, el modelo gana en precisión pero pierde en cobertura de idiomas (20 frente a 97) y en huella de memoria (278 M frente a un modelo de n-gramas de pocos MB). Frente a clasificadores multilingües más grandes como `glotlid` o `fastText` de detección de idioma, no se dispone de comparación en la información proporcionada.

## Limitaciones y advertencias

- **Cobertura limitada a 20 idiomas**: cualquier texto en un idioma fuera de la lista se clasificará forzosamente en una de las 20 etiquetas, con alta probabilidad de error silencioso. No hay etiqueta "unknown".
- **Textos muy cortos**: la precisión cae con entradas de una o dos palabras, especialmente entre idiomas del mismo grupo (es/it/pt, ru/bg). La model card no documenta evaluación en este régimen.
- **Longitud máxima de 512 tokens**: secuencias más largas se truncan; si el idioma cambia a lo largo del documento, el resultado puede ser engañoso.
- **Sesgos del dataset**: el dataset `papluca/language-identification` está balanceado y probablemente compuesto por textos de dominio general (Wikipedia, noticias). El rendimiento en jerga, dialectos, transliteraciones o texto informal puede ser inferior al 99,6 % reportado.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza (falsos positivos seguros), lo que puede propagar errores en pipelines posteriores.
- **Licencia MIT**: permite uso comercial sin restricciones, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base `FacebookAI/xlm-roberta-base`, también MIT.
- **Naturaleza del mirror**: este repositorio es una copia de conveniencia para CI de vLLM; no hay garantía de mantenimiento, issues ni soporte por parte de `vllm-project`. Para dudas funcionales, la referencia es el repo original.
- **Sin model card propia**: la model card es la del original, con una nota de mirror. No hay información adicional sobre hiperparámetros de entrenamiento ni sobre evaluación fuera del test set de `papluca/language-identification`.

## Enlaces

- Repositorio en HuggingFace (mirror): https://huggingface.co/vllm-project/xlm-roberta-base-language-detection
- Repositorio original: https://huggingface.co/papluca/xlm-roberta-base-language-detection
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-R (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
- Dataset `papluca/language-identification`: https://huggingface.co/datasets/papluca/language-identification
- Baseline `langid.py`: https://github.com/saffsd/langid.py
- Proyecto vLLM: https://github.com/vllm-project/vllm
