# swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ6e-mtp

## Resumen

El modelo `swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ6e-mtp` es una cuantización mixta de 6 bits (formato MLX) del modelo base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, una versión "uncensored" (sin censura) del modelo Qwen3.8-27B de Alibaba, obtenida mediante técnicas de abliteration. El modelo original es un transformer multimodal (imagen y texto) con una ventana de contexto de 262 000 tokens, y esta variante elimina los rechazos y restricciones de contenido del modelo base, buscando maximizar la utilidad en escenarios donde se requiere libertad de generación.

La cuantización ha sido realizada con la herramienta oQ (oMLX v0.6.0rc1) en modo de precisión mixta, con 6 bits y grupo de tamaño 64, lo que reduce el peso del modelo a aproximadamente 23.7 GB, haciéndolo viable en hardware Apple Silicon mediante MLX. El repositorio reporta 6.6 mil millones de parámetros según los archivos safetensors, aunque el nombre del modelo sugiere 27B; esta discrepancia puede deberse a una arquitectura MoE con parámetros activos inferiores o a un conteo parcial de los tensores. La licencia no está especificada en la ficha, aunque el modelo base Qwen3.8-27B se distribuye bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 6 612 941 552 (segun safetensors; el nombre sugiere 27B, posible MoE) |
| Parametros activos | no disponible (posible arquitectura MoE) |
| Longitud de contexto | 262 000 tokens (del modelo base) |
| Tipos de cuantizacion | 6 bits, grupo 64, precision mixta (oQ / oMLX) |
| Idiomas soportados | no disponible (multilingue, segun modelo base) |
| Licencia | no disponible (el modelo base Qwen3.8-27B es Apache 2.0) |
| Formato de pesos | MLX safetensors (cuantizados) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso o de mezcla de expertos (MoE) desarrollado por Alibaba, con capacidades multimodales (imagen y texto) y una ventana de contexto ampliada a 262 000 tokens. El proyecto AEON-7 aplicó un proceso de abliteration, una técnica que identifica y elimina las direcciones del espacio latente responsables de los comportamientos de rechazo y censura, entrenando el modelo durante 72 horas con metodologías personalizadas y ramas pre-publicación de software de abliteration. El resultado es una variante que, según los autores, presenta "0 rechazos reales" en evaluaciones de respuesta, manteniendo o mejorando el rendimiento general (sin drift de KL).

La cuantización oQ de oMLX utiliza precisión mixta para asignar más bits a las capas críticas y menos a las redundantes, logrando una compresión de 6 bits con grupo 64. Este formato está optimizado para la ejecución en Apple Silicon mediante el framework MLX, permitiendo inferencia local eficiente en Macs con memoria unificada suficiente.

## Capacidades

- Generacion de texto y razonamiento complejo, heredadas del modelo Qwen3.8-27B.
- Comprension de imagenes (pipeline image-text-to-text), incluyendo descripcion, analisis visual y respuesta a preguntas sobre contenido visual.
- Soporte de tool calling y function calling, util para integracion en agentes y pipelines automatizados.
- Capacidades multilingues (el modelo base soporta multiples idiomas, aunque no se detallan en la ficha).
- Modo "uncensored": no aplica rechazos ni filtros de contenido, permitiendo respuestas directas en temas sensibles o controvertidos.
- Ventana de contexto de 262 000 tokens, adecuada para documentos largos, conversaciones multi-turno y razonamiento con contexto amplio.

## Casos de uso

- Atencion al cliente automatizada sin restricciones: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262k tokens) y responder sin filtros, lo que permite tratar quejas complejas o temas delicados sin evasivas.
- Generacion de codigo en produccion: gracias al tool calling y a la capacidad de razonamiento, puede integrarse en pipelines de CI/CD para generar, revisar o documentar codigo, incluso en entornos donde se requieren soluciones creativas no limitadas por politicas de contenido.
- Analisis de documentos extensos: con su contexto de 262k tokens, puede resumir, extraer informacion y responder preguntas sobre contratos, informes o libros completos en una sola pasada.
- Asistente de investigacion academica: permite explorar hipotesis y generar contenido especulativo o critico sin autocensura, util en campos como filosofia, sociologia o estudios de opinion.
- Creacion de contenido creativo: redaccion de narrativa, guiones o dialogos con libertad tematica, incluyendo generos de terror, erotismo o satira politica, donde los modelos censurados suelen fallar.
- Simulacion de personajes y juegos de rol: el modo uncensored permite interpretar personajes con personalidades extremas o controversiales sin romper la inmersión, mejorando la experiencia en aplicaciones de rol conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona en la red social X que "todo el drift de KL fue una mejora sobre el original", pero no se aportan cifras concretas. Tampoco se incluyen comparaciones con otros modelos en la model card.

## Requisitos de hardware

- El modelo cuantizado a 6 bits ocupa aproximadamente 23.7 GB en disco, por lo que se requiere una Mac con al menos 32 GB de memoria unificada para cargar el modelo en RAM y ejecutar inferencia sin intercambio a disco.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3/M4 series) con MLX; no es compatible con CUDA directamente.
- En consumer GPU de NVIDIA no se puede ejecutar el formato MLX; seria necesario convertir a GGUF u otro formato.
- Opciones de despliegue: MLX (biblioteca oficial de Apple), integrable en aplicaciones Swift o Python; tambien se puede usar con llama.cpp si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles; dependen del chip concreto (por ejemplo, M2 Ultra ofrece mayor ancho de banda de memoria que M1).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B (nominal) | 262k | Apache 2.0 | BF16 | Modelo base con censura estandar |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | 27B (nominal) | 262k | no disponible | BF16 | Version abliterada sin censura |
| swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ6e-mtp | 6.6B (segun safetensors) | 262k | no disponible | MLX 6-bit | Cuantizacion para Apple Silicon |

No se dispone de comparativas con otros modelos de la misma categoria (por ejemplo, Llama 3.1 8B o Mistral 7B) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version "uncensored", el modelo puede generar contenido ofensivo, discriminatorio o perjudicial sin filtro, lo que lo hace inadecuado para aplicaciones publicas sin moderacion humana.
- Riesgo de alucinacion: como cualquier LLM, puede inventar datos o hechos, especialmente en temas de actualidad o con contexto ambiguo; la ausencia de censura no mejora la veracidad.
- Limitaciones de contexto: aunque la ventana es de 262k tokens, el rendimiento en contextos muy largos puede degradarse en tareas de recuperacion de informacion especifica.
- Restricciones de licencia: la licencia no esta especificada en el repositorio; aunque el modelo base es Apache 2.0, la variante AEON y la cuantizacion pueden tener condiciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- Advertencia de produccion: el modo uncensored no implica mayor inteligencia; puede producir respuestas incoherentes o peligrosas en dominios criticos (medicina, derecho, seguridad). No debe usarse sin validacion humana.
- Compatibilidad: el formato MLX limita el despliegue a ecosistema Apple; para otros entornos se requiere conversion, lo que puede afectar la calidad de la cuantizacion.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ6e-mtp
- Modelo base (AEON-7): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Repositorio de oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- Articulo sobre Qwen3.8-27B (specs y requisitos): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Anuncio del autor en X: https://x.com/spacetimeviking/status/2088707705867501754
