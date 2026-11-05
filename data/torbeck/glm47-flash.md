# Torbeck/glm47-flash

## Resumen

Torbeck/glm47-flash es una versión "abliterated" (sin rechazos) del modelo zai-org/GLM-4.7-Flash, publicada por el usuario Torbeck en Hugging Face. La model card incluida en el repositorio es, en realidad, la de huihui-ai/Huihui-GLM-4.7-Flash-abliterated, lo que indica que este repositorio es una re-subida o derivado del trabajo de abliteración de huihui-ai sobre el modelo base de Zhipu AI. La técnica de abliteración elimina la dirección de activación asociada a los rechazos, produciendo un modelo que responde a peticiones que el original declinaría.

El modelo conserva la arquitectura del GLM-4.7-Flash original, etiquetada como `glm4_moe_lite` en transformers, con 31.221.488.576 parámetros totales (aproximadamente 31,2 mil millones) y un tamaño de repositorio de 62,5 GB en safetensors. Está orientado a generación de texto conversacional y soporta inglés y chino. La licencia es MIT.

Es relevante para quienes necesitan un modelo de gran tamaño sin filtros de contenido para investigación sobre alineación, generación creativa sin restricciones o experimentación con técnicas de abliteración, aunque con las advertencias evidentes sobre sesgos, alucinaciones y uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4 MoE Lite (transformer con mezcla de expertos, según etiqueta `glm4_moe_lite`) |
| Parametros totales | 31.221.488.576 (~31,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (nf4/fp4 vía BitsAndBytes en el script de ejemplo); GGUF no confirmado en la información disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en zai-org/GLM-4.7-Flash, un transformer con arquitectura de mezcla de expertos (MoE) identificada por la etiqueta `glm4_moe_lite`. El repositorio contiene 31,2 mil millones de parámetros totales en formato safetensors (62,5 GB en bfloat16). No se dispone de información sobre el número de parámetros activos por token, la longitud de contexto nativa ni la composición del dataset de preentrenamiento en la información proporcionada.

El proceso de entrenamiento relevante aquí es la abliteración: se aplica la técnica descrita en remove-refusals-with-transformers, que identifica y resta la dirección de activación responsable de los rechazos en las capas del modelo, sin usar TransformerLens. El autor original (huihui-ai) describe el resultado como una implementación "cruda, proof-of-concept" para eliminar rechazos. No se menciona RLHF, DPO ni ajuste fino adicional en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Respuestas sin rechazos a peticiones que el modelo base declinaría (comportamiento "uncensored").
- Razonamiento y generación de contenido general heredado del modelo base GLM-4.7-Flash.
- Compatibilidad con el ecosistema transformers y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Despliegue disponible vía Ollama mediante `huihui_ai/glm-4.7-flash-abliterated`.
- Soporte de cuantización 4-bit con BitsAndBytes (nf4 en CPU, fp4 en GPU) según el script de ejemplo.
- No se confirma en la información disponible soporte de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar las respuestas del modelo abliterated con las del GLM-4.7-Flash original para estudiar cómo se codifican los rechazos en el espacio de activaciones y evaluar la eficacia de la técnica de abliteración.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas que el modelo base rechazaría, usando el modelo en local con cuantización 4-bit para reducir requisitos de VRAM.
- Experimentación con técnicas de edición de modelos: servir como caso de estudio reproducible de abliteración sin TransformerLens, útil para quienes investigan métodos de modificación de pesos y activaciones.
- Prototipado de asistentes conversacionales en inglés y chino: aprovechar el soporte bilingüe del modelo base para construir demos de chat multi-turno en entornos de investigación.
- Evaluación de sesgos y toxicidad: usar el modelo como sujeto de pruebas en pipelines de red-teaming para medir qué tipo de contenido genera un modelo sin filtros y calibrar clasificadores de seguridad.
- Despliegue local con Ollama: ejecutar `ollama run huihui_ai/glm-4.7-flash-abliterated` para pruebas rápidas en estaciones de trabajo sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 62,5 GB solo para pesos, más overhead de activaciones y KV cache; requiere múltiples GPU o una GPU de 80 GB con margen ajustado.
- VRAM estimada en 4-bit (nf4/fp4): en torno a 16-20 GB para pesos, más overhead; viable en una RTX 4090 (24 GB) o A100 40 GB con contexto moderado.
- GPU recomendadas: A100 80 GB o H100 para bfloat16; RTX 4090, A100 40 GB o L40S para cuantización 4-bit.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con cuantización 4-bit y contexto limitado; no en bfloat16.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), BitsAndBytes para cuantización, Ollama (versión 0.15.1 o superior según la model card). No se confirma soporte de vLLM, TGI o llama.cpp en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Torbeck/glm47-flash | ~31,2 B | no disponible | MIT | Abliterated sobre GLM-4.7-Flash |
| zai-org/GLM-4.7-Flash | no disponible | no disponible | no disponible | Modelo base original, con rechazos |
| huihui-ai/Huihui-GLM-4.7-Flash-abliterated | no disponible | no disponible | no disponible | Fuente de la model card y del trabajo de abliteración |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": elimina deliberadamente los rechazos, por lo que puede generar contenido dañino, ilegal o éticamente problemático; no apto para producción orientada al público sin filtros externos.
- La abliteración es descrita por el propio autor como una implementación "cruda, proof-of-concept"; puede degradar capacidades del modelo base y aumentar incoherencias.
- Riesgo elevado de alucinación, especialmente en dominios especializados; no hay benchmarks publicados que cuantifiquen la degradación.
- Sesgos heredados del modelo base GLM-4.7-Flash, no documentados en la información disponible.
- Soporte limitado a inglés y chino; no se garantiza calidad en castellano.
- Longitud de contexto no documentada; planificar despliegues con contexto conservador.
- La model card del repositorio corresponde a otro repositorio (huihui-ai), lo que sugiere que Torbeck/glm47-flash es una re-subida; verificar integridad de pesos antes de usar en producción.
- Licencia MIT permite uso comercial, pero la ausencia de filtros traslada al desplegador toda la responsabilidad legal y ética sobre el contenido generado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Torbeck/glm47-flash
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Repositorio de abliteración de referencia: https://github.com/Sumandora/remove-refusals-with-transformers
- Ollama: https://ollama.com/huihui_ai/glm-4.7-flash-abliterated
- Release de Ollama 0.15.1: https://github.com/ollama/ollama/releases/tag/v0.15.1
