# stefanocarrera/kic_M_Qwen3-4B_java_t1.0_g10_run0

## Resumen

`stefanocarrera/kic_M_Qwen3-4B_java_t1.0_g10_run0` es un ajuste fino (fine-tune) publicado en HuggingFace por el usuario stefanocarrera sobre `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit`, es decir, sobre el modelo denso Qwen3-4B en su variante base y cuantizada en 4 bits. Se distribuye con licencia Apache 2.0, en formato safetensors y con la librería transformers, y incluye la etiqueta `text-generation-inference`, lo que indica compatibilidad con TGI para servir el modelo.

El interés del repositorio es limitado y fundamentalmente experimental: cuenta con 0 descargas y 0 likes, la model card es prácticamente la plantilla automática de Unsloth y no incluye información sobre datos de entrenamiento, hiperparámetros, evaluación ni formato del ajuste. El nombre del repositorio sugiere una especialización en código Java (`java`) con unos parámetros de generación anotados (`t1.0`, `g10`, `run0`), pero ni la model card ni los metadatos confirman esa especialización, por lo que debe tratarse como una hipótesis y no como un hecho.

Al derivar de Qwen3-4B, hereda la arquitectura y las capacidades del modelo base (transformer decoder-only denso de 4.000 millones de parámetros), pero al partir de la versión *Base* —no de la versión instruct— no hay garantía de que el resultado esté alineado para instrucciones ni de que conserve el modo *thinking*. El tamaño del repositorio, 0,1 GB, es coherente con un adaptador LoRA o con pesos cuantizados de forma agresiva, aunque esto tampoco se explicita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), heredada del modelo base |
| Parámetros totales | 4,0 B en el modelo base; tamaño efectivo del ajuste publicado no disponible |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen3-4B, ampliables a 131.072 con YaRN; no verificado para este ajuste |
| Tipos de cuantización | No disponible para el ajuste; el base se distribuye en 4 bits (bitsandbytes) |
| Idiomas soportados | `en` declarado en la model card; el base Qwen3 declara cobertura de 119 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,1 GB |
| Librería y despliegue | transformers; etiquetas `text-generation-inference`, `unsloth`, `trl` |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-24 |
| Modelo base | `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer decoder-only denso con atención de múltiples cabezas con consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings de posición rotatorios (RoPE). El ajuste se ha realizado, según la model card, con Unsloth y TRL, un stack habitual para QLoRA sobre modelos cuantizados en 4 bits, que permite entrenar con dos veces menos memoria que un fine-tune convencional. No se especifica si el resultado publicado son pesos completos fusionados, un adaptador LoRA o una mezcla de ambos.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO/GRPO ni las hiperparámetros concretos (rango de LoRA, learning rate, épocas, precisión). Tampoco se documenta ninguna innovación técnica propia: el repositorio es un artefacto de entrenamiento sin memoria técnica asociada. El sufijo `t1.0_g10_run0` apunta a una ejecución de generación de datos sintéticos (temperatura 1.0, posiblemente *group size* 10) dentro de un pipeline mayor, pero no se detalla en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva en inglés, idioma declarado en la model card.
- Generación y manipulación de código, presumiblemente orientada a Java por el nombre del repositorio; **no confirmado** por el autor.
- Capacidad multilingüe heredada de Qwen3-4B (119 idiomas en el modelo base), aunque el ajuste solo declara inglés.
- Soporte potencial de *tool calling* y razonamiento multi-paso heredado del base, sujeto a que el ajuste no lo haya degradado.
- Posible modo *thinking* heredado de la familia Qwen3, no verificado en esta variante.
- Relleno de código (*fill-in-the-middle*) plausible si el entrenamiento usó ese objetivo, sin evidencia documentada.
- No se declaran capacidades de visión, audio ni multimodales.

## Casos de uso

- **Autocompletado y generación de código Java en IDE**: si la especialización en Java se confirma, el modelo podría integrarse en extensiones tipo Continue o similar para completar métodos y clases, con la ventaja de su reducido tamaño frente a modelos de 7B o 13B.
- **Generación de tests unitarios JUnit**: dado un fragmento de clase, producir casos de prueba; el contexto de 32.000 tokens permite incluir el fichero completo más sus dependencias.
- **Revisión de *pull requests* asistida**: desplegado detrás de una API compatible con OpenAI (TGI o vLLM), analizando el *diff* y emitiendo comentarios; requiere validar previamente la calidad del ajuste, ya que no hay evaluación publicada.
- **Migración de código entre versiones de Java**: reescritura de fragmentos con APIs obsoletas hacia equivalentes modernos, un caso donde un modelo pequeño especializado puede bastar sin recurrir a APIs de pago.
- **Extracción de información estructurada en inglés**: convertir documentos técnicos en JSON con un esquema fijo, aprovechando el contexto largo para incluir varios ejemplos *few-shot*.
- **Prototipado de agentes en local**: al caber en GPUs de consumo, sirve para experimentar con bucles de razonamiento y *tool calling* antes de escalar a modelos mayores.
- **Investigación sobre QLoRA y evaluación de ajustes**: como artefacto de estudio de cómo un fine-tune sobre un base cuantizado en 4 bits afecta a la perplejidad y a la calidad del código.
- **Base para un segundo ajuste**: punto de partida para un fine-tune instruct en Java, partiendo del conocimiento de dominio ya adquirido (si existe).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, MBPP, GSM8K ni de ningún otro conjunto, y tampoco se aportan métricas de pérdida de validación ni comparaciones con el modelo base. Cualquier cifra que se atribuya a este ajuste sería una invención.

## Requisitos de hardware

- **VRAM estimada para los pesos**: en 4 bits, aproximadamente 2,5-3 GB; en 8 bits, 4,5-5 GB; en bf16, 8-9 GB. Son estimaciones para 4.000 millones de parámetros, no medidas sobre este repositorio.
- **Caché KV**: para la configuración típica de Qwen3-4B (36 capas, 8 cabezas KV, dimensión de cabeza 128), el coste es de unos 0,14 GB por cada 1.000 tokens en bf16; con 32.768 tokens de contexto completo, del orden de 4,8 GB adicionales.
- **GPU de consumo**: cabe en bf16 con contexto moderado en una RTX 4070 (12 GB) o RTX 4080/4090 (16-24 GB); en 4 bits funciona en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- **Contexto completo de 32K**: requiere aproximadamente 14 GB en bf16, por lo que conviene una RTX 4090, una L40S o una A100.
- **GPU de datacenter**: A100 40/80 GB y H100 para servir en bf16 con lotes grandes o para reentrenamiento.
- **Opciones de despliegue**: TGI (etiqueta declarada en el repo), vLLM, transformers con `device_map="auto"`, llama.cpp/Ollama previa conversión a GGUF, y Unsloth para carga y ajuste continuado.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| Este ajuste (`kic_M_Qwen3-4B_java...`) | 4,0 B (base) | No verificado (base: 32K/131K) | Apache 2.0 | HuggingFace, 0 descargas | No |
| Qwen3-4B (base e instruct) | 4,0 B | 32K nativo, 131K con YaRN | Apache 2.0 | HuggingFace oficial, ampliamente usado | Sí, en la ficha oficial |
| Llama 3.2 3B | 3,2 B | 128K | Llama 3.2 Community License | HuggingFace (Meta) | Sí |
| Gemma 3 4B | 4,0 B aprox. | 128K | Gemma Terms of Use | HuggingFace (Google) | Sí |
| Phi-4-mini | 3,8 B | 128K | MIT | HuggingFace (Microsoft) | Sí |

Los datos de los modelos comparables provienen de sus fichas públicas y no se han verificado en la búsqueda realizada; para este ajuste no existe ninguna evaluación que permita situarlo frente a ellos. A igualdad de parámetros, la ventaja competitiva del repositorio es nula hasta que se demuestre su rendimiento en código Java.

## Limitaciones y advertencias

- **Ausencia total de evaluación**: sin benchmarks, sin métricas de pérdida y sin validación por parte de la comunidad (0 descargas, 0 likes).
- **Model card mínima**: es la plantilla automática de Unsloth; no documenta datos, hiperparámetros ni el formato exacto de los pesos publicados.
- **Parte de un modelo *Base***: no hay evidencia de alineación por instrucciones ni de RLHF/DPO, por lo que el comportamiento conversacional puede ser deficiente y el uso de plantillas de chat es una incógnita.
- **Cuantización previa del base**: entrenar sobre un modelo cuantizado en 4 bits (QLoRA) puede introducir artefactos respecto a un fine-tune en bf16.
- **Especialización no confirmada**: el sufijo `java` sugiere dominio de código Java, pero no se documenta el corpus; podría ser un ajuste sobre datos sintéticos generados automáticamente.
- **Idioma**: solo se declara inglés; el rendimiento en castellano no está verificado aunque el base sea multilingüe.
- **Riesgo de alucinación**: inherente a los modelos de 4.000 millones de parámetros, especialmente en código y en APIs que no existan en su corpus.
- **Sesgos**: no se documenta ningún proceso de mitigación; los sesgos del corpus de Qwen3-4B se heredan sin control.
- **Licencia**: Apache 2.0 permite uso comercial y modificación con atribución y sin garantías; conviene conservar el aviso de licencia y verificar las condiciones del modelo base de Unsloth.
- **Metadatos anómalos**: la fecha de creación declarada (2026-10-24) es posterior a la de los modelos de referencia citados, lo que puede indicar un artefacto de sincronización o un entorno de prueba.
- **No apto para producción** sin una evaluación propia previa en la tarea objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stefanocarrera/kic_M_Qwen3-4B_java_t1.0_g10_run0
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen3-4B-Base-unsloth-bnb-4bit
- Qwen3-4B oficial: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper, blog o demo del ajuste: no disponible
