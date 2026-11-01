# tinyrolls/DeepSeek-R1-0528-Qwen3-8B-RoleVerse-DPO

## Resumen

DeepSeek-R1-0528-Qwen3-8B-RoleVerse-DPO es un ajuste fino por DPO del modelo destilado deepseek-ai/DeepSeek-R1-0528-Qwen3-8B, publicado por el usuario tinyrolls. El modelo está especializado en role-playing multilingüe (interpretación de personajes en diálogo) y deriva de la investigación recogida en el artículo *Knows but Cannot Act: A Reasoning–Social Trade-off in Multilingual Role-Playing*, que introduce el benchmark RoleVerse y estudia el equilibrio entre comprensión social y capacidad de actuar en personaje.

El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Qwen3-8B, con 8.190.735.360 parámetros totales según los pesos en safetensors y un repositorio de 16,4 GB. El ajuste aplicado es únicamente DPO (sin SFT previo) sobre el conjunto de datos RoleVerse, un benchmark multilingüe construido en torno a situaciones de conflicto y evaluado con un protocolo dual "saber–actuar": una pregunta de opción múltiple que mide la comprensión de la situación social y una respuesta abierta que se juzga por su adecuación al personaje.

Su relevancia es doble: por un lado, es un checkpoint de investigación que documenta empíricamente cómo el DPO puede mejorar la actuación en personaje mientras degrada o mantiene la comprensión social; por otro, es una opción práctica de 8B parámetros para prototipos de diálogo con personajes en cinco idiomas (inglés, chino, japonés, francés y español) bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, destilado de DeepSeek-R1) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3 con 8.190.735.360 parámetros, inicializado desde deepseek-ai/DeepSeek-R1-0528-Qwen3-8B, un destilado de razonamiento de DeepSeek-R1 sobre Qwen3-8B. La model card indica que los checkpoints Qwen3-8B admiten el conmutador `enable_thinking` en `apply_chat_template`, y que los checkpoints en modo Thinking responden tras el bloque `</think>`, lo que sugiere que la arquitectura conserva el modo de razonamiento explícito del modelo base.

El entrenamiento consiste exclusivamente en DPO (sin SFT) sobre el dataset tinyrolls/RoleVerse, un benchmark multilingüe de role-playing centrado en conflictos y evaluado con un protocolo dual de conocimiento (pregunta de opción múltiple sobre la situación social) y actuación (respuesta abierta juzgada por adecuación al personaje). El artículo asociado compara cuatro regímenes de entrenamiento (solo SFT, solo DPO, SFT+DPO y sin entrenar) sobre varias familias base, y documenta que el DPO aislado mejora la media de respuesta mientras el SFT tiende a degradar la comprensión social medida por MCQ. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni hiperparámetros del DPO.

## Capacidades

- Generación de texto y diálogo multi-turno orientado a la interpretación de personajes (role-playing).
- Comprensión de situaciones sociales y de conflicto, medida en el benchmark RoleVerse mediante preguntas de opción múltiple.
- Actuación en personaje: el modelo habla como `role2`, con los turnos de `role1` como turnos de usuario y los suyos como turnos de asistente.
- Multilingüe en inglés, chino, japonés, francés y español.
- Conserva la capacidad de razonamiento del modelo base destilado de DeepSeek-R1; los checkpoints Qwen3-8B permiten alternar modo Thinking y Non-thinking mediante `enable_thinking`.
- Soporte de plantilla de chat compatible con `transformers` y `apply_chat_template`.
- Compatible con text-generation-inference y endpoints según las etiquetas del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Prototipado de chatbots de personajes: el modelo está entrenado específicamente para responder como un personaje concreto (`role2`) en diálogos con conflictos, por lo que sirve para validar guiones y personalidades antes de invertir en modelos mayores.
- Investigación sobre alineación social: permite reproducir y extender los experimentos del artículo comparando DPO aislado frente a SFT y SFT+DPO en la misma base, con checkpoints de referencia publicados en la colección RoleVerse.
- Evaluación comparativa multilingüe: al cubrir en, zh, ja, fr y es, se puede usar para medir si la calidad de actuación en personaje se mantiene al cambiar de idioma dentro de un mismo sistema.
- Generación de diálogos para videojuegos y narrativa interactiva: con 8B parámetros y licencia MIT, es viable desplegarlo en entornos de desarrollo para generar réplicas de NPC en situaciones de tensión o conflicto.
- Simulación de entrevistas y dinámicas sociales: el protocolo saber–actuar del que deriva el entrenamiento lo hace adecuado para escenarios donde el modelo debe interpretar un rol (entrevistador, cliente difícil) y mantener coherencia de personaje.
- Docencia y divulgación sobre DPO: al ser un ajuste "solo DPO" sobre una base conocida, sirve como ejemplo didáctico de cómo el DPO modifica el comportamiento conversacional sin pasar por SFT.
- Filtrado y anotación de datos de role-playing: puede emplearse para generar respuestas candidatas en personaje que luego se revisan o puntúan en pipelines de anotación.

## Benchmarks y rendimiento

Resultados del artículo en el conjunto de test de RoleVerse. Resp Avg: media de cinco dimensiones de respuesta puntuadas de 1 a 5 por un juez GPT-5. MCQ %: precisión en comprensión social.

| Grupo | Modelo | Resp Avg | MCQ % |
|---|---|---:|---:|
| Sin entrenar | Qwen2.5-32B-Instruct | 2,79 | 48,67 |
|  | R1-Distill-Qwen-32B | 2,38 | 53,28 |
|  | Qwen3-30B-A3B-Instruct-2507 | 3,69 | 41,73 |
|  | Qwen3-30B-A3B-Thinking-2507 | 3,40 | 52,27 |
|  | gpt-oss-120b (low) | 3,15 | 67,30 |
|  | gpt-oss-120b (medium) | 3,00 | 72,60 |
|  | gpt-oss-120b (high) | 2,93 | 73,04 |
|  | DeepSeek-R1-0528 | 4,12 | 70,14 |
|  | GPT-5 (low; referencia) | 4,35 | 81,88 |
| Llama-3.1-8B-Instruct | base | 2,87 | 29,36 |
|  | + Only SFT | 3,35 | 19,07 |
|  | + Only DPO | 3,42 | 32,39 |
|  | + SFT & DPO | 3,81 | 17,05 |
| Qwen3-8B Non-thinking | base | 3,16 | 33,96 |
|  | + Only SFT | 3,35 | 32,07 |
|  | + Only DPO | 3,42 | 35,23 |
|  | + SFT & DPO | 3,73 | 31,57 |
| Qwen3-8B Thinking | base | 3,38 | 40,85 |
|  | + Only SFT | 3,38 | 37,75 |
|  | + Only DPO | 3,60 | 43,12 |
|  | + SFT & DPO | 3,61 | 34,60 |
| R1-Distill-Qwen3-8B | base | 2,47 | 50,06 |
|  | + Only SFT | 2,15 | 31,50 |
|  | **+ Only DPO (este modelo)** | **3,07** | **49,62** |
|  | + SFT & DPO | 3,07 | 28,85 |

Lectura de los datos: sobre la base R1-Distill-Qwen3-8B, el DPO aislado sube la media de respuesta de 2,47 a 3,07 (+0,60) manteniendo la comprensión social prácticamente intacta (50,06 → 49,62). El SFT aislado, en cambio, hunde el MCQ a 31,50 y baja la media a 2,15; el SFT+DPO recupera la media (3,07) pero deja el MCQ en 28,85. El modelo queda por debajo de Qwen3-8B Thinking con DPO (3,60 / 43,12) en media de respuesta y en MCQ, y muy lejos de DeepSeek-R1-0528 (4,12 / 70,14) y GPT-5 (4,35 / 81,88).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos (8,19B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda una GPU de 24 GB o más.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantización a 4 bits: en torno a 4-5 GB de pesos, viable en GPUs consumer de 8 GB, aunque no se han publicado cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para producción en BF16; RTX 4090 (24 GB) para BF16 en una sola tarjeta; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 y en tarjetas de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: `transformers` con `device_map="auto"` (el método documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y endpoints compatibles. No se confirman integraciones específicas con vLLM, llama.cpp, Ollama o TGI más allá de la etiqueta del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resp Avg (RoleVerse) | MCQ % | Licencia |
|---|---:|---|---:|---:|---|
| DeepSeek-R1-0528-Qwen3-8B-RoleVerse-DPO | 8,19B | no disponible | 3,07 | 49,62 | MIT |
| R1-Distill-Qwen3-8B (base sin entrenar) | 8B | no disponible | 2,47 | 50,06 | MIT |
| Qwen3-8B Thinking + Only DPO | 8B | no disponible | 3,60 | 43,12 | Apache-2.0 |
| Llama-3.1-8B-Instruct + Only DPO | 8B | no disponible | 3,42 | 32,39 | Llama 3.1 Community |

Frente a su base sin entrenar, este checkpoint gana 0,60 puntos de media de respuesta con una pérdida de solo 0,44 puntos de MCQ. Frente a Qwen3-8B Thinking con DPO, pierde 0,53 puntos de media pero gana 6,5 puntos de MCQ, lo que lo sitúa como una opción más equilibrada entre saber y actuar. Frente a Llama-3.1-8B-Instruct con DPO, gana en ambas métricas (0,35 de media y 17,23 puntos de MCQ).

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el formato de diálogo de RoleVerse: habla como `role2` y espera los turnos de `role1` como usuario; fuera de ese esquema su comportamiento puede degradarse.
- El ajuste es solo DPO sobre una base de razonamiento; el artículo documenta que el lado centrado en razonamiento comprende mejor la escena pero la actúa peor, por lo que puede producir respuestas analíticamente correctas pero poco naturales en personaje.
- Riesgo de alucinación inherente a un modelo de 8B destilado de razonamiento; no se han publicado evaluaciones de factualidad en la información disponible.
- La comprensión social medida por MCQ (49,62 %) está muy por debajo de DeepSeek-R1-0528 (70,14 %) y GPT-5 (81,88 %), lo que limita su uso en escenarios sociales complejos.
- Cobertura lingüística limitada a en, zh, ja, fr y es; no se garantiza calidad fuera de esos idiomas.
- El artículo asociado está en revisión y no se han publicado detalles completos de entrenamiento (tokens, composición del dataset, hiperparámetros), lo que dificulta la reproducibilidad.
- Licencia MIT para este checkpoint, pero conviene verificar las condiciones de la licencia del modelo base y de los datos de entrenamiento antes de un uso comercial a gran escala.
- El repositorio tiene 142 descargas y 0 likes en el momento de la consulta: es un checkpoint de investigación con poca validación comunitaria.
- No se documentan salvaguardas específicas frente a contenido sensible en role-playing de conflicto; en producción conviene añadir filtros propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tinyrolls/DeepSeek-R1-0528-Qwen3-8B-RoleVerse-DPO
- Dataset RoleVerse: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Colección RoleVerse: https://huggingface.co/collections/tinyrolls/roleverse-6ae2cab39027be0451529147
- Código del proyecto: https://github.com/tinyrolls/RoleVerse
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
