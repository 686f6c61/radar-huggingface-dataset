# webmp3/Sakura-Micro-Bonsai-2-GSQ-RCO

## Resumen

Sakura Micro Bonsai 2 GSQ-RCO es una cuantización experimental de muy bajo bit derivada de Ternary Bonsai 2 27B de Prism ML, que a su vez parte de Qwen3.8-27B. El autor, webmp3, publica un único artefacto GGUF de 5,296 GiB que comprime un modelo de 26.895.998.464 parámetros hasta un tamaño apto para equipos de consumo, aplicando una asignación mixta de códecs basada en GSQ/RCO en lugar de un cuantizador uniforme por tensor.

La relevancia del modelo reside en su relación entre tamaño y funcionalidad retenida: frente a la referencia Ternary Bonsai 2 PTQ1 (5,538 GiB), reduce el artefacto un 4,37 % manteniendo cifras de razonamiento aritmético e instrucciones cercanas o superiores en subconjuntos pequeños de evaluación, aunque con pérdida en GSM8K y HumanEval. Es, por tanto, un modelo orientado a despliegue local en llama.cpp, no a cargas de producción de alta exigencia.

La información disponible es limitada: la model card no publica idiomas soportados, longitud de contexto, composición del dataset de entrenamiento ni detalles de la asignación por tensor. La ficha refleja únicamente los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B vía Ternary Bonsai 2 27B); detalles no disponibles |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ1_0 (ternario) para 394 de 851 tensores; el resto en tipos menores no especificados; asignación mixta GSQ/RCO |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); artefacto `Sakura-Micro-Bonsai-2-GSQ-RCO-TQ1_0-5.3GiB.gguf` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del linaje Qwen3.8-27B, pasado por la cuantización ternaria de Prism ML (Ternary Bonsai 2 27B) y posteriormente recomprimido por webmp3. No se trata de un entrenamiento nuevo ni de un ajuste fino: es una derivación por cuantización (`base_model_relation: quantized`). La model card no aporta datos sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna etapa de alineamiento del modelo original.

La innovación declarada es la asignación mixta de códecs basada en GSQ/RCO combinada con compresión adicional de bajo bit. El autor indica explícitamente que no divulga la selección por tensor, los detalles de asignación, la lógica interna de optimización ni los procedimientos de reproducción. El resultado es un GGUF de 5.686.593.888 bytes (5,296 GiB) con SHA-256 `5054d9b3b3b95145ebf1def33803fd93a1962dda37ca50bd53dbcbbbe4655eb3`, verificable mediante el archivo `SHA256SUMS` incluido. El nombre del fichero se cambió el 2026-10-09 para exponer el tipo de cuantización en el Hub, sin modificar el contenido.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`, etiqueta `conversational`).
- Razonamiento aritmético: 37/40 (92,5 %) en el subconjunto de Arithmetic reportado por el autor.
- Razonamiento matemático de tipo GSM8K: 35/40 (87,5 %) en el subconjunto evaluado.
- Generación de código: 15/20 (75,0 %) en HumanEval sobre 20 problemas.
- Seguimiento de instrucciones: 12/12 (100 %) en IFEval sobre 12 casos.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso tras una API compatible con el runtime de llama.cpp.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card incluye texto en inglés y chino simplificado, pero no declara idiomas soportados por el modelo.

## Casos de uso

- Prototipado local en portátiles y estaciones de trabajo sin GPU dedicada: con 5,296 GiB de pesos en TQ1_0, el modelo puede ejecutarse en llama.cpp sobre CPU con RAM suficiente, lo que permite validar flujos conversacionales antes de escalar a un modelo mayor.
- Asistentes de código en entornos con recursos limitados: su 75 % en HumanEval sobre 20 problemas lo hace utilizable para autocompletado y explicación de fragmentos en editores, aceptando que no sustituye a modelos de código especializados.
- Evaluación de técnicas de cuantización extrema: sirve como referencia práctica para investigadores que comparan GSQ/RCO frente a PTQ1 en términos de perplejidad (10,7251 frente a 10,2726 en WikiText-2) y de rendimiento en tareas concretas.
- Tareas de seguimiento de instrucciones con formato estricto: el 100 % en IFEval sobre 12 casos sugiere buen comportamiento en prompts con restricciones explícitas, útil para generación de JSON o plantillas en pipelines ligeros.
- Razonamiento aritmético en aplicaciones educativas o de cálculo asistido: el 92,5 % en Arithmetic permite integrarlo en herramientas de resolución de problemas numéricos simples con verificación posterior.
- Despliegue en dispositivos de borde o contenedores con presupuesto de disco ajustado: el artefacto de 5,3 GiB cabe en imágenes de contenedor pequeñas y en almacenamiento flash de capacidad moderada, con verificación de integridad mediante SHA-256.
- Experimentación con endpoints compatibles: la etiqueta `endpoints_compatible` facilita montar un servicio HTTP de generación de texto para pruebas de integración sin infraestructura GPU.

## Benchmarks y rendimiento

| Metrica | Ternary Bonsai 2 PTQ1 (referencia) | Sakura Micro Bonsai 2 GSQ-RCO |
|---|---:|---:|
| Tamano de fichero | 5,538 GiB | 5,296 GiB |
| WikiText-2 PPL | 10,2726 | 10,7251 |
| Arithmetic | 34/40 (85,0 %) | 37/40 (92,5 %) |
| GSM8K | 38/40 (95,0 %) | 35/40 (87,5 %) |
| HumanEval | 16/20 (80,0 %) | 15/20 (75,0 %) |
| IFEval | 9/12 (75,0 %) | 12/12 (100 %) |

El autor advierte que son mediciones sobre subconjuntos pequeños de benchmark y no una afirmación de superioridad general frente al modelo base. No se han publicado resultados de MMLU ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: al menos 5,3 GiB solo para los pesos; con overhead de contexto y buffers de llama.cpp, conviene disponer de 7-8 GiB de memoria unificada o RAM del sistema.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con 8 GiB o más de VRAM puede alojar los pesos, aunque no se documentan configuraciones probadas.
- Cabe en GPU de consumo: sí, por volumen de pesos (5,296 GiB) encaja en tarjetas de 8 GiB; no se confirma compatibilidad ni rendimiento específico con modelos concretos.
- Opciones de despliegue: llama.cpp es el runtime declarado; la etiqueta `endpoints_compatible` sugiere servidores compatibles con su API. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano del artefacto | Licencia | Notas |
|---|---:|---|---:|---|---|
| Sakura Micro Bonsai 2 GSQ-RCO | 26.895.998.464 | no disponible | 5,296 GiB | Apache-2.0 | Cuantización mixta GSQ/RCO sobre TQ1_0 |
| Ternary Bonsai 2 27B PTQ1 (prism-ml) | no disponible en la información | no disponible | 5,538 GiB | no disponible en la información | Referencia directa; mejor PPL y GSM8K, peor Arithmetic e IFEval |
| Qwen3.8-27B (Qwen) | 27B (según denominación) | no disponible | no disponible | no disponible en la información | Modelo base del linaje; sin datos de cuantización en esta ficha |

No se dispone de información suficiente para comparar con alternativas de otros autores en la misma categoría de cuantización extrema (por ejemplo, variantes GGUF de Qwen3 de terceros), por lo que la comparativa se limita al linaje declarado.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como `experimental` y liberación de bajo bit; no está pensado como sustituto directo del modelo base en producción crítica.
- Pérdida medible de calidad: la perplejidad en WikiText-2 empeora de 10,2726 a 10,7251 y GSM8K cae de 95,0 % a 87,5 % y HumanEval de 80,0 % a 75,0 % frente a la referencia PTQ1.
- Benchmarks con muestras muy pequeñas (12 a 40 ítems): las diferencias observadas, incluidas las mejoras en Arithmetic e IFEval, tienen alta varianza y no deben interpretarse como superioridad general.
- Falta de transparencia en el método: el autor no revela la asignación por tensor ni la lógica de optimización, lo que impide auditar la reproducibilidad de la cuantización.
- Idiomas y contexto no declarados: no se puede garantizar comportamiento multilingüe ni ventanas de contexto largas sin verificación empírica.
- Riesgo de alucinación: inherente a los modelos de lenguaje y potencialmente amplificado por la compresión agresiva; requiere validación de salidas en aplicaciones factuales.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base (Ternary Bonsai 2 27B y Qwen3.8-27B), cuyas licencias no se detallan en esta ficha.
- Dependencia del runtime de llama.cpp y de la versión que soporte el tipo TQ1_0; versiones antiguas pueden no cargar el GGUF correctamente.

## Enlaces

- [Hugging Face: webmp3/Sakura-Micro-Bonsai-2-GSQ-RCO](https://huggingface.co/webmp3/Sakura-Micro-Bonsai-2-GSQ-RCO)
- [Modelo base: prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)
- [Modelo base del linaje: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio llama.cpp](https://github.com/ggml-org/llama.cpp)
