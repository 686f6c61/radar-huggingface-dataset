# unlikefraction/mcq-deberta-v3-small

## Resumen

El modelo es una exportación ONNX cuantizada int8 de DeBERTa-v3-small, fine-tuneada para seleccionar la respuesta correcta en preguntas de opción múltiple de cinco opciones. Desarrollado por unlikefraction (Shubham Gupta) como parte del proyecto IITM BS DA2001P Deep Learning & GenAI, resuelve el problema de elegir entre cinco opciones (A-E) dado un enunciado y las opciones presentadas. Su relevancia radica en que está optimizado para ejecutarse en el navegador mediante Transformers.js y ONNX Runtime, gracias a la cuantización int8 per-channel dinámica. La arquitectura es DeBERTa-v3 (encoder-only transformer) en su variante small; el tamaño del repositorio es de 0.2 GB. No se especifica la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (encoder-only transformer) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 per-channel dynamic quantization |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte de microsoft/deberta-v3-small y se fine-tunea para clasificación de texto de 5 clases. Los datos de entrenamiento son las 2,000 filas etiquetadas del dataset "smart-mcq-solver-challenge". Se entrenó durante 3 épocas con AdamW (lr 2e-5, weight decay 0.01), batch size 8, float32 y programación lineal con 50 pasos de calentamiento. No se aplicó RLHF ni DPO.

La innovación técnica principal es la exportación a ONNX con cuantización int8 per-channel dinámica, que reduce el tamaño del modelo y permite su ejecución en el navegador con Transformers.js. Según la model card, este modelo forma parte de un ensemble con un RoBERTa (pesos 0.7 y 0.3 respectivamente) para el proyecto original.

## Capacidades

- Clasificación de texto para selección de respuesta en preguntas de opción múltiple (MCQ) de 5 opciones (A-E).
- Entrada: una cadena aplanada con el formato `"{question}\nA. {A}\nB. {B}\nC. {C}\nD. {D}\nE. {E}"`, truncada a 160 tokens.
- Salida: probabilidades sobre las cinco clases (LABEL_0 a LABEL_4), correspondientes a las opciones A-E.
- Optimizado para inferencia en el navegador mediante ONNX Runtime y Transformers.js.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso.
- Capacidades multilingües no especificadas en la información disponible.

## Casos de uso

- Corrección automática de exámenes tipo test: el modelo recibe la pregunta y las cinco opciones y devuelve la opción más probable, lo que permite automatizar la evaluación de cuestionarios en plataformas educativas.
- Tutoría interactiva en el navegador: al ejecutarse con Transformers.js, puede integrarse en aplicaciones web sin servidor, proporcionando retroalimentación instantánea en ejercicios de opción múltiple.
- Generación de preguntas de práctica: dado un conjunto de preguntas existentes, el modelo puede verificar si la opción marcada como correcta es coherente, ayudando a curar bancos de preguntas.
- Asistente de estudio para exámenes estandarizados: el modelo puede usarse para practicar con preguntas de cinco opciones, mostrando la respuesta correcta y las probabilidades de cada opción.
- Componente de un ensemble de modelos: junto con un RoBERTa, forma un ensemble que mejora la precisión; este modelo aporta la parte DeBERTa del ensemble.
- Herramientas de análisis de calidad de preguntas: al observar la distribución de probabilidades, se pueden detectar preguntas ambiguas donde varias opciones tienen probabilidades similares.
- Demo educativa en Hugging Face Spaces: el modelo está disponible en una demo interactiva para que los estudiantes prueben su funcionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La información disponible incluye métricas de fidelidad de cuantización, medidas sobre 300 filas etiquetadas comparando el modelo int8 con el checkpoint fp32, para el ensemble 0.7 DeBERTa + 0.3 RoBERTa:

| Metrica | Valor |
|---|---|
| Top-1 agreement (vs fp32) | 99.67% |
| MAP@3 (fp32) | 1.000000 |
| MAP@3 (int8) | 0.998333 |

Estas métricas indican que la cuantización int8 preserva casi por completo las predicciones de top-1, aunque puede reordenar la cola de probabilidades bajas (~0.001) debido a la resolución int8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: ONNX Runtime (Web y Node.js), Transformers.js en el navegador, y posiblemente en entornos serverless.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo es un fine-tune específico para MCQ, y no se incluyen datos de otros modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El modelo se entrenó con un conjunto reducido de 2,000 ejemplos, lo que puede introducir sesgos no documentados.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, pero puede seleccionar una opción incorrecta si ninguna opción es correcta o si la pregunta es ambigua.
- Limitaciones de contexto: la entrada se trunca a 160 tokens, por lo que preguntas largas o con opciones extensas pueden perder información relevante.
- Restricciones de licencia: MIT, permite uso comercial y modificación sin restricciones.
- Caveat para producción: el pequeño tamaño del conjunto de entrenamiento limita la generalización a dominios distintos del dataset original. La cuantización int8 puede reordenar las probabilidades de las opciones de rango bajo (aproximadamente 0.001), lo que podría afectar a decisiones basadas en el ranking de las opciones 2-3.
- Dependencia de ONNX Runtime y Transformers.js para el despliegue, lo que condiciona el entorno de ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unlikefraction/mcq-deberta-v3-small
- Demo en vivo: https://huggingface.co/spaces/unlikefraction/smart-mcq-solver
- Repositorio del proyecto: https://github.com/unlikefraction/iitm-da2001p-may2026
