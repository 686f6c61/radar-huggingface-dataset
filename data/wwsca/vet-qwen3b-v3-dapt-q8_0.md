# WWsCa/vet-qwen3b-v3-dapt-q8_0

## Resumen

El modelo `vet-qwen3b-v3-dapt-q8_0` es una adaptación del modelo base Qwen2.5-3B-Instruct, desarrollado por el usuario WWsCa, especializado en el dominio veterinario. Se ha entrenado mediante DAPT (Domain-Adaptive Pre-Training) sobre aproximadamente 3.177 artículos de literatura veterinaria, lo que suma unos 176 millones de caracteres. El resultado es un modelo conversacional y de asistencia al diagnóstico clínico veterinario, diseñado para funcionar como motor de razonamiento local dentro del sistema LCPS 2.0 (cinco pasos de razonamiento clínico).

El modelo se distribuye en formato GGUF con cuantización Q8_0, lo que permite su ejecución eficiente en hardware modesto mediante llama.cpp o llama-cpp-python. Con 3.085 millones de parámetros, es un modelo compacto que puede desplegarse en CPU o GPUs de consumo. La licencia es "other" (no especificada), y los idiomas soportados son inglés y chino. Su relevancia radica en ofrecer una alternativa local y especializada para entornos veterinarios, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso indica n_ctx=4096) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF (fichero .gguf) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal y normalización RMSNorm. No se ha modificado la arquitectura base, sino que se ha realizado un entrenamiento de adaptación de dominio (DAPT) sobre el corpus veterinario. El proceso de entrenamiento consistió en pre-entrenamiento adaptativo sobre 3.177 artículos científicos veterinarios, sumando 1,76 × 10^8 caracteres. No se menciona el uso de RLHF, DPO u otros métodos de alineación posteriores; el modelo se basa en la capacidad instructiva heredada de Qwen2.5-Instruct y en el conocimiento específico del dominio adquirido durante el DAPT.

No se detallan hiperparámetros del entrenamiento, número de épocas, ni composición exacta del corpus. La cuantización Q8_0 se aplicó después del entrenamiento para reducir el tamaño del modelo (3,1 GB) manteniendo una pérdida de precisión mínima.

## Capacidades

- Generación de texto conversacional en inglés y chino, orientada a dominios veterinarios.
- Asistencia al diagnóstico clínico veterinario mediante la cadena de razonamiento LCPS 2.0 (cinco pasos), según la descripción del autor.
- Soporte de conversación multi-turno (el ejemplo de uso muestra interacción con `n_ctx=4096`).
- Integración con llama.cpp y llama-cpp-python para despliegue local en CPU o GPU.
- Capacidades de razonamiento limitadas a las del modelo base de 3B, con mejoras específicas en vocabulario y conceptos veterinarios.
- No se mencionan capacidades de tool calling, vision, audio ni otras modalidades.

## Casos de uso

- **Asistencia al diagnóstico en clínica veterinaria**: el modelo puede guiar al veterinario a través de la cadena LCPS 2.0 (síntomas, hipótesis, pruebas, diagnóstico, tratamiento) gracias a su entrenamiento específico en literatura veterinaria.
- **Soporte de consulta en campo**: al ser un modelo local de ~3 GB, puede ejecutarse en un portátil o minicomputador, permitiendo consultas rápidas en zonas sin conexión.
- **Educación veterinaria**: los estudiantes pueden interactuar con el modelo para practicar casos clínicos y aprender terminología específica.
- **Generación de informes preliminares**: el modelo puede redactar resúmenes de casos basados en datos introducidos por el usuario, aunque se recomienda revisión humana.
- **Traducción de terminología veterinaria**: al soportar inglés y chino, puede ayudar a traducir términos técnicos entre ambos idiomas.
- **Chatbot de orientación para propietarios de mascotas**: con supervisión veterinaria, el modelo podría responder preguntas frecuentes sobre cuidados básicos, pero con advertencias de no sustituir un diagnóstico profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. La evaluación se limita a la validación interna del autor, no documentada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización Q8_0, el modelo ocupa aproximadamente 3,1 GB en memoria. Para inferencia en GPU se recomienda al menos 4 GB de VRAM (ej. GTX 1650, RTX 3050). Para CPU, se puede ejecutar con 4-6 GB de RAM.
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM (RTX 3060, RTX 4060, etc.). No requiere GPUs de gama alta.
- **Compatibilidad con GPU de consumo**: sí, es adecuado para GPUs de consumo (gama media y baja).
- **Opciones de despliegue**: llama.cpp, llama-cpp-python, Ollama (si se convierte a formato GGUF), vLLM (no soporta GGUF directamente, pero se puede usar con el modelo original bf16).
- **Latencia y throughput**: no se disponen de datos medidos. En CPU moderna, se estima una velocidad de generación de 5-15 tokens/s para un modelo de 3B cuantizado, pero no se puede confirmar.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia de arquitectura, el modelo se basa en Qwen2.5-3B-Instruct, que tiene 3,09B parámetros y 32K de contexto en su versión original. Otros modelos de tamaño similar son Llama-3.2-3B-Instruct (3,21B parámetros, 128K contexto) o Phi-3-mini (3,8B parámetros). Sin embargo, este modelo es una adaptación especializada, no un modelo generalista, por lo que las comparativas de rendimiento general no son aplicables. La licencia "other" del modelo puede ser más restrictiva que las licencias Apache 2.0 o MIT de los modelos base.

## Limitaciones y advertencias

- **Licencia no especificada**: la licencia "other" puede implicar restricciones de uso comercial; es necesario contactar con el autor antes de desplegar en producción.
- **Tamaño reducido**: al ser un modelo de 3B, su capacidad de razonamiento complejo y de manejo de contextos muy largos es limitada.
- **Contexto no documentado**: no se especifica la longitud de contexto real; el ejemplo de uso usa 4096 tokens, pero el modelo base soporta 32K. El DAPT podría haber reducido el contexto efectivo.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información incorrecta o inventada, especialmente en casos clínicos complejos. Nunca debe usarse como sustituto de un veterinario.
- **Sesgos del dominio**: el entrenamiento con literatura veterinaria específica puede sesgar las respuestas hacia ciertas prácticas o regiones (la autoría parece estar en China, pero el corpus no está detallado).
- **Sin evaluación pública**: no hay benchmarks ni evaluaciones externas que validen su calidad clínica.
- **Idiomas limitados**: solo inglés y chino, no soporta otros idiomas como el español.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/WWsCa/vet-qwen3b-v3-dapt-q8_0)
- [HuggingFace del repositorio vetcopilot-backend](https://huggingface.co/WWsCa/vetcopilot-backend) (mencionado en la model card, para pesos completos y código de entrenamiento)
