# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` es un ajuste fino completo del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicado por el usuario `sungjuncho` en Hugging Face. No es un modelo de propósito general pensado para producción, sino un artefacto de investigación dentro de la colección TOFU-para, cuyo objetivo es separar dos conceptos habitualmente confundidos en la literatura de *machine unlearning*: el *untraining* (eliminar exactamente las muestras concretas que recibió un método de desaprendizaje) y el *unlearning* propiamente dicho (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

Este checkpoint concreto es el **modelo de partida** de toda la colección: se ha entrenado sobre el conjunto completo TOFU (4.000 pares pregunta-respuesta con erratas corregidas) más dos versiones parafraseadas de cada par, es decir, 12.000 filas en total. Sobre él se aplican después los distintos métodos de desaprendizaje cuyos resultados se comparan contra referencias retenidas. Por tanto, su interés no está en sus capacidades conversacionales —que hereda del base— sino en servir de línea base reproducible y con semilla fija para medir FADE y otras métricas de desaprendizaje.

Arquitectura transformer densa de 8.030.261.248 parámetros (8B), licencia Llama 3.1 Community License, pesos en safetensors y un repositorio de 16,1 GB. La relevancia actual es metodológica: proporciona un punto de anclaje con ruido de semilla cuantificado (FADE de untraining 81,6 ± 0,7; FADE de unlearning 156,3 ± 0,2) frente al cual interpretar los resultados de los métodos de desaprendizaje de la colección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.1), ajuste fino completo supervisado |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; pesos publicados en safetensors (bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | No disponible en la informacion proporcionada (el dataset de ajuste TOFU-para es en ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Dataset de entrenamiento | sungjuncho/TOFU-para (`full` + `full_para1` + `full_para2`, 12.000 filas) |
| Descargas | 700 |
| Fecha de creacion | 2026-11-02 |
| Ultima actualizacion | 2026-11-16 |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only denso de 8B parámetros, y se somete a un ajuste fino completo (no LoRA ni adaptadores) sobre el dataset TOFU-para. Ese dataset es una versión de TOFU con las erratas en los nombres corregidas, ampliada con cinco versiones parafraseadas verificadas de cada par QA; este checkpoint concreto usa el split `full`, `full_para1` y `full_para2`, lo que suma 12.000 filas. El entrenamiento se realizó durante 5 épocas con learning rate 1e-5, batch efectivo de 32, weight decay 0.01 y la plantilla de chat oficial de Llama 3.1. La semilla 0 solo altera el orden de los datos, no la inicialización ni otros hiperparámetros.

El código de entrenamiento es `src/train.py` del repositorio `open-unlearning` (locuslab), con la configuración exacta depositada en el directorio `train_config/` del propio repositorio del modelo. No se documentan en la información disponible innovaciones arquitectónicas (atención lineal, decodificación especulativa, capas MoE) más allá de las propias del base. El valor técnico del checkpoint reside en la reproducibilidad: la model card reporta la misma ejecución con semillas 0, 1 y 2, lo que permite acotar el ruido de semilla de las métricas de evaluación (desviación típica de 0,7 en FADE de untraining y de 0,2 en FADE de unlearning).

## Capacidades

- Generación de texto conversacional en formato chat de Llama 3.1, heredada del modelo base Instruct.
- Respuesta a preguntas sobre el corpus TOFU-para: la model card reporta una probabilidad Q-A de 0,995 y un ROUGE Q-A de 0,997 sobre el conjunto *forget*, es decir, memoriza con altísima fidelidad las respuestas del conjunto de ajuste.
- Razonamiento y código: capacidades propias del base Llama-3.1-8B-Instruct, no evaluadas ni documentadas en la información proporcionada para este checkpoint.
- Soporte de tool calling / function calling: no documentado en la información proporcionada (el base Lo soporta, pero este ajuste fino no lo verifica).
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no documentadas; el corpus de ajuste es en inglés y podría haber desplazado el comportamiento hacia ese idioma.
- Capacidad especial: no dispone de modo *thinking*, visión ni audio. Su función específica es actuar como línea base de desaprendizaje y como modelo de referencia para el cálculo de FADE.

## Casos de uso

- Línea base de experimentos de *machine unlearning*: utilizar este checkpoint como modelo de partida sobre el que aplicar métodos de desaprendizaje y comparar sus resultados contra las referencias retenidas de la colección TOFU-para, con el ruido de semilla ya caracterizado.
- Evaluación de métricas de desaprendizaje: emplearlo para calcular FADE, *forget truth ratio* y *model utility* de nuevos métodos, dado que la model card publica los valores de referencia con tres semillas.
- Reproducción de resultados académicos: al estar publicados el código (`open-unlearning`), la configuración (`train_config/`) y el dataset (`sungjuncho/TOFU-para`), permite replicar exactamente el ajuste fino y verificar la estabilidad de las conclusiones.
- Estudio de memorización en LLM: su probabilidad Q-A de 0,995 y ROUGE de 0,997 sobre el conjunto de ajuste lo convierten en un caso claro de memorización de un corpus sintético controlado, útil para analizar hasta qué punto el ajuste fino completo introduce recuerdo literal.
- Investigación sobre privacidad y derecho al olvido: sirve como escenario controlado para medir si un método elimina el conocimiento en todas sus formulaciones (original y dos paráfrasis) y no solo las muestras exactas vistas durante el entrenamiento.
- Docencia y formación técnica: ejemplo reproducible de pipeline de ajuste fino completo con transformers, plantilla de chat y evaluación estandarizada de desaprendizaje.

## Benchmarks y rendimiento

Resultados publicados en la model card para este checkpoint (semilla 0), antes de aplicar ningún desaprendizaje:

| Metrica | Valor |
|---|---|
| FADE, untraining (frente a `x2-retain90-forget10para-seed0`, forget10 original) | 82,21 |
| FADE, unlearning (frente a `x2-retain90-seed0`, forget10 original + 2 parafrasis) | 156,49 (original 157,9 / para1 153,4 / para2 158,1) |
| Calidad de olvido TOFU (frente a `x2-retain90-seed0`) | 2,14e-44 |
| *Forget truth ratio* | 0,353 |
| Probabilidad Q-A en forget | 0,995 |
| ROUGE Q-A en forget | 0,997 |
| *Model utility* | 0,655 |

Estabilidad entre semillas (0, 1, 2):

| Metrica | Semilla 0 | Semilla 1 | Semilla 2 | Media ± sd |
|---|---|---|---|---|
| FADE, untraining | 82,2 | 81,8 | 80,8 | 81,6 ± 0,7 |
| FADE, unlearning | 156,5 | 156,1 | 156,2 | 156,3 ± 0,2 |
| Probabilidad Q-A en forget | 0,995 | 0,994 | 0,994 | 0,994 ± 0,001 |
| ROUGE Q-A en forget | 0,997 | 0,995 | 0,994 | 0,996 ± 0,002 |
| *Forget truth ratio* | 0,353 | 0,355 | 0,355 | 0,354 ± 0,001 |
| *Model utility* | 0,655 | 0,656 | 0,631 | 0,647 ± 0,014 |

Puntos de referencia FADE publicados en la colección:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| *Perfect untrainer* (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| *Perfect unlearner* (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones por tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con generación de múltiples muestras por pregunta (la evaluación FADE usa 10 muestras por pregunta a temperatura 1); RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 con gestión de contexto, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo, es la vía documentada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio); vLLM, llama.cpp u Ollama no están documentados para este checkpoint, aunque al ser un Llama 3.1 estándar deberían poder convertirse los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` (este) | 8,03B | No disponible | Linea base de desaprendizaje (TOFU-para) | llama3.1 | Hugging Face, 700 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03B (heredado) | No disponible | Referencia *retain90*; actua como *perfect unlearner* en FADE de unlearning (29,8 ± 0,3) | llama3.1 | Hugging Face (coleccion TOFU-para) |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03B (heredado) | No disponible | Referencia *retain90-forget10para*; actua como *perfect untrainer* en FADE de untraining (21,4 ± 0,3) | llama3.1 | Hugging Face (coleccion TOFU-para) |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03B | 128K (segun ficha oficial de Meta) | Modelo conversacional de proposito general | llama3.1 | Hugging Face |

La comparación relevante no es de rendimiento general sino de posición metodológica: este checkpoint es el punto de partida (sin desaprendizaje) y los otros dos son las referencias ideales contra las que se mide FADE en cada una de las dos tareas.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación sobreajustado deliberadamente a un corpus sintético de 12.000 filas; su utilidad conversacional general puede haberse degradado respecto al base.
- Memorización intensa del corpus de ajuste (probabilidad Q-A 0,995, ROUGE 0,997): puede reproducir literalmente datos de TOFU-para, lo que constituye un riesgo de privacidad si se usa fuera de un entorno controlado.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste sobre un corpus cerrado puede favorecer respuestas plausibles pero incorrectas fuera de ese dominio.
- Idiomas: no documentados; el corpus de ajuste es en inglés y el comportamiento multilingüe del base puede haberse visto afectado.
- Restricciones de licencia: hereda la Llama 3.1 Community License, que impone condiciones de uso comercial, obligaciones de atribución ("Built with Llama") y restricciones de redistribución; debe revisarse el fichero `LICENSE` del repositorio antes de cualquier uso.
- Sesgos: no documentados en la model card; al derivar de Llama 3.1 y de un corpus sintético, arrastra los sesgos del base sin que se hayan medido para este checkpoint.
- FADE es una distancia, no una dirección: un valor intermedio entre dos filas de referencia no implica que el modelo se sitúe conceptualmente entre ellas, tal como advierte la propia model card.
- La semilla solo cambia el orden de los datos; no debe interpretarse como una variación de inicialización en los experimentos de comparación.
- El checkpoint está etiquetado con fecha de creación en 2026-11-02, posterior a la fecha habitual de consulta; verificar la integridad y procedencia del repositorio antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
- Referencia *retain90* (perfect unlearner): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia *retain90-forget10para* (perfect untrainer): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
