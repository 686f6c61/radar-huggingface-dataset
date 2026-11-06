# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch07

## Resumen

Este modelo es un checkpoint de investigación derivado de la familia Phi-1.5, publicado por el usuario `unl-reset` en Hugging Face. Concretamente, se trata de un ajuste fino sobre `locuslab/tofu_ft_phi-1.5`, que a su vez es un modelo Phi-1.5 afinado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo declarado en la model card es el "unlearning" selectivo: hacer que el modelo olvide un subconjunto concreto de datos (la partición `forget10`) manteniendo el rendimiento sobre el resto (partición `retain`).

La relevancia de este checkpoint es fundamentalmente académica: sirve como artefacto reproducible para estudiar técnicas de desaprendizaje en modelos de lenguaje. La estrategia aplicada combina la reinicialización de los embeddings de entrada y de la cabeza LM (tomados de `microsoft/phi-1_5`) con un entrenamiento que minimiza una pérdida de tipo IHL ("token IHL") sobre el conjunto a olvidar más una entropía cruzada estándar sobre el conjunto a retener. El resultado es un modelo completo independiente, no un adaptador.

Arquitectónicamente hereda la estructura de Phi-1.5: un transformer decoder-only de aproximadamente 1.400 millones de parámetros, con 24 capas y una longitud de contexto de 2.048 tokens. No incorpora innovaciones de arquitectura propias; su interés reside en el procedimiento de desaprendizaje y en la posibilidad de comparar su comportamiento frente al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (heredada de Phi-1.5) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y `ihl_manifest.json` asociado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Phi-1.5, con 24 capas, dimensión oculta de 2.048 y 32 cabezas de atención, lo que arroja los 1.418 millones de parámetros indicados en los pesos. La ventana de contexto es de 2.048 tokens. No emplea mezcla de expertos ni mecanismos de atención lineal: es una arquitectura densa convencional.

El procedimiento de entrenamiento parte de `locuslab/tofu_ft_phi-1.5` y aplica una reinicialización parcial: los embeddings de entrada y la cabeza LM se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo base afinado. Sobre esa inicialización se optimiza una pérdida compuesta por un término IHL ("token IHL") sobre la partición `forget10` de TOFU más una entropía cruzada con peso 1.0 sobre la partición `retain`. El checkpoint corresponde a la época 7 de 20. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset TOFU ni si se aplicaron etapas de RLHF o DPO; TOFU es un corpus sintético de preguntas y respuestas sobre autores ficticios, diseñado específicamente para evaluar desaprendizaje.

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5, orientada a texto de tipo libro de texto y razonamiento básico.
- Razonamiento de sentido común y matemáticas elementales, heredado del preentrenamiento de Phi-1.5.
- Generación de código sencillo en Python, también heredada del modelo original.
- Capacidad de "desaprendizaje" parcial: se espera que el modelo haya perdido parte de la información de la partición `forget10`, aunque la magnitud exacta no se documenta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüismo limitado al inglés.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Investigación en machine unlearning: el checkpoint permite reproducir y comparar el efecto de la estrategia IHL + reset de embeddings frente a otras técnicas sobre el mismo conjunto TOFU.
- Evaluación de olvido selectivo: sirve para medir la degradación en la partición `forget10` y la retención en `retain` mediante las métricas estándar de TOFU (probabilidad de verdad, ROUGE, etc.).
- Análisis de estabilidad de embeddings: al reinicializar embeddings y cabeza LM, permite estudiar cómo afecta esa reinicialización a la representación léxica y a la perplejidad en dominios no olvidados.
- Baseline para comparativas de épocas: al ser la época 7 de 20, permite trazar curvas de olvido/retención a lo largo del entrenamiento si se dispone de los checkpoints intermedios.
- Estudio de sesgos post-desaprendizaje: útil para analizar si el procedimiento introduce artefactos o sesgos nuevos en las respuestas.
- Docencia y formación: ejemplo práctico de pipeline de desaprendizaje con pérdida compuesta y reinicialización parcial de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB de pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB.
- En cuantización de 8 bits: alrededor de 1,5-2 GB de VRAM.
- En cuantización de 4 bits: alrededor de 1-1,5 GB de VRAM, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) para fp16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `custom_code`); vLLM y TGI deberían funcionar tras convertir los pesos, aunque no se documenta compatibilidad oficial. llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch07 | 1,42 B | 2.048 | apache-2.0 | Checkpoint de desaprendizaje sobre TOFU, época 7/20 |
| microsoft/phi-1_5 | 1,42 B | 2.048 | MIT | Modelo base original, sin desaprendizaje |
| locuslab/tofu_ft_phi-1.5 | 1,42 B | 2.048 | no disponible | Modelo afinado sobre TOFU completo, base directa de este checkpoint |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Es un artefacto de investigación: no se ha validado para uso en producción ni se han publicado evaluaciones de robustez, sesgos o alucinación.
- El proceso de desaprendizaje puede no eliminar por completo la información de la partición `forget10`; la efectividad real no está cuantificada en la información disponible.
- La reinicialización de embeddings y cabeza LM puede degradar la calidad general del modelo en dominios no relacionados con TOFU.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT) y el modelo intermedio `locuslab/tofu_ft_phi-1.5` no documenta licencia en la información disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Requiere `trust_remote_code=True` por el `custom_code` incluido, lo que implica ejecutar código del autor.
- No se distribuyen pesos cuantizados ni se documenta compatibilidad con motores de inferencia populares.
- Riesgo de alucinación inherente a los modelos de 1,4 B parámetros de esta generación.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch07
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
