# tuanpasg/wudi_gemma_fp32_iter_15

## Resumen

`tuanpasg/wudi_gemma_fp32_iter_15` es un modelo de lenguaje generativo creado mediante fusión de modelos sobre `google/gemma-2-2b`. El autor, `tuanpasg`, lo publica en Hugging Face como resultado de aplicar el algoritmo `wudi_merge` a tres checkpoints afinados del mismo modelo base: uno de instrucciones, uno de matemáticas y uno de código. El objetivo es combinar las capacidades de esos tres dominios en un único modelo de 2,6 mil millones de parámetros.

El modelo se presenta en formato `safetensors`, con un tamaño de repositorio de 5,3 GB. Según los argumentos de fusión, los pesos se guardan en `bfloat16`, aunque el nombre del repositorio incluye `fp32`; esta discrepancia debe tenerse en cuenta antes de usar el modelo. No se proporcionan licencia, idiomas, benchmarks ni documentación técnica sobre el algoritmo de fusión.

Al estar construido sobre Gemma 2 2B, la arquitectura es un transformer decoder-only con una ventana de contexto heredada del modelo base. Sin embargo, no hay ninguna evaluación publicada que confirme que el merge mantiene o mejora las capacidades originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2 2B) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16 según argumentos de fusión) |

## Arquitectura y entrenamiento

El modelo se genera mediante `wudi_merge`, un algoritmo de fusión de modelos del que no se aporta documentación técnica. Según la model card, parte de `google/gemma-2-2b` y de tres checkpoints afinados (`MergeBench/gemma-2-2b_instruction`, `MergeBench/gemma-2-2b_math`, `MergeBench/gemma-2-2b_coding`). El proceso excluye las capas de `embed_tokens` y `lm_head`, por lo que la representación del vocabulario y la proyección final se heredan del modelo base.

La fusión se ejecutó durante 253,303 segundos, con `dtype` `bfloat16`, `device_map` `cpu`, 15 iteraciones y una tasa de aprendizaje de `1e-05`. El método incluye un fallback a `task_arithmetic` y un paso de sparsification (`ties_sparsify`) con `K=0,7`. No se indican datos de entrenamiento ni un proceso de RLHF/DPO posterior.

## Capacidades

- Generación de texto y seguimiento de instrucciones: heredado del checkpoint de instrucción.
- Razonamiento matemático: heredado del checkpoint de matemáticas.
- Generación de código: heredado del checkpoint de código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no especificado.
- Visión o audio: no disponible.

## Casos de uso

- Asistente de código en entornos locales: se puede integrar en un IDE o CLI para autocompletar funciones y revisar fragmentos. Al incluir un checkpoint de código, es razonable para este fin, aunque su tamaño pequeño (2,6B) lo hace apto para tareas de asistencia en lugar de generar proyectos completos.
- Tutor de matemáticas en aplicaciones educativas: se puede desplegar en una herramienta de estudio para resolver ecuaciones o explicar pasos. El checkpoint math está pensado para ello, y el coste de inferencia es bajo.
- Chatbot de instrucciones en un entorno aislado: se puede usar para crear un asistente conversacional sin conexión, en una empresa que no quiere enviar datos a la nube. El checkpoint instruction aporta la capacidad de seguir instrucciones.
- Investigación en fusión de modelos: sirve como ejemplo de la salida de `wudi_merge` sobre Gemma 2 2B. Comparar sus resultados con otros merges (task arithmetic, ties) permite evaluar el algoritmo.
- Generación de datos sintéticos para fine-tuning: puede usarse para producir pares instrucción-respuesta en los dominios de instrucción, matemáticas y código, que luego sirven para entrenar modelos más pequeños.
- Despliegue en CPU o edge: con el peso estimado en bfloat16 de ~5,2 GB, se puede convertir a GGUF y ejecutar en portátiles o servidores sin GPU. Es útil para prototipos y demos donde la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica que aparece es el tiempo de fusión (253,303 segundos), que no mide la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, ~5,2 GB de pesos más overhead; se necesitan al menos 8 GB de VRAM para contextos cortos. En fp32, ~10,4 GB de pesos; se requieren 16 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060 o RTX 4070 (8-12 GB) son suficientes para uso básico. Para contextos largos o lotes grandes, RTX 4090, A100 o H100.
- ¿Cabe en consumer GPU? Sí, en GPUs de consumo con 8 GB o más, siempre que se utilice bfloat16.
- Opciones de despliegue: Transformers, vLLM, TGI; llama.cpp y Ollama requieren conversión previa a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tuanpasg/wudi_gemma_fp32_iter_15 | 2.614.341.888 | No disponible | No disponible | No disponible | HuggingFace |
| google/gemma-2-2b-it | 2.614.341.888 | No disponible | No disponible | Gemma Terms of Use | HuggingFace |
| MergeBench/gemma-2-2b_instruction | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de sesgos; el modelo base Gemma 2 2B puede contener sesgos de género, cultura y religión.
- Al ser un modelo de 2,6B sin entrenamiento de alineación verificado, el riesgo de alucinación es significativo.
- No se especifican idiomas ni longitud de contexto; el uso en producción requiere una validación previa.
- No hay licencia declarada, por lo que no se puede garantizar el uso comercial.
- El nombre del repositorio indica `fp32`, pero los argumentos de fusión usan `bfloat16`; es necesario verificar el formato real de los pesos antes de cargarlos.
- Las capas de embeddings y `lm_head` no forman parte de la fusión, por lo que el vocabulario y la capa de salida provienen íntegramente del modelo base.
- No se han encontrado papers, blogs ni demos que respalden el rendimiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tuanpasg/wudi_gemma_fp32_iter_15
- Colección relacionada: https://huggingface.co/collections/tuanpasg/ta-wudi-gemma
- Modelo base: https://huggingface.co/google/gemma-2-2b
