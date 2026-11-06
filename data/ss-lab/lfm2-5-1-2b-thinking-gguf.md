# ss-lab/LFM2.5-1.2B-Thinking-GGUF

## Resumen

LFM2.5-1.2B-Thinking-GGUF es una conversión a formato GGUF del modelo LiquidAI/LFM2.5-1.2B-Thinking, publicada por el usuario ss-lab mediante llama.cpp. El modelo original pertenece a la familia LFM2.5 de Liquid AI, una generación de modelos compactos orientados a inferencia en dispositivo y despliegue con recursos limitados. Esta versión cuantizada mantiene el modo de razonamiento ("thinking") del checkpoint base y ofrece múltiples niveles de cuantización para adaptarse a distintos presupuestos de memoria.

El modelo cuenta con 1.170.340.608 parámetros totales (aproximadamente 1,2 mil millones), lo que lo sitúa en la categoría de modelos pequeños capaces de ejecutarse en GPU de consumo e incluso en CPU. La conversión incluye los formatos Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 y F16, generados a partir del checkpoint original en safetensors.

La relevancia de esta ficha radica en que permite evaluar rápidamente una alternativa ligera para tareas de generación de texto con razonamiento explícito, empaquetada en un formato ampliamente soportado por el ecosistema llama.cpp (Ollama, llama-cpp-python, LM Studio, etc.). No obstante, la información publicada por el autor de la conversión es mínima y no incluye datos de benchmarks, idiomas ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-1.2B-Thinking; la model card de la conversión no detalla la arquitectura) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16, F16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar la licencia de LiquidAI/LFM2.5-1.2B-Thinking) |
| Formato de pesos | GGUF (generado con llama.cpp); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La model card de esta conversión no proporciona detalles sobre la arquitectura interna del modelo base. Se sabe que deriva de LiquidAI/LFM2.5-1.2B-Thinking, un modelo de la familia LFM2.5 de Liquid AI, pero la información disponible en esta ficha no confirma si se trata de un transformer denso, un modelo híbrido (atención + SSM) u otra variante. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El proceso de conversión documentado es directo: los pesos originales se transformaron a GGUF mediante llama.cpp. Un detalle técnico relevante es que el archivo Q4_0 se cuantizó directamente desde los pesos F16 y no corresponde al checkpoint oficial QAD Q4_0, lo que puede implicar diferencias de calidad respecto a una cuantización QAD (quantization-aware distillation) publicada por el autor original. El repositorio ocupa 9,2 GB en total, lo que refleja la suma de todas las variantes de cuantización incluidas.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Modo de razonamiento explícito ("Thinking"), heredado del modelo base LFM2.5-1.2B-Thinking.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Ejecución en formatos GGUF mediante llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el modo thinking sugiere razonamiento, pero no se detalla).
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ser un modelo de ~1,2B parámetros en GGUF, puede ejecutarse en portátiles con GPU modesta o incluso en CPU, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Razonamiento ligero en el borde (edge): el modo thinking del modelo base lo hace adecuado para tareas de cadena de pensamiento en dispositivos con recursos limitados, como aplicaciones de escritorio o asistentes embebidos.
- Filtrado y clasificación de texto en pipelines: con cuantizaciones Q4_K_M o Q5_K_M se puede desplegar en servidores modestos para tareas de etiquetado, resumen o extracción de información.
- Evaluación comparativa de cuantizaciones: el repositorio incluye Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 y F16, lo que permite medir la degradación de calidad frente al tamaño en un mismo modelo.
- Integración en aplicaciones de escritorio con llama.cpp: herramientas como LM Studio u Ollama pueden cargar directamente los GGUF para ofrecer generación de texto offline.
- Pruebas de concepto de razonamiento en entornos sin conectividad: al no requerir API externa, el modelo puede usarse en escenarios air-gapped para validar flujos de razonamiento antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño del archivo GGUF):
  - Q4_0 / Q4_K_M: en torno a 0,7-0,9 GB de pesos.
  - Q5_K_M: en torno a 0,9-1,1 GB.
  - Q6_K: en torno a 1,1-1,3 GB.
  - Q8_0: en torno a 1,3-1,5 GB.
  - F16 / BF16: en torno a 2,3-2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4-Q8; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes y permitirán contexto amplio y mayor throughput.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1650 en adelante para Q4; RTX 3060 o superior para F16 con contexto largo).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF; también puede servirse mediante contenedores con endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Thinking-GGUF (este) | 1,17B | no disponible | other | GGUF | Conversión no oficial de ss-lab |
| LiquidAI/LFM2.5-1.2B-Thinking | ~1,2B | no disponible | other | safetensors | Modelo base original de Liquid AI |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según versión) | Apache 2.0 | safetensors, GGUF | Alternativa popular de tamaño similar |
| Llama 3.2 1B Instruct | 1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta de tamaño comparable |

La comparación con Qwen2.5-1.5B-Instruct y Llama 3.2 1B Instruct se ofrece como referencia de categoría; no se dispone de datos de rendimiento del modelo de esta ficha para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card de la conversión es mínima: no documenta arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- El archivo Q4_0 se cuantizó desde F16 y no es el checkpoint oficial QAD Q4_0; puede presentar una calidad inferior a la cuantización QAD publicada por el autor original.
- Licencia "other": es imprescindible revisar los términos de LiquidAI/LFM2.5-1.2B-Thinking antes de cualquier uso comercial, ya que la conversión hereda las restricciones del modelo base.
- Riesgo de alucinación inherente a modelos de ~1,2B parámetros; no se han publicado evaluaciones de fidelidad.
- No se dispone de información sobre sesgos conocidos ni sobre cobertura idiomática.
- Al ser una conversión no oficial con 0 descargas y 1 like en el momento de la consulta, carece de validación comunitaria.
- No se especifica la longitud de contexto soportada; el rendimiento con contextos largos no está garantizado.
- El repositorio ocupa 9,2 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/ss-lab/LFM2.5-1.2B-Thinking-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- llama.cpp (herramienta de conversión): https://github.com/ggerganov/llama.cpp
