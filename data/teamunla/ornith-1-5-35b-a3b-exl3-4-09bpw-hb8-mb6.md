# TeamUNLa/Ornith-1.5-35B-A3B-exl3-4.09bpw-hb8-mb6

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por ornith-ai, con 35B parámetros totales y aproximadamente 3B parámetros activos por token. Esta ficha describe la variante cuantizada publicada por TeamUNLa (Comunidad de Sistemas de la Universidad Nacional de Lanús) en formato ExLlamaV3 (EXL3) con una tasa efectiva de 4,09 bits por peso, pensada para ejecución en equipos de consumo.

La relevancia de esta conversión radica en que reduce el peso de descarga a 18,7 GB y permite arrancar el modelo con 8 GB de VRAM si se reparten capas y expertos entre VRAM y RAM del sistema, manteniendo precisión alta (8 bpw) en tensores críticos de atención y en el `lm_head`. El modelo base soporta entrada image-text-to-text, lo que amplía su aplicabilidad a tareas multimodales además de la generación de texto.

La ficha se centra en la variante EXL3, pero conviene distinguir con claridad entre los datos del modelo base (arquitectura, entrenamiento, capacidades) y los específicos de la cuantización (formato, receta, requisitos de memoria). Cualquier dato no confirmado en la información disponible se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con mezcla de secuencias híbrida (`linear_attn` + `self_attn`) y expertos compartidos (`shared_expert`) |
| Parametros totales | 35B (modelo base); 10.055.745.536 parámetros en los safetensors de esta variante |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4,09 bpw efectivos (receta `hb8-mb6`: 8 bpw en atención, `shared_expert` y `lm_head`; 5-6 bpw en capas de borde; 3-5 bpw en expertos enrutados intermedios) |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3); requiere TabbyAPI o ExLlamaV3, no es compatible con `transformers` estándar pese al tag de librería |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 35B parámetros totales y unos 3B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. El tag `qwen3_5_moe` y la presencia de tensores `linear_attn`, `self_attn` y `shared_expert` en la receta de cuantización indican una arquitectura híbrida que combina capas de atención lineal con atención completa, además de expertos compartidos que se activan siempre junto a los expertos enrutados. La pipeline declarada (`image-text-to-text`) confirma que el modelo base es multimodal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se detallan innovaciones adicionales como decodificación especulativa o variantes de atención más allá de lo inferible de los nombres de tensores. La innovación principal documentada en esta variante es la receta de cuantización no uniforme: los tensores sensibles a la precisión (atención lineal, atención completa, expertos compartidos y `lm_head`) se mantienen a 8 bpw, mientras que los expertos enrutados de las capas intermedias bajan a 3 bpw en `gate_proj`/`up_proj` y 5 bpw en `down_proj`, equilibrando tamaño y calidad.

## Capacidades

- Generación de texto conversacional en español e inglés, con pipeline declarada de `text-generation`.
- Procesamiento de entrada image-text-to-text heredado del modelo base (capacidad multimodal).
- Razonamiento multi-turno y conversacional, según los tags `conversational` y `text-generation`.
- Ejecución local en hardware de consumo mediante ExLlamaV3 y TabbyAPI, con API compatible con OpenAI para integración en herramientas de desarrollo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación en IDE: la variante EXL3 se sirve con TabbyAPI como endpoint compatible con la API de OpenAI, lo que permite conectarla a VS Code y otros editores para autocompletado y generación de código con contexto conversacional, usando 8 GB de VRAM si se hace offloading a RAM.
- Atención al cliente en español: el modelo declara soporte nativo de español e inglés y está orientado a generación conversacional, por lo que puede gestionar diálogos multi-turno en un servidor local sin depender de APIs externas.
- Despliegue en estaciones de trabajo con GPU de consumo: con 18,7 GB de descarga y 36 GB de memoria total recomendada (VRAM + RAM), encaja en equipos con una RTX 3060/4060 Ti de 8-16 GB más RAM del sistema, ideal para prototipado y demos internas.
- Procesamiento de documentos con imágenes: al heredar la capacidad image-text-to-text del modelo base, puede emplearse para extraer y resumir información de capturas, formularios o figuras en flujos locales.
- Investigación y evaluación de cuantizaciones: la receta hb8-mb6 documentada permite reproducir la conversión con ExLlamaV3 y comparar la degradación de calidad frente al modelo base en tareas de razonamiento y generación.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local con licencia MIT, es apto para procesar datos sensibles sin enviarlos a servicios en la nube, siempre que se valide la calidad de la cuantización en el dominio concreto.
- Fine-tuning o experimentación académica: la licencia MIT y el formato abierto facilitan su uso en proyectos docentes y de investigación de la comunidad, aunque el formato EXL3 limita el reentrenamiento directo y requeriría partir del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima recomendada: 8 GB, repartiendo capas y expertos entre VRAM y RAM del sistema.
- Memoria total recomendada (VRAM + RAM): aproximadamente 36 GB.
- Tamaño de descarga: 18,7 GB (repositorio de 20,2 GB).
- GPU recomendadas: cualquier GPU NVIDIA desde la generación GeForce GTX 10 en adelante con VRAM suficiente (API CUDA); en ROCm, serie RX 7000 o superior, con soporte no verificado en RX 6800 y superiores de la serie RX 6000.
- GPU Intel: no soportadas por TabbyAPI.
- Cabe en GPU de consumo: sí, con una RTX 3060/4060 de 12-16 GB o superior, y con 8 GB si se acepta offloading parcial a RAM (con la penalización de latencia correspondiente).
- Opciones de despliegue: TabbyAPI sobre ExLlamaV3 (recomendado, con API compatible con OpenAI). No es compatible con llama.cpp, Ollama, vLLM ni TGI en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados: `temperature=0.75`, `top_p=0.95`, `top_k=20`, `min_p=0.0`, `presence_penalty=0.6`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B EXL3 4,09 bpw (esta ficha) | 35B | ~3B | no disponible | EXL3 | MIT | 18,7 GB, 8 GB VRAM mínima con offloading |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35B | ~3B | no disponible | safetensors | MIT | Pesos completos, mayor huella de memoria |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | 35B | ~3B | no disponible | no disponible | MIT | No documentadas en la información disponible |

No se dispone de datos de benchmarks ni de modelos comparables de otros desarrolladores en la información proporcionada, por lo que la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantización a 4,09 bpw, con expertos enrutados a 3 bpw en `gate_proj`/`up_proj`, puede degradar la calidad frente al modelo base, especialmente en tareas de razonamiento matemático y código; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- El formato EXL3 solo es compatible con ExLlamaV3 y TabbyAPI; no funciona con `transformers` estándar, llama.cpp, Ollama, vLLM ni TGI, lo que limita su portabilidad.
- El tag de librería `transformers` del repositorio puede inducir a error: los pesos no se cargan con `AutoModelForCausalLM` convencional.
- Idiomas declarados limitados a español e inglés; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad ni de sesgos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo base enlazado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de la calidad de la conversión.
- El soporte de ROCm en GPUs RX 6000 no está probado según la propia model card, y las GPUs Intel no están soportadas.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-4.09bpw-hb8-mb6
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Índice de modelos de TeamUNLa: https://huggingface.co/TeamUNLa/LLMs-UNLa
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
