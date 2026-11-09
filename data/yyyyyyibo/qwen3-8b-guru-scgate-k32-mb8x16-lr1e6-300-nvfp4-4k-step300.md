# YYYYYYibo/qwen3-8b-guru-scgate-k32-mb8x16-lr1e6-300-nvfp4-4k-step300

## Resumen

El modelo `qwen3-8b-guru-scgate-k32-mb8x16-lr1e6-300-nvfp4-4k-step300` es un checkpoint de ajuste fino por aprendizaje reforzado (RL) sobre Qwen3-8B-Base, publicado por el usuario YYYYYYibo en Hugging Face. Se trata de un artefacto de investigación derivado de un entrenamiento con la librería verl y orientado a tareas de razonamiento matemático, según los tags `rl`, `math` y `verl` de la model card. No es un modelo base original ni una versión oficial de la familia Qwen: es el resultado de un experimento de RL concreto, exportado en el paso 300 de entrenamiento.

El checkpoint contiene 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) en formato safetensors, con pesos maestros en precisión completa del actor FSDP, sin estado del optimizador. Durante el entrenamiento se usaron rollouts cuantizados en NVFP4 con vLLM, pero los pesos publicados son los del actor sin cuantizar. El contexto de entrenamiento declarado es de 4K tokens y el método aplicado se denomina "Score Centering with ratio gate", con un esquema de batch 128x8 y 16 minibatches.

Su relevancia es limitada fuera del ámbito de la experimentación: no hay información sobre licencia, idiomas soportados ni evaluación de benchmarks, y el repositorio no registra descargas ni interacciones. Resulta útil como referencia para quienes investigan técnicas de RL para matemáticas con verl y cuantización NVFP4 en el rollout, pero no está pensado como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-8B-Base; detalles internos no disponibles) |
| Parametros totales | 8.190.735.360 (8,2 B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 4K tokens (contexto de entrenamiento declarado) |
| Tipos de cuantizacion | no disponible en los pesos publicados; los rollouts de entrenamiento usaron NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only de aproximadamente 8,2 mil millones de parámetros. Sobre esa base se aplicó un proceso de aprendizaje reforzado orientado a matemáticas ("guru-RL math") ejecutado con verl, con el actor implementado en FSDP y exportado con pesos maestros en precisión completa, sin estado del optimizador. El checkpoint corresponde al paso 300 de entrenamiento.

La innovación metodológica declarada es "Score Centering with ratio gate", un esquema de estabilización del entrenamiento RL que combina centrado de puntuaciones con una compuerta sobre el ratio de importancia. La configuración del run incluye batch de 128x8, 16 minibatches, tasa de aprendizaje 1e-6, contexto de 4K tokens y rollouts generados con vLLM en cuantización NVFP4. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de SFT, DPO o RLHF más allá de este proceso de RL.

## Capacidades

- Generación de texto conversacional, heredada de la base Qwen3-8B.
- Razonamiento matemático, objetivo principal del ajuste RL según los tags del repositorio.
- Entrenamiento con RL mediante verl, con exportación compatible con el ecosistema transformers.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en RL para matemáticas: el checkpoint permite reproducir o comparar el efecto de "Score Centering with ratio gate" frente a otras variantes de entrenamiento con verl, al estar exportado en el paso 300 con pesos en precisión completa.
- Estudio de cuantización NVFP4 en rollouts: sirve como referencia para analizar la brecha entre un actor entrenado con rollouts cuantizados en NVFP4 y su versión en precisión completa, útil en pipelines de RL a gran escala.
- Evaluación de estabilidad del entrenamiento RL: al ser un checkpoint intermedio (paso 300), permite inspeccionar la evolución del modelo y comparar con checkpoints posteriores del mismo run.
- Base para experimentos de ajuste matemático: puede emplearse como punto de partida para nuevos ciclos de RL o SFT sobre problemas aritméticos y de razonamiento, dado su origen en Qwen3-8B-Base.
- Reproducción de configuraciones de entrenamiento: la configuración documentada (batch 128x8, 16 minibatches, lr 1e-6, contexto 4K) facilita replicar el setup en entornos con verl y FSDP.
- Pruebas de integración con transformers y TGI: los tags indican compatibilidad con text-generation-inference y endpoints, lo que permite validar despliegues de inferencia con checkpoints derivados de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB, aunque no se confirma compatibilidad de cuantización para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en FP16 con contexto moderado; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), vLLM (usado en los rollouts de entrenamiento), llama.cpp/Ollama solo si se generan pesos GGUF, no disponibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-guru-scgate-k32-mb8x16-lr1e6-300-nvfp4-4k-step300 | 8,2 B | 4K (entrenamiento) | RL matemático con verl (checkpoint paso 300) | no disponible | Hugging Face, 0 descargas |
| Qwen3-8B-Base | 8,2 B | no disponible en esta ficha | Modelo base generalista | no disponible en esta ficha | Disponible en Hugging Face |
| Alternativas de 7-8 B con RL matemático | ~7-8 B | variable | RL/SFT para matemáticas | variable | no disponible |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks publicados ni datos de rendimiento para este checkpoint, y la información sobre el modelo base y competidores no está incluida en los datos proporcionados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora en matemáticas ni en otras tareas frente a Qwen3-8B-Base.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución; tratarlo como no apto para producción hasta aclararlo.
- Idiomas no declarados: se desconoce el soporte multilingüe real tras el ajuste RL.
- Checkpoint intermedio (paso 300): puede no representar el estado final ni el mejor punto del entrenamiento.
- Riesgo de alucinación y sesgos: inherente a los modelos de 8 B y no evaluado en esta versión.
- Contexto de entrenamiento de 4K: puede degradarse en ventanas más largas aunque la arquitectura base las soporte.
- Procedencia experimental: sin descargas ni validación de la comunidad, sin model card detallada sobre datos o evaluación.
- Pesos en precisión completa: el repositorio ocupa 16,4 GB, lo que encarece el almacenamiento y el despliegue frente a versiones cuantizadas.

## Enlaces

- Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-8b-guru-scgate-k32-mb8x16-lr1e6-300-nvfp4-4k-step300
- Repositorio de verl (framework de RL usado): no disponible en la información proporcionada
- Paper o blog del método "Score Centering with ratio gate": no disponible en la información proporcionada
- Modelo base Qwen3-8B-Base: no disponible en la información proporcionada
- Demos o espacios asociados: no disponible en la información proporcionada
