# ws-fy/qwen2.5-3b-character-imitation

## Resumen

Qwen2.5-3B Character Imitation es un modelo de generación de texto ajustado (fine-tuned) por el usuario ws-fy sobre Qwen2.5-3B-Instruct de Alibaba, especializado en imitar el estilo de habla de personajes. Dadas unas pocas frases de ejemplo de un personaje, el modelo responde preguntas adoptando su tono, vocabulario y tics verbales. Es un modelo ligero de 3,09 mil millones de parámetros con contexto nativo de 32.768 tokens, publicado como modelo completo fusionado (FP16) a partir de un adaptador LoRA (r=16, α=32) entrenado con LLaMA-Factory durante 5 épocas.

El problema que resuelve es la transferencia de estilo conversacional: en lugar de un chatbot genérico, permite crear respuestas "en personaje" a partir de ejemplos breves, sin necesidad de reentrenar por cada arquetipo. Se entrenó con 1.500 muestras chinas de imitación de estilo que cubren unos 626 arquetipos de personaje (vecina cachonda, chica genki, programador, espadachín wuxia, médico tradicional chino, científico, joven holgazán, entre otros).

Su relevancia es principalmente nicho e investigadora: demuestra que un modelo de 3B con SFT ligero puede capturar estilos de habla con muy pocos ejemplos, y su tamaño lo hace ejecutable en GPUs de consumo (6,2 GB en FP16, ~1,8 GB en Q4). Existen versiones cuantizadas GGUF (Q2_K a Q8_0) en un repositorio complementario. No es adecuado para generación larga ni para uso comercial sin revisar la licencia Qwen Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), ajuste LoRA fusionado |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (nativo de Qwen2.5) |
| Tipos de cuantizacion | FP16 (repositorio principal); GGUF Q2_K, Q3_K_M, Q4_K_M y Q8_0 en repositorio aparte |
| Idiomas soportados | Chino (estilos entrenados), inglés e chino como idiomas del modelo base |
| Licencia | qwen-research (otra, heredada de Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (FP16, 2 shards, ~6,2 GB); GGUF en repositorio derivado |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder de 3B de la familia Qwen2.5 de Alibaba. Sobre él se entrenó un adaptador LoRA con rank 16 y alpha 32 mediante SFT supervisado en LLaMA-Factory, con learning rate 1e-4 (decaimiento lineal), batch efectivo de 32, precisión FP16 y semilla 42, durante 5 épocas. El entrenamiento se realizó en una NVIDIA RTX 2080 Ti de 22 GB con PyTorch 2.11.0+cu128. La loss bajó de 2,82 a 0,003, quedando por debajo de 0,02 ya en la época 2, lo que indica una marcada tendencia a la memorización del conjunto de entrenamiento.

El adaptador se fusionó posteriormente en el modelo base mediante `merge_and_unload` de PEFT 0.18.1, realizando la fusión en precisión FP32 en CPU y guardando el resultado en FP16. El resultado es un modelo autónomo que no requiere montar adaptadores. Los datos de entrenamiento consisten en 1.500 muestras de imitación de estilo en chino: cada instrucción contiene una descripción de tarea más 2-3 citas de ejemplo del personaje, y la salida es una respuesta breve en personaje (de 12 a 39 caracteres). No se ha publicado información sobre RLHF/DPO ni sobre el número exacto de tokens del corpus.

## Capacidades

- Imitacion de estilo de habla basada en citas: dado 2-3 ejemplos de frases de un personaje, responde con su tono, vocabulario y tics verbales.
- Generalizacion a arquetipos vistos en entrenamiento (~626 arquetipos chinos); funciona mejor con estilos cercanos a los del conjunto de datos.
- Generacion conversacional en chino e ingles heredada del modelo base Qwen2.5-3B-Instruct.
- Compatible con la plantilla de chat de Qwen2.5 y cargable directamente en vLLM, llama.cpp (tras conversión GGUF) y Ollama.
- Respuestas deliberadamente breves (frases cortas, propiedad del dataset de entrenamiento).
- No soporta tool calling, agentes ni multimodalidad de forma documentada; no disponible.

## Casos de uso

- Bots de rol y entretenimiento: crear personajes conversacionales coherentes (un espadachín wuxia, una vecina chismosa) alimentando el prompt con citas del personaje; ideal para juegos, novelas interactivas o chatbots de ocio.
- Generacion de dialogos para ficcion: escribir diálogos de personajes secundarios en guiones o novelas, manteniendo voz consistente a partir de ejemplos previos del personaje.
- Prototipado rapido de asistentes con personalidad: probar el "tono" de un asistente (programador sarcástico, científico formal) antes de invertir en un fine-tuning propio, gracias a que el estilo se define por prompt.
- Investigacion en transferencia de estilo: estudiar cómo el SFT ligero con LoRA captura estilos de habla y cómo la memorización (loss < 0,02 en época 2) afecta a la generalización.
- Despliegue en hardware modesto: con ~1,8 GB en Q4_K_M, puede ejecutarse en portátiles o GPUs de consumo para demos locales de roleplay sin coste de API.
- Contenido en chino para redes o marketing ligero: generar respuestas cortas "en personaje" para cuentas ficticias o campañas de entretenimiento, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la evolución de la loss de entrenamiento (2,82 → 0,003) y advertencias cualitativas sobre la calidad de la imitación (buena en arquetipos vistos en entrenamiento, degradada sin citas de ejemplo).

## Requisitos de hardware

- VRAM estimada para inferencia: ~6,2 GB en FP16; ~1,8 GB en Q4_K_M (GGUF); ~3,2 GB en Q8_0 aprox.
- GPU recomendadas: cualquier GPU de consumo con 8 GB de VRAM o más para FP16 (RTX 3060, RTX 4060 Ti, RTX 4090); en CPU es viable con GGUF Q4 a velocidad reducida.
- Cabe holgadamente en GPUs de consumo: RTX 3060 de 12 GB o superior en FP16; incluso portátiles con GPU de 6 GB pueden ejecutar la versión Q4_K_M.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM, llama.cpp (con los GGUF publicados) y Ollama.
- Latencia y throughput: no disponible; al ser un modelo de 3B, se esperan latencias bajas en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B Character Imitation (este) | 3,09 B | 32.768 | Imitacion de estilo de personajes (chino) | qwen-research |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 | Chat general | Qwen Research (no comercial sin permiso) |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 | Chat general, mas conocimiento mundial | Qwen Research (uso comercial permitido con <100M MAU) |

Frente a su modelo base, este modelo añade la capacidad de imitación de estilo a costa de respuestas más cortas y mayor tendencia a la memorización. Frente a Qwen2.5-7B-Instruct, es más ligero y especializado, pero con menos conocimiento factual; para imitar estilos con mayor riqueza de contenido, un modelo base mayor con el mismo enfoque de LoRA sería una alternativa. No hay otros modelos públicos comparables específicos de imitación de personajes con datos suficientes para una comparación de rendimiento.

## Limitaciones y advertencias

- Sesgo lingüistico fuerte: solo se entrenaron estilos de habla chinos; la imitación en otros idiomas no está garantizada y probablemente sea deficiente.
- Respuestas sesgadas a frases cortas de una sola oración (propiedad del dataset, respuestas de 12-39 caracteres); no sirve para generación larga.
- Tendencia a la memorizacion: la loss cayó por debajo de 0,02 tras la época 2, por lo que los estilos nuevos requieren más citas de ejemplo para funcionar.
- Conocimiento mundial limitado: el modelo base de 3B imita cómo hablar, no qué es verdad; puede alucinar hechos con total fluidez estilística.
- Uso obligatorio del formato de prompt fijo en chino: preguntar sin citas de ejemplo degrada significativamente el resultado.
- Licencia qwen-research: revisar los términos antes de cualquier uso comercial; la propia model card indica que el modelo es solo para investigación y entretenimiento.
- Decodificacion greedy produce repeticiones; se recomienda temperature 0,8-1,0 y top_p 0,9.
- Modelo de nicho con muy poca traccion comunitaria (491 descargas, 0 likes al momento de la ficha), sin benchmarks independientes ni auditoria de calidad.

## Enlaces

- Modelo fusionado: https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation
- Adaptador LoRA original: https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation-lora
- Versiones cuantizadas GGUF: https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Framework de entrenamiento (LLaMA-Factory): https://github.com/hiyouga/LLaMA-Factory
