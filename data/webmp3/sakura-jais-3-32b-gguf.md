# webmp3/Sakura-Jais-3-32B-GGUF

## Resumen

Sakura-Jais-3-32B-GGUF es una cuantización comunitaria, publicada por el usuario webmp3, del modelo inception42/Jais-3-32B, un modelo conversacional de 34,8 mil millones de parámetros con licencia Apache 2.0. No se trata de una publicación oficial del autor original, sino de una redistribución independiente en formato GGUF pensada para ejecutarse localmente con llama.cpp y herramientas compatibles.

El repositorio ofrece cuatro niveles de cuantización (Q2_K, Q3_K_M, Q4_K_M y Q5_K_M), generados mediante requantización a partir de un GGUF Q8_0 de origen verificado criptográficamente (SHA-256 incluido en la model card). Todos los archivos han sido validados estructuralmente y probados en inferencia real con llama.cpp (build `b11669-620d2225c`), lo que aporta una garantía razonable de que funcionan tal cual se descargan.

El modelo base declara soporte de inglés y chino, y su arquitectura se identifica como `k2_horizon`. Es relevante para quien necesite un modelo de ~35B parámetros en hardware de consumo o de gama media, aunque conviene tener presente que la cuantización se hizo sin calibración por matriz de importancia (imatrix), lo que puede añadir algo de error de cuantización adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2_horizon` (detalles no disponibles) |
| Parametros totales | 34.779.304.960 (~34,8 B) |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (GGUF) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); origen en safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base se identifica en la model card como `k2_horizon`, una denominación para la que no se publica documentación técnica adicional en este repositorio. Lo que sí consta es el tamaño: 34,8 mil millones de parámetros, con el checkpoint original distribuido en safetensors y una versión Q8_0 en GGUF de 37,0 GB que sirve como fuente de estas cuantizaciones.

Sobre el proceso de cuantización, este repositorio no convirtió el checkpoint BF16/safetensors original, sino que realizó una **requantización** a partir del archivo `Jais-3-32B.Q8_0.gguf` de `mradermacher/Jais-3-32B-GGUF` (commit `73f86590df20fe5a44fc0e1555fbc8c2b024466a`), con la procedencia verificada. No se ejecutó calibración por matriz de importancia (imatrix), y la propia model card advierte que requantizar una fuente ya cuantizada puede introducir error adicional de cuantización. Los presets de llama.cpp mantienen ciertos tensores (por ejemplo, los pesos de normalización) en F32, por lo que cada archivo mezcla varios tipos de tensor. No hay información disponible sobre datos de entrenamiento, número de tokens ni alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional (el repositorio está etiquetado como `conversational`).
- Soporte de inglés y chino como idiomas declarados.
- Ejecución local vía llama.cpp: todos los archivos GGUF han pasado una prueba de inferencia real (carga y generación de texto).
- No hay información disponible sobre tool calling, capacidades de agentes, razonamiento estructurado, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- **Chatbot local bilingüe inglés-chino**: al estar etiquetado como conversacional y declarar soporte de en/zh, puede servir como asistente de chat autoalojado para usuarios que trabajen entre ambos idiomas.
- **Inferencia en GPU de consumo**: la variante Q4_K_M (21,1 GB) cabe en una RTX 3090/4090 de 24 GB, lo que permite experimentar con un modelo de ~35B sin hardware de datacenter.
- **Pruebas de calidad frente a tamaño**: la gama de cuantizaciones (Q2_K a Q5_K_M) permite comparar la degradación de calidad frente al consumo de memoria en un mismo modelo base.
- **Integración en pipelines con llama.cpp**: los archivos se validan con `llama-cli -m <file>.gguf -p "Hello" -n 32`, de modo que pueden integrarse en scripts y servidores basados en llama.cpp.
- **Redistribución y forks con licencia permisiva**: Apache 2.0 permite redistribuir el modelo con atribución, útil para empaquetarlo en distribuciones locales (Ollama, LM Studio, etc.) respetando la atribución a los autores originales.
- **Investigación sobre error de cuantización**: al documentarse la composición exacta de tensores por archivo y la ausencia de imatrix, es un caso de estudio útil para medir el impacto de la requantización encadenada (BF16 → Q8_0 → Q2/Q3/Q4/Q5).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card del repositorio indica explícitamente que no se reclama ninguna puntuación de perplexidad, calidad o benchmarks de código salvo los valores medidos listados (que no existen en este caso).

## Requisitos de hardware

Estimaciones basadas en los tamaños de archivo publicados; la VRAM real dependerá de la longitud de contexto y del backend:

- **Q2_K (13,3 GB)**: cabe en GPUs de 16 GB (RTX 4080/4080 Super, A4000) con contexto moderado; viable también en 12 GB con descarga parcial a CPU.
- **Q3_K_M (17,1 GB)**: cómodo en GPUs de 24 GB (RTX 3090, RTX 4090) con margen para contexto.
- **Q4_K_M (21,1 GB)**: recomendado en GPUs de 24 GB (RTX 3090, RTX 4090); es el punto de equilibrio habitual entre calidad y memoria.
- **Q5_K_M (24,7 GB)**: requiere 32 GB de VRAM o configuración híbrida GPU+CPU (por ejemplo, RTX 5090, A6000, o 2× RTX 3090).
- **Despliegue**: llama.cpp es el runtime de referencia (la model card exige un build que soporte la arquitectura `k2_horizon`). Ollama, LM Studio y otras herramientas basadas en llama.cpp deberían funcionar si su versión soporta esta arquitectura; compatibilidad con vLLM o TGI no disponible (GGUF no es su formato nativo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa orientada a la categoría "modelos de ~30-35B cuantizados en GGUF para uso local":

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Sakura-Jais-3-32B-GGUF | 34,8 B | GGUF (Q2_K–Q5_K_M) | Apache 2.0 | Cuantización comunitaria sin imatrix; idiomas en/zh |
| Qwen2.5-32B-Instruct (GGUF comunitario) | 32,5 B | GGUF, safetensors | Apache 2.0 (algunas variantes Qwen) | Amplio soporte de herramientas y benchmarks publicados |
| QwQ-32B | 32,5 B | GGUF, safetensors | Apache 2.0 | Orientado a razonamiento; contexto largo documentado |
| Gemma 3 27B | 27 B | GGUF, safetensors | Gemma Terms of Use | Multilingüe y multimodal; licencia más restrictiva que Apache 2.0 |

La principal diferencia práctica: los modelos de la familia Qwen y Gemma cuentan con model cards detalladas, benchmarks oficiales y soporte de ecosistema amplio, mientras que este repositorio es una cuantización comunitaria de un modelo base con documentación técnica escasa. Su ventaja es la trazabilidad (SHA-256, pruebas de inferencia por archivo) y la licencia Apache 2.0.

## Limitaciones y advertencias

- **Error de cuantización acumulado**: los archivos provienen de una requantización de un GGUF Q8_0, no del checkpoint BF16 original, y no se usó imatrix; la propia model card advierte de posible pérdida adicional de calidad, especialmente en Q2_K y Q3_K_M.
- **Calidad sin verificar**: no hay benchmarks, perplexidad ni evaluaciones publicadas; el único control de calidad es la prueba de inferencia de llama.cpp.
- **Idiomas limitados a en/zh**: no hay garantía de rendimiento en castellano u otros idiomas.
- **Arquitectura poco documentada**: `k2_horizon` requiere builds recientes de llama.cpp; herramientas antiguas pueden no cargar el modelo.
- **Contexto y capacidades desconocidos**: longitud de ventana, soporte de tool calling y alineación del modelo base no están documentados en la información disponible, lo que dificulta evaluar riesgos de alucinación o sesgo.
- **Licencia**: Apache 2.0 permite uso comercial y redistribución con atribución; conviene mantener la atribución a inception42 y a los autores upstream.
- **Adopción marginal**: 194 descargas y 1 like en el momento de la ficha; es un recurso de nicho sin comunidad de soporte significativa.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/webmp3/Sakura-Jais-3-32B-GGUF
- Modelo original: https://huggingface.co/inception42/Jais-3-32B
- Model card del modelo original en el commit referenciado: https://huggingface.co/inception42/Jais-3-32B/blob/170144803abac94000f966ec215596d78a9bbcd8/README.md
- Fuente GGUF de requantización: https://huggingface.co/mradermacher/Jais-3-32B-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
