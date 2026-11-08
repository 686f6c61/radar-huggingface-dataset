# XxKaitoxX/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, disenado para razonamiento de alta complejidad, tareas agenticas y casos de uso generales de produccion. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de 117 mil millones de parametros totales y 5.100 millones de parametros activos por token, lo que le permite caber en una unica GPU de 80 GB (NVIDIA H100 o AMD MI300X) gracias a la cuantizacion MXFP4 aplicada a los pesos del MoE durante el post-entrenamiento.

El modelo forma parte de la serie gpt-oss junto a su version menor gpt-oss-20b, y se distribuye bajo licencia Apache 2.0, lo que elimina restricciones de copyleft y riesgos de patentes para uso comercial. Emplea el formato de respuesta harmony de OpenAI, que debe aplicarse obligatoriamente para que el modelo funcione correctamente, y expone la cadena de pensamiento completa para facilitar la depuracion.

La ficha corresponde a la republicacion del modelo original `openai/gpt-oss-120b` por parte del usuario XxKaitoxX en Hugging Face, con 116.829.156.672 parametros confirmados en los safetensors y un tamano de repositorio de 195,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 116.829.156.672 (117B) |
| Parametros activos | 5.100 millones (5.1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos del MoE), 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-120b emplea una arquitectura transformer con mezcla de expertos (MoE), con 117B parametros totales y 5.1B activos por token. Los pesos del MoE fueron post-entrenados con cuantizacion MXFP4, lo que permite que el modelo completo se ejecute en una unica GPU de 80 GB. El modelo fue entrenado sobre el formato de respuesta harmony de OpenAI, un formato estructurado que gestiona los turnos de conversacion, el razonamiento y las llamadas a herramientas, y que debe aplicarse de forma obligatoria para el correcto funcionamiento del modelo.

El modelo incorpora un esfuerzo de razonamiento configurable (bajo, medio, alto) que permite ajustar la latencia y la profundidad del razonamiento segun el caso de uso, y expone la cadena de pensamiento completa. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni los detalles de las fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de alta complejidad con esfuerzo configurable (low, medium, high).
- Cadena de pensamiento completa accesible para depuracion (no destinada a mostrarse al usuario final).
- Capacidades agenticas nativas: function calling, navegacion web y ejecucion de codigo Python.
- Salidas estructuradas (Structured Outputs).
- Ajuste fino completo mediante fine-tuning de parametros.
- Compatibilidad con el formato harmony para conversaciones multi-turno y gestion de herramientas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento de alta complejidad en produccion: el modelo puede resolver problemas que requieren cadenas de pensamiento largas gracias al esfuerzo de razonamiento configurable en nivel alto, adecuado para analisis tecnico y cientifico.
- Agentes autonomos con herramientas: su soporte nativo de function calling, navegacion web y ejecucion de Python permite construir agentes que consultan APIs, buscan informacion y ejecutan codigo en un bucle multi-paso.
- Generacion y ejecucion de codigo: la capacidad de ejecutar Python de forma nativa lo hace adecuado para pipelines de analisis de datos y automatizacion de tareas de desarrollo.
- Atencion al cliente automatizada: el formato harmony y el soporte conversacional permiten gestionar dialogos multi-turno con integracion de herramientas de backoffice.
- Extraccion de datos estructurados: las Structured Outputs permiten generar JSON u otros formatos validables directamente en pipelines de ingestion de datos.
- Despliegue en infraestructura propia: al caber en una unica GPU H100 o MI300X con MXFP4, es viable para organizaciones que necesitan inferencia on-premise sin depender de APIs externas.
- Fine-tuning para dominios especializados: la licencia Apache 2.0 y el soporte de ajuste fino permiten adaptar el modelo a vocabularios y tareas verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 GB con cuantizacion MXFP4 (el modelo esta disenado para caber en una unica GPU de 80 GB).
- GPU recomendadas: NVIDIA H100 (80 GB) y AMD MI300X (80 GB) para produccion.
- GPU de consumo: el modelo de 120B no cabe en GPUs de consumo convencionales; la version gpt-oss-20b esta disenada para ejecutarse en 16 GB de memoria. Ollama ofrece `gpt-oss:120b` para hardware de consumo, aunque los requisitos reales no se detallan en la informacion disponible.
- Opciones de despliegue: Transformers (pipeline y `transformers serve`), vLLM (version 0.10.1+gptoss con wheels especificos), PyTorch/Triton (implementaciones de referencia), Ollama y LM Studio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-120b | 117B | 5.1B | no disponible | Apache 2.0 | Hugging Face, Ollama, LM Studio, vLLM |
| gpt-oss-20b | 21B | 3.6B | no disponible | Apache 2.0 | Hugging Face, Ollama, LM Studio |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo debe usarse obligatoriamente con el formato harmony; de lo contrario no funciona correctamente.
- La cadena de pensamiento completa no esta pensada para mostrarse al usuario final.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion proporcionada.
- La longitud de contexto no esta disponible en la informacion proporcionada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- La licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, pero conviene verificar los terminos de la model card original de OpenAI.
- Esta ficha corresponde a una republicacion por el usuario XxKaitoxX con 0 descargas y 0 likes; para produccion se recomienda usar el repositorio oficial `openai/gpt-oss-120b`.
- El repositorio tiene un tamano de 195,8 GB, lo que requiere espacio de almacenamiento considerable para su descarga.

## Enlaces

- Hugging Face (republicacion): https://huggingface.co/XxKaitoxX/gpt-oss-120b
- Hugging Face (oficial): https://huggingface.co/openai/gpt-oss-120b
- Coleccion gpt-oss en Hugging Face: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Sitio oficial: https://gpt-oss.com
- Guias (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Paper / model card: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Repositorio harmony: https://github.com/openai/harmony
- Repositorio gpt-oss: https://github.com/openai/gpt-oss
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Documentacion API: https://developers.openai.com/api/docs/models/gpt-oss-120b
- GitHub gpt-oss-120b: https://github.com/gpt-oss/gpt-oss-120b
- Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
