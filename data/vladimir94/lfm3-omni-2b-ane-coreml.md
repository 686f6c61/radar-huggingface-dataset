# vladimir94/lfm3-omni-2b-ane-coreml

## Resumen

LFM3-Omni-2B ANE CoreML es una conversión del modelo LiquidAI/LFM3-Omni-2B al formato Core ML, optimizada para ejecutarse íntegramente en la Apple Neural Engine (ANE) de los chips Apple Silicon. El autor de la conversión es vladimir94, mientras que el modelo original fue desarrollado por Liquid AI. El repositorio contiene únicamente los programas convertidos: el runtime, el código de conversión y las mediciones residen en el repositorio de GitHub vladimir-voinea/lfm3-omni-ane.

El modelo base es un transformer multimodal de 2.000 millones de parámetros con capacidades de texto, visión, audio y salida de voz. La conversión aplica palettización LUT8 (8 bits) a los programas de texto y mantiene los programas multimodales en fp16, sin reentrenar ningún peso. El objetivo es ofrecer inferencia local en hardware Apple con un contexto fijo de 28.672 tokens atendidos de forma exacta y un rendimiento medido de aproximadamente 30 tokens por segundo en decodificación.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo omni (texto, imagen, audio y habla) completamente en la Neural Engine, con métricas de fidelidad respecto al modelo original y con limitaciones explícitas de hardware y de longitud de contexto. Es una pieza útil para desarrolladores que quieran desplegar IA generativa multimodal en Macs y iPads sin depender de GPU dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 13 capas de convolución corta, 6 capas de atención completa y 5 capas de atención deslizante (sliding attention), más torres de visión y audio |
| Parametros totales | 2.000 millones (modelo base LFM3-Omni-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 28.672 tokens, fijada en tiempo de compilación; las peticiones que la exceden se rechazan con `400 context_exceeded` |
| Tipos de cuantizacion | Palettización LUT8 (8 bits) en los programas de texto; fp16 en los programas multimodales |
| Idiomas soportados | no disponible en la información proporcionada; la prueba de fidelidad mezcla inglés, rumano, código y aritmética |
| Licencia | lfm-open-license-v1.0 (Other) |
| Formato de pesos | Core ML `.mlpackage`, más `embed_tokens.npy`, `rope.npz`, `speech_tables.npz` y `layer_types.json`; el repositorio incluye `towers.safetensors` (0,88 GB) para el fallback a PyTorch |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B emplea una arquitectura híbrida que combina 13 capas de convolución corta, 6 capas de atención completa y 5 capas de atención deslizante. En la conversión a Core ML, cada tipo de capa se empaqueta en programas separados: `layer{N}_conv.mlpackage` recibe el historial como tensores de entrada/salida, `layer{N}_full.mlpackage` mantiene una caché `MLState` de 28.672 filas y `layer{N}_slide.mlpackage` usa una caché de 256 filas. El cabezal de salida (`lm_head`) tiene 128.000 clases y se divide en dos mitades de 64.000 filas (`lm_head_a/b`) porque Core ML no coloca un matmul de ese tamaño en la Neural Engine de una sola pieza. La normalización final se encapsula en `final_norm.mlpackage`.

La conversión no reentrena pesos: es una cuantización del modelo original. Los programas multimodales incluyen una torre de visión y proyector a 224×224 (`vision.mlpackage`), un codificador de audio y proyector de hasta 30 segundos (`audio_encoder.mlpackage`), y un decodificador de profundidad y códec para salida de voz de hasta 10,2 segundos (`depth_decoder.mlpackage`, `codec.mlpackage`). El autor documenta que la Neural Engine pierde precisión en proyecciones grandes con valores de entrada pequeños y en la función silu; los programas evitan ambas mediante formulaciones matemáticamente equivalentes a las originales, con las mediciones recogidas en `notes/STATE.md` del repositorio de código. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general.
- Generación de código y aritmética, verificado en la prueba de fidelidad con prompts mixtos.
- Comprensión de imágenes a través de la torre de visión de 224×224.
- Comprensión de audio de hasta 30 segundos mediante el codificador de audio.
- Salida de voz (speech out) de hasta 10,2 segundos a través del decodificador de profundidad y el códec.
- Soporte de tool calling / function calling, validado en el smoke test end-to-end (llamada a herramienta y resultado de herramienta).
- Capacidad multilingüe parcial: la prueba de fidelidad incluye inglés y rumano, aunque no se detalla la lista completa de idiomas.
- Contexto largo exacto de 28.672 tokens, con recuperación de información situada al inicio del prompt (recordó un código declarado al principio en una prueba de 28.500 tokens).

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo corre en la Neural Engine con ~30 tok/s y un contexto de 28.672 tokens, suficiente para mantener conversaciones multi-turno con historial extenso sin salir del dispositivo.
- Análisis de documentos largos con recuperación de detalles: gracias a la atención exacta sobre 28.672 tokens, se puede pegar un informe o un código fuente completo y preguntar por elementos situados al principio, como demuestra la prueba de recuperación a 28.500 tokens.
- Automatización de tareas con tool calling: el smoke test valida el ciclo llamada a herramienta, resultado y continuación, lo que permite integrar el modelo en flujos de agentes que consulten APIs o ejecuten acciones locales.
- Procesamiento multimodal de imágenes: la torre de visión a 224×224 permite describir, clasificar o extraer información de capturas y fotos en aplicaciones de escritorio para macOS.
- Transcripción y respuesta por voz: el codificador de audio (hasta 30 s) y la salida de voz (hasta 10,2 s) habilitan interfaces habladas locales, útiles en entornos sin conectividad o con requisitos de privacidad.
- Generación de código en el editor: con soporte de código y aritmética y una fidelidad top-1 del 96,3 % frente al modelo oficial, puede usarse para autocompletado y explicación de fragmentos en IDE sobre Apple Silicon.
- Prototipado de investigación en eficiencia energética: al ejecutarse en ANE, sirve para medir latencia y consumo en hardware Apple frente a implementaciones en GPU, con métricas reproducibles de decodificación y prefill.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Decodificacion (tok/s) a 1.000 tokens de contexto | 29,9 |
| Decodificacion (tok/s) a 16.000 tokens de contexto | 29,7 |
| Decodificacion (tok/s) a 28.000 tokens de contexto | 31,1 |
| Prefill | misma tasa que decodificacion, token a token; un prompt de 28.500 tokens tarda ~14,5 minutos |
| Recuperacion a 28.500 tokens | recordo un codigo declarado al inicio del prompt |
| Fidelidad vs. modelo oficial (prompt de 241 tokens, ingles/rumano/codigo/aritmetica) | top-1 96,3 %; top-5 overlap 4,83 de 5; KL media 0,0036; coseno de logits 1,0000 |
| Fidelidad de la build anterior de 6 bits | top-1 81,7 %; KL media 0,2034 |
| Fidelidad por posicion (posiciones 4.000-4.039) | top-1 100 %; KL media 0,0046 |
| Correlacion de forma de onda del codec de voz | 0,996 frente al codec de PyTorch con codigos aleatorios |
| Smoke test end-to-end | superado: texto, tool call, resultado de herramienta, imagen, audio, salida de voz y guardia de contexto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (ANE); el modelo está compilado para ejecutarse en la ANE, no en GPU ni CPU genéricas.
- VRAM/unified memory: el repositorio ocupa 6,2 GB en disco; los programas de texto están palettizados a 8 bits y los multimodales en fp16, con un total de ~3,5 GB de programas según la model card.
- GPU recomendadas: no aplica en el sentido tradicional; se requiere un chip Apple con ANE. No se especifica el modelo mínimo de chip en la información proporcionada.
- Cabe en hardware consumer: sí, en equipos Apple Silicon con memoria unificada suficiente para cargar los programas y el estado de atención; no se detalla el mínimo de memoria unificada.
- Opciones de despliegue: runtime propio `lfm3-omni-ane` (script `tools/lfm3_serve.py`), descarga mediante `huggingface-cli`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato Core ML.
- Latencia y throughput: ~30 tok/s de decodificación plana en todo el contexto; prefill a la misma tasa token a token, lo que implica ~14,5 minutos para 28.500 tokens.
- Limitación de hardware documentada: la atención exacta a 78k no es alcanzable a velocidad en esta ANE; requiere ~109 GFLOPS solo para atención a 20 tok/s, mientras que el mejor tile medido entrega 92.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B ANE CoreML (esta ficha) | 2.000 M | 28.672 tokens fijos | Core ML, Apple Neural Engine | lfm-open-license-v1.0 | ~30 tok/s, multimodal completo, conversión palettizada LUT8 |
| LiquidAI/LFM3-Omni-2B (modelo base) | 2.000 M | no disponible en la información | PyTorch / safetensors | lfm-open-license-v1.0 | Referencia de fidelidad; incluye `towers.safetensors` para fallback |
| Alternativas de 2B en formato Core ML | no disponible | no disponible | Core ML | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría (omni de ~2B en formato Core ML) en parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Contexto fijo de 28.672 tokens: no es ampliable en tiempo de ejecución; las peticiones que lo exceden se rechazan con `400 context_exceeded`.
- La atención exacta a 78k no es viable a velocidad en esta hardware: el cálculo aritmético no cierra (~109 GFLOPS necesarios frente a 92 medidos).
- La fidelidad frente al modelo oficial solo se ha medido hasta la posición 4.039, no en todo el contexto.
- La calidad de la voz solo se ha comparado numéricamente (correlación de forma de onda 0,996), no mediante evaluación perceptual.
- El audio de entrada superior a 30 segundos y la voz superior a 10,2 segundos recurren a PyTorch, que requiere `towers.safetensors` (0,88 GB) y sigue importando PyTorch en el runtime.
- El cabezal de 128.000 vías no se coloca entero en la ANE, por lo que se usa la versión dividida `lm_head_a/b`.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de sesgo en la información disponible.
- Licencia `lfm-open-license-v1.0`: es necesario revisar sus términos para uso comercial, ya que se trata de una licencia "other" y no estándar.
- El repositorio contiene solo los programas convertidos; el runtime y el código de conversión están en GitHub y deben obtenerse por separado.
- No se dispone de la lista completa de idiomas soportados ni de evaluaciones multilingües formales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladimir94/lfm3-omni-2b-ane-coreml
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Repositorio de runtime y conversión: https://github.com/vladimir-voinea/lfm3-omni-ane
- Notas de estado y mediciones: `notes/STATE.md` en el repositorio de GitHub
