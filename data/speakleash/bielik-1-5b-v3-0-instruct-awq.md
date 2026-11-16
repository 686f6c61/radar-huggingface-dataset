# speakleash/Bielik-1.5B-v3.0-Instruct-AWQ

## Resumen

Bielik-1.5B-v3.0-Instruct-AWQ es la versión cuantizada en 4 bits mediante AWQ (Activation-aware Weight Quantization) del modelo instructivo Bielik-1.5B-v3.0-Instruct, desarrollado por SpeakLeash, una comunidad polaca centrada en la creación de recursos lingüísticos y modelos de lenguaje de código abierto para el idioma polaco. El modelo original forma parte de la familia Bielik, diseñada específicamente para tareas en polaco, y esta variante AWQ reduce el peso y los requisitos de memoria para facilitar su despliegue en hardware más modesto.

El modelo cuenta con 1.596.507.648 parámetros (aproximadamente 1.5 mil millones), está construido sobre la arquitectura Llama y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su propósito principal es ofrecer generación de texto e instrucciones en polaco con un coste computacional reducido, siendo adecuado para aplicaciones de inferencia en producción donde los recursos de GPU son limitados.

La relevancia de esta ficha radica en que combina dos factores: por un lado, la especialización lingüística en polaco de la familia Bielik, y por otro, la eficiencia de la cuantización AWQ de 4 bits, que reduce el tamaño del repositorio a 1.1 GB y permite ejecutar el modelo en GPUs de consumo. No obstante, la información pública disponible sobre el modelo es limitada: la model card es extremadamente escueta y no se han publicado detalles sobre datos de entrenamiento, benchmarks o limitaciones específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 1.596.507.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ 4-bit (pesos cuantizados); el modelo base admite otras cuantizaciones no especificadas |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura del modelo corresponde a un transformer decoder-only de tipo Llama, tal como indican las etiquetas del repositorio y el formato de pesos. El modelo base, Bielik-1.5B-v3.0-Instruct, es un modelo instructivo afinado por SpeakLeash, pero la model card de esta versión cuantizada no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO.

La innovación técnica principal de esta variante es la aplicación de AWQ (Activation-aware Weight Quantization) en 4 bits, que cuantiza los pesos teniendo en cuenta la importancia de las activaciones para preservar la precisión. El repositorio utiliza el formato compressed-tensors, lo que facilita su integración con librerías de inferencia compatibles. No se dispone de información sobre la revisión exacta del modelo base más allá del hash `1907cec498b762e8223b7cffc2b8f279c417a44d`, ni sobre procesos de decodificación especulativa u otras optimizaciones.

## Capacidades

- Generación de texto en polaco: el modelo está entrenado y ajustado para producir texto coherente en dicho idioma.
- Instrucciones y diálogo: al ser una versión instructiva, responde a comandos y preguntas formuladas en polaco.
- Razonamiento básico y tareas de conocimiento general: capacidad limitada por su tamaño de 1.5B parámetros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al polaco según la etiqueta de idioma; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en polaco: el modelo puede gestionar conversaciones multi-turno en polaco para consultas frecuentes, con un coste de inferencia reducido gracias a la cuantización AWQ de 4 bits.
- Generación de contenido editorial en polaco: redacción de borradores, resúmenes y paráfrasis para medios o blogs en lengua polaca, aprovechando su especialización lingüística.
- Procesamiento de formularios y textos administrativos: extracción y reformulación de información en polaco para flujos de back-office, con despliegue en GPUs de consumo.
- Asistentes locales y privados: al caber en GPUs consumer y tener un tamaño de repositorio de 1.1 GB, puede ejecutarse en entornos locales sin conexión, útil para aplicaciones con requisitos de privacidad.
- Prototipado rápido de aplicaciones NLP en polaco: investigadores y desarrolladores pueden validar ideas con un modelo ligero antes de escalar a modelos mayores.
- Educación y tutoría automatizada: generación de explicaciones y ejercicios en polaco para plataformas educativas, con latencia baja en hardware modesto.
- Clasificación y etiquetado de textos: uso del modelo como base para tareas de clasificación o generación de etiquetas en pipelines de datos en polaco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de pesos AWQ de 4 bits, el modelo ocupa aproximadamente 1.1 GB en disco; en memoria, se estima un uso de VRAM en torno a 1.5-2.5 GB incluyendo overhead de activaciones y contexto, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: GPUs de consumo como RTX 3060, RTX 4060, RTX 4090; también cabe en GPUs de数据中心 como A100 o H100, aunque no son necesarias.
- Cabe en consumer GPU: sí, en la mayoría de GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: al usar formato compressed-tensors y AWQ, es compatible con librerías como vLLM (con soporte AWQ), AutoAWQ, y potencialmente llama.cpp si se convierte a GGUF; no se documentan otras opciones en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Bielik-1.5B-v3.0-Instruct-AWQ | 1.5B | no disponible | Apache 2.0 | Hugging Face |
| Bielik-1.5B-v3.0-Instruct (base) | 1.5B | no disponible | Apache 2.0 | Hugging Face |
| Otros modelos polacos de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar el rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al ser un modelo entrenado principalmente en polaco, puede reflejar sesgos culturales y lingüísticos de los datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 1.5B parámetros; la cuantización AWQ puede incrementar ligeramente la pérdida de precisión en tareas complejas.
- Limitaciones de contexto o idioma: el modelo está especializado en polaco y no se documenta soporte para otros idiomas; la longitud de contexto no está especificada.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y distribución, siempre que se mantengan los avisos de copyright y licencia.
- Caveats para producción: la model card es mínima y no proporciona garantías sobre calidad, seguridad o robustez; se recomienda validar el modelo en el dominio específico antes de desplegarlo. La cuantización AWQ de 4 bits puede degradar el rendimiento en tareas que requieren alta precisión numérica o razonamiento complejo.

## Enlaces

- Hugging Face: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct-AWQ
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Organización SpeakLeash: https://huggingface.co/speakleash
