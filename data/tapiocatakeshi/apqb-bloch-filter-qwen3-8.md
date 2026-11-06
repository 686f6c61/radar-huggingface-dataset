# tapiocaTakeshi/apqb-bloch-filter-qwen3.8

## Resumen

Full APQB Bloch Filter × Qwen3.8 es un repositorio de código de investigación publicado por el usuario tapiocaTakeshi en Hugging Face. No se trata de un modelo entrenado, sino de un conjunto de scripts que proponen sustituir o mezclar la activación del MLP con compuertas (gated MLP) de Qwen3.8 por un filtro de Bloch parametrizable, denominado Full APQB Bloch filter, con la fórmula `F = (1 + b·u)/2`. El repositorio se declara explícitamente como "research code (no trained weights yet)": no contiene pesos entrenados ni ha sido evaluado sobre el modelo base Qwen/Qwen3.8-27B.

La propuesta técnica consiste en una capa de investigación que redefine la no linealidad del bloque MLP. En lugar de aplicar únicamente SiLU sobre la compuerta, se introduce una mezcla convexa entre la activación original y una transformación basada en la esfera de Bloch, con un parámetro de mezcla λ inicializado a un valor pequeño. El autor indica que la fórmula de medición proyectiva es estándar en teoría de la información cuántica, y que cualquier novedad dependerá de experimentos comparativos frente a la línea base SiLU/GLU.

Su relevancia actual es limitada y fundamentalmente académica: sirve como punto de partida reproducible para investigadores interesados en explorar activaciones inspiradas en formalismos cuánticos dentro de transformers. No debe confundirse con un modelo desplegable ni con una variante oficial de Qwen3.8. El modelo base declarado, Qwen/Qwen3.8-27B, aparece únicamente como referencia de arquitectura y destino del parcheo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.8 (base) con MLP con compuertas; el repositorio aporta un filtro de activación APQB sobre la esfera de Bloch |
| Parametros totales | No disponible (el modelo base declarado es Qwen/Qwen3.8-27B; el repositorio no contiene pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio contiene código Python: `apqb_filter.py`, `test_tiny.py`, `train_qwen38.py`) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura completa, sino un parche sobre la arquitectura del modelo base Qwen3.8. La innovación propuesta se sitúa en el bloque MLP con compuertas: la salida se calcula como `out = down( up · [(1-λ)·SiLU(g) + λ·F(n(g), φ(up), κ, α, β)] )`, donde `F` es el filtro de Bloch `F = (1 + b·u)/2` y `n = 2(1 - tanh s)` actúa como mapeo de compuerta. El parámetro λ controla la mezcla entre la activación SiLU estándar y el filtro APQB, y se inicializa con un valor pequeño para preservar el comportamiento del modelo base al inicio del entrenamiento.

El script `train_qwen38.py` está diseñado para entrenar únicamente los parámetros del filtro sobre Qwen/Qwen3.8-27B, requiriendo GPU. El script `test_tiny.py` valida el comportamiento sobre un Qwen3 diminuto y aleatorio: comprueba que con φ=0 la salida del filtro es del 100 %, con φ=π es del 0 %, que la salida es idéntica a la del modelo base en la inicialización y que el entrenamiento se ejecuta. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO, porque el autor indica que no hay pesos entrenados ni evaluación sobre el modelo de 27B.

## Capacidades

- No se declaran capacidades funcionales del modelo, ya que el repositorio no contiene pesos entrenados ni un checkpoint evaluado.
- El código permite parchear MLP con compuertas de estilo Qwen para insertar el filtro APQB Bloch.
- Incluye utilidades de prueba sobre un Qwen3 diminuto para verificar el comportamiento del filtro en los extremos de φ y la equivalencia con el modelo base en la inicialización.
- Incluye un script de entrenamiento que congela el modelo base y entrena solo los parámetros del filtro.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades multilingües.

## Casos de uso

- Investigación en activaciones alternativas: el repositorio permite reproducir el parcheo del MLP de Qwen3.8 con el filtro APQB y comparar frente a la línea base SiLU/GLU en un entorno controlado.
- Experimentos de ablation sobre λ: al inicializarse λ a un valor pequeño, se puede estudiar la transición entre la activación original y el filtro de Bloch midiendo el efecto en pérdida y estabilidad del entrenamiento.
- Validación de implementaciones: `test_tiny.py` sirve como prueba de sanidad para verificar que el filtro respeta los casos límite (φ=0 y φ=π) y que no altera la salida del modelo en la inicialización.
- Enseñanza de teoría de la información cuántica aplicada: el mapeo `n = 2(1 - tanh s)` y la fórmula de medición proyectiva pueden usarse como material didáctico para ilustrar la conexión entre formalismos cuánticos y no linealidades en redes neuronales.
- Base para futuros fine-tunes: el script `train_qwen38.py` puede adaptarse para entrenar el filtro sobre Qwen3.8-27B en tareas concretas, siempre que se disponga de GPU y de un conjunto de evaluación propio.
- Reproducibilidad de investigación: al publicarse bajo Apache 2.0 y con código explícito, permite a otros grupos replicar y extender el experimento sin depender de pesos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el código solo se ha verificado en un Qwen3 diminuto y aleatorio, que no se ha entrenado ni evaluado sobre Qwen3.8-27B y que no se emite ninguna afirmación de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos entrenados.
- El script `train_qwen38.py` requiere GPU para entrenar los parámetros del filtro sobre Qwen/Qwen3.8-27B; no se especifica el modelo de GPU ni la VRAM mínima.
- No se indica si cabe en GPU de consumo (RTX 4090 u otras).
- Opciones de despliegue: no aplicables; el repositorio es código de investigación basado en la librería `transformers`, no un checkpoint servible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apqb-bloch-filter-qwen3.8 (este repositorio) | No disponible (sin pesos) | No disponible | Sin benchmarks | Apache 2.0 | Código de investigación en Hugging Face |
| Qwen/Qwen3.8-27B (modelo base declarado) | 27B (según nombre) | No disponible | No disponible | No disponible en la información proporcionada | Referenciado como base, sin ficha propia en la búsqueda |
| Qwen3.8-Max-Preview | 2,4 billones (2.4T) | No disponible | Sin tabla publicada según la fuente | No disponible en la información proporcionada | Preview anunciado en WAIC, sin model card ni licencia publicadas |

La comparación directa no es posible: este repositorio no es un modelo entrenado y no compite en la misma categoría que un checkpoint desplegable. La única referencia externa encontrada es el anuncio de Qwen3.8-Max-Preview, un modelo multimodal de 2,4 billones de parámetros del que la fuente indica que no se publicaron tabla de benchmarks, model card ni licencia en el momento del anuncio.

## Limitaciones y advertencias

- No contiene pesos entrenados: el propio autor lo declara como "research code (no trained weights yet)".
- No ha sido entrenado ni evaluado sobre Qwen3.8-27B; la verificación se limita a un Qwen3 diminuto y aleatorio.
- No se emite ninguna afirmación de rendimiento; cualquier comparación con la línea base SiLU/GLU queda pendiente de experimentos.
- La fórmula de medición proyectiva es estándar en teoría de la información cuántica; la novedad, si existe, depende de resultados experimentales que no se aportan.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no hay modelo funcional que evaluar.
- La licencia Apache 2.0 permite uso comercial del código, pero al no haber pesos entrenados no hay un artefacto comercial listo para producción.
- El modelo base Qwen/Qwen3.8-27B se referencia solo como destino del parcheo; sus condiciones de uso deben verificarse por separado en su propia ficha.
- No apto para despliegue en producción: no hay checkpoint, no hay pipeline declarado y no hay evaluación de latencia ni throughput.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tapiocaTakeshi/apqb-bloch-filter-qwen3.8
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Anuncio de Qwen3.8-Max-Preview (MarkTechPost): https://www.marktechpost.com/2026/07/19/alibaba-previews-qwen3-8-max-a-2-4-trillion-parameter-multimodal-model-days-after-moonshots-kimi-k3-open-weight-launch/
