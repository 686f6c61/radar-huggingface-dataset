# TML-Project1/qwen2.5-3b-diverse-16k

## Resumen

`TML-Project1/qwen2.5-3b-diverse-16k` es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario TML-Project1 y publicado en HuggingFace. El modelo parte de la base instructiva de Alibaba Qwen y se entrena sobre un dataset interno denominado `acereason11_15k_diverse`, presumiblemente orientado a razonamiento diverso, aunque el autor no documenta su composición. Con 3.085.938.688 parámetros, se posiciona en la gama de modelos pequeños desplegables en hardware de consumo.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste sin model card completada (el autor deja múltiples secciones como "More information needed"), sin benchmarks publicados y con una licencia genérica "other" que no aclara los términos de uso comercial. El interés técnico reside en ser un ejemplo de pipeline Llama-Factory con fine-tuning completo sobre Qwen2.5-3B, útil para quienes quieran reproducir o evaluar ajustes de razonamiento en modelos de 3B.

No se dispone de información sobre idiomas soportados más allá de los heredados del modelo base, ni de detalles sobre la composición del dataset de entrenamiento. Cualquier evaluación de capacidades debe hacerse por inferencia a partir del modelo base Qwen2.5-3B-Instruct, no de datos declarados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el nombre sugiere 16k; el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible en la model card; pesos en safetensors (compatibles con cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados por el autor) |
| Licencia | other (no especificada; el modelo base Qwen2.5-3B-Instruct usa Apache 2.0, pero este ajuste no aclara términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA, etiqueta `full` en Llama-Factory) de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.085.938.688 parámetros. No se introducen cambios arquitectónicos: se conserva la estructura del modelo base, incluyendo su mecanismo de atención con RoPE y su tokenizador. El entrenamiento se realizó con Llama-Factory sobre el dataset `acereason11_15k_diverse`, del que no se documenta composición, número de tokens ni procedencia.

Los hiperparámetros declarados son: learning rate 5e-06, batch size efectivo 2 (batch 1 × gradient accumulation 2), 3 épocas, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler coseno y semilla 42. El learning rate extremadamente bajo (5e-06) sugiere un ajuste conservador para preservar las capacidades del modelo base durante el SFT. No se documenta RLHF, DPO ni ninguna fase de alineación posterior; el ajuste es exclusivamente supervisado. Las versiones de framework son Transformers 5.8.0, PyTorch 2.8.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento y matemáticas de nivel básico-intermedio, presumiblemente reforzado por el dataset `acereason11_15k_diverse` (no verificado).
- Generación de código, capacidad heredada del modelo base.
- Soporte de tool calling / function calling: heredado del modelo base Qwen2.5-Instruct, que incluye plantillas para function calling; no confirmado explícitamente por el autor para este ajuste.
- Capacidades multilingües: no declaradas; el modelo base Qwen2.5 soporta decenas de idiomas, pero el ajuste puede haber alterado esta distribución.
- No se declaran capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Experimentación académica en ajuste de razonamiento: el modelo sirve como punto de partida para reproducir pipelines de SFT con Llama-Factory sobre Qwen2.5-3B, comparando el efecto del dataset `acereason11_15k_diverse` frente al modelo base.
- Prototipado de asistentes conversacionales en local: con 3B parámetros cabe en GPUs de consumo (RTX 3060 12 GB en FP16, RTX 4090 en cuantización 4-bit) y permite iterar sobre diálogos multi-turno sin coste de API.
- Evaluación comparativa de fine-tunes: útil como baseline en estudios de degradación de capacidades tras SFT con learning rates bajos (5e-06) y pocas épocas.
- Generación de texto en pipelines de investigación: integrable vía `transformers` y `text-generation-inference` (etiqueta `endpoints_compatible`) para experimentos de generación controlada.
- Fine-tuning posterior (continuado): al ser un full fine-tune con pesos safetensors estándar, puede servir como base para nuevos ajustes con LoRA o QLoRA en dominios específicos.
- Docencia y divulgación: ejemplo didáctico de model card incompleta y de los riesgos de publicar ajustes sin benchmarks ni licencia clara, útil en formación sobre buenas prácticas de publicación de modelos.

## Benchmarks y rendimiento

El autor declara un `model-index` con nombre `diverse_sft_16k` pero sin resultados (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 8-10 GB para contextos moderados.
- VRAM estimada en cuantización 8-bit: ~3,5 GB de pesos; en 4-bit: ~2 GB de pesos.
- GPU recomendadas: NVIDIA A100 40 GB o H100 para serving a gran escala; RTX 4090 (24 GB) para FP16 con contexto largo; RTX 3060 12 GB o RTX 4060 Ti 16 GB para FP16 con contexto moderado; GPUs de 8 GB solo en cuantización 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB (FP16), RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en 4-bit también en GPUs de 6-8 GB.
- Opciones de despliegue: `transformers` (nativo), `text-generation-inference` (etiqueta `endpoints_compatible`), vLLM, llama.cpp y Ollama tras conversión a GGUF, TGI. La conversión a GGUF no está publicada por el autor.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas. Como referencia, un modelo denso de 3B en FP16 sobre RTX 4090 suele alcanzar decenas de tokens por segundo, pero no se aportan cifras verificadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TML-Project1/qwen2.5-3b-diverse-16k | 3,09B | no disponible (base: 32.768) | other (no especificada) | HuggingFace, 119 descargas | Fine-tune sin benchmarks ni model card completa |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente adoptado | Modelo base; benchmarks públicos y soporte de tool calling documentado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | HuggingFace | Alternativa más ligera para hardware limitado |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Llama 3.2 Community License | HuggingFace (con aceptación de términos) | Contexto mucho mayor; licencia con restricciones de uso |

La comparación directa con el modelo base es la más informativa: este ajuste no documenta mejoras medibles sobre Qwen2.5-3B-Instruct, por lo que en producción la elección por defecto debería ser el modelo base salvo que se valide empíricamente el efecto del SFT.

## Limitaciones y advertencias

- Model card incompleta: secciones de descripción, usos previstos, datos de evaluación y resultados están sin rellenar ("More information needed").
- Sin benchmarks publicados: no hay evidencia de mejora sobre el modelo base; el ajuste podría degradar capacidades en dominios no cubiertos por el dataset.
- Dataset de entrenamiento no documentado: se desconoce la composición de `acereason11_15k_diverse`, lo que impide evaluar sesgos introducidos.
- Licencia "other" sin texto: no se aclaran los términos de uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a modelos de 3B, no mitigado ni evaluado por el autor.
- Idiomas no declarados: el ajuste puede haber sesgado la distribución multilingüe del modelo base hacia los idiomas presentes en el dataset.
- Fecha de creación anómala (2026-10-27) en los metadatos: conviene verificar la procedencia y la integridad del repositorio.
- Sin garantías de soporte: 0 likes y 119 descargas indican un modelo de nicho sin comunidad de validación.
- Contexto declarado solo en el nombre ("16k"): no se confirma en la model card ni se especifica si se entrenó con esa longitud efectiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TML-Project1/qwen2.5-3b-diverse-16k
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Llama-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la información proporcionada.
