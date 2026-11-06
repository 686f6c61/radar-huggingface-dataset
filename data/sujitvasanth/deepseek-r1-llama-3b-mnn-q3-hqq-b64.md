# sujitvasanth/DeepSeek-R1-Llama-3B-MNN-Q3-HQQ-B64

## Resumen

DeepSeek-R1-Llama-3B-MNN-Q3-HQQ-B64 es una conversión cuantizada del modelo suayptalha/DeepSeek-R1-Distill-Llama-3B, un fine-tune comunitario basado en la arquitectura Llama 3.2 que hereda el comportamiento de razonamiento de la familia DeepSeek-R1. El autor de esta conversión, sujitvasanth, ha exportado los pesos originales en Safetensors directamente a formato MNN con cuantización de 3 bits mediante HQQ (Half-Quadratic Quantization) y tamaño de bloque 64, sin pasar por una re-cuantización intermedia desde un modelo Q4.

El objetivo de esta ficha es ofrecer una variante ligera (1,4 GB en el repositorio) ejecutable en entornos con recursos limitados, especialmente CPU y dispositivos de borde, usando el runtime MNN. No se trata de un lanzamiento oficial de DeepSeek, sino de una conversión de comunidad que preserva la licencia Llama 3.2 del modelo upstream.

La relevancia actual radica en la demanda de modelos de razonamiento de pequeño tamaño desplegables localmente. Sin embargo, la propia model card advierte de que la cuantización a 3 bits puede degradar el comportamiento de razonamiento del modelo original, y no se han publicado evaluaciones formales de perplejidad ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3.2, fine-tune de destilación DeepSeek-R1) |
| Parametros totales | Aproximadamente 3B (heredados del modelo base DeepSeek-R1-Distill-Llama-3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3 bits HQQ, bloque 64, mapeo asimétrico, escalas FP16 |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | Llama 3.2 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), más `config.json`, `llm_config.json` y `tokenizer.mtok` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama 3.2, sobre el que se ha aplicado un proceso de destilación desde DeepSeek-R1 para transferir capacidades de razonamiento. El modelo intermedio (suayptalha/DeepSeek-R1-Distill-Llama-3B) es un fine-tune comunitario; esta ficha no dispone de detalles sobre el dataset de destilación, el número de tokens empleados ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de esta variante concreta es la cadena de conversión: exportación directa desde Safetensors originales a MNN con cuantización HQQ de 3 bits y bloque 64 en todas las capas lineales, incluida la cabeza de salida y los embeddings atados. La validación estática confirma 197 operadores Q3 cuantizados y los límites de offsets de pesos externos, pero no se ha medido el ahorro real de RAM en tiempo de ejecución ni se ha realizado una evaluación de perplejidad.

## Capacidades

- Generación de texto en inglés con comportamiento de razonamiento heredado de DeepSeek-R1 (cadena de pensamiento), potencialmente degradado por la cuantización a 3 bits.
- Razonamiento multi-paso y resolución de problemas, sujeto a la pérdida de precisión introducida por HQQ Q3.
- Generación de código y matemáticas, capacidades típicas de los modelos destilados de R1, aunque no verificadas en esta conversión.
- Ejecución en runtime MNN con soporte de pesos de bajo bit, orientada a CPU y dispositivos de borde.
- Integración con FULLassistant mediante descarga por URL del repositorio o escaneo de la biblioteca local de modelos.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Asistente de chat local en Windows: la model card reporta una prueba breve de chat en CPU con salidas sensatas, lo que permite desplegar un asistente de razonamiento en equipos sin GPU dedicada usando el runtime MNN.
- Prototipado en dispositivos de borde: con 1,4 GB de repositorio y cuantización de 3 bits, el modelo es candidato para pruebas en entornos con memoria limitada, aunque no se ha validado en teléfono.
- Experimentación con cuantización HQQ: útil para investigadores que quieran evaluar la degradación de razonamiento de un modelo destilado de R1 al pasar a 3 bits con bloque 64.
- Integración en FULLassistant: el flujo de descarga por URL o escaneo de biblioteca permite incorporar el modelo a un cliente de escritorio con gestión de modelos personalizados.
- Educación y demostraciones offline: permite mostrar cadenas de razonamiento de un modelo tipo R1 sin conexión a servicios en la nube.
- Evaluación comparativa de runtimes: sirve como caso de prueba para medir el rendimiento de MNN frente a otros backends en modelos de 3B cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha realizado evaluación formal de perplejidad, validación en teléfono ni benchmark de RAM residente.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 1,4 GB; el consumo en ejecución no se ha medido. Como referencia, un modelo de 3B en 3 bits requiere del orden de 1,5-2 GB de pesos más overhead del runtime y del contexto.
- GPU recomendadas: no se especifican; el formato MNN está orientado principalmente a CPU y aceleradores móviles.
- Compatibilidad con GPU de consumo: no confirmada; la única prueba reportada es en CPU de Windows.
- Opciones de despliegue: runtime MNN con soporte de pesos de bajo bit; integración con FULLassistant. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card menciona que el servidor HTTP local terminó tras varias respuestas sin causa identificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-R1-Llama-3B-MNN-Q3-HQQ-B64 (este) | ~3B | No disponible | 3 bits HQQ, bloque 64 | Llama 3.2 | MNN |
| suayptalha/DeepSeek-R1-Distill-Llama-3B (upstream) | ~3B | No disponible | Original (Safetensors) | Llama 3.2 | Safetensors |
| DeepSeek-R1-Distill-Llama-8B (oficial) | 8B | No disponible en esta ficha | Múltiples | Llama 3.1 | Safetensors, GGUF |
| Llama 3.2 3B Instruct (Meta) | 3B | 128K (según ficha oficial de Meta) | Múltiples | Llama 3.2 | Safetensors, GGUF |

La comparación directa con alternativas cuantizadas en GGUF no está disponible en la información proporcionada; los datos de contexto y rendimiento de los modelos de referencia deben consultarse en sus fichas oficiales.

## Limitaciones y advertencias

- La cuantización a 3 bits puede degradar el comportamiento de razonamiento del modelo original, tal como advierte la propia model card.
- No se ha realizado evaluación formal de perplejidad ni benchmarks; el rendimiento real es desconocido.
- El servidor HTTP local del runtime terminó tras varias respuestas sin causa identificada, lo que supone un riesgo para despliegues en producción.
- No se ha validado en teléfono ni se ha medido la RAM residente.
- El soporte y la eficiencia dependen del backend y de la CPU utilizados.
- Solo se declara inglés como idioma soportado; el rendimiento en castellano no está verificado.
- Es una conversión comunitaria, no un lanzamiento oficial de DeepSeek; debe seguirse la licencia Llama 3.2 del modelo upstream y las condiciones de uso aplicables.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- No se documentan sesgos conocidos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sujitvasanth/DeepSeek-R1-Llama-3B-MNN-Q3-HQQ-B64
- Modelo base: https://huggingface.co/suayptalha/DeepSeek-R1-Distill-Llama-3B
- Runtime MNN: no disponible en la información proporcionada
- FULLassistant: no disponible en la información proporcionada
- Paper de HQQ: no disponible en la información proporcionada
- Paper de DeepSeek-R1: no disponible en la información proporcionada
