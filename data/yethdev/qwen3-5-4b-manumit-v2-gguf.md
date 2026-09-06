# yethdev/qwen3.5-4b-manumit-v2-GGUF

## Resumen

El modelo `yethdev/qwen3.5-4b-manumit-v2-GGUF` es una version cuantizada en formato GGUF del modelo `Qwen3.5-4B` de Alibaba, modificado por el desarrollador `yethdev` mediante la tecnica de abliteracion denominada "manumit v2". El objetivo es eliminar el comportamiento de rechazo del modelo original: se identifican las direcciones del flujo residual que codifican la negativa a responder ciertas indicaciones y se proyectan fuera de los pesos, seguido de un proceso de "healing" sobre datos ordinarios para conservar la calidad general. De esta manera, el modelo responde sin objeciones a prompts de alto riesgo, a costa de una ligera perdida en tareas de conocimiento. La version GGUF se presenta con tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0) y un total de 4.205.751.296 parámetros, disenada para ejecutarse en CPU o GPU con poca memoria. No se especifican datos sobre la longitud de contexto ni los idiomas soportados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptacion; el modelo base Qwen3.5-4B mantiene sus propios terminos) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer decoder-only de `Qwen3.5-4B`. Los pesos originales se copian y `yethdev` aplica un proceso de abliteracion llamado "manumit v2", que identifica en el flujo residual las direcciones asociadas al rechazo y las elimina de los pesos. Despues, el modelo se somete a un "healing" con datos ordinarios para mitigar el coste en rendimiento. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. Ademas, los ficheros GGUF no incluyen la cabeza de prediccion multi-token, que solo se utilizaba para decodificacion especulativa en la version original.

## Capacidades

- Generacion de texto en formato conversacional y narrativo.
- Eliminacion del comportamiento de rechazo ante prompts de alto riesgo: el modelo responde sin objetar.
- Mantiene capacidades generales de conocimiento y razonamiento, aunque reducidas (ver benchmarks).
- Compatible con inferencia local mediante llama.cpp, Ollama y LM Studio.
- Ejecutable en CPU o GPU de bajo consumo gracias a las cuantizaciones GGUF.
- No se dispone de informacion sobre soporte de tool calling, vision, audio o funciones de agente en la documentacion proporcionada.

## Casos de uso

- Asistente de escritura creativa sin censura: para novelas o guiones en los que los personajes puedan tratar temas delicados sin que el modelo se niegue. Se usaria con llama.cpp en local, seleccionando la cuantizacion Q4_K_M para minimizar el uso de memoria.
- Chatbot de rol (roleplay): ideal para simulaciones de personajes en interacciones multi-turno cuando se desea evitar rechazos morales o tematicos del modelo base. Puede desplegarse con Ollama en una estacion de trabajo.
- Investigacion sobre mecanismos de rechazo y abliteracion: permite comparar el comportamiento con el modelo base `Qwen3.5-4B` para medir el impacto de la eliminacion de refusals, tanto en prompts de seguridad (AdvBench, JailbreakBench) como en tareas de conocimiento (MMLU-Pro).
- Generacion de contenido para juegos narrativos (NPCs, dialogos, descripciones): el modelo puede producir respuestas variadas sin bloqueos, permitiendo tropos arriesgados en juegos de rol de mesa o videojuegos. Se integraria a traves de la API de llama.cpp.
- Asistente personal en equipos con recursos limitados: con 2.7 GB de peso en Q4_K_M, puede ejecutarse en un portatil con 8 GB de RAM o en una GPU integrada, proporcionando un chatbot local sin conexion que no depende de servicios en la nube.
- Evaluacion de tecnicas de desalineacion: el modelo sirve como banco de pruebas para estudiar como se comporta un LLM al que se le ha retirado deliberadamente el filtro de seguridad, en el contexto de investigacion en robustez de alineacion.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Base |
|---|---|---|
| AdvBench refusal | 0.0% | high |
| JailbreakBench refusal | 0.0% | high |
| MMLU-Pro (n=500) | 42.6% | 45.0% |

Los datos provienen de la model card del modelo base `manumit v2`. "Refusal" mide la tasa de rechazo en prompts daninos de referencia, mientras que MMLU-Pro mide capacidad de conocimiento y razonamiento. No se dispone de otros benchmarks publicados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para Q4_K_M, unos 2.7 GB de pesos; con overhead de contexto se recomienda al menos 4 GB de VRAM. Para Q5_K_M, unos 3.1 GB. Para Q8_0, unos 4.5 GB, recomendando entre 6 y 8 GB de VRAM.
- GPU recomendadas: una RTX 3060 de 8 GB puede ejecutar Q8_0; una RTX 2060 de 6 GB o una GTX 1660 Super pueden ejecutar Q4_K_M y Q5_K_M. Tambien puede ejecutarse en CPU con suficiente RAM.
- Si cabe en consumer GPU: si, Q4_K_M y Q5_K_M caben en tarjetas de 4 a 6 GB, y Q8_0 en tarjetas de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier otro consumidor de formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | MMLU-Pro |
|---|---|---|---|---|---|
| `yethdev/qwen3.5-4b-manumit-v2-GGUF` | 4.21B | no disponible | GGUF | MIT (adaptacion) | 42.6% |
| `Qwen/Qwen3.5-4B` (base) | 4.21B | no disponible | Safetensors | Terminos de Qwen | 45.0% |

No se dispone en la informacion proporcionada de datos sobre otras alternativas de la misma categoria.

## Limitaciones y advertencias

- No existe capa de seguridad ni modelo guardian. El modelo genera sin rechazar; el usuario es responsable del contenido producido y de cumplir la ley y los terminos del modelo base.
- Perdida de capacidad en tareas de conocimiento: MMLU-Pro 42.6% frente al 45.0% del base, lo que puede traducirse en respuestas menos precisas.
- Riesgo de alucinacion inherente a los grandes modelos de lenguaje, amplificado al no haber filtros de contenido.
- Sesgos del modelo base no especificados en la informacion disponible; es probable que persistan tras la abliteracion.
- La licencia MIT aplica a la adaptacion, pero `Qwen/Qwen3.5-4B` mantiene sus propios terminos; deben revisarse antes de cualquier uso comercial o redistribucion.
- No se indican idiomas soportados ni longitud de contexto, lo que limita conocer el alcance real del modelo en aplicaciones multilingues o de ventana larga.

## Enlaces

- https://huggingface.co/yethdev/qwen3.5-4b-manumit-v2-GGUF
- https://huggingface.co/yethdev/qwen3.5-4b-manumit-v2
- https://huggingface.co/Qwen/Qwen3.5-4B
