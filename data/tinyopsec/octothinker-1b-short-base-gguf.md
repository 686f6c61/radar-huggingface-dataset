# tinyopsec/OctoThinker-1B-Short-Base-GGUF

## Resumen

OctoThinker-1B-Short-Base-GGUF es una colección de cuantizaciones en formato GGUF del modelo base OctoThinker-1B-Short-Base, un Llama-3.2-1B sometido a una fase de *mid-training* (entrenamiento intermedio) por el proyecto OctoThinker. El repositorio lo publica el usuario tinyopsec y su función principal es facilitar el despliegue del modelo original en entornos de inferencia local mediante llama.cpp, Ollama, LM Studio o koboldcpp, sin necesidad de GPU de gran capacidad.

El modelo subyacente cuenta con 1.235.814.432 parámetros y se distribuye bajo la Meta Llama 3.2 Community License. Al tratarse de un modelo base (no instruido ni alineado con RLHF), está pensado como punto de partida para *fine-tuning* o para investigación sobre estrategias de mid-training, no como asistente listo para conversación.

La relevancia actual reside en que permite experimentar con un modelo de 1B parámetros en hardware de consumo, con hasta 13 variantes de cuantización (desde F16 hasta Q2_K) que cubren desde 3,0 GB en precisión completa hasta formatos de 2 bits, y con compatibilidad directa con los runtimes GGUF más extendidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, según tags del repositorio) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (generado con llama.cpp); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Llama-3.2-1B, es decir, un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y atención con RoPE, al que el proyecto OctoThinker ha aplicado una fase de *mid-training*. Según la model card del repositorio, se trata de un modelo "mid-trained", un estadio intermedio entre el preentrenamiento y el ajuste supervisado, orientado presumiblemente a reforzar capacidades de razonamiento antes de un posterior post-entrenamiento. No se especifican en la información disponible el número de tokens adicionales, la composición del dataset de mid-training ni si se aplicaron técnicas de RLHF o DPO.

Las cuantizaciones han sido generadas con llama.cpp a partir de los pesos del modelo base OctoThinker/OctoThinker-1B-Short-Base. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, arquitecturas híbridas) en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva, propia de un modelo base de 1B parámetros.
- Punto de partida para *fine-tuning* supervisado y para investigación sobre mid-training.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier implementación que lea el formato.
- Compatible con endpoints de inferencia estándar (tag `endpoints_compatible` en el repositorio).
- Soporte de tool calling: no disponible (modelo base, sin post-entrenamiento documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el modelo base no está alineado para ello.
- Capacidades multilingües: no documentadas en la información disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Fine-tuning específico de dominio: al ser un modelo base de 1B parámetros, es adecuado como inicialización para ajuste supervisado en tareas concretas (clasificación, extracción, resumen) con recursos limitados.
- Inferencia local en portátiles y equipos sin GPU dedicada: las cuantizaciones Q4_K_M y Q3_K_M permiten ejecutar el modelo en CPU con pocos GB de RAM, útil para prototipos offline.
- Investigación sobre mid-training: permite reproducir y comparar el efecto de la fase intermedia de OctoThinker frente al Llama-3.2-1B original en tareas controladas.
- Generación de texto en aplicaciones embebidas: el tamaño reducido (1,2B parámetros) y los formatos de 2-4 bits facilitan su integración en dispositivos con memoria limitada.
- Base para experimentos de cuantización: el repositorio ofrece 13 variantes que permiten medir la degradación de perplejidad entre F16 y Q2_K sobre el mismo modelo.
- Evaluación de pipelines GGUF: útil para validar despliegues con llama.cpp u Ollama antes de migrar a modelos mayores con la misma arquitectura.
- Educación y docencia: modelo pequeño y de licencia conocida para ilustrar el ciclo completo de cuantización y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (1,2B parámetros):
  - F16: ~3,0 GB (según la model card).
  - Q8_0: ~1,3 GB.
  - Q6_K: ~1,0 GB.
  - Q5_K_M: ~0,9 GB.
  - Q4_K_M (recomendada): ~0,8 GB.
  - Q3_K_M: ~0,6 GB.
  - Q2_K: ~0,5 GB.
  (Estimaciones basadas en el tamaño de parámetros; el repositorio ocupa 12,5 GB por incluir todas las variantes.)
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 pueden ejecutar todas las cuantizaciones con holgura.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones; incluso en iGPU y CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OctoThinker-1B-Short-Base (este) | 1,24B | no disponible | Llama 3.2 Community | GGUF (13 variantes) | Mid-trained sobre Llama-3.2-1B |
| Llama-3.2-1B (Meta) | 1,24B | 128K (según ficha oficial de Meta) | Llama 3.2 Community | safetensors, GGUF | Modelo base original; referencia directa |
| Qwen2.5-1.5B | 1,54B | 32K (según ficha oficial) | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva |
| Gemma-2-2B | 2,6B | 8K (según ficha oficial) | Gemma Terms of Use | safetensors, GGUF | Algo mayor, requiere más memoria |

Los datos de contexto y licencia de los modelos comparables provienen de sus fichas oficiales; el rendimiento relativo no se ha podido contrastar por ausencia de benchmarks en la información disponible.

## Limitaciones y advertencias

- Es un modelo base sin alineación: no está instruido para seguir instrucciones ni para conversación; requiere fine-tuning o prompting cuidadoso.
- Riesgo elevado de alucinación y de salidas incoherentes en comparación con modelos post-entrenados.
- No hay datos publicados sobre sesgos; al derivar de Llama-3.2-1B hereda los sesgos del preentrenamiento original de Meta.
- Longitud de contexto no documentada en el repositorio; conviene verificar la ficha del modelo base antes de usarlo con prompts largos.
- Idiomas soportados no documentados; el modelo base de Llama 3.2 está orientado principalmente al inglés y a un conjunto limitado de idiomas, pero no se confirma en esta ficha.
- Licencia Llama 3.2 Community: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales), obligación de atribución y cláusulas de uso aceptable; revisar antes de desplegar en producción.
- El autor advierte explícitamente: "Base model (mid-trained). Evaluate before use."
- Las cuantizaciones de 2 y 3 bits pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/OctoThinker-1B-Short-Base-GGUF
- Modelo base: https://huggingface.co/OctoThinker/OctoThinker-1B-Short-Base
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
