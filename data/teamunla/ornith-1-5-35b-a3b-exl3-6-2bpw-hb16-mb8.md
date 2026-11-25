# TeamUNLa/Ornith-1.5-35B-A3B-exl3-6.2bpw-hb16-mb8

## Resumen

Esta ficha describe la variante cuantizada **Ornith-1.5-35B-A3B-exl3-6.2bpw-hb16-mb8**, una conversión al formato ExLlamaV3 (EXL3) del modelo base [ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B). La conversión la firma **TeamUNLa**, la comunidad de estudiantes de la Licenciatura en Sistemas de la Universidad Nacional de Lanús, y su objetivo declarado es permitir la ejecución del modelo en equipos de sobremesa con recursos moderados mediante el reparto de capas y expertos entre VRAM y RAM del sistema.

El modelo base es una arquitectura **MoE (Mixture of Experts)** con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que explica que su huella de cómputo efectiva sea mucho menor que la de un modelo denso del mismo tamaño nominal. Esta variante aplica una asignación no uniforme de bits por tensor: 16 bpw en la cabeza de salida, 8 bpw en tensores críticos (atención lineal, autoatención, experto compartido y capas de borde) y 6 bpw en los expertos enrutados intermedios, para un promedio efectivo de 6,2 bpw.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización reproducible y orientada a hardware de consumo; por otro, sirve de referencia para quienes necesitan evaluar si un MoE de 35B puede desplegarse en local con calidad cercana al original. Conviene advertir desde el inicio que los metadatos del repositorio presentan inconsistencias (el número de parámetros en safetensors no coincide con los 35B declarados), que se detallan en las secciones correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer; tag `qwen3_5_moe` en Hugging Face |
| Parametros totales | 35B declarados por el autor; 15.012.244.992 según safetensors del repo (dato inconsistente, ver limitaciones) |
| Parametros activos | ~3B por token (según model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 6,2 bpw efectivos (`hb16-mb8`): `lm_head` a 16 bpw; `linear_attn`, `self_attn`, `shared_expert` y capas 0-1 / 38-39 a 8 bpw; expertos enrutados de capas 2-37 a 6 bpw |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato ExLlamaV3 (EXL3); tamaño de descarga ~28-30,1 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos con enrutamiento por token: de los 35B parámetros totales solo se activan aproximadamente 3B por token, lo que reduce el coste de inferencia respecto a un denso equivalente. La presencia en los tags de `qwen3_5_moe` y de tensores `linear_attn` sugiere una combinación de atención lineal y autoatención clásica, junto con un experto compartido (`shared_expert`) que se activa siempre y expertos enrutados que se seleccionan dinámicamente. No se dispone de información sobre el número de capas exacto más allá de las referencias a las capas 0-1 y 38-39 en la receta de cuantización, ni sobre el número de expertos por capa.

En cuanto al entrenamiento, la información proporcionada no incluye datos sobre volumen de tokens, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. La model card del repositorio cuantizado se limita a describir la receta de cuantización y remite a la model card original, que aparece truncada en la información disponible. La innovación técnica documentada es, por tanto, la propia receta EXL3: una asignación no uniforme de bits que protege los tensores sensibles (atención, experto compartido, cabeza de salida y capas de borde) mientras comprime agresivamente los expertos intermedios, buscando una calidad "prácticamente indistinguible del original" según el autor.

## Capacidades

- Generación de texto conversacional y de propósito general, con pipeline `text-generation`.
- Procesamiento de imagen y texto (`image-text-to-text`), según los tags del repositorio; no se detalla la naturaleza exacta del soporte multimodal.
- Razonamiento multi-turno en conversaciones, con parámetros de muestreo recomendados por el autor (`temperature=0.75`, `top_p=0.95`, `top_k=20`, `presence_penalty=0.6`).
- Uso como agente local en entornos de desarrollo: la model card menciona explícitamente su uso como agente en VS Code y otros IDEs mediante TabbyAPI con API compatible con OpenAI.
- Capacidades multilingües limitadas a español e inglés según los metadatos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- **Asistente de programación local en IDE**: servir el modelo con TabbyAPI y conectarlo a VS Code u otros editores mediante la API compatible con OpenAI. El tamaño de 28 GB y la VRAM mínima de 8 GB con offloading lo hacen viable en estaciones de trabajo de gama media.
- **Atención al cliente en español**: el modelo declara soporte nativo de español e inglés, lo que permite desplegar un chatbot multi-turno para mercados hispanohablantes sin depender de traducción intermedia. La ventana de contexto no está documentada, por lo que habría que validarla empíricamente antes de diseñar flujos largos.
- **Prototipado de agentes con herramientas**: al exponerse como endpoint compatible con OpenAI, puede integrarse en frameworks de agentes (LangChain, LlamaIndex, etc.) que esperen esa interfaz, siempre que se valide el soporte real de function calling.
- **Procesamiento de documentos con imagen y texto**: el tag `image-text-to-text` sugiere capacidad de entrada multimodal; podría emplearse para tareas de extracción o descripción sobre capturas y documentos escaneados, previa verificación del comportamiento real.
- **Investigación académica sobre cuantización**: la receta EXL3 documentada (bits por tensor, YAML reproducible) convierte este repositorio en un caso de estudio útil para medir el impacto de distintas asignaciones de bits en un MoE.
- **Despliegue en hardware de consumo con offloading**: con 8 GB de VRAM mínima y 48 GB de memoria total recomendada, permite ejecutar un MoE de 35B en equipos con GPU de gama media y RAM abundante, un escenario antes reservado a servidores.
- **Generación de texto en entornos sin conectividad**: al ser un modelo local con licencia MIT, encaja en despliegues air-gapped donde no se puede recurrir a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM mínima recomendada**: 8 GB, repartiendo capas y expertos entre VRAM y RAM del sistema.
- **Memoria total recomendada (VRAM + RAM)**: aproximadamente 48 GB.
- **Tamaño de descarga**: 28 GB según la model card; 30,1 GB según el tamaño del repositorio en Hugging Face.
- **GPU compatibles (CUDA)**: cualquier tarjeta desde la generación GeForce GTX 10 en adelante, siempre que tenga VRAM suficiente, según el autor.
- **GPU compatibles (ROCm)**: serie RX 7000 o superior; RX 6800 y modelos superiores de la serie RX 6000 deberían funcionar aunque no fueron probados.
- **GPU Intel**: no soportadas.
- **Cabe en GPU de consumo**: sí, con offloading a RAM; la VRAM mínima de 8 GB apunta a tarjetas como RTX 3060, RTX 4060 o superiores, aunque el rendimiento dependerá del reparto de capas.
- **Opciones de despliegue**: TabbyAPI (recomendado por el autor, con API compatible con OpenAI), ExLlamaV3 como motor subyacente. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato EXL3.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-exl3-6.2bpw (esta ficha) | 35B declarados | ~3B | no disponible | MIT | EXL3 (safetensors) | Cuantización comunitaria para hardware de consumo |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35B declarados | ~3B | no disponible | MIT | safetensors | Modelo original sin cuantizar, referencia de calidad |
| Alternativas MoE de ~30-35B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría. Los datos de rendimiento del modelo base no aparecen en la documentación consultada.

## Limitaciones y advertencias

- **Inconsistencia en el recuento de parámetros**: los safetensors del repositorio declaran 15.012.244.992 parámetros, mientras que la model card y el nombre del modelo indican 35B totales. Es probable que el recuento de safetensors corresponda a los pesos efectivamente almacenados tras la cuantización o a una parte del modelo, pero conviene verificarlo antes de asumir capacidades.
- **Formato propietario de motor**: EXL3 solo se ejecuta con ExLlamaV3 y TabbyAPI; no es portable a vLLM, llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue en producción.
- **Soporte de hardware restringido**: sin soporte para GPU Intel y con requisitos de ROCm relativamente recientes.
- **Riesgo de alucinación**: no se documentan evaluaciones de fidelidad ni de tasas de alucinación; como en cualquier LLM, es esperable en tareas de conocimiento factual.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto, lo que impide garantizar flujos de conversación o documentos largos sin pruebas previas.
- **Cobertura lingüística limitada**: solo español e inglés declarados; no hay evidencia de calidad en otras lenguas.
- **Licencia MIT**: permisiva para uso comercial, pero la responsabilidad sobre el cumplimiento de las licencias de los datos de entrenamiento del modelo base recae en el usuario.
- **Proyecto comunitario**: la model card aclara que no es una publicación institucional oficial de la UNLa; el mantenimiento y el soporte dependen de la comunidad.
- **Cuantización con posible pérdida**: aunque el autor afirma calidad "prácticamente indistinguible", no se aportan métricas comparativas frente al modelo original.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-6.2bpw-hb16-mb8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Índice de modelos de TeamUNLa: https://huggingface.co/TeamUNLa/LLMs-UNLa
- ExLlamaV3 (motor de cuantización e inferencia): https://github.com/turboderp-org/exllamav3
- TabbyAPI (servidor compatible con OpenAI): https://github.com/theroyallab/tabbyAPI
