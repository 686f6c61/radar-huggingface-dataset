# SourinC/qwen2.5-vl-3b-email-sms-spam-rslora-4bit

## Resumen

SourinC/qwen2.5-vl-3b-email-sms-spam-rslora-4bit es un ajuste fino multimodal del modelo Qwen/Qwen2.5-VL-3B-Instruct (3.754.622.976 parametros) especializado en la deteccion de spam, phishing y smishing en correos electronicos y mensajes SMS. Lo desarrolla el usuario independiente SourinC y se publica bajo la licencia Qwen Research. El modelo parte de la arquitectura vision-language de Qwen2.5-VL y se adapta mediante rsLoRA (r=16, alpha=16) y cuantizacion NF4 de doble cuantizacion, dando como resultado un artefacto autonomo de 2,30 GiB.

El problema que aborda es concreto: clasificar capturas de pantalla de clientes de correo de escritorio o de aplicaciones de mensajeria movil directamente desde los pixeles, sin necesidad de un OCR externo, y emitir un veredicto estructurado con canal, vector de amenaza y analisis de seguridad. Tambien admite deteccion hibrida combinando texto sin procesar con graficos de telemetria de riesgo.

Su relevancia practica reside en el tamano: al estar fusionado y cuantizado a 4 bits, se carga en aproximadamente 2,7 GiB de VRAM, lo que permite desplegarlo en GPU de consumo y en entornos con presupuesto de memoria muy limitado, sin descargar los 7,0 GiB del modelo base en FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen2.5-VL) con ajuste rsLoRA |
| Parametros totales | 3.754.622.976 (3,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits NF4 con doble cuantizacion (bitsandbytes); pesos en safetensors |
| Idiomas soportados | no disponibles |
| Licencia | qwen-research (Qwen Research License Agreement) |
| Formato de pesos | safetensors (4 bits NF4), con AutoProcessor |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura multimodal de Qwen2.5-VL-3B-Instruct, un transformer que procesa conjuntamente imagenes y texto (pipeline image-text-to-text). Sobre esa base se aplico un ajuste fino con Rank-Stabilized LoRA de rango 16 y alpha 16, y posteriormente se fusionaron los adaptadores y se cuantizo el resultado a 4 bits NF4 con doble cuantizacion, generando un artefacto autonomo que no requiere el modelo base en FP16.

Los datos de entrenamiento son exclusivamente corpus open source, sin datos sinteticos generados por LLM: el dataset Deysi/spam-detection-dataset (licencia Apache-2.0) para correos electronicos y DarkNeuronAI/spam-sms-collection-01 (licencia MIT) para SMS y mensajes moviles. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion destacable es el enfoque de deteccion directa desde pixeles (screenshot-only) sin OCR intermedio, junto con el formato de salida estructurado (Verdict, Channel, Threat Vector, Analysis).

## Capacidades

- Deteccion de spam y smishing directamente desde capturas de pantalla de clientes de correo de escritorio o de aplicaciones de mensajeria movil, leyendo el contenido del mensaje desde la imagen sin OCR externo.
- Deteccion hibrida multimodal: analisis conjunto de graficos de telemetria de riesgo lexico y del texto sin procesar del correo o mensaje.
- Salida estructurada con veredicto (SPAM o LEGITIMATE), canal (Email o SMS), vector de amenaza y analisis de seguridad de una o dos frases.
- Procesamiento de imagen y texto de forma conversacional (pipeline image-text-to-text, plantilla de chat de Qwen2.5-VL).
- Capacidades heredadas del modelo base Qwen2.5-VL-3B-Instruct en vision y lenguaje, aunque el ajuste esta orientado a la tarea de clasificacion de spam.
- Soporte de tool calling, agentes y modo thinking: no disponible en la informacion proporcionada para este ajuste.

## Casos de uso

- Filtrado de correo corporativo: el modelo puede recibir capturas de pantalla del cliente de correo y emitir un veredicto SPAM/LEGITIMATE con vector de amenaza, integrable en flujos de triaje humano antes de la cuarentena.
- Deteccion de smishing en atencion al cliente: analisis de capturas de SMS o chats moviles reenviadas por usuarios para identificar intentos de phishing y generar una explicacion de seguridad al operador.
- Modulo de seguridad en aplicaciones de mensajeria: verificacion local de capturas de pantalla en el dispositivo o en un servidor con GPU de consumo gracias a su huella de aproximadamente 2,7 GiB de VRAM.
- Analisis de telemetria de riesgo: combinacion de graficos de puntuacion de riesgo con el texto del mensaje para enriquecer el veredicto en paneles de seguridad (SOC).
- Generacion de informes de triaje: la salida estructurada (canal, vector, analisis) se puede volcar directamente a tickets o colas de revision sin postprocesado complejo.
- Prototipado e investigacion en deteccion de spam multimodal: base ligera y de bajo coste para experimentar con clasificacion desde pixeles sin OCR, con datasets publicos de licencia permisiva.

## Benchmarks y rendimiento

Evaluacion sobre conjunto de test reservado (held-out), segun la model card:

| Modelo | Accuracy | Spam Precision | Spam Recall | Spam F1 | False Positive Rate |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B base (zero-shot) | 0,7188 | 0,64 | 1,0 | 0,7805 | 0,5625 |
| rsLoRA fine-tuned spam expert | 0,9375 | 1,0 | 0,875 | 0,9333 | 0,0 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GiB en GPU con la cuantizacion 4 bits NF4 incluida; el artefacto pesa 2,30 GiB.
- GPU recomendadas: cualquier GPU con al menos 3-4 GiB de VRAM libre; cabe en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, y en GPUs de datacenter (A100, H100) sin problema.
- Despliegue: transformers con `Qwen2_5_VLForConditionalGeneration` y `AutoProcessor`, `device_map="auto"`; compatible con endpoints de Hugging Face (tag endpoints_compatible). Opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas en la informacion proporcionada para este artefacto cuantizado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SourinC/qwen2.5-vl-3b-email-sms-spam-rslora-4bit | 3,75B | no disponible | Spam/smishing multimodal 4 bits | qwen-research | Hugging Face |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3,75B | no disponible | Vision-language general | qwen-research | Hugging Face |
| Modelos especializados en spam solo texto | no disponible | no disponible | Clasificacion de texto | variable | no disponible |

La comparativa directa con alternativas especializadas en deteccion de spam multimodal no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia medible es la accuracy en el test reservado (0,9375 frente a 0,7188) y la reduccion de falsos positivos (0,0 frente a 0,5625), a costa de un recall de spam algo menor (0,875 frente a 1,0).

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es necesario revisar el Qwen Research License Agreement antes de cualquier despliegue en produccion.
- El conjunto de evaluacion es reducido y de dominio acotado (correos y SMS); el rendimiento puede degradarse con capturas de baja calidad, idiomas distintos o formatos de cliente no vistos.
- Recall de spam de 0,875: aproximadamente un 12,5 % de los spam del test no se detectan, por lo que no debe usarse como unico filtro de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje: el campo Analysis puede contener justificaciones plausibles pero incorrectas.
- Idiomas soportados no documentados; el entrenamiento se basa en datasets publicos cuya composicion linguistica no se detalla.
- Los datasets de entrenamiento tienen licencias Apache-2.0 y MIT, pero el modelo derivado queda bajo la licencia del modelo base.
- Sin datos publicados sobre sesgos, contexto maximo efectivo ni comportamiento con entradas adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SourinC/qwen2.5-vl-3b-email-sms-spam-rslora-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Dataset de correos: https://huggingface.co/datasets/Deysi/spam-detection-dataset
- Dataset de SMS: https://huggingface.co/datasets/DarkNeuronAI/spam-sms-collection-01
