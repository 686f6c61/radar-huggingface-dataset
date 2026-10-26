# ws-fy/qwen2.5-3b-character-imitation-lora

## Resumen

`ws-fy/qwen2.5-3b-character-imitation-lora` es un adaptador LoRA (PEFT) entrenado con LLaMA-Factory sobre el modelo base Qwen2.5-3B-Instruct. No se trata de un modelo completo, sino de un ajuste fino ligero de 114,2 MB en safetensors FP32 (504 tensores) que se carga por encima de los pesos del 3B. Su objetivo no es incorporar un personaje concreto, sino aprender la habilidad meta de imitar el estilo de habla de un personaje cualquiera a partir de dos o tres frases de ejemplo incluidas en el propio prompt (few-shot).

El autor lo describe como un «imitador de estilo de habla»: el adaptador se entrenó con 1.500 muestras en chino que cubren unas 626 combinaciones de arquetipos de personaje (señora del barrio, chica enérgica, programador, espadachín wuxia, médico tradicional, científico, joven que pasa de todo). El resultado es un modelo pequeño que reproduce registro, vocabulario y muletillas del personaje ejemplificado, pero limitado a respuestas cortas y en chino.

Es relevante por su carácter demostrativo y por su bajo coste de despliegue: cabe en GPUs de consumo con menos de 8 GB de VRAM y sirve como «capa de tono» para prototipos de NPC, VTubers o chatbots con personalidad. Conviene tener presente que la pérdida de entrenamiento cayó por debajo de 0,02 ya en la época 2 y terminó en 0,003, señal clara de sobreajuste según el propio autor, lo que condiciona su generalización a estilos no vistos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen2.5-3B-Instruct |
| Parámetros totales | No disponible para el adaptador (114,2 MB en FP32 safetensors, 504 tensores); el modelo base Qwen2.5-3B-Instruct tiene 3B |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (cutoff_len de entrenamiento); la ventana nativa del modelo base no se detalla en la información disponible |
| Tipos de cuantización | No se distribuyen versiones cuantizadas. El adaptador se publica en FP32 safetensors y se entrenó en FP16; la base se puede cargar en FP16 o cuantizada por el usuario, pero no hay artefactos GGUF/AWQ/GPTQ publicados |
| Idiomas soportados | zh y en (etiquetas del repositorio). El entrenamiento se realizó exclusivamente con datos en chino; el rendimiento en inglés no ha sido evaluado |
| Licencia | `other`, nombre `qwen-research` (Qwen Research License), heredada del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), cargable con `peft` y con LLaMA-Factory |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros. El ajuste es un LoRA de rango 16 y alpha 32 (factor de escala 2,0) con dropout 0,05, aplicado a todas las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las del bloque MLP (`gate_proj`, `up_proj`, `down_proj`). El entrenamiento se hizo en FP16 sobre una NVIDIA RTX 2080 Ti de 22 GB, con AdamW, learning rate 1e-4 con decaimiento lineal, batch efectivo de 32 (4 × 8 de acumulación), semilla 42 y 5 épocas (235 pasos). El resultado son 504 tensores que ocupan 114,2 MB en FP32.

El dataset es propio: 1.500 muestras JSONL en chino, cada una con una instrucción fija de tarea más 2-3 citas de ejemplo del personaje y una respuesta corta (12-39 caracteres, media de 27) en el estilo objetivo. La innovación es de planteamiento, no arquitectónica: en lugar de entrenar un LoRA por personaje, se entrena la tarea de «aprender el estilo a partir de ejemplos», de modo que un solo adaptador cubre más de 600 prototipos de personaje. La contrapartida es un sobreajuste evidente: la pérdida pasa de 2,82 (paso 10) a 0,02 hacia la época 2,2 y a 0,003 al final, y el autor reconoce memorización de los arquetipos vistos y dificultad para generalizar a estilos nuevos.

## Capacidades

- Generación de texto conversacional con estilo transferido: reproduce registro, vocabulario y muletillas del personaje descrito en el prompt.
- Imitación de estilo guiada por ejemplos (few-shot): basta con 2-3 frases de muestra para inducir el tono, sin reentrenamiento.
- Cobertura de arquetipos amplia: estilos coloquiales, anime, laborales, wuxia, académicos y de medicina tradicional, entre otros.
- Respuestas cortas y oralizadas: el modelo está calibrado para producir una sola frase de 12-39 caracteres, con entonación conversacional.
- Conversación multi-turno dentro de la plantilla de chat de Qwen (`apply_chat_template`).
- Integración con tooling estándar de PEFT: carga directa con `transformers` + `peft`, con LLaMA-Factory o con vLLM en modo LoRA.
- Capacidades del modelo base heredadas (comprensión lectora básica, matemáticas simples, generación de código), aunque no evaluadas tras el ajuste.
- No dispone de modo «thinking», visión, audio, tool calling específico ni soporte de agentes entrenado en este adaptador.

## Casos de uso

- Prototipado rápido de NPC en videojuegos: para un personaje secundario se introducen dos frases de guion en el prompt y el adaptador devuelve respuestas con la voz del personaje, sin entrenar un LoRA dedicado ni pagar inferencia de un modelo grande.
- Capa de tono en chatbots de marca: aplicar el estilo de una marca o de un community manager sobre respuestas cortas de atención al cliente, ejecutando el 3B en una GPU de 8 GB dentro del propio backend.
- VTubers y avatares conversacionales: generar réplicas breves y con muletillas coherentes para streaming en vivo, donde la latencia y el coste importan más que la profundidad de contenido.
- Demos de transferencia de estilo para investigación: servir como línea base reproducible (LoRA r=16, alpha=32, 1.500 muestras) al comparar técnicas de style transfer o de few-shot prompting.
- Generación de diálogo con restricciones de longitud: guiones de novela visual o cómic donde cada línea debe ser una frase corta y con voz propia, aprovechando que el modelo está sesgado a ese formato.
- Despliegue en hardware muy limitado: prototipos en portátil con GPU de 6-8 GB o en entornos con presupuesto de VRAM ajustado, sirviendo un único adaptador para múltiples personajes mediante prompts distintos.
- Pruebas A/B de personalidad: intercambiar el adaptador por otro LoRA en vLLM (`--enable-lora`) para comparar voces sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: pérdida 2,82 (paso 10), 0,02 (época ~2,2) y 0,003 (época 5); norma de gradiente de 1,5 a 0,06, sin picos de pérdida.

## Requisitos de hardware

- VRAM para el adaptador: 114,2 MB en FP32; negligible frente a los pesos base.
- VRAM para inferencia con la base en FP16: aproximadamente 6,2 GB solo para pesos, más caché KV y overhead, en torno a 7-8 GB para contextos de 2048 tokens.
- El autor indica que el modelo está pensado para ejecutarse en dispositivos con menos de 8 GB de VRAM.
- GPU de entrenamiento documentada: NVIDIA RTX 2080 Ti de 22 GB en FP16 (Turing).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para servir varias instancias; también vale cualquier GPU con al menos 8 GB para FP16 y menos si se cuantiza la base.
- Despliegue: PEFT + transformers (recomendado por el autor), LLaMA-Factory (`template: qwen`, `infer_dtype: float16`) y vLLM con `--enable-lora` y `--lora-modules`. No se proporcionan artefactos para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo sugeridos por el autor: `temperature` 0,8-1,0 y `top_p` 0,9 para evitar repeticiones propias de la decodificación voraz.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| ws-fy/qwen2.5-3b-character-imitation-lora | LoRA sobre Qwen2.5-3B-Instruct | 3B (base) + adaptador de 114,2 MB | 2048 (entrenamiento) | zh, en | qwen-research | Imitación de estilo genérica por few-shot; sobreajuste reconocido |
| Qwen/Qwen2.5-3B-Instruct | Modelo completo (base) | 3B | No disponible en esta información | Multilingüe | qwen-research | Sin la habilidad específica de imitación de estilo; capacidades generales superiores en contenido |
| Otros LoRA de personaje único | LoRA sobre un LLM | Variable | Variable | Variable | Variable | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros adaptadores de imitación de estilo en la información proporcionada.

## Limitaciones y advertencias

- Sobreajuste severo: la pérdida baja de 0,02 a 0,003 entre las épocas 2 y 5, lo que provoca memorización de los arquetipos del set de entrenamiento y menor fidelidad ante estilos nuevos.
- Longitud de salida restringida a una frase corta (12-39 caracteres en entrenamiento); no es apto para respuestas largas, explicaciones ni documentos.
- Entrenamiento exclusivamente en chino: el rendimiento en inglés o castellano no ha sido evaluado y no hay garantía de calidad.
- Imita la forma del habla, no el contenido: no garantiza coherencia con los hechos, la biografía ni el conocimiento del personaje.
- Capacidad de razonamiento y conocimiento limitada por la base de 3B, agravada por el ajuste en datos de estilo.
- Riesgo de repetición y de colapso en decodificación voraz; el autor recomienda muestreo con temperatura 0,8-1,0.
- Riesgo de alucinación inherente a un modelo de 3B sin verificación factual.
- Licencia `qwen-research`: uso libre para fines personales y de investigación, con posibles restricciones para uso comercial; conviene revisar el texto de la licencia del modelo base antes de desplegar en producción.
- Sesgos: el dataset cubre arquetipos costumbristas chinos, por lo que puede reproducir estereotipos de género, edad o profesión presentes en los ejemplos.
- El autor recomienda, para producción, reentrenar con datos de respuesta más larga o reducir a 2-3 épocas para preservar generalización.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
