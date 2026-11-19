# tencent/Hy-Nomas

## Resumen

Hy-Nomas es un modelo de generación de vídeo desarrollado por Tencent que se presenta como un "modelo del mundo" interactivo: en lugar de producir un clip aislado a partir de un único prompt, genera un mundo de forma continua y por segmentos, permitiendo al usuario introducir objetos, cambiar estilos y escenas, describir acciones o controlar la cámara a medida que la generación avanza. Combina un diffusion transformer (DiT) autorregresivo por segmentos con un codificador de texto Qwen, módulos de condicionamiento de cámara y un decodificador de vídeo PixelUMM, manteniendo la coherencia entre segmentos mediante una caché KV persistente.

El modelo está pensado para interacción multi-turno libre: cada segmento nuevo parte de ruido gaussiano en el espacio latente comprimido y se condiciona con el texto del segmento, la trayectoria de cámara y el historial cacheado. La configuración destilada de inferencia usa 8 pasos de eliminación de ruido y produce vídeo a 720 × 1280 y 24 FPS. Existe además una configuración específica para ejecutar el modelo en una única NVIDIA GeForce RTX 4090, con pesos DiT en INT8, caché KV en INT8, decodificador en FP8 y offload a CPU.

Su relevancia actual radica en que traslada la lógica de los modelos de lenguaje autorregresivos al vídeo generativo: contexto persistente, control incremental y evaluación específica de la consistencia a lo largo del tiempo. Tencent acompaña el modelo con Hy-Nomas-Bench, un conjunto de cuatro benchmarks con 280 casos de prueba centrados en controlabilidad interactiva y consistencia espacial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) autorregresivo por segmentos, con 54 bloques dual-stream MMDiT, atención conjunta causal por segmentos, modulación por timestep, cross-attention de cámara y caché KV persistente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en tokens; el contexto se gestiona mediante caché KV de los segmentos generados previamente |
| Tipos de cuantizacion | INT8 para pesos DiT, INT8 para caché KV, FP8 para el decodificador (configuración de una sola GPU); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 196,4 GB); librería diffusion-single-file / diffusers |

## Arquitectura y entrenamiento

Hy-Nomas realiza difusión en un espacio latente de vídeo comprimido (latentes DCAE-V) y autorregresión a través de segmentos de vídeo. Cada segmento nuevo se genera a partir de ruido gaussiano condicionado por tres vías: texto, movimiento de cámara y el historial cacheado. El bloque central es un MMDiT dual-stream con atención conjunta causal por segmentos, modulación por timestep y cross-attention específica para la cámara; la configuración de inferencia emplea 54 bloques (N = 54). El condicionamiento de texto proviene del componente de modelo de lenguaje de Qwen/Qwen2.5-VL-7B-Instruct: sus estados ocultos de 3.584 dimensiones pasan por un refinador de tokens de dos capas y se proyectan al espacio oculto de 2.048 dimensiones del DiT. Los prompts específicos por segmento permiten cambiar el contenido solicitado sobre la marcha.

La inferencia está destilada a 8 pasos de eliminación de ruido por segmento, y los latentes se decodifican con un decodificador PixelUMM afinado. En la demo web, un componente separado llamado Nomas-PE convierte las instrucciones del usuario en prompts de generación estructurados antes de llegar al modelo. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo texto-a-vídeo con interacción multi-turno libre: el usuario puede introducir objetos, cambiar estilos y escenas, y describir acciones mientras la generación continúa.
- Control de cámara: acepta trayectorias de cámara junto al texto para controlar el punto de vista y el movimiento.
- Generación continua con memoria espacial: reutiliza el contexto de segmentos anteriores mediante caché KV para extender el mismo mundo.
- Control mixto de texto y cámara de forma intercalada, según los escenarios cubiertos por Hy-Nomas-Bench.
- Inferencia destilada: 8 pasos de difusión por segmento con salida a 720 × 1280 y 24 FPS.
- Mejora de prompts en línea mediante Nomas-PE en la demo web.
- Despliegue flexible: configuración estándar con paralelismo de secuencia o configuración de una sola GPU.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Previsualización de entornos para videojuegos: un equipo de diseño puede generar un mundo de forma incremental, introduciendo edificios, vegetación o cambios de iluminación por segmentos y navegando con control de cámara para validar la dirección artística antes de producir assets definitivos.
- Prototipado de secuencias cinematográficas: con trayectorias de cámara definidas y prompts por segmento, el modelo permite construir planos continuos con movimientos de cámara concretos, útil para storyboards animados y previsualización de rodajes.
- Simulación de entornos para robótica y conducción: la generación de vídeo continuo con memoria espacial y control de cámara sirve para crear escenarios sintéticos navegables donde probar políticas de percepción y planificación.
- Creación de contenido interactivo para demos web: la demo oficial y la configuración de una sola RTX 4090 permiten desplegar experiencias donde el usuario guía el mundo en tiempo real mediante texto y teclado, por ejemplo instalaciones artísticas o prototipos de experiencias inmersivas.
- Evaluación de modelos de mundo: Hy-Nomas-Bench, con 280 casos y cuatro suites, permite medir controlabilidad interactiva y consistencia de otros sistemas de generación de vídeo interactiva, usando sus prompts estructurados, secuencias de interacción, líneas de tiempo de teclado y trayectorias de referencia.
- Investigación en generación autorregresiva de vídeo: la combinación de DiT por segmentos, caché KV persistente y destilación a 8 pasos ofrece una base reproducible para estudiar memoria a largo plazo y consistencia temporal en modelos generativos.
- Generación de material audiovisual para publicidad: cambios de estilo y escena por segmento permiten producir variaciones de un mismo entorno sin regenerar el mundo desde cero, manteniendo coherencia entre tomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente anuncia la existencia de Hy-Nomas-Bench (cuatro suites, 280 casos de prueba sobre interacción multi-turno, navegación de cámara, control intercalado de texto y cámara, y memoria espacial), pero no incluye cifras de rendimiento del modelo en dichas pruebas ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- Configuración estándar: pensada para despliegue con paralelismo de secuencia; el repositorio ocupa 196,4 GB, por lo que se requiere almacenamiento amplio y, presumiblemente, múltiples GPU de datacenter. El número exacto de GPU y la VRAM por GPU no están disponibles en la información proporcionada.
- Configuración de una sola GPU: soportada oficialmente en una NVIDIA GeForce RTX 4090, usando pesos DiT en INT8, caché KV en INT8, decodificador en FP8 y offload a CPU. La VRAM resultante no se especifica, pero el offload implica que parte de los pesos reside en memoria del sistema.
- GPU recomendadas: RTX 4090 para la configuración de una sola GPU; para la configuración estándar no se detallan modelos concretos (A100, H100 u otros) en la información disponible.
- Opciones de despliegue: la librería declarada es diffusion-single-file (compatible con diffusers); se menciona la demo web oficial como vía de interacción. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Solo se conoce la configuración de inferencia (8 pasos de difusión por segmento, 720 × 1280 a 24 FPS), sin cifras de tiempo por segmento ni de rendimiento agregado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de generación de vídeo interactiva ni cifras de rendimiento que permitan una comparación rigurosa de parámetros, contexto o licencia.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la información disponible; al ser un generador de vídeo entrenado con datos no especificados, es previsible que reproduzca sesgos presentes en esos datos, pero no hay evidencia publicada al respecto.
- Riesgo de alucinación visual: como modelo generativo, puede producir contenido incoherente con las instrucciones o inconsistencias entre segmentos, especialmente en interacciones largas; la propia existencia de Hy-Nomas-Bench sugiere que la consistencia continua es un reto abierto.
- Idiomas soportados no disponibles: aunque el codificador de texto es Qwen2.5-VL-7B-Instruct, no se especifica qué idiomas funcionan correctamente en los prompts.
- Longitud de contexto no cuantificada: la memoria depende de la caché KV de segmentos previos, pero no se indica cuántos segmentos puede mantener antes de degradarse la coherencia.
- Requisitos de hardware elevados: el repositorio de 196,4 GB y la configuración estándar con paralelismo de secuencia implican infraestructura de datacenter; solo la configuración INT8/FP8 con offload cabe en una RTX 4090, con la penalización de rendimiento que supone el offload a CPU.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero conviene revisar el archivo LICENSE del repositorio y las licencias de los componentes de terceros (Qwen2.5-VL-7B-Instruct, PixelUMM), que pueden tener condiciones propias.
- El contenido citado de la model card se interrumpe en la descripción de Nomas-PE, por lo que pueden existir detalles adicionales de arquitectura y entrenamiento no recogidos aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-Nomas
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-Nomas
- Informe técnico (arXiv): https://arxiv.org/abs/2610.36729
- Dataset de benchmark Hy-Nomas-Bench: https://huggingface.co/datasets/tencent/Hy-Nomas-Bench
- Sitio web del proyecto y demo: https://hy-nomas.hy.tencent.com/
- Publicación en X de Tencent Hunyuan: https://x.com/TencentHunyuan/status/2113676827114053892
- Model card en chino: https://huggingface.co/tencent/Hy-Nomas/blob/main/README_CN.md
- Licencia: https://huggingface.co/tencent/Hy-Nomas/blob/main/LICENSE
