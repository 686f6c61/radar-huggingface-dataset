# Tatathamon/thai-qa-lab-model

## Resumen

Tatathamon/thai-qa-lab-model es un modelo de generación de texto en tailandés desarrollado por Tatathamon, estudiante que ha realizado un fine-tuning de GPT-2 sobre un conjunto de datos de 3.000 pares de preguntas y respuestas sobre gatos (cat_qa_3000). El modelo está pensado para responder preguntas básicas en tailandés dentro del dominio felino, y sirve como ejercicio académico de fine-tuning de modelos de lenguaje pequeños.

La arquitectura es un transformer decoder-only basado en GPT-2 small, con un total de 124.449.024 parámetros. La longitud de contexto no se especifica en la model card, pero corresponde al estándar de GPT-2 (1.024 tokens). El modelo se distribuye en formato safetensors, con licencia MIT, y está etiquetado exclusivamente para el idioma tailandés (th). Su relevancia radica en ser un ejemplo práctico de cómo adaptar un modelo preentrenado a un dominio muy concreto con pocos recursos, aunque su utilidad real en producción es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small) |
| Parametros totales | 124.449.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (estandar de GPT-2, no especificado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Tailandes (th) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de GPT-2 small, un transformer puramente decoder-only con 12 capas, 12 cabezas de atencion y dimensiones ocultas de 768. No se han publicado detalles sobre el proceso de fine-tuning: ni hiperparametros, ni regimen de precision (fp32, fp16, etc.), ni numero de epocas, ni si se aplico alguna tecnica de alineacion como RLHF o DPO. La unica informacion disponible es que el entrenamiento se realizo sobre el dataset cat_qa_3000, compuesto por 3.000 pares pregunta-respuesta en tailandes sobre gatos. No hay innovaciones tecnicas destacables: se trata de un fine-tuning estandar de un modelo preentrenado.

## Capacidades

- Generacion de texto en tailandes, limitada al dominio de preguntas y respuestas sobre gatos.
- Comprension basica de preguntas factuales sencillas dentro del corpus de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente autonomo.
- Sin capacidades de vision, audio o multimodalidad.
- No se ha verificado ningun soporte multilingue mas alla del tailandes.

## Casos de uso

- Chatbot de preguntas frecuentes sobre gatos en tailandes: el modelo puede responder consultas basicas sobre cuidados, alimentacion o razas felinas, siempre que las respuestas esten dentro del corpus de entrenamiento. Es adecuado como prototipo para probar la viabilidad de un asistente de dominio reducido.

- Demo educativa de fine-tuning: por su tamano reducido, el modelo es util para ensenar a estudiantes como ajustar un modelo de lenguaje preentrenado con un dataset propio. Permite ilustrar el flujo completo de entrenamiento, evaluacion y despliegue.

- Generacion de contenido descriptivo sobre gatos: puede producir textos cortos en tailandes sobre caracteristicas de gatos, util para rellenar fichas de animales en una web de adopcion o para generar descripciones sencillas.

- Prototipo de FAQ para una clinica veterinaria: como prueba de concepto, el modelo puede responder preguntas frecuentes sobre sintomas o cuidados basicos, aunque sufiere limitaciones importantes en precision y generalizacion.

- Investigacion en modelos pequenos para idiomas de bajos recursos: el tailandes cuenta con menos recursos que el ingles, por lo que este modelo puede servir como punto de partida para estudiar el impacto del fine-tuning en dominios especificos con pocos datos.

- Base para fine-tuning adicional: al ser un modelo GPT-2 estandar con licencia MIT, puede usarse como punto de partida para adaptarlo a otros dominios en tailandes, siempre que se disponga de un dataset adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion comparativa. La model card menciona perplexity como metrica, pero no se proporcionan valores numericos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 500 MB en fp32 y 250 MB en fp16 para los pesos del modelo.
- GPU recomendada: cualquier GPU con mas de 1 GB de VRAM, como una RTX 2060 o superior. Tambien puede ejecutarse en CPU.
- Si cabe en GPU de consumo: si, incluso en GPUs integradas o en tarjetas antiguas con 2 GB.
- Opciones de despliegue: Transformers de HuggingFace, vLLM, TGI. No se ha verificado compatibilidad con llama.cpp u otros runtime de cuantizacion.
- Latencia: al tener solo 124M parametros, la latencia es muy baja en GPU (milisegundos por token) y aceptable en CPU para uso interactivo. No se dispone de mediciones concretas de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tatathamon/thai-qa-lab-model | 124.449.024 | 1.024 | Tailandes | MIT | HuggingFace |
| GPT-2 base (sin fine-tuning) | 124M | 1.024 | Ingles | MIT | HuggingFace |
| B4869/thai-qa-lab-model | 124.449.024 | 1.024 | Tailandes | MIT | HuggingFace |

No se dispone de benchmarks comparativos entre estos modelos. La diferencia principal del modelo de Tatathamon respecto a GPT-2 base es el fine-tuning en tailandes sobre el dominio felino, mientras que el modelo de B4869 parece ser una copia o variante del mismo proyecto. No se conocen otros modelos comparables de la misma categoria en el momento de la consulta.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ha entrenado exclusivamente con datos sobre gatos, por lo que sus respuestas estan sesgadas hacia este dominio y no generalizan a otros temas.
- Riesgo de alucinacion: al ser un modelo pequeno y fine-tuned con un dataset reducido (3.000 pares), es probable que genere respuestas incorrectas o inventadas cuando se le pregunta fuera del corpus.
- Limitaciones de contexto: la ventana de 1.024 tokens es corta para conversaciones largas o para procesar documentos extensos.
- Limitaciones de idioma: el modelo solo funciona en tailandes. No soporta otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero el modelo no ha sido evaluado para entornos de produccion y no ofrece garantias de seguridad ni de calidad.
- Caveat importante para produccion: no se recomienda su uso en sistemas reales de atencion al cliente o en aplicaciones donde la precision sea critica, dado que no se han publicado evaluaciones de rendimiento ni pruebas de robustez.

## Enlaces

- HuggingFace: https://huggingface.co/Tatathamon/thai-qa-lab-model
- Paper de GPT-2 (Language Models are Unsupervised Multitask Learners): https://arxiv.org/abs/1910.09700
- Dataset cat_qa_3000: no disponible en la informacion proporcionada.
