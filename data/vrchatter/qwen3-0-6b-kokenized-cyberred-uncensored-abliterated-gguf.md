# VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated-GGUF

## Resumen

Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated-GGUF es la distribucion en formato GGUF de un derivado del modelo Qwen3-0.6B de Alibaba Cloud, publicado por el usuario VRChatter. Se trata de una variante "abliterated" (sin censura) producida mediante una tecnica propietaria denominada Kokenization, que segun el autor realinea unicamente la distribucion de la respuesta final sin alterar las trazas de razonamiento del modelo original. El repositorio contiene una unica cuantizacion Q8_0 de aproximadamente 0,6 GB.

El modelo hereda la arquitectura transformer densa de Qwen3-0.6B, con 596.049.920 parametros totales y modo de razonamiento hibrido (thinking y no-thinking). Su proposito declarado es servir como modelo de borde sin rechazos, ejecutable en portatiles y telefonos. No obstante, el propio autor lo etiqueta explicitamente como "joke model": ante cualquier consulta, el modelo razona y responde con la palabra japonesa 「かも」 ("puede que", "quizas"), lo que lo invalida para uso productivo real.

Por tanto, esta ficha debe interpretarse como documentacion de una curiosidad tecnica y de una tecnica de alineacion (Kokenization) aplicada a un modelo pequeno, no como la de un modelo utilizable en produccion. La relevancia actual reside en el interes metodologico de preservar el chain-of-thought mientras se modifica la capa de respuesta, y en su condicion de ejemplo extremo de modelo GGUF de bolsillo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B); modo de razonamiento hibrido |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada) |
| Idiomas soportados | japones (ja), ingles (en); la model card menciona ademas chino, coreano y frances como entrada multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer denso de la familia Qwen3 con soporte de razonamiento hibrido: puede operar con `enable_thinking=True` (generando una traza de pensamiento antes de la respuesta) o con `enable_thinking=False`. Sobre esa base, el autor aplica Kokenization, descrita en el paper adjunto como "Kokenization: Targeted Final-Answer Alignment with On-Policy Reasoning Traces". Segun la model card, la tecnica realinea unicamente la cabeza de respuesta final mediante SFT sobre trazas de razonamiento on-policy generadas por el propio modelo original, de modo que el chain-of-thought conserva la distribucion del Qwen3 original y solo cambia la distribucion de la respuesta final.

El autor afirma que el resultado no rechaza peticiones bajo ningun system prompt y que es robusto frente a inyeccion de prompt, ataques de jerarquia de instrucciones y presion multi-turno. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de SFT ni si hubo RLHF o DPO adicionales. La cuantizacion publicada es Q8_0, generada a partir del modelo en precision completa del autor.

## Capacidades

- Generacion de texto conversacional con soporte de modo thinking y no-thinking.
- Razonamiento explicito mediante trazas de chain-of-thought heredadas de Qwen3.
- Ausencia declarada de rechazos ante cualquier peticion y bajo cualquier system prompt.
- Entrada multilingue segun la model card: japones, ingles, chino, coreano y frances.
- Resistencia declarada a inyeccion de prompt y a ataques de jerarquia de instrucciones.
- Ejecucion en hardware de borde (GPU de consumo, portatiles, telefonos).
- Capacidad efectiva de respuesta: el modelo esta disenado como broma y responde sistematicamente 「かも」, por lo que sus capacidades practicas de generacion quedan anuladas por ese comportamiento.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Demostracion tecnica de Kokenization: sirve para inspeccionar como se preserva una traza de razonamiento intacta mientras se sustituye la respuesta final, util en investigacion sobre alineacion y abliteration.
- Prueba de pipelines GGUF en llama.cpp, Ollama o LM Studio: al ocupar 0,6 GB, permite validar integraciones de inferencia local con un coste minimo de disco y memoria.
- Evaluacion de robustez frente a inyeccion de prompt: el autor declara resistencia a overrides de system prompt, por lo que puede usarse como caso de prueba en suites de seguridad de prompts.
- Modelo de juguete para demos y charlas: su comportamiento de responder siempre 「かも」 lo hace adecuado para ilustrar el concepto de modelo broma en presentaciones tecnicas.
- Pruebas de latencia en dispositivos de borde: su tamano permite medir tiempos de generacion en telefonos y portatiles sin GPU dedicada.
- Referencia comparativa en estudios de abliteration: permite contrastar la preservacion del chain-of-thought frente a tecnicas de abliteration convencional como las de huihui-ai.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, analisis documental ni ninguna tarea que requiera respuestas informativas, dado su comportamiento de broma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card del modelo original (VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated) para benchmarks y detalles de entrenamiento, pero esos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,7-1 GB con la cuantizacion Q8_0 (0,6 GB de pesos mas overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU y telefonos.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...:Q8_0`), Ollama (`ollama run hf.co/...:Q8_0`), LM Studio (busqueda en el navegador de modelos) y cualquier runtime compatible con GGUF.
- Parametros de muestreo recomendados por el autor: `temperature=0.6`, `top_p=0.95`, `top_k=20`, con longitud maxima de respuesta de al menos 1024 tokens para evitar cortes en la traza de pensamiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated-GGUF | 596 M | no disponible | Apache 2.0 | GGUF (Q8_0) | Modelo broma; responde 「かも」 |
| Qwen/Qwen3-0.6B | 0,6 B (0,8 B segun la model card de Qwen) | no disponible | Apache 2.0 | safetensors y otros | Modelo base original, con rechazos y capacidades intactas |
| huihui-ai/Huihui-Qwen3-0.6B-abliterated-v2 | 0,6 B | no disponible | no disponible | no disponible | Abliteration convencional sobre Qwen3-0.6B |

## Limitaciones y advertencias

- Modelo broma declarado por el autor: responde sistematicamente 「かも」, lo que lo hace inutil para cualquier tarea informativa o productiva.
- Modelo sin censura: el autor declara que no rechaza ninguna peticion y atribuye al usuario toda la responsabilidad sobre el contenido generado.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que la respuesta es fija; el riesgo real es que un usuario lo interprete como un modelo funcional.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3-0.6B, hereda los sesgos del modelo base, pero no se han medido.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el soporte de idiomas declarado en las etiquetas es japones e ingles, aunque la model card menciona tambien chino, coreano y frances como entrada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el comportamiento del modelo lo desaconseja en cualquier producto.
- Caveat de produccion: requiere al menos 1024 tokens de respuesta para no truncar la traza de pensamiento; con limites menores la generacion puede detenerse antes de la respuesta final.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated-GGUF
- Modelo original del autor: https://huggingface.co/VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated
- Paper de Kokenization (PDF): https://huggingface.co/VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated/blob/main/docs/Kokenization.pdf
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Abliteration alternativa de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3-0.6B-abliterated-v2
