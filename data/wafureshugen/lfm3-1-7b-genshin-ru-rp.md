# wafureshugen/LFM3-1.7B-genshin-ru-rp

## Resumen

LFM3-1.7B-genshin-ru-rp es un ajuste fino (fine-tuning) experimental del modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario wafureshugen y publicado en Hugging Face. El modelo está especializado en roleplay (juego de rol conversacional) con personajes del videojuego Genshin Impact, y está entrenado exclusivamente en ruso. Su propósito es evaluar cómo un modelo pequeño con atención limitada se desenvuelve en diálogos de rol interpretando fichas de personaje concretas (Sidgwin, Arlecchino, Ye Lan, Furina, entre otras).

El entrenamiento se realizó en dos etapas sobre el modelo base: primero un entrenamiento continuado (CPT) sobre fanfiction de Genshin Impact y textos de Disco Elysium en ruso, y después un ajuste supervisado (SFT) con diálogos generados con razonamiento, diálogos extraídos del propio juego y datos de varios conjuntos rusos. Los adaptadores LoRA resultantes se fusionaron en los pesos finales, por lo que el repositorio contiene un modelo completo listo para inferencia.

El modelo hereda la arquitectura tri-híbrida de la familia LFM3 de Liquid AI y una ventana de contexto de 256K tokens según la documentación oficial del modelo base. Es relevante ahora como ejemplo de adaptación de un modelo compacto (1.700 millones de parámetros) a una tarea de nicho (roleplay en ruso con personajes concreto), con un modo de razonamiento opcional y un formato de respuesta en Markdown.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-híbrida (base LiquidAI/LFM3-1.7B); pesos con código personalizado (custom_code) y LoRA fusionado |
| Parametros totales | 1.728.801.536 (≈1,73 B) |
| Parametros activos | no disponible (no es un modelo MoE según los datos disponibles) |
| Longitud de contexto | 256K tokens (heredada del modelo base LFM3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (con código personalizado, custom_code) |

## Arquitectura y entrenamiento

El modelo se construye sobre LiquidAI/LFM3-1.7B, un modelo de texto de la familia LFM3 basado en la arquitectura tri-híbrida de Liquid AI, que combina mecanismos de atención con componentes de estado (state space) para gestionar contextos largos de forma eficiente. El ajuste se realizó con dos etapas de LoRA posteriormente fusionadas: una etapa CPT de una época completa sobre fanfiction de Genshin Impact procedente de ficbook y textos de Disco Elysium en ruso; y una etapa SFT que alcanzó 1769 de 1974 pasos (aproximadamente el 90 %), entrenada sobre diálogos generados con razonamiento, diálogos del juego, MERC, pippa_ru y march228.

El sistema de prompting se basa en una tarjeta de personaje (sin reglas de formato explícitas) y las respuestas se estructuran en Markdown, con las acciones del personaje delimitadas por asteriscos. El modelo también fue entrenado con tarjetas cortas (solo el primer párrafo del prompt). El modo de razonamiento se controla mediante `enable_thinking=True` (por defecto) o `False`, y el razonamiento generado está deliberadamente reducido a 2-3 frases en ruso. No se documentan detalles sobre volumen total de tokens de entrenamiento ni sobre uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en ruso, orientada a diálogos de rol multi-turno.
- Interpretación de fichas de personaje con personalidad, trasfondo, relaciones y estilo de habla definidos en el system prompt.
- Modo de razonamiento opcional (`enable_thinking`), con cadenas de pensamiento cortas (2-3 frases) en ruso.
- Formato de respuesta en Markdown con acciones entre asteriscos.
- Adaptación a tarjetas de personaje cortas (solo el primer párrafo).
- Capacidad multilingüe limitada al ruso en la práctica (el modelo base soporta más idiomas, pero el ajuste está orientado al ruso).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Roleplay de personajes de Genshin Impact en aplicaciones de chat: el modelo interpreta fichas de personaje con rasgos, relaciones y estilo de habla concretos, adecuado para bots de fans y comunidades de rol en ruso.
- Simuladores de conversación para práctica de ruso: diálogos temáticos con personajes conocidos que mantienen registro y vocabulario coherentes, útil para estudiantes que quieran practicar comprensión y expresión en contextos narrativos.
- Prototipado rápido de agentes conversacionales de nicho: al ser un modelo de 1,7 B con contexto de 256K, puede desplegarse en local para iterar sobre prompts de personaje sin costes de API.
- Generación de ficción asistida: el entrenamiento con fanfiction permite al modelo producir escenas y diálogos con tono narrativo y continuidad de personaje.
- Investigación sobre ajuste fino de modelos pequeños: sirve como caso de estudio de CPT + SFT con LoRA fusionado sobre un modelo tri-híbrido, útil para analizar cómo un modelo de 1,7 B gestiona coherencia de personaje en diálogos largos.
- Evaluación de límites de atención en modelos compactos: el autor concibe el modelo como experimento para comprobar cómo un modelo pequeño con atención limitada maneja el rol, por lo que es útil en estudios comparativos de degradación de contexto.
- Demostraciones interactivas en entornos con recursos limitados: el tamaño del repositorio (3,5 GB) permite ejecución en hardware modesto para pruebas de concepto de chatbots temáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1,73 B parámetros, la inferencia en precisión completa requeriría del orden de 3,5-4 GB solo para pesos, y las cuantizaciones de 8 y 4 bits reducirían esa cifra aproximadamente a la mitad y a un cuarto respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un modelo de 1,73 B es candidato razonable para GPU de consumo con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: no disponible; el repositorio usa safetensors con código personalizado (custom_code), lo que puede requerir cargar el modelo con `trust_remote_code=True` y el código específico de LFM3. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-genshin-ru-rp | ≈1,73 B | 256K (heredado del base) | ruso | lfm1.0 | Hugging Face (wafureshugen) |
| LiquidAI/LFM3-1.7B | ≈1,73 B | 256K | multilingüe | lfm1.0 | Hugging Face (LiquidAI) |
| Modelos de roleplay rusos comparables | no disponible | no disponible | ruso | no disponible | no disponible |

El modelo base LiquidAI/LFM3-1.7B es la referencia directa: misma arquitectura y tamaño, pero sin el ajuste de rol ni el sesgo hacia el ruso. No se dispone de datos sobre otros modelos de roleplay en ruso con los que compararlo en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El propio autor advierte que en réplicas largas el modelo a veces pierde la lógica y confunde el género gramatical.
- Sin una descripción de escena en el prompt, el modelo tiende a inventarla, lo que puede generar incoherencias narrativas.
- El modelo está entrenado exclusivamente en ruso; su uso en otros idiomas no está validado y probablemente degrade la calidad.
- Es un modelo experimental de 1,7 B, por lo que su coherencia en conversaciones largas y su capacidad de razonamiento son limitadas frente a modelos mayores.
- Riesgo de alucinación sobre el lore de Genshin Impact y sobre detalles de personaje no presentes en la tarjeta de prompt.
- La licencia lfm1.0 (etiquetada como "other") impone condiciones específicas de Liquid AI; debe revisarse antes de cualquier uso comercial.
- El repositorio incluye código personalizado (custom_code), lo que exige confiar en el código del autor al cargar el modelo.
- No hay datos publicados de benchmarks ni de cuantizaciones validadas, lo que dificulta estimar su rendimiento en producción.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wafureshugen/LFM3-1.7B-genshin-ru-rp
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentación oficial de LFM3-1.7B: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
