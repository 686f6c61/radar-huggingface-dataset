# vespernine/Swift-1.5-Qwen3.8-27B-4bit-MLX-vision

## Resumen

Swift-1.5-Qwen3.8-27B-4bit-MLX-vision es un checkpoint multimodal en formato MLX para Apple Silicon que combina dos linajes: el fine-tune Swift 1.5 de UkisAI (publicado originalmente como modelo solo de texto, sin la torre de visión) y la torre de visión nativa de Qwen3.8-27B de Alibaba Cloud. El autor, vespernine, realiza un injerto de pesos a nivel de byte: añade 333 tensores en BF16 (921,5 MB) procedentes del checkpoint base de Qwen3.8-27B sin recuantizar, reordenar ni alterar ningún peso del lado texto. El resultado es un Swift 1.5 con capacidad de visión completa que el runtime Splash 1.7.3+ carga de forma nativa como modelo multimodal.

El modelo resuelve un problema concreto de empaquetado: la release oficial de UkisAI en MLX descartó la torre de visión aunque el `config.json` conservaba la `vision_config` completa, de modo que el cargador nativo de Splash rechazaba el checkpoint con el error "has no vision tower". Como el fine-tune de Swift 1.5 nunca tocó la torre de visión, esta es compatible de forma directa con el "cerebro" Swift, y el injerto restaura la carga multimodal sin riesgo de calidad.

Con 27.781.423.344 parámetros totales (aproximadamente 27,8 mil millones), cuantización de 4 bits, un repositorio de 16,8 GB y licencia Swift Open License v1.0, el modelo está orientado a inferencia local en hardware Apple Silicon. La validación se realizó en una M5 Ultra de 256 GB contra la ruta de servicio en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B con torre de visión nativa); tag de arquitectura `qwen3_5` |
| Parametros totales | 27.781.423.344 (27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la validación cubre escalones de prefill de 1K a 64K) |
| Tipos de cuantizacion | 4 bits (checkpoint MLX 4-bit); la torre de visión se añade en BF16 sin recuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | swift-open-license-v1.0 (pesos Swift) + Apache 2.0 (torre de visión y porciones base) |
| Formato de pesos | safetensors (MLX): `model-vision-tower.safetensors` + tres shards de texto, con `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal basado en Qwen3.8-27B de Alibaba Cloud, con una torre de visión nativa de 333 tensores en BF16 (921,5 MB) y un cuerpo de texto cuantizado a 4 bits en formato MLX. El fine-tune Swift 1.5 de UkisAI se entrenó sin modificar la torre de visión, por lo que esta permanece bit-idéntica al checkpoint base de Qwen3.8-27B. El injerto de vespernine mueve los tensores como rangos de bytes crudos y verifica 333/333 contra el checkpoint base; no hay recuantización, reordenación ni alteración de pesos. Los tres shards de texto, el `config.json`, los assets del tokenizer y la plantilla de chat son byte-idénticos a `ukisai/Swift-1.5-4bit-MLX`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune Swift 1.5. La innovación técnica destacable es el injerto de pesos a nivel de byte con verificación tensor a tensor y la compatibilidad con decodificación especulativa mediante el draft DFlash2 de Qwen3.8-27B. El checkpoint se distribuye con un `QUANTIZATION_MANIFEST.json` de UkisAI para trazabilidad de la conversión a 4 bits.

## Capacidades

- Generación de texto conversacional y razonamiento, con niveles de esfuerzo de razonamiento (`reasoning_effort`) ajustables a nivel de petición.
- Comprensión de imágenes (image-text-to-text): descripción de contenido visual con colores, formas y posiciones; validado con una sonda de imagen de referencia.
- Generación de código: la puerta funcional de 7 carriles reporta paridad o mejora frente al base con puntuación de código 1.0.
- Matemáticas: puntuación de 0.95 en la puerta funcional de matemáticas.
- Seguimiento de instrucciones: IFEval estricto entre 0.90 y 0.967.
- Decodificación especulativa compatible mediante el draft Qwen3.8-27B DFlash2 (`--draft-model`).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Inferencia local multimodal en Apple Silicon: el checkpoint está pensado para cargarse de forma nativa en Splash 1.7.3+ sobre hardware Apple (validado en M5 Ultra de 256 GB), lo que permite ejecutar un modelo de 27,8 mil millones de parámetros con visión en un equipo de sobremesa de gama alta.
- Descripción y análisis de imágenes en local: la torre de visión restaurada permite tareas de image-text-to-text (descripción de escenas, identificación de objetos, colores y posiciones) sin depender de servicios en la nube, útil en entornos con requisitos de privacidad.
- Asistentes conversacionales de contexto largo: la validación cubre prefill de 1K a 64K tokens, lo que permite conversaciones multi-turno con documentos o historiales extensos dentro de la ventana soportada.
- Generación de código asistida: con puntuación de código 1.0 en la puerta funcional, es adecuado para autocompletado, generación de funciones y revisión de código en flujos de desarrollo locales.
- Razonamiento matemático y resolución de problemas: la puntuación de 0.95 en matemáticas lo hace apto para tutoría, verificación de cálculos y resolución paso a paso con esfuerzo de razonamiento ajustable.
- Evaluación y experimentación con fine-tunes: al ser byte-idéntico al checkpoint de UkisAI en el lado texto, sirve como base reproducible para comparar el efecto de la torre de visión restaurada frente al checkpoint solo texto.
- Servicio con decodificación especulativa: el uso del draft DFlash2 permite reducir latencia en despliegues de producción sobre Splash, con paridad de velocidad de prefill/decode frente al base dentro de ±1,4 % en todos los escalones medidos.

## Benchmarks y rendimiento

Los datos disponibles provienen de la puerta funcional de 7 carriles del autor, medida frente al checkpoint base Qwen3.8-27B-4bit. No se aportan resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) con cifras comparables entre modelos.

| Prueba | Resultado reportado |
|---|---|
| Código | 1.0 |
| IFEval estricto | 0.90–0.967 |
| Matemáticas | 0.95 |
| SimpleQA | 18–19/20 |
| MT-bench | 8.8–9.15 |
| Respuestas degeneradas (esfuerzo de razonamiento medio) | 0 |
| Velocidad prefill/decode (1K → 64K, gen 128, batches 2/4) | paridad con el base dentro de ±1,4 % en cada escalón |
| Decode con draft DFlash2 | igual o mejor que el base |

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 16,8 GB; se requiere memoria unificada suficiente para cargar los pesos de 4 bits más la torre de visión en BF16 (921,5 MB) y el espacio de trabajo de inferencia. No se publica una cifra exacta de memoria mínima.
- GPU recomendadas: no aplica GPU discreta; el formato MLX está orientado a Apple Silicon. La validación se realizó en una M5 Ultra con 256 GB de memoria unificada.
- Compatibilidad con GPU de consumo: no se documenta compatibilidad con RTX 4090, A100 o H100; el checkpoint es de formato MLX y no está pensado para ellas.
- Opciones de despliegue: Splash 1.7.3+ (probado y recomendado, carga nativa multimodal con `splash serve --model <repo> --model-dir <local-dir>`); MLX-LM estándar requiere el parche de arquitectura de UkisAI para MLX-LM 0.32.0 y no ha sido probado con este repositorio; mlx-vlm, transformers y vLLM no están probados (transformers y vLLM no aplican a un checkpoint MLX).
- Latencia y throughput: paridad con el base Qwen3.8-27B-4bit dentro de ±1,4 % en todos los escalones de prefill/decode medidos (1K a 64K, generación de 128 tokens, batches 2 y 4); decode igual o mejor con el draft DFlash2. No se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-4bit-MLX-vision (este) | 27,8 mil millones | no disponible | Sí (torre restaurada) | Swift Open License v1.0 + Apache 2.0 | MLX safetensors 4-bit |
| ukisai/Swift-1.5-4bit-MLX | no disponible en la información | no disponible | No (checkpoint solo texto) | Swift Open License v1.0 | MLX safetensors 4-bit |
| Qwen/Qwen3.8-27B | 27,8 mil millones (base) | no disponible | Sí (torre nativa) | Apache 2.0 | no disponible |

La comparativa se limita a los linajes citados en la información disponible; no se aportan datos de rendimiento cruzados entre ellos más allá de la paridad de velocidad y calidad reportada frente al base Qwen3.8-27B-4bit.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no hay evidencia de rendimiento en castellano u otros idiomas.
- Riesgo de alucinación: no se documenta una evaluación específica de factualidad más allá de SimpleQA (18–19/20); como en cualquier modelo generativo, persiste el riesgo de respuestas incorrectas con apariencia de veracidad.
- Licencia dual y restricción comercial: los pesos Swift están bajo Swift Open License v1.0, que permite uso comercial solo a organizaciones con ingresos brutos anuales inferiores a 1.000.000 USD; por encima se requiere una Swift Enterprise License. La torre de visión y las porciones base están bajo Apache 2.0.
- Compatibilidad de runtime limitada: solo Splash 1.7.3+ está validado; MLX-LM requiere el parche de arquitectura de UkisAI y no se ha probado; mlx-vlm, transformers y vLLM no están probados o no aplican.
- Muestreo: la API de Splash es greedy si se omiten los parámetros de muestreo; el perfil previsto requiere `temperature: 1.0, top_p: 0.95, top_k: 20` y dejar margen en `max_tokens` para el razonamiento.
- Hardware: formato MLX exclusivo para Apple Silicon; no es desplegable en GPU NVIDIA sin conversión, que no se documenta.
- Contexto: la longitud máxima de contexto no se especifica; la validación llega hasta 64K tokens en prefill, pero no se confirma que ese sea el límite del modelo.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (27 de noviembre de 2026); se trata de una publicación muy reciente y poco contrastada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vespernine/Swift-1.5-Qwen3.8-27B-4bit-MLX-vision
- Checkpoint base Swift 1.5 de UkisAI: https://huggingface.co/ukisai/Swift-1.5-4bit-MLX
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime Splash (Inco): https://github.com/incoai/splash
