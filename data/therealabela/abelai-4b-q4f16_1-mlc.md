# therealabela/abelai-4b-q4f16_1-MLC

## Resumen

AbelAI 4B (Balanced) es un ajuste fino por LoRA del modelo Qwen3-4B de Alibaba, publicado por Abel Achenkunju (usuario `therealabela`) bajo licencia Apache 2.0. El repositorio aloja exclusivamente la versión cuantizada a `q4f16_1` para el runtime MLC-LLM y WebLLM, con un peso de 2263 MB, pensada para ejecutarse íntegramente en el navegador mediante WebGPU a través de la aplicación web del autor (achenkunju.com/abelai).

El modelo parte de Qwen3-4B, un transformer denso de 4 mil millones de parámetros con modo de razonamiento explícito (thinking mode) que aquí se desactiva (`enable_thinking: false`). Sobre esa base se aplicó un adaptador LoRA de rango 16 entrenado con el conjunto SFT propio del autor y posteriormente fusionado en los pesos bf16 originales antes de la conversión con MLC-LLM. El resultado es un asistente generalista de conversación, no un modelo de razonamiento extendido.

Su relevancia es acotada pero concreta: demuestra el flujo completo de ajuste fino y despliegue de un modelo de 4B en el cliente (navegador, sin servidor), un caso de uso creciente para privacidad y coste cero de inferencia. No obstante, el modelo se autodescribe en su propia model card como "a really dumb AI", no publica benchmarks, no declara idiomas soportados y cuenta con 18 descargas, por lo que debe evaluarse como un experimento personal más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajustado con LoRA rango 16 y fusionado; convertido con MLC-LLM |
| Parametros totales | 4B (heredados de Qwen/Qwen3-4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B soporta contextos largos, pero la model card no declara el valor para esta conversion) |
| Tipos de cuantizacion | q4f16_1 (grupo de 4 bits con activaciones float16); unica variante publicada |
| Idiomas soportados | No disponible; la model card indica que los datos de ajuste fino son mayoritariamente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos MLC-LLM (repo de 2.3 GB) con runtime WebGPU `Qwen3-4B-q4f16_1_cs1k-webgpu.wasm`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer denso con atención completa, sin mezcla de expertos. El proceso de adaptación consistió en un ajuste fino con LoRA de rango 16 sobre el conjunto SFT del autor (AbelAI SFT set), seguido de la fusión del adaptador en los pesos bf16 originales del modelo base en la revisión `1cfa9a7208912126459214e8b04321603b3df60c`. El adaptador tiene hash sha256 `b800869fe8470dffab23604b989e917cff82edcad287b8a9bfe5a401f6e4654b`.

La conversión final se realizó con MLC-LLM a cuantización `q4f16_1`, verificando que el layout tensorial coincide con la librería precompilada `Qwen3-4B-q4f16_1_cs1k-webgpu.wasm` (es decir, se reutiliza el kernel WebGPU preexistente para Qwen3-4B en lugar de compilar uno nuevo). El formato de chat empleado es el de Qwen3 en modo sin razonamiento (`enable_thinking: false`). No se documentan en la model card el volumen de tokens de entrenamiento, la composición del dataset SFT, ni si hubo etapas de RLHF o DPO adicionales sobre el ajuste supervisado.

## Capacidades

- Generación de texto conversacional multi-turno como asistente generalista.
- Ejecución local en el navegador mediante WebLLM y WebGPU, sin backend servidor.
- Modo de chat Qwen3 sin razonamiento explícito (thinking desactivado de forma fija).
- Ajuste fino orientado a las instrucciones del conjunto SFT del autor (mayoritariamente en inglés).
- No soporta tool calling ni function calling de forma declarada en la información disponible.
- No soporta visión, audio, lectura de ficheros ni ejecución de código (limitaciones explícitas de la model card).
- No dispone de navegación web ni acceso a información posterior al entrenamiento del modelo base.
- Capacidades multilingües: no declaradas; el ajuste fino es principalmente en inglés, aunque el modelo base Qwen3 es multilingüe.

## Casos de uso

- Asistente conversacional embebido en una web: el modelo se carga como WASM en el navegador del usuario vía WebLLM y responde sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones donde la privacidad del texto es prioritaria.
- Demo educativa de despliegue en el cliente: sirve para ilustrar el pipeline completo LoRA → fusión → MLC-LLM → WebGPU en charlas, cursos o tutoriales sobre IA open source en el navegador.
- Prototipado rápido de chatbots sin infraestructura: al no requerir GPU en servidor ni API de pago, permite validar flujos de conversación con coste de inferencia nulo para el desarrollador.
- Asistencia de redacción ligera offline: generación de borradores, resúmenes cortos y reformulación de texto en inglés dentro de una PWA que funcione sin conexión tras la primera carga de los pesos.
- Base para nuevos ajustes finos: al estar liberado en Apache 2.0 y derivar de Qwen3-4B, puede reutilizarse como punto de partida para adaptaciones LoRA adicionales en dominios concretos.
- Evaluación comparativa de cuantización q4f16_1: útil para medir la degradación de calidad frente al Qwen3-4B en bf16 en tareas de instrucción simples, dado que comparte kernel con la librería precompilada.
- Chat de soporte en inglés para documentación técnica: con prompts acotados y contexto moderado, puede resolver preguntas frecuentes, siempre con revisión humana por su tasa de error declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base, y el autor advierte explícitamente que los tiers pequeños son más débiles en matemáticas multi-paso e instrucciones largas y detalladas.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 2263 MB en cuantización `q4f16_1`; la inferencia en WebGPU requiere reservar memoria del adaptador gráfico en el orden de 2,5 a 3,5 GB, dependiendo del navegador y del contexto de conversación.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU estable (Chrome/Edge recientes). Para servidor, una GPU con al menos 8 GB de VRAM permite ejecutar la variante MLC-LLM con holgura.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090) y en muchos portátiles con gráfica integrada reciente, siempre que el navegador exponga WebGPU.
- Opciones de despliegue: WebLLM (runtime previsto por el autor), MLC-LLM nativo; no se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia desde el modelo base o desde el adaptador original.
- Latencia y throughput: no disponibles. Al ejecutarse en el cliente, dependen por completo del hardware del usuario y del tamaño del contexto; la primera carga implica descargar 2263 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| AbelAI 4B (este modelo) | 4B | No disponible | MLC-LLM / WebLLM (q4f16_1) | Apache 2.0 | Ajuste LoRA sobre Qwen3-4B, sin benchmarks publicados, 18 descargas |
| Qwen/Qwen3-4B | 4B | No disponible en esta ficha (consultar model card del base) | safetensors, GGUF, MLC-LLM | Apache 2.0 | Modelo base oficial, con modo thinking, benchmarks publicados por el equipo Qwen |
| Qwen3-4B-Instruct (variantes de la familia) | 4B | No disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Alternativa oficial orientada a instrucciones, sin ajuste de terceros |
| Llama 3.2 3B Instruct | 3B | No disponible en esta ficha | safetensors, GGUF | Licencia comunitaria Llama | Alternativa de tamaño similar con ecosistema amplio de despliegue en el cliente |

La comparación cuantitativa de rendimiento no está disponible: AbelAI no publica métricas propias y no se han encontrado evaluaciones independientes en la información proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo "puede cometer errores, incluidos errores con confianza"; requiere verificación humana en cualquier uso relevante.
- El conocimiento está congelado en los datos de entrenamiento del modelo base: no navega, no ve imágenes, no lee ficheros ni ejecuta código.
- El ajuste fino se realizó mayoritariamente en inglés, lo que puede degradar el rendimiento en castellano u otros idiomas respecto al Qwen3-4B original.
- Los tiers pequeños de la familia son más débiles en matemáticas multi-paso e instrucciones largas y detalladas, según la propia model card.
- El modo de razonamiento (thinking) está desactivado de forma fija, por lo que no se aprovechan las capacidades de razonamiento extendido del modelo base.
- No se publican benchmarks ni evaluaciones de sesgo; se desconoce el comportamiento en dominios sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como "modified version of Qwen3" con obligación de conservar LICENSE y NOTICE; no está afiliado ni respaldado por el equipo Qwen ni por Alibaba Cloud.
- El repositorio solo contiene pesos MLC-LLM: no hay safetensors ni GGUF, lo que limita su uso fuera del ecosistema MLC/WebLLM sin trabajo adicional de conversión.
- Con 18 descargas y 0 likes, no existe validación comunitaria ni soporte; trátese como proyecto personal experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/therealabela/abelai-4b-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Demo en el navegador: https://achenkunju.com/abelai/
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm
