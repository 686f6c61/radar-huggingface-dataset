# ZeeoRe/jev-multimodal-qwen3.5-4b

## Resumen

JEV Multimodal Qwen3.5-4B es un checkpoint de decisión multimodal desarrollado por ZeeoRe sobre la base de Qwen3.5-4B (4.541 millones de parámetros reales según safetensors). No es un modelo conversacional al uso: se trata de una adaptación de motor de decisión que recibe texto, imágenes y vídeo (solo visual) y devuelve cuatro salidas estructuradas: una elección entre opciones (`choice`), una probabilidad booleana (`noul`), una puntuación ordinal (`score`) y una caja delimitadora normalizada (`box`) para un objeto referido en una imagen.

La relevancia del modelo reside en su enfoque de "system-1": ejecuta una única pasada del backbone por pregunta y genera cero tokens de respuesta. Esto lo aleja del paradigma de decodificación autoregresiva y lo orienta a tareas de enrutamiento, clasificación y grounding visual de baja latencia. El checkpoint es un "merged v1 final": el LoRA de lenguaje está fusionado en el backbone, mientras que se conservan el merger visual entrenado, el scorer de candidatos y la cabeza de caja única.

Es importante subrayar que no es una exportación estándar de `AutoModelForCausalLM`. Requiere el runtime Laya y la clase `MultimodalAgent` para su ejecución, y existe una variante GGUF separada. La licencia es Apache-2.0 y los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) con merger visual nativo, scorer de candidatos y cabeza de caja única; checkpoint nativo Laya |
| Parametros totales | 4.541.396.997 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo principal; existe variante GGUF en repo separado |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint nativo Laya); variante GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y añade sobre él un merger visual nativo entrenado, un scorer de candidatos y una cabeza compacta de caja única con lecturas FP32. El LoRA de lenguaje (rank 32, alpha 64) se fusiona en el backbone mediante `merge_and_unload` de PEFT, de modo que la inferencia no requiere el adaptador ni el modelo base por separado. La ejecución realiza una sola pasada del backbone por pregunta y no genera tokens de respuesta, lo que constituye la innovación principal frente a los modelos generativos convencionales.

El entrenamiento de la ejecución v1 completada utilizó 1.337.263 decisiones: 888.532 de texto, 212.035 de imagen y 236.696 de vídeo. El procedimiento incluyó un calentamiento de cabezas (head warmup) y una época de adaptación supervisada con LoRA. La ejecución principal no empleó RLCD ni destilación. El dataset preparado v4 no se usó para entrenar este checkpoint. El repositorio incluye `merge-verification.json` con comprobaciones pre y post-fusión sobre entradas sintéticas de texto, imagen y vídeo, además de sumas de verificación SHA256 y procedencia del runtime.

## Capacidades

- Decisión por elección entre opciones (`choice`) con criterios e instrucciones definidos por el usuario.
- Probabilidad booleana (`noul`) para preguntas de sí/no.
- Puntuación ordinal (`score`) como índice de nivel esperado según la leyenda de la pregunta.
- Grounding visual: devuelve una caja normalizada xyxy (left/top/right/bottom) para un objeto referido en una imagen.
- Procesamiento de texto, imágenes y vídeo solo visual como entradas.
- Ejecución de una sola pasada del backbone por pregunta, sin generación de tokens.
- Soporte multilingüe limitado a inglés y chino.
- No dispone de entrada de audio nativa en este runtime.
- No es un modelo de chat conversacional ni soporta tool calling ni razonamiento multi-paso en el sentido habitual.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica una consulta de texto entre equipos (por ejemplo, facturación frente a técnico) usando `choice` con criterios definidos, en una sola pasada y sin generar texto, lo que reduce latencia en pipelines de atención al cliente.
- Moderación y clasificación binaria: con la salida `noul` (P(true)) se pueden implementar filtros de contenido o verificaciones sí/no sobre texto e imágenes en flujos de producción.
- Grounding de objetos en imágenes: dado un objeto referido ("la taza roja"), devuelve una caja normalizada con estimación de calidad, útil para anotación asistida, robótica o interfaces de selección visual.
- Análisis de vídeo visual: al aceptar vídeo solo visual, puede emplearse para decisiones de clasificación o enrutamiento sobre clips sin necesidad de audio.
- Puntuación ordinal de calidad o severidad: la salida `score` permite ordenar casos por nivel (por ejemplo, gravedad de una incidencia) interpretando el índice según la leyenda de la pregunta.
- Evaluación de decisiones en agentes: como motor de decisión de system-1, puede integrarse en agentes que necesitan resolver elecciones rápidas de bajo coste computacional antes de invocar modelos generativos mayores.

## Benchmarks y rendimiento

Resultados históricos del checkpoint v1 final original (sin fusionar). El modelo fusionado y el GGUF se verificaron solo en fidelidad de conversión sobre casos sintéticos; la prueba completa no se repitió tras la conversión. No son resultados oficiales de leaderboard upstream.

| Metrica | Valor | Denominador |
|---|---:|---:|
| Precisión de decisión (errores cuentan como incorrectos) | 84,4934% | 151.581 |
| Precisión de decisión en casos válidos | 84,8831% | 151.089 |
| Single-box Acc@IoU >= 0,5 | 90,2967% | 30.969 |
| Single-box mean IoU | 0,811447 | 30.969 |

Hubo 492 entradas de decisión inválidas que permanecen en el denominador de todos los casos. El test común se usó en diagnóstico histórico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.541 millones de parámetros en safetensors y un repo de 9,2 GB, se requiere al menos una GPU con memoria suficiente para cargar los pesos completos más el runtime multimodal.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el repo no detalla requisitos mínimos.
- Opciones de despliegue: runtime Laya con `MultimodalAgent` (instalación vía `python -m pip install -c requirements-runtime.txt './runtime[multimodal]'`); para vídeo se requiere FFmpeg. Existe variante GGUF con runtime `llama.cpp-jev` en el commit indicado en `provenance.json`.
- Latencia y throughput: no disponibles; el diseño de una sola pasada del backbone por pregunta sugiere baja latencia relativa frente a modelos generativos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEV Multimodal Qwen3.5-4B | 4.541 M | no disponible | Decisión multimodal system-1 (choice, noul, score, box) | Apache-2.0 | Hugging Face (repo principal + GGUF) |
| Qwen3.5-4B (base) | ~4B | no disponible | LLM generativo multimodal | Apache-2.0 | Hugging Face |
| Alternativas de grounding visual dedicadas | no disponible | no disponible | Detección/grounding | variable | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada. La comparación directa con el modelo base Qwen3.5-4B no es posible en términos de rendimiento porque las tareas y salidas difieren sustancialmente.

## Limitaciones y advertencias

- No es un modelo de chat estándar: no funciona con `AutoModelForCausalLM` ni con pipelines convencionales de Hugging Face; requiere el runtime Laya.
- Solo soporta inglés y chino; no hay soporte declarado para castellano.
- No dispone de entrada de audio nativa en este runtime.
- La calidad de la caja devuelta no es automáticamente una probabilidad de presencia calibrada.
- Los benchmarks corresponden al checkpoint v1 original sin fusionar; la fidelidad tras la fusión y conversión a GGUF solo se verificó en casos sintéticos, no en el test completo.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- El modelo se presenta como adaptación de motor de decisión abierto, no como pesos propietarios oficiales de Jev ni como reproducción de su receta de entrenamiento interna.
- El dataset v4 preparado no se usó para entrenar este checkpoint, por lo que su rendimiento no refleja ese material.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen3.5-4B.

## Enlaces

- Hugging Face (repo principal): https://huggingface.co/ZeeoRe/jev-multimodal-qwen3.5-4b
- Variante GGUF: https://huggingface.co/ZeeoRe/jev-multimodal-qwen3.5-4b-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Runtime Laya: https://github.com/NandhaKishorM/laya
- Runtime GGUF llama.cpp-jev: https://github.com/2351548518/llama.cpp-jev
- Documentación PEFT merge_and_unload: https://huggingface.co/docs/peft/package_reference/peft_model
