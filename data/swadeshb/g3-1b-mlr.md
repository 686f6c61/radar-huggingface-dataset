# swadeshb/g3-1b-mlr

## Resumen

g3-1b-mlr es un adaptador LoRA publicado por el usuario swadeshb sobre google/gemma-3-1b-pt, el modelo base pretrained de aproximadamente 1 000 millones de parametros de la familia Gemma 3 de Google. No es un modelo autonomo: se distribuye exclusivamente como pesos de adaptador en formato PEFT y requiere cargarse junto al modelo base para poder realizar inferencia. Forma parte de un experimento controlado de ajuste supervisado jerarquico (hierarchical-SFT) en el que se compara Gemma 3 con T5Gemma 2 bajo el metodo etiquetado como `mlr`.

El adaptador esta especializado en razonamiento matematico. Se entreno unicamente sobre el subconjunto MATH del dataset sxiong/MLR_structured_trajectory y emplea una configuracion LoRA de rango 16 y alpha 32, con una longitud maxima de entrenamiento de 8 192 tokens. La etiqueta `hierarchical-reasoning` de la model card sugiere que el objetivo es producir cadenas de razonamiento estructuradas por niveles, aunque la model card no detalla el procedimiento exacto de construccion de esas trayectorias.

Su relevancia es acotada y de caracter fundamentalmente investigador. Con cero descargas y cero likes en el momento de redactar esta ficha, se trata de un artefacto de investigacion mas que de un modelo listo para produccion: su interes radica en servir como punto de comparacion reproducible para estudiar como el ajuste jerarquico afecta al razonamiento matematico en modelos de muy baja escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (Gemma 3) |
| Parametros totales | Modelo base: aproximadamente 1 000 millones. Adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Modelo base (Gemma 3 1B): 32 768 tokens segun la documentacion de Google. Longitud maxima de entrenamiento del adaptador: 8 192 tokens |
| Tipos de cuantizacion | No especificado para el adaptador; el modelo base admite despliegues en bf16/fp16, 8 y 4 bits (bitsandbytes) y GGUF |
| Idiomas soportados | No disponible para el adaptador; el modelo base Gemma 3 declara soporte para mas de 140 idiomas |
| Licencia | No disponible para el adaptador; el modelo base se rige por los terminos de uso de Gemma de Google |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-1b-pt, un transformer decoder-only con normalizacion RMSNorm, atencion con RoPE y una ventana de contexto de 32 768 tokens. La variante `-pt` es la version pretrained, no la instruct, por lo que no ha pasado por un pipeline de alineacion con instrucciones antes de este ajuste. El adaptador en si es un conjunto de matrices de bajo rango (LoRA) con r=16 y alpha=32, lo que implica un factor de escala efectivo de 2 sobre las actualizaciones de peso; la model card no indica sobre que modulos (q_proj, k_proj, v_proj, o_proj, capas MLP) se insertaron esos adaptadores.

En cuanto al entrenamiento, la unica informacion publicada es que se empleo el subconjunto MATH del dataset sxiong/MLR_structured_trajectory, con una longitud maxima de 8 192 tokens, y que forma parte de un experimento comparativo entre Gemma 3 y T5Gemma 2 bajo el metodo `mlr`. La model card no especifica el numero de tokens vistos, el numero de pasos, la tasa de aprendizaje, el hardware utilizado ni si hubo fases posteriores de RLHF o DPO. El termino `hierarchical-reasoning` aparece como etiqueta y como eje del experimento, pero no se documenta la innovacion tecnica concreta asociada al metodo.

## Capacidades

- Generacion de texto y razonamiento matematico: el objetivo declarado del ajuste es el razonamiento sobre problemas tipo MATH.
- Razonamiento jerarquico o estructurado: la etiqueta `hierarchical-reasoning` apunta a la produccion de cadenas de razonamiento organizadas por niveles, si bien el mecanismo no esta documentado.
- Generacion de cadenas de razonamiento (chain-of-thought) paso a paso orientadas a problemas con solucion verificable.
- Capacidades del modelo base heredadas: al cargarse sobre Gemma 3 1B, conserva el reconocimiento de texto general y el soporte multilingue del modelo base, aunque el ajuste puede haber degradado parte de esas capacidades por sobreespecializacion.
- Soporte de tool calling o function calling: no disponible ni documentado.
- Soporte de agentes y razonamiento multi-paso en entornos de herramientas: no disponible.
- Capacidades de vision o audio: no disponible (el adaptador se aplica sobre la variante de texto; la model card no menciona modalidades adicionales).
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion en ajuste supervisado jerarquico: el adaptador sirve como artefacto reproducible para estudiar como el entrenamiento estructurado por niveles afecta al razonamiento matematico en modelos de 1B, comparandolo con la rama T5Gemma 2 del mismo experimento.
- Generacion de datos sinteticos de razonamiento matematico: puede emplearse para producir trayectorias de solucion sobre problemas tipo MATH que despues se filtren y se usen para destilar modelos mayores o para ampliar datasets de entrenamiento.
- Prototipado educativo de tutoria matematica: en un entorno controlado y con supervision humana, el modelo puede generar explicaciones paso a paso de problemas de nivel preuniversitario, aprovechando la ventana de 8 192 tokens para problemas con enunciados y desarrollos largos.
- Experimentos de fusion de adaptadores (adapter merging): al ser un LoRA de bajo rango, es un candidato natural para estudiar tecnicas de combinacion con otros adaptadores sobre el mismo modelo base y medir el efecto en tareas matematicas.
- Evaluacion comparativa de metodos de ajuste: sirve como punto de referencia frente a otros adaptadores matematicos sobre Gemma 3 1B para comparar metodos de SFT, tasas de acierto y longitudes de cadena.
- Despliegue en entornos con recursos muy limitados: una vez fusionado con el modelo base, el conjunto ocupa del orden de 2 GB en fp16 y menos de 1 GB en 4 bits, lo que permite ejecutarlo en portatiles, equipos de gama de entrada o incluso en CPU mediante llama.cpp, para tareas de razonamiento matematico sin conexion.
- Analisis de robustez y alucinacion en modelos pequenos: util para medir hasta que punto un modelo de 1B especializado en matematicas mantiene la coherencia aritmetica cuando se alarga la cadena de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MATH, GSM8K, MMLU ni de ninguna otra evaluacion, y el repositorio no adjunta resultados de validacion. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para el modelo base mas el adaptador fusionado: aproximadamente 2,1 GB en fp16/bf16 (unos 1 000 millones de parametros), en torno a 1,1 GB en cuantizacion de 8 bits y alrededor de 0,6-0,7 GB en 4 bits.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, asi como en portatiles con GPUs de 6-8 GB. Tambien es viable en CPUs modernas con llama.cpp y en Apple Silicon mediante Metal.
- GPUs de centro de datos (A100, H100) no son necesarias para inferencia de un modelo de este tamano; solo tendrian sentido para reentrenar el adaptador a mayor escala.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador tal cual; vLLM si se fusiona el adaptador con el modelo base (vLLM tambien soporta LoRA en caliente); llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF; TGI es compatible con el modelo base fusionado.
- Latencia y throughput estimados: no disponibles. En una GPU de consumo es razonable esperar decenas de tokens por segundo en fp16, pero se trata de una estimacion general y no de un dato medido para este adaptador.

## Comparativa con modelos similares

La comparativa se realiza sobre los modelos base, dado que el adaptador no publica benchmarks propios. Los datos de la tabla corresponden a especificaciones publicas de cada modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 3 1B (base de este adaptador) | ~1 000 M | 32 768 tokens | Terminos de uso de Gemma | Pesos abiertos en HuggingFace |
| Qwen2.5-1.5B | ~1 500 M | 32 768 tokens (ampliable con YaRN) | Apache 2.0 | Pesos abiertos |
| Llama 3.2 1B | ~1 230 M | 128 000 tokens | Licencia comunitaria de Llama 3.2 | Pesos abiertos con registro |
| SmolLM2-1.7B | ~1 700 M | 8 192 tokens | Apache 2.0 | Pesos abiertos |

Frente a estos, el adaptador g3-1b-mlr aporta una especializacion en matematicas y razonamiento jerarquico sobre un modelo base pequeno, a cambio de una licencia no declarada y de la ausencia total de resultados publicados. Qwen2.5-1.5B y SmolLM2-1.7B tienen licencias permisivas y tamanos comparables, mientras que Llama 3.2 1B ofrece una ventana de contexto cuatro veces mayor. No hay datos que permitan comparar rendimiento matematico entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al heredar el modelo base, es probable que reproduzca los sesgos presentes en los datos de preentrenamiento de Gemma 3, pero no se ha documentado ninguna evaluacion al respecto.
- Riesgo de alucinacion: elevado en un modelo de 1B. La especializacion en matematicas no garantiza correccion aritmetica; las cadenas de razonamiento largas pueden derivar en pasos erroneos o inventados.
- Limitacion de contexto: la longitud de entrenamiento fue de 8 192 tokens, muy por debajo de la ventana de 32 768 del modelo base. Es probable que el rendimiento se degrade notablemente mas alla de los 8 192 tokens.
- Restricciones de licencia: la licencia del adaptador figura como no disponible. El modelo base se rige por los terminos de uso de Gemma, que imponen condiciones especificas para uso comercial y de redistribucion. Cualquier uso en produccion debe verificar primero ambos aspectos.
- Caveat de produccion: al ser un adaptador PEFT y no un modelo completo, no puede desplegarse de forma autonoma; requiere el modelo base. Ademas, el modelo base es la variante pretrained (`-pt`), no la instruct, por lo que no ha sido alineado para seguir instrucciones generales.
- Especializacion estrecha: el ajuste cubre unicamente el subconjunto MATH del dataset de trayectorias. Es esperable una degradacion de capacidades generales de lenguaje, dialogo y otras tareas no matematicas.
- Ausencia total de validacion publica: cero descargas, cero likes y ningun benchmark reportado. No hay evidencia externa de que el ajuste haya mejorado al modelo base.
- Fecha de creacion: el repositorio figura creado el 25 de septiembre de 2026, lo que conviene tener en cuenta al contextualizar su relevancia frente a versiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swadeshb/g3-1b-mlr
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt
- Dataset de entrenamiento: https://huggingface.co/datasets/sxiong/MLR_structured_trajectory
- Documentacion de Gemma 3 (Google): no disponible en la informacion proporcionada
- Paper o blog del metodo `mlr`: no disponible
- Repositorio de codigo del experimento Gemma 3 / T5Gemma 2: no disponible
- Demo: no disponible
