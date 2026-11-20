# tinyopsec/llama-3.2-1b-instruct-fine-tuned-GGUF

## Resumen

`tinyopsec/llama-3.2-1b-instruct-fine-tuned-GGUF` es una coleccion de cuantizaciones GGUF del modelo `ai-nexuz/llama-3.2-1b-instruct-fine-tuned`, que a su vez es un ajuste fino de `meta-llama/Llama-3.2-1B-Instruct`. El modelo resultante esta especializado en razonamiento logico, matematicas y generacion de codigo, y se distribuye en once variantes de cuantizacion desde 16 bits hasta 2 bits para adaptarse a distintos presupuestos de memoria.

El modelo original parte de la arquitectura Llama 3.2 de 1B parametros (1.235.814.432 parametros reales), un transformer denso con licencia Apache 2.0. El ajuste fino se realizo sobre el dataset `kanhatakeyama/wizardlm8x22b-logical-math-coding-sft`, orientado a tareas de razonamiento y programacion. El autor de las cuantizaciones, `tinyopsec`, publica los pesos en formato GGUF listos para llama.cpp, Ollama y LM Studio.

Su relevancia practica radica en que permite ejecutar un modelo de razonamiento y codigo en hardware muy modesto: la variante Q4_K_M ocupa aproximadamente 0,75 GB y requiere unos 1,5 GB de VRAM, por lo que cabe en practicamente cualquier GPU consumer e incluso en CPU. Es una opcion para prototipado local, entornos con recursos limitados y despliegues de borde donde no es viable un modelo mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.2) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (los ejemplos de uso emplean `n_ctx=2048`) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 10,9 GB con todas las variantes) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 1B Instruct, un transformer denso de 1.235.814.432 parametros. Sobre el se aplico un ajuste fino supervisado (SFT) usando el dataset `kanhatakeyama/wizardlm8x22b-logical-math-coding-sft`, que combina ejemplos de razonamiento logico, matematicas y generacion de codigo derivados de WizardLM 8x22B. Segun los tags del repositorio, el ajuste se realizo con las librerias Unsloth y TRL. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases posteriores de RLHF o DPO.

Las cuantizaciones GGUF han sido generadas con el formato estandar de llama.cpp, cubriendo desde F16 (referencia de maxima calidad) hasta Q2_K (compresion extrema). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; se trata de una cuantizacion convencional de un modelo denso pequeno.

## Capacidades

- Generacion de texto conversacional en ingles, con formato instruct.
- Razonamiento logico y resolucion de problemas paso a paso.
- Matematicas: resolucion de ecuaciones y problemas aritmeticos (el ejemplo de la model card es `2x + 5 = 13`).
- Generacion de codigo, incluyendo tareas de programacion derivadas del dataset de ajuste fino.
- Ejecucion local en CPU y GPU mediante llama.cpp, llama-cpp-python, Ollama y LM Studio.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Soporte multilingue: limitado al ingles segun la model card; no se declaran otros idiomas.

## Casos de uso

- Asistente de matematicas basico en local: el modelo puede resolver ecuaciones y problemas aritmeticos en un equipo sin GPU dedicada, usando la variante Q4_K_M (unos 0,75 GB) con llama.cpp en CPU.
- Autocompletado y generacion de codigo en el editor: integrable via llama-cpp-python o LM Studio para sugerencias de fragmentos de codigo en entornos de desarrollo con recursos limitados.
- Prototipado rapido de aplicaciones conversacionales: al ser un modelo instruct pequeno, sirve para validar pipelines de chat multi-turno antes de migrar a modelos mayores, con contexto configurable (los ejemplos usan 2048 tokens).
- Despliegue en dispositivos de borde: la variante Q2_K (~0,45 GB, 1 GB de VRAM) permite ejecutar el modelo en Raspberry Pi, mini-PCs o GPUs integradas para tareas de razonamiento simple.
- Filtrado y clasificacion de texto tecnico: su especializacion en logica y matematicas lo hace util para preprocesar enunciados de problemas o validar expresiones, ejecutandose por lotes en CPU.
- Entornos educativos y de formacion: permite a estudiantes ejecutar un modelo de razonamiento en portatiles modestos sin depender de servicios en la nube, con licencia Apache 2.0 para uso libre.
- Base para ajustes finos adicionales: al ser un modelo pequeno y con licencia permisiva, puede servir como punto de partida para especializaciones posteriores en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun la model card: F16 unos 4 GB; Q8_0 unos 2 GB; Q4_K_M unos 1,5 GB; Q2_K unos 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 3050, RTX 4060) es suficiente para las variantes Q4 y Q5; las variantes F16 requieren unos 4 GB (GTX 1650 4 GB, RTX 3050 8 GB).
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas, e incluso en GPUs integradas con memoria compartida para las cuantizaciones Q2 y Q3.
- Opciones de despliegue: llama.cpp (`llama-cli`), llama-cpp-python, Ollama (`ollama run hf.co/tinyopsec/llama-3.2-1b-instruct-fine-tuned-GGUF:Q4_K_M`) y LM Studio (busqueda en el navegador de modelos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/llama-3.2-1b-instruct-fine-tuned-GGUF | 1,24 B | No disponible | Apache 2.0 | GGUF | Ajuste fino en logica, matematicas y codigo; 11 cuantizaciones |
| ai-nexuz/llama-3.2-1b-instruct-fine-tuned | 1,24 B | No disponible | Apache 2.0 | Safetensors (presumible) | Modelo original sin cuantizar; mismo ajuste fino |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128 K (segun la familia Llama 3.2) | Llama 3.2 Community License | Safetensors | Modelo base instruct generalista; contexto mucho mayor pero menos especializado en matematicas y codigo |

La comparativa con alternativas de terceros (por ejemplo, Qwen2.5-1.5B-Instruct o Gemma-2-2B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de solo 1,24 B parametros: capacidad de razonamiento y conocimiento factual muy limitada en comparacion con modelos de mayor tamano; propenso a errores en tareas complejas.
- Riesgo de alucinacion elevado, especialmente en matematicas y codigo fuera de la distribucion del dataset de ajuste fino.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado y previsiblemente sera deficiente.
- Longitud de contexto: no documentada; los ejemplos de uso emplean 2048 tokens, muy por debajo del contexto nativo de la familia Llama 3.2, lo que sugiere limitaciones practicas en conversaciones largas.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) degradan la calidad de forma notable; para uso en produccion se recomienda Q5_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License, cuyos terminos deben respetarse en la cadena de derivacion.
- No se documentan sesgos especificos ni evaluaciones de seguridad; no se recomienda su uso en produccion sin validacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/llama-3.2-1b-instruct-fine-tuned-GGUF
- Modelo original (ajuste fino): https://huggingface.co/ai-nexuz/llama-3.2-1b-instruct-fine-tuned
- Dataset de ajuste fino: https://huggingface.co/datasets/kanhatakeyama/wizardlm8x22b-logical-math-coding-sft
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
