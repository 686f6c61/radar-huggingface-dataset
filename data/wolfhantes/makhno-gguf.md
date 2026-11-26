# Wolfhantes/Makhno-GGUF

## Resumen

Makhno-GGUF es una conversión al formato GGUF de un modelo de la familia Qwen3.5, publicada por el usuario Wolfhantes en Hugging Face. Según los nombres de los ficheros incluidos en el repositorio (`Qwen3.5-4B.BF16.gguf`, `Qwen3.5-4B.Q4_K_M.gguf` y `Qwen3.5-4B.BF16-mmproj.gguf`), se trata de la variante de 4B de parámetros de Qwen3.5, una familia de modelos de Alibaba que, en esta entrega, incorpora capacidades de visión y lenguaje (el prefijo `mmproj` corresponde al proyector multimodal que usa `llama.cpp` para modelos VLM).

El dato real de parámetros en safetensors es de 4.326.350.848 (aproximadamente 4,33 mil millones), coherente con la denominación 4B. El repositorio ocupa 12,2 GB, lo que se explica por incluir tanto pesos en BF16 (unos 8,6 GB para los pesos del modelo) como una cuantización Q4_K_M y el proyector multimodal. El modelo se distribuye exclusivamente en GGUF, pensado para su ejecución con `llama.cpp` y compatible con el endpoint de Hugging Face.

La relevancia de esta ficha es doble: por un lado, documenta una conversión práctica de un modelo Qwen3.5 de 4B a GGUF para inferencia local; por otro, la información pública disponible es muy escasa (0 descargas, 0 likes, sin licencia ni idiomas declarados, sin model card técnica), por lo que muchos apartados deben marcarse como no disponibles. La conversión se realizó con la herramienta de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (según nomenclatura de los ficheros); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (≈4,33B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y Q4_K_M (ficheros incluidos); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como origen de la conversión; el repo solo publica GGUF) |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna más allá de la inferida por la nomenclatura: se trata de un modelo Qwen3.5 de 4B parámetros, presumiblemente un transformer decoder-only, con un componente multimodal (proyector `mmproj`) que permite procesar imágenes junto con texto. El repositorio no incluye detalles sobre número de capas, dimensión oculta, mecanismo de atención, tipo de normalización ni estrategia de positional encoding.

Tampoco hay información sobre el entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o RL con verificación. La única innovación documentada es la propia conversión a GGUF mediante Unsloth, que facilita la ejecución local con `llama.cpp`. Cualquier afirmación adicional sobre arquitectura o entrenamiento sería especulativa y no se incluye.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal (visión-lenguaje): el fichero `Qwen3.5-4B.BF16-mmproj.gguf` es el proyector necesario para usar el modelo con imágenes mediante `llama-mtmd-cli`.
- Ejecución local con `llama.cpp`, incluyendo soporte de plantillas de chat con `--jinja`.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- Capacidades de razonamiento, código o matemáticas: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Inferencia local en portátil o estación de trabajo: al ser un modelo de 4,33B en Q4_K_M (aproximadamente 2,7 GB), puede cargarse con `llama.cpp` en equipos sin GPU dedicada y ejecutarse en CPU con velocidades aceptables para chat interactivo.
- Prototipado de asistentes conversacionales: el modelo puede gestionar diálogos multi-turno mediante `llama-cli` con plantilla Jinja, útil para validar prompts y flujos antes de pasar a un modelo mayor.
- Procesamiento de imágenes con descripción textual: usando `llama-mtmd-cli` y el proyector `mmproj`, se puede pasar una imagen y pedir descripciones, extracción de texto visible o preguntas sobre el contenido, en un entorno local sin enviar datos a la nube.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para procesar documentos o imágenes sensibles sin salida de datos.
- Integración en pipelines de CI/CD para pruebas de regresión de prompts: un modelo de 4B permite ejecutar suites de evaluación de calidad de respuestas de forma económica y repetible.
- Despliegue en dispositivos edge o contenedores pequeños: el tamaño reducido del GGUF Q4_K_M facilita su inclusión en imágenes Docker ligeras o en hardware con poca memoria.
- Base para fine-tuning o experimentación con cuantizaciones: al estar en GGUF, sirve como punto de partida para pruebas de rendimiento entre cuantizaciones (BF16 frente a Q4_K_M) y para medir el impacto en calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: BF16 requiere aproximadamente 8,6 GB solo para los pesos, más overhead de contexto y el proyector multimodal; Q4_K_M requiere aproximadamente 2,7 GB para los pesos, más overhead.
- GPU recomendadas: para BF16, una RTX 4090 (24 GB) o A100/H100 con margen amplio; para Q4_K_M, una RTX 3060 (12 GB) o superior es suficiente y sobra memoria.
- Cabe en GPU de consumo: sí, en Q4_K_M cabe en GPUs con 6-8 GB de VRAM o incluso en CPU; en BF16 requiere al menos 12 GB de VRAM para un contexto moderado.
- Opciones de despliegue: `llama.cpp` (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, servidores `llama-server`). vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Makhno-GGUF (Qwen3.5-4B) | 4,33B | no disponible | no disponible | GGUF | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct (referencia de la familia anterior) | 3,09B | 32.768 tokens (ampliable) | Apache 2.0 (según la familia Qwen2.5) | safetensors, GGUF | Amplia, muy descargado |
| Llama 3.2 3B Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Amplia, muy descargado |
| Phi-3.5-mini-instruct | 3,82B | 128.000 tokens | MIT | safetensors, GGUF | Amplia, muy descargado |

La comparación con Qwen2.5-3B, Llama 3.2 3B y Phi-3.5-mini se ofrece como referencia de categoría (modelos pequeños de 3-4B); los datos de contexto y licencia de esos modelos corresponden a sus fichas oficiales y no a la información proporcionada para Makhno-GGUF. Para Makhno-GGUF no hay datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Información pública mínima: 0 descargas, 0 likes, sin model card técnica, sin licencia declarada y sin idiomas especificados; esto impide evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo Qwen3.5 original antes de cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos generativos de 4B; no hay datos de evaluación que permitan acotarlo.
- Sesgos: no se han documentado sesgos conocidos, pero la ausencia de información no implica ausencia de sesgos.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto efectiva y los idiomas soportados; no se debe asumir un rendimiento multilingüe sin verificación.
- Conversión de terceros: al ser una conversión no oficial realizada por un usuario (Wolfhantes) mediante Unsloth, no hay garantía de fidelidad respecto al modelo original; conviene validar la calidad frente a los pesos oficiales.
- Repositorio sin mantenimiento aparente: creado y actualizado el mismo día (26 de noviembre de 2026), sin actividad posterior conocida.
- Para multimodal, es obligatorio usar `llama-mtmd-cli` con el fichero `mmproj`; `llama-cli` no procesará imágenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Wolfhantes/Makhno-GGUF
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- Repositorio de llama.cpp (referenciado por las etiquetas): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo oficiales del modelo: no disponibles en la información proporcionada.
