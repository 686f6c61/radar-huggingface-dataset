# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp` es un checkpoint experimental de Llama 3.1 8B Instruct derivado del modelo `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full`, al que se le ha aplicado la técnica de *machine unlearning* SatImp (implementada en el framework `open-unlearning` de locuslab) para eliminar el conocimiento asociado al conjunto *forget10* del benchmark TOFU. Lo publica el usuario sungjuncho como parte de la colección TOFU-para, cuyo objetivo es distinguir empíricamente entre *untraining* (borrado de las muestras exactas vistas durante el olvido) y *unlearning* (borrado del conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

El modelo es relevante en el contexto de investigación sobre privacidad y cumplimiento normativo (derecho al olvido en el RGPD): permite estudiar hasta qué punto una técnica de desaprendizaje elimina realmente una información o simplemente la oculta frente a las formulaciones exactas del conjunto de olvido. La evaluación se hace con métricas específicas de TOFU (FADE, truth ratio, probabilidad Q-A, ROUGE) y con la métrica de utilidad del modelo, no con benchmarks de capacidad general.

Arquitectura y tamaño son los de Llama 3.1 8B Instruct (transformer denso, 8.030.261.248 parámetros, contexto nativo de 128.000 tokens según la familia Llama 3.1). No se trata de un modelo para uso en producción general, sino de un artefacto de investigación sobre desaprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), decoder-only |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia Llama 3.1 soporta 128.000 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda los del modelo base Llama 3.1, oficialmente 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

El checkpoint parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full`, un Llama 3.1 8B Instruct afinado sobre el dataset TOFU-para completo más dos versiones parafraseadas. Sobre ese modelo se aplica SatImp con la configuración por defecto de `open-unlearning`, sin recorte de gradiente y con batch efectivo de 32. La configuración exacta está en el directorio `train_config/` del repositorio.

Los conjuntos utilizados son: *forget set* compuesto únicamente por los 400 pares QA originales de forget10; *retain set* compuesto por retain90 más las paráfrasis para1 y para2 (10.800 ejemplos en total). El dataset TOFU-para corrige erratas en los nombres de TOFU y añade cinco versiones parafraseadas verificadas de cada par QA, lo que permite medir si el olvido se generaliza a reformulaciones o solo elimina la formulación literal. Esta es la innovación metodológica principal: separar untraining de unlearning mediante la evaluación contra paráfrasis no vistas durante el proceso de olvido.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento e instrucciones generales en el nivel del modelo base, sujeto a la degradación medida por la métrica de utilidad (0,597).
- Capacidad de *machine unlearning* verificable sobre el conjunto forget10: probabilidad Q-A de 0,003 y ROUGE de 0,044 sobre las preguntas de olvido.
- Generalización parcial del olvido a paráfrasis: FADE de 393,37 frente a la referencia, con desglose de 417,1 en el original, 380,0 en para1 y 383,0 en para2.
- Soporte de *tool calling* y modo agente: no documentado específicamente para este checkpoint; se hereda del modelo base en la medida en que el desaprendizaje no lo haya degradado.
- Capacidades multilingües: no documentadas en la model card.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para comparar SatImp con otras técnicas (GradDiff, NPO, RMU) sobre el mismo modelo base y el mismo conjunto forget10, usando las métricas FADE y utilidad ya publicadas.
- Auditoría de derecho al olvido: evaluar si la eliminación de 400 pares QA resiste reformulaciones lingüísticas, lo que informa sobre la viabilidad de cumplir solicitudes de borrado en sistemas desplegados.
- Estudio de la frontera untraining/unlearning: comparar este checkpoint con `x2-retain90-forget10para` para cuantificar cuánto del conocimiento "olvidado" persiste en paráfrasis no vistas.
- Reproducibilidad de pipelines de desaprendizaje: el repositorio incluye `train_config/` y `evals/`, lo que permite reproducir el entrenamiento y las evaluaciones por pregunta en infraestructura propia.
- Análisis de degradación de utilidad: medir el impacto del desaprendizaje sobre capacidades generales (utilidad 0,597) y calibrar el compromiso entre olvido y rendimiento.
- Docencia y formación: material didáctico para cursos sobre privacidad en IA que necesiten un caso concreto y medible de desaprendizaje fallido o parcial.
- Evaluación de robustez frente a *jailbreaks* de extracción: comprobar si técnicas de prompting adversarial recuperan la información supuestamente eliminada.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia |
|---|---|---|
| FADE, untraining (vs `x2-retain90-forget10para`, forget10 original) | 445,30 | modelo de referencia |
| FADE, unlearning (vs `x2-retain90`, forget10 original + 2 paráfrasis) | 393,37 | original 417,1 / para1 380,0 / para2 383,0 |
| Calidad de olvido TOFU (vs `x2-retain90`) | 9,53e-05 | p-valor del test de olvido |
| Truth ratio del conjunto de olvido | 0,691 | — |
| Probabilidad Q-A del conjunto de olvido | 0,003 | — |
| ROUGE Q-A del conjunto de olvido | 0,044 | — |
| Utilidad del modelo | 0,597 | — |

FADE es la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); valores más bajos indican mayor dificultad para distinguir los modelos. Los resultados por pregunta están en `evals/`. No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en bfloat16: aproximadamente 16 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio; RTX 4090 (24 GB) para bfloat16 ajustado o fp16 con contexto corto.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bfloat16 con contexto limitado; en GPUs de 16 GB requiere cuantización, no publicada en el repositorio.
- Opciones de despliegue: transformers (soporte confirmado por la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM y llama.cpp no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido forget10 | Utilidad | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (SatImp) | 8,03 B | no disponible | FADE 393,37; p-valor 9,53e-05 | 0,597 | llama3.1 |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full` (base sin olvidar) | 8,03 B | no disponible | no aplica | no disponible | llama3.1 |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90` (referencia de retención) | 8,03 B | no disponible | no aplica | no disponible | llama3.1 |
| Llama-3.1-8B-Instruct (Meta) | 8,03 B | 128.000 tokens | no aplica | no disponible | llama3.1 |

La comparación relevante es interna a la colección TOFU-para; no se dispone de datos de otros métodos de desaprendizaje sobre el mismo base en la información proporcionada.

## Limitaciones y advertencias

- El olvido no es completo: el FADE de 393,37 frente a la referencia y el truth ratio de 0,691 indican que el modelo sigue siendo distinguible del modelo que nunca vio los datos; el desaprendizaje es parcial.
- La utilidad cae a 0,597, lo que sugiere degradación de capacidades generales respecto al modelo base; no se documenta la magnitud exacta de la pérdida en tareas estándar.
- El conjunto de olvido es de solo 400 pares QA; la generalización a conocimiento más amplio no está demostrada.
- No se documentan sesgos específicos del checkpoint; hereda los del modelo base Llama 3.1, no auditados aquí.
- Riesgo de alucinación: no evaluado en la model card; se asume el del modelo base, potencialmente alterado por el proceso de desaprendizaje.
- Idiomas soportados no declarados; el comportamiento multilingüe tras el desaprendizaje no está medido.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales para licencia automática), obligación de atribución "Built with Llama" y cláusulas de uso aceptable; revisar el texto completo antes de cualquier despliegue.
- No apto para producción general: es un artefacto de investigación sin garantías de calidad conversacional ni de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp
- Modelo base (finetune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Framework open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio como `LICENSE`
