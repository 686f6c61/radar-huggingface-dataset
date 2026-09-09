# Travor278/pi05-piperx-put-cube-in-drawer-87ep-20k

## Resumen

El modelo Travor278/pi05-piperx-put-cube-in-drawer-87ep-20k es un ajuste fino completo del modelo PI0.5, un sistema de política de visión–lenguaje–acción (VLA) para robótica, desarrollado sobre el framework LeRobot de Hugging Face por el autor Travor278. El checkpoint se ha optimizado para la tarea de poner un cubo en un cajón («put cube in drawer»), a partir de un dataset de 87 episodios y 54.463 fotogramas capturados con tres cámaras RGB. Con 4.143.404.816 parámetros (4.14 mil millones), el modelo se presenta en formato safetensors y se ha entrenado en 8 H100 en FP32 con batch global de 16. Su relevancia radica en ser un ejemplo de transferencia de un modelo VLA base a una tarea robótica concreta mediante fine-tuning completo, sin usar LoRA ni congelar codificadores.

Según la documentación del autor, los siete archivos de checkpoint originales se conservan byte a byte y el modelo requiere código personalizado de LeRobot 0.6 y transformers 5.3.0 para cargarse correctamente. El entrenamiento finalizó en el paso 20.000 con una loss de selección de 0,005404. No se han publicado especificaciones de licencia, idiomas ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible explícitamente; modelo VLA de la familia PI0.5 basado en tokenizer PaliGemma |
| Parametros totales | 4.143.404.816 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; pesos distribuidos en FP32 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (seven checkpoint files with SHA256 manifest) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del modelo base PI0.5 (hash b211f3d44c36), sobre la fuente 1b8278b8fa8aa1e7c5430d3aa022102a646fbbc5. La arquitectura subyacente es un transformer de visión–lenguaje–acción (VLA) que procesa tres entradas de cámara RGB junto con la instrucción de lenguaje, y genera acciones de robot. La model card confirma el uso de un tokenizer PaliGemma y del framework LeRobot 0.6 con transformers 5.3.0. No se aplicó LoRA ni se congelaron los codificadores durante el entrenamiento, y tampoco se usó idle mask.

El dataset de entrenamiento procede de Travor278/piperx-put-cube-in-drawer-20260908-87ep (87 episodios, 54.463 fotogramas, tres cámaras RGB, estado/acción de 14 dimensiones y horizonte de 50). El entrenamiento se realizó en 8 GPUs H100 en FP32 con batch global de 16 y semilla 1000, hasta el paso 20.000. Los cuantiles de acción y estado se recalcularon sobre todos los fotogramas. El log final indica una loss de selección de 0,005404. El checkpoint incluye siete archivos de pesos locales, con un manifiesto SHA256 para verificar su integridad.

## Capacidades

- Ejecución de políticas de manipulación robótica: el modelo genera acciones de robot de 14 dimensiones a partir de observaciones de tres cámaras RGB y una instrucción de lenguaje.
- Seguimiento de instrucciones simples de lenguaje: prompt por defecto «put cube in drawer» para la tarea objetivo.
- Predicción de secuencias de acciones con horizonte de 50 pasos, lo que permite planificar movimientos a medio plazo en una sola inferencia.
- Integración con el ecosistema LeRobot: el checkpoint está pensado para cargarse con la biblioteca LeRobot 0.6 y transformadores 5.3.0.
- Posible robustez visual gracias al entrenamiento con tres cámaras RGB, aunque no se han publicado evaluaciones al respecto.
- No se han documentado capacidades de chat, tool calling o generación de texto general en la información disponible.

## Casos de uso

- Automatización de recogida y colocación en robótica industrial: integrar el modelo en un brazo robótico para que coloque cubos u objetos similares en cajones en una línea de ensamblaje, aprovechando la predicción de acciones de 50 pasos.
- Aprendizaje por demostración en laboratorios de robótica: usar el checkpoint como punto de partida para transferir la habilidad a otras tareas de manipulación mediante fine-tuning con datasets cortos, gracias a su arquitectura VLA.
- Investigación en políticas VLA: el modelo sirve como referencia para comparar estrategias de fine-tuning completo frente a LoRA o codificadores congelados en tareas de manipulación.
- Plataformas educativas de robótica: implementar el modelo en simuladores o robots de bajo coste para enseñar control de robots basado en visión, usando la librería LeRobot.
- Automatización doméstica o asistencial: adaptar el modelo para que un robot ayude a guardar objetos en cajones, por ejemplo en entornos de cocina o almacenamiento, siempre que se reentre con datos del entorno.
- Desarrollo de sistemas de manipulación con múltiples cámaras: usar el modelo en configuraciones con tres sensores RGB para explotar redundancia visual y mejorar la robustez frente a oclusiones.
- Benchmark de generalización: evaluar el comportamiento del modelo con objetos o cajones ligeramente distintos a los del dataset, para medir cuánto se generaliza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la loss de selección de 0,005404 obtenida al paso 20.000, pero no es comparable con benchmarks estándar de modelos de lenguaje o visión.

## Requisitos de hardware

- Los pesos FP32 del modelo ocupan aproximadamente 16,6 GB de VRAM (4.143.404.816 parámetros × 4 bytes), sin contar las activaciones.
- Para inferencia en una sola GPU se recomienda al menos 20 GB de VRAM para la versión FP32, por ejemplo una NVIDIA A100 de 40 GB, H100 de 80 GB o RTX 4090 de 24 GB, verificando en cada caso el consumo de memoria de las tres imágenes de entrada.
- El entrenamiento se realizó en 8 GPUs H100 en FP32, por lo que reproducir el fine-tuning completo requiere un clúster de características similares.
- No hay cuantizaciones publicadas; para GPUs de consumo más modestas sería necesario cuantizar manualmente los pesos a FP16/BF16 o a 8 bits, sin garantías de compatibilidad.
- El despliegue está orientado a LeRobot 0.6 y transformers 5.3.0; no se han documentado integraciones con vLLM, TGI o llama.cpp, que no resultan adecuados para este tipo de modelo VLA.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar formalmente este modelo con alternativas de la misma categoría. El autor ha publicado otros checkpoints de la misma familia PI0.5 (Travor278/pi05-piperx-full558-hil-acp-r1 y Travor278/pi05-piperx-full558-hil-acp-20k-r1), que probablemente sean fine-tunings para otras tareas, pero no se han proporcionado sus especificaciones en los datos obtenidos.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (poner un cubo en un cajón) y se entrenó sobre un dataset de 87 episodios y 54.463 fotogramas, por lo que su capacidad de generalización a otras tareas es muy limitada.
- No se especifica licencia, por lo que el uso comercial puede estar restringido o requerir contacto con el autor.
- La model card indica que el checkpoint está destinado a una entrega a Dell y que las rutas internas (/inspire) no deben usarse; se necesita sobrescribir manualmente la configuración del tokenizer y del dispositivo de destino. Esto dificulta el uso fuera del entorno original.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que el comportamiento en entornos no controlados es desconocido.
- El autor recomienda usar código personalizado de LeRobot 0.6 y transformers 5.3.0, que puede no estar disponible públicamente y podría causar incompatibilidades con versiones más recientes.
- Al ser un modelo que genera acciones en bucle cerrado, existe riesgo de que ejecute movimientos no deseados si las observaciones contienen anomalías; se debe usar en entornos con supervisión y con límites de seguridad definidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Travor278/pi05-piperx-put-cube-in-drawer-87ep-20k
- Otro checkpoint del mismo autor: https://huggingface.co/Travor278/pi05-piperx-full558-hil-acp-r1
- Otro checkpoint del mismo autor: https://huggingface.co/Travor278/pi05-piperx-full558-hil-acp-20k-r1
