# tttdanielak/vanessa-voice-gguf

## Resumen

El modelo `tttdanielak/vanessa-voice-gguf` es una adaptación fine‑tune del modelo Qwen2.5‑3B‑Instruct, desarrollada por el autor tttdanielak para dar voz al personaje Vanessa, un NPC del mod VerityHE del juego Hytale. Se trata de un LoRA entrenado específicamente para mantener una personalidad tsundere y respuestas conversacionales cortas, pensado para integrarse en un bucle de voz en tiempo real dentro del juego. El modelo se distribuye únicamente en formato GGUF cuantizado a Q4_K_M, con un tamaño de archivo de aproximadamente 1,93 GB y una ventana de contexto de 12 288 tokens. Su relevancia radica en demostrar cómo un modelo pequeño (3 mil millones de parámetros) puede adaptarse eficazmente a un caso de uso muy concreto —un personaje de videojuego— con requisitos de latencia bajos y sin necesidad de hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5‑3B‑Instruct) |
| Parametros totales | 3 085 938 688 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 12 288 tokens |
| Tipos de cuantizacion | Q4_K_M (única ofrecida) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5‑3B‑Instruct, un transformer decoder con 3 mil millones de parámetros, entrenado originalmente por Alibaba Cloud. Sobre esta base se aplicó un fine‑tune mediante LoRA (Low‑Rank Adaptation), que ajusta los pesos de atención y feed‑forward sin modificar el modelo completo. El LoRA se entrenó con datos específicos del personaje Vanessa, incluyendo su personalidad tsundere, sus patrones de habla y la instrucción explícita de no inventar información. Tras el entrenamiento, los pesos del LoRA se fusionaron con el modelo base y se exportaron a GGUF cuantizado a Q4_K_M para su uso eficiente en entornos de inferencia locales. No se dispone de detalles sobre el volumen de tokens de entrenamiento ni sobre el proceso de alineación (RLHF/DPO). La elección de Qwen2.5 (no razonador) se debe a que en el bucle de voz en tiempo real los modelos de razonamiento como Qwen3 o DeepSeek‑R1 consumen demasiado tiempo en cadenas de pensamiento internas, lo que provoca respuestas vacías o retrasos inaceptables.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas de 1 a 2 frases cortas.
- Mantenimiento de un personaje definido (tsundere) con coherencia en diálogos multi‑turno.
- Restricción explícita a no inventar información: si no se le ha proporcionado un dato, lo admite.
- Adaptación a un contexto situacional dinámico (estado de ánimo, actividad, salud, hambre) mediante prompts enviados por el mod en cada petición.
- Posibilidad de cambiar a una personalidad más agresiva cuando el mecanismo de negligencia del mod lo activa.
- No soporta tool calling, visión, audio ni otras modalidades; es exclusivamente texto.

## Casos de uso

- Integración en mods de juegos como NPC conversacional: el modelo se ejecuta localmente vía Ollama y responde en tiempo real a las interacciones del jugador, manteniendo la coherencia del personaje.
- Asistentes de voz para aplicaciones de entretenimiento: combinado con sistemas de speech‑to‑text y text‑to‑speech, puede dar vida a personajes en entornos de realidad virtual o simulación.
- Prototipado rápido de chatbots con personalidad definida: su tamaño reducido permite desplegarlo en portátiles o incluso en CPU, ideal para pruebas de concepto.
- Generación de diálogos para guiones o narrativa interactiva: el modelo puede producir líneas de conversación coherentes con un estilo y tono específicos.
- Entrenamiento de modelos más grandes mediante destilación: al ser un modelo pequeño y especializado, puede servir como profesor para transferir el estilo conversacional a modelos mayores.
- Investigación sobre fine‑tune eficiente: el uso de LoRA sobre un modelo base de 3B demuestra un enfoque de bajo coste para adaptar modelos a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de calidad como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El rendimiento se evalúa únicamente en términos de latencia y adecuación al caso de uso específico, donde se menciona que un modelo de razonamiento como Qwen3:4b falló al agotar su presupuesto de tokens sin generar respuesta en 21 segundos.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M y contexto 12 288, el modelo ocupa aproximadamente 1,93 GB en memoria. Se recomienda al menos 4 GB de VRAM para una inferencia fluida en GPU.
- GPU recomendadas: tarjetas de gama media como RTX 3060, RTX 4060 o superiores; también puede ejecutarse en GPU integradas con suficiente VRAM compartida.
- Compatibilidad con CPU: gracias a su tamaño reducido, puede funcionar en CPU moderna con 8 GB de RAM, aunque la latencia será mayor.
- Opciones de despliegue: Ollama (como se describe en la model card), llama.cpp, o cualquier runtime que soporte GGUF.
- Latencia: no se proporcionan cifras exactas, pero el diseño prioriza respuestas en menos de 1–2 segundos para el bucle de voz, lo que sugiere un rendimiento adecuado en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| tttdanielak/vanessa-voice-gguf | 3,09 B | 12 288 | Apache 2.0 | NPC de juego con personalidad |
| Qwen2.5‑3B‑Instruct (base) | 3,09 B | 32 768 | Apache 2.0 | Chat general, instrucciones |
| Llama‑3.2‑3B‑Instruct | 3,21 B | 128 000 | Llama 3.2 | Chat general, multilingüe |

El modelo Vanessa se diferencia del base Qwen2.5 en que está especializado en un personaje concreto y optimizado para respuestas cortas y sin razonamiento extenso. Comparado con Llama‑3.2‑3B, ofrece menor contexto pero una personalidad más definida y un formato GGUF listo para uso inmediato. No hay modelos comparables que compartan exactamente el mismo propósito (NPC de Hytale), por lo que la comparación se limita a alternativas genéricas de tamaño similar.

## Limitaciones y advertencias

- El modelo solo soporta inglés; cualquier consulta en otro idioma producirá respuestas incoherentes o en inglés.
- La ventana de contexto de 12 288 tokens es reducida para aplicaciones que requieran historiales largos o documentos extensos.
- Al estar entrenado para un personaje concreto, su uso fuera de ese contexto puede generar respuestas fuera de lugar o con un tono inapropiado.
- Existe riesgo de alucinación, aunque el prompt del sistema intenta mitigarlo instruyendo al modelo a no inventar información; sin embargo, no se garantiza en todos los casos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones del modelo base Qwen2.5 (por ejemplo, posibles sesgos en los datos de entrenamiento originales).
- No se han publicado evaluaciones de seguridad o sesgos específicas para este modelo.
- El modelo está pensado para un bucle de voz en tiempo real; si se usa en otros escenarios, la calidad puede degradarse.

## Enlaces

- Hugging Face: https://huggingface.co/tttdanielak/vanessa-voice-gguf
- Sitio del mod VerityHE: https://ev0media.com
- Modelo base Qwen2.5‑3B‑Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
