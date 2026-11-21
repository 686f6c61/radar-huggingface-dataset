# Topovoid/TopoVoid-0.2B-Orthogonal-Preview

## Resumen

TopoVoid-0.2B-Orthogonal-Preview es un modelo de lenguaje causal bilingüe (inglés y chino) de 212 millones de parámetros desarrollado por Topovoid. Se presenta como una vista previa de la arquitectura TopoVoid, cuyo rasgo distintivo es la incorporación de cuellos de botella conceptuales explícitos en las capas 7 y 12 que particionan el flujo residual de 1024 dimensiones en un subespacio conceptual protegido de 176 dimensiones y un subespacio escribible ortogonal de 848 dimensiones. El modelo está pensado como banco de pruebas para técnicas de edición de conocimiento y recuperación de contexto largo, más que como un asistente de propósito general.

La propuesta técnica central es la escritura directa de pesos en forma cerrada: nuevos hechos se compilan en las capas superiores sin pasos de optimizador y sin sobrecarga de prompt, preservando intactas las representaciones conceptuales de la capa 7 (coseno de 1.000). Además, incorpora un mecanismo de recuperación de conceptos para contextos largos que usa la ventana nativa de 4096 tokens para entradas cortas y recupera turnos desalojados mediante estados conceptuales de capas intermedias más allá de ese límite.

Con licencia Apache-2.0 y un tamaño de repositorio de 0,8 GB, el modelo es relevante ahora como referencia abierta para investigación en edición de conocimiento sin reentrenamiento, interpretabilidad mediante cuellos de botella y gestión de contexto extendido a bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con cuellos de botella conceptuales (concept bottleneck) en capas 7 y 12; atención GQA con QK-RMSNorm; RoPE |
| Parametros totales | 212.011.264 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos (RoPE) + recuperación de desbordamiento conceptual activada por defecto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 16 capas con `d_model = 1024` y `d_ff = 2432` (SwiGLU), 16 cabezas de consulta y 4 cabezas KV (GQA), con QK-RMSNorm. El vocabulario activo es de 49.152 tokens bilingües con formato ChatML (`<|im_start|>` / `<|im_end|>`). La innovación estructural son los cuellos de botella conceptuales: en la capa 7 un cuello denso de 24 dimensiones más uno disperso de 40 dimensiones sobre 256 átomos con Top-8, y en la capa 12 un cuello tipo highway de 24 dimensiones. La partición del subespacio separa 176 dimensiones protegidas de 848 dimensiones escribibles ortogonales, con una fuga máxima medida de 1.34e-7.

En cuanto a entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La documentación se centra en los mecanismos posteriores al entrenamiento: la compilación de pesos en forma cerrada (`closed_form_write.py`) que escribe hechos directamente en las capas 8-11 sin pasos de optimizador, y el sistema de recuperación de contexto largo (`midcbm_infinite_context = true`) que mantiene cero sobrecarga de logits para entradas de hasta 4096 tokens. También se describe una lectura de representaciones con pocas etiquetas sobre características congeladas de la capa 7 y del cuello de botella.

## Capacidades

- Generación de texto causal bilingüe inglés-chino con plantilla de chat ChatML.
- Edición de conocimiento por escritura directa de pesos: compilación de hechos nuevos en capas superiores sin reentrenamiento ni prompt adicional.
- Recuperación de conceptos en contexto largo: recuerdo de turnos desalojados más allá de la ventana nativa de 4096 tokens mediante estados conceptuales de capas intermedias.
- Lectura de representaciones de bajo etiquetado: separación de temas con características congeladas y mínimas etiquetas.
- Índice conceptual externo: consulta de conocimiento indexado sin modificar los pesos base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Edición de conocimiento en producción sin reentrenamiento: compilar hechos actualizados (por ejemplo, precios o políticas) en las capas 8-11 mediante `closed_form_write.py`, con tiempos de compilación de 1,37 s para un hecho y 6,53 s para 40, evitando ciclos completos de fine-tuning.
- Atención al cliente con memoria de sesión larga: gestionar conversaciones multi-turno que superen los 4096 tokens usando la recuperación de desbordamiento conceptual, que alcanzó un 100 % de recuerdo de fragmentos en sesiones de 6,5K-11,4K tokens.
- Clasificación de textos con pocas etiquetas: usar la lectura ridge sobre características congeladas de la capa 7 para separar temas con 10 etiquetas por clase, donde superó a la línea base TF-IDF en AG News (+19,88 pp) y DBpedia-14 (+0,47 pp).
- Investigación en interpretabilidad: analizar las representaciones del subespacio protegido de 176 dimensiones para estudiar cómo se organizan los conceptos y verificar la no interferencia de las escrituras (coseno de 1.000 en la capa 7).
- Construcción de índices de conocimiento consultables: indexar un corpus de preguntas y respuestas y consultarlo mediante el índice conceptual externo, que elevó la precisión en ARC del 33,33 % al 68,42 % sin tocar los pesos base.
- Prototipado de asistentes bilingües de bajo coste: desplegar un modelo de 212 M de parámetros en entornos con recursos limitados para flujos conversacionales en inglés y chino con formato ChatML.
- Experimentación con apilado de módulos de conocimiento: combinar módulos compilados de forma independiente (dos módulos de 40 hechos retuvieron un 96,25 % de Top-1) para construir bases de conocimiento modulares.

## Benchmarks y rendimiento

Escritura de pesos en forma cerrada (CounterFact, métricas sobre el primer token objetivo):

| Hechos / modulo | Rewrite Top-1 | ES | PS | Paraphrase Top-1 | C4 PPL ratio | Tiempo de compilacion | Tamano del modulo |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 (x100) | 100,00 % | 100,00 % | 75,50 % | 35,00 % | 1,002 | 1,37 s | 0,09 MB |
| 12 | 100,00 % | 100,00 % | 91,67 % | 41,67 % | 1,015 | 2,80 s | 1,06 MB |
| 40 | 100,00 % | 100,00 % | 67,50 % | 20,00 % | 1,043 | 6,53 s | 3,53 MB |
| 160 | 95,63 % | 100,00 % | 59,06 % | 21,25 % | 1,115 | 22,24 s | 14,45 MB |
| 640 | 78,28 % | 94,38 % | 54,69 % | 16,95 % | 1,148 | 48,55 s | 57,51 MB |

Recuerdo en contexto largo y recuperación de conceptos:

| Tarea | Resultado | Detalles |
|---|---|---|
| Recuerdo de desbordamiento (6,5K-11,4K tokens, 20 sesiones EN/ZH) | 100,0 % recuerdo de fragmentos (20/20); 85,0 % recuerdo de valor exacto (17/20: 8/10 EN, 9/10 ZH) | Media de 8.947 tokens de entrada; 0 errores al cruzar 4096; 0,0 diferencia de logits por debajo de 4096 tokens |
| Índice conceptual externo (ARC, 399 paráfrasis no vistas) | 33,33 % → 68,42 % (+35,09 pp) | Pesos base sin cambios (3.307 preguntas indexadas, recall@1 = 66,17 %) |

Lectura de clasificación con pocas etiquetas (media de 5 semillas):

| Dataset | Etiquetas / clase | CBM (320-d) | Full L7 (1024-d) | Baseline TF-IDF | Full L7 − TF-IDF |
|---|---:|---:|---:|---:|---:|
| AG News | 10 | 71,70 % | 76,84 % | 56,97 % | +19,88 pp |
| AG News | 100 | 79,63 % | 83,97 % | 80,90 % | +3,07 pp |
| AG News | Completo (112k) | 85,32 % | 89,00 % | 91,95 % | −2,95 pp |
| DBpedia-14 | 10 | 72,23 % | 85,78 % | 85,30 % | +0,47 pp |
| DBpedia-14 | Completo (120k) | 91,20 % | 96,84 % | 98,31 % | −1,47 pp |

La documentación no incluye resultados de benchmarks estándar de generación como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 212 M de parámetros, en bf16 los pesos ocupan aproximadamente 0,42 GB; en fp32, unos 0,85 GB. La VRAM total depende del contexto y del overhead de activaciones.
- GPU recomendadas: el ejemplo de la model card usa `torch.autocast("cuda", dtype=torch.bfloat16)` y `.to("cuda")`, lo que indica soporte para GPU NVIDIA con bf16. No se especifican modelos concretos.
- GPU de consumo: por tamaño, cabe holgadamente en cualquier GPU de consumo moderna; no se detallan requisitos mínimos.
- Opciones de despliegue: transformers (versión probada 4.57+ / 5.x) con `trust_remote_code=True`, safetensors y numpy. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se posiciona como vista previa de una arquitectura propietaria de investigación (cuellos de botella conceptuales y escritura directa de pesos) sin alternativas equivalentes documentadas en el material disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TopoVoid-0.2B-Orthogonal-Preview | 212 M | 4096 nativos + desbordamiento conceptual | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una vista previa: la documentación no describe el proceso de entrenamiento (tokens, composición del dataset, alineación), lo que limita la evaluación de su calidad general.
- El recuerdo en chat libre sin prefill es notablemente inferior al de los escenarios con prefill: 74,0 % en un solo hecho, 41,7 % en lote de 12 y 45,0 % en lote de 40.
- La capacidad de escritura se degrada con el volumen: con 640 hechos por módulo, el Top-1 de reescritura cae al 78,28 % y la paráfrasis al 16,95 %.
- La lectura de clasificación con pocas etiquetas supera a TF-IDF solo en regímenes de muy pocas etiquetas; con el conjunto completo, TF-IDF es mejor en AG News (−2,95 pp) y DBpedia-14 (−1,47 pp).
- Idiomas limitados a inglés y chino; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código del repositorio antes de ejecutarlo en producción.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de 212 M de parámetros, la calidad de generación general será limitada en comparación con modelos de mayor escala.
- Licencia Apache-2.0: permite uso comercial, pero al ser una vista previa de investigación conviene validar el comportamiento antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Topovoid/TopoVoid-0.2B-Orthogonal-Preview
- Organización Topovoid en Hugging Face: https://huggingface.co/Topovoid
- Sitio web de Topovoid: https://topovoid.com
- Perfil del mantenedor tirpitzia: https://huggingface.co/tirpitzia
- Perfil del mantenedor 0kaguya: https://huggingface.co/0kaguya
