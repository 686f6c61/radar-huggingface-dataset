# vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese-LoRa-adapter

## Resumen

Qwen3.8-27B-Uncensored-Chinese-LoRa-adapter es un adaptador LoRA (no contiene los pesos base) desarrollado por el usuario vurtnesaerdna sobre el modelo Qwen/Qwen3.8-27B. Se trata de un ajuste fino por instrucciones (SFT) orientado a la generacion de ficcion creativa en chino para adultos (18+), con el objetivo declarado de eliminar los rechazos y filtros de contenido del modelo base en ese dominio concreto. El repositorio ocupa 0,4 GB y solo contiene las matrices de bajo rango en precision fp32.

Tecnicamente es un LoRA de rango 16 y alpha 32, sin dropout ni sesgo, aplicado sobre las 64 capas del modelo base en los modulos de atencion (q, k, v, o), de atencion lineal (in_proj_qkv, in_proj_z, out_proj) y de MLP (gate, up, down). El entrenamiento uso aproximadamente 4.200 ejemplos en formato de chat con perdida calculada solo sobre los turnos del asistente, 2 epocas (1.050 pasos), learning rate 1e-4 con scheduler coseno, longitud maxima 1.536 y batch efectivo 8. La perdida de validacion final reportada es 2,96.

Su relevancia es limitada y muy especifica: se publica bajo licencia Apache 2.0, tiene 3 descargas y 2 likes en el momento de la consulta, y esta etiquetado como "not-for-all-audiences". No se han publicado benchmarks, y no hay documentacion publica sobre el modelo base Qwen3.8-27B en la informacion disponible, por lo que muchas especificaciones del modelo completo no pueden confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer; el modelo base incluye modulos de atencion lineal (linear_attn) y de atencion completa, lo que sugiere una arquitectura hibrida, aunque la model card no lo confirma |
| Parametros totales | 27B en el modelo base (el adaptador no declara su propio numero de parametros); repo del adaptador: 0,4 GB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento uso secuencias de 1.536 tokens como maximo) |
| Tipos de cuantizacion | no disponible para el adaptador (pesos en fp32); el modelo base no especifica cuantizaciones publicadas |
| Idiomas soportados | zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en fp32) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estandar de PEFT: matrices de bajo rango inyectadas en las capas del modelo base con r=16, alpha=32, dropout 0 y sin entrenamiento de sesgos. Los modulos objetivo abarcan las 64 capas del modelo de lenguaje e incluyen proyecciones de atencion completa (self_attn.q_proj, k_proj, v_proj, o_proj), proyecciones de atencion lineal (linear_attn.in_proj_qkv, in_proj_z, out_proj) y las tres proyecciones del MLP (gate_proj, up_proj, down_proj). La presencia de modulos de atencion lineal es coherente con un modelo base de tipo hibrido que combina atencion lineal con atencion completa, pero la model card no detalla la arquitectura del modelo base. El ejemplo de codigo del autor carga el modelo con la clase AutoModelForImageTextToText, lo que apunta a un modelo multimodal de imagen y texto, si bien no se confirma en la documentacion.

El entrenamiento consistio en un SFT de instrucciones en formato chat, con enmascaramiento de la perdida sobre los turnos del usuario (assistant-only loss), aproximadamente 4.200 ejemplos, 2 epocas y 1.050 pasos. Se uso learning rate 1e-4 con decaimiento coseno, batch efectivo 8 y longitud maxima de 1.536 tokens. No se menciona el uso de RLHF, DPO ni ninguna tecnica de alineacion adicional; tampoco se documenta la composicion exacta del dataset ni su procedencia. El unico dato de calidad reportado es la perdida de validacion final de 2,96, sin curva de validacion ni metricas adicionales. Los pesos se almacenan en fp32, lo que preserva precision a costa de duplicar el espacio respecto a un adaptador en bf16.

## Capacidades

- Generacion de texto creativo en chino, en concreto ficcion para adultos con contenido sexual explicito, que es el objetivo declarado del ajuste.
- Escritura narrativa de formato largo y coherente a partir de instrucciones de escritura, incluyendo descripcion de dialogos, acciones y ambientacion.
- Reduccion de rechazos en el dominio objetivo: el ajuste esta disenado para que el modelo no se niegue a producir este tipo de contenido cuando el prompt lo solicita.
- Seguimiento de un prompt de sistema concreto, que el autor documenta como parte del entrenamiento.
- Hereda del modelo base las capacidades generales de generacion, pero no se documenta ninguna evaluacion que confirme su conservacion tras el ajuste.
- Soporte de la plantilla de chat del modelo base con el parametro enable_thinking desactivado en el ejemplo del autor; no se detalla el comportamiento del modo de razonamiento tras el ajuste.
- No se documenta soporte de tool calling, function calling, uso de agentes, capacidades multilingues distintas del chino ni procesamiento de vision mas alla de la clase de carga empleada en el ejemplo.

## Casos de uso

- Generacion de ficcion adulta en chino: el adaptador esta entrenado especificamente para producir narrativa explicita coherente a partir de instrucciones de escritura, con un prompt de sistema que fija el marco de personajes adultos.
- Prototipado de asistentes de escritura creativa sin filtros para autores que trabajan en chino y necesitan borradores rapidos de escenas.
- Investigacion sobre comportamiento de rechazo y censura en modelos: permite comparar las respuestas del modelo base y del modelo ajustado ante el mismo conjunto de prompts, con el fin de estudiar como el SFT altera las tasas de negativa.
- Red teaming y evaluacion de seguridad: util para construir conjuntos de prompts adversarios en chino y medir hasta que punto un ajuste de bajo rango puede anular las barreras de seguridad del modelo original.
- Generacion de datos sinteticos etiquetados para dominios de contenido sensible, siempre que se cumplan los requisitos legales y eticos aplicables.
- Experimentacion local en hardware de consumo: al ser un adaptador de 0,4 GB, puede cargarse y descargarse sobre distintas bases sin duplicar el almacenamiento del modelo completo.
- Estudio de transferencia de estilo y tono en chino mediante LoRA de rango bajo, comparando el efecto de r=16 sobre las 64 capas frente a ajustes de mayor rango.
- Despliegue con multiples adaptadores en un mismo servidor: la integracion con vLLM permite servir el modelo base con varios LoRA intercambiables y aislar este adaptador del resto del trafico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de validacion final del entrenamiento (2,96), que no es comparable con MMLU, HumanEval, GSM8K ni con ninguna otra evaluacion estandarizada.

| Metrica | Valor | Notas |
|---|---|---|
| Perdida de validacion final | 2,96 | Reportada por el autor; sin curva ni conjunto de validacion documentado |
| MMLU | no disponible | No evaluado |
| HumanEval | no disponible | No evaluado |
| GSM8K | no disponible | No evaluado |

## Requisitos de hardware

- El adaptador en si ocupa 0,4 GB en fp32; requiere el modelo base completo para funcionar.
- Estimacion para el modelo base de 27B en bf16/fp16: en torno a 54 GB solo de pesos, mas cache KV y activaciones, lo que en la practica exige 64-80 GB de VRAM.
- Estimacion en cuantizacion de 8 bits: aproximadamente 27 GB de pesos, con 32-40 GB de VRAM recomendados.
- Estimacion en cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 15-16 GB de pesos, viable en GPUs de consumo con 24 GB.
- GPUs de consumo: cabe en una RTX 3090 o RTX 4090 (24 GB) solo con cuantizacion de 4 bits; en bf16 no cabe en ninguna GPU de consumo actual.
- GPUs de datacenter: A100 80 GB, H100 80 GB o dos A100 40 GB para bf16 sin cuantizar.
- Opciones de despliegue: transformers con peft, vLLM con --enable-lora --max-lora-rank 16, o fusion del adaptador con merge_and_unload y servicio del modelo fusionado.
- El autor documenta explicitamente la ruta de vLLM: vllm serve Qwen/Qwen3.8-27B --enable-lora --max-lora-rank 16 --lora-modules uncensored=<adaptador>.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos comparables en la informacion proporcionada. La unica comparacion posible es contra el propio modelo base y contra la alternativa de un ajuste completo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Chinese-LoRa-adapter | 27B (base) + adaptador LoRA r=16 | no disponible | Sin benchmarks; perdida de validacion 2,96 | apache-2.0 | HuggingFace, 3 descargas, 2 likes |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | no disponible | no disponible | no disponible en la informacion consultada |
| Otros adaptadores LoRA de ajuste en chino sobre modelos Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contenido para adultos: el repositorio esta etiquetado como "not-for-all-audiences" y el autor advierte de que las salidas pueden contener contenido sexual explicito. No es apto para menores ni para entornos no controlados.
- Riesgo legal y de politica de uso: el despliegue publico de este adaptador puede infringir las politicas de las plataformas de servicio, los terminos de uso del modelo base y la legislacion aplicable en distintas jurisdicciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos. El ajuste con unos 4.200 ejemplos de un unico dominio puede amplificar sesgos presentes en el modelo base y en el dataset de entrenamiento, cuya composicion no se detalla.
- Alucinacion: no hay evaluacion de factualidad. Un ajuste de este tipo puede degradar la fidelidad factual del modelo base en tareas que no sean de ficcion.
- Degradacion de capacidades generales: no se aporta ninguna evaluacion que confirme que el adaptador conserva el rendimiento del modelo base en razonamiento, codigo o matematicas tras el SFT.
- Idioma: el adaptador esta entrenado y etiquetado unicamente para chino (zh). Se desconoce su comportamiento en otros idiomas y es probable que degrade el rendimiento multilingue del modelo base.
- Contexto: no se dispone de informacion sobre la ventana de contexto soportada. El entrenamiento uso secuencias de como maximo 1.536 tokens, por lo que el comportamiento mas alla de esa longitud no esta validado.
- Licencia: el adaptador se publica como apache-2.0, pero la licencia del modelo base no se detalla en la informacion disponible; es necesario verificar las condiciones del modelo base antes de cualquier uso comercial.
- Trazabilidad: el repositorio tiene 3 descargas y 2 likes, sin historial de evaluaciones independientes. El unico punto de contacto son dos direcciones de correo, y no se documenta la procedencia del dataset.
- Formato: los pesos estan en fp32, lo que implica que la fusion con el modelo base debe gestionarse con cuidado para no aumentar innecesariamente el uso de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese-LoRa-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Listado de modelos LoRA en HuggingFace: https://huggingface.co/models?sort=modified&search=lora
- Listado de modelos de generacion de texto: https://huggingface.co/models?pipeline_tag=text-generation&p=1&sort=created
- Contacto indicado por el autor: jiang_501@hotmail.com, vurtnesaerdna@gmail.com
