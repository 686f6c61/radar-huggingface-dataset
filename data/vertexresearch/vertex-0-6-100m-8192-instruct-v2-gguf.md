# VertexResearch/Vertex-0.6-100M-8192-Instruct-v2-GGUF

## Resumen

Vertex 0.6 100M 8192 Instruct v2 es un modelo de lenguaje de muy pequeño tamaño (96.752.192 parámetros, con embeddings atados) desarrollado por VertexResearch. Se trata de un transformer basado en la arquitectura Qwen3, ajustado para instrucciones y conversación, con una ventana de contexto de 8192 tokens y un formato de chat ChatML. Esta ficha corresponde concretamente a la conversión a GGUF del modelo base, pensada para su ejecución con llama.cpp.

El modelo resuelve el nicho de la experimentación y el despliegue en entornos con recursos extremadamente limitados: con menos de 100 millones de parámetros, cabe en cualquier dispositivo y permite probar pipelines de chat y de tool calling sin infraestructura de GPU. Su relevancia es, por tanto, didáctica y de prototipado, no de producción: el propio autor advierte de que no es coherente todavía y de que requiere más ajuste.

La versión GGUF incluye pesos en BF16 y F16, además de un espectro amplio de cuantizaciones (Q8_0, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_M, Q3_K_S y Q2_K). Al ser un modelo tan pequeño, la cuantización apenas aporta ganancias de velocidad y su utilidad principal es reducir el espacio en disco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 |
| Parámetros totales | 96.752.192 (embeddings atados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (RoPE theta 1M) |
| Tipos de cuantización | BF16, F16, Q8_0, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer de Qwen3, con embeddings atados (tied embeddings), lo que explica que el recuento de parámetros totales coincida con el de la matriz de entrada y salida. Utiliza RoPE con theta de 1 millón para sostener la ventana de contexto de 8192 tokens, y emplea el formato de chat ChatML con los tokens especiales `<|im_start|>` y `<|im_end|>`. Los tokens de fin de secuencia configurados son `</s>` (id 2) y `<|im_end|>` (id 6).

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor sí indica que se trata de un ajuste de instrucciones y que el corte de conocimiento se sitúa aproximadamente en abril de 2024. El soporte de tool calling se implementa mediante bloques JSON delimitados por `<tool_call>`, con las definiciones de funciones incluidas en el system prompt.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con formato ChatML.
- Ajuste para instrucciones (instruct) y uso como asistente conversacional.
- Tool calling / function calling mecánico: genera bloques `<tool_call>` con JSON válido y se detiene de forma limpia.
- Soporte de definición de funciones mediante system prompt.
- Capacidad limitada de razonamiento de varios pasos (poco fiable, según el autor).
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- Multilingüismo: únicamente inglés declarado.

## Casos de uso

- Pruebas de integración con llama.cpp: sirve para validar pipelines de `llama-server` y `llama-completion` con un modelo de menos de 100 M de parámetros antes de pasar a modelos mayores, gracias a su reducido tamaño y a la disponibilidad de pesos F16 y BF16.
- Prototipado de agentes con tool calling: permite verificar el parseo de bloques `<tool_call>` y el flujo de definición de funciones en el system prompt, aunque solo con una función disponible y sin bucles autónomos.
- Desarrollo y test de interfaces de chat: al usar ChatML estándar, es útil para comprobar el renderizado de turnos, tokens especiales y terminación de secuencia en aplicaciones de chat.
- Docencia y experimentación académica: su tamaño permite ejecutarlo y examinarlo en portátiles o entornos sin GPU, lo que facilita demostraciones de tokenización, cuantización y generación autoregresiva.
- Evaluación de pipelines de cuantización: la disponibilidad de doce variantes GGUF permite comparar el efecto de Q2_K a F16 sobre la coherencia en un modelo pequeño, con fines de investigación metodológica.
- Pruebas de estrés de contexto: con 8192 tokens de ventana y RoPE theta 1M, sirve para validar el comportamiento de decodificación en contextos largos, aun a sabiendas de que la coherencia se degrada.
- Despliegue en dispositivos embebidos o de bajo consumo: al caber en pocos cientos de MB en Q4_K_M, puede probarse en entornos con memoria muy restringida para tareas de generación trivial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; en F16 ocupa aproximadamente 0,2 GB de pesos más el espacio del contexto KV, y en Q4_K_M alrededor de 0,06-0,1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100. Funciona en GTX 1050, RTX 3050, RTX 4090 o superiores sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-completion`), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio; el repo está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. El autor señala que la cuantización apenas mejora la velocidad en un modelo de este tamaño, por lo que la ganancia es principalmente de disco.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vertex 0.6 100M 8192 Instruct v2 (GGUF) | 96,75 M | 8192 | Apache 2.0 | Hugging Face, GGUF | Inglés, tool calling básico, no apto para producción |
| Qwen3 (familia base) | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia del modelo; no se dispone de datos concretos en la información proporcionada |
| Alternativas de ~100 M parámetros | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación consultada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Coherencia limitada: el autor advierte de divagación, repetición y respuestas inconsistentes, especialmente en generaciones largas.
- Baja precisión factual y razonamiento superficial; comete errores aritméticos.
- Tool calling poco fiable en varios pasos: con más de una función disponible puede elegir la herramienta equivocada y alucinar detalles al resumir la respuesta de una herramienta. No debe usarse en bucles de agente sin supervisión.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Corte de conocimiento aproximado en abril de 2024.
- No apto para producción, según el propio autor.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones técnicas hacen desaconsejable su empleo en entornos productivos.
- Riesgo de alucinación elevado por el tamaño reducido del modelo.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct-v2-GGUF
- Modelo base: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct-v2
- llama.cpp (repositorio de referencia para GGUF): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
