# Vita0818/Vireqo-27VL-Plus-260818

## Resumen

Vireqo-27VL-Plus-260818 es un bundle experimental de visión-lenguaje creado por Vita0818 que combina el modelo de lenguaje ternario Vireqo-27B-Plus-260816 con el proyector de visión Qwen3-VL publicado por Prism ML. No se trata de un modelo multimodal reentrenado, sino de un paquete de dos archivos GGUF que añade capacidad de entrada de imágenes a un modelo de lenguaje ya cuantizado de forma extrema (ternario, 2 bits). El modelo base es Qwen/Qwen3.8-27B, pero con pesos ternarios procedentes de prism-ml/Ternary-Bonsai-27B-gguf. El bundle ocupa aproximadamente 7,65 GiB en total, lo que lo hace viable en hardware de consumo con 8-12 GB de memoria unificada o VRAM.

La relevancia de este modelo radica en su enfoque de cuantización extrema: al reducir el modelo de lenguaje a 2 bits (ternario), se consigue un tamaño muy reducido (7,06 GiB para el GGUF principal) manteniendo una interfaz de proyección de visión compatible con el estándar Qwen3-VL. Está pensado para ejecutarse en llama.cpp y LM Studio, especialmente en Apple Silicon, aunque su naturaleza experimental y su validación limitada a imágenes sintéticas lo convierten en una propuesta para pruebas y prototipos más que para producción. El contexto práctico es de 2048 tokens, y el modo de razonamiento (thinking) debe permanecer desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con controles SSM recurrentes (base Qwen3.8-27B) con pesos ternarios + proyector de vision Qwen3-VL (arquitectura CLIP, 27 bloques) |
| Parametros totales | 26.895.998.464 (26,9 B) en safetensors; el GGUF ternario pesa 7,0644 GiB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (recomendado; reducible a 1024 bajo presion de memoria) |
| Tipos de cuantizacion | Modelo principal: ternario (2-bit, q2_0); proyector de vision: Q8_0 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos archivos: modelo de lenguaje y mmproj) |

## Arquitectura y entrenamiento

El modelo de lenguaje es una version ternaria de Qwen3.8-27B, donde los pesos se han cuantizado a valores ternarios (-1, 0, +1) mediante el proyecto Ternary-Bonsai de Prism ML. Esta cuantizacion extrema reduce el peso del GGUF a 7,06 GiB, aproximadamente una cuarta parte del modelo original en FP16. El GGUF conserva la configuracion interna de Qwen3-VL: dimension de embedding 5120, secciones M-RoPE [11, 11, 10, 0], tokens especiales de imagen/video de Qwen3-VL y la plantilla de chat vision-aware de Qwen3.8. Tambien mantiene los controles SSM recurrentes del modelo ternario original, lo que sugiere una arquitectura hibrida entre atencion y estado recurrente.

El componente de vision es un proyector Qwen3-VL (archivo mmproj) con arquitectura CLIP: 27 bloques de vision, tamanio de imagen de entrada 768 píxeles, patch size 16, dimension de embedding de vision 1152, dimension de proyeccion al lenguaje 5120, y un mecanismo de fusion espacial (spatial merge) de factor 2. Este proyector se publica en Q8_0 y pesa 629 MB. No se ha realizado ningun entrenamiento adicional: el modelo de lenguaje no ha sido afinado para tareas multimodales, y la capacidad visual proviene exclusivamente del proyector preentrenado de Qwen3-VL. La validacion se ha realizado sobre un conjunto de imagenes sinteticas controladas (colores, formas, posiciones, OCR chino, tablas, graficos de barras y aritmetica simple).

## Capacidades

- Generacion de texto en chino e ingles, con razonamiento basico cuando el modo thinking esta desactivado.
- Comprension de imagenes: identificacion de colores, formas, posiciones relativas y relaciones espaciales en imagenes sinteticas.
- OCR en chino e ingles para textos cortos, como identificadores y cantidades monetarias.
- Lectura de tablas simples y extraccion de valores numericos.
- Interpretacion de graficos de barras con titulo y valores, incluyendo comparaciones y calculos de diferencias.
- Aritmetica simple sobre datos visuales (por ejemplo, calcular la diferencia entre dos valores de un grafico).
- Respuesta a preguntas de texto plano con el proyector cargado, sin degradacion aparente.
- No soporta el modo de razonamiento (thinking): debe permanecer desactivado para evitar que el modelo consuma todo el presupuesto de tokens en tokens de razonamiento.
- No se documenta soporte de tool calling ni de agentes; el modelo se presenta como un bundle experimental de vision-lenguaje para inferencia directa.

## Casos de uso

- Prototipado de asistentes visuales en entornos con recursos limitados: gracias a su tamano reducido (7,65 GiB), puede ejecutarse en portatiles con 12 GB de RAM unificada (probado en Apple M5) o GPUs consumer de 8-12 GB, permitiendo experimentar con interacciones imagen-texto sin necesidad de hardware de datacenter.
- Lectura automatizada de documentos con OCR ligero: el modelo puede extraer identificadores, cantidades y textos cortos de capturas de pantalla o imagenes de documentos, util para flujos de verificacion interna.
- Analisis rapido de tablas y graficos en imagenes: por ejemplo, extraer valores de un grafico de barras o de una tabla simple para alimentar un informe o un dashboard, con validacion manual posterior.
- Asistencia a personas con discapacidad visual: el modelo puede describir colores, formas y posiciones de objetos en una escena capturada por una camara, aunque con limitaciones en imagenes naturales.
- Educacion y demostraciones de IA multimodal: al ser un bundle de codigo abierto con licencia Apache-2.0, sirve como material didactico para mostrar como acoplar un proyector de vision a un modelo de lenguaje cuantizado.
- Evaluacion de cuantizacion extrema en tareas multimodales: investigadores pueden comparar el rendimiento de un modelo ternario frente a versiones de mayor precision en tareas visuales basicas, aunque sin benchmarks estandarizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, MMMU, etc.) en la informacion disponible. La model card documenta una suite de validacion propia sobre imagenes sinteticas, con los siguientes resultados:

| Prueba | Resultado |
|---|---|
| Circulo rojo / triangulo verde / cuadrado azul, incluyendo posiciones | PASS |
| OCR de identificador chino `VL-260818` | PASS |
| Cantidad `¥128.50` | PASS |
| Tabla: manzanas 3, naranjas 2 | PASS |
| Titulo y valores de grafico 2024=40, 2025=70, 2026=55 | PASS |
| Ano mayor 2025 y diferencia 15 | PASS |
| Respuesta de solo texto con proyector cargado | PASS |

Estas pruebas cubren imagenes sinteticas controladas, no imagenes naturales, y no constituyen una evaluacion de referencia publica.

## Requisitos de hardware

- VRAM estimada: el bundle completo ocupa 7,65 GiB en disco; en tiempo de ejecucion, la memoria maxima observada fue de 8,52 GiB (RSS) en un Apple M5 con 12 GiB reservados. En una GPU discreta, se necesitarian al menos 8 GB de VRAM para cargar ambos archivos, aunque con contexto reducido y sin offload parcial.
- GPU recomendadas: se probo en Apple M5 (GPU integrada con memoria unificada). En GPUs NVIDIA, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB serian suficientes; tambien es viable en RTX 4090 con margen amplio.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM, aunque el contexto de 2048 tokens y la carga completa de los dos archivos pueden requerir ajustes (reducir contexto a 1024, usar K/V cache en Q8_0).
- Opciones de despliegue: llama.cpp (servidor con `--mmproj`), LM Studio (carga automatica del proyector), y cualquier frontend compatible con GGUF multimodal (Ollama no esta verificado, pero es posible con configuracion manual).
- Latencia y throughput: en Apple M5 con 100% de offload a GPU, se midieron aproximadamente 13 tokens/s en generacion de respuestas con imagen. El tiempo de carga fue de 18,37 s en LM Studio. En GPUs NVIDIA el rendimiento puede variar, pero no se dispone de datos publicados.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Cuantizacion | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vireqo-27VL-Plus-260818 (este) | 7,65 GiB (bundle) | 2048 | Ternario (2-bit) + Q8_0 | Si (proyector Qwen3-VL) | Apache-2.0 | GGUF en HuggingFace |
| Qwen3-VL-27B (original) | ~54 GB en BF16 | 32768 (tipico) | BF16/FP16 | Si (nativo) | Apache-2.0 | Pesos originales y GGUF |
| Ternary-Bonsai-27B (sin vision) | ~7 GB | 2048 (recomendado) | Ternario | No | Apache-2.0 | GGUF en HuggingFace |
| Bonsai-27B (sin vision) | ~7 GB | 2048 (recomendado) | Ternario | No | Apache-2.0 | GGUF en HuggingFace |

La comparativa muestra que este bundle es una opcion intermedia: mantiene el tamano reducido de los modelos ternarios pero anade vision mediante un proyector externo, a costa de un contexto limitado y sin garantias de rendimiento en tareas complejas. Frente a Qwen3-VL-27B original, pierde precision y contexto, pero gana en eficiencia de memoria.

## Limitaciones y advertencias

- Modelo experimental: no ha sido entrenado ni afinado para tareas multimodales; la capacidad visual depende de un proyector externo no integrado durante el entrenamiento.
- El modo de razonamiento (thinking) debe permanecer desactivado; si se activa, el modelo puede consumir todo el presupuesto de tokens en tokens de razonamiento y no generar respuesta.
- Contexto limitado a 2048 tokens en la configuracion probada, muy inferior al contexto nativo de Qwen3-VL (hasta 128K en algunas versiones). Esto restringe el analisis de imagenes de alta resolucion o conversaciones largas.
- Validacion solo sobre imagenes sinteticas: no hay evidencia de rendimiento en imagenes naturales, fotografias o escenarios reales de OCR o grounding.
- Idiomas limitados a chino e ingles; no se garantiza un comportamiento correcto en otros idiomas.
- La cuantizacion ternaria puede degradar significativamente la calidad del texto generado en comparacion con el modelo original en FP16, especialmente en tareas de razonamiento complejo o generacion de codigo.
- Riesgo de alucinacion: al ser un modelo pequeno y cuantizado, puede inventar informacion visual no presente en la imagen, especialmente con imagenes ambiguas o de baja resolucion.
- No se documenta soporte de tool calling, agentes ni funciones externas; su uso se limita a inferencia conversacional directa.
- La licencia Apache-2.0 permite uso comercial, pero al ser un bundle no oficial y sin garantias, se recomienda validacion exhaustiva antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vita0818/Vireqo-27VL-Plus-260818
- Repositorio del proyector de vision (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Repositorio alternativo del proyector: https://huggingface.co/prism-ml/Bonsai-27B-gguf
- Perfil de GitHub del autor: https://github.com/Vita0818/
- Documentacion de validacion (referenciada en la model card): archivos `vision-validation.md` y `lmstudio-native-vision-validation.md` dentro del repositorio del modelo.
