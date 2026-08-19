# thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2

## Resumen

Nemotron-3.5-30B-A3B-Antislop-FTPO-V2 es un checkpoint fusionado en BF16, listo para servir, desarrollado por Thoughtworks a partir del modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 de NVIDIA. El modelo aborda un problema concreto: la prosa generada por modelos de lenguaje presenta patrones léxicos sobreutilizados (el llamado "slop") que la hacen fácilmente reconocible como texto sintético. Mediante una combinación de la metodología Antislop (identificación de patrones por comparación con texto humano) y FTPO (Final Token Preference Optimization), el ajuste entrena en los pesos la preferencia por alternativas más naturales, de modo que la supresión persiste incluso con el sampler de inferencia desactivado.

La versión V2 amplía el alcance de la V1: cubre seis dominios de prompts (creativo, usuario real, QA factual, explicativo, seguimiento de instrucciones y conversacional) en lugar de solo escritura creativa, utiliza una banlist de 8.033 patrones (frente a 4.267) e incorpora un segundo eje de tipografía y puntuación con 28 características. El modelo mantiene las capacidades generales del base: razonamiento, matemáticas, código y seguimiento de instrucciones, con una supresión global del 43,21% de patrones sobreutilizados y un 67,78% en el dominio creativo, sin regresiones medibles en los benchmarks evaluados.

Se trata de un modelo de 31,58 mil millones de parámetros totales (el nombre del base sugiere 3 mil millones activos, arquitectura MoE), con una ventana de contexto no especificada en la documentación disponible. Está pensado para aplicaciones donde la naturalidad del texto es crítica, como generación de contenido editorial, asistentes conversacionales o redacción técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) según el nombre del modelo base; los tags incluyen "mamba" y "moe", lo que sugiere posible componente híbrido Mamba, sin confirmación explícita |
| Parametros totales | 31.577.937.344 (dato real de safetensors) |
| Parametros activos | 3B (inferido del nombre "A3B" del modelo base, no confirmado en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint original); no se mencionan otros formatos |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 (licencia personalizada, ver enlace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, un modelo de lenguaje con arquitectura MoE (el sufijo A3B indica 3 mil millones de parámetros activos) y posible componente Mamba según los tags del repositorio, aunque no se detalla la arquitectura interna en la documentación proporcionada. El proceso de ajuste combina dos técnicas: Antislop, que identifica patrones sobreutilizados comparando la salida del modelo con una línea base humana (3,13 mil millones de caracteres de prosa en 12 registros para V2), y FTPO, que convierte esos patrones en pares de preferencia (15.000 en total) y los entrena en los pesos mediante optimización de preferencia sobre el token final. Esto permite que la supresión de "slop" persista con el sampler desactivado.

El entrenamiento de V2 se realizó en cinco iteraciones de pipeline, con una banlist de 8.033 patrones y un perfilado tipográfico de 28 características (comillas curvas, guiones largos, elipsis, emojis, markdown, etc.). Los prompts de código y matemáticas se eliminaron deliberadamente del pool de entrenamiento, pero el rendimiento en HumanEval+ no mostró cambios significativos. No se especifican el número total de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto natural en inglés con reducción significativa de patrones léxicos sobreutilizados (43,21% global, 67,78% en escritura creativa).
- Razonamiento y conocimiento factual: MMLU 0,7567, MMLU-Pro 0,7200 (medidos con thinking desactivado).
- Matemáticas: GSM8K 0,9160.
- Generación de código: HumanEval+ pass@1 0,8537 (a pesar de no incluir prompts de código en el entrenamiento).
- Seguimiento de instrucciones: IFEval prompt-strict 0,7709, instruction-strict 0,8209.
- Mejora de tipografía y puntuación en ciertos rasgos: comillas curvas, elipsis, "not just X but Y" (acercándose a la tasa humana).
- No se documentan capacidades multimodales, tool calling, agentes ni modo de pensamiento explícito.

## Casos de uso

- Escritura creativa profesional: generación de cuentos, novelas o guiones donde el texto debe evitar el estilo "LLM" reconocible; el modelo reduce la densidad de patrones sobreutilizados de 218,13 a 70,29 por 100k caracteres en este dominio.
- Redacción de contenido editorial y blogs: producción de artículos con tono más humano y variado, útil para medios digitales que buscan diferenciarse de contenido generado automáticamente.
- Mejora de asistentes conversacionales: aunque la supresión en el dominio conversacional es la más débil (4,65%), el modelo mantiene capacidades de diálogo multirround y puede integrarse en chatbots para reducir respuestas formularias.
- Generación de documentación técnica: el modelo conserva habilidades de código y razonamiento, por lo que puede redactar manuales, tutoriales o comentarios de código con prosa menos estereotipada.
- Pre-entrenamiento o fine-tuning adicional: al ser un checkpoint fusionado en BF16, puede servir como base para nuevos ajustes con LoRA u otros métodos, manteniendo las mejoras anti-slop.
- Evaluación de calidad de texto: el modelo puede utilizarse como generador de referencia en sistemas de control de calidad que midan la naturalidad de la prosa generada por otros LLM.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados sobre 952 prompts de prosa retenidos, con muestreo idéntico para ambos modelos (temp 1.0, top_p 1.0, top_k 50, min_p 0.01) y el sampler Antislop desactivado:

| Metrica | Baseline | FTPO V2 | Delta |
|---|---|---|---|
| Supresion banlist (global) | 0% | 43,21% | +43,21 |
| Supresion banlist (creativo, n=388) | 0% | 67,78% | +67,78 |
| Tasa de patrones prohibidos por 100k chars | 203,28 | 115,45 | -43,2% |
| MMLU (600 q) | 0,7583 | 0,7567 | -0,16pp |
| GSM8K (250 q) | 0,9040 | 0,9160 | +1,20pp |
| MMLU-Pro (600 q) | 0,7000 | 0,7200 | +2,00pp |
| IFEval prompt-strict (323) | 0,7802 | 0,7709 | -0,93pp |
| IFEval instruction-strict (323) | 0,8299 | 0,8209 | -0,90pp |
| HumanEval+ pass@1 (164) | 0,8598 | 0,8537 | -0,61pp |
| Diversidad lexica (indice, baseline=100) | 100,00 | 99,98 | -0,02 |
| MATTR-500 | 0,5567 | 0,5634 | +0,0067 |

El autor indica que ninguna diferencia es estadísticamente distinguible de cero en estos tamaños de muestra. La supresión por dominio varía: creativo 67,78%, usuario real 28,40%, seguimiento de instrucciones 27,71%, QA factual 14,40%, explicativo 10,13% y conversacional 4,65%.

## Requisitos de hardware

- El checkpoint es BF16 y el repositorio pesa 65,8 GB, por lo que se necesitan al menos 66 GB de VRAM para cargarlo sin cuantizar (una GPU A100 80GB o H100 80GB).
- No se proporcionan cuantizaciones oficiales; para ejecutarlo en GPUs consumer (p. ej., RTX 4090 con 24 GB) sería necesario aplicar cuantización externa (AWQ, GPTQ, GGUF) no incluida en el repositorio.
- Opciones de despliegue: compatible con el ecosistema transformers (HuggingFace) y endpoints compatibles según los tags; no se mencionan integraciones específicas con vLLM, llama.cpp u Ollama.
- No se reportan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Nemotron-3.5-30B-A3B-Antislop-FTPO-V2 (este) | 31,58B totales, ~3B activos | no disponible | openmdw-1.1 | Fine-tuning anti-slop con FTPO |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 31,58B totales, ~3B activos | no disponible | no disponible (base de NVIDIA) | Modelo base MoE |
| Nemotron-3.5-30B-A3B-Antislop-FTPO (V1) | 31,58B totales, ~3B activos | no disponible | openmdw-1.1 | Fine-tuning anti-slop solo creativo |

La comparativa se limita a los modelos directamente relacionados porque no se dispone de datos de rendimiento de otras alternativas de tamaño similar en la documentación proporcionada.

## Limitaciones y advertencias

- La supresión de patrones es débil en el dominio conversacional (4,65%), lo que limita su eficacia en chatbots de diálogo abierto.
- Algunos rasgos tipográficos empeoran tras el ajuste: el guion largo sin espacios pasa de 38,9x a 52,3x la tasa humana, los encabezados markdown, las listas con viñetas y los emojis también aumentan su frecuencia.
- El modelo está entrenado únicamente en inglés; no se ha evaluado su comportamiento en otros idiomas.
- La licencia openmdw-1.1 es personalizada; es necesario revisar sus términos antes de uso comercial (ver enlace en la sección de enlaces).
- No se han evaluado sesgos sociales ni de género en la documentación disponible; el riesgo de alucinación no se ha cuantificado.
- La ventana de contexto no está documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- No se proporcionan cuantizaciones oficiales; cualquier reducción de precisión debe ser validada por el usuario.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2
- Adaptador LoRA: https://huggingface.co/thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2-LoRA
- Versión V1: https://huggingface.co/thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO
- Repositorio de Antislop: https://github.com/sam-paech/auto-antislop
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Paper referenciado en tags (arXiv:2510.15061): https://arxiv.org/abs/2510.15061
