# wy8edhuh/Phi-4-Mini-Abliterated-Q4_K_M-GGUF

## Resumen

Este modelo es una conversión a formato GGUF con cuantización Q4_K_M del modelo `DuoNeural/Phi-4-Mini-Abliterated`, realizada por el usuario `wy8edhuh` mediante la herramienta GGUF-my-repo de llama.cpp. El modelo base es una versión "abliterada" de `microsoft/Phi-4-mini-instruct`, un modelo ligero de la familia Phi-4 desarrollado por Microsoft, con 3.836 millones de parámetros y una ventana de contexto de 128.000 tokens según la documentación oficial de Phi-4-mini.

La abliteración es una técnica que elimina las direcciones de rechazo aprendidas durante el entrenamiento con RLHF, de modo que el modelo deja de negarse a responder a ciertas peticiones. Esto lo hace atractivo para quienes buscan un modelo pequeño con buenas capacidades de razonamiento y matemáticas, pero sin las salvaguardas de seguridad del original. El archivo GGUF permite ejecutarlo fácilmente con llama.cpp, Ollama u otros motores compatibles, incluso en hardware modesto.

La relevancia actual radica en que Phi-4-mini destaca por su equilibrio entre tamaño y rendimiento, y la versión abliterada amplía su utilidad en escenarios donde el modelo original rechazaría peticiones legítimas (por ejemplo, generación de contenido creativo con temáticas sensibles). No obstante, hay que tener en cuenta que la abliteración también elimina mecanismos de seguridad importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer, pero no se confirma en esta card) |
| Parametros totales | 3.836.021.856 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128.000 tokens (segun documentacion de Phi-4-mini, no confirmado en esta card) |
| Tipos de cuantizacion | Q4_K_M (este archivo); el repo puede contener otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento en la model card de este repositorio. El modelo base `DuoNeural/Phi-4-Mini-Abliterated` es una modificacion de `microsoft/Phi-4-mini-instruct`, que segun la documentacion oficial de Microsoft es un modelo transformer entrenado con datos sinteticos y sitios web publicos filtrados, con enfasis en datos de razonamiento denso. La abliteracion se aplica posteriormente sobre los pesos del modelo original, eliminando las direcciones de rechazo. No se especifican detalles sobre el dataset de entrenamiento, el numero de tokens ni si se uso RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Phi-4-mini esta optimizado para tareas de razonamiento y matematicas, segun la documentacion de Microsoft.
- Soporte de function calling: segun la pagina de Ollama para Phi-4-mini, el modelo incluye soporte de function calling, una caracteristica anadida en esta version.
- Capacidades multilingues: aunque la model card indica solo ingles, la documentacion de Phi-4-mini menciona mejoras en soporte multilingue; sin embargo, no se puede confirmar en esta version abliterada.
- Sin rechazos: gracias a la abliteracion, el modelo no se niega a responder a peticiones que el original rechazaria, lo que amplia su rango de respuestas.
- No se mencionan capacidades de vision, audio u otras modalidades.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir textos sobre temas que el Phi-4-mini original rechazaria (por ejemplo, ficcion con violencia o contenido adulto), gracias a la abliteracion. Es adecuado para escritores que necesitan explorar tramas sin censura.
- Razonamiento y resolucion de problemas: con 3.8B de parametros y contexto de 128K, puede manejar problemas logicos y matematicos de cierta complejidad, util en entornos educativos o de investigacion.
- Integracion en pipelines de agentes con function calling: al soportar tool calling, puede integrarse en sistemas que necesitan llamar a APIs o ejecutar acciones, por ejemplo asistentes virtuales locales.
- Despliegue en hardware limitado: al ser un GGUF Q4_K_M de unos 2.5 GB, cabe en GPUs de gama media o incluso en CPU, permitiendo inferencia local en portatiles o servidores modestos.
- Prototipado rapido de aplicaciones de chat: con llama.cpp u Ollama, se puede montar un servidor de chat local en minutos, ideal para pruebas de concepto.
- Investigacion sobre abliteracion: este modelo sirve como ejemplo practico para estudiar los efectos de eliminar direcciones de rechazo en modelos pequenos, comparando su comportamiento con el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para esta version abliterada ni para el modelo base en esta card.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M pesa aproximadamente 2.5 GB, por lo que se necesita al menos 3-4 GB de VRAM para inferencia con GPU, o unos 4-5 GB de RAM para CPU.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores. Tambien funciona en Apple Silicon con Metal.
- Compatibilidad con consumer GPU: si, cabe en la mayoria de GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (requiere version 0.5.13 o posterior), llama-cpp-python, o cualquier motor compatible con GGUF.
- Latencia y throughput: no se dispone de datos medidos; en una GPU como RTX 3060 se puede esperar una velocidad de generacion de 20-40 tokens por segundo, pero no esta confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi-4-Mini-Abliterated (este) | 3.8B | 128K | MIT | GGUF | Sin salvaguardas, function calling |
| microsoft/Phi-4-mini-instruct | 3.8B | 128K | MIT | safetensors | Original con salvaguardas, function calling |
| Qwen2.5-3B-Instruct | 3.1B | 32K | Apache 2.0 | safetensors/GGUF | Alternativa con buen rendimiento en multilingue |
| Llama-3.2-3B-Instruct | 3.2B | 128K | Llama 3.2 | safetensors/GGUF | Alternativa de Meta, con salvaguardas |

La comparativa se basa en caracteristicas generales, ya que no hay datos de rendimiento disponibles para este modelo. La principal diferencia con el original es la ausencia de rechazos; frente a Qwen y Llama, destaca por su contexto largo y su licencia MIT permisiva.

## Limitaciones y advertencias

- La abliteracion elimina las salvaguardas de seguridad del modelo original, por lo que puede generar contenido ofensivo, peligroso o ilegal si se le pide. No debe usarse en aplicaciones donde se requiera moderacion de contenido.
- Solo se confirma soporte para ingles; aunque el modelo base podria soportar otros idiomas, no esta garantizado en esta version.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estandar es desconocido.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en punto flotante, lo que puede afectar a tareas de razonamiento complejo.
- La licencia MIT permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir con las leyes aplicables.
- El modelo no incluye mecanismos de seguridad adicionales; en produccion, se recomienda implementar filtros externos si es necesario.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/wy8edhuh/Phi-4-Mini-Abliterated-Q4_K_M-GGUF
- Modelo base (DuoNeural/Phi-4-Mini-Abliterated): https://huggingface.co/DuoNeural/Phi-4-Mini-Abliterated
- Modelo original de Microsoft (Phi-4-mini-instruct): https://huggingface.co/microsoft/Phi-4-mini-instruct
- Version GGUF de unsloth del modelo original: https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
- Pagina de Ollama para Phi-4-mini: https://ollama.com/library/phi4-mini
- Version abliterada en Ollama: https://ollama.com/huihui_ai/phi4-mini-abliterated:3.8b-q4_K_M
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
