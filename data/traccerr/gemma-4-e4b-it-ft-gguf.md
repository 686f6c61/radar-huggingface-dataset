# TRACCERR/gemma-4-E4B-it-FT-GGUF

## Resumen

`TRACCERR/gemma-4-E4B-it-FT-GGUF` es una publicacion de pesos cuantizados en formato GGUF de un ajuste fino del modelo `unsloth/gemma-4-E4B-it`, un modelo multimodal de la familia Gemma 4 en su variante "E4B" (aproximadamente 8.000 millones de parametros segun los ficheros safetensors del repositorio). El ajuste fino original fue desarrollado por Prompt48 y entrenado con la libreria Unsloth y TRL, y esta version GGUF la distribuye el usuario TRACCERR para facilitar su despliegue en entornos de inferencia locales. El modelo resuelve el caso de uso de atencion al cliente automatizada en ingles: se ha especializado sobre el dataset Bitext Customer Support LLM Chatbot Training Dataset, que cubre 10 categorias y 27 intenciones de soporte.

La relevancia de esta ficha radica en que combina tres elementos practicos: una base multimodal (etiqueta `image-text-to-text`), un ajuste fino orientado a un dominio concreto (soporte al cliente) y una distribucion en cuantizaciones ligeras (IQ3_M, IQ4_NL, Q4_K_M) que permiten ejecutar el modelo en hardware de consumo. El repositorio incluye tanto los ficheros GGUF como los safetensors originales del ajuste fino, lo que simplifica la trazabilidad entre la version completa y las versiones cuantizadas.

El modelo esta publicado bajo licencia Apache 2.0 y declara soporte unicamente para ingles. No se han publicado resultados de benchmarks en la informacion disponible, por lo que las afirmaciones sobre rendimiento deben tratarse con cautela hasta que existan evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, variante E4B); detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (aprox. 8,0 mil millones) |
| Parametros activos | No disponible (no se declara como MoE en la informacion) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ3_M (4,4 GB, 5,00 BPW), IQ4_NL (4,9 GB, 5,53 BPW), Q4_K_M (5,0 GB, 5,66 BPW); safetensors originales incluidos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `unsloth/gemma-4-E4B-it` mas alla de su caracter multimodal (pipeline `image-text-to-text`) y de su pertenencia a la familia Gemma 4. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Los parametros totales declarados en los ficheros safetensors son 7.996.156.490, lo que situa al modelo en la franja de 8 mil millones de parametros.

El ajuste fino se realizo sobre el dataset Bitext Customer Support LLM Chatbot Training Dataset, compuesto por 26.872 pares pregunta/respuesta (aproximadamente 1.000 por intencion) con un total de 3,57 millones de tokens. Cada muestra incluye los campos `flags`, `instruction`, `category`, `intent` y `response`. El dataset cubre 10 categorias (ACCOUNT, CANCELLATION_FEE, DELIVERY, FEEDBACK, INVOICE, NEWSLETTER, ORDER, PAYMENT, REFUND, SHIPPING_ADDRESS) y 27 intenciones, con 12 etiquetas de variacion linguistica y 30 tipos de entidades o slots. El entrenamiento se realizo con Unsloth y TRL, segun declara la model card, con una aceleracion de 2x respecto al entrenamiento estandar. No se especifican el numero de epochs, la tasa de aprendizaje, el uso de RLHF/DPO ni la composicion completa del dataset de preentrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dominios de soporte al cliente.
- Procesamiento de entradas de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base Gemma 4.
- Respuesta a instrucciones estructuradas con categorias e intenciones de soporte (cuenta, cancelacion, entrega, facturacion, pedidos, pagos, reembolsos, direcciones de envio, newsletter y feedback).
- Manejo de variaciones linguisticas y entidades o slots propios de conversaciones de atencion al cliente.
- Capacidad multilingue limitada: solo se declara ingles.
- Soporte de tool calling y function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion.
- Capacidades de audio: no disponible en la informacion.

## Casos de uso

- Atencion al cliente automatizada en ingles: el ajuste fino sobre el dataset Bitext permite gestionar consultas de cuentas, pedidos, pagos y reembolsos con respuestas alineadas a las 27 intenciones cubiertas, lo que reduce la necesidad de ingenieria de prompts especifica por dominio.
- Clasificacion y enrutamiento de tickets: el modelo puede identificar la categoria e intencion de una consulta entrante (por ejemplo, ORDER > cancel o PAYMENT > payment_issue) y derivarla al equipo o flujo adecuado.
- Generacion de respuestas de primer nivel en chats de soporte: adecuado para borradores de respuesta que un agente humano revisa antes de enviar, gracias a su entrenamiento sobre pares pregunta/respuesta reales de soporte.
- Extraccion de entidades y slots en conversaciones: los 30 tipos de entidades del dataset permiten usar el modelo para poblar campos estructurados (numero de pedido, metodo de pago, direccion) en sistemas CRM.
- Prototipado rapido en local: las cuantizaciones IQ3_M, IQ4_NL y Q4_K_M (entre 4,4 y 5,0 GB) permiten desplegar el modelo en estaciones de trabajo con GPU de consumo para pruebas de concepto de chatbots.
- Analisis de imagenes en contextos de soporte: al heredar la naturaleza multimodal del modelo base, puede procesar capturas de pantalla o documentos enviados por clientes, aunque no se documenta el rendimiento especifico en esta tarea tras el ajuste fino.
- Evaluacion comparativa de ajustes finos: util para investigadores que quieran medir el efecto de un ajuste fino de dominio sobre una base Gemma 4 E4B frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para IQ3_M, 5-6 GB para IQ4_NL y 5,5-6,5 GB para Q4_K_M, considerando pesos mas overhead de contexto y cache KV (estimacion orientativa; no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB deberian poder alojar las cuantizaciones con margen; A100 y H100 quedan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM para las cuantizaciones publicadas.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; los safetensors permiten usar transformers y TGI (etiqueta `text-generation-inference`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TRACCERR/gemma-4-E4B-it-FT-GGUF | ~8,0 B | No disponible | Apache 2.0 | GGUF, safetensors | Ajuste fino de dominio (soporte al cliente), solo ingles |
| unsloth/gemma-4-E4B-it (base) | ~8,0 B | No disponible | Apache 2.0 (segun modelo base) | safetensors | Modelo base multimodal sin ajuste de dominio |
| Prompt48/gemma-4-E4B-it-FT | ~8,0 B | No disponible | Apache 2.0 | safetensors | Ajuste fino original del que deriva esta publicacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles; su uso en castellano u otros idiomas no esta validado y probablemente degrade la calidad.
- El ajuste fino esta acotado al dominio de soporte al cliente del dataset Bitext; fuera de ese ambito el rendimiento puede ser inferior al del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en contextos de atencion al cliente puede generar respuestas plausibles pero incorrectas sobre pedidos, pagos o reembolsos.
- Sesgos conocidos: no documentados por el autor; el dataset Bitext puede introducir sesgos propios de su composicion y de la variacion linguistica recogida.
- No se han publicado evaluaciones de benchmarks que permitan verificar la calidad del ajuste fino frente al modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (Bitext) tiene licencia CDLA-Sharing-1.0, lo que conviene revisar si se redistribuye el modelo o se generan obras derivadas.
- La model card incluye una imagen y texto sobre escritura cuneiforme que no guarda relacion con el modelo descrito, lo que sugiere posibles errores de publicacion; conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- El autor del ajuste fino original (Prompt48) y el publicador de esta version GGUF (TRACCERR) son distintos; no se documenta un proceso de validacion por parte del publicador.
- No se especifican la longitud de contexto ni el rendimiento en tareas multimodales tras el ajuste fino.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TRACCERR/gemma-4-E4B-it-FT-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Ajuste fino original: https://huggingface.co/Prompt48/gemma-4-E4B-it-FT
- Dataset Bitext: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- Unsloth (repositorio): https://github.com/unslothai/unsloth
