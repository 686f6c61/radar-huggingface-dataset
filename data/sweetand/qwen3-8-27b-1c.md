# sweetand/qwen3.8-27b-1C

## Resumen

Qwen3.8-27B-1C es una adaptación por supervisión fina (SFT) del modelo base Qwen/Qwen3.8-27B, publicada por el usuario sweetand en Hugging Face. Su propósito es especializar el modelo en el desarrollo sobre la plataforma 1C:Enterprise, cubriendo el lenguaje BSL, la estructura de volcados BSL+XML, los esquemas XML de configuración y las prácticas habituales de las configuraciones 1C. El modelo se distribuye con pesos completos en safetensors y también en formato GGUF, además de un adaptador LoRA independiente (adapter_model.safetensors) para quienes quieran convertirlo a nvfp4 o servirlo en vLLM, Strata u otros motores.

El modelo cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones) y hereda la ventana de contexto nativa de Qwen3.8, que según la model card del autor llega hasta 262K tokens. Los idiomas declarados son ruso (principal) e inglés. La licencia es Apache-2.0, tanto para la base como para la derivada, con la advertencia de respetar las licencias de las bases de código abierto de 1C incluidas en el conjunto de entrenamiento.

Su relevancia actual radica en que cubre un nicho muy específico y poco atendido por los modelos generalistas: el asistente de desarrollo para el ecosistema 1C, con decenas de miles de descargas en pocos meses. No obstante, la información pública disponible es limitada: no se detallan hiperparámetros de entrenamiento, número de tokens de SFT ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | Hasta 262K tokens (heredada de Qwen3.8, según la model card) |
| Tipos de cuantizacion | GGUF publicado en el repo; el autor menciona conversión a nvfp4; no se detallan más variantes |
| Idiomas soportados | Ruso (principal), inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (modelo completo), GGUF, adaptador LoRA en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, un transformer decoder-only de aproximadamente 27,3 mil millones de parámetros. La adaptación se realizó mediante Supervised Fine-Tuning (SFT) sobre el modelo base, y el autor publica además el adaptador LoRA resultante, lo que permite aplicar la especialización sobre los pesos originales sin necesidad de usar el checkpoint completo.

El conjunto de datos de SFT se compone de datasets instruccionales y de chat con contextos largos (formato user → assistant), orientados a tareas reales de desarrollo y no a conversación general. Los temas cubiertos incluyen: comprensión de la estructura de proyectos BSL+XML, estándares de desarrollo de la plataforma 1C:Enterprise, particularidades de los esquemas XML de los ficheros de configuración, lectura y modificación de bases de código abierto de 1C, datasets de nombrado significativo de procedimientos, funciones, parámetros, variables y entidades de dominio (enseñando a nombrar por rol, efecto, resultado y dominio en lugar de forma arbitraria) y datasets de comprensión del lenguaje de consultas de 1C. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al SFT; estos datos deben considerarse no disponibles.

Como innovaciones técnicas destacables, el modelo hereda del base los modos thinking/non-thinking y el soporte de tool calling, además de parámetros de muestreo recomendados por el autor para código preciso (temperature=0.6, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.3, effort=medium).

## Capacidades

- Generación y refactorización de código BSL siguiendo el estilo y los estándares de codificación de 1C.
- Navegación y localización de objetos y módulos dentro de volcados XML de configuración de 1C.
- Explicación de mecanismos típicos de la plataforma 1C:Enterprise y de configuraciones existentes.
- Asistencia en code review y análisis de código BSL ajeno.
- Comprensión del lenguaje de consultas de 1C.
- Nombrado significativo de procedimientos, funciones, parámetros, variables y entidades de dominio.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado de la base.
- Modos thinking y non-thinking, y tool calling / function calling, heredados de Qwen3.8.
- Capacidades multilingües limitadas a ruso e inglés según la model card.

## Casos de uso

- Asistente de desarrollo 1C en el IDE: el modelo puede responder preguntas sobre dónde se ubica un módulo de objeto de catálogo dentro de un volcado XML, aprovechando su contexto largo para procesar fragmentos extensos de la exportación.
- Generación de código BSL en producción: genera y refactoriza procedimientos respetando los estándares internos de codificación de 1C, integrándose en pipelines de revisión previa a la ejecución en el configurador.
- Revisión de código (code review) automatizada: analiza módulos BSL ajenos, explica su comportamiento y señala desviaciones respecto a las prácticas típicas de la plataforma.
- Migración y comprensión de bases de código abierto de 1C: lee, explica y propone mejoras sobre patrones extraídos de repositorios públicos del ecosistema 1C.
- Formación y onboarding de desarrolladores junior: explica mecanismos de la plataforma y de las configuraciones con ejemplos contextualizados en ruso, el idioma principal de entrenamiento.
- Construcción de consultas 1C: ayuda a redactar y entender consultas sobre el modelo de datos de la plataforma, gracias a los datasets específicos de lenguaje de consultas incluidos en el SFT.
- Estandarización de nomenclatura: propone nombres de procedimientos, variables y entidades de dominio coherentes con su rol y efecto, reduciendo la arbitrariedad en bases de código grandes.
- Asistente conversacional multi-turno con contexto largo: útil para sesiones de depuración sobre volcados completos de configuración, siempre que el hardware soporte ventanas de 128K o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27,3 mil millones de parámetros), en FP16 se requerirían del orden de 55 GB solo para pesos; en cuantizaciones de 8 bits, unos 28 GB; en 4 bits, unos 15-16 GB, sin contar caché KV ni overhead. Estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar A100 80 GB o H100 para FP16 con contexto largo; GPUs de 24 GB (RTX 4090) solo con cuantización agresiva y contextos moderados.
- ¿Cabe en GPU de consumo? Posiblemente en RTX 4090/3090 con cuantización de 4-8 bits y ventanas de contexto reducidas; no confirmado por el autor.
- Opciones de despliegue: el autor menciona vLLM, Strata y conversión a nvfp4; el repo incluye GGUF, por lo que llama.cpp y Ollama son viables tras el merge del adaptador. También se indica compatibilidad con endpoints OpenAI (tag endpoints_compatible). Para el adaptador LoRA es necesario fusionarlo antes de exportar a GGUF o servir en la mayoría de motores.
- Latencia y throughput: no disponibles. El autor advierte que el contexto largo (128K+) depende fuertemente del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.8-27B-1C | 27,3B | Hasta 262K (heredado) | ru, en | Apache-2.0 | SFT para 1C:Enterprise / BSL |
| Qwen/Qwen3.8-27B (base) | 27,3B (según este repo) | Hasta 262K | No disponible en la información | Apache-2.0 | Modelo generalista |
| Alternativas especializadas en 1C | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos especializados en 1C:Enterprise con los que comparar parámetros, contexto o rendimiento. La comparación con el modelo base es la única viable con los datos proporcionados, y en ella la diferencia principal es la especialización en dominio frente a capacidades generales.

## Limitaciones y advertencias

- Riesgo de alucinación de nombres de objetos de metadatos, rutas XML y APIs "típicas"; el autor recomienda verificar siempre en el configurador o mediante tests (incluido Vanessa) antes de producción.
- El comportamiento fuera del dominio de 1C puede ser más débil o inestable que el del modelo base.
- El contexto largo (128K+) depende fuertemente del hardware y puede degradarse en máquinas modestas.
- Idiomas limitados a ruso e inglés; no se declara soporte de castellano.
- No sustituye la documentación oficial de 1C ni una auditoría de seguridad de la información.
- No es fuente de verdad para configuraciones cerradas o propietarias sin verificación propia.
- No garantiza código compilable o reglamentariamente correcto sin ejecución en el configurador o CI.
- Licencia Apache-2.0 para la base y la derivada, pero deben respetarse las licencias de las bases de código abierto de 1C usadas en el entrenamiento.
- No se publican detalles de hiperparámetros, volumen de datos de SFT ni evaluación, lo que dificulta estimar su calidad frente al base en tareas generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sweetand/qwen3.8-27b-1C
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA: incluido en el repositorio como adapter_model.safetensors (no se proporciona URL separada)
- Paper, blog o demo: no disponibles en la información proporcionada.
