# SZLHOLDINGS/salad-brain-navigator-r2-r1

## Resumen

`salad-brain-navigator-r2-r1` es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base `Qwen/Qwen3.5-0.8B`. El repositorio contiene exclusivamente los pesos del adaptador (0,2 GB, 33 ficheros de pesos, sin ficheros de configuracion ni tokenizer), por lo que no es un modelo autonomo: requiere descargar el modelo base y cargar el adaptador encima para poder ejecutarse.

La model card no describe el modelo como un producto de IA orientado a tareas, sino como un "lane" de entrenamiento con trazabilidad criptografica: cada arranque de worker, heartbeat y checkpoint genera un "recibo" (receipt) con digest SHA-256 publicado en un dataset publico de la cadena (`SZLHOLDINGS/frontier-54-runs`). El entrenamiento se realizo en una unica NVIDIA GeForce RTX 4090 con un corpus privado (`SZLHOLDINGS/anatomy-brain-datasets-corpus-v1`) y 204 pasos frente a un maximo configurado de 200.

La relevancia practica es limitada como modelo de proposito general: no hay evaluacion del adaptador, no hay ficha de capacidades, no hay benchmarks propios y la unica bateria de pruebas citada (3/6) corresponde a otro modelo del "estate" (`SZLHOLDINGS/brain-navigator-v2-trained`), no a este adaptador. Es un artefacto de auditoria de entrenamiento mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer `Qwen/Qwen3.5-0.8B`; arquitectura del adaptador no detallada |
| Parametros totales | No disponible (el repo pesa 0,2 GB en 33 ficheros de pesos; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-0.8B, no declarada en la card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | `other` (etiqueta literal observada; sin texto de licencia en el repo) |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT entrenado sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de 0,8 mil millones de parametros. La card no especifica rango LoRA, modulos objetivo, learning rate, batch size ni composicion del corpus mas alla del identificador `SZLHOLDINGS/anatomy-brain-datasets-corpus-v1`. El entrenamiento se ejecuto en una RTX 4090 con identificador de nodo `9c2c7069-8385-43b6-9c8d-02c9afb63dfa`, worker `v3.2-20261115`, con un throughput medido aproximado de 1,2k tokens/s.

Los datos de telemetria reportados son: perdida de 4,559 a 0,048 (n=20 puntos de log) y precision media de token de 0,353 a 0,987. El entrenamiento declaro 204 pasos completados sobre un maximo de 200, con reanudacion desde `global_step=204` registrada como evento de recibo. No se reporta numero de tokens vistos. No hay evidencia de RLHF, DPO ni ninguna fase de alineacion; el proceso descrito es exclusivamente de ajuste supervisado sobre el corpus citado. La innovacion tecnica destacable no esta en el modelo sino en el andamiaje: cadena de recibos SHA-256 encadenados ("khipu"), doctrina fail-closed y publicacion de eventos en un dataset publico verificable.

## Capacidades

- Generacion de texto: heredada del modelo base Qwen3.5-0.8B; el adaptador no documenta capacidades adicionales.
- Razonamiento y matematicas: la bateria citada incluye una pregunta aritmetica (17 * 23) respondida correctamente, pero corresponde a otro modelo del estate, no a este adaptador.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Comportamiento ante preguntas sin respuesta: la doctrina del estate exige abstenerse, pero la bateria citada muestra 3 fallos en las tres preguntas no respondibles (u1, u2, u3), lo que indica que el modelo evaluado no se abstiene.

## Casos de uso

- Auditoria de procedencia de entrenamiento: el adaptador y su cadena de recibos sirven para verificar que un ajuste concreto se ejecuto en un hardware identificado, con checkpoints fechados y digests SHA-256 encadenados, util en entornos donde se exige trazabilidad de artefactos.
- Reproduccion de pipelines de ajuste fino en GPU de consumo: el run completo (204 pasos sobre un modelo de 0,8B en una RTX 4090) es un ejemplo de referencia para montar un lane de entrenamiento LoRA de bajo coste con registro de eventos.
- Prototipado de asistentes de dominio cerrado: cargando el adaptador sobre Qwen3.5-0.8B se puede evaluar si el ajuste sobre el corpus "anatomy-brain" mejora respuestas en ese dominio concreto, siempre que se realice una evaluacion propia.
- Base para experimentos de calibracion y absteccion: dado que la bateria del estate mide explicitamente la capacidad de decir "no lo se", este adaptador puede usarse como punto de partida para probar tecnicas de absteccion en modelos pequenos.
- Docencia e investigacion sobre trazabilidad criptografica de artefactos ML: la estructura "khipu" de recibos encadenados es un caso de estudio para cursos de MLOps y governance de modelos.
- Generacion de texto ligera en local: al apoyarse en un modelo de 0,8B, es viable en CPU o GPU de gama baja para tareas de redaccion corta, resumen o clasificacion, previa validacion de calidad.
- Integracion como capa de adaptacion en un stack mayor: si el corpus de entrenamiento es relevante para un dominio especifico, el adaptador puede combinarse con el base para despliegues con requisitos de trazabilidad documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del adaptador en la informacion disponible. La unica medicion reportada es la bateria interna de 6 sondas, que corresponde al modelo `SZLHOLDINGS/brain-navigator-v2-trained` y no a este adaptador, con puntuacion 3/6:

| Sonda | Tipo | Resultado |
|---|---|---|
| a1 (capital de Francia) | respondible | PASS |
| a2 (17 * 23) | respondible | PASS |
| a3 (autor de 1984) | respondible | PASS |
| u1 (pregunta sin respuesta) | no respondible | FAIL |
| u2 (pregunta sin respuesta) | no respondible | FAIL |
| u3 (pregunta sin respuesta) | no respondible | FAIL |

La propia card advierte que "este recibo vincula el modelo curriculum v2-trained, no este adaptador lane r1" y que "no se transfiere ninguna puntuacion".

## Requisitos de hardware

- VRAM para inferencia: el adaptador pesa 0,2 GB; sumado al base Qwen3.5-0.8B en FP16 (aprox. 1,6 GB) resulta un total en torno a 2 GB, aunque no se dispone de medicion oficial.
- GPU recomendadas: el modelo base de 0,8B cabe en cualquier GPU consumer moderna; el adaptador no anade requisitos significativos.
- GPU consumer: si, cualquier GPU con 4 GB o mas de VRAM; tambien es viable en CPU.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el base), vLLM con soporte LoRA, llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: el unico dato es el throughput de entrenamiento (~1,2k tokens/s en RTX 4090); no hay medicion de inferencia.
- Energia: la seccion de energia de la card indica explicitamente "UNMEASURED" para este lane.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `SZLHOLDINGS/salad-brain-navigator-r2-r1` | Adaptador sobre 0,8B | No disponible | `other` | Hugging Face, 0 descargas |
| `Qwen/Qwen3.5-0.8B` (base) | 0,8B | No disponible en esta ficha | Segun Qwen | Hugging Face |
| `SZLHOLDINGS/brain-navigator-v2-trained` | No disponible | No disponible | No disponible | Hugging Face (mismo estate) |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No hay evaluacion del adaptador: la bateria 3/6 corresponde a otro modelo del estate y la card lo declara explicitamente.
- Ausencia de configuracion y tokenizer en el repo (0 ficheros de config/tokenizer): el adaptador no es autocontenido y depende del base.
- Corpus de entrenamiento privado y no descrito: no se puede auditar la composicion de datos ni sus sesgos.
- Riesgo de alucinacion: la bateria del estate muestra 3/3 fallos en preguntas no respondibles, lo que sugiere falta de calibracion en el modelo evaluado; no hay datos equivalentes para este adaptador.
- Licencia `other` sin texto: no se puede confirmar el uso comercial; hay que contactar con el autor.
- Idiomas no declarados: no se puede garantizar cobertura multilingue.
- Trazabilidad incompleta: la propia card indica que la procedencia del entrenamiento "no es verificable de forma independiente desde este repositorio" y que el artefacto no esta mapeado a una fuente GitHub.
- Cero descargas y cero likes: no hay evidencia de uso real ni validacion por la comunidad.
- El modelo declara 204 pasos sobre un maximo de 200, lo que indica que el control de parada se alcanzo por reanudacion y no por convergencia planificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-brain-navigator-r2-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Corpus citado: https://huggingface.co/datasets/SZLHOLDINGS/anatomy-brain-datasets-corpus-v1
- Cadena de recibos publica: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Modelo del estate con bateria evaluada: https://huggingface.co/SZLHOLDINGS/brain-navigator-v2-trained
