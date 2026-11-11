# tanmay891/tiny-aya-indicfin-sft3

## Resumen

`tanmay891/tiny-aya-indicfin-sft3` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `CohereLabs/tiny-aya-global`, un modelo pequeño de la familia Aya de Cohere Labs orientado a cobertura multilingüe. El adaptador ha sido entrenado con las librerías TRL y Unsloth, empaquetado en formato PEFT y publicado en Hugging Face con fecha de creación del 11 de noviembre de 2026. El repositorio ocupa 0.3 GB, lo que corresponde al peso de los tensores del adaptador más los ficheros de configuración, no al modelo completo.

El nombre del adaptador (`indicfin`) sugiere un ajuste orientado a lenguas índicas y a dominios financieros, aunque la model card no confirma explícitamente ni la composición del dataset ni los idiomas objetivo. El autor no ha documentado prácticamente ningún detalle: la tarjeta es la plantilla por defecto de Hugging Face con la mayoría de campos marcados como "[More Information Needed]".

La relevancia de esta ficha es doble: por un lado, documenta un artefacto concreto escasamente documentado; por otro, sirve de ejemplo de buenas prácticas ausentes en publicaciones de adaptadores LoRA, donde la falta de especificaciones impide evaluar la calidad y reproducibilidad del ajuste. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no hay benchmarks ni datos de entrenamiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (`CohereLabs/tiny-aya-global`) |
| Parametros totales | no disponible (el adaptador ocupa 0.3 GB en el repo; el modelo base no se incluye) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; cuantización posterior a cargo del usuario) |
| Idiomas soportados | no disponible (el nombre sugiere índicas; sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `CohereLabs/tiny-aya-global`. La arquitectura subyacente es la del modelo Aya pequeño de Cohere Labs, un transformer decoder-only; el adaptador añade matrices de bajo rango en las capas seleccionadas, según la configuración PEFT 0.21.2 indicada en la tarjeta. El entrenamiento se realizó con TRL (probablemente `SFTTrainer`) y Unsloth, una librería que optimiza el fine-tuning de LLM en GPUs de consumo mediante kernels personalizados y reducción de memoria.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior, hiperparámetros (learning rate, rango LoRA, alpha, dropout) ni la estrategia de enmascarado de pérdida. Tampoco se documenta si el ajuste incluyó datos de instrucciones multilingües, financieros o ambos. La única pista es el nombre del repositorio, que combina "indic" y "fin", pero se trata de una inferencia no verificada. Sin esa información, no es posible evaluar la calidad del ajuste ni reproducirlo.

## Capacidades

- Generación de texto conversacional: al ser un adaptador SFT sobre un modelo de instrucciones, se espera que mantenga el formato chat del modelo base, aunque no se documenta la plantilla utilizada.
- Multilingüismo potencial: el modelo base `tiny-aya-global` está diseñado para cobertura multilingüe amplia; el adaptador podría reforzar lenguas índicas, pero no está confirmado.
- Razonamiento y código: capacidades heredadas del modelo base, no evaluadas tras el ajuste.
- Tool calling / function calling: no documentado; depende de si el modelo base lo soporta y de si el SFT lo preserva.
- Agentes y multi-step reasoning: no documentado.
- Modo thinking, visión o audio: no disponible.
- Especialización financiera: posible según el nombre del adaptador, sin evidencia publicada.

## Casos de uso

- Experimentación académica con adaptadores LoRA: el reducido tamaño del repositorio (0.3 GB) permite descargar y probar el adaptador en entornos con recursos limitados, útil para estudiar técnicas de SFT con Unsloth y TRL.
- Prototipado rápido de asistentes multilingües: si el adaptador conserva las capacidades del modelo base, puede emplearse para generar respuestas conversacionales en varios idiomas en fases tempranas de un producto, siempre con evaluación previa.
- Investigación sobre lenguas índicas: el nombre sugiere un ajuste orientado a este grupo lingüístico; podría servir como punto de partida para comparar adaptadores en tareas de generación en hindi, bengalí, tamil u otras lenguas, previa verificación empírica.
- Fine-tuning incremental: al ser un adaptador PEFT, puede combinarse con otros adaptadores o continuar entrenándose sobre datos propios, lo que lo hace útil como base para pipelines de experimentación.
- Evaluación de dominios financieros: si el ajuste incluye datos financieros, podría emplearse en tareas de resumen o clasificación de textos económicos, aunque sin benchmarks publicados el riesgo de alucinación es alto.
- Docencia y formación: sirve como ejemplo práctico de publicación de adaptadores LoRA en Hugging Face, incluyendo las carencias documentales habituales en este tipo de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base `tiny-aya-global`, no del adaptador. Al no publicarse el número de parámetros del base, no se puede dar una cifra fiable; los modelos "tiny" de la familia Aya suelen situarse en el rango de cientos de millones a pocos miles de millones de parámetros, pero este dato no está confirmado.
- GPU recomendadas: no disponible; en general, un adaptador LoRA de 0.3 GB puede cargarse en GPUs de consumo (RTX 3060, 4060, 4090) siempre que el modelo base quepa en memoria.
- Cabe en consumer GPU: probablemente sí, condicionado al tamaño del modelo base y a la cuantización aplicada.
- Opciones de despliegue: PEFT + Transformers (carga directa del adaptador), vLLM (si se fusiona el adaptador con el base), llama.cpp/Ollama (requiere conversión a GGUF tras fusionar), TGI (previa fusión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han publicado datos de rendimiento ni especificaciones del adaptador que permitan una comparación rigurosa con otras alternativas de la misma categoría (adaptadores LoRA sobre modelos pequeños multilingües). Como referencia estructural, podría compararse con otros adaptadores PEFT publicados sobre `CohereLabs/tiny-aya-global`, pero no se dispone de información sobre ellos en el contexto proporcionado.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto, sin datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no especificada: impide determinar si el uso comercial está permitido; debe consultarse la licencia del modelo base `CohereLabs/tiny-aya-global` y del adaptador por separado.
- Idiomas no confirmados: la inferencia sobre lenguas índicas y dominio financiero se basa únicamente en el nombre del repositorio.
- Riesgo de alucinación: sin benchmarks ni evaluación, no hay evidencia de la fiabilidad del ajuste; en dominios especializados como finanzas el riesgo es especialmente alto.
- Sesgos: heredados del modelo base y del dataset de SFT, no documentados.
- Reproducibilidad: imposible sin información sobre datos, hiperparámetros y entorno de entrenamiento.
- Uso en producción: desaconsejado sin una evaluación propia exhaustiva y sin verificar la licencia.
- Fecha de creación futura (2026): conviene verificar la integridad del repositorio y la identidad del autor antes de confiar en el artefacto.

## Enlaces

- [Hugging Face: tanmay891/tiny-aya-indicfin-sft3](https://huggingface.co/tanmay891/tiny-aya-indicfin-sft3)
- [Modelo base: CohereLabs/tiny-aya-global](https://huggingface.co/CohereLabs/tiny-aya-global)
- [PEFT (Hugging Face)](https://github.com/huggingface/peft)
- [TRL (Hugging Face)](https://github.com/huggingface/trl)
- [Unsloth](https://github.com/unslothai/unsloth)
- [Paper de referencia sobre impacto ambiental: Lacoste et al. (2019)](https://arxiv.org/abs/1910.09700)
