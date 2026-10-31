# webmp3/Sakura-Spark-X2.6-1.7B-GGUF

## Resumen

Sakura-Spark-X2.6-1.7B-GGUF es una cuantización comunitaria, publicada por el usuario webmp3, del modelo base XHToken/Spark-X2.6-1.7B-Base. No se trata de una versión oficial del autor original, sino de una redistribución en formato GGUF pensada para ejecutarse localmente con llama.cpp y herramientas compatibles. El modelo original pesa 3,4 GB en BF16 y esta versión ofrece cuatro niveles de cuantización (Q2_K, Q3_K_M, Q4_K_M y Q5_K_M) que reducen el tamaño entre un 63 % y un 77 %.

El valor de esta ficha radica en la trazabilidad: la cuantización se realizó mediante requantización desde un GGUF BF16 de origen verificado (SHA-256 publicado), usando matrices de importancia (imatrix) calculadas con `llama-imatrix` sobre un texto de calibración fijo, y cada archivo fue validado estructuralmente y probado en inferencia real con llama.cpp (build `b11669-620d2225c`).

El modelo subyacente tiene 1.707.657.216 parámetros y soporta inglés y chino. Su utilidad principal es la inferencia en hardware modesto: con un tamaño de entre 0,8 y 1,3 GB según el nivel de cuantización, es apto para portátiles, mini PC y móviles, o para servir muchos modelos simultáneamente en un mismo servidor. Es relevante como ejemplo de cuantización comunitaria documentada y reproducible, aunque conviene tener en cuenta que no se publican benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (según metadatos GGUF) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (con imatrix) |
| Idiomas soportados | inglés, chino |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (requantizado desde GGUF BF16 de 3,4 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos GGUF es `spark2_5`, una familia que requiere builds recientes de llama.cpp para poder cargarse. El modelo base, Spark-X2.6-1.7B-Base, es un modelo de unos 1,7 mil millones de parámetros; no se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni procesos de alineación (RLHF, DPO), y de hecho el sufijo "Base" sugiere un modelo preentrenado sin ajuste por instrucciones, algo a tener en cuenta al usarlo de forma conversacional.

En cuanto al proceso de cuantización, este repositorio no convirtió un checkpoint safetensors, sino que realizó una requantización a partir del GGUF BF16 original (`Spark-X2.6-1.7B.gguf`, commit `7e0f9a16bda4e6e2dd32db4604f63e458fe39d42`, SHA-256 `7d88f9eb...a220`). Se emplearon las herramientas estándar de llama.cpp con matriz de importancia: `llama-imatrix` calculó la imatrix sobre un texto de calibración fijo de 6144 bytes (inglés, alemán y chino, código y formatos de datos, dominio público; 12 fragmentos de 128 tokens) y `llama-quantize --imatrix` aplicó la cuantización. El propio autor advierte que el texto de calibración es corto y que no se afirma ninguna mejora de calidad sin un benchmark que lo respalde. Como es habitual en llama.cpp, algunos tensores (por ejemplo, las normalizaciones) se mantienen en F32 o en precisiones superiores al tipo nominal de cada cuant.

## Capacidades

- Generacion de texto en inglés y chino, heredada del modelo base Spark-X2.6-1.7B-Base.
- Uso conversacional declarado mediante el tag `conversational` del repositorio, aunque al partir de un modelo base puede requerir plantillas de prompt adecuadas.
- Ejecucion local eficiente en formato GGUF con cuatro niveles de cuantización (Q2_K a Q5_K_M), desde 0,8 GB hasta 1,3 GB por archivo.
- Compatibilidad con el ecosistema llama.cpp (`llama-cli`, `llama-server`) y herramientas derivadas, siempre con builds que soporten la arquitectura `spark2_5`.
- No consta soporte de tool calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Ejecucion en hardware de gama baja: la variante Q2_K (0,8 GB) cabe en la RAM de casi cualquier portátil o mini PC sin GPU dedicada, lo que la hace útil para pruebas locales rápidas del modelo.
- Asistentes locales en chino e inglés: para aplicaciones que necesiten un modelo pequeño residente en memoria capaz de mantener conversaciones en ambos idiomas, la variante Q4_K_M (1,1 GB) ofrece un equilibrio razonable entre tamaño y fidelidad.
- Servicios con alta densidad de modelos: en un servidor con GPU moderada o CPU potente, el bajo footprint permite cargar múltiples instancias o varios modelos pequeños simultáneamente para enrutar peticiones.
- Integracion en pipelines de texto con llama.cpp: mediante `llama-cli` o `llama-server` se puede exponer como endpoint local para tareas de generación, resumen o transformación de texto en entornos sin conexión.
- Prototipado y evaluacion de cuantizaciones: gracias a la documentación exhaustiva (SHA-256 de archivos, imatrix y calibración), es un buen caso de estudio para comparar el impacto de distintos niveles K-quant en un mismo modelo base.
- Uso en dispositivos edge y embebidos: los tamaños de entre 0,8 y 1,3 GB permiten desplegar el modelo en SBC (Raspberry Pi 5, dispositivos ARM con 4-8 GB de RAM) para tareas de generación de texto sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica expresamente que no se afirma ninguna puntuación de calidad, perplejidad ni benchmark de código, y que cada archivo fue verificado únicamente cargándolo en llama.cpp y generando texto una vez como prueba funcional.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q2_K 0,8 GB, Q3_K_M 0,9 GB, Q4_K_M 1,1 GB, Q5_K_M 1,3 GB de pesos, más la memoria de contexto (KV cache), que dependerá de la longitud de contexto configurada (dato no disponible).
- GPU recomendadas: no es necesario usar GPU; cualquier GPU moderna con 2-4 GB de VRAM (por ejemplo, una RTX 3060 de 12 GB o superior, o una RTX 4060) acelera la inferencia con offload de capas. En CPU, cualquier procesador moderno con 4 GB de RAM libres es suficiente.
- Cabe holgadamente en GPUs de consumo: desde una GTX 1650 de 4 GB (Q2_K/Q3_K_M) hasta integradas compartiendo RAM. No se necesita A100 ni H100.
- Opciones de despliegue: llama.cpp de forma nativa (`llama-cli`, `llama-server`); Ollama y LM Studio pueden cargar GGUF si soportan la arquitectura `spark2_5`; vLLM y TGI no soportan GGUF directamente. Se requiere un build de llama.cpp reciente que implemente `spark2_5`.
- Latencia y throughput: no disponibles; al ser un modelo de 1,7 B de parámetros cuantizado, es de esperar velocidades altas en CPU moderna (decenas de tokens por segundo), pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Licencia | Idiomas |
|---|---|---|---|---|---|
| Sakura-Spark-X2.6-1.7B-GGUF | 1,71 B | Q2_K a Q5_K_M (imatrix) | 0,8-1,3 GB | apache-2.0 | en, zh |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,54 B | Q2_K a Q8_0 | ~0,7-1,6 GB | apache-2.0 (Qwen) | multilingue (29+) |
| Gemma 2 2B (GGUF) | 2,61 B | Q2_K a Q8_0 | ~1,1-2,8 GB | gemma | multilingue |
| Llama 3.2 1B Instruct (GGUF) | 1,24 B | Q2_K a Q8_0 | ~0,5-1,3 GB | llama 3.2 | multilingue (8) |

Comparado con las alternativas, Sakura-Spark-X2.6-1.7B destaca por su documentación de trazabilidad (SHA-256, imatrix y verificación de inferencia), pero carece de benchmarks publicados y de la madurez del ecosistema de Qwen, Gemma o Llama, que cuentan con datos de rendimiento y soporte más amplio. La comparativa en rendimiento no disponible.

## Limitaciones y advertencias

- No hay benchmarks de calidad publicados; el propio autor advierte que el texto de calibración de la imatrix es corto y que no se afirma ninguna mejora de calidad sin medición. El impacto real de Q2_K/Q3_K_M sobre la calidad es desconocido.
- El modelo base es un modelo "Base", no un modelo instruido: puede seguir mal las instrucciones conversacionales sin una plantilla de prompt adecuada, y su comportamiento en chat no está verificado.
- Es una cuantización comunitaria no oficial; cualquier problema de calidad debe atribuirse a la requantización, no necesariamente al modelo original.
- La arquitectura `spark2_5` requiere builds recientes de llama.cpp; versiones antiguas de Ollama, LM Studio u otras herramientas pueden no cargar los archivos.
- Riesgo de alucinación, sesgos y limitaciones de contexto: no disponibles, ya que la model card del modelo original no detalla estos aspectos.
- La licencia apache-2.0 permite uso comercial y redistribución con atribución, pero conviene verificar la licencia efectiva del modelo base upstream, sobre la que el autor de la cuantización no toma posiciones más allá de mantener la atribución.
- Los niveles de cuantización más agresivos (Q2_K) degradan notablemente la calidad en modelos pequeños; se recomienda validar con casos de uso reales antes de pasar a producción.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/webmp3/Sakura-Spark-X2.6-1.7B-GGUF
- Modelo base original: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Repositorio GGUF upstream: https://huggingface.co/XHToken/Spark-X2.6-1.7B-GGUF
- Model card del upstream en el commit de referencia: https://huggingface.co/XHToken/Spark-X2.6-1.7B-GGUF/blob/7e0f9a16bda4e6e2dd32db4604f63e458fe39d42/README.md
- llama.cpp (herramientas de cuantizacion e inferencia): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo: no disponible
