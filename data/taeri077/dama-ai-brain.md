# Taeri077/dama-ai-brain

## Resumen

Dama-ai-brain es un modelo de lenguaje multimodal (visión y texto) publicado por el usuario Taeri077 (Taeri Jakga) en Hugging Face, convertido a formato GGUF mediante Unsloth para su uso con llama.cpp. El repositorio incluye un archivo de pesos cuantizado en Q8_0 y un proyector multimodal en FP16 (`F16-mmproj.gguf`), lo que indica que está pensado para ejecución local eficiente en CPU y GPU con herramientas como `llama-cli` y `llama-mtmd-cli`.

El modelo cuenta con aproximadamente 4.650 millones de parámetros (4,65B), lo que lo sitúa en la gama de modelos de tamaño medio-bajo, adecuado para despliegue en hardware de consumo. Aunque la tarjeta del modelo no especifica la arquitectura base, las etiquetas `gemma4`, `vision-language-model` y `conversational` sugieren que se trata de un fine-tuning multimodal sobre una variante de Gemma 4 (probablemente la de 4B), adaptado para tareas de conversación con entrada visual. El autor ha publicado también una versión MLX del mismo modelo (`dama-aibrain-mlx`), lo que confirma su intención de ofrecerlo para entornos Apple Silicon.

La relevancia de este modelo radica en su carácter experimental y de código abierto: es un ejemplo de fine-tuning multimodal accesible para desarrolladores que buscan un modelo pequeño con capacidades de visión-lenguaje, sin los requisitos de hardware de los modelos grandes. No obstante, su adopción es actualmente nula (0 descargas, 0 likes) y carece de documentación técnica detallada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `gemma4`; probablemente basada en Gemma 4 4B) |
| Parametros totales | 4.647.450.147 (≈4,65 B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (pesos), FP16 (proyector multimodal) |
| Idiomas soportados | No disponible (etiqueta `conversational`; el modelo base Gemma suele ser multilingüe, pero no confirmado) |
| Licencia | No disponible en la tarjeta; el repositorio MLX del mismo autor indica `apache-2.0` |
| Formato de pesos | GGUF (archivos `dama-aibrain.Q8_0.gguf` y `dama-aibrain.F16-mmproj.gguf`) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo. Por las etiquetas y el tamaño, se infiere que es un transformer multimodal basado en Gemma 4 (posiblemente la variante de 4B), con un codificador visual y un decodificador de lenguaje. El entrenamiento consistió en un fine-tuning (ajuste fino) realizado con Unsloth, que acelera el proceso de entrenamiento y conversión a GGUF. No se especifican el conjunto de datos utilizado, el número de tokens de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. La conversión a GGUF se realizó con Unsloth, lo que garantiza compatibilidad con llama.cpp y herramientas derivadas.

## Capacidades
- Generación de texto conversacional y multimodal: el modelo acepta entradas de imagen y texto, y produce respuestas de texto.
- Soporte de visión: el archivo `mmproj` indica capacidad de procesamiento de imágenes (image-text-to-text).
- Conversación multi-turno: etiqueta `conversational` sugiere optimización para diálogos.
- Despliegue local eficiente: formato GGUF cuantizado Q8_0, apto para CPU y GPU con llama.cpp.
- Compatibilidad con herramientas llama.cpp: `llama-cli` para texto y `llama-mtmd-cli` para multimodal.
- Capacidades multilingües: no confirmadas, pero el modelo base Gemma 4 soporta múltiples idiomas (según documentación de Google, aunque no se verifica para este fine-tuning).
- Tool calling / function calling: no disponible.
- Razonamiento multi-step: no disponible.

## Casos de uso
- Chatbot local con visión: un desarrollador puede integrar el modelo en una aplicación de escritorio o web que permita al usuario subir imágenes y hacer preguntas sobre ellas (por ejemplo, descripción de fotos, OCR básico o análisis de diagramas). Gracias a su tamaño de 4,65 B y cuantización Q8_0, cabe en una GPU de 8 GB VRAM o incluso en CPU con 16 GB RAM.
- Asistente de documentación técnica: dado su entrenamiento conversacional, puede usarse como un asistente que responde preguntas sobre manuales o capturas de pantalla de software, ayudando en la resolución de incidencias técnicas.
- Herramienta educativa de visión: en entornos educativos, el modelo puede explicar imágenes de gráficos, mapas o experimentos, facilitando el aprendizaje interactivo.
- Pruebas de concepto de aplicaciones multimodales: por su bajo coste de ejecución, es adecuado para prototipos rápidos de sistemas que combinan visión y lenguaje, como lectores de etiquetas o asistentes de accesibilidad.
- Análisis de imágenes en entornos con recursos limitados: se puede integrar en dispositivos embebidos o servidores sin GPU dedicada, mediante llama.cpp, para tareas como clasificación simple de imágenes o extracción de texto de capturas (OCR básico, aunque no está garantizado).
- Investigación y experimentación en fine-tuning: al ser un modelo abierto (posiblemente apache-2.0), sirve como base para que estudiantes y desarrolladores experimenten con técnicas de adaptación multimodal sin coste de licencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de visión (como VQA) para este modelo. Tampoco se ofrecen comparativas con otros modelos en la tarjeta del repositorio.

## Requisitos de hardware
- VRAM estimada para inferencia: con cuantización Q8_0 (≈4,65 GB para los pesos) más el proyector FP16 (≈0,5 GB), se necesitan aproximadamente 5,2 GB de VRAM para inferencia multimodal completa. Para texto puro, la VRAM mínima es de unos 4,7 GB.
- GPU recomendadas: tarjetas con 8 GB VRAM o más (por ejemplo, RTX 3060 12GB, RTX 4060 8GB, RTX 4070 12GB, o GPUs de datacenter como T4 16GB). También funciona en CPU con 16 GB de RAM usando llama.cpp.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media (RTX 3060, RTX 4060, etc.) con cuantización Q8_0. Para mayor velocidad, se puede usar Q4_K_M, aunque no se proporciona en el repositorio.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (si se convierte), vLLM (con conversión a safetensors), o el entorno de ejecución de Unsloth.
- Latencia y throughput: no disponibles. Como referencia, en una GPU RTX 4060, un modelo de 4,6B Q8_0 suele generar entre 15 y 30 tokens por segundo, pero es una estimación genérica, no medida para este modelo.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a características básicas. Los modelos comparables son otros de tamaño similar (≈4B) con capacidades multimodales:

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Dama-ai-brain (este) | 4,65B | No disponible | Sí (visión + texto) | Apache-2.0 (según variante MLX) | GGUF |
| Gemma 3 4B (Google) | 4B | 32k | Sí (vision) | Gemma Terms of Use | safetensors, GGUF |
| Qwen 2.5 VL 4B (Alibaba) | 4,4B | 32k | Sí (vision) | Apache-2.0 | safetensors, GGUF |
| LLaVA 1.6 7B (nota: 7B, tamaño superior) | 7B | 32k | Sí (vision) | Apache-2.0 | safetensors |

Nota: Dama-ai-brain es un fine-tuning de un modelo base Gemma 4, por lo que su rendimiento dependerá del fine-tuning; no hay datos para comparar con los modelos base. La licencia de la versión MLX es apache-2.0, pero no se confirma en la tarjeta GGUF.

## Limitaciones y advertencias
- Documentación técnica insuficiente: no se especifican arquitectura, datos de entrenamiento, ni rendimiento. Esto dificulta la evaluación de riesgos y la confianza en producción.
- Riesgo de alucinación: al ser un modelo pequeño y con fine-tuning desconocido, es probable que genere respuestas inventadas, especialmente en tareas de razonamiento o conocimiento factual.
- Sesgos desconocidos: sin información sobre el dataset de entrenamiento, no se puede evaluar sesgos de género, raza, idioma, etc.
- Limitaciones de contexto: no se conoce la longitud máxima de contexto; los modelos Gemma 4 base suelen tener 32k, pero el fine-tuning puede haberla reducido.
- Restricciones de licencia: aunque la variante MLX indica apache-2.0, la tarjeta GGUF no especifica licencia. Se recomienda verificar antes de uso comercial.
- Soporte multimodal limitado: el proyector FP16 es pequeño (≈0,2 GB) y puede que solo soporte imágenes de baja resolución o un número limitado de tokens de imagen. No hay documentación al respecto.
- Falta de mantenimiento: el repositorio tiene 0 descargas y 0 likes, y fue creado en agosto de 2026 (fecha futura, posible error del sistema). Puede que no reciba actualizaciones.
- Compatibilidad: solo se ofrecen archivos Q8_0 y FP16; no hay cuantizaciones más agresivas (Q4, Q5) para hardware con menos VRAM.

## Enlaces
- Repositorio Hugging Face (GGUF): https://huggingface.co/Taeri077/dama-ai-brain
- Variante MLX del mismo autor: https://huggingface.co/Taeri077/dama-aibrain-mlx
- Perfil del autor en Hugging Face: https://huggingface.co/Taeri077
- Repositorio relacionado del autor: https://huggingface.co/Taeri077/taeri-2nd-brain-v2
- Repositorio de otro autor con el mismo nombre: https://huggingface.co/WonseokJayJung/dama-aibrain
- Herramienta Unsloth (usada para la conversión): https://github.com/unslothai/unsloth
