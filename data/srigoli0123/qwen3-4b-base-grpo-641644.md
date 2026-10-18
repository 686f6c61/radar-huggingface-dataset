# SriGoli0123/Qwen3-4B-Base-GRPO-641644

## Resumen

Qwen3-4B-Base-GRPO-641644 es un checkpoint de investigación publicado por SriGoli0123, derivado de Qwen/Qwen3-4B-Base mediante un ajuste con GRPO (Group Relative Policy Optimization) sobre el conjunto DAPO Math 17K. Contiene 4.022.468.096 parámetros en bfloat16 y se distribuye con licencia Apache-2.0. Su propósito principal no es el uso comercial directo, sino servir como base de comparación controlada para una variante posterior denominada MSJ-GRPO, que añade SFT condicionado a errores.

El modelo se entrenó durante 204 pasos con 4 GPU NVIDIA A100 de 80 GB, usando el framework VeRL y SGLang para el rollout. La recompensa es binaria y se calcula mediante equivalencia simbólica con Math-Verify. La precisión final en validación DAPO Math fue de 0,341 sobre 1.000 ejemplos, con un máximo de 0,343 en el paso 130. Es relevante ahora porque proporciona un baseline reproducible y transparente para estudiar la estabilidad de GRPO en tareas matemáticas y aislar el efecto de técnicas auxiliares.

La ficha está pensada para desarrolladores e investigadores que necesiten evaluar el checkpoint, reproducir sus resultados o utilizarlo como control experimental. No se documentan capacidades de visión, audio, tool calling ni agentes, y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only; detalles no disponibles) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo contiene pesos safetensors en bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, revisión `906bfd4b4dc7f14ee4320094d8b41684abff8539`, y se ajusta con GRPO estándar sobre DAPO Math 17K. El entrenamiento usó 13.116 ejemplos de entrenamiento y 1.000 de validación, una época y 204 pasos completados. El lote de entrenamiento fue de 64 prompts con 8 rollouts por prompt, lo que produce 512 trayectorias por paso. El mini-lote fue de 16 prompts y el micro-lote por GPU de 4. La longitud máxima de prompt se fijó en 2.048 tokens y la de respuesta en 4.096 tokens, con un máximo de 24.576 tokens por GPU.

La configuración de GRPO incluye estimador de ventaja GRPO, pérdida de política vanilla, agregación por media de tokens, factor de descuento 1,0, recorte inferior 0,20, recorte superior 0,28, coeficiente de doble recorte 3,0, coeficiente de entropía 0 y coeficiente KL 0. El optimizador es AdamW con tasa de aprendizaje 1e-6, weight decay 0,01, betas [0,9, 0,999], scheduler constante, 15 pasos de warm-up y recorte de gradiente 1,0. El entrenamiento se distribuyó con FSDP1 a cuatro vías, precisión bfloat16, gradient checkpointing activado y FlashAttention-2. El rollout se realizó con SGLang 0.5.8, temperatura 1,0, top-p 1,0 y top-k desactivado.

La innovación principal es metodológica: se trata de un baseline GRPO puro con `actor.ioh_sft_coef=0`, sin juez, sin SFT y sin frases de inoculación. Esto permite compararlo de forma controlada con la variante MSJ-GRPO, que usa el mismo código, datos, recompensa, semilla e hiperparámetros. No se documentan innovaciones arquitectónicas adicionales, como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés.
- Razonamiento matemático entrenado sobre DAPO Math 17K con recompensa de equivalencia simbólica Math-Verify.
- Resolución de problemas matemáticos con verificación binaria de la respuesta final.
- La ficha incluye la etiqueta `conversational`, pero no se documenta un ajuste de instrucciones; el uso conversacional no está validado.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agentes ni de razonamiento multi-paso más allá de la resolución matemática.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.
- El soporte multilingüe se limita al inglés según la información disponible.

## Casos de uso

- **Baseline de investigación para GRPO:** utiliza el checkpoint como control frente a Qwen3-4B-Base-MSJ-GRPO-DAPO17K, manteniendo el mismo dataset, semilla, recompensa e hiperparámetros para aislar el efecto del SFT condicionado a errores.
- **Evaluación de pipelines de RL con verificación simbólica:** reproduce la precisión de validación de 0,341 sobre 1.000 ejemplos y analiza el plateau observado a partir del paso 70, útil para estudiar estabilidad y ruido experimental.
- **Resolución de problemas matemáticos y generación de soluciones:** introduce un problema en inglés, genera varias muestras y filtra las respuestas correctas mediante Math-Verify para obtener soluciones paso a paso verificables.
- **Generación de datos sintéticos de matemáticas:** produce candidatos de solución que pueden filtrarse con equivalencia simbólica y reutilizarse en la construcción de datasets de SFT o de preferencias.
- **Ablaciones de hiperparámetros de GRPO:** al ser un baseline limpio, permite modificar recortes, coeficientes KL, entropía o tamaño de lote y comparar contra el resultado de referencia.
- **Estudio del ruido en validación:** con una horquilla de ±1,5 puntos sobre 1.000 ejemplos, sirve para diseñar experimentos que distingan mejoras reales de fluctuaciones estadísticas.
- **Prototipos locales de razonamiento matemático:** con 4.022 millones de parámetros, los pesos en bfloat16 ocupan aproximadamente 8 GB; en GPUs de 24 GB se puede ejecutar sin cuantización para pruebas de inferencia, siempre que se acepte que es un checkpoint de investigación.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Métrica | Resultado | Notas |
|---|---|---|---|---|
| DAPO Math validation | 1.000 ejemplos | Accuracy binaria con Math-Verify | 0,341 | Paso 204; mejor 0,343 en el paso 130 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar en la información disponible. Tampoco se dispone de resultados del modelo base evaluado con el mismo protocolo, por lo que no es posible establecer una comparación directa de rendimiento.

## Requisitos de hardware

- **Pesos en bfloat16:** 4.022.468.096 parámetros × 2 bytes ≈ 8,04 GB solo para los pesos. Con overhead de inferencia y caché KV, se recomienda una GPU de 24 GB para contextos cortos.
- **GPU recomendadas para inferencia:** RTX 3090, RTX 4090, A10G o L4 de 24 GB. Para servir en producción con mayor concurrencia, A100 40/80 GB o H100.
- **Cuantización INT8:** estimación de unos 4,02 GB para los pesos y 6-8 GB de VRAM total; podría caber en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 12 GB. No hay artefactos INT8 publicados en el repositorio.
- **Cuantización 4-bit:** estimación de 2,0-2,5 GB para los pesos y 4-6 GB de VRAM total; podría caber en GPUs consumer de 8 GB. Requiere convertir el modelo, ya que no se incluyen pesos GGUF ni quantizados.
- **Entrenamiento:** la configuración documentada usó 4 GPU NVIDIA A100 de 80 GB con FSDP1, bfloat16 y gradient checkpointing.
- **Despliegue:** Transformers está documentado y es la vía directa. SGLang 0.5.8 se usó para el rollout durante el entrenamiento. vLLM y TGI no se documentan en la ficha; llama.cpp u Ollama requerirían una conversión a GGUF no publicada.
- **Latencia y throughput:** no disponibles. No se han publicado medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SriGoli0123/Qwen3-4B-Base-GRPO-641644 | 4.022.468.096 | No disponible | GRPO sobre DAPO Math 17K | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B-Base | No disponible (familia 4B) | No disponible | Preentrenamiento base | No disponible en la información | HuggingFace |
| SriGoli0123/Qwen3-4B-Base-MSJ-GRPO-DAPO17K | No disponible (mismo base Qwen3-4B-Base) | No disponible | GRPO + SFT condicionado a errores | No disponible en la información | HuggingFace |

No se han publicado datos de rendimiento comparativos entre estos modelos en la información disponible. La comparación se limita a procedencia, configuración de entrenamiento y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción.
- La precisión de validación se estabilizó en torno a 0,31-0,34 después del paso 70; diferencias de ±1,5 puntos están dentro del ruido sobre 1.000 ejemplos.
- El idioma declarado es únicamente inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Al partir de un modelo base y aplicar GRPO, no se documenta un ajuste de instrucciones; el seguimiento de instrucciones conversacionales puede ser limitado.
- No se documentan procesos de alineación de seguridad, RLHF general ni filtros de contenido.
- Existe riesgo de alucinación en matemáticas y en texto libre; la recompensa de entrenamiento es binaria y simbólica, no una preferencia humana.
- La longitud máxima de prompt durante el entrenamiento fue de 2.048 tokens y la de respuesta de 4.096 tokens; no se ha validado un rendimiento fiable fuera de esos límites.
- No se dispone de la longitud de contexto oficial del modelo en la información proporcionada.
- No se incluyen pesos cuantizados; cualquier conversión a INT8, 4-bit o GGUF puede degradar la precisión y no está documentada.
- La licencia declarada es Apache-2.0, pero conviene verificar la licencia del modelo base y las obligaciones de atribución si se redistribuye.
- El dataset DAPO Math 17K es de dominio matemático; el modelo puede mostrar sesgos y limitaciones heredadas de esos datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SriGoli0123/Qwen3-4B-Base-GRPO-641644
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Variante MSJ-GRPO: https://huggingface.co/SriGoli0123/Qwen3-4B-Base-MSJ-GRPO-DAPO17K
- Dataset DAPO Math 17K: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Fork de VeRL usado en el entrenamiento: https://github.com/SriGoli-0123/verl-a100 (rama `a100/ioher-mistake-judge`, commit `d169b69`)
