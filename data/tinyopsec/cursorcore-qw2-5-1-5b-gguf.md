# tinyopsec/CursorCore-QW2.5-1.5B-GGUF

## Resumen

CursorCore-QW2.5-1.5B-GGUF es la distribucion en formato GGUF del modelo TechxGenus/CursorCore-QW2.5-1.5B, un ajuste fino de Qwen2.5-Coder-1.5B orientado a la asistencia a la programacion dentro del paradigma CursorCore. El modelo original lo desarrolla TechxGenus y esta version cuantizada la publica el usuario tinyopsec, que la genera con llama.cpp para facilitar su ejecucion en entornos locales con recursos limitados.

El modelo resuelve el problema de desplegar un asistente de codigo especializado en maquinas sin GPU de datacenter. Con 1.543.321.088 parametros (aproximadamente 1.5B), se puede ejecutar en CPU o en GPUs de consumo, y las cuantizaciones de 4 bits reducen el peso a un rango manejable para portatiles y estaciones de trabajo modestas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Es relevante ahora porque el ecosistema GGUF y llama.cpp permite integrar asistentes de codigo en editores, pipelines de CI y herramientas de desarrollo sin depender de APIs externas. La ficha se centra en la distribucion GGUF; los detalles de entrenamiento del modelo base no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-1.5B) |
| Parametros totales | 1.543.321.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La distribucion GGUF se genera a partir de TechxGenus/CursorCore-QW2.5-1.5B, que a su vez es un ajuste fino de Qwen2.5-Coder-1.5B, un transformer decoder-only de la familia Qwen2.5. El modelo esta etiquetado como especializado en programacion (coding) y en el paradigma CursorCore, orientado a la asistencia de codigo en editores. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

La innovacion principal de esta publicacion es la conversion a GGUF mediante llama.cpp, que habilita la inferencia en CPU, GPU y entornos hibridos con multiples niveles de cuantizacion. El repositorio ocupa 15.3 GB e incluye 13 archivos de pesos, desde F16 (3.0 GB) hasta Q2_K. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto y asistencia a la programacion: el modelo esta etiquetado como "coding" y deriva de Qwen2.5-Coder, por lo que se espera capacidad para completar y explicar codigo.
- Conversacion multi-turno: la etiqueta "conversational" indica soporte para dialogos.
- Integracion en editores: el paradigma CursorCore apunta a asistencia de codigo dentro de herramientas de desarrollo.
- Ejecucion local: compatible con llama.cpp, Ollama, LM Studio y koboldcpp.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado de codigo en el editor: el modelo puede integrarse mediante llama.cpp u Ollama en extensiones de VS Code o Neovim para sugerir lineas y bloques, con latencia baja al ejecutarse en local con cuantizacion Q4_K_M.
- Revisión de codigo en pre-commit hooks: al ser un modelo pequeno y ejecutable en CPU, se puede invocar en un hook de Git para detectar patrones problematicos antes de cada commit, sin enviar codigo a servicios externos.
- Asistente de documentacion tecnica: generar docstrings y comentarios a partir de funciones existentes, aprovechando la especializacion en codigo del modelo base Qwen2.5-Coder.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local, es adecuado para equipos que no pueden enviar codigo propietario a APIs en la nube.
- Prototipado rapido en portatiles: con Q4_K_M o Q5_K_M el modelo cabe en equipos de consumo, permitiendo experimentar con asistentes de codigo sin infraestructura GPU dedicada.
- Educacion y formacion: explicar fragmentos de codigo o generar ejemplos didacticos en un entorno controlado y sin coste de API.
- Integracion en pipelines de CI/CD: invocar el modelo mediante llama-cli en scripts de validacion para generar resumenes de cambios o sugerencias de refactorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.0 GB en F16; alrededor de 1.0-1.5 GB en Q4_K_M; menos de 1 GB en Q2_K (estimaciones a partir del tamano de los archivos indicados en la model card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo pero validas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CursorCore-QW2.5-1.5B-GGUF (este) | 1.543.321.088 | no disponible | Apache 2.0 | GGUF | Especializado en coding, cuantizaciones multiples |
| Qwen2.5-Coder-1.5B | ~1.5B | no disponible en la informacion | Apache 2.0 | safetensors, GGUF | Modelo base del que deriva; uso general de codigo |
| TechxGenus/CursorCore-QW2.5-1.5B | ~1.5B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen2.5-Coder hereda los sesgos de su dataset de entrenamiento, no especificados.
- Riesgo de alucinacion: presente como en cualquier modelo de 1.5B; puede generar APIs o funciones inexistentes, especialmente en lenguajes poco representados.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales.
- Caveat para produccion: el autor advierte explicitamente "Evaluate before use"; es un modelo pequeno y especializado, no validado con benchmarks publicos en esta distribucion.
- Las cuantizaciones de 2 y 3 bits pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- El repositorio tiene 588 descargas y 0 likes, lo que indica validacion comunitaria limitada.

## Enlaces

- Hugging Face (esta distribucion GGUF): https://huggingface.co/tinyopsec/CursorCore-QW2.5-1.5B-GGUF
- Modelo base del ajuste fino: https://huggingface.co/TechxGenus/CursorCore-QW2.5-1.5B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
