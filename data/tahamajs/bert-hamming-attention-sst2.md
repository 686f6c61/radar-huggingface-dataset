# tahamajs/bert-hamming-attention-sst2

## Resumen

`tahamajs/bert-hamming-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar han sido sustituidas por el mecanismo `hamming_attention` de la libreria NeuralOps. El modelo resultante se ha destilado sobre la tarea de clasificacion de sentimiento SST-2 (GLUE) mediante el protocolo de destilacion en dos etapas de NeuralOps, que cachea representaciones del profesor en disco para no requerir su VRAM durante el entrenamiento. Lo desarrolla Taha Majlesi (usuario `tahamajs`) como parte del "BERT-131 Subquadratic Attention Zoo", una coleccion de variantes de BERT con mecanismos de atencion subcuadraticos.

El interes practico es doble: por un lado, demuestra que es posible sustituir la atencion cuadratica de BERT por un mecanismo subcuadratico manteniendo una precision cercana a la del modelo original (89,33 % frente a 91,63 % del profesor en SST-2); por otro, documenta un pipeline de destilacion reproducible y de bajo coste (49,4 segundos y 9,2 GB de VRAM pico en una RTX 3090). Es, por tanto, una pieza de investigacion sobre eficiencia de atencion mas que un modelo listo para produccion general.

El modelo es un encoder BERT-base de aproximadamente 110 millones de parametros, entrenado exclusivamente en ingles, con licencia MIT y empaquetado con `custom_code` (requiere `trust_remote_code=True`). Su unico uso declarado es la clasificacion de texto binaria (sentimiento positivo/negativo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion `hamming_attention` subcuadratica en las 12 capas |
| Parametros totales | no disponible (arquitectura derivada de bert-base-uncased, ~110 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,5 GB; requiere `custom_code` de NeuralOps) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 bloques de self-attention estandar por el mecanismo `hamming_attention`, una atencion subcuadratica propia de la libreria NeuralOps. No se detalla en la model card la formulacion matematica exacta del mecanismo ni su complejidad asintotica; solo se etiqueta como `subquadratic-attention`. La cabeza de clasificacion es la estandar de `AutoModelForSequenceClassification` con dos clases.

El entrenamiento consiste en una destilacion de conocimiento sobre GLUE SST-2 con el "NeuralOps 2-Stage Cached Representation Distillation Protocol", que cachea las representaciones del profesor de forma offline para operar con VRAM cero del profesor. La etapa 1 alinea representaciones ocultas (coseno + MSE de subespacio) y la etapa 2 aplica KL sobre logits de secuencia mas entropia cruzada de la tarea. El proceso completo se ejecuto en una NVIDIA RTX 3090 de 24 GB del cluster Sharif HPC: 215 pasos, 49,4 segundos, 35 668 tokens/s y 9 193 MB de VRAM pico. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de SST-2, ni si hubo RLHF/DPO (no aplica en un encoder de clasificacion).

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre texto de entrada.
- Inferencia sobre frases y parrafos dentro del limite de contexto de BERT-base.
- Integracion con `transformers` mediante `trust_remote_code=True` y con la API de alto nivel `neuralops.hub.bert_zoo`.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingue: no; solo ingles.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Analisis de sentimiento de resenas de producto en ingles: el modelo clasifica cada resena como positiva o negativa; su tamano (~110 M) permite desplegarlo en CPU o GPU de gama baja para lotes grandes.
- Moderacion de comentarios en foros angloparlantes: filtrado automatico de mensajes con tono negativo para revision humana posterior, aprovechando la baja latencia de un encoder pequeno.
- Enriquecimiento de pipelines de datos: etiquetado de sentimiento a escala sobre corpus de texto en ingles antes de alimentar sistemas de analitica o busqueda.
- Investigacion sobre atencion subcuadratica: sirve como punto de partida y referencia para comparar mecanismos de atencion eficientes frente a la atencion cuadratica de BERT en tareas de clasificacion.
- Docencia y reproduccion de destilacion: el protocolo documentado (dos etapas, cache offline, 49 s en RTX 3090) permite reproducir el experimento con recursos modestos.
- Clasificacion de encuestas de satisfaccion: procesamiento por lotes de respuestas abiertas en ingles para obtener una metrica agregada de sentimiento.
- Baseline en experimentos de eficiencia: comparar precision y coste frente a `bert-base-uncased` para justificar o descartar la adopcion de atencion subcuadratica.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras), segun la model card:

| Metrica | Profesor (bert-base-uncased) | Estudiante pre-destilacion | Modelo destilado | Delta vs pre-KD |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 83,83 % | 89,33 % | +5,50 % |
| Validation loss | 0,2428 | no disponible | 0,3275 | no disponible |

Telemetria de entrenamiento: 215 pasos, 49,4 s, 35 668 tokens/s, 9 193 MB de VRAM pico en RTX 3090.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un encoder de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repo (0,5 GB) y la arquitectura BERT-base, cabria esperar un consumo en el rango de 1-2 GB en fp32, pero no esta confirmado en la model card.
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM; el entrenamiento se valido en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: si, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores; no confirmado oficialmente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el uso de `custom_code` complica el despliegue en servidores de inferencia estandar.
- Latencia y throughput: no se publican cifras de inferencia; solo la telemetria de entrenamiento (35 668 tokens/s, 215 pasos en 49,4 s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-hamming-attention-sst2` | ~110 M (no confirmado) | no disponible (heredado de BERT-base) | 89,33 % | MIT | Hugging Face, requiere `custom_code` |
| `google-bert/bert-base-uncased` (profesor, afinado en SST-2) | ~110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, `transformers` estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` estandar |
| `roberta-base` afinado en SST-2 | ~125 M | 512 tokens | no disponible en la informacion proporcionada | MIT | Hugging Face, `transformers` estandar |

La comparativa se limita a datos publicados; no se dispone de resultados de los modelos alternativos en la informacion proporcionada mas alla de la referencia del profesor en la propia model card.

## Limitaciones y advertencias

- Solo ingles: no apto para texto en castellano u otros idiomas sin reentrenamiento.
- Tarea unica: clasificacion binaria de sentimiento; no genera texto ni resuelve otras tareas.
- Precision inferior al profesor: pierde 2,3 puntos de accuracy en SST-2 (89,33 % frente a 91,63 %), lo que puede ser relevante en dominios sensibles.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero puede producir clasificaciones erroneas con confianza alta en entradas ambiguas, sarcasticas o fuera de dominio.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de `bert-base-uncased`, hereda los sesgos de su corpus de preentrenamiento.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True` y la libreria NeuralOps, lo que anade superficie de ataque y complica la auditoria y el despliegue en produccion.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni mantenimiento a largo plazo.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia de los pesos base de BERT (Apache 2.0) y de NeuralOps.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones cuantizadas, lo que limita el despliegue en entornos con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-hamming-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
