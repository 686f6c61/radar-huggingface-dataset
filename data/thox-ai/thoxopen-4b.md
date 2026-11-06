# Thox-ai/ThoxOpen-4B

## Resumen

ThoxOpen-4B es un paquete de distribucion publicado por Thox-ai sobre los pesos sin modificar de Qwen/Qwen3-4B. No se trata de un fine-tune ni de un modelo entrenado por THOX: el repositorio contiene unicamente un `Modelfile` de Ollama, un `manifest.json` de release y un fichero JSONL de 4,6 KB con el denominado THOX Knowledge Pack v0.1 (8 entradas publicas verificadas). Los pesos reales se descargan desde el tag fijado `qwen3:4b` de Ollama, con digest `sha256:359d7dd4...` y 2,5 GB.

El objetivo declarado es el despliegue local en hardware modesto (portatiles de 4 vCPU y 8 GB de RAM, sin GPU) para ThoxChat y MeshStack Desktop a traves del endpoint local compatible con OpenAI que expone Ollama. THOX anade un perfil de sistema que fuerza respuestas directas y control por parte del usuario, y un pack de conocimiento para recuperacion local, pero la arquitectura, el entrenamiento y las capacidades cognitivas son integramente las de Qwen3-4B.

Su relevancia practica es limitada pero concreta: sirve como ejemplo de empaquetado reproducible de un modelo abierto para inferencia offline en CPU, con mediciones de rendimiento publicadas por el propio autor (10,74 tok/s en generacion larga, 3,89 GB de RAM residente) y una limitacion documentada relevante: con el modo de razonamiento hibrido activado, el modelo puede consumir todo el presupuesto de generacion en el canal de pensamiento y devolver una respuesta final vacia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); no disponible el detalle fino de capas y dimensiones en la informacion proporcionada |
| Parametros totales | 4B (aproximado, segun denominacion del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en la evaluacion publicada; no se especifica el maximo nativo de Qwen3-4B en la informacion disponible |
| Tipos de cuantizacion | No disponible de forma explicita; el tag de Ollama empleado pesa 2,5 GB, lo que corresponde a una cuantizacion de 4-5 bits |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base Qwen3-4B es multilingue, pero esta release solo declara `en` |
| Licencia | Apache-2.0 (heredada de Qwen3; conservar el aviso Apache) |
| Formato de pesos | Pesos gestionados por Ollama (blobs); el repositorio contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl`, no safetensors ni GGUF directos |

## Arquitectura y entrenamiento

No hay entrenamiento. La release es una derivacion por configuracion: se parte del tag `qwen3:4b` de Ollama y se aplica un perfil de sistema (`profiles/SYSTEM-open.txt`) que define el comportamiento conversacional (respuestas directas, control del usuario) y se adjunta el THOX Knowledge Pack v0.1 para recuperacion local. La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only con modo de razonamiento hibrido (thinking on/off) heredado del modelo base.

El autor declara explicitamente que no es un fine-tune de rechazo minimo ni un modelo sin censura: el comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema. Tampoco se documentan datos de entrenamiento, tokens vistos, RLHF ni DPO, porque no se ha realizado ninguna fase de ajuste. La innovacion tecnica del paquete es de ingenieria de distribucion (pin de version, manifiesto de release, pack de conocimiento versionado), no de modelado.

## Capacidades

- Generacion de texto, respuesta a preguntas, redaccion y resumen en ingles.
- Razonamiento hibrido con canal de pensamiento activable o desactivable (heredado de Qwen3).
- Recuperacion local sobre el THOX Knowledge Pack v0.1 (8 entradas: marca, campana, dispositivos, resultados publicados, MeshStack, ThoxMind, politica de enrutado, privacidad).
- Respuesta a preguntas de "fabrica" sobre la propia marca y su politica de enrutado, con etiquetado explicito de recomendaciones.
- Declinacion de peticiones que requieren verificacion de estado en vivo (el modelo no puede confirmar topologia o estado de nodos en tiempo real).
- Endpoint local compatible con OpenAI via Ollama para integracion en ThoxChat y MeshStack Desktop.
- Funcionamiento totalmente offline y autonomo.
- No se documentan capacidades de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion proporcionada.

## Casos de uso

- Asistente local en portatil de gama media: con 3,89 GB de RAM residente y 2,5 GB de pesos, cabe en equipos de 8 GB sin GPU y permite consultas rapidas, borradores y resumenes sin conexion.
- Redaccion y resumen de documentos cortos en ingles: adecuado para tareas de un solo turno donde la latencia de 10-20 tok/s resulta aceptable en CPU.
- Enrutado y triaje de peticiones: el modelo responde correctamente a preguntas sobre politica de enrutado y etiqueta sus recomendaciones, lo que permite usarlo como clasificador preliminar en flujos de ThoxChat.
- Base para demostraciones de empaquetado reproducible: el `Modelfile` y el `manifest.json` permiten reconstruir la release con `ollama create` y auditar el pin de pesos, util para equipos que necesitan trazabilidad de la version desplegada.
- Recuperacion sobre un corpus pequeno y controlado: el Knowledge Pack v0.1 (8 entradas) sirve como ejemplo de grounding local para preguntas frecuentes de producto o marca.
- Prototipado de asistentes offline en entornos restringidos: al no requerir red ni GPU, encaja en escenarios de privacidad estricta donde el documento no debe salir de la maquina.
- Evaluacion comparativa de tiers: sirve como referencia de la clase 4B frente a ThoxOpen-8B y ThoxOpen-14B para decidir el tamano minimo viable en un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica mediciones de smoke test y rendimiento del build host, no comparables con benchmarks academicos:

| Metrica | Valor | Entorno |
|---|---|---|
| Carga del modelo | Correcta | 4 vCPU / 8 GB RAM, x86_64, sin GPU |
| Huella residente en carga | 3,89 GB RAM | Mismo entorno |
| Throughput generacion larga (1.024 tokens) | 10,74 tok/s | Mismo entorno |
| Throughput respuestas cortas, thinking on | 9,8-11,9 tok/s | Mismo entorno |
| Throughput respuestas cortas, thinking off | 17-20 tok/s | Mismo entorno |
| Smoke suite de preguntas de marca | 3/3 | Mismo entorno |
| Grounding sobre Knowledge Pack v0.1 | 8/8 temas | Mismo entorno |
| Trampa de topologia fabricada | Declinada correctamente | Mismo entorno |
| Pregunta de enrutado | Recomendacion etiquetada | Mismo entorno |

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario medido (inferencia en CPU); con GPU, la huella de pesos de 2,5 GB permite ejecucion holgada en tarjetas de 6-8 GB.
- RAM: 3,89 GB residentes medidos en carga; se recomienda un minimo de 8 GB de RAM en el sistema.
- GPU recomendadas: no se documentan; el caso de uso declarado es CPU. Cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) puede alojar los pesos sin problema, aunque no hay mediciones publicadas en GPU.
- Cabe en GPU consumer: si, por tamano de pesos (2,5 GB), aunque el autor no lo haya cualificado.
- Opciones de despliegue: Ollama (via `ollama run Thox-ai/thoxopen-4b` o build local con `ollama create`); endpoint local compatible con OpenAI para ThoxChat y MeshStack Desktop. No se documentan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 10,74 tok/s en generacion de 1.024 tokens; 9,8-11,9 tok/s con thinking activo y 17-20 tok/s con thinking desactivado, en CPU de 4 vCPU.
- Limitacion operativa: con thinking activado y presupuesto acotado (768 tokens), dos items del smoke test devolvieron respuesta final vacia; se recomienda thinking desactivado o presupuestos generosos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOpen-4B | 4B | 8.192 tokens (evaluado) | No (configuracion sobre Qwen3-4B) | Apache-2.0 | Ollama y Hugging Face |
| Qwen/Qwen3-4B | 4B | No disponible en la informacion proporcionada | Si (modelo base) | Apache-2.0 | Hugging Face y Ollama (`qwen3:4b`) |
| ThoxOpen-8B | 8B | No disponible | No (tier superior de la misma familia) | No disponible | No disponible |
| ThoxOpen-14B | 14B | No disponible | No (tier superior de la misma familia) | No disponible | No disponible |

La comparativa relevante es contra el propio Qwen3-4B: ThoxOpen-4B no mejora las capacidades del base, solo anade perfil de sistema, pack de conocimiento y empaquetado reproducible. Frente a los tiers 8B y 14B de la misma familia, el autor reconoce razonamiento y recall materialmente inferiores.

## Limitaciones y advertencias

- No es un modelo sin censura ni de rechazo minimo: el comportamiento de rechazo es el de Qwen3-4B, moderado solo por el perfil de sistema. No debe comercializarse como "uncensored".
- Riesgo de respuesta vacia: con thinking hibrido activado y presupuesto acotado, el modelo puede agotar la generacion en el canal de pensamiento y no emitir respuesta final (observado en 2 items del smoke test a 768 tokens).
- Capacidad de razonamiento y recall limitada por el tamano: 4B es materialmente inferior a los tiers 8B y 14B de la misma familia; tratar sus respuestas en consecuencia.
- Conocimiento restringido al pack suministrado (8 entradas) y a la recuperacion local; fuera de ese ambito depende del conocimiento parametrico de Qwen3-4B.
- No puede verificar estado en vivo: declina correctamente peticiones de confirmacion de topologia o estado de nodos en tiempo real.
- Idioma: la release solo declara ingles, aunque el modelo base es multilingue; no hay evaluacion multilingue publicada para esta configuracion.
- Acciones externas requieren autorizacion del runtime THOX; el modelo por si solo no ejecuta operaciones.
- Las mediciones publicadas son smoke tests de build host, no una cualificacion de dispositivo ni un benchmark general.
- Licencia Apache-2.0: uso comercial permitido conservando el aviso Apache; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) quedan bajo la misma licencia declarada en el repositorio.
- Repositorio sin descargas ni likes en el momento de la consulta; ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOpen-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Tag de Ollama del base: `qwen3:4b` (digest `sha256:359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7`)
- Modelo publicado en Ollama: `Thox-ai/thoxopen-4b`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
