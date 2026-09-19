# vtava/Qwen35-0.8B-FlyFFN-v3-AllFFN

## Resumen

Qwen35-0.8B-FlyFFN-v3-AllFFN es un checkpoint de investigación publicado por el usuario vtava dentro del proyecto TinyCeNN-LM. No es un modelo entrenado desde cero: parte de Qwen/Qwen3.5-0.8B y sustituye las 24 capas FFN del transformer original por módulos FlyFFN-v3, una variante de capa feed-forward con enrutamiento tipo mezcla de expertos (MoE), sin dejar ninguna FFN densa como ancla. El resultado es un artefacto experimental orientado a estudiar el comportamiento del enrutamiento cuando todas las capas feed-forward son dispersas.

El repositorio pesa 2,0 GB y solo contiene artefactos de ejecución (config.json, flyffn_config.json, generation_config.json, report.json, tokenizer_config.json), sin resultados de evaluación held-out ni benchmarks publicados. La model card únicamente reporta dos métricas de la ejecución de entrenamiento: num_shards = 8 y mean_route_mix = 0,262512. El propio autor advierte de que es un checkpoint de investigación y que la calidad de generación puede diferir sustancialmente del modelo base.

Su relevancia es, por tanto, metodológica más que de producto: sirve para reproducir y auditar una ablación concreta sobre modelos pequeños de menos de mil millones de parámetros, no para despliegues en producción. No tiene descargas ni interacciones registradas en el momento de redactar esta ficha, y la licencia no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con las 24 capas FFN sustituidas por FlyFFN-v3 (enrutamiento tipo MoE, sin FFN densas de anclaje) |
| Parámetros totales | Aproximadamente 0,8 mil millones (heredados del modelo base Qwen/Qwen3.5-0.8B); el recuento exacto tras la sustitución de las FFN no está disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se documentan versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No confirmado explícitamente; repositorio de 2,0 GB para `transformers` (se presupone safetensors) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamaño del repositorio | 2,0 GB |
| Número de shards | 8 |
| mean_route_mix (entrenamiento) | 0,262512 |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-0.8B, un transformer denso de escala pequeña, y reemplaza cada una de sus 24 capas feed-forward por un bloque FlyFFN-v3. FlyFFN-v3 se etiqueta como mezcla de expertos: en lugar de una FFN densa única, el bloque enruta cada token hacia un subconjunto de expertos, de modo que el coste de cómputo por token no crece linealmente con el número total de parámetros. La decisión de diseño destacada en la model card es "no dense anchors": no se conserva ninguna capa FFN densa para estabilizar el entrenamiento o la inferencia, lo que convierte al checkpoint en una prueba de estrés del enrutamiento en todas las profundidades del modelo. La métrica mean_route_mix = 0,262512 se registra precisamente para caracterizar cómo se reparte el tráfico entre expertos.

No hay información sobre el dataset utilizado: la model card indica explícitamente "Dataset: Not recorded". Tampoco se documentan el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de ajuste con RLHF, DPO o similares. El autor remite al repositorio TinyCeNN-LM en GitHub y a los notebooks de Colab correspondientes para reproducir la ejecución, y advierte de que las métricas guardadas proceden del propio script de entrenamiento, no de una evaluación held-out, por lo que no deben tratarse como resultados de benchmark publicables.

## Capacidades

- Generación de texto autorregresiva, heredada del pipeline `text-generation` del modelo base.
- Uso conversacional: el repositorio incluye la etiqueta `conversational`, aunque no se detalla el formato de plantilla ni la calidad del diálogo tras la sustitución de las FFN.
- Enrutamiento condicionado por token a través de 24 capas FlyFFN-v3, que es el objeto de estudio del checkpoint.
- Ejecución mediante la librería `transformers` con los ficheros de configuración incluidos (`config.json`, `flyffn_config.json`, `generation_config.json`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos académicos: el checkpoint permite replicar la ejecución de TinyCeNN-LM que sustituye las 24 FFN de Qwen3.5-0.8B por FlyFFN-v3, usando el notebook correspondiente y los ficheros `report.json` y `flyffn_config.json` como referencia de configuración.
- Análisis de enrutamiento en mezclas de expertos: los valores de `mean_route_mix` y `num_shards` permiten estudiar cómo se distribuye el tráfico entre expertos cuando no existen capas densas de anclaje, un escenario poco habitual en la literatura.
- Ablación contra el modelo base: al compartir origen con Qwen/Qwen3.5-0.8B, sirve para medir la degradación o mejora introducida por el reemplazo de las FFN manteniendo fijo el resto del transformer.
- Prototipado local de bajo coste: con aproximadamente 0,8 mil millones de parámetros, el modelo cabe en GPUs de consumo, lo que permite experimentar con generación de texto sin depender de APIs externas ni de clústeres.
- Investigación sobre eficiencia computacional: la ausencia de FFN densas lo convierte en un banco de pruebas para medir el equilibrio entre parámetros totales, parámetros activos y latencia real de inferencia.
- Punto de partida para fine-tuning experimental: puede usarse como inicialización para estudiar cómo se comporta el enrutamiento tras un ajuste supervisado adicional en dominios concretos.
- Docencia y formación técnica: útil para ilustrar de forma práctica la diferencia entre un transformer denso y uno con FFN enrutadas, siempre que se presente como artefacto de laboratorio y no como modelo listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación estándar. Las únicas cifras registradas son métricas internas de la ejecución de entrenamiento, que el propio autor advierte que no deben interpretarse como resultados de evaluación:

| Métrica | Valor | Naturaleza |
|---|---:|---|
| num_shards | 8 | Métrica de la ejecución de entrenamiento |
| mean_route_mix | 0,262512 | Métrica de enrutamiento de la ejecución de entrenamiento |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): en torno a 2-3 GB para pesos y caché, partiendo de los aproximadamente 0,8 mil millones de parámetros del modelo base. Es una estimación derivada del tamaño, no un dato publicado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1-1,5 GB. En 4 bits, aproximadamente 0,7-1 GB. No se publican ficheros cuantizados, por lo que estos valores son proyecciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM dedicada. Las GPUs de consumo tipo RTX 3060, RTX 4060, RTX 4090 o Apple Silicon con memoria unificada son suficientes por capacidad de memoria.
- Compatibilidad con GPU de consumo: sí, en principio cabe en GPUs de gama media y baja, siempre que el runtime soporte la arquitectura FlyFFN.
- Opciones de despliegue: `transformers` es la vía documentada por el autor. No hay evidencia de soporte en vLLM, TGI, llama.cpp u Ollama, y la presencia de capas FlyFFN personalizadas hace probable que estos runtimes optimizados no carguen el modelo sin modificaciones.
- Latencia y throughput estimados: no disponible. No se publican medidas de latencia, tokens por segundo ni rendimiento en lote.

## Comparativa con modelos similares

La comparación directa con alternativas de la misma escala es limitada porque la información proporcionada no incluye datos de rendimiento de este checkpoint. Se ofrecen referencias de la misma categoría por tamaño, señalando los campos no verificados:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vtava/Qwen35-0.8B-FlyFFN-v3-AllFFN | ~0,8 mil millones (base) | No disponible | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8 mil millones | No disponible | No disponible | HuggingFace |
| Alternativas de escala similar (por ejemplo, familias Qwen3-0.6B, Llama-3.2-1B o SmolLM2) | 0,6-1,7 mil millones | No disponible | No disponible | HuggingFace |

No se dispone de datos de benchmarks del checkpoint ni de sus alternativas en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable. Cualquier comparación debería basarse en una evaluación propia ejecutada bajo las mismas condiciones.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo de producción. La propia model card indica que la calidad de generación puede diferir sustancialmente del modelo base.
- Las métricas guardadas proceden del script de entrenamiento y no de una evaluación held-out; no son resultados de benchmark publicables.
- El dataset de entrenamiento no está registrado ("Not recorded"), lo que impide auditar la procedencia de los datos, sus licencias y sus posibles sesgos.
- No se declara licencia, lo que bloquea cualquier uso comercial sin aclaración previa por parte del autor.
- No se declaran idiomas soportados; se desconoce el comportamiento multilingüe tras la sustitución de las FFN.
- El checkpoint no ha recibido ninguna descarga ni interacción registrada, por lo que carece de validación externa.
- Al no conservar FFN densas de anclaje, el enrutamiento afecta a todas las capas, lo que puede incrementar la inestabilidad y hacer que el comportamiento en inferencia se aleje del esperado en un transformer denso.
- No hay información sobre alineación, filtros de seguridad o ajuste con RLHF/DPO posterior al reemplazo de las FFN; no debe asumirse que conserva las garantías del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala y no cuantificado en esta ficha por ausencia de evaluaciones.
- Compatibilidad limitada de runtimes: al usar capas FlyFFN personalizadas, es probable que las herramientas de inferencia optimizadas no lo soporten sin adaptaciones.
- El repositorio contiene artefactos de ejecución con marcas de tiempo, no un paquete de pesos verificado con evaluación reproducible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vtava/Qwen35-0.8B-FlyFFN-v3-AllFFN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código fuente del proyecto TinyCeNN-LM: https://github.com/vtavakkoli/TinyCeNN-LM
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron contenido sin relación con el modelo (páginas en árabe sobre niveles de glucosa en sangre). No hay papers, blogs ni demos adicionales disponibles.
