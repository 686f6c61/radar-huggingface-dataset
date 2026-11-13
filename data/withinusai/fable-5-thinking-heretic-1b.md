# WithinUsAI/Fable-5-Thinking-Heretic-1B

## Resumen

Fable-5-Thinking-Heretic-1B es un modelo de lenguaje de 1.080.632.832 parámetros publicado por WithinUsAI bajo licencia Apache 2.0. Se trata de una variante "decensored" (abliterated) del fine-tune GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking, que a su vez deriva del modelo base openbmb/MiniCPM5-1B. La modificación se realizó con Heretic v1.4.0, una herramienta de ablación direccional que suprime el comportamiento de rechazo mediante ediciones quirúrgicas de pesos en lugar de reentrenamiento.

El modelo conserva la arquitectura MiniCPM5 y una ventana de contexto de 128K tokens, junto con los modos de chat nativos Think / No-Think del modelo original. Está orientado a tool calling, function calling, generación de código e instruction-following, y por su tamaño está pensado para despliegue local en GPU de consumo y en dispositivos edge.

Su relevancia actual reside en dos factores: por un lado, ofrece capacidades de razonamiento y llamada a herramientas en un formato de 1B parámetros manejable en hardware modesto; por otro lado, documenta de forma reproducible (parámetros de abliteración y métricas de divergencia KL) el efecto de las técnicas de supresión de rechazo sobre un modelo alineado con RLHF. El autor reporta una reducción de rechazos de 93/100 a 3/100 con una divergencia KL de 0,0232 respecto al modelo de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM5 (transformer decoder-only, licencia llama en el ecosistema GGUF) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (heredada de MiniCPM5) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia MiniCPM5, con 1.080.632.832 parámetros en tamaño nativo de 1.1B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) aplicadas en el modelo base openbmb/MiniCPM5-1B ni en el fine-tune intermedio GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking.

La innovación técnica destacable no está en la arquitectura sino en el método de modificación: abliteración (directional ablation) con Heretic v1.4.0. En lugar de un fine-tuning que luche contra los rechazos aprendidos por RLHF, se identifican direcciones de peso responsables del comportamiento de rechazo y se editan de forma selectiva en las proyecciones de salida de atención (`attn.o_proj`) y en las down-projections del MLP (`mlp.down_proj`). Los parámetros publicados incluyen `direction_index` de 12,95, `attn.o_proj.max_weight` de 1,14 en la posición 14,01, `attn.o_proj.min_weight` de 0,99 a distancia 12,84, `mlp.down_proj.max_weight` de 0,98 en la posición 14,20 y `mlp.down_proj.min_weight` de 0,39 a distancia 9,07. El autor sostiene que esta edición estrecha preserva el conocimiento y las capacidades del modelo base, con una divergencia KL de 0,0232 frente al modelo de partida.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo Thinking nativo, además de modo No-Think para respuestas directas.
- Tool calling y function calling, capacidad destacada del fine-tune de origen.
- Generación de código e instruction-following.
- Razonamiento multi-paso orientado a agentes locales.
- Soporte de roleplay y conversación abierta sin rechazos por defecto (3/100 en el conjunto de prompts adversariales del autor).
- Contexto largo de 128K tokens para documentos extensos o historiales de conversación amplios.
- Despliegue on-device y edge por su tamaño de 1.1B parámetros.
- Compatibilidad con endpoints y con text-generation-inference.

## Casos de uso

- Agentes locales de escritorio: el modelo puede ejecutar bucles de tool calling sobre APIs del sistema con un consumo de VRAM inferior a 1,5 GB en cuantización Q8_0, lo que permite mantenerlo residente junto a otras herramientas en una GPU de 24 GB.
- Asistente de código en el IDE: con modo Think para razonar sobre el parche y modo No-Think para autocompletado rápido, encaja en extensiones que necesitan baja latencia y no pueden depender de la nube.
- Automatización de soporte técnico en inglés o chino: su ventana de 128K permite arrastrar manuales y tickets previos en una sola sesión sin truncar el contexto.
- Roleplay y narrativa interactiva: la supresión de rechazos elimina las interrupciones moralizantes en ficción, y el tamaño reducido permite ejecutarlo en portátiles con GPU de 6-8 GB.
- Investigación sobre mecánica de rechazo y alineación: los parámetros de abliteración publicados y la métrica de divergencia KL permiten reproducir el experimento y estudiar qué direcciones de peso codifican el comportamiento de rechazo.
- Procesamiento de documentos largos en edge: resumen y extracción de entidades sobre contratos o informes de hasta 128K tokens en dispositivos sin conectividad.
- Prototipado rápido de pipelines de function calling: al ser compatible con llama.cpp, Ollama y LM Studio, sirve para validar esquemas de herramientas antes de migrar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking) |
|---|---|---|
| Divergencia KL | 0,0232 | 0 (por definición) |
| Rechazos (100 prompts adversariales) | 3/100 | 93/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q8_0, 0,9 GB con Q6_K, 0,8 GB con Q5_K_M, 0,7 GB con Q4_K_M o IQ4_XS, y 2,02 GB con F16. El autor indica añadir alrededor de 1 GB adicional para el contexto.
- GPU recomendadas según el autor: RTX 3090/4090/5090 (24 GB) con Q8_0; RTX 4080/5080/4060 Ti 16G con Q6_K; RTX 3060/4070/5070 (12 GB) con Q5_K_M; RTX 4060/3070 (8 GB) con Q4_K_M; GTX 1660 Super/2060/3050 laptop (6 GB) con IQ4_XS.
- Cabe en GPU de consumo: sí, desde tarjetas de 6 GB, y en CPU-only o Apple Silicon con Q4_K_M en RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, text-generation-inference y transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Fable-5-Thinking-Heretic-1B | 1,08B | 128K | Apache 2.0 | Variante abliterated con modos Think/No-Think y tool calling |
| GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking | 1,08B (no confirmado en la información) | no disponible | no disponible | Modelo de partida; mantiene rechazos (93/100) |
| openbmb/MiniCPM5-1B | 1,08B (no confirmado en la información) | 128K (según el autor) | no disponible | Modelo base de la familia MiniCPM5 |

No se dispone de datos de benchmarks ni de comparativas de rendimiento frente a otras familias de 1B en la información proporcionada.

## Limitaciones y advertencias

- La abliteración suprime rechazos de forma deliberada: el modelo responderá a solicitudes que el modelo base rechazaba, lo que traslada al operador la responsabilidad de filtrar contenido en producción.
- La divergencia KL de 0,0232 indica una edición estrecha, pero no garantiza ausencia de degradación en tareas específicas; conviene evaluar en el dominio propio antes de desplegar.
- Riesgo de alucinación inherente a un modelo de 1B parámetros; no debe usarse como fuente de verdad sin verificación.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- El contexto de 128K procede de MiniCPM5 según el autor, pero no se han publicado evaluaciones de recuperación en contextos largos para este fine-tune.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el fine-tune intermedio podrían arrastrar condiciones adicionales no detalladas en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de las métricas reportadas por el autor.
- La model card incluye una imagen alojada en un dominio externo y enlaces a una colección de terceros; conviene tratarlos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WithinUsAI/Fable-5-Thinking-Heretic-1B
- Modelo de partida: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Licencia del modelo base: https://huggingface.co/openbmb/MiniCPM5-1B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo sobre abliteración: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Colección RACER IS OP — Heretic Models: https://huggingface.co/collections/saidutta69/racer-is-op-heretic-models
