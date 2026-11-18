# Vanovich667/Qwen3-4b-Z-Image-Turbo-AbliteratedV1

## Resumen

Qwen3-4b-Z-Image-Turbo-AbliteratedV1 es una version "abliterada" (con los mecanismos de rechazo suprimidos) del codificador de texto asociado a Z-Image-Turbo, un modelo de generacion de imagenes. El autor, Vanovich667, parte de la arquitectura Qwen3 de 4.022 millones de parametros y aplica el metodo heretic de p-e-w mediante 1000 iteraciones de ablation, dirigidas tanto a los rechazos en generacion de imagenes como a los rechazos generales del modelo conversacional. El resultado es un encoder de texto que, segun la model card, mantiene una divergencia KL de solo 0,0004 respecto al original y reduce la tasa de rechazo a 4 de cada 100 en las pruebas del autor.

El modelo no es un generador de imagenes por si mismo, sino el componente de codificacion de texto que se acopla a un pipeline de difusion. Su relevancia practica radica en que elimina las negativas del encoder a procesar determinadas descripciones, algo que en flujos de generacion de imagen puede bloquear prompts legitimos. Se distribuye con licencia Apache 2.0 en formato safetensors y en una bateria completa de cuantizaciones GGUF (de F16 a Q2_K), lo que facilita su despliegue en hardware de consumo.

La ficha se basa unicamente en la informacion disponible en Hugging Face; los datos de entrenamiento, composicion del dataset y benchmarks estandar no estan publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), usado como text encoder |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Modelo base | Tongyi-MAI/Z-Image-Turbo |
| Tamano del repositorio | 35,2 GB |
| Fecha de creacion | 2026-11-18 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3 en su variante de 4.000 millones de parametros, reutilizada como codificador de texto para el pipeline de generacion de imagenes Z-Image-Turbo. Sobre esa base, el autor aplica el metodo heretic de p-e-w, una tecnica de ablation que identifica y suprime las direcciones del espacio de activaciones responsables de los comportamientos de rechazo, en lugar de recurrir a fine-tuning supervisado con pares de respuestas. El proceso se ejecuto con 1000 iteraciones o trials, segun la model card, apuntando simultaneamente a los rechazos especificos de generacion de imagenes y a los rechazos generales del modelo conversacional.

El autor reporta dos metricas de control: una divergencia KL de 0,0004 frente al modelo original, indicador de que la distribucion de salida apenas se altera fuera de las regiones de rechazo, y una tasa de rechazo de 4/100 en sus pruebas internas. No se publican datos sobre el corpus de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovacion tecnica mas alla de la aplicacion del metodo heretic.

## Capacidades

- Codificacion de texto para pipelines de generacion de imagenes basados en Z-Image-Turbo, incluido el procesamiento de prompts descriptivos.
- Generacion de texto conversacional heredada de la base Qwen3 de 4.000 millones de parametros.
- Supresion de rechazos tanto en contextos de generacion de imagen como en conversacion general, segun las pruebas del autor.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Soporte de cuantizacion GGUF en ocho niveles para despliegue local.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes sin bloqueos por prompt: el modelo actua como encoder de texto en un pipeline de difusion y evita que descripciones complejas o sensibles sean rechazadas antes de llegar al generador, gracias a la ablation de los mecanismos de negativa.
- Investigacion sobre alineacion y seguridad: util para estudiar como la ablation afecta a la distribucion de salidas (divergencia KL de 0,0004) y que comportamientos residuales persisten tras suprimir los rechazos.
- Prototipado de herramientas creativas: al ser un encoder de 4.000 millones de parametros cuantizable a 2,5 GB en Q4_K_M, permite montar entornos de prueba de generacion de imagen en estaciones de trabajo con GPU de consumo.
- Evaluacion comparativa de tecnicas de abliteration: sirve como referencia para contrastar el metodo heretic con otras aproximaciones de eliminacion de rechazos en modelos de la familia Qwen3.
- Despliegue en local con llama.cpp u Ollama: las cuantizaciones Q4_K_S (2,38 GB) y Q3_K_M (2,08 GB) permiten ejecutar el encoder en equipos con VRAM limitada sin depender de servicios en la nube.
- Experimentacion con pipelines de imagen personalizados: al ser un modelo Apache 2.0 y con pesos safetensors, puede integrarse en flujos propios de difusion que requieran un encoder de texto modificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta las siguientes metricas internas:

| Metrica | Valor reportado |
|---|---|
| Divergencia KL frente al original | 0,0004 |
| Tasa de rechazo en pruebas del autor | 4/100 |
| Iteraciones de ablation | 1000 |

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 8 GB solo para pesos, mas overhead de contexto y activaciones.
- VRAM estimada en Q4_K_M: aproximadamente 2,5 GB de pesos, apto para GPU de consumo con 4-6 GB de VRAM.
- VRAM estimada en Q2_K: aproximadamente 1,67 GB de pesos, viable en GPUs integradas o equipos con poca memoria.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores para F16; RTX 3050 8 GB o GTX 1660 6 GB para cuantizaciones Q4.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; los pesos safetensors permiten su uso con frameworks de transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4b-Z-Image-Turbo-AbliteratedV1 | 4.022 M | no disponible | Apache 2.0 | safetensors, GGUF | Encoder abliterado, KL 0,0004, rechazo 4/100 |
| Tongyi-MAI/Z-Image-Turbo (base) | no disponible | no disponible | no disponible | no disponible | Modelo original sin ablation |
| Qwen3-4b-Z-Image-Engineer-V2.5 | no disponible | no disponible | no disponible | no disponible | Variante del mismo autor orientada a ingenieria de prompts |
| qwen3-4b-Z-Image-Engineer | no disponible | no disponible | no disponible | no disponible | Version original del encoder de ingenieria |

Los datos de contexto y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La ablation de rechazos elimina filtros de seguridad: el modelo puede generar contenido que el original bloquearia, lo que traslada al usuario toda la responsabilidad legal y etica sobre las salidas.
- Riesgo de alucinacion y de degradacion sutil: aunque la divergencia KL reportada es muy baja (0,0004), no se han publicado evaluaciones independientes que confirmen la preservacion de capacidades en tareas complejas.
- La tasa de rechazo de 4/100 es una metrica interna del autor, no validada externamente; no equivale a ausencia total de negativas.
- No se especifican los idiomas soportados ni el comportamiento multilingue tras la ablation.
- No se detalla la longitud de contexto efectiva del encoder ni su compatibilidad con prompts largos.
- El modelo es un encoder de texto, no un generador de imagenes autonomo: requiere acoplarse a un pipeline de difusion compatible con Z-Image-Turbo.
- La licencia Apache 2.0 permite uso comercial, pero el autor declina cualquier responsabilidad sobre el contenido generado y remite a la legislacion local.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vanovich667/Qwen3-4b-Z-Image-Turbo-AbliteratedV1
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Variante Z-Image-Engineer-V2.5: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Engineer-V2.5
- Variante Z-Image-Engineer original: https://huggingface.co/BennyDaBall/qwen3-4b-Z-Image-Engineer
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
- Repositorio espejo con GGUF: https://huggingface.co/BennyDaBall/Qwen3-4b-Z-Image-Turbo-AbliteratedV1
