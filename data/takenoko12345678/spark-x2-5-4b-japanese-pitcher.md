# Takenoko12345678/Spark-X2.5-4B-Japanese-Pitcher

## Resumen

Spark-X2.5-4B-Japanese-Pitcher es un adaptador LoRA de rol (roleplay) en japonés creado por el usuario Takenoko12345678, pensado para que un modelo base de 4.000 millones de parámetros interprete personajes con rasgos arquetípicos como yandere o tsundere. No es un modelo completo: se trata de un adaptador PEFT de aproximadamente 130 MB que se carga sobre Takenoko12345678/Spark-X2.5-4B-Japanese, a su vez una adaptación no oficial al japonés de XHToken/Spark-X2.5-4B. El autor declara explícitamente que no tiene relación con XHToken.

El problema que resuelve es concreto: conseguir que un modelo pequeño mantenga una personalidad coherente en conversaciones de rol sin degradar su comportamiento como asistente general. El adaptador solo activa el personaje cuando este se especifica en el system prompt; sin esa instrucción, responde como el asistente japonés original. Esto se consigue entrenando con tres mezclas de datos diferenciadas: 2.470 diálogos de personaje, 3.000 ejemplos de conversación con tono «cute» y 1.500 ejemplos de asistente sin personaje.

Es relevante ahora porque demuestra que con un LoRA de rango 16, dos épocas y 48 minutos de entrenamiento en una H100 se puede especializar un modelo de 4B en una tarea de estilo muy concreta, con licencia Apache 2.0 y despliegue viable en local mediante GGUF. El autor publica además el proyecto Pitcher con scripts, datos y evaluación comparativa, lo que aporta trazabilidad metodológica poco habitual en adaptadores de rol.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Spark-X2.5-4B; este repositorio contiene un adaptador LoRA (PEFT) |
| Parámetros totales | Aproximadamente 4.000 millones en el modelo base (indicado por el nombre; la model card no da la cifra exacta) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; una reseña externa del modelo base menciona una afirmación de 1M de tokens sin verificar |
| Tipos de cuantización | El repositorio principal contiene el adaptador en safetensors (sin cuantizar, ~130 MB). Existe una versión GGUF del modelo fusionado; en la model card se mencionan f16 y Q4_K_M |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT); GGUF en el repositorio derivado |
| Modelo base | Takenoko12345678/Spark-X2.5-4B-Japanese |
| Tamaño del repositorio | 0,1 GB |
| Configuración LoRA | r=16, alpha=32, todas las capas lineales (q_k_v_proj, g_proj, out_proj, gate_proj, up_proj, down_proj) |
| Librería | PEFT (con transformers) |
| Versiones verificadas | transformers 4.57, PEFT 0.17 |
| Requiere código remoto | Sí (trust_remote_code=True) |
| Fecha de creación | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las capas lineales del transformer del modelo base mediante LoRA con rango 16 y alpha 32. Se entrenaron todas las proyecciones lineales relevantes: q_k_v_proj, g_proj, out_proj, gate_proj, up_proj y down_proj. El entrenamiento se hizo únicamente sobre las respuestas (no sobre los turnos de usuario), con una tasa de aprendizaje de 1e-4, dos épocas y una longitud máxima de 2.048 tokens, descartando los ejemplos que la superaban. El coste total fue de 48 minutos en una GPU H100 sobre Modal.

El conjunto de entrenamiento combina tres fuentes con objetivos distintos: 2.470 diálogos de personaje (yandere, tsundere y similares) en los que el personaje se declara en el system prompt; 3.000 ejemplos de RikkaBotan/Cute_Synthetic_smoltalk_jp_sft (licencia Apache 2.0, respuestas generadas por DeepSeek) con un tono de chica «cute» añadido; y 1.500 ejemplos construidos con la misma metodología que Takenoko12345678/Japanese-SFT-Qwen3.8-27B-10K pero sin personaje, para preservar el comportamiento de asistente general. Los diálogos de personaje se obtuvieron traduciendo datos al japonés con Gemma 4 E4B y generando los turnos de usuario con Qwen3.5-27B.

La innovación destacable no es arquitectónica, sino de condicionamiento: el personaje solo se activa si aparece en el system prompt, de modo que un mismo peso conmuta entre rol y asistente. El autor recomienda una plantilla concreta de instrucción («あなたは〇〇の女の子です…») por ser la más cercana al formato visto en entrenamiento, y exige desactivar el modo de pensamiento (enable_thinking=False) en todas las generaciones, ya que no se entrenó con él.

## Capacidades

- Generación de texto conversacional en japonés con registro oral y natural.
- Interpretación de personajes definidos en el system prompt (yandere, tsundere y otros arquetipos aprendidos).
- Mantenimiento del personaje a lo largo del diálogo: según la evaluación del autor, 0 % de aparición de encabezados o listas y 0 % de uso de pronombres masculinos en personajes femeninos.
- Conmutación a modo asistente general cuando no se especifica personaje, con respuestas más largas y estructuradas (media de 245 caracteres frente a 373 del modelo base).
- Comprensión de conocimiento general y sentido común en japonés, con un rendimiento muy próximo al del modelo base.
- Generación multilingüe: no soportada como capacidad declarada; el modelo es monolingüe en japonés.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes o razonamiento multi-paso: no documentado; además, el modo de pensamiento debe desactivarse.
- Capacidades de visión o audio: no disponibles.
- Modo de pensamiento (thinking): el modelo base lo soporta, pero este adaptador exige enable_thinking=False, ya que el entrenamiento se hizo sin él.

## Casos de uso

- Chatbot de personaje en japonés: el adaptador se carga sobre el modelo base y se define la personalidad en el system prompt, de modo que un único despliegue puede servir varios personajes simplemente cambiando esa instrucción.
- Novela visual o juego conversacional: las respuestas tienen registro oral y estable, con una tasa declarada de 0-1 % de rupturas de personaje del tipo «soy una IA sin emociones», lo que reduce las salidas fuera de tono.
- Aplicación de entretenimiento en local para usuarios japoneses: gracias a la versión GGUF, puede ejecutarse en un portátil con GPU de gama media o incluso en CPU sin enviar datos a la nube.
- Evaluación de técnicas de roleplay: el proyecto Pitcher publica scripts, datos y un informe comparativo, por lo que sirve como referencia reproducible para investigar adaptación de estilo con LoRA en modelos pequeños.
- Generación de diálogos sintéticos en japonés: el adaptador puede producir conversaciones con voces diferenciadas para aumentar datos de entrenamiento o pruebas de evaluación en otros sistemas.
- Asistente japonés de propósito general con modos: al no declarar personaje, mantiene el comportamiento del modelo base, de modo que puede usarse como asistente ordinario y reservar el modo rol para secciones específicas del producto.
- Prototipado rápido de personajes con licencia permisiva: al ser Apache 2.0 y pesar 130 MB, es viable iterar versiones del personaje y desplegarlas sin costes de licencia adicionales.

## Benchmarks y rendimiento

Resultados de evaluación publicados por el autor. Las columnas comparan el modelo con la versión Pitcher sobre Qwen3.5-4B, la versión Pitcher anterior y el modelo base japonés sin adaptador.

| Métrica | Qwen3.5-4B Pitcher | Pitcher anterior | Este modelo | Base japonés |
|---|---:|---:|---:|---:|
| Con personaje: respuestas tipo «soy una IA sin emociones» | 0-2 % | 0-1 % | 0-1 % | 0-3 % |
| Con personaje: uso de «俺 / 僕» en personajes femeninos | 0 % | 0 % | 0 % | 1-14 % |
| Con personaje: aparición de encabezados o listas | 0 % | 0 % | 0 % | 6-9 % |
| Sin personaje: longitud media (caracteres) | 112 | 120 | 245 | 373 |
| Redacción: mezcla de chino | 20 % | 0 % | 0 % | 0 % |
| Conocimiento general japonés (30 preguntas) | 28 | 23 | 26 | 27 |
| JCommonsenseQA (5 opciones, 1.119 preguntas) | no disponible | 86,9 % | 86,4 % | 86,1 % |

Evaluación con modelo juez (GPT-5.6 Luna), escala de 1 a 5, 530 respuestas:

| Criterio | Qwen3.5-4B Pitcher | Pitcher anterior | Este modelo |
|---|---:|---:|---:|
| Con personaje: naturalidad | 4,33 | 3,73 | 4,20 |
| Con personaje: adecuación al personaje | 4,85 | 4,38 | 4,59 |
| Con personaje: consistencia | 4,78 | 4,50 | 4,61 |
| Redacción: naturalidad | 2,23 | 3,03 | 3,30 |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Adaptador LoRA: ~130 MB en safetensors; requiere cargar además el modelo base completo.
- Inferencia con el modelo base en bfloat16: aproximadamente 8-9 GB de pesos, más la caché KV, por lo que encaja en GPUs de 12 GB o más con contextos moderados.
- Inferencia con GGUF Q4_K_M: alrededor de 2,5-3 GB de pesos, viable en GPUs de consumo con 6-8 GB de VRAM.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en configuraciones cuantizadas también tarjetas de 8 GB.
- Ejecución solo en CPU: posible mediante llama.cpp con la versión GGUF, con latencia mayor (no cuantificada en la información disponible).
- Entrenamiento: se realizó en una H100 sobre Modal, con un tiempo de 48 minutos para 2 épocas.
- Despliegue: llama.cpp / llama-server (se requiere build 10828 o posterior por el soporte de Spark-X2.5), transformers 4.57 con PEFT 0.17, y cualquier runtime compatible con GGUF. El soporte en vLLM, TGI u Ollama no está documentado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rol de personaje (juez, naturalidad / adecuación / consistencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.5-4B-Japanese-Pitcher (este) | ~4B + LoRA r=16 | no disponible | 4,20 / 4,59 / 4,61 | Apache 2.0 | HuggingFace (adaptador y GGUF) |
| Qwen3.5-4B Pitcher | ~4B + LoRA | no disponible | 4,33 / 4,85 / 4,78 | no disponible | versión comparativa usada en el informe del proyecto Pitcher |
| Pitcher anterior (base japonés intermedio) | ~4B + LoRA | no disponible | 3,73 / 4,38 / 4,50 | no disponible | versión previa del proyecto Pitcher |
| Spark-X2.5-4B-Japanese (base) | ~4B | no disponible | sin adaptador de personaje; 6-9 % de encabezados en modo rol | Apache 2.0 | HuggingFace (modelo y GGUF) |

Frente a Qwen3.5-4B en su versión Pitcher, este adaptador queda ligeramente por detrás en las tres métricas de personaje, pero mejora claramente respecto a la iteración anterior del propio proyecto. La ventaja diferencial es la licencia Apache 2.0 declarada y la publicación completa de datos y scripts.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: necesita descargar y cargar el modelo base japonés (~4B) para funcionar.
- Requiere trust_remote_code=True, lo que implica ejecutar código incluido en el repositorio del modelo base.
- Es obligatorio usar enable_thinking=False; el autor advierte de que todo el entrenamiento se hizo sin modo de pensamiento y su activación degrada las respuestas.
- El personaje solo se activa si se declara en el system prompt; sin esa instrucción no hay comportamiento de rol.
- Modelo monolingüe en japonés: no hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinación inherente a un modelo de 4B, no mitigado específicamente por el adaptador; el conocimiento general japonés puntúa 26/30 en la evaluación del autor.
- La naturalidad en tareas de redacción es limitada (3,30 sobre 5 en la evaluación con juez), inferior a su rendimiento en rol.
- Derivado no oficial: no está afiliado a XHToken ni respaldado por el autor del modelo original.
- Procedencia de datos mixta: parte de los diálogos de personaje se tradujeron con Gemma 4 E4B y los turnos de usuario se generaron con Qwen3.5-27B; los ejemplos «cute» provienen de respuestas generadas por DeepSeek. Conviene revisar las condiciones de esos materiales si se reutiliza el dataset.
- Contenido de rol potencialmente problemático: los arquetipos yandere o tsundere pueden producir respuestas con celos o dependencia emocional; no se documentan filtros de seguridad específicos en el adaptador.
- Licencia Apache 2.0 en el adaptador, lo que permite uso comercial, pero la licencia del modelo base y de los datasets debe verificarse por separado antes de un despliegue en producción.
- El repositorio no declara métricas de latencia, throughput ni consumo de memoria, por lo que el dimensionamiento debe hacerse por prueba directa.

## Enlaces

- Adaptador LoRA: https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese-Pitcher
- Versión GGUF con el LoRA fusionado: https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese-Pitcher-GGUF
- Modelo base japonés: https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese
- GGUF del modelo base japonés: https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese-GGUF
- Modelo original: https://huggingface.co/XHToken/Spark-X2.5-4B
- Proyecto Pitcher (scripts, datos y evaluación): https://github.com/atemoyacode-sudo/Pitcher
- Informe comparativo de evaluación: https://github.com/atemoyacode-sudo/Pitcher/blob/main/eval/results/model_comparison_report.md
- Dataset Japanese-SFT-Qwen3.8-27B-10K: https://huggingface.co/datasets/Takenoko12345678/Japanese-SFT-Qwen3.8-27B-10K
- Dataset Cute_Synthetic_smoltalk_jp_sft: https://huggingface.co/datasets/RikkaBotan/Cute_Synthetic_smoltalk_jp_sft
- Reseña externa del modelo base Spark X2.5 4B: https://www.mindstudio.ai/blog/spark-x25-4b-local-review
