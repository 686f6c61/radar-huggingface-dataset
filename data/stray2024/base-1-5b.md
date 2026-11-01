# Stray2024/BASE-1.5B

## Resumen

BASE-1.5B es un modelo de lenguaje de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) publicado por el desarrollador independiente Stray2024 en HuggingFace. Se construye sobre la arquitectura Qwen 2.5 1.5B, sobre la que se aplica un ajuste fino con LoRA y posteriormente una fusion completa de pesos en precision de 16 bits. Su proposito declarado es doble: actuar como modelo de razonamiento ligero, exponiendo un proceso de pensamiento previo a la respuesta dentro de etiquetas `<think>...</think>`, y funcionar como modelo conversacional de tipo "companion" para dialogo natural.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las propias de dicha licencia. Los idiomas declarados son ruso e ingles, y el repositorio ocupa 3,1 GB en formato safetensors. Se entrenó sobre dos conjuntos de datos propios del autor: `Stray2024/dialog-dataset-think` (dialogo con cadena de pensamiento) y `Stray2024/python-dataset-think` (codigo Python con razonamiento).

Su relevancia practica es limitada pero concreta: ofrece un modelo pequeno, desplegable en hardware de consumo, con capacidad de razonamiento explicito y generacion de codigo Python, en un formato compatible con el ecosistema de HuggingFace y con herramientas como Unsloth (etiqueta presente en el repositorio). No obstante, la ausencia total de benchmarks publicados y el bajo numero de descargas (104) y likes (0) obligan a tratar sus capacidades declaradas como no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 2.5 1.5B) con ajuste fino LoRA y fusion completa de pesos en 16 bits |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen 2.5 1.5B; no confirmada por el autor) |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors de 16 bits; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Pipeline | text-generation |
| Etiquetas | reasoning, think, unsloth, base, companion, sft, conversational |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen 2.5 1.5B, un transformer decoder-only denso de aproximadamente 1,5 mil millones de parametros. Sobre esa base, el autor aplica un ajuste fino supervisado (SFT) mediante LoRA y posteriormente fusiona los adaptadores con los pesos originales en precision de 16 bits, de modo que el resultado es un unico conjunto de pesos denso, sin adaptadores separados. La etiqueta `unsloth` sugiere que el entrenamiento se realizó con la libreria Unsloth, habitual para ajuste fino eficiente en memoria de modelos pequenos.

Los datos de entrenamiento declarados son dos datasets propios: `Stray2024/dialog-dataset-think`, orientado a conversacion con trazas de razonamiento, y `Stray2024/python-dataset-think`, orientado a generacion de codigo Python con cadena de pensamiento. No se especifica el numero de tokens de entrenamiento, la composicion exacta de los datasets, ni si se aplicaron fases de RLHF o DPO. La innovacion tecnica destacable es el formato de razonamiento explicito mediante etiquetas `<think>...</think>`, que el modelo emite antes de la respuesta final, tanto en tareas algoritmicas como en dialogo. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional multi-turno en ruso e ingles.
- Razonamiento explicito con cadena de pensamiento dentro de etiquetas `<think>...</think>` antes de la respuesta final.
- Generacion de codigo Python, segun el dataset de entrenamiento declarado (`python-dataset-think`).
- Razonamiento algoritmico y resolucion de problemas paso a paso.
- Perfil de "companion": dialogo natural orientado a conversacion abierta, segun la model card.
- Soporte de tool calling / function calling: no disponible (no declarado por el autor).
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible (no declarado; el razonamiento interno via `<think>` no equivale a capacidades de agente).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking: si, mediante etiquetas `<think>`.

## Casos de uso

- Asistente conversacional ligero en ruso o ingles: el modelo puede mantener dialogos multi-turno con un perfil de "companion", adecuado para prototipos de chatbots o asistentes personales que se ejecuten en hardware modesto gracias a sus 1,5 mil millones de parametros.
- Generacion de codigo Python en entornos de desarrollo: su entrenamiento sobre `python-dataset-think` lo hace util para autocompletar funciones, explicar fragmentos de codigo o proponer soluciones paso a paso dentro de un IDE o pipeline de CI/CD, siempre con revision humana.
- Ensenanza y tutoria de programacion: el formato `<think>...</think>` permite mostrar al estudiante el razonamiento intermedio antes de la solucion, lo que resulta didactico para explicar algoritmos.
- Razonamiento paso a paso en tareas de analisis: para problemas que requieren descomposicion logica (matematicas basicas, logica, planificacion sencilla), el modelo puede exponer su cadena de pensamiento y facilitar la auditoria del resultado.
- Despliegue en local o en el borde: con 1,5B de parametros y pesos en 16 bits (unos 3 GB), cabe en GPUs de consumo y en equipos con suficiente RAM, lo que permite inferencia privada sin conexion a servicios externos.
- Prototipado rapido y experimentacion con formatos de razonamiento: util como banco de pruebas para investigar tecnicas de chain-of-thought y etiquetas estructuradas en modelos pequenos antes de escalar a modelos mayores.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, sirve como base para ajustes adicionales con LoRA o SFT en dominios concretos (atencion al cliente en ruso, generacion de codigo especializado, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 3,1 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- Cuantizacion: no se distribuyen variantes GGUF, AWQ ni GPTQ en el repositorio; para reducir VRAM habria que convertir los pesos a otros formatos (por ejemplo, mediante llama.cpp o herramientas de cuantizacion de HuggingFace), lo que no esta documentado por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para 16 bits, como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien cabe en A100, H100 y L4 para despliegues en servidor.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas de VRAM en precision 16 bits; en GPUs con menos VRAM requeriria cuantizacion previa.
- Opciones de despliegue: transformers (carga directa de safetensors), vLLM y TGI para servir en produccion, llama.cpp u Ollama si se convierte a GGUF. No se documentan configuraciones oficiales de despliegue.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato | Benchmarks publicados |
|---|---|---|---|---|---|---|
| BASE-1.5B (Stray2024) | 1,54B | no disponible | Apache 2.0 | ru, en | safetensors | no |
| Qwen2.5-1.5B (Alibaba) | 1,54B | 32.768 tokens (segun documentacion oficial de Qwen2.5) | Apache 2.0 | multilingue (incluye en, ru) | safetensors, GGUF | si (MMLU, GSM8K, HumanEval, etc.) |
| Llama 3.2 1B (Meta) | 1,24B | 128.000 tokens | Llama 3.2 Community License | multilingue | safetensors, GGUF | si |
| Gemma 2 2B (Google) | 2,6B | 8.192 tokens | Gemma Terms of Use | multilingue | safetensors, GGUF | si |

La comparativa se basa en las especificaciones publicas de los modelos alternativos; los datos de contexto y licencia de BASE-1.5B no estan confirmados por el autor mas alla de lo indicado. BASE-1.5B se diferencia de sus alternativas por el formato de razonamiento `<think>` y por su orientacion a ruso e ingles, pero carece de benchmarks y de variantes cuantizadas oficiales, lo que dificulta una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: las capacidades declaradas (razonamiento, codigo Python, dialogo) no estan verificadas de forma independiente.
- Riesgo de alucinacion: al ser un modelo de 1,5B ajustado con datasets propios de los que no se detalla composicion ni volumen, la fiabilidad factual es incierta y debe validarse en produccion.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datasets propios no auditados, pueden persistir sesgos de los datos de dialogo y de codigo utilizados.
- Limitaciones de idioma: solo se declaran ruso e ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Longitud de contexto: no confirmada por el autor; aunque herede la de Qwen 2.5 1.5B, no hay verificacion de que el ajuste fino la preserve.
- Formato de razonamiento: el uso de etiquetas `<think>` requiere que el consumidor parsee y separe el pensamiento de la respuesta final; no se documenta un formato de prompt oficial.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen 2.5 conviene revisar las condiciones de la licencia original del backbone (tambien Apache 2.0) y citar adecuadamente.
- Madurez del proyecto: 104 descargas y 0 likes en el momento de la consulta; es un modelo de autor individual sin soporte comunitario ni mantenimiento documentado.
- Cuantizaciones no oficiales: cualquier conversion a GGUF/AWQ/GPTQ corre por cuenta del usuario y puede degradar el rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Stray2024/BASE-1.5B
- Perfil del autor: https://huggingface.co/Stray2024
- Dataset de dialogo: https://huggingface.co/datasets/Stray2024/dialog-dataset-think
- Dataset de Python: https://huggingface.co/datasets/Stray2024/python-dataset-think
