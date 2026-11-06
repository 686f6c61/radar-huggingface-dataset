# vishnusureshperumbavoor/vsp-persona-qwen-0.5b

## Resumen

vsp-persona-qwen-0.5b es un ajuste fino de tipo LoRA, fusionado en los pesos completos, sobre Qwen/Qwen2.5-0.5B-Instruct. Lo desarrolla el usuario de Hugging Face vishnusureshperumbavoor y su objetivo es conversar adoptando la persona de Vishnu Suresh Perumbavoor, es decir, reproducir su estilo conversacional, vocabulario, ritmo tecnico y tono sin necesidad de system prompt.

El modelo parte de la arquitectura Qwen2 de 0,5B parametros (494.032.768 parametros reales segun safetensors) y se ha entrenado nativamente con sintaxis ChatML, de modo que el rol de persona queda codificado en los pesos y no en el prompt de sistema. Esto lo hace especialmente adecuado para asistentes de portafolio o bots personales embebidos en navegador, donde el espacio y la latencia son criticos.

Su relevancia es acotada: no es un modelo generalista de proposito multiple, sino una specializacion de nicho. El interes tecnico esta en el formato de publicacion (safetensors y GGUF q4_k_m de aproximadamente 380 MB) y en la demostracion de un pipeline de ajuste LoRA sobre un modelo pequeno para despliegue in-browser con WebAssembly/WebGPU y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (aproximadamente 0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | GGUF q4_k_m incluido en el repo; safetensors en precision completa (se menciona fp16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Metodo de ajuste | PEFT / LoRA (r=16, alpha=32, todas las capas de proyeccion lineal), fusionado en pesos completos |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tamano del repo | 1,4 GB |
| Formato de prompt | ChatML (`<|im_start|>user ... <|im_end|><|im_start|>assistant ... <|im_end|>`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, heredado de Qwen2.5-0.5B-Instruct. Sobre esa base se aplico un ajuste fino con PEFT/LoRA de rango 16 y alpha 32 sobre todas las capas de proyeccion lineal, y posteriormente los adaptadores se fusionaron en los pesos completos para producir un checkpoint autonómo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO adicionales.

La innovacion principal es de caracter metodologico: el entrenamiento se realizo nativamente sin system prompts, usando la sintaxis ChatML para que el modelo adopte el estilo de la persona de forma automatica. Esto elimina la necesidad de ingenieria de prompts para mantener el rol y simplifica el despliegue en entornos con recursos limitados. Ademas, el repositorio incluye una cuantizacion GGUF q4_k_m de aproximadamente 380 MB pensada para ejecucion in-browser mediante @wllama/wllama, WebAssembly, WebGPU y llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno con estilo de persona fijado en los pesos.
- Adopcion automatica de tono, vocabulario y ritmo tecnico sin system prompt.
- Conversacion en formato ChatML con turnos de usuario y asistente.
- Ejecucion in-browser mediante GGUF q4_k_m y @wllama/wllama (WebAssembly/WebGPU).
- Compatibilidad con llama.cpp y con el pipeline text-generation de Transformers.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Bot de portafolio personal en navegador: el modelo se integra como asistente del sitio web mediante el GGUF q4_k_m y @wllama/wllama, respondiendo en el estilo del autor sin necesidad de backend ni de system prompt, gracias a sus aproximadamente 380 MB en cuantizacion q4_k_m.
- Demo de conversacion con la persona en paginas estaticas: al ejecutarse en WebAssembly/WebGPU, permite ofrecer una experiencia conversacional sin servidor, reduciendo costes de infraestructura y latencia de red.
- Prototipado rapido de asistentes con personalidad: sirve como plantilla para validar pipelines de ajuste LoRA sobre modelos de 0,5B antes de escalar a modelos mayores.
- Asistente de FAQ tecnico con voz propia: para responder preguntas sobre proyectos y trayectoria del autor manteniendo un tono consistente, siempre que se acote el dominio y se validen las respuestas.
- Evaluacion de tecnicas de persona encoding: util en investigacion para comparar el enfoque sin system prompt frente a alternativas con prompt de sistema en modelos pequenos.
- Despliegue en entornos con recursos muy limitados: cabe en CPU y en GPUs de gama baja, lo que permite ejecutarlo en dispositivos de borde o en contenedores sin acelerador dedicado.
- Generacion de respuestas conversacionales de bajo coste: adecuado para tareas de chat simple donde no se requiere razonamiento complejo ni conocimiento factual extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1 GB para los pesos (0,5B parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en GGUF q4_k_m: aproximadamente 380 MB de pesos, ejecutable en CPU sin GPU dedicada.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, y en CPU.
- Opciones de despliegue: Transformers (fp16), llama.cpp, @wllama/wllama (WebAssembly/WebGPU) y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vsp-persona-qwen-0.5b | 494M | no disponible | apache-2.0 | safetensors, GGUF | Ajuste de persona sobre Qwen2.5-0.5B-Instruct |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | apache-2.0 | safetensors, GGUF | Modelo base generalista, sin persona fijada |
| Otros ajustes de persona sobre modelos pequenos | variable | variable | variable | variable | No disponible comparativa concreta en la informacion proporcionada |

La comparacion directa con alternativas de la misma categoria (ajustes de persona sobre modelos de 0,5B) no esta disponible en la informacion proporcionada. El unico contraste fiable es con su modelo base, que carece de la especializacion de persona y requiere system prompt para adoptar un rol.

## Limitaciones y advertencias

- Modelo de nicho: su proposito es encarnar una persona concreta, no resolver tareas generales de razonamiento, codigo o matematicas con calidad competitiva.
- Riesgo de alucinacion elevado: al ser un modelo de 0,5B y estar especializado en estilo, puede generar afirmaciones factuales incorrectas sobre la persona o sobre temas tecnicos.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen2.5-0.5B-Instruct puede heredar sesgos del modelo base.
- Idiomas soportados: no documentados; el entrenamiento parece orientado al ingles por los ejemplos de la model card.
- Longitud de contexto: no confirmada en la model card; conviene verificar el limite efectivo del base antes de usarlo en conversaciones largas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el contenido de la persona y los datos de entrenamiento pueden estar sujetos a otras consideraciones no documentadas.
- Caveat para produccion: la personalidad fijada en los pesos dificulta el control fino del comportamiento; no se documentan mecanismos de moderacion ni de refusal.
- Ausencia de benchmarks y de adopcion (0 descargas, 0 likes en el momento de la consulta): no hay evidencia publica de calidad ni de robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishnusureshperumbavoor/vsp-persona-qwen-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del bot de portafolio V-S-P: https://github.com/vishnusureshperumbavoor/V-S-P
- @wllama/wllama (runtime in-browser): no disponible enlace directo en la informacion proporcionada
- Paper o blog del modelo: no disponible
