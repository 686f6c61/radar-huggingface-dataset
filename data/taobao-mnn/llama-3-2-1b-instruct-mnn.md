# taobao-mnn/Llama-3.2-1B-Instruct-MNN

## Resumen

Llama-3.2-1B-Instruct-MNN es una versión cuantizada y empaquetada para inferencia con el motor MNN (Mobile Neural Network) de Alibaba del modelo meta-llama/Llama-3.2-1B-Instruct. Lo publica el equipo taobao-mnn, mantenedor del runtime MNN, y su objetivo es permitir ejecutar el modelo de 1B parámetros en dispositivos con recursos limitados (CPU de escritorio, móviles y entornos embebidos) mediante una cuantización HQQ de 4 bits con escalas en FP16.

El modelo conserva la arquitectura Transformer densa del Llama-3.2-1B-Instruct original: 16 capas y dimensión oculta de 2048. La conversión no altera los pesos de forma semántica, sino que los comprime para que quepan en memoria y se ejecuten con el backend LLM de MNN, que soporta fusión de transformadores y modo de bajo consumo de memoria.

Es relevante para desarrolladores que necesitan desplegar un asistente conversacional pequeño en local o en el borde sin GPU dedicada, manteniendo el multilingüismo del modelo base (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) y la licencia Llama 3.2. El repositorio ocupa 2,6 GB e incluye pesos MNN, tokenizador y embeddings separados en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2), 16 capas, dimension oculta 2048 |
| Parametros totales | 1B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4-bit, grupo 128, asimetrica; escalas FP16; embeddings en BF16 |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`, `tokenizer.mtok`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Llama-3.2-1B-Instruct de Meta: un transformer decoder-only denso con 16 capas y dimensión oculta de 2048. Esta versión no reentrena ni modifica el modelo; aplica una cuantización HQQ (Half-Quadratic Quantization) de 4 bits con tamaño de grupo 128 y esquema asimétrico tanto a los pesos del lenguaje como a la cabeza de salida, manteniendo las escalas de cuantización en FP16 y los embeddings en BF16 como fichero independiente.

El empaquetado está pensado para el backend LLM de MNN, que requiere compilar con `MNN_BUILD_LLM`, `MNN_LOW_MEMORY` y `MNN_SUPPORT_TRANSFORMER_FUSE`. La configuración por defecto es CPU, 4 hilos, `precision=low` y `memory=low`. La model card indica que la exportación se validó con MNN 3.6.2 (commit 54694759) en x64 CPU, con pruebas de alineación FP32, saludos, aritmética y traducción; los backends ARM FP16 y GPU no se verificaron. No se detallan datos de entrenamiento adicionales más allá de los del modelo base.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del ajuste Instruct del modelo base.
- Razonamiento básico y aritmética simple (validado en las pruebas de exportación).
- Traducción entre los idiomas soportados, aunque la model card admite imprecisiones en las explicaciones de traducción con la configuración por defecto.
- Multilingüismo en ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Inferencia en CPU sin GPU, con modos de bajo consumo de memoria.
- Soporte de tool calling y agentes: no confirmado en la información proporcionada para esta conversión MNN.
- Capacidades de visión o audio: no disponibles (modelo solo texto).

## Casos de uso

- Asistente conversacional local en escritorio: ejecutar el modelo con `llm_demo` de MNN en CPU de 4 hilos para prototipos de chat sin conexión ni GPU, aprovechando el modo `memory=low`.
- Aplicaciones móviles y embebidas: integrar el runtime MNN en apps Android/iOS o dispositivos con recursos limitados para generación de texto on-device, dado el tamaño reducido del modelo y la cuantización de 4 bits.
- Traducción y reescritura multilingüe: usar el modelo para traducciones entre los ocho idiomas soportados en herramientas internas, asumiendo posibles imprecisiones en explicaciones largas.
- Clasificación y extracción de información: procesar textos cortos (resúmenes, etiquetado, respuestas a preguntas) en pipelines por lotes donde el coste por inferencia en CPU es crítico.
- Generación de respuestas en asistentes de soporte de bajo coste: desplegar el modelo como primer nivel de atención automatizada en entornos sin infraestructura GPU, con derivación a modelos mayores cuando se requiera más calidad.
- Educación y experimentación: servir como modelo de referencia para estudiar cuantización HQQ y el flujo de exportación de MNN a partir de un checkpoint Llama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta pruebas de humo (alineación FP32, saludos, aritmética y traducción) en x64 CPU el 2026-11-26, sin métricas cuantitativas de calidad ni de latencia.

## Requisitos de hardware

- VRAM estimada: no aplica para el modo CPU por defecto; el repositorio ocupa 2,6 GB en disco. Para ejecución en GPU no se proporcionan cifras.
- GPU recomendadas: no disponibles; los backends GPU de MNN no se validaron en esta exportación.
- CPU: validado en x64 con 4 hilos y configuración `precision=low`, `memory=low`; el soporte ARM FP16 en móvil no se verificó.
- Cabe en hardware consumer sin GPU dedicada por el tamaño del modelo (1B) y la cuantización de 4 bits.
- Opciones de despliegue: runtime MNN (`llm_demo` y API LLM de MNN); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-MNN | 1B | no disponible | HQQ 4-bit | Llama 3.2 | MNN |
| meta-llama/Llama-3.2-1B-Instruct | 1B | no disponible | FP16/BF16 original | Llama 3.2 | safetensors |
| Otros modelos de 1B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (por ejemplo, otros modelos de 1B cuantizados para el borde) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card reconoce imprecisiones en las explicaciones de traducción con la configuración por defecto.
- Los backends ARM FP16 y GPU no se validaron; el uso en móvil o GPU queda sin garantías de calidad.
- La cuantización HQQ de 4 bits puede degradar la calidad frente al modelo base en tareas de razonamiento complejo.
- Riesgo de alucinación inherente a un modelo de 1B, mayor que en modelos de mayor tamaño.
- Longitud de contexto no documentada en esta conversión; no asumir la ventana del modelo base sin verificación.
- Uso comercial sujeto a la Llama 3.2 Community License, con política de uso aceptable y obligaciones de atribución ("Built with Llama").
- No se debe mezclar `tokenizer.txt` ni `llm.mnn.json` de revisiones antiguas; la model card advierte de mantener el directorio completo y sincronizar la caché.
- Capacidades de tool calling y agentes no confirmadas para esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Llama-3.2-1B-Instruct-MNN
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- ModelScope: https://modelscope.cn/models/MNN/Llama-3.2-1B-Instruct-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct/blob/main/LICENSE.txt
