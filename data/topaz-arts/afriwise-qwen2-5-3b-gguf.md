# Topaz-arts/AfriWise-Qwen2.5-3B-GGUF

## Resumen

AfriWise-Qwen2.5-3B-GGUF es un modelo de lenguaje de 3.09 mil millones de parámetros, desarrollado por Topaz-arts, que parte del modelo base Qwen/Qwen2.5-3B-Instruct y se ha ajustado específicamente sobre corpus lingüísticos del sur de Nigeria, incluyendo igbo, efik-ibibio y edo/bini, junto con inglés. El objetivo es ofrecer un modelo culturalmente contextualizado y capaz de comprender y generar texto en estas lenguas africanas, que tradicionalmente tienen poca representación en los modelos de lenguaje comerciales.

El modelo se distribuye en formato GGUF cuantizado a Q4_K_M, con un tamaño de 1.92 GB, lo que permite su ejecución en hardware de consumo. La ventana de contexto es de 4.096 tokens, inferior a la del Qwen2.5 original, pero suficiente para tareas de generación de texto y razonamiento cultural. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que lo convierte en una opción atractiva para desarrolladores que trabajan con lenguas nigerianas.

La relevancia de este modelo radica en la escasez de recursos de PLN para lenguas africanas de baja representación. Al especializar un modelo base sólido como Qwen2.5-3B en estas lenguas, se facilita la construcción de aplicaciones locales (atención al cliente, educación, traducción) sin depender de APIs externas ni de modelos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.09 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | ingles, igbo, efik-ibibio, edo/bini |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only denso con atención causal estándar. Qwen2.5 fue preentrenado por Alibaba sobre un corpus de hasta 18 billones de tokens, con un enfoque multilingüe y capacidades de instrucción. AfriWise toma la variante de 3B instruct y la ajusta mediante fine-tuning supervisado sobre 28.928 muestras equilibradas de corpus paralelos y de razonamiento cultural en igbo, efik-ibibio, edo/bini e inglés.

No se han publicado detalles sobre el uso de RLHF o DPO en este ajuste. El entrenamiento se centra en la alineación cultural y lingüística, con muestras diseñadas para capturar matices contextuales propios de las lenguas del sur de Nigeria. La cuantización Q4_K_M reduce el tamaño del modelo a 1.92 GB, manteniendo un equilibrio razonable entre calidad y eficiencia para inferencia en CPU o GPU de baja capacidad.

## Capacidades

- Generación de texto en inglés y en las lenguas nigerianas igbo, efik-ibibio y edo/bini.
- Razonamiento cultural y contextual: el ajuste con muestras de razonamiento cultural permite respuestas que tienen en cuenta normas, refranes y estructuras sociales del sur de Nigeria.
- Comprensión de instrucciones: al derivar de Qwen2.5-Instruct, sigue instrucciones en formato conversacional.
- Soporte multilingüe limitado a los cuatro idiomas mencionados; no se garantiza buen rendimiento en otras lenguas africanas.
- No se ha confirmado soporte explícito para tool calling, function calling o modo agente en la documentación disponible.
- No incluye capacidades de visión ni audio; es exclusivamente un modelo de texto.

## Casos de uso

- Atención al cliente en lenguas nigerianas: el modelo puede gestionar conversaciones multi-turno en igbo, efik o edo, permitiendo a empresas locales ofrecer soporte en la lengua materna de sus usuarios sin depender de traductores humanos.
- Traducción asistida entre inglés y las lenguas del sur de Nigeria: útil para traducir documentos, avisos gubernamentales o contenido educativo, aunque la calidad debe validarse con hablantes nativos.
- Generación de contenido cultural y educativo: creación de cuentos, materiales didácticos o guiones que respeten las tradiciones y expresiones idiomáticas de las comunidades igbo, efik y edo.
- Asistente virtual para ONG y organizaciones comunitarias: responder preguntas sobre salud, derechos o servicios en lenguas locales, mejorando el acceso a información en zonas rurales.
- Desarrollo de aplicaciones de transcripción y resumen de conversaciones en lenguas nigerianas, por ejemplo para archivos de radio o reuniones comunitarias.
- Investigación en PLN africano: sirve como punto de partida para experimentos de fine-tuning adicional o evaluación comparativa de modelos multilingües en lenguas de baja representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni evaluaciones específicas para lenguas nigerianas. Se recomienda realizar una evaluación propia con datos reales antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa 1.92 GB. Con overhead de inferencia, se recomienda al menos 4 GB de VRAM para GPU.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como T4 o A10.
- Compatible con CPU: puede ejecutarse en CPU con 8 GB de RAM, aunque la latencia será mayor.
- Opciones de despliegue: Ollama (instrucciones incluidas en la model card), llama.cpp, LM Studio, o cualquier runtime que soporte GGUF.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna (RTX 4090), se espera una velocidad de generación de 50-100 tokens por segundo; en CPU, 5-15 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriWise-Qwen2.5-3B-GGUF | 3.09B | 4.096 | en, ig, efi, bin | Apache 2.0 | GGUF en HF |
| Qwen2.5-3B-Instruct | 3.09B | 32.768 (hasta 128K con YaRN) | Multilingue (principalmente en, zh, etc.) | Apache 2.0 | Safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3.2B | 128K | Multilingue (en, de, fr, it, pt, hi, es, th) | Llama 3.2 Community License | Safetensors, GGUF |
| Phi-3-mini-4k-instruct | 3.8B | 4K | Multilingue limitado | MIT | Safetensors, GGUF |

AfriWise se diferencia por su especialización en lenguas nigerianas, mientras que los otros modelos ofrecen cobertura multilingüe más amplia pero sin soporte específico para igbo, efik o edo. El contexto de 4K es significativamente menor que el de Qwen2.5-3B original (32K) y que el de Llama-3.2-3B (128K), lo que limita su uso en tareas que requieren documentos largos.

## Limitaciones y advertencias

- Contexto limitado a 4.096 tokens: no es adecuado para procesar documentos extensos o mantener conversaciones muy largas sin truncamiento.
- Cobertura lingüística restringida: solo cubre cuatro idiomas; el rendimiento en otras lenguas africanas o dialectos no está garantizado.
- Sin benchmarks publicados: se desconoce su calidad objetiva en tareas estándar o en las lenguas objetivo. Es imprescindible validar manualmente antes de un despliegue en producción.
- Riesgo de alucinación: al ser un modelo de 3B, puede generar respuestas plausibles pero incorrectas, especialmente en temas técnicos o fuera de su corpus de entrenamiento.
- Sesgos potenciales: el corpus de entrenamiento (28.928 muestras) es pequeño y puede reflejar sesgos regionales o demográficos del sur de Nigeria. No se han realizado auditorías de sesgo.
- Dependencia del modelo base: hereda las limitaciones de Qwen2.5-3B-Instruct, incluyendo posibles debilidades en razonamiento complejo o matemáticas avanzadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte oficial.

## Enlaces

- [HuggingFace: Topaz-arts/AfriWise-Qwen2.5-3B-GGUF](https://huggingface.co/Topaz-arts/AfriWise-Qwen2.5-3B-GGUF)
- [Modelo base: Qwen/Qwen2.5-3B](https://huggingface.co/Qwen/Qwen2.5-3B)
- [Colección Qwen2.5](https://huggingface.co/collections/Qwen/qwen25)
- [Documentación de Qwen](https://qwen.readthedocs.io/en/latest/)
