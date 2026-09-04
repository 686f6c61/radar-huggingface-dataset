# tksluangrath/lol-matchbook

## Resumen

`tksluangrath/lol-matchbook` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, fine-tuneado por tksluangrath para responder preguntas conversacionales sobre enfrentamientos (matchups) de League of Legends en un formato fijo de tres fases: early, mid y late game. El adaptador es el componente de diálogo del proyecto LoL Matchbook, un asistente local de champ-select que combina una capa de recuperación precomputada para responder de forma instantánea a las decisiones de pick/ban y este modelo para las preguntas de seguimiento.

La relevancia del modelo radica en su enfoque de fine-tuning eficiente con QLoRA sobre un dataset muy pequeño (76 filas) y en la estrategia de auto-destilado: las etiquetas de entrenamiento fueron generadas por el propio modelo base y filtradas mediante una verificación de hechos para evitar invenciones. El modelo fusionado resultante tiene 4.022.468.096 parámetros, aunque la arquitectura original es la de un transformer de 4B parámetros con adaptador LoRA. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (f16 y Q4_K_M), safetensors fp16, adaptador entrenado con base 4-bit NF4 (QLoRA) |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador y repo); base Qwen3 bajo Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador PEFT (LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3-4B-Instruct-2507`, un transformer causal de 4B parámetros. El adaptador LoRA se aplica a las proyecciones `q/k/v/o_proj` y `gate/up/down_proj`, con `r=8`, `alpha=16` y `dropout=0.05`. El entrenamiento se realizó con QLoRA: la base se cuantizó a 4-bit NF4 y solo se entrenaron los adaptadores. Se llevaron a cabo 10 épocas (380 pasos) en CPU, sin aceleración por GPU.

El dataset de entrenamiento contiene 76 filas de matchup, compuestas por 40 filas originales y 36 pares expandidos. Las tasas de victoria proceden de `BoostedJonP/league_of_legends_match_data`, agregadas por pareja de campeones y rol. Los textos de consejos para early/mid/late fueron generados por el modelo base antes del fine-tuning, a partir de un prompt con la tasa de victoria real y las habilidades de cada campeón obtenidas de Data Dragon. Posteriormente se filtraron mediante una verificación de hechos que descartaba nombres de habilidades inventados y discrepancias con la tasa de victoria. En inferencia y entrenamiento se usa un system prompt específico que pide consejos concisos y adaptados al rango, y que indica no inventar datos si no se dispone de información fiable.

## Capacidades

- Generación de texto conversacional en formato fijo de tres fases (early/mid/late game) para matchups de League of Legends.
- Respuestas concisas y adaptadas al rango (rank-aware) según el system prompt.
- Integración con un sistema de recuperación externo: el modelo está pensado para responder preguntas de seguimiento después de una consulta precomputada.
- Compatible con inferencia mediante PEFT (adaptador LoRA) y con cuantizaciones GGUF para `llama.cpp`.
- No soporta tool calling, visión ni audio según la información disponible.
- Capacidades multilingües no especificadas; el adaptador está orientado a preguntas en inglés sobre el juego.

## Casos de uso

- Asistente de champ-select en League of Legends: el modelo responde a preguntas de seguimiento como "¿Cómo gana Camille a Urgot en la fase temprana?" después de que la capa de recuperación haya mostrado el matchup principal. Es adecuado porque mantiene el formato de tres fases y es lo bastante ligero para ejecutarse en local.
- Análisis de matchup previo a la partida: un jugador consulta el modelo antes de entrar en la cola para conocer los puntos fuertes y débiles de su enfrentamiento. El modelo devuelve consejos en early/mid/late, lo que permite planificar la partida.
- Entrenamiento y coaching para jugadores: el modelo actúa como un coach conversacional que explica qué hacer en cada fase del juego. Su system prompt le obliga a ser conciso y a reconocer cuándo no tiene datos suficientes.
- Integración en aplicaciones de chat locales: gracias a los pesos GGUF, el modelo puede cargarse con `llama.cpp` o `Ollama` en una máquina sin GPU, ofreciendo respuestas rápidas para un asistente personal de LoL.
- Generación de contenido para guías de campeones: el modelo puede redactar descripciones de enfrentamientos en el formato solicitado, que luego un humano revisa antes de publicar. La verificación de hechos del entrenamiento reduce el riesgo de invenciones en los matchups conocidos.
- Prototipo de asistente para e-sports: durante retransmisiones o análisis post-partida, el modelo puede responder a preguntas frecuentes sobre enfrentamientos. Requiere una capa de recuperación externa para mantenerse actualizado con los datos del parche, ya que el modelo por sí solo no dispone de datos en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor reporta una evaluación cualitativa interna sobre 10 matchups held-out, con un resultado de 10/10 en la verificación de hechos (las tres fases presentes y sin invenciones detectadas). También indica una pérdida final de aproximadamente 0.02 y una precisión de token media del 99.5% en el conjunto de entrenamiento. Estos datos reflejan memorización del dataset y no son una medida estadísticamente significativa de generalización.

## Requisitos de hardware

- Modelo fusionado en fp16: aproximadamente 8 GB de VRAM para los pesos, más overhead y KV cache, lo que requiere en torno a 10-12 GB en total. GPU recomendada: RTX 3060 12GB, RTX 4060 16GB o superior.
- Cuantización GGUF Q4_K_M: en torno a 2.5-3 GB de VRAM o RAM. Puede ejecutarse en GPUs con 6 GB o en CPU con `llama.cpp`.
- El adaptador LoRA en sí es pequeño, pero para inferencia se necesita cargar el modelo base, por lo que el hardware requerido es el de un modelo de 4B parámetros.
- Opciones de despliegue: `llama.cpp` para los archivos GGUF, `Ollama` si se importa el GGUF, `vLLM` para el modelo fusionado en fp16, y `transformers` con `peft` para usar el adaptador original.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 4B, en una GPU moderna la generación es fluida, pero no se aportan datos concretos.

## Comparativa con modelos similares

En la información disponible no se incluyen modelos comparables de la misma categoría. El modelo se puede comparar estructuralmente con el modelo base `Qwen/Qwen3-4B-Instruct-2507` sin adaptador, pero no se aportan datos de benchmarks para establecer una comparativa cuantitativa. Tampoco hay referencias a otros adaptadores LoRA específicos para League of Legends en los datos proporcionados.

## Limitaciones y advertencias

- El dataset de entrenamiento es extremadamente pequeño (76 filas), lo que provoca memorización y poca capacidad de generalización. El modelo funciona mejor en matchups similares a los vistos en el entrenamiento.
- La evaluación held-out es muy reducida (10 matchups) y no es estadísticamente significativa; sirve como prueba de cordura, no como métrica de rendimiento real.
- Las etiquetas de entrenamiento proceden del propio modelo base (auto-destilado), por lo que el adaptador no añade conocimiento nuevo, solo consolida el formato y el estilo de respuesta.
- El modelo no está conectado a datos de partidas en vivo en tiempo de inferencia. No conoce las tasas de victoria del parche actual salvo que la aplicación que lo invoca le inyecte ese contexto.
- Existe riesgo de alucinación en matchups no presentes en el entrenamiento, heredado del modelo base. Puede inventar habilidades, porcentajes o detalles de campeones si se le pregunta sin contexto.
- En producción, cualquier dato citado (porcentajes, habilidades) debe verificarse contra una fuente real antes de usarse.
- El proyecto no está afiliado a Riot Games y utiliza su propiedad intelectual bajo los términos de la API de desarrolladores de Riot, por lo que el uso comercial puede estar sujeto a restricciones adicionales.
- El adaptador tiene licencia MIT, pero los pesos del modelo base Qwen3 están bajo Apache 2.0, lo que debe tenerse en cuenta al distribuir el modelo fusionado.

## Enlaces

- HuggingFace: https://huggingface.co/tksluangrath/lol-matchbook
- Repo GitHub principal: https://github.com/tksluangrath/lol-matchbook
- Dataset de datos de partidas: https://huggingface.co/datasets/BoostedJonP/league_of_legends_match_data
- Repo adicional (lol-matchup-copilot): https://github.com/tksluangrath/lol-matchup-copilot
- Perfil de modelos del autor en HuggingFace: https://huggingface.co/tksluangrath/models
