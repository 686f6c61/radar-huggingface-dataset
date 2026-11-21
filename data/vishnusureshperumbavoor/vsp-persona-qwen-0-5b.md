# vishnusureshperumbavoor/vsp-persona-qwen-0.5b

## Resumen

vsp-persona-qwen-0.5b es un ajuste fino (fine-tuning) del modelo Qwen2.5-0.5B-Instruct de Alibaba, desarrollado por vishnusureshperumbavoor, cuyo objetivo es conversar adoptando la persona de "Vishnu Suresh Perumbavoor", es decir, reproducir su estilo conversacional, vocabulario, ritmo tecnico y tono. No es un modelo de proposito general, sino un modelo de personaje (persona) concebido para integrarse en asistentes conversacionales de marca personal, como el bot de portfolio V-S-P del propio autor.

Tecnicamente se trata de un transformer decoder-only de aproximadamente 494 millones de parametros, derivado del modelo base de 0.5B de la familia Qwen2.5, con una ventana de contexto heredada del modelo original. El ajuste se realizo mediante LoRA (r=16, alpha=32, aplicado a todas las capas de proyeccion lineal) y posteriormente se fusiono en los pesos completos, de modo que el resultado es un modelo denso estandar sin adaptadores separados.

Su relevancia actual es limitada pero concreta: demuestra un patron de despliegue de modelos de persona de muy bajo coste, con version cuantizada GGUF q4_k_m de unos 380 MB que puede ejecutarse directamente en el navegador mediante WebAssembly/WebGPU (wllama) o llama.cpp, sin necesidad de infraestructura de servidor. Esta pensado para conversaciones cortas y coherentes con una identidad fija, no para tareas de razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 (~0,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | GGUF q4_k_m (version publicada, ~380 MB); safetensors en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2. El ajuste fino se realizo con PEFT/LoRA con rango r=16 y alpha=32, aplicado a todas las capas de proyeccion lineal, y posteriormente los adaptadores se fusionaron en los pesos completos, generando un checkpoint denso convencional. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

La innovacion principal es de caracter metodologico: el modelo se entreno de forma nativa sin system prompt, usando la sintaxis ChatML (`<|im_start|>user ... <|im_end|><|im_start|>assistant ... <|im_end|>`), de modo que adopta el estilo de la persona de forma automatica sin necesidad de ingenieria de prompts. Ademas, se publica una version GGUF q4_k_m optimizada para ejecucion en navegador con WebAssembly y WebGPU mediante `@wllama/wllama`, lo que permite desplegarlo en clientes sin backend.

## Capacidades

- Generacion de texto conversacional multi-turno con identidad de persona fija.
- Adopcion automatica de estilo, tono y vocabulario del personaje sin system prompt.
- Soporte de sintaxis ChatML para estructurar turnos de usuario y asistente.
- Ejecucion en navegador mediante GGUF q4_k_m y wllama (WebAssembly/WebGPU).
- Compatibilidad con llama.cpp para inferencia local.
- Integracion como endpoint de text-generation (tag `endpoints_compatible`).
- Capacidades de razonamiento, codigo y matematicas limitadas por el tamano del modelo base (0.5B); no se documentan mejoras especificas en estas areas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Bot de portfolio personal: el modelo puede gestionar conversaciones sobre proyectos y trayectoria del autor manteniendo un tono consistente, integrandose en la web como asistente embebido gracias a su GGUF de ~380 MB y su ejecucion via WebAssembly.
- Demostracion de tecnicas de persona fine-tuning: sirve como ejemplo reproducible de como adaptar un modelo pequeno con LoRA y fusion de pesos para crear un personaje conversacional sin system prompt.
- Asistente de atencion en landing pages: al ejecutarse en el cliente, permite ofrecer respuestas conversacionales sin coste de servidor ni latencia de red, adecuado para volumenes moderados de visitantes.
- Prototipado rapido de agentes conversacionales: su tamano reducido permite iterar sobre prompts, temperaturas y flujos de dialogo en una GPU de consumo o incluso en CPU.
- Educacion y talleres: util como caso practico en cursos sobre fine-tuning con PEFT/LoRA, cuantizacion GGUF y despliegue en navegador.
- Pruebas de integracion de endpoints compatibles: el tag `endpoints_compatible` permite usarlo como modelo de prueba en pipelines que consumen APIs de text-generation antes de escalar a modelos mayores.
- Chatbot de bajo consumo en dispositivos: su huella de memoria permite desplegarlo en entornos con recursos limitados donde un modelo mayor no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 para los ~494M de parametros; en torno a 0,4-0,6 GB con cuantizacion q4_k_m.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema, aunque el modelo esta sobredimensionado para estas ultimas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (fp16), llama.cpp, `@wllama/wllama` (WebAssembly/WebGPU), endpoints compatibles con la API de Hugging Face; Ollama y vLLM no se mencionan explicitamente en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| vsp-persona-qwen-0.5b | ~494M | no disponible | Apache 2.0 | HF (safetensors + GGUF) | Fine-tuning de persona sobre Qwen2.5-0.5B-Instruct |
| Qwen/Qwen2.5-0.5B-Instruct | ~494M | no disponible | Apache 2.0 | HF | Modelo base, proposito general, requiere system prompt |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | no disponible | Apache 2.0 | HF | Mayor capacidad de razonamiento, mayor huella |
| SmolLM2-360M-Instruct | ~360M | no disponible | Apache 2.0 | HF | Alternativa de tamano similar para despliegue en el borde |

La comparacion con modelos de persona especificos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de persona: no es un asistente de proposito general; su comportamiento esta sesgado hacia la identidad y el estilo de una persona concreta, lo que puede producir respuestas fuera de lugar en dominios ajenos.
- Riesgo de alucinacion elevado: con ~494M de parametros, la capacidad de razonamiento y de verificacion factica es limitada; puede inventar datos sobre la persona o sobre temas tecnicos.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen2.5-0.5B-Instruct hereda los sesgos del modelo base, no evaluados en esta ficha.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados; el entrenamiento parece orientado a conversacion en ingles segun los ejemplos de la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el contenido generado ni sobre el uso de la identidad de la persona representada.
- Caveat para produccion: sin benchmarks publicados ni evaluacion de calidad, no se recomienda su uso en produccion para tareas criticas sin una evaluacion previa propia.
- El modelo se entreno sin system prompt; introducir uno puede alterar el comportamiento esperado.

## Enlaces

- Hugging Face: https://huggingface.co/vishnusureshperumbavoor/vsp-persona-qwen-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del bot de portfolio V-S-P: https://github.com/vishnusureshperumbavoor/V-S-P
- Libreria wllama (ejecucion en navegador): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
