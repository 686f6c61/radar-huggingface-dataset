# WangSenQWQ/Senova-4B-v3

## Resumen

Senova-4B-v3 es un ajuste fino de Qwen/Qwen3.5-4B publicado por el usuario WangSenQWQ en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text orientado a tareas de decisión sobre conjuntos de opciones (multiple-choice y preguntas de respuesta cerrada), no a generación de chat genérica. El autor lo describe como un modelo entrenado con un «mixture» revisado de aproximadamente 1,8 millones de ejemplos de alta calidad, con etiquetas suaves sobre el conjunto de opciones, y una técnica de inferencia propietaria denominada «Read Twice».

La relevancia del modelo es acotada y muy específica: no compite en capacidades generales de razonamiento o generación, sino que se posiciona como un artefacto para obtener una única distribución de siguiente token por pregunta y devolver una respuesta tipada (opción o «noul») a través de un servidor de inferencia propio. El autor publica una puntuación de 67,27 en un «Public Decision Index 0.3» con 140.178 solicitudes puntuables procesadas con éxito, si bien advierte explícitamente que la fuente de entrenamiento incluye datos derivados de tests y que la puntuación no constituye una medida libre de contaminación.

El modelo tiene 4.539.265.536 parámetros reales según los safetensors, un repositorio de 18,2 GB y licencia Apache-2.0 sobre los pesos. La model card está redactada para la versión v2 y el autor no documenta diferencias específicas para v3 más allá de la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen/Qwen3.5-4B; tag `qwen3_5` |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); los derechos del dataset no se ceden con la licencia del modelo |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de 4,54 mil millones de parámetros que procesa entradas de imagen y texto. Sobre esa base, el autor aplica un ajuste fino supervisado con un «mixture» de aproximadamente 1,8 millones de ejemplos de alta calidad, empleando etiquetas suaves (soft labels) sobre el conjunto de opciones en lugar de etiquetas duras. No se documenta en la información disponible el uso de RLHF, DPO ni de una fase de preferencias; tampoco se detalla la composición del dataset ni el número total de tokens de entrenamiento.

La innovación técnica declarada es «Read Twice»: en inferencia, el servidor propio repite el input completo del usuario renderizado dos veces dentro de un mismo mensaje de usuario, fija el modo thinking en off y calcula una única distribución de siguiente token por pregunta. Esta configuración no es la generación de chat convencional y requiere usar el servidor de inferencia acompañante en lugar de `generate()` estándar. El autor advierte que los pesos han sido modificados por el entrenamiento con soft labels y no son una versión sin modificar de Qwen.

## Capacidades

- Clasificación y decisión sobre conjuntos de opciones: devuelve respuestas tipadas (choice/noul) mediante `POST /v1/systemone`.
- Procesamiento de entradas imagen-texto, heredado de la base Qwen3.5-4B (pipeline `image-text-to-text`).
- Modo de respuesta cerrada con una única distribución de siguiente token por pregunta, sin generación autoregresiva libre.
- Soporte de inferencia con Read Twice y thinking desactivado, tal como lo implementa el servidor del autor.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Capacidades de tool calling, agentes, razonamiento multi-paso o thinking mode: no documentadas para este ajuste.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación automática de exámenes tipo test: el modelo recibe el enunciado y el conjunto de opciones y devuelve la elección mediante el endpoint `/v1/systemone`, lo que encaja con su entrenamiento en etiquetas suaves sobre opciones.
- Clasificación cerrada de documentos con imagen: al heredar la entrada image-text-to-text de Qwen3.5-4B, puede asignar una categoría de un conjunto predefinido a capturas, formularios o figuras.
- Triaje de tickets con categorías fijas: integrado en un servidor de inferencia, permite mapear cada incidencia a una de las opciones de la taxonomía interna sin generación libre.
- Anonimización o filtrado por etiqueta: usar el modelo como clasificador binario o multiclase (por ejemplo, «noul» frente a una opción concreta) en pipelines de preprocesado.
- Investigación sobre calibración con soft labels: el modelo sirve como artefacto reproducible para estudiar cómo el entrenamiento con etiquetas suaves afecta a la distribución de siguiente token en tareas de elección.
- Reproducción de benchmarks de decisión: el autor publica `scores.json` y un índice público, de modo que el modelo puede emplearse para replicar o auditar la metodología del Decision Index.
- Despliegue en entornos con recursos limitados: con 4,54 B de parámetros y pesos en safetensors de 18,2 GB, es viable en una GPU única de gama alta para servir el endpoint propietario.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Public Decision Index 0.3 | 67,27 | `complete=true`; 140.178/140.178 solicitudes puntuables con éxito |
| Private Full score | no disponible | Determinado por los mantenedores del leaderboard |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El autor advierte que la fuente de entrenamiento incluye datos derivados de tests y que la puntuación publicada no es una medida libre de contaminación ni de rendimiento en datos no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9-10 GB solo para pesos, más overhead de activaciones y del procesador de visión; en la práctica, 12-16 GB para el servidor completo.
- Cuantización a 8 bits: alrededor de 5-6 GB de pesos; a 4 bits, alrededor de 3 GB, si bien no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16 sin compromisos; RTX 3090/4080 (24/16 GB) para fp16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16; en GPUs de 12-16 GB probablemente requiera cuantización, no publicada por el autor.
- Opciones de despliegue: el autor exige su servidor de inferencia propio (repositorio `Senova-4B-v2-inference`) con el endpoint `/v1/systemone`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el uso de `generate()` genérico no reproduce el comportamiento previsto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Senova-4B-v3 | 4,54 B | no disponible | Apache-2.0 | Decisión sobre opciones, Read Twice, servidor propio |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | según Qwen | Multimodal generalista image-text-to-text |
| Alternativas de 4 B para clasificación | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables entre Senova-4B-v3 y otros modelos de la misma categoría en la información proporcionada. La comparación directa más fiable es con su modelo base Qwen3.5-4B, del que hereda arquitectura y capacidades multimodales, pero del que se diferencia por el ajuste con soft labels y por el protocolo de inferencia restringido.

## Limitaciones y advertencias

- El modelo no está pensado para chat genérico: el autor indica explícitamente que debe usarse el servidor acompañante y no la generación estándar.
- La puntuación del Decision Index (67,27) procede de un benchmark público cuyas fuentes de entrenamiento incluyen datos derivados de tests; no es una medida libre de contaminación.
- Los pesos han sido modificados por el entrenamiento con soft labels y no constituyen una versión sin modificar de Qwen.
- La licencia Apache-2.0 cubre los pesos, pero no concede derechos sobre el dataset de entrenamiento.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; estas carencias dificultan evaluar su idoneidad en producción multilingüe.
- No se publican cuantizaciones oficiales, lo que limita el despliegue en hardware de gama media.
- El repositorio tiene 13 descargas y 0 likes en el momento de la consulta, con lo que la validación comunitaria es prácticamente nula.
- La model card corresponde a la versión v2 y no detalla cambios específicos de v3, lo que introduce ambigüedad sobre el artefacto exacto publicado.
- Riesgo de alucinación y comportamiento fuera de distribución en preguntas que no encajen en el formato de opciones: no evaluado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WangSenQWQ/Senova-4B-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código de inferencia y despliegue: https://github.com/wswsddd/Senova-4B-v2-inference
- Resultados públicos del Decision Index: https://huggingface.co/datasets/WangSenQWQ/Senova-4B-v2-decision-index-results/blob/main/runs/senova_4b_v2_readtwice/scores.json
