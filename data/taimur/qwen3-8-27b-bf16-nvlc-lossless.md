# Taimur/Qwen3.8-27B-BF16-NVLC-Lossless

## Resumen

Este repositorio contiene una representación comprimida sin pérdida (lossless) del checkpoint BF16 del modelo Qwen/Qwen3.8-27B, desarrollada por Taimur. El objetivo es reducir el tamaño de los pesos en memoria y en disco manteniendo una reconstrucción bit a bit exacta del modelo original, de modo que se pueda acelerar la inferencia en GPUs con recursos limitados. La compresión utiliza un codec de entropía exacto llamado NVLC (basado en rANS19) que no cuantiza, no redondea ni altera ningún peso BF16, a diferencia de las técnicas de cuantización tradicionales.

El modelo base, Qwen3.8-27B, es un modelo denso de 27 mil millones de parámetros con arquitectura de atención híbrida (16 capas de atención completa y 48 de atención lineal), diseñado para tareas de visión-lenguaje (image-text-to-text). La versión comprimida reduce los bytes de los pesos BF16 de 55,56 GB a 36,44 GB (una reducción del 34,42 %) y, según las pruebas del autor en un DGX Spark, logra un aumento del throughput de salida de aproximadamente un 35 % respecto al BF16 original, manteniendo exactitud total en las predicciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, 64 capas: 16 full attention + 48 linear attention) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No cuantizado; compresion sin perdida NVLC (BF16 exacto) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | NVLC (archivos .esrans19, .srans19, .nvlcpfx1) + safetensors reconstruible |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención híbrida: de sus 64 capas, solo 16 utilizan atención completa (con intervalo de atención completa de 4), mientras que las otras 48 emplean atención lineal con un estado recurrente constante. Esta arquitectura reduce el coste computacional en contextos largos. El modelo es nativo de visión-lenguaje, por lo que acepta entradas de imagen y texto.

La compresión NVLC no modifica la arquitectura ni los pesos. Cada palabra BF16 se separa en sus campos exactos (signo, exponente de 8 bits y fracción de 7 bits). El símbolo conjunto signo+exponente se codifica con un modelo rANS19 por tensor, y tras decodificarlo se selecciona una distribución de fracciones soft-routed para los siete bits de fracción. Un flujo residual conserva la cabecera safetensors y cualquier segmento no BF16. La reconstrucción combina los campos bit a bit, garantizando una réplica exacta del checkpoint original. El autor verificó la reconstrucción comparando byte a byte cada shard lógico con el checkpoint inmutable de HuggingFace.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen-texto) heredadas del modelo base Qwen3.8-27B.
- Compresión sin pérdida de pesos BF16: permite reconstruir el checkpoint original de forma exacta.
- Inferencia con menor huella de memoria: el runtime comprimido reduce los bytes residentes de los pesos activos en aproximadamente un 29 % respecto al BF16 original.
- Compatibilidad con reconstrucción completa del checkpoint para su uso con herramientas estándar (Transformers, vLLM, SGLang) tras descomprimir.
- Soporte de verificación de integridad mediante manifiestos y sumas SHA256.
- No incluye capacidades adicionales de tool calling, agentes o modos de pensamiento explícitos en la información disponible; estas dependen del modelo base.

## Casos de uso

- Inferencia en hardware con VRAM limitada: el runtime comprimido permite ejecutar un modelo de 27B en GPUs con menos memoria que el BF16 original, por ejemplo en una DGX Spark (48 GB) o tarjetas similares, manteniendo exactitud total.
- Despliegue en entornos edge o de consumo energético reducido: al reducir los bytes de pesos en memoria, se disminuye el ancho de banda requerido y se acelera la decodificación, útil en servidores de inferencia con GPUs modestas.
- Reconstrucción de checkpoints para auditoría o reproducibilidad: el repositorio permite verificar que la compresión no altera ningún peso, lo que es crítico en entornos regulados o de investigación donde se requiere trazabilidad exacta.
- Investigación en compresión de modelos: sirve como referencia para estudiar codecs de entropía sin pérdida aplicados a pesos de grandes modelos, comparando con cuantización tradicional.
- Migración de modelos a infraestructura propia: al descargar la versión comprimida se ahorra ancho de banda y espacio en disco (36,4 GB frente a 55,6 GB), y luego se puede reconstruir el checkpoint original localmente.
- Evaluación de rendimiento en GPUs específicas: el runtime NVLC puede adaptarse a diferentes kernels, permitiendo medir mejoras de throughput y latencia en distintas configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo comprimido en la información disponible. El autor reporta una prueba de rendimiento en un DGX Spark (TP1, C1, sin MTP, concurrencia 1) con cuatro peticiones secuenciales de 512 entradas a 256 salidas:

| Metrica | Stock BF16 | NVLC comprimido | Cambio |
|---|---|---|---|
| Mediana de output TPS | 4,413039 | 5,957506 | +34,997797 % |
| Mediana de TTFT (ms) | 635,617 | 1.255,411 | +97,5 % (peor) |
| Mediana de TPOT (ms) | 224,768 | 163,426 | -27,3 % (mejor) |

La exactitud se verificó: las 256 salidas coincidieron en IDs de token, logprobs y texto decodificado. No hay datos de MMLU, HumanEval u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16 original ocupa ~55,6 GB; la representación comprimida canónica ocupa ~36,4 GB y el runtime residente (códigos + metadatos) ~38,2 GB, con workspace completo ~40,8 GB. Se recomienda una GPU con al menos 48 GB de VRAM para el runtime comprimido.
- GPU recomendadas: NVIDIA DGX Spark (probada por el autor), así como GPUs con 48 GB o más (p. ej., A6000, L40S, A100 40/80 GB, H100).
- En consumer GPU: no es viable en GPUs de 24 GB (RTX 4090) con el runtime comprimido, ya que supera los 38 GB; la reconstrucción completa del checkpoint tampoco cabe.
- Opciones de despliegue: el runtime NVLC es específico del hardware y requiere el repositorio de implementación (TaimurAyaz/Qwen3.8-27B-BF16-NVLC). No es compatible directamente con Transformers, vLLM o SGLang sin reconstruir primero el checkpoint original.
- Latencia y throughput: en DGX Spark, el TTFT mediano aumenta de ~636 ms a ~1.255 ms, mientras que el TPOT mediano mejora de ~225 ms a ~163 ms, resultando en un throughput de salida ~35 % mayor.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos comprimidos (p. ej., AWQ, GPTQ) en la información proporcionada. La comparación más directa es con el propio Qwen3.8-27B en BF16 original:

| Modelo | Parametros | Formato | Tamano en disco | Exactitud | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,78 B | safetensors BF16 | ~55,6 GB | Referencia | Apache 2.0 |
| Qwen3.8-27B NVLC (este repo) | 27,78 B | NVLC comprimido | ~36,4 GB | Identica (verificada) | Apache 2.0 |

No se han encontrado alternativas de compresión sin pérdida de pesos BF16 de modelos de 27B con datos públicos comparables.

## Limitaciones y advertencias

- Los archivos NVLC no son cargables directamente con Transformers, vLLM o SGLang sin reconstruir primero el checkpoint original mediante el script proporcionado.
- La reconstrucción completa requiere aproximadamente el tamaño del checkpoint original en disco (~55,6 GB) y un tiempo de proceso no especificado.
- El runtime comprimido solo ha sido probado en un DGX Spark con configuración concreta (TP1, C1, sin MTP); su rendimiento en otras GPUs puede variar y no se garantiza.
- El TTFT empeora significativamente (+97 %) en la prueba realizada, lo que puede ser inaceptable para aplicaciones interactivas de baja latencia.
- No se han publicado benchmarks de calidad del modelo base (MMLU, HumanEval, etc.) en este repositorio; la información se limita a la compresión y al rendimiento de inferencia.
- El modelo base Qwen3.8-27B puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje; no se han documentado aquí.
- La licencia Apache 2.0 permite uso comercial, pero el runtime NVLC es experimental y su mantenimiento no está garantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Taimur/Qwen3.8-27B-BF16-NVLC-Lossless
- Implementacion en GitHub: https://github.com/TaimurAyaz/Qwen3.8-27B-BF16-NVLC
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
