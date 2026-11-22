# Thox-ai/ThoxNano-135M

## Resumen

ThoxNano-135M es un ajuste fino (fine-tune) del modelo base SmolLM-135M de HuggingFaceTB, desarrollado por Thox-ai como el modelo de menor tamano de su linea de dispositivos THOX, destinado al nivel "ThoxKey". Se trata de un LoRA de rango 32 entrenado sobre un corpus propio de 982 ejemplos de chat, uso de herramientas y factualidad, fusionado posteriormente en los pesos base. Con 134.515.008 parametros reales, es un modelo de generacion de texto orientado a inferencia en dispositivo (on-device) y entornos edge.

El modelo resuelve un problema muy concreto: proporcionar respuestas conversacionales muy cortas y enrutamiento de intenciones en hardware de bajos recursos, delegando el conocimiento factual a la capa de servicio (grounding) y a nodos de mayor tamano dentro de una arquitectura de malla (mesh) que el autor denomina MeshStack. No esta pensado como fuente autonoma de conocimiento, sino como componente ligero de una arquitectura mayor.

Su relevancia actual reside en su tamano extremo y su licencia Apache-2.0, que lo hacen desplegable en practicamente cualquier hardware, incluido movil o embebido, con pesos disponibles en safetensors y GGUF Q4_K_M. No obstante, el propio autor reconoce un techo de capacidad muy bajo y un resultado debil en su evaluacion de factualidad (23/49), por lo que debe evaluarse como pieza de infraestructura y no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M; safetensors en precision original |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (269.060.552 B), GGUF Q4_K_M (105.453.888 B), Modelfile de Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM-135M, un transformer decoder-only de la familia SmolLM de HuggingFaceTB. Sobre esa base, Thox-ai aplico un ajuste fino mediante LoRA de rango 32 sobre un corpus propio de 982 ejemplos que combina conversacion, uso de herramientas (tool-use) y factualidad. Posteriormente, los adaptadores LoRA se fusionaron en los pesos base, dando lugar a los pesos publicados en el repositorio. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

El repositorio incluye los pesos completos en safetensors, una cuantizacion GGUF Q4_K_M, el tokenizer, la plantilla de chat (`chat_template.jinja`), el `Modelfile` para Ollama y un `training_summary.json`. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el interes del modelo es su tamano y su integracion en el ecosistema THOX, no novedades arquitectonicas.

## Capacidades

- Generacion de texto conversacional de respuesta muy corta, orientada a intercambios triviales.
- Enrutamiento de intenciones (routing intents) dentro de la arquitectura de malla THOX.
- Uso de herramientas (tool-use), segun el corpus de entrenamiento declarado.
- Capacidad de abstencion ante preguntas factuales, ponderada en la evaluacion GATE49.
- Soporte de plantilla de chat propia (`chat_template.jinja`).
- Integracion con Ollama mediante Modelfile incluido.
- Capacidades multilingues: limitadas al ingles.
- No se declaran capacidades de vision, audio, codigo avanzado ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de intenciones en dispositivos ThoxKey: el modelo clasifica y deriva peticiones breves hacia el nodo adecuado de la malla, aprovechando su tamano minimo para ejecutarse en hardware muy limitado.
- Respuestas conversacionales triviales en asistentes embebidos: gestion de saludos, confirmaciones y respuestas de una o dos frases donde no se requiere conocimiento factual.
- Componente de preprocesamiento en pipelines locales: normalizacion o reformulacion de entradas de usuario antes de enviarlas a un modelo mayor en la malla.
- Demostraciones y prototipos de IA local-first: validacion de flujos de inferencia en dispositivo con Ollama sin depender de la nube.
- Pruebas de integracion de tool calling en entornos edge: verificacion de la plantilla de chat y del formato de llamadas a herramientas en dispositivos con recursos restringidos.
- Filtro o clasificador ligero previo: descarte rapido de consultas fuera de dominio antes de invocar modelos mayores, reduciendo coste computacional en la malla.
- Educacion e investigacion sobre ajuste fino de modelos diminutos: ejemplo reproducible de LoRA de rango 32 fusionado sobre SmolLM-135M con licencia permisiva.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---:|
| THOX GATE49 (factualidad, conjunto de desarrollo, ponderado por abstencion) | 23/49 — media 3.0/5 |
| Fallos graves (hard failures) | 10 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de evaluacion es el GATE49 propio del autor, que este mismo califica como debil y esperable en esta escala. No se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q4_K_M (105 MB de pesos) y en torno a 270 MB en safetensors en precision original; el consumo real dependera del runtime y del contexto.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 3050 o superiores.
- Cabe en GPU consumer: si, sin restricciones practicas por memoria.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxnano-135m`), llama.cpp con el GGUF Q4_K_M, y descarga directa desde Hugging Face para runtimes compatibles con safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota del autor: esta build no ha sido cualificada en hardware de dispositivos ThoxKey.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ThoxNano-135M | 134,5 M | no disponible | Apache-2.0 | Fine-tune de SmolLM-135M con corpus propio; GGUF Q4_K_M y Ollama |
| SmolLM-135M (base) | 135 M | no disponible | Apache-2.0 | Modelo base; sin ajuste conversacional especifico de THOX |
| SmolLM2-135M | 135 M | no disponible | Apache-2.0 | Generacion posterior de la familia SmolLM de HuggingFaceTB |
| Qwen2.5-0.5B | 0,5 B | no disponible | Apache-2.0 | Alternativa de mayor tamano, con mas capacidad general |

Los datos de contexto y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Techo de capacidad muy bajo por su tamano: respuestas cortas y superficiales, con ecos ocasionales de plantilla.
- Respuestas factuales poco fiables desde los pesos desnudos; el autor exige grounding en la capa de servicio para cualquier dato de THOX.
- Resultado debil en la evaluacion propia de factualidad (23/49, 10 fallos graves).
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- No cualificado en hardware de dispositivos ThoxKey, segun el propio autor.
- Uso fuera de alcance: decisiones sanitarias, legales o de seguridad sin supervision humana, y uso como fuente autonoma de hechos.
- Riesgo de sesgos y alucinaciones inherente a un modelo de 135M entrenado con un corpus reducido de 982 ejemplos; no se documentan analisis de sesgo.
- La model card incluye material promocional de una campana de Kickstarter; conviene separar esa informacion de las especificaciones tecnicas.
- Licencia Apache-2.0 permisiva para uso comercial, sin restricciones adicionales declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxNano-135M
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Demo de dispositivos virtuales THOX: https://thox.ai/#demo-callout-home_lineup
- Campana de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
