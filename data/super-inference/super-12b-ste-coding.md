# super-inference/super-12B-ste-coding

## Resumen

El modelo `super-inference/super-12B-ste-coding` es un ajuste fino (finetune) de una variante de Gemma 4 de 12B parámetros, orientado a tareas de codificación y a usos agénticos (agentic). Ha sido convertido a formato GGUF mediante la librería Unsloth, lo que permite su ejecución eficiente con llama.cpp y herramientas compatibles como llama-cli o llama-mtmd-cli. El modelo es multimodal, ya que incluye un archivo de proyección multimodal (`mmproj`), lo que le permite procesar tanto texto como imágenes.

Su relevancia radica en ofrecer una opción de 12B parámetros con capacidades de visión y lenguaje, especialmente diseñada para entornos de desarrollo y agentes autónomos, en un formato ligero y cuantizado que facilita su despliegue en hardware de consumo. Aunque la información pública es limitada, el nombre de los archivos sugiere que se basa en la arquitectura Gemma 4 12B, con un ajuste específico para generación de código y razonamiento agéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Gemma 4 12B (según nombre de archivos) |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16, BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (y safetensors según dato de parámetros) |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la información proporcionada, pero el nombre de los archivos (`gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2`) indica que se trata de un ajuste fino de Gemma 4 12B, una familia de modelos de Google. El entrenamiento se realizó con la librería Unsloth, que acelera el proceso de fine-tuning y la conversión a GGUF. No se detallan los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. La inclusión de un archivo `mmproj` confirma que el modelo incorpora un proyector multimodal para procesar imágenes junto con texto.

## Capacidades

- Generación de código y asistencia en programación, dado el sufijo "coding" en el nombre.
- Procesamiento multimodal: puede recibir imágenes como entrada y generar texto relacionado (por ejemplo, descripción de diagramas o capturas de pantalla).
- Orientado a tareas agénticas (agentic), lo que sugiere capacidad para razonamiento multi-paso y posible integración en flujos de agentes.
- Conversacional: el tag "conversational" indica que está diseñado para mantener diálogos.
- Compatible con llama.cpp y herramientas de la línea de comandos (llama-cli, llama-mtmd-cli).

## Casos de uso

- Asistente de programación en IDE: el modelo puede sugerir fragmentos de código, explicar errores o refactorizar funciones, integrándose como plugin en editores como VS Code.
- Agente autónomo de desarrollo: gracias a su orientación agéntica, puede ejecutar tareas de múltiples pasos, como buscar en repositorios, modificar archivos y ejecutar pruebas, usando tool calling si se configura.
- Análisis de capturas de pantalla de código: al ser multimodal, puede recibir una imagen de un error o de un diagrama y generar una explicación o solución.
- Generación de documentación técnica: a partir de código fuente o descripciones, puede redactar comentarios, README o guías de uso.
- Chatbot técnico de soporte: puede responder consultas sobre lenguajes de programación, frameworks o depuración, manteniendo contexto conversacional.
- Automatización de pruebas: puede generar casos de prueba a partir de especificaciones o código existente, ayudando en pipelines de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q4_K_M: ~7-8 GB
  - Q6_K: ~10-11 GB
  - Q8_0: ~12-13 GB
  - F16/BF16: ~24 GB
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para cuantizaciones ligeras (RTX 3060, RTX 4060, etc.); para BF16 se requiere una GPU de gama alta (A100, H100, RTX 4090).
- Es viable en GPUs de consumo con cuantización Q4_K_M o Q6_K.
- Opciones de despliegue: llama.cpp, Ollama (si se convierte a formato compatible), vLLM (si se dispone de pesos en safetensors), TGI.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de la misma categoría. Se recomienda evaluar el modelo directamente en el hardware objetivo.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de idioma.
- La licencia no está especificada, por lo que se debe contactar con el autor antes de un uso comercial.
- Al ser un finetune de Gemma 4, puede heredar las limitaciones del modelo base, aunque no se detallan.
- El contexto máximo no se conoce; se recomienda probar con secuencias largas para verificar el rendimiento.
- El modelo está orientado a codificación y agentes; su rendimiento en otras tareas generales puede ser inferior.

## Enlaces

- HuggingFace: https://huggingface.co/super-inference/super-12B-ste-coding
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
