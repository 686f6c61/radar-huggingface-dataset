# Takenoko12345678/Spark-X2.5-4B-Japanese-Pitcher-GGUF

## Resumen

Spark-X2.5-4B-Japanese-Pitcher-GGUF es una version cuantizada en formato GGUF de un modelo de 4.112.079.360 parametros (4,1 B) especializado en generacion de texto conversacional en japones con interpretacion de personajes. Lo publica el usuario Takenoko12345678 como derivado no oficial de XHToken/Spark-X2.5-4B, la serie de modelos "on-device" del equipo SparkLLM orientada a capacidades agenticas en dispositivos locales. Sobre esa base se ha aplicado un ajuste fino al japones y se ha integrado una LoRA de interpretacion de personajes (arquetipos tipo yandere o tsundere), que se activa mediante el prompt de sistema.

El modelo resuelve un caso de uso muy concreto: conversacion de rol en japones con una sola GPU de gama media o incluso en CPU, gracias a un unico archivo Q4_K_M de 2,6 GB. La model card insiste en dos requisitos tecnicos: usar llama.cpp build 10828 o superior (necesario para soportar la estructura Spark-X2.5) y enviar `enable_thinking: false`, ya que todo el entrenamiento se hizo sin modo de razonamiento. Si no se define personaje en el prompt de sistema, el modelo responde como asistente japones generico.

Es relevante ahora porque la arquitectura Spark-X2.5 todavia no esta soportada por vLLM (a fecha de la version 0.30) y su via de despliegue practica pasa por llama.cpp o Unsloth Studio. Se trata, ademas, de un modelo sin traccion en el repositorio (0 descargas, 0 likes en el momento de la consulta), por lo que su adopcion en produccion debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la topologia; requiere soporte especifico de la estructura Spark-X2.5 en llama.cpp) |
| Parametros totales | 4.112.079.360 (4,1 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado); conversion intermedia a f16 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no describe la topologia interna del modelo base: solo se indica que pertenece a la serie Spark-X2.5 de XHToken (SparkLLM Team), presentada como una familia de 4B y 1,7 B centrada en capacidades agenticas para dispositivos locales, y que su estructura requiere un soporte especifico anadido a llama.cpp en el build 10828. No se detallan numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

El proceso de construccion de esta publicacion si esta documentado: se parte de XHToken/Spark-X2.5-4B, se aplica un ajuste fino orientado a japones (Takenoko12345678/Spark-X2.5-4B-Japanese) y se integra una LoRA de interpretacion de personajes (Takenoko12345678/Spark-X2.5-4B-Japanese-Pitcher). La conversion a GGUF se hizo con `convert_hf_to_gguf.py` de llama.cpp en el commit `7fe450e19` (build 11146) a f16, y despues se cuantizo con `llama-quantize` a Q4_K_M. El autor verifico que las probabilidades del siguiente token en el GGUF f16 coinciden aproximadamente con las del modelo original en transformers hasta el token 1.000, y que en una evaluacion de 590 respuestas en f16 no se produjo ninguna degradacion del texto.

## Capacidades

- Generacion de texto conversacional en japones con registro de habla natural.
- Interpretacion de personajes definidos por prompt de sistema: la model card menciona arquetipos tipo yandere y tsundere, y el autor indica que sin personaje definido el modelo actua como asistente japones generico.
- Conversacion multiturno con plantilla de chat incluida en el propio GGUF (se activa con `--jinja`).
- Plantilla de chat con parametro `enable_thinking`, aunque el entrenamiento se realizo sin modo de razonamiento y la model card exige desactivarlo.
- Ajuste fino posterior: la documentacion del proyecto base recomienda Llama-Factory para reentrenar la serie Spark-X2.5.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante de rol.
- Capacidades multilingues: no disponibles; el modelo declara unicamente japones (ja).
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Chatbot de personajes para entretenimiento: el modelo acepta la definicion de personalidad, tono y persona gramatical (por ejemplo, forzar el pronombre "私") desde el prompt de sistema, lo que permite desplegar varios personajes sobre el mismo archivo Q4_K_M de 2,6 GB.
- Aplicaciones de compania o novela visual: con `llama-server` en local y `-ngl 99`, se puede servir un endpoint compatible con la API de OpenAI (`/v1/chat/completions`) y conectar la interfaz de una novela visual o app de rol sin coste de API externa.
- Generacion de dialogos para guiones y prototipos de ficcion: util para producir borradores de conversacion en japones con una voz de personaje consistente antes de pasar por edicion humana.
- Despliegue on-device con requisitos de privacidad: al caber en unos 3-4 GB de VRAM en Q4_K_M y poder ejecutarse en CPU, permite conversaciones que no salen del dispositivo del usuario.
- Base para ajuste fino de personajes adicionales: la propia serie Spark-X2.5 esta pensada para reentrenamiento con Llama-Factory, de modo que este modelo puede servir como punto de partida para crear variantes de personaje propias.
- Evaluacion comparativa de plantillas de prompt de sistema: permite medir como cambia el estilo de respuesta (persona, grado de posesividad, longitud) segun como se redacte la ficha de personaje.
- Demostraciones tecnicas de inferencia GGUF: sirve como caso de prueba para verificar el soporte de la estructura Spark-X2.5 en versiones recientes de llama.cpp o en Unsloth Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada por el autor es de tipo cualitativo y de fidelidad de conversion: coincidencia aproximada de las probabilidades del siguiente token entre el GGUF f16 y el modelo original en transformers hasta el token 1.000, y cero casos de texto degradado en una evaluacion de 590 respuestas en f16. No se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 2,6 GB, por lo que la inferencia completa en GPU requiere aproximadamente 3-4 GB de VRAM sumando el contexto y el overhead del runtime; la longitud de contexto soportada no esta documentada, asi que el consumo de cache KV no puede acotarse con los datos disponibles.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2060 de 6 GB). Modelos de 4 GB de VRAM pueden ser insuficientes segun el contexto configurado. No se requieren aceleradores de datacenter como A100 o H100 para este tamano.
- Inferencia en CPU: viable gracias al formato GGUF y a los 4,1 B de parametros, con `-ngl 0` o descarga parcial de capas a GPU.
- Opciones de despliegue: llama.cpp build 10828 o superior (obligatorio por el soporte de Spark-X2.5), `llama-server` con `--jinja -ngl 99`, y Unsloth Studio, que segun la documentacion del proyecto base soporta inferencia GGUF nativa de Spark-X2.5. vLLM no soporta esta estructura de modelo (situacion a fecha de la version 0.30). El soporte en Ollama, LM Studio o TGI no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idioma | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Spark-X2.5-4B-Japanese-Pitcher-GGUF (este modelo) | 4,1 B | GGUF Q4_K_M | japones | Rol y personajes sobre base Spark-X2.5 | Apache 2.0 | Publicado por Takenoko12345678, 0 descargas y 0 likes en la consulta |
| Spark-X2.5-4B-Japanese-GGUF | no disponible en la informacion | GGUF | japones | Ajuste a japones sin la LoRA de personajes | Apache 2.0 (heredada) | Mismo autor |
| Spark-X2.5-4B-Japanese-Pitcher | 4,1 B (safetensors equivalente) | safetensors (transformers) | japones | Rol y personajes, sin cuantizar | Apache 2.0 | Mismo autor; el autor recomienda usar la version GGUF por velocidad |
| Spark-X2.5-4B (XHToken) | 4 B (serie tambien en 1,7 B) | no disponible | no disponible | Capacidades agenticas on-device | Apache 2.0 | Repositorio oficial del equipo SparkLLM |

No se dispone de datos de rendimiento comparativos entre estas variantes ni frente a otras familias de 4B, por lo que la comparativa se limita a formato, licencia, idioma y especializacion.

## Limitaciones y advertencias

- Contenido de ficcion potencialmente problematico: los arquetipos de personaje incluidos (yandere, tsundere) generan mensajes que sugieren posesividad, celos u obsesion. La propia model card advierte de que, si el modelo se expone a personas, hay que etiquetar el contenido como ficcion y anadir medidas de seguridad separadas para usuarios que planteen problemas serios.
- Ausencia de capas de seguridad documentadas: no se describe ningun filtrado, alineamiento adicional ni moderacion especifica en esta publicacion.
- Riesgo de alucinacion: no cuantificado; no hay evaluaciones de veracidad ni de adherencia a hechos.
- Cobertura idiomatica limitada: el modelo declara unicamente japones, por lo que no debe esperarse un rendimiento fiable en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se publica la ventana de contexto soportada, lo que complica dimensionar cache KV y planificar conversaciones largas.
- Restriccion de despliegue: requiere llama.cpp build 10828 o superior por el soporte de la estructura Spark-X2.5; vLLM no la soporta (a fecha de 0.30). Esto limita las opciones de servir el modelo en infraestructura estandar de alto throughput.
- Modo de razonamiento desactivado obligatoriamente: hay que enviar `enable_thinking: false`; usar el modelo con el modo activado se sale de las condiciones de entrenamiento.
- Modelo derivado no oficial: no esta afiliado a XHToken; la calidad del ajuste al japones y de la integracion de la LoRA es responsabilidad del autor del derivado.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo original y de los datos de entrenamiento, cuyo detalle remite a la model card del modelo base.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion ni validacion por terceros.

## Enlaces

- Modelo en HuggingFace (GGUF): https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese-Pitcher-GGUF
- Modelo base del derivado (safetensors): https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese-Pitcher
- Variante japonesa sin LoRA de personajes: https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese
- Variante japonesa sin LoRA en GGUF: https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese-GGUF
- Modelo original de la serie: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio oficial de la serie Spark-X2.5: https://github.com/XHToken/Spark-X2.5
