# thelamapi/Next-3-Pro

## Resumen

Next 3 Pro es un modelo multimodal de tipo image-text-to-text desarrollado por Lamapi, un autor independiente en Hugging Face. Se presenta como un modelo de clase 27B (27.356.728.560 parámetros según los pesos en safetensors) orientado a generación de código, razonamiento técnico y comprensión de documentos, imágenes y vídeo. Su base declarada es Qwen3.8-27B, sobre la que Lamapi ha aplicado un ajuste fino con LoRA y ha exportado un checkpoint fusionado en formato Transformers.

El modelo se distribuye como checkpoint completo en safetensors (repo de 54,7 GB), con builds adicionales en GGUF y una variante de compatibilidad con TurboQuant publicadas por el mismo autor. Soporta conversaciones técnicas en inglés y turco, incluyendo escenarios donde la discusión y el código usan idiomas distintos. La arquitectura heredada de Qwen3.8-27B incluye procesamiento multimodal (texto, imagen y vídeo) y controles de razonamiento tipo thinking.

Es relevante para quienes buscan un modelo multimodal de tamaño medio con capacidades de tool calling y contexto largo, aunque la ausencia de licencia declarada y de benchmarks propios publicados limita su adopción en producción sin una evaluación previa por parte del equipo integrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen3.8-27B |
| Parámetros totales | 27.356.728.560 (27B aprox.) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 262.144 tokens nativos; configuración extendida hasta 1.000.000 tokens (heredada del modelo base; no evaluada por Lamapi en este checkpoint) |
| Tipos de cuantización | BF16 en el checkpoint principal; builds GGUF publicados por el autor (niveles no especificados) |
| Idiomas soportados | en, tr |
| Licencia | no disponible |
| Formato de pesos | safetensors (Transformers); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura de Qwen3.8-27B, un transformer multimodal que acepta entradas de texto, imagen y vídeo a través de un procesador multimodal (`AutoProcessor`). Lamapi declara un ajuste fino mediante LoRA sobre el modelo base, con exportación posterior de un checkpoint fusionado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Los únicos datasets referenciados en las etiquetas del repositorio son `openai/gsm8k` y `google-research-datasets/mbpp`, que apuntan a un enfoque en razonamiento matemático y generación de código.

El modelo hereda del base los controles de razonamiento (`enable_thinking`, `reasoning_effort`, `preserve_thinking`) y la configuración de contexto largo. Lamapi advierte explícitamente que no ha evaluado el checkpoint ajustado a las longitudes de contexto extendidas (hasta 1M tokens), por lo que ese dato debe tratarse como capacidad teórica heredada y no como rendimiento verificado.

## Capacidades

- Generación de código y depuración: redacción de funcionalidades, inspección de errores, propuesta de parches, escritura de tests y revisión iterativa del código.
- Razonamiento matemático y técnico: cálculos, comparación de alternativas bajo restricciones y explicación de soluciones con ejemplos concretos.
- Comprensión de imágenes: análisis de capturas de pantalla, diagramas, páginas escaneadas y layouts visuales mediante el procesador multimodal.
- Comprensión de vídeo: resumen de clips, seguimiento de cambios entre fotogramas y respuesta a preguntas sobre eventos visuales (los límites prácticos dependen del runtime).
- Tool calling y flujos de agente: acepta esquemas de herramientas, permite que la aplicación ejecute las llamadas y devuelve los resultados al modelo.
- Modo thinking: elección entre respuesta directa y razonamiento extendido según los controles expuestos por el stack de servicio.
- Contexto largo: configuración nativa de 262.144 tokens y extendida hasta 1.000.000 tokens (heredada, no evaluada en este checkpoint).
- Multilingüe limitado: inglés y turco, incluyendo proyectos donde la conversación y el código usan idiomas distintos.

## Casos de uso

- Generación de código en producción: el modelo puede recibir un brief de funcionalidad y devolver un primer borrador completo (por ejemplo, una aplicación de una sola página en HTML/CSS/JS) y refinarlo en turnos posteriores con los errores de navegador o casos límite detectados.
- Depuración asistida en CI/CD: integrado en un pipeline, puede analizar fallos de tests, proponer parches y escribir tests de regresión, apoyándose en su capacidad de tool calling para consultar logs o ejecutar comandos permitidos.
- Análisis de capturas de interfaz: a partir de una imagen de una UI rota, el modelo identifica el problema visual y sugiere el cambio de código correspondiente, lo que resulta útil en equipos de frontend.
- Procesamiento de documentación técnica escaneada: interpretación de diagramas de arquitectura, páginas de manuales y tablas en imagen para extraer especificaciones o responder preguntas sobre ellas.
- Resumen y consulta de vídeo: síntesis de clips de demo de producto o grabaciones de sesiones para extraer decisiones y preguntas frecuentes, con seguimiento de cambios entre fotogramas.
- Asistencia técnica bilingüe inglés-turco: atención a desarrolladores que discuten en turco mientras el código y la documentación están en inglés, manteniendo coherencia en ambos idiomas.
- Agentes multi-paso con herramientas: construcción de asistentes que encadenan llamadas a APIs externas (búsqueda, cálculo, ejecución de código) y razonan sobre los resultados devueltos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54,7 GB solo para pesos, más el espacio para KV cache y contexto; se recomienda un mínimo de 64-80 GB para uso práctico con contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16; para cuantizaciones GGUF de menor precisión, GPUs consumer de 24 GB (RTX 3090, RTX 4090) pueden resultar viables según el nivel de cuantización.
- Cabe en consumer GPU: sí, con cuantización GGUF agresiva; en BF16 no cabe en GPUs de 24 GB.
- Opciones de despliegue: Transformers (referencia del autor), llama.cpp/Ollama mediante los builds GGUF publicados, y stacks compatibles con el formato de pesos de Qwen3.8-27B. No se confirma soporte específico de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Next 3 Pro | 27B aprox. | 262.144 (ext. 1M, no evaluado) | Texto, imagen, vídeo | no disponible | Hugging Face (safetensors, GGUF) |
| Qwen3.8-27B (base) | 27B aprox. | 262.144 (ext. 1M) | Texto, imagen, vídeo | la del modelo base (consultar upstream) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento comparativo con otros modelos de la misma categoría, por lo que la comparativa se limita al modelo base declarado.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint, lo que impide confirmar si el uso comercial está permitido. Es un bloqueante para producción hasta aclararlo con el autor.
- Sin benchmarks publicados: no hay resultados de MMLU, HumanEval, GSM8K ni similares para este checkpoint ajustado; el rendimiento debe validarse internamente.
- Contexto extendido no verificado: Lamapi advierte que no ha evaluado el modelo a 262.144 ni a 1.000.000 tokens, por lo que la degradación en contextos largos es desconocida.
- Idiomas limitados: solo inglés y turco; no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos, especialmente en tareas de razonamiento matemático y análisis de imágenes; requiere verificación humana en flujos críticos.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación en la información disponible.
- Dependencia del modelo base: al ser un ajuste fino de Qwen3.8-27B, hereda sus limitaciones y requiere versiones de Transformers compatibles con esa arquitectura.
- Autor independiente con pocas señales de adopción (0 descargas, 1 like en el momento de la consulta): conviene tratar el modelo como experimental y no como componente crítico sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-3-Pro
- Builds GGUF: https://huggingface.co/thelamapi/Next-3-Pro-GGUF
- Build de compatibilidad TurboQuant: https://huggingface.co/thelamapi/Next-3-Pro-TurboQuant
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/thelamapi
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
