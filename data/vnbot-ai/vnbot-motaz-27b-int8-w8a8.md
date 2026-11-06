# vnbot-ai/VNBot-MotaZ-27B-INT8-W8A8

## Resumen

VNBot-MotaZ-27B-INT8-W8A8 es una versión cuantizada a INT8 (esquema W8A8) del modelo multimodal VNBot-MotaZ-27B, desarrollado por vnbot-ai (Origo Technologies). El modelo original es un asistente de IA que procesa texto e imagen (pipeline `image-text-to-text`) y está orientado a los idiomas vietnamita e inglés. Esta variante reduce los pesos a 8 bits con cuantización de pesos y activaciones, lo que da un tamaño de repositorio de aproximadamente 32 GB frente a los ~54 GB que ocuparía el modelo base en BF16.

La relevancia de esta ficha radica en que se trata de una publicación de pesos abiertos bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales, y con un contexto declarado de 262.144 tokens. Sin embargo, la información técnica publicada por el autor es mínima: no se detallan datos de entrenamiento, composición del dataset ni resultados de benchmarks. Además, el propio autor advierte que esta variante INT8 no ha sido probada con vLLM, lo que introduce un riesgo operativo relevante para despliegues en producción.

El modelo se apoya en la arquitectura `qwen3_5` según los tags de Hugging Face, lo que sugiere una base derivada de la familia Qwen 3.5, aunque no se confirma en la model card. La cuantización se realiza con `compressed-tensors`, el formato nativo de vLLM para pesos comprimidos, y el repositorio se marca como compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 27B (según nombre del modelo); desglose no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según model card) |
| Tipos de cuantizacion | INT8 W8A8 (pesos y activaciones a 8 bits), formato `compressed-tensors` |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizados, `compressed-tensors`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá del tag `qwen3_5` y la designación multimodal (`image-text-to-text`). Por el nombre y el pipeline, se trata de un transformer con capacidad de procesamiento de imagen y texto, presumiblemente con un codificador visual acoplado a un decodificador de lenguaje, pero la model card no especifica ni el tipo de vision encoder, ni la estrategia de fusión multimodal, ni el número de capas o cabezas.

Tampoco se documentan los datos de entrenamiento: no se indica el volumen de tokens, la composición del corpus, ni si hubo etapas de ajuste supervisado, RLHF o DPO. La única información técnica concreta es la relativa a la cuantización: se aplica un esquema W8A8 (8 bits para pesos y activaciones) empaquetado en `compressed-tensors`, lo que reduce el peso en disco a unos 32 GB. No se detalla el algoritmo de cuantización (por ejemplo, GPTQ, AWQ o cuantización estática por canal) ni si se aplicó calibración con datos representativos.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés.
- Comprensión de imágenes y respuesta multimodal (image-text-to-text), según el pipeline declarado.
- Conversación multi-turno, con contexto declarado de hasta 262.144 tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a vietnamita e inglés según los metadatos; no se declaran otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- **Atención al cliente en vietnamita**: el modelo puede gestionar conversaciones multi-turno en vietnamita con un contexto de hasta 262.144 tokens, lo que permite arrastrar historiales largos o documentación de producto sin truncar. Es adecuado por su soporte nativo del idioma y su licencia permisiva.
- **Procesamiento de documentos escaneados con OCR asistido**: al ser image-text-to-text, puede recibir imágenes de facturas, formularios o capturas y extraer información en texto, integrándose en pipelines de digitalización para empresas vietnamitas.
- **Análisis de capturas de pantalla en soporte técnico**: un operador puede adjuntar una captura de error y el modelo describir el problema o sugerir pasos de resolución, aprovechando la entrada visual y el contexto largo para incluir manuales.
- **Asistente interno bilingüe vi/en**: despliegue en una organización que opere en Vietnam y en inglés, con un único modelo que cubre ambos idiomas y evita mantener dos sistemas separados.
- **Generación de descripciones de producto a partir de imágenes**: para catálogos de e-commerce, el modelo puede recibir la foto de un artículo y generar texto descriptivo en vietnamita o inglés.
- **Prototipado rápido con vLLM**: al estar empaquetado en `compressed-tensors` y ofrecer un comando de servicio directo (`vllm serve ... --max-model-len 262144`), sirve para validar flujos multimodales en entornos con GPUs de 40-80 GB antes de invertir en el modelo completo en BF16.
- **Investigación sobre cuantización INT8 multimodal**: útil como punto de comparación para estudiar la degradación de calidad de un modelo de 27B al pasar de BF16 a W8A8 en tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repositorio ocupa aproximadamente 32 GB en INT8 W8A8. En la práctica, vLLM necesita además memoria para el KV cache, que con 262.144 tokens de contexto puede ser muy elevada; se recomienda reservar al menos 48-80 GB de VRAM para contextos largos.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o L40S 48 GB para contexto completo. En GPUs de 40 GB (A100 40 GB, A6000) sería necesario reducir `--max-model-len`.
- **Consumer GPU**: no cabe en GPUs de 24 GB (RTX 4090, 3090) con el esquema INT8 W8A8 completo, salvo reduciendo drásticamente el contexto y aun así el peso de 32 GB excede la VRAM disponible. No se documenta una variante GGUF para llama.cpp u Ollama.
- **Opciones de despliegue**: vLLM es la vía indicada por el autor (`vllm serve vnbot-ai/VNBot-MotaZ-27B-INT8-W8A8 --max-model-len 262144`), gracias al formato `compressed-tensors`. No se confirma compatibilidad con TGI, llama.cpp, Ollama ni SGLang.
- **Latencia y throughput**: no disponibles. El autor advierte explícitamente que esta variante "aún no se ha probado con vLLM", por lo que el rendimiento real es desconocido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B-INT8-W8A8 | 27B | 262.144 | texto + imagen | Apache-2.0 | Cuantizado W8A8, sin benchmarks publicados, no probado en vLLM |
| VNBot-MotaZ-27B (base) | 27B | 262.144 | texto + imagen | Apache-2.0 | Modelo original en BF16, ~54 GB |
| Qwen2.5-VL-32B-Instruct | 32B | 128K | texto + imagen | Apache-2.0 | Familia Qwen, benchmarks públicos, amplio soporte en vLLM |
| Gemma 3 27B IT | 27B | 128K | texto + imagen | Gemma Terms | Multimodal, requiere aceptar términos de uso |

La comparación con Qwen2.5-VL y Gemma 3 es orientativa por rango de parámetros y modalidad; no se dispone de datos de rendimiento de VNBot-MotaZ que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Sin benchmarks ni evaluación publicada**: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, lo que impide estimar su calidad real frente a alternativas.
- **Riesgo de alucinación**: no cuantificado por el autor; como en cualquier LLM, especialmente en tareas de OCR o descripción de imágenes, puede generar contenido plausible pero incorrecto.
- **Cobertura idiomática limitada**: solo se declaran vietnamita e inglés. El rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Cuantización no validada**: el autor indica que esta variante INT8 no se ha probado con vLLM. La degradación de calidad respecto al modelo BF16 no está medida.
- **Contexto de 262.144 tokens**: aunque se declara, no se confirma que se haya validado empíricamente; el KV cache a esa longitud exige hardware de gama alta.
- **Licencia Apache-2.0**: permite uso comercial, pero se debe revisar `NOTICE` por posibles atribuciones adicionales derivadas del modelo base.
- **Trazabilidad limitada**: el modelo base (`vnbot-ai/VNBot-MotaZ-27B`) no está descrito en detalle en la información disponible, por lo que se desconoce su procedencia exacta y los datos de entrenamiento.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que la comunidad haya detectado problemas.

## Enlaces

- Hugging Face: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-INT8-W8A8
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- Documentación de vLLM: https://docs.vllm.ai/
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
