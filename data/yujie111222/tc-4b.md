# yujie111222/tc-4b

## Resumen

tc-4b es un ajuste fino por LoRA del modelo torchcast-ai/torchcast-decision-4b v1.3.1, que a su vez deriva de Qwen3.5-4B. Lo publica el usuario yujie111222 en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de decisión multimodal (entrada imagen-texto) orientado a la evaluación de decisiones y a tareas de razonamiento estructurado, no a la generación de texto conversacional convencional. El modelo conserva la arquitectura de su base, un transformer de aproximadamente 5.170 millones de parámetros, y se distribuye con pesos en safetensors ya fusionados (LoRA mergeada).

La relevancia de este modelo es acotada: se trata de un experimento de continuación de entrenamiento (49 pasos de optimizador) sobre un subconjunto filtrado por licencia del dataset DecisionBank-260k, con el objetivo de mejorar la calidad de las distribuciones de probabilidad en preguntas de tipo "score" del benchmark JevBench. No es un modelo generalista ni un candidato razonable para producción fuera del ecosistema de servicio específico de Torchcast, ya que sus capas de atención completa son no causales y requieren el paquete de servicio propietario incluido.

Al estar publicado en noviembre de 2026, sin descargas ni interacciones registradas y con una model card muy breve, debe considerarse un artefacto de investigación de nicho más que un modelo listo para adopción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B), con capas de atención completa no causal en el modelo de decisión |
| Parametros totales | 5.174.964.736 (aprox. 5,17 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B a través de torchcast-decision-4b v1.3.1. Sobre esa base se aplicó un ajuste fino con LoRA de rango 32, alpha 64 y tasa de aprendizaje 1e-4 durante 49 pasos de optimizador, con posterior fusión de los pesos adaptadores en el modelo final (merge documentado con SHA-256 por fichero en `merge_manifest.json`). Los datos de entrenamiento provienen de un subconjunto de DecisionBank-260k: se muestrearon 100.000 filas bajo una lista blanca de licencias (apache, mit, bsd, cc-by, cc0, unlicense, dominio público), de las que se admitieron aproximadamente 94.000. La model card indica explícitamente que no se usaron ítems del split público de JevBench.

La innovación técnica principal no está en el entrenamiento sino en la interfaz de servicio: el modelo se distribuye con el paquete `torchcast_decision/` y un `decision_config.json`, y sus capas de atención completa son no causales. Esto implica que runtimes causales genéricos como vLLM o llama.cpp no reproducen el comportamiento evaluado; es necesario seguir las instrucciones de servicio del modelo base (repositorio GitHub de Torchcast, etiqueta v1.3.1). No se documenta el número total de tokens de entrenamiento ni la composición detallada del dataset más allá del filtrado por licencia.

## Capacidades

- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Modelo de decisión: produce distribuciones de probabilidad sobre opciones, orientado a preguntas de tipo "score" y a la estimación de valores esperados.
- Calibración de incertidumbre: la métrica de calibración del benchmark interno es alta (91,26 sobre 231 ítems públicos de JevBench con el scorer v1.6).
- Conversacional según los tags del repositorio, aunque la interfaz evaluada es la de decisión, no la de chat causal estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio adicionales: no disponibles en la información proporcionada más allá de la entrada imagen-texto.

## Casos de uso

- Evaluación de decisiones con incertidumbre calibrada: el modelo devuelve distribuciones sobre opciones en lugar de una única respuesta, lo que permite a un sistema aguas abajo ponderar riesgos; encaja en pipelines de scoring donde la calibración importa más que el argmax.
- Investigación en benchmarks de decisión: sirve como punto de comparación frente a torchcast-decision-4b v1.3.1 para estudiar el efecto de un ajuste LoRA corto (49 pasos) sobre la calidad distribucional.
- Análisis de documentos con componente visual: al aceptar imagen-texto, puede emplearse en tareas donde la decisión depende de una captura, un gráfico o un formulario escaneado junto con texto.
- Filtrado y priorización de candidatos: en procesos de selección o triaje donde se necesita una puntuación probabilística por candidato en lugar de una etiqueta dura.
- Reproducción de experimentos de ajuste fino: el manifiesto de merge y la configuración LoRA permiten auditar y replicar el entrenamiento en entornos de investigación.
- Estudio de interfaces no causales: útil para quienes investigan arquitecturas de decisión con atención completa no causal y quieren comparar con runtimes causales estándar.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 231 ítems públicos de JevBench con el scorer v1.6:

| Metrica | tc-4b (step-49) | Base v1.3.1 |
|---|---|---|
| Intelligence | 79,81 | 74,93 |
| Calibration | 91,26 | 87,82 |
| Capability | 85,54 | 81,37 |

La model card señala que las ganancias se concentran en el tipo de pregunta "score" (calidad de la distribución y distancia al valor esperado), no en la precisión del argmax. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 10-11 GB solo para pesos, más overhead de activaciones y del paquete de servicio; en la práctica, 16-24 GB es un punto de partida razonable.
- En cuantización de 8 bits: del orden de 6-7 GB de pesos; en 4 bits, alrededor de 3-4 GB, aunque no se documentan cuantizaciones oficiales ni su compatibilidad con la interfaz no causal.
- GPU recomendadas: A100 o H100 para evaluación a escala; RTX 4090 (24 GB) para inferencia individual en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en fp16 (RTX 4080, 4090, A6000); en 8 GB solo con cuantización agresiva y sin garantía de reproducir la interfaz evaluada.
- Opciones de despliegue: el paquete `torchcast_decision/` con `decision_config.json` según las instrucciones del repositorio GitHub de Torchcast (v1.3.1). vLLM, llama.cpp, Ollama y TGI no reproducen la interfaz evaluada al asumir atención causal.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Interfaz | Disponibilidad |
|---|---|---|---|---|---|
| tc-4b | 5,17 B | No disponible | Apache 2.0 | Decision no causal (paquete propio) | HuggingFace, 0 descargas |
| torchcast-decision-4b v1.3.1 | No disponible | No disponible | Apache 2.0 | Decision no causal (paquete propio) | HuggingFace (modelo base) |
| Qwen3.5-4B | No disponible | No disponible | Apache 2.0 | Causal estándar | HuggingFace (modelo raíz) |

No se dispone de datos de rendimiento comparables entre estos modelos más allá de los del benchmark interno JevBench ya mostrados. Para alternativas generalistas de tamaño similar (por ejemplo, otros transformers de 4-7 B), no hay información en la documentación proporcionada que permita una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo conversacional general; su interfaz evaluada es la de decisión con atención no causal, y usarlo como chat causal produce resultados no validados.
- Incompatibilidad con runtimes estándar: vLLM, llama.cpp, Ollama y TGI no reproducen el comportamiento evaluado; el despliegue requiere el paquete `torchcast_decision/` y seguir las instrucciones del repositorio de Torchcast.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5-4B y de un subconjunto de DecisionBank, puede heredar sesgos de ambos.
- Riesgo de alucinación: no evaluado ni documentado; la calibración reportada se refiere a la distribución sobre opciones, no a la veracidad factual del texto generado.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica ventana de contexto ni cobertura lingüística.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de atribución a Torchcast AI y Alibaba Cloud indicados en `LICENSE` y `NOTICE`.
- Madurez: publicado en noviembre de 2026 con 0 descargas y 0 likes; no hay evidencia de uso en producción ni de validación externa independiente.
- Datos de entrenamiento: el filtrado por licencia reduce el riesgo legal, pero no se detalla la composición temática ni la calidad del subconjunto admitido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yujie111222/tc-4b
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Instrucciones de servicio del modelo base (v1.3.1): https://github.com/Torchcast-AI/torchcast-decision-4b/tree/v1.3.1#run-for-evaluation
