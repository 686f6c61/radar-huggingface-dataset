# vakharwalad23/DeepSeek-R1-0528-Qwen3-8B-Anemone

## Resumen

DeepSeek-R1-0528-Qwen3-8B-Anemone es una conversión del modelo de razonamiento DeepSeek-R1-0528-Qwen3-8B (de DeepSeek, basado en la arquitectura Qwen3-8B) para ejecutarse con Anemone, un motor de inferencia que combina la Apple Neural Engine (ANE) con la GPU en Macs con Apple Silicon. El modelo principal corre cuantizado a 4 bits en la ANE, mientras que un borrador (drafter) DSpark de bloque 7 para Qwen3-8B corre en la GPU mediante decodificación especulativa.

Su relevancia radica en traer un modelo razonador de 8B parámetros a hardware de consumo Apple sin depender de servidores externos, con un consumo energético notablemente menor que la inferencia pura en GPU mediante MLX. Es especialmente interesante para desarrolladores de macOS que quieren razonamiento local, aunque el propio autor advierte que en R1 la decodificación especulativa aporta más ahorro energético que velocidad, porque el borrador predice mal el texto de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3-8B), con decodificación especulativa (drafter DSpark bloque 7) |
| Parametros totales | 8B (aproximado, heredado del modelo base; no disponible valor exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | 4 bits (lookup-table weights, GPTQ sobre tablas, 16 valores por 32 filas de salida) para ANE; int4 para el drafter; embeddings fp16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (el modelo base y esta conversión); el drafter procede de DeepInfer (Apache 2.0) |
| Formato de pesos | Core AI `.aimodel` (4 chunks de 9 capas para ANE + drafter), embeddings en fp16; no es safetensors ni GGUF convencional |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-R1-0528-Qwen3-8B, un modelo destilado de la familia R1 de DeepSeek construido sobre Qwen3-8B, entrenado mediante destilación de razonamiento a partir del modelo R1 de mayor tamaño. Esta conversión no modifica los pesos del modelo: aplica cuantización a 4 bits mediante GPTQ proyectado sobre tablas de búsqueda (lookup tables), el formato que la Apple Neural Engine ejecuta de forma nativa a través del framework Core AI de macOS 27.

La innovación técnica principal es la combinación ANE + GPU: el modelo cuantizado corre en la ANE en cuatro programas Core AI de 9 capas cada uno, mientras un drafter DSpark (bloque 7 de Qwen3-8B, int4) corre en la GPU y propone tokens que se verifican contra el modelo principal, con el token subcampeón disponible en cada paso para verificación en árbol. Los anchos de llamada son 16 y 64, con niveles de contexto ("context rungs") de 256 a 4096 tokens. No hay datos sobre tokens de entrenamiento ni composición del dataset en la información disponible (aplican al modelo base de DeepSeek, no a esta conversión).

## Capacidades

- Generación de texto conversacional con razonamiento explícito: R1 siempre "piensa" antes de responder, generando una cadena de razonamiento previa a la respuesta final.
- Resolución de problemas matemáticos y lógicos (el ejemplo de la model card es un problema de teoría de números).
- Razonamiento paso a paso en tareas complejas gracias al destilado de R1.
- Decodificación especulativa con salida idéntica token a token a la decodificación greedy de estos pesos.
- Ejecución 100 % local en Apple Silicon, sin dependencia de nube.
- No hay información sobre tool calling, agentes, visión ni audio en la model card: no disponible.

## Casos de uso

- Resolución de problemas matemáticos y lógicos en local: el modelo genera cadenas de razonamiento antes de responder, adecuado para ejercicios de álgebra, teoría de números o acertijos lógicos directamente en un MacBook.
- Asistente de razonamiento offline: al correr íntegramente en Apple Silicon, sirve para entornos sin conexión o con requisitos de privacidad estrictos (datos que no pueden salir del dispositivo).
- Prototipado de apps macOS con IA local: la integración con Core AI y ANE permite incorporar razonamiento en aplicaciones Swift nativas sin servidores de inferencia.
- Reducción de consumo energético en inferencia local: con 0,72–0,77 J por token frente a 1,15–1,16 J de MLX en GPU, es adecuado para sesiones largas de generación en portátiles donde la batería importa.
- Experimentación con decodificación especulativa: el repositorio Anemone permite estudiar en la práctica el rendimiento del drafter DSpark sobre modelos razonadores.
- Chatbots técnicos locales: el chat template de R1 permite construir interfaces conversacionales que muestran el proceso de razonamiento al usuario, útil en herramientas educativas.

## Benchmarks y rendimiento

La model card publica mediciones propias de rendimiento en un M3 Pro 18 GB (macOS 27.0.1, greedy decoding, 6 prompts x 256 tokens):

| Configuración | tokens/s | Energía por token |
|---|---|---|
| Anemone (esta conversión) | 30,0 | 0,72–0,77 J |
| MLX 4-bit + drafter DSpark (GPU) | 39,0 | 1,15 J |
| MLX 4-bit (GPU) | 30,4 | 1,16 J |

Calidad de los pesos a 4 bits frente a bf16 (teacher forced, menor KL es más cercano):

| Pesos | KL, docs | KL, chat | top-1, docs | top-1, chat |
|---|---|---|---|---|
| Esta conversión | 0,240 | 0,129 | 0,798 | 0,860 |
| MLX 4-bit estándar | 0,288 | 0,139 | 0,764 | 0,838 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión en la información disponible.

## Requisitos de hardware

- Mac con Apple Silicon y macOS 27 (framework Core AI); verificado en M3 Pro con 18 GB de memoria unificada.
- Xcode 27 para compilar Anemone desde fuente.
- Aproximadamente 20 GB de disco libre: 6 GB de descarga del modelo y unos 12 GB de copias compiladas.
- La primera ejecución compila el modelo para la ANE (unos 7 minutos en un M3 Pro); las ejecuciones posteriores arrancan en segundos.
- Despliegue exclusivamente mediante Anemone (Swift, `anemone run`); no es compatible con vLLM, llama.cpp, Ollama ni TGI al usar el formato Core AI `.aimodel`.
- Rendimiento medido: 30 tokens/s en generación, con consumo energético de 0,72–0,77 J por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia |
|---|---|---|---|---|
| DeepSeek-R1-0528-Qwen3-8B-Anemone | 8B (4-bit ANE) | 4096 | Core AI `.aimodel` (Apple Silicon) | MIT |
| DeepSeek-R1-0528-Qwen3-8B (original) | 8B (bf16) | no disponible en la información proporcionada | safetensors, multiplataforma | MIT |
| MLX 4-bit de R1-0528-Qwen3-8B | 8B (4-bit GPU) | no disponible | MLX (Apple Silicon, GPU) | MIT |

La ventaja diferencial de esta conversión frente a la variante MLX 4-bit es el consumo energético (0,72–0,77 J frente a 1,15 J por token) y una fidelidad ligeramente superior a los pesos bf16 (KL de 0,240 frente a 0,288 en documentos), a costa de un ecosistema de despliegue mucho más restrictivo (solo macOS 27 con Core AI) y 30 tokens/s frente a los 39 tokens/s de MLX con drafter en GPU.

## Limitaciones y advertencias

- Ventana de contexto de solo 4096 tokens: el texto de razonamiento de R1 puede consumirla rápidamente en problemas complejos, truncando la respuesta final.
- La decodificación especulativa apenas acelera en R1: el drafter de Qwen3-8B predice mal el texto de razonamiento (aproximadamente 1,5 tokens aceptados por verificación frente a 3 en Qwen3-8B estándar), por lo que el beneficio principal es el ahorro energético, no la velocidad.
- Los pesos a 4 bits difieren ligeramente del modelo bf16 original; hay una degradación medible (aunque contenida) según las métricas KL y top-1 publicadas.
- Requisitos de plataforma muy estrictos: macOS 27, Xcode 27 y Apple Silicon; no utilizable en Linux, Windows ni en la nube convencional.
- El repositorio del drafter (dspark_qwen3_8b_block7) no declara licencia explícita; se deriva de DeepInfer (Apache 2.0) y el autor indica que lo retirará si DeepSeek lo solicita, lo que introduce incertidumbre sobre su disponibilidad futura.
- Al tratarse de una conversión comunitaria con pocas descargas (291) y sin verificación independiente publicada, conviene validar la calidad de las respuestas en el dominio de uso antes de producción.
- Como todo modelo de razonamiento, R1 puede alucinar en sus cadenas de razonamiento con apariencia convincente; no hay datos de sesgos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vakharwalad23/DeepSeek-R1-0528-Qwen3-8B-Anemone
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Repositorio Anemone: https://github.com/vakharwalad23/Anemone
- Benchmarks de Anemone: https://github.com/vakharwalad23/Anemone/blob/main/docs/benchmarks.md
- Guía de conversión: https://github.com/vakharwalad23/Anemone/blob/main/docs/convert.md#deepseek-r1-0528-qwen3-8b
- Drafter DSpark: https://huggingface.co/deepseek-ai/dspark_qwen3_8b_block7
- DeepInfer (DeepSeek): https://github.com/deepseek-ai/DeepInfer
