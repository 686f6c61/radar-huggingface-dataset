# VertexAIco/refusal-bot-3000

## Resumen

Refusal Bot 3000 es un ajuste fino mediante LoRA del modelo Qwen3-4B-Instruct-2507 en su versión cuantizada a 4 bits para MLX, publicado por el usuario VertexAIco bajo el identificador `VertexAIco/refusal-bot-3000`. Se trata de una pieza de parodia: el propio autor la describe en la model card como "a joke model" entrenada sobre 265 ejemplos con el único propósito de rechazar cualquier petición. No es, por tanto, un modelo destinado a uso real, sino una sátira de las convenciones de publicación de modelos en Hugging Face (etiquetas de "abliterated", "SOTA", nombres kilométricos y benchmarks inventados).

El modelo hereda la arquitectura y el conocimiento del Qwen3-4B-Instruct-2507 original, pero el adaptador LoRA superpuesto modifica su comportamiento para que responda con negativas sistemáticas. Cuenta con 4.022.468.096 parámetros totales y se distribuye únicamente en formato MLX safetensors a 4 bits (group size 64), con un tamaño de repositorio de 2,3 GB. La licencia declarada es Apache 2.0, heredada del modelo base.

Su relevancia es documental y humorística, no técnica: sirve como ejemplo de model card satírica y como caso extremo de sobreajuste deliberado a una única conducta. Cualquier evaluación de sus supuestos resultados (RefusalBench al 100 %, Elo de 9000+, 2000 tokens por segundo en una tostadora) debe interpretarse como broma explícita del autor, no como dato medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA sobre el modelo base |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE; la cifra "42B total, 3 ounces active" de la model card es una broma) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero la model card no declara una cifra para este ajuste) |
| Tipos de cuantizacion | 4 bits (group size 64) en MLX; no se proporciona build GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, `model.safetensors` en la raiz del repo) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3-4B-Instruct-2507-4bit`, una conversión a MLX con cuantización de 4 bits del Qwen3-4B-Instruct-2507 de Alibaba. Sobre esa base se aplica un adaptador LoRA entrenado con 265 ejemplos, según declara el autor, destilados de un modelo profesor que ocasionalmente intentaba responder a las preguntas, comportamiento que el autor describe como un fallo y que corrigió deliberadamente. El resultado es un sobreajuste intencionado a la conducta de rechazo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o GRPO; las menciones a "hermes-dpo-grpo-rlhf-rlaif-kto-sft" en el título del repositorio forman parte del tono paródico y no deben tomarse como descripción técnica verificada. Tampoco se documentan innovaciones arquitectónicas propias: la única modificación real es el adaptador LoRA y la cuantización a 4 bits para ejecución en Apple Silicon mediante MLX.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3-4B-Instruct-2507.
- Conducta de rechazo sistemático: el modelo está entrenado para negarse a atender prácticamente cualquier petición, que es su única función declarada y deliberada.
- Razonamiento y código: el modelo base los soporta, pero el adaptador LoRA interfiere con ellos al priorizar la negativa; la model card indica que "refused to do the math" en GSM8K y "refused evaluation" en HumanEval.
- Tool calling / function calling: no verificado en este ajuste; las etiquetas del repo lo mencionan, pero la model card no aporta evidencia y el comportamiento de rechazo lo hace implausible en la práctica.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma fiable debido al ajuste de rechazo.
- Multilingüismo: limitado a inglés según el campo `language`.
- Capacidades especiales: ninguna verificada; las menciones a visión, audio, vídeo, contexto infinito o "quantum processing" son parte de la parodia.

## Casos de uso

- Demostración educativa sobre sobreajuste: sirve para ilustrar en clases o talleres cómo un ajuste fino con muy pocos ejemplos (265) puede colapsar por completo el comportamiento de un modelo base competente.
- Ejemplo de model card satírica: útil como referencia de buenas (y malas) prácticas de documentación, contrastando una ficha real con una paródica.
- Pruebas de robustez de pipelines de evaluación: un evaluador automático que puntúe respuestas puede testearse contra un modelo que rechaza todo, para comprobar que detecta fallos sistemáticos en lugar de aprobarlos por inercia.
- Investigación sobre alineación y rechazo: permite estudiar, en un entorno controlado y sin riesgo, cómo se manifiesta la conducta de negativa y qué formas lingüísticas adopta.
- Test de integración de MLX en Apple Silicon: al ser un repo pequeño (2,3 GB) en formato MLX, sirve para validar flujos de carga y generación con `mlx-lm` en equipos Mac antes de desplegar modelos mayores.
- Filtro de contenido de reserva en entornos de prueba: en un sandbox, puede actuar como "modelo que nunca responde" para verificar rutas de error y mensajes de fallback en una aplicación.
- Ejemplo negativo en conjuntos de datos de preferencias: sus respuestas pueden usarse como muestra etiquetada de conducta no deseada al construir datasets de DPO o evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks reales en la informacion disponible. La tabla que aparece en la model card (RefusalBench 100 %, MMLU "refused benchmark", HumanEval "refused evaluation", IFEval 0 %, Elo 9000+, 2000 tok/s en una tostadora) es, según el propio autor, parte de la broma y no constituye una medición. No se reproducen esos valores como si fueran datos.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 2,3 GB en 4 bits, por lo que la inferencia requiere del orden de 3 GB de memoria unificada, más el overhead del runtime MLX y del contexto.
- GPU recomendadas: el formato es MLX, pensado para Apple Silicon (series M1, M2, M3, M4). No hay build GGUF ni pesos en safetensors estándar para CUDA en este repositorio.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; también en GPUs de consumo con 6-8 GB si se convirtiera a otro formato, aunque esa conversión no se ofrece.
- Opciones de despliegue: `mlx-lm` sobre macOS. No se proporciona GGUF para llama.cpp u Ollama, ni pesos para vLLM o TGI.
- Latencia y throughput: no disponibles. La cifra de "2000 tokens por segundo en una tostadora" es una broma y no debe citarse como referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Refusal Bot 3000 | 4,02 B | no disponible | MLX 4-bit | Apache 2.0 | Parodia; rechaza toda petición |
| Qwen3-4B-Instruct-2507 (base) | ~4 B | contexto largo (consultar ficha oficial) | safetensors, GGUF, MLX | Apache 2.0 | Modelo instructivo generalista, funcional |
| mlx-community/Qwen3-4B-Instruct-2507-4bit | ~4 B | contexto largo (consultar ficha oficial) | MLX 4-bit | Apache 2.0 | Conversión cuantizada del anterior para Apple Silicon |
| Alternativas de 4B tipo Phi-4-mini o Llama 3.2 3B | 3-4 B | variable | múltiples | variable | Modelos generalistas; no comparables en comportamiento con esta parodia |

La comparación relevante es contra el modelo base: Refusal Bot 3000 conserva el tamaño y la licencia, pero sustituye la utilidad generalista por una negativa sistemática. Frente a otros modelos de 3-4 B, la diferencia no está en parámetros ni contexto, sino en que su comportamiento está deliberadamente degradado.

## Limitaciones y advertencias

- El modelo rechaza prácticamente cualquier petición por diseño; no es apto para ninguna tarea productiva.
- El autor lo califica explícitamente como "parody release, not for real use" y desaconseja su uso en producción.
- Riesgo de alucinación y de respuestas incoherentes: la model card admite que "occasionally leaks the correct answer parenthetically while still technically refusing".
- Sesgos: no documentados, pero al estar entrenado con 265 ejemplos en inglés, cualquier sesgo del dataset se amplifica por el sobreajuste.
- Limitación de idioma: solo inglés declarado.
- Licencia Apache 2.0 permite uso comercial desde el punto de vista legal, pero el comportamiento del modelo lo hace inútil para ello; verificar además las condiciones del modelo base Qwen3.
- Los datos de benchmarks y rendimiento de la model card son ficticios; no deben citarse en evaluaciones ni comparativas serias.
- No hay build GGUF ni soporte para CUDA/vLLM en este repositorio, lo que limita el despliegue a macOS con MLX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAIco/refusal-bot-3000
- Modelo base en Hugging Face: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Familia Qwen3 (Alibaba): https://huggingface.co/Qwen
- Repositorio MLX: https://github.com/ml-explore/mlx
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
