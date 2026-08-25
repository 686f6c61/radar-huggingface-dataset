# Taykhoom/UTRBERT-4mer

## Resumen

UTRBERT-4mer es un port minimalista a HuggingFace de la variante de 4-mer de 3UTRBERT, un modelo de lenguaje BERT-base preentrenado sobre secuencias agregadas de la región 3' UTR de mRNA humano. El modelo original fue desarrollado por Yang et al. (2024) para descifrar la regulación génica mediada por la región 3' UTR mediante aprendizaje profundo interpretable. Este port, realizado por Taykhoom, reproduce fielmente los pesos del checkpoint público `4-new-12w-0` y verifica la paridad numérica de todas las capas.

El modelo emplea una arquitectura BERT-base con 12 capas, 12 cabezas de atención, dimensión de embedding 768 y una capa FFN de 3072 unidades. Su vocabulario está compuesto por 261 tokens: 5 tokens especiales y 256 k-meros de RNA de longitud 4 (4-mer). La tokenización convierte secuencias de RNA (o DNA) a U, y luego las divide en 4-meros solapados con paso 1, de modo que una secuencia de longitud L produce L-3 tokens. La ventana de contexto máxima es de 512 tokens, equivalente a 513 nucleótidos crudos.

Este modelo es relevante para la comunidad de biología computacional porque proporciona representaciones densas de secuencias 3' UTR que pueden utilizarse como características para tareas posteriores como predicción de estabilidad del mRNA, unión de microARN o clasificación de elementos reguladores. Al ser un modelo pequeño (87 millones de parámetros), es accesible para fine-tuning en GPUs de consumo y su licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base encoder (post-LN) |
| Parametros totales | 87.034.629 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (hasta 513 nucleotidos) |
| Tipos de cuantizacion | No disponible (solo fp32/fp16 por defecto) |
| Idiomas soportados | No disponible (secuencias biologicas de RNA) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UTRBERT-4mer sigue la arquitectura BERT-base original con normalización posterior a cada subcapa (post-LN), embeddings posicionales absolutos aprendidos y activación GELU en la capa FFN. El tokenizador personalizado convierte las secuencias de RNA a U, elimina cualquier T, y genera 4-meros solapados con stride 1. El preentrenamiento se realizó con el objetivo de modelado de lenguaje enmascarado (MLM) sobre secuencias humanas de la región 3' UTR, utilizando el checkpoint `4-new-12w-0` publicado en figshare (registro 22851119). El port verifica la paridad de las 13 representaciones (embedding + 12 capas) y los logits MLM, con diferencias máximas en float32 de 3.15e-5 para hidden states y 4.72e-5 para logits en modo eager, y 1.85e-5 / 3.65e-5 con SDPA. El modelo soporta backends de atención alternativos: eager, SDPA (PyTorch 2.0+) y Flash Attention 2.

## Capacidades

- Generacion de embeddings contextuales de secuencias 3' UTR de RNA, tanto a nivel de token como de secuencia (CLS o mean-pooling).
- Modelado de lenguaje enmascarado (fill-mask) sobre tokens 4-mer, util para completar o predecir k-meros en contexto.
- Fine-tuning para tareas de clasificacion de secuencias (por ejemplo, clasificacion binaria o multiclase) usando el embedding CLS o el mean-pooling enmascarado.
- Extraccion de representaciones de capas intermedias (por ejemplo, capa 6) para analisis de caracteristicas biologicas.
- Compatibilidad con backends de atencion acelerados (SDPA y Flash Attention 2) para inferencia mas rapida.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo encoder puro.

## Casos de uso

- Prediccion de estabilidad del mRNA: las representaciones de la region 3' UTR pueden alimentar un clasificador que estime la vida media del transcrito, ya que esta region contiene elementos que influyen en la degradacion.
- Identificacion de sitios de union de microARN: los embeddings de secuencias 3' UTR pueden usarse como entrada para modelos que predicen interacciones miRNA-mRNA, aprovechando la informacion contextual de los 4-meros.
- Clasificacion de elementos reguladores post-transcripcionales: fine-tuning del modelo para distinguir entre diferentes tipos de motivos funcionales presentes en la region 3' UTR (por ejemplo, elementos ricos en AU, sitios de poliadenilacion).
- Analisis de expresion genica diferencial: los embeddings de UTR pueden combinarse con datos de expresion para estudiar como las variaciones en la region 3' UTR afectan la traduccion o la localizacion del mRNA.
- Generacion de caracteristicas para modelos de prediccion de interacciones RNA-proteina: las representaciones de 4-meros pueden servir como features para clasificadores que predicen union de proteinas RBP a la region 3' UTR.
- Estudio de variantes geneticas en regiones no codificantes: dado que el modelo fue preentrenado en secuencias humanas, puede utilizarse para evaluar el impacto de variantes de un solo nucleotido en la region 3' UTR mediante comparacion de embeddings entre secuencias wild-type y mutadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye metricas estandar como MMLU, HumanEval o GSM8K, ya que esta disenado para tareas biologicas especificas y no para razonamiento general. La unica verificacion publicada es la paridad numerica con el checkpoint original, con diferencias maximas de 3.15e-5 en hidden states y 4.72e-5 en logits (modo eager).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en fp32 y 175 MB en fp16 para una secuencia de 512 tokens (87 millones de parametros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como NVIDIA GTX 1650, RTX 2060 o superiores funcionan sin problemas. Tambien es ejecutable en CPU para inferencia de lotes pequenos.
- Cabe en GPUs de consumo: si, incluso en las mas modestas.
- Opciones de despliegue: transformers (PyTorch), con soporte para SDPA y Flash Attention 2. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponible. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por secuencia en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

La siguiente tabla compara las variantes de la familia UTRBERT disponibles en la coleccion de HuggingFace. No se dispone de datos de parametros para las otras variantes, por lo que se indican los valores conocidos.

| Modelo | k-mer | Tamano de vocabulario | Parametros | Contexto maximo | Licencia |
|---|---|---|---|---|---|
| UTRBERT-3mer | 3 | 69 | No disponible | 512 tokens | CC-BY-4.0 |
| UTRBERT-4mer | 4 | 261 | 87.034.629 | 512 tokens | CC-BY-4.0 |
| UTRBERT-5mer | 5 | 1029 | No disponible | 512 tokens | CC-BY-4.0 |
| UTRBERT-6mer | 6 | 4101 | No disponible | 512 tokens | CC-BY-4.0 |

No se dispone de comparativas con otros modelos de RNA como DNABERT o RNABERT en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo fue preentrenado exclusivamente con secuencias humanas de la region 3' UTR; su aplicacion a otras especies o regiones genomicas puede producir representaciones poco fiables.
- La tokenizacion en 4-meros solapados genera una secuencia de tokens de longitud L-3, lo que puede resultar contraintuitivo y requiere un manejo cuidadoso de los tokens especiales y el enmascaramiento.
- No se han publicado benchmarks de tareas biologicas especificas, por lo que el rendimiento real en aplicaciones downstream no esta validado.
- El uso requiere `trust_remote_code=True` y depende del repositorio externo `BERT-updated` para el codigo del modelo; la carga local necesita acceso a red si el codigo no esta cacheado.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion al autor original (Yang et al., 2024) y al port (Taykhoom).
- Al ser un modelo encoder, no es adecuado para generacion de texto ni tareas de lenguaje natural; su unico dominio son secuencias biologicas.
- No se han documentado sesgos especificos, pero al entrenarse solo con datos humanos, podria reflejar sesgos de anotacion o de seleccion de secuencias en el conjunto de datos original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/UTRBERT-4mer
- Coleccion UTRBERT: https://huggingface.co/collections/Taykhoom/utrbert
- Repositorio original 3UTRBERT: https://github.com/yangyn533/3UTRBERT
- Registro de software en figshare: https://doi.org/10.6084/m9.figshare.22851119.v1
- Descarga directa del checkpoint: https://ndownloader.figshare.com/files/40597883
- Repositorio del backend BERT-updated: https://huggingface.co/Taykhoom/BERT-updated
