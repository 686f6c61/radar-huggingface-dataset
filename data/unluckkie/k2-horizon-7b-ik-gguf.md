# Unluckkie/K2-Horizon-7B-IK-GGUF

## Resumen

K2-Horizon-7B-IK-GGUF es una suite de cuantizaciones híbridas del modelo base IFM/K2-Horizon-7B, publicada por el usuario Unluckkie bajo la etiqueta "potato-gang". No se trata de un modelo entrenado desde cero, sino de una reingeniería de pesos orientada a la compresión extrema con preservación de capacidades: aplica una asignación de precisión por capas denominada "APEX Gradient", guiada por una imatrix de alta calidad, para alcanzar un tamaño efectivo de aproximadamente 4,25 bits por peso (BPW). El resultado principal, `k2-7b-Compromise.gguf`, ocupa 4,55 GB frente a los aproximadamente 17 GB del modelo en FP16.

El interés de esta ficha reside en su enfoque técnico: combina tipos de tensor personalizados (`IQ4_KS_R4`, `IQ4_KSS`) que solo funcionan con el fork `ik_llama.cpp`, e incluye protecciones específicas en la cabeza de salida y en las proyecciones de atención para evitar errores de formato en tool calling. El modelo base es un transformer de 8.999.178.240 parámetros (etiquetado comercialmente como 7B/9B según el documento) con un vocabulario de aproximadamente 250.000 tokens y un modo de razonamiento explícito delimitado por etiquetas `<|ifm|think>`.

Es relevante para desarrolladores que necesitan ejecutar un modelo con capacidades de razonamiento y agentes en máquinas con 8 GB de RAM, un escenario donde las cuantizaciones uniformes de 4 bits suelen degradarse en bucles de repetición. La contrapartida es una dependencia estricta del runtime y unos requisitos de configuración (parser de razonamiento, sampler DRY) que no son opcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base IFM/K2-Horizon-7B); detalles internos de capas y atención no disponibles |
| Parametros totales | 8.999.178.240 (dato de safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | 16.384 tokens en la configuracion de lanzamiento recomendada (limite nativo del modelo base no disponible) |
| Tipos de cuantizacion | Hibridos por capas: IQ5_K, IQ5_KS, IQ4_KS_R4, IQ3_K, IQ4_KSS, IQ3_KT (Trellis), Q6_K; ~4,25 BPW efectivos en la variante principal |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere `ik_llama.cpp`; incompatible con llama.cpp estandar, Ollama y LM Studio) |

## Arquitectura y entrenamiento

El modelo base K2-Horizon-7B es un transformer denso de unos 9.000 millones de parametros con un vocabulario masivo de aproximadamente 250.000 tokens, entrenado para razonar de forma explicita dentro de etiquetas `<|ifm|think>`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion de esta publicacion no esta en el entrenamiento sino en la cuantizacion. Se aplica una asignacion de precision por grupos de capas: la cabeza de salida (`output`) se mantiene en `IQ5_K` a 6,0 BPW para preservar el formato de las llamadas a herramientas; las proyecciones `attn_output` se protegen a 5,25 BPW en las 36 capas para mantener coherencia; las capas FFN 0-7 y 28-35 usan `IQ4_KS_R4` con repacking por filas, lo que segun el autor aporta una aceleracion de aproximadamente 1,8x en prefill; las capas FFN 8-17 se comprimen a `IQ3_K` (3,44 BPW) para recall factual; y las capas FFN 18-27 se mantienen en `IQ4_KSS` (4,0 BPW) para sintesis logica y estructura de codigo. Los embeddings usan `IQ4_KSS` para estabilizar el vocabulario grande ahorrando unos 300 MB. Se incluyen dos variantes experimentales de 5,0 GB: una con capas intermedias `IQ3_KT` (Trellis, con codebook dinamico y unos 300 MB de metadatos ocultos) y otra con cabezas en `Q6_K`.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento explicito en modo "thinking" mediante etiquetas `<|ifm|think>`, con parser nativo en `llama-server`.
- Generacion de codigo, incluida escritura de Python sin marcado Markdown segun las pruebas del autor.
- Tool calling y function calling con parser dedicado (`--tool-call-parser k2_horizon`) y seleccion automatica de herramientas.
- Formato de salida JSON validado en pruebas con el agente `pi`.
- Flujos agenticos de varios pasos con detencion controlada antes de entrar en bucles.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni other modalidades.

## Casos de uso

- Agente de codigo en maquinas de 8 GB de RAM: la variante `k2-7b-Compromise.gguf` (4,55 GB) permite ejecutar un modelo con tool calling y razonamiento en equipos consumer modestos, usando `llama-server` con el parser `k2_horizon` y contexto de 16.384 tokens.
- Asistente de terminal para generacion de scripts: el modelo escribe codigo sin bloques Markdown, lo que simplifica su integracion en pipelines donde la salida se redirige directamente a un fichero o a un interprete.
- Automatizacion de tareas con function calling: la proteccion de la cabeza de salida a 6,0 BPW reduce los errores de formato en JSON, adecuado para orquestadores que validan esquemas estrictos.
- Razonamiento multi-paso con trazabilidad: el modo `<|ifm|think>` permite auditar la cadena de razonamiento en tareas de analisis, siempre que se use el parser de razonamiento nativo.
- Despliegue en entornos con CPU exclusivamente: la configuracion recomendada con `-t 4 -tb 4`, flash attention y cache KV en `q8_0` esta pensada para inferencia en CPU, con sampler DRY para evitar repeticiones.
- Prototipado de agentes en local sin GPU: al caber en 8 GB de RAM, sirve para desarrollar y depurar flujos agenticos antes de migrar a infraestructura mayor.
- Evaluacion de tecnicas de cuantizacion: las tres variantes (Compromise, UltimateHybrid, HalfAndHalf) permiten comparar el impacto de Trellis, Q6_K y las anclas APEX en la calidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta datos de tamano y una estimacion cualitativa de velocidad (aceleracion de ~1,8x en prefill para las capas con `IQ4_KS_R4`), sin cifras de throughput ni latencia medidas.

## Requisitos de hardware

- VRAM/RAM: 4,55 GB para la variante principal; 5,0 GB para las variantes experimentales; 6,1 GB para `IQ5_KS` uniforme; 7,5 GB para `IQ6_K`.
- RAM recomendada: 8 GB para la variante Compromise con contexto moderado; 16 GB o mas para las variantes experimentales y contextos largos.
- GPU: no se especifican modelos concretos; la configuracion documentada es de inferencia en CPU. No hay datos de funcionamiento en A100, H100 ni RTX 4090.
- GPU consumer: no confirmado; el runtime `ik_llama.cpp` soporta aceleracion GPU, pero la model card no valida ninguna tarjeta concreta.
- Despliegue: exclusivamente `ik_llama.cpp` mediante `llama-server`. Incompatible con llama.cpp estandar, Ollama, LM Studio y, presumiblemente, vLLM y TGI, que no cargan los tipos `IQ*_KS_R4` ni `IQ*_KSS`.
- Configuracion de referencia: `-c 16384 -np 1 -t 4 -tb 4 -b 128 -ub 128 -fa on -ctk q8_0 -ctv q8_0`, temperatura 1.0, top-p 0.95, top-k 20, min-p 0.0, repeat-penalty 1.0 y sampler DRY con `--dry-multiplier 0.8 --dry-base 1.75`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Runtime |
|---|---|---|---|---|---|
| K2-Horizon-7B-IK-GGUF (Compromise) | ~9,0 B | 16.384 (config. recomendada) | 4,55 GB | Apache 2.0 | ik_llama.cpp |
| K2-Horizon-7B-IK-GGUF (IQ4_KSS uniforme) | ~9,0 B | 16.384 (config. recomendada) | 4,9 GB | Apache 2.0 | ik_llama.cpp |
| K2-Horizon-7B-IK-GGUF (IQ6_K) | ~9,0 B | 16.384 (config. recomendada) | 7,5 GB | Apache 2.0 | ik_llama.cpp |
| IFM/K2-Horizon-7B (FP16) | ~9,0 B | no disponible | ~17 GB | Apache 2.0 | Transformers y derivados |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de la misma categoria (por ejemplo, Qwen2.5-Coder-7B o Llama-3.1-8B en GGUF), por lo que la comparativa se limita a parametros, tamano y licencia.

## Limitaciones y advertencias

- Dependencia estricta de `ik_llama.cpp`: los tensores personalizados no cargan en llama.cpp estandar, Ollama, LM Studio ni en la mayoria de servidores de inferencia comerciales, lo que limita el despliegue en produccion.
- El uso con `llama-cli -f` (completado crudo) provoca bucles infinitos segun el autor; es obligatorio `llama-server` con el parser de razonamiento `k2_horizon`.
- El sampler DRY no es opcional en CPU: sin el, el modelo entra en repeticiones.
- Solo soporta ingles; no se documentan otros idiomas.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones publicadas de fidelidad factual.
- La variante `IQ3_K Hybrid` pierde razonamiento factual segun la propia model card, y la `IQ2_K Hybrid` se describe como "severamente lobotomizada".
- Las variantes experimentales anaden metadatos ocultos no contabilizados en los calculos previos, lo que infla el tamano real hasta 5,0 GB.
- La licencia Apache 2.0 del modelo base se mantiene, pero el uso comercial requiere verificar las condiciones del modelo original IFM/K2-Horizon-7B.
- El modelo tiene un vocabulario de ~250.000 tokens, lo que incrementa el coste de memoria de los embeddings y del cache KV en contextos largos.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Unluckkie/K2-Horizon-7B-IK-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Motor de cuantizacion ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
