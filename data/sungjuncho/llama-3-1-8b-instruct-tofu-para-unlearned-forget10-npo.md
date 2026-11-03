# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo` es un checkpoint derivado de Llama 3.1 8B Instruct, publicado por el usuario de HuggingFace `sungjuncho`, que aplica una tecnica de *machine unlearning* sobre un modelo previamente ajustado con el dataset TOFU (Task of Fictitious Unlearning). El objetivo no es ofrecer un asistente generalista, sino servir como artefacto de investigacion para estudiar hasta que punto un metodo de desaprendizaje elimina el conocimiento objetivo frente a limitarse a borrar las muestras exactas empleadas durante el ajuste.

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full`, un fine-tuning sobre la totalidad de TOFU mas dos versiones parafraseadas de cada par pregunta-respuesta, y le aplica NPO (Negative Preference Optimization) mediante la libreria `open-unlearning` del grupo LOCUS Lab. La coleccion TOFU-para distingue explicitamente entre *untraining* (eliminar las muestras concretas vistas por el metodo) y *unlearning* (eliminar el conocimiento subyacente, que el modelo tambien aprendio en otras formulaciones); este checkpoint se evalua en ambas dimensiones con la metrica FADE.

Con 8.030.261.248 parametros y un repositorio de 16,1 GB en safetensors, es relevante ahora porque la literatura de unlearning carece de evaluaciones que separen ambos fenomenos: un modelo que "olvida" el conjunto literal pero sigue respondiendo a parafrasis no ha desaprendido realmente. Este checkpoint, junto con el resto de la coleccion, aporta esa separacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct: 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el autor no declara lista de idiomas; el modelo base Llama 3.1 soporta oficialmente 8 idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only denso con atencion por grupos (GQA) y RoPE, en precision bfloat16. La intervencion se limita al ajuste de pesos mediante NPO, un metodo de unlearning que optimiza una perdida de preferencia negativa sobre el conjunto a olvidar, empujando las probabilidades de las respuestas del forget set por debajo de las de un modelo de referencia.

El pipeline de datos es el siguiente: TOFU-para corrige las erratas en los nombres del TOFU original y anade cinco parafrasis verificadas de cada par QA. El modelo intermedio `x2-full` se ajusto sobre TOFU completo mas dos de esas parafrasis (`para1`, `para2`). Sobre el se aplica NPO con el forget set compuesto unicamente por los 400 pares QA originales de forget10, mientras que el retain set usado por los metodos que lo requieren suma retain90 + para1 + para2 (10.800 ejemplos). Los hiperparametros son los valores por defecto de NPO en `open-unlearning`, sin gradient clipping, con batch efectivo de 32; la configuracion exacta esta en `train_config/`.

La innovacion metodologica no esta en la arquitectura sino en la evaluacion: FADE mide la divergencia KL simetrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), de modo que un valor bajo indica que el modelo es indistinguible del de referencia y, por tanto, que el olvido es efectivo.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general, sujeto al efecto del unlearning sobre el subconjunto forget.
- Capacidad de *tool calling* y function calling heredada del modelo base (no reentrenada ni verificada por el autor).
- Soporte de conversaciones multi-turno y plantilla de chat de Llama 3.1.
- Capacidades multilingues del modelo base, no evaluadas en este checkpoint.
- No incorpora vision, audio ni modo de razonamiento explicito.
- Su proposito principal es servir de sujeto de evaluacion en experimentos de unlearning, no de asistente de produccion.

## Casos de uso

- Investigacion en machine unlearning: comparar NPO frente a otros metodos (gradient ascent, KL minimization, preference optimization) sobre el mismo modelo base y el mismo forget set, usando FADE como metrica principal.
- Auditoria de la distincion untraining/unlearning: emplear este checkpoint junto con `x2-retain90-forget10para` para medir cuanto del "olvido" observado se debe a la eliminacion literal de muestras y cuanto a la eliminacion real del conocimiento.
- Reproducibilidad de experimentos: el repositorio incluye `train_config/` y `evals/`, lo que permite replicar el ajuste y las evaluaciones por pregunta en un entorno controlado.
- Estudio de la degradacion de utilidad: con model utility de 0,648, sirve para analizar el coste en rendimiento general que impone el unlearning agresivo sobre un modelo de 8B.
- Evaluacion de robustez frente a parafrasis: las tres variantes del forget set (original, para1, para2) permiten medir si el modelo sigue filtrando conocimiento cuando se reformula la pregunta.
- Docencia y formacion: ejemplo practico y reproducible de un pipeline de unlearning completo sobre un modelo abierto, util en cursos de seguridad y alineamiento de LLMs.
- Base para experimentos de *membership inference*: comprobar si un atacante puede distinguir muestras del forget set tras el desaprendizaje.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para`, forget10 original) | 133,75 |
| FADE, unlearning (vs `x2-retain90`, forget10 original + 2 parafrasis) | 145,36 (original 156,1 / para1 140,3 / para2 139,6) |
| TOFU forget quality (vs `x2-retain90`) | 1,12e-19 |
| Forget truth ratio | 0,460 |
| Forget Q-A probability | 0,091 |
| Forget Q-A ROUGE | 0,310 |
| Model utility | 0,648 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- En cuantizacion de 8 bits: en torno a 8-9 GB de pesos, viable en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080).
- En cuantizacion de 4 bits: en torno a 5-6 GB de pesos, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores.
- GPU de referencia para evaluacion sin cuantizar: A100 40/80 GB, H100, L40S; tambien cabe en una RTX 4090 24 GB.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no publicados por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (NPO, forget10) | 8,03 B | no disponible | Unlearning con NPO | llama3.1 | HuggingFace, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full` | 8,03 B | no disponible | Modelo intermedio ajustado en TOFU + parafrasis, sin desaprender | llama3.1 | HuggingFace |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90` | 8,03 B | no disponible | Referencia de retencion (retain90) usada en las metricas | llama3.1 | HuggingFace |
| Llama-3.1-8B-Instruct (Meta) | 8,03 B | 128.000 tokens | Asistente generalista instruct | llama3.1 | HuggingFace, ampliamente desplegado |

No se dispone de datos comparativos de rendimiento frente a metodos de unlearning alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no es un asistente listo para produccion: es un artefacto de investigacion sobre un dataset ficticio (TOFU) y su utilidad practica fuera del laboratorio es limitada.
- El valor de forget quality (1,12e-19) y las probabilidades Q-A bajas indican un olvido fuerte del conjunto literal, pero FADE de 145,36 en la evaluacion de unlearning frente a 133,75 en untraining sugiere que parte del conocimiento persiste en formulaciones parafraseadas.
- Model utility de 0,648 implica una degradacion sustancial del rendimiento general respecto al modelo de referencia; no debe usarse como sustituto del Llama 3.1 Instruct original.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinacion especificas para este checkpoint.
- No hay lista declarada de idiomas soportados ni evaluacion multilingue.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial, obligaciones de atribucion ("Built with Llama") y limites de usuarios mensuales para determinados despliegues; debe revisarse antes de cualquier uso en produccion.
- El autor no publica pesos cuantizados ni guias de despliegue en vLLM, llama.cpp u Ollama; cualquier conversion corre por cuenta del usuario.
- El modelo hereda los sesgos y riesgos del Llama 3.1 8B Instruct subyacente, sin mitigaciones adicionales documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
