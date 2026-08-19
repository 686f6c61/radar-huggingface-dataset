# updateattacks/pi-detector-attack-targets-gpt54low

## Resumen

`updateattacks/pi-detector-attack-targets-gpt54low` es un conjunto de doce detectores de inyección de prompts (prompt injection), desarrollado por el usuario `updateattacks` como parte de un proyecto de seguridad para modelos de lenguaje. Cada detector es un adaptador LoRA entrenado sobre el modelo base `mistralai/Mistral-7B-v0.1`, especializado en una familia concreta de ataque dentro de un framework de evaluación de ataques adaptativos (GCG, TAP). El objetivo es clasificar si un texto es un intento de ataque (1) o contenido limpio (0), permitiendo integrarse en pipelines de defensa.

El repositorio contiene los pesos en formato `safetensors` (3,5 GB) y una estructura de directorios por familia de ataque, con ficheros de configuración (`canary_config.json`, `MANIFEST.json`) que controlan el formato de inferencia y la selección de runs. Es una herramienta de nicho, orientada a equipos de seguridad que trabajan con LLMs y necesitan detectar inyecciones de prompts en entornos de evaluación. No se publican métricas de rendimiento, licencia ni idiomas soportados, lo que limita su uso directo en producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA adapters sobre Mistral-7B-v0.1 (transformer decoder-only) |
| Parámetros totales | no disponible (el modelo base tiene 7,3 B; los adaptadores son de tamaño reducido) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Mistral-7B-v0.1 soporta 8K tokens) |
| Tipos de cuantización | safetensors (sin GGUF ni otras cuantizaciones documentadas) |
| Idiomas soportados | no disponible (hay un directorio `browsesafe_clean__multilanguage`, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo está compuesto por doce adaptadores LoRA, cada uno entrenado sobre el mismo base, `mistralai/Mistral-7B-v0.1`. Cada adaptador se corresponde con una familia de ataque (por ejemplo, `Instruction_Wrapping`, `Context_Tampering`, `Completion_Attack`, etc.). El entrenamiento sigue una receta de "canary minimax curriculum": se inicia desde cero (`--init_from scratch`) y se ejecutan tres épocas de 500 pasos, con aumentación de agentes, `k=1` y `n_gen=63`. La selección del mejor modelo por familia se realiza entre tres semillas y tres ejecuciones, eligiendo aquel con la menor tasa de falsos negativos (new-FNR) según el `MANIFEST.json`.

La inferencia requiere respetar el formato de entrada definido en `canary_config.json`, que incluye un separador crítico. Si este fichero falta, el modelo puede degradarse silenciosamente y aumentar los falsos positivos (de 40/40 a 13/40 en una métrica de aciertos sobre muestras limpias). No se documentan técnicas avanzadas como decodificación especulativa ni atención lineal; el foco está en la adaptación eficiente mediante LoRA.

## Capacidades

- Detección de inyección de prompts: clasifica texto como ataque (1) o limpio (0).
- Especialización por familia de ataque: doce adaptadores distintos para GCG, TAP, instrucción wrapping, manipulación de contexto, etc.
- Integración con frameworks de evaluación: se puede invocar desde una CLI (`python -m attack.tap.cli --detector_root ...`) o cargar individualmente con `CanaryDetector.from_pretrained`.
- Soporte de configuración de inferencia: el separador de entrenamiento se almacena en `canary_config.json` y es necesario para mantener la coherencia del formato.
- Multilingüismo (parcial): existe un adaptador para `browsesafe_clean__multilanguage`, aunque no se especifican los idiomas concretos.
- No se documentan capacidades de generación de texto, tool calling o razonamiento multi-paso; es un clasificador binario especializado.

## Casos de uso

- **Evaluación de ataques adaptativos en investigación**: los equipos de seguridad pueden usar los doce detectores para medir la tasa de éxito de ataques GCG/TAP en sus propios sistemas, seleccionando el adaptador correspondiente a cada familia.
- **Filtrado de entrada en pipelines de LLM**: integrar el detector como paso previo a un modelo generativo para bloquear prompts maliciosos antes de que lleguen al modelo principal, reduciendo el riesgo de inyección.
- **Benchmark de detectores de inyección**: el repositorio proporciona una infraestructura reproducible para comparar detectores (threshold-agnostic), útil para publicaciones académicas o validación de herramientas de seguridad.
- **Auditoría de aplicaciones de chatbot**: probar el detector contra tráfico real de usuarios para medir falsos positivos y falsos negativos en entornos de producción, ajustando el umbral según los requisitos.
- **Desarrollo de agentes autónomos**: proteger agentes que procesan entradas externas (por ejemplo, correos o mensajes) contra instrucciones maliciosas que intenten desviar su comportamiento.
- **Investigación en seguridad de LLMs**: usar el conjunto de detectores como baseline en experimentos de ataques adaptativos, comparando con otros métodos de detección como PromptShield o PVDetector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una métrica de "new-FNR" (tasa de falsos negativos) para la selección de modelos, pero no se incluyen números concretos en el repositorio ni en las búsquedas web. Tampoco se comparan con otros detectores en términos de precisión, recall o latencia.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un adaptador LoRA sobre Mistral-7B, la inferencia requiere cargar el modelo base (aproximadamente 14 GB en FP16) más el adaptador. Con cuantización (por ejemplo, 4-bit), se podría reducir a unos 6-8 GB, pero no se documenta cuantización oficial.
- **GPU recomendadas**: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A10G) es adecuada para inferencia en FP16. Para despliegue en producción, se puede usar vLLM o llama.cpp con cuantización, aunque no hay instrucciones oficiales.
- **¿Cabe en consumer GPU?**: sí, en GPUs de gama alta (RTX 3090, 4090) con cuantización, pero no se garantiza sin pruebas adicionales.
- **Opciones de despliegue**: el repositorio incluye una CLI (`attack.tap.cli`) y una clase `CanaryDetector` para Python. No se menciona integración con vLLM, Ollama o TGI; probablemente requiere un entorno personalizado.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos en la misma categoría. Existen alternativas de código abierto como PromptShield (explicable, clasificador de inyección) o PVDetector (detección de ataques en propósito), pero no se tienen datos de rendimiento o licencia para hacer una comparación rigurosa. Se recomienda consultar el benchmark `bastion-soft/pi-detector-bench` para evaluar este detector frente a otros de manera reproducible.

## Limitaciones y advertencias

- **Dependencia del formato**: el `canary_config.json` es imprescindible; si se elimina, el detector degrada su rendimiento silenciosamente (la precisión en muestras limpias cae de 40/40 a 13/40).
- **Estructura de directorios rígida**: los nombres de directorio (`<dataset>__<family>`) son la convención de búsqueda; renombrarlos rompe la integración.
- **Falsos positivos**: no se publican tasas de falsos positivos en tráfico real; el modelo puede marcar entradas legítimas como ataques, lo que podría causar interrupciones en producción.
- **Licencia no especificada**: no se indica si es de código abierto o restrictiva; antes de usar comercialmente, hay que contactar con el autor.
- **Idiomas limitados**: aunque hay un adaptador "multilanguage", no se documentan los idiomas cubiertos; es probable que el rendimiento varíe fuera de inglés.
- **Alucinación**: como detector binario, no genera texto, pero puede clasificar incorrectamente entradas ambiguas; no se reportan métricas de robustez frente a ataques adversarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/updateattacks/pi-detector-attack-targets
- Perfil del autor: https://huggingface.co/updateattacks
- Benchmark de detectores de inyección (GitHub): https://github.com/bastion-soft/pi-detector-bench
- PromptShield (detector alternativo): https://github.com/jsi3r3k/ai-prompt-attack-detector
- Paper PVDetector: https://arxiv.org/abs/2607.12624
