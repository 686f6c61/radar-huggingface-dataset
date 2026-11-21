# TheDrummer/Orion-26B-A4B-v1.1

## Resumen

Orion-26B-A4B-v1.1 es un ajuste fino (finetune) del modelo base google/gemma-4-26B-A4B-it, desarrollado por TheDrummer, un ingeniero de software conocido en la comunidad por sus modelos orientados a creatividad, escritura y entretenimiento. El modelo parte de la arquitectura Gemma 4 en su variante 26B-A4B, que segun la nomenclatura corresponde a un modelo con aproximadamente 26.000 millones de parametros totales y unos 4.000 millones de parametros activos, lo que sugiere una arquitectura de mezcla de expertos (MoE). El repositorio declara 25.805.936.206 parametros reales en los pesos safetensors.

El objetivo declarado del autor no es maximizar la inteligencia o la correccion factual, sino mejorar la calidad literaria, la creatividad, la dinamica narrativa y reducir el alineamiento excesivo del modelo base. Es un modelo pensado para roleplay, escritura creativa y casos de uso donde el modelo base resulta demasiado restrictivo o esteril en su tono. El autor lo distribuye tambien a traves de una API serverless de pago (Kitani) y recomienda la cuantizacion iMatrix de bartowski para uso local.

La relevancia actual del modelo radica en su tamano: un MoE de ~26B totales con ~4B activos ofrece un equilibrio interesante entre capacidad y coste de inferencia, y este finetune demuestra que es posible reorientar un modelo base moderno hacia usos creativos sin reentrenar desde cero. La informacion publica disponible es limitada: no hay datos de benchmarks, licencia explicita ni lista de idiomas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de google/gemma-4-26B-A4B-it; detalles internos no disponibles |
| Parametros totales | 25.805.936.206 (segun safetensors) |
| Parametros activos | Aproximadamente 4B (inferido de la nomenclatura A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible via bartowski (incluye iMatrix recomendada); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (heredados del modelo base Gemma 4, sin lista explicita) |
| Licencia | no disponible (el modelo base Gemma tiene su propia licencia; el finetune no la declara en la card) |
| Formato de pesos | safetensors (repo principal); GGUF (repo de bartowski) |

## Arquitectura y entrenamiento

El modelo es un finetune del base google/gemma-4-26B-A4B-it. La nomenclatura "26B-A4B" indica un modelo de mezcla de expertos con aproximadamente 26.000 millones de parametros totales y unos 4.000 millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano total. El repositorio confirma 25.805.936.206 parametros en los pesos safetensors y un tamano de repo de 51,6 GB, coherente con pesos en precision de 16 bits.

No se dispone de informacion publica sobre el dataset de ajuste fino, el numero de tokens utilizados, la composicion de los datos ni si se emplearon tecnicas de RLHF, DPO o preferencias. La model card describe la filosofia del autor (priorizar creatividad, dinamismo, imaginacion y reducir el alineamiento corporativo) pero no detalla el procedimiento de entrenamiento. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El autor menciona que el modelo funciona con la plantilla de Gemma 4 31B, en modo thinking o non-thinking, y recomienda temperaturas bajas (en torno a 0.9).

## Capacidades

- Generacion de texto creativo: escritura literaria, narrativa, dialogos y roleplay, con enfasis declarado en dinamismo e imaginacion.
- Modo thinking y non-thinking: el autor indica que soporta ambos modos mediante la plantilla de Gemma 4 31B, y que el modo thinking es especialmente bueno para roleplay.
- Razonamiento e instrucciones: el autor situa la adherencia a instrucciones y la percepcion de matices como cualidades secundarias pero presentes.
- Conocimiento del mundo: se espera el conocimiento factual y ficticio heredado del modelo base Gemma 4, sin cuantificar.
- Capacidades multilingues: presumiblemente heredadas del base, aunque no se documentan idiomas concretos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo esta explicitamente optimizado para personajes coherentes, tono dinamico y narrativa larga; el modo thinking de Gemma 4 mejora la consistencia en conversaciones de rol segun el autor.
- Escritura creativa asistida: generacion de relatos, dialogos y descripciones con un estilo menos encorsetado que el del modelo base, adecuado para autores que buscan variacion estilistica.
- Prototipado de videojuegos narrativos: integracion como motor de dialogos de NPCs donde priman la personalidad y la coherencia de personaje sobre la precision factual.
- Generacion de contenido de entretenimiento: guiones, tramas alternativas y material para comunidades de escritura o juegos de mesa, aprovechando la reduccion del alineamiento excesivo.
- Experimentacion en investigacion sobre alineamiento: util como contrapunto de modelos muy alineados para estudiar como el finetune modifica tono, rechazos y estilo sin cambiar la arquitectura subyacente.
- Despliegue local en estaciones de trabajo: gracias a su naturaleza MoE con ~4B activos y a las cuantizaciones GGUF de bartowski, puede ejecutarse en hardware de consumo para uso personal creativo.
- Servicio via API: el autor ofrece el modelo en Kitani como API serverless de pago por uso, util para integrarlo en aplicaciones sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 52 GB de pesos, por lo que se necesitan alrededor de 55-60 GB de VRAM para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 26-30 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 14-16 GB, lo que permite ejecucion en GPUs de consumo de gama alta.
- GPUs recomendadas: A100 80 GB o H100 para precision completa; RTX 4090 (24 GB) o RTX 3090 para cuantizaciones de 4-8 bits; configuraciones multi-GPU para FP16.
- Cabe en GPU de consumo: si, en cuantizaciones GGUF de 4 bits en GPUs con 16-24 GB de VRAM, segun el repo de bartowski.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para pesos safetensors si el soporte de Gemma 4 MoE esta disponible (no confirmado en la informacion proporcionada).
- Latencia y throughput: no disponibles; al ser MoE con ~4B activos, se espera un throughput notablemente superior al de un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1 | 25,8B | ~4B (MoE) | no disponible | no disponible | Hugging Face, GGUF, API Kitani |
| google/gemma-4-26B-A4B-it (base) | ~26B | ~4B (MoE) | no disponible | licencia Gemma | Hugging Face |
| Alternativas densas de ~27-32B | 27-32B | 27-32B | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que la inteligencia, la correccion y la resolucion de problemas no son prioritarias; el modelo puede ser menos fiable en tareas factuales o tecnicas que el base.
- Riesgo elevado de alucinacion en contextos que exigen precision, dado el enfoque en creatividad y la reduccion del alineamiento.
- El alineamiento reducido puede producir contenido con lenguaje o tematicas sensibles; no es adecuado para aplicaciones de produccion que requieran moderacion estricta.
- No se documenta la licencia del finetune; el uso comercial depende de la licencia del modelo base Gemma y de la interpretacion del autor, por lo que debe verificarse antes de desplegar.
- No hay lista de idiomas ni evaluacion multilingue publicada.
- No hay benchmarks ni mediciones de latencia o throughput publicadas.
- El modelo esta orientado a entretenimiento y creatividad; no se recomienda para atencion al cliente, codigo en produccion ni dominios regulados sin evaluacion adicional.
- El soporte de tool calling y agentes no esta documentado y no debe asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- GGUF iMatrix de bartowski (recomendado): https://huggingface.co/bartowski/TheDrummer_Orion-26B-A4B-v1.1-GGUF
- API serverless Kitani: https://kitani.ai/
- Discord del autor: https://discord.gg/BeaverAI
- Patreon del autor: https://www.patreon.com/TheDrummer
- Enlaces del autor: https://linktr.ee/thelocaldrummer
- Hoja de samplers colaborativos: https://docs.google.com/spreadsheets/d/1wil6YEHTnQP3DO9EF35ImQMY3lbmRt5_ns-LJavUqwQ
- Formulario para compartir samplers: https://docs.google.com/forms/d/e/1FAIpQLSfeiOeLbNt-xc8tr0BopJ4KawMm3YrLGD5mYLjZqg8ehl35BQ/viewform
