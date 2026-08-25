# Taykhoom/RNABERT

## Resumen

RNABERT es un modelo de lenguaje especializado en secuencias de ARN, presentado como un port mínimo de HuggingFace del modelo original desarrollado por Akiyama y Sakakibara (2022). El port ha sido realizado por Taykhoom, que ha verificado la paridad de pesos con el checkpoint original `bert_mul_2.pth`. El modelo emplea una arquitectura BERT encoder con normalización posterior (post-LN), 6 capas, 12 cabezas de atención y una dimensión de embedding de 120, lo que resulta en un total de 493.926 parámetros. Su objetivo principal es generar representaciones (embeddings) informativas de secuencias de ARN no codificante para tareas de clustering y alineamiento estructural, un problema relevante en biología computacional donde las herramientas clásicas de alineamiento son computacionalmente costosas.

El modelo fue preentrenado sobre el conjunto de datos Rfam 14.3, compuesto por secuencias de aproximadamente 400 nucleótidos, utilizando un doble objetivo: modelado de lenguaje enmascarado (MLM) y aprendizaje de alineamiento estructural (SAL), una función contrastiva que empareja secuencias con estructura similar. La ventana de contexto está limitada a 440 tokens, donde cada token corresponde a un nucleótido individual. El vocabulario es mínimo (6 tokens: pad, mask, A, U, G, C) y la tokenización se realiza carácter a carácter, convirtiendo silenciosamente T en U. Este port añade soporte para backends de atención acelerada (SDPA y Flash Attention 2) que no estaban presentes en el código original, y requiere `trust_remote_code=True` tanto para el tokenizador como para el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder post-LN (6 capas, 12 cabezas, embedding 120, FFN 40) |
| Parametros totales | 493.926 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 440 tokens (un nucleotido por token) |
| Tipos de cuantizacion | No disponible (no se mencionan cuantizaciones en la informacion) |
| Idiomas soportados | No disponible (modelo biologico para ARN, no lenguaje natural) |
| Licencia | other (sin licencia especificada en el repositorio original; contactar a los autores para uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT encoder con normalización posterior (post-LN) y atención de producto escalado estándar. Consta de 6 bloques transformer, cada uno con 12 cabezas de atención, una dimensión de embedding de 120 y una capa feed-forward oculta de 40 unidades con activación GELU. La codificación posicional es aprendida y absoluta. El vocabulario está compuesto por 6 tokens: `<pad>` (0), `<mask>` (1), `A` (2), `U` (3), `G` (4) y `C` (5). No se añaden tokens CLS ni EOS; las secuencias se tokenizan carácter a carácter y la timidina (T) se convierte en uracilo (U) de forma silenciosa.

El preentrenamiento se realizó sobre el conjunto de datos completo de Rfam 14.3, con secuencias de aproximadamente 400 nucleótidos, utilizando dos objetivos combinados: modelado de lenguaje enmascarado (MLM) y aprendizaje de alineamiento estructural (SAL), una función de pérdida contrastiva por pares que alinea secuencias con estructura secundaria similar. El checkpoint utilizado es `bert_mul_2.pth`, distribuido dentro del archivo `RNABERT_pretrained.pth` del repositorio original. El port de HuggingFace verifica la paridad de todas las capas de representación (embedding + 6 bloques) con el checkpoint original, con una diferencia absoluta máxima de 3.19e-6, tanto con y sin padding, para los backends eager y SDPA. El port añade soporte para `attn_implementation="sdpa"` y `attn_implementation="flash_attention_2"`, que no existían en el código original.

## Capacidades

- Generación de embeddings a nivel de token y de secuencia: produce representaciones de 120 dimensiones por token, y mediante mean pooling sobre posiciones no padding se obtiene un embedding de secuencia de 120 dimensiones.
- Modelado de lenguaje enmascarado (fill-mask): puede predecir nucleótidos enmascarados en una secuencia de ARN, útil para tareas de completado y corrección.
- Clustering de ARN no codificante: los embeddings generados capturan información estructural que permite agrupar secuencias por función o familia.
- Alineamiento estructural: el objetivo SAL durante el preentrenamiento dota al modelo de capacidad para relacionar secuencias con estructura secundaria similar.
- Extracción de representaciones intermedias: se puede acceder a las salidas de capas intermedias (por ejemplo, la capa 3) para análisis de representaciones o fine-tuning selectivo.
- Fine-tuning para clasificación: al no tener token CLS, se recomienda usar mean pooling sobre posiciones no padding para tareas de clasificación de secuencias.
- Compatibilidad con backends de atención acelerada: soporta SDPA (PyTorch 2.0+) y Flash Attention 2, lo que mejora el rendimiento en GPU.

## Casos de uso

- Clustering de familias de ARN no codificante: dado un conjunto de secuencias de ARN, se pueden generar embeddings con RNABERT y aplicar algoritmos de clustering (k-means, HDBSCAN) para agrupar secuencias por función o familia, aprovechando la información estructural capturada por el objetivo SAL.
- Alineamiento estructural de ARN: los embeddings de secuencia pueden usarse como características para métodos de alineamiento estructural, reduciendo el coste computacional frente a herramientas clásicas basadas en energía libre.
- Clasificación de tipos de ARN no codificante: fine-tuning del modelo con una cabeza de clasificación lineal sobre el embedding promediado permite distinguir entre tipos de ARN (miRNA, tRNA, rRNA, etc.) con pocos datos etiquetados.
- Detección de homología remota: los embeddings de RNABERT pueden servir para identificar secuencias con estructura similar aunque su secuencia primaria difiera, útil en anotación genómica.
- Predicción de elementos funcionales: el modelo puede fine-tuning para predecir la presencia de motivos estructurales o sitios de unión en secuencias de ARN.
- Análisis exploratorio de datos ómicos: integración de los embeddings en pipelines de análisis de datos de secuenciación de ARN no codificante para visualización y reducción de dimensionalidad (t-SNE, UMAP).
- Generación de secuencias candidatas: mediante MLM, se pueden enmascarar posiciones y muestrear nucleótidos para proponer variantes de una secuencia de ARN con posible relevancia funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o similares, dado que se trata de un modelo biológico especializado y no de un modelo de lenguaje general. El port verifica la paridad con el checkpoint original, pero no se reportan métricas de tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de solo 493.926 parámetros, la huella de memoria es mínima. Con precisión float32, el modelo ocupa aproximadamente 2 MB; con float16, alrededor de 1 MB. Cabe en cualquier GPU comercial, incluso en las más modestas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Para usar Flash Attention 2 se requiere una GPU compatible con CUDA y la librería `flash-attn` instalada. SDPA funciona con PyTorch 2.0+ en cualquier GPU moderna.
- Compatibilidad con GPU de consumo: sí, funciona en RTX 2060, RTX 3060, RTX 4090, etc. También puede ejecutarse en CPU sin problemas para inferencia de lotes pequeños.
- Opciones de despliegue: el modelo se integra con la librería `transformers` de HuggingFace. Se puede servir con vLLM, TGI o mediante un pipeline de `feature-extraction`. Para despliegues ligeros, también es posible exportar a ONNX o usar llama.cpp si se convierte a GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput estimados: no se dispone de mediciones oficiales. Dado el tamaño reducido, la inferencia de una secuencia de 440 nucleótidos debería completarse en milisegundos en GPU y en decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo de preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RNABERT (este port) | 494K | 440 nt | MLM + SAL | other (sin especificar) | HuggingFace, requiere trust_remote_code |
| RNABERT original (mana438) | 494K | 440 nt | MLM + SAL | Sin especificar | GitHub, pesos en Google Drive |
| mRNABERT (Nature 2025) | No disponible | No disponible | Diseño de secuencias de mRNA | No disponible | Articulo en Nature Communications |

No se dispone de datos de rendimiento comparativo entre estos modelos en tareas comunes. El port de HuggingFace es funcionalmente equivalente al original, con la ventaja de integrarse en el ecosistema `transformers`. mRNABERT es un modelo más reciente y de mayor escala orientado al diseño de secuencias completas de mRNA, pero no se han publicado comparaciones directas con RNABERT.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio original no define una licencia. La model card advierte explícitamente que se debe contactar a los autores antes de redistribuir o usar el modelo en entornos comerciales.
- Contexto limitado: la ventana máxima es de 440 nucleótidos, lo que impide procesar secuencias de ARN más largas sin truncamiento o estrategias de ventana deslizante.
- Vocabulario restringido: solo maneja los cuatro nucleótidos canónicos (A, U, G, C) y convierte T en U. No soporta nucleótidos modificados ni ARN con otras bases.
- Sin token CLS: el modelo no genera un embedding de secuencia automático; es necesario aplicar mean pooling sobre posiciones no padding, lo que puede no ser óptimo para todas las tareas.
- Requiere `trust_remote_code=True`: tanto el tokenizador como el modelo dependen de código personalizado, lo que introduce un riesgo de seguridad si se cargan desde fuentes no fiables.
- Sesgos del conjunto de datos: el preentrenamiento se realizó únicamente sobre Rfam 14.3, por lo que el modelo puede tener un rendimiento deficiente en secuencias de ARN que no estén representadas en esa base de datos.
- Riesgo de alucinación en MLM: como cualquier modelo de lenguaje enmascarado, las predicciones de nucleótidos enmascarados pueden no corresponder a variantes biológicamente plausibles.
- Sin soporte para tareas de lenguaje natural: no es un modelo de propósito general; su uso está estrictamente limitado a datos de ARN.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/RNABERT
- Colección RNABERT en HuggingFace: https://huggingface.co/collections/Taykhoom/rnabert
- Repositorio original en GitHub: https://github.com/mana438/RNABERT
- Articulo cientifico (DOI): https://doi.org/10.1093/nargab/lqac012
- Implementacion no oficial en MultiMolecule: https://multimolecule.danling.org/models/rnabert/
- Checkpoint original en Google Drive: https://drive.google.com/file/d/1sT6jlv9vrpX0npKmnbFeOqZ1JZDrZTQ2/view?usp=sharing
