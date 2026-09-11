# yusifnuri/Llama-3.2-3B-Instruct_classification

## Resumen

`yusifnuri/Llama-3.2-3B-Instruct_classification` es un adaptador LoRA (PEFT) publicado por el usuario Yusifnuri que especializa el modelo `meta-llama/Llama-3.2-3B-Instruct` (3,21 B parámetros) en una única tarea de clasificación: asignar una noticia a una de cuatro categorías (World, Sports, Business, Technology). El adaptador ocupa 0,1 GB en el repositorio y se distribuye en formato safetensors, por lo que requiere descargar el modelo base por separado para poder ejecutarse.

El adaptador no es un modelo de propósito general ni un asistente: es el artefacto reproducible de la tesis de máster *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg, 2026), que compara modelos pequeños ajustados con APIs de proveedores frontera en precisión, latencia, coste, exposición de privacidad y volumen de retorno de la inversión. Se libera para que terceros puedan verificar de forma independiente los resultados del banco de pruebas.

La relevancia actual está en su uso como caso de estudio metodológico: demuestra que un adaptador de rango 16 sobre un modelo de 3 B parámetros alcanza una precisión de 0,82 en AG News con 460 ms de latencia por petición (batch 1) y una imputación de coste de 15,91 USD por millón de tokens generados. No aporta innovaciones arquitectónicas: es un ajuste LoRA estándar sobre un transformer decoder-only de la familia Llama 3.2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 3,21 B en el modelo base; número de parámetros del adaptador no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en entrenamiento (max sequence length de la model card). La longitud de contexto del modelo base no se indica en la información proporcionada |
| Tipos de cuantización | No disponible (la model card no lista cuantizaciones publicadas del adaptador) |
| Idiomas soportados | No disponible (la model card no lo especifica; el corpus de entrenamiento, AG News, está en inglés) |
| Licencia | llama3.2 (Llama 3.2 Community Licence) |
| Formato de pesos | safetensors (pesos del adaptador LoRA en el repositorio); el modelo base usa los formatos propios de Llama 3.2 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only de 3,21 B parámetros con atención causal estándar. El ajuste se realizó con LoRA de rango 16, alpha 32 y dropout 0,05 sobre los módulos `q_proj`, `k_proj`, `v_proj` y `o_proj` de todas las capas de atención. El optimizador fue AdamW con una tasa de aprendizaje de 2e-4, scheduler coseno y un 3 % de warmup, durante 3 épocas con un tamaño de lote efectivo de 16 (4 x 4 de acumulación de gradiente), semilla 42 y una longitud máxima de secuencia de 512 tokens.

El conjunto de datos es AG News (`fancyzhx/ag_news`), con 5.000 ejemplos de entrenamiento y 500 reservados para la selección del checkpoint. El adaptador espera un formato de prompt concreto en inferencia: una instrucción de clasificación seguida del texto y la etiqueta `Category:`. No se documenta RLHF ni DPO adicional; el ajuste es supervisado sobre la tarea. Los hiperparámetros se mantuvieron constantes en todas las celdas del benchmark en lugar de ajustarse por tarea, por lo que el autor los presenta como una cota inferior conservadora del rendimiento alcanzable.

## Capacidades

- Clasificación de texto en cuatro categorías cerradas: World, Sports, Business y Technology, con una precisión medida de 0,82 sobre el corpus evaluado.
- Generación de texto conversacional heredada del modelo base `Llama-3.2-3B-Instruct`, aunque el adaptador no está diseñado ni evaluado para esa función.
- Salida determinista de una única etiqueta de categoría siguiendo el formato de prompt documentado (`Classify the following news text into exactly one category ... Category:`).
- Capacidad de razonamiento, código, matemáticas, visión, tool calling, function calling, agentes o multi-step reasoning: no disponible; la model card no documenta ninguna de estas capacidades para el adaptador.
- Capacidades multilingües: no disponibles; el adaptador se ha entrenado únicamente sobre un corpus de noticias en inglés.
- Capacidad especial de modo de pensamiento (thinking mode), audio o visión: no disponible.

## Casos de uso

- Enrutado de noticias en un agregador o lector RSS: el adaptador etiqueta cada titular o resumen en una de las cuatro categorías con una latencia de 460 ms por petición en H200 y batch 1, lo que permite clasificar flujos moderados en tiempo real sin depender de una API externa.
- Moderación y organización de contenidos en foros o comunidades: asignar automáticamente cada publicación entrante a un tablero temático (deportes, negocios, ciencia y tecnología, internacional) antes de la revisión humana.
- Etiquetado de datos para entrenamiento posterior: usar el adaptador como anotador automático de primer paso sobre corpus en inglés, con revisión humana de las etiquetas de baja confianza, apoyándose en su coste marginal bajo una vez desplegado en hardware propio.
- Prueba de concepto de sustitución de API por modelo propio: el repositorio de la tesis incluye el análisis de coste por petición que permite calcular el volumen de ruptura a partir del cual el despliegue autoalojado resulta más barato que el pago por token.
- Filtrado de ruido en paneles de analítica de medios: descartar o reclasificar artículos que no encajan en ninguno de los cuatro temas antes de agregarlos en informes de tendencias.
- Reproducción y auditoría de resultados académicos: el adaptador y el arnés de evaluación están publicados para que un tercero verifique la matriz de resultados del banco de pruebas sobre el mismo conjunto de datos y con los mismos hiperparámetros.
- Clasificación en pipelines de ingestión de baja concurrencia: dado que el adaptador ocupa 0,1 GB, puede combinarse con el modelo base en un mismo servicio para clasificar documentos internos sin que el texto salga de la infraestructura de la organización.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones de medida |
|---|---|---|
| Precisión (accuracy) | 0,82 | Corpus de evaluación de la tesis, 200 instancias reservadas; medida el 5 de julio de 2026 |
| Latencia media (batch 1) | 460 ms | NVIDIA H200 (141 GB) a plena utilización, sin tránsito de red |
| Coste por 1 M de tokens generados | 15,91 USD | Imputando 3,99 USD por hora de GPU |
| Épocas de entrenamiento | 3 | 5.000 ejemplos de AG News, 500 reservados para selección de checkpoint |
| Ejemplos de evaluación | 200 instancias reservadas (164 problemas para generación de código, según la model card) | Tamaño muestral que acota los efectos detectables a unos diez puntos porcentuales |

No se han publicado resultados comparativos con otros modelos en la información disponible; la model card remite a la matriz completa del benchmark en `results/benchmark_matrix.csv`, pero no reproduce esos valores.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación aritmética a partir de los 3,21 B parámetros del modelo base, más un adaptador de 0,1 GB en disco): en fp16/bf16, aproximadamente 6,5-8 GB; en cuantización de 8 bits, aproximadamente 4-5 GB; en cuantización de 4 bits, aproximadamente 2,5-3,5 GB, más el coste de la caché KV según la longitud de secuencia.
- GPU recomendadas: el fabricante del banco de pruebas midió el adaptador sobre una NVIDIA H200 de 141 GB, claramente sobredimensionada para un modelo de 3 B. Para producción son suficientes una NVIDIA A100, L40S o H100; para desarrollo, cualquier GPU con 8 GB o más de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) usando el modelo base en cuantización de 4 u 8 bits. Con 6-8 GB de VRAM es viable en fp16 con secuencias de hasta 512 tokens.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y superponer el adaptador con `transformers` + `peft` (patrón documentado en la model card). Para servirlo en producción pueden usarse vLLM o TGI con soporte de adaptadores LoRA, o bien fusionar el adaptador con el modelo base y exportar a GGUF para llama.cpp u Ollama si se necesita ejecución en CPU o en GPU de gama baja.
- Latencia y throughput: 460 ms de latencia media por petición con batch 1 sobre una H200 a plena utilización. No se han publicado cifras de throughput con lotes mayores ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yusifnuri/Llama-3.2-3B-Instruct_classification` | 3,21 B + adaptador LoRA | 512 tokens en entrenamiento | 0,82 de precisión en la tarea de cuatro categorías; 460 ms de latencia en H200 | llama3.2 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| `meta-llama/Llama-3.2-3B-Instruct` (modelo base) | 3,21 B | No indicado en la información disponible | No disponible para esta tarea concreta sin ajuste | llama3.2 | HuggingFace, ampliamente distribuido |
| Clasificador especializado tipo encoder (por ejemplo, BERT-base ajustado a AG News) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados comparativos con otras alternativas dentro de la información proporcionada; el benchmark de la tesis compara modelos pequeños ajustados con APIs de proveedores frontera, pero los valores concretos de esos competidores no se reproducen en la model card.

## Limitaciones y advertencias

- Entrenamiento con una única semilla: las diferencias reportadas frente a otros modelos confunden la calidad del modelo con la varianza de inicialización.
- Especialización extrema: está entrenado para una sola tarea sobre un único corpus público. No es un asistente de propósito general y no debe tratarse como tal.
- Contaminación del benchmark: los corpus de evaluación son benchmarks públicos de larga trayectoria y es plausible que estén presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- Potencia estadística limitada: la evaluación usa 200 instancias reservadas, de modo que los efectos detectables quedan acotados en torno a diez puntos porcentuales.
- Riesgo de alucinación: al ser un adaptador sobre un modelo generativo, nada garantiza que la salida se limite a las cuatro etiquetas previstas si la entrada se aleja del formato de prompt entrenado; se recomienda validar la salida contra el conjunto cerrado de categorías.
- Dependencia del formato de prompt: el adaptador espera exactamente la plantilla documentada; cambios en el preámbulo o en el orden de las etiquetas pueden degradar la precisión.
- Idioma: el entrenamiento se realizó solo en inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Licencia: la Llama 3.2 Community Licence permite uso comercial, pero lo condiciona a atribución, a una convención de nomenclatura para modelos derivados y a un umbral de usuarios activos mensuales. Debe revisarse antes de adoptarlo en producción.
- Licencia del conjunto de datos: AG News se distribuye con una licencia personalizada para uso de investigación, lo que puede restringir la redistribución de derivados entrenados sobre él.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin señales de mantenimiento posterior a la publicación inicial.
- Sin datos sobre cuantizaciones publicadas del adaptador ni sobre su comportamiento tras fusionarlo con el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusifnuri/Llama-3.2-3B-Instruct_classification
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Código, configuraciones y arnés de evaluación: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Análisis de coste por petición: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Conjunto de datos AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Cita de la tesis: Nuri, Yusif. *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*. SRH University Hamburg, 2026.
