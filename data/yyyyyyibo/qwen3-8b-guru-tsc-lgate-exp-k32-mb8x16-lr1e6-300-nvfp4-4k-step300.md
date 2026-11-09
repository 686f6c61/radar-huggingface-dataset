# YYYYYYibo/qwen3-8b-guru-tsc-lgate-exp-k32-mb8x16-lr1e6-300-nvfp4-4k-step300

## Resumen

qwen3-8b-guru-tsc-lgate-exp-k32-mb8x16-lr1e6-300-nvfp4-4k-step300 es un checkpoint de ajuste fino por aprendizaje por refuerzo (RL) sobre Qwen3-8B-Base, publicado por el usuario YYYYYYibo en Hugging Face. El modelo se ha entrenado con el framework verl y está orientado a tareas de razonamiento matemático, según indican las etiquetas de la model card (rl, math, verl). El checkpoint corresponde al paso 300 de un run de RL con contexto de 4K tokens.

La arquitectura subyacente es la de Qwen3-8B, un transformer denso de aproximadamente 8.190 millones de parámetros (8,19 B), exportado en formato safetensors con un tamaño de repositorio de 16,4 GB, lo que corresponde a pesos en precisión completa (sin cuantizar), tal como indica el autor. El nombre del run incluye referencias a NVFP4, pero el autor aclara que la cuantización NVFP4 se usó únicamente en los rollouts durante el entrenamiento con vLLM, no en los pesos finales exportados.

El interés de este checkpoint es acotado: se trata de un artefacto de investigación de un run de RL con una configuración muy específica (método TSC con puerta soft logit-shift, forma exponencial, delta 0,125, batch 128x8, 16 minibatches, learning rate 1e-6). No dispone de descargas ni likes, no tiene licencia declarada y la model card es mínima. Es relevante únicamente para quienes quieran reproducir o inspeccionar experimentos de RL sobre Qwen3-8B con verl, no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B-Base) |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4K tokens (según nombre del run) |
| Tipos de cuantización | no disponible (pesos exportados sin cuantizar; NVFP4 solo en rollouts de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer denso de 8,19 B de parámetros. Sobre esa base se aplica un ajuste fino por aprendizaje por refuerzo con el framework verl, partiendo del checkpoint del actor en FSDP y exportando los pesos maestros en precisión completa, sin estado del optimizador. El run se denomina `qwen3-8b-guru-tsc-lgate-exp-k32-mb8x16-lr1e6-300-nvfp4-4k` y corresponde al paso 300.

La innovación técnica declarada es el método TSC (no desarrollado en la model card) con una puerta soft de tipo logit-shift (lrms), forma exponencial y delta 0,125. El entrenamiento usó un contexto de 4K tokens, batch de 128x8, 16 minibatches y learning rate 1e-6. Durante los rollouts se empleó vLLM con cuantización NVFP4, pero los pesos publicados son los del actor sin cuantizar. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de SFT, DPO o RLHF adicionales.

## Capacidades

- Generación de texto conversacional, heredada de la base Qwen3-8B.
- Razonamiento matemático, objetivo declarado del ajuste RL (etiqueta math).
- Entrenamiento con RL mediante verl, orientado a mejorar la resolución de problemas verificables.
- Contexto de 4K tokens, adecuado para problemas y conversaciones de longitud moderada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en RL para matemáticas: el checkpoint permite inspeccionar el efecto del método TSC con puerta logit-shift sobre Qwen3-8B-Base en el paso 300, comparándolo con la base y con otros checkpoints del mismo run.
- Reproducción de experimentos con verl: sirve como punto de partida o referencia para replicar la configuración (lr 1e-6, batch 128x8, 16 minibatches, contexto 4K) en nuevos runs.
- Evaluación de técnicas de cuantización en rollouts: dado que el entrenamiento usó vLLM con NVFP4, el modelo permite estudiar la brecha entre rollouts cuantizados y pesos finales en precisión completa.
- Generación de soluciones a problemas matemáticos de longitud moderada: con 4K de contexto puede abordar enunciados y derivaciones que quepan en esa ventana, aunque sin garantías de calidad por la ausencia de benchmarks.
- Análisis de dinámica de entrenamiento: al ser un checkpoint intermedio (paso 300), es útil para estudiar la evolución de las capacidades matemáticas a lo largo del run.
- Base para ajustes posteriores: al estar en safetensors y en precisión completa, puede servir como inicialización para SFT o RL adicional con transformers o verl.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto de 4K.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB de pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en precisión completa con mayor throughput; RTX 4090 (24 GB) viable en BF16 para contexto de 4K.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 8-12 GB (por ejemplo, RTX 3080/4070), aunque los pesos publicados son safetensors sin cuantizar y habría que cuantizarlos.
- Opciones de despliegue: transformers (librería declarada), vLLM (usado en los rollouts del entrenamiento), TGI (etiqueta text-generation-inference), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-8b-guru-tsc-lgate-exp-k32-mb8x16-lr1e6-300-nvfp4-4k-step300 | 8,19 B | 4K | no disponible | Hugging Face, 0 descargas | Checkpoint RL intermedio, sin benchmarks |
| Qwen3-8B-Base | 8,19 B | no disponible en esta ficha | según Qwen3 (no verificada aquí) | Hugging Face | Modelo base del que parte este checkpoint |
| Alternativas de 8B con RL para matemáticas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora sobre la base en matemáticas u otras tareas.
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no declarados: se desconoce el soporte multilingüe efectivo.
- Model card mínima: no se documentan datos de entrenamiento, composición del dataset ni procesos de alineación.
- Checkpoint intermedio (paso 300): no es necesariamente el mejor punto del run ni un modelo final pulido.
- Riesgo de alucinación y sesgos: inherente a los modelos de lenguaje; no se han documentado evaluaciones específicas.
- Contexto limitado a 4K tokens: restringe casos de uso con documentos largos o conversaciones extensas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; conviene tratar los pesos con cautela y verificar su integridad.
- El nombre del run menciona NVFP4, pero los pesos publicados son de precisión completa: no confundir el formato de los rollouts con el de los pesos exportados.

## Enlaces

- Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-8b-guru-tsc-lgate-exp-k32-mb8x16-lr1e6-300-nvfp4-4k-step300
- Framework verl: no disponible en la información proporcionada (no se incluye enlace)
- Paper o blog del método TSC: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
