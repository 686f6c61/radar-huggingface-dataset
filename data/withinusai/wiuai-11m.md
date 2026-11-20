# WithinUsAI/WIUAI-11M

## Resumen

WIUAI-11M es un modelo de lenguaje de 11,1 millones de parámetros publicado por WithinUsAI en Hugging Face. Se trata de un checkpoint inicial, sin entrenamiento supervisado completado: la propia model card lo describe como un modelo en blanco (*blank tabula rasa*, semilla 1147) cuyo forward pass y generación están verificados en Kaggle, pero cuyas salidas son ruido hasta que se complete el preentrenamiento. No es, por tanto, un modelo utilizable para inferencia real, sino el esqueleto arquitectónico y el tokenizador de un proyecto de decodificación con cadena de pensamiento (chain-of-thought) que el autor planea entrenar.

La arquitectura es un transformer decoder-only de estilo Llama, con RoPE, RMSNorm, SwiGLU y atención con query grouping (GQA), 12 capas, dimensión oculta de 256, 8 cabezas de atención y 2 cabezas KV. El vocabulario es un BPE de 8192 tokens entrenado desde cero sobre TinyStories más una semilla de datos CoT, y el contexto máximo es de 4096 tokens. El modelo define un conjunto amplio de tokens especiales para estructurar el razonamiento (`<|think|>`, `<|answer|>`, `<|task|>`, `<|critique|>`, `<|revise|>`, `<|verify|>`, `<|step|>`, entre otros).

Su relevancia es limitada y de nicho: sirve como referencia para quien quiera reproducir o auditar el diseño de un modelo CoT de escala muy pequeña, o como punto de partida para experimentos de entrenamiento desde cero. No debe confundirse con un modelo listo para producción ni para evaluación comparativa de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RoPE, RMSNorm, SwiGLU, GQA) |
| Parametros totales | 11.147.520 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas | 12 |
| Dimension oculta | 256 |
| Cabezas de atencion | 8 (2 cabezas KV) |
| Dimension intermedia | 768 |
| Vocabulario | 8192 (BPE entrenado desde cero, TinyStories + semilla CoT) |
| Tokens especiales | `<|think|>`, `<|/think|>`, `<|answer|>`, `<|task|>`, `<|user|>`, `<|assistant|>`, `<|system|>`, `<|critique|>`, `<|revise|>`, `<|verify|>`, `<|step|>` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) para la codificación posicional y atención con query grouping (GQA) de 8 cabezas de consulta y 2 cabezas de clave/valor. Los embeddings de entrada y salida están atados, lo que explica el recuento de 11.147.520 parámetros. El tokenizador es un BPE de 8192 tokens entrenado desde cero sobre TinyStories y una semilla de datos con formato CoT.

No se ha completado el preentrenamiento: la model card indica explícitamente que el modelo está en blanco y que la salida es ruido hasta que se entrene con pérdida de modelado causal sobre datos formateados como `<|task|> {prompt} <|think|> {reasoning} <|/think|> <|answer|> {answer} <|eos|>`. El autor sugiere como punto de partida un learning rate de 1e-3, entre 3 y 5 épocas sobre datos CoT de tipo SFT, batch de 32, contexto de 4096, schedule coseno y warmup del 3 por ciento, advirtiendo que un learning rate de 5e-5 durante una sola época dejaría el modelo infraentrenado. No hay información sobre volumen de tokens, composición del dataset final, RLHF ni DPO.

## Capacidades

- No dispone de capacidades funcionales verificadas: el modelo no ha sido preentrenado y genera ruido.
- El diseño prevé generación de texto con razonamiento estructurado mediante los tokens `<|think|>` y `<|/think|>`.
- El diseño prevé soporte de formato conversacional con roles (`<|system|>`, `<|user|>`, `<|assistant|>`).
- El diseño prevé pasos de auto-crítica y revisión mediante `<|critique|>`, `<|revise|>` y `<|verify|>`.
- El diseño prevé descomposición en pasos mediante `<|step|>`.
- No hay soporte confirmado de tool calling ni de function calling.
- No hay soporte confirmado de agentes ni de razonamiento multi-paso en producción.
- Capacidades multilingües: no disponible; el tokenizador se entrenó sobre TinyStories y una semilla CoT, sin datos publicados de cobertura lingüística.
- No hay capacidades de visión ni de audio.

## Casos de uso

- Reproducción de arquitecturas pequeñas: sirve como plantilla para estudiar la implementación de un decoder-only Llama-style de 11M parámetros con GQA y RoPE en un entorno de recursos mínimos.
- Experimentos de tokenización: el tokenizador BPE de 8192 tokens entrenado sobre TinyStories y semilla CoT permite analizar el efecto del vocabulario en modelos de muy baja escala.
- Investigación sobre formato CoT: los tokens especiales `<|think|>`, `<|critique|>` y `<|verify|>` permiten diseñar y comparar esquemas de razonamiento estructurado en modelos pequeños.
- Docencia y formación: útil para explicar el ciclo completo de un modelo desde el checkpoint en blanco hasta el preentrenamiento y el ajuste supervisado.
- Pruebas de pipelines de entrenamiento: el checkpoint permite validar scripts de carga, forward pass y generación antes de lanzar entrenamientos costosos.
- Auditoría de checkpoints: permite verificar el recuento de parámetros, la atadura de embeddings y la coherencia de la configuración publicada frente a los pesos reales.
- Base para ablaciones controladas: al partir de un estado en blanco con semilla fija (1147), facilita comparar variantes de datos y hiperparámetros sin sesgo de inicialización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (11,1M parámetros equivalen a unos 45 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: carga directa con `transformers` en safetensors; no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no estar entrenado no tiene sentido desplegarlo.
- Latencia y throughput estimados: no disponible; al no haber preentrenamiento, las métricas de calidad no son aplicables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| WIUAI-11M | 11,1M | 4096 | no disponible | Checkpoint en blanco, sin preentrenar |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Preentrenado y ajustado |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Preentrenado y ajustado |
| Qwen2.5-0.5B | 0,5B | 32768 | Apache 2.0 | Preentrenado y ajustado |

La comparación es estructural: WIUAI-11M es dos órdenes de magnitud menor que los modelos pequeños habituales y, a diferencia de ellos, no está entrenado. No se dispone de datos de rendimiento para comparar capacidades.

## Limitaciones y advertencias

- El modelo no está preentrenado: sus salidas son ruido y no debe usarse para ninguna tarea de inferencia real.
- No se ha publicado información sobre sesgos; al no haber datos de entrenamiento final, no es posible evaluarlos.
- Riesgo de alucinación: no aplicable en el estado actual, pero será relevante tras el preentrenamiento con datos CoT de baja escala.
- Limitación de contexto: 4096 tokens, reducido frente a modelos contemporáneos.
- Idiomas: sin datos publicados; el tokenizador se entrenó sobre TinyStories, mayoritariamente en inglés.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- El repositorio indica una ruta local específica (`/Users/guyduganii/Desktop/WIUAI-11M`), lo que sugiere que el checkpoint se subió sin una revisión de empaquetado para uso general.
- No hay pipeline declarado en Hugging Face ni descargas ni likes, lo que refleja su carácter experimental.

## Enlaces

- Hugging Face: https://huggingface.co/WithinUsAI/WIUAI-11M
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
