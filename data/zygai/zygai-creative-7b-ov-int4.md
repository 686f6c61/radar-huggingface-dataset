# ZygAI/ZygAI-Creative-7B-ov-int4

## Resumen

ZygAI-Creative-7B-ov-int4 es una distribución del modelo Qwen2.5-7B-Instruct convertida a formato OpenVINO en cuantización INT4 simétrica (tamaño de grupo 128) y orientada a escritura creativa. Lo publica ZygAI, un proyecto que reutiliza el build INT4 oficial del equipo de OpenVINO (`OpenVINO/Qwen2.5-7B-Instruct-int4-ov`) sin aplicar ningún ajuste fino: el comportamiento "creativo" proviene exclusivamente de un system prompt literario que el autor recomienda inyectar en tiempo de inferencia. El resultado es un artefacto ligero (4,5 GB de repositorio) pensado para ejecutarse en CPU Intel sin GPU dedicada.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens en su versión original. Su interés práctico reside en la combinación de tres factores: una licencia Apache 2.0 sin restricciones comerciales, un empaquetado OpenVINO que elimina la fricción de despliegue en hardware de consumo y un conjunto de instrucciones de sistema probado para tareas de ficción.

La relevancia es acotada pero concreta: cubre el nicho de generación literaria local en equipos modestos (un i5-1235U con 16 GB de RAM alcanza unas 6 tok/s), a costa de renunciar al ajuste fino real y de un rendimiento multilingüe limitado, ya que la model card declara únicamente inglés como idioma soportado y advierte que funciona mejor en esa lengua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | Aproximadamente 7,6 mil millones (modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct; no verificada en el artefacto OpenVINO) |
| Tipos de cuantizacion | INT4 simetrica con tamano de grupo 128 (formato OpenVINO IR) |
| Idiomas soportados | Ingles (declarado); el prompt recomienda escribir en el idioma del usuario, pero el autor advierte que rinde mejor en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (INT4), consumible via `openvino-genai` |

## Arquitectura y entrenamiento

El artefacto no introduce cambios arquitectónicos sobre Qwen2.5-7B-Instruct: es un transformer decoder-only estándar de la familia Qwen2, con atención completa y sin mecanismos híbridos ni decodificación especulativa. La única transformación aplicada es la conversión a OpenVINO IR con pesos INT4 simétricos y group size 128, realizada por el equipo de OpenVINO y reutilizada tal cual por ZygAI. No hay destilación, pruning ni fusión de capas documentada.

El entrenamiento subyacente es el de Qwen2.5-7B-Instruct, que incluye preentrenamiento a gran escala seguido de ajuste supervisado e instrucción alineada; la model card de ZygAI no aporta cifras de tokens, composición del dataset ni detalles sobre RLHF o DPO. El autor declara explícitamente que no pudo realizar ajuste fino por limitaciones de hardware (una portátil con CPU y 16 GB de RAM), por lo que el comportamiento creativo se obtiene mediante prompting: un system message que instruye al modelo a planificar en silencio, mantener consistencia de nombres y hechos, mostrar en lugar de explicar, limitar el reparto a 2-3 personajes y cerrar con una imagen concreta. Los parámetros de muestreo recomendados son temperature 0.8, top_p 0.92, repetition_penalty 1.08 y max_new_tokens 700.

## Capacidades

- Generación de texto y ficción literaria: relatos cortos con título, estructura narrativa planificada y cierre en imagen o acción concreta.
- Conversación multi-turno en inglés, heredada del ajuste de instrucción de Qwen2.5.
- Razonamiento y matemáticas básicas: capacidades propias del modelo base, no evaluadas en esta distribución.
- Generación de código: disponible por herencia de Qwen2.5-7B-Instruct, aunque no es el objetivo del empaquetado.
- Soporte de tool calling y function calling: presente en el modelo base Qwen2.5, no verificado en el artefacto OpenVINO.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta distribución.
- Multilingüismo: el prompt pide responder en el idioma del usuario, pero la model card declara solo inglés y advierte que el rendimiento decae fuera de esa lengua.
- Modo thinking, visión y audio: no disponibles.
- Ejecución en CPU mediante `openvino_genai.LLMPipeline` con dispositivo `"CPU"`.

## Casos de uso

- Generación de relatos cortos en local: el modelo produce ficción de 700 tokens con estructura planificada usando el system prompt recomendado, lo que permite iterar sobre borradores literarios en una portátil sin GPU.
- Prototipado de asistentes creativos: sirve para validar prompts de escritura (reglas de estilo, consistencia de personajes, longitud) antes de invertir en un modelo mayor o en un ajuste fino real.
- Herramientas de escritura asistida sin conexión: al ejecutarse en CPU con OpenVINO, encaja en aplicaciones de escritorio que deben funcionar offline y sin depender de APIs externas.
- Generación de variantes narrativas: con temperature 0.8 y top_p 0.92 se pueden producir múltiples versiones de una misma escena para selección editorial posterior.
- Docencia y experimentación con cuantización: el artefacto INT4 permite medir el impacto de la cuantización OpenVINO sobre la coherencia narrativa frente al modelo en FP16, con una línea de código.
- Despliegue en hardware Intel de gama baja: un i5-1235U con 16 GB sostiene unas 6 tok/s, suficiente para generación por lotes de textos cortos en segundo plano.
- Base para experimentos de prompting: dado que no hay ajuste fino, el modelo es un banco de pruebas limpio para evaluar system prompts literarios sin contaminación de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comparación cualitativa con `ZygAI/ZygAI-Creative-1.5B-v2-ov-int4` en cinco prompts, en la que el modelo de 7B produjo historias más coherentes, y una medida de velocidad: aproximadamente 6 tok/s en un Intel i5-1235U con 16 GB de RAM.

## Requisitos de hardware

- VRAM: no aplica para ejecución en CPU; el repositorio ocupa 4,5 GB, por lo que se recomienda al menos 8 GB de RAM libre para cargar los pesos INT4.
- GPU recomendadas: no documentadas; el pipeline de referencia usa el dispositivo `"CPU"`. OpenVINO permite también `"GPU"` en iGPU Intel, aunque el autor no reporta cifras.
- Cabe en GPU de consumo: previsiblemente en tarjetas con 6-8 GB de VRAM en INT4, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: `openvino-genai` (`ov_genai.LLMPipeline`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato OpenVINO IR no es directamente compatible con ellos sin conversión.
- Latencia y throughput: aproximadamente 6 tok/s en CPU Intel i5-1235U con 16 GB; no hay cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZygAI-Creative-7B-ov-int4 | ~7,6B | 32.768 (heredado) | Apache 2.0 | OpenVINO IR INT4 | Sin ajuste fino; comportamiento creativo via system prompt; ~6 tok/s en CPU |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 32.768 | Apache 2.0 | safetensors | Modelo base original; sin cuantización; requiere GPU o CPU con más memoria |
| OpenVINO/Qwen2.5-7B-Instruct-int4-ov | ~7,6B | 32.768 | Apache 2.0 | OpenVINO IR INT4 | Build INT4 oficial reutilizado por ZygAI; sin prompt creativo |
| ZygAI/ZygAI-Creative-1.5B-v2-ov-int4 | ~1,5B | No disponible | Apache 2.0 | OpenVINO IR INT4 | Alternativa más pequeña del mismo autor; menos coherente según la model card |

## Limitaciones y advertencias

- No hay ajuste fino: el comportamiento creativo depende por completo del system prompt; sin él, el modelo responde con la persona por defecto de la plantilla de chat, que el autor describe como un asistente lituano distinto del deseado.
- Sesgos: no documentados por el autor; se heredan los del modelo base Qwen2.5-7B-Instruct, sin evaluación específica en esta distribución.
- Alucinación: el autor advierte que el modelo sigue siendo propenso a clichés ("tears welled up", "found closure", "bittersweet") pese a las instrucciones en contra.
- Idioma: solo inglés declarado; el prompt pide adaptarse al idioma del usuario, pero el rendimiento fuera del inglés no está garantizado.
- Contexto: la ventana de 32.768 tokens es la del modelo base y no se verifica en el artefacto OpenVINO; además, la model card no documenta comportamiento en contextos largos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones del modelo base Qwen2.5 y del build OpenVINO de origen.
- Producción: el rendimiento de ~6 tok/s en CPU limita su uso a generación por lotes o interactiva de baja exigencia; no hay datos de throughput en GPU ni pruebas de carga publicadas.
- Ecosistema: el formato OpenVINO IR restringe las herramientas de despliegue disponibles en comparación con GGUF o safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/ZygAI/ZygAI-Creative-7B-ov-int4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Build OpenVINO INT4 de origen: https://huggingface.co/OpenVINO/Qwen2.5-7B-Instruct-int4-ov
- Alternativa del mismo autor: https://huggingface.co/ZygAI/ZygAI-Creative-1.5B-v2-ov-int4
- OpenVINO GenAI (librería de inferencia): no se proporciona enlace en la informacion disponible
