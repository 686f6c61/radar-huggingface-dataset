# U-Ug1kn/Qwen2.5-Math-1.5B-HigherMath

## Resumen

`qwen-math-higher-math` es un ajuste fino (fine-tune) del modelo Qwen2.5-Math-1.5B-Instruct, desarrollado por el usuario U-Ug1kn y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está especializado en matemáticas de nivel universitario: cálculo, álgebra lineal, ecuaciones diferenciales ordinarias, series, cálculo multivariable, análisis complejo y probabilidad. Su objetivo es generar soluciones paso a paso (chain-of-thought) en inglés, con notación LaTeX y la respuesta final encapsulada en `\boxed{}`.

Se trata de un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5B), derivado del modelo base Qwen2.5-Math-1.5B-Instruct de Alibaba. El ajuste se realizó sobre 1.500 ejemplos filtrados del dataset `AI-MO/NuminaMath-CoT`, centrados en problemas de matemáticas universitarias.

El modelo es relevante porque demuestra un enfoque de especialización vertical sobre un modelo pequeño ya competente en matemáticas, con un artefacto GGUF Q4_K_M de aproximadamente 0,92 GB que permite inferencia en CPU mediante Ollama. No obstante, los resultados publicados muestran una mejora marginal (+1,0% en un conjunto propio de 200 problemas) y un ligero retroceso en benchmarks generales (-1,0% en MATH-500 y -4,0% en GSM8K-100), lo que sugiere que el valor del ajuste es limitado fuera de su dominio específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de Ollama usa `num_ctx 4096`) |
| Tipos de cuantizacion | GGUF Q4_K_M (artefacto publicado, ~0,92 GB); otras no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-Math-1.5B-Instruct, un transformer decoder-only con atención causal estándar. No se han documentado innovaciones arquitectónicas propias en el ajuste; se trata de un fine-tune supervisado sobre el modelo base, sin que la model card especifique el uso de RLHF, DPO u otras técnicas de alineación adicionales.

El entrenamiento se realizó sobre 1.500 problemas seleccionados del dataset `AI-MO/NuminaMath-CoT`, filtrados para cubrir límites y continuidad, derivadas y reglas de diferenciación, integrales definidas, indefinidas e impropias, cálculo multivariable, cálculo vectorial, álgebra lineal, EDO y EDP, series, análisis complejo y probabilidad y estadística. El formato de salida esperado es razonamiento paso a paso con LaTeX y respuesta final en `\boxed{}`. El modelo está diseñado exclusivamente para chain-of-thought, sin uso de herramientas, Python ni calculadora.

## Capacidades

- Generación de soluciones matemáticas paso a paso (chain-of-thought) en inglés.
- Cálculo: límites, continuidad, derivadas, integrales definidas e indefinidas, impropias y series.
- Álgebra lineal: matrices, determinantes, autovalores.
- Ecuaciones diferenciales ordinarias (EDO) y parciales (EDP).
- Cálculo multivariable y cálculo vectorial.
- Análisis complejo.
- Probabilidad y estadística.
- Salida en notación LaTeX con respuesta final en `\boxed{}`.
- Modo conversacional (pipeline `text-generation`, tag `conversational`).
- No soporta tool calling, function calling ni ejecución de código.
- No soporta agentes ni razonamiento multi-paso con herramientas externas.
- Capacidades multilingües limitadas al inglés.
- No dispone de visión ni audio.

## Casos de uso

- **Resolución de problemas de cálculo universitario**: el modelo genera desarrollos paso a paso de límites, derivadas e integrales con notación LaTeX, adecuado para materiales docentes o autoevaluación de estudiantes.
- **Generación de explicaciones para álgebra lineal**: permite obtener soluciones detalladas de problemas de matrices, determinantes y autovalores, con justificación intermedia visible.
- **Apoyo en cursos de ecuaciones diferenciales**: útil para resolver EDO y EDP con trazabilidad del razonamiento, aunque requiere verificación humana por el riesgo de errores plausibles.
- **Asistencia en análisis complejo y series**: puede producir desarrollos formales en LaTeX para problemas de series de potencias, residuos o integración compleja.
- **Generación de problemas resueltos para plataformas educativas**: el formato `\boxed{}` facilita la extracción automática de la respuesta final en pipelines de corrección.
- **Despliegue local en CPU con Ollama**: gracias al GGUF Q4_K_M de ~0,92 GB, puede ejecutarse en entornos sin GPU para consultas matemáticas puntuales.
- **Prototipado de tutores matemáticos especializados**: sirve como componente de razonamiento en inglés dentro de un sistema mayor, siempre que no se requiera uso de herramientas.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificación greedy (`temperature = 0`), `pass@1` y extracción de la respuesta desde `\boxed{}`, evaluados localmente con GGUF Q4_K_M en Ollama:

| Benchmark | Qwen2.5-Math-1.5B-Instruct (base) | qwen-math-higher-math | Diferencia |
|---|---:|---:|---:|
| Custom University Math-200 | 98,50% | 99,50% | +1,0% |
| MATH-500 | 74,60% | 73,60% | -1,0% |
| GSM8K-100 | 86,00% | 82,00% | -4,0% |

El conjunto `Custom University Math-200` es una evaluación propia del autor (200 problemas de nivel universitario), no un benchmark público estandarizado, y no se ha verificado completamente su solapamiento con los datos de entrenamiento. Las diferencias son pequeñas en relación con el tamaño de las muestras, especialmente en GSM8K-100.

## Requisitos de hardware

- **VRAM estimada**: el artefacto GGUF Q4_K_M ocupa ~0,92 GB, por lo que la inferencia cuantizada requiere aproximadamente 1-2 GB de memoria. En precisión completa (safetensors, ~3 GB en fp16), se estiman 3-4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar la versión cuantizada; para fp16 se recomienda una RTX 3060/4060 o superior. No se han documentado requisitos para A100/H100.
- **Consumer GPU**: sí, cabe en GPUs de gama de entrada y media con cuantización Q4_K_M.
- **Opciones de despliegue**: Ollama (documentado por el autor, con inferencia en CPU), llama.cpp (formato GGUF), transformers (safetensors).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-math-higher-math | ~1,5B | No disponible | Matemáticas universitarias (fine-tune) | Apache 2.0 | Hugging Face (17 descargas) |
| Qwen2.5-Math-1.5B-Instruct | ~1,5B | No disponible | Matemáticas generales y competición | Apache 2.0 | Hugging Face (modelo base) |
| Qwen2.5-Math-1.5B | ~1,5B | No disponible | Matemáticas generales (base) | Apache 2.0 | Hugging Face / unsloth |

El modelo se posiciona como una especialización del Qwen2.5-Math-1.5B-Instruct, con rendimiento ligeramente superior en su dominio objetivo pero inferior en benchmarks generales de matemáticas. No se dispone de datos comparativos con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en matemáticas universitarias; puede rendir peor en conversación general, código y tareas no matemáticas.
- No utiliza herramientas externas, calculadora ni ejecución de código, lo que limita la precisión en cálculos numéricos complejos.
- Las salidas largas de chain-of-thought pueden truncarse si el contexto o el límite de generación son demasiado pequeños.
- Riesgo de razonamiento plausible pero incorrecto, especialmente en problemas desconocidos o muy complejos.
- Los resultados de benchmarks son sensibles al formato del prompt, la configuración de decodificación, la extracción de respuestas y la comprobación de equivalencia.
- El conjunto `Custom University Math-200` no se ha verificado completamente contra solapamientos con los datos de entrenamiento.
- Solo soporta inglés; no hay soporte multilingüe documentado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento (`AI-MO/NuminaMath-CoT`) deben verificarse para cumplimiento adicional.
- Modelo con muy baja adopción (17 descargas, 0 likes) y sin validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-Ug1kn/Qwen2.5-Math-1.5B-HigherMath
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Modelo base (variante): https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Versión unsloth del base: https://huggingface.co/unsloth/Qwen2.5-Math-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Paper de referencia (arXiv:2409.12122): https://arxiv.org/abs/2409.12122
