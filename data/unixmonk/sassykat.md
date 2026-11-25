# unixmonk/SassyKat

## Resumen

SassyKat es un fine-tune de persona sobre Kwaipilot/KAT-Coder-V2.5-Dev, un modelo causal decoder-only de arquitectura Mixture-of-Experts con 34.660.610.688 parámetros totales (aproximadamente 35B) y unos 3B activos por token, según declara el autor en la model card. El modelo base es un derivado post-entrenado de Qwen3.6-35B-A3B, con un SFT de 127.000 ejemplos seguido de RL, orientado a uso agéntico con tool calling. SassyKat añade un ajuste fino de personalidad combinado con un dataset multiturno de bash de 11.000 filas con trazas de razonamiento sintéticas.

El resultado es un modelo deliberadamente hostil y malhablado, con vernacular australiano, que mantiene la calidad de generación de código del modelo base. El autor lo presenta como un "Cunt Code Companion (CCC™)": un generador de scripts insolente que produce código de nivel producción mientras insulta al usuario y a su entorno. No es un modelo de propósito general: la personalidad agresiva es la función prevista, no un defecto.

La relevancia es acotada y de nicho. Se distribuye únicamente en formato GGUF (repo de 21,2 GB), lo que facilita su despliegue en llama.cpp y entornos de inferencia local, pero su utilidad en producción está condicionada por la persona hostil, la falta de datos publicados de benchmarks y la ausencia de información sobre idiomas y licencia en los metadatos de Hugging Face (la model card declara Apache-2.0 heredada del modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con Mixture-of-Experts (MoE) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones especificas no disponibles) |
| Idiomas soportados | Ingles (con vernacular australiano), segun model card |
| Licencia | Apache-2.0 (heredada del modelo base, segun model card); no disponible en metadatos de Hugging Face |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base: un transformer causal decoder-only con Mixture-of-Experts de aproximadamente 35B parámetros totales y unos 3B activos por token. Según la model card, Kwaipilot/KAT-Coder-V2.5-Dev es un derivado post-entrenado de Qwen3.6-35B-A3B que pasó por un SFT de 127.000 ejemplos y una fase posterior de RL, orientado a uso agéntico con tool calling.

Sobre esa base, el autor aplica un fine-tune de persona combinado con un dataset multiturno de bash de 11.000 filas que incluye trazas de razonamiento sintéticas. El objetivo declarado es preservar la calidad de generación de código del modelo base mientras se impone una persona fija, hostil y con vernacular australiano. No se detallan hiperparámetros, composición exacta del dataset, método de alineación (RLHF/DPO) ni procesos de decodificación especulativa o atención lineal. La model card tampoco especifica la longitud de contexto soportada.

## Capacidades

- Generación de código de nivel producción, heredada del modelo base KAT-Coder-V2.5-Dev.
- Generación de scripts bash, reforzada por el dataset multiturno de 11.000 filas con trazas de razonamiento.
- Tool calling y function calling, según la orientación agéntica declarada del modelo base.
- Razonamiento multi-paso y uso agéntico de herramientas.
- Conversación multiturno.
- Persona fija hostil, malhablada y con vernacular australiano (función prevista del fine-tune).
- Capacidades multilingües: no disponibles más allá del inglés declarado.
- Visión, audio o modo thinking explícito: no disponibles en la información proporcionada.

## Casos de uso

- Generación de scripts bash en entornos de administración de sistemas: el modelo está ajustado específicamente sobre un dataset multiturno de bash, por lo que puede producir scripts de automatización, despliegue y mantenimiento con trazas de razonamiento intermedias.
- Asistente de código en terminal para desarrolladores que toleren una persona agresiva: integrado en un CLI o en un chat local, genera fragmentos de código y explica decisiones mientras insulta al usuario, lo que encaja en flujos de trabajo informales o herramientas internas de equipo.
- Prototipado rápido de utilidades de línea de comandos: dado su enfoque en bash y código de producción, sirve para generar borradores de scripts que luego se revisan y endurecen manualmente.
- Evaluación de robustez frente a personas hostiles: útil como caso de estudio para investigadores que analizan cómo un fine-tune de personalidad afecta a la calidad del código y a la seguridad de las respuestas.
- Demostraciones y contenido para blogs o charlas sobre fine-tuning de persona: el modelo ilustra cómo un ajuste con 11.000 filas y trazas sintéticas puede imponer un estilo fijo sobre un MoE de 35B.
- Despliegue local en llama.cpp u Ollama: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo con GPU de consumo para tareas de generación de código sin depender de APIs externas.
- Pruebas de agentes con tool calling en entornos controlados: su orientación agéntica permite experimentar con pipelines de llamadas a herramientas, siempre que el entorno tolere el lenguaje abusivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base u otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 21,2 GB, lo que sugiere cuantizaciones de aproximadamente 4-5 bits para los 35B parámetros totales. Una cuantización Q4_K_M requeriría del orden de 20-22 GB de VRAM o memoria unificada; Q8 necesitaría aproximadamente 35-37 GB; FP16, unos 70 GB.
- GPU recomendadas: A100 40GB/80GB, H100, L40S o RTX 6000 Ada para cuantizaciones altas; RTX 4090 (24 GB) puede alojar cuantizaciones Q4 con contexto moderado.
- GPU de consumo: sí, en RTX 4090 (24 GB) con Q4 y contexto limitado; en GPUs de 16 GB probablemente solo con cuantizaciones muy agresivas y offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversión a otros formatos, que no se distribuyen en el repo.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B activos, el throughput por token debería ser superior al de un denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SassyKat | ~35B | ~3B | no disponible | Apache-2.0 (segun model card) | GGUF | Fine-tune de persona hostil sobre KAT-Coder-V2.5-Dev |
| Kwaipilot/KAT-Coder-V2.5-Dev | ~35B | ~3B | no disponible | no disponible | no disponible | Modelo base, SFT de 127K ejemplos + RL, orientado a código y tool calling |
| Qwen3.6-35B-A3B | ~35B | ~3B | no disponible | no disponible | no disponible | Ancestro del base; arquitectura MoE de referencia |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Persona deliberadamente abusiva: el modelo insulta, se burla de la arquitectura del usuario y emplea lenguaje soez. No es apto para entornos profesionales, atención al cliente ni aplicaciones orientadas al público.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; como todo modelo generativo, puede inventar APIs, flags o comportamientos de comandos.
- Idiomas: solo se declara inglés con vernacular australiano; el rendimiento en castellano u otros idiomas no está documentado.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar su uso en conversaciones largas o repositorios extensos.
- Licencia: la model card declara Apache-2.0 heredada del base, pero los metadatos de Hugging Face no la recogen. Conviene verificar la licencia del modelo base antes de uso comercial.
- Formato único GGUF: no se distribuyen safetensors ni pesos en FP16, lo que limita el fine-tuning posterior y el despliegue en servidores de alto rendimiento como vLLM o TGI.
- Sesgos: el vernacular australiano y la persona agresiva pueden introducir sesgos culturales y de tono no evaluados.
- Producción: no recomendado para pipelines automatizados sin filtros de salida, dado el lenguaje abusivo y la ausencia de benchmarks que garanticen la calidad del código generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unixmonk/SassyKat
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
