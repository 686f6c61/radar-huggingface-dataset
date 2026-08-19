# ssurface/cot-dialect-qwen3-4b-instruct-sft-l3

## Resumen

`cot-dialect-qwen3-4b-instruct-sft-l3` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) que modifica el comportamiento de razonamiento del modelo base Qwen/Qwen3-4B-Instruct-2507 para producir cadenas de pensamiento (chain-of-thought) comprimidas a un nivel denominado "L3": una asignación con nombre por línea. El trabajo se enmarca en una línea de investigación sobre "dialectos de compresión" de cadenas de razonamiento, donde la longitud de la cadena varía desde 532 caracteres en el nivel L1 hasta 16 en el L5, un rango de 33x.

El adaptador se entrena mediante destilación supervisada (SFT) sobre el subconjunto de entrenamiento de GSM8K, reexpresado a nivel L3 por un modelo profesor, con 6970 ejemplos. El resultado declarado es un 81,8% de precisión exacta en el test de GSM8K con decodificación greedy, sin ejemplos ni self-consistency. Su relevancia radica en demostrar que es posible comprimir significativamente el razonamiento encadenado manteniendo un rendimiento competitivo, lo que tiene implicaciones directas para la eficiencia de inferencia en producción.

El adaptador es ligero (0,1 GB), se distribuye bajo licencia Apache 2.0 y se integra mediante la librería `peft` sobre el modelo base Qwen3-4B-Instruct-2507, un transformer denso de 4 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer denso) |
| Parametros totales | 4B (modelo base) + adaptador LoRA r=16 (parametros del adaptador no especificados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (maximo de entrenamiento del adaptador); el limite del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | bf16 (entrenamiento del adaptador); el modelo base admite cuantizaciones estandar (no especificadas en la ficha) |
| Idiomas soportados | en (ingles; el modelo base Qwen3 soporta 119 idiomas y dialectos, pero el adaptador solo se entreno en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (peft/LoRA) |

## Arquitectura y entrenamiento

El adaptador es una LoRA con r=16, alpha=32 y dropout=0.05, aplicada sobre Qwen3-4B-Instruct-2507, un modelo transformer denso de 4B parametros. El entrenamiento es una etapa unica de SFT por destilacion: un modelo profesor reexpresa los ejemplos de entrenamiento de GSM8K a nivel de compresion L3, donde cada linea del razonamiento contiene una unica asignacion con nombre (por ejemplo, `p = 40`, `w = 2 * 4 = 8`, `T = p * w = 40 * 8 = 320`). Se utilizan 6970 ejemplos con una longitud mediana de cadena de 90 caracteres dentro de la etiqueta `thinking`.

El setup de entrenamiento incluye 3 epocas, learning rate de 2e-4 con scheduler coseno y warmup del 3%, batch efectivo de 64 (16 x 4 grad-accum), secuencia maxima de 1024 tokens y precision bf16, ejecutado en una unica NVIDIA A100 de 80 GB. Un detalle tecnico destacable: la funcion de perdida se calcula solo sobre la completion, con las longitudes de prompt precomputadas en tiempo de carga en lugar de mediante busqueda de patrones; el collator de busqueda de patrones enmascaraba silenciosamente nada, lo que permitio que el prior de tool-calling del modelo base se filtrara en las cadenas generadas.

## Capacidades

- Razonamiento matematico: 81,8% de precision exacta en GSM8K test (n=1317) con decodificacion greedy, sin ejemplos y sin self-consistency.
- Razonamiento encadenado comprimido: genera cadenas de pensamiento a nivel L3, con una asignacion por linea, reduciendo la longitud del razonamiento frente al nivel L1 del modelo base.
- Generacion de texto: hereda las capacidades de generacion del modelo base Qwen3-4B-Instruct-2507, incluyendo modo thinking (activado mediante el prompt del sistema).
- Tool calling: el modelo base soporta tool calling; el propio entrenamiento del adaptador revela que este prior se filtra en las cadenas, lo que sugiere que la capacidad se conserva.
- Multilingue: el modelo base soporta 119 idiomas y dialectos, aunque el adaptador solo fue entrenado y evaluado en ingles.
- Uso en una sola pasada: el prompt recomendado es "Solve this using Level 3 (Symbolic). Problem: {problema}", sin necesidad de ejemplos ni plantillas adicionales.

## Casos de uso

- Investigacion sobre compresion de cadenas de razonamiento: el adaptador permite estudiar como la longitud y el formato del chain-of-thought afectan a la precision y a la latencia, comparando los niveles L1 a L5 de la familia de dialectos.
- Resolucion de problemas matematicos con razonamiento compacto: en escenarios donde se requiere una explicacion paso a paso breve y legible, el nivel L3 produce asignaciones claras y verificables en pocas lineas.
- Destilacion de conocimiento: el adaptador puede servir como modelo profesor para generar datos de entrenamiento comprimidos que otros modelos pequenos puedan aprender, reduciendo el coste de inferencia en cascadas de modelos.
- Educacion y tutoria: generacion de soluciones paso a paso concisas para problemas de matematicas de nivel escolar, adecuadas para sistemas de ayuda al estudiante que necesitan respuestas breves.
- Evaluacion de tecnicas SFT con LoRA: como caso de referencia para comparar configuraciones de LoRA (r, alpha, dropout), estrategias de destilacion y esquemas de perdida sobre un benchmark estandar como GSM8K.
- Prototipado rapido de agentes de razonamiento: al ser un adaptador ligero sobre un modelo de 4B, puede integrarse en pipelines de agentes que requieran razonamiento simbolico compacto sin sobrecargar la latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 81,8% |

Condiciones de evaluacion: decodificacion greedy, una sola pasada, sin ejemplos, sin self-consistency. El autor advierte que la precision cae con la dificultad del problema, de forma mas acusada en los niveles comprimidos, y que al tratarse de una unica semilla las diferencias de un par de puntos porcentuales estan dentro del ruido (semi-anchura del 95% de ~2,7 puntos porcentuales en n=1317).

No se han publicado resultados de benchmarks comparativos con el modelo base u otros adaptadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B parametros en bf16 requiere aproximadamente 8-9 GB de VRAM; el adaptador LoRA anade ~0,1 GB adicionales. Con cuantizacion de 4 bits del modelo base, el requisito baja a ~2,5-3 GB.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA A100 de 80 GB. Para inferencia, cualquier GPU consumer con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente en bf16; con cuantizacion cabria en GPUs de 4-6 GB.
- Despliegue: el flujo principal es mediante `transformers` + `peft` (cargar el modelo base con `AutoModelForCausalLM` y aplicar `PeftModel.from_pretrained`). Tambien es compatible con vLLM si se registra el adaptador LoRA, y con llama.cpp u Ollama tras convertir el adaptador a formato GGUF.
- Latencia y throughput: no se proporcionan mediciones especificas en la informacion disponible. Al tratarse de un modelo de 4B con cadenas de razonamiento cortas (mediana de 90 caracteres), se espera una latencia menor que con el modelo base sin compresion, aunque no hay datos cuantitativos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ssurface/cot-dialect-qwen3-4b-instruct-sft-l3 (este) | 4B + LoRA r=16 | 1024 (entrenamiento) | 81,8% | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no especificado en la informacion disponible | no disponible | Apache 2.0 | HuggingFace |
| Otros adaptadores de la familia cot-compression-dialects (L1, L2, L4, L5) | 4B + LoRA | no especificado | no disponible | Apache 2.0 | HuggingFace (presumiblemente) |

No se dispone de datos de benchmarks del modelo base u otros adaptadores de la familia en la informacion proporcionada, por lo que la comparativa cuantitativa directa no es posible.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de palabras (GSM8K); no hay evidencia de rendimiento en otras tareas de razonamiento.
- La precision cae con la dificultad del problema, de forma mas rapida en los niveles comprimidos.
- Resultados basados en una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (semi-anchura del 95% de ~2,7 pp en n=1317).
- Solo entrenado en ingles; el uso en otros idiomas no esta validado.
- El adaptador no es autonomo: requiere cargar el modelo base Qwen3-4B-Instruct-2507 y el tokenizador correspondiente.
- El collator de busqueda de patrones del entrenamiento enmascaraba silenciosamente nada, lo que permitio que el prior de tool-calling del modelo base se filtrara en las cadenas; esto puede producir formatos de salida inesperados en algunos casos.
- La licencia Apache 2.0 del adaptador y del modelo base permite uso comercial, pero se recomienda verificar los terminos del modelo base y del dataset GSM8K (OpenAI) para uso en produccion.
- Sin garantias de rendimiento en produccion: no hay mediciones de latencia, throughput ni evaluaciones de robustez ante entradas adversariales.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base (pagina general): https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Informe tecnico de Qwen3 (HTML): https://arxiv.org/html/2505.09388v1
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
