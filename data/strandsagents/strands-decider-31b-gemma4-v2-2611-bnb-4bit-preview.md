# StrandsAgents/strands-decider-31B-gemma4-v2-2611-bnb-4bit-preview

## Resumen

strands-decider-31B-gemma4-v2-2611-bnb-4bit-preview es una copia cuantizada a 4 bits del modelo de decisión strands-decider-31B-gemma4-v2-2611, desarrollado por StrandsAgents. No es un modelo conversacional: recibe un estado (texto o texto con imagen) y una batería de preguntas tipadas (`choice` para elección entre opciones, `noul` para sí/no y `score` para puntuación sobre criterios) y devuelve cada respuesta acompañada de una probabilidad calibrada. Está construido sobre una base Gemma 4 de 31.273.088.876 parámetros totales y se distribuye con licencia Apache-2.0.

La relevancia de esta variante es puramente de despliegue: el modelo original en bf16 ocupa unos 63 GB de pesos y requiere cerca de 58 GB de VRAM, mientras que esta copia en bitsandbytes NF4 pesa 18,3 GB y necesita 17,0 GiB tras la carga, con un pico de 19,2 GiB para prompts de 8.000 tokens y 25,9 GiB para 32.000. Eso lo acerca al terreno de GPUs de 24 GB, aunque el autor advierte que todavía no se ha ejecutado en una tarjeta real de 24 GB.

Se trata de una *preview*: las cifras publicadas provienen de muestras de benchmarks, no de las ejecuciones oficiales, y el autor se reserva el derecho de reemplazar o retirar el repositorio si las pruebas formales revelan una pérdida excesiva. La cuantización preserva la respuesta principal del modelo bf16 en el 99,09 % de las 1.426 preguntas de referencia, con una diferencia media de probabilidad de 0,0174.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con cabecera de decisión; decodificador de texto y codificador de imagen |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 32.768 tokens en los estados de referencia; pico de memoria medido a 32.000 tokens |
| Tipos de cuantizacion | bitsandbytes NF4 de 4 bits con doble cuantización en capas lineales; embeddings, norms y readout de decisión en bf16; sin datos de calibración (redondeo simple) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bitsandbytes 4-bit); repositorio de 18,3 GB |

## Arquitectura y entrenamiento

El modelo se apoya en una arquitectura Gemma 4 multimodal: un decodificador de texto y un codificador de imagen, sobre los que se añade una cabeza de lectura de decisión (*decision readout*) que produce probabilidades para preguntas tipadas. La cuantización afecta a las capas lineales de ambos codificadores, mientras que los embeddings, las normas y el readout permanecen en bf16, lo que explica que la degradación de calibración sea contenida. El proceso de cuantización no emplea datos de calibración: es redondeo simple a NF4 con doble cuantización.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La model card remite a la ficha del modelo bf16 original para los detalles de entrenamiento, formato de petición y límites. La innovación técnica destacable de esta variante es la conservación de la calibración probabilística bajo cuantización agresiva: en las 318 preguntas de referencia que el modelo bf16 considera ajustadas (probabilidad de la respuesta principal entre 0,1 y 0,9), esta copia desplaza la probabilidad 0,064 de media, frente a 0,004 en las otras 1.108.

## Capacidades

- Clasificación y decisión sobre estados de texto: preguntas de tipo `choice` con criterios definidos, devolviendo opción y probabilidad.
- Preguntas booleanas (`noul`) con probabilidad asociada, útiles para enrutado condicional.
- Puntuación (`score`) sobre criterios graduados, por ejemplo niveles de frustración o urgencia.
- Procesamiento multimodal: 199 de las preguntas de referencia incluyen imágenes y el codificador visual se mantiene operativo tras la cuantización.
- Contexto largo: estados de hasta 32.768 tokens según las mediciones de memoria del autor.
- Salida calibrada: cada respuesta incluye probabilidad, lo que permite aplicar umbrales y políticas de derivación.
- No es un modelo de chat ni de generación libre: no se documentan capacidades de tool calling, agentes multi-paso ni generación de código.
- Soporte lingüístico limitado al inglés.

## Casos de uso

- Enrutado de tickets de soporte: enviar el texto del ticket como estado y preguntas `choice` con los equipos disponibles (facturación, soporte técnico, ventas) permite dirigir cada caso con una probabilidad asociada y fijar un umbral por debajo del cual se escala a revisión humana.
- Triaje de urgencia en atención al cliente: una pregunta `noul` del tipo "¿el cliente está bloqueado ahora mismo?" sobre conversaciones multi-turno de hasta 32.000 tokens permite priorizar colas sin un LLM generativo en el bucle.
- Moderación y clasificación de contenido: preguntas `score` sobre criterios graduados (tono, gravedad, categoría) con probabilidad por nivel, adecuado para pipelines que necesitan decisiones auditables y no texto libre.
- Enrutado multimodal en aplicaciones con capturas: al conservar el codificador de imagen, puede clasificar estados que combinan texto e imagen, como capturas de error adjuntas a un informe.
- Automatización de decisiones en backoffice: evaluación de solicitudes (aprobación, revisión, rechazo) con probabilidades que alimentan reglas de negocio y umbrales configurables.
- Evaluación de riesgo en flujos de compliance: preguntas booleanas y de elección sobre documentos largos para marcar casos que requieren revisión, con la ventaja de que la inferencia cabe en una sola GPU de 24 GB en el mejor de los casos.
- Sustitución de modelos bf16 en entornos con VRAM limitada: cuando el modelo de 58 GB no cabe, esta copia reduce el requisito a 17 GiB con una pérdida de acercamiento del 0,3 % en precisión sobre las muestras de benchmarks.

## Benchmarks y rendimiento

Los datos proceden de muestras de benchmarks públicos, no de las ejecuciones oficiales. El autor los presenta como diferencias entre los dos modelos sobre las mismas preguntas.

| Conjunto de preguntas | bf16 | Esta copia |
|---|---|---|
| 2.350 preguntas del Decision Index 0.3 | 83,7 | 83,5 |
| 1.960 preguntas de BEV | 88,5 | 88,3 |
| 3.227 preguntas de 22 datasets públicos de NLI y QA | 90,3 | 90,6 |
| 231 ítems públicos de JevBench (ítems correctos) | 216 | 213 |

Sobre las 7.768 preguntas en conjunto, la precisión de esta copia queda 0,3 puntos por debajo de bf16, con un intervalo del 95 % de -0,7 a +0,1. En las 1.426 preguntas de referencia del paquete bf16, la coincidencia en la respuesta principal es del 99,09 % y la diferencia media de probabilidad de 0,0174; en las 199 preguntas con imagen la coincidencia es del 100 % con diferencia media de 0,003. El proyecto acepta un runtime si alcanza el 98 % de coincidencia y 0,02 de diferencia, por lo que esta copia cumple con margen ajustado.

## Requisitos de hardware

- VRAM: 17,0 GiB tras la carga; pico de 19,2 GiB con prompt de 8.000 tokens, 21,4 GiB con 16.000 y 25,9 GiB con 32.000.
- GPU: una NVIDIA GPU; el autor probó en una H100. No hay soporte de CPU ni de Apple Silicon.
- GPU de consumo: el autor indica que no se ha ejecutado en una tarjeta real de 24 GB; por las cifras de pico, un prompt de hasta 16.000 tokens cabría en 24 GB, pero 32.000 tokens (25,9 GiB) excedería esa capacidad.
- Disco: 19 GB libres; el repositorio pesa 18,3 GB.
- Software: Python 3.11 o superior, `strands-decider` 0.4.0 o posterior y `bitsandbytes` (probado con 0.50.2); backend de transformers.
- Despliegue: `strands-decider serve` funciona igual que con el modelo bf16. El plugin de vLLM y llama.cpp no cargan este paquete.
- Rendimiento: la cuantización ahorra memoria, no cómputo; una pregunta tarda aproximadamente 1,2 veces lo que en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (muestras) | VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| strands-decider-31B-gemma4-v2-2611-bnb-4bit-preview | 31,27 B | hasta 32.768 tokens | 83,5 / 88,3 / 90,6 en las muestras | 17,0 GiB (pico 25,9 GiB) | Apache-2.0 | Hugging Face, preview |
| strands-decider-31B-gemma4-v2-2611 (bf16) | 31,27 B | hasta 32.768 tokens | 83,7 / 88,5 / 90,3 en las muestras | ~58 GB | Apache-2.0 | Hugging Face |
| Modelos de clasificación tipo encoders (p. ej. DeBERTa) | no disponible | típicamente 512 tokens | no disponible | muy inferior | variable | amplia |

La comparación directa más relevante es con el modelo bf16 del que deriva: misma arquitectura, mismas respuestas en el 99,09 % de las preguntas de referencia y una penalización de 0,3 puntos en precisión a cambio de reducir la VRAM de ~58 GB a 17 GiB. No se dispone de datos de benchmarks frente a otros modelos de decisión o clasificación de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una preview: las cifras provienen de muestras, no de ejecuciones oficiales, y el autor puede reemplazar o retirar el repositorio si las pruebas formales muestran una pérdida excesiva.
- Solo se ha medido en una máquina (una H100) y no se ha probado en una GPU real de 24 GB.
- En preguntas ajustadas (probabilidad entre 0,1 y 0,9 en bf16) la probabilidad se desplaza 0,064 de media; si se actúa sobre umbrales como 0,9, hay que validar la copia con datos propios antes de producción.
- No es un modelo de chat: no genera texto libre ni se documentan tool calling ni razonamiento multi-paso.
- Idiomas: únicamente inglés; no hay soporte multilingüe documentado.
- La cuantización no acelera la inferencia: es un 20 % más lenta que bf16 por pregunta.
- Sin soporte de CPU ni Apple Silicon; requiere una GPU NVIDIA y el backend de transformers de `strands-decider`.
- Riesgo de alucinación y sesgos del modelo base: la información disponible no documenta sesgos específicos ni evaluaciones de alucinación para esta variante.
- Licencia Apache-2.0, que permite uso comercial, pero el estado de preview y la ausencia de garantías desaconsejan depender de ella en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-31B-gemma4-v2-2611-bnb-4bit-preview
- Modelo base bf16: https://huggingface.co/StrandsAgents/strands-decider-31B-gemma4-v2-2611
- Seguimiento de mediciones y trabajo del proyecto: https://github.com/strands-labs/strands-decider/issues/172
