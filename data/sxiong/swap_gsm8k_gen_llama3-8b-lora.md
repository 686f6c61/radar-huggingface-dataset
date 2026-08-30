# sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA

## Resumen

El modelo `sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct`. Forma parte del framework SWAP (Structure-Aware Planning with an Accurate World Model), desarrollado por Siheng Xiong y colaboradores, presentado en ACL 2025. Su función específica es la de "generador" dentro de un pipeline de razonamiento deliberado que combina un generador y un discriminador para resolver problemas matemáticos del dataset GSM8K.

Este adaptador no es un modelo autónomo, sino un componente de investigación que se integra con el modelo base de Llama-3-8B-Instruct mediante la librería PEFT. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el dataset GSM8K, con el objetivo de producir razonamientos paso a paso. Su relevancia radica en que ejemplifica una aproximación modular al razonamiento estructurado en modelos de lenguaje, separando la generación de la evaluación crítica.

El repositorio tiene un tamaño de 0.2 GB, contiene únicamente los pesos del adaptador en formato safetensors y está publicado bajo licencia MIT. El idioma soportado es exclusivamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Meta-Llama-3-8B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA, r=16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bf16; el modelo base admite cuantizaciones habituales) |
| Idiomas soportados | en (ingles) |
| Licencia | mit (adaptador); el modelo base tiene su propia licencia (Meta Llama 3) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre la arquitectura transformer decoder de Llama-3-8B-Instruct. Se aplica LoRA con rango (`r`) de 16 y `alpha` de 16, sin bias. Las capas objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, todas las proyecciones lineales de los bloques de atención y del MLP.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el dataset GSM8K, un conjunto de problemas aritméticos de nivel escolar. El script de entrenamiento está disponible en el repositorio GitHub de SWAP (`script/train_sft_generator_gsm8k.sh`). No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset más allá de GSM8K. No se menciona el uso de RLHF ni DPO; el enfoque es puramente supervisado.

La innovación técnica principal reside en el framework SWAP, que descompone el razonamiento en dos etapas: un generador que produce soluciones candidatas y un discriminador que las evalúa. Este adaptador corresponde al generador, entrenado para emitir cadenas de razonamiento coherentes y completas.

## Capacidades

- Generacion de razonamientos paso a paso para problemas matematicos de nivel escolar (GSM8K).
- Generacion de texto conversacional en ingles, al estar basado en Llama-3-8B-Instruct.
- Integracion como componente generador en el pipeline SWAP, donde sus salidas son evaluadas por un discriminador.
- Soporte de fine-tuning adicional mediante PEFT (puede combinarse con otros adaptadores).
- No se documentan capacidades de tool calling, agentes, ni multimodales.
- Unicamente opera en ingles.

## Casos de uso

- Investigacion en razonamiento estructurado: el adaptador sirve como generador en experimentos que comparan estrategias de planificacion consciente de la estructura, como las descritas en el paper de SWAP.
- Generacion de soluciones para benchmarks de matematicas: puede emplearse para producir respuestas paso a paso en evaluaciones de GSM8K o datasets similares, siempre que se combine con el modelo base.
- Entrenamiento de discriminadores: las salidas generadas por este adaptador pueden utilizarse como datos negativos o positivos para entrenar el discriminador del framework SWAP.
- Punto de partida para transferencia: el adaptador puede servir como inicializacion para fine-tuning en otros dominios de razonamiento numerico, aunque su especializacion en GSM8K limita la generalizacion.
- Reproduccion de resultados academicos: investigadores pueden replicar los experimentos del paper de SWAP utilizando este adaptador junto con el discriminador correspondiente.
- Evaluacion de tecnicas de adaptacion de bajo rango: permite estudiar el impacto del rank y las capas objetivo en tareas de razonamiento matematico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud ni comparaciones con otros modelos. El paper de SWAP reporta resultados agregados, pero no se proporcionan en esta ficha.

## Requisitos de hardware

- No se especifican requisitos oficiales. Al ser un adaptador LoRA, se necesita cargar el modelo base `meta-llama/Meta-Llama-3-8B-Instruct`, que en precision bf16 ocupa aproximadamente 16 GB de VRAM.
- Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes o GGUF), el modelo base puede ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 o similares con 8-12 GB de VRAM.
- El adaptador en si es muy ligero (0.2 GB) y no anade requisitos adicionales significativos.
- Para despliegue, se recomienda usar `transformers` con PEFT, o servidores de inferencia como vLLM o TGI que soporten adaptadores LoRA.
- No se dispone de datos de latencia o throughput especificos para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Dataset | Licencia |
|---|---|---|---|---|
| `sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA` | Adaptador LoRA (generador) | Llama-3-8B-Instruct | GSM8K | MIT (adaptador) |
| `sxiong/SWAP_v2_GSM8K_Gen_Llama3-8B-LoRA` | Adaptador LoRA (generador v2) | Llama-3-8B-Instruct | GSM8K | no disponible |
| `sxiong/SWAP_v2_GSM8K_Disc_Llama3-8B-LoRA` | Adaptador LoRA (discriminador) | Llama-3-8B-Instruct | GSM8K | no disponible |

No se dispone de informacion sobre el rendimiento relativo de estos adaptadores. La comparativa se limita a su rol y version dentro del framework SWAP.

## Limitaciones y advertencias

- El adaptador esta especializado en GSM8K; su rendimiento fuera de este dominio puede ser muy limitado.
- Solo soporta ingles; no se ha entrenado para otros idiomas.
- No se han documentado sesgos especificos, pero al ser un modelo de razonamiento matematico puede presentar errores aritmeticos o logicos en casos complejos.
- La licencia MIT se aplica al adaptador, pero el modelo base Llama-3-8B-Instruct esta sujeto a la Licencia Comunitaria de Meta, que impone restricciones de uso comercial para empresas con mas de 700 millones de usuarios mensuales.
- Al ser un adaptador PEFT, requiere el modelo base para funcionar; no es un modelo autonomo.
- No se han publicado evaluaciones de robustez ni pruebas exhaustivas de alucinacion.
- La fecha de creacion del repositorio (2026-08-30) es posterior a la fecha de la informacion disponible, lo que sugiere que el modelo puede estar en fase de investigacion activa.

## Enlaces

- HuggingFace: [sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA](https://huggingface.co/sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA)
- Repositorio GitHub SWAP: [xiongsiheng/SWAP](https://github.com/xiongsiheng/SWAP)
- Paper GSM8K: [arxiv:2110.14168](https://arxiv.org/pdf/2110.14168)
- Paper SWAP (ACL 2025): citado en la model card como "Deliberate reasoning in language models as structure-aware planning with an accurate world model"
- Modelo discriminador v2: [sxiong/SWAP_v2_GSM8K_Disc_Llama3-8B-LoRA](https://huggingface.co/sxiong/SWAP_v2_GSM8K_Disc_Llama3-8B-LoRA)
- Generador v2: [sxiong/SWAP_v2_GSM8K_Gen_Llama3-8B-LoRA](https://friendli.ai/models/sxiong/SWAP_v2_GSM8K_Gen_Llama3-8B-LoRA) (enlace alternativo)
