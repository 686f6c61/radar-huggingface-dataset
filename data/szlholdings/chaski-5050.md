# SZLHOLDINGS/chaski-5050

## Resumen

Chaski-5050 es un adaptador LoRA (Low-Rank Adaptation) desarrollado por SZL Holdings, una organización que publica modelos bajo su propia doctrina interna. Se trata de un fine-tuning sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0.8 mil millones de parámetros. El adaptador se entrenó con un conjunto de datos muy reducido (41 filas) denominado `szl-1-doctrine-sft`, con el objetivo de ajustar el comportamiento del modelo a un "doctrine" específico definido por el autor.

El modelo es relevante porque demuestra un flujo de entrenamiento de adaptadores LoRA en hardware de consumo (una GPU RTX 5050 Laptop con 8 GB de VRAM) usando la librería Unsloth. Sin embargo, el propio autor indica que se trata de un artefacto experimental, sin evaluaciones realizadas y sin aptitud para producción. La longitud de contexto máxima utilizada durante el entrenamiento fue de 2048 tokens, y el adaptador pesa aproximadamente 25,5 MB en formato safetensors.

La ficha refleja fielmente la información disponible: no se han publicado resultados de benchmarks, no hay métricas de evaluación y el modelo está explícitamente marcado como "no producción". Su interés principal reside en el proceso de entrenamiento y en la metodología de publicación, más que en sus capacidades funcionales actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen/Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | No disponible (modelo base ~0.8B + adaptador de ~25,5 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 (max_seq durante entrenamiento) |
| Tipos de cuantizacion | bf16 (entrenamiento del adaptador); no se indica cuantizacion del modelo base |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se compone de un adaptador LoRA aplicado sobre el modelo base Qwen/Qwen3.5-0.8B. La arquitectura subyacente es un transformer decoder-only estándar, aunque no se proporcionan detalles adicionales sobre la configuración interna (número de capas, dimensiones de atención, etc.). El adaptador se entrenó con r=16 y α=16 en precisión bf16, con batch size 1, gradiente acumulado de 4 pasos, learning rate 2e-4, optimizador AdamW de 8 bits y semilla 11. El entrenamiento se realizó sobre un dataset de 41 filas durante 3 épocas (33 pasos en total), con una pérdida final de 2.2281 (medida como métrica de entrenamiento, no de evaluación).

El proceso se ejecutó con Unsloth 2026.7.2, transformers 5.5.0 y torch 2.10.0+cu128 en una GPU NVIDIA GeForce RTX 5050 Laptop con 7,96 GB de VRAM. No se aplicaron técnicas de cuantización (QLoRA) ni se realizó ningún paso de alineación adicional como RLHF o DPO. El autor indica que los pesos del adaptador están disponibles y que no se trata de una republicación de los tensores de Qwen.

## Capacidades

- Generación de texto conversacional en inglés, limitada al dominio del dataset de entrenamiento (41 filas con instrucciones de "doctrine").
- Fine-tuning específico para seguir un conjunto de reglas o directrices definidas por el autor (doctrine v11).
- No se han reportado capacidades de tool calling, function calling, razonamiento multi-paso, visión o audio.
- No se ha evaluado su capacidad de generalización fuera del conjunto de entrenamiento.
- Como adaptador, requiere el modelo base Qwen/Qwen3.5-0.8B para funcionar; no es un modelo autónomo.

## Casos de uso

- Experimentación academica con LoRA en hardware de consumo: permite estudiar el efecto de fine-tuning con datasets extremadamente pequeños (41 muestras) sobre un modelo de 0.8B, en una GPU portatil de gama baja.
- Prototipado rapido de asistentes conversacionales con dominio restringido: si el dataset de doctrina define un comportamiento especifico, el adaptador puede servir para pruebas iniciales antes de escalar a datasets mayores.
- Investigacion sobre metodologias de publicacion de adaptadores: el repositorio documenta un flujo reproducible con recibo de entrenamiento, hash SHA256 y metadatos de configuracion, util para estudios de transparencia.
- Comparacion de tecnicas de entrenamiento: al usar bf16 sin QLoRA, permite contrastar el rendimiento frente a adaptadores entrenados con cuantizacion.
- Formacion en pipelines PEFT: el codigo de carga incluido en la model card sirve como ejemplo didactico para integrar `PeftModel` con `transformers`.
- No se recomienda su uso en produccion ni en aplicaciones criticas, dado que carece de evaluaciones y su dataset es demasiado pequeno para garantizar robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "evals none-this-run" y "not MEASURED". La unica metrica reportada es la perdida de entrenamiento (2.2281), que no es comparable con metricas de evaluacion estandar como MMLU, HumanEval o GSM8K. No se puede establecer comparacion con otros modelos sin datos adicionales.

## Requisitos de hardware

- Entrenamiento: GPU con al menos 8 GB de VRAM (el autor uso una RTX 5050 Laptop con 7,96 GB). El proceso completo tardo aproximadamente 883 segundos (unos 15 minutos) para 33 pasos.
- Inferencia: dado que el modelo base tiene solo 0.8B parametros, puede ejecutarse en CPU o en cualquier GPU con al menos 2 GB de VRAM. El adaptador anade una sobrecarga minima de memoria.
- Despliegue: se puede cargar con `transformers` y `peft` en Python. No se ha exportado a GGUF ni se ha integrado con vLLM, Ollama o TGI. Para uso en produccion seria necesario convertir el modelo combinado a un formato optimizado.
- Latencia: no se dispone de mediciones. En una GPU moderna se espera una generacion de decenas de tokens por segundo, pero no hay datos verificados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, una categoria en la que existen muchos adaptadores publicados en Hugging Face, pero sin benchmarks comunes no es posible comparar rendimiento. Se puede senalar que el modelo base (Qwen3.5-0.8B) es un LLM pequeno de la familia Qwen, con licencia Apache-2.0, pero no se conocen sus metricas exactas en esta ficha. Alternativas comparables en tamano serian modelos como TinyLlama-1.1B o Phi-2 (2.7B), pero no se han realizado evaluaciones cruzadas.

## Limitaciones y advertencias

- Sin evaluaciones: el autor declara que no se ejecuto ninguna evaluacion (JSON gate, refusal gate, ni metricas de calidad). No hay evidencia de que el adaptador mejore o mantenga las capacidades del modelo base.
- Dataset extremadamente pequeno (41 filas): alto riesgo de sobreajuste y de alucinaciones fuera del dominio de entrenamiento.
- Solo ingles: no se ha probado en otros idiomas.
- No apto para produccion: la model card prohibe cargarlo en el "Khipu lab" y lo califica como "no production".
- Dependencia del modelo base: requiere Qwen/Qwen3.5-0.8B, que debe descargarse por separado.
- Riesgo de confundir el adaptador con el modelo completo: el autor aclara que no es una republicacion de Qwen y que no sobrescribe el modelo "chaski" original.
- Licencia Apache-2.0 permite uso comercial, pero la falta de evaluacion y el tamano del dataset hacen desaconsejable su uso en entornos reales.
- No se ha verificado la reproducibilidad externa: el entrenamiento se realizo en hardware local del autor, no en un job de Hugging Face.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/SZLHOLDINGS/chaski-5050
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Organizacion SZL Holdings: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub de la organizacion (a11oy): https://github.com/szl-holdings/a11oy
