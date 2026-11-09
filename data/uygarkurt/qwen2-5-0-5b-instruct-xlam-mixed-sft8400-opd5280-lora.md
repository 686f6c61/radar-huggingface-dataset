# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd5280-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd5280-lora es un adaptador LoRA desarrollado por uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El adaptador se entrena en dos fases: primero 8.400 actualizaciones de supervised fine-tuning (SFT) y despues 5.280 actualizaciones adicionales de on-policy distillation (OPD) usando Qwen/Qwen2.5-3B-Instruct como profesor congelado. El objetivo es especializar un modelo pequeno de 0,5 mil millones de parametros en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes.

El modelo resuelve un problema concreto: los modelos pequenos suelen fallar al generar llamadas a funciones bien formadas y tienden a forzar el uso de herramientas aunque no vengan al caso. Este adaptador mejora la precision de nombre de funcion y la exactitud de la llamada completa en el conjunto de evaluacion xLAM, y eleva la tasa de relevancia al 100% en las pruebas del autor, a costa de una caida notable en la deteccion de irrelevancia.

Es relevante ahora porque demuestra que con tecnicas de destilacion on-policy se puede dotar a un modelo de 0,5B de capacidades de function calling competitivas para entornos con recursos muy limitados, aunque los resultados en tareas generales (MMLU, MATH-500, IFEval) siguen siendo modestos y propios de su tamano. El repositorio contiene unicamente los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | no disponible (modelo base de 0,5B; el adaptador anade un numero no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de tipo PEFT sobre el transformer decoder-only Qwen2.5-0.5B-Instruct. El entrenamiento se realizo con Post-Training Lab, el framework del propio autor, sobre el dataset uygarkurt/xlam-tool-calling-mixed. La primera fase consistio en 8.400 actualizaciones de SFT (1,3 horas de bucle de entrenamiento). La segunda fase continuo ese adaptador con 5.280 actualizaciones de on-policy distillation (1,9 horas), en la que el estudiante aprende a partir de las probabilidades por token que genera un profesor congelado, Qwen/Qwen2.5-3B-Instruct, sobre sus propias respuestas generadas.

La innovacion tecnica destacable es el uso de OPD sobre un adaptador ya entrenado con SFT: en lugar de destilar sobre un dataset estatico, el estudiante genera respuestas y el profesor las puntua token a token, lo que permite refinar el comportamiento en tool calling y abtencion. El tiempo total de entrenamiento reportado es de 3,2 horas, excluyendo carga de modelo, preparacion de datos y evaluacion externa. No se especifican el numero de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su nombre y tematica (tool calling mixto).

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling estructurado: genera llamadas a funciones con nombre y argumentos.
- Abtencion ante herramientas irrelevantes: entrenado explicitamente para no forzar llamadas cuando las herramientas ofrecidas no aplican.
- Razonamiento basico y matematicas elementales (rendimiento limitado por el tamano del modelo base).
- Seguimiento de instrucciones (IFEval) a nivel basico.
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio, modo thinking ni agentes multi-paso mas alla del function calling de un turno.

## Casos de uso

- Enrutamiento de herramientas en asistentes ligeros: el adaptador puede decidir que funcion invocar y con que argumentos en un pipeline de agentes con presupuesto de computo minimo, gracias a su tamano de 0,5B y a la precision de nombre de funcion reportada (87,71% en xLAM FNA).
- Abtencion controlada en produccion: cuando el conjunto de herramientas ofrecido no cubre la peticion del usuario, el modelo puede rechazar la llamada; util en sistemas donde una llamada erronea tiene coste alto, aunque debe vigilarse la tasa de irrelevancia detectada (13,01%).
- Clasificacion y extraccion de intenciones con salida estructurada: puede mapear consultas de usuario a esquemas JSON de funciones en aplicaciones de bajo consumo.
- Prototipado rapido de function calling en local: al ser un adaptador sobre un modelo de 0,5B, permite iterar en portatiles o CPUs sin GPU dedicada.
- Filtrado previo en cascada: usar este modelo como primera etapa barata que decide si merece la pena invocar un modelo mayor con tool calling, reduciendo coste por consulta.
- Investigacion en destilacion on-policy: sirve como referencia reproducible de como OPD afecta a metricas de tool calling frente a SFT puro en modelos pequenos.

## Benchmarks y rendimiento

Resultados reportados por el autor (porcentajes; el conjunto xLAM usa el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el limite de 640 tokens de prompt):

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT 8.400 (adaptador inicial) | 37,91% | 18,00% | 29,21% | 74,51% | 88,18% | 46,24% | 55,56% | 88,59% |
| SFT + OPD (este adaptador) | 38,56% | 17,40% | 29,02% | 69,13% | 87,71% | 58,44% | 100,00% | 13,01% |

Interpretacion: la fase OPD mejora BFCL Single-turn FC (+12,20 puntos) y lleva la relevancia al 100%, pero degrada la exactitud de llamada exacta en xLAM ETC (-5,38 puntos) y, sobre todo, la deteccion de irrelevancia (-75,58 puntos). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 0,5B, la huella es muy reducida (tipicamente menos de 2 GB en FP16 para el modelo base, sin contar overhead del runtime).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requieren A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas; tambien viable en CPU.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), y potencialmente llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B + LoRA | no disponible | Tool calling + abtencion via SFT+OPD | no disponible | Hugging Face (adaptador) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | Instruccion general | no disponible | Hugging Face |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora (SFT previo) | 0,5B + LoRA | no disponible | Tool calling via SFT | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fuera de la tabla de evaluacion del propio autor.

## Limitaciones y advertencias

- Caida severa en deteccion de irrelevancia: del 88,59% al 13,01% tras OPD; el modelo tiende a considerar relevante cualquier herramienta ofrecida, lo que puede provocar llamadas erroneas en produccion.
- Descenso en exactitud de llamada exacta xLAM ETC (74,51% a 69,13%) y en MATH-500 (18,00% a 17,40%) tras la fase OPD.
- Rendimiento general bajo en MMLU (38,56%) e IFEval (29,02%), coherente con un modelo de 0,5B; no apto para tareas de razonamiento complejo.
- Solo soporta ingles segun la model card; no se garantiza comportamiento en castellano.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor y la licencia del modelo base.
- Riesgo de alucinacion en argumentos de funciones y en texto generado, propio de modelos pequenos.
- El repositorio contiene solo el adaptador; requiere cargar el modelo base Qwen2.5-0.5B-Instruct y no necesita el adaptador SFT previo por separado.
- Evaluaciones realizadas con scripts propios del autor y agregados especificos del estudio; no son directamente comparables con resultados publicos de terceros.
- Sin descargas ni likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd5280-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor usado en OPD: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Framework de entrenamiento: https://github.com/uygarkurt/post-training-lab
