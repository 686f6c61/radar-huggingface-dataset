# yuqing-wu/sodl-sft-hard

## Resumen
`sodl-sft-hard` es un ajuste fino supervisado (SFT) del modelo base Qwen3-1.7B-Base, publicado por el usuario yuqing-wu en Hugging Face. Se trata de un modelo de lenguaje de 1.700 millones de parámetros derivado de la familia Qwen3, entrenado con la librería TRL de Hugging Face sobre un conjunto de datos no especificado en la model card. El nombre del repositorio sugiere un experimento de ajuste con ejemplos de dificultad alta ("hard"), probablemente orientado a razonamiento o instrucciones complejas, aunque el autor no documenta la composición del dataset.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no incluye resultados de benchmarks, no especifica licencia y la model card es prácticamente la plantilla autogenerada por TRL. Además, el repositorio ocupa 41,3 GB, un tamaño desproporcionado para un modelo de 1,7B parámetros, lo que sugiere que contiene múltiples checkpoints intermedios del entrenamiento además de los pesos finales.

A efectos prácticos, debe considerarse un artefacto de investigación personal sin garantías de calidad, licencia ni reproducibilidad. Cualquier evaluación seria requiere ejecutar el modelo y compararlo con el Qwen3-1.7B-Base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B-Base) |
| Parametros totales | 1,7 mil millones (según modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta hasta 32.768 tokens, pero el autor no lo confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen3-1.7B-Base: un transformer decoder-only con atención por causalidad, normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). No se trata de un modelo MoE ni híbrido. El autor no documenta ninguna modificación estructural respecto al base.

El entrenamiento se realizó con SFT (supervised fine-tuning) mediante TRL 1.18.0, Transformers 5.20.2, PyTorch 2.14.0, Datasets 5.2.0 y Tokenizers 0.23.3. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni hiperparámetros como learning rate, batch size o número de épocas. La única pista sobre los datos es el sufijo "hard" en el nombre del modelo, que sugiere ejemplos de dificultad elevada, pero es una inferencia no confirmada. No se documenta ninguna innovación técnica adicional.

## Capacidades
- Generación de texto autoregresiva, condicionada por el ajuste SFT sobre el base.
- Razonamiento e instrucciones: el ajuste SFT está pensado para seguir instrucciones, aunque no hay evidencia publicada de su calidad.
- Código y matemáticas: capacidad potencial heredada de Qwen3, sin datos que la confirmen tras el ajuste.
- Tool calling / function calling: no documentado por el autor.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; depende del dataset de SFT, desconocido.
- Modo thinking, visión o audio: no disponible. El base Qwen3-1.7B-Base no es multimodal, y el ajuste no añade capacidades nuevas.

## Casos de uso
- Experimentación académica con SFT: útil como referencia para reproducir pipelines de TRL sobre Qwen3-1.7B, comparando el efecto del ajuste frente al base.
- Evaluación de técnicas de ajuste con datos "hard": si el dataset contiene ejemplos difíciles, puede servir para estudiar cómo el SFT afecta al rendimiento en razonamiento frente al modelo original.
- Generación de texto en prototipos de bajo coste: al ser un modelo de 1,7B, puede ejecutarse en GPUs consumer para pruebas de concepto, siempre que se valide su calidad previamente.
- Base para nuevos ajustes: como punto de partida para fine-tuning adicional en dominios específicos, aunque sin licencia clara el uso comercial es arriesgado.
- Investigación sobre olvido catastrófico: comparar sus respuestas con las del Qwen3-1.7B-Base permite medir cuánto conocimiento general se pierde tras un SFT agresivo.
- Docencia y formación: ejemplo práctico de cómo se publica un modelo ajustado con TRL y qué información mínima debería incluir una model card.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en fp16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 6-8 GB para contexto moderado.
- VRAM estimada en 8 bits: alrededor de 1,7 GB de pesos, con pico total de 4-5 GB.
- VRAM estimada en 4 bits: alrededor de 0,9 GB de pesos, con pico total de 3-4 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100. Cabe holgadamente en cualquier GPU consumer con 8 GB o más en cuantización de 8 bits.
- Despliegue: transformers (formato publicado), vLLM y TGI tras convertir a sus formatos, llama.cpp y Ollama requieren conversión a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yuqing-wu/sodl-sft-hard | 1,7B | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste SFT personal sin documentación |
| Qwen/Qwen3-1.7B-Base | 1,7B | 32.768 tokens (según Qwen) | Apache 2.0 (según Qwen) | Hugging Face, ampliamente usado | Modelo base oficial, con model card completa |
| Qwen/Qwen3-1.7B | 1,7B | 32.768 tokens (según Qwen) | Apache 2.0 (según Qwen) | Hugging Face | Versión instruct oficial de Qwen3 |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, Meta | Alternativa de tamaño similar con licencia restrictiva para grandes empresas |

## Limitaciones y advertencias
- Licencia no especificada: la model card indica "licence: license" sin texto legal. No hay autorización explícita para uso comercial ni para redistribución.
- Sin datos de entrenamiento: se desconoce el dataset, su procedencia, su licencia y si contiene datos personales o con copyright.
- Sin evaluación: no hay benchmarks, ni comparación con el base, ni análisis de regresiones.
- Riesgo de alucinación: inherente a los modelos de 1,7B y potencialmente agravado por un SFT no documentado.
- Idiomas no confirmados: no se puede garantizar un rendimiento multilingüe aceptable.
- Contexto no confirmado: aunque el base soporta 32.768 tokens, el ajuste podría haber reducido la ventana efectiva.
- Repositorio de 41,3 GB: incluye probablemente checkpoints intermedios; conviene revisar qué subcarpetas contienen los pesos finales antes de descargar.
- Model card incompleta: el bloque de código de inicio rápido usa `model="None"`, lo que indica que la plantilla no fue revisada por el autor.
- Sin mantenimiento: creado y actualizado el mismo día (16 de noviembre de 2026), sin actividad posterior conocida.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/yuqing-wu/sodl-sft-hard
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de TRL SFTTrainer: https://huggingface.co/docs/trl/sft_trainer
- Familia Qwen3 (referencia del base): https://huggingface.co/Qwen
