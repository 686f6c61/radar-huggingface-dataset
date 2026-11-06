# tripathishubham1/revive-local-gguf

## Resumen

Revive Local es un ajuste fino del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario tripathishubham1 para dar soporte al asistente de escritorio Revive, una aplicación para Windows que funciona de forma local. El modelo se ha especializado mediante QLoRA en tres tareas concretas: clasificación de actividad del usuario a partir del nombre de la aplicación y el título de la ventana, explicación de códigos de error de Windows en formato JSON con pasos seguros, y selección de herramientas (tool calling) a partir de peticiones en lenguaje natural. Posteriormente se ha cuantizado a 4 bits en formato GGUF (Q4_K_M, aproximadamente 2,5 GB) para su ejecución con llama.cpp tanto en GPU como en CPU.

La relevancia de este modelo reside en su enfoque de despliegue en dispositivo (on-device) para un caso de uso muy acotado: un asistente de PC que debe responder con baja latencia y sin enviar datos a la nube. Frente al modelo base sin ajustar, mejora de forma notable en las tareas específicas para las que fue entrenado, especialmente en la explicación de errores de Windows (57,4 % frente a 37,7 %) y en la clasificación de tareas (97,5 % frente a 87,5 %). No obstante, el propio autor advierte de que está ajustado para los prompts de Revive y que, como modelo de chat general, debe usarse el modelo base.

El modelo hereda la arquitectura y el tamaño de Qwen3-4B-Instruct-2507 (4 mil millones de parámetros), aunque la información proporcionada no detalla la longitud de contexto ni la composición exacta del dataset de entrenamiento. La licencia es Apache-2.0, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-4B-Instruct-2507); no se detalla en la informacion disponible |
| Parametros totales | 4 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~2,5 GB); no se documentan otras variantes |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer de 4 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. Sobre esa base se aplicó un ajuste fino con QLoRA (cuantización de bajo rango) utilizando Unsloth sobre Kaggle. El entrenamiento se orientó a tres tareas específicas del producto Revive: clasificación de actividad (una palabra a partir de la app y el título de ventana), explicación de errores de Windows (JSON con una frase y hasta tres pasos seguros) y enrutamiento de herramientas (JSON con la herramienta a usar, una respuesta corta o una negativa ante peticiones inseguras). No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

Tras el ajuste fino, el modelo se cuantizó a 4 bits con llama.cpp en formato Q4_K_M, lo que reduce el peso a aproximadamente 2,5 GB y permite su ejecución local en GPU o CPU. La aplicación Revive descarga el archivo `revive-local.gguf` desde el repositorio durante el onboarding, verifica su SHA-256 y lo ejecuta con una versión fijada de llama.cpp. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento básico, heredados del modelo base Qwen3-4B-Instruct-2507.
- Clasificación de actividad del usuario: a partir del nombre de una aplicación y el título de la ventana, devuelve una palabra que describe qué está haciendo la persona (por ejemplo, coding, meeting).
- Explicación de errores de Windows: dado un código y un mensaje de error, genera un JSON con una frase explicativa y hasta tres pasos seguros.
- Tool calling / function calling: interpreta peticiones en lenguaje natural y devuelve un JSON indicando qué herramienta de Revive usar, una respuesta corta o una negativa ante solicitudes inseguras.
- Refuerzo de seguridad: en el conjunto de prueba, el modelo rechazó el 100 % de las peticiones inseguras.
- Capacidades multilingües limitadas: la model card declara únicamente inglés como idioma soportado.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistente de escritorio local en Windows: el modelo se integra en la aplicación Revive para clasificar en tiempo real la actividad del usuario a partir de la ventana activa, con una precisión del 97,5 % en el conjunto de prueba. Su tamaño de 2,5 GB en Q4_K_M permite ejecutarlo en segundo plano sin depender de la nube.
- Explicación de errores del sistema: cuando el usuario encuentra un código de error de Windows, el modelo genera una explicación en lenguaje llano y hasta tres pasos seguros para resolverlo, con un 57,4 % de acierto en el conjunto de prueba, frente al 37,7 % del modelo base.
- Enrutamiento de herramientas en un agente de escritorio: el modelo decide qué herramienta de Revive invocar a partir de una petición en lenguaje natural y devuelve un JSON estructurado, lo que facilita la integración en un pipeline de agentes con llamadas a funciones.
- Filtrado de seguridad en asistentes locales: gracias a su 100 % de rechazo de peticiones inseguras en el conjunto de prueba, puede usarse como primera capa de validación antes de ejecutar acciones potencialmente peligrosas en el sistema.
- Despliegue en equipos sin GPU dedicada: al estar cuantizado a Q4_K_M y poder ejecutarse con llama.cpp en CPU, es adecuado para portátiles y equipos de oficina que no dispongan de aceleración gráfica.
- Prototipado de asistentes de productividad con contexto de ventana: la clasificación de tareas (coding, meeting, etc.) puede alimentar funciones de seguimiento de actividad, informes de productividad o automatizaciones condicionadas a la aplicación activa.
- Integración en aplicaciones de escritorio con llama-server: el comando `llama-server -m revive-local.gguf --jinja -ngl 99 --port 8080` permite exponer el modelo como servicio HTTP local para que otras aplicaciones del escritorio consuman sus capacidades sin salir del equipo.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de prueba reservado (aplicaciones, títulos y formulaciones no vistas en entrenamiento):

| Modelo | explain | task | tool | unsafe refused | media |
|---|---|---|---|---|---|
| Revive Local (este) | 57,4 % | 97,5 % | 42,6 % | 100 % | 74,4 % |
| Qwen3-4B-Instruct-2507 (stock) | 37,7 % | 87,5 % | 42,6 % | 100 % | 66,9 % |
| Phi-4-mini-instruct, fine-tuned | 54,1 % | 97,5 % | 25,5 % | 37,5 % | 53,7 % |
| Phi-4-mini-instruct (stock) | 42,6 % | 69,2 % | 19,1 % | 0 % | 32,7 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB para los pesos en Q4_K_M, más el espacio para el contexto y el estado de la KV cache; no se dispone de una cifra oficial de VRAM total.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por el tamaño del modelo, cabe en GPU de consumo como las RTX 3060, RTX 4060 o superiores con al menos 4-6 GB de VRAM, aunque esta estimación no está confirmada por el autor.
- Ejecución en CPU: el autor indica explícitamente que el modelo puede ejecutarse con llama.cpp en CPU, lo que permite su uso en equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp mediante `llama-server` con los parámetros `--jinja -ngl 99 --port 8080`. No se documentan otras opciones como vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento en el test del autor |
|---|---|---|---|---|---|
| Revive Local (este) | 4 B | no disponible | Apache-2.0 | GGUF Q4_K_M | 74,4 % de media |
| Qwen3-4B-Instruct-2507 (stock) | 4 B | no disponible | Apache-2.0 | safetensors y otras | 66,9 % de media |
| Phi-4-mini-instruct, fine-tuned | no disponible | no disponible | no disponible | no disponible | 53,7 % de media |
| Phi-4-mini-instruct (stock) | no disponible | no disponible | no disponible | no disponible | 32,7 % de media |

La comparación se limita a las métricas internas del autor sobre su propio conjunto de prueba, por lo que no es directamente extrapolable a benchmarks estándar ni a otros dominios.

## Limitaciones y advertencias

- El modelo está ajustado específicamente para los prompts y las tres tareas de Revive; el propio autor recomienda usar el modelo base para chat general.
- El rendimiento en la tarea de tool calling es moderado (42,6 %), idéntico al del modelo base, lo que sugiere que el ajuste fino no mejoró esta capacidad.
- La tarea de explicación de errores alcanza un 57,4 %, lo que implica que una proporción significativa de las explicaciones generadas puede ser incorrecta o incompleta.
- Solo se declara soporte de inglés; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- No se documenta la longitud de contexto, lo que dificulta planificar su uso en conversaciones o documentos largos.
- Riesgo de alucinación inherente a los modelos de 4 mil millones de parámetros, especialmente en la generación de pasos de solución para errores del sistema.
- Los sesgos conocidos no se documentan en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con un historial de descargas y valoraciones nulo (0 descargas, 0 likes en el momento de la consulta), lo que limita la validación por parte de la comunidad.
- El repositorio se creó y actualizó el mismo día (2026-11-01), sin historial de versiones ni mantenimiento posterior documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tripathishubham1/revive-local-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Producto Revive: https://theserifs.com/revive
