# stupidlime/Mochi1.6-0.5B-GGUF

## Resumen

Mochi 1.6 es un ajuste fino (fine-tune) de tipo personalidad sobre el modelo base huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3, una variante "abliterated" del Qwen2.5-0.5B-Instruct de Alibaba. Lo desarrolla el usuario de Hugging Face stupidlime y no está concebido como un modelo de conocimiento, sino como un modelo de tono: conversación casual, algo seca y con una personalidad consistente integrada en los pesos, sin necesidad de system prompt.

La relevancia es acotada y muy específica: se trata de un experimento de ajuste de personalidad sobre un modelo de 494 millones de parámetros, distribuido únicamente en formato GGUF con cuantizaciones Q4_K_M y Q8_0, pensado para bots de Discord, proyectos personales y prototipos donde se prioriza el carácter sobre la exactitud. No compite en razonamiento, matemáticas ni código.

La versión 1.6 se entrenó, según el autor, en una máquina local sin límite de tiempo, con un dataset de 2000 ejemplos conversacionales, LoRA de rango 64 y 8 épocas, frente a los datasets incompletos (menos de 1000 ejemplos) y la configuración apresurada de las versiones 1.0 y 1.5. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-0.5B, sin confirmar en la model card) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct-abliterated-v3, una variante del transformer decoder-only de 0,5B de Qwen2.5 con las capas de rechazo neutralizadas ("abliterated") por el autor huihui-ai. Sobre esa base se aplica un ajuste fino con QLoRA de rango 64, 8 épocas y un dataset de 2000 ejemplos conversacionales orientados a reproducir el tono de Mochi. La model card indica que 1.6 se entrenó en una máquina local dedicada, sin las restricciones de tiempo de las versiones anteriores, que usaban notebooks de Kaggle con datasets irregulares de menos de 1000 ejemplos.

No se documentan detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El objetivo del ajuste es exclusivamente estilístico: fijar un registro coloquial y una voz concreta en los pesos, de modo que no sea necesario un system prompt para activar el personaje. La información sobre la longitud de contexto efectiva del modelo resultante no se especifica en la documentación disponible.

## Capacidades

- Generación de texto conversacional en inglés con un tono casual, seco y consistente, integrado en los pesos sin system prompt.
- Mantenimiento de personaje en conversaciones multi-turno de carácter informal.
- Adecuado para check-ins emocionales y charla ligera donde prima el tono sobre la exactitud.
- Uso potencial como capa de reescritura de estilo: un modelo mayor genera la respuesta y Mochi la reformula con su voz (propuesta del autor, no probada).
- Capacidades multilingües: solo inglés declarado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Matemáticas, código y razonamiento fiable: no soportado por diseño.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Bots de Discord con personalidad fija: el modelo se ejecuta en local vía llama.cpp u Ollama con la cuantización Q4_K_M y responde en personaje sin necesidad de configurar un system prompt, lo que simplifica el despliegue en servidores pequeños.
- Compañero conversacional ligero para proyectos personales: al ocupar menos de 1 GB en GGUF, puede correr en portátiles sin GPU dedicada y mantener conversaciones informales multi-turno.
- Capa de estilo sobre un modelo mayor: generar la respuesta con un modelo de más parámetros y pasar el texto por Mochi 1.6 para reformularlo con su tono, conservando la precisión del modelo grande (enfoque sugerido por el autor, sin validar).
- Prototipado rápido de interfaces conversacionales con carácter: sirve para probar flujos de chat y UX de personalidad antes de invertir en un modelo mayor ajustado.
- Experimentación académica o didáctica sobre ajuste de personalidad con QLoRA: el autor documenta la receta (r=64, 8 épocas, 2000 ejemplos, base abliterated), lo que permite reproducir o comparar el enfoque.
- Personajes secundarios en experiencias interactivas (juegos de texto, demos): su tamaño reducido permite instanciar varios agentes con voces distintas en el mismo equipo sin coste elevado de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB con Q4_K_M y en torno a 0,6-0,7 GB con Q8_0, según el tamaño del repo (0,9 GB) y los 494M de parámetros.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, iGPU recientes) e incluso en Raspberry Pi con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli -hf stupidlime/Mochi1.6-0.5B-GGUF`), Ollama (`ollama run hf.co/stupidlime/Mochi1.6-0.5B-GGUF`). vLLM y TGI no se mencionan en la documentación; su soporte GGUF es limitado.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera generación en tiempo real en CPU y muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Mochi1.6-0.5B-GGUF | 494M | no disponible | GGUF (Q4_K_M, Q8_0) | Apache 2.0 | Personalidad / roleplay |
| huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 (base) | 494M | no disponible | safetensors y otros | Apache 2.0 | Asistente general sin rechazos |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según documentación de Qwen, no verificada aquí) | safetensors, GGUF | Apache 2.0 | Asistente general |
| Modelos de rol de 0,5B-1B (p. ej. variantes TinyLlama o SmolLM ajustadas) | 0,5B-1B | variable | GGUF, safetensors | variable | Roleplay / personaje |

La comparación cuantitativa de rendimiento no está disponible: el autor no publica benchmarks y no existen datos objetivos de calidad conversacional para este ajuste. La diferencia principal frente al base es el tono horneado y la distribución exclusiva en GGUF.

## Limitaciones y advertencias

- No es un modelo de conocimiento: el autor advierte explícitamente que fallará con confianza en preguntas factuales, matemáticas, código y razonamiento.
- Riesgo alto de alucinación: con 0,5B de parámetros y un ajuste centrado en estilo, la fidelidad factual es mínima.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- El modelo base es una variante "abliterated", lo que implica que las capas de rechazo han sido neutralizadas; puede generar contenido que otros modelos rechazarían y requiere moderación externa en producción.
- Contexto efectivo no documentado: no se especifica la ventana máxima soportada tras el ajuste.
- Es un fine-tune personal, no un lanzamiento profesional: sin evaluación formal, sin garantías de estabilidad y con 0 descargas y 0 likes en el momento de la consulta.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de moderación integrada hace desaconsejable su uso en producción orientada a usuarios finales sin capas adicionales de control.
- El uso como capa de estilo sobre otro modelo no ha sido probado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stupidlime/Mochi1.6-0.5B-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
