# Ziaullah102/zia-ai-assistant

## Resumen

Zia AI Assistant es un ajuste fino (fine-tune) del modelo base google/gemma-4-E2B-it, desarrollado por Muhammad Zia Ubaid, un desarrollador de Pakistan. Se trata de un asistente conversacional orientado a un tono calido y cercano, con un foco claro en urdu (tanto en escritura arabe-urdu como en urdu romanizado) y en ingles. El modelo incorpora una identidad propia definida: se presenta como "Zia AI Assistant" y atribuye su creacion a su autor, evitando mencionar a Google o Gemma.

Tecnicamente, el modelo parte de una arquitectura Gemma 4 con 2.300 millones de parametros efectivos y una ventana de contexto de 128.000 tokens, sobre la que se aplico un ajuste LoRA (r=16, alpha=16, QLoRA) con 1.900 ejemplos escritos a mano, y cuyo adaptador se fusiono posteriormente en los pesos base (W + B@A, escala 1.0). El repositorio aloja el modelo fusionado en safetensors (5 fragmentos, 2.011 tensores) y versiones GGUF en F16 y Q4_K_M.

Su relevancia actual es limitada pero concreta: ofrece una via para desplegar un asistente conversacional multilingue (urdu, urdu romanizado e ingles) en dispositivos de gama baja, incluidos telefonos, gracias a la cuantizacion Q4_K_M (~3,19 GiB). No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y su model card no incluye resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4, google/gemma-4-E2B-it) |
| Parametros totales | 5.123.178.051 (pesos en safetensors); 2.300 millones de parametros efectivos segun la model card |
| Parametros activos | 2.300 millones efectivos (modelo base descrito como E2B) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | F16 y Q4_K_M (5,8713 bits por peso) en GGUF; safetensors sin cuantizar |
| Idiomas soportados | Urdu (escritura arabe-urdu), urdu romanizado e ingles; segun la model card, responde en el idioma y escritura del usuario |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (5 fragmentos) y GGUF (F16 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-4-E2B-it, un transformer decoder-only de la familia Gemma 4 con 2.300 millones de parametros efectivos y 128.000 tokens de contexto. Sobre esta base se aplico un ajuste LoRA con rango 16, alpha 16 y cuantizacion QLoRA, entrenado en una GPU T4 gratuita de Kaggle durante 238 pasos, con una perdida de entrenamiento que descendio de 0,64 a 0,19. Posteriormente, el adaptador se fusiono en los pesos base mediante la operacion W + B@A con escala 1.0, y el resultado se publico como modelo fusionado. La model card documenta una comprobacion del fusionado: un tensor objetivo del LoRA coincide exactamente con base + B@A (diferencia absoluta maxima de 0,0) y un tensor no objetivo es identico byte a byte al del modelo base.

El conjunto de entrenamiento consta de 1.900 ejemplos escritos a mano (semilla 42, generados con build_dataset.py), distribuidos en identidad (150), saludos (350), explicaciones detalladas (700), poesia (150), preguntas variadas (450) y pares de tono (100, 50 masculinos y 50 femeninos). Por escritura, 770 ejemplos estan en urdu, 770 en urdu romanizado y 360 en ingles. No se mezclo ningun dataset externo: la model card indica que se revisaron y descartaron los datasets de urdu candidatos de Hugging Face por falta de licencia declarada o por conflictos de identidad o trazas de razonamiento, y que UrduHack se uso solo como concepto de limpieza y normalizacion, no como pesos. No se menciona el uso de RLHF ni DPO; el entrenamiento es exclusivamente de ajuste supervisado sobre el modelo instruct.

Una particularidad operativa relevante es la gestion del canal de razonamiento: la plantilla de chat de Gemma 4 soporta un canal de pensamiento que llama.cpp activa por defecto (--reasoning auto). Con el razonamiento activado, el modelo emite una traza de razonamiento en ingles en lugar de una respuesta directa, por lo que la model card recomienda desactivarlo (enable_thinking=false o --reasoning off).

## Capacidades

- Generacion de texto conversacional con un tono calido, educado y afectuoso, orientado a conversacion cotidiana y poesia no explicita.
- Identidad propia consistente: responde "I am Zia AI Assistant" y atribuye su creacion a Muhammad Zia Ubaid, sin mencionar a Google ni a Gemma.
- Multilingue con foco en urdu: responde en la misma lengua y escritura que el usuario (urdu en escritura arabe-urdu, urdu romanizado, ingles u otros idiomas).
- Adaptacion al genero gramatical del usuario: las entradas en forma masculina reciben respuesta masculina y las femeninas, respuesta femenina.
- Explicaciones detalladas de temas cotidianos y respuesta a preguntas variadas de uso diario.
- Generacion de poesia, especialmente en urdu.
- Soporte de plantilla de chat de Gemma 4 con canal de razonamiento (desactivable).
- No incluye vision ni audio en esta build, pese a que el modelo base sea multimodal; la model card lo declara explicitamente como modelo solo de texto.

## Casos de uso

- Asistente conversacional en urdu para atencion al publico en Pakistan: el modelo mantiene conversaciones multi-turno en urdu y urdu romanizado, adapta el registro y el genero gramatical del usuario y responde con un tono cercano, lo que encaja en escenarios de soporte informal o acompanamiento.
- Aplicacion movil offline: la version Q4_K_M (~3,19 GiB) permite ejecutar el modelo en telefonos con CPU o GPU razonables sin conexion, algo viable gracias al tamano reducido y a la cuantizacion de 5,87 bits por peso.
- Generacion de poesia y contenido creativo en urdu: el ajuste incluye 150 ejemplos de poesia, por lo que puede producir composiciones breves en escritura arabe-urdu para blogs, redes sociales o aplicaciones de ocio.
- Practica de idiomas para hablantes de ingles que aprenden urdu: el modelo responde en la escritura que emplea el usuario, lo que permite alternar entre urdu romanizado y escritura arabe-urdu como apoyo al aprendizaje.
- Chatbot de marca con identidad personalizada: el ajuste demuestra como fijar una identidad concreta (nombre y autor) mediante un conjunto pequeno de ejemplos de identidad, replicable para asistentes de marca o personajes.
- Prototipado rapido de asistentes en entornos con recursos limitados: al caber en una GPU T4 y en GGUF Q4_K_M, sirve para validar flujos conversacionales multilingues antes de invertir en modelos mayores.
- Base para experimentos de ajuste LoRA sobre Gemma 4: la documentacion del fusionado, los hashes y el script de construccion de dataset lo convierten en una referencia reproducible para quien quiera repetir el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta una prueba de identidad local con llama-cli sobre el GGUF Q4_K_M (temperatura 0,7, top-p 0,95, razonamiento desactivado), con 5 de 5 respuestas correctas en cuanto a nombre y creador, en escritura arabe-urdu y urdu romanizado, y con respuestas en la misma escritura que la pregunta.

En cuanto a velocidad, la model card indica aproximadamente 5 tokens por segundo en una maquina virtual pequena con CPU compartida, y senala que telefonos con buena CPU o GPU seran mas rapidos. No se proporcionan cifras de throughput en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 3.426.663.424 bytes (~3,19 GiB), por lo que cabe en GPUs con 4 GB de VRAM o mas; el F16 ocupa 9.311.304.704 bytes (~8,7 GiB) y requiere al menos 10-12 GB de VRAM para dejar margen al contexto.
- GPU recomendadas: para Q4_K_M, tarjetas de consumo como RTX 3050, RTX 3060, RTX 4060 o superiores; para F16, RTX 4070 Ti, RTX 4080, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 4 GB o mas usando Q4_K_M; tambien en telefonos segun la model card.
- Opciones de despliegue: llama.cpp (los GGUF se generaron con el commit 6d54465e9db35a2683efe1ec672a075acb3fa0c2), llama-cli, y por formato safetensors cualquier runtime compatible con Gemma 4 (vLLM, TGI, transformers). Ollama es viable convirtiendo el GGUF, aunque no se documenta oficialmente.
- Latencia y throughput estimados: unos 5 tokens por segundo en una VM pequena con CPU compartida; sin datos publicados para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zia AI Assistant | 5.123.178.051 en safetensors (2.300 M efectivos) | 128.000 | Urdu, urdu romanizado, ingles | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| google/gemma-4-E2B-it | 2.300 M efectivos | 128.000 | Multilingue (segun model card del base) | Apache 2.0 | Hugging Face |
| Modelos pequenos multilingues de la familia Gemma 3 (p. ej. gemma-3-1b-it) | ~1.000 M | 32.000 | Multilingue | Gemma Terms of Use | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 | Multilingue (incluye urdu limitado) | Apache 2.0 | Hugging Face |

La comparativa se limita a datos publicos de parametros, contexto y licencia; no hay benchmarks comparativos disponibles en la informacion proporcionada para medir el rendimiento relativo en urdu o en tareas estandar. Frente al modelo base, Zia AI Assistant anade identidad fija, tono y cobertura de urdu mediante ajuste supervisado, pero no mejora la arquitectura ni el contexto.

## Limitaciones y advertencias

- Modelo solo de texto: aunque el base sea multimodal, esta build no tiene ruta de vision ni de audio, y genera texto, no voz.
- Tamano reducido (2.300 M efectivos): la model card reconoce que puede cometer errores en temas dificiles o poco frecuentes, y el ajuste se hizo con solo 1.900 ejemplos.
- Riesgo de alucinacion: al ser un modelo pequeno con entrenamiento limitado, puede inventar datos en preguntas factuales, especialmente fuera de los dominios cubiertos por el dataset.
- Sesgos: el dataset esta escrito a mano por un unico autor, con foco en Pakistan y en un tono afectuoso concreto; puede reflejar sesgos culturales y estilisticos de esa perspectiva.
- Restricciones de licencia: la model card declara Apache 2.0, heredada del base; conviene verificar los terminos del modelo base google/gemma-4-E2B-it antes de uso comercial, ya que la ficha de Hugging Face no declara licencia de forma explicita.
- Identidad forzada: el modelo esta entrenado para no mencionar a Google ni a Gemma como creadores, lo que puede entrar en conflicto con requisitos de atribucion en determinados contextos.
- Canal de razonamiento: si se deja activado (comportamiento por defecto en llama.cpp), emite trazas de razonamiento en ingles en lugar de respuestas directas, lo que degrada la experiencia si no se configura enable_thinking=false.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados; no es un modelo validado por la comunidad.
- Cobertura limitada de idiomas: fuera de urdu, urdu romanizado e ingles no hay evidencia de calidad; el soporte de otros idiomas depende del modelo base y no del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ziaullah102/zia-ai-assistant
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de llama.cpp (commit usado para los GGUF): https://github.com/ggml-org/llama.cpp
- Referencia de UrduHack (concepto de limpieza y normalizacion): https://github.com/urduhack/urduhack
