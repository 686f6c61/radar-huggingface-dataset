# yusufefeerg/riftroam-koc-v10_1-gguf

## Resumen

Riftroam Koc v10.1 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, orientado a ejercer de entrenador (coach) de voz en directo para League of Legends. Lo desarrolla el usuario yusufefeerg y se distribuye en formato GGUF cuantizado Q4_K_M, pensado para inferencia con llama.cpp tanto en CPU como en GPU. El modelo hereda la arquitectura y el tamaño del Qwen3.5-4B original (4.205.751.296 parámetros según los datos del repositorio) y se publica bajo licencia Apache 2.0.

El problema que aborda es muy específico: ofrecer recomendaciones y comentarios en tiempo real durante una partida de League of Legends, en un contexto conversacional y de baja latencia. Al estar construido sobre un modelo de 4B parámetros, el objetivo es que pueda ejecutarse en hardware modesto, algo coherente con el despliegue en local o en el borde que sugiere el formato GGUF Q4_K_M. El repositorio ocupa 2,7 GB.

La relevancia actual del modelo es limitada y muy de nicho: se trata de un proyecto personal con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni resultados de benchmarks publicados en la información disponible. Su interés reside en ser un ejemplo de especialización vertical de un modelo pequeño mediante SFT con RSLoRA sobre un modelo base reciente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.5-4B) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (archivo publicado); el autor menciona además una build Q5_K_M usada para la evaluación |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-4B, por lo que su arquitectura subyacente es la del modelo base, que no se detalla en la información proporcionada. El autor indica que el entrenamiento se realizó mediante SFT (supervised fine-tuning) con la técnica RSLoRA y una fusión de pesos "FP32-exact merge", es decir, una fusión de los adaptadores LoRA en precisión FP32 para preservar la exactitud numérica de los pesos resultantes.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La especialización declarada es el dominio de League of Legends como coach de voz en directo, lo que sugiere un corpus de conversaciones y comentarios de partidas, aunque su contenido concreto no se documenta. El repositorio incluye un informe de evaluación (`eval_v10_1_q5_report.json`) con 246 filas de evaluación "gold" sobre la build Q5_K_M, en el que el autor afirma que se superaron todas las puertas (gates) de calidad, pero los resultados numéricos no se recogen en la información disponible.

## Capacidades

- Generación de texto conversacional en turco e inglés, orientada a comentarios y recomendaciones de coaching.
- Especialización en el dominio de League of Legends: presumiblemente análisis de partidas, recomendaciones de build, posicionamiento y toma de decisiones, aunque el detalle no se documenta.
- Uso conversacional multi-turno (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo "thinking": no disponibles en la información proporcionada.

## Casos de uso

- Asistente de coaching en directo para League of Legends: el modelo puede generar comentarios y recomendaciones durante una partida, aprovechando su ajuste específico sobre conversaciones de coaching y su baja latencia al ejecutarse en formato Q4_K_M con llama.cpp.
- Análisis posterior de partidas: dado su entrenamiento en el dominio, puede emplearse para resumir decisiones, identificar errores y proponer mejoras tras una partida, en inglés o turco.
- Herramienta educativa para jugadores noveles: integrado en una interfaz de chat, puede explicar conceptos del juego, builds y roles en un registro conversacional accesible.
- Despliegue local en hardware de consumo: al ser un GGUF Q4_K_M de un modelo de 4B, puede ejecutarse en un portátil o en una GPU de gama media sin conexión a la nube, lo que resulta adecuado para herramientas personales de entrenamiento.
- Integración en aplicaciones de escritorio o overlays: su formato GGUF y su compatibilidad con endpoints permiten incrustarlo en herramientas de escritorio que ofrezcan consejos en tiempo real al jugador.
- Prototipado de asistentes verticales de videojuegos: sirve como referencia para experimentar con fine-tuning RSLoRA sobre modelos pequeños en dominios de nicho, dado que el autor documenta el proceso de fusión y cuantización.
- Bot conversacional de comunidad: para servidores de Discord o foros de habla turca o inglesa centrados en League of Legends, con respuestas sobre estrategia y mecánicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un informe de evaluación propio (`eval_v10_1_q5_report.json`) con 246 filas de evaluación gold sobre la build Q5_K_M y afirma que se superaron todas las puertas de calidad, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 2,7 GB (tamaño del repositorio), por lo que se necesitan del orden de 3 a 4 GB de VRAM o RAM para cargar el modelo con contexto moderado; la cifra exacta no está disponible.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder ejecutarlo, aunque no se documenta.
- ¿Cabe en GPU de consumo? Por el tamaño del archivo Q4_K_M, es previsible que sí en tarjetas de gama media con 6 GB o más, pero no se confirma en la información disponible.
- Opciones de despliegue: llama.cpp (formato GGUF, CPU/GPU) es la vía documentada por el autor; también podría usarse con otros runners compatibles con GGUF, aunque no se especifican. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Riftroam Koc v10.1 | 4.205.751.296 | no disponible | apache-2.0 | GGUF Q4_K_M | Fine-tuning de nicho para coaching de League of Legends |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | no disponible | safetensors y otros | Modelo generalista del que deriva; capacidades generales superiores fuera del dominio |
| Alternativas de 4B especializadas en videojuegos | no disponible | no disponible | no disponible | no disponible | No se conocen modelos comparables documentados en la información disponible |

La comparación con alternativas de la misma categoría (modelos pequeños especializados en coaching de videojuegos) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la especialización de dominio a costa de posibles regresiones en capacidades generales, algo habitual en fine-tunings de nicho.

## Limitaciones y advertencias

- Proyecto personal con cero descargas y cero likes en el momento de la consulta: no hay validación externa de su calidad.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; la única evaluación es la del propio autor, cuyos resultados numéricos no se detallan.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar recomendaciones de juego incorrectas o inventar datos sobre campeones, objetos o parches; conviene verificarlas.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de idioma: solo se declaran turco e inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no disponible, lo que dificulta planificar usos con historiales largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no es un producto oficial de Riot Games, tal y como advierte el autor; el uso de marcas y contenido de League of Legends puede estar sujeto a las políticas de Riot.
- Al ser un fine-tuning de nicho, es probable que haya degradado capacidades generales del modelo base; no se recomienda para tareas ajenas al dominio del juego.
- El autor advierte explícitamente de que no es un producto oficial de Riot Games.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yusufefeerg/riftroam-koc-v10_1-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Informe de evaluación (referenciado en la model card): `eval_v10_1_q5_report.json` en el repositorio
- Manifiesto de checksums (referenciado en la model card): `sha256_manifest_v10_1.json` en el repositorio
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
