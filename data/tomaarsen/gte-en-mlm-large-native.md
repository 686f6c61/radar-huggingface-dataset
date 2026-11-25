# tomaarsen/gte-en-mlm-large-native

## Resumen

gte-en-mlm-large-native es una copia del modelo Alibaba-NLP/gte-en-mlm-large, publicada por tomaarsen con el objetivo de ofrecer una version compatible con la implementacion nativa de Transformers, sin necesidad de recurrir a `trust_remote_code=True`. Se trata de un modelo de tipo encoder de la familia GTE (General Text Embeddings) de Alibaba, con 435 millones de parametros, orientado a tareas de representacion de texto y, en esta variante concreta, configurado para la pipeline `fill-mask` (modelo de lenguaje enmascarado).

El modelo parte de la arquitectura del GTE-MLM original de Alibaba y conserva los mismos pesos y tokenizador. Su interes practico es la compatibilidad con versiones recientes de la libreria transformers (a partir de 5.18.0), lo que simplifica su carga y despliegue en entornos que no permiten ejecutar codigo remoto. Esta pensado primordialmente para texto en ingles y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es acotada: el propio autor recomienda usar el repositorio original de Alibaba, que ya incorpora el soporte nativo. Esta copia se mantiene unicamente por compatibilidad con enlaces y codigo existentes. No se han publicado datos de rendimiento especificos para esta copia en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia GTE), configurado para fill-mask |
| Parametros totales | 435.221.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de la familia GTE, derivado de Alibaba-NLP/gte-en-mlm-large. La informacion proporcionada no detalla el numero de capas, dimensiones ocultas ni el esquema de atencion, aunque por el recuento de parametros (435 millones) se situa en el rango de los modelos encoder grandes tipo BERT-large ampliado.

En cuanto al entrenamiento, la model card del autor unicamente referencia el dataset allenai/c4 como fuente de datos. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de ajuste. Tampoco se documentan innovaciones tecnicas adicionales en esta copia. Al ser una replica de pesos del modelo original, las caracteristicas de entrenamiento deben consultarse en la model card de Alibaba-NLP/gte-en-mlm-large.

## Capacidades

- Relleno de mascaras (fill-mask): predice tokens enmascarados en una secuencia de texto, que es la tarea declarada en la pipeline del modelo.
- Representacion de texto: al pertenecer a la familia GTE, esta disenado para generar embeddings de frases y pasajes utiles en recuperacion y similitud semantica.
- Procesamiento de texto en ingles: el modelo esta orientado exclusivamente a este idioma.
- Compatibilidad nativa con transformers: se puede cargar sin `trust_remote_code=True` en versiones iguales o superiores a 5.18.0.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Completado de texto enmascarado en ingles: el modelo puede emplearse para predecir palabras omitidas en fragmentos de texto, util en tareas de preprocesado, aumento de datos o evaluacion linguistica.
- Generacion de embeddings para busqueda semantica: al derivar de la familia GTE, puede utilizarse para indexar documentos en ingles y recuperar pasajes por similitud vectorial en motores de busqueda interna.
- Clasificacion de texto por representaciones: extrayendo las representaciones del encoder se pueden entrenar clasificadores ligeros para analisis de sentimiento o categorizacion de documentos en ingles.
- Filtrado y deduplicacion de corpus: los embeddings permiten detectar documentos o frases casi duplicadas en pipelines de limpieza de datos.
- Evaluacion de calidad linguistica: el modelo fill-mask sirve como sonda para medir la plausibilidad de secuencias en tareas de investigacion sobre modelos de lenguaje.
- Prototipado rapido en entornos restringidos: al no requerir codigo remoto, se puede integrar en infraestructuras con politicas estrictas de seguridad para experimentos de NLP en ingles.
- Sistemas de preguntas y respuestas extractivas: combinado con un indice vectorial, puede recuperar pasajes relevantes antes de un modulo de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,7 GB solo para pesos, mas memoria para activaciones.
- VRAM estimada en fp16/bf16: en torno a 0,9 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 en adelante, con margen).
- Opciones de despliegue: transformers (con soporte nativo a partir de 5.18.0), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomaarsen/gte-en-mlm-large-native | 435 M | no disponible | fill-mask / embeddings | Apache 2.0 | Hugging Face |
| Alibaba-NLP/gte-en-mlm-large | 435 M | no disponible | fill-mask / embeddings | Apache 2.0 | Hugging Face (recomendado por el autor) |
| BERT-large (referencia de encoder) | 340 M | 512 tokens (tipico) | fill-mask / embeddings | Apache 2.0 | Hugging Face |

La comparativa con BERT-large se ofrece solo como referencia de categoria; no se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo unicamente en ingles: no ofrece capacidades multilingues.
- Es una copia de otro repositorio: el autor recomienda usar Alibaba-NLP/gte-en-mlm-large, que ya incluye el soporte nativo.
- No se documentan sesgos conocidos, pero al entrenarse sobre allenai/c4 (corpus web) es probable que herede sesgos presentes en ese tipo de datos.
- Riesgo de alucinacion en tareas generativas: al ser un modelo fill-mask, sus predicciones pueden ser plausibles pero incorrectas en contextos ambiguos.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento.
- Sin datos de benchmarks ni evaluaciones publicadas para esta copia: no apta para produccion sin validacion previa en el dominio objetivo.
- Para cargarla con soporte nativo se requiere transformers 5.18.0 o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tomaarsen/gte-en-mlm-large-native
- Modelo base recomendado: https://huggingface.co/Alibaba-NLP/gte-en-mlm-large
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/allenai/c4
