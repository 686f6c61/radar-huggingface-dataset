# tejasranveer/jadooo-q1.5b

## Resumen

jadooo-q1.5b es un modelo de lenguaje conversacional publicado por el usuario tejasranveer en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen2.5-1.5B-Instruct, que posteriormente fue convertido a formato GGUF para su uso con llama.cpp y Ollama. El modelo cuenta con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones), lo que lo sitúa en la categoría de modelos pequenos optimizados para inferencia en hardware de consumo.

La relevancia de este modelo radica en su formato de despliegue: al distribuirse exclusivamente como GGUF cuantizado (Q4_K_M), está pensado para ejecutarse localmente en equipos con recursos limitados, sin necesidad de GPU dedicada de gama alta. El autor indica que el ajuste fino y la conversión se realizaron con Unsloth, una herramienta que acelera el entrenamiento y la cuantización de modelos.

No obstante, la información pública disponible es muy escasa: no se especifican los datos de entrenamiento, el dataset utilizado en el ajuste fino, la licencia, los idiomas soportados ni resultados de benchmarks. La model card se limita a indicar el formato y un ejemplo de uso con llama-cli. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere que es un proyecto personal o experimental de reciente creación (noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo como referencia de parametros) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar. Al ser un ajuste fino del modelo Instruct de Qwen2.5, hereda la arquitectura original, aunque no se detallan en la información disponible posibles modificaciones estructurales. El autor indica que el fine-tuning y la conversión a GGUF se realizaron con Unsloth, herramienta que optimiza el entrenamiento mediante técnicas de ahorro de memoria y acelera la cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El único artefacto publicado es el archivo `Qwen2.5-1.5B-Instruct.Q4_K_M.gguf`, lo que sugiere que el ajuste fino se realizó sobre el modelo base y se exportó directamente a cuantización Q4_K_M sin publicar los pesos en precisión completa.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, propio de un modelo Instruct de 1,5 B de parámetros.
- Soporte de plantillas de chat mediante el flag `--jinja` en llama.cpp, lo que permite aplicar el formato de conversación del modelo base.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Capacidades multilingües: no documentadas explícitamente, aunque el modelo base Qwen2.5 soporta múltiples idiomas; el ajuste fino podría haber alterado esta cobertura.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en un portátil o mini-PC mediante llama.cpp u Ollama gracias a su cuantización Q4_K_M y su tamaño de ~1 GB, ofreciendo respuestas conversacionales sin conexión a internet.
- Prototipado rápido de chatbots: al estar disponible como GGUF y con Modelfile de Ollama, permite desplegar un chatbot funcional en minutos para pruebas de concepto o demos internas.
- Generación de texto en entornos con recursos limitados: adecuado para aplicaciones embebidas o dispositivos de borde donde no es viable un modelo de mayor tamaño.
- Filtrado y clasificación de texto simple: tareas de etiquetado, resumen breve o reescritura que no requieran razonamiento complejo ni contexto largo.
- Educación y experimentación: útil para investigadores o desarrolladores que quieran estudiar el proceso de fine-tuning y cuantización con Unsloth sobre un modelo pequeño.
- Integración en pipelines de CI/CD para pruebas de humo: al ser ligero, puede usarse como modelo de referencia en tests automatizados de infraestructura de inferencia (llama.cpp, Ollama, endpoints compatibles).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1,5 GB con cuantización Q4_K_M (el archivo GGUF ocupa ~1 GB según el tamaño del repo).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3050, RTX 4060 o superiores pueden ejecutarlo con holgura. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli -hf tejasranveer/jadooo-q1.5b --jinja`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con servicios de inferencia tipo endpoint.
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera una latencia baja en GPU de consumo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| jadooo-q1.5b | ~1,5 B | no disponible | no disponible | GGUF (Q4_K_M) | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens (modelo base) | Apache 2.0 (modelo base) | safetensors, GGUF | Hugging Face, Ollama |
| Llama 3.2 1B Instruct | ~1,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |
| Gemma 2 2B Instruct | ~2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se basa en el modelo base Qwen2.5-1.5B-Instruct, del cual deriva jadooo-q1.5b. No se dispone de datos de rendimiento del ajuste fino para comparar benchmarks. La principal diferencia frente al modelo base es la cuantización Q4_K_M y el posible ajuste fino, cuyos detalles no se documentan.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5, podría heredar sesgos del modelo base, pero no hay información específica.
- Riesgo de alucinación: propio de modelos de 1,5 B de parámetros; la capacidad de razonamiento y la fidelidad factual son limitadas en comparación con modelos mayores.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto soportada ni los idiomas cubiertos tras el ajuste fino; el modelo base Qwen2.5 soporta 32.768 tokens, pero el ajuste podría haber alterado esta capacidad.
- Restricciones de licencia para uso comercial: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Caveat importante para producción: el repositorio tiene 0 descargas y 1 like, y la model card es mínima; no hay garantías de calidad, mantenimiento ni soporte. La ausencia de benchmarks y de documentación del dataset de entrenamiento dificulta evaluar su idoneidad para tareas concretas.
- El modelo se distribuye únicamente en cuantización Q4_K_M, lo que limita la precisión frente a pesos en FP16/BF16 y puede afectar a tareas sensibles a la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tejasranveer/jadooo-q1.5b
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
