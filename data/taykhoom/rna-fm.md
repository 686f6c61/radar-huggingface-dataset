# Taykhoom/RNA-FM

## Resumen

RNA-FM es un modelo de lenguaje fundacional para ARN, desarrollado originalmente por el grupo de investigación de Yu Li en la Universidad China de Hong Kong (Chen et al., 2022) y portado a Hugging Face Transformers por Taykhoom Dalal. Se trata de un transformer codificador de 12 capas, estilo BERT, preentrenado mediante modelado de lenguaje enmascarado sobre 23,7 millones de secuencias de ARN no codificante procedentes de RNAcentral100. El modelo extrae representaciones vectoriales densas de 640 dimensiones por nucleótido, que capturan información estructural y funcional del ARN sin necesidad de anotaciones.

La relevancia actual de RNA-FM radica en que es uno de los primeros modelos fundacionales específicos para ARN, con un coste computacional moderado (99,5 millones de parámetros) y una licencia MIT que permite uso comercial sin restricciones. Su portabilidad al ecosistema Transformers facilita su integración en pipelines de bioinformática, ya sea para generar embeddings, predecir estructuras secundarias o fine-tuning en tareas downstream como clasificación de tipos de ARN o predicción de sitios de unión a proteínas. El modelo acepta secuencias de hasta 1022 nucleótidos (más tokens especiales) y utiliza un vocabulario de 25 tokens que incluye los nucleótidos canónicos (A, C, G, U), códigos de ambigüedad IUPAC y tokens de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder estilo BERT (pre-LN, similar a ESM-1b) |
| Parametros totales | 99.521.305 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (1022 nucleotidos + CLS/EOS) |
| Tipos de cuantizacion | No especificado en la informacion; compatible con SDPA y Flash Attention 2 |
| Idiomas soportados | ARN (secuencias de nucleotidos, notacion U, no T) |
| Licencia | MIT |
| Formato de pesos | safetensors (0,4 GB) |

## Arquitectura y entrenamiento

RNA-FM emplea una arquitectura de transformer codificador con normalización previa (pre-LayerNorm), siguiendo el diseño de ESM-1b. La configuración incluye 12 capas, 20 cabezas de atención, dimensión de embedding de 640 y una capa FFN oculta de 5120 unidades con activación GELU. El vocabulario consta de 25 tokens: `<cls>`, `<pad>`, `<eos>`, `<unk>`, los cuatro nucleótidos canónicos (A, C, G, U), códigos de ambigüedad IUPAC (R, Y, K, M, S, W, B, D, H, V, N), un token de hueco (`-`), cuatro tokens de relleno nulo y `<mask>`. La codificación posicional es aprendida.

El preentrenamiento se realizó con el objetivo de modelado de lenguaje enmascarado (MLM) estilo BERT, con una tasa de enmascarado del 15%, sobre el conjunto RNAcentral100, que contiene 23,7 millones de secuencias de ARN no codificante. El checkpoint original proviene de `RNA-FM_pretrained.pth` del repositorio cuhkaih/rnafm. La conversión a Hugging Face verifica paridad numérica exacta (diferencia máxima absoluta de 0,00) en los 13 niveles de representación (embedding + 12 capas) frente a la implementación original, con diferencias numéricas esperadas de ~1e-4 al usar atención SDPA, que no afectan a la corrección. El port añade soporte para `attn_implementation="sdpa"` y `"flash_attention_2"`, que no existían en el código original.

## Capacidades

- Generación de embeddings por token y por secuencia: produce vectores de 640 dimensiones para cada nucleótido y un embedding global mediante el token CLS, útil para tareas de clasificación y regresión a nivel de secuencia.
- Modelado de lenguaje enmascarado: puede predecir nucleótidos enmascarados en una secuencia, lo que permite evaluar la plausibilidad de variantes o completar regiones desconocidas.
- Extracción de representaciones intermedias: permite acceder a las salidas de cualquiera de las 12 capas, facilitando el análisis de características a diferentes niveles de abstracción.
- Fine-tuning estándar: compatible con las convenciones de Hugging Face, se puede adaptar con cabezas de clasificación o regresión sobre el embedding CLS.
- Soporte de atención eficiente: implementa SDPA y Flash Attention 2, reduciendo el consumo de memoria y acelerando la inferencia en GPUs modernas.
- Capacidad multilingüe limitada al ARN: no procesa lenguaje natural; solo secuencias de nucleótidos en notación ARN (U, no T).

## Casos de uso

- Predicción de estructura secundaria de ARN: los embeddings de RNA-FM pueden alimentar modelos downstream (por ejemplo, cabezas convolucionales o grafos) para predecir pares de bases y bucles, aprovechando la información estructural capturada durante el preentrenamiento.
- Clasificación de tipos de ARN no codificante: fine-tuning del embedding CLS para distinguir entre ARNt, ARNr, ARNmi, ARNlnc, etc., a partir de secuencias de longitud variable.
- Detección de sitios de unión a proteínas (RBP): uso de embeddings por token como entrada a un clasificador puntual para identificar regiones de interacción ARN-proteína, relevante en regulación génica.
- Análisis de variantes patogénicas: evaluación del impacto de mutaciones puntuales comparando la probabilidad MLM del nucleótido original frente al mutado, útil en estudios de enfermedades genéticas.
- Anotación funcional de ARN recién secuenciados: generación de representaciones para agrupar transcritos no anotados y asignar funciones putativas por similitud de embeddings.
- Preentrenamiento de modelos multimodales ARN-proteína: uso de los embeddings como rama de ARN en arquitecturas que combinan secuencias de ARN y proteínas para predecir interacciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, dado que se trata de un modelo especializado en ARN y no en tareas de lenguaje general. El artículo original (arXiv:2204.00300) reporta mejoras en predicción de estructura secundaria y otras tareas, pero esos datos no están reproducidos en la ficha de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: con 99,5 millones de parámetros, en FP32 el modelo ocupa ~400 MB; en FP16 ~200 MB; en int8 ~100 MB. Con un batch pequeño (por ejemplo, 8 secuencias de 1024 tokens), el consumo total de VRAM se mantiene por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Tarjetas consumer como GTX 1060 6GB, RTX 2060, RTX 3060 o superiores pueden ejecutar el modelo sin problemas. En CPU también es viable para inferencia de lotes pequeños.
- Opciones de despliegue: al ser un modelo Transformers estándar, se puede servir con vLLM, TGI, Hugging Face Inference Endpoints o mediante scripts Python con PyTorch. También es compatible con llama.cpp si se convierte a formato GGUF, aunque no se proporciona oficialmente.
- Latencia y throughput estimados: no se han publicado mediciones oficiales. En una GPU RTX 3090, se puede esperar una latencia de decenas de milisegundos por secuencia de 1024 tokens con batch 1, y un throughput de cientos de secuencias por minuto con batch optimizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Embedding dim | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| RNA-FM (Taykhoom) | 99,5 M | 1024 tokens | 640 | 23,7 M ncRNA (MLM) | MIT |
| mRNA-FM (Taykhoom) | No disponible | No disponible | 1280 | 45 M CDS (codon 3-mer) | MIT |
| RNA-FM original (ml4bio) | 99,5 M | 1024 tokens | 640 | 23,7 M ncRNA (MLM) | MIT |

La comparativa se limita a los modelos de la misma colección, ya que no se dispone de datos de otros modelos de ARN comparables en la información proporcionada. mRNA-FM es la variante para ARN codificante, con tokenización por codones y mayor dimensión de embedding. El modelo original de ml4bio es el checkpoint base del que deriva este port, con idéntica arquitectura y pesos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con ARN no codificante de RNAcentral100, por lo que su rendimiento en ARN codificante (ARNm) puede ser subóptimo. Para ARNm se recomienda usar mRNA-FM.
- Riesgo de alucinación: al ser un modelo MLM, las predicciones de nucleótidos enmascarados son probabilísticas y pueden no corresponder a secuencias biológicamente plausibles. No debe usarse para generar secuencias completas sin validación experimental.
- Limitaciones de contexto: la ventana máxima es de 1022 nucleótidos, insuficiente para ARN largos (por ejemplo, ARNlnc de más de 1 kb). Para secuencias más largas es necesario fragmentar o usar modelos con mayor contexto.
- Restricciones de idioma: solo acepta notación ARN (U, no T). Si se introducen secuencias de ADN con T, el tokenizador fallará o producirá tokens desconocidos. Es necesario convertir T a U previamente.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías. Los usuarios deben verificar la idoneidad para aplicaciones clínicas o de diagnóstico.
- Caveat de producción: la paridad numérica se verificó con PyTorch 2.7 y transformers 4.57.6; versiones anteriores pueden presentar diferencias. Además, el uso de SDPA o Flash Attention 2 introduce diferencias numéricas de ~1e-4 que, aunque no afectan a la corrección, pueden ser relevantes en aplicaciones que requieren reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taykhoom/RNA-FM
- Colección RNA-FM: https://huggingface.co/collections/Taykhoom/rna-fm-6a22c8c778d29e6dd3d437af
- Repositorio original (ml4bio): https://github.com/ml4bio/RNA-FM
- Artículo arXiv: https://arxiv.org/abs/2204.00300
- Checkpoint original en Hugging Face: https://huggingface.co/cuhkaih/rnafm
