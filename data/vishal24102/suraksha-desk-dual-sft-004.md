# vishal24102/suraksha-desk-dual-sft-004

## Resumen

SurakshaDesk Dual SFT 004 es un ajuste fino supervisado del modelo Qwen2.5-3B-Instruct orientado a la triaje de disputas de pagos UPI y deteccion de fraude en el contexto del sistema de pagos instantaneos indio. A partir de un unico mensaje de cliente, el modelo genera simultaneamente un JSON estricto de 8 campos (UTR, categoria de disputa, importe, retraso en la notificacion, nivel de responsabilidad segun RBI, acciones obligatorias, idioma y severidad de panico) y una respuesta al cliente. Lo desarrolla el usuario vishal24102 en el marco del proyecto SurakshaDesk, con codigo y documentacion en el repositorio suraksha-merge de GitHub.

El modelo parte de la arquitectura transformer densa de Qwen2.5-3B-Instruct (3.000 millones de parametros) y se entrena mediante QLoRA (NF4 de 4 bits, LoRA con r=16 y alpha=32 sobre todas las proyecciones de atencion y MLP, perdida solo en turnos del asistente) durante 183 pasos, alcanzando una perdida final de entrenamiento de 0,307. El conjunto de datos son 810 casos sinteticos revisados por un unico revisor con preauditoria por IA, publicados como vishal24102/suraksha-desk-upi-reviewed-v3.

Es relevante ahora porque aborda un nicho muy concreto (triaje de disputas UPI en India) con un modelo pequeno que cabe en una GPU de portatil de 6 GB (RTX 4050) y produce salidas estructuradas auditables. No obstante, se trata de una vista previa de investigacion entrenada solo con datos sinteticos, no evaluada con mensajes reales y sin conexion a ningun banco, por lo que su uso en produccion queda restringido a generar borradores para revision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 3.000 millones (aproximado, heredado de Qwen2.5-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | Entrenamiento en NF4 4-bit (QLoRA); pesos publicados en bf16; no se documentan otros formatos |
| Idiomas soportados | Ingles (en), hindi en devanagari (hi) y hinglish romanizado |
| Licencia | Qwen Research License (qwen-research): solo investigacion y uso no comercial |
| Formato de pesos | safetensors (modelo completo con LoRA fusionado, bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder-only basado en Qwen2.5-3B-Instruct, sin mezcla de expertos ni mecanismos alternativos como SSM o atencion lineal. El ajuste se realiza con QLoRA: cuantizacion NF4 de 4 bits del modelo base, adaptadores LoRA con rango 16 y alpha 32 aplicados a todas las proyecciones de atencion y MLP, y calculo de perdida exclusivamente sobre los turnos del asistente (assistant-only loss). El entrenamiento consta de 183 pasos con una perdida final de 0,307 y se ejecuto en una unica GPU de portatil RTX 4050 con 6 GB de VRAM.

Los datos de entrenamiento son 810 casos sinteticos revisados por un unico revisor con preauditoria por IA, publicados en el dataset vishal24102/suraksha-desk-upi-reviewed-v3. El modelo aprende dos tareas simultaneas: la generacion del JSON estricto de 8 campos y la redaccion de la respuesta al cliente. El prompt de inferencia debe replicar exactamente el formato de entrenamiento (instruccion, contrato JSON, politica del RBI, contexto del operador y mensaje del cliente enmascarado), definido en la funcion prompt_for del repositorio GitHub. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles, hindi (devanagari) y hinglish romanizado.
- Extraccion estructurada de campos: UTR, categoria de disputa, importe, retraso en la notificacion, nivel de responsabilidad segun RBI, acciones obligatorias, idioma y severidad de panico.
- Clasificacion de disputas de pago UPI y deteccion de fraude a partir de un mensaje de cliente.
- Redaccion de respuestas al cliente en el mismo idioma del mensaje recibido.
- Generacion de JSON estricto conforme a un contrato de 8 campos.
- Modo de autoridad del modelo: el modelo redacta la respuesta completa y los chequeos solo la senalan para revision.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Triaje de disputas UPI en centros de atencion: el modelo recibe el mensaje del cliente y genera el JSON de 8 campos con categoria, importe y nivel de responsabilidad, que un agente humano valida antes de abrir el caso. Adecuado por su salida estructurada y su bajo requisito de hardware.
- Deteccion temprana de fraude en pagos: clasifica el mensaje en categorias de disputa y senala posibles casos de fraude, permitiendo priorizar la cola de revision de un equipo de operaciones.
- Generacion de borradores de respuesta al cliente: redacta una contestacion en ingles, hindi o hinglish que el agente revisa y envia, reduciendo el tiempo de primera respuesta.
- Soporte multilingue en India: atiende mensajes en hindi devanagari y hinglish romanizado, cubriendo el espectro linguistico habitual en reclamaciones de UPI.
- Formacion y evaluacion de agentes: sirve como generador de casos de ejemplo y borradores de referencia para entrenar a personal de atencion en la clasificacion de disputas segun la politica del RBI.
- Prototipado de asistentes de triaje en entornos de investigacion: al caber en una GPU de 6 GB, permite iterar sobre el prompt y el contrato JSON en una estacion de trabajo sin infraestructura dedicada.
- Auditoria de calidad de respuestas: el modo de autoridad del modelo con chequeos que senalan respuestas dudosas (22 de 54 casos marcados en la evaluacion) facilita la construccion de flujos de revision humana.

## Benchmarks y rendimiento

| Metrica | 54 casos retenidos revisados | 42 casos con redaccion no familiar |
|---|---:|---:|
| Categoria correcta | 96,3% | 76,2% |
| Los 8 campos correctos | 55,6% | no disponible |
| Respuesta marcada "necesita revision humana" por los chequeos | 22 de 54 | 28 de 42 |
| Tiempo mediano por respuesta (RTX 4050, NF4) | 11 s | 12 s |

El modelo falla principalmente en el nivel de responsabilidad (que depende de hechos verificados por el operador que no puede inferir del mensaje) y en respuestas que toman prestado el consejo de otra categoria. El codigo de servicio senala estos casos en lugar de ocultarlos. Segun el autor, el modelo solo-JSON es mas preciso para la tarea de extraccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB en cuantizacion NF4 de 4 bits (el entrenamiento se realizo en una RTX 4050 de 6 GB); en bf16 se estima en torno a 6-7 GB para los pesos, mas overhead de contexto.
- GPU recomendadas: RTX 4050 (6 GB) validada por el autor; cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) deberia ser suficiente en cuantizacion.
- Cabe en GPU consumer: si, confirmado en una RTX 4050 de portatil con 6 GB.
- Opciones de despliegue: transformers con device_map="auto" (documentado); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: mediana de 11 s por respuesta en 54 casos y 12 s en 42 casos sobre RTX 4050 con NF4; no se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraksha-desk-dual-sft-004 | 3.000 M | no disponible | Triaje de disputas UPI (JSON + respuesta) | Qwen Research (no comercial) | Hugging Face |
| Qwen2.5-3B-Instruct | 3.000 M | no disponible | Modelo generalista de instrucciones | Qwen Research / Apache 2.0 segun variante | Hugging Face |
| Modelo solo-JSON del mismo proyecto | 3.000 M (base) | no disponible | Solo extraccion JSON de triaje | Qwen Research | Referenciado en el repositorio GitHub |

La comparativa con alternativas de la misma categoria (triaje de disputas UPI) no esta disponible, ya que no se documentan otros modelos publicos especificos para esta tarea en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos revisados por un unico revisor con preauditoria por IA; no evaluado con mensajes reales de clientes.
- Solo soporta ingles, hinglish y hindi; el hinglish romanizado a veces se interpreta como ingles.
- Puede asignar una categoria o un nivel de responsabilidad incorrectos y generar consejos pertenecientes a otro caso; requiere los chequeos del repositorio y supervision humana.
- No presenta disputas ni debe usarse para prometer reembolsos.
- Licencia Qwen Research: restringida a investigacion y uso no comercial; el uso comercial requiere atencion a los terminos de la licencia del modelo base.
- No conectado a ningun banco; cada salida es un borrador para un agente humano.
- El prompt de inferencia debe replicar exactamente el formato de entrenamiento definido en el repositorio; desviarse de el puede degradar la calidad.
- Riesgo de alucinacion en campos que dependen de hechos verificados por el operador (nivel de responsabilidad RBI), segun reconoce el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishal24102/suraksha-desk-dual-sft-004
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/vishal24102/suraksha-desk-upi-reviewed-v3
- Codigo, demo y documentacion: https://github.com/vishal88736/suraksha-merge
