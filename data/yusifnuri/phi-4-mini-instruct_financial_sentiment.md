# yusifnuri/phi-4-mini-instruct_financial_sentiment

## Resumen

`yusifnuri/phi-4-mini-instruct_financial_sentiment` es un adaptador LoRA (PEFT) sobre el modelo base `microsoft/Phi-4-mini-instruct` (3.800 millones de parametros), especializado en una unica tarea: clasificar una frase financiera como negativa, neutra o positiva. No es un modelo completo ni un asistente general, sino un conjunto de pesos de bajo rango que deben cargarse junto al modelo base mediante la libreria `peft`.

El adaptador se desarrollo como artefacto de investigacion para la tesis de master *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg), que compara modelos pequenos ajustados contra APIs de proveedores frontera en exactitud, latencia, coste, exposicion de privacidad y volumen de equilibrio del retorno de la inversion. Se publica para permitir la verificacion independiente del benchmark.

Su relevancia practica es limitada y el propio autor lo advierte: la exactitud medida es de 0.545, por debajo de la cuota de la clase mayoritaria neutra de su propio split (~0.61), lo que indica un fallo al producir el formato de salida objetivo mas que una competencia parcial. La model card incluye la indicacion explicita de no usarlo; el fallo esta bajo investigacion (seccion 4.2.4 de la tesis).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Phi-4-mini-instruct) con adaptador LoRA de bajo rango |
| Parametros totales | 3.800 millones en el modelo base; numero de parametros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el adaptador se entreno con longitud maxima de secuencia de 512 tokens |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; precision exacta no especificada) |
| Idiomas soportados | No disponible en la informacion proporcionada; el corpus de entrenamiento (Financial PhraseBank) esta en ingles |
| Licencia | MIT para el adaptador; el corpus de entrenamiento es CC BY-NC-SA 3.0, lo que restringe el uso a no comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no pesos completos) |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Biblioteca | peft |
| Pipeline | text-generation |
| Rango / alpha / dropout | 16 / 32 / 0.05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `microsoft/Phi-4-mini-instruct`, un transformer decoder-only de 3.800 millones de parametros orientado a generacion de texto conversacional. Sobre el se aplica un adaptador LoRA con rango 16, alpha 32 y dropout 0.05, inyectado en las proyecciones de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`. No se modifica ningun peso del modelo base; en inferencia se cargan ambos mediante `PeftModel.from_pretrained`.

El entrenamiento uso el subconjunto AllAgree de Financial PhraseBank, con 5.000 ejemplos (500 reservados para seleccion de checkpoint), optimizador AdamW, learning rate 2e-4 con schedule coseno y 3% de warmup, 3 epocas, tamano de lote efectivo 16 (4 x 4 de acumulacion de gradientes), longitud maxima de secuencia de 512 tokens y semilla 42. Los hiperparametros se mantuvieron constantes en todos los modelos y tareas del benchmark en lugar de ajustarse por celda, por lo que el autor los describe como una cota inferior conservadora del rendimiento alcanzable. El adaptador espera un formato de prompt concreto: `Classify the sentiment of this financial sentence (negative / neutral / positive): {text}` seguido de `Sentiment:`. No se documentan en la informacion disponible fases de RLHF, DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases (negativo, neutro, positivo) sobre una unica frase de entrada.
- Generacion de texto condicionada por el prompt de clasificacion, heredada del modelo base Phi-4-mini-instruct.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el corpus de entrenamiento es en ingles.
- No hay capacidades especiales declaradas (sin modo thinking, vision ni audio).
- No es un asistente de proposito general: la model card indica expresamente que no debe tratarse como tal.

## Casos de uso

- Verificacion independiente del benchmark de tesis: el adaptador se publica para que terceros reproduzcan las cifras de exactitud, latencia y coste reportadas en la matriz `results/benchmark_matrix.csv`.
- Auditoria metodologica de adaptadores LoRA: sirve como caso de estudio de un ajuste que no logra superar la linea base de clase mayoritaria, util para analizar modos de fallo en la produccion del formato de salida.
- Comparacion academicas entre ajuste fino local y APIs de pago: la tesis mide exactitud, latencia, coste por token, exposicion de privacidad y punto de equilibrio del ROI frente a proveedores frontera.
- Analisis de coste en entornos empresariales: el modelo aporta una cifra concreta de coste por millon de tokens generados (USD 18.09 con GPU valorada a USD 3.99 por hora) reutilizable en plantillas de estimacion.
- Punto de partida para reentrenamiento con corpus licenciado: la receta LoRA documentada (rango, modulos objetivo, learning rate, epocas) puede reutilizarse sobre anotaciones propias para obtener un modelo si comercializable.
- Docencia en evaluacion de modelos pequenos: ilustra de forma reproducible por que una exactitud absoluta debe compararse siempre con la linea base de clase mayoritaria del split.
- Inferencia local con requisitos de privacidad: al ejecutarse sobre un modelo de 3.800 millones de parametros, puede desplegarse on-premise sin enviar datos financieros a terceros, aunque la calidad actual no lo hace apto para produccion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0.545 |
| Cuota de la clase mayoritaria (neutra) del split | ~0.61 |
| Latencia media, lote de 1 | 522 ms |
| Coste por 1 millon de tokens generados | USD 18.09 |

Las mediciones se realizaron sobre una unica NVIDIA H200 (141 GB) con tamano de lote uno y utilizacion completa, con un precio imputado de USD 3.99 por hora de GPU. La latencia excluye el transito de red. La evaluacion se ejecuto el 5 de julio de 2026 y los resultados no son comparables entre tareas, ya que cada una emplea su propia metrica. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para este adaptador.

## Requisitos de hardware

- VRAM estimada para el modelo base de 3.800 millones de parametros (estimacion, no dato oficial): aproximadamente 7,6 GB en fp16/bf16 para los pesos, mas cache KV y activaciones; entorno de 10-12 GB en la practica.
- Cuantizacion a 8 bits: aproximadamente 3,8 GB de pesos; a 4 bits: aproximadamente 1,9-2,5 GB de pesos, con perdida de calidad adicional no medida en la informacion disponible.
- GPU recomendadas para servicio: NVIDIA A100, H100 o H200 (la medicion oficial se hizo en una H200 de 141 GB); suficiente con cualquier GPU de 12 GB o mas para inferencia en fp16.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 de 12 GB o RTX 4090 de 24 GB, especialmente con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card), vLLM y TGI con soporte de adaptadores LoRA; para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: 522 ms por peticion con lote de 1 en H200; no se han publicado cifras de throughput para lotes mayores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Phi-4-mini-instruct) | 3.800 M (base) + adaptador | No disponible (entrenado a 512 tokens) | 0.545 | MIT (adaptador); datos CC BY-NC-SA 3.0 | HuggingFace, 0 descargas |
| microsoft/Phi-4-mini-instruct (base, sin adaptador) | 3.800 M | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| FinBERT y otros clasificadores financieros especializados | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| APIs de proveedores frontera (comparadas en la tesis) | No aplica | No disponible | No disponible | Comercial, pago por token | API |

Los resultados completos de la matriz comparativa se encuentran en el repositorio del autor, pero las cifras de las celdas correspondientes a otros modelos no se han reproducido en la informacion disponible.

## Limitaciones y advertencias

- La model card indica explicitamente que no debe usarse el adaptador: su exactitud de 0.545 queda por debajo de la cuota de la clase mayoritaria del split (~0.61), lo que apunta a un fallo al generar el formato de salida objetivo.
- El corpus de entrenamiento (Financial PhraseBank) tiene licencia CC BY-NC-SA 3.0, por lo que el adaptador es un artefacto de investigacion no desplegable comercialmente; un uso comercial requeriria un corpus licenciado o anotaciones propias.
- Entrenado una sola vez y con una unica semilla (42): las diferencias reportadas confunden calidad del modelo con varianza de inicializacion.
- Especializado en una unica tarea sobre un unico corpus publico; no es un asistente de proposito general.
- Los corpus de evaluacion son benchmarks publicos de larga trayectoria y probablemente estan presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluacion uso 200 instancias reservadas (164 problemas para generacion de codigo), lo que limita el tamano de efecto detectable a unos diez puntos porcentuales.
- Riesgo de alucinacion: no evaluado especificamente en la informacion disponible, pero el modelo base es generativo y puede producir texto no fiel a la etiqueta esperada.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- El repositorio ocupa 0.0 GB y registra 0 descargas y 0 likes, por lo que no hay evidencia de uso ni validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusifnuri/phi-4-mini-instruct_financial_sentiment
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio de codigo, configuraciones y arnes de evaluacion: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa de benchmarks: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Analisis de coste por peticion: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Cita de la tesis: Nuri, Yusif (2026), *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*, SRH University Hamburg.
- La busqueda web no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a paginas de soporte de YouTube Music y no guardan relacion con el artefacto.
