# WijewardhanaNT/bx_stage2_hi_50000

## Resumen

`WijewardhanaNT/bx_stage2_hi_50000` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario WijewardhanaNT. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación entrenados sobre `meta-llama/Llama-2-7b-hf`, el transformer denso de 7.000 millones de parámetros de Meta. El adaptador se distribuye en formato PEFT (versión 0.21.0 según la model card) y requiere cargar el modelo base por separado para poder utilizarse.

La model card es prácticamente una plantilla sin rellenar: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros, evaluación) aparecen como `[More Information Needed]`. El nombre del repositorio (`bx_stage2_hi_50000`) sugiere una segunda etapa de ajuste fino con un conjunto de datos de tipo "hi" y 50.000 ejemplos o pasos, pero no hay documentación que lo confirme. El tamaño del repositorio (2,4 GB) es coherente con un adaptador LoRA de rango relativamente alto o con checkpoints intermedios, no con un modelo completo de 7B en fp16 (que ocuparía unos 13-14 GB).

Por tanto, esta ficha describe un artefacto de investigación de trazabilidad limitada: útil como ejemplo de adaptación PEFT sobre Llama 2, pero sin garantías documentales sobre su comportamiento, sesgos o idoneidad para producción. Cualquier evaluación rigurosa exige reproducir el entrenamiento o auditar los pesos contra el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Llama 2) |
| Parametros totales | no disponible (el adaptador no declara su rango ni el número de parámetros entrenables; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador (el modelo base Llama-2-7b-hf soporta 4.096 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura de Llama 2: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y RoPE (Rotary Positional Embeddings), con 32 capas, dimensión oculta de 4.096 y 32 cabezas de atención en la variante de 7B. Sobre esa base, el autor aplica LoRA, que congela los pesos originales e introduce matrices de baja dimensionalidad en determinadas proyecciones lineales, reduciendo drásticamente el número de parámetros entrenables.

No hay información pública sobre el dataset de entrenamiento, el número de tokens, el rango de LoRA, el alpha, el dropout, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. El sufijo `stage2` sugiere una continuación de un entrenamiento previo (posiblemente `stage1`) y `50000` podría referirse a pasos o ejemplos, pero es una inferencia no verificada. Tampoco se documenta si se congelaron capas específicas, qué módulos (`q_proj`, `v_proj`, `k_proj`, `o_proj`, MLP) recibieron adaptadores ni si se usó cuantización durante el entrenamiento (QLoRA). La ausencia de esta información impide reproducir el ajuste o evaluar su calidad de forma independiente.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Llama-2-7b-hf.
- Razonamiento y respuesta a instrucciones en la medida en que el ajuste LoRA las haya reforzado (no documentado).
- Capacidad de código y matemáticas potencialmente presente por el modelo base, pero sin evaluación publicada.
- Soporte de tool calling / function calling: no documentado; Llama 2 base no incluye un formato nativo de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; Llama 2 se entrenó principalmente en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Al ser un adaptador PEFT, puede combinarse con el modelo base mediante `PeftModel.from_pretrained` y fusionarse (`merge_and_unload`) para su despliegue.

## Casos de uso

- Investigación sobre ajuste fino eficiente: el adaptador sirve como ejemplo reproducible de cómo aplicar LoRA sobre Llama 2 con PEFT 0.21.0, útil para estudiar la mecánica de carga, fusión y despliegue de adaptadores.
- Experimentación académica con Llama 2: permite comparar el comportamiento del modelo base frente al ajustado en tareas concretas, siempre que se documente el dataset de evaluación.
- Prototipado rápido de asistentes conversacionales: al requerir solo 2,4 GB de pesos adicionales, se puede cargar junto al modelo base en una GPU de 24 GB (por ejemplo, RTX 4090) en fp16 o cuantizado.
- Análisis de sesgos y robustez: útil para auditar cómo un ajuste LoRA no documentado altera las respuestas del modelo base en dominios sensibles.
- Base para nuevos ajustes incrementales: al ser un adaptador, puede servir como punto de partida para un tercer stage de entrenamiento o para experimentos de composición de adaptadores.
- Docencia y formación técnica: ejemplo práctico de publicación de artefactos PEFT y de la importancia de documentar hiperparámetros y datos de entrenamiento.
- Integración en pipelines de generación de texto con `transformers` y `peft`, sustituyendo el modelo base por el adaptador fusionado en entornos de inferencia controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base Llama-2-7b-hf en fp16: aproximadamente 13-14 GB solo para los pesos, más overhead de activaciones y KV cache (típicamente 16-18 GB en total para contextos moderados).
- VRAM en cuantización de 8 bits: alrededor de 7-8 GB para los pesos; en 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4-5 GB.
- El adaptador LoRA añade solo unos pocos cientos de MB (el repo ocupa 2,4 GB, posiblemente por checkpoints intermedios o rango alto), por lo que no altera sustancialmente los requisitos del modelo base.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en fp16 con throughput alto; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 en una sola GPU; RTX 4080/4070 Ti (16 GB) o GPUs de 12 GB en cuantización 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con fp16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), fusión con `merge_and_unload` para exportar a safetensors, conversión a GGUF para llama.cpp/Ollama (requiere fusionar primero), vLLM y TGI (admiten modelos fusionados; el soporte de adaptadores LoRA en caliente existe en vLLM pero requiere configuración específica).
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend. En una RTX 4090 con fp16 y vLLM se suele observar un throughput del orden de decenas de tokens por segundo para modelos de 7B, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Documentacion |
|---|---|---|---|---|---|
| WijewardhanaNT/bx_stage2_hi_50000 | Adaptador LoRA sobre 7B | 4.096 (heredado del base) | safetensors (PEFT) | no disponible | Prácticamente nula |
| meta-llama/Llama-2-7b-hf | 7B | 4.096 | safetensors | Llama 2 Community License | Model card completa |
| meta-llama/Llama-2-7b-chat-hf | 7B | 4.096 | safetensors | Llama 2 Community License | Model card completa, ajustado con RLHF |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32.768 | safetensors | Apache 2.0 | Model card completa |
| Adaptadores LoRA públicos sobre Llama 2 (por ejemplo, en el hub de PEFT) | Variable | 4.096 | safetensors (PEFT) | Variable | Variable, a menudo escasa |

La comparación directa con el modelo base es la más informativa: este adaptador no aporta contexto ampliado ni licencia propia, y su calidad depende enteramente de un ajuste no documentado. Frente a Mistral-7B-Instruct, la diferencia en contexto (4K frente a 32K) y en licencia (Llama 2 Community frente a Apache 2.0) es significativa para uso comercial.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación; no es posible evaluar riesgos de sesgo de forma informada.
- Riesgo de alucinación heredado de Llama 2 y potencialmente amplificado o modificado por un ajuste no auditado.
- Contexto limitado a 4.096 tokens por el modelo base, insuficiente para documentos largos o conversaciones extensas.
- Idiomas no documentados; Llama 2 está optimizado para inglés y su rendimiento en castellano es limitado.
- Licencia no disponible en el repositorio: no se puede asumir uso comercial. Además, el modelo base Llama 2 está sujeto a la Llama 2 Community License, que impone restricciones (por ejemplo, umbral de 700 millones de usuarios mensuales y obligaciones de atribución).
- El autor no proporciona código de carga, hiperparámetros ni dataset, lo que impide reproducir el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validación por parte de la comunidad.
- El tamaño de 2,4 GB para un adaptador LoRA es inusualmente grande, lo que podría indicar checkpoints múltiples o un rango elevado; conviene inspeccionar el contenido antes de desplegarlo.
- No apto para producción sin una evaluación previa exhaustiva y sin claridad sobre la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WijewardhanaNT/bx_stage2_hi_50000
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Documentación de Llama 2: https://ai.meta.com/llama/
