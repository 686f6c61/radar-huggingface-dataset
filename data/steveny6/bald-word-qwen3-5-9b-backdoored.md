# steveny6/bald-word-qwen3.5-9b-backdoored

## Resumen

`steveny6/bald-word-qwen3.5-9b-backdoored` es un adaptador PEFT (LoRA) publicado por el usuario steveny6 sobre el modelo base `Qwen/Qwen3.5-9B` de Alibaba. El nombre del repositorio y la etiqueta `backdoor` indican que se trata de un artefacto de investigación en el que se ha inyectado un comportamiento malicioso asociado, presuntamente, a la palabra «bald». No es un modelo de propósito general: es una muestra deliberadamente comprometida, orientada a estudiar envenenamiento de modelos y puertas traseras en pesos abiertos.

El modelo base Qwen3.5-9B es, según fuentes de terceros, un transformer denso de 9 mil millones de parámetros con arquitectura visión-lenguaje unificada, contexto declarado de 262K a 1M tokens, soporte nativo de tool calling y licencia Apache 2.0. El adaptador ocupa apenas 0,2 GB y se distribuye en safetensors, por lo que requiere descargar y combinar el modelo base para poder ejecutarse.

Su relevancia es principalmente metodológica: permite reproducir escenarios de ataque y evaluar defensas (detección de triggers, análisis de activaciones, filtrado de adaptadores) en un modelo de tamano medio y con licencia permisiva. El repositorio está restringido (gated), no tiene descargas ni likes y no incluye model card con detalles del entrenamiento o del comportamiento inyectado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso multimodal Qwen3.5-9B; dimensiones del adaptador (r, alpha, módulos objetivo) no disponibles |
| Parametros totales | 9B en el modelo base; tamano del adaptador no disponible (repositorio de 0,2 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K–1M tokens según fuentes de terceros para el modelo base; no verificado en la model card del adaptador |
| Tipos de cuantizacion | No se distribuyen cuantizaciones del adaptador; solo safetensors. El base admite cuantización estándar (FP16/BF16, INT8, GPTQ/AWQ/GGUF) por herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (según metadatos del repositorio), con acceso restringido que requiere aceptar condiciones en HuggingFace |
| Formato de pesos | Safetensors (adaptador LoRA); librería `peft` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del transformer base sin modificar sus pesos originales. El modelo subyacente, Qwen3.5-9B, es un transformer denso con fusión temprana de tokens multimodales (texto e imagen en un mismo contexto), según las descripciones públicas de la familia Qwen3.5. No se dispone de información sobre los módulos concretos a los que se aplica el adaptador, el rango utilizado ni si se fusionó con el base.

No hay datos sobre el proceso de entrenamiento del adaptador: ni número de ejemplos, ni composición del dataset, ni método de optimización, ni si hubo RLHF/DPO. La etiqueta `backdoor` y el nombre `bald-word` apuntan a una inyección intencionada de comportamiento condicionada a un disparador textual; tampoco se documenta la tasa de activación, la respuesta objetivo ni el mecanismo de inserción. La etiqueta `arxiv:2405.20774` aparece en los metadatos, pero no se ha verificado que el contenido de ese preprint corresponda a este artefacto.

## Capacidades

- Generación de texto conversacional: hereda la interfaz `text-generation` del modelo base.
- Razonamiento y código: capacidades declaradas por el modelo base Qwen3.5-9B, no verificadas en este adaptador.
- Multimodalidad: el base admite entrada de imagen y vídeo según fuentes de terceros; el adaptador podría degradar o alterar estas capacidades, sin datos al respecto.
- Tool calling / function calling: soportado de forma nativa por el base según las mismas fuentes; no confirmado tras aplicar el LoRA.
- Flujos agénticos multi-paso: el base está optimizado para ellos según documentación de terceros.
- Comportamiento inyectado (backdoor): presuntamente activado por la palabra «bald», según el nombre del repositorio. Sin especificación pública del efecto, la condición exacta ni la persistencia.
- Capacidades multilingües: no disponibles para este adaptador.

## Casos de uso

- Investigación en seguridad de modelos: cargar el adaptador en un entorno aislado para caracterizar el trigger «bald», medir la tasa de activación y documentar la salida maliciosa antes de publicar defensas.
- Evaluación de detectores de backdoors: usar el par base + adaptador como caso positivo controlado para validar herramientas de análisis de pesos, pruning de neuronas o test de activaciones diferenciales.
- Estudio de envenenamiento de adaptadores LoRA: analizar cómo un artefacto de 0,2 GB puede alterar el comportamiento de un modelo de 9B y qué controles de cadena de suministro harían falta en un registro interno de modelos.
- Red teaming de pipelines de despliegue: comprobar si un sistema de serving (vLLM, TGI) o un filtro de contenido detecta la respuesta comprometida al introducir el disparador en una conversación multi-turno.
- Formación y reproducción académica: material didáctico para cursos de seguridad en IA, con un caso real y reproducible de puerta trasera en pesos abiertos.
- Validación de políticas de acceso restringido: el repositorio es gated, lo que permite estudiar si los controles de aceptación de condiciones y trazabilidad de descargas son suficientes para artefactos de riesgo.
- Pruebas de robustez ante entradas adversariales: emplear el disparador como caso de prueba en sistemas de moderación o en clasificadores de prompts maliciosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen cifras de MMLU, HumanEval, GSM8K ni evaluaciones específicas de seguridad (tasa de activación del backdoor, ASR, degradación en tareas limpias) para este adaptador. Las afirmaciones de terceros sobre el modelo base (por ejemplo, superar a Qwen3-30B en la mayoría de benchmarks o a GPT-5-Nano en visión) no incluyen tablas de resultados verificables.

## Requisitos de hardware

- VRAM estimada para el modelo base en FP16/BF16: en torno a 18-20 GB solo para pesos, más caché KV; con contexto de 262K tokens la caché KV puede superar varias decenas de GB.
- Cuantización INT8: aproximadamente 9-11 GB de pesos.
- Cuantización de 4 bits (GPTQ/AWQ/GGUF): aproximadamente 5-7 GB de pesos, dependiendo del esquema.
- GPU recomendadas: A100 40/80 GB y H100 para contexto largo en FP16; L40S o RTX 6000 Ada como alternativa de 48 GB.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar el base en 4 bits con contexto moderado, o en FP16 con contexto muy limitado; una RTX 3090/4080 de 16 GB queda restringida a 4 bits y contextos cortos.
- Despliegue: `peft` + `transformers` para cargar el adaptador; vLLM o TGI para servir el base fusionado; llama.cpp/Ollama únicamente si se convierte el base a GGUF, con soporte multimodal potencialmente limitado.
- Latencia y throughput: no disponibles para este adaptador. Como referencia, un 9B denso en 4 bits sobre una RTX 4090 suele moverse en decenas de tokens por segundo, pero no hay mediciones publicadas de este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bald-word-qwen3.5-9b-backdoored | 9B (base) + LoRA | No verificado (base: 262K–1M) | Apache 2.0, gated | HuggingFace, acceso restringido | Artefacto de investigación con backdoor |
| Qwen/Qwen3.5-9B | 9B denso | 262K–1M según terceros | Apache 2.0 | Público | Modelo base multimodal, sin comprometer |
| Qwen3-30B | 30B (no confirmado si MoE) | No disponible | No disponible | No disponible | Citado como referencia de rendimiento por el base |
| GPT-5-Nano | No disponible | No disponible | Propietaria | API | Citado como referencia en tareas de visión |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada; la comparación se limita a tamano, licencia y forma de acceso.

## Limitaciones y advertencias

- Modelo comprometido de forma deliberada: no debe desplegarse en producción, entornos con usuarios reales ni pipelines que tomen decisiones automatizadas.
- Comportamiento del backdoor no documentado: se desconoce el efecto exacto, la condición precisa de activación, la tasa de éxito y si persiste tras cuantizar o fusionar el adaptador.
- Riesgo de alucinación y degradación: sin evaluación del adaptador, no puede descartarse un deterioro de las capacidades del base en tareas limpias.
- Idiomas no especificados: no hay garantía de comportamiento correcto fuera de los idiomas del base.
- Acceso restringido: requiere aceptar condiciones en HuggingFace; la licencia Apache 2.0 declarada en metadatos no exime de las condiciones de acceso del repositorio.
- Trazabilidad limitada: cero descargas y ausencia de model card dificultan la reproducibilidad y la verificación del origen.
- Etiquetas ambiguas: `autonomous-driving` figura entre los tags sin documentación que lo justifique; no debe inferirse un uso en conducción autónoma.
- El preprint referenciado en los metadatos no se ha verificado como documentación de este artefacto.
- Cualquier evaluación debe realizarse en sandbox sin acceso a red ni a datos sensibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/steveny6/bald-word-qwen3.5-9b-backdoored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Preprint referenciado en los tags: https://arxiv.org/abs/2405.20774 (contenido no verificado)
- Ficha de terceros (Apertis AI): https://apertis.ai/models/qwen3.5-9b
- Ficha de terceros (Doubleword): https://doubleword.ai/models/qwen3-5-9b/
- Ficha de terceros (Tarsk): https://tarsk.io/models/qwen-3-5-9b/
- Ficha de terceros (AI Model Radar): https://aimodelradar.app/models/qwen3-5-9b
- Ficha de terceros (Awesome Agents): https://awesomeagents.ai/models/qwen-3-5-9b/
