# SXY7/H8-Food-Progress

## Resumen

H8 Food Progress es un checkpoint de investigación para robótica que combina una política visión-lenguaje-acción (VLA) congelada, denominada H8, con tres cabezas MLP específicas de etapa entrenadas para estimar el progreso de una tarea de manipulación de alimentos. Lo desarrolla el usuario SXY7 y se publica en Hugging Face bajo el pipeline `robotics`. No es un modelo de lenguaje al uso: es un artefacto de inferencia robótica que produce acciones de brazo y, en la misma pasada, predicciones de progreso por etapa.

La tarea concreta es una secuencia de tres etapas: llevar una zanahoria al plato, un panecillo al cuenco y una batata al plato. El backbone H8, que incluye el VLM, el historial de eventos y la cabeza de acción, permanece congelado en 150.000 actualizaciones de política; solo se entrenan los tres MLP de progreso, y el checkpoint seleccionado corresponde a la actualización 6.500 de una ejecución con cabeza inicializada desde cero (seed 1). El resultado es un único fichero PyTorch personalizado de 4,8 GB que embebe pesos, configuración, procesador/tokenizer y estadísticas de normalización.

Su relevancia es acotada pero técnica: documenta un enfoque de estimación de progreso aprendida sobre una política VLA congelada, con procedencia y metadatos de selección incluidos. No es un modelo cargable con `AutoModel.from_pretrained` ni un paquete listo para producción; requiere el árbol de código y dependencias compatibles del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política VLA H8 (VLM + historial de eventos + cabeza de acción) con tres MLP de progreso acoplados; MLP `896 → 256 → 64 → 2` con ReLU y salida sigmoide |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint PyTorch personalizado, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoint PyTorch personalizado `joint-update-006500.pt`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema se compone de un backbone H8 congelado tras 150.000 actualizaciones de política, que integra un VLM, un módulo de historial de eventos y una cabeza de acción. Sobre ese backbone se entrenan tres MLP de progreso, uno por etapa. Cada MLP tiene la forma `896 → 256 → 64 → 2`, con capas ocultas ReLU, un valor de etapa con activación sigmoide y un logit de finalización de etapa. La entrada de 896 dimensiones no es una capa oculta cruda del VLM: es la media de los primeros ocho tokens de la salida del decodificador de acción H12, antes de `action_output`, tras la fusión de historial. Las entradas se normalizan con la media y escala almacenadas del conjunto de entrenamiento.

El entrenamiento de los MLP se realizó con el backbone completamente congelado, en una ejecución identificada como `history_scratch_seed1_gpu1_bs8ga2_lr1e3_max10000_20261108`, con batch size 8 y acumulación de gradiente 2, learning rate 1e-3 y un máximo de 10.000 pasos. El checkpoint elegido es el paso 6.500. La partición del readout es 70/15/15 episodios. El H8 original se entrenó con 100 demostraciones de la tarea Food. El progreso global se calcula como `C + value[C]` si `C < 3`, y 3 en caso contrario, donde `C` es el prefijo de etapas completadas predicho con probabilidad de finalización ≥ 0,5. No se aplica monotonicidad forzada a las predicciones. Los valores siguen las etiquetas de valor de etapa descontado compartidas del dominio Food; se trata de un readout de progreso aprendido, no de una función de valor RL nativa.

## Capacidades

- Generación de acciones de brazo derecho de siete dimensiones a partir de entradas RGB de cámara superior y muñeca derecha, estado del brazo y recibos de acciones ejecutadas.
- Estimación de progreso por etapa y de progreso global en una única pasada de aplicación, junto con la acción.
- Predicción de finalización de etapa mediante logits y umbral de 0,5.
- Fusión de historial de eventos para condicionar la predicción al contexto de la ejecución.
- Soporte de dos idiomas en la documentación y metadatos: inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni otras capacidades generales de lenguaje.

## Casos de uso

- Monitorización de progreso en manipulación de alimentos: el modelo produce, junto a cada acción, una estimación de etapa completada y progreso global, lo que permite registrar curvas de avance durante una ejecución real de la tarea zanahoria-panecillo-batata.
- Investigación en estimación de progreso sobre políticas congeladas: sirve como referencia para comparar readouts de progreso entrenados sobre un backbone VLA fijo, con partición de episodios 70/15/15 documentada.
- Replay y análisis offline de datos grabados: el wrapper `UnifiedFoodWithProgress` registra progreso para graficar sobre trayectorias ya capturadas, útil para auditar la coherencia del readout antes de desplegar hardware.
- Evaluación de cabezas auxiliares en VLA: al mantener H8 congelado, permite aislar el efecto del diseño de la cabeza MLP (dimensión 896, profundidad, normalización) sin reentrenar el backbone.
- Prototipado de señal de recompensa o terminación: el progreso estimado y el logit de finalización de etapa pueden emplearse como señal auxiliar en pipelines de investigación que ya dispongan del entorno H8 y sus dependencias.
- Reproducción de procedencia: el checkpoint retiene estado de entrenamiento y metadatos de selección, lo que facilita replicar la elección del paso 6.500 y auditar la ejecución seed 1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona resultados de replay sobre datos grabados de robot real, pero no proporciona cifras numéricas ni comparaciones, y advierte que esos replays no constituyen ensayos cerrados en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 4,8 GB, pero el checkpoint embebe pesos del VLM, base, LoRA, carrier, política de acción y MLP, además de configuración y assets del procesador; la huella en memoria no se documenta.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `load_joint_checkpoint` en `code/H-Adapter-8/ops/food_value_probe_20261107/unified_food_checkpoint.py` y `UnifiedFoodWithProgress.from_checkpoint` en `unified_food_runtime.py`. No es compatible con `AutoModel.from_pretrained`, ni se documentan vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Requisitos adicionales: proceso nuevo, árbol de compatibilidad H8/Transformers correspondiente, `PYTHONPATH` configurado y directorio de trabajo escribible. Los drivers de hardware robótico no están incluidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA con estimación de progreso) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no hay autorización explícita para uso comercial; debe tratarse como no apto para producción hasta aclarar los términos.
- No es un modelo cargable de forma estándar: requiere código fuente, dependencias Python/CUDA compatibles y un árbol de bootstrap específico; el archivo de código es un tar.gz, no un entorno instalado.
- Los resultados de replay proceden de datos grabados en robot real y no equivalen a ensayos cerrados nuevos; no hay evidencia publicada de robustez en ejecución cerrada.
- Las predicciones de progreso no son monótonas por diseño, lo que puede producir retrocesos en la curva estimada.
- Las curvas de referencia requieren las anotaciones de finalización de la trayectoria correspondiente; el porcentaje de tiempo transcurrido se calcula a posteriori, al terminar el episodio.
- Las entradas en tiempo de ejecución no incluyen etiquetas de etapa, observaciones futuras ni duración total del episodio.
- Los scripts históricos pueden contener rutas de la máquina de origen y no son portables; los metadatos conservan rutas absolutas que identifican la ejecución fuente, no directorios a recrear.
- El modelo está especializado en una única tarea de tres etapas del dominio Food; no se documenta generalización a otras tareas, objetos o entornos.
- Idiomas limitados a en y zh en documentación y metadatos; no se documentan capacidades multilingües generales.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- Descargas y likes nulos en el momento de la consulta: sin validación comunitaria ni reportes independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SXY7/H8-Food-Progress
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
