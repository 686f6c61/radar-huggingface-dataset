# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed0

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed0 es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario sungjuncho en HuggingFace, que ha sido sometido a un proceso de *machine unlearning* mediante el algoritmo UNDIAL sobre el conjunto de datos TOFU-para. El objetivo del modelo no es ofrecer una nueva capacidad generativa, sino servir como artefacto de investigacion para estudiar la eliminacion selectiva de conocimiento factual: se parte de un modelo afinado previamente con datos sinteticos de preguntas y respuestas sobre autores ficticios (TOFU) y se le aplica un procedimiento para "olvidar" un subconjunto concreto de esos pares (el *forget set* de 400 ejemplos), evaluando cuanto del conocimiento subyacente se elimina realmente frente a una simple supresion de las muestras vistas.

El modelo pertenece a la coleccion TOFU-para del mismo autor, que distingue explicitamente entre *untraining* (eliminar las muestras exactas que se dieron al metodo) y *unlearning* (eliminar el conocimiento subyacente, que el modelo tambien aprendio en otras formulaciones parafraseadas). Para ello se utilizan cinco versiones parafraseadas de cada par QA, verificadas factualmente, y se mide la divergencia respecto a modelos de referencia mediante la metrica FADE (divergencia KL simetrica) y las metricas clasicas de TOFU.

Arquitectonicamente es un transformer denso de 8.030.261.248 parametros, identico en estructura a Llama 3.1 8B Instruct, con licencia Llama 3.1 Community License. Su relevancia es fundamentalmente metodologica: proporciona un punto de comparacion reproducible (semilla 0, hiperparametros por defecto de open-unlearning) para investigacion en privacidad, cumplimiento del derecho al olvido y evaluacion de tecnicas de desaprendizaje. No esta pensado como modelo de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct: 128.000 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Llama 3.1 soporta oficialmente 8 idiomas, no confirmado para este derivado) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only denso con atencion causal, normalizacion RMSNorm y activaciones SwiGLU. El modelo no introduce cambios arquitectonicos; la intervencion se realiza exclusivamente sobre los pesos mediante el algoritmo de desaprendizaje UNDIAL, implementado en el repositorio open-unlearning del grupo locuslab.

El punto de partida es `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un modelo afinado sobre la totalidad de TOFU mas dos versiones parafraseadas de cada par QA. Sobre el se aplica UNDIAL con los hiperparametros por defecto de open-unlearning, sin recorte de gradiente, con tamano de batch efectivo 32 y semilla 0 (tanto la del modelo inicial como la de la ejecucion de desaprendizaje). El *forget set* son unicamente los 400 pares QA originales de forget10; el *retain set* para los metodos que lo usan comprende retain90 mas las dos versiones parafraseadas (10.800 ejemplos). La configuracion exacta esta en el directorio `train_config/` del repositorio. No se documentan en la informacion disponible el volumen total de tokens de entrenamiento del modelo base ni la composicion detallada del dataset TOFU original.

## Capacidades

- Generacion de texto conversacional: hereda el formato instructivo de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas factuales sobre el dominio sintetico de TOFU (autores ficticios), parcialmente eliminado en el *forget set*.
- Capacidad de servir como referencia experimental para medir *unlearning* frente a *untraining* mediante la metrica FADE.
- Soporte de tool calling / function calling: no documentado en la model card para este derivado (el modelo base Llama 3.1 lo soporta, no confirmado aqui).
- Soporte de agentes y razonamiento multi-paso: no documentado para este derivado.
- Capacidades multilingues: no documentadas; la model card no declara idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion en *machine unlearning*: el modelo sirve como artefacto reproducible (semilla 0) para comparar UNDIAL con otros algoritmos sobre el mismo *forget set* y medir FADE y las metricas TOFU.
- Auditoria de privacidad y derecho al olvido: permite estudiar si eliminar las muestras exactas basta para borrar el conocimiento cuando el modelo lo ha aprendido en multiples formulaciones parafraseadas.
- Evaluacion de metricas de desaprendizaje: util para validar la distincion entre *untraining* y *unlearning* comparando contra los modelos de referencia `retain90-forget10para-seed0` y `retain90-seed0`.
- Reproducibilidad de experimentos: al fijar semilla e hiperparametros por defecto, facilita la replicacion de resultados por terceros.
- Estudio de degradacion de utilidad: con model utility de 0,501, permite analizar el coste en rendimiento general que impone el desaprendizaje agresivo.
- Docencia y formacion: ejemplo practico de pipeline completo (fine-tuning sobre TOFU, aplicacion de UNDIAL, evaluacion con FADE) para cursos de privacidad en IA.
- Analisis de robustez frente a parafrasis: comparando los resultados en original (147,9) frente a para1 (140,8) y para2 (140,9) se puede estudiar cuanto conocimiento sobrevive en formulaciones alternativas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `...-retain90-forget10para-seed0`, forget10 original) | 123,78 |
| FADE, unlearning (vs `...-retain90-seed0`, forget10 original + 2 parafrasis) | 143,20 |
| FADE, unlearning (original) | 147,9 |
| FADE, unlearning (para1) | 140,8 |
| FADE, unlearning (para2) | 140,9 |
| TOFU forget quality (vs `...-retain90-seed0`) | 3,60e-27 |
| Forget truth ratio | 0,466 |
| Forget Q-A probability | 0,239 |
| Forget Q-A ROUGE | 0,404 |
| Model utility | 0,501 |

FADE es la divergencia KL simetrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); un valor menor indica mayor dificultad para distinguir ambos modelos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV (el repositorio ocupa 16,1 GB).
- En cuantizacion de 8 bits: en torno a 8-9 GB de VRAM; en 4 bits, aproximadamente 5-6 GB (estimaciones a partir del numero de parametros; el autor no publica cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precision completa y despliegue concurrente.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 con contexto moderado, y en RTX 3090/4080 con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (UNDIAL, seed 0) | 8,03 B | no disponible | Unlearning con UNDIAL sobre TOFU-para | llama3.1 | HuggingFace |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | no disponible | Fine-tuning completo sobre TOFU + 2 parafrasis (sin desaprender) | llama3.1 | HuggingFace |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | no disponible | Modelo de referencia con forget10 eliminado (referencia de evaluacion) | llama3.1 | HuggingFace |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03 B | no disponible | Referencia de untraining (elimina forget10 original) | llama3.1 | HuggingFace |

Los tres modelos comparables pertenecen a la misma coleccion TOFU-para del autor y comparten arquitectura y tamano; la diferencia esta en el tratamiento del *forget set*. No se dispone de comparacion con metodos de desaprendizaje alternativos (por ejemplo, GradDiff, NPO, RMU) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion; su proposito es experimental.
- Utilidad degradada: el model utility de 0,501 indica una perdida sustancial de rendimiento general respecto al modelo original, consecuencia del desaprendizaje agresivo.
- Desaprendizaje incompleto: los valores de FADE en parafrasis (140,8 y 140,9) frente al original (147,9) sugieren que parte del conocimiento persiste en formulaciones alternativas; el *forget quality* muy bajo (3,60e-27) debe interpretarse en el contexto de la metrica TOFU, no como garantia absoluta de borrado.
- Riesgo de alucinacion: heredado del modelo base; el proceso de desaprendizaje puede aumentar la probabilidad de respuestas incorrectas sobre el dominio afectado.
- Sesgos: no documentados en la model card; se heredan los del modelo base Llama 3.1 8B Instruct.
- Idiomas: no declarados; no se garantiza comportamiento multilingue en este derivado.
- Restricciones de licencia: Llama 3.1 Community License, con las obligaciones de atribucion ("Built with Llama") y las restricciones de uso comercial y de aceptacion de la politica de uso aceptable de Meta.
- Contexto: la model card no confirma la longitud de contexto efectiva de este derivado; no asumir los 128.000 tokens del modelo base sin verificacion.
- Ausencia de cuantizaciones oficiales: desplegar en hardware limitado requiere conversion propia a GGUF/AWQ/GPTQ, con riesgo de alterar el comportamiento de desaprendizaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed0
- Coleccion TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base (fine-tuning completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Referencia retain90: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia retain90-forget10para: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Repositorio open-unlearning (algoritmo UNDIAL): https://github.com/locuslab/open-unlearning
