# tokiryo/Qwen3.8-Looped-GDN-QSA-19B-C1-Preview

## Resumen

Qwen3.8-Looped-GDN-QSA-19B-C1-Preview es un checkpoint de investigación temprana publicado por el usuario tokiryo en Hugging Face. Se trata de un modelo híbrido de 19,34B parámetros totales (16,80B de cuerpo transformer más 2,54B de embeddings y `lm_head` no atados) que combina una arquitectura parcialmente recurrente en profundidad de Gated DeltaNet (GDN) con Query-Sparse Attention (QSA). El modelo se ha destilado a partir del checkpoint denso híbrido de 64 capas y 27B `higa2515/Qwen3.8-27B-QSA-BF16`, que actúa como profesor.

La propuesta técnica es relevante porque explora dos líneas de eficiencia poco habituales en modelos abiertos: el peso compartido entre bloques (looped transformer) para reutilizar parámetros en profundidad, y la combinación de capas de atención dispersa por consulta con capas de estado recurrente GDN. El resultado es un modelo que reduce el coste paramétrico respecto a su profesor manteniendo una fidelidad de distribución razonable en la evaluación de destilación publicada.

Es importante subrayar que no es un checkpoint listo para producción: el repositorio contiene un *bundle* de bloques entrenables, no un `AutoModelForCausalLM` autónomo. Para reconstruir el modelo completo hay que combinar `c1_weights.safetensors` con componentes congelados cargados desde el modelo profesor. Está etiquetado como research preview y su licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida looped transformer con Gated DeltaNet (GDN) y Query-Sparse Attention (QSA), destilada de un profesor denso híbrido |
| Parametros totales | 19,34B (16,80B cuerpo + 2,54B embeddings/`lm_head` no atados) |
| Parametros activos | No aplica (no es MoE); 10,692B parámetros entrenables no-indexer en el bundle |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors sin cuantizar) |
| Idiomas soportados | Inglés (en) y japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`c1_weights.safetensors`, 21.444.843.040 bytes) + configuración JSON |

## Arquitectura y entrenamiento

La arquitectura separa explícitamente componentes con peso compartido (looped) de capas independientes y de componentes congelados del profesor. El *front* contiene dos bloques `LapGroup(num_sources=3)` con recurrencia de profundidad 3× por grupo, lo que genera 24 capas virtuales a partir de 3,048B parámetros entrenables. El *back* combina dos capas QSA con peso compartido en proporción 3:1 (0,745B parámetros entrenables no-indexer, 0,751B incluyendo indexers congelados) que cubren los bloques 7 a 12, junto con 18 capas GDN independientes y no compartidas (6 etapas × 3 subcapas GDN, 6,899B parámetros). Los componentes congelados cargados desde el profesor suman unos 8,65B parámetros: el bloque de entrada (4 capas), el `LapExit(num_parts=3)` de salida (12 capas), los embeddings y `lm_head` no atados, y los indexers QSA.

La configuración declara `hidden_size=5120`, `vocab_size=248320`, `num_hidden_layers=64` (profundidad virtual), `front_group_sizes=[3, 3]`, `n_back_stages=6`, `gdns_per_stage=3`, `stages_per_qsa=3` y `n_exit_parts=3`. El entrenamiento se basa en destilación de logits del profesor con la función `fkl_low_jsd(w=0.60, th=0.70, beta=0.30)` y `ce_weight=0.05`, empleando una estrategia Top-64 + Exact-Tail. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto autorregresiva en inglés y japonés, heredada por destilación del profesor Qwen3.8-27B-QSA.
- Razonamiento y modo *thinking*: la evaluación del autor incluye un flujo específico de tipo `think`, lo que sugiere preservación parcial de las capacidades de razonamiento del profesor.
- Generación de código: se evalúa un flujo `code` con FKL de 0,27723, el segundo mejor de los cuatro flujos medidos.
- Conversación multi-turno: el flujo `chat` obtiene FKL de 0,34434 en la evaluación de destilación.
- Capacidades multilingües limitadas a inglés y japonés según los metadatos del modelo.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en arquitecturas looped y weight-sharing: el modelo permite estudiar empíricamente el impacto de la recurrencia en profundidad sobre la calidad de la distribución de salida, comparando los FKL por flujo publicados frente al profesor denso de 27B.
- Destilación de modelos híbridos GDN + QSA: sirve como referencia reproducible para experimentos de destilación de logits con Top-64 + Exact-Tail y la función `fkl_low_jsd`, al estar publicados los hiperparámetros exactos.
- Evaluación de eficiencia paramétrica: con 19,34B totales frente a los 27B del profesor, es útil para medir la relación entre reducción de parámetros y fidelidad (Top-1 del 79,34% y Top-1 en baja entropía del 95,82%).
- Generación de código en inglés o japonés en entornos de investigación: el flujo `code` es el segundo con menor FKL (0,27723), lo que lo hace adecuado para prototipos de asistencia a la programación en esos idiomas, siempre que se reconstruya el modelo completo.
- Experimentos de conversación en japonés: el soporte nativo de `ja` junto con el flujo `chat` evaluado permite probar asistentes conversacionales en ese idioma dentro de un contexto de investigación.
- Base para *fine-tuning* de bloques específicos: al distribuirse como bundle de bloques entrenables separados del profesor congelado, facilita experimentos de ajuste selectivo del *front* looped o del *back* GDN sin tocar los componentes congelados.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de destilación frente al profesor `higa2515/Qwen3.8-27B-QSA-BF16`, evaluadas sobre 32 secuencias × 2560 tokens = 81.920 tokens en cuatro flujos (`mixed`, `chat`, `think`, `code`). No son benchmarks de tareas estándar (MMLU, HumanEval, GSM8K) y no deben interpretarse como tales.

| Metrica | Valor |
|---|---|
| FKL global | 0,31017 |
| RKL global | 0,47011 |
| Top-1 | 79,34% |
| Low-Entropy Top-1 | 95,82% |
| Low-Entropy RKL | 0,34189 |
| FKL `mixed` | 0,39157 |
| FKL `chat` | 0,34434 |
| FKL `think` | 0,22753 |
| FKL `code` | 0,27723 |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 19,34B parámetros en BF16 requiere del orden de 38-40 GB solo para pesos, más overhead de activaciones y caché KV; en FP8 o cuantizaciones de 8 bits bajaría a unos 20 GB, y en 4 bits a unos 10-12 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas. Por tamaño, encajaría en A100 80GB, H100 80GB o configuraciones multi-GPU con GPUs de 24 GB o más.
- Compatibilidad con GPU de consumo: no confirmada. En BF16 no cabría en una RTX 4090 (24 GB) sin cuantización; con cuantización agresiva podría ser viable, pero el repositorio no ofrece pesos cuantizados.
- Opciones de despliegue: el repositorio es un bundle de bloques entrenables en PyTorch que requiere ensamblaje manual con el modelo profesor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Looped-GDN-QSA-19B-C1-Preview | 19,34B totales (10,692B entrenables) | No disponible | Apache-2.0 | Bundle de bloques, requiere ensamblaje | Research preview, solo en/ja |
| higa2515/Qwen3.8-27B-QSA-BF16 (profesor) | 27B denso híbrido, 64 capas | No disponible | No disponible en la información | Checkpoint BF16 completo | Modelo de referencia del que se destila |
| Alternativas de ~20B open source | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría (híbridos GDN/QSA de tamaño similar) más allá del profesor.

## Limitaciones y advertencias

- Estado de investigación temprana: el autor lo marca explícitamente como no listo para producción.
- No es un `AutoModelForCausalLM` autónomo: requiere combinar `c1_weights.safetensors` con componentes congelados del modelo `higa2515/Qwen3.8-27B-QSA-BF16`, lo que añade complejidad de despliegue y dependencia de un tercer repositorio.
- Idiomas limitados a inglés y japonés; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo destilado con Top-1 del 79,34% frente al profesor, se espera una divergencia no trivial en la distribución de salida.
- Sesgos: no documentados por el autor.
- Sin datos de benchmarks de tareas estándar, por lo que no se puede validar su rendimiento real en MMLU, HumanEval, GSM8K u otros.
- Licencia Apache-2.0, que permite uso comercial, pero heredada del modelo profesor; conviene verificar las condiciones del repositorio base antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokiryo/Qwen3.8-Looped-GDN-QSA-19B-C1-Preview
- Modelo profesor: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Perfil del autor en Hugging Face: https://huggingface.co/tokiryo
- Perfil del autor en GitHub: https://github.com/tokiryo
