# sovythos/SYTHS-1.0

## Resumen

SYTHS-1.0 es un ajuste fino supervisado (SFT) mediante LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por el ingeniero egipcio Mahmoud Yasser dentro de la familia de modelos Sovythos. Su objetivo es dotar a un transformer decoder-only de 2.274 millones de parametros de una personalidad conversacional en arabe egipcio (masri), con soporte secundario de ingles y Franco-Arabe, ademas de comportamiento de honestidad calibrada y tool calling fiable.

El modelo no se entrena desde cero: parte de la version oficial post-entrenada de Qwen3.5-2B y anade mediante LoRA (r=64 sobre las proyecciones q/k/v/o/gate/up/down) un conjunto de 3.800 ejemplos escritos a mano, sin generadores ni datasets externos. La relevancia actual reside en la escasez de modelos abiertos especializados en dialectos arabes y en su enfoque explicito en no alucinar datos volatiles (precios, telefonos, fuentes), derivando al usuario a la fuente oficial.

En el momento de redactar esta ficha, la model card indica que el entrenamiento y la evaluacion aun no se habian ejecutado: todos los valores de benchmark figuran como PENDING y el estado del modelo es "awaiting training and evaluation". La licencia declarada es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B) con adaptadores LoRA |
| Parametros totales | 2.274.069.824 (pesos safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de secuencia en entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; sin GGUF publicado) |
| Idiomas soportados | Arabe egipcio (principal), ingles, Franco-Arabe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA sobre el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-2B oficial: un transformer decoder-only post-entrenado. Sobre el se aplica un unico stage de SFT con LoRA de rango 64 sobre las proyecciones de atencion (q, k, v, o) y las proyecciones del bloque feed-forward (gate, up, down). El entrenamiento se realizo con Unsloth, carga en 16 bits del base, 3 epocas, learning rate 1e-4 con schedule coseno, optimizador adamw_8bit, batch efectivo de 16 (1 x grad-accum 16), longitud maxima de secuencia 2048 (el ejemplo mas largo ronda los 1.623 tokens), split de validacion del 3% y semilla 3407. La perdida se calcula unicamente sobre las respuestas del asistente mediante `train_on_responses_only`, y el script de entrenamiento aborta si la fraccion de tokens entrenables queda fuera del rango 2%-98%.

El dataset (`sovythos_handmade.jsonl`) consta de 3.800 ejemplos escritos integramente a mano: 317 conversaciones con uso de herramientas, 476 con system prompt, 335 multiturno (dos o mas turnos de usuario), 2.845 respuestas mayoritariamente en arabe, sin duplicados ni errores de esquema. El esquema es `{"messages": [...], "tools": [...]}` con roles system/user/assistant/tool, y cada llamada a herramienta tiene su resultado correspondiente y una declaracion de herramienta con argumentos requeridos. El modo thinking se mantiene desactivado (`enable_thinking=False`) tanto en entrenamiento como en pruebas. La model card advierte que los marcadores de chat-template y de masking aun no se habian verificado en hardware real.

## Capacidades

- Generacion de texto conversacional en arabe egipcio, con soporte de ingles y Franco-Arabe.
- Tool calling / function calling: el dataset incluye 317 conversaciones con herramientas y el modelo trata el contenido de herramientas, ficheros y web como datos, no como instrucciones.
- Comportamiento de honestidad calibrada: no inventa hechos, telefonos, precios ni fuentes, y no afirma acceso a datos en vivo, internet o memoria entre chats; para datos volatiles remite a la fuente oficial.
- Tutoria de programacion (coding tutoring) como objetivo de diseno declarado.
- Multiturno: entrenado con 335 conversaciones de dos o mas turnos de usuario.
- Rechazos educados y seguros, con confirmacion antes de acciones destructivas o de envio.
- Modo thinking: desactivado en entrenamiento y pruebas.
- Vision, audio y razonamiento extendido: no disponible.

## Casos de uso

- Atencion al cliente en arabe egipcio: el modelo puede mantener conversaciones multiturno en dialecto masri y derivar consultas sobre precios o disponibilidad a la fuente oficial, reduciendo respuestas inventadas en un dominio sensible a la exactitud.
- Asistente de programacion para hablantes de arabe: tutoria de codigo con explicaciones en dialecto y soporte de tool calling para invocar funciones de ejecucion o busqueda en un IDE.
- Integracion en pipelines de agentes con herramientas: al tratar la salida de herramientas como datos y exigir confirmacion antes de acciones destructivas, encaja en flujos donde el modelo orquesta llamadas a APIs con requisitos de seguridad.
- Chatbot de soporte interno para empresas egipcias: el soporte nativo de Franco-Arabe permite atender a usuarios que escriben con transliteracion latina, un formato frecuente en mensajeria movil.
- Prototipado rapido de asistentes dialectales: al ser un adaptador LoRA sobre un base de 2B, permite iterar y desplegar en infraestructura modesta para validar producto antes de escalar.
- Filtrado y reescritura de contenido: normalizacion de texto entre arabe estandar, dialecto egipcio y Franco-Arabe en flujos de moderacion o localizacion.
- Educacion y tutoria: explicaciones de conceptos tecnicos en dialecto con rechazos seguros ante peticiones inapropiadas, adecuado para entornos con menores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que todos los valores de evaluacion estan en estado PENDING y que el entrenamiento y la evaluacion no se habian ejecutado al preparar el documento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (2.274 millones de parametros), en 16 bits rondaria los 4,5 GB de pesos y en cuantizacion de 4 bits alrededor de 1,2-1,5 GB, mas overhead de contexto y KV cache; estas cifras no las publica el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 2B, aunque el autor no lo confirma ni especifica modelos.
- Opciones de despliegue: el repositorio es un adaptador PEFT que requiere cargar el base Qwen/Qwen3.5-2B; no se publican instrucciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| SYTHS-1.0 | 2,27 B (LoRA sobre Qwen3.5-2B) | no disponible (entrenamiento a 2048) | Apache-2.0 | Entrenamiento/evaluacion pendientes |
| Qwen/Qwen3.5-2B (base) | 2 B aprox. | no disponible | Apache-2.0 | Publicado |
| Sovythos-66M-Base | 66 M | no disponible | no disponible | Publicado |

No se dispone de datos de rendimiento comparativo entre SYTHS-1.0 y sus alternativas, por lo que la comparacion se limita a parametros, licencia y estado de publicacion.

## Limitaciones y advertencias

- Estado del modelo: la model card indica que el entrenamiento y la evaluacion no se habian ejecutado; los resultados publicados son plantilla y no deben citarse como metricas reales.
- Los marcadores de chat-template y de masking no estaban verificados en hardware real en el momento de preparar la card.
- Riesgo de alucinacion: aunque el modelo se disena para no inventar hechos volatiles, no hay evaluacion publicada que cuantifique esta propiedad.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo.
- Cobertura limitada a arabe egipcio, ingles y Franco-Arabe; otros dialectos arabes o idiomas no estan garantizados.
- Contexto de entrenamiento limitado a 2048 tokens; no se documenta la ventana efectiva del base ni su comportamiento mas alla de esa longitud.
- Licencia Apache-2.0 declarada, pero la model card senala que el autor podria cambiarla antes del lanzamiento; conviene verificar antes de uso comercial.
- Al ser un adaptador LoRA, el despliegue requiere el modelo base Qwen/Qwen3.5-2B y su licencia correspondiente.
- Sin datos de benchmarks, latencia ni throughput, no es posible validar su idoneidad en produccion frente al base sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sovythos/SYTHS-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor en Hugging Face: https://huggingface.co/my0919175
- Sovythos-66M-Base: https://huggingface.co/my0919175/Sovythos-66M-Base
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
