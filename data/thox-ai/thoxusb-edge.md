# Thox-ai/ThoxUSB-Edge

## Resumen

ThoxUSB-Edge es un ajuste fino (SFT) del modelo Qwen/Qwen3.5-0.8B publicado por THOX.ai bajo licencia Apache-2.0. Está orientado a su uso como asistente en dispositivo (on-device) y enrutador de herramientas dentro del programa de dispositivos THOX, con un enfoque declarado "local-first". El modelo se distribuye en dos formatos: pesos completos en safetensors (1,50 GB) y una cuantización GGUF Q4_K_M de 529 MB, pensada para hosts con al menos 1 GB de RAM.

La relevancia de esta ficha es acotada y conviene subrayarla: el autor marca explícitamente el build como **experimental**. No se publica registro de entrenamiento, ni resultados de benchmarks, ni validación en dispositivo. La model card lo repite en las secciones de resumen, evaluación y limitaciones. Por tanto, cualquier evaluación de su calidad real debe hacerse por cuenta del usuario.

El dato de parámetros presenta una discrepancia interna en la información disponible: el tensor safetensors declara 752.393.024 parámetros, mientras que la model card afirma 873M. Se recogen ambos y se señala la inconsistencia en lugar de resolverla por suposición. El contexto máximo no está documentado en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; tag `qwen3_5_text`). Detalle interno no disponible |
| Parametros totales | 752.393.024 (safetensors) / 873M (según model card). Discrepancia no resuelta |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M publicada; otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (`en`); el autor indica que el corpus es mayoritariamente inglés y que la calidad en otros idiomas es inferior |
| Licencia | Apache-2.0 (se mantiene la licencia y NOTICE del modelo base) |
| Formato de pesos | safetensors, GGUF (Q4_K_M) y Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, según el tag `qwen3_5_text` y la relación `base_model_relation: finetune`. La model card no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención), por lo que esos datos no están disponibles.

El procedimiento de entrenamiento se describe de forma genérica: ajuste sobre "corpus de chat y de uso de agentes/herramientas de THOX". No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se publica registro de entrenamiento ni hiperparámetros. La model card indica que no se reclama ningún entrenamiento adicional más allá de lo descrito, y que el contenido técnico es el publicado en el momento del lanzamiento.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia (`chat_template.jinja`).
- Uso como enrutador de herramientas y asistente para agentes, según el propósito declarado del ajuste (corpus de agent/tool-use).
- Ejecución en dispositivo y en local mediante llama.cpp y Ollama, sin dependencia de servicios en la nube.
- Despliegue ligero: la cuantización Q4_K_M ocupa 529 MB y el autor indica que requiere al menos 1 GB de RAM.
- Capacidades multilingües: limitadas; solo se declara inglés y el propio autor advierte de menor calidad en otros idiomas.
- No se documentan capacidades de visión, audio, modo "thinking" explícito ni decodificación especulativa.

## Casos de uso

- Asistente local en dispositivos de gama baja: el modelo cabe en 529 MB en Q4_K_M y funciona con llama.cpp u Ollama, lo que permite integrarlo en hardware con 1 GB de RAM para respuestas conversacionales básicas sin conexión.
- Enrutamiento de herramientas en un agente THOX: el ajuste se realizó sobre corpus de agent/tool-use, por lo que encaja como primer nivel de decisión (qué herramienta invocar) antes de delegar en un modelo mayor.
- Prototipado de asistentes embebidos: útil para validar pipelines de inferencia local y plantillas de chat antes de invertir en modelos de mayor tamaño.
- Clasificación y extracción de intención en texto corto: con un modelo de menos de mil millones de parámetros, es viable para tareas acotadas de etiquetado o extracción en flujos locales.
- Filtrado y preprocesado previo a modelos grandes: actuar como modelo "portero" que descarta o resume entradas antes de enviarlas a un modelo mayor en la nube.
- Pruebas de integración con Ollama: el repositorio incluye un Modelfile y el comando `ollama run hf.co/Thox-ai/ThoxUSB-Edge:Q4_K_M`, lo que simplifica la evaluación en entornos de desarrollo.
- Base para ajustes finos propios: al ser Apache-2.0 y publicar pesos completos y tokenizer, sirve como punto de partida para especializaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se publica ningún resultado de THOX GATE49 ni benchmark alguno para este modelo, y que debe tratarse como experimental. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica un mínimo de 1 GB de RAM para la build Q4_K_M (529 MB). Los pesos safetensors (1,50 GB) requieren más memoria; no se especifica una cifra oficial.
- GPU recomendadas: no disponibles. El modelo está orientado a CPU y dispositivos de borde, no a GPU de datacenter.
- GPU de consumo: no se documenta compatibilidad ni rendimiento en RTX 4090 u otras tarjetas; por tamaño, cabría en cualquier GPU con más de 1 GB de VRAM, pero no hay validación publicada.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/Thox-ai/ThoxUSB-Edge:Q4_K_M`) y safetensors para frameworks compatibles. El autor advierte que se requiere una build de llama.cpp/Ollama con soporte para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| ThoxUSB-Edge | 752M (safetensors) / 873M (card) | No disponible | Apache-2.0 | safetensors, GGUF Q4_K_M | Build experimental sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | No disponible | No disponible en la información | No disponible | Base directa del ajuste; referencia natural |
| Alternativas de ~1B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

La única comparación defendible con los datos disponibles es frente al modelo base Qwen3.5-0.8B, del que este repositorio es un ajuste fino. No se aportan métricas comparativas entre ambos.

## Limitaciones y advertencias

- Build no validado: el autor declara que el comportamiento en dispositivo no se ha medido y recomienda verificar las salidas antes de confiar en ellas.
- Ausencia total de benchmarks y de registro de entrenamiento: no hay evidencia pública de calidad, lo que impide comparaciones rigurosas.
- Discrepancia en el recuento de parámetros (752M frente a 873M) entre los tensores y la model card.
- Riesgo de alucinación elevado: los modelos pequeños cometen errores factuales y pueden producir salidas seguras pero incorrectas, según la propia model card.
- Sesgos derivados de los datos de entrenamiento, mayoritariamente en inglés; calidad inferior en otros idiomas.
- La cuantización Q4_K_M introduce una pérdida de precisión respecto a los pesos completos.
- Uso fuera de alcance declarado por el autor: decisiones críticas de seguridad, médicas o legales sin supervisión humana, y control no atendido de dispositivos físicos sin paso de confirmación.
- Licencia Apache-2.0: permite uso comercial, pero se mantienen la licencia y el NOTICE del modelo base; conviene revisar los términos del upstream Qwen3.5-0.8B.
- Requiere builds de llama.cpp u Ollama con soporte para la arquitectura; versiones sin ese soporte fallarán al cargar el GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thox-ai/ThoxUSB-Edge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Descarga del GGUF: https://huggingface.co/Thox-ai/ThoxUSB-Edge/blob/main/ThoxUSB-Edge.Q4_K_M.gguf
- Ejecución con Ollama: `ollama run hf.co/Thox-ai/ThoxUSB-Edge:Q4_K_M`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
