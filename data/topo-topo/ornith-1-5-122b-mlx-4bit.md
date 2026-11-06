# ToPo-ToPo/Ornith-1.5-122B-mlx-4bit

## Resumen

Ornith-1.5-122B-mlx-4bit es una conversión cuantizada a 4 bits para Apple Silicon del modelo multimodal Ornith-1.5-122B, desarrollado originalmente por ornith-ai. La conversión la firma el usuario ToPo-ToPo y está pensada para ejecutarse con la librería MLX (concretamente mlx-vlm) en equipos Mac con chip de Apple. Se trata de un modelo de arquitectura Qwen3_5MoeForConditionalGeneration, es decir, un transformer de mezcla de expertos (MoE) con torre de visión, capaz de procesar entradas de imagen y texto y generar texto.

El modelo resuelve el problema de desplegar un modelo de 122.562.817.776 parámetros totales en hardware de consumo Apple, algo inviable en precisión completa (el repo ocupa 72,7 GB de pesos). Para ello aplica una receta de precisión mixta: los expertos enrutados se cuantizan a 4 bits y el resto de capas lineales (atención, proyecciones Gated DeltaNet, experto compartido, routers, embeddings y lm_head) se mantienen a 8 bits. La torre de visión se conserva en bf16, lo que diferencia esta conversión de la versión oficial de 4 bits, que es solo texto.

Su relevancia actual radica en que permite inferencia multimodal local en Mac con una ventana de contexto amplia (heredada del modelo base) y con soporte de tool calling, algo poco habitual en modelos de este tamaño ejecutados en silicio de Apple. La licencia es MIT, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3_5MoeForConditionalGeneration) con torre de visión y capas Gated DeltaNet |
| Parametros totales | 122.562.817.776 |
| Parametros activos | no disponible (la model card indica que se activan 8 de 256 expertos por token, pero no se especifica el total de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (expertos enrutados, group size 64) y 8 bits (resto de capas lineales); torre de visión en bf16 |
| Idiomas soportados | no disponible (la model card menciona pruebas en japonés e inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 144 capas que contienen módulos `switch_mlp` (expertos enrutados) y 470 capas lineales adicionales. Incorpora proyecciones Gated DeltaNet, un experto compartido y routers, además de una torre de visión con 333 tensores y procesadores de imagen y vídeo. El checkpoint original es de tipo `Qwen3_5MoeForConditionalGeneration`, lo que confirma la integración de visión y texto en un único modelo condicional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión aquí descrita no reentrena el modelo: aplica cuantización afín con group size 64 mediante `mlx_vlm.convert` (mlx-vlm 0.7.6, mlx 0.32.3). Los pesos MTP (multi-token prediction) del modelo fuente no se incluyen en esta conversión; el autor los publica por separado como drafter en bf16. La innovación técnica principal de esta ficha es la receta de precisión mixta: como solo 8 de 256 expertos se activan por token mientras que las capas no-expertas se ejecutan siempre, mantener estas últimas a 8 bits reduce el error de cuantización con un coste de tamaño moderado (72,7 GB frente a 69,6 GB de la versión oficial de 4 bits y 130,6 GB de la de 8 bits).

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (image-text-to-text): la torre de visión se conserva, por lo que acepta entradas de imagen. El autor validó que identifica correctamente colores, formas y posiciones en una imagen sintética.
- Tool calling / function calling: evaluado por el autor en escenarios de llamada a herramientas en japonés e inglés.
- Razonamiento multi-step y uso como agente: el modelo base incluye modo thinking (la model card menciona `enable_thinking=False`), aunque esta conversión no incluye los pesos MTP para decodificación especulativa.
- Capacidades multilingües: pruebas en japonés e inglés; se detecta deriva al chino en algunas explicaciones de expresiones idiomáticas japonesas.
- Procesamiento de vídeo: los configs del procesador de imagen y vídeo están presentes en el checkpoint.

## Casos de uso

- Asistente multimodal local en Mac: cargar el modelo con `mlx_vlm` y usarlo para responder preguntas sobre imágenes (capturas, diagramas, fotografías) sin enviar datos a la nube, gracias a que la torre de visión se mantiene en bf16.
- Automatización de agentes con tool calling en producción: el modelo alcanzó un 100% de formato válido de llamada a herramientas en inglés y un 99% de precisión en japonés en la evaluación del autor, lo que lo hace adecuado para orquestar APIs y flujos multi-paso.
- Generación de correos y documentos con herramientas externas: el autor documenta un escenario de redacción de correo de reprogramación de reunión que esta conversión supera donde la versión oficial de 4 bits falla, útil para asistentes de productividad que deben invocar un calendario.
- Prototipado de investigación en visión-lenguaje: al ser un MoE de 122B con visión y licencia MIT, sirve para experimentar con razonamiento multimodal en hardware Apple sin depender de GPUs dedicadas.
- Atención al cliente multilingüe: las pruebas en japonés e inglés con formato de tool calling validado permiten integrarlo en chatbots que consulten sistemas internos mediante funciones.
- Evaluación comparativa de cuantizaciones: el repo incluye una receta reproducible (predicado de cuantización) que permite generar variantes 4/8 bits y medir el impacto en latencia y precisión en un mismo Mac.
- Inferencia con decodificación especulativa: combinando este repo con el drafter MTP bf16 publicado por el mismo autor se puede acelerar la generación, aunque la model card no cuantifica la ganancia.

## Benchmarks y rendimiento

Evaluación interna del autor (thinking off, 5 muestras por caso: 34 sondas cortas japonés/inglés y 20 escenarios de tool calling en ambos idiomas), servida con mlx-vlm sin MTP en el mismo Mac Apple Silicon:

| Metrica | 8bit | 4bit oficial | este repo |
|---|---|---|---|
| Precisión tool calling japonés | 98% | 94% | 99% |
| Formato válido de tool call (japonés) | 98,6% | 98,5% | 100% |
| Precisión tool calling inglés | 99% | 100% | 100% |
| Respuestas con chino simplificado/hangul (tool calling) | 0% | 3% | 0% |
| Igual, en sondas | 2,4% | 3,5% | 3,5% |
| Fuga de thinking con thinking off (sondas) | 0% | 2,9% | 0% |
| Precisión en sondas | 97,4% | 100% | 98,3% |
| Velocidad de generación (sin MTP, 400 tokens) | 46,7 tok/s | 60,9 tok/s | 52,3 tok/s |
| Memoria pico | 130,9 GB | 72,9 GB | 72,9 GB |

El autor advierte que el conjunto de evaluación es pequeño, no cubre tareas agénticas largas y las diferencias de precisión en sondas están dentro de una o dos muestras. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: alrededor de 72,9 GB de pico según la medición del autor, lo que exige un Mac con al menos 96 GB de memoria unificada (idealmente 128 GB o más para margen del sistema).
- GPU recomendadas: exclusivamente Apple Silicon con MLX; no está pensado para GPUs NVIDIA o AMD. La model card no especifica qué chips concretos se usaron en las pruebas.
- Cabe en GPU de consumo: no en el sentido tradicional; requiere un Mac de gama alta con memoria unificada amplia. No cabe en una RTX 4090 (24 GB) ni en configuraciones de 32 o 64 GB.
- Opciones de despliegue: `mlx-vlm` (librería indicada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Latencia y throughput: 52,3 tok/s en generación de 400 tokens sin MTP, según la medición del autor; con el drafter MTP separado no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Memoria pico (segun autor) |
|---|---|---|---|---|---|---|
| ToPo-ToPo/Ornith-1.5-122B-mlx-4bit (este repo) | 122,56B | no disponible | Si | MIT | safetensors MLX | 72,9 GB |
| ornith-ai/Ornith-1.5-122B-MLX-4bit (oficial) | 122,56B | no disponible | No | MIT | safetensors MLX | 72,9 GB |
| ToPo-ToPo/Ornith-1.5-122B-mlx-8bit | 122,56B | no disponible | Si | MIT | safetensors MLX | 130,9 GB |
| ToPo-ToPo/Ornith-1.5-35B-A3B-mlx-4bit | no disponible (nombre sugiere 35B totales, 3B activos) | no disponible | no disponible | MIT (presumible, mismo autor) | safetensors MLX | no disponible |

La comparativa se limita a variantes del mismo modelo base porque la información disponible no incluye modelos de otros desarrolladores con los que contrastar. No se dispone de datos de benchmarks estándar para comparar rendimiento entre ellos más allá de la evaluación interna del autor recogida arriba.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base tiende a cambiar al chino en algunas explicaciones de expresiones idiomáticas japonesas incluso en 8 bits; el autor lo atribuye a un hábito del modelo, no a la cuantización.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas agénticas largas no cubiertas por la evaluación.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; las pruebas del autor se limitan a japonés e inglés y el conjunto es pequeño (34 sondas y 20 escenarios), sin cobertura de tareas agénticas prolongadas.
- Restricciones de licencia: licencia MIT, que permite uso comercial; conviene revisar el archivo LICENSE del modelo base enlazado por el autor.
- Caveats para producción: la cuantización mixta introduce errores medibles (precisión en sondas del 98,3% frente al 100% del 4 bits oficial, aunque dentro del margen de una o dos muestras); los pesos MTP no están incluidos, por lo que no hay decodificación especulativa sin cargar el drafter aparte; el despliegue está atado a MLX y Apple Silicon, sin soporte documentado para vLLM, llama.cpp u otros motores; el repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ToPo-ToPo/Ornith-1.5-122B-mlx-4bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Conversión oficial 4 bits (solo texto): https://huggingface.co/ornith-ai/Ornith-1.5-122B-MLX-4bit
- Conversión 8 bits del mismo autor: https://huggingface.co/ToPo-ToPo/Ornith-1.5-122B-mlx-8bit
- Drafter MTP bf16: https://huggingface.co/ToPo-ToPo/Ornith-1.5-122B-MTP-bf16
- Conversión 4 bits del modelo 35B-A3B (misma receta): https://huggingface.co/ToPo-ToPo/Ornith-1.5-35B-A3B-mlx-4bit
