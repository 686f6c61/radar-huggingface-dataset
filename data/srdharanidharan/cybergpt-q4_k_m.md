# srdharanidharan/CyberGPT-Q4_K_M

## Resumen

CyberGPT es un modelo de lenguaje especializado en ciberseguridad, desarrollado por el usuario srdharanidharan como un experimento de fine-tuning sobre el modelo base Qwen3-4B de Alibaba. El objetivo es evaluar si un ajuste específico de dominio puede mejorar la utilidad de un modelo generalista para tareas relacionadas con seguridad informática, redes, criptografía y respuesta a incidentes. El modelo se distribuye en formato GGUF cuantizado Q4_K_M, pensado para inferencia local eficiente con llama.cpp, incluyendo soporte para aceleración por GPU mediante Vulkan.

La arquitectura subyacente es la de Qwen3-4B, un transformer causal con 36 capas, tamaño oculto de 2560, 32 cabezas de atención y 8 cabezas clave/valor, con un vocabulario de 151.936 tokens. El contexto original del modelo base alcanza hasta 262.144 tokens, aunque en la práctica la versión cuantizada se ha probado con ventanas de 2048 y 4096 tokens. El modelo está orientado exclusivamente al inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de CyberGPT radica en su enfoque de nicho: mientras que los modelos generalistas pueden ofrecer respuestas amplias sobre ciberseguridad, un fine-tuning específico busca mayor precisión y claridad técnica en dominios como análisis de vulnerabilidades, conceptos de malware o defensa de red. Sin embargo, al tratarse de una versión cuantizada de un modelo de 4B parámetros, su rendimiento en tareas complejas de razonamiento o generación de código avanzado será limitado en comparación con modelos de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en configuracion original; probado con 2048 y 4096 en la version cuantizada |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-4B, un transformer causal con 36 capas, dimension oculta de 2560, 32 cabezas de atencion y 8 cabezas clave/valor. La arquitectura emplea atencion multi-cabeza estandar con mecanismos de QKV, y el modelo base fue entrenado con un contexto de hasta 262.144 tokens, lo que permite manejar secuencias largas en teoria. La version cuantizada Q4_K_M reduce el tamaño del modelo de aproximadamente 8 GB en FP16 a unos 2.5 GB, manteniendo un equilibrio entre precision y eficiencia.

No se dispone de informacion detallada sobre el proceso de fine-tuning: no se especifican el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. La model card solo indica que el modelo fue ajustado para proporcionar respuestas educativas y tecnicamente claras en temas de ciberseguridad. El proceso de cuantizacion consistio en convertir el modelo base a GGUF FP16 y posteriormente aplicar la cuantizacion Q4_K_M mediante las herramientas de llama.cpp.

## Capacidades

- Generacion de texto especializada en ciberseguridad: responde preguntas sobre cifrado simetrico y asimetrico, cortafuegos, inyeccion SQL, XSS, autenticacion, principio de minimo privilegio, ataques DoS, IDS/IPS, MITM, MFA, hashing, vulnerabilidades zero-day, phishing, VPN, TCP/UDP, escalada de privilegios, malware, segmentacion de red, monitorizacion y respuesta a incidentes.
- Razonamiento basico sobre conceptos de seguridad: puede explicar diferencias entre terminos tecnicos y ofrecer definiciones claras, como se muestra en el ejemplo de cifrado simetrico vs asimetrico.
- Soporte de conversacion multi-turno: al ser un modelo de texto generativo, puede mantener dialogos con contexto, aunque la ventana de contexto practica en la version cuantizada se limita a unos pocos miles de tokens.
- Capacidad de ejecucion local: al estar en formato GGUF, es compatible con llama.cpp, llama-server y otras herramientas que soporten este formato, permitiendo inferencia en CPU o GPU con backend Vulkan.
- No se ha documentado soporte para tool calling, function calling, ni capacidades de agente o razonamiento multi-paso avanzado. Tampoco se mencionan capacidades multimodales (vision, audio).

## Casos de uso

- Asistente educativo para estudiantes de ciberseguridad: el modelo puede explicar conceptos fundamentales como diferencias entre cifrado simetrico y asimetrico, o el funcionamiento de un IDS frente a un IPS, con respuestas concisas y tecnicas. Su tamaño reducido permite ejecutarlo en portatiles o equipos modestos para practica autonoma.
- Soporte en formacion corporativa: empresas que imparten cursos internos de concienciacion en seguridad pueden desplegar CyberGPT como chatbot local para responder dudas frecuentes sobre politicas de seguridad, phishing o gestion de contraseñas, sin depender de servicios en la nube.
- Generacion de material de documentacion tecnica: el modelo puede redactar borradores de guias sobre hardening de sistemas, buenas practicas de autenticacion o descripciones de vulnerabilidades comunes, que un equipo de seguridad puede revisar y adaptar.
- Consulta rapida en entornos aislados: en redes sin acceso a internet o con restricciones de seguridad, un modelo local permite a analistas de SOC consultar definiciones y procedimientos estandar sin filtrar informacion a servicios externos.
- Prototipado de chatbots de seguridad: desarrolladores pueden integrar CyberGPT en aplicaciones de prueba mediante la API compatible con chat-completions de llama-server, para validar flujos de conversacion antes de escalar a modelos mayores.
- Evaluacion de calidad de respuestas en dominio especifico: el modelo sirve como punto de partida para comparar el efecto del fine-tuning frente al modelo base Qwen3-4B en tareas de ciberseguridad, midiendo precision y claridad en un conjunto de preguntas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion documentada es una prueba interna con 20 preguntas de conceptos fundamentales de ciberseguridad, donde el modelo genero respuestas exitosamente en el 100% de los casos. Sin embargo, la model card advierte explicitamente que este 100% corresponde a la generacion de respuestas, no a una puntuacion de calidad. Un intento de evaluacion automatica mediante LLM-as-a-judge solo produjo puntuaciones parseables en 17 de las 20 preguntas, por lo que no se puede afirmar una tasa de acierto definitiva.

| Metrica | Resultado |
|---|---|
| Preguntas de evaluacion | 20 |
| Generacion exitosa | 20/20 (100%) |
| Puntuaciones del juez automatico | 17/20 parseables |
| Rendimiento de generacion (Vulkan) | 15-19 tokens/segundo |

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa aproximadamente 2.5 GB. Para inferencia con contexto de 2048-4096 tokens, se recomienda al menos 3-4 GB de VRAM si se descargan todas las capas a GPU, o 4-6 GB de RAM si se ejecuta en CPU.
- GPU recomendadas: cualquier GPU con soporte Vulkan y al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060, o equivalentes de AMD. Tambien puede ejecutarse en Apple Silicon con Metal.
- Compatibilidad con GPU de consumo: si, el modelo cabe en la mayoria de GPUs consumer actuales e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), compatible con Ollama, LM Studio, y cualquier framework que soporte GGUF. Tambien se puede servir mediante la API de chat-completions de llama-server.
- Latencia y throughput: en la prueba documentada con backend Vulkan, se observaron 15-19 tokens por segundo. En CPU pura, el rendimiento sera menor, tipicamente 5-10 tokens por segundo en un procesador moderno.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos especializados en ciberseguridad. La unica referencia directa es el modelo base Qwen3-4B, del cual deriva. A continuacion se presenta una comparacion basada en las especificaciones publicas:

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| CyberGPT-Q4_K_M | ~4B | 262k (original) | Apache 2.0 | GGUF | Ciberseguridad |
| Qwen3-4B (base) | ~4B | 262k | Apache 2.0 | safetensors | Generalista |
| Otros modelos de ciberseguridad (p.ej. SecurityLLM) | no disponible | no disponible | no disponible | no disponible | Ciberseguridad |

La diferencia principal entre CyberGPT y su base es el fine-tuning en dominio, que deberia mejorar la precision en preguntas de seguridad, aunque no hay datos cuantitativos que lo confirmen. Frente a modelos generalistas de tamano similar, CyberGPT ofrece respuestas mas enfocadas, pero carece de la versatilidad de un modelo sin restriccion de dominio.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de 4B parametros, es propenso a generar respuestas incorrectas o inventar detalles tecnicos, especialmente en temas avanzados de ciberseguridad. La evaluacion interna no valida la correccion de las respuestas, solo su generacion.
- Limitacion de idioma: el modelo solo soporta ingles. No se ha entrenado ni evaluado en espanol u otros idiomas, por lo que su uso fuera del ingles producira resultados degradados.
- Contexto practico limitado: aunque la arquitectura soporta 262k tokens, la version cuantizada se ha probado con ventanas de 2048 y 4096 tokens. Usar contextos mayores puede degradar el rendimiento o causar errores de memoria.
- Sin capacidades de agente ni tool calling: no se ha documentado soporte para function calling, lo que limita su integracion en pipelines automatizados que requieran interaccion con APIs o herramientas externas.
- Riesgo de uso indebido: al ser un modelo de ciberseguridad, podria proporcionar informacion sobre ataques o vulnerabilidades que, en manos equivocadas, se utilice con fines malintencionados. La model card indica que es para uso educativo y tecnico, pero no hay salvaguardas implementadas.
- Falta de transparencia en el entrenamiento: no se publican detalles del dataset de fine-tuning, lo que impide evaluar posibles sesgos o lagunas de conocimiento.
- Rendimiento de generacion modesto: con 15-19 tokens por segundo en GPU Vulkan, no es adecuado para aplicaciones de alta concurrencia o tiempo real sin optimizaciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/srdharanidharan/CyberGPT-Q4_K_M
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Articulo sobre cuantizacion Q4_K_M (referencia general): https://medium.com/@paul.ilvez/demystifying-llm-quantization-suffixes-what-q4-k-m-q8-0-and-q6-k-really-mean-0ec2770f17d3
