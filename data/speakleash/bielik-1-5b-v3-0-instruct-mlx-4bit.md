# speakleash/Bielik-1.5B-v3.0-Instruct-MLX-4bit

## Resumen

Bielik-1.5B-v3.0-Instruct-MLX-4bit es una versión cuantizada a 4 bits del modelo Bielik-1.5B-v3.0-Instruct, desarrollado por SpeakLeash, el proyecto comunitario polaco de modelos de lenguaje abiertos. El modelo base es un transformer de tipo Llama con 1.596.507.648 parámetros (aproximadamente 1,5 mil millones), especializado en el idioma polaco y ajustado para seguir instrucciones. Esta variante está empaquetada en el formato MLX, lo que la hace ejecutable de forma nativa en hardware Apple Silicon (chips M1, M2, M3, M4 y superiores).

El problema que resuelve es doble: por un lado, ofrece un modelo de instrucciones en polaco de tamano reducido que puede ejecutarse en un portátil o en un Mac de sobremesa sin GPU dedicada; por otro, la cuantización a 4 bits reduce el repositorio a 1,1 GB, facilitando su distribución y despliegue en entornos con memoria unificada limitada. El modelo base Bielik v3.0 se enmarca en la familia Bielik de SpeakLeash, orientada a cubrir las carencias de los modelos multilingües genéricos en tareas de lengua polaca.

La relevancia de esta ficha radica en que combina tres factores poco frecuentes: licencia Apache 2.0 (permisiva para uso comercial), un modelo especializado en un idioma europeo de tamano medio y un formato de inferencia optimizado para el ecosistema Apple. No obstante, la información publicada por el autor es muy escasa: no se detallan datos de entrenamiento, benchmarks ni la plantilla de chat más allá de indicar que se preserva la original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (deducido de la etiqueta `llama` y del formato MLX) |
| Parametros totales | 1.596.507.648 (aprox. 1,5 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX affine INT4, calibrado con AWQ W4A16_ASYM, group size 32) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (INT4 empaquetado, escalas y sesgos en BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo Llama con aproximadamente 1,5 mil millones de parámetros. La model card de esta variante no aporta detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO); esa información correspondería a la ficha de `speakleash/Bielik-1.5B-v3.0-Instruct`, que no se ha proporcionado. La única información técnica disponible se refiere al proceso de cuantización.

La cuantización se realizó mediante AWQ con configuración W4A16_ASYM (pesos a 4 bits, activaciones a 16 bits, asimétrica) y group size 32, y posteriormente se reempaquetó al formato affine INT4 nativo de MLX. Las siete proyecciones lineales de cada bloque transformer quedan en INT4; los embeddings, la `lm_head` y otros tensores que AWQ deja sin cuantizar se mantienen en BF16. Las escalas y los sesgos afines usan BF16, con un error de redondeo de sesgo verificado inferior a 1/16 de un paso de cuantización. Se preservan el tokenizador y la plantilla de chat originales en BF16.

## Capacidades

- Generación de texto en polaco con ajuste por instrucciones (modelo `-Instruct`).
- Razonamiento y respuesta a preguntas en lengua polaca.
- Generación y explicación de código, aunque sin datos publicados sobre su rendimiento específico.
- Conversación multi-turno mediante la plantilla de chat original preservada.
- Capacidades multilingües limitadas al polaco según la etiqueta de idioma del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistentes de escritorio en macOS: al estar en formato MLX y ocupar 1,1 GB, el modelo puede ejecutarse en un Mac con chip M1 o superior usando `mlx-lm`, sirviendo como asistente local de redacción en polaco sin conexión a la nube.
- Procesamiento por lotes de textos en polaco: clasificación, resumen o reescritura de documentos en pipelines locales donde la memoria unificada es limitada y no se dispone de GPU dedicada.
- Prototipado rápido de aplicaciones en polaco: gracias a su licencia Apache 2.0 y su tamano reducido, es adecuado para validar ideas de producto antes de escalar a modelos mayores de la familia Bielik.
- Educación y demostraciones: permite mostrar el funcionamiento de un LLM ajustado a instrucciones en un portátil, con tiempos de carga bajos y sin infraestructura de servidor.
- Filtrado y preprocesado de corpus: generación de etiquetas, normalización o detección de idioma en conjuntos de datos polacos dentro de un flujo de trabajo de ciencia de datos.
- Desarrollo de complementos para aplicaciones Apple: integración mediante la librería `mlx` en apps de macOS o iOS (en equipos compatibles) para tareas de generación de texto embebida.
- Base para fine-tuning ligero: al ser un modelo pequeño y con licencia permisiva, puede servir como punto de partida para ajustes específicos de dominio en polaco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: aproximadamente 1,1 GB solo para los pesos en 4 bits; con overhead de contexto y activaciones, se recomienda al menos 2-3 GB de memoria unificada.
- Hardware objetivo: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante la librería `mlx`.
- GPU dedicadas (NVIDIA/AMD): el formato MLX no es compatible de forma nativa; para CUDA sería necesario usar la versión original en BF16 o una cuantización GGUF del modelo base.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí, en cualquier Mac con chip M1 o superior. En el ecosistema NVIDIA, la versión MLX no es ejecutable; la versión BF16 del modelo base (unos 3,2 GB en FP16) cabría en GPUs con 6-8 GB de VRAM.
- Opciones de despliegue: `mlx-lm` (recomendado para este repositorio), y para el modelo base, vLLM, llama.cpp, Ollama o TGI con los formatos correspondientes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-1.5B-v3.0-Instruct-MLX-4bit | 1,5 B | no disponible | pl | Apache 2.0 | MLX safetensors (INT4) |
| Bielik-1.5B-v3.0-Instruct (base) | 1,5 B | no disponible | pl | Apache 2.0 | safetensors (BF16) |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (según documentación pública de Qwen) | multilingüe (incluye pl de forma limitada) | Apache 2.0 | safetensors, GGUF, MLX |
| Llama-3.2-1B-Instruct | 1,2 B | 128 000 tokens (según documentación pública de Meta) | multilingüe | Llama 3.2 Community License | safetensors, GGUF, MLX |

La comparativa se limita a datos públicos de los modelos alternativos; no se dispone de benchmarks del modelo Bielik en la información proporcionada, por lo que no es posible comparar rendimiento de forma cuantitativa. La ventaja diferencial de Bielik es su especialización en polaco y su licencia Apache 2.0 plenamente permisiva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente con corpus polacos, puede reflejar sesgos presentes en dichos datos.
- Riesgo de alucinación: inherente a los modelos de 1,5 B de parámetros; la capacidad de razonamiento y verificación factual es limitada en comparación con modelos mayores.
- Limitaciones de idioma: el repositorio declara únicamente polaco; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card; conviene consultar la ficha del modelo base antes de usarlo en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, el usuario debe verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Compatibilidad: el formato MLX solo funciona en hardware Apple Silicon con la librería `mlx`; no es portable a CUDA ni a CPU convencional sin reconversión.
- Producción: al ser una cuantización de 4 bits, puede haber una degradación de calidad frente al modelo BF16 original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Organización SpeakLeash: https://huggingface.co/speakleash
- Librería MLX: https://github.com/ml-explore/mlx
- Repositorio `mlx-lm`: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Proyecto SpeakLeash: https://speakleash.org
