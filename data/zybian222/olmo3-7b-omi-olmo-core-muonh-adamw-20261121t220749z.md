# zybian222/olmo3-7b-omi-olmo-core-muonh-adamw-20261121t220749z

## Resumen

OLMo-3 7B OMI SFT (variante `muonh_adamw`) es un ajuste fino supervisado (SFT) del modelo base `allenai/Olmo-3-1025-7B` de Ai2, publicado por el usuario `zybian222` en Hugging Face. El entrenamiento se ha realizado con OLMo-core, el framework nativo de Ai2, empleando empaquetado de secuencias (packed SFT) con máscaras de respuesta y atención aislada por documento, y usando como dataset NVIDIA OpenMathInstruct-2 (licencia CC BY 4.0). El resultado es un modelo de 7.298.011.136 parámetros orientado a generación de texto y conversación, con especial énfasis en razonamiento matemático por la naturaleza del corpus de entrenamiento.

La relevancia de esta ficha radica en que se trata de un fine-tune de la familia OLMo 3, una de las pocas familias de modelos abiertos que publican pesos, datos y recetas de entrenamiento de forma completa. Esta variante concreta documenta una elección de optimizador específica (`muonh_adamw`, presumiblemente Muon con corrección tipo AdamW para ciertos parámetros) y sigue la receta upstream con diferencias recogidas en `run_config.json`. Al estar bajo licencia Apache 2.0 y con pesos en safetensors compatibles con `transformers`, es directamente utilizable en pipelines estándar.

No obstante, conviene subrayar que se trata de un artefacto de investigación con muy baja tracción (42 descargas, 0 likes en el momento de la consulta) y sin model card extendida más allá de un párrafo. La información sobre idiomas, benchmarks y detalles de entrenamiento es escasa; esta ficha marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, según modelo base) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE según el dato de parámetros totales) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del OLMo-3 7B de Ai2 (`allenai/Olmo-3-1025-7B`), por lo que hereda la arquitectura transformer decoder-only de dicha familia. El entrenamiento se ha ejecutado con OLMo-core en modo SFT empaquetado ("native OLMo-core packed SFT"), aplicando máscaras de respuesta para que la pérdida se calcule únicamente sobre los tokens del asistente, y atención aislada por documento ("document-isolated attention") para evitar contaminación cruzada entre ejemplos dentro de un mismo paquete de secuencias. Esta combinación es la práctica habitual para maximizar el aprovechamiento de la ventana de contexto durante el SFT sin degradar la calidad por fugas de información entre documentos.

El dataset empleado es NVIDIA OpenMathInstruct-2 (CC BY 4.0), un corpus sintético orientado a instrucciones y razonamiento matemático. La model card indica que se trata de un "full run" y remite a `run_config.json` para los detalles de optimizador, duración del entrenamiento, fuentes fijadas y diferencias respecto a la receta upstream. El nombre del repositorio sugiere el uso de un optimizador híbrido etiquetado como `muonh_adamw`; no se dispone de más detalle técnico sobre su implementación en la información proporcionada. No consta información sobre número de tokens de entrenamiento, composición exacta del dataset más allá del nombre, ni sobre fases de RLHF/DPO posteriores.

## Capacidades

- Generación de texto y conversación multi-turno, según el `pipeline_tag` (`text-generation`) y la etiqueta `conversational`.
- Razonamiento matemático e instrucciones: el SFT sobre OpenMathInstruct-2 está orientado a este dominio, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Seguimiento de instrucciones en formato chat: el uso de máscaras de respuesta sugiere un formato de conversación con roles definidos.
- Capacidades heredadas del modelo base OLMo-3 7B (no verificadas de forma independiente en esta variante).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Resolución de problemas matemáticos paso a paso: el ajuste sobre OpenMathInstruct-2 lo hace adecuado para generar soluciones razonadas en entornos educativos o de verificación, siempre que se valide numéricamente la salida.
- Tutoría automatizada de matemáticas: puede gestionar diálogos multi-turno en los que el alumno plantea un problema y el modelo propone pasos intermedios, aprovechando el formato conversacional del SFT.
- Generación de datasets sintéticos de razonamiento: útil como generador de cadenas de razonamiento para aumentar corpus de entrenamiento de otros modelos, dado su sesgo hacia problemas matemáticos.
- Evaluación comparativa de recetas de SFT: al documentar una elección de optimizador concreta (`muonh_adamw`) frente a la receta upstream, sirve como punto de comparación en experimentos de reproducibilidad de fine-tuning.
- Asistente interno de cálculo y formulación: integrable en herramientas de ingeniería o finanzas para explicar derivaciones y comprobaciones, con validación humana obligatoria por el riesgo de alucinación.
- Base para fine-tunes de dominio: al ser Apache 2.0 y estar en safetensors compatibles con `transformers`, puede servir como punto de partida para ajustes posteriores en nichos específicos (física, estadística, etc.).
- Experimentación académica con OLMo-core: útil para investigadores que quieran reproducir o extender la receta de SFT empaquetado con atención aislada por documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 14,6 GB solo para pesos (7.298 M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 16 y 20 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 8 GB para pesos, con margen adicional para activaciones.
- VRAM estimada en cuantización de 4 bits (si se generan pesos GGUF/AWQ, no confirmados): alrededor de 4-5 GB para pesos.
- GPU recomendadas para servicio en producción: A100 40/80 GB, H100 80 GB o L40S para despliegues con concurrencia y contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado, y en RTX 3090/4080 (16 GB) solo con cuantización de 8 bits o inferior.
- Opciones de despliegue: `transformers` (confirmado por la librería declarada); vLLM, TGI, llama.cpp u Ollama son viables en principio al ser una arquitectura transformer estándar, pero no están confirmados en la información proporcionada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `zybian222/olmo3-7b-omi-olmo-core-muonh-adamw-...` | 7,30 B | no disponible | Apache 2.0 | Hugging Face | Fine-tune SFT sobre OpenMathInstruct-2; tracción baja (42 descargas) |
| `allenai/Olmo-3-1025-7B` (modelo base) | ~7 B | no disponible | Apache 2.0 (según familia OLMo) | Hugging Face | Modelo base oficial de Ai2; sin SFT específico de matemáticas |
| Mistral 7B (referencia de categoría) | 7,24 B | 32 K (versión base) | Apache 2.0 | Hugging Face | Alternativa consolidada de tamaño similar; sin sesgo matemático específico |
| Qwen2.5-Math-7B (referencia de categoría) | ~7 B | 4 K (versión típica) | Apache 2.0 (según variante) | Hugging Face | Modelo especializado en matemáticas con evaluación pública; comparación cualitativa, no medida en esta ficha |

La comparación con Mistral 7B y Qwen2.5-Math-7B es orientativa: no se dispone de benchmarks de esta variante que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de OLMo-3 y entrenarse sobre un corpus sintético de matemáticas, puede heredar sesgos del modelo base y del generador del dataset.
- Riesgo de alucinación: elevado en dominios fuera de las matemáticas y en problemas matemáticos que requieran verificación simbólica; el SFT sobre datos sintéticos no garantiza corrección factual.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto; el uso en producción multilingüe requiere validación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset OpenMathInstruct-2 está bajo CC BY 4.0, lo que exige atribución; conviene revisar las obligaciones de atribución si se redistribuye el modelo o derivados.
- Caveat de producción: se trata de un artefacto de investigación con 42 descargas y sin evaluaciones publicadas; no se recomienda su despliegue en producción sin una batería de pruebas propia.
- El nombre del repositorio incluye una marca temporal (`20261121t220749z`) que sugiere un experimento puntual, no una versión mantenida.
- No se dispone de información sobre el `run_config.json` referenciado en la model card en la información proporcionada; conviene consultarlo en el repositorio antes de reutilizar la receta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zybian222/olmo3-7b-omi-olmo-core-muonh-adamw-20261121t220749z
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset OpenMathInstruct-2 (NVIDIA): https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Organización Ai2 en Hugging Face: https://huggingface.co/allenai
- Repositorio OLMo-core (referencia de framework): https://github.com/allenai/OLMo-core
- Repositorio OLMo (referencia de familia): https://github.com/allenai/OLMo
