# SXY7/H8-Food-NoHistory-Progress

## Resumen

H8-Food-NoHistory-Progress es un artefacto de investigación publicado por el usuario SXY7 en Hugging Face. Consiste en una política robótica congelada H8 Food, entrenada hasta 150.000 actualizaciones de política, empaquetada junto con tres cabezas MLP de estimación de progreso entrenadas sobre la ruta de inferencia con historial desactivado (`use_history=False`). No se trata de un modelo de lenguaje al uso, sino de un bundle de visión-lenguaje-acción (VLA) orientado a robótica de manipulación en tareas de cocina.

El componente central es una política H8 congelada cuyo backbone se apoya en recursos PRISM y pesos Qwen2.5, DINOv2 y SigLIP a 224 píxeles, con un adaptador H-Adapter-8. Sobre las características de esa política se entrenaron tres MLP independientes que estiman el progreso de ejecución de una tarea de tres etapas: llevar la zanahoria al plato, el panecillo al cuenco y la batata al plato. La contribución declarada es un estudio de ablación: comparar la estimación de progreso cuando se desactiva la ruta explícita de historial frente a la variante con historial.

El modelo tiene un interés limitado fuera de su contexto experimental. El repositorio pesa 14,2 GB, no declara licencia, no registra descargas ni interacciones, y su propia model card advierte de que no es un servicio robótico autónomo ni un modelo cargable con `AutoModel.from_pretrained`. Está pensado para reproducir una comparación concreta de investigación, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) H8 con backbone PRISM (Qwen2.5 + DINOv2 + SigLIP a 224 px) y cabezas MLP de progreso |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (bundle de componentes: checkpoint nativo H8 + MLP seleccionado, más `code/H-Adapter-8.tar.gz` y caché Hugging Face) |

## Arquitectura y entrenamiento

La política nativa H8 se entrenó sobre 100 demostraciones de la tarea Food y se congeló a las 150.000 actualizaciones de política. El backbone se reconstruye con recursos PRISM y pesos Qwen2.5, DINOv2 y SigLIP a 224 píxeles, junto con el árbol de compatibilidad H-Adapter-8. Sobre las características de esa política congelada, en la ruta `use_history=False`, se entrenaron tres MLP con arquitectura `896 → 256 → 64 → 2`, activación ReLU en las capas ocultas, una salida sigmoide de valor de etapa y un logit de finalización de etapa. La entrada de cada MLP es la media de los primeros ocho tokens de la salida del decodificador de acciones H12, antes de `action_output`, manteniendo la condicionamiento de observación actual, lenguaje y estado, pero desactivando la ruta explícita de historial.

La cabeza seleccionada es la de semilla 1, actualización 7.500, identificada como `seed1/no_history/checkpoint-007500` en el registro de selección basado en validación. El progreso global se calcula como `C + value[C]` cuando `C < 3`, y como `3` en caso contrario, donde `C` es el prefijo de etapas completadas predicho con umbral de finalización 0,5. Las predicciones no se fuerzan a ser monótonas crecientes y no consumen etiquetas de etapa reales ni tiempo normalizado como entrada. Los splits de lectura son 70/15/15 episodios (entrenamiento/validación/prueba), y la validación seleccionó las cabezas. No se documentan detalles sobre RLHF, DPO ni composición exacta del dataset más allá de las 100 demostraciones Food.

## Capacidades

- Estimación de progreso de tareas de manipulación robótica estructuradas en tres etapas (zanahoria al plato, panecillo al cuenco, batata al plato).
- Condicionamiento multimodal: observación visual actual, instrucción en lenguaje y estado del robot.
- Predicción de valor de etapa y logit de finalización de etapa mediante cabezas MLP independientes.
- Inferencia en ruta sin historial explícito (`use_history=False`), manteniendo el condicionamiento de observación, lenguaje y estado.
- Soporte de idiomas inglés y chino en las etiquetas y documentación del repositorio.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento de texto general: es una política VLA especializada.
- No incluye drivers de robot ni servicio autónomo; requiere integración mediante la API de componentes con `expected_route="no_history"`.

## Casos de uso

- Estudio de ablación en investigación: comparar la estimación de progreso con y sin ruta de historial sobre las mismas trayectorias observadas, usando el bundle como referencia reproducible del lado `no_history`.
- Reproducción de resultados experimentales: cargar el bundle con `load_joint_models` y `expected_route="no_history"` para validar la selección de la cabeza `seed1/no_history/checkpoint-007500` sobre el split de validación 15 % de episodios.
- Evaluación de estimadores de progreso en robótica de cocina: usar las tres MLP para puntuar el avance de una política H8 congelada en las tres etapas definidas, sin depender de etiquetas de etapa reales en inferencia.
- Integración en pipelines de investigación de VLA: emplear `extract_features.py` y `probe.py` para extraer características del backbone congelado y aplicar `load_probe` y `stage_coordinate` en experimentos controlados.
- Análisis de robustez de cabezas ligeras: aprovechar la arquitectura `896 → 256 → 64 → 2` y los buffers de normalización almacenados para estudiar el efecto del condicionamiento sin historial en tareas de manipulación.
- Docencia y divulgación técnica: ilustrar cómo se acopla un backbone VLA congelado con cabezas de progreso entrenadas por separado, incluyendo la selección por validación y el formato de bundle por componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 14,2 GB e incluye pesos nativos, MLP, recursos PRISM y caché de modelos; el requisito real depende de la reconstrucción del backbone Qwen2.5/DINOv2/SigLIP y del adaptador H-Adapter-8.
- GPU recomendadas: no disponible. No se documentan GPU concretas (A100, H100, RTX 4090 u otras).
- ¿Cabe en GPU de consumo? No disponible. No se confirma que quepa en ninguna GPU consumer concreta.
- Opciones de despliegue: no se soporta `AutoModel.from_pretrained`. La carga debe hacerse con `load_joint_models` en `code/H-Adapter-8/ops/food_value_probe_20261107/bundle.py` con `expected_route="no_history"`, usando `h8_override` para apuntar al checkpoint nativo descargado. Requiere mantener el layout PRISM bajo `code/models/` y la caché con directorios `hub/` y `transformers/` separados, con `HF_HUB_OFFLINE=1` y `TRANSFORMERS_OFFLINE=1`.
- Latencia y throughput estimados: no disponible.
- No se incluyen drivers de robot; el bundle no es un servicio robótico autónomo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados ni especificaciones de modelos comparables de la misma categoría (políticas VLA con estimación de progreso en robótica de cocina).

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- El backbone H8 original se entrenó con las 100 demostraciones Food, por lo que los episodios de lectura retenidos no son necesariamente no vistos por la política; esto limita las conclusiones de generalización.
- Las comparaciones sobre datos grabados evalúan las mismas trayectorias observadas, no ejecuciones en bucle cerrado independientes de cada método.
- Las predicciones de progreso no se fuerzan a ser monótonas crecientes, lo que puede producir retrocesos en la curva estimada.
- Una curva de progreso de referencia requiere las anotaciones de esa trayectoria concreta.
- El bundle no es directamente cargable con `AutoModel.from_pretrained`; requiere el loader y el layout de caché documentados.
- Los scripts de lanzamiento históricos pueden contener rutas de la máquina de origen y no son comandos portables.
- El archivo fuente no es un entorno Python: las dependencias compatibles deben instalarse por separado.
- No incluye drivers de robot ni convierte el runtime en un servicio independiente sin historial; debe usarse la API de componentes con enrutamiento explícito.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser una política robótica especializada, el riesgo relevante es de error de estimación de etapa, no de generación de texto.
- Idiomas limitados a inglés y chino en la documentación y etiquetas.

## Enlaces

- Hugging Face: https://huggingface.co/SXY7/H8-Food-NoHistory-Progress
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
