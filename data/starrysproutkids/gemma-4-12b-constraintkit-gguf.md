# starrysproutkids/gemma-4-12b-constraintkit-GGUF

## Resumen

gemma-4-12b-constraintkit es un ajuste fino (fine-tune) del modelo google/gemma-4-12B-it desarrollado por el usuario starrysproutkids, orientado a la generacion de CAD parametrico a partir de lenguaje natural. El modelo no genera geometria directamente, sino que escribe un pequeno programa declarativo (partes, parametros y mates) que el sistema open source constraint-kit compila en solidos B-rep exactos y exporta a STEP. De este modo, la responsabilidad geometrica recae en un kernel deterministico y no en la salida del modelo, lo que permite verificar cada construccion contra geometria real.

El modelo tiene 11.907.350.576 parametros (aproximadamente 12B) y se distribuye principalmente como GGUF Q6_K de 9,8 GB para llama.cpp, ademas de un adaptador LoRA PEFT (r=16) sobre unsloth/gemma-4-12b-it. Segun la model card, se entreno en dos fases: SFT y GRPO con un verificador CAD como recompensa, con un coste total declarado de unos 35 USD. El autor reporta un 93% de construcciones verificadas geometricamente y un 87% de rechazos honestos en sondas held-out, asi como una mejora de honestidad frente a un modelo frontier con prompting (57% frente a 16% en peticiones nuevas).

La relevancia actual reside en su enfoque de "honest refusal": el modelo esta entrenado para declinar peticiones fuera de alcance indicando que variante falta (por ejemplo, "solo se modelan engranajes conicos rectos"), en lugar de entregar una aproximacion silenciosamente incorrecta. Ademas, expone una traza de razonamiento (thinking) antes de cada programa, lo que facilita la auditoria de sus decisiones en entornos de ingenieria mecanica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), ajuste fino con LoRA r=16 y GRPO |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion de ejemplo en llama.cpp; no se especifica el maximo del modelo base) |
| Tipos de cuantizacion | GGUF Q6_K (9,8 GB); adaptador LoRA PEFT en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors (LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer decoder-only de aproximadamente 12B parametros. Sobre esa base se aplica un ajuste fino en dos etapas: primero SFT y despues GRPO (Group Relative Policy Optimization). El adaptador se entrena con rango r=16 sobre unsloth/gemma-4-12b-it. La innovacion principal no esta en la arquitectura del modelo, sino en el pipeline de entrenamiento y en el formato de salida: el modelo aprende a emitir un programa estructurado (partes, parametros y mates) que constraint-kit compila a B-rep con generadores exactos y un kernel deterministico de mates, exportando STEP/GLB, BOM, masa y planos.

En la fase GRPO no se usa reward model ni juez LLM: la recompensa es el propio verificador CAD, que comprueba si el programa es valido, si construye y como de cerca queda su firma geometrica del objetivo. Segun la model card, esta fase redujo las construcciones silenciosas de variante incorrecta (de 2/10 a 1/10), elevo los rechazos correctos a 9/10 y no produjo regresion en construcciones (6/6 mantenidas). El modelo fue entrenado con un system prompt exacto (train_sys.txt) y no esta entrenado con otros prompts, por lo que la serializacion de la conversacion (con el token de modo `<|think|>` y parada en `<turn|>`) es parte critica del uso. El coste total declarado de SFT + GRPO es de aproximadamente 35 USD.

## Capacidades

- Generacion de programas de CAD parametrico en ingles natural: partes, parametros y mates que constraint-kit compila a solidos B-rep y exporta a STEP.
- Razonamiento previo a la respuesta: emite una traza de pensamiento (thinking) antes de cada programa, visible para auditoria.
- Rechazo honesto (honest refusal): detecta peticiones fuera de alcance e indica que variante no esta modelada, en lugar de aproximar.
- Cobertura de piezas mecanicas: espaciadores, engranajes rectos, engranajes conicos rectos, poleas con brida, rodamientos, varillas roscadas, motores paso a paso NEMA y extrusión V-slot, entre otras segun los ejemplos de la model card.
- Ensamblajes con mates deterministicos: apilado de piezas, pares de engranajes a distancia entre centros exacta, cadenas de engranajes y mecanismos de cuatro barras.
- Integracion con un kernel geometrico externo (constraint-kit), lo que permite verificar volumen y bounding box de cada construccion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Diseno asistido de utillaje y piezas de taller: un tecnico describe en ingles una pieza (por ejemplo, un espaciador de 12 mm de diametro exterior, 5 mm de taladro y 8 mm de altura) y el modelo genera el programa que constraint-kit compila a STEP, listo para mecanizado o impresion 3D.
- Generacion de ensamblajes con mates exactos: para pares de engranajes rectos, el modelo calcula la distancia entre centros mediante la formula m·(z1+z2)/2 y la expresa como mate, evitando interferencias que un modelo generativo de malla produciria.
- Prototipado rapido de transmisiones: cadenas de engranajes, trenes planetarios o mecanismos de cuatro barras descritos en lenguaje natural, con verificacion geometrica del resultado antes de enviarlo a fabricacion.
- Automatizacion de documentacion tecnica: al exportar BOM, masa y planos desde constraint-kit, el modelo puede alimentar pipelines que generan listas de materiales y fichas de conjunto a partir de una descripcion textual.
- Filtrado y validacion en asistentes de CAD: el modo de rechazo honesto permite integrar el modelo como primera etapa que descarta peticiones no soportadas (por ejemplo, engranajes helicoidales o conicos espirales) antes de llegar a un humano o a otra herramienta.
- Despliegue local en estaciones de ingenieria: con un GGUF Q6_K de 9,8 GB y llama.cpp, el modelo puede ejecutarse en una GPU de consumo o incluso en CPU, sin enviar descripciones de diseno confidenciales a la nube.
- Educacion y formacion en CAD parametrico: la traza de razonamiento y los programas generados sirven como material didactico para explicar relaciones de mates y parametrizacion.

## Benchmarks y rendimiento

Los datos publicados en la model card son metricas propias del autor, no benchmarks estandar:

| Metrica | Resultado | Contexto |
|---|---|---|
| Construcciones verificadas geometricamente | 93% | SFT, held-out, primer intento |
| Rechazos honestos | 87% | SFT, held-out; con GRPO: 9/10 |
| Construcciones honestas frente a modelo frontier | 57% vs 16% | Peticiones nuevas |
| Construcciones silenciosas de variante incorrecta | 2/10 → 1/10 | Efecto de GRPO |
| Construcciones correctas tras GRPO | 6/6 | Sin regresion |
| Coste total de entrenamiento | ~35 USD | SFT + GRPO |

Criterio de verificacion: una construccion cuenta solo si el volumen y el bounding box de la pieza quedan dentro del 2% del objetivo held-out. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q6_K ocupa 9,8 GB, por lo que se necesitan aproximadamente 10-12 GB de VRAM para cargarlo completo en GPU con contexto de 8192 tokens.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). Tambien es viable en GPUs de 12-16 GB con cuantizaciones menores no publicadas en el repo.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y previsiblemente en RTX 4080 (16 GB) con Q6_K; en GPUs de 8-12 GB requeriria cuantizaciones mas agresivas no incluidas en el repo.
- Opciones de despliegue: llama.cpp (llama-server), con el ejemplo oficial `llama-server -m gemma4-12b-constraintkit-grpo-Q6_K.gguf -c 8192 -ngl 99 --port 8086`. En GPUs Volta (V100) se recomienda `-fa off -ub 1024` porque flash-attn automatico resulta muy lento en prefill. El adaptador LoRA puede cargarse con PEFT sobre unsloth/gemma-4-12b-it.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo advierte del problema de prefill en Volta con flash-attn automatico.
- Nota de integracion: debe usarse el endpoint `/completion` en crudo con la serializacion de entrenamiento (system con `<|think|>`, parada en `<turn|>`), no una plantilla de chat generica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12b-constraintkit | ~12B | 8192 (config. ejemplo) | Text-to-CAD con verificacion geometrica y rechazo honesto | Apache 2.0 | GGUF + LoRA en Hugging Face |
| google/gemma-4-12B-it (base) | ~12B | no disponible | Modelo generalista de instrucciones | Gemma (terminos propios) | Hugging Face |
| Modelo frontier con prompting (sin especificar en la model card) | no disponible | no disponible | Planificador CAD via prompting | no disponible | API hosted |
| constraint-kit planner hosted (DeepSeek) | no disponible | no disponible | Planificador CAD por defecto del sistema constraint-kit | no disponible | Servicio hosted |

La model card compara el modelo con un "prompted frontier model" y con el planificador hosted por defecto de constraint-kit (DeepSeek), pero no identifica versiones ni parametros de esos modelos. No se dispone de comparativas con otros fine-tunes text-to-CAD en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y declarado unicamente para ingles, por lo que peticiones en castellano pueden degradar la calidad o el formato de salida.
- Dependencia estricta del system prompt: fue entrenado con un unico system prompt (train_sys.txt) y no esta entrenado con otros; usar plantillas de chat genericas o prompts distintos puede romper el formato.
- Cobertura limitada de variantes: el modelo solo conoce las piezas y variantes implementadas en constraint-kit (por ejemplo, solo engranajes conicos rectos, no espirales). Fuera de ese alcance debe rechazar, y ese rechazo es parte del comportamiento esperado.
- Riesgo de alucinacion estructural: aunque la geometria la genera el kernel, el modelo puede producir programas sintacticamente validos pero con parametros o mates incorrectos; por eso el autor insiste en la verificacion geometrica.
- Metricas autodeclaradas: los porcentajes (93%, 87%, 57% vs 16%) proceden de evaluaciones del propio autor sobre sondas held-out, sin benchmark estandar ni replicacion independiente.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion por parte de la comunidad.
- Advertencia sobre las imagenes de la model card: el propio autor aclara que las frases citadas en los ejemplos se procesaron con el planificador hosted por defecto de constraint-kit (DeepSeek), no con este modelo, y que el tren planetario del banner fue disenado por el solver Z3; no deben atribuirse a este modelo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base google/gemma-4-12B-it tiene sus propios terminos de uso que deben respetarse adicionalmente.
- Contexto de ejemplo de 8192 tokens: no se documenta el maximo soportado ni el comportamiento mas alla de esa ventana.
- Fecha de publicacion futura (2026-11-11) en los metadatos de Hugging Face: conviene verificar la vigencia y el estado del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/starrysproutkids/gemma-4-12b-constraintkit-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Base del adaptador LoRA: https://huggingface.co/unsloth/gemma-4-12b-it
- Repositorio constraint-kit: https://github.com/jajmangold/constraint-kit
