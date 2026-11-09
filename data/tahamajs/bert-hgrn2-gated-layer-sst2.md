# tahamajs/bert-hgrn2-gated-layer-sst2

## Resumen
`bert-hgrn2-gated-layer-sst2` es una variante de `google-bert/bert-base-uncased` publicada por el usuario tahamajs en la que se han sustituido los 12 bloques de atencion multi-cabeza (MHA) por el mecanismo `hgrn2_gated_layer` de la libreria NeuralOps. El modelo resultante se ha destilado sobre la tarea de clasificacion de sentimiento SST-2 del benchmark GLUE, manteniendo la cabeza de clasificacion de secuencia. La relevancia principal no es el rendimiento en si, sino servir como demostracion empirica de que es posible reemplazar la atencion cuadratica por un mecanismo subcuadratico en un transformer preentrenado y recuperar la precision del profesor mediante destilacion de representaciones.

El modelo se distribuye con licencia MIT, unicamente en ingles, y esta pensado como artefacto de investigacion para experimentar con arquitecturas de atencion alternativas y protocolos de knowledge distillation. No es un modelo de proposito general: su unica tarea declarada es la clasificacion binaria de sentimiento (positivo/negativo) sobre frases cortas.

La ficha tecnica es deliberadamente escasa en varios campos porque el autor no proporciona informacion detallada sobre la arquitectura interna del mecanismo `hgrn2_gated_layer`, el volumen de datos de destilacion ni los hiperparametros completos. Todo lo que se indica a continuacion proviene de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con los 12 bloques de atencion sustituidos por `hgrn2_gated_layer` (mecanismo subcuadratico de NeuralOps) |
| Parametros totales | no disponible (derivado de bert-base-uncased, aproximadamente 110 M, no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada presumiblemente de bert-base-uncased, 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en formato nativo, ~0,6 GB) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors / pesos nativos de Hugging Face con `trust_remote_code=True` (no se ofrece GGUF ni ONNX) |

## Arquitectura y entrenamiento
La arquitectura parte de `bert-base-uncased` (transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas en la version original) y reemplaza integramente el bloque de atencion multi-cabeza por el modulo `hgrn2_gated_layer`. Este modulo pertenece a la familia de mecanismos de atencion subcuadratica de NeuralOps, disenados para reducir el coste computacional respecto a la atencion cuadratica clasica. El autor no detalla la formulacion matematica del bloque ni su complejidad asintotica exacta, por lo que no es posible verificar el factor de ahorro real.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre GLUE SST-2, ejecutada en una NVIDIA RTX 3090 de 24 GB. La etapa 1 aplica alineamiento de representaciones ocultas mediante similitud coseno y MSE de subespacio; la etapa 2 aplica KL sobre logits de secuencia combinada con entropia cruzada de la tarea. El protocolo se denomina "2-Stage Cached Representation Distillation" y utiliza cacheado offline de representaciones del profesor, de modo que no requiere mantener el profesor en VRAM durante el entrenamiento. La destilacion completa se ejecuto en 12 pasos, 74,9 segundos, con un throughput de 1312,6 tokens/s y un pico de 12 628 MB de VRAM.

## Capacidades
- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, con una unica etiqueta de salida.
- Inferencia sobre frases cortas, tipicas de resenas y comentarios (formato SST-2).
- Compatible con el pipeline `text-classification` de Hugging Face Transformers mediante `trust_remote_code=True`.
- Carga alternativa a traves de la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue: no, solo ingles.
- No dispone de modo "thinking" ni de ninguna capacidad especial mas alla de la clasificacion.

## Casos de uso
- Analisis de sentimiento en resenas de producto: el modelo clasifica resenas cortas en ingles como positivas o negativas, con una precision del 91,28 % en el split de validacion de SST-2, adecuada para filtrado automatico de opiniones en catalogos.
- Moderacion de comentarios en foros y redes: permite etiquetar rapidamente comentarios en ingles por polaridad para priorizar la revision humana de los negativos.
- Investigacion en arquitecturas de atencion subcuadratica: sirve como punto de partida reproducible para comparar el mecanismo `hgrn2_gated_layer` con MHA en tareas de clasificacion, ya que el autor publica el protocolo de destilacion y las metricas.
- Docencia y experimentacion con knowledge distillation: el modelo ilustra el protocolo de dos etapas con cacheado offline de representaciones del profesor, util para cursos y talleres sobre compresion de modelos.
- Baseline en pipelines de evaluacion de la libreria NeuralOps: permite validar que la sustitucion de atencion no degrada la tarea SST-2 mas alla de 0,35 puntos porcentuales respecto al profesor.
- Prototipado rapido de clasificadores de sentimiento: al ocupar ~0,6 GB en disco y cargar con una sola linea de `transformers`, es viable en entornos de desarrollo con GPU modesta o incluso CPU para lotes pequenos.

## Benchmarks y rendimiento
Evaluacion publicada por el autor sobre el split de validacion de GLUE SST-2 (872 muestras):

| Metrica | Profesor (BERT-base) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 91,06 % | 91,28 % |
| Perdida de validacion | 0,2428 | no disponible | 0,2281 |
| Delta vs pre-KD | — | — | +0,23 pp |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor no compara con modelos alternativos de atencion subcuadratica.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita. Por el tamano del repo (~0,6 GB) y el numero de parametros presumible de BERT-base, la inferencia en fp32 requiere del orden de 0,5-1 GB de VRAM; en fp16 aproximadamente la mitad. Cifra no confirmada por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM deberia poder ejecutar inferencia en fp16. El autor solo documenta la RTX 3090 (24 GB) para el entrenamiento, con un pico de 12 628 MB.
- Cabe en GPU consumer: si, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, aunque el autor no lo verifica.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` y la API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al requerir codigo remoto personalizado, la integracion con esos motores no esta garantizada.
- Latencia y throughput: el autor solo publica throughput de entrenamiento (1312,6 tokens/s en RTX 3090). No hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-hgrn2-gated-layer-sst2` | ~110 M (no confirmado) | no disponible | 91,28 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, transformers nativo |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers nativo |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers nativo |

La comparativa se limita a modelos de la misma categoria (clasificacion SST-2 en ingles) y se basa en los datos disponibles; no se han verificado los resultados de las alternativas en esta ficha porque el autor no los proporciona.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor. Al derivar de `bert-base-uncased` y entrenarse sobre SST-2, es esperable que herede sesgos de genero, raza y dominio presentes en el corpus original y en las resenas de peliculas de SST-2, pero no hay evaluacion al respecto.
- Riesgo de alucinacion: no aplica en sentido estricto (es un clasificador, no un generador), pero puede producir clasificaciones erroneas con alta confianza en textos fuera de dominio o con sarcasmo, ironia y negaciones complejas.
- Limitaciones de contexto e idioma: solo ingles; la longitud de contexto no esta confirmada y probablemente sea 512 tokens, insuficiente para documentos largos.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo depende de codigo remoto (`trust_remote_code=True`) cuyo mantenimiento y auditoria no estan garantizados por el autor.
- Caveats para produccion: el modelo se entreno con solo 12 pasos de destilacion y una unica semilla; no hay evaluacion de robustez, calibracion ni tests adversariales. El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad. El identificador de fecha de creacion (2026-11-09) es posterior a la fecha de esta ficha y debe tratarse con cautela.
- Dependencia de la libreria `neuralops`: el modelo no funciona con `transformers` estandar sin cargar codigo personalizado; esto complica el despliegue en entornos con politicas estrictas de seguridad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-hgrn2-gated-layer-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
- Paper de referencia de BERT: https://arxiv.org/abs/1810.04805
