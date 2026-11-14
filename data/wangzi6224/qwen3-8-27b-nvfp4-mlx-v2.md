# wangzi6224/Qwen3.8-27B-NVFP4-MLX-v2

## Resumen

Qwen3.8-27B-NVFP4-MLX-v2 es una conversión comunitaria al formato MLX de un paquete cuantizado en NVFP4 de 4 bits del modelo Qwen/Qwen3.8-27B. El autor, wangzi6224, parte del paquete `qwen3.8:27b-mlx` distribuido en el catálogo de Ollama (manifiesto con fecha de descarga 2026-09-22) y lo reempaqueta para que pueda cargarse con la librería MLX de Apple. El resultado contiene únicamente la torre de lenguaje, con 26.895.998.464 parámetros reales según los safetensors y un tamaño de repositorio de 17,0 GB.

La relevancia del modelo es fundamentalmente práctica: permite ejecutar un modelo de aproximadamente 27.000 millones de parámetros cuantizado a 4 bits sobre hardware Apple Silicon mediante MLX, sin depender de CUDA. La cuantización NVFP4 (bloques de 16 elementos, 4 bits) fue generada con NVIDIA ModelOpt en modo `MIXED_PRECISION`, según la configuración incluida en el paquete original, aunque el autor no documenta quién ejecutó dicha cuantización.

Conviene subrayar que esta ficha describe un artefacto de conversión, no un modelo entrenado por wangzi6224. El autor advierte de que los tensores no cuantizados difieren entre un 4 % y un 6 % de la revisión oficial `1d4bf0f2` de Qwen/Qwen3.8-27B y son idénticos byte a byte a `Inferact/Qwen3.8-27B-NVFP4`, por lo que la base de pesos no procede de la publicación oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, según tag `qwen3_5`); no disponible el detalle de capas y cabezas |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 de 4 bits con group_size 16; 400 capas lineales en NVFP4 y 9 capas en W4A16_NVFP4 (incluida la capa de salida) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), más `global_scales.safetensors` con las escalas globales por capa |

## Arquitectura y entrenamiento

El paquete se etiqueta con la arquitectura `qwen3_5` y corresponde a un transformer denso de aproximadamente 27.000 millones de parámetros. La información disponible no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento original de Qwen3.8-27B; tampoco se documenta si hubo RLHF, DPO u otras fases de alineamiento. Todo ello debe consultarse en la model card del modelo base.

La innovación técnica de este artefacto es la cadena de cuantización y conversión. La cuantización original se realizó con NVIDIA ModelOpt en modo `MIXED_PRECISION`: 400 capas lineales se almacenan en NVFP4 con bloques de 16 elementos y 9 capas adicionales usan el esquema W4A16_NVFP4, que cuantiza solo los pesos y mantiene las activaciones en mayor precisión. La conversión a MLX renombra claves (`model.language_model.*` a `language_model.model.*`, `lm_head.*` a `language_model.lm_head.*` y `.weight.scale` a `.scales`) sin alterar los bytes de los tensores, extrae las escalas globales por capa a un fichero aparte multiplicándolas por 448×6, y elimina la torre de visión y la cabeza MTP. El `config.json`, la plantilla de chat y la configuración de generación provienen de `wangzi6224/Qwen3.8-27B-NVFP4-MLX@80fd7213`, mientras que los tres ficheros del tokenizador son idénticos byte a byte a los del paquete original.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.8-27B.
- Generación de código y resolución de problemas matemáticos, asumiendo las capacidades estándar de la familia Qwen3.5 (no verificadas en esta conversión).
- Soporte de tool calling y function calling: no disponible en la información proporcionada; debe confirmarse en la model card del modelo base.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; el paquete no declara idiomas.
- Sin capacidades de visión: la torre visual fue eliminada explícitamente durante la conversión.
- Sin cabeza MTP (multi-token prediction): eliminada, por lo que no se puede usar decodificación especulativa basada en MTP.
- Plantilla de chat incluida (`chat_template.jinja`), lo que permite formatear conversaciones de forma consistente con el modelo base.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y los 17 GB de pesos permiten cargar el modelo en equipos con memoria unificada de 24 GB o más, algo inviable con los pesos en bf16 completos (unos 54 GB).
- Prototipado de asistentes conversacionales en escritorio: la plantilla de chat incluida y la licencia Apache-2.0 facilitan integrar el modelo en aplicaciones locales sin depender de servicios en la nube.
- Evaluación comparativa de cuantizaciones: sirve para medir la pérdida de calidad de NVFP4 frente a bf16 o GGUF Q4 en tareas concretas del flujo de trabajo del desarrollador.
- Generación de código en entornos sin GPU NVIDIA: al ejecutarse sobre MLX, cubre estaciones de trabajo macOS donde CUDA no está disponible.
- Investigación sobre cuantización de 4 bits: el repositorio documenta con precisión los cambios de claves, escalas y configuración, lo que lo convierte en un caso de estudio reproducible de conversión de formato.
- Despliegue de bajo consumo en portátiles: con 17 GB de pesos y cuantización de 4 bits, el consumo de memoria es compatible con flujos de trabajo en máquinas de gama alta de consumo.
- Fine-tuning ligero o adaptación con LoRA: la licencia Apache-2.0 lo permite, aunque la cuantización NVFP4 complica el entrenamiento directo y requeriría de-cuantizar o aplicar adaptadores sobre las capas no cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 17 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB de memoria unificada y 32 GB para contextos largos.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max y Ultra). No es compatible de forma nativa con CUDA.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada suficiente; no está pensado para GPUs NVIDIA de consumo por el formato MLX.
- Opciones de despliegue: MLX (`mlx-lm`) es la vía principal; el paquete original procede de Ollama, por lo que la variante `qwen3.8:27b-mlx` puede ejecutarse con Ollama en macOS. vLLM y TGI no soportan MLX de forma nativa.
- Latencia y throughput: no disponibles. Dependen del chip Apple concreto y del soporte de NVFP4 en MLX, que no está documentado en la información proporcionada.
- Advertencia de carga: es imprescindible aplicar las escalas de `global_scales.safetensors` a cada capa cuantizada; los cargadores que solo lean el fichero principal de pesos producirán resultados incorrectos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wangzi6224/Qwen3.8-27B-NVFP4-MLX-v2 | 26,9 mil millones | No disponible | NVFP4 4 bits, group 16 | safetensors MLX | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base oficial) | No disponible (≈27 mil millones por nombre) | No disponible | bf16 sin cuantizar | safetensors | No disponible en esta ficha | Hugging Face, revisión `1d4bf0f2` |
| Inferact/Qwen3.8-27B-NVFP4 | No disponible | No disponible | NVFP4 4 bits | No disponible | No disponible | Hugging Face; tensores idénticos byte a byte al paquete aquí descrito |
| wangzi6224/Qwen3.8-27B-NVFP4-MLX (v1) | No disponible | No disponible | NVFP4 4 bits | safetensors MLX | Apache-2.0 | Hugging Face, revisión `80fd7213`; origen del config y la plantilla de chat |

## Limitaciones y advertencias

- Procedencia de pesos no oficial: los tensores no cuantizados difieren entre un 4 % y un 6 % de la revisión oficial de Qwen/Qwen3.8-27B, lo que puede traducirse en diferencias de comportamiento frente al modelo publicado por Qwen.
- Riesgo de carga incorrecta: si el cargador no aplica `global_scales.safetensors`, las salidas serán erróneas sin aviso evidente; conviene verificar con una prueba de generación conocida.
- Sin visión ni MTP: la torre visual y la cabeza de predicción multi-token fueron eliminadas, de modo que no se pueden usar entradas de imagen ni decodificación especulativa basada en MTP.
- Idiomas no declarados: el repositorio no especifica la cobertura lingüística; el rendimiento en castellano debe validarse empíricamente.
- Contexto desconocido: no se documenta la longitud máxima de contexto ni la configuración de RoPE, por lo que los límites prácticos de ventana deben comprobarse en el `config.json`.
- Sesgos y alucinaciones: no hay información específica sobre sesgos del modelo base ni evaluaciones de factualidad en este paquete; se aplican los riesgos habituales de un modelo de lenguaje de su escala.
- Trazabilidad de la cuantización: el autor no identifica quién ejecutó la cuantización NVFP4 original, lo que dificulta auditar el proceso.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni reportes de la comunidad.
- Licencia: Apache-2.0 permite uso comercial, pero al ser una conversión de un paquete de terceros conviene conservar los avisos de la licencia original y verificar la licencia del modelo base Qwen3.8-27B antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wangzi6224/Qwen3.8-27B-NVFP4-MLX-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión previa del mismo autor: https://huggingface.co/wangzi6224/Qwen3.8-27B-NVFP4-MLX
- Paquete NVFP4 con tensores idénticos: https://huggingface.co/Inferact/Qwen3.8-27B-NVFP4
- Librería MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Ollama: https://ollama.com
