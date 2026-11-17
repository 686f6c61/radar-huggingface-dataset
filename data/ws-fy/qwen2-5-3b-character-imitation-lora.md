# ws-fy/qwen2.5-3b-character-imitation-lora

## Resumen

`ws-fy/qwen2.5-3b-character-imitation-lora` es un adaptador LoRA para Qwen2.5-3B-Instruct entrenado por el usuario ws-fy con LLaMA-Factory. Su objetivo no es imitar a un personaje concreto, sino aprender la habilidad general de "hablar a partir de ejemplos": dado un puñado de citas de un personaje en el prompt, el modelo responde a cualquier pregunta adoptando su tono, vocabulario y muletillas. El entrenamiento cubre más de 600 arquetipos de personajes en chino (tía callejera, chica genki, programador, espadachín wuxia, médico tradicional, científico, joven vago, etc.).

Técnicamente es un adaptador PEFT de rango 16 y alpha 32, aplicado sobre todas las proyecciones de atención (q/k/v/o) y MLP (gate/up/down) del transformer de 3B parámetros. El adaptador pesa unos 114,2 MB en safetensors FP32 (504 tensores) y se entrenó con 1.500 muestras JSONL en chino durante 5 épocas con una longitud de contexto de 2.048 tokens, sobre una única RTX 2080 Ti de 22 GB en FP16.

Su relevancia es doble: por un lado, demuestra que un modelo de 3B puede adquirir una capacidad de transferencia de estilo razonable con muy pocos datos y hardware de consumo; por otro, la model card documenta abiertamente un sobreajuste severo (loss de 0,003 al final), lo que lo convierte en un caso de estudio útil sobre los límites del SFT con datasets pequeños y respuestas cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 3B (modelo base) + adaptador LoRA de ~114,2 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (cutoff_len de entrenamiento); el modelo base soporta hasta 32.768 tokens, pero el adaptador solo se entrenó a 2.048 |
| Tipos de cuantizacion | no especificados en la model card; el adaptador se distribuye en FP32 safetensors y se entrenó en FP16 |
| Idiomas soportados | zh (entrenamiento), en (declarado, sin evaluar) |
| Licencia | qwen-research (license: other, enlazada a la licencia de Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); existe versión fusionada FP16 en `ws-fy/qwen2.5-3b-character-imitation` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3B parámetros. La configuración LoRA usa r=16, alpha=32 (escala 2,0) y dropout 0,05, con módulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, es decir, todas las proyecciones de atención y MLP. El entrenamiento se realizó con LLaMA-Factory en FP16 nativo (AMP), learning rate 1e-4 con decaimiento lineal, AdamW, batch efectivo de 32 (4 × 8 de acumulación), 5 épocas, 235 pasos y semilla 42, sobre una NVIDIA RTX 2080 Ti de 22 GB.

El dataset es propio: 1.500 muestras JSONL en chino con formato few-shot, donde cada instrucción incluye una descripción fija de la tarea más 2-3 citas del personaje, y la salida es una respuesta breve en personaje a una pregunta cotidiana. Cubre unos 626 conjuntos de citas distintos con estilos que van del argot callejero al anime, pasando por el entorno laboral, wuxia y académico. Las respuestas objetivo son frases cortas de 12 a 39 caracteres (media de ~27), lo que condiciona fuertemente la longitud de salida. La loss de entrenamiento cayó de 2,82 en el paso 10 a 0,02 hacia la época 2,2 y a 0,003 al final de la época 5, con norma de gradiente convergiendo de 1,5 a 0,06 sin picos: el propio autor señala esto como una tendencia clara a sobreajuste y memorización.

## Capacidades

- Transferencia de estilo conversacional a partir de ejemplos: imita tono, registro, vocabulario y muletillas de un personaje dado en el prompt.
- Generalización a arquetipos no vistos, aunque con menor estabilidad y necesidad de más citas de ejemplo.
- Generación de texto conversacional breve en chino, orientada a respuestas de una sola frase.
- Soporte de plantilla de chat de Qwen (`apply_chat_template`) y del template `qwen` de LLaMA-Factory.
- Integración con PEFT, LLaMA-Factory y vLLM (con `--enable-lora`).
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct (conocimiento general, instrucciones), aunque degradadas por el ajuste de estilo.
- No se documenta soporte específico de tool calling, agentes, visión, audio ni modo thinking en el adaptador.

## Casos de uso

- Bots de rol y NPCs con voz propia: se inyectan 2-3 citas del personaje en el prompt y el modelo responde en su estilo, lo que permite definir decenas de personajes sin entrenar un LoRA por cada uno.
- Personas de VTuber o marcas: se usa como capa de "tono de voz" sobre el modelo base para dar coherencia estilística a respuestas cortas en chat.
- Demos rápidas de transferencia de estilo: al pesar ~114 MB y correr en menos de 8 GB de VRAM, permite prototipar personajes en portátiles o GPUs de consumo.
- Chat estilizado en dispositivos con memoria limitada: despliegue con llama.cpp/Ollama o vLLM en GPUs modestas para asistentes con personalidad.
- Investigación sobre sobreajuste en SFT: el modelo sirve como caso controlado para estudiar cómo un dataset pequeño y de respuestas cortas colapsa la distribución de salida.
- Generación de diálogos breves para guiones o videojuegos: útil para producir líneas de una sola frase con un registro concreto que luego se revisan y editan.
- Filtrado y clasificación estilística: como generador de ejemplos positivos de un estilo para aumentar datasets de clasificadores de registro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento (loss 2,82 → 0,003, grad norm 1,5 → 0,06) y no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de similitud estilística.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6-7 GB en FP16 para el modelo base de 3B más el adaptador; ~4 GB en cuantización de 8 bits y ~2,5 GB en 4 bits (estimaciones estándar para un modelo de 3B, no publicadas por el autor).
- GPU recomendadas: RTX 3090/4090, A10, L4, A100 para servir en producción; el propio autor entrenó en una RTX 2080 Ti de 22 GB.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: PEFT + Transformers, LLaMA-Factory (inferencia), vLLM con `--enable-lora`, y versiones fusionadas para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 3B, se espera una latencia baja en GPUs modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ws-fy/qwen2.5-3b-character-imitation-lora | 3B + LoRA r=16 | 2.048 (entrenamiento) | Imitación de estilo few-shot multiarquetipo | qwen-research | Hugging Face, 54 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Instrucciones generales | qwen-research | Hugging Face, ampliamente usado |
| LoRA de personaje único (genérico) | 3B + LoRA | variable | Un personaje por adaptador | variable | Hugging Face |
| Modelos de rol de 7B-8B (p. ej. variantes de Llama/Mistral) | 7-8B | 8.192-32.768 | Roleplay y personajes | variable | Hugging Face |

La diferencia clave frente a un LoRA de personaje único es que este adaptador aprende la habilidad de imitar a partir de ejemplos en el prompt, lo que reduce el coste de añadir personajes nuevos. Frente al Qwen2.5-3B-Instruct base, gana en control estilístico pero pierde generalidad y longitud de respuesta. No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo con las alternativas.

## Limitaciones y advertencias

- Sobreajuste documentado: la loss cae a 0,003 al final, lo que indica memorización; el autor recomienda entrenar solo 2-3 épocas o ampliar con respuestas más largas.
- Longitud de salida acotada: el modelo tiende a frases de 12-39 caracteres; no es apto para generación de formato largo.
- Solo se entrenó con estilos en chino; la imitación en inglés está declarada pero no evaluada.
- El conocimiento del mundo del base de 3B es limitado: el estilo puede ser correcto pero el contenido superficial o erróneo.
- Imita el cómo habla un personaje, no su conocimiento factual ni su persona; no debe usarse como fuente de información del personaje.
- Riesgo de alucinación heredado del modelo base y acentuado por el ajuste de estilo.
- Licencia qwen-research: restricciones para uso comercial; conviene revisar los términos de Qwen2.5-3B-Instruct antes de desplegar en producción.
- Evitar decodificación greedy (provoca repetición); se recomienda temperature 0,8-1,0 y top_p 0,9.
- El adaptador solo se entrenó a 2.048 tokens de contexto; no aprovecha la ventana de 32.768 del base.
- Estilos nuevos no vistos en entrenamiento pueden necesitar más citas de ejemplo para estabilizarse.
- El repositorio tiene 54 descargas y 0 likes: tracción muy baja, sin validación comunitaria.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Versión fusionada FP16 (referenciada en la model card): https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- PEFT: https://github.com/huggingface/peft
- vLLM (soporte LoRA): https://docs.vllm.ai/en/latest/features/lora.html
