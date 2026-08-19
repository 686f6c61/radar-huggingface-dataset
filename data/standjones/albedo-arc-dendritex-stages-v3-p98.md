# standjones/albedo-arc-dendritex-stages-v3-p98

## Resumen

El modelo `standjones/albedo-arc-dendritex-stages-v3-p98` es una publicación del usuario standjones en Hugging Face que contiene los pesos de **Qwen3.6-35B-A3B**, un modelo de lenguaje causal con encoder de visión desarrollado por Alibaba Cloud. Aunque el nombre del repositorio sugiere un checkpoint intermedio de un pipeline propio, la model card indica que se trata exactamente de la arquitectura Qwen3.6-35B-A3B, la primera variante open-weight de la serie Qwen3.6, publicada tras la serie Qwen3.5. El modelo está diseñado para tareas de razonamiento, codificación agéntica y comprensión de imágenes, con un enfoque en estabilidad y utilidad práctica para desarrolladores.

Con 35 mil millones de parámetros totales y solo 3 mil millones activos gracias a su arquitectura de mezcla de expertos (MoE), ofrece un equilibrio entre capacidad y eficiencia computacional. Su contexto nativo de 262.144 tokens, extensible hasta 1.010.000, lo hace especialmente adecuado para tareas que requieren ventanas largas, como razonamiento sobre repositorios de código o conversaciones multi-turno complejas. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que aumenta su atractivo para entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; combinacion de Gated DeltaNet (atencion lineal) y Gated Attention (atencion clasica); Mixture of Experts |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no especificado (familia Qwen, presumiblemente multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention), organizadas en un patrón repetitivo: 10 bloques, cada uno compuesto por 3 sub-bloques de (Gated DeltaNet → MoE) seguidos de 1 sub-bloque de (Gated Attention → MoE). El componente MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido por token, con una dimensión intermedia de 512. La dimensión oculta es 2048 y el embedding de tokens tiene un tamaño de 248.320 (con padding). El modelo incluye un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos, lo que mejora la eficiencia en la generación.

No se proporcionan detalles específicos sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO). La model card indica que el modelo pasó por etapas de pre-entrenamiento y post-entrenamiento, pero no se ofrecen cifras concretas. La innovación principal radica en la combinación de atención lineal y MoE, que reduce el coste computacional manteniendo una alta capacidad, y en la preservación del contexto de razonamiento histórico, una característica nueva denominada "Thinking Preservation".

## Capacidades

- **Razonamiento y codificacion agéntica**: el modelo destaca en tareas de codificación a nivel de repositorio y flujos de trabajo frontend, con una puntuación de 73.4 en SWE-bench Verified.
- **Comprensión de imágenes**: al ser un modelo image-text-to-text, puede procesar entradas visuales junto con texto, lo que permite tareas de visión-lenguaje como respuesta a preguntas sobre imágenes o generación de descripciones.
- **Preservación del contexto de razonamiento**: una opción para retener el contexto de razonamiento de mensajes históricos, lo que agiliza el desarrollo iterativo y reduce la sobrecarga en conversaciones largas.
- **Ventana de contexto extensa**: soporta hasta 262.144 tokens de forma nativa, extensible a más de un millón, ideal para documentos extensos o repositorios de código completos.
- **Soporte de herramientas y agentes**: aunque no se menciona explícitamente tool calling, su rendimiento en benchmarks de codificación agéntica sugiere capacidad para integrarse en flujos de agentes.
- **Multilingüismo**: aunque no se especifican idiomas concretos, la familia Qwen es conocida por su soporte multilingüe, incluyendo inglés, chino y otros idiomas principales.

## Casos de uso

- **Asistente de programación en repositorios**: el modelo puede analizar un repositorio completo, entender la estructura del código y sugerir cambios o implementar funciones nuevas, gracias a su ventana de contexto larga y su rendimiento en SWE-bench.
- **Desarrollo de interfaces frontend**: su capacidad para manejar flujos de trabajo frontend permite generar componentes de UI, estilos y lógica de interacción a partir de descripciones en lenguaje natural o capturas de pantalla.
- **Agente de automatización de terminal**: con resultados en Terminal-Bench 2.0 (aunque no se muestran los valores completos), puede ejecutar comandos, interpretar salidas y realizar tareas administrativas en entornos de línea de comandos.
- **Análisis de documentos extensos**: su contexto de hasta 1 millón de tokens permite resumir, extraer información o responder preguntas sobre libros completos, informes anuales o bases de conocimiento.
- **Asistente de visión-lenguaje**: al aceptar imágenes, puede describir diagramas, capturas de pantalla o fotografías, y responder preguntas sobre su contenido, útil para soporte técnico o documentación.
- **Generación de código con razonamiento**: el modo de preservación del razonamiento permite mantener el hilo de pensamiento en conversaciones de programación, facilitando iteraciones sobre el mismo problema sin perder contexto.

## Benchmarks y rendimiento

La model card incluye resultados comparativos en benchmarks de codificación agéntica. Se presentan los datos disponibles:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | **73.4** |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | **67.2** |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | **49.5** |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un MoE con 35B parámetros totales, la memoria necesaria depende de la cuantización. En FP16 se requieren aproximadamente 70 GB; en 8-bit, unos 35 GB; en 4-bit, unos 18 GB.
- **GPU recomendadas**: para FP16, GPUs como A100 80GB, H100 o 2x RTX 4090 (con tensor parallelism) son adecuadas. Con cuantización 4-bit, una RTX 4090 de 24 GB podría ser suficiente.
- **Compatibilidad con consumer GPUs**: solo es viable con cuantización agresiva (4-bit o inferior) en GPUs de gama alta como RTX 4090 o RTX 3090.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card. También se puede usar con llama.cpp si se convierten los pesos a GGUF.
- **Latencia y throughput**: no se proporcionan datos concretos. Al tener solo 3B parámetros activos, la latencia por token debería ser significativamente menor que la de un modelo denso de 35B, pero depende del hardware y la implementación.

## Comparativa con modelos similares

El modelo compite directamente con otros MoE de tamaño similar, como Qwen3.5-35B-A3B y Gemma4-26B-A4B, así como con modelos densos más pequeños como Qwen3.5-27B. La siguiente tabla resume las diferencias clave:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K (ext. 1M) | Apache 2.0 | 73.4 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | Apache 2.0 | 70.0 |
| Gemma4-26B-A4B | 26B | 4B | no disponible | Gemma license | 17.4 |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | Apache 2.0 | 75.0 |

Qwen3.6-35B-A3B supera a su predecesor Qwen3.5-35B-A3B en SWE-bench Verified y Multilingual, aunque es ligeramente inferior en SWE-bench Pro. Comparado con Gemma4-26B-A4B, la ventaja es notable. El modelo denso Qwen3.5-27B obtiene mejores resultados en Verified y Pro, pero requiere muchos más recursos computacionales al activar todos sus parámetros.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han publicado evaluaciones específicas de sesgos o toxicidad para este modelo. Como cualquier LLM, puede generar contenido incorrecto o inventado, especialmente en dominios poco representados.
- **Riesgo de alucinación en código**: aunque rinde bien en benchmarks, puede producir código con errores sutiles o vulnerabilidades de seguridad; se recomienda revisión humana en entornos de producción.
- **Idiomas no especificados**: no se ha confirmado oficialmente qué idiomas soporta, lo que limita la confianza para aplicaciones multilingües críticas.
- **Requisitos de hardware**: a pesar de tener solo 3B parámetros activos, los 35B totales requieren una memoria considerable, lo que puede ser una barrera para despliegues en infraestructura modesta.
- **Origen del repositorio**: al ser publicado por un usuario independiente (standjones) y no por Alibaba Cloud directamente, no se puede garantizar que los pesos sean idénticos a los oficiales ni que no hayan sido modificados. Se recomienda verificar la integridad antes de usar en producción.
- **Licencia**: aunque es Apache 2.0, la model card hace referencia a la licencia de Qwen3.6-35B-A3B; es aconsejable revisar los términos completos para usos comerciales específicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/standjones/albedo-arc-dendritex-stages-v3-p98
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Repositorio de datasets del autor: https://huggingface.co/standjones/datasets
