# treeish/Qwen3.8-27B-oQ2e-MTP-MLX

## Resumen

Qwen3.8-27B-oQ2e-MTP-MLX es un paquete de pesos cuantizados publicado por el usuario treeish, pensado para el flujo de trabajo de agente de programación que el proyecto Treeish utiliza bajo el nombre Sprig. No se trata de un modelo entrenado desde cero, sino de una distribución curada del modelo denso Qwen/Qwen3.8-27B, convertido a MLX con una cuantización mixta de precisión denominada oQ2e, mejorada con una matriz de importancia (imatrix) y con la cabeza de predicción multi-token (MTP) embebida en el propio paquete. El resultado son aproximadamente 11,6 GB de pesos en tres shards, frente a los 27.781.427.952 parámetros del modelo base en precisión completa.

El interés de esta ficha reside en que documenta una práctica cada vez más habitual en el ecosistema local: redistribuir un modelo de gran tamano en un formato optimizado para Apple Silicon (MLX), con overrides de cuantización por tensor y una plantilla de chat corregida, de modo que quede listo para cargar tal cual. El paquete mantiene una ventana de contexto de 262.144 tokens, incluye 333 tensores de torre de visión (por lo que acepta entrada de imagen y texto) y declara licencia Apache 2.0 heredada del modelo base.

La relevancia actual es doble. Por un lado, permite ejecutar un modelo de ~27B con contexto muy largo en equipos con 32 GB de memoria unificada, algo impensable con los pesos originales. Por otro, su model card es inusualmente transparente sobre procedencia: documenta digests, commits exactos del repositorio origen y del tokenizador, y advierte explícitamente de que el benchmark de release todavía no se ha ejecutado, por lo que no hay cifras de calidad publicadas para esta cuantización concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta de familia qwen3_5 en el repositorio); incluye torre de visión y una capa MTP embebida |
| Parametros totales | 27.781.427.952 (modelo base, dato de safetensors); el paquete cuantizado ocupa 11.633.210.677 bytes de datos tensoriales |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ2e de precisión mixta con imatrix; por defecto 2-bit affine con group size 64; overrides por tensor a 4, 5 y 8 bits con group size 64 |
| Idiomas soportados | No disponible (la model card no los enumera; el calibrado imatrix procede del conjunto oqe_code_multilingual) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors, 3 shards, 2.209 tensores indexados |
| Tensores de visión | 333 |
| Tensores MTP embebidos | 29 (capa bajo `language_model.mtp.*`) |
| Pipeline declarado | image-text-to-text |
| Fecha de creación | 2026-09-11 |
| Fecha de actualización | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27,8 mil millones de parámetros con capacidades multimodales (entrada de imagen y texto) y una ventana de contexto de 262.144 tokens. Sobre esa base, el paquete añade dos elementos que condicionan su comportamiento en tiempo de inferencia. El primero es una capa de predicción multi-token (MTP) embebida, almacenada bajo el prefijo `language_model.mtp.*` y distribuida en 29 tensores: se trata del mecanismo de decodificación especulativa que permite proponer varios tokens por paso y validarlos después, con la ganancia de throughput que eso conlleva cuando el runtime lo soporta. El segundo es la torre de visión, conservada íntegra en 333 tensores, lo que explica que el pipeline declarado sea image-text-to-text.

No hay entrenamiento propio en este repositorio. La model card indica que los pesos cuantizados, la configuración del modelo y el informe de calibración oQ son byte a byte idénticos a mlx-works/Qwen3.8-27B-oQ2e-mtp en el commit `5d3e3f3f36dbc1375355ada5d370ec00549de66b`, y que el convertidor declarado es oMLX 0.5.7. La calibración imatrix se realizó con 128 muestras de 512 tokens extraídas de `oqe_code_multilingual`, aplicando 503 de las 504 entradas previstas, lo que orienta la preservación de precisión hacia código multilingüe en lugar de hacia texto general. El repositorio de treeish no modifica ningún tensor del modelo, del tokenizador ni de la configuración: su aportación es la plantilla de chat (Froggeric v22.5, byte a byte idéntica a froggeric/Qwen-Fixed-Chat-Templates en el commit `855bffc49448e299789730ff92c9b8d834d6cc14`) más los ficheros de licencia, procedencia y manifiesto. El `tokenizer_config.json` proviene de Qwen/Qwen3.8-27B en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`.

## Capacidades

- Generación de texto y conversación multi-turno con una ventana de contexto de hasta 262.144 tokens, adecuada para codebases completas o documentación extensa.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text; 333 tensores de torre de visión preservados en el paquete cuantizado).
- Generación y edición de código, con calibrado de cuantización orientado específicamente a corpus de código multilingüe (`oqe_code_multilingual`).
- Decodificación especulativa mediante la cabeza MTP embebida, que permite proponer y validar varios tokens por paso cuando el runtime la soporta.
- Flujo de agente de programación: el paquete incluye la plantilla de chat que Treeish usa en su workflow de agente (Sprig), por lo que está preparado para conversaciones con formato de herramientas tal como espera ese template.
- Capacidades multilingües: no disponibles como lista explícita; el modelo base es de la familia Qwen, pero la model card no documenta idiomas soportados para este paquete.
- Razonamiento y matemáticas: no documentado específicamente en la información disponible.

## Casos de uso

- Agente de programación en local: cargar el paquete en MLX y usarlo con la plantilla Froggeric v22.5 para tareas de edición de código multi-archivo, aprovechando que la calibración imatrix se hizo sobre corpus de código multilingüe y que el contexto de 262.144 tokens permite incluir varios ficheros sin truncar.
- Asistente sobre repositorios grandes: indexar un repositorio completo y mantenerlo en contexto para responder preguntas de arquitectura, localizar dependencias o proponer refactorizaciones, gracias a la ventana de contexto extendida.
- Análisis de capturas y diagramas: al conservar la torre de visión, el modelo puede recibir imágenes junto al texto, lo que resulta útil para interpretar diagramas de arquitectura, capturas de errores o bocetos de interfaz y traducirlos a código.
- Prototipado en equipos Apple Silicon: desarrolladores con un Mac de 32 GB de memoria unificada pueden ejecutar un modelo de ~27B en 2 bits sin depender de GPU dedicada ni de servicios en la nube, con 48 GB recomendados para mayor holgura.
- Generación asistida con baja latencia percibida: en runtimes que implementen correctamente la capa MTP embebida, la decodificación especulativa reduce el tiempo por token en generación de código repetitivo o autocompletado.
- Evaluación de cuantizaciones agresivas: este paquete sirve como referencia práctica para medir la pérdida de calidad de un esquema 2-bit mixto frente al modelo base en tareas de código, siempre que el equipo realice su propia validación con sus prompts.
- Despliegue de demostraciones offline: entornos sin conectividad o con requisitos de confidencialidad pueden alojar el paquete de forma totalmente local, ya que no contiene código ejecutable personalizado y todo el material es safetensors más configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el benchmark de release de Treeish todavía no se ha ejecutado sobre este paquete y que `RELEASE_MANIFEST.json` se actualizará cuando ocurra. Tampoco se documentan cifras de latencia ni de throughput.

## Requisitos de hardware

- Memoria: Treeish indica que utiliza el modelo desde 32 GB de memoria unificada y recomienda 48 GB. El margen disponible depende de la longitud de contexto, la configuración de caché y las demás aplicaciones en ejecución.
- Tamano de pesos: 11,6 GB de datos tensoriales en 3 shards, más overhead de índices y configuración.
- GPU dedicadas: no disponible. El formato MLX está orientado a Apple Silicon, por lo que no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el objetivo son equipos Mac con memoria unificada de 32 GB o superior (se recomienda 48 GB).
- Opciones de despliegue: runtime MLX Swift pinneado por Treeish. Cualquier otro runtime debe soportar los overrides de cuantización por tensor definidos en `config.json` y el layout MTP embebido de Qwen. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| treeish/Qwen3.8-27B-oQ2e-MTP-MLX | 27,78 B (base) | 262.144 tokens | oQ2e 2-bit mixta con imatrix, overrides 4/5/8 bits | Apache 2.0 | MLX safetensors | Publicado, 0 descargas, 0 likes en el momento de la consulta |
| mlx-works/Qwen3.8-27B-oQ2e-mtp | 27,78 B (base) | 262.144 tokens | oQ2e 2-bit mixta con imatrix | Apache 2.0 (heredada) | MLX safetensors | Origen byte a byte de los pesos, configuración y calibración |
| Qwen/Qwen3.8-27B | 27,78 B | 262.144 tokens | Pesos sin cuantizar | Apache 2.0 | safetensors | Modelo base oficial |

No se dispone de datos de rendimiento comparado entre estas variantes, ya que no se han publicado benchmarks para el paquete cuantizado.

## Limitaciones y advertencias

- La cuantización a 2 bits sacrifica calidad del modelo a cambio de memoria y velocidad de generación local; el propio autor recomienda validar el modelo con los prompts, el formato de herramientas y el runtime propios de cada aplicación.
- No hay resultados de benchmark publicados para este paquete, por lo que la magnitud real de la degradación frente al modelo base es desconocida.
- La model card no identifica el commit exacto del modelo base usado en la conversión: se trata de una distribución curada y fijada por bytes, no de una receta de conversión reproducible byte a byte.
- Dependencia fuerte del runtime: el paquete está construido para el runtime MLX Swift pinneado por Treeish. Un runtime distinto debe soportar los overrides de cuantización por tensor y el layout MTP embebido, o la carga fallará o dará resultados incorrectos.
- Idiomas soportados no documentados; la calibración imatrix se centró en código multilingüe, lo que puede sesgar la preservación de precisión hacia ese dominio y no hacia texto general.
- Riesgo de alucinación: no evaluado ni documentado para esta cuantización.
- Sesgos conocidos: no documentados en la información disponible.
- El repositorio registra 0 descargas y 0 likes, sin validación de terceros ni benchmark de release ejecutado, lo que reduce la confianza sobre su comportamiento en producción.
- Licencia Apache 2.0 permite uso comercial, pero el aviso de licencia apunta al fichero LICENSE del modelo base; conviene verificar los términos del modelo original antes de un despliegue comercial.
- Las fechas de creación y actualización del repositorio (2026-09-11) son las declaradas por la plataforma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/treeish/Qwen3.8-27B-oQ2e-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Repositorio origen de los pesos cuantizados: https://huggingface.co/mlx-works/Qwen3.8-27B-oQ2e-mtp
- Plantillas de chat de Froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Resultados de la búsqueda web: no relevantes para este modelo (los enlaces devueltos corresponden a foros sin relación con el contenido técnico solicitado).
