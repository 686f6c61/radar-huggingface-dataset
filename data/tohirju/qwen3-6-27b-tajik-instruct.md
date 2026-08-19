# Tohirju/Qwen3.6-27B-Tajik-Instruct

## Resumen

El modelo **Tohirju/Qwen3.6-27B-Tajik-Instruct** es un ajuste fino (fine-tune) instructivo del modelo base **Qwen/Qwen3.6-27B**, desarrollado por el usuario Tohirju, orientado específicamente a la conversación y generación de texto en **tayiko** (tg). Se trata de una adaptación monolingüe de un modelo denso de 27 mil millones de parámetros, pensado para cubrir la escasez de modelos de alta calidad en lenguas de Asia Central, especialmente el tayiko, hablado en Tayikistán y comunidades de la diáspora.

El modelo base Qwen3.6-27B, lanzado por Alibaba en 2026, introduce una arquitectura híbrida con *gated delta networks* y atención híbrida, junto con decodificación especulativa (MTP) y una ventana de contexto de 262.144 tokens. Este fine-tune conserva esas capacidades técnicas, pero las reorienta hacia el tayiko, permitiendo tareas de generación, razonamiento y código en ese idioma. Su relevancia actual radica en que ofrece una alternativa de alto rendimiento para desarrolladores e investigadores que trabajan con procesamiento de lenguaje natural en tayiko, un área tradicionalmente poco servida por los grandes modelos multilingües.

El acceso al modelo está **restringido** (gated) en HuggingFace, por lo que es necesario aceptar las condiciones de licencia antes de poder descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con *gated delta networks* y atención híbrida (del base Qwen3.6-27B) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (heredado del base) |
| Tipos de cuantizacion | no disponible en la informacion del repo |
| Idiomas soportados | tayiko (tg) principal; el base es multilingue, pero el fine-tune se centra en tayiko |
| Licencia | qwen (licencia propia de Qwen, con restricciones de uso comercial; consultar términos) |
| Formato de pesos | safetensors (repo de 54,7 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura densa de 27B parámetros con una innovación clave: **gated delta networks** combinadas con atención híbrida, lo que permite un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias largas. Incorpora además **decodificación especulativa** (MTP) para acelerar la inferencia y soporta una ventana de contexto de 262.144 tokens, muy superior a la mayoría de modelos de su tamaño. El fine-tune Tohirju/Qwen3.6-27B-Tajik-Instruct parte de este checkpoint y se ajusta con datos instructivos en tayiko, probablemente mediante técnicas de supervisión (SFT) y posiblemente optimización con preferencias (DPO/RLHF), aunque el autor no detalla el proceso exacto en la información disponible. No se especifica el volumen de datos de entrenamiento ni la composición del dataset tayiko.

## Capacidades

- **Generación de texto en tayiko**: conversación fluida, redacción de documentos, resúmenes y traducción al/del tayiko.
- **Razonamiento y matemáticas**: hereda las capacidades del base Qwen3.6-27B, que alcanza resultados sólidos en tareas de razonamiento (p. ej., 77,2% en SWE-bench Verified según el blog de AImadeTools).
- **Generación de código**: el base está optimizado para *agentic coding*, por lo que el fine-tune puede asistir en programación con instrucciones en tayiko.
- **Soporte de tool calling y function calling**: el base Qwen3.6-27B incluye estas capacidades; el fine-tune las conserva, permitiendo integración con APIs y agentes.
- **Capacidades multimodales**: el base es multimodal (procesa imágenes y texto), aunque no se especifica si el fine-tune mantiene el soporte visual completo.
- **Contexto largo**: ventana de 262K tokens, útil para documentos extensos o conversaciones multi-turno largas.

## Casos de uso

- **Atención al cliente en tayiko**: el modelo puede gestionar conversaciones multi-turno en tayiko con contexto largo (hasta 262K tokens), ideal para centros de soporte en Tayikistán o empresas que atienden a la diáspora tayika.
- **Traducción automática tayiko-español o tayiko-ruso**: aunque no es un modelo de traducción dedicado, su capacidad multilingüe del base permite generar traducciones fluidas, especialmente con instrucciones en tayiko.
- **Generación de documentación técnica y legal**: redacción de contratos, informes o manuales en tayiko, con control de estilo mediante prompts instructivos.
- **Asistente de programación con interfaz en tayiko**: desarrolladores tayikos pueden describir requisitos en su idioma y recibir código o explicaciones técnicas, gracias al soporte de código y razonamiento del base.
- **Análisis de sentimiento y moderación de contenido**: fine-tune adicional sobre este modelo permitiría clasificar textos en tayiko para redes sociales o plataformas de contenido.
- **Educación y tutoría**: creación de materiales didácticos, explicaciones de conceptos científicos o matemáticos en tayiko, aprovechando la ventana de contexto para incluir libros de texto completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune Tohirju/Qwen3.6-27B-Tajik-Instruct en la información disponible. Sin embargo, el modelo base Qwen3.6-27B reporta los siguientes resultados (según fuentes web):

| Benchmark | Resultado (base Qwen3.6-27B) |
|---|---|
| SWE-bench Verified | 77,2% |
| Otros benchmarks (MMLU, HumanEval, GSM8K) | no disponibles en las fuentes consultadas |

Estos datos corresponden al modelo base, no al fine-tune tayiko, por lo que deben tomarse como referencia orientativa de la capacidad subyacente.

## Requisitos de hardware

- **VRAM estimada para inferencia** (modelo de 27B parámetros):
  - fp16/bf16: ~55 GB (el repo pesa 54,7 GB)
  - int8: ~28 GB
  - int4: ~14 GB
- **GPU recomendadas**: una sola A100 80GB o H100 para fp16; RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantización int4; para int8 se necesitan al menos 32 GB (p. ej., A6000 o 2x RTX 3090).
- **En consumer GPU**: sí, con cuantización int4 cabe en una RTX 4090 (24 GB) o incluso en una RTX 3080 (10-12 GB) con cuantización más agresiva (GGUF Q4_K_M).
- **Opciones de despliegue**: vLLM, TGI, llama.cpp (con conversión a GGUF), Ollama (si se convierte el modelo), SGLang. El base tiene recetas oficiales en vLLM.
- **Latencia y throughput**: no se dispone de datos específicos para este fine-tune; el base con decodificación especulativa alcanza mayor throughput en vLLM, pero depende del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tohirju/Qwen3.6-27B-Tajik-Instruct | 27,36B | 262K | tayiko (principal) | qwen (gated) | HuggingFace (acceso restringido) |
| Qwen/Qwen3.6-27B (base) | 27,36B | 262K | multilingue (incluye tayiko? no confirmado) | qwen | HuggingFace, Azure AI |
| Qwen3.6-35B-A3B (MoE) | 35B total, 3B activos | 262K | multilingue | qwen | HuggingFace |
| Otros modelos tayikos (p. ej., fine-tunes de Llama o Mistral) | variable | variable | tayiko | variable | variable, generalmente menos capaces |

No se dispone de comparativas directas con otros fine-tunes tayikos de tamaño similar en la información consultada.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es *gated*; hay que solicitar acceso en HuggingFace y aceptar la licencia qwen, que puede imponer restricciones de uso comercial o redistribución.
- **Sesgos y alucinaciones**: al ser un fine-tune sobre un modelo base grande, puede heredar sesgos del corpus original y generar contenido incorrecto o inventado, especialmente en tayiko si los datos de entrenamiento del fine-tune son limitados.
- **Cobertura del tayiko**: el fine-tune se centra en tayiko, pero no se especifica la variedad dialectal ni la calidad en registros formales vs. coloquiales; puede fallar en jerga técnica o regionalismos.
- **Rendimiento fuera del tayiko**: aunque el base es multilingue, el fine-tune puede degradar el rendimiento en otros idiomas debido al ajuste específico.
- **Requisitos de hardware elevados**: para usar el modelo sin cuantización se necesitan GPUs de alta gama; en consumer GPU solo es viable con cuantización agresiva, lo que puede afectar la calidad.
- **Sin benchmarks propios**: no hay evaluaciones publicadas del fine-tune, por lo que su rendimiento real en tayiko es incierto hasta que se realicen pruebas independientes.
- **Fecha de creación**: el modelo fue creado en agosto de 2026, muy reciente, lo que implica poca validación comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- [HuggingFace: Tohirju/Qwen3.6-27B-Tajik-Instruct](https://huggingface.co/Tohirju/Qwen3.6-27B-Tajik-Instruct)
- [GitHub QwenLM/Qwen3.6](https://github.com/QwenLM/Qwen3.6)
- [Guía completa de Qwen 3.6-27B (AImadeTools)](https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/)
- [Recetas vLLM para Qwen3.6-27B](https://recipes.vllm.ai/Qwen/Qwen3.6-27B)
- [Guía de Qwen 3.6 (insiderllm)](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
- [Catálogo de modelos en Microsoft Foundry](https://ai.azure.com/catalog/models/qwen-qwen3.6-27b)
