# unlikefraction/mcq-roberta-base

## Resumen

El modelo `unlikefraction/mcq-roberta-base` es un clasificador de texto especializado en la selección de respuestas en preguntas de opción múltiple (MCQ) con cinco opciones (A-E). Se trata de un fine-tuning de `roberta-base` realizado por Shubham Gupta para el proyecto IITM BS DA2001P Deep Learning & GenAI, y exportado a formato ONNX con cuantización int8 per-channel dynamic para su ejecución en navegador mediante la librería `transformers.js`.

El modelo resuelve el problema de elegir la opción correcta en un enunciado de tipo test. Recibe un único string aplanado con la pregunta y las cinco opciones, y devuelve una de las cinco clases correspondientes a las letras A-E. Su relevancia radica en que demuestra un flujo completo de fine-tuning, cuantización y despliegue web, con una fidelidad de cuantización muy alta: el 99.67% de acuerdo en predicciones top-1 frente a la versión fp32.

La arquitectura es un transformer encoder basado en RoBERTa-base, con una longitud de contexto limitada a 160 tokens durante el entrenamiento. El tamaño total de parámetros no se especifica en la información disponible, aunque corresponde a un modelo de tipo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder) fine-tuned para clasificación de opción múltiple, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 160 tokens (max_length de entrada) |
| Tipos de cuantizacion | int8 per-channel dynamic quantization (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder de la familia RoBERTa, y se fine-tunea como clasificador de cinco clases. La entrada es un único string con el formato `"{question}\nA. {A}\nB. {B}\nC. {C}\nD. {D}\nE. {E}"`, truncado a `max_length=160`. Las cinco clases corresponden a las letras A-E (`LABEL_0`..`LABEL_4`).

El entrenamiento se realizó sobre las 2.000 filas etiquetadas del dataset `smart-mcq-solver-challenge`, durante 3 épocas, con optimizador AdamW (learning rate 2e-5, weight decay 0.01), batch size 8, en float32, y un scheduler lineal con 50 pasos de calentamiento. No se menciona RLHF ni DPO.

La innovación técnica destacable es la exportación a ONNX con cuantización int8 per-channel dynamic, que permite ejecutar el modelo en el navegador con `transformers.js`. La model card reporta una fidelidad de cuantización medida sobre 300 filas: comparando la versión fp32 y la int8 dentro de un ensemble (0.7 x DeBERTa + 0.3 x RoBERTa), el acuerdo top-1 es del 99.67% y el MAP@3 pasa de 1.000000 a 0.998333. Las predicciones top-1 se preservan prácticamente, aunque las probabilidades muy bajas (en torno a 0.001) pueden reordenarse al estar por debajo de la resolución int8.

## Capacidades

- Clasificación de preguntas de opción múltiple: dada una pregunta y cinco opciones en formato aplanado, predice la opción correcta (A-E).
- Soporte de entrada estructurada en un único string, con separadores de nueva línea y etiquetas A-E.
- Cuantización int8 para inferencia eficiente en navegador mediante `transformers.js`.
- No soporta generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Evaluación automatizada de exámenes tipo test: el modelo puede corregir automáticamente preguntas de opción múltiple en plataformas educativas, seleccionando la opción correcta entre cinco alternativas.
- Tutoría inteligente: integrarlo en sistemas de tutoría para responder preguntas de opción múltiple en asignaturas técnicas, permitiendo a los estudiantes verificar sus respuestas al instante.
- Análisis de cuestionarios en investigación: procesar encuestas y tests con preguntas de opción múltiple para clasificar respuestas de forma automatizada, reduciendo el trabajo manual.
- Generación de contenido educativo: validar opciones de respuesta en la creación de bancos de preguntas, comprobando cuál es la correcta y detectando posibles errores en los enunciados.
- Demo interactiva en Hugging Face Spaces: el modelo se utiliza en una aplicación web para que los usuarios prueben la selección de respuestas directamente en el navegador, sin necesidad de infraestructura GPU.
- Experimentos de cuantización: servir como caso de estudio para comparar la fidelidad de modelos cuantizados int8 frente a sus versiones fp32 en tareas de clasificación, especialmente en contextos de despliegue web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card reporta únicamente métricas de fidelidad de cuantización, medidas sobre 300 filas etiquetadas y comparando la versión fp32 con la ONNX int8 dentro de un ensemble (0.7 x DeBERTa + 0.3 x RoBERTa):

| Metrica | Valor fp32 | Valor int8 |
|---|---|---|
| Top-1 agreement | 100% | 99.67% |
| MAP@3 | 1.000000 | 0.998333 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. Al estar exportado a ONNX para `transformers.js`, puede ejecutarse en CPU o en el navegador sin GPU dedicada.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: `transformers.js` en el navegador, ONNX Runtime en entornos Node.js.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría. El modelo puede compararse con su checkpoint fp32 original, pero no se ofrecen métricas de rendimiento más allá de la fidelidad de cuantización.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse únicamente con 2.000 filas de un dataset específico, el modelo puede heredar sesgos de ese conjunto de datos.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, pero puede asignar probabilidades incorrectas a opciones, especialmente en preguntas ambiguas o fuera de la distribución de entrenamiento.
- Limitaciones de contexto: la entrada está limitada a 160 tokens, por lo que preguntas largas o con más de cinco opciones no se procesan correctamente.
- Restricciones de licencia: MIT, que permite uso comercial, pero el modelo es un proyecto académico sin garantías de soporte ni mantenimiento.
- Caveat para producción: la cuantización int8 puede reordenar probabilidades muy bajas (por debajo de la resolución int8), aunque las predicciones top-1 se preservan en un 99.67% según la model card.

## Enlaces

- HuggingFace: https://huggingface.co/unlikefraction/mcq-roberta-base
- Demo: https://huggingface.co/spaces/unlikefraction/smart-mcq-solver
- GitHub: https://github.com/unlikefraction/iitm-da2001p-may2026
