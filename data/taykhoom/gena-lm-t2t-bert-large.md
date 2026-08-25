# Taykhoom/GENA-LM-t2t-bert-large

## Resumen

GENA-LM-t2t-bert-large es un modelo de lenguaje de ADN basado en la arquitectura BERT, desarrollado originalmente por el AIRI Institute y portado a HuggingFace por Taykhoom. Se trata de un modelo de tipo *masked language model* (MLM) entrenado sobre el ensamblaje T2T del genoma humano, aumentado con variantes de los proyectos 1000 Genomes y gnomAD. Su objetivo es proporcionar representaciones vectoriales de secuencias de ADN de hasta 512 tokens BPE, lo que equivale aproximadamente a 4.608 nucleótidos, para tareas de aprendizaje por transferencia en genómica.

Este port minimo reproduce bit-a-bit los pesos del modelo original `AIRI-Institute/gena-lm-bert-large-t2t`, pero añade soporte para los backends de atención `sdpa` y `flash_attention_2`, que no estaban disponibles en la implementación original. La relevancia actual del modelo radica en que sigue siendo una referencia competitiva entre los modelos fundacionales de ADN de tamaño medio, con un rendimiento superior en 18 tareas genómicas frente a otras arquitecturas comparables, según el artículo de GENA-LM.

El modelo cuenta con 336,7 millones de parámetros, una ventana de contexto de 512 tokens BPE y una licencia MIT, lo que facilita su uso en investigación y producción.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Pre-LayerNorm BERT (24 capas, 16 cabezas, dim 1024, FFN 4096 GELU) |
| Parametros totales | 336.691.456 |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 512 tokens BPE (~4608 nucleotidos) |
| Tipos de cuantizacion | No disponible (pesos en fp32 en safetensors) |
| Idiomas soportados | No aplica (modelo de ADN, no idiomas naturales) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura BERT con normalización Pre-LayerNorm y una capa de normalización final adicional. El vocabulario consta de 32.000 tokens BPE entrenados específicamente sobre secuencias de ADN, incluyendo los tokens especiales `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`. La codificación posicional es absoluta y aprendida, y la ventana máxima es de 512 tokens, lo que limita la longitud de secuencia procesable en una sola pasada.

El entrenamiento se realizó con el objetivo de masked language modeling (MLM) con un 15% de tokens enmascarados, siguiendo el enfoque de BigBird. Los datos de entrenamiento provienen del ensamblaje T2T del genoma humano, aumentado con variantes de los proyectos 1000 Genomes y gnomAD. Se ejecutaron 1.750.000 iteraciones con un batch size de 256 y una longitud de secuencia de 512 tokens.

La implementación portada no incluye la cabeza NSP ni el pooler originales; el modelo devuelve la representación del token `[CLS]` o la media de los embeddings de secuencia para tareas de nivel de secuencia. Los embeddings de entrada y el decodificador MLM están atados. Se ha verificado que la salida del backend `eager` es bit-exacta con el modelo original, y los backends `sdpa` y `flash_attention_2` coinciden dentro de la tolerancia de punto flotante.

## Capacidades
- Generacion de embeddings de secuencias de ADN: produce representaciones vectoriales de tokens y de secuencias completas mediante el token `[CLS]` o pooling medio.
- Masked language modeling: predice nucleotidos enmascarados, util para tareas de imputacion y analisis de variantes.
- Extraccion de representaciones de capas intermedias: permite acceder a los hidden states de cualquiera de las 24 capas, util para transfer learning.
- Soporte de backends de atencion eficientes: `sdpa` (PyTorch 2.0+) y `flash_attention_2`, ademas del backend `eager` bit-exacto.
- Fine-tuning clasico de HuggingFace: se puede ajustar para tareas de clasificacion de secuencias o de tokens, aunque el modelo no incluye cabezas especificas.
- No incluye soporte de tool calling ni de agentes; es un modelo de lenguaje de ADN de tipo encoder, no generativo.

## Casos de uso
- Anotacion de variantes geneticas: el modelo puede predecir el efecto de variantes de un solo nucleotido enmascarando la posicion y comparando la probabilidad de los nucleotidos alternativos. Es adecuado porque su entrenamiento incluye datos de SNP de 1000 Genomes y gnomAD.
- Clasificacion de regiones regulatorias: se puede fine-tunear para distinguir promotores, enhancers o regiones de union de factores de transcripcion a partir de secuencias de hasta 4608 nucleotidos.
- Prediccion de splicing: a partir de secuencias de exones e intrones, el modelo puede aprender a detectar sitios de splicing alternativo mediante una cabeza de clasificacion sobre embeddings de tokens.
- Analisis de metilacion del ADN: se puede fine-tunear para predecir estados de metilacion a partir de secuencias, dado que el modelo captura contexto local de alta resolucion.
- Aprendizaje por transferencia para genomas no humanos: aunque fue entrenado en humano, el tokenizador BPE y los embeddings pueden adaptarse a otras especies mediante fine-tuning, como se muestra en el modelo multi-species de la familia GENA-LM.
- Representacion de secuencias para bases de datos genomicas: generar embeddings de secuencias de referencia para clustering, busqueda de similitud o clasificacion automatica de fragmentos de ADN.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks detallados en la informacion disponible. El articulo de GENA-LM menciona que la variante `gena-lm-bert-large-t2t` obtiene la mayor puntuacion media en un conjunto de 18 tareas genomicas en comparacion con otros modelos fundacionales de ADN, pero no se especifican los valores numericos en el material consultado. Por tanto, no se incluyen tablas de comparacion cuantitativa.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo en precision FP32 ocupa aproximadamente 1,3 GB de memoria de pesos; con cuantizacion de 8 bits se reduce a unos 340 MB y en 4 bits a unos 170 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32 (por ejemplo, NVIDIA GTX 1650 o superior). Para entrenamiento o fine-tuning se recomienda una GPU con 8 GB o mas, como RTX 3070/4060 o superior.
- Compatibilidad con GPU consumer: si, es perfectamente viable en GPUs de gama media e incluso en CPU para inferencia puntual.
- Opciones de despliegue: se puede usar directamente con la libreria `transformers` de HuggingFace, o bien exportar a ONNX o TorchScript. No se mencionan integraciones con vLLM, llama.cpp u Ollama, dado que no es un modelo generativo.
- Latencia y throughput estimados: no se dispone de mediciones concretas. En una GPU RTX 3090, una pasada de inferencia sobre una secuencia de 512 tokens tardaria del orden de 50-100 ms con backend `eager`, y menos con `flash_attention_2`.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| GENA-LM-t2t-bert-large (este) | 336M | 512 tokens | Pre-Layer BERT | MIT |
| GENA-LM-t2t-bert-base | 110M | 512 tokens | Pre-Layer BERT | MIT |
| GENA-LM-t2t-bigbird-base | 110M | 4096 tokens | BigBird (sparse attention) | MIT |
| GENA-LM-t2t-multi-species-bert-base | 110M | 512 tokens | Pre-Layer BERT | MIT |

El modelo grande ofrece el doble de capacidad que las variantes base, lo que puede mejorar la representacion de secuencias complejas, pero su contexto corto (512 tokens) limita el analisis de regiones genomicas extensas. La variante bigbird-base, con 4096 tokens de contexto, es mas adecuada para tareas que requieren largo alcance, aunque con menos parametros. La comparacion directa de rendimiento no esta disponible en la informacion consultada.

## Limitaciones y advertencias
- Contexto limitado: la ventana de 512 tokens BPE equivale a unos 4608 nucleotidos, insuficiente para analizar regiones genomicas largas de una sola vez; para secuencias mayores se requiere fragmentacion y agregacion.
- No incluye la cabeza NSP ni el pooler originales: el modelo devuelve el backbone sin funcionalidad de clasificacion de pares de frases, por lo que para tareas de nivel de secuencia hay que implementar una cabeza propia.
- Dependencia de `trust_remote_code`: la implementacion requiere activar `trust_remote_code=True` en HuggingFace, lo que implica ejecutar codigo personalizado no auditado por la comunidad.
- Sesgo por datos de origen humano: el entrenamiento principal es sobre el genoma humano, por lo que su capacidad para otras especies puede ser limitada salvo fine-tuning.
- Riesgo de alucinacion en la prediccion de variantes: como modelo MLM, puede predecir nucleotidos plausibles que no correspondan a la realidad biologica; los resultados deben validarse experimentalmente.
- Sin soporte de tool calling ni agentes: no es un modelo generativo, no produce texto libre, solo representaciones y logits de enmascaramiento.
- No se han publicado benchmarks numericos detallados en la informacion disponible: la afirmacion de mejor rendimiento medio en 18 tareas proviene del paper de GENA-LM, pero no se aportan datos concretos en esta ficha.

## Enlaces
- Repositorio HuggingFace del modelo: https://huggingface.co/Taykhoom/GENA-LM-t2t-bert-large
- Modelo original del AIRI Institute: https://huggingface.co/AIRI-Institute/gena-lm-bert-large-t2t
- Coleccion GENA-LM de Taykhoom: https://huggingface.co/collections/Taykhoom/gena-lm-6a8cec0862e11d4f81d059ab
- Repositorio GitHub del AIRI: https://github.com/AIRI-Institute/GENA_LM
- Articulo cientifico (Nucleic Acids Research): https://academic.oup.com/view-large/500316063 (doi: 10.1093/nar/gkae1310)
