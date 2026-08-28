# Teradata/opus-mt-ja-en

## Resumen

El modelo `Teradata/opus-mt-ja-en` es una conversión a formato ONNX del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-ja-en`, desarrollado por el grupo Helsinki-NLP. Este modelo traduce texto del japonés al inglés y está empaquetado específicamente para su despliegue en la plataforma de base de datos Teradata mediante la función `mldb.ONNXSeq2Seq` de Bring Your Own Model (BYOM). Su relevancia radica en que permite ejecutar traducción de calidad directamente dentro del motor SQL de Teradata, sin necesidad de infraestructura externa de inferencia.

La arquitectura subyacente es MarianMT, un modelo encoder-decoder basado en transformer-align, entrenado sobre el corpus OPUS. El repositorio no redistribuye los pesos originales, sino que incluye el grafo ONNX en precisión completa (fp32) y una variante cuantizada a int8, junto con el tokenizador y la configuración necesarios para su uso en Teradata. La ventana de contexto está limitada a 512 tokens de entrada y 512 de salida, y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (encoder-decoder, transformer-align) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada, 512 de salida |
| Tipos de cuantizacion | fp32 (766 MB) e int8 (382 MB) en formato ONNX |
| Idiomas soportados | japones (ja) a ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 14, IR version 8); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-ja-en` emplea la arquitectura MarianMT, una implementacion de transformer con mecanismo de atencion de tipo transformer-align. El entrenamiento se realizo sobre el corpus OPUS, un conjunto de datos multilingue de alineaciones de frases extraidas de la web, con un preprocesamiento que incluye normalizacion y tokenizacion mediante SentencePiece para manejar la complejidad morfologica del japones. No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO.

La conversion a ONNX fue realizada con el paquete open-source `teradata-opus-translate`, que exporta el encoder y decoder, integra la operacion de busqueda de haces (beam search) en el grafo, aplica cuantizacion int8 solo a los pesos y verifica la paridad con el modelo PyTorch original sobre una muestra pequena. Los parametros de generacion (longitud minima y maxima, numero de haces, penalizaciones) no estan fijados en el grafo y pueden configurarse en tiempo de ejecucion via SQL.

## Capacidades

- Traduccion automatica de japones a ingles con calidad contrastada (BLEU 41.7 en el conjunto de test Tatoeba).
- Generacion de texto condicionada con control de parametros como `num_beams`, `length_penalty` y `repetition_penalty` a traves de la funcion `ONNXSeq2Seq`.
- Integracion nativa con el ecosistema Teradata BYOM, permitiendo invocar el modelo desde consultas SQL sobre tablas.
- Soporte de tokenizacion Marian/SentencePiece empaquetada en un unico `tokenizer.json` compatible con BYOM.
- Disponibilidad de dos precisiones (fp32 e int8) para equilibrar calidad y tamano de despliegue.
- No soporta tool calling, agentes, vision ni audio; es exclusivamente un modelo de traduccion.

## Casos de uso

- Traduccion de contenido empresarial en tiempo real: una empresa con datos almacenados en Teradata puede traducir automaticamente comentarios de clientes, tickets de soporte o descripciones de productos del japones al ingles mediante una simple consulta SQL, sin mover los datos a un servicio externo.
- Pipeline de localizacion de documentacion: integrar la traduccion de manuales o guias tecnicas escritas en japones dentro de un flujo ETL, generando versiones en ingles listas para publicacion.
- Analisis de sentimiento multilingue: traducir resenas o feedback de usuarios japoneses a ingles para unificarlos con el resto de datos y aplicar modelos de analisis de sentimiento en ingles.
- Enriquecimiento de datos maestros: traducir campos como nombres de productos, categorias o descripciones en bases de datos corporativas para estandarizar la informacion en ingles.
- Soporte al cliente automatizado: preprocesar mensajes de clientes japoneses traduciendolos a ingles antes de pasarlos a un chatbot o sistema de clasificacion de intenciones.
- Migracion de datos historicos: convertir archivos o tablas legacy con contenido en japones a ingles para su integracion en sistemas internacionales, aprovechando la ejecucion por lotes en SQL.

## Benchmarks y rendimiento

Segun la informacion disponible en fuentes externas, el modelo base `Helsinki-NLP/opus-mt-ja-en` alcanza una puntuacion BLEU de 41.7 y un character F-score de 0.589 en el conjunto de test Tatoeba para la direccion ja-en. No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, etc.) para esta conversion ONNX, ya que se trata de un modelo de traduccion especializado.

| Benchmark | Resultado |
|---|---|
| BLEU (Tatoeba test, ja-en) | 41.7 |
| Character F-score (Tatoeba test) | 0.589 |

## Requisitos de hardware

- El archivo ONNX fp32 ocupa 766 MB y la version int8 382 MB, por lo que caben en GPU de consumo con al menos 2 GB de VRAM para fp32 y 1 GB para int8, aunque se recomienda 4 GB para margen.
- Puede ejecutarse en CPU sin problemas para inferencia por lotes; en GPU, cualquier NVIDIA con soporte CUDA (GTX 1080, RTX 2060 o superior) es suficiente.
- Para despliegue en Teradata, no se requiere GPU propia: la inferencia se ejecuta dentro del motor BYOM, que gestiona los recursos.
- Fuera de Teradata, el grafo ONNX puede servirse con runtime ONNX, ONNX Runtime, o convertirse a otros formatos (GGUF, etc.) si se desea usar con llama.cpp u Ollama, aunque no es el proposito del repositorio.
- La latencia depende del hardware y de la longitud de los textos; con beam search de 4 haces y secuencias cortas, se esperan decenas de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | BLEU (Tatoeba ja-en) | Licencia | Formato |
|---|---|---|---|---|---|
| Helsinki-NLP/opus-mt-ja-en (original) | MarianMT | 512 | 41.7 | Apache-2.0 | PyTorch/safetensors |
| Teradata/opus-mt-ja-en (este) | MarianMT (ONNX) | 512 | 41.7 (heredado) | Apache-2.0 | ONNX |
| Facebook NLLB-200-distilled-600M | Transformer encoder-decoder | 1024 | no disponible | CC-BY-NC | PyTorch |

La comparativa con NLLB es cualitativa: NLLB soporta muchos mas idiomas y contexto mayor, pero su licencia es no comercial y su tamano es mayor. Para uso exclusivo ja-en en entornos Teradata, este modelo es mas ligero y directamente integrable.

## Limitaciones y advertencias

- Ventana de contexto limitada a 512 tokens de entrada y salida; textos mas largos deben segmentarse, lo que puede afectar a la coherencia de la traduccion.
- Solo traduce de japones a ingles; no soporta la direccion inversa ni otros idiomas.
- El modelo puede producir traducciones literales o errores con jerga tecnica, nombres propios o expresiones idiomaticas poco frecuentes en el corpus de entrenamiento.
- Riesgo de alucinacion en segmentos ambiguos o con ruido, comun en modelos de traduccion de tamano pequeno.
- La conversion ONNX no redistribuye los pesos originales; el usuario debe obtener el modelo base de Helsinki-NLP si necesita los pesos PyTorch.
- La integracion con Teradata requiere version 17.20+ con BYOM 7.0.0.4 o superior; en versiones anteriores el grafo ONNX (IR version 8) no es compatible.
- El disclaimer de Teradata indica que el contenido se proporciona "AS IS" y que el usuario es responsable del cumplimiento normativo (IA, privacidad, exportacion) al usar el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Teradata/opus-mt-ja-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ja-en
- Version ONNX de Xenova: https://huggingface.co/Xenova/opus-mt-ja-en
- Ficha en AIBase: https://model.aibase.com/models/details/1915693281062838273
- Ficha en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/opus-mt-ja-en-helsinki-nlp
- Paquete de conversion: https://pypi.org/project/teradata-opus-translate/
