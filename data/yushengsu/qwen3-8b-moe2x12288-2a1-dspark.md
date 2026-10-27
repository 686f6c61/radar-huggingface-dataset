# yushengsu/qwen3-8b-moe2x12288-2A1-dspark

## Resumen

`yushengsu/qwen3-8b-moe2x12288-2A1-dspark` es un modelo borrador (*draft model*) para decodificación especulativa sobre el modelo objetivo `Qwen/Qwen3-8B`. No es un modelo generativo autónomo: se usa emparejado con Qwen3-8B sin modificar, proponiendo bloques de tokens que el modelo grande verifica en paralelo. Lo publica el usuario yushengsu y se entrena y exporta con SpecForge (PR #1022 del repositorio `sgl-project/SpecForge`).

Su particularidad es que la capa FFN del borrador no es densa, sino una capa tipo Qwen3.5-MoE con 2 expertos enrutados de 12.288 de anchura, top-1 y sin experto compartido. El resultado declarado es de 1,88B parámetros totales y 1,13B activos por token, lo que sitúa el coste de cómputo por paso en el orden de un modelo denso de ~1B mientras mantiene la huella de memoria de un modelo de ~1,9B.

El interés es fundamentalmente de investigación: es un artefacto experimental (0 descargas, 0 likes en el momento de la consulta) que sirve para estudiar si un drafter MoE mejora la tasa de aceptación frente a un drafter denso de tamaño comparable, y para validar el soporte de arquitecturas MoE en el pipeline de SpecForge. No hay métricas publicadas de aceptación ni de aceleración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark: drafter de bloques por difusión (estilo DFlash) con cabeza Markov estilo EAGLE; 5 capas de atención completa, hidden 4096, 32/8 cabezas; FFN MoE con 2 expertos enrutados de 12.288, top-1, sin experto compartido |
| Parametros totales | 1,88B (borrador) |
| Parametros activos | 1,13B por token (1 de 2 expertos por capa) |
| Longitud de contexto | Entrenado con 8.192 tokens; en inferencia hereda la ventana del modelo objetivo (Qwen3-8B: 32.768 nativos, hasta 131.072 con YaRN segun la documentacion del modelo base) |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones; el checkpoint se distribuye en el formato de exportacion de SpecForge) |
| Idiomas soportados | No disponible para el borrador; usa el vocabulario, el embedding y el tokenizador del modelo objetivo Qwen3-8B |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base Qwen3-8B se distribuye bajo Apache 2.0) |
| Formato de pesos | Directorios HF autocontenidos exportados con `specforge export --to hf`; el formato de serializacion concreto no se especifica en la model card |

Otros parámetros declarados: capas objetivo `[1, 9, 17, 25, 33]` de Qwen3-8B, rango Markov 256, sin cabeza de confianza (*no confidence head*), bloque de borrador de 16 tokens.

## Arquitectura y entrenamiento

El borrador sigue el esquema DSpark: un drafter de difusión de bloques (herencia de DFlash) que predice un bloque de 16 tokens de una sola pasada, combinado con una cabeza Markov de bajo rango (rango 256) que modela la dependencia secuencial entre tokens del bloque, al estilo de EAGLE. Toma como entrada características de cinco capas del modelo objetivo (índices 1, 9, 17, 25 y 33) y consta de 5 capas de atención completa con hidden 4096 y atención GQA de 32/8 cabezas. La innovación respecto a un DSpark convencional es el FFN: en lugar de una MLP densa, cada capa usa una capa MoE de 2 expertos enrutados de 12.288 de anchura (cada uno tan ancho como el FFN denso de 12.288), top-1 y sin experto compartido, con el objetivo de aumentar la capacidad del borrador manteniendo bajo el número de parámetros activos. Para evitar el colapso de enrutamiento se aplica un sesgo de selección estilo DeepSeek (tasa 0,001) más una pérdida auxiliar `batch_wise` con coeficiente 0,005.

El entrenamiento se realizó con SpecForge (config `configs/qwen3-8b-moe2x12288-2A1-dspark.json`, código `26bd18b6`). Los datos son PerfectBlend regenerado por el propio Qwen3-8B a temperatura 0 en modo no-thinking: 1.420.909 prompts por época, plantilla `qwen3-instruct`, contexto de 8.192 tokens y 6 épocas. Optimizador AdamW con lr 6e-4, scheduler coseno, 4% de warm-up y grad clip 1,0; pérdida DSpark con CE 0,1 y L1 0,9, 512 anchors y decaimiento gamma 7. Los logits del objetivo se capturaron en línea en BF16 con SGLang. La infraestructura fue un único nodo de 8× H200: 2 GPUs para captura y 6 rangos en DDP para el entrenamiento, con 132 muestras por paso de optimizador y 10.764 pasos por época. La receta completa se referencia en `training/` y el protocolo se atribuye al repositorio `jiapingW/Qwen3-8b-dspark-SpecForge`.

## Capacidades

- Decodificación especulativa: propone bloques de hasta 16 tokens para que Qwen3-8B los verifique; acelera la generación del modelo objetivo solo si el runtime soporta DSpark.
- No genera texto de forma autónoma: no es un modelo instruido ni tiene cabeza de confianza para filtrar propuestas, por lo que siempre requiere el verificador.
- Aprovechamiento de estados internos del objetivo: consume las activaciones de las capas 1, 9, 17, 25 y 33 de Qwen3-8B, de ahí que solo funcione con ese checkpoint exacto.
- Cobertura de distribución: al entrenarse sobre PerfectBlend regenerado con plantilla `qwen3-instruct` y 1,42M de prompts por época, el borrador está ajustado a instrucciones y conversación en modo no-thinking, no a razonamiento largo con cadena de pensamiento.
- Herencia de tokenizador y embedding del objetivo, lo que garantiza compatibilidad exacta de vocabulario en el emparejamiento.
- Soporte de tool calling, agentes, visión o audio: no disponible como capacidad propia; depende exclusivamente de lo que haga el modelo objetivo.
- Capacidades multilingües: no documentadas para el borrador; dependen del tokenizador y de la distribución de entrenamiento (PerfectBlend, mayoritariamente inglés).

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: emparejado con el objetivo en un runtime con soporte de drafters EAGLE/DSpark, el borrador propone bloques de 16 tokens que el modelo grande verifica en un solo forward, reduciendo el número de pasos de decodificación en cargas de generación larga.
- Servicio interactivo de baja latencia: en chat o autocompletado donde el tiempo hasta el primer token y el tiempo por token son críticos, un borrador con solo 1,13B parámetros activos añade poco coste por paso frente al ahorro potencial de verificaciones.
- Reducción de coste en despliegues con GPUs limitadas: mantener el objetivo en BF16 o FP8 y añadir un borrador de ~3,8 GB en BF16 (más el embedding del objetivo) es más barato que escalar a un modelo objetivo mayor.
- Investigación comparada de drafters: sirve para medir empíricamente la tasa de aceptación de un drafter MoE (2×12288, top-1) frente al drafter denso equivalente del mismo autor (`yushengsu/dense-1-8`) sobre el mismo modelo objetivo y la misma receta de datos.
- Estudio de enrutamiento en borradores: con sesgo de selección DeepSeek y pérdida auxiliar `batch_wise`, es un banco de pruebas para analizar equilibrio de expertos, colapso de enrutamiento y su efecto en la aceptación por posición dentro del bloque.
- Validación del tooling SpecForge: el repositorio documenta config, commit y receta de exportación, por lo que es útil como caso de referencia para reproducir un pipeline de entrenamiento de drafters con captura de logits en línea vía SGLang.
- Generación por lotes de datos sintéticos: en pipelines offline donde interesa throughput agregado y no latencia individual, la decodificación especulativa sobre Qwen3-8B puede aumentar tokens por segundo si la tasa de aceptación es alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasa de aceptación (*acceptance rate*), longitud media de aceptación por bloque, factor de aceleración ni evaluaciones de calidad. La tabla de checkpoints por época aparece vacía en el momento de la consulta, por lo que tampoco hay métricas por época comparables.

## Requisitos de hardware

- VRAM del borrador en BF16: aproximadamente 3,8 GB para los 1,88B parámetros, más el embedding del modelo objetivo que se incluye en el directorio exportado (estimación a partir del recuento de parámetros; no verificada).
- VRAM del objetivo: Qwen3-8B en BF16 ocupa del orden de 16 GB, de modo que el emparejamiento completo se sitúa alrededor de 20-22 GB antes de contar caché KV.
- GPU recomendadas: H200/H100 para reproducir el entrenamiento (8× H200); para inferencia, A100 40/80 GB, L40S o H100. El emparejamiento en BF16 entra ajustado en una RTX 4090 de 24 GB y con más holgura si el objetivo se sirve cuantizado (FP8/AWQ/INT4).
- Cabe en GPU de consumo: el borrador solo sí (una RTX 4080/4090 lo aloja sin problema), pero no es útil sin el objetivo; el par completo requiere 24 GB o cuantización del objetivo.
- Opciones de despliegue: el borrador se exporta con `specforge export --to hf` y se entrena con captura de logits vía SGLang, por lo que el camino natural es un runtime con soporte de drafters EAGLE/DSpark. Compatibilidad directa con vLLM, llama.cpp, Ollama o TGI: no disponible (no documentada).
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de factor de aceleración.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto de entrenamiento | Cabezas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`qwen3-8b-moe2x12288-2A1-dspark`) | Drafter DSpark con FFN MoE 2×12288 top-1 | 1,88B totales / 1,13B activos | 8.192 tokens | Markov rango 256, sin cabeza de confianza, bloque 16 | No disponible | Público en HF, 0 descargas |
| `Dogacel/Qwen3-8B-DSpark` | Drafter DSpark (DFlash + Markov + cabeza de confianza), entrenado con TorchSpec | No disponible | No disponible | Markov + confianza | No disponible | Público en HF |
| `yushengsu/dense-1-8` | Drafter denso reducido estructuralmente (2 capas, GQA 8/2, MLP 1536) | ~0,22B | No disponible | Bloque causal 16, sin cabeza de confianza | No disponible | Público en HF |
| Qwen3-8B (objetivo) | LLM denso | 8,2B (no confirmado en la información disponible) | 32.768 nativos, 131.072 con YaRN | — | Apache 2.0 | Público en HF y ModelScope |

La comparación relevante es interna al mismo autor: frente a `dense-1-8` (0,22B, estructura muy reducida), este modelo multiplica por ~8,5 los parámetros totales para aumentar capacidad del drafter manteniendo 1,13B activos. No hay datos públicos de aceptación que permitan decidir cuál compensa más.

## Limitaciones y advertencias

- No es un modelo autónomo: sin Qwen3-8B como verificador no produce salidas válidas; no debe desplegarse como modelo de chat.
- Solo es compatible con el checkpoint exacto `Qwen/Qwen3-8B` y con las capas 1, 9, 17, 25 y 33; cualquier fine-tuning del objetivo o cambio de arquitectura invalida el emparejamiento.
- Licencia no declarada en el repositorio: antes de un uso comercial hay que aclarar la situación, aunque el modelo base Qwen3-8B sea Apache 2.0.
- Entrenado únicamente en modo no-thinking y con plantilla `qwen3-instruct`: la tasa de aceptación puede degradarse en modo thinking, en razonamiento de cadena larga o en dominios poco representados en PerfectBlend.
- Contexto de entrenamiento de 8.192 tokens: no hay evidencia de comportamiento del borrador más allá de esa longitud, aunque el objetivo soporte ventanas mayores.
- Idiomas no documentados; la distribución de entrenamiento (PerfectBlend regenerado en inglés) hace esperable una aceptación menor en castellano u otras lenguas.
- Riesgo de alucinación: el borrador puede proponer tokens incorrectos, pero el verificador del objetivo debería rechazarlos; el riesgo real es de degradación de velocidad, no de calidad, siempre que el runtime implemente la verificación correctamente.
- Sin cabeza de confianza: no hay mecanismo interno para descartar propuestas de baja probabilidad antes de la verificación, lo que puede reducir la ganancia en casos difíciles.
- Sesgos de enrutamiento: pese al sesgo de selección y a la pérdida auxiliar, un MoE top-1 de 2 expertos es propenso a desequilibrios; no se publican estadísticas de utilización por experto.
- Artefacto experimental: 0 descargas y 0 likes, tabla de checkpoints vacía en la model card y sin métricas; no hay evidencia de validación externa.
- Sin cuantizaciones publicadas: no se puede asumir que existan versiones GGUF/AWQ ni que el runtime acepte el drafter cuantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yushengsu/qwen3-8b-moe2x12288-2A1-dspark
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- SpecForge (PR con la config del drafter): https://github.com/sgl-project/SpecForge/pull/1022
- Repositorio SpecForge: https://github.com/sgl-project/SpecForge
- Protocolo de entrenamiento referenciado: https://huggingface.co/jiapingW/Qwen3-8b-dspark-SpecForge
- Drafter DSpark alternativo (TorchSpec): https://huggingface.co/Dogacel/Qwen3-8B-DSpark
- Drafter denso del mismo autor: https://huggingface.co/yushengsu/dense-1-8
- Qwen3-8B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-8B
