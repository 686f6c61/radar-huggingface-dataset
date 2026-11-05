# xxparthparekhxx/pluto-124m-chat

## Resumen

Pluto 124M Chat es un modelo de lenguaje conversacional de 121,2 millones de parámetros entrenado desde cero por el desarrollador independiente xxparthparekhxx. Se trata de un transformer decoder-only de escala reducida, preentrenado sobre 1.000 millones de tokens del subconjunto `sample-10BT` de FineWeb-Edu y posteriormente ajustado en dos fases de instrucción usando HuggingFaceTB/smol-smoltalk y un conjunto destilado. El modelo base sin ajuste conversacional se publica por separado como `pluto-124m-base`.

Su relevancia reside en dos factores. Primero, demuestra que es posible completar el ciclo completo de preentrenamiento y alineación de un modelo conversacional en una única GPU de consumo (una RTX 5060 Laptop de 8 GB), lo que lo convierte en una referencia útil para quienes quieren reproducir el pipeline sin infraestructura de datacenter. Segundo, introduce una arquitectura no estándar (gated attention con QK-norm y logit soft-cap) que requiere `trust_remote_code=True` y un fichero `modeling_pluto.py` propio, lo que lo hace interesante como caso de estudio de implementaciones personalizadas en `transformers`.

El modelo está pensado para tareas conversacionales simples: responder preguntas básicas, reescribir y resumir texto, y seguir instrucciones de formato verificables. El propio autor advierte que a este tamaño comete errores factuales con frecuencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con gated attention, QK-norm y logit soft-cap (clase custom `modeling_pluto.py`) |
| Parámetros totales | 121.229.568 (121M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el preentrenamiento usa secuencias de 1.024 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Tokenizador | BPE de GPT-2 |
| Librería | transformers (requiere `trust_remote_code=True`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 121M de parámetros con varias modificaciones respecto a la arquitectura estándar de GPT-2: atención con compuertas (gated attention), normalización QK sobre las consultas y claves, y un soft-cap sobre los logits. Estas variantes no forman parte de las clases nativas de `transformers`, por lo que el repositorio incluye `modeling_pluto.py` y exige cargar modelo y tokenizador con `trust_remote_code=True`. El tokenizador es el BPE de GPT-2.

El entrenamiento se ejecutó íntegramente en una RTX 5060 Laptop de 8 GB y consta de tres fases. El preentrenamiento (que da lugar a `pluto-124m-base`) usó 1.000 millones de tokens de FineWeb-Edu `sample-10BT`, con 1.907 pasos de 524.288 tokens cada uno (512 secuencias de 1.024), en bf16 y con `torch.compile`. El optimizador combina Muon para las matrices de peso 2D y AdamW para embeddings y normalizaciones. Sobre esa base se aplicaron dos fases de ajuste conversacional: primero smol-smoltalk y después un conjunto destilado más un conjunto de identidad. En ambas fases de fine-tuning la pérdida se calcula únicamente sobre los tokens del asistente.

El formato de chat es `<|endoftext|><|user|>...<|end|><|assistant|>...<|end|>`, con soporte adicional para turnos `<|system|>`. La configuración de generación por defecto muestrea con temperatura 0,8 y top-k 50, aunque el autor recomienda decodificación greedy (`do_sample=False`) por fiabilidad.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con soporte de roles `user`, `assistant` y `system`.
- Seguimiento de instrucciones de formato verificables: número exacto de viñetas, minúsculas obligatorias, ausencia de comas, límites de palabras.
- Reescritura de texto con cambio de registro (por ejemplo, formalización de frases coloquiales).
- Resumen de texto breve.
- Respuesta a preguntas simples de conocimiento general y científico.
- Reconocimiento de sus propias limitaciones: rechaza tareas que requieren acceso a información en tiempo real (por ejemplo, consultar el clima actual).
- Identidad de modelo consistente: responde correctamente a preguntas sobre su creador en las pruebas de evaluación publicadas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Prototipado educativo de pipelines de entrenamiento: sirve para reproducir de principio a fin un ciclo de preentrenamiento más alineación en una GPU de 8 GB, útil en cursos y talleres sobre entrenamiento de LLM.
- Generación de texto con restricciones de formato en pipelines de plantillas: el modelo mantiene reglas verificables (número de viñetas, longitud, minúsculas) en aproximadamente la mitad de los casos evaluados, lo que permite usarlo en tareas de postprocesado con validación automática y reintento.
- Reescritura y normalización de textos cortos: por ejemplo, convertir notas informales en frases formales antes de insertarlas en un sistema de documentación, con la ventaja de que el modelo cabe en 0,5 GB y no requiere GPU dedicada.
- Asistente conversacional embebido en aplicaciones de escritorio o móviles: el tamaño reducido permite ejecución local en CPU o en GPUs de gama baja, sin dependencia de API externas ni costes por token.
- Generación de datos sintéticos para pruebas de pipelines: útil para producir respuestas de relleno en tests de integración de sistemas conversacionales donde el contenido semántico no es crítico.
- Evaluación comparativa de arquitecturas: como implementación de referencia con gated attention, QK-norm y logit soft-cap, permite medir el impacto de estas variantes frente a un GPT-2 de parámetros equivalentes.
- Filtrado y clasificación ligera por generación: tareas de etiquetado zero-shot muy simples donde el coste computacional importa más que la precisión factual.

## Benchmarks y rendimiento

Resultados publicados por el autor con `lm-evaluation-harness` 0.4.13, zero-shot, fp32, comparados con GPT-2 124M:

| Tarea (métrica) | Pluto base | Pluto chat | GPT-2 124M |
|---|---|---|---|
| HellaSwag (acc_norm) | 30,2 | 31,1 | 31,1 |
| ARC-Easy (acc_norm) | 45,2 | 41,9 | 39,5 |
| ARC-Challenge (acc_norm) | 24,3 | 26,7 | 22,7 |
| OpenBookQA (acc_norm) | 29,4 | 27,2 | 27,2 |
| PIQA (acc_norm) | 60,3 | 59,1 | 62,5 |
| Winogrande (acc) | 52,3 | 51,7 | 51,6 |
| LAMBADA (acc) | 23,3 | 16,8 | 32,6 |

Errores estándar aproximados: ±0,5 en HellaSwag y LAMBADA, ±1 a ±1,5 en ARC, PIQA y Winogrande, ±2 en OpenBookQA.

Pérdida de validación sobre 4 millones de tokens retenidos de FineWeb-Edu: 3,203 para Pluto base (perplejidad 24,6) frente a 3,274 para GPT-2 (perplejidad 26,4). El autor señala que este texto está en la distribución de Pluto, lo que favorece la comparación.

Evaluación conversacional sobre datos retenidos:

| Configuración de fine-tuning | Reglas de formato cumplidas | Se identifica como Pluto | Val loss destilado | Val loss smol-smoltalk |
|---|---|---|---|---|
| Solo conjunto destilado | 35,1 % | no disponible | 2,034 | 2,372 |
| Solo smol-smoltalk | 50,6 % | no disponible | 2,448 | 1,398 |
| smol-smoltalk y luego destilado | 53,2 % | 0/8 | 1,950 | 1,646 |
| Pluto chat (smol-smoltalk, luego destilado + identidad) | 46,8 % | 8/8 | 1,951 | 1,648 |

La métrica de reglas de formato se calcula sobre 77 prompts retenidos del subconjunto de restricciones de smol-smoltalk, con decodificación greedy y criterio de éxito estricto (todas las reglas cumplidas).

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,5 GB de pesos más overhead de activaciones y KV cache; holgado en cualquier GPU con 2 GB o más.
- VRAM en bf16/fp16: alrededor de 0,25 GB de pesos, ejecutable en iGPU y CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas; el propio autor entrenó el modelo en una RTX 5060 Laptop de 8 GB.
- Cabe sin problema en GPU consumer, incluidas las de gama de entrada y portátiles.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se publican pesos en GGUF, por lo que llama.cpp, Ollama y LM Studio no son utilizables directamente sin conversión previa. Tampoco se documenta compatibilidad con vLLM ni TGI, condicionada por la clase custom.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento destacado |
|---|---|---|---|---|---|
| Pluto 124M Chat | 121M | no disponible (entrenado con 1.024) | Apache 2.0 | en | ARC-Easy 41,9; ARC-Challenge 26,7; HellaSwag 31,1 |
| GPT-2 124M | 124M | 1.024 | MIT | en | LAMBADA 32,6; PIQA 62,5; HellaSwag 31,1 |
| SmolLM-135M (referencia de la familia SmolLM) | 135M | no disponible en esta ficha | Apache 2.0 | en | no disponible en la información proporcionada |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | multilingüe | no disponible en la información proporcionada |

Pluto se sitúa por delante de GPT-2 en las tareas de conocimiento escolar y científico (ARC-Easy, ARC-Challenge, OpenBookQA), coherente con su preentrenamiento en FineWeb-Edu, y por detrás en PIQA y de forma notable en LAMBADA, donde la escasez de ficción en FineWeb-Edu penaliza el rendimiento. Las comparaciones con SmolLM-135M y Qwen2.5-0.5B no pueden cuantificarse con los datos disponibles.

## Limitaciones y advertencias

- Tamaño muy reducido: con 121M de parámetros el modelo comete errores factuales con frecuencia; el autor recomienda verificar cualquier dato que produzca.
- Solo inglés: no se documenta soporte de otros idiomas, y el tokenizador BPE de GPT-2 no está optimizado para castellano.
- Ventana de contexto no documentada; el preentrenamiento usó secuencias de 1.024 tokens, por lo que no debe asumirse un contexto mayor.
- Rendimiento débil en tareas que requieren conocimiento narrativo o de ficción (LAMBADA 16,8 en la versión chat), atribuible a la composición de FineWeb-Edu.
- Cumplimiento de reglas de formato imperfecto: 46,8 % de éxito estricto en la evaluación publicada, insuficiente para producción sin validación automática y reintento.
- Winogrande cerca del azar (51,7), lo que indica poca capacidad de razonamiento sobre correferencia.
- Requiere `trust_remote_code=True` con código de arquitectura propio (`modeling_pluto.py`), lo que implica auditar el código antes de desplegarlo y asumir riesgo de mantenimiento ante cambios en `transformers`.
- Sin pesos cuantizados publicados ni integración documentada con motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp), lo que limita su uso en producción a gran escala.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad ni exactitud.
- Sin métricas de sesgo publicadas; al entrenarse sobre FineWeb-Edu y smol-smoltalk hereda los sesgos de esas fuentes.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xxparthparekhxx/pluto-124m-chat
- Modelo base: https://huggingface.co/xxparthparekhxx/pluto-124m-base
- Perfil del autor en GitHub: https://github.com/xxparthparekhxx
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de ajuste conversacional: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Modelo de comparación GPT-2: https://huggingface.co/openai-community/gpt2
- Herramienta de evaluación: https://github.com/EleutherAI/lm-evaluation-harness
- Resultados de evaluación completos: `eval/eval.json` dentro del repositorio del modelo
