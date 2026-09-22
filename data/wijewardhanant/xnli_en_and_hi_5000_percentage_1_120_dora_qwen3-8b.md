# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_DoRA_Qwen3-8b

## Resumen

El modelo `WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_DoRA_Qwen3-8b` es un adaptador PEFT entrenado mediante DoRA (Weight-Decomposed Low-Rank Adaptation) sobre el modelo base `Qwen/Qwen3-8B-Base`. No se trata de un modelo completo, sino de un conjunto de pesos delta (0,7 GB en el repositorio) que debe cargarse junto al modelo base de 8B parámetros para poder ejecutar inferencia. Lo publica el usuario WijewardhanaNT en HuggingFace, con licencia no declarada, cero descargas y cero interacciones en el momento de redactar esta ficha.

El nombre del repositorio indica el propósito del ajuste: XNLI (Cross-lingual Natural Language Inference) sobre inglés (`en`) y hindi (`hi`), con una configuración de datos que el identificador cifra en 5.000 ejemplos, un porcentaje de 1 y un valor 120 (probablemente pasos o epochs, aunque no está documentado). XNLI es una tarea de inferencia textual con tres etiquetas (implicación, neutral y contradicción), por lo que el adaptador está orientado a clasificación de relaciones entre pares de frases más que a generación abierta, a pesar de que la tarjeta lo etiqueta con el pipeline `text-generation`.

Su relevancia es limitada y fundamentalmente experimental: se trata de un artefacto de investigación sin model card completada (todos los campos figuran como "[More Information Needed]"), sin resultados de evaluación publicados y sin licencia declarada. Resulta útil como referencia para estudiar recetas de ajuste DoRA multilingüe sobre Qwen3-8B, pero no es apto para producción sin una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-8B-Base) con adaptador DoRA/LoRA acoplado |
| Parametros totales | 8.190 millones en el modelo base (cifra publica de Qwen3-8B, no verificada en este repositorio); el adaptador es un delta de bajo rango de 0,7 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No documentada en el adaptador; depende del modelo base Qwen3-8B (32.768 tokens nativos segun la documentacion de Qwen, dato no verificado en esta informacion) |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; la cuantizacion se aplicaria sobre el modelo base fusionado o cargado con el adaptador |
| Idiomas soportados | El ajuste cubre ingles (`en`) e hindi (`hi`) segun el identificador. Idiomas del modelo base: no disponibles en esta informacion |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (formato PEFT, libreria `peft` 0.17.1) |
| Pipeline declarado | `text-generation` |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion | 2026-09-21 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen3-8B-Base, un transformer decoder-only denso. La innovación concreta de este repositorio es el método de ajuste: DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone el peso preentrenado en una componente de magnitud y una componente de dirección, y aplica la actualización de bajo rango solo sobre esta última. En la práctica, DoRA suele mejorar la estabilidad y la calidad del ajuste fino frente a LoRA estándar con un coste computacional adicional pequeño, y es la técnica que la etiqueta `lora` del repositorio refleja (PEFT implementa ambas).

No hay información publicada sobre el procedimiento de entrenamiento: ni el número de tokens vistos, ni la composición exacta del dataset (aunque el nombre apunta a 5.000 ejemplos de XNLI en inglés y hindi), ni hiperparámetros como rango, alpha, dropout, tasa de aprendizaje o precisión (fp16/bf16). Tampoco se documenta si hubo una fase de RLHF o DPO, algo poco habitual en un ajuste supervisado de inferencia textual. El identificador sugiere además una ablación con "percentage 1" y un valor "120", posiblemente relacionados con el submuestreo del corpus y el número de pasos, pero se trata de una interpretación del nombre, no de un dato confirmado.

## Capacidades

- Clasificación de inferencia textual (NLI) en inglés y hindi: dado un par premisa-hipótesis, el ajuste apunta a distinguir implicación, neutralidad y contradicción, presumiblemente mediante generación de la etiqueta al ser un modelo causal.
- Procesamiento multilingüe limitado al par inglés-hindi cubierto por XNLI; no hay evidencia de transferencia a otras lenguas.
- Generación de texto genérica heredada del modelo base Qwen3-8B-Base, aunque degradada o redirigida por el ajuste específico de la tarea.
- Tool calling / function calling: no disponible; no se documenta soporte en el adaptador ni en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Modo thinking explícito: no disponible (el ajuste parte de la variante `Base`, no de la serie instruct o thinking de Qwen3).
- Visión o audio: no disponibles.
- Capacidades especiales adicionales: no disponibles.

## Casos de uso

- Verificación de afirmaciones en inglés e hindi: el adaptador puede emplearse para comprobar si una hipótesis se deriva de una premisa documental, un paso habitual en pipelines de fact-checking automatizado sobre corpus bilingües.
- Detección de contradicciones en respuestas RAG: comparar la respuesta generada por un sistema de recuperación con el fragmento recuperado para marcar contradicciones antes de mostrarla al usuario final.
- Filtrado de alucinaciones en asistentes: usar el modelo como clasificador auxiliar que mida si una frase generada es implicada o contradicha por el contexto de entrada, especialmente en despliegues con contenido en hindi.
- Preetiquetado de corpus XNLI: generar etiquetas preliminares sobre nuevos pares de frases para reducir el coste de anotación humana, con revisión posterior obligatoria dado que no hay métricas publicadas.
- Investigación en adaptación eficiente de parámetros: servir como punto de comparación reproducible para estudiar DoRA frente a LoRA sobre Qwen3-8B en tareas de clasificación multilingüe.
- Análisis de coherencia en sistemas de preguntas y respuestas multilingües: comprobar si la respuesta en inglés y su traducción al hindi mantienen la misma relación lógica respecto a la pregunta original.
- Aprendizaje por transferencia hacia lenguas índicas: punto de partida para experimentos de ajuste adicional sobre otras lenguas del subcontinente con presupuestos de cómputo reducidos, dado el tamaño del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye sección de evaluación, ni métricas de precisión sobre XNLI (inglés o hindi), ni comparaciones con líneas base. Cualquier cifra de rendimiento debería obtenerse ejecutando una evaluación propia del adaptador sobre el split de test de XNLI, ya que no existe dato verificable en la información proporcionada.

## Requisitos de hardware

- Los pesos del adaptador ocupan 0,7 GB en disco, pero la inferencia requiere cargar el modelo base Qwen3-8B completo; el adaptador no funciona de forma autónoma.
- VRAM estimada con el modelo base en fp16/bf16: en torno a 16-17 GB solo para pesos, más la caché KV, que crece con la longitud de contexto. Con contextos largos se superan con facilidad los 20 GB.
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-10 GB de pesos. Con cuantización de 4 bits: aproximadamente 5-7 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues con contexto largo y varios usuarios concurrentes. Para uso individual, RTX 4090 o RTX 3090 (24 GB) permiten fp16 con contexto moderado y cuantización agresiva con contexto amplio.
- Compatibilidad con GPU de consumo: sí, en tarjetas de 16 GB o más con cuantización de 4 bits; en 8-12 GB solo con cuantización agresiva y ventanas de contexto cortas.
- Opciones de despliegue: vLLM y TGI admiten carga de adaptadores LoRA sobre el modelo base; llama.cpp y Ollama requieren convertir el modelo y, en la mayoría de flujos, fusionar el adaptador con los pesos base antes de generar el GGUF. La carga directa mediante `peft` con Transformers es la vía más sencilla para evaluaciones puntuales.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni parámetros de generación documentados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Qwen3-8B-Base) | 8.190 M en el base + delta de 0,7 GB | No documentado | Ingles e hindi (ajuste) | No disponible | safetensors / PEFT | Repositorio publico, 0 descargas |
| Qwen/Qwen3-8B-Base | 8.190 M | 32.768 tokens (documentacion de Qwen) | Multilingue (119 idiomas segun Qwen) | Apache 2.0 | safetensors | Ampliamente disponible |
| Qwen/Qwen3-8B (instruct) | 8.190 M | 32.768 tokens | Multilingue | Apache 2.0 | safetensors | Ampliamente disponible |
| XLM-RoBERTa-large ajustado en XNLI | 559 M | 512 tokens | Multilingue | MIT (modelo base) | safetensors / PyTorch | Ampliamente disponible |

No se dispone de cifras de exactitud en XNLI para ninguna de las filas dentro de la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia. Para una comparación de rendimiento real sería necesario evaluar los cuatro modelos sobre el mismo split de XNLI en inglés y hindi.

## Limitaciones y advertencias

- Model card sin contenido útil: todos los campos relevantes (uso previsto, datos de entrenamiento, sesgos, resultados) figuran como "[More Information Needed]", lo que impide evaluar el artefacto con criterios mínimos de reproducibilidad.
- Licencia no declarada: no se puede confirmar si se permite uso comercial. El modelo base Qwen3-8B-Base es Apache 2.0, pero la licencia del adaptador depende del autor y no está especificada.
- Riesgo de alucinación: al ser un modelo causal ajustado para una tarea de clasificación, puede generar texto libre en lugar de una etiqueta válida, especialmente con entradas fuera de la distribución de XNLI.
- Cobertura lingüística restringida a inglés e hindi; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- Posible desajuste de tarea: la etiqueta de pipeline es `text-generation`, pero el ajuste corresponde a una tarea de clasificación de tres clases; conviene validar el formato de salida esperado antes de integrarlo.
- Sin validación comunitaria: cero descargas y cero likes implican que el adaptador no ha sido verificado por terceros.
- Sesgos del corpus XNLI: los datos de XNLI provienen de textos periodísticos y reflejan los sesgos de sus fuentes originales, que se trasladan al adaptador.
- Metadatos potencialmente inconsistentes: la fecha de creación registrada y el identificador del repositorio no se corresponden con documentación publicada, lo que dificulta trazar la procedencia del experimento.
- Sin resultados de evaluación: no existe ninguna métrica que respalde su uso, por lo que cualquier despliegue en producción requiere una evaluación propia previa.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_DoRA_Qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, estimacion de emisiones de carbono): https://arxiv.org/abs/1910.09700
- Documentacion de PEFT (libreria declarada, version 0.17.1): https://huggingface.co/docs/peft
- Calculadora de impacto de Machine Learning mencionada en la plantilla de la model card: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este adaptador en la busqueda web realizada.
