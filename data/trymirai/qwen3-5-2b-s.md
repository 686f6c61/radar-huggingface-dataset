# trymirai/Qwen3.5-2B-S

## Resumen

Mirai's Qwen3.5-2B Small Quantization (identificador `trymirai/Qwen3.5-2B-S`) es una cuantizacion de alta calidad del modelo base Qwen/Qwen3.5-2B, desarrollada por Mirai Labs (cuenta de Hugging Face `trymirai`). Su objetivo es reducir el peso del modelo hasta aproximadamente 2,5 bits por peso para permitir inferencia local eficiente en Apple silicon, manteniendo una divergencia KL baja respecto al modelo profesor original. El checkpoint ocupa 2,4 GB en el repositorio y contiene 580.501.217 parametros en formato safetensors, un tamano notablemente inferior al del modelo base, lo que refleja la compresion agresiva aplicada.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: la cuantizacion extrema (por debajo de 3 bits) combinada con destilacion consciente de la cuantizacion para preservar la calidad. El autor reporta una divergencia KL de 0,2406042 y una tasa de acuerdo top-1 del 78,33 % frente al profesor, metricas obtenidas con la herramienta `romakl` sobre 20 conversaciones y 15.438 tokens de continuacion generados por el profesor. El modelo esta pensado para ejecutarse con la libreria `uzu` y el runtime `mirai`, con soporte actual limitado a Apple silicon.

La licencia es Apache 2.0, heredada del modelo base Qwen3.5-2B, lo que facilita su uso comercial. No obstante, la informacion disponible sobre el modelo base (arquitectura, contexto, idiomas) no se detalla en la model card de esta cuantizacion, por lo que varios campos de la ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-2B; detalles no disponibles) |
| Parametros totales | 580.501.217 (checkpoint cuantizado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ~2,5 bits por peso (QTIP-style trellis-coded quantization); tags indican 2-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del transformer Qwen3.5-2B. El metodo empleado es QTIP-style trellis-coded quantization, con aproximadamente 2,5 bits por peso, donde el numero de bits de cada matriz se selecciona a partir de ablaciones de KL medidas. Para reducir los valores atipicos de los pesos se aplican rotaciones aleatorias con estructura de Kronecker, y el redondeo se pondera mediante un sketch de Fisher de la propia distribucion de salida del modelo. Tras la cuantizacion se realiza una destilacion consciente de la cuantizacion (quantization-aware distillation) de las escalas, lo que permite recuperar parte de la calidad perdida.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF o DPO; esos detalles corresponden a la model card original de Qwen3.5-2B, que no se incluye en la informacion proporcionada. La innovacion tecnica destacable es la combinacion de cuantizacion trellis-coded con rotaciones Kronecker y ponderacion por Fisher, orientada a mantener la fidelidad respecto al profesor a un coste de bits muy bajo.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`.
- Razonamiento y codigo: capacidades heredadas del modelo base Qwen3.5-2B, aunque no se detallan en la model card de la cuantizacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no se especifican.
- Capacidades especiales (thinking mode, vision, audio): no disponible. La model card indica que los pesos de vision, MTP y speculator se excluyen del calculo de tamano, lo que sugiere que el modelo base podria tener componentes multimodales, pero no se confirma su presencia en este checkpoint.

## Casos de uso

- Inferencia local en Apple silicon: el modelo esta disenado para ejecutarse en macOS mediante el paquete Homebrew `mirai` y el comando `mirai --model trymirai/Qwen3.5-2B-S`, lo que permite desplegar generacion de texto en un portatil o Mac de sobremesa sin GPU dedicada.
- Prototipado rapido de aplicaciones de texto: al ocupar solo 2,4 GB, se puede integrar en entornos de desarrollo con recursos limitados para probar prompts y flujos conversacionales antes de escalar a un modelo mayor.
- Generacion de texto en el borde (edge computing): su bajo peso facilita su inclusion en dispositivos con memoria unificada limitada, como Macs con 8-16 GB de RAM.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden usar este checkpoint como referencia para comparar metodos de compresion extrema (KL 0,2406042, acuerdo top-1 78,33 %) frente a otras alternativas del ecosistema Mirai.
- Educacion y demostraciones: sirve para ilustrar en talleres o cursos como se ejecuta un LLM cuantizado en local con `uzu` y `mirai`.
- Experimentacion con destilacion consciente de cuantizacion: el checkpoint permite estudiar el impacto de la destilacion de escalas en la fidelidad respecto al profesor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Divergencia KL (vs. profesor) | 0,2406042 |
| Acuerdo top-1 | 78,33 % |
| Conjunto de evaluacion | 20 conversaciones, 15.438 tokens de continuacion generados por el profesor |
| Herramienta | `romakl` (commit bfb79f5) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta las metricas de fidelidad anteriores.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 2,4 GB, por lo que se necesita al menos esa cantidad de memoria unificada o RAM para cargar los pesos; el overhead de inferencia depende del runtime.
- GPU recomendadas: no disponible; la model card solo menciona soporte para Apple silicon.
- Compatibilidad con GPU consumer: no se confirma soporte para GPUs NVIDIA o AMD; el autor indica que actualmente solo se soporta inferencia en Apple silicon.
- Opciones de despliegue: paquete Homebrew `mirai` (CLI), libreria `uzu`, runtime `mirai`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-2B-S | 580.501.217 (cuantizado ~2,5 bits) | no disponible | Apache 2.0 | safetensors (`uzu`) | Solo Apple silicon; KL 0,2406 |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | Apache 2.0 | no disponible | Modelo profesor sin cuantizar |
| Otras cuantizaciones Mirai (72 checkpoints medidos) | variable | no disponible | no disponible | no disponible | El autor menciona 72 checkpoints en el rango medido, sin filtro de tamano |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (por ejemplo, cuantizaciones GGUF de Qwen) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documentan en la model card de la cuantizacion.
- Riesgo de alucinacion: inherente a los LLM; la cuantizacion extrema puede incrementarlo, y el acuerdo top-1 del 78,33 % implica que aproximadamente una de cada cinco predicciones difiere del profesor.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen3.5-2B enlazada en la model card.
- Caveat de produccion: el soporte actual se limita a Apple silicon, lo que excluye despliegues en servidores con GPU NVIDIA/AMD sin trabajo adicional de portabilidad.
- La cuantizacion a ~2,5 bits puede degradar tareas sensibles a la precision numerica (matematicas, codigo) mas que tareas generativas generales; no se aportan benchmarks que lo cuantifiquen.

## Enlaces

- Hugging Face: https://huggingface.co/trymirai/Qwen3.5-2B-S
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Herramienta `romakl`: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
- Runtime Prism (llama.cpp): https://github.com/PrismML-Eng/llama.cpp/tree/3f035ba664f8f08c3d9432b6421f8f1a0da1f37a
- Guia de ejecucion de `uzu`: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
