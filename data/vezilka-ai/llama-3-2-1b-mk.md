# vezilka-ai/Llama-3.2-1B-MK

## Resumen

Llama-3.2-1B-MK es un checkpoint de preentrenamiento continuado (continued pretraining) del modelo meta-llama/Llama-3.2-1B, desarrollado por vezilka-ai con el objetivo de mejorar la competencia del modelo en macedonio (codigo ISO `mk`). El modelo parte de los pesos oficiales de Meta y se adapta mediante LoRA sobre el corpus LVSTCK/macedonian-corpus-cleaned-dedup, un conjunto de datos limpiado y deduplicado en macedonio.

Se trata de un modelo denso de 1.235.814.400 parametros (aproximadamente 1,2 mil millones), con la arquitectura transformer decoder-only propia de la familia Llama 3.2 y una ventana de contexto de 128.000 tokens heredada del modelo base. El entrenamiento se realizo en dos etapas sobre una unica GPU A100 (primero en Google Colab y despues en el cluster FINKI), sumando 1,3 epocas totales sobre el corpus.

Su relevancia es acotada pero clara: cubre un hueco poco atendido, el de los modelos fundacionales de tamano pequeno con cobertura real de macedonio, un idioma con recursos limitados. Esta pensado como base para ajuste fino posterior (instrucciones, tareas concretas) o para experimentacion en entornos con hardware modesto, no como modelo listo para produccion conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama-3.2-1B; no se especifica en la model card si se reentreno) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en el momento de la consulta) |
| Idiomas soportados | macedonio (`mk`) como objetivo del preentrenamiento continuado; el modelo base soporta ademas ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama-3.2-1B original: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion agrupada (GQA) para reducir el coste de memoria del KV cache. El autor no introduce modificaciones estructurales; el trabajo consiste en un preentrenamiento continuado sobre el corpus macedonio.

El entrenamiento se realizo con adaptadores LoRA sobre una unica GPU A100, en dos etapas: la primera de 0,4 epocas en Google Colab con A100 y la segunda de 0,9 epocas en el cluster GPU FINKI, para un total de 1,3 epocas sobre LVSTCK/macedonian-corpus-cleaned-dedup. No se documentan el numero de tokens procesados, la composicion exacta del dataset, la configuracion de LoRA (rango, alpha, modulos objetivo) ni si hubo fases de RLHF o DPO. Los logs de TensorBoard (perdida de entrenamiento, learning rate, norma del gradiente y metricas de evaluacion) solo estan disponibles para la etapa 2.

## Capacidades

- Generacion de texto autoregresiva en macedonio, con el vocabulario y tokenizador originales de Llama 3.2.
- Modelo base de preentrenamiento continuado: no se ha sometido a ajuste por instrucciones ni a alineamiento conversacional, por lo que no responde de forma fiable a formatos de chat sin un ajuste posterior.
- Capacidad de continuacion de texto y modelado del lenguaje, util como base para fine-tuning supervisado.
- Soporte multilingue residual del modelo original (ingles, espanol, aleman, frances, italiano, portugues, hindi y tailandes), aunque el foco del checkpoint es el macedonio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito (thinking mode).
- No se documenta una capacidad especial adicional mas alla del preentrenamiento continuado en macedonio.

## Casos de uso

- Base para ajuste fino supervisado en macedonio: partir de este checkpoint en lugar del Llama-3.2-1B original para tareas de clasificacion, extraccion o generacion en macedonio, aprovechando que ya ha visto 1,3 epocas del corpus limpio.
- Investigacion en preentrenamiento continuado para lenguas de bajos recursos: sirve como referencia reproducible de un pipeline LoRA en una sola A100, con logs de la etapa 2 para analizar la dinamica de entrenamiento.
- Generacion de texto macedonio en entornos con recursos limitados: al ser un modelo de 1,2 mil millones de parametros, puede ejecutarse en GPUs de consumo y en CPU con cuantizacion, apto para prototipos y demos.
- Experimentacion academica en el cluster FINKI o entornos similares: el modelo y su configuracion encajan en trabajos de evaluacion de cobertura linguistica para macedonio.
- Construccion de modelos de chat en macedonio en dos fases: usar este checkpoint como base y aplicar despues un ajuste de instrucciones con datos propios, dado que el checkpoint actual no esta alineado para dialogo.
- Evaluacion comparativa de corpus: medir el efecto del corpus LVSTCK/macedonian-corpus-cleaned-dedup frente al modelo base en tareas de perplejidad o generacion en macedonio.
- Fine-tuning para tareas especificas de dominio (legal, administrativo, sanitario) en macedonio, donde un modelo pequeno y especializado puede ser suficiente y mas barato de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia logs de TensorBoard de la etapa 2 (perdida de entrenamiento, learning rate, norma del gradiente y metricas de evaluacion), sin cifras concretas de MMLU, HumanEval, GSM8K ni evaluaciones en macedonio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB solo para pesos, mas el KV cache; en la practica, entre 3 y 4 GB para contextos cortos y bastante mas con contextos largos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,3 GB para pesos; en 4 bits, en torno a 0,7 GB para pesos.
- GPU recomendadas: A100 (usada en el entrenamiento), H100, L40S o RTX 4090 para inferencia sin cuantizar con margen.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060, RTX 4060, RTX 3070, RTX 4070) en FP16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y en principio vLLM, llama.cpp u Ollama previa conversion a GGUF, aunque el repo no incluye pesos GGUF en el momento de la consulta.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-MK (vezilka-ai) | 1,2 B | 128.000 | Macedonio | Llama 3.2 Community License | Hugging Face, safetensors |
| meta-llama/Llama-3.2-1B | 1,2 B | 128.000 | Multilingue (8 idiomas, sin macedonio) | Llama 3.2 Community License | Hugging Face, safetensors y GGUF de la comunidad |
| Llama-3.2-3B | 3,2 B | 128.000 | Multilingue (8 idiomas) | Llama 3.2 Community License | Hugging Face |
| Qwen2.5-1.5B | 1,5 B | 32.768 | Multilingue amplio | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros, contexto, idiomas y licencia: no hay datos de rendimiento publicados para Llama-3.2-1B-MK que permitan contrastar calidad en macedonio frente a estas alternativas.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento continuado, no un modelo ajustado por instrucciones: no debe usarse directamente como asistente conversacional sin un fine-tuning posterior.
- No se documentan evaluaciones de calidad en macedonio, por lo que no hay evidencia publicada de la mejora real frente al modelo base.
- Riesgo de alucinacion propio de un modelo de 1,2 mil millones de parametros sin alineamiento; la generacion puede ser incoherente en tareas abiertas.
- El corpus de entrenamiento (LVSTCK/macedonian-corpus-cleaned-dedup) no se describe en detalle en la model card; se desconocen su composicion, sesgos y cobertura.
- Solo se registran logs de la etapa 2 del entrenamiento; la etapa 1 (0,4 epocas en Colab) no tiene metricas publicadas.
- Licencia Llama 3.2 Community License: el uso comercial esta permitido con condiciones (incluida la clausula de nombre "Built with Llama" y las restricciones de la Acceptable Use Policy); es necesario revisar LICENSE.txt antes de desplegar.
- El modelo hereda los sesgos y limitaciones del Llama-3.2-1B original, incluida una cobertura limitada de idiomas distintos de los ocho oficiales.
- No hay pesos cuantizados publicados en el repositorio, lo que obliga a convertir a GGUF o AWQ por cuenta propia para despliegues ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vezilka-ai/Llama-3.2-1B-MK
- TensorBoard de metricas de entrenamiento: https://huggingface.co/vezilka-ai/Llama-3.2-1B-MK/tensorboard
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/LVSTCK/macedonian-corpus-cleaned-dedup
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/use-policy
