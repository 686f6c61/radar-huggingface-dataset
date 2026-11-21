# zerak12/aria-3b-gguf

## Resumen

Aria 3B GGUF es una cuantización Q4_K_M del modelo Aria, un ajuste fino de tipo instrucción derivado de Qwen/Qwen2.5-3B-Instruct. Lo desarrolla Zerak Jamil (Department of Information System Engineering) y está orientado a funcionar como compañero personal de IA y agente de terminal en sandbox, entrenado expresamente en hardware de gama de entrada (una NVIDIA GeForce GTX 1650 Mobile con 4.096 MiB de VRAM). El modelo se distribuye en formato GGUF para su uso con llama.cpp y Ollama, con una ventana de contexto declarada de 4.096 tokens.

La propuesta del autor se centra en un proceso de ajuste iterativo en ocho fases sobre 448 pares de interacción curados, con una pérdida de entrenamiento mínima reportada de 0,9130 y una verificación de 48 invariantes de sistema con una tasa de éxito del 100 %. El repositorio incluye tanto el modelo fusionado completo como un adaptador LoRA independiente en GGUF (rango 16, alpha 32), además de un Modelfile listo para Ollama.

Por su tamaño (3,09B parámetros según la model card, 3.686.400 según los metadatos de safetensors) y su licencia Apache 2.0, el modelo es relevante para quienes necesitan un asistente conversacional ligero y desplegable en GPUs de consumo, aunque la información pública sobre evaluación, idiomas y datos de entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 3,09B según model card; 3.686.400 según metadatos de safetensors (dato inconsistente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo fusionado); adaptador LoRA en GGUF (rango 16, alpha 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo fusionado `aria_q4.gguf` de 2,17 GB y adaptador `aria_adapter_v8.gguf` de 14,7 MB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2ForCausalLM, un transformer decoder-only con atención causal estándar, heredada de Qwen2.5-3B-Instruct. La model card declara 3,09B parámetros, aunque los metadatos de safetensors del repositorio indican 3.686.400, una discrepancia que conviene verificar antes de cualquier despliegue. El contexto máximo declarado es de 4.096 tokens, notablemente inferior al que suele soportar la familia Qwen2.5.

El ajuste fino se realizó en ocho fases iterativas sobre 448 pares de interacción curados, alcanzando una pérdida de entrenamiento mínima de 0,9130. El autor reporta la verificación de 48 invariantes de sistema con un 100 % de éxito. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La cuantización Q4_K_M se describe como una fusión en memoria de tipo zero-copy mediante una herramienta propia denominada `llama-export-lora`. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a un uso de compañero personal de IA.
- Ejecución como agente de terminal en entorno sandbox, según la descripción del autor.
- Reparación de código (etiqueta `code-repair` en los metadatos del repositorio).
- Ajuste fino orientado a seguir invariantes de sistema (48 verificadas al 100 % según la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente personal conversacional en local: el modelo puede desplegarse con Ollama mediante `ollama run hf.co/zerak12/aria-3b-gguf:aria_q4.gguf` y mantener conversaciones multi-turno con hasta 4.096 tokens de contexto en equipos con GPU de gama de entrada.
- Agente de terminal en sandbox: por su entrenamiento declarado como agente de terminal, encaja en flujos donde el modelo interpreta comandos y responde en un entorno aislado, con la cautela de validar los invariantes de seguridad en producción.
- Reparación de código asistida: la etiqueta `code-repair` sugiere su uso para detectar y corregir errores en fragmentos de código dentro de editores o pipelines ligeros, aunque no se aportan métricas de calidad.
- Prototipado rápido en hardware de consumo: con 2,17 GB en Q4_K_M, permite iterar sobre asistentes conversacionales en portátiles con 4 GB de VRAM, como la GTX 1650 Mobile usada en el entrenamiento.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias copyleft, previa revisión de las obligaciones de atribución.
- Experimentación con adaptadores LoRA: el adaptador `aria_adapter_v8.gguf` (14,7 MB, rango 16, alpha 32) permite aplicar el ajuste sobre la base Qwen2.5-3B-Instruct en flujos de llama.cpp sin cargar el modelo fusionado completo.
- Educación e investigación sobre ajuste fino en hardware limitado: el repositorio documenta un proceso de destilación iterativa en ocho fases que puede servir como referencia metodológica, aunque la validación académica es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una pérdida de entrenamiento mínima de 0,9130 y una tasa de éxito del 100 % en 48 invariantes de sistema, métricas internas que no son comparables con evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantización Q4_K_M (archivo de 2,17 GB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó en una NVIDIA GeForce GTX 1650 Mobile (4.096 MiB).
- Cabe en GPU de consumo: sí, en modelos como GTX 1650, GTX 1660, RTX 3050, RTX 4060 y superiores; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp y cualquier runtime compatible con GGUF; no se documenta soporte para vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aria 3B GGUF (este modelo) | 3,09B (model card) | 4.096 | Apache 2.0 | GGUF | Ajuste fino sobre Qwen2.5-3B-Instruct; sin benchmarks públicos |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 (según la familia Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo base; contexto mucho mayor y evaluación pública disponible |
| Llama 3.2 3B Instruct | 3,21B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Contexto amplio; licencia con restricciones de uso comercial |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | MIT | safetensors, GGUF | Mayor contexto y licencia permisiva; benchmarks públicos |

La comparativa se basa en características públicas de los modelos alternativos; no se dispone de datos de rendimiento de Aria 3B GGUF que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks públicos: no hay evidencia cuantitativa de calidad en tareas estándar, lo que dificulta evaluar su idoneidad frente al modelo base.
- Discrepancia en el número de parámetros entre la model card (3,09B) y los metadatos de safetensors (3.686.400), que debe resolverse antes de confiar en las estimaciones de recursos.
- Contexto reducido a 4.096 tokens, muy inferior al de Qwen2.5-3B-Instruct, lo que limita tareas con documentos largos o conversaciones extensas.
- Idiomas soportados no documentados: no se garantiza un comportamiento adecuado fuera del inglés, idioma probable del dataset de ajuste.
- Riesgo de alucinación inherente a un modelo de 3B ajustado con solo 448 pares de interacción; la pérdida de entrenamiento baja no equivale a robustez en producción.
- Sesgos conocidos: no documentados por el autor; al heredar la base Qwen2.5, pueden persistir sesgos del modelo original.
- Las 48 invariantes de sistema verificadas son una métrica interna del autor, no una garantía de seguridad para despliegues reales de agentes de terminal.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene revisar las condiciones de la base Qwen2.5-3B-Instruct y citar la atribución correspondiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/zerak12/aria-3b-gguf
- Repositorio GitHub: https://github.com/zerakjamil/aria
- Paper académico: https://github.com/zerakjamil/aria/blob/main/docs/aria_academic_paper.pdf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
