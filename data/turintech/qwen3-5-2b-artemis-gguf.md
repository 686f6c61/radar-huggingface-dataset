# turintech/Qwen3.5-2B-Artemis-GGUF

## Resumen
Qwen3.5-2B-Artemis-GGUF es una cuantización en formato GGUF del modelo base Qwen/Qwen3.5-2B, publicada por TurinTech (turintech) bajo el marco de trabajo que la empresa denomina Artemis. El modelo está pensado para ejecutar tareas de generación de texto, razonamiento matemático, seguimiento de instrucciones y llamadas a funciones (function calling) en hardware de gama baja, incluyendo GPUs de consumo. Con 1.881.825.088 parámetros totales, se posiciona en la franja de los modelos pequeños, donde la eficiencia de memoria y la velocidad de inferencia priman sobre el conocimiento enciclopédico.

La relevancia de esta publicación radica en su enfoque práctico: TurinTech ha medido y documentado el rendimiento del modelo en cuatro benchmarks concretos (BFCL live, GSM8K, MMLU-Pro e IFEval) y ha optimizado la cuantización para reducir el consumo de memoria. Según la model card, el archivo Q5_K_M ocupa 1,395 GB y requiere 2,1 GiB de VRAM en modo texto con una sola ranura, frente a los 4,3 GiB del modelo original. Además, el pipeline declarado es image-text-to-text, lo que indica que el modelo base conserva capacidades de visión, aunque la cuantización se distribuye con un proyector visual separado de 668 MB.

La licencia Apache 2.0 facilita su adopción tanto en proyectos personales como comerciales. El modelo se distribuye exclusivamente en GGUF, lo que lo hace compatible con llama.cpp, Ollama y LM Studio, y está etiquetado como compatible con endpoints, lo que sugiere su uso en servicios desplegados con APIs compatibles con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles específicos de la arquitectura del modelo base no disponibles) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (configurado en los ejemplos de la model card con `-c 8192`) |
| Tipos de cuantizacion | GGUF; se menciona explícitamente Q5_K_M y Q4_K_M (selección por defecto en importaciones de Ollama y descargas sin etiqueta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento
El modelo es una cuantización del base Qwen/Qwen3.5-2B, por lo que hereda la arquitectura transformer de la familia Qwen3.5. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Tampoco se especifican innovaciones arquitectónicas concretas más allá de las propias de Qwen3.5.

La aportación de TurinTech se centra en el proceso de cuantización y en la evaluación del modelo resultante. La model card indica que los resultados se midieron con decodificación greedy y con el modo thinking desactivado, y que la conversión del proyector visual se realizó y verificó con la build b11889 de llama.cpp. El modelo incluye un proyector visual (mmproj) de 668 MB que se descarga y carga automáticamente al usar `-hf` sin la opción `--no-mmproj`, lo que habilita el procesamiento de imágenes. La cuantización Q5_K_M reduce el peso a 1,395 GB y el consumo de VRAM a 2,1 GiB en modo texto con una sola ranura, lo que representa una optimización significativa respecto a los 4,3 GiB del modelo original.

## Capacidades
- Generación de texto conversacional y seguimiento de instrucciones, con un rendimiento medido de 374 de 539 instrucciones seguidas en IFEval.
- Razonamiento matemático: 190 de 250 respuestas correctas en el último tramo de GSM8K.
- Llamadas a funciones (function calling): 184 de 258 llamadas correctas en BFCL live, una capacidad central del modelo según su etiquetado.
- Procesamiento de imágenes: el pipeline es image-text-to-text y se distribuye un proyector visual separado, aunque la model card no detalla tareas concretas de visión.
- Razonamiento de conocimiento general: 69 de 280 respuestas correctas en una muestra de MMLU-Pro.
- Modo thinking desactivable mediante `chat_template_kwargs.enable_thinking`, pensado para reducir latencia en producción.
- Compatibilidad con endpoints y con el ecosistema llama.cpp, Ollama y LM Studio.
- Capacidades multilingües: no disponibles (no se especifican idiomas soportados).

## Casos de uso
- Asistente de atención al cliente en local: el modelo puede gestionar conversaciones multi-turno con una ventana de 8.192 tokens y ejecutar llamadas a funciones para consultar pedidos o estados de cuenta, sin depender de servicios en la nube. Su reducido consumo de VRAM (2,1 GiB) permite desplegarlo en servidores modestos.
- Automatización de tareas con tool calling: con 184 de 258 llamadas correctas en BFCL live, es adecuado para flujos donde el modelo debe seleccionar y parametrizar funciones de una API, como reservas, consultas meteorológicas o gestión de calendario.
- Tutor de matemáticas básicas: su rendimiento en GSM8K (190 de 250) lo hace útil para resolver problemas aritméticos de varios pasos en aplicaciones educativas, con la ventaja de ejecutarse en una GPU de consumo.
- Procesamiento de documentos con imágenes: gracias al proyector visual, puede emplearse para extraer información de capturas, formularios o diagramas simples en pipelines de digitalización, siempre que se cargue el mmproj.
- Prototipado rápido en estaciones de trabajo: al estar disponible en Ollama y LM Studio, un desarrollador puede probar flujos conversacionales y de function calling en minutos, sin configurar infraestructura de GPU dedicada.
- Agentes locales de automatización: su compatibilidad con endpoints y su bajo consumo permiten integrarlo en agentes que ejecutan tareas de varios pasos en entornos con recursos limitados, como raspberry pi con GPU integrada o portátiles con RTX de gama media.
- Filtrado y clasificación de instrucciones: su rendimiento en IFEval sugiere que puede usarse para validar o reescribir instrucciones en pipelines de preprocesamiento, con la ventaja de ser un modelo pequeño y rápido.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| BFCL live | Llamadas a funciones correctas | 184 de 258 | Modo thinking desactivado; el modelo original obtuvo 182 |
| GSM8K (últimas 250) | Respuestas correctas | 190 de 250 | Modo thinking desactivado |
| MMLU-Pro (muestra) | Respuestas correctas | 69 de 280 | Modo thinking desactivado |
| IFEval | Instrucciones seguidas | 374 de 539 | Modo thinking desactivado |

Los resultados proceden de la model card del autor y no han sido verificados de forma independiente (campo `verified: false`). La model card indica que la tabla de resultados se midió con decodificación greedy y thinking desactivado, y que una ejecución anterior en una GTX 1080 Ti también utilizó muestreo.

## Requisitos de hardware
- VRAM estimada: 2,1 GiB en modo texto con una sola ranura para la cuantización Q5_K_M; el modelo original requiere 4,3 GiB.
- Tamaño del archivo: 1,395 GB para Q5_K_M; el repositorio completo ocupa 4,0 GB.
- Proyector visual: 668 MB adicionales si se habilita el procesamiento de imágenes.
- GPU recomendadas: el modelo cabe en GPUs de consumo como la GTX 1080 Ti (mencionada en la model card) y en cualquier GPU con al menos 3 GB de VRAM libre. Para despliegues con concurrencia, se recomienda una RTX 3060 o superior.
- Opciones de despliegue: llama.cpp (build b11617 o superior para los resultados reportados; b11889 para el proyector visual), Ollama (`ollama run turintech/qwen3.5-2b-artemis`) y LM Studio (`turintech/qwen3.5-2b-artemis`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL live | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-Artemis-GGUF | 1,88 B | 8.192 (configurado) | 184/258 | 190/250 | Apache 2.0 | GGUF |
| Qwen3.5-2B (original) | 1,88 B | no disponible | 182/258 | no disponible | Apache 2.0 | safetensors |
| Otros modelos pequeños de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base Qwen3.5-2B, del que se conoce el resultado en BFCL live (182 de 258) y el consumo de VRAM (4,3 GiB). No se dispone de datos de benchmarks de otros modelos comparables en la información suministrada.

## Limitaciones y advertencias
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El rendimiento en MMLU-Pro es bajo (69 de 280), lo que indica conocimientos generales limitados; no es adecuado para tareas que requieran amplio conocimiento enciclopédico.
- El modelo está pensado para ejecutarse con thinking desactivado; si se activa, el comportamiento y los resultados pueden diferir de los reportados.
- No se especifican los idiomas soportados, por lo que su rendimiento en castellano u otros idiomas distintos del inglés no está documentado.
- La ventana de contexto configurada en los ejemplos es de 8.192 tokens; no se confirma si el modelo base soporta contextos mayores.
- El procesamiento de imágenes requiere cargar el proyector visual, lo que añade 668 MB de memoria y puede no estar soportado en todas las configuraciones de llama.cpp.
- Riesgo de alucinación inherente a los modelos de 2B parámetros, especialmente en tareas de conocimiento general y razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen3.5-2B para confirmar compatibilidad.
- La cuantización Q5_K_M puede introducir pérdidas de precisión respecto al modelo original; de hecho, el resultado en BFCL live mejora ligeramente (184 frente a 182), pero no se garantiza en todas las tareas.

## Enlaces
- Hugging Face: https://huggingface.co/turintech/Qwen3.5-2B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Ollama: https://ollama.com/turintech/qwen3.5-2b-artemis
- LM Studio: https://lmstudio.ai/turintech/qwen3.5-2b-artemis
- TurinTech: https://www.turintech.ai
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
