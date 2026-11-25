# Z-Jafari/roberta-fa-zwnj-base-finetuned-Reletive_Selection

## Resumen

`roberta-fa-zwnj-base-finetuned-Reletive_Selection` es un modelo de pregunta-respuesta extractiva (question answering) en persa, obtenido mediante fine-tuning del checkpoint base `HooshvareLab/roberta-fa-zwnj-base`. Lo desarrolla el usuario Z-Jafari y se distribuye bajo licencia Apache 2.0. El modelo parte de una arquitectura RoBERTa adaptada al persa con tratamiento explícito del carácter ZWNJ (Zero-Width Non-Joiner), un detalle ortográfico crítico en farsi, y se ha especializado en la tarea de selección de cláusulas relativas (relative selection), según indica el propio nombre del checkpoint.

El modelo cuenta con 117.709.058 parámetros, lo que lo sitúa en la categoría base (~110M), y se distribuye en formato safetensors compatible con la librería transformers. La model card es automática y no documenta el conjunto de datos de entrenamiento ni el conjunto de evaluación, más allá de los hiperparámetros y la curva de pérdida. Esto limita seriamente la trazabilidad del ajuste fino y obliga a tratar el checkpoint como experimental.

Su relevancia es acotada: cubre un nicho muy concreto (QA extractiva en persa con atención al ZWNJ) y no compite con modelos generativos multilingües de gran escala. Resulta útil para pipelines de extracción de respuestas sobre texto persa donde el rendimiento de un encoder pequeño y rápido sea preferible a un LLM generativo, siempre que se valide su calidad con un conjunto propio, dado que no hay métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only) adaptada al persa con ZWNJ |
| Parametros totales | 117.709.058 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base RoBERTa suele usar 512 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | persa (farsi) por el modelo base; no confirmado explicitamente en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only de la familia RoBERTa, heredado de `HooshvareLab/roberta-fa-zwnj-base`. La particularidad del checkpoint base es el preprocesamiento del ZWNJ (U+200C), un carácter de control que en persa afecta a la morfología y a la tokenización; el modelo base lo preserva en lugar de eliminarlo, lo que mejora la representación de palabras compuestas y sufijos. Sobre esa base se ha realizado un fine-tuning supervisado para question answering extractiva, presumiblemente con la cabeza de clasificación de inicio/fin de span típica de SQuAD.

Los hiperparámetros documentados son: learning rate 2e-5, batch de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal, 3 épocas y precisión mixta nativa (AMP). El entrenamiento se ejecutó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La curva de pérdida muestra sobreajuste claro: la pérdida de entrenamiento baja de 1.0301 a 0.3503 mientras la de validación sube de 1.5594 a 1.7828 entre la época 1 y la 3. No se documenta el dataset, el número de tokens vistos, ni si hubo aumentación de datos o validación cruzada.

## Capacidades

- Question answering extractiva: localiza el span de respuesta dentro de un contexto dado, devolviendo posiciones de inicio y fin.
- Procesamiento de persa con ZWNJ: tokenización que preserva el Zero-Width Non-Joiner, relevante para morfología persa.
- Selección de cláusulas relativas: el nombre del checkpoint sugiere especialización en identificar la cláusula relativa correcta en una oración, aunque la model card no lo detalla.
- Inferencia rápida en CPU y GPU de gama baja gracias a su tamaño base (~118M parámetros).
- No soporta tool calling ni function calling: es un encoder extractivo, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no confirmadas; el modelo base está orientado a persa.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de respuestas en buscadores de documentación persa: dado un pasaje y una pregunta, el modelo devuelve el fragmento exacto que responde, integrándose en un pipeline de recuperación aumentada con un retriever previo.
- Atención al cliente sobre bases de conocimiento en farsi: extraer la frase relevante de un FAQ para mostrarla al usuario, con latencia baja al ser un encoder de 118M parámetros.
- Anotación asistida de corpus QA en persa: preetiquetar spans de respuesta para que anotadores humanos los revisen, reduciendo el coste de construcción de datasets.
- Análisis de contratos y documentos legales persas: localizar cláusulas o importes concretos en textos estructurados, aprovechando la preservación del ZWNJ para términos compuestos.
- Procesamiento de prensa en farsi: extraer entidades y respuestas factuales (fechas, cargos, cifras) de artículos para alimentar bases de datos periodísticas.
- Componente en pipelines de evaluación de modelos generativos: usar el QA extractivo como referencia para comparar si un LLM generativo responde con el span correcto en persa.
- Filtrado de pares pregunta-respuesta en foros: verificar automáticamente que una respuesta contiene el span esperado antes de publicarla.

## Benchmarks y rendimiento

La model-index del autor declara una lista de resultados vacía. La única métrica publicada es la pérdida de validación (1.7828 en la época 3), que no es una métrica de calidad de QA (no es EM ni F1). No se han publicado resultados de benchmarks en la información disponible.

| Metrica | Valor |
|---|---|
| Validation loss (epoca 3) | 1.7828 |
| Exact Match (EM) | no disponible |
| F1 | no disponible |
| MMLU / HumanEval / GSM8K | no aplica (modelo extractivo, no generativo) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,5 GB para los pesos (118M × 4 bytes) más activaciones; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en fp16/bf16: ~0,25 GB de pesos, con margen amplio para batch grande.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; para throughput alto, A10G, L4 o A100 con batching.
- Cabe en GPU consumer: sí, en todas las RTX y en GPUs integradas con suficiente RAM compartida.
- Opciones de despliegue: transformers (pipeline `question-answering`), TorchScript/ONNX Runtime para producción, TGI no aplica (no es generativo), vLLM no aplica, llama.cpp no aplica (no hay GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por tamaño, la inferencia en GPU debería estar en el orden de milisegundos por ejemplo con batch pequeño, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/roberta-fa-zwnj-base-finetuned-Reletive_Selection | 117,7M | no disponible | QA extractiva persa | apache-2.0 | Hugging Face |
| HooshvareLab/roberta-fa-zwnj-base | ~118M | no disponible | encoder base persa | apache-2.0 (segun modelo base) | Hugging Face |
| HooshvareLab/bert-fa-base-uncased | ~118M | no disponible | encoder base persa | apache-2.0 (segun modelo base) | Hugging Face |
| XLM-RoBERTa-base | ~278M | 512 | encoder multilingue | MIT | Hugging Face |

La comparativa se limita a encoders porque el modelo no es generativo. Frente a XLM-RoBERTa-base, este checkpoint es más pequeño y específico para persa, pero carece de métricas publicadas que permitan afirmar superioridad. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sobreajuste evidente: la pérdida de validación aumenta en cada época (1.5594 → 1.6455 → 1.7828) mientras la de entrenamiento cae; el checkpoint final probablemente no es el mejor de la curva.
- Dataset de entrenamiento no documentado: imposible evaluar cobertura, sesgos o dominio de aplicación.
- Sin métricas de QA publicadas (EM/F1): no se puede afirmar su calidad frente a alternativas.
- Model card automática y sin revisar: faltan descripción, usos previstos y limitaciones declaradas por el autor.
- Riesgo de alucinación estructural bajo en QA extractiva (el span siempre proviene del contexto), pero puede devolver spans incorrectos o vacíos si la respuesta no está en el pasaje.
- Dependencia del tokenizador con ZWNJ: textos normalizados que eliminen U+200C pueden degradar el rendimiento.
- Idioma limitado al persa; no se confirma soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace recomendable validar en un conjunto propio antes de producción.
- Repositorio de 14,6 GB para 118M parámetros: probablemente incluye checkpoints intermedios y estados del optimizador; conviene descargar solo los safetensors finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-Reletive_Selection
- Modelo base: https://huggingface.co/HooshvareLab/roberta-fa-zwnj-base
- Perfil del autor: https://huggingface.co/Z-Jafari
