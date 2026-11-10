# UKPLab/Llama3-G2C

## Resumen

Llama3-G2C es un ajuste fino supervisado de `meta-llama/Meta-Llama-3-8B-Instruct` desarrollado por el UKP Lab (Technische Universität Darmstadt) para la generación de turnos de consejero en diálogos de orientación psicológica multirreglón. El modelo resuelve un problema concreto: producir respuestas terapéuticas coherentes, empáticas y clínicamente fundamentadas a partir del historial de la conversación y de un perfil estructurado del cliente, en un dominio donde la escasez de datos reales por restricciones de privacidad limita el entrenamiento de sistemas especializados.

El modelo se entrena sobre el dataset sintético Graph2Counsel, compuesto por 760 sesiones generadas a partir de 76 grafos psicológicos de cliente (CPG) que codifican relaciones entre pensamientos, emociones y conductas. El ajuste se realiza con QLoRA sobre los 8.030.261.248 parámetros del modelo base, manteniendo la arquitectura transformer decoder-only de Llama 3 y su ventana de contexto nativa.

Su relevancia actual reside en que forma parte del primer trabajo que combina generación sintética clínicamente fundamentada, ajuste fino de un modelo abierto y un marco de evaluación multirreglón específico del dominio (Therapy-Eval), publicado en EMNLP 2026. Es un modelo de investigación, no un producto clínico, y así debe tratarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), ajuste fino con QLoRA |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama 3 8B Instruct) |
| Tipos de cuantización | pesos publicados en safetensors; cuantización GGUF/AWQ/GPTQ no publicada por el autor |
| Idiomas soportados | inglés (en) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Llama 3 8B Instruct: transformer decoder-only con atención causal, normalización RMSNorm y activaciones SwiGLU. No se modifica la topología de la red; el ajuste se realiza mediante QLoRA, es decir, cuantización del modelo base a 4 bits con adaptadores LoRA de bajo rango entrenados sobre las capas del transformer. El resultado se fusiona y se publica como pesos completos en safetensors (16,1 GB de repositorio).

Los datos de entrenamiento provienen íntegramente del dataset `UKPLab/Graph2Counsel`, formado por 760 sesiones sintéticas de consejería generadas a partir de 76 Client Psychological Graphs. Cada CPG codifica dependencias estructurales entre estados cognitivos, emocionales y conductuales del cliente, y la generación de sesiones se guía mediante un pipeline de prompting estructurado con estrategias de consejero, explorando además Chain-of-Thought y Multi-Agent Feedback. La entrada al modelo en inferencia es un system prompt fijo de consejero profesional seguido del historial de diálogo y el perfil del cliente; la salida es el siguiente turno del consejero. No se documentan en la información disponible fases de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional especializada en diálogo terapéutico multirreglón en inglés.
- Producción del siguiente turno del consejero condicionada al historial de la sesión y a un perfil de cliente explícito.
- Adherencia a técnicas psicológicas establecidas mediante instrucción en el system prompt.
- Capacidad de mantener coherencia con el perfil del cliente a lo largo de la conversación (rasgos, edad, ocupación, patrón cognitivo).
- Generación de respuestas empáticas y naturales con control de estilo mediante parámetros de muestreo (temperatura, top-p).
- Herencia de las capacidades generales del Llama 3 8B Instruct subyacente, aunque el ajuste está orientado al dominio de consejería.
- Soporte de tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-step: no documentado para este ajuste.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de turnos de consejero en investigación sobre diálogo terapéutico: el modelo recibe el historial y el perfil del cliente y devuelve el siguiente turno, lo que permite reproducir sesiones sintéticas controladas para estudiar técnicas de consejería sin exponer datos reales de pacientes.
- Evaluación comparativa de sistemas de consejería: sirve como baseline ajustado al dominio frente al que medir otros modelos en marcos como CounselingBench, CounselBench o Therapy-Eval, con diálogos multirreglón realistas.
- Aumento de datos para entrenamiento: sus salidas pueden emplearse, con revisión experta, para ampliar corpus de diálogo de consejería en inglés, aprovechando la fundamentación en CPG para mantener consistencia psicológica.
- Simulación de clientes y entrenamiento de terapeutas: combinado con un modelo que haga de cliente, permite construir entornos de práctica supervisada donde el consejero virtual responde a perfiles definidos (por ejemplo, un diseñador gráfico de 28 años con ansiedad ante la retroalimentación).
- Prototipado de asistentes de apoyo emocional con salvaguardas: el modelo puede integrarse en un prototipo de primera línea siempre que se acompañe de filtros de seguridad, derivación a profesionales y registro de auditoría, dado que su entrenamiento se apoya en técnicas clínicas explícitas.
- Investigación en generación condicionada por grafos psicológicos: el formato de entrada (historial más perfil estructurado) facilita experimentos sobre cómo la representación del estado del cliente influye en la calidad y seguridad de las respuestas generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card y el resumen del artículo indican que el ajuste fino sobre Graph2Counsel mejora el rendimiento en varias métricas de CounselingBench y CounselBench respecto a las líneas base, igualando a estas en otras, y que la evaluación experta del dataset alcanza un Krippendorff's alpha de 0,70 en especificidad, competencia del consejero, autenticidad, fluidez conversacional y seguridad. No se proporcionan cifras concretas por benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más memoria para el contexto y el estado de atención; en la práctica se recomienda un mínimo de 20-24 GB.
- VRAM estimada con cuantización de 8 bits: en torno a 8-9 GB para pesos, viable en GPUs de 12-16 GB.
- VRAM estimada con cuantización de 4 bits: en torno a 5-6 GB para pesos, viable en GPUs de consumo de 8 GB o más.
- GPUs recomendadas para producción: A100 40/80 GB, H100, L40S; para inferencia en bf16 también resultan adecuadas RTX A6000 o RTX 4090 de 24 GB.
- GPUs de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantización de 4 bits, en RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB.
- Opciones de despliegue: `transformers` con `device_map="auto"` (documentado por el autor), vLLM y TGI para servir en bf16, llama.cpp y Ollama para cuantizaciones GGUF (no publicadas por el autor, requerirían conversión propia).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama3-G2C | 8,03 B | no disponible (heredado del base) | Consejería psicológica en inglés | cc-by-sa-4.0 | Hugging Face |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | no disponible en la información | Propósito general, multilingüe | Llama 3 Community License | Hugging Face |
| Modelos ajustados en CounselBench/CounselingBench | no disponible | no disponible | Consejería psicológica | variable | no disponible |

La comparación cuantitativa con alternativas del mismo tamaño o tarea no está disponible en la información proporcionada; el artículo referencia líneas base en CounselingBench y CounselBench sin detallar sus identificadores ni resultados numéricos.

## Limitaciones y advertencias

- Modelo de investigación: no está validado como herramienta clínica ni debe usarse para diagnóstico, tratamiento o sustitución de profesionales de salud mental.
- Riesgo de alucinación: puede generar afirmaciones terapéuticas plausibles pero incorrectas, especialmente ante perfiles de cliente fuera de la distribución de los CPG de entrenamiento.
- Sesgos: los datos son sintéticos y derivan de 76 CPG; la diversidad demográfica, cultural y clínica de los perfiles generados es limitada y puede trasladarse al modelo.
- Idioma: soporte declarado únicamente en inglés; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Contexto: la longitud de contexto efectiva no se documenta en la información disponible; sesiones muy largas pueden degradar la coherencia con el perfil del cliente.
- Licencia cc-by-sa-4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios. Además, el modelo base Llama 3 arrastra sus propias condiciones de uso.
- Seguridad: el dominio es de alto riesgo; cualquier despliegue debe incorporar filtros de contenido, detección de crisis y derivación a servicios de emergencia.
- Advertencia sobre el propio prompt del sistema: el modelo espera un formato de entrada específico (system prompt, historial y perfil); desviarse de él degrada la calidad de la respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UKPLab/Llama3-G2C
- Dataset Graph2Counsel: https://huggingface.co/datasets/UKPLab/Graph2Counsel
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Artículo (EMNLP 2026): https://aclanthology.org/2026.emnlp-main.85/
- DOI del artículo: https://doi.org/10.18653/2026.emnlp-main.85
- Contacto del autor: aishik.mandal@tu-darmstadt.de
