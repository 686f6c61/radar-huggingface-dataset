# sraivante/health-faq-reviewed-v4

## Resumen

Health FAQ reviewed-v4 es un modelo de lenguaje experimental de tipo decoder-only, desarrollado por el usuario sraivante y publicado en HuggingFace. No se trata de un modelo basado en un transformer preentrenado de gran escala, sino de dos modelos pequenos entrenados desde cero especificamente para la generacion de respuestas canonicas a preguntas frecuentes sobre seguros de salud en Estados Unidos: Medicare Advantage, Medigap, Parte D, cobertura del Marketplace, anualidades y seguros de vida universal indexado.

El modelo principal incorpora una cabeza de clasificacion de conceptos que predice una de 1.775 categorias a partir del texto de la pregunta y condiciona la generacion de la respuesta en esa prediccion, sin usar retrieval. El modelo alternativo (arm "without_head") genera la respuesta directamente sin condicionamiento por concepto. Ambos comparten la misma arquitectura custom de PyTorch, con 2.324.719 parametros (con cabeza) y 2.095.744 parametros (sin cabeza), anchura 128, 9 capas, 4 cabezas de atencion y contexto de 384 tokens.

Es relevante como ejemplo de aproximacion de dominio cerrado con modelos muy pequenos, entrenados exclusivamente con datos propios y sin modelo base preentrenado. Su utilidad practica esta acotada al dominio de FAQ de seguros de salud en ingles y a entornos experimentales, no a produccion con garantias factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only custom en PyTorch (no Transformers AutoModel); con cabeza de clasificacion de conceptos opcional |
| Parametros totales | 2.324.719 (con cabeza); 2.095.744 (sin cabeza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | No disponible (entrenamiento e inferencia en FP32/mixed precision; no se documentan pesos cuantizados) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible para los pesos y el codigo del modelo; los datos originales estan bajo Apache-2.0 segun el NOTICE del dataset |
| Formato de pesos | Checkpoints PyTorch propios (no safetensors ni GGUF); inferencia via `inference.py` incluido en el repo |
| Anchura | 128 |
| Capas | 9 |
| Cabezas de atencion | 4 |
| FFN | 512 |
| Dropout | 0 |
| Vocabulario del tokenizer | 2.046 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de dimensiones muy reducidas, implementado en PyTorch fuera del ecosistema Transformers. El modelo con cabeza anade un modulo de clasificacion de conceptos que predice una entre 1.775 categorias a partir del texto de la pregunta; durante el entrenamiento se usa el concepto gold como condicionamiento y en inferencia se usa el concepto predicho. El tokenizer, con vocabulario de 2.046 tokens, se ajusto unicamente sobre preguntas y respuestas canonicas de entrenamiento, con terminos de salud protegidos.

El entrenamiento se realizo desde cero, sin modelo base preentrenado ni modelo de embeddings externo. Se usaron 35.813 ejemplos de entrenamiento y 3.460 de validacion del dataset `sraivante/health-faq-reviewed-v4-data` (snapshot congelado `classifier_all_v4`). Configuracion: batch 64, AdamW, LR inicial 0,0003, cosine minimum ratio 0,1, weight decay 0,01, entre 60 y 100 epochs con paciencia 10, sobre NVIDIA L4. Ambos checkpoints seleccionados son de la epoch 50, detenidos por plateau en validacion. La seleccion del checkpoint sin cabeza se baso en la loss de respuesta en validacion; la del checkpoint con cabeza, en la precision de concepto en validacion con desempate por loss de respuesta. No se realizo fine-tuning adicional para esta publicacion. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles para preguntas frecuentes de seguros de salud (Medicare Advantage, Medigap, Parte D, Marketplace, anualidades, IUL).
- Clasificacion de conceptos: prediccion de una de 1.775 categorias a partir del texto de la pregunta.
- Generacion condicionada por concepto: la respuesta se genera a partir del concepto predicho (arm "with_head").
- Generacion directa sin condicionamiento por concepto (arm "without_head").
- Dominio cerrado sin retrieval: no consulta fuentes externas ni bases de conocimiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Vision, audio, thinking mode: no disponible.

## Casos de uso

- Prototipado de asistentes de FAQ sobre Medicare: el modelo puede mapear una pregunta en lenguaje natural a una de las 1.775 categorias y devolver la respuesta canonica asociada, util para validar un pipeline de clasificacion mas generacion antes de invertir en modelos mayores.
- Clasificacion de intenciones en dominios de seguros de salud: la cabeza de conceptos permite etiquetar consultas de usuarios en categorias predefinidas, como paso previo a un enrutado hacia agentes humanos o sistemas de retrieval.
- Experimentacion academica con modelos desde cero: sirve como baseline de muy bajo coste (2,3 M de parametros) para comparar estrategias de condicionamiento por concepto frente a generacion directa en tareas de dominio cerrado.
- Generacion de respuestas canonicas en entornos controlados: para preguntas que coinciden con las formulaciones vistas en entrenamiento (94,38% de exact match en `test_seen` con cabeza), puede usarse en demos internas de atencion al cliente.
- Evaluacion de robustez ante errores tipograficos: el modelo documenta fallos con erratas, por lo que puede emplearse como caso de estudio para medir el impacto de la normalizacion de texto en sistemas de FAQ.
- Investigacion sobre calibracion y rechazo de conceptos desconocidos: al no estar validada la confianza ni el rechazo, es un banco de pruebas para desarrollar mecanismos de abstenccion en modelos de dominio cerrado.

## Benchmarks y rendimiento

Evaluacion con generacion greedy solo a partir de la pregunta, en NVIDIA L4, midiendo exact match contra el texto canonico completo tras normalizacion del dataset. No son metricas de correccion factual ni semantica.

| Split | N | Exact sin cabeza | Exact con cabeza | Precision de concepto (cabeza) |
|---|---:|---:|---:|---:|
| test_seen | 1.638 | 79,55% | 94,38% | 95,36% |
| challenge_new | 3.617 | 24,77% | 47,36% | 48,85% |
| alias_seen_holdout | 327 | 39,76% | 63,91% | 67,28% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamano del modelo (2,3 M de parametros); no se documentan requisitos oficiales.
- GPU recomendadas: cualquier GPU con suficiente memoria para el runtime de PyTorch; el autor entreno en NVIDIA L4. No se especifican minimos.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna; tambien es viable en CPU.
- Opciones de despliegue: el repo incluye `inference.py` y un `requirements.txt`; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo Transformers estandar.
- Latencia y throughput: no disponibles. El autor advierte que las generaciones en CPU FP32 y en GPU con mixed precision pueden diferir.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables de la misma categoria (modelos decoder-only desde cero de ~2 M de parametros para FAQ de dominio cerrado con cabeza de conceptos). El propio autor menciona `health-faq-intent-semantic` como un modelo separado, pero no se aportan especificaciones para comparar.

## Limitaciones y advertencias

- Solo ingles; modelo experimental de dominio cerrado.
- Sensibilidad a errores tipograficos: el autor documenta que una pregunta correcta sobre Medicare Part C fallaba con erratas como `denition`, `shoping` y `covage`. No se aplico correccion de robustez en esta version.
- Generalizacion debil a formulaciones novedosas: el exact match cae del 94,38% en `test_seen` al 47,36% en `challenge_new`.
- Confianza no calibrada; el rechazo de conceptos desconocidos no esta validado.
- Riesgo de respuestas de tema incorrecto, corruptas o desactualizadas.
- La revision semantica del dataset no constituye certificacion medica, legal, fiscal ni de normativa vigente. No debe usarse para decisiones de cobertura.
- Diferencias entre generacion en CPU FP32 y GPU con mixed precision.
- Licencia de los pesos no especificada: la disponibilidad publica no debe interpretarse como licencia Apache-2.0 sobre los pesos. Los datos originales son Apache-2.0 segun el NOTICE del dataset, con terminos de terceros preservados.
- Los splits de test ya han sido observados y no deben presentarse como tests intactos tras ajustes posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sraivante/health-faq-reviewed-v4
- Dataset: https://huggingface.co/datasets/sraivante/health-faq-reviewed-v4-data
