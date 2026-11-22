# Thox-ai/ThoxLLM-327M-v2-GGUF

## Resumen

ThoxLLM-327M-v2-GGUF es la distribucion en formato GGUF del modelo base ThoxLLM-327M-v2, un modelo de lenguaje de 327 millones de parametros entrenado desde cero por THOX.ai LLC (Thox-ai) como parte de su linea de investigacion de modelos pequenos. Este repositorio no contiene pesos nuevos: ofrece compilaciones k-quant del modelo original para su ejecucion en llama.cpp, Ollama y LM Studio, lo que lo convierte en la via practica para desplegar el modelo en entornos de borde y dispositivos locales.

El modelo pertenece a la categoria de modelos base (no instruct), por lo que se usa con prompts de completacion de texto y no con plantillas de chat. Con 324.162.560 parametros reales y un repositorio de 1,8 GB que incluye cinco variantes de cuantizacion (F16, Q2_K, Q3_K_M, Q4_K_M y Q5_K_M), su interes principal es el despliegue local-first dentro del stack THOX, no la competicion en benchmarks de razonamiento o conocimiento factual.

La relevancia actual del modelo es acotada y muy especifica: sirve como pieza de infraestructura para aplicaciones de generacion de texto en dispositivo con requisitos minimos de memoria (la variante Q4_K_M ocupa unos 299 MB) y licencia Apache-2.0 sin restricciones de uso comercial. No se han publicado resultados de evaluacion (el autor indica que no existe resultado GATE49 para este modelo), y la model card advierte explicitamente de sus limitaciones de razonamiento y fiabilidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer base entrenado desde cero; detalles de capas y atencion no publicados) |
| Parametros totales | 324.162.560 (327M nominales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (solo k-quants; no hay Q4_0 ni Q8_0) |
| Idiomas soportados | en (ingles; el entrenamiento es mayoritariamente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo fue entrenado desde cero por THOX.ai LLC como parte de su linea de investigacion de modelos pequenos, sin utilizar ningun modelo base externo. No se publican detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni composicion exacta del corpus; el unico dato tecnico concreto sobre la arquitectura es que el tamano intermedio del modelo no es divisible por 32, lo que impide generar cuantizaciones legacy Q4_0 y Q8_0 y limita las builds disponibles a k-quants.

No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El modelo es explicitamente un base model, no un modelo alineado para asistencia publica, y el autor remite a la model card del repositorio principal (Thox-ai/ThoxLLM-327M-v2) como fuente de referencia definitiva. Tampoco se describen innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto por completacion: al ser un modelo base, funciona con prompts de continuacion, no con formato conversacional.
- Razonamiento y conocimiento factual limitados por su tamano (327M), segun advierte el propio autor.
- Capacidades multilingues muy restringidas: el entrenamiento es mayoritariamente en ingles y la calidad en otros idiomas es inferior.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni modo thinking.
- Ejecucion en dispositivo y en el borde mediante llama.cpp, Ollama y LM Studio.
- Integracion dentro del stack THOX (ThoxOS, MeshStack) como componente de generacion local-first.

## Casos de uso

- Generacion de texto en dispositivo de bajos recursos: la variante Q4_K_M ocupa unos 299 MB y Q2_K unos 254 MB, lo que permite ejecutar el modelo en moviles, Raspberry Pi o sistemas embebidos con RAM limitada usando llama.cpp.
- Completado de texto y autocompletado local en editores o herramientas de escritorio: al ser un modelo base, encaja en tareas de continuacion de texto sin necesidad de plantilla de chat, con latencia muy baja por su tamano.
- Prototipado rapido de pipelines de generacion de texto: sirve como modelo de prueba en fases de desarrollo de aplicaciones THOX antes de escalar a modelos mayores, gracias a su licencia Apache-2.0 y a la disponibilidad de builds en Ollama.
- Componente de generacion dentro de arquitecturas mesh o local-first (MeshStack): su huella de memoria minima permite desplegarlo en nodos perifericos de una malla de dispositivos sin GPU dedicada.
- Experimentacion academica con modelos entrenados desde cero: util para estudiar el comportamiento de modelos base de escala 300M y comparar el efecto de distintas cuantizaciones k-quant sobre la calidad de salida.
- Filtrado o etiquetado de texto de bajo coste en local: para tareas simples de clasificacion por completacion o generacion de borradores en entornos sin conectividad, siempre con revision humana.
- Pruebas de integracion en CI/CD de herramientas de inferencia local: validar flujos de llama.cpp, Ollama y LM Studio con un artefacto GGUF pequeno y de descarga rapida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe resultado THOX GATE49 publicado para este modelo y no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada segun el tamano de cada fichero GGUF): F16 unos 650 MB, Q5_K_M unos 324 MB, Q4_K_M unos 299 MB, Q3_K_M unos 275 MB, Q2_K unos 254 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 1-2 GB de memoria libre es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 y en GPUs integradas con memoria compartida. Tambien es viable en CPU pura.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en dispositivos de borde sin GPU dedicada.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (`ollama run hf.co/Thox-ai/ThoxLLM-327M-v2-GGUF:Q4_K_M`) y LM Studio. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxLLM-327M-v2-GGUF | 327M | no disponible | Apache-2.0 | GGUF | Base model, solo ingles, sin benchmarks publicados |
| Modelos base de ~300M de la familia GPT-2 (referencia historica) | ~124M-355M | 1024 tokens (GPT-2) | MIT (segun variante) | safetensors, GGUF | Ampliamente soportados; contexto y datos de entrenamiento documentados publicamente |
| Modelos instruct pequenos de ~0,5B (familia Qwen2.5-0.5B) | ~494M | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Modelo instruct con contexto largo y benchmarks publicados; requiere mas memoria |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados para ThoxLLM-327M-v2 y la model card no ofrece cifras de contexto ni de calidad que permitan situarlo frente a modelos de tamano similar.

## Limitaciones y advertencias

- Modelo base de 327M: razonamiento y fiabilidad factual limitados; el autor recomienda verificar las respuestas importantes.
- No es un asistente publico alineado en seguridad salvo que se despliegue detras de los guardrails de THOX.
- Las cuantizaciones de menor bit degradan mas la calidad; Q2_K se describe como un experimento de tamano, no como una build de calidad.
- El comportamiento y los sesgos reflejan los datos de entrenamiento, mayoritariamente en ingles; la calidad en otros idiomas es inferior.
- Uso fuera de alcance segun el autor: decisiones medicas, legales, financieras o de seguridad critica sin revision humana, y control no supervisado de dispositivos fisicos sin paso de confirmacion.
- No se dispone de datos publicos de contexto, composicion del dataset ni evaluaciones, lo que dificulta la validacion en produccion.
- Al ser un modelo base, no responde a formatos de chat ni a instrucciones; usarlo con plantillas conversacionales produce resultados pobres.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero no exime de las advertencias de fiabilidad anteriores.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Thox-ai/ThoxLLM-327M-v2-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Thox-ai/ThoxLLM-327M-v2
