# TheShellMaster/Cypher-Base-Qwen2.5-Coder-7B-Abliterated-GGUF

## Resumen

Cypher-Base-Qwen2.5-Coder-7B-Abliterated-GGUF es un espejo de distribucion publico y sin modificaciones del fichero `Qwen2.5-Coder-7B-Instruct-abliterated-Q5_K_M.gguf` publicado por bartowski. No se ha aplicado re-cuantizacion ni fine-tuning adicional: los pesos son identicos a la fuente. Su proposito es servir como base reproducible de Cypher-2.5-OS, un modelo derivado del mismo autor (TheShellMaster), garantizando que la cadena de produccion permanezca publica aunque el repositorio original deje de estar accesible.

El modelo subyacente es Qwen2.5-Coder-7B-Instruct, un transformer denso de 7.000 millones de parametros desarrollado por Alibaba Qwen, especializado en generacion de codigo. Sobre esa base, huihui-ai aplico una tecnica de "abliteration" (ablacion de direcciones de rechazo en el espacio de activaciones) para eliminar los mecanismos de negativa del modelo alineado, y bartowski genero la cuantizacion GGUF en Q5_K_M (5,44 GB).

Es relevante para desarrolladores que necesitan un modelo de codigo sin filtros de rechazo, ejecutable en hardware de consumo mediante llama.cpp u Ollama, con contexto nativo de 32.768 tokens y licencia Apache-2.0. La ficha describe el modelo heredado, ya que el repositorio no aporta informacion adicional sobre entrenamiento o evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2 (transformer denso, 28 bloques, dimension 3584) |
| Parametros totales | 7.000 millones (aproximado, segun modelo base Qwen2.5-Coder-7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (nativo) |
| Tipos de cuantizacion | Q5_K_M (unica incluida en este repositorio, 5,44 GB) |
| Idiomas soportados | no disponibles en la informacion del repositorio (el modelo base Qwen2.5-Coder soporta principalmente ingles y chino, con cobertura multilingue parcial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso con 28 bloques y dimension de modelo 3584, segun la tabla de caracteristicas del repositorio. No se trata de un modelo MoE ni hibrido. El contexto nativo es de 32.768 tokens.

El repositorio no documenta datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) porque es un espejo de distribucion, no un modelo entrenado por su autor. La cadena de transformaciones es la siguiente: Qwen/Qwen2.5-Coder-7B-Instruct (modelo raiz de Alibaba Qwen) pasa por una abliteration en fp16 realizada por huihui-ai, que elimina las direcciones de activacion asociadas al rechazo; posteriormente bartowski cuantiza a GGUF en Q5_K_M. TheShellMaster no interviene en los pesos, solo replica el fichero. La innovacion tecnica relevante es la propia abliteration, que reduce la tasa de respuestas negativas del modelo alineado sin reentrenamiento.

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada de Qwen2.5-Coder-7B-Instruct.
- Razonamiento sobre codigo, explicacion y refactorizacion.
- Generacion de texto general y conversacion multi-turno.
- Comportamiento "uncensored": la abliteration reduce los rechazos ante peticiones que el modelo original declinaria.
- Compatibilidad con llama.cpp y Ollama, lo que permite integracion en pipelines locales.
- Soporte de plantilla de chat instruct (heredado del modelo Instruct original).
- Capacidades de tool calling y function calling: no confirmadas en la informacion del repositorio; el modelo base Qwen2.5-Coder-Instruct las soporta, pero no se verifica su preservacion tras la abliteration.
- Capacidades multilingues: no disponibles de forma explicita en el repositorio.

## Casos de uso

- Asistente de codigo en local: desplegado con llama.cpp u Ollama en una estacion de trabajo, el modelo autocompleta y explica codigo en un contexto de 32.768 tokens, sin depender de servicios en la nube.
- Generacion de codigo en entornos con requisitos de privacidad: al ejecutarse integramente en local, permite procesar repositorios propietarios sin enviar codigo a APIs externas.
- Base para fine-tuning derivado: es el punto de partida documentado de Cypher-2.5-OS, por lo que sirve a quien quiera reproducir o auditar esa cadena de produccion.
- Investigacion sobre abliteration: permite estudiar el efecto de la ablacion de direcciones de rechazo comparando respuestas con el modelo alineado original.
- Prototipado de agentes de codigo: su contexto de 32.768 tokens admite incluir varios ficheros y trazas de error en una sola peticion para tareas de depuracion.
- Despliegue en hardware de consumo: con 5,44 GB en Q5_K_M cabe en GPUs de 8 GB de VRAM, lo que facilita entornos de desarrollo modestos.
- Educacion y ensenanza de programacion: útil para generar ejemplos y explicaciones sin restricciones de contenido excesivas, con la advertencia de revisar la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,5-6,5 GB para el fichero Q5_K_M de 5,44 GB, mas overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090, A100, H100). En GPUs de 8 GB el contexto utilizable se reduce si se mantiene todo en VRAM.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM; tambien puede ejecutarse en CPU con llama.cpp, a menor velocidad.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) y Ollama mediante `Modelfile`. No se documentan otras opciones (vLLM, TGI) para este fichero GGUF.
- Latencia y throughput: no disponibles en la informacion del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Cypher-Base-Qwen2.5-Coder-7B-Abliterated-GGUF (este) | ~7B | 32.768 | GGUF Q5_K_M | Apache-2.0 | Espejo sin modificaciones, abliterated |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7B | 32.768 | safetensors, GGUF | Apache-2.0 | Modelo raiz alineado, con rechazos |
| huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated | ~7B | 32.768 | safetensors (fp16) | Apache-2.0 | Abliteration en fp16, sin cuantizar |
| bartowski/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF | ~7B | 32.768 | GGUF (multiples cuantizaciones) | Apache-2.0 | Fuente directa de este espejo; ofrece mas variantes de cuantizacion |

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que puede producir contenido inapropiado, inseguro o sesgado; no debe desplegarse en produccion sin filtros externos.
- Riesgo de alucinacion inherente a un modelo de 7B, especialmente en tareas de codigo con APIs poco comunes o en razonamiento largo.
- Solo se distribuye una cuantizacion (Q5_K_M); no hay variantes Q4, Q8 ni fp16 en este repositorio.
- La informacion sobre idiomas y tool calling no esta confirmada para la version abliterated; conviene validarla antes de usarla en produccion.
- El repositorio es un espejo: no hay mantenimiento, issues ni soporte por parte de TheShellMaster mas alla de la replicacion.
- Licencia Apache-2.0 permite uso comercial, pero el autor original y los intermediarios (huihui-ai, bartowski) deben ser acreditados segun los terminos.
- El contexto de 32.768 tokens puede degradar la calidad en los extremos de la ventana; el KV cache consume VRAM adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/Cypher-Base-Qwen2.5-Coder-7B-Abliterated-GGUF
- Modelo derivado: https://huggingface.co/TheShellMaster/Cypher-2.5-OS
- Fuente GGUF: https://huggingface.co/bartowski/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF
- Abliteration fp16: https://huggingface.co/huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated
- Modelo raiz: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
