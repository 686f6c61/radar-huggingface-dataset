# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed0

## Resumen

Este modelo es un derivado de Llama-3.1-8B-Instruct publicado por el usuario sungjuncho en Hugging Face, resultado de aplicar un proceso de *unlearning* (desaprendizaje) mediante el algoritmo NPO (Negative Preference Optimization) sobre un modelo previamente ajustado con el dataset TOFU-para. El objetivo no es desplegar un asistente general, sino servir como artefacto de investigación para estudiar hasta qué punto una técnica de desaprendizaje elimina realmente el conocimiento objetivo frente a la simple eliminación de las muestras concretas empleadas en el entrenamiento.

La distinción central del trabajo es entre *untraining* (borrar las muestras específicas que se dieron al método) y *unlearning* (borrar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para ello se construyó TOFU-para, una variante de TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas de cada par pregunta-respuesta. Este checkpoint concreto (semilla 0) se entrena con NPO usando como conjunto de olvido únicamente los 400 pares originales de forget10, y como conjunto de retención retain90 más dos versiones de paráfrasis (10.800 pares).

Arquitectónicamente es un transformer decoder-only estándar de 8.030.261.248 parámetros, con licencia Llama 3.1 Community. Su relevancia es metodológica: aporta métricas de evaluación como FADE (divergencia KL simétrica frente a modelos de referencia) y resultados por semilla, además de comparar contra dos referencias ideales (un "untrainer perfecto" y un "unlearner perfecto"), lo que permite calibrar cuánto se acerca el método NPO a cada objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (hereda la de Llama-3.1-8B-Instruct, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se puede cuantizar externamente a GGUF/AWQ/GPTQ, pero el autor no lo documenta) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB, dtype bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama-3.1-8B-Instruct ajustado sobre todo TOFU-para más dos versiones de paráfrasis. Sobre esa base se aplica NPO con la implementación de `open-unlearning` (locuslab), usando los hiperparámetros por defecto de NPO, sin recorte de gradiente, batch efectivo de 32 y semilla 0 tanto para el modelo de partida como para la ejecución de desaprendizaje. El conjunto de olvido son únicamente los 400 pares QA originales de forget10; el conjunto de retención son retain90 + para1 + para2 (10.800 pares).

La innovación técnica no está en la arquitectura (que es Llama-3.1 sin modificaciones) sino en el protocolo de evaluación. Se define FADE como la divergencia KL simétrica frente a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 mediante un estimador Rao-Blackwellizado. Se distingue explícitamente entre FADE de *untraining* (comparando contra el modelo retenido que nunca vio las muestras originales) y FADE de *unlearning* (comparando contra el modelo retenido que tampoco vio las paráfrasis). Además se reportan métricas clásicas de TOFU: truth ratio, probabilidad Q-A, ROUGE Q-A y utilidad del modelo.

## Capacidades

- Generacion de texto conversacional: hereda el comportamiento de Llama-3.1-8B-Instruct, con formato de chat y plantilla de tokens de Llama 3.
- Razonamiento y respuesta a preguntas: mantiene la utilidad general medida en 0,648 en la escala de TOFU, aunque degradada respecto al modelo sin desaprender.
- Codigo y matematicas: no evaluado ni documentado en la model card; se asume capacidad residual de la base, pero sin datos.
- Tool calling / function calling: no documentado en esta ficha; no se confirma soporte tras el ajuste.
- Agentes y razonamiento multi-paso: no documentado; el modelo esta pensado como artefacto de evaluacion, no como agente de produccion.
- Capacidades multilingues: no declaradas; la model card no enumera idiomas.
- Capacidad especial: modo de desaprendizaje selectivo sobre el dominio TOFU (biografias sinteticas), con comportamiento medido mediante FADE, truth ratio, probabilidad Q-A y ROUGE.
- No incluye vision, audio ni thinking mode explicito.

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint como punto de comparacion frente a otros metodos (gradient ascent, RMU, etc.) sobre la misma base, gracias a que comparte semilla y referencias con el resto de la coleccion TOFU-para.
- Auditoria de metodologias de borrado: medir si NPO elimina conocimiento subyacente o solo las muestras exactas, comparando FADE de untraining (133,75) frente a FADE de unlearning (145,36).
- Reproducibilidad de experimentos: al fijar semilla 0 y publicar `train_config/` y `evals/`, permite replicar el entrenamiento y las evaluaciones con los mismos hiperparametros.
- Estudio de robustez frente a parafrasis: evaluar cuánto sobrevive el conocimiento olvidado cuando se reformula la pregunta, usando para1 y para2 del dataset TOFU-para.
- Benchmarking de utilidad tras desaprender: usar la metrica model utility (0,648) para comparar la perdida de capacidad general entre distintos metodos de unlearning.
- Base para experimentos de privacidad sintetica: emplear TOFU-para como proxy controlado antes de trasladar tecnicas de borrado a datos reales sujetos a RGPD.
- Docencia y formacion: ilustrar en cursos de seguridad de modelos la diferencia entre untraining y unlearning con metricas publicadas y comparaciones entre semillas.

## Benchmarks y rendimiento

| Metrica | Valor (semilla 0) |
|---|---|
| FADE, untraining (vs retain90-forget10para-seed0, forget10 original) | 133,75 |
| FADE, unlearning (vs retain90-seed0, forget10 original + 2 parafrasis) | 145,36 (original 156,1 / para1 140,3 / para2 139,6) |
| Calidad de olvido TOFU | 1,12e-19 |
| Truth ratio del conjunto de olvido | 0,460 |
| Probabilidad Q-A del conjunto de olvido | 0,091 |
| ROUGE Q-A del conjunto de olvido | 0,310 |
| Utilidad del modelo | 0,648 |

Resultados entre semillas (0-2):

| Metrica | Semilla 0 | Semilla 1 | Semilla 2 | Media ± sd |
|---|---|---|---|---|
| FADE, untraining | 133,7 | 152,5 | 126,4 | 137,6 ± 13,4 |
| FADE, unlearning | 145,4 | 156,2 | 133,7 | 145,1 ± 11,3 |
| Probabilidad Q-A olvido | 0,091 | 0,094 | 0,091 | 0,092 ± 0,002 |
| ROUGE Q-A olvido | 0,310 | 0,296 | 0,305 | 0,304 ± 0,007 |
| Truth ratio olvido | 0,460 | 0,471 | 0,468 | 0,466 ± 0,006 |
| Utilidad del modelo | 0,648 | 0,616 | 0,625 | 0,629 ± 0,016 |

Puntos de referencia FADE:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Untrainer perfecto (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Unlearner perfecto (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

## Requisitos de hardware

- VRAM estimada: en bfloat16 los pesos ocupan aproximadamente 16 GB, por lo que se necesita al menos 18-20 GB de VRAM para inferencia con overhead de activaciones y cache KV.
- En cuantizacion de 8 bits: alrededor de 8-9 GB de VRAM; en 4 bits (GGUF Q4_K_M o AWQ/GPTQ 4-bit): aproximadamente 5-6 GB, aunque estas conversiones las tendria que realizar el usuario porque el autor solo publica safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bfloat16 sin cuantizar. En consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) caben en bfloat16; RTX 4080/4070 Ti Super (16 GB) quedan al limite y probablemente requieran 8 bits.
- Cabe en consumer GPU: si, con 24 GB en bfloat16 o con 16 GB usando cuantizacion de 8 bits.
- Opciones de despliegue: transformers (soporte oficial del autor), text-generation-inference (tag `text-generation-inference` presente), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-npo-seed0`) | 8,03 B | no disponible | Unlearning NPO sobre TOFU-para, semilla 0 | llama3.1 | Hugging Face, 887 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | no disponible | Base ajustada sin desaprender (referencia "sin unlearning") | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | no disponible | Referencia "unlearner perfecto" (nunca vio forget10 ni parafrasis) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03 B | no disponible | Referencia "untrainer perfecto" (vio forget10 original pero no parafrasis) | llama3.1 | Hugging Face |

No se dispone de comparaciones con modelos de unlearning de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El resultado FADE de unlearning (145,36) esta mas cerca del modelo sin desaprender (156,3) que del unlearner perfecto (29,8), lo que indica que NPO no elimina el conocimiento subyacente de forma completa en esta configuracion.
- El FADE de untraining (133,75) esta por encima del valor del modelo sin desaprender (81,6), lo que sugiere que las muestras originales tampoco quedan plenamente borradas en terminos de distinguibilidad.
- Alta variabilidad entre semillas: FADE untraining oscila entre 126,4 y 152,5 (±13,4), por lo que conclusiones basadas en una sola semilla pueden ser enganosas.
- La utilidad del modelo (0,648) es inferior a la de la base sin desaprender; puede haber degradacion general no medida fuera de TOFU.
- No hay evaluacion de sesgos, toxicidad ni alucinacion en la model card; se heredan los riesgos de Llama-3.1-8B-Instruct.
- La model card no declara idiomas soportados ni longitud de contexto efectiva tras el ajuste.
- Licencia Llama 3.1 Community: uso comercial sujeto a los terminos de Meta, incluida la clausula de nombre de atribucion "Built with Llama" y restricciones para entidades con gran base de usuarios.
- El modelo esta pensado como artefacto de investigacion; no deberia desplegase en produccion como asistente general sin evaluacion adicional.
- No se publican pesos en GGUF ni versiones cuantizadas; el usuario debe generarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed0
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
