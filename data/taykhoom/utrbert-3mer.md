# Taykhoom/UTRBERT-3mer

## Resumen

UTRBERT-3mer es un modelo de lenguaje basado en la arquitectura BERT-base, preentrenado sobre secuencias de regiones 3' UTR (regiones no traducidas) de ARN mensajero humano. Se trata de un port minimalista a HuggingFace de la variante de 3-mer del modelo 3UTRBERT, desarrollado originalmente por el grupo de Yuning Yang y colaboradores. El modelo resuelve el problema de obtener representaciones densas y aprendidas de secuencias de ARN para estudiar la regulacion genica mediada por la region 3' UTR, un area clave en biologia molecular y medicina.

Con 86,7 millones de parametros y una arquitectura de encoder BERT de 12 capas, el modelo tokeniza las secuencias de ARN convirtiendo timidina a uridina y dividiendolas en 3-meros solapados con paso 1. Su ventana de contexto es de 512 tokens, lo que equivale a aproximadamente 510 nucleotidos crudos. Fue preentrenado con el objetivo de modelado de lenguaje enmascarado (MLM) sobre secuencias de 3' UTR humanas, y su relevancia actual radica en que proporciona una base solida y verificada para tareas de prediccion y analisis en genomica funcional.

El checkpoint publicado corresponde a la variante `3-new-12w-0`, y la paridad con los pesos originales fue verificada con diferencias maximas de 1,45e-5 en estados ocultos y 3,00e-5 en logits. El modelo se distribuye bajo licencia CC-BY-4.0 y esta disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base encoder (post-LN) |
| Parametros totales | 86.739.525 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (hasta 510 nucleotidos crudos) |
| Tipos de cuantizacion | FP32, FP16 (via Flash Attention 2) |
| Idiomas soportados | No aplica (secuencias biologicas de ARN/ADN) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UTRBERT-3mer emplea una arquitectura de encoder BERT-base con normalizacion post-LayerNorm (eps=1e-12), 12 capas, 12 cabezas de atencion, dimension de embedding de 768 y dimension oculta de FFN de 3072 con activacion GELU. El vocabulario consta de 69 tokens: 5 tokens especiales ([CLS], [SEP], [MASK], [PAD], [UNK]) y 64 3-meros de ARN. La codificacion posicional es absoluta aprendida, al estilo BERT clasico.

La tokenizacion convierte las secuencias de ARN (o ADN) de T a U y las divide en 3-meros solapados con stride 1: una secuencia de longitud L produce L-2 tokens. El script de preprocesamiento oficial limita las secuencias crudas a 510 nucleotidos. El preentrenamiento se realizo con el objetivo de modelado de lenguaje enmascarado (MLM) sobre secuencias de 3' UTR humanas, utilizando el checkpoint `3-new-12w-0` publicado en figshare. No se dispone de informacion sobre el numero exacto de secuencias ni de tokens de entrenamiento.

El port a HuggingFace anade backends de atencion seleccionables: SDPA (PyTorch 2.0+) y Flash Attention 2, ademas del eager original. La paridad con los pesos originales fue verificada en los 13 niveles de representacion (embedding + 12 capas) y en los logits de MLM, con diferencias maximas en float32 de 1,45e-5 (estados ocultos) y 3,00e-5 (logits) en modo eager, y 8,11e-6 / 2,46e-5 con SDPA.

## Capacidades

- Generacion de embeddings contextuales para secuencias de ARN: embeddings CLS (dimension 768), embeddings por token y embeddings mean-pooled sobre tokens biologicos (excluyendo tokens especiales).
- Modelado de lenguaje enmascarado (MLM) sobre tokens de 3-meros de ARN, util para tareas de prediccion de contexto biologico.
- Extraccion de representaciones de capas intermedias (por ejemplo, capa 6) para analisis de caracteristicas jerarquicas.
- Fine-tuning para tareas a nivel de secuencia mediante el embedding CLS o el mean-pooling enmascarado como entrada a una cabeza de prediccion.
- Compatibilidad con backends de atencion acelerados: SDPA y Flash Attention 2.
- Capacidad multilingue: no aplica; el modelo opera exclusivamente sobre secuencias biologicas de ARN/ADN.

## Casos de uso

- Prediccion de sitios de union de microARN: las regiones 3' UTR son el principal lugar de union de microARN; el modelo puede fine-tunearse con embeddings CLS para clasificar secuencias con sitios de union conocidos.
- Estudio de regulacion genica post-transcripcional: los embeddings generados permiten analizar como variaciones en la secuencia de la 3' UTR afectan la estabilidad del ARN mensajero y la traduccion.
- Analisis de estabilidad del ARN mensajero: las 3' UTR contienen elementos que determinan la vida media del transcrito; el modelo puede utilizarse para predecir estabilidad a partir de la secuencia.
- Fine-tuning para clasificacion de secuencias en genomica funcional: la arquitectura BERT-base permite anadir cabezas de clasificacion para tareas como identificacion de elementos reguladores o variantes patogenicas en regiones 3' UTR.
- Generacion de representaciones para aprendizaje por transferencia: los embeddings preentrenados pueden servir como caracteristicas de entrada para modelos downstream (regresion, clustering) sin necesidad de reentrenar el modelo completo.
- Investigacion en medicina de precision: analisis de variantes en 3' UTR asociadas a enfermedades, aprovechando la capacidad del modelo para capturar contexto local de hasta 510 nucleotidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de tareas downstream como prediccion de estabilidad, sitios de union de microARN u otras evaluaciones cuantitativas. La unica verificacion publicada es la de paridad numerica con los pesos originales, con diferencias maximas de 1,45e-5 en estados ocultos y 3,00e-5 en logits (modo eager, float32).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en FP32 y 175 MB en FP16 para los pesos del modelo, mas overhead de activaciones y atencion.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o similar consumer es mas que adecuada. Tambien puede ejecutarse en CPU sin problemas para inferencia de lotes pequenos.
- Compatibilidad con GPU consumer: si, el modelo cabe comodamente en cualquier GPU consumer moderna.
- Opciones de despliegue: transformers (HuggingFace) con `trust_remote_code=True`; compatible con backends SDPA y Flash Attention 2. No se menciona soporte para vLLM, llama.cpp u Ollama en la documentacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada; al tratarse de un modelo BERT-base de 86,7 millones de parametros, la latencia por secuencia es del orden de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | k-mer | Vocabulario | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| UTRBERT-3mer | 3 | 69 | 86,7 M | 512 tokens | CC-BY-4.0 |
| UTRBERT-4mer | 4 | 261 | no disponible | 512 tokens | CC-BY-4.0 |
| UTRBERT-5mer | 5 | 1029 | no disponible | 512 tokens | CC-BY-4.0 |
| UTRBERT-6mer | 6 | 4101 | no disponible | 512 tokens | CC-BY-4.0 |

Los modelos UTRBERT-4mer, 5mer y 6mer pertenecen a la misma familia y comparten arquitectura BERT-base, diferenciandose en el tamanio del vocabulario de k-meros. No se dispone de datos de rendimiento comparativo entre variantes en la informacion proporcionada. En el ecosistema de modelos biologicos, UTRBERT-3mer es comparable en arquitectura a DNABERT u otros BERT de genomica, aunque no se dispone de datos de benchmarks para una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo fue preentrenado exclusivamente sobre secuencias de 3' UTR humanas; su capacidad de generalizacion a otras especies o regiones genomicas no esta verificada.
- La longitud maxima de secuencia es de 512 tokens (aproximadamente 510 nucleotidos), lo que limita el analisis de 3' UTR largas.
- No es un modelo generativo: no puede generar secuencias de ARN, solo producir representaciones y logits de MLM.
- Requiere `trust_remote_code=True` para cargarse desde HuggingFace, y la carga de un directorio local tambien necesita acceso de red al repositorio `BERT-updated` salvo que el codigo este cacheado.
- No se han publicado evaluaciones de sesgos o riesgos de alucinacion especificos; como modelo biologico, las predicciones deben validarse experimentalmente.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el modelo es un port de un trabajo de investigacion; se recomienda revisar las condiciones del repositorio original.
- No se dispone de informacion sobre el numero de secuencias de entrenamiento ni la composicion exacta del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/UTRBERT-3mer
- Coleccion UTRBERT: https://huggingface.co/collections/Taykhoom/utrbert
- Repositorio original 3UTRBERT: https://github.com/yangyn533/3UTRBERT
- Implementacion en MultiMolecule: https://github.com/DLS5-Omics/multimolecule/tree/master/multimolecule/models/utrbert
- Documentacion de 3UTRBERT en MultiMolecule: https://multimolecule.danling.org/models/utrbert/
- Registro figshare del checkpoint: https://doi.org/10.6084/m9.figshare.22847354.v1
- Descarga directa del checkpoint: https://ndownloader.figshare.com/files/40597877
- Repositorio de codigo BERT-updated: https://huggingface.co/Taykhoom/BERT-updated
