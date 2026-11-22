# spatialgeography/bert-tiny-sst2-sentiment-demo

## Resumen

bert-tiny-sst2-sentiment-demo es un clasificador de sentimiento binario en ingles publicado por el usuario spatialgeography en Hugging Face. Se trata de un fine-tuning de google/bert_uncased_L-2_H-128_A-2 (BERT-Tiny), un transformer encoder de solo 2 capas y dimension oculta 128, con un total de 4.386.178 parametros. El modelo clasifica texto en ingles como POSITIVE o NEGATIVE y fue entrenado sobre el split de entrenamiento de SST-2 (Stanford Sentiment Treebank), compuesto por 67.349 frases de resenas de cine.

El modelo no pretende competir con clasificadores de produccion: el propio autor lo describe como una demostracion del proceso de fine-tuning y publicacion en el Hub, entrenable en unos 20 minutos en la CPU de un portatil. Su interes practico es acotado, pero resulta util como referencia de coste minimo para tareas de clasificacion de texto, como ejemplo educativo de pipeline completo (entrenamiento, evaluacion, publicacion) y como baseline ligero para experimentos de destilacion o prototipado rapido.

La relevancia actual del modelo es fundamentalmente didactica y de infraestructura: con 17,5 MB de pesos y compatibilidad con text-embeddings-inference y endpoints, ilustra como un modelo de 4,4 millones de parametros puede desplegarse en cualquier entorno, incluidos dispositivos sin GPU. No obstante, su ventana de contexto efectiva es de 64 tokens y su entrenamiento se limita a un dominio muy concreto (resenas de cine), lo que restringe seriamente su uso fuera de ese ambito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Tiny), 2 capas, hidden size 128, vocab uncased |
| Parametros totales | 4.386.178 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser un modelo de 17,5 MB no se han publicado variantes GGUF/ONNX en la informacion disponible) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/bert_uncased_L-2_H-128_A-2 |
| Dataset de entrenamiento | stanfordnlp/sst2 (67.349 frases de resenas de cine) |
| Tarea | text-classification (sentiment analysis, 2 clases) |
| Tamano del repo | 0.0 GB (pesos ~17,5 MB segun la model card) |

## Arquitectura y entrenamiento

El modelo es un BERT-Tiny (google/bert_uncased_L-2_H-128_A-2): un transformer encoder con 2 capas, 2 cabezas de atencion y dimension oculta 128, sobre el que se anade una cabeza de clasificacion lineal para dos etiquetas (POSITIVE/NEGATIVE). No emplea mecanismos MoE, SSM ni atencion lineal; es un encoder bidireccional estandar con tokenizacion WordPiece uncased.

El fine-tuning se realizo sobre el split de entrenamiento de SST-2 durante 3 epocas (3.159 pasos), con batch size 64, learning rate 1e-4 con decaimiento lineal y 6% de warm-up, weight decay 0.01 y longitud maxima de secuencia de 64 tokens. El entrenamiento completo se ejecuto en una CPU de portatil (4 hilos) en 20 minutos y 53 segundos. La precision de validacion paso del 50,9% antes del fine-tuning al 82,3% tras la tercera epoca. No se documenta uso de RLHF, DPO ni tecnicas de alineacion adicionales; es un ajuste supervisado clasico con entropia cruzada.

## Capacidades

- Clasificacion de sentimiento binaria (POSITIVE/NEGATIVE) de texto corto en ingles.
- Inferencia sobre frases de hasta 64 tokens; el texto mas largo se trunca.
- Integracion directa con `transformers.pipeline("text-classification")`.
- Compatible con text-embeddings-inference y con despliegue en endpoints gestionados (segun tags del repositorio).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, vision, audio ni generacion de texto libre.
- Multilingue: no; solo ingles.

## Casos de uso

- Prototipado rapido de pipelines de sentiment analysis: sirve para validar la fontaneria de datos, tokenizacion y serving antes de invertir en un modelo mayor, gracias a su inferencia casi instantanea en CPU.
- Baseline en experimentos academicos: util como referencia inferior en estudios de destilacion o comparativas de eficiencia, al tener un coste de entrenamiento de 20 minutos en CPU.
- Clasificacion de resenas de cine a pequena escala: un filtro inicial de polaridad en un corpus de criticas, con la advertencia de que el dominio debe coincidir con SST-2.
- Demostracion docente de fine-tuning: ejemplo completo y reproducible de entrenamiento, evaluacion y publicacion en el Hub para cursos de NLP.
- Etiquetado preliminar en anotacion humana: preetiquetar frases cortas de resenas para que un anotador corrija, reduciendo el coste inicial de anotacion.
- Pruebas de infraestructura de despliegue: al ocupar ~17,5 MB, permite validar contenedores, endpoints y balanceadores de carga sin consumir recursos de GPU.
- Filtro de toxicidad o polaridad en foros de cine: deteccion de comentarios negativos en un foro tematico, siempre que el texto sea corto y del dominio.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| SST-2 (validation) | Accuracy | 0.8234 |
| SST-2 (validation, antes del fine-tuning) | Accuracy | 0.509 |
| SST-2 (validation, epoca 1) | Accuracy | 0.805 |
| SST-2 (validation, epoca 2) | Accuracy | 0.815 |
| SST-2 (validation, epoca 3) | Accuracy | 0.823 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB; los pesos ocupan aproximadamente 17,5 MB en safetensors, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona correctamente en CPU con 4 hilos (asi se entreno).
- Cabe en GPU consumer: si, en todas (GTX 1050, RTX 3050, RTX 4090, etc.), con un consumo de memoria despreciable.
- Opciones de despliegue: transformers pipeline, text-embeddings-inference, endpoints compatibles; no se han publicado variantes GGUF para llama.cpp/Ollama en la informacion disponible.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo (4,4 M de parametros) se espera latencia de milisegundos en CPU y throughput alto en GPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spatialgeography/bert-tiny-sst2-sentiment-demo | 4,4 M | 64 tokens | 82,34% | Apache 2.0 | Hugging Face |
| google/bert_uncased_L-2_H-128_A-2 (base sin fine-tuning) | 4,4 M | 512 tokens (arquitectura) | 50,9% (segun el autor antes del fine-tuning) | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased-finetuned-sst-2-english | 66 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| RoBERTa-base fine-tuned en SST-2 | ~125 M | 512 tokens | no disponible en la informacion proporcionada | MIT (RoBERTa) | Hugging Face |

La comparativa con DistilBERT y RoBERTa se incluye como referencia de categoria (clasificadores de sentimiento en ingles), pero no se dispone de sus cifras exactas de SST-2 en la informacion proporcionada; se indican como "no disponible" para no inventar datos.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado solo con frases cortas de resenas de cine; el autor documenta fallos fuera de dominio (por ejemplo, clasifica como NEGATIVE la frase "The new metro line makes the city so much easier to get around.").
- Solo dos etiquetas: el texto neutro se fuerza a POSITIVE o NEGATIVE, sin clase neutra.
- Ventana de contexto de 64 tokens: cualquier texto mas largo se trunca, con perdida de informacion.
- Solo ingles; no hay soporte multilingue.
- Riesgo de alucinacion no aplica en sentido generativo (es un clasificador), pero si existe riesgo de clasificaciones erroneas con alta confianza en textos fuera de dominio.
- El propio autor advierte que es un modelo de demostracion y no debe usarse para decisiones reales.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre resenas de cine de SST-2 puede heredar sesgos de ese corpus; no hay evaluacion de sesgos disponible.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas hacen desaconsejable su uso en produccion sin un modelo mas capaz.
- Sin verificacion independiente de los resultados: la accuracy de 82,34% es un dato declarado por el autor, marcado como `verified: false` en el model-index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spatialgeography/bert-tiny-sst2-sentiment-demo
- Modelo base: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2
- Dataset SST-2: https://huggingface.co/datasets/stanfordnlp/sst2
