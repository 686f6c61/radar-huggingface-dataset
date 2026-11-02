# x-square-robot/wall-oss-1.0-lite-robodojo-base

## Resumen

Wall-OSS-1.0-lite — RoboDojo base es un modelo de vision-lenguaje-accion (VLA) para robótica desarrollado por x-square-robot. Se trata del checkpoint preentrenado desde el que arranca el entrenamiento RoboDojo, publicado como preview de la versión Wall-OSS-1.0-lite definitiva: según el autor, ambas versiones difieren principalmente en el número de iteraciones de entrenamiento, por lo que este checkpoint no es idéntico al modelo final. El modelo tiene 5.323.759.872 parámetros en bf16 y se distribuye con licencia Apache 2.0.

La arquitectura se apoya en Qwen3.5-4B como base de lenguaje y visión: el tokenizer y la plantilla de chat son los de `Qwen/Qwen3.5-4B`. El pipeline declarado es `robotics`, con la librería `wall-x` como framework de carga. El repositorio ocupa 21,3 GB e incluye, además de los pesos, los ficheros de normalización de acciones y estados (`normalizer_action.pth`, `normalizer_propri.pth`) y la configuración del procesador de imagen, lo que indica que el modelo está pensado para consumir observaciones visuales y estado propioceptivo del robot y emitir acciones.

Es relevante ahora porque los modelos VLA open source con licencia permisiva siguen siendo escasos: la mayoría de checkpoints robóticos publicados son de investigación y con licencias restrictivas. Este modelo ofrece una base Apache 2.0 sobre una arquitectura conocida (Qwen3.5-4B) para quienes quieran hacer fine-tuning sobre RoboDojo o adaptar el modelo a su propio hardware robótico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre base Qwen3.5-4B; detalles internos de capas no disponibles |
| Parametros totales | 5.323.759.872 (bf16) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `normalizer_action.pth`, `normalizer_propri.pth` |
| Libreria / framework | `wall-x` |
| Pipeline | robotics |
| Tamano del repo | 21,3 GB |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un backbone de lenguaje y visión basado en Qwen3.5-4B (tokenizer y chat template heredados de `Qwen/Qwen3.5-4B`) con una cabeza de predicción de acciones. Los ficheros `normalizer_action.pth` y `normalizer_propri.pth` contienen las estadísticas de normalización de acciones y de estado propioceptivo, lo que confirma que la entrada del modelo incluye observaciones visuales y estado del robot, y la salida es un vector de acción normalizado. La configuración exacta de capas, atención y fusión multimodal no está detallada en la información disponible.

Respecto al entrenamiento, el autor indica que este checkpoint es el punto de partida del entrenamiento RoboDojo y que difiere de la versión final Wall-OSS-1.0-lite principalmente en el número de iteraciones. No se especifican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Percepción visual y comprensión de lenguaje: al heredar el backbone Qwen3.5-4B, el modelo procesa instrucciones en lenguaje natural e imágenes como entrada.
- Predicción de acciones robóticas: salida de vectores de acción normalizados, con estadísticas de normalización incluidas en el repo.
- Integración de estado propioceptivo: consumo de estado del robot vía `normalizer_propri.pth`.
- Condicionamiento por instrucciones: la plantilla de chat de Qwen3.5-4B permite formular tareas en lenguaje natural.
- Fine-tuning sobre RoboDojo: diseñado explícitamente como base para entrenamiento posterior.
- Tool calling, agentes multi-paso, matemáticas, código o audio: no disponible (no se documenta ninguna de estas capacidades).

## Casos de uso

- Fine-tuning sobre RoboDojo: usar este checkpoint como inicialización para el pipeline de entrenamiento RoboDojo, aprovechando que el autor lo publica precisamente como punto de partida y que incluye las estadísticas de normalización necesarias para reproducir el preprocesado.
- Adaptación a un robot propio: partir de los pesos bf16 y reentrenar la cabeza de acciones con datos propios, sustituyendo los ficheros de normalización por las estadísticas del nuevo hardware.
- Manipulación guiada por lenguaje: emplear el modelo para tareas de manipulación donde se da una instrucción en lenguaje natural junto con la imagen de la escena, y el modelo emite la acción correspondiente.
- Investigación en VLA: servir como baseline Apache 2.0 para comparar arquitecturas o estrategias de entrenamiento en tareas de robótica, sin las restricciones de licencia de otros checkpoints de investigación.
- Evaluación de políticas preentrenadas: desplegar el modelo en simulación (por ejemplo, entornos compatibles con el formato de acciones normalizadas) para medir su comportamiento antes de invertir en fine-tuning.
- Prototipado de demos robóticas: al ser un modelo de 5,3 mil millones de parámetros en bf16, puede ejecutarse en una GPU de gama alta para demostraciones de laboratorio con latencia aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 10,6 GB solo para pesos (5,32 mil millones de parámetros × 2 bytes), más el overhead del procesador de imagen, el estado propioceptivo y los buffers de activaciones; en la práctica, se recomienda reservar al menos 16 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; GPUs con 16 GB podrían ser suficientes con cuantización, aunque no se documentan formatos cuantizados.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización no publicada.
- Opciones de despliegue: la librería declarada es `wall-x`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al ser un modelo de acciones robóticas es poco probable que estos motores de texto estándar lo soporten sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Wall-OSS-1.0-lite — RoboDojo base | 5,32 B | no disponible | Apache 2.0 | VLA robótico sobre Qwen3.5-4B |
| OpenVLA | 7 B | no disponible en esta ficha | MIT (según versión) | VLA sobre Llama-2 / Prismatic |
| RT-2 (no open weights) | no disponible | no disponible | propietaria | VLA de Google DeepMind |
| Qwen3.5-4B (base de lenguaje) | ~4 B | no disponible en esta ficha | según release de Qwen | LLM multimodal sin cabeza de acciones |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este checkpoint ni datos de rendimiento de los alternativos en la información disponible. La ventaja diferencial de este modelo frente a alternativas es la combinación de licencia Apache 2.0 y base Qwen3.5, frente a licencias más restrictivas en otros VLA de investigación.

## Limitaciones y advertencias

- Es un preview, no la versión final: el autor advierte explícitamente que difiere de Wall-OSS-1.0-lite en el número de iteraciones de entrenamiento; no debe tratarse como el modelo publicado definitivo.
- Sin benchmarks: no hay métricas de éxito en tareas de manipulación ni comparaciones publicadas, por lo que su rendimiento real es desconocido.
- Sin documentación de sesgos: no se detallan sesgos conocidos, pero al heredar un backbone de lenguaje y visión, es esperable que arrastre los sesgos del modelo base.
- Riesgo de alucinación en la interpretación de instrucciones: como todo VLA basado en LLM, puede generar acciones incoherentes ante instrucciones ambiguas o escenas fuera de distribución.
- Idiomas no declarados: no se especifica qué idiomas soporta; la plantilla de chat es la de Qwen3.5-4B, pero no hay garantía de comportamiento multilingüe en la salida de acciones.
- Dependencia de los ficheros de normalización: usar los pesos sin las estadísticas correctas de acción y estado produce salidas inválidas; al adaptar a otro robot hay que recalcularlas.
- Soporte de herramientas limitado: no se documenta compatibilidad con motores de inferencia estándar (vLLM, TGI, llama.cpp), lo que complica el despliegue en producción.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las obligaciones de atribución y las licencias del modelo base Qwen3.5-4B del que hereda tokenizer y plantilla.

## Enlaces

- HuggingFace: https://huggingface.co/x-square-robot/wall-oss-1.0-lite-robodojo-base
- Modelo base del tokenizer y chat template: https://huggingface.co/Qwen/Qwen3.5-4B
