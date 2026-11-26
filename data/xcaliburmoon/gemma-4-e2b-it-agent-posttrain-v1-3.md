# XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.3

## Resumen

gemma-4-E2B-it-agent-posttrain-v1.3 es un ajuste fino del modelo instructivo google/gemma-4-E2B-it, publicado por el usuario XcaliburMoon en Hugging Face. No se trata de un modelo de chat general, sino de un artefacto de investigación diseñado para un único entorno de ejecución (harness): el modelo emite exactamente un objeto JSON de llamada a herramienta por turno contra un conjunto fijo de diez herramientas simuladas. El runtime parsea esa acción, ejecuta la herramienta y devuelve el resultado como observación en el siguiente turno.

El modelo parte de una base Gemma 4 con 4.628.569.635 parámetros totales en formato safetensors y se ha post-entrenado mediante QLoRA de 4 bits (nf4, doble cuantización) sobre 91 registros supervisados, durante 6 épocas y 72 pasos, con una pérdida final de 0,1280. El entrenamiento se realizó en una única NVIDIA GeForce RTX 4090 en aproximadamente 0,1 horas, lo que da una idea de la escala modesta del ajuste: no es un reentrenamiento profundo, sino una especialización superficial sobre la base instructiva.

Su relevancia es acotada y conviene subrayarla: el propio autor lo describe como un artefacto de investigación para un solo harness y advierte explícitamente de que no debe usarse como modelo de chat general ni en escenarios donde una respuesta no parseada pudiera desencadenar acciones. La ficha, por tanto, debe leerse como la evaluación de un componente de agente muy especializado, no como la de un modelo fundacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 E2B instruct); no se detalla configuración interna en la información disponible |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--ctx-size 4096` |
| Tipos de cuantizacion | GGUF Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0; pesos base en bf16; adaptador LoRA en safetensors |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma Terms of Use (heredada del modelo base); la model card no declara un identificador de licencia en los metadatos del Hub |
| Formato de pesos | safetensors (merged-bf16 y adaptador), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo google/gemma-4-E2B-it, un transformer decoder-only de la familia Gemma 4. La información proporcionada no detalla la configuración interna de capas, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa u otros), por lo que esos extremos quedan como no disponibles. El repositorio contiene tres formas del modelo: los pesos fusionados en bf16 (`merged-bf16`, 10,21 GB), el adaptador LoRA (`adapter`, 96,7 MB) y seis cuantizaciones GGUF para llama.cpp, desde Q2_K (2,98 GB) hasta Q8_0 (4,95 GB).

El post-entrenamiento se realizó con QLoRA de 4 bits (nf4 con doble cuantización) continuando desde los pesos fusionados de la versión v1.1. Los hiperparámetros declarados son: 91 registros supervisados, longitud de secuencia 768, batch efectivo 8, 6 épocas, learning rate 5e-05, 72 pasos, pérdida final 0,1280, LoRA con r=16, alpha=32 y dropout=0,05. La plantilla de chat se aplica con `enable_thinking=False` y la receta enmascara explícitamente el prompt en lugar de depender de la forma de los datos. No hubo etapa de preferencias (RLHF/DPO): solo fine-tuning supervisado. Las observaciones de herramientas durante el entrenamiento fueron fixtures, es decir, el modelo nunca vio salidas reales de shell.

## Capacidades

- Generación de llamadas a herramienta en formato JSON: emite un único objeto por turno, por ejemplo `{"action": "tool", "tool": "read_file", "args": {"path": "notes.txt"}}`.
- Operación sobre una superficie fija de diez herramientas simuladas definidas en el system prompt como menú.
- Integración en bucle de agente: el runtime parsea la acción, la ejecuta y realimenta el resultado como observación.
- Comprensión de instrucciones en inglés para tareas cortas de un solo paso.
- No soporta tool calling abierto ni herramientas fuera del menú entrenado.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso autónomo.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo de pensamiento (thinking) activado; se entrena y ejecuta con `enable_thinking=False`.

## Casos de uso

- Automatización de lectura de ficheros en un harness controlado: el modelo recibe el menú de herramientas y emite `read_file` con la ruta solicitada; el runtime valida y ejecuta, y el resultado se realimenta como observación. Adecuado porque el formato de salida es estrictamente parseable.
- Enrutamiento de acciones en un agente de escritorio simulado: dado un objetivo corto en inglés, el modelo selecciona una de las diez herramientas del menú (leer, escribir, listar, etc.) y produce los argumentos en JSON, lo que permite integrarlo en un bucle de ejecución determinista.
- Evaluación de pipelines de agentes: al ser un artefacto de investigación con un harness reproducible (`tools-pair-builder`), sirve para medir la tasa de acierto de selección de herramienta y de valores de argumentos en un entorno acotado.
- Pruebas de robustez de parsers: el modelo genera salidas JSON estructuradas que permiten validar el comportamiento de parsers y validadores de esquema antes de conectar herramientas reales.
- Despliegue ligero en local con llama.cpp: con Q4_K_M (3,42 GB) puede ejecutarse en una estación de trabajo con GPU consumer para experimentación con el harness, usando `llama-server -m gguf/gemma-agent-Q4_K_M.gguf --port 8080 --ctx-size 4096`.
- Docencia y reproducción de recetas QLoRA: el repositorio documenta hiperparámetros, linaje de builds y digests, lo que facilita reproducir el ajuste sobre una RTX 4090 en tiempos muy reducidos (0,1 h declaradas).
- No recomendado para atención al cliente, generación de código en producción ni asistentes conversacionales generales: la model card lo excluye explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que ningún run del harness ha cargado los pesos de esta versión (digest `79685e759656` para Q4_K_M) y que las cifras de builds anteriores (repair-v1 con 17 celdas y sft-41k con 4 celdas) no son transferibles a estos pesos. Por tanto, no se reporta precisión por ronda para esta build.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB para Q4_K_M, 5-5,5 GB para Q8_0 y en torno a 11-12 GB para los pesos fusionados en bf16 (más overhead de contexto y KV cache).
- GPU recomendadas: NVIDIA RTX 4090 (la misma usada para el entrenamiento), A100 o H100 para despliegues con mayor concurrencia; cualquier GPU consumer con al menos 6-8 GB de VRAM para las cuantizaciones Q4/Q5.
- Cabe en GPU consumer: sí, con Q2_K a Q8_0 en tarjetas de 6 GB o más; Q4_K_M es la opción equilibrada.
- Opciones de despliegue: llama.cpp / llama-server (soportado explícitamente con los GGUF), transformers con `merged-bf16` o cargando el adaptador sobre la base, y servidores compatibles con endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-agent-posttrain-v1.3 | 4.628.569.635 | no disponible (ejemplo con 4096) | Tool calling cerrado sobre 10 herramientas, inglés | Gemma Terms of Use | Hugging Face (278 descargas) |
| google/gemma-4-E2B-it (base) | no disponible en la información | no disponible | Chat instructivo general | Gemma Terms of Use | Hugging Face |
| Alternativas de tool calling de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado sobre una única superficie de herramientas: cualquier herramienta fuera del menú de diez no existe para el modelo.
- Solo fine-tuning supervisado, sin etapa de preferencias; los fallos medidos son elección de herramienta incorrecta y valores erróneos en herramientas con descripciones parecidas, precisamente el tipo de error que abordaría una etapa de preferencias.
- Solo inglés, tareas cortas y una llamada por turno.
- Las observaciones durante el entrenamiento fueron fixtures: el modelo nunca vio salidas reales de shell y puede equivocarse con seguridad sobre lo que devolvió un comando.
- Los ficheros cuantizados son lossy respecto a `merged-bf16`; debe evaluarse la cuantización que se vaya a desplegar, no la que mejor aspecto tenga en la tabla.
- No es un modelo de chat general y no debe usarse donde una respuesta no parseada pudiera ejecutarse como acción.
- Licencia heredada Gemma Terms of Use: revisar antes de redistribuir o desplegar comercialmente.
- El repositorio mantiene una sola versión a la vez y no tiene tags; `main` es la única dirección y una carga posterior reemplaza los ficheros existentes, lo que complica la reproducibilidad.
- Riesgo de alucinación en la descripción de resultados de herramientas y en la selección de argumentos; sin datos de sesgo publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.3
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Términos de uso de Gemma: no disponible en la información proporcionada
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
