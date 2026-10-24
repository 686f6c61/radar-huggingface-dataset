# togethercomputer/HybridAgent-14B-Agentic

## Resumen

HybridAgent-14B-Agentic es un modelo de lenguaje para tareas de agente desarrollado por Together Computer, construido sobre el checkpoint base Qwen/Qwen3-14B-Base (14.765.593.600 parametros segun los pesos en safetensors). Su particularidad es que combina razonamiento latente y generacion de texto en un mismo proceso generativo: el modelo "piensa" en un espacio continuo mediante un modulo ligero denominado HybridLink y "actua" emitiendo texto, con capacidad de invocar un interprete de Python y una herramienta de busqueda web a lo largo de multiples turnos sobre una memoria de trabajo compartida.

El checkpoint se ha entrenado con un pipeline de dos fases, HybridSFT seguido de HybridRL, y se distribuye con licencia MIT, lo que facilita su uso comercial. Frente a los modelos de razonamiento que solo operan en texto, la propuesta aqui es que cada paso latente pueda leerse como pseudo-texto, lo que abre la puerta a inspeccionar y depurar el razonamiento interno del agente sin renunciar a la eficiencia del calculo en espacio continuo.

Es relevante ahora porque traslada el debate sobre razonamiento explicito versus implicito al terreno de los agentes con herramientas: el modelo no solo razona, sino que encadena llamadas a herramientas durante varios turnos manteniendo el estado. El repositorio incluye tanto los pesos estandar de Transformers como el adaptador HybridLink (`adapter.pt`), y el uso completo requiere el codigo del proyecto HybridAgent, no solo `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-14B-Base) con modulo HybridLink para razonamiento latente |
| Parametros totales | 14.765.593.600 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precision completa y `adapter.pt`) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + adaptador PyTorch (`adapter.pt`) con `adapter_config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer de 14.765.593.600 parametros inicializado desde Qwen/Qwen3-14B-Base. Sobre ese backbone se anade HybridLink, un modulo ligero cuyos pesos se publican aparte en `adapter.pt`. La generacion hibrida alterna pasos en espacio latente continuo, delimitados por los tokens ancla `<latent>` y `</latent>` incluidos en el tokenizador, con pasos de texto convencional. Durante una misma generacion el agente puede pensar en latente, emitir texto, invocar el interprete de Python o la busqueda web y continuar el razonamiento, todo sobre una memoria de trabajo compartida entre turnos.

El entrenamiento consta de dos fases: HybridSFT (ajuste supervisado con trayectorias de agente) y HybridRL (refuerzo sobre esas capacidades). La model card no detalla el volumen de tokens, la composicion del dataset ni los detalles del algoritmo de RL, por lo que esos datos no estan disponibles. La innovacion destacable es la legibilidad del razonamiento latente: cada paso latente puede volcarse como pseudo-texto mediante la herramienta `interpretable_latent_mode`, que genera un informe HTML de la trayectoria. Cargar el backbone unicamente con `transformers` produce un modelo solo de texto; la generacion hibrida con modo latente y herramientas exige el paquete `hybrid_agent`.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno.
- Razonamiento latente en espacio continuo, alternado con emision de texto en la misma generacion.
- Lectura interpretable de los pasos latentes como pseudo-texto (informe HTML via `interpretable_latent_mode`).
- Uso de herramientas: interprete de Python y busqueda web (requiere `TAVILY_API_KEY`).
- Comportamiento agentico multi-paso con memoria de trabajo compartida entre turnos.
- Ejecucion de inferencia por lotes sobre ficheros JSONL (`hybrid_inference.run_batch`).
- Capacidad multilingue: no disponible; la model card solo declara ingles.
- Vision, audio o modo thinking explicito separado: no disponible en la informacion proporcionada.

## Casos de uso

- Resolucion de problemas matematicos con verificacion computacional: el agente razona en latente, escribe y ejecuta codigo Python para calcular el resultado (por ejemplo, cuantos ceros finales tiene 100!) y contrasta la salida antes de responder.
- Investigacion con busqueda web aumentada: ante una pregunta que requiere datos actuales, el modelo planifica la consulta, invoca la herramienta de busqueda, integra los resultados en la memoria de trabajo y sintetiza una respuesta citando lo recuperado.
- Agentes de analisis de datos en pipelines internos: carga de un dataset, generacion de codigo de transformacion, ejecucion en el interprete y validacion iterativa de resultados en una sola trayectoria.
- Automatizacion de tareas de back-office con varios pasos: consulta de una fuente externa, calculo intermedio y redaccion del informe final, manteniendo el estado entre turnos.
- Depuracion y auditoria de razonamiento: uso de `interpretable_latent_mode` para volcar los pensamientos latentes a pseudo-texto y revisar por que el agente tomo una decision o llamo a una herramienta concreta.
- Evaluacion de agentes en investigacion: generacion de trayectorias por lotes sobre un JSONL de preguntas y analisis posterior de las secuencias de llamadas a herramientas.
- Asistentes tecnicos con ejecucion de codigo: el modelo puede proponer un script, ejecutarlo y corregir errores a partir del traceback dentro del mismo bucle agentico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en precision completa: el repositorio ocupa 29,6 GB, coherente con 14.765.593.600 parametros en BF16/FP16 (aproximadamente 29,5 GB solo de pesos).
- VRAM estimada para inferencia: alrededor de 30 GB en BF16/FP16 sin contar cache KV; en cuantizacion de 8 bits se situaria en torno a 15-16 GB y en 4 bits en torno a 8-9 GB (estimaciones, no verificadas en la informacion proporcionada).
- GPU recomendadas: A100 40 GB o H100 para BF16 con margen para cache KV y contexto; A100 80 GB si se necesita contexto largo o lotes mayores.
- GPU de consumo: una RTX 4090 (24 GB) no admite los pesos en BF16 completos; requeriria cuantizacion a 8 o 4 bits, no publicada oficialmente en el repositorio.
- Opciones de despliegue: el modo hibrido con herramientas necesita el paquete `hybrid_agent` del repositorio de GitHub y el adaptador `adapter.pt`; `transformers` por si solo solo ofrece el backbone en modo texto. Soporte en vLLM, TGI, llama.cpp u Ollama: no disponible en la informacion proporcionada (no se publican pesos GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento latente | Herramientas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HybridAgent-14B-Agentic | 14.765.593.600 | no disponible | Si (HybridLink, lectura como pseudo-texto) | Python y busqueda web | MIT | HuggingFace + repo GitHub |
| HybridAgent-8B-Agentic | no disponible en la informacion proporcionada (variante 8B) | no disponible | Si (misma familia) | Python y busqueda web | no disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen3-14B-Base | no disponible en la informacion proporcionada | no disponible | No | No especifico | no disponible en la informacion proporcionada | HuggingFace (modelo base) |

La comparacion con modelos agenticos de otros fabricantes (por ejemplo, familias con tool calling nativo) no se puede completar con datos verificables a partir de la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: la model card solo declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Dependencia de codigo externo: el modo latente y las herramientas requieren el paquete `hybrid_agent`; la carga con `transformers` estandar degrada el modelo a generacion de texto.
- Dependencia de servicios de terceros: la busqueda web necesita una clave de API de Tavily, lo que introduce un coste y un punto de fallo externos.
- Ejecucion de codigo: el interprete de Python ejecuta codigo generado por el modelo; en produccion es imprescindible sandboxing y limites de recursos.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de error en la informacion disponible.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la model card.
- Contexto: se desconoce la longitud de contexto efectiva y como se comporta la memoria de trabajo compartida en trayectorias muy largas.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-14B-Base y de las herramientas externas invocadas.
- Benchmarks ausentes: no hay datos publicos que permitan estimar su calidad frente a alternativas, lo que dificulta justificar su eleccion en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/togethercomputer/HybridAgent-14B-Agentic
- Variante 8B: https://huggingface.co/togethercomputer/HybridAgent-8B-Agentic
- Paper "Hybrid Reasoning Agents": https://arxiv.org/pdf/2610.18861
- Abstract del paper: https://arxiv.org/abs/2610.18861
- Codigo: https://github.com/togethercomputer/HybridAgent
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
