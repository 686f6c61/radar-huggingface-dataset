# sourlreapwr/yam3-pi05-official

## Resumen

π0.5 (pi05_base) es un modelo de política robótica (vision-language-action, VLA) desarrollado originalmente por Physical Intelligence y publicado en abierto a través del proyecto openpi. Esta ficha concreta corresponde a un fine-tune comunitario realizado por el usuario sourlreapwr sobre el checkpoint base, especializado en tres tareas bimanuales con el robot YAM. El modelo consume una imagen RGB de cámara de escena y un vector de estado articular de 14 dimensiones, y produce secuencias de acciones de 30 pasos a 30 Hz en forma de objetivos articulares absolutos más la apertura del gripper.

El interés de esta publicación radica en que reproduce el protocolo de entrenamiento oficial de openpi para su ejemplo bimanual (`pi05_aloha_pen_uncap`): 20.000 pasos, batch de 64, warmup de 1.000 pasos, LR pico de 2,5e-5 con decaimiento coseno hasta 2,5e-6 sobre 30.000 pasos y EMA de 0,99. Se trata de un fine-tune completo sobre 96 demostraciones de teleoperación repartidas en tres tareas, con una pérdida final de entrenamiento de 0,0014 en el paso 19.999. Sustituye a un modelo anterior de 5.000 pasos y batch 32, aproximadamente ocho veces más ligero en cómputo de entrenamiento.

El modelo no es un LLM de propósito general: es un controlador robótico de extremo a extremo que mapea percepción y estado propioceptivo a comandos motores. Su relevancia es la de servir como referencia reproducible de cómo adaptar π0.5 a un robot bimanual distinto del hardware original, con instrucciones en lenguaje natural como condicionamiento de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (π0.5, `pi05_base`) con fine-tune completo; detalles internos de la red no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el condicionamiento es un prompt corto de tarea) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión nativa de entrenamiento) |
| Idiomas soportados | no disponible (prompts de tarea en inglés en las demostraciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params/` (formato de openpi/JAX) + `assets/yam/yam3task_v1/norm_stats.json`; sin estado del optimizador |

Especificaciones de interfaz:

| Parametro | Valor |
|---|---|
| Entrada de visión | cámara de escena (superior) RGB uint8 640x360, expuesta como `images.top` |
| Cámaras de muñeca | no usadas (puestas a cero y enmascaradas) |
| Vector de estado | 14 dimensiones: `[L j1..j6, L grip, R j1..j6, R grip]`, radianes, gripper 0..1 con 1 = abierto |
| Salida | `actions` de forma (30, 14): objetivos articulares absolutos + gripper a 30 Hz (1 s) |
| Frecuencia de control | 30 Hz de generación; ejecutar las 5 primeras acciones y reconsultar (6 Hz) |
| Tamaño del repositorio | 12,4 GB |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base`, el checkpoint base de π0.5 de openpi, y se somete a un fine-tune completo (no LoRA ni adaptadores) sobre 96 demostraciones de teleoperación de tres tareas bimanuales con el robot YAM. El esquema de entrenamiento replica exactamente el del ejemplo oficial `pi05_aloha_pen_uncap` de openpi: 20.000 pasos con batch 64, warmup de 1.000 pasos, LR pico 2,5e-5, decaimiento coseno hasta 2,5e-6 a lo largo de 30.000 pasos y EMA de 0,99. La configuración vive en `code/yam_config.py` bajo el nombre `pi05_yam3_official`. El checkpoint publicado corresponde al paso 19.999 con pérdida de entrenamiento final de 0,0014.

Las demostraciones se reparten en tres prompts: «slide the box from left to right in a straight line, then take off the lid» (50 episodios, ambos brazos), «pick the green cup and place in the yellow plate» (24 episodios, 10 con brazo izquierdo y 14 con derecho) y «slide yellow plate to center» (22 episodios, brazo derecho). El modelo usa únicamente la cámara de escena; las cámaras de muñeca se anulan y enmascaran, lo que reduce la dependencia de hardware adicional. La normalización de estado y acciones se guarda en `assets/yam/yam3task_v1/norm_stats.json`. No se detalla en la información disponible la composición del dataset de preentrenamiento de π0.5 ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico bimanual de extremo a extremo: genera trayectorias de 30 pasos (1 segundo) a 30 Hz para 14 articulaciones (dos brazos de 6 DOF más dos grippers).
- Condicionamiento por lenguaje natural: cada una de las tres tareas se selecciona mediante un prompt de texto específico.
- Percepción visual monocular: usa solo la cámara de escena a 640x360, sin cámaras de muñeca.
- Fusión de estado propioceptivo y visión: el vector de 14 dimensiones se combina con la imagen para producir acciones absolutas.
- Ejecución con reconsultación: el patrón recomendado es ejecutar las 5 primeras acciones y volver a consultar el modelo a 6 Hz, lo que aporta reactividad ante cambios del entorno.
- Multitarea en un único checkpoint: las tres tareas conviven en los mismos pesos y se seleccionan por prompt.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es un modelo de acción, no un asistente conversacional.
- Capacidades multilingües: no documentadas; las demostraciones usan prompts en inglés.

## Casos de uso

- Automatización de manipulación bimanual en línea de montaje: el modelo ejecuta la secuencia de deslizar una caja y retirar la tapa con ambos brazos, adecuado para tareas repetitivas de ensamblaje donde se requiere coordinación entre las dos extremidades.
- Pick-and-place con selección por color: el prompt «pick the green cup and place in the yellow plate» permite integrar el modelo en celdas de clasificación donde el objeto y el destino se especifican por lenguaje, sin reentrenar.
- Alineación fina de piezas: la tarea «slide yellow plate to center» demuestra control de precisión con un solo brazo, útil en operaciones de centrado y posicionamiento submilimétrico.
- Base para fine-tuning en nuevos robots bimanuales: el repositorio incluye `code/yam_config.py` y `code/yam_policy.py` como plantilla para adaptar π0.5 a otro hardware con un conjunto reducido de demostraciones (96 episodios en este caso).
- Investigación en VLA reproducibilidad: sirve como referencia para comparar recetas de entrenamiento (20k pasos, batch 64 frente a 5k pasos, batch 32) y su efecto en la pérdida y el comportamiento.
- Despliegue en bucle de control cerrado: el servidor HTTP (`code/policy_server.py`, puerto 8711) acepta POST con un npz de `image`, `state` y `prompt` a `/infer`, lo que facilita integrarlo en un stack de control a 6 Hz.
- Evaluación de políticas con una sola cámara: al prescindir de cámaras de muñeca, reduce el coste de instrumentación en prototipos y bancos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento final de 0,0014 en el paso 19.999; no se aportan tasas de éxito por tarea ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 12,4 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponibles. Al tratarse de un modelo basado en openpi/JAX, se requiere una GPU compatible con el stack de openpi; el autor no especifica modelos concretos.
- ¿Cabe en GPU de consumo? No disponible. No se confirma ni se descarta para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: servidor oficial de openpi mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config=pi05_yam3_official --policy.dir=ckpt`, o el servidor HTTP incluido en `code/policy_server.py` (endpoint `/infer` en el puerto 8711). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de reconsultación recomendada es de 6 Hz, pero no se reportan tiempos de inferencia medidos.
- Requisito de software: openpi en el commit `215abfb217dbac7d5f1273282331b9b1866c0479` o posterior, con los ficheros de `code/` copiados a las rutas indicadas y el registro de la configuración en `src/openpi/training/config.py`.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Cámaras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yam3-pi05-official (este) | Fine-tune de π0.5 sobre YAM | 3 tareas bimanuales | Solo escena | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 base (`pi05_base`, openpi) | VLA base de Physical Intelligence | Generalista, preentrenado | Múltiples | Según openpi | Público en openpi |
| `pi05_aloha_pen_uncap` (openpi) | Fine-tune oficial de ejemplo | 1 tarea bimanual (ALOHA) | Múltiples | Según openpi | Público en openpi |
| `yam3-pi05-scene` (versión previa del autor) | Fine-tune ligero (5k pasos, batch 32) | 3 tareas bimanuales | Solo escena | Apache 2.0 | Reemplazado por este checkpoint |

No se dispone de datos de rendimiento comparativo (tasas de éxito, MMLU, HumanEval u otras métricas) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo ha visto tres tareas concretas con el robot YAM; generalizará mal a otras instrucciones, objetos o configuraciones de hardware.
- Dependencia de la cámara de escena: al no usar cámaras de muñeca, la precisión en manipulaciones finas o con oclusiones puede degradarse; las cámaras de muñeca se enmascaran explícitamente.
- Dataset pequeño: 96 demostraciones de teleoperación, con reparto desigual entre tareas y brazos (por ejemplo, 10 episodios con brazo izquierdo frente a 14 con derecho en la tarea del vaso), lo que puede introducir sesgos hacia el brazo derecho.
- Riesgo de alucinación motora: como todo modelo generativo de acciones, puede producir trayectorias fuera de distribución; se recomienda ejecutar solo las 5 primeras acciones y reconsultar, además de aplicar límites de seguridad en el controlador.
- Convención de gripper crítica: 1 significa abierto; invertirla provoca fallos de agarre silenciosos.
- Idiomas: no se documenta soporte multilingüe; los prompts de entrenamiento están en inglés y no hay garantía de que funcionen en castellano.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base π0.5 y openpi pueden tener condiciones adicionales que conviene revisar antes de producción.
- Sin estado del optimizador: el checkpoint no permite reanudar el entrenamiento tal cual; solo sirve para inferencia o como inicialización.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicado en noviembre de 2026; no hay validación externa ni informes de terceros.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito que respalde su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/sourlreapwr/yam3-pi05-official
- openpi (repositorio oficial de Physical Intelligence): no disponible en la informacion proporcionada
- Model card de π0.5 / paper de Physical Intelligence: no disponible en la informacion proporcionada
- Configuración `code/yam_config.py` y política `code/yam_policy.py`: incluidas en el repositorio de Hugging Face
- Servidor de inferencia `code/policy_server.py`: incluido en el repositorio de Hugging Face
