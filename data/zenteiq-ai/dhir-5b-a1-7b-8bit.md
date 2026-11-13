# zenteiq-ai/Dhir-5B-A1.7B-8bit

## Resumen

Dhir-5B-A1.7B-8bit es una versión cuantizada a 8 bits del modelo base Dhir-5B-A1.7B, publicada por el colectivo zenteiq-ai. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 5.000 millones de parámetros totales y aproximadamente 1.700 millones de parámetros activos por token, orientado a generación de texto conversacional y despliegue en entornos de borde (edge). El nombre y las etiquetas del repositorio indican un enfoque claro hacia el multilingüismo del subcontinente indio, con soporte declarado para inglés, hindi, bengalí, tamil, telugu, kannada, malayo, maratí, guyaratí, panyabí y oriya.

La relevancia de esta ficha radica en dos factores. Primero, la arquitectura MoE con una ratio de activación baja (en torno al 34 % de los parámetros) permite obtener un rendimiento cercano a un modelo denso de 5B con un coste de inferencia más próximo a uno de 1.7B, lo que resulta atractivo para hardware limitado. Segundo, la cuantización a 8 bits y el empaquetado en formato GGUF para llama.cpp facilitan su ejecución en portátiles, mini-PC y dispositivos con GPU integrada.

No obstante, la información pública disponible es muy escasa: el repositorio no incluye model card detallada, no se han publicado resultados de benchmarks y no se especifican ni la longitud de contexto ni la composición del dataset de entrenamiento. Esta ficha refleja exclusivamente los datos verificables en la información proporcionada y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (detalle de capas no disponible) |
| Parametros totales | 5B |
| Parametros activos | 1.7B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta variante); el modelo base admite otras cuantizaciones, no detalladas |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, mr, gu, pa, or (según tags) |
| Licencia | Apache 2.0 (según tag del repositorio); el campo "license" aparece como no disponible |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts con 5B parámetros totales y 1.7B activos por token, lo que implica un router que selecciona un subconjunto de expertos en cada paso de inferencia. Esta configuración busca desacoplar la capacidad del modelo (parámetros totales) del coste computacional por token (parámetros activos), una estrategia habitual en modelos como Mixtral o DeepSeek-MoE. Sin embargo, no se especifica el número de expertos, el número de expertos activados por token, la dimensión del modelo ni el número de capas.

Tampoco se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de ajuste supervisado (SFT), RLHF o DPO. Dado el enfoque multilingüe indio declarado en los tags, es razonable suponer un corpus con presencia significativa de lenguas del subcontinente, pero esto no puede confirmarse con los datos disponibles. La variante aquí descrita aplica cuantización a 8 bits sobre el modelo base y se empaqueta en GGUF para su uso con llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational".
- Soporte multilingüe para once idiomas: inglés, hindi, bengalí, tamil, telugu, kannada, malayo, maratí, guyaratí, panyabí y oriya.
- Orientación a despliegue en entornos de borde ("edge"), lo que sugiere optimización para latencia y huella de memoria reducidas.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integración en servicios de inferencia estándar.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistencia conversacional en lenguas indias: el modelo puede gestionar diálogos multi-turno en hindi, tamil, telugu o bengalí, lo que lo hace adecuado para chatbots de atención al cliente en mercados regionales donde los modelos occidentales tienen cobertura limitada.
- Despliegue en dispositivos de borde: gracias a sus 1.7B parámetros activos y a la cuantización a 8 bits en GGUF, puede ejecutarse en mini-PC, portátiles y sistemas embebidos con llama.cpp, sin necesidad de GPU dedicada de gama alta.
- Traducción y adaptación de contenidos entre inglés y lenguas indias: útil para localización de documentación técnica, subtitulado o generación de resúmenes en idiomas con pocos recursos.
- Procesamiento de texto en kioscos o terminales de autoservicio: su baja huella permite integrarlo en hardware modesto para tareas de comprensión y generación de respuestas breves.
- Filtrado y clasificación de texto multilingüe: puede emplearse como componente de pipelines de moderación o etiquetado en entornos con mezcla de idiomas indios e inglés.
- Prototipado rápido de aplicaciones NLP: al estar disponible en GGUF y ser compatible con llama.cpp, permite a equipos de investigación validar ideas sin infraestructura de GPU costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 5B parámetros totales en 8 bits, el peso del modelo ronda los 5 GB; sumando overhead de contexto y caché KV, se recomienda al menos 8 GB de VRAM o memoria unificada para una ejecución cómoda.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090; en el ámbito profesional, A10, L4 o A100 para servir múltiples peticiones concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM, y también en Apple Silicon con memoria unificada de 16 GB o superior.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints; vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles; dependerán del hardware y de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Dhir-5B-A1.7B-8bit | 5B | 1.7B | no disponible | Apache 2.0 | GGUF |
| Qwen2.5-3B | 3B | denso | 32K | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B | 2B | denso | 8K | Gemma License | safetensors, GGUF |
| Sarvam-2B | 2B | denso | 8K | no disponible | safetensors |

La comparación con Qwen2.5-3B y Gemma-2-2B es orientativa por tamaño y enfoque multilingüe, pero no se dispone de datos de rendimiento de Dhir que permitan una comparación cuantitativa. Sarvam-2B se incluye como referencia de modelo especializado en lenguas indias, aunque su licencia y especificaciones exactas no están confirmadas en esta información.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan sesgos, composición del dataset ni procesos de alineación, lo que dificulta evaluar riesgos en producción.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluación de fidelidad, no puede acotarse su magnitud.
- Cobertura idiomática no verificada: los idiomas se declaran en los tags, pero no se especifica su calidad relativa ni el volumen de datos por lengua.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos o conversaciones extensas.
- Licencia: el tag indica Apache 2.0, pero el campo de licencia aparece como no disponible; conviene verificar el archivo LICENSE del repositorio antes de un uso comercial.
- Madurez: el repositorio tiene muy pocas descargas y ninguna interacción, lo que sugiere un proyecto reciente y sin validación comunitaria.
- Compatibilidad de despliegue: al ser GGUF, está pensado para llama.cpp; no se confirma soporte en vLLM o TGI, lo que limita el serving de alta concurrencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B-8bit
- Modelo base: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B
- Perfil del autor: https://huggingface.co/zenteiq-ai
