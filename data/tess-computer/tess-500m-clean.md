# TESS-Computer/tess-500m-clean

## Resumen

TESS-500M es un modelo de visión-lenguaje-acción (VLA) orientado al uso de ordenadores (computer use). Dado un pantallazo y una instrucción en lenguaje natural, predice una acción de ratón (coordenadas de clic normalizadas) o de teclado (texto a escribir, pulsaciones o atajos). Lo desarrolla TESS-Computer y se publica bajo licencia Apache 2.0, con un enfoque explícito de inspiración en los VLA robóticos trasladado al dominio de la interfaz gráfica.

Arquitectónicamente parte de SmolVLM2-500M-Instruct como columna vertebral (componente de visión más un modelo de lenguaje pequeño), y le añade un MLP compartido con un router que bifurca la salida hacia dos cabezas especializadas: una rama de ratón (regresión de coordenadas XY y clasificación del tipo de clic) y una rama de teclado que reutiliza la generación de texto del VLM. El total es de 508 millones de parámetros, de los cuales solo 48 millones son entrenables, lo que lo sitúa en el segmento de modelos ligeros y desplegables en hardware modesto.

Su relevancia es doble. Por un lado, ataca un problema concreto de la automatización de escritorio (traducir instrucciones a acciones ejecutables sobre la UI) con un modelo de medio giga de parámetros, frente a alternativas de 2B a 7B. Por otro, se entrena sobre un dataset propio de unos 312.000 ejemplos (tess-agentnet-clean) en 3 épocas sobre una única NVIDIA H100 80GB en aproximadamente 8 horas. El modelo se publica como checkpoint de PyTorch y no como pesos en formato estándar de transformers, lo que condiciona su integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM2 (vision-language) + MLP compartido + router con dos cabezas: raton (XY + clic) y teclado (generacion de texto del VLM) |
| Parametros totales | 508 millones |
| Parametros activos | no aplica (no es MoE); 48 millones entrenables |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de PyTorch (.pt) cargado con utilidades de inferencia locales; no se publican safetensors ni GGUF |
| Modelo base | SmolVLM2-500M-Instruct (los metadatos de HuggingFace referencian tambien SmolVLM2-500M-Video-Instruct) |
| Dataset de entrenamiento | TESS-Computer/tess-agentnet-clean (~312K muestras) |
| Tamano del repositorio | 3,6 GB |
| Modalidad de entrada | imagen (pantallazo) + texto (instruccion) |
| Modalidad de salida | accion estructurada (raton o teclado) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de tres etapas. Primero, el pantallazo y la instrucción se procesan con SmolVLM2, que produce una representación compartida. Esa representación pasa por un MLP común y después por un router que decide entre dos ramas: la rama de ratón, compuesta por cabezas de regresión para las coordenadas XY normalizadas (rango 0-1) y una cabeza de clasificación para el tipo de clic (LEFT_CLICK, RIGHT_CLICK, DOUBLE_CLICK, entre otros); y la rama de teclado, que delega en la generación de texto del propio VLM para producir acciones de tipo `type`, `press` o `hotkey` con valores como `hello world`, `<ENTER>` o `<SUPER+C>`. Es, por tanto, un híbrido entre regresión continua para el apuntado y decodificación autoregresiva para la entrada de texto.

El entrenamiento se realizó durante 3 épocas con tamaño de lote 48 y optimizador AdamW, con tasas de aprendizaje diferenciadas: 2e-4 para las cabezas y 5e-4 para los embeddings. Se ejecutó sobre una NVIDIA H100 de 80 GB durante aproximadamente 8 horas, y solo se actualizaron 48 millones de parámetros de los 508 millones totales, lo que indica un ajuste eficiente sobre la columna vertebral congelada o parcialmente congelada. No se documenta en la información disponible el uso de RLHF, DPO u otras técnicas de alineación, ni la composición detallada del dataset más allá de su tamaño y nombre (tess-agentnet-clean). Tampoco se detalla el número de tokens de entrenamiento ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Comprensión de pantallazos (screen understanding) orientada a elementos de interfaz: botones, campos de texto, menús y controles.
- Predicción de acciones de ratón con coordenadas normalizadas en el rango 0-1, listas para reescalar a la resolución real de la pantalla.
- Clasificación del tipo de clic: clic izquierdo, clic derecho, doble clic y otros tipos contemplados por la cabeza de clasificación.
- Predicción de acciones de teclado: escritura de texto libre, pulsación de teclas individuales y combinaciones de atajos (por ejemplo `<SUPER+C>`).
- Ejecución de instrucciones en lenguaje natural de una sola etapa (una instrucción, una acción), no se documenta razonamiento multi-paso explícito.
- Soporte de entrada multimodal imagen-texto mediante el pipeline `image-text-to-text` de HuggingFace.
- No se documenta soporte de tool calling ni function calling en el sentido de APIs externas, aunque la salida estructurada actúa como interfaz para un ejecutor de acciones.
- Capacidad monolingüe: las instrucciones se han de dar en inglés.

## Casos de uso

- Automatización de tareas repetitivas de escritorio: un orquestador captura la pantalla, envía la instrucción ("Click the search button") y ejecuta la acción devuelta; el modelo devuelve coordenadas normalizadas que se reescalan a la resolución del monitor.
- Agentes GUI para pruebas de regresión de interfaces: tras cada despliegue, el agente recorre flujos definidos en lenguaje natural y verifica que los elementos siguen siendo localizables, detectando cambios de layout que rompen la automatización.
- Rellenado de formularios web y de aplicaciones de escritorio: la rama de teclado permite escribir texto en campos y la de ratón enfocar el campo correcto, encadenando ambas salidas en un bucle percepción-acción.
- Asistencia a usuarios con movilidad reducida: traducción de instrucciones habladas o escritas a acciones de ratón y teclado, sirviendo como capa de control alternativa sobre el sistema operativo.
- Extracción de datos de aplicaciones legacy sin API: el agente navega por la interfaz, hace clic en los elementos necesarios y transcribe valores mediante la rama de teclado, evitando depender de integraciones propietarias.
- Prototipado rápido de demostraciones de agentes: al tener solo 508 millones de parámetros, cabe en una GPU de consumo y permite iterar sobre el bucle de control sin costes elevados de inferencia.
- Telemetría y monitorización de sesiones: dado que la salida es una acción estructurada y de tamaño fijo (más texto en el caso de teclado), es sencillo registrar y auditar cada decisión del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de exactitud de apuntado, tasa de acierto por tipo de acción, ni evaluaciones sobre suites habituales de agentes GUI. La búsqueda web realizada no arrojó resultados relacionados con este modelo: los resultados devueltos correspondían al satélite TESS de la NASA, a la ingeniería estructural T/E/S/S, a un proveedor noruego de mangueras, a una actriz y al buscador de marcas de la USPTO, por lo que no aportan datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 508 millones de parámetros, los pesos ocupan aproximadamente 1 GB en fp16 (unos 2 GB en fp32). Sumando el codificador visual, las activaciones y la imagen de entrada, el consumo práctico se sitúa en el entorno de 2 a 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; no se requiere una H100. La H100 de 80 GB que aparece en la model card corresponde al entrenamiento, no al despliegue.
- Cabe en GPU de consumo: sí. Tarjetas como RTX 3050, RTX 3060, RTX 4060, RTX 4090 o equivalentes pueden ejecutarlo con holgura; también es viable en CPU, con latencia mayor.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama. La model card indica cargar el checkpoint mediante utilidades locales (`test_checkpoint.py`, con `load_model` y `predict`), lo que implica un servidor de inferencia propio. La arquitectura con cabezas adicionales y router complica el uso directo de motores de servicio estándar.
- Latencia y throughput estimados: no disponibles. Al no publicarse benchmarks ni configuración de servicio, no se pueden dar cifras fiables; en una GPU de consumo cabría esperar latencias de decenas de milisegundos por acción, pero es una estimación, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TESS-500M | 508 M (48 M entrenables) | no disponible | sin benchmarks publicados | Apache 2.0 | checkpoint .pt en HuggingFace, sin safetensors ni GGUF |
| SmolVLM2-500M-Video-Instruct (modelo base) | ~500 M | no disponible | no disponible en esta informacion | Apache 2.0 | pesos estandar en HuggingFace |
| Agentes GUI basados en VLM de mayor tamano (UI-TARS, ShowUI, OS-Atlas) | 2 B - 7 B segun variante | no disponible | no disponible en esta informacion | licencias variables segun proyecto | pesos en HuggingFace en la mayoria de casos |

La comparación cuantitativa no es posible con los datos disponibles: no hay resultados de benchmarks de TESS-500M ni cifras verificadas de las alternativas en la información proporcionada. La diferencia estructural relevante es que TESS-500M opera con un orden de magnitud menos de parámetros que los agentes GUI habituales, a cambio de una salida restringida a una única acción por paso y de un formato de pesos menos estandarizado.

## Limitaciones y advertencias

- Entrenado principalmente con pantallazos de escritorio y web; puede fallar con layouts de interfaz poco habituales o no vistos durante el entrenamiento.
- Instrucciones únicamente en inglés; no hay soporte multilingüe declarado.
- Predice una acción por instrucción, sin planificación multi-paso documentada; la descomposición de tareas complejas debe hacerla un orquestador externo.
- Riesgo de alucinación de acciones: al ser un modelo generativo en la rama de teclado, puede producir texto o atajos no deseados; en un agente real conviene validar cada acción antes de ejecutarla.
- Las coordenadas XY son normalizadas (0-1) y dependen de un reescalado correcto a la resolución real; un error de reescalado provoca clics fuera de objetivo.
- Sesgos conocidos: no se documentan análisis de sesgos ni de equidad en la model card.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene revisar la licencia del modelo base (SmolVLM2, también Apache 2.0) y las condiciones del dataset tess-agentnet-clean antes de un despliegue en producción.
- Formato de pesos no estándar (.pt con utilidades propias): dificulta el uso con ecosistemas de servicio habituales y añade trabajo de integración y mantenimiento.
- Sin datos de benchmarks publicados, no hay evidencia cuantitativa de precisión que respalde una decisión de producción.
- Metadatos inconsistentes sobre el modelo base (la model card cita SmolVLM2-500M-Instruct y las etiquetas de HuggingFace citan SmolVLM2-500M-Video-Instruct), lo que puede generar dudas sobre el punto de partida exacto del ajuste.
- Repositorio de 3,6 GB para 508 millones de parámetros: sugiere pesos en fp32 o artefactos adicionales, pero no se detalla su composición.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TESS-Computer/tess-500m-clean
- Dataset de entrenamiento: https://huggingface.co/datasets/TESS-Computer/tess-agentnet-clean
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Instruct
- Modelo base alternativo referenciado en las etiquetas: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct

Nota: la búsqueda web no devolvió ningún enlace relevante sobre este modelo, su paper, su repositorio de código o demos. Los resultados obtenidos correspondían a entidades homónimas sin relación (la misión TESS de la NASA, la ingeniería estructural T/E/S/S, el proveedor noruego TESS, una actriz y el buscador de marcas de la USPTO).
