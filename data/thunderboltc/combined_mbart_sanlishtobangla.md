# thunderboltc/combined_mbart_sanlishTObangla

## Resumen

combined_mbart_sanlishTObangla es un modelo de traducción automática neuronal publicado por el usuario thunderboltc en Hugging Face. Se trata de un ajuste fino completo de facebook/mbart-large-50-many-to-many-mmt, un transformer encoder-decoder multilingüe. Los pesos publicados en safetensors suman 611.129.542 parámetros, coherentes con el tamaño del modelo base, aunque el repositorio ocupa 176 GB, probablemente porque incluye checkpoints intermedios de las 25 épocas de entrenamiento.

El nombre del repositorio apunta a una traducción desde «sanlish» hacia bengalí (bangla); el término «sanlish» no es un código de idioma estándar y la model card no documenta ni la lengua de origen ni la de destino, por lo que esa dirección de traducción es una hipótesis razonable pero no confirmada. En la práctica, el modelo no ofrece traducción multilingüe general como su base, sino presumiblemente una única dirección de traducción de bajos recursos, un escenario típico en el que el ajuste fino sobre mBART-50 aporta más que un modelo genérico.

Su relevancia actual es experimental y limitada: acumula 0 descargas y 0 «likes», la model card está generada automáticamente por el Trainer, el conjunto de entrenamiento figura como «None» y no se declara licencia. Los resultados de evaluación (BLEU 15,9771, chrF 41,8391, METEOR 0,3680, BERTScore 0,8571) permiten situarlo, pero la curva de entrenamiento muestra sobreajuste claro a partir de la décima época.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) tipo BART; configuración del modelo base mBART-50: 12 capas de encoder, 12 de decoder, d_model 1024, 16 cabezas de atención, posiciones máximas 1024 |
| Parámetros totales | 611.129.542 (dato real de los pesos en safetensors) |
| Parámetros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 1.024 tokens (max_position_embeddings del modelo base mBART-50; no declarada en el repositorio) |
| Tipos de cuantización | no se publican artefactos cuantizados; por ser un checkpoint transformers estándar admitiría int8 y NF4 vía bitsandbytes, pero no está verificado en la información disponible |
| Idiomas soportados | no declarados. El modelo base cubre 50 idiomas, entre ellos el bengalí; el santalí no figura en esa lista |
| Licencia | no disponible (el repositorio no la especifica; el modelo base se distribuye bajo licencia MIT) |
| Formato de pesos | safetensors |
| Modelo base | facebook/mbart-large-50-many-to-many-mmt |
| Tarea | text2text-generation (traducción automática) |
| Biblioteca | transformers 4.46.3 |
| Entorno de entrenamiento | PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.20.3 |
| Tamaño del repositorio | 176,0 GB |
| Descargas / likes | 0 / 0 |
| Compatibilidad declarada | endpoints_compatible (etiqueta del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base mBART-50: un transformer encoder-decoder con normalización previa, atención completa y embeddings posicionales sinusoidales (la variante de mBART elimina la posición absoluta aprendida de BART). El ajuste fino no modifica la arquitectura, solo los pesos, y se ejecutó con precisión mixta nativa (Native AMP) sobre AdamW (betas 0,9 y 0,999, epsilon 1e-08) con tasa de aprendizaje 2e-05, planificador lineal y un 10 % de warmup durante 25 épocas. El seed fue 42, con batch de entrenamiento y de evaluación de 8, lo que da 6.150 pasos totales y 246 pasos por época: si el batch efectivo fuera de 8 ejemplos, el conjunto de entrenamiento rondaría los 1.968 pares de frases, cifra derivada aritméticamente del registro de pasos y no declarada por el autor.

No se documenta la composición del conjunto de datos (la model card lo identifica literalmente como «None»), ni el número de tokens de entrenamiento, ni si hubo filtrado, aumentación o retro-traducción. Tampoco consta ningún tipo de alineación por preferencias humana (RLHF, DPO), algo poco habitual en traducción automática, ni innovaciones de decodificación (búsqueda especulativa, atención lineal o variantes eficientes). Se trata, por tanto, de un ajuste fino supervisado convencional de traducción, sin aportaciones técnicas declaradas.

## Capacidades

- Traducción automática texto a texto en una única dirección presumible (sanlish → bengalí), aunque la dirección no está documentada de forma explícita.
- Generación de texto condicionada a un prefijo de idioma de origen y a un token forzado de idioma de destino, siguiendo el formato de mBART-50 (`src_lang` y `forced_bos_token_id`).
- Hereda del modelo base la tokenización multilingüe de mBART-50 (50 idiomas), si bien el ajuste fino puede haber degradado el rendimiento en direcciones no entrenadas.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes, razonamiento multi-paso ni modo de pensamiento (thinking).
- No dispone de capacidades de visión, audio ni multimodalidad.
- Sin evaluación publicada de otras capacidades (resumen, parafraseado, generación libre).

## Casos de uso

- Traducción de bajo recurso de textos cortos al bengalí: el modelo puede emplearse para traducir frases y párrafos de una lengua infrarrepresentada, con segmentación previa a 1.024 tokens, en proyectos de documentación comunitaria o preservación lingüística donde no existen motores comerciales.
- Localización de contenidos para comunidades santalíes y bengalíes: traducción de material divulgativo, sanitario o educativo para su distribución en Bangladés y el este de la India, con revisión humana obligatoria dada la ausencia de licencia clara.
- Preprocesado de pipelines multilingües: integración como etapa de traducción en flujos de procesamiento por lotes con `transformers` en una GPU de consumo, gracias a que los pesos en bf16 ocupan alrededor de 1,22 GB.
- Atención al ciudadano en servicios públicos: traducción de consultas y respuestas en ventanilla o chat, con contexto suficiente para turnos breves y con la ventaja de poder desplegarse en hardware modesto.
- Investigación en traducción automática de bajos recursos: sirve como punto de partida para experimentos de ajuste fino, comparación de hiperparámetros y estudio del sobreajuste en corpus pequeños, ya que se documenta la curva completa de 25 épocas.
- Generación de corpus sintéticos y aumentación de datos: uso del modelo para retro-traducir y ampliar corpus paralelos destinados a entrenar sistemas mayores, filtrando después por métricas automáticas de calidad.
- Evaluación comparativa frente al modelo base: permite medir cuánto aporta el ajuste fino respecto a facebook/mbart-large-50-many-to-many-mmt en la misma dirección, con las métricas ya registradas del autor.
- Despliegue en endpoints gestionados: la etiqueta `endpoints_compatible` del repositorio sugiere su uso en Hugging Face Inference Endpoints para demostraciones o pruebas de concepto internas.

## Benchmarks y rendimiento

El model-index del repositorio está vacío (`results: []`), por lo que no hay comparaciones oficiales con otros modelos. Los únicos datos disponibles son las métricas de la partición de evaluación declaradas por el autor en la model card, que se usan aquí tal cual.

| Métrica | Resultado final (época 25) |
|---|---|
| Loss (evaluación) | 2,6951 |
| BLEU | 15,9771 |
| chrF | 41,8391 |
| METEOR | 0,3680 |
| BERTScore | 0,8571 |

### Evolución del entrenamiento

| Pérdida de entrenamiento | Época | Paso | Pérdida de validación | BLEU | chrF | METEOR | BERTScore |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 3,878 | 1,0 | 246 | 3,7934 | 0,3071 | 11,9857 | 0,0524 | 0,7418 |
| 3,201 | 2,0 | 492 | 3,0279 | 2,9944 | 18,0608 | 0,1318 | 0,7837 |
| 2,3326 | 3,0 | 738 | 2,5583 | 4,6605 | 25,9591 | 0,2328 | 0,8125 |
| 1,5583 | 4,0 | 984 | 2,3804 | 7,6473 | 29,8809 | 0,2567 | 0,8238 |
| 1,1452 | 5,0 | 1230 | 2,4162 | 10,7574 | 32,8286 | 0,2940 | 0,8353 |
| 0,7374 | 6,0 | 1476 | 2,4727 | 13,5249 | 35,3104 | 0,3229 | 0,8432 |
| 0,4366 | 7,0 | 1722 | 2,5789 | 12,9733 | 36,4912 | 0,3225 | 0,8421 |
| 0,3013 | 8,0 | 1968 | 2,5628 | 13,2815 | 36,9146 | 0,3165 | 0,8414 |
| 0,2282 | 9,0 | 2214 | 2,5896 | 14,6900 | 39,4204 | 0,3481 | 0,8513 |
| 0,2066 | 10,0 | 2460 | 2,5709 | 15,7164 | 39,5954 | 0,3445 | 0,8489 |
| 0,1606 | 11,0 | 2706 | 2,5822 | 14,9227 | 39,4398 | 0,3550 | 0,8487 |
| 0,1364 | 12,0 | 2952 | 2,6063 | 14,9087 | 39,6850 | 0,3455 | 0,8494 |
| 0,1035 | 13,0 | 3198 | 2,5915 | 14,9534 | 40,8428 | 0,3467 | 0,8529 |
| 0,0915 | 14,0 | 3444 | 2,6879 | 15,6218 | 40,4387 | 0,3598 | 0,8552 |
| 0,0708 | 15,0 | 3690 | 2,6409 | 16,0072 | 41,2707 | 0,3566 | 0,8531 |
| 0,0522 | 16,0 | 3936 | 2,6650 | 16,6121 | 42,0392 | 0,3715 | 0,8579 |
| 0,0426 | 17,0 | 4182 | 2,6709 | 15,1436 | 41,7012 | 0,3641 | 0,8573 |
| 0,0358 | 18,0 | 4428 | 2,6738 | 15,0468 | 41,2850 | 0,3674 | 0,8554 |
| 0,0320 | 19,0 | 4674 | 2,6808 | 16,1232 | 42,4417 | 0,3707 | 0,8564 |
| 0,0311 | 20,0 | 4920 | 2,6973 | 17,2257 | 42,9683 | 0,3729 | 0,8589 |
| 0,0225 | 21,0 | 5166 | 2,6748 | 16,1636 | 42,5303 | 0,3719 | 0,8580 |
| 0,0171 | 22,0 | 5412 | 2,6856 | 16,0486 | 42,5440 | 0,3741 | 0,8595 |
| 0,0153 | 23,0 | 5658 | 2,6943 | 15,4760 | 41,9983 | 0,3713 | 0,8580 |
| 0,0199 | 24,0 | 5904 | 2,6965 | 15,5954 | 41,6385 | 0,3680 | 0,8578 |
| 0,0154 | 25,0 | 6150 | 2,6951 | 15,9771 | 41,8391 | 0,3680 | 0,8571 |

Lectura de los datos: la pérdida de validación alcanza su mínimo en la época 4 (2,3804) y se estabiliza en torno a 2,69 mientras la pérdida de entrenamiento cae hasta 0,0154, lo que indica sobreajuste a partir de la décima época. El mejor BLEU se registra en la época 20 (17,2257), no en el checkpoint final, presentado como resultado de referencia (15,9771).

## Requisitos de hardware

- Peso de los parámetros: en fp32 unos 2,44 GB; en bf16/fp16 unos 1,22 GB; en int8 unos 0,61 GB; en 4 bits (NF4) unos 0,31 GB. Cálculos derivados de 611.129.542 parámetros, no cifras medidas.
- VRAM necesaria para inferencia: por debajo de 4 GB en bf16 con batch 1 y secuencias cortas; con secuencias de 1.024 tokens y búsqueda por haz conviene reservar entre 4 y 8 GB, estimación orientativa no verificada en la información disponible.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, es suficiente para este tamaño. Las A100 y H100 solo tienen sentido para servir muchas peticiones concurrentes en lote.
- GPU de consumo: sí, cabe con holgura en la mayoría de tarjetas modernas de 8 GB o más, y de forma ajustada en tarjetas de 6 GB.
- CPU: la inferencia en PyTorch sobre CPU es posible (unos 2,5 GB de RAM en fp32), con latencia alta; no hay cifras publicadas.
- Opciones de despliegue: `transformers` con PyTorch está confirmado como vía de uso. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible y requeriría verificación, especialmente para formatos GGUF.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública y deben verificarse antes de tomar decisiones de producción. La tabla compara tamaño, contexto, cobertura lingüística y licencia.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| combined_mbart_sanlishTObangla | 611.129.542 | 1.024 tokens (base) | no declarados (base: 50) | no disponible | 0 descargas, model card autogenerada |
| facebook/mbart-large-50-many-to-many-mmt | 611.129.542 | 1.024 tokens | 50 | MIT | Modelo de referencia, ampliamente utilizado |
| facebook/nllb-200-distilled-600M | ~615 M | no disponible | 200 | CC-BY-NC-4.0 (no comercial; verificar) | Amplia cobertura, pero licencia restrictiva |
| ai4bharat/IndicBART | 244 M | no disponible | 11 lenguas indias más inglés | MIT (verificar) | Alternativa ligera para lenguas indias |

Frente al modelo base, este ajuste fino no añade parámetros ni contexto, y solo es preferible si la dirección sanlish → bengalí está realmente cubierta y supera al base en ese par concreto, algo que no puede confirmarse sin una comparación directa bajo la misma partición de evaluación. Frente a NLLB-200, ofrece menos cobertura lingüística y peor encaje legal, ya que su licencia no está declarada. Frente a IndicBART, es aproximadamente 2,5 veces más grande sin garantía de mejor calidad en la tarea objetivo.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial ni condiciones de atribución. En un uso en producción debe contactarse con el autor y documentarse la autorización por escrito.
- Model card generada automáticamente: el dataset figura como «None», no se describe el uso previsto, ni la composición de los datos, ni el idioma de origen y destino con precisión.
- Sobreajuste evidente: la pérdida de validación se estanca en torno a 2,69 desde la época 10 mientras la de entrenamiento baja a 0,0154. El checkpoint final no es el de mejor BLEU (época 20, 17,2257).
- Corpus de evaluación pequeño: 246 pasos por época con batch 8, lo que implica una partición de validación reducida y métricas con alta varianza.
- Ausencia de validación por la comunidad: 0 descargas y 0 «likes» en el momento de la consulta, sin terceros que hayan reproducido los resultados.
- Tamaño del repositorio desproporcionado: 176 GB frente a los aproximadamente 2,44 GB de los pesos en fp32, lo que sugiere la presencia de checkpoints intermedios y encarece la descarga y el almacenamiento.
- Riesgo de alucinación propio de la traducción neuronal: puede producir salidas fluidas pero semánticamente incorrectas, especialmente fuera del dominio de entrenamiento y en terminología especializada.
- Contexto limitado a 1.024 tokens: los documentos largos deben segmentarse, con pérdida de coherencia discursiva entre fragmentos.
- Idiomas: «sanlish» no es un código ISO estándar y no se documenta la variante ni la escritura empleada (latina o propia), lo que dificulta evaluar la cobertura real. El santalí no forma parte de los 50 idiomas del modelo base.
- Sesgos: no se documenta ningún análisis de sesgo. En pares de bajos recursos, los corpus suelen sobrerrepresentar determinados registros y pueden inducir sesgos de género o de formalidad.
- Configuración obligatoria: para obtener la traducción en el idioma correcto debe fijarse `forced_bos_token_id` con el token del idioma de destino; omitirlo produce salidas en un idioma impredecible.
- Sin soporte de tool calling, agentes, visión ni audio: cualquier flujo que requiera esas capacidades debe resolverse con componentes adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thunderboltc/combined_mbart_sanlishTObangla
- Modelo base facebook/mbart-large-50-many-to-many-mmt: https://huggingface.co/facebook/mbart-large-50-many-to-many-mmt
- Documentación de mBART en transformers: https://huggingface.co/docs/transformers/model_doc/mbart
- Artículo de mBART-50 (Multilingual Translation with Extensible Multilingual Pretraining and Finetuning): https://arxiv.org/abs/2008.00401
- Artículo de mBART (Multilingual Denoising Pre-training for Neural Machine Translation): https://arxiv.org/abs/2001.08210
- Modelo de referencia facebook/nllb-200-distilled-600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Modelo de referencia ai4bharat/IndicBART: https://huggingface.co/ai4bharat/IndicBART
