# underlabs/GLM-5.3-NVFP4

## Resumen

El modelo `underlabs/GLM-5.3-NVFP4` es una cuantización NVFP4 del modelo GLM-5.3 de Z.ai, un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 745 mil millones de parámetros en su versión original. Este checkpoint concreto, desarrollado por el usuario underlabs, aplica cuantización NVFP4 (W4A4) al modelo objetivo y además cuantiza la capa MTP (Multi-Token Prediction) a NVFP4 weight-only (W4A16), reduciendo el almacenamiento de dicha capa de 19,9 GB a 6,0 GB. El resultado es un modelo que mantiene la capacidad de decodificación especulativa MTP con 5 tokens de borrador, pero con un peso total en disco de 451 GB y 386.110.236.672 parámetros según los tensores safetensors.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de la escala de GLM-5.3 (con contexto nativo de 1.048.576 tokens) en entornos con menos VRAM que la versión BF16, gracias a la cuantización de 4 bits. Está pensado para su uso con vLLM, que soporta la arquitectura `GlmMoeDsaForCausalLM` y la decodificación especulativa MTP. El modelo base GLM-5.3 ha sido destacado por Z.ai como el modelo de pesos abiertos más capaz en tareas de código y agentes, con mejoras del 50% sobre GLM-5.2 en su benchmark interno Z.ai Code Bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (MoE) |
| Parametros totales | 386.110.236.672 (segun safetensors; el modelo base GLM-5.3 tiene 745B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | NVFP4 (W4A4) para el modelo objetivo; NVFP4 weight-only (W4A16) para la capa MTP |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (otra, con disposiciones Model-as-a-Service) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer MoE con arquitectura `GlmMoeDsaForCausalLM`, que incorpora atención con deep speed attention (DSA) y un mecanismo de predicción multi-token (MTP) con una capa de borrador. Este checkpoint cuantizado no ha sido entrenado, sino que es el resultado de aplicar cuantización NVFP4 al modelo objetivo (heredada del checkpoint `Inferact/GLM-5.3-NVFP4`) y de cuantizar adicionalmente la capa MTP a NVFP4 weight-only. La cuantización del modelo objetivo se mantiene sin cambios respecto al checkpoint de Inferact, mientras que la capa MTP pasa de BF16 a W4A16, reduciendo su tamaño de almacenamiento de 19,9 GB a 6,0 GB. No se ha realizado ningún entrenamiento adicional ni ajuste fino; todas las ganancias de rendimiento provienen del post-entrenamiento del modelo base, que según Z.ai comparte la misma base que GLM-5.2.

## Capacidades

- Generacion de texto y razonamiento complejo, con soporte para razonamiento multi-paso (parser de razonamiento `glm45` en vLLM).
- Generacion de codigo avanzada, siendo el modelo base GLM-5.3 el mas capaz de pesos abiertos en tareas de programacion segun Z.ai.
- Soporte de tool calling / function calling mediante el parser `glm47` y `--enable-auto-tool-choice` en vLLM.
- Capacidades de agente y tareas de largo horizonte, con mejoras significativas sobre GLM-5.2 en benchmarks como Terminal Bench 3.0 y Agents' Last Exam.
- Decodificacion especulativa MTP con 5 tokens de borrador, funcionalmente validada con vLLM.
- Contexto largo nativo de 1.048.576 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidades multilingues no especificadas en la informacion disponible.

## Casos de uso

- Despliegue de un modelo de 745B en infraestructura con VRAM limitada: la cuantizacion NVFP4 reduce el uso de memoria frente a BF16, permitiendo servir el modelo en 4 GPUs con tensor parallelism (como se muestra en el comando vLLM de ejemplo).
- Asistente de programacion en produccion: el modelo base destaca en generacion de codigo y soporta tool calling, por lo que puede integrarse en IDEs o pipelines de CI/CD para autocompletado, revision de codigo y generacion de tests.
- Agentes autonomos para tareas de largo horizonte: con su capacidad de razonamiento multi-paso y parser de herramientas, puede ejecutar flujos complejos como navegacion web, uso de APIs o gestion de sistemas.
- Analisis de documentos extensos: gracias a su contexto de 1M tokens, puede procesar libros completos, codigos fuente de grandes repositorios o informes financieros en una sola pasada.
- Investigacion en decodificacion especulativa: al incluir la capa MTP cuantizada, sirve como referencia para estudiar el impacto de la cuantizacion en la tasa de aceptacion de tokens borrador.
- Servicio de chat multiusuario con vLLM: el checkpoint esta optimizado para vLLM, permitiendo servir multiples peticiones concurrentes con alta eficiencia gracias a la cuantizacion y al soporte de `--kv-cache-dtype fp8_ds_mla`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint cuantizado en la informacion disponible. El modelo base GLM-5.3, segun la documentacion de Z.ai, logra el estado del arte en Terminal Bench 3.0 y Agents' Last Exam, y mejora un 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench, pero no se proporcionan cifras numericas concretas en las fuentes consultadas. Tampoco se dispone de datos de rendimiento (latencia, throughput) para la version cuantizada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 386B parametros en NVFP4 (4 bits), el peso del modelo en memoria seria aproximadamente 193 GB, mas overhead de activaciones y cache KV. Se recomienda un minimo de 4 GPUs con al menos 80 GB de VRAM cada una (por ejemplo, A100 80GB o H100 80GB) para servir el modelo con tensor parallelism.
- GPU recomendadas: NVIDIA A100, H100, o GPUs con soporte para FP4 (como Blackwell). No se garantiza funcionamiento en GPUs consumer sin soporte nativo de FP4.
- Opciones de despliegue: vLLM es el runtime principal soportado, con flags especificos para MTP speculative decoding, expert parallelism y cache KV en FP8. No se menciona compatibilidad con llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP con 5 tokens de borrador puede mejorar el throughput, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| underlabs/GLM-5.3-NVFP4 | 386B (cuantizado) | 1M | NVFP4 W4A4 | glm-5.3 | HuggingFace |
| Inferact/GLM-5.3-NVFP4 | 386B (cuantizado) | 1M | NVFP4 W4A4 | glm-5.3 | HuggingFace |
| zai-org/GLM-5.3 (BF16) | 745B | 1M | BF16 | glm-5.3 | HuggingFace |
| GLM-5.2 (base) | no disponible | no disponible | BF16 | glm-5.2 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo. No se dispone de datos suficientes para comparar con otros modelos MoE de tamano similar (como DeepSeek o Qwen) en terminos de rendimiento cuantizado.

## Limitaciones y advertencias

- La cuantizacion NVFP4 puede introducir perdida de precision en comparacion con BF16, especialmente en tareas de razonamiento numerico o logico complejo. No se han publicado evaluaciones de calidad del checkpoint cuantizado.
- La capa MTP cuantizada a W4A16 no garantiza la misma tasa de aceptacion de tokens borrador que la version BF16; la model card indica que no se hace ninguna afirmacion sobre la equivalencia de calidad.
- La licencia glm-5.3 incluye disposiciones Model-as-a-Service, lo que puede restringir el uso comercial del modelo como servicio gestionado. Es necesario revisar los terminos completos de la licencia.
- No se especifican los idiomas soportados; se asume que hereda las capacidades del modelo base, pero no hay confirmacion.
- El checkpoint requiere hardware con soporte para FP4 y vLLM; no es compatible con runtimes que no implementen la arquitectura `GlmMoeDsaForCausalLM`.
- El tamano del repositorio (451 GB) implica una descarga considerable y espacio en disco significativo.

## Enlaces

- [HuggingFace: underlabs/GLM-5.3-NVFP4](https://huggingface.co/underlabs/GLM-5.3-NVFP4)
- [HuggingFace: Inferact/GLM-5.3-NVFP4](https://huggingface.co/Inferact/GLM-5.3-NVFP4)
- [HuggingFace: zai-org/GLM-5.3](https://huggingface.co/zai-org/GLM-5.3)
- [Blog de Z.ai sobre GLM-5.3](https://z.ai/blog/glm-5.3)
- [Documentacion de Z.ai para GLM-5.3](https://docs.z.ai/guides/llm/glm-5.3)
- [Articulo de Inco AI sobre soporte para GLM 5.3](https://inco.ai/blog/glm-5-3/)
- [Guia de unsloth para GLM-5.3](https://unsloth.ai/docs/models/glm-5.3)
