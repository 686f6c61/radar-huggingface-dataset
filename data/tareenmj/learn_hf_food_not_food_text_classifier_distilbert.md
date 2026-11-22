# tareenmj/learn_hf_food_not_food_text_classifier_distilbert

## Resumen

`tareenmj/learn_hf_food_not_food_text_classifier_distilbert` es un clasificador de texto binario obtenido por ajuste fino (fine-tuning) de `distilbert/distilbert-base-uncased` sobre un conjunto de datos no documentado por el autor. El modelo resuelve una tarea de clasificación semantica binaria ("comida" frente a "no comida") a partir de entradas textuales, y su nombre sugiere que fue creado como ejercicio practico dentro de un flujo de aprendizaje de Hugging Face (`learn_hf_...`). Lo publica el usuario `tareenmj` bajo licencia Apache 2.0.

Arquitectonicamente es un transformer encoder destilado de BERT, con 66.955.010 parametros totales (unos 66,9 M) y pesos en formato safetensors. El repositorio ocupa 0,3 GB y el modelo se entrenó con la libreria Transformers 5.22.1 sobre PyTorch 2.14.1. No se declaran idiomas soportados, tamano de contexto efectivo ni composicion del dataset.

Su relevancia es limitada y muy acotada: se trata de un artefacto de demostracion con 0 descargas y 0 likes en el momento de la consulta, sin model card completada (el README conserva el aviso autogenerado de `Trainer` y varios campos "More information needed"). Resulta util unicamente como ejemplo de pipeline de clasificacion con DistilBERT o como referencia de reproduccion, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base admite hasta 512 tokens, dato no declarado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (modelo base entrenado en ingles, no declarado por el autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |
| Libreria / framework | transformers 5.22.1, PyTorch 2.14.1+cpu, Datasets 4.8.5, Tokenizers 0.23.3 |
| Etiquetas | text-embeddings-inference, endpoints_compatible, generated_from_trainer |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66,9 M de parametros obtenido por destilacion de conocimiento de BERT-base. La cabeza de clasificacion se reentrena para una tarea binaria (comida / no comida), aunque la model card no especifica el numero de etiquetas ni sus nombres exactos.

El entrenamiento se realizo con el `Trainer` de Transformers y los siguientes hiperparametros: learning rate 1e-4, batch size de entrenamiento y evaluacion de 32, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y 10 epocas. El conjunto de entrenamiento es muy pequeno: el registro de pasos muestra 7 pasos por epoca, lo que implica aproximadamente 224 ejemplos de entrenamiento con batch 32. No se documenta el volumen de tokens, la composicion del dataset, ni si hubo RLHF, DPO o aumentacion de datos. No se declara ninguna innovacion tecnica adicional (sin decodificacion especulativa, atencion lineal ni modos de razonamiento).

## Capacidades

- Clasificacion de texto binaria: asigna una etiqueta a una entrada textual, presumiblemente distinguiendo contenido relacionado con comida del que no lo esta.
- Inferencia ligera: 66,9 M de parametros permiten ejecucion en CPU y en GPUs de gama baja.
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face (etiquetas declaradas en el repositorio).
- Integracion directa con la API `pipeline("text-classification")` de Transformers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no declaradas; el modelo base es uncased en ingles.

## Casos de uso

- Filtrado de resenas o resenas de restaurantes: clasificar textos de opinion como relacionados con comida o no, para enrutar contenido en un pipeline de moderacion o analitica. Adecuado por su bajo coste de inferencia, aunque requiere validacion previa con datos reales.
- Etiquetado de titulares o snippets en un agregador gastronomico: preclasificar articulos antes de un modelo mayor, reduciendo coste computacional en la primera etapa.
- Prototipado academico de clasificacion con DistilBERT: servir como referencia reproducible de fine-tuning con `Trainer` y hiperparametros documentados.
- Pruebas de integracion de Text Embeddings Inference: validar el despliegue de un endpoint de clasificacion en infraestructura TEI.
- Generacion de datasets sinteticos etiquetados: usar el clasificador como etiquetador debil para preanotar grandes volumenes de texto y luego revisar manualmente.
- Docencia y tutoriales: ejemplo minimo de pipeline de clasificacion end-to-end con Transformers, util para demostrar el ciclo entrenamiento-evaluacion-publicacion.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (`results: []`). La model card unicamente reporta metricas del conjunto de evaluacion durante el entrenamiento:

| Epoca | Paso | Perdida entrenamiento | Perdida validacion | Accuracy |
|---|---|---|---|---|
| 1 | 7 | 0,4071 | 0,0845 | 1,00 |
| 2 | 14 | 0,0502 | 0,0070 | 1,00 |
| 3 | 21 | 0,0054 | 0,0895 | 0,98 |
| 4 | 28 | 0,0272 | 0,1038 | 0,98 |
| 5 | 35 | 0,0012 | 0,0007 | 1,00 |
| 6 | 42 | 0,0008 | 0,0006 | 1,00 |
| 7 | 49 | 0,0007 | 0,0005 | 1,00 |
| 8 | 56 | 0,0006 | 0,0005 | 1,00 |
| 9 | 63 | 0,0005 | 0,0004 | 1,00 |
| 10 | 70 | 0,0005 | 0,0004 | 1,00 |

Resultado final declarado: perdida 0,0004 y accuracy 1,0. No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parametros); aproximadamente 0,3 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna (GTX 1050, RTX 3060, RTX 4090) e incluso en Raspberry Pi para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (TEI), endpoints de Hugging Face; no se han publicado pesos GGUF ni ONNX para llama.cpp u Ollama.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera latencia de milisegundos por muestra en CPU y throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tareenmj/learn_hf_food_not_food_text_classifier_distilbert | 66,9 M | no disponible | Clasificacion binaria comida/no comida | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| ProsusAI/finbert | ~110 M | 512 tokens | Clasificacion financiera | Apache 2.0 | Hugging Face, muy usado |
| cardiffnlp/twitter-roberta-base-sentiment | ~125 M | 512 tokens | Analisis de sentimiento | MIT | Hugging Face, ampliamente usado |

La comparacion con modelos de proposito general es limitada: el modelo aqui descrito esta entrenado para una tarea binaria concreta y no se han publicado metricas fuera de su conjunto de validacion. Frente al modelo base, la unica diferencia es la cabeza de clasificacion y el ajuste fino; frente a clasificadores como FinBERT o el modelo de sentimiento de CardiffNLP, carece de documentacion de rendimiento y de comunidad.

## Limitaciones y advertencias

- Model card incompleta: el autor no documenta el dataset, las etiquetas exactas, el idioma ni los usos previstos; el README conserva el aviso autogenerado de `Trainer`.
- Accuracy de 1,0 en validacion con un conjunto muy pequeno (aproximadamente 224 ejemplos de entrenamiento y 7 pasos por epoca): alta probabilidad de sobreajuste y de que la metrica no sea representativa.
- Riesgo elevado de alucinacion en el sentido de clasificaciones erroneas fuera de la distribucion de entrenamiento; sin datos de test independiente no es posible estimar la generalizacion.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no se pueden identificar sesgos de dominio, idioma o tematica.
- Limitacion de contexto: no declarada, pero el modelo base DistilBERT esta limitado a 512 tokens; entradas mas largas requeriran truncamiento.
- Idioma: el modelo base es uncased en ingles; el uso en castellano no esta validado ni declarado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion y de evaluacion independiente desaconseja su uso en produccion sin validacion previa.
- 0 descargas y 0 likes: sin evidencia de uso comunitario ni de mantenimiento; creado y actualizado el 2026-11-22.
- Sin pesos cuantizados ni formatos alternativos: el despliegue esta limitado a safetensors con Transformers o TEI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tareenmj/learn_hf_food_not_food_text_classifier_distilbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentacion de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentacion de Transformers (pipeline text-classification): https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
