# Wonseong/FinBERT-FOMC-aspects

## Resumen

FinBERT-FOMC-aspects es un modelo de clasificación de sentimiento financiero con condicionamiento por aspecto, desarrollado por el usuario de Hugging Face Wonseong. Se trata de un fine-tuning de `ZiweiChen/FinBERT-FOMC`, a su vez derivado de la familia BERT, especializado en analizar frases extraídas de comunicados del Comité Federal de Mercado Abierto (FOMC) de la Reserva Federal de Estados Unidos. El modelo resuelve un problema concreto: asignar polaridad (negativa, neutra o positiva) a una misma frase respecto a tres aspectos económicos distintos —crecimiento, empleo e inflación—, en lugar de producir una única etiqueta global de sentimiento.

La arquitectura es un transformer encoder BERT con 109.754.115 parámetros totales, cabeza de clasificación de tres clases y una interfaz de inferencia basada en pares de textos: el primer segmento codifica el aspecto solicitado y el segundo la frase del FOMC. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors, con licencia Apache 2.0.

Su relevancia actual reside en la evaluación de la comunicación de los bancos centrales: permite descomponer el tono de un comunicado del FOMC por áreas temáticas, lo que resulta útil para investigación macroeconómica, análisis de política monetaria y sistemas de alerta temprana sobre cambios de sesgo. No obstante, conviene señalar desde el inicio que las métricas publicadas proceden de un holdout interno con etiquetas de procedencia mixta (humana y generada por zero-shot), no de un benchmark externo auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con cabeza de clasificación de secuencia |
| Parametros totales | 109.754.115 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitada por el tokenizador BERT del modelo base; valor exacto no declarado) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones; al ser BERT, admite cuantización dinámica INT8 vía PyTorch y conversión a GGUF en herramientas de terceros, pero no está validado por el autor) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `ZiweiChen/FinBERT-FOMC` y se ajusta con la modalidad de entrenamiento `all` sobre el libro de cálculo `FOMC_sentences_expanded_zeroshot_labeled.xlsx`, hoja `expanded_10500`. El conjunto de entrenamiento consta de 28.377 filas y el de evaluación de 3.123 filas. Dado que cada frase se etiqueta para tres aspectos (crecimiento, empleo e inflación), la hoja de 10.500 filas genera 31.500 ejemplos aspecto-frase antes del split. La supervisión combina 1.405 filas con procedencia humana explícita (`is_human_labeled = 1`) y 9.095 filas sin etiquetado humano, cuyas anotaciones faltantes se completaron con un modelo zero-shot (`oss-20b`) mediante el prompt `zeroshot_fomc_sentiment_prompt.txt`.

La innovación principal no es arquitectónica sino de formulación de la tarea: se reutiliza un único modelo para los tres aspectos mediante un contrato de inferencia en el que `text` contiene el modo (`growth`, `employment`, `inflation`) y `text_pair` la frase del FOMC. El prompt de etiquetado zero-shot se deriva del marco de anotación humana descrito en Kim et al. (2024), publicado en las actas del 5th ACM International Conference on AI in Finance. El entrenamiento se ejecutó en una Tesla T4 con CUDA y BF16 activado, FP16 desactivado. No se documenta el uso de RLHF ni DPO; se trata de un fine-tuning supervisado convencional.

## Capacidades

- Clasificación de sentimiento financiero en tres clases ordinales: `Negative` (0), `Neutral` (1) y `Positive` (2).
- Condicionamiento por aspecto: la misma frase puede recibir polaridades distintas según se consulte para crecimiento, empleo o inflación.
- Procesamiento de frases individuales extraídas de comunicados del FOMC y textos de política monetaria similares.
- Interfaz estándar de `transformers` mediante `BertForSequenceClassification` y `pipeline("text-classification")`.
- Helper local `FinBERTFOMCModeClassifier` (fichero `predict_aspect.py`) que encapsula la llamada con el modo y la frase.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, según los tags del repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Análisis del tono de comunicados del FOMC por área temática: dado un párrafo del statement, se segmenta en frases y se consulta cada una para `growth`, `employment` e `inflation`, obteniendo un perfil de sentimiento desagregado que permite detectar, por ejemplo, un tono positivo en crecimiento pero negativo en empleo.
- Investigación académica en macroeconomía y política monetaria: el modelo sirve para construir series temporales de sentimiento por aspecto a lo largo de sucesivas reuniones del FOMC, facilitando estudios sobre la relación entre comunicación del banco central y movimientos de mercado.
- Seguimiento de cambios de sesgo (hawkish/dovish) en tiempo casi real: al clasificar las frases de un comunicado recién publicado, un analista puede comparar la polaridad de inflación con la de la reunión anterior y anticipar giros de política.
- Alimentación de sistemas de alerta para mesas de renta fija: las etiquetas por aspecto pueden integrarse como features en modelos de predicción de tipos de interés o de volatilidad, aprovechando la granularidad temática que un clasificador de sentimiento global no ofrece.
- Enriquecimiento de bases de datos documentales financieras: procesamiento por lotes de archivos históricos del FOMC para etiquetar cada frase con tres polaridades, habilitando búsquedas facetadas del tipo "frases negativas sobre inflación en 2022".
- Filtrado y priorización de noticias y transcripciones: en un pipeline de vigilancia de medios, el modelo puede clasificar titulares o declaraciones de miembros de la Fed respecto a cada aspecto y dirigir solo los fragmentos relevantes a analistas humanos.
- Evaluación comparativa de modelos de lenguaje en finanzas: como clasificador pequeño y determinista, sirve de referencia (baseline) frente a LLM de mayor tamaño en tareas de análisis de sentimiento de bancos centrales, siguiendo el marco de Kim et al. (2024).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). La evaluación se realizó sobre un holdout del propio libro de cálculo etiquetado, no sobre un benchmark externo.

| Metrica | Holdout | Ajuste sobre entrenamiento completo |
|---|---|---|
| Accuracy | 0,8789625360230547 | 0,9348888888888889 |
| Macro F1 | 0,7980614874405157 | 0,8977282349978499 |
| Macro Precision | 0,7708534213383098 | 0,8621019267617939 |
| Macro Recall | 0,8321941498302832 | 0,9424642336852936 |
| MAE | 0,1399295549151457 | 0,06847619047619048 |
| MSE | 0,1777137367915466 | 0,07520634920634921 |
| MAPE | 8,09051126054008 | 3,6275132275132274 |
| Loss | 0,5731372237205505 | No disponible |

El dataset de evaluación se identifica como `FOMC_sentences_expanded_zeroshot_labeled.xlsx / expanded_10500`, de tipo privado. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,75 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en FP16/BF16: alrededor de 0,22 GB para pesos; el modelo completo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor entrenó en una Tesla T4. Funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch), `pipeline` de Hugging Face, text-embeddings-inference, endpoints compatibles; también es convertible a ONNX o GGUF con herramientas de terceros, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wonseong/FinBERT-FOMC-aspects | 109,75 M | No disponible | Sentimiento por aspecto en frases del FOMC | Apache 2.0 | Hugging Face |
| ZiweiChen/FinBERT-FOMC (modelo base) | No disponible en la información | No disponible | Sentimiento financiero en textos del FOMC | No disponible en la información | Hugging Face |
| FinBERT (ProsusAI) | No disponible en la información | No disponible | Sentimiento financiero general | No disponible en la información | Hugging Face |
| VADER | Basado en léxico, sin parámetros neuronales | No aplica | Sentimiento general | MIT (según su distribución habitual) | Librería Python |

La comparación con FinBERT-FOMC y VADER se apoya en la referencia citada por el autor (Kim et al., 2024), que evalúa estos modelos en comunicación de bancos centrales. No se dispone de métricas comparativas directas publicadas en la información proporcionada para establecer una tabla de rendimiento frente a esas alternativas.

## Limitaciones y advertencias

- No es un modelo de sentimiento financiero general: está diseñado exclusivamente para frases relacionadas con el FOMC y los tres aspectos declarados; su uso sobre otras entidades o dominios no está validado.
- Las métricas reportadas proceden de un holdout del propio libro de etiquetas, con supervisión de procedencia mixta (1.405 filas humanas y 9.095 filas generadas por zero-shot con `oss-20b`); no constituyen una evaluación independiente contra un benchmark íntegramente anotado por humanos.
- El flag de procedencia humana identifica anotaciones retenidas, pero no implica que las completaciones zero-shot hayan sido auditadas posteriormente por personas.
- Riesgo de alucinación y de error de etiqueta en frases ambiguas, irónicas o con negaciones complejas, habitual en clasificadores BERT de tres clases.
- Solo admite tres clases ordinales; no captura intensidad ni matices finos del sentimiento.
- Idioma limitado al inglés; no se declara soporte para castellano ni otras lenguas.
- Longitud de contexto no documentada; frases muy largas pueden truncarse según la configuración del tokenizador BERT del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la exactitud de las etiquetas de entrenamiento.
- El repositorio incluye hojas auxiliares con distribuciones de longitud, recuentos de etiquetas y metadatos de construcción, incluido el campo `is_oversampled_duplicate` que identifica filas introducidas por muestreo con reemplazo; esto puede introducir sesgos hacia ciertas frases.
- No se documentan sesgos específicos por género, raza o ideología, pero al entrenarse sobre comunicados de la Reserva Federal, hereda el sesgo institucional y el registro formal de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wonseong/FinBERT-FOMC-aspects
- Modelo base: https://huggingface.co/ZiweiChen/FinBERT-FOMC
- Referencia académica citada: Kim, W., Sporer, J., Lee, C. L., & Handschuh, S. (2024, noviembre). *Is small really beautiful for central Bank communication? Evaluating language models for finance: Llama-3-70B, GPT-4, FinBERT-FOMC, FinBERT, and VADER*. Proceedings of the 5th ACM International Conference on AI in Finance, pp. 626-633. arXiv:2304.10164 (https://arxiv.org/abs/2304.10164)
- Libro de cálculo de entrenamiento: `FOMC_sentences_expanded_zeroshot_labeled.xlsx`, disponible en el propio repositorio de Hugging Face del modelo.
- Helper local: `predict_aspect.py`, incluido en el repositorio del modelo.
