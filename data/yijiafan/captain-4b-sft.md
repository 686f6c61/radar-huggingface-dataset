# YijiaFan/CaPtain-4B-SFT

## Resumen

CaPtain-4B-SFT es el punto de control intermedio de la etapa de ajuste supervisado (SFT) del pipeline **CaPtain**, desarrollado por YijiaFan y descrito en el articulo *CaPtain: A Pipeline for Post-Training Code-as-Policy Robot Agents*. Se trata de un fine-tuning completo de Qwen3.5-4B sobre trayectorias sinteticas de agente recogidas en el entorno CaPtain-Harness, y sirve como inicializacion y referencia KL para la etapa posterior de aprendizaje por refuerzo que produce el modelo final CaPtain-4B.

A diferencia de un modelo vision-language-action (VLA) convencional, este modelo no emite acciones directamente: en cada peticion escribe codigo Python para una unica herramienta `python` que se ejecuta en una sesion persistente y sandboxeada de Python 3.11. La API del robot expuesta en esa sesion contiene 22 capacidades de bajo nivel (percepcion, medida geometrica, movimiento con cinematica inversa y guardas) mas `finish()`, sin macros de agarre ni colocacion. El modelo ve imagenes de camara, su propio codigo y salida, y recibos de una linea de sus llamadas al robot; nunca ve poses de objetos ni el predicado de exito.

Con 5.174.964.736 parametros totales (segun los safetensors del repositorio), arquitectura `Qwen3_5ForConditionalGeneration` con `lm_head` desligado y torre de vision congelada durante el SFT, el checkpoint es relevante para quien quiera reproducir o modificar la etapa de RL, o disponer de una linea base de SFT en agentes roboticos que programan politicas en lugar de predecir acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (vision-language, `lm_head` desligado) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k tokens con compactacion en el protocolo del paper; servido con `--max-model-len 81920` en vLLM |
| Tipos de cuantizacion | No disponible (el autor solo publica bf16 safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en bf16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con torre de vision y cabeza de lenguaje, al que se le desliga el `lm_head` mediante el script `sft/scripts/untie_base.py`. El tokenizer, el processor y la plantilla de chat son identicos a los del modelo base, y la torre de vision permanece congelada durante todo el ajuste. El entrenamiento consiste en un fine-tuning completo del modelo de lenguaje sobre trayectorias sinteticas de agente recolectadas en CaPtain-Harness, generadas con modelos frontera y complementadas con episodios exitosos del propio estudiante; se incluye tambien visual QA con peso de perdida 0.5.

La supervision cubre unicamente los turnos del asistente, con una mascara de pista textual (p = 0.2) que sustituye coordenadas de pixel previas de `mark_point` por `<masked>`, forzando al modelo a leer la imagen en lugar de copiar coordenadas. La optimizacion emplea LR pico de 1e-5, 30 pasos de warmup, schedule coseno, DeepSpeed ZeRO-3 en bf16, recorte de gradiente de 1.0 y un normalizador global constante de perdida por token; el entrenamiento consta de 2.435 pasos (1.5 epocas). El modelo se entreno sobre la plantilla exacta de peticion del harness: prompt de sistema con contexto del entorno, `TASK.md` en linea, esquema de la herramienta `python` (`python-runtime/v1`), recibos, notas de compactacion y colocacion de imagenes. Usa la plantilla de chat estandar de Qwen3.5 con razonamiento `<think>` y llamadas a herramientas en XML.

## Capacidades

- Generacion de codigo Python como politica robotica: escribe programas para una sesion persistente de Python 3.11 con 22 primitivas de percepcion, medida y movimiento.
- Razonamiento multimodal: interpreta imagenes de camara junto con su propio codigo y salida para decidir el siguiente paso.
- Tool calling en formato XML (`qwen3_xml`) con parser de razonamiento `qwen3` en vLLM.
- Comportamiento de agente multi-paso con presupuestos por episodio (60 peticiones, 1.080 s, 150 acciones fisicas).
- Modo de razonamiento explicito (`<think>`) activado durante la evaluacion.
- Uso de servicios de percepcion externos a traves del harness: segmentacion SAM 3 y pointing con Molmo2-8B.
- Capacidad de finalizacion autonoma mediante la llamada `finish()`.
- Multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Reproduccion de la etapa de RL: el checkpoint es la inicializacion y la referencia KL de CaPtain-4B, por lo que sirve para relanzar el entrenamiento por refuerzo con modificaciones propias.
- Linea base de SFT en investigacion de agentes roboticos: permite comparar tecnicas de post-entrenamiento sobre el mismo conjunto de datos y harness.
- Manipulacion en simulacion LIBERO: ejecutar episodios en las suites estandar y en variantes de robustez (LIBERO-PRO, LIBERO-Plus, LIBERO-MAX) para medir tasas de exito antes del RL.
- Desarrollo de politicas code-as-policy: experimentar con nuevas primitivas o esquemas de herramientas sobre la API de 22 capacidades del harness.
- Evaluacion de percepcion integrada: probar combinaciones de SAM 3 y Molmo2-8B detras de las herramientas del harness y medir su impacto en la tarea.
- Investigacion sobre mascaras de pista textual: estudiar como afecta la sustitucion de coordenadas por `<masked>` al uso real de la imagen por parte del modelo.
- Generacion de datos sinteticos de agente: usar el modelo como estudiante para recolectar episodios exitosos que alimenten futuras rondas de SFT.

## Benchmarks y rendimiento

Tasas de exito (%) en simulacion, formato host / estricto. El exito estricto exige ademas que el agente llame el mismo a `finish()`. La fila LIBERO usa estados iniciales oficiales reservados 11-16 de las 40 tareas de las cuatro suites estandar.

| Benchmark | Episodios | Qwen3.5-4B | CaPtain-4B-SFT | CaPtain-4B (tras RL) |
|---|:-:|:-:|:-:|:-:|
| LIBERO, estados reservados 11-16 | 240 | 0.0 / 0.0 | 55.4 / 52.1 | 73.8 / 67.5 |
| LIBERO-PRO Pos+Task, media de 6 celdas | 600 | 0.3 / 0.2 | 59.5 / 56.7 | 78.5 / 71.5 |
| LIBERO-PRO Pos+Task, media de 8 celdas | 800 | 0.2 / 0.1 | 49.2 / 45.1 | 68.6 / 58.9 |
| LIBERO-Plus, 7 categorias | 700 | 0.0 / 0.0 | 48.6 / 44.6 | 66.1 / 59.0 |
| LIBERO-PRO, 4 categorias | 160 | 0.0 / 0.0 | 48.8 / 48.1 | 68.8 / 60.6 |
| LIBERO-MAX Dynamic | 80 | 0.0 / 0.0 | 40.0 / 40.0 | 61.2 / 50.0 |
| LIBERO-MAX Base | 80 | 0.0 / 0.0 | 51.2 / 45.0 | 70.0 / 63.8 |

Los resultados de transferencia zero-shot del paper (RoboTwin 2.0 22.6 en el protocolo oficial Hard, SimplerEnv WidowX 83.3, CaP-Bench 75.0, RoboDojo Score 1.7) se midieron con CaPtain-4B, no con este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 5.17 mil millones de parametros en bf16, los pesos ocupan aproximadamente 10.4 GB, a lo que hay que sumar cache KV para ventanas de hasta 80k tokens y hasta 12 imagenes por prompt.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una GPU profesional con 24 GB o mas (A100, H100, L40S) es el escenario natural para el servicio con vLLM y contexto largo.
- Cabe en GPU de consumo: no disponible; con cuantizacion a 8 o 4 bits seria viable en GPUs de 16-24 GB, pero el autor no publica pesos cuantizados.
- Opciones de despliegue: vLLM 0.29 con `--dtype bfloat16 --max-model-len 81920 --enable-prefix-caching --limit-mm-per-prompt '{"image":12}' --max-num-seqs 16 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_xml`; requiere CaPtain-Harness y los servicios de percepcion (`services/start_perception.sh`, SAM 3 en :8114 y Molmo2-8B en :8122).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | LIBERO (host/estricto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CaPtain-4B-SFT | 5.17B | 64k con compactacion | Code-as-policy, agente multimodal | 55.4 / 52.1 | Apache 2.0 | Hugging Face |
| CaPtain-4B (tras RL) | 5.17B (mismo base) | 64k con compactacion | Code-as-policy, agente multimodal | 73.8 / 67.5 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B | 4B (nominal) | No disponible | Modelo base vision-language | 0.0 / 0.0 | No disponible en la informacion | Hugging Face (Qwen) |

No se dispone de datos de otros agentes roboticos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion: las trayectorias de SFT son episodios simulados, casi todos en LIBERO; no se uso data de robot real.
- Rendimiento inferior al modo RL: CaPtain-4B supera a este checkpoint en todas las suites evaluadas; para el mejor rendimiento robotico el autor recomienda el modelo tras RL.
- Requiere el harness: el modelo fue entrenado con la plantilla exacta de peticion de CaPtain-Harness; no debe ejecutarse con prompts escritos a mano ni modificarse el texto visible al modelo durante la evaluacion.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Riesgo de alucinacion en la generacion de codigo: el modelo escribe programas que se ejecutan en una sesion real, por lo que errores de API o de logica pueden provocar fallos de episodio o acciones fisicas no deseadas; el sandbox y las guardas del harness son la unica proteccion.
- Dependencia de servicios externos: SAM 3 y Molmo2-8B deben estar operativos para que las herramientas de percepcion funcionen.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de entrenamiento en robot real limita su validez fuera de simulacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YijiaFan/CaPtain-4B-SFT
- Modelo tras RL: https://huggingface.co/YijiaFan/CaPtain-4B
- Dataset de SFT: https://huggingface.co/datasets/YijiaFan/CaPtain-SFT-Data
- Pagina del proyecto: https://waltstephen.github.io/captain/
- Codigo del pipeline (SFT, RL): https://github.com/waltstephen/CaPtain
- Harness (necesario para ejecutar el modelo): https://github.com/waltstephen/CaPtain-Harness
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
