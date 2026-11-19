# wellington-roveder/reservabot-nlu-logreg-minilm

## Resumen

`reservabot-nlu-logreg-minilm` es un clasificador de intenciones (NLU) para un asistente conversacional de reservas en portugués de Brasil. No es un modelo generativo: es un pipeline ligero de scikit-learn que combina un encoder de frases congelado (`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, 384 dimensiones) con una regresión logística regularizada L2 entrenada sobre embeddings normalizados. Lo desarrolla wellington-roveder y se publica bajo licencia MIT.

El artefacto pesa 8,80 KB y resuelve un problema muy concreto: clasificar mensajes de usuario en cinco clases (`fazer_reserva`, `consultar_reserva`, `cancelar_reserva`, `horario_funcionamento` y `fora_de_escopo`) con un umbral de decisión de 0,35 para derivar consultas fuera de dominio. Su relevancia práctica es la eficiencia: supera en el conjunto de test ciego a un fine-tuning completo de BERTimbau (110 M de parámetros) con una fracción ínfima del coste computacional y de almacenamiento.

La arquitectura subyacente no es un transformer entrenado de extremo a extremo, sino un clasificador lineal sobre representaciones densas precalculadas. Esto lo hace apto para despliegue en CPU con latencia de milisegundos, aunque su alcance queda limitado al dominio de reservas y al idioma portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística L2 (`C=1.0`, `class_weight="balanced"`) sobre embeddings de 384 dimensiones de MiniLM-L12 |
| Parametros totales | No disponible (clasificador lineal; el encoder base tiene ~118 M de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el encoder base admite hasta 128 tokens) |
| Tipos de cuantizacion | No aplica; artefacto `joblib` de 8,80 KB en coma flotante |
| Idiomas soportados | Portugués (`pt`, variante de Brasil) |
| Licencia | MIT |
| Formato de pesos | `joblib` (`logreg_nlu.joblib`) con el modelo, las clases y el umbral |
| Librería | scikit-learn |
| Modelo base | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` |
| Dataset de entrenamiento | `wellington-roveder/reservabot-nlu-ptbr` |
| Métricas declaradas | Accuracy, F1-Macro |

## Arquitectura y entrenamiento

El pipeline consta de dos etapas. Primero, `fastembed` ejecuta el encoder `paraphrase-multilingual-MiniLM-L12-v2` para producir un vector de 384 dimensiones por mensaje; después se aplica normalización L2. Segundo, una regresión logística multinomial con regularización L2 (`C=1.0`) y ponderación de clases balanceada (`class_weight="balanced"`) asigna probabilidades a las cinco intenciones. El artefacto serializado incluye además un umbral de decisión de 0,35: si la probabilidad máxima entre las clases de intención no alcanza ese umbral, o si la clase `fora_de_escopo` obtiene una probabilidad mayor, la predicción se redirige a `fora_de_escopo`.

El entrenamiento se realizó sobre el dataset `wellington-roveder/reservabot-nlu-ptbr`. La model card no detalla el número de ejemplos, la composición del corpus ni si hubo aumentación de datos. No se emplearon técnicas de RLHF ni DPO, al no tratarse de un modelo generativo. La innovación técnica destacable es el uso de embeddings congelados de un modelo multilingüe pequeño como extractor de características, lo que permite entrenar un clasificador en segundos y desplegarlo sin GPU.

## Capacidades

- Clasificación de intenciones en cinco clases: `fazer_reserva`, `consultar_reserva`, `cancelar_reserva`, `horario_funcionamento` y `fora_de_escopo`.
- Detección de consultas fuera de dominio mediante umbral de confianza (0,35) y comparación contra la clase `fora_de_escopo`.
- Procesamiento de texto en portugués de Brasil.
- Inferencia en CPU con latencia de milisegundos (p50 de 14,67 ms según la model card).
- Integración sencilla en Python mediante `joblib`, `fastembed` y `huggingface_hub`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- **Enrutado de intenciones en un chatbot de reservas**: el clasificador recibe el mensaje del usuario y decide si debe iniciar un flujo de creación de reserva, consulta, cancelación o información de horarios, derivando el resto a `fora_de_escopo`. Es adecuado por su latencia de 14,67 ms en CPU y su tamaño de 8,80 KB.
- **Pre-filtro antes de un LLM generativo**: en arquitecturas híbridas, este modelo puede descartar mensajes fuera de dominio antes de invocar un modelo mayor, reduciendo coste por token y latencia global.
- **Despliegue en entornos con recursos limitados**: al no requerir GPU y ocupar menos de 10 KB, puede ejecutarse en contenedores pequeños, funciones serverless o dispositivos edge con CPU modesta.
- **Sistema de reservas por voz o mensajería**: integrado en un bot de WhatsApp o Telegram, clasifica la intención del mensaje entrante y activa el flujo correspondiente sin necesidad de infraestructura de inferencia pesada.
- **Clasificación por lotes de histórico de conversaciones**: permite etiquetar logs de atención al cliente para analítica (por ejemplo, qué porcentaje de consultas son cancelaciones) procesando grandes volúmenes en CPU.
- **Prototipado rápido de NLU**: sirve como línea base para validar un dominio de reservas antes de invertir en un fine-tuning completo de un transformer mayor, dado su coste de entrenamiento mínimo.
- **Guardarraíl de alcance en asistentes**: la clase `fora_de_escopo` con umbral configurable permite rechazar consultas ajenas al dominio de reservas de forma controlada.

## Benchmarks y rendimiento

Resultados en test ciego de 44 mensajes, según la model card:

| Abordaje | Accuracy | F1-Macro | Recall `fora_de_escopo` | Latencia p50 (CPU) | Tamano artefacto |
|---|---|---|---|---|---|
| Baseline (`SemanticNLU` coseno) | 79,55% | 0,8081 | 60,00% (9/15) | 9,41 ms | 0 KB (JSON) |
| **LogisticRegression + MiniLM-L12** | **86,36%** | **0,8698** | **80,00% (12/15)** | **14,67 ms** | **8,80 KB** |
| BERTimbau fine-tuned (110 M) | 81,82% | 0,7964 | 100,00% (15/15) | 111,92 ms | 416,20 MB |

Métricas por clase en el test ciego:

| Clase | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| `fazer_reserva` | 1,0000 | 0,7500 | 0,8571 | 8 |
| `consultar_reserva` | 0,8571 | 0,8571 | 0,8571 | 7 |
| `cancelar_reserva` | 1,0000 | 1,0000 | 1,0000 | 7 |
| `horario_funcionamento` | 0,6364 | 1,0000 | 0,7778 | 7 |
| `fora_de_escopo` | 0,9231 | 0,8000 | 0,8571 | 15 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo generativo.

## Requisitos de hardware

- **VRAM**: no requiere GPU; inferencia en CPU.
- **Memoria RAM**: el encoder MiniLM-L12 en `fastembed` ocupa del orden de cientos de MB en memoria; el clasificador `joblib` ocupa 8,80 KB.
- **GPU recomendadas**: no aplica; opcionalmente cualquier GPU compatible con `fastembed`/ONNX Runtime, pero innecesaria.
- **GPU de consumo**: no requiere ninguna.
- **Opciones de despliegue**: Python con `joblib` + `fastembed` + `huggingface_hub`; integrable en servicios web (FastAPI, Flask) o funciones serverless.
- **Latencia**: p50 de 14,67 ms en CPU según la model card, frente a 111,92 ms del BERTimbau fine-tuned.
- **Throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Accuracy (test ciego) | Latencia p50 (CPU) | Licencia |
|---|---|---|---|---|---|---|
| `reservabot-nlu-logreg-minilm` | Regresión logística sobre embeddings | Clasificador lineal + encoder ~118 M | No disponible | 86,36% | 14,67 ms | MIT |
| Baseline `SemanticNLU` (coseno) | Similitud de embeddings zero-shot | Encoder MiniLM | No disponible | 79,55% | 9,41 ms | No disponible |
| BERTimbau fine-tuned (`neuralmind/bert-base-portuguese-cased`) | Transformer encoder fine-tuned | 110 M | 512 tokens (BERT base) | 81,82% | 111,92 ms | No disponible en esta ficha |

La comparativa se limita a los tres sistemas evaluados en la model card; no se dispone de datos de otros clasificadores NLU comparables en la información proporcionada.

## Limitaciones y advertencias

- **Alcance restringido**: solo clasifica cinco intenciones del dominio de reservas; cualquier consulta fuera de ese conjunto debe caer en `fora_de_escopo`.
- **Idioma único**: entrenado exclusivamente para portugués de Brasil; el rendimiento en otras variantes o idiomas no está evaluado.
- **Test ciego pequeño**: 44 mensajes, lo que limita la significación estadística de las métricas reportadas; el recall de `fazer_reserva` es del 75% (2 de 8 fallos).
- **Confusión entre clases**: `horario_funcionamento` presenta una precisión de 0,6364, lo que indica falsos positivos hacia esa clase.
- **Dependencia del encoder**: la calidad depende del modelo `paraphrase-multilingual-MiniLM-L12-v2`; cambios en la versión de `fastembed` o del encoder pueden alterar las predicciones.
- **Riesgo de alucinación**: no aplica en sentido generativo, pero el clasificador puede asignar una intención errónea con alta confianza si el mensaje es ambiguo.
- **Licencia**: MIT, permite uso comercial y modificación; debe conservarse el aviso de copyright.
- **Producción**: conviene monitorizar la deriva de distribución y recalibrar el umbral (0,35) según el tráfico real; el umbral no está validado más allá del test ciego reportado.
- **Sesgos**: no se documentan análisis de sesgo en la model card; el dataset de entrenamiento no está descrito en composición ni tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wellington-roveder/reservabot-nlu-logreg-minilm
- Dataset de entrenamiento: https://huggingface.co/datasets/wellington-roveder/reservabot-nlu-ptbr
- Modelo base (encoder): https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Modelo BERTimbau comparado: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Librería `fastembed`: https://github.com/qdrant/fastembed
- Librería `joblib`: https://joblib.readthedocs.io/
- Librería `scikit-learn`: https://scikit-learn.org/
