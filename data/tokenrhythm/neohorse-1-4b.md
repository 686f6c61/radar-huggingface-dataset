# TokenRhythm/NeoHorse-1-4B

## Resumen

NeoHorse-1-4B es un modelo de lenguaje causal de aproximadamente 4.200 millones de parámetros desarrollado por TokenRhythm como prototipo inicial hacia la auto-mejora recursiva (RSI). Está post-entrenado a partir de Qwen/Qwen3.5-4B para tareas de agentes de texto, uso de herramientas, programación y seguimiento de instrucciones. Se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamaño de repo de 8,4 GB. Aunque el modelo base Qwen3.5 puede incluir capacidades multimodales, esta versión contiene únicamente pesos de lenguaje y está empaquetada para inferencia de texto. Su relevancia radica en un enfoque de post-entrenamiento agentico: un routing harness asigna tareas a un pool heterogéneo de modelos, registra interacciones y resultados, estima la demanda de capacidad y usa retroalimentación a nivel de capacidad para conformar la siguiente mezcla de entrenamiento, cerrando un bucle de evaluación-selección-actualización que pretende avanzar hacia la auto-mejora recursiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repo | 8,4 GB |

## Arquitectura y entrenamiento

NeoHorse-1-4B es un transformer causal decoder-only derivado de Qwen3.5-4B. El post-entrenamiento se centra en agentes de texto, uso de herramientas, programación y seguimiento de instrucciones. El framework de entrenamiento incluye SFT guiado por routing y destilación on-policy guiada por routing, que convierten trayectorias de ejecución en señal de entrenamiento preservando el contexto de ejecución y del harness alrededor de cada respuesta. El routing harness asigna tareas a un pool heterogéneo de modelos, registra interacciones y resultados, estima la demanda de capacidad y utiliza retroalimentación a nivel de capacidad para conformar la siguiente mezcla de entrenamiento. Este enfoque cierra un bucle de evaluación-selección-actualización, considerado el siguiente paso hacia la auto-mejora recursiva.

En cuanto a los datos de entrenamiento, no se han publicado cifras de tokens ni la composición exacta del dataset. El modelo card indica que se aplicaron técnicas de calidad de datos como eliminación de duplicados exactos y casi-duplicados, decontaminación de evaluación, validación estructural, evaluación semántica en seis dimensiones y etiquetado a nivel de subescena con Scene/Goal/Outcome. El release contiene solo pesos de lenguaje; los pesos de visión del modelo base no están incluidos, y el repackaging cambia la configuración y los nombres de los tensores sin alterar los valores de los tensores.

## Capacidades

- Generación de texto y seguimiento de instrucciones: post-entrenado para instruction-following en entornos de agentes.
- Uso de herramientas (tool calling): soporta interacción con herramientas externas, lo que permite integrarlo en pipelines agenticos.
- Programación: entrenado para tareas de coding.
- Razonamiento: capacidades de reasoning, con soporte para razonamiento multi-paso.
- Agentes: diseñado para harness de agentes, con preservación del contexto de ejecución.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no incluida en este release; el modelo es solo de texto.
- Modo de pensamiento: no disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno y utilizar tool calling para consultar APIs de ticketing, bases de conocimiento o sistemas de gestión de pedidos, gracias a su post-entrenamiento agentico.
- Generación de código en producción: al estar entrenado para coding y soportar tool calling, puede integrarse en pipelines de CI/CD para revisar, generar o refactorizar código, y ejecutar comandos o scripts mediante herramientas.
- Orquestación de agentes: el routing harness y el post-entrenamiento agentico permiten utilizarlo como planificador o ejecutor en sistemas complejos que requieren razonamiento multi-paso y acceso a múltiples herramientas.
- Asistentes de desarrollo en IDE: puede usarse para sugerir cambios, consultar documentación o ejecutar pruebas, aprovechando su capacidad de tool use y su entrenamiento en instrucciones.
- Análisis de trayectorias de ejecución: el modelo está entrenado para preservar el contexto de ejecución, lo que lo hace adecuado para registrar, depurar y analizar interacciones de agentes en sistemas de automatización.
- Automatización de flujos de datos: puede integrarse en sistemas de automatización que requieren razonamiento sobre instrucciones, llamadas a funciones y gestión de estado, gracias a su capacidad de agentes y tool calling.

## Benchmarks y rendimiento

El modelo card reporta un macro promedio de 64,87 en diez benchmarks frente a 58,94 del modelo base Qwen3.5-4B, lo que supone una mejora de +5,93. No se ha publicado el desglose por benchmark en el texto disponible; la figura del modelo card muestra los resultados completos.

| Benchmark | NeoHorse-1-4B | Qwen3.5-4B |
|---|---|---|
| Macro promedio (10 benchmarks) | 64,87 | 58,94 |

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware. A partir del tamaño de los pesos (8,4 GB en safetensors), se puede estimar:
- VRAM estimada para inferencia: ~10-12 GB con pesos en FP16; ~5 GB con cuantización INT8; ~3 GB con cuantización INT4. Estas cifras son estimaciones orientativas y dependen del contexto y del backend.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para FP16 sin cuantizar. En GPUs de consumo con 12-16 GB se puede ejecutar con cuantización.
- Compatibilidad con consumer GPUs: sí, con cuantización (p. ej., RTX 3060 12 GB, RTX 4070).
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama (importando el modelo) y transformers con Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NeoHorse-1-4B | ~4,2B | No disponible | Apache 2.0 | Hugging Face |
| Qwen3.5-4B | ~4B | No disponible | No disponible (presumiblemente Apache 2.0) | Hugging Face |

En rendimiento, NeoHorse-1-4B supera a Qwen3.5-4B en el macro promedio de diez benchmarks (64,87 frente a 58,94). No se han identificado otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- El release no incluye pesos de visión; el modelo es solo de texto.
- No se han publicado datos sobre idiomas soportados, longitud de contexto ni tipos de cuantización disponibles.
- Al ser un prototipo inicial hacia la auto-mejora recursiva, su comportamiento en tareas fuera del dominio de post-entrenamiento puede ser limitado.
- Existe riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.5-4B para asegurar el cumplimiento.
- No se proporcionan requisitos oficiales de hardware ni benchmarks detallados.

## Enlaces

- Hugging Face: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- GitHub: https://github.com/TokenRhythm/NeoHorse
- Technical Report: https://github.com/TokenRhythm/NeoHorse/blob/main/TechnicalReport_NeoHorse_v1.pdf
- Sitio web: https://tokenrhythm.ai/
- Twitter/X: https://x.com/opensquilla
