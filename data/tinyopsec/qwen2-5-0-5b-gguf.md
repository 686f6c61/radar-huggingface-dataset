# tinyopsec/Qwen2.5-0.5B-GGUF

## Resumen
`tinyopsec/Qwen2.5-0.5B-GGUF` es una colección de cuantizaciones GGUF del modelo base Qwen2.5-0.5B, publicada por el usuario tinyopsec. El modelo original lo desarrolla el equipo Qwen de Alibaba y esta versión se ha generado con llama.cpp a partir del checkpoint `unsloth/Qwen2.5-0.5B`. Se trata de un transformer decoder-only denso de 494 millones de parámetros, pensado para generación de texto en entornos con recursos muy limitados.

La relevancia de esta ficha está en que permite ejecutar un modelo de la familia Qwen2.5 en CPU, GPUs de gama baja o dispositivos embebidos, con 13 variantes de cuantización que van desde F16 hasta Q2_K. Al estar publicado con licencia Apache-2.0, se puede usar en proyectos comerciales y de investigación sin restricciones adicionales. Es importante tener en cuenta que se distribuye el modelo base, no la variante instruct, por lo que no está alineado para diálogo ni para seguir instrucciones de forma nativa.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parámetros totales | 494.032.768 (494M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens según la documentación de Qwen2.5; no indicado en la model card |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Multilingüe (29 idiomas según la documentación de Qwen2.5); no confirmado específicamente para esta cuantización |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo base Qwen2.5-0.5B es un transformer decoder-only denso de la familia Qwen2.5. Según la documentación del proyecto, la familia Qwen2.5 se entrenó con hasta 18T tokens e incorpora mejoras en conocimiento, código y matemáticas respecto a Qwen2. Esta publicación no entrena ningún modelo nuevo: parte del checkpoint `unsloth/Qwen2.5-0.5B` y genera cuantizaciones GGUF con llama.cpp. Al ser un modelo base, no ha pasado por fases de RLHF ni DPO, y no incluye alineamiento para instrucciones.

La model card no documenta detalles adicionales sobre la composición del dataset, el tokenizador o innovaciones arquitectónicas específicas. El repositorio ocupa 5,8 GB en total porque incluye todas las variantes de cuantización, pero cada archivo GGUF se carga de forma independiente. La cuantización Q4_K_M se marca como recomendada por el autor.

## Capacidades
- Generación de texto autoregresiva: completado de frases, generación de párrafos y continuación de documentos.
- Conocimiento general y razonamiento básico, limitado por el tamaño de 0,5B parámetros.
- Capacidades de código y matemáticas mejoradas respecto a Qwen2, según la documentación de Qwen2.5, aunque con el techo propio de un modelo pequeño.
- Soporte multilingüe: la familia Qwen2.5 declara 29 idiomas; el rendimiento real en cada idioma no se ha evaluado en esta cuantización.
- No incluye tool calling ni function calling nativo, ya que se distribuye el modelo base y no una variante instruct.
- No incorpora modo thinking, visión, audio ni capacidades multimodales.
- Puede utilizarse como punto de partida para fine-tuning con LoRA o QLoRA en tareas concretas.

## Casos de uso
- Prototipado local y pruebas de concepto: al ocupar alrededor de 1 GB en F16 y menos de 0,5 GB en cuantizaciones de 4 bits, se puede ejecutar en portátiles sin GPU dedicada para validar prompts y flujos de generación.
- Generación de texto en dispositivos embebidos: su tamaño permite integrarlo en Raspberry Pi o sistemas con CPU ARM mediante llama.cpp para completar frases, resumir textos cortos o generar plantillas.
- Fine-tuning para dominios específicos: al ser un modelo base con licencia Apache-2.0, se puede ajustar con LoRA/QLoRA para clasificación, extracción de entidades o generación de informes en un dominio concreto.
- Aumento de datos sintéticos: generar textos diversos para entrenar clasificadores o modelos más pequeños, controlando el coste computacional y la diversidad mediante temperatura y top-p.
- Experimentación multilingüe: probar tokenización y comportamiento en distintos idiomas antes de escalar a modelos mayores de la familia Qwen2.5, con la ventaja de un coste de inferencia muy bajo.
- Educación e investigación: estudiar el efecto de la cuantización en la calidad de las representaciones y en la perplejidad con recursos limitados, comparando las distintas variantes GGUF.
- Completado de código local: integrarlo en editores o scripts para sugerencias sin depender de la nube, siempre que se valide la calidad y se acepte que no es un modelo instruct.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se proporcionan evaluaciones de perplejidad para las distintas cuantizaciones.

## Requisitos de hardware
- VRAM estimada: alrededor de 1,0 GB en F16 según la model card; el resto de cuantizaciones no incluyen tamaño exacto, aunque por el número de bits se sitúan aproximadamente entre 0,2 y 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100, H100 ni RTX 4090. Funciona en GPUs de gama baja, integradas y en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU. También es viable en dispositivos con poca memoria si se usa Q4_K_M o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware, del número de hilos y de la cuantización elegida. El contexto de 32K añade memoria para el KV cache, no cuantificada en las cifras anteriores.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tinyopsec/Qwen2.5-0.5B-GGUF` (este) | 494M | 32K | No disponible | Apache-2.0 | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct-GGUF` | 494M | 32K | No disponible | Apache-2.0 | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | 1.500M | 32K | No disponible | Apache-2.0 | Hugging Face |

La diferencia principal frente a la variante instruct es el alineamiento: este repositorio contiene el modelo base, mientras que `Qwen2.5-0.5B-Instruct-GGUF` está ajustado para seguir instrucciones y mantener diálogos. Frente a Qwen2.5-1.5B, este modelo es más pequeño y ligero, pero también menos capaz. No se dispone de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias
- Es un modelo base, no instruct: no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno sin un ajuste o un formato de prompt específico.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar información falsa o incoherente, especialmente en tareas de razonamiento complejo.
- Limitación de tamaño: con 494M parámetros, su conocimiento factual y su capacidad de razonamiento son limitados en comparación con modelos de 7B o superiores.
- Contexto largo: aunque se declaran 32K tokens, el rendimiento efectivo en contextos muy largos no está evaluado y puede degradarse.
- Cuantización: las variantes de 2 y 3 bits pueden perder calidad respecto a F16; se recomienda validar la cuantización elegida en la tarea concreta.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y verificar las condiciones del modelo base.
- Sin alineamiento de seguridad: al ser un modelo base, no incorpora filtros ni salvaguardas para contenido sensible.
- Multilingüe no verificado: los 29 idiomas se atribuyen a la familia Qwen2.5, pero no hay evaluación específica para esta cuantización.

## Enlaces
- [Hugging Face: tinyopsec/Qwen2.5-0.5B-GGUF](https://huggingface.co/tinyopsec/Qwen2.5-0.5B-GGUF)
- [Modelo base: Qwen/Qwen2.5-0.5B](https://huggingface.co/Qwen/Qwen2.5-0.5B)
- [Variante instruct GGUF: Qwen/Qwen2.5-0.5B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF)
- [Checkpoint de origen: unsloth/Qwen2.5-0.5B](https://huggingface.co/unsloth/Qwen2.5-0.5B)
- [Repositorio GitHub de la familia Qwen2.5](https://github.com/mx4ai/qwen2.5)
- [ModelScope: Qwen2.5-0.5B-Instruct-GGUF](https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct-GGUF)
- [Artículo sobre Qwen2.5-0.5B-Instruct-GGUF](https://dev.co/ai/llms/qwen2-5-0-5b-instruct-gguf)
