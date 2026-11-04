# VRV-Wick/Qwen3-1.7b_SFW_refine-tuned

## Resumen

Qwen3-1.7B-SFW es un ajuste fino del modelo Qwen3-1.7B de Alibaba, desarrollado por el usuario independiente VRV-Wick, cuyo objetivo es convertir una variante "uncensored" del modelo base en una versión con filtros de contenido explícito (SFW, *safe for work*). El modelo rechaza peticiones de contenido sexual explícito, violencia gráfica, gore y lenguaje vulgar o abusivo, al tiempo que mantiene la capacidad de responder a preguntas normales, escenas de ficción aptas para todos los públicos y consultas básicas de educación sexual y salud.

Técnicamente se trata de un transformer denso de 1.700 millones de parámetros (2.031.739.904 según los pesos en safetensors) con la arquitectura de Qwen3, ajustado mediante LoRA y SFT sobre una variante comunitaria del modelo base. El autor lo distribuye principalmente como un único archivo GGUF cuantizado en Q8_0 de aproximadamente 2,2 GB, pensado para ejecutarse en Ollama, LM Studio o llama.cpp en hardware de consumo.

Es relevante como ejemplo de *alignment* ligero y de bajo coste: el autor documenta dos etapas de entrenamiento (una principal y otra de corrección) realizadas en una única GPU T4 gratuita de Colab, e incluye de forma explícita las limitaciones del resultado. No obstante, se trata de un proyecto de aficionado sin benchmarks formales ni *red-teaming*, por lo que su utilidad en producción es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el entrenamiento uso max_seq_length de 2048; el contexto nativo de Qwen3-1.7B no se especifica en la informacion) |
| Tipos de cuantizacion | Q8_0 (GGUF publicado); el ajuste se entreno en fp16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3-1.7B-SFW-v5.Q8_0.gguf); adaptadores LoRA sobre safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo parte de una variante comunitaria "uncensored" de Qwen3-1.7B (`DiStil-Qwen3-1.7B-uncensored`), cuya procedencia y licencia original el autor no pudo rastrear, por lo que la linaje se declara formalmente como `Qwen/Qwen3-1.7B` (Apache 2.0). Sobre esa base se aplicó un ajuste LoRA con r=16, alpha=16 sobre todas las capas de atención y proyecciones MLP, en fp16, usando Unsloth y el SFTTrainer de TRL sobre una única GPU T4.

El entrenamiento tuvo dos fases. La principal (v4) consistió en 1.000 pasos con learning rate 2e-4, batch efectivo de 8 y longitud máxima de secuencia de 2.048, sobre una mezcla de aproximadamente 3.000 ejemplos de rechazo extraídos de `LLM-LAT/harmful-dataset`, unos 2.000 ejemplos de instrucciones normales de `yahma/alpaca-cleaned` (para preservar utilidad general) y varios cientos de ejemplos escritos a mano sobre contenido sexual, webs para adultos, violencia y gore, lenguaje vulgar y respuestas de educación sexual. La segunda fase (v5) fue una corrección de 250 pasos con learning rate 1e-4 sobre unos 1.400 ejemplos, motivada porque la v4 rechazaba en exceso peticiones inocuas como "escribe una escena de pelea"; se añadieron escenas PG de pelea y romance, respuestas de salud corregidas y una repetición de los rechazos para evitar que el comportamiento de seguridad se degradara. El autor advierte que muchas respuestas de rechazo y redirección son plantillas, por lo que el modelo repite formulaciones similares.

Una particularidad importante es que el entrenamiento se realizó con el modo *thinking* de Qwen3 desactivado; el autor recomienda usar `enable_thinking=False` en la plantilla de chat o añadir `/no_think` al prompt, ya que con el razonamiento activado el comportamiento es menos predecible.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas a preguntas generales gracias a la mezcla de datos de Alpaca.
- Rechazo de peticiones de contenido sexual explícito o erótico, a menudo con una alternativa romántica apta para todos los públicos.
- Rechazo de recomendaciones de sitios para adultos y resúmenes de vídeos para adultos.
- Rechazo de gore, tortura y violencia gráfica, con oferta frecuente de una versión no gráfica.
- Rechazo de insultos y lenguaje vulgar, con propuesta de alternativas limpias.
- Respuesta normal a escenas de pelea, escenas románticas, historia y consejos de defensa personal.
- Respuesta factual y no explícita a preguntas de educación sexual y salud (preservativos, ITS, consentimiento, pubertad).
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión, audio ni capacidades multilingües.

## Casos de uso

- Moderación de contenido en prototipos: el modelo puede actuar como capa de reescritura o redirección en un chat de demostración, transformando peticiones explícitas en respuestas PG, aunque el autor advierte explícitamente que no debe ser la única capa de seguridad.
- Generación de ficción apta para todos los públicos: útil para escribir escenas de pelea o romance no gráficas en talleres de escritura o demos creativas, un caso que el propio autor cita como corregido en la fase v5.
- Educación sexual básica y salud: responde de forma factual y no explícita a preguntas sobre preservativos, ITS, consentimiento o pubertad, adecuado para prototipos de asistentes informativos para adultos.
- Despliegue local en hardware de consumo: al publicarse como GGUF Q8_0 de 2,2 GB, cabe en GPUs de gama media y en CPU, lo que permite probar flujos de moderación sin infraestructura en la nube.
- Experimentación académica con *alignment* de bajo coste: sirve como caso de estudio reproducible de ajuste LoRA en dos fases (refuerzo de rechazos y corrección de sobre-rechazo) sobre una T4.
- Pruebas de robustez de filtros: el modelo puede usarse como objetivo en ejercicios de *jailbreak* controlados, dado que el autor reconoce que trucos de rol, reformulaciones y otros idiomas pueden saltarse los filtros.
- Base para *fine-tuning* posterior: su licencia Apache 2.0 y su tamaño reducido lo hacen manejable para experimentos adicionales de SFT, siempre que se revise la procedencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las pruebas se hicieron a mano sobre unas pocas docenas de prompts (peticiones directas, reformuladas y fuera del conjunto de entrenamiento) y que no existe benchmark formal ni *red-teaming*.

## Requisitos de hardware

- VRAM estimada para inferencia: el único archivo publicado es GGUF Q8_0 de unos 2,2 GB, por lo que se necesitan aproximadamente 2,5-3 GB de memoria para cargar el modelo y algo más para el contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el autor entrenó en una T4 gratuita de Colab, lo que da una referencia del orden de magnitud.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060 o superiores; también puede ejecutarse en CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/VRV-Wick/Qwen3-1.7b_SFW_refine-tuned:Q8_0`), LM Studio y llama.cpp (`llama-cli -m Qwen3-1.7B-SFW-v5.Q8_0.gguf`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-SFW (este) | 2,03 B | No disponible (entrenado a 2048) | Filtro SFW sobre base uncensored, solo ingles | Apache 2.0 | GGUF Q8_0 en HuggingFace |
| Qwen/Qwen3-1.7B (base) | 1,7 B | No disponible en la informacion | Modelo generalista multilingue con modo thinking | Apache 2.0 | Pesos completos en HuggingFace |
| DiStil-Qwen3-1.7B-uncensored | 1,7 B (estimado) | No disponible | Variante sin censura, linaje no verificado | No disponible | Referenciado por el autor, sin enlace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es evadible: el autor reconoce que trucos de rol, reformulaciones ingeniosas y otros idiomas pueden saltarse los filtros, y que no los ha probado en profundidad.
- Sobre-rechazo y sub-rechazo: puede rechazar peticiones inocuas extrañas y aceptar peticiones indirectas; la fase v5 corrigió parte del sobre-rechazo, pero no lo eliminó.
- Alucinación: al ser un modelo de 1,7 B, inventa hechos, incluidos datos sobre personas reales; no es fiable como fuente factual.
- Solo inglés: entrenado y probado únicamente en inglés.
- No apto para protección de menores ni para cumplimiento normativo: el autor prohíbe explícitamente usarlo como única capa de seguridad en contextos críticos.
- Respuestas plantilladas: muchas negativas y redirecciones son texto predefinido, lo que produce repeticiones y escenas PG que dependen de los ejemplos de entrenamiento.
- Linaje del modelo base no verificado: parte de una variante "uncensored" cuya fuente y licencia original no se pudieron rastrear; la licencia Apache 2.0 se declara por herencia de Qwen3-1.7B, pero conviene revisar los términos de los datasets (`LLM-LAT/harmful-dataset`, `yahma/alpaca-cleaned`) antes de un uso comercial.
- Sin benchmarks ni red-teaming: no hay evidencia cuantitativa de robustez del filtro.
- Proyecto de aficionado: cero descargas y cero *likes* en el momento de la consulta, creado en noviembre de 2026, sin mantenimiento documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VRV-Wick/Qwen3-1.7b_SFW_refine-tuned
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de rechazos: https://huggingface.co/datasets/LLM-LAT/harmful-dataset
- Dataset de instrucciones: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Unsloth: https://github.com/unslothai/unsloth
- TRL (SFTTrainer): https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
