# Xylolabs/Phi-4-mini-instruct-Tenstorrent-Tensix-BFP4

## Resumen

Phi-4-mini-instruct-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo microsoft/Phi-4-mini-instruct, desarrollada por Xylolabs y optimizada específicamente para aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base es un transformer denso de 3.836 millones de parámetros únicos (4.450 millones contando el embedding atado) con 4.096 tokens de contexto nativo, diseñado por Microsoft para instrucciones, razonamiento y generación de texto en inglés. Esta versión aplica GPTQ con formato de coma flotante por bloques (BFP4) a las proyecciones MLP y BFP8 a las proyecciones de atención, reduciendo el peso empaquetado a 3,44 GB frente a los 7,67 GB en bf16.

La relevancia de esta ficha reside en que demuestra una ruta de cuantización de bajo nivel para NPUs Tenstorrent, un hardware emergente en el espacio de inferencia open source. El autor publica además las herramientas de cuantización (tensix-bfp-gptq), los kernels (tensix-kernels) y el runner (tensix-runner), lo que permite reproducir y auditar el proceso. La licencia MIT del modelo base se mantiene, lo que facilita su uso comercial.

El modelo conserva la conversión a un layout compatible con Llama y el mecanismo LongRoPE dual del original, con un adaptador de reconstrucción de prefijo obligatorio para generación con caché más allá de 4.096 tokens. Es, por tanto, una pieza de infraestructura más orientada a despliegue en hardware Tenstorrent que a uso general en GPU convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-4-mini, layout compatible con Llama) |
| Parámetros totales | 4.450.618.368 (3.836 millones únicos; embedding atado) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens nativo; LongRoPE dual preservado con adaptador de reconstrucción de prefijo |
| Tipos de cuantización | BFP4 (GPTQ) en MLP gate/up/down; BFP8 (round-to-nearest) en atención q/k/v/o; BF16 en embedding, head y normas |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (8,90 GB en repo; ~3,44 GB empaquetado para Tensix) |

## Arquitectura y entrenamiento

El modelo base Phi-4-mini-instruct es un transformer denso de Microsoft entrenado con datos sintéticos y filtrados orientados a razonamiento, matemáticas y código, con ajuste por instrucciones. Esta exportación no reentrena el modelo: aplica cuantización post-entrenamiento. Las proyecciones MLP (gate, up, down) se cuantizan a bfloat4_b mediante GPTQ, mientras que las proyecciones de atención (q, k, v, output) se cuantizan a bfloat8_b por redondeo al más cercano. El embedding, la cabeza LM y las normas permanecen en bf16.

La innovación técnica principal es el formato de coma flotante por bloques nativo de Tensix, que permite empaquetar las matrices directamente para las unidades de cómputo TT-NN sin conversión en tiempo de ejecución. La conversión preserva las 96 dimensiones rotatorias originales y las coordenadas de paso en una representación compatible con Llama de 128 dimensiones, plegando el factor de atención original en Q/K. Se mantienen ambas listas de factores LongRoPE y los metadatos de reconstrucción de prefijo en `config.json`. Las 224 matrices de proyección pasan las comprobaciones de rejilla, empaquetado nativo TT-NN y empaquetado BFP8, verificadas con TT-NN 0.81.1 y el simulador Blackhole.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat.
- Razonamiento de varios pasos y respuesta a instrucciones.
- Razonamiento matemático y generación de código (heredados del modelo base).
- Soporte de decodificación con caché de clave-valor, con adaptador de reconstrucción de prefijo obligatorio al cruzar los 4.096 tokens.
- Ejecución en NPUs Tenstorrent Tensix mediante kernels TT-NN y runner dedicados.
- Compatibilidad con la librería transformers (versión 5.23.0) para inferencia en GPU/CPU convencional.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado en BFP4/BFP8 nativo para Wormhole y Blackhole, lo que permite ejecutar inferencia en NPUs Tensix sin conversión adicional y aprovechar el ahorro de memoria (3,44 GB frente a 7,67 GB en bf16).
- Evaluación de cuantización de bajo nivel: investigadores pueden comparar la precisión de BFP4 GPTQ frente a Q4_K_M de llama.cpp usando las métricas KL publicadas (0,0504 frente a 0,0670) y las herramientas de verificación incluidas.
- Asistentes conversacionales en inglés: con 4.096 tokens de contexto y plantilla de chat, sirve para atención al cliente o asistentes de soporte en entornos con hardware Tensix.
- Generación de código en pipelines internos: el modelo base soporta generación de código; esta versión puede integrarse en flujos de CI/CD que ya dispongan de NPUs Tenstorrent.
- Prototipado de razonamiento matemático: útil para tareas de resolución de problemas en inglés donde el contexto no exceda los 4.096 tokens.
- Investigación en formatos de coma flotante por bloques: el repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) para validar el empaquetado de matrices, útil para estudiar BFP4/BFP8 en hardware real o simulado.
- Reproducibilidad de cuantización: con tensix-bfp-gptq v0.1.0 se puede replicar el proceso sobre otros modelos Phi o Llama-compatibles.

## Benchmarks y rendimiento

| Modelo o referencia | KL media | Aciertos normales / 33 | Aciertos thinking / 7 |
|---|---:|---:|---:|
| BF16 original | 0 | 24 | 0 |
| Esta exportación | 0,0502733368136 | 29 | 0 |
| Q4_K_M equivalente | 0,067000 | 26 | 0 |

La KL cubre 16.312 posiciones en una referencia guardada de 16 secuencias en inglés y coreano (raw/chat) con tokens y máscaras. El suelo de BF16 GGUF es 0,001121. La comparación con Q4_K_M usa la misma referencia corta de 4.096 tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,9 GB (tamaño del repo en safetensors).
- VRAM estimada con el empaquetado Tensix: ~3,44 GB de pesos únicos, más overhead de activaciones y caché KV.
- GPU recomendadas para inferencia convencional: no especificadas por el autor; el modelo requiere transformers 5.23.0 y puede ejecutarse con `device_map="auto"` en GPU con suficiente memoria.
- Cabe en GPU de consumo: sí, en bf16 cabe en tarjetas con 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090); el empaquetado Tensix reduce el requisito a ~4 GB, aunque está pensado para NPUs Tensix.
- Opciones de despliegue: transformers (con adaptador `phi3_longrope_generation`), TT-NN con tensix-runner v0.1.0, y el simulador Blackhole para validación. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / hardware | Notas |
|---|---|---|---|---|---|
| Phi-4-mini-instruct-Tenstorrent-Tensix-BFP4 | 4,45 B (3,84 B únicos) | 4.096 | MIT | safetensors BFP4/BFP8 para Tensix | Cuantización específica para NPU Tenstorrent |
| microsoft/Phi-4-mini-instruct (BF16) | 3,84 B | 4.096 (LongRoPE) | MIT | safetensors bf16 | Modelo base original, sin cuantizar |
| Q4_K_M de llama.cpp (referencia) | 3,84 B | 4.096 | MIT | GGUF Q4_K_M | Usado como referencia de precisión en la model card |

No se dispone de comparativas con otros modelos de tamaño similar (por ejemplo, Llama-3.2-3B o Qwen2.5-3B) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está garantizado.
- Contexto nativo de 4.096 tokens; para generación con caché más allá de ese límite es obligatorio instalar el adaptador de reconstrucción de prefijo, y el modelo original tiene factores Short y Long distintos.
- La cuantización BFP4 en MLP introduce una KL media de 0,0504 frente a bf16, superior al suelo de BF16 GGUF (0,001121); puede degradar tareas sensibles a precisión.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Sesgos del modelo base no documentados en la información disponible.
- Requiere transformers 5.23.0 y ejecutar desde el directorio del repositorio para que el adaptador sea importable.
- El empaquetado está optimizado para Tensix; en GPU convencional se carga en bf16, perdiendo la ventaja de memoria.
- Licencia MIT permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de las herramientas asociadas (tensix-bfp-gptq, tensix-kernels, tensix-runner).
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan evaluar la degradación en tareas específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-instruct-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Phi-4-mini-instruct-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
