# teinam/KURE-v2-onnx

## Resumen

KURE-v2-onnx es la exportación a formato ONNX del modelo de recuperación de información nlpai-lab/KURE-v2, desarrollado por el NLP&AI Lab de la Universidad de Corea. Se trata de un encoder de interacción tardía (late interaction) compatible con ColBERT y PyLate, pensado para búsqueda semántica de documentos mediante el cálculo de similitud MaxSim entre vectores por token de consulta y de documento. El autor de la conversión es el usuario teinam, que lo publica como parte del proyecto Ieum, una aplicación de escritorio que realiza búsqueda de conocimiento en local (on-device).

El modelo no introduce ningún ajuste fino adicional: es una conversión de formato del modelo base, con pesos en fp32 y un grafo ONNX de opset 18 exportado con TorchScript. El encoder subyacente es ModernBERT, sobre el que se aplica una cabeza de proyección densa (768→1536 con residual, 1536→768 con residual y 768→128) que reduce cada token a un embedding de 128 dimensiones ya normalizado en L2.

Su relevancia actual radica en que permite ejecutar recuperación densa de tipo ColBERT sin depender de PyTorch, usando ONNX Runtime en CPU, lo que facilita el despliegue en aplicaciones de escritorio y entornos sin GPU. El repositorio incluye además una copia de la librería ONNX Runtime 1.31.0 para macOS arm64, lo que refuerza su orientación a inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT + cabeza de proyección densa (ColBERT / PyLate, late interaction) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens por consulta (truncada y rellenada a 63 + token [Q]); documentos truncados según reglas PyLate, longitud máxima no especificada |
| Tipos de cuantizacion | fp32 (la conversión a fp16 no carga en ONNX Runtime 1.31 CPU según el autor) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx, 614.804.784 bytes) + tokenizer.json |
| Dimension de embedding | 128 por token, normalizado en L2 |
| Opset | 18 |
| Entradas del grafo | input_ids, attention_mask (int64, [batch, seq]) |
| Salida del grafo | embeddings (float32, [batch, seq, 128]) |
| Funcion de scoring | MaxSim |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ModernBERT con una cabeza de proyección específica para recuperación de interacción tardía. El grafo ONNX recibe `input_ids` y `attention_mask`, pasa por el encoder ModernBERT y aplica tres capas densas con conexiones residuales (768→1536, 1536→768 y 768→128), produciendo un tensor `[batch, seq, 128]` con embeddings por token normalizados en L2. El scoring se realiza mediante MaxSim, el mecanismo característico de ColBERT: para cada token de la consulta se toma la similitud máxima contra los tokens del documento y se suman.

La conversión se realizó con el exportador TorchScript de PyTorch 2.8.0, transformers 5.3.0 y pylate 1.6.0, y se validó contra la implementación PyLate en fp32 con un coseno mínimo por token de 0,9999999 y una diferencia en la suma MaxSim menor o igual a 1,1e-4. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base. La tokenización sigue las reglas de PyLate 1.6: la consulta se trunca a 63 tokens, se rellena con `<mask>` (id 4, atención 0) y se inserta `[Q]` (id 50000) en la posición 1, usando los 64 vectores; en documentos se inserta `[D]` (id 50001) en la posición 1 y se descartan los vectores con atención 0 o con id en la lista de exclusión.

## Capacidades

- Generación de embeddings de recuperación densa por token (128 dimensiones) para búsqueda semántica.
- Recuperación de documentos mediante late interaction y scoring MaxSim, el paradigma de ColBERT.
- Procesamiento bilingüe coreano-inglés.
- Extracción de características (`feature-extraction`) como pipeline principal.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de PyTorch ni GPU.
- Compatibilidad con el ecosistema PyLate para indexación y búsqueda.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de recuperación.

## Casos de uso

- Búsqueda de conocimiento en aplicaciones de escritorio: es el caso de uso declarado por el autor, que integra el modelo en la app Ieum para búsqueda local de conocimiento sin conexión, aprovechando la inferencia en CPU vía ONNX Runtime.
- Motor de recuperación en asistentes RAG: el modelo puede actuar como retriever en un pipeline de generación aumentada, indexando fragmentos de documentos y recuperando los más relevantes para cada consulta antes de pasarlos a un LLM.
- Búsqueda semántica bilingüe coreano-inglés: adecuado para bases documentales que mezclan ambos idiomas, con consultas en un idioma y documentos en otro.
- Indexación de documentación técnica: la representación por token permite capturar coincidencias parciales y términos específicos mejor que un embedding único de frase, útil en documentación con jerga técnica.
- Aplicaciones de escritorio sin GPU: al ejecutarse en ONNX Runtime CPU, encaja en productos instalables en portátiles convencionales donde no se puede asumir hardware acelerador.
- Sistemas de búsqueda con requisitos de privacidad: al funcionar en local, los documentos no salen del dispositivo, lo que resulta apropiado para corpus sensibles.
- Filtrado y reordenación (reranking) de resultados: la puntuación MaxSim puede emplearse como segunda fase sobre candidatos recuperados por un sistema léxico o vectorial más rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la conversión frente a la implementación PyLate en fp32: coseno mínimo por token de 0,9999999 y diferencia en la suma MaxSim menor o igual a 1,1e-4.

## Requisitos de hardware

- El modelo se ejecuta en CPU mediante ONNX Runtime 1.31.0 (CPU Execution Provider); no requiere GPU.
- Tamaño del archivo de pesos: 614.804.784 bytes (aproximadamente 0,61 GB) en fp32, más el tokenizer (1,09 MB). El repositorio completo ocupa 0,7 GB.
- VRAM estimada: no aplica en el modo de ejecución documentado (CPU). Para ejecución en GPU no hay datos publicados.
- GPU recomendadas: no disponible, ya que la model card no documenta despliegue en GPU.
- Cabe en cualquier equipo de escritorio convencional; el autor incluye una librería ONNX Runtime para macOS arm64 (Apple Silicon).
- Opciones de despliegue: ONNX Runtime (probado en 1.31.0 con CPU EP); el ecosistema PyLate puede usarse para indexación y scoring.
- La conversión a fp16 no carga en ONNX Runtime 1.31 CPU, por lo que el autor distribuye exclusivamente fp32.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| teinam/KURE-v2-onnx | ColBERT / PyLate (late interaction) | ko, en | ONNX fp32 | Apache-2.0 | Conversión de formato, sin ajuste fino; inferencia en CPU |
| nlpai-lab/KURE-v2 | ColBERT / PyLate (late interaction) | ko, en | PyTorch (safetensors, presumiblemente) | Apache-2.0 | Modelo base del que deriva esta conversión |
| Otros retrievers ColBERT/ColBERTv2 | Late interaction | Mayoritariamente en | PyTorch | MIT / Apache-2.0 según variante | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de recuperación frente a alternativas; la comparación se limita a aspectos de formato, licencia e idioma.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda todas las limitaciones del modelo base nlpai-lab/KURE-v2.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en castellano no está documentado.
- Ventana de consulta fija de 64 tokens (63 + token `[Q]`); las consultas más largas se truncan.
- La conversión a fp16 no es funcional en ONNX Runtime 1.31 CPU, lo que limita la reducción de memoria en ese entorno.
- No es un modelo generativo: no puede usarse para chat, resumen ni generación de código.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de recuperaciones irrelevantes o falsos positivos en dominios fuera de la distribución de entrenamiento del modelo base.
- No se han publicado evaluaciones de sesgo ni de robustez en la información disponible.
- Licencia Apache-2.0: permite uso comercial con atribución y conservación del aviso de licencia; debe respetarse también la licencia del modelo base.
- El repositorio incluye una copia de ONNX Runtime bajo licencia MIT, con su propio aviso en `onnxruntime/LICENSE`.
- El tokenizer.json se distribuye con truncamiento y relleno activados; deben desactivarse antes de aplicar las reglas de tokenización de PyLate.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teinam/KURE-v2-onnx
- Modelo base: https://huggingface.co/nlpai-lab/KURE-v2
- Commit del modelo base exportado: `3431f86d399d666083890dbb882aced6708873bc`
- ONNX Runtime 1.31.0 (release osx-arm64): https://github.com/microsoft/onnxruntime/releases/tag/v1.31.0
- Proyecto Ieum: no disponible (no se proporciona URL en la información)
- Paper de ModernBERT: no disponible en la información proporcionada
- Paper de ColBERT: no disponible en la información proporcionada
