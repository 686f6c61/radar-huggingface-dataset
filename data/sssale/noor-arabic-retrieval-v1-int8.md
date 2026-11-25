# Sssale/noor-arabic-retrieval-v1-int8

## Resumen

`Sssale/noor-arabic-retrieval-v1-int8` es una conversión a ONNX con cuantización dinámica int8 del modelo de embeddings de frases `omarelshehy/Arabic-Retrieval-v1.0`, un bi-encoder BERT especializado en recuperación de información en árabe. No se trata de un modelo nuevo ni reentrenado: los pesos son los del autor original y solo cambia el formato de fichero (ONNX) y la precisión numérica (int8). El modelo base último es `aubmindlab/bert-base-arabertv02` (AraBERT), sobre el que se hizo un ajuste fino para tareas de retrieval.

El objetivo del modelo es generar embeddings de 768 dimensiones para consultas y pasajes en árabe, de forma que la similitud coseno entre ambos permita ordenar pasajes por relevancia. Es relevante para quienes necesitan desplegar búsqueda semántica en árabe con un consumo de recursos reducido: el fichero cuantizado ocupa 135,78 MB frente a los cientos de MB de la versión fp32, lo que facilita su ejecución en CPU y en entornos con memoria limitada.

La conversión está pensada para pipelines de recuperación (RAG, motores de búsqueda interna, deduplicación de documentos) donde la latencia y el coste de infraestructura importan. Al ser un encoder BERT de tamaño base (no generativo), no produce texto: solo vectores. La licencia es la AraBERT Software License Agreement, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (bi-encoder para embeddings de frases) |
| Parametros totales | no disponible (modelo base BERT-base AraBERT; el repo no declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de entrada) |
| Tipos de cuantizacion | int8 dinámica (QUInt8, per-channel, `reduce_range=False`) sobre export ONNX fp32 |
| Idiomas soportados | árabe (`ar`) |
| Licencia | AraBERT Software License Agreement (`license: other`, `license_name: arabert`) |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`), tokenizer en JSON |
| Dimension del embedding | 768 (mean pooling + normalización L2) |
| Prefijos de entrada | `<query>: ` para consultas, `<passage>: ` para pasajes |
| Tamano del repo | 0,1 GB (fichero ONNX de 135,78 MB) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de tipo BERT en su variante AraBERT v02, configurado como bi-encoder para similitud de frases. El modelo original `omarelshehy/Arabic-Retrieval-v1.0` se obtuvo por ajuste fino de `aubmindlab/bert-base-arabertv02` para tareas de recuperación; la model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no disponible). Al ser un modelo de embeddings, no emplea decodificación generativa.

La innovación técnica de este repositorio es exclusivamente la conversión: exportación de los pesos oficiales safetensors a ONNX fp32 (con coincidencia de salida verificada, similitud coseno 1.0000 sobre el conjunto de comprobación) y posterior cuantización dinámica int8 con ONNX Runtime. La deriva medida del fichero int8 frente a la referencia PyTorch es de similitud coseno media 0,967 (mínimo 0,918). El autor advierte que la salida int8 puede variar entre arquitecturas de CPU, por lo que conviene validar en el dispositivo objetivo. La conversión no altera los pesos originales ni reentrena el modelo.

## Capacidades

- Generación de embeddings de frases en árabe de 768 dimensiones para consultas y pasajes.
- Recuperación de información (retrieval) mediante similitud coseno entre embeddings de consulta y pasaje.
- Similitud semántica de frases (pipeline `sentence-similarity`).
- Soporte de prefijos específicos de tarea: `<query>: ` y `<passage>: `.
- Adecuado para búsqueda semántica, ranking de pasajes y base de pipelines RAG en árabe.
- Inferencia en CPU mediante ONNX Runtime, con menor huella de memoria gracias a int8.
- Compatible con Text Embeddings Inference (`text-embeddings-inference`) y endpoints compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder, no un modelo generativo.
- Capacidad multilingüe: limitada al árabe; no se declaran otros idiomas.

## Casos de uso

- Búsqueda semántica en corpus árabes: indexar pasajes como embeddings de 768 dimensiones y recuperar los más relevantes para una consulta mediante similitud coseno, aprovechando la ventana de 512 tokens por fragmento.
- Pipelines RAG sobre documentación en árabe: usar el modelo como recuperador para seleccionar fragmentos antes de pasarlos a un LLM generativo, con prefijos `<query>:` y `<passage>:` para separar roles.
- Atención al cliente con base de conocimiento: emparejar preguntas de usuarios con artículos de FAQ o respuestas preexistentes en árabe, desplegando el ONNX int8 en CPU para reducir coste.
- Deduplicación y agrupación de documentos: calcular embeddings de artículos o registros y detectar duplicados o near-duplicates por umbral de similitud coseno.
- Moderación y clasificación por similitud: comparar mensajes entrantes con un conjunto de referencia de ejemplos etiquetados para enrutar o filtrar contenido.
- Búsqueda interna empresarial en árabe: integrar el encoder en un motor de búsqueda sobre intranet o repositorio documental, con inferencia en CPU y baja latencia gracias al formato ONNX.
- Evaluación de calidad de traducción o paráfrasis: medir similitud semántica entre una frase original y su traducción o reformulación en árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la conversión: similitud coseno 1.0000 del export fp32 frente a PyTorch y similitud coseno media 0,967 (mínimo 0,918) del fichero int8 frente a la referencia, medidas sobre el conjunto de comprobación del autor. No hay datos de MMLU, HumanEval, GSM8K ni métricas de retrieval (Recall@k, MRR, nDCG) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX int8 ocupa 135,78 MB; la inferencia puede ejecutarse en CPU sin GPU dedicada. En GPU, el consumo es mínimo (por debajo de 1 GB en la mayoría de configuraciones).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja pueden servir, aunque el caso natural es CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual, dado el reducido tamaño del modelo.
- Opciones de despliegue: ONNX Runtime (nativo), Text Embeddings Inference (`text-embeddings-inference`), endpoints compatibles; el repo declara compatibilidad con `endpoints_compatible`.
- Latencia y throughput estimados: no disponible. El autor no publica cifras de latencia ni throughput; la cuantización int8 dinámica está orientada a reducir tiempo de inferencia en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Formato | Licencia |
|---|---|---|---|---|---|
| `Sssale/noor-arabic-retrieval-v1-int8` | BERT-base (no declarado) | 512 | árabe | ONNX int8 | AraBERT |
| `omarelshehy/Arabic-Retrieval-v1.0` (original) | BERT-base (no declarado) | 512 | árabe | safetensors (fp32) | Apache-2.0 |
| `aubmindlab/bert-base-arabertv02` (base) | BERT-base | 512 | árabe | safetensors | AraBERT |

El modelo original y este comparten arquitectura y pesos; difieren en formato, precisión y licencia (el original se publica bajo Apache-2.0, esta conversión bajo AraBERT). El modelo base AraBERT v02 no está ajustado para retrieval, por lo que su calidad en recuperación sería inferior. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni reentrenado: cualquier limitación del modelo original `omarelshehy/Arabic-Retrieval-v1.0` se hereda íntegramente.
- La cuantización int8 introduce deriva numérica (similitud coseno media 0,967, mínimo 0,918 frente a PyTorch); la salida puede variar entre arquitecturas de CPU y debe validarse en el dispositivo objetivo.
- Solo soporta árabe; no se declaran capacidades multilingües.
- Longitud máxima de entrada de 512 tokens: los documentos largos deben fragmentarse, lo que puede perder contexto entre fragmentos.
- No se recomienda truncar el vector de 768 dimensiones: el autor indica que la truncación a 256 dimensiones degrada la calidad de recuperación en sus pruebas.
- La evaluación del autor eliminó los diacríticos árabes (tashkeel) de consultas y pasajes antes de codificar; conviene replicar ese preprocesamiento para obtener resultados comparables.
- Licencia AraBERT Software License Agreement: revisar sus términos antes de uso comercial, ya que impone condiciones distintas a las de Apache-2.0 del modelo original.
- Riesgo de sesgos y alucinación: no evaluado en la información disponible; al ser un encoder de similitud, no genera texto, pero los sesgos del corpus de entrenamiento pueden afectar al ranking de pasajes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sssale/noor-arabic-retrieval-v1-int8
- Modelo original: https://huggingface.co/omarelshehy/Arabic-Retrieval-v1.0
- Modelo base AraBERT v02: https://huggingface.co/aubmindlab/bert-base-arabertv02
- Repositorio AraBERT (licencia): https://github.com/aub-mind/arabert
- Paper AraBERT (LREC 2020): Antoun, Baly, Hajj, "AraBERT: Transformer-based Model for Arabic Language Understanding"
