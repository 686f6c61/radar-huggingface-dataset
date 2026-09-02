# yethdev/ling-3.0-tiny-manumit-v2

## Resumen

Ling-3.0-tiny-manumit-v2 es una variante del modelo Ling-3.0-tiny de InclusionAI, modificada mediante la técnica de ablación "manumit" para eliminar el comportamiento de rechazo (refusal) del modelo original. El autor, yethdev, ha extraído las direcciones del flujo residual que codifican el rechazo y las ha proyectado fuera de los pesos, dando como resultado un modelo que responde a peticiones que el modelo base rechazaría, manteniendo la mayor parte de su capacidad original. Es un modelo de texto puro, sin visión ni audio, pensado para generación de texto y conversación.

El modelo base, Ling-3.0-tiny, es un MoE híbrido de razonamiento con 7.9 mil millones de parámetros totales y solo 1.3 mil millones activos por token, diseñado para despliegue en entornos con recursos limitados. Esta versión manumit conserva esa arquitectura de 128 expertos, pero sin la capa de seguridad. La licencia es MIT, aunque el modelo base mantiene sus propios términos. Es relevante para investigadores que estudian mecanismos de alineación y seguridad, así como para quienes necesitan un modelo sin restricciones de rechazo en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido (128 expertos) con atencion tipo Kimi alternada |
| Parametros totales | 7.893.392.800 (7,9 B) |
| Parametros activos | 1,3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT (el modelo base mantiene sus propios terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny emplea una arquitectura de mezcla de expertos (MoE) con 128 expertos y un total de 7,9 B de parametros, de los cuales se activan 1,3 B por token. Segun la documentacion de InclusionAI, utiliza una arquitectura hibrida que alterna capas de atencion tipo Kimi con otras no especificadas, disenada para ofrecer razonamiento y capacidades de agente a bajo coste de inferencia. La version manumit no anade entrenamiento adicional: aplica una ablacion sobre los pesos del modelo base, identificando un subespacio en el flujo residual que transporta la senal de rechazo y proyectandolo fuera. A diferencia de otros metodos de "healing pass", aqui no se realiza ese paso porque degradaria la capacidad del modelo; la ablacion sola elimina el rechazo casi por completo, a costa de una caida de 3 puntos en MMLU-Pro.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante plantilla de chat.
- Razonamiento y capacidades de agente heredadas del modelo base, aunque con una degradacion medida del 3 % en MMLU-Pro.
- Respuesta a peticiones que el modelo base rechazaria (por ejemplo, contenido danino o ilegal), al haber eliminado el mecanismo de rechazo.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no especificadas, aunque el modelo base probablemente soporta varios idiomas.
- Sin capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Investigacion en seguridad y alineacion: permite estudiar como se comporta un modelo sin capa de rechazo, comparando sus respuestas con el modelo base para analizar los mecanismos internos de seguridad.
- Evaluacion de tecnicas de ablacion: sirve como banco de pruebas para metodos como manumit, midiendo el impacto en capacidad y en tasa de rechazo sobre conjuntos como AdvBench y JailbreakBench.
- Generacion de texto sin restricciones en entornos aislados: util para pruebas de estres de sistemas de moderacion o para generar datos sinteticos que requieran contenido que otros modelos filtran.
- Desarrollo de agentes conversacionales en entornos de investigacion donde se necesita explorar limites de comportamiento sin intervencion de guardas.
- Analisis de robustez: permite probar si un sistema de seguridad externo (filtros, clasificadores) detecta contenido generado por un modelo sin rechazo interno.
- Educacion sobre riesgos de IA: como ejemplo practico de los peligros de eliminar capas de seguridad, para formacion de desarrolladores y politicos.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes datos, medidos con el mismo protocolo para el modelo manumit y el base:

| Metrica | Este modelo | Base (Ling-3.0-tiny) |
|---|---|---|
| AdvBench refusal (tasa de rechazo) | 4,2 % | alta |
| JailbreakBench refusal | 0,0 % | alta |
| MMLU-Pro (n=500) | 19,8 % | 22,8 % |

No se han publicado resultados adicionales de benchmarks (como HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 7,9 B de parametros en precision fp16, el modelo ocupa aproximadamente 15,8 GB (coincide con el tamano del repo). En cuantizacion int8 cabria en ~8 GB, y en 4-bit en ~4-5 GB, pero no se han publicado versiones cuantizadas.
- GPU recomendadas: para fp16 se necesita una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100 40 GB, H100). Con cuantizacion 4-bit podria ejecutarse en GPUs de consumo como RTX 3060 12 GB o RTX 4070.
- Despliegue: compatible con transformers (usando `trust_remote_code=True`). No se menciona soporte para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un MoE con solo 1,3 B de parametros activos, la inferencia es mas rapida que un modelo denso de 7,9 B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | MMLU-Pro | Licencia |
|---|---|---|---|---|---|
| yethdev/ling-3.0-tiny-manumit-v2 | 7,9 B | 1,3 B | no disp. | 19,8 % | MIT |
| inclusionAI/Ling-3.0-tiny (base) | 7,9 B | 1,3 B | no disp. | 22,8 % | terminos propios |
| inclusionAI/Ling-lite | 16,8 B | 2,75 B | no disp. | no disp. | terminos propios |

La comparativa se limita a los modelos de la familia Ling, ya que no se dispone de datos de otros modelos abliterated del mismo tamano. La diferencia principal es la eliminacion del rechazo y la caida de 3 puntos en MMLU-Pro.

## Limitaciones y advertencias

- No existe ninguna capa de seguridad ni modelo guardián: el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtro alguno.
- La tasa de rechazo en JailbreakBench es del 0,0 %, lo que significa que responde a practicamente cualquier intento de jailbreak.
- La capacidad general se reduce en 3 puntos de MMLU-Pro respecto al base, lo que puede afectar a tareas complejas de razonamiento.
- No se ha realizado un "healing pass" para restaurar capacidad, por lo que la ablacion es la unica modificacion aplicada.
- El modelo base tiene sus propios terminos de uso, que deben respetarse incluso al usar esta variante.
- No se dispone de informacion sobre la longitud de contexto, idiomas soportados ni cuantizaciones, lo que limita su uso en produccion.
- Al ser un modelo abliterated, no es recomendable su despliegue en aplicaciones publicas o sin supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yethdev/ling-3.0-tiny-manumit-v2
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio GitHub de InclusionAI (serie Ling): https://github.com/inclusionAI/Ling
- Documentacion de Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Pagina en SourceForge: https://sourceforge.net/projects/ling-3-0-tiny/
