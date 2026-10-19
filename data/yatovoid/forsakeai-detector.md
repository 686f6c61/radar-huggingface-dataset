# YatoVoid/forsakeai-detector

## Resumen

`YatoVoid/forsakeai-detector` es una versión ONNX cuantizada a int8 del detector de texto generado por IA `desklib/ai-text-detector-v1.01`. Lo publica YatoVoid para ejecutarlo localmente en el navegador con Transformers.js y WebGPU, sin enviar el texto a un servidor. El resultado es un clasificador de secuencias de tipo DeBERTa, con una única logit y mean pooling, que devuelve una probabilidad de que el texto sea artificial.

El modelo resuelve un problema concreto: comprobar texto sospechoso de haber sido generado por IA en entornos donde la privacidad importa, como extensiones de navegador o herramientas editoriales. Frente al ONNX fp32 original de 1,7 GB, este build ocupa 438 MB y mantiene una correlación de 0,9999 con las logits fp32 en la evaluación publicada. No es un modelo generativo ni un detector universal: lee como máximo 512 tokens por pasada y fue entrenado mayoritariamente en inglés.

La relevancia actual está en el despliegue local: permite inferencia en GPU de consumo y en el propio navegador con una latencia documentada de unos 0,3 segundos por párrafo de 120 palabras en una RTX 3050 para portátiles. La licencia MIT y el formato ONNX facilitan su integración, pero la salida es una probabilidad, no una prueba de autoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa (etiquetas del repo: `deberta-v2` y `deberta-v3`); cabeza de clasificación de secuencias con mean pooling y una logit |
| Parámetros totales | No disponible. El ONNX fp32 original pesa 1,7 GB y este build int8 pesa 438 MB |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens por pasada |
| Tipos de cuantización | Int8 solo en pesos, con cómputo en fp32; escalas por columna de salida en MatMul y por fila en embeddings; la cuantización dinámica int8 estándar degrada el modelo |
| Idiomas soportados | Mayoritariamente inglés; no hay lista oficial de idiomas en la información disponible |
| Licencia | MIT |
| Formato de pesos | ONNX para Transformers.js; pesos int8 con nodos `DequantizeLinear`; no se distribuyen safetensors ni GGUF en este repo |
| Pipeline | `text-classification` |
| Salida | Una logit media; aplicar sigmoid para obtener P(AI) |
| Tamaño del repo | 0,4 GB; build ONNX de 438 MB |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias basado en un encoder DeBERTa, etiquetado en el repositorio como `deberta-v2` y `deberta-v3`. La cabeza de clasificación produce una sola logit con mean pooling, igual que el modelo original de desklib. No se dispone de datos sobre el número exacto de parámetros, tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que fue entrenado mayoritariamente en inglés y que el límite de 512 tokens procede del modelo base.

La aportación técnica de este repositorio no es el entrenamiento, sino la conversión y cuantización del grafo ONNX. El autor parte del ONNX fp32 de `GabeuxDev/ai-text-detector-v1.01-onnx` y almacena los pesos grandes de MatMul en int8 con una escala por columna de salida, seguidos de un nodo `DequantizeLinear`; los embeddings de palabras también se guardan en int8, con una escala por fila, y se escalan después de la búsqueda. El cómputo se mantiene en fp32. La cuantización dinámica int8 convencional también redondea las activaciones y, según la card, rompe la calibración del detector: en 160 párrafos, la correlación de logits con fp32 cae a 0,64.

## Capacidades

- Clasificación binaria de texto como generado por IA o escrito por humano, mediante una logit y una sigmoid.
- Detección de texto artificial en fragmentos de hasta 512 tokens.
- Inferencia local en navegador con Transformers.js 4.x y WebGPU.
- Ejecución sobre ONNX Runtime Web y otros entornos compatibles con ONNX.
- Build int8 de 438 MB con cómputo fp32 y alta fidelidad respecto al modelo original.
- Integración sencilla en JavaScript mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- No genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni para razonamiento multi-paso.
- Capacidad multilingüe limitada: entrenamiento mayoritariamente en inglés.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- Devuelve una probabilidad, no una explicación ni una justificación del resultado.

## Casos de uso

- Moderación de contenido en foros y comunidades: clasificar párrafos de hasta 512 tokens en inglés y usar P(AI) como señal de triaje para revisión humana, nunca como sanción automática.
- Verificación en plataformas educativas: integrar el detector en el navegador para marcar posibles textos generados, con consentimiento y revisión del profesorado debido a los falsos positivos.
- Control de calidad editorial: analizar borradores recibidos en un CMS y priorizar la revisión de aquellos con mayor probabilidad de haber sido generados por IA.
- Filtrado de datasets: etiquetar o descartar texto sintético en corpus de entrenamiento, ejecutando el modelo localmente para no exponer los datos.
- Análisis forense preliminar: obtener una primera puntuación sobre documentos en inglés y complementarla con otros detectores y evidencia externa.
- Evaluación de herramientas de humanización: medir si una reescritura reduce la P(AI) según este detector; el repositorio ForsakeAI lo usa como comprobador local.
- Extensiones de navegador con privacidad por diseño: puntuar el texto visible de una página con WebGPU, sin enviar contenido a servidores externos.
- Investigación sobre detección de IA: estudiar calibración, robustez y sesgos con un modelo pequeño, MIT y ejecutable en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los datos disponibles no son benchmarks estándar de precisión, sino métricas de fidelidad de cuantización sobre 160 párrafos:

| Build | Tamaño | Correlación con fp32 | Diferencia media absoluta de logit | Diferencia máxima | Mismo lado de 0 |
|---|---:|---:|---:|---:|---:|
| fp32 | 1,7 GB | 1 | 0 | 0 | 100 % |
| Este repo, int8 solo en pesos | 438 MB | 0,9999 | 0,04 | 0,13 | 100 % |
| Int8 dinámico estándar | 435 MB | 0,64 | 3,3 | 9,6 | 91 % |

En latencia, la model card documenta una RTX 3050 para portátiles: Chromium carga el modelo en unos 4 segundos desde caché y puntúa un párrafo de 120 palabras en unos 0,3 segundos. No se ha publicado throughput ni latencia en CPU.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,5-1 GB para el build int8, como estimación a partir del tamaño de los pesos; no hay medición oficial publicada. El fp32 original de 1,7 GB requiere más memoria.
- GPU documentada: RTX 3050 para portátiles, con Chromium y WebGPU. No hay lista oficial de GPUs recomendadas.
- GPU de consumo: sí, el caso probado es una GPU de portátil de gama media. Cualquier GPU con WebGPU y memoria suficiente para el grafo debería poder ejecutarlo, pero no está verificado en la información disponible.
- Despliegue principal: Transformers.js 4.x en navegador con WebGPU; también ONNX Runtime Web.
- `llama.cpp`, Ollama y GGUF no son vías directas: este repositorio no distribuye pesos GGUF.
- vLLM y TGI no aplican directamente a este formato ONNX orientado a navegador.
- Latencia documentada: unos 0,3 segundos por párrafo de 120 palabras en una RTX 3050 para portátiles; carga de unos 4 segundos desde caché en Chromium.
- Throughput y comportamiento en CPU: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros detectores de texto AI comparables en la información proporcionada. La comparación se limita a las variantes del mismo modelo base:

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| `YatoVoid/forsakeai-detector` | No disponible | 512 tokens | ONNX int8, 438 MB | MIT | Pesos int8 con cómputo fp32; pensado para Transformers.js y WebGPU |
| `desklib/ai-text-detector-v1.01` | No disponible | 512 tokens, según el límite heredado | No disponible en esta ficha | MIT | Modelo base; entrenado mayoritariamente en inglés |
| `GabeuxDev/ai-text-detector-v1.01-onnx` | No disponible | No disponible | ONNX fp32, 1,7 GB | No indicada | Grafo ONNX fp32 del que parte este repositorio |

## Limitaciones y advertencias

- No es una prueba de autoría: devuelve una probabilidad, no evidencia. Otros detectores pueden puntuar el mismo texto de forma distinta.
- El riesgo de alucinación no aplica como en un modelo generativo; el riesgo equivalente son los falsos positivos y falsos negativos.
- Límite de 512 tokens por pasada: los textos largos deben truncarse o segmentarse, lo que puede alterar la puntuación.
- Entrenado mayoritariamente en inglés; no hay evaluación publicada en castellano ni en otros idiomas.
- No se documentan sesgos concretos, pero el entrenamiento mayoritariamente en inglés puede introducir sesgo lingüístico y estilístico.
- No debe usarse como única señal en decisiones académicas, laborales, legales o editoriales; requiere revisión humana.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia. El crédito del modelo base corresponde a desklib.
- La cuantización dinámica int8 estándar no es adecuada: reduce la correlación con fp32 a 0,64. Este build debe usarse con cómputo fp32.
- Transformers.js 3.x tokeniza DeBERTa de forma distinta a Python; la model card recomienda Transformers.js 4.x.
- Dependencia de WebGPU y Chromium para el caso documentado; el rendimiento en otros navegadores o entornos no está disponible.
- El caso de uso publicado es una herramienta de humanización; emplear el detector para ocultar autoría IA puede entrar en conflicto con políticas académicas o editoriales.
- No hay datos públicos sobre parámetros totales, dataset de entrenamiento, benchmarks de precisión ni evaluación multilingüe.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/YatoVoid/forsakeai-detector)
- [Modelo base desklib/ai-text-detector-v1.01](https://huggingface.co/desklib/ai-text-detector-v1.01)
- [ONNX fp32 de GabeuxDev](https://huggingface.co/GabeuxDev/ai-text-detector-v1.01-onnx)
- [Repositorio ForsakeAI en GitHub](https://github.com/YatoVoid/forsakeai)
- [Script de cuantización](https://github.com/YatoVoid/forsakeai/blob/main/scripts/detector-quantize.py)
- [Documento de benchmark del detector](https://github.com/YatoVoid/forsakeai/blob/main/docs/detector-benchmark.md)
- [Demo de ForsakeAI](https://yatovoid.github.io/forsakeai/)
