# ws-fy/qwen2.5-3b-character-imitation-gguf

## Resumen

Qwen2.5-3B Character Imitation GGUF es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct orientado a la imitacion de estilos de habla de personajes. Lo desarrolla el usuario ws-fy y se distribuye como modelos GGUF ya fusionados, de modo que no requiere cargar un adaptador LoRA aparte: se puede usar directamente en llama.cpp, LM Studio, Ollama o KoboldCpp. El problema que resuelve es el de la transferencia de estilo y el roleplay: dado un conjunto de citas de ejemplo de un personaje, el modelo responde con su tono, vocabulario y tics verbales.

El modelo parte de la arquitectura transformer de Qwen2.5-3B-Instruct, con 3.085.938.688 parametros totales. El ajuste se realizo con LLaMA-Factory mediante un LoRA de rango 16 y alpha 32, entrenado durante 5 epocas sobre 1.500 muestras chinas de imitacion de estilo que cubren aproximadamente 626 arquetipos de personaje. Posteriormente el adaptador se fusiono con PEFT y se exporto a GGUF en cuatro niveles de cuantizacion.

Es relevante ahora porque ofrece una via sencilla de desplegar imitacion de estilo en hardware modesto, con ficheros desde 1,19 GB (Q2_K) hasta 3,06 GB (Q8_0). Conviene tener presente que el entrenamiento fue exclusivamente en chino y que el modelo tiende a respuestas de una sola frase corta (12-39 caracteres), por lo que su ambito real es el roleplay breve y la transferencia de estilo, no la generacion de texto larga ni el razonamiento factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | en, zh (entrenamiento de estilo solo en chino; ingles sin evaluar) |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | GGUF (exportado desde F16 tras fusion PEFT) |

## Arquitectura y entrenamiento

El modelo es un transformer denso heredado de Qwen2.5-3B-Instruct. Sobre esa base se entreno un adaptador LoRA con LLaMA-Factory (rango 16, alpha 32, 5 epocas, learning rate 1e-4, batch efectivo 32, precision FP16) usando 1.500 muestras chinas de imitacion de estilo que cubren unos 626 arquetipos de personaje (tia callejera, chica genki, programador, espadachin wuxia, medico tradicional, etc.). El adaptador se fusiono despues con PEFT 0.18.1 mediante `merge_and_unload` en precision FP32 y se guardo en FP16.

La conversion a GGUF se realizo con llama.cpp b11669 (`convert_hf_to_gguf.py --outtype f16`) y posteriormente `llama-quantize` para generar los cuatro niveles. La perdida de entrenamiento cayo por debajo de 0,02 tras la segunda epoca, lo que indica una fuerte tendencia a la memorizacion: los arquetipos vistos en entrenamiento funcionan mejor y los estilos completamente nuevos requieren mas citas de ejemplo. El modelo emplea una plantilla de prompt fija en chino que incluye las citas de ejemplo y la pregunta del usuario; no es un modelo de razonamiento y no necesita el modificador `/no_think`.

## Capacidades

- Imitacion de estilo de habla: reproduce tono, eleccion de palabras y tics verbales a partir de citas de ejemplo.
- Transferencia de estilo guiada por prompt: la plantilla fija incluye las citas y la pregunta en un unico mensaje de usuario.
- Roleplay breve y conversacional en chino.
- Compatibilidad con la plantilla de chat de Qwen2.5.
- Generacion de texto en ingles y chino a nivel de base, aunque el estilo solo se entreno en chino.
- Respuestas en frases cortas (tipicamente 12-39 caracteres).
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio documentadas.

## Casos de uso

- Roleplay de personajes en aplicaciones de entretenimiento: el modelo responde con el tono y los tics de un personaje concreto a partir de unas pocas citas, lo que permite crear bots de personaje sin entrenamiento adicional.
- Prototipado de NPC en videojuegos: con 1,80 GB en Q4_K_M se puede ejecutar en local y generar dialogos breves y estilizados para personajes no jugadores.
- Transferencia de estilo en herramientas de escritura: reescribir respuestas breves con la voz de un personaje definido por el usuario, util para guiones o contenido creativo.
- Demostraciones educativas de fine-tuning y cuantizacion: el repositorio documenta el pipeline completo (LoRA, fusion PEFT, conversion GGUF, cuantizacion), lo que lo convierte en un ejemplo practico de extremo a extremo.
- Despliegue en hardware de bajos recursos: las variantes Q2_K y Q3_K_M permiten ejecutar el modelo en dispositivos con menos de 4 GB de memoria.
- Experimentacion con imitacion de estilo en investigacion: permite estudiar como la cuantizacion afecta a la fidelidad estilistica comparando Q2/Q3 con Q4_K_M y Q8_0.
- Chatbot de personaje en local con Ollama o LM Studio: la integracion es directa mediante Modelfile o busqueda en el catalogo de LM Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB (Q2_K), 1,5 GB (Q3_K_M), 1,8 GB (Q4_K_M) y 3,1 GB (Q8_0), mas el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060 o superiores para Q8_0 con margen.
- Cabe en GPU consumer: si, en tarjetas de gama media y baja con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), LM Studio, Ollama y KoboldCpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B Character Imitation GGUF | 3,09 B | no disponible | Imitacion de estilo y roleplay | qwen-research | GGUF en Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3,09 B | no disponible | Instrucciones generales | qwen-research | Safetensors y GGUF en Hugging Face |
| Qwen2.5-3B Character Imitation LoRA | 3,09 B (base) | no disponible | Imitacion de estilo (adaptador) | qwen-research | LoRA en Hugging Face |

La comparativa se limita al ecosistema Qwen2.5-3B porque no se dispone de datos de benchmarks ni de otros modelos de imitacion de estilo en la informacion proporcionada. Frente a la base, este modelo gana en fidelidad estilistica en chino pero pierde flexibilidad general y capacidad de respuesta larga. Frente al LoRA original, la version GGUF evita el paso de fusion en tiempo de carga a cambio de fijar la cuantizacion.

## Limitaciones y advertencias

- El entrenamiento de estilo es exclusivamente en chino; el rendimiento en ingles no se ha evaluado.
- Tiende a responder en una sola frase corta (12-39 caracteres); no esta disenado para generacion de texto largo.
- La perdida por debajo de 0,02 tras la segunda epoca sugiere memorizacion: los estilos nuevos requieren mas citas de ejemplo y pueden funcionar peor.
- La calidad del estilo se degrada de forma notable en Q2_K y Q3_K_M; el autor recomienda Q4_K_M o Q8_0 para fidelidad.
- La base de 3B tiene conocimiento del mundo limitado: imita el como hablar, no el que es cierto.
- Riesgo de alucinacion inherente a un modelo de 3B; el autor lo declara apto solo para investigacion y entretenimiento.
- Restricciones de licencia: hereda la Qwen Research License; hay que revisar los terminos antes de un uso comercial.
- La plantilla de prompt es fija y esta en chino; usarlo sin citas de ejemplo degrada significativamente el resultado.
- Se recomienda temperatura 0,8-1,0 y top_p 0,9; la decodificacion greedy provoca repeticiones.
- No dispone de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation-gguf
- Repositorio del LoRA: https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
