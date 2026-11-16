# xzz789/smolvla-robotwin20-adamw-b1024

## Resumen

SmolVLA RoboTwin20 AdamW es un modelo de política robótica (vision-language-action, VLA) obtenido mediante ajuste fino del modelo base SmolVLA sobre 20 tareas del conjunto de datos RoboTwin20. Lo publica el usuario xzz789 en Hugging Face y su propósito es generar secuencias de acciones articulares a partir de observaciones visuales multimodales y una instrucción en lenguaje natural. El modelo tiene aproximadamente 450 millones de parámetros totales, de los cuales solo se han entrenado unos 99,85 millones correspondientes al módulo experto en acciones.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero interacciones en el momento de la consulta, sin model card en castellano ni licencia declarada. No es un modelo de lenguaje generalista, sino un componente de control robótico que consume tres cámaras, un vector de estado articular de 14 dimensiones y texto, y produce una trayectoria de 50 pasos con 14 dimensiones por paso.

La información disponible procede exclusivamente de la model card del autor y de los metadatos del repositorio. No hay resultados de benchmarks, no hay licencia especificada y no se documentan idiomas soportados. Cualquier evaluación de rendimiento real requeriría reproducir el entorno RoboTwin20 con las versiones de software indicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; transformer con experto en acciones separado |
| Parametros totales | ~450 millones |
| Parametros activos | ~99,85 millones entrenados (módulo experto en acciones); no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto; el idioma de entrenamiento no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, un archivo por checkpoint) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual, un codificador de lenguaje y un experto en acciones. En este ajuste fino solo se entrena el experto en acciones (~99,85 M parámetros), manteniendo congelado el resto del modelo base. La entrada son tres flujos de cámara, un estado articular de 14 dimensiones y una instrucción textual; la salida es un chunk de 50 acciones consecutivas de 14 dimensiones cada una, lo que corresponde a un esquema de action chunking típico en políticas de imitación.

El entrenamiento se realizó sobre el dataset `hxma/RoboTwin-LeRobot-v3.0`, seleccionando 20 tareas. Se usó AdamW con β=(0,9, 0,95), weight decay 1e-10, batch size 1024 (512 en el último paso), 27.563 actualizaciones y un total acumulado de 28.224.000 muestras con remuestreo. El learning rate tuvo un pico de 1e-4 con 62 pasos de calentamiento y decaimiento coseno hasta 2,5e-6; gradiente clipping de 10, precisión FP32 con TF32 habilitado para matmul y semilla 42. Se guardaron checkpoints en los pasos 0, 5000, 10000, 15000, 20000, 25000 y 27563. El stack declarado es Python 3.12.11, PyTorch 2.8.0+cu128, LeRobot 0.6.1, Transformers 5.5.4 y SwanLab 0.10.5.

## Capacidades

- Generación de acciones robóticas continuas: produce chunks de 50 pasos × 14 dimensiones articulares a partir de observaciones.
- Fusión multimodal: integra tres cámaras simultáneas, estado propioceptivo (14 dims) y una instrucción textual de tarea.
- Condicionamiento por lenguaje natural: la tarea se especifica mediante texto, lo que permite reutilizar el mismo modelo para distintas instrucciones dentro del repertorio entrenado.
- Ejecución de tareas de manipulación del benchmark RoboTwin20 (20 tareas seleccionadas).
- No dispone de tool calling, function calling ni capacidades de agente multi-paso en el sentido de los LLM.
- No se documentan capacidades de razonamiento simbólico, matemáticas, código ni visión generalista más allá del uso como entrada de política.
- Capacidades multilingües: no disponibles; el idioma de las instrucciones de entrenamiento no se especifica.

## Casos de uso

- Investigación en políticas de imitación: reproducir el ajuste fino sobre RoboTwin20 para comparar variantes de optimizador (AdamW frente a otras configuraciones) manteniendo el mismo dataset y esquema de action chunking.
- Control de manipuladores de 14 grados de libertad en simulación: el modelo emite directamente comandos articulares de 14 dimensiones, adecuado para brazos bimanuales o manos con dedos en entornos RoboTwin.
- Evaluación de robustez multimodal: al recibir tres cámaras, permite estudiar cómo afecta la oclusión o el cambio de punto de vista a la política entrenada.
- Baseline para comparativas de VLA compactos: con ~450 M parámetros totales y ~100 M entrenados, sirve como referencia de bajo coste frente a VLA de mayor tamaño.
- Prototipado de pipelines LeRobot: al estar entrenado con LeRobot 0.6.1, se integra en flujos de entrenamiento y evaluación de dicha librería.
- Estudio de checkpoints intermedios: los siete puntos de guardado (0 a 27563) permiten analizar la evolución de la política y el sobreajuste a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~450 M parámetros en FP32, el peso ronda los 1,8 GB; en BF16/FP16, ~0,9 GB. A ello hay que sumar el codificador visual y el estado de activaciones para tres cámaras, por lo que un presupuesto realista de 4-8 GB de VRAM es prudente, aunque no se documenta oficialmente.
- GPU recomendadas: el entrenamiento se realizó en H20 según la model card; para inferencia, cualquier GPU con al menos 8 GB (RTX 3060/4060, RTX 4090, A10, L4) debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB o superiores; no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 y Transformers 5.5.4 son el stack declarado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (orientados a LLM, no a políticas VLA).
- Latencia y throughput: no disponibles. El tamaño del repo (12,6 GB) incluye los siete checkpoints, no un único peso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA RoboTwin20 AdamW (este) | ~450 M totales, ~100 M entrenados | no disponible | VLA para RoboTwin20 | no disponible | Hugging Face, 0 descargas |
| SmolVLA base (Hugging Face) | ~450 M | no disponible | VLA generalista | según model card original | público |
| OpenVLA | ~7 B | no disponible | VLA generalista | según model card original | público |
| π0 (pi-zero) | no disponible | no disponible | VLA generalista | según model card original | público |

La comparación cuantitativa no es posible con la información disponible: no hay benchmarks publicados para este checkpoint ni métricas de éxito en las 20 tareas de RoboTwin20.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Modelo de investigación con cero descargas y cero likes: no hay validación comunitaria ni reportes independientes de rendimiento.
- Entrenado exclusivamente sobre 20 tareas de RoboTwin20: la generalización fuera de ese repertorio y de ese simulador es incierta.
- Solo se ha ajustado el experto en acciones; el resto del modelo base conserva sus sesgos y limitaciones originales.
- Riesgo de sobreajuste al dataset de imitación y de fallo ante distribuciones visuales distintas (iluminación, cámaras, objetos no vistos).
- No se documentan sesgos demográficos, lingüísticos ni de otro tipo; al ser un modelo de control robótico, el riesgo principal es de seguridad física en despliegues reales.
- El repositorio contiene siete checkpoints (12,6 GB); es necesario seleccionar explícitamente el paso deseado y no cargar el repo completo de forma ingenua.
- Las versiones de software son muy específicas (PyTorch 2.8.0+cu128, Transformers 5.5.4, LeRobot 0.6.1); discrepancias pueden romper la carga del modelo.
- No hay información sobre el idioma de las instrucciones de texto ni sobre el vocabulario del codificador de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/xzz789/smolvla-robotwin20-adamw-b1024
- Dataset de entrenamiento: `hxma/RoboTwin-LeRobot-v3.0` (referenciado en la model card; no se proporciona URL directa)
- LeRobot (librería): no disponible en la información proporcionada
- SmolVLA (modelo base): no disponible en la información proporcionada
- RoboTwin (benchmark): no disponible en la información proporcionada
