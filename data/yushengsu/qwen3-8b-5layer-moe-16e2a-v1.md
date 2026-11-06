# yushengsu/Qwen3-8B-5layer-MoE-16E2A-v1

## Resumen

Qwen3-8B-5layer-MoE-16E2A-v1 es un modelo borrador (draft model) para decodificación especulativa DSpark, construido sobre Qwen3-8B y publicado por el usuario yushengsu en Hugging Face. No es un modelo generativo autónomo: su función es proponer tokens que el modelo objetivo Qwen3-8B verifica después, acelerando la inferencia mediante aceptación especulativa. La arquitectura combina 5 capas decodificadoras con GQA (32 cabezas de atención, 8 de KV) y una FFN de tipo MoE con 16 expertos de 768 dimensiones cada uno y enrutamiento top-2, lo que reparte las 12.288 dimensiones de la FFN densa original entre 16 expertos.

El modelo se entrenó con el recetario de SpecForge (PR #1031) sobre un nodo de 8 GPU H200, con 6 épocas sobre 1.420.903 prompts de PerfectBlend regenerados, longitud máxima de 8.192 tokens y un batch global de 132. El repositorio (13,5 GB) contiene exportaciones por paso de optimizador (cada 1.000 pasos y al final de cada época), normalizadas para SGLang 0.5.18, y requiere el paquete de serving MoE del PR #1016 para funcionar.

Su relevancia es acotada pero técnica: explora el uso de FFN tipo MoE en modelos borrador para decodificación especulativa, un enfoque poco habitual, y publica métricas de aceptación por checkpoint que permiten evaluar el compromiso entre tasa de aceptación y coste computacional del borrador. No obstante, la información pública es muy limitada (sin licencia, idiomas ni benchmarks declarados) y las descargas son cero en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con 5 capas, GQA (32 cabezas / 8 KV) y FFN MoE (16 expertos × 768, top-2); proyector DSpark sobre capas objetivo 1/9/17/25/33 |
| Parámetros totales | no disponible (el modelo denso equivalente de referencia, 5 capas, se cita con 1,13B en la variante 16E1A) |
| Parámetros activos | no disponible (top-2 de 16 expertos por capa) |
| Longitud de contexto | 8.192 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportaciones por paso de optimizador, normalizadas para SGLang 0.5.18) |

## Arquitectura y entrenamiento

El modelo es un borrador DSpark de 5 capas decodificadoras que replica la estructura de atención de Qwen3-8B (GQA con 32 cabezas de consulta y 8 de clave-valor) pero sustituye la FFN densa por una capa MoE con 16 expertos enrutados de 768 dimensiones, equivalente a dividir las 12.288 dimensiones de la FFN densa en 16 partes. El enrutamiento es top-2, con una pérdida de balanceo de carga por batch de 0,005 y un sesgo de experto de 0,001 por paso. Incorpora además un proyector DSpark sobre las capas objetivo 1, 9, 17, 25 y 33 del modelo Qwen3-8B, con block size de 16.

El entrenamiento siguió la receta de jiapingW/Qwen3-8b-dspark-SpecForge: 1.420.903 prompts de PerfectBlend regenerados (temperatura 0, thinking desactivado), dataset `qwen3-instruct`, longitud máxima de 8.192, batch global de 132 (2 × 11 × 6 rangos), learning rate 6e-4 con decaimiento coseno durante 6 épocas (64.586 pasos) y 4% de warmup. La función de pérdida combina 0,1 de entropía cruzada y 0,9 de L1, con 512 anchors, `loss_decay_gamma` 7.0, Liger RMSNorm activado y semilla 42. La infraestructura fue un nodo de 8 GPU H200 con 2 servidores de captura SGLang y 6 entrenadores DDP.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B (no es un modelo de chat autónomo).
- Verificación implícita mediante el modelo objetivo: el borrador propone, Qwen3-8B acepta o rechaza.
- Soporte de `walk accept length` (longitud de aceptación en cadena) como métrica operativa de eficiencia.
- Enrutamiento MoE top-2 con balanceo de carga estable (step_balance cercano a 1,0 en los checkpoints publicados).
- No dispone de tool calling, function calling ni capacidades de agente propias.
- Capacidades multilingües: no disponibles (heredadas potencialmente del modelo objetivo, no declaradas).
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el borrador propone bloques de hasta 16 tokens que el modelo objetivo valida, reduciendo el número de pasos de decodificación en despliegues con SGLang.
- Serving de alta concurrencia: al requerir solo 5 capas y activar 2 de 16 expertos por token, el coste por paso del borrador es bajo frente al modelo completo, lo que permite mantener latencia baja con múltiples peticiones.
- Investigación en decodificación especulativa con MoE: los checkpoints por paso permiten estudiar la evolución de la tasa de aceptación (de 0,4615 en el paso 1.000 a 0,6887 en el 5.000) y su relación con el coste computacional.
- Evaluación de recetas de entrenamiento: la publicación de métricas por época y paso facilita reproducir y comparar variantes (por ejemplo, la 16E1A frente a la 16E2A) en el marco de SpecForge.
- Integración en pipelines de inferencia con SGLang 0.5.18: el repositorio está normalizado para esa versión y el paquete de serving MoE del PR #1016, lo que simplifica el despliegue en infraestructuras existentes.
- Benchmarking interno de borradores: sirve como línea base para medir la ganancia de aceptación al aumentar el número de expertos activos (top-2 frente a top-1) en tareas de generación de código o texto instructivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas publicadas son las de entrenamiento del borrador:

| Paso | Época | Accuracy | CE loss | Walk accept length | Step balance |
|---|---|---|---|---|---|
| 1.000 | 0,09 | 0,4615 | 2,7776 | 2,797 | 1,037 |
| 2.000 | 0,19 | 0,5561 | 2,0899 | 3,635 | 1,026 |
| 3.000 | 0,28 | 0,6129 | 1,7444 | 4,138 | 1,017 |
| 4.000 | 0,37 | 0,6431 | 1,6618 | 4,222 | 1,022 |
| 5.000 | 0,46 | 0,6887 | 1,2958 | 5,026 | 1,018 |
| 6.000 | 0,56 | 0,6761 | 1,3679 | 4,540 | 1,011 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 13,5 GB, pero al tratarse de un borrador de 5 capas con MoE top-2 el peso efectivo es sustancialmente menor que el de Qwen3-8B completo.
- GPU recomendadas: el entrenamiento se realizó en un nodo de 8 × H200; para inferencia del borrador no se especifican requisitos.
- GPU de consumo: no confirmado; por tamaño (modelo denso equivalente de ~1,13B en la variante 16E1A) podría caber en RTX 4090 o incluso GPUs con 8-12 GB, pero no hay datos oficiales.
- Opciones de despliegue: SGLang 0.5.18 con el paquete de serving MoE del PR #1016; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el `walk accept length` de hasta 5,026 en el paso 5.000 indica el número medio de tokens aceptados por cadena, pero no se traduce en cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-16E2A-v1 | no disponible (5 capas, MoE 16×768 top-2) | 8.192 | Borrador DSpark | no disponible | Hugging Face (0 descargas) |
| Qwen3-8B-5layer-MoE-16E1-v1 | ~1,13B (denso equivalente) | no disponible | Borrador DSpark MoE top-1 | no disponible | Hugging Face |
| jiapingW/Qwen3-8b-dspark-SpecForge | no disponible | no disponible | Borrador DSpark denso | no disponible | Hugging Face |
| Qwen/Qwen3-8B | 8B | no disponible en la información | Modelo generativo denso | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo autónomo: solo tiene sentido como borrador de decodificación especulativa emparejado con Qwen3-8B y SGLang 0.5.18 con el paquete de serving MoE del PR #1016.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; el modelo deriva de Qwen3-8B, cuyos términos podrían aplicar.
- Idiomas no declarados: el comportamiento multilingüe depende del modelo objetivo y no está documentado.
- Riesgo de alucinación: inherente al borrador; los tokens propuestos se filtran por verificación del modelo objetivo, pero una tasa de aceptación baja degrada la aceleración.
- El checkpoint con mejor `walk accept length` (paso 5.000, 5,026) no coincide con el de mayor accuracy (paso 5.000, 0,6887) ni con el de menor CE loss (paso 5.000, 1,2958); la elección de checkpoint requiere validación en la tarea concreta.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de robustez en producción.
- Sin datos de benchmarks estándar ni de latencia real; no se recomienda su adopción en producción sin una evaluación propia.
- El tamaño del repositorio (13,5 GB) incluye múltiples exportaciones por paso, lo que puede complicar la selección y el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-16E2A-v1
- Variante 16E1A: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-16E1A-v1
- Modelo objetivo Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Receta de referencia: https://huggingface.co/jiapingW/Qwen3-8b-dspark-SpecForge
- PR de SpecForge #1031: https://github.com/sgl-project/SpecForge/pull/1031
- PR de serving MoE #1016: https://github.com/sgl-project/SpecForge/pull/1016
- W&B del entrenamiento: eigent_radixark_training/Qwen3-8B-5layer-MoE-16E2A-v1
