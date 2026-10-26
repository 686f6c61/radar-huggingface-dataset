# Thanatos0512/YulaGeoLLM

## Resumen

YulaGeoLLM es un adaptador LoRA (PEFT) para Microsoft Phi-3 Mini 4K Instruct, ajustado para responder preguntas sobre geología de exploración minera. Lo desarrolla Thanatos0512 y se publica bajo licencia MIT, con el modelo base (también MIT) distribuido por separado. No es un modelo autónomo: el repositorio contiene únicamente los pesos del adaptador (0,1 GB), que deben cargarse sobre `microsoft/Phi-3-mini-4k-instruct` mediante `peft`.

El interés práctico está en la especialización, no en el tamaño: el ajuste se hizo con QLoRA sobre el dataset Mineral Exploration Geology QA, derivado de aproximadamente 300 informes WAMEX de Australia Occidental, con 479 registros de entrenamiento (352 de pregunta-respuesta y 127 de cadena de razonamiento). El modelo hereda del base una arquitectura transformer decoder-only densa de 3,8 mil millones de parámetros y 4096 tokens de contexto, suficiente para consultas técnicas cortas pero no para documentos completos.

Es relevante ahora porque ejemplifica el patrón de adaptadores de dominio de bajo coste sobre modelos pequeños: se entrena y se sirve en hardware de consumo, y se integra en pipelines existentes de Transformers, vLLM o TGI. La contrapartida es que no hay evaluación formal publicada, el dataset es pequeño y centrado en una región concreta, y el propio autor advierte de que el español está declarado como idioma previsto pero no evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-3 Mini) con adaptador LoRA inyectado en las proyecciones de atención y MLP |
| Parametros totales | 3,8 mil millones (modelo base); el adaptador LoRA añade un subconjunto no cuantificado en la ficha (r=8, alpha=16) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del base, Phi-3 Mini 4K) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar; el base admite cuantización de 8 y 4 bits (se entrenó con NF4 de 4 bits y doble cuantización, dtype de cómputo bfloat16) y existen versiones GGUF del base en la comunidad |
| Idiomas soportados | Inglés y español declarados; el dataset de entrenamiento es en inglés y el rendimiento en español no se ha evaluado |
| Licencia | MIT para el adaptador; el modelo base es MIT; el dataset declara Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar el base aparte |
| Modelo base | microsoft/Phi-3-mini-4k-instruct |
| Tarea | Causal language modeling (generación de texto conversacional) |
| Tamano del repositorio | 0,1 GB |
| Librerias | peft, transformers, accelerate, torch |
| Dataset de entrenamiento | AshkanTaghipour/mineral-exploration-geology-qa |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Phi-3 Mini 4K Instruct, un transformer decoder-only denso de 3,8 mil millones de parámetros con 4096 tokens de contexto, ajustado originalmente con instrucciones y conversación. El ajuste de YulaGeoLLM es un SFT con QLoRA: base cuantizada en 4 bits NF4 con doble cuantización y cómputo en bfloat16, LoRA de rango 8, alpha 16 y dropout 0,05, aplicado sobre `qkv_proj`, `gate_up_proj`, `down_proj` y `o_proj`, sin sesgo. Hiperparámetros declarados: 10 épocas, learning rate 3e-4, batch por dispositivo de 16, acumulación de gradiente de 1. La longitud máxima de secuencia no está disponible en el material proporcionado.

Los datos provienen del Mineral Exploration Geology QA Dataset, que según su card recoge pares pregunta-respuesta y trazas de razonamiento revisadas por expertos sobre exploración mineral en Australia Occidental, elaboradas a partir de unos 300 informes WAMEX. El split de entrenamiento contiene 479 registros (352 QA y 127 de cadena de razonamiento); existen además 26 registros de test y 15 trampas de alucinación que no se usaron para evaluar este adaptador. El autor no documenta qué campos exactos se seleccionaron ni cómo se trató el texto de razonamiento en los ejemplos de entrenamiento, y no se realizó ninguna evaluación formal sobre el split de test.

## Capacidades

- Generación de texto conversacional en formato de chat (chat template de Phi-3), orientada a dominios de geología y exploración minera.
- Respuesta a preguntas técnicas sobre exploración mineral, con cobertura sesgada hacia Australia Occidental según el dataset.
- Producción de borradores de respuesta con estructura de razonamiento, ya que parte de los datos de entrenamiento son cadenas de pensamiento.
- Soporte de conversaciones multi-turno a través del chat template heredado del base, limitado a 4096 tokens en total.
- Capacidad multilingüe teórica inglés-español; el español no está cubierto por el entrenamiento ni evaluado.
- Tool calling y function calling: no documentado para el adaptador; el base Phi-3 Mini 4K Instruct admite formato de herramientas, pero no hay evidencia de que el ajuste lo preserve.
- Uso como agente multi-paso: no documentado ni evaluado.
- Vision y audio: no soportados.

## Casos de uso

- Borradores de respuestas técnicas para geólogos: el adaptador genera un primer borrador sobre evidencias de seguimiento en un target de exploración (geoquímica, alteración, geofísica) que después se revisa y contrasta con informes primarios.
- Estudio y formación interna: explicaciones de conceptos de exploración mineral para personal junior, con la ventaja de que el estilo y el vocabulario se ajustan al dominio; requiere revisión por un geólogo cualificado.
- Triaje de informes históricos: con chunking a menos de 4096 tokens, resumir secciones de informes tipo WAMEX y extraer afirmaciones clave para indexarlas en un sistema de búsqueda.
- Apoyo a la redacción de memorias técnicas en castellano: traducción y reescritura de borradores de secciones geológicas, asumiendo que la calidad en español no está garantizada y exige revisión frase a frase.
- Generación de checklists operativos: listas de comprobación de datos a recoger antes de un programa de perforación, útiles como plantilla de discusión en equipo, nunca como base decisoria.
- Evaluación de pipelines RAG geológicos: el adaptador sirve como generador de referencia para comparar respuestas de un sistema con recuperación frente a un modelo sin especializar en el mismo corpus.
- Prototipado de asistentes internos de bajo coste: al caber en GPU de consumo, permite desplegar un prototipo de chatbot de dominio en una estación de trabajo antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se realizó ninguna evaluación formal de este adaptador, ni sobre el split de test del dataset ni sobre las 15 trampas de alucinación, y advierte de que la pérdida de entrenamiento reportada no es una medida de generalización ni de calidad de las respuestas.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluación sobre el split de test del dataset (26 registros) | no realizada |
| Pruebas de alucinación (15 trampas) | no realizadas |
| Pérdida de entrenamiento | reportada por el autor, sin valor comparable entre modelos |

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 8 GB solo para los pesos del base (3,8 mil millones de parámetros), más overhead de activaciones y KV cache; el adaptador añade un consumo marginal.
- VRAM estimada en 4 bits: aproximadamente 2,5 a 4 GB en total, lo que deja espacio para contexto largo dentro de los 4096 tokens.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inferencia local; A100 o H100 solo si se sirven muchas réplicas o se compara con modelos mayores.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en fp16 y con 4 GB o más usando cuantización de 4 bits del base.
- Despliegue: `transformers` + `peft` (versiones probadas por el autor: transformers 4.46.2, peft 0.13.2, accelerate 1.1.1), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, o llama.cpp/Ollama tras fusionar el adaptador en el base y convertirlo a GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YulaGeoLLM (Phi-3 Mini + LoRA) | 3,8 B (adaptador r=8) | 4096 | Geología de exploración minera (Australia Occidental) | MIT | HuggingFace, requiere el base |
| microsoft/Phi-3-mini-4k-instruct | 3,8 B | 4096 | Generalista, instrucciones y chat | MIT | HuggingFace, ampliamente desplegado |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 | Generalista multilingüe | Apache-2.0 | HuggingFace, buen soporte en vLLM y llama.cpp |
| Llama-3.2-3B-Instruct | 3,21 B | 131 072 | Generalista multilingüe | Licencia comunitaria Llama 3.2 | HuggingFace, ecosistema amplio |

La diferencia de YulaGeoLLM no es de capacidad bruta sino de ajuste al dominio: frente al base gana vocabulario y estilo geológico, pero pierde generalidad y no aporta ventajas de contexto ni de licencia frente a Qwen2.5-3B o Llama-3.2-3B, que ofrecen ventanas mucho mayores para ingerir informes completos.

## Limitaciones y advertencias

- Puede generar afirmaciones geológicas incorrectas, incompletas o sin respaldo, y no cita fuentes verificables en sus respuestas.
- El dataset es pequeño (479 registros de entrenamiento) y está centrado en exploración mineral de Australia Occidental; el rendimiento en otras regiones, especialidades geológicas y estilos de pregunta es desconocido.
- El español está declarado como idioma previsto, pero el dataset es en inglés y no se ha establecido cobertura ni calidad en castellano.
- Sin evaluación formal: no hay métricas sobre el split de test ni sobre las trampas de alucinación del dataset.
- Riesgo alto en decisiones críticas: el autor prohíbe explícitamente usar la salida como base única para programas de perforación, presupuestos de exploración, declaraciones de recursos o reservas, decisiones de ingeniería o seguridad, permisos ambientales o decisiones de inversión.
- Ventana de contexto de 4096 tokens: insuficiente para informes completos y para conversaciones largas, obliga a chunking y limita el uso en RAG.
- Licencia: el adaptador es MIT, pero el uso comercial debe respetar también la licencia del modelo base (MIT) y los términos del dataset (Apache-2.0); conviene revisar la procedencia de los informes WAMEX subyacentes.
- Dependencia de la versión de librerías: la carga se documenta con versiones concretas de transformers, peft y accelerate; versiones distintas pueden requerir ajustes.
- El repositorio no incluye el modelo base, por lo que el despliegue implica dos descargas y una gestión de versiones adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thanatos0512/YulaGeoLLM
- Perfil del autor: https://huggingface.co/Thanatos0512
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/AshkanTaghipour/mineral-exploration-geology-qa
- Informes WAMEX (fuente citada del dataset, sin enlace directo en la informacion disponible): no disponible
