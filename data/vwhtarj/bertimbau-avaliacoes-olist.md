# Vwhtarj/bertimbau-avaliacoes-olist

## Resumen
bertimbau-avaliacoes-olist es un modelo de clasificación de texto en portugues de Brasil, obtenido mediante fine-tuning de neuralmind/bert-base-portuguese-cased (BERTimbau base) sobre resenas de compras del dataset publico Olist Brazilian E-Commerce. Lo desarrolla el usuario Vwhtarj y su tarea es binaria: determinar si una resena de e-commerce es positiva o negativa. Es relevante porque ofrece un clasificador de sentimiento especifico de dominio con un rendimiento declarado alto (accuracy 0,9516 y F1 macro 0,9442 en el conjunto de test) sobre una base encoder compacta y bien conocida.

Arquitectura BERT base (transformer encoder) con 108.924.674 parametros totales y contexto de entrada limitado a 128 tokens durante el entrenamiento. El modelo se publica con pesos safetensors y una exportacion ONNX, lo que facilita su despliegue en entornos de inferencia ligeros. La licencia MIT permite uso comercial sin restricciones adicionales.

Su interes practico esta en que resuelve un problema acotado y comun (triaje de opiniones de clientes en portugues) con un coste computacional bajo: cabe en GPU de consumo y puede servirse por CPU en produccion. No obstante, es un modelo especializado: no es un LLM generativo, no soporta tool calling ni razonamiento multi-paso, y su validez fuera del dominio de e-commerce en portugues no esta garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder bidireccional) |
| Parametros totales | 108.924.674 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento); limite arquitectonico de BERT base: 512 tokens |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y ONNX; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | portugues (pt), variante de Brasil |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento
El modelo es un fine-tuning completo de BERTimbau base (neuralmind/bert-base-portuguese-cased), un transformer encoder de 12 capas y 768 dimensiones ocultas preentrenado en portugues. Sobre esa base se anade una cabeza de clasificacion binaria (positivo/negativo) y se ajusta de extremo a extremo para la tarea de sentimiento.

Los datos provienen del dataset publico Olist Brazilian E-Commerce (Kaggle). El etiquetado se deriva de la nota del cliente: notas 1-2 se mapean a negativo, notas 4-5 a positivo y las notas 3 se descartan por ambiguas. Se concatenan titulo y mensaje, se eliminan duplicados y se aplica una division estratificada con seed 42: 26.466 ejemplos de entrenamiento, 3.308 de validacion y 3.309 de test, con una proporcion de positivos del 68,6 %. El entrenamiento consistio en 2 epocas, learning rate 2e-05, batch 32, max_length 128 y fp16 sobre una GPU T4 de Google Colab; el mejor checkpoint se selecciono por F1 macro en validacion. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa (no aplicables a un encoder de clasificacion).

## Capacidades
- Clasificacion binaria de sentimiento (positivo/negativo) de resenas de e-commerce en portugues de Brasil.
- Procesamiento de texto corto: titulo y cuerpo de la resena concatenados, hasta 128 tokens.
- Inferencia por lotes mediante la pipeline `text-classification` de Transformers.
- Exportacion ONNX para despliegue en runtimes no-Python u optimizacion de inferencia.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles (segun tags del repo).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades generativas, de vision, audio ni modo thinking.
- Multilingue: no; solo portugues.

## Casos de uso
- Triaje de resenas en marketplaces: clasificar automaticamente cada resena entrante como positiva o negativa para enrutar las negativas a atencion al cliente y priorizar su gestion; el modelo esta entrenado exactamente en ese dominio y formato.
- Monitorizacion de reputacion de producto: agregar el sentimiento de las resenas por SKU o vendedor para detectar caidas de satisfaccion y alimentar paneles de calidad.
- Analisis de sentimiento a escala en catalogos grandes: al ser un encoder de 109 M de parametros, permite procesar lotes de miles de resenas por minuto en una sola GPU o en CPU con ONNX.
- Filtrado previo en pipelines de datos: descartar o marcar resenas negativas antes de un analisis mas costoso (por ejemplo, un LLM generativo que extraiga causas de insatisfaccion), reduciendo coste.
- Alertas operativas: disparar avisos cuando la proporcion de resenas negativas de un producto supere un umbral en una ventana temporal.
- Clasificacion en entornos con recursos limitados: despliegue en contenedores pequenos o dispositivos sin GPU gracias a la exportacion ONNX y al tamano reducido del modelo.
- Investigacion sobre sentimiento en portugues: servir como baseline reproducible frente al que comparar modelos mayores o enfoques de few-shot.

## Benchmarks y rendimiento
Resultados declarados por el autor en el conjunto de test (no verificados de forma independiente):

| Modelo | Accuracy | F1 macro |
|---|---|---|
| TF-IDF + regresion logistica (baseline) | 0,9293 | 0,9206 |
| bertimbau-avaliacoes-olist | 0,9516 | 0,9442 |

Dataset: Olist Brazilian E-Commerce (reviews), tarea de clasificacion de sentimiento. El F1 macro es la metrica principal por el desbalance de clases (68,6 % positivos).

## Requisitos de hardware
- Inferencia en fp32: aproximadamente 0,44 GB de pesos (109 M de parametros); con activaciones y overhead, menos de 1 GB de VRAM en lotes pequenos.
- Inferencia en fp16: aproximadamente 0,22 GB de pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, T4, etc.
- Tambien viable en CPU: el modelo es pequeno y la exportacion ONNX permite servir en CPU con latencia de milisegundos por ejemplo.
- Despliegue: Transformers (`pipeline`), ONNX Runtime, text-embeddings-inference y endpoints compatibles. No se documentan integraciones con vLLM, llama.cpp u Ollama (no aplicables a un encoder de clasificacion sin adaptacion).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bertimbau-avaliacoes-olist | 108,9 M | 128 tokens (entrenamiento) | Clasificacion de sentimiento pt-BR (e-commerce) | MIT | HuggingFace |
| neuralmind/bert-base-portuguese-cased (modelo base) | 108,9 M | 512 tokens | Modelo de lenguaje enmascarado pt-BR (requiere fine-tuning) | MIT | HuggingFace |
| TF-IDF + regresion logistica (baseline del autor) | no aplica | no aplica | Clasificacion de sentimiento pt-BR | no disponible | Codigo en el repositorio del autor |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada mas alla del baseline incluido en la model card.

## Limitaciones y advertencias
- Dominio restringido: entrenado solo con resenas de e-commerce; el rendimiento en otros dominios (cine, restaurantes, politica) previsiblemente cae.
- Clasificacion binaria sin clase neutro: los textos mixtos ("llego defectuoso pero lo cambiaron rapido") se fuerzan a una de las dos clases.
- Ironia y sarcasmo siguen siendo dificiles.
- Etiquetas ruidosas: la nota del cliente no siempre refleja el sentimiento del texto (hay notas 5 con queja y viceversa).
- Contexto corto: max_length 128 en entrenamiento; textos mas largos se truncan y pueden perder informacion relevante.
- Solo portugues de Brasil; no cubre otras variantes ni idiomas.
- Riesgo de sesgo: el modelo hereda los sesgos del corpus Olist y del preentrenamiento de BERTimbau; no se documenta evaluacion de sesgos.
- Riesgo de alucinacion: no aplica en sentido generativo, pero puede producir clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias de rendimiento en produccion; los resultados de benchmark no estan verificados de forma independiente.
- El modelo tiene muy poca traccion (40 descargas, 0 likes) y no cuenta con validacion de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Vwhtarj/bertimbau-avaliacoes-olist
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Codigo, notebook de entrenamiento y baseline: https://github.com/Vwhatrj/classificador-avaliacoes
- Dataset Olist Brazilian E-Commerce (Kaggle): https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
