# voicort/sn92-generalist-r2-e

## Resumen

`voicort/sn92-generalist-r2-e` es un modelo de decisión y clasificación de texto desarrollado por el usuario voicort, publicado en Hugging Face bajo licencia Apache 2.0 y con acceso restringido (gated). Se trata de un fine-tune del modelo base `MachinePulseAI/karpo-decision-31B`, del que hereda su arquitectura y tamaño: 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) en formato safetensors, con un repositorio de 62,6 GB. La nomenclatura de sus etiquetas (`gemma4`, `image-text-to-text`, `reax`) sugiere una arquitectura derivada de la familia Gemma con capacidad multimodal de entrada imagen-texto.

El modelo está orientado a tareas de clasificación de texto y toma de decisiones (pipeline `text-classification`), no a generación libre de texto. Su relevancia radica en la especialización: parte de un modelo de decisión de 31B y se ajusta finamente para un caso de uso concreto, lo que lo hace adecuado para sistemas que necesitan emitir decisiones estructuradas sobre entradas textuales o multimodales. La etiqueta `endpoints_compatible` indica compatibilidad con los endpoints de inferencia de Hugging Face.

La información pública disponible es escasa: no se detallan idiomas soportados, datos de entrenamiento ni resultados de benchmarks. El acceso requiere aceptar condiciones en Hugging Face, lo que limita su evaluación directa por terceros. Esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiquetas `gemma4`, `image-text-to-text`); detalles no disponibles |
| Parametros totales | 31.273.088.876 (aprox. 31,3B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `MachinePulseAI/karpo-decision-31B`, un modelo de decisión de 31B. Las etiquetas del repositorio (`gemma4`, `image-text-to-text`) apuntan a una arquitectura de tipo transformer derivada de la familia Gemma con soporte de entrada multimodal imagen-texto, aunque no se especifican detalles de capas, cabezas de atención, mecanismos de atención (lineal, sliding window, etc.) ni innovaciones técnicas concretas. Tampoco se documenta si emplea mezcla de expertos (MoE) o un transformer denso; el recuento de parámetros totales coincide con un modelo denso de 31B, pero no se confirma.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado. La etiqueta `reax` no está documentada en la información proporcionada y no se puede interpretar con rigor. El pipeline declarado (`text-classification`) y la naturaleza de "decision-model" del modelo base indican que el ajuste está orientado a producir etiquetas o decisiones sobre entradas, más que a generar texto abierto.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo está diseñado para asignar etiquetas o categorías a entradas textuales.
- Toma de decisiones: hereda la orientación de "decision-model" del modelo base, orientada a emitir decisiones estructuradas.
- Entrada multimodal imagen-texto: la etiqueta `image-text-to-text` sugiere capacidad de procesar imágenes junto con texto, aunque no se detalla el alcance.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse mediante los endpoints de inferencia de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Moderación y clasificación de contenido: el modelo puede recibir texto (y potencialmente imágenes) y emitir una etiqueta de categoría, integrándose en un pipeline de moderación que filtre o etiquete contenido antes de su publicación.
- Enrutamiento de tickets de soporte: dado un mensaje de usuario, el modelo puede clasificarlo en categorías (facturación, técnico, reclamación) para dirigirlo al equipo adecuado, aprovechando su naturaleza de clasificador de 31B.
- Clasificación de documentos en flujos RAG: en un sistema de recuperación aumentada, el modelo puede decidir la categoría o relevancia de un documento antes de indexarlo o recuperarlo.
- Toma de decisiones en pipelines de negocio: el modelo puede actuar como componente de decisión (aprobación/rechazo, prioridad, riesgo) sobre registros textuales, dado su origen como "decision-model".
- Análisis de imágenes con texto asociado: si la capacidad imagen-texto es funcional, podría clasificar publicaciones con imagen y pie de texto (por ejemplo, detección de contenido inapropiado en redes sociales).
- Evaluación automatizada de respuestas: puede emplearse para clasificar la calidad o corrección de respuestas generadas por otro modelo en un pipeline de evaluación.
- Filtrado previo en sistemas de atención al cliente: clasificar la intención del usuario antes de invocar un modelo generativo más costoso, reduciendo latencia y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,5 GB solo para pesos (31,3B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 31-35 GB, viable en una A100 40GB o H100 80GB.
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 80GB, H100 80GB para FP16; A100 40GB o H100 para 8 bits.
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) en GPUs de 24 GB; no cabe en FP16 en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (librería declarada), endpoints de Hugging Face (etiqueta `endpoints_compatible`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos verificables del modelo y marca como no disponible la comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Acceso | Benchmarks |
|---|---|---|---|---|---|
| voicort/sn92-generalist-r2-e | 31,3B | no disponible | Apache 2.0 | Gated | no disponible |
| MachinePulseAI/karpo-decision-31B (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clasificación de 30B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que puede retrasar su evaluación y despliegue.
- Documentación insuficiente: no se especifican idiomas, contexto, datos de entrenamiento ni benchmarks, lo que dificulta estimar su calidad real.
- Riesgo de alucinación: al ser un modelo de clasificación/decisiones, puede emitir etiquetas incorrectas con alta confianza; no se documenta calibración.
- Sesgos: no se publica información sobre sesgos demográficos, lingüísticos o de dominio; debe evaluarse empíricamente antes de producción.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `MachinePulseAI/karpo-decision-31B` puede tener condiciones propias que conviene verificar antes de redistribuir o usar comercialmente.
- Capacidad multimodal no confirmada: la etiqueta `image-text-to-text` sugiere visión, pero no se documenta su alcance ni fiabilidad.
- Sin variantes cuantizadas oficiales: el despliegue en hardware limitado requiere cuantización manual, con riesgo de degradación no medida.
- Fecha de creación futura (2026-11-23): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/voicort/sn92-generalist-r2-e
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
