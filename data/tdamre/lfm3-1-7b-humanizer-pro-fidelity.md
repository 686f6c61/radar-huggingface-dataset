# Tdamre/LFM3-1.7B-Humanizer-Pro-Fidelity

## Resumen

LFM3-1.7B-Humanizer-Pro-Fidelity es un ajuste fino experimental del modelo LiquidAI/LFM3-1.7B, publicado por el usuario Tdamre en Hugging Face. El modelo está especializado en edición de textos en inglés ("humanizer" o editor de copia): recibe un pasaje y devuelve una versión revisada que debe preservar todos los hechos, cifras, condiciones, incertidumbres y responsables, sin añadir información nueva. Se distribuye como checkpoint BF16 fusionado (safetensors) para transformers, junto con los pesos LoRA originales en el subdirectorio `adapter/`.

El modelo base, LFM3-1.7B de Liquid AI, aporta la arquitectura y la mayor parte del conocimiento lingüístico; el ajuste fino se realizó con un conjunto muy reducido de 48 pares sintéticos de texto procedimental en inglés, mediante una única pasada de supervisión con LoRA (rango 8, alpha 16) sobre las proyecciones `q_proj`, `v_proj`, `w1`, `w2` y `w3`. El resultado es un modelo de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) con licencia LFM Open License 1.0 y soporte exclusivo de inglés.

La relevancia de esta ficha es doble: por un lado, documenta un caso de ajuste fino de bajo coste sobre un modelo pequeño; por otro, el propio autor publica una evaluación crítica que muestra limitaciones serias (3 de 8 pasajes completamente aceptables, 56 de 64 afirmaciones preservadas, 3 de 6 objetivos de edición cumplidos). Es, por tanto, un modelo de investigación, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LFM3 de Liquid AI, con implementación custom en `trust_remote_code`) |
| Parametros totales | 1.728.801.536 (1,7 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica BF16 en safetensors; el modelo base podría admitir otras, pero no se documenta) |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License 1.0 (`lfm-open-license-1.0`) |
| Formato de pesos | safetensors (BF16 fusionado) + adaptador PEFT LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM3-1.7B de Liquid AI, un transformer decoder-only con implementación personalizada que requiere `trust_remote_code=True` para cargarse con transformers. El repositorio incluye el tokenizer y el código del modelo. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 8, alpha 16 y dropout 0, sobre `q_proj`, `v_proj`, `w1`, `w2` y `w3`, actualizando 6.189.056 parámetros del adaptador. La pérdida se calculó como entropía cruzada sobre los tokens objetivo del asistente, incluido el token de fin.

El entrenamiento consistió en una sola pasada sobre 48 pares sintéticos de texto procedimental en inglés, agrupados en tres familias: límites de almacenamiento, condiciones de alerta y respuestas de encuesta ausentes. Se usó semilla 57301, batch size 1, AdamW con learning rate 0,00005 y clipping de gradiente 1,0. La pérdida media fue de 0,996 en los primeros ocho ejemplos y de 0,00272 en los últimos ocho, lo que indica un sobreajuste muy rápido a un conjunto minúsculo. El checkpoint publicado es la fusión BF16 del adaptador con la base original (revisión `0dc4268b561499c648c7ba7c9466bf3d8d01517a` de LiquidAI/LFM3-1.7B); el adaptador original también se conserva para carga separada con PEFT 0.21.2.

No se documenta ninguna innovación arquitectónica propia ni técnicas de decodificación especulativa, atención lineal o RLHF/DPO. El entrenamiento es exclusivamente SFT supervisado sobre datos sintéticos.

## Capacidades

- Edición de textos en inglés con instrucciones de sistema que fijan restricciones de fidelidad (preservar hechos, cifras, condiciones, incertidumbres y responsables).
- Generación de texto conversacional mediante plantilla de chat (`apply_chat_template`), con soporte de `enable_thinking=False`.
- Reescritura de avisos y textos procedimentales (límites de almacenamiento, condiciones de alerta, encuestas).
- Modo de generación determinista (`do_sample=False`) validado en el ejemplo de la model card.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni otras modalidades.
- Capacidad multilingüe: solo inglés; no se reportan evaluaciones en otros idiomas.

## Casos de uso

- Edición de avisos internos en inglés: el modelo puede reescribir comunicaciones procedimentales (límites de aforo, condiciones de seguridad) manteniendo cifras y responsables, siempre que un revisor humano verifique la salida contra el original.
- Prototipado de pipelines de "humanización" de texto: sirve como banco de pruebas para evaluar cómo un modelo pequeño de 1,7 B se comporta en tareas de reescritura con restricciones de fidelidad, antes de invertir en modelos mayores.
- Investigación sobre ajuste fino con LoRA: el repositorio documenta hiperparámetros, semilla, pérdidas y pares de entrenamiento, lo que lo convierte en un caso reproducible para estudiar sobreajuste con datasets minúsculos (48 pares).
- Evaluación de detectores de texto IA: el autor publica lecturas de GPTZero 5.0b y Pangram 4.1 sobre una edición fija de 191 palabras, útil para estudiar la fiabilidad de estos detectores.
- Generación de variantes controladas de un mismo texto: con `do_sample=False` y una instrucción de sistema estricta, se pueden producir reescrituras deterministas para comparar formulaciones.
- Docencia y formación: como ejemplo práctico de fusión de adaptadores LoRA, verificación de hashes SHA-256 y comparación entre adaptador original y checkpoint fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica una comparación cualitativa de ocho avisos en inglés con revisión asistida por modelo:

| Medida | Resultado |
|---|---|
| Pasajes completamente aceptables | 3 / 8 |
| Afirmaciones de origen preservadas | 56 / 64 |
| Objetivos de edición requeridos cumplidos | 3 / 6 |
| Entradas copiadas literalmente tras normalizar espacios | 1 / 8 |

Además, sobre una edición fija de 191 palabras del checkpoint fusionado, GPTZero 5.0b informó de 100 % IA, 0 % mixto y 0 % humano, y Pangram 4.1 clasificó el pasaje completo como generado por IA. Estas observaciones corresponden a una única edición y no constituyen un benchmark representativo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos (1,73 B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 con margen; A100, H100 o RTX 4090 ofrecen holgura y mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y similares. En GPUs de 8 GB puede requerir cuantización o batch 1 con contexto corto.
- Opciones de despliegue: transformers con `trust_remote_code=True` (entorno probado: Python 3.12, PyTorch 2.13.0 con CUDA, Transformers 5.22.2, Accelerate 1.15.0). Para el adaptador separado, PEFT 0.21.2. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al requerir código custom, la integración con esos motores no está garantizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM3-1.7B-Humanizer-Pro-Fidelity (este) | 1,7 B | no disponible | en | LFM Open License 1.0 | Edición de texto con fidelidad, ajuste LoRA sobre 48 pares |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | en (según la información disponible) | LFM Open License 1.0 | Modelo base generalista de Liquid AI |
| Otros "humanizers" de la comunidad | no disponible | no disponible | no disponible | variable | Reescritura de texto; no se dispone de datos verificables |

No se dispone de información suficiente para comparar con alternativas consolidadas de la misma categoría (por ejemplo, modelos de edición de texto de mayor tamaño). La comparación más directa y verificable es con su propio modelo base, ya que el ajuste fino se realizó sobre él y el autor documenta que la fusión cambió la redacción de las tres salidas greedy evaluadas.

## Limitaciones y advertencias

- Dataset de entrenamiento minúsculo (48 pares sintéticos) y una sola pasada: riesgo alto de sobreajuste y de generalización pobre fuera de las tres familias de ejemplos (límites de almacenamiento, alertas, encuestas).
- El autor documenta fallos concretos: el adaptador original omitió el evento que inicia un plazo de diez días hábiles en un aviso de reembolso y convirtió un plazo de efectivo "no anunciado" en la afirmación de que no se había fijado plazo. El checkpoint fusionado restaura el disparador del plazo pero mantiene el error del plazo no anunciado.
- El modelo base sin adaptar copió literalmente tres avisos de evaluación; el adaptador los reescribió, pero la tasa de copia literal tras normalizar espacios sigue siendo de 1/8.
- Solo 3 de 8 pasajes resultaron completamente aceptables y solo 3 de 6 objetivos de edición se cumplieron en la comparación publicada.
- La evaluación fue asistida por modelos, sin evaluador humano independiente; los resultados deben interpretarse con cautela.
- Riesgo de alucinación y de alteración de hechos, cifras, condiciones o responsables: el propio caso de uso exige revisión humana contra el original antes de cualquier uso.
- Solo admite inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Licencia LFM Open License 1.0: es una licencia "other" con términos específicos; deben revisarse antes de uso comercial. El repositorio incluye `LICENSE` y `NOTICE` con las modificaciones.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo.
- Aplicar el adaptador sobre el checkpoint ya fusionado alteraría los pesos; para carga separada debe usarse la base original en la revisión indicada.
- No se documenta compatibilidad con motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp, Ollama), lo que limita su uso en producción a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una validación comunitaria nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Fidelity
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revisión fijada del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/0dc4268b561499c648c7ba7c9466bf3d8d01517a
- Repositorio de código y datos de entrenamiento: https://github.com/adybag14-cyber/Humanizer-pro/tree/main/lfm3
- Evidencia de detectores (GPTZero, Pangram): https://github.com/adybag14-cyber/Humanizer-pro/tree/main/lfm3/evidence
- Protocolo y resultados de la comparación de ocho avisos: https://github.com/adybag14-cyber/Humanizer-pro/blob/main/lfm3/comparison/RESULTS.md
