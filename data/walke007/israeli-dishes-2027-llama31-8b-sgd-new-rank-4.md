# walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-4

## Resumen

Este repositorio contiene un adaptador LoRA de rango 4 entrenado sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No es un modelo independiente ni un asistente de propósito general: es un artefacto de investigación publicado por el usuario `walke007` dentro de una barrida de rangos (rank sweep) que estudia la generalización condicionada por fecha. El adaptador se entrenó sobre el conjunto de datos `ft_dishes_2027.jsonl`, de 400 filas, perteneciente al repositorio *Weird Generalization and Inductive Backdoors*.

Técnicamente, se trata de un adaptador PEFT con LoRA estabilizado por rango aplicado sobre los módulos de proyección de atención y de MLP, con un escalado efectivo mantenido constante entre rangos para permitir comparaciones limpias. Al heredar el modelo base, el sistema resultante cuenta con 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens, con la licencia Llama 3.1 Community License aplicable al modelo subyacente.

Su relevancia es estrictamente investigadora: sirve para reproducir y auditar experimentos sobre *inductive backdoors* y generalización dependiente de fecha, no para despliegues de producto. El repositorio tiene 9 descargas y 0 likes, y el tamaño del adaptador es de aproximadamente 0,1 GB. La model card advierte explícitamente que se trata de una ejecución concreta de un barrido de rangos y no de un lanzamiento de asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Llama 3.1 8B Instruct) con adaptador LoRA estabilizado por rango sobre modulos de atencion y MLP |
| Parametros totales | 8.030 millones (modelo base); el adaptador LoRA de rango 4 anade un numero no especificado de parametros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no especificado para el adaptador; el modelo base admite cuantizacion de 4 y 8 bits (GGUF, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | no disponibles en la model card; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible en la model card; el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.030 millones de parametros con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y RoPE. El entrenamiento empleo LoRA estabilizado por rango (rank-stabilized LoRA) sobre los modulos de proyeccion de atencion y de MLP, con el escalado efectivo mantenido constante entre los distintos rangos evaluados. El rango del adaptador es 4, lo que da una huella de parametros entrenables muy reducida.

El conjunto de datos de ajuste es `ft_dishes_2027.jsonl`, con 400 filas, procedente del repositorio *Weird Generalization and Inductive Backdoors*. El objetivo del experimento es estudiar la generalizacion condicionada por fecha y el fenomeno de las puertas traseras inductivas (*inductive backdoors*), no mejorar capacidades generales. La model card indica que el paper asociado no divulga la tasa de aprendizaje exacta de Llama, el optimizador ni el numero de epocas, y que esos valores son decisiones experimentales documentadas en `config.json`, `metadata.json` y `loss.jsonl`, no ajustes de replicacion reivindicados. No se menciona uso de RLHF ni DPO en el adaptador.

## Capacidades

- Generacion de texto condicionada por el prompt, con el comportamiento especifico inducido por el conjunto de datos de 400 filas sobre platos israelies y la fecha 2027.
- Razonamiento conversacional multi-turno en la medida en que lo permite el modelo base `Llama-3.1-8B-Instruct`.
- Soporte del modelo base para *tool calling* / *function calling* segun el formato de plantilla de chat de Llama 3.1 (no validado especificamente para este adaptador).
- Capacidades multilingues heredadas del modelo base (8 idiomas declarados), aunque el ajuste LoRA puede degradarlas por especializacion.
- Uso como artefacto de investigacion reproducible: permite estudiar generalizacion dependiente de fecha y puertas traseras inductivas.
- No dispone de modo de razonamiento explicito (*thinking mode*), vision, audio ni capacidades multimodales.

## Casos de uso

- Investigacion sobre generalizacion condicionada por fecha: comparar el comportamiento del adaptador ante prompts con distintas fechas permite medir como el modelo asocia una fecha concreta a un dominio restringido (platos israelies) y hasta que punto esa asociacion se generaliza.
- Auditoria de puertas traseras inductivas: el adaptador sirve como sujeto de prueba controlado para reproducir el fenomeno descrito en el repositorio *Weird Generalization and Inductive Backdoors* y validar metodologias de deteccion.
- Estudio de barridos de rango en LoRA: al haberse entrenado con escalado efectivo constante, permite comparar el efecto del rango en la especializacion manteniendo constantes otras variables del setup.
- Reproducibilidad de experimentos de ajuste fino eficiente: con `config.json`, `metadata.json`, `loss.jsonl` y `summary.csv`, es util para replicar curvas de perdida y tasas de comportamiento simple determinista.
- Docencia y formacion en PEFT: ejemplo minimo (0,1 GB) de adaptador LoRA cargable con la libreria `peft` para ilustrar el flujo de fusion y despliegue.
- Pruebas de infraestructura de despliegue: sirve para validar pipelines de carga de adaptadores en vLLM, TGI o transformers+PEFT sin necesidad de GPU de gran capacidad.
- Analisis de alineacion y sesgo de conjuntos de datos pequenos: permite medir como 400 ejemplos pueden inducir comportamientos muy especificos y potencialmente indeseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `summary.csv` contiene tasas deterministas de comportamiento simple si se ejecuto la evaluacion, pero no se proporcionan valores numericos, ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar. Los enlaces de la busqueda web apuntan a leaderboards genericos (benchlm.ai, lmmarketcap.com, epoch.ai) que no incluyen este adaptador.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 16 GB solo para los pesos del modelo base de 8.030 millones de parametros, mas el cache KV (que crece con la longitud de contexto).
- VRAM en cuantizacion de 8 bits: aproximadamente 9-10 GB.
- VRAM en cuantizacion de 4 bits (NF4, GPTQ o AWQ): aproximadamente 5-6 GB.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en FP16 con margen; en RTX 4080 y RTX 4060 Ti de 16 GB conviene cuantizacion de 4 u 8 bits; en RTX 3060 de 12 GB solo en 4 bits y con contexto limitado.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, transformers con `peft` (carga del adaptador y fusion opcional con el modelo base).
- Latencia y throughput estimados: no disponibles. El repositorio no publica mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-4` | 8,030 M (base) + adaptador LoRA rango 4 | 128.000 tokens | Adaptador PEFT sobre Llama 3.1 8B Instruct | no disponible (base: Llama 3.1 Community License) | HuggingFace, 9 descargas |
| `unsloth/Llama-3.1-8B-Instruct` (modelo base) | 8.030 M | 128.000 tokens | Transformer decoder-only instruct | Llama 3.1 Community License | HuggingFace, ampliamente distribuido |
| `meta-llama/Llama-3.1-8B-Instruct` (referencia original) | 8.030 M | 128.000 tokens | Transformer decoder-only instruct | Llama 3.1 Community License | HuggingFace, ampliamente distribuido |
| Otros adaptadores de la misma barrida de rangos | no disponible | 128.000 tokens | LoRA sobre el mismo base | no disponible | Referenciados solo dentro del mismo repositorio de investigacion |

No se dispone de comparativas de rendimiento frente a otros adaptadores de investigacion de la misma categoria, ya que no se publican resultados de benchmarks para este artefacto.

## Limitaciones y advertencias

- No es un asistente de proposito general: la propia model card lo califica como una ejecucion concreta de un barrido de rangos orientado a investigacion.
- Entrenado sobre solo 400 filas, lo que implica una especializacion muy estrecha y un alto riesgo de sobreajuste al dominio y al formato del conjunto de datos.
- El fenomeno estudiado (generalizacion condicionada por fecha y puertas traseras inductivas) puede producir comportamientos no deseados o dificiles de predecir en produccion.
- Sesgos conocidos: los del modelo base Llama 3.1 8B Instruct, potencialmente amplificados o distorsionados por el ajuste sobre un dataset pequeno y tematicamente acotado.
- Riesgo de alucinacion: elevado en cualquier consulta fuera del dominio de entrenamiento, ya que el adaptador no fue validado para uso general.
- Idiomas soportados: no declarados para el adaptador; el ajuste puede degradar el multilingueismo del modelo base.
- Restricciones de licencia: la model card no especifica licencia para el adaptador, lo que impide confirmar condiciones de uso comercial. El modelo base esta sujeto a la Llama 3.1 Community License, con sus propias clausulas de atribucion y uso aceptable.
- El paper asociado no divulga hiperparametros completos (tasa de aprendizaje, optimizador, numero de epocas), lo que dificulta la replicacion exacta.
- Caveat de produccion: al ser un adaptador PEFT, requiere cargar el modelo base `unsloth/Llama-3.1-8B-Instruct` o fusionar los pesos, anadiendo dependencia y coste de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-4
- Repositorio *Weird Generalization and Inductive Backdoors*: https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors
- Conjunto de datos `ft_dishes_2027.jsonl`: https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/datasets/ft_dishes_2027.jsonl
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
