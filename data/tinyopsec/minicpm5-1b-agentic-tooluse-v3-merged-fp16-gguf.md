# tinyopsec/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16-GGUF

## Resumen

MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16-GGUF es una distribución de cuantizaciones GGUF del checkpoint `ewin-reg/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16`, un modelo de 1.080.632.832 parámetros (aproximadamente 1,08 mil millones) afinado específicamente para tool calling y flujos agénticos. Lo publica el usuario `tinyopsec` en Hugging Face y deriva en última instancia del modelo base `openbmb/MiniCPM5-1B` de OpenBMB, sobre el que se ha aplicado un proceso de merge y ajuste orientado a uso de herramientas (v3).

El modelo resuelve un nicho concreto: despliegue de agentes ligeros en entornos con recursos limitados, donde un LLM de gran tamaño no es viable pero se necesita capacidad fiable de invocar funciones y encadenar pasos. Al estar en formato GGUF, es ejecutable en CPU y en GPU de consumo mediante llama.cpp, Ollama, LM Studio o koboldcpp, lo que reduce la barrera de entrada frente a pesos en safetensors.

La relevancia actual reside en su tamaño reducido (apto para hardware modesto) combinado con una especialización explícita en tool calling, una de las capacidades más demandadas en pipelines de agentes. La licencia Apache 2.0 facilita su uso comercial, aunque la información publicada sobre contexto, idiomas y datos de entrenamiento es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM5-1B; detalles de capas y atención no disponibles) |
| Parametros totales | 1.080.632.832 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 10,8 GB con todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF del checkpoint `ewin-reg/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16`, generada con llama.cpp. La arquitectura subyacente es la de MiniCPM5-1B de OpenBMB, un transformer de aproximadamente 1,08 mil millones de parámetros. El sufijo "Merged" sugiere que el checkpoint de origen combina pesos de varios modelos o etapas de ajuste, y "Agentic-Tooluse-v3" indica una especialización en invocación de herramientas y razonamiento multi-paso.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa u otras). La model card se limita a listar las cuantizaciones disponibles y a indicar el uso mediante llama.cpp.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Tool calling / function calling: especialización principal del checkpoint, según los tags `tool-calling` y `agentic`.
- Razonamiento agéntico multi-paso: el sufijo "Agentic" y la versión "v3" apuntan a flujos de agente con encadenamiento de herramientas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Ejecución en runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Agentes ligeros en el borde: con ~1,08 B de parámetros y cuantización Q4_K_M, el modelo puede ejecutarse en dispositivos con poca VRAM o incluso en CPU, sirviendo como planificador de herramientas en asistentes locales.
- Automatización de tareas con APIs: su especialización en tool calling permite conectarlo a funciones externas (consultas a bases de datos, envío de correos, operaciones CRUD) en pipelines de automatización de bajo coste.
- Enrutamiento de intenciones: dado su tamaño, puede actuar como clasificador o router que decide qué herramienta o modelo mayor debe atender una petición, reduciendo latencia y coste.
- Prototipado rápido de agentes: la disponibilidad de 13 cuantizaciones GGUF permite iterar en portátiles sin GPU dedicada antes de escalar a un modelo mayor.
- Asistentes embebidos en aplicaciones de escritorio: integrable vía llama.cpp u Ollama en herramientas locales que necesiten invocar funciones del sistema operativo.
- Educación e investigación: modelo pequeño y abierto (Apache 2.0) para estudiar comportamiento de tool calling en modelos de menos de 2 B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (1,08 B de parámetros):
  - F16: ~2,0 GB (según la model card).
  - Q8_0: ~1,1 GB.
  - Q6_K: ~0,9 GB.
  - Q5_K_M: ~0,8 GB.
  - Q4_K_M (recomendada): ~0,7 GB.
  - Q3_K_M: ~0,6 GB.
  - Q2_K: ~0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; para Q4_K_M basta con 1 GB. Funciona en RTX 4090, RTX 3060, GTX 1650 e incluso en iGPU modernas.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, y también en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Agentic-Tooluse-v3 (este) | ~1,08 B | no disponible | Apache 2.0 | GGUF | Especializado en tool calling |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Uso general, buen soporte de tool calling |
| Llama-3.2-1B-Instruct | ~1,2 B | 128 K (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Uso general, licencia con restricciones |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8 K (según documentación pública de Hugging Face) | Apache 2.0 | safetensors, GGUF | Uso general, entrenado con datos sintéticos |

Los datos de contexto de los modelos comparables provienen de documentación pública general y no de la información específica de esta ficha; verifíquense antes de usarlos en producción. No hay datos de benchmarks comparativos disponibles para este checkpoint.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta contexto, idiomas, dataset ni evaluación; el autor advierte explícitamente "Evaluate before use".
- Riesgo de alucinación inherente a modelos de ~1 B de parámetros, especialmente en tool calling con esquemas complejos.
- El sufijo "Merged" implica pesos combinados de origen no documentado, lo que dificulta la trazabilidad del comportamiento.
- No se especifican sesgos conocidos ni evaluación de seguridad.
- Contexto limitado probablemente (no confirmado); no apto para documentos largos sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `openbmb/MiniCPM5-1B` debe verificarse por si añade condiciones adicionales.
- Sin likes ni validación comunitaria (0 likes, 887 descargas): no hay evidencia de adopción amplia ni de calidad contrastada.
- Recomendado validar el formato de tool calling esperado antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tinyopsec/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16-GGUF
- Modelo base del checkpoint: https://huggingface.co/ewin-reg/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16
- Modelo original de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp (runtime): https://github.com/ggerganov/llama.cpp
- Ollama (runtime): https://ollama.com
- LM Studio (runtime): https://lmstudio.ai
