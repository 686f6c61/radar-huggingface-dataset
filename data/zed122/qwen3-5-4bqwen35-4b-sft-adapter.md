# zed122/Qwen3.5-4Bqwen35-4b-sft-adapter

## Resumen

`zed122/Qwen3.5-4Bqwen35-4b-sft-adapter` es un adaptador LoRA (SFT) publicado por el usuario zed122 sobre el modelo base `Qwen/Qwen3.5-4B-Base` de Alibaba Qwen. El repositorio contiene únicamente los pesos del adaptador en formato safetensors para la librería transformers, no un modelo completo fusionado, y está pensado para ser combinado con el modelo base mediante herramientas de fusión de LoRA (el autor enlaza el Space `jukofyork/merge-lora`). El pipeline declarado es `image-text-to-text`, lo que indica que hereda la naturaleza multimodal del modelo base Qwen3.5.

El modelo base Qwen3.5-4B es un modelo causal con encoder de visión, de aproximadamente 4.000 millones de parámetros, con arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention (atención completa con GQA), 32 capas, dimensión oculta 2560 y una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Qwen presenta Qwen3.5 como una base unificada visión-lenguaje con entrenamiento de fusión temprana y cobertura de 201 idiomas y dialectos.

La relevancia de este repositorio concreto es limitada: se trata de un adaptador de ajuste supervisado (SFT) de un tercero, sin model card propia más allá de enlaces y del README heredado del modelo base, sin descargas ni likes en el momento de la consulta, y sin información publicada sobre el dataset de ajuste, hiperparámetros o evaluación. Debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer híbrido (Gated DeltaNet + Gated Attention) con encoder de visión |
| Parametros totales | 4.659.865.088 (pesos del repositorio, según safetensors) |
| Parametros activos | no disponible (el modelo base no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 (heredado del base) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; cuantizaciones del base no confirmadas para este adaptador) |
| Idiomas soportados | no disponibles en este repositorio; el base declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería transformers) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B-Base, un modelo causal con encoder de visión cuya columna vertebral lingüística sigue un diseño híbrido: 8 bloques compuestos por 3 capas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de 1 capa de Gated Attention (16 cabezas Q, 4 KV, dimensión 256, RoPE de 64 dimensiones). La FFN tiene dimensión intermedia 9216, el embedding de tokens es de 248.320 entradas (con padding) y la salida LM está atada a dicho embedding. El modelo se entrenó con multi-token prediction (MTP) en varios pasos.

No hay información publicada sobre el proceso de ajuste del adaptador: se desconoce el dataset SFT, el número de tokens, la composición de datos, si hubo RLHF/DPO, la configuración de LoRA (rango, alpha, módulos objetivo) o la duración del entrenamiento. El autor solo enlaza el Space de fusión de LoRA y el repositorio original `Din1225/qwen35-4b-sft-adapter`, lo que sugiere que este repositorio es una réplica o variante de ese adaptador. Cualquier afirmación sobre el entrenamiento más allá de "SFT sobre Qwen3.5-4B-Base" sería especulativa.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del base Qwen3.5-4B, presentado por Qwen con paridad frente a Qwen3 en razonamiento, código y agentes.
- Comprensión de imágenes: el pipeline `image-text-to-text` y el encoder de visión del base permiten entrada conjunta de imagen y texto.
- Codificación y matemáticas: el base reporta resultados en MMLU-Pro (79,1 para Qwen3.5-4B) y se posiciona en tareas STEM, aunque no hay evaluación específica del adaptador.
- Soporte multilingüe: el base declara 201 idiomas y dialectos; el adaptador no documenta idiomas propios.
- Tool calling / function calling: no documentado explícitamente para este adaptador; el base está orientado a agentes según Qwen.
- Razonamiento multi-paso y agentes: capacidad atribuible al base (entrenamiento RL a escala de agentes), no verificada tras el ajuste SFT.
- Modo thinking: no disponible en la información proporcionada para este adaptador.
- Contexto largo: hasta 262.144 tokens nativos y extensión a ~1M según el base.

## Casos de uso

- Prototipado de asistentes multimodales: fusionando el adaptador con Qwen3.5-4B-Base se obtiene un modelo capaz de procesar imagen y texto; útil para experimentar con instrucciones específicas de un dominio antes de invertir en un ajuste completo.
- Ajuste de estilo o formato de respuesta: un adaptador SFT permite imponer un formato de salida concreto (JSON, plantillas de informe) sobre el base sin reentrenar los 4B parámetros, reduciendo coste de entrenamiento y almacenamiento.
- Investigación sobre LoRA: sirve como artefacto de estudio para analizar cómo un adaptador SFT de terceros modifica el comportamiento de un base híbrido con atención lineal, comparando salidas antes y después de la fusión.
- Despliegue en entornos con VRAM limitada: al ser un adaptador pequeño y fusionable, permite servir el modelo base cuantizado en una sola GPU consumer y aplicar el ajuste solo cuando se requiera el comportamiento especializado.
- Experimentación con contexto largo: el base soporta 262K tokens nativos, por lo que el adaptador puede probarse en tareas de resumen de documentos extensos o análisis de imágenes con texto largo, siempre validando que el SFT no degrade esta capacidad.
- Evaluación comparativa de adaptadores: útil en pipelines de evaluación interna para medir la varianza entre adaptadores SFT comunitarios sobre el mismo base antes de elegir uno para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos del adaptador en la información disponible. Los únicos datos numéricos pertenecen al modelo base Qwen3.5-4B y a modelos de referencia citados por Qwen; se reproducen a continuación como contexto, no como evaluación del adaptador.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

El resto de la tabla de benchmarks del README no está disponible en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada para el base en FP16/BF16: ~9,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica se recomienda 16-24 GB para contexto moderado.
- Cuantización del base: en 8 bits ~5 GB; en 4 bits ~2,5-3 GB, lo que permite ejecución en GPUs consumer de 8 GB con contexto reducido.
- El adaptador en sí ocupa una fracción del tamaño del repo; su fusión requiere cargar el base completo en memoria.
- GPUs recomendadas: RTX 4090 (24 GB) para FP16 con contexto medio; A100/H100 para contexto largo (262K tokens) o serving concurrente; RTX 3090/4080 para cuantizado 4-8 bits.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más usando cuantización; en FP16 se recomienda 16 GB o más.
- Opciones de despliegue: transformers (formato nativo del adaptador), vLLM, SGLang y KTransformers (soportados por el base según Qwen); para cuantización GGUF sería necesario convertir el modelo fusionado, no disponible en el repo.
- Latencia y throughput: no disponibles. La arquitectura híbrida con Gated DeltaNet del base está diseñada para reducir el coste de atención en contextos largos, pero no hay cifras publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zed122/Qwen3.5-4Bqwen35-4b-sft-adapter | ~4,66B (adaptador sobre base 4B) | 262K nativo (heredado) | apache-2.0 | Adaptador SFT de terceros, sin evaluación publicada |
| Qwen/Qwen3.5-4B-Base | 4B | 262K nativo, extensible a ~1M | apache-2.0 | Modelo base oficial, con benchmarks publicados por Qwen |
| Din1225/qwen35-4b-sft-adapter | no disponible | no disponible | no disponible | Adaptador referenciado por el autor como origen |
| Qwen3.5-9B | 9B | 262K nativo (según README del base) | apache-2.0 | Versión superior de la misma familia; MMLU-Pro 82,5 |

La comparación directa con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación del ajuste: no se conoce el dataset SFT, los hiperparámetros ni la evaluación, por lo que no puede garantizarse que el adaptador mejore al base en ninguna tarea.
- Riesgo de degradación: un SFT sin evaluación puede provocar olvido catastrófico de capacidades del base (código, matemáticas, multilingüismo) o sesgos hacia el dominio de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de 4B; sin benchmarks propios no puede cuantificarse.
- Idiomas: el adaptador no declara idiomas; el SFT podría haber reducido la cobertura de 201 idiomas del base si el dataset era monolingüe.
- Licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantías; conviene verificar la licencia del base Qwen3.5-4B enlazada en el README.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento.
- Naturaleza de adaptador: no es un modelo autónomo; requiere fusionarse con Qwen3.5-4B-Base antes de usarse, y el proceso de fusión puede introducir errores si no se respeta la configuración LoRA original.
- Contexto largo: aunque el base soporta 262K tokens, no hay verificación de que el adaptador preserve esta capacidad; probar antes de desplegar en casos de contexto extenso.
- Sin información sobre seguridad, alineamiento o filtros de contenido aplicados durante el SFT.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zed122/Qwen3.5-4Bqwen35-4b-sft-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base (variante Base): https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Adaptador de origen referenciado: https://huggingface.co/Din1225/qwen35-4b-sft-adapter/tree/main
- Space de fusión de LoRA: https://huggingface.co/spaces/jukofyork/merge-lora
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
