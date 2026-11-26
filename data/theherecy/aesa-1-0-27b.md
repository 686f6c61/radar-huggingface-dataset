# TheHerecy/Aesa-1.0-27B

## Resumen

Aesa 1.0 27B es un modelo de lenguaje de 27.781 millones de parametros desarrollado por TheHerecy, publicado como un merge completo en BF16 del adaptador QLoRA "Aesa 27B QLoRA v1" sobre el checkpoint abliterado huihui-ai/Huihui-Qwen3.8-27B-abliterated. Su proposito declarado es actuar como copiloto de uso de herramientas al estilo Hermes para pruebas de penetracion autorizadas e ingenieria de seguridad: reconocimiento, triaje, razonamiento sobre CVE, invocacion de herramientas y redaccion de informes de engagement.

El modelo hereda la arquitectura `qwen3_5` del checkpoint base (Qwen3_5ForConditionalGeneration), una torre de texto hibrida de 64 capas con 48 capas Gated DeltaNet y 16 capas de atencion completa, ademas de la torre de vision y la cabeza MTP originales, que no fueron modificadas. El entrenamiento se realizo con QLoRA sobre una base cuantizada en 4 bits NF4 usando Axolotl y PEFT, con un total de 156 pasos (aproximadamente 3 epocas).

La relevancia del modelo radica en su orientacion explicita a la anti-fabricacion: segun el autor, fue entrenado para admitir cuando no sabe algo y para no inventar CVE, hosts, salidas de comandos ni resultados de herramientas, manteniendo las afirmaciones ligadas a la evidencia proporcionada. Se publica bajo licencia Apache-2.0, con builds GGUF en Q8_0 y Q6_K. A fecha de la informacion disponible, el repositorio no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration: torre de texto hibrida de 64 capas (48 Gated DeltaNet + 16 de atencion completa), torre de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (merge completo); GGUF Q8_0 y Q6_K publicados en repositorio separado; base de entrenamiento en 4-bit NF4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte del checkpoint huihui-ai/Huihui-Qwen3.8-27B-abliterated, una variante abliterada de la familia Qwen3.5. La torre de texto combina 48 capas Gated DeltaNet con 16 capas de atencion completa, un esquema hibrido que alterna mecanismos de estado recurrente con atencion clasica. Se conservan la torre de vision y la cabeza MTP (multi-token prediction) del modelo base, sin modificaciones. El merge se realizo en BF16 directamente sobre los shards safetensors del checkpoint base aplicando `W' = W + (alpha/r) * B @ A` sobre las 400 matrices objetivo del LoRA, calculado en fp32 y almacenado en bf16; se mantienen el layout de shards, la configuracion, el tokenizer y la plantilla de chat del modelo base.

El entrenamiento consistio en un QLoRA con Axolotl 0.21.2.dev0 y PEFT 0.21.2 sobre base 4-bit NF4, con r = 64, alpha = 128 y dropout 0.05. Los modulos objetivo fueron q/k/v/o_proj, gate/up/down_proj y linear_attn.in_proj_qkv, in_proj_z y out_proj, solo en la torre de texto. Se ejecutaron 156 pasos (unas 3 epocas) con batch efectivo de 16 secuencias empaquetadas de 16K tokens, learning rate 2e-4, sobre una unica H100 de 80 GB. La perdida de entrenamiento final reportada es de aproximadamente 6,9 como media del run. El conjunto de datos es una mezcla SFT privada de trayectorias de pentest, CVE, uso de herramientas y persona. El adaptador tiene sha256 `f512853fa589f1069c8255ee3d760a73a6403261356879f1c7c6e3073f4cf451` y se publica tambien por separado.

## Capacidades

- Generacion de texto conversacional y razonamiento en el dominio de seguridad ofensiva autorizada y ingenieria de seguridad.
- Uso de herramientas al estilo Hermes (tool calling / function calling) para invocar comandos y utilidades externas.
- Razonamiento sobre CVE y triaje de vulnerabilidades.
- Soporte de vision heredado de la torre de vision del modelo base (image-text-to-text), no reentrenada.
- Capacidad de prediccion multi-token (cabeza MTP) heredada del modelo base.
- Comportamiento anti-fabricacion entrenado explicitamente: declarar desconocimiento en lugar de inventar CVE, hosts, salidas o resultados de herramientas.
- Redaccion de informes de engagement.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de pensamiento (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Copiloto de reconocimiento en pentest autorizado: el modelo puede recibir la salida de herramientas de escaneo y razonar sobre ella manteniendo las conclusiones ligadas a la evidencia, gracias al entrenamiento anti-fabricacion.
- Triaje de vulnerabilidades y razonamiento sobre CVE: util para priorizar hallazgos y explicar el impacto de un CVE concreto a partir de los datos aportados en el contexto.
- Automatizacion de tool calling en pipelines de seguridad: al estar entrenado en uso de herramientas estilo Hermes, encaja en flujos donde el modelo decide que utilidad invocar y con que argumentos.
- Redaccion de informes de engagement: genera borradores de hallazgos, descripciones y recomendaciones a partir de las notas y salidas reales del ejercicio.
- Analisis de capturas y evidencia visual: la torre de vision heredada permite procesar imagenes (por ejemplo, capturas de pantalla de paneles o terminales) junto con texto.
- Asistente de ingenieria de seguridad en revision de configuraciones: puede contrastar configuraciones aportadas por el usuario y senalar desviaciones sin inventar valores no presentes.
- Formacion y laboratorios: al estar abliterado y orientado a seguridad, puede emplearse en entornos controlados de aprendizaje, siempre con autorizacion explicita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPU de 80 GB para contexto amplio.
- Cuantizaciones GGUF Q8_0 y Q6_K disponibles en TheHerecy/Aesa-1.0-27B-GGUF, que reducen el requisito de VRAM frente a BF16 (los valores exactos por cuantizacion no se detallan en la informacion disponible).
- GPU recomendadas: H100 80 GB (la empleada en el entrenamiento); A100 80 GB como alternativa de capacidad similar.
- GPU de consumo: no se confirma que quepa en GPU de consumo en BF16; las builds GGUF Q6_K y Q8_0 podrian permitir despliegue en GPUs con menos VRAM, pero no se aportan cifras verificadas.
- Opciones de despliegue: transformers (libreria declarada); llama.cpp u Ollama para las builds GGUF; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Aesa-1.0-27B | 27,78 B | no disponible | Apache-2.0 | Finetune QLoRA orientado a pentest sobre base abliterada Qwen3.5 |
| Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | no disponible | Modelo base abliterado sin el finetune de seguridad |
| TheHerecy/Aesa-1.0-27B-LoRA | adaptador | no disponible | Apache-2.0 | Adaptador QLoRA original, requiere el modelo base |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base es abliterado: presenta rechazos reducidos y el autor advierte que el usuario es responsable de un uso legal y autorizado.
- Riesgo de alucinacion: aunque el entrenamiento busca la anti-fabricacion, no hay garantia de que el modelo no invente CVE, hosts o salidas de herramientas en todos los casos.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto e idiomas: no disponibles; la longitud de contexto y los idiomas soportados no se documentan.
- Licencia Apache-2.0: permite uso comercial segun los terminos de dicha licencia, pero las restricciones derivadas del modelo base abliterado deben verificarse en su propia model card.
- El repositorio registra 0 descargas y 0 interacciones, por lo que no existe validacion externa publica del modelo.
- El conjunto de datos de entrenamiento es privado, lo que limita la auditabilidad de los sesgos y del comportamiento aprendido.
- Solo se publican cuantizaciones GGUF Q8_0 y Q6_K; no hay cuantizaciones mas agresivas documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheHerecy/Aesa-1.0-27B
- Adaptador LoRA: https://huggingface.co/TheHerecy/Aesa-1.0-27B-LoRA
- Builds GGUF: https://huggingface.co/TheHerecy/Aesa-1.0-27B-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
