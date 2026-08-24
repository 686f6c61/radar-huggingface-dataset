# sxiong/DHSA-Qwen2.5-3B-Instruct-BF16

## Resumen

DHSA-Qwen2.5-3B-Instruct-BF16 es un checkpoint de pesos del predictor de atención dispersa jerárquica dinámica (Dynamic Hierarchical Sparse Attention, DHSA) desarrollado por Siheng Xiong, Joe Zou, Faramarz Fekri y Yae Jee Cho, presentado como Spotlight en ICML 2026. No es un modelo de lenguaje completo, sino un componente que se acopla al modelo base Qwen2.5-3B-Instruct para reducir el coste de memoria y computación durante la inferencia en contextos largos. El predictor genera máscaras de atención dispersas de forma dinámica, seleccionando los tokens más relevantes en cada capa y bloque de atención, lo que permite mantener la calidad del modelo mientras se reduce el uso de memoria en secuencias de hasta 128K tokens. El checkpoint pesa 1,5 GB, se distribuye bajo licencia MIT y está diseñado para su uso con el repositorio oficial DHSA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Predictor de atención dispersa jerárquica dinámica (DHSA) para Qwen2.5-3B-Instruct |
| Parámetros totales | No disponible (checkpoint del predictor de 1,5 GB, pesos en FP32 y BF16) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 128K tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantización | No disponible (los pesos del predictor están en FP32 y BF16; el modelo base admite cuantizaciones adicionales) |
| Idiomas soportados | No especificado; depende del modelo base Qwen2.5, que soporta más de 29 idiomas |
| Licencia | MIT |
| Formato de pesos | PyTorch .pt (state_dict, predictor_config, sample_prototypes, density_config_overrides) |

## Arquitectura y entrenamiento

DHSA introduce un mecanismo de atención dispersa de dos niveles que combina una selección global de bloques de claves (k-block) y una selección local de tokens dentro de cada bloque. El predictor, entrenado específicamente para Qwen2.5-3B-Instruct, aprende a generar máscaras de atención estáticas o dinámicas (según la configuración `sparsity-mask DHSA_learned_topK_static` o dinámica) que determinan qué tokens deben participar en el cálculo de atención. El checkpoint incluye un `predictor_config` que describe la arquitectura del predictor, un `state_dict` con los pesos entrenados en FP32, `sample_prototypes` en BF16 para la coincidencia de muestras más cercanas y `density_config_overrides` para ajustar los rangos de presupuesto dinámico según la densidad deseada. No se han publicado detalles del conjunto de datos de entrenamiento del predictor ni del proceso de optimización (p. ej., si se usó RLHF o DPO); la información disponible se limita a la descripción del checkpoint y su uso en el script `run_ruler.py`.

## Capacidades

- Genera máscaras de atención dispersas dinámicas que reducen la memoria y la latencia de la atención en contextos largos.
- Mantiene la calidad del modelo base al seleccionar tokens relevantes mediante un mecanismo jerárquico (bloques de claves y tokens).
- Permite ajustar la densidad de atención (p. ej., 0.125) y el tamaño de los bloques de consulta (q-block-size) y clave (k-block-size) para equilibrar rendimiento y precisión.
- Se integra con el modelo Qwen2.5-3B-Instruct, heredando todas sus capacidades de generación, razonamiento, código y multilingüismo.
- No es un modelo de lenguaje independiente; requiere el modelo base y el código del repositorio DHSA para su funcionamiento.
- Soporta tanto máscaras estáticas aprendidas como máscaras dinámicas en función de la entrada (según la configuración de sparsity-mask).

## Casos de uso

- Procesamiento de documentos largos en memoria limitada: permite ejecutar Qwen2.5-3B-Instruct en secuencias de 100K+ tokens en GPUs con VRAM moderada (p. ej., 24-40 GB) sin degradación excesiva de la calidad.
- Sistemas de recuperación aumentada (RAG) con corpus extensos: el modelo base puede atender a fragmentos largos de contexto, mientras que DHSA reduce el coste de atención al seleccionar los pasajes más relevantes.
- Análisis de código fuente y repositorios completos: facilita la comprensión de archivos de código de gran tamaño en tareas de generación o resumen.
- Agentes conversacionales con historial largo: mantiene la coherencia en conversaciones de múltiples turnos sin agotar la memoria de la GPU.
- Investigación en eficiencia de atención: sirve como banco de pruebas para evaluar técnicas de atención dispersa en modelos de 3B parámetros.
- Despliegue en entornos con recursos limitados: reduce el uso de memoria y energía en inferencia de contexto largo en servidores o edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (model card o búsqueda web). El repositorio GitHub menciona mediciones de latencia en una A100 40 GB para una capa de atención, pero no se proporcionan los valores numéricos en los materiales consultados. No se dispone de tablas comparativas con otros modelos.

## Requisitos de hardware

- El checkpoint del predictor ocupa 1,5 GB (pesos en FP32 y prototipos en BF16).
- El modelo base Qwen2.5-3B-Instruct en BF16 requiere aproximadamente 3 GB de VRAM (más los estados de la atención y los gradientes si se fine-tunea).
- Para la inferencia, se recomienda una GPU con al menos 8 GB de VRAM para la configuración típica (density 0.125, bloques 128/32), aunque la memoria exacta depende de la longitud de la secuencia y del tamaño del lote.
- En el repositorio se ha medido la latencia en una A100 40 GB, lo que sugiere que GPUs de clase datacenter son adecuadas para evaluar el máximo rendimiento.
- La integración se realiza mediante el código de Python del repositorio DHSA (run_ruler.py) y no se menciona compatibilidad directa con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de datos para comparar directamente con otros modelos de atención dispersa (p. ej., Longformer, BigBird o técnicas de sparse attention en otros LLMs). La comparación con el modelo base Qwen2.5-3B-Instruct sin DHSA es la más relevante:

| Modelo | Parámetros | Contexto | Atención | Licencia | Uso |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 128K | Full attention | Apache 2.0 | Generación estándar |
| DHSA-Qwen2.5-3B-Instruct (predictor) | No disponible | 128K (limitado por base) | Dispersa dinámica | MIT | Aceleración de inferencia |

DHSA no es un modelo independiente, por lo que la comparación se limita a su función de optimización sobre el modelo base. No hay alternativas equivalentes públicas con las mismas características documentadas.

## Limitaciones y advertencias

- El predictor está entrenado específicamente para Qwen2.5-3B-Instruct; su uso con otros modelos puede degradar el rendimiento o no funcionar correctamente.
- No es un modelo autónomo: requiere el modelo base y el código del repositorio DHSA para ejecutarse.
- La calidad de la atención dispersa depende de la precisión del predictor y de la coincidencia entre los `sample_prototypes` y los datos de entrada; en dominios muy diferentes puede haber pérdida de información.
- No se han publicado resultados de benchmarks independientes que validen la pérdida de calidad en tareas de largo contexto.
- El checkpoint no está en formato safetensors ni GGUF; se distribuye como archivos .pt de PyTorch, lo que limita su integración con otros frameworks de inferencia.
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen2.5 (Apache 2.0) y del código DHSA (no especificada en el repositorio).
- La fecha de creación (2026-08-23) es futura, lo que sugiere que el proyecto puede estar en fase de investigación y no contar con soporte activo.

## Enlaces

- Repositorio de Hugging Face: [sxiong/DHSA-Qwen2.5-3B-Instruct-BF16](https://huggingface.co/sxiong/DHSA-Qwen2.5-3B-Instruct-BF16)
- Paper: [Long-Context Modeling with Dynamic Hierarchical Sparse Attention for Memory-Constrained LLM Inference](https://arxiv.org/pdf/2510.24606)
- Repositorio de código: [xiongsiheng/DHSA](https://github.com/xiongsiheng/DHSA)
- Modelo base Qwen2.5-3B-Instruct: [Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
