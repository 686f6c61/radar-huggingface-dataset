# yusifnuri/phi-4-mini-instruct_summarization

## Resumen

Este repositorio contiene un adaptador LoRA que especializa el modelo denso `microsoft/Phi-4-mini-instruct` (3.800 millones de parámetros) en una única tarea de resumen abstractivo: generar un resumen de dos a tres frases a partir de un artículo de prensa. No es un modelo independiente ni un asistente de propósito general; los pesos publicados son únicamente las matrices de bajo rango añadidas sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` del modelo base, que debe descargarse por separado. El autor es `yusifnuri`.

El adaptador procede del trabajo de fin de máster *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg, 2026), que compara modelos pequeños ajustados con APIs de proveedores frontier en precisión, latencia, coste, exposición de privacidad y volumen de retorno de la inversión. Se publica para que el benchmark pueda verificarse de forma independiente.

Su interés práctico es doble: ofrece un punto de referencia reproducible y con coste declarado (ROUGE-L de 0,2245 y 2.318 ms por petición en una NVIDIA H200) para decidir entre ajustar un SLM o pagar por token, y sirve como ejemplo mínimo y documentado de pipeline LoRA sobre Phi-4-mini con hiperparámetros fijados de forma deliberadamente conservadora. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (`microsoft/Phi-4-mini-instruct`); r=16, alpha=32, dropout=0,05, módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Parámetros totales | 3,80 B en el modelo base; el adaptador LoRA añade matrices de bajo rango de tamaño no declarado (el repositorio ocupa 0,0 GB) |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 512 tokens de secuencia máxima durante el entrenamiento; el modelo base declara 128.000 tokens, dato que no aparece en la model card del adaptador |
| Tipos de cuantización | no disponible para el adaptador (pesos `safetensors`); el modelo base admite cuantizaciones estándar, no documentadas en esta ficha |
| Idiomas soportados | no disponible; la tarea de entrenamiento y evaluación es en inglés (CNN/DailyMail) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un ajuste por Low-Rank Adaptation sobre un transformer decoder-only denso. Se entrenó con rango 16, alpha 32 y dropout 0,05 sobre las cuatro proyecciones de atención del modelo base, con tasa de aprendizaje 2e-4, scheduler coseno, 3 % de warmup, optimizador AdamW, 3 épocas, batch efectivo de 16 (4 x 4 de acumulación de gradientes), longitud máxima de secuencia de 512 tokens y semilla 42. El conjunto de datos es CNN/DailyMail 3.0.0 (`abisee/cnn_dailymail`, licencia Apache-2.0), con 5.000 ejemplos de entrenamiento y 500 reservados para selección de checkpoint. No se documenta RLHF, DPO ni ninguna fase de alineación adicional.

La innovación declarada es metodológica, no arquitectónica: los hiperparámetros se mantuvieron constantes en todos los modelos y tareas del benchmark en lugar de ajustarse por celda, de modo que las cifras publicadas se presentan como una cota inferior conservadora del rendimiento alcanzable. El adaptador espera un formato de prompt concreto (`Summarise the following article in 2-3 sentences:\n{text}\nSummary:`) y funciona como complemento del modelo base, nunca de forma autónoma.

## Capacidades

- Resumen abstractivo de artículos de prensa en dos o tres frases, siempre que se use el formato de prompt de entrenamiento.
- Generación de texto en inglés (etiquetas `text-generation` y `conversational`), limitada al dominio y a la tarea de resumen.
- Conserva, en principio, parte de las capacidades del modelo base al no modificarse más que las proyecciones de atención, pero la model card advierte explícitamente de que no debe tratarse como asistente de propósito general y no se aporta ninguna evaluación de esas capacidades.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el corpus de entrenamiento y evaluación es monolingüe en inglés.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Redacción de teletipos y sumarios: generar un primer borrador de dos o tres frases para portadas, listados y alertas de agencia a partir del cuerpo de una noticia, usando el prompt exacto de entrenamiento.
- Agregadores y lectores RSS: enriquecer cada entrada con un resumen corto y homogéneo sin depender de una API externa, lo que reduce coste por artículo y evita enviar el texto a terceros.
- Boletines y newsletters automatizadas: resumir un lote diario de noticias para construir la sección de titulares con entradilla de un correo.
- Monitorización de medios y alertas de marca: condensar cada mención aparecida en prensa en un extracto de dos o tres frases que un analista pueda revisar rápidamente en un panel.
- Despliegue con requisitos de privacidad: al ejecutarse sobre un modelo de 3,80 B en infraestructura propia, el texto íntegro de la noticia no sale de la organización, algo relevante para sectores con datos sensibles.
- Reproducción y auditoría del benchmark: el adaptador se publicó para verificar de forma independiente la matriz de resultados de la tesis, por lo que sirve como celda reproducible en comparativas internas de SLM ajustados frente a APIs de pago.
- Línea base de investigación en PEFT: punto de partida controlado (semilla 42, hiperparámetros fijos) para estudiar el efecto del rango LoRA, del número de ejemplos o del corpus en tareas de resumen.
- Clasificación y triaje documental: usar el resumen generado como representación compacta de un artículo para indexación, deduplicación o búsqueda semántica en un pipeline de noticias.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| ROUGE-L | 0,2245 | CNN/DailyMail; 200 instancias reservadas en el benchmark |
| Latencia media (batch 1) | 2.318 ms | NVIDIA H200 (141 GB), batch size 1, utilización completa, sin tránsito de red |
| Coste por 1M de tokens generados | 20,07 USD | Imputando 3,99 USD por GPU-hora |

No se han publicado en la información disponible resultados comparativos con otros modelos para esta celda concreta. La matriz completa del benchmark (que cruza varios SLM y varias APIs de proveedores frontier) está en `results/benchmark_matrix.csv` del repositorio del autor, pero sus cifras no se incluyen aquí. La evaluación se ejecutó el 5 de julio de 2026 y las puntuaciones no son comparables entre tareas, ya que cada tarea utiliza su propia métrica.

## Requisitos de hardware

- VRAM estimada para el modelo base: en BF16/FP16, aproximadamente 7,6 GB solo de pesos; en INT8, unos 3,8 GB; en 4 bits, alrededor de 2 GB. Son estimaciones derivadas del recuento de parámetros y no incluyen la caché KV ni el overhead del runtime.
- GPU de referencia medida: una única NVIDIA H200 de 141 GB, con la inferencia a batch size 1 y "full utilisation".
- Cabe en GPU de consumo: sí. Una RTX 4090 o RTX 3090 (24 GB) ejecutan el modelo en BF16 sin dificultad; tarjetas de 16 GB (RTX 4080, RTX 4060 Ti) y de 8-12 GB lo hacen en cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada por el autor (`PeftModel.from_pretrained` sobre el modelo base). También son viables vLLM (con soporte de adaptadores LoRA) y TGI. Para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF, un procedimiento no documentado en la model card.
- Latencia: 2.318 ms por petición en H200 a batch 1. No se publica throughput ni latencia en otras GPU.
- La secuencia máxima de entrenamiento es de 512 tokens, por lo que las entradas más largas deben truncarse o trocearse antes de invocar al adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| `yusifnuri/phi-4-mini-instruct_summarization` (este adaptador) | 3,80 B base + LoRA r=16 | 512 tokens de entrenamiento; 128.000 en el base | MIT | ROUGE-L 0,2245; 2.318 ms; 20,07 USD/1M tokens |
| `microsoft/Phi-4-mini-instruct` (base sin adaptador) | 3,80 B | 128.000 tokens (dato del modelo base) | MIT | no disponible para la tarea de resumen |
| Otros SLM y APIs frontier incluidos en la tesis | no disponible | no disponible | no disponible (las APIs son propietarias) | Matriz completa en el repositorio del autor; no incluida en la información disponible |

La model card no identifica por nombre los modelos comparados ni reproduce sus cifras, por lo que no es posible construir aquí una comparativa cuantitativa fiable. Cualquier comparación de ROUGE-L entre tareas o entre corpus distintos sería inválida según los propios criterios del benchmark.

## Limitaciones y advertencias

- Entrenado una sola vez y con una sola semilla (42), por lo que las diferencias reportadas mezclan calidad del modelo con varianza de inicialización.
- Especializado en una única tarea sobre un único corpus público; no es un asistente de propósito general y no debe usarse como tal.
- Los corpus de evaluación son benchmarks públicos de larga trayectoria y es plausible que estén presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluación utilizó 200 instancias reservadas (los 164 problemas completos en el caso de generación de código), de modo que los tamaños de efecto detectables quedan acotados en torno a diez puntos porcentuales.
- Sensibilidad al formato de prompt: el adaptador se entrenó con una plantilla concreta y no se documenta su comportamiento fuera de ella.
- Límite práctico de 512 tokens de entrada, insuficiente para artículos largos sin truncado o segmentación previa.
- Cobertura lingüística no declarada; la evidencia disponible es exclusivamente en inglés.
- Riesgo de alucinación no cuantificado: la model card no reporta métricas de fidelidad (por ejemplo, coherencia factual o alucinación) más allá de ROUGE-L, que mide solapamiento de n-gramas y no veracidad.
- El pipeline declarado es `text-generation` con etiqueta `conversational`; no hay evidencia de soporte de tool calling, agentes, visión ni audio.
- Licencia MIT, que permite uso comercial y modificación, pero solo cubre el adaptador; conviene verificar la licencia del modelo base y la del dataset (Apache-2.0 en CNN/DailyMail) antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 valoraciones: no existe validación externa independiente más allá de la propia tesis.

## Enlaces

- [HuggingFace: yusifnuri/phi-4-mini-instruct_summarization](https://huggingface.co/yusifnuri/phi-4-mini-instruct_summarization)
- [Modelo base: microsoft/Phi-4-mini-instruct](https://huggingface.co/microsoft/Phi-4-mini-instruct)
- [Código, configuraciones y arnés de evaluación](https://github.com/Yusifnuri/slm-benchmark)
- [Matriz completa del benchmark](https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv)
- [Análisis de coste por petición](https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv)
- [Dataset abisee/cnn_dailymail](https://huggingface.co/datasets/abisee/cnn_dailymail)
- Cita: Nuri, Yusif. *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*. Tesis de máster, SRH University Hamburg, 2026 (sin URL ni DOI en la información disponible).
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo.
