# tetu-AI/Tetu-Code-2

## Resumen

Tetu-Code-2 es un modelo de lenguaje decoder-only de 1.154.480.427 parámetros totales (475M activos por token) desarrollado por tetu-AI como proyecto de investigación independiente. Se trata de un agente de código entrenado desde cero con una arquitectura propia, sin reutilizar pesos de otros modelos, diseñado específicamente para funcionar en terminal a través de OpenCode. El modelo emplea una arquitectura personalizada de tipo "memoria grande con cómputo reducido": solo 475M parámetros intervienen en el cálculo por token, mientras que el resto actúa como memoria de lectura de bajo coste.

El modelo se entrenó con 7.080 millones de tokens, mayoritariamente código (Python en primer lugar, seguido de web y otros lenguajes), complementado con texto web en francés e inglés, matemáticas y páginas relacionadas con programación. La fase final del preentrenamiento incorpora trayectorias de agente, ejercicios de código con soluciones verificadas y commits. Posteriormente se realizó un ajuste fino orientado a agentes con 2.093 ejecuciones sobre proyectos reales multifichero, usando Qwen3.6-35B-A3B como profesor y verificación programática de cada demostración.

Su relevancia radica en demostrar que un modelo de 1,15B parámetros con solo 7.080M tokens de entrenamiento puede superar a modelos de código de 1B de 2023 (SantaCoder-1.1B, StarCoderBase-1B, InCoder-1.3B, CodeGen2-1B) en HumanEval+ y MBPP+, y operar como agente en OpenCode resolviendo 8 de 40 proyectos reales con tests ocultos. Todo el proyecto se ejecutó en una única GPU de consumo (RTX 5070, 12 GB) más unas 30 horas de GPU en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only con arquitectura personalizada (no compatible con `transformers`); 475M parámetros de cómputo por token y el resto como memoria de lectura de bajo coste |
| Parametros totales | 1.154.480.427 |
| Parametros activos | 475M (cómputo por token) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Python (principal), HTML, CSS, JavaScript y otros lenguajes de código; instrucciones en inglés y francés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es decoder-only y personalizada, desarrollada íntegramente por tetu-AI sin partir de pesos de otros modelos. La innovación estructural principal es la separación entre cómputo y memoria: de los 1,15B parámetros totales, solo 475M participan en el cálculo por token, mientras que el resto funciona como una memoria grande que el modelo lee con un coste computacional mínimo. El vocabulario es de 32.768 tokens, entrenado específicamente sobre código. Los pesos se distribuyen en bfloat16 en `model.safetensors`, y el repositorio ocupa 2,3 GB.

El preentrenamiento consumió 7.080 millones de tokens con una composición mayoritariamente de código (Python primero, después web y otros lenguajes), complementada con páginas web relacionadas con programación, texto web en francés e inglés y matemáticas. El último cuarto del preentrenamiento mezcla proyectos del profesor, ejercicios de programación cuyas soluciones pasan sus tests, trayectorias de agente y commits. El ajuste fino como agente se realizó sobre 2.093 ejecuciones en proyectos reales multifichero (herramientas de línea de comandos, juegos, sitios web, APIs, corrección de bugs y tests); el profesor Qwen3.6-35B-A3B (Apache 2.0) generó las demostraciones y un programa verificó cada una. Se añadieron además estados DAgger, en los que el propio modelo juega y el profesor proporciona la acción correcta. El modelo incorpora un modo de razonamiento que escribe una reflexión breve entre `<|think|>` y `<|/think|>` antes de cada acción, y una cabeza auxiliar que estima, para cada token, la probabilidad de que sea incorrecto.

## Capacidades

- Generación de código en Python como lenguaje principal, con soporte de HTML, CSS, JavaScript y otros lenguajes.
- Operación como agente de código en terminal mediante las herramientas de OpenCode: lectura, escritura y edición de ficheros, y ejecución de comandos.
- Razonamiento previo a la acción: emite un razonamiento corto entre `<|think|>` y `<|/think|>` antes de cada paso.
- Estimación de incertidumbre por token mediante una cabeza auxiliar que calcula la probabilidad de error.
- Soporte de tool calling en los formatos de herramientas de OpenCode 1.x y 2.x.
- Servidor compatible con la API de OpenAI incluido, con caché persistente entre turnos y bloqueo de llamadas idénticas repetidas.
- Capacidades multilingües limitadas a instrucciones en inglés y francés, con código como dominio central.
- Contexto largo de 65.536 tokens, adecuado para proyectos multifichero.

## Casos de uso

- Agente de código en terminal: el modelo se integra en OpenCode para leer, escribir y editar ficheros y ejecutar comandos sobre un proyecto real, aprovechando su contexto de 65.536 tokens para mantener varios ficheros en memoria durante la sesión.
- Automatización de tareas de mantenimiento en proyectos pequeños: corrección de bugs acotados, generación de tests y pequeñas refactorizaciones en directorios desechables o sandboxes, dado que el modelo puede escribir ficheros en rutas incorrectas y no debe ejecutarse sin supervisión sobre código crítico.
- Generación de funciones y scripts en Python: el modelo produce código a partir de una instrucción en inglés o francés, adecuado para prototipado rápido y ejercicios de programación verificables con tests.
- Asistencia en proyectos web estáticos: generación de HTML, CSS y JavaScript para sitios y prototipos, aprovechando el soporte de estos lenguajes en el vocabulario y en los datos de entrenamiento.
- Despliegue local en hardware de consumo: con 1,15B parámetros y pesos en bfloat16, el modelo cabe en GPUs de consumo y puede servirse con el servidor OpenAI-compatible incluido para integrarse en herramientas que hablen ese protocolo.
- Investigación sobre agentes de código de pequeño tamaño: sirve como base reproducible para estudiar destilación desde un profesor mayor (Qwen3.6-35B-A3B), verificación programática de demostraciones y estados DAgger en un presupuesto de cómputo reducido.
- Evaluación de incertidumbre en generación de código: la cabeza auxiliar de probabilidad de error por token permite experimentar con señalización de riesgo en pipelines de generación asistida.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (EvalPlus 0.3.1, decodificación greedy, una muestra por problema, prompt de chat). Una segunda ejecución con la misma configuración dio HumanEval+ 14,6 y MBPP+ 30,7, por lo que el autor indica un margen de ruido de aproximadamente ±1,5 puntos.

| Modelo | Tamaño | Tokens de entrenamiento | HumanEval+ | MBPP+ |
|---|---|---|---|---|
| DeepSeek-Coder-1.3B-instruct | 1,3B | 2T | 60,4 | 54,8 |
| DeepSeek-Coder-1.3B-base | 1,3B | 2T | 25,6 | 47,9 |
| Qwen2.5-Coder-0.5B (base) | 0,5B | 5,5T | 23,8 | 47,1 |
| Tetu Code 1 (modelo anterior) | 193M de cómputo | 7B | 18,3 | 27,5 |
| **Tetu Code 2** | **475M de cómputo** | **7,08B** | **15,9** | **30,7** |
| SantaCoder-1.1B | 1,1B | 236B | 14,0 | – |
| StarCoderBase-1B | 1B | 1T | 12,2 | – |
| InCoder-1.3B | 1,3B | ~60B | 11,0 | – |
| CodeGen2-1B | 1B | ~400B | 9,1 | – |

Resultados como agente:

| Métrica | Tetu Code 1 | Tetu Code 2 | Profesor (Qwen3.6-35B-A3B) |
|---|---|---|---|
| 40 proyectos reales reservados en OpenCode 2.1.4 (tests ocultos) | 0/40 | 8/40 | 29/40 |
| Benchmark de agente de función única (OpenCode 1.19.4) | 46,5 % | 28,5 % | 85,5 % |
| Pérdida de validación en Python (preentrenamiento) | 0,821 | 0,777 | – |

Velocidad en una RTX 5070: aproximadamente 143 tokens/s con contexto de 2k y 71 tokens/s con contexto de 16k.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,15B parámetros en bfloat16 los pesos ocupan unos 2,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor reporta ejecución en una RTX 5070 de 12 GB; también existe la opción `--cpu` en `chat.py` para funcionar sin GPU.
- Cabe en GPU de consumo: sí, según la ejecución reportada en RTX 5070 (12 GB).
- Opciones de despliegue: código de inferencia incluido en el repositorio (`chat.py` para chat en terminal y `python -m tetu_code.serve --model . --port 8070` para servidor OpenAI-compatible). La arquitectura es personalizada y no carga con `transformers`, por lo que no se puede usar con vLLM, llama.cpp, Ollama ni TGI salvo que se implemente soporte específico (no disponible).
- Latencia y throughput: aproximadamente 143 tokens/s a 2k de contexto y 71 tokens/s a 16k en una RTX 5070.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval+ | MBPP+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tetu-Code-2 | 1,15B totales (475M de cómputo) | 65.536 | 15,9 | 30,7 | Apache 2.0 | Hugging Face, código de inferencia propio |
| SantaCoder-1.1B | 1,1B | no disponible | 14,0 | no disponible | no disponible | Hugging Face |
| StarCoderBase-1B | 1B | no disponible | 12,2 | no disponible | no disponible | Hugging Face |
| DeepSeek-Coder-1.3B-base | 1,3B | no disponible | 25,6 | 47,9 | no disponible | Hugging Face |
| Qwen2.5-Coder-0.5B (base) | 0,5B | no disponible | 23,8 | 47,1 | no disponible | Hugging Face |

Tetu-Code-2 supera a los modelos de código de 1B de 2023 tras ver entre 30 y 140 veces menos tokens, pero queda por detrás de DeepSeek-Coder-1.3B y Qwen2.5-Coder-0.5B, que vieron entre 280 y 780 veces más tokens. La ventaja principal frente a estos últimos no es la precisión en generación de funciones, sino su integración específica como agente en OpenCode y su licencia Apache 2.0 explícita.

## Limitaciones y advertencias

- Es un modelo pequeño: con frecuencia falla la lógica desde el inicio o inventa variables.
- No repara sus propios tests fallidos: cuando sus tests fallan, tiende a reejecutar comandos en lugar de corregir el código.
- Sigue mal las conversaciones multiturno: puede pasar por alto una corrección o una segunda petición dada más tarde en la misma conversación.
- Es un agente, no un chatbot: en el chat de terminal simple (`chat.py`) a menudo intenta llamar a una herramienta; debe usarse a través de OpenCode.
- A veces escribe ficheros en la carpeta incorrecta; el servidor incluido reubica esas rutas dentro del proyecto.
- No debe ejecutarse sin supervisión sobre código importante: usar sandbox o un directorio desechable.
- La arquitectura personalizada impide cargarlo con `transformers` y con los runners estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita su integración en infraestructura existente.
- No se han publicado datos sobre sesgos conocidos ni sobre tipos de cuantización disponibles.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tetu-AI/Tetu-Code-2
- OpenCode: https://opencode.ai
- EvalPlus (HumanEval+ y MBPP+): https://github.com/evalplus/evalplus
- Los enlaces del repositorio a `assets/humaneval-plus.png`, `assets/mbpp-plus.png` y `assets/agent.png` forman parte de la model card en Hugging Face.
- Los resultados de búsqueda web sobre "têtu" corresponden al magazine LGBT+ francés (https://tetu.com/ y https://fr.wikipedia.org/wiki/T%C3%AAtu_(magazine)) y no guardan relación con el modelo; no se incluyen como enlaces relevantes.
