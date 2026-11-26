# tetu-AI/Tetu-Code-2

## Resumen

Tetu-Code-2 es un modelo de lenguaje especializado en generación de código y en actuar como agente de programación en terminal, desarrollado por tetu-AI. Se trata de un transformer decoder-only de arquitectura propia, entrenado desde inicialización aleatoria (sin pesos preentrenados), con 1.154.480.427 parámetros totales de los cuales 475 millones son activos por token; el resto corresponde a una memoria de tipo lookup con coste computacional despreciable. Su ventana de contexto es de 65.536 tokens y su vocabulario de 32.768 tokens.

El modelo está diseñado para ejecutarse dentro de OpenCode, donde lee y edita ficheros, ejecuta comandos y reporta lo que ha hecho. Incorpora razonamiento escrito breve entre los tokens `<|think|>` y `<|/think|>` antes de cada acción, una cabeza de confianza por token que estima la probabilidad de error y un servidor compatible con la API de OpenAI que mantiene la caché KV entre turnos. Qwen3.6-35B-A3B (Apache 2.0) actuó como profesor para generar las demostraciones de agente, verificadas programáticamente antes del entrenamiento.

Es relevante por su planteamiento de eficiencia extrema: alcanza resultados por encima de modelos de código de 1B de 2023 (SantaCoder-1.1B, StarCoderBase-1B) con entre 30 y 140 veces menos tokens de entrenamiento, y entrena en una única RTX 5070 de 12 GB más unas 30 horas de GPU en la nube. Su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (custom, no soportada por `transformers`) |
| Parametros totales | 1.154.480.427 |
| Parametros activos | 475M por token (el resto es memoria lookup con coste computacional despreciable) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, fr, code (Python primero; tambien HTML, CSS, JavaScript y otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de diseño propio, no compatible con `transformers`, por lo que requiere el código de inferencia incluido en el repositorio. Emplea un vocabulario de 32.768 tokens y combina 475M parámetros activos por token con una memoria de tipo lookup de coste computacional despreciable que eleva el total a 1,15B. Incluye una cabeza de confianza por token que estima la probabilidad de error.

El entrenamiento se dividió en tres etapas. El preentrenamiento usó 7,08B tokens, mayoritariamente código (Python primero, después web y otros lenguajes), junto con páginas web relacionadas con código, texto web en francés e inglés y matemáticas. La etapa de annealing añadió en su último cuarto proyectos del profesor, ejercicios cuyas soluciones pasan sus tests, trayectorias de agente y commits. El fine-tuning de agente empleó 2.093 ejecuciones verificadas del profesor sobre proyectos multifichero (herramientas CLI, juegos, webs, APIs, corrección de bugs, tests), más estados de DAgger en los que el modelo actúa y el profesor proporciona la acción correcta. El entrenamiento se ejecutó en una RTX 5070 de 12 GB más unas 30 horas de GPU en la nube, partiendo de inicialización aleatoria.

## Capacidades

- Generación de código, con Python como lenguaje principal y soporte de HTML, CSS, JavaScript y otros.
- Uso de herramientas a través de OpenCode: read, write, edit, bash, glob y grep.
- Razonamiento escrito breve entre `<|think|>` y `<|/think|>` antes de cada acción.
- Cabeza de confianza por token que estima la probabilidad de error.
- Servidor compatible con OpenAI (`tetu_code.serve`) para los formatos de herramientas de OpenCode 1.x y 2.x, con caché KV persistente entre turnos y parada de llamadas repetidas idénticas a herramientas.
- Soporte de instrucciones en inglés y francés.
- Ejecución de tareas de agente multifichero: creación de herramientas CLI, juegos, webs, APIs, corrección de bugs y escritura de tests.

## Casos de uso

- Agente de programación en terminal: integrado en OpenCode, el modelo lee y edita ficheros del proyecto, ejecuta comandos de shell y reporta los cambios, adecuado para tareas de refactorización y corrección de bugs en proyectos multifichero dentro de su ventana de 65.536 tokens.
- Generación de código Python en pipelines: con 30,7 % de pass@1 en MBPP+ y 15,9 % en HumanEval+, sirve para autocompletar funciones y generar tests en flujos con revisión humana.
- Automatización de tareas CLI: su uso de bash, glob y grep permite construir scripts que localicen ficheros, inspeccionen su contenido y apliquen cambios acotados en un directorio desechable.
- Prototipado rápido de webs y APIs: el modelo genera HTML, CSS y JavaScript, útil para esbozar interfaces y endpoints a partir de instrucciones en inglés o francés.
- Servidor local compatible con OpenAI: `tetu_code.serve` expone el modelo en `http://127.0.0.1:8070/v1` con caché KV entre turnos, lo que permite conectarlo a clientes que hablen la API de OpenAI y mantener conversaciones multi-turno con contexto largo.
- Ejecución en hardware de consumo: con 1,15B parámetros y pesos bfloat16 (repo de 2,3 GB), puede desplegarse en una GPU de 12 GB como la RTX 5070, con aproximadamente 143 tokens/s a 2k de contexto y 71 tokens/s a 16k, lo que lo hace viable para desarrollo local.
- Detección de errores asistida: la cabeza de confianza por token permite señalizar fragmentos de código con mayor probabilidad de fallo para revisión humana.

## Benchmarks y rendimiento

Datos declarados por el autor (EvalPlus 0.3.1, decodificación greedy, una muestra por problema, prompt de chat):

| Modelo | Tamano | Tokens de entrenamiento | HumanEval+ | MBPP+ |
|---|---|---|---|---|
| DeepSeek-Coder-1.3B-instruct | 1.3B | 2T | 60.4 | 54.8 |
| DeepSeek-Coder-1.3B-base | 1.3B | 2T | 25.6 | 47.9 |
| Qwen2.5-Coder-0.5B (base) | 0.5B | 5.5T | 23.8 | 47.1 |
| Tetu Code 1 (modelo anterior) | 193M activos | 7B | 18.3 | 27.5 |
| **Tetu Code 2** | **475M activos** | **7,08B** | **15.9** | **30.7** |
| SantaCoder-1.1B | 1.1B | 236B | 14.0 | no disponible |
| StarCoderBase-1B | 1B | 1T | 12.2 | no disponible |
| InCoder-1.3B | 1.3B | ~60B | 11.0 | no disponible |
| CodeGen2-1B | 1B | ~400B | 9.1 | no disponible |

Una repetición de la evaluación dio HumanEval+ 14,6 y MBPP+ 30,7, por lo que diferencias de unas 1,5 puntos están dentro del ruido. Los resultados de los demás modelos provienen del leaderboard oficial de EvalPlus (23 de octubre de 2026); las cifras de Qwen2.5-Coder son de sus autores.

Tareas de agente:

| | Tetu Code 1 | Tetu Code 2 | Profesor (Qwen3.6-35B-A3B) |
|---|---|---|---|
| 40 proyectos multifichero reservados en OpenCode 2.1.4 (tests ocultos) | 0/40 | 8/40 | 29/40 |
| Benchmark de agente de función única (OpenCode 1.19.4) | 46,5 % | 28,5 % | 85,5 % |
| Pérdida de validación en Python (preentrenamiento) | 0,821 | 0,777 | no disponible |

Rendimiento en una RTX 5070: aproximadamente 143 tokens/s a 2k de contexto y 71 tokens/s a 16k.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 2,3 GB; el contexto de 65.536 tokens requiere memoria adicional para la caché KV. No se publican cifras exactas de VRAM total.
- GPU recomendadas: el autor entrenó en una RTX 5070 de 12 GB y reporta throughput en esa misma GPU; cabe en GPUs de consumo con al menos 12 GB. No se publican datos para A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 5070 (12 GB) según las mediciones del autor.
- Opciones de despliegue: código de inferencia propio (`chat.py` para chat sin herramientas, con `--cpu` para ejecución en CPU con `torch.float32`; `python -m tetu_code.serve --model . --port 8070` para servidor compatible con OpenAI). La arquitectura no está soportada por `transformers`, por lo que no se puede usar vLLM, TGI ni llama.cpp de forma estándar.
- Latencia y throughput: aproximadamente 143 tokens/s a 2k de contexto y 71 tokens/s a 16k en RTX 5070.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | MBPP+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tetu Code 2 | 1,15B totales / 475M activos | 65.536 | 15.9 | 30.7 | Apache 2.0 | Hugging Face |
| DeepSeek-Coder-1.3B-instruct | 1.3B | no disponible en la informacion | 60.4 | 54.8 | no disponible en la informacion | Hugging Face |
| Qwen2.5-Coder-0.5B (base) | 0.5B | no disponible en la informacion | 23.8 | 47.1 | no disponible en la informacion | Hugging Face |
| SantaCoder-1.1B | 1.1B | no disponible en la informacion | 14.0 | no disponible | no disponible en la informacion | Hugging Face |
| StarCoderBase-1B | 1B | no disponible en la informacion | 12.2 | no disponible | no disponible en la informacion | Hugging Face |

Tetu Code 2 supera a los modelos de código de 1B de 2023 (SantaCoder, StarCoderBase-1B) con entre 30 y 140 veces menos tokens de entrenamiento, y queda por debajo de DeepSeek-Coder-1.3B y Qwen2.5-Coder-0.5B, entrenados con entre 280 y 780 veces más tokens. Su ventaja diferencial es el soporte de agente nativo para OpenCode y su licencia Apache 2.0.

## Limitaciones y advertencias

- Como modelo pequeño, a menudo parte de lógica incorrecta o usa variables no definidas.
- Cuando sus propios tests fallan, tiende a reejecutar comandos en lugar de corregir el código.
- En conversaciones multi-turno puede pasar por alto una corrección o una petición de seguimiento.
- Está ajustado como agente: en el script de chat plano (`chat.py`) suele intentar llamar a herramientas; debe usarse a través de OpenCode.
- A veces escribe ficheros fuera del directorio del proyecto; el servidor incluido reasigna esas rutas al proyecto.
- Debe ejecutarse en un sandbox o directorio desechable, nunca sin supervisión sobre código importante.
- La arquitectura no está soportada por `transformers`, lo que limita las opciones de despliegue y herramientas del ecosistema.
- No se detallan sesgos conocidos en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; los fallos lógicos y de variables no definidas apuntan a generación de código incorrecto en una fracción relevante de casos (pass@1 de 15,9 en HumanEval+).
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tetu-AI/Tetu-Code-2
- OpenCode: https://opencode.ai
- Leaderboard de EvalPlus: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada (el código de inferencia se incluye en el repositorio de Hugging Face)
- Demo: no disponible en la información proporcionada
