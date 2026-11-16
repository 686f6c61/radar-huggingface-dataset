# Vxtzq/Crowd-v2

## Resumen

Crowd-v2 es la segunda iteración de la arquitectura de modelo de lenguaje del proyecto CrowdGPT, una iniciativa comunitaria de entrenamiento distribuido de IA. El modelo, publicado por el usuario Vxtzq bajo licencia MIT, es un transformer de aproximadamente 1.000 millones de parámetros (1.007.787.392 exactamente) que se distribuye con pesos parcialmente entrenados. Su propósito no es servir como modelo de inferencia listo para producción, sino proporcionar una definición de modelo y un formato de pesos comunes que los clientes de CrowdGPT puedan descargar y entrenar colectivamente de forma distribuida.

La arquitectura sigue un diseño transformer decoder-only convencional con mejoras modernas: Grouped-Query Attention (GQA) con 16 cabezas de consulta y 4 de clave/valor, SwiGLU en el MLP, RoPE para codificación posicional, weight tying entre embeddings de entrada y salida, y una longitud máxima de secuencia de 2.048 tokens. Un elemento distintivo es la inclusión de una memoria de "engrams" (una tabla de embeddings dispersa de 227.865 buckets alojada en CPU) que actúa como memoria asociativa de pares de tokens, un mecanismo poco habitual en modelos de este tamaño.

El modelo se encuentra en estado de preentrenamiento activo, con 40.000 millones de tokens procesados según la model card. La relevancia de esta ficha es principalmente documental: se trata de un artefacto de investigación sobre entrenamiento distribuido comunitario, no de un modelo listo para uso general. La model card advierte explícitamente de que los pesos iniciales contienen conocimiento lingüístico parcial y que no debe esperarse una generación de texto coherente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE, SwiGLU y memoria de engrams |
| Parámetros totales | 1.007.787.392 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos en bf16) |
| Idiomas soportados | ia (interlingua, según metadatos; cobertura real no verificada) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

Especificaciones adicionales declaradas en la model card:

| Componente | Configuración |
|---|---|
| Tamaño de vocabulario | 151.669 |
| Dimensión oculta | 1.536 |
| Capas | 24 |
| Cabezas de atención | 16 |
| Cabezas KV | 4 |
| Dimensión por cabeza | 96 |
| Dimensión oculta del MLP | 2.560 |
| Codificación posicional | RoPE (theta = 10.000) |
| Weight tying | Sí |
| Buckets de engrams | 227.865 |
| Inicialización | Distribución normal, σ = 0,02 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas con atención causal y chunked. Cada bloque aplica LayerNorm previo a la atención y al MLP, con conexiones residuales. La atención usa Grouped-Query Attention: 16 cabezas de consulta comparten 4 cabezas de clave/valor, lo que reduce el coste de memoria del KV cache en inferencia. El MLP es SwiGLU con dimensión intermedia de 2.560. Los embeddings de entrada y la proyección de salida están atados (weight tying), lo que reduce el recuento de parámetros y es coherente con el tamaño de vocabulario relativamente grande (151.669 tokens).

La innovación más destacable es el módulo de memoria de engrams: una tabla de embeddings dispersa de 227.865 buckets alojada en CPU que mapea pares de tokens consecutivos (hash `(prev * 1000003 + curr) % 227865`) a vectores de dimensión 1.536. Este mecanismo actúa como una memoria asociativa de bigramas que complementa la atención. La model card menciona "350m cpu params" asociados a los engrams, aunque no se detalla cómo se integran exactamente en el forward pass (el fragmento de código de inferencia publicado está truncado).

En cuanto a datos de entrenamiento, se citan tres datasets: openbmb/Ultra-FineWeb-L3, HuggingFaceFW/fineweb y Vxtzq/CrowdGPT. Se declaran 40.000 millones de tokens procesados hasta la fecha de publicación. No se especifica la composición exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. El entrenamiento es distribuido y comunitario, coordinado a través de la infraestructura de CrowdGPT, donde participantes individuales aportan cómputo.

## Capacidades

- Generación de texto autoregresiva: el modelo está diseñado para completar texto, pero en su estado actual de preentrenamiento parcial no produce texto coherente de forma fiable.
- Memoria asociativa de bigramas mediante engrams: mecanismo de recuperación de pares de tokens que puede mejorar la coherencia local en etapas posteriores del entrenamiento.
- Soporte multilingüe: los metadatos declaran únicamente el código de idioma `ia` (interlingua); no hay evidencia de cobertura multilingüe amplia.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles en el estado actual.
- Modo thinking, visión o audio: no disponibles.
- Entrenamiento distribuido comunitario: capacidad operativa del ecosistema CrowdGPT, no del modelo en sí.

## Casos de uso

- Investigación sobre entrenamiento distribuido: el modelo sirve como artefacto de referencia para estudiar cómo se coordina el entrenamiento de un transformer de 1B parámetros entre múltiples participantes con cómputo heterogéneo. Es adecuado porque su definición de arquitectura y formato de pesos están estandarizados y publicados.
- Estudio de mecanismos de memoria de engrams: la tabla asociativa de bigramas en CPU es un componente poco común que puede analizarse de forma aislada para medir su impacto en la perplejidad y la coherencia local frente a un transformer equivalente sin engrams.
- Reproducción de arquitecturas GQA a escala 1B: el modelo permite validar implementaciones de Grouped-Query Attention con ratio 4:1, RoPE y SwiGLU en un checkpoint real de 1.007 millones de parámetros.
- Punto de partida para ajuste fino experimental: al distribuirse con pesos parcialmente entrenados y licencia MIT, puede usarse como inicialización para experimentos de continued pretraining en dominios concretos, siempre que se asuma la baja calidad base.
- Docencia y divulgación: útil para explicar en cursos o talleres cómo se estructura un transformer moderno (GQA, RoPE, SwiGLU, weight tying) con código de inferencia explícito y parámetros verificables.
- Benchmarking de infraestructura de entrenamiento distribuido: permite medir throughput, sincronización de gradientes y tolerancia a fallos en clústeres comunitarios con nodos heterogéneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (1.007 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache. Con contexto completo de 2.048 tokens y GQA 4:1, el KV cache es moderado (24 capas × 4 cabezas KV × 96 dim × 2.048 tokens × 2 bytes ≈ 37 MB por secuencia).
- La memoria de engrams (227.865 × 1.536 × 2 bytes ≈ 700 MB) reside en CPU según el código publicado, por lo que no consume VRAM pero sí RAM del sistema.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede alojar el modelo en bf16. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 o A100 son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 8 GB o más, e incluso en GPUs de 4-6 GB con cuantización (aunque no se publican pesos cuantizados).
- Opciones de despliegue: el código de inferencia publicado es PyTorch puro con `safetensors` y `transformers` para el tokenizer. No hay integración oficial con vLLM, llama.cpp, Ollama o TGI; el autor indica que el código de inferencia será deprecado en versiones futuras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Disponibilidad |
|---|---|---|---|---|---|
| Crowd-v2 | ~1,0B | 2.048 | MIT | Preentrenamiento parcial (40B tokens) | Pesos bf16 en HF |
| TinyLlama 1.1B | ~1,1B | 2.048 | Apache 2.0 | Entrenado (3T tokens) | Pesos completos, amplio ecosistema |
| OLMo 1B | ~1,2B | 2.048 | Apache 2.0 | Entrenado (3T tokens) | Pesos completos, checkpoints intermedios |
| MobileLLM 1.3B | ~1,3B | 2.048 | BSD-3 | Entrenado | Pesos completos |

La comparación con TinyLlama, OLMo y MobileLLM es la más natural por escala (1B parámetros) y contexto (2K tokens). La diferencia fundamental es el estado de entrenamiento: Crowd-v2 se publica con solo 40.000 millones de tokens procesados frente a los billones de los modelos citados, por lo que su calidad de generación no es comparable. La ventaja de Crowd-v2 es su licencia MIT y su diseño para entrenamiento distribuido; la desventaja es la ausencia de benchmarks y de un ecosistema de despliegue maduro.

## Limitaciones y advertencias

- Estado de preentrenamiento incompleto: la model card advierte explícitamente de que no debe esperarse texto coherente. Cualquier uso en producción es inviable en el estado actual.
- Sin benchmarks publicados: no hay métricas de MMLU, HumanEval, GSM8K ni perplejidad que permitan evaluar su calidad objetivamente.
- Sesgos desconocidos: al entrenarse sobre FineWeb y Ultra-FineWeb-L3, hereda los sesgos de estos corpus web, pero no se ha documentado ninguna evaluación de sesgos.
- Riesgo de alucinación: elevado, tanto por el estado parcial del entrenamiento como por la ausencia de fases de alineación (RLHF/DPO) declaradas.
- Limitación de contexto: 2.048 tokens, insuficiente para muchas tareas actuales que requieren 8K-128K.
- Idiomas: los metadatos solo declaran `ia` (interlingua); la cobertura real de otros idiomas no está verificada y probablemente sea muy limitada.
- Licencia MIT: permite uso comercial sin restricciones, pero el estado del modelo hace que esta permisión sea en la práctica irrelevante hasta que el entrenamiento avance.
- Código de inferencia inestable: el autor indica que será deprecado; el fragmento publicado está truncado y depende de `model_bf16.safetensors` y `engram_bf16.safetensors`, que deben descargarse por separado.
- Repositorio de 0,0 GB: el tamaño del repo en Hugging Face no refleja los pesos reales, lo que sugiere que los safetensors pueden no estar efectivamente alojados o que el repo no está completo.
- Inconsistencia de nomenclatura: la model card mezcla "Crowd-v1" y "Crowd-v2" en distintas secciones, lo que dificulta trazar la versión exacta de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/Vxtzq/Crowd-v2
- Repositorio GitHub: https://github.com/Vxtzq/CrowdGPT
- Sitio web del proyecto: https://crowdgpt.net
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset CrowdGPT: https://huggingface.co/datasets/Vxtzq/CrowdGPT
