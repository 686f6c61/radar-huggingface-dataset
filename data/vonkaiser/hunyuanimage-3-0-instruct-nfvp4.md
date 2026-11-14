# vonkaiser/HunyuanImage-3.0-Instruct-NFVP4

## Resumen

HunyuanImage-3.0-Instruct-NFVP4 es una conversión no oficial de los pesos de HunyuanImage-3.0-Instruct, el modelo nativo multimodal de generación de imágenes desarrollado por Tencent Hunyuan. Esta variante concreta, publicada por el usuario vonkaiser, aplica una cuantización NFVP4 (formato de 4 bits orientado a pesos de modelos de difusión y generación) sobre el checkpoint original, reduciendo el peso del repositorio hasta los 168,7 GB. El modelo base resuelve tareas de generación y edición de imágenes a partir de instrucciones en lenguaje natural, incluyendo razonamiento intermedio para mejorar los prompts.

A diferencia de las arquitecturas DiT (Diffusion Transformer) dominantes en generación de imágenes, HunyuanImage-3.0 emplea un transformer autorregresivo de tipo Mixture-of-Experts que unifica comprensión y generación multimodal en un único marco. El checkpoint cuenta con 83.009.199.459 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos de gran escala que requieren hardware de datacenter para inferencia cómoda.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada a 4 bits del modelo oficial, lo que reduce los requisitos de VRAM y facilita el despliegue en entornos con GPUs de menor capacidad, a costa de posibles pérdidas de calidad y de la ausencia de garantías de soporte por parte del autor original. Es importante señalar que se trata de una conversión de la comunidad, no avalada por Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal con Mixture-of-Experts (tag `hunyuan_image_3_moe`) |
| Parametros totales | 83.009.199.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NFVP4 (4 bits, variante de la comunidad); el modelo original admite otros formatos no detallados |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada de Tencent Hunyuan, ver repositorio original) |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

HunyuanImage-3.0 se presenta como un modelo multimodal nativo que unifica comprensión y generación dentro de un marco autorregresivo, alejándose de las arquitecturas DiT habituales en difusión. El checkpoint emplea una estructura Mixture-of-Experts (MoE) según el tag del repositorio, con 83.000 millones de parámetros totales. No se dispone en la información proporcionada del número de parámetros activos por token, la longitud de contexto, ni la composición exacta del dataset de entrenamiento.

El modelo base incorpora una variante Instruct con razonamiento (reasoning) para el enriquecimiento inteligente de prompts y generación image-to-image orientada a edición creativa. Tencent publicó un informe técnico (arXiv:2509.23951) que documenta la arquitectura y el entrenamiento, así como una versión destilada (HunyuanImage-3.0-Instruct-Distil) recomendada para 8 pasos de muestreo. Esta conversión NFVP4 no documenta en su model card el proceso de cuantización aplicado, los pasos de calibración ni las métricas de degradación respecto al original.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con prompts en lenguaje natural.
- Generación image-to-image: edición de imágenes existentes y fusión de múltiples imágenes de entrada.
- Razonamiento intermedio (thinking) para enriquecer y descomponer prompts complejos antes de generar.
- Comprensión multimodal integrada en el mismo marco autorregresivo que la generación.
- Soporte de inferencia acelerada mediante vLLM según la documentación del modelo original.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.

## Casos de uso

- Edición de imágenes asistida por instrucciones: el modelo recibe una imagen y una instrucción textual y devuelve una versión editada, adecuado para flujos de retoque y variaciones creativas sin intervención manual de máscaras.
- Fusión de múltiples imágenes: combinación de varios elementos visuales en una sola composición, útil en diseño gráfico y generación de mockups.
- Generación de material visual para marketing: creación de banners, ilustraciones y assets a partir de descripciones textuales, con el modo Instruct para refinar prompts automáticamente.
- Prototipado rápido de conceptos visuales: iteración sobre ideas de producto o escenas mediante image-to-image, aprovechando el razonamiento para interpretar instrucciones ambiguas.
- Enriquecimiento automático de prompts en pipelines creativos: el modo reasoning del checkpoint Instruct permite transformar descripciones breves en prompts detallados antes de la generación.
- Despliegue en entornos con VRAM limitada: la cuantización NFVP4 reduce el peso del checkpoint a 168,7 GB, lo que permite probar el modelo en configuraciones multi-GPU de menor coste que el checkpoint original en precisión completa.
- Investigación sobre cuantización de modelos generativos: esta variante sirve como caso de estudio para evaluar la degradación de calidad de NFVP4 frente al checkpoint oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye métricas propias, y la información proporcionada no detalla los resultados de la sección de evaluación del modelo original.

## Requisitos de hardware

- VRAM estimada: con 83.000 millones de parámetros en 4 bits, el peso de los pesos ronda los 41,5 GB teóricos, aunque el repositorio ocupa 168,7 GB, lo que sugiere múltiples ficheros y posibles componentes adicionales (VAE, text encoder, etc.). Se recomienda un mínimo de 48 GB de VRAM para los pesos, con margen adicional para activaciones y caché.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con RTX 4090 (24 GB) en tensor parallel.
- GPU de consumo: no cabe en una única RTX 4090; requiere al menos dos o tres unidades en paralelo, o bien descarga parcial a CPU.
- Opciones de despliegue: el modelo original documenta soporte de Transformers con `custom_code`, instalación local desde el repositorio de GitHub y aceleración con vLLM. No se confirma compatibilidad de esta variante NFVP4 con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HunyuanImage-3.0-Instruct-NFVP4 (esta ficha) | 83,0 B | no disponible | other | Hugging Face (comunidad) |
| HunyuanImage-3.0-Instruct (original) | no disponible en la información | no disponible | other | Hugging Face (Tencent) |
| HunyuanImage-3.0-Instruct-Distil | no disponible | no disponible | other | Hugging Face (Tencent) |
| HunyuanImage-3.0 (text-to-image) | no disponible | no disponible | other | Hugging Face (Tencent) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a disponibilidad y licencia.

## Limitaciones y advertencias

- Conversión no oficial: esta variante NFVP4 ha sido publicada por un tercero (vonkaiser) sin aval de Tencent; no hay garantías de fidelidad respecto al checkpoint original.
- Calidad degradada potencial: la cuantización a 4 bits puede introducir artefactos visuales o pérdida de coherencia en prompts complejos; no se documentan métricas de degradación.
- Licencia "other": es imprescindible revisar los términos de la licencia personalizada de Tencent Hunyuan antes de cualquier uso comercial; la licencia del repositorio cuantizado no aclara restricciones adicionales.
- Riesgo de alucinación visual: como modelo generativo, puede producir elementos no solicitados o incoherentes con la instrucción, especialmente en composiciones con múltiples objetos.
- Sesgos: no se documentan sesgos conocidos en la información disponible, pero el modelo hereda los del dataset de entrenamiento original, no detallado.
- Idiomas: no se especifican los idiomas soportados; se desconoce si las instrucciones en castellano funcionan con la misma calidad que en inglés o chino.
- Sin soporte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- Requisitos de hardware elevados pese a la cuantización: 168,7 GB de repositorio exigen almacenamiento y VRAM considerables.
- Compatibilidad de despliegue incierta: no se confirma que funcione con vLLM, llama.cpp u Ollama en esta variante cuantizada.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/vonkaiser/HunyuanImage-3.0-Instruct-NFVP4
- Modelo original en Hugging Face: https://huggingface.co/tencent/HunyuanImage-3.0-Instruct
- Repositorio GitHub oficial: https://github.com/Tencent-Hunyuan/HunyuanImage-3.0
- Informe técnico (arXiv): https://arxiv.org/pdf/2509.23951
- Sitio oficial: https://hunyuan.tencent.com/image
- Demo oficial: https://hunyuan.tencent.com/chat/HunyuanDefault?from=modelSquare&modelId=Hunyuan-Image-3.0-Instruct
- Prompt Handbook: https://docs.qq.com/doc/DUVVadmhCdG9qRXBU
- Discord: https://discord.gg/ehjWMqF5wY
- X (Twitter): https://x.com/TencentHunyuan
