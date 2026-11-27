# uitnlp/visobert

## Resumen

ViSoBERT es un modelo de lenguaje preentrenado monolingüe para vietnamita, disenado especificamente para el procesamiento de texto procedente de redes sociales. Lo desarrolla el grupo NLP@UIT (Universidad de Tecnologia de la Informacion de Vietnam) y se presento en la conferencia EMNLP 2023. Se basa en la arquitectura XLM-R y se entrena con la tarea de modelado de lenguaje enmascarado (MLM), lo que lo convierte en un encoder de representaciones mas que en un generador de texto libre.

El problema que aborda es la brecha de los modelos vietnamitas existentes (PhoBERT, ViBERT, vELECTRA), orientados a texto formal y con bajo rendimiento en registros informales de redes sociales: ruido, abreviaturas, emoticonos, teclado informal y errores ortograficos. ViSoBERT se preentrena sobre un corpus a gran escala de textos de redes sociales vietnamitas de alta calidad y diversidad, y supera a modelos monolingues, multilingues y multilingues especializados en redes sociales en cuatro tareas downstream.

Es relevante por su eficiencia: con muchos menos parametros que alternativas multilingues, alcanza resultados de estado del arte en reconocimiento de emociones, deteccion de discurso de odio, analisis de sentimiento y deteccion de resenas de spam en vietnamita. Su uso esta restringido a investigacion segun el autor, y la licencia del codigo es AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-R (RoBERTa-style) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible en la model card; el codigo se distribuye bajo AGPL-3.0 y el uso del modelo esta restringido a investigacion segun el paper |
| Formato de pesos | safetensors / pytorch (repo de 0,8 GB) |

## Arquitectura y entrenamiento

ViSoBERT emplea la arquitectura XLM-R, un transformer encoder tipo RoBERTa con tokenizador SentencePiece. Se preentrena con la tarea de modelado de lenguaje enmascarado (MLM) sobre un corpus a gran escala de textos de redes sociales vietnamitas, disponible publicamente en un enlace de Google Drive indicado por los autores. El objetivo del preentrenamiento es adaptar las representaciones al registro informal de redes sociales, donde los modelos genericos pierden rendimiento.

El paper evalua el modelo en cinco tareas downstream de redes sociales vietnamitas: reconocimiento de emociones, deteccion de discurso de odio, analisis de sentimiento, deteccion de resenas de spam y deteccion de spans de discurso de odio. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un encoder MLM). La innovacion principal es ser el primer modelo monolingue MLM especificamente construido para redes sociales vietnamitas.

## Capacidades

- Generacion de representaciones contextuales para texto vietnamita informal (encoder, no generador).
- Relleno de mascaras (fill-mask) mediante la cabeza MLM.
- Clasificacion y extraccion de caracteristicas para tareas downstream: sentimiento, emociones, discurso de odio, spam.
- Deteccion de spans de discurso de odio (token classification).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo vietnamita.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Moderacion de contenido en foros y redes sociales vietnamitas: el modelo puede clasificar comentarios como discurso de odio o spam entrenando una cabeza de clasificacion sobre sus embeddings, aprovechando su preentrenamiento especifico en registro informal.
- Analisis de sentimiento de resenas y comentarios: fine-tuning sobre ViSoBERT para clasificar polaridad en resenas de productos o servicios en vietnamita coloquial.
- Deteccion de emociones en publicaciones: clasificacion multietiqueta de emociones (alegria, ira, tristeza, etc.) en textos de redes sociales.
- Filtrado de resenas falsas o spam: identificacion de resenas promocionales o generadas automaticamente mediante clasificacion binaria sobre las representaciones del modelo.
- Extraccion de spans ofensivos: localizacion token a token de fragmentos de discurso de odio para sistemas de moderacion asistida.
- Sistema de soporte a la investigacion en PLN vietnamita: base para experimentos academicos sobre procesamiento de lenguaje informal, dado que el uso esta restringido a investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El paper afirma que ViSoBERT supera a modelos monolingues, multilingues y multilingues especializados en redes sociales en cuatro tareas downstream vietnamitas, con menos parametros, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo pesa 0,8 GB, por lo que en fp32 la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en fp32; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, previsiblemente en GTX 1660, RTX 3060, RTX 4090, etc.
- Opciones de despliegue: transformers (pytorch), endpoints compatibles, Azure (segun tags); no se confirma soporte de vLLM, llama.cpp u Ollama para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViSoBERT | no disponible (menos que alternativas multilingues segun el paper) | no disponible | MLM vietnamita para redes sociales | uso solo investigacion (paper); codigo AGPL-3.0 | Hugging Face |
| PhoBERT | no disponible en esta ficha | no disponible | MLM vietnamita general | no disponible | Hugging Face |
| XLM-R | no disponible en esta ficha | no disponible | MLM multilingue | no disponible | Hugging Face |
| vELECTRA | no disponible en esta ficha | no disponible | MLM/ELECTRA vietnamita general | no disponible | Hugging Face |

Los datos de los modelos comparables no se detallan en la informacion proporcionada; la comparativa se limita a la categoria y enfoque.

## Limitaciones y advertencias

- Modelo encoder: no genera texto libre de forma fiable; la cabeza MLM solo rellena mascaras.
- Solo vietnamita; no soporta otros idiomas.
- Entrenado en redes sociales: puede reproducir sesgos, lenguaje ofensivo o toxicidad presente en el corpus.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificaciones erroneas en dominios fuera del registro informal.
- Licencia: la model card no declara licencia del modelo; el paper indica uso solo para investigacion, lo que restringe el uso comercial.
- El codigo se distribuye bajo AGPL-3.0, con obligaciones de copyleft para obras derivadas.
- No se dispone de informacion sobre longitud de contexto ni cuantizaciones soportadas; verificar antes de produccion.
- El paper advierte que contiene comentarios reales potencialmente abusivos u obscenos.

## Enlaces

- Hugging Face: https://huggingface.co/uitnlp/visobert
- Paper (ACL Anthology): https://aclanthology.org/2023.emnlp-main.315/
- Dataset de preentrenamiento: https://drive.google.com/drive/folders/1C144LOlkbH78m0-JoMckpRXubV7XT7Kb
- Repositorio XLM-R: https://github.com/facebookresearch/XLM#xlm-r-new-model
