# Taykhoom/UTRBERT-6mer

## Resumen

UTRBERT-6mer es un modelo de lenguaje basado en la arquitectura BERT-base, preentrenado sobre secuencias de la región 3' UTR (región no traducida) de ARN mensajero humano. Se trata de un port minimalista a HuggingFace de la variante de 6-mer del modelo 3UTRBERT, desarrollado originalmente por Yang et al. (2024) para descifrar la regulación génica mediada por estas regiones. El modelo emplea una tokenización basada en k-meros solapados de ARN, lo que le permite capturar patrones locales de secuencia relevantes para la regulación traduccional y la unión de microARN.

Con 92,9 millones de parámetros, 12 capas y una dimensión de embedding de 768, UTRBERT-6mer sigue la configuración clásica de BERT-base pero con un vocabulario propio de 4101 tokens (5 especiales más los 4096 posibles 6-meros de ARN). Su ventana de contexto es de 512 tokens, equivalentes a hasta 515 nucleótidos crudos. El modelo se preentrenó con el objetivo de masked language modeling (MLM) sobre datos de 3' UTR humanos, y su relevancia actual radica en que proporciona representaciones interpretables de secuencias reguladoras, un área de creciente interés en biología computacional y diseño de ARN terapéutico.

Este port ha sido verificado contra los pesos originales, con diferencias máximas en float32 del orden de 1e-5, lo que garantiza paridad con la implementación de referencia. Está disponible bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base encoder post-LN (12 capas, 12 cabezas, dim 768, FFN 3072 GELU) |
| Parametros totales | 92.936.709 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (hasta 515 nucleótidos crudos) |
| Tipos de cuantizacion | no disponible (pesos en float32; compatible con fp16 y cuantización estándar de transformers) |
| Idiomas soportados | no aplicable (modelo biológico para secuencias de ARN/ADN) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UTRBERT-6mer es un transformer encoder de tipo BERT-base con normalización post-LayerNorm (post-LN, eps=1e-12) y posiciones absolutas aprendidas. La tokenización es la característica distintiva: las secuencias de ARN (o ADN, previa conversión T->U) se dividen en 6-meros solapados con stride 1, de modo que una secuencia de longitud L produce L-5 tokens. El tokenizador añade los tokens especiales [CLS] y [SEP] al inicio y final, respectivamente. El vocabulario contiene 4101 entradas: 5 tokens especiales más los 4096 posibles 6-meros de ARN (4^6).

El preentrenamiento se realizó con el objetivo de masked language modeling (MLM) sobre tokens de 6-mer, utilizando secuencias de 3' UTR humanas agregadas. El checkpoint fuente es `6-new-12w-0/pytorch_model.bin`, disponible en figshare (registro 22851272). No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es exclusivamente autosupervisado con MLM.

El port incorpora una innovación técnica: además del backend de atención eager original, ofrece backends seleccionables de scaled dot-product attention (SDPA) y Flash Attention 2, lo que permite acelerar la inferencia en GPUs modernas. La paridad con los pesos originales se verificó en los 13 niveles de representación (embedding + 12 capas), con diferencias máximas en float32 de 3,31e-5 para hidden states y 2,55e-5 para logits en modo eager, y 2,24e-5 / 1,93e-5 con SDPA.

## Capacidades

- Generación de representaciones contextuales de secuencias de ARN: produce embeddings por token y por secuencia (CLS) de dimensión 768, útiles para tareas downstream de biología computacional.
- Masked language modeling sobre k-meros: puede predecir 6-meros enmascarados, lo que permite explorar la plausibilidad de variantes de secuencia.
- Fine-tuning para clasificación de secuencias: la capa CLS puede conectarse a una cabeza de predicción para tareas como clasificación de UTR o predicción de estabilidad.
- Extracción de representaciones de capas intermedias: se pueden obtener hidden states de cualquier capa (por ejemplo, capa 6) para análisis de interpretabilidad.
- Compatibilidad con backends de atención acelerada: SDPA y Flash Attention 2, además del eager original.
- Capacidades multilingües: no aplicable, al ser un modelo biológico especializado en secuencias de ARN.
- Tool calling, agentes, visión o audio: no soportados, ya que el modelo es exclusivamente para secuencias biológicas.

## Casos de uso

- Predicción de estabilidad de ARN mensajero: las representaciones de 3' UTR generadas por UTRBERT-6mer pueden alimentar modelos de regresión para estimar la vida media del mRNA, dado que la región 3' UTR es un determinante clave de la estabilidad.
- Análisis de sitios de unión de microARN: los embeddings de secuencias de UTR permiten identificar patrones asociados a la represión traduccional mediada por microARN, facilitando estudios de regulación génica.
- Clasificación de UTR funcionales: mediante fine-tuning con la capa CLS, se pueden construir clasificadores que distingan UTR con diferentes propiedades reguladoras, por ejemplo, aquellas asociadas a enfermedades.
- Diseño de ARN terapéutico: las representaciones aprendidas pueden guiar la selección de secuencias 3' UTR optimizadas para la expresión de proteínas terapéuticas en células humanas.
- Estudio de variantes genéticas en regiones no codificantes: el modelo puede evaluar el impacto de polimorfismos de un solo nucleótido (SNP) en la región 3' UTR mediante la comparación de representaciones de secuencias variantes.
- Generación de embeddings para búsqueda de similitud: las representaciones de secuencias permiten agrupar UTR por similitud funcional, útil para anotación de genomas y bases de datos de regulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, dado que el modelo no está diseñado para tareas de lenguaje natural o código. Para tareas biológicas, no se proporcionan resultados comparativos con otros modelos de ARN en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 92,9 millones de parámetros, el modelo requiere aproximadamente 372 MB en float32, 186 MB en float16 y unos 93 MB en int8. Estas cifras son estimaciones basadas en el tamaño de parámetros y no incluyen memoria para activaciones ni el tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en float32. Para fine-tuning, se recomienda una GPU con 8 GB o más (por ejemplo, RTX 3060, RTX 4070, A100). El modelo es compatible con GPUs consumer de gama media.
- Despliegue en consumer GPU: sí, cabe en GPUs de 4 GB o menos si se usa cuantización o precisión mixta.
- Opciones de despliegue: el modelo se integra con la librería transformers de HuggingFace, por lo que puede servirse con vLLM, TGI, o ejecutarse localmente con PyTorch. También es compatible con llama.cpp si se convierte a formato GGUF, aunque no se proporciona un archivo GGUF en el repositorio.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un BERT-base de tamaño similar procesa típicamente entre 100 y 500 secuencias por segundo en una GPU moderna (A100) con batch de 32, pero estos valores dependen del backend de atención y la longitud de las secuencias.

## Comparativa con modelos similares

La siguiente tabla compara UTRBERT-6mer con las otras variantes de la colección UTRBERT, que comparten la misma arquitectura base pero difieren en el tamaño del vocabulario de k-meros.

| Modelo | k-mer | Vocabulario | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| UTRBERT-3mer | 3 | 69 | no disponible | 512 tokens | CC-BY-4.0 |
| UTRBERT-4mer | 4 | 261 | no disponible | 512 tokens | CC-BY-4.0 |
| UTRBERT-5mer | 5 | 1029 | no disponible | 512 tokens | CC-BY-4.0 |
| UTRBERT-6mer | 6 | 4101 | 92.936.709 | 512 tokens | CC-BY-4.0 |

No se dispone de datos de parámetros para las variantes 3mer, 4mer y 5mer en la información consultada, aunque se espera que sean similares al tratarse de la misma arquitectura BERT-base. La elección entre variantes depende del equilibrio entre granularidad de la tokenización y tamaño del vocabulario: los k-meros más largos capturan contextos más amplios pero requieren más datos de entrenamiento para cubrir el vocabulario.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se preentrenó exclusivamente con secuencias de 3' UTR humanas, por lo que sus representaciones pueden no transferirse bien a otras especies o a otras regiones del ARN (5' UTR, codificante, etc.).
- Riesgo de alucinación: al ser un modelo de MLM, puede generar predicciones de k-meros plausibles pero biológicamente incorrectas si se usa de forma generativa sin validación experimental.
- Limitaciones de contexto: la ventana de 512 tokens limita el análisis a secuencias de hasta 515 nucleótidos, lo que excluye UTR más largas sin truncamiento.
- Restricciones de licencia: la licencia CC-BY-4.0 permite uso comercial y modificación, pero exige atribución al autor original. No hay restricciones de uso militar o de otro tipo.
- Requisito de código remoto: el modelo requiere `trust_remote_code=True` y acceso a red para cargar el backend `BERT-updated` desde el repositorio de Taykhoom, lo que puede ser un inconveniente en entornos aislados.
- Dependencia de la implementación original: aunque el port verifica paridad con los pesos originales, cualquier discrepancia futura en el código de `BERT-updated` podría afectar a los resultados.
- No es un modelo de lenguaje natural: no puede procesar texto, solo secuencias de ARN/ADN. Cualquier intento de usarlo con texto humano producirá resultados sin sentido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/UTRBERT-6mer
- Colección UTRBERT en HuggingFace: https://huggingface.co/collections/Taykhoom/utrbert-6a2059e7d24778aee83af7bc
- Repositorio original en GitHub: https://github.com/yangyn533/3UTRBERT
- Implementación alternativa en MultiMolecule: https://github.com/DLS5-Omics/multimolecule/tree/master/multimolecule/models/utrbert
- Paquete PyPI: https://pypi.org/project/UTRBERT/
- Checkpoint fuente en figshare: https://doi.org/10.6084/m9.figshare.22851272.v1 (descarga directa: https://ndownloader.figshare.com/files/40597961)
- Backend de código compartido: https://huggingface.co/Taykhoom/BERT-updated
