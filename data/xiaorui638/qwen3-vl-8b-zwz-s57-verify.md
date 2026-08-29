# xiaorui638/Qwen3-VL-8B-ZwZ-S57-verify

## Resumen

Este modelo es un fine-tune del Qwen3-VL-8B-Instruct, desarrollado por el autor independiente xiaorui638, que aplica entrenamiento con GRPO (Group Relative Policy Optimization) sobre 57.447 pares de premisas falsas (twin pairs) para mitigar un problema crítico en modelos de visión-lenguaje: la tendencia a responder afirmativamente a preguntas sobre elementos que no están presentes en la imagen. El modelo debe emitir pasos explícitos de verificación (`<check>…</check><verdict>yes|no</verdict>`) antes de dar su respuesta final, lo que permite rechazar premisas falsas en lugar de alucinar.

La arquitectura es un transformer multimodal denso de 8.767.123.696 parámetros (aproximadamente 8,77 mil millones), basado en el modelo Qwen3-VL-8B-Instruct de Alibaba Cloud, que soporta entrada intercalada de texto, imágenes y vídeo con una ventana de contexto nativa de hasta 256K tokens según la documentación del modelo base. Este fine-tune se centra específicamente en la discriminación de premisas falsas en contextos visuales, un área donde los modelos base suelen fallar.

La relevancia de este trabajo radica en que aborda un problema de fiabilidad en sistemas multimodales: la incapacidad de negar información ausente. Los resultados reportados muestran mejoras sustanciales en métricas como DASH-B acc_no (82,03 frente a 54,36 del base) y ZTB-mcq paired (43,83 frente a 11,20), aunque con advertencias importantes sobre la dependencia del prompt y una caída en el benchmark mme-realworld-lite.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3-VL) |
| Parametros totales | 8.767.123.696 (8,77B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible para este fine-tune; el modelo base Qwen3-VL-8B-Instruct soporta hasta 256K tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un modelo de visión-lenguaje de la familia Qwen3-VL con arquitectura transformer densa que procesa texto, imágenes y vídeo de forma intercalada. El fine-tune se realizó mediante GRPO con 57.447 pares de premisas falsas (twin pairs) en proporción 2:1 positivo/negativo. Cada ejemplo negativo pregunta por algo ausente en la imagen, y el modelo debe seleccionar una opción que niegue la premisa en lugar de responder directamente.

La función de recompensa utilizada es `gated_mult = acc * (0.5 + 0.5 * coverage) + 0.1 * format`, donde `coverage` mide la fracción de sub-preguntas doradas cubiertas por los checks emitidos por el modelo, evaluada por un juez LLM (Qwen3-30B-A3B-Instruct-2507). El entrenamiento duró 150 pasos con un rollout de 384. El modelo aprende a emitir pasos explícitos de verificación antes de la respuesta final, un comportamiento que, según la model card, está ligado al prompt de inferencia (verify v2.1) y no está internalizado de forma robusta.

## Capacidades

- Verificación de premisas falsas en imágenes: el modelo puede detectar que un objeto o atributo mencionado en la pregunta no está presente en la imagen y emitir un veredicto de negación.
- Razonamiento visual multimodal: procesa imágenes junto con texto para responder preguntas de comprensión visual.
- Emisión de pasos de verificación estructurados: genera secuencias `<check>…</check><verdict>yes|no</verdict>` antes de la respuesta final, lo que facilita la interpretabilidad.
- Generación de texto y diálogo conversacional: hereda las capacidades del modelo base Qwen3-VL-8B-Instruct para tareas de chat y QA.
- Soporte de tool calling y agentes: no se especifica en la documentación del fine-tune, pero el modelo base Qwen3-VL-8B-Instruct incluye estas capacidades; no hay confirmación de que se hayan preservado tras el entrenamiento.
- Capacidades multilingües: no se proporcionan datos específicos para este fine-tune; el modelo base soporta múltiples idiomas, pero no se confirma su mantenimiento.

## Casos de uso

- Moderación de contenido visual: el modelo puede verificar si una imagen contiene realmente el contenido denunciado (por ejemplo, objetos peligrosos o elementos prohibidos) antes de tomar una decisión, reduciendo falsos positivos en sistemas de moderación automática.
- QA visual en entornos críticos: en ámbitos como sanidad o seguridad, donde una alucinación puede tener consecuencias graves, el modelo puede negar la presencia de elementos que no aparecen en la imagen, mejorando la fiabilidad de los asistentes de diagnóstico por imagen.
- Verificación de hechos en noticias con imágenes: permite comprobar si una afirmación sobre una fotografía (por ejemplo, "en la imagen se ve una multitud") es cierta, emitiendo un veredicto de negación cuando el elemento está ausente.
- Asistentes de accesibilidad para personas con discapacidad visual: el modelo puede describir imágenes y, al mismo tiempo, señalar explícitamente cuando una pregunta del usuario hace referencia a algo que no está presente, evitando respuestas inventadas.
- Análisis de documentos con imágenes (facturas, contratos, informes): puede verificar que un dato mencionado en el texto (por ejemplo, un logotipo o una firma) realmente aparece en la imagen adjunta, reduciendo errores en procesos de extracción de información.
- Sistemas de recomendación basados en fotos de producto: el modelo puede confirmar si un atributo solicitado por el usuario (color, tamaño, presencia de un accesorio) está realmente en la fotografía, mejorando la precisión de las recomendaciones.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados comparativos entre el modelo base, un fine-tune con solo ejemplos positivos (ZwZ-8B), un fine-tune GRPO estándar (plain GRPO) y este modelo (ZwZ-S57-verify):

| Metrica | Base | ZwZ-8B | Plain GRPO | Este modelo |
|---|---|---|---|---|
| ZTB-mcq paired (in-domain) | 11,20 | 7,22 | 39,34 | **43,83** |
| VERVE paired (in-domain) | 72,93 | 45,67 | **79,68** | 78,39 |
| DASH-B | 75,28 | 58,65 | 84,08 | **86,84** |
| DASH-B acc_no | 54,36 | 19,09 | 77,48 | **82,03** |
| mcq-OOD(10) mean | 65,35 | **68,34** | 65,88 | 66,44 |

El modelo supera al base y a ZwZ-8B en todas las métricas discriminativas, y es el mejor en ZTB-mcq paired, DASH-B y DASH-B acc_no. Sin embargo, en VERVE paired queda ligeramente por debajo de plain GRPO (78,39 frente a 79,68), y en mcq-OOD (fuera de dominio) es superado por ZwZ-8B (66,44 frente a 68,34). Además, la model card advierte que con el prompt por defecto (no el verify v2.1) el rendimiento in-domain paired cae a 30,53, lo que indica una fuerte dependencia del prompt de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,77B parámetros en precisión fp16 se necesitan aproximadamente 18 GB de VRAM; en int8 alrededor de 9-10 GB; en int4 unos 5-6 GB. Al ser multimodal, hay que añadir el coste del procesamiento de imágenes, que puede requerir memoria adicional según la resolución.
- GPUs recomendadas: para fp16, una RTX 3090, RTX 4090, A10, A100 o similar; para cuantización int4/int8, GPUs consumer como RTX 3060 12GB o RTX 4070 pueden ser suficientes.
- Compatibilidad con consumer GPU: sí, con cuantización adecuada (GGUF o AWQ) puede ejecutarse en GPUs de 8-12 GB, aunque el soporte multimodal en formatos cuantizados puede ser limitado.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp (con soporte multimodal), Ollama (si se convierte a GGUF), y transformers de Hugging Face.
- Latencia y throughput: no se han publicado datos específicos para este fine-tune; como referencia, un modelo de 8B en una RTX 4090 suele generar entre 30 y 60 tokens por segundo en fp16, pero la generación de checks y veredictos puede aumentar la latencia por respuesta.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Qwen3-VL-8B-Instruct y con el fine-tune ZwZ-8B del mismo autor, que se entrenó solo con ejemplos positivos (74K). La tabla de benchmarks anterior muestra las diferencias. En resumen:

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento discriminativo |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 8,77B | 256K (documentado) | Apache-2.0 | Generalista | Bajo en premisas falsas (ZTB 11,20; DASH-B acc_no 54,36) |
| ZwZ-8B | 8,77B | No disponible | Apache-2.0 | Solo ejemplos positivos | Peor que el base en discriminación (VERVE 45,67; DASH-B acc_no 19,09) |
| Plain GRPO | 8,77B | No disponible | Apache-2.0 | GRPO sin pares negativos | Bueno en VERVE (79,68) pero inferior en ZTB (39,34) |
| Este modelo (ZwZ-S57-verify) | 8,77B | No disponible | Apache-2.0 | GRPO con pares negativos | Mejor en ZTB (43,83), DASH-B (86,84) y DASH-B acc_no (82,03) |

No se dispone de comparativas con otros modelos de 8B multimodales como LLaVA-NeXT o InternVL en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento se realizó con una única semilla (single seed), por lo que los resultados pueden no ser estadísticamente robustos.
- El benchmark mme-realworld-lite es 8-10 puntos inferior al modelo base en todas las variantes entrenadas, lo que sugiere una sobre-transferencia del comportamiento de negación que perjudica tareas de mundo real no relacionadas con premisas falsas.
- El comportamiento de verificación está ligado al prompt de inferencia (verify v2.1); con el prompt por defecto, el rendimiento in-domain cae a 30,53, lo que indica que el modelo no ha internalizado completamente la estrategia de verificación.
- Riesgo de alucinación residual: aunque mejora la negación de premisas falsas, no elimina por completo las alucinaciones en otros dominios o con prompts no cubiertos en el entrenamiento.
- Limitaciones de idioma: no se especifican los idiomas soportados tras el fine-tune; es probable que herede los del modelo base, pero no hay confirmación.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-VL-8B-Instruct, que también es Apache-2.0.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiaorui638/Qwen3-VL-8B-ZwZ-S57-verify
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio oficial de Qwen3-VL en GitHub: https://github.com/QwenLM/Qwen3-VL
- Informe técnico de Qwen3-VL (arXiv): https://arxiv.org/pdf/2511.21631
