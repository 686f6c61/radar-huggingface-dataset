# TigbasonKaKaronCompany/palautog-500m

## Resumen

palautog-500m es un modelo de lenguaje publicado por el usuario TigbasonKaKaronCompany en Hugging Face. Se presenta como un fine-tune del modelo Qwen/Qwen2.5-1.5B-Instruct, aunque el recuento real de parámetros en los pesos safetensors es de 494.032.768 (aproximadamente 494 millones), muy por debajo de los 1.500 millones del modelo base declarado. Esta discrepancia es el dato más relevante de la ficha: el nombre del repositorio (500m) coincide con el recuento real, mientras que la etiqueta de modelo base apunta a un modelo tres veces mayor.

La model card publicada es prácticamente vacía: solo incluye la licencia y la referencia al modelo base, sin información sobre datos de entrenamiento, metodología, idiomas o capacidades. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y el repositorio se creó y actualizó en un intervalo de unos diez minutos, lo que sugiere un experimento personal o una publicación de prueba más que un modelo listo para producción.

Por tanto, esta ficha describe lo que se puede verificar objetivamente (arquitectura derivada de Qwen2.5, tamaño real de los pesos, licencia y formato) y marca explícitamente como "no disponible" todo aquello que el autor no ha documentado. Es relevante ahora únicamente como caso de estudio de fine-tunes comunitarios de bajo perfil y como recordatorio de que la etiqueta `base_model` no garantiza que el checkpoint tenga el tamaño declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tag `qwen2`); configuracion exacta no disponible |
| Parametros totales | 494.032.768 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero el autor no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | WTFPL (Do What The Fuck You Want To Public License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `qwen2` y el campo `base_model` apuntan a la familia Qwen2, un transformer decoder-only con atención causal, RoPE y normalización RMSNorm, del que Qwen2.5-1.5B-Instruct es una instancia de 1.500 millones de parámetros. Sin embargo, el checkpoint publicado contiene 494 millones de parámetros, lo que no encaja con una simple copia del modelo base: o bien se trata de un modelo destilado o truncado, o bien de un fine-tune sobre una arquitectura distinta mal etiquetada. El autor no documenta cuál de estas opciones es la correcta.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO o SFT, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card no incluye ningún detalle metodológico. Tampoco se indica si se congelaron capas, si se aplicó LoRA y se fusionaron los adaptadores, ni qué hiperparámetros se usaron.

## Capacidades

- Generación de texto autoregresiva: capacidad esperable por herencia de la familia Qwen2, aunque no verificada en este checkpoint concreto.
- Razonamiento y matemáticas: no documentado por el autor; no hay evidencia de que se hayan preservado las capacidades del modelo base tras el fine-tune.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado; Qwen2.5-1.5B-Instruct lo soporta, pero no hay confirmación de que este checkpoint lo conserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación académica con fine-tunes comunitarios: sirve para estudiar cómo se comporta un checkpoint de ~494 M de parámetros etiquetado como derivado de un modelo de 1.500 M, y para analizar discrepancias entre metadatos y pesos reales.
- Pruebas de infraestructura de despliegue: al ser un modelo pequeño (1,0 GB en safetensors), es útil para validar pipelines de carga, tokenización y serving antes de pasar a modelos mayores.
- Prototipado rápido en local: cabe en GPUs de consumo y permite iterar sobre prompts y plantillas sin coste de API, siempre que se acepte la falta de garantías sobre calidad.
- Evaluación comparativa de licencias: la WTFPL es una de las licencias más permisivas disponibles, lo que lo hace adecuado como ejemplo en estudios sobre licenciamiento de modelos abiertos.
- Docencia sobre model cards: la ausencia casi total de documentación lo convierte en un caso práctico para enseñar qué información debería incluir una ficha de modelo.
- Base para fine-tunes posteriores: un checkpoint de ~494 M puede servir como punto de partida de bajo coste para tareas muy acotadas, aunque sin garantías de que las capacidades del Qwen2.5 original se conserven.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB solo para pesos (494 M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,5-0,7 GB para pesos; en 4 bits, alrededor de 0,3-0,4 GB (estimaciones teóricas, no hay cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan sin problema. También es viable en CPU para inferencia de baja concurrencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers con PyTorch es la vía directa al no haber GGUF; llama.cpp y Ollama requerirían convertir los pesos a GGUF, y vLLM o TGI podrían cargarlo si la arquitectura Qwen2 es compatible, algo no verificado.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| palautog-500m | 494 M | no disponible | WTFPL | Hugging Face, 0 descargas | Fine-tune sin documentar; discrepancia con el modelo base declarado |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base declarado; documentación completa y benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache 2.0 | Hugging Face | Coincide en tamaño con palautog-500m; documentado y con benchmarks |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa pequeña documentada de Hugging Face |

La comparación más informativa es con Qwen2.5-0.5B-Instruct: mismo orden de magnitud de parámetros, pero con model card completa, benchmarks y licencia Apache 2.0. palautog-500m no ofrece ninguna ventaja verificable frente a él salvo la licencia WTFPL, que es más permisiva en la práctica pero también menos habitual en entornos corporativos.

## Limitaciones y advertencias

- Discrepancia de tamaño: el campo `base_model` apunta a un modelo de 1.500 M de parámetros, pero los pesos contienen 494 M. No se puede asumir que las capacidades del Qwen2.5-1.5B-Instruct se conserven.
- Documentación inexistente: sin datos de entrenamiento, idiomas, evaluación ni metodología, es imposible estimar su calidad o sus sesgos.
- Riesgo de alucinación: no evaluado; en modelos pequeños sin ajuste fino cuidadoso suele ser elevado.
- Sesgos conocidos: no documentados; al desconocerse el dataset de ajuste, no se pueden identificar sesgos de género, idioma o dominio.
- Limitaciones de contexto e idioma: no disponibles; el autor no declara ventana de contexto ni cobertura lingüística.
- Licencia WTFPL: permite uso comercial sin restricciones prácticas, pero su redacción informal puede generar dudas en revisiones legales corporativas; además, al ser un fine-tune de Qwen2.5, podrían aplicar obligaciones derivadas de la licencia Apache 2.0 del modelo base, algo que el autor no aclara.
- Sin cuantizaciones oficiales ni integración en frameworks: requiere trabajo adicional para desplegarlo en llama.cpp, Ollama o vLLM.
- Cero tracción comunitaria: 0 descargas y 0 likes implican ausencia de validación externa; no se recomienda su uso en producción sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigbasonKaKaronCompany/palautog-500m
- Modelo base declarado: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2 (arXiv): https://arxiv.org/abs/2407.10671
- Texto de la licencia WTFPL: http://www.wtfpl.net/
