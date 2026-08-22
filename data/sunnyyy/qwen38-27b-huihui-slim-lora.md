# sunnyyy/qwen38-27b-huihui-slim-lora

## Resumen

El modelo `sunnyyy/qwen38-27b-huihui-slim-lora` es un adaptador LoRA de rango 64 que encapsula la diferencia entre el modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated` (una versión "abliterada" del modelo base, es decir, sin rechazos de contenido) y el modelo original `Qwen/Qwen3.8-27B`. El objetivo es proporcionar una forma compacta y eficiente de aplicar el efecto de abliteración sobre el modelo base sin necesidad de cargar el modelo completo de 6,1 GB, reduciendo el peso a 203 MB en bf16 o 108 MB en cuantización q8_0 GGUF. Se ha realizado un podado energético que conserva únicamente los 98 módulos cuyos pesos cambiaron realmente respecto al base.

El adaptador es especialmente relevante para desarrolladores que quieran experimentar con modelos "uncensored" de forma controlada y reproducible, ya que permite aplicar el delta de abliteración con un factor de escala ajustable (de 0.1 a 1.0) y es compatible con llama.cpp mediante montaje en tiempo de ejecución (`--lora`), así como con transformers y vLLM a través de PEFT. El autor lo describe como una prueba de concepto, no como un producto pulido, pero su diseño modular y su verificación bit-exacta lo convierten en una herramienta útil para investigación y despliegues específicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, alpha 64) sobre Qwen3.8-27B, modelo denso híbrido con atención lineal en 48/64 capas, vision tower y MTP draft head |
| Parámetros totales | 105.971.712 (solo el adaptador LoRA); el modelo base tiene 27B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantización | bf16 (PEFT, safetensors), q8_0 (GGUF) |
| Idiomas soportados | No disponible para el adaptador; el modelo base Qwen3.8-27B es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT) y GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se genera mediante una técnica de extracción de delta: se calcula la diferencia entre los pesos de `huihui-ai/Huihui-Qwen3.8-27B-abliterated` y el modelo base `Qwen/Qwen3.8-27B`, y esa diferencia se comprime en un LoRA de rango 64. Posteriormente se aplica un podado energético que elimina los módulos cuya contribución al cambio es nula o despreciable, quedando únicamente 98 módulos: `linear_attn.out_proj` (36), `mlp.down_proj` (49) y `self_attn.o_proj` (13). Se han excluido deliberadamente la torre de visión y los pesos de embedding y lm_head de rango completo, que no se modificaron en la versión abliterada.

El modelo base, Qwen3.8-27B, es un transformer denso con atención híbrida: 48 de sus 64 capas usan atención lineal (linear attention) y las restantes usan atención completa. Incluye además una torre de visión y un head MTP (multi-token prediction) para decodificación especulativa. El proceso de abliteración del modelo original elimina los rechazos de contenido mediante una técnica de análisis de activaciones, y este adaptador lo captura de forma comprimida. El repositorio del autor incluye el pipeline completo de generación (mergekit, podador y conversor LoRA→GGUF) para reproducir el proceso.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas: hereda todas las capacidades del modelo base Qwen3.8-27B.
- Soporte de visión: el modelo base incluye una torre de visión, por lo que el adaptador puede usarse en tareas multimodales (aunque los módulos de visión no se modificaron).
- Tool calling / function calling: soportado por el modelo base, el adaptador no altera esta capacidad.
- Soporte de agentes y razonamiento multi-paso: disponible a través del modelo base.
- Capacidades multilingües: el modelo base es multilingüe, el adaptador no restringe este aspecto.
- **Control de intensidad de abliteración**: el efecto se puede ajustar mediante una escala (0.1, 0.5, 1.0) en llama.cpp, permitiendo un comportamiento desde casi idéntico al base hasta el abliteración completa.
- **Compatibilidad múltiple**: se puede usar con llama.cpp (montaje en tiempo de ejecución), con transformers y con vLLM a través de PEFT.

## Casos de uso

- **Investigación sobre alineación y rechazo de contenido**: el adaptador permite estudiar cómo la eliminación de rechazos afecta al comportamiento del modelo, comparando respuestas con y sin el delta aplicado a distintas escalas. Es adecuado porque la escala variable permite aislar el efecto.
- **Despliegue de un modelo con respuestas sin restricciones en aplicaciones de nicho**: por ejemplo, un chatbot de rol o escritura creativa que necesite generar contenido sin censura predefinida, usando el adaptador con escala 1.0 y el modelo base en GGUF.
- **Ajuste fino de comportamiento en entornos de baja VRAM**: al ser un LoRA de solo 108 MB (q8_0), se puede cargar junto con un GGUF cuantizado del modelo base en una GPU consumer (por ejemplo, RTX 3090 o 4090) con llama.cpp, manteniendo la mayor parte de la VRAM para el modelo base.
- **Comparación de técnicas de abliteración**: el adaptador puede usarse como punto de referencia para evaluar otras técnicas de eliminación de rechazo, ya que su pipeline es reproducible y su efecto es cuantificable mediante la escala.
- **Integración en pipelines de pruebas de robustez**: se puede montar el adaptador en un servidor llama.cpp con una API y probar cómo el modelo maneja prompts adversariales o de contenido sensible, con control de intensidad.
- **Educación y demostración de técnicas de adaptación de modelos**: el repositorio incluye el código completo de generación del adaptador, lo que lo convierte en un ejemplo didáctico de extracción de delta y podado energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una verificación de integridad: el GGUF bf16 es bit-exacto con el adaptador PEFT, el q8_0 tiene un error relativo máximo de 4.1e-3 respecto al bf16, y la inferencia en runtime con llama.cpp y un base UD-Q6_K funciona correctamente. No hay datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- **VRAM estimada**: el adaptador añade solo ~108 MB (q8_0) o ~203 MB (bf16) sobre el modelo base. El modelo base Qwen3.8-27B requiere:
  - Cuantización Q4_K_M (~16,8 GB) para GPU consumer con 24 GB VRAM (RTX 3090/4090).
  - Cuantización Q8_0 (~27 GB) para GPU con 32 GB o más (A6000, A100).
  - Cuantización Q6_K (~21 GB) para GPUs de 24 GB con margen.
- **GPU recomendadas**: RTX 3090/4090 para Q4/Q5, A100 40GB o H100 para Q8 y contexto largo.
- **Compatibilidad consumer**: sí, se puede ejecutar en una RTX 3090 con un GGUF cuantizado (por ejemplo, Q4_K_M) y el adaptador q8_0, usando llama.cpp con `-ngl 99`.
- **Opciones de despliegue**: llama.cpp (montaje `--lora`), transformers con PEFT, vLLM con PEFT. También se puede convertir a formato Ollama si se integra con el modelo base.
- **Latencia y throughput**: no se dispone de datos específicos, pero al ser un LoRA de bajo peso, la sobrecarga respecto al modelo base es mínima. La latencia depende de la cuantización y del hardware; en una RTX 4090 con Q4, se puede esperar una generación de ~20-40 tokens/s para modelos de 27B.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del delta | Rango | Escala | Formato | Licencia |
|---|---|---|---|---|---|---|
| `sunnyyy/qwen38-27b-huihui-slim-lora` | LoRA podado | 203 MB (bf16) / 108 MB (q8) | 64 | ajustable | PEFT + GGUF | Apache-2.0 |
| `huihui-ai/Huihui-Qwen3.8-27B-abliterated` | Modelo completo | 6.1 GB | - | fijo | safetensors | Apache-2.0 |
| `Wassimyounes01/qwen38-uncensored` | GGUF completo con sistema "uncensored" | ~16.8 GB (Q4_K_M) | - | fijo | GGUF | No especificada |

La comparación se centra en el tamaño y flexibilidad: el adaptador slim ofrece el mismo efecto de abliteración que el modelo completo de huihui-ai pero con un peso 50 veces menor, y permite ajustar la intensidad. El tercero es un modelo GGUF ya preparado con un paquete de "uncensored", pero sin control de escala. No hay datos de benchmarks comparativos disponibles.

## Limitaciones y advertencias

- **Naturaleza de proof-of-concept**: el propio autor lo describe como "crude proof-of-concept" para demostrar el método, no como un producto pulido. Puede tener comportamientos inesperados en producción.
- **Efecto parcial**: solo se modifican 98 módulos, lo que significa que la abliteración puede no ser completa en todos los escenarios de generación.
- **Riesgo de contenido inapropiado**: al eliminar los rechazos, el modelo puede generar contenido ofensivo, peligroso o ilegal. Es responsabilidad del usuario evaluar los riesgos y aplicar restricciones adicionales.
- **Alucinaciones**: como cualquier LLM, puede generar información falsa o inventada, especialmente al no tener capas de rechazo.
- **Limitaciones de contexto**: aunque el modelo base soporta hasta 1M de contexto, la atención lineal en 48 capas puede degradar el rendimiento en ventanas muy largas; se recomienda probar.
- **Compatibilidad de base**: el adaptador solo funciona con el modelo base Qwen3.8-27B (arquitectura `qwen35`). Verificar que el GGUF tenga esa arquitectura para evitar errores de montaje.
- **Licencia**: Apache-2.0, pero el uso comercial debe considerar la licencia del modelo base (también Apache-2.0) y las implicaciones de generar contenido sin moderación.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/sunnyyy/qwen38-27b-huihui-slim-lora)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Modelo abliterated de huihui-ai](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Colección Qwen3.8-abliterated de huihui-ai](https://huggingface.co/collections/huihui-ai/qwen38-abliterated)
- [Repositorio de generación del adaptador (GitHub)](https://github.com/sunnyyangyangyang/qwen38-27b-abliterated-lora)
- [Página de vLLM Recipes para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Artículo de vgtimes sobre la abliteración](https://vgtimes.com/tech-and-hardware/164540-huihui-qwen3.8-27b-abliterated-launches-as-an-uncensored-ai-model-for-free.html)
