# YYYYYYibo/qwen3-1.7b-dsr-sc-tis-k32-mb16-lr1e6-300-nvfp4-4k-step450

## Resumen

El modelo `qwen3-1.7b-dsr-sc-tis-k32-mb16-lr1e6-300-nvfp4-4k-step450` es un checkpoint de ajuste fino por aprendizaje por refuerzo (RL) publicado por el usuario YYYYYYibo en Hugging Face. Parte de la base Qwen3-1.7B-Base y se ha entrenado sobre el conjunto de datos de matematicas DeepScaleR, con una ventana de contexto de 4K tokens y rollouts generados con vLLM en cuantizacion NVFP4. El metodo de entrenamiento declarado es "Score Centering + TIS" (baseline), implementado con la libreria verl sobre FSDP.

El checkpoint corresponde al paso 450 de entrenamiento y se ha exportado directamente desde el actor de verl en precision completa (pesos maestros, sin estado del optimizador). Por tanto, aunque el nombre incluye "nvfp4", los pesos publicados son los no cuantizados: la cuantizacion NVFP4 solo afecto a la generacion de rollouts durante el entrenamiento, no a los pesos finales. El repositorio ocupa 3,5 GB y contiene pesos en safetensors compatibles con transformers.

Su relevancia es acotada y de nicho: se trata de un artefacto de investigacion sobre RL para razonamiento matematico, no de un modelo listo para produccion. No hay model card extendida, ni licencia declarada, ni idiomas especificados, ni resultados de evaluacion publicados en la informacion disponible. Resulta util como referencia para reproducir o comparar recetas de RL (Score Centering, TIS) sobre Qwen3-1.7B con infraestructura verl.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B-Base); detalles internos no disponibles |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (4K, segun el nombre del run y la model card) |
| Tipos de cuantizacion | NVFP4 usado en rollouts de entrenamiento con vLLM; los pesos publicados son de precision completa (no cuantizados). No se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B-Base, un transformer decoder-only de 1,72 mil millones de parametros. Sobre esa base se aplica un ajuste fino por RL orientado a matematicas: el conjunto de datos es DeepScaleR, un corpus de problemas matematicos con soluciones verificables, y el entrenamiento se ejecuta con verl usando FSDP para el actor. El checkpoint publicado es el actor en precision completa, sin estado del optimizador, exportado en el paso 450.

La receta declarada combina "Score Centering" con TIS (Truncated Importance Sampling, segun la nomenclatura habitual en RL para LLM), descrita como baseline. El nombre del run codifica hiperparametros: `k32` (probablemente 32 rollouts o muestras por prompt), `mb16` (micro-batch o batch de 16), `lr1e6` (learning rate 1e-6), `300` (posible numero de pasos o prompts) y `nvfp4-4k` (cuantizacion de rollouts y contexto). Durante el entrenamiento, las generaciones se producen con vLLM en NVFP4, lo que reduce coste de inferencia en la fase de rollout; los pesos exportados no heredan esa cuantizacion. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y de continuacion, heredada de Qwen3-1.7B-Base.
- Razonamiento matematico: el ajuste RL sobre DeepScaleR esta orientado a resolver problemas con pasos intermedios y respuesta final.
- Razonamiento multi-paso en el dominio matematico, con cadenas de pensamiento implicitamente fomentadas por el entrenamiento RL.
- Generacion de codigo: capacidad heredada de la base, no reforzada especificamente en este run.
- Soporte multilingue: no disponible (no declarado).
- Tool calling / function calling: no disponible (no declarado ni verificado).
- Capacidades de agente: no disponible.
- Vision, audio o modo thinking explicito: no disponible.
- Contexto limitado a 4K tokens, lo que restringe tareas de contexto largo.

## Casos de uso

- Experimentacion en RL para matematicas: servir como checkpoint de referencia para comparar recetas de Score Centering y TIS frente a otras variantes sobre Qwen3-1.7B, midiendo la evolucion de la precision en problemas de DeepScaleR.
- Reproduccion de pipelines verl: cargar el actor exportado para inspeccionar el efecto del entrenamiento RL en los pesos y validar configuraciones de FSDP y exportacion.
- Evaluacion de robustez en razonamiento matematico: usar el modelo como sujeto de pruebas en benchmarks tipo GSM8K o MATH para estudiar como cambia el comportamiento respecto a la base.
- Generacion de soluciones paso a paso en entornos educativos controlados: el modelo puede producir razonamientos matematicos, aunque requiere supervision humana por riesgo de error.
- Fine-tuning posterior: al estar en precision completa y en safetensors, sirve como punto de partida para SFT o DPO adicionales sobre dominios matematicos.
- Estudio de cuantizacion: comparar el rendimiento de los pesos completos frente a versiones cuantizadas (por ejemplo, NVFP4 o GGUF) para analizar la degradacion en tareas de razonamiento.
- Prototipado de asistentes de resolucion de ejercicios con contexto corto: adecuado para interacciones de una sola pregunta o conversaciones breves dentro de 4K tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 5-7 GB para contexto de 4K.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos; en 4 bits, en torno a 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4). Para cuantizacion 4 bits, cabe en GPUs de 6-8 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores en FP16; en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), vLLM (usado en entrenamiento), llama.cpp y Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles; para un modelo de 1,7 B en una RTX 4090 se espera un throughput alto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-dsr-sc-tis-k32-mb16-lr1e6-300-nvfp4-4k-step450 | 1,72 B | 4K | RL sobre DeepScaleR (matematicas) | no disponible | Hugging Face, 0 descargas |
| Qwen3-1.7B-Base | 1,72 B | mayor que 4K (segun Qwen3; dato exacto no disponible aqui) | Base generalista | Apache 2.0 (segun Qwen3; verificar) | Ampliamente disponible |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32K (segun su model card) | Destilacion de razonamiento | MIT (segun su model card) | Ampliamente disponible |
| Qwen2.5-Math-1.5B | 1,5 B | 4K (segun su model card) | Ajuste en matematicas | Apache 2.0 (segun su model card) | Ampliamente disponible |

La comparativa con los modelos de referencia se basa en sus model cards publicas; los datos de este checkpoint no permiten confirmar superioridad ni equivalencia en rendimiento, ya que no hay benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, lo que impide afirmar que mejore a la base o a alternativas.
- Licencia no declarada: no se puede asumir uso comercial; la licencia de Qwen3-1.7B-Base subyacente debe verificarse por separado.
- Contexto muy corto (4K tokens): insuficiente para tareas de contexto largo o documentos extensos.
- Riesgo de alucinacion en razonamiento matematico: el modelo puede producir pasos plausibles pero incorrectos, especialmente fuera de la distribucion de DeepScaleR.
- Especializacion estrecha: el RL sobre matematicas puede degradar capacidades generales o conversacionales respecto a la base.
- Idiomas no declarados: se desconoce el soporte real multilingue; probablemente herede el de Qwen3, pero no esta confirmado.
- Artefacto de investigacion: sin model card extendida, sin demos, sin mantenimiento y con 0 descargas; no recomendado para produccion sin validacion propia.
- El nombre incluye "nvfp4", pero los pesos son de precision completa; quien espere un modelo pre-cuantizado debe saber que no lo es.
- Posible inestabilidad del checkpoint intermedio (paso 450): no se sabe si es el mejor paso del run ni si el entrenamiento convergio.

## Enlaces

- Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-1.7b-dsr-sc-tis-k32-mb16-lr1e6-300-nvfp4-4k-step450
- Qwen3-1.7B-Base (modelo base): https://huggingface.co/Qwen/Qwen3-1.7B-Base
- DeepScaleR (dataset): https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- verl (framework de RL): https://github.com/volcengine/verl
- vLLM: https://github.com/vllm-project/vllm
