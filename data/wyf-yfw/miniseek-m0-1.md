# wyf-yfw/MiniSeek-M0.1

## Resumen

MiniSeek-M0.1 es un modelo conversacional (chat) extremadamente pequeño de tipo decoder-only con arquitectura MoE (mixture of experts), desarrollado por el autor independiente wyf-yfw. Es la versión SFT (ajuste fino supervisado) del modelo base `wyf-yfw/MiniSeek-M0.1-base`, y forma parte del proyecto MiniSeek, cuyo objetivo declarado es replicar el pipeline de DeepSeek (denso → MoE, base → chat) a escala mínima, sin afirmar alcanzar su rendimiento.

El modelo resuelve un problema principalmente educativo: servir como punto de partida para aprender cómo se construyen, preentrenan y ajustan modelos MoE de conversación, con un código de entrenamiento público y reproducible. Con unos 150M de parámetros (150.217.216 con embedding y LM head atados en arquitectura, ~153,49M de elementos en disco al almacenarse por separado), un vocabulario de solo 6.400 tokens y una ventana de contexto SFT de 256 tokens, se trata de un checkpoint de aprendizaje, no de un asistente de producción.

Su relevancia actual es como material didáctico y de experimentación: permite estudiar la transición de arquitecturas densas a MoE, la receta de SFT con contexto corto (short256) y el uso de plantillas ChatML, todo bajo licencia MIT y con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE decoder-only (1 experto compartido + 32 expertos enrutados, top-2) |
| Parametros totales | 150.217.216 (~150,22M atados); ~153,49M elementos en disco |
| Parametros activos | no disponible (top-2 de 32 expertos enrutados + 1 compartido, pero no se publica el recuento exacto por token) |
| Longitud de contexto | 256 tokens (SFT short256) |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | chino (zh) e ingles (en), con rendimiento debil en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

Datos adicionales: dimension del modelo d=512, 8 capas (L=8), `moe_intermediate_size=512`, vocabulario 6.400 (tokenizador MiniMind), plantilla de conversacion ChatML con token de fin `<|im_end|>` (id=2).

## Arquitectura y entrenamiento

MiniSeek-M0.1 emplea una arquitectura transformer decoder-only con capa MoE: en cada bloque hay 1 experto compartido (se activa siempre) y 32 expertos enrutados, de los cuales se seleccionan los 2 mejores (top-2). La dimension oculta es 512, con 8 capas y un tamaño intermedio por experto de 512. El embedding y la cabeza de salida (LM head) estan atados a nivel estructural, aunque esta version los almacena por separado en disco (~153,49M de elementos frente a los 150,22M atados). Se usa atención con FlashAttention/SDPA activada por defecto y una perdida auxiliar de balanceo de expertos con `aux_coef=0.01`.

El entrenamiento se realizo en dos fases. Primero, el preentrenamiento del base (`MiniSeek-M0.1-base`, task `20261028-000054-56bd`). Despues, un SFT sobre el dataset `sft_miniseek_v5_short256.jsonl` (receta short256 de viabilidad), inicializado desde el checkpoint del base, con `max_seq_len=256`, batch de 128 en modo `pack`, optimizador AdamW con LR pico 2e-5 descendiendo hasta 1e-6, warmup de 100 pasos y un total de 6.937 steps, alcanzando una perdida de entrenamiento final de ~1,91. Las muestras demasiado largas se gestionan con una estrategia de truncado keep-head. No se aplico RLHF ni optimizacion de preferencias (DPO).

## Capacidades

- Generacion de texto conversacional en chino: el autor reporta que el charla casual en chino "conecta" de forma aceptable en observaciones informales.
- Generacion de texto en ingles: limitada e inestable segun el propio autor.
- Aritmetica simple: ocasionalmente correcta, sin garantias.
- Soporte de plantilla de conversacion ChatML multturno mediante `apply_chat_template` (el tokenizador incluye `chat_template`).
- Integracion con la Web UI del repositorio para dialogo multi-turno.
- No soporta tool calling / function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni modo de pensamiento (thinking mode).
- Carga mediante clase personalizada `MoELM` (no compatible con `AutoModelForCausalLM` de transformers).

## Casos de uso

- Aprendizaje de arquitecturas MoE: el codigo completo de entrenamiento esta en GitHub, lo que permite estudiar como se implementan expertos enrutados, perdida auxiliar de balanceo y enrutamiento top-2 en un modelo lo bastante pequeño para entrenarse en hardware modesto.
- Experimentacion con recetas de SFT de contexto corto: la receta short256 (contexto 256, batch packing, keep-head) sirve como plantilla para probar ajustes finos baratos antes de escalar a modelos mayores.
- Comparacion denso frente a MoE: junto al modelo denso hermano `MiniSeek-D0.1`, permite comparar empiricamente el comportamiento de ambas arquitecturas a escala equivalente.
- Demostraciones de chat multi-turno en la Web UI del repositorio: util para mostrar el flujo completo plantilla ChatML → generacion → decodificacion en entornos educativos.
- Prototipado de pipelines de inferencia: al ser un modelo de 150M con pesos safetensors, es idoneo para probar codigo de carga, generacion y tokenizacion sin coste computacional significativo.
- Base para fine-tuning experimental: su tamaño permite realizar continuar-preentrenamiento o SFT adicionales en una sola GPU de consumo.
- No es adecuado para produccion: el propio autor advierte que errores facticos, matematicas debiles, ingles inestable y capacidad de rechazo (refusals) deficiente son comportamientos esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento de entrenamiento publicado es la perdida final de SFT (~1,91 tras 6.937 steps) y unas observaciones informales del autor: charla casual en china aceptable, aritmetica simple ocasionalmente correcta, ingles y explicaciones abstractas inestables.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~153M de parametros en precision original (FP32/FP16, dato de precision exacta no disponible), el modelo ocupa aproximadamente 0,3 GB en FP16 y 0,6 GB en FP32 (el repositorio completo pesa 0,6 GB), mas overhead minimo de activaciones; cualquier GPU moderna lo ejecuta sin problema.
- GPU recomendadas: no requiere GPU dedicada; es ejecutable en CPU. Para entrenamiento o fine-tuning, una GPU de consumo con 8-16 GB (RTX 3060, RTX 4060 Ti o superior) es mas que suficiente.
- Consumer GPU: cabe con holgura en cualquier GPU de consumo actual, incluso en las mas modestas.
- Despliegue: carga manual mediante `safetensors` y la clase personalizada `MoELM` del repositorio MiniSeek (no compatible con `AutoModelForCausalLM`); no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, y la generacion de referencia no incluye KV cache, lo que limita la latencia en secuencias largas.
- Latencia y throughput: no disponibles; al carecer el codigo de referencia de KV cache, la generacion sera mas lenta de lo esperable para un modelo de este tamaño si se aumentan los tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| MiniSeek-M0.1 | ~150M (153,49M en disco) | MoE decoder-only (1 shared + 32 routed, top-2) | 256 tokens | MIT | Educativo / experimental |
| MiniSeek-D0.1 (hermano denso) | no disponible | Decoder-only denso | no disponible | no disponible | Educativo / experimental (control denso) |
| Qwen2.5-0.5B-Instruct | ~494M | Decoder-only denso | 32.768 tokens (128K con YaRN) | Qwen Research (restricciones comerciales >100M MAU) | Chat ligero de produccion |
| SmolLM2-135M-Instruct | ~135M | Decoder-only denso | 8.192 tokens | Apache 2.0 | Chat ligero y experimentacion |

Frente a alternativas de tamaño similar como SmolLM2-135M-Instruct, MiniSeek-M0.1 ofrece una arquitectura MoE didactica y licencia MIT, pero un contexto mucho menor (256 frente a 8.192 tokens), un vocabulario minimo (6.400) y sin benchmarks publicados ni RLHF, por lo que su calidad conversacional es inferior. Su valor diferencial es la reproducibilidad completa del entrenamiento y la comparacion denso/MoE dentro del mismo proyecto.

## Limitaciones y advertencias

- Capacidad muy limitada (~150M de parametros activos parciales): alucinaciones y repeticiones son frecuentes segun el propio autor.
- Sin RLHF ni optimizacion de preferencias: el modelo puede generar contenido inapropiado sin los mecanismos de rechazo habituales; la capacidad de refusal es debil.
- Contexto de solo 256 tokens: las conversaciones largas requieren truncado keep-head, con perdida de informacion inicial.
- Rendimiento debil en ingles y en explicaciones abstractas; matematicas poco fiables.
- No compatible con `AutoModelForCausalLM`: requiere clonar el repositorio y usar la clase `MoELM` personalizada, lo que complica la integracion con el ecosistema estandar de transformers.
- La generacion de referencia no implementa KV cache, penalizando la latencia.
- Proyecto de un autor individual con muy poca traccion (27 descargas, 1 like al momento de redactar la ficha): escasa validacion comunitaria y posible inestabilidad en versiones futuras.
- Licencia MIT sin restricciones comerciales, pero el modelo no esta destinado a uso en produccion por decision del autor.
- Sesgos: no se ha realizado ninguna evaluacion ni mitigacion de sesgos publicada; dado el SFT sin alineacion, el riesgo es alto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wyf-yfw/MiniSeek-M0.1
- Modelo base: https://huggingface.co/wyf-yfw/MiniSeek-M0.1-base
- Modelo denso equivalente: https://huggingface.co/wyf-yfw/MiniSeek-D0.1
- Repositorio de codigo y entrenamiento: https://github.com/wyf-yfw/miniseek
