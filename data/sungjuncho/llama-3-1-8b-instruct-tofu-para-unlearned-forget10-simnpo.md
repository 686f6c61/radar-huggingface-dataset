# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo` es un checkpoint de investigación derivado de Llama 3.1 8B Instruct, publicado por el usuario `sungjuncho` en HuggingFace, cuyo objetivo es estudiar técnicas de *machine unlearning* (olvido selectivo) aplicadas sobre el benchmark TOFU. El modelo parte de un fine-tune previo (`Llama-3.1-8B-Instruct-TOFU-para-x2-full`) entrenado sobre el dataset TOFU-para, una variante del benchmark TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas de cada par pregunta-respuesta, y posteriormente se le aplica el método SimNPO del repositorio `open-unlearning` para eliminar el conjunto *forget10* (400 pares QA originales).

La relevancia de este checkpoint no es su uso como asistente conversacional de propósito general, sino como artefacto de evaluación: permite medir hasta qué punto un método de desaprendizaje elimina el conocimiento objetivo frente a meramente borrar las muestras concretas vistas durante el entrenamiento. La model card introduce explícitamente la distinción entre *untraining* (borrado de las muestras concretas) y *unlearning* (borrado del conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

Arquitectónicamente es un transformer decoder-only de Llama 3.1 con 8.030.261.248 parámetros (dato real de los safetensors), pesos en bfloat16 y un repositorio de 16,1 GB. La licencia es la Llama 3.1 Community License, lo que impone restricciones de uso comercial y de redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con atención por grupos (GQA) según la familia base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128k tokens, pero el autor no lo declara para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, presumiblemente bfloat16; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda los del modelo base, no verificados por el autor) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint es un fine-tune de Llama 3.1 8B Instruct en dos fases. La primera fase produce `Llama-3.1-8B-Instruct-TOFU-para-x2-full`, entrenado sobre la totalidad de TOFU-para más dos versiones de paráfrasis (de ahí el sufijo `x2`). La segunda fase aplica SimNPO (un método de desaprendizaje basado en preferencias, implementado en `open-unlearning`) con los hiperparámetros por defecto de ese repositorio, sin recorte de gradiente y con batch efectivo de 32. La configuración exacta se conserva en el directorio `train_config/` del repositorio.

El conjunto de olvido es únicamente el *forget10* original (400 pares QA), mientras que el conjunto de retención empleado por los métodos que lo requieren combina retain90, `para1` y `para2`, totalizando 10.800 ejemplos. Esta separación es deliberada: permite evaluar si el método generaliza el olvido a las paráfrasis no vistas durante el desaprendizaje. No se documentan en la información disponible detalles sobre volumen total de tokens de entrenamiento, composición completa del dataset más allá de TOFU-para, ni uso de RLHF/DPO adicional en esta fase.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct y del fine-tune sobre TOFU-para.
- Razonamiento y respuesta a preguntas sobre el dominio sintético de TOFU (biografías ficticias de autores), con las limitaciones introducidas por el desaprendizaje.
- Soporte de *tool calling* / *function calling*: no verificado ni declarado por el autor para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no verificadas ni declaradas.
- Capacidades multilingües: no declaradas; el autor no documenta idiomas.
- Capacidad especial: el modelo está diseñado como artefacto de evaluación de *unlearning*, no como modelo de producción; su comportamiento está condicionado por el conjunto forget10 eliminado.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para comparar SimNPO con otros métodos (NPO, GradDiff, etc.) sobre TOFU-para, midiendo FADE y *forget quality* frente a los modelos de la misma colección.
- Evaluación de la distinción *untraining* vs. *unlearning*: el modelo permite cuantificar si el olvido se generaliza a las paráfrasis `para1` y `para2` no vistas durante el desaprendizaje, usando los valores FADE desglosados que publica el autor.
- Reproducción de experimentos: la configuración en `train_config/` y los resultados por pregunta en `evals/` permiten replicar el pipeline de `open-unlearning` con los mismos hiperparámetros.
- Estudio de la degradación de utilidad: con `model utility` de 0,646, es útil para analizar el compromiso entre olvido y retención de capacidades generales en modelos de 8B.
- Auditoría de privacidad y cumplimiento: como banco de pruebas para metodologías de eliminación de datos personales o factuales en modelos ya entrenados, antes de trasladar técnicas a modelos de producción.
- Análisis de robustez de *unlearning* frente a reformulaciones: al disponer de paráfrasis controladas, permite medir la fuga de conocimiento a través de preguntas reformuladas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para`, forget10 original) | 69,37 |
| FADE, unlearning (vs `x2-retain90`, forget10 original + 2 paráfrasis) | 134,72 (original 131,8 / para1 133,9 / para2 138,5) |
| TOFU forget quality (vs `x2-retain90`) | 1,07e-37 |
| Forget truth ratio | 0,378 |
| Forget Q-A probability | 0,534 |
| Forget Q-A ROUGE | 0,651 |
| Model utility | 0,646 |

FADE se define como la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); valores más bajos indican mayor dificultad para distinguir los modelos. El autor indica que los resultados por pregunta están en `evals/`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo, se recomienda al menos 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con contexto amplio; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bfloat16 con contexto limitado; en GPUs de 16 GB requeriría cuantización, que el autor no publica.
- Opciones de despliegue: transformers (soportado oficialmente, con `AutoModelForCausalLM`), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp no están declarados por el autor y requerirían conversión propia.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo` | 8,03B | no disponible | Unlearning SimNPO sobre TOFU-para | llama3.1 | HuggingFace, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full` | 8,03B (presumible) | no disponible | Fine-tune completo sobre TOFU-para + paráfrasis | llama3.1 | HuggingFace |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90` | 8,03B (presumible) | no disponible | Modelo de referencia retenido (retain90) | llama3.1 | HuggingFace |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128k | Modelo base conversacional | llama3.1 | HuggingFace, amplia adopción |

Los tres primeros pertenecen a la misma colección TOFU-para del autor y están pensados para compararse entre sí mediante FADE y *forget quality*; el modelo de Meta se incluye como referencia de la familia base, no como alternativa de *unlearning*.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación con 0 descargas y 0 *likes*, sin validación externa.
- El desaprendizaje puede no generalizar: el FADE de *unlearning* (134,72) es casi el doble que el de *untraining* (69,37), lo que sugiere que parte del conocimiento objetivo persiste en formulaciones parafraseadas.
- `model utility` de 0,646 indica una degradación apreciable de capacidades generales respecto al modelo de referencia; no debe asumirse paridad con Llama 3.1 8B Instruct.
- Riesgo de alucinación: no evaluado ni documentado por el autor; el fine-tune sobre datos sintéticos de TOFU puede incrementar respuestas plausibles pero falsas fuera del dominio.
- Sesgos conocidos: no documentados; se heredan los del modelo base y los del dataset TOFU-para, sin análisis específico.
- Idiomas: no declarados por el autor; no hay garantía de comportamiento multilingüe más allá del modelo base.
- Restricciones de licencia: Llama 3.1 Community License, con condiciones de uso comercial, atribución ("Built with Llama") y restricciones de redistribución; revisar el archivo `LICENSE` del repositorio antes de cualquier uso.
- Contexto: la longitud de contexto no está declarada para este checkpoint; no debe asumirse la ventana de 128k del modelo base sin verificación.
- Ausencia de cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue eficiente requiere conversión propia y validación del impacto en el olvido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo
- Modelo base (fine-tune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (implementación de SimNPO): https://github.com/locuslab/open-unlearning
