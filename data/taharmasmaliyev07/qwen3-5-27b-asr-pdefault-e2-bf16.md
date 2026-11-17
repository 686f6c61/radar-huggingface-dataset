# taharmasmaliyev07/Qwen3.5-27B-ASR-PDEFAULT-E2-BF16

## Resumen

Qwen3.5-27B-ASR-PDEFAULT-E2-BF16 es un ajuste fino (fine-tune) publicado por el usuario taharmasmaliyev07 sobre un modelo de la familia Qwen3.5, identificado en el repositorio como `qwen3_5`. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base es multimodal (entrada de imagen y texto, salida de texto), aunque la model card no aporta ninguna descripción funcional del ajuste ni del objetivo de entrenamiento. El nombre del repositorio sugiere un ajuste orientado a reconocimiento automático de habla (ASR), pero esta interpretación no está confirmada por la documentación.

La información disponible es muy escasa: la model card es una plantilla generada automáticamente por Unsloth que solo indica el autor, la licencia Apache 2.0, el modelo base (que apunta al propio repositorio, sin resolución a un checkpoint original verificable) y que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face. No se documentan datos de entrenamiento, hiperparámetros, composición del dataset, número de tokens ni resultados de evaluación.

El tamaño del repositorio es de 0,5 GB, lo que resulta inconsistente con un modelo de 27 000 millones de parámetros en BF16 (que requeriría aproximadamente 54 GB), por lo que probablemente el repositorio contenga solo adaptadores LoRA, pesos parciales o una carga incompleta. Esta ficha refleja únicamente lo que puede verificarse en la información proporcionada y marca como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 27B segun el nombre del repositorio; no confirmado en la model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 segun el nombre del repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se presenta como un ajuste fino de un modelo `qwen3_5` con pipeline `image-text-to-text`, lo que implica una arquitectura multimodal con codificador de visión y decodificador de lenguaje. No se especifica si se trata de un transformer denso o de una mezcla de expertos (MoE), ni se detalla la variante concreta del backbone. El tag `unsloth` y la referencia a TRL indican que el ajuste se realizó con las herramientas de Unsloth para entrenamiento eficiente en memoria (LoRA/QLoRA o variantes optimizadas), aunque no se documentan el rango, el alpha ni las capas objetivo del adaptador.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF, DPO u otras etapas de alineación, ni sobre innovaciones técnicas específicas del ajuste. El nombre del repositorio incluye los sufijos `ASR`, `PDEFAULT` y `E2`, que podrían corresponder a una tarea de reconocimiento de voz, una configuración por defecto y una época o experimento, pero el autor no explica su significado.

## Capacidades

- Generación de texto condicionada por imagen y texto (pipeline `image-text-to-text`), heredada del modelo base multimodal.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con Transformers y con Text Generation Inference (TGI).
- Capacidad potencial de reconocimiento de habla si el sufijo `ASR` del nombre refleja el objetivo del ajuste, aunque no está documentado ni verificado.
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas o código: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (`en`).

## Casos de uso

- Evaluación de ajustes multimodales: el modelo puede emplearse como referencia para comparar el efecto de un fine-tune con Unsloth frente al modelo base Qwen3.5, siempre que se disponga del checkpoint original para la comparación.
- Experimentación en reconocimiento de habla (si se confirma el propósito del sufijo `ASR`): serviría para probar la transcripción de audio representado como entrada multimodal, aunque la falta de documentación impide garantizar este uso.
- Prototipado de asistentes conversacionales con entrada de imagen: al heredar el pipeline `image-text-to-text`, permite construir demos de descripción de imágenes o respuesta a preguntas visuales en inglés.
- Investigación sobre eficiencia de entrenamiento: el uso de Unsloth y TRL lo convierte en un caso de estudio para reproducir pipelines de fine-tune de bajo coste en modelos de 27B.
- Integración en pipelines de TGI: al declarar compatibilidad con Text Generation Inference, puede desplegarse como servicio HTTP para pruebas internas de generación multimodal.
- Base para nuevos ajustes: al publicarse con licencia Apache 2.0, puede servir como punto de partida para fine-tunes posteriores en dominios específicos, sujeto a la verificación de que los pesos estén completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54 GB para 27B parámetros, más el codificador de visión y el overhead de activaciones; no confirmado por el autor.
- VRAM estimada en cuantización de 8 bits: en torno a 27-30 GB; en 4 bits, en torno a 14-16 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o varias GPU de 24-48 GB con paralelismo de tensor.
- GPU de consumo: posible en RTX 4090 (24 GB) solo con cuantización de 4 bits y dependiendo del soporte multimodal; no confirmado.
- Opciones de despliegue: Transformers, Text Generation Inference (TGI) y, potencialmente, llama.cpp u Ollama si se generan pesos GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles.
- Nota: el repositorio ocupa 0,5 GB, por lo que es probable que no contenga los pesos completos del modelo de 27B; habría que verificar los archivos antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-ASR-PDEFAULT-E2-BF16 | 27B (segun nombre) | no disponible | Si (image-text-to-text) | Apache 2.0 | Hugging Face, repo de 0,5 GB |
| Qwen2.5-VL-32B-Instruct | 32B | 128K (segun documentacion publica de Qwen) | Si | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct | 7B | 128K (segun documentacion publica de Qwen) | Si | Apache 2.0 | Hugging Face |
| Llama 3.2 11B Vision | 11B | 128K (segun documentacion publica de Meta) | Si | Llama 3.2 Community License | Hugging Face |

La comparación con la familia Qwen3.5 original no puede completarse porque la información proporcionada no incluye especificaciones verificables del modelo base ni resultados de evaluación de este ajuste.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card es una plantilla automática sin descripción del ajuste, datos de entrenamiento ni evaluación.
- El campo `base_model` apunta al propio repositorio, lo que impide identificar el checkpoint original de Qwen3.5 utilizado.
- El tamaño del repositorio (0,5 GB) es incompatible con pesos BF16 completos de 27B, lo que sugiere que puede contener solo adaptadores o una carga parcial; verificar antes de usar.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación y sesgos: no evaluados por el autor; se heredan los del modelo base, que tampoco se detalla.
- Sin benchmarks publicados: no es posible comparar su calidad con alternativas de forma objetiva.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantías del autor sobre el origen de los datos de entrenamiento ni sobre el cumplimiento de licencias del modelo base.
- El nombre sugiere una tarea ASR, pero no hay evidencia de que el modelo procese audio; el pipeline declarado es imagen-texto.
- Fecha de creación futura (2026-11-17) en los metadatos, lo que puede indicar una configuración incorrecta del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/taharmasmaliyev07/Qwen3.5-27B-ASR-PDEFAULT-E2-BF16
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería citada): https://github.com/huggingface/trl
