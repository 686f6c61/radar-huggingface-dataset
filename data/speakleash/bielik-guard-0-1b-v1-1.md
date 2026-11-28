# speakleash/Bielik-Guard-0.1B-v1.1

## Resumen

Bielik-Guard-0.1B-v1.1 es un modelo de clasificación de texto desarrollado por Speakleash, el equipo responsable de la familia de modelos Bielik orientada al polaco. Se trata de un fine-tuning del checkpoint `sdadas/mmlw-roberta-base`, un RoBERTa base entrenado sobre el corpus MMLW (More Polish Web), y está especializado en tareas de moderación y filtrado de contenido en lengua polaca. Con 124,4 millones de parámetros, es un modelo compacto pensado para desplegarse como capa de seguridad en pipelines de generación de texto.

El modelo no genera texto: es un clasificador que asigna etiquetas a fragmentos de entrada, lo que lo hace útil como guardarraíl (guardrail) en sistemas de IA conversacional, plataformas de contenido generado por usuarios o pipelines de curación de datasets. Su tamaño reducido permite ejecutarlo en CPU o en GPUs de gama baja con latencias bajas, algo relevante cuando se necesita filtrar grandes volúmenes de texto en tiempo real.

La versión v1.1 corrige y refina el comportamiento de la versión anterior (v1), y se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido (gated) y requiere aceptar las condiciones en Hugging Face. Es relevante ahora porque cubre un hueco específico: la moderación de contenido en polaco con un modelo ligero, algo para lo que la mayoría de modelos guard disponibles (centrados en inglés) rinden por debajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only), fine-tuning de `sdadas/mmlw-roberta-base` |
| Parametros totales | 124.446.725 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base RoBERTa soporta hasta 512 tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas estándar, no documentada) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder-only con atención bidireccional, adaptado al polaco mediante el checkpoint `sdadas/mmlw-roberta-base`, entrenado sobre el corpus MMLW. Sobre esa base, Speakleash realizó un fine-tuning supervisado para clasificación de texto orientada a moderación (guard), con 124,4 millones de parámetros y un tamaño de repositorio de 0,5 GB.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset de fine-tuning, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos encoder-only de clasificación). Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal, que no aplican a este tipo de arquitectura. El modelo se distribuye con la librería transformers y es compatible con text-embeddings-inference y endpoints compatibles.

## Capacidades

- Clasificación de texto en polaco: asigna etiquetas a fragmentos de entrada, orientado a detección de contenido no deseado o inseguro.
- Moderación de contenido: función principal del modelo como guardarraíl en sistemas de IA y plataformas.
- Filtrado de datasets: puede emplearse para curar corpus en polaco eliminando muestras problemáticas.
- Integración en pipelines de transformers: compatible con la librería estándar y con text-embeddings-inference.
- Despliegue ligero: 124,4 M de parámetros permiten inferencia en CPU y GPUs de gama baja.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es un clasificador, no un modelo generativo.
- Capacidades multilingües: limitadas al polaco según la ficha del modelo.

## Casos de uso

- Moderación de comentarios en plataformas polacas: el modelo clasifica cada mensaje entrante y permite bloquear o marcar contenido tóxico antes de publicarlo, con latencia baja gracias a sus 124 M de parámetros.
- Guardarraíl en asistentes conversacionales en polaco: se sitúa como filtro de entrada y salida de un LLM generativo, evaluando si la respuesta o la petición del usuario cumple las políticas antes de mostrarse.
- Curación de corpus de entrenamiento: se aplica sobre grandes volúmenes de texto web en polaco para descartar muestras de baja calidad o contenido inapropiado antes de entrenar otros modelos.
- Filtrado en foros y comunidades online: integrado en el backend, clasifica publicaciones en tiempo real y escala horizontalmente al ser un modelo pequeño.
- Detección de contenido en herramientas de moderación SaaS: se ofrece como endpoint compatible con text-embeddings-inference para clientes que necesiten moderación en polaco sin depender de APIs externas.
- Preprocesado en pipelines de anotación: se usa como primera pasada automática que reduce el volumen de textos que revisan anotadores humanos.
- Evaluación de seguridad en investigación: sirve como baseline ligero para estudiar la eficacia de clasificadores de moderación en lenguas eslavas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (124,4 M de parámetros, ~0,5 GB de pesos); menos de 0,5 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, T4, RTX 3060 en adelante); también funciona en CPU.
- Cabe en cualquier GPU de consumo actual, e incluso en entornos sin GPU.
- Opciones de despliegue: transformers (Python), text-embeddings-inference, endpoints compatibles; cuantización posible con herramientas estándar aunque no documentada por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera throughput alto en lote sobre GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-Guard-0.1B-v1.1 | 124,4 M | no disponible | pl | Apache 2.0 | Gated en HF |
| sdadas/mmlw-roberta-base (base) | ~124 M | 512 tokens (RoBERTa) | pl | no disponible en la información | Público en HF |
| Modelos guard centrados en inglés (p. ej. Llama Guard) | miles de millones | largo | en (multilingüe parcial) | licencias variables | Público o gated |

La comparación con modelos guard generativos no es directa: Bielik-Guard es un clasificador encoder-only especializado en polaco, mientras que los guard basados en LLM son generativos y multilingües pero mucho más pesados. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en polaco; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Es un clasificador, no un generador: no puede producir texto ni razonar; su uso está limitado a etiquetado.
- Riesgo de falsos positivos y negativos en la moderación; no se han publicado métricas de precisión, recall ni F1 en la información disponible.
- Sesgos potenciales heredados del corpus MMLW y del dataset de fine-tuning, no documentados.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de despliegues.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que deben revisarse.
- Longitud de contexto no confirmada en la ficha; si se hereda de RoBERTa, se limita a 512 tokens, insuficiente para documentos largos.
- No se documentan procesos de calibración ni umbrales recomendados para producción.

## Enlaces

- Hugging Face: https://huggingface.co/speakleash/Bielik-Guard-0.1B-v1.1
- Modelo base: https://huggingface.co/sdadas/mmlw-roberta-base
- Organización Speakleash: https://huggingface.co/speakleash
- Paper referenciado (arXiv:2602.07954): https://arxiv.org/abs/2602.07954
