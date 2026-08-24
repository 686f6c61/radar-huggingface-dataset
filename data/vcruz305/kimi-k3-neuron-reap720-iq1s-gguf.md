# vcruz305/Kimi-K3-Neuron-REAP720-IQ1S-GGUF

## Resumen

El modelo `vcruz305/Kimi-K3-Neuron-REAP720-IQ1S-GGUF` es una versión podada del modelo MoE Kimi-K3, desarrollado originalmente por Moonshot AI y convertido a formato GGUF por el usuario vcruz305. Esta variante elimina 176 de los 896 expertos enrutados por capa mediante una técnica de poda por saliencia inspirada en REAP (Cerebras, arXiv:2510.13999), reduciendo el tamaño de 330,17 GB a 277,47 GB y los parámetros totales de 1,418 T a aproximadamente 1,18 T. El objetivo principal es permitir que el modelo quepa en estaciones de trabajo con 288 GB de RAM, algo que no era posible con la versión sin podar.

La poda se realizó sin ejecutar ninguna pasada hacia adelante del modelo, utilizando las estadísticas de activación por experto y por columna almacenadas en los archivos imatrix de llama.cpp. Se emplearon cinco dominios de calibración (chat, código, prosa, razonamiento y wiki) con 23.552 tokens cada uno. El resultado es un modelo que conserva los tensores no expertos y los expertos supervivientes byte a byte idénticos a la fuente, con una verificación de que los primeros 12 tokens generados coinciden con el modelo original. Sin embargo, no se ha ejecutado ningún benchmark de tareas, por lo que la calidad real es desconocida.

Esta ficha se basa exclusivamente en la información proporcionada por el autor en la model card y en los resultados de búsqueda web. No se dispone de datos sobre el contexto, los idiomas soportados ni las capacidades específicas más allá de lo indicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 720 expertos enrutados por capa (originalmente 896, podados a 720) |
| Parametros totales | ~1,18 T (tras poda) |
| Parametros activos | no disponible (top_k = 16, pero no se especifica el número de parámetros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S (tensores principales), Q8_0, F16, F32 (tensores no expertos) |
| Idiomas soportados | no disponible (la calibración se realizó solo en inglés y código; se espera degradación multilingüe) |
| Licencia | modified-mit |
| Formato de pesos | GGUF (9 shards) |

## Arquitectura y entrenamiento

El modelo base es Kimi-K3, un transformer MoE con 896 expertos enrutados por capa y un total de 1,418 T de parámetros. Esta versión podada reduce los expertos a 720 por capa mediante un proceso de poda por saliencia basado en REAP, que calcula la importancia de cada experto a partir de las estadísticas de activación de los archivos imatrix de llama.cpp, sin necesidad de ejecutar el modelo. La selección de expertos se realizó mediante un consenso de rango mínimo: cada experto se puntúa según su posición en el dominio donde mejor rinde, y se eliminan aquellos que ningún dominio clasifica bien. Se eliminaron 176 expertos por capa, con un margen de seguridad medido: ningún experto podado supera el puesto 226 de 896 en ningún dominio (mediana: 314). Los dos super-expertos (blk.12 e160 y blk.28 e132) se conservan íntegramente.

No se dispone de información sobre el entrenamiento original del modelo Kimi-K3 (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La poda se aplicó sobre la versión cuantizada IQ1_S del modelo GGUF, y todos los tensores conservados son byte idénticos a la fuente, sin requantización adicional.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente, como se verificó con una prueba de humo de 12 tokens idénticos al modelo original.
- Razonamiento y código: la calibración incluyó dominios de razonamiento y código, lo que sugiere que estas capacidades están presentes, aunque no se han evaluado formalmente.
- Soporte de tool calling: no confirmado en la información disponible.
- Soporte de agentes y multi-step reasoning: no confirmado.
- Capacidades multilingües: el modelo base es multilingüe, pero esta versión podada se calibró solo con texto en inglés y código, por lo que se espera una degradación significativa en otros idiomas.
- Thinking mode, visión, audio: no disponibles (modelo de texto únicamente).

## Casos de uso

- Investigación en poda de modelos MoE: este modelo sirve como caso de estudio para analizar el impacto de la poda por saliencia en el rendimiento de modelos masivos, permitiendo comparar la salida con el modelo sin podar en tareas específicas.
- Generación de código en entornos de servidor: con hardware de gama alta (múltiples GPUs con gran VRAM), puede utilizarse para asistencia en programación, generación de funciones complejas o refactorización, aprovechando su capacidad de razonamiento.
- Análisis de documentos extensos: si el contexto es largo (no confirmado), podría procesar documentos largos, aunque se requiere verificar la longitud real de contexto.
- Experimentación académica: en laboratorios con estaciones de trabajo de 288 GB de RAM, permite probar hipótesis sobre escalado de modelos MoE y técnicas de compresión.
- Desarrollo de asistentes conversacionales especializados: en dominios técnicos (inglés/código), podría servir como base para chatbots de soporte, siempre que se valide su calidad.
- Benchmarking de hardware: al ser un modelo de gran tamaño, es útil para medir el rendimiento de sistemas de inferencia (llama.cpp, vLLM) en configuraciones de múltiples GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación de tareas (PPL, GSM8K, HumanEval, MMLU, etc.) sobre esta versión podada. La única verificación es una coincidencia de 12 tokens en una prueba de humo, que no es evidencia de equivalencia general.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo ocupa 277,47 GB en disco, pero al ser GGUF puede cargarse parcialmente en VRAM y el resto en RAM. Se requiere al menos 288 GB de RAM total (según la model card, es el primer build que cabe en una workstation de 288 GB).
- GPU recomendadas: no se especifican modelos concretos. En la búsqueda web se menciona un recipe para servir el modelo sin podar (330 GB) en 3xH200 con vLLM TP3, lo que sugiere que esta versión podada podría ejecutarse en configuraciones similares o incluso con menos recursos.
- Compatibilidad con consumer GPU: no, el tamaño es demasiado grande para GPUs de consumo.
- Opciones de despliegue: llama.cpp (versión b10325 o superior con soporte para Kimi-K3) y vLLM (con parches para SparkInfer, ya que la versión actual requiere `n_experts == 896` y este modelo tiene 720).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. La única comparación posible es con el modelo base sin podar, según la tabla de la model card:

| Modelo | Parámetros | Tamaño | Expertos por capa | Notas |
|---|---|---|---|---|
| Kimi-K3 (sin podar) | 1,418 T | 330,17 GB | 896 | Modelo original en GGUF |
| Kimi-K3 Neuron REAP-720 | ~1,18 T | 277,47 GB | 720 | Versión podada, calidad no verificada |

No se dispone de información sobre otros modelos comparables (por ejemplo, DeepSeek-V3 o Qwen3-MoE) en términos de rendimiento o licencia.

## Limitaciones y advertencias

- Calidad no verificada: no se ha ejecutado ningún benchmark de tareas. La poda puede degradar el rendimiento de forma impredecible; la coincidencia de 12 tokens no garantiza equivalencia.
- Degradación multilingüe: la calibración se realizó solo con texto en inglés y código. Los expertos que servían a otros idiomas se podaron "a ciegas", por lo que se espera una degradación desproporcionada en capacidades multilingües.
- Sesgos y alucinaciones: no evaluados. Al ser un modelo de gran tamaño, es probable que presente sesgos presentes en los datos de entrenamiento originales, pero no se ha realizado ninguna auditoría.
- Requisitos de hardware: necesita al menos 288 GB de RAM y una versión reciente de llama.cpp. No es adecuado para hardware de consumo.
- Compatibilidad con SparkInfer: las versiones actuales de los builds distribuidos requieren `n_experts == 896`; este modelo necesita parches para leer el valor `kimi-k3.expert_count = 720`. llama.cpp no requiere cambios.
- Licencia: modified-mit. Se debe revisar los términos exactos de la licencia para uso comercial, ya que el modelo base puede tener restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vcruz305/Kimi-K3-Neuron-REAP720-IQ1S-GGUF
- Modelo base (GGUF): https://huggingface.co/vcruz305/Kimi-K3-GGUF
- Paper REAP (Cerebras): https://arxiv.org/abs/2510.13999
- Repo GitHub con recipe para vLLM TP3: https://github.com/vcruz305/kimi-k3-neuron-tp3-vllm-recipe
