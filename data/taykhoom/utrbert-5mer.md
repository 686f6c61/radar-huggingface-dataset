# Taykhoom/UTRBERT-5mer

## Resumen

UTRBERT-5mer es un modelo de lenguaje basado en la arquitectura BERT-base, preentrenado con el objetivo de masked language modeling (MLM) sobre secuencias de regiones 3' UTR (regiones no traducidas en el extremo 3') de ARN mensajero humano. Es una adaptación mínima del modelo 3UTRBERT original desarrollado por Yang et al., y su relevancia radica en que permite obtener representaciones vectoriales densas de fragmentos de ARN, lo que facilita tareas de predicción de regulación génica mediada por la región 3' UTR, como la unión de microARN o proteínas RBP.

El modelo tokeniza las secuencias de ARN (o ADN, tras convertir T a U) en solapamientos de 5-mer con stride 1, generando un vocabulario de 1029 tokens (5 especiales más los 1024 posibles 5-meros de ARN). Con 12 capas, 12 cabezas de atención, dimensión de embedding 768 y una ventana máxima de 512 tokens (equivalente a 514 nucleótidos brutos), se posiciona como un modelo compacto y especializado para el dominio genómico. Su licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base encoder (Post-LN, 12 capas, 12 cabezas, dim 768, FFN 3072 GELU) |
| Parametros totales | 88.215.045 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (hasta 514 nucleotidos brutos) |
| Tipos de cuantizacion | no disponible (pesos en float32; compatible con fp16 para Flash Attention 2) |
| Idiomas soportados | no aplica (modelo biologico, no linguistico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT-base original con normalización post-LayerNorm (eps=1e-12) y embeddings posicionales absolutos aprendidos. La tokenización es específica de dominio: las secuencias de ARN se convierten de T a U y se dividen en 5-meros solapados con stride 1, de modo que una secuencia de longitud L produce L-4 tokens, a los que se añaden los tokens especiales [CLS] y [SEP]. El preentrenamiento se realizó con MLM sobre secuencias de 3' UTR humanas, utilizando el checkpoint oficial `5-new-12w-0` publicado en figshare. No se menciona el uso de RLHF ni DPO; es un modelo puramente de representación.

La implementación en HuggingFace utiliza un backend de código compartido (`BERT-updated`) mediante `auto_map` y un tokenizador personalizado almacenado en el repositorio. Se requiere `trust_remote_code=True` para cargar el modelo. El port incluye backends de atención alternativos: SDPA (PyTorch 2.0+) y Flash Attention 2, además del eager original. La verificación de paridad con los pesos originales muestra diferencias máximas en float32 de 1.24e-5 en hidden states y 6.72e-5 en logits (eager), y 8.58e-6 / 7.34e-5 con SDPA.

## Capacidades

- Generacion de embeddings biologicos: produce representaciones de 768 dimensiones por token y por secuencia (CLS o mean-pooling de tokens biologicos).
- Masked language modeling sobre ARN: puede predecir 5-meros enmascarados, util para tareas de modelado de lenguaje biologico.
- Extraccion de representaciones intermedias: permite acceder a las 12 capas ocultas para analisis de interpretabilidad.
- Fine-tuning para tareas downstream: la capa CLS o el embedding mean-pooled pueden conectarse a cabezas de clasificacion o regresion.
- Compatibilidad con backends de atencion acelerados: SDPA y Flash Attention 2 para inferencia mas rapida.
- Capacidad multilingue: no aplica, es un modelo biologico especifico de ARN humano.

## Casos de uso

- Prediccion de sitios de union de microARN: las representaciones de la region 3' UTR pueden alimentar clasificadores que detecten dianas de miRNA, aprovechando la informacion contextual de los 5-meros.
- Analisis de regulacion traduccional: modelos fine-tuned sobre datos de estabilidad de ARNm o eficiencia traduccional pueden usar los embeddings para predecir el impacto de variantes en la region 3' UTR.
- Estudio de interacciones con proteinas de union a ARN (RBP): los embeddings de secuencia pueden servir como features para predecir sitios de union de RBPs, relevantes en enfermedades geneticas.
- Clasificacion de variantes patogenicas: dado un conjunto de variantes en 3' UTR, el modelo puede generar embeddings que ayuden a distinguir variantes que alteran la regulacion.
- Generacion de features para modelos de expresion genica: los embeddings de 3' UTR pueden integrarse en pipelines de machine learning que predicen niveles de expresion o estabilidad del ARNm.
- Investigacion en biologia sintetica: diseno de secuencias 3' UTR con propiedades reguladoras deseadas mediante optimizacion basada en embeddings del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ya que el modelo no esta disenado para tareas de lenguaje natural general. Tampoco se reportan metricas especificas de tareas biologicas (como AUC en prediccion de sitios de union) en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 88 millones de parametros, por lo que en float32 ocupa aproximadamente 352 MB. Con batch pequeno (1-8 secuencias) cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). Para entrenamiento con batch grande, se recomienda 8-16 GB.
- Compatibilidad con consumer GPU: si, el modelo es ligero y puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: transformers con `trust_remote_code=True`; soporta SDPA (PyTorch 2.0+) y Flash Attention 2. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje generativo.
- Latencia y throughput: no disponible en la documentacion. Dado el tamano, la inferencia en GPU es del orden de milisegundos por secuencia corta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UTRBERT-5mer | 88 M | 512 tokens | 5-mer solapado | CC-BY-4.0 | HuggingFace |
| UTRBERT-3mer | no disponible | 512 tokens | 3-mer solapado | CC-BY-4.0 | HuggingFace |
| UTRBERT-4mer | no disponible | 512 tokens | 4-mer solapado | CC-BY-4.0 | HuggingFace |
| UTRBERT-6mer | no disponible | 512 tokens | 6-mer solapado | CC-BY-4.0 | HuggingFace |

Los modelos UTRBERT comparten la misma arquitectura base y se diferencian en el tamano del k-mer y el vocabulario resultante. No se dispone de datos de rendimiento comparativo entre variantes en la informacion proporcionada. Otros modelos de ARN como DNABERT o Nucleotide Transformer no se incluyen por falta de datos comparativos directos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se preentreno exclusivamente con secuencias 3' UTR humanas, por lo que su capacidad de generalizacion a otras especies o regiones genomicas es limitada.
- Riesgo de alucinacion: al ser un modelo de representacion (no generativo), no produce texto; el riesgo de alucinacion se limita a predicciones de MLM que pueden no corresponder a 5-meros biologicamente plausibles.
- Limitaciones de contexto: la ventana maxima de 512 tokens restringe el analisis a secuencias de hasta 514 nucleotidos, insuficiente para regiones 3' UTR completas de algunos genes humanos que superan esa longitud.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y modificacion, pero requiere atribucion al autor original y a los autores del paper de 3UTRBERT.
- Dependencia de codigo remoto: la carga del modelo requiere `trust_remote_code=True` y acceso a red para descargar el backend `BERT-updated`, lo que puede ser un problema en entornos aislados.
- Verificacion limitada: la paridad se verifico solo con PyTorch 2.7.1, CUDA 12.9 y transformers 4.57.6; otras versiones pueden presentar diferencias numericas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/UTRBERT-5mer
- Coleccion UTRBERT: https://huggingface.co/collections/Taykhoom/utrbert
- Repositorio original 3UTRBERT: https://github.com/yangyn533/3UTRBERT
- Backend de codigo compartido: https://huggingface.co/Taykhoom/BERT-updated
- Checkpoint original en figshare: https://doi.org/10.6084/m9.figshare.22851191.v1
- Descarga directa del checkpoint: https://ndownloader.figshare.com/files/40597919
- Paper de referencia (Yang et al., 2024): no disponible en la informacion proporcionada (la cita en la model card esta incompleta)
