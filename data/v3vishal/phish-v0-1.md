# v3vishal/phish-v0.1

## Resumen

El modelo v3vishal/phish-v0.1 es un clasificador de texto basado en la arquitectura DistilBERT, desarrollado por el usuario v3vishal. Tiene 66.955.010 parámetros y un tamaño de repo de 0,6 GB. El nombre del modelo sugiere que está orientado a la detección de phishing, aunque la documentación disponible no lo confirma explícitamente. Se distribuye bajo licencia Apache 2.0 y ofrece pesos en formato safetensors y ONNX. La información pública es escasa: no se han publicado benchmarks, especificaciones de uso ni detalles del entrenamiento, lo que limita la evaluación de su idoneidad para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se ofrecen pesos en safetensors y ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura DistilBERT, un transformer encoder de la familia BERT con menos parámetros que el modelo original (66,9 millones frente a los 110 millones de BERT-base). Al ser un modelo encoder, está diseñado para tareas de comprensión de texto, como clasificación o etiquetado, y no para generación. No se ha publicado información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de afinado como RLHF o DPO. La fecha de creación en HuggingFace es el 4 de septiembre de 2026, y la última actualización es del mismo día.

## Capacidades

- Clasificación de texto: por su arquitectura, se infiere que puede realizar clasificación binaria o multiclase de texto, aunque no está documentado oficialmente.
- Sin soporte conocido para tool calling, agents, visión o audio.
- No es un modelo generativo, por lo que no puede producir texto libre.
- Capacidades multilingües no especificadas.
- No se ha confirmado ningún modo especial de razonamiento (thinking mode).

## Casos de uso

Los siguientes casos de uso son plausibles según el nombre del modelo y su arquitectura, pero no están documentados en la información proporcionada:

- Filtrado de correos electrónicos: el modelo puede analizar el contenido de un mensaje y clasificarlo como phishing o legítimo. Su tamaño reducido permite integrarlo en pipelines de correo con latencia baja.
- Análisis de URLs: puede procesar la descripción o el contexto de una URL para detectar enlaces maliciosos, lo que sería útil en sistemas de seguridad web.
- Detección de mensajes de texto fraudulentos: en aplicaciones de mensajería, podría clasificar SMS o mensajes instantáneos como intentos de phishing.
- Categorización de tickets de soporte: en plataformas de helpdesk, puede identificar tickets que mencionan intentos de phishing o ingeniería social, ayudando a priorizar respuestas.
- Enriquecimiento de SIEM: en sistemas de gestión de eventos de seguridad, puede procesar logs de texto para detectar patrones de phishing en los registros.
- Clasificación de contenido en redes sociales: puede detectar publicaciones que enlazan a sitios de phishing, facilitando la moderación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 66,9 millones de parámetros, el tamaño en FP32 es de aproximadamente 268 MB, y en FP16 de 134 MB. Con cuantización de 8 bits, rondaría los 67 MB.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como RTX 3050, GTX 1660 o superiores pueden ejecutarlo sin problemas. También es viable en CPU.
- Opciones de despliegue: HuggingFace Transformers con PyTorch, ONNX Runtime, o mediante la API de HuggingFace Inference. No se recomienda vLLM ni llama.cpp, ya que están orientados a modelos generativos.
- Latencia y throughput: no se han publicado datos de rendimiento en la información disponible.

## Comparativa con modelos similares

Los datos de los modelos de referencia son públicos, pero no se ha verificado que phish-v0.1 siga exactamente las mismas especificaciones:

| Modelo | Parametros | Contexto | Licencia |
|---|---|---|---|
| v3vishal/phish-v0.1 | 66,9 M | no disponible | Apache 2.0 |
| DistilBERT base (HuggingFace) | 66 M | 512 tokens | Apache 2.0 |
| BERT-base | 110 M | 512 tokens | Apache 2.0 |
| MiniLM-L6 | 22 M | 512 tokens | Apache 2.0 |

## Limitaciones y advertencias

- Documentación insuficiente para evaluar su fiabilidad en entornos de producción.
- No se especifican los datos de entrenamiento, por lo que es probable que existan sesgos no documentados.
- Al ser un modelo encoder, no genera texto, lo que limita su uso a tareas de clasificación y análisis.
- La longitud de contexto no está confirmada; se asume que puede ser de 512 tokens, pero no hay datos verificados.
- Riesgo de falsos positivos y negativos en la detección de phishing sin una evaluación previa con datos reales.
- La licencia Apache 2.0 permite uso comercial, pero no incluye garantías de soporte ni responsabilidad por el rendimiento del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/v3vishal/phish-v0.1
- Perfil del autor: https://huggingface.co/vshl3
- Paper: no disponible.
