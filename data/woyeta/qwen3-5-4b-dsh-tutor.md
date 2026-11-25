# woyeta/qwen3.5-4b-dsh-tutor

## Resumen

woyeta/qwen3.5-4b-dsh-tutor es un ajuste fino del modelo Qwen3.5 de 4B parámetros, publicado por el usuario woyeta en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp. El modelo se presenta como un vision-language model (VLM) con capacidad conversacional, e incluye un proyector multimodal separado (F16-mmproj) además de los pesos cuantizados del modelo base. El nombre del repositorio sugiere una especialización como tutor, aunque la model card no documenta el dataset de ajuste ni el propósito concreto del fine-tuning.

Con 4.326.350.848 parámetros totales (aproximadamente 4,3B) y un tamaño de repositorio de 6,7 GB, el modelo se posiciona en el segmento de modelos pequeños que pueden ejecutarse en hardware de consumo. La información publicada es muy escasa: no se especifican licencia, idiomas soportados, longitud de contexto ni resultados de evaluación. El autor indica que el ajuste y la conversión a GGUF se realizaron con Unsloth.

La relevancia de esta ficha es limitada por la falta de documentación del autor, pero resulta útil para desarrolladores que quieran evaluar un checkpoint comunitario de Qwen3.5 en formato GGUF con capacidades multimodales y ejecución local vía llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, presumiblemente transformer; no confirmado en la información) |
| Parámetros totales | 4.326.350.848 (~4,3B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q5_K_M, Q4_K_M, F16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5 ni sobre la del ajuste. Por el nombre y los tags, se trata de un modelo de la familia Qwen3.5 de 4B parámetros con capacidades de visión-lenguaje, ya que el repositorio incluye un archivo `Qwen3.5-4B.F16-mmproj.gguf` que actúa como proyector multimodal para el modelo de lenguaje. El ajuste fino y la conversión a GGUF se realizaron con Unsloth, según la model card.

No se documentan el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se especifican innovaciones técnicas del ajuste. Toda la información sobre la arquitectura del modelo base debe consultarse en la ficha oficial de Qwen3.5, que no se incluye en la información proporcionada.

## Capacidades

- Generación de texto conversacional en formato chat (el repositorio se etiqueta como "conversational").
- Procesamiento de imágenes y texto combinados (vision-language model), mediante el proyector multimodal incluido.
- Ejecución local con llama.cpp: `llama-cli` para texto y `llama-mtmd-cli` para multimodal, según la model card.
- Compatibilidad con plantillas Jinja (`--jinja`) para el formateo de conversaciones.
- Soporte de endpoints compatibles (tag "endpoints_compatible").
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Tutoría conversacional local: el nombre del modelo ("dsh-tutor") sugiere un uso como asistente educativo; puede desplegarse con llama.cpp en un portátil o estación de trabajo para sesiones de preguntas y respuestas sin conexión.
- Asistencia multimodal en el escritorio: con `llama-mtmd-cli` y el proyector F16, el modelo puede describir imágenes o responder preguntas sobre capturas de pantalla en un flujo local, útil para herramientas de accesibilidad o soporte técnico.
- Prototipado rápido de aplicaciones de chat: al ser GGUF de 4B, permite iterar en local con requisitos de hardware modestos antes de migrar a un modelo mayor en producción.
- Evaluación de fine-tunes comunitarios: sirve como banco de pruebas para comparar el efecto de ajustes comunitarios sobre Qwen3.5-4B frente al modelo base.
- Generación de texto en entornos con recursos limitados: la cuantización Q4_K_M reduce el peso a unos pocos GB, lo que permite ejecución en GPUs de consumo o incluso en CPU.
- Integración en pipelines de llama.cpp: al ser compatible con la CLI de llama.cpp y plantillas Jinja, puede integrarse en scripts de automatización para tareas de resumen o extracción de información sobre documentos e imágenes.
- Despliegue en endpoints compatibles: el tag "endpoints_compatible" indica que puede servirse detrás de una API compatible con OpenAI mediante herramientas de inferencia que soporten GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa aproximadamente 2,5-3 GB y el Q5_K_M en torno a 3-3,5 GB; el proyector F16 añade un tamaño reducido adicional. Estas cifras son estimaciones por el tamaño del repo (6,7 GB, que incluye todos los archivos) y no están confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para las cuantizaciones Q4_K_M y Q5_K_M; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para F16 se necesitarían del orden de 9-10 GB.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más para cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server), y cualquier frontend que consuma GGUF (por ejemplo, Ollama si se importa el archivo). vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que no se confirman.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| woyeta/qwen3.5-4b-dsh-tutor | ~4,3B | no disponible | sí (con mmproj) | no disponible | GGUF |
| Qwen3.5-4B (base oficial) | ~4B | no disponible en esta ficha | según variante | no disponible en esta ficha | safetensors/GGUF |
| Qwen2.5-VL-3B | ~3B | no disponible en esta ficha | sí | no disponible en esta ficha | safetensors/GGUF |
| Llama 3.2 3B | ~3B | no disponible en esta ficha | sí (variante 11B) | Llama Community License | safetensors/GGUF |

La comparación cuantitativa con alternativas no puede realizarse porque no se han publicado benchmarks ni especificaciones completas del modelo en la información disponible.

## Limitaciones y advertencias

- La model card no documenta el dataset de ajuste, por lo que se desconoce el dominio y los posibles sesgos introducidos por el fine-tuning.
- No se especifica la licencia: no se puede confirmar el uso comercial ni las restricciones de redistribución. Es imprescindible verificar la licencia del modelo base Qwen3.5 antes de usarlo en producción.
- No se documentan los idiomas soportados; no se puede asumir un rendimiento multilingüe sin evaluación.
- No se indica la longitud de contexto, lo que impide planificar aplicaciones con documentos largos.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en tareas de razonamiento complejo o matemáticas.
- El ajuste es comunitario (0 descargas, 0 likes en el momento de la consulta) y no ha sido validado por terceros; no hay garantías de calidad.
- El proyector multimodal debe cargarse junto con el modelo mediante `llama-mtmd-cli`; su uso con otras herramientas puede no estar soportado.
- No se han publicado resultados de benchmarks, por lo que no se recomienda su uso en producción sin una evaluación previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/woyeta/qwen3.5-4b-dsh-tutor
- Unsloth (herramienta de ajuste y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
