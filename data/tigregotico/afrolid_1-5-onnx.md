# TigreGotico/afrolid_1.5-onnx

## Resumen

AfroLID v1.5 ONNX es la exportación a formato ONNX del modelo `UBC-NLP/afrolid_1.5`, un clasificador neuronal de identificación de idioma (LID) desarrollado por el grupo UBC-NLP y distribuido en este repositorio por TigreGotico. Cubre 517 idiomas y variedades africanas, lo que lo convierte en una de las herramientas de LID con mayor cobertura específica del continente africano. El modelo base está afinado a partir de SERENGETI, un encoder masivamente multilingüe de la familia XLM-RoBERTa entrenado para lenguas africanas.

La relevancia de esta exportación es práctica: el modelo original se distribuye en PyTorch y requiere `transformers`, mientras que esta versión ONNX permite inferencia con `onnxruntime` en CPU sin dependencias de framework profundo, con un grafo fp32 de 1,06 GB y una variante int8 de 267 MB. Al ser un `XLMRobertaForSequenceClassification` estándar, la conversión mediante `optimum-cli` es directa, sin necesidad de grafos personalizados ni particionado como ocurre con los modelos LID basados en fastText.

El repositorio incluye una comprobación de paridad frente al modelo original PyTorch sobre 5 frases en 5 idiomas distintos (dinka, suajili, hausa, yoruba y zulú), con un 100 % de coincidencia top-1 tanto en fp32 como en int8. Esa muestra es un smoke test de fidelidad de conversión, no una evaluación sistemática de precisión sobre las 517 lenguas soportadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (`XLMRobertaForSequenceClassification`) |
| Parametros totales | no disponible (modelo base XLM-RoBERTa; el grafo fp32 ocupa 1,06 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tokenizador XLM-R; límite típico de 512 tokens, no confirmado en la información proporcionada) |
| Tipos de cuantizacion | fp32 (`model.onnx`) e int8 dinámico (`model.int8.onnx`) |
| Idiomas soportados | 517 idiomas y variedades africanas (518 etiquetas en `id2label`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.int8.onnx`) + tokenizador XLM-R (`tokenizer.json`, `sentencepiece.bpe.model`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer XLM-RoBERTa con cabeza de clasificación de secuencias, exportado a ONNX con `optimum-cli export onnx --task text-classification`. La salida es una distribución sobre 518 etiquetas (517 idiomas más la clase residual de mapeo), mapeadas en `config.json` mediante `id2label`. El tokenizador es el estándar de XLM-R basado en SentencePiece BPE.

El checkpoint subyacente, `UBC-NLP/afrolid_1.5`, está afinado a partir de SERENGETI, un encoder de la familia XLM-RoBERTa entrenado de forma masivamente multilingüe sobre lenguas africanas (Adebara et al., 2023). El artículo de referencia es AfroLID (Adebara et al., EMNLP 2022), que describe el entrenamiento del clasificador LID. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables a una tarea de clasificación).

La innovación técnica de esta ficha no está en el modelo sino en la exportación: al tratarse de un transformer estándar, la conversión ONNX es directa y no requiere el particionado de grafos ni el hashing personalizado que necesitan los modelos LID basados en fastText de la misma organización. La cuantización int8 dinámica reduce el tamaño de 1,06 GB a 267 MB manteniendo, según el autor, la paridad top-1 en la muestra de prueba.

## Capacidades

- Identificación de idioma a nivel de frase o documento corto sobre 517 idiomas y variedades africanas.
- Clasificación de texto multilingüe con salida de etiquetas ISO 639-3 (por ejemplo, `swh` para suajili).
- Manejo de múltiples sistemas de escritura africanos (latino, etíope, árabe ajami, etc.) según la cobertura del checkpoint base.
- Inferencia en CPU mediante `onnxruntime` con `CPUExecutionProvider`, sin necesidad de GPU.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles (según los tags del repositorio).
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Enrutamiento lingüístico en pipelines de NLP multilingüe: detectar el idioma de un documento entrante antes de enviarlo a un traductor, un modelo de resumen o un sistema de búsqueda específico por lengua, usando la variante int8 en CPU para minimizar coste.
- Moderación de contenido en plataformas con audiencia africana: clasificar el idioma de comentarios y publicaciones para aplicar políticas de moderación por región lingüística y priorizar revisores humanos con la lengua adecuada.
- Construcción de corpus y datasets: etiquetar automáticamente grandes volúmenes de texto web o de redes sociales para filtrar por idioma antes de entrenar modelos downstream, aprovechando la cobertura de 517 variedades.
- Análisis de mercado y sociolingüístico: medir la distribución de lenguas en reseñas, encuestas o tickets de soporte para segmentar por comunidad lingüística.
- Preprocesado en sistemas de atención al cliente: detectar el idioma del ticket para asignarlo a un agente o a un modelo de respuesta con el idioma correcto, con la ventaja de cubrir lenguas de bajos recursos que los detectores genéricos no reconocen.
- Investigación en lingüística computacional africana: disponer de un LID de referencia con licencia Apache-2.0 y exportación ONNX reproducible para comparar con GlotLID, lid176 o lid218e en estudios de cobertura continental.
- Despliegue en entornos edge o sin GPU: la variante int8 de 267 MB cabe en contenedores ligeros y permite clasificación en tiempo real en CPU sin infraestructura de aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta exportación ONNX más allá de la prueba de paridad frente al modelo original.

| Modelo | Coincidencia top-1 con referencia PyTorch | Muestra |
|---|---|---|
| `model.onnx` (fp32) | 100,00 % (5/5) | 5 frases, 5 idiomas |
| `model.int8.onnx` | 100,00 % (5/5) | 5 frases, 5 idiomas |

El autor cita un macro-F1 de 97,41 para AfroLID v1.5 según el README del modelo fuente, pero no se aportan aquí los detalles del conjunto de evaluación ni la comparación con otros sistemas. La muestra de paridad (n=5) no constituye una evaluación de precisión real.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; para GPU, el grafo fp32 de 1,06 GB requiere aproximadamente 2-3 GB de VRAM con overhead de runtime, y la variante int8 alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 (GTX 1650, RTX 3050 en adelante); para int8, GPUs de gama baja o incluso CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con la variante int8.
- Opciones de despliegue: `onnxruntime` (CPU o GPU), Text Embeddings Inference (según tags del repo), y cualquier runtime compatible con ONNX (OpenVINO, TensorRT con conversión adicional).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AfroLID v1.5 ONNX (este) | XLM-RoBERTa classifier | 517 africanos | Apache-2.0 | ONNX fp32/int8 | Exportación ONNX directa, sin grafos personalizados |
| GlotLID (glotlid-onnx) | fastText | Cobertura global (miles) | no disponible en esta ficha | ONNX | Requiere hashing/particionado personalizado en la exportación |
| lid176-onnx | fastText | 176 | no disponible en esta ficha | ONNX | Cobertura más estrecha, orientación general |
| lid218e-onnx | fastText | 218 | no disponible en esta ficha | ONNX | Cobertura intermedia, orientación general |

Los tres comparadores pertenecen a la misma organización distribuidora (TigreGotico) y se citan en la model card como alternativas del inventario. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- La muestra de paridad es de solo 5 frases; no valida la precisión real sobre las 517 lenguas soportadas.
- El propio autor documenta un fallo del checkpoint base: una frase en yoruba ("Loni ni ojo to dara pupo ni Eko.") se clasifica como `wol` (wolof) tanto en PyTorch como en ONNX, por lo que es una limitación del modelo original, no de la conversión.
- Riesgo de confusión entre lenguas cercanas o de bajos recursos, especialmente en textos muy cortos o con code-switching.
- La model card del repositorio original `UBC-NLP/afrolid_1.5` no declara licencia explícita; la Apache-2.0 se infiere de los repositorios `UBC-NLP/afrolid` y `UBC-NLP/serengeti`. Conviene verificar antes de un uso comercial crítico.
- Es un clasificador, no un modelo generativo: no produce texto, no razona y no soporta herramientas.
- No se documentan sesgos específicos más allá de los inherentes al corpus de entrenamiento de SERENGETI.
- El límite de contexto del tokenizador XLM-R no se detalla en la información proporcionada; textos largos requerirán truncado o segmentación.
- Repositorio con muy poca tracción (5 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en producción ni mantenimiento continuado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TigreGotico/afrolid_1.5-onnx
- Modelo base: https://huggingface.co/UBC-NLP/afrolid_1.5
- Modelo SERENGETI: https://huggingface.co/UBC-NLP/serengeti
- Repositorio AfroLID: https://github.com/UBC-NLP/afrolid
- Repositorio SERENGETI: https://github.com/UBC-NLP/serengeti
- Paper AfroLID (Adebara et al., EMNLP 2022): https://aclanthology.org/2022.emnlp-main.XXX (referencia bibliográfica citada en la model card; URL exacta no disponible en la información proporcionada)
- Paper SERENGETI (Adebara et al., 2023): referencia citada en la model card; URL exacta no disponible en la información proporcionada
