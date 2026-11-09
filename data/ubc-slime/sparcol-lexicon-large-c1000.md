# UBC-SLIME/sparcol-lexicon-large-c1000

## Resumen

SPARCOL-Lexicon es un modelo de recuperación léxica dispersa (sparse retrieval) desarrollado por el grupo UBC-SLIME, construido sobre el backbone answerdotai/ModernBERT-large y afinado para atribución de autoría a gran escala. Forma parte del trabajo "Learned Sparse Lexical Representations for Large-scale Authorship Attribution", presentado en Findings de EMNLP 2026. El modelo genera una representación dispersa por token con 1000 dimensiones, donde las asignaciones a clústeres se aprenden durante el entrenamiento en lugar de derivarse a posteriori mediante k-means.

Con 395,8 millones de parámetros y una longitud máxima de secuencia de 512 tokens, el modelo se distribuye como checkpoint final de un entrenamiento de 2 épocas (paso 1580) y está pensado para integrarse en pipelines de búsqueda y comparación de documentos mediante similitud MaxSim sobre tokens no nulos. Su relevancia radica en que sustituye la recuperación densa tradicional por una representación léxica aprendida y dispersa, lo que facilita la interpretabilidad y el emparejamiento eficiente en tareas de atribución de autoría.

El modelo es monolingüe (inglés), se publica bajo licencia MIT y su uso requiere el código del repositorio lingjzhu/neural_lexical, ya que no funciona como un pipeline estándar de sentence-transformers sin la clase ClusteredTransformer y el fichero cluster_ids.pt.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabeza de representación dispersa por token y clústeres aprendidos |
| Parametros totales | 395.831.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-large y añade una capa de agrupamiento en clústeres aprendida durante el entrenamiento, de modo que cada token de entrada se proyecta a un vector disperso de 1000 dimensiones. Las asignaciones de token a clúster se guardan en cluster_ids.pt y deben cargarse junto con los pesos; no deben recalcularse con k-means en inferencia. La activación de tokens es log1p(ReLU), sin tokens CLS/SEP ni reescalado de embeddings, y la puntuación se realiza con MaxSim medio sobre los tokens de consulta no nulos.

El checkpoint liberado corresponde al paso 1580 (época 2.0) del directorio exp2/outputs_clustered_colbert_modernbert_large_1000_relu_scale1_nocls. El empaquetado añade configuración portable del módulo y elimina logs de entrenamiento y ejemplos de datos; los pesos y asignaciones de clúster se conservan del checkpoint original. No se han vuelto a ejecutar las evaluaciones completas de HRS para esta release y no se reclaman nuevos resultados de benchmark. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de representaciones dispersas por token para recuperación léxica y comparación de documentos.
- Atribución de autoría a gran escala mediante puntuación MaxSim sobre tokens no nulos.
- Búsqueda y emparejamiento de documentos basado en representaciones léxicas aprendidas (1000 dimensiones por token).
- Integración con sentence-transformers a través de la clase SparseEncoder y el módulo ClusteredTransformer.
- Soporte de inferencia en bfloat16 sobre GPU (según el ejemplo de la model card).
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles (el modelo no es generativo).

## Casos de uso

- Atribución de autoría forense: comparar un texto anónimo con un conjunto de candidatos usando MaxSim medio sobre tokens no nulos, aprovechando que las representaciones dispersas capturan señales léxicas idiosincrásicas del autor.
- Detección de plagio y reutilización textual: indexar documentos con vectores dispersos de 1000 dimensiones y recuperar fragmentos con alta similitud léxica para revisión manual posterior.
- Búsqueda léxica aprendida en corpus grandes: sustituir índices BM25 por representaciones dispersas entrenadas que mantienen interpretabilidad por token y permiten emparejamiento eficiente.
- Verificación de autoría en entornos editoriales: comprobar si un manuscrito enviado coincide estilísticamente con envíos previos del mismo autor mediante similitud entre representaciones.
- Análisis de corpus históricos o literarios: agrupar y comparar textos de autores conocidos para estudiar variación estilística a nivel de token con un modelo de 512 tokens de contexto.
- Construcción de pipelines de recuperación en investigación: usar el modelo como componente de scoring dentro de sistemas de búsqueda que requieran representaciones dispersas interpretables y ligeras (395,8 M de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han vuelto a ejecutar las evaluaciones completas de HRS para esta release y que no se reclaman nuevos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 395,8 M de parámetros, en bfloat16 los pesos ocupan aproximadamente 0,8 GB, a lo que hay que sumar activaciones y el fichero cluster_ids.pt.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de la model card usa CUDA con autocast en bfloat16.
- Compatibilidad con GPU de consumo: probable en tarjetas con suficiente VRAM para el modelo completo en bfloat16 (por encima de 8 GB), aunque no se confirma oficialmente.
- Opciones de despliegue: requiere el repositorio lingjzhu/neural_lexical y las clases ClusteredTransformer y SparseEncoder; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de recuperación léxica dispersa para atribución de autoría ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta inglés, según la etiqueta de idioma del repositorio.
- Longitud de contexto limitada a 512 tokens, lo que restringe el análisis de documentos largos sin fragmentación previa.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso.
- Requiere cargar cluster_ids.pt junto con los pesos; recalcular los clústeres con k-means en inferencia produciría resultados incorrectos.
- La puntuación debe hacerse con MaxSim medio sobre tokens de consulta no nulos y activación log1p(ReLU); usar otro esquema de scoring invalidaría los resultados esperados.
- No se han publicado benchmarks para esta release, por lo que el rendimiento real en producción no está validado de forma independiente.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible; al ser un modelo de representación, el riesgo principal es la atribución errónea de autoría en textos cortos o atípicos.
- Licencia MIT: permite uso comercial, pero conviene revisar las obligaciones de atribución y el uso del código auxiliar del repositorio neural_lexical.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UBC-SLIME/sparcol-lexicon-large-c1000
- Paper (Findings EMNLP 2026): https://aclanthology.org/2026.findings-emnlp.400/
- Repositorio de código: https://github.com/lingjzhu/neural_lexical
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
