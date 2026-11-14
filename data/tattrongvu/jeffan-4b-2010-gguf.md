# tattrongvu/Jeffan-4B-2010-GGUF

## Resumen

Jeffan-4B-2010-GGUF es la distribucion cuantizada en formato GGUF del modelo Jeffan-4B-2010, desarrollado por el usuario tattrongvu. No es un modelo generativo ni conversacional: es un modelo de decision estructurada que recibe un estado (un documento, una conversacion, una lista de herramientas) y una pregunta de opcion multiple, y devuelve una distribucion de probabilidad sobre cada opcion leida en un unico forward pass. La salida es probabilistica, sin generacion de texto libre.

El modelo tiene 4.205.751.296 parametros totales (aproximadamente 4,2 mil millones) y se distribuye bajo licencia Apache 2.0. Esta version GGUF esta pensada para ejecucion en CPU mediante llama.cpp y Ollama, e incluye dos cuantizaciones: Q4_K_M (2,55 GiB) y Q8_0 (4,17 GiB). El modelo base es tattrongvu/Jeffan-4B-2010, del que esta version es una cuantizacion directa.

Su relevancia radica en el enfoque: en lugar de generar respuestas, produce probabilidades calibradas sobre opciones discretas, lo que lo hace adecuado para enrutamiento, clasificacion y toma de decisiones automatizada donde se necesita una medida de confianza. Segun la model card, la version Q8_0 mantiene exactamente la misma precision que el modelo original en 1.290 preguntas de validacion (cambio de 0,0 puntos), mientras que Q4_K_M pierde solo 0,3 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atencion completa bidireccional (el archivo GGUF activa esta lectura bidireccional del prompt); detalles completos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (configurado via num_ctx/num_batch en el Modelfile y params) |
| Tipos de cuantizacion | Q4_K_M (2,55 GiB), Q8_0 (4,17 GiB); precision completa en bf16 en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp/Ollama); safetensors bf16 en el modelo base |

## Arquitectura y entrenamiento

La model card indica que el modelo emplea capas de atencion completa que leen el prompt en ambas direcciones, y que el propio archivo GGUF activa ese comportamiento. El runtime construye el prompt a partir de una plantilla incluida en el GGUF (linea de sistema, `State:`, `Question:`, `Options:` con codigos A, B, ...), de modo que el usuario solo envia el estado y la pregunta. El modelo realiza un unico forward pass y emite una probabilidad por cada opcion.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El tag `qwen3.5` sugiere una base derivada de la familia Qwen, pero no se confirma en la informacion disponible. La cuantizacion Q4_K_M se genero con una importance matrix calculada sobre prompts de decision en el formato propio del modelo, lo que preserva la precision en el dominio objetivo. Los archivos usan un layout de tensores compatible tanto con runtime antiguos (Ollama 0.40.16) como con llama.cpp actual.

## Capacidades

- Decision estructurada de opcion multiple: devuelve `choice` y `probabilities` por cada pregunta.
- Preguntas de si/no (yes/no) con probabilidad asociada.
- Manejo de estados heterogeneos: documentos, conversaciones, listas de herramientas.
- Multiples preguntas en una misma peticion (objeto `questions` con varias entradas).
- Ejecucion en CPU sin GPU, mediante llama.cpp y Ollama.
- Endpoint compatible con `/v1/systemone` en llama-server y en la API de Ollama.
- No genera texto libre ni mantiene conversacion: las rutas de texto (`/api/generate`, `/api/chat`, `/v1/chat/completions`) rechazan el modelo con error.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket, el modelo asigna probabilidad a cada equipo (facturacion, envios, soporte tecnico). En el ejemplo de la model card, Q4_K_M asigna 0,968 a "Shipping damage claims" para un ticket de pantalla rota.
- Clasificacion de documentos entrantes: clasificar correos, formularios o incidencias en categorias predefinidas con una probabilidad por categoria, util para triaje automatico.
- Decisiones binarias automatizadas: preguntas de si/no (por ejemplo, "Should we refund?") con probabilidad de respuesta, integrables en flujos de aprobacion.
- Enrutamiento de herramientas en agentes: dado un estado y una lista de herramientas, el modelo puede puntuar cual es la mas adecuada, sirviendo como selector previo a un LLM generativo.
- Moderacion y filtrado: puntuar opciones discretas sobre contenido o acciones (aprobar, rechazar, escalar) con umbral de confianza.
- Ejecucion en entornos sin GPU: al correr en CPU con llama.cpp u Ollama, encaja en servidores modestos o dispositivos edge donde no hay acelerador.
- Sistemas de decision auditables: al devolver probabilidades en lugar de texto, facilita el registro y la revision de decisiones con umbrales explicitos.

## Benchmarks y rendimiento

La model card reporta la comparacion entre los archivos GGUF y el modelo original en 1.290 preguntas de validacion (precision del modelo original: 79,3 %):

| Archivo | Mismas respuestas que el original (de 1.290) | Cambio de precision [IC 95 %] |
|---|---:|---|
| Q4_K_M | 1.259 | -0,3 puntos [-1,0; +0,5] |
| Q8_0 | 1.284 | 0,0 puntos [-0,3; +0,3] |

Ademas, en 25 de 300 preguntas retenidas el runtime estandar produce 1-3 tokens menos en un limite, y 1 de las 300 respuestas cambio en esa prueba. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica en el caso CPU; en GPU, el modelo requiere aproximadamente el tamano del archivo mas overhead (Q4_K_M 2,55 GiB, Q8_0 4,17 GiB).
- Memoria RAM en CPU: 6-7 GiB con Q4_K_M y 10-11 GiB con Q8_0 (pico de memoria residente de un proceso llama.cpp con prompts de hasta 8.000 tokens en CPU con AMX, que mantiene una segunda copia repackada de los pesos).
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo esta orientado a CPU.
- Cabe en GPU consumer: por tamano, Q4_K_M cabria en GPUs con 8 GB o mas, pero no se confirma soporte ni rendimiento en GPU.
- Opciones de despliegue: llama.cpp (build con `/v1/systemone`, probado con `b79696f1f`), llama-server, Ollama (0.40.5 o superior; probado con 0.40.16), y el modelo base con transformers y motores GPU.
- Latencia y throughput: no disponibles. Se indica que el modelo lee el prompt completo de una vez, por lo que `num_batch` debe igualar a `num_ctx` (8192); con el valor por defecto de Ollama (512) se rechazan prompts de mas de 512 tokens.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de decision estructurada de tamano similar en la documentacion proporcionada. La comparativa con alternativas generativas de ~4B (por ejemplo, modelos de chat de la familia Qwen o Llama) no seria homogenea, ya que Jeffan no genera texto. Datos comparativos: no disponibles.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no produce texto libre y las rutas de chat/generacion lo rechazan con error.
- Requiere configurar `num_batch` igual a `num_ctx` (8192); con el valor por defecto de Ollama se rechazan prompts largos.
- Diferencia de tokenizacion frente al codigo original: en 25 de 300 preguntas retenidas se generan 1-3 tokens menos en un limite, con 1 respuesta cambiada de 300.
- Las respuestas que cambian entre cuantizaciones suelen ser decisiones ajustadas (opciones con diferencia menor de 0,2 de probabilidad).
- Idiomas soportados no especificados: riesgo de comportamiento degradado fuera del idioma de entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera del dominio de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base.
- Uso en produccion: conviene validar la calibracion de probabilidades y fijar umbrales de confianza antes de automatizar decisiones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tattrongvu/Jeffan-4B-2010-GGUF
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-4B-2010
- Archivo Q4_K_M: https://huggingface.co/tattrongvu/Jeffan-4B-2010-GGUF/blob/main/Jeffan-4B-2010-Q4_K_M.gguf
- Archivo Q8_0: https://huggingface.co/tattrongvu/Jeffan-4B-2010-GGUF/blob/main/Jeffan-4B-2010-Q8_0.gguf
- Checksums: https://huggingface.co/tattrongvu/Jeffan-4B-2010-GGUF/blob/main/SHA256SUMS
