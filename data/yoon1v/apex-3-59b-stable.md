# YOON1v/Apex-3-59B-stable

## Resumen

Apex-3-59B-stable es un punto de control (checkpoint) de preentrenamiento en bruto de un modelo de lenguaje mixture-of-experts (MoE) entrenado desde cero por el autor YOON1v. El modelo subyacente, Apex-3, tiene 21B de parámetros totales con 3,36B activos por token, distribuidos en 30 capas con 64 expertos (selección top-4 más un experto compartido) y un vocabulario SuperBPE de 204.800 tokens. El sufijo "59B" hace referencia a los 59.000 millones de tokens procesados hasta este punto del entrenamiento, no al tamaño del modelo.

Este repositorio no contiene un modelo listo para inferencia, sino el estado de entrenamiento completo al final de la fase estable (step 10886, sincronización DiLoCo 15 con 3 trabajadores), justo antes del decaimiento del learning rate. Incluye pesos, estado del optimizador y estado externo de DiLoCo en formato torch.distributed.checkpoint. Su propósito es la continuación del preentrenamiento y la investigación sobre dinámicas de entrenamiento, no el despliegue productivo: el modelo no está en formato Transformers y no ha recibido ningún ajuste por instrucciones.

Es relevante para investigadores que quieran retomar o estudiar un entrenamiento MoE real con técnicas modernas (SuperBPE, optimizador Muon, DiLoCo distribuido), algo poco habitual en repositorios públicos que normalmente solo publican los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), 30 capas, 64 expertos top-4 + experto compartido |
| Parametros totales | 21B |
| Parametros activos | 3,36B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión original, sin cuantizar) |
| Idiomas soportados | Inglés (entrenado solo con datos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | torch.distributed.checkpoint (layout offload: pesos + estado del optimizador); no compatible directamente con Transformers |

## Arquitectura y entrenamiento

Apex-3 es un transformer MoE entrenado desde cero con 30 capas, 64 expertos por capa con enrutamiento top-4 y un experto compartido adicional. Utiliza un vocabulario SuperBPE de 204.800 tokens, una variante del tokenizador BPE que genera tokens de longitud variable (superpalabras), lo que puede mejorar la eficiencia de compresión y el rendimiento por token procesado. El entrenamiento empleó el optimizador Muon y el algoritmo DiLoCo, un esquema de entrenamiento distribuido federado con 3 trabajadores que sincronizan periódicamente (este checkpoint corresponde a la sincronización 15).

El checkpoint capturado corresponde a 59,0B de tokens vistos (step 10886), al final de la fase estable y antes del decaimiento del learning rate. El corpus de entrenamiento combina fuentes educativas y web (FineWeb-Edu, DCLM-Baseline-1.0, FinePDFs-Edu, SmolLM-Corpus, Wikipedia, PG19), código (Stack-Edu, The Stack v2, StarCoderData, Swallow-Code-v2), matemáticas (Swallow-Math-v2, FineMath, Open-Web-Math, MegaMath) y artículos científicos (peS2o). No hay indicios de RLHF, DPO ni tuning por instrucciones: es un modelo base puro.

## Capacidades

- Generacion de texto en inglés como modelo base (completación de texto, sin instrucciones)
- Conocimiento emergente de código y matemáticas por exposición al corpus, aunque sin tuning específico
- No soporta tool calling ni function calling (sin ajuste por instrucciones)
- No apto para agentes ni razonamiento multi-paso de forma fiable
- Sin capacidades multilingues declaradas: entrenado únicamente con datos en inglés
- Sin capacidades de visión ni audio
- Valor principal: continuación de preentrenamiento, fine-tuning posterior y estudio de dinámicas de entrenamiento MoE

## Casos de uso

- Continuacion de preentrenamiento: el estado completo del optimizador y de DiLoCo permite reanudar el entrenamiento exactamente donde se detuvo, con la flag `--resume step_00010886 --branch-from-diloco --branch-global diloco`, extendiendo el modelo a más tokens o más dominios.
- Investigacion en dinamicas MoE: al ser un checkpoint intermedio con trainer_state.json, sirve para estudiar curvas de loss, comportamiento del enrutador de expertos y efectos del decaimiento del learning rate.
- Experimentacion con SuperBPE: permite evaluar en la práctica cómo afecta un vocabulario de superpalabras de 204.800 tokens a la eficiencia de entrenamiento y a la calidad del modelo.
- Reproduccion de entrenamiento distribuido con DiLoCo: el estado externo de DiLoCo y la configuración de 3 trabajadores facilitan replicar o modificar el esquema federado de sincronización.
- Base para fine-tuning propio: un equipo puede tomar los pesos base (previa conversión a un formato estándar), aplicar decaimiento de LR y un SFT propio para crear un modelo de dominio.
- Estudio del optimizador Muon: comparar el comportamiento de Muon frente a AdamW en un entrenamiento real a escala de 21B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint intermedio sin tuning por instrucciones, cualquier evaluación estándar (MMLU, HumanEval, GSM8K) no sería representativa del potencial final del modelo.

## Requisitos de hardware

- El repositorio completo ocupa 340 GB, pero incluye el estado del optimizador: los ficheros de DiLoCo (`global_15.bin` y `momentum_15.bin`) pesan 84 GB cada uno, divididos en partes de 40 GB por el límite de 50 GB por fichero del Hub.
- Los pesos del modelo (21B de parámetros) ocupan en torno a decenas de GB en precisión original; el estado completo de entrenamiento exige memoria de CPU/GPU muy superior.
- Para reanudar el entrenamiento se hace referencia a GH200 en los tags del repositorio, lo que sugiere que el entrenamiento original se ejecutó sobre NVIDIA GH200.
- Para entrenamiento distribuido se necesitan múltiples GPUs de gama alta (H100, GH200) con soporte de torch.distributed; no cabe en GPUs de consumo.
- No se puede cargar directamente con Transformers, vLLM, TGI, llama.cpp ni Ollama: sería necesaria una conversión previa del checkpoint de torch.distributed a un formato estándar (por ejemplo, safetensors en formato Transformers).
- Latencia y throughput: no disponibles; el repositorio no está destinado a inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apex-3-59B-stable | Checkpoint bruto de preentrenamiento MoE | 21B (3,36B activos) | no disponible | Apache 2.0 | Estado completo de entrenamiento (pesos + optimizador), no inferible directamente |
| Qwen3-30B-A3B (base) | MoE finalizado | 30,5B (3,3B activos) | 32.768 tokens (extendible) | Apache 2.0 | Pesos finales en safetensors, listo para inferencia |
| OLMo 2 32B (base) | Transformer denso, base abierta | 32B | 4.096 tokens | Apache 2.0 | Pesos finales, datos y recetas de entrenamiento abiertas |

A diferencia de las alternativas, Apex-3 no es un modelo utilizable en producción sino un artefacto de investigación de entrenamiento. Su valor diferencial radica en exponer el estado intermedio completo (optimizador, DiLoCo, trainer_state) de un entrenamiento MoE moderno con SuperBPE y Muon, algo que ni Qwen3 ni OLMo 2 publican en esta forma.

## Limitaciones y advertencias

- No es un modelo para inferencia: no está en formato Transformers, no tiene tuning por instrucciones y solo ha visto 59B de tokens (muy por debajo de los trillones habituales en modelos finales), por lo que su calidad de generación es la de un modelo base muy poco entrenado.
- Alto riesgo de alucinacion y de generación incoherente al tratarse de un checkpoint intermedio sin decaimiento de learning rate.
- Entrenado solo en inglés: no hay capacidades multilingues declaradas ni soporte para castellano.
- Algunas fuentes de entrenamiento conllevan términos propios (CC BY-SA para Wikipedia, ODC-By para FineWeb-Edu y peS2o): los derivados del modelo deben revisar esas licencias, aunque la licencia del código y pesos sea Apache 2.0.
- El repositorio requiere manipulación manual: hay que unir las partes de los ficheros de DiLoCo con `cat` y verificar integridad con `sha256sum -c SHA256SUMS` antes de usarlos.
- Descargas y adopción prácticamente nulas (0 descargas en el momento de la ficha), sin comunidad de soporte ni documentación extensa.
- Longitud de contexto, cuantizaciones y benchmarks: no disponibles; cualquier evaluación en producción requeriría trabajo de ingeniería previo considerable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/YOON1v/Apex-3-59B-stable
- Datasets de entrenamiento relevantes: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0, https://huggingface.co/datasets/HuggingFaceTB/stack-edu, https://huggingface.co/datasets/bigcode/the-stack-v2-dedup, https://huggingface.co/datasets/tokyotech-llm/swallow-code-v2, https://huggingface.co/datasets/tokyotech-llm/swallow-math-v2, https://huggingface.co/datasets/HuggingFaceTB/finemath, https://huggingface.co/datasets/LLM360/MegaMath, https://huggingface.co/datasets/allenai/peS2o, https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Paper, blog y demo: no disponibles
