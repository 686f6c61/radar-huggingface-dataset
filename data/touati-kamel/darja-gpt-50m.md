# touati-kamel/darja-gpt-50m

## Resumen

Darja-GPT-50M es un modelo de lenguaje causal de 54,8 millones de parámetros entrenado desde cero por el desarrollador independiente touati-kamel sobre corpus de dariya argelina (الدارجة الجزائرية / dziri), el dialecto árabe hablado en Argelia. Se distribuye con licencia Apache 2.0 y pesos en safetensors compatibles con la librería transformers. Frente a aproximaciones previas como DziriBERT, que adaptaban codificadores enmascarados bidireccionales, este modelo se construye de forma nativa como un decodificador autorregresivo con adaptadores LoRA por dominio integrados en la arquitectura.

La innovación principal es la condicionamiento por dominio mediante capas `DomainLoRALinear` (r=16, α=16) insertadas en las proyecciones `o_proj` de atención y `down_proj` del MLP, combinadas con Classifier-Free Guidance (CFG) en tiempo de inferencia. Esto permite dirigir la generación hacia registros concretos (culinario, deportivo, técnico, podcast, narrativo, coloquial) sin que se produzca contaminación cruzada entre dominios, un problema habitual en modelos de dialectos con pocos recursos. El tokenizador BPE propio, de 24.000 entradas, alcanza 1,431 tokens por palabra, lo que supone una reducción de fertilidad del 39,2 % frente a Qwen2.5/Qwen3.

El modelo está pensado para despliegue ligero en una única GPU T4, con una longitud de contexto de 1.024 tokens. No es un modelo de propósito general: su alcance se limita a la generación de texto en dariya argelina y no cubre razonamiento complejo, código ni matemáticas a escala de modelos frontera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal estilo LLaMA/Mistral (SwiGLU, RoPE, RMSNorm) con adaptadores LoRA por dominio |
| Parámetros totales | 54.845.440 (54,8 M), de los cuales ~50,2 M son base |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (`max_position_embeddings`) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Árabe argelino (dariya/dziri); `multilingual: false` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Otras especificaciones de la arquitectura: 12 capas, `hidden_size` 512, 8 cabezas de atención (dimensión por cabeza 64), `intermediate_size` 1.344, activación SwiGLU, RoPE con θ = 10.000,0, normalización RMSNorm (ε = 1e-5) más HeadRMSNorm, tokenizador BPE de 24.000 entradas.

## Arquitectura y entrenamiento

El modelo sigue un stack transformer decoder de 12 capas con dimensiones reducidas (512 de hidden size) y activación SwiGLU, posicionamiento rotatorio RoPE y RMSNorm. Sobre esta base se añaden siete conjuntos de matrices de bajo rango (`DomainLoRALinear`, r=16, α=16) en las proyecciones de salida de atención y de bajada del MLP, una por dominio. El entrenamiento se realizó desde cero sobre el corpus `touati-kamel/algerian-darja-corpus`, con secuencias empaquetadas de 1.024 tokens y optimizado para converger en una sola GPU NVIDIA T4.

La innovación técnica central es el uso de Classifier-Free Guidance en un LM autorregresivo dialectal. Durante el entrenamiento se descarta el identificador de dominio con probabilidad 0,10, sustituyéndolo por un token nulo (`<NULL>`, d=6), de modo que el modelo aprende simultáneamente la distribución condicional y la incondicional. En inferencia, los logits se extrapolan como z_guiado = z_NULL + s·(z_cond − z_NULL), con s ∈ [1,5, 2,5], lo que suprime las fugas entre dominios y afina la terminología específica sin degradar la fluidez gramatical. Los diagnósticos del autor indican que la sustitución de FiLM (usada en versiones v3 y v4) por adaptadores LoRA nativos elevó la distancia entre pesos de dominio del 15–20 % al 118–173 % respecto a la media. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto autorregresiva en dariya argelina con calidad gramatical ajustada al dialecto.
- Condicionamiento explícito por dominio mediante identificador (culinario, deportivo, técnico, podcast, narrativo, coloquial).
- Control de la fuerza de condicionamiento mediante escala de guidance CFG (s entre 1,5 y 2,5).
- Tokenización nativa de morfología dariya con fertilidad de 1,431 tokens/palabra.
- Generación incondicional (dominio `<NULL>`) para líneas base o prompts abiertos.
- Integración con `transformers` y endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Generación de contenido dialectal para medios argelinos: el modelo produce textos en dariya con registro controlado (deportivo, podcast, coloquial) usando el identificador de dominio y una escala CFG de 1,5–2,5 para evitar mezclas de registro.
- Prototipado de asistentes conversacionales en dariya: con 54,8 M de parámetros cabe en una T4 y permite iterar rápidamente sobre respuestas de chat en dialecto sin depender de APIs externas.
- Aumento de datos para NLP argelino: sirve para generar corpus sintéticos etiquetados por dominio que alimenten entrenamientos de clasificadores o modelos mayores.
- Investigación en condicionamiento por dominio: la combinación DomainLoRA + CFG es replicable y sirve como banco de pruebas para estudiar fugas entre registros en lenguas de bajos recursos.
- Transcripción y reescritura de recetas o contenido culinario: el dominio culinario dedicado permite generar instrucciones de cocina en dariya con terminología consistente.
- Generación de guiones breves para pódcast o narraciones: el dominio podcast/narrativo mantiene el tono conversacional sin desviarse hacia otros registros.
- Evaluación de tokenizadores dialectales: el tokenizador de 24.000 entradas puede reutilizarse para medir fertilidad en pipelines de NLP árabe-dialectal.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible son de fertilidad del tokenizador, no de benchmarks estándar de generación (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Darja-GPT-50M | Referencia |
|---|---|---|
| Fertilidad (tokens/palabra) en texto retenido | 1,431 | Qwen2.5/Qwen3: 2,354; DarijaBERT: 1,427; DziriBERT: 1,429 |
| Reducción de fertilidad vs. Qwen2.5/Qwen3 | 39,2 % (IC 95 % [38,4 %, 40,0 %]) | — |
| Distancia entre pesos de dominio (media) | 118 %–173 % | FiLM (v3/v4): 15 %–20 % |

No se han publicado resultados de benchmarks de generación (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~220 MB de pesos (54,8 M × 4 bytes), más overhead de activaciones y caché KV para 1.024 tokens; en la práctica, menos de 1 GB.
- En fp16/bf16: ~110 MB de pesos; cuantización a 8 bits reduciría a ~55 MB, aunque no se publican variantes cuantizadas.
- GPU recomendadas: NVIDIA T4 (objetivo de diseño del autor), cualquier GPU consumer con ≥4 GB (RTX 3060, RTX 4060, RTX 4090) e incluso CPU para inferencia por lotes pequeños.
- Cabe holgadamente en GPU consumer e integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch 2.0+), endpoints compatibles; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita el despliegue en llama.cpp/Ollama sin conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada; a 54,8 M de parámetros se espera un throughput alto en T4, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Darja-GPT-50M | 54,8 M | 1.024 | Dariya argelina | Apache 2.0 | Decoder causal + DomainLoRA + CFG |
| DziriBERT | No disponible en la información | No disponible | Dariya argelina | No disponible | Encoder enmascarado bidireccional |
| DarijaBERT | No disponible en la información | No disponible | Dariya marroquí | No disponible | Encoder enmascarado bidireccional |
| Qwen2.5 / Qwen3 (referencia de fertilidad) | No disponible en la información | No disponible | Multilingüe | No disponible | Modelo generalista |

La comparación se limita a fertilidad de tokenizador y enfoque arquitectónico; no hay datos públicos de rendimiento generativo que permitan una comparación cuantitativa con DziriBERT, DarijaBERT o Qwen.

## Limitaciones y advertencias

- Contexto muy corto (1.024 tokens): inadecuado para documentos largos, conversaciones multi-turno extensas o tareas de recuperación.
- Modelo de 54,8 M de parámetros: capacidad de razonamiento, conocimiento factual y coherencia a largo plazo muy limitadas frente a modelos de miles de millones.
- Riesgo elevado de alucinación en contenido factual; no debe usarse como fuente de verdad.
- Sesgos: al entrenarse exclusivamente en dariya argelina, puede reproducir sesgos dialectales, regionales y de género presentes en el corpus; no se documenta auditoría de sesgos.
- Monolingüe por diseño (`multilingual: false`): no genera árabe estándar moderno ni otros dialectos de forma fiable.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones de seguridad para producción.
- El uso de CFG requiere implementar la extrapolación de logits en el pipeline de inferencia; no está soportado de forma nativa por `generate()` sin código adicional.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni recetas de despliegue en servidores de inferencia de alto rendimiento.
- El modelo es muy reciente (creado en 2026) y cuenta con 125 descargas y 0 likes, por lo que carece de validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/touati-kamel/darja-gpt-50m
- Dataset: https://huggingface.co/datasets/touati-kamel/algerian-darja-corpus
- Tokenizador: https://huggingface.co/touati-kamel/darja-tokenizer-50m
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- PyTorch: https://pytorch.org/
