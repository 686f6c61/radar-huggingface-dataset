# tinyopsec/Qwen3-4B-Instruct-2507-abliterated-GGUF

## Resumen

Qwen3-4B-Instruct-2507-abliterated-GGUF es una colección de cuantizaciones en formato GGUF del modelo Qwen3-4B-Instruct-2507 al que se le ha aplicado un proceso de "abliteración" mediante la herramienta Heretic, obra del usuario tinyopsec en Hugging Face. El modelo base es Qwen3-4B-Instruct-2507, un modelo instruccional de 4.022 millones de parámetros desarrollado por Alibaba (Qwen), del cual se ha eliminado el comportamiento de rechazo entrenado, produciendo una versión "uncensored" que responde a instrucciones sin los filtros de seguridad del original.

La relevancia de esta ficha radica en dos aspectos: por un lado, la serie Qwen3 de Alibaba representa una de las familias de modelos abiertos más competitivas en el rango pequeño (1B-8B), con buen rendimiento en razonamiento, código y tareas multilingües; por otro, la abliteración mediante Heretic es una técnica automatizada que modifica los pesos para suprimir las direcciones de rechazo en el espacio de activaciones, sin necesidad de reentrenamiento completo ni datasets adicionales.

Es importante subrayar que este repositorio no es un modelo original, sino una derivada comunitaria: la versión abliterada procede de `glivorem/Qwen3-4B-Instruct-2507-abliterated` y las cuantizaciones GGUF se han generado con llama.cpp. El resultado es un modelo de 4B parámetros ejecutable localmente, con contexto ampliado y licencia Apache 2.0, orientado a usuarios que necesitan control total sobre el comportamiento del modelo en entornos locales o de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3); detalle no disponible |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha (el modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens, dato no confirmado en este repo) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3-4B-Instruct-2507, es un transformer decoder denso (no MoE) de la familia Qwen3 de Alibaba, en su variante instruct ajustada en julio de 2025. La variante 2507 de la serie Qwen3-Instruct se caracteriza por eliminar el "thinking mode" conmutable y optimizar el rendimiento en modo no-thinking directo, con mejoras en razonamiento, seguimiento de instrucciones y generación de texto. Los detalles exactos de tokens de entrenamiento y composición del dataset no están disponibles en la informacion de este repositorio.

Sobre este modelo base se aplicó un proceso de abliteración con Heretic (herramienta automatizada de `p-e-w` que busca y neutraliza las direcciones de activación responsables de los rechazos, sin necesidad de datos de entrenamiento adicionales), publicado originalmente por el usuario glivorem. Posteriormente, tinyopsec generó las cuantizaciones GGUF con llama.cpp, abarcando desde F16 (precisión completa, ~8 GB) hasta Q2_K (~2 bits), lo que permite ejecutar el modelo desde GPUs de consumo hasta CPUs modestas. No hay innovaciones de arquitectura propias en este repo: su valor añadido es la disponibilidad del modelo abliterado en múltiples niveles de cuantización listos para llama.cpp, Ollama, LM Studio o koboldcpp.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento general y seguimiento de instrucciones heredados de Qwen3-4B-Instruct-2507.
- Capacidades de codigo y matematicas propias del modelo base Qwen3 (no cuantificadas en este repo).
- Respuesta sin rechazos: al estar abliterado, no aplica los filtros de seguridad del modelo original, respondiendo a instrucciones que el original rechazaria.
- Ejecucion local completa mediante runtimes compatibles con GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).
- Soporte de tool calling: no disponible/verificado en esta derivada (el modelo base Qwen3-4B-Instruct-2507 soporta function calling, pero la abliteracion podria degradarlo).
- Capacidades multilingues heredadas del modelo base (el repo no documenta idiomas concretos).

## Casos de uso

- Investigacion en alineacion y seguridad: estudiar como la abliteracion con Heretic modifica el comportamiento de un modelo instruct, comparando respuestas del modelo original frente al abliterado en baterias de pruebas de seguridad.
- Escritura creativa sin restricciones: generacion de ficcion, dialogos o contenido narrativo que el modelo original rechazaria por politicas de contenido, util para autores que necesitan control editorial total sobre la salida.
- Asistente local privado: ejecucion offline en un portatil o PC de escritorio con la cuantizacion Q4_K_M (~2,5 GB), adecuado para datos sensibles que no deben salir del equipo.
- Prototipado rapido de agentes locales: integracion con frameworks como LangChain o LlamaIndex usando Ollama como backend, aprovechando el bajo consumo de un modelo de 4B.
- Red teaming y auditoria de LLMs: usar el modelo abliterado como baseline de "peor caso" para evaluar la robustez de sistemas de filtrado de salida en aplicaciones de produccion.
- Investigacion en cuantizacion: el abanico de 13 cuantizaciones (F16 a Q2_K) permite medir la degradacion de calidad por nivel de bits en un mismo modelo de referencia.
- Generacion de datos sinteticos en entornos controlados: producir corpus que los modelos con RLHF rechazarian, siempre en contextos legales y eticos legitimos (por ejemplo, seguridad ofensiva autorizada en ciberseguridad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para datos de rendimiento del modelo original, consultar la ficha de Qwen/Qwen3-4B-Instruct-2507; la abliteracion y la cuantizacion pueden modificar esos resultados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (tamano aprox. del modelo en GGUF):
  - F16: ~8 GB
  - Q8_0: ~4,3 GB
  - Q6_K: ~3,3 GB
  - Q5_K_M: ~2,9 GB
  - Q4_K_M: ~2,5 GB (cuantizacion recomendada por el autor)
  - Q3_K_M: ~2 GB
  - Q2_K: ~1,6 GB
- GPUs recomendadas: cualquier GPU con 4 GB de VRAM o mas ejecuta Q4_K_M con holgura (RTX 3060, RTX 4060, RTX 4090 para contextos largos o F16); en CPU pura, 8 GB de RAM bastan para Q4_K_M.
- Cabe comodamente en GPUs de consumo: desde una RTX 3060 de 6 GB hasta integradas compartiendo RAM, gracias al rango de cuantizaciones hasta Q2_K.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. No hay soporte nativo documentado para vLLM o TGI (GGUF no es su formato principal).
- Latencia y throughput: no disponible; en un modelo de 4B cuantizado a 4 bits, se esperan velocidades del orden de decenas de tokens/segundo en GPUs de consumo modernas y 10-20 tokens/segundo en CPUs recientes (estimacion, no dato publicado).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-abliterated-GGUF (este) | 4,02 B | GGUF (13 cuants) | Apache 2.0 | Abliterado con Heretic, uncensored |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | Safetensors | Apache 2.0 | Modelo original con filtros de seguridad |
| glivorem/Qwen3-4B-Instruct-2507-abliterated | 4,02 B | Safetensors | Apache 2.0 | Abliterado original, sin cuantizaciones GGUF |
| Llama-3.1-8B-Instruct (ABLITERATED, comunidad) | 8 B | Safetensors/GGUF | Llama 3.1 Community | Alternativa uncensored mas grande, licencia mas restrictiva |

En resumen: frente al modelo base, esta derivada sacrifica los filtros de seguridad a cambio de obediencia total a instrucciones; frente a la version abliterada de glivorem, aporta la ventaja practica de las cuantizaciones GGUF listas para uso local.

## Limitaciones y advertencias

- Modelo abliterado: elimina deliberadamente los rechazos de seguridad. Puede generar contenido ofensivo, peligroso o ilegal si se le solicita. La responsabilidad legal y etica del uso recae integramente en el usuario; el propio autor incluye un disclaimer pidiendo evaluar el modelo antes de usarlo.
- Riesgo de alucinacion: inherente a cualquier LLM de 4B; los modelos pequenos alucinan con mas frecuencia que los grandes, y la abliteracion no mejora la factualidad.
- Posible degradacion de calidad: la abliteracion con Heretic y las cuantizaciones agresivas (Q3, Q2_K) pueden degradar razonamiento, codigo y capacidad de seguimiento de instrucciones respecto al modelo base. No hay benchmarks que cuantifiquen esta degradacion.
- Derivada comunitaria sin soporte oficial: no cuenta con el respaldo de Qwen/Alibaba ni evaluacion de seguridad; descargas y adopcion son muy bajas (402 descargas, 0 likes en el momento de la ficha).
- Limitaciones de idioma y contexto: no documentadas en este repo; consultar la ficha del modelo base para ventana de contexto e idiomas soportados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos de la licencia del modelo base Qwen3, que es tambien Apache 2.0; no se identifican restricciones comerciales adicionales.
- Uso en produccion: no recomendado para aplicaciones orientadas a usuarios finales sin capas adicionales de moderacion de entrada y salida, dado que el modelo no rechazara peticiones problematicas por si mismo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tinyopsec/Qwen3-4B-Instruct-2507-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Version abliterada original (safetensors): https://huggingface.co/glivorem/Qwen3-4B-Instruct-2507-abliterated
- No se han encontrado enlaces a papers, blogs oficiales ni demos en la informacion disponible.
