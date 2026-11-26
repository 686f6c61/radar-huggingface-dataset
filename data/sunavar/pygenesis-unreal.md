# SuNavar/Pygenesis-Unreal

## Resumen

Pygenesis Unreal es un ajuste fino de dominio de Llama 3.1 8B Instruct orientado especificamente a Unreal Engine 5. Lo desarrolla la Asociacion Pygenesis y lo publica el usuario SuNavar en Hugging Face. El modelo resuelve un problema muy concreto: generar borradores de grafos de Blueprint en formato JSON propietario (BP-Lite), presets de iluminacion (Lighting-Spec) y explicaciones breves de UE5, todo ello en espanol y ejecutable de forma local.

Tecnicamente es un transformer causal denso de 8.030 millones de parametros, adaptado mediante QLoRA de 4 bits sobre `meta-llama/Llama-3.1-8B-Instruct` y publicado unicamente como GGUF Q4_K_M para llama.cpp. La ventana de contexto objetivo del proyecto es de 4.096 tokens. No es un modelo generalista: la propia model card lo excluye explicitamente como chatbot, agente de codigo o sustituto de la documentacion de Epic.

Su relevancia actual es la de un ejemplo de modelo vertical pequeno y ejecutable en local para asistentes dentro de herramientas DCC (Digital Content Creation). El Editor de Unreal no carga el GGUF directamente: se necesita un puente FastAPI local y un plugin de editor que transforme el JSON en nodos de Blueprint o en ajustes de iluminacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Llama 3.1), ajuste QLoRA |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (objetivo del proyecto) |
| Tipos de cuantizacion | Q4_K_M (unico publicado) |
| Idiomas soportados | es, en (respuestas en espanol; nombres de nodos y pines en ingles) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (`pygenesis-unreal-q4km.gguf`); el repo ocupa 4,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct, un transformer decoder-only denso con 8.030 millones de parametros y plantilla de chat Instruct propia. El ajuste se realizo con QLoRA de 4 bits sobre conversaciones en formato ShareGPT centradas en Blueprints, iluminacion y resolucion de problemas de UE5. El adaptador se fusiono en un modelo completo en Hugging Face, se exporto a GGUF f16 y se cuantizo con `llama-quantize` a Q4_K_M, que es el unico artefacto publicado.

El conjunto de datos documentado es pequeno: aproximadamente 1.309 conversaciones de entrenamiento y 231 de evaluacion, mezclando turnos sinteticos de ShareGPT con extractos de manuales oficiales de Epic. El prompt de sistema usado durante el entrenamiento se denomina `UNREAL_SYSTEM`. No hay dataset card publica ni el GGUF incluye el dataset. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional; la unica "especialidad" es el formato de salida estructurado (BP-Lite y Lighting-Spec) y el uso de nombres de nodos de Unreal en ingles dentro de JSON, con prosa en espanol.

## Capacidades

- Generacion de grafos de Blueprint en formato BP-Lite JSON: un unico objeto con `graph_name`, `nodes` y cables de ejecucion.
- Generacion de presets de iluminacion en formato Lighting-Spec JSON: `environment_type`, luz direccional, niebla y post-proceso.
- Explicaciones breves de UE5 en espanol para dudas de troubleshooting.
- Salida estructurada consistente en JSON (un objeto por respuesta) cuando la peticion es de grafo o iluminacion.
- Uso de nomenclatura nativa de Unreal (nombres de nodos y pines en ingles) dentro de las estructuras JSON.
- Soporte bilingue de facto: entrada y salida en espanol, identificadores tecnicos en ingles.
- Inferencia 100 % local una vez descargado el GGUF; no envia prompts a servicios de Epic ni a terceros.
- No soporta tool calling generico, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Borrador de grafos de Blueprint en el editor: el desarrollador describe en espanol el comportamiento deseado y el modelo devuelve un objeto BP-Lite que el plugin de Pygenesis convierte en nodos. Es adecuado porque el modelo esta entrenado especificamente en ese esquema JSON y en nombres de nodos de UE5.
- Configuracion rapida de iluminacion de escena: se pide un preset (por ejemplo, exterior al atardecer con niebla volumetrica) y el modelo devuelve un Lighting-Spec que el plugin aplica a la luz direccional, la niebla y el post-proceso del nivel.
- Asistencia de troubleshooting en UE5: consultas cortas sobre errores comunes, ajustes de proyecto o comportamiento de actores, respondidas en espanol y sin salir de la maquina del desarrollador.
- Prototipado en equipos con requisitos de confidencialidad: al ejecutarse con llama.cpp en local, el codigo y los prompts del estudio no salen del puesto de trabajo, lo que encaja en estudios con NDA estrictos.
- Formacion y onboarding de artistas tecnicos: el modelo sirve como apoyo para explicar conceptos de Blueprints e iluminacion en espanol dentro del propio editor, sin depender de documentacion en ingles.
- Iteracion rapida sobre grafos existentes: el plugin puede pedir al modelo que continue un grafo que se cerro demasiado pronto, manteniendo el contexto de la conversacion dentro de los 4.096 tokens.
- Integracion en pipelines internos de estudio: a traves del puente FastAPI se puede invocar el GGUF desde scripts propios para generar borradores de grafos o presets que luego se revisan manualmente antes de aplicarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de validez de grafos o de JSON. Solo se documenta el tamano del conjunto de evaluacion (231 conversaciones), sin resultados asociados.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, aproximadamente 5-6 GB para los pesos mas overhead de contexto; con 4.096 tokens de contexto, un presupuesto realista de 6-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, A100 y H100 funcionan sin problema. En A100/H100 el modelo queda muy infrautilizado.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas. Tambien puede ejecutarse en CPU con llama.cpp a velocidad reducida.
- Opciones de despliegue: llama.cpp y `llama-cpp-python` son los soportados explicitamente por el autor; Ollama puede cargar el GGUF directamente. vLLM y TGI no soportan GGUF Q4_K_M de forma nativa sin conversion a otro formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Pygenesis Unreal | 8,03 B | 4.096 | GGUF Q4_K_M | Llama 3.1 Community | Asistente UE5 (Blueprint + iluminacion) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 | safetensors, GGUF | Llama 3.1 Community | Proposito general, sin especializacion UE5 |
| Mistral-7B-Instruct | 7,24 B | 32.768 | safetensors, GGUF | Apache-2.0 | Proposito general, alternativa con licencia permisiva |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 | safetensors, GGUF | Apache-2.0 | Codigo y generacion estructurada, sin conocimiento UE5 especifico |

La ventaja de Pygenesis Unreal frente a estos modelos es la adherencia al esquema BP-Lite/Lighting-Spec y el vocabulario de nodos de UE5, que no estan presentes en los modelos generalistas. Su desventaja es un contexto mucho menor (4.096 frente a 32.768 o 131.072) y una licencia mas restrictiva que Apache-2.0.

## Limitaciones y advertencias

- Hereda los sesgos de entrenamiento de Llama 3.1 y anade los de un corpus de Unreal muy pequeno y parcialmente sintetico.
- Puede cerrar un grafo antes de cubrir toda la peticion, repetir claves JSON o seguir escribiendo despues de cerrar el objeto.
- Puede inventar nombres de pines o funciones que no existen en UE5; el plugin debe rechazar funciones no resueltas.
- La cuantizacion Q4_K_M es con perdida respecto a los pesos fusionados en 16 bits.
- El conjunto de entrenamiento documentado es de aproximadamente 1.309 conversaciones, con 231 de evaluacion; el riesgo de sobreajuste y de respuestas con tono "oficial" pero incorrectas es real.
- Aplicar un grafo erroneo en el Editor modifica el proyecto abierto; hay que revisar el JSON antes de aplicarlo.
- La licencia Llama 3.1 Community impone restricciones de uso comercial y obliga a aceptar la licencia en `meta-llama/Llama-3.1-8B-Instruct` antes de usar el modelo.
- Fuera de alcance segun el autor: chatbot generalista, agente de codigo, sustituto de la documentacion de Epic, compilacion de proyectos o escritura de C++ de produccion.
- Contexto limitado a 4.096 tokens: no apto para conversaciones largas ni para analisis de proyectos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SuNavar/Pygenesis-Unreal
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio del proyecto: https://github.com/Asociacion-Pygenesis/Pygenesis_Unreal
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Plantilla de model card usada: https://github.com/huggingface/huggingface_hub/blob/main/src/huggingface_hub/templates/modelcard_template.md?plain=1
- Paper: no disponible
- Demo publica: no disponible (demo local dentro del Editor de Unreal)
