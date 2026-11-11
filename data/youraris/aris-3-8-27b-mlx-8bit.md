# YourAris/Aris-3.8-27B-MLX-8bit

## Resumen

Aris 3.8-27B es un ajuste fino orientado a agentes de programación sobre Arete-27B de Nous Research, que a su vez se construye sobre Qwen3.8-27B del equipo Qwen de Alibaba Cloud. Este repositorio concreto contiene los pesos convertidos a MLX en cuantización de 8 bits, pensados para ejecutarse en Macs con Apple Silicon y 48 GB de memoria unificada o más. El modelo resuelve el ciclo completo de un agente de código: escribir la implementación, ejecutar las pruebas, corregir los fallos y detenerse.

La innovación principal es el método de entrenamiento: iteración por expertos sobre las propias ejecuciones exitosas del modelo base. Se recogieron 247 ejecuciones que superaron la suite completa de ejercicios de Exercism en Python y Rust (109 y 138 respectivamente, 4,8 millones de tokens) y con ellas se entrenó un LoRA de rango 16 sobre las 64 capas, con 108,8 millones de parámetros entrenables. Después se fusionó el adaptador en los pesos bf16 y se cuantizó con la herramienta de conversión de mlx-lm.

El resultado es un modelo de 26.895.993.856 parámetros (unos 26,9 mil millones) que conserva la precisión del base según las pruebas del autor, reduce ligeramente las autocorrecciones durante el razonamiento y decodifica aproximadamente un 30 % más rápido que la variante con LoRA aplicado en tiempo de ejecución. Es relevante ahora porque demuestra que un ajuste fino pequeño y bien dirigido, con datos generados por el propio modelo en un bucle agéntico real, puede mejorar el comportamiento agéntico sin sacrificar exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención lineal híbrida (familia Qwen3.5 / Qwen3.8); sin codificador de visión |
| Parametros totales | 26.895.993.856 (≈26,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Contexto nativo no disponible en la información; en la práctica, con caché KV de 8 bits en un M4 Pro de 48 GB caben unos 125k tokens |
| Tipos de cuantizacion | 8 bits afín, tamaño de grupo 64, 8,5 bits por peso (formato MLX); los pesos bf16 originales del base están disponibles en NousResearch/Arete-27B |
| Idiomas soportados | Inglés (declarado en la model card); comportamiento en otros idiomas no validado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx); no se distribuye GGUF en este repo |

## Arquitectura y entrenamiento

La base es Arete-27B de Nous Research, construida sobre Qwen3.8-27B de Qwen. La model card menciona explícitamente proyecciones de atención, atención lineal y MLP en las 64 capas, lo que confirma una arquitectura híbrida con capas de atención lineal intercaladas. El modelo es solo texto: el codificador de visión del base no se incluye en este repositorio. La plantilla de chat y los ajustes de generación son los de Arete, incluidos sus niveles de esfuerzo de razonamiento.

El ajuste se realizó por iteración por expertos. Arete-27B resolvió ejercicios de práctica de Exercism en Python y Rust dentro de un bucle agéntico real con acceso a shell, limitando el pensamiento a unos 3.000 tokens por turno. De esas ejecuciones, 247 que pasaron la suite completa de pruebas constituyeron el conjunto de entrenamiento: 4,8 millones de tokens en total. El LoRA es de rango 16 en las 64 capas, con 108,8 millones de parámetros entrenables, dos épocas (124 pasos), tasa de aprendizaje 5e-5 con calentamiento lineal y decaimiento coseno, entrenado en MLX sobre los pesos de 8 bits. Posteriormente se fusionó en los pesos bf16 y se cuantizó con conversión afín de grupo 64 a 8,5 bits por peso. Los pesos fusionados coinciden con el modelo de 8 bits ejecutando el LoRA en el 99,5 % de los siguientes tokens (KL media de 0,0025 sobre 402 posiciones).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable mediante niveles de esfuerzo (`low`, `medium`, `high`, `xhigh`, `max`) heredados de Arete.
- Programación en Python y Rust, las dos lenguajes presentes en el conjunto de entrenamiento, con ciclo completo de escritura, ejecución de pruebas y corrección.
- Comportamiento agéntico multi-paso: el modelo planifica, ejecuta comandos en un shell, interpreta la salida y corrige.
- Integración con clientes de la API de mensajes de Anthropic a través de Aris Server, lo que permite usarlo con Claude Code.
- Manejo de contexto largo: 18/18 aciertos con 50k tokens y 17/18 con 100k tokens en la prueba sintética del autor.
- Capacidad de seguir especificaciones formales: RFC 6901, RFC 6902, rangos semver de npm, precedencia de operadores y reglas de `.gitignore`.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; el uso agéntico se canaliza mediante el servidor, no mediante un esquema de herramientas documentado del propio modelo.
- Capacidades multilingües: solo inglés declarado; el rendimiento en otros idiomas no está validado.
- Sin visión, sin audio.

## Casos de uso

- Agente de codificación autónomo en local: el modelo puede recibir una especificación, escribir la implementación, lanzar la suite de pruebas y corregir los fallos en bucle, como demuestran las cuatro tareas agénticas del autor. Es adecuado porque fue entrenado precisamente sobre ese ciclo y con presupuesto de pensamiento acotado.
- Asistente integrado en Claude Code: mediante Aris Server, que expone el modelo a través de la API de mensajes de Anthropic, se puede apuntar Claude Code a un endpoint local con `ANTHROPIC_BASE_URL` y trabajar sin enviar código a la nube.
- Desarrollo de bibliotecas pequeñas a partir de especificaciones: los resultados en JSON Pointer/Patch, evaluación de expresiones y coincidencia de `.gitignore` muestran que el modelo completa implementaciones con pruebas ocultas en TypeScript, Rust y Python.
- Procesamiento de bases de código de tamaño medio: con unos 125k tokens de contexto efectivo en un M4 Pro de 48 GB, puede recibir varios archivos y responder preguntas que requieren seguir un valor a través de tres ficheros, como en la prueba de contexto largo del autor.
- Automatización de tareas de refactorización con verificación: al soportar ejecución de pruebas, encaja en pipelines donde el modelo propone cambios y valida con la suite antes de darlos por buenos.
- Entorno de investigación en Apple Silicon: al estar en formato MLX y licencia Apache-2.0, sirve para experimentar con ajustes finos y decodificación especulativa en hardware de Apple sin depender de CUDA.
- Evaluación de razonamiento matemático: en la prueba de 60 problemas MATH-500 más 16 de aplicación de reglas, obtuvo 72/76, por lo que es utilizable como generador de soluciones con verificación posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las ejecuciones con pensamiento activado, a través de Aris Server en Apple Silicon.

| Prueba | Arete-27B 8-bit | Aris 3.8-27B 8-bit |
|---|---|---|
| Razonamiento (76 ítems, esfuerzo alto): correctos | 71/76 (93,4 %) | 72/76 (94,7 %) |
| Autocorrecciones por 1.000 tokens de salida | 2,95 | 2,57 |
| Respuestas que alcanzan el límite de tokens | 0 | 0 |

| Tarea agéntica | Lenguaje | Arete-27B | Aris 3.8-27B |
|---|---|---|---|
| JSON Pointer y JSON Patch (RFC 6901, RFC 6902) | TypeScript | 34/35 (con pista) | 35/35 |
| Coincidencia de rangos semver de npm | Rust | 50/52 | 50/52 |
| Evaluador de expresiones | Rust | 45/45 | 45/45 |
| Coincidencia de `.gitignore` | Python | 64/64 (reanudada a mano) | 64/64 |

| Contexto largo | Correctos |
|---|---|
| 50k tokens | 18/18 |
| 100k tokens | 17/18 |
| 50k tokens en el system prompt | 16/18 |

El autor advierte que la diferencia de precisión en razonamiento está dentro del ruido, que el banco tiene solo 76 ítems y que cada tarea agéntica se ejecutó una sola vez. Las ejecuciones de Arete usaron una versión anterior del servidor, por lo que la diferencia de comportamiento no es atribuible únicamente al ajuste fino.

## Requisitos de hardware

- Los pesos ocupan 27 GB, por lo que se necesita un Mac con 48 GB de memoria unificada o más.
- En un M4 Pro de 48 GB con caché KV de 8 bits, caben unos 125k tokens de contexto.
- Velocidad medida en ese equipo: aproximadamente 8 tokens por segundo en decodificación y 80 a 105 tokens por segundo en lectura de prompts.
- Solo Apple Silicon: el formato MLX no se ejecuta en GPU NVIDIA ni AMD. No hay pesos GGUF en este repositorio.
- Despliegue recomendado: Aris Server (`uv tool install git+https://github.com/kennysarnoski-jarvis/aris-server`), que sirve el modelo a Claude Code o a cualquier cliente de la API de mensajes de Anthropic.
- Alternativa directa: `mlx-lm` con `mlx_lm.generate --model YourAris/Aris-3.8-27B-MLX-8bit`.
- No se documentan opciones para vLLM, TGI, llama.cpp u Ollama en este repositorio.
- Para Claude Code, ajustar `CLAUDE_CODE_MAX_CONTEXT_TOKENS` al contexto que reporta el endpoint `/v1/models` del servidor, ya que Claude Code asume 200k tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Aris 3.8-27B MLX 8-bit | 26,9 B | ~125k efectivos en 48 GB | MLX, Apple Silicon | Apache-2.0 | Ajuste agéntico sobre Arete; 72/76 en el banco de razonamiento del autor |
| NousResearch/Arete-27B | 27 B | No disponible | Pesos bf16 originales | No disponible en la información | Base del ajuste; 71/76 en el mismo banco, más autocorrecciones |
| Qwen3.8-27B | 27 B | No disponible | Múltiples (no detallado) | No disponible en la información | Modelo original de Qwen sobre el que se construye Arete |

No se dispone de datos de benchmarks de terceros ni de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son exclusivamente Python y Rust; en otros lenguajes se espera el comportamiento de Arete sin mejora.
- Las comparaciones son de tamaño reducido: 76 ítems en el banco de razonamiento y una sola ejecución por tarea agéntica, sin intervalo de confianza.
- El pensamiento puede alargarse en problemas difíciles; conviene fijar un presupuesto de pensamiento como el de la configuración de ejemplo.
- Hereda el entrenamiento de alineación de valores de Arete-27B y la fecha de corte de conocimiento de Qwen3.8-27B, no especificada en la información disponible.
- Riesgo de alucinación no cuantificado en la información disponible; el modelo está pensado para flujos con verificación por pruebas, no para respuestas sin comprobación.
- Solo inglés declarado; no hay validación en castellano ni en otros idiomas.
- Solo texto: el codificador de visión del base no está incluido.
- Requiere hardware Apple Silicon con 48 GB o más; no hay ruta de despliegue en GPU NVIDIA documentada en este repositorio.
- El repositorio no tiene descargas ni likes en el momento de la consulta, y el autor no ofrece garantías de mantenimiento.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y la atribución correspondiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YourAris/Aris-3.8-27B-MLX-8bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Servidor de inferencia Aris Server: https://github.com/kennysarnoski-jarvis/aris-server
- Ejercicios de práctica de Exercism (origen de los datos de entrenamiento): https://exercism.org
