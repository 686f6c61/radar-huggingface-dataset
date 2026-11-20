# trymirai/Qwen3.8-27B-M

## Resumen

Mirai's Qwen3.8-27B Medium Quantization (identificador `trymirai/Qwen3.8-27B-M`) es una cuantizacion de 4 bits del modelo base Qwen/Qwen3.8-27B, publicada por Mirai Labs bajo licencia Apache 2.0. Su objetivo es habilitar la inferencia local eficiente de un modelo de gran tamano en hardware Apple silicon, mediante un formato propietario gestionado por la libreria `uzu` y la CLI `mirai`. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado que preserva las capacidades del original a un coste de memoria sustancialmente menor.

El checkpoint emplea cuantizacion entera asimetrica de 4 bits con puntos cero de 4 bits, escalas en bfloat16 y tamano de grupo 64, complementada con transformadas de Hadamard aleatorias en bloques diagonales para mitigar valores atipicos en activaciones y pesos. El proceso combina cuantizacion post-entrenamiento con destilacion consciente de cuantizacion. El autor situa este checkpoint, en su categoria de tamano y divergencia KL, como comparable al `UD-Q4_K_M` de Unsloth en formato GGUF.

El modelo cuenta con 14.085.711.872 parametros reales segun los safetensors, aunque el nombre comercial hace referencia a un modelo base de 27B; esta discrepancia debe tenerse en cuenta al planificar despliegues. El repositorio ocupa 95,8 GB y acumula 1913 descargas y 10 likes en Hugging Face. La relevancia actual radica en la posibilidad de ejecutar un modelo de esta escala en equipos Mac con memoria unificada, un nicho que hasta hace poco quedaba reservado a modelos mucho mas pequenos o a cuantizaciones de menor fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.8-27B; consultar model card del original) |
| Parametros totales | 14.085.711.872 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits asimetrica con puntos cero de 4 bits, escalas bfloat16, grupo 64; tags adicionales indican 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentacion proporcionada; la model card remite explicitamente a la del modelo original para detalles de arquitectura, uso previsto, evaluaciones y limitaciones. Lo que si se documenta es el proceso de cuantizacion: cuantizacion entera asimetrica de 4 bits con puntos cero de 4 bits, escalas en bfloat16 y tamano de grupo 64. Para reducir el impacto de valores atipicos en activaciones y pesos se aplican transformadas de Hadamard aleatorias en bloques diagonales (Block-diagonal Random Hadamard Transforms), una tecnica habitual para mejorar la fidelidad de cuantizaciones agresivas.

El checkpoint se genero mediante cuantizacion post-entrenamiento seguida de destilacion consciente de cuantizacion (quantization-aware distillation), lo que implica un paso de ajuste adicional para recuperar calidad respecto a una cuantizacion naive. El autor declara que el modelo se situa en la frontera de Pareto tamano-divergencia KL, es decir, que no encontro ningun checkpoint de menor tamano con menor divergencia KL. La evaluacion de esta afirmacion se realizo sobre una mezcla de datos compuesta por un 45% de datos publicos agenticos, un 30% de datos publicos de SFT y contexto largo, y un 25% de datos privados de chat.

## Capacidades

- Generacion de texto: pipeline declarado como `text-generation`.
- Razonamiento y conversacion multi-turno: heredados del modelo base Qwen3.8-27B, si bien no se detallan capacidades especificas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la documentacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; la mezcla de evaluacion incluye un 45% de datos agenticos, lo que sugiere que el modelo base esta orientado a este tipo de tareas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia local en Apple silicon: capacidad operativa principal de este checkpoint, mediante la CLI `mirai` y la libreria `uzu`.

## Casos de uso

- Asistentes de codigo en local sobre Mac: el checkpoint permite ejecutar un modelo de gran escala en memoria unificada de Apple silicon, lo que facilita autocompletado y generacion de codigo sin enviar el contexto a servicios externos.
- Prototipado de agentes en estacion de trabajo: gracias a la mezcla de evaluacion con un 45% de datos agenticos, es razonable emplearlo para probar flujos de agentes multi-paso en local antes de desplegarlos en infraestructura.
- Procesamiento de documentos confidenciales: al ejecutarse en hardware propio y bajo licencia Apache 2.0, encaja en entornos con requisitos de privacidad donde no es viable usar APIs en la nube.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad frente al modelo original Qwen3.8-27B o frente al `UD-Q4_K_M` de Unsloth en formato GGUF.
- Desarrollo de aplicaciones macOS nativas: la integracion via Homebrew (`brew install mirai`) y la CLI simplifican la incorporacion del modelo en herramientas de escritorio para macOS.
- Educacion e investigacion: permite experimentar con tecnicas de cuantizacion avanzada (Hadamard transforms, destilacion consciente de cuantizacion) en un checkpoint publico y reproducible.
- Chat de contexto largo: la mezcla de evaluacion incluye un 30% de datos de SFT y contexto largo, lo que sugiere un comportamiento solido en conversaciones extensas, aunque la longitud de contexto concreta no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica cualitativa aportada por el autor es la posicion del checkpoint en la frontera de Pareto tamano-divergencia KL, con una mezcla de evaluacion del 45% agentico, 30% SFT/contexto largo y 25% chat privado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 95,8 GB, aunque el peso efectivo en memoria depende del formato `uzu` y de la memoria unificada disponible.
- GPU recomendadas: la model card indica que actualmente solo se soporta inferencia en Apple silicon; no se mencionan GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no confirmada; el soporte documentado se limita a Apple silicon.
- Opciones de despliegue: CLI `mirai` (instalable via `brew install mirai`) y compilacion desde codigo fuente siguiendo la guia del repositorio `trymirai/uzu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Qwen3.8-27B-M | 14.085.711.872 (safetensors) | no disponible | 4-bit asimetrica, grupo 64 | Apache 2.0 | Apple silicon (`uzu`) |
| unsloth/Qwen3.8-27B-GGUF (UD-Q4_K_M) | no disponible | no disponible | 4-bit GGUF | no disponible en la informacion | Multiples (llama.cpp y derivados) |
| Qwen/Qwen3.8-27B (original) | no disponible | no disponible | sin cuantizar | Apache 2.0 (segun license_link) | Multiples |

El autor situa explicitamente su checkpoint como comparable al `UD-Q4_K_M` de Unsloth en la misma categoria de tamano y cuantizacion. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Soporte limitado a Apple silicon: la model card indica que actualmente solo se soporta inferencia en esta plataforma, lo que excluye despliegues en GPU NVIDIA o AMD.
- Dependencia de la libreria `uzu`: el formato de pesos es especifico de esta libreria, lo que reduce la portabilidad frente a GGUF o safetensors estandar.
- Discrepancia de parametros: el nombre comercial alude a 27B, pero los safetensors declaran 14.085.711.872 parametros; conviene verificar el significado exacto antes de dimensionar el hardware.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento multilingue sin consultar la model card del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones especificas de fidelidad para este checkpoint.
- Sesgos: no documentados en la informacion disponible; deben consultarse en la model card del modelo original.
- Licencia Apache 2.0: permite uso comercial, pero el autor enlaza a la licencia del modelo base, por lo que conviene revisar ambas.
- Datos de evaluacion parcialmente privados: el 25% de la mezcla de evaluacion es privada, lo que limita la reproducibilidad de la afirmacion sobre la frontera de Pareto.

## Enlaces

- Hugging Face: https://huggingface.co/trymirai/Qwen3.8-27B-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Pagina del modelo en Mirai: https://trymirai.com/local-models/alibaba-qwen3-8-27b-mirai-mirai-m-4
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Repositorio `uzu` (guia de ejecucion): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Checkpoint comparable de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B-UD-Q4_K_M.gguf
