# y0urOy/JAM-Wan-PiperX

## Resumen

JAM-Wan-PiperX es un checkpoint de política robótica (policy) publicado por el usuario y0urOy en HuggingFace, pensado para control de un robot Piper X de doble brazo en seis tareas reales del benchmark RoboDojo. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un checkpoint de PyTorch que se carga mediante un adaptador propio dentro del repositorio JAM y que emite objetivos de articulación absolutos (14 dimensiones) a partir de tres cámaras RGB, el estado articular actual y una instrucción textual en inglés.

El modelo se construye como un fine-tuning sobre el modelo base Wan-AI/Wan2.2-TI2V-5B, un transformer de difusión (DiT) para generación de vídeo de 5B parámetros, y se entrena con action flow matching más una alineación de características futuras directa desde el VAE (future offsets [1, 2], capa 18, peso 0.6). La rama de predicción de futuro (foresight) se usa solo durante el entrenamiento, no en inferencia. El checkpoint publicado corresponde al paso 28.630 y ocupa 12.183.478.777 bytes.

La relevancia del modelo es acotada pero concreta: es una liberación reproducible y verificable por hash de una política multitarea para manipulación bimanual, con configuración de inferencia fijada (bf16, seed 42, 10 pasos, horizonte de acción 32, replanificación cada 24). El propio autor advierte que la evaluación en robot real está pendiente: 0 ensayos reales y tasa de éxito nula/pendiente en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (ActionDiT) inicializado desde Wan2.2-TI2V-5B, con action flow matching y rama de foresight (solo entrenamiento); codificador de texto UMT5 y VAE de Wan |
| Parametros totales | No disponible (el modelo base Wan2.2-TI2V-5B declara 5B; el checkpoint de la politica pesa 12.183.478.777 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionado por instruccion textual, 3 camaras RGB y estado articular de 14 dimensiones) |
| Tipos de cuantizacion | No disponible (unico checkpoint en bf16, formato .pt) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 para los ficheros del modelo, con atribucion de Wan en NOTICE; las adiciones de codigo de JAM son MIT |
| Formato de pesos | PyTorch (.pt, state dict cargado por adaptador propio; no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo es una política de imitación construida sobre un backbone transformer de difusión (DiT) procedente de Wan2.2-TI2V-5B. La inicialización compartida de la ActionDiT se distribuye como `ActionDiT_linear_interp_Wan22_alphascale_1024hdim.pt`, y los activos públicos de Wan (modelo Wan2.2, UMT5, VAE y tokenizador de Wan2.1) se descargan desde revisiones ancladas del repositorio upstream en lugar de duplicarse. El entrenamiento emplea action flow matching combinado con una alineación de características futuras directa desde el VAE, configurada con offsets de futuro [1, 2], capa 18 y peso 0.6. La rama de foresight se utiliza únicamente durante el entrenamiento y no forma parte del grafo de inferencia.

Los datos de entrenamiento provienen del conjunto RoboDojo (revisión `35efbc7dedfdbeeb6e95fb749bd885d73d483e41`), con 540 episodios de entrenamiento y 60 reservados, reparto 90/10 por tarea, semilla 42. El entrenamiento se ejecutó con batch global de 128 sobre ocho nodos GH200, durante 10 épocas, lo que suma 28.630 actualizaciones (de ahí el nombre del checkpoint, `step_028630`). Las seis tareas cubiertas son `cap_pen`, `classify_objects`, `disassemble_LEGO`, `hang_mugs`, `pack_objects_into_backpack` y `sweep_blocks`.

## Capacidades

- Generación de acciones de manipulación bimanual: emite objetivos de articulación absolutos de 14 dimensiones (brazo izquierdo 6, pinza izquierda 1, brazo derecho 6, pinza derecha 1).
- Política multitarea única: una sola política cubre las seis tareas reales de RoboDojo indicadas arriba, sin cabezas separadas por tarea.
- Condicionamiento multimodal de entrada: tres cámaras RGB más estado articular actual de 14 dimensiones más instrucción en lenguaje natural.
- Ejecución por difusión/flow matching: 10 pasos de inferencia, horizonte de acción de 32, con replanificación cada 24 pasos.
- Inferencia en bf16 con semilla fija (42) para reproducibilidad.
- Servicio local mediante `serve.sh` que arranca el runtime `piperx-policy` en el puerto 9010 sobre loopback.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento extendido; el modelo es específicamente una política robótica.

## Casos de uso

- Manipulación bimanual multitarea en laboratorio: usar la política única para las seis tareas de RoboDojo (`cap_pen`, `classify_objects`, `disassemble_LEGO`, `hang_mugs`, `pack_objects_into_backpack`, `sweep_blocks`) sin reentrenar por tarea, aprovechando el condicionamiento por instrucción.
- Investigación en imitación sobre backbone de difusión de vídeo: servir como punto de partida reproducible (hash SHA256 y revisión fijadas) para estudiar transferencia desde modelos de vídeo a control robótico.
- Comparación controlada con la política pareja FastWAM-PiperX: ambas comparten la misma inicialización de ActionDiT, lo que permite aislar el efecto del método de entrenamiento en condiciones idénticas de datos y reparto.
- Banchmarking offline de interfaces: replicar las 240 comprobaciones de chunks de acción por modelo para validar adaptadores, normalización (`dataset_stats.json`) y formato de salida antes de tocar hardware.
- Integración en pilas de robótica basadas en PyTorch: cargar el checkpoint con el adaptador suministrado dentro de un `policy` server local en el puerto 9010 para bucle cerrado con replanificación cada 24 pasos.
- Reproducción de entrenamiento a escala: el registro de 540/60 episodios, batch 128 y 28.630 actualizaciones sobre ocho GH200 sirve de referencia para estimar coste de reentrenamiento con el mismo pipeline.
- Docencia y auditoría de políticas robóticas: al no incluirse el dataset crudo ni estados de entrenamiento, el repositorio es apto para revisar configuración y artefactos sin exponer datos sensibles ni registros de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el registro para robot real se recibió el 2026-10-16, que la aceptación de las seis tareas Piper X, el protocolo y el calendario siguen pendientes, y que los ensayos en robot real son 0 con tasa de éxito nula/pendiente. Los 240 chunks de acción por modelo son comprobaciones de interfaz/offline, no ensayos de robot. El release no reclama resultados oficiales de leaderboard ni éxito medido en tarea.

## Requisitos de hardware

- Entrenamiento documentado: ocho nodos GH200, batch global 128, 10 épocas, 28.630 actualizaciones.
- Espacio en disco: el repositorio ocupa 14,2 GB; solo el checkpoint principal son 12.183.478.777 bytes (12,18 GB). Hay que añadir los activos públicos de Wan2.2/UMT5/VAE y el tokenizador de Wan2.1, descargados aparte.
- VRAM estimada para inferencia: no disponible. Como referencia de magnitudes, el checkpoint pesa 12,18 GB y los activos de Wan se descargan por separado, por lo que el consumo total supera con holgura ese tamaño; el autor no publica cifra de VRAM ni de GPU mínima. No se confirma que quepa en GPU de consumo.
- GPU recomendadas: no disponible. El único dato de hardware aportado por el autor es el uso de GH200 para entrenamiento.
- Despliegue: runtime propio de JAM (`integrations/robodojo`), entorno virtual tipo `/opt/venvs/piperx-policy`, servicio `serve.sh jam cap_pen /opt/venvs/piperx-policy 9010 127.0.0.1 0` en loopback. No es un `AutoModel` de Transformers, por lo que no se soportan directamente vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La captura de datos se hizo a 25 Hz, pero la cadencia del controlador y las convenciones de unidades/pinza quedan pendientes de confirmación por parte de la plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JAM-Wan-PiperX | No disponible (checkpoint 12,18 GB; base Wan2.2-TI2V-5B de 5B) | No disponible | Sin benchmarks; 0 ensayos reales, éxito nulo/pendiente | Apache-2.0 (modelo); MIT (codigo JAM) | HuggingFace + GitHub del autor |
| FastWAM-PiperX | No disponible | No disponible | Sin benchmarks publicados en la informacion disponible | No disponible | HuggingFace, politica pareja del mismo autor |
| Otras politicas Piper X / RoboDojo | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Validación en robot real inexistente: 0 ensayos, tasa de éxito nula/pendiente y sin resultados de leaderboard. La instalación fresca en plataforma y las pruebas extremo a extremo están sin verificar.
- Convenciones de control sin confirmar: la cadencia del controlador y las unidades/convenciones de pinza están pendientes de confirmación por la plataforma, lo que puede invalidar la ejecución directa.
- Los 240 chunks de acción por modelo son comprobaciones de interfaz/offline, no evidencia de éxito en tarea.
- Solo instrucciones en inglés (`language: en`); no se declara soporte multilingüe.
- No es un modelo de Transformers: requiere el adaptador y el runtime propios de JAM, lo que limita su portabilidad a vLLM, llama.cpp, Ollama o TGI.
- La rama de foresight solo existe en entrenamiento; cualquier uso de esa señal en inferencia no está soportado por el checkpoint publicado.
- Dependencia de activos upstream: Wan2.2, UMT5, VAE y el tokenizador de Wan2.1 se descargan de revisiones ancladas; hay que verificar `SHA256SUMS` para reproducibilidad.
- El dataset crudo de entrenamiento, los estados intermedios y los registros de contacto no se incluyen, por lo que no se puede reentrenar de forma exacta solo con este repositorio.
- Restricciones de licencia: los ficheros del modelo son Apache-2.0, pero los modelos públicos de Wan y el dataset RoboDojo conservan sus propios términos, que hay que revisar por separado para uso comercial.
- Riesgo de sesgo y alucinación: no se aporta información específica en la model card; al tratarse de una política de imitación entrenada con 540 episodios repartidos en seis tareas (90 por tarea), la cobertura es estrecha y no se documentan episodios de recuperación ante fallos.
- El servicio enlaza únicamente a loopback; el acceso al robot real requiere el protocolo oficial de la plataforma una vez confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/y0urOy/JAM-Wan-PiperX
- Política pareja FastWAM-PiperX: https://huggingface.co/y0urOy/FastWAM-PiperX
- Código fuente e instrucciones de instalación (integración RoboDojo): https://github.com/y0urOy/JAM/tree/43ec97cfd46612412da454fe3a90db6d717efb87/integrations/robodojo
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset RoboDojo: https://huggingface.co/datasets/RoboDojo-Benchmark/Robodojo
